import React, { useState, useEffect, useRef } from 'react'
import emailjs from '@emailjs/browser'
import './App.css'

function App() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [revealedAreas, setRevealedAreas] = useState(new Set())
  const [revealedSecrets, setRevealedSecrets] = useState(new Set())
  const [documentOpen, setDocumentOpen] = useState(false)
  const [exploreClicked, setExploreClicked] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [formStatus, setFormStatus] = useState({ loading: false, success: false, error: '' })
  const [selectedSecret, setSelectedSecret] = useState(null) // Track which secret pop-up is open
  const rafRef = useRef(null)
  const elementCacheRef = useRef({})
  
  // Clear cache when document opens/closes
  useEffect(() => {
    if (documentOpen) {
      elementCacheRef.current = {}
    }
  }, [documentOpen])

  // EmailJS configuration
  // Option 1: Use environment variables (recommended for production)
  // Create a .env file with: VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, VITE_EMAILJS_PUBLIC_KEY
  // Option 2: Replace the values below with your actual EmailJS credentials
  // Get them from: https://dashboard.emailjs.com/admin
  const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_ci8h64h'
  const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_sipb9ui'
  const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'i0dQLe27a4mA6Or6D'

  // Detect mobile device for performance optimizations
  const isMobileRef = useRef(window.innerWidth <= 768 || 'ontouchstart' in window)
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    // Optimized touch handling - only prevent default when NOT on interactive elements
    const handleTouchStart = (e) => {
      if (documentOpen) return
      
      const target = e.target
      // Check if touch is on any interactive element (button, input, textarea, a, etc.)
      const isInteractive = target && (
        target.closest('button') || 
        target.closest('a') ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('form') ||
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA'
      )
      
      if (isInteractive) {
        // Let interactive elements handle their own events
        return
      }
      
      if (e.touches.length > 0) {
        const touch = e.touches[0]
        setMousePosition({ x: touch.clientX, y: touch.clientY })
        // Only prevent default for non-interactive areas
        e.preventDefault()
      }
    }

    // Throttle touch move for better performance
    let touchMoveRaf = null
    const handleTouchMove = (e) => {
      if (documentOpen) return
      
      const target = e.target
      const isInteractive = target && (
        target.closest('button') || 
        target.closest('a') ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('form') ||
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA'
      )
      
      if (isInteractive) {
        return
      }
      
      if (e.touches.length > 0) {
        e.preventDefault()
        
        // Cancel previous frame
        if (touchMoveRaf) {
          cancelAnimationFrame(touchMoveRaf)
        }
        
        // Throttle updates for better performance
        touchMoveRaf = requestAnimationFrame(() => {
          const touch = e.touches[0]
          setMousePosition({ x: touch.clientX, y: touch.clientY })
        })
      }
    }

    const handleTouchEnd = (e) => {
      if (touchMoveRaf) {
        cancelAnimationFrame(touchMoveRaf)
        touchMoveRaf = null
      }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    // Use passive: false only when needed, but be more selective
    document.addEventListener('touchstart', handleTouchStart, { passive: false })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
      if (touchMoveRaf) {
        cancelAnimationFrame(touchMoveRaf)
      }
    }
  }, [documentOpen])

  // Responsive spotlight size - smaller on mobile for better control
  const [spotlightSize, setSpotlightSize] = useState(200)
  
  useEffect(() => {
    const updateSpotlightSize = () => {
      setSpotlightSize(window.innerWidth <= 768 ? 150 : 200)
    }
    updateSpotlightSize()
    window.addEventListener('resize', updateSpotlightSize)
    return () => window.removeEventListener('resize', updateSpotlightSize)
  }, [])

  // Track revealed secrets and content with throttling for better mobile performance
  useEffect(() => {
    if (documentOpen) return
    if (mousePosition.x === 0 && mousePosition.y === 0) return // Skip initial position

    // Cancel previous frame
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }

    // Throttle updates on mobile for better performance
    const throttleDelay = isMobileRef.current ? 100 : 16 // ~60fps on desktop, ~10fps on mobile
    
    rafRef.current = requestAnimationFrame(() => {
      // Use setTimeout for throttling on mobile
      const updateFn = () => {
        const spotlightRadius = spotlightSize / 2
        const spotlightRadiusSquared = spotlightRadius * spotlightRadius // Avoid sqrt in loop
        
        // Check which secrets are currently in spotlight
        hiddenSecrets.forEach(secret => {
          const secretXPx = (parseFloat(secret.x) / 100) * window.innerWidth
          const secretYPx = (parseFloat(secret.y) / 100) * window.innerHeight
          // Use squared distance to avoid expensive sqrt
          const dx = mousePosition.x - secretXPx
          const dy = mousePosition.y - secretYPx
          const distanceSquared = dx * dx + dy * dy
          
          if (distanceSquared < spotlightRadiusSquared) {
            setRevealedSecrets(prev => {
              if (prev.has(secret.id)) return prev // Already revealed
              return new Set([...prev, secret.id])
            })
          }
        })

        // Check if main content is in spotlight - cache elements for performance
        const contentElements = ['mystery-title', 'mystery-subtitle', 'mystery-description', 'mystery-location', 'mystery-citizenship']
        contentElements.forEach(elementId => {
          // Cache element lookups
          if (!elementCacheRef.current[elementId]) {
            elementCacheRef.current[elementId] = document.querySelector(`.spotlight-content .${elementId}`)
          }
          const element = elementCacheRef.current[elementId]
          
          if (element && !element.classList.contains('hidden')) {
            const rect = element.getBoundingClientRect()
            const elementCenterX = rect.left + rect.width / 2
            const elementCenterY = rect.top + rect.height / 2
            // Use squared distance
            const dx = mousePosition.x - elementCenterX
            const dy = mousePosition.y - elementCenterY
            const distanceSquared = dx * dx + dy * dy
            
            if (distanceSquared < spotlightRadiusSquared) {
              setRevealedAreas(prev => {
                if (prev.has(elementId)) return prev // Already revealed
                return new Set([...prev, elementId])
              })
            }
          }
        })
      }
      
      if (isMobileRef.current && throttleDelay > 16) {
        setTimeout(updateFn, throttleDelay)
      } else {
        updateFn()
      }
    })

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [mousePosition, documentOpen, spotlightSize])

  // Single essay content - thrilling narrative instead of resume
  const essayContent = [
    "hey i'm Joseph Ayinde",
    "aka j0",
    "",
    "and i am a polymath (builder, thinker, dreamer)",
    "",
    "from greensboro north carolina",
    "",
    "i am a dual citizen of both the united states and nigeria",
    "",
    "",
    "I've always been fascinated by the spaces between things.",
    "",
    "The gap between biology and technology. The intersection of",
    "neuroscience and artificial intelligence. The bridge between",
    "what we know and what we're discovering.",
    "",
    "This curiosity led me down a path that most would call",
    "unconventional. I don't fit neatly into boxes—and that's",
    "exactly where I thrive.",
    "",
    "",
    "THE BEGINNING",
    "",
    "At 18, I arrived at UNC Chapel Hill as one of 25 students",
    "worldwide selected for the Chancellor's Science Scholars",
    "program—the university's highest STEM merit scholarship.",
    "But here's the thing: I wasn't just there to study.",
    "",
    "I was there to build.",
    "",
    "While my peers were memorizing textbooks, I was already",
    "prototyping a non-invasive brain-computer interface. By",
    "November 2022, I'd co-founded Cognition (then HEALLY),",
    "assembling a team of researchers, engineers, and clinicians",
    "to explore what happens when you merge EEG technology",
    "with artificial intelligence.",
    "",
    "We secured $150,000+ in funding. We partnered with Google",
    "DeepMind, NVIDIA, Carnegie Mellon, and others. But more",
    "importantly, we asked questions that hadn't been asked before.",
    "",
    "",
    "THE BREAKTHROUGH",
    "",
    "In 2023, something extraordinary happened.",
    "",
    "I became the world's first undergraduate intern in the",
    "world's first Computational Neurosurgery lab—in Sydney,",
    "Australia, under Professor Antonio Di Ieva.",
    "",
    "Imagine being 20 years old, shadowing over 80 neurosurgical",
    "operations, witnessing neuromodulation procedures that",
    "most medical students never see, and leading research on",
    "the legal and ethical implications of AI in neurosurgery.",
    "",
    "That was my summer.",
    "",
    "I didn't just observe. I participated in weekly case meetings",
    "at Macquarie University Hospital. I presented at the",
    "Australian Institute of Health Innovation. I saw the future",
    "of medicine being written, and I was helping write it.",
    "",
    "",
    "THE PIVOT",
    "",
    "Then came OpenAI.",
    "",
    "At 21, I joined as a Member of Technical Staff, serving as",
    "a biology expert for next-generation large language models.",
    "I wasn't just coding—I was helping shape how AI understands",
    "biology, neuroscience, and scientific reasoning.",
    "",
    "I worked on fine-tuning models that could interpret research",
    "data, generate context-aware responses, and apply",
    "cutting-edge biological principles. I saw firsthand how",
    "AI could transform scientific discovery.",
    "",
    "But I also saw its limitations. And that's when I knew",
    "I needed to build something of my own.",
    "",
    "",
    "THE ACCELERATION",
    "",
    "In 2024, I was selected as 1 of 10 ventures across North",
    "Carolina for LAUNCH Chapel Hill's competitive Summer",
    "Accelerator. I refined our business model with mentorship",
    "from Harvard Business School faculty. I delivered pitches",
    "that demonstrated not just traction, but vision.",
    "",
    "That same year, I received the International Young",
    "Outstanding Leadership Award in Healthcare in Las Vegas.",
    "I was named a Dreamers Who Do INNOVATE Carolina Scholar.",
    "",
    "But awards are just markers. What matters is what you do next.",
    "",
    "",
    "THE PHILOSOPHY",
    "",
    "I believe the best work happens at the edges.",
    "",
    "Not in the center of established fields, but in the spaces",
    "between them. Not by following paths, but by creating new ones.",
    "",
    "I'm building at the intersection of neuroscience, AI, and",
    "human experience. I'm thinking about problems that don't",
    "have answers yet. I'm dreaming of possibilities that",
    "haven't been imagined.",
    "",
    "",
    "THE INVITATION",
    "",
    "I'm always interested in connecting with fellow builders,",
    "thinkers, and dreamers.",
    "",
    "Whether it's collaboration, conversation, or simply sharing",
    "ideas—I believe the best work happens when diverse",
    "perspectives come together.",
    "",
    "Let's build something meaningful together."
  ]

  // Hidden content areas - fun facts about Joseph scattered across the page
  // Positioned to avoid overlap with centered main content (center area ~35-65% x, ~35-65% y)
  const hiddenSecrets = [
    { 
      id: 1, 
      x: '15%', 
      y: '25%', 
      text: 'Ex-OpenAI Member of Technical Staff',
      image: '/assets/images/openai.jpg',
      description: 'At 21, I joined OpenAI as a Member of Technical Staff, serving as a biology expert for next-generation large language models. I wasn\'t just coding—I was helping shape how AI understands biology, neuroscience, and scientific reasoning. I worked on fine-tuning models that could interpret research data, generate context-aware responses, and apply cutting-edge biological principles. I saw firsthand how AI could transform scientific discovery, but I also saw its limitations. And that\'s when I knew I needed to build something of my own.'
    },
    { 
      id: 2, 
      x: '75%', 
      y: '20%', 
      text: "World's first intern in the world's first computational neurosurgery lab",
      image: '/assets/images/neurosurgery.jpg',
      description: 'In 2023, at 20 years old, I became the world\'s first undergraduate intern in the world\'s first Computational Neurosurgery lab in Sydney, Australia, under Professor Antonio Di Ieva. Imagine shadowing over 80 neurosurgical operations, witnessing neuromodulation procedures that most medical students never see, and leading research on the legal and ethical implications of AI in neurosurgery. I didn\'t just observe—I participated in weekly case meetings at Macquarie University Hospital, presented at the Australian Institute of Health Innovation, and saw the future of medicine being written. That was my summer.'
    },
    { 
      id: 3, 
      x: '85%', 
      y: '55%', 
      text: 'Computational Neuroscience Scholar at Carnegie Mellon University',
      image: '/assets/images/cmu.jpg',
      description: 'As a Computational Neuroscience Scholar at Carnegie Mellon University, I worked at the intersection of neuroscience and artificial intelligence. This partnership was instrumental in advancing Cognition\'s research, exploring what happens when you merge EEG technology with artificial intelligence. Carnegie Mellon provided critical research support and collaboration opportunities that helped shape our understanding of brain-computer interfaces and neural computation.'
    },
    { 
      id: 4, 
      x: '25%', 
      y: '75%', 
      text: 'UNC Chapel Hill - Honors Biology, Neuroscience, Chemistry Graduate',
      image: '/assets/images/unc.JPG',
      description: 'I arrived at UNC Chapel Hill at 18 as one of 25 students worldwide selected for the Chancellor\'s Science Scholars program—the university\'s highest STEM merit scholarship. But here\'s the thing: I wasn\'t just there to study. I was there to build. While my peers were memorizing textbooks, I was already prototyping a non-invasive brain-computer interface. I graduated with honors in Biology, Neuroscience, and Chemistry, but more importantly, I left with the foundation to build at the intersection of biology and technology.'
    },
    { 
      id: 5, 
      x: '8%', 
      y: '85%', 
      text: "Chancellor's Science Scholar - 1 of 25 selected worldwide",
      image: '/assets/images/chancellor.jpg',
      description: 'Selected as one of 25 students worldwide for the Chancellor\'s Science Scholars program—UNC Chapel Hill\'s highest STEM merit scholarship. This recognition wasn\'t just about academic achievement; it was about potential. The program provided the resources and community that enabled me to pursue unconventional paths, to build while studying, and to ask questions that hadn\'t been asked before. It was the foundation that made everything else possible.'
    },
    { 
      id: 6, 
      x: '92%', 
      y: '30%', 
      text: 'The Residency Delta Finalist',
      image: '/assets/images/residency.jpg',
      description: 'Selected as 1 of 20 finalists for The Residency Delta—Sam Altman\'s accelerator program—from over 1,500 applicants. This prestigious program recognizes innovative entrepreneurs and technologists making significant impact in their fields. This recognition came as I was building Cognition and exploring the spaces between biology and technology. Being a finalist validated that the work at the edges—the unconventional paths—is where meaningful innovation happens.'
    },
    { 
      id: 7, 
      x: '20%', 
      y: '12%', 
      text: 'CEO and Founder of Cognition',
      image: '/assets/images/cognition.jpg',
      description: 'In May 2025, I founded Cognition—The Cognitive OS for Learning and the world\'s first Social Intelligence Network. We\'re solving the fundamental forgetting crisis: people forget up to 70% of what they learn online within 24 hours. Cognition is the drop-in intelligence layer that transforms any software into a living system that converses, remembers, and reinforces growth across apps, devices, and time. We\'ve secured $150,000+ in funding and partnered with Google DeepMind, NVIDIA, and Carnegie Mellon. Looking ahead, we\'re pioneering non-invasive AI EEG brain-computer interfaces that will close the loop between biological learning processes and digital knowledge systems—making forgetting optional and learning effortless. Cognition is more than software; it\'s the cognitive infrastructure for humanity\'s next chapter.'
    },
    { 
      id: 8, 
      x: '80%', 
      y: '70%', 
      text: 'LAUNCH Chapel Hill Startup Accelerator Cohort 25 Recipient',
      image: '/assets/images/launch.jpg',
      description: 'In 2024, I was selected as 1 of 10 ventures across North Carolina for LAUNCH Chapel Hill\'s competitive Summer Accelerator. I refined our business model with mentorship from Harvard Business School faculty and delivered pitches that demonstrated not just traction, but vision. That same year, I also received the International Young Outstanding Leadership Award in Healthcare in Las Vegas and was named a Dreamers Who Do INNOVATE Carolina Scholar. But awards are just markers. What matters is what you do next.'
    },
    { 
      id: 9, 
      x: '10%', 
      y: '40%', 
      text: 'Played at the highest level of youth soccer in US',
      image: '/assets/images/soccer.jpg',
      description: 'I started playing soccer at the age of 3 recreationally, then began playing competitive soccer at the lowest level at age 10. I got moved up every year after that, steadily climbing through the ranks. In my final two years playing (sophomore and junior years of college), I played at the highest youth level in the United States—the Elite Clubs National League. This journey from recreational play to the pinnacle of youth soccer taught me about discipline, perseverance, continuous improvement, and what it takes to compete at the highest levels—lessons that have shaped my approach to building companies and leading teams.'
    },
    { 
      id: 10, 
      x: '90%', 
      y: '80%', 
      text: 'Founding team for Say Word FC',
      image: '/assets/images/saywordfc.jpg',
      description: 'I was part of the founding team for Say Word FC, which went from a local 7v7 team to internationally recognized, playing in global tournaments such as TST (The Soccer Tournament) against the likes of Sergio Aguero, Luis Nani, and Heather O\'Reilly on ESPN. This journey taught me about building teams, creating culture, establishing vision, and turning an idea into a reality. The lessons learned from founding and building Say Word FC—from recruiting players to establishing team identity to competing on the world stage—directly informed my approach to building companies and leading teams.'
    },
  ]

  const isInSpotlight = (secretX, secretY) => {
    // Convert percentage to pixel position (approximate)
    const secretXPx = (parseFloat(secretX) / 100) * window.innerWidth
    const secretYPx = (parseFloat(secretY) / 100) * window.innerHeight
    
    const distance = Math.sqrt(
      Math.pow(mousePosition.x - secretXPx, 2) + 
      Math.pow(mousePosition.y - secretYPx, 2)
    )
    
    return distance < spotlightSize / 2
  }

  const handleOpenDocument = () => {
    setDocumentOpen(true)
  }

  const handleCloseDocument = () => {
    setDocumentOpen(false)
    setExploreClicked(false)
  }

  const handleSecretClick = (secret) => {
    setSelectedSecret(secret)
  }

  const handleCloseSecretModal = () => {
    setSelectedSecret(null)
  }

  const handleExploreClick = () => {
    setExploreClicked(true)
  }

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setFormStatus({ loading: true, success: false, error: '' })

    // Check if EmailJS is configured
    if (EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID' || 
        EMAILJS_TEMPLATE_ID === 'YOUR_TEMPLATE_ID' || 
        EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
      setFormStatus({ 
        loading: false, 
        success: false, 
        error: 'Email service not configured. Please set up EmailJS credentials.' 
      })
      return
    }

    try {
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        message: formData.message,
        to_email: 'josephayinde64@gmail.com'
      }

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      )

      setFormStatus({ loading: false, success: true, error: '' })
      setFormData({ name: '', email: '', message: '' })
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setExploreClicked(false)
        setFormStatus({ loading: false, success: false, error: '' })
      }, 3000)
    } catch (error) {
      console.error('EmailJS error:', error)
      setFormStatus({ 
        loading: false, 
        success: false, 
        error: 'Failed to send message. Please try again later.' 
      })
    }
  }

  return (
    <div className={`app ${documentOpen ? 'document-open' : ''}`}>
      {/* Soccer ball cursor - always visible */}
      <div 
        className="soccer-ball-cursor"
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
          transform: 'translate(-50%, -50%)'
        }}
      >
        ⚽
      </div>

      {/* Black overlay with spotlight effect - hidden when document is open */}
      {!documentOpen && (
        <>
          <div 
            className="spotlight-overlay"
            style={{
              background: `radial-gradient(circle ${spotlightSize}px at ${mousePosition.x}px ${mousePosition.y}px, transparent 0%, transparent 40%, rgba(0,0,0,0.95) 70%, rgba(0,0,0,1) 100%)`
            }}
          />
          
          {/* Permanently revealed content layer */}
          <div className="permanent-reveal-layer">
            {/* Permanently revealed secrets */}
          <div className="secrets-layer">
            {hiddenSecrets.map(secret => {
                const isPermanentlyRevealed = revealedSecrets.has(secret.id)
              return (
                <div
                  key={secret.id}
                    className={`secret-item ${isPermanentlyRevealed ? 'revealed permanent' : ''} ${isPermanentlyRevealed ? 'clickable' : ''}`}
                    style={{
                      left: secret.x,
                      top: secret.y,
                      transform: 'translate(-50%, -50%)'
                    }}
                    onClick={() => isPermanentlyRevealed && handleSecretClick(secret)}
                  >
                    {isPermanentlyRevealed && (
                      <div className="secret-text">{secret.text}</div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Permanently revealed main content - exact same positioning, only shows revealed items */}
            <div className="main-content permanent-content">
              <div className="content-wrapper permanent-content-wrapper">
                <h1 className={`mystery-title permanent-reveal ${!revealedAreas.has('mystery-title') ? 'hidden' : ''}`}>
                  hey i'm Joseph Ayinde
                </h1>
                <p className={`mystery-subtitle permanent-reveal ${!revealedAreas.has('mystery-subtitle') ? 'hidden' : ''}`}>
                  aka j0
                </p>
                <p className={`mystery-description permanent-reveal ${!revealedAreas.has('mystery-description') ? 'hidden' : ''}`}>
                  and i am a polymath (builder, thinker, dreamer)
                </p>
                <p className={`mystery-location permanent-reveal ${!revealedAreas.has('mystery-location') ? 'hidden' : ''}`}>
                  from greensboro north carolina
                </p>
                <p className={`mystery-citizenship permanent-reveal ${!revealedAreas.has('mystery-citizenship') ? 'hidden' : ''}`}>
                  i am a dual citizen of both the united states and nigeria
                </p>
              </div>
            </div>
          </div>

          {/* Hidden secrets layer (for spotlight discovery) */}
          <div className="secrets-layer">
            {hiddenSecrets.map(secret => {
              const currentlyRevealed = isInSpotlight(secret.x, secret.y)
              const isPermanentlyRevealed = revealedSecrets.has(secret.id)
              // Only show if currently in spotlight and not already permanently revealed
              if (isPermanentlyRevealed) return null
              return (
                <div
                  key={`spotlight-${secret.id}`}
                  className={`secret-item ${currentlyRevealed ? 'revealed clickable' : ''}`}
                  style={{
                    left: secret.x,
                    top: secret.y,
                    transform: 'translate(-50%, -50%)'
                  }}
                  onClick={() => currentlyRevealed && handleSecretClick(secret)}
                >
                  {currentlyRevealed && (
                    <div className="secret-text">{secret.text}</div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Main content (visible in spotlight for discovery) - always render for consistent layout */}
          <div className="main-content spotlight-content">
            <div className="content-wrapper spotlight-content-wrapper">
              <h1 className={`mystery-title ${revealedAreas.has('mystery-title') ? 'hidden' : ''}`}>
                hey i'm Joseph Ayinde
              </h1>
              <p className={`mystery-subtitle ${revealedAreas.has('mystery-subtitle') ? 'hidden' : ''}`}>
                aka j0
              </p>
              <p className={`mystery-description ${revealedAreas.has('mystery-description') ? 'hidden' : ''}`}>
                and i am a polymath (builder, thinker, dreamer)
              </p>
              <p className={`mystery-location ${revealedAreas.has('mystery-location') ? 'hidden' : ''}`}>
                from greensboro north carolina
              </p>
              <p className={`mystery-citizenship ${revealedAreas.has('mystery-citizenship') ? 'hidden' : ''}`}>
                i am a dual citizen of both the united states and nigeria
              </p>
            </div>
          </div>

          {/* Cursor glow effect with physics-like radiant particles - reduced on mobile */}
          <div 
            className={`cursor-glow ${isMobileRef.current ? 'mobile-optimized' : ''}`}
            style={{
              left: `${mousePosition.x}px`,
              top: `${mousePosition.y}px`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="glow-core"></div>
            {!isMobileRef.current && (
              <>
                <div className="glow-ring ring-1"></div>
                <div className="glow-ring ring-2"></div>
                <div className="glow-ring ring-3"></div>
                <div className="glow-particle particle-1"></div>
                <div className="glow-particle particle-2"></div>
                <div className="glow-particle particle-3"></div>
                <div className="glow-particle particle-4"></div>
                <div className="glow-particle particle-5"></div>
                <div className="glow-particle particle-6"></div>
              </>
            )}
          </div>
        </>
      )}

      {/* Open button - bottom right */}
      {!documentOpen && (
        <button className="open-button" onClick={handleOpenDocument}>
          open
        </button>
      )}

      {/* Document view - single essay format */}
      {documentOpen && (
        <div className="document-container">
          <div className="essay-container">
            <div className="essay-content">
              <div className="essay-text">
                {essayContent.map((line, index) => {
                  // Check if line contains LinkedIn
                  if (line.includes('LinkedIn')) {
                    return (
                      <p key={index}>
                        <a 
                          href="https://www.linkedin.com/in/joseph-ayinde" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="page-link"
                        >
                          {line}
                        </a>
                      </p>
                    )
                  }
                  // Check if line is an email
                  if (line.includes('@') && line.includes('.com')) {
                    return (
                      <p key={index}>
                        <a 
                          href={`mailto:${line}`}
                          className="page-link"
                        >
                          {line}
                        </a>
                      </p>
                    )
                  }
                  // Check if line is a heading (all caps)
                  if (line && line === line.toUpperCase() && line.length > 3 && !line.startsWith('•')) {
                    return <h3 key={index} className="essay-heading">{line}</h3>
                  }
                  return <p key={index}>{line}</p>
                })}
                
                {/* Explore more section at the end */}
                <div className="connect-section">
                  {!exploreClicked ? (
                    <button className="explore-button" onClick={handleExploreClick}>
                      explore more
                    </button>
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
                            <div className="form-error">
                              <p>{formStatus.error}</p>
                            </div>
                          )}
                          <input
                            type="text"
                            name="name"
                            placeholder="Name"
                            value={formData.name}
                            onChange={handleFormChange}
                            required
                            className="form-input"
                            disabled={formStatus.loading}
                          />
                          <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleFormChange}
                            required
                            className="form-input"
                            disabled={formStatus.loading}
                          />
                          <textarea
                            name="message"
                            placeholder="Message"
                            value={formData.message}
                            onChange={handleFormChange}
                            required
                            className="form-textarea"
                            rows="5"
                            disabled={formStatus.loading}
                          />
                          <button 
                            type="submit" 
                            className="form-submit-button"
                            disabled={formStatus.loading}
                          >
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

      {/* Secret Detail Modal */}
      {selectedSecret && (
        <div className="secret-modal-overlay" onClick={handleCloseSecretModal}>
          <div className="secret-modal" onClick={(e) => e.stopPropagation()}>
            <button className="secret-modal-close" onClick={handleCloseSecretModal}>
              ×
            </button>
            <div className="secret-modal-content">
              {selectedSecret.image && (
                <div className="secret-modal-image-container">
                  <img 
                    src={selectedSecret.image} 
                    alt={selectedSecret.text}
                    className="secret-modal-image"
                    onError={(e) => {
                      console.error('Image failed to load:', selectedSecret.image)
                      e.target.style.display = 'none'
                      e.target.parentElement.style.minHeight = '0'
                      e.target.parentElement.style.marginBottom = '0'
                    }}
                    onLoad={(e) => {
                      console.log('Image loaded successfully:', selectedSecret.image)
                      e.target.style.display = 'block'
                      e.target.style.visibility = 'visible'
                    }}
                  />
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
  )
}

export default App

