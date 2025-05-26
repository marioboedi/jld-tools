import React, { useContext, useState } from "react";
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { BiCart, BiUser } from "react-icons/bi";
import { FoodContext } from "../../context/FoodContext";
import { FaCentos } from "react-icons/fa";
import jld_logo from '../../assets/jld-logo.png'


const Navbar = () => {
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const logout = () => {
    navigate("/login");
    localStorage.removeItem("token");
    setToken("");
  };

  const handleNavigation = (path) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
    navigate(path);
  };

  const { getCartCount, setToken } = useContext(FoodContext);

  return (
    <div>
      {loading && (
        <div className="loader-container">
          <div className="loader">
            <FaCentos className="loader-icon" />
          </div>
        </div>
      )}
      <nav className="navbar">
        <div>
          <Link to="/">
              <img src={jld_logo} alt="Logo" style={{ height: '100px' }} />
          </Link>
        </div>

        <div className="icons">
          <Link to="/login" className="menu-item">
            Login/Sign Up
          </Link>
          <Link to="/orders" className="menu-item">
            Orders
          </Link>
          <p
            onClick={logout}
            className="menu-item"
            style={{ cursor: "pointer" }}
          >
            Logout
          </p>
          <button
            className="cart-icon"
            onClick={() => handleNavigation("/cart")}
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <BiCart className="icon" />
            <span className="cart-qty">{getCartCount()}</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
