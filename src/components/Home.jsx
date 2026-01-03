import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import emailjs from '@emailjs/browser'
import Metaballs from './Metaballs'
import '../App.css'

// Constants
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_ci8h64h'
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_sipb9ui'
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'i0dQLe27a4mA6Or6D'


const essayContent = [
  "hey i'm Joseph Ayinde", "aka j0", "", "and i am a polymath (builder, thinker, dreamer)", "",
  "from greensboro north carolina", "", "i am a dual citizen of both the united states and nigeria", "", "",
  "I've always been fascinated by the spaces between things.", "",
  "The gap between biology and technology. The intersection of",
  "neuroscience and artificial intelligence. The bridge between",
  "what we know and what we're discovering.", "",
  "This curiosity led me down a path that most would call",
  "unconventional. I don't fit neatly into boxes-and that's",
  "exactly where I thrive.", "", "",
  "THE BEGINNING", "",
  "At 18, I arrived at UNC Chapel Hill as one of 25 students",
  "worldwide selected for the Chancellor's Science Scholars",
  "program-the university's highest STEM merit scholarship.",
  "But here's the thing: I wasn't just there to study.", "",
  "I was there to build.", "",
  "While my peers were memorizing textbooks, I was already",
  "prototyping a non-invasive brain-computer interface. By",
  "November 2022, I'd co-founded Cognition (then HEALLY),",
  "assembling a team of researchers, engineers, and clinicians",
  "to explore what happens when you merge EEG technology",
  "with artificial intelligence.", "",
  "We secured $150,000+ in funding. We partnered with Google",
  "DeepMind, NVIDIA, Carnegie Mellon, and others. But more",
  "importantly, we asked questions that hadn't been asked before.", "", "",
  "THE BREAKTHROUGH", "",
  "In 2023, something extraordinary happened.", "",
  "I became the world's first undergraduate intern in the",
  "world's first Computational Neurosurgery lab-in Sydney,",
  "Australia, under Professor Antonio Di Ieva.", "",
  "Imagine being 20 years old, shadowing over 80 neurosurgical",
  "operations, witnessing neuromodulation procedures that",
  "most medical students never see, and leading research on",
  "the legal and ethical implications of AI in neurosurgery.", "",
  "That was my summer.", "",
  "I didn't just observe. I participated in weekly case meetings",
  "at Macquarie University Hospital. I presented at the",
  "Australian Institute of Health Innovation. I saw the future",
  "of medicine being written, and I was helping write it.", "", "",
  "THE PIVOT", "",
  "Then came OpenAI.", "",
  "At 21, I joined as a Member of Technical Staff, serving as",
  "a biology expert for next-generation large language models.",
  "I wasn't just coding-I was helping shape how AI understands",
  "biology, neuroscience, and scientific reasoning.", "",
  "I worked on fine-tuning models that could interpret research",
  "data, generate context-aware responses, and apply",
  "cutting-edge biological principles. I saw firsthand how",
  "AI could transform scientific discovery.", "",
  "But I also saw its limitations. And that's when I knew",
  "I needed to build something of my own.", "", "",
  "THE ACCELERATION", "",
  "In 2024, I was selected as 1 of 10 ventures across North",
  "Carolina for LAUNCH Chapel Hill's competitive Summer",
  "Accelerator. I refined our business model with mentorship",
  "from Harvard Business School faculty. I delivered pitches",
  "that demonstrated not just traction, but vision.", "",
  "That same year, I received the International Young",
  "Outstanding Leadership Award in Healthcare in Las Vegas.",
  "I was named a Dreamers Who Do INNOVATE Carolina Scholar.", "",
  "But awards are just markers. What matters is what you do next.", "", "",
  "THE PHILOSOPHY", "",
  "I believe the best work happens at the edges.", "",
  "Not in the center of established fields, but in the spaces",
  "between them. Not by following paths, but by creating new ones.", "",
  "I'm building at the intersection of neuroscience, AI, and",
  "human experience. I'm thinking about problems that don't",
  "have answers yet. I'm dreaming of possibilities that",
  "haven't been imagined.", "", "",
  "THE INVITATION", "",
  "I'm always interested in connecting with fellow builders,",
  "thinkers, and dreamers.", "",
  "Whether it's collaboration, conversation, or simply sharing",
  "ideas-I believe the best work happens when diverse",
  "perspectives come together.", "",
  "Let's build something meaningful together."
]

