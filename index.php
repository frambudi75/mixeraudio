<!DOCTYPE html>
<html lang="id" data-theme="ssl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OverMix Pro - Digital Audio Mixing Console & Workstation</title>
  <meta name="description" content="OverMix Pro - Professional Studio Digital Audio Mixing Console with real-time Web Audio API, DSP rack, 60FPS visualizers, multi-track stems, input/output audio jack routing, broadcast auto-ducking, and MIDI controller support.">
  <link rel="icon" type="image/svg+xml" href="favicon.svg?v=3.2.0">
  <link rel="manifest" href="manifest.json?v=3.2.0">
  <meta name="theme-color" content="#06b6d4">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <link rel="stylesheet" href="css/main.css?v=3.2.0">
  <link rel="stylesheet" href="css/mixer.css?v=3.2.0">
  <link rel="stylesheet" href="css/visualizers.css?v=3.2.0">
  <link rel="stylesheet" href="css/dsp-suite.css?v=3.2.0">
</head>
<body>

  <!-- Top Studio Header & Transport Controls -->
  <header class="studio-header">
    <div class="brand-section">
      <div class="brand-logo">
        <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
          <defs>
            <linearGradient id="hdrWave" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#06b6d4"/>
              <stop offset="50%" stop-color="#38bdf8"/>
              <stop offset="100%" stop-color="#a855f7"/>
            </linearGradient>
          </defs>
          <rect x="8" y="20" width="4.5" height="12" rx="2.25" fill="url(#hdrWave)"/>
          <rect x="15.5" y="12" width="4.5" height="24" rx="2.25" fill="url(#hdrWave)"/>
          <rect x="23" y="6" width="4.5" height="36" rx="2.25" fill="#38bdf8"/>
          <rect x="30.5" y="14" width="4.5" height="20" rx="2.25" fill="url(#hdrWave)"/>
          <rect x="38" y="18" width="4.5" height="14" rx="2.25" fill="url(#hdrWave)"/>
          <circle cx="25.25" cy="16" r="3" fill="#ffffff" stroke="#080b10" stroke-width="1.5"/>
        </svg>
      </div>
      <div class="brand-info">
        <h1>OverMix Pro</h1>
        <span class="badge-version">DSP CONSOLE v3.2 MASTER</span>
      </div>
    </div>

    <!-- Transport Bar -->
    <div class="transport-bar">
      <div class="timecode-display" id="timecode-display">00:00.00</div>
      
      <div class="transport-buttons">
        <button class="btn-transport" id="btn-stop" title="Stop & Rewind [Space]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
        </button>
        <button class="btn-transport btn-play" id="btn-play" title="Play / Pause [Spacebar]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </button>
        <button class="btn-transport" id="btn-pause" title="Pause">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
        </button>
        <button class="btn-transport btn-loop" id="btn-loop" title="Toggle Loop Mode [L]">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 2l4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>
        </button>
        <button class="btn-transport btn-rec" id="btn-record" title="Record Master Mixdown [R]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8"/></svg>
        </button>
      </div>

      <!-- BPM & Metronome -->
      <div class="tempo-control">
        <label for="bpm-input">BPM</label>
        <input type="number" id="bpm-input" class="bpm-input" value="120" min="40" max="240">
        <button class="btn-metronome" id="btn-metronome">METRO</button>
      </div>
    </div>

    <!-- Quick Action Buttons -->
    <div class="header-actions">
      <!-- Theme Switcher -->
      <select id="theme-selector" style="background:#131822; border:1px solid var(--border-strong); color:var(--accent-cyan); font-size:11px; font-weight:700; padding:6px 8px; border-radius:6px; cursor:pointer;" title="Ganti Skin / Tema Meja Mixer">
        <option value="ssl">🎛️ SSL 4000 Dark</option>
        <option value="neve">📻 Neve 8078 Vintage</option>
        <option value="cyberpunk">⚡ Cyberpunk Neon</option>
        <option value="yamaha">🎚️ Yamaha Digital 02R</option>
      </select>

      <!-- Live Voice Changer Studio Button & Selector -->
      <button class="btn-action" id="btn-open-voice-modal" style="background:#1e1430; border-color:#8b5cf6; color:#c084fc;" title="Buka Studio Live Voice Changer (Robot, Chipmunk, Monster, Alien, Radio)">
        🤖 Voice Studio
      </button>

      <!-- Live Auto-Tune Pro Button -->
      <button class="btn-action" id="btn-open-autotune-modal" style="background:#062629; border-color:#06b6d4; color:#22d3ee;" title="Buka Real-Time Pitch Correction & Auto-Tune Studio (Major, Minor, Pentatonic, Scale Lock)">
        ⚡ Auto-Tune Pro
      </button>

      <!-- AI Stem Isolation Studio -->
      <button class="btn-action" id="btn-open-stems-modal" style="background:#201a09; border-color:#f59e0b; color:#fbbf24;" title="Buka Multiband Stem Isolation Studio (Pisahkan Vokal, Drum, Bass, Instrumen)">
        🎛️ Stem Studio
      </button>

      <!-- Interactive Parametric EQ Graph (FabFilter Pro-Q style) -->
      <button class="btn-action" id="btn-open-visual-eq" style="background:#0f1d2e; border-color:#38bdf8; color:#38bdf8;" title="Buka Interactive Visual Parametric EQ Graph (FabFilter Pro-Q Style)">
        📈 Visual EQ
      </button>

      <!-- LUFS Broadcast & Streaming Loudness Meter -->
      <button class="btn-action" id="btn-open-lufs-modal" style="background:#1a102e; border-color:#c084fc; color:#e9d5ff;" title="Buka EBU R128 & Spotify LUFS True-Peak Loudness Meter">
        📊 LUFS Meter
      </button>

      <!-- A/B Reference Track Comparison -->
      <button class="btn-action" id="btn-open-ab-modal" style="background:#1a2318; border-color:#22c55e; color:#4ade80;" title="Buka A/B Commercial Reference Track Comparison Hub">
        🅰️/🅱️ Reference
      </button>

      <!-- Real-time Karaoke Vocal Cut -->
      <button class="btn-action" id="btn-toggle-karaoke" title="Karaoke Mode: Hilangkan Vokal Lagu secara Real-Time">
        🎤 Karaoke Mode
      </button>

      <!-- Broadcast Auto-Ducking -->
      <button class="btn-action" id="btn-toggle-ducking" title="Podcast Auto-Ducking: Musik otomatis mengecil saat bicara di Mic">
        🎙️ Auto-Duck
      </button>

      <!-- OBS Studio Live Stream Overlay -->
      <button class="btn-action" id="btn-open-obs-modal" title="Buka URL OBS Studio Browser Source Widget Transparan">
        📺 OBS Overlay
      </button>

      <!-- PWA Install Button (Dynamic) -->
      <button class="btn-action btn-accent-emerald" id="btn-pwa-install" style="display:none;" title="Install StudioMaster Pro ke Desktop/Laptop">
        📲 Install App
      </button>

      <!-- DSP Equalizer & Presets Button -->
      <button class="btn-action btn-accent-blue" id="btn-open-dsp" title="Buka Studio Equalizer & DSP FX (8D, Dolby, Presets, 10-Band EQ)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        Studio DSP FX
      </button>

      <!-- Audio I/O Routing Button -->
      <button class="btn-action" id="btn-open-routing" title="Pengaturan Input Aplikasi & Output Jack Audio">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
        I/O Routing
      </button>

      <button class="btn-action btn-accent-gold" id="btn-load-demo" title="Muat 4-Track Stems Sintetis Instan">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        Load Demo
      </button>

      <button class="btn-action" id="btn-add-track" title="Tambah Channel Baru">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        + Track
      </button>

      <!-- Export Stems Multi-track -->
      <button class="btn-action" id="btn-export-stems" title="Export Semua Track Terpisah (Stems Multi-Track)">
        📦 Stems
      </button>

      <button class="btn-action btn-accent-blue" id="btn-export-wav" title="Export Lossless 16-Bit Master WAV">
        Export WAV
      </button>

      <button class="btn-action" id="btn-open-shortcuts" title="Daftar Keyboard Shortcuts [?]">⌨️</button>
      <button class="btn-action" id="btn-save-project" title="Simpan Sesi Project">Simpan</button>
      <button class="btn-action" id="btn-load-project" title="Muat Project Server">Project</button>
    </div>
  </header>

  <!-- Main Studio Workspace -->
  <main class="studio-workspace">

    <!-- Top Workspace Status / Navigation Bar -->
    <div class="workspace-top-bar">
      <div class="top-bar-left">
        <div class="tab-nav">
          <button class="tab-btn active" id="tab-mixer">Console Mixing Desk</button>
        </div>
      </div>
      <div class="top-bar-right">
        <!-- Input Mix Hub & Anti-Echo Trigger -->
        <button class="btn-action btn-accent-emerald" id="btn-open-input-mix-hub" style="height:28px; font-size:11px;" title="Pilihan Input Mix: Tangkap Audio Aplikasi (Spotify/Game/YT) dengan Anti-Echo, Mic, atau Virtual Cable Loopback">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          🎛️ Pilihan Input Mix & Anti-Echo
        </button>
        <span style="font-size:11px; color:var(--text-muted); font-family:var(--font-mono);">
          INPUT: <b id="input-source-active-indicator" style="color:var(--accent-cyan);">FILE / DEMO</b> | DSP ENGINE: <b style="color:var(--accent-emerald);">64-BIT FLOAT</b> | DUCKING: <b id="ducking-indicator" style="color:#ef4444;">OFF</b> | HOTKEYS: <b style="color:var(--accent-gold);">ACTIVE</b>
        </span>
      </div>
    </div>

    <!-- Mixing Desk Console Container -->
    <div class="console-container" id="console-container">
      
      <!-- Multi-Channel Strips (Scrollable) -->
      <div class="channel-strips-wrapper" id="channel-strips-wrapper">
        <!-- Channel strips rendered dynamically via JS -->
      </div>

      <!-- Master Bus Section (Fixed Right) -->
      <aside class="master-strip">
        <div class="master-header">
          <div class="master-title">MASTER BUS</div>
          <span style="font-family:var(--font-mono); font-size:10px; color:#f87171; font-weight:700;">STEREO</span>
        </div>

        <!-- Master Output Routing Quick Dropdown -->
        <div style="padding:8px 10px; background:#120e18; border-bottom:1px solid #282136;">
          <div style="font-size:9px; font-weight:800; color:#f87171; margin-bottom:4px;">OUTPUT AUDIO JACK:</div>
          <select id="master-output-select" style="width:100%; background:#09070c; border:1px solid #3d3052; color:#cbd5e1; font-size:10px; padding:4px 6px; border-radius:4px; outline:none;">
            <option value="default">Default Audio Jack / Speakers</option>
          </select>
        </div>

        <!-- Master 5-Band Graphic EQ -->
        <div class="master-eq-rack">
          <div class="section-title">MASTER 5-BAND EQ</div>
          <div class="master-eq-sliders">
            <div class="graphic-eq-band">
              <input type="range" class="eq-band-slider" id="master-eq-band-0" min="-12" max="12" step="0.5" value="0" orient="vertical">
              <span class="eq-band-label">60</span>
            </div>
            <div class="graphic-eq-band">
              <input type="range" class="eq-band-slider" id="master-eq-band-1" min="-12" max="12" step="0.5" value="0" orient="vertical">
              <span class="eq-band-label">250</span>
            </div>
            <div class="graphic-eq-band">
              <input type="range" class="eq-band-slider" id="master-eq-band-2" min="-12" max="12" step="0.5" value="0" orient="vertical">
              <span class="eq-band-label">1k</span>
            </div>
            <div class="graphic-eq-band">
              <input type="range" class="eq-band-slider" id="master-eq-band-3" min="-12" max="12" step="0.5" value="0" orient="vertical">
              <span class="eq-band-label">4k</span>
            </div>
            <div class="graphic-eq-band">
              <input type="range" class="eq-band-slider" id="master-eq-band-4" min="-12" max="12" step="0.5" value="0" orient="vertical">
              <span class="eq-band-label">12k</span>
            </div>
          </div>
        </div>

        <!-- Master Dynamics / Brickwall Limiter Status -->
        <div class="strip-section">
          <div class="section-title">BUS COMP & LIMITER</div>
          <div style="font-family:var(--font-mono); font-size:9px; color:#10b981; text-align:center; background:#0c0d12; padding:4px 8px; border-radius:4px; width:100%; border:1px solid #242b38;">
            BRICKWALL CEILING: -0.5 dB
          </div>
        </div>

        <!-- Master Fader & Large Master Dual VU Meter -->
        <div class="strip-fader-section">
          <!-- Large Master LED VU Meter -->
          <div class="vu-meter-container master-vu-large" id="master-vu-meter">
            <div class="vu-meter-channel vu-channel-left">
              <div class="vu-led-segment red"></div>
              <div class="vu-led-segment red"></div>
              <div class="vu-led-segment yellow"></div>
              <div class="vu-led-segment yellow"></div>
              <div class="vu-led-segment yellow"></div>
              <div class="vu-led-segment green"></div>
              <div class="vu-led-segment green"></div>
              <div class="vu-led-segment green"></div>
              <div class="vu-led-segment green"></div>
              <div class="vu-led-segment green"></div>
              <div class="vu-led-segment green"></div>
              <div class="vu-led-segment green"></div>
              <div class="vu-led-segment green"></div>
              <div class="vu-led-segment green"></div>
              <div class="vu-led-segment green"></div>
              <div class="vu-led-segment green"></div>
            </div>
            <div class="vu-meter-channel vu-channel-right">
              <div class="vu-led-segment red"></div>
              <div class="vu-led-segment red"></div>
              <div class="vu-led-segment yellow"></div>
              <div class="vu-led-segment yellow"></div>
              <div class="vu-led-segment yellow"></div>
              <div class="vu-led-segment green"></div>
              <div class="vu-led-segment green"></div>
              <div class="vu-led-segment green"></div>
              <div class="vu-led-segment green"></div>
              <div class="vu-led-segment green"></div>
              <div class="vu-led-segment green"></div>
              <div class="vu-led-segment green"></div>
              <div class="vu-led-segment green"></div>
              <div class="vu-led-segment green"></div>
              <div class="vu-led-segment green"></div>
              <div class="vu-led-segment green"></div>
            </div>
          </div>

          <!-- Master Vertical dB Fader -->
          <div class="fader-track-area">
            <div class="fader-scale-ticks">
              <span class="fader-tick">+6</span>
              <span class="fader-tick zero-db">0</span>
              <span class="fader-tick">-6</span>
              <span class="fader-tick">-18</span>
              <span class="fader-tick">-36</span>
              <span class="fader-tick">-INF</span>
            </div>
            <div class="fader-slot" id="master-fader-slot">
              <div class="fader-cap master-fader-cap" id="master-fader-cap" style="bottom: 66%;">
                <div class="fader-cap-line" style="background:#ff9999;"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="fader-db-readout" id="master-db-readout" style="color:#f87171;">0.0 dB</div>
      </aside>

    </div>

    <!-- Bottom Secondary Visualizers & Aux FX Rack -->
    <div class="studio-bottom-rack">
      
      <!-- 1. Real-Time FFT Spectrum Analyzer -->
      <section class="rack-card">
        <header class="rack-card-header">
          <div class="rack-title" style="color:var(--accent-cyan);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 18v-6"/><path d="M8 18v-10"/><path d="M13 18V4"/><path d="M18 18v-12"/><path d="M22 18v-8"/></svg>
            Master FFT Spectrum (20Hz - 20kHz)
          </div>
          <span style="font-size:10px; font-family:var(--font-mono); color:var(--text-muted);">60 FPS REALTIME</span>
        </header>
        <div class="rack-card-body">
          <canvas class="spectrum-canvas" id="spectrum-canvas"></canvas>
        </div>
      </section>

      <!-- 2. Stereo Phase Correlation Goniometer -->
      <section class="rack-card">
        <header class="rack-card-header">
          <div class="rack-title" style="color:var(--accent-purple);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/></svg>
            Stereo Vectorscope (Phase Scope)
          </div>
          <span style="font-size:10px; font-family:var(--font-mono); color:var(--text-muted);">L/R PHASE</span>
        </header>
        <div class="rack-card-body">
          <canvas class="vectorscope-canvas" id="vectorscope-canvas"></canvas>
        </div>
      </section>

      <!-- 3. Aux Return FX Rack & 16-Pad Soundboard -->
      <section class="rack-card">
        <header class="rack-card-header">
          <div class="rack-title" style="color:var(--accent-amber);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            Soundboard & Aux Processors
          </div>
        </header>
        <div class="rack-card-body" style="flex-direction:column; gap:12px;">
          <!-- Aux Controls -->
          <div class="fx-unit" style="width:100%;">
            <div class="fx-unit-header">
              <span class="fx-unit-title">AUX 1: REVERB & AUX 2: DELAY</span>
            </div>
            <div class="fx-knobs-row">
              <div class="knob-control knob-purple" id="knob-reverb-decay" title="Reverb Room Decay">
                <div class="knob-outer"><div class="knob-pointer"></div></div>
                <span class="knob-label">REV TIME</span>
                <span class="knob-value">2.5s</span>
              </div>
              <div class="knob-control knob-amber" id="knob-delay-time" title="Tape Delay Time">
                <div class="knob-outer"><div class="knob-pointer"></div></div>
                <span class="knob-label">DLY TIME</span>
                <span class="knob-value">350ms</span>
              </div>
              <div class="knob-control knob-cyan" id="knob-delay-feedback" title="Delay Feedback">
                <div class="knob-outer"><div class="knob-pointer"></div></div>
                <span class="knob-label">F-BACK</span>
                <span class="knob-value">40%</span>
              </div>
            </div>
          </div>

          <!-- 16-Pad Grid -->
          <div class="soundpad-grid" id="soundpad-grid">
            <!-- Rendered by sample-pads.js -->
          </div>
        </div>
      </section>

    </div>

  </main>

  <!-- ==========================================================================
       MODAL 1: Studio Equalizer & DSP FX Suite
       ========================================================================== -->
  <div class="modal-overlay" id="dsp-modal">
    <div class="dsp-modal-dialog">
      
      <div class="dsp-modal-header">
        <h2>Studio Equalizer & DSP FX</h2>
        <button class="modal-close" id="btn-close-dsp">&times;</button>
      </div>

      <!-- Section: DSP FX Presets -->
      <div>
        <div class="dsp-section-label">MODE AUDIO STUDIO (DSP FX PRESETS):</div>
        <div class="dsp-presets-grid" id="dsp-presets-container">
          <button class="pill-preset-btn active" data-preset="Studio Clean">Studio Clean</button>
          <button class="pill-preset-btn" data-preset="Dolby 3D Surround 🌐">Dolby 3D Surround 🌐</button>
          <button class="pill-preset-btn" data-preset="Live Concert Hall 🏛️">Live Concert Hall 🏛️</button>
          <button class="pill-preset-btn" data-preset="8D Spatial Audio 🎧">8D Spatial Audio 🎧</button>
          <button class="pill-preset-btn" data-preset="Slowed + Reverb 💧">Slowed + Reverb 💧</button>
          <button class="pill-preset-btn" data-preset="Nightcore ⚡">Nightcore ⚡</button>
          <button class="pill-preset-btn" data-preset="Vaporwave 📼">Vaporwave 📼</button>
          <button class="pill-preset-btn" data-preset="Bass Master 808 🔊">Bass Master 808 🔊</button>
          <button class="pill-preset-btn" data-preset="Karaoke Mode 🎤">Karaoke Mode 🎤</button>
          <button class="pill-preset-btn" data-preset="Haptic Bass 📳">Haptic Bass 📳</button>
          <button class="pill-preset-btn" data-preset="EDM Festival 🔊⚡">EDM Festival 🔊⚡</button>
          <button class="pill-preset-btn" data-preset="Vinyl Lo-Fi Chill ☕📼">Vinyl Lo-Fi Chill ☕📼</button>
          <button class="pill-preset-btn" data-preset="Cathedral 3D Spatial ⛪">Cathedral 3D Spatial ⛪</button>
          <button class="pill-preset-btn" data-preset="Podcast Broadcast 🎙️">Podcast Broadcast 🎙️</button>
          <button class="pill-preset-btn" data-preset="ASMR Binaural 🍃">ASMR Binaural 🍃</button>
          <button class="pill-preset-btn" data-preset="Gaming FPS Surround 🎯">Gaming FPS Surround 🎯</button>
          <button class="pill-preset-btn" data-preset="Vintage Radio AM 📻">Vintage Radio AM 📻</button>
          <button class="pill-preset-btn" data-preset="Heavy Metal Rock 🎸">Heavy Metal Rock 🎸</button>
        </div>
      </div>

      <!-- Section: Ambient White Noise Layer -->
      <div class="ambient-noise-card">
        <div class="ambient-header">
          <div class="ambient-title">
            <span>🌧️</span> Ambient White Noise Layer (Mixer Suara Latar)
          </div>
          <span style="font-family:var(--font-mono); font-size:11px; color:#38bdf8; font-weight:700;" id="ambient-vol-readout">40%</span>
        </div>
        <div class="ambient-controls-row">
          <div class="ambient-type-selector">
            <button class="btn-ambient-pill active" data-type="off">Off</button>
            <button class="btn-ambient-pill" data-type="hujan">🌧️ Hujan</button>
            <button class="btn-ambient-pill" data-type="api">🔥 Api Unggun</button>
            <button class="btn-ambient-pill" data-type="vinyl">☕ Vinyl</button>
          </div>
          <div class="ambient-slider-wrapper">
            <input type="range" class="dsp-slider-horizontal" id="ambient-vol-slider" min="0" max="100" value="40">
          </div>
        </div>
      </div>

      <!-- Section: Modulators -->
      <div class="modulators-row">
        <div class="modulator-item">
          <div class="modulator-header">
            <span>Speed</span>
            <span class="modulator-val" id="speed-val-readout">1.0x</span>
          </div>
          <input type="range" class="dsp-slider-horizontal" id="slider-speed" min="50" max="200" value="100">
        </div>

        <div class="modulator-item">
          <div class="modulator-header">
            <span>Crossfade</span>
            <span class="modulator-val" id="crossfade-val-readout">0 detik</span>
          </div>
          <input type="range" class="dsp-slider-horizontal" id="slider-crossfade" min="0" max="12" value="0">
        </div>

        <div class="modulator-item">
          <div class="modulator-header">
            <span>Preamp Boost</span>
            <span class="modulator-val" id="preamp-val-readout" style="color:#f59e0b;">100%</span>
          </div>
          <input type="range" class="dsp-slider-horizontal" id="slider-preamp" min="50" max="200" value="100" style="accent-color:#f59e0b;">
        </div>

        <div class="modulator-item">
          <div class="modulator-header">
            <span>8D Orbit Speed</span>
            <span class="modulator-val" id="orbit-val-readout" style="color:#a855f7;">1.0x</span>
          </div>
          <input type="range" class="dsp-slider-horizontal" id="slider-orbit" min="10" max="300" value="100" style="accent-color:#a855f7;">
        </div>
      </div>

      <!-- Section: 10-Band Graphic Equalizer -->
      <div class="eq-10band-section">
        <div class="eq-genres-row">
          <button class="btn-genre-pill active" data-genre="Flat">Flat</button>
          <button class="btn-genre-pill" data-genre="Bass Boost">Bass Boost</button>
          <button class="btn-genre-pill" data-genre="Electronic">Electronic</button>
          <button class="btn-genre-pill" data-genre="Rock">Rock</button>
          <button class="btn-genre-pill" data-genre="Pop">Pop</button>
          <button class="btn-genre-pill" data-genre="Jazz">Jazz</button>
          <button class="btn-genre-pill" data-genre="Vocal">Vocal</button>
          <button class="btn-genre-pill" data-genre="Acoustic">Acoustic</button>
        </div>

        <div class="eq-10band-sliders-container">
          <div class="eq-band-vertical">
            <span class="eq-band-db" id="eq-val-0">0dB</span>
            <input type="range" class="eq-slider-vert" id="eq-slider-0" min="-12" max="12" step="1" value="0" orient="vertical">
            <span class="eq-band-hz">32Hz</span>
          </div>
          <div class="eq-band-vertical">
            <span class="eq-band-db" id="eq-val-1">0dB</span>
            <input type="range" class="eq-slider-vert" id="eq-slider-1" min="-12" max="12" step="1" value="0" orient="vertical">
            <span class="eq-band-hz">64Hz</span>
          </div>
          <div class="eq-band-vertical">
            <span class="eq-band-db" id="eq-val-2">0dB</span>
            <input type="range" class="eq-slider-vert" id="eq-slider-2" min="-12" max="12" step="1" value="0" orient="vertical">
            <span class="eq-band-hz">125Hz</span>
          </div>
          <div class="eq-band-vertical">
            <span class="eq-band-db" id="eq-val-3">0dB</span>
            <input type="range" class="eq-slider-vert" id="eq-slider-3" min="-12" max="12" step="1" value="0" orient="vertical">
            <span class="eq-band-hz">250Hz</span>
          </div>
          <div class="eq-band-vertical">
            <span class="eq-band-db" id="eq-val-4">0dB</span>
            <input type="range" class="eq-slider-vert" id="eq-slider-4" min="-12" max="12" step="1" value="0" orient="vertical">
            <span class="eq-band-hz">500Hz</span>
          </div>
          <div class="eq-band-vertical">
            <span class="eq-band-db" id="eq-val-5">0dB</span>
            <input type="range" class="eq-slider-vert" id="eq-slider-5" min="-12" max="12" step="1" value="0" orient="vertical">
            <span class="eq-band-hz">1kHz</span>
          </div>
          <div class="eq-band-vertical">
            <span class="eq-band-db" id="eq-val-6">0dB</span>
            <input type="range" class="eq-slider-vert" id="eq-slider-6" min="-12" max="12" step="1" value="0" orient="vertical">
            <span class="eq-band-hz">2kHz</span>
          </div>
          <div class="eq-band-vertical">
            <span class="eq-band-db" id="eq-val-7">0dB</span>
            <input type="range" class="eq-slider-vert" id="eq-slider-7" min="-12" max="12" step="1" value="0" orient="vertical">
            <span class="eq-band-hz">4kHz</span>
          </div>
          <div class="eq-band-vertical">
            <span class="eq-band-db" id="eq-val-8">0dB</span>
            <input type="range" class="eq-slider-vert" id="eq-slider-8" min="-12" max="12" step="1" value="0" orient="vertical">
            <span class="eq-band-hz">8kHz</span>
          </div>
          <div class="eq-band-vertical">
            <span class="eq-band-db" id="eq-val-9">0dB</span>
            <input type="range" class="eq-slider-vert" id="eq-slider-9" min="-12" max="12" step="1" value="0" orient="vertical">
            <span class="eq-band-hz">16kHz</span>
          </div>
        </div>
      </div>

      <!-- Section: Deep Sub-Bass, High Air Treble, Volume Leveling -->
      <div class="dsp-enhancers-row">
        <div class="enhancer-card">
          <div class="enhancer-header">
            <span>Deep Sub-Bass</span>
            <span class="enhancer-val" id="sub-bass-readout">+0dB</span>
          </div>
          <input type="range" class="dsp-slider-horizontal" id="slider-sub-bass" min="0" max="15" value="0">
        </div>

        <div class="enhancer-card">
          <div class="enhancer-header">
            <span>High Air Treble</span>
            <span class="enhancer-val" id="air-treble-readout">0dB</span>
          </div>
          <input type="range" class="dsp-slider-horizontal" id="slider-air-treble" min="-6" max="15" value="0">
        </div>

        <div class="enhancer-card">
          <div class="enhancer-header">
            <span>Volume Leveling</span>
            <span class="enhancer-val" style="color:#10b981;" id="leveling-status-readout">ON</span>
          </div>
          <button class="btn-leveling" id="btn-toggle-leveling">Auto Leveling Aktif</button>
        </div>
      </div>

    </div>
  </div>

  <!-- ==========================================================================
       MODAL 2: Input Mix Hub & Audio I/O Routing Manager
       ========================================================================== -->
  <div class="modal-overlay" id="routing-modal">
    <div class="modal-dialog" style="max-width: 680px;">
      <div class="modal-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:18px;">🎛️</span>
          <div>
            <h3 style="margin:0; font-size:15px; color:#fff;">Pusat Input Mix Audio & Anti-Echo</h3>
            <p style="margin:0; font-size:11px; color:#94a3b8;">Pilih sumber suara masuk, atur eliminasi echo suara ganda, dan rute output speaker/jack.</p>
          </div>
        </div>
        <button class="modal-close" id="btn-close-routing">&times;</button>
      </div>
      <div class="modal-body" style="display:flex; flex-direction:column; gap:12px; max-height:75vh; overflow-y:auto;">
        
        <!-- Target Channel Info -->
        <div style="background:rgba(56, 189, 248, 0.08); border:1px solid rgba(56, 189, 248, 0.25); padding:10px 14px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:12px; color:#e0f2fe;">Target Channel Mixer: <b id="routing-target-channel-name" style="color:var(--accent-cyan);">CH 1</b></span>
          <span style="font-size:11px; background:#0369a1; color:#fff; padding:2px 8px; border-radius:4px; font-weight:700;">ACTIVE STRIP</span>
        </div>

        <!-- Option 1: App / Tab Audio with Anti-Echo Suppression -->
        <div style="background:#131822; padding:14px; border-radius:8px; border:1px solid #10b981; position:relative;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <h4 style="font-size:13px; color:#10b981; margin:0; display:flex; align-items:center; gap:6px;">
              <span>🌐</span> OPSI 1: Tangkap Audio Aplikasi / Tab Browser (Spotify/Game/YT)
            </h4>
            <span style="font-size:10px; background:rgba(16,185,129,0.2); color:#10b981; border:1px solid #10b981; padding:2px 6px; border-radius:4px; font-weight:700;">ANTI-ECHO FILTER</span>
          </div>
          <p style="font-size:11px; color:#94a3b8; line-height:1.4; margin-bottom:10px;">
            Mengarahkan suara dari tab browser atau jendela aplikasi ke dalam mixer. Fitur <b>Anti-Echo Suppression</b> otomatis menonaktifkan suara langsung browser, sehingga <b>100% suara hanya keluar dari mixer ini</b> tanpa gema / suara ganda!
          </p>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px; background:#090d14; padding:8px 10px; border-radius:6px; border:1px solid #233044;">
            <input type="checkbox" id="chk-anti-echo" checked style="accent-color:#10b981; cursor:pointer;">
            <label for="chk-anti-echo" style="font-size:11px; color:#e2e8f0; cursor:pointer; font-weight:600;">
              🛡️ Aktifkan Anti-Echo (Mute Pemutaran Lokal Browser Asli)
            </label>
          </div>
          <button class="btn-action btn-accent-emerald" id="btn-modal-capture-app" style="width:100%; justify-content:center; padding:9px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            🚀 Pilih Jendela/Tab & Mulai Tangkap Audio (Anti-Echo)
          </button>
        </div>

        <!-- Option 2: Hardware Microphone / Line In -->
        <div style="background:#131822; padding:14px; border-radius:8px; border:1px solid #252f3f;">
          <h4 style="font-size:13px; color:#06b6d4; margin-bottom:6px; display:flex; align-items:center; gap:6px;">
            <span>🎙️</span> OPSI 2: Mikrofon Fisik / Line-In Soundcard
          </h4>
          <p style="font-size:11px; color:#94a3b8; margin-bottom:10px;">Pilih mikrofon eksternal, headset jack, atau input audio interface (Direct Hardware):</p>
          <select id="hw-input-select" style="width:100%; background:#090d14; border:1px solid #3b485d; color:#fff; padding:8px 12px; border-radius:6px; font-size:12px;">
            <option value="default">Default Microphone / Line In</option>
          </select>
          <button class="btn-action btn-accent-blue" id="btn-route-hw-input" style="margin-top:10px; width:100%; justify-content:center; padding:8px;">
            🎙️ Hubungkan Mic/Line-In ke Channel
          </button>
        </div>

        <!-- Option 3: Virtual Audio Cable / Stereo Mix Loopback -->
        <div style="background:#131822; padding:14px; border-radius:8px; border:1px solid #8b5cf6;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <h4 style="font-size:13px; color:#c084fc; margin:0; display:flex; align-items:center; gap:6px;">
              <span>🎛️</span> OPSI 3: Virtual Audio Cable / Stereo Mix (Semua Suara Windows/Linux)
            </h4>
            <span style="font-size:10px; background:rgba(139,92,246,0.2); color:#c084fc; border:1px solid #8b5cf6; padding:2px 6px; border-radius:4px; font-weight:700;">NO POPUP</span>
          </div>
          <p style="font-size:11px; color:#94a3b8; line-height:1.4; margin-bottom:10px;">
            Ingin <b>SEMUA suara laptop/PC</b> (Game, Spotify Desktop, Discord, VLC) otomatis masuk ke mixer tanpa pop-up layar? Gunakan driver loopback gratis seperti <i>VB-Audio Cable</i> atau <i>Stereo Mix</i> Windows/PulseAudio.
          </p>
          <select id="virtual-cable-select" style="width:100%; background:#090d14; border:1px solid #3b485d; color:#fff; padding:8px 12px; border-radius:6px; font-size:12px;">
            <option value="default">Scan Otomatis Device Virtual Cable / Loopback...</option>
          </select>
          <button class="btn-action btn-accent-purple" id="btn-route-virtual-cable" style="margin-top:10px; width:100%; justify-content:center; padding:8px;">
            🎛️ Aktifkan Virtual Cable Loopback
          </button>
        </div>

        <!-- Section: Master Output Jack -->
        <div style="background:#131822; padding:14px; border-radius:8px; border:1px solid #ef4444;">
          <h4 style="font-size:13px; color:#f87171; margin-bottom:6px; display:flex; align-items:center; gap:6px;">
            <span>🔊</span> Master Audio Output Jack (Speaker / Headphone / DAC)
          </h4>
          <p style="font-size:11px; color:#94a3b8; margin-bottom:10px;">Pilih ke jack audio fisik mana suara hasil filter mixer akan dikeluarkan:</p>
          <select id="modal-master-output-select" style="width:100%; background:#090d14; border:1px solid #3b485d; color:#fff; padding:8px 12px; border-radius:6px; font-size:12px;">
            <option value="default">Default System Audio Output (Jack / Speakers)</option>
          </select>
        </div>

      </div>
      <div class="modal-footer">
        <button class="btn-action" id="btn-refresh-devices">🔄 Refresh Daftar Device</button>
        <button class="btn-action btn-accent-blue" onclick="document.getElementById('routing-modal').classList.remove('active')">Selesai</button>
      </div>
    </div>
  </div>

  <!-- ==========================================================================
       MODAL 3: Keyboard Shortcuts Guide
       ========================================================================== -->
  <div class="modal-overlay" id="shortcuts-modal">
    <div class="modal-dialog">
      <div class="modal-header">
        <h3>⌨️ Keyboard Shortcuts (DAW Hotkeys)</h3>
        <button class="modal-close" onclick="document.getElementById('shortcuts-modal').classList.remove('active')">&times;</button>
      </div>
      <div class="modal-body">
        <table style="width:100%; border-collapse:collapse; font-size:12px; color:#cbd5e1;">
          <tr style="border-bottom:1px solid #283344;"><td style="padding:8px; font-weight:700; color:var(--accent-cyan);">Spasi</td><td style="padding:8px;">Play / Pause Pemutaran Audio</td></tr>
          <tr style="border-bottom:1px solid #283344;"><td style="padding:8px; font-weight:700; color:var(--accent-cyan);">R</td><td style="padding:8px;">Mulai / Stop Rekam Master Mixdown</td></tr>
          <tr style="border-bottom:1px solid #283344;"><td style="padding:8px; font-weight:700; color:var(--accent-cyan);">L</td><td style="padding:8px;">Aktifkan / Nonaktifkan Loop Pemutaran</td></tr>
          <tr style="border-bottom:1px solid #283344;"><td style="padding:8px; font-weight:700; color:var(--accent-cyan);">M</td><td style="padding:8px;">Toggle Mute pada Channel Aktif</td></tr>
          <tr style="border-bottom:1px solid #283344;"><td style="padding:8px; font-weight:700; color:var(--accent-cyan);">S</td><td style="padding:8px;">Toggle Solo pada Channel Aktif</td></tr>
          <tr style="border-bottom:1px solid #283344;"><td style="padding:8px; font-weight:700; color:var(--accent-cyan);">Panah Atas / Bawah</td><td style="padding:8px;">Naikkan / Turunkan Volume Fader (+/-1dB)</td></tr>
          <tr style="border-bottom:1px solid #283344;"><td style="padding:8px; font-weight:700; color:var(--accent-cyan);">Panah Kiri / Kanan</td><td style="padding:8px;">Pindah Seleksi ke Channel Sebelumnya / Berikutnya</td></tr>
          <tr style="border-bottom:1px solid #283344;"><td style="padding:8px; font-weight:700; color:var(--accent-cyan);">1 - 8</td><td style="padding:8px;">Pilih Langsung Channel 1 sampai 8</td></tr>
          <tr style="border-bottom:1px solid #283344;"><td style="padding:8px; font-weight:700; color:var(--accent-cyan);">Q, W, E, R, A, S, D, F</td><td style="padding:8px;">Trigger Soundboard / Sample Pads Instan</td></tr>
        </table>
      </div>
      <div class="modal-footer">
        <button class="btn-action btn-accent-blue" onclick="document.getElementById('shortcuts-modal').classList.remove('active')">Mengerti</button>
      </div>
    </div>
  </div>

  <!-- Modal: Save Project -->
  <div class="modal-overlay" id="save-project-modal">
    <div class="modal-dialog">
      <div class="modal-header">
        <h3>Simpan Project Mixer</h3>
        <button class="modal-close" onclick="document.getElementById('save-project-modal').classList.remove('active')">&times;</button>
      </div>
      <div class="modal-body">
        <label style="font-size:12px; color:var(--text-secondary); font-weight:600;">Nama Project:</label>
        <input type="text" id="save-project-name" value="Session_Mix_01" style="background:#090b10; border:1px solid var(--border-strong); padding:8px 12px; color:#fff; border-radius:6px; font-family:var(--font-mono);">
      </div>
      <div class="modal-footer">
        <button class="btn-action" onclick="document.getElementById('save-project-modal').classList.remove('active')">Batal</button>
        <button class="btn-action btn-accent-blue" onclick="
          const name = document.getElementById('save-project-name').value;
          fetch('api/projects.php?action=save', {
            method: 'POST',
            body: JSON.stringify({ name: name, date: new Date().toISOString() })
          }).then(r => r.json()).then(d => {
            alert(d.message);
            document.getElementById('save-project-modal').classList.remove('active');
          });
        ">Simpan ke Server</button>
      </div>
    </div>
  </div>

  <!-- Modal: Load Project -->
  <div class="modal-overlay" id="load-project-modal">
    <div class="modal-dialog">
      <div class="modal-header">
        <h3>Pilih Project dari Server</h3>
        <button class="modal-close" onclick="document.getElementById('load-project-modal').classList.remove('active')">&times;</button>
      </div>
      <div class="modal-body" id="server-projects-list">
        <!-- List filled by JS -->
      </div>
      <div class="modal-footer">
        <button class="btn-action" onclick="document.getElementById('load-project-modal').classList.remove('active')">Tutup</button>
      </div>
    </div>
  </div>

  <!-- ==========================================================================
       MODAL 4: OBS Studio Live Stream Overlay Widget Link
       ========================================================================== -->
  <div class="modal-overlay" id="obs-modal">
    <div class="modal-dialog" style="max-width: 580px;">
      <div class="modal-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:18px;">📺</span>
          <div>
            <h3 style="margin:0; font-size:15px; color:#fff;">OBS Studio Streaming Overlay</h3>
            <p style="margin:0; font-size:11px; color:#94a3b8;">Integrasikan visualizer Spectrum & VU Meter transparan langsung ke OBS Studio / Streamlabs.</p>
          </div>
        </div>
        <button class="modal-close" onclick="document.getElementById('obs-modal').classList.remove('active')">&times;</button>
      </div>
      <div class="modal-body" style="display:flex; flex-direction:column; gap:12px;">
        <div style="background:#131822; padding:12px; border-radius:8px; border:1px solid #233044;">
          <label style="font-size:11px; color:#38bdf8; font-weight:700; display:block; margin-bottom:6px;">🔗 URL BROWSER SOURCE OBS (TRANSPARAN):</label>
          <div style="display:flex; gap:8px;">
            <input type="text" id="obs-url-input" readonly value="" style="flex:1; background:#090d14; border:1px solid #38bdf8; color:#fff; padding:8px 12px; border-radius:6px; font-family:var(--font-mono); font-size:12px;">
            <button class="btn-action btn-accent-blue" id="btn-copy-obs-url">📋 Copy URL</button>
          </div>
        </div>
        <div style="background:#090d14; padding:12px; border-radius:8px; border:1px solid #1e293b; font-size:11px; color:#94a3b8; line-height:1.5;">
          <b style="color:#f1f5f9;">Cara Pasang di OBS Studio:</b>
          <ol style="margin-left:18px; margin-top:4px;">
            <li>Di OBS Studio, klik tombol <b>+ (Add Source)</b> di panel Sources.</li>
            <li>Pilih <b>Browser Source</b> & beri nama <i>"StudioMaster Mixer"</i>.</li>
            <li>Paste URL di atas ke kolom <b>URL</b>.</li>
            <li>Atur Width: <code>1920</code>, Height: <code>1080</code> (atau <code>600x120</code> untuk mini banner).</li>
            <li>Centang <i>"Shutdown source when not visible"</i> lalu klik OK.</li>
          </ol>
        </div>
      </div>
      <div class="modal-footer">
        <a href="overlay.php" target="_blank" class="btn-action" style="text-decoration:none;">👁️ Buka Preview Overlay</a>
        <button class="btn-action btn-accent-blue" onclick="document.getElementById('obs-modal').classList.remove('active')">Selesai</button>
      </div>
    </div>
  </div>

  <!-- ==========================================================================
       MODAL 5: Custom Soundboard Pad Sampler Editor
       ========================================================================== -->
  <div class="modal-overlay" id="pad-editor-modal">
    <div class="modal-dialog" style="max-width: 480px;">
      <div class="modal-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:18px;">🎙️</span>
          <div>
            <h3 style="margin:0; font-size:15px; color:#fff;">Custom Soundboard Sampler</h3>
            <p style="margin:0; font-size:11px; color:#94a3b8;" id="pad-editor-subtitle">Atur suara untuk Pad X</p>
          </div>
        </div>
        <button class="modal-close" onclick="document.getElementById('pad-editor-modal').classList.remove('active')">&times;</button>
      </div>
      <div class="modal-body" style="display:flex; flex-direction:column; gap:12px;">
        <input type="hidden" id="edit-pad-id" value="1">
        
        <!-- Option A: Record Live from Mic -->
        <div style="background:#131822; padding:12px; border-radius:8px; border:1px solid #ef4444;">
          <h4 style="font-size:12px; color:#f87171; margin-bottom:6px;">🎙️ OPSI 1: Rekam Suara Langsung dari Mic (2 Detik)</h4>
          <p style="font-size:11px; color:#94a3b8; margin-bottom:8px;">Tekan tombol di bawah lalu bicara / buat bunyi jingle di mic:</p>
          <button class="btn-action btn-accent-gold" id="btn-record-mic-sample" style="width:100%; justify-content:center;">
            🔴 Mulai Rekam ke Pad Ini
          </button>
        </div>

        <!-- Option B: Pick Audio File -->
        <div style="background:#131822; padding:12px; border-radius:8px; border:1px solid #06b6d4;">
          <h4 style="font-size:12px; color:#38bdf8; margin-bottom:6px;">📂 OPSI 2: Pilih File Audio Sendiri (MP3 / WAV)</h4>
          <input type="file" id="pad-file-input" accept="audio/*" style="width:100%; font-size:11px; color:#94a3b8;">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-action" onclick="document.getElementById('pad-editor-modal').classList.remove('active')">Batal</button>
      </div>
    </div>
  </div>

  <!-- ==========================================================================
       MODAL 6: Studio Live Voice Changer & Vocal Pitch Modulator
       ========================================================================== -->
  <div class="modal-overlay" id="voice-changer-modal">
    <div class="modal-dialog" style="max-width: 650px;">
      <div class="modal-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:20px;">🤖</span>
          <div>
            <h3 style="margin:0; font-size:16px; color:#fff;">Live Voice Changer Studio</h3>
            <p style="margin:0; font-size:11px; color:#94a3b8;">Ubah karakter vokal mikrofon Anda secara real-time untuk gaming, live streaming, podcast, dan discord.</p>
          </div>
        </div>
        <button class="modal-close" onclick="document.getElementById('voice-changer-modal').classList.remove('active')">&times;</button>
      </div>
      <div class="modal-body" style="display:flex; flex-direction:column; gap:14px; max-height:75vh; overflow-y:auto;">
        
        <!-- Live Mic Monitor Toggle -->
        <div style="background:rgba(139, 92, 246, 0.1); border:1px solid rgba(139, 92, 246, 0.3); padding:12px 16px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-size:12px; font-weight:700; color:#e9d5ff;">🎧 Live Microphone Monitor</div>
            <div style="font-size:10px; color:#c084fc;">Dengarkan langsung suara Anda di headphone saat berbicara di mic</div>
          </div>
          <button class="btn-action btn-accent-purple" id="btn-toggle-mic-monitor">🔴 Aktifkan Live Monitor</button>
        </div>

        <!-- 8 Character Presets Grid -->
        <div>
          <label style="font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:0.05em; display:block; margin-bottom:8px;">PILIHAN KARAKTER SUARA (PRESETS):</label>
          <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:8px;" id="voice-preset-cards">
            <button class="voice-card active" data-voice="normal">
              <span style="font-size:24px;">🎙️</span>
              <span style="font-size:11px; font-weight:700;">Clean Studio</span>
              <span style="font-size:9px; color:#94a3b8;">Natural Vocal</span>
            </button>
            <button class="voice-card" data-voice="robot">
              <span style="font-size:24px;">🤖</span>
              <span style="font-size:11px; font-weight:700;">Optimus Robot</span>
              <span style="font-size:9px; color:#94a3b8;">Ring Vocoder</span>
            </button>
            <button class="voice-card" data-voice="chipmunk">
              <span style="font-size:24px;">🐿️</span>
              <span style="font-size:11px; font-weight:700;">Chipmunk Anime</span>
              <span style="font-size:9px; color:#94a3b8;">High Pitch Up</span>
            </button>
            <button class="voice-card" data-voice="deep">
              <span style="font-size:24px;">😈</span>
              <span style="font-size:11px; font-weight:700;">Darth Monster</span>
              <span style="font-size:9px; color:#94a3b8;">Deep Sub-Growl</span>
            </button>
            <button class="voice-card" data-voice="alien">
              <span style="font-size:24px;">👽</span>
              <span style="font-size:11px; font-weight:700;">Alien Xenomorph</span>
              <span style="font-size:9px; color:#94a3b8;">LFO Space Mod</span>
            </button>
            <button class="voice-card" data-voice="megaphone">
              <span style="font-size:24px;">📢</span>
              <span style="font-size:11px; font-weight:700;">Megaphone AM</span>
              <span style="font-size:9px; color:#94a3b8;">Police Radio</span>
            </button>
            <button class="voice-card" data-voice="ghost">
              <span style="font-size:24px;">👻</span>
              <span style="font-size:11px; font-weight:700;">Ghost Whisper</span>
              <span style="font-size:9px; color:#94a3b8;">Ethereal Shimmer</span>
            </button>
            <button class="voice-card" data-voice="radio">
              <span style="font-size:24px;">📻</span>
              <span style="font-size:11px; font-weight:700;">1920s Radio</span>
              <span style="font-size:9px; color:#94a3b8;">Vintage Lo-Fi</span>
            </button>
          </div>
        </div>

        <!-- Parametric Fine-Tuning Sliders -->
        <div style="background:#131822; padding:14px; border-radius:10px; border:1px solid #283344; display:flex; flex-direction:column; gap:12px;">
          <div style="font-size:11px; font-weight:800; color:#38bdf8; text-transform:uppercase;">🎛️ PARAMETRIC FINE-TUNING</div>
          
          <!-- Pitch & Formant Shift Slider -->
          <div>
            <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:4px;">
              <span>Pitch & Formant Shift</span>
              <span style="font-family:var(--font-mono); color:#38bdf8; font-weight:700;" id="voice-pitch-val">0 ST</span>
            </div>
            <input type="range" class="dsp-slider-horizontal" id="slider-voice-pitch" min="-12" max="12" value="0" step="1">
          </div>

          <!-- Saturation / Drive -->
          <div>
            <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:4px;">
              <span>Analog Tube Drive / Saturation</span>
              <span style="font-family:var(--font-mono); color:#f59e0b; font-weight:700;" id="voice-drive-val">25%</span>
            </div>
            <input type="range" class="dsp-slider-horizontal" id="slider-voice-drive" min="0" max="100" value="25" style="accent-color:#f59e0b;">
          </div>

          <!-- FX Wet / Dry Mix -->
          <div>
            <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:4px;">
              <span>Effect Wet / Dry Blend</span>
              <span style="font-family:var(--font-mono); color:#a855f7; font-weight:700;" id="voice-mix-val">100%</span>
            </div>
            <input type="range" class="dsp-slider-horizontal" id="slider-voice-mix" min="0" max="100" value="100" style="accent-color:#a855f7;">
          </div>
        </div>

      </div>
      <div class="modal-footer">
        <button class="btn-action" onclick="document.getElementById('voice-changer-modal').classList.remove('active')">Tutup</button>
      </div>
    </div>
  </div>

  <!-- Auto-Tune Pro Studio Modal -->
  <div class="modal-overlay" id="autotune-modal">
    <div class="modal-container" style="max-width: 580px; background: #0c121e; border: 1px solid #06b6d4; box-shadow: 0 10px 40px rgba(6, 182, 212, 0.25);">
      <div class="modal-header">
        <h3 style="display:flex; align-items:center; gap:8px; color:#22d3ee;">
          <span>⚡</span> Auto-Tune Pro Pitch Studio
        </h3>
        <button class="btn-close-modal" onclick="document.getElementById('autotune-modal').classList.remove('active')">&times;</button>
      </div>
      <div class="modal-body" style="display:flex; flex-direction:column; gap:16px;">
        
        <!-- Live Pitch Visualizer Display -->
        <div style="background:#060d17; border:1px solid #164e63; border-radius:10px; padding:14px; text-align:center;">
          <div style="font-size:10px; font-weight:800; color:#38bdf8; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:6px;">LIVE PITCH DETECTOR & SCALE QUANTIZER</div>
          <div style="display:flex; justify-content:center; align-items:baseline; gap:12px; margin:8px 0;">
            <span style="font-size:32px; font-weight:900; font-family:var(--font-mono); color:#22d3ee;" id="at-detected-note">--</span>
            <span style="font-size:14px; color:#94a3b8; font-family:var(--font-mono);" id="at-detected-hz">0 Hz</span>
          </div>
          <div style="height:6px; background:#1e293b; border-radius:3px; overflow:hidden; position:relative; max-width:240px; margin:0 auto;">
            <div id="at-cents-bar" style="position:absolute; top:0; bottom:0; left:50%; width:0%; background:#22d3ee; transition:all 0.05s ease;"></div>
          </div>
          <div style="display:flex; justify-content:space-between; max-width:240px; margin:4px auto 0; font-size:9px; color:#64748b; font-family:var(--font-mono);">
            <span>-50 Cents</span>
            <span>0</span>
            <span>+50 Cents</span>
          </div>
        </div>

        <!-- Scale & Key Selection -->
        <div style="background:#131d2e; border:1px solid #1e293b; border-radius:10px; padding:14px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <span style="font-size:11px; font-weight:800; color:#cbd5e1;">ROOT KEY & SCALE</span>
            <select id="at-scale-select" style="background:#090d16; border:1px solid #06b6d4; color:#22d3ee; font-weight:700; font-size:11px; padding:4px 8px; border-radius:6px;">
              <option value="major">Major (Pop / Bright)</option>
              <option value="minor">Minor (Trap / Emotional)</option>
              <option value="pentatonic">Pentatonic (RnB / Soul)</option>
              <option value="blues">Blues Scale</option>
              <option value="chromatic">Chromatic (All 12 Notes)</option>
              <option value="arabic">Arabic / Maqam</option>
              <option value="hirajoshi">Japanese Hirajoshi</option>
            </select>
          </div>

          <!-- 12 Key Root Buttons -->
          <div style="display:grid; grid-template-columns:repeat(6, 1fr); gap:6px;" id="at-root-keys">
            <button class="btn-at-key active" data-key="C">C</button>
            <button class="btn-at-key" data-key="C#">C#</button>
            <button class="btn-at-key" data-key="D">D</button>
            <button class="btn-at-key" data-key="D#">D#</button>
            <button class="btn-at-key" data-key="E">E</button>
            <button class="btn-at-key" data-key="F">F</button>
            <button class="btn-at-key" data-key="F#">F#</button>
            <button class="btn-at-key" data-key="G">G</button>
            <button class="btn-at-key" data-key="G#">G#</button>
            <button class="btn-at-key" data-key="A">A</button>
            <button class="btn-at-key" data-key="A#">A#</button>
            <button class="btn-at-key" data-key="B">B</button>
          </div>
        </div>

        <!-- Fine-Tuning Controls -->
        <div style="background:#131d2e; border:1px solid #1e293b; border-radius:10px; padding:14px; display:flex; flex-direction:column; gap:12px;">
          <div>
            <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:4px;">
              <span>Retune Speed (0ms = Robotic T-Pain / Travis Scott)</span>
              <span style="font-family:var(--font-mono); color:#22d3ee; font-weight:700;" id="at-speed-val">15 ms</span>
            </div>
            <input type="range" class="dsp-slider-horizontal" id="slider-at-speed" min="0" max="100" value="15">
          </div>

          <div>
            <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:4px;">
              <span>Correction Depth / Intensity</span>
              <span style="font-family:var(--font-mono); color:#10b981; font-weight:700;" id="at-depth-val">100%</span>
            </div>
            <input type="range" class="dsp-slider-horizontal" id="slider-at-depth" min="0" max="100" value="100" style="accent-color:#10b981;">
          </div>
        </div>

        <!-- Live Mic Monitor with AutoTune -->
        <button class="btn-action btn-accent-cyan" id="btn-toggle-at-mic" style="width:100%; padding:10px; font-weight:700; font-size:12px;">
          🎧 Aktifkan Live Mic Auto-Tune
        </button>

      </div>
      <div class="modal-footer">
        <button class="btn-action" onclick="document.getElementById('autotune-modal').classList.remove('active')">Tutup</button>
      </div>
    </div>
  </div>

  <!-- AI Stem Isolation Studio Modal -->
  <div class="modal-overlay" id="stems-modal">
    <div class="modal-container" style="max-width: 580px; background: #120e1c; border: 1px solid #f59e0b; box-shadow: 0 10px 40px rgba(245, 158, 11, 0.25);">
      <div class="modal-header">
        <h3 style="display:flex; align-items:center; gap:8px; color:#fbbf24;">
          <span>🎛️</span> Multiband Stem Isolation Studio
        </h3>
        <button class="btn-close-modal" onclick="document.getElementById('stems-modal').classList.remove('active')">&times;</button>
      </div>
      <div class="modal-body" style="display:flex; flex-direction:column; gap:16px;">
        <p style="font-size:12px; color:#94a3b8; margin:0;">
          Pisahkan frekuensi vokal, drum, bass, dan instrumen secara mandiri untuk remix, isolasi acapella, atau karaoke.
        </p>

        <!-- 4 Stems Channel Strips -->
        <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:10px; background:#0d0a14; padding:14px; border-radius:10px; border:1px solid #2d2238;">
          
          <!-- Stem 1: Vocal -->
          <div style="display:flex; flex-direction:column; align-items:center; gap:8px; background:#1a1426; padding:10px 6px; border-radius:8px;">
            <span style="font-size:20px;">🎤</span>
            <span style="font-size:11px; font-weight:800; color:#38bdf8;">VOCAL</span>
            <input type="range" class="dsp-slider-vertical" id="slider-stem-vocal" min="0" max="150" value="100" orient="vertical" style="height:110px; accent-color:#38bdf8;">
            <button class="btn-stem-mute" id="btn-mute-vocal" data-stem="vocal" style="font-size:10px; padding:4px 8px; border-radius:4px; border:1px solid #ef4444; background:#2a1215; color:#ef4444; cursor:pointer;">MUTE</button>
          </div>

          <!-- Stem 2: Drums -->
          <div style="display:flex; flex-direction:column; align-items:center; gap:8px; background:#1a1426; padding:10px 6px; border-radius:8px;">
            <span style="font-size:20px;">🥁</span>
            <span style="font-size:11px; font-weight:800; color:#f59e0b;">DRUMS</span>
            <input type="range" class="dsp-slider-vertical" id="slider-stem-drums" min="0" max="150" value="100" orient="vertical" style="height:110px; accent-color:#f59e0b;">
            <button class="btn-stem-mute" id="btn-mute-drums" data-stem="drums" style="font-size:10px; padding:4px 8px; border-radius:4px; border:1px solid #ef4444; background:#2a1215; color:#ef4444; cursor:pointer;">MUTE</button>
          </div>

          <!-- Stem 3: Bass -->
          <div style="display:flex; flex-direction:column; align-items:center; gap:8px; background:#1a1426; padding:10px 6px; border-radius:8px;">
            <span style="font-size:20px;">🎸</span>
            <span style="font-size:11px; font-weight:800; color:#a855f7;">BASS</span>
            <input type="range" class="dsp-slider-vertical" id="slider-stem-bass" min="0" max="150" value="100" orient="vertical" style="height:110px; accent-color:#a855f7;">
            <button class="btn-stem-mute" id="btn-mute-bass" data-stem="bass" style="font-size:10px; padding:4px 8px; border-radius:4px; border:1px solid #ef4444; background:#2a1215; color:#ef4444; cursor:pointer;">MUTE</button>
          </div>

          <!-- Stem 4: Instruments -->
          <div style="display:flex; flex-direction:column; align-items:center; gap:8px; background:#1a1426; padding:10px 6px; border-radius:8px;">
            <span style="font-size:20px;">🎹</span>
            <span style="font-size:11px; font-weight:800; color:#10b981;">MUSIC</span>
            <input type="range" class="dsp-slider-vertical" id="slider-stem-inst" min="0" max="150" value="100" orient="vertical" style="height:110px; accent-color:#10b981;">
            <button class="btn-stem-mute" id="btn-mute-inst" data-stem="inst" style="font-size:10px; padding:4px 8px; border-radius:4px; border:1px solid #ef4444; background:#2a1215; color:#ef4444; cursor:pointer;">MUTE</button>
          </div>

        </div>

        <!-- Quick Preset Actions -->
        <div style="display:flex; gap:8px;">
          <button class="btn-action" id="btn-preset-acapella" style="flex:1; font-size:11px; font-weight:700; background:#0e2a38; border-color:#0284c7; color:#38bdf8;">
            🎙️ Solo Acapella (Vocal Only)
          </button>
          <button class="btn-action" id="btn-preset-backing" style="flex:1; font-size:11px; font-weight:700; background:#2a1a0e; border-color:#d97706; color:#fbbf24;">
            🎶 Instrumental Only (No Vocal)
          </button>
          <button class="btn-action" id="btn-preset-reset-stems" style="flex:1; font-size:11px; font-weight:700;">
            🔄 Reset All Stems
          </button>
        </div>

      </div>
      <div class="modal-footer">
        <button class="btn-action" onclick="document.getElementById('stems-modal').classList.remove('active')">Tutup</button>
      </div>
    </div>
  </div>

  <!-- Interactive Parametric EQ Visual Graph Modal (FabFilter Style) -->
  <div class="modal-overlay" id="visual-eq-modal">
    <div class="modal-container" style="max-width: 760px; background: #080c14; border: 1px solid #38bdf8; box-shadow: 0 10px 40px rgba(56, 189, 248, 0.25);">
      <div class="modal-header">
        <h3 style="display:flex; align-items:center; gap:8px; color:#38bdf8;">
          <span>📈</span> Interactive Parametric EQ Curve
        </h3>
        <div style="display:flex; align-items:center; gap:10px;">
          <select id="eq-channel-select" style="background:#131d2e; border:1px solid #38bdf8; color:#38bdf8; font-size:11px; font-weight:700; padding:4px 8px; border-radius:6px;">
            <option value="1">Channel 1 (VOX)</option>
            <option value="2">Channel 2 (GTR)</option>
            <option value="3">Channel 3 (BASS)</option>
            <option value="4">Channel 4 (DRUMS)</option>
          </select>
          <button class="btn-close-modal" onclick="document.getElementById('visual-eq-modal').classList.remove('active')">&times;</button>
        </div>
      </div>
      <div class="modal-body" style="display:flex; flex-direction:column; gap:12px;">
        
        <!-- Interactive Canvas -->
        <div style="position:relative; width:100%; border-radius:8px; overflow:hidden; border:1px solid #1e293b; background:#000;">
          <canvas id="interactive-eq-canvas" width="700" height="300" style="width:100%; height:300px; display:block; cursor:crosshair;"></canvas>
        </div>

        <!-- Band Info Readout & Instruction Hints -->
        <div style="display:flex; justify-content:space-between; align-items:center; background:#0e1624; padding:8px 14px; border-radius:6px; border:1px solid #1e293b;">
          <div style="font-family:var(--font-mono); font-size:11px; font-weight:700; color:#38bdf8;" id="eq-graph-readout">
            Klik & geser node bulat (1-5) untuk mengubah Frequency & Gain. Scroll mouse untuk Q.
          </div>
          <div style="display:flex; gap:8px; font-size:10px;">
            <span style="color:#ef4444;">● 1: Low Cut</span>
            <span style="color:#f59e0b;">● 2: Low Shelf</span>
            <span style="color:#10b981;">● 3: Mid 1</span>
            <span style="color:#06b6d4;">● 4: Mid 2</span>
            <span style="color:#a855f7;">● 5: High Shelf</span>
          </div>
        </div>

      </div>
      <div class="modal-footer">
        <button class="btn-action" onclick="document.getElementById('visual-eq-modal').classList.remove('active')">Tutup</button>
      </div>
    </div>
  </div>

  <!-- LUFS Broadcast & Streaming Loudness Meter Modal -->
  <div class="modal-overlay" id="lufs-modal">
    <div class="modal-container" style="max-width: 620px; background: #0c0a18; border: 1px solid #c084fc; box-shadow: 0 10px 40px rgba(192, 132, 252, 0.25);">
      <div class="modal-header">
        <h3 style="display:flex; align-items:center; gap:8px; color:#c084fc;">
          <span>📊</span> Broadcast & Streaming LUFS Loudness Hub
        </h3>
        <button class="btn-close-modal" onclick="document.getElementById('lufs-modal').classList.remove('active')">&times;</button>
      </div>
      <div class="modal-body" style="display:flex; flex-direction:column; gap:16px;">
        
        <!-- Platform Target Selector -->
        <div style="display:flex; justify-content:space-between; align-items:center; background:#161226; padding:10px 14px; border-radius:8px; border:1px solid #2d2448;">
          <span style="font-size:11px; font-weight:800; color:#cbd5e1;">STANDAR TARGET KENYARINGAN</span>
          <select id="lufs-target-select" style="background:#0a0812; border:1px solid #a855f7; color:#e9d5ff; font-size:11px; font-weight:700; padding:4px 8px; border-radius:6px;">
            <option value="-14.0">🟢 Spotify / Apple Music (-14.0 LUFS)</option>
            <option value="-14.0">🔴 YouTube Music (-14.0 LUFS)</option>
            <option value="-23.0">🟣 EBU R128 Broadcast TV (-23.0 LUFS)</option>
            <option value="-9.0">🟡 Club / EDM Master (-9.0 LUFS)</option>
            <option value="-16.0">🎙️ Apple Podcasts (-16.0 LUFS)</option>
          </select>
        </div>

        <!-- Big LUFS Meters Grid -->
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px;">
          
          <!-- Integrated LUFS -->
          <div style="background:#130e22; border:1px solid #3b2d56; border-radius:10px; padding:14px; text-align:center;">
            <div style="font-size:10px; font-weight:800; color:#a855f7; margin-bottom:6px;">INTEGRATED LUFS</div>
            <div style="font-size:28px; font-weight:900; font-family:var(--font-mono); color:#e9d5ff;" id="meter-lufs-int">-70.0</div>
            <div style="font-size:10px; margin-top:4px; font-weight:700;" id="meter-lufs-diff">Target: -14.0</div>
          </div>

          <!-- Short-Term LUFS (3s) -->
          <div style="background:#130e22; border:1px solid #3b2d56; border-radius:10px; padding:14px; text-align:center;">
            <div style="font-size:10px; font-weight:800; color:#38bdf8; margin-bottom:6px;">SHORT-TERM (3s)</div>
            <div style="font-size:28px; font-weight:900; font-family:var(--font-mono); color:#38bdf8;" id="meter-lufs-st">-70.0</div>
            <div style="font-size:10px; color:#64748b; margin-top:4px;">Window 3 Detik</div>
          </div>

          <!-- Max True Peak (dBTP) -->
          <div style="background:#130e22; border:1px solid #3b2d56; border-radius:10px; padding:14px; text-align:center;">
            <div style="font-size:10px; font-weight:800; color:#f59e0b; margin-bottom:6px;">TRUE-PEAK MAX</div>
            <div style="font-size:28px; font-weight:900; font-family:var(--font-mono); color:#fbbf24;" id="meter-lufs-tp">-70.0</div>
            <div style="font-size:10px; margin-top:4px; font-weight:700; color:#10b981;" id="meter-clip-badge">SAFE (No Clip)</div>
          </div>

        </div>

        <div style="display:flex; justify-content:center;">
          <button class="btn-action" id="btn-reset-lufs" style="font-size:11px; padding:6px 16px;">
            🔄 Reset Akumulasi Metering
          </button>
        </div>

      </div>
      <div class="modal-footer">
        <button class="btn-action" onclick="document.getElementById('lufs-modal').classList.remove('active')">Tutup</button>
      </div>
    </div>
  </div>

  <!-- A/B Reference Track Comparison Modal -->
  <div class="modal-overlay" id="ab-reference-modal">
    <div class="modal-container" style="max-width: 600px; background: #0c1410; border: 1px solid #22c55e; box-shadow: 0 10px 40px rgba(34, 197, 94, 0.25);">
      <div class="modal-header">
        <h3 style="display:flex; align-items:center; gap:8px; color:#4ade80;">
          <span>🅰️/🅱️</span> Commercial Reference Track Hub
        </h3>
        <button class="btn-close-modal" onclick="document.getElementById('ab-reference-modal').classList.remove('active')">&times;</button>
      </div>
      <div class="modal-body" style="display:flex; flex-direction:column; gap:16px;">
        <p style="font-size:12px; color:#94a3b8; margin:0;">
          Bandingkan hasil mixing Anda (Track A) dengan lagu hit komersial (Track B) secara instan dengan loudness auto-matching.
        </p>

        <!-- Big A/B Toggle Button -->
        <div style="display:flex; gap:10px;">
          <button class="btn-action active" id="btn-mode-a" style="flex:1; padding:16px; font-size:14px; font-weight:900; background:#064e3b; border-color:#10b981; color:#34d399;">
            🎛️ TRACK A (Live Mix)
          </button>
          <button class="btn-action" id="btn-mode-b" style="flex:1; padding:16px; font-size:14px; font-weight:900; background:#141e17; border-color:#2e4433; color:#6b7280;">
            🎵 TRACK B (Reference)
          </button>
        </div>

        <!-- Load Reference File -->
        <div style="background:#131e16; border:1px solid #223c28; border-radius:8px; padding:14px;">
          <div style="font-size:11px; font-weight:800; color:#4ade80; margin-bottom:8px;">IMPORT LAGU REFERENSI (MP3 / WAV)</div>
          <input type="file" id="ref-file-input" accept="audio/*" style="font-size:11px; color:#94a3b8; width:100%;">
          <div style="font-size:10px; color:#64748b; margin-top:6px;" id="ref-track-name">Belum ada file referensi dimuat.</div>
        </div>

        <!-- Auto Gain Match Slider -->
        <div style="background:#131e16; border:1px solid #223c28; border-radius:8px; padding:14px;">
          <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:6px;">
            <span>Auto Loudness Matching Offset</span>
            <span style="font-family:var(--font-mono); color:#4ade80; font-weight:700;" id="ref-gain-match-val">0.0 dB</span>
          </div>
          <input type="range" class="dsp-slider-horizontal" id="slider-ref-gain" min="-12" max="12" value="0" step="0.5" style="accent-color:#22c55e;">
        </div>

      </div>
      <div class="modal-footer">
        <button class="btn-action" onclick="document.getElementById('ab-reference-modal').classList.remove('active')">Tutup</button>
      </div>
    </div>
  </div>

  <!-- Toast Container -->
  <div class="toast-container" id="toast-container"></div>

  <!-- Module Entry Point -->
  <script type="module" src="js/app.js?v=3.2.0"></script>
  
  <!-- PWA Service Worker Registration -->
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js?v=3.2.0').then(reg => {
          console.log('OverMix Pro PWA ServiceWorker Registered:', reg.scope);
        }).catch(err => {
          console.warn('ServiceWorker registration failed:', err);
        });
      });
    }
  </script>
</body>
</html>
