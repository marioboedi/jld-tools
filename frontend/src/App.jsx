import React from 'react'
import Navbar from './components/Navbar/Navbar'
import Home from './pages/Home/Home'
import Login from './pages/Login/Login'
import Cart from './pages/Cart/Cart'
import Checkout from './pages/Checkout/Checkout'
import Order from './pages/Order/Order'
import Footer from './components/Footer/Footer'
import {Routes, Route} from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify';
import Verify from './pages/Verify'

export const backendUrl = 'http://localhost:4000'

const App = () => {
  return (
    <div>
      <ToastContainer />
      <Navbar />
      <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/checkout' element={<Checkout />} />
          <Route path='/orders' element={<Order />} />
          <Route path='/verify' element={<Verify />} />
      </Routes>
      <Footer />
    </div>
  )
}

export default App