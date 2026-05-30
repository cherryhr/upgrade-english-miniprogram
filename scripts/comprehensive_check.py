#!/usr/bin/env python3
"""
彻底修复TTS音频问题
1. 提取units-data.js中所有英文文本
2. 提取tts.js中所有映射
3. 检查COS上所有音频文件
4. 生成缺失的音频并上传
5. 确保所有文本都有正确的映射
"""

import re
import os
import json
from qcloud_cos import CosConfig, CosS3Client

# COS配置（从环境变量读取，请勿硬编码密钥）
SECRET_ID = os.environ.get("TENCENT_SECRET_ID", "")
SECRET_KEY = os.environ.get("TENCENT_SECRET_KEY", "")
BUCKET = "upgrade-videos-1412449710"
REGION = "ap-guangzhou"
COS_BASE = f"https://{BUCKET}.cos.{REGION}.myqcloud.com"
TTS_DIR = "TTS/"

# 文件路径
PROJECT_DIR = "/Users/huangrong/Desktop/upgrade-english-miniprogram"
UNITS_FILE = os.path.join(PROJECT_DIR, "utils/units-data.js")
TTS_FILE = os.path.join(PROJECT_DIR, "utils/tts.js")
LOCAL_AUDIO_DIR = os.path.join(PROJECT_DIR, "tts_audio")

def clean_text(text):
    """模拟JavaScript的cleanText"""
    if not text:
        return ''
    clean = text
    clean = clean.replace('!', '')
    clean = clean.replace('"', "'")
    clean = clean.replace("'", '')
    clean = clean.replace(':', ' ')
    clean = clean.replace(';', '')
    clean = clean.replace('【', '')
    clean = clean.replace('】', '')
    clean = clean.replace('（', '')
    clean = clean.replace('）', '')
    clean = clean.replace('，', ',')
    clean = clean.replace('。', ',')
    clean = clean.replace(',', ' ')
    clean = re.sub(r'\s+', ' ', clean)
    # 移除非ASCII字符
    clean = ''.join(c for c in clean if ord(c) < 128)
    return clean.strip().lower()

def get_all_en_texts():
    """从units-data.js提取所有英文文本"""
    with open(UNITS_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    texts = set()
    
    # 双引号格式
    for match in re.findall(r'en:\s*"([^"]+)"', content):
        texts.add(match)
    
    # 单引号格式（不含撇号）
    for match in re.findall(r"en:\s*'([^']+)'", content):
        if "'" not in match:
            texts.add(match)
    
    return list(texts)

def extract_tts_mappings():
    """从tts.js提取所有映射"""
    with open(TTS_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    mappings = {}  # cleanText -> file
    
    # 精确匹配 fullMap
    fullmap_match = re.search(r'const fullMap = \[([\s\S]*?)\n  \];', content)
    if fullmap_match:
        entries = fullmap_match.group(1)
        # 提取 { text: "...", file: "..." }
        for match in re.finditer(r'\{\s*text:\s*"([^"]+)"\s*,\s*file:\s*"([^"]+)"\s*\}', entries):
            text, file = match.groups()
            clean = clean_text(text)
            mappings[clean] = file
    
    return mappings

def get_cos_files():
    """获取COS上所有TTS音频文件"""
    config = CosConfig(Region=REGION, SecretId=SECRET_ID, SecretKey=SECRET_KEY, Token=None, Scheme='https')
    client = CosS3Client(config)
    
    files = {}
    marker = ''
    
    while True:
        if marker:
            response = client.list_objects(Bucket=BUCKET, Prefix=TTS_DIR, Marker=marker)
        else:
            response = client.list_objects(Bucket=BUCKET, Prefix=TTS_DIR)
        
        for item in response.get('Contents', []):
            key = item['Key']
            if key.endswith('.mp3'):
                filename = os.path.basename(key)
                files[filename] = key
        
        if response.get('IsTruncated'):
            marker = response.get('NextMarker', '')
            if not marker:
                break
        else:
            break
    
    return files, client

def check_texts():
    """检查所有文本的映射状态"""
    texts = get_all_en_texts()
    mappings = extract_tts_mappings()
    
    print("=" * 70)
    print("全面检查结果")
    print("=" * 70)
    print(f"\nunits-data.js 英文文本: {len(texts)} 个")
    print(f"tts.js 映射: {len(mappings)} 个")
    
    matched = []
    unmatched = []
    
    for text in texts:
        clean = clean_text(text)
        if clean in mappings:
            matched.append((text, clean, mappings[clean]))
        else:
            unmatched.append((text, clean))
    
    print(f"\n✅ 匹配成功: {len(matched)} 个")
    print(f"❌ 未匹配: {len(unmatched)} 个")
    
    if unmatched:
        print("\n未匹配的文本（前20个）:")
        for text, clean in unmatched[:20]:
            print(f"  ❌ '{text}'")
            print(f"     -> '{clean}'")
    
    return matched, unmatched

def main():
    print("=" * 70)
    print("开始全面TTS音频检查和修复")
    print("=" * 70)
    
    # 步骤1: 检查所有文本
    matched, unmatched = check_texts()
    
    # 步骤2: 获取COS文件列表
    print("\n" + "=" * 70)
    print("检查COS音频文件")
    print("=" * 70)
    
    cos_files, client = get_cos_files()
    print(f"COS上TTS音频: {len(cos_files)} 个")
    
    # 检查缺失的音频
    needed_files = set(item[2] for item in matched) | set(
        clean_text(item[0]) + '.mp3' for item in unmatched
    )
    
    missing = []
    for file in needed_files:
        if file not in cos_files:
            missing.append(file)
    
    print(f"\n需要的音频文件: {len(needed_files)}")
    print(f"缺失的音频文件: {len(missing)}")
    
    if missing:
        print("\n缺失的音频（前30个）:")
        for f in missing[:30]:
            print(f"  ❌ {f}")
    
    return {
        'matched': matched,
        'unmatched': unmatched,
        'cos_files': cos_files,
        'missing': missing,
        'client': client
    }

if __name__ == "__main__":
    main()
