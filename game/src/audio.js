export class AudioManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.initialized = false;

    window.addEventListener('user-gesture', () => this.init());
    window.addEventListener('toggle-audio', () => this.toggleMute());
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.initialized = true;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch (e) {
      console.warn('WebAudio not supported:', e);
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    console.log('Audio muted:', this.muted);
  }

  playTone(freq, duration, type = 'sine', gainVal = 0.1) {
    if (this.muted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  playEngine(speedRatio) {
    if (this.muted || !this.ctx) return;
    const freq = 60 + Math.abs(speedRatio) * 180;
    this.playTone(freq, 0.1, 'sawtooth', 0.05);
  }

  playGunshot() {
    this.playTone(300, 0.15, 'square', 0.2);
  }

  playPunch() {
    this.playTone(120, 0.1, 'triangle', 0.25);
  }

  playPickup() {
    if (this.muted || !this.ctx) return;
    this.playTone(587.33, 0.1, 'sine', 0.15);
    setTimeout(() => this.playTone(880, 0.15, 'sine', 0.15), 100);
  }

  playSiren() {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.linearRampToValueAtTime(900, now + 0.3);
    osc.frequency.linearRampToValueAtTime(600, now + 0.6);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.6);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.6);
  }

  playSting() {
    if (this.muted || !this.ctx) return;
    [440, 554.37, 659.25, 880].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 0.2, 'triangle', 0.15), i * 120);
    });
  }

  playUI() {
    this.playTone(800, 0.05, 'sine', 0.08);
  }
}
