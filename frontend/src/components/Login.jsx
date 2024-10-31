import React, { useState } from 'react';
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";

const Login = () => {
  const [action, setAction] = useState('');

  const registerLink = () => {
    setAction(' active');
  };

  const loginLink = () => {
    setAction('');
  };

  return (
    <div className={`wrapper${action}`} style={{
      marginTop: '70px',
      marginLeft: '400px',
      position: 'relative',
      width: '420px',
      height: action ? '500px' : '450px',
      background: 'transparent',
      border: '2px solid rgba(255,255,255, .1)',
      backdropFilter: 'blur(30px)',
      borderRadius: '30px',
      boxShadow: '0 0 10px rgba(0,0,0,.5)',
      color: '#fff',
      display: 'flex',
      overflow: 'hidden',
      alignItems: 'center',
      transition: 'height .1s ease',
    }}>
      <div className="form-box login" style={{
        width: '100%',
        padding: '25px 40px',
        translate: action ? '-400px' : '0px',
        transition: action ? 'none' : 'translate .18s ease'
      }}>
        <form className='lform' action=''>
          <h1 style={{
            fontSize: '36px',
            textAlign: 'center',
            color: 'black'
          }}>Login</h1>
          <div className='input-box' style={{
            position: 'relative',
            width: '100%',
            height: '50px',
            borderRadius: '40px',
            margin: '30px 0',
            background: 'white',
            border: '2px solid black'
          }}>
            <input type='email' placeholder='Email' required style={{
              width: '100%',
              height: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '16px',
              color: 'black',
              padding: '20px 45px 20px 20px',
              borderRadius: '40px'
            }} />
            <FaEnvelope className='icon' style={{
              position: 'absolute',
              right: '20px',
              top: '0',
              translate: '0 15px',
              fontSize: '16px',
              color: 'black'
            }} />
          </div>
          <div className='input-box' style={{
            position: 'relative',
            width: '100%',
            height: '50px',
            borderRadius: '40px',
            margin: '30px 0',
            background: 'white',
            border: '2px solid black'
          }}>
            <input type='password' placeholder='Password' required style={{
              width: '100%',
              height: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '16px',
              color: 'black',
              padding: '20px 45px 20px 20px',
              borderRadius: '40px'
            }} />
            <FaLock className='icon' style={{
              position: 'absolute',
              right: '20px',
              top: '0',
              translate: '0 15px',
              fontSize: '16px',
              color: 'black'
            }} />
          </div>
          <div className='forgot' style={{
            display: 'flex',
            justifyContent: 'center',
            fontSize: '14.5px'
          }}>
            <a href='#' style={{ color: 'black' }}>forgot password?</a>
          </div>
          <button type='submit' style={{
            marginTop: '20px',
            width: '100%',
            height: '45px',
            background: '#fff',
            border: 'none',
            outline: 'none',
            borderRadius: '40px',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            fontSize: '16px',
            color: '#333',
            fontWeight: '700',
            border: '2px solid black'
          }}>Login</button>
          <div className='register-link' style={{
            fontSize: '14.5px',
            textAlign: 'center',
            margin: '20px 0 15px',
            color: 'black'
          }}>
            <p>Don't have an account? <a href='#' onClick={registerLink} style={{ color: 'black' }}>Register</a></p>
          </div>
        </form>
      </div>

      <div className='form-box register' style={{
        width: '100%',
        padding: '25px 40px',
        position: 'absolute',
        translate: action ? '0px' : '400px',
        transition: action ? 'translate .18s ease' : 'none'
      }}>
        <form className='lform' action=''>
          <h1 style={{
            fontSize: '36px',
            textAlign: 'center',
            color: 'black'
          }}>Registration</h1>
          <div className='input-box' style={{
            position: 'relative',
            width: '100%',
            height: '50px',
            borderRadius: '40px',
            margin: '30px 0',
            background: 'white',
            border: '2px solid black'
          }}>
            <input type='text' placeholder='Username' required style={{
              width: '100%',
              height: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '16px',
              color: 'black',
              padding: '20px 45px 20px 20px',
              borderRadius: '40px'
            }} />
            <FaUser className='icon' style={{
              position: 'absolute',
              right: '20px',
              top: '0',
              translate: '0 15px',
              fontSize: '16px',
              color: 'black'
            }} />
          </div>
          <div className='input-box' style={{
            position: 'relative',
            width: '100%',
            height: '50px',
            borderRadius: '40px',
            margin: '30px 0',
            background: 'white',
            border: '2px solid black'
          }}>
            <input type='email' placeholder='Email' required style={{
              width: '100%',
              height: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '16px',
              color: 'black',
              padding: '20px 45px 20px 20px',
              borderRadius: '40px'
            }} />
            <FaEnvelope className='icon' style={{
              position: 'absolute',
              right: '20px',
              top: '0',
              translate: '0 15px',
              fontSize: '16px',
              color: 'black'
            }} />
          </div>
          <button type='submit' style={{
            marginTop: '20px',
            width: '100%',
            height: '45px',
            background: '#fff',
            border: 'none',
            outline: 'none',
            borderRadius: '40px',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            fontSize: '16px',
            color: '#333',
            fontWeight: '700',
            border: '2px solid black'
          }}>Register</button>
          <div className='register-link' style={{
            fontSize: '14.5px',
            textAlign: 'center',
            margin: '20px 0 15px',
            color: 'black'
          }}>
            <p>Already have an account? <a href='#' onClick={loginLink} style={{ color: 'black' }}>Login</a></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
