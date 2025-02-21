import './App.css';
import Home from './components/Home';
import Login from './components/Login';
import AboutUs from './components/AboutUs';
import Hr from './components/Hr';
import Resume from './components/Resume';
import ContactUs from './components/ContactUs'
import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import ResumeResult from './components/ResumeResult';
import Technical from './components/Technical';

import "regenerator-runtime/runtime";
import Test from './components/Test';
import CandidateFeedbackUI from './components/Feedback';
const App = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />
    },
    {
      path: "/home",
      element: <Home />
    },
    {
      path: "/login",
      element: <Login />
    },
    {
      path: "/aboutus",
      element: <AboutUs />
    },
    {
      path: "/hr",
      element: <Hr />
    },
    {
      path: "/login",
      element: <Login />
    },
    {
      path: "/contactus",
      element: <ContactUs />
    },
    {
      path: "/resume",
      element: <Resume />
    },
    {
      path: '/resume/result',
      element: <ResumeResult />
    },
    {
      path: '/test',
      element: <CandidateFeedbackUI />
    },
    {
      path: '/technical',
      element: <Technical />
    }
    

  ])
  return (
    <>
      <RouterProvider router={router} />
    </>

  );
}

export default App;
