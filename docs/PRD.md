# Product Requirements Document (PRD)
## StudioMaster Pro - Web-Based Digital Audio Mixing Console & Workstation

---

## 1. Overview & Vision
**StudioMaster Pro** adalah stasiun kerja audio digital (DAW / Digital Audio Console) berbasis web yang menghadirkan pengalaman mixing audio analog-digital hybrid kelas profesional langsung di peramban web modern tanpa memerlukan instalasi software berat.

Dibangun di atas **Web Audio API native 64-bit float**, aplikasi ini dirancang untuk musisi, produser musik, podcaster, penyiar radio, gamer, dan live streamer yang membutuhkan kontrol mixing multi-track real-time, routing fleksibel antara aplikasi dan jack audio fisik, serta rangkaian pemroses sinyal digital (DSP FX) mutakhir.

---

## 2. Target Pengguna & Use Cases

### A. Podcaster & Live Streamer (Broadcast)
- **Kebutuhan**: Menangkap suara dari mikrofon host & tamu, menggabungkannya dengan backsound dari Spotify/YouTube, dan menggunakan Auto-Ducking agar musik otomatis mengecil saat host berbicara.
- **Fitur Utama**: Auto-Ducking Sidechain, Noise Gate, De-Esser, Live Mic Monitoring, Input Aplikasi (Capture Tab/Window).

### B. Musisi & Produser Musik
- **Kebutuhan**: Melakukan mixing multi-track stems, membentuk karakter tonal instrumen dengan 3-Band Parametric EQ & 5-Band Master EQ, menambahkan Reverb/Delay stereo, dan mengekspor hasil mixdown ke 16-Bit Lossless WAV atau Stems ZIP.
- **Fitur Utama**: Multi-track synchronizer, 18 DSP Studio Presets, Algorithmic Reverb & Tape Delay, Stems Exporter, Master Glue Compressor & Brickwall Limiter.

### C. Live Performance & DJ / Content Creator
- **Kebutuhan**: Memicu jingle dan sound effect secara instan melalui soundboard launchpad, mengontrol fader menggunakan USB MIDI Controller fisik, dan memvisualisasikan fase stereo.
- **Fitur Utama**: 16-Pad Soundboard Sampler, Web MIDI API support, 60FPS FFT Spectrum Analyzer, Stereo Phase Vectorscope (Goniometer).

---

## 3. Fitur Utama & Spesifikasi Fungsional

### 3.1. Core Multi-Track Engine
- **Jumlah Track**: Tidak terbatas (dinamis sesuai kebutuhan pengguna).
- **Sumber Audio (Source Types)**:
  - Audio file buffer (WAV, MP3, OGG, FLAC, M4A).
  - Live Hardware Microphone / Line-In.
  - Tangkapan Audio Internal Aplikasi (System/Browser/Spotify/Game loopback via `getDisplayMedia`).
  - Synthesizer Demo Generator (Drums, 808 Bass, Synth Chords, Lead Arp).
- **Transport Controls**: Play, Pause, Stop, Seek, Loop, BPM Metronome click generator, Real-time Timecode (MM:SS:ms).

### 3.2. DSP Channel Strip (Per-Track)
1. **Preamp / Trim**: +/-24 dB gain adjustment.
2. **High-Pass / Low-Cut Filter**: 20 Hz – 400 Hz biquad filter.
3. **3-Band Semi-Parametric EQ**:
   - Low Shelf: 80 Hz (+/-15 dB).
   - Mid Peaking: Sweepable 200 Hz – 8.000 Hz (+/-15 dB, Q=1.2).
   - High Shelf: 10.000 Hz (+/-15 dB).
4. **Dynamics & Gate**: Noise Gate anti-desis & Dynamic Compressor.
5. **Aux Sends**:
   - Aux 1 Send (Convolution/Algorithmic Studio Reverb).
   - Aux 2 Send (Stereo Tape Ping-Pong Delay).
6. **Pan / Balance**: True Stereo Panner (-100% Left s/d +100% Right).
7. **Solo & Mute**: Logika solo bus eksklusif dan silent mute gate.
8. **Precision Fader**: Vertical throw fader dengan skala dB presisi (-INF s/d +6 dB).
9. **VU Metering**: 16-segment dual peak/RMS LED ballistics dengan peak-hold & clip warning.

