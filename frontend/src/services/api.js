import axios from 'axios'
import { getAccessToken, setAccessToken, clearAccessToken } from './authSession'
import { requestNewAccessToken } from './refreshClient'

// ---------------------- AXIOS INSTANCE SETUP ----------------------------

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Abort requests that take longer than 10 seconds
  withCredentials: true, // Allows browser to send and recieve cookies across origins
  // Configure axios to automatically read Django's CSRF cookie and attach it to the X-CSRFToken header to prevent CSRF.
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
  withXSRFToken: true
})


// -------------------------- REQUEST INTERCEPTOR -------------------------------
// Dynamically attach access token to the headers of every request.

api.interceptors.request.use((config) => {
  const token = getAccessToken()

  if (token) {
    // if we have a token, include it onto the Authorization header
    config.headers.Authorization = `Bearer ${token}`
  } else {
    // If no token exists, ensure we don't send a stale/undefined header
    delete config.headers.Authorization
  }

  return config
})


// ---------------------- RESPONSE INTERCEPTOR (incoming traffic and Token Refresh) -------------------------------

// We use this vairable to hold the refresh API call. (If multiple request fail with 401 at the same exact time, we only want to hit the refresh endpoint once. The rest will wait for this promise to resolve )
let refreshPromise = null

// if the response is sucessfull, just pass it through. If the response throws error, intercept it here
api.interceptors.response.use((response) => response, async (error) => { 
  const originalRequest = error.config
  
  // 1. Verify this is an Expired Token (401) error, Reject other errors (404, 500, etc.) immediately
  if (!originalRequest || error.response?.statu !== 401) {
    return Promise.reject(error)
  }

  const requestUrl = originalRequest.url || ""

  // 2. Prevent refresh loops on auth-specific endpoints. If logging in or refreshing fails with 401, we don't want to trigger another refresh. That creates infinite loop.
  const excludedUrls = ["/auth/login/", "/auth/refresh/", "/auth/logout/", "/auth/csrf/"]

  // if we already retried with this sepcific request, Or if it's an excluded URL, abort:
  if (originalRequest._retry || excludedUrls.some((url) => requestUrl.includes(url))) {
    return Promise.reject(error)
  }

  // Mark this request as retried so we don't get stuck in a loop 
  originalRequest._retry = true

  
  try {
    // 3. The concurrency Lock : if the refreshPromise is null, this is the first request to fail. We initiate the refresh process.
    if (!refreshPromise) {
      refreshPromise = requestNewAccessToken().then((data) => {
        if (!data.access) {
          throw new Error("No access token returned.")
        }
        // Save the new token to memory.
        setAccessToken(data.access)
        return data.access
      }).finally(() => {
        // Once the refresh finishes (success/fail), reset the lock so future 401s can trigger a new refresh if needed.
        refreshPromise = null
      })
    }

    // 4. Wait for new token. If this is the 1st request, it waits for the API call it just started.
    // if this is the second/third concurrent request, it waits for the 1st request's promise to finish
    const newAccessToken = await refreshPromise

    // 5. Retry the original failed request, And update the headers with the fresh token we just recieved
    originalRequest.headers = originalRequest.headers || {}
    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

    return api(originalRequest)
  } catch (error) {
    // 6. Total failure (Refresh token is also expired/invalid) -- Wipe the invalid access token
    clearAccessToken()

    // dispatch a global event so the react knows to redirect the user to the login screen and show a "Session expired" message.
    window.dispatchEvent(new Event("chrono:session-expired"))

    return Promise.reject(error)
  }
})

export default api