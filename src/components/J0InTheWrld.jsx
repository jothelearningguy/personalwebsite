import React from 'react'
import './J0InTheWrld.css'

const socialPosts = [
  {
    id: 1,
    platform: 'Twitter',
    handle: '@j0ayinde',
    date: '2025-01-14',
    content: 'The best work happens at the edges-not in the center of established fields, but in the spaces between them. Building at the intersection of neuroscience, AI, and human experience.',
    likes: 234,
    retweets: 45,
    link: 'https://twitter.com/j0ayinde/status/1234567890'
  },
  {
    id: 2,
    platform: 'LinkedIn',
    handle: 'Joseph Ayinde',
    date: '2025-01-12',
    content: 'Excited to share that Cognition has secured partnerships with Google DeepMind, NVIDIA, and Carnegie Mellon. We\'re building the world\'s first Social Intelligence Network-making forgetting optional and learning effortless.',
    likes: 567,
    comments: 89,
    link: 'https://linkedin.com/posts/joseph-ayinde_ai-neuroscience-startup-activity-1234567890'
  },
  {
    id: 3,
    platform: 'Twitter',
    handle: '@j0ayinde',
    date: '2025-01-10',
    content: 'Spent the summer shadowing 80+ neurosurgical operations. The experience taught me that when building AI for critical systems, we need to think like surgeons: understand failure modes, build in safeguards, maintain human agency.',
    likes: 189,
    retweets: 32,
    link: 'https://twitter.com/j0ayinde/status/1234567891'
  },
  {
    id: 4,
    platform: 'LinkedIn',
    handle: 'Joseph Ayinde',
    date: '2025-01-08',
    content: 'From OpenAI to building my own venture: sometimes the best way to contribute to a field is not to work within existing structures, but to create new ones. That\'s what I\'m doing with Cognition.',
    likes: 432,
    comments: 67,
    link: 'https://linkedin.com/posts/joseph-ayinde_entrepreneurship-ai-innovation-activity-1234567891'
  },
  {
    id: 5,
    platform: 'Twitter',
    handle: '@j0ayinde',
    date: '2025-01-05',
    content: 'People forget up to 70% of what they learn online within 24 hours. We\'re drowning in information but starving for retention. The future isn\'t about having more information-it\'s about having better memory.',
    likes: 312,
    retweets: 78,
    link: 'https://twitter.com/j0ayinde/status/1234567892'
  },
  {
    id: 6,
    platform: 'LinkedIn',
    handle: 'Joseph Ayinde',
    date: '2025-01-03',
    content: 'The convergence of neuroscience and AI is one of the most exciting frontiers in modern science. We\'re not just building better AI-we\'re building AI that might help us understand the very organ that created it.',
    likes: 678,
    comments: 123,
    link: 'https://linkedin.com/posts/joseph-ayinde_neuroscience-ai-research-activity-1234567892'
  }
]

function J0InTheWrld() {
  const getPlatformIcon = (platform) => {
    switch(platform) {
      case 'Twitter':
        return '🐦'
      case 'LinkedIn':
        return '💼'
      default:
        return '📱'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'today'
    if (diffDays === 1) return 'yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="j0-wrld-container">
      <div className="j0-wrld-header">
        <h1 className="j0-wrld-title">j0 in the wrld</h1>
        <p className="j0-wrld-subtitle">recent posts across my socials</p>
      </div>

      <div className="social-posts-grid">
        {socialPosts.map(post => (
          <article key={post.id} className="social-post-card">
            <div className="post-platform-header">
              <span className="platform-icon">{getPlatformIcon(post.platform)}</span>
              <div className="platform-info">
                <span className="platform-name">{post.platform}</span>
                <span className="platform-handle">{post.handle}</span>
              </div>
              <span className="post-date">{formatDate(post.date)}</span>
            </div>
            
            <div className="post-content">
              <p>{post.content}</p>
            </div>

            <div className="post-engagement">
              {post.likes && (
                <span className="engagement-item">
                  <span className="engagement-icon">❤️</span>
                  {post.likes}
                </span>
              )}
              {post.retweets && (
                <span className="engagement-item">
                  <span className="engagement-icon">🔄</span>
                  {post.retweets}
                </span>
              )}
              {post.comments && (
                <span className="engagement-item">
                  <span className="engagement-icon">💬</span>
                  {post.comments}
                </span>
              )}
            </div>

            <a 
              href={post.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="post-link"
            >
              view on {post.platform} →
            </a>
          </article>
        ))}
      </div>
    </div>
  )
}

export default J0InTheWrld