const hiddenSecrets = [
  { id: 1, x: '12%', y: '22%', text: 'Ex-OpenAI Member of Technical Staff', image: '/assets/images/openai.jpg', description: 'At 21, I joined OpenAI as a Member of Technical Staff, serving as a biology expert for next-generation large language models. I wasn\'t just coding-I was helping shape how AI understands biology, neuroscience, and scientific reasoning. I worked on fine-tuning models that could interpret research data, generate context-aware responses, and apply cutting-edge biological principles. I saw firsthand how AI could transform scientific discovery, but I also saw its limitations. And that\'s when I knew I needed to build something of my own.' },
  { id: 2, x: '78%', y: '18%', text: "World's first intern in the world's first computational neurosurgery lab", image: '/assets/images/neurosurgery.jpg', description: 'In 2023, at 20 years old, I became the world\'s first undergraduate intern in the world\'s first Computational Neurosurgery lab in Sydney, Australia, under Professor Antonio Di Ieva. Imagine shadowing over 80 neurosurgical operations, witnessing neuromodulation procedures that most medical students never see, and leading research on the legal and ethical implications of AI in neurosurgery. I didn\'t just observe-I participated in weekly case meetings at Macquarie University Hospital, presented at the Australian Institute of Health Innovation, and saw the future of medicine being written. That was my summer.' },
  { id: 3, x: '88%', y: '52%', text: 'Computational Neuroscience Scholar at Carnegie Mellon University', image: '/assets/images/cmu.jpg', description: 'As a Computational Neuroscience Scholar at Carnegie Mellon University, I worked at the intersection of neuroscience and artificial intelligence. This partnership was instrumental in advancing Cognition\'s research, exploring what happens when you merge EEG technology with artificial intelligence. Carnegie Mellon provided critical research support and collaboration opportunities that helped shape our understanding of brain-computer interfaces and neural computation.' },
  { id: 4, x: '22%', y: '78%', text: 'UNC Chapel Hill - Honors Biology, Neuroscience, Chemistry Graduate', image: '/assets/images/unc.JPG', description: 'I arrived at UNC Chapel Hill at 18 as one of 25 students worldwide selected for the Chancellor\'s Science Scholars program-the university\'s highest STEM merit scholarship. But here\'s the thing: I wasn\'t just there to study. I was there to build. While my peers were memorizing textbooks, I was already prototyping a non-invasive brain-computer interface. I graduated with honors in Biology, Neuroscience, and Chemistry, but more importantly, I left with the foundation to build at the intersection of biology and technology.' },
  { id: 5, x: '5%', y: '88%', text: "Chancellor's Science Scholar - 1 of 25 selected worldwide", image: '/assets/images/chancellor.jpg', description: 'Selected as one of 25 students worldwide for the Chancellor\'s Science Scholars program-UNC Chapel Hill\'s highest STEM merit scholarship. This recognition wasn\'t just about academic achievement; it was about potential. The program provided the resources and community that enabled me to pursue unconventional paths, to build while studying, and to ask questions that hadn\'t been asked before. It was the foundation that made everything else possible.' },
  { id: 6, x: '95%', y: '28%', text: 'The Residency Delta Finalist', image: '/assets/images/residency.jpg', description: 'Selected as 1 of 20 finalists for The Residency Delta-Sam Altman\'s accelerator program-from over 1,500 applicants. This prestigious program recognizes innovative entrepreneurs and technologists making significant impact in their fields. This recognition came as I was building Cognition and exploring the spaces between biology and technology. Being a finalist validated that the work at the edges-the unconventional paths-is where meaningful innovation happens.' },
  { id: 7, x: '18%', y: '10%', text: 'CEO and Founder of Cognition', image: '/assets/images/cognition.jpg', description: 'In May 2025, I founded Cognition-The Cognitive OS for Learning and the world\'s first Social Intelligence Network. We\'re solving the fundamental forgetting crisis: people forget up to 70% of what they learn online within 24 hours. Cognition is the drop-in intelligence layer that transforms any software into a living system that converses, remembers, and reinforces growth across apps, devices, and time. We\'ve secured $150,000+ in funding and partnered with Google DeepMind, NVIDIA, and Carnegie Mellon. Looking ahead, we\'re pioneering non-invasive AI EEG brain-computer interfaces that will close the loop between biological learning processes and digital knowledge systems-making forgetting optional and learning effortless. Cognition is more than software; it\'s the cognitive infrastructure for humanity\'s next chapter.' },
  { id: 8, x: '82%', y: '72%', text: 'LAUNCH Chapel Hill Startup Accelerator Cohort 25 Recipient', image: '/assets/images/launch.jpg', description: 'In 2024, I was selected as 1 of 10 ventures across North Carolina for LAUNCH Chapel Hill\'s competitive Summer Accelerator. I refined our business model with mentorship from Harvard Business School faculty and delivered pitches that demonstrated not just traction, but vision. That same year, I also received the International Young Outstanding Leadership Award in Healthcare in Las Vegas and was named a Dreamers Who Do INNOVATE Carolina Scholar. But awards are just markers. What matters is what you do next.' },
  { id: 9, x: '8%', y: '38%', text: 'Played at the highest level of youth soccer in US', image: '/assets/images/soccer.jpg', description: 'I started playing soccer at the age of 3 recreationally, then began playing competitive soccer at the lowest level at age 10. I got moved up every year after that, steadily climbing through the ranks. In my final two years playing (sophomore and junior years of college), I played at the highest youth level in the United States-the Elite Clubs National League. This journey from recreational play to the pinnacle of youth soccer taught me about discipline, perseverance, continuous improvement, and what it takes to compete at the highest levels-lessons that have shaped my approach to building companies and leading teams.' },
  { id: 10, x: '92%', y: '82%', text: 'Founding team for Say Word FC', image: '/assets/images/saywordfc.jpg', description: 'I was part of the founding team for Say Word FC, which went from a local 7v7 team to internationally recognized, playing in global tournaments such as TST (The Soccer Tournament) against the likes of Sergio Aguero, Luis Nani, and Heather O\'Reilly on ESPN. This journey taught me about building teams, creating culture, establishing vision, and turning an idea into a reality. The lessons learned from founding and building Say Word FC-from recruiting players to establishing team identity to competing on the world stage-directly informed my approach to building companies and leading teams.' },
]

