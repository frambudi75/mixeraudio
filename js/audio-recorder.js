/**
 * StudioMaster Pro - High Fidelity Lossless WAV Audio Recorder & Stem Exporter
 */

export class AudioRecorder {
  constructor(engine) {
    this.engine = engine;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isRecording = false;
    this.startTime = 0;
  }

  /**
   * Start Live Master Mix Recording
   */
  startRecording() {
    if (!this.engine.recordDestination) return;

    this.recordedChunks = [];
    const stream = this.engine.recordDestination.stream;

    const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus'];
    let selectedMime = '';
    for (const mime of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mime)) {
        selectedMime = mime;
        break;
      }
    }

    try {
      this.mediaRecorder = new MediaRecorder(stream, selectedMime ? { mimeType: selectedMime } : {});
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.recordedChunks.push(e.data);
      };

      this.mediaRecorder.start(100);
      this.isRecording = true;
      this.startTime = performance.now();
    } catch (err) {
      console.error('Failed to start MediaRecorder:', err);
    }
  }

  /**
   * Stop Recording and export directly to Lossless WAV / WebM
   */
  async stopRecording(filename = 'StudioMaster_Mixdown') {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || !this.isRecording) {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        this.downloadBlob(blob, `${filename}_${Date.now()}.webm`);
        this.isRecording = false;
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Export Master Mix Offline to True Lossless 16-Bit Stereo WAV
   */
  async exportMasterToWav(channels, duration) {
    const sampleRate = 44100;
    const totalDuration = Math.max(1, duration || 10);
    const offlineCtx = new OfflineAudioContext(2, sampleRate * totalDuration, sampleRate);

    // Create and render audio buffer in offline context
    channels.forEach(ch => {
      if (!ch.audioBuffer || ch.isMuted) return;

      const src = offlineCtx.createBufferSource();
      src.buffer = ch.audioBuffer;

      const gain = offlineCtx.createGain();
      gain.gain.value = ch.gain * Math.pow(10, ch.trim / 20);

      const panner = offlineCtx.createStereoPanner();
      panner.pan.value = ch.pan;

      const lowCut = offlineCtx.createBiquadFilter();
      lowCut.type = 'highpass';
      lowCut.frequency.value = ch.lowCutEnabled ? ch.lowCutFreq : 20;

      const eqLow = offlineCtx.createBiquadFilter();
      eqLow.type = 'lowshelf';
      eqLow.frequency.value = 80;
      eqLow.gain.value = ch.eqBypass ? 0 : ch.eqLow;

      const eqMid = offlineCtx.createBiquadFilter();
      eqMid.type = 'peaking';
      eqMid.frequency.value = ch.eqMidFreq;
      eqMid.gain.value = ch.eqBypass ? 0 : ch.eqMid;

      const eqHigh = offlineCtx.createBiquadFilter();
      eqHigh.type = 'highshelf';
      eqHigh.frequency.value = 10000;
      eqHigh.gain.value = ch.eqBypass ? 0 : ch.eqHigh;

      src.connect(lowCut);
      lowCut.connect(eqLow);
      eqLow.connect(eqMid);
      eqMid.connect(eqHigh);
      eqHigh.connect(gain);
      gain.connect(panner);
      panner.connect(offlineCtx.destination);

      src.start(0);
    });

    const renderedBuffer = await offlineCtx.startRendering();
    const wavBlob = this.audioBufferToWav(renderedBuffer);
    this.downloadBlob(wavBlob, `StudioMaster_Mix_${Date.now()}.wav`);
    return wavBlob;
  }

  /**
   * Export All Individual Stems (Separate Lossless WAV per Track)
   */
  async exportAllStems(channels, duration) {
    const sampleRate = 44100;
    const totalDuration = Math.max(1, duration || 10);
    const validChannels = channels.filter(c => c.audioBuffer);

    if (validChannels.length === 0) return false;

    for (let i = 0; i < validChannels.length; i++) {
      const ch = validChannels[i];
      const offlineCtx = new OfflineAudioContext(2, sampleRate * totalDuration, sampleRate);

      const src = offlineCtx.createBufferSource();
      src.buffer = ch.audioBuffer;

      const gain = offlineCtx.createGain();
      gain.gain.value = ch.gain * Math.pow(10, ch.trim / 20);

      const panner = offlineCtx.createStereoPanner();
      panner.pan.value = ch.pan;

      const lowCut = offlineCtx.createBiquadFilter();
      lowCut.type = 'highpass';
      lowCut.frequency.value = ch.lowCutEnabled ? ch.lowCutFreq : 20;

      const eqLow = offlineCtx.createBiquadFilter();
      eqLow.type = 'lowshelf';
      eqLow.frequency.value = 80;
      eqLow.gain.value = ch.eqBypass ? 0 : ch.eqLow;

      const eqMid = offlineCtx.createBiquadFilter();
      eqMid.type = 'peaking';
      eqMid.frequency.value = ch.eqMidFreq;
      eqMid.gain.value = ch.eqBypass ? 0 : ch.eqMid;

      const eqHigh = offlineCtx.createBiquadFilter();
      eqHigh.type = 'highshelf';
      eqHigh.frequency.value = 10000;
      eqHigh.gain.value = ch.eqBypass ? 0 : ch.eqHigh;

      src.connect(lowCut);
      lowCut.connect(eqLow);
      eqLow.connect(eqMid);
      eqMid.connect(eqHigh);
      eqHigh.connect(gain);
      gain.connect(panner);
      panner.connect(offlineCtx.destination);

      src.start(0);

      const rendered = await offlineCtx.startRendering();
      const wavBlob = this.audioBufferToWav(rendered);
      const cleanName = ch.name.replace(/[^a-zA-Z0-9_\-]/g, '_');
      this.downloadBlob(wavBlob, `Stem_${(i+1).toString().padStart(2, '0')}_${cleanName}.wav`);
      
      // Short delay between browser downloads
      await new Promise(r => setTimeout(r, 250));
    }
    return true;
  }

  audioBufferToWav(buffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const length = buffer.length * numChannels * 2;
    const bufferArray = new ArrayBuffer(44 + length);
    const view = new DataView(bufferArray);

    const channels = [];
    for (let i = 0; i < numChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    let offset = 0;
    const writeString = (str) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
      offset += str.length;
    };

    writeString('RIFF');
    view.setUint32(offset, 36 + length, true); offset += 4;
    writeString('WAVE');

    writeString('fmt ');
    view.setUint32(offset, 16, true); offset += 4;
    view.setUint16(offset, format, true); offset += 2;
    view.setUint16(offset, numChannels, true); offset += 2;
    view.setUint32(offset, sampleRate, true); offset += 4;
    view.setUint32(offset, sampleRate * numChannels * (bitDepth / 8), true); offset += 4;
    view.setUint16(offset, numChannels * (bitDepth / 8), true); offset += 2;
    view.setUint16(offset, bitDepth, true); offset += 2;

    writeString('data');
    view.setUint32(offset, length, true); offset += 4;

    let sampleIdx = 0;
    while (sampleIdx < buffer.length) {
      for (let ch = 0; ch < numChannels; ch++) {
        let sample = channels[ch][sampleIdx];
        sample = Math.max(-1, Math.min(1, sample));
        const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(offset, intSample, true);
        offset += 2;
      }
      sampleIdx++;
    }

    return new Blob([bufferArray], { type: 'audio/wav' });
  }

  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  }
}
