import React from 'react'
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthPageLayout from '../layouts/AuthPageLayout';

import { useAuth } from '../context/AuthContext'

const inputClass = "mt-2 w-full border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-stone-700";


const LoginPage = () => {

    const { login } = useAuth()

    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const infoMessage = location.state?.message

    async function handleSubmit(event) {
        event.preventDefault()
        setSubmitting(true)
        setError("")

        try {
            await login({ email, password })
            const destination = location.state?.from || "/"
            navigate(destination, { replace: true })
        } catch (error) {
            setError(error.response?.data?.detail || "Unable to sign in. Please check your credentials and try again.")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <AuthPageLayout title="Welcome back" description="Sign in to access your account and orders.">
            {infoMessage && (
                <p role="status" className="text-sm text-green-700">{infoMessage}</p>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <p
                        role="alert"
                        className="border border-red-200 bg-red-50 p-3 text-sm text-red-800"
                    >
                        {error}
                    </p>
                )}

                <label className="block text-sm font-medium">Email address
                    <input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} placeholder="you@example.com" />
                </label>

                <label className="block text-sm font-medium">Password
                    <input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className={inputClass} placeholder="Enter your password" />
                </label>
                <div className="flex justify-end">
                    <Link to="/forgot-password" className="text-sm text-stone-600 underline hover:text-black">
                        Forgot password?
                    </Link>
                </div>

                <button type="submit" disabled={submitting} className="w-full bg-[#25241f] px-5 py-3.5 text-sm text-white hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60">
                    {submitting ? "Signing in..." : "Sign in"}
                </button>

                <p className="text-center text-sm text-stone-600">
                    Don't have an account?{" "}
                    <Link to="/register" className="font-medium text-black underline">Create one</Link>
                </p>
            </form>
        </AuthPageLayout>
    )
}

export default LoginPage