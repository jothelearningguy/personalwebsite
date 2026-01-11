import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import emailjs from '@emailjs/browser'
// CSS loaded asynchronously via App.jsx to prevent render blocking

// Import data and utilities
import { hiddenSecrets, isMobileDevice } from '../data/homeData'
import { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY } from '../utils/emailConfig'

// Import components
import LavaLamp from './LavaLamp'
import MainPageQuotes from './MainPageQuotes'
import LifeQuotes from './LifeQuotes'
import ExperiencePills from './ExperiencePills'
import DocumentView from './DocumentView'
import SecretModal from './SecretModal'

function Home() {
  // State
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  // Initialize with all secrets revealed for visibility
  const [revealedSecrets] = useState(new Set(hiddenSecrets.map(s => s.id)))
  const [documentOpen, setDocumentOpen] = useState(false)
  const [exploreClicked, setExploreClicked] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [formStatus, setFormStatus] = useState({ loading: false, success: false, error: '' })
  const [selectedSecret, setSelectedSecret] = useState(null)
  const [isMobile, setIsMobile] = useState(isMobileDevice())
  const [showBubbles, setShowBubbles] = useState(true)
  const [showQuotes, setShowQuotes] = useState(false)
  const [allBubblesArrived, setAllBubblesArrived] = useState(false)
  
  // Lava lamp physics - bubble positions and velocities
  // Initialize bubbles at random off-screen positions, then animate to fixed positions
  const getRandomOffScreenPosition = () => {
    const side = Math.floor(Math.random() * 4) // 0: top, 1: right, 2: bottom, 3: left
    switch (side) {
      case 0: // Top
        return { x: Math.random() * 100, y: -20 - Math.random() * 20 }
      case 1: // Right
        return { x: 120 + Math.random() * 20, y: Math.random() * 100 }
      case 2: // Bottom
        return { x: Math.random() * 100, y: 120 + Math.random() * 20 }
      case 3: // Left
        return { x: -20 - Math.random() * 20, y: Math.random() * 100 }
      default:
        return { x: Math.random() * 100, y: -20 }
    }
  }

  const initialBubblePositions = useRef([])
  const animationFrameRef = useRef(null)
  const startTimeRef = useRef(null)
  const lastTimeRef = useRef(performance.now()) // Single clock - MANDATORY
  const allArrivedRef = useRef(false) // Ref instead of state for RAF

  // Refs for performance
  const mousePosRef = useRef({ x: 0, y: 0 })
  const touchMoveRafRef = useRef(null)
  const cursorElementRef = useRef(null)
  const cursorGlowRef = useRef(null)
  const cursorRafRef = useRef(null)
  const lastCursorUpdate = useRef(0)
  const bubbleElementsRef = useRef({})
  const bubblePositionsRef = useRef(null)
  const pillPositionsRef = useRef([]) // Spring-follow state for pills
  
  // Viewport object - single source of truth for window dimensions
  const viewportRef = useRef({ w: window.innerWidth, h: window.innerHeight })
  
  // Delta time tracking for stable physics
  const lastFrameTimeRef = useRef(performance.now())
  
  // Timer to hide bubbles and show quotes after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBubbles(false)
      setShowQuotes(true)
    }, 8000)

    return () => clearTimeout(timer)
  }, [])

  // Lava lamp physics animation - optimized with direct DOM manipulation
  // TEMPORARILY DISABLED TO FIX CRASH
  useEffect(() => {
    if (!showBubbles) {
      // Reset bubble positions when hiding
      if (bubblePositionsRef.current) {
        bubblePositionsRef.current = null
      }
      setAllBubblesArrived(false)
      return
    }
    
    // Safety check
    if (!hiddenSecrets || hiddenSecrets.length === 0) {
      console.error('hiddenSecrets is empty or undefined')
      return
    }
    
    // Reset state when showing bubbles
    setAllBubblesArrived(false)
    
    // Reset and reinitialize positions when showing bubbles
    try {
      initialBubblePositions.current = hiddenSecrets.map((secret, index) => {
        const startPos = getRandomOffScreenPosition()
        const targetX = parseFloat(secret.x) || 50
        const targetY = parseFloat(secret.y) || 50
        
        // Simplified curved path with fewer waypoints for better performance
        const waypoint1 = {
          x: startPos.x + (targetX - startPos.x) * 0.4 + (Math.random() - 0.5) * 20, // Reduced randomness
          y: startPos.y + (targetY - startPos.y) * 0.4 + (Math.random() - 0.5) * 20
        }
        const waypoint2 = {
          x: startPos.x + (targetX - startPos.x) * 0.6 + (Math.random() - 0.5) * 20,
          y: startPos.y + (targetY - startPos.y) * 0.6 + (Math.random() - 0.5) * 20
        }
        
        return {
          id: secret.id,
          x: startPos.x,
          y: startPos.y,
          vx: 0,
          vy: 0,
          baseX: targetX,
          baseY: targetY,
          startX: startPos.x,
          startY: startPos.y,
          waypoint1,
          waypoint2,
          startTime: null,
          animationDelay: index * 150 + Math.random() * 200,
          isAnimating: false,
          hasArrived: false
        }
      })
      
      // Initialize positions ref with initial positions
      bubblePositionsRef.current = initialBubblePositions.current.map(b => ({ ...b }))
      
      // Initialize pill spring-follow state (pills follow bubbles with spring physics)
      pillPositionsRef.current = hiddenSecrets.map((secret, index) => {
        const bubble = bubblePositionsRef.current[index]
        return {
          id: secret.id,
          x: bubble?.x ?? 50, // Start at bubble position
          y: bubble?.y ?? 50,
          vx: 0,
          vy: 0,
          offsetX: 0, // Velocity-based offset for "string" effect
          offsetY: 0
        }
      })
      
      startTimeRef.current = performance.now()
      lastTimeRef.current = performance.now() // Initialize clock
      allArrivedRef.current = false // Reset arrival state
    } catch (error) {
      console.error('Error initializing bubbles:', error)
      bubblePositionsRef.current = []
      startTimeRef.current = performance.now()
      lastTimeRef.current = performance.now()
      allArrivedRef.current = false
      return
    }
    
    // Animation phases - hard separation
    const PHASE = {
      ENTERING: 0,
      FLOATING: 1
    }
    
    // Initialize bubble phases
    bubblePositionsRef.current.forEach(bubble => {
      bubble.phase = PHASE.ENTERING
    })

    // Easing function for smooth animation
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)
    
    // Cubic bezier interpolation for curved paths
    const cubicBezier = (t, p0, p1, p2, p3) => {
      const u = 1 - t
      const tt = t * t
      const uu = u * u
      const uuu = uu * u
      const ttt = tt * t
      
      return {
        x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
        y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y
      }
    }
    
      let frameCount = 0
      let lastUpdateTime = 0
      const TARGET_FPS = 20 // Aggressively reduced to 20fps for better performance
      const FRAME_INTERVAL = 1000 / TARGET_FPS // ~50ms per frame
      
      // Cache expensive calculations
      const viewport = viewportRef.current
      const dampPowCache = {} // Cache Math.pow results
      
      const updateBubbles = (now) => {
        // Pause if tab is hidden
        if (document.hidden) {
          animationFrameRef.current = requestAnimationFrame(updateBubbles)
          return
        }
        // Throttle to 30fps for better performance
        if (now - lastUpdateTime < FRAME_INTERVAL) {
          animationFrameRef.current = requestAnimationFrame(updateBubbles)
          return
        }
        lastUpdateTime = now
      const positions = bubblePositionsRef.current
      if (!positions || !Array.isArray(positions) || positions.length === 0) {
        // Keep animation loop running even if positions aren't ready yet
        lastTimeRef.current = now
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
        animationFrameRef.current = requestAnimationFrame(updateBubbles)
        return
      }
      if (!startTimeRef.current) {
        startTimeRef.current = now
        lastTimeRef.current = now
        // Continue animation loop
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
        animationFrameRef.current = requestAnimationFrame(updateBubbles)
        return
      }
      
      // Calculate delta time (normalized to 60fps units) and clamp it
      const dtMs = now - lastTimeRef.current
      lastTimeRef.current = now
      
      // CRITICAL: Clamp dt to prevent explosions when DevTools opens/closes
      const dt = Math.min(1.5, Math.max(0.5, dtMs / 16.666))
      
      // Use performance.now() for elapsed time (not Date.now())
      const currentTime = now
      const elapsed = currentTime - startTimeRef.current
      let allArrived = true
      frameCount++
      
      // Update physics for each bubble
      positions.forEach(bubble => {
        if (!bubble) return
        
        let { baseX, baseY, startX, startY, waypoint1, waypoint2, animationDelay } = bubble
        
        // CRITICAL: Clamp NaN BEFORE any physics calculations
        if (!Number.isFinite(bubble.x) || !Number.isFinite(bubble.y)) {
          bubble.x = bubble.baseX
          bubble.y = bubble.baseY
          bubble.vx = 0
          bubble.vy = 0
          bubble.phase = PHASE.FLOATING
          return
        }
        
        // Ensure waypoints exist - create defaults if missing
        if (!waypoint1 || !waypoint2) {
          // Create default waypoints if missing
          waypoint1 = {
            x: startX + (baseX - startX) * 0.3 + (Math.random() - 0.5) * 30,
            y: startY + (baseY - startY) * 0.3 + (Math.random() - 0.5) * 30
          }
          waypoint2 = {
            x: startX + (baseX - startX) * 0.7 + (Math.random() - 0.5) * 30,
            y: startY + (baseY - startY) * 0.7 + (Math.random() - 0.5) * 30
          }
          bubble.waypoint1 = waypoint1
          bubble.waypoint2 = waypoint2
        }
        
        // Ensure start position is set (off-screen)
        if (bubble.x === undefined || bubble.x === null) {
          bubble.x = startX
        }
        if (bubble.y === undefined || bubble.y === null) {
          bubble.y = startY
        }
        
        // Hard-separate animation phases - never allow both systems to run
        if (bubble.phase === PHASE.ENTERING) {
          // ENTERING phase: Bezier tweening only
          if (!bubble.isAnimating && elapsed >= animationDelay) {
            bubble.isAnimating = true
            bubble.startTime = currentTime
          }
          
          if (bubble.isAnimating && bubble.startTime !== null) {
            const animationElapsed = currentTime - bubble.startTime
            const animationDuration = 2000 // Reduced from 2.5s to 2s for faster entry
            const progress = Math.min(animationElapsed / animationDuration, 1)
            const easedProgress = easeOutCubic(progress)
            
            // Use cubic bezier for curved path: start -> waypoint1 -> waypoint2 -> target
            const point = cubicBezier(
              easedProgress,
              { x: startX, y: startY },
              waypoint1,
              waypoint2,
              { x: baseX, y: baseY }
            )
            
            bubble.x = point.x
            bubble.y = point.y
            
            // Check if arrived at target - transition to FLOATING phase
            if (progress >= 1) {
              bubble.phase = PHASE.FLOATING
              bubble.x = baseX
              bubble.y = baseY
              // Initialize velocity for physics
              bubble.vx = (Math.random() - 0.5) * 0.3
              bubble.vy = (Math.random() - 0.5) * 0.3
            } else {
              allArrived = false
            }
          } else {
            // Keep bubble at starting position until animation starts
            if (bubble.x !== startX || bubble.y !== startY) {
              bubble.x = startX
              bubble.y = startY
            }
            allArrived = false
          }
        } else if (bubble.phase === PHASE.FLOATING) {
          // FLOATING phase: Physics only
          let { x, y, vx, vy } = bubble
          
          // CRITICAL FIX: Use physics-based position updates with dt
          // Update position based on velocity (physics-driven) - multiply by dt
          x += vx * dt
          y += vy * dt
          
          // Simplified gentle drift back toward base position (lava lamp effect)
          const driftX = (baseX - x) * 0.01 // Reduced from 0.015 for less aggressive movement
          const driftY = (baseY - y) * 0.01
          // Simplified random drift - only every 8 frames for better performance
          if (frameCount % 8 === 0) {
            vx += (driftX + (Math.random() - 0.5) * 0.02) * dt
            vy += (driftY + (Math.random() - 0.5) * 0.02) * dt
          } else {
            vx += driftX * dt
            vy += driftY * dt
          }
          
          // Increased damping for smoother, less CPU-intensive movement
          const damp = 0.99 // Increased from 0.985 for less movement
          const dampKey = `${damp}_${dt.toFixed(3)}`
          const dampValue = dampPowCache[dampKey] || (dampPowCache[dampKey] = Math.pow(damp, dt))
          vx *= dampValue
          vy *= dampValue
          
          // Simplified boundary constraints (keep bubbles on screen)
          if (x < 5) {
            x = 5
            vx *= -0.5 // Reduced bounce for smoother movement
          } else if (x > 95) {
            x = 95
            vx *= -0.5
          }
          
          if (y < 5) {
            y = 5
            vy *= -0.5
          } else if (y > 95) {
            y = 95
            vy *= -0.5
          }
          
          bubble.x = x
          bubble.y = y
          bubble.vx = vx
          bubble.vy = vy
        }
      })
      
      // REMOVED: Collision detection - major performance improvement
      // This was causing O(n²) complexity and significant CPU usage
      // Bubbles will now just drift naturally without collision checks
      
      // Update pill positions using simplified spring-follow physics (pills tethered to bubbles)
      const pills = pillPositionsRef.current
      if (pills && Array.isArray(pills)) {
        // OPTIMIZED: Use direct array indexing instead of find() - O(1) instead of O(n)
        const viewport = viewportRef.current
        const k = 0.06  // Reduced spring strength for smoother, less CPU-intensive movement
        const damp = 0.85  // Increased damping for smoother movement
        const dampKey = `${damp}_${dt.toFixed(3)}`
        const dampValue = dampPowCache[dampKey] || (dampPowCache[dampKey] = Math.pow(damp, dt))
        
        positions.forEach((bubble, idx) => {
          const pill = pills[idx] // Direct access - much faster than find()
          if (!pill || !bubble) return
          
          // CRITICAL: Check for NaN values
          if (!Number.isFinite(pill.x) || !Number.isFinite(pill.y) || !Number.isFinite(pill.vx) || !Number.isFinite(pill.vy)) {
            // Reset to safe values based on bubble position
            pill.x = (bubble.x / 100) * viewport.w
            pill.y = (bubble.y / 100) * viewport.h
            pill.vx = 0
            pill.vy = 0
          }
          
          // Simplified anchor point calculation (reduced offset for less movement)
          pill.offsetX = -bubble.vx * 8 // Reduced from 12
          pill.offsetY = -bubble.vy * 8
          
          // Convert bubble position from % to pixels for spring calculation
          const anchorX = (bubble.x / 100) * viewport.w + pill.offsetX
          const anchorY = (bubble.y / 100) * viewport.h + pill.offsetY
          
          // Simplified spring physics: accelerate toward anchor
          const dx = anchorX - pill.x
          const dy = anchorY - pill.y
          
          // Simplified spring physics with dt - use cached Math.pow result
          pill.vx = pill.vx * dampValue + dx * k * dt
          pill.vy = pill.vy * dampValue + dy * k * dt
          
          // Integrate position (dt-aware)
          pill.x += pill.vx * dt
          pill.y += pill.vy * dt
        })
        
        // REMOVED: Pill separation - major performance improvement
        // This was causing O(n²) complexity. Pills will naturally avoid overlap through spring physics
      }
      
      // Update DOM directly for smooth performance - update every frame for smooth animation
      // Bubbles: only update metaball positions (not DOM - bubbles are invisible)
      // Pills: update DOM with spring-follow positions
      positions.forEach(bubble => {
        // Bubbles are rendered by WebGL metaballs, not DOM
        // No DOM update needed for bubbles
      })
      
      // Update pill DOM elements with spring-follow positions
      // CRITICAL: This is the ONLY place that should update pill transforms
      if (pills && Array.isArray(pills)) {
        pills.forEach(pill => {
          const element = bubbleElementsRef.current[pill.id]
          if (element) {
            // Final NaN check before rendering
            if (!Number.isFinite(pill.x) || !Number.isFinite(pill.y)) {
              console.error('PILL NaN before render:', { id: pill.id, x: pill.x, y: pill.y })
              return // Skip rendering this frame
            }
            
            // Calculate rotation based on velocity for "string" effect
            const angle = Math.atan2(pill.vy, pill.vx) * (180 / Math.PI)
            
            // CRITICAL: Spring physics owns transform - no other code should set it
            // Use translate3d for GPU acceleration with rotation for "mirror on a string" look
            element.style.transform = `translate3d(${pill.x}px, ${pill.y}px, 0) rotate(${angle * 0.08}deg)`
          }
        })
      }
      
      // Check if all bubbles have arrived - use ref, not state (no React re-renders in RAF)
      if (allArrived && !allArrivedRef.current) {
        allArrivedRef.current = true
      }
      
      // CRITICAL: RAF lifecycle fix - cancel before requesting new frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      animationFrameRef.current = requestAnimationFrame(updateBubbles)
    }
    
    // CRITICAL: Start animation immediately - don't wait for mouse events
    // Use performance.now() for accurate timing
    // Cancel any existing RAF first
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    animationFrameRef.current = requestAnimationFrame(updateBubbles)
    
    // Sync allArrivedRef to React state outside RAF (separate effect)
    // This prevents React re-renders during animation
    const syncArrivedState = () => {
      if (allArrivedRef.current && !allBubblesArrived) {
        setAllBubblesArrived(true)
      }
    }
    
    // Sync periodically (not every frame)
    const syncInterval = setInterval(syncArrivedState, 100)
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      if (syncInterval) {
        clearInterval(syncInterval)
      }
    }
  }, [showBubbles, allBubblesArrived])

  // Viewport resize handler - optimized to prevent forced reflows
  const handleResize = useCallback(() => {
    // Batch all reads together to prevent forced reflows
    const width = window.innerWidth
    const height = window.innerHeight
    
    // Update refs (no DOM reads after this point)
    viewportRef.current.w = width
    viewportRef.current.h = height
    
    // Batch all writes in requestAnimationFrame to prevent forced reflows
    requestAnimationFrame(() => {
      // Rebuild bounds if needed (bubbles use percentages, but pills use pixels)
      if (bubblePositionsRef.current && Array.isArray(bubblePositionsRef.current)) {
        const pills = pillPositionsRef.current
        if (pills && Array.isArray(pills)) {
          bubblePositionsRef.current.forEach((bubble, idx) => {
            const pill = pills[idx] // Direct access instead of find() to avoid reflow
            if (pill && bubble) {
              // Recalculate pill position from bubble percentage
              pill.x = (bubble.x / 100) * width
              pill.y = (bubble.y / 100) * height
            }
          })
        }
      }
    })
  }, [])
  
  // Update device type and viewport on resize - optimized to prevent forced reflows
  useEffect(() => {
    let resizeTimeout
    let rafId
    
    const updateDevice = () => {
      const mobile = isMobileDevice()
      setIsMobile(mobile)
    }
    
    // Throttled resize handler to prevent forced reflows
    const throttledResize = () => {
      // Cancel pending operations
      if (resizeTimeout) clearTimeout(resizeTimeout)
      if (rafId) cancelAnimationFrame(rafId)
      
      // Batch reads
      const width = window.innerWidth
      const height = window.innerHeight
      
      // Update in RAF to prevent forced reflow
      rafId = requestAnimationFrame(() => {
        viewportRef.current.w = width
        viewportRef.current.h = height
        updateDevice()
        
        // Update pills if needed (in same RAF to batch)
        if (bubblePositionsRef.current && Array.isArray(bubblePositionsRef.current)) {
          const pills = pillPositionsRef.current
          if (pills && Array.isArray(pills)) {
            bubblePositionsRef.current.forEach((bubble, idx) => {
              const pill = pills[idx]
              if (pill && bubble) {
                pill.x = (bubble.x / 100) * width
                pill.y = (bubble.y / 100) * height
              }
            })
          }
        }
      })
    }
    
    // Initial setup - use RAF to avoid blocking
    rafId = requestAnimationFrame(() => {
      updateDevice()
      viewportRef.current.w = window.innerWidth
      viewportRef.current.h = window.innerHeight
    })
    
    window.addEventListener('resize', throttledResize, { passive: true })
    
    return () => {
      window.removeEventListener('resize', throttledResize)
      if (resizeTimeout) clearTimeout(resizeTimeout)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  // Optimized mouse/touch position update with direct DOM manipulation for cursor
  const updateMousePosition = useCallback((x, y) => {
    mousePosRef.current = { x, y }
    
    // Update cursor position directly via DOM for zero-lag performance
    if (cursorRafRef.current) cancelAnimationFrame(cursorRafRef.current)
    
    cursorRafRef.current = requestAnimationFrame(() => {
      // Show cursor when bubbles, quotes, OR document is visible
      if (cursorElementRef.current && (showBubbles || showQuotes || documentOpen)) {
        cursorElementRef.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(2deg)`
      }
      // Only show glow when bubbles are visible (not on quotes page or document)
      if (cursorGlowRef.current && showBubbles && !isMobile && !documentOpen) {
        cursorGlowRef.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`
      }
    })
    
    // Update mouse position for cursor tracking - throttle more aggressively
    const now = performance.now()
    if (now - lastCursorUpdate.current >= 50) { // ~20fps for cursor updates (reduced from 33ms/30fps)
      lastCursorUpdate.current = now
      setMousePosition({ x, y })
    }
  }, [showBubbles, showQuotes, documentOpen, isMobile])

  // Check if element is interactive - desktop optimized
  const isInteractiveElement = useCallback((target) => {
    if (!target) return false
    return target.closest('button') || 
           target.closest('a') || 
           target.closest('input') || 
           target.closest('textarea') || 
           target.closest('form') ||
           target.closest('.secret-item.clickable') ||
           ['BUTTON', 'A', 'INPUT', 'TEXTAREA'].includes(target.tagName)
  }, [])

  // Mouse move handler - desktop only - work when bubbles, quotes, OR document is visible
  const handleMouseMove = useCallback((e) => {
    // Track mouse if bubbles, quotes, or document is showing
    if (showBubbles || showQuotes || documentOpen) {
      updateMousePosition(e.clientX, e.clientY)
    }
  }, [documentOpen, updateMousePosition, showBubbles, showQuotes])

  // Touch handlers - mobile only, properly isolated
  const handleTouchStart = useCallback((e) => {
    // Only process if bubbles, quotes, or document is showing
    if (!showBubbles && !showQuotes && !documentOpen) return
    
    const target = e.target
    // Only skip if it's a button/link/input that should handle its own click
    // But allow cursor to show on form elements for better UX
    if (isInteractiveElement(target) && !target.closest('.secret-item') && !target.closest('form') && !target.closest('input') && !target.closest('textarea')) {
      return
    }
    
    if (e.touches.length > 0) {
      const touch = e.touches[0]
      updateMousePosition(touch.clientX, touch.clientY)
      // Don't prevent default on touchstart - let it bubble for proper touch handling
    }
  }, [documentOpen, showBubbles, showQuotes, isInteractiveElement, updateMousePosition])

  const handleTouchMove = useCallback((e) => {
    // Only process if bubbles, quotes, or document is showing
    if (!showBubbles && !showQuotes && !documentOpen) return
    
    const target = e.target
    // Only skip if it's a button/link that should handle its own click
    // But allow cursor to show on form elements for better UX
    if (isInteractiveElement(target) && !target.closest('.secret-item') && !target.closest('form') && !target.closest('input') && !target.closest('textarea')) {
      return
    }
    
    if (e.touches.length > 0) {
      // Don't prevent default - let scrolling work naturally
      if (touchMoveRafRef.current) cancelAnimationFrame(touchMoveRafRef.current)
      touchMoveRafRef.current = requestAnimationFrame(() => {
        const touch = e.touches[0]
        updateMousePosition(touch.clientX, touch.clientY)
      })
    }
  }, [documentOpen, showBubbles, showQuotes, isInteractiveElement, updateMousePosition])
  
  const handleTouchEnd = useCallback((e) => {
    // Keep cursor visible briefly after touch ends - work on ALL pages (bubbles, quotes, AND essay/document)
    if (e.changedTouches.length > 0 && (showBubbles || showQuotes || documentOpen)) {
      const touch = e.changedTouches[0]
      updateMousePosition(touch.clientX, touch.clientY)
    }
  }, [documentOpen, showBubbles, showQuotes, updateMousePosition])

  // Event listeners - separate mobile/desktop handlers
  useEffect(() => {
    // Always attach mouse handler for desktop
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    
    // Only attach touch handlers on mobile devices
    if (isMobile) {
      // Use passive: true for better performance - we're not preventing default
      document.addEventListener('touchstart', handleTouchStart, { passive: true })
      document.addEventListener('touchmove', handleTouchMove, { passive: true })
      document.addEventListener('touchend', handleTouchEnd, { passive: true })
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (isMobile) {
        document.removeEventListener('touchstart', handleTouchStart)
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleTouchEnd)
      }
      if (touchMoveRafRef.current) cancelAnimationFrame(touchMoveRafRef.current)
    }
  }, [handleMouseMove, handleTouchStart, handleTouchMove, handleTouchEnd, isMobile])



  // Handlers
  const handleOpenDocument = useCallback(() => setDocumentOpen(true), [])
  const handleCloseDocument = useCallback(() => {
    setDocumentOpen(false)
    setExploreClicked(false)
  }, [])
  const handleSecretClick = useCallback((secret) => setSelectedSecret(secret), [])
  const handleCloseSecretModal = useCallback(() => setSelectedSecret(null), [])
  const handleExploreClick = useCallback(() => setExploreClicked(true), [])
  const handleFormChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }, [])

  const handleFormSubmit = useCallback(async (e) => {
    e.preventDefault()
    setFormStatus({ loading: true, success: false, error: '' })

    if (EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID' || EMAILJS_TEMPLATE_ID === 'YOUR_TEMPLATE_ID' || EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
      setFormStatus({ loading: false, success: false, error: 'Email service not configured.' })
      return
    }

    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        from_name: formData.name,
        from_email: formData.email,
        message: formData.message,
        to_email: 'josephayinde64@gmail.com'
      }, EMAILJS_PUBLIC_KEY)

      setFormStatus({ loading: false, success: true, error: '' })
      setFormData({ name: '', email: '', message: '' })
      setTimeout(() => {
        setExploreClicked(false)
        setFormStatus({ loading: false, success: false, error: '' })
      }, 3000)
    } catch (error) {
      console.error('EmailJS error:', error)
      setFormStatus({ loading: false, success: false, error: 'Failed to send message. Please try again later.' })
    }
  }, [formData])


  // Cursor style - now handled via direct DOM manipulation, but keep for initial render
  const cursorStyle = useMemo(() => ({
    transform: `translate(${mousePosition.x}px, ${mousePosition.y}px) translate(-50%, -50%) rotate(2deg)`
  }), [mousePosition.x, mousePosition.y])

  return (
    <>
      <div className={`app ${documentOpen ? 'document-open' : ''} ${isMobile ? 'mobile' : 'desktop'}`}>
        {/* Lava lamp blobs - fluid organic shapes */}
        <LavaLamp />
        
        {/* Cursor - optimized with direct DOM ref - show when bubbles, quotes, OR document is visible */}
        {(showBubbles || showQuotes || documentOpen) && (
          <div 
            ref={cursorElementRef}
            className="soccer-ball-cursor" 
            style={cursorStyle}
          >
            ⚽
          </div>
        )}

        {!documentOpen && (
          <>
          

          {/* Quotes on main page - centered with bubbles */}
          {showBubbles && <MainPageQuotes />}

          {/* Experience pills layer - pills tethered to bubbles via spring physics */}
          {showBubbles && (
            <ExperiencePills
              showBubbles={showBubbles}
              isMobile={isMobile}
              bubbleElementsRef={bubbleElementsRef}
              onSecretClick={handleSecretClick}
            />
          )}

          {/* Life Quotes - appear after bubbles disappear */}
          {showQuotes && <LifeQuotes />}

          {/* Cursor glow - desktop only - optimized with direct DOM ref */}
          {!isMobile && showBubbles && (
            <div 
              ref={cursorGlowRef}
              className="cursor-glow" 
              style={{ transform: `translate(${mousePosition.x}px, ${mousePosition.y}px) translate(-50%, -50%)` }}
            >
              <div className="glow-core"></div>
            </div>
          )}
        </>
      )}

      {/* Open button */}
      {!documentOpen && (
        <button className="open-button" onClick={handleOpenDocument}>open</button>
      )}

      {/* Document view */}
      {documentOpen && (
        <DocumentView
          exploreClicked={exploreClicked}
          formData={formData}
          formStatus={formStatus}
          onExploreClick={handleExploreClick}
          onFormChange={handleFormChange}
          onFormSubmit={handleFormSubmit}
        />
      )}

      {/* Secret modal */}
      <SecretModal 
        secret={selectedSecret} 
        onClose={handleCloseSecretModal} 
      />
      </div>
    </>
  )
}

export default Home
