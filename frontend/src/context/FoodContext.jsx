import React, { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import {useNavigate} from "react-router-dom"
import { product } from "../assets/assets";
import { backendUrl } from "../App";
import axios from 'axios'


export const FoodContext = createContext()

const FoodContextProvider = ({children}) => {

    const delivery_fee = 12000;
    const currency = 'Rp '
    console.log(backendUrl);

    
    const [products, setProducts] = useState(product)
    const [cartItems, setCartItems] = useState({})
    const [token, setToken] = useState('')
    const [userName, setUserName] = useState('')

    const navigate = useNavigate()

    const addToCart = async(itemId) => {
        const updatedCart = { ...cartItems};
        updatedCart[itemId] = (updatedCart[itemId] || 0) + 1;
        setCartItems(updatedCart)

        console.log(`${itemId} added to cart`);
        
        toast.success(`Added to cart`)

        if (token) {
            try {
                 // Send a request to the backend to update the cart in the database
                await axios.post(`${backendUrl}/api/cart/add`, { itemId }, { headers: { token } });
                
            } catch (error) {
                // Show an error message to the user if the request fails
                console.log(error);
                toast.error(error.message);
            }
        }

    }

    const getCartCount = ()=> {
        return Object.values(cartItems).reduce((total, quantity) => total + quantity, 0)
    }

    const updateQuantity = async(itemId, quantity) => {
        let cartData = {...cartItems};
        cartData[itemId] = quantity;
        setCartItems(cartData)

        if(token){
            try {
                await axios.post(`${backendUrl}/api/cart/update`, {itemId, quantity}, {headers: {token}})
            } catch (error) {
                console.log(error);
                toast.error(error.message)
            }
        }

    }

    const getCartAmount = ()=> {
        return Object.entries(cartItems).reduce((totalAmount, [itemId, quantity]) => {
            const itemInfo = products.find((product) => product._id === itemId)
            return itemInfo ? totalAmount + itemInfo.price * quantity : totalAmount
        },0)
    }

    const getProductsData = async() => {
        try {
            const response = await axios.get(`${backendUrl}/api/product/list`)
            console.log(response.data);

            if(response.data.success){
                setProducts(response.data.products)
            } else{
                toast.error(response.data.message)
            }
            
            
        } catch (error) {
            console.log(error);
            toast.error(error.message)
            
        }
    }

    const getUserCart = async (token) => {
        try {
             // Sending a POST request to get the cart data, passing the token in the headers for authentication
            const response = await axios.post(`${backendUrl}/api/cart/get`, {}, { headers: { token } });

        // If the request is successful, update the cartItems state with the received cart data
            if (response.data.success) {
                setCartItems(response.data.cartData);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };


    useEffect(()=>{
        getProductsData();
    }, [])

    useEffect(()=>{
        if(!token && localStorage.getItem('token')){
            setToken(localStorage.getItem('token'));
            getUserCart(localStorage.getItem('token'))
        }
        if (localStorage.getItem('name')) {
            setUserName(localStorage.getItem('name'))
        }

    },[])

    return (
        <FoodContext.Provider value={{products, cartItems,setCartItems,getUserCart, navigate, currency, getCartAmount, addToCart, delivery_fee, getCartCount, updateQuantity, token, setToken, userName, setUserName}}>
            {children}
        </FoodContext.Provider>
    )
}

export default FoodContextProvider
