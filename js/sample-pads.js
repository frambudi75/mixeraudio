/**
 * StudioMaster Pro - 16-Pad Soundboard & Sampler Launchpad
 */

export class SamplePads {
  constructor(engine) {
    this.engine = engine;
    this.pads = [];
    this.initDefaultPads();
  }

  initDefaultPads() {
    this.pads = [
      { id: 1, key: '1', name: 'KICK 808', color: 'color-1', type: 'kick808' },
      { id: 2, key: '2', name: 'SNARE', color: 'color-1', type: 'snare' },
      { id: 3, key: '3', name: 'CLAP', color: 'color-1', type: 'clap' },
      { id: 4, key: '4', name: 'HI-HAT', color: 'color-1', type: 'hihat' },
      { id: 5, key: 'Q', name: 'OPEN HAT', color: 'color-2', type: 'openhat' },
      { id: 6, key: 'W', name: 'CRASH', color: 'color-2', type: 'crash' },
      { id: 7, key: 'E', name: 'LOW TOM', color: 'color-2', type: 'tomlow' },
      { id: 8, key: 'R', name: 'HI TOM', color: 'color-2', type: 'tomhigh' },
      { id: 9, key: 'A', name: 'SUB DROP', color: 'color-3', type: 'subdrop' },
      { id: 10, key: 'S', name: 'LASER FX', color: 'color-3', type: 'laser' },
      { id: 11, key: 'D', name: 'AIR HORN', color: 'color-3', type: 'airhorn' },
      { id: 12, key: 'F', name: 'SCRATCH', color: 'color-3', type: 'scratch' },
      { id: 13, key: 'Z', name: 'RISER', color: 'color-4', type: 'riser' },
      { id: 14, key: 'X', name: 'HEY VOCAL', color: 'color-4', type: 'hey' },
      { id: 15, key: 'C', name: 'SIREN', color: 'color-4', type: 'siren' },
      { id: 16, key: 'V', name: 'NOISE FX', color: 'color-4', type: 'noise' }
    ];
  }

