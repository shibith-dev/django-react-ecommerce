import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Minus, Plus, ShoppingBag } from 'lucide-react'

import { getProductBySlug } from '../services/productService'

function formatPrice(price) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    }).format(Number(price))
}

function Specification({ label, value }) {
    return (
        <div className='flex items-start justify-between gap-4 border-b border-stone-200 py-3'>
            <dt className='text-sm text-stone-500'>{label}</dt>
            <dd className='text-right text-sm font-medium'>{value ?? "Not specified"}</dd>
        </div>
    )
}

const ProductDetailPage = () => {
    const { slug } = useParams()

    const [product, setProduct] = useState(null)
    const [selectedImage, setSelectedImage] = useState(0)
    const [quantity, setQuantity] = useState(1)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [cartMessage, setCartMessage] = useState("")

    useEffect(() => {
        let active = true

        async function loadProduct() {
            setLoading(true)
            setError("")

            try {
                const data = await getProductBySlug(slug)
                if (active) {
                    setProduct(data)
                }
            } catch (error) {
                if (active) {
                    if (error.response?.status === 404) {
                        setError("This watch could not be found.")
                    } else {
                        setError("We couldn't load this watch. Please try again.")
                    }
                }
            } finally {
                if (active) {
                    setLoading(false)
                }
            }
        }
        loadProduct()

        return () => {
            active = false
        }
    }, [slug])

    if (loading) {
        return (
            <section className='max-auto grid max-w-7xl animate-pulse gap-10 px-5 py-12 lg:grid-cols-2 sm:px-8'>
                <div className='aspect-[4/5] bg-stone-200' />
                <div className='space-y-5 py-4'>
                    <div className='h-4 w-1/3 bg-stone-200'></div>
                    <div className='h-10 w-3/4 bg-stone-200'></div>
                    <div className='h-6 w-1/4 bg-stone-200'></div>
                    <div className='h-24 bg-stone-200'></div>
                </div>
            </section>
        )
    }

    if (error || !product) {
        return (
            <section className='mx-auto flex min-h-[60vh] max-w-7xl flex-col items-start justify-center px-5 py-16 sm:px-8'>
                <p className='text-xs tracking-[0.2em] text-stone-500'>PRODUCT DETAILS</p>
                <h1 className='mt-4 text-3xl font-medium'>{error || "watch unavailabe"}</h1>
                <p className='mt-3 max-w-lg text-sm leading-6 text-stone-600'>The product may have removed, or there may be a temporary connection issue.</p>
                <Link to="/products" className='mt-7 inline-flex items-center gap-2 border border-stone-300 px-5 py-3 text-sm hover:border-stone-700'><ArrowLeft size={16} /> Back to watches</Link>
            </section>
        )
    }

    const currentImage = product.images[selectedImage]
    const stock = Number(product.stock ?? 0)
    const available = product.is_active && stock > 0


    function handleAddToCart() {
        // Cart API integration is implemented in Phase 9.7.
        setCartMessage(
            "coming soon....",
        );
    }

    return (
        <div className='mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12'>
            <Link to="/products" className='mb-8 inline-flex items-center gap-2 text-sm text-stone-500 hover:text-black'><ArrowLeft size={16} />All watches</Link>
            <div className='grid gap-10 lg:grid-cols-2 lg:gap-16'>
                <section>
                    <div className='overflow-hidden bg-[#efede7]'>
                        {currentImage?.image ? (
                            <img src={currentImage.image} alt={currentImage.alt_text || product} className='aspect-[4/5] w-full object-cover' />
                        ) : (
                            <div className='flex asepct-[4/5] items-center justify-center text-sm text-stone-500'>
                                Product image unavailable
                            </div>
                        )}
                    </div>
                    {
                        product.images.length > 1 && (
                            <div className='mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5'>
                                {product.images.map((image, index) => (
                                    <button key={index} type='button' onClick={() => setSelectedImage(index)} className={`overflow-hidden border-2 ${selectedImage === index ? "border-stone-800" : "border-transparent"}`}>
                                        {image.image ? (
                                            <img src={image.image} alt={image.alt_text || `${product.name} - ${index + 1}`} className='aspect-square w-full object-cover' />
                                        ) : (
                                            <div className='aspect-square bg-stone-200'></div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )
                    }
                </section>
                <section className='lg:py-5'>
                    <p className='text-xs tracking-[0.2em] text-stone-500'>{product.brand?.name || "CHRONO COLLECTION"}</p>
                    <h1 className="mt-4 text-3xl font-medium tracking-tight sm:text-4xl lg:text-5xl">{product.name}</h1>
                    <p className="mt-5 text-2xl font-medium">{formatPrice(product.price)}</p>
                    <div className="mt-5">
                        {available ? (
                            <p className="text-sm text-emerald-700">In stock</p>
                        ) : (
                            <p className="text-sm text-red-700">Currently unavailable</p>
                        )}
                    </div>
                    {product.description && (
                        <p className='mt-6 whitespace-pre-line text-sm leading-7 text-stone-600'>
                            {product.description}
                        </p>
                    )}
                    <div className='mt-8 border-y border-stone-200 py-5'>
                        <label htmlFor="" className='mb-3 block text-sm font-medium'>Quantity</label>
                        <div className='flex items-center gap-4'>
                            <div className='flex items-center border border-stone-300'>
                                <button type='button' disabled={quantity <= 1} onClick={() => setQuantity((current) => Math.max(1, current - 1))} className='p-3 disabled:cursor-not-allowed disabled:opacity-40'>
                                    <Minus size={16} />
                                </button>
                                <span id="product-quantity" className="min-w-10 text-center text-sm">{quantity}</span>
                                <button type="button" disabled={!available || quantity >= stock} onClick={() => setQuantity((current) => Math.min(stock, current + 1))} className="p-3 disabled:cursor-not-allowed disabled:opacity-40">
                                    <Plus size={16} />
                                </button>
                            </div>
                            <p className='text-xs text-stone-500'>
                                {available ? `${stock} available` : "No stock available"}
                            </p>
                        </div>
                        <button type='button' disabled={!available} onClick={handleAddToCart} className='mt-5 flex w-full items-center justify-center gap-3 bg-[#25241f] px-6 py-4 text-sm text-white transition-colors hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-300'>
                            <ShoppingBag size={18} /> {available ? "Add to cart" : "Out of stock"}
                        </button>

                        {cartMessage && (
                            <p role='status' className='mt-3 text-sm text-stone-600'>{cartMessage}</p>
                        )}
                    </div>

                    <section className='mt-9'>
                        <h2 className='text-lg font-medium'>Watch specifications</h2>
                        <dl className='mt-3'>
                            <Specification label="Brand" value={product.brand?.name} />
                            <Specification label="Category" value={product.category?.name} />
                            <Specification label="Watch type" value={product.watch_type} />
                            <Specification label="Movement" value={product.movement_type} />
                            <Specification label="Strap material" value={product.strap_material} />
                            <Specification label="Dial color" value={product.dial_color} />
                            <Specification label="Case color" value={product.case_color} />
                            <Specification label="Strap color" value={product.strap_color}/>
                            <Specification
                                label="Case diameter"
                                value={
                                    product.case_diameter_mm != null
                                        ? `${product.case_diameter_mm} mm`
                                        : "Not specified"
                                } />
                            <Specification
                                label="Water resistance"
                                value={
                                    product.water_resistance_m != null
                                        ? `${product.water_resistance_m} m`
                                        : "Not specified"
                                }
                            />
                        </dl>
                    </section>
                </section>
            </div>

        </div>
    )
}

export default ProductDetailPage