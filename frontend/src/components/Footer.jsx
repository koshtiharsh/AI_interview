import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <div style={{ marginTop: '30px', backgroundColor: '#2d2d32', padding: '4rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          textAlign: 'left',
          marginBottom: '2rem',
          color: 'white'
        }}>
          {/* Footer Links */}
          <div style={{ width: '150px', margin: '1rem' }}>
            <h4>For business</h4>
            <a href="/" style={{ color: 'rgb(175,175,179)', textDecoration: 'none' }}><p>Employer</p></a>
            <a href="/" style={{ color: 'rgb(175,175,179)', textDecoration: 'none' }}><p>Health plan</p></a>
            <a href="/" style={{ color: 'rgb(175,175,179)', textDecoration: 'none' }}><p>Individual</p></a>
          </div>
          <div style={{ width: '150px', margin: '1rem' }}>
            <h4>Resources</h4>
            <a href="/" style={{ color: 'rgb(175,175,179)', textDecoration: 'none' }}><p>Resource center</p></a>
            <a href="/" style={{ color: 'rgb(175,175,179)', textDecoration: 'none' }}><p>Testimonials</p></a>
            <a href="/" style={{ color: 'rgb(175,175,179)', textDecoration: 'none' }}><p>stv</p></a>
          </div>
          <div style={{ width: '150px', margin: '1rem' }}>
            <h4>Partners</h4>
            <a href="/" style={{ color: 'rgb(175,175,179)', textDecoration: 'none' }}><p>xyz tech</p></a>
          </div>
          <div style={{ width: '150px', margin: '1rem' }}>
            <h4>Company</h4>
            <a href="/" style={{ color: 'rgb(175,175,179)', textDecoration: 'none' }}><p>About</p></a>
            <a href="/" style={{ color: 'rgb(175,175,179)', textDecoration: 'none' }}><p>Press</p></a>
            <a href="/" style={{ color: 'rgb(175,175,179)', textDecoration: 'none' }}><p>Career</p></a>
            <a href="/" style={{ color: 'rgb(175,175,179)', textDecoration: 'none' }}><p>Contact</p></a>
          </div>
        </div>

        {/* Social Media Icons */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          margin: '1.5rem 0',
          gap: '20px'
        }}>
          <a href="#" style={{ color: 'white', fontSize: '24px', marginLeft: '10px', transition: 'color 0.3s ease' }}>
            <FaFacebook />
          </a>
          <a href="#" style={{ color: 'white', fontSize: '24px', marginLeft: '10px', transition: 'color 0.3s ease' }}>
            <FaTwitter />
          </a>
          <a href="#" style={{ color: 'white', fontSize: '24px', marginLeft: '10px', transition: 'color 0.3s ease' }}>
            <FaInstagram />
          </a>
        </div>

        <hr style={{ color: 'white', width: '100%' }} />

        {/* Footer Bottom */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: '0.2rem'
        }}>
          <div style={{ fontSize: '13px', color: 'rgb(255,255,255)', fontWeight: '600' }}>
            <p>@{new Date().getFullYear()} codeInn. All rights reserved.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <a href="/terms" style={{ color: 'white', marginLeft: '2rem', fontWeight: '600' }}>Terms and conditions</a>
            <a href="/privacy" style={{ color: 'white', marginLeft: '2rem', fontWeight: '600' }}>Privacy</a>
            <a href="/security" style={{ color: 'white', marginLeft: '2rem', fontWeight: '600' }}>Security</a>
            <a href="/cookie" style={{ color: 'white', marginLeft: '2rem', fontWeight: '600' }}>Cookie declaration</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
