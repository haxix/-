# 快速部署和测试指南

## 🚀 5 分钟部署

### 步骤 1: 准备环境

确保已安装：
- ✅ PHP 7.4+
- ✅ MySQL 5.7+
- ✅ Apache/Nginx（或使用 XAMPP）

### 步骤 2: 初始化数据库

```bash
# 登录 MySQL
mysql -u root -p

# 创建数据库并导入表结构
source e:\Trae\白循\whitecycle-web\php\database\init.sql
```

或使用 phpMyAdmin：
1. 访问 `http://localhost/phpmyadmin`
2. 点击"SQL"标签
3. 复制 `php/database/init.sql` 内容
4. 点击"执行"

### 步骤 3: 配置数据库连接

编辑 `php/config/database.php`：

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'whitecycle');
define('DB_USER', 'root');      // 你的数据库用户名
define('DB_PASS', 'password');  // 你的数据库密码
```

### 步骤 4: 启动服务

**使用 XAMPP：**
1. 启动 Apache
2. 启动 MySQL
3. 确保两个服务都是绿色状态

**使用命令行：**
```bash
# Apache
sudo systemctl start apache2

# MySQL
sudo systemctl start mysql
```

### 步骤 5: 访问应用

1. **登录页面**: `http://localhost/whitecycle-web/login.html`
2. **主应用**: `http://localhost/whitecycle-web/index.html`

---

## 🧪 测试流程

### 1. 注册账户

访问 `http://localhost/whitecycle-web/login.html`

**测试数据：**
- 账户名：`testuser`
- 密码：`123456`

**预期结果：**
- ✅ 注册成功
- ✅ 自动跳转到 index.html
- ✅ 显示欢迎信息

### 2. 创建记录

在 index.html 中：
1. 选择参与方式（独处时光/二人世界/导师指导）
2. 点击"开始记录"
3. 等待几秒后点击"结束记录"
4. 确认时间
5. 选择情绪（可选）

**预期结果：**
- ✅ 记录成功保存
- ✅ 显示"保存成功"提示
- ✅ 记录列表中出现新记录
- ✅ 统计数据更新

### 3. 查看记录

在首页查看记录列表

**预期结果：**
- ✅ 记录按时间排序
- ✅ 显示正确的时长、参与方式、情绪
- ✅ 可以点击查看详情

### 4. 删除记录

1. 点击记录查看详情
2. 点击"删除"按钮
3. 确认删除

**预期结果：**
- ✅ 显示确认对话框
- ✅ 删除成功
- ✅ 记录从列表消失
- ✅ 统计数据更新

### 5. 测试登录状态

1. 关闭浏览器
2. 重新打开 `http://localhost/whitecycle-web/index.html`

**预期结果：**
- ✅ 需要重新登录（SessionStorage 已清除）
- ✅ 数据仍然存在（从 MySQL 加载）

### 6. 测试跨浏览器

1. 在 Chrome 登录
2. 打开 Firefox 访问同一地址

**预期结果：**
- ✅ Firefox 需要重新登录
- ✅ 登录后可以看到相同数据

### 7. 测试登出

点击设置 → 退出登录

**预期结果：**
- ✅ 清除所有存储
- ✅ 跳转到登录页面
- ✅ 无法直接访问 index.html

---

## 🔍 验证数据

### 检查数据库

```sql
-- 查看用户
USE whitecycle;
SELECT * FROM users;

-- 查看记录
SELECT * FROM records WHERE user_id = 1;

-- 查看统计
SELECT 
    COUNT(*) as total,
    SUM(duration_minutes) as total_minutes
FROM records 
WHERE user_id = 1;
```

### 检查 LocalStorage

打开浏览器开发者工具 → Application → Local Storage

**应该看到：**
- ✅ `whitecycle_show_stats` - 设置（可以存在）
- ✅ `whitecycle_couple_reminder` - 设置（可以存在）
- ❌ **不应该有** `whitecycle_records_v6` 等敏感数据

### 检查 SessionStorage

