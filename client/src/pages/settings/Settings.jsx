import React, { useState, useEffect } from "react";
import "./Settings.scss";
import { db } from "../../utils/firebase";
import {
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import upload from "../../utils/upload";

const Settings = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const [file, setFile] = useState(null);
  const [username, setUsername] = useState(currentUser.username || "");
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  }, [file]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let newPhotoURL = currentUser.photoURL || currentUser.img;

      if (file) {
        newPhotoURL = await upload(file); // ✅ Upload to ImgBB
      }

      await updateDoc(doc(db, "users", currentUser.uid), {
        username,
        img: newPhotoURL,
        updatedAt: serverTimestamp(),
      });

      const updatedUser = {
        ...currentUser,
        username,
        photoURL: newPhotoURL,
        img: newPhotoURL,
      };
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));

      setMessage("✅ Profile updated!");
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRequest = async () => {
    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        deleteRequestedAt: new Date(),
      });
      setMessage("🕒 Account deletion requested.");
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to request deletion.");
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        <h2>Account Settings</h2>
        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label>Profile Picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
            />
            {(preview || currentUser.photoURL || currentUser.img) && (
              <img
                className="preview"
                src={
                  preview ||
                  currentUser.photoURL ||
                  currentUser.img ||
                  "/img/noavatar.jpg"
                }
                alt="Profile"
              />
            )}
          </div>

          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>

        <hr />

        <div className="danger-zone">
          <h3>Danger Zone</h3>
          <p>
            Requesting account deletion will schedule your profile for permanent deletion in 30 days.
          </p>
          <button onClick={handleDeleteRequest} className="danger">
            Request Account Deletion
          </button>
        </div>

        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
};

export default Settings;
