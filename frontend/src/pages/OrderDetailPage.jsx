
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, LoaderCircle } from "lucide-react";

import { cancelOrder, getOrderById } from "../services/OrderService";

function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

function formatDate(value) {
  if (!value) return "—";

  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function OrderDetailPage() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadOrder = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getOrderById(orderId);
      setOrder(data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError("This order could not be found.");
      } else {
        setError("We couldn't load this order. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  async function handleCancel() {
    const confirmed = window.confirm(
      `Cancel order #${orderId}? This action cannot be undone.`
    );

    if (!confirmed || cancelling) return;

    setCancelling(true);
    setError("");
    setNotice("");

    try {
      await cancelOrder(orderId);
      await loadOrder();
      setNotice("Your cancellation request was processed.");

    } catch (err) {
      setError(err.response?.data?.detail || "We couldn't cancel this order. Its status may have changed.");
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 px-6 py-24 text-sm text-stone-500">
        <LoaderCircle size={18} className="animate-spin" />
        Loading order details...
      </div>
    );
  }

  if (error && !order) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="font-serif text-3xl text-stone-900">Unable to open order</h1>
        <p role="alert" className="mt-3 text-sm text-stone-500">{error}</p>
        <Link to="/orders" className="mt-6 inline-flex items-center gap-2 text-sm underline underline-offset-4">
          <ArrowLeft size={16} />
          Back to orders
        </Link>
      </section>
    );
  }

  if (!order) return null;

  const canCancel = ["placed", "processing"].includes(order.status);

  return (
    <section className="mx-auto max-w-4xl px-6 py-12 md:py-16">
      <Link to="/orders" className="inline-flex items-center gap-2 text-sm text-stone-500 transition hover:text-stone-900">
        <ArrowLeft size={16} />
        Back to orders
      </Link>

      <div className="mt-8 flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-stone-500">Order details</p>
          <h1 className="mt-3 font-serif text-4xl text-stone-900">Order #{order.id}</h1>
          <p className="mt-3 text-sm text-stone-500">Placed {formatDate(order.created_at)}</p>
        </div>

        <div>
          <p className="text-xs text-stone-500">Current status</p>
          <p className="mt-1 text-base font-medium text-stone-900">{order.status}</p>
        </div>
      </div>

      {error && (
        <div role="alert" className="mt-6 border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {notice && (
        <div role="status" className="mt-6 border border-stone-200 p-4 text-sm text-stone-700">{notice}</div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="border border-stone-200 p-5 md:p-6">
          <h2 className="font-serif text-2xl text-stone-900">Items</h2>

          <div className="mt-4 divide-y divide-stone-200">
            {order.items?.map((item) => (
              <div key={item.id} className="flex justify-between gap-5 py-5">
                <div>
                  <p className="text-sm text-stone-900">{item.product_name}</p>
                  <p className="mt-2 text-xs text-stone-500">{formatPrice(item.unit_price)} × {item.quantity}</p>
                </div>
                <p className="shrink-0 text-sm text-stone-900">{formatPrice(item.subtotal)}</p>
              </div>
            ))}
          </div>

          <div className="mt-2 space-y-3 border-t border-stone-200 pt-5 text-sm">
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
        </div>

        <aside className="h-fit border border-stone-200 p-5 md:p-6">
          <h2 className="font-serif text-xl text-stone-900">Delivery details</h2>
          <p className="mt-4 text-sm text-stone-900">{order.shipping_name}</p>
          <p className="mt-2 break-words text-sm text-stone-500">{order.shipping_email}</p>
          <p className="mt-1 text-sm text-stone-500">{order.shipping_phone}</p>
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-stone-500">{order.shipping_address}</p>

          {canCancel && (
            <button type="button" onClick={handleCancel} disabled={cancelling} className="mt-7 w-full border border-stone-300 px-4 py-3 text-sm text-stone-800 transition hover:border-red-700 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60">
              {cancelling ? "Cancelling..." : "Cancel order"}
            </button>
          )}

          {!canCancel && (
            <p className="mt-7 border-t border-stone-200 pt-4 text-xs leading-5 text-stone-500">
              This order can no longer be cancelled through your account.Contact support if you need help.
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}
