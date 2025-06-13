import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import { Route, Routes } from "react-router-dom";
import Add from "./pages/Add/Add";
import List from "./pages/List/List";
import Orders from "./pages/Orders/Orders";
import SalesReport from "./pages/Sales/SalesReport";
import Login from "./components/Login/Login";
import { ToastContainer, toast as _toast } from "react-toastify";


export const backendUrl = "https://jld-tools-api.vercel.app/"
export const currency = "Rp."

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || "");

  useEffect(()=>{
    localStorage.setItem('token', token)
  },[token])
  return (
    <div className="app-container">
      <ToastContainer />
      {token === "" ? (
        <Login setToken={setToken}/>
      ) : (
        <>
          <div className="app_content">
            <Sidebar setToken={setToken}/>
            <div className="page-content">
              <Routes>
                <Route path="/add" element={<Add token={token}/>} />
                <Route path="/list" element={<List token={token}/>} />
                <Route path="/orders" element={<Orders token={token}/>} />
                <Route path="/sales-report" element={<SalesReport token={token} />} />
              </Routes>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
