import './Home.css';
import PatientSearch from './PatientSearch';
import React, { useState, useEffect } from 'react';

const Home = () => {
  const [patientNamesandIDs, setPatients] = useState([]);

  useEffect(() => {
    fetch('patientNames.json')
      .then(response => response.json())
      .then(patientData => {
        setPatients(patientData);
      })
      .catch(error => {
        console.error('Error fetching patient names JSON file:', error);
      });
  }, []);

  return (
    <div>
      <ul>
      <h1>Home</h1>
      <PatientSearch patientNamesandIDs={patientNamesandIDs} />
      </ul>
    </div>
  );
};

export default Home;