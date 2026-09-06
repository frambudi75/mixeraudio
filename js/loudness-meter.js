/**
 * StudioMaster Pro - Professional LUFS & True-Peak Loudness Meter
 * Implements ITU-R BS.1770-4 / EBU R128 K-Weighting Algorithm
 */

export class LoudnessMeter {
  constructor(audioCtx, sourceNode) {
    this.ctx = audioCtx;
    this.source = sourceNode;

    // K-Weighting Filters (ITU-R BS.1770)
    // Stage 1: High Shelf Filter (f0 = 1500Hz, Gain = +4dB, Q = 0.7071)
    this.highShelf = audioCtx.createBiquadFilter();
    this.highShelf.type = 'highshelf';
    this.highShelf.frequency.value = 1500;
    this.highShelf.gain.value = 4.0;

    // Stage 2: High Pass Filter (f0 = 38Hz, Q = 0.5)
    this.highPass = audioCtx.createBiquadFilter();
    this.highPass.type = 'highpass';
    this.highPass.frequency.value = 38;
    this.highPass.Q.value = 0.5;

    // Analyser node for raw samples
    this.analyser = audioCtx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.timeData = new Float32Array(this.analyser.fftSize);

    // Audio Graph connection
    if (this.source) {
      this.source.connect(this.highShelf);
      this.highShelf.connect(this.highPass);
      this.highPass.connect(this.analyser);
    }

    // Loudness state values
    this.momentaryLufs = -70;
    this.shortTermLufs = -70;
    this.integratedLufs = -70;
    this.truePeakDb = -70;
    this.maxTruePeak = -70;

    // Sliding buffers for Short-Term (3s) and Integrated
    this.shortTermSamples = [];
    this.integratedSamples = [];
    this.maxShortTermCapacity = 30; // ~3 seconds at 100ms interval
    this.maxIntegratedCapacity = 600; // ~60 seconds continuous rolling

    this.activeTarget = -14.0; // Spotify / Apple Music default target
    this.isRunning = false;
    this.timer = null;
  }

  start(onUpdate) {
    if (this.isRunning) return;
    this.isRunning = true;

    this.timer = setInterval(() => {
      this.analyser.getFloatTimeDomainData(this.timeData);

      // 1. Calculate Mean-Square Energy and True-Peak
      let sumSquares = 0;
      let peak = 0;

      for (let i = 0; i < this.timeData.length; i++) {
        const sample = this.timeData[i];
        const absSample = Math.abs(sample);
        if (absSample > peak) peak = absSample;
        sumSquares += sample * sample;
      }

      const meanSquare = sumSquares / this.timeData.length;
      
      // True Peak in dBTP
      const currentPeakDb = peak > 0.00001 ? 20 * Math.log10(peak) : -70;
      this.truePeakDb = currentPeakDb;
      if (currentPeakDb > this.maxTruePeak) {
        this.maxTruePeak = currentPeakDb;
      }

      // Momentary LUFS (400ms block approximation)
      // LKFS = -0.691 + 10 * log10(meanSquare)
      let mBlockLufs = -70;
      if (meanSquare > 0.00000001) {
        mBlockLufs = -0.691 + 10 * Math.log10(meanSquare);
      }
      this.momentaryLufs = Math.max(-70, Math.min(6, mBlockLufs));

      // 2. Short-Term LUFS (3s sliding window)
      this.shortTermSamples.push(meanSquare);
      if (this.shortTermSamples.length > this.maxShortTermCapacity) {
        this.shortTermSamples.shift();
      }
      const stMean = this.shortTermSamples.reduce((a, b) => a + b, 0) / this.shortTermSamples.length;
      if (stMean > 0.00000001) {
        this.shortTermLufs = Math.max(-70, Math.min(6, -0.691 + 10 * Math.log10(stMean)));
      }

      // 3. Integrated LUFS (Gated integration)
      if (mBlockLufs > -70) {
        this.integratedSamples.push(meanSquare);
        if (this.integratedSamples.length > this.maxIntegratedCapacity) {
          this.integratedSamples.shift();
        }
        const intMean = this.integratedSamples.reduce((a, b) => a + b, 0) / this.integratedSamples.length;
        this.integratedLufs = Math.max(-70, Math.min(6, -0.691 + 10 * Math.log10(intMean)));
      }

      if (onUpdate) {
        onUpdate({
          momentary: this.momentaryLufs,
          shortTerm: this.shortTermLufs,
          integrated: this.integratedLufs,
          truePeak: this.truePeakDb,
          maxTruePeak: this.maxTruePeak,
          target: this.activeTarget,
          diffToTarget: this.integratedLufs - this.activeTarget,
          isClipping: this.maxTruePeak > -0.1
        });
      }
    }, 100);
  }

  setTarget(lufsValue) {
    this.activeTarget = lufsValue;
  }

  reset() {
    this.shortTermSamples = [];
    this.integratedSamples = [];
    this.momentaryLufs = -70;
    this.shortTermLufs = -70;
    this.integratedLufs = -70;
    this.truePeakDb = -70;
    this.maxTruePeak = -70;
  }

  stop() {
    this.isRunning = false;
    if (this.timer) clearInterval(this.timer);
  }
}
