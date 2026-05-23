import React from "react";
import "./GigCard.scss";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { db } from "../../utils/firebase";
import { doc, getDoc } from "firebase/firestore";

const GigCard = ({ item }) => {
  const { isLoading, error, data } = useQuery({
    queryKey: ["user", item.userId],
    queryFn: async () => {
      const userRef = doc(db, "users", item.userId);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) throw new Error("User not found");
      return userSnap.data();
    },
  });

  const averageRating =
    item.starNumber > 0
      ? Math.round(item.totalStars / item.starNumber)
      : "N/A";

  const coverImageUrl = item.cover?.startsWith("http")
    ? item.cover
    : "/img/fallback.jpg";

  const userImageUrl = data?.img?.startsWith("http")
    ? data.img
    : "/img/noavatar.jpg";

  return (
    <Link to={`/gig/${item.id}`} className="link">
      <div className="gigCard">
        <img src={coverImageUrl} alt="Gig Cover" />
        <div className="info">
          {isLoading ? (
            "Loading..."
          ) : error ? (
            "User not found"
          ) : (
            <div className="user">
              <img src={userImageUrl} alt="User" />
              <span>{data.username || data.displayName || "Unknown"}</span>
            </div>
          )}
          <p>{item.desc}</p>
          <div className="star">
            <img src="/img/star.png" alt="Rating" />
            <span>{averageRating}</span>
          </div>
        </div>
        <hr />
        <div className="detail">
          <img src="/img/heart.png" alt="Favorite" />
          <div className="price">
            <span>STARTING AT</span>
            <h2>$ {item.price}</h2>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default GigCard;
