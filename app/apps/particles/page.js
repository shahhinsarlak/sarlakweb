'use client';
import { useEffect, useRef } from 'react';
import Header from '../../../components/Header';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const MAX_PARTICLES = 200;
const SPAWN_BOUNDS = 15;
const PROXIMITY_THRESHOLD_SQ = 11 * 11; // 121 — distanceToSquared, no sqrt cost
const AMBER = 0xf97316;
const BG_COLOR = 0x0c0a09;

export default function Particles() {
  const canvasRef = useRef(null);
  const headerWrapRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const instancedMeshRef = useRef(null);
  const particlesRef = useRef([]);
  const particleCountRef = useRef(0);
  const rafIdRef = useRef(null);
  const simTimerRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(BG_COLOR);
    sceneRef.current = scene;

    // 2. Measure header height and size canvas accordingly
    const headerHeight = headerWrapRef.current ? headerWrapRef.current.offsetHeight : 0;
    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight - headerHeight;
    canvasRef.current.style.top = headerHeight + 'px';
    canvasRef.current.style.height = canvasHeight + 'px';

    // 2b. Camera
    const camera = new THREE.PerspectiveCamera(75, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.z = 50;
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(canvasWidth, canvasHeight);
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.5;
    controls.enablePan = false;
    controlsRef.current = controls;

    // 5. InstancedMesh setup
    const geometry = new THREE.SphereGeometry(0.3, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color: AMBER });
    const instancedMesh = new THREE.InstancedMesh(geometry, material, MAX_PARTICLES);
    instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    instancedMesh.count = 0;
    scene.add(instancedMesh);
    instancedMeshRef.current = instancedMesh;

    // 6. Proximity lines setup
    const MAX_CONNECTIONS = MAX_PARTICLES * (MAX_PARTICLES - 1) / 2;
    const linePositions = new Float32Array(MAX_CONNECTIONS * 6);
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setDrawRange(0, 0);
    const lineMaterial = new THREE.LineBasicMaterial({ color: AMBER, transparent: true, opacity: 0.3 });
    const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineSegments);

    // 7. spawnParticle function
    const spawnParticle = () => {
      const count = particleCountRef.current;
      if (count >= MAX_PARTICLES) return;
      const particle = {
        index: count,
        position: new THREE.Vector3(
          (Math.random() - 0.5) * SPAWN_BOUNDS * 2,
          (Math.random() - 0.5) * SPAWN_BOUNDS * 2,
          (Math.random() - 0.5) * SPAWN_BOUNDS * 2
        ),
        alive: true,
      };
      const matrix = new THREE.Matrix4();
      matrix.setPosition(particle.position);
      instancedMesh.setMatrixAt(count, matrix);
      instancedMesh.instanceMatrix.needsUpdate = true;
      particlesRef.current.push(particle);
      particleCountRef.current = count + 1;
      instancedMesh.count = particleCountRef.current;
    };

    // 8. Spawn 10 particles immediately on mount
    for (let i = 0; i < 10; i++) {
      spawnParticle();
    }

    // 8b. Death burst particles array (local to useEffect)
    const deathParticles = [];

    // 8c. createDeathBurst — 5 amber fragments, fades over ~20 frames
    const createDeathBurst = (position) => {
      for (let i = 0; i < 5; i++) {
        const geo = new THREE.SphereGeometry(0.15, 4, 4);
        const mat = new THREE.MeshBasicMaterial({
          color: AMBER,
          transparent: true,
          opacity: 1,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(position);
        const velocity = new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        );
        scene.add(mesh);
        deathParticles.push({ mesh, velocity, life: 1.0, fadeSpeed: 0.05 });
      }
    };

    // 8d. removeParticle — swap-and-pop pattern to keep array dense
    const removeParticle = (particle) => {
      if (!particle.alive) return;
      createDeathBurst(particle.position.clone());
      particle.alive = false;
      const count = particleCountRef.current;
      const lastIndex = count - 1;
      const particles = particlesRef.current;

      if (particle.index !== lastIndex) {
        const lastParticle = particles[lastIndex];
        particles[particle.index] = lastParticle;
        lastParticle.index = particle.index;
        const matrix = new THREE.Matrix4();
        matrix.setPosition(lastParticle.position);
        instancedMesh.setMatrixAt(particle.index, matrix);
      }

      particleCountRef.current = lastIndex;
      instancedMesh.count = lastIndex;
      instancedMesh.instanceMatrix.needsUpdate = true;
      particles.pop();
    };

    // 8e. Conway simulation tick — 1200ms interval, one death per tick for crowded clusters
    simTimerRef.current = setInterval(() => {
      const particles = particlesRef.current;
      const count = particleCountRef.current;
      if (count === 0) return;

      const neighbors = new Map();
      for (let i = 0; i < count; i++) {
        neighbors.set(i, []);
      }
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
          const distSq = particles[i].position.distanceToSquared(particles[j].position);
          if (distSq < PROXIMITY_THRESHOLD_SQ) {
            neighbors.get(i).push(particles[j]);
            neighbors.get(j).push(particles[i]);
          }
        }
      }

      const candidates = [];
      for (let i = 0; i < count; i++) {
        if (neighbors.get(i).length >= 3) {
          candidates.push(particles[i]);
        }
      }

      if (candidates.length > 0) {
        const victim = candidates[Math.floor(Math.random() * candidates.length)];
        removeParticle(victim);
      }
    }, 1200);

    // 9. Animation loop
    const animate = () => {
      rafIdRef.current = requestAnimationFrame(animate);
      controls.update(); // REQUIRED for autoRotate + damping

      // Proximity lines
      const particles = particlesRef.current;
      const count = particleCountRef.current;
      let lineIndex = 0;
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
          const distSq = particles[i].position.distanceToSquared(particles[j].position);
          if (distSq < PROXIMITY_THRESHOLD_SQ) {
            const idx = lineIndex * 6;
            linePositions[idx]     = particles[i].position.x;
            linePositions[idx + 1] = particles[i].position.y;
            linePositions[idx + 2] = particles[i].position.z;
            linePositions[idx + 3] = particles[j].position.x;
            linePositions[idx + 4] = particles[j].position.y;
            linePositions[idx + 5] = particles[j].position.z;
            lineIndex++;
          }
        }
      }
      lineGeometry.attributes.position.needsUpdate = true;
      lineGeometry.setDrawRange(0, lineIndex * 2);

      // Animate death burst fragments
      for (let i = deathParticles.length - 1; i >= 0; i--) {
        const dp = deathParticles[i];
        dp.mesh.position.add(dp.velocity);
        dp.velocity.multiplyScalar(0.95);
        dp.life -= dp.fadeSpeed;
        dp.mesh.material.opacity = Math.max(0, dp.life);
        if (dp.life <= 0) {
          scene.remove(dp.mesh);
          dp.mesh.geometry.dispose();
          dp.mesh.material.dispose();
          deathParticles.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
    };
    rafIdRef.current = requestAnimationFrame(animate);

    // 10. Resize handler (re-measures header height)
    const handleResize = () => {
      const newHeaderHeight = headerWrapRef.current ? headerWrapRef.current.offsetHeight : 0;
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight - newHeaderHeight;
      canvasRef.current.style.top = newHeaderHeight + 'px';
      canvasRef.current.style.height = newHeight + 'px';
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    // 11. Cleanup (all bugs fixed)
    return () => {
      cancelAnimationFrame(rafIdRef.current);
      clearInterval(simTimerRef.current);
      deathParticles.forEach(dp => {
        scene.remove(dp.mesh);
        dp.mesh.geometry.dispose();
        dp.mesh.material.dispose();
      });
      controls.dispose();
      window.removeEventListener('resize', handleResize);
      instancedMesh.dispose();
      geometry.dispose();
      material.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <>
      <div
        ref={headerWrapRef}
        style={{ position: 'relative', zIndex: 10, marginBottom: 0 }}
      >
        <Header />
      </div>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          left: 0,
          width: '100%',
          display: 'block',
          zIndex: 1,
        }}
      />
    </>
  );
}
