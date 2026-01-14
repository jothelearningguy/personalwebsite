import React from 'react'
import './J0InTheWrld.css'

const bannerImages = [
  { src: '/assets/images/cognition.jpg', alt: 'Cognition' },
  { src: '/assets/images/open-ai.jpg', alt: 'OpenAI' },
  { src: '/assets/images/neurosurgery.jpg', alt: 'Neurosurgery' },
  { src: '/assets/images/cmu.jpg', alt: 'Carnegie Mellon' },
  { src: '/assets/images/unc.JPG', alt: 'UNC Chapel Hill' },
  { src: '/assets/images/chancellor.jpg', alt: 'Chancellor Scholar' },
  { src: '/assets/images/residency.jpg', alt: 'The Residency' },
  { src: '/assets/images/launch.jpg', alt: 'LAUNCH Chapel Hill' },
  { src: '/assets/images/soccer.jpg', alt: 'Soccer' },
  { src: '/assets/images/saywordfc.jpg', alt: 'Say Word FC' }
]

// Create a matrix of images with twirling animation - OPTIMIZED for performance
function createMatrixImages() {
  const matrixImages = []
  // Reduced from 6x8 (48) to 4x4 (16) for 67% reduction in DOM elements
  const columns = 4
  const rows = 4
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const imageIndex = (row * columns + col) % bannerImages.length
      const image = bannerImages[imageIndex]
      const uniqueId = `matrix-${row}-${col}`
      
      // Pre-calculate animation values for better performance
      const delay = row * 0.8 + col * 0.3 // Staggered delays instead of random
      const duration = 20 + (row % 3) * 5 // Vary durations (20s, 25s, 30s)
      const rotation = 180 + (col % 2) * 180 // Alternate 180deg and 360deg
      
      matrixImages.push({
        ...image,
        id: uniqueId,
        row,
        col,
        animationDelay: delay,
        animationDuration: duration,
        rotationSpeed: rotation,
        moveDistance: 60 // Fixed smaller distance for consistency
      })
    }
  }
  
  return matrixImages
}

function J0InTheWrld() {
  const matrixImages = React.useMemo(() => createMatrixImages(), [])

  return (
    <div className="j0-wrld-container">
      {/* Matrix background with twirling images */}
      <div className="matrix-background">
        {matrixImages.map((imageData) => (
          <div
            key={imageData.id}
            className="matrix-image-cell"
            style={{
              '--delay': `${imageData.animationDelay}s`,
              '--duration': `${imageData.animationDuration}s`,
              '--rotation': `${imageData.rotationSpeed}deg`
            }}
          >
            <img
              src={imageData.src}
              alt={imageData.alt}
              className="matrix-image"
              loading="lazy"
              decoding="async"
            />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="j0-wrld-content">
        <div className="j0-wrld-header">
          <h1 className="j0-wrld-title">j0 in the wrld</h1>
          <p className="j0-wrld-subtitle">recent posts across my socials</p>
        </div>

        <div className="coming-soon-section">
          <h2 className="coming-soon-title">coming soon</h2>
          <p className="coming-soon-subtitle">social posts integration in progress</p>
        </div>
      </div>
    </div>
  )
}

export default J0InTheWrld
