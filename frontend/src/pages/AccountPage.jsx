import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { updateProfile } from "../services/authService"

const AccountPage = () => {
    const { user, refreshProfile } = useAuth()
    const [form, setForm] = useState({
        first_name: "",
        last_name: ""
    })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    useEffect(() => {
        setForm({
            first_name: user?.first_name ?? "",
            last_name: user?.last_name ?? ""
        })
    }, [user])

    function handleChange(event) {
        const { name, value } = event.target

        setForm((current) => ({
            ...current,
            [name]: value
        }))
    }

    async function handleSubmit(event) {
        event.preventDefault()
        setError("")
        setLoading(true)
        setSuccess("")

        try {
            await updateProfile(from)
            await refreshProfile()
            setSuccess("Your profile has been updated")
        } catch (err) {
            const data = err.response?.data

            setError(data?.detail || data?.first_name || data?.last_name || "Unable to update your profile. Please try again")
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
            <p className="text-xs uppercase tracking-[0.25em] text-stone-500">Your account</p>
            <h1 className="mt-3 font-serif text-4xl text-stone-900">Account details</h1>
            <p className="mt-3 text-sm text-stone-600">Manage your personal information and security settings.</p>

            <form onSubmit={handleSubmit} className="mt-10 space-y-6 border-t border-stone-200 pt-8">
                <div>
                    <label htmlFor="email" className="mb-2 block text-sm text-stone-700">Email address</label>
                    <input id="email" type="email" value={user?.email ?? ""} readOnly className="w-full border border-stone-200 bg-stone-100 px-4 py-3 text-stone-500" />
                </div>
                <div>
                    <label htmlFor="first_name" className="mb-2 block text-sm text-stone-700" > First name </label>
                    <input id="first_name" name="first_name" value={form.first_name} onChange={handleChange} autoComplete="given-name" required className="w-full border border-stone-300 bg-transparent px-4 py-3 outline-none focus:border-stone-900" />
                </div>

                <div>
                    <label htmlFor="last_name" className="mb-2 block text-sm text-stone-700" >Last name</label>
                    <input id="last_name" name="last_name" value={form.last_name} onChange={handleChange} autoComplete="family-name" required className="w-full border border-stone-300 bg-transparent px-4 py-3 outline-none focus:border-stone-900" />
                </div>

                {error && (
                    <p role="alert" className="text-sm text-red-700">{error}</p>
                )}

                {success && (
                    <p role="status" className="text-sm text-green-700">{success}</p>
                )}

                <button type="submit" disabled={loading} className="bg-stone-900 px-6 py-3 text-sm text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-50">
                    {loading ? "Saving..." : "Save changes"}
                </button>
            </form>

            <div className="mt-12 border-t border-stone-200 pt-8">
                <h2 className="font-serif text-2xl text-stone-900">Security</h2>
                <p className="mt-2 text-sm text-stone-600">Keep your account secure by updating your password when needed.</p>
                <Link to="/change-password" className="mt-5 inline-block text-sm underline underline-offset-4 hover:text-stone-500">Change password</Link>
            </div>

            <div className="mt-10 border-t border-stone-200 pt-8">
                <h2 className="font-serif text-2xl text-stone-900">Orders</h2>
                <p className="mt-2 text-sm text-stone-600"> View your previous purchases and order status. </p>
                <Link to="/orders" className="mt-5 inline-block text-sm underline underline-offset-4 hover:text-stone-500" > View orders </Link>
            </div>
        </section>
    )
}

export default AccountPage