import orderModel from '../models/orderModels.js';
import userModel from '../models/userModels.js';
import productModel from '../models/productModels.js';
import Stripe from 'stripe';
import { v2 as cloudinary } from 'cloudinary';


//GATEWAY INITIALIZE
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// global variables
const currency = 'usd'; // Stripe default, tidak error minimum
const deliveryChargeIDR = 12000; // Rp
const exchangeRate = 15000; // 1 USD = Rp15.000
const deliveryChargeUSD = deliveryChargeIDR / exchangeRate; // ~0.8 USD

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
          Object.entries(userData.cartData)
            .filter(([_, quantity]) => quantity > 0) // hanya ambil item dengan quantity > 0
            .map(async ([itemId, quantity]) => {

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

        await Promise.all(items.map(async (item) => {
          const product = await productModel.findById(item.itemId);
          if (product) {
            product.stock -= item.quantity;
            await product.save();
          }
        }));

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
    const { userId, address } = req.body;
    const { origin } = req.headers;

    // Ambil data user dan cart
    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Ambil detail produk
    const items = await Promise.all(
      Object.entries(userData.cartData)
        .filter(([_, quantity]) => quantity > 0) // hanya ambil item dengan quantity > 0
        .map(async ([itemId, quantity]) => {

        const product = await productModel.findById(itemId);
        if (!product) {
          throw new Error(`Product with ID ${itemId} not found`);
        }
        return {
          itemId,
          name: product.name,
          image: product.image,
          price: product.price,
          quantity,
        };
      })
    );

    if (items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Hitung total harga produk
    const totalProductIDR = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const totalAmountIDR = totalProductIDR + deliveryChargeIDR;

    const totalAmountUSD = totalAmountIDR / exchangeRate;

    // Validasi Stripe minimal $2.00 (200 cent)
    if (totalAmountUSD < 2) {
      return res.status(400).json({
        success: false,
        message: 'Total payment must be at least $2.00 (± Rp30.000)',
      });
    }

    // Simpan order sementara ke database
    const orderData = {
      userId,
      items,
      amount: totalAmountIDR,
      address,
      paymentMethod: 'Stripe',
      payment: false,
      date: Date.now(),
    };
    const newOrder = new orderModel(orderData);
    await newOrder.save();

    // Persiapkan Stripe line_items
    const line_items = items.map((item) => ({
      price_data: {
        currency: currency,
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round((item.price / exchangeRate) * 100), // USD cent
      },
      quantity: item.quantity,
    }));

    // Tambahkan biaya pengiriman
    line_items.push({
      price_data: {
        currency: currency,
        product_data: { name: 'Delivery Charge' },
        unit_amount: Math.round(deliveryChargeUSD * 100), // in cent
      },
      quantity: 1,
    });

    // Buat sesi checkout Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${origin}/verify?success=true&orderId=${newOrder._id}&userId=${userId}`,
      cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}&userId=${userId}`,
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Fungsi verifikasi hasil pembayaran Stripe
const verifyStripe = async (req, res) => {
  const { orderId, success, userId } = req.body;

  try {
    if (success === 'true') {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });

      // Kurangi stok
      const order = await orderModel.findById(orderId);
      if (order && order.items) {
        await Promise.all(order.items.map(async (item) => {
          const product = await productModel.findById(item.itemId);
          if (product) {
            product.stock -= item.quantity;
            await product.save();
          }
        }));
      }

      await userModel.findByIdAndUpdate(userId, { cartData: {} });
      res.json({ success: true, message: 'Payment verified' });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: 'Payment cancelled' });
    }
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

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

const updatePaymentStatus = async (req, res) => {
  try {
    const { orderId, payment } = req.body;

    // Validasi tipe data boolean
    if (typeof payment !== 'boolean') {
      return res.status(400).json({ success: false, message: 'Invalid payment value (should be true/false)' });
    }

    await orderModel.findByIdAndUpdate(orderId, { payment });
    res.json({ success: true, message: 'Payment status updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const placeOrderBankTransfer = async (req, res) => {
  try {
    const { address, amount } = req.body;
    const userId = req.body?.userId ?? req.userId;
    const proof = req.file;

    if (!proof) {
      return res.status(400).json({ success: false, message: "Proof image is required" });
    }

    const result = await cloudinary.uploader.upload(proof.path, { resource_type: "image" });

    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const items = await Promise.all(
      Object.entries(userData.cartData)
        .filter(([_, quantity]) => quantity > 0) // hanya ambil item dengan quantity > 0
        .map(async ([itemId, quantity]) => {

        const product = await productModel.findById(itemId);

        if (!product) {
          throw new Error(`Product with ID ${itemId} not found`);
        }

        return {
          itemId,
          name: product.name,
          image: product.image,
          price: product.price,
          quantity,
        };
      })
    );

    if (items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const orderData = {
      userId,
      items,
      amount,
      address: JSON.parse(address),
      paymentMethod: "Transfer Bank",
      proofImage: result.secure_url,
      payment: false,
      date: Date.now()
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    // Kurangi stok produk sesuai jumlah yang dipesan
    await Promise.all(items.map(async (item) => {
      const product = await productModel.findById(item.itemId);
      if (product) {
        product.stock -= item.quantity;
        await product.save();
      }
    }));

    await userModel.findByIdAndUpdate(userId, { cartData: {} });


    res.json({ success: true, message: "Order placed with bank transfer", order: newOrder });
  } catch (error) {
    console.error("Bank transfer order error:", error);
    res.status(500).json({ success: false, message: "Order failed" });
  }
};

export {placeOrder,verifyStripe, placeOrderStripe, userOrders, updateStatus, allOrders, updatePaymentStatus}