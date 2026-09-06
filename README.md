# ⚡ StudioMaster Pro - Web-Based Digital Audio Mixing Console & Workstation

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Web Audio API](https://img.shields.io/badge/Web%20Audio%20API-64--Bit%20DSP-cyan.svg)
![Platform: XAMPP & aaPanel](https://img.shields.io/badge/Platform-XAMPP%20%7C%20aaPanel%20Linux-emerald.svg)
![Version](https://img.shields.io/badge/Version-3.0%20MASTER-gold.svg)

> **StudioMaster Pro** adalah stasiun kerja mixing audio digital profesional berbasis web dengan performa DSP 64-bit float, routing fleksibel antara aplikasi & jack audio fisik, 18 preset studio instan, dan visualizer 60 FPS real-time.

---

## 🌟 Fitur Utama

### 🎛️ 1. Meja Konsol & DSP Channel Strip
- **Preamp Gain / Trim**: Pengaturan gain analog trim (+/-24dB).
- **High-Pass / Low-Cut Filter**: 20Hz – 400Hz.
- **3-Band Semi-Parametric EQ**: Low Shelf (80Hz), Mid Peaking dengan Sweep Frequency (200Hz - 8kHz), dan High Shelf (10kHz).
- **Aux Sends**: Send 1 (Convolution Reverb) & Send 2 (Stereo Tape Delay).
- **Stereo Panning & Precision Faders**: Skala dB presisi (-INF s/d +6dB).
- **Dual Peak/RMS 16-Segment LED VU Meter**: Dengan peak hold ballistics dan clip warning.
- **Illuminated Switches**: Solo, Mute, Arm Record, dan EQ Bypass.

### 🎧 2. Studio Equalizer & DSP FX Suite (18 Presets)
- **18 Preset Studio Lengkap**:
  `Studio Clean`, `Dolby 3D Surround 🌐`, `Live Concert Hall 🏛️`, `8D Spatial Audio 🎧`, `Slowed + Reverb 💧`, `Nightcore ⚡`, `Vaporwave 📼`, `Bass Master 808 🔊`, `Karaoke Mode 🎤`, `Haptic Bass 📳`, `EDM Festival 🔊⚡`, `Vinyl Lo-Fi Chill ☕📼`, `Cathedral 3D Spatial ⛪`, `Podcast Broadcast 🎙️`, `ASMR Binaural 🍃`, `Gaming FPS Surround 🎯`, `Vintage Radio AM 📻`, `Heavy Metal Rock 🎸`.
- **Live Preset to Mixer Sync**: Seluruh knob, fader, dan slider pada konsol mixer otomatis berputar dan berubah nilainya mengikuti preset yang dipilih!
- **Mixer Suara Latar (Ambient Layer)**: Suara sintetis Hujan 🌧️, Api Unggun 🔥, dan Vinyl ☕ dengan slider volume independen.
- **10-Band Graphic Studio Equalizer**: 32Hz – 16kHz dengan pilihan kurva genre cepat.
- **Enhancers**: Deep Sub-Bass, High Air Treble, dan Auto Volume Leveling.

### 🎙️ 3. Broadcast Auto-Ducking (Mode Podcast & Streaming)
- Musik latar otomatis mengecil pelan (-14dB) saat Host berbicara di mikrofon, dan otomatis kembali normal saat host berhenti bicara.

### 🔌 4. Audio I/O Routing Manager
- **Input Aplikasi (App Audio Capture)**: Mengalirkan suara dari Spotify, Discord, Game, atau tab browser langsung ke channel strip mixer.
- **Output Audio Jack Fisik (`setSinkId`)**: Memilih jack output speaker / headphone / USB soundcard tempat suara mixer dikeluarkan.
- **Hardware Microphone / Line-In Selector**: Menghubungkan mic fisik ke channel mixer.

### 📦 5. Ekspor Audio Lossless & Stems Multi-Track
- **Export WAV**: Merender master mixdown ke file 16-Bit 44.1kHz WAV stereo murni.
- **📦 All Stems**: Merender dan mendownload seluruh channel terpisah (Drums, Bass, Vokal, dll) sebagai file WAV individual untuk DAW eksternal.
- **Live Master Recording**: Merekam langsung selama sesi mixing berlangsung.

### 🎨 6. 4 Pilihan Skin / Tema Meja Mixer
- **🎛️ SSL 4000 Dark** (Default modern dark slate).
- **📻 Neve 8078 Vintage** (Warm analog cream & blue).
- **⚡ Cyberpunk Neon** (Electric neon cyan & pink).
- **🎚️ Yamaha Digital 02R** (Silver digital aluminum).

### ⌨️ 7. DAW Keyboard Shortcuts Engine
- `Spasi` (Play/Pause), `R` (Record), `L` (Loop), `M` (Mute), `S` (Solo), `Panah Atas/Bawah` (Fader +/-1dB), `1-8` (Pilih Channel).

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
1. Compress folder `mixeraudio/` menjadi file `.zip`.
2. Di aaPanel, buat website baru (PHP 7.4 / 8.0 / 8.1 / 8.2).
3. Upload dan Unzip ke Document Root website Anda (`/www/wwwroot/your-domain/`).
4. Berikan izin tulis untuk folder `uploads/` dan `projects/`:
   ```bash
   chown -R www:www uploads projects
   chmod -R 755 uploads projects
   ```
5. Aktifkan **SSL (Let's Encrypt / HTTPS)** di aaPanel agar fitur Microphone dan App Audio capture dapat diakses secara penuh.

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
