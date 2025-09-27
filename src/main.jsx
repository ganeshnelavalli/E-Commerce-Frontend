import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import './styles.css'
import axios from "axios";
import { API_BASE_URL } from './config';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = API_BASE_URL;
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