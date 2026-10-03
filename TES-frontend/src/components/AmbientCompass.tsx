import { useEffect, useRef } from 'react';

type Particle = { baseX: number; baseY: number; x: number; y: number; vx: number; vy: number; ring: number; index: number; angle: number };
type Vector = { x: number; y: number; vx: number; vy: number; lastX: number; lastY: number; lastTime: number };

/** A small Canvas field: pointer velocity, scroll inertia, and spring motion without React re-renders. */
export function AmbientCompass({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d', { alpha: true });
    if (!canvas || !context) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const fine = matchMedia('(pointer: fine)');
    const pointer: Vector = { x: -999, y: -999, vx: 0, vy: 0, lastX: -999, lastY: -999, lastTime: 0 };
    const particles: Particle[] = [];
    const rings = 7;
    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = true;
    let lastDraw = 0;
    let lastScroll = scrollY;
    let scrollVelocity = 0;

    const draw = (time: number) => {
      if (!width || !height) return;
      context.clearRect(0, 0, width, height);
      const light = document.documentElement.dataset.theme === 'light';
      const count = particles.length / rings;
      const speed = Math.min(38, Math.hypot(pointer.vx, pointer.vy));
      const distortion = reduced.matches ? 0 : Math.min(1, speed / 26 + Math.abs(scrollVelocity) / 85);
      const drift = reduced.matches ? 0 : Math.sin(time * 0.00024) * 3.4;
      const chroma = distortion * 4.5;
      const ink = light ? '40, 40, 40' : '198, 198, 198';
      const bright = light ? '10, 10, 10' : '255, 255, 255';

      for (const node of particles) {
        const dx = node.baseX - pointer.x;
        const dy = node.baseY - pointer.y;
        const distance = Math.max(1, Math.hypot(dx, dy));
        const proximity = fine.matches && !reduced.matches ? Math.max(0, 1 - distance / 190) : 0;
        const turbulence = proximity * (20 + speed * 0.95);
        const swirl = (scrollVelocity * 0.075 + speed * 0.12) * (node.ring / rings);
        const targetX = node.baseX + dx / distance * turbulence + Math.cos(node.angle + Math.PI / 2) * swirl + drift * node.ring / rings;
        const targetY = node.baseY + dy / distance * turbulence + Math.sin(node.angle + Math.PI / 2) * swirl + scrollVelocity * 0.025 * node.ring / rings;
        node.vx = (node.vx + (targetX - node.x) * 0.075) * 0.82;
        node.vy = (node.vy + (targetY - node.y) * 0.075) * 0.82;
        node.x += node.vx;
        node.y += node.vy;
      }

      context.lineWidth = 0.8;
      for (const node of particles) {
        const next = particles[node.ring * count + (node.index + 1) % count];
        const outer = node.ring < rings - 1 ? particles[(node.ring + 1) * count + node.index] : null;
        const opacity = 0.075 + node.ring * 0.022;
        context.beginPath();
        context.moveTo(node.x, node.y);
        context.lineTo(next.x, next.y);
        if (outer) { context.moveTo(node.x, node.y); context.lineTo(outer.x, outer.y); }
        context.strokeStyle = `rgba(${ink}, ${opacity})`;
        context.stroke();
        if (chroma > 0.25 && node.index % 2 === 0) {
          context.beginPath();
          context.moveTo(node.x + chroma, node.y - chroma * 0.45);
          context.lineTo(next.x + chroma, next.y - chroma * 0.45);
          context.strokeStyle = `rgba(210, 210, 210, ${distortion * 0.17})`;
          context.stroke();
        }
        context.beginPath();
        context.arc(node.x, node.y, node.index % 4 === 0 ? 1.65 : 0.9, 0, Math.PI * 2);
        context.fillStyle = `rgba(${node.index % 4 === 0 ? bright : ink}, ${node.index % 4 === 0 ? 0.82 : 0.38})`;
        context.fill();
      }
      pointer.vx *= 0.86;
      pointer.vy *= 0.86;
      scrollVelocity *= 0.89;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const ratio = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      particles.length = 0;
      const count = width < 560 ? 11 : 18;
      const radius = Math.min(width, height) * 0.48;
      for (let ring = 0; ring < rings; ring++) {
        for (let index = 0; index < count; index++) {
          const angle = index / count * Math.PI * 2 + ring * 0.075;
          const r = radius * (0.23 + ring * 0.122);
          const baseX = width / 2 + Math.cos(angle) * r;
          const baseY = height / 2 + Math.sin(angle) * r * 0.84;
          particles.push({ baseX, baseY, x: baseX, y: baseY, vx: 0, vy: 0, ring, index, angle });
        }
      }
      draw(0);
    };
    const tick = (time: number) => {
      if (!visible || document.hidden || reduced.matches) { frame = 0; return; }
      if (time - lastDraw >= 1000 / 60 - 1) { draw(time); lastDraw = time; }
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      if (visible && !document.hidden && !reduced.matches) frame = requestAnimationFrame(tick);
      else draw(0);
    };
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const bounds = canvas.getBoundingClientRect();
      const now = performance.now();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      const elapsed = Math.max(12, now - pointer.lastTime);
      if (pointer.lastTime) {
        pointer.vx = (x - pointer.lastX) / elapsed * 16;
        pointer.vy = (y - pointer.lastY) / elapsed * 16;
      }
      pointer.x = pointer.lastX = x;
      pointer.y = pointer.lastY = y;
      pointer.lastTime = now;
    };
    const onLeave = () => { pointer.x = pointer.y = pointer.lastX = pointer.lastY = -999; pointer.vx = pointer.vy = 0; pointer.lastTime = 0; };
    const onScroll = () => { scrollVelocity += Math.max(-90, Math.min(90, scrollY - lastScroll)); lastScroll = scrollY; };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: 0.05 });
    const resizer = new ResizeObserver(resize);
    observer.observe(canvas);
    resizer.observe(canvas);
    canvas.addEventListener('pointermove', onPointer, { passive: true });
    canvas.addEventListener('pointerleave', onLeave);
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', sync);
    reduced.addEventListener('change', sync);
    resize();
    sync();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizer.disconnect();
      canvas.removeEventListener('pointermove', onPointer);
      canvas.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', sync);
      reduced.removeEventListener('change', sync);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
