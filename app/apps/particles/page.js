'use client';
import { useEffect, useRef, useState } from 'react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import * as THREE from 'three';

export default function Particles() {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const particlesRef = useRef([]);
  const audioContextRef = useRef(null);
  const audioBufferRef = useRef(null);
  const [theme, setTheme] = useState('light');
  const [spawnRate, setSpawnRate] = useState(30);

  useEffect(() => {
    // Get initial theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    // Listen for theme changes
    const handleThemeChange = (event) => {
      if (event.data?.type === 'THEME_TOGGLE') {
        const newTheme = localStorage.getItem('theme') || 'light';
        setTheme(newTheme);
      }
    };
    window.addEventListener('message', handleThemeChange);

    return () => {
      window.removeEventListener('message', handleThemeChange);
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Audio Context
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();

    // Load particle sound
    fetch('/sounds/particle.wav')
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => audioContextRef.current.decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        audioBufferRef.current = audioBuffer;
      })
      .catch(() => {
        // Sound file not found, continue without sound
        console.log('Particle sound not loaded');
      });

    // Scene setup
    const scene = new THREE.Scene();
    const bgColor = theme === 'dark' ? 0x0a0a0a : 0xffffff;
    scene.background = new THREE.Color(bgColor);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 70;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true
    });
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;

    // Particle pool - using InstancedMesh for better performance
    const maxParticles = 150; // Reduced from 200 for better performance
    const particles = [];
    const particleGeometry = new THREE.SphereGeometry(0.3, 6, 6); // Reduced segments
    const normalColor = theme === 'dark' ? 0xe0e0e0 : 0x1a1a1a;
    const dangerColor = 0xff0000; // Red for particles about to die

    // Use InstancedMesh for much better performance
    const instancedMaterial = new THREE.MeshBasicMaterial({ color: normalColor });
    const instancedMesh = new THREE.InstancedMesh(particleGeometry, instancedMaterial, maxParticles);
    instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(instancedMesh);

    // Color array for per-instance coloring
    const colors = new Float32Array(maxParticles * 3);
    const normalColorObj = new THREE.Color(normalColor);
    const dangerColorObj = new THREE.Color(dangerColor);
    for (let i = 0; i < maxParticles; i++) {
      colors[i * 3] = normalColorObj.r;
      colors[i * 3 + 1] = normalColorObj.g;
      colors[i * 3 + 2] = normalColorObj.b;
    }
    instancedMesh.geometry.setAttribute('color', new THREE.InstancedBufferAttribute(colors, 3));
    instancedMaterial.vertexColors = true;

    particlesRef.current = particles;
    let particleCount = 0; // Track active particles
    let frameCount = 0; // For throttling spawns

    // Spawning bounds - smaller, centered region
    const bounds = {
      x: 20, // Reduced spawn area
      y: 20,
      z: 20
    };

    let lastConwayCheck = 0;

    // Function to play sound
    const playParticleSound = () => {
      if (audioBufferRef.current && audioContextRef.current) {
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBufferRef.current;
        const gainNode = audioContextRef.current.createGain();
        gainNode.gain.value = 0.1; // Low volume
        source.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);
        source.start(0);
      }
    };

    // Function to spawn particle
    const spawnParticle = (position = null) => {
      if (particleCount >= maxParticles) return null;

      const particle = {
        position: new THREE.Vector3(),
        index: particleCount,
        active: true
      };

      if (position) {
        // Spawn near a specific position (for Conway rules) - closer proximity for density
        particle.position.x = position.x + (Math.random() - 0.5) * 2;
        particle.position.y = position.y + (Math.random() - 0.5) * 2;
        particle.position.z = position.z + (Math.random() - 0.5) * 2;
      } else {
        // Random position within bounds (centered spawn region)
        particle.position.x = (Math.random() - 0.5) * bounds.x * 2;
        particle.position.y = (Math.random() - 0.5) * bounds.y * 2;
        particle.position.z = (Math.random() - 0.5) * bounds.z * 2;
      }

      // Ensure within bounds
      particle.position.x = Math.max(-bounds.x, Math.min(bounds.x, particle.position.x));
      particle.position.y = Math.max(-bounds.y, Math.min(bounds.y, particle.position.y));
      particle.position.z = Math.max(-bounds.z, Math.min(bounds.z, particle.position.z));

      // Update instance matrix
      const matrix = new THREE.Matrix4();
      matrix.setPosition(particle.position);
      instancedMesh.setMatrixAt(particleCount, matrix);
      instancedMesh.instanceMatrix.needsUpdate = true;

      // Set color to normal
      colors[particleCount * 3] = normalColorObj.r;
      colors[particleCount * 3 + 1] = normalColorObj.g;
      colors[particleCount * 3 + 2] = normalColorObj.b;

      particles.push(particle);
      particleCount++;

      playParticleSound();
      return particle;
    };

    // Function to remove particle
    const removeParticle = (particle) => {
      if (!particle.active) return;
      particle.active = false;

      // Swap with last active particle for efficient removal
      const lastIndex = particleCount - 1;
      if (particle.index !== lastIndex) {
        const lastParticle = particles[lastIndex];
        particles[particle.index] = lastParticle;
        lastParticle.index = particle.index;

        // Update instance matrix
        const matrix = new THREE.Matrix4();
        matrix.setPosition(lastParticle.position);
        instancedMesh.setMatrixAt(particle.index, matrix);

        // Update color
        colors[particle.index * 3] = colors[lastIndex * 3];
        colors[particle.index * 3 + 1] = colors[lastIndex * 3 + 1];
        colors[particle.index * 3 + 2] = colors[lastIndex * 3 + 2];
      }

      particleCount--;
      particles.pop();
      instancedMesh.count = particleCount;
      instancedMesh.instanceMatrix.needsUpdate = true;
    };

    // Create lines between nearby particles - optimized with single geometry
    const lineColor = theme === 'dark' ? 0xe0e0e0 : 0x1a1a1a;
    const lineMaterial = new THREE.LineBasicMaterial({
      color: lineColor,
      transparent: true,
      opacity: 0.3
    });

    // Pre-allocate line positions (max possible connections)
    const maxConnections = maxParticles * 10; // Rough estimate
    const linePositions = new Float32Array(maxConnections * 6); // 2 vertices * 3 coords per connection
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setDrawRange(0, 0); // Start with no lines
    const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineSegments);

    // Animation function
    function animate() {
      requestAnimationFrame(animate);

      const now = Date.now();
      frameCount++;

      // Initial spawn to populate scene (throttled - only spawn every 3rd frame)
      if (particleCount < spawnRate && frameCount % 3 === 0) {
        spawnParticle();
      }

      // Update lines between nearby particles and track connections
      const maxDistance = 8; // Reduced connection radius for denser packing
      const connectionMap = new Map(); // Track connections per particle
      let lineIndex = 0;

      for (let i = 0; i < particleCount; i++) {
        connectionMap.set(particles[i], []);
        // Reset all particles to normal color first
        colors[i * 3] = normalColorObj.r;
        colors[i * 3 + 1] = normalColorObj.g;
        colors[i * 3 + 2] = normalColorObj.b;
      }

      // Calculate connections and update line positions
      for (let i = 0; i < particleCount; i++) {
        for (let j = i + 1; j < particleCount; j++) {
          const distance = particles[i].position.distanceTo(particles[j].position);

          if (distance < maxDistance && lineIndex < maxConnections) {
            // Update line positions
            const idx = lineIndex * 6;
            linePositions[idx] = particles[i].position.x;
            linePositions[idx + 1] = particles[i].position.y;
            linePositions[idx + 2] = particles[i].position.z;
            linePositions[idx + 3] = particles[j].position.x;
            linePositions[idx + 4] = particles[j].position.y;
            linePositions[idx + 5] = particles[j].position.z;
            lineIndex++;

            // Track connections for Conway rules
            connectionMap.get(particles[i]).push(particles[j]);
            connectionMap.get(particles[j]).push(particles[i]);
          }
        }
      }

      // Update line geometry
      lineGeometry.attributes.position.needsUpdate = true;
      lineGeometry.setDrawRange(0, lineIndex * 2); // 2 vertices per line

      // Color particles with 4+ connections red (about to die)
      connectionMap.forEach((connections, particle) => {
        if (connections.length >= 4) {
          colors[particle.index * 3] = dangerColorObj.r;
          colors[particle.index * 3 + 1] = dangerColorObj.g;
          colors[particle.index * 3 + 2] = dangerColorObj.b;
        }
      });
      instancedMesh.geometry.attributes.color.needsUpdate = true;

      // Conway's Game of Life rules (check every 1000ms to reduce spawning rate)
      if (now - lastConwayCheck > 1000) {
        lastConwayCheck = now;

        const particlesToRemove = [];
        const particlesToSpawn = [];

        connectionMap.forEach((connections, particle) => {
          const connectionCount = connections.length;

          // Rule 1: If exactly 2 connections, spawn a new particle nearby
          if (connectionCount === 2 && particleCount < maxParticles) {
            // Calculate midpoint between the 3 particles
            const midpoint = new THREE.Vector3()
              .add(particle.position)
              .add(connections[0].position)
              .add(connections[1].position)
              .divideScalar(3);
            particlesToSpawn.push(midpoint);
          }

          // Rule 2: If 4+ connections, this particle dies
          if (connectionCount >= 4) {
            particlesToRemove.push(particle);
          }
        });

        // Process removals first
        particlesToRemove.forEach(p => removeParticle(p));

        // Then spawns (limit to prevent explosion)
        const spawnLimit = Math.min(particlesToSpawn.length, 5);
        for (let i = 0; i < spawnLimit; i++) {
          spawnParticle(particlesToSpawn[i]);
        }
      }

      // Rotate camera slowly
      camera.position.x = Math.sin(Date.now() * 0.0001) * 70;
      camera.position.z = Math.cos(Date.now() * 0.0001) * 70;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    }
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!canvasRef.current) return;
      camera.aspect = canvasRef.current.clientWidth / canvasRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      // Dispose of instanced mesh and geometries
      instancedMesh.dispose();
      particleGeometry.dispose();
      instancedMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      renderer.dispose();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [theme, spawnRate]);

  return (
    <>
      <div className="container">
        <Header />
        <main style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          minHeight: 'calc(100vh - 200px)'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            marginBottom: '20px',
            fontWeight: '300'
          }}>
            Particles
          </h1>

          <p style={{
            maxWidth: '600px',
            textAlign: 'center',
            marginBottom: '20px',
            opacity: 0.7,
            lineHeight: '1.6'
          }}>
            Static 3D particle network with Conway-inspired life rules.
            Particles with 2 connections spawn new ones, those with 4+ die.
          </p>

          {/* Controls */}
          <div style={{
            display: 'flex',
            gap: '30px',
            marginBottom: '30px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            maxWidth: '400px'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              minWidth: '250px'
            }}>
              <label style={{
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                Spawn Count: {spawnRate}
              </label>
              <input
                type="range"
                min="10"
                max="80"
                value={spawnRate}
                onChange={(e) => setSpawnRate(Number(e.target.value))}
                style={{
                  width: '100%',
                  cursor: 'pointer'
                }}
              />
            </div>
          </div>

          <div style={{
            width: '100%',
            maxWidth: '1200px',
            height: '800px',
            position: 'relative',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: theme === 'dark'
              ? '0 4px 20px rgba(0, 0, 0, 0.5)'
              : '0 4px 20px rgba(0, 0, 0, 0.1)'
          }}>
            <canvas
              ref={canvasRef}
              style={{
                width: '100%',
                height: '100%',
                display: 'block'
              }}
            />

            {/* Smooth edge gradient overlay for blending */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none',
              background: theme === 'dark'
                ? 'radial-gradient(ellipse at center, transparent 40%, rgba(10, 10, 10, 0.3) 100%)'
                : 'radial-gradient(ellipse at center, transparent 40%, rgba(255, 255, 255, 0.3) 100%)'
            }} />
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
