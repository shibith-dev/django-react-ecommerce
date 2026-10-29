import { useState } from "react"
import { Link, replace, useNavigate } from "react-router-dom"
import { ArrowLeft, LoaderCircle, ShieldCheck } from "lucide-react"

import { useAuth } from "../context/AuthContext"
import { useCart } from "../context/CartContext"
import { createOrder } from "../services/OrderService"


const initialShippingDetails = {
    shipping_name: "",
    shipping_email: "",
    shipping_phone: "",
    shipping_address: ""
}


function formatPrice(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(Number(value ?? 0))
}


const CheckoutPage = () => {

    const { user } = useAuth()
    const { cart, cartLoading, loadCart } = useCart()
    const navigate = useNavigate()

    const [form, setForm] = useState(() => ({
        ...initialShippingDetails,
        shipping_name: `${user?.first_name} ${user?.last_name}`,
        shipping_email: user?.email ?? ""
    }))

    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState("")
    const [fieldErrors, setFieldErrors] = useState({})

    function handleChange(event) {
        const { name, value } = event.target

        setForm((current) => ({ ...current, [name]: value }))
        setFieldErrors((current) => ({ ...current, [name]: "" }))
        setError("")
    }

    async function handleSubmit(event) {
        event.preventDefault()

        if (submitting) return

        setSubmitting(true)
        setError("")
        setFieldErrors({})

        try {
            const order = await createOrder({
                shipping_name: form.shipping_name.trim(),
                shipping_email: form.shipping_email.trim(),
                shipping_phone: form.shipping_phone.trim(),
                shipping_address: form.shipping_address.trim(),
            })

            if (loadCart) {
                loadCart().catch(() => { })
            }

            navigate(`/checkout/success/${order.id}`, { state: { order }, replace: true })

        } catch (err) {
            const data = err.response?.data
            setError(data?.detail || "We couldn't place your order. Please review your details and try again.")
        } finally {
            setSubmitting(false)
        }
    }

    if (cartLoading) {
        return (
            <div className="mx-auto max-w-6xl px-6 py-24 text-center text-stone-500">
                Loading your checkout...
            </div>
        )
    }

    if (!cart?.items?.length) {
        return (
            <section className="mx-auto max-w-3xl px-6 py-24 text-center">
                <h1 className="font-serif text-3xl text-stone-900">Your cart is empty</h1>
                <p className="mt-3 text-sm text-stone-500">Add a watch to your cart before proceeding to checkout.</p>
                <Link to="/products" className="mt-8 inline-flex items-center gap-2 bg-stone-900 px-6 py-3 text-sm text-white transition hover:bg-stone-700">Explore watches</Link>
            </section>
        )
    }

    const subtotal = Number(cart.subtotal ?? 0)

    return (
        <section className="mx-auto max-w-6xl px-6 py-12 md:py-16">
            <Link to="/cart" className="inline-flex items-center gap-2 text-sm text-stone-500 transition hover:text-stone-900" >
                <ArrowLeft size={16} />
                Back to cart
            </Link>

            <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_360px]">
                <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-stone-500"> Almost yours </p>
                    <h1 className="mt-3 font-serif text-4xl text-stone-900"> Checkout </h1>
                    <p className="mt-3 text-sm leading-6 text-stone-500">Enter the details for delivery. Your order total will be confirmed by the server when your order is placed.</p>

                    {error && (
                        <div role="alert" className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" > {error} </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                        <div>
                            <label htmlFor="shipping_name" className="mb-2 block text-sm text-stone-700" > Full name </label>
                            <input id="shipping_name" name="shipping_name" autoComplete="name" required maxLength={150} value={form.shipping_name} onChange={handleChange} className="w-full border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-stone-900" />
                            {fieldErrors.shipping_name && (
                                <p className="mt-1 text-sm text-red-600"> {fieldErrors.shipping_name} </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="shipping_email" className="mb-2 block text-sm text-stone-700" > Email address </label>
                            <input id="shipping_email" name="shipping_email" type="email" autoComplete="email" required value={form.shipping_email} onChange={handleChange} className="w-full border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-stone-900" />
                            {fieldErrors.shipping_email && (
                                <p className="mt-1 text-sm text-red-600"> {fieldErrors.shipping_email} </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="shipping_phone" className="mb-2 block text-sm text-stone-700" > Phone number </label>
                            <input id="shipping_phone" name="shipping_phone" type="tel" autoComplete="tel" required maxLength={30} value={form.shipping_phone} onChange={handleChange} className="w-full border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-stone-900" />
                            {fieldErrors.shipping_phone && (
                                <p className="mt-1 text-sm text-red-600"> {fieldErrors.shipping_phone} </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="shipping_address" className="mb-2 block text-sm text-stone-700" > Delivery address </label>
                            <textarea id="shipping_address" name="shipping_address" autoComplete="street-address" required rows={4} value={form.shipping_address} onChange={handleChange} className="w-full resize-y border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-stone-900" />
                            {fieldErrors.shipping_address && (
                                <p className="mt-1 text-sm text-red-600"> {fieldErrors.shipping_address} </p>
                            )}
                        </div>

                        <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 bg-stone-900 px-6 py-4 text-sm text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60" >
                            {submitting ? (
                                <>
                                    <LoaderCircle size={17} className="animate-spin" />
                                    Placing order...
                                </>
                            ) : (
                                "Place order"
                            )}
                        </button>

                        <p className="flex items-center justify-center gap-2 text-xs text-stone-500">
                            <ShieldCheck size={15} />
                            Your order is validated and priced securely on the server.
                        </p>
                    </form>
                </div>

                <aside className="h-fit border border-stone-200 p-6">
                    <h2 className="font-serif text-2xl text-stone-900">Order summary</h2>

                    <div className="mt-6 divide-y divide-stone-200">
                        {cart.items.map((item) => (
                            <div key={item.id} className="flex gap-4 py-4">
                                <div className="h-20 w-16 shrink-0 bg-stone-100">
                                    {item.product.primary_image?.image && (
                                        <img src={item.product.primary_image.image} alt={item.product.primary_image.alt_text || item.product.name} className="h-full w-full object-cover" />
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-xs text-stone-500">{item.product.brand?.name}</p>
                                    <p className="mt-1 text-sm text-stone-900">{item.product.name}</p>
                                    <p className="mt-1 text-xs text-stone-500">Qty: {item.quantity}</p>
                                    <p className="mt-2 text-sm text-stone-900">{formatPrice(item.total_price)}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-5 space-y-3 border-t border-stone-200 pt-5 text-sm">
                        <div className="flex justify-between gap-4 text-stone-600">
                            <span>Subtotal</span>
                            <span>{formatPrice(subtotal)}</span>
                        </div>
                        <div className="flex justify-between gap-4 text-stone-600">
                            <span>Shipping</span>
                            <span>Confirmed by server</span>
                        </div>
                        <div className="flex justify-between gap-4 border-t border-stone-200 pt-4 font-medium text-stone-900">
                            <span>Order total</span>
                            <span>{formatPrice(subtotal)}+</span>
                        </div>
                    </div>

                    <p className="mt-4 text-xs leading-5 text-stone-500">The final shipping cost and total are returned by the backend when the order is created.</p>
                </aside>
            </div>
        </section>
    )
}

export default CheckoutPage