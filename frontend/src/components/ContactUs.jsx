import React from 'react'
import './ContactUs.css'
const ContactUs = () => {
  return (
    <section className='contact '>
      <form className='form'>
        <h2>Contact Us</h2>
        <div className='input-box'>
          <label>Full name</label>
          <input type='text' className='field' placeholder='Enter your name ' required/>
        </div>
        <div className='input-box'>
          <label>Email Address</label>
          <input type='email' className='field' placeholder='Enter your email ' required/>
        </div>
        <div className='input-box'>
          <label>Phone number</label>
          <input type='tel' className='field' placeholder='Enter your phone number ' required/>
        </div>
        <div className='input-box'>
          <label>Enter message</label>
          <textarea type='text' id='' className='field mess' placeholder='Enter your message' required>
            </textarea>
        </div>
        <button type='submit'>Send message</button>
      </form>
    </section>
  )
}

export default ContactUs
