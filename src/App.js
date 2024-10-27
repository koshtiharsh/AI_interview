import Hr from './test/pages/Hr';
import ContactUs from './pages/ContactUs';
import AboutUs from './pages/AboutUs';
import Resume from './test/pages/Resume';
import Home from './pages/Home';
import './App.css';
import React from 'react';
import {BrowserRouter as Router,Route,Redirect,Switch} from 'react-router-dom';
import Login from './pages/Login'


const App= () => {
  return (
  <Router>
    <Switch>
      <Route path="/" exact><Home/></Route>
      <Route path="/contactus"><ContactUs/></Route>
      <Route path="/hr"><Hr/></Route>
      <Route path="/aboutus"><AboutUs/></Route>
      <Route path="/Login"><Login/></Route>
      <Route path="/resume"><Resume/></Route>
      <Redirect to="/"/>
    </Switch>
  </Router>
  
  );
}

export default App;
