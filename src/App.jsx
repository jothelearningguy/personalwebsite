import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import GlobalCursor from './components/GlobalCursor'
// CSS imported normally - Vite will extract it in production
// Critical CSS is inlined in index.html to prevent render blocking
import('./App.css')

// Lazy load routes for code splitting - improves initial load time
const Home = lazy(() => import('./components/Home'))
const J0InTheWrld = lazy(() => import('./components/J0InTheWrld'))

// Minimal loading fallback - doesn't block initial render
const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '100vh',
    color: '#f0f0f0',
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', // Use system font for instant display
    fontSize: '1rem',
    opacity: 0.7
  }}>
    Loading...
  </div>
)

function App() {
  return (
    <Router>
      <GlobalCursor />
      <Navigation />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/j0-in-the-wrld" element={<J0InTheWrld />} />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App
