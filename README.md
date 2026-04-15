# UpGrade English 微信小程序

> 儿童趣味英语学习小程序 - 基于 Oxford Phonics World 课程体系

## 功能特性

- 📚 **12 个课程单元** - 覆盖问候、自我介绍、情绪、颜色、数字、动物等主题
- 🔤 **ABC 字母学习** - 26 个字母发音与书写
- 🎮 **4 种互动游戏** - Memory Match / Quiz / Spelling / Bubble Pop
- ✅ **每日打卡** - 学习习惯养成 + 星星徽章系统
- 🔊 **TTS 语音** - 单词与句子的标准发音
- 📱 **微信小程序** - 即开即用，无需下载

## 技术栈

- 微信小程序原生框架 (WXML + WXSS + JS)
- GitHub Actions CI/CD 自动化部署
- miniprogram-ci 自动化上传

## 一键部署到微信 (GitHub Actions)

### 第一步：配置 GitHub Secrets

1. 打开 GitHub 仓库 → **Settings** → **Secrets and variables** → **Actions**
2. 点击 **New repository secret**，添加以下 3 个密钥：

#### WX_APPID
```
wx498328d7f10254fd
```

#### WX_SECRET
```
你的小程序密钥（在微信公众平台下载）
```

获取方式：
1. 登录 [mp.weixin.qq.com](https://mp.weixin.qq.com)
2. 进入「开发管理」→「开发设置」
3. 找到「小程序密钥」，点击「重置」获取

#### WX_PRIVATE_KEY（可选，推荐）
1. 在微信公众平台 → 「开发管理」→「开发设置」
2. 找到「代码上传密钥」，点击「下载」
3. 下载后的文件内容复制到 Secret 中，变量名为 `WX_PRIVATE_KEY`

### 第二步：创建 GitHub 仓库并推送代码

```bash
cd /Users/huangrong/WorkBuddy/20260415165422/upgrade-english-miniprogram

# 创建仓库（把 YOUR_USERNAME 换成你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/upgrade-english-miniprogram.git

# 推送代码
git push -u origin main
```

### 第三步：自动触发部署

代码推送后，GitHub Actions 会自动：
1. 安装依赖 (miniprogram-ci)
2. 构建小程序
3. 上传到微信公众平台

**查看部署状态：** GitHub 仓库 → **Actions** 页面

### 第四步：在微信后台发布

部署成功后：
1. 登录 [mp.weixin.qq.com](https://mp.weixin.qq.com)
2. 进入「版本管理」
3. 找到刚上传的版本，点击「提交审核」
4. 审核通过后即可发布

## 目录结构

```
upgrade-english-miniprogram/
├── .github/workflows/deploy.yml  # GitHub Actions 自动部署
├── app.js / app.json / app.wxss # 小程序主入口
├── pages/
│   ├── home/       # 首页 - 单元列表
│   ├── unit/       # 单元详情 - 词汇/句型/游戏
│   ├── games/      # 游戏中心
│   └── checkin/    # 每日打卡
├── components/     # 组件
├── utils/data.js   # 课程数据
└── static/         # 静态资源
```

## 手动上传（微信开发者工具）

如果你有微信开发者工具：

1. 下载 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 导入项目目录
3. AppID: `wx498328d7f10254fd`
4. 点击「上传」按钮

## 开发

```bash
# 安装依赖
npm install

# 本地测试（需要微信开发者工具）
# 打开微信开发者工具，导入本目录即可

# 触发自动部署
git push origin main
```

## License

MIT
