import React from 'react'
import {FaFacebook, FaInstagram, FaYoutube} from 'react-icons/fa'
import './Footer.css'

const Footer = () => {
  return (
    <div>
      <div className="footer">
        
        <div className="footer-bottom">
          <div className="footer-left">
            <h2>JLD Tools</h2>
            
          </div>
          <div className="footer-right">
            <ul>
              <div className='socials'>
              <FaFacebook className='social-icon'/>
              <FaInstagram className='social-icon'/>
              <FaYoutube className='social-icon'/>
            </div>
            </ul>
          </div>
        </div>
        <p className="copy">© 2024 JLDtools. All rights reserved.</p>
      </div>
    </div>
  )
}

export default Footer