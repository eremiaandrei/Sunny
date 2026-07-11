import * as ort from "onnxruntime-web";

export interface PiperVoicePreset {
  id: string;
  name: string;
  onnxUrl: string;
  jsonUrl: string;
  quality: "low" | "medium" | "high";
  gender: "female" | "male";
}

export const PIPER_PRESETS: PiperVoicePreset[] = [
  {
    id: "en_US-amy-medium",
    name: "Amy (Expressive Female, Medium)",
    onnxUrl: "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/amy/medium/en_US-amy-medium.onnx",
    jsonUrl: "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/amy/medium/en_US-amy-medium.onnx.json",
    quality: "medium",
    gender: "female"
  },
  {
    id: "en_US-joe-medium",
    name: "Joe (Calm Male, Medium)",
    onnxUrl: "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/joe/medium/en_US-joe-medium.onnx",
    jsonUrl: "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/joe/medium/en_US-joe-medium.onnx.json",
    quality: "medium",
    gender: "male"
  },
  {
    id: "en_US-kristin-medium",
    name: "Kristin (Warm Female, Medium)",
    onnxUrl: "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/kristin/medium/en_US-kristin-medium.onnx",
    jsonUrl: "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/kristin/medium/en_US-kristin-medium.onnx.json",
    quality: "medium",
    gender: "female"
  },
  {
    id: "en_US-kathleen-low",
    name: "Kathleen (Soft Female, Low-Resource)",
    onnxUrl: "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/kathleen/low/en_US-kathleen-low.onnx",
    jsonUrl: "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/kathleen/low/en_US-kathleen-low.onnx.json",
    quality: "low",
    gender: "female"
  }
];

class PiperEngine {
  private session: ort.InferenceSession | null = null;
  private config: any = null;
  private currentOnnxUrl: string = "";
  private currentJsonUrl: string = "";
  private isLoading: boolean = false;
  private audioCtx: AudioContext | null = null;
  private activeSourceNode: AudioBufferSourceNode | null = null;

  constructor() {
    // Configure ONNX Runtime Web options
    try {
      ort.env.wasm.numThreads = 1;
      // Configure CDN path to match current installed onnxruntime-web version
      ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/";
    } catch (e) {
      console.warn("Could not set ONNX WASM paths:", e);
    }
  }

  /**
   * Safe fetch with caching to avoid downloading massive models repeatedly.
   */
  private async fetchWithCache(url: string, onProgress?: (percent: number) => void): Promise<ArrayBuffer> {
    try {
      const cache = await caches.open("piper-voice-models");
      const cachedResponse = await cache.match(url);
      
      if (cachedResponse) {
        console.log(`[PiperEngine] Loading cached file: ${url}`);
        if (onProgress) onProgress(100);
        return await cachedResponse.arrayBuffer();
      }

      console.log(`[PiperEngine] Fetching from network: ${url}`);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
      }

      // Clone response to put in cache
      const responseToCache = response.clone();
      const reader = response.body?.getReader();
      const contentLength = +(response.headers.get("Content-Length") ?? "0");
      
      if (!reader || contentLength === 0) {
        const buffer = await response.arrayBuffer();
        await cache.put(url, new Response(buffer));
        if (onProgress) onProgress(100);
        return buffer;
      }

      let receivedLength = 0;
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        receivedLength += value.length;
        if (onProgress && contentLength > 0) {
          onProgress(Math.round((receivedLength / contentLength) * 100));
        }
      }

      const allChunks = new Uint8Array(receivedLength);
      let position = 0;
      for (const chunk of chunks) {
        allChunks.set(chunk, position);
        position += chunk.length;
      }

      // Put in Cache Storage
      await cache.put(url, new Response(allChunks.buffer.slice(0), {
        headers: {
          "Content-Type": url.endsWith(".json") ? "application/json" : "application/octet-stream",
          "Content-Length": receivedLength.toString()
        }
      }));

