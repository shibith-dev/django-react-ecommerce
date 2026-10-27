import { useState } from "react"
import { Link } from "react-router-dom"
import { requestPasswordReset } from "../services/authService"
import AuthPageLayout from "../layouts/AuthPageLayout"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [submitted, setSubmitted] = useState(false)

    async function handleSubmit(event) {
        event.preventDefault()
        setError("")
        setLoading(true)

        try {
            await requestPasswordReset(email.trim())
            setSubmitted(true)
        } catch {
            setError("We couldn't process your request right now. Please try again later.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthPageLayout eyebrow="Account recovery" title="Forgot your password?" description="Enter the email address associated with your account. If an eligible account exists, we'll send a reset link.">
            {submitted ? (
                <div className="space-y-5">
                    <p role="status" className="text-sm leading-6 text-stone-600"> If an eligible account exists for that email address, a password reset link will arrive shortly. </p>
                    <Link to="/login" className="inline-block text-sm underline underline-offset-4" >
                        Return to sign in
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="email" className="mb-2 block text-sm text-stone-700" > Email address </label>
                        <input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required className="w-full border border-stone-300 bg-transparent px-4 py-3 outline-none focus:border-stone-900" />
                    </div>

                    {error && (
                        <p role="alert" className="text-sm text-red-700"> {error} </p>
                    )}

                    <button type="submit" disabled={loading} className="w-full bg-stone-900 px-6 py-3 text-sm text-white transition hover:bg-stone-700 disabled:opacity-50" >
                        {loading ? "Sending..." : "Send reset link"}
                    </button>

                    <Link to="/login" className="block text-center text-sm text-stone-600 underline underline-offset-4" >
                        Back to sign in
                    </Link>
                </form>
            )}
        </AuthPageLayout>
    )
}
