/**
 * StudioMaster Pro - Interactive Parametric EQ Visual Graph
 * FabFilter Pro-Q style draggable node curve with real-time FFT spectrum background
 */

export class InteractiveEQ {
  constructor(canvasEl, engine, app) {
    this.canvas = canvasEl;
    this.ctx = canvasEl.getContext('2d');
    this.engine = engine;
    this.app = app;
    this.activeChannel = null;

    // 5 EQ Filter Bands
    this.bands = [
      { id: 1, type: 'highpass', name: 'Low Cut', freq: 40, gain: 0, Q: 0.7, color: '#ef4444' },
      { id: 2, type: 'lowshelf', name: 'Low Shelf', freq: 100, gain: 0, Q: 1.0, color: '#f59e0b' },
      { id: 3, type: 'peaking', name: 'Mid Bell 1', freq: 1000, gain: 0, Q: 1.4, color: '#10b981' },
      { id: 4, type: 'peaking', name: 'Mid Bell 2', freq: 3500, gain: 0, Q: 1.4, color: '#06b6d4' },
      { id: 5, type: 'highshelf', name: 'High Shelf', freq: 10000, gain: 0, Q: 1.0, color: '#a855f7' }
    ];

    this.selectedBandIdx = -1;
    this.isDragging = false;
    this.freqData = new Uint8Array(512);

    this.initEvents();
    this.startRenderLoop();
  }

  setChannel(channel) {
    this.activeChannel = channel;
    if (channel && channel.eqNodes) {
      // Sync bands from channel
      if (channel.lowCutFilter) {
        this.bands[0].freq = channel.lowCutFilter.frequency.value;
      }
      if (channel.eqNodes.lowShelf) {
        this.bands[1].gain = channel.eqNodes.lowShelf.gain.value;
      }
      if (channel.eqNodes.midPeak) {
        this.bands[2].freq = channel.eqNodes.midPeak.frequency.value;
        this.bands[2].gain = channel.eqNodes.midPeak.gain.value;
      }
      if (channel.eqNodes.highShelf) {
        this.bands[4].gain = channel.eqNodes.highShelf.gain.value;
      }
    }
  }

  // Coordinate transforms (Logarithmic Frequency: 20Hz - 20000Hz)
  freqToX(freq) {
    const minF = Math.log10(20);
    const maxF = Math.log10(20000);
    const norm = (Math.log10(Math.max(20, Math.min(20000, freq))) - minF) / (maxF - minF);
    return norm * this.canvas.width;
  }

  xToFreq(x) {
    const minF = Math.log10(20);
    const maxF = Math.log10(20000);
    const norm = Math.max(0, Math.min(1, x / this.canvas.width));
    return Math.pow(10, minF + norm * (maxF - minF));
  }

  gainToY(gainDb) {
    // -18dB (bottom) to +18dB (top), 0dB in the middle
    const maxDb = 18;
    const minDb = -18;
    const norm = (gainDb - minDb) / (maxDb - minDb);
    return this.canvas.height - norm * this.canvas.height;
  }

  yToGain(y) {
    const maxDb = 18;
    const minDb = -18;
    const norm = 1 - Math.max(0, Math.min(1, y / this.canvas.height));
    return Math.round((minDb + norm * (maxDb - minDb)) * 10) / 10;
  }

