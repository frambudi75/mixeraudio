# Panduan Penggunaan Lengkap (User Guide)
## StudioMaster Pro - Digital Audio Mixing Console & Workstation

---

## 1. Memulai (Quick Start)
1. Buka aplikasi di peramban web: `http://localhost/mixeraudio/` atau URL server aaPanel Anda (misal: `https://mixer.overheat.my.id`).
2. Klik tombol emas **"Load Demo"** di header atau tekan **`Spasi`** pada keyboard.
3. 4 channel stem audio (Drums, Bass, Chords, Lead Synth) akan langsung termuat dan berputar secara sinkron.

---

## 2. Mengontrol Meja Mixer (Console Controls)
- **Memutar Knob (EQ, Pan, Trim, Aux Sends)**:
  - Klik & geser mouse ke atas untuk menaikkan nilai, ke bawah untuk menurunkan nilai.
  - Tahan tombol **`Shift`** saat menggeser mouse untuk pengaturan presisi tinggi (*fine-tune*).
  - Gunakan **Scroll Mouse** untuk memutar cepat.
  - **Double Click** pada knob untuk mengembalikan ke posisi default (tengah/nol).
- **Menggeser Fader Volume**:
  - Klik & drag fader cap vertikal. Nilai dalam desibel (dB) langsung terbaca di kotak bawah fader.
- **Tombol Strip**:
  - **S (Solo)**: Mematikan seluruh channel lain dan hanya mendengar channel ini.
  - **M (Mute)**: Mematikan suara channel ini seketika.
  - **R (Arm Record)**: Menandai channel untuk sesi rekaman.
  - **EQ**: Mengaktifkan / bypass filter equalizer channel.

---

## 3. Live Auto-Tune Pro Pitch Studio (`⚡ Auto-Tune Pro`)
1. Klik tombol **`⚡ Auto-Tune Pro`** di bar navigasi atas.
2. **Pilih Tangga Nada & Nada Dasar (Root Key)**:
   - Pilih nada dasar: `C`, `C#`, `D`, `D#`, `E`, `F`, `F#`, `G`, `G#`, `A`, `A#`, `B`.
   - Pilih jenis tangga nada: *Major (Pop)*, *Minor (Trap)*, *Pentatonic (RnB)*, *Blues*, *Chromatic*, *Arabic*, *Japanese Hirajoshi*.
3. **Atur Retune Speed**:
   - `0 ms`: Efek vokal robotik keras ala Travis Scott / T-Pain.
   - `15 - 25 ms`: Vokal modern Trap / Pop.
   - `50 - 100 ms`: Koreksi nada vokal halus alami.
4. **Live Microphone Monitoring**:
   - Klik **`🎧 Aktifkan Live Mic Auto-Tune`** untuk mendengar suara vokal Anda terkoreksi secara real-time.
   - Perhatikan **Live Pitch Detector & Cents Bar**: Menunjukkan nada deteksi dan pergeseran sen secara akurat.

---

## 4. Multiband Stem Isolation Studio (`🎛️ Stem Studio`)
1. Klik tombol **`🎛️ Stem Studio`** di header.
2. **Kendali Fader 4 Frekuensi Utama**:
   - 🎤 **VOCAL**: Mengatur level artikulasi vokal tengah.
   - 🥁 **DRUMS**: Mengatur pukulan kick, snare, dan hi-hat atas.
   - 🎸 **BASS**: Mengatur ketebalan sub-bass dan bassline.
   - 🎹 **MUSIC**: Mengatur instrumen harmoni dan backing band.
3. **Tombol Preset Instan**:
   - **`🎙️ Solo Acapella`**: Mengisolasi hanya vokal utama.
   - **`🎶 Instrumental Only`**: Menghilangkan vokal sepenuhnya untuk karaoke instan.
   - **`🔄 Reset All Stems`**: Mengembalikan seluruh fader dan mute ke posisi seimbang.

---

