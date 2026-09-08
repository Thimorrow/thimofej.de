"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js"
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js"

export default function OrbitSculpture() {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current!
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" })
    } catch {
      // Keep the static sculpture when WebGL is unavailable.
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1
    host.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 20)
    camera.position.set(0, 0.2, 5.3)
    camera.lookAt(0, 0, 0)

    const room = new RoomEnvironment()
    const pmrem = new THREE.PMREMGenerator(renderer)
    const environment = pmrem.fromScene(room, 0.04)
    scene.environment = environment.texture
    room.dispose()
    pmrem.dispose()

    const key = new THREE.DirectionalLight(0xffead9, 2.5)
    key.position.set(-3, 4, 5)
    const rim = new THREE.DirectionalLight(0xdde8ff, 2)
    rim.position.set(3, 1, -2)
    scene.add(key, rim)

    const bronze = new THREE.MeshPhysicalMaterial({
      color: 0x9a603d, metalness: 0.9, roughness: 0.26,
      clearcoat: 0.35, clearcoatRoughness: 0.22, envMapIntensity: 1.4,
    })
    const geometry = new RoundedBoxGeometry(0.66, 0.66, 0.66, 4, 0.075)
    const sculpture = new THREE.Group()
    const pieces: THREE.Mesh[] = []
    for (const x of [-1, 1]) {
      for (const y of [-1, 1]) {
        for (const z of [-1, 1]) {
          const piece = new THREE.Mesh(geometry, bronze)
          piece.position.set(x * 0.355, y * 0.355, z * 0.355)
          pieces.push(piece)
          sculpture.add(piece)
        }
      }
    }
    scene.add(sculpture)

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)")
    const pointer = new THREE.Vector2()
    let hovered = false
    let visible = true
    let frame = 0
    let previousTime = 0
    let elapsed = 0
    let spread = 0.355
    let tiltX = 0
    let tiltY = 0

    function render(now: number) {
      frame = 0
      const dt = previousTime ? Math.min((now - previousTime) / 1000, 0.05) : 0
      previousTime = now
      if (!motion.matches) elapsed += dt
      const ease = 1 - Math.exp(-5 * dt)
      const targetSpread = !motion.matches && hovered ? 0.46 : 0.355
      spread += (targetSpread - spread) * ease
      tiltX += (pointer.y * 0.22 - tiltX) * ease
      tiltY += (pointer.x * 0.28 - tiltY) * ease
      pieces.forEach(piece => piece.position.set(
        Math.sign(piece.position.x) * spread,
        Math.sign(piece.position.y) * spread,
        Math.sign(piece.position.z) * spread,
      ))
      sculpture.rotation.set(
        0.36 + (motion.matches ? 0 : Math.sin(elapsed * 0.35) * 0.12 + tiltX),
        -0.55 + (motion.matches ? 0 : elapsed * 0.13 + tiltY),
        -0.12,
      )
      sculpture.position.y = motion.matches ? 0 : Math.sin(elapsed * 0.8) * 0.045
      renderer.render(scene, camera)
      host.dataset.ready = "true"
      if (!motion.matches && visible && !document.hidden) frame = requestAnimationFrame(render)
    }

    function resume() {
      cancelAnimationFrame(frame)
      frame = 0
      previousTime = 0
      if (visible && !document.hidden) frame = requestAnimationFrame(render)
    }
    function resize() {
      const { width, height } = host.getBoundingClientRect()
      renderer.setSize(width, height)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      resume()
    }
    function move(event: PointerEvent) {
      if (event.pointerType !== "mouse" || motion.matches) return
      const bounds = host.getBoundingClientRect()
      pointer.set((event.clientX - bounds.left) / bounds.width * 2 - 1, (event.clientY - bounds.top) / bounds.height * 2 - 1)
      hovered = true
    }
    function leave() {
      pointer.set(0, 0)
      hovered = false
    }
    function motionChanged() {
      leave()
      spread = 0.355
      resume()
    }
    const resizeObserver = new ResizeObserver(resize)
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      resume()
    })
    resizeObserver.observe(host)
    intersectionObserver.observe(host)
    host.addEventListener("pointermove", move)
    host.addEventListener("pointerleave", leave)
    motion.addEventListener("change", motionChanged)
    document.addEventListener("visibilitychange", resume)
    resize()

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      host.removeEventListener("pointermove", move)
      host.removeEventListener("pointerleave", leave)
      motion.removeEventListener("change", motionChanged)
      document.removeEventListener("visibilitychange", resume)
      geometry.dispose()
      bronze.dispose()
      environment.dispose()
      renderer.dispose()
      renderer.domElement.remove()
      delete host.dataset.ready
    }
  }, [])

  return (
    <div ref={hostRef} className="orbit" aria-hidden="true">
      <svg className="orbit-fallback" viewBox="0 0 180 140" fill="none">
        <path d="m90 24 39 23-39 23-39-23Z" fill="#c59d7d" />
        <path d="m51 47 39 23v45L51 92Z" fill="#896047" />
        <path d="m90 70 39-23v45l-39 23Z" fill="#ae7c59" />
      </svg>
    </div>
  )
}
