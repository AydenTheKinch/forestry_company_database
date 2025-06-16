import React from 'react';
import './App.css';
import ContractorRegistry from './containers/ContractorRegistry';
import 'leaflet/dist/leaflet.css';

//Google Maps API Key: AIzaSyBN5pkubcMQjEFm6Rv5Pm8AJruE8AYiFIM

//const API_KEY = 'AIzaSyBN5pkubcMQjEFm6Rv5Pm8AJruE8AYiFIM'

function App() {
  return (
    <div className="App">
      <ContractorRegistry />
    </div>
  );
}

export default App;