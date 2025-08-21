'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';

const ConwaysGameOfLife = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  
  // Grid configuration
  const CELL_SIZE = 6; // Smaller cells for more detail
  
  // Update dimensions on window resize
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
  const GRID_WIDTH = Math.floor(dimensions.width / CELL_SIZE);
  const GRID_HEIGHT = Math.floor(dimensions.height / CELL_SIZE);

  // Initialize grid with random pattern
  const createRandomGrid = useCallback(() => {
    const grid = [];
    for (let i = 0; i < GRID_HEIGHT; i++) {
      grid[i] = [];
      for (let j = 0; j < GRID_WIDTH; j++) {
        // 25% chance of a cell being alive initially
        grid[i][j] = Math.random() < 0.125 ? 1 : 0;
      }
    }
    return grid;
  }, [GRID_HEIGHT, GRID_WIDTH]);

  const [grid, setGrid] = useState(() => createRandomGrid());

  // Recreate grid when dimensions change
  useEffect(() => {
    setGrid(createRandomGrid());
  }, [createRandomGrid]);

  // Count living neighbors
  const countNeighbors = useCallback((grid, x, y) => {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        
        const newX = x + i;
        const newY = y + j;
        
        // Wrap around edges for infinite grid effect
        const wrappedX = ((newX % GRID_HEIGHT) + GRID_HEIGHT) % GRID_HEIGHT;
        const wrappedY = ((newY % GRID_WIDTH) + GRID_WIDTH) % GRID_WIDTH;
        
        if (grid[wrappedX] && grid[wrappedX][wrappedY]) {
          count += grid[wrappedX][wrappedY];
        }
      }
    }
    return count;
  }, [GRID_HEIGHT, GRID_WIDTH]);

  // Apply Conway's rules
  const nextGeneration = useCallback((currentGrid) => {
    if (!currentGrid || currentGrid.length === 0) return currentGrid;
    
    const newGrid = currentGrid.map(arr => [...arr]);
    
    for (let i = 0; i < GRID_HEIGHT; i++) {
      for (let j = 0; j < GRID_WIDTH; j++) {
        if (!currentGrid[i]) continue;
        
        const neighbors = countNeighbors(currentGrid, i, j);
        
        if (currentGrid[i][j] === 1) {
          // Living cell
          if (neighbors < 2 || neighbors > 3) {
            newGrid[i][j] = 0; // Dies
          }
          // else stays alive (2 or 3 neighbors)
        } else {
          // Dead cell
          if (neighbors === 3) {
            newGrid[i][j] = 1; // Becomes alive
          }
        }
      }
    }
    
    return newGrid;
  }, [countNeighbors, GRID_HEIGHT, GRID_WIDTH]);

  // Draw the grid
  const draw = useCallback((canvas, currentGrid) => {
    if (!canvas || !currentGrid) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Get current theme
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    
    // Set background
    ctx.fillStyle = isDark ? '#0a0a0a' : '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw living cells
    currentGrid.forEach((row, i) => {
      if (!row) return;
      row.forEach((cell, j) => {
        if (cell === 1) {
          // Create a subtle effect with very low opacity
          const opacity = 0.08; // Very subtle
          
          ctx.fillStyle = isDark 
            ? `rgba(255, 255, 255, ${opacity})`
            : `rgba(0, 0, 0, ${opacity})`;
          
          ctx.fillRect(
            j * CELL_SIZE,
            i * CELL_SIZE,
            CELL_SIZE,
            CELL_SIZE
          );
        }
      });
    });
  }, [CELL_SIZE]);

  // Animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isPlaying) return;
    
    setGrid(currentGrid => {
      const newGrid = nextGeneration(currentGrid);
      draw(canvas, newGrid);
      return newGrid;
    });
    
    // Slow down the animation (update every 300ms)
    setTimeout(() => {
      animationRef.current = requestAnimationFrame(animate);
    }, 300);
  }, [isPlaying, nextGeneration, draw]);

  // Setup canvas and start animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    
    // Initial draw
    draw(canvas, grid);
    
    // Start animation
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [grid, draw, animate, isPlaying, dimensions]);

  // Reset grid with new random pattern
  const resetGrid = useCallback(() => {
    setGrid(createRandomGrid());
  }, [createRandomGrid]);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: -1,
      overflow: 'hidden'
    }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      />
      
      {/* Optional controls (remove these lines if you don't want controls) */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        gap: '8px',
        zIndex: 1000
      }}>
        <button
          onClick={togglePlay}
          style={{
            background: 'var(--accent-color)',
            color: 'var(--bg-color)',
            border: '1px solid var(--border-color)',
            padding: '6px 10px',
            fontSize: '11px',
            cursor: 'pointer',
            opacity: 0.5,
            transition: 'var(--transition)',
            fontFamily: 'inherit'
          }}
          onMouseOver={(e) => e.target.style.opacity = '0.8'}
          onMouseOut={(e) => e.target.style.opacity = '0.5'}
        >
          {isPlaying ? 'PAUSE' : 'PLAY'}
        </button>
        <button
          onClick={resetGrid}
          style={{
            background: 'var(--accent-color)',
            color: 'var(--bg-color)',
            border: '1px solid var(--border-color)',
            padding: '6px 10px',
            fontSize: '11px',
            cursor: 'pointer',
            opacity: 0.5,
            transition: 'var(--transition)',
            fontFamily: 'inherit'
          }}
          onMouseOver={(e) => e.target.style.opacity = '0.8'}
          onMouseOut={(e) => e.target.style.opacity = '0.5'}
        >
          RESET
        </button>
      </div>
    </div>
  );
};

export default ConwaysGameOfLife;