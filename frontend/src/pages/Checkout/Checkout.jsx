import React, { useContext, useState } from "react";
import "./Checkout.css";
import stripe from "../../assets/stripe_logo.png";
import CartTotal from "../../components/CartTotal/CartTotal";
import { FoodContext } from "../../context/FoodContext";
import axios from "axios";
import { backendUrl } from "../../App";
import { toast } from "react-toastify";
import BankTransferModal from "../../components/BankTransferModal/BankTrasferModal";

const Checkout = () => {
  const [method, setMethod] = useState("cod");
  const [showBankModal, setShowBankModal] = useState(false);
  const [proofFile, setProofFile] = useState(null);

  const {
    cartItems,
    setCartItems,
    getCartAmount,
    delivery_fee,
    token,
    navigate,
    products,
  } = useContext(FoodContext);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    zipcode: "",
    state: "",
    phone: "",
    country: "",
  });

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setFormData((data) => ({
      ...data,
      [name]: value,
    }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      let orderItems = [];

      // FIX: Anggap cartItems adalah objek flat: { productId: jumlah }
      for (const productId in cartItems) {
        if (cartItems[productId] > 0) {
          const product = products.find((p) => p._id === productId);
          if (!product) {
            toast.error(`Product with ID ${productId} not found`);
            return;
          }

          const itemInfo = structuredClone(product);
          itemInfo.quantity = cartItems[productId];
          orderItems.push(itemInfo);
        }
      }

      let orderData = {
        address: formData,
        items: orderItems,
        amount: getCartAmount() + delivery_fee,
      };

      switch (method) {
        case "cod": {
          const response = await axios.post(
            backendUrl + "/api/order/place",
            orderData,
            { headers: { token } }
          );

          if (response.data.success) {
            setCartItems({});
            navigate("/orders");
          } else {
            toast.error(response.data.message);
          }
          break;
        }

        case "stripe": {
          const responseStripe = await axios.post(
            backendUrl + "/api/order/stripe",
            orderData,
            { headers: { token } }
          );

          if (responseStripe.data.success) {
            const { session_url } = responseStripe.data;
            window.location.replace(session_url);
          } else {
            toast.error(responseStripe.data.message);
          }
          break;
        }

        case "Transfer Bank": {
          if (!proofFile) return toast.error("Upload proof of payment");

          const formDataBank = new FormData();
          formDataBank.append("proofImage", proofFile);
          formDataBank.append("items", JSON.stringify(orderItems));
          formDataBank.append("amount", getCartAmount() + delivery_fee);
          formDataBank.append("address", JSON.stringify(formData));

          const res = await axios.post(
            `${backendUrl}/api/order/transfer`,
            formDataBank,
            {
              headers: { token, "Content-Type": "multipart/form-data" },
            }
          );

          if (res.data.success) {
            setCartItems({});
            navigate("/orders");
          } else {
            toast.error(res.data.message);
          }

          break;
        }

        default:
          toast.error("Invalid payment method selected.");
          break;
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Order failed.");
    }
  };

  return (
    <div>
      <form className="form-container" onSubmit={onSubmitHandler}>
        <div className="form-left">
          <fieldset className="payment-method">
            <legend>Payment Options</legend>
            <div className="payment-options">
              <div
                onClick={() => setMethod("stripe")}
                className={`payment-option ${
                  method === "stripe" ? "selected" : ""
                }`}
              >
                <img src={stripe} alt="" className="payment-logo" />
              </div>
              <div
                onClick={() => setMethod("cod")}
                className={`payment-option ${
                  method === "cod" ? "selected" : ""
                }`}
              >
                <span className="payment-text">CASH ON DELIVERY</span>
              </div>
              <div
                onClick={() => {
                  setMethod("Transfer Bank");
                  setShowBankModal(true);
                }}
                className={`payment-option ${
                  method === "Transfer Bank" ? "selected" : ""
                }`}
              >
                <span className="payment-text">BANK TRANSFER</span>
              </div>
            </div>
          </fieldset>

          <div className="form-title">
            <h2>Shipping Address</h2>
          </div>
          <div className="form-row">
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={onChangeHandler}
              className="form-input"
              placeholder="First Name"
              required
            />
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={onChangeHandler}
              className="form-input"
              placeholder="Last Name"
              required
            />
          </div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={onChangeHandler}
            className="form-input"
            placeholder="Email Address"
            required
          />
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={onChangeHandler}
            className="form-input"
            placeholder="Phone Number"
            required
          />
          <input
            type="text"
            name="street"
            value={formData.street}
            onChange={onChangeHandler}
            className="form-input"
            placeholder="Street Address"
            required
          />
          <div className="form-row">
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={onChangeHandler}
              className="form-input"
              placeholder="City"
              required
            />
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={onChangeHandler}
              className="form-input"
              placeholder="State"
              required
            />
          </div>
          <div className="form-row">
            <input
              type="text"
              name="zipcode"
              value={formData.zipcode}
              onChange={onChangeHandler}
              className="form-input"
              placeholder="Zipcode"
              required
            />
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={onChangeHandler}
              className="form-input"
              placeholder="Country"
              required
            />
          </div>
        </div>

        <div className="form-right">
          <CartTotal />
          <div className="form-submit">
            <button type="submit" className="submit-button">
              PLACE ORDER
            </button>
          </div>
        </div>
      </form>
      {showBankModal && (
        <BankTransferModal
          onClose={() => setShowBankModal(false)}
          onFileChange={(e) => setProofFile(e.target.files[0])}
          onDone={() => setShowBankModal(false)} 
        />
      )}
    </div>
  );
};

export default Checkout;
