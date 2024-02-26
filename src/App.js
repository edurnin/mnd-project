import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/NavBar';
import Home from './components/Home';
import PatientSearch from './components/patientSearch';
import PatientPage from './components/PatientPage';


const navLinks = [
  { to: "/PatientSearch", label: "PatientSearch" },
  {to: "/", label: "Home" },
];

function App() {
  return (
    <div className="App">
      <Router>
        <Navbar navLinks={navLinks} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/PatientSearch" element={<PatientSearch />} />
          <Route path="/patient/:patientId" element={<PatientPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;