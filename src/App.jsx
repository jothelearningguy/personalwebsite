import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import emailjs from '@emailjs/browser'
import './App.css'

// Constants
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_ci8h64h'
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_sipb9ui'
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'i0dQLe27a4mA6Or6D'

const CONTENT_ELEMENTS = ['mystery-title', 'mystery-subtitle', 'mystery-description', 'mystery-location', 'mystery-citizenship']

const essayContent = [
  "hey i'm Joseph Ayinde", "aka j0", "", "and i am a polymath (builder, thinker, dreamer)", "",
  "from greensboro north carolina", "", "i am a dual citizen of both the united states and nigeria", "", "",
  "I've always been fascinated by the spaces between things.", "",
  "The gap between biology and technology. The intersection of",
  "neuroscience and artificial intelligence. The bridge between",
  "what we know and what we're discovering.", "",
  "This curiosity led me down a path that most would call",
  "unconventional. I don't fit neatly into boxes—and that's",
  "exactly where I thrive.", "", "",
  "THE BEGINNING", "",
  "At 18, I arrived at UNC Chapel Hill as one of 25 students",
  "worldwide selected for the Chancellor's Science Scholars",
  "program—the university's highest STEM merit scholarship.",
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
  "world's first Computational Neurosurgery lab—in Sydney,",
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
  "I wasn't just coding—I was helping shape how AI understands",
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
  "ideas—I believe the best work happens when diverse",
  "perspectives come together.", "",
  "Let's build something meaningful together."
]

const hiddenSecrets = [
  { id: 1, x: '15%', y: '25%', text: 'Ex-OpenAI Member of Technical Staff', image: '/assets/images/openai.jpg', description: 'At 21, I joined OpenAI as a Member of Technical Staff, serving as a biology expert for next-generation large language models. I wasn\'t just coding—I was helping shape how AI understands biology, neuroscience, and scientific reasoning. I worked on fine-tuning models that could interpret research data, generate context-aware responses, and apply cutting-edge biological principles. I saw firsthand how AI could transform scientific discovery, but I also saw its limitations. And that\'s when I knew I needed to build something of my own.' },
  { id: 2, x: '75%', y: '20%', text: "World's first intern in the world's first computational neurosurgery lab", image: '/assets/images/neurosurgery.jpg', description: 'In 2023, at 20 years old, I became the world\'s first undergraduate intern in the world\'s first Computational Neurosurgery lab in Sydney, Australia, under Professor Antonio Di Ieva. Imagine shadowing over 80 neurosurgical operations, witnessing neuromodulation procedures that most medical students never see, and leading research on the legal and ethical implications of AI in neurosurgery. I didn\'t just observe—I participated in weekly case meetings at Macquarie University Hospital, presented at the Australian Institute of Health Innovation, and saw the future of medicine being written. That was my summer.' },
  { id: 3, x: '85%', y: '55%', text: 'Computational Neuroscience Scholar at Carnegie Mellon University', image: '/assets/images/cmu.jpg', description: 'As a Computational Neuroscience Scholar at Carnegie Mellon University, I worked at the intersection of neuroscience and artificial intelligence. This partnership was instrumental in advancing Cognition\'s research, exploring what happens when you merge EEG technology with artificial intelligence. Carnegie Mellon provided critical research support and collaboration opportunities that helped shape our understanding of brain-computer interfaces and neural computation.' },
  { id: 4, x: '25%', y: '75%', text: 'UNC Chapel Hill - Honors Biology, Neuroscience, Chemistry Graduate', image: '/assets/images/unc.JPG', description: 'I arrived at UNC Chapel Hill at 18 as one of 25 students worldwide selected for the Chancellor\'s Science Scholars program—the university\'s highest STEM merit scholarship. But here\'s the thing: I wasn\'t just there to study. I was there to build. While my peers were memorizing textbooks, I was already prototyping a non-invasive brain-computer interface. I graduated with honors in Biology, Neuroscience, and Chemistry, but more importantly, I left with the foundation to build at the intersection of biology and technology.' },
  { id: 5, x: '8%', y: '85%', text: "Chancellor's Science Scholar - 1 of 25 selected worldwide", image: '/assets/images/chancellor.jpg', description: 'Selected as one of 25 students worldwide for the Chancellor\'s Science Scholars program—UNC Chapel Hill\'s highest STEM merit scholarship. This recognition wasn\'t just about academic achievement; it was about potential. The program provided the resources and community that enabled me to pursue unconventional paths, to build while studying, and to ask questions that hadn\'t been asked before. It was the foundation that made everything else possible.' },
  { id: 6, x: '92%', y: '30%', text: 'The Residency Delta Finalist', image: '/assets/images/residency.jpg', description: 'Selected as 1 of 20 finalists for The Residency Delta—Sam Altman\'s accelerator program—from over 1,500 applicants. This prestigious program recognizes innovative entrepreneurs and technologists making significant impact in their fields. This recognition came as I was building Cognition and exploring the spaces between biology and technology. Being a finalist validated that the work at the edges—the unconventional paths—is where meaningful innovation happens.' },
  { id: 7, x: '20%', y: '12%', text: 'CEO and Founder of Cognition', image: '/assets/images/cognition.jpg', description: 'In May 2025, I founded Cognition—The Cognitive OS for Learning and the world\'s first Social Intelligence Network. We\'re solving the fundamental forgetting crisis: people forget up to 70% of what they learn online within 24 hours. Cognition is the drop-in intelligence layer that transforms any software into a living system that converses, remembers, and reinforces growth across apps, devices, and time. We\'ve secured $150,000+ in funding and partnered with Google DeepMind, NVIDIA, and Carnegie Mellon. Looking ahead, we\'re pioneering non-invasive AI EEG brain-computer interfaces that will close the loop between biological learning processes and digital knowledge systems—making forgetting optional and learning effortless. Cognition is more than software; it\'s the cognitive infrastructure for humanity\'s next chapter.' },
  { id: 8, x: '80%', y: '70%', text: 'LAUNCH Chapel Hill Startup Accelerator Cohort 25 Recipient', image: '/assets/images/launch.jpg', description: 'In 2024, I was selected as 1 of 10 ventures across North Carolina for LAUNCH Chapel Hill\'s competitive Summer Accelerator. I refined our business model with mentorship from Harvard Business School faculty and delivered pitches that demonstrated not just traction, but vision. That same year, I also received the International Young Outstanding Leadership Award in Healthcare in Las Vegas and was named a Dreamers Who Do INNOVATE Carolina Scholar. But awards are just markers. What matters is what you do next.' },
  { id: 9, x: '10%', y: '40%', text: 'Played at the highest level of youth soccer in US', image: '/assets/images/soccer.jpg', description: 'I started playing soccer at the age of 3 recreationally, then began playing competitive soccer at the lowest level at age 10. I got moved up every year after that, steadily climbing through the ranks. In my final two years playing (sophomore and junior years of college), I played at the highest youth level in the United States—the Elite Clubs National League. This journey from recreational play to the pinnacle of youth soccer taught me about discipline, perseverance, continuous improvement, and what it takes to compete at the highest levels—lessons that have shaped my approach to building companies and leading teams.' },
  { id: 10, x: '90%', y: '80%', text: 'Founding team for Say Word FC', image: '/assets/images/saywordfc.jpg', description: 'I was part of the founding team for Say Word FC, which went from a local 7v7 team to internationally recognized, playing in global tournaments such as TST (The Soccer Tournament) against the likes of Sergio Aguero, Luis Nani, and Heather O\'Reilly on ESPN. This journey taught me about building teams, creating culture, establishing vision, and turning an idea into a reality. The lessons learned from founding and building Say Word FC—from recruiting players to establishing team identity to competing on the world stage—directly informed my approach to building companies and leading teams.' },
]

