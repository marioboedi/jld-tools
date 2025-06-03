import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../../App";
import { toast } from "react-toastify";
import "./Orders.css";
import ProofModal from "../../components/ProofModal/ProofModal";

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedDate, setSelectedDate] = useState(""); // filter tanggal
  const ordersPerPage = 5;

  const [modalImageUrl, setModalImageUrl] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [filterPaymentMethod, setFilterPaymentMethod] = useState("");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("");
  const [filterDeliveryStatus, setFilterDeliveryStatus] = useState("");


  const openModal = (imageUrl) => {
    setModalImageUrl(imageUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalImageUrl("");
  };

  const fecthAllOrders = async () => {
    if (!token) return;
    try {
      const response = await axios.post(
        backendUrl + "/api/order/list",
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        setOrders(response.data.orders);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/order/status",
        { orderId, status: event.target.value },
        { headers: { token } }
      );
      if (response.data.success) {
        await fecthAllOrders();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    }
  };

  const paymentStatusHandler = async (event, orderId) => {
    try {
      const newValue = event.target.value === "true";
      const response = await axios.post(
        backendUrl + "/api/order/payment-status",
        { orderId, payment: newValue },
        { headers: { token } }
      );
      if (response.data.success) {
        await fecthAllOrders();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update payment status");
    }
  };

  useEffect(() => {
    fecthAllOrders();
  }, [token]);

  // Sort & filter
  const sortedOrders = [...orders]
  .filter((order) => {
    const orderDate = new Date(order.date).toISOString().split("T")[0];
    const matchDate = !selectedDate || orderDate === selectedDate;
    const matchPaymentMethod = !filterPaymentMethod || order.paymentMethod === filterPaymentMethod;
    const matchPaymentStatus =
      filterPaymentStatus === ""
        ? true
        : order.payment.toString() === filterPaymentStatus;
    const matchDeliveryStatus =
      !filterDeliveryStatus || order.status === filterDeliveryStatus;

    return (
      matchDate && matchPaymentMethod && matchPaymentStatus && matchDeliveryStatus
    );
  })
  .sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });


  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = sortedOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(sortedOrders.length / ordersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div>
      <h3 className="order-title">All Orders</h3>

      <div className="order-sort">
        <label htmlFor="sort">Sort by Date: </label>
        <select
          id="sort"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>

        <label htmlFor="filter-date" style={{ marginLeft: "1rem" }}>
          Filter by Specific Date:{" "}
        </label>
        <input
          type="date"
          id="filter-date"
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setCurrentPage(1); // Reset ke halaman pertama saat filter diterapkan
          }}
        />
        {selectedDate && (
          <button
            onClick={() => setSelectedDate("")}
            style={{ marginLeft: "0.5rem" }}
          >
            Clear Filter
          </button>
        )}
      </div>

      <div className="order-filter">
        <label htmlFor="filter-payment-method">Payment Method:</label>
        <select
          id="filter-payment-method"
          value={filterPaymentMethod}
          onChange={(e) => {
            setFilterPaymentMethod(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">All</option>
          <option value="Transfer Bank">Transfer Bank</option>
          <option value="COD">COD</option>
          <option value="Stripe">STRIPE</option>
        </select>

        <label htmlFor="filter-payment-status" style={{ marginLeft: "1rem" }}>Payment Status:</label>
        <select
          id="filter-payment-status"
          value={filterPaymentStatus}
          onChange={(e) => {
            setFilterPaymentStatus(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">All</option>
          <option value="true">Done</option>
          <option value="false">Pending</option>
        </select>

        <label htmlFor="filter-delivery-status" style={{ marginLeft: "1rem" }}>Delivery Status:</label>
        <select
          id="filter-delivery-status"
          value={filterDeliveryStatus}
          onChange={(e) => {
            setFilterDeliveryStatus(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">All</option>
          <option value="Order Placed">Order Placed</option>
          <option value="Packing">Packing</option>
          <option value="Shipped">Shipped</option>
          <option value="Out for Delivery">Out for Delivery</option>
          <option value="Delivered">Delivered</option>
        </select>
      </div>


      <p className="order-total">Total Orders: {sortedOrders.length}</p>

      <div className="order-container">
        <table className="order-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Email</th>
              <th>Telephone</th>
              <th>Shipping Address</th>
              <th>Product Name</th>
              <th>Quantity</th>
              <th>Items</th>
              <th>Price</th>
              <th>Payment Method</th>
              <th>Payment Status</th>
              <th>Date</th>
              <th>Delivery Status</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.map((order, index) => (
              <tr key={index}>
                <td>{order.address.firstName}</td>
                <td>{order.address.email}</td>
                <td>{order.address.phone}</td>
                <td>
                  {order.address.street}, {order.address.city},{" "}
                  {order.address.state}, {order.address.country},{" "}
                  {order.address.zipcode}
                </td>
                <td>
                  {order.items.map((item, i) => (
                    <p key={i}>{item.name}</p>
                  ))}
                </td>
                <td>
                  {order.items.map((item, i) => (
                    <p key={i}>{item.quantity}</p>
                  ))}
                </td>
                <td>{order.items.length}</td>
                <td>
                  {currency}
                  {order.amount.toLocaleString("id-ID")}
                </td>
                <td>
                  {order.paymentMethod === "Transfer Bank" ? (
                    <>
                      TRANSFER BANK <br />
                      <button
                        onClick={() => openModal(order.proofImage)}
                        className="view-proof-button"
                      >
                        View Proof
                      </button>
                    </>
                  ) : (
                    order.paymentMethod.toUpperCase()
                  )}
                </td>

                <td>
                  <select
                    onChange={(event) => paymentStatusHandler(event, order._id)}
                    value={order.payment ? "true" : "false"}
                    className="order-status"
                  >
                    <option value="false">Pending</option>
                    <option value="true">Done</option>
                  </select>
                </td>

                <td>{new Date(order.date).toLocaleString()}</td>
                <td>
                  <select
                    onChange={(event) => statusHandler(event, order._id)}
                    value={order.status}
                    className="order-status"
                  >
                    <option value="Order Placed">Order Placed</option>
                    <option value="Packing">Packing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => paginate(i + 1)}
            className={currentPage === i + 1 ? "active" : ""}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <ProofModal
        imageUrl={modalImageUrl}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
};

export default Orders;
