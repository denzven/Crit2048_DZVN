/**
 * Advanced Audio Engine: Procedural synthesis and BGM for Crit 2048
 * Vibe: Intentional Dark Fantasy (Purposeful layers, Harmonically integrated SFX, Seamless transitions)
 */
export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private reverb: ConvolverNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isMusicPlaying = false;
  private volume: number = 0.5;
  private lastPlayTime: Map<string, number> = new Map();

  // --- Seamless Transition States ---
  private currentMode: string = 'MENU';
  private intensity: number = 0;

  // Smooth faders for continuous crossfading
  private fadeMenu = 1.0;
  private fadeTavern = 0.0;
  private fadeDungeon = 0.0;
  private fadeForge = 0.0;
  private fadeGrimoire = 0.0;

  private targetBpm = 95;
  private currentBpm = 95;
  private beatCount = 0;
  private musicInterval: any = null;

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.connect(this.masterGain);

    this.musicGain = this.ctx.createGain();
    this.musicGain.connect(this.masterGain);
    this.musicGain.gain.value = 0.6;

    this.reverb = this.ctx.createConvolver();
    this.createReverb();

    this.setVolume(this.volume);

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private async createReverb() {
    if (!this.ctx) return;
    // A rich, warm acoustic hall (1.5s tail)
    const length = this.ctx.sampleRate * 1.5;
    const buffer = this.ctx.createBuffer(2, length, this.ctx.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        // Smooth exponential decay, low-passed to prevent harshness
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.25));
      }
    }
    this.reverb!.buffer = buffer;
    this.sfxGain!.connect(this.reverb!);

    const musicReverbSend = this.ctx.createGain();
    musicReverbSend.gain.value = 0.35;
    this.musicGain!.connect(musicReverbSend);
    musicReverbSend.connect(this.reverb!);

    this.reverb!.connect(this.masterGain!);
  }

  setVolume(vol: number) {
    this.volume = vol;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(vol, this.ctx!.currentTime, 0.1);
    }
  }

  private throttle(name: string, ms: number): boolean {
    const now = Date.now();
    const last = this.lastPlayTime.get(name) || 0;
    if (now - last < ms) return false;
    this.lastPlayTime.set(name, now);
    return true;
  }

  // --- CORE SYNTHESIS UTILS ---

  private play(type: OscillatorType, freq: number, time: number, vol = 0.1, slideFreq: number | null = null, useReverb = false) {
    if (!this.ctx || !this.sfxGain || this.volume <= 0 || vol <= 0.005) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    if (slideFreq) osc.frequency.exponentialRampToValueAtTime(slideFreq, this.ctx.currentTime + time);

    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(vol, this.ctx.currentTime + 0.01); // Avoid clicking
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + time);

    osc.connect(gain);
    gain.connect(useReverb ? this.reverb! : this.sfxGain);
    osc.start(); osc.stop(this.ctx.currentTime + time);
  }

  private noise(t: number, duration: number, vol = 0.1, filterFreq = 1000, type: BiquadFilterType = 'bandpass', q = 1, isSfx = false) {
    if (!this.ctx || this.volume <= 0 || vol <= 0.005) return;
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

    noiseSrc.connect(filter); filter.connect(gain);
    gain.connect(isSfx ? this.sfxGain! : this.musicGain!);
    noiseSrc.start(t);
  }

  // --- INTENTIONAL INSTRUMENT PATCHES ---

  private synthDronePad(freq: number, t: number, duration: number, vol: number) {
    if (!this.ctx || vol <= 0.01) return;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const f = this.ctx.createBiquadFilter();

    osc1.type = 'triangle';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(freq, t);
    osc2.frequency.setValueAtTime(freq * 1.002, t);

    f.type = 'lowpass';
    f.frequency.setValueAtTime(600, t);
    f.frequency.exponentialRampToValueAtTime(300, t + duration);

    g.gain.setValueAtTime(0.001, t);
    g.gain.linearRampToValueAtTime(vol, t + duration * 0.4);
    g.gain.linearRampToValueAtTime(0.001, t + duration);

    osc1.connect(f); osc2.connect(f);
    f.connect(g); g.connect(this.musicGain!);
    osc1.start(t); osc1.stop(t + duration);
    osc2.start(t); osc2.stop(t + duration);
  }

  private synthChoir(freq: number, t: number, duration: number, vol: number) {
    if (!this.ctx || vol <= 0.01) return;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const f1 = this.ctx.createBiquadFilter();

    osc1.type = 'sawtooth'; osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq, t);
    osc2.frequency.setValueAtTime(freq * 0.998, t);

    f1.type = 'bandpass'; f1.frequency.value = 800; f1.Q.value = 2.0;

    g.gain.setValueAtTime(0.001, t);
    g.gain.linearRampToValueAtTime(vol, t + duration * 0.3);
    g.gain.setValueAtTime(vol, t + duration * 0.7);
    g.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc1.connect(f1); osc2.connect(f1);
    f1.connect(g); g.connect(this.musicGain!);
    osc1.start(t); osc1.stop(t + duration);
    osc2.start(t); osc2.stop(t + duration);
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
      g.gain.exponentialRampToValueAtTime(0.001, t + (3.0 / (i + 1)));

      osc.connect(g); g.connect(this.musicGain!);
      osc.start(t); osc.stop(t + 3.0);
    });
  }

  private synthBrassStab(freq: number, t: number, vol: number, swell = false) {
    if (!this.ctx || vol <= 0.01) return;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const f = this.ctx.createBiquadFilter();

    osc1.type = 'sawtooth'; osc2.type = 'sawtooth';
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

    osc1.connect(f); osc2.connect(f);
    f.connect(g); g.connect(this.musicGain!);
    osc1.start(t); osc1.stop(t + 0.8);
    osc2.start(t); osc2.stop(t + 0.8);
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

    osc.connect(f); f.connect(g); g.connect(this.musicGain!);
    osc.start(t); osc.stop(t + 0.6);
  }

  private synthLute(freq: number, t: number, vol: number) {
    if (!this.ctx || vol <= 0.01) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const f = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, t);

    f.type = 'lowpass';
    f.frequency.setValueAtTime(4000, t);
    f.frequency.exponentialRampToValueAtTime(300, t + 0.2);

    g.gain.setValueAtTime(0.001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(f); f.connect(g); g.connect(this.musicGain!);
    osc.start(t); osc.stop(t + 0.4);

    this.noise(t, 0.02, vol * 0.2, 3000, 'highpass', 1);
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

    osc.connect(g); g.connect(this.musicGain!);
    osc.start(t); osc.stop(t + 0.3);

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
      osc.type = 'triangle'; osc.frequency.setValueAtTime(200, t);
      osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
      g.gain.setValueAtTime(vol * 0.8, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.connect(g); g.connect(this.musicGain!); osc.start(t); osc.stop(t + 0.1);
    }
  }

  private midiToFreq(m: number) { return Math.pow(2, (m - 69) / 12) * 440; }

  // --- SEAMLESS SEQUENCER ENGINE ---

  setMusicMode(mode: string, intensity: number = 0) {
    const isMenu = ['MENU', 'START', 'CLASS_SELECT'].includes(mode);
    const wasMenu = ['MENU', 'START', 'CLASS_SELECT', 'FORGE', 'GRIMOIRE'].includes(this.currentMode);
    
    // Reset sequencer to bar 1 when returning to menu from dungeon
    if (isMenu && !wasMenu) {
      this.beatCount = 0;
    }

    this.currentMode = mode;
    this.intensity = intensity;

    if (mode === 'MENU' || mode === 'START') this.targetBpm = 95;
    else if (mode === 'TAVERN') this.targetBpm = 105;
    else if (mode === 'GRIMOIRE') this.targetBpm = 85;
    else if (mode === 'FORGE') this.targetBpm = 100;
    else this.targetBpm = 115 + (intensity * 4);

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
    this.targetBpm = 115 + (this.intensity * 4) + Math.min(20, (multiplier - 1) * 3);
  }

  private playSequence() {
    if (!this.ctx || !this.isMusicPlaying) return;

    const nextBeat = () => {
      if (!this.isMusicPlaying) return;

      // 1. SMOOTH INTERPOLATIONS
      this.currentBpm += (this.targetBpm - this.currentBpm) * 0.1;

      const isMenu = ['MENU', 'START', 'CLASS_SELECT'].includes(this.currentMode);
      const isDungeon = ['PLAYING', 'DICE', 'SPELL'].includes(this.currentMode);
      const isForge = this.currentMode === 'FORGE';
      const isGrimoire = this.currentMode === 'GRIMOIRE';

      this.fadeMenu += ((isMenu ? 1 : 0) - this.fadeMenu) * 0.05;
      this.fadeTavern += ((this.currentMode === 'TAVERN' ? 1 : 0) - this.fadeTavern) * 0.05;
      this.fadeDungeon += ((isDungeon ? 1 : 0) - this.fadeDungeon) * 0.05;
      this.fadeForge += ((isForge ? 1 : 0) - this.fadeForge) * 0.05;
      this.fadeGrimoire += ((isGrimoire ? 1 : 0) - this.fadeGrimoire) * 0.05;

      const secondsPerBeat = 60 / this.currentBpm;
      const stepTime = secondsPerBeat / 4;
      const step = this.beatCount % 16;
      const bar = Math.floor(this.beatCount / 16) % 8;

      // Light, organic swing applied globally
      const swingDelay = (step % 2 !== 0) ? stepTime * 0.15 : 0;
      const t = this.ctx!.currentTime + 0.05 + swingDelay;

      // 2. LAYER DISPATCHER
      this.playUniversalDrone(t, bar, step);

      if (this.fadeMenu > 0.01) this.playMenuLayers(t, bar, step, this.fadeMenu);
      if (this.fadeTavern > 0.01) this.playTavernLayers(t, bar, step, this.fadeTavern);
      if (this.fadeDungeon > 0.01) this.playDungeonLayers(t, bar, step, this.fadeDungeon);
      if (this.fadeForge > 0.01) this.playForgeLayers(t, bar, step, this.fadeForge);
      if (this.fadeGrimoire > 0.01) this.playGrimoireLayers(t, bar, step, this.fadeGrimoire);

      this.beatCount++;
      this.musicInterval = setTimeout(nextBeat, stepTime * 1000);
    };

    nextBeat();
  }

  // --- LAYER DEFINITIONS ---

  private playUniversalDrone(t: number, bar: number, step: number) {
    // The anchor. Key of D Minor (Root = 50)
    if (step === 0 && bar % 2 === 0) {
      this.synthDronePad(this.midiToFreq(38), t, 6.0, 0.025); // Deep D2
    }
  }

  private playMenuLayers(t: number, bar: number, step: number, fade: number) {
    const chords = [
      [50, 53, 57, 62], // Dm
      [48, 52, 55, 60], // C
      [46, 50, 53, 58], // Bb
      [45, 49, 52, 57]  // A
    ];
    const chord = chords[bar % 4];

    if (step === 0) this.synthAcousticBass(this.midiToFreq(chord[0] - 12), t, 0.1 * fade);

    if (step % 2 === 0) {
      const noteIdx = (step / 2) % 4;
      this.synthLute(this.midiToFreq(chord[noteIdx]), t, 0.08 * fade);
    }

    if (step === 0) this.synthChoir(this.midiToFreq(chord[0] + 12), t, 4.0, 0.04 * fade);
  }

  private playTavernLayers(t: number, bar: number, step: number, fade: number) {
    const chords = [
      [53, 57, 60, 65], // F
      [48, 52, 55, 60], // C
      [50, 53, 57, 62], // Dm
      [46, 50, 53, 58]  // Bb
    ];
    const chord = chords[bar % 4];

    if (step === 0 || step === 8) this.synthAcousticBass(this.midiToFreq(chord[0] - 12), t, 0.1 * fade);

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
      [48, 55, 60]  // C
    ];
    const chord = chords[bar % 4];

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
      [51, 55, 58, 62]
    ];
    const chord = chords[bar % 4];

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

  private playDungeonLayers(t: number, bar: number, step: number, fade: number) {
    const chords = [
      [50, 53, 57, 62], // Dm
      [46, 50, 53, 58], // Bb
      [43, 46, 50, 55], // Gm
      [45, 49, 52, 57]  // A7
    ];
    const chord = chords[bar % 4];

    if (step === 0) {
      this.synthAcousticBass(this.midiToFreq(chord[0] - 12), t, 0.12 * fade);
      this.synthChoir(this.midiToFreq(chord[0]), t, 2.0, 0.03 * fade);
    }
    if (step === 0 || step === 6) {
      this.synthKick(t, 0.12 * fade);
    }

    if (this.intensity >= 1) {
      if (step % 2 === 0) {
        const pattern = [0, 2, 3, 2, 0, 2, 3, 2];
        const noteIdx = pattern[step / 2];
        const vol = (step === 0 || step === 8) ? 0.08 : 0.05;
        this.synthLute(this.midiToFreq(chord[noteIdx]), t, vol * fade);
      }
    }

    if (this.intensity >= 2) {
      if (step === 4 || step === 12) this.synthPercussion(t, 0.08 * fade, 'SNARE');
      if (step % 4 === 2) this.synthPercussion(t, 0.04 * fade, 'SHAKER');
      if (step === 14) this.synthLute(this.midiToFreq(chord[3] + 12), t, 0.08 * fade);
    }

    if (this.intensity >= 3) {
      if (step === 0 || step === 8) {
        this.synthBrassStab(this.midiToFreq(chord[0]), t, 0.1 * fade, false);
      }
      if (bar % 2 === 0) {
        if (step === 0) this.synthTubularBell(this.midiToFreq(chord[3] + 12), t, 0.06 * fade);
        if (step === 6) this.synthTubularBell(this.midiToFreq(chord[2] + 12), t, 0.04 * fade);
      }
    }
  }

  // --- HARMONICALLY INTEGRATED SFX ---
  // All sound effects are physically modeled and tuned to D Minor (D, E, F, G, A, Bb, C)

  btnClick() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // Clean, tactile UI stone/wood tap
    this.play('sine', 800, 0.02, 0.06, 200); // Fast pitch drop for a satisfying "thwack"
    this.noise(t, 0.02, 0.03, 1500, 'bandpass', 1, true); // Subtle physical texture
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
    osc.connect(g); g.connect(this.sfxGain!);
    osc.start(t); osc.stop(t + 0.1);
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
    osc.connect(g); g.connect(this.sfxGain!);
    osc.start(t); osc.stop(t + 0.25);
  }

  diceClatter() {
    if (!this.ctx) return;
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        this.play('triangle', 400 + Math.random() * 200, 0.03, 0.02, 200);
      }, i * 35 + Math.random() * 20);
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
    if (!this.throttle('coin', 100) || !this.ctx) return;
    const t = this.ctx.currentTime;
    this.play('sine', 1174.66, 0.15, 0.03, 1174.66);
    setTimeout(() => this.play('sine', 1760.00, 0.2, 0.03, 1760.00), 50);
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
      if (this.ctx && this.musicGain) this.musicGain.gain.setTargetAtTime(0.6, this.ctx.currentTime, 2.0);
    }, 3500);
  }

  encounterWin() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
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
      setTimeout(() => {
        if (!this.ctx) return;
        this.synthChoir(this.midiToFreq(note), this.ctx.currentTime, 2.5, 0.1);
      }, 800 + (i * 700));
    });

    // Final echoing death toll in the abyss
    setTimeout(() => {
      if (!this.ctx) return;
      this.synthTubularBell(this.midiToFreq(38), this.ctx.currentTime, 0.2); // Low D bell
      this.synthAcousticBass(this.midiToFreq(26), this.ctx.currentTime, 0.2); // Sub D
    }, 800 + (descent.length * 700));
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