// components/CarerSearch.js

import React, { useState, useEffect } from 'react';
import carerQuestionMapping from './data/carerQuestionMapping';
import './PatientSearch.css';
import { Doughnut } from 'react-chartjs-2';
import { Chart } from 'chart.js';
import { ArcElement, CategoryScale, Decimation, Filler, Legend, Title, Tooltip, LinearScale, PointElement, LineElement } from 'chart.js';
import { Line } from 'react-chartjs-2'; // Import Line from react-chartjs-2

Chart.register(ArcElement, CategoryScale, Decimation, Filler, Legend, Title, Tooltip, LinearScale, PointElement, LineElement);
const CarerSearch = ({ patientNamesandIDs }) => {
  const [responseContainer, setResponseContainer] = useState('');
  const [patientId, setPatientId] = useState('');
  const [name, setPatientName] = useState('');
  // const [firstName, setFirstName] = useState('');
  // const [lastName, setLastName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // New state variable for search term
  // const [patientResponses, setPatientResponses] = useState([]);
  const [percentageCompleted, setPercentageCompleted] = useState(0);
  const [engagementPerYear, setEngagementPerYear] = useState([]);
  const [areChartsVisible, setChartsVisible] = useState(false);
  const [total, setTotal] = useState(0);
  const [completed, setCompleted] = useState(0);


  const handlePatientClick = (patient) => {
    setResponseContainer('');
    setPatientId(patient.ID);
    setPatientName(`${patient["First Name"]} ${patient["Last Name"]}`)
    setChartsVisible(true);
    // displayPatientInfo(name, patient.ID);
    // fetchQuestionnaireResponses(patient.ID); // Pass selected questionnaire type to fetch function
  };

  useEffect(() => {
    // Clear the response container
    setResponseContainer('');
    // Fetch new responses if a patient is selected
    if (patientId) {
      fetchQuestionnaireResponses(patientId);
    }
  }, [patientId, startDate, endDate, name,percentageCompleted]);


  const countCompletedQuestionnaires = (responses) => {
    let total = 0;
    let completed = 0;
  
    responses.forEach(response => {
      total++;
      if (response.group_series_7 === 'complete') {
        completed++;
      }
    });
  
    return { total, completed };
  };

  const fetchQuestionnaireResponses = (patientId) => {
    fetch('questionResponses.json')
      .then(response => response.json())
      .then(data => {
        let patientResponses = data.filter(response => response.group === patientId);
  
        patientResponses = patientResponses.filter(response => response.group_series_2 === 'Carer Support');
  
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
          const { total, completed } = countCompletedQuestionnaires(responses);
          const engagement = ((completed / total) * 100).toFixed(1);
          return { year, engagement };
        }));
        
        // Then, calculate total engagement for each year
        const { total, completed } = countCompletedQuestionnaires(patientResponses);
        setTotal(total);
        setCompleted(completed);
        setPercentageCompleted(((completed / total) * 100).toFixed(1));    
        displayPatientResponses(patientResponses);
        
      })
      .catch(error => {
        console.error('Error fetching JSON file:', error);
        setResponseContainer('Error fetching response JSON file.');
      });
  };

  const displayPatientResponses = (data) => {
    // console.log(name);
    // console.log(`Percentage of Completed questionnaires: ${percentageCompleted}%`);

    let responseContent = '';

    if (data.length === 0) {
      responseContent = '<p>No questionnaires found.</p>';
    } else {

      let nextResponseValues = null;

      data = data.filter(item => item.group_series_7 === 'completed');
      data.sort((a, b) => new Date(b.group_series_5) - new Date(a.group_series_5));
      for (let i = 0; i < data.length; i++) {
        const response = data[i];
        if (response.group_series_7 !== 'completed') {
          continue;
        }

        const questionMapping = carerQuestionMapping;

        const responseValues = response.group_series_12.split('|').map(value => parseInt(value, 10) + 1);

        if (i < data.length - 1 ) {
          nextResponseValues = data[i + 1].group_series_12.split('|').map(value => parseInt(value, 10) + 1);
        }

        const questionDescriptions = responseValues.map((value, index) => {

          const mapping = questionMapping[index];
          if (value) {
            if (!mapping) {
              return;
            }
            const question = mapping[0];
            let description;
            // if (questionMapping === alsfrsrQuestionMapping && index + 1 === 17) {
            //   // Handle multiple selections
            //   value = value - 1;
            //   description = Array.from(String(value), Number).map(digit => mapping[digit + 1]).join(', ');
            // } else {
              description = mapping[value];
            // }

            let highlight = 0;
            if (nextResponseValues) {
              highlight = value > nextResponseValues[index] ? 1 : value < nextResponseValues[index] ? -1 : 0;
            }
            const answerClass = highlight === 1 ? 'highlight-red' : highlight === -1 ? 'highlight-green' : '';
            console.log('highlight', highlight);

            return {
              question: (index + 1) + ': ' + question,
              answer: `<span class="${answerClass}">${description ? description  : 'n/a'}</span>`,
              highlight,
            };
          }
          else {
            return;
          }
        }).filter(item => item !== undefined);

        const tableString = questionDescriptions.map(({ question, answer }) => `<tr><td>${question}</td><td>${answer}</td></tr>`).join('');

        responseContent += `
          <div class="response">
            <div class="response-header">
              <p><strong>${response.group_series_2}</strong></p>
              <p> ${formatDate(response.group_series_6)}</p>
            </div>
            <table>${tableString}</table>
            <br>
          </div>
        `;
      };
    }

    setResponseContainer(responseContainer => responseContainer + responseContent);
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
        data: [percentageCompleted, 100 - percentageCompleted],
        backgroundColor: ['blue', 'grey'],
      }
    ]
  };

  const doughnutChartOptions = {
    plugins: {
      title: {
        display: true,
        text: 'Overall engagement for ' + name+'.',
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
      label: ' engagement over time',
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
              placeholder="Search Carers"
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
            <h3>{name}'s Charts</h3>
            <div className='charts'>
              <div className="doughnut-chart">
                <Doughnut data={doughnughtChartData} options={doughnutChartOptions} />
              </div>
              <div className="line-chart">
                <Line data={lineChartData} options={lineChartOptions} />          
              </div>
            </div>
            <p> {name} has received a total of {total} questionaires {startDate && endDate && `from ${startDate} to ${endDate}`} and has responded to {completed} ({percentageCompleted}%)  of them.</p>
          </div>
        )}
        <div id="response-container" className="response-container" dangerouslySetInnerHTML={{ __html: responseContainer }}></div>
      </div>
    </div>
  );
};

export default CarerSearch;
