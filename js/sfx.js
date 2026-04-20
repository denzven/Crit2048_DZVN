// --- CUSTOM WEB AUDIO SFX ENGINE ---
const SFX = (function() {
  let ctx = null;

  function init() { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); }

  function play(type, freq, time, vol=0.1, slideFreq=null) {
    if (!ctx) return; vol *= config.sfxVolume; if (vol <= 0) return;
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.type = type; osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slideFreq) osc.frequency.exponentialRampToValueAtTime(slideFreq, ctx.currentTime + time);
    gain.gain.setValueAtTime(vol, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + time);
    osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + time);
  }

  function noise(time, vol=0.1, filterFreq=1000) {
    if (!ctx) return; vol *= config.sfxVolume; if (vol <= 0) return;
    const bufferSize = ctx.sampleRate * time; const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0); for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noiseSrc = ctx.createBufferSource(); noiseSrc.buffer = buffer;
    const filter = ctx.createBiquadFilter(); filter.type = 'bandpass'; filter.frequency.value = filterFreq;
    const gain = ctx.createGain(); gain.gain.setValueAtTime(vol, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + time);
    noiseSrc.connect(filter); filter.connect(gain); gain.connect(ctx.destination); noiseSrc.start();
  }

  return {
    init,
    slide:       () => play('sine', 200, 0.1, 0.05, 100),
    merge:       () => { play('square', 400, 0.1, 0.03, 800); setTimeout(() => play('sine', 800, 0.15, 0.03), 40); },
    hit:         () => { noise(0.4, 0.4, 200); play('triangle', 80, 0.4, 0.4, 30); },
    diceClatter: () => { noise(0.08, 0.15, 1500); play('square', 400, 0.03, 0.05, 200); },
    crit:        () => { play('triangle', 440, 0.2, 0.2); setTimeout(() => play('triangle', 554, 0.2, 0.2), 100); setTimeout(() => play('triangle', 659, 0.6, 0.2), 200); },
    fail:        () => { play('sawtooth', 150, 0.4, 0.15, 80); setTimeout(() => play('sawtooth', 100, 0.5, 0.15, 50), 200); },
    coin:        () => { play('sine', 1200, 0.1, 0.03, 2000); setTimeout(() => play('sine', 1600, 0.2, 0.03, 2400), 80); },
    powerUp:     () => { play('sine', 400, 0.5, 0.1, 800); setTimeout(() => play('square', 600, 0.5, 0.1, 1200), 100); },
    explosion:   () => { noise(0.6, 0.6, 150); play('square', 100, 0.6, 0.4, 20); },
    beam:        () => { play('sawtooth', 800, 0.4, 0.2, 100); },
    smite:       () => { play('sine', 1200, 0.5, 0.3, 400); play('triangle', 800, 0.5, 0.3, 200); }
  };
})();
