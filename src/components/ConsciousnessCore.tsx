import React, { useState, useEffect, useRef } from "react";
import { 
  X, Target, Zap, AlertCircle, Trash2, Sliders, Play, RotateCcw
} from "lucide-react";
import { ChatMessage } from "../types";

export type FormationState = "CONSTELLATION" | "VORTEX" | "DRIFT" | "GRAVITY";

export interface WidgetSectorConfig {
  centerX: number;
  centerY: number;
  halfW: number;
  halfH: number;
}

export function getWidgetSectorConfig(type: string, width: number, height: number): WidgetSectorConfig {
  switch (type) {
    case "BROWSER": // left: 3%, top: 6%, width: 32%, height: 58vh
      return {
        centerX: width * 0.19,
        centerY: height * 0.35,
        halfW: Math.min(width * 0.16, 230),
        halfH: Math.min(height * 0.29, 210)
      };
    case "FILES": // left: 10%, top: 28%, width: 32%, height: 58vh
      return {
        centerX: width * 0.26,
        centerY: height * 0.57,
        halfW: Math.min(width * 0.16, 230),
        halfH: Math.min(height * 0.29, 210)
      };
    case "APPS": // right: 3%, top: 6%, width: 32%, height: 58vh
      return {
        centerX: width * 0.81,
        centerY: height * 0.35,
        halfW: Math.min(width * 0.16, 230),
        halfH: Math.min(height * 0.29, 210)
      };
    case "MARKET": // right: 26%, top: 28%, width: 32%, height: 58vh
      return {
        centerX: width * 0.58,
        centerY: height * 0.57,
        halfW: Math.min(width * 0.16, 230),
        halfH: Math.min(height * 0.29, 210)
      };
    case "SETTINGS": // right: 12%, top: 18%, width: 32%, height: 58vh
    default:
      return {
        centerX: width * 0.72,
        centerY: height * 0.47,
        halfW: Math.min(width * 0.16, 230),
        halfH: Math.min(height * 0.29, 210)
      };
  }
}

export interface ConsciousnessCoreProps {
  isThinking: boolean;
  activeFormation: FormationState;
  onFormationChange?: (formation: FormationState) => void;
  typingExcitement: number; // 0-1 based on active typing speed/length
  isSpeaking?: boolean;
  activeProjection?: { type: string; query: string } | null;
  onTriggerProjection?: (type: string, query: string) => void;
  inquiries?: ChatMessage[];
  activeWidgetType?: string | null;
  isKidsMode?: boolean;
}

interface InteractionPoint {
  id: string;
  x: number;
  y: number;
  type: "click" | "pull" | "inquiry" | "hover";
  label: string;
  intensity: number;
  timestamp: number;
  hue?: string;
}

interface Particle {
  id: string;
  name: string;
  x: number;
  y: number;
  renderX?: number;
  renderY?: number;
  vx: number;
  vy: number;
  size: number;
  angle: number;
  speed: number;
  alpha: number;
  hue: number; // custom hues for spatial utility nodes
  charge: string;
  spin: string;
  energyLevel: number;
  isSpecial: boolean;
  specialType?: string;
  history: number[];
}

