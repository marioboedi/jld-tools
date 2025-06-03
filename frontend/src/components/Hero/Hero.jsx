import React from 'react'
import './Hero.css'
import hero_img from '../../assets/jld-gedung.png'
import { FaShippingFast, FaWhatsapp } from 'react-icons/fa'
import { BiSupport } from 'react-icons/bi'
import { MdPayment } from 'react-icons/md'

const Hero = () => {
  return (
    <section className="hero">

      <div className="hero_image_full">
        <img src={hero_img} alt="Hero" className="hero-img-full" />
      </div>
      <div className="hero_text">
        <h2>"Tools That Cut. Weld. Build."</h2>
        <div className="hero_titles">
          <span>EQUIP</span>
          <span>-</span>
          <span>BUILD</span>
          <span>-</span>
          <span>ACHIEVE</span>
        </div>

        <a 
          href="https://wa.link/aobdev" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="whatsapp_button"
        >
          <FaWhatsapp className="wa_icon" />
          Contact Us
        </a>
      </div>

      <div className="features_grid">
        <div className="feature_card">
          <FaShippingFast className="feature_icon" />
          <div>
            <h3>Nationwide Shipping</h3>
            <p>We deliver to every corner of Indonesia</p>
          </div>
        </div>

        <div className="feature_card">
          <BiSupport className="feature_icon" />
          <div>
            <h3>Responsive Support</h3>
            <p>Fast and helpful customer service</p>
          </div>
        </div>

        <div className="feature_card">
          <MdPayment className="feature_icon" />
          <div>
            <h3>Trusted Quality</h3>
            <p>Reliable and guaranteed products only</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
