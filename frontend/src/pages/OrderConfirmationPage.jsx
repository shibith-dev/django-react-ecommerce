import { useEffect, useState } from "react"
import { Link, useLocation, useParams } from "react-router-dom"
import { CheckCircle2, LoaderCircle } from "lucide-react"
import { getOrderById } from "../services/OrderService"

function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0))
}

export default function OrderConfirmationPage() {
  const { orderId } = useParams()
  const location = useLocation()
  const [order, setOrder] = useState(location.state?.order ?? null)
  const [loading, setLoading] = useState(!location.state?.order)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    async function loadOrder() {
      try {
        const data = await getOrderById(orderId)
        if (active) setOrder(data)
      } catch {
        if (active) {
          setError("We couldn't load this order. Please try again.")
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    loadOrder()
    return () => {
      active = false
    }
  }, [orderId])

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 px-6 py-24 text-sm text-stone-500">
        <LoaderCircle size={18} className="animate-spin" /> Loading order details...
      </div>
    )
  }

  if (error || !order) {
    return (
      <section className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="font-serif text-3xl text-stone-900">Order details unavailable</h1>
        <p className="mt-3 text-sm text-stone-500">{error || "We couldn't find this order."}</p>
        <Link to="/account" className="mt-6 inline-block text-sm underline underline-offset-4">Return to your account</Link>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <div className="text-center">
        <CheckCircle2 size={44} strokeWidth={1.4} className="mx-auto text-stone-800" />
        <p className="mt-6 text-xs uppercase tracking-[0.25em] text-stone-500">Thank you for choosing Chrono</p>
        <h1 className="mt-3 font-serif text-4xl text-stone-900">Your order is placed</h1>
        <p className="mt-4 text-sm leading-6 text-stone-500">Your order has been received. Keep your order number for reference.</p>
      </div>

      <div className="mt-10 border border-stone-200 p-6 md:p-8">
        <div className="flex flex-wrap justify-between gap-4 border-b border-stone-200 pb-5">
          <div>
            <p className="text-xs text-stone-500">Order number</p>
            <p className="mt-1 font-medium text-stone-900">#{order.id}</p>
          </div>
          <div>
            <p className="text-xs text-stone-500">Status</p>
            <p className="mt-1 capitalize text-stone-900">{order.status?.toLowerCase().replaceAll("_", " ")}</p>
          </div>
          <div>
            <p className="text-xs text-stone-500">Order date</p>
            <p className="mt-1 text-sm text-stone-900">{order.created_at ? new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}</p>
          </div>
        </div>

        <h2 className="mt-6 font-serif text-xl text-stone-900">Items ordered</h2>
        <div className="mt-4 divide-y divide-stone-200">
          {order.items?.map((item) => (
            <div key={item.id} className="flex justify-between gap-4 py-4">
              <div>
                <p className="text-sm text-stone-900">{item.product_name}</p>
                <p className="mt-1 text-xs text-stone-500">{formatPrice(item.unit_price)} × {item.quantity}</p>
              </div>
              <p className="shrink-0 text-sm text-stone-900">{formatPrice(item.subtotal)}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-3 border-t border-stone-200 pt-5 text-sm">
          <div className="flex justify-between gap-4 text-stone-600">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between gap-4 text-stone-600">
            <span>Shipping</span>
            <span>{formatPrice(order.shipping_cost)}</span>
          </div>
          <div className="flex justify-between gap-4 border-t border-stone-200 pt-4 font-medium text-stone-900">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        <div className="mt-8 border-t border-stone-200 pt-6">
          <h2 className="font-serif text-xl text-stone-900">Delivery details</h2>
          <p className="mt-3 text-sm text-stone-800">{order.shipping_name}</p>
          <p className="mt-1 text-sm text-stone-500">{order.shipping_email}</p>
          <p className="mt-1 text-sm text-stone-500">{order.shipping_phone}</p>
          <p className="mt-1 whitespace-pre-line text-sm text-stone-500">{order.shipping_address}</p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link to="/products" className="bg-stone-900 px-6 py-3 text-sm text-white transition hover:bg-stone-700">Continue shopping</Link>
        <Link to="/account" className="border border-stone-300 px-6 py-3 text-sm text-stone-800 transition hover:border-stone-900">My account</Link>
      </div>
    </section>
  )
}
