import React from 'react';
import './App.css';
import PatientSearch from './components/PatientSearch';

function App() {
  return (
    <div className="App">
        <h1>Patient Search</h1>
      <main>
        <PatientSearch /> {/* Render the PatientSearch component */}
      </main>
    </div>
  );
}

export default App;