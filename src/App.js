import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import Navbar from './components/NavBar';
import Home from './components/Home';
// import PatientSearch from './components/PatientSearch';
import Clinic from './components/Clinic';
import Carers from './components/Carers';

const navLinks = [
  {to: "/", label: "Home" },
  {to: "/clinic", label: "Clinic" },
  {to: "/carers", label: "Carers" }
];

function App() {
  return (
    <div className="App">
      <Router>
        <Navbar navLinks={navLinks} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/clinic" element={<Clinic />} />
          <Route path="/carers" element={<Carers />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;