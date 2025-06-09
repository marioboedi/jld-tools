import productModel from '../models/productModels.js'
import {v2 as cloudinary} from 'cloudinary'

const addProduct = async(req,res) => {
    try {
        const {name, price, description, category, stock} = req.body
        const image = req.file;
        if(!image){
            return res.json({success:false, message: "Please upload an image"})
        }

        // Validasi harga tidak boleh nol
        if (Number(price) <= 0) {
            return res.json({ success: false, message: "Harga produk tidak boleh Rp 0" });
        }

        // Cek apakah nama produk sudah ada
        const existingProduct = await productModel.findOne({ name });
        if (existingProduct) {
            return res.json({ success: false, message: "Produk dengan nama yang sama sudah ada" });
        }

        let result = await cloudinary.uploader.upload(image.path, {resource_type: 'image'})

        const productData = {
            name, 
            description, 
            category, 
            price: Number(price),
            stock: Number(stock),
            // image: imageUrl,
            image: result.secure_url,
            date: Date.now()
        }

        console.log(productData);

        const product = new productModel(productData)
        await product.save();

        res.json({success:true, message:" Product added successfully"})
        
        
    } catch (error) {
        console.log(error);
        res.json({sucess:false, message: "Could not add product"})
        
        
    }
}

const listProduct = async(req,res)=> {
    try {
        const products = await productModel.find({})
        res.json({success:true, products})
        
    } catch (error) {
        console.log(error);
        res.json({success:false, message:error.message})
        
        
    }
}

const removeProduct = async(req,res)=> {
    try {
        await productModel.findByIdAndDelete(req.body._id)
        res.json({success:true, message: "Product removed"})
        
    } catch (error) {
        console.log(error);
        res.json({success:false, message: error.message})
        
        
    }
}

const singleProduct = async(req,res)=> {
    try {
        const {productId} = req.body;

        const product = await productModel.findById(productId)
        res.json({success:true, product})
        
    } catch (error) {
        console.log(error);
        res.json({success:false, message: error.message})
        
    }
}

const updateProduct = async (req, res) => {
    try {
        const { _id, name, description, category, price, stock } = req.body;

        if (!name) {
            return res.json({ success: false, message: "Nama tidak boleh kosong" });
        }

        if (!description) {
            return res.json({ success: false, message: "Deskripsi tidak boleh kosong" });
        }


        // Validasi harga tidak boleh 0
        if (Number(price) <= 0) {
        return res.json({ success: false, message: "Harga produk tidak boleh Rp 0" });
        }

        // Cek apakah nama produk yang baru sama dengan produk lain (tidak termasuk dirinya sendiri)
        const existingProduct = await productModel.findOne({ name, _id: { $ne: _id } });
        if (existingProduct) {
        return res.json({ success: false, message: "Produk dengan nama yang sama sudah ada" });
        }

        const updateData = {
            name,
            description,
            category,
            price: Number(price),
            stock: Number(stock),
        };

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                resource_type: 'image',
            });
            updateData.image = result.secure_url;
        }

        await productModel.findByIdAndUpdate(_id, updateData);
        res.json({ success: true, message: "Product updated successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


export {addProduct, listProduct, removeProduct, singleProduct, updateProduct}