/**
 * StudioMaster Pro - Studio Equalizer & DSP FX Suite
 * Implements 10-Band EQ, 8D Spatial Audio, DSP Presets, Ambient White Noise, and Enhancers.
 * Synchronizes both DSP audio graph and Console UI knobs/faders!
 */

export class DspSuite {
  constructor(engine, app) {
    this.engine = engine;
    this.app = app;
    this.ctx = null;

    // 10-Band EQ Filters
    this.bands = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
    this.eqFilters = [];
    this.eqInput = null;
    this.eqOutput = null;

    // Enhancers: Deep Sub-Bass & High Air Treble
    this.subBassFilter = null;
    this.airTrebleFilter = null;

    // Preamp Boost & Auto Volume Leveling
    this.preampNode = null;
    this.autoLevelerNode = null;
    this.isAutoLevelingActive = true;

    // 8D Spatial Orbit
    this.is8DActive = false;
    this.panner8D = null;
    this.orbitSpeed = 1.0;
    this.orbitAngle = 0;
    this.orbitInterval = null;

    // Speed / Playback rate
    this.playbackSpeed = 1.0;

    // Ambient Noise Generators (Rain, Campfire, Vinyl)
    this.ambientType = 'off';
    this.ambientGainNode = null;
    this.ambientSourceNodes = [];
    this.ambientVolume = 0.4;

    // Active DSP Preset
    this.activePreset = 'Studio Clean';
    this.isKaraokeActive = false;
  }

  initDspNodes() {
    const ctx = this.engine.ctx;
    this.ctx = ctx;

    // 1. Preamp Boost Node
    this.preampNode = ctx.createGain();
    this.preampNode.gain.value = 1.0;

    // 2. 10-Band Graphic Equalizer Chain
    this.eqFilters = this.bands.map((freq, idx) => {
      const f = ctx.createBiquadFilter();
      if (idx === 0) f.type = 'lowshelf';
      else if (idx === this.bands.length - 1) f.type = 'highshelf';
      else {
        f.type = 'peaking';
        f.Q.value = 1.4;
      }
      f.frequency.value = freq;
      f.gain.value = 0;
      return f;
    });

    for (let i = 0; i < this.eqFilters.length - 1; i++) {
      this.eqFilters[i].connect(this.eqFilters[i + 1]);
    }
    this.eqInput = this.eqFilters[0];
    this.eqOutput = this.eqFilters[this.eqFilters.length - 1];

    // 3. Deep Sub-Bass & High Air Treble Nodes
    this.subBassFilter = ctx.createBiquadFilter();
    this.subBassFilter.type = 'lowshelf';
    this.subBassFilter.frequency.value = 50;
    this.subBassFilter.gain.value = 0;

    this.airTrebleFilter = ctx.createBiquadFilter();
    this.airTrebleFilter.type = 'highshelf';
    this.airTrebleFilter.frequency.value = 14000;
    this.airTrebleFilter.gain.value = 0;

    // 4. 8D Spatial Stereo Panner
    this.panner8D = ctx.createStereoPanner();
    this.panner8D.pan.value = 0;

    // 5. Volume Leveling (Dynamics Compressor)
    this.autoLevelerNode = ctx.createDynamicsCompressor();
    this.autoLevelerNode.threshold.value = -16;
    this.autoLevelerNode.knee.value = 10;
    this.autoLevelerNode.ratio.value = 4;
    this.autoLevelerNode.attack.value = 0.02;
    this.autoLevelerNode.release.value = 0.2;

    // 6. Ambient Noise Gain Node
    this.ambientGainNode = ctx.createGain();
    this.ambientGainNode.gain.value = 0.4;
    this.ambientGainNode.connect(this.engine.masterBus);

    // Insert DSP Suite into Master Bus routing:
    this.engine.masterBus.disconnect();
    this.engine.masterBus.connect(this.preampNode);
    this.preampNode.connect(this.eqInput);
    this.eqOutput.connect(this.subBassFilter);
    this.subBassFilter.connect(this.airTrebleFilter);
    this.airTrebleFilter.connect(this.panner8D);
    this.panner8D.connect(this.autoLevelerNode);
    this.autoLevelerNode.connect(this.engine.masterEQ.input);
  }

