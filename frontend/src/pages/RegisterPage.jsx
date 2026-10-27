import React from 'react'
import { useState } from 'react'
import { data, Link } from "react-router-dom"

import AuthPageLayout from '../layouts/AuthPageLayout'
import { registerUser } from "../services/authService"

const inputClass = "mt-2 w-full border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-stone-700"

const RegisterPage = () => {
    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        confirm_password: ""
    })
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    function updateField(event) {
        setForm((current) => ({
            ...current,
            [event.target.name]: event.target.value
        }))
    }

    async function handleSubmit(event) {
        event.preventDefault()
        setError("")
        setSuccess(false)

        if (form.password !== form.confirm_password) {
            setError("The password do not match.")
            return
        }

        setSubmitting(true)

        try {
            console.log(form)
            await registerUser(form)
            setSuccess(true)
        } catch (error) {
            const data = error.response?.data
            setError(data?.email || data?.password || data?.detail || "Registration failed. Please try again.")
        } finally {
            setSubmitting(false)
        }
    }

    if (success) {
        return (
            <AuthPageLayout eyebrow="ONE MORE STEP" title="check your email" description={`If registration succeeded, a verification email should be sent to ${form.email}. Verify your email before signing in.`}>
                <div className='space-y-4 text-center'>
                    <p className='text-sm leading-6 text-stone-600'>
                        Follow the verification link in your inbox. If it
                        doesn't arrive, you can request another verification
                        email from the verification page.
                    </p>
                    <Link to="/verify-email" className='block w-full bg-[#25241f] px-5 py-3.5 text-sm text-white hover:bg-stone-700'>verify email</Link>
                </div>
            </AuthPageLayout>
        )
    }

    return (
        <AuthPageLayout title="Create your account" description="Join Chrono to manage your cart and orders.">
            <form onSubmit={handleSubmit} className='space-y-4'>
                {error && (
                    <p role='alert' className='border border-red-200 bg-red-50 p-3 text-sm text-red-800'>{error}</p>
                )}
                <div className='grid grid-cols-2 gap-3'>
                    <label className='block text-sm font-medium'>
                        First name
                        <input type="text" name='first_name' autoComplete='given-name' maxLength={150} required value={form.first_name} onChange={updateField} className={inputClass} />
                    </label>
                    <label className='block text-sm font-medium'>
                        Last name
                        <input type="text" name='last_name' autoComplete='family-name' maxLength={150} required value={form.last_name} onChange={updateField} className={inputClass} />
                    </label>
                </div>

                <label className='block text-sm font-medium'>
                    Email address
                    <input type="email" name='email' autoComplete='email' required value={form.email} onChange={updateField} className={inputClass} placeholder='you@example.com' />
                </label>

                <label className='block text-sm font-medium'>
                    Password
                    <input type="password" name='password' minLength={8} required value={form.password} onChange={updateField} className={inputClass} />
                </label>

                <label className='block text-sm font-medium'>
                    Confirm password
                    <input type="password" name='confirm_password' minLength={8} required value={form.confirm_password} onChange={updateField} className={inputClass} />
                </label>

                <p className="text-xs leading-5 text-stone-500">
                    Your password must also satisfy the password rules
                    enforced by the server.
                </p>

                <button type='submit' disabled={submitting} className='w-full bg-[#25241f] px-5 py-3.5 text-sm text-white hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60'>
                    {submitting ? "Creating account..." : "Create account"}
                </button>

                <p className="text-center text-sm text-stone-600">
                    Already registered?{" "}
                    <Link to="/login" className="font-medium text-black underline">Sign in</Link>
                </p>
                
            </form>

        </AuthPageLayout>
    )
}

export default RegisterPage