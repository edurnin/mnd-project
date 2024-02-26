// components/PatientSearch.js

import React, { useState } from 'react';
import mcsiQuestionMapping from './data/mcsiQuestionMapping'; // Import MCSI question mapping array
import zaritQuestionMapping from './data/zaritQuestionMapping'; // Import Zarit question mapping array
import alsfrsrQuestionMapping from './data/alsfrsrQuestionMapping'; // Import Zarit question mapping array
import weightQuestionMapping from './data/weightQuestionMapping'; // Import Zarit question mapping array
import speechAndSwallowQuestionMapping from './data/speechAndSwallowQuestionMapping'; // Import Zarit question mapping array
import './PatientSearch.css';

const PatientSearch = ({ patientNamesandIDs }) => {
  const [responseContainer, setResponseContainer] = useState('');
  const [patientId, setPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isHovered, setIsHovered] = useState(false);



  const handleFormSubmit = (event) => {
    event.preventDefault();
    const patient = patientNamesandIDs.find(patient => patient["First Name"].toLowerCase() === firstName.toLowerCase() && patient["Last Name"].toLowerCase() === lastName.toLowerCase());
        if (patient) {
          setPatientId(patient.ID);
          displayPatientInfo(`${patient["First Name"]} ${patient["Last Name"]}`, `${patient["ID"]}`);
          fetchQuestionnaireResponses(patient.ID);
        } else {
          setResponseContainer('Patient not found.');
        }
  };

  const handlePatientClick = (patient) => {
    setResponseContainer('');
    displayPatientInfo(`${patient["First Name"]} ${patient["Last Name"]}`, `${patient["ID"]}`);
    fetchQuestionnaireResponses(patient.ID);
  };

  const displayPatientInfo = (name, ID) => {
    setResponseContainer('');
    setResponseContainer(responseContainer => responseContainer + `<h2>Patient Name: ${name}<h2><br>Patient ID: ${ID} </br>`);
  };

  const fetchQuestionnaireResponses = (patientId) => {
    fetch('questionResponses.json')
      .then(response => response.json())
      .then(data => {
        let patientResponses = data.filter(response => response.group === patientId);
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          patientResponses = patientResponses.filter(response => {
            const createdDate = new Date(response.group_series_5);
            return createdDate >= start && createdDate <= end;
          });
        }
        displayPatientResponses(patientResponses);
      })
      .catch(error => {
        console.error('Error fetching JSON file:', error);
        setResponseContainer('Error fetching response JSON file.');
      });
  };

  const displayPatientResponses = (data) => {
    let responseContent = '';
  
    if (data.length === 0) {
      responseContent = '<p>No questionnaires found.</p>';
    } else {
      data.forEach(response => {
        if (response.group_series_7 !== 'scored') {
          return;
        }
  
        const questionMapping = getQuestionMapping(response.group_series_2);
  
        const responseValues = response.group_series_12.split('|').map(value => parseInt(value, 10));
  
        const questionDescriptions = responseValues.map((value, index) => {
          const mapping = questionMapping[index];
          if (!mapping) {
            return 'n/a';
          }
          const description = mapping[value];
          return description || 'n/a';
        });
  
        responseContent += `
          <div class="response">
            <p><strong>${response.group_series_2}</strong></p>
            <p><strong>Date Created:</strong> ${formatDate(response.group_series_5)}</p>
            <p><strong>Date Completed:</strong> ${formatDate(response.group_series_6)}</p>
            <p><strong>Status:</strong> ${response.group_series_7}</p>
            <p><strong>Score 1:</strong> ${response.group_series_8}</p>
            <p><strong>Score 2:</strong> ${response.group_series_9}</p>
            <p><strong>Score 3:</strong> ${response.group_series_10}</p>
            <p><strong>Score 4:</strong> ${response.group_series_11}</p>
            <p><strong>Responses:</strong>${response.group_series_12}</p>
            <ul>${questionDescriptions.map(description => `<li>${description}</li>`).join('')}</ul>
            <br>
          </div>
        `;
      });
    }
  
    setResponseContainer(responseContainer => responseContainer + responseContent);
  };

  const getQuestionMapping = (questionnaireType) => {
    switch (questionnaireType) {
      case 'MCSI':
        return mcsiQuestionMapping;
      case 'Zarit-12':
        return zaritQuestionMapping;
      case 'ALS-FRS-R':
        return alsfrsrQuestionMapping;
      case 'Weight':
        return weightQuestionMapping;
      case 'Speech and Swallow,':
        return speechAndSwallowQuestionMapping;
      default:
        return {};
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  return (
    <div className= 'container'>
      <div className='searchAndNames' >
        <div className='search'>
          <form id="search-form" onSubmit={handleFormSubmit}>
            <input type="text" id="first-name" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} />
            <input type="text" id="last-name" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} />
            <button type="submit">Search</button>
          </form>
          <br></br>
          <form id="dateRangeForm">
            <label htmlFor="start">Start date:</label>
            <input type="date" id="start" name="start" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <label htmlFor="end">End date:</label>
            <input type="date" id="end" name="end" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </form>
        </div>
        <br></br>
        <ul className='patient-list'>
          {patientNamesandIDs.map(patient => (
            <li key={patient.ID} onClick={() => handlePatientClick(patient)}>
              <table>
                <tbody>
                  <tr>
                    <td className='table-cell'>{patient["First Name"] }{" "}{ patient["Last Name"]}</td>
                  </tr>
                </tbody>
              </table>            
            </li>
          ))}
        </ul>
      </div>
      <div id="response-container" className="response-container" dangerouslySetInnerHTML={{ __html: responseContainer }}></div>
    </div>
  );
};

export default PatientSearch;
