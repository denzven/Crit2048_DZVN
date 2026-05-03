import { MASTER_ARTIFACTS } from './data';

/**
 * SFX Engine: Procedural audio synthesis for Crit 2048
 */
class AudioEngine {
  private ctx: AudioContext | null = null;
  private volume: number = 0.5;

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(vol: number) {
    this.volume = vol;
  }

  private play(type: OscillatorType, freq: number, time: number, vol = 0.1, slideFreq: number | null = null) {
    if (!this.ctx || this.volume <= 0) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    if (slideFreq) {
      osc.frequency.exponentialRampToValueAtTime(slideFreq, this.ctx.currentTime + time);
    }
    
    gain.gain.setValueAtTime(vol * this.volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + time);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + time);
  }

  private noise(time: number, vol = 0.1, filterFreq = 1000) {
    if (!this.ctx || this.volume <= 0) return;
    
    const bufferSize = this.ctx.sampleRate * time;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    
    const noiseSrc = this.ctx.createBufferSource();
    noiseSrc.buffer = buffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq;
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol * this.volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + time);
    
    noiseSrc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    
    noiseSrc.start();
  }

  slide() { this.play('sine', 200, 0.1, 0.05, 100); }
  merge() {
    this.play('square', 400, 0.1, 0.03, 800);
    setTimeout(() => this.play('sine', 800, 0.15, 0.03), 40);
  }
  hit() {
    this.noise(0.4, 0.4, 200);
    this.play('triangle', 80, 0.4, 0.4, 30);
  }
  diceClatter() {
    this.noise(0.08, 0.15, 1500);
    this.play('square', 400, 0.03, 0.05, 200);
  }
  crit() {
    this.play('triangle', 440, 0.2, 0.2);
    setTimeout(() => this.play('triangle', 554, 0.2, 0.2), 100);
    setTimeout(() => this.play('triangle', 659, 0.6, 0.2), 200);
  }
  fail() {
    this.play('sawtooth', 150, 0.4, 0.15, 80);
    setTimeout(() => this.play('sawtooth', 100, 0.5, 0.15, 50), 200);
  }
  coin() {
    this.play('sine', 1200, 0.1, 0.03, 2000);
    setTimeout(() => this.play('sine', 1600, 0.2, 0.03, 2400), 80);
  }
  powerUp() {
    this.play('sine', 400, 0.5, 0.1, 800);
    setTimeout(() => this.play('square', 600, 0.5, 0.1, 1200), 100);
  }
}

export const SFX = new AudioEngine();
