import React from 'react'
import './J0InTheWrld.css'

const bannerImages = [
  { src: '/assets/images/cognition.jpg', alt: 'Cognition' },
  { src: '/assets/images/openai.jpg', alt: 'OpenAI' },
  { src: '/assets/images/neurosurgery.jpg', alt: 'Neurosurgery' },
  { src: '/assets/images/cmu.jpg', alt: 'Carnegie Mellon' },
  { src: '/assets/images/unc.JPG', alt: 'UNC Chapel Hill' },
  { src: '/assets/images/chancellor.jpg', alt: 'Chancellor Scholar' },
  { src: '/assets/images/residency.jpg', alt: 'The Residency' },
  { src: '/assets/images/launch.jpg', alt: 'LAUNCH Chapel Hill' },
  { src: '/assets/images/soccer.jpg', alt: 'Soccer' },
  { src: '/assets/images/saywordfc.jpg', alt: 'Say Word FC' }
]

function J0InTheWrld() {
  return (
    <div className="j0-wrld-container">
      {/* Banner with 10 Photos */}
      <div className="j0-wrld-banner">
        <div className="banner-images-container">
          {bannerImages.map((image, index) => (
            <div key={index} className="banner-image-wrapper">
              <img 
                src={image.src} 
                alt={image.alt} 
                className="banner-image"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="j0-wrld-header">
        <h1 className="j0-wrld-title">j0 in the wrld</h1>
        <p className="j0-wrld-subtitle">recent posts across my socials</p>
      </div>

      <div className="coming-soon-section">
        <h2 className="coming-soon-title">coming soon</h2>
        <p className="coming-soon-subtitle">social posts integration in progress</p>
      </div>
    </div>
  )
}

export default J0InTheWrld
