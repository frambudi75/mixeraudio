<?php
// API - Upload Audio File (WAV, MP3, OGG, FLAC, M4A)
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');

$uploadDir = __DIR__ . '/../uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_FILES['audio'])) {
        echo json_encode(['success' => false, 'message' => 'Tidak ada file audio yang diupload.']);
        exit;
    }

    $file = $_FILES['audio'];
    $allowedExtensions = ['wav', 'mp3', 'ogg', 'flac', 'm4a', 'aac'];
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

    if (!in_array($ext, $allowedExtensions)) {
        echo json_encode(['success' => false, 'message' => 'Format file tidak didukung. Gunakan WAV, MP3, OGG, FLAC, atau M4A.']);
        exit;
    }

    $cleanName = preg_replace('/[^a-zA-Z0-9_\-\.]/', '_', pathinfo($file['name'], PATHINFO_FILENAME));
    $fileName = time() . '_' . $cleanName . '.' . $ext;
    $targetPath = $uploadDir . $fileName;

    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        echo json_encode([
            'success' => true,
            'message' => 'File berhasil diunggah.',
            'fileName' => $file['name'],
            'url' => 'uploads/' . $fileName,
            'size' => $file['size']
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Gagal memindahkan file yang diupload.']);
    }
    exit;
}

echo json_encode(['success' => false, 'message' => 'Metode request tidak valid.']);
