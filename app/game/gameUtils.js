// Utility functions for the game

export const getDistortionStyle = (sanity) => {
    if (sanity >= 50) return {};
    
    const severity = (50 - sanity) / 40;
    const skewAmount = severity * 3;
    const rotateAmount = severity * 2;
    const blurAmount = severity * 2;
    
    return {
      transform: `skew(${Math.random() * skewAmount - skewAmount/2}deg) rotate(${Math.random() * rotateAmount - rotateAmount/2}deg)`,
      filter: `blur(${blurAmount * Math.random()}px)`,
      transition: 'transform 0.3s, filter 0.3s'
    };
  };
  
  export const distortText = (text, sanity) => {
    if (sanity >= 50) return text;
    
    const severity = (50 - sanity) / 40;
    const glitchChance = severity * 0.3;
    
    return text.split('').map((char, i) => {
      if (Math.random() < glitchChance && char !== ' ') {
        const glitchChars = ['█', '▓', '▒', '░', '╬', '╫', '╪', '┼', char, char, char];
        return glitchChars[Math.floor(Math.random() * glitchChars.length)];
      }
      return char;
    }).join('');
  };
  
  export const getClockTime = (timeInOffice) => {
    const baseHour = 9;
    const totalMinutes = Math.floor(timeInOffice * 10);
    const totalHours = baseHour + Math.floor(totalMinutes / 60);
    const hours = ((totalHours - 9) % 8) + 9;
    const minutes = totalMinutes % 60;
    const displayHours = hours.toString().padStart(2, '0');
    return `${displayHours}:${minutes.toString().padStart(2, '0')}`;
  };

  export const createLevelUpParticles = () => {
    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointerEvents: none;
      zIndex: 5000;
      overflow: hidden;
    `;
    document.body.appendChild(container);
  
    // Dimensional resource colors only
    const dimensionalColors = [
      '#1a1a2e', // Void Fragment
      '#4a4a6a', // Static Crystal
      '#7f00ff', // Glitch Shard
      '#ff6b9d', // Reality Dust
      '#00ffff', // Temporal Core
      '#ffd700', // Dimensional Essence
      '#ff0000'  // Singularity Node
    ];
  
    // Create particles from all edges of the screen
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      const size = Math.random() * 12 + 6;
      const duration = Math.random() * 2 + 1.5;
      const delay = Math.random() * 0.5;
      
      // Randomly start from different edges
      const edge = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
      let startX, startY, endX, endY;
      
      switch(edge) {
        case 0: // Top edge
          startX = Math.random() * window.innerWidth;
          startY = -20;
          endX = Math.random() * window.innerWidth;
          endY = window.innerHeight / 2 + (Math.random() * 300 - 150);
          break;
        case 1: // Right edge
          startX = window.innerWidth + 20;
          startY = Math.random() * window.innerHeight;
          endX = window.innerWidth / 2 + (Math.random() * 300 - 150);
          endY = Math.random() * window.innerHeight;
          break;
        case 2: // Bottom edge
          startX = Math.random() * window.innerWidth;
          startY = window.innerHeight + 20;
          endX = Math.random() * window.innerWidth;
          endY = window.innerHeight / 2 + (Math.random() * 300 - 150);
          break;
        case 3: // Left edge
          startX = -20;
          startY = Math.random() * window.innerHeight;
          endX = window.innerWidth / 2 + (Math.random() * 300 - 150);
          endY = Math.random() * window.innerHeight;
          break;
      }
      
      const color = dimensionalColors[Math.floor(Math.random() * dimensionalColors.length)];
      
      particle.style.cssText = `
        position: absolute;
        left: ${startX}px;
        top: ${startY}px;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        borderRadius: 50%;
        opacity: 1;
        boxShadow: 0 0 ${size * 3}px ${color}, 0 0 ${size * 6}px ${color};
        animation: levelUpParticle${i} ${duration}s ease-out ${delay}s forwards;
        zIndex: 5001;
      `;
  
      // Create unique animation for each particle
      const style = document.createElement('style');
      style.textContent = `
        @keyframes levelUpParticle${i} {
          0% {
            opacity: 1;
            transform: translate(0, 0) scale(1);
          }
          50% {
            opacity: 1;
            transform: translate(${(endX - startX) * 0.5}px, ${(endY - startY) * 0.5}px) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: translate(${endX - startX}px, ${endY - startY}px) scale(0.3);
          }
        }
      `;
      document.head.appendChild(style);
      container.appendChild(particle);
    }
  
    // Add center burst effect
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      const size = Math.random() * 8 + 4;
      const duration = Math.random() * 1.5 + 1;
      const delay = Math.random() * 0.3;
      const angle = (Math.PI * 2 * i) / 30;
      const distance = 300 + Math.random() * 200;
      
      const startX = window.innerWidth / 2;
      const startY = window.innerHeight / 2;
      const endX = Math.cos(angle) * distance;
      const endY = Math.sin(angle) * distance;
      
      const color = dimensionalColors[Math.floor(Math.random() * dimensionalColors.length)];
      
      particle.style.cssText = `
        position: absolute;
        left: ${startX}px;
        top: ${startY}px;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        borderRadius: 50%;
        opacity: 1;
        boxShadow: 0 0 ${size * 3}px ${color}, 0 0 ${size * 6}px ${color};
        animation: levelUpBurst${i} ${duration}s ease-out ${delay}s forwards;
        zIndex: 5001;
      `;
  
      const style = document.createElement('style');
      style.textContent = `
        @keyframes levelUpBurst${i} {
          0% {
            opacity: 1;
            transform: translate(0, 0) scale(0.5);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate(${endX}px, ${endY}px) scale(0);
          }
        }
      `;
      document.head.appendChild(style);
      container.appendChild(particle);
    }
  
    // Clean up after animation completes
    setTimeout(() => {
      container.remove();
      // Clean up all the dynamic styles
      document.querySelectorAll('style').forEach(style => {
        if (style.textContent.includes('levelUpParticle') || style.textContent.includes('levelUpBurst')) {
          style.remove();
        }
      });
    }, 3500);
  };

  export const createSkillPurchaseParticles = () => {
    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 5000;
    `;
    document.body.appendChild(container);
  
    const colors = ['#4a90e2', '#00bfff', '#1e90ff', '#87ceeb'];
  
    for (let i = 0; i < 40; i++) {
      const particle = document.createElement('div');
      const size = Math.random() * 10 + 5;
      const duration = Math.random() * 1.5 + 1;
      const delay = Math.random() * 0.3;
      
      const startX = window.innerWidth / 2;
      const startY = window.innerHeight / 2;
      const angle = (Math.PI * 2 * i) / 40;
      const distance = 150 + Math.random() * 150;
      const endX = Math.cos(angle) * distance;
      const endY = Math.sin(angle) * distance;
      
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      particle.style.cssText = `
        position: absolute;
        left: ${startX}px;
        top: ${startY}px;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        borderRadius: 50%;
        opacity: 1;
        boxShadow: 0 0 ${size * 2}px ${color};
        animation: skillParticle${i} ${duration}s ease-out ${delay}s forwards;
        zIndex: 5001;
      `;
  
      const style = document.createElement('style');
      style.textContent = `
        @keyframes skillParticle${i} {
          0% {
            opacity: 1;
            transform: translate(0, 0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(${endX}px, ${endY}px) scale(0);
          }
        }
      `;
      document.head.appendChild(style);
      container.appendChild(particle);
    }
  
    setTimeout(() => {
      container.remove();
      document.querySelectorAll('style').forEach(style => {
        if (style.textContent.includes('skillParticle')) {
          style.remove();
        }
      });
    }, 2500);
  };

  export const createScreenShake = (intensity = 'normal') => {
    // Shake the entire document to include modals
    const shakeElement = document.documentElement;

    if (shakeElement && shakeElement.style) {
      const originalTransform = shakeElement.style.transform;

      // Different shake intensities
      const shakeParams = {
        small: { distance: 2, duration: 0.2 },
        normal: { distance: 3, duration: 0.4 }
      };

      const params = shakeParams[intensity] || shakeParams.normal;
      const animationName = `screenShake${intensity.charAt(0).toUpperCase() + intensity.slice(1)}`;

      shakeElement.style.animation = `${animationName} ${params.duration}s ease-in-out`;

      const style = document.createElement('style');
      style.id = 'screen-shake-style';
      style.textContent = `
        @keyframes ${animationName} {
          0%, 100% { transform: translate(0, 0); }
          10%, 30%, 50%, 70%, 90% { transform: translate(-${params.distance}px, -${params.distance}px); }
          20%, 40%, 60%, 80% { transform: translate(${params.distance}px, ${params.distance}px); }
        }
      `;

      // Remove existing screen shake style if present
      const existingStyle = document.getElementById('screen-shake-style');
      if (existingStyle) existingStyle.remove();

      document.head.appendChild(style);

      setTimeout(() => {
        shakeElement.style.animation = '';
        shakeElement.style.transform = originalTransform;
        style.remove();
      }, params.duration * 1000);
    }
  };