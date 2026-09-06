<?php
// API - Manage Project Presets / Sessions (Save / Load / List)
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');

$projectsDir = __DIR__ . '/../projects/';
if (!is_dir($projectsDir)) {
    mkdir($projectsDir, 0777, true);
}

$action = $_GET['action'] ?? ($_POST['action'] ?? 'list');

switch ($action) {
    case 'list':
        $files = glob($projectsDir . '*.json');
        $projects = [];
        foreach ($files as $file) {
            $name = basename($file, '.json');
            $updated = filemtime($file);
            $size = filesize($file);
            $projects[] = [
                'name' => $name,
                'updated_at' => date('Y-m-d H:i:s', $updated),
                'size' => $size
            ];
        }
        echo json_encode(['success' => true, 'projects' => $projects]);
        break;

    case 'save':
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true);

        if (!$data || empty($data['name'])) {
            echo json_encode(['success' => false, 'message' => 'Data project atau nama tidak valid.']);
            exit;
        }

        $cleanName = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $data['name']);
        $filePath = $projectsDir . $cleanName . '.json';

        if (file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT))) {
            echo json_encode(['success' => true, 'message' => 'Project berhasil disimpan.', 'name' => $cleanName]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Gagal menyimpan file project.']);
        }
        break;

    case 'load':
        $name = $_GET['name'] ?? '';
        $cleanName = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $name);
        $filePath = $projectsDir . $cleanName . '.json';

        if (file_exists($filePath)) {
            $content = file_get_contents($filePath);
            echo $content; // Return the project JSON directly
        } else {
            echo json_encode(['success' => false, 'message' => 'Project tidak ditemukan.']);
        }
        break;

    case 'delete':
        $name = $_GET['name'] ?? ($_POST['name'] ?? '');
        $cleanName = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $name);
        $filePath = $projectsDir . $cleanName . '.json';

        if (file_exists($filePath) && unlink($filePath)) {
            echo json_encode(['success' => true, 'message' => 'Project berhasil dihapus.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Project tidak ditemukan atau gagal dihapus.']);
        }
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Action tidak dikenali.']);
}
