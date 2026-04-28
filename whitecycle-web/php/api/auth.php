<?php
/**
 * 用户认证 API
 * 处理用户注册、登录、验证等
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

try {
    $pdo = getDBConnection();
    
    switch ($action) {
        case 'register':
            register($pdo);
            break;
        
        case 'login':
            login($pdo);
            break;
        
        case 'verify':
            verify($pdo);
            break;
        
        case 'changePassword':
            changePassword($pdo);
            break;
        
        case 'setSecurityQuestion':
            setSecurityQuestion($pdo);
            break;
        
        case 'getSecurityQuestion':
            getSecurityQuestion($pdo);
            break;
        
        case 'resetPassword':
            resetPassword($pdo);
            break;
        
        case 'getUserId':
            getUserIdByUsername($pdo);
            break;
        
        case 'verifySecurityAnswer':
            verifySecurityAnswer($pdo);
            break;
        
        default:
            echo json_encode(['error' => '无效的操作']);
    }
} catch (Exception $e) {
    error_log($e->getMessage());
    echo json_encode(['error' => '服务器错误']);
}

/**
 * 用户注册
 */
function register($pdo) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['error' => '请求方法错误']);
        return;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    $username = trim($data['username'] ?? '');
    $password = $data['password'] ?? '';
    
    if (empty($username) || strlen($password) < 6) {
        echo json_encode(['error' => '用户名不能为空，密码至少 6 位']);
        return;
    }
    
    // 生成盐值和哈希密码
    $salt = bin2hex(random_bytes(16));
    $passwordHash = hash('sha256', $password . $salt);
    
    try {
        $stmt = $pdo->prepare("INSERT INTO users (username, password_hash, salt) VALUES (:username, :password_hash, :salt)");
        $stmt->execute([
            ':username' => $username,
            ':password_hash' => $passwordHash,
            ':salt' => $salt
        ]);
        
        echo json_encode([
            'success' => true,
            'user_id' => $pdo->lastInsertId(),
            'username' => $username
        ]);
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) {
            echo json_encode(['error' => '用户名已存在']);
        } else {
            echo json_encode(['error' => '注册失败']);
        }
    }
}

/**
 * 用户登录
 */
function login($pdo) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['error' => '请求方法错误']);
        return;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    $username = trim($data['username'] ?? '');
    $password = $data['password'] ?? '';
    
    if (empty($username) || empty($password)) {
        echo json_encode(['error' => '用户名和密码不能为空']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = :username");
        $stmt->execute([':username' => $username]);
        $user = $stmt->fetch();
        
        if (!$user) {
            echo json_encode(['error' => '用户名或密码错误', 'success' => false]);
            return;
        }
        
        // 验证密码
        $passwordHash = hash('sha256', $password . $user['salt']);
        if ($passwordHash !== $user['password_hash']) {
            echo json_encode(['error' => '用户名或密码错误', 'success' => false]);
            return;
        }
        
        // 更新最后登录时间
        $stmt = $pdo->prepare("UPDATE users SET last_login_at = NOW() WHERE id = :id");
        $stmt->execute([':id' => $user['id']]);
        
        echo json_encode([
            'success' => true,
            'user_id' => $user['id'],
            'username' => $user['username'],
            'identity' => $user['identity']
        ]);
    } catch (PDOException $e) {
        echo json_encode(['error' => '登录失败']);
    }
}

/**
 * 验证登录状态
 */
function verify($pdo) {
    $userId = $_GET['user_id'] ?? 0;
    
    if (!$userId) {
        echo json_encode(['valid' => false]);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("SELECT id, username, identity FROM users WHERE id = :id");
        $stmt->execute([':id' => $userId]);
        $user = $stmt->fetch();
        
        if ($user) {
            echo json_encode([
                'valid' => true,
                'user' => $user
            ]);
        } else {
            echo json_encode(['valid' => false]);
        }
    } catch (PDOException $e) {
        echo json_encode(['valid' => false]);
    }
}

/**
 * 修改密码
 */
function changePassword($pdo) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['error' => '请求方法错误']);
        return;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    $userId = $data['user_id'] ?? 0;
    $currentPassword = $data['current_password'] ?? '';
    $newPassword = $data['new_password'] ?? '';
    
    if (!$userId || empty($currentPassword) || strlen($newPassword) < 6) {
        echo json_encode(['error' => '参数错误']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE id = :id");
        $stmt->execute([':id' => $userId]);
        $user = $stmt->fetch();
        
        if (!$user) {
            echo json_encode(['error' => '用户不存在']);
            return;
        }
        
        // 验证当前密码
        $currentHash = hash('sha256', $currentPassword . $user['salt']);
        if ($currentHash !== $user['password_hash']) {
            echo json_encode(['error' => '当前密码错误']);
            return;
        }
        
        // 生成新盐值和哈希
        $newSalt = bin2hex(random_bytes(16));
        $newHash = hash('sha256', $newPassword . $newSalt);
        
        $stmt = $pdo->prepare("UPDATE users SET password_hash = :password_hash, salt = :salt WHERE id = :id");
        $stmt->execute([
            ':password_hash' => $newHash,
            ':salt' => $newSalt,
            ':id' => $userId
        ]);
        
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        echo json_encode(['error' => '修改密码失败']);
    }
}