**登录后应该看到：**
- ✅ `whitecycle_user_id` - 用户 ID
- ✅ 其他非敏感信息

**登出后应该：**
- ✅ 全部清除

---

## 🐛 常见问题解决

### 问题 1: 404 错误

**错误：** `Cannot GET /php/api/records.php`

**解决：**
1. 检查文件路径是否正确
2. 确保 Apache 已启动
3. 检查 `.htaccess` 配置

### 问题 2: 数据库连接失败

**错误：** `SQLSTATE[HY000] [1045] Access denied`

**解决：**
1. 检查 `php/config/database.php` 配置
2. 确认 MySQL 服务已启动
3. 验证用户名密码正确

### 问题 3: CORS 错误

**错误：** `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**解决：**
1. 确保 PHP API 响应头包含：
   ```php
   header('Access-Control-Allow-Origin: *');
   ```
2. 使用同一域名（避免跨域）

### 问题 4: 登录无限循环

**现象：** 登录后又回到登录页

**解决：**
1. 检查 sessionStorage 是否正确设置
2. 清除缓存后重试
3. 检查 API 验证逻辑

### 问题 5: 数据加载失败

**错误：** 控制台显示 `Failed to fetch`

**解决：**
1. 检查 PHP API 是否可访问
2. 查看 PHP 错误日志
3. 验证数据库连接

---

## 📊 性能测试

### 加载时间测试

```javascript
// 在浏览器控制台运行
console.time('loadData');
fetch('php/api/records.php?action=list&user_id=1')
  .then(r => r.json())
  .then(d => {
      console.timeEnd('loadData');
      console.log('记录数:', d.records.length);
  });
```

**预期结果：**
- ✅ < 100ms: 优秀
- ✅ < 500ms: 良好
- ⚠️ > 1000ms: 需要优化

### 数据库查询优化

```sql
-- 添加索引
ALTER TABLE records ADD INDEX idx_user_start (user_id, start_time);
ALTER TABLE records ADD INDEX idx_user_participation (user_id, participation);
```

---

## 🔐 安全测试

### 1. SQL 注入测试

尝试在登录表单输入：
```
' OR '1'='1
```

**预期结果：**
- ✅ 登录失败
- ✅ 无 SQL 错误信息

### 2. XSS 测试

尝试在记录备注中输入：
```html
<script>alert('XSS')</script>
```

**预期结果：**
- ✅ 脚本不执行
- ✅ 正常保存为文本

### 3. 未授权访问测试

1. 不登录直接访问 `index.html`
2. 在浏览器控制台尝试调用 API

**预期结果：**
- ✅ 跳转到登录页
- ✅ API 返回错误

---

## 📝 测试报告模板

### 功能测试

| 测试项 | 预期结果 | 实际结果 | 状态 |
|--------|---------|---------|------|
| 注册 | 成功创建账户 | | ⬜ |
| 登录 | 成功进入系统 | | ⬜ |
| 创建记录 | 保存到数据库 | | ⬜ |
| 查看记录 | 正确显示 | | ⬜ |
| 删除记录 | 从数据库删除 | | ⬜ |
| 统计 | 数据准确 | | ⬜ |
| 登出 | 清除会话 | | ⬜ |

### 安全测试

| 测试项 | 预期结果 | 实际结果 | 状态 |
|--------|---------|---------|------|
| SQL 注入 | 被阻止 | | ⬜ |
| XSS 攻击 | 被阻止 | | ⬜ |
| 未授权访问 | 被阻止 | | ⬜ |
| 数据加密 | SHA-256 | | ⬜ |

### 性能测试

| 指标 | 目标 | 实际 | 状态 |
|------|------|------|------|
| 加载时间 | <100ms | | ⬜ |
| API 响应 | <200ms | | ⬜ |
| 数据库查询 | <50ms | | ⬜ |

---

## 🎯 下一步

完成测试后：

1. ✅ 部署到生产环境
2. ✅ 配置 HTTPS
3. ✅ 设置数据库备份
4. ✅ 监控系统运行

**祝你部署成功！** 🚀