function App() {
  // State
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [revealedAreas, setRevealedAreas] = useState(new Set())
  const [revealedSecrets, setRevealedSecrets] = useState(new Set())
  const [documentOpen, setDocumentOpen] = useState(false)
  const [exploreClicked, setExploreClicked] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [formStatus, setFormStatus] = useState({ loading: false, success: false, error: '' })
  const [selectedSecret, setSelectedSecret] = useState(null)
  const [spotlightSize, setSpotlightSize] = useState(200)

  // Refs for performance
  const mousePosRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef(null)
  const elementCacheRef = useRef({})
  const isMobileRef = useRef(window.innerWidth <= 768 || 'ontouchstart' in window)
  const spotlightRadiusSquaredRef = useRef(10000) // spotlightSize/2 squared
  
  // Update spotlight size on resize
  useEffect(() => {
    const updateSize = () => {
      const size = window.innerWidth <= 768 ? 150 : 200
      setSpotlightSize(size)
      spotlightRadiusSquaredRef.current = (size / 2) ** 2
      isMobileRef.current = window.innerWidth <= 768 || 'ontouchstart' in window
    }
    updateSize()
    window.addEventListener('resize', updateSize, { passive: true })
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // Optimized mouse/touch position update - use ref to avoid re-renders
  const updateMousePosition = useCallback((x, y) => {
    mousePosRef.current = { x, y }
    setMousePosition({ x, y })
  }, [])

  // Check if element is interactive
  const isInteractiveElement = useCallback((target) => {
    if (!target) return false
    // Check for secret items (both clickable class and revealed state)
    if (target.closest('.secret-item.clickable') || 
        target.closest('.secret-item.revealed') ||
        target.classList?.contains('secret-item') ||
        target.closest('.secret-text')) {
      return true
    }
    return target.closest('button') || target.closest('a') || target.closest('input') || 
           target.closest('textarea') || target.closest('form') ||
           ['BUTTON', 'A', 'INPUT', 'TEXTAREA'].includes(target.tagName)
  }, [])

  // Mouse move handler - optimized
  const handleMouseMove = useCallback((e) => {
    if (documentOpen) return
    updateMousePosition(e.clientX, e.clientY)
  }, [documentOpen, updateMousePosition])

  // Touch handlers - optimized
  const handleTouchStart = useCallback((e) => {
    // Check if touching a secret item first - don't prevent default
    if (isInteractiveElement(e.target)) {
      return // Let the secret item handle its own events
    }
    if (documentOpen) return
    if (e.touches.length > 0) {
      const touch = e.touches[0]
      updateMousePosition(touch.clientX, touch.clientY)
      e.preventDefault()
    }
  }, [documentOpen, isInteractiveElement, updateMousePosition])

  const touchMoveRafRef = useRef(null)
  const handleTouchMove = useCallback((e) => {
    // Check if touching a secret item first - don't prevent default
    if (isInteractiveElement(e.target)) {
      return // Let the secret item handle its own events
    }
    if (documentOpen) return
    if (e.touches.length > 0) {
      e.preventDefault()
      if (touchMoveRafRef.current) cancelAnimationFrame(touchMoveRafRef.current)
      touchMoveRafRef.current = requestAnimationFrame(() => {
        const touch = e.touches[0]
        updateMousePosition(touch.clientX, touch.clientY)
      })
    }
  }, [documentOpen, isInteractiveElement, updateMousePosition])

  // Event listeners setup
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('touchstart', handleTouchStart, { passive: false })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      if (touchMoveRafRef.current) cancelAnimationFrame(touchMoveRafRef.current)
    }
  }, [handleMouseMove, handleTouchStart, handleTouchMove])

  // Optimized spotlight calculation - batched updates
  useEffect(() => {
    if (documentOpen || mousePosition.x === 0 && mousePosition.y === 0) return

    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    rafRef.current = requestAnimationFrame(() => {
      const { x, y } = mousePosRef.current
      const radiusSquared = spotlightRadiusSquaredRef.current
      const newRevealedSecrets = new Set(revealedSecrets)
      const newRevealedAreas = new Set(revealedAreas)
      let hasChanges = false

      // Check secrets
      hiddenSecrets.forEach(secret => {
        if (newRevealedSecrets.has(secret.id)) return
        const secretXPx = (parseFloat(secret.x) / 100) * window.innerWidth
        const secretYPx = (parseFloat(secret.y) / 100) * window.innerHeight
        const dx = x - secretXPx
        const dy = y - secretYPx
        if (dx * dx + dy * dy < radiusSquared) {
          newRevealedSecrets.add(secret.id)
          hasChanges = true
        }
      })

      // Check content elements - cache DOM queries
      CONTENT_ELEMENTS.forEach(elementId => {
        if (newRevealedAreas.has(elementId)) return
        if (!elementCacheRef.current[elementId]) {
          elementCacheRef.current[elementId] = document.querySelector(`.spotlight-content .${elementId}`)
        }
        const element = elementCacheRef.current[elementId]
        if (element && !element.classList.contains('hidden')) {
          const rect = element.getBoundingClientRect()
          const dx = x - (rect.left + rect.width / 2)
          const dy = y - (rect.top + rect.height / 2)
          if (dx * dx + dy * dy < radiusSquared) {
            newRevealedAreas.add(elementId)
            hasChanges = true
          }
        }
      })

      // Batch state updates
      if (hasChanges) {
        setRevealedSecrets(newRevealedSecrets)
        setRevealedAreas(newRevealedAreas)
      }
    })

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [mousePosition, documentOpen, revealedSecrets, revealedAreas])

  // Clear cache when document opens
  useEffect(() => {
    if (documentOpen) elementCacheRef.current = {}
  }, [documentOpen])

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

  // Memoized spotlight style
  const spotlightStyle = useMemo(() => ({
    background: `radial-gradient(circle ${spotlightSize}px at ${mousePosition.x}px ${mousePosition.y}px, transparent 0%, transparent 40%, rgba(0,0,0,0.95) 70%, rgba(0,0,0,1) 100%)`
  }), [mousePosition.x, mousePosition.y, spotlightSize])

  // Memoized cursor style - use transform for better performance
  const cursorStyle = useMemo(() => ({
    transform: `translate(${mousePosition.x}px, ${mousePosition.y}px) translate(-50%, -50%) rotate(2deg)`
  }), [mousePosition.x, mousePosition.y])

  return (
    <div className={`app ${documentOpen ? 'document-open' : ''}`}>
      {/* Cursor - positioned with transform for better performance */}
      <div className="soccer-ball-cursor" style={cursorStyle}>⚽</div>

      {!documentOpen && (
        <>
          {/* Spotlight overlay */}
          <div className="spotlight-overlay" style={spotlightStyle} />

          {/* Permanently revealed layer */}
          <div className="permanent-reveal-layer">
          <div className="secrets-layer">
            {hiddenSecrets.map(secret => {
                const isRevealed = revealedSecrets.has(secret.id)
                if (!isRevealed) return null
              return (
                <div
                  key={secret.id}
                    className="secret-item revealed permanent clickable"
                    style={{ 
                      left: secret.x, 
                      top: secret.y, 
                      transform: 'translate(-50%, -50%)',
                      zIndex: 10003
                    }}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      console.log('Secret clicked:', secret.id)
                      handleSecretClick(secret)
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onTouchStart={(e) => {
                      e.stopPropagation()
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      console.log('Secret touched:', secret.id)
                      handleSecretClick(secret)
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleSecretClick(secret)
                      }
                    }}
                  >
                      <div className="secret-text">{secret.text}</div>
                  </div>
                )
              })}
            </div>
            <div className="main-content permanent-content">
              <div className="content-wrapper permanent-content-wrapper">
                {CONTENT_ELEMENTS.map(id => (
                  revealedAreas.has(id) && (
                    <React.Fragment key={id}>
                      {id === 'mystery-title' && <h1 className="mystery-title permanent-reveal">hey i'm Joseph Ayinde</h1>}
                      {id === 'mystery-subtitle' && <p className="mystery-subtitle permanent-reveal">aka j0</p>}
                      {id === 'mystery-description' && <p className="mystery-description permanent-reveal">and i am a polymath (builder, thinker, dreamer)</p>}
                      {id === 'mystery-location' && <p className="mystery-location permanent-reveal">from greensboro north carolina</p>}
                      {id === 'mystery-citizenship' && <p className="mystery-citizenship permanent-reveal">i am a dual citizen of both the united states and nigeria</p>}
                    </React.Fragment>
                  )
                ))}
              </div>
            </div>
          </div>

          {/* Spotlight discovery layer */}
          <div className="secrets-layer">
            {hiddenSecrets.map(secret => {
              if (revealedSecrets.has(secret.id)) return null
              const secretXPx = (parseFloat(secret.x) / 100) * window.innerWidth
              const secretYPx = (parseFloat(secret.y) / 100) * window.innerHeight
              const dx = mousePosition.x - secretXPx
              const dy = mousePosition.y - secretYPx
              const isRevealed = dx * dx + dy * dy < spotlightRadiusSquaredRef.current
              
              if (!isRevealed) return null
              return (
                <div
                  key={`spotlight-${secret.id}`}
                  className="secret-item revealed clickable"
                  style={{ 
                    left: secret.x, 
                    top: secret.y, 
                    transform: 'translate(-50%, -50%)',
                    zIndex: 10003
                  }}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    console.log('Secret clicked:', secret.id)
                    handleSecretClick(secret)
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation()
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    console.log('Secret touched:', secret.id)
                    handleSecretClick(secret)
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleSecretClick(secret)
                    }
                  }}
                >
                    <div className="secret-text">{secret.text}</div>
                </div>
              )
            })}
          </div>

          {/* Main content for discovery */}
          <div className="main-content spotlight-content">
            <div className="content-wrapper spotlight-content-wrapper">
              <h1 className={`mystery-title ${revealedAreas.has('mystery-title') ? 'hidden' : ''}`}>hey i'm Joseph Ayinde</h1>
              <p className={`mystery-subtitle ${revealedAreas.has('mystery-subtitle') ? 'hidden' : ''}`}>aka j0</p>
              <p className={`mystery-description ${revealedAreas.has('mystery-description') ? 'hidden' : ''}`}>and i am a polymath (builder, thinker, dreamer)</p>
              <p className={`mystery-location ${revealedAreas.has('mystery-location') ? 'hidden' : ''}`}>from greensboro north carolina</p>
              <p className={`mystery-citizenship ${revealedAreas.has('mystery-citizenship') ? 'hidden' : ''}`}>i am a dual citizen of both the united states and nigeria</p>
            </div>
          </div>

          {/* Cursor glow - simplified on mobile */}
          {!isMobileRef.current && (
            <div className="cursor-glow" style={{ transform: `translate(${mousePosition.x}px, ${mousePosition.y}px) translate(-50%, -50%)` }}>
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
  )
}

export default App
