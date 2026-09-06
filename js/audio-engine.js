/**
 * StudioMaster Pro - Audio Engine Core
 * Coordinates Master Bus, Aux FX, Multi-Track Synchronization & Recording Streams.
 */

import { AudioEffects } from './audio-effects.js';
import { AudioChannel } from './audio-channel.js';

export class AudioEngine {
  constructor() {
    // AudioContext created immediately (starts in suspended or running state)
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioCtx({ latencyHint: 'interactive' });

    // Channels Collection
    this.channels = [];
    this.channelIdCounter = 1;

    // Master DSP Nodes
    this.masterBus = null;
    this.masterEQ = null;
    this.masterCompressor = null;
    this.masterLimiter = null;
    this.masterFader = null;

    // Aux Return FX
    this.auxReverbBus = null;
    this.reverbNode = null;
    this.reverbReturnFader = null;

    this.auxDelayBus = null;
    this.delayNode = null;
    this.delayReturnFader = null;

    // Analysers & Metering
    this.masterAnalyser = null;
    this.masterAnalyserL = null;
    this.masterAnalyserR = null;
    this.recordDestination = null;

    // Transport & Playback State
    this.isPlaying = false;
    this.isPaused = false;
    this.isLooping = false;
    this.currentTime = 0;
    this.totalDuration = 0;
    this.bpm = 120;
    this.metronomeActive = false;
    this.metronomeInterval = null;

    // Live Mic Stream
    this.micStream = null;
    this.micSourceNode = null;
    this.micActive = false;

    // Setup Master Graph Immediately
    this.setupMasterGraph();
    this.isInitialized = true;
  }

