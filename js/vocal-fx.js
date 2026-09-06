/**
 * StudioMaster Pro - Vocal FX Suite (Autotune, Noise Gate, De-Esser, Chorus)
 */

export class VocalFx {
  /**
   * Create a Real-time Noise Gate Node Chain
   */
  static createNoiseGate(audioCtx, thresholdDb = -45) {
    const input = audioCtx.createGain();
    const gateGain = audioCtx.createGain();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;

    input.connect(gateGain);
    input.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let isGateOpen = true;
    let gateTimer = null;

    const thresholdNorm = Math.pow(10, thresholdDb / 20) * 255;

    // Fast envelope follower for gate
    gateTimer = setInterval(() => {
      analyser.getByteFrequencyData(dataArray);
      let maxVal = 0;
      for (let i = 0; i < dataArray.length; i++) {
        if (dataArray[i] > maxVal) maxVal = dataArray[i];
      }

      const shouldOpen = maxVal > thresholdNorm * 0.4;
      if (shouldOpen !== isGateOpen) {
        isGateOpen = shouldOpen;
        const target = isGateOpen ? 1.0 : 0.0;
        gateGain.gain.setTargetAtTime(target, audioCtx.currentTime, isGateOpen ? 0.005 : 0.08);
      }
    }, 20);

    return {
      input,
      output: gateGain,
      gateGain,
      setThreshold(db) {
        thresholdDb = db;
      },
      destroy() {
        if (gateTimer) clearInterval(gateTimer);
      }
    };
  }

  /**
   * Create a Dynamic Vocal De-Esser (Notch Compressor around 6.5kHz)
   */
  static createDeEsser(audioCtx, sensitivity = 0.5) {
    const input = audioCtx.createGain();
    const output = audioCtx.createGain();

    // Sidechain bandpass detector
    const bandpass = audioCtx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 6500;
    bandpass.Q.value = 2.0;

    // Dynamic notch reduction filter
    const notchFilter = audioCtx.createBiquadFilter();
    notchFilter.type = 'peaking';
    notchFilter.frequency.value = 6500;
    notchFilter.Q.value = 2.5;
    notchFilter.gain.value = 0;

    const comp = audioCtx.createDynamicsCompressor();
    comp.threshold.value = -28 * sensitivity;
    comp.knee.value = 6;
    comp.ratio.value = 8;
    comp.attack.value = 0.002;
    comp.release.value = 0.05;

    input.connect(notchFilter);
    notchFilter.connect(output);

    input.connect(bandpass);
    bandpass.connect(comp);

    return {
      input,
      output,
      notchFilter,
      setAmount(amount) { // 0.0 to 1.0
        const gainCut = -amount * 12; // up to -12dB cut on harsh sibilance
        notchFilter.gain.setTargetAtTime(gainCut, audioCtx.currentTime, 0.02);
      }
    };
  }

  /**
   * Create a Stereo Chorus / Modulation Processor
   */
  static createChorus(audioCtx, rateHz = 1.5, depthMs = 3.5) {
    const input = audioCtx.createGain();
    const output = audioCtx.createGain();
    const dryGain = audioCtx.createGain();
    const wetGain = audioCtx.createGain();

    dryGain.gain.value = 0.7;
    wetGain.gain.value = 0.7;

    const delayL = audioCtx.createDelay(0.1);
    const delayR = audioCtx.createDelay(0.1);
    delayL.delayTime.value = 0.025;
    delayR.delayTime.value = 0.030;

    // LFO Oscillators for delay modulation
    const lfoL = audioCtx.createOscillator();
    const lfoR = audioCtx.createOscillator();
    const lfoGainL = audioCtx.createGain();
    const lfoGainR = audioCtx.createGain();

    lfoL.frequency.value = rateHz;
    lfoR.frequency.value = rateHz * 1.15; // Stereo detune
    lfoGainL.gain.value = depthMs / 1000;
    lfoGainR.gain.value = depthMs / 1000;

    lfoL.connect(lfoGainL);
    lfoGainL.connect(delayL.delayTime);

    lfoR.connect(lfoGainR);
    lfoGainR.connect(delayR.delayTime);

    lfoL.start();
    lfoR.start();

    // Connect audio signal
    input.connect(dryGain);
    dryGain.connect(output);

    input.connect(delayL);
    input.connect(delayR);

    const merger = audioCtx.createChannelMerger(2);
    delayL.connect(merger, 0, 0);
    delayR.connect(merger, 0, 1);
    merger.connect(wetGain);
    wetGain.connect(output);

    return {
      input,
      output,
      setMix(wetRatio) {
        wetGain.gain.setTargetAtTime(wetRatio, audioCtx.currentTime, 0.02);
        dryGain.gain.setTargetAtTime(1.0 - wetRatio * 0.5, audioCtx.currentTime, 0.02);
      },
      setRate(hz) {
        lfoL.frequency.setTargetAtTime(hz, audioCtx.currentTime, 0.02);
        lfoR.frequency.setTargetAtTime(hz * 1.15, audioCtx.currentTime, 0.02);
      }
    };
  }

  /**
   * Musical Scales Frequency Tables for Vocal Pitch Correction (Autotune)
   */
  static getScaleFrequencies(scaleType = 'chromatic', rootNote = 'C') {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const rootIndex = noteNames.indexOf(rootNote);

    const scaleIntervals = {
      'chromatic': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      'major': [0, 2, 4, 5, 7, 9, 11],
      'minor': [0, 2, 3, 5, 7, 8, 10],
      'pentatonic': [0, 2, 4, 7, 9]
    };

    const intervals = scaleIntervals[scaleType] || scaleIntervals['major'];
    const validNotes = new Set();
    intervals.forEach(interval => {
      validNotes.add((rootIndex + interval) % 12);
    });

    const freqs = [];
    // Generate scale across octave 1 to 7
    for (let midi = 24; midi <= 96; midi++) {
      const noteClass = midi % 12;
      if (validNotes.has(noteClass)) {
        freqs.push(440 * Math.pow(2, (midi - 69) / 12));
      }
    }
    return freqs;
  }
}
