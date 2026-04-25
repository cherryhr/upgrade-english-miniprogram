/**
 * upload.js - 微信小程序上传脚本 (CommonJS 兼容版)
 * 用于 GitHub Actions CI/CD 自动上传
 */
const ci = require('miniprogram-ci');
const path = require('path');
const fs = require('fs');

const appid = process.env.WX_APPID;
const secret = process.env.WX_SECRET;
const privateKeyFromEnv = process.env.WX_PRIVATE_KEY;
const projectPath = path.resolve(__dirname);
const privateKeyPath = path.join(projectPath, 'private.key');

const version = process.env.GITHUB_RUN_NUMBER
  ? `1.0.${process.env.GITHUB_RUN_NUMBER}`
  : '1.0.0';

console.log('📦 UpGrade English - 微信小程序上传开始');
console.log(`   AppID: ${appid || '❌ 未配置'}`);

// 如果环境变量中有私钥内容，写入文件
if (privateKeyFromEnv && !fs.existsSync(privateKeyPath)) {
  fs.writeFileSync(privateKeyPath, privateKeyFromEnv);
  console.log('   私钥文件: 从环境变量生成 ✅');
} else if (fs.existsSync(privateKeyPath)) {
  console.log('   私钥文件: 存在 ✅');
} else {
  console.log('   私钥文件: ⚠️ 不存在');
}

async function main() {
  const project = new ci.Project({
    appid,
    type: 'miniProgram',
    projectPath,
    privateKeyPath: fs.existsSync(privateKeyPath) ? privateKeyPath : undefined,
    ignores: [
      'node_modules/**',
      '.*',
      '*.md',
      '.github/**',
      'upload.js',
      'test_token.js',
      'package.json',
      'package-lock.json',
    ],
  });

  const result = await ci.upload({
    project,
    version,
    desc: `Local Upload - ${new Date().toLocaleString('zh-CN')}`,
    setting: {
      es6: true,
      enhance: true,
      minify: true,
      setLocale: true,
    },
    onProgressUpdate: (p) => {
      process.stdout.write(`\r   进度: ${p.description} (${p.progress}%)`);
    },
  });

  console.log('\n\n✅ 上传成功！');
  console.log(`   版本: ${result.version}`);
  console.log(`   描述: ${result.desc}`);
  console.log('\n🌐 请前往 https://mp.weixin.qq.com 提交审核发布');
}

main().catch((err) => {
  console.error('\n❌ 上传失败:', err.message || err);
  if (err.message && err.message.includes('401')) {
    console.error('\n💡 解决方案:');
    console.error('   1. 登录 mp.weixin.qq.com');
    console.error('   2. 开发管理 → 开发设置 → 下载代码上传密钥');
    console.error('   3. 将私钥文件内容保存为 GitHub Secret: WX_PRIVATE_KEY');
  }
  if (err.message && err.message.includes('ENOENT')) {
    console.error('\n💡 解决方案:');
    console.error('   请确保项目路径正确，或检查 miniprogram-ci 版本兼容性');
  }
  process.exit(1);
});
