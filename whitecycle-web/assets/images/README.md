# 图片资源说明

本文件夹用于存放应用所需的图片资源。

## 图片分类

### 1. 背景图片
- 欢迎页背景
- 登录页背景
- 空状态背景

### 2. 插图
- 引导页插图
- 成就插图
- 提示插图

### 3. 用户头像
- 默认头像
- 自定义头像

## 图片优化建议

1. **格式选择**
   - 照片类：JPG（质量 80-90%）
   - 图标类：PNG（支持透明）
   - 动画类：考虑使用 Lottie 或 CSS 动画

2. **大小控制**
   - 背景图：不超过 500KB
   - 插图：不超过 200KB
   - 图标：不超过 50KB

3. **响应式图片**
   ```html
   <picture>
     <source media="(min-width: 1024px)" srcset="image-large.jpg">
     <source media="(min-width: 640px)" srcset="image-medium.jpg">
     <img src="image-small.jpg" alt="描述">
   </picture>
   ```

## 临时方案

在正式图片资源完成前，可以使用：
- CSS 渐变背景
- Emoji 图标
- SVG 矢量图形
