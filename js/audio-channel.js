/**
 * StudioMaster Pro - Audio Channel Strip Class
 * Represents a single multi-track channel with complete DSP chain.
 */

import { AudioEffects } from './audio-effects.js';

export class AudioChannel {
  constructor(id, name, audioEngine, options = {}) {
    this.id = id;
    this.name = name || `CH ${id}`;
    this.engine = audioEngine;
    this.ctx = audioEngine.ctx;
    this.color = options.color || '#3b82f6';
    this.sourceType = options.sourceType || 'file'; // 'file', 'mic', 'synth'

    // Audio Buffer / Source
    this.audioBuffer = null;
    this.sourceNode = null;
    this.isPlaying = false;
    this.playbackOffset = 0;
    this.startedAt = 0;

    // Channel State Parameters
    this.gain = 1.0; // Linear gain (0 to 2)
    this.trim = 0.0; // dB (-24 to +24)
    this.pan = 0.0; // -1 (Left) to +1 (Right)
    this.lowCutFreq = 20; // 20Hz - 400Hz
    this.lowCutEnabled = false;
    
    // 3-Band EQ
    this.eqLow = 0; // dB (-15 to +15)
    this.eqMid = 0; // dB (-15 to +15)
    this.eqMidFreq = 1000; // Hz (200 - 8000)
    this.eqHigh = 0; // dB (-15 to +15)
    this.eqBypass = false;

    // Channel Compressor
    this.compEnabled = false;
    this.compThreshold = -24; // dB
    this.compRatio = 4; // 1:1 to 20:1
    this.compAttack = 0.01; // sec
    this.compRelease = 0.25; // sec

    // Aux Sends
    this.sendReverb = 0.0; // 0 to 1
    this.sendDelay = 0.0; // 0 to 1

    // Switches
    this.isMuted = false;
    this.isSolo = false;
    this.isRecArmed = false;
    this.phaseInvert = false;

    // Metering
    this.peakL = 0;
    this.peakR = 0;
    this.peakHoldL = 0;
    this.peakHoldR = 0;

    this.initDspNodes();
  }

  initDspNodes() {
    const ctx = this.ctx;

    // Channel Entry & Preamp Trim
    this.inputNode = ctx.createGain();
    this.trimNode = ctx.createGain();

    // Low-Cut / High-Pass Filter
    this.lowCutNode = ctx.createBiquadFilter();
    this.lowCutNode.type = 'highpass';
    this.lowCutNode.frequency.value = 20;
    this.lowCutNode.Q.value = 0.707;

    // 3-Band Semi-Parametric EQ
    this.eq = AudioEffects.createChannelEQ(ctx);

    // Channel Compressor
    this.compressorNode = ctx.createDynamicsCompressor();
    this.compressorNode.threshold.value = this.compThreshold;
    this.compressorNode.ratio.value = this.compRatio;
    this.compressorNode.attack.value = this.compAttack;
    this.compressorNode.release.value = this.compRelease;

    // Phase Invert Node (Gain -1)
    this.phaseNode = ctx.createGain();
    this.phaseNode.gain.value = 1.0;

    // Stereo Panner
    this.pannerNode = ctx.createStereoPanner();
    this.pannerNode.pan.value = 0;

    // Main Channel Fader & Mute Gate
    this.faderNode = ctx.createGain();
    this.faderNode.gain.value = 1.0;

    this.muteGate = ctx.createGain();
    this.muteGate.gain.value = 1.0;

    // Aux Sends
    this.reverbSendNode = ctx.createGain();
    this.reverbSendNode.gain.value = 0.0;

    this.delaySendNode = ctx.createGain();
    this.delaySendNode.gain.value = 0.0;

    // Stereo Splitter & Analysers for VU Metering
    this.splitter = ctx.createChannelSplitter(2);
    this.analyserL = ctx.createAnalyser();
    this.analyserR = ctx.createAnalyser();
    this.analyserL.fftSize = 256;
    this.analyserR.fftSize = 256;
    this.analyserL.smoothingTimeConstant = 0.4;
    this.analyserR.smoothingTimeConstant = 0.4;

    this.dataArrayL = new Uint8Array(this.analyserL.frequencyBinCount);
    this.dataArrayR = new Uint8Array(this.analyserR.frequencyBinCount);

    // --- Connect Signal Chain ---
    // Input -> Trim -> LowCut -> EQ -> Compressor -> Phase -> Panner -> Fader -> MuteGate
    this.inputNode.connect(this.trimNode);
    this.trimNode.connect(this.lowCutNode);
    this.lowCutNode.connect(this.eq.input);
    this.eq.output.connect(this.compressorNode);
    this.compressorNode.connect(this.phaseNode);
    this.phaseNode.connect(this.pannerNode);
    this.pannerNode.connect(this.faderNode);
    this.faderNode.connect(this.muteGate);

    // MuteGate -> Master Bus
    this.muteGate.connect(this.engine.masterBus);

    // Fader -> Aux Sends
    this.faderNode.connect(this.reverbSendNode);
    this.reverbSendNode.connect(this.engine.auxReverbBus);

    this.faderNode.connect(this.delaySendNode);
    this.delaySendNode.connect(this.engine.auxDelayBus);

    // Split signal for Channel VU Meter
    this.muteGate.connect(this.splitter);
    this.splitter.connect(this.analyserL, 0);
    this.splitter.connect(this.analyserR, 1);
  }

