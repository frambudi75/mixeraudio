# PHP REST API Documentation
## StudioMaster Pro Backend Endpoints

Aplikasi menyertakan backend API berbasis PHP untuk pengelolaan file audio dan project session di XAMPP maupun aaPanel.

---

### 1. Upload File Audio
- **Endpoint**: `POST /api/upload.php`
- **Content-Type**: `multipart/form-data`
- **Parameter**:
  - `audio`: File audio (`WAV`, `MP3`, `OGG`, `FLAC`, `M4A`, `AAC`, max 100MB).
- **Response Success (200 OK)**:
  ```json
  {
    "success": true,
    "message": "File berhasil diunggah.",
    "fileName": "vocal_take_01.wav",
    "url": "uploads/1725619200_vocal_take_01.wav",
    "size": 15420310
  }
  ```

---

### 2. Simpan Project Session
- **Endpoint**: `POST /api/projects.php?action=save`
- **Content-Type**: `application/json`
- **Request Body**:
  ```json
  {
    "name": "Live_Session_Acoustic",
    "bpm": 120,
    "masterVolume": 1.0,
    "masterEQ": [0, 0, 0, 0, 0],
    "channels": [
      { "id": 1, "name": "VOX", "gain": 1.0, "pan": 0, "trim": 0, "eqLow": 0, "eqMid": 0, "eqHigh": 0 }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Project berhasil disimpan.",
    "name": "Live_Session_Acoustic"
  }
  ```

---

### 3. Ambil Daftar Project Tersimpan
- **Endpoint**: `GET /api/projects.php?action=list`
- **Response**:
  ```json
  {
    "success": true,
    "projects": [
      { "name": "Demo_Session_Electronic", "updated_at": "2026-09-06 10:00:00", "size": 1024 },
      { "name": "Podcast_Broadcast_Master", "updated_at": "2026-09-06 10:00:00", "size": 1150 }
    ]
  }
  ```

---

### 4. Muat Project Tertentu
- **Endpoint**: `GET /api/projects.php?action=load&name=Demo_Session_Electronic`
- **Response**: Mengembalikan objek JSON konfigurasi project.

---

### 5. Hapus Project
- **Endpoint**: `GET/POST /api/projects.php?action=delete&name=Demo_Session_Electronic`
- **Response**:
  ```json
  {
    "success": true,
    "message": "Project berhasil dihapus."
  }
  ```

---

### 6. Daftar File Audio di Server
- **Endpoint**: `GET /api/list_audio.php`
- **Response**:
  ```json
  {
    "success": true,
    "files": [
      { "name": "sample_kick.wav", "url": "uploads/sample_kick.wav", "size": 44100, "modified": "2026-09-06 10:00:00" }
    ]
  }
  ```
