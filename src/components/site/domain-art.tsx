'use client';

import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';

/** Where a pointer sits inside an SVG, in its viewBox units. */
function svgPoint(event: PointerEvent<SVGSVGElement>, width: number, height: number) {
  const bounds = event.currentTarget.getBoundingClientRect();
  return { x: ((event.clientX - bounds.left) / bounds.width) * width, y: ((event.clientY - bounds.top) / bounds.height) * height };
}

/* Web & app development: drag the window's edge and the layout reflows. */
function WebArt() {
  const [width, setWidth] = useState(1);
  const dragging = useRef(false);
  const frame = 170 + width * 370;
  const columns = frame > 430 ? 3 : frame > 300 ? 2 : 1;
  const inner = frame - 32;
  const gap = 10;
  const cell = (inner - gap * (columns - 1)) / columns;
  const move = (event: PointerEvent<SVGSVGElement>) => {
    if (!dragging.current) return;
    const { x } = svgPoint(event, 560, 280);
    setWidth(Math.min(1, Math.max(0, (x - 10 - 170) / 370)));
  };
  const keys = (event: KeyboardEvent<SVGGElement>) => {
    const step = event.key === 'ArrowLeft' ? -0.1 : event.key === 'ArrowRight' ? 0.1 : 0;
    if (!step) return;
    event.preventDefault();
    setWidth((value) => Math.min(1, Math.max(0, value + step)));
  };
  return (
    <svg className="domain-art art-web" viewBox="0 0 560 280" onPointerMove={move} onPointerUp={() => { dragging.current = false; }} onPointerLeave={() => { dragging.current = false; }}>
      <rect className="web-frame" x="10" y="10" width={frame} height="260" rx="14" />
      <path className="web-bar" d={`M10 40H${10 + frame}`} />
      <circle className="web-dot" cx="28" cy="25" r="4" /><circle className="web-dot" cx="42" cy="25" r="4" /><circle className="web-dot" cx="56" cy="25" r="4" />
      <rect className="web-block is-nav" x="26" y="54" width={inner} height="12" rx="6" />
      <rect className="web-block is-hero" x="26" y="78" width={inner * (columns === 1 ? 1 : 0.62)} height="54" rx="8" />
      {[0, 1, 2].map((i) => (
        <rect key={i} className="web-block" x={26 + (i % columns) * (cell + gap)} y={146 + Math.floor(i / columns) * 42} width={cell} height="32" rx="7" />
      ))}
      <g className="web-handle" role="slider" tabIndex={0} aria-label="Window width" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(width * 100)} onKeyDown={keys} onPointerDown={(event) => { dragging.current = true; event.currentTarget.ownerSVGElement?.setPointerCapture(event.pointerId); }}>
        <rect x={frame - 2} y="115" width="24" height="50" rx="12" />
        <path d={`M${frame + 6} 130v20M${frame + 14} 130v20`} />
      </g>
      {/* In the title bar, right-aligned, so it stays inside the window at any width. */}
      <text className="art-readout" x={frame - 6} y="30" textAnchor="end">{columns} {columns === 1 ? 'column' : 'columns'}</text>
    </svg>
  );
}

/* CP & DSA: a binary search tree. Point at a value to see the path a search takes. */
const tree = [50, 25, 75, 12, 37, 62, 88, 6, 18, 31, 43, 56, 68, 81, 94];
function treePosition(index: number) {
  const level = Math.floor(Math.log2(index + 1));
  const offset = index + 1 - 2 ** level;
  const span = 520 / 2 ** level;
  return { x: 20 + span * (offset + 0.5), y: 36 + level * 66 };
}
function pathTo(index: number) {
  const path = [index];
  while (path[0] > 0) path.unshift(Math.floor((path[0] - 1) / 2));
  return path;
}
function TreeArt() {
  const [target, setTarget] = useState(10);
  const path = pathTo(target);
  return (
    <svg className="domain-art art-tree" viewBox="0 0 560 280">
      {tree.map((_, i) => i > 0 && (() => {
        const from = treePosition(Math.floor((i - 1) / 2));
        const to = treePosition(i);
        return <line key={`e${i}`} className={path.includes(i) ? 'is-on' : ''} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />;
      })())}
      {tree.map((value, i) => {
        const { x, y } = treePosition(i);
        const step = path.indexOf(i);
        return (
          <g key={value} className={`tree-node ${step >= 0 ? 'is-on' : ''} ${i === target ? 'is-target' : ''}`} style={{ transitionDelay: `${Math.max(step, 0) * 90}ms` }} tabIndex={0} role="button" aria-label={`Search for ${value}`} onPointerEnter={() => setTarget(i)} onFocus={() => setTarget(i)} onClick={() => setTarget(i)}>
            <circle cx={x} cy={y} r="16" />
            <text x={x} y={y + 4.5}>{value}</text>
          </g>
        );
      })}
      <text className="art-readout" x="20" y="272">Found {tree[target]} in {path.length} {path.length === 1 ? 'step' : 'steps'}, not {tree.length}</text>
    </svg>
  );
}

