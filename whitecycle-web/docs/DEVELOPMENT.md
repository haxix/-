# 开发指南

## 📋 目录

1. [环境配置](#环境配置)
2. [代码规范](#代码规范)
3. [架构说明](#架构说明)
4. [组件开发](#组件开发)
5. [调试技巧](#调试技巧)
6. [构建部署](#构建部署)

---

## 🔧 环境配置

### 必需工具

- **代码编辑器**: VS Code（推荐）、WebStorm、Sublime Text
- **浏览器**: Chrome（推荐）、Firefox、Safari
- **版本控制**: Git

### VS Code 扩展推荐

- Live Server - 实时预览
- Prettier - 代码格式化
- ESLint - 代码检查
- Auto Close Tag - 自动闭合标签
- Auto Rename Tag - 自动重命名标签
- CSS Peek - CSS 快速查看
- Path Intellisense - 路径自动补全

### 开发环境启动

```bash
# 方法 1: 使用 Python
cd whitecycle-web
python -m http.server 8080

# 方法 2: 使用 Node.js
npx http-server -p 8080

# 方法 3: 使用 VS Code Live Server
# 右键 index.html -> Open with Live Server
```

---

## 📝 代码规范

### JavaScript 规范

#### 命名规范

```javascript
// 变量和函数：小驼峰
const userName = 'John';
function getUserInfo() {}

// 类：大驼峰
class UserInfo {}

// 常量：全大写
const MAX_COUNT = 100;

// 私有变量：下划线前缀
let _privateVar = null;

// 文件命名：大驼峰（类）或小驼峰（工具）
// Record.js, helpers.js
```

#### 代码格式

```javascript
// 使用单引号
const name = 'WhiteCycle';

// 语句末尾加分号
const value = 42;

// 使用 const 优先，需要重新赋值时用 let
const config = { version: '6.0.0' };
let count = 0;

// 箭头函数
const add = (a, b) => a + b;

// 模板字符串
const message = `Hello, ${name}!`;
```

#### 注释规范

```javascript
/**
 * 函数注释 - JSDoc 风格
 * @param {string} name - 名称
 * @returns {string} 格式化后的字符串
 */
function formatName(name) {
    return name.trim();
}

// 单行注释使用 //

/*
 * 多行注释使用这种格式
 * 说明复杂的业务逻辑
 */
```

### CSS 规范

#### 命名规范（BEM）

```css
/* Block */
.card { }

/* Block Element */
.card-title { }
.card-content { }

/* Block Modifier */
.card--highlighted { }
.card--disabled { }
```

#### 组织顺序

```css
.selector {
    /* 1. 定位属性 */
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
    
    /* 2. 盒模型 */
    display: flex;
    width: 100%;
    padding: 16px;
    margin: 8px;
    
    /* 3. 字体文本 */
    font-size: 16px;
    font-weight: 600;
    text-align: center;
    
    /* 4. 外观 */
    color: #333;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    
    /* 5. 其他 */
    cursor: pointer;
    transition: all 0.3s;
}
```

---

## 🏗️ 架构说明

### 目录结构

```
whitecycle-web/
├── index.html          # 入口文件
├── css/                # 样式层
│   ├── variables.css   # 设计令牌（颜色、字体、间距等）
│   ├── base.css        # 基础重置和全局样式
│   ├── components.css  # 组件样式（按钮、卡片、表单等）
│   ├── layouts.css     # 布局样式（网格、弹性布局等）
│   ├── animations.css  # 动画关键帧和工具类
│   ├── themes.css      # 主题相关（深色/浅色模式）
│   └── responsive.css  # 响应式断点
├── js/                 # 逻辑层
│   ├── config.js       # 应用配置
│   ├── app.js          # 主应用（核心业务逻辑）
│   ├── models/         # 数据模型层
│   ├── components/     # UI 组件层
│   ├── services/       # 业务服务层
│   └── utils/          # 工具函数层
└── assets/             # 资源层
    ├── images/         # 图片
    ├── icons/          # 图标
    └── fonts/          # 字体
```

### 数据流

```
用户操作 → app.js 处理 → Service 层 → LocalStorage
                ↓
            更新 UI
```

### 模块化设计

```javascript
// 每个模块负责单一功能
// utils/storage.js - 只负责存储
// services/DataService.js - 只负责数据操作
// components/Toast.js - 只负责 Toast 展示
```

---

## 🧩 组件开发

### 开发新组件步骤

1. **在 components.css 中添加样式**

```css
.new-component {
    /* 样式定义 */
}
```

2. **在 js/components/ 创建组件文件**

```javascript
const NewComponent = {
    init() {
        // 初始化逻辑
    },
    
    render(data) {
        // 渲染逻辑
    }
};
```

3. **在 index.html 中引入**

```html
<link rel="stylesheet" href="css/components.css">
<script src="js/components/NewComponent.js"></script>
```

4. **在 app.js 中使用**

```javascript
NewComponent.init();
```

---

## 🐛 调试技巧

### 浏览器 DevTools

```javascript
// 1. 控制台输出
console.log('普通日志');
console.info('信息日志');
console.warn('警告日志');
console.error('错误日志');

// 2. 表格形式输出
console.table(data);

// 3. 分组输出
console.group('用户信息');
console.log('姓名:', name);
console.log('年龄:', age);
console.groupEnd();

// 4. 性能分析
console.time('操作耗时');
// 执行操作
console.timeEnd('操作耗时');

// 5. 断点调试
debugger; // 代码执行到这里会暂停
```

### 常见问题排查

#### 1. 样式不生效

- 检查 CSS 文件是否正确引入
- 检查选择器优先级
- 检查是否有拼写错误
- 使用 DevTools 查看计算样式

#### 2. JavaScript 报错

- 查看控制台错误信息
- 检查文件路径是否正确
- 检查变量是否已定义
- 使用 try-catch 捕获异常

#### 3. 数据未保存

- 检查 LocalStorage 是否可用
- 检查数据格式是否正确（必须是字符串）
- 检查是否超过存储限制（通常 5MB）

---

## 🚀 构建部署

### 开发环境

```bash
# 启动本地服务器
python -m http.server 8080

# 访问 http://localhost:8080
```

### 生产环境

#### 方案 1: 静态托管

```bash
# 直接将 whitecycle-web 文件夹上传到：
# - GitHub Pages
# - Vercel
# - Netlify
# - 任何静态托管服务
```

#### 方案 2: Nginx

```nginx
server {
    listen 80;
    server_name whitecycle.com;
    root /var/www/whitecycle-web;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 启用 Gzip
    gzip on;
    gzip_types text/css application/javascript;
}
```

#### 方案 3: Apache

```apache
<VirtualHost *:80>
    ServerName whitecycle.com
    DocumentRoot /var/www/whitecycle-web
    
    <Directory /var/www/whitecycle-web>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

---

## 📚 扩展阅读

- [MDN Web 文档](https://developer.mozilla.org/zh-CN/)
- [JavaScript 高级程序设计](https://book.douban.com/subject/10546125/)
- [CSS 揭秘](https://book.douban.com/subject/26745943/)
- [设计模式](https://book.douban.com/subject/1052241/)

---

## 🤝 贡献指南

### 提交代码

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: add AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

### Commit 规范

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 重构代码
test: 测试相关
chore: 构建/工具链相关
```

---

<div align="center">

**Happy Coding!** 🎉

</div>
