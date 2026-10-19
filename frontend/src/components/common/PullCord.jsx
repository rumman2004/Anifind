import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import "./pullcord.css";

/*
 * PullCord — Ultra-optimized ceiling pull-cord with real Verlet-integration rope.
 * 0% CPU at idle, hardware-accelerated GPU transforms, no heavy filters or wildcard animations.
 * Based on FeralUI (https://feralui.dev/pullcord by Sarthak Navalekar).
 */

const DEFAULT_CONFIG = {
  gravity: 1350,
  damping: 0.94,
  iterations: 6,
  stretchMax: 70,
  stretchToggle: 32,
  maxVelocity: 35,
  sleepVelocity: 0.35,
};

// Geometry (SVG units == px)
const W = 64;
const ANCHOR_X = W / 2;
const REST_Y = 176;
const SVG_H = 340;
const SEGMENTS = 12;
const REST_SEG = REST_Y / SEGMENTS;
const KNOB_R = 6.5;
const HIT = 46;

function buildPath(p) {
  let d = `M ${p[0].x.toFixed(1)} ${p[0].y.toFixed(1)}`;
  for (let i = 1; i < p.length - 1; i++) {
    const xc = (p[i].x + p[i + 1].x) / 2;
    const yc = (p[i].y + p[i + 1].y) / 2;
    d += ` Q ${p[i].x.toFixed(1)} ${p[i].y.toFixed(1)} ${xc.toFixed(1)} ${yc.toFixed(1)}`;
  }
  const n = p.length - 1;
  d += ` L ${p[n].x.toFixed(1)} ${p[n].y.toFixed(1)}`;
  return d;
}

function makeNodes() {
  const arr = [];
  for (let i = 0; i <= SEGMENTS; i++) {
    const y = REST_SEG * i;
    arr.push({ x: ANCHOR_X, y, ox: ANCHOR_X, oy: y, fixed: i === 0 });
  }
  return arr;
}

const INITIAL_PATH = buildPath(makeNodes());

