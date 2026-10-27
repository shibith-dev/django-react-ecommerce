import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { changePassword } from "../services/authService";

const ChangePassword = () => {

    const { logout } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        old_password: "",
        new_password: "",
        confirm_new_password: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    function handleChange(event) {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault()
        setError("")
        setSuccess(false)

        if (form.new_password !== form.confirm_new_password) {
            setError("The new passwords do not match.")
            return
        }

        if (form.old_password === form.new_password) {
            setError("Your new password must be different from the current password.")
            return
        }

        setLoading(true)

        try {
            await changePassword({
                old_password: form.old_password,
                new_password: form.new_password,
                confirm_new_password: form.confirm_new_password
            })
            setSuccess(true)

            // The password has changed. End the current session and require a fresh login
            try {
                await logout()
            } catch (error) {

            }

            navigate("/login", { replace: true, state: { message: "Your password has changed. Please sign in again." } })
        } catch (err) {
            const data = err.response?.data
            setError(data?.old_password || data?.new_password || data?.password || data?.detail || "Unable to change your password. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="mx-auto max-w-xl px-5 py-16 sm:px-8">
            <p className="text-xs uppercase tracking-[0.25em] text-stone-500">Account security</p>
            <h1 className="mt-3 font-serif text-4xl text-stone-900">Change password</h1>
            <p className="mt-3 text-sm leading-6 text-stone-600">Confirm your current password before choosing a new one. You'll need to sign in again after the change.</p>

            <form onSubmit={handleSubmit} className="mt-10 space-y-6 border-t border-stone-200 pt-8">
                <div>
                    <label htmlFor="old_password" className="mb-2 block text-sm text-stone-700" > Current password </label>
                    <input id="old_password" name="old_password" type="password" autoComplete="current-password" value={form.old_password} onChange={handleChange} required className="w-full border border-stone-300 bg-transparent px-4 py-3 outline-none focus:border-stone-900" />
                </div>
                <div>
                    <label htmlFor="new_password" className="mb-2 block text-sm text-stone-700" > New password </label>
                    <input id="new_password" name="new_password" type="password" autoComplete="new-password" value={form.new_password} onChange={handleChange} required className="w-full border border-stone-300 bg-transparent px-4 py-3 outline-none focus:border-stone-900" />
                </div>
                <div>
                    <label htmlFor="confirm_new_password" className="mb-2 block text-sm text-stone-700" > Confirm new password </label>
                    <input id="confirm_new_password" name="confirm_new_password" type="password" autoComplete="confirm_new-password" value={form.confirm_new_password} onChange={handleChange} required className="w-full border border-stone-300 bg-transparent px-4 py-3 outline-none focus:border-stone-900" />
                </div>

                {error && (
                    <p role="alert" className="text-sm text-red-700">{error}</p>
                )}

                {success && (
                    <p role="status" className="text-sm text-green-700">Password changed successfully.</p>
                )}

                <button type="submit" disabled={loading} className="w-full bg-stone-900 px-6 py-3 text-sm text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-50">
                    {loading ? "Updating password..." : "Update password"}
                </button>
            </form>
        </section>
    )
}

export default ChangePassword