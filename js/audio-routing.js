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
    // 1. Master Output Selectors
    const masterOutputSelect = document.getElementById('master-output-select');
    const modalMasterOutputSelect = document.getElementById('modal-master-output-select');

    const fillOutput = (selectEl) => {
      if (!selectEl) return;
      selectEl.innerHTML = '';
      if (this.audioOutputs.length === 0) {
        selectEl.innerHTML = '<option value="default">Default System Audio Output (Jack / Speakers)</option>';
      } else {
        this.audioOutputs.forEach(device => {
          const opt = document.createElement('option');
          opt.value = device.deviceId;
          opt.textContent = device.label || `Output Jack / Speaker (${device.deviceId.slice(0, 8)})`;
          selectEl.appendChild(opt);
        });
      }
    };

    fillOutput(masterOutputSelect);
    fillOutput(modalMasterOutputSelect);

    // 2. Hardware Microphone / Line-In Selector
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

    // 3. Virtual Cable / Stereo Mix Selector
    const virtualCableSelect = document.getElementById('virtual-cable-select');
    if (virtualCableSelect) {
      virtualCableSelect.innerHTML = '';
      if (this.audioInputs.length === 0) {
        virtualCableSelect.innerHTML = '<option value="default">Default System Loopback / Stereo Mix</option>';
      } else {
        // Prioritize devices matching Cable, Loopback, Stereo Mix, What U Hear, Virtual
        const loopbackDevices = this.audioInputs.filter(d => {
          const lbl = (d.label || '').toLowerCase();
          return lbl.includes('cable') || lbl.includes('mix') || lbl.includes('loopback') || lbl.includes('virtual') || lbl.includes('monitor');
        });

        const otherDevices = this.audioInputs.filter(d => !loopbackDevices.includes(d));

        if (loopbackDevices.length > 0) {
          const grp = document.createElement('optgroup');
          grp.label = '⭐ Virtual Cable / Stereo Mix Terdeteksi';
          loopbackDevices.forEach(device => {
            const opt = document.createElement('option');
            opt.value = device.deviceId;
            opt.textContent = `⭐ ${device.label}`;
            grp.appendChild(opt);
          });
          virtualCableSelect.appendChild(grp);
        }

        const grpOther = document.createElement('optgroup');
        grpOther.label = 'Semua Perangkat Audio Input Lainnya';
        otherDevices.forEach(device => {
          const opt = document.createElement('option');
          opt.value = device.deviceId;
          opt.textContent = device.label || `Audio Input (${device.deviceId.slice(0, 8)})`;
          grpOther.appendChild(opt);
        });
        virtualCableSelect.appendChild(grpOther);
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
   * Capture Audio from Application / Browser Tab / System with Anti-Echo Local Playback Suppression
   * Uses getDisplayMedia with suppressLocalAudioPlayback: true so only mixer plays the sound
   */
  async captureApplicationAudio(targetChannel, antiEcho = true) {
    await this.engine.init();

    if (this.appCaptureActive && this.appStream) {
      this.stopApplicationAudio();
      return false;
    }

    try {
      this.app.showToast('Pilih Tab atau Jendela Aplikasi & pastikan "Share Audio / Bagikan Audio" dicentang.', 'info');

      // Request screen/tab capture with anti-echo suppression
      const constraints = {
        video: {
          displaySurface: 'browser'
        },
        audio: {
          suppressLocalAudioPlayback: antiEcho, // Mutes the local tab so audio only plays through the mixer
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          channelCount: 2
        },
        preferCurrentTab: false,
        selfBrowserSurface: 'exclude',
        systemAudio: 'include'
      };

      try {
        this.appStream = await navigator.mediaDevices.getDisplayMedia(constraints);
      } catch (e) {
        // Fallback for browsers that don't accept extended constraints
        this.appStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
      }

      const audioTracks = this.appStream.getAudioTracks();
      if (audioTracks.length === 0) {
        this.app.showToast('Peringatan: Tidak ada track audio yang dipilih. Pastikan opsi "Share Audio" dicentang pada dialog!', 'warn');
        this.stopApplicationAudio();
        return false;
      }

      // Configure tracks
      audioTracks.forEach(track => {
        if ('suppressLocalAudioPlayback' in track.getSettings()) {
          console.log('Local audio playback suppression active on track:', track.label);
        }
      });

      // Hide/stop the video track if not needed
      this.appStream.getVideoTracks().forEach(track => {
        track.onended = () => this.stopApplicationAudio();
      });

      // Disconnect previous node if existing
      if (this.appSourceNode) {
        try { this.appSourceNode.disconnect(); } catch (e) {}
      }

      // Connect App Stream into target mixer channel
      this.appSourceNode = this.engine.ctx.createMediaStreamSource(this.appStream);
      
      const channel = targetChannel || this.engine.channels.find(c => c.id === this.app.selectedChannelId) || this.engine.channels[0];
      if (channel) {
        channel.sourceType = 'app';
        this.appSourceNode.connect(channel.inputNode);
        this.app.updateChannelSourceBadge(channel.id, 'APP (ANTI-ECHO)');
      }

      this.appCaptureActive = true;
      this.updateInputHeaderStatus('APP AUDIO (ANTI-ECHO)');
      this.app.showToast(`Audio Aplikasi berhasil terhubung ke ${channel.name} dengan Anti-Echo!`, 'success');
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
    this.updateInputHeaderStatus('FILE / DEMO');
    this.app.showToast('Capture audio aplikasi dinonaktifkan.', 'info');
  }

  /**
   * Connect a specific physical Microphone, Line-In, or Virtual Audio Cable to a channel
   */
  async routeHardwareInputToChannel(deviceId, targetChannel, labelName = 'MIC / LINE-IN') {
    await this.engine.init();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: deviceId && deviceId !== 'default' ? { exact: deviceId } : undefined,
          echoCancellation: false,
          autoGainControl: false,
          noiseSuppression: false,
          latency: 0
        }
      });

      const sourceNode = this.engine.ctx.createMediaStreamSource(stream);
      const channel = targetChannel || this.engine.channels.find(c => c.id === this.app.selectedChannelId) || this.engine.channels[0];
      if (channel) {
        channel.sourceType = 'hardware';
        sourceNode.connect(channel.inputNode);
        this.app.updateChannelSourceBadge(channel.id, labelName);
        this.updateInputHeaderStatus(labelName);
        this.app.showToast(`Input ${labelName} berhasil terhubung ke ${channel.name}!`, 'success');
      }
      return true;
    } catch (err) {
      console.error('Failed to route hardware input:', err);
      this.app.showToast('Gagal menghubungkan input: ' + err.message, 'error');
      return false;
    }
  }

  updateInputHeaderStatus(label) {
    const badge = document.getElementById('input-source-active-indicator');
    if (badge) {
      badge.textContent = label;
    }
  }
}
