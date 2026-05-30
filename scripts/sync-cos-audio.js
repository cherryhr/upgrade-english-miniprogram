#!/usr/bin/env node

/**
 * COS音频同步脚本
 * 功能：
 * 1. 检查本地音频与COS已有文件的差异
 * 2. 上传缺失的音频文件到COS
 * 3. 生成同步报告
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// ========== COS配置 ==========
const COS_CONFIG = {
  SecretId: process.env.TENCENT_SECRET_ID || '',
  SecretKey: process.env.TENCENT_SECRET_KEY || '',
  Bucket: 'upgrade-videos-1412449710',
  Region: 'ap-guangzhou',
  BaseUrl: 'https://upgrade-videos-1412449710.cos.ap-guangzhou.myqcloud.com',
  TTS_PATH: '/TTS/',
  SONGS_PATH: '/Songs/'
};

// 项目路径
const PROJECT_ROOT = '/Users/huangrong/Desktop/upgrade-english-miniprogram';
const LOCAL_TTS_DIR = path.join(PROJECT_ROOT, 'tts_audio');

// ========== 工具函数 ==========

// 检查文件是否存在
function checkFileExists(url) {
  return new Promise((resolve) => {
    https.get(url, { method: 'HEAD', timeout: 5000 }, (res) => {
      resolve({ exists: res.statusCode === 200, status: res.statusCode });
    }).on('error', () => {
      resolve({ exists: false, error: true });
    });
  });
}

// 获取本地音频文件列表
function getLocalAudioFiles() {
  try {
    const files = fs.readdirSync(LOCAL_TTS_DIR);
    return files.filter(f => f.endsWith('.mp3')).map(f => ({
      name: f,
      path: path.join(LOCAL_TTS_DIR, f)
    }));
  } catch (err) {
    console.error('❌ 读取本地目录失败:', err.message);
    return [];
  }
}

// 主函数
async function main() {
  console.log('🔄 UpGrade English - COS音频同步工具\n');
  console.log('=' .repeat(50));
  
  // 1. 获取本地文件列表
  console.log('\n📁 获取本地音频文件...');
  const localFiles = getLocalAudioFiles();
  console.log(`✅ 本地音频文件: ${localFiles.length} 个`);
  
  // 2. 读取cos_missing_files.json
  console.log('\n📋 读取缺失文件清单...');
  const missingFiles = JSON.parse(
    fs.readFileSync(path.join(PROJECT_ROOT, 'cos_missing_files.json'), 'utf-8')
  );
  console.log(`✅ 缺失文件清单: ${missingFiles.length} 个`);
  
  // 3. 分类文件
  const needUpload = [];
  const alreadyExists = [];
  const localNotFound = [];
  
  console.log('\n🔍 检查每个文件的状态...');
  
  for (const file of missingFiles) {
    // 检查本地是否存在
    const localPath = path.join(LOCAL_TTS_DIR, file);
    if (!fs.existsSync(localPath)) {
      localNotFound.push(file);
      continue;
    }
    
    // 检查COS是否存在
    const cosUrl = COS_CONFIG.BaseUrl + COS_CONFIG.TTS_PATH + file;
    const result = await checkFileExists(cosUrl);
    
    if (result.exists) {
      alreadyExists.push(file);
    } else {
      needUpload.push({ local: file, cos: cosUrl });
    }
  }
  
  // 4. 输出报告
  console.log('\n' + '='.repeat(50));
  console.log('📊 同步状态报告\n');
  
  console.log(`✅ COS已存在: ${alreadyExists.length} 个`);
  console.log(`⬆️  需要上传: ${needUpload.length} 个`);
  console.log(`❌ 本地不存在: ${localNotFound.length} 个`);
  
  if (localNotFound.length > 0) {
    console.log('\n⚠️ 本地缺失的文件:');
    localNotFound.slice(0, 10).forEach(f => console.log(`   - ${f}`));
    if (localNotFound.length > 10) {
      console.log(`   ... 还有 ${localNotFound.length - 10} 个`);
    }
  }
  
  // 5. 生成上传命令
  if (needUpload.length > 0) {
    console.log('\n📝 需要上传的文件列表:');
    console.log(JSON.stringify(needUpload.map(f => f.local), null, 2));
    
    // 保存需要上传的文件清单
    const uploadListPath = path.join(PROJECT_ROOT, 'cos_upload_list.json');
    fs.writeFileSync(uploadListPath, JSON.stringify(needUpload.map(f => f.local), null, 2));
    console.log(`\n💾 上传清单已保存: ${uploadListPath}`);
  }
  
  // 6. 生成完整文件清单
  console.log('\n📝 生成完整文件清单...');
  const allLocalFiles = localFiles.map(f => f.name);
  const allFilesListPath = path.join(PROJECT_ROOT, 'all_tts_files.json');
  fs.writeFileSync(allFilesListPath, JSON.stringify(allLocalFiles, null, 2));
  console.log(`💾 完整清单已保存: ${allFilesListPath}`);
  
  console.log('\n' + '='.repeat(50));
  console.log('✨ 检查完成！');
  console.log('\n下一步:');
  console.log('1. 如果需要上传文件，运行: node upload-to-cos.js');
  console.log('2. 上传脚本会自动使用COS SDK上传所有缺失的音频');
  console.log('='.repeat(50));
}

main().catch(console.error);
