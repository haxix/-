# 白循 WhiteCycle - 开源部署指南

## 🚀 快速开始（推荐）

### 方式一：直接使用（无需配置）

**适合：个人用户、快速体验**

1. **下载项目**
   ```bash
   git clone https://github.com/yourusername/whitecycle-web.git
   ```

2. **打开浏览器**
   - 直接双击 `index.html` 打开
   - 或使用 Live Server 等浏览器插件

3. **开始使用**
   - 注册账户
   - 开始记录健康数据
   - 所有数据自动保存在浏览器中

✅ **优点**：
- 零配置，开箱即用
- 不需要安装任何服务器软件
- 数据完全本地化，隐私安全

---

## 🏗️ 完整部署（可选）

### 方式二：使用 MySQL 数据库

**适合：企业用户、需要数据持久化、多设备同步**

### 环境要求

- PHP 7.4 或更高版本
- MySQL 5.7 或更高版本
- Web 服务器（Apache/Nginx）或 PHP 内置服务器

### 部署步骤

#### 1. 配置数据库

编辑 `php/config/database.php`：

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'whitecycle');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');
```

#### 2. 创建数据库

```bash
mysql -u root -p < php/database/init.sql
```

#### 3. 启动服务

**使用 PHP 内置服务器：**
```bash
cd whitecycle-web
php -S localhost:8888
```

**使用 XAMPP/WAMP：**
- 将项目放到 `htdocs` 目录
- 启动 Apache 和 MySQL
- 访问 `http://localhost/whitecycle-web`

#### 4. 访问应用

打开浏览器访问：`http://localhost:8888`

---

## 📦 存储方案说明

白循采用**智能双模式存储**：

### 自动检测逻辑

```
应用启动
    ↓
检测 MySQL 是否可用？
    ├─ 是 → 使用 MySQL 存储
    └─ 否 → 使用 LocalStorage 存储
```

### 两种模式对比

| 特性 | LocalStorage（默认） | MySQL |
|------|---------------------|-------|
| 配置 | 无需配置 | 需要配置 |
| 数据位置 | 浏览器 | 数据库 |
| 持久性 | 清除缓存会丢失 | 永久存储 |
| 多设备 | ❌ | ✅ |
| 备份 | 手动导出 | 自动备份 |

---

## 🔧 开发环境

### 使用 VS Code

1. 安装 **Live Server** 扩展
2. 右键 `index.html` → Open with Live Server
3. 自动在浏览器中打开并支持热更新

### 使用 PHP 内置服务器

```bash
# 进入项目目录
cd whitecycle-web

# 启动服务器
php -S localhost:8888

# 访问 http://localhost:8888
```

---

## 📊 数据管理

### 导出数据

1. 进入设置页面
2. 点击"导出数据"
3. 下载 JSON 格式的备份文件

### 导入数据

1. 进入设置页面
2. 点击"导入数据"
3. 选择之前导出的 JSON 文件

### 清除数据

1. 进入设置页面
2. 点击"清除所有数据"
3. 确认后数据会被删除

---

## 🔒 安全建议

### LocalStorage 模式

- ✅ 数据存储在本地，不会上传到服务器
- ✅ 适合个人使用
- ⚠️ 清除浏览器缓存会丢失数据
- 💡 建议定期导出备份

### MySQL 模式

- ✅ 数据持久化存储
- ✅ 支持备份和恢复
- ✅ 密码使用 SHA-256 加密
- 💡 定期备份数据库

---

## ❓ 常见问题

### Q: 我没有 PHP 和 MySQL，能使用吗？

**A:** 可以！直接打开 `index.html` 就能使用，数据会保存在浏览器中。

### Q: 如何从 LocalStorage 迁移到 MySQL？

**A:** 
1. 在 LocalStorage 模式下导出数据
2. 配置并启动 MySQL
3. 在 MySQL 模式下导入数据

### Q: 数据存储在浏览器的什么位置？

**A:** 
- Chrome: `chrome://settings/siteData`
- Firefox: `about:preferences#privacy`
- Safari: `偏好设置 → 隐私 → 管理网站数据`

### Q: 可以在手机上使用吗？

**A:** 可以！白循支持响应式设计，适配手机和平板。

### Q: 支持哪些浏览器？

**A:** 
- ✅ Chrome / Edge（推荐）
- ✅ Firefox
- ✅ Safari
- ✅ Opera

---

## 🛠️ 故障排除

### 无法打开页面

**解决：**
- 检查文件路径是否正确
- 使用浏览器打开，不要用文件管理器双击
- 尝试使用 Live Server

### 数据无法保存

**解决：**
- 检查浏览器是否允许 LocalStorage
- 清除浏览器缓存后重试
- 检查控制台是否有错误信息

### MySQL 连接失败

**解决：**
- 检查数据库配置是否正确
- 确认 MySQL 服务已启动
- 检查数据库用户权限

---

## 📞 获取帮助

- 📖 查看 [STORAGE_README.md](./STORAGE_README.md) 了解存储方案
- 🐛 提交 Issue 报告问题
- 💬 参与 Discussion 讨论

---

**白循 WhiteCycle** - 开源免费，让健康管理更简单 💚
