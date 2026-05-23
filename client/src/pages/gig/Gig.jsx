import React from "react";
import "./Gig.scss";
import { Slider } from "infinite-react-carousel/lib";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../utils/firebase";
import Reviews from "../../components/reviews/Reviews";

function Gig() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const {
    isLoading,
    error,
    data: gigData,
  } = useQuery({
    queryKey: ["gig", id],
    queryFn: async () => {
      const gigRef = doc(db, "gigs", id);
      const gigSnap = await getDoc(gigRef);
      if (!gigSnap.exists()) throw new Error("Gig not found");
      return { id: gigSnap.id, ...gigSnap.data() };
    },
  });

  const userId = gigData?.userId;

  const {
    isLoading: isLoadingUser,
    error: errorUser,
    data: dataUser,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) throw new Error("User not found");
      return { id: userSnap.id, ...userSnap.data() };
    },
    enabled: !!userId,
  });

  // ✅ FIXED: Marked async and added try/catch
  const handleContact = async () => {
    try {
      if (!currentUser || !currentUser.uid || !userId) return;

      const conversationId =
        currentUser.uid > userId
          ? `${currentUser.uid}_${userId}`
          : `${userId}_${currentUser.uid}`;

      const conversationRef = doc(db, "conversations", conversationId);
      const snap = await getDoc(conversationRef);

      if (!snap.exists()) {
        await setDoc(conversationRef, {
          id: conversationId,
          sellerId: gigData.userId,
          buyerId: currentUser.uid,
          lastMessage: "",
          readBySeller: false,
          readByBuyer: true,
          updatedAt: new Date(),
        });
      }

      navigate(`/message/${conversationId}`);
    } catch (err) {
      console.error("❌ handleContact error:", err.message);
      alert("Failed to start conversation. Please try again.");
    }
  };

  return (
    <div className="gig">
      {isLoading ? (
        "Loading..."
      ) : error ? (
        "Something went wrong!"
      ) : (
        <div className="container">
          <div className="left">
            <span className="breadcrumbs">
              ExpertConnect {">"} {gigData.cat || "Category"} {">"}
            </span>
            <h1>{gigData.title}</h1>

            {isLoadingUser ? (
              "Loading..."
            ) : errorUser ? (
              "User not found!"
            ) : (
              <div className="user">
                <img
                  className="pp"
                  src={dataUser.img || "/img/noavatar.jpg"}
                  alt="Seller"
                />
                <span>{dataUser.username || dataUser.displayName}</span>
                {!isNaN(gigData.totalStars / gigData.starNumber) && (
                  <div className="stars">
                    {Array(Math.round(gigData.totalStars / gigData.starNumber))
                      .fill()
                      .map((_, i) => (
                        <img src="/img/star.png" alt="star" key={i} />
                      ))}
                    <span>
                      {Math.round(gigData.totalStars / gigData.starNumber)}
                    </span>
                  </div>
                )}
              </div>
            )}

            <Slider slidesToShow={1} arrowsScroll={1} className="slider">
              {gigData.images?.map((img) => (
                <img key={img} src={img} alt="Gig Preview" />
              ))}
            </Slider>

            <h2>About This Gig</h2>
            <p>{gigData.desc}</p>

            {isLoadingUser ? (
              "Loading..."
            ) : errorUser ? (
              "Seller not found!"
            ) : (
              <div className="seller">
                <h2>About The Seller</h2>
                <div className="user">
                  <img
                    src={dataUser.img || "/img/noavatar.jpg"}
                    alt="Seller"
                  />
                  <div className="info">
                    <span>{dataUser.username || dataUser.displayName}</span>
                    {!isNaN(gigData.totalStars / gigData.starNumber) && (
                      <div className="stars">
                        {Array(
                          Math.round(gigData.totalStars / gigData.starNumber)
                        )
                          .fill()
                          .map((_, i) => (
                            <img src="/img/star.png" alt="star" key={i} />
                          ))}
                        <span>
                          {Math.round(
                            gigData.totalStars / gigData.starNumber
                          )}
                        </span>
                      </div>
                    )}
                    <button onClick={handleContact}>Contact Me</button>
                  </div>
                </div>
                <div className="box">
                  <div className="items">
                    <div className="item">
                      <span className="title">From</span>
                      <span className="desc">{dataUser.country}</span>
                    </div>
                    <div className="item">
                      <span className="title">Member since</span>
                      <span className="desc">Aug 2022</span>
                    </div>
                    <div className="item">
                      <span className="title">Avg. response time</span>
                      <span className="desc">4 hours</span>
                    </div>
                    <div className="item">
                      <span className="title">Last delivery</span>
                      <span className="desc">1 day ago</span>
                    </div>
                    <div className="item">
                      <span className="title">Languages</span>
                      <span className="desc">English</span>
                    </div>
                  </div>
                  <hr />
                  <p>{dataUser.desc}</p>
                </div>
              </div>
            )}

            <Reviews gigId={id} />
          </div>

          <div className="right">
            <div className="price">
              <h3>{gigData.shortTitle}</h3>
              <h2>$ {gigData.price}</h2>
            </div>
            <p>{gigData.shortDesc}</p>
            <div className="details">
              <div className="item">
                <img src="/img/clock.png" alt="" />
                <span>{gigData.deliveryTime} Days Delivery</span>
              </div>
              <div className="item">
                <img src="/img/recycle.png" alt="" />
                <span>{gigData.revisionNumber} Revisions</span>
              </div>
            </div>
            <div className="features">
              {gigData.features?.map((feature) => (
                <div className="item" key={feature}>
                  <img src="/img/greencheck.png" alt="" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
            <Link to={`/pay/${id}`}>
              <button>Continue</button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Gig;
