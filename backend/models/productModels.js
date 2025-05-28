import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {type:String, required:true},
    price: {type:Number, required:true},
    description: {type:String, required:true},
    image: {type:String, required:true},
    category: {type:String, required:true},
    stock: {type: Number, required: true, default: 0, min: [0, 'Stock cannot be negative']},
    date: {type:Number, required:true}
})

const productModel = mongoose.models.product || mongoose.model('product', productSchema)

export default productModel