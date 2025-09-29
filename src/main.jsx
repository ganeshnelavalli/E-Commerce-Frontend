import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import './styles.css'
import axios from "axios";

// Use the API URL defined in vite.config.js
const API_URL = import.meta.env.PROD ? __API_BASE_URL__ : '';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = API_URL;
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
// import React from "react";
// import ReactDOM from "react-dom/client";
// import "./styles.css";

// import Button from 'react-bootstrap/Button';
// import { BrowserRouter } from "react-router-dom";

// ReactDOM.createRoot(document.getElementById("root")).render(
//   <BrowserRouter>
//       <Button>Boot-Strap@-Button</Button>
//   </BrowserRouter>
// );