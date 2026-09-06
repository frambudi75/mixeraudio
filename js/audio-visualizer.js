/**
 * StudioMaster Pro - Real-Time Audio Visualizers Suite
 * 60FPS FFT Spectrum Analyzer, Stereo Phase Goniometer, and LED VU Meter Ballistics.
 */

export class AudioVisualizer {
  constructor(engine) {
    this.engine = engine;
    this.animationFrameId = null;

    // Canvas Elements
    this.spectrumCanvas = null;
    this.spectrumCtx = null;
    this.vectorscopeCanvas = null;
    this.vectorscopeCtx = null;
    this.timelineCanvas = null;
    this.timelineCtx = null;

    // Spectrum Peak Hold Arrays
    this.peakHoldFreq = [];
    this.spectrumDataArray = null;

    // Vectorscope Time Data
    this.timeDataL = null;
    this.timeDataR = null;

    // Master VU Meter Peaks
    this.masterPeakL = 0;
    this.masterPeakR = 0;
    this.masterPeakHoldL = 0;
    this.masterPeakHoldR = 0;
  }

  init(spectrumCanvas, vectorscopeCanvas, timelineCanvas) {
    this.spectrumCanvas = spectrumCanvas;
    if (spectrumCanvas) this.spectrumCtx = spectrumCanvas.getContext('2d');

    this.vectorscopeCanvas = vectorscopeCanvas;
    if (vectorscopeCanvas) this.vectorscopeCtx = vectorscopeCanvas.getContext('2d');

    this.timelineCanvas = timelineCanvas;
    if (timelineCanvas) this.timelineCtx = timelineCanvas.getContext('2d');

    this.startLoop();
  }