      return allChunks.buffer;
    } catch (e) {
      console.warn("[PiperEngine] Caching failed, falling back to standard fetch:", e);
      const res = await fetch(url);
      return await res.arrayBuffer();
    }
  }

  /**
   * Load Piper Model from URLs.
   */
  public async loadModel(
    onnxUrl: string,
    jsonUrl: string,
    onProgress?: (stage: string, percent: number) => void
  ): Promise<void> {
    if (this.currentOnnxUrl === onnxUrl && this.currentJsonUrl === jsonUrl && this.session && this.config) {
      console.log("[PiperEngine] Model already loaded.");
      if (onProgress) onProgress("Ready", 100);
      return;
    }

    if (this.isLoading) {
      throw new Error("Another model is currently loading.");
    }

    this.isLoading = true;
    this.session = null;
    this.config = null;

    try {
      // 1. Load config JSON
      if (onProgress) onProgress("Downloading JSON config...", 10);
      const jsonBuffer = await this.fetchWithCache(jsonUrl, (pct) => {
        if (onProgress) onProgress("Downloading JSON config...", pct);
      });
      const jsonText = new TextDecoder().decode(jsonBuffer);
      this.config = JSON.parse(jsonText);

      // 2. Load ONNX Model bytes
      if (onProgress) onProgress("Downloading neural model file...", 0);
      const onnxBuffer = await this.fetchWithCache(onnxUrl, (pct) => {
        if (onProgress) onProgress("Downloading neural model (20-30MB)...", pct);
      });

      // 3. Compile ONNX Session with WASM
      if (onProgress) onProgress("Initializing WebAssembly speech engine...", 90);
      this.session = await ort.InferenceSession.create(onnxBuffer, {
        executionProviders: ["wasm"],
        graphOptimizationLevel: "all"
      });

      this.currentOnnxUrl = onnxUrl;
      this.currentJsonUrl = jsonUrl;
      this.isLoading = false;

      if (onProgress) onProgress("Engine successfully initialized!", 100);
      console.log("[PiperEngine] Model loaded successfully.");
    } catch (e: any) {
      this.isLoading = false;
      this.session = null;
      this.config = null;
      console.error("[PiperEngine] Loading model failed:", e);
      throw e;
    }
  }

  /**
   * Stop active speech.
   */
  public stop(): void {
    if (this.activeSourceNode) {
      try {
        this.activeSourceNode.stop();
      } catch (e) {}
      this.activeSourceNode = null;
    }
  }

  /**
   * Run phonemizer and output phoneme IDs.
   */
  public getPhonemeIds(text: string): number[] {
    if (!this.config || !this.config.phoneme_to_id) {
      return [];
    }
    return textToPhonemeIds(text, this.config.phoneme_to_id);
  }

  /**
   * Synthesize text into raw PCM Audio.
   */
  public async synthesize(text: string, options?: { rate?: number }): Promise<Float32Array> {
    if (!this.session || !this.config) {
      throw new Error("No model loaded. Call loadModel() first.");
    }

    const phonemeIds = this.getPhonemeIds(text);
    if (phonemeIds.length === 0) {
      return new Float32Array(0);
    }

    // Prepare inputs
    const sequenceLength = phonemeIds.length;
    const inputTensor = new ort.Tensor("int64", BigInt64Array.from(phonemeIds.map(BigInt)), [1, sequenceLength]);
    const inputLengthsTensor = new ort.Tensor("int64", BigInt64Array.from([BigInt(sequenceLength)]), [1]);
    
    // Config scales
    const lengthScale = 1.0 / (options?.rate ?? 0.95); // Adjust duration based on rate
    const noiseScale = parseFloat(this.config.audio?.noise_scale ?? "0.667");
    const noiseW = parseFloat(this.config.audio?.length_scale ?? "0.8");
    const scalesTensor = new ort.Tensor("float32", Float32Array.from([noiseScale, lengthScale, noiseW]), [3]);
    
    // Speaker ID
    const sidTensor = new ort.Tensor("int64", BigInt64Array.from([0n]), [1]);

    const inputs: Record<string, ort.Tensor> = {
      input: inputTensor,
      input_lengths: inputLengthsTensor,
      scales: scalesTensor
    };

    if (this.session.inputNames.includes("sid")) {
      inputs.sid = sidTensor;
    }

    // Run inference
    const outputs = await this.session.run(inputs);
    
    // Read PCM float data from the first output
    const outputName = this.session.outputNames[0];
    const outputTensor = outputs[outputName];
    return outputTensor.data as Float32Array;
  }

  /**
   * Speaks the text.
   */
  public async speak(
    text: string,
    options?: {
      rate?: number;
      pitch?: number;
      onStart?: () => void;
      onEnd?: () => void;
    }
  ): Promise<void> {
    this.stop();

    if (!this.session || !this.config) {
      throw new Error("Speech engine model is not loaded.");
    }

    if (options?.onStart) options.onStart();

    try {
      const pcmData = await this.synthesize(text, { rate: options?.rate });
      if (pcmData.length === 0) {
        if (options?.onEnd) options.onEnd();
        return;
      }

      // Initialize AudioContext
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      if (this.audioCtx.state === "suspended") {
        await this.audioCtx.resume();
      }

      const sampleRate = parseInt(this.config.audio?.sample_rate ?? "22050");
      
      // Pitch adjustment by slightly altering output sample rate during buffer loading
      const pitchFactor = options?.pitch ?? 1.0;
      const playbackSampleRate = sampleRate * pitchFactor;

      const audioBuffer = this.audioCtx.createBuffer(1, pcmData.length, playbackSampleRate);
      audioBuffer.getChannelData(0).set(pcmData);

      const source = this.audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioCtx.destination);
      
      this.activeSourceNode = source;

      source.onended = () => {
        if (this.activeSourceNode === source) {
          this.activeSourceNode = null;
        }
        if (options?.onEnd) options.onEnd();
      };

      source.start(0);
    } catch (e) {
      console.error("[PiperEngine] Speech failed:", e);
      if (options?.onEnd) options.onEnd();
    }
  }

  public isLoaded(): boolean {
    return this.session !== null;
  }

  public isCurrentlyLoading(): boolean {
    return this.isLoading;
  }
}

