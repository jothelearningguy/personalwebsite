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

// Create a matrix of images (multiple instances spread across the page)
function createMatrixImages() {
  const matrixImages = []
  const columns = 6
  const rows = 8
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const imageIndex = (row * columns + col) % bannerImages.length
      const image = bannerImages[imageIndex]
      const uniqueId = `matrix-${row}-${col}`
      
      matrixImages.push({
        ...image,
        id: uniqueId,
        row,
        col,
        // Random animation delays and durations for organic feel
        animationDelay: Math.random() * 5,
        animationDuration: 8 + Math.random() * 8, // 8-16 seconds
        rotationSpeed: 360 + Math.random() * 360, // 360-720 degrees
        moveDistance: 100 + Math.random() * 150 // 100-250px movement
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
              '--rotation': `${imageData.rotationSpeed}deg`,
              '--move': `${imageData.moveDistance}px`
            }}
          >
            <img
              src={imageData.src}
              alt={imageData.alt}
              className="matrix-image"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* Content overlay */}
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
