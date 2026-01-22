/**
 * Confetti Animation Module
 * Creates celebratory confetti effect for sold players
 */

class ConfettiCannon {
  constructor(canvasId = 'confetti-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = canvasId;
      document.body.appendChild(this.canvas);
    }

    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.animationId = null;
    this.isRunning = false;

    // Confetti colors (Premier League inspired)
    this.colors = [
      '#00ff85', // Green
      '#e90052', // Pink
      '#04f5ff', // Cyan
      '#ffd700', // Gold
      '#ffffff', // White
      '#37003c', // Purple
    ];

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticle(x, y, velocityX, velocityY) {
    return {
      x,
      y,
      velocityX,
      velocityY,
      color: this.colors[Math.floor(Math.random() * this.colors.length)],
      size: Math.random() * 10 + 5,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      gravity: 0.3,
      drag: 0.99,
      opacity: 1,
      shape: Math.random() > 0.5 ? 'rect' : 'circle'
    };
  }

  /**
   * Fire confetti from a specific point
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} count - Number of particles
   * @param {number} spread - Spread angle in degrees
   * @param {number} velocity - Initial velocity
   */
  fire(x = window.innerWidth / 2, y = window.innerHeight / 2, count = 100, spread = 360, velocity = 15) {
    const angleRange = (spread * Math.PI) / 180;
    const startAngle = -Math.PI / 2 - angleRange / 2;

    for (let i = 0; i < count; i++) {
      const angle = startAngle + Math.random() * angleRange;
      const speed = velocity * (0.5 + Math.random() * 0.5);

      this.particles.push(
        this.createParticle(
          x,
          y,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed
        )
      );
    }

    if (!this.isRunning) {
      this.start();
    }
  }

  /**
   * Fire confetti cannon from bottom of screen
   */
  fireFromBottom(count = 150) {
    // Left cannon
    this.fire(0, window.innerHeight, count / 2, 60, 20);
    // Right cannon
    this.fire(window.innerWidth, window.innerHeight, count / 2, 60, 20);
  }

  /**
   * Fire confetti shower from top
   */
  shower(count = 200) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const x = Math.random() * window.innerWidth;
        this.particles.push(
          this.createParticle(
            x,
            -20,
            (Math.random() - 0.5) * 2,
            Math.random() * 3 + 2
          )
        );
      }, Math.random() * 2000);
    }

    if (!this.isRunning) {
      this.start();
    }
  }

  /**
   * Celebration effect - combines multiple effects
   */
  celebrate() {
    this.fireFromBottom(200);
    setTimeout(() => this.shower(100), 500);
    setTimeout(() => this.fire(window.innerWidth / 2, window.innerHeight / 2, 100, 360, 12), 200);
  }

  start() {
    this.isRunning = true;
    this.animate();
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.particles = [];
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  animate() {
    if (!this.isRunning) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles = this.particles.filter(particle => {
      // Update physics
      particle.velocityY += particle.gravity;
      particle.velocityX *= particle.drag;
      particle.velocityY *= particle.drag;
      particle.x += particle.velocityX;
      particle.y += particle.velocityY;
      particle.rotation += particle.rotationSpeed;
      particle.opacity -= 0.005;

      // Draw particle
      if (particle.opacity > 0) {
        this.ctx.save();
        this.ctx.translate(particle.x, particle.y);
        this.ctx.rotate((particle.rotation * Math.PI) / 180);
        this.ctx.globalAlpha = particle.opacity;
        this.ctx.fillStyle = particle.color;

        if (particle.shape === 'rect') {
          this.ctx.fillRect(-particle.size / 2, -particle.size / 4, particle.size, particle.size / 2);
        } else {
          this.ctx.beginPath();
          this.ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
          this.ctx.fill();
        }

        this.ctx.restore();
      }

      // Keep particle if still visible
      return particle.opacity > 0 && particle.y < this.canvas.height + 100;
    });

    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(() => this.animate());
    } else {
      this.isRunning = false;
    }
  }
}

// Create global confetti instance
const confetti = new ConfettiCannon();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ConfettiCannon, confetti };
}
