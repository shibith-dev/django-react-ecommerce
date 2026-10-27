import React from 'react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import AuthPageLayout from '../layouts/AuthPageLayout'
import { resendVerificationEmail, verifyEmail } from '../services/authService'

const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams()
    const token = searchParams.get("token")
    const [status, setStatus] = useState(token ? "verifying" : "waiting")
    const [message, setMessage] = useState("")
    const [email, setEmail] = useState("")
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        let active = true

        async function verify() {
            if (!token) return

            try {
                const data = await verifyEmail(token)

                if (active) {
                    setStatus("success")
                    setMessage(data.detail || "Your email has been verified. You can now sign in.")
                }
            } catch (error) {
                if (active) {
                    setStatus("failed")
                    setMessage(error.response?.data?.detail || "This verification link is invalid or has expired.")
                }
            }
        }

        verify()

        return () => {
            active = false
        }
    }, [token])

    async function handleResend(event) {
        event.preventDefault()
        setSubmitting(true)
        setMessage("")

        try {
            const data = await resendVerificationEmail(email.trim())
            setMessage(data.detail || "If an eligible account exists, a verification email will be sent.")
        } catch (error) {
            setMessage("We couldn't process that request. Please try again later.");
        } finally {
            setSubmitting(false);
        }
    }
    return (
        <AuthPageLayout
            eyebrow="EMAIL VERIFICATION"
            title={status === "verifying" ? "Verifying your email" : status === "success" ? "Email verified" : status === "failed" ? "Verification unsuccessful" : "Verify your email"}
            description={status === "verifying" ? "Please wait while we confirm your email address." : status === "success" ? message : status === "failed" ? message : "Use the link sent to your inbox to activate your account."}
        >
            {status === "verifying" && (
                <p role="status" className="text-center text-sm text-stone-500">Please wait...</p>
            )}

            {status === "success" && (
                <Link to="/login" className="block bg-[#25241f] px-5 py-3.5 text-center text-sm text-white hover:bg-stone-700">Continue to sign in</Link>
            )}

            {(status === "waiting" || status === "failed") && (
                <form onSubmit={handleResend} className="space-y-4">
                    {message && (
                        <p role="status" className="text-sm text-stone-600">{message}</p>
                    )}

                    <label className="block text-sm font-medium">Email address
                        <input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-stone-700" placeholder="you@example.com" />
                    </label>

                    <button type="submit" disabled={submitting} className="w-full border border-stone-300 px-5 py-3.5 text-sm hover:border-stone-700 disabled:opacity-60">
                        {submitting ? "Sending..." : "Resend verification email"}
                    </button>
                </form>
            )}

            <p className="mt-6 text-center text-sm text-stone-600">
                <Link to="/login" className="underline">Return to sign in</Link>
            </p>

        </AuthPageLayout >
    )
}

export default VerifyEmailPage