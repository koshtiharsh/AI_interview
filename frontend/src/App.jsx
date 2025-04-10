import './App.css';
import Home from './components/Home';
import Login from './components/Login';
import AboutUs from './components/AboutUs';
import Hr from './components/Hr';
import Resume from './components/Resume';
import ContactUs from './components/ContactUs'
import React, { useEffect } from 'react';
import { createBrowserRouter, Navigate, RouterProvider, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import ResumeResult from './components/ResumeResult';
import Technical from './components/Technical';

import "regenerator-runtime/runtime";
import Test from './components/Test';
import CandidateFeedbackUI from './components/Old_Feedback';
import ProfileBasedJobRecommendations from './components/Jobsearch';
import CareerPath from './components/Career';
import Hrfeedback from './components/Hrfeedback';
import Techfeedback from './components/Techfeedback';
import SignupForm from './components/SignupForm ';
import CareerChatbot from './components/CareerChatbot';
import TechnicalInterview from './components/Test';
import Emotion from './components/Emotion';
import UserProfile from './components/UserProfile';
import ResumeAnalysisReport from './components/TestResume';
// Component to handle routing logic
const RouteHandler = () => {
  const location = useLocation();
  const token = localStorage.getItem("token");

  if (!token && location.pathname !== '/') {
    return <Navigate to="/login" replace />;
  }

  return null; // No UI, just redirection logic
};

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <RouteHandler />
        <Home />
      </>
    ),
  },
  {
    path: "/home",
    element: (
      <>
        <RouteHandler />
        <Home />
      </>
    ),
  },
  {
    path: "/login",
    element: (
      <>
        <RouteHandler />
        <Login />
      </>
    ),
  },
  {
    path: "/aboutus",
    element: (
      <>
        <RouteHandler />
        <AboutUs />
      </>
    ),
  },
  {
    path: "/hr",
    element: (
      <>
        <RouteHandler />
        <Hr />
      </>
    ),
  },
  {
    path: "/contactus",
    element: (
      <>
        <RouteHandler />
        <ContactUs />
      </>
    ),
  },
  {
    path: "/resume",
    element: (
      <>
        <RouteHandler />
        <Resume />
      </>
    ),
  },
  {
    path: "/resume/result",
    element: (
      <>
        <RouteHandler />
        <ResumeResult />
      </>
    ),
  },
  {
    path: "/test",
    element: (
      <>
        <RouteHandler />
        <TechnicalInterview />
      </>
    ),
  },
  {
    path: "/technical",
    element: (
      <>
        <RouteHandler />
        <Technical />
      </>
    ),
  },
  {
    path: "/careerpath",
    element: (
      <>
        <RouteHandler />
        <CareerPath />
      </>
    ),
  },
  {
    path: "/jobsearch",
    element: (
      <>
        <RouteHandler />
        <ProfileBasedJobRecommendations />
      </>
    ),
  },
  {
    path: "/hrfeedback",
    element: (
      <>
        <RouteHandler />
        <Hrfeedback />
      </>
    ),
  },
  {
    path: "/techfeedback",
    element: (
      <>
        <RouteHandler />
        <Techfeedback />
      </>
    ),
  },
  {
    path: "/signup",
    element: (
      <>

        <SignupForm />
      </>
    ),
  },
  {
    path: "/chat",
    element: (
      <>

        <CareerChatbot />
      </>
    ),
  },
  {
    path: "/emotiontest",
    element: (
      <>

        <Emotion />
      </>
    ),
  },
  {
    path: "/userprofile",
    element: (
      <>
        <RouteHandler />
        <UserProfile />
      </>
    ),
  },
  {
    path: "/testresume",
    element: (
      <>
        <RouteHandler />
        <ResumeAnalysisReport />
      </>
    ),
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
