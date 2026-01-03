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
      dist = smin(dist, ballDist, 0.12); // Smooth blending - smaller k = more merging
    }
    
    // Create the blob shape with smooth edges
    float alpha = 1.0 - smoothstep(-0.08, 0.08, dist);
    
    // Lava lamp colors - subtle purple/pink glow with time-based variation
    vec3 baseColor = vec3(0.7, 0.55, 0.9);
    vec3 color = baseColor * alpha * 0.5;
    
    gl_FragColor = vec4(color, alpha * 0.35);
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

    // Scene setup
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Camera (orthographic for 2D effect)
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0) // Transparent background
    mountRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Create shader material
    // Flatten bubble positions to array of floats [x1, y1, x2, y2, ...]
    const flattenedPositions = new Float32Array(40) // Max 20 bubbles * 2
    bubbles.forEach((bubble, i) => {
      if (i < 20) {
        flattenedPositions[i * 2] = bubble.x || 0
        flattenedPositions[i * 2 + 1] = bubble.y || 0
      }
    })
    
    const uniforms = {
      u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      u_time: { value: 0 },
      u_numBalls: { value: Math.min(bubbles.length, 20) },
      u_radius: { value: 0.06 }, // Radius in normalized screen space
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

    // Animation loop
    const animate = () => {
      if (!showBubbles) return
      
      animationFrameRef.current = requestAnimationFrame(animate)
      
      // Update uniforms
      if (materialRef.current && bubbles.length > 0) {
        materialRef.current.uniforms.u_time.value += 0.01
        materialRef.current.uniforms.u_resolution.value.set(
          window.innerWidth,
          window.innerHeight
        )
        materialRef.current.uniforms.u_numBalls.value = Math.min(bubbles.length, 20)
        
        // Update flattened bubble positions
        const flattened = materialRef.current.uniforms.u_ballPositions.value
        bubbles.forEach((bubble, i) => {
          if (i < 20) {
            flattened[i * 2] = bubble.x || 0
            flattened[i * 2 + 1] = bubble.y || 0
          }
        })
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
