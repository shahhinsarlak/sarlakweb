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
      width: 100%;
      height: 100%;
      pointerEvents: none;
      zIndex: 5000;
    `;
    document.body.appendChild(container);
  
    // Create particles
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      const size = Math.random() * 8 + 4;
      const duration = Math.random() * 1.5 + 1;
      const delay = Math.random() * 0.3;
      const startX = Math.random() * window.innerWidth;
      const startY = window.innerHeight / 2;
  
      particle.style.cssText = `
        position: absolute;
        left: ${startX}px;
        top: ${startY}px;
        width: ${size}px;
        height: ${size}px;
        background: ${['#4a90e2', '#00ff00', '#ffaa00'][Math.floor(Math.random() * 3)]};
        borderRadius: 50%;
        opacity: 1;
        boxShadow: 0 0 ${size * 2}px currentColor;
        animation: levelUpParticle ${duration}s ease-out ${delay}s forwards;
      `;
  
      container.appendChild(particle);
    }
  
    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
      @keyframes levelUpParticle {
        0% {
          opacity: 1;
          transform: translate(0, 0) scale(1);
        }
        100% {
          opacity: 0;
          transform: translate(${Math.random() * 200 - 100}px, -300px) scale(0);
        }
      }
    `;
    document.head.appendChild(style);
  
    // Clean up after animation completes
    setTimeout(() => {
      container.remove();
      style.remove();
    }, 2500);
  };