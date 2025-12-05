'use client';
import { useEffect, useRef } from 'react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import * as THREE from 'three';

export default function Particles() {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
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
      antialias: true
    });
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;

    // Create particles
    const particleCount = 100;
    const particles = [];
    const particleGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    const particleMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

    for (let i = 0; i < particleCount; i++) {
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);

      // Random position in 3D space
      particle.position.x = (Math.random() - 0.5) * 80;
      particle.position.y = (Math.random() - 0.5) * 80;
      particle.position.z = (Math.random() - 0.5) * 80;

      // Random velocity for movement
      particle.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1
      );

      scene.add(particle);
      particles.push(particle);
    }
    particlesRef.current = particles;

    // Create lines between nearby particles
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.3
    });
    const lineSegments = new THREE.Group();
    scene.add(lineSegments);

    // Animation function
    function animate() {
      requestAnimationFrame(animate);

      // Move particles
      particles.forEach(particle => {
        particle.position.add(particle.velocity);

        // Bounce off boundaries
        if (Math.abs(particle.position.x) > 40) particle.velocity.x *= -1;
        if (Math.abs(particle.position.y) > 40) particle.velocity.y *= -1;
        if (Math.abs(particle.position.z) > 40) particle.velocity.z *= -1;
      });

      // Update lines between nearby particles
      lineSegments.clear();
      const maxDistance = 15;

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
    };
  }, []);

  return (
    <>
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-color)',
        color: 'var(--text-color)'
      }}>
        <Header />

        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px'
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
            Particles move through space and connect when they get close to each other.
          </p>

          <canvas
            ref={canvasRef}
            style={{
              width: '100%',
              maxWidth: '900px',
              height: '600px',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              backgroundColor: '#ffffff'
            }}
          />
        </main>

        <Footer />
      </div>
    </>
  );
}
