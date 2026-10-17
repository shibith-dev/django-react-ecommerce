import { useState } from 'react'
import HomePage from './pages/HomePage'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NotFoundPage from './pages/NotFoundPage'
import MainLayout from './layouts/MainLayout'

function PlaceholderPage({ title }) {
  return (
    <div className='mx-auto flex min-h-[60vh] max-w-7xl flex-col justify-center px-5 py-16 sm:px-8'>
      <p className='text-xs tracking-[0.2em] text-stone-500'>CHRONO</p>
      <h1 className='mt-4 text-4xl font-medium tracking-tight'>{title}</h1>
      <p className='mt-4 text-stone-600'>This page will be implemented in a ater frontend section.</p>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path='/' element={<HomePage />} />
          <Route path='/products' element={<PlaceholderPage title="Explore watches" />} />
          <Route path='/login' element={<PlaceholderPage title="Sign in" />} />
          <Route path='/register' element={<PlaceholderPage title="Create your account" />} />
          <Route path='/cart' element={<PlaceholderPage title="Your shopping cart" />} />
          <Route path='/checkout' element={<PlaceholderPage title="checkout" />} />
          <Route path='/orders' element={<PlaceholderPage title="Your orders" />} />
          <Route path='*' element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