  setTrim(db) {
    this.trim = Math.max(-24, Math.min(24, db));
    const lin = AudioEffects.dbToGain(this.trim);
    this.trimNode.gain.setTargetAtTime(lin, this.ctx.currentTime, 0.015);
  }

  setLowCut(enabled, freq = this.lowCutFreq) {
    this.lowCutEnabled = enabled;
    this.lowCutFreq = Math.max(20, Math.min(400, freq));
    this.lowCutNode.frequency.setTargetAtTime(
      enabled ? this.lowCutFreq : 20,
      this.ctx.currentTime,
      0.02
    );
  }

  setEQLow(db) {
    this.eqLow = Math.max(-15, Math.min(15, db));
    this.eq.lowShelf.gain.setTargetAtTime(
      this.eqBypass ? 0 : this.eqLow,
      this.ctx.currentTime,
      0.015
    );
  }

  setEQMid(db, freq = this.eqMidFreq) {
    this.eqMid = Math.max(-15, Math.min(15, db));
    this.eqMidFreq = Math.max(200, Math.min(8000, freq));
    this.eq.midPeak.gain.setTargetAtTime(
      this.eqBypass ? 0 : this.eqMid,
      this.ctx.currentTime,
      0.015
    );
    this.eq.midPeak.frequency.setTargetAtTime(
      this.eqMidFreq,
      this.ctx.currentTime,
      0.015
    );
  }

  setEQHigh(db) {
    this.eqHigh = Math.max(-15, Math.min(15, db));
    this.eq.highShelf.gain.setTargetAtTime(
      this.eqBypass ? 0 : this.eqHigh,
      this.ctx.currentTime,
      0.015
    );
  }

  setEQBypass(bypass) {
    this.eqBypass = bypass;
    this.setEQLow(this.eqLow);
    this.setEQMid(this.eqMid, this.eqMidFreq);
    this.setEQHigh(this.eqHigh);
  }

  setCompressor(enabled, threshold = this.compThreshold, ratio = this.compRatio) {
    this.compEnabled = enabled;
    this.compThreshold = threshold;
    this.compRatio = ratio;
    this.compressorNode.threshold.setTargetAtTime(
      enabled ? threshold : 0,
      this.ctx.currentTime,
      0.02
    );
    this.compressorNode.ratio.setTargetAtTime(
      enabled ? ratio : 1,
      this.ctx.currentTime,
      0.02
    );
  }

