# 白循 WhiteCycle - 架构升级说明

## 🎯 本次升级内容

### 1. 数据存储方式改进

#### 之前（LocalStorage）
- ❌ 数据存储在浏览器 LocalStorage
- ❌ 清除缓存会丢失所有数据
- ❌ 不同设备数据不互通
- ❌ 安全性低

#### 现在（MySQL 数据库）
- ✅ 数据存储在 MySQL 数据库
- ✅ 数据永久保存，不怕清除缓存
- ✅ 多设备数据同步（只需登录同一账户）
- ✅ 服务器端安全存储

### 2. 密码登录系统重新设计

#### 之前
- ❌ 登录界面是弹窗，不够醒目
- ❌ 提示不够友好
- ❌ 没有完整的用户注册流程

#### 现在
- ✅ **全屏独立登录页面** (`login.html`)
- ✅ 精美的渐变背景和动画效果
- ✅ 完整的注册/登录流程
- ✅ 失败次数提示（5 次失败警告）
- ✅ 安全提示清晰可见

### 3. 新增功能

- ✅ PHP 后端 API 支持
- ✅ MySQL 数据库存储
- ✅ 用户认证系统
- ✅ 记录 CRUD 操作
- ✅ 统计信息查询

## 📁 新增文件

### 后端文件
```
php/
├── config/
│   └── database.php          # 数据库配置
├── api/
│   ├── auth.php              # 用户认证 API
│   └── records.php           # 记录管理 API
└── database/
    └── init.sql              # 数据库初始化脚本
```

### 前端文件
```
login.html                     # 全屏登录页面
INSTALL.md                     # 安装部署说明
```

## 🔐 密码提示在哪里？

### 1. 登录页面的安全提示

在 `login.html` 登录页面底部，有一个明显的提示框：

```
💡 安全提示
• 密码使用 SHA-256 加密存储，安全可靠
• 忘记密码将无法找回，请妥善保管
• 清除数据会删除所有记录，操作需谨慎
```

### 2. 设置页面的提示（旧版，可选保留）

如果你还保留了之前的 LocalStorage 版本，在设置 → 密码保护中也有提示。

## 🚀 如何使用新系统

### 第一步：安装数据库

```bash
# 1. 登录 MySQL
mysql -u root -p

# 2. 创建数据库并导入表结构
source php/database/init.sql
```

### 第二步：配置数据库连接

编辑 `php/config/database.php`：

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'whitecycle');
define('DB_USER', 'root');         // 你的数据库用户名
define('DB_PASS', 'your_password'); // 你的数据库密码
```

### 第三步：测试 API

使用 curl 或 Postman 测试注册：

```bash
curl -X POST http://localhost/php/api/auth.php?action=register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456"}'
```

### 第四步：访问登录页面

打开浏览器访问：
```
http://localhost/login.html
```

### 第五步：注册并登录

1. 输入账户名（至少 1 个字符）
2. 输入密码（至少 6 位）
3. 点击"登录"
4. 如果是新账户，会自动注册并登录

## 📊 数据库表结构

### users - 用户表
```sql
- id: 用户 ID
- username: 用户名（唯一）
- password_hash: 密码哈希值
- salt: 盐值
- identity: 用户身份
- created_at: 创建时间
- updated_at: 更新时间
- last_login_at: 最后登录时间
```

### records - 记录表
```sql
- id: 记录 ID
- user_id: 用户 ID（外键）
- start_time: 开始时间
- end_time: 结束时间
- duration_minutes: 持续时长（分钟）
- participation: 参与方式（solo/together/teacher）
- emotion: 情绪
- note: 备注
- created_at: 创建时间
- updated_at: 更新时间
```

### achievements - 成就表
```sql
- id: 成就 ID
- user_id: 用户 ID（外键）
- achievement_id: 成就标识
- unlocked_at: 解锁时间
```

### weekly_goals - 周目标表
```sql
- id: 目标 ID
- user_id: 用户 ID（外键）
- week_start: 周开始日期
- target_count: 目标次数
```

## 🔒 安全特性

### 密码加密
- **算法**: SHA-256
- **盐值**: 16 字节随机数（32 位十六进制）
- **加密方式**: `hash('sha256', password + salt)`
- **存储**: 只存储哈希值和盐值，不存储明文密码

### 会话管理
- **登录状态**: 存储在 SessionStorage（关闭浏览器自动清除）
- **用户 ID**: 存储在 SessionStorage
- **自动验证**: 每次加载页面验证登录状态

### API 安全
- **预处理语句**: 防止 SQL 注入
- **错误处理**: 不暴露敏感信息
- **CORS**: 允许跨域访问（生产环境应限制域名）

## ⚠️ 注意事项

### 数据迁移

如果你之前使用 LocalStorage 版本，需要手动迁移数据：

1. 导出 LocalStorage 数据
2. 登录新系统
3. 通过 API 导入数据（需要编写导入脚本）

### 忘记密码

忘记密码的解决方案：

1. **方案一**: 清除数据重新开始
   - 点击登录页面的"清除所有数据"按钮
   - 会删除所有记录，谨慎操作！

2. **方案二**: 直接操作数据库
   ```sql
   -- 重置密码为 123456
   UPDATE users 
   SET password_hash = '新的哈希值', salt = '新的盐值'
   WHERE username = '你的用户名';
   ```

### 部署到生产环境

1. **启用 HTTPS**: 保护密码传输安全
2. **限制 CORS**: 只允许特定域名访问 API
3. **添加速率限制**: 防止暴力破解
4. **定期备份数据库**: 防止数据丢失

## 🎨 登录页面设计亮点

### 视觉效果
- **渐变背景**: 紫色渐变，营造神秘感
- **浮动动画**: Logo 图标上下浮动
- **背景旋转**: 径向渐变缓慢旋转
- **卡片动画**: 登录框从下方滑入

### 交互体验
- **输入框聚焦**: 边框变色 + 阴影效果
- **按钮悬停**: 上浮效果 + 阴影加深
- **错误提示**: 抖动动画 + 红色背景
- **加载状态**: 旋转 loading 图标

### 响应式设计
- **移动端优化**: 自适应屏幕大小
- **键盘支持**: 回车键登录
- **触摸友好**: 大按钮易点击

## 📈 后续优化方向

1. **前端改造**: 将 `index.html` 改为调用后端 API
2. **离线支持**: Service Worker 缓存
3. **数据同步**: 自动同步本地和服务器数据
4. **推送通知**: 每日提醒
5. **数据分析**: 更多统计图表

## 📞 技术支持

遇到问题请检查：
1. MySQL 服务是否运行
2. PHP 版本是否>=7.4
3. 数据库配置是否正确
4. 浏览器控制台错误信息

祝你使用愉快！🎉
