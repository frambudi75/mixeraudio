<?php
// API - List audio files in uploads/
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$uploadDir = __DIR__ . '/../uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

$files = scandir($uploadDir);
$audioList = [];

foreach ($files as $file) {
    if ($file === '.' || $file === '..') continue;
    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    if (in_array($ext, ['wav', 'mp3', 'ogg', 'flac', 'm4a', 'aac'])) {
        $filePath = $uploadDir . $file;
        $audioList[] = [
            'name' => $file,
            'url' => 'uploads/' . $file,
            'size' => filesize($filePath),
            'modified' => date('Y-m-d H:i:s', filemtime($filePath))
        ];
    }
}

echo json_encode(['success' => true, 'files' => $audioList]);
