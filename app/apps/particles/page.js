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
  const [spawnRate, setSpawnRate] = useState(60); // Higher default for denser network

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
    const maxParticles = 200; // Increased for denser network
    const particles = [];
    const particleGeometry = new THREE.SphereGeometry(0.3, 6, 6);
    const normalColor = theme === 'dark' ? 0xe0e0e0 : 0x1a1a1a;
    const dangerColor = 0xff0000; // Red for dying particles
    const energizedColor = theme === 'dark' ? 0x00ffff : 0x0066ff; // Cyan/blue for high energy
    const fadingColor = theme === 'dark' ? 0x666666 : 0xaaaaaa; // Gray for isolated particles

    // Use InstancedMesh for much better performance
    const instancedMaterial = new THREE.MeshBasicMaterial({ color: normalColor });
    const instancedMesh = new THREE.InstancedMesh(particleGeometry, instancedMaterial, maxParticles);
    instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(instancedMesh);

    // Color array for per-instance coloring
    const colors = new Float32Array(maxParticles * 3);
    const normalColorObj = new THREE.Color(normalColor);
    const dangerColorObj = new THREE.Color(dangerColor);
    const energizedColorObj = new THREE.Color(energizedColor);
    const fadingColorObj = new THREE.Color(fadingColor);
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

    // Spawning bounds - much smaller for denser clustering
    const bounds = {
      x: 12, // Tighter spawn area for density
      y: 12,
      z: 12
    };

    let lastRuleCheck = 0;

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
    const spawnParticle = (position = null, inheritedEnergy = 0.7) => {
      if (particleCount >= maxParticles) return null;

      const particle = {
        position: new THREE.Vector3(),
        index: particleCount,
        active: true,
        energy: inheritedEnergy, // Energy level (0-1) for resonance system
        isolatedTime: 0, // Track how long particle has been isolated
        id: Date.now() + Math.random() // Unique identifier
      };

      if (position) {
        // Spawn near a specific position with slight offset
        particle.position.x = position.x + (Math.random() - 0.5) * 1.5;
        particle.position.y = position.y + (Math.random() - 0.5) * 1.5;
        particle.position.z = position.z + (Math.random() - 0.5) * 1.5;
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

        // Update instance matrix for swapped particle
        const matrix = new THREE.Matrix4();
        matrix.setPosition(lastParticle.position);
        instancedMesh.setMatrixAt(particle.index, matrix);

        // Update color for swapped particle
        colors[particle.index * 3] = colors[lastIndex * 3];
        colors[particle.index * 3 + 1] = colors[lastIndex * 3 + 1];
        colors[particle.index * 3 + 2] = colors[lastIndex * 3 + 2];
      }

      // Hide the removed particle by moving it far away and scaling to 0
      const hideMatrix = new THREE.Matrix4();
      hideMatrix.setPosition(new THREE.Vector3(10000, 10000, 10000));
      hideMatrix.scale(new THREE.Vector3(0, 0, 0));
      instancedMesh.setMatrixAt(lastIndex, hideMatrix);

      particleCount--;
      particles.pop();
      instancedMesh.count = particleCount;
      instancedMesh.instanceMatrix.needsUpdate = true;
      instancedMesh.geometry.attributes.color.needsUpdate = true;
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

      // Build list of valid active particles first to avoid stale references
      const activeParticles = [];
      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];
        if (p && p.active && p.position) {
          activeParticles.push(p);
        }
      }

      // Update lines between nearby particles and track connections
      const maxDistance = 6; // Tighter connection radius for denser visual
      const connectionMap = new Map(); // Track connections per particle
      let lineIndex = 0;

      // Initialize connection map for all active particles
      for (const particle of activeParticles) {
        connectionMap.set(particle.id, { particle, connections: [] });
      }

      // Calculate connections and update line positions
      for (let i = 0; i < activeParticles.length; i++) {
        const p1 = activeParticles[i];

        for (let j = i + 1; j < activeParticles.length; j++) {
          const p2 = activeParticles[j];

          const distance = p1.position.distanceTo(p2.position);

          if (distance < maxDistance && lineIndex < maxConnections) {
            // Update line positions - only draw between valid particles
            const idx = lineIndex * 6;
            linePositions[idx] = p1.position.x;
            linePositions[idx + 1] = p1.position.y;
            linePositions[idx + 2] = p1.position.z;
            linePositions[idx + 3] = p2.position.x;
            linePositions[idx + 4] = p2.position.y;
            linePositions[idx + 5] = p2.position.z;
            lineIndex++;

            // Track connections for resonance rules
            connectionMap.get(p1.id).connections.push(p2);
            connectionMap.get(p2.id).connections.push(p1);
          }
        }
      }

      // Clear remaining line buffer positions to prevent ghost lines
      for (let i = lineIndex * 6; i < Math.min((lineIndex + 10) * 6, linePositions.length); i++) {
        linePositions[i] = 0;
      }

      // Update line geometry
      lineGeometry.attributes.position.needsUpdate = true;
      lineGeometry.setDrawRange(0, lineIndex * 2); // 2 vertices per line

      // Update particle colors based on state and energy
      for (const particle of activeParticles) {
        const data = connectionMap.get(particle.id);
        const connectionCount = data.connections.length;
        const idx = particle.index;

        // Energy transfer through connections (resonance effect)
        if (connectionCount >= 2) {
          // Connected particles share and boost energy
          let avgEnergy = particle.energy;
          for (const neighbor of data.connections) {
            avgEnergy += neighbor.energy;
          }
          avgEnergy /= (connectionCount + 1);
          particle.energy = Math.min(1, avgEnergy + 0.002); // Slight boost when connected
          particle.isolatedTime = 0;
        } else if (connectionCount <= 1) {
          // Isolated particles lose energy
          particle.energy = Math.max(0, particle.energy - 0.003);
          particle.isolatedTime++;
        }

        // Color based on state
        if (connectionCount >= 5) {
          // Overcrowded - danger red
          colors[idx * 3] = dangerColorObj.r;
          colors[idx * 3 + 1] = dangerColorObj.g;
          colors[idx * 3 + 2] = dangerColorObj.b;
        } else if (particle.energy > 0.85) {
          // High energy - energized color (cyan/blue)
          colors[idx * 3] = energizedColorObj.r;
          colors[idx * 3 + 1] = energizedColorObj.g;
          colors[idx * 3 + 2] = energizedColorObj.b;
        } else if (connectionCount <= 1 && particle.energy < 0.3) {
          // Isolated and fading - gray
          colors[idx * 3] = fadingColorObj.r;
          colors[idx * 3 + 1] = fadingColorObj.g;
          colors[idx * 3 + 2] = fadingColorObj.b;
        } else {
          // Normal state
          colors[idx * 3] = normalColorObj.r;
          colors[idx * 3 + 1] = normalColorObj.g;
          colors[idx * 3 + 2] = normalColorObj.b;
        }
      }
      instancedMesh.geometry.attributes.color.needsUpdate = true;

      // Crystalline Resonance rules (check every 800ms)
      if (now - lastRuleCheck > 800) {
        lastRuleCheck = now;

        const particlesToRemove = [];
        const particlesToSpawn = [];

        connectionMap.forEach((data) => {
          const { particle, connections } = data;
          const connectionCount = connections.length;

          // Rule 1: High-energy particles with 3-4 connections spawn offspring
          if (particle.energy > 0.9 && connectionCount >= 3 && connectionCount <= 4 && particleCount < maxParticles) {
            // Find geometric center of the cluster for spawn point
            const center = new THREE.Vector3().copy(particle.position);
            for (const neighbor of connections) {
              center.add(neighbor.position);
            }
            center.divideScalar(connectionCount + 1);

            // Offset slightly from center
            const offset = new THREE.Vector3(
              (Math.random() - 0.5) * 3,
              (Math.random() - 0.5) * 3,
              (Math.random() - 0.5) * 3
            );
            center.add(offset);
            particlesToSpawn.push({ position: center, energy: 0.6 });

            // Drain energy from parent
            particle.energy -= 0.3;
          }

          // Rule 2: Overcrowded particles (5+) die
          if (connectionCount >= 5) {
            particlesToRemove.push(particle);
          }

          // Rule 3: Long-isolated particles (no connections for too long) fade away
          if (connectionCount === 0 && particle.isolatedTime > 120) {
            particlesToRemove.push(particle);
          }

          // Rule 4: Very low energy particles die
          if (particle.energy < 0.05) {
            particlesToRemove.push(particle);
          }
        });

        // Process removals first (deduplicate)
        const removeSet = new Set(particlesToRemove);
        removeSet.forEach(p => removeParticle(p));

        // Then spawns (limit to prevent explosion)
        const spawnLimit = Math.min(particlesToSpawn.length, 3);
        for (let i = 0; i < spawnLimit; i++) {
          const spawn = particlesToSpawn[i];
          spawnParticle(spawn.position, spawn.energy);
        }
      }

      // Rotate camera slowly
      camera.position.x = Math.sin(Date.now() * 0.0001) * 50; // Closer camera for denser view
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
            3D particle network with crystalline resonance dynamics.
            Energy pulses through connections - high-energy clusters spawn,
            isolated particles fade, overcrowded ones collapse.
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
                min="20"
                max="150"
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
