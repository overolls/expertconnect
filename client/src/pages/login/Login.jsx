import React, { useState } from "react";
import "./Login.scss";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../utils/firebase";
import { doc, getDoc } from "firebase/firestore";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const userId = res.user.uid;

      // Fetch user data from Firestore
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error("User profile not found in database.");
      }

      // Save full user to localStorage
      const userData = userSnap.data();
      localStorage.setItem("currentUser", JSON.stringify({ uid: userId, ...userData }));

      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="login">
      <form onSubmit={handleSubmit}>
        <h1>Sign in</h1>

        <label>Email</label>
        <input
          name="email"
          type="email"
          placeholder="your@email.com"
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          name="password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login</button>
        {error && <span className="error">{error}</span>}
      </form>
    </div>
  );
}

export default Login;