  // --- 10-Band Graphic EQ Controls ---
  setBandGain(index, gainDb) {
    if (this.eqFilters[index]) {
      this.eqFilters[index].gain.setTargetAtTime(gainDb, this.ctx.currentTime, 0.02);
      const readout = document.getElementById(`eq-val-${index}`);
      if (readout) readout.textContent = `${gainDb > 0 ? '+' : ''}${gainDb}dB`;
    }
  }

  applyGenrePreset(genre) {
    const curves = {
      'Flat': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      'Bass Boost': [8, 7, 5, 3, 1, 0, 0, 0, 1, 2],
      'Electronic': [6, 5, 2, 0, -1, 1, 3, 5, 6, 7],
      'Rock': [5, 4, 3, 1, -1, -1, 1, 3, 4, 5],
      'Pop': [-1, 1, 3, 4, 4, 2, 0, 2, 4, 4],
      'Jazz': [3, 2, 1, 2, -1, -1, 0, 1, 2, 3],
      'Vocal': [-3, -2, -1, 1, 3, 4, 3, 2, 1, 0],
      'Acoustic': [4, 3, 2, 1, 2, 2, 3, 3, 4, 4]
    };

    const gains = curves[genre] || curves['Flat'];
    gains.forEach((gain, idx) => {
      this.setBandGain(idx, gain);
      const slider = document.getElementById(`eq-slider-${idx}`);
      if (slider) slider.value = gain;
    });
  }

