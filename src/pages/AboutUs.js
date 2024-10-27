import React from 'react';
import './AboutUs.css'; 
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa'; 
import teamImage from '../assets/gd.jpg'; 
import Navbar from '../shared/components/UIElements/Navbar';
import Footer from '../shared/components/UIElements/Footer';
const AboutUs = () => {
  return (
    <>
    <Navbar/>
    <div className="about-sections sec1">
      
      <div className="about-container">
        <div className="about-content">
          <h1>ABOUT US</h1>
          <h3>Lorem ipsum dolor sit amet, consectetur adipiscing</h3>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
            tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
            quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
            consequat.
          </p>
          <button className="learn-more">Read More</button>
          <div className="social-icons">
            <a href="#"><FaFacebook /></a>
            <a href="#"><FaTwitter /></a>
            <a href="#"><FaInstagram /></a>
          </div>
        </div>
        <div className="about-image">
          <img src={teamImage} alt="Team Member" />
        </div>
      </div>

      
      <div className="about-container">
        <div className="about-content">
          <h1>OUR MISSION</h1>
          <h3>Making a Difference, One Solution at a Time</h3>
          <p>
            Our mission is to provide innovative solutions that improve the lives of
            our customers. We aim to make a positive impact by focusing on customer
            satisfaction and product excellence.
          </p>
          <button className="learn-more">Discover More</button>
          <div className="social-icons">
            <a href="#"><FaFacebook /></a>
            <a href="#"><FaTwitter /></a>
            <a href="#"><FaInstagram /></a>
          </div>
        </div>
        <div className="about-image">
          <img src={teamImage} alt="Mission" />
        </div>
      </div>

     
      <div className="about-container">
        <div className="about-content">
          <h1>OUR TEAM</h1>
          <h3>A Passionate Team of Professionals</h3>
          <p>
            We are a group of dedicated individuals who work hard to meet the needs of
            our customers. Our team is committed to innovation, creativity, and
            excellence in everything we do.
          </p>
          <button className="learn-more">Meet the Team</button>
          <div className="social-icons">
            <a href="#"><FaFacebook /></a>
            <a href="#"><FaTwitter /></a>
            <a href="#"><FaInstagram /></a>
          </div>
        </div>
        <div className="about-image">
          <img src={teamImage} alt="Our Team" />
        </div>
      </div>

      
      <div className="about-container">
        <div className="about-content">
          <h1>CONTACT US</h1>
          <h3>We’re Here to Help</h3>
          <p>
            Have any questions? Get in touch with us! Our support team is available
            around the clock to assist you with any queries.
          </p>
          <button className="learn-more">Contact Now</button>
          <div className="social-icons">
            <a href="#"><FaFacebook /></a>
            <a href="#"><FaTwitter /></a>
            <a href="#"><FaInstagram /></a>
          </div>
        </div>
        <div className="about-image">
          <img src={teamImage} alt="Contact Us" />
        </div>
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default AboutUs;
