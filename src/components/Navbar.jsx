import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Navbar({ setAuth, cartCount, onToggleSidebar, sidebarOpen }){
  const nav = useNavigate()

  async function handleLogout(){
    try{
      await axios.post('/api/logout/', {}, { withCredentials: true })
    }catch(e){
      // ignore
    }
    setAuth(false)
    nav('/')
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm modern-navbar">
      <div className="container">
        <button className={`hamburger me-2 ${sidebarOpen ? 'is-active' : ''}`} onClick={onToggleSidebar} aria-label="Toggle sidebar" aria-expanded={sidebarOpen} aria-controls="navMenu">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <Link className="navbar-brand fw-semibold" to="/home">Shopping Store</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navMenu">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item"><Link className="nav-link" to="/home">Home</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/products">Products</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/cart">Cart {cartCount>0 && (<span className="badge bg-danger ms-1">{cartCount}</span>)}</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/profile">Profile</Link></li>
          </ul>
          <div className="d-flex">
            <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>
    </nav>
  )
}
