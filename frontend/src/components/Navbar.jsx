import React from 'react'
import { Link, NavLink, replace, useNavigate } from "react-router-dom";
import { Loader2, LogOut, Search, ShoppingBag, UserRound } from "lucide-react";

import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const navigationLinkClass = ({ isActive }) => {
    `transition-colors hover:text-black ${isActive ? "text-black" : "text-stone-500"}`
}

const Navbar = () => {
    const { isAuthenticated, authloading, logout } = useAuth()
    const navigate = useNavigate()

    const { itemCount } = useCart()

    async function handleLogout(params) {
        try {
            await logout()
        } finally {
            navigate("/", { replace: true })
        }
    }
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
                    {!authloading && isAuthenticated ? (
                        <>
                            <Link to="/account" title="My account" className="text-stone-600 transition-colors hover:text-black"><UserRound size={19} strokeWidth={1.7} /></Link>
                            <button type="button" onClick={handleLogout} title="Sign out" className="text-stone-600 transition-colors hover:text-black">
                                <LogOut size={19} strokeWidth={1.7} />
                            </button>
                        </>
                    ) : authloading ? (<Loader2 size={19} className="animate-spin text-stone-600" />) : (<Link to="/login" className='text-stone-600 transition-colors hover:text-black'><UserRound size={19} strokeWidth={1.7} /></Link>)}
                    <Link to="/cart" className='relative text-stone-600 transition-colors hover:text-black'>
                        <ShoppingBag size={19} strokeWidth={1.7} />
                        {itemCount > 0 && (
                            <span className="absolute -right-2.5 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-stone-900 px-1 text-[10px] font-medium leading-none text-white">
                                {itemCount > 99 ? "99+" : itemCount}
                            </span>
                        )}
                    </Link>
                </div>
            </div>

        </header>
    )
}

export default Navbar