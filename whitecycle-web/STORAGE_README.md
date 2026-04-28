# 白循 WhiteCycle - 存储方案说明

## 📦 智能存储系统

白循采用**双模式存储方案**，用户下载后无需任何配置即可使用：

### ✅ 默认模式：LocalStorage（浏览器存储）

**优点**：
- 开箱即用，无需配置
- 不依赖任何后端服务
- 数据存储在用户浏览器中
- 适合个人使用

**存储内容**：
- 用户配置（身份、主题等）
- 历史记录数据
- 成就和统计信息

### 🚀 可选模式：MySQL（数据库存储）

**适用场景**：
- 需要数据持久化备份
- 多设备同步数据
- 企业级部署

**启用方法**：
1. 安装 PHP 和 MySQL
2. 配置 `php/config/database.php`
3. 运行 `php/database/init.sql` 初始化数据库
4. 系统会自动检测并使用 MySQL

## 🔧 技术实现

### 自动检测机制

系统启动时会自动检测 MySQL 是否可用：

```javascript
// 检测流程
1. 请求 php/api/health.php
2. 如果 MySQL 可用 → 使用 MySQL 存储
3. 如果 MySQL 不可用 → 自动降级到 LocalStorage
```

### 数据同步

- 两种模式使用相同的数据结构
- 可以随时切换存储方式
- 数据格式完全兼容

## 📁 文件说明

```
whitecycle-web/
├── js/utils/storage.js          # 智能存储管理器
├── php/api/health.php           # 健康检查 API
├── php/api/storage.php          # 通用存储 API
├── php/database/init.sql        # 数据库初始化脚本
└── php/config/database.php      # 数据库配置文件
```

## 🎯 使用建议

### 普通用户（推荐）
直接使用，无需任何配置！数据会保存在你的浏览器中。

### 开发者
如果需要 MySQL 支持：
```bash
# 1. 配置数据库
编辑 php/config/database.php

# 2. 初始化数据库
mysql -u root -p < php/database/init.sql

# 3. 启动 PHP 服务器
php -S localhost:8888
```

## 🔒 数据安全

### LocalStorage 模式
- 数据存储在本地浏览器
- 清除浏览器缓存会删除数据
- 建议定期导出备份

### MySQL 模式
- 数据存储在数据库
- 密码使用 SHA-256 加密
- 支持数据备份和恢复

## 📊 对比表

| 特性 | LocalStorage | MySQL |
|------|-------------|-------|
| 配置要求 | 无需配置 | 需要 PHP + MySQL |
| 数据持久性 | 浏览器缓存 | 数据库永久存储 |
| 多设备同步 | ❌ | ✅ |
| 数据备份 | 手动导出 | 自动备份 |
| 适用场景 | 个人使用 | 企业/多设备 |

## ❓ 常见问题

### Q: 我会不会丢失数据？
A: LocalStorage 模式下，清除浏览器缓存会删除数据。建议定期使用"导出数据"功能备份。

### Q: 如何切换到 MySQL？
A: 配置好 PHP 和 MySQL 后，系统会自动检测并切换。

### Q: 两种模式可以同时使用吗？
A: 系统会自动选择一种模式，优先使用 MySQL（如果可用）。

---

**白循 WhiteCycle** - 让健康管理更简单 💚