// Device detection utility
const isMobileDevice = () => {
  return window.innerWidth <= 768 || ('ontouchstart' in window && window.matchMedia('(pointer: coarse)').matches)
}

const lifeQuotes = [
  "The best work happens at the edges-not in the center of established fields, but in the spaces between them.",
  "I believe the best work happens when diverse perspectives come together.",
  "Not by following paths, but by creating new ones."
]

function Home() {
  // State
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  // Initialize with all secrets revealed for visibility
  const [revealedSecrets, setRevealedSecrets] = useState(new Set(hiddenSecrets.map(s => s.id)))
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
        
        // Create curved path with random waypoints
        const waypoint1 = {
          x: startPos.x + (targetX - startPos.x) * 0.3 + (Math.random() - 0.5) * 30,
          y: startPos.y + (targetY - startPos.y) * 0.3 + (Math.random() - 0.5) * 30
        }
        const waypoint2 = {
          x: startPos.x + (targetX - startPos.x) * 0.7 + (Math.random() - 0.5) * 30,
          y: startPos.y + (targetY - startPos.y) * 0.7 + (Math.random() - 0.5) * 30
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
      
      startTimeRef.current = Date.now()
    } catch (error) {
      console.error('Error initializing bubbles:', error)
      bubblePositionsRef.current = []
      startTimeRef.current = Date.now()
      return
    }

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
    let lastTime = performance.now()
    
    const updateBubbles = (now) => {
      const positions = bubblePositionsRef.current
      if (!positions || !Array.isArray(positions) || positions.length === 0) {
        // Keep animation loop running even if positions aren't ready yet
        lastTime = now
        animationFrameRef.current = requestAnimationFrame(updateBubbles)
        return
      }
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now()
        lastTime = now
        // Continue animation loop
        animationFrameRef.current = requestAnimationFrame(updateBubbles)
        return
      }
      
      // Calculate delta time (normalized to 60fps units) and clamp it
      let dt = (now - lastTime) / 16.666 // normalize to 60fps units
      lastTime = now
      
      // CRITICAL: Clamp dt to prevent explosions when DevTools opens/closes
      dt = Math.max(0.5, Math.min(dt, 1.5))
      
      const currentTime = Date.now()
      const elapsed = currentTime - startTimeRef.current
      let allArrived = true
      frameCount++
      
      // DEBUG: Log first bubble's position and velocity every 60 frames (~1 second at 60fps)
      if (frameCount % 60 === 0 && positions.length > 0) {
        const firstBubble = positions[0]
        console.log('DEBUG Bubble 0:', {
          x: firstBubble.x?.toFixed(2),
          y: firstBubble.y?.toFixed(2),
          vx: firstBubble.vx?.toFixed(4),
          vy: firstBubble.vy?.toFixed(4),
          hasArrived: firstBubble.hasArrived,
          isAnimating: firstBubble.isAnimating
        })
      }
      
      // Update physics for each bubble
      positions.forEach(bubble => {
        if (!bubble) return
        
        let { baseX, baseY, startX, startY, waypoint1, waypoint2, animationDelay, isAnimating, hasArrived } = bubble
        
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
        
        // Check if it's time to start animating this bubble
        if (!isAnimating && elapsed >= animationDelay) {
          bubble.isAnimating = true
          bubble.startTime = currentTime
        }
        
        // Animate bubble from off-screen to target position with curved path
        // CRITICAL: This Bezier tweening ONLY happens during entry animation
        // Once hasArrived=true, physics takes over completely
        if (bubble.isAnimating && !hasArrived && bubble.startTime !== null) {
          const animationElapsed = currentTime - bubble.startTime
          const animationDuration = 2500 // 2.5 seconds for curved path
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
          
          // CRITICAL: Only set position during Bezier animation (before arrival)
          // After arrival, physics will control position
          bubble.x = point.x
          bubble.y = point.y
          
          // Check if arrived at target
          if (progress >= 1) {
            bubble.hasArrived = true
            // Set final position to base
            bubble.x = baseX
            bubble.y = baseY
            // CRITICAL: Initialize velocity for physics - this is where physics takes over
            bubble.vx = (Math.random() - 0.5) * 0.3
            bubble.vy = (Math.random() - 0.5) * 0.3
          } else {
            allArrived = false
          }
        } else if (!hasArrived) {
          // Keep bubble at starting position until animation starts
          if (bubble.x !== startX || bubble.y !== startY) {
            bubble.x = startX
            bubble.y = startY
          }
          allArrived = false
        }
        
        // After arriving, apply lava lamp physics
        // CRITICAL: Only apply physics if bubble has arrived - don't let Bezier override physics
        if (bubble.hasArrived) {
          let { x, y, vx, vy } = bubble
          
          // CRITICAL: Check for NaN values
          if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(vx) || !Number.isFinite(vy)) {
            console.error('BUBBLE NaN detected:', { id: bubble.id, x, y, vx, vy })
            // Reset to safe values
            x = baseX
            y = baseY
            vx = 0
            vy = 0
          }
          
          // CRITICAL FIX: Use physics-based position updates with dt
          // Update position based on velocity (physics-driven) - multiply by dt
          x += vx * dt
          y += vy * dt
          
          // Gentle drift back toward base position (lava lamp effect) - ENHANCED
          const driftX = (baseX - x) * 0.015 // Increased from 0.01
          const driftY = (baseY - y) * 0.015
          // Add more random drift for lava lamp effect
          if (frameCount % 2 === 0) { // More frequent random drift
            vx += (driftX + (Math.random() - 0.5) * 0.04) * dt // Multiply by dt
            vy += (driftY + (Math.random() - 0.5) * 0.04) * dt
          } else {
            vx += driftX * dt
            vy += driftY * dt
          }
          
          // Less damping for more movement - use dt-aware damping
          const damp = 0.985
          vx *= Math.pow(damp, dt)
          vy *= Math.pow(damp, dt)
          
          // Boundary constraints (keep bubbles on screen)
          if (x < 5) {
            x = 5
            vx *= -0.8 // Bounce off edge
          } else if (x > 95) {
            x = 95
            vx *= -0.8
          }
          
          if (y < 5) {
            y = 5
            vy *= -0.8
          } else if (y > 95) {
            y = 95
            vy *= -0.8
          }
          
          bubble.x = x
          bubble.y = y
          bubble.vx = vx
          bubble.vy = vy
        }
      })
      
      // Collision detection between bubbles (only after they've arrived) - Check every frame for responsive collisions
      {
        for (let i = 0; i < positions.length; i++) {
          for (let j = i + 1; j < positions.length; j++) {
            const b1 = positions[i]
            const b2 = positions[j]
            
            if (!b1 || !b2) continue
            // Only check collisions if both bubbles have arrived
            if (!b1.hasArrived || !b2.hasArrived) continue
            
            const dx = b2.x - b1.x
            const dy = b2.y - b1.y
            const distanceSquared = dx * dx + dy * dy
            const minDistanceSquared = 256 // 16^2 (increased from 12^2 for more visible collisions)
            
            if (distanceSquared < minDistanceSquared && distanceSquared > 0) {
              const distance = Math.sqrt(distanceSquared)
              // Collision detected - bounce off each other with more force
              const angle = Math.atan2(dy, dx)
              const sin = Math.sin(angle)
              const cos = Math.cos(angle)
              
              // Rotate velocities
              const vx1 = b1.vx * cos + b1.vy * sin
              const vy1 = b1.vy * cos - b1.vx * sin
              const vx2 = b2.vx * cos + b2.vy * sin
              const vy2 = b2.vy * cos - b2.vx * sin
              
              // Swap velocities (elastic collision) - more bounce
              const swap = vx1
              const newVx1 = vx2 * 1.1 // Increased bounce from 0.9
              const newVx2 = swap * 1.1
              
              // Rotate back
              b1.vx = newVx1 * cos - vy1 * sin
              b1.vy = vy1 * cos + newVx1 * sin
              b2.vx = newVx2 * cos - vy2 * sin
              b2.vy = vy2 * cos + newVx2 * sin
              
              // Separate bubbles more aggressively
              const overlap = 16 - distance
              const separationX = (dx / distance) * overlap * 0.6 // Increased from 0.5
              const separationY = (dy / distance) * overlap * 0.6
              
              b1.x -= separationX
              b1.y -= separationY
              b2.x += separationX
              b2.y += separationY
            }
          }
        }
      }
      
      // Update pill positions using spring-follow physics (pills tethered to bubbles)
      const pills = pillPositionsRef.current
      if (pills && Array.isArray(pills)) {
        positions.forEach((bubble, idx) => {
          const pill = pills.find(p => p?.id === bubble?.id) || pills[idx]
          if (!pill || !bubble) return
          
          // CRITICAL: Check for NaN values
          if (!Number.isFinite(pill.x) || !Number.isFinite(pill.y) || !Number.isFinite(pill.vx) || !Number.isFinite(pill.vy)) {
            console.error('PILL NaN detected:', { id: pill.id, x: pill.x, y: pill.y, vx: pill.vx, vy: pill.vy })
            // Reset to safe values based on bubble position
            const viewport = viewportRef.current
            pill.x = (bubble.x / 100) * viewport.w
            pill.y = (bubble.y / 100) * viewport.h
            pill.vx = 0
            pill.vy = 0
          }
          
          // Calculate anchor point (bubble position + velocity-based offset for "string" effect)
          // When bubble moves right, pill drags behind left (opposite velocity)
          pill.offsetX = -bubble.vx * 12
          pill.offsetY = -bubble.vy * 12
          
          // Convert bubble position from % to pixels for spring calculation
          // CRITICAL: Use viewport ref, not window.innerWidth/Height
          const viewport = viewportRef.current
          const anchorX = (bubble.x / 100) * viewport.w + pill.offsetX
          const anchorY = (bubble.y / 100) * viewport.h + pill.offsetY
          
          // Spring physics: accelerate toward anchor
          const dx = anchorX - pill.x
          const dy = anchorY - pill.y
          
          // Spring constants (tune these)
          const k = 0.08  // spring strength
          const damp = 0.82  // damping (lower = more float)
          
          // CRITICAL: Spring physics with dt - multiply by dt for frame-rate independence
          // Accelerate toward anchor (dt-aware)
          pill.vx = pill.vx * Math.pow(damp, dt) + dx * k * dt
          pill.vy = pill.vy * Math.pow(damp, dt) + dy * k * dt
          
          // Integrate position (dt-aware)
          pill.x += pill.vx * dt
          pill.y += pill.vy * dt
        })
        
        // Prevent pills from overlapping each other (DOM-only separation)
        for (let i = 0; i < pills.length; i++) {
          for (let j = i + 1; j < pills.length; j++) {
            const p1 = pills[i]
            const p2 = pills[j]
            if (!p1 || !p2) continue
            
            const dx = p2.x - p1.x
            const dy = p2.y - p1.y
            const dist = Math.hypot(dx, dy) || 1
            const min = 120 // how far apart labels should be
            
            if (dist < min) {
              const push = (min - dist) * 0.02
              const nx = dx / dist
              const ny = dy / dist
              p1.x -= nx * push
              p1.y -= ny * push
              p2.x += nx * push
              p2.y += ny * push
            }
          }
        }
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
            // Use transform with rotation for "mirror on a string" look
            element.style.transform = `translate(${pill.x}px, ${pill.y}px) translate(-50%, -50%) rotate(${angle * 0.08}deg)`
          }
        })
      }
      
      // Check if all bubbles have arrived
      if (allArrived && !allBubblesArrived) {
        setAllBubblesArrived(true)
      }
      
      // CRITICAL: Use performance.now() for stable frame timing
      animationFrameRef.current = requestAnimationFrame(updateBubbles)
    }
    
    // CRITICAL: Start animation immediately - don't wait for mouse events
    // Use performance.now() for accurate timing
    animationFrameRef.current = requestAnimationFrame(updateBubbles)
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [showBubbles])

  // Viewport resize handler - rebuild bounds and update viewport
  const handleResize = useCallback(() => {
    viewportRef.current.w = window.innerWidth
    viewportRef.current.h = window.innerHeight
    
    // Rebuild bounds if needed (bubbles use percentages, but pills use pixels)
    // If bubbles have arrived, we might need to adjust their base positions
    if (bubblePositionsRef.current && Array.isArray(bubblePositionsRef.current)) {
      // Bubbles use percentages, so they should be fine
      // But pills use pixels, so we need to update their positions
      const pills = pillPositionsRef.current
      if (pills && Array.isArray(pills)) {
        bubblePositionsRef.current.forEach((bubble, idx) => {
          const pill = pills.find(p => p?.id === bubble?.id) || pills[idx]
          if (pill && bubble) {
            // Recalculate pill position from bubble percentage
            pill.x = (bubble.x / 100) * viewportRef.current.w
            pill.y = (bubble.y / 100) * viewportRef.current.h
          }
        })
      }
    }
  }, [])
  
  // Update device type and viewport on resize
  useEffect(() => {
    const updateDevice = () => {
      const mobile = isMobileDevice()
      setIsMobile(mobile)
    }
    
    // Initial setup
    updateDevice()
    handleResize()
    
    // Run resize after layout settles (fonts, etc.)
    requestAnimationFrame(() => handleResize())
    setTimeout(handleResize, 250)
    
    window.addEventListener('resize', () => {
      updateDevice()
      handleResize()
    }, { passive: true })
    
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [handleResize])

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
    const now = Date.now()
    if (now - lastCursorUpdate.current >= 33) { // ~30fps (reduced from 16ms/60fps)
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
    if (documentOpen) return
    
        const target = e.target
    // Allow interactive elements to handle their own events
    if (isInteractiveElement(target) || target.closest('.secret-item')) {
          return
        }
    
    if (e.touches.length > 0) {
        const touch = e.touches[0]
      updateMousePosition(touch.clientX, touch.clientY)
        e.preventDefault()
    }
  }, [documentOpen, isInteractiveElement, updateMousePosition])

  const handleTouchMove = useCallback((e) => {
    if (documentOpen) return
    
        const target = e.target
    // Allow interactive elements to handle their own events
    if (isInteractiveElement(target) || target.closest('.secret-item')) {
          return
        }
    
    if (e.touches.length > 0) {
      e.preventDefault()
      if (touchMoveRafRef.current) cancelAnimationFrame(touchMoveRafRef.current)
      touchMoveRafRef.current = requestAnimationFrame(() => {
        const touch = e.touches[0]
        updateMousePosition(touch.clientX, touch.clientY)
      })
    }
  }, [documentOpen, isInteractiveElement, updateMousePosition])

  // Event listeners - separate mobile/desktop handlers
  useEffect(() => {
    // Always attach mouse handler for desktop
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    
    // Only attach touch handlers on mobile devices
    if (isMobile) {
      document.addEventListener('touchstart', handleTouchStart, { passive: false })
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (isMobile) {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      }
      if (touchMoveRafRef.current) cancelAnimationFrame(touchMoveRafRef.current)
    }
  }, [handleMouseMove, handleTouchStart, handleTouchMove, isMobile])



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
  }), [])

  // Secret click handler - unified for mobile/desktop
  const handleSecretInteraction = useCallback((secret, e) => {
    e.preventDefault()
    e.stopPropagation()
    handleSecretClick(secret)
  }, [handleSecretClick])

  // Touch handler for secrets - mobile only
  const handleSecretTouch = useCallback((secret, e) => {
    e.stopPropagation()
    handleSecretClick(secret)
  }, [handleSecretClick])

  return (
    <>
      {/* Metaballs WebGL renderer - OUTSIDE .app container to avoid parent transform/filter issues */}
      {/* CRITICAL: This must be at root level, not inside transformed containers */}
      {!documentOpen && showBubbles && bubblePositionsRef.current && Array.isArray(bubblePositionsRef.current) && bubblePositionsRef.current.length > 0 && (
        <Metaballs 
          bubbles={bubblePositionsRef.current} 
          showBubbles={showBubbles}
        />
      )}
      
      <div className={`app ${documentOpen ? 'document-open' : ''} ${isMobile ? 'mobile' : 'desktop'}`}>
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
          {showBubbles && (
            <div className="main-page-quotes">
              {lifeQuotes.map((quote, index) => (
                <p key={index} className="main-quote" style={{ animationDelay: `${index * 0.3}s` }}>
                  {quote}
                </p>
              ))}
            </div>
          )}

          {/* Experience pills layer - pills tethered to bubbles via spring physics */}
          {showBubbles && (
            <div 
              className={`secrets-layer permanent-secrets experience-layer ${!showBubbles ? 'fade-out' : ''}`}
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 5,
                pointerEvents: 'none', // Layer doesn't catch clicks
                overflow: 'visible' // Allow pills to render off-screen
              }}
            >
              {hiddenSecrets.map(secret => {
                // Pills are positioned by spring-follow physics in the animation loop
                // CRITICAL: Don't set initial transform here - spring physics owns transform
                return (
                  <div
                    key={`secret-${secret.id}`}
                    ref={el => bubbleElementsRef.current[secret.id] = el}
                    className="secret-item revealed permanent clickable experience-pill"
                    style={{ 
                      position: 'absolute',
                      left: '50%', // Use center as base, transform handles position (updated ONLY by spring physics)
                      top: '50%',
                      transform: 'translate(-50%, -50%)', // Initial - spring physics will update this
                      zIndex: 10010,
                      opacity: showBubbles ? 1 : 0,
                      visibility: showBubbles ? 'visible' : 'hidden',
                      display: showBubbles ? 'block' : 'none',
                      pointerEvents: 'auto', // Pills DO catch clicks
                      minWidth: '90px',
                      minHeight: '25px',
                      willChange: 'transform',
                      transformOrigin: 'center center'
                    }}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleSecretClick(secret)
                    }}
                    onTouchEnd={isMobile ? (e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleSecretClick(secret)
                    } : undefined}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleSecretClick(secret)
                      }
                    }}
                  >
                    <div 
                      className="secret-text" 
                      style={{ 
                        opacity: showBubbles ? 1 : 0, 
                        visibility: showBubbles ? 'visible' : 'hidden', 
                        display: showBubbles ? 'inline-block' : 'none',
                        pointerEvents: 'none',
                        // Unique blob shape for each bubble
                        borderRadius: secret.id % 3 === 0 
                          ? '60% 40% 30% 70% / 60% 30% 70% 40%'
                          : secret.id % 3 === 1
                          ? '30% 60% 70% 40% / 50% 60% 30% 60%'
                          : '50% 50% 50% 50% / 50% 50% 50% 50%',
                        animationDelay: `${secret.id * 0.5}s`
                      }}
                    >
                      {secret.text}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Life Quotes - appear after bubbles disappear */}
          {showQuotes && (
            <div className="life-quotes-container">
              {/* Title section at top */}
              <div className="quotes-title-section">
                <h1 className="quotes-title">hey i'm Joseph Ayinde</h1>
                <p className="quotes-subtitle">aka j0</p>
                <p className="quotes-description">and i am a polymath (builder, thinker, dreamer)</p>
                <p className="quotes-location">from greensboro north carolina</p>
                <p className="quotes-citizenship">i am a dual citizen of both the united states and nigeria</p>
              </div>
              
              {/* Quotes at bottom */}
              <div className="life-quotes-content">
                {lifeQuotes.map((quote, index) => (
                  <p key={index} className="life-quote" style={{ animationDelay: `${index * 0.2}s` }}>
                    {quote}
                  </p>
                ))}
              </div>
            </div>
          )}

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
        <div className="document-container">
          <div className="essay-container">
            <div className="essay-content">
              <div className="essay-text">
                {essayContent.map((line, index) => {
                  if (line.includes('LinkedIn')) {
                    return (
                      <p key={index}>
                        <a href="https://www.linkedin.com/in/joseph-ayinde" target="_blank" rel="noopener noreferrer" className="page-link">{line}</a>
                      </p>
                    )
                  }
                  if (line.includes('@') && line.includes('.com')) {
                    return (
                      <p key={index}>
                        <a href={`mailto:${line}`} className="page-link">{line}</a>
                      </p>
                    )
                  }
                  if (line && line === line.toUpperCase() && line.length > 3 && !line.startsWith('•')) {
                    return <h3 key={index} className="essay-heading">{line}</h3>
                  }
                  return <p key={index}>{line}</p>
                })}
                
                <div className="connect-section">
                  {!exploreClicked ? (
                    <button className="explore-button" onClick={handleExploreClick}>explore more</button>
                  ) : (
                    <div className="access-locked">
                      <p className="locked-message">access locked, fill out contact form to gain full access</p>
                      {formStatus.success ? (
                        <div className="form-success">
                          <p>Thank you! Your message has been sent. I'll get back to you soon.</p>
                        </div>
                      ) : (
                        <form className="contact-form" onSubmit={handleFormSubmit}>
                          {formStatus.error && (
                            <div className="form-error"><p>{formStatus.error}</p></div>
                          )}
                          <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleFormChange} required className="form-input" disabled={formStatus.loading} />
                          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleFormChange} required className="form-input" disabled={formStatus.loading} />
                          <textarea name="message" placeholder="Message" value={formData.message} onChange={handleFormChange} required className="form-textarea" rows="5" disabled={formStatus.loading} />
                          <button type="submit" className="form-submit-button" disabled={formStatus.loading}>
                            {formStatus.loading ? 'Sending...' : 'Submit'}
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          </div>
        )}

        {/* Secret modal */}
        {selectedSecret && (
        <div className="secret-modal-overlay" onClick={handleCloseSecretModal}>
          <div className="secret-modal" onClick={(e) => e.stopPropagation()}>
            <button className="secret-modal-close" onClick={handleCloseSecretModal}>×</button>
            <div className="secret-modal-content">
              {selectedSecret.image && (
                <div className="secret-modal-image-container">
                  <img src={selectedSecret.image} alt={selectedSecret.text} className="secret-modal-image" onError={(e) => e.target.style.display = 'none'} />
                </div>
              )}
              <div className="secret-modal-text">
                <h2 className="secret-modal-title">{selectedSecret.text}</h2>
                <p className="secret-modal-description">{selectedSecret.description}</p>
              </div>
            </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Home
