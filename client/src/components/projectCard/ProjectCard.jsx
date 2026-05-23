import React from "react";
import "./ProjectCard.scss";

function ProjectCard({ card }) {
  return (
    <div className="projectCard">
      <img src={card.img || "/img/project-placeholder.jpg"} alt="Project" />
      <div className="info">
        <img src={card.pp || "/img/noavatar.jpg"} alt="User" />
        <div className="texts">
          <h2>{card.cat || "Category"}</h2>
          <span>{card.username || "Unknown User"}</span>
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;
