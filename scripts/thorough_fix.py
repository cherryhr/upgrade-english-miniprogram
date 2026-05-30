#!/usr/bin/env python3
"""
彻底解决音频与文字不一致问题
策略：分析COS上的所有音频，提取文件名中的文本，建立完全一致的映射
"""

import json
import re
import os

# COS API 配置
SECRET_ID = os.environ.get("TENCENT_SECRET_ID", "")
SECRET_KEY = os.environ.get("TENCENT_SECRET_KEY", "")
BUCKET = "upgrade-videos-1412449710"
REGION = "ap-guangzhou"

def get_audio_files_from_cos():
    """从COS获取所有音频文件列表"""
    import tkinter as tk
    from tkinter import messagebox

    # 尝试使用cos-python-sdk-v5
    try:
        from qcloud_cos import CosConfig, CosS3Client

        config = CosConfig(
            Region=REGION,
            SecretId=SECRET_ID,
            SecretKey=SECRET_KEY,
            Token=None,
            Scheme='https'
        )
        client = CosS3Client(config)

        response = client.list_objects(
            Bucket=BUCKET,
            Prefix='TTS/'
        )

        files = []
        if 'Contents' in response:
            for item in response['Contents']:
                key = item['Key']
                if key.endswith('.mp3') or key.endswith('.m4a'):
                    # 提取文件名（不含路径和扩展名）
                    filename = os.path.basename(key)
                    files.append(filename)

        return files
    except ImportError:
        print("需要安装腾讯云COS SDK: pip install -U qcloud-python-sdk-v5")
        return []

def filename_to_text(filename):
    """将音频文件名转换为可读文本（用于分析）"""
    # 移除扩展名
    name = os.path.splitext(filename)[0]

    # 将下划线替换为空格
    text = name.replace('_', ' ')

    return text

def analyze_audio_files():
    """分析COS上的所有音频文件"""
    print("=" * 60)
    print("从COS获取音频文件列表...")
    print("=" * 60)

    files = get_audio_files_from_cos()

    if not files:
        print("无法从COS获取文件列表，使用本地文件替代...")
        # 使用本地TTS音频目录
        tts_dir = "/Users/huangrong/Desktop/upgrade-english-miniprogram/tts_audio"
        if os.path.exists(tts_dir):
            files = [f for f in os.listdir(tts_dir) if f.endswith('.mp3') or f.endswith('.m4a')]
        else:
            print("本地TTS目录也不存在，请检查路径")
            return []

    print(f"\n找到 {len(files)} 个音频文件\n")

    # 按文件名模式分类
    patterns = {
        'words': [],
        'sentences': [],
        'songs': [],
        'other': []
    }

    for f in sorted(files):
        name_lower = f.lower()
        if 'song' in name_lower or 'lyric' in name_lower:
            patterns['songs'].append(f)
        elif any(x in name_lower for x in ['hello', 'name', 'age', 'count', 'color', 'red', 'blue', 'green', 'yellow', 'animal', 'body', 'food', 'toy', 'family', 'feel', 'mood', 'clap', 'wave', 'jump', 'eye', 'nose', 'mouth', 'ear', 'hand', 'foot', 'head', 'arm', 'leg', 'finger']):
            patterns['words'].append(f)
        else:
            patterns['sentences'].append(f)

    return files, patterns

def scan_units_data():
    """扫描units-data.js获取所有需要发音的文本"""
    units_file = "/Users/huangrong/Desktop/upgrade-english-miniprogram/utils/units-data.js"

    texts_needed = {
        'words': set(),
        'sentences': set()
    }

    with open(units_file, 'r') as f:
        content = f.read()

    # 提取所有英文文本
    # 匹配 "en: '...'" 或 "en: \"...\""

    # 提取单词
    word_matches = re.findall(r"icon:\s*'[🏀🎯🌟💫]'\s*,\s*en:\s*['\"]([^'\"]+)['\"]", content)
    for w in word_matches:
        clean = w.strip()
        if clean:
            texts_needed['words'].add(clean)

    # 提取句型问答
    qa_matches = re.findall(r"q:\s*\{[^}]*en:\s*['\"]([^'\"]+)['\"]", content)
    a_matches = re.findall(r"a:\s*\{[^}]*en:\s*['\"]([^'\"]+)['\"]", content)

    for q in qa_matches:
        clean = q.strip()
        if clean:
            texts_needed['sentences'].add(clean)
    for a in a_matches:
        clean = a.strip()
        if clean:
            texts_needed['sentences'].add(clean)

    return texts_needed

