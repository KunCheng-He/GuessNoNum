// Simple synth using Web Audio API
class AudioController {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContext();
    } catch (e) {
      console.warn('Web Audio API not supported');
      this.enabled = false;
    }
  }

  private ensureContext() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq: number, type: OscillatorType, duration: number, startTime: number = 0) {
    if (!this.enabled || !this.ctx) return;
    this.ensureContext();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);
    
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + startTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(this.ctx.currentTime + startTime);
    osc.stop(this.ctx.currentTime + startTime + duration);
  }

  playClick() {
    this.playTone(800, 'sine', 0.05);
  }

  playDelete() {
    this.playTone(400, 'triangle', 0.05);
  }

  playSuccess() {
    // Victory fanfare
    const now = 0;
    this.playTone(523.25, 'sine', 0.2, now); // C5
    this.playTone(659.25, 'sine', 0.2, now + 0.2); // E5
    this.playTone(783.99, 'sine', 0.4, now + 0.4); // G5
    this.playTone(1046.50, 'sine', 0.6, now + 0.6); // C6
  }

  playGoodGuess() {
    // Pleasant chime
    this.playTone(600, 'sine', 0.3);
    this.playTone(900, 'sine', 0.5, 0.1);
  }

  playBadGuess() {
    // Low thud
    this.playTone(150, 'sawtooth', 0.3);
  }

  playError() {
    this.playTone(100, 'sawtooth', 0.2);
  }
}

export const audioController = new AudioController();
