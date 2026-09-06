/**
 * StudioMaster Pro - Audio DSP & Effects Module
 * Provides Reverb, Delay, Multi-Band EQ, Compressors, and Dynamics processors.
 */

export class AudioEffects {
  /**
   * Create an algorithmic studio impulse response for Convolution Reverb
   */
  static createReverbImpulse(audioCtx, duration = 2.5, decay = 2.0, reverse = false) {
    const sampleRate = audioCtx.sampleRate;
    const length = sampleRate * duration;
    const impulse = audioCtx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = reverse ? length - i : i;
      // Exponential decay with random stereo noise
      const envelope = Math.pow(1 - n / length, decay);
      left[i] = (Math.random() * 2 - 1) * envelope;
      right[i] = (Math.random() * 2 - 1) * envelope;
    }

    return impulse;
  }

  /**
   * Create a 3-Band Parametric Channel EQ Node Set
   */
  static createChannelEQ(audioCtx) {
    // Low Shelf (80Hz)
    const lowShelf = audioCtx.createBiquadFilter();
    lowShelf.type = 'lowshelf';
    lowShelf.frequency.value = 80;
    lowShelf.gain.value = 0;

    // Mid Peaking with Sweepable Freq (default 1000Hz, Q=1.2)
    const midPeak = audioCtx.createBiquadFilter();
    midPeak.type = 'peaking';
    midPeak.frequency.value = 1000;
    midPeak.Q.value = 1.2;
    midPeak.gain.value = 0;

    // High Shelf (10kHz)
    const highShelf = audioCtx.createBiquadFilter();
    highShelf.type = 'highshelf';
    highShelf.frequency.value = 10000;
    highShelf.gain.value = 0;

    // Connect Low -> Mid -> High
    lowShelf.connect(midPeak);
    midPeak.connect(highShelf);

    return {
      input: lowShelf,
      output: highShelf,
      lowShelf,
      midPeak,
      highShelf
    };
  }

  /**
   * Create a 5-Band Master Graphic EQ
   */
  static createMasterGraphicEQ(audioCtx) {
    const freqs = [60, 250, 1000, 4000, 12000];
    const filters = freqs.map((freq, idx) => {
      const filter = audioCtx.createBiquadFilter();
      if (idx === 0) {
        filter.type = 'lowshelf';
      } else if (idx === freqs.length - 1) {
        filter.type = 'highshelf';
      } else {
        filter.type = 'peaking';
        filter.Q.value = 1.4;
      }
      filter.frequency.value = freq;
      filter.gain.value = 0;
      return filter;
    });

    // Chain the 5 filters in series
    for (let i = 0; i < filters.length - 1; i++) {
      filters[i].connect(filters[i + 1]);
    }

    return {
      input: filters[0],
      output: filters[filters.length - 1],
      filters
    };
  }

  /**
   * Create a Studio Stereo Tape Delay with Feedback and Damping Filter
   */
  static createStereoDelay(audioCtx) {
    const input = audioCtx.createGain();
    const delayL = audioCtx.createDelay(2.0);
    const delayR = audioCtx.createDelay(2.0);
    const feedbackL = audioCtx.createGain();
    const feedbackR = audioCtx.createGain();
    const dampFilter = audioCtx.createBiquadFilter();
    const merger = audioCtx.createChannelMerger(2);
    const output = audioCtx.createGain();

    delayL.delayTime.value = 0.35;
    delayR.delayTime.value = 0.50;
    feedbackL.gain.value = 0.4;
    feedbackR.gain.value = 0.4;

    dampFilter.type = 'lowpass';
    dampFilter.frequency.value = 3500;

    // Cross feedback / Ping-Pong routing
    input.connect(delayL);
    input.connect(delayR);

    delayL.connect(feedbackL);
    feedbackL.connect(dampFilter);
    dampFilter.connect(delayR); // Cross to R

    delayR.connect(feedbackR);
    feedbackR.connect(delayL); // Cross to L

    delayL.connect(merger, 0, 0);
    delayR.connect(merger, 0, 1);
    merger.connect(output);

    return {
      input,
      output,
      delayL,
      delayR,
      feedbackL,
      feedbackR,
      dampFilter,
      setDelayTime(timeL, timeR = timeL * 1.25) {
        delayL.delayTime.setTargetAtTime(timeL, audioCtx.currentTime, 0.02);
        delayR.delayTime.setTargetAtTime(timeR, audioCtx.currentTime, 0.02);
      },
      setFeedback(amount) {
        const val = Math.min(0.9, Math.max(0, amount));
        feedbackL.gain.setTargetAtTime(val, audioCtx.currentTime, 0.02);
        feedbackR.gain.setTargetAtTime(val, audioCtx.currentTime, 0.02);
      }
    };
  }

  /**
   * Create a 4-Band Stem Crossover Splitter (Vocal, Bass, Drums, Instruments)
   */
  static createStemCrossover(audioCtx) {
    const input = audioCtx.createGain();
    const output = audioCtx.createGain();

    // 1. Bass / Low Stem (< 180 Hz)
    const bassFilter = audioCtx.createBiquadFilter();
    bassFilter.type = 'lowpass';
    bassFilter.frequency.value = 180;
    const bassGain = audioCtx.createGain();
    bassGain.gain.value = 1.0;
    input.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(output);

    // 2. Vocal / Mid Stem (250Hz - 3800Hz)
    const vocalHp = audioCtx.createBiquadFilter();
    vocalHp.type = 'highpass';
    vocalHp.frequency.value = 220;
    const vocalLp = audioCtx.createBiquadFilter();
    vocalLp.type = 'lowpass';
    vocalLp.frequency.value = 3800;
    const vocalGain = audioCtx.createGain();
    vocalGain.gain.value = 1.0;
    input.connect(vocalHp);
    vocalHp.connect(vocalLp);
    vocalLp.connect(vocalGain);
    vocalGain.connect(output);

    // 3. Instruments / Mid-High Stem (500Hz - 8000Hz)
    const instHp = audioCtx.createBiquadFilter();
    instHp.type = 'highpass';
    instHp.frequency.value = 600;
    const instLp = audioCtx.createBiquadFilter();
    instLp.type = 'lowpass';
    instLp.frequency.value = 7500;
    const instGain = audioCtx.createGain();
    instGain.gain.value = 1.0;
    input.connect(instHp);
    instHp.connect(instLp);
    instLp.connect(instGain);
    instGain.connect(output);

    // 4. Drums / Air / Transient Stem (> 7500Hz)
    const drumFilter = audioCtx.createBiquadFilter();
    drumFilter.type = 'highpass';
    drumFilter.frequency.value = 7500;
    const drumGain = audioCtx.createGain();
    drumGain.gain.value = 1.0;
    input.connect(drumFilter);
    drumFilter.connect(drumGain);
    drumGain.connect(output);

    return {
      input,
      output,
      stems: {
        bass: { gain: bassGain, muted: false, solo: false },
        vocal: { gain: vocalGain, muted: false, solo: false },
        inst: { gain: instGain, muted: false, solo: false },
        drums: { gain: drumGain, muted: false, solo: false }
      },
      setStemGain(stemName, val) {
        if (this.stems[stemName]) {
          this.stems[stemName].gain.gain.setTargetAtTime(val, audioCtx.currentTime, 0.02);
        }
      },
      toggleMute(stemName) {
        const s = this.stems[stemName];
        if (!s) return false;
        s.muted = !s.muted;
        s.gain.gain.setTargetAtTime(s.muted ? 0 : 1.0, audioCtx.currentTime, 0.02);
        return s.muted;
      }
    };
  }

  /**
   * Convert linear gain (0 to 2) to decibels (-inf to +6dB)
   */
  static gainToDb(gain) {
    if (gain <= 0.0001) return -Infinity;
    return 20 * Math.log10(gain);
  }

  /**
   * Convert decibels (-60 to +10dB) to linear gain (0 to 3.16)
   */
  static dbToGain(db) {
    if (db <= -60) return 0;
    return Math.pow(10, db / 20);
  }
}

