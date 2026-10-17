import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
    return (
        <footer className='bg-[#25241f] px-5 py-10 text-white sm:px-8'>
            <div className='m-auto grid max-w-7xl gap-8 sm:grid-cols-3'>
                <div>
                    <Link to="/" className='text-xl font-semibold tracking-[0.2em]'>CHRONO</Link>
                    <p className='mt-3 max-w-xs text-sm leading-6 text-stone-400'>Thoughtfully selected watches for the moments that matter.</p>
                </div>
                <div>
                    <h2 className='text-sm font-medium'>Explore</h2>
                    <div className='mt-3 flex flex-col items-start gap-2 text-sm text-stone-400'>
                        <Link to="/" className='hover:text-white'>Home</Link>
                        <Link to="/products" className='hover:text-white'>All watches</Link>
                    </div>
                </div>
                <div>
                    <h2 className='text-sm font-medium'>Your account</h2>
                    <div className='mt-3 flex flex-col items-start gap-2 text-sm text-stone-400'>
                        <Link to="/login" className='hover:text-white'>Sign in</Link>
                        <Link to="/register" className='hover:text-white'>Create account</Link>
                    </div>
                </div>
            </div>

            <div className='mx-auto mt-10 max-w-7xl border-t border-white/10 pt-5 text-xs text-stone-500'>
                © 2026 Chrono. All rights reserved.
            </div>

        </footer>
    )
}

export default Footer