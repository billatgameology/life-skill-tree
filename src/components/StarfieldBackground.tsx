import { useRef, useEffect, memo } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
}

function createStars(w: number, h: number): Star[] {
  // Sparse, subtle stars
  const count = 80;
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() < 0.8 ? 1 : 1.5,
      opacity: 0.15 + Math.random() * 0.25,
    });
  }
  return stars;
}

const StarfieldBackground = memo(function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const stars = createStars(w, h);

    const handleResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      // Re-distribute stars
      stars.length = 0;
      stars.push(...createStars(w, h));
    };

    window.addEventListener('resize', handleResize, { passive: true });

    function animate() {
      if (!ctx) return;
      // Very dark void background
      ctx.fillStyle = '#08090F';
      ctx.fillRect(0, 0, w, h);

      // Draw subtle stars
      for (const star of stars) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = star.opacity;
        ctx.shadowBlur = 0;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(animate);
    }

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
});

export default StarfieldBackground;
