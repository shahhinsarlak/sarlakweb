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