import React from "react";
import "./Explore.scss";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, where, query } from "firebase/firestore";
import { db } from "../../utils/firebase";
import { Link } from "react-router-dom";

const Explore = () => {
  const { isLoading, error, data: freelancers } = useQuery({
    queryKey: ["freelancers"],
    queryFn: async () => {
      const q = query(collection(db, "users"), where("isSeller", "==", true));
      const snap = await getDocs(q);
      return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    },
  });

  return (
    <div className="explore">
      <div className="container">
        <h1>Explore Freelancers</h1>
        {isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Something went wrong.</p>
        ) : (
          <div className="freelancerList">
            {freelancers.map((f) => (
              <div className="freelancerCard" key={f.id}>
                <img
                  src={
                    f.img?.startsWith("http")
                      ? f.img
                      : "/img/noavatar.jpg"
                  }
                  alt="profile"
                />
                <h3>{f.username}</h3>
                <p>{f.desc?.substring(0, 80) || "No description available."}</p>
                <Link to={`/seller/${f.id}`}>
                  <button>View Profile</button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
