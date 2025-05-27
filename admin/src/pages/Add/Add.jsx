import React, { useState } from "react";
import upload_img from "../../assets/upload_img.png";
import './Add.css';
import axios from "axios";
import { backendUrl } from "../../App";
import { toast } from "react-toastify";

const Add = ({ token }) => {
    const [image, setImage] = useState(null);  // Stores the selected image file
    const [name, setName] = useState("");  // Stores the product name
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("All"); // Stores the selected category, defaulting to "All"

    const onSubmitHandler = async (e) => {
        e.preventDefault();  // Prevents the default form submission behavior

        try {
            // Create a new FormData object to send form data in multipart format
            const formData = new FormData();
            formData.append("name", name); // Add product name
            formData.append("description", description);
            formData.append("price", price);
            formData.append("category", category);
            if (image) formData.append("image", image);  // Add image only if selected

            // Send a POST request to add the product
            const response = await axios.post(`${backendUrl}/api/product/add`, formData, {
                headers: { token },  // Include authentication token in the request header
            });

            // Check if the request was successful
            if (response.data.success) {
                toast.success(response.data.message);
                 // Reset input fields after successful submission
                setName("");
                setDescription("");
                setPrice("");
                setImage(null);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    return (
        <form onSubmit={onSubmitHandler} className="form-container">
            <div>
                <p className="form-label">Upload Image</p>
                <div className="image-upload-container">
                    <label htmlFor="image">
                        <img
                        // if image is not available i.e not image, use a default placeholder image to represent the image when no image is selected
                        // and if the image is selected and uploaded,create a temporary URL for the selected image file, allowing it to be previewed before uploading.
                            src={!image ? upload_img : URL.createObjectURL(image)}
                            alt=""
                            className="upload-preview"
                        />
                        <input
                            onChange={(e) => setImage(e.target.files[0])}
                            type="file"
                            id="image"
                            hidden
                        />
                    </label>
                </div>
            </div>
            <div className="form-group">
                <p className="form-label">Product Name</p>
                <input
                    type="text"
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                    placeholder="Enter product name"
                    className="form-input"
                    required
                />
            </div>
            <div className="form-group">
                <p className="form-label">Product Description</p>
                <textarea
                    type="text"
                    placeholder="Type product description"
                    onChange={(e) => setDescription(e.target.value)}
                    value={description}
                    className="form-input"
                    required
                />
            </div>
            <div className="form-group-horizontal">
                <div>
                    <p className="form-label">Product Category</p>
                    <select
                        onChange={(e) => setCategory(e.target.value)}
                        value={category}
                        className="form-select"
                    >
                        <option value="All">All</option>
                        <option value="Cordless Drill">Cordless Drill</option>
                        <option value="Impact Driver">Impact Driver</option>
                        <option value="Electric Hand Saw">Electric Hand Saw</option>
                        <option value="Rotary Hammer">Rotary Hammer</option>
                        <option value="Lithium Electric Set">Lithium Electric Set</option>
                        <option value="Angle Grinder">Angle Grinder</option>
                        <option value="Lawn Mover">Lawn Mover</option>
                        <option value="Lithium Electric Drill">Lithium Electric Drill</option>
                        <option value="Circular Saw">Circular Saw</option>
                        <option value="Hand Tools">Hand Tools</option>
                        <option value="Others">Others</option>
                    </select>
                </div>
                <div>
                    <p className="form-label">Product Price</p>
                    <input
                        type="number"
                        className="form-input price-input"
                        onChange={(e) => setPrice(e.target.value)}
                        value={price}
                        placeholder="30"
                    />
                </div>
            </div>
            <button type="submit" className="submit-button">ADD PRODUCT</button>
        </form>
    );
};

export default Add;
