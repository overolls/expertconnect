import React, { useEffect, useRef, useState } from "react";
import "./Gigs.scss";
import GigCard from "../../components/gigCard/GigCard";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../../utils/firebase";
import { useLocation } from "react-router-dom";

function Gigs() {
  const [sort, setSort] = useState("sales");
  const [open, setOpen] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const minRef = useRef();
  const maxRef = useRef();

  const { search } = useLocation(); // For future category filtering if needed

  const { isLoading, error, data } = useQuery({
    queryKey: ["gigs"],
    queryFn: async () => {
      const q = query(collection(db, "gigs"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    },
  });

  const reSort = (type) => {
    setSort(type);
    setOpen(false);
  };

  useEffect(() => {
    if (data) {
      applyFilters();
    }
  }, [data, sort]);

  const applyFilters = () => {
    if (!data) return;

    const min = parseFloat(minRef.current.value) || 0;
    const max = parseFloat(maxRef.current.value) || Infinity;

    let filtered = data.filter(
      (gig) => gig.price >= min && gig.price <= max
    );

    if (sort === "sales") {
      filtered.sort((a, b) => b.sales - a.sales);
    } else if (sort === "createdAt") {
      filtered.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
    }

    setFilteredData(filtered);
  };

  return (
    <div className="gigs">
      <div className="container">
        <span className="breadcrumbs">ExpertConnect &gt; Services</span>
        <h1>Freelance Gigs</h1>
        <p>Find top-rated services from expert freelancers.</p>

        <div className="menu">
          <div className="left">
            <span>Budget</span>
            <input ref={minRef} type="number" placeholder="min" />
            <input ref={maxRef} type="number" placeholder="max" />
            <button onClick={applyFilters}>Apply</button>
          </div>
          <div className="right">
            <span className="sortBy">Sort by</span>
            <span className="sortType">
              {sort === "sales" ? "Best Selling" : "Newest"}
            </span>
            <img
              src="/img/down.png"
              alt="Sort options"
              onClick={() => setOpen(!open)}
            />
            {open && (
              <div className="rightMenu">
                {sort === "sales" ? (
                  <span onClick={() => reSort("createdAt")}>Newest</span>
                ) : (
                  <span onClick={() => reSort("sales")}>Best Selling</span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="cards">
          {isLoading ? (
            "Loading..."
          ) : error ? (
            "Something went wrong!"
          ) : (
            filteredData.map((gig) => <GigCard key={gig.id} item={gig} />)
          )}
        </div>
      </div>
    </div>
  );
}

export default Gigs;
