# 白循 WhiteCycle - 安全审计报告

## 🔴 严重安全漏洞（已发现）

### 1. 数据存储安全问题

**问题描述：**
- ❌ **当前状态**：所有历史记录存储在浏览器 LocalStorage
- ❌ **风险**：任何能访问浏览器的人都可以查看和修改数据
- ❌ **跨浏览器问题**：不同浏览器有独立的 LocalStorage，导致数据不一致

**当前代码位置：**
```javascript
// js/app.js - 仍然使用 LocalStorage
localStorage.getItem('whitecycle_records_v1');
localStorage.setItem('whitecycle_records_v1', JSON.stringify(records));
```

**解决方案：**
✅ 已创建 PHP 后端 API (`php/api/records.php`)
✅ 已创建 MySQL 数据库表结构
⏳ **待完成**：改造前端调用后端 API

---

### 2. 认证绕过问题

**问题描述：**
- ❌ **当前状态**：认证检查只在前端，没有后端验证
- ❌ **风险**：用户可以禁用 JavaScript 或直接访问页面绕过登录
- ❌ **SessionStorage 问题**：关闭浏览器后自动清除，但无法防止未授权访问

**当前代码位置：**
```javascript
// js/app.js - 前端认证检查
function checkAuthentication() {
    const authData = localStorage.getItem('whitecycle_auth_v1');
    // 只是检查 LocalStorage，容易被绕过
}
```

**解决方案：**
✅ 已创建后端认证 API (`php/api/auth.php`)
✅ 登录状态验证 API (`action=verify`)
⏳ **待完成**：在 PHP 端验证每次 API 请求的登录状态

---

### 3. 密码安全改进

**已实现的安全特性：**
✅ SHA-256 哈希加密
✅ 随机盐值（16 字节）
✅ 不在网络上传输明文密码（需要 HTTPS 保护）

**新增功能：**
✅ 密码提示问题（Security Question）
✅ 5 次失败后显示提示
✅ 通过提示问题重置密码

**待改进：**
⏳ 添加密码强度验证
⏳ 添加登录失败速率限制
⏳ 添加双因素认证（可选）

---

## 📋 已实现的安全功能

### 1. 密码提示问题系统

**数据库更新：**
```sql
ALTER TABLE users 
ADD COLUMN security_question VARCHAR(100),
ADD COLUMN security_answer_hash VARCHAR(64);
```

**API 端点：**
- `POST /php/api/auth.php?action=setSecurityQuestion` - 设置提示问题
- `GET /php/api/auth.php?action=getSecurityQuestion&user_id=1` - 获取提示问题
- `POST /php/api/auth.php?action=resetPassword` - 重置密码

**使用流程：**
1. 用户在设置中设置密码提示问题和答案
2. 登录失败 5 次后，显示提示问题
3. 回答正确后可以重置密码
4. 答案使用 SHA-256 哈希存储

**示例问题：**
- "你最喜欢的老师叫什么名字？"
- "你第一只宠物的名字是什么？"
- "你出生的城市是哪里？"

---

### 2. 密码哈希加密

**加密流程：**
```php
// 1. 生成随机盐值（16 字节 = 32 位十六进制）
$salt = bin2hex(random_bytes(16));

// 2. 加盐哈希
$passwordHash = hash('sha256', $password . $salt);

// 3. 存储盐值和哈希值
// 不存储明文密码
```

**验证流程：**
```php
// 1. 从数据库获取盐值
$user = $stmt->fetch();

// 2. 使用相同盐值哈希输入的密码
$inputHash = hash('sha256', $inputPassword . $user['salt']);

// 3. 比较哈希值
if ($inputHash === $user['password_hash']) {
    // 密码正确
}
```

---

### 3. 防止 SQL 注入

**已采用预处理语句：**
```php
// ✅ 安全 - 使用预处理
$stmt = $pdo->prepare("SELECT * FROM users WHERE username = :username");
$stmt->execute([':username' => $username]);

// ❌ 危险 - 不要这样做
$sql = "SELECT * FROM users WHERE username = '$username'";
```

---

## 🔧 需要立即修复的问题

### 优先级 1：改造前端调用后端 API

**需要修改的文件：**
1. `js/app.js` - 将 LocalStorage 操作改为 API 调用
2. `index.html` - 添加登录验证逻辑

**修改示例：**

**之前（LocalStorage）：**
```javascript
// ❌ 不安全
const records = JSON.parse(localStorage.getItem('whitecycle_records_v1'));
```

**之后（API 调用）：**
```javascript
// ✅ 安全
const userId = sessionStorage.getItem('whitecycle_user_id');
const response = await fetch(`php/api/records.php?action=list&user_id=${userId}`);
const data = await response.json();
const records = data.records;
```

---

### 优先级 2：添加后端中间件验证

