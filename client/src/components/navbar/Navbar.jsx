import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../utils/firebase";
import "./Navbar.scss";

// You can set this to your actual API if hosted
const API_BASE = import.meta.env.VITE_API_BASE;

function Navbar() {
  const [active, setActive] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isActive = () => {
    setActive(window.scrollY > 0);
  };

  useEffect(() => {
    window.addEventListener("scroll", isActive);
    return () => window.removeEventListener("scroll", isActive);
  }, []);

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("currentUser");
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Resolve profile image path
  const profileImage =
    currentUser?.photoURL?.startsWith("http") ? currentUser.photoURL :
    currentUser?.img?.startsWith("http") ? currentUser.img :
    currentUser?.photoURL?.startsWith("/uploads/")
      ? `${API_BASE}${currentUser.photoURL}`
      : currentUser?.img?.startsWith("/uploads/")
      ? `${API_BASE}${currentUser.img}`
      : "/img/noavatar.jpg";

  return (
    <div className={active || pathname !== "/" ? "navbar active" : "navbar"}>
      <div className="container">
        <div className="logo">
          <Link className="link" to="/">
            <span className="text">ExpertConnect</span>
          </Link>
          <span className="dot">.</span>
        </div>

        <div className="links">
          <Link to="/explore" className="link">
            <span>Explore</span>
          </Link>
          
<Link to="/about" className="link">
  <span>About</span>
</Link>
          {currentUser?.uid ? (
            <div className="user" onClick={() => setOpen(!open)}>
              <img src={profileImage} alt="avatar" />
              <span>{currentUser.username || "User"}</span>

              {open && (
                <div className="options">
                  {currentUser?.isSeller === true && (
                    <>
                      <Link className="link" to={`/seller/${currentUser.uid}`}>
                        Profile
                      </Link>
                      <Link className="link" to="/mygigs">
                        Gigs
                      </Link>
                      <Link className="link" to="/add">
                        Add New Gig
                      </Link>
                    </>
                  )}

                  <Link className="link" to="/orders">
                    Orders
                  </Link>
                  <Link className="link" to="/messages">
                    Messages
                  </Link>
                  <Link className="link" to="/settings">Settings</Link>

                  <Link className="link" onClick={handleLogout}>
                    Logout
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="link">
                Sign in
              </Link>
              <Link className="link" to="/register">
                <button>Join</button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
