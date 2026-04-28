# 密码提示问题功能完成报告

## ✅ 已完成的工作

### 1. 数据库升级

**添加字段：**
```sql
ALTER TABLE users 
ADD COLUMN security_question VARCHAR(100),
ADD COLUMN security_answer_hash VARCHAR(64);
```

**字段说明：**
- `security_question`: 存储用户选择的问题文本
- `security_answer_hash`: 存储答案的 SHA-256 哈希值（不区分大小写）

---

### 2. 后端 API 实现

**文件：** `php/api/auth.php`

**新增端点：**

#### 2.1 设置提示问题
```php
POST /php/api/auth.php?action=setSecurityQuestion

请求体：
{
    "user_id": 1,
    "question": "你最喜欢的老师叫什么名字？",
    "answer": "张老师"
}

响应：
{
    "success": true
}
```

**实现逻辑：**
1. 接收用户 ID、问题、答案
2. 将答案转换为小写后进行 SHA-256 哈希
3. 存储问题和哈希值到数据库

#### 2.2 获取提示问题
```php
GET /php/api/auth.php?action=getSecurityQuestion&user_id=1

响应：
{
    "success": true,
    "question": "你最喜欢的老师叫什么名字？"
}
```

**实现逻辑：**
1. 根据用户 ID 查询问题
2. 只返回问题文本，不返回答案
3. 如果未设置，返回 success: false

#### 2.3 重置密码（通过提示问题）
```php
POST /php/api/auth.php?action=resetPassword

请求体：
{
    "user_id": 1,
    "answer": "张老师",
    "new_password": "newpassword123"
}

响应：
{
    "success": true
}
```

**实现逻辑：**
1. 验证答案（转换为小写后哈希）
2. 如果答案正确，生成新密码哈希
3. 更新密码和盐值

---

### 3. 前端 UI 实现

**文件：** `index.html`

#### 3.1 密码设置弹窗增强

**新增按钮：**
```html
<button class="btn btn-secondary" onclick="app.showSecurityQuestionForm()">
    🔒 设置提示问题
</button>
```

**新增表单：**
```html
<div id="security-question-form" style="display: none;">
    <!-- 提示说明框 -->
    <div class="info-box">
        💡 提示问题说明
        • 设置提示问题后，忘记密码时可以通过回答问题来重置
        • 答案不区分大小写，但请确保容易记住
        • 建议选择一个只有你知道答案的问题
    </div>
    
    <!-- 问题选择 -->
    <select id="security-question-select">
        <option>你最喜欢的老师叫什么名字？</option>
        <option>你第一只宠物的名字是什么？</option>
        <option>你出生的城市是哪里？</option>
        <option>你最好的朋友叫什么名字？</option>
        <option>你的小学名称是什么？</option>
        <option>你母亲的生日是哪一天？</option>
    </select>
    
    <!-- 答案输入 -->
    <input type="text" id="security-question-answer" placeholder="请输入答案">
    
    <!-- 操作按钮 -->
    <button onclick="app.setSecurityQuestion()">保存提示问题</button>
</div>
```

**设计特点：**
- ✅ 清晰的说明提示框
- ✅ 6 个预设问题可选
- ✅ 答案输入框
- ✅ 优雅的 UI 设计（渐变背景、圆角边框）

---

### 4. 前端逻辑实现

**文件：** `js/app.js`

#### 4.1 显示提示问题表单
```javascript
function showSecurityQuestionForm() {
    // 清空输入
    document.getElementById('security-question-select').value = '';
    document.getElementById('security-question-answer').value = '';
    
    // 切换显示
    document.getElementById('password-enabled').style.display = 'none';
    document.getElementById('security-question-form').style.display = 'block';
}
```

#### 4.2 设置提示问题
```javascript
async function setSecurityQuestion() {
    const userId = sessionStorage.getItem('whitecycle_user_id');
    const question = document.getElementById('security-question-select').value;
    const answer = document.getElementById('security-question-answer').value;
    
    // 验证
    if (!userId || !question || !answer) {
        showToast('请选择问题并填写答案', 'error');
        return;
    }
    
    if (answer.length < 3) {
        showToast('答案至少 3 个字符', 'error');
        return;
    }
    
    // 调用 API
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
        showPasswordEnabledView();
    } else {
        showToast('设置失败：' + result.error, 'error');
    }
}
```

**功能特点：**
- ✅ 完整的输入验证
- ✅ 异步 API 调用
- ✅ 友好的错误提示
- ✅ 成功后自动返回

#### 4.3 视图切换优化
```javascript
function showPasswordEnabledView() {
    // 隐藏所有表单
    document.getElementById('password-not-enabled').style.display = 'none';
    document.getElementById('password-change-form').style.display = 'none';
    document.getElementById('security-question-form').style.display = 'none';
    
    // 显示已启用视图
    document.getElementById('password-enabled').style.display = 'block';
}
```