function textToPhonemeIds(text: string, phonemeToId: Record<string, number>): number[] {
  // 1. Convert text to a sequence of phonemes
  let processed = text.toLowerCase().trim();
  
  // Custom lookup map for common conversational words
  const wordPhonemeMap: Record<string, string> = {
    "hello": "h ɛ l oʊ",
    "world": "w ɜ ɹ l d",
    "sunny": "s ʌ n i",
    "luna": "l u n ə",
    "luna's": "l u n ə z",
    "how": "h aʊ",
    "are": "ɑ ɹ",
    "you": "j u",
    "math": "m æ θ",
    "the": "ð ə",
    "this": "ð ɪ s",
    "that": "ð æ t",
    "they": "ð eɪ",
    "there": "ð ɛ ɹ",
    "their": "ð ɛ ɹ",
    "with": "w ɪ θ",
    "game": "ɡ eɪ m",
    "space": "s p eɪ s",
    "science": "s aɪ ə n s",
    "play": "p l eɪ",
    "kid": "k ɪ d",
    "kids": "k ɪ d z",
    "mode": "m oʊ d",
    "yes": "j ɛ s",
    "no": "n oʊ",
    "please": "p l i z",
    "thank": "θ æ ŋ k",
    "thanks": "θ æ ŋ k s",
    "system": "s ɪ s t ə m",
    "active": "æ k t ɪ v",
    "widget": "w ɪ dʒ ɪ t",
    "widgets": "w ɪ dʒ ɪ t s",
    "weather": "w ɛ ð ɚ"
  };

  const words = processed.split(/\s+/);
  const phonemes: string[] = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i].replace(/[^a-z']/g, "");
    if (wordPhonemeMap[word]) {
      phonemes.push(...wordPhonemeMap[word].split(" "));
    } else {
      // Rule-based grapheme replacement
      let remaining = word;
      const phonemeList: string[] = [];
      while (remaining.length > 0) {
        if (remaining.startsWith("sh")) { phonemeList.push("ʃ"); remaining = remaining.slice(2); }
        else if (remaining.startsWith("th")) { phonemeList.push("θ"); remaining = remaining.slice(2); }
        else if (remaining.startsWith("ch")) { phonemeList.push("tʃ"); remaining = remaining.slice(2); }
        else if (remaining.startsWith("ng")) { phonemeList.push("ŋ"); remaining = remaining.slice(2); }
        else if (remaining.startsWith("ph")) { phonemeList.push("f"); remaining = remaining.slice(2); }
        else if (remaining.startsWith("ee")) { phonemeList.push("i"); remaining = remaining.slice(2); }
        else if (remaining.startsWith("oo")) { phonemeList.push("u"); remaining = remaining.slice(2); }
        else if (remaining.startsWith("ea")) { phonemeList.push("i"); remaining = remaining.slice(2); }
        else if (remaining.startsWith("oa")) { phonemeList.push("oʊ"); remaining = remaining.slice(2); }
        else if (remaining.startsWith("ai")) { phonemeList.push("eɪ"); remaining = remaining.slice(2); }
        else if (remaining.startsWith("ay")) { phonemeList.push("eɪ"); remaining = remaining.slice(2); }
        else if (remaining.startsWith("ou")) { phonemeList.push("aʊ"); remaining = remaining.slice(2); }
        else if (remaining.startsWith("ow")) { phonemeList.push("aʊ"); remaining = remaining.slice(2); }
        else if (remaining.startsWith("ar")) { phonemeList.push("ɑ"); phonemeList.push("ɹ"); remaining = remaining.slice(2); }
        else if (remaining.startsWith("or")) { phonemeList.push("ɔ"); phonemeList.push("ɹ"); remaining = remaining.slice(2); }
        else if (remaining.startsWith("er")) { phonemeList.push("ɚ"); remaining = remaining.slice(2); }
        else if (remaining.startsWith("ir")) { phonemeList.push("ɚ"); remaining = remaining.slice(2); }
        else if (remaining.startsWith("ur")) { phonemeList.push("ɚ"); remaining = remaining.slice(2); }
        else {
          const char = remaining[0];
          if (char === "a") phonemeList.push("æ");
          else if (char === "e") phonemeList.push("ɛ");
          else if (char === "i") phonemeList.push("ɪ");
          else if (char === "o") phonemeList.push("ɑ");
          else if (char === "u") phonemeList.push("ʌ");
          else if (char === "y") phonemeList.push("i");
          else if (char === "c") phonemeList.push("k");
          else if (char === "g") phonemeList.push("ɡ");
          else if (char === "j") phonemeList.push("dʒ");
          else if (char === "r") phonemeList.push("ɹ");
          else if (char === "x") { phonemeList.push("k"); phonemeList.push("s"); }
          else if (char === "q") { phonemeList.push("k"); phonemeList.push("w"); }
          else if (/[a-z]/.test(char)) phonemeList.push(char);
          remaining = remaining.slice(1);
        }
      }
      phonemes.push(...phonemeList);
    }
    
    // Pause between words
    if (i < words.length - 1) {
      phonemes.push(" ");
    }
  }

  // Padding & Sentinel Wrapping
  const ids: number[] = [];
  
  // Start Sentinel
  const startSentinel = "^";
  if (phonemeToId[startSentinel] !== undefined) {
    ids.push(phonemeToId[startSentinel]);
  } else if (phonemeToId["{"] !== undefined) {
    ids.push(phonemeToId["{"]);
  }

  const padChar = "_";
  const hasPad = phonemeToId[padChar] !== undefined;

  for (const ph of phonemes) {
    if (hasPad) ids.push(phonemeToId[padChar]);
    
    if (phonemeToId[ph] !== undefined) {
      ids.push(phonemeToId[ph]);
    } else {
      const cleanPh = ph.trim();
      if (cleanPh && phonemeToId[cleanPh] !== undefined) {
        ids.push(phonemeToId[cleanPh]);
      } else if (cleanPh && phonemeToId[cleanPh[0]] !== undefined) {
        ids.push(phonemeToId[cleanPh[0]]);
      }
    }
  }

  if (hasPad) ids.push(phonemeToId[padChar]);

  // End Sentinel
  const endSentinel = "$";
  if (phonemeToId[endSentinel] !== undefined) {
    ids.push(phonemeToId[endSentinel]);
  } else if (phonemeToId["}"] !== undefined) {
    ids.push(phonemeToId["}"]);
  }

  return ids;
}

export const piperEngine = new PiperEngine();