  /**
   * Apply DSP FX Preset and SYNCHRONIZE all mixer desk controls (knobs, faders, EQs, aux)
   */
  applyDspPreset(presetName) {
    this.activePreset = presetName;

    // Reset special states first
    this.stop8DOrbit();
    this.setSpeed(1.0);
    this.isKaraokeActive = false;

    let config = {
      genre: 'Flat',
      subBass: 0,
      airTreble: 0,
      revDecay: 2.0,
      dlyTime: 0.35,
      dlyFeedback: 0.3,
      masterEQ: [0, 0, 0, 0, 0],
      speed: 1.0,
      preamp: 100,
      chLow: 0,
      chMid: 0,
      chMidFreq: 1000,
      chHigh: 0,
      chRevSend: 0.1,
      chDlySend: 0.0,
      is8D: false,
      isKaraoke: false,
      panMode: 'normal' // 'normal', 'wide', 'spread'
    };

    switch (presetName) {
      case 'Studio Clean':
        config.genre = 'Flat';
        config.subBass = 0;
        config.airTreble = 0;
        config.revDecay = 1.5;
        config.dlyTime = 0.30;
        config.dlyFeedback = 0.15;
        config.masterEQ = [0, 0, 0, 0, 0];
        config.chLow = 0; config.chMid = 0; config.chHigh = 0;
        config.chRevSend = 0.05; config.chDlySend = 0.0;
        break;

      case 'Dolby 3D Surround 🌐':
        config.genre = 'Electronic';
        config.subBass = 4;
        config.airTreble = 5;
        config.revDecay = 2.8;
        config.dlyTime = 0.28;
        config.dlyFeedback = 0.35;
        config.masterEQ = [3, 1, -1, 2, 5];
        config.chLow = 2; config.chMid = -1; config.chHigh = 4; config.chMidFreq = 2500;
        config.chRevSend = 0.45; config.chDlySend = 0.35;
        config.panMode = 'wide';
        break;

      case 'Live Concert Hall 🏛️':
        config.genre = 'Rock';
        config.subBass = 3;
        config.airTreble = 4;
        config.revDecay = 4.5;
        config.dlyTime = 0.45;
        config.dlyFeedback = 0.45;
        config.masterEQ = [4, 2, 0, 3, 4];
        config.chLow = 3; config.chMid = 1; config.chHigh = 3; config.chMidFreq = 3000;
        config.chRevSend = 0.75; config.chDlySend = 0.50;
        config.panMode = 'spread';
        break;

      case '8D Spatial Audio 🎧':
        config.genre = 'Electronic';
        config.subBass = 4;
        config.airTreble = 4;
        config.revDecay = 3.2;
        config.dlyTime = 0.32;
        config.dlyFeedback = 0.40;
        config.masterEQ = [2, 0, 1, 4, 6];
        config.chLow = 2; config.chMid = 1; config.chHigh = 5;
        config.chRevSend = 0.55; config.chDlySend = 0.40;
        config.is8D = true;
        config.panMode = 'wide';
        break;

      case 'Slowed + Reverb 💧':
        config.speed = 0.85;
        config.genre = 'Bass Boost';
        config.subBass = 6;
        config.airTreble = -3;
        config.revDecay = 4.2;
        config.dlyTime = 0.48;
        config.dlyFeedback = 0.50;
        config.masterEQ = [6, 3, 0, -2, -4];
        config.chLow = 5; config.chMid = 1; config.chHigh = -3; config.chMidFreq = 800;
        config.chRevSend = 0.80; config.chDlySend = 0.40;
        break;

      case 'Nightcore ⚡':
        config.speed = 1.25;
        config.genre = 'Pop';
        config.subBass = 4;
        config.airTreble = 7;
        config.revDecay = 1.6;
        config.dlyTime = 0.18;
        config.dlyFeedback = 0.20;
        config.masterEQ = [3, 1, 2, 5, 7];
        config.chLow = 3; config.chMid = 2; config.chHigh = 6; config.chMidFreq = 4000;
        config.chRevSend = 0.20; config.chDlySend = 0.15;
        break;

      case 'Vaporwave 📼':
        config.speed = 0.80;
        config.genre = 'Acoustic';
        config.subBass = 5;
        config.airTreble = -5;
        config.revDecay = 3.8;
        config.dlyTime = 0.50;
        config.dlyFeedback = 0.55;
        config.masterEQ = [5, 3, 1, -3, -6];
        config.chLow = 4; config.chMid = 2; config.chHigh = -5; config.chMidFreq = 650;
        config.chRevSend = 0.65; config.chDlySend = 0.60;
        break;

      case 'Bass Master 808 🔊':
        config.genre = 'Bass Boost';
        config.subBass = 10;
        config.airTreble = 1;
        config.revDecay = 1.8;
        config.dlyTime = 0.25;
        config.dlyFeedback = 0.15;
        config.masterEQ = [9, 6, 1, 0, 1];
        config.chLow = 8; config.chMid = -2; config.chHigh = 1; config.chMidFreq = 400;
        config.chRevSend = 0.15; config.chDlySend = 0.10;
        break;

      case 'Karaoke Mode 🎤':
        config.genre = 'Vocal';
        config.subBass = 0;
        config.airTreble = 3;
        config.revDecay = 2.5;
        config.dlyTime = 0.30;
        config.dlyFeedback = 0.25;
        config.masterEQ = [-2, -1, -6, 2, 3];
        config.chLow = 0; config.chMid = -8; config.chHigh = 3; config.chMidFreq = 1200;
        config.chRevSend = 0.35; config.chDlySend = 0.20;
        config.isKaraoke = true;
        break;

      case 'Haptic Bass 📳':
        config.genre = 'Bass Boost';
        config.subBass = 14;
        config.airTreble = 0;
        config.revDecay = 1.2;
        config.masterEQ = [12, 8, 0, -2, -2];
        config.chLow = 10; config.chMid = -3; config.chHigh = 0; config.chMidFreq = 300;
        config.chRevSend = 0.10; config.chDlySend = 0.0;
        break;

      case 'EDM Festival 🔊⚡':
        config.genre = 'Electronic';
        config.subBass = 8;
        config.airTreble = 6;
        config.revDecay = 3.2;
        config.dlyTime = 0.23;
        config.dlyFeedback = 0.45;
        config.masterEQ = [8, 4, -1, 3, 7];
        config.chLow = 6; config.chMid = -2; config.chHigh = 5; config.chMidFreq = 3200;
        config.chRevSend = 0.40; config.chDlySend = 0.35;
        config.panMode = 'wide';
        break;

      case 'Vinyl Lo-Fi Chill ☕📼':
        config.speed = 0.92;
        config.genre = 'Acoustic';
        config.subBass = 4;
        config.airTreble = -4;
        config.revDecay = 3.0;
        config.dlyTime = 0.40;
        config.dlyFeedback = 0.35;
        config.masterEQ = [4, 2, 0, -2, -5];
        config.chLow = 3; config.chMid = 1; config.chHigh = -4; config.chMidFreq = 700;
        config.chRevSend = 0.50; config.chDlySend = 0.30;
        this.setAmbientNoise('vinyl', 0.35);
        break;

      case 'Cathedral 3D Spatial ⛪':
        config.genre = 'Vocal';
        config.subBass = 2;
        config.airTreble = 5;
        config.revDecay = 6.0;
        config.dlyTime = 0.55;
        config.dlyFeedback = 0.60;
        config.masterEQ = [2, 1, 2, 5, 6];
        config.chLow = 1; config.chMid = 2; config.chHigh = 4; config.chMidFreq = 2000;
        config.chRevSend = 0.90; config.chDlySend = 0.65;
        config.is8D = true;
        config.panMode = 'spread';
        break;

      case 'Podcast Broadcast 🎙️':
        config.genre = 'Vocal';
        config.subBass = 1;
        config.airTreble = 3;
        config.revDecay = 1.0;
        config.dlyTime = 0.15;
        config.dlyFeedback = 0.05;
        config.masterEQ = [1, 2, 0, 3, 2];
        config.chLow = 2; config.chMid = 2; config.chHigh = 3; config.chMidFreq = 2800;
        config.chRevSend = 0.05; config.chDlySend = 0.0;
        break;

      case 'ASMR Binaural 🍃':
        config.genre = 'Acoustic';
        config.subBass = 1;
        config.airTreble = 9;
        config.revDecay = 1.8;
        config.dlyTime = 0.12;
        config.dlyFeedback = 0.10;
        config.masterEQ = [-3, -2, 1, 6, 9];
        config.chLow = -2; config.chMid = 1; config.chHigh = 8; config.chMidFreq = 5000;
        config.chRevSend = 0.30; config.chDlySend = 0.15;
        config.is8D = true;
        this.setAmbientNoise('hujan', 0.20);
        break;

      case 'Gaming FPS Surround 🎯':
        config.genre = 'Rock';
        config.subBass = 0;
        config.airTreble = 6;
        config.revDecay = 1.5;
        config.dlyTime = 0.20;
        config.dlyFeedback = 0.20;
        config.masterEQ = [-4, -1, 3, 6, 4];
        config.chLow = -2; config.chMid = 4; config.chHigh = 5; config.chMidFreq = 2500;
        config.chRevSend = 0.20; config.chDlySend = 0.15;
        config.panMode = 'wide';
        break;

      case 'Vintage Radio AM 📻':
        config.genre = 'Vocal';
        config.subBass = -8;
        config.airTreble = -8;
        config.revDecay = 1.0;
        config.dlyTime = 0.10;
        config.dlyFeedback = 0.10;
        config.masterEQ = [-10, -4, 6, 2, -10];
        config.chLow = -8; config.chMid = 6; config.chHigh = -8; config.chMidFreq = 1200;
        config.chRevSend = 0.15; config.chDlySend = 0.0;
        break;

      case 'Heavy Metal Rock 🎸':
        config.genre = 'Rock';
        config.subBass = 5;
        config.airTreble = 5;
        config.revDecay = 2.2;
        config.dlyTime = 0.25;
        config.dlyFeedback = 0.25;
        config.masterEQ = [6, 3, -3, 4, 6];
        config.chLow = 5; config.chMid = -4; config.chHigh = 6; config.chMidFreq = 1500;
        config.chRevSend = 0.35; config.chDlySend = 0.25;
        config.panMode = 'spread';
        break;
    }

    // 1. Apply DSP Master Parameters
    this.applyGenrePreset(config.genre);
    this.setSubBass(config.subBass);
    this.setAirTreble(config.airTreble);
    this.setSpeed(config.speed);
    this.setPreampBoost(config.preamp);
    this.engine.setAuxReverbDecay(config.revDecay);
    this.engine.setAuxDelayTime(config.dlyTime);
    this.engine.setAuxDelayFeedback(config.dlyFeedback);

    if (config.is8D) this.start8DOrbit();
    this.isKaraokeActive = config.isKaraoke;

    // 2. Synchronize ALL visual UI controls across the mixer console!
    this.app.syncAllMixerControlsFromPreset(config);

    this.app.showToast(`Preset DSP "${presetName}" diterapkan ke seluruh Mixer!`, 'info');
  }

