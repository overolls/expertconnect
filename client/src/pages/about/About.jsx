import React from "react";
import "./About.scss";

const About = () => {
  return (
    <>
      <div className="about">
        <div className="about-container">
          <h1>About ExpertConnect</h1>
          <p>
            ExpertConnect is a freelance services platform designed to bridge the
            gap between clients and skilled professionals. Whether you’re looking
            to hire a freelancer for a quick task or a long-term project, our
            platform offers a seamless experience.
          </p>

          <h2>Our Mission</h2>
          <p>
            Our mission is to empower individuals and businesses by connecting
            them with talented freelancers across a wide range of fields. We
            believe in equal opportunities, secure payments, and transparent
            communication.
          </p>

          <h2>What We Offer</h2>
          <ul>
            <li>Browse gigs and hire freelancers with ease</li>
            <li>Secure payments with Stripe integration</li>
            <li>Real-time messaging and file sharing</li>
            <li>Profile and gig management dashboards</li>
            <li>AI chatbot assistant for quick support</li>
          </ul>

          <h2>Why Choose Us?</h2>
          <p>
            Unlike other freelance platforms, ExpertConnect is built with modern
            tools and real user needs in mind. From account customization to
            streamlined checkout and intuitive dashboards, we provide a
            next-generation user experience.
<br></br>
            <i>Contact us at: <b>fredsdk53@gmail.com</b> if you need any assistance or refunds.</i>
          </p>
        </div>
      </div>
    </>
  );
};

export default About;
