# ⚡ StudioMaster Pro - Web-Based Digital Audio Mixing Console & Workstation

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Web Audio API](https://img.shields.io/badge/Web%20Audio%20API-64--Bit%20DSP-cyan.svg)
![Platform: XAMPP & aaPanel](https://img.shields.io/badge/Platform-XAMPP%20%7C%20aaPanel%20Linux-emerald.svg)
![Version](https://img.shields.io/badge/Version-3.1%20MASTER-gold.svg)

> **StudioMaster Pro** adalah stasiun kerja mixing audio digital profesional berbasis web dengan performa DSP 64-bit float, routing fleksibel antara aplikasi & jack audio fisik, Auto-Tune vokal real-time, Multiband Stem isolation, 8 karakter Voice Changer, 18 preset studio instan, dan visualizer 60 FPS real-time.

---

## 🌟 Fitur Utama & Modul Studio (v3.1)

### ⚡ 1. Live Auto-Tune Pro Pitch Studio
- **Real-Time Pitch Detection**: Pelacak frekuensi nada mikrofon otomatis (60Hz – 1600Hz).
- **Live Pitch & Cents Ribbon Meter**: Menampilkan visualisasi nada terdeteksi vs nada target dalam skala beserta offset sen (-50 s/d +50 cents).
- **7 Musical Scales & 12 Root Keys**: *Major (Pop)*, *Minor (Trap)*, *Pentatonic (RnB)*, *Blues*, *Chromatic*, *Arabic (Maqam)*, dan *Japanese Hirajoshi*.
- **Retune Speed Control**: `0 ms` (Hard T-Pain / Travis Scott) hingga `100 ms` (Natural Vocal Pitch Assist).
- **Live Mic Auto-Tune**: Monitoring headphone instan suara mic yang termodulasi auto-tune.

### 🎛️ 2. Multiband Stem Isolation Studio
- **4-Way Frequency Crossover Splitter**:
  - 🎤 **Vocal Stem** (220 Hz – 3.800 Hz)
  - 🥁 **Drums & Percussion** (> 7.500 Hz)
  - 🎸 **Bass & Sub-Bass** (< 180 Hz)
  - 🎹 **Instruments / Music Backing** (600 Hz – 7.500 Hz)
- **Per-Stem Volume Sliders & Mute Buttons**: Kendali fader dan mute independen tiap instrumen.
- **Quick Shortcuts**: Mode `Solo Acapella` (Vokal Murni) dan `Instrumental Only` (Karaoke Murni).

### 🤖 3. Live Voice Changer Studio
- **8 Preset Karakter Suara Real-Time**:
  `Clean Natural`, `Optimus Robot 🤖`, `Chipmunk Anime 🐿️`, `Darth Monster 👹`, `Alien Xenomorph 👽`, `Police Megaphone 📢`, `Ghost Whisper 👻`, `1920s Vintage Radio 📻`.
- **Parametric Sliders**: Pitch Shift (-12 s/d +12 ST), Tube Drive Saturation, dan Wet/Dry Blend.
- **Headphone Loopback Monitor**: Mendengar suara mic termodulasi dengan latensi mendekati 0ms.

### 🎙️ 4. 16-Pad Custom Soundboard & Launchpad Sampler
- **Direct Mic Sampling**: Merekam cuplikan vokal/jingle 2 detik langsung dari mic ke memori pad.
- **Custom Sample Import**: Drag & Drop file audio (MP3/WAV) langsung ke pad mana pun.
- **Shortcut Grid Keyboard**: `1-4`, `Q-R`, `A-F`, `Z-V`.

### 📺 5. OBS Studio Transparent Streaming Overlay (`overlay.php`)
- Widget khusus browser source OBS Studio tanpa background (transparan).
- Sinkronisasi telemetri 60FPS real-time (FFT Spectrum Canvas, Dual VU Meters, Timecode, Active DSP Preset) via `BroadcastChannel API`.

### 🎛️ 6. Meja Konsol & DSP Channel Strip
- **Preamp Gain / Trim**: Pengaturan gain analog trim (+/-24dB).
- **High-Pass / Low-Cut Filter**: 20Hz – 400Hz.
- **3-Band Semi-Parametric EQ**: Low Shelf (80Hz), Mid Peaking dengan Sweep Frequency (200Hz - 8kHz), dan High Shelf (10kHz).
- **Aux Sends**: Send 1 (Convolution Reverb) & Send 2 (Stereo Tape Delay).
- **Stereo Panning & Precision Faders**: Skala dB presisi (-INF s/d +6dB).
- **Dual Peak/RMS 16-Segment LED VU Meter**: Dengan peak hold ballistics dan clip warning.
- **Illuminated Switches**: Solo, Mute, Arm Record, dan EQ Bypass.

### 🎧 7. Studio Equalizer & DSP FX Suite (18 Presets)
- **18 Preset Studio Lengkap**:
  `Studio Clean`, `Dolby 3D Surround 🌐`, `Live Concert Hall 🏛️`, `8D Spatial Audio 🎧`, `Slowed + Reverb 💧`, `Nightcore ⚡`, `Vaporwave 📼`, `Bass Master 808 🔊`, `Karaoke Mode 🎤`, `Haptic Bass 📳`, `EDM Festival 🔊⚡`, `Vinyl Lo-Fi Chill ☕📼`, `Cathedral 3D Spatial ⛪`, `Podcast Broadcast 🎙️`, `ASMR Binaural 🍃`, `Gaming FPS Surround 🎯`, `Vintage Radio AM 📻`, `Heavy Metal Rock 🎸`.
- **Live Preset to Mixer Sync**: Seluruh knob, fader, dan slider pada konsol mixer otomatis berputar dan berubah nilainya mengikuti preset yang dipilih!
- **Mixer Suara Latar (Ambient Layer)**: Suara sintetis Hujan 🌧️, Api Unggun 🔥, dan Vinyl ☕ dengan slider volume independen.
- **10-Band Graphic Studio Equalizer**: 32Hz – 16kHz dengan pilihan kurva genre cepat.
- **Enhancers**: Deep Sub-Bass, High Air Treble, dan Auto Volume Leveling.

### 🎙️ 8. Broadcast Auto-Ducking (Mode Podcast & Streaming)
- Musik latar otomatis mengecil pelan (-14dB) saat Host berbicara di mikrofon, dan otomatis kembali normal saat host berhenti bicara.

### 🔌 9. Audio I/O Routing Manager
- **Anti-Echo App Audio Capture (`suppressLocalAudioPlayback: true`)**: Mengalirkan suara dari Spotify, Discord, Game, atau tab browser tanpa suara ganda / echo fase.
- **Output Audio Jack Fisik (`setSinkId`)**: Memilih jack output speaker / headphone / USB soundcard tempat suara mixer dikeluarkan.
- **Hardware Microphone / Line-In Selector**: Menghubungkan mic fisik ke channel mixer.

### 📦 10. Ekspor Audio Lossless & Stems Multi-Track
- **Export WAV**: Merender master mixdown ke file 16-Bit 44.1kHz WAV stereo murni.
- **📦 All Stems**: Merender dan mendownload seluruh channel terpisah (Drums, Bass, Vokal, dll) sebagai file WAV individual untuk DAW eksternal.
- **Live Master Recording**: Merekam langsung selama sesi mixing berlangsung.

### 🎨 11. 4 Pilihan Skin / Tema Meja Mixer
- **🎛️ SSL 4000 Dark** (Default modern dark slate).
- **📻 Neve 8078 Vintage** (Warm analog cream & blue).
- **⚡ Cyberpunk Neon** (Electric neon cyan & pink).
- **🎚️ Yamaha Digital 02R** (Silver digital aluminum).

---

## 🚀 Panduan Instalasi & Menjalankan

### A. Localhost (XAMPP di Windows / Mac / Linux)
1. Letakkan folder proyek di direktori htdocs XAMPP:
   `c:\xampp\htdocs\mixeraudio\`
2. Jalankan Apache di XAMPP Control Panel.
3. Buka browser dan akses:
   ```
   http://localhost/mixeraudio/
   ```
4. Klik tombol **"Load Demo"** untuk langsung mencoba audio multi-track!

### B. Deploy ke aaPanel Linux Server (Nginx / Apache)
1. Akses server melalui Terminal aaPanel / SSH.
2. Masuk ke direktori web dan lakukan Git Pull:
   ```bash
   cd /www/wwwroot/mixer.overheat.my.id
   git pull origin main
   ```
3. Berikan izin tulis untuk folder `uploads/` dan `projects/`:
   ```bash
   chown -R www:www uploads projects
   chmod -R 755 uploads projects
   ```
4. Buka **`https://mixer.overheat.my.id`** dan tekan **`Ctrl + F5`** (Hard Refresh).

---

## 📚 Dokumentasi Lengkap
- [Product Requirements Document (PRD)](docs/PRD.md)
- [System Architecture & Audio Graph](docs/ARCHITECTURE.md)
- [Panduan Penggunaan Lengkap (User Guide)](docs/USER_GUIDE.md)
- [PHP REST API Reference](docs/API_DOCUMENTATION.md)
- [Panduan Deployment aaPanel Linux](DEPLOY_LINUX_AAPANEL.md)

---

## 📄 Lisensi
Didistribusikan di bawah Lisensi MIT. Bebas digunakan untuk keperluan personal maupun komersial.
