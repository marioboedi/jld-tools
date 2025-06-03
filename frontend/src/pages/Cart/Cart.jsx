import React, { useContext, useEffect, useState } from 'react'
import { FoodContext } from '../../context/FoodContext'
import {MdDelete} from 'react-icons/md'
import CartTotal from '../../components/CartTotal/CartTotal'
import './Cart.css'

const Cart = () => {

  const {products,  currency, cartItems, updateQuantity, navigate} = useContext(FoodContext)

  const [cartData, setCartData] = useState([])

  useEffect(()=> {
    if(products.length === 0) return;

    if(!cartItems || typeof cartItems !== "object"){
      setCartData([]);
      return;
    }

    const tempData = Object.entries(cartItems)
      .filter(([, quantity]) => quantity > 0)
      .map(([itemId, quantity]) => ({
        // Assign product ID
        _id: itemId,
        // Assign quantity
        quantity,
      }));  // Filter out items with zero quantity
      // Only include items with a quantity greater than 0

    setCartData(tempData)
  },[cartItems, products])

  return (
    <div>
      <div>
        <h2>Cart Items</h2>
      </div>
      <div className='cart-content-container'>
        {
          cartData.map((item, index) => {
            const productData = products.find(product=> product._id === item._id)
            if(!productData){
              return null
            }
            return (
              <div key={index} className='cart-item' >
                <div className="cart-item-info">
                  <img src={productData.image} alt="" className='product-cart-image'/>
                  <div className="product-details-cart">
                    <p className="cart-product-name">{productData.name} </p>
                    <p className="cart-product-price">{currency}{productData.price.toLocaleString('id-ID')}</p>

                  </div>
                </div>
                <div className='cart-actions'>
                  <input type="number" min={1} defaultValue={item.quantity} className='quantity-input' 
                  onChange={(e)=> e.target.value === "" || e.target.value === "0" ? null : updateQuantity(item._id, Number(e.target.value))} />

                  <MdDelete className='delete-icon' onClick={()=> updateQuantity(item._id, 0)}/>
                </div>

              </div>
            )
          })
        }
      </div>

      <div className='checkout-container'>
        <div className="checkout-box">
          <CartTotal />
          <div className="checkout-btn-container">
            <button onClick={()=> navigate("/checkout")} className='checkout-btn'>PROCEED TO CHECKOUT</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart