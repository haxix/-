<?php
/**
 * 数据库配置文件（示例）
 * 复制此文件为 database.php 并填入你的实际配置
 * 注意：database.php 不会提交到 Git，以保护数据库密码
 */

define('DB_HOST', 'localhost');
define('DB_NAME', 'whitecycle');
define('DB_USER', 'your_database_username');
define('DB_PASS', 'your_database_password');
define('DB_CHARSET', 'utf8mb4');

// DSN (Data Source Name)
$dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;

// 错误模式设置为异常
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

/**
 * 获取数据库连接
 */
function getDBConnection() {
    global $dsn, $options;
    
    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $pdo;
    } catch (PDOException $e) {
        // 生产环境不要显示详细错误
        error_log($e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => '数据库连接失败']);
        exit;
    }
}
