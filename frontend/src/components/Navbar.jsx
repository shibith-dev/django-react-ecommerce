import React from 'react'
import { Link, NavLink } from "react-router-dom";
import { Search, ShoppingBag, UserRound } from "lucide-react";

const navigationLinkClass = ({ isActive }) => {
    `transition-colors hover:text-black ${isActive ? "text-black" : "text-stone-500"}`
}

const Navbar = () => {
    return (
        <header className='sticky top-0 z-50 border-b border-stone-200 bg-[#faf9f6]/95 backdrop-blur'>
            <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
                <Link to="/" className='text-xl font-semibold tracking-[0.2em] sm:text-2xl'>CHRONO</Link>
                <nav className='hidden items-center gap-8 text-sm md:flex'>
                    <NavLink to="/" className={navigationLinkClass}>Home</NavLink>
                    <NavLink to="/products" className={navigationLinkClass}>Watches</NavLink>
                </nav>
                <div className='flex items-center gap-4'>
                    <Link to="/products" className='text-stone-600 transition-colors hover:text-black'><Search size={19} strokeWidth={1.7} /></Link>
                    <Link to="/login" className='text-stone-600 transition-colors hover:text-black'><UserRound size={19} strokeWidth={1.7} /></Link>
                    <Link to="/cart" className='text-stone-600 transition-colors hover:text-black'><ShoppingBag size={19} strokeWidth={1.7} /></Link>
                </div>
            </div>

        </header>
    )
}

export default Navbar