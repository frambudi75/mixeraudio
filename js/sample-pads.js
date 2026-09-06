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
        e.preventDefault();
        this.triggerPad(pad.id);
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
        const noise = this.createNoiseBuffer(ctx, 0.2);
        const noiseSrc = ctx.createBufferSource();
        noiseSrc.buffer = noise;

        const gainO = ctx.createGain();
        const gainN = ctx.createGain();

        osc.frequency.setValueAtTime(220, t);
        osc.frequency.exponentialRampToValueAtTime(80, t + 0.1);
        gainO.gain.setValueAtTime(0.7, t);
        gainO.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

        gainN.gain.setValueAtTime(0.8, t);
        gainN.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

        osc.connect(gainO); gainO.connect(dest);
        noiseSrc.connect(gainN); gainN.connect(dest);

        osc.start(t); osc.stop(t + 0.15);
        noiseSrc.start(t); noiseSrc.stop(t + 0.22);
        break;
      }

      case 'clap': {
        for (let i = 0; i < 3; i++) {
          const delay = i * 0.015;
          const noise = this.createNoiseBuffer(ctx, 0.15);
          const noiseSrc = ctx.createBufferSource();
          noiseSrc.buffer = noise;
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.6 / (i + 1), t + delay);
          gain.gain.exponentialRampToValueAtTime(0.01, t + delay + 0.15);
          noiseSrc.connect(gain); gain.connect(dest);
          noiseSrc.start(t + delay); noiseSrc.stop(t + delay + 0.16);
        }
        break;
      }

      case 'hihat':
      case 'openhat': {
        const isOpen = pad.type === 'openhat';
        const noise = this.createNoiseBuffer(ctx, isOpen ? 0.35 : 0.06);
        const noiseSrc = ctx.createBufferSource();
        noiseSrc.buffer = noise;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 7000;
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
        // Simple synthetic ping for other FX
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
}
