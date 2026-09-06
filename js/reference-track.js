/**
 * StudioMaster Pro - A/B Reference Track Comparison Hub
 * Allows switching between Live Mix (A) and Commercial Reference (B) with auto gain matching
 */

export class ReferenceTrack {
  constructor(engine, app) {
    this.engine = engine;
    this.app = app;
    this.refAudioBuffer = null;
    this.refSourceNode = null;
    this.refGainNode = null;
    this.activeMode = 'A'; // 'A' = Mix, 'B' = Reference
    this.refVolume = 1.0;
    this.gainMatchDb = 0;
    this.isPlaying = false;

    this.initRefGraph();
  }

  initRefGraph() {
    const ctx = this.engine.ctx;
    this.refGainNode = ctx.createGain();
    this.refGainNode.gain.value = 1.0;
    this.refGainNode.connect(ctx.destination);
  }

  async loadReferenceFile(file) {
    const arrayBuffer = await file.arrayBuffer();
    this.refAudioBuffer = await this.engine.ctx.decodeAudioData(arrayBuffer);
    this.calculateLoudnessMatch();
    return true;
  }

  calculateLoudnessMatch() {
    if (!this.refAudioBuffer) return;
    const channelData = this.refAudioBuffer.getChannelData(0);
    let sumSquares = 0;
    for (let i = 0; i < channelData.length; i += 8) {
      sumSquares += channelData[i] * channelData[i];
    }
    const rms = Math.sqrt(sumSquares / (channelData.length / 8));
    const refRmsDb = 20 * Math.log10(rms || 0.0001);

    // Target ~ -14dB standard commercial level
    this.gainMatchDb = Math.max(-6, Math.min(6, -14 - refRmsDb));
  }

  toggleAB() {
    if (!this.refAudioBuffer) {
      this.app.showToast('Muat file audio referensi terlebih dahulu!', 'warn');
      return 'A';
    }

    this.activeMode = this.activeMode === 'A' ? 'B' : 'A';
    const ctx = this.engine.ctx;
    const now = ctx.currentTime;

    if (this.activeMode === 'B') {
      // Mute Mix (A) and Play Reference (B)
      this.engine.masterFader.gain.setTargetAtTime(0, now, 0.02);
      this.playRefTrack();
      this.app.showToast('🎵 Mode B: Memutar Lagu Referensi', 'info');
    } else {
      // Unmute Mix (A) and Stop Reference (B)
      this.stopRefTrack();
      this.engine.masterFader.gain.setTargetAtTime(1.0, now, 0.02);
      this.app.showToast('🎛️ Mode A: Memutar Live Mixdown Anda', 'success');
    }
    return this.activeMode;
  }

  playRefTrack() {
    this.stopRefTrack();
    if (!this.refAudioBuffer) return;

    this.refSourceNode = this.engine.ctx.createBufferSource();
    this.refSourceNode.buffer = this.refAudioBuffer;
    this.refSourceNode.loop = true;

    // Apply volume with gain match
    const linearGain = Math.pow(10, (this.gainMatchDb) / 20) * this.refVolume;
    this.refGainNode.gain.value = linearGain;

    this.refSourceNode.connect(this.refGainNode);
    this.refSourceNode.start(0, this.engine.getCurrentPlayhead() % this.refAudioBuffer.duration);
    this.isPlaying = true;
  }

  stopRefTrack() {
    if (this.refSourceNode) {
      try { this.refSourceNode.stop(); } catch (e) {}
      this.refSourceNode = null;
    }
    this.isPlaying = false;
  }
}
