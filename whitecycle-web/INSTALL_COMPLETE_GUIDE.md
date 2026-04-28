# 白循 WhiteCycle - 完整后端安装指南

## 🎯 目标
安装 PHP + MySQL 后端，实现完整的数据存储功能

---

## 📦 方案一：XAMPP（推荐）⭐⭐⭐⭐⭐

### 优点
- ✅ 一键安装 Apache + MySQL + PHP
- ✅ 图形化管理界面
- ✅ 无需复杂配置
- ✅ 适合 Windows 用户

### 安装步骤

#### 1. 下载 XAMPP

**官方下载:**
```
https://www.apachefriends.org/download.html
```

**国内镜像:**
```
https://www.xampp.com.cn/
```

**选择版本:**
- Windows 8.1 / 10 / 11 (64-bit)
- PHP 8.2+ 版本
- 文件大小：约 150MB

#### 2. 安装 XAMPP

1. **运行安装程序**
   - 双击下载的 `.exe` 文件
   - 如果提示 UAC，点击"是"

2. **选择安装路径**
   ```
   推荐：C:\xampp
   不要安装在：C:\Program Files (会有权限问题)
   ```

3. **选择组件**
   - ☑️ Apache (必需)
   - ☑️ MySQL (必需)
   - ☑️ PHP (必需)
   - ☑️ phpMyAdmin (推荐)
   - ☐ 其他可选

4. **完成安装**
   - 点击"完成"
   - 不要立即启动控制面板

#### 3. 启动服务

1. **打开 XAMPP Control Panel**
   - 桌面快捷方式
   - 或运行 `C:\xampp\xampp-control.exe`

2. **启动 Apache**
   - 点击 Apache 行的"Start"按钮
   - 等待显示绿色背景

3. **启动 MySQL**
   - 点击 MySQL 行的"Start"按钮
   - 等待显示绿色背景

4. **验证服务**
   ```
   Apache:  访问 http://localhost/
   MySQL:   应该看到欢迎页面
   ```

#### 4. 配置数据库

##### 方法 A: 使用自动脚本（推荐）

1. **打开 PowerShell**
   - 在项目目录右键 → "在终端中打开"
   - 或按 `Win + X` → Windows PowerShell

2. **运行安装脚本**
   ```powershell
   cd "e:\Trae\白循\whitecycle-web"
   .\install.ps1
   ```

3. **按照提示操作**
   - 选择自动创建数据库
   - 等待完成

##### 方法 B: 手动配置

1. **打开 phpMyAdmin**
   ```
   http://localhost/phpmyadmin
   ```

2. **创建数据库**
   - 点击左侧"新建"
   - 数据库名：`whitecycle`
   - 排序规则：`utf8mb4_unicode_ci`
   - 点击"创建"

3. **执行 SQL 脚本**
   - 点击顶部"SQL"标签
   - 打开文件 `setup_database.sql`
   - 复制所有内容
   - 粘贴到文本框
   - 点击"执行"

4. **验证**
   - 应该看到 4 个表：
     - users
     - records
     - achievements
     - weekly_goals

#### 5. 配置数据库连接

1. **打开配置文件**
   ```
   文件位置：php/config/database.php
   ```

2. **修改配置**
   ```php
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'whitecycle');
   define('DB_USER', 'root');
   define('DB_PASS', '');  // XAMPP 默认密码为空
   ```

3. **保存文件**

#### 6. 测试后端

1. **测试 API**
   ```
   访问：http://localhost/php/api/auth.php?action=register
   应该返回：{"error":"请求方法错误"}
   ```

2. **注册测试用户**
   打开浏览器控制台（F12），执行：
   ```javascript
   fetch('http://localhost/php/api/auth.php?action=register', {
       method: 'POST',
       headers: {'Content-Type': 'application/json'},
       body: JSON.stringify({
           username: 'testuser',
           password: '123456'
       })
   }).then(r => r.json()).then(console.log)
   ```

3. **验证数据**
   - 访问 phpMyAdmin
   - 选择 whitecycle 数据库
   - 查看 users 表
   - 应该看到新注册用户

#### 7. 使用完整功能

1. **访问登录页面**
   ```
   http://localhost/login.html
   ```

