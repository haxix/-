<?php
/**
 * 记录管理 API
 * 处理记录的增删改查
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../config/database.php';

$action = $_GET['action'] ?? '';
$userId = $_GET['user_id'] ?? 0;

try {
    $pdo = getDBConnection();
    
    switch ($action) {
        case 'list':
            getRecords($pdo, $userId);
            break;
        
        case 'create':
            createRecord($pdo, $userId);
            break;
        
        case 'update':
            updateRecord($pdo, $userId);
            break;
        
        case 'delete':
            deleteRecord($pdo, $userId);
            break;
        
        case 'stats':
            getStats($pdo, $userId);
            break;
        
        default:
            echo json_encode(['error' => '无效的操作']);
    }
} catch (Exception $e) {
    error_log($e->getMessage());
    echo json_encode(['error' => '服务器错误']);
}

/**
 * 获取记录列表
 */
function getRecords($pdo, $userId) {
    if (!$userId) {
        echo json_encode(['error' => '未授权']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("
            SELECT * FROM records 
            WHERE user_id = :user_id 
            ORDER BY start_time DESC
        ");
        $stmt->execute([':user_id' => $userId]);
        $records = $stmt->fetchAll();
        
        echo json_encode(['records' => $records]);
    } catch (PDOException $e) {
        echo json_encode(['error' => '获取记录失败']);
    }
}

/**
 * 创建记录
 */
function createRecord($pdo, $userId) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['error' => '请求方法错误']);
        return;
    }
    
    if (!$userId) {
        echo json_encode(['error' => '未授权']);
        return;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    try {
        $stmt = $pdo->prepare("
            INSERT INTO records (user_id, start_time, end_time, duration_minutes, participation, emotion, note)
            VALUES (:user_id, :start_time, :end_time, :duration_minutes, :participation, :emotion, :note)
        ");
        
        $stmt->execute([
            ':user_id' => $userId,
            ':start_time' => $data['start_time'],
            ':end_time' => $data['end_time'],
            ':duration_minutes' => $data['duration_minutes'],
            ':participation' => $data['participation'] ?? 'solo',
            ':emotion' => $data['emotion'] ?? null,
            ':note' => $data['note'] ?? null
        ]);
        
        echo json_encode([
            'success' => true,
            'id' => $pdo->lastInsertId()
        ]);
    } catch (PDOException $e) {
        echo json_encode(['error' => '创建记录失败']);
    }
}

/**
 * 更新记录
 */
function updateRecord($pdo, $userId) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['error' => '请求方法错误']);
        return;
    }
    
    if (!$userId) {
        echo json_encode(['error' => '未授权']);
        return;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    $recordId = $data['id'] ?? 0;
    
    try {
        $stmt = $pdo->prepare("
            UPDATE records 
            SET emotion = :emotion, note = :note
            WHERE id = :id AND user_id = :user_id
        ");
        
        $stmt->execute([
            ':id' => $recordId,
            ':user_id' => $userId,
            ':emotion' => $data['emotion'] ?? null,
            ':note' => $data['note'] ?? null
        ]);
        
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        echo json_encode(['error' => '更新记录失败']);
    }
}

/**
 * 删除记录
 */
function deleteRecord($pdo, $userId) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['error' => '请求方法错误']);
        return;
    }
    
    if (!$userId) {
        echo json_encode(['error' => '未授权']);
        return;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    $recordId = $data['id'] ?? 0;
    
    try {
        $stmt = $pdo->prepare("DELETE FROM records WHERE id = :id AND user_id = :user_id");
        $stmt->execute([
            ':id' => $recordId,
            ':user_id' => $userId
        ]);
        
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        echo json_encode(['error' => '删除记录失败']);
    }
}

/**
 * 获取统计信息
 */
function getStats($pdo, $userId) {
    if (!$userId) {
        echo json_encode(['error' => '未授权']);
        return;
    }
    
    try {
        // 总记录数
        $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM records WHERE user_id = :user_id");
        $stmt->execute([':user_id' => $userId]);
        $total = $stmt->fetch()['total'];
        
        // 本周记录数
        $stmt = $pdo->prepare("
            SELECT COUNT(*) as total FROM records 
            WHERE user_id = :user_id 
            AND YEARWEEK(start_time) = YEARWEEK(NOW())
        ");
        $stmt->execute([':user_id' => $userId]);
        $weekly = $stmt->fetch()['total'];
        
        // 本月记录数
        $stmt = $pdo->prepare("
            SELECT COUNT(*) as total FROM records 
            WHERE user_id = :user_id 
            AND YEAR(start_time) = YEAR(NOW()) 
            AND MONTH(start_time) = MONTH(NOW())
        ");
        $stmt->execute([':user_id' => $userId]);
        $monthly = $stmt->fetch()['total'];
        
        echo json_encode([
            'total' => $total,
            'weekly' => $weekly,
            'monthly' => $monthly
        ]);
    } catch (PDOException $e) {
        echo json_encode(['error' => '获取统计失败']);
    }
}