/**
 * 设置密码提示问题
 */
function setSecurityQuestion($pdo) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['error' => '请求方法错误']);
        return;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    $userId = $data['user_id'] ?? 0;
    $question = trim($data['question'] ?? '');
    $answer = trim($data['answer'] ?? '');
    
    if (!$userId || empty($question) || empty($answer)) {
        echo json_encode(['error' => '参数错误']);
        return;
    }
    
    try {
        // 哈希答案
        $answerHash = hash('sha256', strtolower($answer));
        
        $stmt = $pdo->prepare("UPDATE users SET security_question = :question, security_answer_hash = :answer_hash WHERE id = :id");
        $stmt->execute([
            ':question' => $question,
            ':answer_hash' => $answerHash,
            ':id' => $userId
        ]);
        
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        echo json_encode(['error' => '设置提示问题失败']);
    }
}

/**
 * 获取密码提示问题
 */
function getSecurityQuestion($pdo) {
    $userId = $_GET['user_id'] ?? 0;
    
    if (!$userId) {
        echo json_encode(['error' => '参数错误']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("SELECT security_question FROM users WHERE id = :id AND security_question IS NOT NULL");
        $stmt->execute([':id' => $userId]);
        $user = $stmt->fetch();
        
        if ($user && $user['security_question']) {
            echo json_encode([
                'success' => true,
                'question' => $user['security_question']
            ]);
        } else {
            echo json_encode(['success' => false, 'question' => null]);
        }
    } catch (PDOException $e) {
        echo json_encode(['error' => '获取提示问题失败']);
    }
}

/**
 * 通过提示问题重置密码
 */
function resetPassword($pdo) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['error' => '请求方法错误']);
        return;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    $userId = $data['user_id'] ?? 0;
    $answer = trim($data['answer'] ?? '');
    $newPassword = $data['new_password'] ?? '';
    
    if (!$userId || empty($answer) || strlen($newPassword) < 6) {
        echo json_encode(['error' => '参数错误']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE id = :id AND security_question IS NOT NULL");
        $stmt->execute([':id' => $userId]);
        $user = $stmt->fetch();
        
        if (!$user) {
            echo json_encode(['error' => '用户未设置提示问题']);
            return;
        }
        
        // 验证答案
        $answerHash = hash('sha256', strtolower($answer));
        if ($answerHash !== $user['security_answer_hash']) {
            echo json_encode(['error' => '提示问题答案错误']);
            return;
        }
        
        // 生成新密码
        $newSalt = bin2hex(random_bytes(16));
        $newHash = hash('sha256', $newPassword . $newSalt);
        
        $stmt = $pdo->prepare("UPDATE users SET password_hash = :password_hash, salt = :salt WHERE id = :id");
        $stmt->execute([
            ':password_hash' => $newHash,
            ':salt' => $newSalt,
            ':id' => $userId
        ]);
        
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        echo json_encode(['error' => '重置密码失败']);
    }
}

/**
 * 通过用户名获取用户 ID
 */
function getUserIdByUsername($pdo) {
    $username = $_GET['username'] ?? '';
    
    if (empty($username)) {
        echo json_encode(['error' => '参数错误']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("SELECT id FROM users WHERE username = :username");
        $stmt->execute([':username' => $username]);
        $user = $stmt->fetch();
        
        if ($user) {
            echo json_encode(['user_id' => $user['id']]);
        } else {
            echo json_encode(['error' => '用户不存在']);
        }
    } catch (PDOException $e) {
        echo json_encode(['error' => '查询失败']);
    }
}

/**
 * 验证安全提示问题答案
 */
function verifySecurityAnswer($pdo) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['error' => '请求方法错误']);
        return;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    $userId = $data['user_id'] ?? 0;
    $answer = trim($data['answer'] ?? '');
    
    if (!$userId || empty($answer)) {
        echo json_encode(['error' => '参数错误']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("SELECT security_answer_hash FROM users WHERE id = :id AND security_answer_hash IS NOT NULL");
        $stmt->execute([':id' => $userId]);
        $user = $stmt->fetch();
        
        if (!$user) {
            echo json_encode(['error' => '用户未设置提示问题']);
            return;
        }
        
        // 验证答案（不区分大小写）
        $answerHash = hash('sha256', strtolower($answer));
        if ($answerHash === $user['security_answer_hash']) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['error' => '答案错误']);
        }
    } catch (PDOException $e) {
        echo json_encode(['error' => '验证失败']);
    }
}
