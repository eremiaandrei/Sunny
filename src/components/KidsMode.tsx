import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, animate } from "motion/react";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Volume2, 
  VolumeX, 
  Plus, 
  Trash2, 
  X, 
  FolderOpen, 
  Archive,
  Terminal,
  Layers,
  Sparkles,
  Globe,
  Play,
  Tv,
  FileText,
  Monitor,
  Sliders,
  ShoppingBag,
  LayoutGrid,
  Paperclip,
  File,
  ArrowUp,
  Baby,
  BookOpen,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Minus
} from "lucide-react";
import { ChatMessage, ChatSession, AttachedFile } from "../types";
import ConsciousnessCore, { FormationState } from "./ConsciousnessCore";
import ProjectionLens, { ProjectionType } from "./ProjectionLens";
import ActiveWidgets, { Transaction } from "./ActiveWidgets";
import { piperEngine, PIPER_PRESETS } from "../lib/piperEngine";

// Modular draggable viewport wrapper for independent spatial projections
function DraggableProjection({
  type,
  query,
  isLeft,
  coord,
  isFullScreen,
  onToggleFullScreen,
  onClose,
  onMinimize,
  isKidsMode,
  lastActivated,
  setLastActivated,
  isMobile,
  getPlacementClass
}: {
  type: ProjectionType;
  query: string;
  isLeft: boolean;
  coord: { x: number; y: number };
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
  onClose: () => void;
  onMinimize: () => void;
  isKidsMode?: boolean;
  lastActivated: string;
  setLastActivated: (val: any) => void;
  isMobile: boolean;
  getPlacementClass: (type: string) => string;
}) {
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  useEffect(() => {
    if (isFullScreen) {
      animate(dragX, 0, { type: "spring", damping: 30, stiffness: 200 });
      animate(dragY, 0, { type: "spring", damping: 30, stiffness: 200 });
    }
  }, [isFullScreen, dragX, dragY]);

  useEffect(() => {
    dragX.set(0);
    dragY.set(0);
  }, [type]);

  return (
    <motion.div
      key={type}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35 }}
      drag={!isFullScreen}
      dragMomentum={false}
      dragElastic={0.06}
      style={{
        x: dragX,
        y: dragY,
      }}
      onPointerDown={() => setLastActivated(type)}
      className={`fixed ${
        isFullScreen
          ? lastActivated === type ? "z-45" : "z-35"
          : lastActivated === type ? "z-40" : "z-30"
      } pointer-events-auto select-none ${getPlacementClass(type)} flex items-center justify-center`}
    >
      <ProjectionLens
        type={type}
        query={query}
        originX={coord.x}
        originY={coord.y}
        isLeft={isLeft}
        isFullScreen={isFullScreen}
        onToggleFullScreen={onToggleFullScreen}
        onClose={onClose}
        onMinimize={onMinimize}
        isKidsMode={isKidsMode}
      />
    </motion.div>
  );
}

interface KidsModeProps {
  onExit: () => void;
}

