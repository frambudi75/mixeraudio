/**
 * StudioMaster Pro - Broadcast Auto-Ducking / Sidechain Processor
 * Automatically reduces music/app audio volume when speech is detected on the Host Microphone.
 */

export class AutoDucking {
  constructor(engine, app) {
    this.engine = engine;
    this.app = app;
    this.isEnabled = false;
    this.duckingAmountDb = -14; // How much music lowers when talking
    this.thresholdDb = -36;     // Voice detection threshold
    this.attackMs = 40;         // How fast music ducks
    this.releaseMs = 800;       // How slow music recovers after speech stops
    this.triggerChannelId = 1;  // Host Voice Channel (CH 1 by default)

    this.analyser = null;
    this.dataArray = null;
    this.duckInterval = null;
    this.isDuckingActive = false;
  }

  init() {
    const ctx = this.engine.ctx;
    if (!ctx) return;

    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
  }

  toggle(enable = !this.isEnabled) {
    this.isEnabled = enable;

    if (this.isEnabled) {
      this.startDetector();
      this.app.showToast('Podcast Auto-Ducking AKTIF: Musik otomatis mengecil saat Anda bicara di Mic!', 'success');
    } else {
      this.stopDetector();
      this.restoreAllVolumes();
      this.app.showToast('Podcast Auto-Ducking dinonaktifkan.', 'info');
    }
    return this.isEnabled;
  }

  startDetector() {
    if (this.duckInterval) clearInterval(this.duckInterval);
    if (!this.analyser) this.init();

    // Connect trigger channel to analyser
    const triggerCh = this.engine.channels.find(c => c.id === this.triggerChannelId) || this.engine.channels[0];
    if (triggerCh && triggerCh.muteGate) {
      triggerCh.muteGate.connect(this.analyser);
    }

    const thresholdNorm = Math.pow(10, this.thresholdDb / 20) * 255;
    const duckGain = Math.pow(10, this.duckingAmountDb / 20);

    this.duckInterval = setInterval(() => {
      if (!this.isEnabled || !this.analyser) return;

      this.analyser.getByteFrequencyData(this.dataArray);
      let max = 0;
      for (let i = 0; i < this.dataArray.length; i++) {
        if (this.dataArray[i] > max) max = this.dataArray[i];
      }

      const voiceSpeaking = max > thresholdNorm;

      if (voiceSpeaking && !this.isDuckingActive) {
        // Duck all other channels
        this.isDuckingActive = true;
        this.applyDuckingToMusic(duckGain, this.attackMs / 1000);
      } else if (!voiceSpeaking && this.isDuckingActive) {
        // Restore music volume smoothly
        this.isDuckingActive = false;
        this.applyDuckingToMusic(1.0, this.releaseMs / 1000);
      }
    }, 40);
  }

  stopDetector() {
    if (this.duckInterval) {
      clearInterval(this.duckInterval);
      this.duckInterval = null;
    }
    this.isDuckingActive = false;
  }

  applyDuckingToMusic(targetRatio, durationSec) {
    const ctx = this.engine.ctx;
    if (!ctx) return;

    this.engine.channels.forEach(ch => {
      // Don't duck the voice channel itself
      if (ch.id === this.triggerChannelId) return;

      if (ch.faderNode) {
        const targetGain = ch.gain * targetRatio;
        ch.faderNode.gain.setTargetAtTime(targetGain, ctx.currentTime, durationSec);
      }
    });
  }

  restoreAllVolumes() {
    const ctx = this.engine.ctx;
    if (!ctx) return;
    this.engine.channels.forEach(ch => {
      if (ch.faderNode) {
        ch.faderNode.gain.setTargetAtTime(ch.gain, ctx.currentTime, 0.1);
      }
    });
  }
}