---

## 📊 功能流程

### 设置提示问题流程

```
用户点击设置 → 选择问题 → 输入答案 → 验证输入
                                      ↓
                    ← 显示成功提示 ← API 保存
                                      ↓
                          返回密码管理主界面
```

### 使用提示问题重置密码流程（待实现）

```
登录失败 5 次 → 显示提示问题 → 输入答案 → 验证答案
                                          ↓
                        ← 允许重置密码 ← 答案正确
                                          ↓
                                    输入新密码
                                          ↓
                                    密码已重置
```

---

## 🔐 安全特性

### 1. 答案加密存储
- ✅ **不存储明文答案**
- ✅ 使用 SHA-256 哈希
- ✅ 答案转换为小写后哈希（不区分大小写）

**示例：**
```
用户输入："张老师" → 小写："张老师" → SHA-256: "abc123..."
验证输入："张老师" → 小写："张老师" → SHA-256: "abc123..." ✓
验证输入："张老师" → 小写："张老师" → SHA-256: "abc123..." ✓
```

### 2. 问题明文存储
- ✅ 问题文本以明文存储
- ✅ 方便显示给用户
- ✅ 不包含敏感信息

### 3. 验证机制
- ✅ 答案不区分大小写
- ✅ 允许前后有空格（trim 处理）
- ✅ 严格的长度验证（至少 3 字符）

---

## 📝 预设问题列表

提供 6 个精心设计的预设问题：

1. **你最喜欢的老师叫什么名字？**
   - 特点：容易记住，答案稳定
   
2. **你第一只宠物的名字是什么？**
   - 特点：情感联系深，不易忘记
   
3. **你出生的城市是哪里？**
   - 特点：客观事实，不会改变
   
4. **你最好的朋友叫什么名字？**
   - 特点：亲密关系，印象深刻
   
5. **你的小学名称是什么？**
   - 特点：具体名称，容易回忆
   
6. **你母亲的生日是哪一天？**
   - 特点：重要日期，不会忘记

**设计原则：**
- ✅ 答案稳定（不会随时间改变）
- ✅ 容易回忆（不会忘记）
- ✅ 具体明确（不会歧义）
- ✅ 私密安全（外人不知道）

---

## 🎯 用户体验设计

### 1. 提示说明框

**设计：**
```
┌─────────────────────────────────────┐
│ 💡 提示问题说明                      │
│ • 设置提示问题后，忘记密码时可以...  │
│ • 答案不区分大小写，但请确保...      │
│ • 建议选择一个只有你知道...          │
└─────────────────────────────────────┘
```

**目的：**
- 清楚说明功能用途
- 提醒用户注意事项
- 给出最佳实践建议

### 2. 表单设计

**布局：**
```
选择问题：[下拉选择框 ▼]

答案：    [文本输入框____]

         [取消] [保存提示问题]
```

**特点：**
- 清晰的标签
- 直观的输入
- 明确的操作按钮

### 3. 反馈设计

**成功：**
```
✓ 提示问题设置成功
```

**失败：**
```
✗ 设置失败：网络错误
```

**验证错误：**
```
✗ 请选择问题并填写答案
✗ 答案至少 3 个字符
```

---

## 🔄 与其他功能的集成

### 1. 密码管理界面

**三个主要视图：**

1. **未启用视图** (`password-not-enabled`)
   - 显示安全提示
   - 输入账户名和密码
   - 启用密码保护

2. **已启用视图** (`password-enabled`)
   - 显示账户名
   - 按钮：关闭密码保护
   - 按钮：修改密码
   - 按钮：设置提示问题 ← 新增

3. **修改密码表单** (`password-change-form`)
   - 输入当前密码
   - 输入新密码
   - 确认新密码

4. **提示问题表单** (`security-question-form`) ← 新增
   - 显示说明
   - 选择问题
   - 输入答案

### 2. 登录流程（待实现）

**当前流程：**
```
输入账户名和密码 → 验证 → 成功/失败
```

**未来流程（登录失败 5 次后）：**
```
输入账户名和密码 → 验证失败 × 5
                      ↓
              显示提示问题
                      ↓
              输入答案 → 验证
                      ↓
              允许重置密码
```

---

## 📋 测试清单

### 功能测试
- [x] 显示提示问题表单
- [x] 选择问题
- [x] 输入答案
- [x] 验证输入（空值检查）
- [x] 验证输入（长度检查）
- [x] API 调用设置问题
- [x] 成功提示
- [x] 错误处理
- [x] 视图切换

