import React, { useContext, useEffect } from 'react'
import { FoodContext } from '../context/FoodContext'
import { useSearchParams } from 'react-router-dom'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import axios from 'axios'


const Verify = () => {

    // Import necessary values from the ShopContext
    const { navigate, token, setCartItems } = useContext(FoodContext); 
    // `navigate`: Function to redirect the user to different pages
    // `token`: Authentication token to verify user identity
    // `setCartItems`: Function to update the cart items in the context
    
    // React Router hook to access query parameters in the URL
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Retrieve query parameters from the URL
    const success = searchParams.get('success'); // Indicates whether the payment was successful
    const orderId = searchParams.get('orderId'); // The ID of the order being verified
    
    // Function to verify the payment status using the backend API
    const verifyPayment = async () => {
        try {
            // Check if the user is authenticated (token is available)
            if (!token) {
                return null; // Exit early if no token is present
            }
    
            // Send a POST request to verify the Stripe payment status
            const response = await axios.post(
                backendUrl + '/api/order/verifyStripe', // API endpoint for payment verification
                { success, orderId }, // Send `success` and `orderId` as payload
                { headers: { token } } // Include the authentication token in the headers
            );
    
            if (response.data.success) {
                // If the payment verification succeeds:
                setCartItems({}); // Clear the cart items as the order has been placed
                navigate('/orders'); // Redirect the user to the orders page
                toast.success('Order placed successfully!'); // Display a success toast message
            } else {
                // If payment verification fails:
                navigate('/cart'); // Redirect the user back to the cart page
                toast.error('Order Failed')
            }
        } catch (error) {
            // Log the error to the console for debugging
            console.log(error);
    
            // Display an error message using a toast notification
            toast.error(error.message);
        }
    };
    
    // React `useEffect` hook to run the `verifyPayment` function when the component mounts
    useEffect(() => {
        verifyPayment(); // Verify payment when the component renders or when `token` changes
    }, [token]); // Dependency array ensures the effect re-runs if `token` changes
    
      return (
        <div>
    
        </div>
      )
    }
    
    // dummy stripe card numbers : 4242424242424242
    // Lorem ipsum dolor sit amet consectetur adipisicing elit. Architecto dolorem enim eum autem ex, quis pariatur accusantium atque impedit ipsam similique quidem nesciunt exercitationem dignissimos temporibus odit nisi corrupti error.
    
    export default Verify