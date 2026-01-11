import React from 'react'
import './J0InTheWrld.css'

const bannerImages = [
  { src: '/assets/images/cognition.jpg', alt: 'Cognition' },
  { src: '/assets/images/open-ai.jpg', alt: 'OpenAI' },
  { src: '/assets/images/neurosurgery.jpg', alt: 'Neurosurgery' },
  { src: '/assets/images/cmu.jpg', alt: 'Carnegie Mellon' },
  { src: '/assets/images/unc.JPG', alt: 'UNC Chapel Hill' },
  { src: '/assets/images/chancellor.jpg', alt: 'Chancellor Scholar' }
]

function J0InTheWrld() {
  // Create a small matrix - just 6 images for performance
  const matrixImages = React.useMemo(() => {
    const images = []
    // Just use first 6 images from bannerImages
    for (let i = 0; i < 6; i++) {
      images.push({
        ...bannerImages[i],
        id: `matrix-${i}`,
        delay: i * 0.5, // Stagger animation delays
        duration: 15 + (i % 3) * 5 // Vary durations (15s, 20s, 25s)
      })
    }
    return images
  }, [])

  return (
    <div className="j0-wrld-container">
      {/* Matrix background with twirling images */}
      <div className="matrix-background">
        {matrixImages.map((imageData) => (
          <div
            key={imageData.id}
            className="matrix-image-cell"
            style={{
              '--delay': `${imageData.delay}s`,
              '--duration': `${imageData.duration}s`
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
