#!/usr/bin/env python3
"""
检查TTS音频与units-data.js中文本的一致性
"""
import json
import re
import subprocess

# 读取units-data.js中的句子
def extract_sentences_from_units():
    sentences = []
    with open('utils/units-data.js', 'r') as f:
        content = f.read()

    # 提取所有句子的en字段
    # 匹配模式: en: 'xxx' 或 en: "xxx"
    pattern = r"en:\s*['\"]([^'\"]+)['\"]"
    matches = re.findall(pattern, content)

    for m in matches:
        # 排除太短的（可能是单词不是句子）
        if len(m) > 15:
            sentences.append(m)

    return sentences

# 清理文本（模拟tts.js的cleanText函数）
def clean_text(text):
    clean = text
    clean = re.sub(r'!', '', clean)
    clean = re.sub(r'"', "'", clean)
    clean = re.sub(r"'", '', clean)
    clean = re.sub(r':', ' ', clean)
    clean = re.sub(r';', '', clean)
    clean = re.sub(r'[【】]', '', clean)
    clean = re.sub(r'[（）()（）]', '', clean)
    clean = re.sub(r'[，。]', ',', clean)
    clean = re.sub(r',', ' ', clean)
    clean = re.sub(r'[.。]+', '.', clean)
    # 移除emoji和非ASCII字符
    clean = re.sub(r'[^\x00-\x7F]', '', clean)
    clean = re.sub(r'\s+', ' ', clean).strip()
    return clean.lower()

# 读取tts.js的fullMap
def extract_tts_map():
    tts_map = {}
    with open('utils/tts.js', 'r') as f:
        content = f.read()

    # 提取text到file的映射
    pattern = r'text:\s*["\']([^"\']+)["\']\s*,\s*file:\s*["\']([^"\']+)["\']'
    matches = re.findall(pattern, content)

    for text, file in matches:
        tts_map[clean_text(text)] = file

    return tts_map

# 主函数
def main():
    sentences = extract_sentences_from_units()
    tts_map = extract_tts_map()

    print("=" * 60)
    print("检查音频与文字一致性")
    print("=" * 60)

    issues = []

    for sentence in sentences:
        original = sentence
        cleaned = clean_text(sentence)

        if cleaned in tts_map:
            audio_file = tts_map[cleaned]
            # 检查原始文本是否有感叹号但清理后没有
            if '!' in original and '!' not in cleaned:
                # 这可能是个问题 - 文字有感叹号但音频没有
                issues.append({
                    'original': original,
                    'cleaned': cleaned,
                    'audio': audio_file,
                    'issue': '文字有感叹号'
                })

    print(f"\n发现 {len(issues)} 个可能的一致性问题:\n")

    for i, issue in enumerate(issues, 1):
        print(f"{i}. 原文: {issue['original']}")
        print(f"   清理后: {issue['cleaned']}")
        print(f"   音频文件: {issue['audio']}")
        print(f"   问题: {issue['issue']}")
        print()

    # 生成需要修改的句子列表
    print("\n" + "=" * 60)
    print("需要修改的句子（去掉感叹号）:")
    print("=" * 60)

    modifications = {}
    for issue in issues:
        orig = issue['original']
        # 生成修改后的版本（去掉感叹号）
        modified = re.sub(r'!+', '!', orig)  # 保留单个感叹号
        # 或者直接去掉感叹号
        modified = orig.replace('!', '').strip()
        if modified != orig:
            modifications[orig] = modified

    for orig, mod in modifications.items():
        print(f"原文: {orig}")
        print(f"改为: {mod}")
        print()

if __name__ == '__main__':
    main()
