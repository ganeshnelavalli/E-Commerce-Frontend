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
  const [googleClientId, setGoogleClientId] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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

  // ---------------- Load Google Client ID ----------------
  useEffect(() => {
    const loadGoogleConfig = async () => {
      try {
        const res = await axios.get(API_BASE + "google-config/");
        if (res.data.success) {
          setGoogleClientId(res.data.client_id);
          loadGoogleScript();
        }
      } catch (err) {
        console.error("Failed to load Google config:", err);
      }
    };
    loadGoogleConfig();
  }, []);

  // ---------------- Initialize Google Sign-In when client ID is available ----------------
  useEffect(() => {
    if (googleClientId && window.google) {
      initializeGoogleSignIn();
    }
  }, [googleClientId]);

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

  // ---------------- Load Google Script ----------------
  const loadGoogleScript = () => {
    if (window.google) {
      initializeGoogleSignIn();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google && googleClientId) {
        initializeGoogleSignIn();
      }
    };
    document.head.appendChild(script);
  };

  // ---------------- Initialize Google Sign-In ----------------
  const initializeGoogleSignIn = () => {
    if (!window.google || !googleClientId) return;

    // Initialize Google Sign-In with proper configuration
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleGoogleResponse,
      auto_select: false,
      cancel_on_tap_outside: false,
      context: 'signin',
      ux_mode: 'popup',
      use_fedcm_for_prompt: true
    });
  };

  // ---------------- Handle Google Response ----------------
  const handleGoogleResponse = async (response) => {
    setIsGoogleLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log("Google response:", response);
      
      const res = await axios.post(API_BASE + "google-auth/", {
        id_token: response.credential
      });

      console.log("Backend response:", res.data);

      if (res.data.success) {
        setAuth(true);
        setSuccess(res.data.message || "Login successful!");
        
        // Refresh session status
        try {
          await axios.get(API_BASE + 'session/');
        } catch {}
      } else {
        setError(res.data.error || "Google authentication failed");
      }
    } catch (err) {
      console.error("Google auth error:", err);
      setError(err.response?.data?.error || "Google authentication failed");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // ---------------- Google Sign-In Button ----------------
  const handleGoogleSignIn = () => {
    console.log("Google Sign-In clicked");
    console.log("Google available:", !!window.google);
    console.log("Google accounts available:", !!(window.google && window.google.accounts));
    console.log("Client ID available:", !!googleClientId);
    
    if (!window.google || !window.google.accounts || !googleClientId) {
      setError("Google Sign-In not available. Please try again.");
      return;
    }

    setIsGoogleLoading(true);
    setError("");

    try {
      // Use the proper Google Sign-In popup method
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: googleClientId,
        scope: 'openid email profile',
        callback: async (response) => {
          console.log("OAuth2 response:", response);
          
          if (response.access_token) {
            // Get user info using the access token
            try {
              const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                  'Authorization': `Bearer ${response.access_token}`
                }
              });
              const userInfo = await userInfoResponse.json();
              console.log("User info:", userInfo);
              
              // Create a mock ID token response for our backend
              const mockIdToken = {
                credential: JSON.stringify({
                  sub: userInfo.id,
                  email: userInfo.email,
                  name: userInfo.name,
                  given_name: userInfo.given_name,
                  family_name: userInfo.family_name,
                  picture: userInfo.picture
                })
              };
              
              await handleGoogleResponse(mockIdToken);
            } catch (error) {
              console.error('Error fetching user info:', error);
              setError('Failed to get user information from Google');
              setIsGoogleLoading(false);
            }
          } else {
            console.error('No access token received');
            setError('Failed to get access token from Google');
            setIsGoogleLoading(false);
          }
        },
        error_callback: (error) => {
          console.error('OAuth2 error:', error);
          setError('Google Sign-In failed. Please try again.');
          setIsGoogleLoading(false);
        }
      });
      
      tokenClient.requestAccessToken();
    } catch (error) {
      console.error('Google Sign-In error:', error);
      setError('Google Sign-In failed. Please try again.');
      setIsGoogleLoading(false);
    }
  };

  const renderGoogleSignInButton = () => {
    if (!googleClientId) return null;

    return (
      <div className="google-signin-container">
        <div 
          id="google-signin-button" 
          className="google-signin-btn"
          onClick={handleGoogleSignIn}
        >
          <div className="google-btn-content">
            {isGoogleLoading ? (
              <div className="google-loading">
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                Authenticating...
              </div>
            ) : (
              <>
                <svg className="google-icon" width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {isLogin ? "Sign in with Google" : "Sign up with Google"}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

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
            {success && <div className="text-success mb-2">{success}</div>}
            <button className="btn btn-primary w-100" type="submit">Login</button>
            
            {/* Divider */}
            <div className="divider-container my-3">
              <div className="divider-line"></div>
              <span className="divider-text">or</span>
              <div className="divider-line"></div>
            </div>
            
            {/* Google Sign-In Button */}
            {renderGoogleSignInButton()}
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
            
            {/* Divider */}
            <div className="divider-container my-3">
              <div className="divider-line"></div>
              <span className="divider-text">or</span>
              <div className="divider-line"></div>
            </div>
            
            {/* Google Sign-In Button */}
            {renderGoogleSignInButton()}
          </form>
        )}
      </div>
    </div>
  );
}
