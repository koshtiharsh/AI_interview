import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSignedIn, setIsSignedIn] = useState(false);
  const navigate = useNavigate();

  // Check session status on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      verifyToken(token);
    }
  }, []);

  // Verify token with backend
  const verifyToken = async (token) => {
    try {
      const response = await fetch('http://localhost:2000/api/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setIsSignedIn(true);
        navigate('/'); // Navigate to home if token is valid
      } else {
        // Handle token expiration or invalid token
        setIsSignedIn(false);
        localStorage.removeItem('token');
        if (response.status === 403) { // Assuming 403 for invalid/expired token from backend
          alert('Your session has expired. Please log in again.');
          navigate('/login'); // Redirect to login
        }
      }
    } catch (error) {
      setIsSignedIn(false);
      localStorage.removeItem('token');
      console.error('Token verification failed:', error);
      alert('An error occurred. Please log in again.');
      navigate('/login');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'Please enter a valid email address';

    if (!formData.password) newErrors.password = 'Password is required';

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      const response = await fetch('http://localhost:2000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        setIsSignedIn(true);
        alert('Login successful!');
        window.location.href = '/' // Navigate to home after successful login
      } else {
        setErrors({ server: data.message || 'Invalid email or password' });
      }
    } catch (error) {
      setErrors({ server: 'Network error occurred. Please try again later.' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-100 to-purple-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 transform transition-all duration-300 hover:shadow-violet-200/50">
        <h2 className="text-3xl font-bold text-center text-violet-900 mb-8 tracking-tight">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-violet-700 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-violet-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-violet-50/50 transition-all duration-200"
                placeholder="your.email@example.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-violet-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-violet-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-violet-50/50 transition-all duration-200"
                placeholder="Enter your password"
              />
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
            </div>
          </div>

          {errors.server && (
            <div className="text-center text-sm text-red-500 mb-4">
              {errors.server}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-violet-600 text-white py-3 px-4 rounded-lg hover:bg-violet-700 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-all duration-300 transform hover:-translate-y-1"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;