/**
 * Confetti Animation Module
 * Uses canvas-confetti library for rich celebration effects
 * Library loaded from CDN in index.html
 */

// Store reference to the library once loaded
let confettiLib = null;

// Check if canvas-confetti library is available
function getConfettiLib() {
  if (confettiLib) return confettiLib;

  // canvas-confetti creates a global 'confetti' function when loaded via CDN
  // We need to grab it before we override it with our wrapper
  if (typeof window.canvasConfetti !== 'undefined') {
    confettiLib = window.canvasConfetti;
  }
  return confettiLib;
}

/**
 * Rich Confetti Celebrations
 */
const ConfettiEffects = {

  /**
   * Premier League style celebration - THE BIG ONE
   * Combines multiple effects for maximum impact
   */
  celebrate() {
    const lib = getConfettiLib();
    if (!lib) {
      console.warn('Confetti library not loaded, using fallback');
      this.fallbackCelebrate();
      return;
    }

    // Stage 1: Initial burst from center
    lib({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00ff85', '#e90052', '#04f5ff', '#ffd700', '#ffffff']
    });

    // Stage 2: Side cannons (staggered)
    setTimeout(() => {
      // Left cannon
      lib({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#00ff85', '#ffd700']
      });
      // Right cannon
      lib({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#e90052', '#04f5ff']
      });
    }, 150);

    // Stage 3: Fireworks burst
    setTimeout(() => {
      this.fireworks();
    }, 400);

    // Stage 4: Golden shower
    setTimeout(() => {
      this.goldRain();
    }, 800);

    // Stage 5: Final big burst
    setTimeout(() => {
      lib({
        particleCount: 150,
        spread: 180,
        origin: { y: 0.5 },
        colors: ['#00ff85', '#e90052', '#04f5ff', '#ffd700', '#ffffff', '#37003c'],
        scalar: 1.2
      });
    }, 1200);
  },

  /**
   * Fireworks effect - bursts from multiple points
   */
  fireworks() {
    const lib = getConfettiLib();
    if (!lib) return;

    const duration = 2000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 9999,
      colors: ['#00ff85', '#e90052', '#04f5ff', '#ffd700', '#ffffff']
    };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 40 * (timeLeft / duration);

      // Random bursts across the screen
      lib({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: randomInRange(0.2, 0.5) }
      });

      lib({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: randomInRange(0.2, 0.5) }
      });
    }, 200);
  },

  /**
   * Gold rain effect - falling gold confetti
   */
  goldRain() {
    const lib = getConfettiLib();
    if (!lib) return;

    const duration = 1500;
    const animationEnd = Date.now() + duration;

    const frame = () => {
      lib({
        particleCount: 3,
        angle: 90,
        spread: 60,
        origin: { x: Math.random(), y: -0.1 },
        colors: ['#ffd700', '#ffec8b', '#daa520'],
        gravity: 1.5,
        scalar: 0.8
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  },

  /**
   * Side cannons only - for smaller celebrations
   */
  sideCannons() {
    const lib = getConfettiLib();
    if (!lib) return;

    // Left
    lib({
      particleCount: 80,
      angle: 60,
      spread: 50,
      origin: { x: 0, y: 0.8 },
      colors: ['#00ff85', '#e90052', '#ffd700']
    });

    // Right
    lib({
      particleCount: 80,
      angle: 120,
      spread: 50,
      origin: { x: 1, y: 0.8 },
      colors: ['#04f5ff', '#e90052', '#ffd700']
    });
  },

  /**
   * Realistic confetti shower
   */
  shower() {
    const lib = getConfettiLib();
    if (!lib) return;

    const duration = 3000;
    const animationEnd = Date.now() + duration;

    const frame = () => {
      lib({
        particleCount: 5,
        startVelocity: 0,
        origin: { x: Math.random(), y: 0 },
        colors: ['#00ff85', '#e90052', '#04f5ff', '#ffd700', '#ffffff'],
        gravity: 0.8,
        drift: (Math.random() - 0.5) * 2,
        scalar: 1.2,
        ticks: 300
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  },

  /**
   * School Pride - team colors celebration
   */
  teamColors(primaryColor, secondaryColor) {
    const lib = getConfettiLib();
    if (!lib) return;

    const colors = [primaryColor, secondaryColor, '#ffffff'];

    lib({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: colors
    });

    setTimeout(() => {
      lib({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: colors
      });
      lib({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: colors
      });
    }, 200);
  },

  /**
   * Fallback celebration using custom canvas (if library fails to load)
   */
  fallbackCelebrate() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#00ff85', '#e90052', '#04f5ff', '#ffd700', '#ffffff'];

    // Create particles
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        vx: (Math.random() - 0.5) * 10,
        vy: Math.random() * 5 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let activeParticles = 0;

      particles.forEach(p => {
        if (p.opacity <= 0) return;

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // gravity
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.005;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation * Math.PI / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();

        if (p.opacity > 0 && p.y < canvas.height + 50) {
          activeParticles++;
        }
      });

      if (activeParticles > 0) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    animate();
  },

  /**
   * Stop all confetti (clear canvas)
   */
  stop() {
    const lib = getConfettiLib();
    if (lib && lib.reset) {
      lib.reset();
    }

    const canvas = document.getElementById('confetti-canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
};

// Create global confetti object with convenient methods
const confetti = {
  celebrate: () => ConfettiEffects.celebrate(),
  fireworks: () => ConfettiEffects.fireworks(),
  goldRain: () => ConfettiEffects.goldRain(),
  sideCannons: () => ConfettiEffects.sideCannons(),
  shower: () => ConfettiEffects.shower(),
  teamColors: (p, s) => ConfettiEffects.teamColors(p, s),
  stop: () => ConfettiEffects.stop()
};

// Initialize canvas-confetti library reference when DOM loads
document.addEventListener('DOMContentLoaded', () => {
  // canvas-confetti library will be available as window.confetti
  // We store it before our wrapper overwrites the global name
  if (typeof window.confetti === 'function' && !confettiLib) {
    confettiLib = window.confetti;
    // Now replace with our wrapper
    window.canvasConfetti = confettiLib;
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { confetti, ConfettiEffects };
}
