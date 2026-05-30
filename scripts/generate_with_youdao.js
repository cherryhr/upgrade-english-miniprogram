#!/usr/bin/env node
/**
 * 有道词典TTS音频批量生成和上传脚本
 * 使用有道词典API生成音频
 */

const COS = require('cos-nodejs-sdk-v5');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 腾讯云配置（从环境变量读取，请勿硬编码密钥）
const SECRET_ID = process.env.TENCENT_SECRET_ID || '';
const SECRET_KEY = process.env.TENCENT_SECRET_KEY || '';

// COS配置
const COS_BUCKET = 'upgrade-videos-1412449710';
const COS_REGION = 'ap-guangzhou';

// 本地音频目录
const LOCAL_AUDIO_DIR = './tts_audio';
if (!fs.existsSync(LOCAL_AUDIO_DIR)) {
  fs.mkdirSync(LOCAL_AUDIO_DIR, { recursive: true });
}

// 初始化COS
const cos = new COS({
  SecretId: SECRET_ID,
  SecretKey: SECRET_KEY
});

function filenameToText(filename) {
  const name = filename.replace('.mp3', '');
  return name.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

function cleanText(text) {
  return text.replace(/!/g, '').replace(/\?/g, '').replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
}

function callYoudaoTTS(text) {
  return new Promise((resolve, reject) => {
    const clean = cleanText(text);
    if (!clean) {
      resolve(null);
      return;
    }

    // 有道词典TTS API
    const url = `https://tts.youdao.com/fanyo?text=${encodeURIComponent(clean)}&voice=3`;
    
    https.get(url, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        if (buffer.length > 1000 && buffer[0] === 0xFF && buffer[1] === 0xFE) {
          // MP3文件以0xFF 0xFE开头
          resolve(buffer);
        } else {
          console.log(`  无效响应: ${buffer.length} bytes`);
          resolve(null);
        }
      });
      res.on('error', reject);
    }).on('error', (e) => {
      console.log(`  网络错误: ${e.message}`);
      resolve(null);
    });
  });
}

function uploadToCOS(localPath, cosKey) {
  return new Promise((resolve) => {
    cos.putObject({
      Bucket: COS_BUCKET,
      Region: COS_REGION,
      Key: cosKey,
      Body: fs.createReadStream(localPath),
      ContentType: 'audio/mpeg'
    }, (err, data) => {
      if (err) {
        console.log(`  ❌ COS上传失败: ${err.message}`);
        resolve(false);
      } else {
        console.log(`  ☁️ 已上传COS`);
        resolve(true);
      }
    });
  });
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('='.repeat(60));
  console.log('🔊 有道词典TTS批量生成器');
  console.log('='.repeat(60));

  // 读取缺失文件列表
  const missingFiles = JSON.parse(fs.readFileSync('./cos_missing_files.json', 'utf8'));
  console.log(`\n📝 待生成: ${missingFiles.length} 个音频\n`);

  let success = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < missingFiles.length; i++) {
    const filename = missingFiles[i];
    const progress = `[${i + 1}/${missingFiles.length}]`;
    process.stdout.write(`${progress} ${filename.padEnd(55)}`);

    const localPath = path.join(LOCAL_AUDIO_DIR, filename);

    // 检查本地是否已存在
    if (fs.existsSync(localPath)) {
      console.log(`  ⏭️ 本地已存在`);
      const cosKey = `TTS/${filename}`;
      await uploadToCOS(localPath, cosKey);
      skipped++;
      await sleep(100);
      continue;
    }

    // 从文件名推断文本
    const text = filenameToText(filename);

    // 生成TTS
    const audioData = await callYoudaoTTS(text);

    if (audioData && audioData.length > 1000) {
      // 保存本地
      fs.writeFileSync(localPath, audioData);
      console.log(`  ✅ ${Math.round(audioData.length / 1024)}KB`);

      // 上传COS
      const cosKey = `TTS/${filename}`;
      await uploadToCOS(localPath, cosKey);

      success++;
    } else {
      failed++;
      console.log(`  ❌ 生成失败`);
    }

    await sleep(200);
  }

  console.log();
  console.log('='.repeat(60));
  console.log(`📊 处理完成:`);
  console.log(`  ✅ 成功: ${success}`);
  console.log(`  ⏭️ 跳过: ${skipped}`);
  console.log(`  ❌ 失败: ${failed}`);
  console.log(`  📁 本地目录: ${path.resolve(LOCAL_AUDIO_DIR)}`);
  console.log('='.repeat(60));
}

main().catch(console.error);
