<?php
// NotiCrack - Image Upload Handler
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Upload-Token');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

// Cargar token desde variable de entorno (configurar en cPanel: SetEnv UPLOAD_TOKEN ...)
// o desde archivo .env hermano (no commiteado).
$uploadToken = getenv('UPLOAD_TOKEN') ?: ($_SERVER['UPLOAD_TOKEN'] ?? '');
if (!$uploadToken && is_readable(__DIR__ . '/.env')) {
    foreach (file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        if (strpos(trim($line), 'UPLOAD_TOKEN=') === 0) {
            $uploadToken = trim(substr(trim($line), strlen('UPLOAD_TOKEN=')), "\"'");
            break;
        }
    }
}
if (!$uploadToken) {
    http_response_code(500); echo json_encode(['error' => 'Servidor mal configurado']); exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); echo json_encode(['error' => 'Metodo no permitido']); exit;
}

$token = $_SERVER['HTTP_X_UPLOAD_TOKEN'] ?? '';
if (!hash_equals($uploadToken, $token)) {
    http_response_code(401); echo json_encode(['error' => 'No autorizado']); exit;
}

if (!isset($_FILES['imagen']) || $_FILES['imagen']['error'] !== UPLOAD_ERR_OK) {
    $errCode = $_FILES['imagen']['error'] ?? -1;
    http_response_code(400); echo json_encode(['error' => 'No se recibio ninguna imagen', 'code' => $errCode]); exit;
}

$file = $_FILES['imagen'];

$extensiones = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp',
    'image/gif'  => 'gif'
];

// Detectar MIME real por magic bytes (no depende de fileinfo extension)
function detectMime($path) {
    $f = fopen($path, 'rb');
    if (!$f) return null;
    $bytes = fread($f, 12);
    fclose($f);
    $b = array_values(unpack('C*', $bytes));
    if (count($b) < 3) return null;
    if ($b[0]===0xFF && $b[1]===0xD8 && $b[2]===0xFF) return 'image/jpeg';
    if ($b[0]===0x89 && $b[1]===0x50 && $b[2]===0x4E && $b[3]===0x47) return 'image/png';
    if ($b[0]===0x47 && $b[1]===0x49 && $b[2]===0x46) return 'image/gif';
    if ($b[0]===0x52 && $b[1]===0x49 && $b[2]===0x46 && $b[3]===0x46
        && $b[8]===0x57 && $b[9]===0x45 && $b[10]===0x42 && $b[11]===0x50) return 'image/webp';
    return null;
}

// Intentar finfo primero, fallback a magic bytes
$mimeReal = null;
if (function_exists('finfo_open')) {
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    if ($finfo) {
        $mimeReal = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
    }
}
if (!$mimeReal) {
    $mimeReal = detectMime($file['tmp_name']);
}

if (!$mimeReal || !isset($extensiones[$mimeReal])) {
    http_response_code(400); echo json_encode(['error' => 'Solo JPG, PNG, WebP o GIF', 'mime' => $mimeReal]); exit;
}

if ($file['size'] > 10 * 1024 * 1024) {
    http_response_code(400); echo json_encode(['error' => 'Maximo 10MB']); exit;
}

// Carpeta según tipo: noticias / videos / avatares
$carpeta = preg_replace('/[^a-zA-Z0-9_-]/', '', $_POST['carpeta'] ?? 'noticias');
if (!in_array($carpeta, ['noticias', 'videos', 'avatares'])) $carpeta = 'noticias';

$uploadBase = __DIR__ . '/uploads/' . $carpeta . '/' . date('Y/m');
if (!is_dir($uploadBase)) {
    if (!mkdir($uploadBase, 0755, true)) {
        http_response_code(500); echo json_encode(['error' => 'No se pudo crear directorio']); exit;
    }
}

$ext      = $extensiones[$mimeReal];
$filename = $carpeta . '/' . date('Y/m') . '/' . uniqid('img_', true) . '.' . $ext;
$fullPath = __DIR__ . '/uploads/' . $filename;

if (!move_uploaded_file($file['tmp_name'], $fullPath)) {
    http_response_code(500); echo json_encode(['error' => 'Error al guardar la imagen']); exit;
}

// Servir desde IP directa del cPanel (www.noticrack.com apunta a Vercel)
$url = 'http://198.58.106.39/~noticrac/uploads/' . $filename;
echo json_encode(['url' => $url, 'filename' => $filename, 'size' => $file['size']]);
