import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, LoaderCircle, Package } from "lucide-react"

import { getOrders } from "../services/OrderService"

function formatPrice(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(Number(value ?? 0));
}

function formatDate(value) {
    if (!value) return "—";

    return new Date(value).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}


const OrdersPage = () => {

    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const loadOrders = useCallback(async () => {
        setLoading(true)
        setError("")

        try {
            const data = await getOrders()
            setOrders(Array.isArray(data) ? data : data.results ?? [])
        } catch (error) {
            setError("We couldn't load your orders. Please try again.")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadOrders()
    }, [loadOrders])

    return (
        <section className="mx-auto max-w-5xl px-6 py-12 md:py-16">
            <p className="text-xs uppercase tracking-[0.25em] text-stone-500">Your Chrono account</p>
            <h1 className="mt-3 font-serif text-4xl text-stone-900">Your orders</h1>
            <p className="mt-3 text-sm text-stone-500">Review your purchases and track their status.</p>

            {loading ? (
                <div className="flex items-center justify-center gap-3 py-20 text-sm text-stone-500">
                    <LoaderCircle size={18} className="animate-spin" />
                    Loading your orders...
                </div>
            ) : error ? (
                <div className="mt-8 border border-red-200 bg-red-50 p-5">
                    <p role="alert" className="text-sm text-red-700">{error}</p>
                    <button type="button" onClick={loadOrders} className="mt-4 text-sm underline underline-offset-4">Try again</button>
                </div>
            ) : orders.length === 0 ? (
                <div className="mt-10 border border-stone-200 px-6 py-16 text-center">
                    <Package size={32} strokeWidth={1.4} className="mx-auto text-stone-400" />
                    <h2 className="mt-5 font-serif text-2xl text-stone-900">No orders yet</h2>
                    <p className="mt-3 text-sm text-stone-500">Your next favourite watch might be waiting for you.</p>
                    <Link to="/products" className="mt-7 inline-block bg-stone-900 px-6 py-3 text-sm text-white transition hover:bg-stone-700">Explore watches</Link>
                </div>
            ) : (
                <div className="mt-8 space-y-5">
                    {orders.map((order) => (
                        <article key={order.id} className="border border-stone-200 p-5 md:p-6">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs text-stone-500">Order number</p>
                                    <h2 className="mt-1 text-base font-medium text-stone-900">#{order.id}</h2>
                                    <p className="mt-2 text-xs text-stone-500">Placed {formatDate(order.created_at)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-stone-500">Status</p>
                                    <p className="mt-1 text-sm text-stone-900">{order.status}</p>
                                    <p className="mt-2 text-sm font-medium text-stone-900">{formatPrice(order.total)}</p>
                                </div>
                                <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-stone-200 pt-4">
                                    <p className="text-sm text-stone-500">{order.items?.length ?? 0}{" "}{(order.items?.length ?? 0) === 1 ? "product" : "products"}</p>
                                    <Link to={`/orders/${order.id}`} className="inline-flex items-center gap-2 text-sm text-stone-900 transition hover:text-stone-500">
                                        View order
                                        <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    )
}

export default OrdersPage