def check_consistency():
    """检查一致性并生成报告"""
    print("\n" + "=" * 60)
    print("检查音频与文字一致性")
    print("=" * 60)

    audio_files, patterns = analyze_audio_files()

    if not audio_files:
        print("无法获取音频文件列表")
        return

    # 扫描需要的文本
    texts_needed = scan_units_data()

    print(f"\n📋 units-data.js 需要发音的文本:")
    print(f"   - 词汇: {len(texts_needed['words'])} 个")
    print(f"   - 句型: {len(texts_needed['sentences'])} 个")

    # 创建文件名到文本的映射（从现有tts.js提取）
    tts_file = "/Users/huangrong/Desktop/upgrade-english-miniprogram/utils/tts.js"
    audio_to_text = {}

    with open(tts_file, 'r') as f:
        tts_content = f.read()

    # 提取所有映射
    mappings = re.findall(r'\{\s*text:\s*["\']([^"\']+)["\']\s*,\s*file:\s*["\']([^"\']+)["\']\s*\}', tts_content)

    for text, file in mappings:
        if file not in audio_to_text:
            audio_to_text[file] = []
        audio_to_text[file].append(text.lower())

    # 检查问题
    issues = []

    print("\n🔍 检查 units-data.js 中的文本是否与COS音频对应...")

    # 检查词汇
    for word in sorted(texts_needed['words']):
        # 转换为文件名格式
        filename_candidate = word.lower().replace(' ', '_') + '.mp3'
        filename_candidate2 = word.lower().replace(' ', '_') + '.m4a'

        if filename_candidate in audio_files or filename_candidate2 in audio_files:
            # 找到了文件，检查映射
            file_key = filename_candidate if filename_candidate in audio_files else filename_candidate2
            if file_key in audio_to_text:
                mappings_for_file = audio_to_text[file_key]
                clean_word = word.lower().strip()
                if clean_word not in [m.strip() for m in mappings_for_file]:
                    issues.append({
                        'type': 'word',
                        'text': word,
                        'file': file_key,
                        'issue': f"COS有文件但映射中不存在此文本，当前映射: {mappings_for_file}"
                    })

    # 检查句型
    for sentence in sorted(texts_needed['sentences']):
        # 转换为文件名格式
        filename_candidate = sentence.lower().replace(' ', '_').replace('.', '').replace(',', '').replace('?', '').replace('!', '').replace("'", '')[:50] + '.mp3'
        filename_candidate2 = sentence.lower().replace(' ', '_').replace('.', '').replace(',', '').replace('?', '').replace('!', '').replace("'", '')[:50] + '.m4a'

        # 简化：检查任何包含关键词的音频文件
        for audio_file in audio_files:
            if sentence.lower()[:20] in audio_to_text.get(audio_file, []):
                break
        else:
            # 没找到对应的音频
            issues.append({
                'type': 'sentence',
                'text': sentence,
                'file': 'NOT_FOUND',
                'issue': 'units-data.js中有此句型但COS上未找到对应音频文件'
            })

    print(f"\n📊 一致性检查结果:")
    print(f"   - 发现问题: {len(issues)} 个")

    if issues:
        print("\n⚠️ 需要修复的问题:")
        for i, issue in enumerate(issues[:20], 1):
            print(f"\n   {i}. [{issue['type'].upper()}]")
            print(f"      文本: {issue['text']}")
            print(f"      文件: {issue['file']}")
            print(f"      问题: {issue['issue']}")

    return issues, audio_files, texts_needed

def generate_fixed_mapping():
    """生成修复后的映射"""
    print("\n" + "=" * 60)
    print("生成修复方案")
    print("=" * 60)

    audio_files, patterns = analyze_audio_files()
    texts_needed = scan_units_data()

    # 策略：以COS上的实际音频文件为准，修改units-data.js中的文本
    fixes = []

    # 读取当前的tts.js
    tts_file = "/Users/huangrong/Desktop/upgrade-english-miniprogram/utils/tts.js"
    with open(tts_file, 'r') as f:
        tts_content = f.read()

    # 提取所有唯一的音频文件和其对应的文本
    audio_text_map = {}
    mappings = re.findall(r'\{\s*text:\s*["\']([^"\']+)["\']\s*,\s*file:\s*["\']([^"\']+)["\']\s*\}', tts_content)

    for text, file in mappings:
        if file not in audio_text_map:
            audio_text_map[file] = set()
        audio_text_map[file].add(text.lower().strip())

    # 对于每个COS上的音频文件，确定"正确"的文本
    correct_text_for_file = {}

    for audio_file in audio_files:
        base_name = os.path.splitext(audio_file)[0].replace('_', ' ')
        if audio_file in audio_text_map:
            # 使用映射中的第一个文本
            correct_text_for_file[audio_file] = list(audio_text_map[audio_file])[0]
        else:
            correct_text_for_file[audio_file] = base_name

    print(f"\n📁 COS上共有 {len(audio_files)} 个音频文件")
    print(f"📝 tts.js中有 {len(audio_text_map)} 个映射")

    # 生成修复报告
    print("\n" + "=" * 60)
    print("修复建议")
    print("=" * 60)

    return audio_files, correct_text_for_file, audio_text_map

if __name__ == "__main__":
    issues, audio_files, texts_needed = check_consistency()

    print("\n" + "=" * 60)
    print("彻底解决方案")
    print("=" * 60)

    print("""
方案：建立"单一真相来源"

1. 以COS上的音频文件为"真相来源"
   - 每个音频文件对应一个确切的文本
   - 修改 units-data.js 使其与音频完全一致

2. 清理 tts.js 中的重复映射
   - 同一个音频文件只保留一个映射
   - 使用 COS 上的实际音频内容

3. 确保 cleanText 函数正确处理所有标点
   - 统一去除标点：! , . ? 等
   - 保持小写

需要执行的操作：
a) 分析每个音频文件的实际发音内容
b) 创建完整的"音频→文本"映射表
c) 修改 units-data.js 中的所有不一致文本
d) 清理 tts.js 中的重复映射
e) 重新部署到COS（如需要）
    """)
