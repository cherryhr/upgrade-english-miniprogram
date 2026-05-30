#!/usr/bin/env node

/**
 * 验证TTS映射表完整性
 * 检查所有映射项是否有正确的text和file属性
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = '/Users/huangrong/Desktop/upgrade-english-miniprogram';
const TTS_FILE = path.join(PROJECT_ROOT, 'utils/tts.js');

console.log('🔍 验证TTS映射表完整性\n');
console.log('='.repeat(50));

// 读取文件
const content = fs.readFileSync(TTS_FILE, 'utf-8');

// 提取fullMap - 从第69行附近找到结束位置
const fullMapStart = content.indexOf('const fullMap = [');
const fullMapEndMarker = '];\n\n  // ========== 单词映射 ==========';
const fullMapEnd = content.indexOf(fullMapEndMarker, fullMapStart);

if (fullMapStart === -1) {
  console.error('❌ 未找到fullMap');
  process.exit(1);
}

const fullMapContent = content.substring(fullMapStart + 17, fullMapEnd);

// 提取prefixMap
const prefixMapStart = content.indexOf('const prefixMap = [', fullMapEnd);
const prefixMapEndMarker = '\n\n  for (const item of prefixMap)';
const prefixMapEnd = content.indexOf(prefixMapEndMarker, prefixMapStart);

const prefixMapContent = content.substring(prefixMapStart + 19, prefixMapEnd);

// 解析映射项
function parseMapItems(str) {
  const items = [];
  const regex = /\{[^}]*\}/g;
  let match;
  while ((match = regex.exec(str)) !== null) {
    const itemStr = match[0];
    try {
      const item = eval('(' + itemStr + ')');
      items.push(item);
    } catch (e) {
      // 跳过解析失败的项
    }
  }
  return items;
}

// 验证映射项
function validateMap(name, items) {
  console.log(`\n📋 ${name}: ${items.length} 项`);
  
  const issues = [];
  items.forEach((item, idx) => {
    const hasText = item.hasOwnProperty('text');
    const hasPrefix = item.hasOwnProperty('prefix');
    const hasFile = item.hasOwnProperty('file');
    
    if ((!hasText && !hasPrefix) || !hasFile) {
      issues.push({ idx, issue: '格式不完整', item });
    }
  });
  
  if (issues.length > 0) {
    console.log(`⚠️ 发现 ${issues.length} 个需检查的项`);
    return false;
  } else {
    console.log('✅ 所有项格式正确');
    return true;
  }
}

// 主验证
let allPassed = true;

// 验证fullMap
const fullMapItems = parseMapItems(fullMapContent);
if (!validateMap('fullMap (句子映射)', fullMapItems)) allPassed = false;

// 验证prefixMap
const prefixMapItems = parseMapItems(prefixMapContent);
if (!validateMap('prefixMap (前缀映射)', prefixMapItems)) allPassed = false;

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('✅ 所有映射表验证通过！');
} else {
  console.log('⚠️ 部分项需检查');
}

// 统计摘要
console.log('\n📊 统计摘要:');
console.log(`   - 句子映射: ${fullMapItems.length} 条`);
console.log(`   - 前缀映射: ${prefixMapItems.length} 条`);

// 检查函数完整性
console.log('\n📝 函数检查:');
const funcs = ['getCosFilename', 'cleanText', 'speakEnglish', 'speakWord'];
funcs.forEach(fn => {
  const regex = new RegExp(`function ${fn}\\(|${fn}\\s*\\(`, 'g');
  if (regex.test(content)) {
    console.log(`   ✅ ${fn}`);
  } else {
    console.log(`   ❌ ${fn}`);
  }
});

console.log('\n' + '='.repeat(50));
