import { useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

import { useCart } from "../context/cartContext";

const formatPrice = (value) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",

    }).format(Number(value));


const CartPage = () => {

    const { cart, cartLoading, cartError, loadCart, updateItem, removeItem } = useCart()

    const [updatingItemId, setUpdatingItemId] = useState(null);
    const [removingItemId, setRemovingItemId] = useState(null);
    const [actionError, setActionError] = useState("");

    async function handleQuantityChange(item, quant) {
        const quantity = Number(quant)
        const stock = Number(item.product.stock)

        if (!Number.isInteger(quantity) || quantity < 1 || quantity > stock) {
            return
        }

        if (quantity === item.quantity) {
            return
        }

        setActionError("")
        setUpdatingItemId(item.id)

        try {
            await updateItem(item.id, quantity)
        } catch (err) {
            setActionError(err.response?.data?.detail || err.response?.data?.quantity?.[0] || "Unable to update this item's quantity.")
        } finally {
            setUpdatingItemId(null)
        }
    }

    async function handleRemove(itemId) {
        setActionError("")
        setRemovingItemId(itemId)

        try {
            await removeItem(itemId)
        } catch (err) {
            setActionError(err.response?.data?.detail || "Unable to remove this item. Please try again.")
        } finally {
            setRemovingItemId(null)
        }
    }

    const items = cart?.items ?? []

    return (
        <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
            <p className="text-xs uppercase tracking-[0.25em] text-stone-500">Your selection</p>
            <h1 className="mt-3 font-serif text-4xl text-stone-900 sm:text-5xl">Shopping cart</h1>
            <p className="mt-4 text-sm text-stone-600">Review your watches before proceeding to checkout.</p>

            {cartLoading && !cart && (
                <div className="py-20 text-center text-sm text-stone-500">Loading your cart...</div>
            )}

            {cartError && !cart && (
                <div className="mt-10 border border-stone-200 p-6">
                    <p role="alert" className="text-sm text-red-700">{cartError}</p>
                    <button type="button" onClick={() => loadCart().catch(() => { })} className="mt-4 text-sm underline underline-offset-4">Try again</button>
                </div>
            )}
            {!cartLoading && cart && items.length === 0 && (
                <div className="flex flex-col items-center py-20 text-center">
                    <ShoppingBag size={36} strokeWidth={1.3} className="text-stone-400" />
                    <h2 className="mt-6 font-serif text-2xl text-stone-900">Your cart is empty</h2>
                    <p className="mt-3 max-w-sm text-sm leading-6 text-stone-600">Explore our collection and find a watch that suits your style.</p>
                    <Link to="/products" className="mt-7 bg-stone-900 px-6 py-3 text-sm text-white transition hover:bg-stone-700">Explore watches</Link>
                </div>
            )}
            {cart && items.length > 0 && (
                <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_340px]">
                    <div>
                        <div className="hidden grid-cols-[minmax(0,1fr)_120px_120px] gap-4 border-b border-stone-200 pb-4 text-xs uppercase tracking-wider text-stone-500 sm:grid">
                            <span>Product</span>
                            <span className="text-center">Quantity</span>
                            <span className="text-right">Total</span>
                        </div>

                        <div className="divide-y divide-stone-200">
                            {items.map((item) => {
                                const product = item.product;
                                const imageUrl = product.primary_image?.image;
                                const isUpdating = updatingItemId === item.id;
                                const isRemoving = removingItemId === item.id;
                                const busy = isUpdating || isRemoving;

                                return (
                                    <article key={item.id} className="grid grid-cols-1 gap-4 py-6 sm:grid-cols-[minmax(0,1fr)_120px_120px] sm:items-center">
                                        <div className="flex min-w-0 gap-4">
                                            <Link to={`/products/${product.slug}`} className="flex h-28 w-24 shrink-0 items-center justify-center overflow-hidden bg-stone-100 sm:h-32 sm:w-28" >
                                                {imageUrl ? (
                                                    <img src={imageUrl} alt={product.primary_image?.alt_text || product.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <ShoppingBag size={24} className="text-stone-400" />
                                                )}
                                            </Link>

                                            <div className="min-w-0 py-1">
                                                <p className="text-xs uppercase tracking-wider text-stone-500">{product.brand?.name}</p>
                                                <Link to={`/products/${product.slug}`} className="mt-2 block font-serif text-lg text-stone-900 hover:text-stone-600" >{product.name}</Link>
                                                <p className="mt-2 text-sm text-stone-600"> {formatPrice(item.unit_price)} </p>

                                                <button type="button" onClick={() => handleRemove(item.id)} disabled={busy} className="mt-4 inline-flex items-center gap-1.5 text-xs text-stone-500 transition hover:text-red-700 disabled:opacity-50" >
                                                    <Trash2 size={14} strokeWidth={1.7} />
                                                    {isRemoving ? "Removing..." : "Remove"}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-center">
                                            <span className="text-xs text-stone-500 sm:hidden">Quantity</span>

                                            <div className="flex items-center border border-stone-300">
                                                <button type="button" onClick={() => handleQuantityChange(item, item.quantity - 1)} disabled={busy || item.quantity <= 1} className="p-2.5 transition hover:bg-stone-100 disabled:opacity-30" >
                                                    <Minus size={14} />
                                                </button>
                                                <span aria-live="polite" className="min-w-8 text-center text-sm tabular-nums" > {isUpdating ? "…" : item.quantity} </span>
                                                <button type="button" onClick={() => handleQuantityChange(item, item.quantity + 1)} disabled={busy || item.quantity >= product.stock_quantity} className="p-2.5 transition hover:bg-stone-100 disabled:opacity-30" >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end">
                                            <span className="text-xs text-stone-500 sm:hidden">Line total</span>
                                            <span className="text-sm font-medium text-stone-900">{formatPrice(item.total_price)}</span>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>

                        {actionError && (
                            <div role="alert" className="mt-4 border border-red-200 bg-red-50 p-4 text-sm text-red-700">{actionError}</div>
                        )}

                        {cartError && (
                            <p role="status" className="mt-4 text-sm text-stone-600">{cartError}</p>
                        )}

                        <Link to="/products" className="mt-6 inline-block text-sm text-stone-600 underline underline-offset-4 hover:text-black">Continue shopping</Link>
                    </div>

                    <aside className="h-fit border border-stone-200 p-6 sm:p-7">
                        <h2 className="font-serif text-2xl text-stone-900">Order summary</h2>

                        <div className="mt-6 flex justify-between gap-4 border-b border-stone-200 pb-5 text-sm">
                            <span className="text-stone-600">Subtotal ({cart.item_count} items)</span>
                            <span className="font-medium tabular-nums">{formatPrice(cart.subtotal)}</span>
                        </div>

                        <p className="mt-5 text-xs leading-5 text-stone-500">Shipping costs and final order totals will be confirmed at checkout.</p>

                        <Link to="/checkout" className="mt-7 block w-full bg-stone-900 px-6 py-4 text-center text-sm text-white transition hover:bg-stone-700">
                            Proceed to checkout
                        </Link>
                    </aside>
                </div>
            )}
        </section>
    )
}

export default CartPage