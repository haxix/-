# 字体资源说明

本文件夹用于存放应用所需的字体文件。

## 当前使用的字体

### 系统字体（推荐）

应用默认使用系统字体栈，无需额外加载：

```css
font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
```

### 优点

1. **零加载时间** - 使用系统自带字体
2. **最佳性能** - 无需下载字体文件
3. **原生体验** - 与系统风格一致

## 如需自定义字体

### 推荐字体

- **中文**: 思源黑体、站酷高端黑、庞门正道标题体
- **英文**: Inter、Poppins、Roboto、Open Sans

### 使用方法

1. 将字体文件放入此文件夹
2. 在 `css/base.css` 中定义 `@font-face`
3. 在需要的地方应用字体

```css
@font-face {
    font-family: 'CustomFont';
    src: url('fonts/CustomFont.woff2') format('woff2');
    font-weight: normal;
    font-style: normal;
}
```

## 字体优化

- 使用 WOFF2 格式（更好的压缩）
- 仅加载需要的字重
- 使用 `font-display: swap` 避免 FOIT
