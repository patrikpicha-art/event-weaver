import { useEffect, useRef } from "react";

/**
 * Wow efekt: jiskry z výhně, které reagují na pohyb myši.
 * Kreslí se na canvas, respektuje prefers-reduced-motion.
 */
export function EmberSparks() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pointer = { x: -999, y: -999 };

    type Spark = { x: number; y: number; vx: number; vy: number; r: number; life: number; max: number };
    let sparks: Spark[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const spawn = (count: number, x?: number, y?: number) => {
      for (let i = 0; i < count; i++) {
        const max = 120 + Math.random() * 160;
        sparks.push({
          x: x ?? Math.random() * w,
          y: y ?? h + Math.random() * 40,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -(0.25 + Math.random() * 0.75),
          r: 0.6 + Math.random() * 1.9,
          life: 0,
          max,
        });
      }
    };

    resize();
    spawn(70);

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      if (pointer.x > 0 && pointer.x < w && pointer.y > 0 && pointer.y < h && Math.random() > 0.55) {
        spawn(2, pointer.x, pointer.y);
      }
    };

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      if (sparks.length < 90) spawn(1);
      sparks = sparks.filter((s) => s.life < s.max);
      for (const s of sparks) {
        s.life += 1;
        const dx = s.x - pointer.x;
        const dy = s.y - pointer.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < 16000) {
          const f = (16000 - dist2) / 16000;
          s.vx += (dx / (Math.sqrt(dist2) + 1)) * f * 0.25;
          s.vy += (dy / (Math.sqrt(dist2) + 1)) * f * 0.25;
        }
        s.vx *= 0.99;
        s.vy = Math.max(-2.2, s.vy * 0.995 - 0.002);
        s.x += s.vx;
        s.y += s.vy;
        const fade = 1 - s.life / s.max;
        const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 5);
        grad.addColorStop(0, `rgba(255, 205, 130, ${0.85 * fade})`);
        grad.addColorStop(0.4, `rgba(226, 122, 42, ${0.45 * fade})`);
        grad.addColorStop(1, "rgba(160, 45, 20, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 5, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-70 mix-blend-screen"
    />
  );
}
