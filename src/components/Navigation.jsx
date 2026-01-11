import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Navigation.css'

function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <>
      <button 
        className={`nav-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <nav className={`main-navigation ${isOpen ? 'open' : ''}`}>
        <div className="nav-content">
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
            onClick={() => setIsOpen(false)}
          >
            home
          </Link>
          <Link 
            to="/j0-in-the-wrld" 
            className={`nav-link ${isActive('/j0-in-the-wrld') ? 'active' : ''}`}
            onClick={() => setIsOpen(false)}
          >
            j0 in the wrld
          </Link>
        </div>
      </nav>
    </>
  )
}

export default Navigation
