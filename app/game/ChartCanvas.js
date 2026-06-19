import React, { useEffect, useRef } from 'react';
import { ENTRY, PAGE_SIZE, mulberry32, hashSeed } from './expeditionChart';

/**
 * ChartCanvas — the 128x128 pixel chart for one tier, drawn crisp on a scaled
 * canvas. Discovered nodes show as glyphs; active expeditions draw their route
 * in toward the target with a pulsing head. Click a discovered node to select
 * it for a Delve.
 */

const NODE_COLORS = {
  cache: '#6bd0a0',
  haunt: '#e06b6b',
  echo: '#8aa0d0',
  anomaly: '#c47bff',
  gateway: '#ffcf6b',
};

const genRoute = (seed, from, to, n) => {
  const rng = mulberry32(hashSeed(`${seed}:route`));
  const ang = Math.atan2(to.y - from.y, to.x - from.x) + Math.PI / 2;
  const pts = [];
  for (let i = 0; i <= n; i += 1) {
    const t = i / n;
    const bx = from.x + (to.x - from.x) * t;
    const by = from.y + (to.y - from.y) * t;
    const perp = Math.sin(t * Math.PI) * (rng() * 2 - 1) * 14;
    pts.push({ x: bx + Math.cos(ang) * perp, y: by + Math.sin(ang) * perp });
  }
  return pts;
};

function ChartCanvas({ page, expeditions, selectedNodeId, onSelectNode, size = 384 }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({ page, expeditions, selectedNodeId });
  stateRef.current = { page, expeditions, selectedNodeId };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    const scale = size / PAGE_SIZE;
    let raf;

    const px = (x, y, w, h, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(Math.round(x * scale), Math.round(y * scale), Math.ceil(w * scale), Math.ceil(h * scale));
    };

    const drawGlyph = (node, selected, t) => {
      const c = NODE_COLORS[node.type] || '#cccccc';
      const dim = node.cleared || node.looted;
      const col = dim ? '#6a6a72' : c;
      const x = node.x;
      const y = node.y;
      if (node.type === 'cache') {
        px(x - 2, y - 2, 5, 5, col); px(x - 1, y - 1, 3, 3, '#14141a');
      } else if (node.type === 'haunt') {
        px(x - 3, y - 1, 7, 3, col); px(x - 1, y - 1, 3, 3, '#14141a'); px(x, y, 1, 1, col);
      } else if (node.type === 'echo') {
        px(x, y - 3, 1, 7, col); px(x - 2, y - 1, 5, 1, col);
      } else if (node.type === 'anomaly') {
        const f = 0.5 + 0.5 * Math.sin(t / 220 + x);
        px(x - 2, y, 5, 1, col); px(x, y - 2, 1, 5, col);
        ctx.globalAlpha = f; px(x - 1, y - 1, 3, 3, col); ctx.globalAlpha = 1;
      } else if (node.type === 'gateway') {
        px(x - 3, y - 3, 7, 6, col); px(x - 2, y - 1, 5, 4, '#14141a');
        const g = 0.4 + 0.6 * Math.abs(Math.sin(t / 500));
        ctx.globalAlpha = g; px(x - 1, y, 3, 3, col); ctx.globalAlpha = 1;
      }
      if (selected) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(Math.round((x - 5) * scale) + 0.5, Math.round((y - 5) * scale) + 0.5, Math.round(10 * scale), Math.round(10 * scale));
      }
    };

    const draw = () => {
      const { page: pg, expeditions: exps, selectedNodeId: sel } = stateRef.current;
      const t = performance.now();
      const grad = ctx.createLinearGradient(0, size, 0, 0);
      grad.addColorStop(0, '#0c0c12');
      grad.addColorStop(1, '#16101f');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      px(ENTRY.x - 2, ENTRY.y - 1, 5, 3, '#9fe8ff');

      if (pg) {
        // persistent history: past routes + death markers (faint, beneath active)
        (pg.routes || []).forEach((route) => {
          if (!route.target) return;
          const pts = genRoute(route.seed, ENTRY, route.target, 24);
          let col = 'rgba(120,120,140,0.22)';
          if (route.outcome === 'death') col = 'rgba(160,50,55,0.7)';
          else if (route.outcome === 'success') col = 'rgba(150,150,165,0.35)';
          else if (route.outcome === 'scarred') col = 'rgba(180,120,90,0.4)';
          ctx.strokeStyle = col;
          ctx.lineWidth = 1;
          ctx.beginPath();
          pts.forEach((p, i) => (i ? ctx.lineTo(p.x * scale, p.y * scale) : ctx.moveTo(p.x * scale, p.y * scale)));
          ctx.stroke();
          if (route.outcome === 'death') {
            const tx = route.target.x;
            const ty = route.target.y;
            px(tx - 2, ty - 1, 5, 1, '#c2353c');
            px(tx - 1, ty, 3, 2, '#c2353c');
            px(tx - 2, ty + 2, 1, 1, '#c2353c');
            px(tx + 1, ty + 2, 1, 1, '#c2353c');
          }
        });

        (exps || []).forEach((exp) => {
          if (!exp.targetPoint) return;
          const pts = genRoute(exp.seed, ENTRY, exp.targetPoint, 28);
          const upto = Math.max(1, Math.floor(pts.length * Math.min(1, exp.progress || 0)));
          const lost = exp.outcome === 'retreat';
          ctx.strokeStyle = lost ? '#7a2e34' : exp.kind === 'survey' ? 'rgba(150,150,170,0.5)' : '#b9b9c9';
          ctx.lineWidth = exp.kind === 'survey' ? 1 : 2;
          ctx.beginPath();
          for (let i = 0; i < upto; i += 1) {
            const p = pts[i];
            if (i === 0) ctx.moveTo(p.x * scale, p.y * scale);
            else ctx.lineTo(p.x * scale, p.y * scale);
          }
          ctx.stroke();
          const head = pts[Math.min(upto, pts.length - 1)];
          const pulse = 0.5 + 0.5 * Math.sin(t / 180);
          ctx.globalAlpha = pulse;
          px(head.x - 1, head.y - 1, 2, 2, lost ? '#ff6b6b' : '#ffffff');
          ctx.globalAlpha = 1;
        });

        pg.nodes.forEach((n) => {
          if (!n.discovered) return;
          drawGlyph(n, n.id === sel, t);
        });
      }

      raf = requestAnimationFrame(draw);
    };

    ctx.imageSmoothingEnabled = false;
    draw();
    return () => cancelAnimationFrame(raf);
  }, [size]);

  const handleClick = (e) => {
    const pg = stateRef.current.page;
    if (!pg || !onSelectNode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const lx = ((e.clientX - rect.left) / rect.width) * PAGE_SIZE;
    const ly = ((e.clientY - rect.top) / rect.height) * PAGE_SIZE;
    let best = null;
    let bestD = 8;
    pg.nodes.forEach((n) => {
      if (!n.discovered) return;
      const d = Math.hypot(n.x - lx, n.y - ly);
      if (d < bestD) { bestD = d; best = n; }
    });
    onSelectNode(best ? best.id : null);
  };

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      onClick={handleClick}
      style={{
        width: '100%',
        maxWidth: `${size}px`,
        aspectRatio: '1 / 1',
        imageRendering: 'pixelated',
        border: '1px solid var(--border-color)',
        cursor: 'crosshair',
        display: 'block',
      }}
    />
  );
}

ChartCanvas.displayName = 'ChartCanvas';
export default ChartCanvas;