  startLoop() {
    const loop = () => {
      this.drawSpectrum();
      this.drawVectorscope();
      this.updateAllVUMeters();
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  stopLoop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Draw Master FFT Spectrum Analyzer
   */
  drawSpectrum() {
    if (!this.spectrumCanvas || !this.spectrumCtx || !this.engine.masterAnalyser) return;

    const canvas = this.spectrumCanvas;
    const ctx = this.spectrumCtx;
    const analyser = this.engine.masterAnalyser;

    const width = canvas.width = canvas.offsetWidth * window.devicePixelRatio || 400;
    const height = canvas.height = canvas.offsetHeight * window.devicePixelRatio || 180;

    const bufferLength = analyser.frequencyBinCount;
    if (!this.spectrumDataArray || this.spectrumDataArray.length !== bufferLength) {
      this.spectrumDataArray = new Uint8Array(bufferLength);
      this.peakHoldFreq = new Float32Array(bufferLength);
    }

    analyser.getByteFrequencyData(this.spectrumDataArray);

    // Clear Background
    ctx.fillStyle = '#07090d';
    ctx.fillRect(0, 0, width, height);

    // Grid lines (dB & Freq)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let y = 0; y < height; y += height / 4) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Gradient for FFT bars
    const grad = ctx.createLinearGradient(0, height, 0, 0);
    grad.addColorStop(0, '#06b6d4');
    grad.addColorStop(0.5, '#3b82f6');
    grad.addColorStop(0.8, '#8b5cf6');
    grad.addColorStop(1.0, '#ef4444');

    const barCount = 64;
    const barWidth = (width / barCount) - 2;

    for (let i = 0; i < barCount; i++) {
      // Logarithmic index mapping for natural octave distribution
      const logIndex = Math.floor(Math.pow(i / barCount, 2.2) * (bufferLength * 0.7));
      const val = this.spectrumDataArray[logIndex] || 0;
      const barHeight = (val / 255) * (height - 10);
      const x = i * (barWidth + 2);
      const y = height - barHeight;

      // Draw Main Bar
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Peak Hold Line
      if (barHeight > this.peakHoldFreq[i]) {
        this.peakHoldFreq[i] = barHeight;
      } else {
        this.peakHoldFreq[i] = Math.max(0, this.peakHoldFreq[i] - 1.2);
      }

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, height - this.peakHoldFreq[i] - 2, barWidth, 2);
    }
  }

  /**
   * Draw Stereo Phase Goniometer / Vectorscope (Lissajous XY)
   */
  drawVectorscope() {
    if (!this.vectorscopeCanvas || !this.vectorscopeCtx || !this.engine.masterAnalyserL || !this.engine.masterAnalyserR) return;

    const canvas = this.vectorscopeCanvas;
    const ctx = this.vectorscopeCtx;
    const analyserL = this.engine.masterAnalyserL;
    const analyserR = this.engine.masterAnalyserR;

    const width = canvas.width = canvas.offsetWidth * window.devicePixelRatio || 300;
    const height = canvas.height = canvas.offsetHeight * window.devicePixelRatio || 180;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.42;

    const bufferLength = analyserL.fftSize;
    if (!this.timeDataL || this.timeDataL.length !== bufferLength) {
      this.timeDataL = new Float32Array(bufferLength);
      this.timeDataR = new Float32Array(bufferLength);
    }

    analyserL.getFloatTimeDomainData(this.timeDataL);
    analyserR.getFloatTimeDomainData(this.timeDataR);

    // Clear background
    ctx.fillStyle = '#05080c';
    ctx.fillRect(0, 0, width, height);

    // Draw Scope Circle & Reticle
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.moveTo(centerX - radius, centerY);
    ctx.lineTo(centerX + radius, centerY);
    ctx.moveTo(centerX, centerY - radius);
    ctx.lineTo(centerX, centerY + radius);
    ctx.stroke();

    // 45 degree phase diagonal lines (M/S)
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
    ctx.beginPath();
    ctx.moveTo(centerX - radius * 0.7, centerY - radius * 0.7);
    ctx.lineTo(centerX + radius * 0.7, centerY + radius * 0.7);
    ctx.moveTo(centerX - radius * 0.7, centerY + radius * 0.7);
    ctx.lineTo(centerX + radius * 0.7, centerY - radius * 0.7);
    ctx.stroke();

    // Draw XY Lissajous Beam
    ctx.strokeStyle = '#06b6d4';
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 6;
    ctx.lineWidth = 1.5;
    ctx.beginPath();

    const step = 4;
    for (let i = 0; i < bufferLength; i += step) {
      const l = this.timeDataL[i];
      const r = this.timeDataR[i];

      // Rotate by 45 degrees: Mid (Vertical) = (L+R)/sqrt(2), Side (Horizontal) = (L-R)/sqrt(2)
      const side = (l - r) * 0.7071;
      const mid = (l + r) * 0.7071;

      const x = centerX + side * radius * 1.6;
      const y = centerY - mid * radius * 1.6;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  /**
   * Update all channel LED segment meters and Master VU meters
   */
  updateAllVUMeters() {
    // 1. Channels Metering
    this.engine.channels.forEach(ch => {
      const levels = ch.getVUMeterLevels();
      const meterEl = document.querySelector(`.vu-meter-container[data-channel-id="${ch.id}"]`);
      if (meterEl) {
        this.renderLedSegments(meterEl, levels.left, levels.right, levels.isClipping);
      }
    });

    // 2. Master VU Meter
    const masterMeterEl = document.getElementById('master-vu-meter');
    if (masterMeterEl && this.engine.masterAnalyserL && this.engine.masterAnalyserR) {
      const levels = this.getMasterVUMeterLevels();
      this.renderLedSegments(masterMeterEl, levels.left, levels.right, levels.isClipping);
    }
  }

  getMasterVUMeterLevels() {
    if (!this.masterDataL) {
      this.masterDataL = new Uint8Array(this.engine.masterAnalyserL.frequencyBinCount);
      this.masterDataR = new Uint8Array(this.engine.masterAnalyserR.frequencyBinCount);
    }

    this.engine.masterAnalyserL.getByteFrequencyData(this.masterDataL);
    this.engine.masterAnalyserR.getByteFrequencyData(this.masterDataR);

    let maxL = 0;
    let maxR = 0;
    for (let i = 0; i < this.masterDataL.length; i++) {
      if (this.masterDataL[i] > maxL) maxL = this.masterDataL[i];
      if (this.masterDataR[i] > maxR) maxR = this.masterDataR[i];
    }

    const levelL = maxL / 255;
    const levelR = maxR / 255;

    this.masterPeakL = Math.max(levelL, this.masterPeakL * 0.88);
    this.masterPeakR = Math.max(levelR, this.masterPeakR * 0.88);

    return {
      left: this.masterPeakL,
      right: this.masterPeakR,
      isClipping: levelL > 0.98 || levelR > 0.98
    };
  }

  /**
   * Activate LED segments based on peak level
   */
  renderLedSegments(containerEl, levelL, levelR, isClipping) {
    const leftCol = containerEl.querySelector('.vu-channel-left');
    const rightCol = containerEl.querySelector('.vu-channel-right');
    if (!leftCol || !rightCol) return;

    const segmentsL = leftCol.querySelectorAll('.vu-led-segment');
    const segmentsR = rightCol.querySelectorAll('.vu-led-segment');
    const totalSegments = segmentsL.length;

    const litL = Math.round(levelL * totalSegments);
    const litR = Math.round(levelR * totalSegments);

    segmentsL.forEach((seg, idx) => {
      seg.classList.toggle('active', idx < litL);
    });

    segmentsR.forEach((seg, idx) => {
      seg.classList.toggle('active', idx < litR);
    });
  }
}
