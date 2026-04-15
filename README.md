# UpGrade English 微信小程序

基于 Oxford Phonics World 风格的儿童英语学习小程序，专为 4-8 岁儿童设计。

## 功能特性

- 📚 **12 个课程单元**：问候语、课堂指令、朋友、自我、情绪、颜色、数字、动物、家庭、身体、食物、玩具
- 🔤 **ABC 字母学习**：26 个字母发音与词汇
- 📝 **词汇学习**：每单元 8-10 个核心词汇，支持点击发音
- 💬 **句型练习**：问答对话，情景练习
- 🎵 **歌曲学习**：内置歌词和播放控制
- 🎮 **四种游戏**：
  - 🃏 Memory Match（翻牌记忆配对）
  - 🧠 Quiz Time（知识问答）
  - 🐝 Spelling Bee（拼写挑战）
  - 🫧 Bubble Pop（泡泡消消乐）
- ✅ **每日打卡**：学习习惯养成
- ⭐ **星星徽章**：激励学习动力

## 部署步骤

### 1. 在微信公众平台创建项目

1. 打开 [微信公众平台](https://mp.weixin.qq.com/)
2. 登录后进入「开发」→「开发管理」→「开发设置」
3. 获取 AppID：`wx498328d7f10254fd`
4. 复制「项目 ID」

### 2. 导入项目

1. 下载本项目代码
2. 打开 **微信开发者工具**（[下载](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)）
3. 点击「导入项目」
4. 选择本项目目录
5. AppID 填写：`wx498328d7f10254fd`
6. 点击「导入」

### 3. 配置 tabBar 图标

`static/` 目录下已有 6 个基础图标。如需自定义，请准备 81×81px 的 PNG 图标：
- `tab-home.png` / `tab-home-active.png`
- `tab-game.png` / `tab-game-active.png`
- `tab-checkin.png` / `tab-checkin-active.png`

### 4. 添加小程序标题图（可选）

在微信公众平台「设置」→「基本设置」→「小程序名称/图标」中设置。

### 5. 编译预览

在微信开发者工具中点击「编译」按钮，即可在模拟器中预览。

### 6. 上传发布

1. 点击「上传」按钮
2. 在微信公众平台提交审核
3. 审核通过后即可发布

## 项目结构

```
upgrade-english-miniprogram/
├── app.js              # 应用入口
├── app.json            # 应用配置
├── app.wxss            # 全局样式
├── project.config.json # 项目配置
├── sitemap.json        # SEO 配置
├── static/             # 静态资源（图标）
├── utils/
│   └── data.js         # 课程数据（12单元 + ABC模块）
└── pages/
    ├── home/           # 首页（单元列表）
    ├── unit/           # 单元详情（词汇/句型/歌曲/游戏）
    ├── games/          # 游戏中心
    └── checkin/        # 每日打卡
```

## 语音功能

当前版本发音使用 `wx.showToast` 显示文字。如需接入真实 TTS，可使用：

```javascript
// 方式1：微信小程序插件「智聆语音评测」
// 方式2：接入第三方 TTS API（如腾讯云、阿里云）
// 方式3：使用微信同声传译插件
```

## 开发说明

- **小程序 AppID**：`wx498328d7f10254fd`
- **基础库版本**：建议 3.4.6+
- **UI 框架**：原生组件 + WXSS（无需额外框架）
- **数据存储**：使用 `wx.getStorageSync` 本地存储

## License

MIT License
