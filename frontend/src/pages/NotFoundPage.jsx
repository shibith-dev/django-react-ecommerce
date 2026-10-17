import { ArrowLeft } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'

const NotFoundPage = () => {
  return (
    <div className='flex min-h-[60vh] flex-col items-center justify-center px-5 text-center'>
        <p className='text-xs tracking-[0.25em] text-stone-500'>404 - PAGE NOT FOUND</p>
        <h1 className='mt-5 text-4xl font-medium tracking-tight sm:text-5xl'>Lost in time?</h1>
        <p className='mt-4 max-w-md leading-7 text-stone-600'>The page you're looking for doesn't exist or may have moved.</p>
        <Link to="/" className='mt-8 inline-flex items-center gap-2 bg-[#25241f] px-5 py-3 text-sm text-white transition hover:bg-stone-700'><ArrowLeft size={16} /> Back to home</Link>
    </div>
  )
}

export default NotFoundPage