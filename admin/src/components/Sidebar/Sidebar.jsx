import React from 'react'
import './Sidebar.css'
import { NavLink } from 'react-router-dom'
import {IoIosLogOut, IoMdAddCircleOutline} from 'react-icons/io'
import { MdAddShoppingCart, MdFormatListBulletedAdd, } from 'react-icons/md'
import jld_logo from '../../assets/jld-logo.png'

const Sidebar = ({setToken}) => {
  return (
    <div className='sidebar-container'>
      <div className="sidebar-header">
        <img src={jld_logo} alt="Logo" style={{ height: '80px' }} />
      </div>
      <div className="sidebar-links">
        <NavLink className='sidebar-link' to='/add'>
          <IoMdAddCircleOutline className='sidebar-icon' />
          <p className="sidebar-text">Add Product</p>
        </NavLink>
        <NavLink className='sidebar-link' to='/list'>
          <MdFormatListBulletedAdd className='sidebar-icon' />
          <p className="sidebar-text">List Product</p>
        </NavLink>
        <NavLink className='sidebar-link' to='/orders'>
          <MdAddShoppingCart className='sidebar-icon' />
          <p className="sidebar-text">Orders</p>
        </NavLink>
        <button onClick={()=>setToken("")} className="sidebar-link">
          <IoIosLogOut className='sidebar-icon' />
          <p className="sidebar-text">Logout</p>
        </button>
      </div>
    </div>
  )
}

export default Sidebar