## 5. Live Voice Changer Studio (`🤖 Voice Studio`)
1. Klik tombol **`🤖 Voice Studio`** di header.
2. Klik salah satu dari **8 Kartu Karakter**:
   - 🎙️ **Clean Natural**: Suara asli transparan.
   - 🤖 **Optimus Robot**: Efek Vocoder / Ring Modulation logam.
   - 🐿️ **Chipmunk Anime**: Formant pitch tinggi +8 semitone.
   - 👹 **Darth Monster**: Sub-growl berat -7 semitone.
   - 👽 **Alien Xenomorph**: Modulasi dual-LFO ruang angkasa.
   - 📢 **Police Megaphone**: Bandpass midrange + distorsi analog.
   - 👻 **Ghost Whisper**: Shimmer delay dan space reverb.
   - 📻 **1920s Radio**: Filter lo-fi vintage klasik.
3. **Fine-Tuning Sliders**: Sesuaikan *Pitch Shift*, *Tube Drive*, dan *Wet/Dry Blend*.
4. **Live Monitor**: Klik **`🎧 Start Mic Monitor`** untuk mendengar suara karakter Anda.

---

## 6. 16-Pad Custom Soundboard & Launchpad Sampler
- **Memicu Suara (Trigger)**: Tekan tombol angka `1-4`, huruf `Q-R`, `A-F`, `Z-V` pada keyboard atau klik pad di layar.
- **Merekam Suara Sendiri ke Pad (Direct Mic Sampling)**:
  - Klik kanan pada Pad mana pun yang ingin diisi.
  - Klik **"🔴 Rekam 2 Detik dari Mic"**, lalu bicaralah atau buat suara jingle.
- **Memasang File Audio Custom**:
  - Drag & drop file audio (MP3/WAV) dari komputer langsung ke kotak pad, atau klik kanan pad dan pilih file audio.

---

## 7. Interactive Parametric EQ Graph (`📈 Visual EQ`)
1. Klik tombol **`📈 Visual EQ`** di bar atas.
2. Pilih channel yang ingin diatur pada dropdown (misal: *Channel 1 VOX* atau *Channel 4 DRUMS*).
3. **Mengatur Kurva EQ**:
   - **Klik & Drag Bulatan 1-5**: Geser horizontal untuk frekuensi (Hz), geser vertikal untuk gain (+/-15dB).
   - **Scroll Wheel Mouse**: Putar scroll mouse di atas node untuk memperlebar / mempersempit kurva Q-Factor.
   - Perubahan di kanvas otomatis tersinkronisasi langsung ke knob channel mixer!

---

## 8. Broadcast & Streaming LUFS Loudness Meter (`📊 LUFS Meter`)
1. Klik tombol **`📊 LUFS Meter`** di bar atas.
2. **Pilih Standar Target Platform**:
   - Spotify / Apple Music (`-14.0 LUFS`)
   - YouTube Music (`-14.0 LUFS`)
   - Broadcast TV EBU R128 (`-23.0 LUFS`)
   - Club / EDM Master (`-9.0 LUFS`)
3. Perhatikan indikator:
   - **INTEGRATED LUFS**: Rata-rata kenyaringan keseluruhan lagu.
   - **SHORT-TERM (3s)**: Kenyaringan dinamis 3 detik terakhir.
   - **TRUE-PEAK MAX (dBTP)**: Memastikan tidak ada distorsi inter-sample (*SAFE / CLIPPING*).

---

## 9. Commercial A/B Reference Track Hub (`🅰️/🅱️ Reference`)
1. Klik tombol **`🅰️/🅱️ Reference`** di bar atas.
2. Klik **"Choose File"** untuk mengimpor lagu komersial berkualitas tinggi (MP3/WAV).
3. Klik tombol **`🎵 TRACK B (Reference)`** untuk mendengar lagu acuan, atau **`🎛️ TRACK A (Live Mix)`** untuk kembali ke mixdown Anda.
4. Sistem otomatis melakukan **Auto Gain Matching** agar perbandingan terdengar seimbang dan objektif tanpa bias volume.

---

## 10. OBS Studio Transparent Streaming Overlay (`overlay.php`)
1. Klik tombol **`📺 OBS Overlay`** di header.
2. Klik tombol **"Copy URL"**.
3. Buka OBS Studio di komputer Anda:
   - Tambahkan Source baru -> Pilih **Browser Source**.
   - Paste URL yang disalin (misal: `https://mixer.overheat.my.id/overlay.php`).
   - Atur resolusi (misal: `1920 x 1080` atau `600 x 120`).
