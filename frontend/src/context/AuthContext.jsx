import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { getCurrentUser, loginUser, logoutUser } from "../services/authService";
import { requestNewAccessToken } from "../services/refreshClient";
import { clearAccessToken, setAccessToken } from "../services/authSession";

const AuthContext = createContext(null)

// ------------------------ SESSION RESTORE LOGIC (Outside Component Tree) ----------------------------

/* 
    keep this promise outside the React component to act as a singleton lock.
    Because React 18's StrictMode in development mounts, unmounts, and remounts 
    components twice. Without this lock, refreshing the page would fire TWO 
    session restore requests simultaneously. This ensures only one request fires.
*/

let sessionRestorePromise = null

function restoreSession() {
    if (!sessionRestorePromise) {
        sessionRestorePromise = (async () => {
            // 1. Relay on the browser's HttpOnly refresh cookie to get a new access token
            const data = await requestNewAccessToken()

            if (!data.access) {
                throw new Error("No access token returned.")
            }

            // 2. Save the new short lived access token in memory.
            setAccessToken(data.access)

            try {
                // 3. Now that we have a valid token, fetch the user's profile details
                const currentUser = await getCurrentUser()
                return currentUser
            } catch (error) {
                // If fetching the user fails wipe the token :
                clearAccessToken()
                throw error
            }
        })().finally(() => {
            // Release the lock so this function can be called again in the future if needed
            sessionRestorePromise = null
        })
    }

    return sessionRestorePromise
}

// ---------------------------- AUTHENTICATION PROVIDER COMPONENT ------------------------------------

export function AuthProvider({ children }) {
    // Global state holding the user's profile data (null means unauthenticated)
    const [user, setUser] = useState(null)

    // Global state indicating if we are currently checking the user's auth status on app load
    const [authloading, setAuthLoading] = useState(true)

    // ------------------------------- Effect 1: INITIAL APP LOAD AND REFRESH LOGIC---------------------
    useEffect(() => {
        // active flag prevents updating state if the component unmounts before the promise resolves
        let active = true

        restoreSession().then((currentUser) => {
            if (active) {
                setUser(currentUser) //User is logged in
            }
        }).catch(() => {
            // Silent catch: user is just not logged in or session expired.
            clearAccessToken()
            if (active) {
                setUser(null)
            }
        }).finally(() => {
            if (active) {
                // Stop the loading spinner regardless of success or failure
                setAuthLoading(false)
            }
        })

        // Cleanup function: If the component unmounts, set active to false
        return () => {
            active = false
        }
    }, [])

    // ------------------------Effect 2: BRIDGE BETWEEN AXIOS AND REACT------------------------
    /*
        Listen for the custom event dispatched by our Axios interceptor.
        If the refresh token dies in the middle of a user session (e.g., they left 
        the tab open for 7 days), Axios throws this event. React catches it and logs them out.
    */
    useEffect(() => {
        function handleSessionExpired() {
            clearAccessToken()
            setUser(null) //Instantly kicks them to login screen
        }

        window.addEventListener("chrono:session-expired", handleSessionExpired)

        return () => {
            window.removeEventListener("chrono:session-expired", handleSessionExpired)
        }
    }, [])

    // ------------------------- AUTH ACTIONS -------------------------------

    // Login
    const login = useCallback(async (credentials) => {
        const data = await loginUser(credentials) // Sends username/password

        if (!data.access) {
            throw new Error("Login response did not contain an access token.")
        }

        setAccessToken(data.access)

        try {
            // Immediately fetch user details to populate the UI (avatar, name, etc.)
            const currentUser = await getCurrentUser()
            setUser(currentUser)
            return currentUser
        } catch (error) {
            clearAccessToken()
            setUser(null)
            throw error
        }
    }, [])

    // Logout
    const logout = useCallback(async () => {
        try {
            // tells the backend to blacklist the refresh token
            await logoutUser()
        } finally {
            // 'finally' ensures that even if the backend is down/unreachable, we STILL log the user out locally so they aren't stuck.
            clearAccessToken()
            setUser(null)
        }
    }, [])


    // Refresh Profile
    /* 
        Useful if the user updates their settings (e.g., changes their name/avatar)
        and we need to sync the global React state with the database. 
    */
    const refreshProfile = useCallback(async () => {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        return currentUser;
    }, []);

    // Memoize the context value to prevent unnecessary re-renders of consuming components
    const value = useMemo(() => ({user, authloading, isAuthenticated: Boolean(user), login, logout, refreshProfile}), [user, authloading, login, logout, refreshProfile])

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )

}

// -------------------------- CUSTOM HOOK -----------------------------------------------
// A syntactic sugar hook so components can just do: `const { user, login } = useAuth()`

export function useAuth() {
    const context = useContext(AuthContext)

    // safety net: Ensures developers don't try to use this hook outside of the AuthProvider wrapper
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider.")
    }

    return context
}




