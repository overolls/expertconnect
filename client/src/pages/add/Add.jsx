import React, { useReducer, useState } from "react";
import "./Add.scss";
import { gigReducer, INITIAL_STATE } from "../../reducers/gigReducer";
import upload from "../../utils/upload";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../utils/firebase";

const Add = () => {
  const [singleFile, setSingleFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [featureInput, setFeatureInput] = useState("");

  const [state, dispatch] = useReducer(gigReducer, INITIAL_STATE);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleChange = (e) => {
    dispatch({
      type: "CHANGE_INPUT",
      payload: { name: e.target.name, value: e.target.value },
    });
  };

  const handleFeature = (e) => {
    e.preventDefault();
    const trimmed = featureInput.trim();
    if (trimmed && !state.features.includes(trimmed)) {
      dispatch({ type: "ADD_FEATURE", payload: trimmed });
    }
    setFeatureInput("");
  };

  const handleUpload = async () => {
    if (!singleFile || files.length === 0) {
      alert("Please select both cover and additional images before uploading.");
      return;
    }

    setUploading(true);
    try {
      const cover = await upload(singleFile);
      const images = await Promise.all([...files].map((file) => upload(file)));

      dispatch({ type: "ADD_IMAGES", payload: { cover, images } });
      setUploadComplete(true);
      alert("Images uploaded successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      alert("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const mutation = useMutation({
    mutationFn: async (gig) => {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (!currentUser?.uid) throw new Error("User not authenticated");

      return await addDoc(collection(db, "gigs"), {
        ...gig,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        starNumber: 0,
        totalStars: 0,
        sales: 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["myGigs"]);
      alert("Gig successfully created!");
      navigate("/mygigs");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!uploadComplete) {
      alert("Please upload your images before submitting.");
      return;
    }

    if (!state.title || !state.desc || !state.cat || !state.shortTitle || !state.shortDesc || !state.price || !state.deliveryTime) {
      alert("Please fill in all required fields.");
      return;
    }

    mutation.mutate(state);
  };

  return (
    <div className="add">
      <div className="container">
        <h1>Add New Gig</h1>
        <div className="sections">
          <div className="info">
            <label>Title</label>
            <input
              type="text"
              name="title"
              placeholder="e.g. I will do something I'm really good at"
              onChange={handleChange}
              required
            />

            <label>Category</label>
            <select name="cat" onChange={handleChange} required>
              <option value="">Select category</option>
              <option value="design">Design</option>
              <option value="web">Web Development</option>
              <option value="animation">Animation</option>
              <option value="music">Music</option>
            </select>

            <div className="images">
              <div className="imagesInputs">
                <label>Cover Image</label>
                <input type="file" accept="image/*" onChange={(e) => setSingleFile(e.target.files[0])} />
                <label>Upload Additional Images</label>
                <input type="file" multiple accept="image/*" onChange={(e) => setFiles(e.target.files)} />
              </div>
              <button onClick={handleUpload} disabled={uploading}>
                {uploading ? "Uploading..." : "Upload"}
              </button>
              {!uploadComplete && !uploading && (
                <p style={{ color: "crimson", marginTop: "5px" }}>⚠️ Please upload images before creating the gig.</p>
              )}
            </div>

            {files.length > 0 && (
              <div className="previewImages">
                {[...files].map((file, i) => (
                  <img
                    key={i}
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    style={{ height: 80, borderRadius: 6, marginRight: 8 }}
                  />
                ))}
              </div>
            )}

            <label>Description</label>
            <textarea
              name="desc"
              placeholder="Brief description of your service"
              rows="10"
              onChange={handleChange}
              required
            ></textarea>

            <button onClick={handleSubmit} disabled={uploading || !uploadComplete}>
              {uploading ? "Uploading..." : "Create"}
            </button>
          </div>

          <div className="details">
            <label>Service Title</label>
            <input
              type="text"
              name="shortTitle"
              placeholder="e.g. One-page web design"
              onChange={handleChange}
              required
            />

            <label>Short Description</label>
            <textarea
              name="shortDesc"
              placeholder="Short summary of your gig"
              rows="5"
              onChange={handleChange}
              required
            ></textarea>

            <label>Delivery Time (days)</label>
            <input type="number" name="deliveryTime" onChange={handleChange} required />

            <label>Revision Number</label>
            <input type="number" name="revisionNumber" onChange={handleChange} required />

            <label>Add Features</label>
            <form className="add" onSubmit={handleFeature}>
              <input
                type="text"
                placeholder="e.g. responsive design"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
              />
              <button type="submit">Add</button>
            </form>

            <div className="addedFeatures">
              {state.features.map((f) => (
                <div className="item" key={f}>
                  <button onClick={() => dispatch({ type: "REMOVE_FEATURE", payload: f })}>
                    {f} <span>X</span>
                  </button>
                </div>
              ))}
            </div>

            <label>Price ($)</label>
            <input type="number" name="price" onChange={handleChange} required />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Add;