### 3.3. Master Section & Studio Processors
- **Master 5-Band Graphic EQ**: 60 Hz, 250 Hz, 1 kHz, 4 kHz, 12 kHz.
- **Master Bus Compressor**: Glue compression untuk mengikat kohesi audio.
- **Master Brickwall Limiter**: Ceiling -0.5 dB untuk mencegah distorsi digital.
- **Master Output Device Selector**: Mengarahkan output master ke jack audio fisik tertentu (Headphone, Speaker, USB DAC) via `setSinkId`.

### 3.5. Input Mix Hub & Anti-Echo Loopback Protection
- **Anti-Echo Local Playback Suppression (`suppressLocalAudioPlayback: true`)**:
  - Mengeliminasi 100% suara ganda / echo fase saat menangkap audio dari aplikasi browser/Spotify/YouTube.
  - Mematikan output lokal aplikasi asli sehingga seluruh audio dialihkan secara murni melalui pemrosesan filter mixer.
- **Pilihan Input Mix Fleksibel**:
  - *Mode 1 (App / Tab Audio)*: Tangkap audio browser/tab/jendela aplikasi dengan proteksi anti-gema aktif.
  - *Mode 2 (Physical Mic / Line-In)*: Mikrofon fisik / jack soundcard direct monitoring.
  - *Mode 3 (Virtual Cable Loopback)*: Deteksi dan routing perangkat loopback OS (VB-Audio Virtual Cable / Stereo Mix) untuk menyaring semua suara PC secara otomatis tanpa dialog pop-up.
  - *Mode 4 (Multi-Track Audio Stems / File Buffer)*: Pemutaran file rekaman independen per channel.
### 3.6. Next-Gen Studio Powerhouse Suite (v3.1)
- **📲 Progressive Web App (PWA)**:
  - Beroperasi sebagai software aplikasi desktop/mobile mandiri (Standalone Window) tanpa address bar browser.
  - Caching aset via Service Worker (`sw.js`) dan konfigurasi PWA (`manifest.json`).
- **🤖 Live Voice Changer (Vocal FX Modulator)**:
  - 6 Mode Suara Real-Time: Clean Studio, Robot Vocoder (Ring Modulation), Chipmunk (High Formant), Deep Monster (Sub-octave + Warm Drive), Alien Space (Dual LFO Wobbler), Megaphone AM (Bandpass + Hard Clipper).
- **🎙️ Custom Soundboard Sampler (Pad 1 - 16)**:
  - Klik kanan / opsi pada pad untuk merekam vokal/jingle langsung dari mikrofon ke dalam memori pad (Live Sampler 2s).
  - Drag & drop file MP3/WAV milik pengguna ke masing-masing pad launchpad.
- **📺 OBS Studio Transparent Streaming Overlay (`overlay.php`)**:
  - Halaman widget tanpa latar belakang khusus OBS Browser Source (1920x1080 / 600x120 banner).
  - Sinkronisasi telemetri 60FPS real-time (Spectrum Canvas, Dual VU Meter LED, Timecode, dan status Preset DSP via BroadcastChannel API).
- **🎤 Real-Time Karaoke Mode (Mid-Side Vocal Suppressor)**:
  - Algoritma Mid-Side Phase Cancellation yang memotong vokal penyanyi di kanal tengah mono sambil mempertahankan instrumen stereo dan bass kick.

---

## 4. Spesifikasi Non-Fungsional
- **Latensi Audio**: Ultra-low interactive latency (~5ms - 15ms buffer).
- **Format Rendering**: Lossless PCM 16-Bit / 44.1kHz stereo WAV.
- **Visual Performance**: 60 FPS Canvas rendering untuk FFT Spectrum dan Vectorscope.
- **Cross-Platform Compatibility**: Windows (XAMPP), Linux (aaPanel / Ubuntu / Debian / CentOS / AlmaLinux), macOS.
- **Browser Support**: Google Chrome, Microsoft Edge, Mozilla Firefox, Opera, Brave, Safari.


