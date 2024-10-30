import './App.css';
import Home from './components/Home';
import Login from './components/Login';
import AboutUs from './components/AboutUs';
import Hr from './components/Hr';
import Resume from './components/Resume';
import ContactUs from './components/ContactUs'
import React from 'react';
import {createBrowserRouter ,RouterProvider} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';


const App= () => {
  const router = createBrowserRouter([
    {
      path:"/home",
      element : <Home/>
    },
    {
      path:"/login",
      element : <Login/>
    },
    {
      path:"/aboutus",
      element : <AboutUs/>
    },
    {
      path:"/hr",
      element : <Hr/>
    },
    {
      path:"/login",
      element : <Login/>
    },
    {
      path:"/contactus",
      element : <ContactUs/>
    },
    {
      path:"/resume",
      element: <Resume/>
    }
    

  ])
  return (
    <>
      <RouterProvider router={router}/>
    </>  
  
  );
}

export default App;
