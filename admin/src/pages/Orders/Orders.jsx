import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../../App'
import { toast } from 'react-toastify'
import './Orders.css'

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [sortOrder, setSortOrder] = useState('desc')
  const [selectedDate, setSelectedDate] = useState('') // filter tanggal
  const ordersPerPage = 5

  const fecthAllOrders = async () => {
    if (!token) return
    try {
      const response = await axios.post(
        backendUrl + "/api/order/list",
        {},
        { headers: { token } }
      )
      if (response.data.success) {
        setOrders(response.data.orders)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error(error)
      toast.error(error.message)
    }
  }

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/order/status",
        { orderId, status: event.target.value },
        { headers: { token } }
      )
      if (response.data.success) {
        await fecthAllOrders()
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to update status")
    }
  }

  useEffect(() => {
    fecthAllOrders()
  }, [token])

  // Sort & filter
  const sortedOrders = [...orders]
    .filter((order) => {
      if (!selectedDate) return true
      const orderDate = new Date(order.date).toISOString().split('T')[0]
      return orderDate === selectedDate
    })
    .sort((a, b) => {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
    })

  const indexOfLastOrder = currentPage * ordersPerPage
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage
  const currentOrders = sortedOrders.slice(indexOfFirstOrder, indexOfLastOrder)
  const totalPages = Math.ceil(sortedOrders.length / ordersPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  return (
    <div>
      <h3 className="order-title">All Orders</h3>

      <div className="order-sort">
        <label htmlFor="sort">Sort by Date: </label>
        <select
          id="sort"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>

        <label htmlFor="filter-date" style={{ marginLeft: '1rem' }}>Filter by Specific Date: </label>
        <input
          type="date"
          id="filter-date"
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value)
            setCurrentPage(1) // Reset ke halaman pertama saat filter diterapkan
          }}
        />
        {selectedDate && (
          <button onClick={() => setSelectedDate('')} style={{ marginLeft: '0.5rem' }}>
            Clear Filter
          </button>
        )}
      </div>

      <div className="order-container">
        <table className="order-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Email</th>
              <th>Telephone</th>
              <th>Shipping Address</th>
              <th>Product Name</th>
              <th>Quantity</th>
              <th>Items</th>
              <th>Price</th>
              <th>Payment Method</th>
              <th>Payment Status</th>
              <th>Date</th>
              <th>Delivery Status</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.map((order, index) => (
              <tr key={index}>
                <td>{order.address.firstName}</td>
                <td>{order.address.email}</td>
                <td>{order.address.phone}</td>
                <td>{order.address.street}, {order.address.city}, {order.address.state}, {order.address.country}, {order.address.zipcode}</td>
                <td>{order.items.map((item, i) => <p key={i}>{item.name}</p>)}</td>
                <td>{order.items.map((item, i) => <p key={i}>{item.quantity}</p>)}</td>
                <td>{order.items.length}</td>
                <td>{currency}{order.amount}</td>
                <td>{order.paymentMethod}</td>
                <td>{order.payment ? "Done" : "Pending"}</td>
                <td>{new Date(order.date).toLocaleString()}</td>
                <td>
                  <select onChange={(event) => statusHandler(event, order._id)} value={order.status} className='order-status'>
                    <option value="Order Placed">Order Placed</option>
                    <option value="Packing">Packing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => paginate(i + 1)}
              className={currentPage === i + 1 ? 'active' : ''}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Orders
