// components/PatientSearch.js

import React, { useState, useEffect } from 'react';
import alsfrsrQuestionMapping from './data/alsfrsrQuestionMapping'; 
import weightQuestionMapping from './data/weightQuestionMapping'; 
import speechAndSwallowQuestionMapping from './data/speechAndSwallowQuestionMapping'; 
import snaqQuestionMapping from './data/snaqQuestionMapping'; 
import carerQuestionMapping from './data/carerQuestionMapping'; 
import './PatientSearch.css';
import { Doughnut } from 'react-chartjs-2';
import { Chart } from 'chart.js';
import { ArcElement, CategoryScale, Decimation, Filler, Legend, Title, Tooltip, LinearScale, PointElement, LineElement } from 'chart.js';
import { Line } from 'react-chartjs-2'; // Import Line from react-chartjs-2

Chart.register(ArcElement, CategoryScale, Decimation, Filler, Legend, Title, Tooltip, LinearScale, PointElement, LineElement);
const PatientSearch = ({ patientNamesandIDs }) => {
  const [responseContainer, setResponseContainer] = useState('');
  const [patientId, setPatientId] = useState('');
  const [name, setPatientName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState(''); 
  const [searchTerm, setSearchTerm] = useState('');
  const [percentageScored, setPercentageScored] = useState(0);
  const [engagementPerYear, setEngagementPerYear] = useState([]);
  const [areChartsVisible, setChartsVisible] = useState(false);
  const [total, setTotal] = useState(0);
  const [scored, setScored] = useState(0);


  const handlePatientClick = (patient) => {
    setResponseContainer('');
    setPatientId(patient.ID);
    setPatientName(`${patient["First Name"]} ${patient["Last Name"]}`)
    setChartsVisible(true);
    
  };

  useEffect(() => {
    // Clear the response container
    setResponseContainer('');
    // Fetch new responses if a patient is selected
    if (patientId) {
      fetchQuestionnaireResponses(patientId, selectedQuestionnaire);
    }
  }, [selectedQuestionnaire, patientId, startDate, endDate, name,percentageScored]); // Add dependencies


  const countScoredQuestionnaires = (responses) => {
    let total = 0;
    let scored = 0;
  
    responses.forEach(response => {
      total++;
      if (response.group_series_7 === 'scored' || response.group_series_7 === 'complete') {
        scored++;
      }
    });
  
    return { total, scored };
  };

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
            const completedDate = new Date(response.group_series_6);
            return completedDate >= start && completedDate <= end;
          });
        }

        const responsesByYear = patientResponses.reduce((acc, response) => {
          const year = new Date(response.group_series_5).getFullYear();
          if (!acc[year]) {
            acc[year] = [];
          }
          acc[year].push(response);
          // console.log(acc);
          return acc;
        }, {});


        // Then, calculate total engagement for each year
        setEngagementPerYear(Object.entries(responsesByYear).map(([year, responses]) => {
          const { total, scored } = countScoredQuestionnaires(responses);
          const engagement = ((scored / total) * 100).toFixed(1);
          return { year, engagement };
        }));
        
        // Then, calculate total engagement for each year
        const { total, scored } = countScoredQuestionnaires(patientResponses);
        setTotal(total);
        setScored(scored);
        setPercentageScored(((scored / total) * 100).toFixed(1));    
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

      let nextResponseValues = null;

      data = data.filter(item => item.group_series_7 === 'scored' || item.group_series_7 === 'complete');
      data.sort((a, b) => new Date(b.group_series_5) - new Date(a.group_series_5));
      for (let i = 0; i < data.length; i++) {
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
            console.log('highlight', highlight);

            return {
              question: (index + 1) + ': ' + question,
              answer: `<span class="${answerClass}">${description ? description  : 'n/a'}</span>`,
              highlight,
              score,
            };
          }
          else {
            return;
          }
        }).filter(item => item !== undefined);

        
        let tableString = response.group_series_2 === 'ALS-FRS-R'
        ? '<tr><th>Question</th><th>Answer</th><th>Score</th></tr>'
        : '<tr><th>Question</th><th>Answer</th></tr>';

        tableString += questionDescriptions.map(({ question, answer, score }) => {
          if (response.group_series_2 === 'ALS-FRS-R') {
            return `<tr><td>${question}</td><td>${answer}</td><td>${score}</td></tr>`;
          } else {
            return `<tr><td>${question}</td><td>${answer}</td></tr>`;
          }
        }).join('');

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
            // const { score } = questionDescriptions[index];
            if (typeof score === 'number') {
              return total + score;
            }
            return total;
          }, 0);

          const legsScore = questionDescriptions.slice(7, 10).reduce((total, {score}) => {
            // const { score } = questionDescriptions[index];
            if (typeof score === 'number') {
              return total + score;
            }
            return total;
          }, 0);

          const respScore = questionDescriptions.slice(10, 14).reduce((total, {score}) => {
            // const { score } = questionDescriptions[index];
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

  const doughnughtChartData = {
    labels: ['completed', 'Not completed'],
    datasets: [
      {
        label: 'Engagement:',
        data: [percentageScored, 100 - percentageScored],
        backgroundColor: ['blue', 'grey'],
      }
    ]
  };

  const doughnutChartOptions = {
    plugins: {
      title: {
        display: true,
        text: 'Overall' + selectedQuestionnaire+' engagement for ' + name+'.',
      },
      legend: {
        display: true,
        position: 'bottom'
      },
    }
  };
  
  const lineChartData = {
    labels: engagementPerYear.map(item => item.year),
    datasets: [{
      label: selectedQuestionnaire + ' engagement over time',
      data: engagementPerYear.map(item => item.engagement),
      // fill: false,
      backgroundColor: 'blue',
      borderColor: 'grey',
    }],
  };

  const lineChartOptions = {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Year'
        }
      },
      y: {
        title: {
          display: true,
          text: '% of questionnaires answered'
        },
        ticks: {
          callback: function(value) {
            return value+'%'; // convert the value to a string and remove the decimal part
          }
        }
      }
    }
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
            {/* <input type="text" id="last-name" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} /> */}
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
            <label htmlFor="questionnaireSelect">Questionnaire: </label>
            <select id="questionnaireSelect" value={selectedQuestionnaire} onChange={e => setSelectedQuestionnaire(e.target.value)}>
              <option value="">All questionnaires</option>
              <option value="ALS-FRS-R">ALS-FRS-R</option>
              <option value="Weight">Weight</option>
              <option value="Speech and Swallow">Speech and Swallow</option>
              <option value="SNAQ">SNAQ</option>
              <option value="Carer Support">Carer Support</option>

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
        <button onClick={() => setChartsVisible(!areChartsVisible)}>
          {areChartsVisible ? 'Hide Charts' : 'Show Charts'}
        </button>
        {areChartsVisible && (
          <div className='charts-and-title'>
            <h3>{name}'s {selectedQuestionnaire} Charts</h3>
            <div className='charts'>
              <div className="doughnut-chart">
                <Doughnut data={doughnughtChartData} options={doughnutChartOptions} />
              </div>
              <div className="line-chart">
                <Line data={lineChartData} options={lineChartOptions} />          
              </div>
            </div>
            <p> {name} has received a total of {total} {selectedQuestionnaire} questionaires {startDate && endDate && `from ${startDate} to ${endDate}`} and has responded to {scored} ({percentageScored}%)  of them.</p>
          </div>
        )}
        <div id="response-container" className="response-container" dangerouslySetInnerHTML={{ __html: responseContainer }}></div>
      </div>
    </div>
  );
};

export default PatientSearch;