4. Widget akan otomatis menampilkan visualisasi spektrum FFT, dual VU meter, timecode, dan status preset DSP secara transparan tanpa latensi!

---

## 11. Audio I/O Routing (Input Aplikasi & Output Jack)
1. Klik tombol **"I/O Routing"** di header.
2. **Pilih Output Jack Fisik**:
   - Pilih dropdown *Master Audio Output Jack* untuk mengarahkan suara ke Headphone, Speaker USB, atau Line Out tertentu.
3. **Mengalirkan Suara dari Spotify / Game / YouTube (App Audio Capture)**:
   - Klik **"Pilih Jendela Aplikasi & Mulai Tangkap Audio"** (atau tombol hijau di header).
   - Pilih tab browser atau jendela aplikasi yang diinginkan dan **centang opsi "Share Audio / Bagikan Audio"**.
   - Fitur **Anti-Echo Loopback Protection** (`suppressLocalAudioPlayback`) otomatis aktif untuk mencegah suara ganda.

---

## 9. Studio Equalizer & DSP FX (18 Presets)
1. Klik tombol biru **"Studio DSP FX"** di header.
2. Klik salah satu dari **18 Preset Studio** (misal: *Dolby 3D Surround*, *Live Concert Hall*, *8D Spatial Audio*, *Bass Master 808*, *Vaporwave*, *Cathedral 3D Spatial*, *EDM Festival*, dll).
3. Meja mixer otomatis berputar dan menyesuaikan EQ, Reverb, Delay, dan Panning secara visual dan akustik!
4. **Mixer Suara Latar (Ambient Layer)**:
   - Pilih tombol **Hujan 🌧️**, **Api Unggun 🔥**, atau **Vinyl ☕** untuk menambahkan layer ambient relaksasi dengan volume slider mandiri.

---

## 10. Mode Broadcast / Podcast Auto-Ducking
- Klik tombol **"🎙️ Auto-Duck"** di header untuk mengaktifkannya.
- Saat mikrofon mendeteksi Anda berbicara, musik latar di channel lain akan **otomatis mengecil (-14dB)**, dan otomatis kembali naik saat Anda berhenti bicara.

---

## 11. Ekspor Audio Lossless & Stems Multi-Track
- **Export WAV**: Merender seluruh hasil mixing ke file WAV 16-Bit stereo lossless master.
- **📦 All Stems**: Merender dan mendownload setiap track individual (Drums, Bass, Vokal, dll) sebagai file WAV terpisah untuk diolah di DAW eksternal.
- **Record Mixdown (Tombol R merah)**: Merekam langsung selama sesi mixing berlangsung.

---

## 12. Daftar Lengkap Keyboard Shortcuts
| Tombol | Fungsi |
| :--- | :--- |
| **`Spasi`** | Play / Pause Pemutaran Audio |
| **`R`** | Mulai / Stop Rekam Master Mixdown |
| **`L`** | Aktifkan / Nonaktifkan Loop Pemutaran |
| **`M`** | Toggle Mute pada Channel Terpilih |
| **`S`** | Toggle Solo pada Channel Terpilih |
| **`Panah Atas / Bawah`** | Naikkan / Turunkan Volume Fader (+/- 1dB) |
| **`Panah Kiri / Kanan`** | Pindah Channel Sebelumnya / Berikutnya |
| **`1` s/d `8`** | Pilih Langsung Channel 1 hingga 8 |
| **`1, 2, 3, 4`** | Trigger Launchpad Baris 1 (Kick, Snare, Clap, Hat) |
| **`Q, W, E, R`** | Trigger Launchpad Baris 2 (Open Hat, Crash, Low Tom, Hi Tom) |
| **`A, S, D, F`** | Trigger Launchpad Baris 3 (Sub Drop, Laser, Air Horn, Scratch) |
| **`Z, X, C, V`** | Trigger Launchpad Baris 4 (Riser, Hey Vocal, Siren, Noise FX) |
| **`Shift + ?`** | Buka Panduan Keyboard Shortcuts |
