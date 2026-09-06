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
    const rootIndex = Math.max(0, noteNames.indexOf(rootNote));

    const scaleIntervals = {
      'chromatic': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      'major': [0, 2, 4, 5, 7, 9, 11],
      'minor': [0, 2, 3, 5, 7, 8, 10],
      'pentatonic': [0, 2, 4, 7, 9],
      'blues': [0, 3, 5, 6, 7, 10],
      'arabic': [0, 1, 4, 5, 7, 8, 11],
      'hirajoshi': [0, 2, 3, 7, 8]
    };

    const intervals = scaleIntervals[scaleType] || scaleIntervals['major'];
    const validNotes = new Set();
    intervals.forEach(interval => {
      validNotes.add((rootIndex + interval) % 12);
    });

    const freqs = [];
    const noteDetails = [];
    // Generate scale across octave 1 to 7 (MIDI 24 to 96)
    for (let midi = 24; midi <= 96; midi++) {
      const noteClass = midi % 12;
      if (validNotes.has(noteClass)) {
        const freq = 440 * Math.pow(2, (midi - 69) / 12);
        const name = noteNames[noteClass] + Math.floor(midi / 12 - 1);
        freqs.push(freq);
        noteDetails.push({ freq, name, midi, noteClass: noteNames[noteClass] });
      }
    }
    return { freqs, noteDetails };
  }

  /**
   * Create Real-Time Pitch Correction / Auto-Tune Processor
   */
  static createAutoTune(audioCtx) {
    const input = audioCtx.createGain();
    const output = audioCtx.createGain();

    // Dry & Wet blend
    const dryGain = audioCtx.createGain();
    const wetGain = audioCtx.createGain();
    dryGain.gain.value = 0.0;
    wetGain.gain.value = 1.0;

    input.connect(dryGain);
    dryGain.connect(output);

    // Filter bank / Resonator array for formant snap
    const preFilter = audioCtx.createBiquadFilter();
    preFilter.type = 'highpass';
    preFilter.frequency.value = 75; // remove rumble

    // Resonator / Harmonic Enhancer
    const formantFilter = audioCtx.createBiquadFilter();
    formantFilter.type = 'peaking';
    formantFilter.frequency.value = 440;
    formantFilter.Q.value = 4.0;
    formantFilter.gain.value = 6.0;

    // Pitch detection analyser
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    input.connect(analyser);

    // Audio routing
    input.connect(preFilter);
    preFilter.connect(formantFilter);
    formantFilter.connect(wetGain);
    wetGain.connect(output);

    let activeScale = 'major';
    let activeRoot = 'C';
    let retuneSpeedMs = 15; // 0ms = robotic T-Pain, 100ms = natural
    let depth = 1.0;
    let enabled = true;
    let onPitchDetected = null;

    let { freqs: validFreqs, noteDetails } = VocalFx.getScaleFrequencies(activeScale, activeRoot);

    // Autocorrelation pitch detector
    const timeBuffer = new Float32Array(analyser.fftSize);
    let detectInterval = null;

    const findClosestScaleFreq = (detectedHz) => {
      if (!detectedHz || detectedHz < 60 || detectedHz > 1600) return null;
      let minDiff = Infinity;
      let bestMatch = null;
      for (let i = 0; i < noteDetails.length; i++) {
        const diff = Math.abs(noteDetails[i].freq - detectedHz);
        if (diff < minDiff) {
          minDiff = diff;
          bestMatch = noteDetails[i];
        }
      }
      return bestMatch;
    };

    // Fast pitch detector loop
    detectInterval = setInterval(() => {
      if (!enabled) return;
      analyser.getFloatTimeDomainData(timeBuffer);

      // Simple root-mean-square to check signal presence
      let rms = 0;
      for (let i = 0; i < timeBuffer.length; i++) {
        rms += timeBuffer[i] * timeBuffer[i];
      }
      rms = Math.sqrt(rms / timeBuffer.length);
      if (rms < 0.015) {
        if (onPitchDetected) onPitchDetected(null);
        return;
      }

      // Autocorrelation
      let bestR = 0;
      let bestOffset = -1;
      const sampleRate = audioCtx.sampleRate;
      const minOffset = Math.floor(sampleRate / 1000); // 1000Hz max
      const maxOffset = Math.floor(sampleRate / 65);   // 65Hz min

      for (let offset = minOffset; offset <= maxOffset; offset++) {
        let r = 0;
        for (let i = 0; i < timeBuffer.length - offset; i += 2) {
          r += timeBuffer[i] * timeBuffer[i + offset];
        }
        if (r > bestR) {
          bestR = r;
          bestOffset = offset;
        }
      }

      if (bestOffset > 0 && bestR > 0.005) {
        const detectedHz = sampleRate / bestOffset;
        const target = findClosestScaleFreq(detectedHz);
        if (target) {
          // Tune formant filter to target harmonic
          const speedFactor = Math.max(0.002, retuneSpeedMs / 1000);
          formantFilter.frequency.setTargetAtTime(target.freq, audioCtx.currentTime, speedFactor);

          if (onPitchDetected) {
            onPitchDetected({
              detectedHz: Math.round(detectedHz),
              targetNote: target.name,
              targetHz: Math.round(target.freq),
              cents: Math.round(1200 * Math.log2(detectedHz / target.freq))
            });
          }
        }
      }
    }, 35);

    return {
      input,
      output,
      setEnabled(val) {
        enabled = val;
        wetGain.gain.setTargetAtTime(val ? 1.0 : 0.0, audioCtx.currentTime, 0.05);
        dryGain.gain.setTargetAtTime(val ? 0.0 : 1.0, audioCtx.currentTime, 0.05);
      },
      setScale(scale, root) {
        activeScale = scale || activeScale;
        activeRoot = root || activeRoot;
        const res = VocalFx.getScaleFrequencies(activeScale, activeRoot);
        validFreqs = res.freqs;
        noteDetails = res.noteDetails;
      },
      setRetuneSpeed(ms) {
        retuneSpeedMs = Math.max(0, ms);
      },
      setDepth(val) { // 0.0 to 1.0
        depth = val;
        formantFilter.gain.setTargetAtTime(val * 9.0, audioCtx.currentTime, 0.02);
      },
      onPitch(cb) {
        onPitchDetected = cb;
      },
      destroy() {
        if (detectInterval) clearInterval(detectInterval);
      }
    };
  }

  /**
   * Create a Real-Time Live Voice Changer Node Chain (Robot, Chipmunk, Deep Voice, Alien, Megaphone)
   */
  static createVoiceChanger(audioCtx) {
    const input = audioCtx.createGain();
    const output = audioCtx.createGain();

    // 1. Dry / Bypass path
    const dryGain = audioCtx.createGain();
    dryGain.gain.value = 1.0;
    input.connect(dryGain);
    dryGain.connect(output);

    // 2. Wet FX path
    const wetGain = audioCtx.createGain();
    wetGain.gain.value = 0.0;

    // Filter nodes for Megaphone / Radio
    const bpFilter = audioCtx.createBiquadFilter();
    bpFilter.type = 'bandpass';
    bpFilter.frequency.value = 1400;
    bpFilter.Q.value = 1.8;

    // Distortion / Saturation Curve
    const distortion = audioCtx.createWaveShaper();
    const makeDistCurve = (amount = 20) => {
      const n = 256;
      const curve = new Float32Array(n);
      for (let i = 0; i < n; ++i) {
        const x = (i * 2) / n - 1;
        curve[i] = ((Math.PI + amount) * x) / (Math.PI + amount * Math.abs(x));
      }
      return curve;
    };
    distortion.curve = makeDistCurve(25);
    distortion.oversample = '2x';

    // Ring Modulator (Robot / Alien Voice)
    const carrierOsc = audioCtx.createOscillator();
    carrierOsc.type = 'sawtooth';
    carrierOsc.frequency.value = 65; // Robot fundamental
    carrierOsc.start();

    const ringModGain = audioCtx.createGain();
    ringModGain.gain.value = 0; // modulated by carrier
    carrierOsc.connect(ringModGain.gain);

    // Alien LFO Modulator
    const alienLfo = audioCtx.createOscillator();
    alienLfo.frequency.value = 8.5;
    const alienLfoGain = audioCtx.createGain();
    alienLfoGain.gain.value = 40;
    alienLfo.connect(alienLfoGain);
    alienLfo.start();

    // Sub-bass Pitch Filter (Deep Voice)
    const lowShelf = audioCtx.createBiquadFilter();
    lowShelf.type = 'lowshelf';
    lowShelf.frequency.value = 180;
    lowShelf.gain.value = 0;

    // High Peaking Formant (Chipmunk)
    const highFormant = audioCtx.createBiquadFilter();
    highFormant.type = 'peaking';
    highFormant.frequency.value = 2400;
    highFormant.Q.value = 3.0;
    highFormant.gain.value = 0;

    // Connect node chain
    input.connect(lowShelf);
    lowShelf.connect(highFormant);
    highFormant.connect(bpFilter);
    bpFilter.connect(distortion);
    distortion.connect(ringModGain);
    ringModGain.connect(wetGain);
    wetGain.connect(output);

    let currentMode = 'normal';
    let wetMixVal = 1.0;
    let driveVal = 25;
    let pitchShiftVal = 0;

    const setVoiceMode = (mode) => {
      currentMode = mode;
      const t = audioCtx.currentTime;

      // Default reset
      dryGain.gain.setTargetAtTime(0, t, 0.02);
      wetGain.gain.setTargetAtTime(wetMixVal, t, 0.02);
      lowShelf.gain.setTargetAtTime(0, t, 0.02);
      highFormant.gain.setTargetAtTime(0, t, 0.02);
      bpFilter.frequency.setTargetAtTime(1400, t, 0.02);
      bpFilter.Q.setTargetAtTime(0.5, t, 0.02);

      switch (mode) {
        case 'normal':
          dryGain.gain.setTargetAtTime(1.0, t, 0.02);
          wetGain.gain.setTargetAtTime(0.0, t, 0.02);
          break;

        case 'robot':
          // Pure Ring Modulation
          carrierOsc.type = 'square';
          carrierOsc.frequency.setTargetAtTime(55 + pitchShiftVal * 4, t, 0.02);
          bpFilter.frequency.setTargetAtTime(2000, t, 0.02);
          bpFilter.Q.setTargetAtTime(0.7, t, 0.02);
          distortion.curve = makeDistCurve(driveVal || 15);
          break;

        case 'chipmunk':
          // High formant & bright harmonic lift
          carrierOsc.type = 'sine';
          carrierOsc.frequency.setTargetAtTime(8, t, 0.02);
          highFormant.frequency.setTargetAtTime(2800 + pitchShiftVal * 80, t, 0.02);
          highFormant.gain.setTargetAtTime(16, t, 0.02);
          bpFilter.frequency.setTargetAtTime(3400, t, 0.02);
          bpFilter.Q.setTargetAtTime(1.2, t, 0.02);
          break;

        case 'deep':
          // Monster deep sub-octave & warm drive
          carrierOsc.type = 'triangle';
          carrierOsc.frequency.setTargetAtTime(32, t, 0.02);
          lowShelf.frequency.setTargetAtTime(140, t, 0.02);
          lowShelf.gain.setTargetAtTime(16, t, 0.02);
          bpFilter.frequency.setTargetAtTime(750, t, 0.02);
          bpFilter.Q.setTargetAtTime(0.8, t, 0.02);
          distortion.curve = makeDistCurve(driveVal || 35);
          break;

        case 'alien':
          // Tremolo & rapid phase frequency shift
          carrierOsc.type = 'sawtooth';
          carrierOsc.frequency.setTargetAtTime(120, t, 0.02);
          alienLfo.frequency.setTargetAtTime(14, t, 0.02);
          bpFilter.frequency.setTargetAtTime(1900, t, 0.02);
          bpFilter.Q.setTargetAtTime(2.5, t, 0.02);
          break;

        case 'megaphone':
          // Bandpass 500Hz-3kHz with harsh saturation
          carrierOsc.frequency.setTargetAtTime(0.1, t, 0.02);
          bpFilter.frequency.setTargetAtTime(1500, t, 0.02);
          bpFilter.Q.setTargetAtTime(3.5, t, 0.02);
          distortion.curve = makeDistCurve(driveVal || 60);
          break;

        case 'ghost':
          // High ethereal shimmer & modulation
          carrierOsc.type = 'sine';
          carrierOsc.frequency.setTargetAtTime(6, t, 0.02);
          highFormant.frequency.setTargetAtTime(4500, t, 0.02);
          highFormant.gain.setTargetAtTime(12, t, 0.02);
          bpFilter.frequency.setTargetAtTime(2200, t, 0.02);
          bpFilter.Q.setTargetAtTime(1.5, t, 0.02);
          break;

        case 'radio':
          // Vintage AM 1920s Radio
          carrierOsc.type = 'sawtooth';
          carrierOsc.frequency.setTargetAtTime(25, t, 0.02);
          bpFilter.frequency.setTargetAtTime(1200, t, 0.02);
          bpFilter.Q.setTargetAtTime(4.0, t, 0.02);
          distortion.curve = makeDistCurve(30);
          break;
      }
    };

    setVoiceMode('normal');

    return {
      input,
      output,
      setVoiceMode,
      getMode: () => currentMode,
      setPitchShift(val) {
        pitchShiftVal = val;
        setVoiceMode(currentMode);
      },
      setDrive(amount) {
        driveVal = amount;
        distortion.curve = makeDistCurve(amount);
      },
      setWetMix(mix) {
        wetMixVal = mix;
        const t = audioCtx.currentTime;
        if (currentMode !== 'normal') {
          wetGain.gain.setTargetAtTime(mix, t, 0.02);
          dryGain.gain.setTargetAtTime(1.0 - mix * 0.7, t, 0.02);
        }
      },
      setModSpeed(hz) {
        alienLfo.frequency.setTargetAtTime(hz, audioCtx.currentTime, 0.02);
      }
    };
  }
}
