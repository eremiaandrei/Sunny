import React, { useRef, useState, useEffect } from "react";
import { 
  Trash2, 
  Undo2, 
  Redo2, 
  Download, 
  Sparkles, 
  Rocket, 
  Paintbrush, 
  Eraser, 
  Smile, 
  Image as ImageIcon,
  Star 
} from "lucide-react";

interface NebulaPaintBoardProps {
  playSfx: (freq: number, type?: OscillatorType, vol?: number, duration?: number) => void;
  isKidsMode?: boolean;
}

type BrushMode = "solid" | "glow" | "stardust" | "chameleon" | "eraser";

export default function NebulaPaintBoard({ playSfx, isKidsMode = true }: NebulaPaintBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Drawing settings state
  const [brushColor, setBrushColor] = useState("#ff3366"); // Neon pink
  const [brushSize, setBrushSize] = useState(8);
  const [brushMode, setBrushMode] = useState<BrushMode>("glow");
  const [selectedStencil, setSelectedStencil] = useState<string>("blank");

  // Interaction variables
  const isDrawing = useRef(false);
  const lastX = useRef(0);
  const lastY = useRef(0);
  const rainbowHue = useRef(0);
  const soundGate = useRef(0); // For throttling synth sounds

  // Undo / Redo history stacks
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  const colors = [
    { code: "#ff3366", name: "Rose Pulsar" },
    { code: "#ffaa00", name: "Gold Star" },
    { code: "#10eb73", name: "Solar Lime" },
    { code: "#00f0ff", name: "Hyper Cyan" },
    { code: "#bc3fff", name: "Violet Portal" },
    { code: "#ffffff", name: "Nova White" }
  ];

  const stencils = [
    { id: "blank", name: "Blank Cosmos", icon: "🌌" },
    { id: "rocket", name: "Voyager Rocket", icon: "🚀" },
    { id: "ufo", name: "Happy UFO", icon: "🛸" },
    { id: "saturn", name: "Saturn's Orbit", icon: "🪐" }
  ];

  // Set up canvas sizing
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas || !containerRef.current) return;

      // Get container size
      const rect = containerRef.current.getBoundingClientRect();
      const width = rect.width || 380;
      const height = Math.min(rect.height || 260, 320);

      // Save current content to preserve drawing on resize
      const tempImage = canvas.toDataURL();

      // Update resolution
      canvas.width = width * 2; // high DPI scale
      canvas.height = height * 2;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(2, 2);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // Restore image
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, width, height);
        };
        img.src = tempImage;
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle stencil loading
  useEffect(() => {
    drawStencilOnCanvas();
  }, [selectedStencil]);

  // Helper to draw stencil outlines onto canvas
  const drawStencilOnCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width / 2;
    const h = canvas.height / 2;

    // Clear and draw background space gradient
    ctx.clearRect(0, 0, w, h);
    
    // Smooth deep space background
    const bgGradient = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w);
    bgGradient.addColorStop(0, "#06060c");
    bgGradient.addColorStop(1, "#020204");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, w, h);

    // Subtle space grid/stars overlay
    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    for (let i = 0; i < 25; i++) {
      const sx = (Math.sin(i * 123.45) * 0.5 + 0.5) * w;
      const sy = (Math.cos(i * 543.21) * 0.5 + 0.5) * h;
      ctx.fillRect(sx, sy, 1.2, 1.2);
    }

    if (selectedStencil === "blank") return;

    // Set stencil drawing parameters
    ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]); // Dashed guide lines

    if (selectedStencil === "rocket") {
      // Draw Voyager Rocket
      ctx.beginPath();
      // Rocket Body cone
      ctx.moveTo(w / 2, h / 2 - 45);
      ctx.quadraticCurveTo(w / 2 + 18, h / 2 - 10, w / 2 + 18, h / 2 + 25);
      ctx.lineTo(w / 2 - 18, h / 2 + 25);
      ctx.quadraticCurveTo(w / 2 - 18, h / 2 - 10, w / 2, h / 2 - 45);
      
      // Fins
      ctx.moveTo(w / 2 - 18, h / 2 + 10);
      ctx.lineTo(w / 2 - 35, h / 2 + 30);
      ctx.lineTo(w / 2 - 18, h / 2 + 25);

      ctx.moveTo(w / 2 + 18, h / 2 + 10);
      ctx.lineTo(w / 2 + 35, h / 2 + 30);
      ctx.lineTo(w / 2 + 18, h / 2 + 25);

      // Window
      ctx.moveTo(w / 2 + 8, h / 2 - 5);
      ctx.arc(w / 2, h / 2 - 5, 8, 0, Math.PI * 2);

      // Thruster flame guide
      ctx.moveTo(w / 2 - 10, h / 2 + 25);
      ctx.quadraticCurveTo(w / 2, h / 2 + 45, w / 2 + 10, h / 2 + 25);

      ctx.stroke();
    } else if (selectedStencil === "ufo") {
      // Draw UFO Spacecraft
      ctx.beginPath();
      // Dome
      ctx.arc(w / 2, h / 2 - 5, 22, Math.PI, 0);
      ctx.lineTo(w / 2 + 22, h / 2 - 5);

      // Saucer rim
      ctx.moveTo(w / 2 - 50, h / 2 + 2);
      ctx.quadraticCurveTo(w / 2, h / 2 - 15, w / 2 + 50, h / 2 + 2);
      ctx.quadraticCurveTo(w / 2, h / 2 + 18, w / 2 - 50, h / 2 + 2);

      // Little alien outline
      ctx.moveTo(w / 2 - 6, h / 2 - 10);
      ctx.arc(w / 2, h / 2 - 12, 5, 0, Math.PI * 2); // head
      ctx.moveTo(w / 2 - 3, h / 2 - 16); // left eye
      ctx.fillRect(w / 2 - 3.5, h / 2 - 16.5, 1, 1);
      ctx.fillRect(w / 2 + 1.5, h / 2 - 16.5, 1, 1);

      // Lights on saucer
      ctx.moveTo(w / 2 - 30, h / 2 + 2); ctx.arc(w / 2 - 30, h / 2 + 2, 2.5, 0, Math.PI * 2);
      ctx.moveTo(w / 2 - 10, h / 2 + 4); ctx.arc(w / 2 - 10, h / 2 + 4, 2.5, 0, Math.PI * 2);
      ctx.moveTo(w / 2 + 10, h / 2 + 4); ctx.arc(w / 2 + 10, h / 2 + 4, 2.5, 0, Math.PI * 2);
      ctx.moveTo(w / 2 + 30, h / 2 + 2); ctx.arc(w / 2 + 30, h / 2 + 2, 2.5, 0, Math.PI * 2);

      ctx.stroke();
    } else if (selectedStencil === "saturn") {
      // Draw Saturn Rings
      ctx.beginPath();
      // Giant Planet Sphere
      ctx.arc(w / 2, h / 2, 28, 0, Math.PI * 2);

      // Rings (outer oval)
      ctx.moveTo(w / 2 - 65, h / 2);
      ctx.ellipse(w / 2, h / 2 + 2, 65, 14, Math.PI / 10, 0, Math.PI * 2);

      // Ring partition
      ctx.moveTo(w / 2 - 52, h / 2 - 1);
      ctx.ellipse(w / 2, h / 2 + 2, 50, 10, Math.PI / 10, 0, Math.PI * 2);

      ctx.stroke();
    }

    // Restore standard line dash
    ctx.setLineDash([]);
  };

  // Capture canvas state for Undo
  const saveStateToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL();
    setUndoStack(prev => [...prev.slice(-19), url]); // Limit to last 20 operations
    setRedoStack([]); // Clear redo on new stroke
  };

  // Undo last stroke
  const handleUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas || undoStack.length === 0) return;

    playSfx(523.25, "sine", 0.015, 0.15); // Click sound

    const prevUrl = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));

    // Save current as redo
    setRedoStack(prev => [...prev, canvas.toDataURL()]);

    const ctx = canvas.getContext("2d");
    if (ctx) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width / 2, canvas.height / 2);
        ctx.drawImage(img, 0, 0, canvas.width / 2, canvas.height / 2);
      };
      img.src = prevUrl;
    }
  };

  // Redo undone stroke
  const handleRedo = () => {
    const canvas = canvasRef.current;
    if (!canvas || redoStack.length === 0) return;

    playSfx(587.33, "sine", 0.015, 0.15);

    const nextUrl = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));

    // Save current as undo
    setUndoStack(prev => [...prev, canvas.toDataURL()]);

    const ctx = canvas.getContext("2d");
    if (ctx) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width / 2, canvas.height / 2);
        ctx.drawImage(img, 0, 0, canvas.width / 2, canvas.height / 2);
      };
      img.src = nextUrl;
    }
  };

  // Get drawing coordinates relative to canvas bounding rect
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    saveStateToHistory();

    isDrawing.current = true;
    lastX.current = x;
    lastY.current = y;

    // Trigger starting chime
    playSfx(220 + y * 1.5, "sine", 0.01, 0.2);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const { x, y } = getCoordinates(e);

    // Apply drawing settings based on modes
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Dynamic HSL spectrum cycle for Chameleon mode
    if (brushMode === "chameleon") {
      rainbowHue.current = (rainbowHue.current + 4) % 360;
      ctx.strokeStyle = `hsl(${rainbowHue.current}, 100%, 65%)`;
      ctx.shadowColor = `hsl(${rainbowHue.current}, 100%, 65%)`;
    } else if (brushMode === "eraser") {
      ctx.strokeStyle = "#050508"; // Paint background-like color to erase
      ctx.shadowBlur = 0;
    } else {
      ctx.strokeStyle = brushColor;
      ctx.shadowColor = brushColor;
    }

    // Shadow configuration for Glowing Neon Brush
    if (brushMode === "glow" || brushMode === "chameleon") {
      ctx.shadowBlur = brushSize * 1.8;
    } else {
      ctx.shadowBlur = 0;
    }

    // Execute drawing line
    ctx.beginPath();
    ctx.moveTo(lastX.current, lastY.current);
    ctx.lineTo(x, y);
    ctx.stroke();

    // Additional Stardust overlay effect
    if (brushMode === "stardust") {
      ctx.fillStyle = brushColor;
      ctx.shadowBlur = 10;
      ctx.shadowColor = brushColor;
      
      // Draw randomized little starbursts/dots
      if (Math.random() > 0.4) {
        ctx.beginPath();
        const starX = x + (Math.random() - 0.5) * 25;
        const starY = y + (Math.random() - 0.5) * 25;
        ctx.arc(starX, starY, Math.random() * 2.2 + 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Theremin tone synthesis with throttled trigger rate
    const now = Date.now();
    if (now - soundGate.current > 70) {
      soundGate.current = now;
      // Synthesize elegant tone where pitch follows cursor height (Y) and volume follows velocity
      const freq = 300 + ( (canvas.height / 2 - y) * 1.8 );
      const dynamicVol = isKidsMode ? 0.008 : 0.015;
      playSfx(Math.max(150, Math.min(freq, 1200)), "sine", dynamicVol, 0.15);
    }

    lastX.current = x;
    lastY.current = y;
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  // Save creation to PC/Device
  const exportArtwork = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    playSfx(880, "sine", 0.02, 0.4); // Success chime

    // Convert high DPI double resolution canvas back to standard size for nice sharp file saving
    const link = document.createElement("a");
    link.download = `Cosmic_Nebula_Art_${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // Quick preset sizes
  const sizes = [
    { label: "Tiny Spark", size: 3 },
    { label: "Laser Pen", size: 7 },
    { label: "Plasma Beam", size: 14 },
    { label: "Cosmic Cloud", size: 25 }
  ];

  return (
    <div className="w-full h-full flex flex-col space-y-3 font-sans max-w-lg mx-auto">
      
      {/* Outline / Stencil selector */}
      <div className="flex items-center justify-between bg-zinc-950/60 p-1.5 px-2.5 rounded-xl border border-zinc-900/60 text-[9px] select-none">
        <span className="text-zinc-400 font-mono flex items-center space-x-1 uppercase font-bold text-[7.5px]">
          <ImageIcon className="w-3 h-3 text-cyan-400" />
          <span>Coloring Book Outlines:</span>
        </span>
        <div className="flex items-center space-x-1">
          {stencils.map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => {
                playSfx(660, "sine", 0.012, 0.1);
                setSelectedStencil(st.id);
              }}
              className={`px-1.5 py-0.5 rounded transition-all cursor-pointer text-[8px] font-bold ${
                selectedStencil === st.id 
                  ? "bg-cyan-550/20 text-cyan-400 border border-cyan-500/40" 
                  : "bg-zinc-900/80 text-zinc-400 border border-transparent hover:text-zinc-200"
              }`}
            >
              <span className="mr-0.5">{st.icon}</span>
              {st.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Drawing Canvas Container */}
      <div 
        ref={containerRef}
        className="relative bg-zinc-950 border border-zinc-900/90 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center group"
        style={{ height: "185px" }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="cursor-crosshair block bg-[#040408]"
          id="nebula-interactive-canvas"
        />

        {/* Ambient watermark guide */}
        <div className="absolute bottom-2 right-3 pointer-events-none text-[6.5px] font-mono text-zinc-650 tracking-widest uppercase select-none opacity-40 group-hover:opacity-75 transition-opacity flex items-center space-x-1">
          <Sparkles className="w-2.5 h-2.5 text-pink-400 animate-pulse" />
          <span>Cosmic Audio Pad Active</span>
        </div>
      </div>

      {/* Canvas Toolbars & Configuration */}
      <div className="space-y-2.5 bg-zinc-950/80 p-3 rounded-2xl border border-zinc-900/70">
        
        {/* Brush Mode and Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-900/60 pb-2 select-none">
          <div className="flex items-center space-x-1">
            <span className="text-[7px] text-zinc-500 font-mono uppercase font-bold mr-1">Brush Engine:</span>
            
            <button
              type="button"
              onClick={() => { playSfx(440, "sine", 0.015, 0.1); setBrushMode("glow"); }}
              className={`p-1 px-2 rounded-lg flex items-center space-x-1 cursor-pointer font-bold text-[8px] transition-all ${
                brushMode === "glow" 
                  ? "bg-purple-950/40 text-purple-400 border border-purple-500/30" 
                  : "bg-zinc-900/70 text-zinc-400 border border-transparent hover:text-zinc-200"
              }`}
              title="Glowing laser stroke"
            >
              <Sparkles className="w-2.5 h-2.5 text-purple-400" />
              <span>Neon Glow</span>
            </button>

            <button
              type="button"
              onClick={() => { playSfx(480, "sine", 0.015, 0.1); setBrushMode("stardust"); }}
              className={`p-1 px-2 rounded-lg flex items-center space-x-1 cursor-pointer font-bold text-[8px] transition-all ${
                brushMode === "stardust" 
                  ? "bg-amber-950/40 text-amber-400 border border-amber-500/30" 
                  : "bg-zinc-900/70 text-zinc-400 border border-transparent hover:text-zinc-200"
              }`}
              title="Scatters small stars"
            >
              <Star className="w-2.5 h-2.5 text-amber-400" />
              <span>Stardust</span>
            </button>

            <button
              type="button"
              onClick={() => { playSfx(520, "sine", 0.015, 0.1); setBrushMode("chameleon"); }}
              className={`p-1 px-2 rounded-lg flex items-center space-x-1 cursor-pointer font-bold text-[8px] transition-all ${
                brushMode === "chameleon" 
                  ? "bg-pink-950/40 text-pink-400 border border-pink-500/30" 
                  : "bg-zinc-900/70 text-zinc-400 border border-transparent hover:text-zinc-200"
              }`}
              title="Cycles colors automatically"
            >
              <Paintbrush className="w-2.5 h-2.5 text-pink-400" />
              <span>Rainbow</span>
            </button>

            <button
              type="button"
              onClick={() => { playSfx(400, "sine", 0.015, 0.1); setBrushMode("eraser"); }}
              className={`p-1 px-2 rounded-lg flex items-center space-x-1 cursor-pointer font-bold text-[8px] transition-all ${
                brushMode === "eraser" 
                  ? "bg-zinc-800 text-zinc-200 border border-zinc-700" 
                  : "bg-zinc-900/70 text-zinc-400 border border-transparent hover:text-zinc-200"
              }`}
              title="Cosmic laser eraser"
            >
              <Eraser className="w-2.5 h-2.5" />
              <span>Eraser</span>
            </button>
          </div>

          <div className="flex items-center space-x-1 ml-auto">
            <button
              type="button"
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              className={`p-1 rounded-lg border cursor-pointer transition-all ${
                undoStack.length > 0 
                  ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white" 
                  : "bg-zinc-950 border-zinc-950 text-zinc-600 opacity-40 cursor-not-allowed"
              }`}
              title="Undo stroke"
            >
              <Undo2 className="w-3 h-3" />
            </button>

            <button
              type="button"
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className={`p-1 rounded-lg border cursor-pointer transition-all ${
                redoStack.length > 0 
                  ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white" 
                  : "bg-zinc-950 border-zinc-950 text-zinc-600 opacity-40 cursor-not-allowed"
              }`}
              title="Redo stroke"
            >
              <Redo2 className="w-3 h-3" />
            </button>

            <button
              type="button"
              onClick={() => {
                playSfx(330, "sawtooth", 0.015, 0.25);
                drawStencilOnCanvas();
                setUndoStack([]);
                setRedoStack([]);
              }}
              className="p-1 px-2 rounded-lg bg-red-950/30 hover:bg-red-950/55 text-rose-400 border border-rose-900/40 text-[8px] font-bold cursor-pointer transition-all flex items-center space-x-0.5"
              title="Reset all paths"
            >
              <Trash2 className="w-2.5 h-2.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Brush Size Slider */}
        <div className="flex items-center justify-between border-b border-zinc-900/50 pb-2.5 select-none">
          <div className="flex items-center space-x-1 text-[7.5px] text-zinc-500 font-mono font-bold uppercase">
            <span>Beam Diameter:</span>
            <span className="text-zinc-300 ml-1">{brushSize}px</span>
          </div>
          <div className="flex items-center space-x-1.5">
            {sizes.map((s) => (
              <button
                key={s.size}
                type="button"
                onClick={() => {
                  playSfx(580 + s.size * 10, "sine", 0.012, 0.08);
                  setBrushSize(s.size);
                }}
                className={`px-2 py-0.5 rounded-lg text-[7px] font-bold cursor-pointer transition-all border ${
                  brushSize === s.size 
                    ? "bg-zinc-200 text-zinc-950 border-white font-extrabold" 
                    : "bg-zinc-900/60 text-zinc-400 border-transparent hover:text-zinc-200"
                }`}
              >
                {s.size}px
              </button>
            ))}
          </div>
        </div>

        {/* Color Palette & Saving */}
        <div className="flex items-center justify-between gap-3">
          {brushMode !== "eraser" ? (
            <div className="flex items-center space-x-2 select-none">
              <span className="text-[7.5px] text-zinc-500 font-mono font-bold uppercase">Color:</span>
              <div className="flex items-center space-x-1.5">
                {colors.map((clr) => (
                  <button
                    key={clr.code}
                    type="button"
                    onClick={() => {
                      playSfx(784, "sine", 0.015, 0.12);
                      setBrushColor(clr.code);
                    }}
                    className={`w-4 h-4 rounded-full cursor-pointer hover:scale-125 active:scale-90 transition-all border ${
                      brushColor === clr.code 
                        ? "border-white border-2 scale-110 shadow-[0_0_10px_rgba(255,255,255,0.4)]" 
                        : "border-zinc-950/80"
                    }`}
                    style={{ backgroundColor: clr.code }}
                    title={clr.name}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-[7.5px] text-zinc-500 font-mono font-bold uppercase select-none flex items-center space-x-1">
              <span>🧹 Laser Eraser Activated</span>
            </div>
          )}

          <button
            type="button"
            onClick={exportArtwork}
            className="ml-auto bg-cyan-600 hover:bg-cyan-500 text-white font-bold p-1 px-3 rounded-xl text-[8.5px] flex items-center space-x-1 cursor-pointer transition-all border border-cyan-500/40 shadow-[0_2px_10px_rgba(6,182,212,0.15)] active:scale-95"
            title="Download PNG to device"
          >
            <Download className="w-3 h-3" />
            <span>Save Artwork</span>
          </button>
        </div>

      </div>

    </div>
  );
}
