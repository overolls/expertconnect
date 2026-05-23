import React, { useState } from "react";
import "./Featured.scss";
import { useNavigate } from "react-router-dom";

function Featured() {
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  const handleSearch = (term) => {
    navigate(`/gigs?search=${encodeURIComponent(term)}`);
  };

  const handleSubmit = () => {
    if (input.trim()) {
      handleSearch(input);
    }
  };

  return (
    <div className="featured">
      <div className="container">
        <div className="left">
          <h1>
            Find the perfect <span>freelance</span> services for your business
          </h1>
          <div className="search">
            <div className="searchInput">
              <img src="/img/search.png" alt="Search icon" />
              <input
                type="text"
                placeholder='Try "building mobile app"'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>
            <button onClick={handleSubmit}>Search</button>
          </div>
          <div className="popular">
            <span>Popular:</span>
            {["Web Design", "WordPress", "Logo Design", "AI Services"].map((tag) => (
              <button key={tag} onClick={() => handleSearch(tag)}>
                {tag}
              </button>
            ))}
          </div>
        </div>
        <div className="right"> 
   <img src="/img/mman.png" alt="Illustration" />
        </div>
      </div>
    </div>
  );
}

export default Featured;
