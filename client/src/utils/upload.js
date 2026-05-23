import axios from "axios";

const upload = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const res = await axios.post(
      `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`,
      formData
    );

    return res.data.data.url; // ✅ returns the hosted image URL
  } catch (err) {
    console.error("ImgBB Upload failed:", err);
    throw err;
  }
};

export default upload;
