#!/usr/bin/env node
/**
 * macOS本地TTS音频批量生成和上传脚本
 * 使用macOS内置say命令生成音频
 */

const COS = require('cos-nodejs-sdk-v5');
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 腾讯云配置
const SECRET_ID = process.env.TENCENT_SECRET_ID || '';;
const SECRET_KEY = process.env.TENCENT_SECRET_KEY || '';;

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

function generateWithSay(text) {
  return new Promise((resolve, reject) => {
    const clean = cleanText(text);
    if (!clean) {
      resolve(null);
      return;
    }

    const m4aPath = `/tmp/tts_${Date.now()}.m4a`;
    const mp3Path = `/tmp/tts_${Date.now()}.mp3`;

    // 使用say命令生成m4a
    try {
      execSync(`say -v "Samantha" -o "${m4aPath}" "${clean.replace(/"/g, '\\"')}"`, { timeout: 10000 });
    } catch (e) {
      console.log(`  say错误: ${e.message}`);
      resolve(null);
      return;
    }

    // 检查m4a是否存在
    if (!fs.existsSync(m4aPath)) {
      console.log(`  m4a文件不存在`);
      resolve(null);
      return;
    }

    // 转换为mp3
    try {
      execSync(`ffmpeg -i "${m4aPath}" -acodec libmp3lame -ab 64k "${mp3Path}" -y -loglevel quiet`, { timeout: 10000 });
      
      // 读取mp3
      const mp3Data = fs.readFileSync(mp3Path);
      
      // 清理临时文件
      fs.unlinkSync(m4aPath);
      fs.unlinkSync(mp3Path);
      
      if (mp3Data.length > 1000) {
        resolve(mp3Data);
      } else {
        resolve(null);
      }
    } catch (e) {
      console.log(`  ffmpeg错误: ${e.message}`);
      // 清理
      if (fs.existsSync(m4aPath)) fs.unlinkSync(m4aPath);
      if (fs.existsSync(mp3Path)) fs.unlinkSync(mp3Path);
      resolve(null);
    }
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
  console.log('🔊 macOS本地TTS批量生成器 (Samantha英式发音)');
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
    const audioData = await generateWithSay(text);

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

    await sleep(100);
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
