import React, { useEffect, useState } from 'react';
import axios from 'axios';

function CovidTracker() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Fetch data when component mounts
    axios.get('https://disease.sh/v3/covid-19/all')
      .then(response => setData(response.data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>COVID-19 Tracker - Global Data</h1>
      <p><strong>Total Cases:</strong> {data.cases.toLocaleString()}</p>
      <p><strong>Total Deaths:</strong> {data.deaths.toLocaleString()}</p>
      <p><strong>Total Recovered:</strong> {data.recovered.toLocaleString()}</p>
    </div>
  );
}

export default CovidTracker;