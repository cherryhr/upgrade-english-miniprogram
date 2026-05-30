// 完整的 TTS 映射检查脚本
const fs = require('fs');

// 复制 cleanText 函数
function cleanText(text) {
  if (!text) return '';
  let clean = text
    .replace(/!/g, '')
    .replace(/"/g, "'")
    .replace(/'/g, '')  // 移除撇号
    .replace(/:/g, ' ')
    .replace(/;/g, '')
    .replace(/[【】]/g, '')
    .replace(/[（）()]/g, '')
    .replace(/[，。]/g, ',')
    .replace(/,/g, ' ')
    .replace(/[.。]+/g, '.')
    .replace(/[^\x00-\x7F]/g, '')  // 移除所有非ASCII字符（包括emoji）
    .replace(/\s+/g, ' ')
    .trim();
  if (clean.length > 100) {
    clean = clean.substring(0, 100);
  }
  return clean;
}

// 读取数据文件
const unitsData = require('../utils/units-data.js');
const ttsContent = fs.readFileSync('../utils/tts.js', 'utf8');

// 提取 fullMap 中的所有映射
const fullMapMatches = ttsContent.match(/text:\s*"([^"]+)"/g) || [];
const fullMapTexts = fullMapMatches.map(m => m.match(/"([^"]+)"/)[1].toLowerCase());

// 提取 prefixMap 中的所有前缀
const prefixMapMatches = ttsContent.match(/prefix:\s*"([^"]+)"/g) || [];
const prefixMapTexts = prefixMapMatches.map(m => m.match(/"([^"]+)"/)[1].toLowerCase());

// 提取所有英文文本
function extractTexts(units) {
  const texts = [];
  
  for (const unit of units) {
    // vocab
    if (unit.vocab) {
      for (const v of unit.vocab) {
        if (v.en) texts.push({ type: 'vocab', unit: unit.id, text: v.en });
      }
    }
    
    // sentences
    if (unit.sentences) {
      for (const s of unit.sentences) {
        if (s.type === 'qa') {
          if (s.q && s.q.en) texts.push({ type: 'qa-q', unit: unit.id, text: s.q.en });
          if (s.a && s.a.en) texts.push({ type: 'qa-a', unit: unit.id, text: s.a.en });
        } else if (s.en) {
          texts.push({ type: 'standalone', unit: unit.id, text: s.en });
        }
      }
    }
    
    // song
    if (unit.song && unit.song.lines) {
      for (const line of unit.song.lines) {
        if (line.text) texts.push({ type: 'song', unit: unit.id, text: line.text });
      }
    }
  }
  
  return texts;
}

const allTexts = extractTexts(unitsData.UNITS);

// 检查每个文本
const missing = [];
const found = [];

for (const item of allTexts) {
  const cleaned = cleanText(item.text).toLowerCase();
  
  // 检查是否在 fullMap 中
  const inFullMap = fullMapTexts.some(t => t === cleaned || t.includes(cleaned) || cleaned.includes(t));
  
  // 检查是否在 prefixMap 中
  const inPrefixMap = prefixMapTexts.some(p => cleaned.startsWith(p));
  
  if (!inFullMap && !inPrefixMap) {
    missing.push({ ...item, cleaned });
  } else {
    found.push({ ...item, cleaned });
  }
}

console.log('=== TTS 映射完整检查报告 ===\n');
console.log(`总文本数: ${allTexts.length}`);
console.log(`有映射: ${found.length}`);
console.log(`缺失映射: ${missing.length}\n`);

if (missing.length > 0) {
  console.log('=== 缺失映射的文本 ===\n');
  for (const m of missing) {
    console.log(`[${m.type}] [${m.unit}] "${m.text}"`);
    console.log(`  → cleaned: "${m.cleaned}"\n`);
  }
} else {
  console.log('✅ 所有文本都有 TTS 映射！\n');
}

// 输出需要添加的映射
if (missing.length > 0) {
  console.log('=== 需要添加的 TTS 映射 ===\n');
  console.log('在 fullMap 数组中添加以下映射：\n');
  for (const m of missing) {
    const fileName = m.cleaned.replace(/\s+/g, '_').replace(/\./g, '') + '.mp3';
    console.log(`    { text: "${m.cleaned}", file: "${fileName}" },`);
  }
}
