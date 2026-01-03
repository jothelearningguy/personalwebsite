import React, { useEffect, useRef, useCallback, useState } from 'react'
import { useLocation } from 'react-router-dom'
import '../App.css'

function GlobalCursor() {
  const cursorElementRef = useRef(null)
  const cursorGlowRef = useRef(null)
  const cursorRafRef = useRef(null)
  const mousePosRef = useRef({ x: 0, y: 0 })
  const location = useLocation()
  const [isMobile, setIsMobile] = useState(() => 
    window.innerWidth <= 768 || ('ontouchstart' in window && window.matchMedia('(pointer: coarse)').matches)
  )

  // Only show on non-home pages (home has its own cursor)
  const isHomePage = location.pathname === '/'

  // Optimized mouse position update with direct DOM manipulation
  const updateMousePosition = useCallback((x, y) => {
    mousePosRef.current = { x, y }
    
    // Update cursor position directly via DOM for zero-lag performance
    if (cursorRafRef.current) cancelAnimationFrame(cursorRafRef.current)
    
    cursorRafRef.current = requestAnimationFrame(() => {
      if (cursorElementRef.current && !isHomePage) {
        cursorElementRef.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(2deg)`
      }
      if (cursorGlowRef.current && !isMobile && !isHomePage) {
        cursorGlowRef.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`
      }
    })
  }, [isMobile, isHomePage])

  // Mouse move handler
  const handleMouseMove = useCallback((e) => {
    updateMousePosition(e.clientX, e.clientY)
  }, [updateMousePosition])

  // Set up event listeners
  useEffect(() => {
    if (isMobile || isHomePage) return // Don't show cursor on mobile or home page
    
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (cursorRafRef.current) cancelAnimationFrame(cursorRafRef.current)
    }
  }, [handleMouseMove, isMobile, isHomePage])

  // Update mobile detection on resize
  useEffect(() => {
    const updateMobile = () => {
      setIsMobile(window.innerWidth <= 768 || ('ontouchstart' in window && window.matchMedia('(pointer: coarse)').matches))
    }
    window.addEventListener('resize', updateMobile, { passive: true })
    return () => window.removeEventListener('resize', updateMobile)
  }, [])

  if (isMobile || isHomePage) return null

  return (
    <>
      <div 
        ref={cursorElementRef}
        className="soccer-ball-cursor" 
        style={{ transform: 'translate(0px, 0px) translate(-50%, -50%) rotate(2deg)' }}
      >
        ⚽
      </div>
      <div 
        ref={cursorGlowRef}
        className="cursor-glow" 
        style={{ transform: 'translate(0px, 0px) translate(-50%, -50%)' }}
      >
        <div className="glow-core"></div>
      </div>
    </>
  )
}

export default GlobalCursor
