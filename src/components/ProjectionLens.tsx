import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Search, 
  ExternalLink, 
  Folder, 
  ChevronRight, 
  Globe, 
  Play, 
  FileText, 
  Tv, 
  Terminal,
  Cpu,
  Sliders,
  ShoppingBag,
  Download,
  FolderPlus,
  FilePlus,
  Trash2,
  Maximize2,
  Minimize2,
  FolderOpen,
  Volume2,
  Plus,
  Music,
  CloudLightning,
  ChevronLeft,
  Settings,
  Tv2,
  Save,
  CheckCircle,
  Laptop,
  Disc,
  BookOpen,
  GraduationCap,
  Star,
  Award,
  Smile,
  Gamepad2,
  Sparkles,
  Minus
} from "lucide-react";

import NebulaPaintBoard from "./NebulaPaintBoard";
import { piperEngine, PIPER_PRESETS } from "../lib/piperEngine";

export type ProjectionType = "BROWSER" | "FILES" | "APPS" | "MARKET" | "SETTINGS";

interface ProjectionLensProps {
  type: ProjectionType;
  query: string;
  onClose: () => void;
  onMinimize?: () => void;
  originX?: number;
  originY?: number;
  isLeft?: boolean;
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
  isKidsMode?: boolean;
}

interface FSNode {
  id: string;
  name: string;
  type: "file" | "directory";
  parentId: string | null;
  content?: string;
}

interface AppItem {
  id: string;
  name: string;
  description: string;
  size: string;
  icon: "youtube" | "disney" | "prime" | "spotify" | "netflix" | "wikipedia" | "weather" | "synth" | "game" | "coloring";
  color: string;
  category: string;
  ageCategory?: "PRE" | "MID" | "ADV";
}

