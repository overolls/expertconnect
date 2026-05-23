import React from "react";
import "./Reviews.scss";
import Review from "../review/Review";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { db } from "../../utils/firebase";

const Reviews = ({ gigId }) => {
  const queryClient = useQueryClient();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const { isLoading, error, data } = useQuery({
    queryKey: ["reviews", gigId],
    queryFn: async () => {
      const q = query(collection(db, "reviews"), where("gigId", "==", gigId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    },
  });

  const mutation = useMutation({
    mutationFn: async (review) => {
      return await addDoc(collection(db, "reviews"), {
        ...review,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["reviews", gigId]);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const desc = e.target.desc.value.trim();
    const star = parseInt(e.target.star.value);
    if (!desc || !star || !currentUser) return;
    mutation.mutate({ gigId, desc, star });
    e.target.reset();
  };

  return (
    <div className="reviews">
      <h2>Reviews</h2>

      {isLoading ? (
        <p>Loading reviews...</p>
      ) : error ? (
        <p style={{ color: "crimson" }}>Something went wrong loading reviews.</p>
      ) : (
        data.map((review) => <Review key={review.id} review={review} />)
      )}

      {currentUser ? (
        <div className="add">
          <h3>Add a review</h3>
          <form className="addForm" onSubmit={handleSubmit}>
            <input type="text" name="desc" placeholder="Write your opinion" required />
            <select name="star" required>
              <option value="">Rating</option>
              {[1, 2, 3, 4, 5].map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
            </select>
            <button type="submit" disabled={mutation.isLoading}>
              {mutation.isLoading ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      ) : (
        <p style={{ marginTop: "20px", color: "gray" }}>
          You must be logged in to leave a review.
        </p>
      )}
    </div>
  );
};

export default Reviews;
