// components/PatientSearch.js

import React, { useState, useEffect } from 'react';
import mcsiQuestionMapping from './data/mcsiQuestionMapping'; // Import MCSI question mapping array
import zaritQuestionMapping from './data/zaritQuestionMapping'; // Import Zarit question mapping array
import alsfrsrQuestionMapping from './data/alsfrsrQuestionMapping'; // Import Zarit question mapping array
import weightQuestionMapping from './data/weightQuestionMapping'; // Import Zarit question mapping array
import speechAndSwallowQuestionMapping from './data/speechAndSwallowQuestionMapping'; // Import Zarit question mapping array
import './PatientSearch.css';

const PatientSearch = ({ patientNamesandIDs }) => {
  const [responseContainer, setResponseContainer] = useState('');
  const [patientId, setPatientId] = useState('');
  const [name, setPatientName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState(''); // New state variable for selected questionnaire
  const [allResponses, setAllResponses] = useState([]); // New state variable for all responses

  const handleFormSubmit = (event) => {
    event.preventDefault();
    const patient = patientNamesandIDs.find(patient => patient["First Name"].toLowerCase() === firstName.toLowerCase() && patient["Last Name"].toLowerCase() === lastName.toLowerCase());
        if (patient) {
          setPatientId(patient.ID);
          setPatientName(`${patient["First Name"]} ${patient["Last Name"]}`)
          // displayPatientInfo(`${patient["First Name"]} ${patient["Last Name"]}`, `${patient["ID"]}`);
          fetchQuestionnaireResponses(patient.ID, selectedQuestionnaire); // Pass selected questionnaire type to fetch function
        } else {
          setResponseContainer('Patient not found.');
        }
  };

  const handlePatientClick = (patient) => {
    setResponseContainer('');
    setPatientId(patient.ID);
    setPatientName(`${patient["First Name"]} ${patient["Last Name"]}`)
    // displayPatientInfo(name, patient.ID);
    fetchQuestionnaireResponses(patient.ID, selectedQuestionnaire); // Pass selected questionnaire type to fetch function
  };

  // const displayPatientInfo = (name, ID) => {
  //   setResponseContainer('');
  //   setResponseContainer(responseContainer => responseContainer + `<h2>Patient Name: ${name}<h2><br>Patient ID: ${ID} </br>`);
  // };

  const fetchQuestionnaireResponses = (patientId) => {
    fetch('questionResponses.json')
      .then(response => response.json())
      .then(data => {
        let patientResponses = data.filter(response => response.group === patientId);
        if (selectedQuestionnaire) {
          patientResponses = patientResponses.filter(response => response.group_series_2 === selectedQuestionnaire);
        }
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
    setResponseContainer(`<h2>Responses for ${name}</h2>`+`<h3>Questionnaire: ${selectedQuestionnaire}</h3>`);
    let responseContent = '';
  
    if (data.length === 0) {
      responseContent = '<p>No questionnaires found.</p>';
    } else {
      data.sort((a, b) => new Date(b.group_series_5) - new Date(a.group_series_5));
      data.forEach(response => {
        if (response.group_series_7 !== 'scored') {
          return;
        }
  
        const questionMapping = getQuestionMapping(response.group_series_2);
  
        const responseValues = response.group_series_12.split('|').map(value => parseInt(value, 10)+1);
  
        const questionDescriptions = responseValues.map((value, index) => {
          const mapping = questionMapping[index];
          if (value){
            if (!mapping) {
              return;
            }
            const question = mapping[0];
            let description;
            if (questionMapping === alsfrsrQuestionMapping && index+1 === 17) {
              // Handle multiple selections
              value = value-1;
              description = Array.from(String(value), Number).map(digit => mapping[digit+1]).join(', ');
            } else {
              description = mapping[value];
            }
            return {
              question: (index+1) +': ' + question,
              answer: description ? description +'..................'+ value : 'n/a..................' + value
            };
          }
          else{
            return;
          }
        }).filter(item => item !== undefined);

        const tableString = questionDescriptions.map(({ question, answer }) => `<tr><td>${question}</td><td>${answer}</td></tr>`).join('');

  
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
            <table>${tableString}</table>
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

  useEffect(() => {
    // Clear the response container
    setResponseContainer('');
    // Fetch new responses if a patient is selected
    if (patientId) {
      fetchQuestionnaireResponses(patientId, selectedQuestionnaire);
    }
  }, [selectedQuestionnaire, patientId, startDate, endDate]); // Add selectedQuestionnaire and patientId as dependencies


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
      <div className='responses'>
        <div className='filters'>
          <div className='questionaireFilter'>
            <label htmlFor="questionnaireSelect">Questionnaire: </label>
            <select id="questionnaireSelect" value={selectedQuestionnaire} onChange={e => setSelectedQuestionnaire(e.target.value)}>
              <option value="">All questionnaires</option>
              <option value="MCSI">MCSI</option>
              <option value="Zarit-12">Zarit-12</option>
              <option value="ALS-FRS-R">ALS-FRS-R</option>
              <option value="Weight">Weight</option>
              <option value="Speech and Swallow">Speech and Swallow</option>
            </select>
          </div>
          <form id="dateRangeForm">
              <label htmlFor="start">Start date: </label>
              <input type="date" id="start" name="start" value={startDate} onChange={e => setStartDate(e.target.value)} />
              <br></br>
              <label htmlFor="end">End date:       </label>
              <input type="date" id="end" name="end" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </form>
        </div>
        <div id="response-container" className="response-container" dangerouslySetInnerHTML={{ __html: responseContainer }}></div>
      </div>
    </div>
  );
};

export default PatientSearch;
