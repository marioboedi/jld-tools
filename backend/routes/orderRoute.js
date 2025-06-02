import express from 'express'
import adminAuth from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'
import upload from '../middleware/multer.js'
import {placeOrder,verifyStripe, placeOrderStripe, allOrders,userOrders, updateStatus, updatePaymentStatus, placeOrderBankTransfer} from '../controllers/orderControllers.js'

const orderRouter = express.Router()

orderRouter.post('/list',adminAuth, allOrders)
orderRouter.post('/status', adminAuth, updateStatus)

orderRouter.post('/place', authUser, placeOrder)
orderRouter.post('/stripe', authUser, placeOrderStripe)

orderRouter.post('/userorders', authUser, userOrders)

orderRouter.post('/verifyStripe', authUser, verifyStripe)
// /verifyStripe

orderRouter.post('/payment-status', adminAuth, updatePaymentStatus)

orderRouter.post(
  '/transfer',
  upload.single("proofImage"), // Multer dulu
  authUser,                    // Auth sesudah multer
  placeOrderBankTransfer       // Handler
);



export default orderRouter
