'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

// Game constants
const GRID_SIZE = 40;
const GRID_WIDTH = 16;
const GRID_HEIGHT = 10;
const CANVAS_WIDTH = GRID_SIZE * GRID_WIDTH;
const CANVAS_HEIGHT = GRID_SIZE * GRID_HEIGHT;

// Enemy types with pixel art definitions
const ENEMY_TYPES = {
  bug: {
    name: 'Bug',
    health: 30,
    speed: 1.5,
    reward: 10,
    color: '#ff6b6b',
    size: 12,
    animSpeed: 0.1,
  },
  virus: {
    name: 'Virus',
    health: 50,
    speed: 1.2,
    reward: 15,
    color: '#a855f7',
    size: 14,
    animSpeed: 0.15,
  },
  malware: {
    name: 'Malware',
    health: 80,
    speed: 0.8,
    reward: 25,
    color: '#ef4444',
    size: 16,
    animSpeed: 0.2,
  },
  spamBot: {
    name: 'Spam Bot',
    health: 40,
    speed: 1.8,
    reward: 12,
    color: '#10b981',
    size: 10,
    animSpeed: 0.08,
  },
  zeroDayExploit: {
    name: 'Zero-Day Exploit',
    health: 150,
    speed: 0.6,
    reward: 50,
    color: '#f59e0b',
    size: 20,
    animSpeed: 0.25,
  },
};

// Tower types
const TOWER_TYPES = {
  firewall: {
    name: 'Firewall',
    cost: 50,
    damage: 8,
    range: 120,
    fireRate: 1.0,
    color: '#3b82f6',
    particleColor: '#60a5fa',
    description: 'Basic defense, steady damage',
  },
  antivirus: {
    name: 'Antivirus',
    cost: 100,
    damage: 15,
    range: 100,
    fireRate: 0.8,
    color: '#10b981',
    particleColor: '#34d399',
    description: 'High damage, medium range',
  },
  encryption: {
    name: 'Encryption',
    cost: 150,
    damage: 5,
    range: 140,
    fireRate: 0.5,
    color: '#a855f7',
    particleColor: '#c084fc',
    description: 'Fast attack, wide range',
  },
  debugger: {
    name: 'Debugger',
    cost: 200,
    damage: 40,
    range: 80,
    fireRate: 2.0,
    color: '#ef4444',
    particleColor: '#f87171',
    description: 'Powerful but slow',
  },
  loadBalancer: {
    name: 'Load Balancer',
    cost: 250,
    damage: 12,
    range: 160,
    fireRate: 0.6,
    color: '#f59e0b',
    particleColor: '#fbbf24',
    description: 'Attacks multiple targets',
  },
};

// Wave configurations
const WAVE_CONFIGS = [
  { bug: 10 },
  { bug: 15, virus: 3 },
  { bug: 20, virus: 5, spamBot: 5 },
  { virus: 10, spamBot: 8, malware: 2 },
  { bug: 25, virus: 10, malware: 5 },
  { spamBot: 20, malware: 8, zeroDayExploit: 1 },
  { virus: 15, malware: 10, zeroDayExploit: 2 },
  { bug: 30, virus: 20, malware: 10, spamBot: 15 },
  { malware: 15, zeroDayExploit: 5 },
  { bug: 40, virus: 30, malware: 20, spamBot: 20, zeroDayExploit: 10 },
];

// Path definition (snake pattern through the grid)
const PATH = [
  { x: 0, y: 5 },
  { x: 4, y: 5 },
  { x: 4, y: 2 },
  { x: 8, y: 2 },
  { x: 8, y: 7 },
  { x: 12, y: 7 },
  { x: 12, y: 4 },
  { x: 16, y: 4 },
];

