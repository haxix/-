<?php
/**
 * 通用存储 API
 * 提供键值对存储功能
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

$action = $_GET['action'] ?? '';

try {
    $pdo = getDBConnection();
    if (!$pdo) {
        throw new Exception('数据库不可用');
    }
    
    switch ($action) {
        case 'get':
            getData($pdo);
            break;
        
        case 'set':
            setData($pdo);
            break;
        
        case 'remove':
            removeData($pdo);
            break;
        
        case 'clear':
            clearData($pdo);
            break;
        
        default:
            throw new Exception('无效的操作');
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

/**
 * 获取数据
 */
function getData($pdo) {
    $key = $_GET['key'] ?? '';
    $userId = $_GET['user_id'] ?? '';
    
    if (!$key || !$userId) {
        throw new Exception('参数不完整');
    }
    
    $stmt = $pdo->prepare("SELECT value FROM storage WHERE user_id = ? AND key = ?");
    $stmt->execute([$userId, $key]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($row) {
        echo json_encode([
            'success' => true,
            'value' => $row['value']
        ], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode([
            'success' => false,
            'error' => '数据不存在'
        ], JSON_UNESCAPED_UNICODE);
    }
}

/**
 * 保存数据
 */
function setData($pdo) {
    $input = json_decode(file_get_contents('php://input'), true);
    $key = $input['key'] ?? '';
    $value = $input['value'] ?? '';
    $userId = $input['user_id'] ?? '';
    
    if (!$key || !$userId) {
        throw new Exception('参数不完整');
    }
    
    // 检查是否存在
    $stmt = $pdo->prepare("SELECT id FROM storage WHERE user_id = ? AND key = ?");
    $stmt->execute([$userId, $key]);
    
    if ($stmt->fetch()) {
        // 更新
        $stmt = $pdo->prepare("UPDATE storage SET value = ?, updated_at = NOW() WHERE user_id = ? AND key = ?");
        $stmt->execute([$value, $userId, $key]);
    } else {
        // 插入
        $stmt = $pdo->prepare("INSERT INTO storage (user_id, key, value, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())");
        $stmt->execute([$userId, $key, $value]);
    }
    
    echo json_encode([
        'success' => true,
        'message' => '保存成功'
    ], JSON_UNESCAPED_UNICODE);
}

/**
 * 删除数据
 */
function removeData($pdo) {
    $input = json_decode(file_get_contents('php://input'), true);
    $key = $input['key'] ?? '';
    $userId = $input['user_id'] ?? '';
    
    if (!$key || !$userId) {
        throw new Exception('参数不完整');
    }
    
    $stmt = $pdo->prepare("DELETE FROM storage WHERE user_id = ? AND key = ?");
    $stmt->execute([$userId, $key]);
    
    echo json_encode([
        'success' => true,
        'message' => '删除成功'
    ], JSON_UNESCAPED_UNICODE);
}

/**
 * 清空数据
 */
function clearData($pdo) {
    $input = json_decode(file_get_contents('php://input'), true);
    $userId = $input['user_id'] ?? '';
    
    if (!$userId) {
        throw new Exception('参数不完整');
    }
    
    $stmt = $pdo->prepare("DELETE FROM storage WHERE user_id = ?");
    $stmt->execute([$userId]);
    
    echo json_encode([
        'success' => true,
        'message' => '清空成功'
    ], JSON_UNESCAPED_UNICODE);
}
