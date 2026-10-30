import React from 'react'
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { LoaderCircle } from 'lucide-react';

const ProtectedRoute = () => {
    const { isAuthenticated, authloading } = useAuth()
    const location = useLocation()
    if (authloading) {
        return (
            <div
                className="flex min-h-[60vh] flex-col items-center justify-center gap-4" role="status" aria-live="polite">
                <LoaderCircle size={26} strokeWidth={1.5} className="animate-spin text-stone-700" />
                <p className="text-sm text-stone-500">Restoring your session...</p>
            </div>
        )
    }

    if (!isAuthenticated) {
        return (
            <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />
        )
    }
    return <Outlet />
}

export default ProtectedRoute