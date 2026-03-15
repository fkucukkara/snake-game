import * as Tone from 'tone';
import { EventManager } from '@/engine/core';

/**
 * AudioManager handles all audio functionality including procedurally generated background music
 * Extends EventManager to emit audio-related events
 */
export class AudioManager extends EventManager {
  private isInitialized: boolean = false;
  private isMuted: boolean = false;
  private volume: number = 0.5;
  private isPlaying: boolean = false;

  // Tone.js instruments for procedural music
  private synth1: Tone.PolySynth | null = null;
  private synth2: Tone.Synth | null = null;
  private bassline: Tone.Synth | null = null;
  private foodImpactSynth: Tone.MonoSynth | null = null;
  private foodBuzzSynth: Tone.NoiseSynth | null = null;
  private masterGain: Tone.Gain | null = null;

  // Tone.js patterns and sequences
  private melodyPart: Tone.Part | null = null;
  private bassPart: Tone.Part | null = null;
  private padPart: Tone.Part | null = null;

  constructor() {
    super();
  }

  /**
   * Initialize the audio system and create procedural music
   * Must be called after user interaction (browser autoplay policy)
   */
  async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Ensure Tone.js audio context is started
      await Tone.start();
      console.log('Audio context started');

      // Create master gain node for volume control
      this.masterGain = new Tone.Gain(this.volume).toDestination();

