
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../services/authService";
import AuthPageLayout from "../layouts/AuthPageLayout";

function PasswordRestPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const uid = searchParams.get("uid") || "";
    const token = searchParams.get("token") || "";

    const [form, setForm] = useState({
        new_password: "",
        confirm_password: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [invalidLink, setInvalidLink] = useState(false);

    function handleChange(event) {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setInvalidLink(false);

        if (!uid || !token) {
            setInvalidLink(true);
            setError("This password reset link is incomplete.");
            return;
        }

        if (form.new_password !== form.confirm_password) {
            setError("The passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            await resetPassword({
                uid,
                token,
                new_password: form.new_password,
                confirm_new_password: form.confirm_password
            });

            navigate("/login", { replace: true, state: {message: "Your password has been reset. Please sign in."}});
        } catch (err) {
            const data = err.response?.data;

            setInvalidLink(err.response?.status === 400 || err.response?.status === 404);

            setError(data?.new_password || data?.detail || "The reset link may be invalid or expired. Request a new one and try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthPageLayout eyebrow="Account recovery" title="Reset your password" description="Choose a new password for your Chrono account.">
            {invalidLink && (
                <p className="mb-5 text-sm text-stone-600">
                    You may need to request a new reset link.
                    {" "}
                    <Link
                        to="/forgot-password"
                        className="underline underline-offset-4"
                    >
                        Request another link
                    </Link>
                </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="new_password" className="mb-2 block text-sm text-stone-700">New password</label>
                    <input id="new_password" name="new_password" type="password" autoComplete="new-password" value={form.new_password} onChange={handleChange} required className="w-full border border-stone-300 bg-transparent px-4 py-3 outline-none focus:border-stone-900" />
                </div>

                <div>
                    <label htmlFor="confirm_password" className="mb-2 block text-sm text-stone-700" >Confirm new password</label>
                    <input id="confirm_password" name="confirm_password" type="password" autoComplete="new-password" value={form.confirm_password} onChange={handleChange} required className="w-full border border-stone-300 bg-transparent px-4 py-3 outline-none focus:border-stone-900"/>
                </div>

                {error && (
                    <p role="alert" className="text-sm text-red-700">{error}</p>
                )}

                <button type="submit" disabled={loading} className="w-full bg-stone-900 px-6 py-3 text-sm text-white transition hover:bg-stone-700 disabled:opacity-50">
                    {loading ? "Resetting..." : "Reset password"}
                </button>
            </form>
        </AuthPageLayout>
    );
}

export default PasswordRestPage