  // --- 8D Spatial Orbit ---
  start8DOrbit() {
    this.is8DActive = true;
    if (this.orbitInterval) clearInterval(this.orbitInterval);

    this.orbitInterval = setInterval(() => {
      if (!this.panner8D || !this.is8DActive) return;
      this.orbitAngle += 0.05 * this.orbitSpeed;
      const pan = Math.sin(this.orbitAngle);
      this.panner8D.pan.setTargetAtTime(pan, this.ctx.currentTime, 0.03);
    }, 30);
  }

  stop8DOrbit() {
    this.is8DActive = false;
    if (this.orbitInterval) {
      clearInterval(this.orbitInterval);
      this.orbitInterval = null;
    }
    if (this.panner8D && this.ctx) {
      this.panner8D.pan.setTargetAtTime(0, this.ctx.currentTime, 0.05);
    }
  }

  set8DOrbitSpeed(speed) {
    this.orbitSpeed = Math.max(0.1, Math.min(4.0, speed));
  }

  setSpeed(val) {
    this.playbackSpeed = val;
    this.engine.channels.forEach(ch => {
      if (ch.sourceNode && ch.sourceNode.playbackRate) {
        ch.sourceNode.playbackRate.value = val;
      }
    });
    const readout = document.getElementById('speed-val-readout');
    if (readout) readout.textContent = `${val.toFixed(1)}x`;
    const slider = document.getElementById('slider-speed');
    if (slider) slider.value = Math.round(val * 100);
  }

