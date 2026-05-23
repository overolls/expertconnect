import React from "react";
import "./Footer.scss";
import ChatPopup from "../chatPopup/ChatPopup";
import { useLocation } from "react-router-dom";

function Footer() {
  const location = useLocation();

  const showChat = ["/", "/mygigs", "/orders", "/messages"].some((p) =>
    location.pathname.startsWith(p)
  );

  return (
    <div className="footer">
      <div className="container">
        <div className="top">
          <div className="item">
            <h2>Categories</h2>
            <span>Graphics & Design</span>
            <span>Digital Marketing</span>
            <span>Writing & Translation</span>
            <span>Video & Animation</span>
                    </div>
          <div className="item">
            <h2>About</h2>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
       
          </div>
          <div className="item">
            <h2>Support</h2>
            <span>Help & Support</span>
            <span>Trust & Safety</span>
          </div>
          <div className="item">
            <h2>Community</h2>
            <span>Community Hub</span>
            <span>Forum</span>
          </div>
          <div className="item">
            <h2>More From ExpertConnect</h2>
            <span>Workspace</span>
            <span>Learn</span>
          </div>
        </div>
        <hr />
        <div className="bottom">
          <div className="left">
            <h2></h2>
            <span>© ExpertConnect 2025</span>
          </div>
          <div className="right">
            <div className="social">
              <img src="/img/twitter.png" alt="" />
              <img src="/img/facebook.png" alt="" />
              <img src="/img/linkedin.png" alt="" />
              <img src="/img/pinterest.png" alt="" />
              <img src="/img/instagram.png" alt="" />
            </div>
            <div className="link">
              <img src="/img/language.png" alt="" />
            </div>
            <img src="/img/accessibility.png" alt="" />
          </div>
        </div>
      </div>

      {/* ✅ ChatPopup only on main pages */}
      {showChat && <ChatPopup />}
    </div>
  );
}

export default Footer;
