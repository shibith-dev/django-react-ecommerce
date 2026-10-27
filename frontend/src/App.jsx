import { useState } from 'react'
import HomePage from './pages/HomePage'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NotFoundPage from './pages/NotFoundPage'
import MainLayout from './layouts/MainLayout'
import ProductPage from './pages/ProductPage'
import ProductDetailPage from './pages/ProductDetailPage'
import LoginPage from './pages/LoginPage'
import { AuthProvider } from './context/AuthContext'
import RegisterPage from './pages/RegisterPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import AccountPage from './pages/AccountPage'
import ChangePasswordPage from './pages/ChangePasswordPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import PasswordRestPage from './pages/PasswordResetPage'
import ProtectedRoute from './components/ProtectedRoute'

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
      <AuthProvider>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path='/' element={<HomePage />} />
            <Route path='/products' element={<ProductPage />} />
            <Route path='/products/:slug' element={<ProductDetailPage />} />
            <Route path='/login' element={<LoginPage />} />
            <Route path='/register' element={<RegisterPage />} />
            <Route path='/forgot-password' element={<ForgotPasswordPage />} />
            <Route path='/reset-password' element={<PasswordRestPage />} />
            <Route path='/verify-email' element={<VerifyEmailPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path='/account' element={<AccountPage />} />
              <Route path='/change-password' element={<ChangePasswordPage />} />
              <Route path='/cart' element={<PlaceholderPage title="Your shopping cart" />} />
              <Route path='/checkout' element={<PlaceholderPage title="checkout" />} />
              <Route path='/orders' element={<PlaceholderPage title="Your orders" />} />
            </Route>
            <Route path='*' element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