export default function PullCord({
  onPull,
  pulled = false,
  ariaLabel = "Toggle theme",
  noEntrance = true,
  config,
  className,
  style,
}) {
  const reduce = useReducedMotion();

  const cfgRef = useRef({ ...DEFAULT_CONFIG });
  Object.assign(cfgRef.current, DEFAULT_CONFIG, config);

  const knobRef = useRef(null);
  const cordRef = useRef(null);
  const groupRef = useRef(null);

  const dragging = useRef(false);
  const didDrag = useRef(false);
  const clicked = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: ANCHOR_X, y: REST_Y });
  const wake = useRef(() => {});
  const onPullRef = useRef(onPull);
  onPullRef.current = onPull;

  const nodesRef = useRef(null);
  if (nodesRef.current === null) nodesRef.current = makeNodes();

  useEffect(() => {
    const pts = nodesRef.current;
    const last = pts.length - 1;
    let raf = 0;
    let running = false;
    let prevT = 0;
    let prevDt = 0;

    const render = () => {
      if (cordRef.current) {
        cordRef.current.setAttribute("d", buildPath(pts));
      }
      if (groupRef.current) {
        const tx = (pts[last].x - ANCHOR_X).toFixed(1);
        const ty = (pts[last].y - REST_Y).toFixed(1);
        groupRef.current.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      }
    };

    const step = (now) => {
      const { gravity, damping, iterations, sleepVelocity } = cfgRef.current;
      const dt = prevT ? Math.min(0.04, Math.max(0.004, (now - prevT) / 1000)) : 1 / 60;
      prevT = now;
      const tc = prevDt > 0 ? dt / prevDt : 1;
      const velCoef = tc * Math.pow(damping, dt * 60);
      const accCoef = dt * dt;

      pts[last].fixed = dragging.current;

      for (let i = 1; i < pts.length; i++) {
        const p = pts[i];
        if (p.fixed) continue;
        const vx = p.x - p.ox;
        const vy = p.y - p.oy;
        p.ox = p.x;
        p.oy = p.y;
        p.x += vx * velCoef;
        p.y += vy * velCoef + gravity * accCoef;
      }
      pts[0].x = ANCHOR_X;
      pts[0].y = 0;

      if (dragging.current) {
        pts[last].ox = pts[last].x;
        pts[last].oy = pts[last].y;
        pts[last].x = target.current.x;
        pts[last].y = target.current.y;
      }

      for (let k = 0; k < iterations; k++) {
        for (let i = 0; i < last; i++) {
          const a = pts[i];
          const b = pts[i + 1];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 0.0001;
          const diff = ((REST_SEG - dist) / dist) * 0.5;
          const ox = dx * diff;
          const oy = dy * diff;
          if (!a.fixed) {
            a.x -= ox;
            a.y -= oy;
          }
          if (!b.fixed) {
            b.x += ox;
            b.y += oy;
          }
        }
      }

      prevDt = dt;
      render();

      let speed = 0;
      for (let i = 1; i < pts.length; i++) {
        speed += Math.abs(pts[i].x - pts[i].ox) + Math.abs(pts[i].y - pts[i].oy);
      }

      if (!dragging.current && speed < sleepVelocity * dt * 60) {
        pts[last].x = ANCHOR_X;
        pts[last].y = REST_Y;
        render();
        running = false;
        return;
      }
      raf = requestAnimationFrame(step);
    };

    wake.current = () => {
      if (running) return;
      running = true;
      prevT = 0;
      prevDt = 0;
      raf = requestAnimationFrame(step);
    };

    render();
    return () => cancelAnimationFrame(raf);
  }, []);

  const doToggle = () => onPullRef.current?.();

  const scriptedPull = () => {
    doToggle();
    if (reduce) return;
    const pts = nodesRef.current;
    if (pts) {
      pts[pts.length - 1].oy -= 42;
      pts[pts.length - 2].oy -= 20;
      wake.current();
    }
  };

  const onPointerDown = (e) => {
    if (reduce) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    dragging.current = true;
    didDrag.current = false;
    clicked.current = false;
    startPos.current = { x: e.clientX, y: e.clientY };
    wake.current();
  };

  const onPointerMove = (e) => {
    if (!dragging.current) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      didDrag.current = true;
    }
    const { stretchMax, stretchToggle } = cfgRef.current;
    const rawDist = Math.hypot(dx, REST_Y + dy) || 0.0001;

    // Organic rubber-band elasticity curve
    let effectiveDist = rawDist;
    if (rawDist > REST_Y) {
      const extra = rawDist - REST_Y;
      const stretched = stretchMax * (1 - Math.exp(-extra / (stretchMax * 0.75)));
      effectiveDist = REST_Y + stretched;
    }
    const k = effectiveDist / rawDist;
    target.current = { x: ANCHOR_X + dx * k, y: (REST_Y + dy) * k };

    const clickAt = Math.min(stretchToggle, stretchMax - 1);
    if (!clicked.current && (effectiveDist - REST_Y) >= clickAt) {
      clicked.current = true;
      doToggle();
    }
  };

  const onPointerUp = (e) => {
    if (!dragging.current) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    const { maxVelocity } = cfgRef.current;
    dragging.current = false;
    const pts = nodesRef.current;
    const p = pts[pts.length - 1];
    const vx = p.x - p.ox;
    const vy = p.y - p.oy;
    const v = Math.hypot(vx, vy);
    if (v > maxVelocity) {
      const k = maxVelocity / v;
      p.ox = p.x - vx * k;
      p.oy = p.y - vy * k;
    }
    wake.current();
    setTimeout(() => {
      didDrag.current = false;
    }, 60);
  };

  const onClick = (e) => {
    if (didDrag.current) return;
    if (e.detail === 0) return;
    scriptedPull();
  };

  const onKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === " ") && !e.repeat) {
      e.preventDefault();
      scriptedPull();
    }
  };

  return (
    <div
      className={className ? `pullcord ${className}` : "pullcord"}
      style={{
        width: W,
        height: SVG_H,
        ...style,
      }}
    >
      <div className="pullcord-inner">
        <svg
          viewBox={`0 0 ${W} ${SVG_H}`}
          width={W}
          height={SVG_H}
          aria-hidden="true"
          style={{ overflow: "visible" }}
        >
          <defs>
            <linearGradient id="pc-knob-dark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--pullcord-knob-dark-top, #ffffff)" />
              <stop offset="100%" stopColor="var(--pullcord-knob-dark-bottom, #cbd5e1)" />
            </linearGradient>
            <linearGradient id="pc-knob-light" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--pullcord-knob-light-top, #4A5F41)" />
              <stop offset="100%" stopColor="var(--pullcord-knob-light-bottom, #2E3D28)" />
            </linearGradient>
          </defs>

          {/* Rope line */}
          <path
            ref={cordRef}
            d={INITIAL_PATH}
            stroke="var(--pullcord-ink, rgba(148, 163, 184, 0.45))"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            vectorEffect="non-scaling-stroke"
          />

          {/* Weight knob with hardware-accelerated transform */}
          <g
            ref={groupRef}
            style={{
              transformOrigin: "0 0",
              willChange: "transform",
            }}
          >
            {/* Vector drop shadow (0 software rasterization cost) */}
            <circle
              cx={ANCHOR_X}
              cy={REST_Y + 1.2}
              r={KNOB_R}
              fill="rgba(0,0,0,0.25)"
            />
            {/* Main Knob */}
            <circle
              cx={ANCHOR_X}
              cy={REST_Y}
              r={KNOB_R}
              fill={pulled ? "url(#pc-knob-light)" : "url(#pc-knob-dark)"}
              stroke={pulled ? "var(--pullcord-knob-stroke-light, #A9B887)" : "var(--pullcord-knob-stroke-dark, rgba(0,0,0,0.15))"}
              strokeWidth={0.8}
            />
            {/* Inner highlight ring */}
            <circle
              cx={ANCHOR_X}
              cy={REST_Y - 1}
              r={KNOB_R - 2.5}
              fill="none"
              stroke={pulled ? "var(--pullcord-knob-ring-light, rgba(169, 184, 135, 0.75))" : "var(--pullcord-knob-ring-dark, rgba(255,255,255,0.6))"}
              strokeWidth={0.5}
            />
          </g>
        </svg>

        {/* Interactive button hitbox */}
        <button
          ref={knobRef}
          type="button"
          className="pullcord-knob"
          aria-label={ariaLabel}
          aria-pressed={pulled}
          title={ariaLabel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onClick={onClick}
          onKeyDown={onKeyDown}
          style={{
            position: "absolute",
            left: ANCHOR_X - HIT / 2,
            top: REST_Y - HIT / 2,
            width: HIT,
            height: HIT,
            padding: 0,
            border: "none",
            background: "transparent",
            cursor: "grab",
            touchAction: "none",
            pointerEvents: "auto",
          }}
        />
      </div>
    </div>
  );
}