export default function TowerDefense() {
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);

  const [gameState, setGameState] = useState({
    credits: 200,
    health: 20,
    wave: 0,
    enemies: [],
    towers: [],
    particles: [],
    gameOver: false,
    victory: false,
    waveInProgress: false,
    enemySpawnQueue: [],
  });

  const [selectedTower, setSelectedTower] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [animFrame, setAnimFrame] = useState(0);
  const [selectedTowerType, setSelectedTowerType] = useState(null);

  // Draw pixel art enemy
  const drawEnemy = useCallback((ctx, enemy) => {
    const { x, y, type, animFrame, health, maxHealth } = enemy;
    const config = ENEMY_TYPES[type];
    const size = config.size;

    ctx.save();
    ctx.translate(x, y);

    // Enemy body (pulsing animation)
    const pulse = Math.sin(animFrame * config.animSpeed) * 2;
    ctx.fillStyle = config.color;

    // Draw different shapes for different enemy types
    if (type === 'bug') {
      // Bug shape - hexagon
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i + animFrame * 0.05;
        const px = Math.cos(angle) * (size / 2 + pulse);
        const py = Math.sin(angle) * (size / 2 + pulse);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    } else if (type === 'virus') {
      // Virus shape - morphing circle
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI / 4) * i;
        const variation = Math.sin(animFrame * 0.1 + i) * 2;
        const px = Math.cos(angle) * (size / 2 + variation);
        const py = Math.sin(angle) * (size / 2 + variation);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    } else if (type === 'malware') {
      // Malware - glitchy square
      const glitch = Math.random() > 0.8 ? Math.random() * 4 - 2 : 0;
      ctx.fillRect(-size / 2 + glitch, -size / 2, size, size);
      ctx.fillRect(-size / 2, -size / 2 + glitch, size, size);
    } else if (type === 'spamBot') {
      // Spam bot - triangle
      ctx.beginPath();
      ctx.moveTo(0, -size / 2);
      ctx.lineTo(size / 2, size / 2);
      ctx.lineTo(-size / 2, size / 2);
      ctx.closePath();
      ctx.fill();
    } else if (type === 'zeroDayExploit') {
      // Zero-day - pulsing star
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 / 5) * i - Math.PI / 2 + animFrame * 0.02;
        const radius = i % 2 === 0 ? size / 2 + pulse : size / 4;
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    }

    // Health bar
    const healthPercent = health / maxHealth;
    const barWidth = size + 4;
    const barHeight = 3;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(-barWidth / 2, size / 2 + 4, barWidth, barHeight);
    ctx.fillStyle = healthPercent > 0.5 ? '#10b981' : healthPercent > 0.25 ? '#f59e0b' : '#ef4444';
    ctx.fillRect(-barWidth / 2, size / 2 + 4, barWidth * healthPercent, barHeight);

    ctx.restore();
  }, []);

  // Draw pixel art tower
  const drawTower = useCallback((ctx, tower) => {
    const { x, y, type } = tower;
    const config = TOWER_TYPES[type];
    const size = 20;

    ctx.save();
    ctx.translate(x * GRID_SIZE + GRID_SIZE / 2, y * GRID_SIZE + GRID_SIZE / 2);

    // Tower base
    ctx.fillStyle = config.color;

    if (type === 'firewall') {
      ctx.fillRect(-size / 2, -size / 2, size, size);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(-size / 2 + 4, -size / 2 + 4, size - 8, size - 8);
    } else if (type === 'antivirus') {
      ctx.beginPath();
      ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(-2, -size / 2, 4, size);
      ctx.fillRect(-size / 2, -2, size, 4);
    } else if (type === 'encryption') {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const px = Math.cos(angle) * size / 2;
        const py = Math.sin(angle) * size / 2;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    } else if (type === 'debugger') {
      ctx.beginPath();
      ctx.moveTo(0, -size / 2);
      ctx.lineTo(size / 2, 0);
      ctx.lineTo(0, size / 2);
      ctx.lineTo(-size / 2, 0);
      ctx.closePath();
      ctx.fill();
    } else if (type === 'loadBalancer') {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
        const radius = size / 2;
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }, []);

  // Draw particle effects
  const drawParticle = useCallback((ctx, particle) => {
    const { x, y, vx, vy, life, maxLife, color, size } = particle;
    const alpha = life / maxLife;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillRect(x - size / 2, y - size / 2, size, size);
    ctx.restore();
  }, []);

  // Main render function
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Clear canvas
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg-color') || '#ffffff';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw grid
    ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--border-color') || '#e0e0e0';
    ctx.lineWidth = 1;
    for (let x = 0; x <= GRID_WIDTH; x++) {
      ctx.beginPath();
      ctx.moveTo(x * GRID_SIZE, 0);
      ctx.lineTo(x * GRID_SIZE, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y <= GRID_HEIGHT; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * GRID_SIZE);
      ctx.lineTo(CANVAS_WIDTH, y * GRID_SIZE);
      ctx.stroke();
    }

    // Draw path
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
    ctx.lineWidth = GRID_SIZE * 0.8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    PATH.forEach((point, i) => {
      const x = point.x * GRID_SIZE + GRID_SIZE / 2;
      const y = point.y * GRID_SIZE + GRID_SIZE / 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw tower ranges (if hovered)
    if (hoveredCell) {
      const tower = gameState.towers.find(t => t.x === hoveredCell.x && t.y === hoveredCell.y);
      if (tower) {
        const config = TOWER_TYPES[tower.type];
        ctx.fillStyle = config.color + '20';
        ctx.beginPath();
        ctx.arc(
          tower.x * GRID_SIZE + GRID_SIZE / 2,
          tower.y * GRID_SIZE + GRID_SIZE / 2,
          config.range,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }

    // Draw tower placement preview
    if (selectedTowerType && hoveredCell) {
      const config = TOWER_TYPES[selectedTowerType];
      const isValidPlacement = !gameState.towers.find(t => t.x === hoveredCell.x && t.y === hoveredCell.y) &&
                               !PATH.some(p => p.x === hoveredCell.x && p.y === hoveredCell.y);

      ctx.fillStyle = isValidPlacement ? config.color + '40' : '#ef444440';
      ctx.fillRect(hoveredCell.x * GRID_SIZE, hoveredCell.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);

      // Draw range preview
      ctx.strokeStyle = isValidPlacement ? config.color + '60' : '#ef444460';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(
        hoveredCell.x * GRID_SIZE + GRID_SIZE / 2,
        hoveredCell.y * GRID_SIZE + GRID_SIZE / 2,
        config.range,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }

    // Draw towers
    gameState.towers.forEach(tower => drawTower(ctx, tower));

    // Draw particles
    gameState.particles.forEach(particle => drawParticle(ctx, particle));

    // Draw enemies
    gameState.enemies.forEach(enemy => drawEnemy(ctx, enemy));

  }, [gameState, hoveredCell, selectedTowerType, drawEnemy, drawTower, drawParticle]);

  // Game loop
  useEffect(() => {
    if (isPaused || gameState.gameOver || gameState.victory) return;

    const gameLoop = () => {
      setGameState(prev => {
        // Update animation frame
        const newAnimFrame = (animFrame + 1) % 360;
        setAnimFrame(newAnimFrame);

        // Update enemies
        const updatedEnemies = prev.enemies.map(enemy => {
          // Move enemy along path
          const currentPathIndex = enemy.pathIndex;
          const targetPoint = PATH[currentPathIndex];
          const targetX = targetPoint.x * GRID_SIZE + GRID_SIZE / 2;
          const targetY = targetPoint.y * GRID_SIZE + GRID_SIZE / 2;

          const dx = targetX - enemy.x;
          const dy = targetY - enemy.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 2) {
            // Reached waypoint, move to next
            if (currentPathIndex >= PATH.length - 1) {
              // Reached end - enemy escapes
              return { ...enemy, reachedEnd: true };
            }
            return { ...enemy, pathIndex: currentPathIndex + 1 };
          }

          const speed = ENEMY_TYPES[enemy.type].speed;
          return {
            ...enemy,
            x: enemy.x + (dx / dist) * speed,
            y: enemy.y + (dy / dist) * speed,
            animFrame: enemy.animFrame + 1,
          };
        });

        // Handle enemies that reached the end
        const escapedEnemies = updatedEnemies.filter(e => e.reachedEnd);
        const activeEnemies = updatedEnemies.filter(e => !e.reachedEnd && e.health > 0);

        let newHealth = prev.health - escapedEnemies.length;
        let newCredits = prev.credits;
        let newParticles = [...prev.particles];

        // Update towers - fire at enemies
        prev.towers.forEach(tower => {
          const config = TOWER_TYPES[tower.type];
          const towerX = tower.x * GRID_SIZE + GRID_SIZE / 2;
          const towerY = tower.y * GRID_SIZE + GRID_SIZE / 2;

          // Check fire rate cooldown
          const timeSinceLastShot = Date.now() - (tower.lastShot || 0);
          if (timeSinceLastShot < config.fireRate * 1000) return;

          // Find enemies in range
          const enemiesInRange = activeEnemies.filter(enemy => {
            const dx = enemy.x - towerX;
            const dy = enemy.y - towerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            return dist <= config.range;
          });

          if (enemiesInRange.length > 0) {
            // Target first enemy
            const target = enemiesInRange[0];
            tower.lastShot = Date.now();

            // Damage enemy
            target.health -= config.damage;

            // Create particle effect
            for (let i = 0; i < 5; i++) {
              const angle = Math.random() * Math.PI * 2;
              const speed = Math.random() * 2 + 1;
              newParticles.push({
                x: towerX,
                y: towerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 30,
                maxLife: 30,
                color: config.particleColor,
                size: 3,
              });
            }

            // If enemy killed, award credits
            if (target.health <= 0) {
              newCredits += ENEMY_TYPES[target.type].reward;
            }
          }
        });

        // Update particles
        newParticles = newParticles
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            life: p.life - 1,
          }))
          .filter(p => p.life > 0);

        // Spawn enemies from queue
        let newEnemySpawnQueue = [...prev.enemySpawnQueue];
        let newEnemies = [...activeEnemies];

        if (newEnemySpawnQueue.length > 0) {
          const now = Date.now();
          if (now - (prev.lastSpawn || 0) > 500) { // Spawn every 500ms
            const enemyType = newEnemySpawnQueue.shift();
            const startPoint = PATH[0];
            newEnemies.push({
              id: Math.random(),
              type: enemyType,
              x: startPoint.x * GRID_SIZE + GRID_SIZE / 2,
              y: startPoint.y * GRID_SIZE + GRID_SIZE / 2,
              pathIndex: 0,
              health: ENEMY_TYPES[enemyType].health,
              maxHealth: ENEMY_TYPES[enemyType].health,
              animFrame: 0,
            });
            prev.lastSpawn = now;
          }
        }

        // Check if wave is complete
        const waveComplete = prev.waveInProgress && newEnemies.length === 0 && newEnemySpawnQueue.length === 0;

        // Check game over conditions
        const gameOver = newHealth <= 0;
        const victory = waveComplete && prev.wave >= WAVE_CONFIGS.length;

        return {
          ...prev,
          enemies: newEnemies,
          particles: newParticles,
          health: Math.max(0, newHealth),
          credits: newCredits,
          enemySpawnQueue: newEnemySpawnQueue,
          waveInProgress: newEnemySpawnQueue.length > 0 || newEnemies.length > 0,
          gameOver,
          victory,
        };
      });
    };

    gameLoopRef.current = setInterval(gameLoop, 1000 / 60); // 60 FPS

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isPaused, gameState.gameOver, gameState.victory, animFrame]);

  // Render loop
  useEffect(() => {
    render();
  }, [render]);

  // Start wave
  const startWave = useCallback(() => {
    if (gameState.waveInProgress) return;

    const waveIndex = gameState.wave;
    if (waveIndex >= WAVE_CONFIGS.length) return;

    const waveConfig = WAVE_CONFIGS[waveIndex];
    const spawnQueue = [];

    Object.entries(waveConfig).forEach(([enemyType, count]) => {
      for (let i = 0; i < count; i++) {
        spawnQueue.push(enemyType);
      }
    });

    // Shuffle spawn queue
    for (let i = spawnQueue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [spawnQueue[i], spawnQueue[j]] = [spawnQueue[j], spawnQueue[i]];
    }

    setGameState(prev => ({
      ...prev,
      wave: prev.wave + 1,
      enemySpawnQueue: spawnQueue,
      waveInProgress: true,
    }));
  }, [gameState.waveInProgress, gameState.wave]);

  // Place tower
  const placeTower = useCallback((x, y, type) => {
    const config = TOWER_TYPES[type];

    if (gameState.credits < config.cost) return;

    // Check if cell is occupied
    const isOccupied = gameState.towers.find(t => t.x === x && t.y === y);
    const isPath = PATH.some(p => p.x === x && p.y === y);

    if (isOccupied || isPath) return;

    setGameState(prev => ({
      ...prev,
      credits: prev.credits - config.cost,
      towers: [...prev.towers, { x, y, type, lastShot: 0 }],
    }));

    setSelectedTowerType(null);
  }, [gameState.credits, gameState.towers]);

  // Handle canvas click
  const handleCanvasClick = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / GRID_SIZE);
    const y = Math.floor((e.clientY - rect.top) / GRID_SIZE);

    if (selectedTowerType) {
      placeTower(x, y, selectedTowerType);
    }
  }, [selectedTowerType, placeTower]);

  // Handle canvas hover
  const handleCanvasMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / GRID_SIZE);
    const y = Math.floor((e.clientY - rect.top) / GRID_SIZE);

    setHoveredCell({ x, y });
  }, []);

  return (
    <>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div className="container">
          <Header />

          <main style={{
            fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
            paddingBottom: '60px'
          }}>
            {/* Title */}
            <div style={{ marginBottom: '40px', textAlign: 'center' }}>
              <h1 style={{
                fontSize: '24px',
                marginBottom: '8px',
                color: 'var(--text-color)'
              }}>
                DATA INFRASTRUCTURE DEFENSE
              </h1>
              <p style={{
                fontSize: '12px',
                color: 'var(--text-color)',
                opacity: 0.6
              }}>
                Protect the servers from digital threats
              </p>
            </div>

            {/* Game stats */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '20px',
              padding: '16px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-color)',
            }}>
              <div>
                <span style={{ opacity: 0.6, marginRight: '8px' }}>CREDITS:</span>
                <span style={{ fontWeight: 'bold' }}>{gameState.credits}</span>
              </div>
              <div>
                <span style={{ opacity: 0.6, marginRight: '8px' }}>HEALTH:</span>
                <span style={{
                  fontWeight: 'bold',
                  color: gameState.health > 10 ? 'var(--text-color)' : '#ef4444'
                }}>{gameState.health}</span>
              </div>
              <div>
                <span style={{ opacity: 0.6, marginRight: '8px' }}>WAVE:</span>
                <span style={{ fontWeight: 'bold' }}>{gameState.wave}/{WAVE_CONFIGS.length}</span>
              </div>
            </div>

            {/* Canvas */}
            <div style={{
              marginBottom: '20px',
              border: '1px solid var(--border-color)',
              display: 'inline-block',
            }}>
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                onClick={handleCanvasClick}
                onMouseMove={handleCanvasMove}
                onMouseLeave={() => setHoveredCell(null)}
                style={{
                  imageRendering: 'pixelated',
                  cursor: selectedTowerType ? 'crosshair' : 'default',
                  display: 'block',
                }}
              />
            </div>

            {/* Controls */}
            <div style={{ marginBottom: '20px' }}>
              <button
                onClick={startWave}
                disabled={gameState.waveInProgress || gameState.gameOver || gameState.victory}
                style={{
                  padding: '12px 24px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: gameState.waveInProgress ? 'var(--hover-color)' : 'var(--accent-color)',
                  color: gameState.waveInProgress ? 'var(--text-color)' : 'var(--bg-color)',
                  cursor: gameState.waveInProgress ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginRight: '12px',
                }}
              >
                {gameState.waveInProgress ? 'Wave in Progress...' : `Start Wave ${gameState.wave + 1}`}
              </button>

              <button
                onClick={() => setIsPaused(!isPaused)}
                style={{
                  padding: '12px 24px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-color)',
                  color: 'var(--text-color)',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>
            </div>

            {/* Tower shop */}
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                opacity: 0.6,
                marginBottom: '12px'
              }}>
                Tower Shop
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px'
              }}>
                {Object.entries(TOWER_TYPES).map(([key, tower]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedTowerType(selectedTowerType === key ? null : key)}
                    disabled={gameState.credits < tower.cost}
                    style={{
                      padding: '16px',
                      border: `2px solid ${selectedTowerType === key ? tower.color : 'var(--border-color)'}`,
                      backgroundColor: selectedTowerType === key ? tower.color + '20' : 'var(--bg-color)',
                      color: 'var(--text-color)',
                      cursor: gameState.credits < tower.cost ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit',
                      fontSize: '11px',
                      textAlign: 'left',
                      opacity: gameState.credits < tower.cost ? 0.5 : 1,
                      transition: 'var(--transition)',
                    }}
                  >
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{tower.name}</div>
                    <div style={{ fontSize: '10px', opacity: 0.6, marginBottom: '8px' }}>
                      {tower.description}
                    </div>
                    <div style={{ fontSize: '10px' }}>
                      <div>Cost: {tower.cost}</div>
                      <div>Damage: {tower.damage}</div>
                      <div>Range: {tower.range}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Game over / victory */}
            {(gameState.gameOver || gameState.victory) && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
              }}>
                <div style={{
                  padding: '40px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-color)',
                  color: 'var(--text-color)',
                  textAlign: 'center',
                  maxWidth: '400px',
                }}>
                  <h2 style={{
                    fontSize: '24px',
                    marginBottom: '16px',
                    color: gameState.victory ? '#10b981' : '#ef4444'
                  }}>
                    {gameState.victory ? 'VICTORY!' : 'GAME OVER'}
                  </h2>
                  <p style={{ marginBottom: '24px', fontSize: '14px' }}>
                    {gameState.victory
                      ? 'All servers defended successfully!'
                      : 'The servers have been compromised.'}
                  </p>
                  <button
                    onClick={() => {
                      setGameState({
                        credits: 200,
                        health: 20,
                        wave: 0,
                        enemies: [],
                        towers: [],
                        particles: [],
                        gameOver: false,
                        victory: false,
                        waveInProgress: false,
                        enemySpawnQueue: [],
                      });
                      setSelectedTowerType(null);
                    }}
                    style={{
                      padding: '12px 24px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--accent-color)',
                      color: 'var(--bg-color)',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}
                  >
                    Play Again
                  </button>
                </div>
              </div>
            )}
          </main>

          <Footer />
        </div>
      </div>
    </>
  );
}
