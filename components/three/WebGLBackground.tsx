'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function WebGLBackground() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 5

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    mountRef.current.appendChild(renderer.domElement)

    // Particles
    const particleCount = 200
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)

    const colorPalette = [
      new THREE.Color('#00f5ff'),
      new THREE.Color('#8b5cf6'),
      new THREE.Color('#ec4899'),
      new THREE.Color('#fbbf24'),
    ]

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10

      const col = colorPalette[Math.floor(Math.random() * colorPalette.length)]
      colors[i * 3] = col.r
      colors[i * 3 + 1] = col.g
      colors[i * 3 + 2] = col.b

      sizes[i] = Math.random() * 3 + 1
    }

    const particleGeo = new THREE.BufferGeometry()
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    const particleMat = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    })

    const particles = new THREE.Points(particleGeo, particleMat)
    scene.add(particles)

    // Glowing orbs
    const orbsData: { mesh: THREE.Mesh; speed: THREE.Vector3; phase: number }[] = []

    const orbConfigs = [
      { color: '#00f5ff', size: 0.6, pos: [-3, 2, -2], opacity: 0.15 },
      { color: '#8b5cf6', size: 0.9, pos: [3, -1, -3], opacity: 0.12 },
      { color: '#ec4899', size: 0.5, pos: [0, -3, -1], opacity: 0.1 },
      { color: '#00f5ff', size: 0.4, pos: [4, 3, -4], opacity: 0.08 },
      { color: '#8b5cf6', size: 0.7, pos: [-4, -2, -2], opacity: 0.1 },
    ]

    orbConfigs.forEach((cfg) => {
      const geo = new THREE.SphereGeometry(cfg.size, 32, 32)
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(cfg.color),
        transparent: true,
        opacity: cfg.opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(...(cfg.pos as [number, number, number]))
      scene.add(mesh)
      orbsData.push({
        mesh,
        speed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.002,
          (Math.random() - 0.5) * 0.002,
          0
        ),
        phase: Math.random() * Math.PI * 2,
      })
    })

    // Mouse parallax
    let mouseX = 0, mouseY = 0
    const handleMouse = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 0.5
      mouseY = (e.clientY / window.innerHeight - 0.5) * 0.5
    }
    window.addEventListener('mousemove', handleMouse)

    // Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    // Animation loop
    let animFrame: number
    const clock = new THREE.Clock()

    const animate = () => {
      animFrame = requestAnimationFrame(animate)
      const elapsed = clock.getElapsedTime()

      // Rotate particles slowly
      particles.rotation.y = elapsed * 0.02
      particles.rotation.x = elapsed * 0.01

      // Animate orbs
      orbsData.forEach((orb, i) => {
        orb.mesh.position.x += Math.sin(elapsed * 0.3 + orb.phase) * 0.003
        orb.mesh.position.y += Math.cos(elapsed * 0.2 + orb.phase) * 0.003
        const mat = orb.mesh.material as THREE.MeshBasicMaterial
        mat.opacity = orbConfigs[i].opacity * (0.7 + 0.3 * Math.sin(elapsed * 0.5 + orb.phase))
      })

      // Subtle camera parallax
      camera.position.x += (mouseX - camera.position.x) * 0.05
      camera.position.y += (-mouseY - camera.position.y) * 0.05
      camera.lookAt(scene.position)

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      cancelAnimationFrame(animFrame)
      window.removeEventListener('mousemove', handleMouse)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  )
}