  setPreampBoost(percent) {
    const gain = percent / 100;
    if (this.preampNode) {
      this.preampNode.gain.setTargetAtTime(gain, this.ctx.currentTime, 0.02);
    }
    const readout = document.getElementById('preamp-val-readout');
    if (readout) readout.textContent = `${percent}%`;
    const slider = document.getElementById('slider-preamp');
    if (slider) slider.value = percent;
  }

  setSubBass(db) {
    if (this.subBassFilter) {
      this.subBassFilter.gain.setTargetAtTime(db, this.ctx.currentTime, 0.02);
      const el = document.getElementById('sub-bass-readout');
      if (el) el.textContent = `+${db}dB`;
      const slider = document.getElementById('slider-sub-bass');
      if (slider) slider.value = db;
    }
  }

  setAirTreble(db) {
    if (this.airTrebleFilter) {
      this.airTrebleFilter.gain.setTargetAtTime(db, this.ctx.currentTime, 0.02);
      const el = document.getElementById('air-treble-readout');
      if (el) el.textContent = `${db > 0 ? '+' : ''}${db}dB`;
      const slider = document.getElementById('slider-air-treble');
      if (slider) slider.value = db;
    }
  }

  toggleAutoLeveling() {
    this.isAutoLevelingActive = !this.isAutoLevelingActive;
    if (this.autoLevelerNode) {
      this.autoLevelerNode.threshold.setTargetAtTime(
        this.isAutoLevelingActive ? -16 : 0,
        this.ctx.currentTime,
        0.05
      );
    }
    return this.isAutoLevelingActive;
  }

