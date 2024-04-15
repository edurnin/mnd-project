// components/PatientSearch.js

import React, { useState, useEffect } from 'react';
import alsfrsrQuestionMapping from './data/alsfrsrQuestionMapping'; 
import weightQuestionMapping from './data/weightQuestionMapping';
import speechAndSwallowQuestionMapping from './data/speechAndSwallowQuestionMapping'; 
import snaqQuestionMapping from './data/snaqQuestionMapping';
import carerQuestionMapping from './data/carerQuestionMapping'; 
import './ClinicSearch.css';
import { Chart } from 'chart.js';
import { ArcElement, CategoryScale, Decimation, Filler, Legend, Title, Tooltip, LinearScale, PointElement, LineElement } from 'chart.js';

Chart.register(ArcElement, CategoryScale, Decimation, Filler, Legend, Title, Tooltip, LinearScale, PointElement, LineElement);

const ClinicSearch = ({ patientNamesandIDs }) => {
  const [responseContainer, setResponseContainer] = useState('');
  const [patientId, setPatientId] = useState('');
  const [name, setPatientName] = useState('');

  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState('ALS-FRS-R'); // New state variable for selected questionnaire
  const [searchTerm, setSearchTerm] = useState(''); // New state variable for search term



  const handlePatientClick = async (patient) => {
    setResponseContainer('');
    setPatientId(patient.ID);
    setPatientName(`${patient["First Name"]} ${patient["Last Name"]}`)
  };

  useEffect(() => {
    // Clear the response container
    setResponseContainer('');
    // Fetch new responses if a patient is selected
    if (patientId) {
      fetchQuestionnaireResponses(patientId, selectedQuestionnaire);
    }
  }, [selectedQuestionnaire, patientId, name,]); // Add selectedQuestionnaire and patientId as dependencies



  const fetchQuestionnaireResponses = (patientId) => {
    fetch('questionResponses.json')
      .then(response => response.json())
      .then(data => {
        let patientResponses = data.filter(response => response.group === patientId);
  
        if (selectedQuestionnaire) {
          patientResponses = patientResponses.filter(response => response.group_series_2 === selectedQuestionnaire);
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
      responseContent = '<p>No information found.</p>';
    } else {

      let nextResponseValues = null;

      data = data.filter(item => item.group_series_7 === 'scored' || item.group_series_7 === 'complete');
      data.sort((a, b) => new Date(b.group_series_5) - new Date(a.group_series_5));
      for (let i = 0; i <1; i++) {
        const response = data[i];
        if (response.group_series_7 !== 'scored' && response.group_series_7 !== 'complete') {
          continue;
        }

        const questionMapping = getQuestionMapping(response.group_series_2);

        const responseValues = response.group_series_12.split('|').map(value => parseInt(value, 10) + 1);

        if (i < data.length - 1 && selectedQuestionnaire) {
          nextResponseValues = data[i + 1].group_series_12.split('|').map(value => parseInt(value, 10) + 1);
        }


        const questionDescriptions = responseValues.map((value, index) => {
          let score;
          if (index + 1 === 15) {
            // Special scoring for question 15
            const score15Mapping = [4, 3, 3, 2, 2, 2, 1, 0];
            score = score15Mapping[value-1];
          } else {
            score = (index + 1 === 5 || (index + 1 >= 14 && index + 1 < 15) || (index + 1 > 15 && index + 1 <= 23)) ? 'Not scored' : 4 - parseInt(value-1, 10);
          }

          const mapping = questionMapping[index];
          if (value) {
            if (!mapping) {
              return;
            }
            const question = mapping[0];
            
            let description;
            if (questionMapping === alsfrsrQuestionMapping && index + 1 === 17) {
              // Handle multiple selections
              value = value - 1;
              description = Array.from(String(value), Number).map(digit => mapping[digit + 1]).join(', ');
            } else if (questionMapping === weightQuestionMapping && (index + 1 === 3 || index + 1 === 4 || index + 1 === 5)) {
              description = value-1;
            }
            else if (questionMapping === carerQuestionMapping && (index + 1 === 1 || index + 1 === 3)) {
              description = value-1+" Hours";
            }
            else {
              description = mapping[value];
            }

            let nextResponse;
            if (selectedQuestionnaire && nextResponseValues) {
              let nextValue = nextResponseValues[index];
              let nextDescription;
              if (questionMapping === alsfrsrQuestionMapping && index + 1 === 17) {
                // Handle multiple selections
                nextValue = nextValue - 1;
                nextDescription = Array.from(String(nextValue), Number).map(digit => mapping[digit + 1]).join(', ');
              } else if (questionMapping === weightQuestionMapping && (index + 1 === 3 || index + 1 === 4 || index + 1 === 5)) {
                nextDescription = nextValue-1;
              }
              else if (questionMapping === carerQuestionMapping && (index + 1 === 1 || index + 1 === 3)) {
                nextDescription = nextValue-1+" Hours";
              }
              else {
                nextDescription = mapping[nextValue];
              }
              nextResponse = nextDescription;
            }

            let highlight = 0;
            if (selectedQuestionnaire && nextResponseValues) {
              highlight = value > nextResponseValues[index] ? 1 : value < nextResponseValues[index] ? -1 : 0;
            }
            let answerClass;
            if(selectedQuestionnaire === 'Weight'){
              answerClass = highlight === 1 ? 'highlight-green' : highlight === -1 ? 'highlight-red' : '';
            }
            else{
              answerClass = highlight === 1 ? 'highlight-red' : highlight === -1 ? 'highlight-green' : '';
            }
  
            return {
              question: (index + 1) + ': ' + question,
              answer: `<span class="${answerClass}">${description ? description  : 'n/a'}</span>`,
              answerClass,
              nextResponse,
              score,
            };
          }
          else {
            return;
          }
        }).filter(item => item !== undefined);

        let tableString = response.group_series_2 === 'ALS-FRS-R'
        ? '<tr><th>Question</th><th>Answer</th><th>Score</th><th>Previous Answer</th></tr>'
        : '<tr><th>Question</th><th>Answer</th><th>Previous Answer</th></tr>';

        tableString += questionDescriptions.map(({ question, answer, nextResponse, score, answerClass }) => {
          if (answerClass === 'highlight-green' || answerClass === 'highlight-red') {
            if (response.group_series_2 === 'ALS-FRS-R') {
              return `<tr><td>${question}</td><td>${answer}</td><td>${score}</td><td>${nextResponse}</td></tr>`;
            } else {
              return `<tr><td>${question}</td><td>${answer}</td><td>${nextResponse}</td></tr>`;
            }
          }
        }).filter(item => item !== undefined).join('');

        console.log("tabletring:"+tableString);

        responseContent += `
          <div class="response">
            <div class="response-header">
              <p><strong>${response.group_series_2}</strong></p>
              <p> ${formatDate(response.group_series_6)}</p>
            </div>
        `;

        if (response.group_series_2 === 'ALS-FRS-R') {
          const totalScore = questionDescriptions.reduce((total, { score }) => {
            if (typeof score === 'number') {
              return total + score;
            }
            return total;
          }, 0);

          const bulbarScore = questionDescriptions.slice(0, 3).reduce((total, { score }) => {
            if (typeof score === 'number') {
              return total + score;
            }
            return total;
          }, 0);

          const armsScore = questionDescriptions.slice(3, 7).reduce((total, {score}) => {
            if (typeof score === 'number') {
              return total + score;
            }
            return total;
          }, 0);

          const legsScore = questionDescriptions.slice(7, 10).reduce((total, {score}) => {
            if (typeof score === 'number') {
              return total + score;
            }
            return total;
          }, 0);

          const respScore = questionDescriptions.slice(10, 14).reduce((total, {score}) => {
            if (typeof score === 'number') {
              return total + score;
            }
            return total;
          }, 0);

          responseContent += `
            <div class = "scores" >
              <p><blue>Total Score: </blue>${totalScore}</p>
              <p><blue>Bulbar Score:</blue> ${bulbarScore}</p>
              <p><blue>Arms Score:</blue> ${armsScore}</p>
              <p><blue>Legs Score:</blue> ${legsScore}</p>
              <p><blue>Resp Score:</blue> ${respScore}</p>
            </div>
          `;
        }

        responseContent += `
        <table>${tableString}</table>
        <br>
        </div>
        `;
      };
    }

    setResponseContainer(responseContainer => responseContainer + responseContent);
  };

  const getQuestionMapping = (questionnaireType) => {
    switch (questionnaireType) {
      case 'ALS-FRS-R':
        return alsfrsrQuestionMapping;
      case 'Weight':
        return weightQuestionMapping;
      case 'Speech and Swallow':
        return speechAndSwallowQuestionMapping;
      case 'SNAQ':
        return snaqQuestionMapping;
      case 'Carer Support':
        return carerQuestionMapping;
      default:
        return {};
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };


  return (
    <div className='container'>
      <div className='searchAndNames' >
        <div className='search'>
          <form id="search-form">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search patients"
            />
          </form>
        </div>
        <ul className='patient-list'>
          {patientNamesandIDs
            .filter(patient =>
              `${patient["First Name"]} ${patient["Last Name"]}`
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
            )
            .map(patient => (
              <li key={patient.ID} onClick={() => handlePatientClick(patient)}>
                <table className='patients-names '>
                  <tbody>
                    <tr>
                      <td className='table-cell'>{patient["First Name"]}{" "}{patient["Last Name"]}</td>
                    </tr>
                  </tbody>
                </table>
              </li>
            ))}
        </ul>
      </div>
      <div className='responses'>
        <h2>{name}</h2>
        <div className='filters'>
          <div className='questionaireFilter'>
            <button onClick={() => setSelectedQuestionnaire("ALS-FRS-R")}>ALS-FRS-R</button>
            <button onClick={() => setSelectedQuestionnaire("Weight")}>Weight</button>
            <button onClick={() => setSelectedQuestionnaire("Speech and Swallow")}>Speech and Swallow</button>
            <button onClick={() => setSelectedQuestionnaire("SNAQ")}>SNAQ</button>
            <button onClick={() => setSelectedQuestionnaire("Carer Support")}>Carer Support</button>
          </div>
        </div>
        <div id="response-container" className="response-container" dangerouslySetInnerHTML={{ __html: responseContainer }}></div>
      </div>
    </div>
  );
};

export default ClinicSearch;
