<?php
/**
 * 认证中间件
 * 用于验证用户登录状态，保护 API 端点
 */

/**
 * 验证用户是否已登录
 * 
 * @return int 返回用户 ID
 * @throws Exception 如果未登录
 */
function requireLogin() {
    session_start();
    
    // 检查会话中是否有用户 ID
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode([
            'error' => '未授权',
            'message' => '请先登录'
        ]);
        exit;
    }
    
    // 可选：验证会话是否过期（30 分钟）
    $timeout = 1800; // 30 分钟
    if (isset($_SESSION['login_time']) && (time() - $_SESSION['login_time'] > $timeout)) {
        // 会话过期
        session_destroy();
        http_response_code(401);
        echo json_encode([
            'error' => '会话过期',
            'message' => '请重新登录'
        ]);
        exit;
    }
    
    // 更新会话时间
    $_SESSION['login_time'] = time();
    
    return $_SESSION['user_id'];
}

/**
 * 验证用户 ID 是否匹配
 * 
 * @param int $userId 要验证的用户 ID
 * @return bool 返回是否匹配
 */
function verifyUserId($userId) {
    session_start();
    
    if (!isset($_SESSION['user_id'])) {
        return false;
    }
    
    return $_SESSION['user_id'] == $userId;
}

/**
 * 设置用户登录会话
 * 
 * @param int $userId 用户 ID
 * @param string $username 用户名
 */
function setLoginSession($userId, $username) {
    session_start();
    $_SESSION['user_id'] = $userId;
    $_SESSION['username'] = $username;
    $_SESSION['login_time'] = time();
}

/**
 * 清除登录会话（登出）
 */
function clearLoginSession() {
    session_start();
    session_destroy();
}

/**
 * 获取当前登录用户信息
 * 
 * @return array|null 返回用户信息或 null
 */
function getCurrentUser() {
    session_start();
    
    if (!isset($_SESSION['user_id'])) {
        return null;
    }
    
    return [
        'user_id' => $_SESSION['user_id'],
        'username' => $_SESSION['username'],
        'login_time' => $_SESSION['login_time']
    ];
}
