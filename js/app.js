/**
 * StudioMaster Pro - Main Application Controller
 */

import { AudioEngine } from './audio-engine.js?v=3.1.0';
import { AudioVisualizer } from './audio-visualizer.js?v=3.1.0';
import { AudioRecorder } from './audio-recorder.js?v=3.1.0';
import { SynthDemo } from './synth-demo.js?v=3.1.0';
import { SamplePads } from './sample-pads.js?v=3.1.0';
import { MidiController } from './midi-controller.js?v=3.1.0';
import { AudioEffects } from './audio-effects.js?v=3.1.0';
import { AudioRouting } from './audio-routing.js?v=3.1.0';
import { DspSuite } from './dsp-suite.js?v=3.1.0';
import { AutoDucking } from './auto-ducking.js?v=3.1.0';
import { VocalFx } from './vocal-fx.js?v=3.1.0';
import { InteractiveEQ } from './interactive-eq.js?v=3.1.0';
import { LoudnessMeter } from './loudness-meter.js?v=3.1.0';
import { ReferenceTrack } from './reference-track.js?v=3.1.0';

class StudioApp {
  constructor() {
    this.engine = new AudioEngine();
    this.visualizer = new AudioVisualizer(this.engine);
    this.recorder = new AudioRecorder(this.engine);
    this.samplePads = new SamplePads(this.engine);
    this.midi = new MidiController(this.engine, this);
    this.routing = new AudioRouting(this.engine, this);
    this.dspSuite = new DspSuite(this.engine, this);
    this.autoDucking = new AutoDucking(this.engine, this);
    this.loudnessMeter = null;
    this.referenceTrack = null;
    this.interactiveEQ = null;

    this.selectedChannelId = 1;
    this.channelsContainer = null;
    this.timecodeEl = null;

    this.init();
  }

  safeOn(idOrEl, event, callback) {
    const el = typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
    if (el) {
      el.addEventListener(event, callback);
    }
  }

  async init() {
    this.cacheDomElements();
    this.bindGlobalEvents();
    this.initVisualizers();
    this.samplePads.renderGrid(document.getElementById('soundpad-grid'));
    this.midi.init();
    this.routing.enumerateDevices();

    // Add default initial channels
    this.createDefaultChannel('CH 1 (VOX)', '#06b6d4');
    this.createDefaultChannel('CH 2 (GTR)', '#3b82f6');
    this.createDefaultChannel('CH 3 (BASS)', '#8b5cf6');
    this.createDefaultChannel('CH 4 (DRUMS)', '#f59e0b');

    // Initialize DSP Nodes immediately
    this.dspSuite.initDspNodes();

    // Bind DSP Suite UI & Routing
    this.bindDspSuiteEvents();
    this.bindRoutingEvents();
    this.bindAdvancedFeatures();
    this.bindKeyboardShortcuts();

    // Start timecode updater timer
    setInterval(() => this.updateTimecodeUI(), 40);

    this.showToast('OverMix Pro v3.2 Siap. Buka "Studio DSP FX" atau tekan Spasi untuk Play!', 'info');
  }

  cacheDomElements() {
    this.channelsContainer = document.getElementById('channel-strips-wrapper');
    this.timecodeEl = document.getElementById('timecode-display');
    this.playBtn = document.getElementById('btn-play');
    this.pauseBtn = document.getElementById('btn-pause');
    this.stopBtn = document.getElementById('btn-stop');
    this.loopBtn = document.getElementById('btn-loop');
    this.recBtn = document.getElementById('btn-record');
    this.metronomeBtn = document.getElementById('btn-metronome');
    this.bpmInput = document.getElementById('bpm-input');
  }

  initVisualizers() {
    const spectrumCanvas = document.getElementById('spectrum-canvas');
    const vectorscopeCanvas = document.getElementById('vectorscope-canvas');
    const timelineCanvas = document.getElementById('timeline-waveform-canvas');
    this.visualizer.init(spectrumCanvas, vectorscopeCanvas, timelineCanvas);
  }

  bindGlobalEvents() {
    // Transport Play
    this.safeOn(this.playBtn, 'click', async () => {
      await this.engine.init();
      if (this.engine.isPlaying) {
        this.engine.pause();
        if (this.playBtn) this.playBtn.classList.remove('active');
      } else {
        this.engine.play();
        if (this.playBtn) this.playBtn.classList.add('active');
      }
    });

    // Transport Pause
    this.safeOn(this.pauseBtn, 'click', () => {
      this.engine.pause();
      if (this.playBtn) this.playBtn.classList.remove('active');
    });

    // Transport Stop
    this.safeOn(this.stopBtn, 'click', () => {
      this.engine.stop();
      if (this.playBtn) this.playBtn.classList.remove('active');
      this.updateTimecodeUI();
    });

    // Transport Loop Toggle
    this.safeOn(this.loopBtn, 'click', () => {
      this.engine.isLooping = !this.engine.isLooping;
      if (this.loopBtn) this.loopBtn.classList.toggle('active', this.engine.isLooping);
    });

    // Transport Master Record Mix
    this.safeOn(this.recBtn, 'click', async () => {
      await this.engine.init();
      if (this.recorder.isRecording) {
        if (this.recBtn) this.recBtn.classList.remove('active');
        this.showToast('Menyelesaikan rekaman & mendownload...', 'info');
        await this.recorder.stopRecording();
        this.showToast('Audio mixdown berhasil didownload!', 'success');
      } else {
        this.recorder.startRecording();
        if (this.recBtn) this.recBtn.classList.add('active');
        if (!this.engine.isPlaying) {
          this.engine.play();
          if (this.playBtn) this.playBtn.classList.add('active');
        }
        this.showToast('Mulai merekam Master Mixdown...', 'warn');
      }
    });

    // Metronome
    this.safeOn(this.metronomeBtn, 'click', () => {
      const active = this.engine.toggleMetronome(parseInt(this.bpmInput ? this.bpmInput.value : '120') || 120);
      if (this.metronomeBtn) this.metronomeBtn.classList.toggle('active', active);
    });

    this.safeOn(this.bpmInput, 'change', () => {
      const val = parseInt(this.bpmInput.value) || 120;
      this.engine.bpm = val;
      if (this.engine.metronomeActive) {
        this.engine.startMetronome();
      }
    });

    // Master Fader Control
    const masterFaderCap = document.getElementById('master-fader-cap');
    const masterFaderSlot = document.getElementById('master-fader-slot');
    if (masterFaderCap && masterFaderSlot) {
      this.bindFaderDrag(masterFaderCap, masterFaderSlot, (normVal) => {
        const gain = normVal * 1.5;
        this.engine.setMasterGain(gain);
        const db = AudioEffects.gainToDb(gain);
        const readout = document.getElementById('master-db-readout');
        if (readout) readout.textContent = isFinite(db) ? `${db.toFixed(1)} dB` : '-INF';
      });
    }

    // Master 5-Band Graphic EQ Sliders
    for (let i = 0; i < 5; i++) {
      const slider = document.getElementById(`master-eq-band-${i}`);
      if (slider) {
        slider.addEventListener('input', (e) => {
          const gain = parseFloat(e.target.value);
          this.engine.setMasterEQBand(i, gain);
        });
      }
    }

    // Aux Return Knobs
    this.bindRotaryKnob(document.getElementById('knob-reverb-decay'), (norm) => {
      this.engine.setAuxReverbDecay(norm * 4.5 + 0.5);
    }, 0.5);

    this.bindRotaryKnob(document.getElementById('knob-delay-time'), (norm) => {
      this.engine.setAuxDelayTime(norm * 0.9 + 0.1);
    }, 0.35);

    this.bindRotaryKnob(document.getElementById('knob-delay-feedback'), (norm) => {
      this.engine.setAuxDelayFeedback(norm * 0.85);
    }, 0.4);

    // Header Actions (Safely bound)
    this.safeOn('btn-load-demo', 'click', () => this.loadDemoProject());
    this.safeOn('btn-add-track', 'click', () => this.createDefaultChannel(`CH ${this.engine.channels.length + 1}`));
    this.safeOn('btn-export-wav', 'click', () => this.exportWav());
    this.safeOn('btn-export-stems', 'click', () => this.exportAllStems());
    this.safeOn('btn-save-project', 'click', () => this.openSaveModal());
    // Input Mix Hub Header Buttons
    const openInputHub = async () => {
      await this.engine.init();
      await this.routing.enumerateDevices();
      this.updateRoutingModalTargetChannel();
      const modal = document.getElementById('routing-modal');
      if (modal) modal.classList.add('active');
    };

    this.safeOn('btn-open-input-mix-hub', 'click', openInputHub);
    this.safeOn('btn-open-routing', 'click', openInputHub);

    // File Drag and Drop onto Window
    this.setupFileDragDrop();
  }

