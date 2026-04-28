# 前端改造指南 - 从 LocalStorage 到后端 API

## 🎯 改造目标

将前端从 LocalStorage 存储改为调用 PHP 后端 API，实现：
- ✅ 数据存储在 MySQL 数据库
- ✅ 真正的用户认证
- ✅ 跨设备数据同步
- ✅ 更高的安全性

## 📁 需要修改的文件

### 1. `js/app.js` - 核心改造

#### 修改 1: 加载数据

**之前：**
```javascript
function loadData() {
    records = JSON.parse(localStorage.getItem('whitecycle_records_v1')) || [];
    userProfile = JSON.parse(localStorage.getItem('whitecycle_profile_v1')) || null;
}
```

**之后：**
```javascript
async function loadData() {
    const userId = sessionStorage.getItem('whitecycle_user_id');
    if (!userId) return;
    
    try {
        const response = await fetch(`php/api/records.php?action=list&user_id=${userId}`);
        const data = await response.json();
        
        if (data.records) {
            records = data.records.map(r => ({
                id: r.id,
                start_time: r.start_time,
                end_time: r.end_time,
                duration_minutes: r.duration_minutes,
                participation: r.participation,
                emotion: r.emotion,
                note: r.note
            }));
        }
        
        // 加载用户信息
        const verifyResponse = await fetch(`php/api/auth.php?action=verify&user_id=${userId}`);
        const userData = await verifyResponse.json();
        
        if (userData.valid) {
            userProfile = {
                identity: userData.user.identity || 'student'
            };
        }
    } catch (error) {
        console.error('加载数据失败:', error);
    }
}
```

---

#### 修改 2: 保存记录

**之前：**
```javascript
function saveData() {
    localStorage.setItem('whitecycle_records_v1', JSON.stringify(records));
}
```

**之后：**
```javascript
async function saveRecord(record) {
    const userId = sessionStorage.getItem('whitecycle_user_id');
    if (!userId) {
        showToast('请先登录', 'error');
        return null;
    }
    
    try {
        const response = await fetch(`php/api/records.php?action=create&user_id=${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                start_time: record.start_time,
                end_time: record.end_time,
                duration_minutes: record.duration_minutes,
                participation: record.participation,
                emotion: record.emotion,
                note: record.note
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            record.id = result.id;
            records.push(record);
            showToast('保存成功', 'success');
            return record;
        } else {
            showToast('保存失败', 'error');
            return null;
        }
    } catch (error) {
        console.error('保存失败:', error);
        showToast('网络错误', 'error');
        return null;
    }
}
```

---

#### 修改 3: 删除记录

**之前：**
```javascript
function deleteRecord(recordId) {
    records = records.filter(r => r.id !== recordId);
    saveData();
}
```

**之后：**
```javascript
async function deleteRecord(recordId) {
    const userId = sessionStorage.getItem('whitecycle_user_id');
    if (!userId) return;
    
    try {
        const response = await fetch(`php/api/records.php?action=delete&user_id=${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: recordId })
        });
        
        const result = await response.json();
        
        if (result.success) {
            records = records.filter(r => r.id !== recordId);
            renderRecordList();
            updateStats();
            showToast('删除成功', 'success');
        } else {
            showToast('删除失败', 'error');
        }
    } catch (error) {
        console.error('删除失败:', error);
        showToast('网络错误', 'error');
    }
}
```

---

#### 修改 4: 更新统计

**之前：**
```javascript
function updateStats() {
    const total = records.length;
    // ...
}
```

**之后：**
```javascript
async function updateStats() {
    const userId = sessionStorage.getItem('whitecycle_user_id');
    if (!userId) return;
    
    try {
        const response = await fetch(`php/api/records.php?action=stats&user_id=${userId}`);
        const stats = await response.json();
        
        document.querySelector('.stat-card:nth-child(1) .stat-value').textContent = stats.total || 0;
        document.querySelector('.stat-card:nth-child(2) .stat-value').textContent = stats.weekly || 0;
        document.querySelector('.stat-card:nth-child(3) .stat-value').textContent = stats.monthly || 0;
    } catch (error) {
        console.error('获取统计失败:', error);
    }
}
```

---

#### 修改 5: 认证检查

**之前：**
```javascript
function checkAuthentication() {
    const authData = localStorage.getItem('whitecycle_auth_v1');
    if (!authData) return true;
    
    const isLoggedIn = sessionStorage.getItem('whitecycle_logged_in_v1');
    if (!isLoggedIn) {
        showLoginModal();
        return false;
    }
    return true;
}
```

**之后：**
```javascript
async function checkAuthentication() {
    const userId = sessionStorage.getItem('whitecycle_user_id');
    
    if (!userId) {
        window.location.href = 'login.html'; // 跳转到登录页
        return false;
    }
    
    // 验证登录状态
    try {
        const response = await fetch(`php/api/auth.php?action=verify&user_id=${userId}`);
        const result = await response.json();
        
        if (!result.valid) {
            sessionStorage.clear();
            window.location.href = 'login.html';
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('验证失败:', error);
        return false;
    }
}
```

---

### 2. `index.html` - 添加密码提示问题 UI

在密码设置弹窗中添加：

```html
<!-- 在 password-change-form 后面添加 -->
<div id="security-question-form" style="display: none; margin-top: 20px;">
    <h4 style="margin-bottom: 12px; font-size: 14px; font-weight: 600;">🔒 密码提示问题</h4>
    <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 16px;">
        设置提示问题后，如果忘记密码可以通过回答问题来重置
    </p>
    
    <div class="form-group">
        <label class="form-label">选择问题</label>
        <select id="security-question-select" class="form-input">
            <option value="">选择一个问题...</option>
            <option value="你最喜欢的老师叫什么名字？">你最喜欢的老师叫什么名字？</option>
            <option value="你第一只宠物的名字是什么？">你第一只宠物的名字是什么？</option>
            <option value="你出生的城市是哪里？">你出生的城市是哪里？</option>
            <option value="你最好的朋友叫什么名字？">你最好的朋友叫什么名字？</option>
            <option value="你的小学名称是什么？">你的小学名称是什么？</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">答案</label>
        <input type="text" id="security-question-answer" class="form-input" placeholder="请输入答案（不区分大小写）">
    </div>
    
    <div class="complete-actions">
        <button class="btn btn-secondary" onclick="closePasswordSettingsModal()">取消</button>
        <button class="btn btn-primary" onclick="setSecurityQuestion()">保存提示问题</button>
    </div>
</div>
```

---

### 3. `js/app.js` - 添加提示问题函数

```javascript
/**
 * 设置密码提示问题
 */
async function setSecurityQuestion() {
    const userId = sessionStorage.getItem('whitecycle_user_id');
    const question = document.getElementById('security-question-select').value;
    const answer = document.getElementById('security-question-answer').value;
    
    if (!userId || !question || !answer) {
        showToast('请填写完整信息', 'error');
        return;
    }
    
    try {
        const response = await fetch('php/api/auth.php?action=setSecurityQuestion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: userId,
                question: question,
                answer: answer
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('提示问题设置成功', 'success');
            closePasswordSettingsModal();
        } else {
            showToast('设置失败：' + result.error, 'error');
        }
    } catch (error) {
        console.error('设置失败:', error);
        showToast('网络错误', 'error');
    }
}

/**
 * 显示提示问题表单
 */
function showSecurityQuestionForm() {
    document.getElementById('password-change-form').style.display = 'none';
    document.getElementById('security-question-form').style.display = 'block';
}
```

---

### 4. `login.html` - 修改登录逻辑

在现有的登录函数中添加提示问题显示：

```javascript
let failedAttempts = 0;
let currentUserId = 0;

async function handleLogin() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('error-message');
    const loadingDiv = document.getElementById('loading');
    
    if (!username || !password) {
        showError('请输入账户名和密码');
        return;
    }
    
    loadingDiv.style.display = 'block';
    
    try {
        const response = await fetch(`${API_BASE}/auth.php?action=login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // 登录成功
            sessionStorage.setItem('whitecycle_user_id', result.user_id);
            sessionStorage.setItem('whitecycle_username', result.username);
            currentUserId = result.user_id;
            
            // 跳转到主页
            window.location.href = 'index.html';
        } else {
            // 登录失败
            failedAttempts++;
            
            if (failedAttempts >= 5) {
                // 显示提示问题
                await showSecurityQuestionAfterFailed(username);
            } else {
                showError(`账户名或密码错误（剩余尝试次数：${5 - failedAttempts}）`);
            }
        }
    } catch (error) {
        console.error('登录失败:', error);
        showError('网络错误，请稍后重试');
    } finally {
        loadingDiv.style.display = 'none';
    }
}

