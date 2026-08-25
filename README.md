# ✍️ AI Writing Studio

基于 React + Vite + Tailwind 的 AI 写作助手，支持免费 AI API，可打包为安卓 APK。

## ✨ 功能

### AI 写作工具
- **6 种 AI 模式**：润色、扩写、缩写、翻译（中英互译）、总结、续写
- **免费 AI API**：使用 Puter.js，无需 API Key，直接使用
- **实时预览**：Markdown 编辑 + 实时渲染预览

### 模板系统
- 10 种写作模板：文章、邮件、报告、简历、文案、小说、翻译、论文、博客、营销

### 文档管理
- 本地存储自动保存
- 文档创建、加载、删除
- 导出 Markdown / HTML / TXT
- 系统分享

### 移动端特性
- Material Design 3 主题（明暗切换）
- 底部导航栏
- Capacitor 打包：原生 Android APK
- 触感反馈、状态栏集成

## 🚀 快速开始

### Web 版（在线）
```bash
npm install
npm run dev
```

### Android APK 安装
1. 从 GitHub Releases 下载 `AI-Writing-Studio.apk`
2. 传到手机
3. 安装前开启「允许安装未知来源应用」
4. 点击 APK 安装

### 自行构建 APK
```bash
npm install
npx vite build
npx cap add android
npx cap sync android
cd android
./gradlew assembleDebug
# APK 输出: android/app/build/outputs/apk/debug/app-debug.apk
```

## 🛠️ 技术栈

| 技术 | 用途 |
|------|------|
| React 18 | UI 框架 |
| Vite 6 | 构建工具 |
| Tailwind CSS | 样式框架 |
| Puter.js | 免费 AI API |
| Capacitor 6 | Android 打包 |
| Material Design 3 | 设计系统 |

## 📁 项目结构

```
ai-writing-studio/
├── src/
│   ├── App.jsx          # 主应用（含全部组件）
│   ├── main.jsx         # 入口
│   ├── data/templates.js # 写作模板
│   ├── styles/theme.css  # MD3 主题变量
│   └── utils/export.js   # 导出功能
├── android/             # Capacitor Android 项目
├── dist/                # Vite 构建产物
├── index.html           # 单页应用
├── package.json
└── capacitor.config.json
```

## 📱 Android 打包说明

使用 Capacitor 6 将 Web 应用打包为原生 Android APK：
- **包名**：`com.wangzi5151.aiwritingstudio`
- **最低 Android**：5.1 (API 22)
- **目标 Android**：14 (API 34)
- **APK 大小**：约 3.7MB

> 构建过程需要 JDK、Android SDK 和 Gradle。在 Termux 环境下需额外配置阿里云镜像和原生 aapt2。

## 📝 License

MIT
