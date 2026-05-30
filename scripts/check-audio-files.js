// 检查所有 TTS 映射中的音频文件是否存在
const fs = require('fs');
const https = require('https');

const ttsContent = fs.readFileSync('../utils/tts.js', 'utf8');

// 提取所有音频文件名
const fileMatches = ttsContent.match(/file:\s*"([^"]+\.mp3)"/g) || [];
const audioFiles = [...new Set(fileMatches.map(m => m.match(/"([^"]+)"/)[1]))];

console.log(`总共需要检查 ${audioFiles.length} 个音频文件\n`);

const missing = [];
const found = [];

let checked = 0;

function checkFile(fileName) {
  return new Promise((resolve) => {
    const url = `https://upgrade-videos-1412449710.cos.ap-guangzhou.myqcloud.com/TTS/${fileName}`;
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        found.push({ file: fileName, size: res.headers['content-length'] || 'unknown' });
      } else {
        missing.push({ file: fileName, status: res.statusCode });
      }
      resolve();
    }).on('error', (err) => {
      missing.push({ file: fileName, error: err.message });
      resolve();
    });
  });
}

async function main() {
  console.log('正在检查音频文件...\n');
  
  // 分批检查，每批10个
  for (let i = 0; i < audioFiles.length; i += 10) {
    const batch = audioFiles.slice(i, i + 10);
    await Promise.all(batch.map(checkFile));
    process.stdout.write(`\r已检查: ${Math.min(i + 10, audioFiles.length)}/${audioFiles.length}`);
  }
  
  console.log('\n\n=== 音频文件检查结果 ===\n');
  console.log(`✅ 存在的文件: ${found.length}`);
  console.log(`❌ 缺失的文件: ${missing.length}\n`);
  
  if (missing.length > 0) {
    console.log('=== 缺失的音频文件 ===\n');
    for (const m of missing) {
      console.log(`  ${m.file}`);
    }
    console.log('\n这些文件需要上传到 COS！');
  }
}

main();