  setPan(val) {
    this.pan = Math.max(-1, Math.min(1, val));
    this.pannerNode.pan.setTargetAtTime(this.pan, this.ctx.currentTime, 0.015);
  }

  setGain(linearGain) {
    this.gain = Math.max(0, Math.min(2.0, linearGain));
    this.faderNode.gain.setTargetAtTime(this.gain, this.ctx.currentTime, 0.015);
  }

  setSendReverb(amount) {
    this.sendReverb = Math.max(0, Math.min(1.0, amount));
    this.reverbSendNode.gain.setTargetAtTime(this.sendReverb, this.ctx.currentTime, 0.02);
  }

  setSendDelay(amount) {
    this.sendDelay = Math.max(0, Math.min(1.0, amount));
    this.delaySendNode.gain.setTargetAtTime(this.sendDelay, this.ctx.currentTime, 0.02);
  }

  setMute(isMuted) {
    this.isMuted = isMuted;
    this.updateOutputState();
  }

  setSolo(isSolo) {
    this.isSolo = isSolo;
    this.engine.updateSoloState();
  }

  setPhaseInvert(invert) {
    this.phaseInvert = invert;
    this.phaseNode.gain.setTargetAtTime(invert ? -1.0 : 1.0, this.ctx.currentTime, 0.01);
  }

  updateOutputState() {
    const hasActiveSolo = this.engine.channels.some(ch => ch.isSolo);
    let shouldOutput = !this.isMuted;

    if (hasActiveSolo) {
      shouldOutput = shouldOutput && this.isSolo;
    }

    const targetGain = shouldOutput ? 1.0 : 0.0;
    this.muteGate.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.01);
  }

  /**
   * Load an audio file/buffer into this channel
   */
  async loadAudioBuffer(buffer) {
    this.audioBuffer = buffer;
    this.sourceType = 'file';
  }

  play(offset = 0) {
    if (!this.audioBuffer || this.sourceType !== 'file') return;

    this.stop();

    this.sourceNode = this.ctx.createBufferSource();
    this.sourceNode.buffer = this.audioBuffer;
    this.sourceNode.connect(this.inputNode);

    const safeOffset = Math.min(offset, this.audioBuffer.duration);
    this.sourceNode.start(0, safeOffset);
    this.startedAt = this.ctx.currentTime - safeOffset;
    this.playbackOffset = safeOffset;
    this.isPlaying = true;

    this.sourceNode.onended = () => {
      this.isPlaying = false;
    };
  }

  stop() {
    if (this.sourceNode) {
      try {
        this.sourceNode.stop();
        this.sourceNode.disconnect();
      } catch (e) {
        // Node already stopped
      }
      this.sourceNode = null;
    }
    this.isPlaying = false;
  }

  /**
   * Compute Real-time Peak & RMS for VU Meter
   */
  getVUMeterLevels() {
    this.analyserL.getByteFrequencyData(this.dataArrayL);
    this.analyserR.getByteFrequencyData(this.dataArrayR);

    let maxL = 0;
    let maxR = 0;

    for (let i = 0; i < this.dataArrayL.length; i++) {
      if (this.dataArrayL[i] > maxL) maxL = this.dataArrayL[i];
      if (this.dataArrayR[i] > maxR) maxR = this.dataArrayR[i];
    }

    const levelL = maxL / 255;
    const levelR = maxR / 255;

    // Decay ballistics
    this.peakL = Math.max(levelL, this.peakL * 0.88);
    this.peakR = Math.max(levelR, this.peakR * 0.88);

    if (levelL > this.peakHoldL) this.peakHoldL = levelL;
    else this.peakHoldL *= 0.96;

    if (levelR > this.peakHoldR) this.peakHoldR = levelR;
    else this.peakHoldR *= 0.96;

    return {
      left: this.peakL,
      right: this.peakR,
      holdLeft: this.peakHoldL,
      holdRight: this.peakHoldR,
      isClipping: levelL > 0.98 || levelR > 0.98
    };
  }
}
