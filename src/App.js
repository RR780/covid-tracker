// App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container, Typography, Select, MenuItem, Card, CardContent, Switch, Box, Grid, FormControlLabel
} from '@mui/material';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, Title, Tooltip, Legend,
} from 'chart.js';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './App.css';

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  PointElement, LineElement,
  Title, Tooltip, Legend
);

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('global');
  const [data, setData] = useState(null);
  const [historical, setHistorical] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize AOS animations
  useEffect(() => {
    AOS.init({ duration: 1200, once: true });
  }, []);

  // Fetch countries list once
  useEffect(() => {
    axios.get('https://disease.sh/v3/covid-19/countries')
      .then(res => setCountries(res.data))
      .catch(console.error);
  }, []);

  // Fetch current & historical data when country changes
  useEffect(() => {
    setLoading(true);
    const urlCurrent = selectedCountry === 'global'
      ? 'https://disease.sh/v3/covid-19/all'
      : `https://disease.sh/v3/covid-19/countries/${selectedCountry}`;

    const urlHistorical = selectedCountry === 'global'
      ? 'https://disease.sh/v3/covid-19/historical/all?lastdays=30'
      : `https://disease.sh/v3/covid-19/historical/${selectedCountry}?lastdays=30`;

    axios.all([axios.get(urlCurrent), axios.get(urlHistorical)])
      .then(axios.spread((resCurrent, resHistorical) => {
        setData(resCurrent.data);
        // Historical data nested differently for countries vs global
        setHistorical(selectedCountry === 'global' ? resHistorical.data : resHistorical.data.timeline);
        setLoading(false);
      }))
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedCountry]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  if (loading || !data || !historical) {
    return (
      <Box
        className={darkMode ? 'app dark' : 'app'}
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Typography variant="h6" color="textSecondary">
          Loading...
        </Typography>
      </Box>
    );
  }

  // Prepare Bar Chart (current data)
  const barData = {
    labels: ['Cases', 'Deaths', 'Recovered'],
    datasets: [{
      label: 'Count',
      data: [data.cases, data.deaths, data.recovered],
      backgroundColor: ['#2979ff', '#d32f2f', '#388e3c'],
      borderRadius: 6,
    }]
  };

  // Prepare Line Chart (historical cases over last 30 days)
  const lineData = {
    labels: Object.keys(historical.cases),
    datasets: [{
      label: 'Cases',
      data: Object.values(historical.cases),
      fill: true,
      backgroundColor: darkMode
        ? 'rgba(41, 121, 255, 0.3)'
        : 'rgba(41, 121, 255, 0.1)',
      borderColor: '#2979ff',
      tension: 0.3,
      pointRadius: 3,
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, labels: { color: darkMode ? '#eee' : '#222' } },
      title: { display: false },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      x: { ticks: { color: darkMode ? '#eee' : '#222' } },
      y: { ticks: { color: darkMode ? '#eee' : '#222' }, beginAtZero: true }
    },
    interaction: { mode: 'nearest', axis: 'x', intersect: false }
  };

  return (
    <Box className={darkMode ? 'app dark' : 'app'}>
      <Container maxWidth="md" sx={{ pt: 5, pb: 8 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
          data-aos="fade-down"
        >
          <Typography variant="h3" component="h1" sx={{ fontWeight: '700' }}>
            COVID-19 Tracker
          </Typography>

          <FormControlLabel
            control={
              <Switch checked={darkMode} onChange={toggleDarkMode} color="primary" />
            }
            label={darkMode ? 'Dark Mode' : 'Light Mode'}
          />
        </Box>

        <Box mb={5} data-aos="fade-up">
          <Select
            fullWidth
            value={selectedCountry}
            onChange={e => setSelectedCountry(e.target.value)}
            sx={{
              fontWeight: 600,
              borderRadius: '10px',
              background: darkMode ? 'rgba(255 255 255 / 0.05)' : '#fff',
              boxShadow: darkMode
                ? '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
                : '0 4px 8px rgba(0,0,0,0.1)',
            }}
          >
            <MenuItem value="global">🌍 Global</MenuItem>
            {countries.map(country => (
              <MenuItem key={country.countryInfo._id || country.country} value={country.country}>
                {country.country}
              </MenuItem>
            ))}
          </Select>
        </Box>

        <Grid container spacing={3} mb={5}>
          {[{
            label: 'Total Cases',
            value: data.cases,
            bg: 'rgba(41, 121, 255, 0.25)',
            color: '#2979ff'
          }, {
            label: 'Total Deaths',
            value: data.deaths,
            bg: 'rgba(211, 47, 47, 0.25)',
            color: '#d32f2f'
          }, {
            label: 'Total Recovered',
            value: data.recovered,
            bg: 'rgba(56, 142, 60, 0.25)',
            color: '#388e3c'
          }].map(({ label, value, bg, color }) => (
            <Grid item xs={12} sm={4} key={label} data-aos="zoom-in">
              <Card className="glass-card" sx={{ backgroundColor: bg, borderColor: color, borderWidth: '2px' }}>
                <CardContent>
                  <Typography variant="subtitle1" color={color} fontWeight="600">
                    {label}
                  </Typography>
                  <Typography variant="h5" fontWeight="700" sx={{ mt: 1 }}>
                    {value.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={4} data-aos="fade-up">
          <Grid item xs={12} md={6}>
            <Card className="glass-card" sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight="700" mb={2}>
                Current Stats (Bar Chart)
              </Typography>
              <Bar data={barData} options={chartOptions} />
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card className="glass-card" sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight="700" mb={2}>
                Cases in Last 30 Days (Line Chart)
              </Typography>
              <Line data={lineData} options={chartOptions} />
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default App;