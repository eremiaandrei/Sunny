import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, animate } from "motion/react";
import { 
  CloudSun, 
  Camera, 
  Map, 
  Mic,
  TrendingUp, 
  X, 
  Plus, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowRight,
  Navigation,
  DollarSign,  
  RefreshCw, 
  Maximize2, 
  Minimize2, 
  Minus, 
  Globe, 
  Search, 
  Compass,
  FileSpreadsheet,
  Sun,
  CloudRain,
  CloudSnow,
  Wind,
  Droplets,
  Eye,
  Settings,
  Coins,
  Briefcase,
  Newspaper,
  Archive,
  Sparkles,
  Smile,
  Trophy,
  Gift,
  Award,
  Heart,
  Satellite,
  Mountain
} from "lucide-react";

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  type: "spend" | "income";
  timestamp: string;
}

export const STOCKS_DATA = [
  { id: "AAPL", name: "Apple Inc.", symbol: "AAPL", price: 214.35, change: 1.24, desc: "Consumer electronics, iPhone manufacturing, and spatial computing.", history: [208, 211, 210, 212, 211, 213, 214.35] },
  { id: "NVDA", name: "Nvidia Corp.", symbol: "NVDA", price: 127.40, change: 4.82, desc: "High-performance GPUs, AI supercomputing & tensor cores.", history: [118, 120, 122, 121, 125, 124, 127.4] },
  { id: "TSLA", name: "Tesla Inc.", symbol: "TSLA", price: 184.60, change: -2.15, desc: "Electric vehicles, autonomy neural network, and energy storage.", history: [192, 190, 188, 189, 185, 186, 184.6] },
  { id: "GOOGL", name: "Alphabet Inc.", symbol: "GOOGL", price: 176.90, change: 0.75, desc: "Global search engine, DeepMind machine learning, and cloud networks.", history: [172, 173, 175, 174, 176, 175, 176.9] },
  { id: "MSFT", name: "Microsoft Corp.", symbol: "MSFT", price: 418.50, change: 0.32, desc: "Copilot AI, operating systems, cloud Azure stack, and gaming.", history: [412, 415, 414, 417, 416, 419, 418.5] }
];

export const CRYPTO_DATA = [
  { id: "BTC", name: "Bitcoin", symbol: "BTC", price: 66240.00, change: 3.65, desc: "Pioneer decentralized digital assets ledger, secure orange network.", history: [63500, 64200, 63900, 64800, 65100, 65800, 66240] },
  { id: "ETH", name: "Ethereum", symbol: "ETH", price: 3485.50, change: 2.10, desc: "Decentralized state machine, smart contracts network, and PoS consensus.", history: [3350, 3390, 3420, 3380, 3440, 3460, 3485.5] },
  { id: "SOL", name: "Solana", symbol: "SOL", price: 148.20, change: 7.80, desc: "Ultra-high throughput parallel blockchain, proof-of-history.", history: [132, 137, 135, 141, 140, 144, 148.2] },
  { id: "BNB", name: "BNB", symbol: "BNB", price: 582.40, change: 0.95, desc: "Native utility token of global exchange ecosystem and BSC smart chain.", history: [574, 578, 576, 581, 579, 583, 582.4] },
  { id: "XRP", name: "Ripple", symbol: "XRP", price: 0.495, change: -1.12, desc: "Interbank settlement protocol and fast messaging liquidity asset.", history: [0.51, 0.505, 0.498, 0.502, 0.494, 0.497, 0.495] }
];

export const INTEL_NEWS_DATA = [
  { id: "news_1", title: "FEDERAL RESERVE SIGNAL STABILITY AFTER INTEREST DEBATE", source: "Reuters Quantum", time: "12m ago", summary: "Chairman notes continuous micro-economic tracking shows general stability as core rates hold steady. Digital asset indices respond with solid high-volume rebound." },
  { id: "news_2", title: "NVIDIA DEBUTS BLACKWELL SUPERCONVERTER SHIPPED TO AI CLOUDS", source: "Bloomberg Intel", time: "34m ago", summary: "First batches of next-gen B200 Tensor Core GPUs are confirmed delivered. Shares surge +4.8% as production capacity secures high scalability expectations." },
  { id: "news_3", title: "BITCOIN QUANTUM-RESISTANT PROTOCOL MERGES INTO TESTNET PHASE", source: "Cyber Security Journal", time: "1h ago", summary: "Core dev nodes are testing quantum-secure signature mechanics. Technical miners note high approval levels for SHA-256 upgrade options." },
  { id: "news_4", title: "SECURE MULTI-PARTY COMPUTATION ACCELERATES ON FINTECH SECTOR", source: "Wall Street Intel", time: "3h ago", summary: "Decentralized ledger integration across top global investment offices shows a massive reduction in clearing latency down to sub-millisecond ranges." },
  { id: "news_5", title: "EURO ZONE RETAIL DEBITS FALL 0.4% AS COGNITIVE ECONOMY SHIFTS ONLINE", source: "Financial Times", time: "5h ago", summary: "Retail physical sales observe small retreat. Meanwhile, software-driven and digital micro-credit subscription systems hit record high adoption levels." }
];

interface ActiveWidgetsProps {
  isKidsMode?: boolean;
  isWidgetsMenuOpen: boolean;
  setIsWidgetsMenuOpen: (val: boolean) => void;
  activeWidgetType: "WEATHER" | "CAMERA" | "MAPS" | "FINANCIAL" | null;
  setActiveWidgetType: (type: "WEATHER" | "CAMERA" | "MAPS" | "FINANCIAL" | null) => void;
  transactions: Transaction[];
  onAddTransaction: (amount: number, description: string, category: string, type: "spend" | "income") => void;
  onClearTransactions: () => void;
  weatherLocation: string;
  setWeatherLocation: (val: string) => void;
  mapAddress: string;
  setMapAddress: (val: string) => void;
  activeTheme?: string;
  financialSubTab?: "LEDGER" | "STOCKS" | "CRYPTO" | "INTEL";
  setFinancialSubTab?: (tab: "LEDGER" | "STOCKS" | "CRYPTO" | "INTEL") => void;
  selectedAssetId?: string;
  setSelectedAssetId?: (id: string) => void;
  isMemoryPanelOpen: boolean;
  setIsMemoryPanelOpen: (val: boolean) => void;
  sessionsCount: number;
  lastActivated?: "PROJECTION" | "WIDGET";
  onFocusWidget?: () => void;
  onMinimizeWidget?: (type: "WEATHER" | "CAMERA" | "MAPS" | "FINANCIAL") => void;
  onCloseWidget?: (type: "WEATHER" | "CAMERA" | "MAPS" | "FINANCIAL") => void;
}

