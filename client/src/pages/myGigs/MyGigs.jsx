import React from "react";
import { Link } from "react-router-dom";
import "./MyGigs.scss";
import getCurrentUser from "../../utils/getCurrentUser";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../utils/firebase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function MyGigs() {
  const currentUser = getCurrentUser();
  const queryClient = useQueryClient();

  const { isLoading, error, data } = useQuery({
    queryKey: ["myGigs"],
    queryFn: async () => {
      const q = query(
        collection(db, "gigs"),
        where("userId", "==", currentUser.uid)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    },
  });

  const mutation = useMutation({
    mutationFn: async (id) => {
      await deleteDoc(doc(db, "gigs", id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["myGigs"]);
    },
  });

  const handleDelete = (id) => {
    mutation.mutate(id);
  };

  return (
    <div className="myGigs">
      {isLoading ? (
        "Loading..."
      ) : error ? (
        "Error loading gigs."
      ) : (
        <div className="container">
          <div className="title">
            <h1>Gigs</h1>
            {currentUser.isSeller && (
              <Link to="/add">
                <button>Add New Gig</button>
              </Link>
            )}
          </div>
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Price</th>
                <th>Sales</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((gig) => {
                const coverImg =
                  gig.cover?.startsWith("http")
                    ? gig.cover
                    : "/img/fallback.jpg";

                return (
                  <tr key={gig.id}>
                    <td>
                      <img className="image" src={coverImg} alt="Gig Cover" />
                    </td>
                    <td>{gig.title}</td>
                    <td>${gig.price}</td>
                    <td>{gig.sales || 0}</td>
                    <td>
                      <img
                        className="delete"
                        src="/img/delete.png"
                        alt="Delete"
                        onClick={() => handleDelete(gig.id)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MyGigs;
