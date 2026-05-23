import React from "react";
import "./SellerProfile.scss";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { db } from "../../utils/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import GigCard from "../../components/gigCard/GigCard";

const SellerProfile = () => {
  const { id } = useParams();

  const { isLoading, data, error } = useQuery({
    queryKey: ["sellerProfile", id],
    queryFn: async () => {
      const sellerRef = doc(db, "users", id);
      const sellerSnap = await getDoc(sellerRef);
      if (!sellerSnap.exists()) throw new Error("Seller not found");

      const gigsQuery = query(
        collection(db, "gigs"),
        where("userId", "==", id)
      );
      const gigsSnap = await getDocs(gigsQuery);

      return {
        user: sellerSnap.data(),
        gigs: gigsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      };
    },
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading profile: {error.message}</p>;

  const { user, gigs } = data;

  const profileImage = user?.img?.startsWith("http")
    ? user.img
    : "/img/noavatar.jpg";

  return (
    <div className="sellerProfile">
      <div className="sellerInfo">
        <img src={profileImage} alt="avatar" />
        <h2>{user.username}</h2>
        {user.desc && <p>{user.desc}</p>}
        {user.country && (
          <p>
            <strong>Country:</strong> {user.country}
          </p>
        )}
      </div>

      <div className="sellerGigs">
        <h3>{user.username}'s Gigs</h3>
        <div className="gigList">
          {gigs.length > 0 ? (
            gigs.map((gig) => <GigCard key={gig.id} item={gig} />)
          ) : (
            <p>No gigs yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerProfile;
