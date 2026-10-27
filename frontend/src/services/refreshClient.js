
/* 
    api.js imports refreshAccessToken from authService.js, which itself imports api.js. 
    That is a circular module dependency, to avoid that we create a seperate axios instance
    dedicated to refresh requests.
*/

import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const refreshClient = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10000,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
  withXSRFToken: true,
});

export async function requestNewAccessToken() {
  // Ensure a CSRF cookie exists before the refresh POST.
  await refreshClient.get("/auth/csrf/");

  const response = await refreshClient.post("/auth/refresh/");
  return response.data;
}