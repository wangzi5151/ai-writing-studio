# ✍️ AI Writing Studio

一个基于 React 的免费 AI 写作助手，支持 Markdown 编辑、实时预览、8 种 AI 写作模式，可打包为安卓 APK。

## ✨ 功能特性

### AI 写作工具
- **8 种 AI 模式**：润色、扩写、缩写、翻译（中英互译）、总结、续写
- **免费 AI API**：使用 Puter.js，无需 API Key，开箱即用
- **实时流式输出**：AI 处理过程实时显示，支持取消与超时
- **选中文本处理**：可对编辑器选区运行 AI 并替换选区

### 编辑器
- **Markdown 编辑器**：基于本地打包的 CodeMirror 6，语法高亮、行号、自动补全，离线可用
- **实时预览**：一键切换编辑/预览模式
- **字数统计**：实时显示字数和行数

### 文档管理
- **本地存储**：防抖自动保存 + 未保存状态提示，切换/新建文档不丢内容
- **多文档管理**：创建、切换、删除文档
- **搜索功能**：按标题或正文快速查找文档

### 模板系统
- 7 种写作模板：博客、邮件、简历、论文、会议纪要、待办、空白

### 导出功能
- **Markdown**：原始 .md 文件
- **HTML**：带样式的网页文件
- **纯文本**：去格式的纯文本

### 移动端适配
- **Material Design 3**：遵循 Google 设计规范
- **明暗主题**：支持浅色/深色切换
- **底部导航**：便捷的移动端导航
- **触感反馈**：原生交互体验

## 🚀 快速开始

### 在线使用
直接访问 [GitHub Pages](https://wangzi5151.github.io/ai-writing-studio/)（需部署后生效）

### 本地开发
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 运行测试
npm test

# 构建生产版本
npm run build
```

### Android APK 安装
1. 从 [Releases](https://github.com/wangzi5151/ai-writing-studio/releases) 下载 `AI-Writing-Studio.apk`
2. 传到手机
3. 开启「允许安装未知来源应用」
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

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18 | UI 框架 |
| Vite | 6 | 构建工具 |
| Tailwind CSS | 3 | 样式框架 |
| CodeMirror | 6 | Markdown 编辑器（本地打包） |
| marked | 15 | Markdown 渲染（本地打包） |
| DOMPurify | 3 | 预览 HTML 安全过滤 |
| Vitest + RTL | - | 单元/组件测试 |
| Puter.js | - | 免费 AI API（按需加载） |
| Capacitor | 6 | Android 打包 |

## 📁 项目结构

```
ai-writing-studio/
├── src/
│   ├── App.jsx              # 主应用组件（文档管理、自动保存、预览）
│   ├── main.jsx             # 应用入口
│   ├── components/
│   │   ├── Editor.jsx       # 本地 CodeMirror 6 编辑器
│   │   ├── Preview.jsx      # 安全 Markdown 预览
│   │   └── Sidebar.jsx      # 文档列表与搜索
│   ├── hooks/
│   │   ├── useAI.js         # AI 调用、取消与超时
│   │   └── useDocuments.js  # 文档存储辅助
│   ├── data/
│   │   └── templates.js     # 写作模板数据
│   ├── test/
│   │   └── setup.js         # Vitest / RTL 配置
│   ├── styles/
│   │   └── theme.css        # Material Design 3 主题变量
│   ├── utils/
│   │   ├── export.js        # 导出功能
│   │   ├── markdown.js      # marked + DOMPurify 渲染
│   │   └── puter.js         # 按需加载 AI 服务
│   └── __tests__/           # 单元 / 组件测试
├── android/                 # Capacitor Android 原生项目
├── dist/                    # Vite 构建产物
├── public/                  # 静态资源
├── index.html               # 单页应用入口
├── package.json
├── vite.config.js
├── tailwind.config.js
└── capacitor.config.json
```

## 📱 Android 打包说明

使用 Capacitor 6 将 Web 应用打包为原生 Android APK：

| 配置项 | 值 |
|--------|-----|
| 包名 | `com.wangzi5151.aiwritingstudio` |
| 最低 Android | 5.1 (API 22) |
| 目标 Android | 14 (API 34) |
| APK 大小 | 约 3.7MB |

> 构建环境：Termux + JDK 21 + Android SDK + 阿里云 Maven 镜像 + 原生 aapt2

## 📝 更新日志

### v1.2.0 (2026-11-08)
- 文档编辑增加 700ms 防抖自动保存、未保存状态与离开页面提示
- 切换 / 新建 / 删除文档前自动落盘，避免丢失内容
- CodeMirror 6 与 marked 改为本地打包，编辑与预览完全离线可用
- Puter.js 改为仅在调用 AI 时按需加载
- 预览与 HTML 导出使用 DOMPurify 过滤不安全 HTML
- 恢复「AI 处理选中文本并替换选区」能力，新增取消与 60s 超时
- 侧边栏新增按标题 / 正文搜索
- 新增 Vitest + React Testing Library 测试与 GitHub Actions CI
- 修正 README 技术栈与版本记录

### v1.1.0 (2026-08-25)
- 新增预览模式切换
- 新增字数/行数统计
- 修复 AI 结果替换选中文本功能
- 改进导出功能（同步使用 marked）
- 改进 SEO 元数据
- 代码重构和优化

### v1.0.0 (2026-08-25)
- 首个正式版本
- Markdown 编辑器 + 实时预览
- 8 种 AI 写作模式
- 7 个写作模板
- 文档管理 + 本地存储
- 导出 MD/HTML/TXT
- Material Design 3 主题
- Capacitor Android 打包

## 📄 License

MIT
