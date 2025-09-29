// import React, { useState } from 'react'

// export default function Login({ setAuth }){
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')

//   function handleSubmit(e){
//     e.preventDefault()
//     if(email === 'demo@shop.com' && password === 'demo123'){
//       setAuth(true)
//     } else {
//       alert('Invalid credentials. Use demo@shop.com / demo123')
//     }
//   }

//   return (
//     <div className="d-flex align-items-center justify-content-center vh-100 hero-gradient">
//       <div className="card p-4 shadow" style={{width: 360, borderRadius: 12}}>
//         <h3 className="text-center mb-3">Sai Shoppings — Login</h3>
//         <form onSubmit={handleSubmit}>
//           <div className="mb-3">
//             <label className="form-label">Email</label>
//             <input type="email" className="form-control" value={email} onChange={e=>setEmail(e.target.value)} placeholder="demo@shop.com" required />
//           </div>
//           <div className="mb-3">
//             <label className="form-label">Password</label>
//             <input type="password" className="form-control" value={password} onChange={e=>setPassword(e.target.value)} placeholder="demo123" required />
//           </div>
//           <button className="btn btn-primary w-100" type="submit">Login</button>
//           <small className="d-block text-center mt-2 text-white-50">Demo: demo@shop.com / demo123</small>
//         </form>
//       </div>
//     </div>
//   )
// }
import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Auth({ setAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_BASE = "/api/"; // use Vite proxy to avoid cross-site cookies

  // ---------------- Axios defaults ----------------
  axios.defaults.withCredentials = true;

  // ---------------- CSRF Helper ----------------
  const getCookie = (name) => {
    const cookies = document.cookie.split(";").map(c => c.trim());
    for (let cookie of cookies) {
      if (cookie.startsWith(name + "=")) {
        return decodeURIComponent(cookie.substring(name.length + 1));
      }
    }
    return null;
  };

  // Attach CSRF token to all Axios requests
  axios.interceptors.request.use((config) => {
    const token = getCookie("csrftoken");
    if (token) config.headers["X-CSRFToken"] = token;
    return config;
  });

  // ---------------- Persist login on refresh ----------------
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await axios.get(API_BASE + "session/");
        if (res.data.is_authenticated) setAuth(true);
      } catch {
        console.log("No active session");
      }
    };
    checkSession();
  }, [setAuth]);

  // ---------------- LOGIN ----------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(API_BASE + "login/", loginData);
      if (res.data.success) {
        setAuth(true);
        setLoginData({ email: "", password: "" });
        // refresh session status immediately after login
        try { await axios.get(API_BASE + 'session/'); } catch {}
      } else {
        setError(res.data.error || "Invalid credentials.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed.");
    }
  };

  // ---------------- REGISTER ----------------
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    // Validate form
    if (!registerData.username || !registerData.email || !registerData.password) {
      setError("Username, email, and password are required");
      return;
    }
    
    try {
      const res = await axios.post(API_BASE + "register/", registerData);
      if (res.data.success) {
        setSuccess("Registration successful! You can now log in.");
        // Auto-fill login form with registration data
        setLoginData({
          email: registerData.email,
          password: registerData.password
        });
        // Clear registration form
        setRegisterData({
          first_name: "",
          last_name: "",
          username: "",
          email: "",
          password: "",
        });
        // Switch to login view
        setIsLogin(true);
        // Attempt automatic login
        try {
          const loginRes = await axios.post(API_BASE + "login/", {
            email: registerData.email,
            password: registerData.password
          });
          if (loginRes.data.success) {
            await axios.get(API_BASE + 'session/');
            setAuth(true);
          }
        } catch (loginErr) {
          // Silent fail - user can still login manually
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed.");
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="card p-4 shadow mx-3" style={{ width: '100%', maxWidth: 400, borderRadius: 12 }}>
        {/* Toggle Buttons */}
        <div className="d-flex mb-3">
          <button
            className={`btn w-50 ${isLogin ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => {
              setIsLogin(true);
              setError("");
              setSuccess("");
            }}
          >
            Login
          </button>
          <button
            className={`btn w-50 ${!isLogin ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => {
              setIsLogin(false);
              setError("");
              setSuccess("");
            }}
          >
            Register
          </button>
        </div>

        {/* LOGIN FORM */}
        {isLogin ? (
          <form onSubmit={handleLogin}>
            <input
              type="email"
              className="form-control mb-3"
              placeholder="Email"
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              required
            />
            <input
              type="password"
              className="form-control mb-3"
              placeholder="Password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              required
            />
            {error && <div className="text-danger mb-2">{error}</div>}
            <button className="btn btn-primary w-100" type="submit">Login</button>
          </form>
        ) : (
          // REGISTER FORM
          <form onSubmit={handleRegister}>
            <div className="row g-2 mb-3">
              <div className="col-12 col-sm-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="First Name"
                  value={registerData.first_name}
                  onChange={(e) => setRegisterData({ ...registerData, first_name: e.target.value })}
                  required
                />
              </div>
              <div className="col-12 col-sm-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Last Name"
                  value={registerData.last_name}
                  onChange={(e) => setRegisterData({ ...registerData, last_name: e.target.value })}
                  required
                />
              </div>
            </div>
            <input
              type="text"
              className="form-control mb-3"
              placeholder="Username"
              value={registerData.username}
              onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
              required
            />
            <input
              type="email"
              className="form-control mb-3"
              placeholder="Email"
              value={registerData.email}
              onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
              required
            />
            <input
              type="password"
              className="form-control mb-3"
              placeholder="Password"
              value={registerData.password}
              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
              required
            />
            {error && <div className="text-danger mb-2">{error}</div>}
            {success && <div className="text-success mb-2">{success}</div>}
            <button className="btn btn-primary w-100" type="submit">Register</button>
          </form>
        )}
      </div>
    </div>
  );
}
