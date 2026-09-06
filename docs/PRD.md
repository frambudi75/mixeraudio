# Product Requirements Document (PRD)
## OverMix Pro - Web-Based Digital Audio Mixing Console & Workstation

---

## 1. Overview & Vision
**OverMix Pro** adalah stasiun kerja audio digital (DAW / Digital Audio Console) berbasis web yang menghadirkan pengalaman mixing audio analog-digital hybrid kelas profesional langsung di peramban web modern tanpa memerlukan instalasi software berat.

Dibangun di atas **Web Audio API native 64-bit float**, aplikasi ini dirancang untuk musisi, produser musik, podcaster, penyiar radio, gamer, dan live streamer yang membutuhkan kontrol mixing multi-track real-time, routing fleksibel antara aplikasi dan jack audio fisik, serta rangkaian pemroses sinyal digital (DSP FX) mutakhir.

---

## 2. Target Pengguna & Use Cases

### A. Podcaster & Live Streamer (Broadcast)
- **Kebutuhan**: Menangkap suara dari mikrofon host & tamu, menggabungkannya dengan backsound dari Spotify/YouTube, dan menggunakan Auto-Ducking agar musik otomatis mengecil saat host berbicara.
- **Fitur Utama**: Auto-Ducking Sidechain, Noise Gate, De-Esser, Live Mic Monitoring, Input Aplikasi (Capture Tab/Window), OBS Live Stream Transparent Overlay.

### B. Musisi & Produser Musik
- **Kebutuhan**: Melakukan mixing multi-track stems, koreksi nada vokal otomatis (Auto-Tune), isolasi frekuensi instrumen (Stems), membentuk karakter tonal instrumen dengan 3-Band Parametric EQ & 10-Band Graphic EQ, menambahkan Reverb/Delay stereo, dan mengekspor hasil mixdown ke 16-Bit Lossless WAV atau Stems ZIP.
- **Fitur Utama**: Live Auto-Tune Pro Studio, Multiband Stem Isolation Studio, Multi-track synchronizer, 18 DSP Studio Presets, Algorithmic Reverb & Tape Delay, Stems Exporter, Master Glue Compressor & Brickwall Limiter.

### C. Live Performance, DJ & Content Creator
- **Kebutuhan**: Memicu jingle dan sound effect secara instan melalui soundboard launchpad, modulasi suara vokal karakter (Voice Changer), mengontrol fader menggunakan USB MIDI Controller fisik, dan memvisualisasikan fase stereo.
- **Fitur Utama**: 16-Pad Soundboard Sampler (Live Mic Record to Pad), Voice Changer Studio (8 Karakter), Web MIDI API support, 60FPS FFT Spectrum Analyzer, Stereo Phase Vectorscope (Goniometer).

---

## 3. Fitur Utama & Spesifikasi Fungsional

### 3.1. Core Multi-Track Engine
- **Jumlah Track**: Tidak terbatas (dinamis sesuai kebutuhan pengguna).
- **Sumber Audio (Source Types)**:
  - Audio file buffer (WAV, MP3, OGG, FLAC, M4A).
  - Live Hardware Microphone / Line-In.
  - Tangkapan Audio Internal Aplikasi (System/Browser/Spotify/Game loopback via `getDisplayMedia` dengan proteksi anti-echo).
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

### 3.4. Next-Gen Studio Powerhouse Suite (v3.1)

#### ⚡ A. Live Auto-Tune Pro Studio
- **Autocorrelation Pitch Detection**: Algoritma pelacak nada vokal mikrofon real-time (60Hz s/d 1600Hz).
- **Live Pitch & Cents Ribbon Display**: Menampilkan visualisasi nada yang terdeteksi vs nada target dalam skala beserta offset sen (-50 s/d +50 cents).
- **7 Musical Scales & 12 Root Keys**: Major (Pop), Minor (Trap), Pentatonic (RnB), Blues, Chromatic (12-Tones), Arabic (Maqam), dan Japanese Hirajoshi.
- **Retune Speed Control**: Dari 0 ms (*Hard Robotic T-Pain / Travis Scott*) hingga 100 ms (*Natural Vocal Pitch Assist*).
- **Live Auto-Tune Monitor**: Mengalirkan suara mic termodulasi auto-tune ke master bus dan headphone loopback.

#### 🎛️ B. Multiband Stem Isolation Studio
- **4-Way Frequency Crossover Splitter**:
  - 🎤 **Vocal Stem**: Isolasi artikulasi pita suara (220 Hz – 3.800 Hz).
  - 🥁 **Drums & Percussion**: Isolasi transien pukulan snare & cymbals (> 7.500 Hz).
  - 🎸 **Bass & Sub**: Isolasi sub-bass & bassline tebal (< 180 Hz).
  - 🎹 **Instruments / Music**: Isolasi instrumen harmoni dan backing band (600 Hz – 7.500 Hz).
