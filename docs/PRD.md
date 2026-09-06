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

### 3.4. Studio Equalizer & DSP FX Suite (18 Presets)
- 18 Preset Studio: Studio Clean, Dolby 3D Surround, Live Concert Hall, 8D Spatial Audio, Slowed + Reverb, Nightcore, Vaporwave, Bass Master 808, Karaoke Mode, Haptic Bass, EDM Festival, Vinyl Lo-Fi Chill, Cathedral 3D Spatial, Podcast Broadcast, ASMR Binaural, Gaming FPS Surround, Vintage Radio AM, Heavy Metal Rock.
- Ambient White Noise Generator: Hujan 🌧️, Api Unggun 🔥, Vinyl ☕ dengan volume independen.
- 10-Band Studio Equalizer (32Hz – 16kHz) dengan kurva genre instan.
- Enhancers: Deep Sub-Bass, High Air Treble, dan Auto Volume Leveling.

---

## 4. Spesifikasi Non-Fungsional
- **Latensi Audio**: Ultra-low interactive latency (~5ms - 15ms buffer).
- **Format Rendering**: Lossless PCM 16-Bit / 44.1kHz stereo WAV.
- **Visual Performance**: 60 FPS Canvas rendering untuk FFT Spectrum dan Vectorscope.
- **Cross-Platform Compatibility**: Windows (XAMPP), Linux (aaPanel / Ubuntu / Debian / CentOS / AlmaLinux), macOS.
- **Browser Support**: Google Chrome, Microsoft Edge, Mozilla Firefox, Opera, Brave, Safari.
