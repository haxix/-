# 白循 WhiteCycle v6.0.0 

<div align="center">

![Version](https://img.shields.io/badge/version-6.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-Web-lightgrey)

**健康管理助手 - 记录和分析个人生活习惯**

[在线演示](#) | [开发文档](./docs/DEVELOPMENT.md) | [API 文档](./docs/API.md)

</div>

---

## 📖 项目简介

白循（WhiteCycle）是一款专业的健康管理 Web 应用，旨在帮助用户记录和分析个人生活习惯，提倡健康的生活方式。采用现代化的企业级架构设计，支持 PWA 离线使用。

### ✨ 核心特性

- 📝 **记录管理** - 详细记录每次活动，支持多标签分类
- 🎯 **多选参与方式** - 支持同时选择多种参与方式（包括导师指导）
- 📊 **数据统计** - 多维度统计图表，直观展示数据趋势
- 🏆 **成就系统** - 6 种成就徽章，激励用户保持健康习惯
- 💡 **智能建议** - 基于数据分析提供个性化健康建议
- 📅 **日历视图** - 月度日历展示，快速查看记录分布
- 🌓 **主题切换** - 支持深色/浅色模式
- 💾 **数据导入导出** - JSON 格式完整数据备份
- 📱 **PWA 支持** - 可安装为桌面应用，支持离线使用
- 🔒 **隐私保护** - 所有数据存储在本地，保护用户隐私

---

## 🚀 快速开始

### 方法一：直接打开

```bash
# 直接在浏览器中打开 index.html
open whitecycle-web/index.html
```

### 方法二：使用本地服务器

```bash
# 使用 Python
cd whitecycle-web
python -m http.server 8080

# 使用 Node.js http-server
npx http-server -p 8080

# 然后访问 http://localhost:8080
```

### 方法三：使用 VS Code Live Server

1. 安装 Live Server 扩展
2. 右键点击 `index.html`
3. 选择 "Open with Live Server"

---

## 📁 项目结构

```
whitecycle-web/
├── index.html              # 主页面入口
├── index-loader.html       # 加载页面
├── css/                    # 样式文件
│   ├── variables.css       # CSS 变量（设计令牌）
│   ├── base.css            # 基础样式重置
│   ├── components.css      # 组件样式
│   ├── layouts.css         # 布局样式
│   ├── animations.css      # 动画样式
│   ├── themes.css          # 主题样式
│   └── responsive.css      # 响应式设计
├── js/                     # JavaScript 文件
│   ├── config.js           # 配置常量
│   ├── app.js              # 主应用逻辑
│   ├── models/             # 数据模型
│   │   ├── Record.js       # 记录模型
│   │   └── User.js         # 用户模型
│   ├── components/         # UI 组件
│   │   ├── Toast.js        # Toast 通知
│   │   ├── Modal.js        # 模态框
│   │   ├── Calendar.js     # 日历组件
│   │   └── Charts.js       # 图表组件
│   ├── services/           # 业务服务
│   │   ├── DataService.js  # 数据服务
│   │   ├── AchievementService.js  # 成就服务
│   │   └── SuggestionService.js   # 建议服务
│   └── utils/              # 工具函数
│       ├── helpers.js      # 辅助函数
│       └── storage.js      # 存储管理
├── assets/                 # 静态资源
│   ├── images/             # 图片资源
│   ├── icons/              # 图标资源
│   └── fonts/              # 字体资源
├── config/                 # 配置文件
│   ├── manifest.json       # PWA 清单
│   └── robots.txt          # 爬虫配置
└── docs/                   # 文档
    ├── README.md           # 项目说明
    ├── DEVELOPMENT.md      # 开发指南
    └── API.md              # API 文档
```

---

## 🎯 核心功能说明

### 1. 记录功能

- **工具使用**：可选填写使用的工具
- **参与方式**：支持多选（独处时光、二人世界、欢乐派对、导师指导）
- **导师信息**：选择导师指导时可填写导师信息和建议
- **实时计时**：精确记录每次活动的持续时间

### 2. 历史记录

- **列表展示**：按时间倒序展示所有记录
- **日历视图**：月度日历，有记录的日子高亮显示
- **月份切换**：支持前后切换查看不同月份
- **详情查看**：点击记录在模态框中查看详情

### 3. 数据统计

- **基础统计**：总记录数、本周、本月、平均时长
- **周统计图表**：柱状图展示最近 7 天的记录
- **成就系统**：6 种成就徽章，记录成长历程
- **智能建议**：基于数据提供健康建议

### 4. 设置功能

- **身份管理**：选择用户身份（男生、女生、Gay、拉拉、Other、友谊助手）
- **主题切换**：深色/浅色模式切换
- **数据管理**：导入导出 JSON 格式数据
- **清除数据**：一键清除所有数据

---

## 🛠️ 技术栈

- **前端核心**: HTML5 + CSS3 + JavaScript (ES6+)
- **样式架构**: CSS Variables + BEM 命名 + 模块化
- **数据存储**: LocalStorage
- **PWA 支持**: Web App Manifest + Service Worker (可选)
- **响应式**: Mobile First + 断点设计

---

## 🎨 设计特色

### 视觉设计

- **渐变主题**: 紫色系渐变（#6366f1 → #8b5cf6 → #a855f7）
- **流畅动画**: 所有交互都配有平滑的过渡动画
- **光晕效果**: 重要元素带有紫色光晕
- **悬停反馈**: 所有可交互元素都有悬停效果

### 交互设计

- **模态框**: 历史记录详情使用居中的模态框，不遮挡整个屏幕
- **多选功能**: 参与方式支持多选，导师指导可与其他选项并存
- **Toast 通知**: 所有操作都有即时反馈
- **确认对话框**: 重要操作需要二次确认

---

## 📱 浏览器支持

| 浏览器 | 版本 | 支持程度 |
|--------|------|----------|
| Chrome | 90+  | ✅ 完全支持 |
| Firefox | 88+  | ✅ 完全支持 |
| Safari | 14+  | ✅ 完全支持 |
| Edge | 90+  | ✅ 完全支持 |
| 移动端浏览器 | 最新 | ✅ 完全支持 |

---

## 🔧 开发指南

详见 [开发文档](./docs/DEVELOPMENT.md)

### 快速贡献

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 开源协议

MIT License - 详见 [LICENSE](./LICENSE)

---

## 👥 团队

- 开发者：cloris
- 设计：cloris
- 产品：cloris
<div align="center">
    <p>欢迎观众老爷们投喂</p>
</div>
- <img width="1350" height="2025" alt="d515290e97aef6bdd9bf8205cc11a38b" src="https://github.com/user-attachments/assets/30fd3b98-b7a1-43fc-8801-10ef45ccfbff" />


---

## 📞 联系方式

- 项目主页：[GitHub](https://github.com/whitecycle/whitecycle-web)
- 问题反馈：[Issues](https://github.com/whitecycle/whitecycle-web/issues)
- 邮箱：clorisLi7@outlook.com

---

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和用户！

---

<div align="center">

**白循 WhiteCycle** - 让健康成为习惯

Made with 💖 by WhiteCycle Team

</div>