- **Per-Stem Mute & Level Faders**: Fader volume independen dan tombol MUTE untuk tiap instrumen.
- **One-Click Presets**: `Solo Acapella` (Vokal Murni) dan `Instrumental Only` (Karaoke Murni).

#### 🤖 C. Live Voice Changer Studio
- **8 Preset Karakter Suara Real-Time**:
  - 🎙️ Clean Natural
  - 🤖 Optimus Robot (Ring Modulation Vocoder)
  - 🐿️ Chipmunk Anime (High Formant Shift +8ST)
  - 👹 Darth Monster (Deep Sub-Growl -7ST)
  - 👽 Alien Xenomorph (Dual LFO Modulation)
  - 📢 Police Megaphone (Bandpass Mid + Saturation)
  - 👻 Ghost Whisper (Airy Shimmer Delay + Space Reverb)
  - 📻 1920s Vintage Radio (Lo-Fi Bandpass Filter)
- **Parametric Fine-Tuning Sliders**: Pitch Shift (-12 s/d +12 ST), Tube Drive Saturation, dan FX Wet/Dry Blend.
- **Live Microphone Monitor**: Direct low-latency headphone preview.

#### 🎙️ D. 16-Pad Custom Soundboard & Launchpad Sampler
- **Live Mic Record to Pad**: Merekam cuplikan vokal/jingle 2 detik langsung dari mic ke memori pad.
- **Drag & Drop Audio Files**: Mengimpor file MP3/WAV milik user ke masing-masing pad.
- **Keyboard Shortcuts Grid**: `1-4`, `Q-R`, `A-F`, `Z-V`.

#### 📺 E. OBS Studio Transparent Streaming Overlay (`overlay.php`)
- Widget khusus browser source OBS Studio tanpa background transparan.
- Sinkronisasi telemetri 60FPS real-time (FFT Spectrum Canvas, Dual VU Meters, Timecode, Active DSP Preset) via `BroadcastChannel API`.

#### 📈 F. Interactive Parametric EQ Graph (FabFilter Pro-Q Style)
- Tampilan kurva respons frekuensi visual interaktif dengan kanvas FFT Spectrum real-time (20Hz – 20.000Hz).
- 5 Node Point Interaktif yang bisa di-drag: *Low Cut, Low Shelf, Mid Bell 1, Mid Bell 2, High Shelf*.
- Kendali Q-Factor dinamis menggunakan Scroll Wheel mouse dan sinkronisasi 2 arah dengan knob mixer channel.

#### 📊 G. Broadcast & Streaming LUFS Loudness Meter (ITU-R BS.1770 / EBU R128)
- K-Weighted Pre-filtering (Stage 1 High-Shelf + Stage 2 High-Pass).
- Pengukuran: `Integrated LUFS`, `Short-Term LUFS (3s)`, `Momentary LUFS (400ms)`, dan `Max True-Peak (dBTP)`.
- Platform Target Compliance: Spotify (`-14.0 LUFS`), YouTube Music (`-14.0 LUFS`), EBU R128 TV (`-23.0 LUFS`), Club/EDM Master (`-9.0 LUFS`), Apple Podcasts (`-16.0 LUFS`).

#### 🅰️/🅱️ H. Commercial A/B Reference Track Hub
- Pemuatan file audio referensi komersial (WAV/MP3) untuk perbandingan langsung dengan track mixdown live.
- Seamless zero-latency instant crossfade toggle dengan algoritma **Auto Gain Matching** untuk meniadakan bias kenyaringan (*loudness bias*).

#### 📲 I. Progressive Web App (PWA)
- Beroperasi sebagai software aplikasi desktop/mobile mandiri (Standalone Window) tanpa browser bar.
- Caching aset via Service Worker (`sw.js`) dan konfigurasi PWA (`manifest.json`).

---

## 4. Spesifikasi Non-Fungsional
- **Latensi Audio**: Ultra-low interactive latency (~5ms - 15ms buffer).
- **Format Rendering**: Lossless PCM 16-Bit / 44.1kHz stereo WAV.
- **Visual Performance**: 60 FPS Canvas rendering untuk FFT Spectrum dan Vectorscope.
- **Cross-Platform Compatibility**: Windows (XAMPP), Linux (aaPanel / Ubuntu / Debian / CentOS / AlmaLinux), macOS.
- **Browser Support**: Google Chrome, Microsoft Edge, Mozilla Firefox, Opera, Brave, Safari.
