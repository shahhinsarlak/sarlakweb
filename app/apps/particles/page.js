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
    camera.position.z = 50;

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
    const maxParticles = 150;
    const particles = [];
    const particleGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    const particleColor = theme === 'dark' ? 0xe0e0e0 : 0x1a1a1a;
    const particleMaterial = new THREE.MeshBasicMaterial({ color: particleColor });

    particlesRef.current = particles;

    // Wave control
    let waveIntensity = 0.5; // 0 to 1
    let waveDirection = 1;
    let lastSpawnTime = 0;

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
    const spawnParticle = () => {
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);

      // Random position in 3D space
      particle.position.x = (Math.random() - 0.5) * 80;
      particle.position.y = (Math.random() - 0.5) * 80;
      particle.position.z = (Math.random() - 0.5) * 80;

      // Random velocity
      particle.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.15,
        (Math.random() - 0.5) * 0.15,
        (Math.random() - 0.5) * 0.15
      );

      // Lifetime
      particle.lifetime = 5000 + Math.random() * 10000; // 5-15 seconds
      particle.birthTime = Date.now();
      particle.opacity = 0;
      particle.fadeIn = true;

      scene.add(particle);
      particles.push(particle);

      playParticleSound();
    };

    // Function to remove particle
    const removeParticle = (particle) => {
      scene.remove(particle);
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

      // Update wave intensity (creates waves of particles)
      waveIntensity += waveDirection * 0.001;
      if (waveIntensity > 1) {
        waveIntensity = 1;
        waveDirection = -1;
      } else if (waveIntensity < 0.1) {
        waveIntensity = 0.1;
        waveDirection = 1;
      }

      // Spawn particles based on wave intensity
      const spawnChance = waveIntensity * 0.08; // Higher during waves
      if (Math.random() < spawnChance && particles.length < maxParticles && now - lastSpawnTime > 50) {
        spawnParticle();
        lastSpawnTime = now;
      }

      // Update existing particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        const age = now - particle.birthTime;

        // Fade in
        if (particle.fadeIn && particle.opacity < 1) {
          particle.opacity += 0.05;
          if (particle.opacity >= 1) {
            particle.opacity = 1;
            particle.fadeIn = false;
          }
        }

        // Check lifetime and fade out
        if (age > particle.lifetime) {
          particle.opacity -= 0.02;
          if (particle.opacity <= 0) {
            removeParticle(particle);
            continue;
          }
        }

        // Update material opacity
        particle.material.opacity = particle.opacity;
        particle.material.transparent = true;

        // Move particle
        particle.position.add(particle.velocity);

        // Bounce off boundaries
        if (Math.abs(particle.position.x) > 40) particle.velocity.x *= -1;
        if (Math.abs(particle.position.y) > 40) particle.velocity.y *= -1;
        if (Math.abs(particle.position.z) > 40) particle.velocity.z *= -1;
      }

      // Update lines between nearby particles
      lineSegments.clear();
      const maxDistance = 15;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          if (particles[i].opacity < 0.5 || particles[j].opacity < 0.5) continue;

          const distance = particles[i].position.distanceTo(particles[j].position);

          if (distance < maxDistance) {
            const lineGeometry = new THREE.BufferGeometry().setFromPoints([
              particles[i].position,
              particles[j].position
            ]);
            const line = new THREE.Line(lineGeometry, lineMaterial);
            lineSegments.add(line);
          }
        }
      }

      // Rotate camera slowly
      camera.position.x = Math.sin(Date.now() * 0.0001) * 50;
      camera.position.z = Math.cos(Date.now() * 0.0001) * 50;
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
      renderer.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      lineMaterial.dispose();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [theme]);

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
            marginBottom: '40px',
            opacity: 0.7,
            lineHeight: '1.6'
          }}>
            Interactive 3D particle system with dynamic connections.
            Particles fade in and out in waves, connecting when nearby.
          </p>

          <div style={{
            width: '100%',
            maxWidth: '900px',
            height: '600px',
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
