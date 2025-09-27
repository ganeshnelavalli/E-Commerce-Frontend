import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import './styles.css'
import axios from "axios";

axios.defaults.withCredentials = true;
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