export default function ActiveWidgets({
  isKidsMode = false,
  isWidgetsMenuOpen,
  setIsWidgetsMenuOpen,
  activeWidgetType,
  setActiveWidgetType,
  transactions,
  onAddTransaction,
  onClearTransactions,
  weatherLocation,
  setWeatherLocation,
  mapAddress,
  setMapAddress,
  activeTheme = "AMBER",
  financialSubTab: externalFinancialSubTab = "LEDGER",
  setFinancialSubTab: externalSetFinancialSubTab,
  selectedAssetId: externalSelectedAssetId = "BTC",
  setSelectedAssetId: externalSetSelectedAssetId,
  isMemoryPanelOpen,
  setIsMemoryPanelOpen,
  sessionsCount,
  lastActivated = "WIDGET",
  onFocusWidget,
  onMinimizeWidget,
  onCloseWidget,
}: ActiveWidgetsProps) {

  const [isFullscreen, setIsFullscreen] = useState(false);
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  // Sync effect to reset any drag transformation offsets completely when entering fullscreen mode
  useEffect(() => {
    if (isFullscreen) {
      animate(dragX, 0, { type: "spring", damping: 30, stiffness: 200 });
      animate(dragY, 0, { type: "spring", damping: 30, stiffness: 200 });
    }
  }, [isFullscreen, dragX, dragY]);

  // Reset full screen and offset vectors whenever the selected active widget transitions or is closed
  useEffect(() => {
    setIsFullscreen(false);
    dragX.set(0);
    dragY.set(0);
  }, [activeWidgetType]);

  const [isMobile, setIsMobile] = useState(false);

  const [localFinancialTab, setLocalFinancialTab] = useState<"LEDGER" | "STOCKS" | "CRYPTO" | "INTEL">("LEDGER");
  const [localSelectedAssetId, setLocalSelectedAssetId] = useState<string>("BTC");

  const currentFinancialTab = externalSetFinancialSubTab ? externalFinancialSubTab : localFinancialTab;
  const setCurrentFinancialTab = externalSetFinancialSubTab || setLocalFinancialTab;

  const currentAssetId = externalSetSelectedAssetId ? externalSelectedAssetId : localSelectedAssetId;
  const setCurrentAssetId = externalSetSelectedAssetId || setLocalSelectedAssetId;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  
  // Kids Mode state variables
  const [selectedKidFilter, setSelectedKidFilter] = useState<"NONE" | "SPARKLES" | "CROWN" | "CAT" | "GLASSES">("NONE");
  const [isTreasureMode, setIsTreasureMode] = useState(false);
  const [chestOpenedCount, setChestOpenedCount] = useState(0);
  const [lastScanMessage, setLastScanMessage] = useState("");
  const [earnedBadges, setEarnedBadges] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem("kids_earned_badges_v1");
      return raw ? JSON.parse(raw) : ["MATH"]; // starts with one fun badge to play with
    } catch {
      return ["MATH"];
    }
  });

  const saveBadges = (list: string[]) => {
    setEarnedBadges(list);
    localStorage.setItem("kids_earned_badges_v1", JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("kids-badges-updated", { detail: list }));
  };

  useEffect(() => {
    const handleBadgeSync = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && Array.isArray(detail)) {
        setEarnedBadges(detail);
      }
    };
    window.addEventListener("kids-badges-updated", handleBadgeSync);
    return () => window.removeEventListener("kids-badges-updated", handleBadgeSync);
  }, []);

  const playSfx = (freq: number, type: OscillatorType = "sine", vol = 0.02, duration = 0.5) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio context disabled
    }
  };

  // Weather state variables
  const [weatherInput, setWeatherInput] = useState(weatherLocation);
  const [isCelsius, setIsCelsius] = useState(true);
  const [weatherUnits, setWeatherUnits] = useState({
    temp: 22,
    condition: "Cosmic Glow",
    humidity: 48,
    windSpeed: 12,
    pressure: 1014,
    forecast: [
      { day: "SOL-1", temp: 23, icon: "SUN" },
      { day: "SOL-2", temp: 21, icon: "CLOUD" },
      { day: "SOL-3", temp: 19, icon: "RAIN" },
      { day: "SOL-4", temp: 24, icon: "SUN" },
    ]
  });

  // Calculate different mock coordinates or values based on address searches
  const getSubtleHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  useEffect(() => {
    if (weatherLocation) {
      setWeatherInput(weatherLocation);
      const hash = getSubtleHash(weatherLocation);
      const mockTemp = 10 + (hash % 22);
      const weatherTypes = ["Cosmic Breeze", "Nebula Haze", "Stellar Clear", "Solar Storm", "Auroral Calm"];
      const conditionSelected = weatherTypes[hash % weatherTypes.length];
      const humidityVal = 30 + (hash % 60);
      const windSpeedVal = 5 + (hash % 30);
      const pressureVal = 998 + (hash % 32);
      
      setWeatherUnits({
        temp: mockTemp,
        condition: conditionSelected,
        humidity: humidityVal,
        windSpeed: windSpeedVal,
        pressure: pressureVal,
        forecast: [
          { day: "SOL-1", temp: mockTemp + 2, icon: hash % 2 === 0 ? "SUN" : "CLOUD" },
          { day: "SOL-2", temp: mockTemp - 1, icon: hash % 3 === 0 ? "RAIN" : "CLOUD" },
          { day: "SOL-3", temp: mockTemp - 3, icon: "RAIN" },
          { day: "SOL-4", temp: mockTemp + 1, icon: "SUN" },
        ]
      });
    }
  }, [weatherLocation]);

  // Maps Widget local state
  const [mapInput, setMapInput] = useState(mapAddress);
  const [mapType, setMapType] = useState<"k" | "m" | "p">("k"); // k = satellite, m = road, p = terrain
  const [mapZoom, setMapZoom] = useState(() => (mapAddress === "Earth" || !mapAddress) ? 2 : 12);
  const [streetViewSim, setStreetViewSim] = useState(false);
  const [isListeningMaps, setIsListeningMaps] = useState(false);
  const [speechError, setSpeechError] = useState("");
  const [isMapDrawerOpen, setIsMapDrawerOpen] = useState(false);

  const startVocalSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError("Mic access restricted or not supported in browser.");
      return;
    }
    try {
      playSfx(587.33, "sine", 0.05, 0.1);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";
      rec.onstart = () => {
        setIsListeningMaps(true);
        setSpeechError("");
      };
      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          let query = transcript.trim();
          query = query.replace(/^(show me|go to|find|search for|search|take me to|where is)\s+/i, "");
          if (query.endsWith(".")) {
            query = query.slice(0, -1);
          }
          setMapInput(query);
          setMapAddress(query);
          const lowerQ = query.toLowerCase();
          if (lowerQ.includes("earth") || lowerQ === "the world") {
            setMapZoom(2);
          } else if (
            ["romania", "germany", "france", "italy", "spain", "uk", "united kingdom", "usa", "united states", "canada", "brazil", "australia", "china", "india", "japan", "russia", "mexico", "europe", "asia", "africa", "america"].some(c => lowerQ.includes(c))
          ) {
            setMapZoom(5);
          } else {
            setMapZoom(13);
          }
          playSfx(880, "sine", 0.05, 0.1);
        }
      };
      rec.onerror = (e: any) => {
        console.error(e);
        setIsListeningMaps(false);
        setSpeechError("Mic access restricted in iframe layout.");
      };
      rec.onend = () => {
        setIsListeningMaps(false);
      };
      rec.start();
    } catch (err) {
      console.error(err);
      setSpeechError("Voice engine activation failed.");
    }
  };

  useEffect(() => {
    if (mapAddress) {
      setMapInput(mapAddress);
      setIsMapDrawerOpen(false); // Retract drawer when destination is targeted/used
    }
  }, [mapAddress]);

  // Automatically retract map styles drawer after 7 seconds of idle time or when clicking anywhere else
  useEffect(() => {
    if (!isMapDrawerOpen) return;

    // 1. Idle auto-retract
    const timer = setTimeout(() => {
      setIsMapDrawerOpen(false);
    }, 7000);

    // 2. Click tracking for outside elements
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const dockElement = document.getElementById("map-controls-dock");
      const handleElement = document.getElementById("map-drawer-handle-el");

      if (
        dockElement && 
        !dockElement.contains(target) && 
        (!handleElement || !handleElement.contains(target))
      ) {
        setIsMapDrawerOpen(false);
        playSfx(440, "sine", 0.015, 0.12);
      }
    };

    // 3. Iframe click tracking via window focus/blur
    const handleWindowBlur = () => {
      setTimeout(() => {
        if (document.activeElement && document.activeElement.tagName === "IFRAME") {
          setIsMapDrawerOpen(false);
          playSfx(440, "sine", 0.015, 0.12);
        }
      }, 100);
    };

    document.addEventListener("pointerdown", handleDocumentClick);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("pointerdown", handleDocumentClick);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [isMapDrawerOpen]);

  // Financial form state
  const [financeAmount, setFinanceAmount] = useState("");
  const [financeDesc, setFinanceDesc] = useState("");
  const [financeCategory, setFinanceCategory] = useState("Gear");
  const [financeType, setFinanceType] = useState<"spend" | "income">("spend");

  // Camera settings state
  const [cameraFilter, setCameraFilter] = useState("grayscale");
  const [cameraActiveLocal, setCameraActiveLocal] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [snapshots, setSnapshots] = useState<string[]>([]);
  const [flashActive, setFlashActive] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const isSimulatedRef = useRef<boolean>(false);
  const currentStreamRef = useRef<MediaStream | null>(null);

  // Automatically activate camera when camera widget opens
  useEffect(() => {
    if (activeWidgetType === "CAMERA") {
      setCameraActiveLocal(true);
    }
  }, [activeWidgetType]);

  // Handle enumerate devices safely with fallbacks
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return;
    }
    navigator.mediaDevices.enumerateDevices()
      .then((devices) => {
        const videoInputs = devices.filter(d => d.kind === "videoinput");
        setAvailableCameras(videoInputs);

        if (videoInputs.length > 0) {
          // Prioritize built-in laptop/desktop camera if we have labels
          const builtIn = videoInputs.find(d => {
            const label = d.label.toLowerCase();
            return label && (
              label.includes("built-in") || 
              label.includes("facetime") || 
              label.includes("integrated") || 
              label.includes("internal") || 
              label.includes("camera") ||
              label.includes("isight")
            ) && !label.includes("poco") && !label.includes("phone") && !label.includes("continuity");
          });

          if (builtIn) {
            setSelectedCameraId(builtIn.deviceId);
          } else if (videoInputs[0].deviceId) {
            setSelectedCameraId(videoInputs[0].deviceId);
          }
        }
      })
      .catch(err => console.log("Device detection offline, fallback standard simulated stream available."));
  }, []);

  // Sync camera stream to video ref as soon as ref or stream changes
  useEffect(() => {
    if (localVideoRef.current) {
      if (localVideoRef.current.srcObject !== cameraStream) {
        localVideoRef.current.srcObject = cameraStream;
      }
    }
  }, [cameraStream, localVideoRef]);

  // Create simulated stream for iframe / local sandboxes with restricted hardware permissions
  const startSimulatedCameraStream = (): MediaStream => {
    isSimulatedRef.current = true;
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext("2d");
    
    let frame = 0;
    const draw = () => {
      if (!isSimulatedRef.current || !ctx) return;
      
      // Deep tech backdrop
      ctx.fillStyle = "#09080e";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Grid mesh layout
      ctx.strokeStyle = "rgba(245, 158, 11, 0.08)";
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let j = 0; j < canvas.height; j += 40) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(canvas.width, j);
        ctx.stroke();
      }
      
      // Inner targeting bounds
      ctx.strokeStyle = "rgba(245, 158, 11, 0.2)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 85 + Math.sin(frame * 0.06) * 8, 0, Math.PI * 2);
      ctx.stroke();

      // Horizontal tracking pulse
      const scanY = (frame * 2) % canvas.height;
      ctx.fillStyle = "rgba(245, 158, 11, 0.04)";
      ctx.fillRect(0, scanY - 30, canvas.width, 60);
      
      ctx.strokeStyle = "rgba(245, 158, 11, 0.35)";
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(canvas.width, scanY);
      ctx.stroke();

      // Top corner HUD parameters
      ctx.fillStyle = "#f59e0b";
      ctx.font = "bold 11px monospace";
      ctx.fillText("SIMULATED FEEDS // LENS INTEGRITY OK", 30, 40);
      ctx.fillStyle = "#8e8e93";
      ctx.fillText("DEC: +48.924 // RA: 18h 12m", 30, 60);
      ctx.fillText(`SEQ: ${frame} // INTG: AUTO_AI_PROCESS`, 30, 80);

      const items = ["COGNITIVE ALIGNMENT", "TEMPORAL TOPOGRAPHY", "VISUAL SYNCHRONICITY", "NEURAL VECTOR"];
      const activeIdx = Math.floor(frame / 60) % items.length;
      ctx.fillStyle = "#f59e0b";
      ctx.fillText(`> ENGAGING ${items[activeIdx]}...`, 30, 110);

      // Render artificial optical telemetry markers
      ctx.strokeStyle = "rgba(59, 130, 246, 0.4)";
      ctx.lineWidth = 1;
      const rectX = 260 + Math.cos(frame * 0.015) * 45;
      const rectY = 170 + Math.sin(frame * 0.02) * 35;
      ctx.strokeRect(rectX, rectY, 110, 90);
      ctx.fillStyle = "#3b82f6";
      ctx.fillText("TARGET_ZONE // CONFIDENCE 98.7%", rectX, rectY - 8);

      frame++;
      requestAnimationFrame(draw);
    };

    draw();

    try {
      const stream = (canvas as any).captureStream ? (canvas as any).captureStream(30) : (canvas as any).mozCaptureStream(30);
      return stream;
    } catch (e) {
      return new MediaStream();
    }
  };

  // Initialize camera local stream with reliable virtual backup
  useEffect(() => {
    // Stop any existing stream tracks immediately to free up hardware resource before asking for a new lock
    if (currentStreamRef.current) {
      currentStreamRef.current.getTracks().forEach(track => {
        try { track.stop(); } catch (e) {}
      });
      currentStreamRef.current = null;
    }

    if (activeWidgetType === "CAMERA" && cameraActiveLocal) {
      // Check if mediaDevices exists
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.log("Hardware media devices missing. Initializing virtual simulation stream.");
        const simulated = startSimulatedCameraStream();
        currentStreamRef.current = simulated;
        setCameraStream(simulated);
        return;
      }

      const constraints: MediaTrackConstraints = {
        width: { ideal: 640 },
        height: { ideal: 480 }
      };

      if (selectedCameraId) {
        constraints.deviceId = { exact: selectedCameraId };
      }

      navigator.mediaDevices.getUserMedia({ video: constraints })
        .then((stream) => {
          isSimulatedRef.current = false;
          currentStreamRef.current = stream;
          setCameraStream(stream);

          navigator.mediaDevices.enumerateDevices()
            .then((devices) => {
              const videoInputs = devices.filter(d => d.kind === "videoinput");
              setAvailableCameras(videoInputs);

              if (videoInputs.length > 0 && !selectedCameraId) {
                const builtIn = videoInputs.find(d => {
                  const label = d.label.toLowerCase();
                  return label.includes("built-in") || 
                         label.includes("facetime") || 
                         label.includes("integrated") || 
                         label.includes("internal") || 
                         label.includes("isight");
                });

                if (builtIn) {
                  setSelectedCameraId(builtIn.deviceId);
                } else {
                  const activeTrack = stream.getVideoTracks()[0];
                  if (activeTrack) {
                    const settings = activeTrack.getSettings();
                    if (settings.deviceId) {
                      setSelectedCameraId(settings.deviceId);
                    }
                  } else {
                    setSelectedCameraId(videoInputs[0].deviceId);
                  }
                }
              }
            })
            .catch(err => console.log("Device listing unavailable in sandboxed frame."));
        })
        .catch((err) => {
          // Log a safe warning rather than high severity error, and launch simulated camera bypass instantly
          console.log("Local camera restricted or unavailable. Activating simulated video bypass feed.");
          const simulated = startSimulatedCameraStream();
          currentStreamRef.current = simulated;
          setCameraStream(simulated);
          
          if (selectedCameraId) {
            setSelectedCameraId("");
          }
        });
    } else {
      stopCameraLocal();
    }
    return () => {
      stopCameraLocal();
    };
  }, [activeWidgetType, cameraActiveLocal, selectedCameraId]);

  const stopCameraLocal = () => {
    isSimulatedRef.current = false;
    if (currentStreamRef.current) {
      currentStreamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {}
      });
      currentStreamRef.current = null;
    }
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {}
      });
      setCameraStream(null);
    }
  };

  const handleCaptureSnapshot = () => {
    if (!localVideoRef.current) return;
    setFlashActive(true);
    setTimeout(() => setFlashActive(null as any), 150);

    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Draw mirrored video frame if capturing properly
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(localVideoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg");
      setSnapshots(prev => [dataUrl, ...prev].slice(0, 5));

      if (isKidsMode) {
        // Play snap sound (classic toy camera lens high chime)
        playSfx(1046.5, "sine", 0.02, 0.15);
        setTimeout(() => playSfx(1318.51, "sine", 0.025, 0.45), 60);

        if (!earnedBadges.includes("PHOTO")) {
          const newList = [...earnedBadges, "PHOTO"];
          saveBadges(newList);
          // Play badge unlock chime!
          setTimeout(() => {
            playSfx(523.25, "sine", 0.025, 0.2);
            setTimeout(() => playSfx(659.25, "sine", 0.025, 0.2), 80);
            setTimeout(() => playSfx(783.99, "sine", 0.025, 0.2), 160);
            setTimeout(() => playSfx(1046.5, "sine", 0.03, 0.4), 240);
          }, 350);
        }
      }
    }
  };

  const handleApplyWeather = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (weatherInput.trim()) {
      setWeatherLocation(weatherInput.trim());
    }
  };

  const handleApplyMap = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (mapInput.trim()) {
      setMapAddress(mapInput.trim());
      setIsMapDrawerOpen(false); // Retract drawer when map coordinates are manually applied
    }
  };

  const handleAddFinanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(financeAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || !financeDesc.trim()) return;
    
    onAddTransaction(parsedAmount, financeDesc.trim(), financeCategory, financeType);
    setFinanceAmount("");
    setFinanceDesc("");
  };

  // Finance metrics calculations
  const totalIn = transactions.filter(t => t.type === "income").reduce((acc, current) => acc + current.amount, 0);
  const totalOut = transactions.filter(t => t.type === "spend").reduce((acc, current) => acc + current.amount, 0);
  const netBalance = totalIn - totalOut;

  // Render correct icon depending on weather type
  const renderWeatherIcon = (iconStr: string, sizeClass = "w-4 h-4") => {
    switch (iconStr) {
      case "SUN":
        return <Sun className={`${sizeClass} text-amber-400`} />;
      case "RAIN":
        return <CloudRain className={`${sizeClass} text-cyan-400`} />;
      case "SNOW":
        return <CloudSnow className={`${sizeClass} text-blue-200`} />;
      case "CLOUD":
      default:
        return <CloudSun className={`${sizeClass} text-zinc-400`} />;
    }
  };

  // Return custom theme style colors supporting aesthetic pairings
  const getThemeColorClass = () => {
    switch (activeTheme) {
      case "EMERALD":
        return "text-emerald-400 border-emerald-950/40 focus:border-emerald-500 bg-emerald-950/10";
      case "CYBERPUNK":
        return "text-pink-500 border-pink-950/40 focus:border-pink-500 bg-pink-950/10";
      case "SLATE":
        return "text-slate-400 border-slate-700/40 focus:border-slate-500 bg-slate-800/20";
      case "AMBER":
      default:
        return "text-amber-500 border-amber-950/40 focus:border-amber-500 bg-amber-950/10";
    }
  };

  const getThemeTextClass = () => {
    switch (activeTheme) {
      case "EMERALD":
        return "text-emerald-400";
      case "CYBERPUNK":
        return "text-pink-500";
      case "SLATE":
        return "text-slate-400";
      case "AMBER":
      default:
        return "text-[#f59e0b]";
    }
  };

  const getThemeBgClass = () => {
    switch (activeTheme) {
      case "EMERALD":
        return "bg-emerald-500/20";
      case "CYBERPUNK":
        return "bg-pink-500/20";
      case "SLATE":
        return "bg-slate-500/10";
      case "AMBER":
      default:
        return "bg-[#f59e0b]/10";
    }
  };

  // Embedded Satellite Map URL without requiring keys
  const getMapEmbedUrl = () => {
    const encoded = encodeURIComponent(mapAddress || "Silicon Valley, CA");
    return `https://maps.google.com/maps?q=${encoded}&t=${mapType}&z=${mapZoom}&ie=UTF8&iwloc=&output=embed`;
  };

  return (
    <>
      {/* 1. LEFT SIDE VERTICAL BEZEL PANEL (MIRRORS THE RIGHT SIDE BEZEL DESIGN PERFECTLY) */}
      <AnimatePresence>
        {isWidgetsMenuOpen && (!isMobile || !activeWidgetType) && (
          <motion.div
            initial={{ opacity: 0, x: -50, scale: 0.96 }}
            animate={{ 
              opacity: 1, 
              x: 0, 
              scale: 1 
            }}
            exit={{ opacity: 0, x: -50, scale: 0.96 }}
            transition={{ type: "spring", damping: 25, stiffness: 180 }}
            className="fixed left-4 top-1/2 -translate-y-1/2 bg-[#060608]/92 border border-zinc-900 px-3 py-4 rounded-2xl flex flex-col items-center space-y-4 z-49 backdrop-blur-xl shadow-[0_15px_40px_rgba(0,0,0,0.85)] pointer-events-auto"
            id="widgets-vertical-bezel"
          >
            {[
              {
                type: "WEATHER",
                label: isKidsMode ? "FUN WEATHER 🌞" : "WEATHER",
                icon: isKidsMode ? <Smile className="w-4 h-4 text-cyan-400" /> : <CloudSun className="w-4 h-4 text-cyan-400/90" />,
                colorHover: "hover:text-cyan-400 hover:bg-cyan-950/20",
              },
              {
                type: "MEMORIES",
                label: isKidsMode ? `TOY CACHE (${sessionsCount})` : `MEMORIES (${sessionsCount})`,
                icon: <Archive className={`w-4 h-4 transition-colors duration-250 ${isMemoryPanelOpen ? "text-fuchsia-400" : "text-fuchsia-500/90"}`} />,
                colorHover: "hover:text-fuchsia-400 hover:bg-fuchsia-950/20",
              },
              {
                type: "CAMERA",
                label: isKidsMode ? "TOY CAM 📸" : "CAMERA",
                icon: <Camera className="w-4 h-4 text-amber-500/95" />,
                colorHover: "hover:text-amber-550 hover:bg-amber-950/20",
              },
              {
                type: "MAPS",
                label: isKidsMode ? "TREASURE MAP 🗺️" : "MAPS",
                icon: isKidsMode ? <Sparkles className="w-4 h-4 text-rose-400" /> : <Map className="w-4 h-4 text-rose-400/90" />,
                colorHover: "hover:text-rose-400 hover:bg-rose-950/25",
              },
              ...(!isKidsMode ? [
                {
                  type: "FINANCIAL",
                  label: "FINANCES",
                  icon: <TrendingUp className="w-4 h-4 text-emerald-400/90" />,
                  colorHover: "hover:text-emerald-400 hover:bg-emerald-950/30",
                }
              ] : [])
            ].map((item) => {
              const isActive = item.type === "MEMORIES" 
                ? isMemoryPanelOpen 
                : activeWidgetType === item.type;
              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => {
                    onFocusWidget?.();
                    if (item.type === "MEMORIES") {
                      setIsMemoryPanelOpen(!isMemoryPanelOpen);
                      setIsWidgetsMenuOpen(false);
                    } else {
                      if (activeWidgetType === item.type) {
                        setActiveWidgetType(null);
                        stopCameraLocal();
                        setCameraActiveLocal(false);
                      } else {
                        setActiveWidgetType(item.type as any);
                        setIsWidgetsMenuOpen(false);
                        if (item.type === "CAMERA") {
                          setCameraActiveLocal(true);
                        } else {
                          stopCameraLocal();
                          setCameraActiveLocal(false);
                        }
                      }
                    }
                  }}
                  className={`group relative p-2.5 rounded-xl border border-transparent transition-all duration-300 flex items-center justify-center cursor-pointer ${item.colorHover} ${
                    isActive 
                      ? item.type === "MEMORIES"
                        ? "bg-zinc-910 border-fuchsia-500/30 scale-105 shadow-[0_0_15px_rgba(217,70,239,0.15)] text-fuchsia-400"
                        : "bg-zinc-910 border-zinc-700/50 scale-105 shadow-md text-white" 
                      : "text-zinc-400"
                  }`}
                  title={item.label}
                >
                  {item.icon}
                  {/* Custom Tooltip flying off to the right (Mirrored from left tooltip) */}
                  <span className={`absolute left-full ml-3.5 top-1/2 -translate-y-1/2 bg-[#060608]/95 text-[8.5px] font-mono tracking-widest px-3 py-1.5 rounded-lg border border-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-xl z-50 uppercase font-bold ${
                    item.type === "MEMORIES" ? "text-fuchsia-400 border-fuchsia-500/10" : "text-[#f59e0b]"
                  }`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. CORE ACTIVE WIDGET DISPLAY LAYER (ON THE LEFT SIDE ALIGNED IN SYNC) */}
      <AnimatePresence>
        {activeWidgetType && (
          <motion.div
            key={activeWidgetType}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              width: isMobile ? "calc(100% - 2rem)" : (isFullscreen ? "94%" : "32%"),
              height: isMobile ? (isFullscreen ? "76vh" : "63vh") : (isFullscreen ? "85vh" : "58vh"),
              left: isMobile ? "1rem" : (isFullscreen ? "3%" : "6%"),
              top: isMobile ? (isFullscreen ? "80px" : "90px") : (isFullscreen ? "8vh" : "18%")
            }}
            exit={{ opacity: 0, scale: 0.97 }}
            style={{ x: dragX, y: dragY }}
            transition={{ type: "spring", damping: 28, stiffness: 200 }}
            drag={!isFullscreen}
            dragMomentum={false}
            dragElastic={0.06}
            onPointerDown={() => onFocusWidget?.()}
            id="active-widget-wrapper"
            className={`fixed ${
              isFullscreen
                ? lastActivated === "WIDGET" ? "z-45" : "z-35"
                : lastActivated === "WIDGET" ? "z-40" : "z-30"
            } bg-[#050507]/94 border border-zinc-900 rounded-2xl flex flex-col backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.95)] overflow-hidden pointer-events-auto`}
          >
            {/* Widget Title Glass Bar */}
            <div 
              className="flex items-center justify-between px-4 py-3 bg-[#0a0a0d]/80 border-b border-zinc-900/40 select-none cursor-grab active:cursor-grabbing"
              title="Hold and drag to reposition widget panel"
            >
              <div className="flex items-center space-x-2">
                {activeWidgetType === "WEATHER" && (isKidsMode ? <Smile className="w-3.5 h-3.5 text-cyan-400" /> : <CloudSun className="w-3.5 h-3.5 text-cyan-400" />)}
                {activeWidgetType === "CAMERA" && <Camera className="w-3.5 h-3.5 text-amber-500" />}
                {activeWidgetType === "MAPS" && (isKidsMode ? <Sparkles className="w-3.5 h-3.5 text-rose-400" /> : <Map className="w-3.5 h-3.5 text-rose-400" />)}
                {activeWidgetType === "FINANCIAL" && (isKidsMode ? <Trophy className="w-3.5 h-3.5 text-emerald-400" /> : <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />)}
                <span className="font-mono text-[10px] tracking-widest text-zinc-300 font-bold uppercase">
                  {isKidsMode
                    ? activeWidgetType === "WEATHER"
                      ? "FUN WEATHER 🌞"
                      : activeWidgetType === "MAPS"
                        ? "TREASURE FINDER 🗺️"
                        : activeWidgetType === "CAMERA"
                          ? "TOY CAM 📸"
                          : "BADGE REWARDS 🏆"
                    : `${activeWidgetType} WIDGET`
                  }
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              <div className="flex items-center space-x-1.5">
                {/* Minimize Button */}
                {activeWidgetType && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onMinimizeWidget) {
                        onMinimizeWidget(activeWidgetType);
                      } else {
                        setActiveWidgetType(null);
                      }
                      stopCameraLocal();
                      setCameraActiveLocal(false);
                    }}
                    className="p-1 rounded bg-zinc-950 hover:bg-zinc-900 text-zinc-500 hover:text-white border border-zinc-900 cursor-pointer transition-colors"
                    title="Minimize to Background"
                  >
                    <Minus className="w-2.5 h-2.5" />
                  </button>
                )}
                {/* Maximize Toggle */}
                <button
                  type="button"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-1 rounded bg-zinc-950 hover:bg-zinc-900 text-zinc-500 hover:text-white border border-zinc-900 cursor-pointer transition-colors"
                  title="Toggle Expanded Matrix Panelize"
                >
                  {isFullscreen ? <Minimize2 className="w-2.5 h-2.5" /> : <Maximize2 className="w-2.5 h-2.5" />}
                </button>
                {/* Dismiss Container */}
                <button
                  type="button"
                  onClick={() => {
                    if (onCloseWidget && activeWidgetType) {
                      onCloseWidget(activeWidgetType);
                    } else {
                      setActiveWidgetType(null);
                    }
                    stopCameraLocal();
                    setCameraActiveLocal(false);
                  }}
                  className="p-1 rounded bg-zinc-950 hover:bg-zinc-900 text-zinc-550 hover:text-white border border-zinc-900 cursor-pointer transition-colors"
                  aria-label="Secure widget projection"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>

            {/* Widget Content Views */}
            <div className={`flex-1 flex flex-col ${activeWidgetType === "MAPS" ? "overflow-hidden relative p-0" : "overflow-y-auto custom-scrollbar p-4"}`}>
              
              {/* VIEW A: WEATHER */}
              {activeWidgetType === "WEATHER" && (
                <div className="space-y-4 flex flex-col h-full justify-between">
                  {/* Local City Input Input Panel */}
                  <form onSubmit={handleApplyWeather} className="flex space-x-2">
                    <div className="relative flex-1">
                      <Search className="w-3 h-3 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input 
                        type="text"
                        value={weatherInput}
                        onChange={(e) => setWeatherInput(e.target.value)}
                        placeholder={isKidsMode ? "Search a magical place! 🌍 (e.g. London)" : "Inquire location coordinate (e.g. Oslo)"}
                        className="w-full text-[11px] font-sans bg-[#0c0c0e] border border-zinc-900 rounded-lg pl-8 pr-3 py-1.5 text-zinc-200 placeholder-zinc-450 outline-none focus:border-zinc-700 transition-colors"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-3 py-1 text-[10px] font-mono tracking-wider border border-zinc-900 hover:border-zinc-700 rounded-lg bg-zinc-950 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {isKidsMode ? "SEARCH 🎈" : "APPLY"}
                    </button>
                  </form>

                  {/* Main Live Weather Metrics Ring */}
                  <div className={`rounded-2xl p-4 border flex flex-col items-center justify-center text-center py-6 relative overflow-hidden group ${
                    isKidsMode 
                      ? "bg-gradient-to-br from-cyan-950/20 via-zinc-950/40 to-amber-950/20 border-cyan-500/20 shadow-[0_4px_25px_rgba(34,211,238,0.08)]"
                      : "bg-black/25 border-zinc-900/50"
                  }`}>
                    <div className="absolute top-2 right-3">
                      <button 
                        onClick={() => setIsCelsius(!isCelsius)}
                        className="text-[9px] font-mono text-zinc-650 hover:text-zinc-350 cursor-pointer font-semibold uppercase tracking-wider bg-black/40 px-2 py-0.5 rounded border border-zinc-900"
                      >
                        {isCelsius ? "°C" : "°F"}
                      </button>
                    </div>

                    <div className="flex items-center space-x-3.5 mb-1">
                      {isKidsMode ? (
                        <div className="text-3xl animate-bounce duration-1000">
                          {weatherUnits.temp > 21 ? "☀️" : "☁️"}
                        </div>
                      ) : (
                        renderWeatherIcon(weatherUnits.temp > 21 ? "SUN" : "CLOUD", "w-10 h-10 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.25)]")
                      )}
                      <div>
                        <div className="text-3xl font-serif italic text-zinc-100 flex items-start">
                          <span>
                            {isCelsius ? weatherUnits.temp : Math.round((weatherUnits.temp * 9/5) + 32)}
                          </span>
                          <span className="text-lg mt-0.5 font-light">°</span>
                        </div>
                        <p className="font-mono text-[7px] text-zinc-400 uppercase tracking-widest mt-0.5">
                          {isKidsMode ? "SUPER_TEMP ✨" : "CURRENT_STATE"}
                        </p>
                      </div>
                    </div>

                    <h3 className="font-serif italic text-base text-zinc-300 mt-2">
                       {isKidsMode 
                         ? weatherUnits.temp > 21 ? "Lovely Sparkly Sunshine! 🌞" : "Cozy Dreamy Clouds! ☁️"
                         : weatherUnits.condition
                       }
                    </h3>
                    <p className="font-mono text-[8px] tracking-widest text-[#f59e0b] mt-0.5 uppercase">
                      {weatherLocation || (isKidsMode ? "KIDS TOYBOX HQ 🧸" : "LOCAL SYSTEM GRID")}
                    </p>

                    {/* Outfit Guide helper */}
                    {isKidsMode && (
                      <div className="bg-[#f59e0b]/5 border border-[#f59e0b]/15 p-3 rounded-xl mt-4 flex items-center space-x-3 text-left w-full">
                        <span className="text-xl">🐱</span>
                        <div>
                          <span className="text-[9px] font-mono text-amber-500 font-bold block uppercase tracking-wider">TEACHER LUNA'S OUTFIT GUIDE</span>
                          <p className="text-[10px] text-zinc-300 leading-normal">
                            {weatherUnits.temp > 21 
                              ? "It is super warm! Grab a light T-shirt, a cool cap, and some yummy sunscreen! 🧢🍦" 
                              : weatherUnits.temp > 15 
                                ? "Perfect weather for a cozy sweater or a light hoodie! Go explore! 🍁🎒" 
                                : "Brrr! It is quite chilly! Wrap yourself in a warm coat and cozy scarf! ❄️🧣"
                            }
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Sensor details strip */}
                    <div className="w-full grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-t-zinc-900/70 text-left">
                      <div className="space-y-0.5">
                        <span className="font-mono text-[6.5px] text-zinc-400 uppercase tracking-wider block">
                          {isKidsMode ? "WATER DROPS 💧" : "HUMIDITY"}
                        </span>
                        <div className="flex items-center space-x-1">
                          <Droplets className="w-2.5 h-2.5 text-cyan-500/80" />
                          <span className="text-[10px] font-mono font-medium text-zinc-350">{weatherUnits.humidity}%</span>
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-mono text-[6.5px] text-zinc-400 uppercase tracking-wider block">
                          {isKidsMode ? "SWEET BREEZE 🍃" : "WIND_SPD"}
                        </span>
                        <div className="flex items-center space-x-1">
                          <Wind className="w-2.5 h-2.5 text-teal-400/85" />
                          <span className="text-[10px] font-mono font-medium text-zinc-350">{weatherUnits.windSpeed} km/h</span>
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-mono text-[6.5px] text-zinc-400 uppercase tracking-wider block">
                          {isKidsMode ? "SUN RAYS ⚡" : "HYMETRIC"}
                        </span>
                        <div className="flex items-center space-x-1 flex-row">
                          <Compass className="w-2.5 h-2.5 text-purple-400/80" />
                          <span className="text-[10px] font-mono font-medium text-zinc-350">
                            {isKidsMode ? "SUPER" : `${weatherUnits.pressure} hPa`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sol Forecast Strip */}
                  <div className="space-y-1.5">
                    <p className="font-mono text-[7px] text-zinc-400 uppercase tracking-widest">
                      {isKidsMode ? "WEEKLY PLAY DIARY 🌈" : "CHRONO_SOL_SEQUENCE"}
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {weatherUnits.forecast.map((forecastItem, index) => (
                        <div 
                          key={index}
                          className={`border p-2 rounded-xl flex flex-col items-center justify-center space-y-1 ${
                            isKidsMode 
                              ? "bg-cyan-950/10 border-cyan-900/40" 
                              : "bg-zinc-950/40 border-zinc-900"
                          }`}
                        >
                          <span className="font-mono text-[7.5px] text-zinc-400 font-bold uppercase">{forecastItem.day}</span>
                          {isKidsMode ? (
                            <span className="text-xs leading-none">
                              {forecastItem.temp > 21 ? "☀️" : "☁️"}
                            </span>
                          ) : (
                            renderWeatherIcon(forecastItem.icon, "w-4 h-4 mt-0.5")
                          )}
                          <span className="text-[10px] font-serif italic text-zinc-300 mt-1">
                            {isCelsius ? forecastItem.temp : Math.round((forecastItem.temp * 9/5) + 32)}°
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW B: CAMERA */}
              {activeWidgetType === "CAMERA" && (
                <div className="space-y-3.5 flex flex-col h-full justify-between">
                  {/* Kids filter bar */}
                  {isKidsMode && cameraActiveLocal && cameraStream && (
                    <div className="flex bg-[#0c0c0e]/90 p-1 rounded-xl border border-zinc-900 grid grid-cols-5 gap-1 text-center shrink-0">
                      {[
                        { id: "NONE", label: "Normal 📸", sfx: 440 },
                        { id: "SPARKLES", label: "Stars ✨", sfx: 523.25 },
                        { id: "CROWN", label: "Crown 👑", sfx: 587.33 },
                        { id: "CAT", label: "Kitty 🐱", sfx: 659.25 },
                        { id: "GLASSES", label: "Shades 😎", sfx: 783.99 },
                      ].map(f => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => {
                            setSelectedKidFilter(f.id as any);
                            playSfx(f.sfx, "sine", 0.02, 0.15);
                          }}
                          className={`py-1 rounded text-center cursor-pointer transition-all text-[9px] ${
                            selectedKidFilter === f.id
                              ? "bg-amber-500/15 text-[#f59e0b] font-bold border border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.1)]"
                              : "text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Live viewfinder viewport - expanded to full-height flex-1 to maximize camera screen real estate */}
                  <div className="relative flex-1 min-h-[350px] md:min-h-[400px] rounded-2xl overflow-hidden border border-zinc-900/80 bg-zinc-950 flex flex-col items-center justify-center group shadow-[inset_0_4px_30px_rgba(0,0,0,0.8)]">
                    <video 
                      ref={localVideoRef} 
                      autoPlay 
                      playsInline 
                      muted 
                      className={`w-full h-full object-cover scale-x-[-1] transition-all duration-300 ${
                        (!cameraActiveLocal || !cameraStream) ? "hidden" : "block"
                      }`}
                    />

                    {/* Camera Interactive TikTok overlays for Kids */}
                    {isKidsMode && cameraActiveLocal && cameraStream && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                        {selectedKidFilter === "SPARKLES" && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                            <motion.div 
                              className="text-amber-300 text-6xl absolute top-12 left-12"
                              animate={{ scale: [1, 1.25, 1], rotate: [0, 15, 0], opacity: [0.7, 1, 0.7] }}
                              transition={{ repeat: Infinity, duration: 2 }}
                            >
                              ✨
                            </motion.div>
                            <motion.div 
                              className="text-amber-200 text-4xl absolute bottom-16 right-16"
                              animate={{ scale: [1.2, 1, 1.2], rotate: [0, -20, 0], opacity: [0.6, 0.9, 0.6] }}
                              transition={{ repeat: Infinity, duration: 2.3 }}
                            >
                              ⭐
                            </motion.div>
                            <motion.div 
                              className="text-cyan-300 text-5xl absolute top-2/3 left-8 animate-pulse"
                            >
                              🌟
                            </motion.div>
                            <motion.div 
                              className="text-fuchsia-400 text-4xl absolute top-16 right-12 animate-bounce"
                            >
                              🌈
                            </motion.div>
                          </div>
                        )}
                        {selectedKidFilter === "CROWN" && (
                          <motion.div 
                            className="absolute top-[22%] flex flex-col items-center justify-center select-none pointer-events-none"
                            animate={{ y: [0, -8, 0] }}
                            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                          >
                            <span className="text-6xl filter drop-shadow-[0_4px_12px_rgba(245,158,11,0.65)]">👑</span>
                          </motion.div>
                        )}
                        {selectedKidFilter === "CAT" && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none pt-4 scale-125">
                            <span className="text-4xl">👃</span>
                            <div className="flex space-x-14 -mt-3.5 text-2xl font-bold text-amber-500/40">
                              <span>三</span>
                              <span>三</span>
                            </div>
                            <div className="absolute top-[25%] flex space-x-20 text-3xl">
                              <span className="rotate-12">👂</span>
                              <span className="-rotate-12">👂</span>
                            </div>
                          </div>
                        )}
                        {selectedKidFilter === "GLASSES" && (
                          <motion.div 
                            className="absolute inset-0 flex items-center justify-center select-none pointer-events-none scale-125"
                            animate={{ scale: [1.25, 1.29, 1.25] }}
                            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                          >
                            <span className="text-6xl filter drop-shadow-[0_4px_8px_rgba(236,72,153,0.55)]">😎</span>
                          </motion.div>
                        )}
                      </div>
                    )}

                    {(!cameraActiveLocal || !cameraStream) && (
                      <div className="text-center p-6 space-y-2 select-none z-10">
                        <div className="w-12 h-12 rounded-full bg-zinc-900/50 border border-zinc-800 flex items-center justify-center mx-auto mb-2 animate-pulse">
                          <Camera className="w-5 h-5 text-zinc-500" />
                        </div>
                        <p className="font-mono text-[8px] text-zinc-400 uppercase tracking-widest font-bold">OPTICS_LENS_OFFLINE</p>
                        <p className="text-[9px] font-sans text-zinc-500 max-w-[220px] leading-normal mx-auto">
                          Webcam feeds are currently paused. Enable connection below to initialize vision processing.
                        </p>
                      </div>
                    )}

                    {/* Dynamic HUD Overlays */}
                    {cameraActiveLocal && cameraStream && (
                      <>
                        {/* Top Left: Status */}
                        <div className="absolute top-3 left-3 flex items-center space-x-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-zinc-900/50 pointer-events-none z-10">
                          <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
                          <span className="font-mono text-[6.5px] text-zinc-350 tracking-widest font-bold uppercase">LIVE FEED // TRUE_COLOR</span>
                        </div>

                        {/* Top Right: Multi-Camera input dropdown selector (Overlay) */}
                        {availableCameras.length > 0 && (
                          <div className="absolute top-3 right-3 flex items-center space-x-1.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg border border-zinc-900/50 z-10 transition-opacity">
                            <span className="font-mono text-[6px] text-zinc-500 font-bold uppercase pl-1">LENS:</span>
                            <select
                              value={selectedCameraId}
                              onChange={(e) => setSelectedCameraId(e.target.value)}
                              className="bg-transparent text-[8px] font-mono text-zinc-300 font-medium focus:outline-none cursor-pointer py-1 max-w-[120px] truncate"
                            >
                              {availableCameras.map((cam) => (
                                <option key={cam.deviceId} value={cam.deviceId} className="bg-zinc-950 font-mono text-zinc-300">
                                  {cam.label || `LENS SOURCE // ${cam.deviceId.slice(0, 5)}`}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Centered target reticle for visual AI indication */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-5 opacity-40 font-mono text-[22px] text-zinc-500">
                          ┼
                        </div>
                      </>
                    )}

                    {/* Flash Overlay snapshot effect */}
                    <AnimatePresence>
                      {flashActive && (
                        <motion.div 
                          className="absolute inset-0 bg-white z-20 pointer-events-none"
                          initial={{ opacity: 1 }}
                          animate={{ opacity: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        />
                      )}
                    </AnimatePresence>

                    {/* Sleek Overlaid bottom utility bar for direct lens interactions */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-6 flex items-center justify-between z-10 pointer-events-auto">
                      <button
                        onClick={() => setCameraActiveLocal(!cameraActiveLocal)}
                        className={`py-1 px-2.5 text-[8.5px] font-mono tracking-widest border font-bold rounded-lg cursor-pointer transition-all uppercase ${
                          cameraActiveLocal 
                            ? "border-red-950/40 text-red-400 bg-red-950/10 hover:bg-red-950/20" 
                            : "border-zinc-800 text-zinc-300 bg-black/40 hover:text-white"
                        }`}
                      >
                        {cameraActiveLocal ? "ENG_OFF" : "ENG_ON"}
                      </button>

                      {/* Prominent transparent amber/border theme Shutter button aligned with visual vibe */}
                      <button
                        disabled={!cameraActiveLocal}
                        onClick={handleCaptureSnapshot}
                        className="w-11 h-11 rounded-full border border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 text-[#f59e0b] hover:text-amber-400 active:scale-95 disabled:scale-100 disabled:opacity-20 transition-all flex items-center justify-center p-0 shadow-[0_0_12px_rgba(245,158,11,0.2)] disabled:pointer-events-none cursor-pointer"
                        title="Capture feed snapshot"
                      >
                        <Camera className="w-5 h-5" />
                      </button>

                      {/* Clean micro status indicator showing if sensor is online (green) or standby (grey/red) */}
                      <div className="flex items-center space-x-2 select-none pr-1">
                        <span className={`w-2.5 h-2.5 rounded-full ${cameraActiveLocal && cameraStream ? "bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" : "bg-zinc-600 shadow-[0_0_8px_rgba(113,113,122,0.4)]"}`} />
                        <span className="font-mono text-[8px] text-zinc-400 font-bold tracking-widest">
                          {cameraActiveLocal && cameraStream ? "LIVE" : "STBY"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal strip showing captured snapshots */}
                  <div className="space-y-1.5 shrink-0">
                    <div className="flex justify-between items-center text-[7px] font-mono text-zinc-500 uppercase tracking-widest">
                      <span>OBSERVER SNAPSHOTS LAYER</span>
                      {snapshots.length > 0 && (
                        <button 
                          onClick={() => setSnapshots([])}
                          className="hover:text-zinc-300 cursor-pointer text-[6.5px]"
                        >
                          RESET_ALL
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1.5 max-h-[55px] overflow-y-hidden">
                      {snapshots.length === 0 ? (
                        <div className="w-full text-center py-2 bg-zinc-950/20 border border-zinc-900/60 rounded-xl">
                          <p className="text-[7.5px] font-mono text-zinc-500 uppercase tracking-widest">NO_SNAPSHOTS_SERIALLY</p>
                        </div>
                      ) : (
                        snapshots.map((snap, index) => (
                          <div 
                            key={index} 
                            className="relative w-14 h-10 rounded-lg overflow-hidden border border-zinc-900 flex-shrink-0 group hover:border-[#f59e0b] transition-all"
                          >
                            <img src={snap} alt="Camera snapshot" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-1.5">
                              <Eye 
                                className="w-3 h-3 text-white cursor-pointer" 
                                onClick={() => {
                                  const win = window.open();
                                  if (win) {
                                    win.document.write(`<img src="${snap}" style="max-width:100%; max-height:100vh; display:block; margin:auto;" />`);
                                  }
                                }} 
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

               {/* VIEW C: MAPS with Interactive Google satellite embeds */}
              {activeWidgetType === "MAPS" && (
                <div className="relative w-full h-full flex flex-col justify-between overflow-hidden group select-none">
                  {/* The actual map fills the entire widget */}
                  <div className="w-full h-full relative flex-1">
                    {!streetViewSim ? (
                      <div className="w-full h-full relative overflow-hidden">
                        <iframe
                          src={getMapEmbedUrl()}
                          style={{ 
                            border: 0, 
                            filter: isKidsMode 
                              ? "contrast(115%) saturate(125%) brightness(105%)" 
                              : (mapType === "k" && !streetViewSim)
                                ? "contrast(112%) brightness(95%) saturate(105%)" 
                                : "invert(90%) hue-rotate(180deg) contrast(110%)" 
                          }}
                          allowFullScreen={false}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          title="Vector Cosmic Satellite Map"
                          className="w-full absolute -top-11 left-0 right-0 h-[calc(100%+44px)] pointer-events-auto"
                        />
                        {/* Elegant Custom themed External "Open in Maps" Overlay Button */}
                        <button
                          type="button"
                          onClick={() => {
                            playSfx(880, "sine", 0.02, 0.1);
                            const encoded = encodeURIComponent(mapAddress || "Silicon Valley, CA");
                            window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`, "_blank", "noopener,noreferrer");
                          }}
                          className="absolute bottom-3 left-3 z-30 bg-[#050507]/90 hover:bg-[#0c0c14]/95 backdrop-blur-md border border-rose-500/25 hover:border-rose-400 text-rose-350 hover:text-white px-2.5 py-1.5 rounded-xl text-[8px] font-mono tracking-wider font-extrabold select-none pointer-events-auto transition-all cursor-pointer shadow-[0_8px_24px_rgba(0,0,0,0.65)] hover:scale-105 active:scale-95 flex items-center gap-1.5"
                          title="Launch direct Google Maps stream"
                        >
                          <ArrowUpRight className="w-2.5 h-2.5 text-rose-400" />
                          <span>{isKidsMode ? "EXTERNAL TOUR 🚀" : "OPEN IN GOOGLE MAPS"}</span>
                        </button>
                        {/* Kid Treasure Hunt Overlay */}
                        {isKidsMode && isTreasureMode && (
                          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                            {/* Dotted path */}
                            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                              <line 
                                x1="20" y1="20" x2="160" y2="100" 
                                stroke="#f43f5e" strokeWidth="2.5" strokeDasharray="6,6"
                                className="opacity-70"
                              />
                              <line 
                                x1="160" y1="100" x2="260" y2="180" 
                                stroke="#f43f5e" strokeWidth="2.5" strokeDasharray="6,6"
                                className="opacity-70"
                              />
                            </svg>
                            {/* Treasure mark */}
                            <div className="absolute top-[100px] left-[160px] animate-pulse">
                              <span className="text-4xl filter drop-shadow-[0_2px_8px_rgba(244,63,94,0.8)]">❌</span>
                              <span className="absolute -top-6 -right-2 text-xs font-mono bg-rose-600 px-1.5 py-0.5 rounded-full text-white font-bold whitespace-nowrap">TREASURE_HERE!</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Futuristic/Magical AR streetview overlay scanner */
                      <div className="w-full h-full relative flex flex-col justify-between bg-[#060609] text-left p-4 overflow-hidden">
                        {/* Decorative Radar sweeps */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.06)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
                        <div className="absolute -inset-10 bg-radial-gradient(ellipse_at_center,rgba(245,158,11,0.07)_0%,transparent_70%) pointer-events-none animate-pulse" />

                        <div className="space-y-1.5 select-none relative z-10 mt-16 max-w-sm">
                          <div className="flex justify-between items-center border-b border-rose-500/25 pb-1.5">
                            <span className="font-mono text-[8px] text-rose-400 font-extrabold uppercase tracking-widest animate-pulse flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-550 animate-ping" />
                              {isKidsMode ? "🐾 SAFARI SCAN COMMENTARY" : "◆ STREET_VIEW_HUD_SIM"}
                            </span>
                            <span className="font-mono text-[7px] text-zinc-550">LENS_SECURE: ACTIVE</span>
                          </div>
                          <p className="font-serif italic text-[11.5px] text-zinc-250 leading-relaxed pt-1 max-w-sm drop-shadow">
                            {isKidsMode ? (
                              mapAddress.includes("Bora Bora")
                                ? "“Oh wow! We spotted an ancient wooden pirate chest buried beneath a smiling palm tree! 🏝️💰 Let's share with Teacher Luna!”"
                                : mapAddress.includes("Drumheller")
                                  ? "“Look out! A friendly green T-Rex dinosaur is waving at us from behind the giant rock canyon! 🦖👋 ROAR!”"
                                  : mapAddress.includes("Hershey")
                                    ? "“Yum! The magic sensors detected flowing candy rivers and marshmallow clouds here! 🍫🍬🍭”"
                                    : mapAddress.includes("Neuschwanstein")
                                      ? "“Beep beep! Magic levels high! A pink baby unicorn is drinking sparking purple water near the castle gate! 🦄✨”"
                                      : mapAddress.includes("Roswell")
                                        ? "“My sensors see friendly little green martians having a delicious tea party next to their saucer! 🛸👽🍰”"
                                        : `“Exploring coords at ${mapAddress || "the epicenter"}. Direct spatial sensors see playful monkeys swing-dancing on tree branches! 🐒🍌 All clear!”`
                            ) : (
                              `“Scanning digital landscape coordinates at ${mapAddress || "the epicenter"}. Direct spatial street camera projection is rendering street topography scan.”`
                            )}
                          </p>
                        </div>

                        {/* Telemetry log boxes */}
                        <div className="bg-black/80 p-3 rounded-xl border border-zinc-500/15 max-w-xs relative z-10 mb-20 shadow-2xl backdrop-blur-md">
                          <span className="font-mono text-[6.5px] text-zinc-550 uppercase tracking-widest block mb-1">
                            {isKidsMode ? "KIDS SAFARI COORDINATES LOG" : "LOCALIZED GEOLOCATION SCAN METRICS"}
                          </span>
                          <div className="grid grid-cols-2 gap-1.5 font-mono text-[8px] text-zinc-450">
                            <div>EST_LAT: {(getSubtleHash(mapAddress) % 90).toFixed(5)}° N</div>
                            <div>EST_LNG: {(getSubtleHash(mapAddress) % 180 - 90).toFixed(5)}° W</div>
                            <div>
                              {isKidsMode ? "WIND: PLAYFUL 🍃" : `GRID_HEADING: ${(getSubtleHash(mapAddress) % 360)}.50°`}
                            </div>
                            <div>
                              {isKidsMode ? "SIGHTINGS: CUTE CATS 🐱" : `ELEVATION: ${(getSubtleHash(mapAddress) % 1200)}m ASL`}
                            </div>
                          </div>
                        </div>

                        {/* Scanline overlay */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-800/5 to-transparent h-2 bg-[size:100%_4px] pointer-events-none" />
                      </div>
                    )}

                    {/* HUD coordinates ticker overlay completely removed to keep the view clean */}
                  </div>

                  {/* Top floating glass search and vocal search panel */}
                  <div className="absolute top-3 left-3 right-3 z-30 flex flex-col gap-2 pointer-events-auto max-w-sm sm:max-w-md mx-auto">
                    <div className="flex items-center space-x-2 bg-[#050507]/75 backdrop-blur-md border border-zinc-500/20 px-3 py-1.5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                      <Search className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                      <input
                        type="text"
                        value={mapInput}
                        onChange={(e) => setMapInput(e.target.value)}
                        placeholder={isKidsMode ? "Kids Magical Search... 🌍" : "Search destination... 🛰️"}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleApplyMap();
                          }
                        }}
                        className="flex-1 min-w-0 bg-transparent border-none text-[11px] font-sans text-zinc-150 placeholder-zinc-550 outline-none focus:ring-0 focus:border-transparent p-0"
                      />
                      {/* Interactive Vocal Search Button */}
                      <button
                        type="button"
                        onClick={startVocalSearch}
                        className={`p-1 rounded-full border transition-all cursor-pointer relative active:scale-95 flex-shrink-0 ${
                          isListeningMaps
                            ? "bg-rose-500/20 border-rose-455 text-rose-300 animate-pulse"
                            : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-rose-400 hover:border-rose-500/30"
                        }`}
                        title="Vocal search (e.g. show me Romania)"
                      >
                        {isListeningMaps ? (
                          <span className="flex h-3.5 w-3.5 relative items-center justify-center">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <Mic className="w-3.5 h-3.5 text-rose-300 relative z-10" />
                          </span>
                        ) : (
                          <Mic className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleApplyMap}
                        className="p-1.5 bg-[#09090b]/85 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 rounded-full transition-all cursor-pointer flex items-center justify-center relative active:scale-95 flex-shrink-0"
                        title={isKidsMode ? "Launch Celestial Flight" : "Calculate orbital path and project location"}
                      >
                        {isKidsMode ? (
                          <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                        ) : (
                          <Navigation className="w-3.5 h-3.5 rotate-45 transform text-rose-400" />
                        )}
                      </button>
                    </div>

                    {isListeningMaps && (
                      <div className="self-center bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[8.5px] font-mono px-3 py-1 rounded-full backdrop-blur-sm animate-pulse shadow-md">
                        Listening... Try saying "show me Romania" 🎙️
                      </div>
                    )}
                    {speechError && (
                      <div className="self-center bg-zinc-950/90 border border-zinc-800 text-rose-455 text-[8.5px] font-serif italic px-3 py-1 rounded-full backdrop-blur-sm shadow-md">
                        {speechError}
                      </div>
                    )}
                  </div>

                  {/* Bottom floating glass shortcuts in kids mode */}
                  {isKidsMode && (
                    <div className="absolute bottom-14 left-3 right-3 z-30 flex flex-col space-y-1 pointer-events-auto">
                      <span className="font-mono text-[7px] text-amber-400/90 font-extrabold uppercase tracking-widest text-left select-none filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                        ✨ MAGICAL SHORTCUTS ✨
                      </span>
                      <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar w-full">
                        {[
                          { id: "Treasure Island", label: "Treasure Island 🏝️", address: "Bora Bora", sfx: 493.88 },
                          { id: "Dino Valley", label: "Dino Valley 🦖", address: "Drumheller, Canada", sfx: 523.25 },
                          { id: "Candy Town", label: "Candy Town 🍭", address: "Hershey, Pennsylvania", sfx: 587.33 },
                          { id: "Magic Castle", label: "Unicorn Castle 🦄", address: "Neuschwanstein Castle", sfx: 659.25 },
                          { id: "Alien Outpost", label: "Alien Spot 🛸", address: "Roswell, New Mexico", sfx: 783.99 }
                        ].map((dest, idx) => {
                          const isSel = mapAddress === dest.address;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setMapAddress(dest.address);
                                setMapInput(dest.address);
                                setMapZoom(13);
                                playSfx(dest.sfx, "sine", 0.02, 0.2);
                                if (!earnedBadges.includes("MAP")) {
                                  const newList = [...earnedBadges, "MAP"];
                                  saveBadges(newList);
                                  setTimeout(() => {
                                    playSfx(880, "sine", 0.02, 0.15);
                                    playSfx(1109, "sine", 0.02, 0.15);
                                    playSfx(1318.5, "sine", 0.02, 0.3);
                                  }, 400);
                                }
                              }}
                              className={`px-2.5 py-1 text-[9px] font-sans rounded-xl border flex-shrink-0 transition-all cursor-pointer shadow-md backdrop-blur-md ${
                                isSel
                                  ? "bg-rose-500/30 border-rose-455 text-rose-200 font-bold shadow-[0_0_8px_rgba(244,63,94,0.3)] scale-105"
                                  : "bg-[#050507]/75 border-zinc-800 text-zinc-400 hover:text-white"
                              }`}
                            >
                              {dest.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <AnimatePresence>
                    {!isMapDrawerOpen && (
                      <motion.button
                        key="map-drawer-handle"
                        id="map-drawer-handle-el"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        onClick={() => {
                          setIsMapDrawerOpen(true);
                          playSfx(523.25, "sine", 0.015, 0.1);
                        }}
                        className="absolute right-1 top-1/2 -translate-y-1/2 z-40 w-2 h-14 bg-zinc-400/25 hover:bg-rose-500/50 hover:w-2.5 backdrop-blur-md border border-white/5 rounded-full flex items-center justify-center transition-all cursor-pointer group pointer-events-auto"
                        title="Slide or Tap to Open Map Styles"
                        aria-label="Open Map Styles Menu"
                        drag="x"
                        dragConstraints={{ left: -30, right: 0 }}
                        dragElastic={0.1}
                        onDragEnd={(_, info) => {
                          if (info.offset.x < -8) {
                            setIsMapDrawerOpen(true);
                            playSfx(523.25, "sine", 0.015, 0.1);
                          }
                        }}
                      >
                        {/* A tiny subtle line divider indicator */}
                        <div className="w-[1.5px] h-5 bg-zinc-400 group-hover:bg-rose-300 rounded-full transition-colors" />
                      </motion.button>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {isMapDrawerOpen && (
                      <motion.div
                        key="map-controls-dock"
                        initial={{ x: "125%", opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: "125%", opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 350 }}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 z-30 bg-[#050507]/45 backdrop-blur-md border border-zinc-500/10 w-9 py-4 rounded-full flex flex-col items-center gap-4.5 shadow-[0_12px_32px_rgba(0,0,0,0.55)] pointer-events-auto"
                        id="map-controls-dock"
                        drag="x"
                        dragConstraints={{ left: 0, right: 80 }}
                        dragElastic={0.05}
                        onDragEnd={(_, info) => {
                          // Dragging right closes the drawer
                          if (info.offset.x > 12) {
                            setIsMapDrawerOpen(false);
                            playSfx(440, "sine", 0.015, 0.12);
                          }
                        }}
                      >
                        {/* Mode Buttons */}
                        {isKidsMode ? (
                          <div className="flex flex-col gap-4 items-center w-full">
                            {/* Kid colorful map */}
                            <div className="relative flex items-center justify-center group/tooltip">
                              <button
                                type="button"
                                onClick={() => {
                                  setStreetViewSim(false);
                                  playSfx(523.25, "sine", 0.02, 0.1);
                                }}
                                className={`w-6 h-6 flex items-center justify-center transition-all cursor-pointer bg-transparent border-none p-0 ${
                                  !streetViewSim
                                    ? "text-rose-400 scale-110 drop-shadow-[0_0_6px_rgba(244,63,94,0.5)]" 
                                    : "text-zinc-600 hover:text-zinc-300"
                                }`}
                              >
                                <Sparkles className="w-5 h-5" />
                              </button>
                              <div className="absolute right-9 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-[#0b0b0f] border border-zinc-800 text-[8px] font-mono tracking-wider text-zinc-300 pointer-events-none opacity-0 scale-95 group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 transition-all duration-150 shadow-md whitespace-nowrap z-50">
                                FUN CELESTIAL
                              </div>
                            </div>

                            {/* Kid safari map */}
                            <div className="relative flex items-center justify-center group/tooltip">
                              <button
                                type="button"
                                onClick={() => {
                                  setStreetViewSim(true);
                                  playSfx(587.33, "sine", 0.02, 0.1);
                                }}
                                className={`w-6 h-6 flex items-center justify-center transition-all cursor-pointer bg-transparent border-none p-0 ${
                                  streetViewSim
                                    ? "text-rose-400 scale-110 drop-shadow-[0_0_6px_rgba(244,63,94,0.5)]" 
                                    : "text-zinc-600 hover:text-zinc-300"
                                }`}
                              >
                                <Camera className="w-5 h-5" />
                              </button>
                              <div className="absolute right-9 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-[#0b0b0f] border border-zinc-800 text-[8px] font-mono tracking-wider text-zinc-300 pointer-events-none opacity-0 scale-95 group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 transition-all duration-150 shadow-md whitespace-nowrap z-50">
                                SAFARI EYE
                              </div>
                            </div>

                            {/* Kid treasure mode */}
                            <div className="relative flex items-center justify-center group/tooltip">
                              <button
                                type="button"
                                onClick={() => { 
                                  const nextMode = !isTreasureMode;
                                  setIsTreasureMode(nextMode);
                                  playSfx(nextMode ? 880 : 440, "sine", 0.015, 0.25);
                                }}
                                className={`w-6 h-6 flex items-center justify-center transition-all cursor-pointer bg-transparent border-none p-0 ${
                                  isTreasureMode
                                    ? "text-yellow-400 scale-110 drop-shadow-[0_0_6px_rgba(234,179,8,0.5)] animate-pulse" 
                                    : "text-zinc-600 hover:text-zinc-300"
                                }`}
                              >
                                <Trophy className="w-5 h-5" />
                              </button>
                              <div className="absolute right-9 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-[#0b0b0f] border border-zinc-800 text-[8px] font-mono tracking-wider text-zinc-300 pointer-events-none opacity-0 scale-95 group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 transition-all duration-150 shadow-md whitespace-nowrap z-50">
                                TREASURE INDEX
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-4.5 items-center w-full">
                            {/* Map Mode 1: SATELLITE */}
                            <div className="relative flex items-center justify-center group/tooltip">
                              <button
                                type="button"
                                onClick={() => {
                                  setMapType("k");
                                  setStreetViewSim(false);
                                  playSfx(523.25, "sine", 0.02, 0.1);
                                }}
                                className={`w-6 h-6 flex items-center justify-center transition-all cursor-pointer bg-transparent border-none p-0 ${
                                  mapType === "k" && !streetViewSim
                                    ? "text-rose-400 scale-110 drop-shadow-[0_0_6px_rgba(244,63,94,0.5)]" 
                                    : "text-zinc-500 hover:text-zinc-300"
                                }`}
                              >
                                <Satellite className="w-5 h-5" />
                              </button>
                              <div className="absolute right-9 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-[#0b0b0f] border border-zinc-800 text-[8px] font-mono tracking-wider text-zinc-300 pointer-events-none opacity-0 scale-95 group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 transition-all duration-150 shadow-md whitespace-nowrap z-50">
                                SATELLITE
                              </div>
                            </div>

                            {/* Map Mode 2: STREET MAP */}
                            <div className="relative flex items-center justify-center group/tooltip">
                              <button
                                type="button"
                                onClick={() => {
                                  setMapType("m");
                                  setStreetViewSim(false);
                                  playSfx(587.33, "sine", 0.02, 0.1);
                                }}
                                className={`w-6 h-6 flex items-center justify-center transition-all cursor-pointer bg-transparent border-none p-0 ${
                                  mapType === "m" && !streetViewSim
                                    ? "text-rose-400 scale-110 drop-shadow-[0_0_6px_rgba(244,63,94,0.5)]" 
                                    : "text-zinc-500 hover:text-zinc-300"
                                }`}
                              >
                                <Map className="w-5 h-5" />
                              </button>
                              <div className="absolute right-9 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-[#0b0b0f] border border-zinc-800 text-[8px] font-mono tracking-wider text-zinc-300 pointer-events-none opacity-0 scale-95 group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 transition-all duration-150 shadow-md whitespace-nowrap z-50">
                                ROADMAP
                              </div>
                            </div>

                            {/* Map Mode 3: TERRAIN */}
                            <div className="relative flex items-center justify-center group/tooltip">
                              <button
                                type="button"
                                onClick={() => {
                                  setMapType("p");
                                  setStreetViewSim(false);
                                  playSfx(659.25, "sine", 0.02, 0.1);
                                }}
                                className={`w-6 h-6 flex items-center justify-center transition-all cursor-pointer bg-transparent border-none p-0 ${
                                  mapType === "p" && !streetViewSim 
                                    ? "text-rose-400 scale-110 drop-shadow-[0_0_6px_rgba(244,63,94,0.5)]" 
                                    : "text-zinc-500 hover:text-zinc-300"
                                }`}
                              >
                                <Mountain className="w-5 h-5" />
                              </button>
                              <div className="absolute right-9 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-[#0b0b0f] border border-zinc-800 text-[8px] font-mono tracking-wider text-zinc-300 pointer-events-none opacity-0 scale-95 group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 transition-all duration-150 shadow-md whitespace-nowrap z-50">
                                TERRAIN
                              </div>
                            </div>

                            {/* Map Mode 4: 3D STREET */}
                            <div className="relative flex items-center justify-center group/tooltip">
                              <button
                                type="button"
                                onClick={() => {
                                  setStreetViewSim(true);
                                  playSfx(783.99, "sine", 0.02, 0.1);
                                }}
                                className={`w-6 h-6 flex items-center justify-center transition-all cursor-pointer bg-transparent border-none p-0 ${
                                  streetViewSim
                                    ? "text-rose-400 scale-110 drop-shadow-[0_0_6px_rgba(244,63,94,0.5)]" 
                                    : "text-zinc-500 hover:text-zinc-300"
                                }`}
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                              <div className="absolute right-9 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-[#0b0b0f] border border-zinc-800 text-[8px] font-mono tracking-wider text-zinc-300 pointer-events-none opacity-0 scale-95 group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 transition-all duration-150 shadow-md whitespace-nowrap z-50">
                                AR SCANNER
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
                   {/* VIEW D: FINANCIAL TRACKER Ledger & Market Monitor */}
              {activeWidgetType === "FINANCIAL" && (isKidsMode ? (
                // Playful Teacher Luna's Badge System Widget
                <div className="space-y-4 flex flex-col h-full justify-between text-left">
                  <div className="space-y-3">
                    <div className="text-center bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-purple-500/10 border border-amber-500/10 p-3 rounded-2xl">
                      <span className="text-2xl block mb-1">🏅</span>
                      <h4 className="font-serif italic text-sm text-zinc-200">Teacher Luna's Badge System</h4>
                      <p className="text-[10px] text-zinc-400 mt-1 leading-normal">
                        Perform awesome tasks in physical exploration and snapshots to unlock shiny achievements!
                      </p>
                    </div>

                    {/* Grid of Badges */}
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { 
                          id: "MATH", 
                          icon: "🧮", 
                          name: "Calculation Guru", 
                          desc: "Awarded for mathematical core excellence!", 
                          color: "from-blue-500/5 to-cyan-500/5 border-cyan-500/20 text-cyan-400" 
                        },
                        { 
                          id: "PHOTO", 
                          icon: "📸", 
                          name: "Star Creator", 
                          desc: "Take a beautiful snapshot with emoji filters!", 
                          color: "from-pink-500/5 to-rose-500/5 border-rose-500/20 text-rose-400" 
                        },
                        { 
                          id: "MAP", 
                          icon: "🗺️", 
                          name: "Magical Explorer", 
                          desc: "Visit coordinates across the magical universe!", 
                          color: "from-amber-500/5 to-orange-500/5 border-orange-500/20 text-orange-400" 
                        },
                        { 
                          id: "SFX", 
                          icon: "🎹", 
                          name: "Sound Pioneer", 
                          desc: "Play custom melodies on the toybox piano!", 
                          color: "from-purple-500/5 to-indigo-500/5 border-indigo-500/20 text-indigo-400" 
                        },
                        { 
                          id: "STORY", 
                          icon: "📚", 
                          name: "Folk Storyteller", 
                          desc: "Listen to story, fairy tales and magical narration!", 
                          color: "from-emerald-500/5 to-teal-500/5 border-emerald-500/20 text-emerald-400" 
                        },
                      ].map((badge) => {
                        const isUnlocked = earnedBadges.includes(badge.id);
                        return (
                          <div 
                            key={badge.id}
                            className={`p-2 border rounded-xl flex items-center space-x-2 transition-all text-left bg-gradient-to-br relative overflow-hidden group ${
                              isUnlocked 
                                ? `${badge.color} shadow-[0_4px_15px_rgba(244,63,94,0.02)]` 
                                : "from-black/10 to-black/20 border-zinc-900 text-zinc-550"
                            }`}
                          >
                            <div className={`text-xl transition-transform duration-500 ${isUnlocked ? "group-hover:scale-125 group-hover:rotate-12" : "grayscale opacity-30"}`}>
                              {badge.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-mono text-[6px] uppercase tracking-wider block text-zinc-500">
                                {isUnlocked ? "✦ UNLOCKED" : "🔒 LOCKED"}
                              </span>
                              <h5 className={`font-sans text-[8.5px] font-bold truncate ${isUnlocked ? "text-zinc-200" : "text-zinc-500"}`}>
                                {badge.name}
                              </h5>
                              <p className="text-[7.5px] text-zinc-450 leading-tight mt-0.5 line-clamp-1">
                                {badge.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Piano Keyboard toy block */}
                  <div className="space-y-1.5 shrink-0 bg-[#0c0c0e] border border-zinc-900 p-3 rounded-2xl">
                    <div className="flex justify-between items-center text-[7px] font-mono text-zinc-550 uppercase tracking-widest pl-1">
                      <span>🎹 INTERACTIVE MELODY PIANO</span>
                      <span className="text-[#f59e0b] animate-pulse">TAP NOTES TO UNLOCK BADGE!</span>
                    </div>

                    <div className="grid grid-cols-7 gap-1 pt-1.5">
                      {[
                        { note: "C", freq: 261.63, color: "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20" },
                        { note: "D", freq: 293.66, color: "bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20" },
                        { note: "E", freq: 329.63, color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20" },
                        { note: "F", freq: 349.23, color: "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20" },
                        { note: "G", freq: 392.00, color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20" },
                        { note: "A", freq: 440.00, color: "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20" },
                        { note: "B", freq: 493.88, color: "bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20" }
                      ].map((item, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            playSfx(item.freq, "triangle", 0.04, 0.45);
                            if (!earnedBadges.includes("SFX")) {
                              const newList = [...earnedBadges, "SFX"];
                              saveBadges(newList);
                              // Play mini unlock sound sequence delayed
                              setTimeout(() => {
                                playSfx(523.25, "sine", 0.02, 0.15);
                                playSfx(659.25, "sine", 0.02, 0.15);
                                playSfx(783.99, "sine", 0.02, 0.15);
                                playSfx(1046.5, "sine", 0.03, 0.35);
                              }, 500);
                            }
                          }}
                          className={`py-6 border rounded-lg text-center font-mono font-bold text-[11px] uppercase transition-all duration-150 active:scale-90 select-none cursor-pointer ${item.color}`}
                        >
                          {item.note}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Safari toy footer */}
                  <div className="border-t border-zinc-900/40 pt-2 shrink-0 select-none">
                    <div className="flex items-center justify-between text-[7px] font-mono text-zinc-550 uppercase tracking-widest">
                      <span>CHESTS_FOUND: {chestOpenedCount} // TOYBOX V1</span>
                      <span>STATUS: EXPLORER_LEGEND ✨</span>
                    </div>
                  </div>
                </div>
              ) : (() => {
                const activeAsset = (currentFinancialTab === "STOCKS" ? STOCKS_DATA : CRYPTO_DATA).find(a => a.id === currentAssetId) || (currentFinancialTab === "STOCKS" ? STOCKS_DATA[0] : CRYPTO_DATA[0]);
                
                // SVG Price History Coordinates calculation
                const chartWidth = 280;
                const chartHeight = 90;
                const paddingX = 12;
                const paddingY = 12;
                
                const pricesArr = activeAsset ? activeAsset.history : [100, 101, 99, 102, 100];
                const minVal = Math.min(...pricesArr);
                const maxVal = Math.max(...pricesArr);
                const range = maxVal - minVal || 1;
                
                const points = pricesArr.map((val, idx) => {
                  const x = paddingX + (idx / (pricesArr.length - 1)) * (chartWidth - paddingX * 2);
                  const y = (chartHeight - paddingY) - ((val - minVal) / range) * (chartHeight - paddingY * 2);
                  return { x, y, value: val };
                });
                
                const pathData = points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
                const areaData = `${pathData} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`;
                
                const isPositive = activeAsset ? activeAsset.change >= 0 : true;
                const strokeColor = isPositive ? "#10b981" : "#f43f5e"; // emerald-500 or rose-500
                const fillColor = isPositive ? "rgba(16, 185, 129, 0.08)" : "rgba(244, 63, 94, 0.08)";
                const glowFilter = isPositive ? "drop-shadow(0 0 4px rgba(16, 185, 129, 0.5))" : "drop-shadow(0 0 4px rgba(244, 63, 94, 0.5))";

                return (
                  <div className="space-y-3.5 flex flex-col h-full justify-between">
                    {/* 4-way Segmented Control Tabs */}
                    <div className="flex bg-[#070709] p-0.5 rounded-xl border border-zinc-900 grid grid-cols-4 gap-0.5 text-center shrink-0">
                      <button
                        type="button"
                        onClick={() => setCurrentFinancialTab("LEDGER")}
                        className={`py-1 rounded text-center cursor-pointer transition-all ${
                          currentFinancialTab === "LEDGER"
                            ? "bg-amber-500/10 text-amber-500 font-bold border border-amber-500/15"
                            : "text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center py-0.5">
                          <DollarSign className="w-3 h-3 mb-0.5" />
                          <span className="text-[7.5px] font-mono tracking-wide">LEDGER</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentFinancialTab("STOCKS")}
                        className={`py-1 rounded text-center cursor-pointer transition-all ${
                          currentFinancialTab === "STOCKS"
                            ? "bg-amber-500/10 text-amber-500 font-bold border border-amber-500/15"
                            : "text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center py-0.5">
                          <Briefcase className="w-3 h-3 mb-0.5" />
                          <span className="text-[7.5px] font-mono tracking-wide">STOCKS</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentFinancialTab("CRYPTO")}
                        className={`py-1 rounded text-center cursor-pointer transition-all ${
                          currentFinancialTab === "CRYPTO"
                            ? "bg-amber-500/10 text-amber-500 font-bold border border-amber-500/15"
                            : "text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center py-0.5">
                          <Coins className="w-3 h-3 mb-0.5" />
                          <span className="text-[7.5px] font-mono tracking-wide">CRYPTO</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentFinancialTab("INTEL")}
                        className={`py-1 rounded text-center cursor-pointer transition-all ${
                          currentFinancialTab === "INTEL"
                            ? "bg-amber-500/10 text-amber-500 font-bold border border-amber-500/15"
                            : "text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center py-0.5">
                          <Newspaper className="w-3 h-3 mb-0.5" />
                          <span className="text-[7.5px] font-mono tracking-wide">INTEL</span>
                        </div>
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar select-none pr-0.5">
                      {currentFinancialTab === "LEDGER" && (
                        <div className="space-y-3.5 flex flex-col h-full justify-between text-left">
                          {/* Balances summary */}
                          <div className="grid grid-cols-3 gap-2 bg-[#09090c]/80 p-3 rounded-2xl border border-zinc-900/50 text-left">
                            <div className="space-y-0.5">
                              <span className="font-mono text-[7px] text-zinc-600 uppercase tracking-widest block">CREDITS IN</span>
                              <span className="text-xs font-mono font-bold text-emerald-400">+${totalIn.toFixed(2)}</span>
                            </div>
                            <div className="space-y-0.5">
                              <span className="font-mono text-[7px] text-zinc-600 uppercase tracking-widest block">DEBIT FLOW</span>
                              <span className="text-xs font-mono font-bold text-red-400">-${totalOut.toFixed(2)}</span>
                            </div>
                            <div className="space-y-0.5">
                              <span className="font-mono text-[7px] text-zinc-600 uppercase tracking-widest block">NET_RESERVE</span>
                              <span className={`text-xs font-mono font-bold ${netBalance >= 0 ? "text-amber-500" : "text-red-450"}`}>
                                {netBalance < 0 ? "-" : ""}${Math.abs(netBalance).toFixed(2)}
                              </span>
                            </div>
                          </div>

                          {/* Enroll telemetry form inline */}
                          <form onSubmit={handleAddFinanceSubmit} className="bg-zinc-950/40 rounded-xl border border-zinc-900/85 p-2.5 space-y-2">
                            <div className="flex justify-between items-center">
                              <p className="font-mono text-[7px] text-zinc-400 uppercase tracking-widest">MANUALLY ENROLL TELEMETRY DEBIT</p>
                              <span className="text-[6.5px] font-mono text-zinc-550">NOMINAL</span>
                            </div>
                            
                            <div className="flex gap-2.5">
                              <input 
                                type="text"
                                value={financeDesc}
                                onChange={(e) => setFinanceDesc(e.target.value)}
                                placeholder="Description (e.g. Server compute rent)"
                                required
                                className="flex-1 text-[10.5px] font-sans bg-[#0c0c0e] border border-zinc-900 w-full rounded-lg px-2.5 py-1 text-zinc-200 placeholder-zinc-550 outline-none focus:border-zinc-800 transition-colors"
                              />

                              <div className="relative w-20 shrink-0">
                                <DollarSign className="w-2.5 h-2.5 text-zinc-550 absolute left-2 top-1/2 -translate-y-1/2" />
                                <input 
                                  type="number"
                                  step="0.01"
                                  required
                                  value={financeAmount}
                                  onChange={(e) => setFinanceAmount(e.target.value)}
                                  placeholder="0.00"
                                  className="w-full text-[10.5px] font-mono bg-[#0c0c0e] border border-zinc-900 rounded-lg pl-4.5 pr-2 py-1 text-zinc-200 placeholder-zinc-550 outline-none focus:border-zinc-800 transition-colors text-right"
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-2 pt-0.5">
                              {/* Flow toggler */}
                              <div className="flex gap-0.5 bg-black/60 p-0.5 rounded-lg border border-zinc-900/60 shrink-0 select-none">
                                <button
                                  type="button"
                                  onClick={() => setFinanceType("spend")}
                                  className={`px-2 py-0.5 text-[7.5px] font-mono rounded tracking-wider cursor-pointer uppercase ${
                                    financeType === "spend" 
                                      ? "bg-red-950/20 text-red-400 border border-red-950/20" 
                                      : "text-zinc-550 hover:text-zinc-350"
                                  }`}
                                >
                                  SPEND
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setFinanceType("income")}
                                  className={`px-2 py-0.5 text-[7.5px] font-mono rounded tracking-wider cursor-pointer uppercase ${
                                    financeType === "income" 
                                      ? "bg-emerald-950/20 text-emerald-400 border border-emerald-950/20" 
                                      : "text-zinc-550 hover:text-zinc-350"
                                  }`}
                                >
                                  INCOME
                                </button>
                              </div>

                              {/* Category selector */}
                              <select
                                value={financeCategory}
                                onChange={(e) => setFinanceCategory(e.target.value)}
                                className="bg-[#0b0b0d] text-[9px] font-mono text-zinc-400 border border-zinc-900 rounded px-1.5 py-1 outline-none cursor-pointer focus:border-zinc-800 select-none"
                              >
                                <option value="Gear">GEAR</option>
                                <option value="Food">FOOD</option>
                                <option value="Travel">TRAVEL</option>
                                <option value="Servers">SERVERS</option>
                                <option value="Services">MEMORIES</option>
                                <option value="Other">OTHER</option>
                              </select>

                              {/* Enroller button */}
                              <button
                                type="submit"
                                className="px-3.5 py-1 text-[8.5px] font-mono tracking-widest font-bold bg-[#f59e0b] hover:bg-amber-600 text-black rounded cursor-pointer transition-colors uppercase"
                              >
                                ENROLL
                              </button>
                            </div>
                          </form>

                          {/* Historical logs list */}
                          <div className="space-y-1.5 flex-1 select-none pt-1">
                            <div className="flex justify-between items-center text-[7px] font-mono text-zinc-500 uppercase tracking-widest">
                              <span>CHRONOLOGICAL TRANSACTION LOGS Ledger</span>
                              <button 
                                type="button"
                                onClick={onClearTransactions}
                                className="hover:text-red-400 cursor-pointer font-bold transition-all uppercase"
                                title="Delete entire balance index"
                              >
                                [ PURGE LEDGER ]
                              </button>
                            </div>

                            <div className="space-y-1.5 max-h-[18vh] overflow-y-auto custom-scrollbar pr-0.5">
                              {transactions.length === 0 ? (
                                <div className="text-center py-6 bg-zinc-950/15 border border-zinc-900/50 rounded-xl">
                                  <p className="text-[7.5px] font-mono text-zinc-500 uppercase tracking-widest">LEDGER CONSOLE VACANT</p>
                                  <p className="text-[8px] font-sans text-zinc-400 leading-normal px-4">
                                    Prompt Sunny dynamically (e.g. "I spent $12 on servers") or fill in form above.
                                  </p>
                                </div>
                              ) : (
                                transactions.map((t) => (
                                  <div 
                                    key={t.id}
                                    className="bg-[#09090c]/70 border border-zinc-900/60 p-2 rounded-xl flex items-center justify-between text-left group hover:border-zinc-800 transition-colors"
                                  >
                                    <div className="space-y-0.5">
                                      <p className="font-sans text-[10.5px] font-medium text-zinc-200 leading-none">{t.description}</p>
                                      <div className="flex items-center space-x-1.5 text-[7px] font-mono text-zinc-500 uppercase">
                                        <span>{t.timestamp}</span>
                                        <span>•</span>
                                        <span className="bg-zinc-900/40 px-1 py-0.2 rounded border border-zinc-900">{t.category}</span>
                                      </div>
                                    </div>

                                    <div className="flex items-center space-x-2 shrink-0">
                                      {t.type === "spend" ? (
                                        <span className="text-xs font-mono font-medium text-red-400 flex items-center">
                                          <ArrowUpRight className="w-3 h-3 mr-0.5" />
                                          -${t.amount.toFixed(2)}
                                        </span>
                                      ) : (
                                        <span className="text-xs font-mono font-medium text-emerald-400 flex items-center">
                                          <ArrowDownLeft className="w-3 h-3 mr-0.5" />
                                          +${t.amount.toFixed(2)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {(currentFinancialTab === "STOCKS" || currentFinancialTab === "CRYPTO") && (
                        <div className="space-y-3.5 flex flex-col text-left">
                          {/* Active Asset Dashboard details with glowing Neon SVG timeline sparkline */}
                          {activeAsset && (
                            <div className="bg-[#09090c] rounded-2xl border border-zinc-900/80 p-3 space-y-2 text-left relative overflow-hidden">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="bg-zinc-900 px-1.5 py-0.5 rounded text-[8px] font-mono text-zinc-400 border border-zinc-800 uppercase tracking-wider">{activeAsset.symbol}</span>
                                  <h4 className="text-xs font-bold text-zinc-200 font-sans mt-1">{activeAsset.name}</h4>
                                </div>
                                <div className="text-right">
                                  <span className="text-xs md:text-sm font-mono font-bold text-zinc-100 block">
                                    ${activeAsset.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </span>
                                  <span className={`text-[8.5px] font-mono font-bold flex items-center justify-end ${isPositive ? "text-emerald-400" : "text-rose-500"}`}>
                                    {isPositive ? <ArrowUpRight className="w-2.5 h-2.5 mr-0.5" /> : <ArrowDownLeft className="w-2.5 h-2.5 mr-0.5" />}
                                    {isPositive ? "+" : ""}{activeAsset.change}%
                                  </span>
                                </div>
                              </div>

                              <p className="text-[9px] text-zinc-400 font-sans leading-relaxed pr-1 h-[27px] overflow-hidden line-clamp-2">
                                {activeAsset.desc}
                              </p>

                              {/* Interactive Neon area charting SVG line graph */}
                              <div className="bg-zinc-950/90 rounded-xl border border-zinc-900 p-1 relative h-28 flex items-center justify-center">
                                <svg width="100%" height="86" viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="overflow-visible">
                                  <defs>
                                    <linearGradient id="gradient-area" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor={strokeColor} stopOpacity={0.16} />
                                      <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
                                    </linearGradient>
                                  </defs>

                                  {/* Grid Dotted Lines */}
                                  <line x1="0" y1={chartHeight * 0.25} x2={chartWidth} y2={chartHeight * 0.25} stroke="#18181b" strokeWidth="0.8" strokeDasharray="3 3" />
                                  <line x1="0" y1={chartHeight * 0.5} x2={chartWidth} y2={chartHeight * 0.5} stroke="#18181b" strokeWidth="0.8" strokeDasharray="3 3" />
                                  <line x1="0" y1={chartHeight * 0.75} x2={chartWidth} y2={chartHeight * 0.75} stroke="#18181b" strokeWidth="0.8" strokeDasharray="3 3" />

                                  {/* Area underneath the line */}
                                  <path d={areaData} fill="url(#gradient-area)" />

                                  {/* Stroke path line */}
                                  <path 
                                    d={pathData} 
                                    fill="none" 
                                    stroke={strokeColor} 
                                    strokeWidth="1.8" 
                                    style={{ filter: glowFilter }} 
                                    strokeLinecap="round"
                                  />

                                  {/* Custom Grid borderlines */}
                                  <line x1={points[0].x} y1="0" x2={points[0].x} y2={chartHeight} stroke="#18181b" strokeWidth="0.8" strokeDasharray="2 2" />
                                  <line x1={points[points.length - 1].x} y1="0" x2={points[points.length - 1].x} y2={chartHeight} stroke="#18181b" strokeWidth="0.8" strokeDasharray="2 2" />

                                  {/* Interactive Point markers */}
                                  {points.map((p, i) => (
                                    <g key={i} className="group/g select-none">
                                      <circle 
                                        cx={p.x} 
                                        cy={p.y} 
                                        r={i === points.length - 1 ? "3" : "1.8"} 
                                        fill={i === points.length - 1 ? strokeColor : "#1c1c24"} 
                                        stroke={strokeColor}
                                        strokeWidth={i === points.length - 1 ? "1" : "0.5"}
                                      />
                                    </g>
                                  ))}
                                  
                                  {/* Pulse beacon radar dot on final pricing index */}
                                  <circle 
                                    cx={points[points.length - 1].x} 
                                    cy={points[points.length - 1].y} 
                                    r="6" 
                                    fill="none" 
                                    stroke={strokeColor} 
                                    strokeWidth="0.8" 
                                    className="animate-ping origin-center"
                                  />
                                </svg>

                                {/* Mini coordinate labels */}
                                <div className="absolute left-1.5 bottom-1 font-mono text-[6.5px] text-zinc-550 uppercase">7-DAY ANALYTICAL PROJECTION</div>
                                <div className="absolute right-1.5 bottom-1 font-mono text-[6.5px] text-emerald-500 uppercase tracking-tight">NOMINAL</div>
                              </div>
                            </div>
                          )}

                          {/* Horizontal scroll index ticker list */}
                          <div className="space-y-1">
                            <span className="font-mono text-[7px] text-zinc-500 uppercase tracking-widest block pl-1">INTELLECT SEGMENTS NOMINAL FEED</span>
                            <div className="flex overflow-x-auto gap-2 py-1 scrollbar-none snap-x select-none">
                              {(currentFinancialTab === "STOCKS" ? STOCKS_DATA : CRYPTO_DATA).map((item) => {
                                const activeSelCase = item.id === currentAssetId;
                                const itemIsPositive = item.change >= 0;
                                return (
                                  <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setCurrentAssetId(item.id)}
                                    className={`p-2 rounded-xl text-left border shrink-0 w-[115px] snap-start transition-all cursor-pointer ${
                                      activeSelCase 
                                        ? "bg-zinc-950 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.1)]" 
                                        : "bg-black/45 border-zinc-900/60 hover:bg-zinc-950/50 hover:border-zinc-850"
                                    }`}
                                  >
                                    <div className="flex justify-between items-center">
                                      <span className="font-mono text-[9.5px] font-bold text-zinc-200">{item.symbol}</span>
                                      <span className={`text-[8px] font-mono font-medium ${itemIsPositive ? "text-emerald-500" : "text-rose-500"}`}>
                                        {itemIsPositive ? "+" : ""}{item.change}%
                                      </span>
                                    </div>
                                    <div className="font-sans text-[8.5px] text-zinc-400 truncate text-left mt-0.5">{item.name}</div>
                                    <div className="font-mono text-[9px] font-bold text-zinc-100 text-left leading-none mt-1.5">
                                      ${item.price.toLocaleString("en-US", { maximumFractionDigits: item.price > 10 ? 2 : 3 })}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      {currentFinancialTab === "INTEL" && (
                        <div className="space-y-2.5 flex flex-col text-left">
                          <span className="font-mono text-[7px] text-zinc-500 uppercase tracking-widest block pl-1">PRIORITY INTEL FINANCIAL FEEDS</span>
                          <div className="space-y-2 max-h-[44vh] overflow-y-auto custom-scrollbar pr-0.5">
                            {INTEL_NEWS_DATA.map((news) => (
                              <div 
                                key={news.id}
                                className="bg-[#09090c] border border-zinc-900/75 hover:border-zinc-800 p-2.5 rounded-xl text-left space-y-1 transition-all"
                              >
                                <div className="flex justify-between items-center text-[7px] font-mono text-amber-500/90 uppercase tracking-wider">
                                  <span>{news.source}</span>
                                  <span className="text-zinc-500">{news.time}</span>
                                </div>
                                <h5 className="font-sans text-[10.5px] font-bold text-zinc-200 leading-tight">{news.title}</h5>
                                <p className="font-sans text-[9px] text-zinc-400 leading-normal line-clamp-2 md:line-clamp-none">
                                  {news.summary}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Status bar */}
                    <div className="border-t border-zinc-900/50 pt-2 shrink-0 select-none">
                      <div className="flex items-center justify-between text-[7px] font-mono text-zinc-550 uppercase tracking-widest">
                        <span>SYSTEM: NOMINAL // ACTIVES</span>
                        <span>NET_CORE: GREEN_CAPS</span>
                      </div>
                    </div>
                  </div>
                );
              })())}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
