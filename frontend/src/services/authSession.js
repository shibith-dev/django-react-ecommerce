// This file stores only the access token in JavaScript memory. It does not store the refresh token. 
// When the page reloads, this token is lost. But we'll restore a new access token using the refresh cookie.

let accessToken = null

export function getAccessToken() {
    return accessToken
}

export function setAccessToken(token) {
    accessToken = token
}

export function clearAccessToken() {
    accessToken = null
}