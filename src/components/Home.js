import React, { useState, useEffect } from 'react';
import './Home.css';
import PatientSearch from './patientSearch';

const Home = () => {
  const [patients, setPatients] = useState([]);

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
        {patients.map(patient => (
          <li key={patient.ID}>
            {patient["First Name"]} {patient["Last Name"]}
          </li>
        ))}
      </ul>
      <PatientSearch patients={patients} />
    </div>
  );
};

export default Home;