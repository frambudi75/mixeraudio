# 🚀 Panduan Deployment ke aaPanel Linux Server (Nginx / Apache)

Aplikasi **StudioMaster Pro v3.0 MASTER** dirancang 100% kompatibel dengan lingkungan Linux (Ubuntu, Debian, AlmaLinux, CentOS, Rocky Linux) pada **aaPanel**.

---

## 📋 Langkah-Langkah Deployment di aaPanel:

### 1. Buat Website di aaPanel
1. Buka dashboard **aaPanel** Anda.
2. Masuk ke menu **Website** > **Add site**.
3. Masukkan Domain atau IP Server Anda (Contoh: `mixer.domainanda.com`).
4. Pilih versi PHP yang diinginkan: **PHP 7.4**, **PHP 8.0**, **PHP 8.1**, atau **PHP 8.2**.
5. Klik **Submit**.

---

### 2. Upload File Project
1. Compress seluruh isi folder `c:\xampp\htdocs\mixeraudio\` menjadi satu file `.zip`.
2. Buka menu **Files** di aaPanel, arahkan ke Document Root website Anda (misal: `/www/wwwroot/mixer.domainanda.com/`).
3. Upload file `.zip` tersebut lalu klik **Unzip**.

---

### 3. Atur Permissions Direktori (Penting untuk Linux!)
Agar PHP dapat menyimpan project preset dan file audio yang diunggah, pastikan folder `uploads/` dan `projects/` memiliki hak akses tulis:
1. Di aaPanel Files Manager, klik kanan folder **`uploads/`** dan **`projects/`**.
2. Pilih **Permission**:
   - Owner: `www`
   - Group: `www`
   - Permission: `755` (atau `777`)
3. Atau via SSH Terminal jalankan perintah:
   ```bash
   chown -R www:www /www/wwwroot/mixer.domainanda.com/uploads /www/wwwroot/mixer.domainanda.com/projects
   chmod -R 755 /www/wwwroot/mixer.domainanda.com/uploads /www/wwwroot/mixer.domainanda.com/projects
   ```

---

### 4. Konfigurasi Web Server (Nginx / Apache)
- **Jika menggunakan Nginx (aaPanel Default)**:
  - Buka **Website** > Klik nama website Anda > Tab **Config**.
  - Pastikan baris `client_max_body_size 100M;` sudah terpasang agar bisa upload audio ukuran besar (lihat contoh di file `nginx.conf`).
- **Jika menggunakan Apache**:
  - File `.htaccess` bawaan proyek sudah otomatis aktif dan mengelola CORS serta batas upload file audio.

---

## 🔒 Dukungan HTTPS / SSL (Sangat Direkomendasikan)
Web Audio API browser memerlukan koneksi **HTTPS** untuk membuka akses mikrofon fisik (`getUserMedia`) dan audio aplikasi (`getDisplayMedia`):
1. Di aaPanel, buka **Website** > Klik nama website > Tab **SSL**.
2. Pilih **Let's Encrypt** > Centang domain > Klik **Apply**.
3. Aktifkan **Force HTTPS**.

Selesai! StudioMaster Pro kini berjalan optimal di server Linux aaPanel Anda! 🎉
