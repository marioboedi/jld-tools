import express from 'express'
import adminAuth from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'
import {placeOrder,verifyStripe, placeOrderStripe, allOrders,userOrders, updateStatus} from '../controllers/orderControllers.js'

const orderRouter = express.Router()

orderRouter.post('/list',adminAuth, allOrders)
orderRouter.post('/status', adminAuth, updateStatus)

orderRouter.post('/place', authUser, placeOrder)
orderRouter.post('/stripe', authUser, placeOrderStripe)

orderRouter.post('/userorders', authUser, userOrders)

orderRouter.post('verifyStripe', authUser, verifyStripe)
// /verifyStripe

export default orderRouter
