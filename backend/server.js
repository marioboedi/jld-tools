import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import userRouter from './routes/userRoute.js'
import productRouter from './routes/productRoute.js'
import cartRouter from './routes/cartRoute.js'
import orderRouter from './routes/orderRoute.js'

const app = express()
const port = process.env.PORT || 4000
connectDB()
connectCloudinary()


app.use(express.json())
app.use(cors({
  origin: ['https://jld-tools-user.vercel.app', 'https://jld-tools-admin.vercel.app'],
  credentials: true
}))
app.use('/api/user', userRouter)
app.use('/api/product', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/order', orderRouter)

app.use((req, res, next) => {
  const allowedOrigins = [
    'https://jld-tools-user.vercel.app',
    'https://jld-tools-admin.vercel.app'
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});



app.get('/', (req,res)=> {
    res.send("API Working")
})

app.listen(port, ()=> console.log('Server started on Port: '+ port))