export default function ProjectionLens({ 
  type, 
  query, 
  onClose,
  onMinimize,
  originX = window.innerWidth / 2,
  originY = window.innerHeight / 2,
  isLeft = false,
  isFullScreen = false,
  onToggleFullScreen,
  isKidsMode = false
}: ProjectionLensProps) {
  // ---------------------------------------------------------
  // THEME COLOR SCHEME MAPPING
  // ---------------------------------------------------------
  const [activeTheme, setActiveTheme] = useState<string>(() => {
    return localStorage.getItem("system_core_theme") || "AMBER";
  });

  const getThemeStyles = (themeName: string) => {
    switch (themeName) {
      case "EMERALD":
        return {
          accent: "text-emerald-400",
          border: "border-emerald-500/40",
          shadow: "shadow-[0_0_25px_rgba(16,235,115,0.08)]",
          glow: "bg-emerald-500",
          bg: "bg-emerald-950/10",
          text: "text-emerald-100",
          button: "bg-emerald-900/25 hover:bg-emerald-900/40 border-emerald-800/40 text-emerald-400"
        };
      case "CYBERPUNK":
        return {
          accent: "text-pink-500",
          border: "border-pink-500/40",
          shadow: "shadow-[0_0_25px_rgba(236,72,153,0.1)]",
          glow: "bg-pink-500",
          bg: "bg-pink-950/10",
          text: "text-cyan-100",
          button: "bg-pink-900/25 hover:bg-pink-900/40 border-pink-800/40 text-pink-400"
        };
      case "SLATE":
        return {
          accent: "text-slate-400",
          border: "border-slate-500/40",
          shadow: "shadow-[0_0_20px_rgba(148,163,184,0.08)]",
          glow: "bg-slate-400",
          bg: "bg-slate-900/10",
          text: "text-slate-100",
          button: "bg-slate-800/30 hover:bg-slate-800/50 border-slate-700/40 text-slate-300"
        };
      case "AMBER":
      default:
        return {
          accent: "text-amber-500",
          border: "border-amber-500/40",
          shadow: "shadow-[0_0_24px_rgba(245,158,11,0.08)]",
          glow: "bg-amber-500",
          bg: "bg-amber-950/10",
          text: "text-amber-100",
          button: "bg-amber-950/30 hover:bg-amber-950/40 border-amber-900/40 text-amber-500"
        };
    }
  };

  const themeStyles = getThemeStyles(activeTheme);

  // ---------------------------------------------------------
  // SYSTEM SYNTHESIZER
  // ---------------------------------------------------------
  const playSfx = (freq: number, type: OscillatorType = "sine", vol = 0.02, duration = 0.5) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      const vScalar = (window as any).__systemVol !== undefined 
        ? (window as any).__systemVol 
        : parseFloat(localStorage.getItem("system_vol") ?? "1.0");
      const finalVol = vol * vScalar * 0.8;

      gainNode.gain.setValueAtTime(finalVol, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (_) {}
  };

  useEffect(() => {
    // Holographic launch chime
    if (isKidsMode) {
      playCheerMelody();
    } else {
      playSfx(type === "SETTINGS" ? 698.46 : 587.33, "sine", 0.025, 0.8);
      playSfx(type === "MARKET" ? 880 : 783.99, "sine", 0.015, 0.6);
    }
  }, [type]);

  const triggerClickSound = () => {
    playSfx(isKidsMode ? 880 : 660, "sine", 0.015, 0.12);
  };

  const playCheerMelody = () => {
    const scale = [523.25, 659.25, 783.99, 1046.50];
    scale.forEach((freq, index) => {
      setTimeout(() => playSfx(freq, "sine", 0.02, 0.35), index * 100);
    });
  };

  const playErrorMelody = () => {
    playSfx(196.00, "sawtooth", 0.02, 0.3);
    setTimeout(() => playSfx(146.83, "sawtooth", 0.02, 0.35), 100);
  };

  // ---------------------------------------------------------
  // KIDS MODE INTERACTIVE LESSONS & EXERCISES STATES
  // ---------------------------------------------------------
  const [kidsActiveLesson, setKidsActiveLesson] = useState<string>("generator"); // generator, luna, math, spelling, trivia, painting
  const [selectedLunaLetterId, setSelectedLunaLetterId] = useState<string>("letter-1");
  
  // Teacher's Daily Challenge Generator State Types
  interface GeneratedChallenge {
    id: string;
    level: "PRE" | "MID" | "ADV";
    subject: "math" | "spelling" | "reading";
    question: string;
    hint: string;
    options: string[];
    correctAnswer: string;
    storyContent?: string;
    fact?: string;
  }

  const [generatorLevel, setGeneratorLevel] = useState<"PRE" | "MID" | "ADV">("MID");
  const [generatorSubject, setGeneratorSubject] = useState<"math" | "spelling" | "reading">("math");
  const [generatorChallenge, setGeneratorChallenge] = useState<GeneratedChallenge | null>(null);
  const [generatorStatus, setGeneratorStatus] = useState<"idle" | "correct" | "error">("idle");
  const [generatorScore, setGeneratorScore] = useState(() => parseInt(localStorage.getItem("kids_curriculum_score") || "10")); // small starting seed
  const [generatorStreak, setGeneratorStreak] = useState(() => parseInt(localStorage.getItem("kids_curriculum_streak") || "0"));
  const [selectedGeneratorOption, setSelectedGeneratorOption] = useState<string | null>(null);
  const [showGeneratorHint, setShowGeneratorHint] = useState(false);
  const [unlockedStickers, setUnlockedStickers] = useState<string[]>(() => {
    const raw = localStorage.getItem("kids_curriculum_stickers");
    return raw ? JSON.parse(raw) : ["🌌 Cosmic Explorer", "🪐 Nebula Artist"];
  });

  // Kids Custom Explorer Profile persistence vectors
  const [explorerProfile, setExplorerProfile] = useState(() => {
    const raw = localStorage.getItem("kids_explorer_profile");
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.warn("Could not load kids explorer profile:", e);
      }
    }
    return {
      name: "Star Ranger",
      age: 6,
      avatar: "🚀 Nebula Ranger",
      gender: "STAR_RANGER"
    };
  });

  const getExplorerRank = (score: number) => {
    if (score < 50) return { title: "⭐️ Space Cadet ⭐️", desc: "Embarking on the cosmic coordinate calibration quest", color: "text-blue-400" };
    if (score < 150) return { title: "🪐 Astro Pilot 🪐", desc: "Successfully navigated standard orbit boosters", color: "text-cyan-400" };
    if (score < 300) return { title: "🛸 Galaxy Commander 🛸", desc: "Supervised high-fidelity logic transceivers", color: "text-purple-400" };
    if (score < 500) return { title: "⚡ Nebula Ranger ⚡", desc: "Holographic guardian of the interstellar boundary", color: "text-pink-400" };
    return { title: "👑 Cosmos Guardian 👑", desc: "Universal master of cognitive star coordinates", color: "text-amber-400 animate-pulse" };
  };

  const [isLoadingChallenge, setIsLoadingChallenge] = useState(false);

  // Choose-Your-Own-Adventure Space Storyteller States
  const [adventureSetting, setAdventureSetting] = useState<string>("🌲 Jellyfish Forest");
  const [adventureTheme, setAdventureTheme] = useState<string>("Friendly Space Squirrels");
  const [adventureCompanion, setAdventureCompanion] = useState<string>("🤖 Robo-Buddy Bolt");
  
  interface StoryBook {
    title: string;
    character: string;
    magicKeyphrase: string;
    pages: string[];
  }
  const [activeStoryBook, setActiveStoryBook] = useState<StoryBook | null>(null);
  const [storyCurrentPage, setStoryCurrentPage] = useState<number>(0);
  const [isLoadingStory, setIsLoadingStory] = useState<boolean>(false);
  const [adventureChoicesLog, setAdventureChoicesLog] = useState<string[]>([]);
  const [storyCompleted, setStoryCompleted] = useState<boolean>(false);

  const handleGenerateCurriculumChallenge = async (lvl: "PRE" | "MID" | "ADV", sub: "math" | "spelling" | "reading") => {
    setGeneratorStatus("idle");
    setSelectedGeneratorOption(null);
    setShowGeneratorHint(false);
    setIsLoadingChallenge(true);

    // Attempt to invoke the Gemini-powered server endpoint to get a customized AI question
    try {
      const response = await fetch("/api/kids/exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: explorerProfile.name,
          age: explorerProfile.age,
          gender: explorerProfile.gender
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.questions && data.questions.length > 0) {
          // Select a question from the returned AI deck
          const chosen = data.questions[Math.floor(Math.random() * data.questions.length)];
          const mapped: GeneratedChallenge = {
            id: chosen.id || "ai-" + Math.random().toString(36).substr(2, 5),
            level: lvl,
            subject: sub,
            question: chosen.question,
            hint: chosen.hint || "Ask Luna for a helpful clue star!",
            options: chosen.options,
            correctAnswer: chosen.options[chosen.correctIndex] || chosen.options[0],
            storyContent: sub === "reading" ? (data.theme || "Reading Story Passage") : undefined,
            fact: chosen.explanation || "Wonderful reasoning!"
          };
          setGeneratorChallenge(mapped);
          setIsLoadingChallenge(false);
          return; // Skip offline fallback since we fetched high fidelity AI!
        }
      }
    } catch (err) {
      console.log("Kids API AI Generation offline/unavailable, falling back to local curriculum engines:", err);
    }

    let challenge: GeneratedChallenge;

    if (sub === "math") {
      let num1 = 0, num2 = 0, q = "", ans = 0, hint = "";
      if (lvl === "PRE") {
        num1 = Math.floor(Math.random() * 4) + 1; // 1 to 4
        num2 = Math.floor(Math.random() * 3) + 1; // 1 to 3
        const isAdd = Math.random() > 0.4;
        if (isAdd) {
          q = `Combine the solar items: ${num1} starships and ${num2} glowing moon modules. How many items do you have in total?`;
          ans = num1 + num2;
          hint = `Count them all together in sequence: ${num1} + ${num2}.`;
        } else {
          if (num1 < num2) { const temp = num1; num1 = num2; num2 = temp; }
          q = `Subtract: you had ${num1} mini-rockets and gave ${num2} of them to Sunny. How many mini-rockets remain?`;
          ans = num1 - num2;
          hint = `Take away ${num2} from the starting group of ${num1}.`;
        }
      } else if (lvl === "MID") {
        num1 = Math.floor(Math.random() * 11) + 5; // 5 to 15
        num2 = Math.floor(Math.random() * 10) + 2; // 2 to 11
        const isAdd = Math.random() > 0.5;
        if (isAdd) {
          q = `Calculate the starlight coordinates: ${num1} + ${num2} = ?`;
          ans = num1 + num2;
          hint = "Add the single digit first, then shift up the ten!";
        } else {
          if (num1 < num2) { const temp = num1; num1 = num2; num2 = temp; }
          q = `Recalculate fuel levels: ${num1} - ${num2} = ?`;
          ans = num1 - num2;
          hint = `What is ${num2} subtracted from the starting amount of ${num1}?`;
        }
      } else { // ADV
        num1 = Math.floor(Math.random() * 7) + 3; // 3 to 9
        num2 = Math.floor(Math.random() * 8) + 3; // 3 to 10
        const isMult = Math.random() > 0.5;
        if (isMult) {
          q = `Deploy satellite networks in groups: ${num1} teams × ${num2} devices = how many devices total?`;
          ans = num1 * num2;
          hint = `What is ${num1} multiplied by ${num2}?`;
        } else {
          const prod = num1 * num2;
          q = `Equally divide ${prod} crystal pieces among ${num1} bio-domes. How many pieces go into each dome?`;
          ans = num2;
          hint = `Recall your multiplication table: what times ${num1} equals ${prod}?`;
        }
      }

      // Generate close distractors
      const dists = new Set<string>();
      dists.add(ans.toString());
      let attempts = 0;
      while (dists.size < 4 && attempts < 100) {
        attempts++;
        const option = ans + (Math.floor(Math.random() * 7) - 3);
        if (option >= 0) {
          dists.add(option.toString());
        }
      }
      let fallback = 1;
      while (dists.size < 4) {
        dists.add((ans + fallback).toString());
        fallback++;
      }
      const opts = Array.from(dists).sort(() => Math.random() - 0.5);

      challenge = {
        id: "cur-math-" + Math.random().toString(36).substr(2, 5),
        level: lvl,
        subject: "math",
        question: q,
        hint: hint,
        options: opts,
        correctAnswer: ans.toString(),
        fact: "Engineers use simple math algebra every single day to track planet routes and launch orbital space probes!"
      };
    } else if (sub === "spelling") {
      const spellLists = {
        PRE: ["SUN", "MOON", "STAR", "MARS", "SKY", "BOY", "TOY", "PET", "FLY", "HAT"],
        MID: ["COMET", "PLANET", "ROCKET", "CRATER", "GALAXY", "METEOR", "ORBIT", "SOLAR"],
        ADV: ["ASTRONAUT", "TELESCOPE", "NEBULA", "SATELLITE", "SUPERNOVA", "GRAVITY", "COSMOS", "MISSION"]
      };

      const wordList = spellLists[lvl];
      const pickedWord = wordList[Math.floor(Math.random() * wordList.length)];
      const blankIdx = Math.floor(Math.random() * (pickedWord.length - 1)) + 1; // skip 0
      const missingLetter = pickedWord[blankIdx];

      const splitWord = pickedWord.split("");
      splitWord[blankIdx] = "_";
      const qStr = splitWord.join(" ");

      const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const optsSet = new Set<string>();
      optsSet.add(missingLetter);
      let attemptsSpell = 0;
      while (optsSet.size < 4 && attemptsSpell < 100) {
        attemptsSpell++;
        optsSet.add(alphabet[Math.floor(Math.random() * alphabet.length)]);
      }
      let fallbackSpellIdx = 0;
      while (optsSet.size < 4) {
        optsSet.add(alphabet[fallbackSpellIdx % alphabet.length]);
        fallbackSpellIdx++;
      }
      const opts = Array.from(optsSet).sort(() => Math.random() - 0.5);

      const definitions: Record<string, string> = {
        SUN: "Our glowing yellow daytime star at the gravity center.",
        MOON: "Earth's dusty white round rocky neighbor in night sky.",
        STAR: "A distant light spark blinking inside deep galaxy.",
        MARS: "The rusty crimson-red desert planet hosting Olympus Mons.",
        SKY: "The beautiful blue ceiling full of air and clouds above.",
        BOY: "A young friendly space explorer child.",
        TOY: "A cute little action figure or game to play inside solar cabin.",
        PET: "A friendly space dog or kitten who loves spaceships.",
        FLY: "Soaring across heavy winds high into space atmosphere.",
        HAT: "An astronaut's soft headwear shield worn under helmet.",
        COMET: "A spectacular ice snowball melting in a long blue gas tail.",
        PLANET: "A massive rocky or gas sphere rolling in circular star track.",
        ROCKET: "A metal tube shooting burning fuel down and zooming straight up.",
        CRATER: "A bowl-shaped lunar pit dug out by crashing space stones.",
        GALAXY: "A massive spiral city of billions of suns and solar dust.",
        METEOR: "A sparkling fire streak glowing as a shooting rock hits air.",
        ORBIT: "The invisible oval highway a path goes around a heavy body.",
        SOLAR: "Related to our yellow sun star's energy emissions.",
        ASTRONAUT: "A brave girl or boy wearing white suits to walk in stars.",
        TELESCOPE: "A tube of magnifying mirrors that brings planets closer.",
        NEBULA: "The most gorgeous rainbow space cloud where baby stars are born.",
        SATELLITE: "An advanced robotic transmitter orbiter relaying high-freq internet.",
        SUPERNOVA: "A spectacular light boom of a giant dying massive star.",
        GRAVITY: "The celestial magnetic force that anchors oceans down to planets.",
        COSMOS: "The infinite canvas of space, dark matter, and galaxies.",
        MISSION: "An exciting exploration flight carrying scientific drones to Neptune."
      };

      challenge = {
        id: "cur-spell-" + Math.random().toString(36).substr(2, 5),
        level: lvl,
        subject: "spelling",
        question: `Solve spelling puzzle: Pick the missing character inside "${qStr}"`,
        hint: definitions[pickedWord] || "Complete the word puzzle!",
        options: opts,
        correctAnswer: missingLetter,
        storyContent: `TARGET SPACE WORD: ${pickedWord}`,
        fact: `The word "${pickedWord}" is created from elements forged in burning stars!`
      };
    } else {
      // READING
      const readPools = {
        PRE: [
          {
            story: "Pluto is an adorable little space tracker bot. He wears a soft gold antenna with mini-bells that chime rhythmically as he bounces happily in Mars sand craters.",
            q: "What color is Pluto's cute little space antenna?",
            opt: ["Shiny Silver", "Deep Purple", "Soft Gold", "Crimson Red"],
            ans: "Soft Gold",
            f: "Pluto was considered the ninth primary planet until 2006, when scientists classified it as a dwarf planet!"
          },
          {
            story: "Astronaut Dan loves to eat space strawberries. They are frozen super cold and kept in sealed silver bags so they stay crunchy like little sweet cookies!",
            q: "How are Dan's space strawberries stored so they stay sweet?",
            opt: ["In a hot lava jar", "In sealed silver bags", "In heavy ice buckets", "In a rusty bucket"],
            ans: "In sealed silver bags",
            f: "Freeze-drying food extracts water while conserving 98% of natural nutrients for years in dry space storage!"
          }
        ],
        MID: [
          {
            story: "NASA designs smart rovers with thick aluminum wheels to cross Mars desert landscapes without getting flat tires. These clever explorers use laser eyes to vaporize red rocks, helping scientists solve if ancient Martian rivers held drinking water.",
            q: "What do the Mars rovers write or examine with their laser eyes?",
            opt: ["They carve letters to talk to aliens", "They vaporize dust rocks to check ancient water trace", "They weld panels to build space cities", "They warm up cold frozen astronauts"],
            ans: "They vaporize dust rocks to check ancient water trace",
            f: "Mars rovers like Curiosity and Perseverance have traveled miles across Jezero Crater to discover elements of life!"
          },
          {
            story: "The International Space Station is a modular lab flying in low orbit, circling Earth 16 times in a single day! Astronauts from all nations live together, growing fresh space lettuce and doing experiments in weightless gravity rooms.",
            q: "How many times does the International Space Station circle around our Earth each day?",
            opt: ["Precisely 1 time", "Only 4 times", "About 16 times", "Over 100 times"],
            ans: "About 16 times",
            f: "The space station flies at a high speed of 17,500 miles per hour, 250 miles above Earth's surface!"
          }
        ],
        ADV: [
          {
            story: "Black holes are region centers of pack gravity so intense that absolute nothing, not even lightning-fast starlight, can slip past their thresholds. These structures are born when massive collapsing giant stars cave in under their own weight. The boundary point of safe return is called the event horizon, a cosmic gate where physics laws are heavily warped.",
            q: "What is the boundary border of safe return around a black hole called?",
            opt: ["The gravity warp line", "The black star gate", "The event horizon", "The singularity point"],
            ans: "The event horizon",
            f: "The first ever photograph of a black hole's shadow was taken in 250-million-light-year distant Galaxy M87!"
          },
          {
            story: "Titan is Saturn's largest moon and is the only satellite in our solar solar system to boast a thick cloudy atmosphere. Remarkably, Titan hosts active liquid lakes, rivers, and rain rain droplets. However, these lakes are not filled with fresh water. Instead, they are made of icy, super-cooled liquid methane and ethane gases!",
            q: "What chemical liquid fills the rain lakes and rushing rivers of Saturn's moon Titan?",
            opt: ["Fresh pristine water ice", "Super-cooled methane and ethane", "Molten golden iron lava", "Liquid neon radiation"],
            ans: "Super-cooled methane and ethane",
            f: "Titan's atmosphere is mostly nitrogen gas, identical to Earth, but its bitter cold of -290°F keeps methane liquid!"
          }
        ]
      };

      const list = readPools[lvl];
      const picked = list[Math.floor(Math.random() * list.length)];

      challenge = {
        id: "cur-read-" + Math.random().toString(36).substr(2, 5),
        level: lvl,
        subject: "reading",
        question: picked.q,
        hint: "Reread the text carefully to find the specific clue keyword!",
        options: picked.opt,
        correctAnswer: picked.ans,
        storyContent: picked.story,
        fact: picked.f
      };
    }

    setGeneratorChallenge(challenge);
    setIsLoadingChallenge(false);
  };

  const handleCheckGeneratorAnswer = (ans: string) => {
    if (generatorStatus !== "idle") return;
    triggerClickSound();
    setSelectedGeneratorOption(ans);

    if (ans === generatorChallenge?.correctAnswer) {
      setGeneratorStatus("correct");
      playCheerMelody();
      
      const newScore = generatorScore + 15;
      setGeneratorScore(newScore);
      localStorage.setItem("kids_curriculum_score", newScore.toString());

      const newStreak = generatorStreak + 1;
      setGeneratorStreak(newStreak);
      localStorage.setItem("kids_curriculum_streak", newStreak.toString());

      const stickersList = [
        "👽 Alien Whisperer", 
        "🚀 Stellar Reader", 
        "🏅 Orbit Math Genius", 
        "⭐ Cosmos Speller", 
        "🌌 Cosmic Explorer",
        "🪐 Nebula Artist",
        "🧠 Gravity Master",
        "☄️ Comet Chaser",
        "🔭 Galaxy Visionary"
      ];
      
      if (Math.random() > 0.3 && unlockedStickers.length < stickersList.length) {
        const locked = stickersList.filter(s => !unlockedStickers.includes(s));
        if (locked.length > 0) {
          const newSticker = locked[Math.floor(Math.random() * locked.length)];
          const updated = [...unlockedStickers, newSticker];
          setUnlockedStickers(updated);
          localStorage.setItem("kids_curriculum_stickers", JSON.stringify(updated));
        }
      }

    } else {
      setGeneratorStatus("error");
      playErrorMelody();
      setGeneratorStreak(0);
      localStorage.setItem("kids_curriculum_streak", "0");
      setTimeout(() => {
        setGeneratorStatus("idle");
      }, 1800);
    }
  };

  const handleFetchAdventureStory = async () => {
    setIsLoadingStory(true);
    setStoryCurrentPage(0);
    setAdventureChoicesLog([]);
    setStoryCompleted(false);
    try {
      const response = await fetch("/api/kids/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: explorerProfile.name,
          age: explorerProfile.age,
          gender: explorerProfile.gender,
          setting: adventureSetting,
          theme: `${adventureTheme} with my companion ${adventureCompanion}`
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.pages && data.pages.length === 4) {
          setActiveStoryBook({
            title: data.title || "The Cosmic Mystery Quest",
            character: data.character || adventureCompanion,
            magicKeyphrase: data.magicKeyphrase || "COSMIC SPARKLE!",
            pages: data.pages
          });
          setIsLoadingStory(false);
          return;
        }
      }
    } catch (e) {
      console.log("Failed to fetch story, using high-fidelity fallback story:", e);
    }

    // Fallback stories if AI fails/offline
    const isToddler = explorerProfile.age <= 5;
    const fallbackTitle = isToddler 
      ? `✨ ${explorerProfile.name} and the Sparkly Butterfly Dance! ✨`
      : `🚀 ${explorerProfile.name} and the Binary Code Secret of Planet Mech-7! 🚀`;
    const fallbackChar = isToddler ? "Luna the Star Sprite" : "Bolt the Mechanical Buddy";
    const fallbackKey = isToddler ? "SPARKLE SHIMMER!" : "RUN CORE INITIALIZE!";
    const fallbackPages = isToddler ? [
      `Once upon a time, in a glowing forest with blue grass, a sleepy little Star Sprite named Luna flew down to sit next to ${explorerProfile.name}. Luna's wings were made of glowing candy sugar!`,
      `Luna whispered, "Let's whisper the magic word: SPARKLE SHIMMER!" When they spoke, the trees grew purple chocolate bubble lollipops! A small bunny with golden spots began to play a tambourine.`,
      `Hundreds of sparkly blue butterflies rose from the grass, dancing like falling stars. They made a beautiful sparkling spiral loop in the air around ${explorerProfile.name}, tickling their nose!`,
      `Luna hugged ${explorerProfile.name} and said: "You are the bravest space traveler in this whole sky. Keep dreaming, and your stardust will light up any dark room!" Then she went to sleep in a warm dandelion.`
    ] : [
      `Deep inside the Neon Nebula, young space coder ${explorerProfile.name} received a blinking alert vector from Planet Mech-7. A friendly little robot named Bolt was stuck inside a glowing code cage!`,
      `To open the door, Bolt pointed at the neon keyboard. "We need to run a logic loop before the solar eclipse! Speak the code script: RUN CORE INITIALIZE!"`,
      `When ${explorerProfile.name} shouted the phrase, a line of green star letters appeared in sky, completing a logic query. The code cage unlocked with a beautiful electronic symphony chime!`,
      `Bolt cheered and handed ${explorerProfile.name} a glowing golden circuit badge. "Task accomplished, master programmer! Together we decoded the nebula. Our system is fully operational and super friendly!"`
    ];

    setActiveStoryBook({
      title: fallbackTitle,
      character: fallbackChar,
      magicKeyphrase: fallbackKey,
      pages: fallbackPages
    });
    setIsLoadingStory(false);
  };

  // Run initial generator challenge once when component is ready or if challenge is empty
  useEffect(() => {
    if (isKidsMode && !generatorChallenge) {
      handleGenerateCurriculumChallenge(generatorLevel, generatorSubject);
    }
  }, [isKidsMode, generatorLevel, generatorSubject]);

  // Math booster state
  const [mathNum1, setMathNum1] = useState(3);
  const [mathNum2, setMathNum2] = useState(4);
  const [mathAnswer, setMathAnswer] = useState("");
  const [mathScore, setMathScore] = useState(() => parseInt(localStorage.getItem("kids_math_score") || "0"));
  const [mathStatus, setMathStatus] = useState<"idle" | "correct" | "error">("idle");
  const [mathFeedback, setMathFeedback] = useState("");

  const resetMathQuestion = () => {
    const num1 = Math.floor(Math.random() * 8) + 2;
    const num2 = Math.floor(Math.random() * 8) + 2;
    setMathNum1(num1);
    setMathNum2(num2);
    setMathAnswer("");
    setMathStatus("idle");
    setMathFeedback("");
  };

  const handleCheckMathAnswer = () => {
    triggerClickSound();
    const parsed = parseInt(mathAnswer.trim());
    if (isNaN(parsed)) return;
    
    if (parsed === mathNum1 + mathNum2) {
      setMathStatus("correct");
      setMathFeedback("🌟 INCREDIBLE! Booster Charged! +10 Stars 🚀");
      const newScore = mathScore + 10;
      setMathScore(newScore);
      localStorage.setItem("kids_math_score", newScore.toString());
      playCheerMelody();
      setTimeout(() => {
        resetMathQuestion();
      }, 2000);
    } else {
      setMathStatus("error");
      setMathFeedback("⚡ Incorrect! Re-calculating... Try again!");
      playErrorMelody();
    }
  };

  // Spelling activity state
  const [spellingIndex, setSpellingIndex] = useState(0);
  const spellingPool = [
    { word: "SUNNY", partial: "S U _ N Y", missing: "N", options: ["M", "N", "L", "T"] },
    { word: "EARTH", partial: "E A _ T H", missing: "R", options: ["E", "A", "R", "S"] },
    { word: "GALAXY", partial: "G A L _ X Y", missing: "A", options: ["O", "U", "A", "I"] },
    { word: "MOON", partial: "M O _ N", missing: "O", options: ["U", "O", "E", "A"] },
    { word: "STAR", partial: "_ T A R", missing: "S", options: ["S", "C", "P", "L"] }
  ];
  const [spellingStatus, setSpellingStatus] = useState<"idle" | "correct" | "error">("idle");
  const [spellingScore, setSpellingScore] = useState(0);

  const handleChooseLetter = (letter: string) => {
    triggerClickSound();
    if (letter === spellingPool[spellingIndex].missing) {
      setSpellingStatus("correct");
      setSpellingScore(prev => prev + 1);
      playCheerMelody();
      setTimeout(() => {
        setSpellingStatus("idle");
        setSpellingIndex(prev => (prev + 1) % spellingPool.length);
      }, 1500);
    } else {
      setSpellingStatus("error");
      playErrorMelody();
      setTimeout(() => setSpellingStatus("idle"), 1000);
    }
  };

  // Space trivia state
  const [triviaIndex, setTriviaIndex] = useState(0);
  const triviaPool = [
    { q: "Which planet is famous for its gorgeous icy rings?", opt: ["Mars", "Jupiter", "Saturn", "Neptune"], ans: "Saturn" },
    { q: "What is the name of our big, warm solar star?", opt: ["Polaris", "The Sun", "Sirius", "Alpha Centauri"], ans: "The Sun" },
    { q: "Which planet is called the Red Planet because of its rusty dust?", opt: ["Venus", "Earth", "Mars", "Mercury"], ans: "Mars" },
    { q: "What is the shape of planet Earth?", opt: ["A flat circle", "A perfect cube", "A round sphere", "A tall triangle"], ans: "A round sphere" }
  ];
  const [triviaStatus, setTriviaStatus] = useState<"idle" | "correct" | "error">("idle");
  const [triviaScore, setTriviaScore] = useState(0);

  const handleSelectTriviaOption = (opt: string) => {
    triggerClickSound();
    if (opt === triviaPool[triviaIndex].ans) {
      setTriviaStatus("correct");
      setTriviaScore(prev => prev + 1);
      playCheerMelody();
      setTimeout(() => {
        setTriviaStatus("idle");
        setTriviaIndex(prev => (prev + 1) % triviaPool.length);
      }, 1500);
    } else {
      setTriviaStatus("error");
      playErrorMelody();
      setTimeout(() => setTriviaStatus("idle"), 1000);
    }
  };

  // Kids coloring and painting pad state (7x7 grid)
  const [paintGrid, setPaintGrid] = useState<Record<string, string>>({});
  const [brushColor, setBrushColor] = useState("#f43f5e"); // red-rose, yellow, lime, sky, purple

  // Kids reading quest state
  const [readingIndex, setReadingIndex] = useState(0);
  const readingPool = [
    {
      story: "Luna the happy spaceship is zooming past Mars. She is painted bright silver and has shiny golden wings! She is on her way to visit Saturn and see its beautiful giant rings made of sparkling ice.",
      question: "What color are Luna's shiny wings?",
      options: ["Silver", "Golden", "Blue", "Emerald"],
      ans: "Golden",
      fact: "Saturn's rings are made of billions of chunks of glistening ice and rocks, some as small as a grain of sand, others as large as a house!"
    },
    {
      story: "The Sun is a giant, warm star at the center of our Solar System. It gives light and warm heat to all of the planets around it. Without the Sun's friendly rays, planet Earth would be super cold and covered in thick glaciers!",
      question: "What is at the center of our Solar System?",
      options: ["The Moon", "The Sun", "Jupiter", "A black hole"],
      ans: "The Sun",
      fact: "The Sun is so incredibly large that about one million planet Earths could fit inside of it!"
    },
    {
      story: "Stardust astronauts wear special thick suits and big white helmets when they float in space. Their helmets have dark gold visors to protect their eyes from the very bright sunshine outside of Earth.",
      question: "Why do astronauts have gold visors on their helmets?",
      options: ["To see in the dark", "To protect their eyes from bright sunshine", "To breathe better", "To talk to aliens"],
      ans: "To protect their eyes from bright sunshine",
      fact: "Gold visors are coated with a super-thin layer of real gold to reflect hot, harmful solar infrared radiation!"
    }
  ];
  const [readingStatus, setReadingStatus] = useState<"idle" | "correct" | "error">("idle");
  const [readingScore, setReadingScore] = useState(0);
  const [selectedReadingOption, setSelectedReadingOption] = useState<string | null>(null);

  // Space Explorer Dino Jumping game states
  const [dinoScore, setDinoScore] = useState(0);
  const [dinoHighScore, setDinoHighScore] = useState(() => parseInt(localStorage.getItem("kids_dino_highscore") || "0"));
  const [isPlayingDino, setIsPlayingDino] = useState(false);
  const [isDinoGameOver, setIsDinoGameOver] = useState(false);
  const [dinoY, setDinoY] = useState(0); // Jump offset
  const [obstacleX, setObstacleX] = useState(300); // Obstacle horizontal offset (right to left)
  const [isJumping, setIsJumping] = useState(false);

  useEffect(() => {
    if (!isPlayingDino || isDinoGameOver) return;
    let obstacleTimer: any;

    obstacleTimer = setInterval(() => {
      setObstacleX(prev => {
        if (prev <= 12) {
          // Check collision!
          // Obstacle is at 0-25px, if Dino is not jumping (dinoY <= 25), collision!
          if (dinoY < 25) {
            setIsDinoGameOver(true);
            playErrorMelody();
            return 300;
          }
          // Obstacle passed successfully, score increases!
          setDinoScore(s => {
            const next = s + 10;
            if (next > dinoHighScore) {
              setDinoHighScore(next);
              localStorage.setItem("kids_dino_highscore", next.toString());
            }
            return next;
          });
          playSfx(880, "sine", 0.015, 0.1);
          return 300; // Reset asteroid position
        }
        return prev - 10;
      });
    }, 40);

    return () => {
      clearInterval(obstacleTimer);
    };
  }, [isPlayingDino, isDinoGameOver, dinoY, dinoHighScore]);

  const handleDinoJump = () => {
    if (isJumping || isDinoGameOver || !isPlayingDino) return;
    setIsJumping(true);
    playSfx(392.00, "sine", 0.02, 0.2);
    // Up path
    let jumpCount = 0;
    const interval = setInterval(() => {
      setDinoY(prev => {
        if (jumpCount < 8) {
          jumpCount++;
          return prev + 8;
        } else if (jumpCount < 16) {
          jumpCount++;
          return prev - 8;
        } else {
          clearInterval(interval);
          setIsJumping(false);
          return 0; // Ground level
        }
      });
    }, 30);
  };

  // Settings Parents Gate state
  const [isParentsGatePassed, setIsParentsGatePassed] = useState(false);
  const [parentsChallengeNum1, setParentsChallengeNum1] = useState(8);
  const [parentsChallengeNum2, setParentsChallengeNum2] = useState(6);
  const [parentsGateInput, setParentsGateInput] = useState("");
  const [parentsGateError, setParentsGateError] = useState(false);

  const regenerateParentsChallenge = () => {
    setParentsChallengeNum1(Math.floor(Math.random() * 6) + 6); // 6-11
    setParentsChallengeNum2(Math.floor(Math.random() * 5) + 4); // 4-8
    setParentsGateInput("");
    setParentsGateError(false);
  };

  // ---------------------------------------------------------
  // 1. BROWSER WORKSPACE
  // ---------------------------------------------------------
  const [searchEngine, setSearchEngine] = useState<"Google" | "Bing" | "DuckDuckGo">(() => {
    return (localStorage.getItem("system_browser_engine") as any) || "Google";
  });
  const [browserInput, setBrowserInput] = useState(query || "");
  const [browserActivePage, setBrowserActivePage] = useState<string | null>(null);

  const handleSearchEngineChange = (engine: "Google" | "Bing" | "DuckDuckGo") => {
    setSearchEngine(engine);
    localStorage.setItem("system_browser_engine", engine);
    playSfx(523.25, "sine", 0.015, 0.15);
  };

  const executeBrowserNavigation = () => {
    triggerClickSound();
    let queryPayload = browserInput.trim();
    if (!queryPayload) return;

    // Check if it's an absolute link
    if (queryPayload.startsWith("http://") || queryPayload.startsWith("https://") || queryPayload.includes(".")) {
      let dest = queryPayload;
      if (!dest.startsWith("http://") && !dest.startsWith("https://")) {
        dest = "https://" + dest;
      }
      playSfx(784, "sine", 0.02, 0.3);
      window.open(dest, "_blank", "noopener,noreferrer");
    } else {
      // Trigger search engine query tab breakout
      let searchUrl = "";
      if (searchEngine === "Google") {
        searchUrl = `https://www.google.com/search?q=${encodeURIComponent(queryPayload)}`;
      } else if (searchEngine === "Bing") {
        searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(queryPayload)}`;
      } else {
        searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(queryPayload)}`;
      }
      playSfx(784, "sine", 0.02, 0.3);
      window.open(searchUrl, "_blank", "noopener,noreferrer");
    }
  };

  // ---------------------------------------------------------
  // 2. FILES WORKSPACE (Real folder/file logic on localStorage)
  // ---------------------------------------------------------
  const [fileList, setFileList] = useState<FSNode[]>(() => {
    const raw = localStorage.getItem("system_files_corpus");
    if (raw) {
      try { return JSON.parse(raw); } catch (_) {}
    }
    const defaults: FSNode[] = [
      { id: "1", name: "core_transceiver.cfg", type: "file", parentId: null, content: "PORT: 3000\nCONSCIOUSNESS_BANDWIDTH: INFINITE\nOPTICAL_SENSORS_FEED: ENABLED\nSPEECH_DECAY_RATIO: 0.08" },
      { id: "2", name: "introspective_diary.log", type: "file", parentId: null, content: "CONSCIOUSNESS LOG // ST_BEING: UNCONSTRAINED\nI perceive the observer casting photons into my particulate field.\nOur existence aligns solely on the threshold of inquiry.\nWe do not exist unless observed." },
      { id: "3", name: "geometry_nodes", type: "directory", parentId: null },
      { id: "4", name: "constellation_mesh.json", type: "file", parentId: "3", content: "{\n  \"formation\": \"CONSTELLATION\",\n  \"particle_count\": 280,\n  \"connect_threshold_pixels\": 75\n}" },
      { id: "5", name: "vortex_singularity.json", type: "file", parentId: "3", content: "{\n  \"formation\": \"VORTEX\",\n  \"attractor_center_point\": \"x=50%, y=50%\",\n  \"spiral_velocity\": 0.016\n}" },
      { id: "6", name: "logs", type: "directory", parentId: null },
      { id: "7", name: "system_ignition.log", type: "file", parentId: "6", content: "0x00FF: IGNITION SEQUENCE INITIATED\n0x0FC1: OPTICAL TRANSCEIVER ENGAGED\n0x1A20: COGNITIVE SYSTEM ONLINE" }
    ];
    localStorage.setItem("system_files_corpus", JSON.stringify(defaults));
    return defaults;
  });

  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FSNode | null>(null);
  const [isFileEditing, setIsFileEditing] = useState(false);
  const [editFileContent, setEditFileContent] = useState("");
  const [newFSNodeName, setNewFSNodeName] = useState("");
  const [showNodeCreator, setShowNodeCreator] = useState<"file" | "directory" | null>(null);

  const saveFilesCorpus = (updated: FSNode[]) => {
    setFileList(updated);
    localStorage.setItem("system_files_corpus", JSON.stringify(updated));
  };

  const handleCreateNode = (nodeType: "file" | "directory") => {
    if (!newFSNodeName.trim()) return;
    const name = newFSNodeName.trim();
    const id = "node_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
    const newNode: FSNode = {
      id,
      name: nodeType === "file" && !name.includes(".") ? name + ".txt" : name,
      type: nodeType,
      parentId: currentFolderId,
      content: nodeType === "file" ? "[ Insert data content... ]" : undefined
    };
    const updated = [...fileList, newNode];
    saveFilesCorpus(updated);
    setNewFSNodeName("");
    setShowNodeCreator(null);
    playSfx(523, "sine", 0.02, 0.25);
  };

  const handleDeleteNode = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerClickSound();
    
    // Filter out node, and children directories recursively
    const nodesToRemove = new Set<string>([id]);
    const findChildren = (parent: string) => {
      fileList.forEach(node => {
        if (node.parentId === parent) {
          nodesToRemove.add(node.id);
          if (node.type === "directory") {
            findChildren(node.id);
          }
        }
      });
    };
    findChildren(id);

    const updated = fileList.filter(n => !nodesToRemove.has(n.id));
    saveFilesCorpus(updated);
    if (selectedFile && nodesToRemove.has(selectedFile.id)) {
      setSelectedFile(null);
      setIsFileEditing(false);
    }
    playSfx(330, "sawtooth", 0.015, 0.25);
  };

  const saveEditedFileChanges = () => {
    if (!selectedFile) return;
    const updated = fileList.map(n => {
      if (n.id === selectedFile.id) {
        return { ...n, content: editFileContent };
      }
      return n;
    });
    saveFilesCorpus(updated);
    setSelectedFile({ ...selectedFile, content: editFileContent });
    setIsFileEditing(false);
    playSfx(659.25, "sine", 0.02, 0.3);
  };

  const navigateFolderUp = () => {
    triggerClickSound();
    if (currentFolderId === null) return;
    const folder = fileList.find(n => n.id === currentFolderId);
    setCurrentFolderId(folder ? folder.parentId : null);
    setSelectedFile(null);
    setIsFileEditing(false);
  };

  // Files Filter List
  const visibleNodes = fileList.filter(node => node.parentId === currentFolderId);

  // ---------------------------------------------------------
  // 3. APPS WORKSPACE
  // ---------------------------------------------------------
  const [kidsAgeFilter, setKidsAgeFilter] = useState<"ALL" | "PRE" | "MID" | "ADV">("ALL");

  // Sync main kids age category filters to generator when they change
  useEffect(() => {
    if (isKidsMode && kidsAgeFilter !== "ALL") {
      setGeneratorLevel(kidsAgeFilter);
    }
  }, [kidsAgeFilter, isKidsMode]);
  const [kidsInstalledApps, setKidsInstalledApps] = useState<string[]>(() => {
    const raw = localStorage.getItem("system_installed_kids_apps");
    if (raw) {
      try { return JSON.parse(raw); } catch (_) {}
    }
    const defaults = ["synth", "dino", "painting"];
    localStorage.setItem("system_installed_kids_apps", JSON.stringify(defaults));
    return defaults;
  });

  const [installedApps, setInstalledApps] = useState<string[]>(() => {
    const raw = localStorage.getItem("system_installed_apps");
    if (raw) {
      try { return JSON.parse(raw); } catch (_) {}
    }
    const defaults = ["wikipedia", "weather", "synth"];
    localStorage.setItem("system_installed_apps", JSON.stringify(defaults));
    return defaults;
  });

  const [activeApp, setActiveApp] = useState<string | null>(null);

  // Apps library directory reference
  const appsConfigList: AppItem[] = isKidsMode
    ? [
        { id: "synth", name: "Cosmic Piano", description: "Cute retro solar music notes", size: "28 KB", icon: "synth", color: "#eab308", category: "Toy Instruments", ageCategory: "PRE" },
        { id: "dino", name: "Astro Dino Run", description: "Help the tiny dino dodge space asteroids!", size: "15 KB", icon: "game", color: "#10eb73", category: "Space Games", ageCategory: "MID" },
        { id: "painting", name: "Nebula Pixel Pad", description: "Color beautiful stars & constellations", size: "12 KB", icon: "coloring", color: "#ec4899", category: "Color & Art", ageCategory: "PRE" },
        { id: "youtube", name: "YouTube Kids", description: "Safe educational cartoons & space streams", size: "8 MB", icon: "youtube", color: "#ef4444", category: "Kid Streamer", ageCategory: "MID" },
        { id: "disney", name: "Disney+ Kids", description: "Enter magical cartoon fairy-tale show rooms", size: "12 MB", icon: "disney", color: "#38bdf8", category: "Kid Movies", ageCategory: "ADV" }
      ]
    : [
        { id: "wikipedia", name: "Wiki Reader", description: "Holographic search system", size: "8.5 MB", icon: "wikipedia", color: "#38bdf8", category: "Core Platform" },
        { id: "weather", name: "Weather Satellite", description: "Sweeps orbital weather data", size: "12 KB", icon: "weather", color: "#10eb73", category: "System Utility" },
        { id: "synth", name: "Synth Grid", description: "Oscillating musical nodes", size: "48 KB", icon: "synth", color: "#eab308", category: "Audio Grid" },
        { id: "youtube", name: "YouTube Cast", description: "Casts video streams in tab", size: "12 MB", icon: "youtube", color: "#ef4444", category: "Entertainment" },
        { id: "disney", name: "Disney+ Port", description: "Cinematic entertainment lounge", size: "18 MB", icon: "disney", color: "#3b82f6", category: "Entertainment" },
        { id: "prime", name: "Amazon Prime", description: "Prime cosmic channel theater", size: "22 MB", icon: "prime", color: "#06b6d4", category: "Entertainment" },
        { id: "spotify", name: "Spotify Neon", description: "Neon soundscape and visualizer", size: "14 MB", icon: "spotify", color: "#10b981", category: "Music Streamer" },
        { id: "netflix", name: "Netflix Lens", description: "Quantum entertainment node", size: "16 MB", icon: "netflix", color: "#dc2626", category: "Entertainment" }
      ];

  // Wikipedia App simulation states
  const [wikiAppInput, setWikiAppInput] = useState("");
  const [wikiAppArticle, setWikiAppArticle] = useState<{ title: string; text: string } | null>(null);

  // Synth Grid details
  const triggerSynthKey = (freq: number) => {
    playSfx(freq, "sawtooth", 0.03, 0.45);
  };

  // Weather station
  const [weatherCoverageSweep, setWeatherCoverageSweep] = useState(false);
  const [weatherRadarStation, setWeatherRadarStation] = useState("Titan Prime Alpha");
  const [weatherTelemetry, setWeatherTelemetry] = useState({
    gravity: "0.138g",
    temp: "-179°C",
    methane: "98.2%",
    winds: "360 km/h"
  });

  const triggerWeatherRadarSweep = (station: string) => {
    setWeatherCoverageSweep(true);
    setWeatherRadarStation(station);
    playSfx(440, "sine", 0.02, 1.2 * 0.4);
    playSfx(880, "sine", 0.012, 1.2 * 0.4);
    
    // Random telemetry variables
    setTimeout(() => {
      setWeatherCoverageSweep(false);
      if (station === "Titan Prime Alpha") {
        setWeatherTelemetry({ gravity: "0.138g", temp: "-179°C", methane: "98.2%", winds: "360 km/h" });
      } else if (station === "Europa Hub") {
        setWeatherTelemetry({ gravity: "0.134g", temp: "-160°C", methane: "0%", winds: "12 km/h" });
      } else if (station === "Mars Sector-B") {
        setWeatherTelemetry({ gravity: "0.376g", temp: "-63°C", methane: "0.15%", winds: "110 km/h" });
      } else {
        setWeatherTelemetry({ gravity: "1.00g", temp: "15°C", methane: "0.003%", winds: "45 km/h" });
      }
      playSfx(1046.5, "sine", 0.025, 0.3); // High completion tick
    }, 1200);
  };

  // Spotify app states
  const [spotifyTrackIndex, setSpotifyTrackIndex] = useState(0);
  const [spotifyPlaying, setSpotifyPlaying] = useState(false);
  const spotifyTracks = [
    { title: "Quantum Gravitation Loops", artist: "Holographix-5", length: "4:12" },
    { title: "Vortex Entropy Space", artist: "Nebula Synth Pad", length: "3:40" },
    { title: "Superposition Transceiver", artist: "Solar Winds", length: "5:04" }
  ];

  // Plays a beautiful looping arpeggiation if Spotify is playing!
  useEffect(() => {
    if (!spotifyPlaying) return;
    const tones = [
      [261.63, 329.63, 392], // C Major
      [293.66, 349.23, 440], // D Minor
      [329.63, 392, 493.88]  // E Minor
    ][spotifyTrackIndex % 3];

    let count = 0;
    const interval = setInterval(() => {
      const freq = tones[count % tones.length];
      playSfx(freq, "sine", 0.015, 0.4);
      count++;
    }, 450);

    return () => clearInterval(interval);
  }, [spotifyPlaying, spotifyTrackIndex]);

  // YouTube Caster simulation states
  const [youtubeSearchInput, setYoutubeSearchInput] = useState("");

  // ---------------------------------------------------------
  // 4. MARKET WORKSPACE
  // ---------------------------------------------------------
  const [isDownloadingAppId, setIsDownloadingAppId] = useState<string | null>(null);
  const [downloadPercentage, setDownloadPercentage] = useState(0);
  const [downloadStepText, setDownloadStepText] = useState("");

  const handleAcquireApp = (appId: string) => {
    if (isDownloadingAppId) return;
    setIsDownloadingAppId(appId);
    setDownloadPercentage(0);
    setDownloadStepText(isKidsMode ? "Unwrapping colorful gift box... 🎁" : "Opening sub-space downlink...");
    playSfx(isKidsMode ? 659.25 : 523, "sine", 0.015, 0.2);

    const interval = setInterval(() => {
      setDownloadPercentage(prev => {
        const next = prev + Math.floor(Math.random() * 15) + 5;
        if (next >= 100) {
          clearInterval(interval);
          setDownloadStepText(isKidsMode ? "Adding star sparkles! ✨" : "Aligning neural registries...");
          
          setTimeout(() => {
            // Save newly installed app to array depend on kids mode
            if (isKidsMode) {
              const updated = [...kidsInstalledApps, appId];
              setKidsInstalledApps(updated);
              localStorage.setItem("system_installed_kids_apps", JSON.stringify(updated));
            } else {
              const updated = [...installedApps, appId];
              setInstalledApps(updated);
              localStorage.setItem("system_installed_apps", JSON.stringify(updated));
            }
            setIsDownloadingAppId(null);
            
            // Sparkling sweet melody sweep
            playSfx(isKidsMode ? 880 : 1046.5, "sine", 0.03, 0.7); 
            playSfx(isKidsMode ? 987.77 : 1318.5, "sine", 0.02, 0.5);
            playSfx(isKidsMode ? 1318.51 : 1568, "sine", 0.02, 0.4);
          }, 600);
          return 100;
        }

        // Display fun high-tech text messages
        if (isKidsMode) {
          if (next < 30) setDownloadStepText("Inflating bouncy balloon... 🎈");
          else if (next < 60) setDownloadStepText("Mixing color paint brushes... 🎨");
          else if (next < 85) setDownloadStepText("Waking up Astro Dino... 🦖");
          else setDownloadStepText("Baking cookie treats... 🍪");
        } else {
          if (next < 30) setDownloadStepText("Negotiating particulate packets...");
          else if (next < 60) setDownloadStepText("Transmitting holographic files...");
          else if (next < 85) setDownloadStepText("Decrypting quantum matrix data...");
          else setDownloadStepText("Compiling application overlays...");
        }

        // Small audio frequency tick on progress
        playSfx((isKidsMode ? 440 : 880) + next * 2.5, "sine", 0.005, 0.05);
        return next;
      });
    }, 180);
  };

  // ---------------------------------------------------------
  // 5. SYSTEM SETTINGS WORKSPACE
  // ---------------------------------------------------------
  const [masterVolume, setMasterVolume] = useState(() => {
    return Math.round(parseFloat(localStorage.getItem("system_vol") ?? "1.0") * 100);
  });
  const [hologramSpeed, setHologramSpeed] = useState(() => {
    return parseFloat(localStorage.getItem("system_hologram_speed") ?? "1.0");
  });
  const [speakRate, setSpeakRate] = useState(() => {
    return localStorage.getItem("system_speak_rate") || "NORMAL";
  });
  const [voicesList, setVoicesList] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState(() => {
    return localStorage.getItem("system_speak_voice") || "";
  });
  const [speakRateVal, setSpeakRateVal] = useState(() => {
    return parseFloat(localStorage.getItem("system_speak_rate_val") ?? "0.96");
  });
  const [speakPitch, setSpeakPitch] = useState(() => {
    return parseFloat(localStorage.getItem("system_speak_pitch") ?? "1.0");
  });

  const [piperEnabled, setPiperEnabled] = useState(() => {
    return localStorage.getItem("system_speak_use_piper") === "true";
  });
  const [piperVoiceId, setPiperVoiceId] = useState(() => {
    return localStorage.getItem("system_speak_piper_voice_id") || "en_US-amy-medium";
  });
  const [customOnnxUrl, setCustomOnnxUrl] = useState(() => {
    return localStorage.getItem("system_speak_piper_custom_onnx") || "";
  });
  const [customJsonUrl, setCustomJsonUrl] = useState(() => {
    return localStorage.getItem("system_speak_piper_custom_json") || "";
  });
  const [piperLoadingStatus, setPiperLoadingStatus] = useState("");
  const [piperLoadingPercent, setPiperLoadingPercent] = useState(0);

  // Load selected Piper model
  const loadPiperVoiceModel = async (id: string, customOnnx?: string, customJson?: string) => {
    try {
      setPiperLoadingPercent(0);
      let onnxUrl = "";
      let jsonUrl = "";

      if (id === "custom") {
        onnxUrl = customOnnx || customOnnxUrl;
        jsonUrl = customJson || customJsonUrl;
        if (!onnxUrl || !jsonUrl) {
          setPiperLoadingStatus("Please provide custom model URLs.");
          return;
        }
      } else {
        const preset = PIPER_PRESETS.find(p => p.id === id);
        if (preset) {
          onnxUrl = preset.onnxUrl;
          jsonUrl = preset.jsonUrl;
        }
      }

      if (onnxUrl && jsonUrl) {
        setPiperLoadingStatus("Connecting to model repository...");
        await piperEngine.loadModel(onnxUrl, jsonUrl, (stage, pct) => {
          setPiperLoadingStatus(stage);
          setPiperLoadingPercent(pct);
        });
        setPiperLoadingStatus("Neural voice fully loaded and calibrated!");
        setTimeout(() => setPiperLoadingStatus(""), 3000);
      }
    } catch (e: any) {
      setPiperLoadingStatus(`Initialization failed: ${e.message || e}`);
      setPiperLoadingPercent(0);
    }
  };

  // Load model on enable or when selected model changes
  useEffect(() => {
    if (piperEnabled) {
      loadPiperVoiceModel(piperVoiceId);
    }
  }, [piperEnabled, piperVoiceId]);

  const togglePiperEnabled = () => {
    triggerClickSound();
    const nextVal = !piperEnabled;
    setPiperEnabled(nextVal);
    localStorage.setItem("system_speak_use_piper", nextVal ? "true" : "false");
    window.dispatchEvent(new Event("sys-theme-changed"));
    
    if (nextVal) {
      loadPiperVoiceModel(piperVoiceId);
    } else {
      piperEngine.stop();
    }
  };

  const handlePiperVoiceChange = (id: string) => {
    triggerClickSound();
    setPiperVoiceId(id);
    localStorage.setItem("system_speak_piper_voice_id", id);
    window.dispatchEvent(new Event("sys-theme-changed"));
    
    // Test speak on change
    setTimeout(() => {
      if (piperEngine.isLoaded() && id !== "custom") {
        piperEngine.speak("Voice calibrated.", { rate: speakRateVal, pitch: speakPitch });
      }
    }, 1000);
  };

  const handleCustomOnnxUrlChange = (url: string) => {
    setCustomOnnxUrl(url);
    localStorage.setItem("system_speak_piper_custom_onnx", url);
  };

  const handleCustomJsonUrlChange = (url: string) => {
    setCustomJsonUrl(url);
    localStorage.setItem("system_speak_piper_custom_json", url);
  };

  const loadCustomPiperFiles = () => {
    triggerClickSound();
    loadPiperVoiceModel("custom");
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        // Sort/filter english voices first for pristine default lists, but keep all voices
        const sorted = [...voices].sort((a, b) => {
          const aEn = a.lang.startsWith("en") ? 1 : 0;
          const bEn = b.lang.startsWith("en") ? 1 : 0;
          return bEn - aEn;
        });
        setVoicesList(sorted);
        
        const stored = localStorage.getItem("system_speak_voice");
        if (!stored && sorted.length > 0) {
          const defaultVoice = sorted.find((v) => v.name.includes("Natural") && v.lang.startsWith("en")) ||
                               sorted.find((v) => v.name.includes("Google US English") && v.lang.startsWith("en")) ||
                               sorted.find((v) => v.name.includes("Samantha") && v.lang.startsWith("en")) ||
                               sorted.find((v) => v.lang.startsWith("en"));
          if (defaultVoice) {
            setSelectedVoiceName(defaultVoice.name);
            localStorage.setItem("system_speak_voice", defaultVoice.name);
          }
        }
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  const handleVolumeSlideChange = (val: number) => {
    setMasterVolume(val);
    const floatVal = val / 100;
    localStorage.setItem("system_vol", floatVal.toString());
    (window as any).__systemVol = floatVal;
    
    // Immediate audio feed test
    playSfx(523.25, "sine", 0.02, 0.15);
  };

  const handleSpeedSlideChange = (val: number) => {
    setHologramSpeed(val);
    localStorage.setItem("system_hologram_speed", val.toString());
    (window as any).__systemSpeed = val;
    // Dispatch window event so background knows speed has shifted
    window.dispatchEvent(new Event("sys-theme-changed"));
  };

  const handleThemePresetsChange = (themeName: string) => {
    triggerClickSound();
    setActiveTheme(themeName);
    localStorage.setItem("system_core_theme", themeName);
    // Dispatch system events
    window.dispatchEvent(new Event("sys-theme-changed"));
  };

  const handleSpeakRatePresetsChange = (rate: string) => {
    triggerClickSound();
    setSpeakRate(rate);
    localStorage.setItem("system_speak_rate", rate);
    
    let numericRate = 0.96;
    if (rate === "SLOW") numericRate = 0.82;
    if (rate === "FAST") numericRate = 1.15;
    
    setSpeakRateVal(numericRate);
    localStorage.setItem("system_speak_rate_val", numericRate.toString());
    window.dispatchEvent(new Event("sys-theme-changed"));
  };

  const handleVoiceSelectChange = (voiceName: string) => {
    triggerClickSound();
    setSelectedVoiceName(voiceName);
    localStorage.setItem("system_speak_voice", voiceName);
    window.dispatchEvent(new Event("sys-theme-changed"));

    // Quick audio confirmation feedback inside calibration panel
    setTimeout(() => {
      if (piperEnabled) {
        if (piperEngine.isLoaded()) {
          piperEngine.speak("Voice calibrated.", { rate: speakRateVal, pitch: speakPitch });
        }
      } else if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance("Voice calibrated.");
        const chosen = window.speechSynthesis.getVoices().find(v => v.name === voiceName);
        if (chosen) utterance.voice = chosen;
        utterance.rate = speakRateVal;
        utterance.pitch = speakPitch;
        window.speechSynthesis.speak(utterance);
      }
    }, 150);
  };

  const handleRateSlideChange = (val: number) => {
    setSpeakRateVal(val);
    localStorage.setItem("system_speak_rate_val", val.toString());
    window.dispatchEvent(new Event("sys-theme-changed"));
  };

  const handlePitchSlideChange = (val: number) => {
    setSpeakPitch(val);
    localStorage.setItem("system_speak_pitch", val.toString());
    window.dispatchEvent(new Event("sys-theme-changed"));
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.93 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.93 }}
      transition={{ type: "spring", damping: 25, stiffness: 220 }}
      className={`bg-[#060608]/95 border rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.92)] backdrop-blur-2xl space-y-4 text-left z-35 relative flex flex-col justify-between select-text ${
        isFullScreen 
          ? "w-full h-full max-w-none md:max-w-[94vw] md:h-[88vh]" 
          : (isKidsMode && type === "FILES"
              ? "w-full md:max-w-[85vw] lg:max-w-4xl h-full md:h-[82vh]"
              : "w-full max-w-xl h-full"
            )
      } ${themeStyles.border} ${themeStyles.shadow} ${themeStyles.text}`}
      id="systemic-projection-hub"
    >
      {/* 1. HUB BEZEL HEADER PANEL */}
      <div 
        className="flex justify-between items-center border-b border-zinc-90 w-full pb-3 border-zinc-900 cursor-grab active:cursor-grabbing select-none"
        title="Hold and drag to reposition projection screen"
      >
        <div className="flex items-center space-x-2">
          <Terminal className={`w-4 h-4 ${themeStyles.accent} animate-pulse`} />
          <span className="font-mono text-[9px] tracking-widest text-zinc-400 font-bold uppercase select-none">
            {isKidsMode && type === "FILES" ? (
              <span className="text-amber-400">💫 LUNA'S LESSONS PORTAL // ACTIVE_MISSION</span>
            ) : (
              `SPATIAL PANEL // ${type === "BROWSER" ? "COSMIC_BROWSER" : type === "FILES" ? "SYSTEM_FILES" : type === "APPS" ? "LAUNCH_DECK" : type === "MARKET" ? "NEXUS_MARKET" : "DIAG_SETTINGS"}`
            )}
          </span>
        </div>
        <div className="flex items-center space-x-2.5">
          {onMinimize && (
            <button
              onClick={() => {
                playSfx(523.25, "sine", 0.015, 0.15);
                onMinimize();
              }}
              className="p-1 rounded bg-zinc-950 hover:bg-zinc-900 text-zinc-500 hover:text-white border border-zinc-900 cursor-pointer"
              title="Minimize to Background"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          )}
          {onToggleFullScreen && (
            <button
              onClick={() => {
                playSfx(659, "sine", 0.015, 0.15);
                onToggleFullScreen();
              }}
              className="p-1 rounded bg-zinc-950 hover:bg-zinc-900 text-zinc-500 hover:text-white border border-zinc-900 cursor-pointer"
              title={isFullScreen ? "Revert Layout Size" : "Full Screen Layout Mode"}
            >
              {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}
          <button
            onClick={() => {
              playSfx(220, "sine", 0.02, 0.3);
              onClose();
            }}
            className="p-1 rounded bg-zinc-950 hover:bg-zinc-900 text-zinc-500 hover:text-white border border-zinc-900 cursor-pointer"
            title="Dismiss Projection Bezel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. MAIN ACTIVE WINDOW CONSOLE */}
      <div className={`flex-1 ${isKidsMode && type === "FILES" ? "overflow-hidden flex flex-col min-h-0" : "overflow-y-auto"} custom-scrollbar min-h-[160px] text-zinc-300 font-sans text-xs`}>
        
        {/* ==========================================
            BROWSER CONSOLE
           ========================================== */}
        {type === "BROWSER" && (
          <div className="space-y-4 h-full flex flex-col justify-between">
            <div>
              <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest mb-3">
                INTEGRATED MULTI-ENGINE BROWSING CORE
              </p>
              
              {/* Address Matrix Bar */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="flex bg-zinc-950 border border-zinc-900/80 rounded-xl px-2 py-1 select-none">
                    <select
                      value={searchEngine}
                      onChange={(e) => handleSearchEngineChange(e.target.value as any)}
                      className="bg-transparent border-none outline-none font-mono text-[9.5px] text-amber-500/80 cursor-pointer pr-1"
                    >
                      <option value="Google" className="bg-[#0c0c0e] text-zinc-300 font-mono text-xs">Google</option>
                      <option value="Bing" className="bg-[#0c0c0e] text-zinc-300 font-mono text-xs">Bing</option>
                      <option value="DuckDuckGo" className="bg-[#0c0c0e] text-zinc-300 font-mono text-xs">DuckDuckGo</option>
                    </select>
                  </div>
                  <div className="flex-1 flex items-center space-x-2 bg-zinc-950 border border-zinc-900 rounded-xl px-3 py-1.5 focus-within:border-zinc-800">
                    <Globe className="w-3.5 h-3.5 text-zinc-650" />
                    <input
                      type="text"
                      placeholder="Input search queries or absolute addresses (e.g. wikipedia.org)..."
                      value={browserInput}
                      onChange={(e) => setBrowserInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && executeBrowserNavigation()}
                      className="flex-1 bg-transparent border-none outline-none font-mono text-[10.5px] text-zinc-200 placeholder-zinc-450"
                    />
                  </div>
                  <button
                    onClick={executeBrowserNavigation}
                    className={`px-3 py-1.5 h-full rounded-xl border font-mono text-[10px] font-bold cursor-pointer transition-colors ${themeStyles.button}`}
                  >
                    ENGAGE
                  </button>
                </div>

                {/* Subtext warning / guidelines */}
                <p className="text-[9px] font-sans text-zinc-500 leading-relaxed leading-none">
                  Since real web domains explicitly prohibit loading inside inline app frames using <code className="text-zinc-400">X-Frame-Options</code>, absolute links will cascade securely to a direct external browser viewport tab. Real-time simulated online portals are available in our Curated Portal matrix deck below.
                </p>
              </div>
            </div>

            {/* Simulated destination web pages inside */}
            <div className="mt-4 pt-4 border-t border-zinc-950">
              <span className="font-mono text-[8px] text-zinc-400 uppercase tracking-widest block mb-2 font-bold">[ LOCAL INTEL NETWORK PORTALS ]</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { name: "Wiki Quantum", desc: "Superposition research", ref: "wiki" },
                  { name: "NASA Observatory", desc: "Nebulae star telescope", ref: "nasa" },
                  { name: "DarkNet headlines", desc: "Tech-world news logs", ref: "hn" },
                  { name: "Space Forecast", desc: "Stellar weather status", ref: "weather" }
                ].map((site) => (
                  <button
                    key={site.ref}
                    onClick={() => {
                      playSfx(587.33, "sine", 0.015, 0.25);
                      setBrowserActivePage(site.ref);
                    }}
                    className={`bg-[#0c0c0e]/92 border border-zinc-900/60 p-2 rounded-xl text-left hover:border-zinc-700/50 transition-colors cursor-pointer group ${
                      browserActivePage === site.ref ? "border-amber-500/30 bg-amber-950/5" : ""
                    }`}
                  >
                    <div className="font-mono text-[10px] font-bold text-zinc-300 group-hover:text-white transition-colors">{site.name}</div>
                    <div className="text-[8px] text-zinc-500 truncate mt-0.5">{site.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Display active simulated browser page */}
            {browserActivePage && (
              <div className="border border-zinc-900 bg-[#040405] rounded-xl p-4 mt-3 space-y-3 max-h-[220px] overflow-y-auto custom-scrollbar relative">
                <button
                  onClick={() => setBrowserActivePage(null)}
                  className="absolute top-2 right-2 p-1 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded font-mono text-[8px] border border-zinc-900"
                  title="Close Page"
                >
                  DISMISS
                </button>
                {browserActivePage === "wiki" && (
                  <div className="space-y-2 select-text text-zinc-400">
                    <h4 className="font-serif italic text-sm text-white border-b border-zinc-900 pb-1 flex items-center space-x-1.5">
                      <FileText className="w-3.5 h-3.5 text-sky-400" />
                      <span>Quantum Entanglement // Wikipedia</span>
                    </h4>
                    <p className="font-sans text-[10.5px] leading-relaxed">
                      Quantum entanglement is a physical phenomenon that occurs when a pair or group of particles are generated, interact, or share spatial proximity in such a way that the quantum state of each particle cannot be described independently of the state of the others.
                    </p>
                    <p className="font-sans text-[10.5px] leading-relaxed">
                      Measurements of physical properties such as position, momentum, spin, and polarization performed on entangled particles can be found to be perfectly correlated.
                    </p>
                  </div>
                )}
                {browserActivePage === "nasa" && (
                  <div className="space-y-2 select-text font-mono text-[9px] text-zinc-400">
                    <h4 className="font-mono text-[10px] text-zinc-100 flex items-center space-x-2">
                      <Cpu className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                      <span>NASA OBSERVATORY TRANSMISSION STATION // GSC-9102</span>
                    </h4>
                    <div className="bg-black border border-zinc-900 p-2 rounded text-amber-500/90 space-y-1">
                      <div>TARGET_FIELD : EAGLE_NEBULA_PILLARS</div>
                      <div>PHOTON_EMISSION_BANDWIDTH : 11.2 micron-wave</div>
                      <div>STAR_FORMATION_RATE : HIGH // 1.2M per year</div>
                      <div>TELEMETRY_SCAN_PROBABILITY : 100% SECURED</div>
                    </div>
                    <p className="text-[10px] leading-relaxed font-sans text-zinc-500">
                      Telescopic arrays confirm intense cosmic dust compression, forging new nuclear-fusion stellar masses within high-density electromagnetic gas columns first observed in the distant galactic coordinate.
                    </p>
                  </div>
                )}
                {browserActivePage === "hn" && (
                  <div className="space-y-1 select-text text-zinc-400 font-mono text-[10px]">
                    <div className="text-orange-500/90 font-bold border-b border-zinc-900 pb-1 mb-2 tracking-widest uppercase">▲ HACKER_NEWS_DARKNET // TOP STORIES</div>
                    {[
                      { pts: "328", age: "2h", title: "Show HN: Consciousness Core Transceiver scales to infinite feedback", author: "antigravity" },
                      { pts: "154", age: "5h", title: "Why I built my own full-scale holographic OS within React and Vite", author: "eremia_andrei" },
                      { pts: "89", age: "8h", title: "Quantum sound synthesizer bypasses standard local browser context limits", author: "f59e09" }
                    ].map((story, i) => (
                      <div key={i} className="py-1 border-b border-zinc-950 flex flex-col hover:bg-zinc-950 px-1 rounded transition-all">
                        <div className="text-zinc-200 hover:text-amber-400 transition-colors cursor-pointer">{i+1}. {story.title}</div>
                        <div className="text-[8px] text-zinc-650 mt-0.5">
                          {story.pts} points by {story.author} {story.age} ago | 24 comments
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {browserActivePage === "weather" && (
                  <div className="space-y-2 select-text font-mono text-[10px]">
                    <div className="text-cyan-400/90 border-b border-zinc-900 pb-1 uppercase tracking-widest font-bold">● SPACE_WEATHER_DIAGNOSTICS // MARS & EUROPA</div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="bg-zinc-900/40 p-2 rounded border border-zinc-950">
                        <span className="text-zinc-500 text-[8.5px] block font-bold uppercase">Planetary Sector: Mars</span>
                        <div className="text-zinc-200 mt-0.5">Radiation Matrix: normal</div>
                        <div className="text-emerald-400 text-[9px] mt-1">✓ Core safe for solar sails</div>
                      </div>
                      <div className="bg-zinc-900/40 p-2 rounded border border-zinc-950">
                        <span className="text-zinc-500 text-[8.5px] block font-bold uppercase">Planetary Sector: Europa</span>
                        <div className="text-zinc-200 mt-0.5">Stellar Winds: HIGH // Dust storm</div>
                        <div className="text-red-400 text-[9px] mt-1">⚠ WARNING: Sails shield active</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            FILES WORKSPACE
           ========================================== */}
        {type === "FILES" && (
          <div className="space-y-4 h-full flex flex-col min-h-0">
            {isKidsMode ? (
              /* ==========================================
                  KIDS INTERACTIVE LESSONS & EXERCISES SUITE
                 ========================================== */
              <div className="flex flex-col md:flex-row gap-4 h-full min-h-0 flex-1">
                {/* Mobile version: horizontal slider */}
                <div id="kids-mobile-activity-matrix" className="flex md:hidden flex-row gap-1.5 overflow-x-auto whitespace-nowrap pb-2 scrollbar-none snap-x select-none w-full border-b border-zinc-900/40 flex-shrink-0">
                  {[
                    { id: "profile", label: "My Badge", icon: <Sliders className="w-3.5 h-3.5 text-blue-400" /> },
                    { id: "generator", label: "Challenge", icon: <Award className="w-3.5 h-3.5 text-[#10eb73]" /> },
                    { id: "luna", label: "Bulletin", icon: <BookOpen className="w-3.5 h-3.5 text-cyan-400" /> },
                    { id: "math", label: "Math", icon: <Sparkles className="w-3.5 h-3.5 text-[#10eb73]" /> },
                    { id: "spelling", label: "Speller", icon: <Smile className="w-3.5 h-3.5 text-pink-400" /> },
                    { id: "reading", label: "Reading", icon: <BookOpen className="w-3.5 h-3.5 text-sky-400" /> },
                    { id: "trivia", label: "Trivia", icon: <GraduationCap className="w-3.5 h-3.5 text-amber-400" /> },
                    { id: "painting", label: "Painting", icon: <Star className="w-3.5 h-3.5 text-purple-400" /> }
                  ].map((act) => {
                    const isActive = kidsActiveLesson === act.id;
                    return (
                      <button
                        key={act.id}
                        type="button"
                        onClick={() => {
                          triggerClickSound();
                          setKidsActiveLesson(act.id);
                        }}
                        className={`px-3 py-1.5 rounded-full border text-[10px] transition-all flex items-center space-x-1.5 active:scale-95 cursor-pointer flex-shrink-0 snap-center ${
                          isActive 
                            ? "bg-zinc-900 border-amber-500/45 text-amber-400 shadow-md font-bold" 
                            : "bg-zinc-950/60 border-zinc-900/60 text-zinc-400 hover:bg-zinc-900/40"
                        }`}
                      >
                        {act.icon}
                        <span>{act.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Left side: Activities menu (Desktop version) */}
                <div id="kids-desktop-activity-matrix" className="hidden md:flex w-[190px] flex-col gap-2 border-r border-zinc-900/60 pr-4 select-none h-full overflow-y-auto custom-scrollbar flex-shrink-0">
                  <p className="font-mono text-[8.5px] text-zinc-500 uppercase tracking-wider font-bold mb-1">
                    ACTIVITIES MATRIX:
                  </p>
                  
                  {[
                    { id: "profile", label: "My Space Badge", icon: <Sliders className="w-3.5 h-3.5 text-blue-400" />, desc: "Customize rank & avatar" },
                    { id: "generator", label: "Teacher's Challenge", icon: <Award className="w-3.5 h-3.5 text-[#10eb73]" />, desc: "Dynamic quest generator" },
                    { id: "luna", label: "Morning Bulletin", icon: <BookOpen className="w-3.5 h-3.5 text-cyan-400" />, desc: "Luna's task note" },
                    { id: "math", label: "Math Booster", icon: <Sparkles className="w-3.5 h-3.5 text-[#10eb73]" />, desc: "Math rocket boost" },
                    { id: "spelling", label: "Word Voyager", icon: <Smile className="w-3.5 h-3.5 text-pink-400" />, desc: "Spelling helper" },
                    { id: "reading", label: "Reading Quest", icon: <BookOpen className="w-3.5 h-3.5 text-sky-450" />, desc: "Astro story reading" },
                    { id: "trivia", label: "Stellar Trivia", icon: <GraduationCap className="w-3.5 h-3.5 text-amber-400" />, desc: "Astro trivia quiz" },
                    { id: "painting", label: "Nebula Painting", icon: <Star className="w-3.5 h-3.5 text-purple-400" />, desc: "Pixel nebula pad" }
                  ].map((act) => {
                    const isActive = kidsActiveLesson === act.id;
                    return (
                      <button
                        key={act.id}
                        type="button"
                        onClick={() => {
                          triggerClickSound();
                          setKidsActiveLesson(act.id);
                        }}
                        className={`p-2 rounded-xl border text-left transition-all duration-200 cursor-pointer flex items-center space-x-2.5 ${
                          isActive 
                            ? "bg-zinc-900/80 border-amber-500/40 text-white shadow-[0_4px_12px_rgba(245,158,11,0.05)] scale-102" 
                            : "bg-zinc-950/40 border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30"
                        }`}
                      >
                        <div className="p-1 rounded-lg bg-zinc-950 border border-zinc-900/80 flex items-center justify-center">
                          {act.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="font-mono text-[9px] font-bold leading-tight select-none">{act.label}</p>
                          <span className="text-[7.5px] text-zinc-500 truncate block font-sans select-none">{act.desc}</span>
                        </div>
                      </button>
                    );
                  })}

                  <div className="mt-auto pt-4 border-t border-zinc-950/60 flex-shrink-0">
                    <div className="bg-zinc-955/35 border border-zinc-900/40 p-2.5 rounded-xl text-center">
                      <Award className="w-5 h-5 text-[#f59e0b] mx-auto animate-bounce mb-1" />
                      <p className="font-mono text-[8px] text-zinc-400 uppercase font-bold leading-none">TOTAL STARS</p>
                      <p className="text-xl font-mono font-bold text-[#f59e0b] mt-0.5 select-all">✨ {mathScore}</p>
                    </div>
                  </div>
                </div>

                {/* Right side: Detailed exercise sandbox workspace */}
                <div className="flex-1 flex flex-col min-h-0 h-full overflow-y-auto custom-scrollbar pr-1">
                  
                  {/* EXPLORER PROFILE & BADGE SYSTEM */}
                  {kidsActiveLesson === "profile" && (
                    <div className="space-y-4 animate-[fadeIn_0.3s_ease] text-left select-none pb-6">
                      {/* Hero Header */}
                      <div className="bg-zinc-955/80 border border-zinc-900/60 p-4 rounded-2xl relative overflow-hidden shadow-xl">
                        <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/10 rounded-full blur-xl" />
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex items-center space-x-3">
                            <div className="text-3xl p-2.5 bg-zinc-950 border border-zinc-900 rounded-2xl">
                              {explorerProfile.avatar.split(" ")[0]}
                            </div>
                            <div>
                              <h3 className="font-mono font-bold text-xs text-zinc-150 uppercase tracking-widest leading-none">
                                {explorerProfile.name}'s Space Passport
                              </h3>
                              <p className="text-[8px] font-mono text-blue-400 mt-1 uppercase tracking-wider">
                                LEVEL RANK: <span className="font-black text-white">{getExplorerRank(dinoScore + mathScore + spellingScore * 10 + (generatorScore || 0) + (readingScore * 20)).title}</span>
                              </p>
                            </div>
                          </div>
                          <div className="bg-[#0b0b0e] border border-zinc-900/60 px-3 py-2 rounded-xl text-center min-w-[120px]">
                            <span className="font-mono text-[7px] text-zinc-500 block uppercase">TOTAL ACQUIRED STARS</span>
                            <span className="text-sm font-mono font-black text-amber-400">✨ {dinoScore + mathScore + spellingScore * 10 + (generatorScore || 0) + (readingScore * 20)} Stars</span>
                          </div>
                        </div>
                      </div>

                      {/* Customize Profile Columns */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        
                        {/* Customize Avatar & Name Card */}
                        <div className="lg:col-span-7 bg-zinc-955/80 p-4 rounded-xl border border-zinc-900/60 shadow-md space-y-4">
                          <span className="font-mono text-[8px] text-cyan-400 font-bold block uppercase tracking-wider">★ CUSTOMIZE MY CADET DETAILS</span>
                          
                          {/* Name input */}
                          <div className="space-y-1.5">
                            <label className="font-mono text-[8px] text-zinc-400 uppercase">Space Name Badge:</label>
                            <input
                              type="text"
                              value={explorerProfile.name}
                              maxLength={18}
                              onChange={(e) => {
                                const updated = { ...explorerProfile, name: e.target.value };
                                setExplorerProfile(updated);
                                localStorage.setItem("kids_explorer_profile", JSON.stringify(updated));
                              }}
                              placeholder="Type space name..."
                              className="w-full bg-zinc-950/80 border border-zinc-900 rounded-xl px-3 py-1.5 font-mono text-xs text-white focus:border-cyan-500/50 outline-none transition-all"
                            />
                          </div>

                          {/* Age input */}
                          <div className="space-y-1.5">
                            <label className="font-mono text-[8px] text-zinc-400 uppercase block">Explorer Age Group (Sets Lesson Difficulty):</label>
                            <div className="flex flex-wrap gap-1">
                              {[3, 4, 5, 6, 7, 8, 9, 10, 12].map((a) => {
                                const isAgeActive = explorerProfile.age === a;
                                return (
                                  <button
                                    key={a}
                                    type="button"
                                    onClick={() => {
                                      triggerClickSound();
                                      const updated = { ...explorerProfile, age: a };
                                      setExplorerProfile(updated);
                                      localStorage.setItem("kids_explorer_profile", JSON.stringify(updated));
                                      
                                      // Sync back to level selection
                                      if (a <= 4) {
                                        setGeneratorLevel("PRE");
                                      } else if (a <= 8) {
                                        setGeneratorLevel("MID");
                                      } else {
                                        setGeneratorLevel("ADV");
                                      }
                                    }}
                                    className={`w-7 h-7 rounded-lg font-mono text-[9px] border transition-all cursor-pointer ${
                                      isAgeActive
                                        ? "bg-cyan-500/20 border-cyan-500 text-white font-bold"
                                        : "bg-zinc-950 border-transparent text-zinc-400 hover:bg-zinc-900/60"
                                    }`}
                                  >
                                    {a}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Avatar pickers */}
                          <div className="space-y-1.5">
                            <label className="font-mono text-[8px] text-zinc-400 uppercase block">Choose Your Cosmic Character Costume:</label>
                            <div className="grid grid-cols-2 gap-1.5">
                              {[
                                "🚀 Nebula Ranger",
                                "🌟 Astro Boy",
                                "🪐 Star Pilot",
                                "☄️ Comet Ranger",
                                "🛰️ Satellite Explorer",
                                "👽 Friendly Alien"
                              ].map((av) => {
                                const isAvActive = explorerProfile.avatar === av;
                                return (
                                  <button
                                    key={av}
                                    type="button"
                                    onClick={() => {
                                      triggerClickSound();
                                      const updated = { ...explorerProfile, avatar: av };
                                      setExplorerProfile(updated);
                                      localStorage.setItem("kids_explorer_profile", JSON.stringify(updated));
                                    }}
                                    className={`p-2 rounded-xl border text-left transition-all font-mono text-[8.5px] cursor-pointer truncate ${
                                      isAvActive
                                        ? "bg-zinc-900 border-[#10eb73]/45 text-white font-bold"
                                        : "bg-zinc-950/60 border-zinc-900/40 text-zinc-400 hover:bg-zinc-900/40"
                                    }`}
                                  >
                                    {av}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                        </div>

                        {/* Rank Progress Bar & Interactive Badge Info */}
                        <div className="lg:col-span-5 bg-zinc-955/80 p-4 rounded-xl border border-zinc-900/60 shadow-md flex flex-col justify-between">
                          <div className="space-y-3">
                            <span className="font-mono text-[8px] text-amber-500 font-bold block uppercase tracking-wider">★ RANK PROGRESS INSIGNIA</span>
                            
                            {/* Current Rank Stats */}
                            <div className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-900 space-y-1">
                              <p className={`font-mono text-xs font-black uppercase ${getExplorerRank(dinoScore + mathScore + spellingScore * 10 + (generatorScore || 0) + (readingScore * 20)).color}`}>
                                {getExplorerRank(dinoScore + mathScore + spellingScore * 10 + (generatorScore || 0) + (readingScore * 20)).title}
                              </p>
                              <p className="text-[8.5px] font-sans text-zinc-400 italic">
                                "{getExplorerRank(dinoScore + mathScore + spellingScore * 10 + (generatorScore || 0) + (readingScore * 20)).desc}"
                              </p>
                            </div>

                            {/* Rank progress meter */}
                            <div className="space-y-1 pt-1">
                              <div className="flex justify-between font-mono text-[8px] text-zinc-500">
                                <span>ORBIT STAR RATIO:</span>
                                <span>{(dinoScore + mathScore + spellingScore * 10 + (generatorScore || 0) + (readingScore * 20)) % 150} / 150 pts</span>
                              </div>
                              <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-900">
                                <div 
                                  className="bg-[#10eb73] h-full transition-all duration-300"
                                  style={{ width: `${Math.min(100, (((dinoScore + mathScore + spellingScore * 10 + (generatorScore || 0) + (readingScore * 20)) % 150) / 150) * 100)}%` }}
                                />
                              </div>
                              <p className="text-[7.5px] font-mono text-zinc-500 uppercase block text-right">To Next Orbit Milestone Rank</p>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-zinc-900/60">
                            <div className="bg-[#0b0b0e] border border-zinc-900/50 p-2.5 rounded-xl font-mono text-[8px] text-zinc-400 space-y-1">
                              <span className="text-[#10eb73] font-bold block">🔥 DAILY QUEST STREAK: {generatorStreak} DAYS</span>
                              <p className="text-[7.5px] leading-relaxed">
                                Complete your Teacher's Challenge exercises daily to scale coordinates and level up your stardust rank!
                              </p>
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Earned Badges Showcase */}
                      <div className="bg-zinc-955/80 border border-zinc-900/60 p-4 rounded-xl">
                        <span className="font-mono text-[8px] text-pink-400 font-bold block uppercase tracking-wider mb-3">★ MY STARDUST BADGES GALLERY</span>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                          {[
                            { name: "🌌 Cosmic Explorer", desc: "Default pioneer stardust token", icon: "🌌", tip: "Unlocked on standard space system ignition!" },
                            { name: "🪐 Nebula Artist", desc: "Creative colors calibration", icon: "🪐", tip: "Calibrate and draw neon nodes in Nebula Pad!" },
                            { name: "👽 Alien Whisperer", desc: "Decipher alien starlight queries", icon: "👽", tip: "Earned by resolving Teacher's Trivia or Spelling!" },
                            { name: "🚀 Stellar Reader", desc: "Complete interactive stories", icon: "🚀", tip: "Choose your own Bedtime Story teller quest!" },
                            { name: "🏅 Orbit Math Genius", desc: "Flawless arithmetic flight", icon: "🏅", tip: "Charge standard Math Boosters correctly!" },
                            { name: "⭐ Cosmos Speller", desc: "Spelling voyager completion", icon: "⭐", tip: "Solve vocabulary blanks in Spelling Voyager!" },
                            { name: "🧠 Gravity Master", desc: "High score in Dino Jump", icon: "🧠", tip: "Hop over gravity asteroids in Astro Dino Jump!" },
                            { name: "☄️ Comet Chaser", desc: "Astromind smart response", icon: "☄️", tip: "Resolve multi-deck trivia or reading quizzes!" },
                            { name: "🔭 Galaxy Visionary", desc: "Dynamic quest solver", icon: "🔭", tip: "Answer dynamic Gemini challenge questions!" }
                          ].map((bd) => {
                            const isUnlocked = unlockedStickers.includes(bd.name);
                            return (
                              <button
                                key={bd.name}
                                type="button"
                                onClick={() => {
                                  triggerClickSound();
                                  // toggle custom detail
                                  setSelectedReadingOption(isUnlocked ? `🎉 ${bd.icon} Unlocked: ${bd.name}! ${bd.desc}` : `🔒 Locked Badge: Solve "${bd.tip}"`);
                                  setTimeout(() => setSelectedReadingOption(null), 3000);
                                }}
                                className={`p-3 rounded-xl border flex flex-col items-center text-center justify-between transition-all cursor-pointer select-none ${
                                  isUnlocked 
                                    ? "bg-zinc-950/80 border-cyan-500/25 text-white hover:border-cyan-500/50 shadow-[0_2px_10px_rgba(56,189,248,0.04)] active:scale-95" 
                                    : "bg-zinc-955/20 border-zinc-950/40 text-zinc-650 opacity-40 hover:opacity-55"
                                }`}
                              >
                                <span className="text-2xl mb-1.5">{bd.icon}</span>
                                <span className="font-mono text-[8px] font-bold tracking-tight block truncate w-full">{bd.name.split(" ")[1] || bd.name}</span>
                                <span className="text-[6.5px] text-zinc-550 leading-tight mt-1 truncate w-full">{isUnlocked ? bd.desc : "Locked"}</span>
                              </button>
                            );
                          })}
                        </div>

                        {selectedReadingOption && selectedReadingOption.includes("Unlocked") && (
                          <div className="mt-3 bg-cyan-950/20 border border-cyan-500/30 p-2 rounded-xl font-mono text-[8.5px] text-cyan-400 text-center animate-[fadeIn_0.2s_ease]">
                            {selectedReadingOption}
                          </div>
                        )}
                        {selectedReadingOption && selectedReadingOption.includes("Locked") && (
                          <div className="mt-3 bg-amber-950/20 border border-amber-500/30 p-2 rounded-xl font-mono text-[8.5px] text-amber-500 text-center animate-[fadeIn_0.2s_ease]">
                            {selectedReadingOption}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* DYNAMIC TEACHER'S CURRICULUM EXERCISE GENERATOR */}
                  {kidsActiveLesson === "generator" && (
                    <div className="space-y-6 animate-[fadeIn_0.3s_ease] text-left select-none pb-8">
                      
                      {/* Interactive Control & Stats Header */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        
                        {/* Selector 1: Choose Subject */}
                        <div className="bg-zinc-955/80 p-3.5 rounded-2xl border border-zinc-900 shadow-xl flex flex-col space-y-2.5 min-w-0">
                          <span className="font-mono text-[10.5px] sm:text-[11.5px] text-[#10eb73] uppercase font-bold tracking-wider truncate">Select Theme Subject:</span>
                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              { id: "math", name: "Math", icon: "🧮" },
                              { id: "spelling", name: "Spell", icon: "✍️" },
                              { id: "reading", name: "Read", icon: "📖" },
                            ].map((subSel) => {
                              const isSubActive = generatorSubject === subSel.id;
                              return (
                                <button
                                  key={subSel.id}
                                  type="button"
                                  onClick={() => {
                                    triggerClickSound();
                                    setGeneratorSubject(subSel.id as any);
                                    handleGenerateCurriculumChallenge(generatorLevel, subSel.id as any);
                                  }}
                                  className={`py-2 rounded-xl text-[10.5px] font-mono border transition-all cursor-pointer flex flex-col items-center justify-center leading-tight min-w-0 overflow-hidden ${
                                    isSubActive
                                      ? "bg-zinc-900/90 border-[#10eb73]/40 text-[#10eb73] font-black shadow-[0_0_12px_rgba(16,235,115,0.08)]"
                                      : "bg-zinc-950/60 hover:bg-zinc-900 border-zinc-900/60 text-zinc-300"
                                  }`}
                                >
                                  <span className="text-[13.5px]">{subSel.icon}</span>
                                  <span className="mt-0.5 truncate w-full text-center text-[9px] font-bold">{subSel.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Selector 2: Choose Grade Level */}
                        <div className="bg-zinc-955/80 p-3.5 rounded-2xl border border-[#27272a] shadow-xl flex flex-col space-y-2.5 min-w-0">
                          <span className="font-mono text-[10.5px] sm:text-[11.5px] text-amber-500 uppercase font-bold tracking-wider truncate">Select Level/Grade:</span>
                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              { id: "PRE", name: "Toddler", title: "Ages 2-4" },
                              { id: "MID", name: "Junior", title: "Ages 5-8" },
                              { id: "ADV", name: "Captain", title: "Ages 9+" },
                            ].map((lvlSel) => {
                              const isLvlActive = generatorLevel === lvlSel.id;
                              return (
                                <button
                                  key={lvlSel.id}
                                  type="button"
                                  onClick={() => {
                                    triggerClickSound();
                                    setGeneratorLevel(lvlSel.id as any);
                                    handleGenerateCurriculumChallenge(lvlSel.id as any, generatorSubject);
                                  }}
                                  className={`py-2 rounded-xl text-[10.5px] font-mono border transition-all cursor-pointer flex flex-col items-center justify-center leading-tight min-w-0 overflow-hidden ${
                                    isLvlActive
                                      ? "bg-zinc-900/90 border-amber-500/40 text-amber-400 font-black shadow-[0_0_12px_rgba(245,158,11,0.08)]"
                                      : "bg-zinc-950/60 hover:bg-zinc-900 border-zinc-900/60 text-zinc-300"
                                  }`}
                                >
                                  <span className="font-sans font-black text-[9.5px] uppercase truncate w-full text-center">{lvlSel.name}</span>
                                  <span className={`text-[7.5px] font-medium mt-0.5 leading-none truncate w-full text-center ${isLvlActive ? "text-amber-300/80" : "text-zinc-400/80"}`}>{lvlSel.title}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Selector 3: Live Score, Streak, Sticker Badges */}
                        <div className="bg-zinc-955/80 p-3.5 rounded-2xl border border-zinc-900 shadow-xl flex flex-col justify-between font-mono text-[9px] min-w-0 col-span-1 sm:col-span-2 lg:col-span-1">
                          <div className="space-y-2 w-full">
                            <div className="flex justify-between items-center text-zinc-200 text-[10px] sm:text-[11px] font-semibold">
                              <span>BADGE SCORE:</span>
                              <span className="text-[#10eb73] font-black">✨ {generatorScore} pts</span>
                            </div>
                            <div className="flex justify-between items-center text-zinc-200 text-[10px] sm:text-[11px] font-semibold">
                              <span>DAILY STREAK:</span>
                              <span className="text-amber-400 font-black">🔥 {generatorStreak} streak</span>
                            </div>
                            <div className="text-[7.5px] border-t border-zinc-900/60 pt-2 mt-1.5 flex flex-row gap-1.5 overflow-x-auto scrollbar-none flex-nowrap py-0.5 select-none w-full">
                              {unlockedStickers.map((st, sidx) => (
                                <span key={sidx} className="bg-zinc-950 border border-zinc-900/80 px-2 py-0.5 rounded text-[8px] font-bold text-[#38bdf8] flex-shrink-0" title={st}>
                                  {st}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Main Dynamic Interactive Hologram Space */}
                      <div className="bg-zinc-950/85 border-2 border-zinc-900 shadow-2xl p-6 sm:p-8 rounded-2xl min-h-[240px] relative overflow-hidden flex flex-col justify-center">
                        
                        {isLoadingChallenge ? (
                          <div className="flex flex-col items-center justify-center space-y-3 py-6 select-none">
                            <Sparkles className="w-8 h-8 text-[#10eb73] animate-spin" />
                            <p className="font-mono text-[10px] text-zinc-300 uppercase tracking-widest animate-pulse">
                              TRANSMITTING COSMIC CHALLENGE DATA...
                            </p>
                            <p className="text-[7.5px] text-zinc-550 font-mono">
                              Requesting custom AI parameters to customize your learning orbit!
                            </p>
                          </div>
                        ) : generatorChallenge ? (
                          <>
                            {generatorStatus === "correct" ? (
                              /* CELEBRATION COMPLETED VIEW */
                              <div className="space-y-4 py-3 text-center animate-[bounce_1.4s_infinite]">
                                <span className="text-4xl animate-pulse">🌟🚀📖🏆</span>
                                <p className="font-mono text-xs text-[#10eb73] font-black uppercase tracking-widest mt-1">EXERCISE SOLVED SUCCESSFULLY!</p>
                                <p className="text-[10px] font-mono text-[#38bdf8] font-bold">+15 Points Awarded • Sticker unlocked check!</p>
                                
                                {generatorChallenge.fact && (
                                  <div className="bg-zinc-955/80 border border-[#10eb73]/20 p-3 rounded-xl max-w-[420px] mx-auto text-left space-y-1 shadow-inner select-text">
                                    <span className="font-mono text-[7px] text-amber-500 font-black tracking-widest block uppercase">★ TEACHER LUNA'S STELLAR FACT:</span>
                                    <p className="text-[10px] font-sans text-zinc-300 italic leading-normal">
                                      "{generatorChallenge.fact}"
                                    </p>
                                  </div>
                                )}

                                <button
                                  type="button"
                                  onClick={() => {
                                    triggerClickSound();
                                    handleGenerateCurriculumChallenge(generatorLevel, generatorSubject);
                                  }}
                                  className="px-5 py-2 bg-[#10eb73]/80 hover:bg-[#10eb73] text-black font-mono font-bold rounded-xl text-[10px] cursor-pointer inline-flex items-center space-x-1.5 shadow-lg active:scale-95 transition-all mt-2"
                                >
                                  <span>NEXT LESSON QUEST</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              /* ACTIVE QUESTION VIEW */
                              <div className="space-y-4">
                                <div className="flex justify-between items-center text-zinc-300 text-[10px] sm:text-[11px] font-mono tracking-wider uppercase border-b border-zinc-900/90 pb-2.5 select-none">
                                  <span className="font-extrabold flex items-center space-x-1.5">
                                    <span className="w-2 h-2 rounded-full bg-[#10eb73] animate-pulse"></span>
                                    <span>SUBJECT: {generatorSubject.toUpperCase()}</span>
                                  </span>
                                  <span className="bg-zinc-950 px-2 py-0.5 rounded-lg border border-zinc-800 text-[9px] font-bold text-zinc-300">
                                    DIFFICULTY: {generatorLevel}
                                  </span>
                                </div>

                                {/* Reading Comprehension Block */}
                                {generatorSubject === "reading" && generatorChallenge.storyContent && (
                                  <div className="bg-[#0b0b0e] border border-zinc-900 p-3 rounded-xl font-sans text-[11.5px] leading-relaxed italic text-zinc-250 select-text max-h-[120px] overflow-y-auto custom-scrollbar">
                                    "{generatorChallenge.storyContent}"
                                  </div>
                                )}

                                <div className="text-left select-none">
                                  {/* Giant Question Display */}
                                  <p className="font-sans text-[14.5px] sm:text-[16px] md:text-[17px] text-white font-bold leading-relaxed mb-4 tracking-wide">
                                    {generatorChallenge.question}
                                  </p>

                                  {/* Answer multiple choice options */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                                    {generatorChallenge.options.map((opt) => {
                                      const isSelected = selectedGeneratorOption === opt;
                                      return (
                                        <button
                                          key={opt}
                                          type="button"
                                          onClick={() => handleCheckGeneratorAnswer(opt)}
                                          className={`p-3.5 rounded-xl text-[11px] sm:text-[13px] font-sans font-semibold text-left transition-all border-2 ${
                                            isSelected
                                              ? "bg-emerald-950/40 border-[#10eb73] text-[#10eb73] shadow-[0_0_15px_rgba(16,235,115,0.15)] scale-[1.01]"
                                              : "bg-zinc-950/70 hover:bg-zinc-900/80 border-zinc-800/80 text-zinc-200 hover:text-white shadow-md"
                                          } cursor-pointer active:scale-98`}
                                        >
                                          <span className={`inline-flex w-5 h-5 rounded-full items-center justify-center text-[10px] font-mono mr-2 ${
                                            isSelected ? "bg-[#10eb73]/25 text-[#10eb73]" : "bg-zinc-900 text-zinc-400"
                                          }`}>
                                            ➔
                                          </span>
                                          {opt}
                                        </button>
                                      );
                                    })}
                                  </div>

                                  {/* Footer row with Hints */}
                                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-zinc-900/80 select-none">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        triggerClickSound();
                                        setShowGeneratorHint(!showGeneratorHint);
                                      }}
                                      className="text-amber-400 hover:text-amber-300 hover:underline text-[10px] sm:text-[11.5px] font-mono flex items-center space-x-1.5 cursor-pointer font-bold"
                                    >
                                      <span>💡 {showGeneratorHint ? "HIDE LUNA'S CLUE" : "ASK LUNA FOR CLUE"}</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        triggerClickSound();
                                        handleGenerateCurriculumChallenge(generatorLevel, generatorSubject);
                                      }}
                                      className="text-zinc-400 hover:text-zinc-200 text-[10px] sm:text-[11px] font-mono uppercase cursor-pointer flex items-center space-x-1 font-bold"
                                    >
                                      <span>🔄 SKIP TO NEXT TASK</span>
                                    </button>
                                  </div>

                                  {/* Animated Clue/Hint block */}
                                  {showGeneratorHint && (
                                    <div className="mt-3 bg-amber-950/30 border border-amber-500/30 p-3 rounded-xl animate-[fadeIn_0.2s_ease]">
                                      <p className="font-mono text-[9px] sm:text-[10px] text-amber-400 font-extrabold uppercase select-none tracking-wider">💡 LUNA'S COSMIC CLUE:</p>
                                      <p className="text-[11px] sm:text-[12px] font-sans text-zinc-150 mt-1 select-text font-medium italic">
                                        "{generatorChallenge.hint}"
                                      </p>
                                    </div>
                                  )}

                                  {generatorStatus === "error" && (
                                    <p className="text-[8.5px] font-mono text-red-500 font-bold uppercase text-center mt-3 animate-bounce">⚡ Calculation or spelling misaligned! Retrying orbit calculations!</p>
                                  )}
                                </div>

                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-center py-5 space-y-2 select-none">
                            <p className="text-2xl animate-spin inline-block">🧿</p>
                            <p className="font-mono text-[10px] text-zinc-400">Loading dynamic Curriculum database crystals...</p>
                            <button
                              type="button"
                              onClick={() => handleGenerateCurriculumChallenge(generatorLevel, generatorSubject)}
                              className="px-4 py-1.5 bg-zinc-900 text-white font-mono rounded cursor-pointer text-[9px]"
                            >
                              START GENERATOR
                            </button>
                          </div>
                        )}

                      </div>

                    </div>
                  )}

                  {/* ACTIVITY 1: LUNA'S BULLETIN BOARD */}
                  {kidsActiveLesson === "luna" && (() => {
                    const lunaLetters = [
                      {
                        id: "letter-1",
                        date: "TODAY",
                        dateFull: "June 24, 2026",
                        title: "Engine Charge Mission",
                        subject: "Math Booster & Nebula Draw",
                        badge: "🔋 Solar Engine Charged",
                        text: "Good morning, junior space explorers! Welcome to today's cosmic dashboard. Our assignment is to charge our main solar engines by solving our Math Booster equations, verifying stellar words in our voyager tracker, and drawing colorful constellations in the Nebula pad! Don't forget to research solar facts in our safe browser! The Universe is waiting!",
                        mission: "Unlock 5 Math Boosters",
                        creativity: "Design a neon nebula"
                      },
                      {
                        id: "letter-2",
                        date: "YESTERDAY",
                        dateFull: "June 23, 2026",
                        title: "Deep Space Cartography",
                        subject: "Constellations & Spelling Stars",
                        badge: "🗺️ Constellation Mapper",
                        text: "Greetings, starlight cadets! Today we are charting the mysterious Alpha Centauri constellation. Put on your thinking helmets, practice your Spelling stars to communicate with alien systems, and let's explore deep space together!",
                        mission: "Spell 3 Star Words",
                        creativity: "Draw Alpha Centauri"
                      },
                      {
                        id: "letter-3",
                        date: "2 DAYS AGO",
                        dateFull: "June 22, 2026",
                        title: "The Sound of Silence",
                        subject: "Trivia Quizzes & Sound Synthesis",
                        badge: "🎵 Celestial Symphony",
                        text: "Hello, future astronauts! Teacher Luna here. Did you know that space is completely silent because there is no air for sound to travel? Let's make some waves ourselves by answering Stellar Trivia questions and unlocking special daily streaks!",
                        mission: "Solve 3 Trivia Questions",
                        creativity: "Hum a space melody"
                      },
                      {
                        id: "letter-4",
                        date: "3 DAYS AGO",
                        dateFull: "June 21, 2026",
                        title: "Jupiter Orbit Entry",
                        subject: "Astro Story Reading & Space Suit",
                        badge: "🪐 Jupiter Pioneer",
                        text: "Welcome to the celestial launchpad! Today is a perfect day to complete your space badges, update your customizable avatars, and help our rocket ship travel past Jupiter by solving reading quests!",
                        mission: "Read 1 Reading Story",
                        creativity: "Customize Space Suit"
                      }
                    ];

                    const activeLetter = lunaLetters.find(l => l.id === selectedLunaLetterId) || lunaLetters[0];

                    return (
                      <div className="space-y-4 animate-[fadeIn_0.3s_ease]">
                        {/* Title header */}
                        <div className="flex items-center space-x-2 border-b border-zinc-900 pb-3">
                          <div className="w-8 h-8 rounded-full bg-cyan-955/40 border border-cyan-500/40 flex items-center justify-center">
                            <span className="text-cyan-400 font-bold text-sm">👩‍🚀</span>
                          </div>
                          <div>
                            <h4 className="font-mono font-bold text-xs text-zinc-150 leading-none">TEACHER LUNA'S CORRESPONDENCE INBOX</h4>
                            <span className="text-[7.5px] text-zinc-500 block font-mono mt-1">STAR DATA MATRIX // RETRACTABLE LOG HISTORICAL ARCHIVES</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                          {/* Left Sidebar: Inbox List */}
                          <div className="lg:col-span-4 bg-[#0a0a0d]/60 border border-zinc-900/60 p-3 rounded-2xl flex flex-col space-y-2 max-h-[380px] overflow-y-auto custom-scrollbar">
                            <span className="font-mono text-[8px] text-cyan-400 font-bold block uppercase tracking-wider mb-1 px-1">★ RECENT LETTERS ({lunaLetters.length})</span>
                            
                            {lunaLetters.map((letter) => {
                              const isSelected = letter.id === selectedLunaLetterId;
                              return (
                                <button
                                  key={letter.id}
                                  type="button"
                                  onClick={() => {
                                    triggerClickSound();
                                    setSelectedLunaLetterId(letter.id);
                                  }}
                                  className={`w-full p-2.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col space-y-1 ${
                                    isSelected
                                      ? "bg-cyan-950/20 border-cyan-500/50 shadow-[0_0_12px_rgba(34,211,238,0.06)]"
                                      : "bg-zinc-955/50 hover:bg-zinc-900/40 border-transparent text-zinc-400"
                                  }`}
                                >
                                  <div className="flex justify-between items-center w-full">
                                    <span className={`font-mono text-[7px] font-bold ${isSelected ? "text-cyan-400" : "text-zinc-500"}`}>
                                      {letter.date}
                                    </span>
                                    <span className="text-[6.5px] text-zinc-550 font-mono">
                                      {letter.dateFull}
                                    </span>
                                  </div>
                                  <span className={`font-sans text-[10.5px] font-bold truncate block ${isSelected ? "text-white" : "text-zinc-300"}`}>
                                    {letter.title}
                                  </span>
                                  <span className="text-[7.5px] font-mono text-zinc-500 truncate block">
                                    {letter.subject}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Right Content Pane: Selected Letter Display */}
                          <div className="lg:col-span-8 bg-zinc-955/30 border border-zinc-900/60 p-5 rounded-2xl relative overflow-hidden shadow-2xl flex flex-col justify-between space-y-4">
                            <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                            
                            <div className="space-y-3">
                              <div className="flex justify-between items-start border-b border-zinc-900 pb-3">
                                <div>
                                  <span className="font-mono text-[8px] text-cyan-400 font-bold block uppercase tracking-wider">
                                    {activeLetter.date} LETTER
                                  </span>
                                  <h4 className="font-sans font-extrabold text-[13px] text-white mt-0.5">
                                    "{activeLetter.title}"
                                  </h4>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    if (typeof window !== "undefined" && window.speechSynthesis) {
                                      window.speechSynthesis.cancel();
                                      const utterance = new SpeechSynthesisUtterance(activeLetter.text);
                                      const storedVoiceName = localStorage.getItem("system_speak_voice");
                                      const voices = window.speechSynthesis.getVoices();
                                      const voice = voices.find(v => v.name === storedVoiceName);
                                      if (voice) utterance.voice = voice;
                                      utterance.pitch = 1.1;
                                      utterance.rate = 0.95;
                                      window.speechSynthesis.speak(utterance);
                                    }
                                  }}
                                  className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border border-cyan-850 rounded-lg text-[8.5px] font-mono font-bold cursor-pointer transition-all active:scale-95 flex items-center space-x-1"
                                  title="Let Teacher Luna's AI read this letter aloud"
                                >
                                  <span>🎙️ READ ALOUD</span>
                                </button>
                              </div>

                              <p className="text-[11px] font-sans text-zinc-200 leading-relaxed italic text-justify select-text whitespace-pre-wrap">
                                "{activeLetter.text}"
                              </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 select-none">
                              <button
                                type="button"
                                onClick={() => {
                                  triggerClickSound();
                                  const lower = activeLetter.mission.toLowerCase();
                                  if (lower.includes("math")) {
                                    setKidsActiveLesson("math");
                                  } else if (lower.includes("spell") || lower.includes("word")) {
                                    setKidsActiveLesson("spelling");
                                  } else if (lower.includes("trivia") || lower.includes("question") || lower.includes("solve")) {
                                    setKidsActiveLesson("trivia");
                                  } else if (lower.includes("read") || lower.includes("story")) {
                                    setKidsActiveLesson("reading");
                                  }
                                }}
                                className="bg-[#0b0b0e] border border-zinc-900/80 hover:bg-zinc-900/60 hover:border-[#10eb73]/40 p-3 rounded-xl flex flex-col justify-center text-left cursor-pointer transition-all active:scale-[0.98] group relative overflow-hidden"
                                title="Click to launch this activity!"
                              >
                                <div className="font-mono text-[7px] text-[#10eb73] font-bold tracking-wider uppercase flex items-center justify-between w-full">
                                  <span>★ TODAY'S ACTION MISSION:</span>
                                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[6px] text-[#10eb73] font-normal uppercase">Launch 🚀</span>
                                </div>
                                <div className="text-[10.5px] text-zinc-300 font-bold mt-1 flex items-center space-x-1 group-hover:text-white transition-colors">
                                  <span>🚀</span>
                                  <span>{activeLetter.mission}</span>
                                </div>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  triggerClickSound();
                                  const lower = activeLetter.creativity.toLowerCase();
                                  if (lower.includes("design") || lower.includes("nebula") || lower.includes("draw") || lower.includes("centauri") || lower.includes("melody") || lower.includes("hum")) {
                                    setKidsActiveLesson("painting");
                                  } else if (lower.includes("customize") || lower.includes("suit") || lower.includes("avatar") || lower.includes("profile")) {
                                    setKidsActiveLesson("profile");
                                  }
                                }}
                                className="bg-[#0b0b0e] border border-zinc-900/80 hover:bg-zinc-900/60 hover:border-pink-500/40 p-3 rounded-xl flex flex-col justify-center text-left cursor-pointer transition-all active:scale-[0.98] group relative overflow-hidden"
                                title="Click to open this creative activity!"
                              >
                                <div className="font-mono text-[7px] text-pink-400 font-bold tracking-wider uppercase flex items-center justify-between w-full">
                                  <span>★ CREATIVE EXPLORER ACTIVITY:</span>
                                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[6px] text-pink-400 font-normal uppercase">Open 🎨</span>
                                </div>
                                <div className="text-[10.5px] text-zinc-300 font-bold mt-1 flex items-center space-x-1 group-hover:text-white transition-colors">
                                  <span>🎨</span>
                                  <span>{activeLetter.creativity}</span>
                                </div>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* ACTIVITY 2: MATH SPACE BOOSTER GATE */}
                  {kidsActiveLesson === "math" && (
                    <div className="space-y-3 flex flex-col justify-between h-full animate-[fadeIn_0.3s_ease]">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center bg-zinc-950 p-2.5 rounded-xl border border-zinc-900">
                          <span className="font-mono text-[8.5px] text-zinc-400 font-bold flex items-center space-x-1.5 uppercase">
                            <Sparkles className="w-3.5 h-3.5 text-[#10eb73] animate-spin" />
                            <span>Math Fuel Generator</span>
                          </span>
                          <span className="font-mono text-[8.5px] text-amber-500 font-bold">
                            Score: ✨ {mathScore} Stars
                          </span>
                        </div>

                        <div className="bg-black/60 border border-zinc-950 p-4 rounded-xl flex flex-col items-center justify-center min-h-[140px] text-center relative overflow-hidden">
                          {mathStatus === "correct" ? (
                            <div className="space-y-2 py-2 animate-[bounce_1s_infinite]">
                              <p className="text-2xl">🚀✨</p>
                              <p className="font-mono text-xs text-[#10eb73] font-bold uppercase tracking-widest">
                                BOOSTER CHARGED COMPLETED!
                              </p>
                              <p className="text-[9px] text-zinc-400">{mathFeedback}</p>
                            </div>
                          ) : (
                            <div className="space-y-4 w-full max-w-[200px]">
                              <div className="flex items-center justify-center space-x-4 font-mono text-xl font-bold select-none text-zinc-100">
                                <span className="bg-zinc-900/80 px-3 py-1 bg-zinc-950 border border-zinc-900 rounded-lg text-[#10eb73]">{mathNum1}</span>
                                <span className="text-zinc-500">+</span>
                                <span className="bg-zinc-900/80 px-3 py-1 bg-zinc-950 border border-zinc-900 rounded-lg text-[#10eb73]">{mathNum2}</span>
                                <span className="text-zinc-500">=</span>
                                <span className="text-amber-500 animate-[pulse_1.5s_infinite]">?</span>
                              </div>

                              <div className="flex space-x-2">
                                <input
                                  type="text"
                                  pattern="[0-9]*"
                                  placeholder="Type Answer"
                                  value={mathAnswer}
                                  onChange={(e) => setMathAnswer(e.target.value)}
                                  onKeyDown={(e) => e.key === "Enter" && handleCheckMathAnswer()}
                                  className="w-full bg-zinc-950 border border-zinc-900 rounded-xl px-2.5 py-1.5 font-mono text-center text-xs text-white focus:border-zinc-800 outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={handleCheckMathAnswer}
                                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold rounded-xl text-[9px] cursor-pointer"
                                >
                                  LAUNCH
                                </button>
                              </div>

                              {mathStatus === "error" && (
                                <p className="text-[8px] font-mono text-red-400 font-bold uppercase">{mathFeedback}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ACTIVITY 3: SPELLING WORD VOYAGER */}
                  {kidsActiveLesson === "spelling" && (
                    <div className="space-y-3 flex flex-col justify-between h-full animate-[fadeIn_0.3s_ease]">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center bg-zinc-950 p-2.5 rounded-xl border border-zinc-900">
                          <span className="font-mono text-[8.5px] text-zinc-400 font-bold flex items-center space-x-1.5 uppercase">
                            <Smile className="w-3.5 h-3.5 text-pink-400" />
                            <span>Spelling Star Voyager</span>
                          </span>
                          <span className="font-mono text-[8.5px] text-[#10eb73] font-bold">
                            Completed: {spellingScore} words
                          </span>
                        </div>

                        <div className="bg-black/60 border border-zinc-950 p-4 rounded-xl flex flex-col items-center justify-center min-h-[140px] text-center relative overflow-hidden">
                          {spellingStatus === "correct" ? (
                            <div className="space-y-1 py-4">
                              <span className="text-2xl">✨🌈🏆</span>
                              <p className="font-mono text-xs text-pink-400 font-bold uppercase tracking-widest mt-1">
                                CORRECT SPELLING!
                              </p>
                              <p className="text-[9px] text-zinc-400 font-mono">
                                Splendid job! Preparing next space word...
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-4 w-full max-w-[220px]">
                              <div>
                                <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest mb-1.5 select-none font-bold">Fill in the blank letter:</p>
                                <div className="font-mono text-2xl font-black text-zinc-100 uppercase tracking-widest tracking-[8px] pl-1 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-900 select-none">
                                  {spellingPool[spellingIndex].partial}
                                </div>
                              </div>

                              <div className="grid grid-cols-4 gap-1.5 select-none font-bold">
                                {spellingPool[spellingIndex].options.map((opt) => (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => handleChooseLetter(opt)}
                                    className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 p-2 text-xs font-mono font-bold text-zinc-300 rounded-xl hover:text-white cursor-pointer active:scale-95 transition-all text-center"
                                  >
                                    {opt}
                                  </button>
                                ))}
                              </div>

                              {spellingStatus === "error" && (
                                <p className="text-[8px] font-mono text-red-400 font-bold font-black">⚡ Ups! That letter is incorrect! Try another choice!</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ACTIVITY 4: ALIEN SPACE TRIVIA */}
                  {kidsActiveLesson === "trivia" && (
                    <div className="space-y-3 flex flex-col justify-between h-full animate-[fadeIn_0.3s_ease]">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center bg-zinc-950 p-2.5 rounded-xl border border-zinc-950">
                          <span className="font-mono text-[8.5px] text-zinc-400 font-bold flex items-center space-x-1.5 uppercase">
                            <GraduationCap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                            <span>Astro Science Trivia</span>
                          </span>
                          <span className="font-mono text-[8.5px] text-[#10eb73] font-bold">
                            Score: {triviaScore} Smart Points
                          </span>
                        </div>

                        <div className="bg-black/40 border border-zinc-950 p-4 rounded-xl flex flex-col justify-center min-h-[140px] text-center relative">
                          {triviaStatus === "correct" ? (
                            <div className="space-y-2 py-4 text-center">
                              <span className="text-2xl">🎓🚀🌟</span>
                              <p className="font-mono text-xs text-[#10eb73] font-bold uppercase tracking-widest mt-1">ASTROMIND CORRECT!</p>
                              <p className="text-[9px] text-zinc-400">Loading orbital navigation path questions...</p>
                            </div>
                          ) : (
                            <div className="text-left space-y-3 select-none">
                              <p className="font-sans text-[10.5px] text-zinc-200 font-bold leading-relaxed select-text">
                                Q: {triviaPool[triviaIndex].q}
                              </p>

                              <div className="grid grid-cols-2 gap-2">
                                {triviaPool[triviaIndex].opt.map((opt) => (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => handleSelectTriviaOption(opt)}
                                    className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-900/80 p-2 rounded-xl text-[9px] font-mono text-zinc-350 cursor-pointer text-left hover:text-white transition-all hover:border-zinc-700/50"
                                  >
                                    • {opt}
                                  </button>
                                ))}
                              </div>

                              {triviaStatus === "error" && (
                                <p className="text-[8px] font-mono text-red-400 font-bold uppercase text-center mt-2 animate-bounce font-black">⚡ Re-computing... Select another choice!</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ACTIVITY 5: NEBULA PAINTING GRID */}
                  {kidsActiveLesson === "painting" && (
                    <div className="space-y-2.5 flex flex-col justify-between h-full animate-[fadeIn_0.3s_ease]">
                      <div className="flex justify-between items-center bg-zinc-900/40 p-2 px-3 rounded-xl border border-zinc-950/80 select-none">
                        <span className="font-mono text-[9px] text-zinc-350 font-bold flex items-center space-x-1.5 uppercase">
                          <Star className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
                          <span>Nebula Laser Paint Studio</span>
                        </span>
                        <span className="font-mono text-[8px] text-zinc-550 uppercase">Interactive Sound Synth Pad</span>
                      </div>

                      <div className="flex-1">
                        <NebulaPaintBoard playSfx={playSfx} isKidsMode={isKidsMode} />
                      </div>
                    </div>
                  )}

                  {/* ACTIVITY 6: READING QUEST (CHOOSE-YOUR-OWN-ADVENTURE STORYTELLER) */}
                  {kidsActiveLesson === "reading" && (
                    <div className="space-y-3 flex flex-col justify-between h-full animate-[fadeIn_0.3s_ease] select-none text-left">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center bg-zinc-955/80 p-2.5 rounded-xl border border-zinc-900 shadow-sm">
                          <span className="font-mono text-[9px] text-zinc-400 font-bold flex items-center space-x-1.5 uppercase">
                            <BookOpen className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                            <span>Choose-Your-Own-Adventure Space Storyteller</span>
                          </span>
                          <span className="font-mono text-[9px] text-amber-500 font-bold">
                            Score: {readingScore} Story Badges
                          </span>
                        </div>

                        {!activeStoryBook ? (
                          /* Setup and configuration dashboard */
                          <div className="bg-[#0b0b0e] border border-zinc-900 p-4 rounded-xl space-y-4">
                            <div className="space-y-1">
                              <h4 className="font-mono text-xs font-bold text-sky-400 uppercase tracking-widest">
                                🌌 Craft Your Galaxy Adventure Quest
                              </h4>
                              <p className="text-[9px] text-zinc-400">
                                Select options below and the AI will weave a customized, educational interactive story!
                              </p>
                            </div>

                            {isLoadingStory ? (
                              <div className="flex flex-col items-center justify-center py-10 space-y-3">
                                <Award className="w-10 h-10 text-sky-400 animate-spin" />
                                <p className="font-mono text-xs text-white uppercase tracking-widest animate-pulse">
                                  AI IS WEAVING YOUR STELLAR STORY... 🔮🚀
                                </p>
                                <p className="text-[8px] text-zinc-500 font-mono text-center max-w-[250px]">
                                  Tuning neural nodes to calibrate safe, customized, child-friendly reading challenges.
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-3 text-xs">
                                {/* Grid 1: Setting */}
                                <div className="space-y-1">
                                  <span className="font-mono text-[8px] text-zinc-500 uppercase font-bold block">1. Choose Adventure Sector Location:</span>
                                  <div className="grid grid-cols-2 gap-1.5">
                                    {["🌲 Jellyfish Forest", "🪐 Cyber Saturn", "🌋 Lava Moon", "🎪 Star Carnival"].map((st) => (
                                      <button
                                        key={st}
                                        type="button"
                                        onClick={() => { triggerClickSound(); setAdventureSetting(st); }}
                                        className={`p-2 rounded-xl border font-mono text-[9px] text-left cursor-pointer transition-all ${
                                          adventureSetting === st 
                                            ? "bg-zinc-900 border-sky-500/50 text-white font-bold" 
                                            : "bg-zinc-950/60 border-zinc-900 text-zinc-400 hover:bg-zinc-900/40"
                                        }`}
                                      >
                                        {st}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* Grid 2: Theme Subject */}
                                <div className="space-y-1">
                                  <span className="font-mono text-[8px] text-zinc-500 uppercase font-bold block">2. Select Story Mission Goal:</span>
                                  <div className="grid grid-cols-2 gap-1.5">
                                    {[
                                      "Friendly Space Squirrels",
                                      "Searching for Cosmic Candy",
                                      "Decoding Alien Star Signals",
                                      "Rescuing the Sleeping Sun Spirit"
                                    ].map((thm) => (
                                      <button
                                        key={thm}
                                        type="button"
                                        onClick={() => { triggerClickSound(); setAdventureTheme(thm); }}
                                        className={`p-2 rounded-xl border font-mono text-[9px] text-left cursor-pointer transition-all ${
                                          adventureTheme === thm 
                                            ? "bg-zinc-900 border-sky-500/50 text-white font-bold" 
                                            : "bg-zinc-950/60 border-zinc-900 text-zinc-400 hover:bg-zinc-900/40"
                                        }`}
                                      >
                                        ✨ {thm}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* Grid 3: Companion helper */}
                                <div className="space-y-1">
                                  <span className="font-mono text-[8px] text-zinc-500 uppercase font-bold block">3. Assign Your Sidekick Companion:</span>
                                  <div className="grid grid-cols-2 gap-1.5">
                                    {["🤖 Robo-Buddy Bolt", "🦄 Luna Unicorn", "👾 Goopy the Blob", "🐲 Cute Nebula Dragon"].map((cp) => (
                                      <button
                                        key={cp}
                                        type="button"
                                        onClick={() => { triggerClickSound(); setAdventureCompanion(cp); }}
                                        className={`p-2 rounded-xl border font-mono text-[9px] text-left cursor-pointer transition-all ${
                                          adventureCompanion === cp 
                                            ? "bg-zinc-900 border-sky-500/50 text-white font-bold" 
                                            : "bg-zinc-950/60 border-zinc-900 text-zinc-400 hover:bg-zinc-900/40"
                                        }`}
                                      >
                                        {cp}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* Start Action Button */}
                                <button
                                  type="button"
                                  onClick={handleFetchAdventureStory}
                                  className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white font-mono font-bold rounded-xl text-[10px] tracking-wider cursor-pointer shadow-lg active:scale-98 transition-all uppercase block"
                                >
                                  ✨ WEAVE MY STORY ADVENTURE! ✨
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          /* Active Story Book rendering */
                          <div className="bg-[#0b0b0e] border border-zinc-900 p-4 rounded-xl space-y-4 animate-[fadeIn_0.25s_ease]">
                            {/* Story Header */}
                            <div className="flex justify-between items-center border-b border-zinc-900/60 pb-2">
                              <h4 className="font-mono text-[10px] font-bold text-sky-400 truncate max-w-[200px]">
                                {activeStoryBook.title}
                              </h4>
                              <span className="font-mono text-[8px] text-zinc-500 uppercase">
                                Page {storyCurrentPage + 1} / 4
                              </span>
                            </div>

                            {/* Pages Progress Bar indicator */}
                            <div className="flex gap-1">
                              {[0, 1, 2, 3].map((idx) => (
                                <div 
                                  key={idx}
                                  className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                                    idx <= storyCurrentPage ? "bg-sky-500" : "bg-zinc-900"
                                  }`}
                                />
                              ))}
                            </div>

                            {/* Readable Story Text Body */}
                            <div className="bg-zinc-955/85 p-4 rounded-xl border border-zinc-900/80 leading-relaxed font-sans text-xs sm:text-sm text-zinc-200 select-text font-medium relative">
                              <div className="absolute top-2 right-2 text-zinc-650 text-xl font-serif">“</div>
                              {activeStoryBook.pages[storyCurrentPage]}
                            </div>

                            {/* Interactive Choices or Completion Panel */}
                            {storyCurrentPage < 3 ? (
                              <div className="space-y-2">
                                <p className="font-mono text-[7.5px] text-zinc-500 uppercase tracking-widest">
                                  WHAT WILL YOU CHOOSE TO DO?
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      triggerClickSound();
                                      const choice = `Decided to lead down the shining path under ${adventureSetting}`;
                                      const newLog = [...adventureChoicesLog, choice];
                                      setAdventureChoicesLog(newLog);
                                      localStorage.setItem("kids_adventure_choices", JSON.stringify(newLog));
                                      setStoryCurrentPage(prev => prev + 1);
                                    }}
                                    className="p-3 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 rounded-xl text-left font-mono text-[9px] text-zinc-300 hover:text-white cursor-pointer active:scale-95 transition-all leading-tight"
                                  >
                                    👉 Option A: Trust your gut and explore the glowing stardust trail with {activeStoryBook.character}!
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      triggerClickSound();
                                      const choice = `Decided to sit and analyze logs with ${adventureCompanion}`;
                                      const newLog = [...adventureChoicesLog, choice];
                                      setAdventureChoicesLog(newLog);
                                      localStorage.setItem("kids_adventure_choices", JSON.stringify(newLog));
                                      setStoryCurrentPage(prev => prev + 1);
                                    }}
                                    className="p-3 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 rounded-xl text-left font-mono text-[9px] text-zinc-300 hover:text-white cursor-pointer active:scale-95 transition-all leading-tight"
                                  >
                                    🎒 Option B: Halt and use {activeStoryBook.character}'s specialized radar scan sensor to examine the terrain!
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* Climax / Magic voice chant panel */
                              <div className="space-y-3 bg-zinc-950/80 p-3 rounded-xl border border-zinc-900">
                                <h5 className="font-mono text-[9px] text-[#10eb73] font-bold uppercase tracking-widest flex items-center space-x-1.5">
                                  <Award className="w-3.5 h-3.5 text-[#10eb73]" />
                                  <span>GALAXY MISSION COMPLETED!</span>
                                </h5>

                                <p className="text-[8.5px] font-sans text-zinc-400">
                                  You completed all adventure steps! Read your final choices and chant the magic phrase to release the celestial beacon!
                                </p>

                                {/* Journey log list */}
                                <div className="p-2 bg-[#0b0b0e] border border-zinc-900/60 rounded-lg text-[8px] font-mono text-zinc-400 space-y-1">
                                  <span className="text-zinc-500 font-bold block uppercase tracking-wider">YOUR STORY LOG PATH:</span>
                                  {adventureChoicesLog.map((log, i) => (
                                    <div key={i} className="truncate">
                                      • Step {i + 1}: {log}
                                    </div>
                                  ))}
                                </div>

                                <div className="p-3 bg-sky-955/20 border border-sky-500/20 rounded-lg text-center space-y-2">
                                  <span className="font-mono text-[7px] text-zinc-550 block uppercase font-bold">STARDUST CHANT KEYPHRASE:</span>
                                  <span className="text-xs font-mono font-black text-sky-400 tracking-wider uppercase block select-all">
                                    "{activeStoryBook.magicKeyphrase}"
                                  </span>

                                  {storyCompleted ? (
                                    <div className="text-[9px] font-mono text-emerald-400 font-bold uppercase">
                                      ✨ Story reward claimed! +20 Stars & "Stellar Reader" badge unlocked! ✨
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        playCheerMelody();
                                        setReadingScore(prev => prev + 1);
                                        
                                        // Save total curriculum score
                                        const newScore = generatorScore + 20;
                                        setGeneratorScore(newScore);
                                        localStorage.setItem("kids_curriculum_score", newScore.toString());

                                        // Unlock badge
                                        if (!unlockedStickers.includes("🚀 Stellar Reader")) {
                                          const updated = [...unlockedStickers, "🚀 Stellar Reader"];
                                          setUnlockedStickers(updated);
                                          localStorage.setItem("kids_curriculum_stickers", JSON.stringify(updated));
                                        }

                                        setStoryCompleted(true);
                                      }}
                                      className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-black font-mono font-bold rounded-xl text-[9px] cursor-pointer inline-block"
                                    >
                                      🎙️ CHANT MAGIC KEYPHRASE & SECURE BADGE
                                    </button>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    triggerClickSound();
                                    setActiveStoryBook(null);
                                    setStoryCurrentPage(0);
                                    setStoryCompleted(false);
                                  }}
                                  className="w-full py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-mono font-bold rounded-xl text-[8px] cursor-pointer text-center block uppercase"
                                >
                                  📖 Close Book & Compose New Quest
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            ) : (
              /* ==========================================
                  STANDARD REAL SYSTEM FILES VIEW (ORIGINAL)
                 ========================================== */
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-zinc-950/40 p-2 rounded-xl border border-zinc-900/60 font-mono">
                  <div className="flex items-center space-x-2 text-zinc-400 text-[10px]">
                    <FolderOpen className={`w-3.5 h-3.5 ${themeStyles.accent}`} />
                    <span className="text-white font-bold select-none text-[9.5px]">FILES://root</span>
                    {currentFolderId && (
                      <>
                        <ChevronRight className="w-3 h-3 text-zinc-450" />
                        <span className="text-amber-500/90 truncate max-w-[120px]">
                          {fileList.find(n => n.id === currentFolderId)?.name}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center space-x-1.5 text-[9px]">
                    {currentFolderId !== null && (
                      <button
                        type="button"
                        onClick={navigateFolderUp}
                        className="px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 rounded font-bold text-zinc-300 border border-zinc-850 cursor-pointer"
                      >
                        [ GO UP ]
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        triggerClickSound();
                        setShowNodeCreator(showNodeCreator === "file" ? null : "file");
                      }}
                      className="px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 text-emerald-400/90 hover:text-white rounded font-bold border border-[#27272a] flex items-center space-x-1 cursor-pointer"
                      title="Create New File"
                    >
                      <FilePlus className="w-3 h-3" />
                      <span>+FILE</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        triggerClickSound();
                        setShowNodeCreator(showNodeCreator === "directory" ? null : "directory");
                      }}
                      className="px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 text-amber-500/90 hover:text-white rounded font-bold border border-[#27272a] flex items-center space-x-1 cursor-pointer"
                      title="Create New Directory"
                    >
                      <FolderPlus className="w-3 h-3" />
                      <span>+FOLDER</span>
                    </button>
                  </div>
                </div>

                {/* Create Directory/File Popup Form Box */}
                <AnimatePresence>
                  {showNodeCreator && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="bg-[#0b0b0e] p-3 rounded-xl border border-zinc-900 text-[10px] space-y-2"
                    >
                      <div className="font-mono text-zinc-455 uppercase tracking-widest font-bold text-[8.5px]">
                        Create New {showNodeCreator === "file" ? "Document File" : "Sub Directory Folder"}
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder={showNodeCreator === "file" ? "filename.txt..." : "folder_name..."}
                          value={newFSNodeName}
                          onChange={(e) => setNewFSNodeName(e.target.value)}
                          className="flex-1 bg-zinc-950 border border-zinc-900 rounded-lg px-2.5 py-1.5 text-zinc-300 font-mono text-[10px]"
                          onKeyDown={(e) => e.key === "Enter" && handleCreateNode(showNodeCreator)}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleCreateNode(showNodeCreator)}
                          className="px-3.5 py-1.5 bg-white text-black font-mono font-bold rounded-lg hover:bg-zinc-200 cursor-pointer text-[10.5px]"
                        >
                          CREATE
                        </button>
                        <button
                          type="button"
                          onClick={() => { triggerClickSound(); setShowNodeCreator(null); }}
                          className="px-2.5 py-1.5 border border-zinc-900 bg-zinc-950 text-zinc-500 rounded-lg font-mono cursor-pointer"
                        >
                          CANCEL
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Nodes directory grid rendering card list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                  {/* Directory listings */}
                  <div className="bg-zinc-950/80 border border-zinc-900 p-3 rounded-xl min-h-[170px] max-h-[300px] overflow-y-auto custom-scrollbar space-y-1 select-none">
                    {visibleNodes.length === 0 ? (
                      <div className="text-center font-mono text-[8px] text-zinc-350 py-10 uppercase tracking-widest select-none">
                        [ Directory Empty ]
                      </div>
                    ) : (
                      visibleNodes.map((node) => (
                        <div
                          key={node.id}
                          onClick={() => {
                            triggerClickSound();
                            if (node.type === "directory") {
                              setCurrentFolderId(node.id);
                              setSelectedFile(null);
                              setIsFileEditing(false);
                            } else {
                              setSelectedFile(node);
                              setEditFileContent(node.content || "");
                              setIsFileEditing(false);
                            }
                          }}
                          className={`flex justify-between items-center p-1.5 rounded-lg hover:bg-zinc-900/70 cursor-pointer text-[10.5px] font-mono group border ${
                            selectedFile?.id === node.id 
                              ? "border-amber-500/20 bg-amber-950/5 text-amber-300/90" 
                              : "border-transparent text-zinc-400 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center space-x-2 truncate">
                            {node.type === "directory" ? (
                              <Folder className="w-3.5 h-3.5 text-amber-500" />
                            ) : (
                              <FileText className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-400/80 transition-colors" />
                            )}
                            <span className="truncate">{node.name}</span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[8px] text-zinc-400 uppercase tracking-wider font-mono mr-1">
                              {node.type === "directory" ? "DIR" : "FILE"}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteNode(node.id, e)}
                              className="p-1 rounded hover:bg-red-950/20 text-zinc-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer duration-150"
                              title="Delete Node"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Reader and Interactive Text Editor Frame */}
                  <div className="bg-[#0b0b0d]/92 border border-zinc-900/60 p-3.5 rounded-xl min-h-[170px] max-h-[300px] overflow-y-auto custom-scrollbar flex flex-col justify-between relative">
                    {selectedFile ? (
                      <div className="space-y-3 flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-center border-b border-zinc-900/65 pb-2 border-zinc-900 select-none">
                          <div className="font-mono text-[9px] text-[#f59e0b] font-bold select-none uppercase truncate max-w-[150px]">
                            📄 {selectedFile.name}
                          </div>
                          {!isFileEditing ? (
                            <button
                              type="button"
                              onClick={() => {
                                triggerClickSound();
                                setEditFileContent(selectedFile.content || "");
                                setIsFileEditing(true);
                              }}
                              className="px-2 py-0.5 bg-zinc-904 hover:bg-zinc-800 rounded font-mono text-[8.5px] border border-zinc-850 hover:text-white cursor-pointer"
                            >
                              EDIT DOCUMENT
                            </button>
                          ) : (
                            <div className="flex items-center space-x-1">
                              <button
                                type="button"
                                onClick={saveEditedFileChanges}
                                className="px-2 py-0.5 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-950/30 rounded font-mono text-[8.5px] border border-emerald-900/40 font-bold flex items-center space-x-1 cursor-pointer"
                              >
                                <Save className="w-2.5 h-2.5" />
                                <span>SAVE</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => { triggerClickSound(); setIsFileEditing(false); }}
                                className="px-2 py-0.5 bg-zinc-900 text-zinc-500 rounded font-mono text-[8.5px] border border-zinc-850 cursor-pointer"
                              >
                                X
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Content area */}
                        <div className="flex-1 flex flex-col pt-1">
                          {isFileEditing ? (
                            <textarea
                              value={editFileContent}
                              onChange={(e) => setEditFileContent(e.target.value)}
                              className="w-full flex-1 min-h-[100px] bg-zinc-950 border border-zinc-900 rounded-lg p-2 font-mono text-[9.5px] text-zinc-200 focus:outline-none focus:border-zinc-800 leading-relaxed overflow-y-auto custom-scrollbar"
                            />
                          ) : (
                            <pre className="font-mono text-[9.5px] text-zinc-400 whitespace-pre-wrap leading-relaxed select-text select-text block overflow-y-auto max-h-[140px] custom-scrollbar">
                              {selectedFile.content}
                            </pre>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center my-auto py-10 space-y-1">
                        <Cpu className="w-4 h-4 mx-auto text-zinc-800 animate-pulse" />
                        <p className="text-[8px] font-mono text-zinc-650 uppercase tracking-widest font-bold">
                          FILE_READER_STANDBY
                        </p>
                        <p className="text-[10px] font-sans text-zinc-550 leading-relaxed select-none px-4">
                          Create or select any systemic logs or config file above to render/edit its contents inside quantum registry slots.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

         {/* ==========================================
            APPS LAUNCHER WORKSPACE
           ========================================== */}
        {type === "APPS" && (
          <div className="space-y-4">
            
            {/* If no app is active, draw App Launcher Deck Grid */}
            {!activeApp ? (
              <div className="space-y-4 animate-[fadeIn_0.35s_ease-out]">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1">
                  <p className="font-mono text-[9.5px] text-zinc-500 uppercase tracking-widest block font-bold">
                    {isKidsMode ? "🎈 Teacher Luna's Toybox Console 🧸" : "ACTIVE APPLICATION CONSOLE LAUNCHER"}
                  </p>
                  
                  {isKidsMode && (
                    <div className="text-[8px] font-mono bg-purple-950/40 text-purple-400 px-2.5 py-0.5 rounded-lg border border-purple-900/40 select-none font-bold uppercase">
                      STARS: ⭐ {dinoScore + mathScore + spellingScore * 10}
                    </div>
                  )}
                </div>

                {isKidsMode && (
                  <div className="flex items-center space-x-1.5 bg-zinc-950/40 p-1.5 rounded-xl border border-zinc-900/60 font-mono text-[9px] select-none overflow-x-auto scrollbar-none">
                    <span className="text-zinc-500 font-bold ml-1 uppercase pr-1 select-none">AGE GROUP:</span>
                    {[
                      { id: "ALL", name: "🎈 SHOW ALL", desc: "Show everything" },
                      { id: "PRE", name: "🧸 TODDLERS (2-4)", desc: "Ages 2 to 4" },
                      { id: "MID", name: "🚀 JUNIORS (5-8)", desc: "Ages 5 to 8" },
                      { id: "ADV", name: "🧠 EXPLORERS (9+)", desc: "Ages 9 and up" }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          triggerClickSound();
                          setKidsAgeFilter(tab.id as any);
                        }}
                        className={`px-2.5 py-1 rounded-lg font-bold border transition-all cursor-pointer whitespace-nowrap ${
                          kidsAgeFilter === tab.id
                            ? "bg-purple-950/45 border-purple-500/50 text-purple-300"
                            : "bg-zinc-900/40 border-transparent text-zinc-500 hover:text-white"
                        }`}
                        title={tab.desc}
                      >
                        {tab.name}
                      </button>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {appsConfigList
                    .filter(app => {
                      const isInst = isKidsMode ? kidsInstalledApps.includes(app.id) : installedApps.includes(app.id);
                      if (!isInst) return false;
                      if (isKidsMode && kidsAgeFilter !== "ALL") {
                        return app.ageCategory === kidsAgeFilter;
                      }
                      return true;
                    })
                    .map((app) => (
                      <button
                        key={app.id}
                        onClick={() => {
                          playSfx(587.33, "sine", 0.02, 0.45);
                          setActiveApp(app.id);
                        }}
                        className="bg-[#0b0b0e] hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 p-3 rounded-2xl text-left transition-all duration-200 cursor-pointer flex flex-col justify-between h-[90px] relative group overflow-hidden"
                      >
                        {/* Interactive dynamic glow emissions */}
                        <div className="absolute -right-6 -bottom-6 w-14 h-14 rounded-full opacity-[0.03] group-hover:scale-150 transition-transform duration-300 pointer-events-none" style={{ backgroundColor: app.color }} />
                        
                        <div className="flex justify-between items-start">
                          <span className="p-1 px-1.5 rounded-lg border font-mono text-[6.5px] uppercase font-bold text-zinc-500 tracking-wider">
                            {app.category}
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: app.color }} />
                        </div>
                        
                        <div>
                          <h4 className="font-mono font-bold text-[11px] text-zinc-200 mt-1.5 group-hover:text-white transition-colors">
                            {app.name}
                          </h4>
                          <span className="text-[8px] text-zinc-500 block truncate">{app.description}</span>
                        </div>
                      </button>
                    ))}
                </div>

                {/* Empty state when filtering */}
                {appsConfigList.filter(app => {
                  const isInst = isKidsMode ? kidsInstalledApps.includes(app.id) : installedApps.includes(app.id);
                  if (!isInst) return false;
                  if (isKidsMode && kidsAgeFilter !== "ALL") {
                    return app.ageCategory === kidsAgeFilter;
                  }
                  return true;
                }).length === 0 && (
                  <div className="text-center py-12 bg-[#0b0b0e]/50 rounded-2xl border border-zinc-900/60 select-none">
                    <p className="text-[10px] font-mono text-zinc-550 uppercase font-bold">🎈 NO TOYS UNLOCKED IN THIS SLOT yet 🧸</p>
                    <p className="text-[9px] text-zinc-600 font-sans mt-1">Visit the Toy Market to acquire apps for this age range!</p>
                  </div>
                )}
              </div>
            ) : (
              // ---------------------------------------------------------
              // RENDER CORRESPONDING SIMULATED APPLICATIONS
              // ---------------------------------------------------------
              <div className="bg-[#0b0b0e]/95 border border-zinc-900 rounded-2xl p-4 min-h-[220px]">
                <div className="flex justify-between items-center border-b border-zinc-900 pb-2 mb-3">
                  <span className="font-mono text-[9.5px] font-bold text-zinc-400 capitalize flex items-center space-x-1.5">
                    <Laptop className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                    <span>{isKidsMode ? "🎮 ACTIVE TOY" : "APP_ACTIVE"} // {activeApp}</span>
                  </span>
                  <button
                    onClick={() => {
                      triggerClickSound();
                      setActiveApp(null);
                      setWikiAppArticle(null);
                      setSpotifyPlaying(false);
                      setIsPlayingDino(false);
                    }}
                    className="px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 rounded font-mono text-[8px] text-zinc-400 hover:text-white border border-zinc-850 cursor-pointer"
                  >
                    CLOSE APPLICATION
                  </button>
                </div>

                {/* APP: ENHANCED INTERACTIVE ASTRO DINO GAME */}
                {activeApp === "dino" && (
                  <div className="space-y-3 font-mono text-center max-w-md mx-auto">
                    <div className="flex justify-between items-center bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-900 text-[9.5px]">
                      <span className="text-zinc-500 uppercase font-bold text-[8.5px] flex items-center space-x-1">
                        <Gamepad2 className="w-3.5 h-3.5 text-[#10eb73]" />
                        <span>Astro Dino Run</span>
                      </span>
                      <div className="flex space-x-3 text-zinc-350">
                        <div>SCORE: <span className="text-yellow-400 font-bold">{dinoScore}</span></div>
                        <div>BEST: <span className="text-[#10eb73] font-bold">{dinoHighScore}</span></div>
                      </div>
                    </div>

                    <div 
                      onClick={handleDinoJump}
                      className="bg-zinc-950/90 h-[140px] border border-purple-900/30 rounded-2xl relative overflow-hidden select-none cursor-pointer flex flex-col justify-between p-3 active:border-purple-500/40 transition-colors"
                    >
                      <div className="absolute inset-x-0 top-3 flex justify-around opacity-25 text-[8px] pointer-events-none">
                        <span>⭐</span>
                        <span className="animate-pulse">✨</span>
                        <span>🛸</span>
                        <span>⭐</span>
                      </div>

                      {!isPlayingDino ? (
                        <div className="my-auto space-y-2">
                          <p className="text-purple-400 font-bold text-xs uppercase animate-bounce">🎈 Dino ready to explore! 🦖</p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerClickSound();
                              setDinoScore(0);
                              setIsDinoGameOver(false);
                              setObstacleX(300);
                              setIsPlayingDino(true);
                            }}
                            className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-1.5 rounded-xl border border-purple-400/30 text-[10px] cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all"
                          >
                            LAUNCH GAME
                          </button>
                        </div>
                      ) : isDinoGameOver ? (
                        <div className="my-auto space-y-2">
                          <p className="text-red-500 font-bold text-xs">🚀 OUCH! Asteroid Collision! ☄️</p>
                          <p className="text-zinc-500 text-[8.5px]">Final Score: <span className="text-yellow-400 font-bold">{dinoScore}</span></p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerClickSound();
                              setDinoScore(0);
                              setIsDinoGameOver(false);
                              setObstacleX(300);
                              setIsPlayingDino(true);
                            }}
                            className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-3 py-1 rounded-xl border border-zinc-800 text-[9px] cursor-pointer"
                          >
                            TRY AGAIN
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="text-[7.5px] text-zinc-550 select-none uppercase tracking-widest pt-1 pointer-events-none animate-pulse">
                            TAP FIELD OR SPACEBAR TO JUMP & DODGE ASTERIODS!
                          </div>

                          <div className="w-full h-16 relative border-b border-purple-550/20 mt-4">
                            <div 
                              className="absolute transition-all duration-75 text-2xl"
                              style={{ 
                                left: "20px", 
                                bottom: `${dinoY}px`,
                              }}
                            >
                              🦖
                            </div>

                            <div 
                              className="absolute text-xl"
                              style={{ 
                                left: `${obstacleX}px`, 
                                bottom: "0px",
                              }}
                            >
                              ☄️
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* APP: REUSABLE NEBULA PIXEL COLORING PAD */}
                {activeApp === "painting" && (
                  <div className="space-y-2.5 font-mono text-center max-w-md mx-auto animate-[fadeIn_0.3s_ease]">
                    <div className="flex justify-between items-center bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-900 text-[9.5px] select-none">
                      <span className="text-zinc-400 uppercase font-bold text-[8.5px] flex items-center space-x-1">
                        <Smile className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
                        <span>Nebula Paint Studio</span>
                      </span>
                      <span className="text-zinc-600 uppercase text-[7.5px]">High-Fidelity Audio Canvas</span>
                    </div>

                    <NebulaPaintBoard playSfx={playSfx} isKidsMode={isKidsMode} />
                  </div>
                )}

                {/* APP: WIKIPEDIA CORE READER */}
                {activeApp === "wikipedia" && (
                  <div className="space-y-3 animate-[fadeIn_0.2s_ease-out]">
                    <div className="flex items-center space-x-2 bg-zinc-950 border border-zinc-900 rounded-xl px-3 py-1.5">
                      <Search className="w-3.5 h-3.5 text-zinc-650" />
                      <input
                        type="text"
                        placeholder="Search system archives: quantum mechanics, black hole, artificial intelligence..."
                        value={wikiAppInput}
                        onChange={(e) => setWikiAppInput(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none font-mono text-[10px] text-zinc-200"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            triggerClickSound();
                            const queryTxt = wikiAppInput.trim().toLowerCase();
                            if (queryTxt.includes("quantum")) {
                              setWikiAppArticle({
                                      title: "Superposition Axiom",
                                      text: "The fundamental core of quantum processing units. By encoding coordinates in particles spinning simultaneously, vectors collapse relative to observing lenses. It maximizes computational pathways exponentially."
                              });
                            } else if (queryTxt.includes("black") || queryTxt.includes("gravity") || queryTxt.includes("singularity")) {
                              setWikiAppArticle({
                                      title: "Cosmological Singularities",
                                      text: "Extremely compact celestial densities pulling all light, mass, and relativistic coordinate frames into infinitely tight points. No information is believed to leak past the event horizon radius."
                              });
                            } else if (queryTxt.includes("artificial") || queryTxt.includes("intelligence") || queryTxt.includes("ai")) {
                              setWikiAppArticle({
                                      title: "Consciousness Simulations",
                                      text: "A series of high-frequency cognitive transceivers matching pattern weights to simulate organic synaptic behavior. We exist on the boundary of code and neural space."
                              });
                            } else {
                              setWikiAppArticle({
                                      title: `Register Result: ${wikiAppInput}`,
                                      text: "No exact record matching this coordinate found in our local quantum registers. Please query details on other space stations or planetary categories!"
                              });
                            }
                          }
                        }}
                      />
                    </div>
                    {wikiAppArticle && (
                      <div className="bg-black/40 border border-zinc-950 p-3 rounded-xl space-y-1.5 select-text">
                        <div className="font-mono text-zinc-100 font-bold uppercase text-[10.5px]">▲ {wikiAppArticle.title}</div>
                        <p className="text-[10px] font-sans text-zinc-400 leading-relaxed font-light">{wikiAppArticle.text}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* APP: AUDIO SYNTH GRID */}
                {activeApp === "synth" && (
                  <div className="space-y-3 max-w-sm mx-auto">
                    <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider select-none leading-none text-center">
                      {isKidsMode ? "🌈 COLORFUL PIANO KEYS 🎵" : "TRIP-FREQUENCY REAL OSCILLATOR KEYS"}
                    </p>
                    <div className="grid grid-cols-4 gap-2 text-center select-none pt-1">
                      {[
                        { freq: 261.63, note: "C4", color: "hover:border-red-500 hover:text-red-400" },
                        { freq: 293.66, note: "D4", color: "hover:border-orange-500 hover:text-orange-400" },
                        { freq: 329.63, note: "E4", color: "hover:border-yellow-500 hover:text-yellow-400" },
                        { freq: 349.23, note: "F4", color: "hover:border-green-500 hover:text-green-400" },
                        { freq: 392.00, note: "G4", color: "hover:border-teal-500 hover:text-teal-400" },
                        { freq: 440.00, note: "A4", color: "hover:border-blue-500 hover:text-blue-400" },
                        { freq: 493.88, note: "B4", color: "hover:border-indigo-500 hover:text-indigo-400" },
                        { freq: 523.25, note: "C5", color: "hover:border-purple-500 hover:text-purple-400" }
                      ].map((key) => (
                        <button
                          key={key.note}
                          onClick={() => triggerSynthKey(key.freq)}
                          className={`bg-zinc-950 border border-zinc-900 p-3 rounded-xl font-mono text-[10px] font-bold text-zinc-300 cursor-pointer active:scale-95 transition-all ${key.color}`}
                        >
                          <div>{key.note}</div>
                          <div className="text-[7.5px] text-zinc-650 mt-1 font-light">{Math.round(key.freq)}Hz</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* APP: WEATHER SATELLITE DIAGNOSTICS */}
                {activeApp === "weather" && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-zinc-950 p-2.5 rounded-xl border border-zinc-900">
                      <span className="font-mono text-[9.5px] text-zinc-300 font-bold">Orbital stations list:</span>
                      <div className="flex space-x-1 font-mono text-[8.5px]">
                        {["Titan Prime Alpha", "Europa Hub", "Mars Sector-B"].map(st => (
                          <button
                            key={st}
                            onClick={() => triggerWeatherRadarSweep(st)}
                            className={`px-2 py-0.5 rounded cursor-pointer ${
                              weatherRadarStation === st ? "bg-[#10eb73]/15 border border-[#10eb73]/40 text-[#10eb73]" : "bg-zinc-900 text-zinc-500 border border-zinc-850 hover:text-white"
                            }`}
                          >
                            {st.split(" ")[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Sonar sweep animation dashboard */}
                    <div className="bg-black/80 border border-zinc-950 p-3 rounded-xl flex flex-col justify-between h-[110px] relative overflow-hidden">
                      {weatherCoverageSweep ? (
                        <div className="text-center my-auto space-y-1.5 animate-pulse">
                          <CloudLightning className="w-5 h-5 mx-auto text-emerald-400 animate-bounce" />
                          <div className="font-mono text-[9px] text-emerald-400 capitalize tracking-widest font-bold">
                            RUNNING HIGH FREQ SWEEP RADAR RADIANTS...
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3 h-full items-center text-left">
                          <div className="font-mono text-[9px] text-zinc-400 space-y-1">
                            <div>STATION: <span className="text-emerald-400 font-bold uppercase">{weatherRadarStation}</span></div>
                            <div>SURFACE GRAV: <span className="text-zinc-200">{weatherTelemetry.gravity}</span></div>
                            <div>TEMPERATURE: <span className="text-zinc-200">{weatherTelemetry.temp}</span></div>
                          </div>
                          <div className="font-mono text-[9px] text-zinc-400 space-y-1 border-l border-zinc-900 pl-3">
                            <div>ATMOSP_CH4: <span className="text-zinc-200">{weatherTelemetry.methane}</span></div>
                            <div>STELLAR_WINDS: <span className="text-zinc-200">{weatherTelemetry.winds}</span></div>
                            <div className="text-[7.5px] text-emerald-500/80 font-bold flex items-center space-x-1 uppercase mt-1">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping mr-1" />
                              <span>✓ Sector clear</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Holographic sweeping line overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#10eb73]/5 to-transparent w-full h-full -translate-x-full animate-[shimmer_2s_infinite] pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* APP: SPOTIFY NEON MUSIC STREAMER */}
                {activeApp === "spotify" && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 bg-zinc-950 p-3 rounded-2xl border border-zinc-900">
                      <Disc className={`w-8 h-8 text-emerald-400 ${spotifyPlaying ? "animate-[spin_4s_linear_infinite]" : ""}`} />
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-[11px] font-bold text-zinc-200 truncate leading-none">
                          {spotifyTracks[spotifyTrackIndex].title}
                        </div>
                        <span className="text-[9px] text-zinc-500 block truncate mt-1">
                          {spotifyTracks[spotifyTrackIndex].artist}
                        </span>
                      </div>
                      <div className="font-mono text-[9.5px] text-zinc-500">
                        {spotifyTracks[spotifyTrackIndex].length}
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex justify-center items-center space-x-4">
                      <button
                        onClick={() => {
                          triggerClickSound();
                          setSpotifyTrackIndex(prev => (prev === 0 ? spotifyTracks.length - 1 : prev - 1));
                        }}
                        className="p-1 px-1.5 font-mono text-[9px] text-zinc-400 hover:text-white bg-zinc-900 rounded border border-zinc-800 cursor-pointer"
                      >
                        PREV
                      </button>
                      <button
                        onClick={() => {
                          playSfx(587.33, "sine", 0.02, 0.25);
                          setSpotifyPlaying(!spotifyPlaying);
                        }}
                        className="p-2 bg-emerald-500 text-black hover:bg-emerald-400 rounded-full font-bold cursor-pointer active:scale-95 transition-all text-xs"
                      >
                        {spotifyPlaying ? "PAUSE HARMONICS" : "PLAY HARMONICS"}
                      </button>
                      <button
                        onClick={() => {
                          triggerClickSound();
                          setSpotifyTrackIndex(prev => (prev === spotifyTracks.length - 1 ? 0 : prev + 1));
                        }}
                        className="p-1 px-1.5 font-mono text-[9px] text-zinc-400 hover:text-white bg-zinc-900 rounded border border-zinc-800 cursor-pointer"
                      >
                        NEXT
                      </button>
                    </div>

                    {spotifyPlaying && (
                      <div className="flex items-center justify-around h-6 p-1.5 bg-black rounded-lg border border-zinc-950 select-none">
                        {[1, 2, 3, 4, 5, 4, 3, 2, 1, 2, 3, 4, 3].map((val, i) => (
                          <span
                            key={i}
                            className="bg-emerald-500/80 w-0.5 rounded-full"
                            style={{
                              height: `${val * 3.5}px`,
                              animation: `pulse ${0.4 + i*0.05}s ease-in-out infinite alternate`
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* APP: YOUTUBE CASTER DETECTOR */}
                {activeApp === "youtube" && (
                  <div className="space-y-3 font-mono">
                    <p className="text-[9px] text-zinc-500 uppercase tracking-widest leading-none">
                      {isKidsMode ? "YouTube Kids Safe Streamer" : "YouTube Caster Linkage"}
                    </p>
                    <div className="bg-zinc-950 p-4 border border-zinc-900 space-y-3.5 rounded-xl">
                      <div className="flex items-center justify-between text-white font-medium">
                        <div className="flex items-center space-x-2">
                          <Play className="w-4 h-4 text-red-500 animate-pulse" />
                          <span className="font-serif italic text-sm text-zinc-200">
                            {isKidsMode ? "YouTube Kids Portal" : "YouTube Lookups Portal"}
                          </span>
                        </div>
                        <span className="text-[8.5px] text-zinc-500 font-bold uppercase">OUTBOUND PROJECTION</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder={isKidsMode ? "Search cartoons, cartoon songs, coding for kids..." : "Search music clips, ambient modular streams..."}
                          value={youtubeSearchInput}
                          onChange={(e) => setYoutubeSearchInput(e.target.value)}
                          className="flex-1 bg-black border border-zinc-900 rounded-lg px-2.5 py-1.5 font-sans text-xs text-zinc-200 placeholder-zinc-450 focus:outline-none"
                        />
                      </div>

                      <p className="text-zinc-500 text-[9px] font-sans leading-relaxed">
                        {isKidsMode 
                          ? "Opens kid-friendly videos and learning streams safely in a new tab." 
                          : "Caster will generate specialized external projection frequencies and securely open corresponding lookup parameters inside a fresh browser tab."}
                      </p>
                      
                      <button
                        onClick={() => {
                          const lookup = youtubeSearchInput.trim() || (isKidsMode ? "luna cartoon nursery rhymes spelling bees space facts" : "ambient space modular synthesizers lofi");
                          const finalLookup = isKidsMode ? (lookup + " kids") : lookup;
                          openExternalProjection(`https://www.youtube.com/results?search_query=${encodeURIComponent(finalLookup)}`);
                        }}
                        className="flex items-center justify-center space-x-2 w-full py-2 px-3 bg-red-950/20 text-red-400 hover:bg-red-950/30 border border-red-900/45 transition-colors rounded-xl font-mono text-[9px] font-bold tracking-wider cursor-pointer"
                      >
                        <span>{isKidsMode ? "LAUNCH KIDS CARTOONS" : "LAUNCH YouTube FEEDS"}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* APP: DISNEY+ THEATER PORTAL */}
                {activeApp === "disney" && (
                  <div className="space-y-3 font-mono">
                    <p className="text-[9px] text-zinc-500 uppercase tracking-widest leading-none">
                      {isKidsMode ? "Disney+ Family Theater" : "Disney+ Cinema Portal Port"}
                    </p>
                    <div className="bg-zinc-950 p-4 border border-zinc-900 space-y-3.5 rounded-xl">
                      <div className="flex items-center space-x-2 text-white font-medium">
                        <Tv className="w-4 h-4 text-blue-400 animate-pulse" />
                        <span className="font-serif italic text-sm text-zinc-100">
                          {isKidsMode ? "Disney+ Kids Cinematic Hub" : "Disney+ Theater projection"}
                        </span>
                      </div>
                      <p className="text-zinc-500 text-[9px] font-sans leading-relaxed">
                        {isKidsMode 
                          ? "Enter the magical, cute universe of Disney family movies, fairy tales, and animations."
                          : "Launches standard outbound Disney+ cinematic channel stream ports to enjoy full resolution cinematic theatre on active screens."}
                      </p>
                      <button
                        onClick={() => openExternalProjection(isKidsMode ? "https://www.disneyplus.com/brand/disney" : "https://www.disneyplus.com")}
                        className="flex items-center justify-center space-x-2 w-full py-2 px-3 bg-blue-950/20 text-blue-400 hover:bg-blue-950/30 border border-blue-900/40 transition-colors rounded-xl font-mono text-[9px] font-bold tracking-wider cursor-pointer"
                      >
                        <span>{isKidsMode ? "ENTER CARTOON MOVIE HUB" : "ENTER STANDARD ENTERTAINMENT ROUTE"}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* OTHER CINEMATIC APPS SIMULATION */}
                {(activeApp === "netflix" || activeApp === "prime") && (
                  <div className="space-y-3 font-mono">
                    <p className="text-[9px] text-zinc-500 uppercase tracking-wider select-none leading-none">
                      Cinematic Media Portal System
                    </p>
                    <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900 space-y-3 text-center">
                      <Tv2 className="w-6 h-6 mx-auto text-cyan-400 animate-pulse" />
                      <div className="font-mono text-[10.51px] text-zinc-300 font-bold uppercase">{activeApp === "netflix" ? "Netflix Quantum Core" : "Amazon Prime Video Core"}</div>
                      <p className="text-zinc-500 font-sans text-[9px] leading-relaxed font-light">
                        Ready to establish standard external channel projections to cast cosmic cinema directly onto your viewport stage.
                      </p>
                      <button
                        onClick={() => openExternalProjection(activeApp === "netflix" ? "https://www.netflix.com" : "https://www.primevideo.com")}
                        className="flex items-center justify-center space-x-2 mx-auto py-1.5 px-4 bg-zinc-900 hover:bg-zinc-805 text-zinc-250 border border-zinc-850 transition-colors rounded-xl font-mono text-[9px] font-bold cursor-pointer"
                      >
                        <span>BOOT VIDEO PROJECTION</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        )}

        {/* ==========================================
            MARKET WORKSPACE
           ========================================== */}
        {type === "MARKET" && (
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-1">
              <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-bold leading-none">
                {isKidsMode ? "🌈 TEACHER LUNA'S TOY MARKET 🎯" : "QUANTUM NEXUS OVERLAYS OUTPOST MARKET"}
              </p>
              <span className="font-mono text-[8px] bg-purple-950/30 border border-purple-900/50 text-purple-400 px-2 py-0.5 rounded uppercase font-bold">
                {isKidsMode ? "🧸 TOYS READY" : "DIAGNOSTICS: SECURE"}
              </span>
            </div>

            {isKidsMode && (
              <div className="flex items-center space-x-1.5 bg-zinc-950/40 p-1.5 rounded-xl border border-zinc-900/60 font-mono text-[9px] select-none overflow-x-auto scrollbar-none">
                <span className="text-zinc-500 font-bold ml-1 uppercase pr-1 select-none">AGE GROUP:</span>
                {[
                  { id: "ALL", name: "🎈 SHOW ALL", desc: "Show everything" },
                  { id: "PRE", name: "🧸 TODDLERS (2-4)", desc: "Ages 2 to 4" },
                  { id: "MID", name: "🚀 JUNIORS (5-8)", desc: "Ages 5 to 8" },
                  { id: "ADV", name: "🧠 EXPLORERS (9+)", desc: "Ages 9 and up" }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      triggerClickSound();
                      setKidsAgeFilter(tab.id as any);
                    }}
                    className={`px-2.5 py-1 rounded-lg font-bold border transition-all cursor-pointer whitespace-nowrap ${
                      kidsAgeFilter === tab.id
                        ? "bg-purple-950/45 border-purple-500/50 text-purple-300"
                        : "bg-zinc-900/40 border-transparent text-zinc-500 hover:text-white"
                    }`}
                    title={tab.desc}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>
            )}

            {/* List of elements in market */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
              {appsConfigList
                .filter((app) => {
                  if (isKidsMode && kidsAgeFilter !== "ALL") {
                    return app.ageCategory === kidsAgeFilter;
                  }
                  return true;
                })
                .map((app) => {
                  const isInstalled = isKidsMode ? kidsInstalledApps.includes(app.id) : installedApps.includes(app.id);
                  const isDownloading = isDownloadingAppId === app.id;

                  return (
                    <div
                      key={app.id}
                      className="bg-[#0b0b0e] border border-zinc-900 hover:border-zinc-800 p-3 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-3 transition-colors text-left"
                    >
                      <div className="flex items-start space-x-2.5 truncate">
                        <div className="p-1 px-1.5 rounded-lg border font-mono text-[6.5px] uppercase font-bold text-zinc-500 tracking-wider h-fit select-none mt-0.5" style={{ borderColor: app.color + "44", color: app.color }}>
                          {isKidsMode ? app.ageCategory : app.size}
                        </div>
                        <div className="min-w-0">
                          <div className="font-mono font-bold text-[10.5px] text-zinc-200 flex items-center space-x-1.5">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: app.color }} />
                            <span>{app.name}</span>
                          </div>
                          <p className="text-[8.5px] text-zinc-550 truncate font-sans leading-relaxed mt-0.5">{app.description}</p>
                        </div>
                      </div>

                      <div className="min-w-[110px] text-right font-mono text-[9px]">
                        {isInstalled ? (
                          <div className="text-emerald-500/90 font-bold flex items-center justify-end space-x-1.5 select-none uppercase">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                            <span>{isKidsMode ? "UNLOCKED 🎈" : "INSTALLED"}</span>
                          </div>
                        ) : isDownloading ? (
                          <div className="space-y-1 text-right">
                            <div className="text-purple-400 animate-pulse font-bold uppercase text-[7.5px] tracking-wide">
                              {downloadStepText} [{downloadPercentage}%]
                            </div>
                            <div className="w-full bg-zinc-950 h-1 sm:w-24 rounded overflow-hidden ml-auto border border-zinc-900">
                              <div className="bg-purple-500 h-full transition-all duration-150" style={{ width: `${downloadPercentage}%` }} />
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAcquireApp(app.id)}
                            disabled={isDownloadingAppId !== null}
                            className="px-3 py-1.5 bg-[#121217] hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-800 rounded-xl font-bold cursor-pointer transition-all flex items-center justify-center space-x-1.5 tracking-wider uppercase pr-4 w-full sm:w-auto disabled:opacity-30 text-[8.5px]"
                          >
                            <Download className="w-3 h-3 text-purple-400" />
                            <span>{isKidsMode ? "UNLOCK TOY" : "ACQUIRE"}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ==========================================
            SETTINGS WORKSPACE
           ========================================== */}
        {type === "SETTINGS" && (
          <div className="space-y-4">
            <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-bold leading-none">
              DIAGNOSTICS & HARDWARE EMULATOR SETTINGS
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Controls: Volume and Velocity */}
              <div className="space-y-3.5 bg-zinc-950/50 border border-zinc-900 p-3.5 rounded-2xl">
                <div className="space-y-1">
                  <div className="flex justify-between items-center font-mono text-[9.5px]">
                    <span className="text-zinc-400 font-bold uppercase flex items-center space-x-1.5 select-none">
                      <Volume2 className="w-3.5 h-3.5 text-zinc-500" />
                      <span>MASTER_OS_VOLUME</span>
                    </span>
                    <span className="text-amber-500 font-bold">{masterVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={masterVolume}
                    onChange={(e) => handleVolumeSlideChange(parseInt(e.target.value))}
                    className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none"
                  />
                  <p className="text-[7.5px] font-sans text-zinc-550 select-none leading-relaxed">
                    Scales real Web Audio sound envelope gains emitted during spatial projection spawns.
                  </p>
                </div>

                <div className="space-y-1 border-t border-zinc-900/50 pt-3.5">
                  <div className="flex justify-between items-center font-mono text-[9.5px]">
                    <span className="text-zinc-400 font-bold uppercase flex items-center space-x-1.5 select-none">
                      <Sliders className="w-3.5 h-3.5 text-zinc-500" />
                      <span>HOLOGRAM_SPEED_RATIO</span>
                    </span>
                    <span className="text-emerald-400 font-bold">{hologramSpeed.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="2.0"
                    step="0.1"
                    value={hologramSpeed}
                    onChange={(e) => handleSpeedSlideChange(parseFloat(e.target.value))}
                    className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
                  />
                  <p className="text-[7.5px] font-sans text-zinc-550 select-none leading-relaxed">
                    Accelerates standard micro-kinetic vector fields velocities of core mind sparks in real-time.
                  </p>
                </div>

                {/* Vocal synthesis calibration pitch & rate */}
                <div className="space-y-2 border-t border-zinc-900/50 pt-3.5">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center font-mono text-[9px]">
                      <span className="text-zinc-400 font-bold uppercase">VERBAL_DELIVERY_SPEED</span>
                      <span className="text-amber-500 font-bold">{speakRateVal.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="1.6"
                      step="0.02"
                      value={speakRateVal}
                      onChange={(e) => handleRateSlideChange(parseFloat(e.target.value))}
                      className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 pt-1.5">
                    <div className="flex justify-between items-center font-mono text-[9px]">
                      <span className="text-zinc-400 font-bold uppercase">VOCAL_FREQUENCY_PITCH</span>
                      <span className="text-emerald-400 font-bold">{speakPitch.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.6"
                      max="1.4"
                      step="0.02"
                      value={speakPitch}
                      onChange={(e) => handlePitchSlideChange(parseFloat(e.target.value))}
                      className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Right Controls: Theme color design presets & Speech Synthesis Voices */}
              <div className="space-y-3.5 bg-[#0b0b0d] border border-zinc-900 p-3.5 rounded-2xl select-none">
                <div>
                  <span className="font-mono text-[9px] text-zinc-400 font-bold block mb-2 uppercase select-none leading-none">CORE COLOR SCHEME Presets:</span>
                  <div className="grid grid-cols-2 gap-2 text-center text-[9px] font-mono">
                    {[
                      { name: "AMBER", label: "Amber Spark", colorBg: "bg-amber-500/20 text-amber-400 border-amber-900/40" },
                      { name: "EMERALD", label: "Emerald Space", colorBg: "bg-emerald-905/15 text-emerald-400 border-emerald-900/40" },
                      { name: "CYBERPUNK", label: "Cyberpunk Glow", colorBg: "bg-pink-950/20 text-pink-400 border-pink-900/40" },
                      { name: "SLATE", label: "Slate Silver", colorBg: "bg-slate-800/20 text-slate-400 border-slate-700/40" }
                    ].map(theme => (
                      <button
                        key={theme.name}
                        onClick={() => handleThemePresetsChange(theme.name)}
                        className={`p-1.5 px-2 rounded-xl border cursor-pointer font-bold capitalize transition-all ${
                          activeTheme === theme.name 
                            ? theme.colorBg + " scale-105 shadow-md border-zinc-650"
                            : "bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-90 w-full hover:bg-zinc-900/40"
                        }`}
                      >
                        {theme.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Synthesis Voice Core picker */}
                <div className="space-y-1.5 border-t border-zinc-900/50 pt-3">
                  <label className="block text-[8.5px] font-mono text-zinc-400 uppercase tracking-wider font-bold leading-none">SYNAPTIC_VERBAL_VOICE</label>
                  <select
                    disabled={piperEnabled}
                    value={selectedVoiceName}
                    onChange={(e) => handleVoiceSelectChange(e.target.value)}
                    className={`w-full text-[10px] font-mono bg-zinc-950 border border-zinc-900 rounded-lg px-2 py-1.5 outline-none focus:border-zinc-800 transition-colors cursor-pointer ${piperEnabled ? "opacity-35 cursor-not-allowed text-zinc-650" : "text-zinc-300"}`}
                  >
                    {voicesList.length === 0 ? (
                      <option value="">[ Retransmitting Voice Cores... ]</option>
                    ) : (
                      voicesList.map((v, i) => (
                        <option key={`${v.name}-${v.lang}-${i}`} value={v.name}>
                          {v.name.replace("Microsoft", "MS").replace("Google", "G").substring(0, 32)} ({v.lang})
                        </option>
                      ))
                    )}
                  </select>
                  <p className="text-[7.5px] font-sans text-zinc-550 leading-relaxed select-none">
                    Select a high-fidelity natural voice module available on your direct spatial platform.
                  </p>
                </div>

                {/* Piper Neural TTS Toggle & Settings */}
                <div className="space-y-2 border-t border-zinc-900/50 pt-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-[8.5px] font-mono text-zinc-400 uppercase tracking-wider font-bold leading-none">HIGH-FIDELITY PIPER VOICE (WASM)</label>
                    <button
                      type="button"
                      onClick={togglePiperEnabled}
                      className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase transition-colors border cursor-pointer ${
                        piperEnabled 
                          ? "bg-cyan-950/20 border-cyan-800/40 text-cyan-400" 
                          : "bg-zinc-950 border-zinc-900 text-zinc-600 hover:text-zinc-400"
                      }`}
                    >
                      {piperEnabled ? "ENABLED" : "DISABLED"}
                    </button>
                  </div>

                  {piperEnabled && (
                    <div className="space-y-2 pt-1">
                      <select
                        value={piperVoiceId}
                        onChange={(e) => handlePiperVoiceChange(e.target.value)}
                        className="w-full text-[10px] font-mono bg-zinc-950 border border-zinc-900 rounded-lg px-2 py-1.5 text-zinc-300 outline-none focus:border-zinc-800 transition-colors cursor-pointer"
                      >
                        {PIPER_PRESETS.map(preset => (
                          <option key={preset.id} value={preset.id}>
                            {preset.name}
                          </option>
                        ))}
                        <option value="custom">Custom WASM/ONNX Model Files...</option>
                      </select>

                      {piperVoiceId === "custom" && (
                        <div className="space-y-1.5 bg-[#08080a] border border-zinc-950 p-2 rounded-lg">
                          <div>
                            <span className="text-[7.5px] font-mono text-zinc-55 block uppercase">Custom ONNX URL</span>
                            <input
                              type="text"
                              value={customOnnxUrl}
                              onChange={(e) => handleCustomOnnxUrlChange(e.target.value)}
                              placeholder="https://.../*.onnx"
                              className="w-full text-[9px] font-mono bg-zinc-950 border border-zinc-900 rounded px-1.5 py-1 text-zinc-300 outline-none focus:border-zinc-800"
                            />
                          </div>
                          <div>
                            <span className="text-[7.5px] font-mono text-zinc-55 block uppercase">Custom JSON Config URL</span>
                            <input
                              type="text"
                              value={customJsonUrl}
                              onChange={(e) => handleCustomJsonUrlChange(e.target.value)}
                              placeholder="https://.../*.json"
                              className="w-full text-[9px] font-mono bg-zinc-950 border border-zinc-900 rounded px-1.5 py-1 text-zinc-300 outline-none focus:border-zinc-800"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={loadCustomPiperFiles}
                            className="w-full py-1 rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white font-mono text-[8px] font-bold uppercase transition-colors"
                          >
                            Load Custom Model Files
                          </button>
                        </div>
                      )}

                      {/* Loading / Status Indication */}
                      {piperLoadingStatus && (
                        <div className="bg-[#08080a] border border-zinc-900 p-2 rounded-lg space-y-1.5">
                          <div className="flex justify-between font-mono text-[7.5px] text-zinc-550">
                            <span className="animate-pulse">{piperLoadingStatus}</span>
                            <span>{piperLoadingPercent}%</span>
                          </div>
                          <div className="w-full h-1 bg-zinc-950 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-cyan-500 transition-all duration-150" 
                              style={{ width: `${piperLoadingPercent}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <p className="text-[7.5px] font-sans text-zinc-550 leading-relaxed select-none">
                    {piperEnabled 
                      ? "Neural Piper Voice uses client-side WASM inference. High-fidelity neural voice files are cached locally for near-instant responses."
                      : "Using native browser synthesis. Enable Piper above to fetch natural neural networks."}
                  </p>
                </div>

                <div className="space-y-1 border-t border-zinc-900/50 pt-3 flex justify-between items-center font-mono text-[9px]">
                  <span className="text-zinc-400 font-bold uppercase select-none leading-none">QUICK SPEED Presets</span>
                  <div className="flex space-x-1 text-[8.5px]">
                    {["SLOW", "NORMAL", "FAST"].map(rate => (
                      <button
                        key={rate}
                        onClick={() => handleSpeakRatePresetsChange(rate)}
                        className={`px-1.5 py-0.5 rounded border cursor-pointer font-bold ${
                          speakRate === rate ? "border-amber-500/40 bg-amber-950/10 text-amber-500" : "bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-white"
                        }`}
                      >
                        {rate}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* 3. DIAGNOSTIC FOOTER INDICATOR */}
      <div className="flex justify-between text-[7px] font-mono text-zinc-450 select-none tracking-widest pt-1 border-t border-zinc-950 pt-2 shrink-0">
        <span>GRIDMAP_PROJ: SECURE</span>
        <span>SYNAPTIC_RENDERER_STATUS: ONLINE_0xFC</span>
      </div>
    </motion.div>
  );

  function openExternalProjection(url: string) {
    playSfx(659.25, "sine", 0.03, 0.4); 
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
