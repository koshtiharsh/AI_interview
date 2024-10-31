import React from 'react'
import './Footer.css'


const Footer = () => {
  return (
    <div className='footer'>
        <div className='sb__footer  section__padding'>
            <div className='sb__footer-links'>
                <div className='sb__footer-links_div'>
                    <h4>For business</h4>
                    <a href='/'>
                        <p>Employer</p>
                    </a>
                    <a href='/'>
                        <p>Health plan</p>
                    </a>
                    <a href='/'>
                        <p>Individual</p>
                    </a>
                </div>
                <div className='sb__footer-links_div'>
                    <h4>Resources</h4>
                    <a href='/'>
                        <p>Resource center</p>
                    </a>
                    <a href='/'>
                        <p>Testimonials </p>
                    </a>
                    <a href='/'>
                        <p>stv</p>
                    </a>
                </div>
                <div className='sb__footer-links_div'>
                    <h4>Partners</h4>
                    <a href='/'>
                        <p>xyz tech</p>
                    </a>
                </div>
                <div className='sb__footer-links_div'>
                    <h4>Company</h4>
                    <a href='/'>
                        <p>About</p>
                    </a>
                    <a href='/'>
                        <p>Press </p>
                    </a>
                    <a href='/'>
                        <p>Career</p>
                    </a>
                    <a href='/'>
                        <p>Contact</p>
                    </a>
                </div>
               
            </div>

            <hr></hr>
            <div className='sb__footer-below'>
                <div className='sb__footer-copyright'>
                    <p>
                        @{new Date().getFullYear()} codeInn. All rights reserverd.
                    </p>
                </div>
                <div className='sb__footer-below-links'>
                    <a href="/terms"><div><p>Terms and conditions</p></div></a>
                    <a href="/privacy"><div><p>Privacy</p></div></a>
                    <a href="/security"><div><p>Security</p></div></a>
                    <a href="/cookie"><div><p>Cookie and declaration</p></div></a>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Footer