  renderGrid(containerEl) {
    if (!containerEl) return;
    containerEl.innerHTML = '';

    this.pads.forEach(pad => {
      const padEl = document.createElement('div');
      padEl.className = `sound-pad ${pad.color}`;
      padEl.dataset.padId = pad.id;
      padEl.innerHTML = `
        <span class="pad-key-hint">${pad.key}</span>
        <span class="pad-label">${pad.name}</span>
      `;

      padEl.addEventListener('pointerdown', (e) => {
        if (e.button === 0) { // Left click trigger
          e.preventDefault();
          this.triggerPad(pad.id);
        }
      });

      // Right Click -> Open Pad Sampler Editor
      padEl.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const modal = document.getElementById('pad-editor-modal');
        const padIdInput = document.getElementById('edit-pad-id');
        const subtitle = document.getElementById('pad-editor-subtitle');
        if (padIdInput) padIdInput.value = pad.id;
        if (subtitle) subtitle.textContent = `Atur suara untuk Pad ${pad.id} (${pad.name}) [Shortcut: ${pad.key}]`;
        if (modal) modal.classList.add('active');
      });

      // Drag & Drop audio file directly to Pad
      padEl.addEventListener('dragover', (e) => {
        e.preventDefault();
        padEl.style.outline = '2px solid #06b6d4';
      });
      padEl.addEventListener('dragleave', () => {
        padEl.style.outline = '';
      });
      padEl.addEventListener('drop', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        padEl.style.outline = '';
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          await this.loadCustomFileToPad(pad.id, e.dataTransfer.files[0]);
        }
      });

      containerEl.appendChild(padEl);
    });

    this.bindKeyboardEvents();
  }

  bindKeyboardEvents() {
    window.addEventListener('keydown', (e) => {
      // Don't trigger if typing in an input field
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

      const key = e.key.toUpperCase();
      const pad = this.pads.find(p => p.key === key);
      if (pad) {
        this.triggerPad(pad.id);
      }
    });
  }

  async triggerPad(padId) {
    await this.engine.init();
    const ctx = this.engine.ctx;
    const pad = this.pads.find(p => p.id === padId);
    if (!pad || !ctx) return;

    // Visual Flash Animation
    const padEl = document.querySelector(`.sound-pad[data-pad-id="${padId}"]`);
    if (padEl) {
      padEl.classList.add('triggered');
      setTimeout(() => padEl.classList.remove('triggered'), 150);
    }

    const t = ctx.currentTime;
    const dest = this.engine.masterBus;

    // Check if custom audio buffer is assigned to this pad
    if (pad.customBuffer) {
      try {
        const src = ctx.createBufferSource();
        src.buffer = pad.customBuffer;
        const padGain = ctx.createGain();
        padGain.gain.value = 1.0;
        src.connect(padGain);
        padGain.connect(dest);
        src.start(t);
        return;
      } catch (e) {
        console.warn('Error playing custom pad buffer:', e);
      }
    }

    switch (pad.type) {
      case 'kick808': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(35, t + 0.35);
        gain.gain.setValueAtTime(1.0, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(t);
        osc.stop(t + 0.45);
        break;
      }

      case 'snare': {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.exponentialRampToValueAtTime(80, t + 0.1);
        oscGain.gain.setValueAtTime(0.7, t);
        oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
        osc.connect(oscGain); oscGain.connect(dest);
        osc.start(t); osc.stop(t + 0.15);

        const noise = this.createNoiseBuffer(ctx, 0.2);
        const noiseSrc = ctx.createBufferSource();
        noiseSrc.buffer = noise;
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 1200;
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.8, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
        noiseSrc.connect(noiseFilter); noiseFilter.connect(noiseGain); noiseGain.connect(dest);
        noiseSrc.start(t); noiseSrc.stop(t + 0.2);
        break;
      }

      case 'clap': {
        const noise = this.createNoiseBuffer(ctx, 0.25);
        const noiseSrc = ctx.createBufferSource();
        noiseSrc.buffer = noise;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1000;
        filter.Q.value = 1.0;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.9, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);
        noiseSrc.connect(filter); filter.connect(gain); gain.connect(dest);
        noiseSrc.start(t); noiseSrc.stop(t + 0.25);
        break;
      }

      case 'hihat':
      case 'openhat': {
        const isOpen = pad.type === 'openhat';
        const noise = this.createNoiseBuffer(ctx, isOpen ? 0.35 : 0.08);
        const noiseSrc = ctx.createBufferSource();
        noiseSrc.buffer = noise;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 7500;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + (isOpen ? 0.3 : 0.05));
        noiseSrc.connect(filter); filter.connect(gain); gain.connect(dest);
        noiseSrc.start(t); noiseSrc.stop(t + (isOpen ? 0.35 : 0.07));
        break;
      }

      case 'laser': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(2200, t);
        osc.frequency.exponentialRampToValueAtTime(120, t + 0.25);
        gain.gain.setValueAtTime(0.6, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
        osc.connect(gain); gain.connect(dest);
        osc.start(t); osc.stop(t + 0.27);
        break;
      }

      case 'subdrop': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(110, t);
        osc.frequency.exponentialRampToValueAtTime(25, t + 1.2);
        gain.gain.setValueAtTime(1.0, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.25);
        osc.connect(gain); gain.connect(dest);
        osc.start(t); osc.stop(t + 1.3);
        break;
      }

      default: {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(440 + padId * 50, t);
        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
        osc.connect(gain); gain.connect(dest);
        osc.start(t); osc.stop(t + 0.35);
      }
    }
  }

  createNoiseBuffer(ctx, duration = 0.2) {
    const length = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  /**
   * Load custom audio file buffer into a specific Pad
   */
  async loadCustomFileToPad(padId, file) {
    await this.engine.init();
    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await this.engine.ctx.decodeAudioData(arrayBuffer);
      const pad = this.pads.find(p => p.id === padId);
      if (pad) {
        pad.customBuffer = audioBuffer;
        pad.name = file.name.slice(0, 9).toUpperCase();
        const padEl = document.querySelector(`.sound-pad[data-pad-id="${padId}"] .pad-label`);
        if (padEl) padEl.textContent = pad.name;
        return true;
      }
    } catch (err) {
      console.error('Failed to load custom sample to pad:', err);
      return false;
    }
    return false;
  }

  /**
   * Record live audio from microphone directly into a Pad (Sampler)
   */
  async recordMicToPad(padId, durationSeconds = 2.0) {
    await this.engine.init();
    const pad = this.pads.find(p => p.id === padId);
    if (!pad) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const arrayBuffer = await blob.arrayBuffer();
        pad.customBuffer = await this.engine.ctx.decodeAudioData(arrayBuffer);
        pad.name = `REC ${pad.key}`;
        const padEl = document.querySelector(`.sound-pad[data-pad-id="${padId}"] .pad-label`);
        if (padEl) padEl.textContent = pad.name;
      };

      mediaRecorder.start();
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') mediaRecorder.stop();
      }, durationSeconds * 1000);

      return true;
    } catch (e) {
      console.error('Mic recording to pad failed:', e);
      return false;
    }
  }
}
