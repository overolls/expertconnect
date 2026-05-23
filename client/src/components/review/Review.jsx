import React from "react";
import "./Review.scss";
import { useQuery } from "@tanstack/react-query";
import { db } from "../../utils/firebase";
import { doc, getDoc } from "firebase/firestore";

// Optional: if you ever fallback to API_BASE uploads (still supported for flexibility)
const API_BASE = import.meta.env.VITE_API_BASE;

const Review = ({ review }) => {
  const { isLoading, error, data } = useQuery({
    queryKey: ["user", review.userId],
    queryFn: async () => {
      const userRef = doc(db, "users", review.userId);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) throw new Error("User not found");
      return userSnap.data();
    },
  });

  const profileImage = data?.img?.startsWith("/uploads")
    ? `${API_BASE}${data.img}`
    : data?.img || "/img/noavatar.jpg";

  return (
    <div className="review">
      <div className="user">
        {isLoading ? (
          <span className="loading">Loading user...</span>
        ) : error || !data ? (
          <span className="error">User not found.</span>
        ) : (
          <>
            <img className="pp" src={profileImage} alt="Profile" />
            <div className="info">
              <span className="username">{data.username || "Unknown"}</span>
              <div className="country">
                <img src="/img/flag.png" alt="Country" />
                <span>{data.country || "Unknown"}</span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="stars">
        {Array(review.star)
          .fill()
          .map((_, i) => (
            <img src="/img/star.png" alt="star" key={i} />
          ))}
        <span className="star-count">{review.star}</span>
      </div>

      <p className="review-text">{review.desc}</p>

      <div className="helpful">
        <span>Helpful?</span>
        <button className="btn-like">
          <img src="/img/like.png" alt="like" />
          <span>Yes</span>
        </button>
        <button className="btn-dislike">
          <img src="/img/dislike.png" alt="dislike" />
          <span>No</span>
        </button>
      </div>
    </div>
  );
};

export default Review;
