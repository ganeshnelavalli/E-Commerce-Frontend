import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Sidebar({ isAdmin, onNavigate }){
  const { pathname } = useLocation();
  const isActive = (path) => pathname.startsWith(path);

  return (
    <div className="sidebar bg-dark text-white p-3 rounded-3 h-100 d-flex flex-column">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h6 className="m-0 text-white-50">Navigation</h6>
        {isAdmin ? <span className="badge bg-warning text-dark">Admin</span> : <span className="badge bg-secondary">User</span>}
      </div>

      <div className="side-section">
        <div className="side-label">General</div>
        <ul className="nav flex-column gap-1">
          <li className="nav-item">
            <Link className={`nav-link sidebar-link ${isActive('/home') ? 'active' : ''}`} to="/home" onClick={onNavigate}>
              <span className="me-2">🏠</span> Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link sidebar-link ${isActive('/products') ? 'active' : ''}`} to="/products" onClick={onNavigate}>
              <span className="me-2">🛒</span> Products
            </Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link sidebar-link ${isActive('/cart') ? 'active' : ''}`} to="/cart" onClick={onNavigate}>
              <span className="me-2">🧺</span> Cart
            </Link>
          </li>
        </ul>
      </div>

      {isAdmin && (
        <div className="side-section mt-3">
          <div className="side-label">Admin</div>
          <ul className="nav flex-column gap-1">
            <li className="nav-item">
              <Link className="nav-link sidebar-link" to="/home#admin-users" onClick={onNavigate}>
                <span className="me-2">👥</span> Manage Users
              </Link>
            </li>
          </ul>
          <div className="mt-2 p-2 rounded-2 bg-black bg-opacity-25 small">
            Keep your store updated and manage users securely.
          </div>
        </div>
      )}

      <div className="side-section mt-3">
        <div className="side-label">Account</div>
        <ul className="nav flex-column gap-1">
          <li className="nav-item">
            <Link className={`nav-link sidebar-link ${isActive('/profile') ? 'active' : ''}`} to="/profile" onClick={onNavigate}>
              <span className="me-2">👤</span> Profile
            </Link>
          </li>
        </ul>
      </div>

      <div className="mt-auto small text-secondary">
        Tip: Use the top-left button on mobile to toggle this menu.
      </div>
    </div>
  )
}


