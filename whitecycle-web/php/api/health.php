<?php
/**
 * 健康检查 API
 * 检测 MySQL 是否可用
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../config/database.php';

try {
    $pdo = getDBConnection();
    if ($pdo) {
        // 测试数据库连接
        $pdo->query('SELECT 1');
        echo json_encode([
            'status' => 'ok',
            'mysql_available' => true,
            'message' => 'MySQL 连接正常'
        ], JSON_UNESCAPED_UNICODE);
    } else {
        throw new Exception('无法连接数据库');
    }
} catch (Exception $e) {
    echo json_encode([
        'status' => 'ok',
        'mysql_available' => false,
        'message' => 'MySQL 不可用，使用 LocalStorage',
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
