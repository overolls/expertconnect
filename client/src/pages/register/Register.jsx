import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../utils/firebase";
import upload from "../../utils/upload"; // ✅ ImgBB uploader
import "./Register.scss";

function Register() {
  const [file, setFile] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "",
    country: "",
    isSeller: false,
    desc: "",
    phone: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSeller = (e) => {
    const checked = e.target.checked;
    setIsSeller(checked);
    setUser((prev) => ({
      ...prev,
      isSeller: checked,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (user.password.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
      }

      const res = await createUserWithEmailAndPassword(
        auth,
        user.email,
        user.password
      );

      let imgUrl = "";
      if (file) {
        imgUrl = await upload(file); // ✅ Upload to ImgBB
      }

      await updateProfile(res.user, {
        displayName: user.username,
        photoURL: imgUrl,
      });

      await setDoc(doc(db, "users", res.user.uid), {
        uid: res.user.uid,
        username: user.username,
        email: user.email,
        country: user.country,
        isSeller: user.isSeller,
        desc: user.desc,
        phone: user.phone || "",
        img: imgUrl,
        createdAt: new Date(),
      });

      localStorage.setItem("currentUser", JSON.stringify({
        uid: res.user.uid,
        username: user.username,
        photoURL: imgUrl,
        img: imgUrl,
        isSeller: user.isSeller,
      }));

      navigate(isSeller ? `/seller/${res.user.uid}` : "/");
    } catch (err) {
      console.error("Registration error:", err);
      alert(err.message || "Registration failed.");
    }
  };

  return (
    <div className="register">
      <form onSubmit={handleSubmit}>
        <div className="left">
          <h1>Create a new account</h1>
          <label>Username</label>
          <input name="username" type="text" onChange={handleChange} required />
          <label>Email</label>
          <input name="email" type="email" onChange={handleChange} required />
          <label>Password</label>
          <input name="password" type="password" minLength={6} onChange={handleChange} required />
          <label>Profile Picture</label>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
          <label>Country</label>
          <input name="country" type="text" onChange={handleChange} required />
          <button type="submit">Register</button>
        </div>
        <div className="right">
          <h1>I want to become a seller</h1>
          <div className="toggle">
            <label>Activate the seller account</label>
            <label className="switch">
              <input type="checkbox" onChange={handleSeller} />
              <span className="slider round"></span>
            </label>
          </div>
          <label>Phone Number</label>
          <input name="phone" type="text" onChange={handleChange} required />
          <label>Description</label>
          <textarea name="desc" rows="10" onChange={handleChange}></textarea>
        </div>
      </form>
    </div>
  );
}

export default Register;
