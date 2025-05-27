import React, { useContext, useEffect, useState } from 'react'
import {FoodContext} from '../../context/FoodContext'
import axios from 'axios'
import { backendUrl } from '../../App'
import './Order.css'

const Order = () => {
  const {token, currency} = useContext(FoodContext)

  const [orderData, setOrderData] = useState([])

  const loadOrderData = async()=>{
    try {
      if(!token){
        return null
      }

      const response = await axios.post(backendUrl + '/api/order/userorders', {}, {headers: {token}})
      if(response.data.success){
        let allOrdersItem = []

        response.data.orders.map((order)=> {
          order.items.map((item)=> {
            item['status'] = order.status;
            item['payment'] = order.payment;
            item['paymentMethod'] = order.paymentMethod;
            item['date'] = order.date

            allOrdersItem.push(item)

          })
        })
        console.log(response.data);
        setOrderData(allOrdersItem.reverse())
        
      }
    } catch (error) {
      console.log(error);
      
      
    }
  }

  useEffect(()=> {
    loadOrderData()
  },[token])
  return (
    <div>
      <div className="order-container">
        <div className="order-title">
          <h1>My Orders</h1>
        </div>
        <div>
          {
            orderData.map((item, index)=> (
              <div className='order-item-container' key={index}>
                <div className="order-item-details">
                  <img src={item.image} alt="" className='order-item-image' />
                  <div>
                    <p className="order-item-name">{item.name} </p>
                    <div className="order-item-info">
                      <p>{currency}{item.price} </p>
                      <p>Quantity: {item.quantity} </p>
                    </div>
                    <p className='order-item-date'>Date: <span>{new Date(item.date).toLocaleString()}</span> </p>
                    <p className='order-item-payment'>Payment: <span>{item.paymentMethod} </span> </p>
                  </div>
                </div>
                <div className="order-item-status-container">
                  <div className="order-item-status">
                    <p className="status-indicator"></p>
                    <p>Status: {item.status}</p>
                  </div>
                  <div className="order-item-status">
                    <p className="status-indicator"></p>
                    <p>Payment: {item.payment ? "Done" : "Pending"}</p>
                  </div>
                  {/* <button onClick={loadOrderData} className='track-order-btn'>Track Order</button> */}
                </div>


              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}

export default Order