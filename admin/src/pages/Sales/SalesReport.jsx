import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Pie, Line } from "react-chartjs-2";
import { toast } from "react-toastify";
import { backendUrl } from "../../App";
import "./SalesReport.css";

import {
  Chart as ChartJS,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  LineController,
} from "chart.js";

ChartJS.register(
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  LineController
);

const SalesReport = ({ token }) => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
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
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to fetch orders");
      }
    };

    fetchOrders();
  }, [token]);

  const generateColors = (num) => {
    const colors = [
      "rgba(255, 0, 0, 0.8)",
      "rgba(220, 20, 60, 0.8)",
      "rgba(255, 69, 58, 0.8)",
      "rgba(255, 99, 132, 0.8)",
      "rgba(200, 0, 0, 0.8)",
      "rgba(178, 34, 34, 0.8)",
      "rgba(255, 80, 80, 0.8)",
      "rgba(255, 105, 97, 0.8)",
      "rgba(255, 127, 127, 0.8)",
      "rgba(255, 153, 153, 0.8)",
    ];
    return Array.from({ length: num }, (_, i) => colors[i % colors.length]);
  };

  // Chart 1: Sales by Date
  const getLast30Days = () => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split("T")[0]);
    }
    return days;
  };

  const last30Days = getLast30Days();

  const filteredOrders = orders.filter(
    (order) => new Date(order.date) >= new Date(last30Days[0])
  );

  const salesByDate = filteredOrders.reduce((acc, order) => {
    const dateKey = new Date(order.date).toISOString().split("T")[0];
    acc[dateKey] = (acc[dateKey] || 0) + order.amount;
    return acc;
  }, {});

  const salesDataArray = last30Days.map((date) => salesByDate[date] || 0);

  const salesByDateChartData = {
    labels: last30Days,
    datasets: [
      {
        label: "Sales (in currency)",
        data: salesDataArray,
        fill: true,
        borderColor: "rgba(255, 69, 58, 0.8)",
        backgroundColor: "rgba(255, 0, 0, 0.8)",
        tension: 0.3,
        pointRadius: 3,
      },
    ],
  };

  // Chart 2: Orders by Status
  const statusCount = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  const ordersByStatusChartData = {
    labels: Object.keys(statusCount),
    datasets: [
      {
        label: "Orders Count",
        data: Object.values(statusCount),
        backgroundColor: generateColors(Object.keys(statusCount).length),
      },
    ],
  };

  // Chart 3: Payment Method Distribution
  const paymentMethodCount = orders.reduce((acc, order) => {
    acc[order.paymentMethod] = (acc[order.paymentMethod] || 0) + 1;
    return acc;
  }, {});

  const paymentMethodChartData = {
    labels: Object.keys(paymentMethodCount),
    datasets: [
      {
        label: "Payment Methods",
        data: Object.values(paymentMethodCount),
        backgroundColor: generateColors(Object.keys(paymentMethodCount).length),
      },
    ],
  };

  // Chart 4: Top Products Quantity
  const productCount = {};
  orders.forEach((order) => {
    order.items.forEach((item) => {
      productCount[item.name] = (productCount[item.name] || 0) + item.quantity;
    });
  });

  // Convert to array, sort, and take top 10
  const topProducts = Object.entries(productCount)
    .sort((a, b) => b[1] - a[1]) // Sort descending by quantity
    .slice(0, 10); // Take top 10

  const topProductsChartData = {
    labels: topProducts.map(([name]) => name),
    datasets: [
      {
        label: "Product Quantities",
        data: topProducts.map(([, quantity]) => quantity),
        backgroundColor: generateColors(topProducts.length),
      },
    ],
  };

  return (
    <div className="sales-report">
      <h3>Sales Report</h3>
      <div className="chart-container">
        <div className="chart-item">
          <h4>Sales by Date (Last 30 Days)</h4>
          <Line
            data={salesByDateChartData}
            options={{
              responsive: true,
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (context) =>
                      `Rp ${context.parsed.y.toLocaleString()}`,
                  },
                },
              },
              scales: {
                x: {
                  ticks: {
                    maxRotation: 45,
                    minRotation: 45,
                    maxTicksLimit: 10,
                  },
                },
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value) => `Rp ${value.toLocaleString()}`,
                  },
                },
              },
            }}
          />
        </div>

        <div className="chart-item">
          <h4>Orders by Status</h4>
          <Pie
            data={ordersByStatusChartData}
            options={{ maintainAspectRatio: false }}
          />
        </div>

        <div className="chart-item">
          <h4>Payment Method Distribution</h4>
          <Pie
            data={paymentMethodChartData}
            options={{ maintainAspectRatio: false }}
          />
        </div>

        <div className="chart-item">
          <h4>Top Products Quantity</h4>
          <Bar
            data={topProductsChartData}
            options={{
              indexAxis: "y", // <--- ini membuat chart horizontal
              maintainAspectRatio: false,
              responsive: true,
              scales: {
                x: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value) => value.toLocaleString(), // Tambahan: format angka
                  },
                },
                y: {
                  ticks: {
                    autoSkip: false, // agar semua label muncul
                  },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SalesReport;