      // Create synthesizers for different layers
      // Melody synth - bright, bouncy sound for joyful feeling
      this.synth1 = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'square' },
        envelope: {
          attack: 0.01,
          decay: 0.2,
          sustain: 0.3,
          release: 0.5,
        },
        volume: -6,
      }).connect(this.masterGain);

      // Pad synth - warm, supportive background chords
      this.synth2 = new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: {
          attack: 0.8,
          decay: 0.5,
          sustain: 0.7,
          release: 1.5,
        },
        volume: -16,
      }).connect(this.masterGain);

      // Bassline - punchy, energetic foundation
      this.bassline = new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: {
          attack: 0.05,
          decay: 0.2,
          sustain: 0.1,
          release: 0.4,
        },
        volume: -10,
      }).connect(this.masterGain);

      // Food collect impact - punchy synth with a slight buzzing tail
      this.foodImpactSynth = new Tone.MonoSynth({
        oscillator: { type: 'sawtooth' },
        envelope: {
          attack: 0.001,
          decay: 0.12,
          sustain: 0,
          release: 0.16,
        },
        filter: {
          Q: 2,
          type: 'bandpass',
          rolloff: -24,
        },
        filterEnvelope: {
          attack: 0.001,
          decay: 0.08,
          sustain: 0,
          release: 0.1,
          baseFrequency: 180,
          octaves: 3,
        },
        volume: -8,
      }).connect(this.masterGain);

      this.foodBuzzSynth = new Tone.NoiseSynth({
        noise: { type: 'pink' },
        envelope: {
          attack: 0.001,
          decay: 0.07,
          sustain: 0,
          release: 0.04,
        },
        volume: -20,
      }).connect(this.masterGain);

      // Create musical patterns
      this.createMusicPatterns();

      this.isInitialized = true;
      this.emit('audio_initialized');
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }

  /**
   * Create procedural music patterns using Tone.js sequences
   * Creates an upbeat, joyful soundtrack perfect for gameplay
   * Using C major scale (I-V-vi-IV progression) for bright, happy sound
   */
  private createMusicPatterns(): void {
    // Melody pattern - bouncy, playful melody with rhythm
    const melodyPattern = [
      { time: 0, note: 'C5', duration: '8n' },
      { time: '0:0:2', note: 'E5', duration: '8n' },
      { time: '0:1', note: 'G5', duration: '8n' },
      { time: '0:1:2', note: 'E5', duration: '8n' },
      { time: '0:2', note: 'D5', duration: '8n' },
      { time: '0:2:2', note: 'C5', duration: '8n' },
      { time: '0:3', note: 'E5', duration: '4n' },
      
      { time: '1:0', note: 'G5', duration: '8n' },
      { time: '1:0:2', note: 'A4', duration: '8n' },
      { time: '1:1', note: 'C5', duration: '8n' },
      { time: '1:1:2', note: 'D5', duration: '8n' },
      { time: '1:2', note: 'E5', duration: '4n' },
      { time: '1:3', note: 'C5', duration: '8n' },
      { time: '1:3:2', note: 'G4', duration: '8n' },
      
      { time: '2:0', note: 'C5', duration: '8n' },
      { time: '2:0:2', note: 'D5', duration: '8n' },
      { time: '2:1', note: 'E5', duration: '8n' },
      { time: '2:1:2', note: 'G5', duration: '8n' },
      { time: '2:2', note: 'A4', duration: '4n' },
      { time: '2:3', note: 'G4', duration: '4n' },
      
      { time: '3:0', note: 'E5', duration: '8n' },
      { time: '3:0:2', note: 'D5', duration: '8n' },
      { time: '3:1', note: 'C5', duration: '8n' },
      { time: '3:1:2', note: 'E5', duration: '8n' },
      { time: '3:2', note: 'G5', duration: '4n' },
      { time: '3:3', note: 'C5', duration: '4n' },
    ];

    this.melodyPart = new Tone.Part((time, event) => {
      this.synth1?.triggerAttackRelease(event.note, event.duration, time);
    }, melodyPattern).start(0);

    this.melodyPart.loop = true;
    this.melodyPart.loopEnd = '4m'; // 4 measures

    // Pad pattern - supportive chord progression (I-V-vi-IV)
    const padPattern = [
      { time: 0, note: 'C3', duration: '2m' },
      { time: '2m', note: 'G3', duration: '2m' },
    ];

    this.padPart = new Tone.Part((time, event) => {
      this.synth2?.triggerAttackRelease(event.note, event.duration, time);
    }, padPattern).start(0);

    this.padPart.loop = true;
    this.padPart.loopEnd = '4m';

    // Bassline pattern - energetic, driving rhythm
    const bassPattern = [
      { time: 0, note: 'C2', duration: '8n' },
      { time: '0:1', note: 'C2', duration: '8n' },
      { time: '0:2', note: 'G2', duration: '8n' },
      { time: '0:3', note: 'C2', duration: '8n' },
      
      { time: '1:0', note: 'G2', duration: '8n' },
      { time: '1:1', note: 'G2', duration: '8n' },
      { time: '1:2', note: 'C2', duration: '8n' },
      { time: '1:3', note: 'G2', duration: '8n' },
      
      { time: '2:0', note: 'A2', duration: '8n' },
      { time: '2:1', note: 'A2', duration: '8n' },
      { time: '2:2', note: 'E2', duration: '8n' },
      { time: '2:3', note: 'A2', duration: '8n' },
      
      { time: '3:0', note: 'F2', duration: '8n' },
      { time: '3:1', note: 'F2', duration: '8n' },
      { time: '3:2', note: 'C2', duration: '8n' },
      { time: '3:3', note: 'F2', duration: '8n' },
    ];

    this.bassPart = new Tone.Part((time, event) => {
      this.bassline?.triggerAttackRelease(event.note, event.duration, time);
    }, bassPattern).start(0);

    this.bassPart.loop = true;
    this.bassPart.loopEnd = '4m';

    // Set BPM for upbeat, energetic feel
    Tone.Transport.bpm.value = 126;
  }

  /**
   * Start playing the background music
   * Will initialize audio if not already done (requires user interaction)
   */
  async playMusic(): Promise<void> {
    if (!this.isInitialized) {
      await this.init();
    }

    if (!this.isPlaying) {
      Tone.Transport.start();
      this.isPlaying = true;
      this.emit('music_started');
      console.log('Music started');
    }
  }

  /**
   * Pause the background music (preserves position)
   */
  pauseMusic(): void {
    if (this.isPlaying) {
      Tone.Transport.pause();
      this.isPlaying = false;
      this.emit('music_paused');
      console.log('Music paused');
    }
  }

  /**
   * Resume the background music from where it was paused
   */
  resumeMusic(): void {
    if (!this.isPlaying && this.isInitialized) {
      Tone.Transport.start();
      this.isPlaying = true;
      this.emit('music_resumed');
      console.log('Music resumed');
    }
  }

  /**
   * Stop the background music and reset position
   */
  stopMusic(): void {
    if (this.isPlaying) {
      Tone.Transport.stop();
      this.isPlaying = false;
      this.emit('music_stopped');
      console.log('Music stopped');
    }
  }

  /**
   * Play a short impact/buzz sound when the snake eats food
   */
  async playFoodCollectSound(): Promise<void> {
    if (!this.isInitialized) {
      await this.init();
    }

    if (!this.foodImpactSynth || !this.foodBuzzSynth) {
      return;
    }

    const now = Tone.now();

    this.foodImpactSynth.triggerAttackRelease('G2', '32n', now, 0.95);
    this.foodImpactSynth.triggerAttackRelease('D3', '16n', now + 0.045, 0.6);
    this.foodBuzzSynth.triggerAttackRelease('32n', now, 0.45);
  }

  /**
   * Toggle mute state (preserves playback)
   */
  toggleMute(): void {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.rampTo(this.isMuted ? 0 : this.volume, 0.1);
    }
    this.emit('mute_toggled', this.isMuted);
    console.log(`Music ${this.isMuted ? 'muted' : 'unmuted'}`);
  }

  /**
   * Set volume (0 to 1)
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.masterGain && !this.isMuted) {
      this.masterGain.gain.rampTo(this.volume, 0.1);
    }
    this.emit('volume_changed', this.volume);
  }

  /**
   * Get current mute state
   */
  getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Get current playing state
   */
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Clean up audio resources
   */
  destroy(): void {
    this.stopMusic();

    // Stop and dispose all parts
    this.melodyPart?.stop();
    this.melodyPart?.dispose();
    this.bassPart?.stop();
    this.bassPart?.dispose();
    this.padPart?.stop();
    this.padPart?.dispose();

    // Dispose synthesizers
    this.synth1?.dispose();
    this.synth2?.dispose();
    this.bassline?.dispose();
    this.foodImpactSynth?.dispose();
    this.foodBuzzSynth?.dispose();
    this.masterGain?.dispose();

    // Clear references
    this.melodyPart = null;
    this.bassPart = null;
    this.padPart = null;
    this.synth1 = null;
    this.synth2 = null;
    this.bassline = null;
    this.foodImpactSynth = null;
    this.foodBuzzSynth = null;
    this.masterGain = null;

    this.isInitialized = false;
    this.isPlaying = false;

    this.clear();
    console.log('AudioManager destroyed');
  }
}
