import React from 'react'
import Navbar from '../components/Navbar'
import { Outlet } from 'react-router-dom'
import Footer from '../components/Footer'

const MainLayout = () => {
  return (
    <div className='flex min-h-screen flex-col'>
        <Navbar/>
        <main className='flex-1'>
            <Outlet />
        </main>
        <Footer />
    </div>
  )
}

export default MainLayout