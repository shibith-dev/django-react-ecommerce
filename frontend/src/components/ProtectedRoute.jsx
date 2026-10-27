import React from 'react'
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
    const { isAuthenticated, authLoading } = useAuth()
    const location = useLocation()
    if (authLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <p className="text-sm text-neutral-500">
                    Restoring your session...
                </p>
            </div>
        )
    }

    if (!isAuthenticated){
        return (
            <Navigate to="/login" replace state={{from: `${location.pathname}${location.search}`}} />
        )
    }
    return <Outlet />
}

export default ProtectedRoute