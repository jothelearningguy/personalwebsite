import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import './Metaballs.css'

// Metaball shader using signed distance fields
const vertexShader = `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform int u_numBalls;
  uniform float u_ballPositions[40]; // Flattened array: [x1, y1, x2, y2, ...]
  uniform float u_radius;
  
  // Smooth minimum function for metaballs
  float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
  }
  
  // Signed distance field for a circle
  float sdfCircle(vec2 p, vec2 center, float radius) {
    return length(p - center) - radius;
  }
  
  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 p = uv;
    
    // Normalize to aspect ratio
    float aspect = u_resolution.x / u_resolution.y;
    p.x *= aspect;
    
    // Initialize with large distance
    float dist = 1000.0;
    
    // Combine all metaballs using smooth minimum
    for (int i = 0; i < 20; i++) {
      if (i >= u_numBalls) break;
      
      // Read flattened position array
      float ballX = u_ballPositions[i * 2];
      float ballY = u_ballPositions[i * 2 + 1];
      
      // Convert from percentage (0-100) to normalized coordinates (0-1)
      vec2 normalizedPos = vec2(ballX / 100.0, ballY / 100.0);
      
      // Convert to screen space with aspect ratio
      vec2 screenPos = vec2(
        normalizedPos.x * aspect,
        normalizedPos.y
      );
      
      float ballDist = sdfCircle(p, screenPos, u_radius);
      dist = smin(dist, ballDist, 0.15); // Increased blending for more merging
    }
    
    // Create the blob shape with smooth edges - ENHANCED for more visible effect
    float alpha = 1.0 - smoothstep(-0.12, 0.12, dist); // Wider falloff
    
    // Lava lamp colors - ENHANCED with time-based variation and more vibrant colors
    vec3 baseColor1 = vec3(0.8, 0.6, 1.0); // Brighter purple
    vec3 baseColor2 = vec3(0.9, 0.7, 0.9); // Pink
    vec3 baseColor = mix(baseColor1, baseColor2, sin(u_time * 0.5) * 0.5 + 0.5);
    
    // Add glow effect
    float glow = exp(-dist * 8.0) * 0.6;
    vec3 color = baseColor * alpha * 0.8 + baseColor * glow * 0.4; // Much brighter
    
    gl_FragColor = vec4(color, alpha * 0.6 + glow * 0.3); // Increased opacity from 0.35 to 0.6+
  }
`

function Metaballs({ bubbles, showBubbles }) {
  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const materialRef = useRef(null)
  const animationFrameRef = useRef(null)

  useEffect(() => {
    if (!mountRef.current || !showBubbles) return
    if (!bubbles || !Array.isArray(bubbles) || bubbles.length === 0) {
      // Don't render if no bubbles, but don't crash
      return
    }

    // Scene setup
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Camera (orthographic for 2D effect)
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    
    // Renderer - OPTIMIZED: reduce quality for better performance
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: false, // Disable antialiasing for better performance
      powerPreference: 'high-performance'
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)) // Reduced from 2 to 1.5
    renderer.setClearColor(0x000000, 0) // Transparent background
    mountRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Create shader material
    // Flatten bubble positions to array of floats [x1, y1, x2, y2, ...]
    const flattenedPositions = new Float32Array(40) // Max 20 bubbles * 2
    bubbles.forEach((bubble, i) => {
      if (i < 20 && bubble) {
        flattenedPositions[i * 2] = bubble.x || 0
        flattenedPositions[i * 2 + 1] = bubble.y || 0
      }
    })
    
    const uniforms = {
      u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      u_time: { value: 0 },
      u_numBalls: { value: Math.min(bubbles.length, 20) },
      u_radius: { value: 0.08 }, // Increased radius for more visible bubbles
      u_ballPositions: { value: flattenedPositions }
    }

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
    materialRef.current = material

    // Fullscreen quad
    const geometry = new THREE.PlaneGeometry(2, 2)
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    // Animation loop - Full 60fps for smooth metaballs
    const animate = () => {
      if (!showBubbles) {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
          animationFrameRef.current = null
        }
        return
      }
      
      animationFrameRef.current = requestAnimationFrame(animate)
      
      // Update uniforms - update every frame for smooth animation
      if (materialRef.current && bubbles && bubbles.length > 0) {
        // Update time for animated colors
        materialRef.current.uniforms.u_time.value += 0.016 // ~60fps time increment
        materialRef.current.uniforms.u_resolution.value.set(
          window.innerWidth,
          window.innerHeight
        )
        materialRef.current.uniforms.u_numBalls.value = Math.min(bubbles.length, 20)
        
        // Update flattened bubble positions - real-time updates
        const flattened = materialRef.current.uniforms.u_ballPositions.value
        const maxBalls = Math.min(bubbles.length, 20)
        for (let i = 0; i < maxBalls; i++) {
          if (bubbles[i]) {
            flattened[i * 2] = bubbles[i].x || 0
            flattened[i * 2 + 1] = bubbles[i].y || 0
          }
        }
        materialRef.current.uniforms.u_ballPositions.needsUpdate = true
      }
      
      renderer.render(scene, camera)
    }
    
    animate()

    // Handle resize
    const handleResize = () => {
      if (!rendererRef.current) return
      
      renderer.setSize(window.innerWidth, window.innerHeight)
      if (materialRef.current) {
        materialRef.current.uniforms.u_resolution.value.set(
          window.innerWidth,
          window.innerHeight
        )
      }
    }
    
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
      material.dispose()
      geometry.dispose()
    }
  }, [bubbles, showBubbles])

  if (!showBubbles) return null

  return <div ref={mountRef} className="metaballs-container" />
}

export default Metaballs