  setAmbientNoise(type, volume = this.ambientVolume) {
    this.ambientType = type;
    this.ambientVolume = volume;
    this.stopAmbient();

    if (type === 'off') return;

    this.ambientGainNode.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.05);

    const ctx = this.ctx;
    const sampleRate = ctx.sampleRate;

    switch (type) {
      case 'hujan': {
        const bufferSize = sampleRate * 4;
        const buffer = ctx.createBuffer(2, bufferSize, sampleRate);
        const l = buffer.getChannelData(0);
        const r = buffer.getChannelData(1);

        let b0L = 0, b1L = 0, b2L = 0;
        let b0R = 0, b1R = 0, b2R = 0;
        for (let i = 0; i < bufferSize; i++) {
          const whiteL = Math.random() * 2 - 1;
          const whiteR = Math.random() * 2 - 1;
          b0L = 0.99886 * b0L + whiteL * 0.0555179;
          b1L = 0.99332 * b1L + whiteL * 0.0750759;
          b2L = 0.96900 * b2L + whiteL * 0.1538520;
          l[i] = (b0L + b1L + b2L + whiteL * 0.5362) * 0.08;

          b0R = 0.99886 * b0R + whiteR * 0.0555179;
          b1R = 0.99332 * b1R + whiteR * 0.0750759;
          b2R = 0.96900 * b2R + whiteR * 0.1538520;
          r[i] = (b0R + b1R + b2R + whiteR * 0.5362) * 0.08;
        }

        const src = ctx.createBufferSource();
        src.buffer = buffer;
        src.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1800;

        src.connect(filter);
        filter.connect(this.ambientGainNode);
        src.start();
        this.ambientSourceNodes.push(src);
        break;
      }

      case 'api': {
        const bufferSize = sampleRate * 3;
        const buffer = ctx.createBuffer(2, bufferSize, sampleRate);
        const l = buffer.getChannelData(0);
        const r = buffer.getChannelData(1);

        for (let i = 0; i < bufferSize; i++) {
          const rumble = (Math.random() * 2 - 1) * 0.03;
          const pop = Math.random() > 0.9985 ? (Math.random() * 2 - 1) * 0.6 : 0;
          l[i] = rumble + pop;
          r[i] = rumble + pop * (Math.random() > 0.5 ? 1 : -1);
        }

        const src = ctx.createBufferSource();
        src.buffer = buffer;
        src.loop = true;
        src.connect(this.ambientGainNode);
        src.start();
        this.ambientSourceNodes.push(src);
        break;
      }

      case 'vinyl': {
        const bufferSize = sampleRate * 3;
        const buffer = ctx.createBuffer(2, bufferSize, sampleRate);
        const l = buffer.getChannelData(0);
        const r = buffer.getChannelData(1);

        for (let i = 0; i < bufferSize; i++) {
          const noise = (Math.random() * 2 - 1) * 0.02;
          const dust = Math.random() > 0.999 ? (Math.random() * 2 - 1) * 0.4 : 0;
          l[i] = noise + dust;
          r[i] = noise + dust;
        }

        const src = ctx.createBufferSource();
        src.buffer = buffer;
        src.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 500;

        src.connect(filter);
        filter.connect(this.ambientGainNode);
        src.start();
        this.ambientSourceNodes.push(src);
        break;
      }
    }
  }

  stopAmbient() {
    this.ambientSourceNodes.forEach(node => {
      try { node.stop(); node.disconnect(); } catch (e) {}
    });
    this.ambientSourceNodes = [];
  }
}