  // ==========================================================================
  // Advanced Features: Theme, Voice Changer, Karaoke, OBS, PWA, Soundboard
  // ==========================================================================
  bindAdvancedFeatures() {
    // 1. Theme Switcher
    const themeSelect = document.getElementById('theme-selector');
    const savedTheme = localStorage.getItem('sm_theme') || 'ssl';
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (themeSelect) {
      themeSelect.value = savedTheme;
      themeSelect.addEventListener('change', (e) => {
        const theme = e.target.value;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('sm_theme', theme);
        this.showToast(`Tema Konsol diubah ke: ${themeSelect.options[themeSelect.selectedIndex].text}`, 'info');
      });
    }

    // 2. Broadcast Auto-Ducking (Podcast Host Voice)
    const duckingBtn = document.getElementById('btn-toggle-ducking');
    const duckingIndicator = document.getElementById('ducking-indicator');
    if (duckingBtn) {
      duckingBtn.addEventListener('click', () => {
        const active = this.autoDucking.toggle();
        duckingBtn.classList.toggle('btn-accent-emerald', active);
        if (duckingIndicator) {
          duckingIndicator.textContent = active ? 'ON' : 'OFF';
          duckingIndicator.style.color = active ? '#10b981' : '#ef4444';
        }
      });
    }

    // 3. Real-Time Karaoke Mode Toggle (Center Vocal Cut)
    const karaokeBtn = document.getElementById('btn-toggle-karaoke');
    if (karaokeBtn) {
      karaokeBtn.addEventListener('click', () => {
        const active = this.dspSuite.toggleKaraokeMode();
        karaokeBtn.classList.toggle('btn-accent-blue', active);
      });
    }

    // 4. Live Voice Changer Studio Hub & Modal
    const initVoiceNode = async () => {
      await this.engine.init();
      if (!this.voiceChangerNode) {
        this.voiceChangerNode = VocalFx.createVoiceChanger(this.engine.ctx);
        // Connect voice changer output to Master Bus
        this.voiceChangerNode.output.connect(this.engine.masterBus);
      }
      return this.voiceChangerNode;
    };

    this.safeOn('btn-open-voice-modal', 'click', async () => {
      await initVoiceNode();
      const modal = document.getElementById('voice-changer-modal');
      if (modal) modal.classList.add('active');
    });

    // Voice Preset Cards
    const voiceCards = document.querySelectorAll('.voice-card');
    voiceCards.forEach(card => {
      card.addEventListener('click', async () => {
        const node = await initVoiceNode();
        voiceCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const mode = card.dataset.voice;
        node.setVoiceMode(mode);
        this.showToast(`Voice Modulator: ${card.querySelector('span:nth-child(2)').textContent}`, 'success');
      });
    });

    // Voice Studio Fine-Tuning Sliders
    const pitchSlider = document.getElementById('slider-voice-pitch');
    const pitchVal = document.getElementById('voice-pitch-val');
    if (pitchSlider) {
      pitchSlider.addEventListener('input', async (e) => {
        const node = await initVoiceNode();
        const val = parseInt(e.target.value);
        node.setPitchShift(val);
        if (pitchVal) pitchVal.textContent = `${val > 0 ? '+' : ''}${val} ST`;
      });
    }

    const driveSlider = document.getElementById('slider-voice-drive');
    const driveVal = document.getElementById('voice-drive-val');
    if (driveSlider) {
      driveSlider.addEventListener('input', async (e) => {
        const node = await initVoiceNode();
        const val = parseInt(e.target.value);
        node.setDrive(val);
        if (driveVal) driveVal.textContent = `${val}%`;
      });
    }

    const mixSlider = document.getElementById('slider-voice-mix');
    const mixVal = document.getElementById('voice-mix-val');
    if (mixSlider) {
      mixSlider.addEventListener('input', async (e) => {
        const node = await initVoiceNode();
        const val = parseInt(e.target.value);
        node.setWetMix(val / 100);
        if (mixVal) mixVal.textContent = `${val}%`;
      });
    }

    // Live Mic Monitor for Voice Changer
    let micMonitorStream = null;
    let micMonitorSource = null;
    const micMonitorBtn = document.getElementById('btn-toggle-mic-monitor');
    if (micMonitorBtn) {
      micMonitorBtn.addEventListener('click', async () => {
        await this.engine.init();
        const node = await initVoiceNode();

        if (micMonitorStream) {
          // Stop monitoring
          micMonitorStream.getTracks().forEach(t => t.stop());
          micMonitorStream = null;
          if (micMonitorSource) {
            try { micMonitorSource.disconnect(); } catch (err) {}
            micMonitorSource = null;
          }
          micMonitorBtn.textContent = '🔴 Aktifkan Live Monitor';
          micMonitorBtn.classList.remove('btn-accent-emerald');
          micMonitorBtn.classList.add('btn-accent-purple');
          this.showToast('Live Mic Monitor dimatikan.', 'info');
        } else {
          // Start monitoring
          try {
            micMonitorStream = await navigator.mediaDevices.getUserMedia({
              audio: {
                echoCancellation: true,
                noiseSuppression: false,
                autoGainControl: false,
                latency: 0
              }
            });
            micMonitorSource = this.engine.ctx.createMediaStreamSource(micMonitorStream);
            micMonitorSource.connect(node.input);
            micMonitorBtn.textContent = '🟢 Mic Monitor AKTIF (Live)';
            micMonitorBtn.classList.remove('btn-accent-purple');
            micMonitorBtn.classList.add('btn-accent-emerald');
            this.showToast('Live Mic Monitor AKTIF! Bicara di mic untuk mendengar suaramu.', 'success');
          } catch (err) {
            console.error('Failed to start mic monitor:', err);
            this.showToast('Gagal mengakses mikrofon: ' + err.message, 'error');
          }
        }
      });
    }

    // 5. Live Auto-Tune Pro Studio Hub
    let autoTuneNode = null;
    let atActiveRoot = 'C';
    let atActiveScale = 'major';
    let atMicStream = null;
    let atMicSource = null;

    const initAutoTuneNode = async () => {
      await this.engine.init();
      if (!autoTuneNode) {
        autoTuneNode = VocalFx.createAutoTune(this.engine.ctx);
        autoTuneNode.output.connect(this.engine.masterBus);

        // Visual note pitch meter callback
        const noteEl = document.getElementById('at-detected-note');
        const hzEl = document.getElementById('at-detected-hz');
        const centsBar = document.getElementById('at-cents-bar');

        autoTuneNode.onPitch((info) => {
          if (!info) {
            if (noteEl) noteEl.textContent = '--';
            if (hzEl) hzEl.textContent = '0 Hz';
            if (centsBar) centsBar.style.width = '0%';
            return;
          }
          if (noteEl) noteEl.textContent = info.targetNote;
          if (hzEl) hzEl.textContent = `${info.detectedHz} Hz → ${info.targetHz} Hz`;
          if (centsBar) {
            const clampedCents = Math.max(-50, Math.min(50, info.cents));
            const widthPct = Math.abs(clampedCents);
            centsBar.style.left = clampedCents < 0 ? `${50 - widthPct}%` : '50%';
            centsBar.style.width = `${widthPct}%`;
            centsBar.style.background = Math.abs(clampedCents) < 15 ? '#10b981' : '#22d3ee';
          }
        });
      }
      return autoTuneNode;
    };

    this.safeOn('btn-open-autotune-modal', 'click', async () => {
      await initAutoTuneNode();
      const modal = document.getElementById('autotune-modal');
      if (modal) modal.classList.add('active');
    });

    // Auto-Tune Scale Selector
    const atScaleSelect = document.getElementById('at-scale-select');
    if (atScaleSelect) {
      atScaleSelect.addEventListener('change', async (e) => {
        atActiveScale = e.target.value;
        const node = await initAutoTuneNode();
        node.setScale(atActiveScale, atActiveRoot);
        this.showToast(`Auto-Tune Scale: ${atActiveRoot} ${e.target.options[e.target.selectedIndex].text}`, 'info');
      });
    }

    // Auto-Tune Key Root Buttons
    const atKeyBtns = document.querySelectorAll('.btn-at-key');
    atKeyBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        atKeyBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        atActiveRoot = btn.dataset.key;
        const node = await initAutoTuneNode();
        node.setScale(atActiveScale, atActiveRoot);
        this.showToast(`Auto-Tune Key diubah ke: ${atActiveRoot}`, 'success');
      });
    });

    // Auto-Tune Retune Speed Slider
    const atSpeedSlider = document.getElementById('slider-at-speed');
    const atSpeedVal = document.getElementById('at-speed-val');
    if (atSpeedSlider) {
      atSpeedSlider.addEventListener('input', async (e) => {
        const val = parseInt(e.target.value);
        const node = await initAutoTuneNode();
        node.setRetuneSpeed(val);
        if (atSpeedVal) atSpeedVal.textContent = `${val} ms ${val === 0 ? '(Hard Travis/T-Pain)' : val <= 25 ? '(Pop)' : '(Natural)'}`;
      });
    }

    // Auto-Tune Depth Slider
    const atDepthSlider = document.getElementById('slider-at-depth');
    const atDepthVal = document.getElementById('at-depth-val');
    if (atDepthSlider) {
      atDepthSlider.addEventListener('input', async (e) => {
        const val = parseInt(e.target.value);
        const node = await initAutoTuneNode();
        node.setDepth(val / 100);
        if (atDepthVal) atDepthVal.textContent = `${val}%`;
      });
    }

    // Live Mic Monitor with Auto-Tune
    const atMicBtn = document.getElementById('btn-toggle-at-mic');
    if (atMicBtn) {
      atMicBtn.addEventListener('click', async () => {
        await this.engine.init();
        const node = await initAutoTuneNode();

        if (atMicStream) {
          atMicStream.getTracks().forEach(t => t.stop());
          atMicStream = null;
          if (atMicSource) {
            try { atMicSource.disconnect(); } catch (err) {}
            atMicSource = null;
          }
          atMicBtn.textContent = '🎧 Aktifkan Live Mic Auto-Tune';
          atMicBtn.classList.remove('btn-accent-emerald');
          atMicBtn.classList.add('btn-accent-cyan');
          this.showToast('Live Auto-Tune Mic dimatikan.', 'info');
        } else {
          try {
            atMicStream = await navigator.mediaDevices.getUserMedia({
              audio: {
                echoCancellation: true,
                noiseSuppression: false,
                autoGainControl: false,
                latency: 0
              }
            });
            atMicSource = this.engine.ctx.createMediaStreamSource(atMicStream);
            atMicSource.connect(node.input);
            atMicBtn.textContent = '🟢 Auto-Tune Mic AKTIF (Live)';
            atMicBtn.classList.remove('btn-accent-cyan');
            atMicBtn.classList.add('btn-accent-emerald');
            this.showToast(`Auto-Tune Mic AKTIF di nada ${atActiveRoot} ${atActiveScale}! Bernyanyilah di Mic.`, 'success');
          } catch (err) {
            console.error('Failed to start AT mic:', err);
            this.showToast('Gagal akses mikrofon: ' + err.message, 'error');
          }
        }
      });
    }

    // 6. Multiband Stem Isolation Studio
    let stemCrossover = null;
    const initStemNode = async () => {
      await this.engine.init();
      if (!stemCrossover) {
        stemCrossover = AudioEffects.createStemCrossover(this.engine.ctx);
        this.engine.masterBus.connect(stemCrossover.input);
        stemCrossover.output.connect(this.engine.masterEQ.input);
      }
      return stemCrossover;
    };

    this.safeOn('btn-open-stems-modal', 'click', async () => {
      await initStemNode();
      const modal = document.getElementById('stems-modal');
      if (modal) modal.classList.add('active');
    });

    // Stem Sliders
    ['vocal', 'drums', 'bass', 'inst'].forEach(stem => {
      const slider = document.getElementById(`slider-stem-${stem}`);
      if (slider) {
        slider.addEventListener('input', async (e) => {
          const node = await initStemNode();
          const val = parseInt(e.target.value) / 100;
          node.setStemGain(stem, val);
        });
      }

      const muteBtn = document.getElementById(`btn-mute-${stem}`);
      if (muteBtn) {
        muteBtn.addEventListener('click', async () => {
          const node = await initStemNode();
          const isMuted = node.toggleMute(stem);
          muteBtn.classList.toggle('muted', isMuted);
          muteBtn.textContent = isMuted ? 'MUTED' : 'MUTE';
          this.showToast(`Stem ${stem.toUpperCase()}: ${isMuted ? 'Muted' : 'Unmuted'}`, isMuted ? 'warn' : 'info');
        });
      }
    });

    // Stem Quick Presets
    this.safeOn('btn-preset-acapella', 'click', async () => {
      const node = await initStemNode();
      node.setStemGain('vocal', 1.2);
      node.setStemGain('drums', 0.0);
      node.setStemGain('bass', 0.0);
      node.setStemGain('inst', 0.0);
      ['drums', 'bass', 'inst'].forEach(s => {
        const b = document.getElementById(`btn-mute-${s}`);
        if (b) { b.classList.add('muted'); b.textContent = 'MUTED'; }
      });
      const vb = document.getElementById('btn-mute-vocal');
      if (vb) { vb.classList.remove('muted'); vb.textContent = 'MUTE'; }
      this.showToast('🎙️ Mode Solo Acapella Diaktifkan!', 'success');
    });

    this.safeOn('btn-preset-backing', 'click', async () => {
      const node = await initStemNode();
      node.setStemGain('vocal', 0.0);
      node.setStemGain('drums', 1.0);
      node.setStemGain('bass', 1.0);
      node.setStemGain('inst', 1.0);
      const vb = document.getElementById('btn-mute-vocal');
      if (vb) { vb.classList.add('muted'); vb.textContent = 'MUTED'; }
      ['drums', 'bass', 'inst'].forEach(s => {
        const b = document.getElementById(`btn-mute-${s}`);
        if (b) { b.classList.remove('muted'); b.textContent = 'MUTE'; }
      });
      this.showToast('🎶 Mode Instrumental Backing Diaktifkan!', 'success');
    });

    this.safeOn('btn-preset-reset-stems', 'click', async () => {
      const node = await initStemNode();
      ['vocal', 'drums', 'bass', 'inst'].forEach(s => {
        node.setStemGain(s, 1.0);
        const sl = document.getElementById(`slider-stem-${s}`);
        if (sl) sl.value = 100;
        const b = document.getElementById(`btn-mute-${s}`);
        if (b) { b.classList.remove('muted'); b.textContent = 'MUTE'; }
      });
      this.showToast('🔄 Seluruh frekuensi stem di-reset ke normal.', 'info');
    });

    // 7. Interactive Visual Parametric EQ Graph (FabFilter Pro-Q Style)
    const initVisualEQ = async () => {
      await this.engine.init();
      if (!this.interactiveEQ) {
        const canvas = document.getElementById('interactive-eq-canvas');
        if (canvas) {
          this.interactiveEQ = new InteractiveEQ(canvas, this.engine, this);
        }
      }
      const chId = parseInt(document.getElementById('eq-channel-select')?.value) || this.selectedChannelId;
      const targetCh = this.engine.channels.find(c => c.id === chId) || this.engine.channels[0];
      if (this.interactiveEQ && targetCh) {
        this.interactiveEQ.setChannel(targetCh);
      }
    };

    this.safeOn('btn-open-visual-eq', 'click', async () => {
      await initVisualEQ();
      const modal = document.getElementById('visual-eq-modal');
      if (modal) modal.classList.add('active');
    });

    const eqChSelect = document.getElementById('eq-channel-select');
    if (eqChSelect) {
      eqChSelect.addEventListener('change', (e) => {
        const chId = parseInt(e.target.value);
        const ch = this.engine.channels.find(c => c.id === chId);
        if (this.interactiveEQ && ch) {
          this.interactiveEQ.setChannel(ch);
          this.showToast(`Visual EQ terhubung ke: ${ch.name}`, 'info');
        }
      });
    }

    // 8. EBU R128 & Spotify LUFS Loudness Meter
    const initLoudnessMeter = async () => {
      await this.engine.init();
      if (!this.loudnessMeter) {
        this.loudnessMeter = new LoudnessMeter(this.engine.ctx, this.engine.masterBus);
        
        const intEl = document.getElementById('meter-lufs-int');
        const stEl = document.getElementById('meter-lufs-st');
        const tpEl = document.getElementById('meter-lufs-tp');
        const diffEl = document.getElementById('meter-lufs-diff');
        const clipEl = document.getElementById('meter-clip-badge');

        this.loudnessMeter.start((data) => {
          if (intEl) intEl.textContent = data.integrated > -65 ? `${data.integrated.toFixed(1)} LUFS` : '-INF';
          if (stEl) stEl.textContent = data.shortTerm > -65 ? `${data.shortTerm.toFixed(1)} LUFS` : '-INF';
          if (tpEl) tpEl.textContent = data.truePeak > -65 ? `${data.maxTruePeak.toFixed(1)} dBTP` : '-INF';
          
          if (diffEl) {
            const diff = data.integrated - data.target;
            const sign = diff > 0 ? '+' : '';
            diffEl.textContent = `${sign}${diff.toFixed(1)} LU dari target (${data.target} LUFS)`;
            diffEl.style.color = Math.abs(diff) <= 1.0 ? '#10b981' : diff > 0 ? '#ef4444' : '#38bdf8';
          }

          if (clipEl) {
            if (data.isClipping) {
              clipEl.textContent = '⚠️ CLIPPING DETECTED';
              clipEl.style.color = '#ef4444';
            } else {
              clipEl.textContent = 'SAFE (No Clip)';
              clipEl.style.color = '#10b981';
            }
          }
        });
      }
    };

    this.safeOn('btn-open-lufs-modal', 'click', async () => {
      await initLoudnessMeter();
      const modal = document.getElementById('lufs-modal');
      if (modal) modal.classList.add('active');
    });

    const lufsTargetSelect = document.getElementById('lufs-target-select');
    if (lufsTargetSelect) {
      lufsTargetSelect.addEventListener('change', (e) => {
        const val = parseFloat(e.target.value);
        if (this.loudnessMeter) {
          this.loudnessMeter.setTarget(val);
          this.showToast(`Standar Loudness diubah ke: ${e.target.options[e.target.selectedIndex].text}`, 'info');
        }
      });
    }

    this.safeOn('btn-reset-lufs', 'click', () => {
      if (this.loudnessMeter) {
        this.loudnessMeter.reset();
        this.showToast('Meter akumulasi LUFS di-reset.', 'info');
      }
    });

    // 9. Commercial A/B Reference Track Comparison
    const initReferenceTrack = async () => {
      await this.engine.init();
      if (!this.referenceTrack) {
        this.referenceTrack = new ReferenceTrack(this.engine, this);
      }
      return this.referenceTrack;
    };

    this.safeOn('btn-open-ab-modal', 'click', async () => {
      await initReferenceTrack();
      const modal = document.getElementById('ab-reference-modal');
      if (modal) modal.classList.add('active');
    });

    const refFileInput = document.getElementById('ref-file-input');
    const refTrackName = document.getElementById('ref-track-name');
    const refGainVal = document.getElementById('ref-gain-match-val');
    const sliderRefGain = document.getElementById('slider-ref-gain');

    if (refFileInput) {
      refFileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const ref = await initReferenceTrack();
        this.showToast(`Mendekode file referensi "${file.name}"...`, 'info');
        await ref.loadReferenceFile(file);
        if (refTrackName) refTrackName.textContent = `File aktif: ${file.name} (Loudness match: ${ref.gainMatchDb > 0 ? '+' : ''}${ref.gainMatchDb.toFixed(1)} dB)`;
        if (sliderRefGain) sliderRefGain.value = ref.gainMatchDb;
        if (refGainVal) refGainVal.textContent = `${ref.gainMatchDb > 0 ? '+' : ''}${ref.gainMatchDb.toFixed(1)} dB`;
        this.showToast(`Lagu referensi siap! Klik Track B untuk mendengarkan.`, 'success');
      });
    }

    const btnModeA = document.getElementById('btn-mode-a');
    const btnModeB = document.getElementById('btn-mode-b');

    const updateABButtons = (mode) => {
      if (btnModeA && btnModeB) {
        if (mode === 'A') {
          btnModeA.style.background = '#064e3b';
          btnModeA.style.borderColor = '#10b981';
          btnModeA.style.color = '#34d399';
          btnModeB.style.background = '#141e17';
          btnModeB.style.borderColor = '#2e4433';
          btnModeB.style.color = '#6b7280';
        } else {
          btnModeB.style.background = '#064e3b';
          btnModeB.style.borderColor = '#10b981';
          btnModeB.style.color = '#34d399';
          btnModeA.style.background = '#141e17';
          btnModeA.style.borderColor = '#2e4433';
          btnModeA.style.color = '#6b7280';
        }
      }
    };

    if (btnModeA) {
      btnModeA.addEventListener('click', async () => {
        const ref = await initReferenceTrack();
        if (ref.activeMode === 'B') {
          ref.toggleAB();
          updateABButtons('A');
        }
      });
    }

    if (btnModeB) {
      btnModeB.addEventListener('click', async () => {
        const ref = await initReferenceTrack();
        if (ref.activeMode === 'A') {
          ref.toggleAB();
          updateABButtons('B');
        }
      });
    }

    if (sliderRefGain) {
      sliderRefGain.addEventListener('input', async (e) => {
        const ref = await initReferenceTrack();
        const val = parseFloat(e.target.value);
        ref.gainMatchDb = val;
        if (refGainVal) refGainVal.textContent = `${val > 0 ? '+' : ''}${val.toFixed(1)} dB`;
        if (ref.isPlaying) {
          ref.playRefTrack();
        }
      });
    }

    // 10. OBS Studio Overlay Modal & Copy URL
    this.safeOn('btn-open-obs-modal', 'click', () => {
      const modal = document.getElementById('obs-modal');
      const input = document.getElementById('obs-url-input');
      if (input) {
        const fullUrl = window.location.href.split('?')[0].replace('index.php', '') + 'overlay.php';
        input.value = fullUrl;
      }
      if (modal) modal.classList.add('active');
    });

    this.safeOn('btn-copy-obs-url', 'click', () => {
      const input = document.getElementById('obs-url-input');
      if (input) {
        navigator.clipboard.writeText(input.value);
        this.showToast('URL OBS Overlay berhasil dicopy ke clipboard!', 'success');
      }
    });

    // 6. PWA Install Prompt Handler
    const pwaBtn = document.getElementById('btn-pwa-install');
    let deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      if (pwaBtn) pwaBtn.style.display = 'inline-flex';
    });

    if (pwaBtn) {
      pwaBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          if (outcome === 'accepted') {
            this.showToast('StudioMaster Pro berhasil diinstall!', 'success');
          }
          deferredPrompt = null;
          pwaBtn.style.display = 'none';
        }
      });
    }

    // 7. Custom Soundboard Pad Editor Actions
    this.safeOn('btn-record-mic-sample', 'click', async () => {
      const padId = parseInt(document.getElementById('edit-pad-id').value) || 1;
      this.showToast(`Mulai merekam 2 detik untuk Pad ${padId}... Bicara sekarang!`, 'warn');
      const success = await this.samplePads.recordMicToPad(padId, 2.0);
      if (success) {
        this.showToast(`Suara mic berhasil disimpan ke Pad ${padId}!`, 'success');
        const modal = document.getElementById('pad-editor-modal');
        if (modal) modal.classList.remove('active');
      }
    });

    const padFileInput = document.getElementById('pad-file-input');
    if (padFileInput) {
      padFileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const padId = parseInt(document.getElementById('edit-pad-id').value) || 1;
        const success = await this.samplePads.loadCustomFileToPad(padId, file);
        if (success) {
          this.showToast(`File "${file.name}" berhasil dipasang ke Pad ${padId}!`, 'success');
          const modal = document.getElementById('pad-editor-modal');
          if (modal) modal.classList.remove('active');
        }
      });
    }

    // 8. Shortcuts Modal Button
    this.safeOn('btn-open-shortcuts', 'click', () => {
      const modal = document.getElementById('shortcuts-modal');
      if (modal) modal.classList.add('active');
    });
  }

  // ==========================================================================
  // DAW Keyboard Shortcuts Engine
  // ==========================================================================
  bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (this.playBtn) this.playBtn.click();
          break;
        case 'KeyR':
          e.preventDefault();
          if (this.recBtn) this.recBtn.click();
          break;
        case 'KeyL':
          e.preventDefault();
          if (this.loopBtn) this.loopBtn.click();
          break;
        case 'KeyM': {
          e.preventDefault();
          const curCh = this.engine.channels.find(c => c.id === this.selectedChannelId);
          if (curCh) {
            const strip = document.querySelector(`.channel-strip[data-channel-id="${curCh.id}"]`);
            if (strip) {
              const mBtn = strip.querySelector('.btn-mute');
              if (mBtn) mBtn.click();
            }
          }
          break;
        }
        case 'KeyS': {
          e.preventDefault();
          const curCh = this.engine.channels.find(c => c.id === this.selectedChannelId);
          if (curCh) {
            const strip = document.querySelector(`.channel-strip[data-channel-id="${curCh.id}"]`);
            if (strip) {
              const sBtn = strip.querySelector('.btn-solo');
              if (sBtn) sBtn.click();
            }
          }
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          const curCh = this.engine.channels.find(c => c.id === this.selectedChannelId);
          if (curCh) {
            const curDb = AudioEffects.gainToDb(curCh.gain);
            const nextGain = AudioEffects.dbToGain(curDb + 1.0);
            curCh.setGain(nextGain);
            this.updateChannelFaderVisual(curCh);
          }
          break;
        }
        case 'ArrowDown': {
          e.preventDefault();
          const curCh = this.engine.channels.find(c => c.id === this.selectedChannelId);
          if (curCh) {
            const curDb = AudioEffects.gainToDb(curCh.gain);
            const nextGain = AudioEffects.dbToGain(curDb - 1.0);
            curCh.setGain(nextGain);
            this.updateChannelFaderVisual(curCh);
          }
          break;
        }
        case 'ArrowLeft': {
          e.preventDefault();
          const prevCh = this.engine.channels.find(c => c.id === this.selectedChannelId - 1);
          if (prevCh) this.selectChannel(prevCh.id);
          break;
        }
        case 'ArrowRight': {
          e.preventDefault();
          const nextCh = this.engine.channels.find(c => c.id === this.selectedChannelId + 1);
          if (nextCh) this.selectChannel(nextCh.id);
          break;
        }
        case 'Slash':
          if (e.shiftKey) {
            const modal = document.getElementById('shortcuts-modal');
            if (modal) modal.classList.add('active');
          }
          break;
      }

      if (e.key >= '1' && e.key <= '8' && !e.shiftKey && !e.ctrlKey) {
        const num = parseInt(e.key);
        if (this.engine.channels[num - 1]) {
          this.selectChannel(this.engine.channels[num - 1].id);
        }
      }
    });
  }

  selectChannel(channelId) {
    this.selectedChannelId = channelId;
    document.querySelectorAll('.channel-strip').forEach(s => {
      s.classList.toggle('selected', parseInt(s.dataset.channelId) === channelId);
    });
  }

  updateChannelFaderVisual(channel) {
    const strip = document.querySelector(`.channel-strip[data-channel-id="${channel.id}"]`);
    if (!strip) return;
    const faderCap = strip.querySelector(`#fader-cap-${channel.id}`);
    const dbReadout = strip.querySelector(`#fader-db-${channel.id}`);
    const norm = Math.min(1.0, channel.gain / 1.5);
    if (faderCap) faderCap.style.bottom = `${norm * 88}%`;
    if (dbReadout) {
      const db = AudioEffects.gainToDb(channel.gain);
      dbReadout.textContent = isFinite(db) ? `${db > 0 ? '+' : ''}${db.toFixed(1)} dB` : '-INF';
    }
  }

  // ==========================================================================
  // Studio Equalizer & DSP FX Suite Event Binding
  // ==========================================================================
  bindDspSuiteEvents() {
    const dspModal = document.getElementById('dsp-modal');

    this.safeOn('btn-open-dsp', 'click', async () => {
      await this.engine.init();
      if (dspModal) dspModal.classList.add('active');
    });

    this.safeOn('btn-close-dsp', 'click', () => {
      if (dspModal) dspModal.classList.remove('active');
    });

    document.querySelectorAll('.pill-preset-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        await this.engine.init();
        document.querySelectorAll('.pill-preset-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.dspSuite.applyDspPreset(btn.dataset.preset);
      });
    });

    document.querySelectorAll('.btn-ambient-pill').forEach(btn => {
      btn.addEventListener('click', async () => {
        await this.engine.init();
        document.querySelectorAll('.btn-ambient-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const volSlider = document.getElementById('ambient-vol-slider');
        const vol = volSlider ? parseInt(volSlider.value) / 100 : 0.4;
        this.dspSuite.setAmbientNoise(btn.dataset.type, vol);
      });
    });

    const ambientVolSlider = document.getElementById('ambient-vol-slider');
    const ambientVolReadout = document.getElementById('ambient-vol-readout');
    if (ambientVolSlider) {
      ambientVolSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        if (ambientVolReadout) ambientVolReadout.textContent = `${val}%`;
        if (this.dspSuite.ambientType !== 'off') {
          this.dspSuite.setAmbientNoise(this.dspSuite.ambientType, val / 100);
        }
      });
    }

    const speedSlider = document.getElementById('slider-speed');
    if (speedSlider) {
      speedSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value) / 100;
        this.dspSuite.setSpeed(val);
      });
    }

    const crossfadeSlider = document.getElementById('slider-crossfade');
    const crossfadeReadout = document.getElementById('crossfade-val-readout');
    if (crossfadeSlider) {
      crossfadeSlider.addEventListener('input', (e) => {
        if (crossfadeReadout) crossfadeReadout.textContent = `${e.target.value} detik`;
      });
    }

    const preampSlider = document.getElementById('slider-preamp');
    const preampReadout = document.getElementById('preamp-val-readout');
    if (preampSlider) {
      preampSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        if (preampReadout) preampReadout.textContent = `${val}%`;
        this.dspSuite.setPreampBoost(val);
      });
    }

    const orbitSlider = document.getElementById('slider-orbit');
    const orbitReadout = document.getElementById('orbit-val-readout');
    if (orbitSlider) {
      orbitSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value) / 100;
        if (orbitReadout) orbitReadout.textContent = `${val.toFixed(1)}x`;
        this.dspSuite.set8DOrbitSpeed(val);
      });
    }

    document.querySelectorAll('.btn-genre-pill').forEach(btn => {
      btn.addEventListener('click', async () => {
        await this.engine.init();
        document.querySelectorAll('.btn-genre-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.dspSuite.applyGenrePreset(btn.dataset.genre);
      });
    });

    for (let i = 0; i < 10; i++) {
      const slider = document.getElementById(`eq-slider-${i}`);
      if (slider) {
        slider.addEventListener('input', async (e) => {
          await this.engine.init();
          const gain = parseFloat(e.target.value);
          this.dspSuite.setBandGain(i, gain);
        });
      }
    }

    const subBassSlider = document.getElementById('slider-sub-bass');
    if (subBassSlider) {
      subBassSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.dspSuite.setSubBass(val);
      });
    }

    const airTrebleSlider = document.getElementById('slider-air-treble');
    if (airTrebleSlider) {
      airTrebleSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.dspSuite.setAirTreble(val);
      });
    }

    const levelingBtn = document.getElementById('btn-toggle-leveling');
    const levelingStatus = document.getElementById('leveling-status-readout');
    if (levelingBtn) {
      levelingBtn.addEventListener('click', () => {
        const active = this.dspSuite.toggleAutoLeveling();
        if (levelingStatus) {
          levelingStatus.textContent = active ? 'ON' : 'OFF';
          levelingStatus.style.color = active ? '#10b981' : '#ef4444';
        }
        levelingBtn.textContent = active ? 'Auto Leveling Aktif' : 'Auto Leveling Mati';
        levelingBtn.classList.toggle('off', !active);
      });
    }
  }

  // ==========================================================================
  // Synchronize ALL Mixer Console UI Knobs, Sliders, and Faders from DSP Preset
  // ==========================================================================
  syncAllMixerControlsFromPreset(config) {
    config.masterEQ.forEach((gainDb, idx) => {
      this.engine.setMasterEQBand(idx, gainDb);
      const slider = document.getElementById(`master-eq-band-${idx}`);
      if (slider) slider.value = gainDb;
    });

    const revNorm = (config.revDecay - 0.5) / 4.5;
    this.updateKnobVisual(document.getElementById('knob-reverb-decay'), revNorm, `${config.revDecay.toFixed(1)}s`);

    const dlyNorm = (config.dlyTime - 0.1) / 0.9;
    this.updateKnobVisual(document.getElementById('knob-delay-time'), dlyNorm, `${Math.round(config.dlyTime * 1000)}ms`);

    const fbNorm = config.dlyFeedback / 0.85;
    this.updateKnobVisual(document.getElementById('knob-delay-feedback'), fbNorm, `${Math.round(config.dlyFeedback * 100)}%`);

    this.engine.channels.forEach((channel, chIndex) => {
      channel.setEQLow(config.chLow);
      channel.setEQMid(config.chMid, config.chMidFreq || 1000);
      channel.setEQHigh(config.chHigh);
      channel.setSendReverb(config.chRevSend);
      channel.setSendDelay(config.chDlySend);

      let targetPan = channel.pan;
      if (config.panMode === 'wide') {
        targetPan = chIndex % 2 === 0 ? -0.55 : 0.55;
      } else if (config.panMode === 'spread') {
        const spreadPans = [-0.6, 0.6, -0.25, 0.25];
        targetPan = spreadPans[chIndex % spreadPans.length];
      }
      channel.setPan(targetPan);

      const strip = document.querySelector(`.channel-strip[data-channel-id="${channel.id}"]`);
      if (!strip) return;

      const highNorm = (config.chHigh + 15) / 30;
      this.updateKnobVisual(
        strip.querySelector('.knob-control[data-param="eqHigh"]'),
        highNorm,
        `${config.chHigh > 0 ? '+' : ''}${config.chHigh.toFixed(1)} dB`
      );

      const midNorm = (config.chMid + 15) / 30;
      this.updateKnobVisual(
        strip.querySelector('.knob-control[data-param="eqMid"]'),
        midNorm,
        `${config.chMid > 0 ? '+' : ''}${config.chMid.toFixed(1)} dB`
      );

      const freqVal = config.chMidFreq || 1000;
      const freqNorm = (Math.log10(freqVal) - Math.log10(200)) / (Math.log10(8000) - Math.log10(200));
      this.updateKnobVisual(
        strip.querySelector('.knob-control[data-param="eqMidFreq"]'),
        freqNorm,
        freqVal >= 1000 ? `${(freqVal / 1000).toFixed(1)}k` : `${freqVal}Hz`
      );

      const lowNorm = (config.chLow + 15) / 30;
      this.updateKnobVisual(
        strip.querySelector('.knob-control[data-param="eqLow"]'),
        lowNorm,
        `${config.chLow > 0 ? '+' : ''}${config.chLow.toFixed(1)} dB`
      );

      this.updateKnobVisual(
        strip.querySelector('.knob-control[data-param="sendReverb"]'),
        config.chRevSend,
        `${Math.round(config.chRevSend * 100)}%`
      );

      this.updateKnobVisual(
        strip.querySelector('.knob-control[data-param="sendDelay"]'),
        config.chDlySend,
        `${Math.round(config.chDlySend * 100)}%`
      );

      const panNorm = (targetPan + 1) / 2;
      let panText = 'C';
      if (Math.abs(targetPan) >= 0.05) {
        panText = targetPan < 0 ? `L${Math.round(Math.abs(targetPan) * 100)}` : `R${Math.round(targetPan * 100)}`;
      }
      this.updateKnobVisual(
        strip.querySelector('.knob-control[data-param="pan"]'),
        panNorm,
        panText
      );
    });
  }

  updateKnobVisual(knobEl, normVal, displayText) {
    if (!knobEl) return;
    const norm = Math.max(0, Math.min(1, normVal));
    const deg = -135 + norm * 270;
    const pointer = knobEl.querySelector('.knob-pointer');
    if (pointer) {
      pointer.style.transition = 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
      pointer.style.transform = `rotate(${deg}deg)`;
      setTimeout(() => { pointer.style.transition = ''; }, 300);
    }
    const valBadge = knobEl.querySelector('.knob-value');
    if (valBadge && displayText) {
      valBadge.textContent = displayText;
    }
  }

  // ==========================================================================
  // Audio I/O Routing Manager Event Binding
  // ==========================================================================
  bindRoutingEvents() {
    const routingModal = document.getElementById('routing-modal');

    this.safeOn('btn-open-routing', 'click', async () => {
      await this.engine.init();
      await this.routing.enumerateDevices();
      if (routingModal) routingModal.classList.add('active');
    });

    this.safeOn('btn-close-routing', 'click', () => {
      if (routingModal) routingModal.classList.remove('active');
    });

    const masterOutputSelect = document.getElementById('master-output-select');
    const modalMasterOutputSelect = document.getElementById('modal-master-output-select');

    const handleOutputChange = async (deviceId) => {
      await this.routing.setMasterOutputDevice(deviceId);
      if (masterOutputSelect) masterOutputSelect.value = deviceId;
      if (modalMasterOutputSelect) modalMasterOutputSelect.value = deviceId;
    };

    if (masterOutputSelect) {
      masterOutputSelect.addEventListener('change', (e) => handleOutputChange(e.target.value));
    }
    if (modalMasterOutputSelect) {
      modalMasterOutputSelect.addEventListener('change', (e) => handleOutputChange(e.target.value));
    }

    this.safeOn('btn-modal-capture-app', 'click', async () => {
      const antiEchoChk = document.getElementById('chk-anti-echo');
      const antiEcho = antiEchoChk ? antiEchoChk.checked : true;
      const ch = this.engine.channels.find(c => c.id === this.selectedChannelId) || this.engine.channels[0];
      await this.routing.captureApplicationAudio(ch, antiEcho);
    });

    this.safeOn('btn-route-hw-input', 'click', async () => {
      const hwSelect = document.getElementById('hw-input-select');
      const deviceId = hwSelect ? hwSelect.value : 'default';
      const ch = this.engine.channels.find(c => c.id === this.selectedChannelId) || this.engine.channels[0];
      await this.routing.routeHardwareInputToChannel(deviceId, ch, 'MIC / LINE-IN');
    });

    this.safeOn('btn-route-virtual-cable', 'click', async () => {
      const vcSelect = document.getElementById('virtual-cable-select');
      const deviceId = vcSelect ? vcSelect.value : 'default';
      const ch = this.engine.channels.find(c => c.id === this.selectedChannelId) || this.engine.channels[0];
      await this.routing.routeHardwareInputToChannel(deviceId, ch, 'VIRTUAL CABLE');
    });

    this.safeOn('btn-refresh-devices', 'click', async () => {
      await this.routing.enumerateDevices();
      this.showToast('Daftar perangkat jack audio diperbarui.', 'info');
    });
  }

  updateRoutingModalTargetChannel() {
    const ch = this.engine.channels.find(c => c.id === this.selectedChannelId) || this.engine.channels[0];
    const targetLabel = document.getElementById('routing-target-channel-name');
    if (targetLabel && ch) {
      targetLabel.textContent = `${ch.name} (CH ${ch.id})`;
    }
  }

  updateChannelSourceBadge(channelId, label) {
    const badge = document.getElementById(`source-badge-${channelId}`);
    if (badge) {
      badge.textContent = `SRC: ${label.toUpperCase()}`;
      badge.style.color = '#38bdf8';
      badge.style.fontWeight = '700';
    }
  }

  createDefaultChannel(name, color = '#3b82f6') {
    const channel = this.engine.addChannel(name, { color });
    this.renderChannelStrip(channel);
    return channel;
  }

  renderChannelStrip(channel) {
    const strip = document.createElement('div');
    strip.className = `channel-strip ${channel.id === this.selectedChannelId ? 'selected' : ''}`;
    strip.dataset.channelId = channel.id;

    strip.innerHTML = `
      <!-- Strip Header -->
      <div class="strip-header">
        <div class="strip-number">
          <span>CH ${channel.id < 10 ? '0' + channel.id : channel.id}</span>
          <div class="channel-color-tag" style="background: ${channel.color}"></div>
        </div>
        <div class="scribble-strip">
          <input type="text" class="track-name-input" value="${channel.name}">
        </div>
        <div class="strip-source-badge interactive-source-badge" id="source-badge-${channel.id}" title="Klik untuk ganti input sumber suara (Mic/App/Virtual Cable)">SRC: ${channel.sourceType.toUpperCase()}</div>
      </div>

      <!-- Gain / Trim Section -->
      <div class="strip-section">
        <div class="section-title">PREAMP / TRIM</div>
        <div class="knob-control knob-cyan" data-param="trim" data-ch="${channel.id}" title="Trim (+/-24dB)">
          <div class="knob-outer"><div class="knob-pointer"></div></div>
          <span class="knob-label">TRIM</span>
          <span class="knob-value">0.0 dB</span>
        </div>
      </div>

      <!-- 3-Band Parametric EQ -->
      <div class="strip-section">
        <div class="section-title">3-BAND EQ</div>
        <div class="eq-knobs-grid">
          <div class="knob-row">
            <div class="knob-control knob-blue" data-param="eqHigh" data-ch="${channel.id}" title="High (10kHz)">
              <div class="knob-outer"><div class="knob-pointer"></div></div>
              <span class="knob-label">HIGH</span>
              <span class="knob-value">0.0 dB</span>
            </div>
            <div class="knob-control knob-amber" data-param="eqMid" data-ch="${channel.id}" title="Mid Gain">
              <div class="knob-outer"><div class="knob-pointer"></div></div>
              <span class="knob-label">MID</span>
              <span class="knob-value">0.0 dB</span>
            </div>
          </div>
          <div class="knob-row">
            <div class="knob-control knob-purple" data-param="eqMidFreq" data-ch="${channel.id}" title="Mid Frequency (200Hz-8kHz)">
              <div class="knob-outer"><div class="knob-pointer"></div></div>
              <span class="knob-label">FREQ</span>
              <span class="knob-value">1.0k</span>
            </div>
            <div class="knob-control knob-cyan" data-param="eqLow" data-ch="${channel.id}" title="Low (80Hz)">
              <div class="knob-outer"><div class="knob-pointer"></div></div>
              <span class="knob-label">LOW</span>
              <span class="knob-value">0.0 dB</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Aux Sends (Reverb / Delay) -->
      <div class="strip-section">
        <div class="section-title">AUX SENDS</div>
        <div class="knob-row">
          <div class="knob-control knob-purple" data-param="sendReverb" data-ch="${channel.id}" title="Aux 1 (Reverb Send)">
            <div class="knob-outer"><div class="knob-pointer"></div></div>
            <span class="knob-label">REV</span>
            <span class="knob-value">0%</span>
          </div>
          <div class="knob-control knob-amber" data-param="sendDelay" data-ch="${channel.id}" title="Aux 2 (Delay Send)">
            <div class="knob-outer"><div class="knob-pointer"></div></div>
            <span class="knob-label">DLY</span>
            <span class="knob-value">0%</span>
          </div>
        </div>
      </div>

      <!-- Pan & Switches -->
      <div class="strip-section">
        <div class="knob-control knob-emerald" data-param="pan" data-ch="${channel.id}" title="Pan (L/R)">
          <div class="knob-outer"><div class="knob-pointer"></div></div>
          <span class="knob-label">PAN</span>
          <span class="knob-value">C</span>
        </div>

        <div class="strip-switches">
          <button class="btn-switch btn-solo" data-action="solo" title="Solo [S]">S</button>
          <button class="btn-switch btn-mute" data-action="mute" title="Mute [M]">M</button>
          <button class="btn-switch btn-rec" data-action="rec" title="Arm Record">R</button>
          <button class="btn-switch btn-fx" data-action="eq-bypass" title="EQ Bypass">EQ</button>
        </div>
      </div>

      <!-- Fader & LED VU Meter -->
      <div class="strip-fader-section">
        <div class="vu-meter-container" data-channel-id="${channel.id}">
          <div class="vu-meter-channel vu-channel-left">
            ${this.generateLedSegmentsHtml()}
          </div>
          <div class="vu-meter-channel vu-channel-right">
            ${this.generateLedSegmentsHtml()}
          </div>
        </div>

        <div class="fader-track-area">
          <div class="fader-scale-ticks">
            <span class="fader-tick">+6</span>
            <span class="fader-tick zero-db">0</span>
            <span class="fader-tick">-6</span>
            <span class="fader-tick">-18</span>
            <span class="fader-tick">-36</span>
            <span class="fader-tick">-INF</span>
          </div>
          <div class="fader-slot" id="fader-slot-${channel.id}">
            <div class="fader-cap" id="fader-cap-${channel.id}" style="bottom: 66%;">
              <div class="fader-cap-line"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="fader-db-readout" id="fader-db-${channel.id}">0.0 dB</div>
    `;

    strip.addEventListener('click', () => {
      this.selectChannel(channel.id);
    });

    this.channelsContainer.appendChild(strip);
    this.bindChannelStripEvents(strip, channel);
  }

  generateLedSegmentsHtml() {
    let html = '';
    for (let i = 0; i < 16; i++) {
      let colorClass = 'green';
      if (i >= 11 && i < 14) colorClass = 'yellow';
      else if (i >= 14) colorClass = 'red';
      html += `<div class="vu-led-segment ${colorClass}"></div>`;
    }
    return html;
  }

  bindChannelStripEvents(strip, channel) {
    const sourceBadge = strip.querySelector('.strip-source-badge');
    if (sourceBadge) {
      sourceBadge.addEventListener('click', async (e) => {
        e.stopPropagation();
        this.selectChannel(channel.id);
        await this.engine.init();
        await this.routing.enumerateDevices();
        this.updateRoutingModalTargetChannel();
        const modal = document.getElementById('routing-modal');
        if (modal) modal.classList.add('active');
      });
    }

    const nameInput = strip.querySelector('.track-name-input');
    if (nameInput) {
      nameInput.addEventListener('change', (e) => {
        channel.name = e.target.value.toUpperCase();
      });
    }

    const soloBtn = strip.querySelector('.btn-solo');
    if (soloBtn) {
      soloBtn.addEventListener('click', () => {
        channel.setSolo(!channel.isSolo);
        soloBtn.classList.toggle('active', channel.isSolo);
      });
    }

    const muteBtn = strip.querySelector('.btn-mute');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        channel.setMute(!channel.isMuted);
        muteBtn.classList.toggle('active', channel.isMuted);
      });
    }

    const recBtn = strip.querySelector('.btn-rec');
    if (recBtn) {
      recBtn.addEventListener('click', () => {
        channel.isRecArmed = !channel.isRecArmed;
        recBtn.classList.toggle('active', channel.isRecArmed);
      });
    }

    const fxBtn = strip.querySelector('.btn-fx');
    if (fxBtn) {
      fxBtn.addEventListener('click', () => {
        channel.setEQBypass(!channel.eqBypass);
        fxBtn.classList.toggle('active', !channel.eqBypass);
      });
    }

    strip.querySelectorAll('.knob-control').forEach(knobEl => {
      const param = knobEl.dataset.param;
      let initialNorm = 0.5;

      if (param === 'sendReverb' || param === 'sendDelay') initialNorm = 0.0;
      if (param === 'pan') initialNorm = 0.5;
      if (param === 'trim' || param === 'eqHigh' || param === 'eqMid' || param === 'eqLow') initialNorm = 0.5;
      if (param === 'eqMidFreq') initialNorm = 0.35;

      this.bindRotaryKnob(knobEl, (normVal) => {
        const valBadge = knobEl.querySelector('.knob-value');
        switch (param) {
          case 'trim': {
            const db = normVal * 48 - 24;
            channel.setTrim(db);
            if (valBadge) valBadge.textContent = `${db > 0 ? '+' : ''}${db.toFixed(1)} dB`;
            break;
          }
          case 'eqHigh': {
            const db = normVal * 30 - 15;
            channel.setEQHigh(db);
            if (valBadge) valBadge.textContent = `${db > 0 ? '+' : ''}${db.toFixed(1)} dB`;
            break;
          }
          case 'eqMid': {
            const db = normVal * 30 - 15;
            channel.setEQMid(db);
            if (valBadge) valBadge.textContent = `${db > 0 ? '+' : ''}${db.toFixed(1)} dB`;
            break;
          }
          case 'eqMidFreq': {
            const freq = Math.round(Math.pow(10, Math.log10(200) + normVal * (Math.log10(8000) - Math.log10(200))));
            channel.setEQMid(channel.eqMid, freq);
            if (valBadge) valBadge.textContent = freq >= 1000 ? `${(freq / 1000).toFixed(1)}k` : `${freq}Hz`;
            break;
          }
          case 'eqLow': {
            const db = normVal * 30 - 15;
            channel.setEQLow(db);
            if (valBadge) valBadge.textContent = `${db > 0 ? '+' : ''}${db.toFixed(1)} dB`;
            break;
          }
          case 'sendReverb': {
            channel.setSendReverb(normVal);
            if (valBadge) valBadge.textContent = `${Math.round(normVal * 100)}%`;
            break;
          }
          case 'sendDelay': {
            channel.setSendDelay(normVal);
            if (valBadge) valBadge.textContent = `${Math.round(normVal * 100)}%`;
            break;
          }
          case 'pan': {
            const panVal = normVal * 2 - 1;
            channel.setPan(panVal);
            if (valBadge) {
              if (Math.abs(panVal) < 0.05) valBadge.textContent = 'C';
              else if (panVal < 0) valBadge.textContent = `L${Math.round(Math.abs(panVal) * 100)}`;
              else valBadge.textContent = `R${Math.round(panVal * 100)}`;
            }
            break;
          }
        }
      }, initialNorm);
    });

    const faderCap = strip.querySelector(`#fader-cap-${channel.id}`);
    const faderSlot = strip.querySelector(`#fader-slot-${channel.id}`);
    const dbReadout = strip.querySelector(`#fader-db-${channel.id}`);

    if (faderCap && faderSlot) {
      this.bindFaderDrag(faderCap, faderSlot, (normVal) => {
        const gain = normVal * 1.5;
        channel.setGain(gain);
        const db = AudioEffects.gainToDb(gain);
        if (dbReadout) dbReadout.textContent = isFinite(db) ? `${db > 0 ? '+' : ''}${db.toFixed(1)} dB` : '-INF';
      });
    }
  }

  bindRotaryKnob(knobEl, onChange, defaultNorm = 0.5) {
    if (!knobEl) return;
    let currentNorm = defaultNorm;
    const pointer = knobEl.querySelector('.knob-pointer');

    const updateRotation = (norm) => {
      currentNorm = Math.max(0, Math.min(1, norm));
      const deg = -135 + currentNorm * 270;
      if (pointer) pointer.style.transform = `rotate(${deg}deg)`;
      onChange(currentNorm);
    };

    updateRotation(defaultNorm);

    let isDragging = false;
    let startY = 0;
    let startNorm = currentNorm;

    knobEl.addEventListener('pointerdown', (e) => {
      isDragging = true;
      startY = e.clientY;
      startNorm = currentNorm;
      try { knobEl.setPointerCapture(e.pointerId); } catch (err) {}
      e.preventDefault();
    });

    knobEl.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const dy = startY - e.clientY;
      const sensitivity = e.shiftKey ? 0.0015 : 0.006;
      const newNorm = startNorm + dy * sensitivity;
      updateRotation(newNorm);
    });

    knobEl.addEventListener('pointerup', (e) => {
      isDragging = false;
      try { knobEl.releasePointerCapture(e.pointerId); } catch (err) {}
    });

    knobEl.addEventListener('dblclick', () => {
      updateRotation(defaultNorm);
    });

    knobEl.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.04 : 0.04;
      updateRotation(currentNorm + delta);
    }, { passive: false });
  }

  bindFaderDrag(capEl, slotEl, onChange) {
    let isDragging = false;

    const updateFromY = (clientY) => {
      const rect = slotEl.getBoundingClientRect();
      const rawPos = rect.bottom - clientY;
      const norm = Math.max(0, Math.min(1, rawPos / rect.height));
      capEl.style.bottom = `${norm * 88}%`;
      onChange(norm);
    };

    capEl.addEventListener('pointerdown', (e) => {
      isDragging = true;
      try { capEl.setPointerCapture(e.pointerId); } catch (err) {}
      e.preventDefault();
    });

    capEl.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      updateFromY(e.clientY);
    });

    capEl.addEventListener('pointerup', (e) => {
      isDragging = false;
      try { capEl.releasePointerCapture(e.pointerId); } catch (err) {}
    });

    slotEl.addEventListener('click', (e) => {
      updateFromY(e.clientY);
    });
  }

  async loadDemoProject() {
    await this.engine.init();
    this.showToast('Membuat stem audio demo multi-track sintetis...', 'info');

    try {
      const stems = await SynthDemo.generateDemoStems(this.engine.ctx, this.engine.bpm, 8);
      if (this.channelsContainer) this.channelsContainer.innerHTML = '';
      this.engine.channels = [];

      stems.forEach(stem => {
        const ch = this.engine.addChannel(stem.name, { color: stem.color });
        ch.loadAudioBuffer(stem.buffer);
        ch.setGain(stem.fader);
        ch.setPan(stem.pan);
        this.renderChannelStrip(ch);
      });

      this.engine.updateDuration();
      this.showToast('Demo Project 4-Track berhasil dimuat! Tekan PLAY untuk mendengar.', 'success');
      this.engine.play();
      if (this.playBtn) this.playBtn.classList.add('active');
    } catch (err) {
      console.error('Failed to load demo:', err);
      this.showToast('Gagal memuat demo track: ' + err.message, 'error');
    }
  }

  async exportWav() {
    if (this.engine.channels.length === 0) {
      this.showToast('Tidak ada track audio untuk diexport.', 'warn');
      return;
    }
    this.showToast('Merender Master Mixdown ke WAV 16-Bit...', 'info');
    await this.recorder.exportMasterToWav(this.engine.channels, this.engine.totalDuration);
    this.showToast('Master WAV berhasil didownload!', 'success');
  }

  async exportAllStems() {
    if (this.engine.channels.length === 0) {
      this.showToast('Tidak ada track audio untuk diexport.', 'warn');
      return;
    }
    this.showToast('Merender dan mendownload seluruh Stems Multi-Track...', 'info');
    await this.recorder.exportAllStems(this.engine.channels, this.engine.totalDuration);
    this.showToast('Semua stem multi-track berhasil diexport!', 'success');
  }

  setupFileDragDrop() {
    window.addEventListener('dragover', (e) => e.preventDefault());
    window.addEventListener('drop', async (e) => {
      e.preventDefault();
      if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;

      await this.engine.init();
      const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('audio/') || f.name.match(/\.(mp3|wav|ogg|flac|m4a)$/i));

      for (const file of files) {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const audioBuffer = await this.engine.ctx.decodeAudioData(arrayBuffer);
          const channel = this.createDefaultChannel(file.name.slice(0, 12).toUpperCase());
          channel.loadAudioBuffer(audioBuffer);
          this.showToast(`Track "${file.name}" berhasil diimpor!`, 'success');
        } catch (err) {
          console.error('Decode error:', err);
          this.showToast(`Gagal decode audio ${file.name}`, 'error');
        }
      }
    });
  }

  updateTimecodeUI() {
    if (!this.timecodeEl) return;
    const cur = this.engine.getCurrentPlayhead();
    const mins = Math.floor(cur / 60);
    const secs = Math.floor(cur % 60);
    const ms = Math.floor((cur % 1) * 100);

    const tcStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    this.timecodeEl.textContent = tcStr;

    // Broadcast to OBS Studio Overlay
    if (this.dspSuite && this.dspSuite.obsBc) {
      const freq = this.visualizer && this.visualizer.freqData ? Array.from(this.visualizer.freqData.slice(0, 24)) : [];
      this.dspSuite.obsBc.postMessage({
        timecode: tcStr,
        preset: this.dspSuite.activePresetName || 'STUDIO CLEAN',
        leftLevel: this.engine.isPlaying ? Math.min(1.0, (this.engine.masterGain || 1.0) * 0.7) : 0,
        rightLevel: this.engine.isPlaying ? Math.min(1.0, (this.engine.masterGain || 1.0) * 0.75) : 0,
        freqData: freq
      });
    }
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  openSaveModal() {
    const modal = document.getElementById('save-project-modal');
    if (modal) modal.classList.add('active');
  }

  openProjectsModal() {
    const modal = document.getElementById('load-project-modal');
    if (modal) {
      modal.classList.add('active');
      this.fetchServerProjects();
    }
  }

  async fetchServerProjects() {
    const listEl = document.getElementById('server-projects-list');
    if (!listEl) return;
    listEl.innerHTML = '<div style="color:#94a3b8;">Memuat daftar project dari server...</div>';

    try {
      const res = await fetch('api/projects.php?action=list');
      const data = await res.json();
      if (data.success && data.projects.length > 0) {
        listEl.innerHTML = data.projects.map(p => `
          <div style="display:flex; justify-content:space-between; align-items:center; background:#161b24; padding:8px 12px; border-radius:6px; margin-bottom:6px;">
            <div>
              <div style="font-weight:700; color:#06b6d4;">${p.name}</div>
              <div style="font-size:10px; color:#64748b;">${p.updated_at}</div>
            </div>
            <button class="btn-action" onclick="window.app.loadProjectFromServer('${p.name}')">Buka</button>
          </div>
        `).join('');
      } else {
        listEl.innerHTML = '<div style="color:#64748b; font-size:12px;">Belum ada project tersimpan di server.</div>';
      }
    } catch (e) {
      listEl.innerHTML = '<div style="color:#ef4444; font-size:12px;">Tidak dapat menghubungi server API PHP.</div>';
    }
  }
}

// Instantiate and expose globally
window.addEventListener('DOMContentLoaded', () => {
  window.app = new StudioApp();
});