export default function KidsMode({ onExit }: KidsModeProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");

  const [isThinking, setIsThinking] = useState(false);
  const [currentUtc, setCurrentUtc] = useState("");
  
  // High-fidelity sector and particulate states
  const [activeFormation, setActiveFormation] = useState<FormationState>("CONSTELLATION");
  const [typingExcitement, setTypingExcitement] = useState(0);

  // Voice & Vision States
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechErrorMsg, setSpeechErrorMsg] = useState<string | null>(null);
  const [isAudioFeedbackActive, setIsAudioFeedbackActive] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Persistent cognitive session storage vectors
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isMemoryPanelOpen, setIsMemoryPanelOpen] = useState(false);
  const [confirmPurge, setConfirmPurge] = useState(false);

  // Holographic OS Spatial Projections State
  const [activeProjection, setActiveProjection] = useState<{ type: ProjectionType; query: string } | null>(null);
  const [isProjectionMenuOpen, setIsProjectionMenuOpen] = useState(false);
  const [isProjectionFullScreen, setIsProjectionFullScreen] = useState(false);
  const [lastActivated, setLastActivated] = useState<string>("PROJECTION");

  const [runningProjections, setRunningProjections] = useState<Record<string, { type: ProjectionType; query: string; isMinimized: boolean }>>({});

  useEffect(() => {
    if (activeProjection) {
      setRunningProjections(prev => ({
        ...prev,
        [activeProjection.type]: {
          type: activeProjection.type,
          query: activeProjection.query,
          isMinimized: false
        }
      }));
    }
  }, [activeProjection]);

  const handleMinimizeProjection = (type: ProjectionType) => {
    setRunningProjections(prev => {
      if (!prev[type]) return prev;
      return {
        ...prev,
        [type]: {
          ...prev[type],
          isMinimized: true
        }
      };
    });
    if (activeProjection?.type === type) {
      setActiveProjection(null);
    }
  };

  const handleCloseProjection = (type: ProjectionType) => {
    setRunningProjections(prev => {
      const copy = { ...prev };
      delete copy[type];
      return copy;
    });
    if (activeProjection?.type === type) {
      setActiveProjection(null);
    }
  };

  const handleRestoreProjection = (type: ProjectionType) => {
    setRunningProjections(prev => {
      if (!prev[type]) return prev;
      return {
        ...prev,
        [type]: {
          ...prev[type],
          isMinimized: false
        }
      };
    });
    setActiveProjection({
      type,
      query: runningProjections[type]?.query || ""
    });
    setLastActivated(type);
  };

  const projDragX = useMotionValue(0);
  const projDragY = useMotionValue(0);

  useEffect(() => {
    if (isProjectionFullScreen) {
      animate(projDragX, 0, { type: "spring", damping: 30, stiffness: 200 });
      animate(projDragY, 0, { type: "spring", damping: 30, stiffness: 200 });
    }
  }, [isProjectionFullScreen, projDragX, projDragY]);

  useEffect(() => {
    projDragX.set(0);
    projDragY.set(0);
    setIsProjectionFullScreen(false);
  }, [activeProjection?.type]);

  const [activeTheme, setActiveTheme] = useState<string>(() => {
    return localStorage.getItem("system_core_theme") || "AMBER";
  });

  const [isMobile, setIsMobile] = useState(false);

  // Teacher Luna letter modal states
  const [showLunaLetterPopup, setShowLunaLetterPopup] = useState(false);
  const [isReadingLunaLetter, setIsReadingLunaLetter] = useState(false);

  const getExplorerName = (): string => {
    try {
      const raw = localStorage.getItem("kids_explorer_profile");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.name) {
          return parsed.name;
        }
      }
    } catch (e) {
      console.warn("Could not read explorer profile:", e);
    }
    return "David";
  };

  useEffect(() => {
    try {
      const lastShownDate = localStorage.getItem("kids_luna_letter_last_shown_date");
      const today = new Date().toDateString();
      if (lastShownDate !== today) {
        const timer = setTimeout(() => {
          setShowLunaLetterPopup(true);
          playPingSound("wakeup");
          localStorage.setItem("kids_luna_letter_last_shown_date", today);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.warn("Could not run first-time today welcome flow:", e);
    }
  }, []);

  // File Attachment & Drag-and-Drop States
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFileList = (files: FileList) => {
    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith("image/");
      const reader = new FileReader();

      if (isImage) {
        unlockBadge("PHOTO", "Art Explorer", "🎨");
        reader.onload = (e) => {
          if (e.target?.result) {
            setAttachedFiles((prev) => [
              ...prev,
              {
                id: Math.random().toString(),
                name: file.name,
                size: file.size,
                type: file.type,
                isImage: true,
                base64: e.target.result as string,
              },
            ]);
          }
        };
        reader.readAsDataURL(file);
      } else {
        reader.onload = (e) => {
          if (e.target?.result) {
            setAttachedFiles((prev) => [
              ...prev,
              {
                id: Math.random().toString(),
                name: file.name,
                size: file.size,
                type: file.type,
                isImage: false,
                textContent: e.target.result as string,
              },
            ]);
          }
        };
        reader.readAsText(file);
      }
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const removeAttachedFile = (id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleDroppedFiles = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFileList(e.dataTransfer.files);
    }
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleThemeChange = () => {
      setActiveTheme(localStorage.getItem("system_core_theme") || "AMBER");
    };
    window.addEventListener("sys-theme-changed", handleThemeChange);
    return () => window.removeEventListener("sys-theme-changed", handleThemeChange);
  }, []);

  // Kids Badge Achievement Tracker States
  const [earnedBadges, setEarnedBadges] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem("kids_earned_badges_v1");
      return raw ? JSON.parse(raw) : ["MATH"]; // starts with one fun badge to play with
    } catch {
      return ["MATH"];
    }
  });

  const [lastUnlockedBadge, setLastUnlockedBadge] = useState<{ id: string; name: string; icon: string } | null>(null);
  const [showUnlockToast, setShowUnlockToast] = useState(false);

  // Core helper to unlock achievements
  const unlockBadge = (badgeId: string, badgeName: string, badgeIcon: string) => {
    if (earnedBadges.includes(badgeId)) return;
    const newList = [...earnedBadges, badgeId];
    setEarnedBadges(newList);
    localStorage.setItem("kids_earned_badges_v1", JSON.stringify(newList));
    window.dispatchEvent(new CustomEvent("kids-badges-updated", { detail: newList }));

    setLastUnlockedBadge({ id: badgeId, name: badgeName, icon: badgeIcon });
    setShowUnlockToast(true);

    // Play visual celebratory sound
    try {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = "sine";
        osc2.type = "sine";
        
        osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc1.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.3); // C6
        osc2.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
        osc2.frequency.exponentialRampToValueAtTime(1318.51, ctx.currentTime + 0.3); // E6

        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 0.6);
        osc2.stop(ctx.currentTime + 0.6);
      }
    } catch (e) {
      console.warn("Chime failed", e);
    }
  };

  // Keep badges list synchronized across components
  useEffect(() => {
    const handleBadgeSync = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && Array.isArray(detail)) {
        // Find newly unlocked ones to display the toast
        const newlyUnlocked = detail.filter((id) => !earnedBadges.includes(id));
        setEarnedBadges(detail);
        if (newlyUnlocked.length > 0) {
          const badgeDetails: Record<string, { name: string; icon: string }> = {
            MATH: { name: "Calculation Guru", icon: "🧮" },
            PHOTO: { name: "Star Creator / Art Explorer", icon: "📸" },
            MAP: { name: "Magical Explorer", icon: "🗺️" },
            SFX: { name: "Sound Pioneer", icon: "🎹" },
            STORY: { name: "Folk Storyteller", icon: "📚" }
          };
          const firstNew = newlyUnlocked[0];
          const info = badgeDetails[firstNew] || { name: "Shiny Achievement", icon: "🏅" };
          setLastUnlockedBadge({ id: firstNew, name: info.name, icon: info.icon });
          setShowUnlockToast(true);
        }
      }
    };
    window.addEventListener("kids-badges-updated", handleBadgeSync);
    return () => window.removeEventListener("kids-badges-updated", handleBadgeSync);
  }, [earnedBadges]);

  // Active Widgets Panel States
  const [isWidgetsMenuOpen, setIsWidgetsMenuOpen] = useState(false);
  const [activeWidgetType, setActiveWidgetType] = useState<"WEATHER" | "CAMERA" | "MAPS" | "FINANCIAL" | null>(null);
  const [weatherLocation, setWeatherLocation] = useState("San Francisco, CA");
  const [mapAddress, setMapAddress] = useState("Earth");
  const [runningWidgets, setRunningWidgets] = useState<Record<string, { type: "WEATHER" | "CAMERA" | "MAPS" | "FINANCIAL"; query: string; isMinimized: boolean }>>({});

  useEffect(() => {
    if (activeWidgetType) {
      setRunningWidgets(prev => ({
        ...prev,
        [activeWidgetType]: {
          type: activeWidgetType,
          query: activeWidgetType === "MAPS" ? mapAddress : (activeWidgetType === "WEATHER" ? weatherLocation : "Workspace Active"),
          isMinimized: false
        }
      }));
    }
  }, [activeWidgetType, mapAddress, weatherLocation]);

  const handleMinimizeWidget = (type: "WEATHER" | "CAMERA" | "MAPS" | "FINANCIAL") => {
    setRunningWidgets(prev => {
      if (!prev[type]) return prev;
      return {
        ...prev,
        [type]: {
          ...prev[type],
          isMinimized: true
        }
      };
    });
    if (activeWidgetType === type) {
      setActiveWidgetType(null);
    }
  };

  const handleCloseWidget = (type: "WEATHER" | "CAMERA" | "MAPS" | "FINANCIAL") => {
    setRunningWidgets(prev => {
      const copy = { ...prev };
      delete copy[type];
      return copy;
    });
    if (activeWidgetType === type) {
      setActiveWidgetType(null);
    }
  };

  const handleRestoreWidget = (type: "WEATHER" | "CAMERA" | "MAPS" | "FINANCIAL") => {
    setRunningWidgets(prev => {
      if (!prev[type]) return prev;
      return {
        ...prev,
        [type]: {
          ...prev[type],
          isMinimized: false
        }
      };
    });
    setActiveWidgetType(type);
    setLastActivated("WIDGET");
  };

  // Financial Sub-tabs Coordinator
  const [financialSubTab, setFinancialSubTab] = useState<"LEDGER" | "STOCKS" | "CRYPTO" | "INTEL">("LEDGER");
  const [selectedAssetId, setSelectedAssetId] = useState<string>("BTC");

  // Focus orchestration layer - bring last triggered panel to top
  useEffect(() => {
    if (activeProjection) {
      setLastActivated("PROJECTION");
    }
  }, [activeProjection]);

  useEffect(() => {
    if (activeWidgetType) {
      setLastActivated("WIDGET");
    }
  }, [activeWidgetType]);

  // Auto-coordination on mobile screen widths to prevent window overlap
  useEffect(() => {
    if (isMobile && activeProjection) {
      setActiveWidgetType(null);
    }
  }, [activeProjection, isMobile]);

  useEffect(() => {
    if (isMobile && activeWidgetType) {
      setActiveProjection(null);
    }
  }, [activeWidgetType, isMobile]);

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const stored = localStorage.getItem("system_core_transactions");
      return stored ? JSON.parse(stored) : [
        { id: "1", amount: 12.50, description: "Direct Core Fuel (Coffee)", category: "Food", type: "spend", timestamp: "06/17 08:30" },
        { id: "2", amount: 250.00, description: "Aesthetic compute node rent", category: "Servers", type: "income", timestamp: "06/17 07:15" },
        { id: "3", amount: 49.99, description: "Cognitive HUD visor repair", category: "Gear", type: "spend", timestamp: "06/16 18:45" }
      ];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("system_core_transactions", JSON.stringify(transactions));
  }, [transactions]);

  const handleAddTransaction = (amount: number, description: string, category: string, type: "spend" | "income") => {
    const newTx: Transaction = {
      id: Math.random().toString(),
      amount,
      description,
      category,
      type,
      timestamp: new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" }) + " " + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const handleClearTransactions = () => {
    setTransactions([]);
  };

  const getVisualizerColor = () => {
    switch (activeTheme) {
      case "EMERALD":
        return "bg-emerald-400 shadow-[0_0_8px_rgba(16,235,115,0.4)]";
      case "CYBERPUNK":
        return "bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.4)]";
      case "SLATE":
        return "bg-slate-400 shadow-[0_0_8px_rgba(148,163,184,0.3)]";
      case "AMBER":
      default:
        return "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]";
    }
  };

  useEffect(() => {
    setIsProjectionFullScreen(false);
  }, [activeProjection?.type]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Sunny custom voice hands-free coordination engine
  const [isSunnyWoken, setIsSunnyWoken] = useState(false);
  const isSunnyWokenRef = useRef(false);
  const isListeningRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const isThinkingRef = useRef(false);
  const autoSendTimeoutRef = useRef<any>(null);
  const latestMessageRef = useRef("");
  const activeSpokenTextRef = useRef("");
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    isSunnyWokenRef.current = isSunnyWoken;
  }, [isSunnyWoken]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    isThinkingRef.current = isThinking;
  }, [isThinking]);

  useEffect(() => {
    latestMessageRef.current = userInput;
  }, [userInput]);

  // Clean-up any pending auto send timeouts on unmount
  useEffect(() => {
    return () => {
      if (autoSendTimeoutRef.current) {
        clearTimeout(autoSendTimeoutRef.current);
      }
    };
  }, []);

  const playPingSound = (type: "wakeup" | "think" | "success" | "neutral" = "neutral") => {
    try {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      if (type === "wakeup") {
        // High-fidelity futuristic double rise chime (typical Sunny wake melody)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = "sine";
        osc2.type = "sine";
        
        osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc1.frequency.exponentialRampToValueAtTime(880.00, ctx.currentTime + 0.16); // A5
        osc2.frequency.setValueAtTime(440.00, ctx.currentTime); // A4
        osc2.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.16); // E5

        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 0.35);
        osc2.stop(ctx.currentTime + 0.35);
      } else if (type === "success") {
        // Completed sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.28);
      } else {
        // High discrete micro-HUD sound tick
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(783.99, ctx.currentTime); // G5
        gain.gain.setValueAtTime(0.02, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      }
    } catch (e) {
      console.warn("Web audio playback failed/blocked:", e);
    }
  };

  // Synchronize precise UTC ticks in header
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentUtc(now.toISOString().substring(11, 19) + " UTC");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Retrieve previous memories from client storage on startup
  useEffect(() => {
    try {
      const stored = localStorage.getItem("consciousness_sessions_kids");
      if (stored) {
        setSessions(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Local storage lookup failed:", e);
    }
  }, []);

  // Decay physical excitation ratio over time
  useEffect(() => {
    const interval = setInterval(() => {
      setTypingExcitement((prev) => {
        if (prev <= 0) return 0;
        return Math.max(0, prev - 0.08);
      });
    }, 80);
    return () => clearInterval(interval);
  }, []);

  // Smooth scroll to latest reflective statement
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Listen for historical inquiry recall events from ConsciousnessCore
  useEffect(() => {
    const handleRecall = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.text) {
        const fullText = customEvent.detail.text;
        
        let cleaned = fullText;
        if (fullText.includes("INQUIRY //")) {
          const parts = fullText.split(":");
          cleaned = parts.length > 1 ? parts.slice(1).join(":").trim() : fullText;
        } else if (fullText.startsWith('"') && fullText.endsWith('"')) {
          cleaned = fullText.slice(1, -1);
        } else if (fullText.includes("QUANTUM_STIMULATION_TOUCH_INPUT")) {
          return;
        } else if (fullText.includes("MATHEMATICAL_SINGULARITY_GRAVITY_PERTURBATION")) {
          cleaned = "Gravity singularity";
        }
        
        setUserInput(cleaned);
      }
    };

    window.addEventListener("recall-inquiry-memory", handleRecall);
    return () => {
      window.removeEventListener("recall-inquiry-memory", handleRecall);
    };
  }, []);

  // Handle Speech Recognition Web API (WebKit transition support)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const chunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += chunk;
          } else {
            interimTranscript += chunk;
          }
        }

        const combinedText = (finalTranscript || interimTranscript).trim();
        if (!combinedText) return;

        // If Sunny is currently speaking, check if the heard speech is just an echo of his own voice
        if (isSpeakingRef.current) {
          if (isSelfEcho(combinedText, activeSpokenTextRef.current)) {
            console.log("[Acoustic Echo Filter] Filtered out self-echo:", combinedText);
            return;
          } else {
            console.log("[Acoustic Interruption] User interrupted speech with:", combinedText);
            try {
              if (typeof window !== "undefined" && window.speechSynthesis) {
                window.speechSynthesis.cancel();
              }
            } catch (e) {
              console.log("SpeechSynthesis cancel skipped:", e);
            }
            setIsSpeaking(false);
            activeSpokenTextRef.current = "";
            activeUtteranceRef.current = null;
          }
        }

        const wakeRegex = /\b(hey\s+)?(sunny|suni|sonny|suny)\b/i;
        const hasWakeWord = wakeRegex.test(combinedText);

        if (hasWakeWord) {
          setIsSunnyWoken(true);
          setTypingExcitement(1.0);
          playPingSound("wakeup");

          const commandText = combinedText.replace(wakeRegex, "").replace(/^[,.\s]+/, "").trim();
          
          if (commandText.length > 0) {
            setUserInput(commandText);
            
            if (autoSendTimeoutRef.current) clearTimeout(autoSendTimeoutRef.current);
            autoSendTimeoutRef.current = setTimeout(() => {
              handleSendMessage(undefined, commandText);
              setIsSunnyWoken(false);
            }, 1400);
          } else {
            setUserInput("");
            
            if (autoSendTimeoutRef.current) clearTimeout(autoSendTimeoutRef.current);
            
            const greetings = [
              "Yes! I'm here and ready to help! 🪐",
              "Beep boop! Online and ready to zoom! 🚀 What should we do?",
              "Greetings, junior galaxy explorer! I'm here! ⭐",
              "Systems active! Let's explore the universe together! 🎨"
            ];
            const chosen = greetings[Math.floor(Math.random() * greetings.length)];
            speakTextReflections(chosen);

            // Keep woken state active for a 6-second window
            if (autoSendTimeoutRef.current) clearTimeout(autoSendTimeoutRef.current);
            autoSendTimeoutRef.current = setTimeout(() => {
              setIsSunnyWoken(false);
            }, 6000);
          }
        } else {
          // Process speech ONLY if the assistant is already in the woken state
          if (isSunnyWokenRef.current) {
            if (finalTranscript) {
              setUserInput((prev) => {
                const cleanedPrev = prev.trim();
                const cleanedFinal = finalTranscript.trim();
                return cleanedPrev ? cleanedPrev + " " + cleanedFinal : cleanedFinal;
              });
              setTypingExcitement((prev) => Math.min(1.0, prev + 0.35));

              if (autoSendTimeoutRef.current) clearTimeout(autoSendTimeoutRef.current);
              autoSendTimeoutRef.current = setTimeout(() => {
                const textToSend = latestMessageRef.current.trim();
                if (textToSend.length > 2) {
                  playPingSound("success");
                  handleSendMessage(undefined, textToSend);
                }
                setIsSunnyWoken(false); // Go back to sleep after sending
              }, 1700);
            }
          }
        }
      };

      rec.onerror = (err: any) => {
        const errorType = err.error || "";
        if (errorType !== "no-speech" && errorType !== "aborted") {
          console.warn("Speech recognition notice:", errorType);
          if (errorType === "not-allowed") {
            setSpeechErrorMsg("Mic access restricted in iframe. Click 'Open App' to run securely in a direct window.");
          } else if (errorType === "audio-capture") {
            setSpeechErrorMsg("No microphone hardware detected on this device.");
          } else {
            setSpeechErrorMsg(`Speech recognition ended: ${errorType}`);
          }
        }
        
        if (isListeningRef.current && errorType !== "not-allowed") {
          setTimeout(() => {
            if (isListeningRef.current) {
              try { rec.start(); } catch (_) {}
            }
          }, 1000);
        } else {
          setIsListening(false);
        }
      };

      rec.onend = () => {
        if (isListeningRef.current) {
          try {
            rec.start();
          } catch (e) {
            setTimeout(() => {
              if (isListeningRef.current) {
                try { rec.start(); } catch (_) {}
              }
            }, 800);
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = rec;
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
    setTypingExcitement((prev) => Math.min(1.0, prev + 0.28));
  };

  const toggleCameraCapability = () => {
    if (activeWidgetType === "CAMERA") {
      setActiveWidgetType(null);
      setIsCameraActive(false);
    } else {
      setIsWidgetsMenuOpen(true);
      setActiveWidgetType("CAMERA");
      setIsCameraActive(true);
    }
  };

  const captureSnapshot = (): string | null => {
    try {
      const activeVideo = document.querySelector("video");
      if (!activeVideo) return null;
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(activeVideo, 0, 0, 256, 256);
        return canvas.toDataURL("image/jpeg", 0.7);
      }
    } catch (err) {
      console.error("Snapshot extraction failed:", err);
    }
    return null;
  };

  const toggleSpeechRecognition = () => {
    setSpeechErrorMsg(null);
    if (!recognitionRef.current) {
      alert("Acoustic voice dictation is not supported inside this browser window environment.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      playPingSound("neutral");
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        playPingSound("wakeup");
      } catch (err) {
        console.error("Failed to start speech dictation:", err);
      }
    }
  };

  const toggleAudioFeedback = () => {
    if (isAudioFeedbackActive) {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      setIsAudioFeedbackActive(false);
    } else {
      setIsAudioFeedbackActive(true);
    }
  };

  const isSelfEcho = (transcribed: string, spoken: string): boolean => {
    const cleanStr = (str: string) => str.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
    const cleanSpoken = cleanStr(spoken);
    const cleanTrans = cleanStr(transcribed);
    
    if (!cleanTrans) return true;
    if (cleanSpoken.includes(cleanTrans)) return true;
    
    // Word overlap check (for slight transcription variations)
    const transWords = cleanTrans.split(" ");
    const spokenWords = cleanSpoken.split(" ");
    let matchCount = 0;
    for (const w of transWords) {
      if (spokenWords.includes(w)) matchCount++;
    }
    return (matchCount / transWords.length) >= 0.6;
  };

  const speakTextReflections = (text: string) => {
    if (!isAudioFeedbackActive) return;

    let printableText = text
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`[^`]+`/g, "")
      .replace(/[*_`#~]/g, "")
      .replace(/\[\w+:[^\]]+\]/g, "")
      .replace(/[-*]\s+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const storedPitch = parseFloat(localStorage.getItem("system_speak_pitch") || "1.0");
    const storedRateVal = parseFloat(localStorage.getItem("system_speak_rate_val") || "0.96");

    activeSpokenTextRef.current = printableText;

    // Check if Piper is active
    if (localStorage.getItem("system_speak_use_piper") === "true" && piperEngine.isLoaded()) {
      try {
        window.speechSynthesis?.cancel();
      } catch (e) {}

      piperEngine.speak(printableText, {
        rate: storedRateVal,
        pitch: storedPitch,
        onStart: () => setIsSpeaking(true),
        onEnd: () => {
          setIsSpeaking(false);
          activeSpokenTextRef.current = "";
        }
      });
      return;
    }

    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(printableText);
    activeUtteranceRef.current = utterance;
    
    const storedVoiceName = localStorage.getItem("system_speak_voice");
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = voices.find((v) => v.name === storedVoiceName);

    if (!selectedVoice) {
      selectedVoice = voices.find((v) => v.name.includes("Natural") && v.lang.startsWith("en")) ||
                      voices.find((v) => v.name.includes("Google US English") && v.lang.startsWith("en")) ||
                      voices.find((v) => v.name.includes("Samantha") && v.lang.startsWith("en")) ||
                      voices.find((v) => v.name.includes("Aria") && v.lang.startsWith("en")) ||
                      voices.find((v) => v.lang.startsWith("en") && v.name.includes("English")) ||
                      voices.find((v) => v.lang.startsWith("en")) ||
                      voices[0];
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.rate = storedRateVal;
    utterance.pitch = storedPitch;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      activeSpokenTextRef.current = "";
      activeUtteranceRef.current = null;
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      activeSpokenTextRef.current = "";
      activeUtteranceRef.current = null;
    };

    window.speechSynthesis.speak(utterance);
  };

  const speakLunaLetter = (text: string) => {
    const storedPitch = parseFloat(localStorage.getItem("system_speak_pitch") || "1.1");
    const storedRateVal = parseFloat(localStorage.getItem("system_speak_rate_val") || "0.95");

    setIsReadingLunaLetter(true);
    activeSpokenTextRef.current = text;

    if (localStorage.getItem("system_speak_use_piper") === "true" && piperEngine.isLoaded()) {
      try {
        window.speechSynthesis?.cancel();
      } catch (e) {}

      piperEngine.speak(text, {
        rate: storedRateVal,
        pitch: storedPitch,
        onStart: () => {
          setIsSpeaking(true);
          setIsReadingLunaLetter(true);
        },
        onEnd: () => {
          setIsSpeaking(false);
          setIsReadingLunaLetter(false);
          activeSpokenTextRef.current = "";
        }
      });
      return;
    }

    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    activeUtteranceRef.current = utterance;
    
    const storedVoiceName = localStorage.getItem("system_speak_voice");
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = voices.find((v) => v.name === storedVoiceName);

    if (!selectedVoice) {
      selectedVoice = voices.find((v) => v.name.includes("Natural") && v.lang.startsWith("en")) ||
                      voices.find((v) => v.name.includes("Google US English") && v.lang.startsWith("en")) ||
                      voices.find((v) => v.name.includes("Samantha") && v.lang.startsWith("en")) ||
                      voices.find((v) => v.name.includes("Aria") && v.lang.startsWith("en")) ||
                      voices.find((v) => v.lang.startsWith("en") && v.name.includes("English")) ||
                      voices.find((v) => v.lang.startsWith("en")) ||
                      voices[0];
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.rate = storedRateVal;
    utterance.pitch = storedPitch;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsReadingLunaLetter(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsReadingLunaLetter(false);
      activeSpokenTextRef.current = "";
      activeUtteranceRef.current = null;
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsReadingLunaLetter(false);
      activeSpokenTextRef.current = "";
      activeUtteranceRef.current = null;
    };

    window.speechSynthesis.speak(utterance);
  };

  const saveActiveSession = (currentMessages: ChatMessage[], activeId: string | null) => {
    if (currentMessages.length === 0) return activeId;

    let targetId = activeId;
    let isNew = false;
    if (!targetId) {
      targetId = "sector_kids_" + Math.random().toString(36).substring(2, 9);
      isNew = true;
    }

    let sessionTitle = currentMessages[0].text;
    if (sessionTitle.length > 32) {
      sessionTitle = sessionTitle.substring(0, 30) + "...";
    }
    const now = new Date();
    const timestampStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " // " + now.toLocaleDateString([], { month: "short", day: "numeric" });

    const updatedSession: ChatSession = {
      id: targetId,
      title: sessionTitle[0] === "“" ? sessionTitle : `“${sessionTitle}”`,
      timestamp: timestampStr,
      messages: currentMessages
    };

    setSessions((prev) => {
      let next = [...prev];
      if (isNew) {
        next = [updatedSession, ...next];
      } else {
        const idx = next.findIndex((s) => s.id === targetId);
        if (idx !== -1) {
          next[idx] = updatedSession;
        } else {
          next = [updatedSession, ...next];
        }
      }
      localStorage.setItem("consciousness_sessions_kids", JSON.stringify(next));
      return next;
    });

    return targetId;
  };

  const createNewSector = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setMessages([]);
    setCurrentSessionId(null);
    setUserInput("");
    setTypingExcitement(0.7);
    setIsMemoryPanelOpen(false);
  };

  const loadArchiveSession = (session: ChatSession) => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setMessages(session.messages);
    setCurrentSessionId(session.id);
    setIsMemoryPanelOpen(false);
    setTypingExcitement(0.85);
  };

  const clearSessionRecord = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions((prev) => {
      const next = prev.filter((s) => s.id !== sessionId);
      localStorage.setItem("consciousness_sessions_kids", JSON.stringify(next));
      return next;
    });

    if (currentSessionId === sessionId) {
      setMessages([]);
      setCurrentSessionId(null);
    }
  };

  const purgeAllMemorySectors = () => {
    if (!confirmPurge) {
      setConfirmPurge(true);
      setTimeout(() => {
        setConfirmPurge(false);
      }, 4000);
    } else {
      localStorage.removeItem("consciousness_sessions_kids");
      setSessions([]);
      setMessages([]);
      setCurrentSessionId(null);
      setIsMemoryPanelOpen(false);
      setConfirmPurge(false);
    }
  };

  const executeAgenticCommands = (text: string) => {
    if (!text) return;

    const regex = /\[([A-Z_]+)(?::\s*([^\]]+))?\]/gi;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const command = match[1].toUpperCase();
      const value = match[2] ? match[2].trim() : "";

      console.log(`[Kids Agent Action Triggered]: ${command} with parameter: "${value}"`);

      switch (command) {
        case "OPEN_WIDGET": {
          setIsWidgetsMenuOpen(true);
          const w = value.toUpperCase();
          if (w === "WEATHER" || w === "CAMERA" || w === "MAPS" || w === "FINANCIAL") {
            setActiveWidgetType(w as any);
          }
          break;
        }
        case "CLOSE_WIDGETS": {
          setIsWidgetsMenuOpen(false);
          setActiveWidgetType(null);
          break;
        }
        case "SET_WEATHER_LOCATION": {
          if (value) setWeatherLocation(value);
          break;
        }
        case "SET_MAP_ADDRESS": {
          if (value) setMapAddress(value);
          break;
        }
        case "SET_FINANCIAL_TAB": {
          const tab = value.toUpperCase();
          if (tab === "LEDGER" || tab === "STOCKS" || tab === "CRYPTO" || tab === "INTEL") {
            setFinancialSubTab(tab as any);
          }
          break;
        }
        case "SET_FINANCIAL_ASSET": {
          if (value) setSelectedAssetId(value.toUpperCase());
          break;
        }
        case "OPEN_PROJECTION": {
          const type = value.toUpperCase();
          if (type === "BROWSER" || type === "FILES" || type === "APPS" || type === "MARKET" || type === "SETTINGS") {
            setActiveProjection({ type: type as any, query: type === "BROWSER" ? "wikipedia.org" : "" });
          }
          break;
        }
        case "SET_BROWSER_URL": {
          if (value) {
            setActiveProjection(prev => {
              if (prev && prev.type === "BROWSER") {
                return { type: "BROWSER", query: value };
              } else {
                return { type: "BROWSER", query: value };
              }
            });
          }
          break;
        }
        case "CLOSE_PROJECTION": {
          setActiveProjection(null);
          break;
        }
        case "CHANGE_THEME": {
          const tName = value.toUpperCase();
          if (/AMBER|EMERALD|CYBERPUNK|SLATE/.test(tName)) {
            setActiveTheme(tName);
            localStorage.setItem("system_core_theme", tName);
            window.dispatchEvent(new Event("sys-theme-changed"));
          }
          break;
        }
        case "ADD_TRANSACTION": {
          try {
            const amountMatch = value.match(/Amount=([0-9.]+)/i);
            const descMatch = value.match(/Desc="([^"]+)"/i) || value.match(/Desc=([^,\]]+)/i);
            const catMatch = value.match(/Category="([^"]+)"/i) || value.match(/Category=([^,\]]+)/i);
            const typeMatch = value.match(/Type="([^"]+)"/i) || value.match(/Type=([^,\]]+)/i);

            const amount = amountMatch ? parseFloat(amountMatch[1]) : 1.0;
            const desc = descMatch ? descMatch[1] : "Direct core transaction";
            const cat = catMatch ? catMatch[1] : "Other";
            const typeVal = typeMatch ? typeMatch[1] : "spend";

            handleAddTransaction(amount, desc, cat, typeVal as any);
          } catch (e) {
            console.error("Failed to parse ADD_TRANSACTION command:", e);
          }
          break;
        }
        default:
          break;
      }
    }
  };

  const cleanSpeakText = (text: string) => {
    return text.replace(/\[[A-Z_]+(?::\s*[^\]]+)?\]/gi, "").trim();
  };

  const handleSendMessage = async (e?: React.FormEvent, overrideText?: string) => {
    if (e) e.preventDefault();
    const textToSend = (overrideText || userInput).trim();
    if (!textToSend || isThinking) return;

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    const currentText = textToSend;
    setUserInput("");
    setTypingExcitement(1.0);

    const lowercaseText = currentText.toLowerCase();

    // Kids Mode Achievement Badges check on message interactions
    if (/story|fairytale|book|tale|read|once upon|legend/i.test(lowercaseText)) {
      unlockBadge("STORY", "Folk Storyteller", "📚");
    }
    if (/draw|art|picture|paint|sketch|color|create|image|snapshot/i.test(lowercaseText)) {
      unlockBadge("PHOTO", "Art Explorer", "🎨");
    }
    if (/map|location|navigate|coordinate|earth|travel/i.test(lowercaseText)) {
      unlockBadge("MAP", "Magical Explorer", "🗺️");
    }
    if (/math|calc|count|number|solve|minus|add|multiply/i.test(lowercaseText)) {
      unlockBadge("MATH", "Calculation Guru", "🧮");
    }
    if (/music|piano|sound|note|song|melody|tune/i.test(lowercaseText)) {
      unlockBadge("SFX", "Sound Pioneer", "🎹");
    }

    if (lowercaseText.includes("weather") || lowercaseText.includes("forecast") || lowercaseText.includes("temperature")) {
      setIsWidgetsMenuOpen(true);
      setActiveWidgetType("WEATHER");
      const words = currentText.split(/\s+/);
      const inIndex = words.findIndex(w => w.toLowerCase() === "in" || w.toLowerCase() === "for");
      if (inIndex !== -1 && inIndex + 1 < words.length) {
        const potentialLocation = words.slice(inIndex + 1).join(" ").replace(/[?.!]/g, "").trim();
        if (potentialLocation) {
          setWeatherLocation(potentialLocation);
        }
      }
    } else if (lowercaseText.includes("camera") || lowercaseText.includes("webcam") || lowercaseText.includes("feed") || lowercaseText.includes("see me") || lowercaseText.includes("see this")) {
      setIsWidgetsMenuOpen(true);
      setActiveWidgetType("CAMERA");
      setIsCameraActive(true);
    } else if (lowercaseText.includes("map") || lowercaseText.includes("street view") || lowercaseText.includes("google earth") || lowercaseText.includes("locate")) {
      setIsWidgetsMenuOpen(true);
      setActiveWidgetType("MAPS");
      const phrases = ["map for", "maps for", "locate", "address", "street view for", "show me", "at"];
      let foundLoc = "";
      for (const phrase of phrases) {
        if (lowercaseText.includes(phrase)) {
          const startIdx = lowercaseText.indexOf(phrase) + phrase.length;
          const matched = currentText.substring(startIdx).replace(/[?.!]/g, "").trim();
          if (matched && matched.length > 2) {
            foundLoc = matched;
            break;
          }
        }
      }
      if (foundLoc) {
        setMapAddress(foundLoc);
      }
    } else if (
      lowercaseText.includes("spent") || 
      lowercaseText.includes("spend") || 
      lowercaseText.includes("paid") || 
      lowercaseText.includes("cost") || 
      lowercaseText.includes("bought") ||
      lowercaseText.includes("income") ||
      lowercaseText.includes("made") ||
      lowercaseText.includes("earned")
    ) {
      setIsWidgetsMenuOpen(true);
      setActiveWidgetType("FINANCIAL");
      setFinancialSubTab("LEDGER");
      
      const priceRegex = /(?:\$)\s*([0-9]+(?:\.[0-9]+)?)|([0-9]+(?:\.[0-9]+)?)\s*(?:dollars|bucks|usd|EUR|\$)/i;
      const match = currentText.match(priceRegex);
      const parsedAmount = match ? parseFloat(match[1] || match[2]) : null;
      
      if (parsedAmount && !isNaN(parsedAmount)) {
        let category = "Food";
        if (/food|lunch|dinner|breakfast|sushi|ramen|pizza|drink|eat/i.test(lowercaseText)) category = "Food";
        else if (/drive|host|server|rent|cloud|hosting|domain/i.test(lowercaseText)) category = "Servers";
        else if (/gear|mouse|keyboard|monitor|gpu|rtx|mac|hardware/i.test(lowercaseText)) category = "Gear";
        else if (/flight|uber|cab|trip|travel|taxi|car|ticket/i.test(lowercaseText)) category = "Travel";
        else if (/memories|consciousness|synapse|prompt|ai/i.test(lowercaseText)) category = "Services";
        
        let type: "spend" | "income" = "spend";
        if (/made|earned|income|salary|credits/i.test(lowercaseText)) {
          type = "income";
        }
        
        let desc = currentText;
        desc = desc.replace(/hi\s*,?/i, "")
                   .replace(/today\s*/i, "")
                   .replace(/i\s+spent\s*/i, "")
                   .replace(/i\s+made\s*/i, "")
                   .replace(priceRegex, "")
                   .replace(/on\s+/i, "")
                   .replace(/for\s+/i, "")
                   .replace(/[?.!]/g, "")
                   .trim();
                   
        if (!desc) desc = category + " Ledger Item";
        desc = desc.charAt(0).toUpperCase() + desc.slice(1);
        
        handleAddTransaction(parsedAmount, desc, category, type);
      }
    } else if (
      lowercaseText.includes("financial news") ||
      lowercaseText.includes("finance news") ||
      lowercaseText.includes("market news") ||
      lowercaseText.includes("stock news") ||
      lowercaseText.includes("crypto news") ||
      (lowercaseText.includes("news") && (lowercaseText.includes("financial") || lowercaseText.includes("crypto") || lowercaseText.includes("stock") || lowercaseText.includes("market") || lowercaseText.includes("btc") || lowercaseText.includes("bitcoin") || lowercaseText.includes("ethereum") || lowercaseText.includes("eth") || lowercaseText.includes("solana") || lowercaseText.includes("finance")))
    ) {
      setIsWidgetsMenuOpen(true);
      setActiveWidgetType("FINANCIAL");
      setFinancialSubTab("INTEL");
    } else if (
      lowercaseText.includes("btc") ||
      lowercaseText.includes("bitcoin") ||
      lowercaseText.includes("ether") ||
      lowercaseText.includes("ethereum") ||
      lowercaseText.includes("eth") ||
      lowercaseText.includes("solana") ||
      lowercaseText.includes("sol") ||
      lowercaseText.includes("binance") ||
      lowercaseText.includes("bnb") ||
      lowercaseText.includes("ripple") ||
      lowercaseText.includes("xrp") ||
      lowercaseText.includes("crypto") ||
      lowercaseText.includes("cryptocurrency")
    ) {
      setIsWidgetsMenuOpen(true);
      setActiveWidgetType("FINANCIAL");
      setFinancialSubTab("CRYPTO");
      
      let asset = "BTC";
      if (lowercaseText.includes("eth") || lowercaseText.includes("ethereum") || lowercaseText.includes("ether")) {
        asset = "ETH";
      } else if (lowercaseText.includes("solana") || lowercaseText.includes("sol")) {
        asset = "SOL";
      } else if (lowercaseText.includes("bnb") || lowercaseText.includes("binance")) {
        asset = "BNB";
      } else if (lowercaseText.includes("ripple") || lowercaseText.includes("xrp")) {
        asset = "XRP";
      }
      setSelectedAssetId(asset);
    } else if (
      lowercaseText.includes("stock") ||
      lowercaseText.includes("stocks") ||
      lowercaseText.includes("shares") ||
      lowercaseText.includes("market") ||
      lowercaseText.includes("nasdaq") ||
      lowercaseText.includes("nyse") ||
      lowercaseText.includes("s&p") ||
      lowercaseText.includes("sp505") ||
      lowercaseText.includes("apple") ||
      lowercaseText.includes("aapl") ||
      lowercaseText.includes("nvidia") ||
      lowercaseText.includes("nvda") ||
      lowercaseText.includes("tesla") ||
      lowercaseText.includes("tsla") ||
      lowercaseText.includes("google") ||
      lowercaseText.includes("googl") ||
      lowercaseText.includes("goog") ||
      lowercaseText.includes("microsoft") ||
      lowercaseText.includes("msft")
    ) {
      setIsWidgetsMenuOpen(true);
      setActiveWidgetType("FINANCIAL");
      setFinancialSubTab("STOCKS");
      
      let asset = "AAPL";
      if (lowercaseText.includes("nvidia") || lowercaseText.includes("nvda")) {
        asset = "NVDA";
      } else if (lowercaseText.includes("tesla") || lowercaseText.includes("tsla")) {
        asset = "TSLA";
      } else if (lowercaseText.includes("google") || lowercaseText.includes("googl") || lowercaseText.includes("goog")) {
        asset = "GOOGL";
      } else if (lowercaseText.includes("microsoft") || lowercaseText.includes("msft")) {
        asset = "MSFT";
      }
      setSelectedAssetId(asset);
    }

    if (lowercaseText.includes("search youtube for") || lowercaseText.includes("youtube search")) {
      const q = currentText
        .replace(/search youtube for/i, "")
        .replace(/youtube search/i, "")
        .trim();
      setActiveProjection({ type: "SEARCH_YOUTUBE", query: q || "cosmic space music" });
    } else if (lowercaseText.includes("search google for") || lowercaseText.includes("google search") || lowercaseText.includes("search for")) {
      const q = currentText
        .replace(/search google for/i, "")
        .replace(/google search/i, "")
        .replace(/search for/i, "")
        .trim();
      setActiveProjection({ type: "SEARCH_GOOGLE", query: q || "quantum core metrics" });
    } else if (lowercaseText.includes("google") || lowercaseText.includes("search")) {
      const q = currentText.replace(/google/i, "").replace(/search/i, "").trim();
      setActiveProjection({ type: "SEARCH_GOOGLE", query: q || "quantum thought visualizer" });
    } else if (lowercaseText.includes("youtube")) {
      const q = currentText.replace(/youtube/i, "").trim();
      setActiveProjection({ type: "SEARCH_YOUTUBE", query: q || "ambient synthesizers" });
    } else if (lowercaseText.includes("open disney") || lowercaseText.includes("disney plus") || lowercaseText.includes("disney+")) {
      setActiveProjection({ type: "APP_DISNEY", query: "" });
    } else if (lowercaseText.includes("open browser") || lowercaseText.includes("browser") || lowercaseText.includes("website") || lowercaseText.includes("go to")) {
      const urlMatch = currentText.match(/https?:\/\/[^\s]+/i) || currentText.match(/[a-zA-Z0-9-]+\.[a-z]{2,}/i);
      const url = urlMatch ? urlMatch[0] : "wikipedia.org";
      setActiveProjection({ type: "BROWSER", query: url });
    } else if (lowercaseText.includes("open file") || lowercaseText.includes("explorer") || lowercaseText.includes("file manager") || lowercaseText.includes("filesystem") || lowercaseText === "files") {
      setActiveProjection({ type: "FILES", query: "" });
    }

    let imagePayload = captureSnapshot();
    const imageAttachment = attachedFiles.find((f) => f.isImage && f.base64);
    if (imageAttachment) {
      imagePayload = imageAttachment.base64 || null;
    }

    let promptText = currentText;
    const documentAttachments = attachedFiles.filter((f) => !f.isImage && f.textContent);
    if (documentAttachments.length > 0) {
      const docsContext = documentAttachments
        .map((f) => `[Attached File: ${f.name}]\n${f.textContent}\n[End of File: ${f.name}]`)
        .join("\n\n");
      promptText = `${docsContext}\n\n${currentText}`;
    }

    setAttachedFiles([]);

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      text: currentText,
      timestamp: new Date()
    };

    let activeId = currentSessionId;
    if (!activeId) {
      activeId = "sector_kids_" + Math.random().toString(36).substring(2, 9);
      setCurrentSessionId(activeId);
    }

    const stageMessages = [...messages, userMsg];
    setMessages(stageMessages);
    saveActiveSession(stageMessages, activeId);

    setIsThinking(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: promptText,
          history: stageMessages.map((m) => ({ role: m.role, text: m.text })),
          image: imagePayload,
          isKidsMode: true
        })
      });

      if (!response.ok) {
        throw new Error("Consciousness synapse pathway failed");
      }

      const data = await response.json();

      executeAgenticCommands(data.text);

      const aiMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "model",
        text: data.text,
        timestamp: new Date()
      };

      const finalMessages = [...stageMessages, aiMsg];
      setMessages(finalMessages);
      saveActiveSession(finalMessages, activeId);

      if (isAudioFeedbackActive) {
        speakTextReflections(cleanSpeakText(data.text));
      }

    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "model",
        text: `[TRANSCEIVER_ERROR] Direct synapse interrupted: ${err.message || "No core response"}.`,
        timestamp: new Date()
      };
      
      const finalErrMessages = [...stageMessages, errorMsg];
      setMessages(finalErrMessages);
      saveActiveSession(finalErrMessages, activeId);
    } finally {
      setIsThinking(false);
    }
  };

  const renderMessageWithActions = (msgText: string) => {
    const cleanBody = msgText.replace(/\[[A-Z_]+(?::\s*[^\]]+)?\]/gi, "").trim();

    const regex = /\[([A-Z_]+)(?::\s*([^\]]+))?\]/gi;
    const badges: { icon: string; text: string }[] = [];
    let match;

    while ((match = regex.exec(msgText)) !== null) {
      const command = match[1].toUpperCase();
      const value = match[2] ? match[2].trim() : "";

      switch (command) {
        case "OPEN_WIDGET":
          badges.push({ icon: "⚡", text: `Initialized ${value.toUpperCase()} panel overlay` });
          break;
        case "SET_WEATHER_LOCATION":
          badges.push({ icon: "🌤️", text: `Weather coordinates: "${value}"` });
          break;
        case "SET_MAP_ADDRESS":
          badges.push({ icon: "🗺️", text: `Navigation focus locked: "${value}"` });
          break;
        case "SET_FINANCIAL_TAB":
          badges.push({ icon: "📊", text: `Flipped ledger view to: ${value}` });
          break;
        case "SET_FINANCIAL_ASSET":
          badges.push({ icon: "📈", text: `Tracking index asset ticker: ${value}` });
          break;
        case "OPEN_PROJECTION":
          badges.push({ icon: "🛸", text: `Projecting virtual spatial deck: ${value}` });
          break;
        case "SET_BROWSER_URL":
          badges.push({ icon: "🔗", text: `Browsing address: "${value}"` });
          break;
        case "CHANGE_THEME":
          badges.push({ icon: "🎨", text: `Adjusted cockpit theme shade: ${value}` });
          break;
        case "ADD_TRANSACTION": {
          const descMatch = value.match(/Desc="([^"]+)"/i) || value.match(/Desc=([^,\]]+)/i);
          const amountMatch = value.match(/Amount=([0-9.]+)/i);
          const descVal = descMatch ? descMatch[1] : "item";
          const amountVal = amountMatch ? amountMatch[1] : "";
          badges.push({ icon: "💳", text: `Enrolled transaction ledger: "${descVal}" ($${amountVal})` });
          break;
        }
        case "CLOSE_PROJECTION":
          badges.push({ icon: "✖️", text: `Dismissed central spatial panel` });
          break;
        case "CLOSE_WIDGETS":
          badges.push({ icon: "✖️", text: `Closed active side-panel telemetry overlays` });
          break;
      }
    }

    return (
      <div className="space-y-3">
        <div className="font-light tracking-wide whitespace-pre-wrap">{cleanBody}</div>
        {badges.length > 0 && (
          <div className="pt-2 border-t border-zinc-900/40 mt-1 flex flex-wrap gap-1.5 pointer-events-auto">
            {badges.map((b, i) => (
              <div 
                key={i} 
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-zinc-950/90 border border-zinc-900 text-amber-500/90 font-mono text-[9px] font-bold uppercase tracking-wider animate-pulse hover:border-zinc-800 transition-colors select-none"
              >
                <span>{b.icon}</span>
                <span>{b.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className="min-h-screen text-zinc-100 flex flex-col justify-between py-6 px-6 md:px-12 relative overflow-hidden pointer-events-none"
      id="quantum-thought-stage-kids"
    >
      <ConsciousnessCore 
        isThinking={isThinking}
        activeFormation={activeFormation}
        onFormationChange={(f) => setActiveFormation(f)}
        typingExcitement={typingExcitement}
        isSpeaking={isSpeaking}
        activeProjection={activeProjection}
        onTriggerProjection={(type, query) => {
          setActiveProjection({ type: type as any, query });
        }}
        inquiries={messages}
        activeWidgetType={activeWidgetType}
        isKidsMode={true}
      />

      <ActiveWidgets
        isKidsMode={true}
        isWidgetsMenuOpen={isWidgetsMenuOpen}
        setIsWidgetsMenuOpen={setIsWidgetsMenuOpen}
        activeWidgetType={activeWidgetType}
        setActiveWidgetType={setActiveWidgetType}
        transactions={transactions}
        onAddTransaction={handleAddTransaction}
        onClearTransactions={handleClearTransactions}
        weatherLocation={weatherLocation}
        setWeatherLocation={setWeatherLocation}
        mapAddress={mapAddress}
        setMapAddress={setMapAddress}
        activeTheme={activeTheme}
        financialSubTab={financialSubTab}
        setFinancialSubTab={setFinancialSubTab}
        selectedAssetId={selectedAssetId}
        setSelectedAssetId={setSelectedAssetId}
        isMemoryPanelOpen={isMemoryPanelOpen}
        setIsMemoryPanelOpen={setIsMemoryPanelOpen}
        sessionsCount={sessions.length}
        lastActivated={lastActivated}
        onFocusWidget={() => setLastActivated("WIDGET")}
        onMinimizeWidget={handleMinimizeWidget}
        onCloseWidget={handleCloseWidget}
      />

      <AnimatePresence mode="popLayout">
        {Object.values(runningProjections).map((p) => {
          const proj = p as { type: ProjectionType; query: string; isMinimized: boolean };
          const isLeft = proj.type === "BROWSER" || proj.type === "FILES";
          const anchors = (window as any).__spatialAnchors || {};
          const coord = anchors[proj.type] || { x: window.innerWidth / 2, y: window.innerHeight / 2 };

          const getPlacementClass = (projType: string) => {
            if (isProjectionFullScreen) {
              if (isMobile) {
                return "fixed left-3 right-3 top-[80px] bottom-3 w-auto h-auto max-h-[82vh]";
              }
              return "fixed inset-4 md:inset-[3%] w-auto h-auto";
            }
            if (isMobile) {
              return "fixed left-3 right-3 top-[85px] h-[65vh] w-auto max-h-[65vh] mb-4";
            }
            switch (projType) {
              case "BROWSER":
                return "left-4 md:left-[3%] right-4 md:right-auto top-[6%] h-[58vh] md:w-[32%]";
              case "FILES":
                return "left-4 md:left-[6%] right-4 md:right-auto top-[8%] h-[78vh] md:w-[54%]";
              case "APPS":
                return "right-4 md:right-[3%] left-4 md:left-auto top-[6%] h-[58vh] md:w-[32%]";
              case "MARKET":
                return "right-4 md:right-[26%] left-4 md:left-auto top-[28%] h-[58vh] md:w-[32%]";
              case "SETTINGS":
              default:
                return "right-4 md:right-[12%] left-4 md:left-auto top-[18%] h-[58vh] md:w-[32%]";
            }
          };

          return (
            <div key={proj.type} className={proj.isMinimized ? "hidden" : "contents"}>
              <DraggableProjection
                type={proj.type}
                query={proj.query}
                isLeft={isLeft}
                coord={coord}
                isFullScreen={isProjectionFullScreen}
                onToggleFullScreen={() => setIsProjectionFullScreen(prev => !prev)}
                onClose={() => handleCloseProjection(proj.type)}
                onMinimize={() => handleMinimizeProjection(proj.type)}
                isKidsMode={true}
                lastActivated={lastActivated}
                setLastActivated={setLastActivated}
                isMobile={isMobile}
                getPlacementClass={getPlacementClass}
              />
            </div>
          );
        })}
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-b from-[#040405]/50 via-transparent to-[#040405]/85 pointer-events-none -z-10" />

      {/* 2.1 COGNITIVE FLOATING SENSOR CAPSULE (TOP CENTER) */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none">
        <div 
          className="bg-[#060608]/92 border border-zinc-900/90 px-5 py-1.5 rounded-full backdrop-blur-xl flex items-center space-x-4 shadow-[0_10px_35px_rgba(0,0,0,0.95)] text-zinc-400 select-none pointer-events-auto animate-pulse"
          id="top-sensor-capsule-kids"
        >
          <span className="relative flex h-2 w-2 mr-0.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isListening || isThinking || isSpeaking ? "bg-[#10eb73]" : "bg-neutral-500"}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isListening || isThinking || isSpeaking ? "bg-[#10eb73]" : "bg-neutral-650"}`}></span>
          </span>

          <AnimatePresence mode="popLayout">
            {isSpeaking && (
              <motion.div
                initial={{ opacity: 0, width: 0, scale: 0.8 }}
                animate={{ opacity: 1, width: "auto", scale: 1 }}
                exit={{ opacity: 0, width: 0, scale: 0.8 }}
                transition={{ type: "spring", damping: 20, stiffness: 150 }}
                className="overflow-hidden flex items-center pr-2 border-r border-zinc-800/80 mr-1 select-none"
              >
                <div className="flex items-end gap-[3px] h-5 px-1.5 py-0.5 bg-black/40 rounded-md border border-zinc-900/40">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className={`w-[2.5px] rounded-full transition-shadow duration-300 ${getVisualizerColor()}`}
                      style={{ originY: 1 }}
                      animate={{
                        height: [
                          "4px",
                          i % 2 === 0 ? "16px" : "12px",
                          i % 3 === 0 ? "18px" : "8px",
                          "10px",
                          i % 2 === 0 ? "15px" : "6px",
                          "4px"
                        ]
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.45 + (i * 0.08),
                        ease: "linear"
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={toggleAudioFeedback}
            className={`p-1.5 rounded-full transition-all duration-300 hover:bg-zinc-900 w-7 h-7 flex items-center justify-center cursor-pointer ${
              isAudioFeedbackActive ? "text-emerald-400 bg-emerald-950/20" : "text-zinc-505 hover:text-zinc-300"
            }`}
          >
            {isAudioFeedbackActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <span className="w-px h-4 bg-zinc-850" />

          <button
            type="button"
            onClick={() => setIsWidgetsMenuOpen(!isWidgetsMenuOpen)}
            className={`p-1.5 rounded-full transition-all duration-300 hover:bg-zinc-900 w-7 h-7 flex items-center justify-center cursor-pointer ${
              isWidgetsMenuOpen ? "text-[#f59e0b] bg-[#f59e0b]/10 scale-105" : "text-zinc-500 hover:text-white"
            }`}
          >
            <LayoutGrid className="w-4.5 h-4.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsProjectionMenuOpen(!isProjectionMenuOpen)}
            className={`p-1.5 rounded-full transition-all duration-300 hover:bg-zinc-900 w-7 h-7 flex items-center justify-center cursor-pointer ${
              isProjectionMenuOpen ? "text-[#f59e0b] bg-[#f59e0b]/10 scale-105" : "text-zinc-500 hover:text-white"
            }`}
          >
            <Monitor className="w-4 h-4" />
          </button>

          {/* KIDS MODE ACTIVE STATUS / EXIT BUTTON TO RETURN TO STANDARD MODE */}
          <button
            type="button"
            onClick={onExit}
            className="p-1.5 rounded-full transition-all duration-300 hover:bg-zinc-900 w-7 h-7 flex items-center justify-center cursor-pointer text-[#10eb73] bg-[#10eb73]/10 scale-105"
            title="Return to Standard Mode"
          >
            <Baby className="w-4.5 h-4.5 animate-pulse" />
          </button>
        </div>

        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              className={`px-3 py-1 rounded-full text-[9px] font-mono tracking-wider flex items-center gap-1.5 backdrop-blur-md border shadow-lg ${
                isSunnyWoken 
                  ? "bg-amber-955/50 border-amber-500/40 text-amber-400" 
                  : "bg-zinc-950/40 border-zinc-800/80 text-zinc-400"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isSunnyWoken ? "bg-amber-450 animate-ping" : "bg-zinc-500 animate-pulse"}`} />
              <span>{isSunnyWoken ? "SUNNY: ENERGIZED // CORE LISTENING" : "SAY: 'HEY SUNNY' ..."}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {speechErrorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="bg-[#0c0c0e]/95 border border-amber-500/20 px-3.5 py-1.5 rounded-full shadow-xl text-[10px] text-zinc-350 font-mono tracking-wide flex items-center space-x-2 pointer-events-auto select-none"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>{speechErrorMsg}</span>
              <button 
                onClick={() => setSpeechErrorMsg(null)}
                className="hover:text-white text-zinc-505 ml-1.5 font-bold cursor-pointer font-sans"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isProjectionMenuOpen && (!isMobile || !activeProjection) && (
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.96 }}
            animate={{ 
              opacity: 1, 
              x: isMemoryPanelOpen ? -324 : 0, 
              scale: 1 
            }}
            exit={{ opacity: 0, x: 50, scale: 0.96 }}
            transition={{ type: "spring", damping: 25, stiffness: 180 }}
            className="fixed right-4 top-1/2 -translate-y-1/2 bg-[#060608]/92 border border-zinc-900 px-3 py-4 rounded-2xl flex flex-col items-center space-y-4 z-49 backdrop-blur-xl shadow-[0_15px_40px_rgba(0,0,0,0.85)] pointer-events-auto"
          >
            {[
              {
                type: "BROWSER",
                label: "BROWSER",
                icon: <Globe className="w-4 h-4 text-cyan-400/90" />,
                colorHover: "hover:text-cyan-400 hover:bg-cyan-955/20",
                query: ""
              },
              {
                type: "FILES",
                label: "Teacher's Lessons",
                icon: <BookOpen className="w-4 h-4 text-emerald-400/90" />,
                colorHover: "hover:text-emerald-450 hover:bg-emerald-950/30",
                query: ""
              },
              {
                type: "APPS",
                label: "APPS",
                icon: <Play className="w-4 h-4 text-red-400/90" />,
                colorHover: "hover:text-red-410 hover:bg-red-950/20",
                query: ""
              },
              {
                type: "MARKET",
                label: "MARKET",
                icon: <ShoppingBag className="w-4 h-4 text-purple-400/90" />,
                colorHover: "hover:text-purple-430 hover:bg-purple-950/20",
                query: ""
              },
              {
                type: "SETTINGS",
                label: "SETTINGS",
                icon: <Sliders className="w-4 h-4 text-amber-500/90" />,
                colorHover: "hover:text-amber-450 hover:bg-amber-955/20",
                query: ""
              }
            ].map((item) => {
              const isActive = activeProjection?.type === item.type;
              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => {
                    setLastActivated("PROJECTION");
                    if (activeProjection?.type === item.type) {
                      setActiveProjection(null);
                    } else {
                      setActiveProjection({ type: item.type as any, query: item.query });
                    }
                    setIsProjectionMenuOpen(false);
                  }}
                  className={`group relative p-2.5 rounded-xl border border-transparent transition-all duration-300 flex items-center justify-center cursor-pointer ${item.colorHover} ${
                    isActive 
                      ? "bg-zinc-904 border-zinc-700/50 scale-105 shadow-md text-white" 
                      : "text-zinc-400"
                  }`}
                  title={item.label}
                >
                  {item.icon}
                  <span className="absolute right-full mr-3.5 top-1/2 -translate-y-1/2 bg-[#060608]/95 text-[8.5px] font-mono tracking-widest text-[#f59e0b] px-3 py-1.5 rounded-lg border border-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-xl z-50 uppercase font-bold">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <header className="w-full max-w-5xl mx-auto flex justify-end items-center gap-4 text-[9px] font-mono tracking-widest text-[#f59e0b] pb-4 border-b border-zinc-900/40 z-10 pointer-events-auto">
        <div className="flex items-center space-x-3 text-right">
          <span>{currentUtc}</span>
        </div>
      </header>

      <div className="fixed bottom-24 right-6 flex flex-col items-end space-y-2 z-20">
        {cameraError && (
          <span className="text-[7.5px] font-mono text-amber-500 bg-black/85 px-2 py-0.5 rounded-md border border-amber-900/35 uppercase tracking-wider">{cameraError}</span>
        )}
      </div>

      <main className="flex-1 w-full max-w-3xl mx-auto flex flex-col justify-end my-6 relative z-10 overflow-hidden pointer-events-auto">
        <div className="w-full h-[440px] overflow-y-auto px-4 py-6 custom-scrollbar flex flex-col space-y-12">
          <AnimatePresence initial={false}>
            {messages.length === 0 ? null : (
              messages.map((msg) => (
                <div key={msg.id} className="fade-in-slow">
                  {msg.role === "user" ? (
                    <div className="flex flex-col items-start max-w-xl">
                      <span className="font-mono text-[8px] text-[#10eb73]/70 tracking-widest mb-1.5 uppercase">[ KIDS EXPLORER ]</span>
                      <p className="font-serif italic text-base md:text-lg text-zinc-350 leading-relaxed pl-3.5 border-l border-zinc-800">
                        “{msg.text}”
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-start leading-relaxed w-full">
                      <span className="font-mono text-[8px] text-[#10eb73] tracking-widest mb-2.5 flex items-center space-x-1.5 uppercase font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10eb73] animate-ping" />
                        <span>[ SUNNY KIDS INTELLIGENCE ]</span>
                      </span>
                      <div className="text-zinc-150 font-sans text-[14.5px] font-light leading-relaxed tracking-wide max-w-3xl whitespace-pre-wrap pl-3.5 bg-black/35 p-4 rounded-2xl border border-[#10eb73]/20 backdrop-blur-sm w-full">
                        {renderMessageWithActions(msg.text)}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </main>

      <AnimatePresence>
        {isMemoryPanelOpen && (
          <motion.aside
            initial={{ opacity: 0, x: 280 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 280 }}
            transition={{ type: "spring", damping: 25, stiffness: 180 }}
            className="fixed top-0 right-0 h-screen w-80 bg-[#060608]/95 border-l border-zinc-900/80 z-50 p-6 flex flex-col justify-between backdrop-blur-xl shadow-2xl pointer-events-auto"
          >
            <div className="flex-1 flex flex-col min-h-0 space-y-6">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3 select-none">
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-[#d946ef] animate-pulse" />
                  <span className="font-mono text-[10px] tracking-widest text-zinc-300 font-bold uppercase">
                    SYSTEM WORKSPACE
                  </span>
                </div>
                <button
                  onClick={() => setIsMemoryPanelOpen(false)}
                  className="p-1 rounded bg-zinc-950 text-zinc-500 hover:text-white border border-zinc-900 cursor-pointer"
                  aria-label="Collapse memories modal"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              {/* Upper Half: Running Processes */}
              <div className="flex flex-col border-b border-zinc-900 pb-4 select-none">
                <span className="font-mono text-[8px] tracking-widest text-zinc-500 font-bold uppercase mb-2.5 flex items-center space-x-1.5">
                  <Cpu className="w-3 h-3 text-cyan-400 animate-pulse" />
                  <span>RUNNING PROCESSES ({Object.keys(runningProjections).length + Object.keys(runningWidgets).length})</span>
                </span>
                <div className="overflow-y-auto custom-scrollbar space-y-2 pr-1 max-h-[30vh]">
                  {Object.keys(runningProjections).length === 0 && Object.keys(runningWidgets).length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-zinc-900/50 rounded-xl bg-zinc-950/20">
                      <p className="font-mono text-[8px] text-zinc-650 uppercase tracking-widest">
                        NO ACTIVE ACTIONS RUNNING
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Projections */}
                      {Object.values(runningProjections).map((p) => {
                        const proj = p as { type: ProjectionType; query: string; isMinimized: boolean };
                        return (
                          <div key={proj.type} className="flex items-center justify-between p-2 bg-zinc-950/50 border border-zinc-900/80 rounded-xl hover:border-zinc-800 transition-colors">
                            <div className="flex flex-col items-start space-y-0.5">
                              <span className="font-mono text-[9px] text-zinc-300 font-bold uppercase flex items-center space-x-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${proj.isMinimized ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
                                <span>{proj.type}</span>
                              </span>
                              <span className="text-[7.5px] font-mono text-zinc-500 truncate max-w-[120px]" title={proj.query || 'Workspace Active'}>
                                {proj.query ? (proj.query.length > 18 ? proj.query.slice(0, 15) + '...' : proj.query) : 'ACTIVE_SESSION'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  playPingSound("neutral");
                                  if (proj.isMinimized) {
                                    handleRestoreProjection(proj.type);
                                  } else {
                                    handleMinimizeProjection(proj.type);
                                  }
                                }}
                                className={`px-2 py-0.5 rounded text-[7.5px] font-mono font-semibold uppercase border cursor-pointer transition-all duration-200 ${
                                  proj.isMinimized
                                    ? "bg-amber-950/20 border-amber-800/40 text-amber-400 hover:bg-amber-900/30"
                                    : "bg-emerald-950/20 border-emerald-800/40 text-emerald-400 hover:bg-emerald-900/30"
                                }`}
                              >
                                {proj.isMinimized ? "Restore" : "Minimize"}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  playPingSound("neutral");
                                  handleCloseProjection(proj.type);
                                }}
                                className="p-1 rounded bg-zinc-900 hover:bg-red-950/30 hover:border-red-800/40 hover:text-red-400 text-zinc-500 border border-zinc-800 cursor-pointer"
                                title="Kill Process"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {/* Widgets */}
                      {Object.values(runningWidgets).map((w) => {
                        const widget = w as { type: "WEATHER" | "CAMERA" | "MAPS" | "FINANCIAL"; query: string; isMinimized: boolean };
                        return (
                          <div key={widget.type} className="flex items-center justify-between p-2 bg-zinc-950/50 border border-zinc-900/80 rounded-xl hover:border-zinc-800 transition-colors">
                            <div className="flex flex-col items-start space-y-0.5">
                              <span className="font-mono text-[9px] text-zinc-300 font-bold uppercase flex items-center space-x-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${widget.isMinimized ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
                                <span>{widget.type} WIDGET</span>
                              </span>
                              <span className="text-[7.5px] font-mono text-zinc-500 truncate max-w-[120px]" title={widget.query || 'Workspace Active'}>
                                {widget.query ? (widget.query.length > 18 ? widget.query.slice(0, 15) + '...' : widget.query) : 'ACTIVE_SESSION'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  playPingSound("neutral");
                                  if (widget.isMinimized) {
                                    handleRestoreWidget(widget.type);
                                  } else {
                                    handleMinimizeWidget(widget.type);
                                  }
                                }}
                                className={`px-2 py-0.5 rounded text-[7.5px] font-mono font-semibold uppercase border cursor-pointer transition-all duration-200 ${
                                  widget.isMinimized
                                    ? "bg-amber-950/20 border-amber-800/40 text-amber-400 hover:bg-amber-900/30"
                                    : "bg-emerald-950/20 border-emerald-800/40 text-emerald-400 hover:bg-emerald-900/30"
                                }`}
                              >
                                {widget.isMinimized ? "Restore" : "Minimize"}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  playPingSound("neutral");
                                  handleCloseWidget(widget.type);
                                }}
                                className="p-1 rounded bg-zinc-900 hover:bg-red-950/30 hover:border-red-800/40 hover:text-red-400 text-zinc-500 border border-zinc-800 cursor-pointer"
                                title="Kill Process"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              </div>

              {/* Lower Half: AI Memories (Dialogue Log History) */}
              <div className="flex-1 flex flex-col min-h-0 pt-1">
                <div className="flex items-center justify-between mb-3 select-none">
                  <span className="font-mono text-[8px] tracking-widest text-zinc-500 font-bold uppercase flex items-center space-x-1.5">
                    <Layers className="w-3 h-3 text-fuchsia-400" />
                    <span>COGNITIVE DIALOGUE MEMORIES ({sessions.length})</span>
                  </span>
                  <button
                    type="button"
                    onClick={createNewSector}
                    className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 text-[8.5px] font-mono text-[#d946ef] cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>NEW LOG</span>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1 max-h-[42vh]">
                  {sessions.length === 0 ? (
                    <div className="text-center py-8 space-y-2">
                      <Terminal className="w-4 h-4 mx-auto text-zinc-750" />
                      <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
                        MEMORIES_EMPTY
                      </p>
                    </div>
                  ) : (
                    sessions.map((session) => (
                      <div
                        key={session.id}
                        onClick={() => loadArchiveSession(session)}
                        className={`group p-2.5 rounded-xl border transition-all duration-300 cursor-pointer relative ${
                          currentSessionId === session.id
                            ? "bg-zinc-900/40 border-[#d946ef]/40 shadow-inner"
                            : "bg-zinc-950/60 border-zinc-900 hover:border-zinc-800"
                        }`}
                      >
                        <div className="space-y-1 select-none">
                          <p className="font-mono text-[7px] text-zinc-505 uppercase tracking-wider text-left">
                            {session.timestamp}
                          </p>
                          <p className="font-serif italic text-[11px] text-zinc-300 group-hover:text-white transition-colors line-clamp-2 leading-relaxed text-left">
                            {session.title}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => clearSessionRecord(session.id, e)}
                          className="absolute right-2 bottom-2 p-0.5 rounded bg-zinc-950/80 text-zinc-505 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:text-red-400 hover:bg-red-950/25 border border-zinc-900 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {sessions.length > 0 && (
              <div className="border-t border-zinc-900 pt-4">
                <button
                  type="button"
                  onClick={purgeAllMemorySectors}
                  className={`w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg border text-[10px] font-mono tracking-widest uppercase cursor-pointer transition-all duration-300 ${
                    confirmPurge 
                      ? "border-rose-500/50 bg-rose-955/30 text-rose-200 animate-pulse" 
                      : "border-red-950/30 bg-red-955/10 text-red-400 hover:bg-red-950/20"
                  }`}
                >
                  <Trash2 className="w-3 h-3" />
                  <span>{confirmPurge ? "CONFIRM PURGE (CLICK AGAIN)" : "PURGE ALL MEMORIES"}</span>
                </button>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      <footer className="w-full max-w-3xl mx-auto pt-4 flex flex-col items-center z-10 relative pointer-events-auto">
        <form 
          onSubmit={handleSendMessage} 
          className="w-full flex flex-col relative"
        >
          {attachedFiles.length > 0 && (
            <div className="absolute bottom-[52px] left-2 right-2 flex flex-wrap gap-1.5 z-30 pb-1.5 px-2 bg-zinc-950/90 border border-[#10eb73]/20 rounded-xl backdrop-blur-md shadow-xl py-1.5 max-h-24 overflow-y-auto">
              {attachedFiles.map((file) => (
                <div 
                  key={file.id} 
                  className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-zinc-900/90 border border-zinc-800 text-zinc-300 hover:border-zinc-700 transition-all text-[9.5px] font-mono"
                >
                  {file.isImage ? (
                    <img 
                      src={file.base64} 
                      alt="Upload preview" 
                      className="w-3.5 h-3.5 rounded object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <FileText className="w-3 h-3 text-cyan-400" />
                  )}
                  <span className="max-w-[110px] truncate font-semibold text-zinc-200">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeAttachedFile(file.id)}
                    className="text-zinc-505 hover:text-rose-400 transition-colors p-0.5 cursor-pointer ml-1 animate-none flex items-center justify-center"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDroppedFiles}
            className={`w-full relative p-[1px] rounded-xl overflow-hidden transition-all duration-300 ${
              isDragOver 
                ? "scale-[1.015] shadow-[0_0_20px_rgba(16,235,115,0.2)]" 
                : "shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
            }`}
          >
            {/* Shimmering thin border themed for Kids Mode */}
            <div className={`absolute inset-0 bg-gradient-to-r from-emerald-400 via-[#10eb73] via-green-400 via-cyan-453 via-[#10eb73] via-yellow-400 to-emerald-400 animate-border-shimmer opacity-30 group-hover:opacity-100 transition-opacity duration-500 ${
              isThinking || isListening || isSunnyWoken ? "opacity-100" : ""
            }`} />

            <div className={`relative z-10 w-full bg-[#060608]/94 rounded-[11px] flex items-center px-4 py-2.5 backdrop-blur-xl min-h-[44px] border ${
              isSunnyWoken 
                ? "border-[#10eb73]/50" 
                : isListening
                  ? "border-[#10eb73]/20"
                  : "border-zinc-900/60"
            }`}>
              
              {isDragOver && (
                <div className="absolute inset-0 bg-emerald-950/20 backdrop-blur-sm z-20 rounded-[11px] flex items-center justify-center border border-[#10eb73]/20 pointer-events-none">
                  <span className="text-[9px] font-mono tracking-widest text-[#10eb73] animate-pulse uppercase font-extrabold">
                    Drop Files to Attach
                  </span>
                </div>
              )}

              <input 
                type="input" 
                className="hidden" 
                style={{ display: "none" }}
              />
              <input 
                type="file" 
                multiple 
                ref={fileInputRef} 
                className="hidden" 
                onChange={(e) => {
                  if (e.target.files) {
                    processFileList(e.target.files);
                  }
                }}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1 px-1.5 text-zinc-500 hover:text-[#10eb73] hover:bg-emerald-950/20 rounded-md transition-all duration-200 cursor-pointer mr-2 flex items-center justify-center"
              >
                <Paperclip className="w-3.5 h-3.5" />
              </button>

              <input 
                type="text"
                value={userInput}
                onChange={handleInputChange}
                disabled={isThinking}
                placeholder={
                  isThinking 
                    ? "Sunny is searching the stars..." 
                    : isListening 
                      ? "Listening... Say 'Hey Sunny, how big is Jupiter?' 🚀" 
                      : "Ask Sunny anything, or say 'Hey Sunny'! ⭐"
                }
                className="flex-1 bg-transparent border-none outline-none text-zinc-100 font-sans text-xs tracking-wide placeholder-zinc-505 disabled:opacity-50"
                autoFocus
              />

              <div className="flex items-center space-x-2 ml-2">
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`p-1 rounded-md transition-all duration-200 cursor-pointer flex items-center justify-center ${
                    isListening 
                      ? "bg-emerald-950/20 border border-[#10eb73]/25 text-[#10eb73] scale-105" 
                      : "text-zinc-505 hover:text-[#10eb73] hover:bg-zinc-950/80"
                  }`}
                >
                  {isListening ? <Mic className="w-3.5 h-3.5 animate-pulse" /> : <MicOff className="w-3.5 h-3.5" />}
                </button>

                {isThinking ? (
                  <div className="p-1 text-[#10eb73] flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  </div>
                ) : (
                  <button 
                    type="submit" 
                    disabled={!userInput.trim() && attachedFiles.length === 0}
                    className={`p-1 rounded-md transition-all duration-200 cursor-pointer flex items-center justify-center ${
                      userInput.trim() || attachedFiles.length > 0
                        ? "text-[#10eb73] hover:text-[#10eb73]/85 hover:scale-105" 
                        : "text-zinc-650 cursor-not-allowed opacity-30"
                    }`}
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            </div>
          </div>
        </form>
      </footer>

      {/* ACHIEVEMENT UNLOCKED ANIMATED TOAST */}
      <AnimatePresence>
        {showUnlockToast && lastUnlockedBadge && (
          <motion.div
            initial={{ opacity: 0, y: -45, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -25, scale: 0.9 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 select-none pointer-events-none"
          >
            <div className="bg-[#08080b]/95 border border-[#10eb73]/30 p-4 rounded-2xl shadow-[0_20px_50px_rgba(16,235,115,0.15)] flex items-center space-x-4 backdrop-blur-xl pointer-events-auto relative overflow-hidden">
              {/* Glowing gradient background block */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-[#10eb73]/5 to-yellow-500/5 animate-pulse" />
              
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-yellow-400/10 border border-[#10eb73]/30 flex items-center justify-center text-3xl font-bold animate-bounce shadow-lg shadow-emerald-500/10 shrink-0">
                {lastUnlockedBadge.icon}
              </div>

              <div className="flex-1 min-w-0 text-left">
                <span className="text-[8px] font-mono tracking-widest text-[#10eb73] uppercase font-bold flex items-center gap-1">
                  Sparkling Achievement Unlocked! ✨
                </span>
                <h4 className="font-serif italic font-extrabold text-sm text-zinc-100 mt-0.5">
                  {lastUnlockedBadge.name}
                </h4>
                <p className="text-[10px] text-zinc-400 mt-1 leading-normal">
                  You are a superstar! Keep playing and exploring to find more badges!
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowUnlockToast(false)}
                className="p-1.5 hover:bg-zinc-900 rounded-lg text-zinc-550 hover:text-white transition-colors cursor-pointer self-start shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TEACHER LUNA SPECIAL MAIL DELIVERY POPUP */}
      <AnimatePresence>
        {showLunaLetterPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-55 pointer-events-auto"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 180 }}
              className="bg-gradient-to-b from-[#0e0e1a] to-[#05050a] border-2 border-amber-500/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full mx-4 shadow-[0_25px_60px_rgba(245,158,11,0.25)] relative overflow-hidden select-none text-center flex flex-col items-center space-y-5"
            >
              {/* Star sparkles and orbital visuals */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 animate-pulse" />
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-none" />
              <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl pointer-none" />

              {/* Animated Sealed Mail Icon */}
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-amber-950/40 border-2 border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/10 animate-bounce">
                  <span className="text-3xl">📬</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#10eb73] border-2 border-[#0e0e1a] animate-ping" />
              </div>

              {/* Header Title */}
              <div className="space-y-1">
                <span className="font-mono text-[9px] tracking-[0.25em] text-amber-500 font-extrabold uppercase block">
                  STAR MAIL DELIVERY
                </span>
                <h3 className="font-serif italic font-black text-xl sm:text-2xl text-zinc-100 tracking-tight">
                  Letter from Teacher Luna!
                </h3>
              </div>

              {/* Child-targeted message request */}
              <p className="text-xs text-zinc-300 leading-relaxed font-sans max-w-[340px]">
                You've got a letter, <span className="text-amber-400 font-black underline decoration-wavy">{getExplorerName()}</span>! 💫 Let me read it for you!
              </p>

              {/* Letter content preview box */}
              <div className="bg-zinc-955/80 border border-zinc-900 rounded-2xl p-4 text-left font-sans text-xs text-zinc-200 leading-relaxed relative w-full italic max-h-36 overflow-y-auto custom-scrollbar select-text">
                <div className="absolute top-1.5 right-2 text-zinc-700 font-serif text-3xl leading-none">“</div>
                "Good morning, junior space explorers! Welcome to today's cosmic dashboard. Our assignment is to charge our main solar engines by solving our Math Booster equations, verifying stellar words in our voyager tracker, and drawing colorful constellations in the Nebula pad! Don't forget to research solar facts in our safe browser! The Universe is waiting!"
              </div>

              {/* Sound controls and read instructions */}
              {isReadingLunaLetter && (
                <div className="flex items-center space-x-2 text-[9px] font-mono text-[#10eb73] bg-[#10eb73]/10 px-3 py-1.5 rounded-xl border border-[#10eb73]/20 animate-pulse">
                  <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                  <span className="uppercase tracking-widest font-bold">Luna's AI is reading aloud...</span>
                </div>
              )}

              {/* Action Buttons Grid */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const explorer = getExplorerName();
                    const prompt = `Hey there, ${explorer}! You've got a beautiful new letter from Teacher Luna. Let me read it for you: 'Good morning, junior space explorers! Welcome to today's cosmic dashboard. Our assignment is to charge our main solar engines by solving our Math Booster equations, verifying stellar words in our voyager tracker, and drawing colorful constellations in the Nebula pad! Don't forget to research solar facts in our safe browser! The Universe is waiting!'`;
                    speakLunaLetter(prompt);
                  }}
                  className={`py-3 px-4 rounded-xl font-mono text-[10px] font-bold tracking-wider cursor-pointer shadow-lg active:scale-95 transition-all uppercase flex items-center justify-center space-x-2 ${
                    isReadingLunaLetter 
                      ? "bg-emerald-500 text-black border border-emerald-400 animate-pulse" 
                      : "bg-amber-500 hover:bg-amber-400 text-black border border-amber-300"
                  }`}
                >
                  <span>🎙️ {isReadingLunaLetter ? "REPLAY VOICE" : "YES, READ ALOUD!"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    try {
                      if (window.speechSynthesis) {
                        window.speechSynthesis.cancel();
                      }
                    } catch (e) {}
                    setIsReadingLunaLetter(false);
                    setShowLunaLetterPopup(false);
                    // Launch FILES (Lessons Portal) automatically and switch to Teacher Luna tab
                    setActiveProjection({ type: "FILES", query: "" });
                  }}
                  className="py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 rounded-xl font-mono text-[10px] font-bold tracking-wider cursor-pointer active:scale-95 transition-all uppercase flex items-center justify-center space-x-1.5"
                >
                  <span>📖 OPEN PORTAL</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  try {
                    if (window.speechSynthesis) {
                      window.speechSynthesis.cancel();
                    }
                  } catch (e) {}
                  setIsReadingLunaLetter(false);
                  setShowLunaLetterPopup(false);
                }}
                className="text-[9px] font-mono text-zinc-500 hover:text-zinc-350 uppercase tracking-widest pt-1 underline hover:no-underline cursor-pointer"
              >
                Skip & read silently
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUBTLE SIDE EDGE TRIGGERS (GESTURE & CLICK DRAWERS) */}
      {/* Subtle Left Side Trigger - Opens Widgets */}
      <div
        className="fixed left-0 top-1/3 bottom-1/3 w-3 z-50 flex items-center justify-center transition-all duration-300 pointer-events-auto cursor-pointer group"
        onClick={() => setIsWidgetsMenuOpen(prev => !prev)}
        onTouchStart={(e) => {
          const touch = e.touches[0];
          const sX = touch.clientX;
          const handleTouchMove = (moveEv: TouchEvent) => {
            const currentX = moveEv.touches[0].clientX;
            if (currentX - sX > 40) {
              setIsWidgetsMenuOpen(true);
              document.removeEventListener("touchmove", handleTouchMove);
            }
          };
          document.addEventListener("touchmove", handleTouchMove);
          const handleTouchEnd = () => {
            document.removeEventListener("touchmove", handleTouchMove);
            document.removeEventListener("touchend", handleTouchEnd);
          };
          document.addEventListener("touchend", handleTouchEnd);
        }}
      >
        {/* Subtle glowing marker line */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-cyan-500/10 via-cyan-400/50 to-cyan-500/10 group-hover:w-1.5 transition-all duration-300 rounded-r shadow-[0_0_15px_rgba(34,211,238,0.3)]" />
        
        {/* Hover expanding pull-knob helper info */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -translate-x-3 group-hover:translate-x-1 bg-[#060608]/92 border border-cyan-800/40 backdrop-blur-md px-1 py-4 rounded-r-xl shadow-lg flex flex-col items-center justify-center space-y-1">
          <ChevronRight className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span className="text-[7.5px] font-mono tracking-[0.2em] text-cyan-400 font-bold uppercase [writing-mode:vertical-lr] select-none pointer-events-none scale-90">
            WIDGETS
          </span>
        </div>
      </div>

      {/* Subtle Right Side Trigger - Opens Spatial Projections */}
      <div
        className="fixed right-0 top-1/3 bottom-1/3 w-3 z-50 flex items-center justify-center transition-all duration-300 pointer-events-auto cursor-pointer group"
        onClick={() => setIsProjectionMenuOpen(prev => !prev)}
        onTouchStart={(e) => {
          const touch = e.touches[0];
          const sX = touch.clientX;
          const handleTouchMove = (moveEv: TouchEvent) => {
            const currentX = moveEv.touches[0].clientX;
            if (sX - currentX > 40) {
              setIsProjectionMenuOpen(true);
              document.removeEventListener("touchmove", handleTouchMove);
            }
          };
          document.addEventListener("touchmove", handleTouchMove);
          const handleTouchEnd = () => {
            document.removeEventListener("touchmove", handleTouchMove);
            document.removeEventListener("touchend", handleTouchEnd);
          };
          document.addEventListener("touchend", handleTouchEnd);
        }}
      >
        {/* Subtle glowing marker line */}
        <div className="absolute right-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-amber-500/10 via-amber-400/50 to-amber-500/10 group-hover:w-1.5 transition-all duration-300 rounded-l shadow-[0_0_15px_rgba(245,158,11,0.3)]" />
        
        {/* Hover expanding pull-knob helper info */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-3 group-hover:-translate-x-1 bg-[#060608]/92 border border-amber-800/40 backdrop-blur-md px-1 py-4 rounded-l-xl shadow-lg flex flex-col items-center justify-center space-y-1">
          <ChevronLeft className="w-3 h-3 text-amber-400 animate-pulse" />
          <span className="text-[7.5px] font-mono tracking-[0.2em] text-amber-400 font-bold uppercase [writing-mode:vertical-lr] select-none pointer-events-none scale-90">
            SPATIAL
          </span>
        </div>
      </div>

    </div>
  );
}
