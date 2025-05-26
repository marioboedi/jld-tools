import orderModel from '../models/orderModels.js';
import userModel from '../models/userModels.js';
import productModel from '../models/productModels.js';
import Stripe from 'stripe'

//GATEWAY INITIALIZE
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// global variables
const currency = 'usd'
const deliveryCharge = 12

// Placing order using COD (cash on delivery) Method
const placeOrder = async (req, res) => {
    try {
        const { userId, amount, address } = req.body;

        // Fetch user data to get cart items
        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Fetch product details and include name in items array
        const items = await Promise.all(
            Object.entries(userData.cartData).map(async ([itemId, quantity]) => {
                const product = await productModel.findById(itemId);
                
                if (!product) {
                    throw new Error(`Product with ID ${itemId} not found`);
                }

                return {
                    itemId,
                    name: product.name, // Fetch product name
                    image: product.image, // Fetch product image 
                    price: product.price, // Fetch product price
                    quantity,
                };
            })
        );

        if (items.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        // Prepare order data object
        const orderData = {
            userId,
            items,
            amount,
            address,
            paymentMethod: "COD",
            payment: false,
            date: Date.now(),
        };

        // Create a new order document and save it
        const newOrder = new orderModel(orderData);
        await newOrder.save();

        // Clear the user's cart
        await userModel.findByIdAndUpdate(userId, { cartData: {} });

        // Send success response
        res.json({ success: true, message: "Order Placed" });

    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, message: error.message });
    }
};

  

// Placing order using stripe
// This code sets up a Stripe checkout session for processing payments, including product details, prices, and a delivery charge, with redirection URLs for success and cancellation outcomes.
const placeOrderStripe = async (req, res) => {
    try {
      // Extract user ID, amount, and address from request body
      const { userId, amount, address } = req.body;
       // Get the origin URL from request headers (used for redirect URLs in Stripe)
      const { origin } = req.headers;
  
      // Fetch user data from the database using userId
      const userData = await userModel.findById(userId);
       // If the user does not exist, return an error response
      if (!userData) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      // Retrieve the user's cart items, mapping each item to fetch product details
      const items = await Promise.all(
        Object.entries(userData.cartData).map(async ([itemId, quantity]) => {
          const product = await productModel.findById(itemId);
          return {
            itemId, // Product ID
            name: product.name,
            image: product.image,
            price: product.price,
            quantity,
          };
        })
      );
  
       // If cart is empty, return an error response
      if (items.length === 0) {
        return res.status(400).json({ success: false, message: "Cart is empty" });
      }
  
       // Create a new order object to store in the database
      const orderData = {
        userId,  // User ID placing the order
        items, // List of items in the cart
        amount,
        address,
        paymentMethod: "Stripe",
        payment: false,
        date: Date.now(),
      };
  
       // Save the new order to the database
      const newOrder = new orderModel(orderData);
      await newOrder.save();
  
      // Convert items into Stripe's required format for checkout session
      const line_items = items.map((item) => ({
        price_data: {
          currency: currency,  // Currency (e.g., USD)
          product_data: { name: item.name },
          unit_amount: item.price * 100,  // Convert price to cents
        },
        quantity: item.quantity,
      }));
  
      // Add a delivery charge as a separate item in Stripe checkout
      line_items.push({
        price_data: {
          currency: currency,
          product_data: { name: "Delivery Charge" }, // Label for delivery charge
          unit_amount: deliveryCharge * 100, // Convert delivery charge to cents
        },
        quantity: 1, // Always 1 delivery charge per order
      });
  
       // Create a Stripe checkout session with success & cancel URLs
      const session = await stripe.checkout.sessions.create({
        success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`, // Redirect on successful payment
        cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,  // Redirect on payment failure
        line_items, // Items to be purchased
        mode: "payment", // Mode set to payment
      });
  
       // Send back the Stripe session URL to the frontend for redirection
      res.json({ success: true, session_url: session.url });
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: error.message });
    }
  };
  
  const verifyStripe = async (req,res) => {
    const {orderId, success, userId} = req.body;

    try {
      if(success === "true"){
        await orderModel.findByIdAndUpdate(orderId, {payment: true})

        await userModel.findByIdAndDelete(userId, {cartData: {}})

        res.json({success:true})
      } else{
        await orderModel.findByIdAndDelete(orderId)
        res.json({success:false})
      }
    } catch (error) {
      console.log(error);
    
        // Send a failure response with the error message
        res.json({ success: false, message: error.message });
      
    }
    
  }

const allOrders = async (req,res)=> {
    try {
        // Fetch all orders from the database using the order model
        const orders = await orderModel.find({});
    
        // Send a success response to the client, including the retrieved orders
        res.json({ success: true, orders });
    
    } catch (error) {
        // Log the error to the console for debugging
        console.log(error);
    
        // Send a failure response with the error message
        res.json({ success: false, message: error.message });
    }
    
}

// user order data for frontend
const userOrders = async (req, res) => {
    try {
      const { userId } = req.body;
      const orders = await orderModel.find({ userId }).sort({ date: -1 });
      res.json({ success: true, orders });
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: error.message });
    }
  };
  

// update order status from admin
const updateStatus = async (req,res)=> {
    try {
        // Extract the orderId and status from the request body
        const { orderId, status } = req.body;
    
        // Update the status of the specified order in the database
        await orderModel.findByIdAndUpdate(orderId, { status });
    
        // Send a success response to the client indicating the status was updated
        res.json({ success: true, message: 'Status Updated' });
    
    } catch (error) {
        // Log the error to the console for debugging
        console.log(error);
    
        // Send a failure response with the error message
        res.json({ success: false, message: error.message });
    }
    
    
}

export {placeOrder,verifyStripe, placeOrderStripe, userOrders, updateStatus, allOrders}