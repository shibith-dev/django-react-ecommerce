import React from 'react'
import { ArrowRight, ArrowUpRight } from "lucide-react";
import heroImage from '../assets/photos/hero_image.jpg'

const featuredWatches = [
    {
        name: "The Classic",
        category: "EVERYDAY COLLECTION",
        price: "₹12,500",
        image:
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85",
    },
    {
        name: "The Minimalist",
        category: "MODERN COLLECTION",
        price: "₹18,900",
        image:
            "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=85",
    },
    {
        name: "The Essential",
        category: "DAILY COLLECTION",
        price: "₹15,500",
        image:
            "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=900&q=85",
    },
];

function WatchCard({ watch }) {
    return (
        <div className='group'>
            <div className='relative overflow-hidden bg-[#efede7]'>
                <img src={watch.image} alt={watch.name} className='aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105' loading='lazy' />
                <span className='absolute left-3 top-3 bg-white/90 px-3 py-1.5 text-[10px] tracking-[0.15em]'>{watch.category}</span>
            </div>
            <div className='flex items-center justify-between gap-3 py-4'>
                <div>
                    <h3 className='font-medium'>{watch.name}</h3>
                    <p className='mt-1 text-sm text-stone-500'>{watch.price}</p>
                </div>
                <ArrowUpRight size={18} className='text-stone-400 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1' />
            </div>
        </div>
    )
}

const HomePage = () => {
    return (
        <main>
            <section className='mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-2 lg:items-center lg:gap-16'>
                <div className='max-w-xl'>
                    <p className='text-xs font-medium trackig-[0.2em] text-stone-500'>DESIGNED TO LAST</p>
                    <h1 className='mt-6 text-5xl font-medium leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl'>Time is <br /><span className='font-serif italic'>personal</span></h1>
                    <p className='mt-6 max-w-md text-base leading-7 text-stone-600'>
                        Discover thoughtfully selected watches that bring together timeless design and everyday functionality.
                    </p>
                    <a href="#collections" className='mt-8 inline-flex items-center gap-3 bg-[#25241f] px-6 py-4 text-white transition-colors hover:bg-stone-700'>Explore the collection <ArrowRight size={16} /></a>
                    <p className='mt-12 text-xs tracking-wide text-stone-500'>CONSIDERED DESGIN. EVERYDAY PRECISION.</p>
                </div>
                <div className='relative'>
                    <img src={heroImage} alt="A watch from Chrono collection" className='aspect[4/5] w-full bg-[3efede7] object-cover sm:aspect-[5/4]' />
                    <div className='absolute bottom-4 left-4 bg-[#faf9f6] px-4 py-3 sm:bottom-6 sm:left-6'>
                        <p className='text-xs text-stone-500'> THE CHRONO EDIT</p>
                        <p className='mt-1 text-sm font-medium'>Made for your moments</p>
                    </div>
                </div>
            </section>
            <section id='collections' className='border-t border-stone-200'>
                <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
                    <div className='mb-10 flex items-end justify-between gap-4'>
                        <div>
                            <p className='text-xs tracking-[0.2em] text-stone-500'>THE COLLECTION</p>
                            <h2 className='mt-3 text-3xl font-medium tracking-tight sm:text-4xl'>Everyday icons</h2>
                        </div>
                        <a href="#collections" className='hidden items-center gap-2 text-sm sm:flex'>view all <ArrowRight size={16} /></a>
                    </div>
                    <div className='grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3'>
                        {featuredWatches.map((watch) => (
                            <WatchCard key={watch.name} watch={watch} />
                        ))}
                    </div>
                </div>
            </section>
            <section id='story' className='bg-[#eae7df] px-5 py-16 sm:px-8 sm:py-24'>
                <div className='mx-auto max-w-3xl text-center'>
                    <p className='text-xs tracking-[0.2em] text-stone-500'>THE CHRONO PHILOSOPHY</p>
                    <h2 className='mt-5 text-3xl font-medium leading-tight tracking-tight sm:text-5xl'>Less noise. More meaning.</h2>
                    <p className="mx-auto mt-6 max-w-xl leading-7 text-stone-600">
                        A watch is more than a way to measure time. It is
                        part of your routine, your style, and the moments
                        that matter to you.
                    </p>
                </div>
            </section>
        </main>
    )
}

export default HomePage