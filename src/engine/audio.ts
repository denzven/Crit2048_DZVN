/**
 * Advanced Audio Engine: Procedural synthesis and BGM for Crit 2048
 * Vibe: Atmospheric / Soft Groove (Organic soundscapes, Melodic arpeggios, Dynamic transitions)
 */
export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private reverb: ConvolverNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicVolume = 0.8;
  private sfxVolume = 1.0;
  private isMusicPlaying = false;
  private lastPlayTime = new Map<string, number>();
  private sfxCache = new Map<string, AudioBuffer>();
  private loopCache = new Map<string, AudioBuffer>();

  // --- RECORDING STATE ---
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private recordingDestination: MediaStreamAudioDestinationNode | null = null;

  // --- Seamless Transition States ---
  private currentMode = 'MENU';
  private intensity = 0;

  // Smooth faders for continuous crossfading
  private fadeMenu = 1.0;
  private fadeTavern = 0.0;
  private fadeDungeon = 0.0;
  private fadeForge = 0.0;
  private fadeClassSelect = 0.0;
  private fadeGrimoire = 0.0;

  // --- MIDI-LIKE SEQUENCE DATA ---
  private sequences: Record<string, Record<string, (number | null)[]>> = {
    KICK: {
      ANGELIC: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      POP: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      EPIC: [1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1],
    },
    BASS: {
      WALKING: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0],
      DRIVE: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    },
    LUTE: {
      // 32-step melody (Bar A & B)
      SIMPLE_A: [0, null, 2, null, 4, null, 2, null, 0, null, 2, null, 4, null, 5, null],
      SIMPLE_B: [4, null, 2, null, 0, null, null, null, 2, null, 4, null, 0, null, null, null],
      // Jazzier Phrasing
      JAZZ_A: [0, 2, 3, 2, 1, 2, 3, 5, 4, null, 3, null, 2, 1, 0, null],
      JAZZ_B: [5, 4, 3, 2, 1, 0, -1, 0, 1, 2, 3, 4, 3, 1, 0, null],
    },
    ARP: {
      EPIC_A: [0, 2, 4, 6, 1, 3, 5, 7, 2, 4, 6, 8, 3, 5, 7, 9],
      EPIC_B: [10, 8, 6, 4, 8, 6, 4, 2, 6, 4, 2, 0, 4, 2, 0, -2],
    },
    MOTIF: {
      // 4 Variations of the Iconic Theme
      V1: [0, null, null, null, 0, null, null, null, 7, null, 10, null, 12, null, 10, 7],
      V2: [0, 2, 4, 5, 7, 9, 10, 12, 11, null, 7, null, 5, null, 4, null], // Ascending Scale
      V3: [12, null, 10, null, 7, null, 5, null, 3, 2, 0, null, -2, null, 0, null], // Descending Lyrical
      V4: [0, 7, 12, 7, 0, 7, 12, 7, 10, null, 12, null, 15, null, 12, null], // Energetic Arp
    },
    FILLS: {
      DRUM: [0, 0, 1, 1, 0, 1, 2, 2, 0, 0, 1, 1, 2, 2, 3, 3], // Snare/Tom roll pattern
      LUTE: [0, 2, 4, 5, 7, 9, 11, 12, 14, 12, 11, 9, 7, 5, 4, 2], // Fast melodic flourish
    },
  };

  private targetBpm = 95;
  private currentBpm = 95;
  private beatCount = 0;
  private musicInterval: ReturnType<typeof setTimeout> | null = null;

  private swing = 0.0;
  private dynamicIntensity = 0;

  init() {
    if (this.ctx) return;
    this.ctx = new (
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    )();

    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.connect(this.masterGain);

    this.musicGain = this.ctx.createGain();
    this.musicGain.connect(this.masterGain);
    this.musicGain.gain.value = 0.6;

    this.reverb = this.ctx.createConvolver();
    this.createReverb();

    this.setSfxVolume(this.sfxVolume);
    this.setMusicVolume(this.musicVolume);

    this.cacheCommonSFX();

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private async createReverb() {
    if (!this.ctx) return;
    // A lush, cinematic hall (2.5s tail)
    const length = this.ctx.sampleRate * 2.5;
    const buffer = this.ctx.createBuffer(2, length, this.ctx.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        // Smooth exponential decay with some late reflections
        const decay = Math.exp(-i / (this.ctx.sampleRate * 0.6));
        data[i] = (Math.random() * 2 - 1) * decay;
      }
    }
    if (this.reverb && this.sfxGain && this.masterGain) {
      this.reverb.buffer = buffer;
      this.sfxGain.connect(this.reverb);
      this.reverb.connect(this.masterGain);
    }

    const musicReverbSend = this.ctx.createGain();
    musicReverbSend.gain.value = 0.45; // Increased reverb wetness
    if (this.musicGain && this.reverb) {
      this.musicGain.connect(musicReverbSend);
      musicReverbSend.connect(this.reverb);
    }
  }

  setMusicVolume(v: number) {
    this.musicVolume = v;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.1);
    }
  }

  setSfxVolume(v: number) {
    this.sfxVolume = v;
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.1);
    }
  }

  private playSample(buffer: AudioBuffer, vol: number, useReverb = false) {
    if (!this.ctx || !this.sfxGain || !this.masterGain) return;
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const g = this.ctx.createGain();
    g.gain.value = vol;
    source.connect(g);
    g.connect(useReverb ? this.reverb! : this.sfxGain);
    source.start();
  }

  private async cacheCommonSFX() {
    if (!this.ctx) return;

    // Helper to render a sound to a buffer
    const render = async (duration: number, fn: (ctx: OfflineAudioContext) => void) => {
      const offline = new OfflineAudioContext(
        2,
        this.ctx!.sampleRate * duration,
        this.ctx!.sampleRate,
      );
      fn(offline);
      return await offline.startRendering();
    };

    try {
      // Pre-render "Coin" (0.4s)
      this.sfxCache.set(
        'coin',
        await render(0.4, (ctx) => {
          const play = (freq: number, t: number) => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.3, t + 0.01);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
            osc.connect(g);
            g.connect(ctx.destination);
            osc.start(t);
            osc.stop(t + 0.2);
          };
          play(1174.66, 0);
          play(1760.0, 0.05);
        }),
      );

      // Pre-render "Click" (0.1s)
      this.sfxCache.set(
        'click',
        await render(0.1, (ctx) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, 0);
          osc.frequency.exponentialRampToValueAtTime(200, 0.02);
          g.gain.setValueAtTime(0.3, 0);
          g.gain.exponentialRampToValueAtTime(0.001, 0.02);
          osc.connect(g);
          g.connect(ctx.destination);
          osc.start(0);
          osc.stop(0.02);
        }),
      );

      // Pre-render "Dice" (0.5s)
      this.sfxCache.set(
        'dice',
        await render(0.5, (ctx) => {
          for (let i = 0; i < 6; i++) {
            const t = i * 0.06;
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(400 + Math.random() * 200, t);
            g.gain.setValueAtTime(0.04, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
            osc.connect(g);
            g.connect(ctx.destination);
            osc.start(t);
            osc.stop(t + 0.1);
          }
        }),
      );
    } catch {
      /* ignore */
    }
  }

  getRecordingStream() {
    if (!this.ctx || !this.masterGain) {
      console.error('Audio engine not initialized');
      return null;
    }
    if (!this.recordingDestination) {
      this.recordingDestination = this.ctx.createMediaStreamDestination();
      this.masterGain.connect(this.recordingDestination);
    }
    return this.recordingDestination.stream;
  }

  startRecording() {
    const stream = this.getRecordingStream();
    if (!stream) return;

    this.recordedChunks = [];

    const types = ['audio/mpeg', 'audio/mp3', 'audio/webm;codecs=opus', 'audio/webm'];
    const mimeType = types.find((t) => MediaRecorder.isTypeSupported(t)) || 'audio/webm';

    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType,
    });

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.recordedChunks.push(e.data);
    };

    this.mediaRecorder.onstop = () => {
      if (this.recordedChunks.length === 0) {
        alert(
          'Recording Error: No audio data was captured. Please ensure the game is playing sound.',
        );
        return;
      }

      // Force 'application/octet-stream' to bypass browser extension overriding
      const blob = new Blob(this.recordedChunks, { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `Crit2048_OST_${Date.now()}.mp3`;

      document.body.appendChild(a);
      a.click();

      console.warn('Download triggered for:', a.download);

      setTimeout(() => {
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
        if (this.recordingDestination && this.masterGain) {
          try {
            this.masterGain.disconnect(this.recordingDestination);
          } catch {
            /* ignore */
          }
        }
      }, 5000); // Wait longer before cleanup
    };

    this.mediaRecorder.start(1000); // Collect data every second
    console.warn('Recording started with 1s timeslice...');
  }

  private async cacheLoop(key: string, notes: number[]) {
    if (!this.ctx || this.loopCache.has(key)) return;
    try {
      const duration = 8.0;
      const offline = new OfflineAudioContext(
        2,
        this.ctx.sampleRate * duration,
        this.ctx.sampleRate,
      );

      // We need to simulate synthDronePad/Choir in offline context
      // Simplified versions for the cache
      notes.forEach((note, i) => {
        const freq = this.midiToFreq(i === 0 ? note - 12 : note);
        const osc = offline.createOscillator();
        const g = offline.createGain();
        const f = offline.createBiquadFilter();

        osc.type = i === 0 ? 'triangle' : 'sawtooth';
        osc.frequency.value = freq;
        f.type = 'lowpass';
        f.frequency.value = i === 0 ? 400 : 800;

        g.gain.setValueAtTime(0, 0);
        g.gain.linearRampToValueAtTime(0.2, 2.0);
        g.gain.linearRampToValueAtTime(0, duration);

        osc.connect(f);
        f.connect(g);
        g.connect(offline.destination);
        osc.start(0);
        osc.stop(duration);
      });

      const buffer = await offline.startRendering();
      this.loopCache.set(key, buffer);
    } catch {
      /* ignore */
    }
  }
  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }

  private throttle(name: string, ms: number): boolean {
    const now = Date.now();
    const last = this.lastPlayTime.get(name) || 0;
    if (now - last < ms) return false;
    this.lastPlayTime.set(name, now);
    return true;
  }

  private lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
  }

  // --- CORE SYNTHESIS UTILS ---

  private play(
    type: OscillatorType,
    freq: number,
    time: number,
    vol = 0.1,
    slideFreq: number | null = null,
    useReverb = false,
    pan = 0,
  ) {
    if (!this.ctx || !this.sfxGain || this.sfxVolume <= 0 || vol <= 0.005) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const panner = this.ctx.createStereoPanner();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    if (slideFreq)
      osc.frequency.exponentialRampToValueAtTime(slideFreq, this.ctx.currentTime + time);

    panner.pan.setValueAtTime(pan, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(vol, this.ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + time);

    osc.connect(gain);
    gain.connect(panner);
    panner.connect(useReverb ? this.reverb! : this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + time);
  }

  private noise(
    t: number,
    duration: number,
    vol = 0.1,
    filterFreq = 1000,
    type: BiquadFilterType = 'bandpass',
    q = 1,
    isSfx = false,
  ) {
    if (!this.ctx || (isSfx ? this.sfxVolume <= 0 : this.musicVolume <= 0) || vol <= 0.005) return;
    const bufferSize = this.ctx.sampleRate * Math.max(duration, 0.1);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noiseSrc = this.ctx.createBufferSource();
    noiseSrc.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = filterFreq;
    filter.Q.value = q;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    noiseSrc.connect(filter);
    filter.connect(gain);
    gain.connect(isSfx ? this.sfxGain! : this.musicGain!);
    noiseSrc.start(t);
  }

  private synthCrystalBell(freq: number, t: number, vol: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    // Add high harmonics for a "crystalline" feel
    const subOsc = this.ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(freq * 2.01, t);
    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(vol * 0.3, t);

    filter.type = 'lowpass';
    filter.frequency.value = 4000;

    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

    osc.connect(filter);
    subOsc.connect(subGain);
    subGain.connect(filter);
    filter.connect(g);
    g.connect(this.masterGain);

    osc.start(t);
    subOsc.start(t);
    osc.stop(t + 1.2);
    subOsc.stop(t + 1.2);
  }

  private synthSoftElectricPiano(freq: number, t: number, vol: number) {
    if (!this.ctx || !this.masterGain) return;
    const carrier = this.ctx.createOscillator();
    const modulator = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();
    const g = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    carrier.type = 'sine';
    modulator.type = 'sine';

    modulator.frequency.value = freq * 1.5; // Warmer harmonic
    modGain.gain.value = freq * 0.8;

    filter.type = 'lowpass';
    filter.frequency.value = 1500;

    carrier.frequency.setValueAtTime(freq, t);
    modulator.connect(modGain);
    modGain.connect(carrier.frequency);

    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.05); // Softer attack
    g.gain.exponentialRampToValueAtTime(0.001, t + 2.0);

    carrier.connect(filter);
    filter.connect(g);
    g.connect(this.masterGain);

    carrier.start(t);
    modulator.start(t);
    carrier.stop(t + 2.0);
    modulator.stop(t + 2.0);
  }

  private synthEtherealFlute(freq: number, t: number, vol: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    lfo.frequency.value = 4.5; // Natural vibrato
    lfoGain.gain.value = 3;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.15); // Breath-like attack
    g.gain.linearRampToValueAtTime(vol * 0.8, t + 0.5);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1.5);

    osc.connect(g);
    g.connect(this.masterGain);

    osc.start(t);
    lfo.start(t);
    osc.stop(t + 1.5);
    lfo.stop(t + 1.5);

    // Add soft breath noise
    this.noise(t, 0.8, vol * 0.1, 2000, 'bandpass', 4);
  }

  private synthOrganicStrings(freq: number, t: number, vol: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'sawtooth';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, t);
    osc2.frequency.setValueAtTime(freq * 1.002, t);

    filter.type = 'lowpass';
    filter.frequency.value = 1000;

    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.2); // Slow attack
    g.gain.linearRampToValueAtTime(vol * 0.8, t + 0.8);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1.5);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(g);
    g.connect(this.masterGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 1.5);
    osc2.stop(t + 1.5);
  }

  // --- INTENTIONAL INSTRUMENT PATCHES ---

  private synthDronePad(freq: number, t: number, duration: number, vol: number) {
    if (!this.ctx || vol <= 0.01 || !this.musicGain) return;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const f = this.ctx.createBiquadFilter();
    const panner = this.ctx.createStereoPanner();

    osc1.type = 'triangle';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(freq, t);
    osc2.frequency.setValueAtTime(freq * 1.002, t);

    // Subtle swirling pan
    panner.pan.setValueAtTime(Math.sin(t * 0.2) * 0.4, t);

    f.type = 'lowpass';
    f.frequency.setValueAtTime(600, t);
    f.frequency.exponentialRampToValueAtTime(300, t + duration);

    g.gain.setValueAtTime(0.001, t);
    g.gain.linearRampToValueAtTime(vol, t + duration * 0.4);
    g.gain.linearRampToValueAtTime(0.001, t + duration);

    osc1.connect(f);
    osc2.connect(f);
    f.connect(g);
    g.connect(panner);
    panner.connect(this.musicGain);
    osc1.start(t);
    osc1.stop(t + duration);
    osc2.start(t);
    osc2.stop(t + duration);
  }

  private synthChoir(freq: number, t: number, duration: number, vol: number) {
    if (!this.ctx || vol <= 0.01 || !this.musicGain) return;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const f1 = this.ctx.createBiquadFilter();
    const f2 = this.ctx.createBiquadFilter();
    const panner = this.ctx.createStereoPanner();

    osc1.type = 'sawtooth';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(freq, t);
    osc2.frequency.setValueAtTime(freq * 1.002, t);

    panner.pan.setValueAtTime(Math.cos(t * 0.3) * 0.5, t);

    f1.type = 'bandpass';
    f1.frequency.value = 800; // Vocal formant 1
    f1.Q.value = 4.0;

    f2.type = 'lowpass';
    f2.frequency.value = 2000;

    g.gain.setValueAtTime(0.001, t);
    g.gain.linearRampToValueAtTime(vol, t + duration * 0.3);
    g.gain.setValueAtTime(vol, t + duration * 0.7);
    g.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc1.connect(f1);
    osc2.connect(f1);
    f1.connect(f2);
    f2.connect(g);
    g.connect(panner);
    panner.connect(this.musicGain);
    osc1.start(t);
    osc1.stop(t + duration);
    osc2.start(t);
    osc2.stop(t + duration);
  }

  private synthTubularBell(freq: number, t: number, vol: number) {
    if (!this.ctx || vol <= 0.01) return;
    const partials = [1, 2.0, 3.0, 4.2];
    partials.forEach((mult, i) => {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * mult, t);

      const v = vol / (i + 1.5);
      g.gain.setValueAtTime(0.001, t);
      g.gain.exponentialRampToValueAtTime(v, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + 3.0 / (i + 1));

      osc.connect(g);
      g.connect(this.musicGain!);
      osc.start(t);
      osc.stop(t + 3.0);
    });
  }

  private synthBrassStab(freq: number, t: number, vol: number, swell = false) {
    if (!this.ctx || vol <= 0.01) return;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const f = this.ctx.createBiquadFilter();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq, t);
    osc2.frequency.setValueAtTime(freq * 1.002, t);

    f.type = 'lowpass';
    f.frequency.setValueAtTime(swell ? 400 : 4000, t);
    f.frequency.exponentialRampToValueAtTime(swell ? 4000 : 300, t + 0.3);

    g.gain.setValueAtTime(0.001, t);
    if (swell) {
      g.gain.exponentialRampToValueAtTime(vol, t + 0.3);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
    } else {
      g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    }

    osc1.connect(f);
    osc2.connect(f);
    f.connect(g);
    g.connect(this.musicGain!);
    osc1.start(t);
    osc1.stop(t + 0.8);
    osc2.start(t);
    osc2.stop(t + 0.8);
  }

  private synthAcousticBass(freq: number, t: number, vol: number) {
    if (!this.ctx || vol <= 0.01) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const f = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);

    f.type = 'lowpass';
    f.frequency.setValueAtTime(800, t);
    f.frequency.exponentialRampToValueAtTime(100, t + 0.3);

    g.gain.setValueAtTime(0.001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    osc.connect(f);
    f.connect(g);
    g.connect(this.musicGain!);
    osc.start(t);
    osc.stop(t + 0.6);
  }

  private synthLute(freq: number, t: number, vol: number) {
    if (!this.ctx || vol <= 0.01 || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const f = this.ctx.createBiquadFilter();
    const panner = this.ctx.createStereoPanner();

    osc.type = 'triangle'; // Warmer than sawtooth
    osc.frequency.setValueAtTime(freq, t);

    f.type = 'lowpass';
    f.frequency.setValueAtTime(5000, t);
    f.frequency.exponentialRampToValueAtTime(400, t + 0.3);

    panner.pan.setValueAtTime(-0.3, t); // Pan LEFT

    g.gain.setValueAtTime(0.001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

    osc.connect(f);
    f.connect(g);
    g.connect(panner);
    panner.connect(this.musicGain!);
    osc.start(t);
    osc.stop(t + 0.8);

    // Subtle string "pluck" noise
    this.noise(t, 0.03, vol * 0.3, 4000, 'highpass', 2);
  }

  private synthSoftGroovePulse(t: number, vol: number) {
    if (!this.ctx || vol <= 0.01 || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const f = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(60, t); // Sub-bass pulse

    f.type = 'lowpass';
    f.frequency.value = 150;

    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(f);
    f.connect(g);
    g.connect(this.musicGain);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  private synthSubBass(freq: number, t: number, vol: number) {
    if (!this.ctx || vol <= 0.01) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const f = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    f.type = 'lowpass';
    f.frequency.setValueAtTime(150, t);

    g.gain.setValueAtTime(0.001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(f);
    f.connect(g);
    g.connect(this.musicGain!);
    osc.start(t);
    osc.stop(t + 0.4);
  }

  private synthLeadArp(freq: number, t: number, duration: number, vol: number, bright = 0.5) {
    if (!this.ctx || vol <= 0.01 || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const f = this.ctx.createBiquadFilter();
    const panner = this.ctx.createStereoPanner();

    osc.type = bright > 0.5 ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(freq, t);

    panner.pan.setValueAtTime(0.3, t); // Pan RIGHT

    f.type = 'lowpass';
    f.frequency.setValueAtTime(1000 + bright * 4000, t);
    f.frequency.exponentialRampToValueAtTime(200, t + duration);

    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(f);
    f.connect(g);
    g.connect(panner);
    panner.connect(this.musicGain!);
    osc.start(t);
    osc.stop(t + duration);
  }

  private synthSubBoom(t: number, vol: number) {
    if (!this.ctx || vol <= 0.01) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(60, t);
    osc.frequency.exponentialRampToValueAtTime(20, t + 0.8);

    g.gain.setValueAtTime(vol, t);
    g.gain.linearRampToValueAtTime(0.001, t + 0.8);

    osc.connect(g);
    g.connect(this.musicGain!);
    osc.start(t);
    osc.stop(t + 0.8);
  }

  private synthKick(t: number, vol: number) {
    if (!this.ctx || vol <= 0.01) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);

    g.gain.setValueAtTime(0.001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(g);
    g.connect(this.musicGain!);
    osc.start(t);
    osc.stop(t + 0.3);

    this.noise(t, 0.05, vol * 0.15, 600, 'lowpass', 1);
  }

  private synthPercussion(t: number, vol: number, type: 'SHAKER' | 'SNARE') {
    if (vol <= 0.01) return;
    if (type === 'SHAKER') {
      this.noise(t, 0.05, vol, 6000, 'highpass', 1.5);
    } else {
      this.noise(t, 0.15, vol, 2500, 'bandpass', 1.0);
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, t);
      osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
      g.gain.setValueAtTime(vol * 0.8, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.connect(g);
      g.connect(this.musicGain!);
      osc.start(t);
      osc.stop(t + 0.1);
    }
  }

  private getDynamicChord(bar: number, intensity: number) {
    // 0-2: Angelic / Light (D Major focus, Maj7/9 chords)
    const light = [
      [50, 54, 57, 61], // Dmaj7
      [55, 59, 62, 66], // Gmaj7
      [57, 61, 64, 67], // Amaj7
      [50, 54, 57, 61], // Dmaj7
    ];
    // 3-6: Jazz / Pop (Syncopated, Extended chords m7/9)
    const jazz = [
      [50, 53, 57, 60, 64], // Dm9
      [43, 47, 50, 53, 57], // G9
      [48, 52, 55, 59, 62], // Cmaj9
      [45, 49, 52, 55, 59], // A7(b13)
    ];
    // 7+: Epic / Dark (D Minor / Phrygian focus, heavy/dissonant)
    const dark = [
      [50, 53, 57, 62], // Dm
      [46, 50, 53, 58], // Bb
      [43, 46, 50, 55], // Gm
      [45, 49, 52, 56], // A7(b9)
    ];

    if (intensity < 3) return light[bar % 4];
    if (intensity < 7) return jazz[bar % 4];
    return dark[bar % 4];
  }

  private midiToFreq(m: number) {
    return Math.pow(2, (m - 69) / 12) * 440;
  }

  // --- SEAMLESS SEQUENCER ENGINE ---

  setMusicMode(
    mode: string,
    encounterIdx = 0,
    _totalEncounters = 1,
    monsterHp = 0,
    monsterMaxHp = 0,
  ) {
    const isMenu = ['MENU', 'START'].includes(mode);
    const isClassSelect = mode === 'CLASS_SELECT';
    const wasMenu = ['MENU', 'START', 'CLASS_SELECT', 'FORGE', 'GRIMOIRE'].includes(
      this.currentMode,
    );

    // Reset sequencer to bar 1 when returning to menu/start
    if ((isMenu || isClassSelect) && !wasMenu) {
      this.beatCount = 0;
    }

    this.currentMode = mode;

    // Component 1: Run Progress (Ante Index)
    // Component 2: Enemy Desperation (1 - HP %)
    const hpPct = monsterMaxHp > 0 ? monsterHp / monsterMaxHp : 1;
    const desperation = 1 - hpPct;

    // Ratchet Intensity only applies in GAME/DUNGEON mode
    const isDungeon =
      !isMenu && !isClassSelect && mode !== 'TAVERN' && mode !== 'FORGE' && mode !== 'GRIMOIRE';

    if (isDungeon) {
      const anteWeight = 2.0;
      const despWeight = 4.0;
      this.dynamicIntensity = encounterIdx * anteWeight + desperation * despWeight;
    } else {
      this.dynamicIntensity = 0; // Default for menus
    }

    this.swing = this.dynamicIntensity >= 4 && this.dynamicIntensity <= 8 ? 0.18 : 0.05;

    if (isMenu) this.targetBpm = 100;
    else if (isClassSelect) this.targetBpm = 110;
    else if (mode === 'TAVERN') this.targetBpm = 120;
    else if (mode === 'GRIMOIRE') this.targetBpm = 95;
    else if (mode === 'FORGE') this.targetBpm = 110;
    else this.targetBpm = Math.min(150, 110 + this.dynamicIntensity * 5);

    // Restore music gain if it was ducked by victory/gameOver
    if (this.ctx && this.musicGain && this.musicGain.gain.value < 0.1) {
      this.musicGain.gain.setTargetAtTime(0.6, this.ctx.currentTime, 1.5);
    }
  }

  startMusic() {
    if (this.isMusicPlaying || !this.ctx) return;
    this.isMusicPlaying = true;
    if (this.currentMode === 'MENU') this.menuEnter();
    this.playSequence();
  }

  stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval) clearTimeout(this.musicInterval);
  }

  updateTension(multiplier: number) {
    if (this.currentMode !== 'PLAYING') return;
    this.targetBpm = Math.min(
      150,
      110 + this.dynamicIntensity * 5 + Math.min(20, (multiplier - 1) * 3),
    );
  }

  private playSequence() {
    if (!this.ctx || !this.isMusicPlaying) return;

    const nextBeat = () => {
      if (!this.isMusicPlaying) return;

      // 1. SMOOTH INTERPOLATIONS
      this.currentBpm += (this.targetBpm - this.currentBpm) * 0.1;

      const isMenu = ['MENU', 'START'].includes(this.currentMode);
      const isDungeon = ['PLAYING', 'DICE', 'SPELL'].includes(this.currentMode);
      const isForge = this.currentMode === 'FORGE';
      const isGrimoire = this.currentMode === 'GRIMOIRE';
      const isClassSelect = this.currentMode === 'CLASS_SELECT';

      this.fadeMenu = this.lerp(this.fadeMenu, isMenu ? 1 : 0, 0.05);
      this.fadeTavern = this.lerp(this.fadeTavern, this.currentMode === 'TAVERN' ? 1 : 0, 0.05);
      this.fadeDungeon = this.lerp(this.fadeDungeon, isDungeon ? 1 : 0, 0.02);
      this.fadeForge = this.lerp(this.fadeForge, isForge ? 1 : 0, 0.02);
      this.fadeGrimoire = this.lerp(this.fadeGrimoire, isGrimoire ? 1 : 0, 0.02);
      this.fadeClassSelect = this.lerp(this.fadeClassSelect, isClassSelect ? 1 : 0, 0.02);

      const secondsPerBeat = 60 / this.currentBpm;
      const stepTime = secondsPerBeat / 4;
      const step = this.beatCount % 16;
      const bar = Math.floor(this.beatCount / 16) % 8;

      // Organic swing applied globally
      const isOffbeat = step % 2 !== 0;
      const swingDelay = isOffbeat ? stepTime * this.swing : 0;
      const t = this.ctx!.currentTime + 0.05 + swingDelay;

      // 2. LAYER DISPATCHER
      this.playUniversalDrone(t, bar, step, this.dynamicIntensity);

      // Soft Groove Pulse (Constant atmospheric rhythm)
      if (step % 4 === 0) {
        this.synthSoftGroovePulse(t, 0.04);
      }

      if (this.fadeMenu > 0.01) this.playMenuLayers(t, bar, step, this.fadeMenu);
      if (this.fadeClassSelect > 0.01)
        this.playClassSelectLayers(t, bar, step, this.fadeClassSelect);
      if (this.fadeTavern > 0.01) this.playTavernLayers(t, bar, step, this.fadeTavern);
      if (this.fadeDungeon > 0.01)
        this.playDungeonLayers(t, bar, step, this.fadeDungeon, this.dynamicIntensity);
      if (this.fadeForge > 0.01) this.playForgeLayers(t, bar, step, this.fadeForge);
      if (this.fadeGrimoire > 0.01) this.playGrimoireLayers(t, bar, step, this.fadeGrimoire);

      this.beatCount++;
      this.musicInterval = setTimeout(nextBeat, stepTime * 1000);
    };

    nextBeat();
  }

  // --- LAYER DEFINITIONS ---

  private playUniversalDrone(t: number, bar: number, step: number, intensity: number) {
    // The anchor. Key derived from dynamic chord
    if (step === 0 && bar % 2 === 0) {
      const chord = this.getDynamicChord(bar, intensity);
      const key = `drone_${chord[0]}_${intensity}`;

      const cached = this.loopCache.get(key);
      if (cached) {
        this.playSample(cached, 0.04);
      } else {
        this.synthDronePad(this.midiToFreq(chord[0] - 12), t, 6.0, 0.03); // Deep Root
        // Pre-cache for next time
        this.cacheLoop(key, chord);
      }

      // Angelic high layer (0-2)
      if (intensity < 3) {
        this.synthChoir(this.midiToFreq(chord[3] + 12), t, 6.0, 0.04);
      }
    }
  }

  private playMenuLayers(t: number, bar: number, step: number, fade: number) {
    const arrangement = [
      'INTRO',
      'BRIDGE1',
      'CHORUS1',
      'BRIDGE2',
      'CHORUS2',
      'OUTRO',
      'BRIDGE1',
      'CHORUS2',
      'BRIDGE2',
      'CHORUS1',
      'INTRO',
    ];
    // Each section is 8 bars. Total 88 bars (~3.7 mins)
    const sectionIdx = Math.floor(this.beatCount / 16 / 8) % arrangement.length;
    const section = arrangement[sectionIdx];

    // Home Screen Chord Progression (Dmaj -> Gmaj -> Bm -> Amaj)
    const menuChords = [
      [50, 54, 57, 61], // Dmaj7
      [43, 47, 50, 55], // Gmaj
      [47, 50, 54, 59], // Bm
      [45, 49, 52, 57], // Amaj
    ];
    const currentChord = menuChords[bar % 4] || menuChords[0];

    // --- SECTION LOGIC ---
    const hasMotif = ['BRIDGE1', 'CHORUS1', 'CHORUS2'].includes(section);
    const hasDrums = ['CHORUS1', 'CHORUS2'].includes(section);
    const hasWalkingBass = section === 'BRIDGE2';
    const isAmbient = section === 'INTRO' || section === 'OUTRO';

    // 1. CHORD PROGRESSION PADS (Atmospheric Atmosphere)
    if (step === 0 && bar % 2 === 0) {
      const padVol = isAmbient ? 0.03 * fade : 0.02 * fade;
      currentChord.forEach((note, i) => {
        if (i < 2) this.synthDronePad(this.midiToFreq(note - 12), t, 8.0, padVol);
        else this.synthChoir(this.midiToFreq(note), t, 8.0, padVol * 1.8);
      });
    }
    // 2. MELODIC MOTIF (Ethereal Flute Atmosphere)
    if (hasMotif) {
      const variations = { BRIDGE1: 'V3', CHORUS1: 'V1', CHORUS2: 'V4' };
      const seqName = variations[section as keyof typeof variations] || 'V1';
      const seq = this.sequences.MOTIF[seqName];
      const note = seq[step];
      if (note !== null) {
        const freq = this.midiToFreq(50 + (note as number));
        this.synthEtherealFlute(freq, t, 0.05 * fade);
        if (section.startsWith('CHORUS') && (step === 0 || step === 12)) {
          this.synthCrystalBell(freq, t, 0.04 * fade);
        }
      }
    }

    // 3. JAZZY WALKING BASS (Real soundscape)
    if (hasWalkingBass && step % 4 === 0) {
      const notes = [38, 41, 43, 45]; // D, F, G, A
      this.synthAcousticBass(this.midiToFreq(notes[(step / 4) % 4]), t, 0.07 * fade);
    }

    // 4. SOFT GROOVE PERCUSSION
    if (hasDrums) {
      if (step % 8 === 0) this.synthKick(t, 0.06 * fade);
      if (step % 2 === 1) this.synthPercussion(t, 0.02 * fade, 'SHAKER');
      if (step === 12) this.synthPercussion(t, 0.03 * fade, 'SNARE'); // Light snare accent
    }

    // 5. CRYSTAL BELLS
    if ((isAmbient || section === 'BRIDGE1') && step === 0 && bar % 4 === 0) {
      this.synthCrystalBell(this.midiToFreq(74), t, 0.06 * fade);
    }
  }

  private playClassSelectLayers(t: number, bar: number, step: number, fade: number) {
    // Constant, mystical, ethereal feel with Soft Electric Piano
    if (step === 0 && bar % 2 === 0) {
      this.synthDronePad(this.midiToFreq(43), t, 4.0, 0.03 * fade); // G2
    }
    if (step % 4 === 0) {
      // Shimmering Soft E-Piano chords
      const notes = [67, 71, 74, 79]; // Gmaj7
      this.synthSoftElectricPiano(this.midiToFreq(notes[(step / 4) % 4]), t, 0.08 * fade);
    }
    // Crystal bell flourish
    if (bar % 4 === 3 && step === 12) {
      this.synthCrystalBell(this.midiToFreq(83), t, 0.04 * fade);
    }
    // High choir shimmer
    if (step === 0) {
      this.synthChoir(this.midiToFreq(79), t, 4.0, 0.02 * fade);
    }
  }

  private playTavernLayers(t: number, bar: number, step: number, fade: number) {
    const chords = [
      [53, 57, 60, 65], // F
      [48, 52, 55, 60], // C
      [50, 53, 57, 62], // Dm
      [46, 50, 53, 58], // Bb
    ];
    const chord: any = chords[bar % 4]!;

    if (step === 0 || step === 8)
      this.synthAcousticBass(this.midiToFreq(chord[0] - 12), t, 0.1 * fade);

    if (step === 4 || step === 10 || step === 14) {
      this.synthLute(this.midiToFreq(chord[1]), t, 0.06 * fade);
      this.synthLute(this.midiToFreq(chord[2]), t, 0.06 * fade);
    }

    if (step === 0 || step === 8) this.synthKick(t, 0.08 * fade);
  }

  private playForgeLayers(t: number, bar: number, step: number, fade: number) {
    // Industrious, mechanical Dorian groove: Dm -> F -> Gm -> C
    const chords = [
      [50, 57, 62], // Dm (Power chord)
      [53, 60, 65], // F
      [55, 62, 67], // Gm
      [48, 55, 60], // C
    ];
    const chord: any = chords[bar % 4]!;

    // Steady, syncopated chugging bass
    if (step === 0 || step === 6 || step === 8) {
      this.synthAcousticBass(this.midiToFreq(chord[0] - 12), t, 0.12 * fade);
    }

    // Heavy "Anvil" strikes on beats 2 and 4
    if (step === 4 || step === 12) {
      this.synthTubularBell(this.midiToFreq(62), t, 0.08 * fade); // Metallic strike D4
      this.synthPercussion(t, 0.08 * fade, 'SNARE'); // Body of the strike
    }

    // Fast, repetitive lute hammering
    if (step % 2 === 0) {
      const noteIdx = (step / 2) % 3;
      this.synthLute(this.midiToFreq(chord[noteIdx]), t, 0.07 * fade);
    }
  }

  private playGrimoireLayers(t: number, bar: number, step: number, fade: number) {
    // Scholarly, mysterious floating progression: Dm(add9) <-> Ebmaj7
    const chords = [
      [50, 53, 57, 64], // Dm(add9)
      [50, 53, 57, 64],
      [51, 55, 58, 62], // Ebmaj7 (Super mysterious Phrygian shift)
      [51, 55, 58, 62],
    ];
    const chord: any = chords[bar % 4]!;

    // Slow, thought-provoking bass (only on the downbeat)
    if (step === 0) {
      this.synthAcousticBass(this.midiToFreq(chord[0] - 12), t, 0.08 * fade);
      // Ethereal choir swell
      this.synthChoir(this.midiToFreq(chord[2]), t, 6.0, 0.05 * fade);
    }
    if (step === 8) {
      this.synthChoir(this.midiToFreq(chord[3]), t, 4.0, 0.04 * fade);
    }

    // Floating bell melodies
    if (step === 0 || step === 10) {
      this.synthTubularBell(this.midiToFreq(chord[3] + 12), t, 0.06 * fade);
    }

    // Sparse, deliberate lute pluck in the background
    if (step === 6 || step === 14) {
      this.synthLute(this.midiToFreq(chord[1]), t, 0.05 * fade);
    }
  }

  private playDungeonLayers(t: number, bar: number, step: number, fade: number, intensity: number) {
    // 32-Bar Loop Arrangement for Gameplay
    const arrangement = [
      'VERSE',
      'VERSE',
      'CHORUS',
      'CHORUS',
      'BRIDGE',
      'VERSE',
      'CHORUS',
      'BUILDUP',
    ];
    const sectionIdx = Math.floor(this.beatCount / 16 / 4) % arrangement.length;
    const section = arrangement[sectionIdx];

    const chord = this.getDynamicChord(bar, intensity);
    const root = chord[0];

    // --- ARRANGEMENT MODIFIERS ---
    const isVerse = section === 'VERSE';
    const isChorus = section === 'CHORUS' || section === 'BUILDUP';
    const isBridge = section === 'BRIDGE';

    // --- MIDI-LIKE DISPATCHER ---

    // 1. KICK (Scaled by intensity + arrangement)
    const kickSeq =
      intensity < 3
        ? this.sequences.KICK.ANGELIC
        : intensity < 7
          ? this.sequences.KICK.POP
          : this.sequences.KICK.EPIC;
    if (kickSeq && kickSeq[step]) {
      // Drop kick in Bridge for tension
      const kickFade = isBridge ? 0.3 : 1.0;
      this.synthKick(t, 0.12 * fade * kickFade);
    }

    // 2. BASS (Scaled by intensity + arrangement)
    if (intensity < 3) {
      if (step === 0 || step === 8)
        this.synthAcousticBass(this.midiToFreq(root - 12), t, 0.1 * fade);
    } else {
      const bassSeq = intensity < 7 ? this.sequences.BASS.WALKING : this.sequences.BASS.DRIVE;
      if (bassSeq && bassSeq[step]) {
        const note = (chord[step % 2 === 0 ? 0 : 1] ?? root) - 12;
        const vol = (step % 4 === 0 ? 0.15 : 0.08) * fade * (isBridge ? 0.6 : 1.0);
        if (intensity < 7) this.synthAcousticBass(this.midiToFreq(note), t, vol);
        else this.synthSubBass(this.midiToFreq(note), t, vol);
      }
    }

    // 3. LUTE & ETHEREAL MELODY (Verse focused)
    if (isVerse || isChorus || isBridge) {
      const isBarA = bar % 2 === 0;
      const luteSeq =
        intensity < 5
          ? isBarA
            ? this.sequences.LUTE.SIMPLE_A
            : this.sequences.LUTE.SIMPLE_B
          : isBarA
            ? this.sequences.LUTE.JAZZ_A
            : this.sequences.LUTE.JAZZ_B;

      const luteEvent = luteSeq ? luteSeq[step] : null;
      if (luteEvent !== null && luteEvent !== undefined) {
        const freq = this.midiToFreq((chord[0] ?? 50) + (luteEvent as number));
        if (isBridge && intensity > 4) {
          // Use Ethereal Flute for an atmospheric bridge
          this.synthEtherealFlute(freq, t, 0.06 * fade);
        } else {
          this.synthLute(freq, t, 0.08 * fade);
        }
      }
    }

    // 4. LEAD ARP & CRYSTAL MELODY (Chorus focused)
    if (intensity > 5 && (isChorus || section === 'BUILDUP')) {
      const isBarA = bar % 2 === 0;
      const arpSeq = isBarA ? this.sequences.ARP.EPIC_A : this.sequences.ARP.EPIC_B;
      const arpEvent = arpSeq ? arpSeq[step] : null;
      if (arpEvent !== null && arpEvent !== undefined) {
        const freq = this.midiToFreq((chord[0] ?? 50) + 12 + (arpEvent as number));
        const vol = (step % 4 === 0 ? 0.06 : 0.03) * fade;

        // Layer with Crystal Bells for a melodic atmosphere
        if (intensity > 8 && step % 4 === 0) {
          this.synthCrystalBell(freq, t, 0.05 * fade);
        }

        this.synthLeadArp(freq, t, 0.15, vol, intensity > 8 ? 0.8 : 0.4);
      }
    }

    // 5. PERCUSSION
    const isTurnaround = bar % 4 === 3;
    if (intensity > 3 && !isBridge) {
      if (isTurnaround && step >= 8) {
        // DRUM FILL
        const vol = (0.05 + (step / 16) * 0.1) * fade;
        this.synthPercussion(t, vol, 'SNARE');
      } else {
        if (step === 4 || step === 12) this.synthPercussion(t, 0.1 * fade, 'SNARE');
        if (step % 2 === 1 && intensity > 5) this.synthPercussion(t, 0.05 * fade, 'SHAKER');
      }
    }

    // 6. INSTRUMENTAL FLOURISH (LUTE FILL)
    if (isTurnaround && step >= 8 && intensity > 4) {
      const fillNote = this.sequences.FILLS.LUTE[step];
      const freq = this.midiToFreq(chord[0] + 12 + (fillNote as number));
      this.synthLute(freq, t, 0.06 * fade);
    }

    // 6. CHORD PROGRESSION PADS
    if (step === 0 && bar % 2 === 0) {
      const padVol = 0.015 * fade;
      const cacheKey = `pad_${root}`;
      const buffer = this.loopCache.get(cacheKey);

      if (buffer) {
        this.playSample(buffer, padVol * 1.5, true);
      } else {
        chord.forEach((note, i) => {
          if (i === 0) this.synthDronePad(this.midiToFreq(note - 12), t, 8.0, padVol * 2);
          else this.synthChoir(this.midiToFreq(note), t, 8.0, padVol);
        });
        // Attempt to cache for next time
        this.cacheLoop(cacheKey, chord);
      }
    }

    if (intensity > 4 && (step === 0 || step === 8)) {
      const stabVol = isChorus ? 0.12 : 0.05;
      this.synthBrassStab(this.midiToFreq(root), t, stabVol * fade, intensity > 7);
    }

    if (intensity > 7 && step === 0 && isChorus) {
      this.synthSubBoom(t, 0.2 * fade);
      this.synthChoir(this.midiToFreq(root + 12), t, 4.0, 0.06 * fade);
    }

    if (intensity > 2 && step === 0 && bar % 2 === 0) {
      this.synthTubularBell(this.midiToFreq(chord[chord.length - 1] + 12), t, 0.08 * fade);
    }
  }

  // --- HARMONICALLY INTEGRATED SFX ---
  // All sound effects are physically modeled and tuned to D Minor (D, E, F, G, A, Bb, C)

  btnClick() {
    if (!this.ctx) return;
    const buffer = this.sfxCache.get('click');
    if (buffer) {
      this.playSample(buffer, 0.3);
      return;
    }
    const t = this.ctx.currentTime;
    this.play('sine', 800, 0.02, 0.06, 200);
    this.noise(t, 0.02, 0.03, 1500, 'bandpass', 1, true);
  }

  slide() {
    if (!this.throttle('slide', 50) || !this.ctx) return;
    const t = this.ctx.currentTime;
    const g = this.ctx.createGain();
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
    g.gain.setValueAtTime(0.015, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.connect(g);
    g.connect(this.sfxGain!);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  merge() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(1174.66, t + 0.08); // Slide to D6
    g.gain.setValueAtTime(0.04, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.connect(g);
    g.connect(this.sfxGain!);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  diceClatter() {
    if (!this.ctx || !this.throttle('dice', 40)) return;
    const buffer = this.sfxCache.get('dice');
    if (buffer) {
      this.playSample(buffer, 0.12);
      return;
    }
    for (let i = 0; i < 4; i++) {
      setTimeout(
        () => {
          this.play('triangle', 400 + Math.random() * 200, 0.03, 0.02, 200);
        },
        i * 35 + Math.random() * 20,
      );
    }
  }

  crit() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.synthBrassStab(this.midiToFreq(65), t, 0.08); // F
    setTimeout(() => {
      this.synthBrassStab(this.midiToFreq(66), this.ctx!.currentTime, 0.12, true); // F#
      this.synthTubularBell(this.midiToFreq(78), this.ctx!.currentTime, 0.08);
    }, 100);
  }

  fail() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.play('triangle', this.midiToFreq(62), 0.2, 0.06, this.midiToFreq(56));
    this.synthAcousticBass(this.midiToFreq(38), t, 0.1);
  }

  hit() {
    if (!this.throttle('hit', 100) || !this.ctx) return;
    const t = this.ctx.currentTime;
    this.synthKick(t, 0.1);
    this.noise(t, 0.08, 0.06, 1200, 'bandpass', 1, true);
  }

  coin() {
    if (!this.ctx || !this.throttle('coin', 100)) return;
    const buffer = this.sfxCache.get('coin');
    if (buffer) {
      this.playSample(buffer, 0.2);
      return;
    }
    this.play('sine', 1174.66, 0.15, 0.03, 1174.66);
    setTimeout(() => this.play('sine', 1760.0, 0.2, 0.03, 1760.0), 50);
  }

  powerUp() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.synthLute(this.midiToFreq(62), t, 0.06);
    setTimeout(() => this.synthLute(this.midiToFreq(69), this.ctx!.currentTime, 0.06), 80);
    setTimeout(() => this.synthLute(this.midiToFreq(74), this.ctx!.currentTime, 0.08), 160);
  }

  // --- INTENTIONAL EVENT SFX ---

  victory() {
    if (!this.ctx || !this.musicGain) return;
    const t = this.ctx.currentTime;

    this.musicGain.gain.setTargetAtTime(0, t, 0.1);

    const dMajor = [38, 45, 50, 54, 57, 62];
    dMajor.forEach((note) => {
      this.synthChoir(this.midiToFreq(note), t, 3.0, 0.1);
      this.synthBrassStab(this.midiToFreq(note), t, 0.12, true);
    });

    [50, 54, 57, 62, 66, 69, 74].forEach((note, i) => {
      setTimeout(() => {
        if (!this.ctx) return;
        this.synthTubularBell(this.midiToFreq(note), this.ctx.currentTime, 0.08);
      }, i * 100);
    });

    setTimeout(() => {
      if (this.ctx && this.musicGain)
        this.musicGain.gain.setTargetAtTime(0.6, this.ctx.currentTime, 2.0);
    }, 3500);
  }

  encounterWin() {
    if (!this.ctx) return;
    const flourish = [57, 62, 66];
    flourish.forEach((note, i) => {
      setTimeout(() => {
        if (!this.ctx) return;
        this.synthLute(this.midiToFreq(note), this.ctx.currentTime, 0.1);
      }, i * 80);
    });
    setTimeout(() => {
      if (!this.ctx) return;
      this.synthBrassStab(this.midiToFreq(74), this.ctx.currentTime, 0.1);
    }, 240);
  }

  gameOver() {
    if (!this.ctx || !this.musicGain) return;
    const t = this.ctx.currentTime;

    // Massive, sudden music ducking for dramatic effect
    this.musicGain.gain.setTargetAtTime(0, t, 0.5);

    // "YOU DIED" - Huge dissonant tritone impact
    this.synthKick(t, 0.25);
    this.synthBrassStab(this.midiToFreq(38), t, 0.15, true); // D2 swell
    this.synthBrassStab(this.midiToFreq(44), t, 0.15, true); // G#2 (Tritone clash)

    // Slow, mournful descending diminished chord
    const descent = [56, 53, 50, 44]; // G#, F, D, G#
    descent.forEach((note, i) => {
      setTimeout(
        () => {
          if (!this.ctx) return;
          this.synthChoir(this.midiToFreq(note), this.ctx.currentTime, 2.5, 0.1);
        },
        800 + i * 700,
      );
    });

    // Final echoing death toll in the abyss
    setTimeout(
      () => {
        if (!this.ctx) return;
        this.synthTubularBell(this.midiToFreq(38), this.ctx.currentTime, 0.2); // Low D bell
        this.synthAcousticBass(this.midiToFreq(26), this.ctx.currentTime, 0.2); // Sub D
      },
      800 + descent.length * 700,
    );
  }

  enemyPower() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.synthBrassStab(this.midiToFreq(50), t, 0.1, true);
    this.synthBrassStab(this.midiToFreq(53), t, 0.1, true);
    this.synthAcousticBass(this.midiToFreq(38), t, 0.15);
  }

  classSelect() {
    if (!this.ctx) return;
    [62, 64, 65, 67, 69, 74].forEach((note, i) => {
      setTimeout(() => {
        if (!this.ctx) return;
        this.synthTubularBell(this.midiToFreq(note), this.ctx.currentTime, 0.05);
      }, i * 60);
    });
  }

  menuEnter() {
    if (!this.ctx) return;
    this.synthTubularBell(this.midiToFreq(62), this.ctx.currentTime, 0.08);
    setTimeout(() => {
      if (!this.ctx) return;
      this.synthTubularBell(this.midiToFreq(69), this.ctx.currentTime, 0.08);
    }, 150);
  }

  descend() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.play('triangle', this.midiToFreq(26), 2.5, 0.1, this.midiToFreq(14));
    this.noise(t, 2.5, 0.05, 300, 'lowpass', 1, true);

    setTimeout(() => {
      if (!this.ctx) return;
      this.synthChoir(this.midiToFreq(50), this.ctx.currentTime, 3.0, 0.05);
    }, 200);
  }

  forgeEnter() {
    if (!this.ctx) return;
    this.play('triangle', 200, 0.15, 0.06, 100);
    this.noise(this.ctx.currentTime, 0.6, 0.03, 3000, 'highpass', 1, true);
    setTimeout(() => {
      if (!this.ctx) return;
      this.synthTubularBell(this.midiToFreq(74), this.ctx.currentTime, 0.08);
      this.synthLute(this.midiToFreq(62), this.ctx.currentTime, 0.06);
    }, 60);
  }

  grimoireEnter() {
    if (!this.ctx) return;
    this.noise(this.ctx.currentTime, 0.5, 0.04, 1200, 'bandpass', 0.8, true);
    setTimeout(() => {
      if (!this.ctx) return;
      this.synthChoir(this.midiToFreq(50), this.ctx.currentTime, 2.0, 0.05);
      this.synthTubularBell(this.midiToFreq(57), this.ctx.currentTime, 0.06);
    }, 120);
  }

  dungeonEnter() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // Massive stone door grinding open
    this.synthKick(t, 0.2);
    this.noise(t, 1.2, 0.1, 300, 'lowpass', 2, true); // Deep stone scrape
    this.synthBrassStab(this.midiToFreq(38), t, 0.15, true); // Ominous low D swell

    setTimeout(() => {
      if (!this.ctx) return;
      // The door slams shut behind you
      const impactTime = this.ctx.currentTime;
      this.synthKick(impactTime, 0.25);
      this.synthBrassStab(this.midiToFreq(50), impactTime, 0.2, false); // Hard D Impact
      this.synthChoir(this.midiToFreq(38), impactTime, 3.0, 0.1); // Echoing voices
      this.synthTubularBell(this.midiToFreq(50), impactTime, 0.08); // Distant bell
    }, 800);
  }
}

export const SFX = new AudioEngine();