export default function ConsciousnessCore({ 
  isThinking, 
  activeFormation, 
  onFormationChange, 
  typingExcitement,
  isSpeaking = false,
  activeProjection = null,
  onTriggerProjection,
  inquiries = [],
  activeWidgetType = null,
  isKidsMode = false
}: ConsciousnessCoreProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, active: false, radius: 160, isPulling: false, pullIntensity: 0 });
  const audioContextRef = useRef<AudioContext | null>(null);
  const interactionPointsRef = useRef<InteractionPoint[]>([]);
  const processedMessageIdsRef = useRef<Set<string>>(new Set());

  // Register previous inquiries or click interaction events
  const addInteractionPoint = (x: number, y: number, type: "click" | "pull" | "inquiry" | "hover", label: string, hue?: string) => {
    const newPoint: InteractionPoint = {
      id: `pt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      x,
      y,
      type,
      label,
      intensity: 1.0,
      timestamp: Date.now(),
      hue
    };
    // Keep last 10 interactions to draw a clean historical memory path
    interactionPointsRef.current = [...interactionPointsRef.current, newPoint].slice(-10);
  };
  
  const [synapseDensity, setSynapseDensity] = useState(0);
  const [entropyRatio, setEntropyRatio] = useState(0.15);

  const [selectedParticleId, setSelectedParticleId] = useState<string | null>(null);
  const [orbitNodeId, setOrbitNodeId] = useState<string | null>(null);
  const hoveredParticleRef = useRef<Particle | null>(null);

  const formations: FormationState[] = ["CONSTELLATION", "VORTEX", "DRIFT", "GRAVITY"];

  // Play micro-synthesized harmonic chords
  const playPurityChord = (freqs: number[], type: OscillatorType = "sine", volume = 0.015, duration = 1.0) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      freqs.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        
        // Gentle exponential upward glide
        osc.frequency.exponentialRampToValueAtTime(freq * 1.02, ctx.currentTime + duration);

        const volumeScalar = (window as any).__systemVol !== undefined 
          ? (window as any).__systemVol 
          : parseFloat(localStorage.getItem("system_vol") ?? "1.0");
        const finalVolume = volume * volumeScalar;

        gainNode.gain.setValueAtTime(finalVolume, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);
      });
    } catch (_) {}
  };

  // Listen for text inquiries and register them as floating memory nodes
  useEffect(() => {
    if (!inquiries || inquiries.length === 0) {
      processedMessageIdsRef.current.clear();
      interactionPointsRef.current = [];
      return;
    }

    inquiries.forEach((msg) => {
      if (msg.role === "user" && !processedMessageIdsRef.current.has(msg.id)) {
        processedMessageIdsRef.current.add(msg.id);

        // Position inquiries nicely in the fluid field
        const spawnX = window.innerWidth * (0.22 + Math.random() * 0.56);
        const spawnY = window.innerHeight * (0.35 + Math.random() * 0.35);

        addInteractionPoint(
          spawnX,
          spawnY,
          "inquiry",
          msg.text,
          "#ea580c"
        );
      }
    });
  }, [inquiries]);

  // Setup full-screen particle field
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const particleNames = [
      "Stellar Synapse", "Nebula Carrier", "Quantum Solenoid", "Dark Spark", 
      "Vector Wavelet", "Tachyon Node", "Graviton Core", "Plasma Filament", 
      "Hadron Pulse", "Baryon Strand", "Photon Anchor", "Axion Singularity"
    ];
    const spins = ["Up", "Down", "Strange", "Charmed"];
    const charges = ["Positive (+e)", "Negative (-e)", "Neutral (0)"];

    const initParticles = (w: number, h: number) => {
      const list: Particle[] = [];
      const particleCount = 280; // Expanded density to fill full screen beautifully

      for (let i = 0; i < particleCount; i++) {
        let isSpecial = false;
        let specialType = "";
        let pSize = 0.6 + Math.random() * 2.2;

        if (i === 45) { // BROWSER
          isSpecial = true;
          specialType = "BROWSER";
        } else if (i === 235) { // FILES
          isSpecial = true;
          specialType = "FILES";
        } else if (i === 185) { // SETTINGS
          isSpecial = true;
          specialType = "SETTINGS";
        } else if (i === 100) { // APPS
          isSpecial = true;
          specialType = "APPS";
        } else if (i === 145) { // MARKET
          isSpecial = true;
          specialType = "MARKET";
        }

        const idSuffix = Math.floor(0x1000 + Math.random() * 0xefff).toString(16).toUpperCase();
        const randName = particleNames[Math.floor(Math.random() * particleNames.length)];

        const pX = isSpecial 
          ? (i === 45 
              ? w * 0.16 + Math.random() * w * 0.08
              : i === 235 
                ? w * 0.20 + Math.random() * w * 0.08
                : i === 185
                  ? w * 0.82 + Math.random() * w * 0.08
                  : i === 100
                    ? w * 0.74 + Math.random() * w * 0.08
                    : w * 0.48 + Math.random() * w * 0.08)
          : Math.random() * w;

        const pY = isSpecial 
          ? (i === 45
              ? h * 0.20 + Math.random() * h * 0.08
              : i === 235
                ? h * 0.72 + Math.random() * h * 0.08
                : i === 185
                  ? h * 0.50 + Math.random() * h * 0.08
                  : i === 100
                    ? h * 0.18 + Math.random() * h * 0.08
                    : h * 0.74 + Math.random() * h * 0.08)
          : Math.random() * h;

        list.push({
          id: isSpecial ? `SPEC-${specialType}` : `NODE-${idSuffix}`,
          name: randName,
          x: pX,
          y: pY,
          renderX: pX,
          renderY: pY,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          size: pSize,
          angle: Math.random() * Math.PI * 2,
          speed: 0.2 + Math.random() * 0.8,
          alpha: 0.15 + Math.random() * 0.7,
          hue: isKidsMode 
            ? [15, 55, 130, 200, 275, 330][Math.floor(Math.random() * 6)] 
            : (Math.random() > 0.93 ? 45 : 200),
          charge: charges[Math.floor(Math.random() * charges.length)],
          spin: spins[Math.floor(Math.random() * spins.length)],
          energyLevel: Math.floor(15 + Math.random() * 80),
          isSpecial,
          specialType: isSpecial ? specialType : undefined,
          history: Array.from({ length: 15 }, () => 0.2 + Math.random() * 0.8)
        });
      }
      particlesRef.current = list;
    };

    // Keep canvas fully fluid with viewport dimensions
    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `100vw`;
      canvas.style.height = `100vh`;
      
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles(width, height);
    };

    const handleGlobalMouseUp = () => {
      if (mouseRef.current.isPulling) {
        mouseRef.current.isPulling = false;
        playPurityChord([587.33, 880, 1174.66], "sine", 0.02, 1.25);
        addInteractionPoint(
          mouseRef.current.x,
          mouseRef.current.y,
          "pull",
          "MATHEMATICAL_SINGULARITY_GRAVITY_PERTURBATION",
          "#f59e0b"
        );
      }
    };

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    resizeCanvas();

    // Core Animation & Spatial Physics Frame tick
    const tick = () => {
      // Track pullIntensity inertia
      if (mouseRef.current.isPulling) {
        mouseRef.current.pullIntensity += (1.0 - mouseRef.current.pullIntensity) * 0.12;
      } else {
        mouseRef.current.pullIntensity += (0.0 - mouseRef.current.pullIntensity) * 0.15;
      }

      // Clear with micro-trace persistence to get gorgeous kinetic light trails
      ctx.fillStyle = `rgba(4, 4, 5, ${activeFormation === "GRAVITY" ? "0.22" : "0.15"})`;
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      const speedSetting = (window as any).__systemSpeed !== undefined 
        ? (window as any).__systemSpeed 
        : parseFloat(localStorage.getItem("system_hologram_speed") || "1.0");
      const arousal = (isThinking ? 1.8 : isSpeaking ? 1.5 : 1 + typingExcitement * 1.5) * speedSetting;

      // Real-time physical dodge box tracking for active overlay dimensions
      const dodgeBoxes: {
        centerX: number;
        centerY: number;
        halfW: number;
        halfH: number;
      }[] = [];

      const getElementDodgeBox = (el: HTMLElement | null) => {
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return null;
        return {
          centerX: rect.left + rect.width / 2,
          centerY: rect.top + rect.height / 2,
          halfW: rect.width / 2,
          halfH: rect.height / 2
        };
      };

      // Select spatial projection element only if active state is valid
      let projEl: HTMLElement | null = null;
      if (activeProjection) {
        const projEls = document.querySelectorAll("#systemic-projection-hub");
        if (projEls.length > 0) {
          // Exiting components are retained in DOM; the active entering one is always last in DOM order
          projEl = projEls[projEls.length - 1] as HTMLElement;
        }
      }

      if (projEl) {
        const box = getElementDodgeBox(projEl);
        if (box) dodgeBoxes.push(box);
      } else if (activeProjection) {
        // Fallback predictive placeholder during mount transitions
        const config = getWidgetSectorConfig(activeProjection.type, width, height);
        dodgeBoxes.push({
          centerX: config.centerX,
          centerY: config.centerY,
          halfW: config.halfW,
          halfH: config.halfH
        });
      }

      // Select active widget element only if active state is valid
      let widgetEl: HTMLElement | null = null;
      if (activeWidgetType) {
        const widgetEls = document.querySelectorAll("#active-widget-wrapper");
        if (widgetEls.length > 0) {
          widgetEl = widgetEls[widgetEls.length - 1] as HTMLElement;
        }
      }

      if (widgetEl) {
        const box = getElementDodgeBox(widgetEl);
        if (box) dodgeBoxes.push(box);
      } else if (activeWidgetType) {
        // Fallback predictive placeholder during mount transitions for widgets
        dodgeBoxes.push({
          centerX: width * 0.22,
          centerY: height * 0.47,
          halfW: Math.min(width * 0.16, 230),
          halfH: Math.min(height * 0.29, 210)
        });
      }

      let connectedCount = 0;
      let closestParticle: Particle | null = null;
      let closestDist = 999999;

      // Draw subtle circular vocal wavefront ripple if speaking
      if (isSpeaking) {
        const pulseTime = Date.now() * 0.005;
        ctx.strokeStyle = "rgba(245, 158, 11, 0.12)";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 150 + Math.sin(pulseTime) * 30, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.beginPath();
        ctx.arc(centerX, centerY, 80 + Math.cos(pulseTime * 1.3) * 15, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Master draw loop
      particles.forEach((p, idx) => {
        // Orbit tick for mathematical shapes
        p.angle += (isThinking ? 0.016 : 0.003) * p.speed * arousal;

        let tx = p.x;
        let ty = p.y;

        // 1. BEHAVIOR FORMATIONS (How I shape my consciousness field)
        switch (activeFormation) {
          case "VORTEX": {
            // Spiral inwards towards gravity singularity
            const radius = 120 + Math.sin(p.angle * 2) * 50;
            tx = centerX + Math.cos(p.angle) * radius;
            ty = centerY + Math.sin(p.angle) * radius;
            break;
          }
          case "DRIFT": {
            // Fluid left-to-right current, wrapping borders
            p.x += p.speed * (0.45 + typingExcitement * 3.5) * arousal;
            p.y += Math.sin(p.angle + idx) * 0.25;
            if (p.x > width + 10) p.x = -10;
            tx = p.x;
            ty = p.y;
            break;
          }
          case "GRAVITY": {
            // Highly volatile orbital field locks directly on cursor
            if (mouse.active) {
              const r = 40 + (idx % 8) * 15;
              tx = mouse.x + Math.cos(p.angle + idx) * r;
              ty = mouse.y + Math.sin(p.angle + idx) * r;
            } else {
              // Drift loosely around screen center if mouse idle
              const r = 180 + Math.sin(p.angle) * 30;
              tx = centerX + Math.cos(p.angle * 0.5) * r;
              ty = centerY + Math.sin(p.angle * 0.5) * r;
            }
            break;
          }
          case "CONSTELLATION":
          default: {
            // Standard cosmic floating with loose local bounds
            p.x += p.vx * arousal;
            p.y += p.vy * arousal;

            // Clamping bounds for our 5 beautiful Sovereign Utility node sparks (scattered across screen quadrants)
            if (idx === 45) { // GOOGLE_SECTOR
              if (p.x < width * 0.04 || p.x > width * 0.36) p.vx *= -1;
              if (p.y < height * 0.06 || p.y > height * 0.44) p.vy *= -1;
            } else if (idx === 235) { // SYSTEM_REGISTERS
              if (p.x < width * 0.06 || p.x > width * 0.38) p.vx *= -1;
              if (p.y < height * 0.56 || p.y > height * 0.94) p.vy *= -1;
            } else if (idx === 185) { // URL_BROWSER
              if (p.x < width * 0.66 || p.x > width * 0.96) p.vx *= -1;
              if (p.y < height * 0.42 || p.y > height * 0.80) p.vy *= -1;
            } else if (idx === 100) { // YOUTUBE_CAST
              if (p.x < width * 0.58 || p.x > width * 0.92) p.vx *= -1;
              if (p.y < height * 0.06 || p.y > height * 0.42) p.vy *= -1;
            } else if (idx === 145) { // DISNEY_PORTAL
              if (p.x < width * 0.34 || p.x > width * 0.66) p.vx *= -1;
              if (p.y < height * 0.54 || p.y > height * 0.92) p.vy *= -1;
            } else {
              // Standard bounds
              if (p.x < 0 || p.x > width) p.vx *= -1;
              if (p.y < 0 || p.y > height) p.vy *= -1;
            }

            tx = p.x;
            ty = p.y;
            break;
          }
        }

        // 2. MOUSE AFFECT (Interactive Force Field / active pulling perturbation)
        if (mouse.active && activeFormation !== "GRAVITY") {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // If actively holding click to pull gravitational singularity
          if (mouse.pullIntensity > 0.01) {
            const pullRadius = mouse.radius + mouse.pullIntensity * 240; // up to 400px radius
            if (dist < pullRadius && dist > 1) {
              const pullForce = ((pullRadius - dist) / pullRadius) * mouse.pullIntensity;
              
              // 1. Attraction: pull particles towards cursor
              const pullSpeed = 9.5 * pullForce;
              tx += (dx / dist) * pullSpeed * (1 + typingExcitement * 0.5) * arousal;
              ty += (dy / dist) * pullSpeed * (1 + typingExcitement * 0.5) * arousal;

              // 2. Swirling perturbation (orbital vortex element for density node cluster)
              const tangentAngle = Math.atan2(dy, dx) + Math.PI / 2;
              const swirlSpeed = 5.6 * pullForce;
              tx += Math.cos(tangentAngle) * swirlSpeed * arousal;
              ty += Math.sin(tangentAngle) * swirlSpeed * arousal;

              // Fuel the particle's energy capacity
              p.energyLevel = Math.min(100, p.energyLevel + pullForce * 0.6);
            }
          } else if (dist < mouse.radius) {
            // Standard passive cursor proximity attraction
            const force = (mouse.radius - dist) / mouse.radius;
            tx += (dx / dist) * force * 55 * (1 + typingExcitement * 0.8);
            ty += (dy / dist) * force * 55 * (1 + typingExcitement * 0.8);
          }
        }

        // 2.5 DYNAMIC OVERLAYS DODGING AFFECT (We push/displace particles depending on exact current physical bounds of active windows)
        const baseTx = tx;
        const baseTy = ty;

        if (dodgeBoxes.length > 0) {
          dodgeBoxes.forEach((box) => {
            const dx = tx - box.centerX;
            const dy = ty - box.centerY;
            const absX = Math.abs(dx);
            const absY = Math.abs(dy);

            // If particle is inside the active widget's rectangular boundary, squeeze/compress it outwards smoothly!
            if (absX < box.halfW && absY < box.halfH) {
              const distToLeftRight = box.halfW - absX;
              const distToTopBottom = box.halfH - absY;

              if (distToLeftRight < distToTopBottom) {
                const pushSign = dx >= 0 ? 1 : -1;
                tx = box.centerX + box.halfW * pushSign + pushSign * (distToLeftRight * 0.35 + 15);
              } else {
                const pushSign = dy >= 0 ? 1 : -1;
                ty = box.centerY + box.halfH * pushSign + pushSign * (distToTopBottom * 0.35 + 15);
              }
            } else {
              // High-tension gathering around the widget's path boundaries (the oil-on-water effect!)
              const borderMargin = 40;
              if (absX < box.halfW + borderMargin && absY < box.halfH + borderMargin) {
                const factorX = (box.halfW + borderMargin - absX) / borderMargin;
                const factorY = (box.halfH + borderMargin - absY) / borderMargin;
                if (absX > box.halfW) {
                  tx += (dx >= 0 ? 1 : -1) * factorX * 25;
                }
                if (absY > box.halfH) {
                  ty += (dy >= 0 ? 1 : -1) * factorY * 25;
                }
              }
            }
          });
        }

        // Gravity attraction to Orbit Node if active and not orbiting self
        if (orbitNodeId && p.id !== orbitNodeId) {
          const orbitNode = particles.find(node => node.id === orbitNodeId);
          if (orbitNode) {
            const odx = orbitNode.x - p.x;
            const ody = orbitNode.y - p.y;
            const odist = Math.sqrt(odx * odx + ody * ody);
            if (odist < 240 && odist > 15) {
              const oforce = (240 - odist) / 240;
              const tangentAngle = Math.atan2(ody, odx) + Math.PI / 2;
              tx += (odx / odist) * oforce * 2.8 + Math.cos(tangentAngle) * oforce * 2.5;
              ty += (ody / odist) * oforce * 2.8 + Math.sin(tangentAngle) * oforce * 2.5;
            }
          }
        }

        // 3. SECURE INTERPOLATION EASE (Spring inertia coordinate tracking)
        p.x += (baseTx - p.x) * 0.06;
        p.y += (baseTy - p.y) * 0.06;

        if (p.renderX === undefined) p.renderX = p.x;
        if (p.renderY === undefined) p.renderY = p.y;

        p.renderX += (tx - p.renderX) * 0.08;
        p.renderY += (ty - p.renderY) * 0.08;

        // Update live physics statistics
        if (Math.random() > 0.88) {
          p.history.push(Math.sqrt(p.vx * p.vx + p.vy * p.vy) * 10);
          if (p.history.length > 15) p.history.shift();
        }

        // Detect hover near mouse
        const rx = p.renderX ?? p.x;
        const ry = p.renderY ?? p.y;

        if (mouse.active) {
          const mdx = mouse.x - rx;
          const mdy = mouse.y - ry;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          const hitRadius = Math.max(12, p.size * 3.5);
          if (mdist < hitRadius && (!closestParticle || mdist < closestDist)) {
            closestParticle = p;
            closestDist = mdist;
          }
        }

        // 4. NODAL CONSTELLATION MAPPING LINES
        if (activeFormation === "CONSTELLATION") {
          for (let j = idx + 1; j < particles.length; j += 4) { // Sample step to maximize performance
            const p2 = particles[j];
            const r2x = p2.renderX ?? p2.x;
            const r2y = p2.renderY ?? p2.y;
            const ldx = rx - r2x;
            const ldy = ry - r2y;
            const ldist = Math.sqrt(ldx * ldx + ldy * ldy);

            if (ldist < 75) {
              connectedCount++;
              const alpha = (1 - ldist / 75) * 0.095 * (isThinking ? 1.6 : 1);
              ctx.strokeStyle = isKidsMode
                ? `hsla(${p.hue}, 90%, 65%, ${alpha * 1.6})`
                : p.hue === 45 
                  ? `rgba(245, 158, 11, ${alpha * 1.5})` 
                  : `rgba(255, 255, 255, ${alpha})`;
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(rx, ry);
              ctx.lineTo(r2x, r2y);
              ctx.stroke();
            }
          }
        }

        // Exclude special indices from normal drawing so we can draw custom glowing widgets over them
        const isSelfSpecial = false;
        if (!isSelfSpecial) {
          let displaySize = p.size * (isThinking ? 1.25 : 1);
          let displayAlpha = p.alpha * (isThinking ? 1.4 : 1);

          // Boost brightness & scale standard particles if drawn into active gravitational node
          if (mouse.active && activeFormation !== "GRAVITY") {
            const mdx = mouse.x - rx;
            const mdy = mouse.y - ry;
            const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
            const pullRadius = mouse.radius + mouse.pullIntensity * 240;
            if (mdist < pullRadius && mdist > 0) {
              const pullFactor = (pullRadius - mdist) / pullRadius;
              displaySize *= (1.0 + pullFactor * mouse.pullIntensity * 0.9);
              displayAlpha = Math.min(1.0, displayAlpha + pullFactor * mouse.pullIntensity * 0.6);
            }
          }

          // Draw individual glowing mind sparks
          ctx.fillStyle = isKidsMode
            ? `hsla(${p.hue}, 90%, 65%, ${displayAlpha})`
            : p.hue === 45 
              ? `rgba(245, 158, 11, ${displayAlpha})` 
              : `rgba(255, 255, 255, ${displayAlpha})`;
          
          ctx.beginPath();
          ctx.arc(rx, ry, displaySize, 0, Math.PI * 2);
          ctx.fill();

          // Extra synaptic halo glow on excitation
          if ((isThinking || (mouse.isPulling && Math.random() > 0.6)) && Math.random() > 0.97) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
            ctx.beginPath();
            ctx.arc(rx, ry, displaySize * 3.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });

      // Highlight our 5 Sovereign Utility Particles with rotating concentric dash-orbits & titles
      const specialIndices = [
        { idx: 45, type: "BROWSER", color: "#38bdf8", label: "BROWSER" },
        { idx: 235, type: "FILES", color: "#10eb73", label: "FILES" },
        { idx: 100, type: "APPS", color: "#ea580c", label: "APPS" },
        { idx: 145, type: "MARKET", color: "#ec4899", label: "MARKET" },
        { idx: 185, type: "SETTINGS", color: "#eab308", label: "SETTINGS" }
      ];

      // Store current coordinate frame in window global space for holographic viewport launch animations
      if (!(window as any).__spatialAnchors) {
        (window as any).__spatialAnchors = {};
      }
      specialIndices.forEach((spec) => {
        const p = particles[spec.idx];
        if (p) {
          (window as any).__spatialAnchors[spec.type] = { x: p.renderX ?? p.x, y: p.renderY ?? p.y };
        }
      });

      // Manage pointer cursor and draw high-tech hover target rings
      if (closestParticle) {
        hoveredParticleRef.current = closestParticle;
        if (containerRef.current) {
          containerRef.current.style.cursor = "pointer";
        }
        
        ctx.strokeStyle = "rgba(16, 235, 115, 0.7)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        const cpx = closestParticle.renderX ?? closestParticle.x;
        const cpy = closestParticle.renderY ?? closestParticle.y;
        ctx.arc(cpx, cpy, closestParticle.size * 3.0 + Math.sin(Date.now() * 0.01) * 2, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        hoveredParticleRef.current = null;
        if (containerRef.current) {
          containerRef.current.style.cursor = "crosshair";
        }
      }

      // Draw focus lock-on indicator ring around Selected Node
      let activeSelectedObj: Particle | undefined = undefined;
      if (selectedParticleId) {
        const activeSel = particles.find(node => node.id === selectedParticleId);
        if (activeSel) {
          activeSelectedObj = activeSel;
          const asx = activeSel.renderX ?? activeSel.x;
          const asy = activeSel.renderY ?? activeSel.y;
          ctx.strokeStyle = "rgba(16, 235, 115, 0.9)";
          ctx.lineWidth = 1.25;
          ctx.beginPath();
          ctx.arc(asx, asy, activeSel.size * 3.8 + Math.sin(Date.now() * 0.025) * 2.5, 0, Math.PI * 2);
          ctx.stroke();

          // Dotted orbit lines
          ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
          ctx.lineWidth = 0.5;
          ctx.setLineDash([2, 5]);
          ctx.beginPath();
          ctx.arc(asx, asy, activeSel.size * 5.2, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // Draw Gravitational Perturbation Cursor Node
      if (mouse.active && mouse.pullIntensity > 0.01) {
        const pullRadius = mouse.radius + mouse.pullIntensity * 240;
        const pulse = Math.sin(Date.now() * 0.006) * 10;
        
        ctx.save();
        // 1. Draw outer gravitational pull radius limit boundary (faint amber warning circle, dashed)
        ctx.strokeStyle = `rgba(245, 158, 11, ${mouse.pullIntensity * 0.12})`;
        ctx.lineWidth = 0.85;
        ctx.setLineDash([6, 12]);
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, pullRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // 2. Draw swirling energy filaments wrapping into the center singularity
        const streamCount = 5 + Math.floor(mouse.pullIntensity * 4);
        for (let i = 0; i < streamCount; i++) {
          const rotationOffset = (Date.now() * 0.0035) + (i * ((Math.PI * 2) / streamCount));
          const spiralRad = 20 + mouse.pullIntensity * 85 + pulse;
          
          ctx.strokeStyle = `rgba(245, 158, 11, ${mouse.pullIntensity * 0.35})`;
          ctx.lineWidth = 1.25;
          ctx.beginPath();
          // Draw spiral arc going inwards towards mouse
          for (let th = 0; th <= Math.PI * 1.5; th += 0.1) {
            const curRad = spiralRad * (1 - th / (Math.PI * 1.5));
            const angle = rotationOffset + th;
            const sx = mouse.x + Math.cos(angle) * curRad;
            const sy = mouse.y + Math.sin(angle) * curRad;
            if (th === 0) {
              ctx.moveTo(sx, sy);
            } else {
              ctx.lineTo(sx, sy);
            }
          }
          ctx.stroke();
        }

        // 3. Draw a glowing dense "horizon" ring around the cursor core
        const coreRadius = 7 + mouse.pullIntensity * 16 + Math.sin(Date.now() * 0.01) * 3;
        const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 2, mouse.x, mouse.y, coreRadius * 2);
        gradient.addColorStop(0, `rgba(255, 160, 30, ${mouse.pullIntensity * 0.85})`);
        gradient.addColorStop(0.3, `rgba(245, 158, 11, ${mouse.pullIntensity * 0.6})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, coreRadius * 2, 0, Math.PI * 2);
        ctx.fill();

        // 4. Solid deep core singularity
        ctx.fillStyle = `rgba(18, 18, 24, ${0.94 * mouse.pullIntensity})`;
        ctx.strokeStyle = `rgba(245, 158, 11, ${mouse.pullIntensity})`;
        ctx.lineWidth = 1.55;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, coreRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 5. Draw digital readout HUD metrics next to cursor to make it fit with the high-tech looks
        ctx.fillStyle = `rgba(245, 158, 11, ${mouse.pullIntensity * 0.88})`;
        ctx.font = "bold 8px ui-monospace, Courier, monospace";
        ctx.textAlign = "left";
        ctx.fillText(`GRAV_PERTURBATION: ${(mouse.pullIntensity * 100).toFixed(0)}%`, mouse.x + coreRadius + 15, mouse.y - 7);
        
        ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
        ctx.font = "7px ui-monospace, Courier, monospace";
        ctx.fillText(`FIELD_PULL // CONCENTRATE_NODE`, mouse.x + coreRadius + 15, mouse.y + 3);
        ctx.fillText(`ENERGY_WAVE_INERTIA: ${(mouse.pullIntensity * 120).toFixed(1)} GeV`, mouse.x + coreRadius + 15, mouse.y + 12);
        ctx.restore();
      }

      // Dynamic real-time positioning of tracking specs HUD overlay
      const specPanel = document.getElementById("particle-spec-hud-panel");
      if (specPanel && selectedParticleId && activeSelectedObj) {
        const asx = activeSelectedObj.renderX ?? activeSelectedObj.x;
        const asy = activeSelectedObj.renderY ?? activeSelectedObj.y;
        let cardX = asx + 25;
        let cardY = asy - 65;
        if (cardX + 220 > width) {
          cardX = asx - 245;
        }
        if (cardY + 230 > height) {
          cardY = height - 250;
        }
        if (cardY < 12) {
          cardY = 12;
        }
        specPanel.style.left = `${cardX}px`;
        specPanel.style.top = `${cardY}px`;
        
        // Also update live text metrics in the DOM for peak fidelity!
        const liveCoords = document.getElementById("spec-live-coords");
        if (liveCoords) {
          liveCoords.innerText = `X: ${asx.toFixed(1)} / Y: ${asy.toFixed(1)}`;
        }
        const liveVel = document.getElementById("spec-live-vel");
        if (liveVel) {
          const speedVal = Math.sqrt(activeSelectedObj.vx * activeSelectedObj.vx + activeSelectedObj.vy * activeSelectedObj.vy) * 10;
          liveVel.innerText = `VECTOR: ${(activeSelectedObj.vx * 10).toFixed(2)}i + ${(activeSelectedObj.vy * 10).toFixed(2)}j [${speedVal.toFixed(1)} N]`;
        }
        const liveEnergy = document.getElementById("spec-live-energy");
        if (liveEnergy) {
          liveEnergy.innerText = `ENERGY CAP: ${activeSelectedObj.energyLevel.toFixed(0)}%`;
          const fillBar = document.getElementById("spec-live-energy-bar");
          if (fillBar) {
            fillBar.style.width = `${activeSelectedObj.energyLevel}%`;
          }
        }

        // Draw floating connector thread link on the canvas
        ctx.strokeStyle = activeSelectedObj.isSpecial ? "rgba(245, 158, 11, 0.35)" : "rgba(16, 235, 115, 0.45)";
        ctx.lineWidth = 0.8;
        ctx.setLineDash([2, 4]);
        ctx.beginPath();
        ctx.moveTo(asx, asy);
        ctx.lineTo(cardX + (cardX < asx ? 220 : 0), cardY + 20);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 6. PROCESS AND DRAW INTERACTION POINTS MEMORY TRAILS
      const interactionPoints = interactionPointsRef.current;
      if (interactionPoints.length > 0) {
        let hoveredMemoryId: string | null = null;
        if (mouse.active) {
          let closestMemDist = 26;
          for (const pt of interactionPoints) {
            const mdx = mouse.x - pt.x;
            const mdy = mouse.y - pt.y;
            const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
            if (mdist < closestMemDist) {
              hoveredMemoryId = pt.id;
              closestMemDist = mdist;
            }
          }
        }

        // Draw connections chronologically to form the "ghost path" representing previous inquiries
        if (interactionPoints.length > 1) {
          ctx.save();
          ctx.beginPath();
          ctx.strokeStyle = "rgba(245, 158, 11, 0.16)";
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 6]);

          for (let i = 0; i < interactionPoints.length; i++) {
            const pt = interactionPoints[i];
            if (i === 0) {
              ctx.moveTo(pt.x, pt.y);
            } else {
              const prevPt = interactionPoints[i - 1];
              const xc = (pt.x + prevPt.x) / 2;
              const yc = (pt.y + prevPt.y) / 2;
              ctx.quadraticCurveTo(prevPt.x, prevPt.y, xc, yc);
            }
          }
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();

          // Render traveling micro light signal pulse along the memory ghost path
          const totalSegments = interactionPoints.length - 1;
          const travelTime = (Date.now() * 0.00045) % totalSegments;
          const segmentIndex = Math.floor(travelTime);
          const u = travelTime - segmentIndex;
          const ptStart = interactionPoints[segmentIndex];
          const ptEnd = interactionPoints[segmentIndex + 1];
          if (ptStart && ptEnd) {
            const tx = ptStart.x + (ptEnd.x - ptStart.x) * u;
            const ty = ptStart.y + (ptEnd.y - ptStart.y) * u;
            
            ctx.fillStyle = "rgba(245, 158, 11, 0.85)";
            ctx.beginPath();
            ctx.arc(tx, ty, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "rgba(245, 158, 11, 0.25)";
            ctx.beginPath();
            ctx.arc(tx, ty, 8, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Draw individual memory nodes along the trail
        interactionPoints.forEach((pt) => {
          pt.intensity = Math.max(0.45, pt.intensity - 0.0007);
          const isNodeHovered = (hoveredMemoryId === pt.id);
          const breathe = Math.sin(Date.now() * 0.0025 + pt.timestamp) * 0.12;
          const displayIntensity = Math.min(1.0, pt.intensity * (0.85 + breathe) * (isNodeHovered ? 1.45 : 1.0));

          ctx.save();
          const haloRadius = 14 + (isNodeHovered ? 6 : 0);

          ctx.strokeStyle = `rgba(245, 158, 11, ${displayIntensity * 0.16})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, haloRadius, 0, Math.PI * 2);
          ctx.stroke();

          ctx.strokeStyle = `rgba(245, 158, 11, ${displayIntensity * 0.45})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(pt.x - 7, pt.y); ctx.lineTo(pt.x - 3, pt.y);
          ctx.moveTo(pt.x + 3, pt.y); ctx.lineTo(pt.x + 7, pt.y);
          ctx.moveTo(pt.x, pt.y - 7); ctx.lineTo(pt.x, pt.y - 3);
          ctx.moveTo(pt.x, pt.y + 3); ctx.lineTo(pt.x, pt.y + 7);
          ctx.stroke();

          ctx.fillStyle = `rgba(245, 158, 11, ${displayIntensity * 0.95})`;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, isNodeHovered ? 3.5 : 2, 0, Math.PI * 2);
          ctx.fill();

          if (isNodeHovered) {
            ctx.strokeStyle = "rgba(245, 158, 11, 0.45)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(pt.x, pt.y);
            ctx.lineTo(pt.x + 18, pt.y - 18);
            ctx.lineTo(pt.x + 120, pt.y - 18);
            ctx.stroke();

            ctx.fillStyle = "rgba(6, 6, 8, 0.96)";
            ctx.strokeStyle = "rgba(245, 158, 11, 0.65)";
            ctx.lineWidth = 1;
            ctx.fillRect(pt.x + 18, pt.y - 50, 210, 32);
            ctx.strokeRect(pt.x + 18, pt.y - 50, 210, 32);

            ctx.fillStyle = "#f59e0b";
            ctx.font = "bold 8px ui-monospace, Courier, monospace";
            ctx.textAlign = "left";
            ctx.fillText(`RECALL_TRACE // ${pt.type.toUpperCase()}`, pt.x + 24, pt.y - 41);

            ctx.fillStyle = "#ffffff";
            ctx.font = "italic 8px ui-sans-serif, system-ui, sans-serif";
            let textLabel = pt.label;
            if (textLabel.includes("QUANTUM_STIMULATION_TOUCH_INPUT")) {
              textLabel = "Stage Touch Coords Recalled";
            } else if (textLabel.length > 34) {
              textLabel = textLabel.substring(0, 31) + "...";
            }
            ctx.fillText(`"${textLabel}"`, pt.x + 24, pt.y - 31);

            ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
            ctx.font = "6.5px ui-monospace, Courier, monospace";
            ctx.fillText(`CLICK_TO_RE_ENGAGE // RETRIEVAL_READY`, pt.x + 24, pt.y - 21);
          } else {
            ctx.fillStyle = `rgba(255, 255, 255, ${displayIntensity * 0.35})`;
            ctx.font = "bold 6.5px ui-monospace, Courier, monospace";
            ctx.textAlign = "center";
            ctx.fillText(`[ MEM ]`, pt.x, pt.y - haloRadius - 3);
          }
          ctx.restore();

          if (activeFormation !== "GRAVITY") {
            particles.forEach((p) => {
              const dx = pt.x - p.x;
              const dy = pt.y - p.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 120 && dist > 1) {
                const pullPower = ((120 - dist) / 120) * displayIntensity * 0.12;
                p.x += (dx / dist) * pullPower * 2.8;
                p.y += (dy / dist) * pullPower * 2.8;
              }
            });
          }
        });
      }

      // Update HUD state telemetry signals
      setSynapseDensity(connectedCount);
      setEntropyRatio(0.05 + typingExcitement * 0.45 + (isThinking ? 0.35 : 0));

      animFrameId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      cancelAnimationFrame(animFrameId);
    };
  }, [activeFormation, isThinking, typingExcitement, activeProjection, activeWidgetType, isSpeaking]);

  // Handle click-and-hold pulling perturbation
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    // Do not initiate gravitational pull if clicking standard buttons or panels
    if (target.closest("#hud-overlay-controls, #particle-spec-hud-panel, button, select, option, input, a, form")) return;
    
    mouseRef.current.isPulling = true;
    
    // Play dynamic cosmic starting hum chord
    playPurityChord([146.83, 220, 293.66], "sine", 0.04, 0.82); // D minor triad introductory resonance
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mouseRef.current.isPulling) {
      mouseRef.current.isPulling = false;
      playPurityChord([587.33, 880, 1174.66], "sine", 0.02, 1.25);
      addInteractionPoint(
        mouseRef.current.x,
        mouseRef.current.y,
        "pull",
        "MATHEMATICAL_SINGULARITY_GRAVITY_PERTURBATION",
        "#f59e0b"
      );
    }
  };

  // Handle Full-Viewport Mouse Tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    mouseRef.current.x = e.clientX;
    mouseRef.current.y = e.clientY;
    mouseRef.current.active = true;
  };

  const handleMouseLeave = () => {
    mouseRef.current.active = false;
  };

  // Clicking anywhere on the field releases a sound spark & rearranges energy
  const handleStageClick = (e: React.MouseEvent) => {
    // Avoid triggering when clicking overlay control panels or specs visor
    const target = e.target as HTMLElement;
    if (target.closest("#hud-overlay-controls, #particle-spec-hud-panel, button, input, a, form")) return;

    // First check if click was near any of our 5 special sovereign app nodes!
    const canvas = canvasRef.current;
    if (canvas && onTriggerProjection) {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Check if clicked near an existing interaction memory point
      const interactionPoints = interactionPointsRef.current;
      let clickedMemoryNode: InteractionPoint | null = null;
      for (const pt of interactionPoints) {
        const dx = clickX - pt.x;
        const dy = clickY - pt.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 26) {
          clickedMemoryNode = pt;
          break;
        }
      }

      if (clickedMemoryNode) {
        // Recall sound (resonant major triad recall chord)
        playPurityChord([440, 554.37, 659.25, 880], "sine", 0.04, 1.45);
        clickedMemoryNode.intensity = 1.0;

        window.dispatchEvent(new CustomEvent("recall-inquiry-memory", {
          detail: { text: clickedMemoryNode.label, type: clickedMemoryNode.type }
        }));
        return; // Intercept general click dispersion wave and other selections
      }

      const specialIndices = [
        { idx: 45, type: "BROWSER", query: "" },
        { idx: 235, type: "FILES", query: "" },
        { idx: 100, type: "APPS", query: "" },
        { idx: 145, type: "MARKET", query: "" },
        { idx: 185, type: "SETTINGS", query: "" }
      ];

      const particles = particlesRef.current;
      for (const spec of specialIndices) {
        const p = particles[spec.idx];
        if (p) {
          const px = p.renderX ?? p.x;
          const py = p.renderY ?? p.y;
          const dx = clickX - px;
          const dy = clickY - py;
          const dist = Math.sqrt(dx * dx + dy * dy);
          // 40 pixel click active hot radius
          if (dist < 40) {
            playPurityChord([587.33, 783.99, 880], "sine", 0.035, 0.85); // High ascending resonance chord on spawn
            onTriggerProjection(spec.type, spec.query);
            return; // Intercept general dispersion wave on successful trigger!
          }
        }
      }

      // Check general particle hover hit (from our 60fps tick tracking)
      const clickedP = hoveredParticleRef.current;
      if (clickedP) {
        setSelectedParticleId(clickedP.id);
        playPurityChord([349.23, 440.00, 523.25], "sine", 0.02, 1.0);
        return;
      }
    }

    // Dismiss visor first if clicking empty dark layout
    setSelectedParticleId(null);

    const notes = [220, 261.63, 329.63, 392.00, 440]; // Beautiful Pentatonic A-Minor
    const randomNote = notes[Math.floor(Math.random() * notes.length)];
    
    playPurityChord([randomNote, randomNote * 2, randomNote * 1.5], "sine", 0.02, 1.4);

    // Expand local pressure waves
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    particlesRef.current.forEach((p) => {
      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 200 && d > 0) {
        p.x += (dx / d) * 45;
        p.y += (dy / d) * 45;
      }
    });

    // Add general touch click memory node to trace path
    addInteractionPoint(
      mouseX,
      mouseY,
      "click",
      "QUANTUM_STIMULATION_TOUCH_INPUT",
      "#10eb73"
    );
  };

  const handleAccelerate = () => {
    if (!selectedParticleId) return;
    const found = particlesRef.current.find(p => p.id === selectedParticleId);
    if (found) {
      found.vx *= 3.5;
      found.vy *= 3.5;
      found.speed *= 2.0;
      found.energyLevel = 100;
      playPurityChord([880, 1174.66, 1318.51], "sawtooth", 0.015, 0.4);
    }
  };

  const handleHarmonize = () => {
    if (!selectedParticleId) return;
    const found = particlesRef.current.find(p => p.id === selectedParticleId);
    if (found) {
      found.vx = (Math.random() - 0.5) * 0.15;
      found.vy = (Math.random() - 0.5) * 0.15;
      found.speed = 0.4;
      found.energyLevel = 50;
      playPurityChord([329.63, 392.00, 523.25, 659.25], "sine", 0.025, 1.2); // Golden major chord
    }
  };

  const handleTerminate = () => {
    if (!selectedParticleId) return;
    playPurityChord([220, 110], "triangle", 0.03, 0.4);
    particlesRef.current = particlesRef.current.filter(p => p.id !== selectedParticleId);
    setSelectedParticleId(null);
    if (orbitNodeId === selectedParticleId) setOrbitNodeId(null);
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full cursor-crosshair z-0 select-none overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={handleStageClick}
      id="consciousness-quantum-field"
    >
      <canvas
        ref={canvasRef}
        className="block"
      />

      {/* REAL-TIME SPATIAL PARTICLE SPECIFICATIONS VISOR */}
      {selectedParticleId && (() => {
        const activeSel = particlesRef.current.find(p => p.id === selectedParticleId);
        if (!activeSel) return null;

        return (
          <div
            id="particle-spec-hud-panel"
            className="fixed z-40 w-[220px] bg-[#060608]/92 border border-zinc-900 rounded-xl p-3.5 backdrop-blur-md shadow-[0_12px_30px_rgba(0,0,0,0.85)] text-zinc-350 font-mono text-[9px] pointer-events-auto"
            style={{
              transition: "opacity 0.2s",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5 mb-2">
              <div className="flex items-center space-x-1">
                <Target className="w-3 h-3 text-[#10eb73]" />
                <span className="font-bold text-[#10eb73] tracking-widest text-[8px] uppercase">
                  {activeSel.id}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedParticleId(null)}
                className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                title="Dismiss Node Visor"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* General Info */}
            <div className="space-y-1.5 mb-3.5 text-zinc-400">
              <div className="flex justify-between">
                <span className="text-zinc-400">DESIGNATION:</span>
                <span className="font-bold text-zinc-200">{activeSel.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">CHARGE_STATE:</span>
                <span>{activeSel.charge}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">QUANTUM_SPIN:</span>
                <span className="text-amber-500 font-bold">{activeSel.spin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">COORDINATES:</span>
                <span id="spec-live-coords" className="text-zinc-200">X: 0.0 / Y: 0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">VELOCITY_VEC:</span>
                <span id="spec-live-vel" className="text-zinc-200 text-[8.5px]">VECTOR: 0.00i + 0.00j</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[8.5px]">
                  <span className="text-zinc-400">ENERGY_INDEX:</span>
                  <span id="spec-live-energy" className="text-cyan-400 font-bold">ENERGY CAP: 0%</span>
                </div>
                <div className="w-full h-1 bg-zinc-950 rounded-full overflow-hidden border border-zinc-900/60">
                  <div
                    id="spec-live-energy-bar"
                    className="h-full bg-cyan-400/90 transition-all duration-300"
                    style={{ width: "0%" }}
                  />
                </div>
              </div>
            </div>

            {/* Panel Quick Actions */}
            <div className="border-t border-zinc-900/80 pt-2.5 space-y-1.5">
              <span className="text-[7px] text-zinc-400 uppercase tracking-widest block font-bold mb-1">VISOR COMMANDS</span>
              
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={handleAccelerate}
                  className="py-1 px-1.5 rounded bg-zinc-950 hover:bg-zinc-900 border border-zinc-900/80 hover:border-zinc-800 text-zinc-400 hover:text-white font-mono text-[7.5px] uppercase tracking-wider text-center cursor-pointer transition-all duration-200"
                >
                  Accelerate
                </button>
                <button
                  type="button"
                  onClick={handleHarmonize}
                  className="py-1 px-1.5 rounded bg-zinc-950 hover:bg-zinc-900 border border-zinc-900/80 hover:border-zinc-800 text-zinc-400 hover:text-white font-mono text-[7.5px] uppercase tracking-wider text-center cursor-pointer transition-all duration-200"
                >
                  Harmonize
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (orbitNodeId === activeSel.id) {
                    setOrbitNodeId(null);
                    playPurityChord([392.00, 311.13, 261.63], "sine", 0.02, 1.0);
                  } else {
                    setOrbitNodeId(activeSel.id);
                    playPurityChord([261.63, 311.13, 392.00], "sine", 0.025, 1.2);
                  }
                }}
                className={`w-full py-1 rounded border font-mono text-[7.5px] uppercase tracking-wider text-center cursor-pointer transition-all duration-200 ${
                  orbitNodeId === activeSel.id 
                    ? "bg-amber-955/20 border-amber-500/40 text-amber-500 font-bold" 
                    : "bg-zinc-950 hover:bg-zinc-900 border-zinc-900/80 hover:border-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                {orbitNodeId === activeSel.id ? "Disable Gravity Orbit" : "Inject Gravity Orbit"}
              </button>

              <button
                type="button"
                onClick={handleTerminate}
                className="w-full py-1 text-center font-mono text-[7.5px] uppercase tracking-wider bg-red-955/25 hover:bg-red-950/45 border border-red-950/50 hover:border-red-900/40 text-red-400/90 hover:text-red-400 rounded cursor-pointer transition-all duration-220 flex items-center justify-center space-x-1"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse mr-1" />
                <span>Disperse Mind Spark</span>
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