**创建 `php/middleware/auth.php`：**
```php
<?php
/**
 * 认证中间件
 * 验证用户登录状态
 */
function requireLogin() {
    session_start();
    
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => '未授权']);
        exit;
    }
    
    return $_SESSION['user_id'];
}
```

**在 API 中使用：**
```php
// php/api/records.php
require_once __DIR__ . '/../middleware/auth.php';
$userId = requireLogin(); // 验证登录

// 现在可以安全地使用 $userId
```

---

### 优先级 3：添加速率限制

**防止暴力破解：**
```php
// php/api/auth.php
function checkRateLimit($username) {
    $key = 'rate_limit_' . $username;
    $attempts = (int)redis()->get($key);
    
    if ($attempts >= 5) {
        return false; // 超过限制
    }
    
    redis()->incr($key);
    redis()->expire($key, 300); // 5 分钟后重置
    
    return true;
}
```

---

## 📊 内存和存储分析

### 当前存储方式

**LocalStorage（当前使用）：**
- **容量限制**：约 5-10MB（因浏览器而异）
- **持久性**：永久存储，除非清除
- **安全性**：低 - 可被任何 JavaScript 访问
- **同步**：不同步 - 每个浏览器独立

**SessionStorage（当前用于登录状态）：**
- **容量限制**：约 5-10MB
- **持久性**：会话级别 - 关闭浏览器清除
- **安全性**：中 - 仅当前标签页可访问
- **同步**：不同步

**MySQL 数据库（已实现，待使用）：**
- **容量限制**：取决于服务器配置
- **持久性**：永久存储
- **安全性**：高 - 服务器端存储
- **同步**：可跨设备同步

---

## 🛡️ 安全建议清单

### 立即实施（必须）
- [ ] 改造前端调用后端 API
- [ ] 添加后端认证中间件
- [ ] 启用 HTTPS（生产环境）
- [ ] 添加密码提示问题 UI

### 短期实施（建议）
- [ ] 添加密码强度验证
- [ ] 实现登录速率限制
- [ ] 添加会话超时
- [ ] 实现数据备份功能

### 长期实施（可选）
- [ ] 双因素认证
- [ ] 登录历史记录
- [ ] 异常登录检测
- [ ] 数据加密存储

---

## 📝 密码提示问题 UI 实现

### 设置界面（添加到 `index.html`）

```html
<div class="form-group">
    <label class="form-label">密码提示问题</label>
    <select id="security-question" class="form-input">
        <option value="">选择一个问题...</option>
        <option value="你最喜欢的老师叫什么名字？">你最喜欢的老师叫什么名字？</option>
        <option value="你第一只宠物的名字是什么？">你第一只宠物的名字是什么？</option>
        <option value="你出生的城市是哪里？">你出生的城市是哪里？</option>
        <option value="你最好的朋友叫什么名字？">你最好的朋友叫什么名字？</option>
    </select>
</div>

<div class="form-group">
    <label class="form-label">答案</label>
    <input type="text" id="security-answer" class="form-input" placeholder="请输入答案">
</div>
```

### 登录失败后显示（添加到 `login.html`）

```javascript
let failedAttempts = 0;

async function handleLogin() {
    const response = await fetch(...);
    const result = await response.json();
    
    if (!result.success) {
        failedAttempts++;
        
        if (failedAttempts >= 5) {
            // 显示提示问题
            const questionResponse = await fetch(
                `php/api/auth.php?action=getSecurityQuestion&user_id=${userId}`
            );
            const questionData = await questionResponse.json();
            
            if (questionData.success && questionData.question) {
                showSecurityQuestion(questionData.question);
            } else {
                showWarning('⚠️ 未设置密码提示问题，只能清除数据');
            }
        }
    }
}
```

---

## 🚀 下一步行动计划

### 第 1 步：更新数据库
```bash
mysql -u root -p
source php/database/init.sql
```

### 第 2 步：测试新的 API
```bash
# 设置提示问题
curl -X POST http://localhost/php/api/auth.php?action=setSecurityQuestion \
  -H "Content-Type: application/json" \
  -d '{"user_id":1,"question":"你最喜欢的老师叫什么名字？","answer":"张老师"}'
```

### 第 3 步：改造前端（最重要）
- 修改 `js/app.js` 使用 API 而不是 LocalStorage
- 修改 `index.html` 添加密码提示问题 UI
- 修改 `login.html` 添加提示问题显示逻辑

### 第 4 步：测试完整流程
1. 注册新账户
2. 设置密码提示问题
3. 故意输错 5 次密码
4. 使用提示问题重置密码
5. 验证数据同步

---

## 📞 需要帮助？

如果发现其他安全漏洞或有疑问，请：
1. 检查 PHP 错误日志
2. 查看浏览器开发者工具
3. 测试所有 API 端点
4. 进行渗透测试

**记住：安全是一个持续的过程，不是一次性的任务！**