  /**
   * Resume Web Audio Context if suspended
   */
  async init() {
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  setupMasterGraph() {
    const ctx = this.ctx;
    if (!ctx) return;

    // Master Bus Summing Entry
    this.masterBus = ctx.createGain();
    this.masterBus.gain.value = 1.0;

    // 1. Setup Aux 1: Algorithmic Convolution Reverb
    this.auxReverbBus = ctx.createGain();
    this.reverbNode = ctx.createConvolver();
    this.reverbNode.buffer = AudioEffects.createReverbImpulse(ctx, 2.5, 2.2);
    this.reverbReturnFader = ctx.createGain();
    this.reverbReturnFader.gain.value = 0.8;

    this.auxReverbBus.connect(this.reverbNode);
    this.reverbNode.connect(this.reverbReturnFader);
    this.reverbReturnFader.connect(this.masterBus);

    // 2. Setup Aux 2: Stereo Ping-Pong Delay
    this.auxDelayBus = ctx.createGain();
    this.delayNode = AudioEffects.createStereoDelay(ctx);
    this.delayReturnFader = ctx.createGain();
    this.delayReturnFader.gain.value = 0.7;

    this.auxDelayBus.connect(this.delayNode.input);
    this.delayNode.output.connect(this.delayReturnFader);
    this.delayReturnFader.connect(this.masterBus);

    // 3. Master 5-Band Graphic EQ
    this.masterEQ = AudioEffects.createMasterGraphicEQ(ctx);

    // 4. Master Bus Compressor (Glue Compressor)
    this.masterCompressor = ctx.createDynamicsCompressor();
    this.masterCompressor.threshold.value = -12;
    this.masterCompressor.knee.value = 12;
    this.masterCompressor.ratio.value = 3;
    this.masterCompressor.attack.value = 0.03;
    this.masterCompressor.release.value = 0.15;

    // 5. Master Brickwall Limiter
    this.masterLimiter = ctx.createDynamicsCompressor();
    this.masterLimiter.threshold.value = -0.5;
    this.masterLimiter.knee.value = 0;
    this.masterLimiter.ratio.value = 20;
    this.masterLimiter.attack.value = 0.001;
    this.masterLimiter.release.value = 0.05;

    // 6. Master Volume Fader
    this.masterFader = ctx.createGain();
    this.masterFader.gain.value = 1.0;

    // 7. Master Analysers (FFT 2048 for high-res spectrum + Stereo Goniometer)
    this.masterAnalyser = ctx.createAnalyser();
    this.masterAnalyser.fftSize = 2048;
    this.masterAnalyser.smoothingTimeConstant = 0.85;

    const masterSplitter = ctx.createChannelSplitter(2);
    this.masterAnalyserL = ctx.createAnalyser();
    this.masterAnalyserR = ctx.createAnalyser();
    this.masterAnalyserL.fftSize = 512;
    this.masterAnalyserR.fftSize = 512;

    // 8. Stream Destination for live mix recording
    this.recordDestination = ctx.createMediaStreamDestination();

    // Connect Master Chain:
    // MasterBus -> MasterEQ -> Compressor -> Limiter -> MasterFader -> Output & Analysers & Record
    this.masterBus.connect(this.masterEQ.input);
    this.masterEQ.output.connect(this.masterCompressor);
    this.masterCompressor.connect(this.masterLimiter);
    this.masterLimiter.connect(this.masterFader);

    this.masterFader.connect(ctx.destination);
    this.masterFader.connect(this.masterAnalyser);
    this.masterFader.connect(this.recordDestination);

    this.masterFader.connect(masterSplitter);
    masterSplitter.connect(this.masterAnalyserL, 0);
    masterSplitter.connect(this.masterAnalyserR, 1);
  }

  /**
   * Add a new channel strip to the mixer
   */
  addChannel(name, options = {}) {
    const id = this.channelIdCounter++;
    const channel = new AudioChannel(id, name, this, options);
    this.channels.push(channel);
    this.updateDuration();
    return channel;
  }

  /**
   * Remove a channel
   */
  removeChannel(id) {
    const index = this.channels.findIndex(ch => ch.id === id);
    if (index !== -1) {
      const channel = this.channels[index];
      channel.stop();
      this.channels.splice(index, 1);
      this.updateSoloState();
      this.updateDuration();
    }
  }

  updateSoloState() {
    this.channels.forEach(ch => ch.updateOutputState());
  }

  updateDuration() {
    let max = 0;
    this.channels.forEach(ch => {
      if (ch.audioBuffer && ch.audioBuffer.duration > max) {
        max = ch.audioBuffer.duration;
      }
    });
    this.totalDuration = max;
  }

  setMasterEQBand(bandIdx, gainDb) {
    if (this.masterEQ && this.masterEQ.filters[bandIdx] && this.ctx) {
      this.masterEQ.filters[bandIdx].gain.setTargetAtTime(gainDb, this.ctx.currentTime, 0.02);
    }
  }

  setMasterGain(gainLinear) {
    if (this.masterFader && this.ctx) {
      this.masterFader.gain.setTargetAtTime(gainLinear, this.ctx.currentTime, 0.015);
    }
  }

  setAuxReverbDecay(decay) {
    if (this.reverbNode && this.ctx) {
      this.reverbNode.buffer = AudioEffects.createReverbImpulse(this.ctx, 2.5, decay);
    }
  }

  setAuxDelayTime(timeSec) {
    if (this.delayNode) {
      this.delayNode.setDelayTime(timeSec, timeSec * 1.25);
    }
  }

  setAuxDelayFeedback(amount) {
    if (this.delayNode) {
      this.delayNode.setFeedback(amount);
    }
  }

  play() {
    this.init();
    if (this.isPlaying) return;

    this.channels.forEach(ch => {
      ch.play(this.currentTime);
    });

    this.isPlaying = true;
    this.isPaused = false;
    this.playbackStartWallTime = performance.now() - this.currentTime * 1000;
  }

  pause() {
    if (!this.isPlaying) return;
    this.currentTime = (performance.now() - this.playbackStartWallTime) / 1000;
    this.channels.forEach(ch => ch.stop());
    this.isPlaying = false;
    this.isPaused = true;
  }

  stop() {
    this.channels.forEach(ch => ch.stop());
    this.isPlaying = false;
    this.isPaused = false;
    this.currentTime = 0;
  }

  seek(targetTime) {
    const safeTime = Math.max(0, Math.min(this.totalDuration || 60, targetTime));
    this.currentTime = safeTime;
    if (this.isPlaying) {
      this.channels.forEach(ch => {
        ch.play(this.currentTime);
      });
      this.playbackStartWallTime = performance.now() - this.currentTime * 1000;
    }
  }

  getCurrentPlayhead() {
    if (this.isPlaying) {
      const current = (performance.now() - this.playbackStartWallTime) / 1000;
      if (this.totalDuration > 0 && current >= this.totalDuration) {
        if (this.isLooping) {
          this.seek(0);
          return 0;
        } else {
          this.stop();
          return 0;
        }
      }
      this.currentTime = current;
      return current;
    }
    return this.currentTime;
  }

  async toggleMicrophone(channelTarget) {
    await this.init();

    if (this.micActive) {
      if (this.micStream) {
        this.micStream.getTracks().forEach(t => t.stop());
        this.micStream = null;
      }
      this.micActive = false;
      return false;
    }

    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          autoGainControl: false,
          noiseSuppression: false,
          latency: 0
        }
      });

      this.micSourceNode = this.ctx.createMediaStreamSource(this.micStream);
      if (channelTarget) {
        channelTarget.sourceType = 'mic';
        this.micSourceNode.connect(channelTarget.inputNode);
      } else if (this.channels[0]) {
        this.channels[0].sourceType = 'mic';
        this.micSourceNode.connect(this.channels[0].inputNode);
      }
      this.micActive = true;
      return true;
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Tidak dapat mengakses mikrofon: ' + err.message);
      this.micActive = false;
      return false;
    }
  }

  toggleMetronome(bpm = this.bpm) {
    this.bpm = bpm;
    this.metronomeActive = !this.metronomeActive;
    if (this.metronomeActive) {
      this.startMetronome();
    } else {
      clearInterval(this.metronomeInterval);
      this.metronomeInterval = null;
    }
    return this.metronomeActive;
  }

  startMetronome() {
    if (this.metronomeInterval) clearInterval(this.metronomeInterval);
    const intervalMs = (60 / this.bpm) * 1000;
    let beat = 0;

    this.metronomeInterval = setInterval(() => {
      if (this.ctx) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.value = beat % 4 === 0 ? 1200 : 800;
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

        osc.connect(gain);
        gain.connect(this.masterBus);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.06);
        beat++;
      }
    }, intervalMs);
  }
}