  initEvents() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    };

    this.canvas.addEventListener('pointerdown', (e) => {
      const pos = getPos(e);
      let foundIdx = -1;

      for (let i = 0; i < this.bands.length; i++) {
        const bx = this.freqToX(this.bands[i].freq);
        const by = this.gainToY(this.bands[i].gain);
        const dist = Math.hypot(pos.x - bx, pos.y - by);
        if (dist <= 18) {
          foundIdx = i;
          break;
        }
      }

      if (foundIdx !== -1) {
        this.selectedBandIdx = foundIdx;
        this.isDragging = true;
        this.canvas.setPointerCapture(e.pointerId);
      }
    });

    this.canvas.addEventListener('pointermove', (e) => {
      if (!this.isDragging || this.selectedBandIdx === -1) return;
      const pos = getPos(e);
      const band = this.bands[this.selectedBandIdx];

      // Update frequency
      if (band.type !== 'lowshelf' && band.type !== 'highshelf') {
        band.freq = Math.round(this.xToFreq(pos.x));
      }

      // Update gain
      if (band.type !== 'highpass') {
        band.gain = Math.max(-15, Math.min(15, this.yToGain(pos.y)));
      }

      this.applyBandToChannel(band);
    });

    const stopDrag = (e) => {
      this.isDragging = false;
    };

    this.canvas.addEventListener('pointerup', stopDrag);
    this.canvas.addEventListener('pointercancel', stopDrag);

    // Mouse wheel to adjust Q factor
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (this.selectedBandIdx !== -1) {
        const band = this.bands[this.selectedBandIdx];
        const delta = e.deltaY > 0 ? -0.2 : 0.2;
        band.Q = Math.max(0.3, Math.min(6.0, Math.round((band.Q + delta) * 10) / 10));
        this.applyBandToChannel(band);
      }
    });
  }

  applyBandToChannel(band) {
    if (!this.activeChannel) return;
    const ch = this.activeChannel;

    if (band.id === 1 && ch.lowCutFilter) {
      ch.lowCutFilter.frequency.setTargetAtTime(band.freq, this.engine.ctx.currentTime, 0.02);
    } else if (band.id === 2 && ch.eqNodes && ch.eqNodes.lowShelf) {
      ch.eqNodes.lowShelf.gain.setTargetAtTime(band.gain, this.engine.ctx.currentTime, 0.02);
    } else if (band.id === 3 && ch.eqNodes && ch.eqNodes.midPeak) {
      ch.eqNodes.midPeak.frequency.setTargetAtTime(band.freq, this.engine.ctx.currentTime, 0.02);
      ch.eqNodes.midPeak.gain.setTargetAtTime(band.gain, this.engine.ctx.currentTime, 0.02);
      ch.eqNodes.midPeak.Q.setTargetAtTime(band.Q, this.engine.ctx.currentTime, 0.02);
    } else if (band.id === 5 && ch.eqNodes && ch.eqNodes.highShelf) {
      ch.eqNodes.highShelf.gain.setTargetAtTime(band.gain, this.engine.ctx.currentTime, 0.02);
    }

    // Update active band readout UI in modal
    const readout = document.getElementById('eq-graph-readout');
    if (readout) {
      readout.textContent = `${band.name}: ${band.freq}Hz | ${band.gain > 0 ? '+' : ''}${band.gain}dB | Q=${band.Q}`;
    }
  }

  startRenderLoop() {
    const draw = () => {
      this.render();
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Background
    ctx.fillStyle = '#080c14';
    ctx.fillRect(0, 0, w, h);

    // 1. Grid lines (Frequency & Decibels)
    ctx.strokeStyle = '#182234';
    ctx.lineWidth = 1;

    // Decibel grid lines (-12dB, -6dB, 0dB, +6dB, +12dB)
    [-12, -6, 0, 6, 12].forEach(db => {
      const y = this.gainToY(db);
      ctx.beginPath();
      ctx.strokeStyle = db === 0 ? '#263854' : '#141c2b';
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();

      ctx.fillStyle = '#475569';
      ctx.font = '9px monospace';
      ctx.fillText(`${db > 0 ? '+' : ''}${db}dB`, 6, y - 3);
    });

    // Frequency grid lines (50Hz, 100Hz, 250Hz, 500Hz, 1kHz, 2kHz, 5kHz, 10kHz, 20kHz)
    [50, 100, 250, 500, 1000, 2500, 5000, 10000, 20000].forEach(f => {
      const x = this.freqToX(f);
      ctx.beginPath();
      ctx.strokeStyle = '#141c2b';
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();

      ctx.fillStyle = '#475569';
      ctx.font = '9px monospace';
      const label = f >= 1000 ? `${f / 1000}k` : `${f}Hz`;
      ctx.fillText(label, x + 3, h - 6);
    });

    // 2. FFT Spectrum Analyzer overlay (Background Glow)
    if (this.engine.masterAnalyser) {
      this.engine.masterAnalyser.getByteFrequencyData(this.freqData);
      ctx.fillStyle = 'rgba(6, 182, 212, 0.12)';
      ctx.beginPath();
      ctx.moveTo(0, h);

      for (let i = 0; i < this.freqData.length; i += 4) {
        const freq = (i / this.freqData.length) * (this.engine.ctx.sampleRate / 2);
        const x = this.freqToX(freq);
        const val = this.freqData[i] / 255;
        const y = h - val * (h * 0.85);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
    }

    // 3. Composite EQ Response Curve
    ctx.beginPath();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(56, 189, 248, 0.7)';
    ctx.shadowBlur = 10;

    for (let x = 0; x <= w; x += 3) {
      const f = this.xToFreq(x);
      let totalGain = 0;

      // Approximate combined filter curve response
      this.bands.forEach(b => {
        if (b.type === 'peaking') {
          const octDiff = Math.abs(Math.log2(f / b.freq));
          const bell = Math.exp(-Math.pow(octDiff * b.Q, 2));
          totalGain += b.gain * bell;
        } else if (b.type === 'lowshelf') {
          if (f < b.freq) {
            totalGain += b.gain;
          } else {
            const slope = Math.max(0, 1 - Math.log2(f / b.freq));
            totalGain += b.gain * slope;
          }
        } else if (b.type === 'highshelf') {
          if (f > b.freq) {
            totalGain += b.gain;
          } else {
            const slope = Math.max(0, 1 - Math.log2(b.freq / f));
            totalGain += b.gain * slope;
          }
        }
      });

      const y = this.gainToY(totalGain);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 4. Draw Draggable Band Handles
    this.bands.forEach((b, idx) => {
      const bx = this.freqToX(b.freq);
      const by = this.gainToY(b.gain);
      const isSelected = idx === this.selectedBandIdx;

      // Glow halo
      ctx.beginPath();
      ctx.arc(bx, by, isSelected ? 12 : 8, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? b.color : 'rgba(15, 23, 42, 0.8)';
      ctx.strokeStyle = b.color;
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();

      // Band Number Label
      ctx.fillStyle = isSelected ? '#000' : '#fff';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(b.id.toString(), bx, by);
    });
  }
}
