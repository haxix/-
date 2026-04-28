# 白循 WhiteCycle - PHP 后端部署说明

## 📋 系统要求

- **PHP**: 7.4 或更高版本
- **MySQL**: 5.7 或更高版本（或 MariaDB 10.3+）
- **Web 服务器**: Apache / Nginx
- **浏览器**: 支持现代 Web 标准的浏览器

## 🚀 安装步骤

### 1. 数据库配置

#### 1.1 创建数据库

```bash
# 登录 MySQL
mysql -u root -p

# 执行初始化脚本
source php/database/init.sql
```

或者手动执行 SQL：

```sql
CREATE DATABASE whitecycle DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE whitecycle;

-- 然后执行 php/database/init.sql 中的 CREATE TABLE 语句
```

#### 1.2 修改数据库配置

编辑 `php/config/database.php`：

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'whitecycle');  // 数据库名
define('DB_USER', 'root');         // 数据库用户名
define('DB_PASS', 'your_password'); // 数据库密码
```

### 2. Web 服务器配置

#### Apache

确保启用 `mod_rewrite`，然后创建 `.htaccess` 文件：

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [QSA,L]
```

#### Nginx

配置示例：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/whitecycle-web;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
    }
}
```

### 3. 测试 API

访问以下 URL 测试 API 是否正常工作：

```
http://your-domain.com/php/api/auth.php?action=register
```

应该返回 JSON 错误（因为需要 POST 数据），而不是 404。

### 4. 注册第一个用户

使用 Postman 或 curl 注册第一个用户：

```bash
curl -X POST http://localhost/php/api/auth.php?action=register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'
```

成功响应：
```json
{
  "success": true,
  "user_id": 1,
  "username": "admin"
}
```

### 5. 访问应用

- **登录页面**: `http://localhost/login.html`
- **主应用**: `http://localhost/index.html`

## 📁 文件结构

```
whitecycle-web/
├── php/
│   ├── config/
│   │   └── database.php          # 数据库配置
│   ├── api/
│   │   ├── auth.php              # 认证 API
│   │   └── records.php           # 记录管理 API
│   └── database/
│       └── init.sql              # 数据库初始化脚本
├── login.html                     # 登录页面（全屏）
├── index.html                     # 主应用
├── css/
├── js/
└── docs/
```

## 🔐 安全建议

1. **生产环境配置**
   - 修改数据库默认密码
   - 启用 HTTPS
   - 设置适当的文件权限

2. **API 安全**
   - 添加 CORS 限制（如果前后端分离）
   - 实现速率限制
   - 使用预处理语句防止 SQL 注入

3. **密码安全**
   - 密码使用 SHA-256 + 随机盐值加密
   - 不在网络上传输明文密码（考虑使用 HTTPS）

## 🐛 常见问题

### Q: 数据库连接失败
**A**: 检查 `php/config/database.php` 配置是否正确，MySQL 服务是否运行。

### Q: API 返回 404
**A**: 检查文件路径是否正确，Web 服务器是否正确配置 PHP。

### Q: 跨域错误
**A**: 确保 API 响应头包含 `Access-Control-Allow-Origin: *`。

### Q: 中文乱码
**A**: 确保数据库字符集为 `utf8mb4`，HTML 文件包含 `<meta charset="UTF-8">`。

## 📝 下一步

1. 完成前端代码改造，调用后端 API
2. 添加数据同步功能
3. 实现离线缓存
4. 添加更多安全特性

## 📞 技术支持

如有问题，请查看：
- MySQL 错误日志
- PHP 错误日志
- 浏览器开发者工具控制台