### 安全测试
- [x] 答案加密存储（SHA-256）
- [x] 答案不区分大小写
- [x] 最小长度验证
- [ ] 防止 SQL 注入
- [ ] 防止 XSS 攻击

### UI/UX 测试
- [x] 表单布局美观
- [x] 提示信息清晰
- [x] 按钮位置合理
- [x] 错误提示友好
- [x] 响应式设计

---

## 🚀 下一步计划

### 高优先级（待完成）

#### 1. 登录页面提示问题功能

**需要修改：** `login.html`

**实现功能：**
- 登录失败 5 次后显示提示问题
- 提供"通过提示问题重置密码"选项
- 实现重置密码界面

**详细代码：** 查看 `FRONTEND_MIGRATION.md`

#### 2. 获取提示问题 API

**当前状态：** API 已实现但未在前端使用

**使用场景：**
- 登录失败时获取提示问题
- 显示在登录页面

**调用示例：**
```javascript
const response = await fetch(
    `php/api/auth.php?action=getSecurityQuestion&user_id=${userId}`
);
const data = await response.json();
if (data.success) {
    showQuestion(data.question);
}
```

---

### 中优先级

#### 3. 后端认证中间件

**创建文件：** `php/middleware/auth.php`

**功能：**
- 验证用户登录状态
- 保护 API 端点
- 防止未授权访问

**实现代码：**
```php
<?php
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

#### 4. 完善错误处理

**改进方向：**
- 更详细的错误信息
- 更好的用户体验
- 日志记录功能

---

## 📊 完成度统计

### 密码提示问题系统

| 模块 | 完成度 | 状态 |
|------|--------|------|
| 数据库字段 | 100% | ✅ |
| 后端 API | 100% | ✅ |
| 前端 UI | 100% | ✅ |
| 前端逻辑 | 100% | ✅ |
| 登录页面集成 | 0% | ⏳ |
| 重置密码流程 | 0% | ⏳ |

**总体完成度：** 66% (4/6)

### 整体密码保护系统

| 功能 | 完成度 | 状态 |
|------|--------|------|
| 用户注册/登录 | 100% | ✅ |
| 密码哈希存储 | 100% | ✅ |
| 密码修改 | 100% | ✅ |
| 提示问题设置 | 100% | ✅ |
| 提示问题显示 | 0% | ⏳ |
| 密码重置 | 0% | ⏳ |

**总体完成度：** 66% (4/6)

---

## 🎯 快速使用指南

### 如何设置提示问题

1. **打开设置**
   - 点击导航栏的设置图标
   - 找到"密码保护"选项

2. **启用密码保护**（如果未启用）
   - 输入账户名
   - 输入密码（至少 6 位）
   - 确认密码
   - 点击"启用密码保护"

3. **设置提示问题**
   - 点击"🔒 设置提示问题"按钮
   - 从下拉列表选择一个问题
   - 输入答案（至少 3 个字符）
   - 点击"保存提示问题"

4. **完成**
   - 看到成功提示
   - 自动返回密码管理界面
   - 提示问题已保存

### 如何使用（未来功能）

**场景：忘记密码**

1. 登录时连续输错 5 次密码
2. 系统显示你的提示问题
3. 输入答案
4. 答案正确，允许重置密码
5. 输入新密码
6. 密码已重置，可以登录

---

## 📞 故障排除

### 问题 1: 设置失败

**错误信息：** "设置失败：网络错误"

**解决方法：**
1. 检查 PHP API 是否可访问
2. 查看浏览器控制台错误
3. 验证数据库连接

### 问题 2: 找不到提示问题表单

**现象：** 点击"设置提示问题"没反应

**解决方法：**
1. 确保已启用密码保护
2. 检查 JavaScript 控制台错误
3. 清除浏览器缓存

### 问题 3: 答案验证失败

**错误信息：** "答案至少 3 个字符"

**解决方法：**
1. 确保答案长度 >= 3 字符
2. 避免使用特殊字符
3. 不要使用空格作为答案

---

## 🎉 总结

### 已实现功能
- ✅ 数据库支持（字段、表结构）
- ✅ 后端 API（设置、获取、重置）
- ✅ 前端 UI（表单、提示、按钮）
- ✅ 前端逻辑（验证、调用、反馈）

### 特色亮点
- 🔐 **安全加密**：SHA-256 哈希存储
- 🎨 **精美 UI**：渐变背景、圆角设计
- 💡 **清晰提示**：详细说明、友好反馈
- 🔄 **流畅体验**：异步操作、即时反馈

### 下一步
1. 在 login.html 中添加提示问题显示
2. 实现登录失败后的重置流程
3. 完善错误处理和日志记录
4. 全面测试功能流程

**密码提示问题功能已完成 66%！** 🎊

继续完成剩余功能，打造完整的安全密码保护系统！🚀
