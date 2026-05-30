#!/usr/bin/env node
/**
 * TTS 映射验证脚本
 */

const fs = require('fs');
const content = fs.readFileSync(__dirname + '/../utils/tts.js', 'utf8');

// 复制 cleanText 函数
function cleanText(text) {
  if (!text) return '';
  let clean = text
    .replace(/!/g, '')
    .replace(/"/g, "'")
    .replace(/'/g, '')
    .replace(/:/g, ' ')
    .replace(/;/g, '')
    .replace(/[【】]/g, '')
    .replace(/[（）()]/g, '')
    .replace(/[，。]/g, ',')
    .replace(/,/g, ' ')
    .replace(/[.。]+/g, '.')
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (clean.length > 100) {
    clean = clean.substring(0, 100);
  }
  return clean;
}

// 提取 fullMap
const fullMapStart = content.indexOf('const fullMap = [');
const fullMapEnd = content.indexOf('];', fullMapStart);
const fullMapContent = content.substring(fullMapStart + 17, fullMapEnd + 2);

const fullMap = [];
const textFilePattern = /\{\s*text:\s*"([^"]+)"\s*,\s*file:\s*"([^"]+)"\s*\}/g;
let match;
while ((match = textFilePattern.exec(fullMapContent)) !== null) {
  fullMap.push({ text: match[1], file: match[2] });
}

console.log('='.repeat(60));
console.log('TTS 映射验证');
console.log('='.repeat(60));
console.log('\n✅ fullMap 条目: ' + fullMap.length);

// 模拟 getCosFilename
function getCosFilename(text) {
  if (!text) return null;
  let clean = cleanText(text);
  if (!clean) return null;
  const lower = clean.toLowerCase();

  for (const item of fullMap) {
    if (lower === item.text) {
      return item.file;
    }
  }
  return null;
}

// 测试用例
const tests = [
  'Hi',
  'hello',
  'My name is Lily. What about you?',
  'Who knows the answer? Hands up',
  'What is your name?',
  'Here is my nose Right here in the middle of my face',
];

console.log('\n测试结果:');
console.log('-'.repeat(60));

let passed = 0;
tests.forEach(function(t) {
  const result = getCosFilename(t);
  const status = result ? '✅' : '❌';
  console.log(status + ' "' + t + '"');
  console.log('   -> ' + (result || 'NULL'));
  if (result) passed++;
});

console.log('\n' + '='.repeat(60));
console.log('通过: ' + passed + '/' + tests.length);
console.log('='.repeat(60));

// 读取 units-data.js 验证所有文本
const unitsContent = fs.readFileSync(__dirname + '/../utils/units-data.js', 'utf8');
const texts = new Set();

// 提取文本
let m;
const doublePattern = /en:\s*"([^"]+)"/g;
while ((m = doublePattern.exec(unitsContent)) !== null) {
  texts.add(m[1]);
}

const singlePattern = /en:\s*'([^']+)'/g;
while ((m = singlePattern.exec(unitsContent)) !== null) {
  if (!m[1].includes("'")) {
    texts.add(m[1]);
  }
}

console.log('\n验证 units-data.js 所有文本:');
console.log('-'.repeat(60));

let allMatch = true;
texts.forEach(function(text) {
  const result = getCosFilename(text);
  if (!result) {
    console.log('❌ "' + text + '" -> NULL');
    allMatch = false;
  }
});

if (allMatch) {
  console.log('✅ 所有 ' + texts.size + ' 个文本都有映射！');
}
