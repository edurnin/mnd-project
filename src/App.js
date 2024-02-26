import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/NavBar';
import Home from './components/Home';
// import PatientSearch from './components/PatientSearch';
import PatientPage from './components/PatientPage';
import PatientList from './components/PatientList';


const navLinks = [
  {to: "/", label: "Home" },
  {to: "/patientlist", label: "Patient List" }

];

function App() {
  return (
    <div className="App">
      <Router>
        <Navbar navLinks={navLinks} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/patientlist" element={<PatientList />} />
          <Route path="/patient/:patient.ID" element={<PatientPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;