2. **注册账户**
   - 账户名：testuser
   - 密码：123456
   - 点击"注册新账户"

3. **登录**
   - 使用刚注册的账户登录

4. **创建记录**
   - 开始记录
   - 结束记录
   - 查看记录列表

5. **验证数据库**
   - 访问 phpMyAdmin
   - 查看 records 表
   - 应该看到新创建的记录

---

## 📦 方案二：单独安装（高级）

### 适用场景
- 已有 PHP 或 MySQL
- 需要自定义配置
- 有经验的用户

### 安装步骤

#### 1. 安装 PHP

1. **下载 PHP**
   ```
   https://windows.php.net/download/
   ```

2. **解压到 C:\php**

3. **配置 php.ini**
   ```
   复制 php.ini-development 为 php.ini
   编辑：extension=pdo_mysql
   ```

4. **添加到环境变量**
   ```
   系统属性 → 高级 → 环境变量
   Path → 新建 → C:\php
   ```

#### 2. 安装 MySQL

1. **下载 MySQL**
   ```
   https://dev.mysql.com/downloads/mysql/
   ```

2. **安装**
   - 选择"Developer Default"
   - 设置 root 密码

3. **验证**
   ```
   mysql -u root -p
   ```

#### 3. 配置

1. **创建数据库**
   ```sql
   CREATE DATABASE whitecycle DEFAULT CHARACTER SET utf8mb4;
   ```

2. **配置 database.php**
   ```php
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'whitecycle');
   define('DB_USER', 'root');
   define('DB_PASS', '你的密码');
   ```

---

## 🐛 常见问题

### Q1: Apache 无法启动

**错误:** Port 80 in use by 'Unable to open process'

**解决:**
1. 关闭占用 80 端口的程序（Skype、IIS）
2. 或修改 Apache 端口：
   ```
   httpd.conf → Listen 8080
   ```

### Q2: MySQL 无法启动

**错误:** MySQL shutdown unexpectedly

**解决:**
1. 检查 data 目录权限
2. 删除 data 文件夹重新初始化
3. 查看错误日志：`xampp\mysql\data\mysql_error.log`

### Q3: 数据库连接失败

**错误:** SQLSTATE[HY000] [1045] Access denied

**解决:**
1. 检查 database.php 配置
2. 确认 MySQL 服务已启动
3. 验证用户名密码

### Q4: API 返回 404

**错误:** Not Found

**解决:**
1. 检查文件路径
2. 确认 Apache 的 mod_rewrite 已启用
3. 检查 .htaccess 文件

### Q5: 中文乱码

**错误:** 显示乱码字符

**解决:**
1. 确保数据库使用 utf8mb4
2. HTML 文件包含 `<meta charset="UTF-8">`
3. PHP 文件设置 `header('Content-Type: application/json; charset=utf-8')`

---

## ✅ 验证清单

### 环境验证
- [ ] XAMPP 已安装
- [ ] Apache 已启动（绿色）
- [ ] MySQL 已启动（绿色）
- [ ] 可访问 http://localhost/

### 数据库验证
- [ ] whitecycle 数据库已创建
- [ ] 4 个表已创建（users, records, achievements, weekly_goals）
- [ ] 可访问 phpMyAdmin

### API 验证
- [ ] 注册 API 可用
- [ ] 登录 API 可用
- [ ] 记录 API 可用

### 功能验证
- [ ] 可注册新用户
- [ ] 可登录
- [ ] 可创建记录
- [ ] 数据保存到数据库

---

## 📞 获取帮助

### 日志文件
- Apache: `C:\xampp\apache\logs\error.log`
- MySQL: `C:\xampp\mysql\data\mysql_error.log`

### 诊断工具
- phpMyAdmin: 检查数据库
- 浏览器控制台：检查前端错误
- XAMPP 日志：检查服务状态

---

## 🎉 完成后

安装完成后，你将拥有：
- ✅ 完整的后端系统
- ✅ MySQL 数据库存储
- ✅ 安全的用户认证
- ✅ 跨设备数据同步
- ✅ 密码提示问题功能

**访问地址:**
- 登录：http://localhost/login.html
- 主页：http://localhost/index.html
- phpMyAdmin: http://localhost/phpmyadmin

祝你安装顺利！有任何问题随时问我！🚀