/* AI & data science: steer a decision line between two clusters. */
const points = Array.from({ length: 34 }, (_, i) => {
  const r = (n: number) => { const v = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453; return v - Math.floor(v); };
  const group = i % 2;
  return { group, x: (group ? 360 : 190) + (r(1) - 0.5) * 190, y: (group ? 110 : 170) + (r(2) - 0.5) * 140 };
});
function ClusterArt() {
  const [angle, setAngle] = useState(-0.35);
  const cx = 280;
  const cy = 140;
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  // Which side of the line a point is on decides its predicted group.
  const predict = (p: { x: number; y: number }) => ((p.x - cx) * dy - (p.y - cy) * dx > 0 ? 1 : 0);
  const correct = points.filter((p) => predict(p) === p.group).length;
  const accuracy = Math.round((Math.max(correct, points.length - correct) / points.length) * 100);
  const flip = correct < points.length / 2;
  const steer = (event: PointerEvent<SVGSVGElement>) => {
    const { x, y } = svgPoint(event, 560, 280);
    setAngle(Math.atan2(y - cy, x - cx));
  };
  const keys = (event: KeyboardEvent<SVGSVGElement>) => {
    const step = event.key === 'ArrowLeft' ? -0.12 : event.key === 'ArrowRight' ? 0.12 : 0;
    if (!step) return;
    event.preventDefault();
    setAngle((value) => value + step);
  };
  return (
    <svg className="domain-art art-cluster" viewBox="0 0 560 280" onPointerMove={steer} tabIndex={0} role="slider" aria-label="Decision line angle" aria-valuetext={`${accuracy}% accuracy`} onKeyDown={keys}>
      <line className="cluster-line" x1={cx - dx * 400} y1={cy - dy * 400} x2={cx + dx * 400} y2={cy + dy * 400} />
      {points.map((p, i) => {
        const predicted = flip ? 1 - predict(p) : predict(p);
        return <circle key={i} className={`cluster-point ${predicted ? 'is-b' : 'is-a'} ${predicted !== p.group ? 'is-wrong' : ''}`} cx={p.x} cy={p.y} r={p.group ? 6 : 5.5} />;
      })}
      <circle className="cluster-pivot" cx={cx} cy={cy} r="5" />
      <text className="art-readout" x="20" y="34">Accuracy {accuracy}%</text>
    </svg>
  );
}

/* Open source & security: patch the one vulnerable dependency. */
const deps = [
  { x: 70, y: 140, label: 'your-app', parent: -1 },
  { x: 220, y: 70, label: 'router', parent: 0 },
  { x: 220, y: 210, label: 'auth', parent: 0 },
  { x: 380, y: 40, label: 'url-parse', parent: 1 },
  { x: 380, y: 120, label: 'mime', parent: 1 },
  { x: 380, y: 200, label: 'jwt-lite', parent: 2 },
  { x: 490, y: 250, label: 'base64', parent: 5 },
];
const vulnerable = 6;
function DependencyArt() {
  const [patched, setPatched] = useState(false);
  let chain = [vulnerable];
  while (deps[chain[0]].parent >= 0) chain = [deps[chain[0]].parent, ...chain];
  return (
    <svg className={`domain-art art-deps ${patched ? 'is-patched' : ''}`} viewBox="0 0 560 280">
      {deps.map((dep, i) => dep.parent >= 0 && (
        <path key={`e${i}`} className={chain.includes(i) ? 'is-chain' : ''} style={{ transitionDelay: patched ? `${(chain.length - chain.indexOf(i)) * 140}ms` : '0ms' }} d={`M${deps[dep.parent].x + 40} ${deps[dep.parent].y}C${(deps[dep.parent].x + dep.x) / 2 + 20} ${deps[dep.parent].y} ${(deps[dep.parent].x + dep.x) / 2 - 20} ${dep.y} ${dep.x - 40} ${dep.y}`} />
      ))}
      {deps.map((dep, i) => (
        <g key={dep.label} className={`dep-node ${i === vulnerable ? 'is-vulnerable' : ''} ${chain.includes(i) ? 'is-chain' : ''}`} style={{ transitionDelay: patched ? `${(chain.length - chain.indexOf(i)) * 140}ms` : '0ms' }}>
          <rect x={dep.x - 40} y={dep.y - 15} width="80" height="30" rx="15" />
          <text x={dep.x} y={dep.y + 4.5}>{dep.label}</text>
        </g>
      ))}
      <g className="dep-patch" role="button" tabIndex={0} aria-pressed={patched} aria-label={patched ? 'Undo the patch' : 'Patch base64'} onClick={() => setPatched(!patched)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setPatched(!patched); } }}>
        <rect x="440" y="150" width="100" height="32" rx="16" />
        <text x="490" y="170.5">{patched ? 'Patched' : 'Patch it'}</text>
      </g>
      <text className="art-readout" x="20" y="34">{patched ? '0 vulnerabilities' : '1 vulnerability in your-app'}</text>
    </svg>
  );
}

/* Anything else: the society's compass, turning to follow the pointer. */
function CompassArt() {
  const [turn, setTurn] = useState(0);
  return (
    <svg className="domain-art art-compass" viewBox="0 0 560 280" onPointerMove={(event) => { const { x, y } = svgPoint(event, 560, 280); setTurn((Math.atan2(x - 280, 140 - y) * 180) / Math.PI); }}>
      <circle className="compass-art-ring" cx="280" cy="140" r="110" />
      <circle className="compass-art-ring is-inner" cx="280" cy="140" r="80" />
      <g style={{ transform: `rotate(${turn}deg)`, transformOrigin: '280px 140px' }} className="compass-art-needle">
        <path d="M280 52 290 140H270Z" /><path className="is-south" d="M280 228 270 140H290Z" />
      </g>
      <circle className="compass-art-pin" cx="280" cy="140" r="7" />
    </svg>
  );
}

const arts = [
  { test: /web|app|front|design/i, art: WebArt },
  { test: /\bcp\b|dsa|algorithm|competitive/i, art: TreeArt },
  { test: /\bai\b|data|machine|\bml\b/i, art: ClusterArt },
  { test: /security|open source|devops/i, art: DependencyArt },
];

/** An interactive drawing for a domain, chosen by its title. */
export function DomainArt({ title }: { title: string }) {
  const match = arts.find((entry) => entry.test.test(title));
  const Art = match?.art ?? CompassArt;
  return (
    <figure className="domain-figure">
      <Art />
    </figure>
  );
}
