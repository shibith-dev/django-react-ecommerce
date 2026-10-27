import api from "./api"

// Ask Django to set the CSRF cookie before protected cookie-based authentication operations.
export async function getCsrfCookie() {
    const res = await api.get("/auth/csrf/")
    return res.data
}

export async function registerUser(data) {
    const res = await api.post("/auth/register/", data)
    return res.data
}

export async function loginUser(data) {
    await getCsrfCookie()
    const res = await api.post("/auth/login/", data)
    return res.data
}

export async function refreshAccessToken(params) {
    await getCsrfCookie()
    const res = await api.post("/auth/refresh/")
    return res.data
}

export async function logoutUser() {
    await getCsrfCookie()
    const res = await api.post("/auth/logout/")
    return res.data
}

export async function getCurrentUser() {
  const res = await api.get("/auth/me/");
  return res.data;
}

export async function verifyEmail(token) {
  const res = await api.post("/auth/verify-email/", { token });
  return res.data;
}

export async function resendVerificationEmail(email) {
  const res = await api.post("/auth/resend-verification/", { email });
  return res.data;
}

export async function updateProfile(data) {
  const res = await api.patch("/auth/me/", data);
  return res.data;
}

export async function changePassword(data) {
  const res = await api.post("/auth/change-password/", data);
  return res.data;
}

export async function requestPasswordReset(email) {
  const res = await api.post("/auth/forgot-password/", { email });
  return res.data;
}

export async function resetPassword(data) {
  const res = await api.post("/auth/reset-password/", data);
  return res.data;
}