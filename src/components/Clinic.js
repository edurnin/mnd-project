import './Home.css';
import PatientSearch from './PatientSearch';
import React, { useState, useEffect } from 'react';

const Clinic = () => {
  const [patientNamesandIDs, setPatients] = useState([]);


  useEffect(() => {
    Promise.all([
      fetch('patientClinic.json').then(response => response.json()),
      fetch('PatientNames.json').then(response => response.json())
    ])
    .then(([patientClinicData, patientNamesData]) => {
      const matchedPatients = patientClinicData.map(clinicPatient => {
        const [firstName, lastName] = clinicPatient.Name.split(' ');
        const matchedPatient = patientNamesData.find(patientName => 
          patientName['First Name'] === firstName && patientName['Last Name'] === lastName
        );
        return matchedPatient ? { ID: matchedPatient.ID, 'First Name': firstName, 'Last Name': lastName } : null;
      }).filter(Boolean); // remove null values
      setPatients(matchedPatients);
    })
      .catch(error => {
        console.error('Error fetching clinic names JSON file:', error);
      });
  }, []);

    return (
      <div>
        <ul>
        <h1>Clinic</h1>
        <PatientSearch patientNamesandIDs={patientNamesandIDs} />
        </ul>
      </div>
    );
  
};

export default Clinic;