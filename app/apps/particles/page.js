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
  const [particleSpeed, setParticleSpeed] = useState(0.2);

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

    // Particle pool
    const maxParticles = 200;
    const particles = [];
    const particleGeometry = new THREE.SphereGeometry(0.3, 8, 8);
    const normalColor = theme === 'dark' ? 0xe0e0e0 : 0x1a1a1a;
    const dangerColor = 0xff0000; // Red for particles about to die

    particlesRef.current = particles;

    // Boundaries - calculate visible area at z=0
    const aspectRatio = canvasRef.current.clientWidth / canvasRef.current.clientHeight;
    const vFOV = (camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(vFOV / 2) * camera.position.z;
    const width = height * aspectRatio;
    const bounds = {
      x: width / 2 - 5,
      y: height / 2 - 5,
      z: 30
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
      // Each particle gets its own material so we can change colors independently
      const material = new THREE.MeshBasicMaterial({ color: normalColor });
      const particle = new THREE.Mesh(particleGeometry, material);

      if (position) {
        // Spawn near a specific position (for Conway rules)
        particle.position.x = position.x + (Math.random() - 0.5) * 5;
        particle.position.y = position.y + (Math.random() - 0.5) * 5;
        particle.position.z = position.z + (Math.random() - 0.5) * 5;
      } else {
        // Random position within bounds
        particle.position.x = (Math.random() - 0.5) * bounds.x * 2;
        particle.position.y = (Math.random() - 0.5) * bounds.y * 2;
        particle.position.z = (Math.random() - 0.5) * bounds.z * 2;
      }

      // Ensure within bounds
      particle.position.x = Math.max(-bounds.x, Math.min(bounds.x, particle.position.x));
      particle.position.y = Math.max(-bounds.y, Math.min(bounds.y, particle.position.y));
      particle.position.z = Math.max(-bounds.z, Math.min(bounds.z, particle.position.z));

      // Random velocity using current speed setting
      particle.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * particleSpeed,
        (Math.random() - 0.5) * particleSpeed,
        (Math.random() - 0.5) * particleSpeed
      );

      scene.add(particle);
      particles.push(particle);

      playParticleSound();
      return particle;
    };

    // Function to remove particle
    const removeParticle = (particle) => {
      scene.remove(particle);
      particle.material.dispose(); // Clean up individual material
      const index = particles.indexOf(particle);
      if (index > -1) {
        particles.splice(index, 1);
      }
    };

    // Create lines between nearby particles
    const lineColor = theme === 'dark' ? 0xe0e0e0 : 0x1a1a1a;
    const lineMaterial = new THREE.LineBasicMaterial({
      color: lineColor,
      transparent: true,
      opacity: 0.3
    });
    const lineSegments = new THREE.Group();
    scene.add(lineSegments);

    // Animation function
    function animate() {
      requestAnimationFrame(animate);

      const now = Date.now();

      // Initial spawn to populate scene
      if (particles.length < spawnRate) {
        spawnParticle();
      }

      // Update existing particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];

        // Move particle
        particle.position.add(particle.velocity);

        // Bounce off boundaries
        if (Math.abs(particle.position.x) > bounds.x) {
          particle.velocity.x *= -1;
          particle.position.x = Math.max(-bounds.x, Math.min(bounds.x, particle.position.x));
        }
        if (Math.abs(particle.position.y) > bounds.y) {
          particle.velocity.y *= -1;
          particle.position.y = Math.max(-bounds.y, Math.min(bounds.y, particle.position.y));
        }
        if (Math.abs(particle.position.z) > bounds.z) {
          particle.velocity.z *= -1;
          particle.position.z = Math.max(-bounds.z, Math.min(bounds.z, particle.position.z));
        }
      }

      // Update lines between nearby particles and track connections
      lineSegments.clear();
      const maxDistance = 15;
      const connectionMap = new Map(); // Track connections per particle

      for (let i = 0; i < particles.length; i++) {
        connectionMap.set(particles[i], []);
        // Reset all particles to normal color first
        particles[i].material.color.setHex(normalColor);
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const distance = particles[i].position.distanceTo(particles[j].position);

          if (distance < maxDistance) {
            const lineGeometry = new THREE.BufferGeometry().setFromPoints([
              particles[i].position,
              particles[j].position
            ]);
            const line = new THREE.Line(lineGeometry, lineMaterial);
            lineSegments.add(line);

            // Track connections for Conway rules
            connectionMap.get(particles[i]).push(particles[j]);
            connectionMap.get(particles[j]).push(particles[i]);
          }
        }
      }

      // Color particles with 4+ connections red (about to die)
      connectionMap.forEach((connections, particle) => {
        if (connections.length >= 4) {
          particle.material.color.setHex(dangerColor);
        }
      });

      // Conway's Game of Life rules (check every 500ms)
      if (now - lastConwayCheck > 500) {
        lastConwayCheck = now;

        connectionMap.forEach((connections, particle) => {
          const connectionCount = connections.length;

          // Rule 1: If exactly 2 connections, spawn a new particle nearby
          if (connectionCount === 2 && particles.length < maxParticles) {
            // Calculate midpoint between the 3 particles
            const midpoint = new THREE.Vector3()
              .add(particle.position)
              .add(connections[0].position)
              .add(connections[1].position)
              .divideScalar(3);
            spawnParticle(midpoint);
          }

          // Rule 2: If 4+ connections, this particle dies
          if (connectionCount >= 4) {
            removeParticle(particle);
          }
        });
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
      // Dispose of all particle materials
      particles.forEach(particle => {
        if (particle.material) {
          particle.material.dispose();
        }
      });
      renderer.dispose();
      particleGeometry.dispose();
      lineMaterial.dispose();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [theme, spawnRate, particleSpeed]);

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
            Interactive 3D particle system with Conway-inspired rules.
            Particles with 2 connections spawn new ones, those with 4+ die.
          </p>

          {/* Controls */}
          <div style={{
            display: 'flex',
            gap: '30px',
            marginBottom: '30px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            maxWidth: '600px'
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
                max="100"
                value={spawnRate}
                onChange={(e) => setSpawnRate(Number(e.target.value))}
                style={{
                  width: '100%',
                  cursor: 'pointer'
                }}
              />
            </div>

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
                Particle Speed: {particleSpeed.toFixed(2)}
              </label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={particleSpeed}
                onChange={(e) => setParticleSpeed(Number(e.target.value))}
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
