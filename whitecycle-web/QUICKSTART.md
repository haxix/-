# 白循 WhiteCycle - 5 分钟快速启动指南

## 🚀 快速开始（Windows + XAMPP）

### 步骤 1: 安装 XAMPP（如果没有）

1. 下载 XAMPP: https://www.apachefriends.org/
2. 安装到默认路径 `C:\xampp`
3. 启动 Apache 和 MySQL

### 步骤 2: 创建数据库

1. 打开浏览器访问：`http://localhost/phpmyadmin`
2. 点击"SQL"标签
3. 复制粘贴 `php/database/init.sql` 的内容
4. 点击"执行"

### 步骤 3: 配置数据库

编辑 `php/config/database.php`：

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'whitecycle');
define('DB_USER', 'root');
define('DB_PASS', '');  // XAMPP 默认密码为空
```

### 步骤 4: 放置项目文件

将 `whitecycle-web` 文件夹复制到 `C:\xampp\htdocs\`

最终路径：`C:\xampp\htdocs\whitecycle-web\`

### 步骤 5: 访问应用

打开浏览器访问：
- **登录页面**: `http://localhost/whitecycle-web/login.html`
- **主应用**: `http://localhost/whitecycle-web/index.html`（需要改造后才能用）

### 步骤 6: 注册第一个账户

在登录页面：
1. 输入账户名：`admin`
2. 输入密码：`123456`
3. 点击"登录"

系统会自动创建账户并登录！

## 🎯 完成！

现在你可以：
- ✅ 看到精美的全屏登录界面
- ✅ 注册和登录账户
- ✅ 数据会永久保存在 MySQL 数据库中
- ✅ 清除浏览器缓存不会丢失数据

## ⚡ 下一步

前端的 `index.html` 还需要改造才能调用后端 API。目前你可以：
1. 使用登录页面注册账户
2. 查看数据库确认数据已保存
3. 等待后续的前端改造更新

## 🔍 验证安装

### 检查数据库

```sql
-- 在 phpMyAdmin 中执行
USE whitecycle;
SELECT * FROM users;
```

应该能看到你刚注册的账户。

### 测试 API

使用浏览器访问：
```
http://localhost/whitecycle-web/php/api/auth.php?action=verify&user_id=1
```

应该返回 JSON 数据。

## 💡 提示

- **密码提示**在登录页面底部
- **清除数据**按钮在登录页面下方
- **失败 5 次**会显示警告提示
- 所有数据都存储在 MySQL，非常安全！

## 📞 遇到问题？

1. **Apache 无法启动**: 检查端口 80 是否被占用
2. **MySQL 无法启动**: 检查端口 3306 是否被占用
3. **404 错误**: 检查文件路径是否正确
4. **数据库连接失败**: 检查 `database.php` 配置

祝你使用愉快！🎉
