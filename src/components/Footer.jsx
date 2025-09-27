import React from 'react'

export default function Footer(){
  return (
    <footer className="mt-5 py-4 bg-light border-top">
      <div className="container d-flex justify-content-between align-items-center">
        <span className="text-muted">© {new Date().getFullYear()} Sai Shoppings</span>
        <div className="d-flex gap-3">
          <a href="#about" className="link-secondary text-decoration-none">About</a>
          <a href="#contact" className="link-secondary text-decoration-none">Contact</a>
          <a href="#privacy" className="link-secondary text-decoration-none">Privacy</a>
        </div>
      </div>
    </footer>
  )
}