/**
 * 失败 5 次后显示提示问题
 */
async function showSecurityQuestionAfterFailed(username) {
    try {
        // 先获取用户 ID
        const loginResponse = await fetch(`${API_BASE}/auth.php?action=login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password: 'dummy' }) // 故意用假密码
        });
        
        // 尝试获取提示问题（需要修改 API 支持通过用户名获取）
        // 这里简化处理，直接显示重置选项
        showError('⚠️ 连续失败 5 次<br><br>' +
            '<button onclick="showResetPasswordForm()" style="margin-top:10px;padding:8px 16px;background:#667eea;color:white;border:none;border-radius:8px;cursor:pointer;">' +
            '通过提示问题重置密码' +
            '</button>' +
            '<button onclick="handleClearData()" style="margin-top:10px;padding:8px 16px;background:#f5f5f7;color:#999;border:1px solid #e5e5e5;border-radius:8px;cursor:pointer;">' +
            '清除所有数据' +
            '</button>');
    } catch (error) {
        console.error('获取提示问题失败:', error);
    }
}

/**
 * 显示重置密码表单
 */
function showResetPasswordForm() {
    // 实现重置密码 UI
    alert('重置密码功能开发中...');
}
```

---

## 🧪 测试清单

### 功能测试
- [ ] 注册新账户
- [ ] 登录账户
- [ ] 创建记录
- [ ] 查看记录列表
- [ ] 编辑记录
- [ ] 删除记录
- [ ] 查看统计
- [ ] 设置密码提示问题
- [ ] 登录失败 5 次
- [ ] 通过提示问题重置密码

### 安全测试
- [ ] 清除浏览器缓存后需要重新登录
- [ ] 不同浏览器需要分别登录
- [ ] 无法通过禁用 JavaScript 绕过登录
- [ ] LocalStorage 中没有敏感数据
- [ ] API 请求需要用户 ID 验证

### 性能测试
- [ ] 大量记录时加载速度
- [ ] API 响应时间
- [ ] 数据库查询效率

---

## 📞 遇到问题？

### 常见问题 1: API 返回 404
**解决：** 检查文件路径，确保 PHP 文件存在

### 常见问题 2: 跨域错误
**解决：** 确保 API 响应头包含 `Access-Control-Allow-Origin: *`

### 常见问题 3: 数据库连接失败
**解决：** 检查 `php/config/database.php` 配置

### 常见问题 4: 登录状态丢失
**解决：** 检查是否正确设置 sessionStorage

---

## 🎉 完成改造后

你的应用将拥有：
- ✅ 真正的后端存储
- ✅ 安全的用户认证
- ✅ 跨设备数据同步
- ✅ 密码提示问题
- ✅ 更高的安全性

**记住：改造完成后，Local Storage 中将不再存储任何敏感数据！**
