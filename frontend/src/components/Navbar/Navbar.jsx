import React, { useContext, useState } from "react";
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { BiCart, BiUser } from "react-icons/bi";
import { FoodContext } from "../../context/FoodContext";
import { FaCentos } from "react-icons/fa";
import jld_logo from "../../assets/jld-logo.png";

const Navbar = () => {
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const logout = () => {
    // Hapus token dan name dari localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("name");

    // Reset state di context
    setToken("");
    setUserName("");

    // Arahkan ke halaman login
    navigate("/login");
    window.location.reload();
  };

  const handleNavigation = (path) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
    navigate(path);
  };

  const { getCartCount, setToken, setUserName, token } =
    useContext(FoodContext);

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
            <img src={jld_logo} alt="Logo" style={{ height: "100px" }} />
          </Link>
        </div>

        <div className="icons">
          {!token && (
            <Link to="/login" className="menu-item">
              Login/Sign Up
            </Link>
          )}

          {token && (
            <Link to="/orders" className="menu-item">
              Orders
            </Link>
          )}

          {token && (
            <p
              onClick={logout}
              className="menu-item"
              style={{ cursor: "pointer" }}
            >
              Logout
            </p>
          )}

          {token && (
          <button
            className="cart-icon"
            onClick={() => handleNavigation("/cart")}
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <BiCart className="icon" />
            <span className="cart-qty">{getCartCount()}</span>
          </button>

          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
