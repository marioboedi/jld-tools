import userModel from "../models/userModels.js"


// function to add product to user cart
const addToCart = async (req, res) => {
    try {
      const { userId, itemId } = req.body;
  
      // Fetch user data by ID
      const userData = await userModel.findById(userId);
      // Initialize cartData if it's missing
      let cartData = await userData.cartData;
  
      // Check if user exists
      if (!userData) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
  
      // Check if the product with the given `itemId` already exists in the `cartData`
  if (cartData[itemId]) {
    // If the product exists, increment the quantity by 1
    cartData[itemId] += 1;
  } else {
    // If the product doesn't exist in the cart, initialize it with a quantity of 1
    cartData[itemId] = 1;
  }
  
  
      // Update the user's `cartData` in the database using the user's `userId`
      await userModel.findByIdAndUpdate(userId, { cartData });
  
      // Send a JSON response indicating success and a confirmation message
      res.json({ success: true, message: "Product added to cart" });
    } catch (error) {
      console.log("Error:", error);
      res.json({ success: false, message: error.message });
    }
  };




const updateCart = async(req,res)=>{
    try {
        const {userId, itemId, quantity} = req.body

        const userData = await userModel.findById(userId);

        let cartData = await userData.cartData

         if (quantity === 0) {
            delete cartData[itemId]; // Hapus item dari cart
          } else {
            cartData[itemId] = quantity;
          }

        await userModel.findByIdAndUpdate(userId, {cartData})

        res.json({success:true, message: "Cart updated"})
    } catch (error) {
        console.log(error);
        res.json({success:false, message:error.message})
        
    }

}

const getUserCart = async(req,res)=>{

    try {
        const {userId}= req.body

        const userData = await userModel.findById(userId);
        if(!userData){
            return res.json({success:false, message: "user not found"})
        }

        const cartData = userData.cartData

        res.json({success:true, cartData})
    } catch (error) {
        console.log(error);
        res.json({success:false, message:error.message})
    }

}


export {addToCart, updateCart, getUserCart}