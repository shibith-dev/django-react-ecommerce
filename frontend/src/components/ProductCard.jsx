import React from 'react'
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

function getImageUrl(product) {
    const image = product.primary_image?.image
    return image || null
}

function formatPrice(price) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(Number(price));
}

const ProductCard = ({product}) => {
    const imageUrl = getImageUrl(product)
    return (
        <div className='group min-w-0'>
            <Link to={`/products/${product.slug}`} className="relative block overflow-hidden bg-[#efede7]">
                {imageUrl ? (
                    <img src={imageUrl} alt={product.alt_text || product.name} loading='lazy' className='aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105' />
                ) : (
                    <div className='flex aspect-[4/5] items-center justify-center text-sm text-stone-500'>Image unavailable</div>
                )}
                {product.stock === 0 && (
                    <span className="absolute left-3 top-3 bg-white/90 px-3 py-1.5 text-xs">
                        Out of stock
                    </span>
                )}
            </Link>
            <div className="flex items-start justify-between gap-3 py-4">
                <div className="min-w-0">
                    <p className="text-xs tracking-wide text-stone-500">{product.brand?.name}</p>

                    <Link to={`/products/${product.slug}`} className="mt-1 block font-medium hover:underline">{product.name}</Link>
                    <p className="mt-2 text-sm text-stone-600">{formatPrice(product.price)}</p>
                </div>
                <Link to={`/products/${product.slug}`} className="mt-1 shrink-0 text-stone-400 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"><ArrowUpRight size={19} /></Link>
            </div>
        </div>
    )
}

export default ProductCard