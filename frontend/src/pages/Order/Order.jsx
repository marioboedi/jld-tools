import React, { useContext, useEffect, useState } from "react";
import { FoodContext } from "../../context/FoodContext";
import axios from "axios";
import { backendUrl } from "../../App";
import "./Order.css";

const Order = () => {
  const { token, currency } = useContext(FoodContext);

  const [orderData, setOrderData] = useState([]);
  const [sortOrder, setSortOrder] = useState("desc"); // desc = terbaru
  const [filterDate, setFilterDate] = useState("");

  const loadOrderData = async () => {
    try {
      if (!token) return;

      const response = await axios.post(
        backendUrl + "/api/order/userorders",
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        let orders = response.data.orders;

        // Filter berdasarkan tanggal
        if (filterDate) {
          orders = orders.filter(
            (order) =>
              new Date(order.date).toLocaleDateString() ===
              new Date(filterDate).toLocaleDateString()
          );
        }

        // Urutkan berdasarkan tanggal
        orders.sort((a, b) =>
          sortOrder === "desc"
            ? new Date(b.date) - new Date(a.date)
            : new Date(a.date) - new Date(b.date)
        );

        setOrderData(orders);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadOrderData();
  }, [token, sortOrder, filterDate]);
  return (
    <div>
      <div className="order-container">
        <div className="order-filter">
          <label>Sort by: </label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="desc">Terbaru</option>
            <option value="asc">Terlama</option>
          </select>

          <label>Filter by Date: </label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
          {/* <button onClick={loadOrderData}>Apply Filter</button> */}
        </div>

        <div className="order-title">
          <h1>My Orders</h1>
        </div>
        <div>
          {orderData.map((order, orderIndex) => (
            <div className="order-container-group" key={orderIndex}>
              <h3>Order Date: {new Date(order.date).toLocaleString()}</h3>
              <p>
                Payment: {order.paymentMethod} -{" "}
                {order.payment ? "Done" : "Pending"}
              </p>
              <p>Status: {order.status}</p>
              <div className="order-item-list">
                {order.items.map((item, itemIndex) => (
                  <div className="order-item-container" key={itemIndex}>
                    <div className="order-item-details">
                      <img
                        src={item.image}
                        alt=""
                        className="order-item-image"
                      />
                      <div>
                        <p className="order-item-name">{item.name} </p>
                        <div className="order-item-info">
                          <p>
                            {currency}
                            {item.price.toLocaleString('id-ID')}
                          </p>
                          <p>Quantity: {item.quantity}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Order;
