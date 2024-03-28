import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import Navbar from './components/NavBar';
import Home from './components/Home';
// import PatientSearch from './components/PatientSearch';
import Clinic from './components/Clinic';

const navLinks = [
  {to: "/", label: "Home" },
  {to: "/clinic", label: "Clinic" },
];

function App() {
  return (
    <div className="App">
      <Router>
        <Navbar navLinks={navLinks} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/clinic" element={<Clinic />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;