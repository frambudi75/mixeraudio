/**
 * StudioMaster Pro - Audio I/O Routing & Device Selector
 * Handles Physical Input/Output Jack Selection (setSinkId) and Application/System Audio Capture (getDisplayMedia).
 */

export class AudioRouting {
  constructor(engine, app) {
    this.engine = engine;
    this.app = app;
    this.audioInputs = [];
    this.audioOutputs = [];
    this.selectedInputId = 'default';
    this.selectedOutputId = 'default';

    // Application Audio Capture Stream (Spotify, Chrome Tab, Discord, Game, etc.)
    this.appStream = null;
    this.appSourceNode = null;
    this.appCaptureActive = false;
  }

  /**
   * Enumerate all connected audio hardware devices (Mics, Line In, Speakers, Headphone Jacks, USB DACs)
   */
  async enumerateDevices() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      console.warn('Device enumeration is not supported in this browser.');
      return;
    }

    try {
      // Request initial mic permission if needed to get full device labels
      try {
        const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        tempStream.getTracks().forEach(t => t.stop());
      } catch (e) {
        // Permission might be already granted or denied
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      this.audioInputs = devices.filter(d => d.kind === 'audioinput');
      this.audioOutputs = devices.filter(d => d.kind === 'audiooutput');

      this.populateDeviceSelectors();
    } catch (err) {
      console.error('Error enumerating audio devices:', err);
    }
  }

  populateDeviceSelectors() {
    // 1. Master Output Selector
    const masterOutputSelect = document.getElementById('master-output-select');
    if (masterOutputSelect) {
      masterOutputSelect.innerHTML = '';

      if (this.audioOutputs.length === 0) {
        masterOutputSelect.innerHTML = '<option value="default">Default System Audio Output (Jack / Speakers)</option>';
      } else {
        this.audioOutputs.forEach(device => {
          const opt = document.createElement('option');
          opt.value = device.deviceId;
          opt.textContent = device.label || `Output Jack / Speaker (${device.deviceId.slice(0, 8)})`;
          masterOutputSelect.appendChild(opt);
        });
      }
    }

    // 2. Input Hardware Selector
    const hwInputSelect = document.getElementById('hw-input-select');
    if (hwInputSelect) {
      hwInputSelect.innerHTML = '';
      if (this.audioInputs.length === 0) {
        hwInputSelect.innerHTML = '<option value="default">Default Microphone / Line In</option>';
      } else {
        this.audioInputs.forEach(device => {
          const opt = document.createElement('option');
          opt.value = device.deviceId;
          opt.textContent = device.label || `Audio Input Device (${device.deviceId.slice(0, 8)})`;
          hwInputSelect.appendChild(opt);
        });
      }
    }
  }

  /**
   * Change Master Audio Output Hardware (Jack Audio / Headphone / Speaker / USB Audio)
   * Uses Web Audio API setSinkId or Audio element sinkId
   */
  async setMasterOutputDevice(deviceId) {
    this.selectedOutputId = deviceId;
    const ctx = this.engine.ctx;

    if (ctx && typeof ctx.setSinkId === 'function') {
      try {
        await ctx.setSinkId(deviceId);
        this.app.showToast(`Output Audio diubah ke: ${deviceId === 'default' ? 'Default Jack' : 'Perangkat Terpilih'}`, 'success');
        return true;
      } catch (err) {
        console.warn('AudioContext.setSinkId failed, trying HTMLAudio fallback:', err);
      }
    }

    // Fallback: If AudioContext.setSinkId is not supported, route destination via MediaStream to HTMLAudioElement
    if (!this.fallbackAudioEl) {
      this.fallbackAudioEl = new Audio();
      this.fallbackAudioEl.autoplay = true;
      if (this.engine.recordDestination) {
        this.fallbackAudioEl.srcObject = this.engine.recordDestination.stream;
      }
    }

    if (this.fallbackAudioEl && typeof this.fallbackAudioEl.setSinkId === 'function') {
      try {
        await this.fallbackAudioEl.setSinkId(deviceId);
        this.app.showToast('Output Jack Audio berhasil diarahkan!', 'success');
        return true;
      } catch (err) {
        console.error('Failed to setSinkId on audio element:', err);
        this.app.showToast('Browser ini tidak mengizinkan pergantian output jack (fitur setSinkId dibatasi oleh browser).', 'warn');
      }
    } else {
      this.app.showToast('Browser ini belum mendukung pemilihan fisik output jack (setSinkId).', 'info');
    }
    return false;
  }

  /**
   * Capture Audio from ANY Application (Spotify, Discord, YouTube, Game, Chrome Tab, Media Player)
   * Uses getDisplayMedia system audio loopback capture
   */
  async captureApplicationAudio(targetChannel) {
    await this.engine.init();

    if (this.appCaptureActive && this.appStream) {
      this.stopApplicationAudio();
      return false;
    }

    try {
      this.app.showToast('Pilih jendela aplikasi (Spotify / Game / Browser Tab) & centang "Share Audio / Bagikan Audio"', 'info');

      // Request screen capture with system/app audio
      this.appStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          suppressLocalAudioPlayback: false
        }
      });

      const audioTracks = this.appStream.getAudioTracks();
      if (audioTracks.length === 0) {
        this.app.showToast('Peringatan: Tidak ada audio yang dipilih. Pastikan opsi "Share Audio" dicentang!', 'warn');
        this.stopApplicationAudio();
        return false;
      }

      // Hide/stop the video track since we only need the audio
      this.appStream.getVideoTracks().forEach(track => {
        // Keep active or minimize
        track.onended = () => this.stopApplicationAudio();
      });

      // Connect App Stream into target mixer channel
      this.appSourceNode = this.engine.ctx.createMediaStreamSource(this.appStream);
      
      const channel = targetChannel || this.engine.channels[0];
      if (channel) {
        channel.sourceType = 'app';
        this.appSourceNode.connect(channel.inputNode);
        this.app.updateChannelSourceBadge(channel.id, 'APP AUDIO');
      }

      this.appCaptureActive = true;
      this.app.showToast(`Audio Aplikasi berhasil terhubung ke ${channel.name}!`, 'success');
      return true;
    } catch (err) {
      console.warn('App capture cancelled or failed:', err);
      this.appCaptureActive = false;
      return false;
    }
  }

  stopApplicationAudio() {
    if (this.appStream) {
      this.appStream.getTracks().forEach(t => t.stop());
      this.appStream = null;
    }
    if (this.appSourceNode) {
      try { this.appSourceNode.disconnect(); } catch (e) {}
      this.appSourceNode = null;
    }
    this.appCaptureActive = false;
    this.app.showToast('Capture audio aplikasi dinonaktifkan.', 'info');
  }

  /**
   * Connect a specific physical Microphone / Line-In to a specific channel
   */
  async routeHardwareInputToChannel(deviceId, targetChannel) {
    await this.engine.init();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          echoCancellation: false,
          autoGainControl: false,
          noiseSuppression: false,
          latency: 0
        }
      });

      const sourceNode = this.engine.ctx.createMediaStreamSource(stream);
      const channel = targetChannel || this.engine.channels[0];
      if (channel) {
        channel.sourceType = 'mic';
        sourceNode.connect(channel.inputNode);
        this.app.updateChannelSourceBadge(channel.id, 'HARDWARE IN');
        this.app.showToast(`Input Jack terhubung ke ${channel.name}`, 'success');
      }
      return true;
    } catch (err) {
      console.error('Failed to route hardware input:', err);
      this.app.showToast('Gagal menghubungkan input jack: ' + err.message, 'error');
      return false;
    }
  }
}
