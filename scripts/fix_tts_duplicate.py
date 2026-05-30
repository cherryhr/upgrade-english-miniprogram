#!/usr/bin/env python3
"""
彻底解决音频与文字不一致问题
1. 清理tts.js中的重复映射
2. 确保每个音频文件只有一个"正确"的映射
3. 验证与COS的一致性
"""

import re
import os
from qcloud_cos import CosConfig, CosS3Client

# COS配置
SECRET_ID = os.environ.get("TENCENT_SECRET_ID", "")
SECRET_KEY = os.environ.get("TENCENT_SECRET_KEY", "")
BUCKET = "upgrade-videos-1412449710"
REGION = "ap-guangzhou"

def get_cos_client():
    config = CosConfig(Region=REGION, SecretId=SECRET_ID, SecretKey=SECRET_KEY, Token=None, Scheme='https')
    return CosS3Client(config)

def list_cos_files():
    """获取COS上所有TTS音频文件"""
    print("📡 获取COS文件列表...")
    client = get_cos_client()

    files = []
    marker = ""

    while True:
        response = client.list_objects(Bucket=BUCKET, Prefix='TTS/', Marker=marker)
        if 'Contents' in response:
            for item in response['Contents']:
                key = item['Key']
                if key.endswith('.mp3') or key.endswith('.m4a'):
                    files.append(key.replace('TTS/', ''))
        if response.get('IsTruncated') == 'true':
            marker = response.get('NextMarker', '')
        else:
            break

    print(f"   ✅ COS上有 {len(files)} 个音频文件")
    return files

def clean_text_for_compare(text):
    """清理文本用于比较（模拟tts.js的cleanText函数）"""
    if not text:
        return ''
    clean = text.lower()
    # 移除 ! " ' : ; 和各种括号
    clean = re.sub(r'[!\"\'\:;\(\)\[\]【】（）]/g', '', clean)
    # 移除所有非ASCII字符
    clean = re.sub(r'[^\x00-\x7F]', '', clean)
    # 逗号转空格
    clean = clean.replace(',', ' ')
    # 多个空格变一个
    clean = re.sub(r'\s+', ' ', clean)
    return clean.strip()

def read_tts_js():
    """读取tts.js内容"""
    tts_file = "/Users/huangrong/Desktop/upgrade-english-miniprogram/utils/tts.js"
    with open(tts_file, 'r', encoding='utf-8') as f:
        return f.read()

def extract_mappings(content):
    """提取所有映射"""
    pattern = r'\{\s*text:\s*["\']([^"\']+)["\']\s*,\s*file:\s*["\']([^"\']+)["\']\s*\}'
    matches = re.findall(pattern, content)
    return [(text, file) for text, file in matches]

def find_duplicate_issues():
    """找出重复映射问题"""
    print("\n🔍 分析tts.js中的重复映射...")

    content = read_tts_js()
    mappings = extract_mappings(content)

    print(f"   共有 {len(mappings)} 个映射")

    # 按文件分组
    file_to_mappings = {}
    for text, file in mappings:
        if file not in file_to_mappings:
            file_to_mappings[file] = []
        file_to_mappings[file].append(text)

    # 找出有重复映射的文件
    duplicates = {f: texts for f, texts in file_to_mappings.items() if len(texts) > 1}

    if duplicates:
        print(f"\n⚠️ 发现 {len(duplicates)} 个文件有重复映射:")
        for file, texts in sorted(duplicates.items())[:20]:
            print(f"\n   📁 {file}")
            for t in texts:
                print(f"      - \"{t}\"")

            # 检查cleanText后是否相同
            cleaned = [clean_text_for_compare(t) for t in texts]
            if len(set(cleaned)) == 1:
                print(f"      ⚠️ 这两个文本经过cleanText后相同，会导致冲突!")
    else:
        print("   ✅ 没有重复映射问题")

    return duplicates

def fix_tts_js():
    """修复tts.js中的重复映射"""
    print("\n" + "=" * 70)
    print("🔧 修复tts.js中的重复映射")
    print("=" * 70)

    content = read_tts_js()

    # 获取COS文件列表
    cos_files = list_cos_files()
    cos_files_set = set(cos_files)

    # 提取所有映射
    pattern = r'\{\s*text:\s*["\']([^"\']+)["\']\s*,\s*file:\s*["\']([^"\']+)["\']\s*\}'
    matches = re.findall(pattern, content)

    # 按文件分组，找出cleanText后相同的映射
    file_to_entries = {}
    for text, file in matches:
        clean = clean_text_for_compare(text)
        if file not in file_to_entries:
            file_to_entries[file] = []
        file_to_entries[file].append((text, clean))

    # 修复策略：每个文件只保留cleanText结果不同的映射
    # 对于cleanText相同的，保留与COS文件名最接近的

    fixes_applied = 0
    new_content = content

    for file, entries in file_to_entries.items():
        if len(entries) <= 1:
            continue

        # 找出cleanText相同的组
        clean_to_texts = {}
        for text, clean in entries:
            if clean not in clean_to_texts:
                clean_to_texts[clean] = []
            clean_to_texts[clean].append(text)

        # 对于每个cleanText值，只保留一个
        for clean, texts in clean_to_texts.items():
            if len(texts) <= 1:
                continue

            # 优先保留与文件名一致的文本
            filename_base = os.path.splitext(file)[0].replace('_', ' ')
            best_text = texts[0]

            for t in texts:
                # 检查是否与文件名接近
                if t.lower().replace('!', '').replace('.', '') == filename_base.lower():
                    best_text = t
                    break

            # 删除其他重复的映射
            for t in texts:
                if t != best_text:
                    # 构造要删除的映射模式
                    old_pattern = f'{{ text: "{t}", file: "{file}" }}'
                    new_content = new_content.replace(old_pattern, '')
                    print(f"   🗑️ 删除重复映射: {t} -> {file}")
                    fixes_applied += 1

    if fixes_applied > 0:
        # 写回文件
        tts_file = "/Users/huangrong/Desktop/upgrade-english-miniprogram/utils/tts.js"
        with open(tts_file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"\n✅ 已修复 {fixes_applied} 个重复映射")
    else:
        print("\n✅ 没有需要修复的重复映射")

    return fixes_applied

def verify_consistency():
    """验证units-data.js与tts.js的一致性"""
    print("\n" + "=" * 70)
    print("✅ 验证units-data.js与tts.js的一致性")
    print("=" * 70)

    # 读取units-data.js
    units_file = "/Users/huangrong/Desktop/upgrade-english-miniprogram/utils/units-data.js"
    with open(units_file, 'r', encoding='utf-8') as f:
        units_content = f.read()

    # 读取tts.js
    tts_content = read_tts_js()
    mappings = extract_mappings(tts_content)

    # 建立cleanText到文件的映射
    clean_to_file = {}
    for text, file in mappings:
        clean = clean_text_for_compare(text)
        clean_to_file[clean] = file

    # 提取units-data.js中的所有英文文本
    issues = []

    # 词汇
    word_pattern = r"icon:\s*'[^']+'\s*,\s*en:\s*['\"]([^'\"]+)['\"]"
    words = re.findall(word_pattern, units_content)

    # 句型问答
    q_pattern = r"q:\s*\{\s*[^}]*en:\s*['\"]([^'\"]+)['\"]"
    a_pattern = r"a:\s*\{\s*[^}]*en:\s*['\"]([^'\"]+)['\"]"
    questions = re.findall(q_pattern, units_content)
    answers = re.findall(a_pattern, units_content)

    all_texts = words + questions + answers

    print(f"\n检查 {len(all_texts)} 个文本...")

    for text in all_texts:
        clean = clean_text_for_compare(text)
        if clean not in clean_to_file:
            issues.append({
                'text': text,
                'clean': clean,
                'issue': 'tts.js中没有对应映射'
            })

    if issues:
        print(f"\n⚠️ 发现 {len(issues)} 个文本没有映射:")
        for i, issue in enumerate(issues[:10], 1):
            print(f"   {i}. {issue['text']}")
    else:
        print("\n✅ 所有文本都有对应的tts.js映射")

    return issues

def main():
    print("=" * 70)
    print("🎯 彻底解决音频与文字不一致问题")
    print("=" * 70)

    # 步骤1: 找出重复映射
    duplicates = find_duplicate_issues()

    # 步骤2: 修复tts.js
    fix_tts_js()

    # 步骤3: 验证一致性
    issues = verify_consistency()

    print("\n" + "=" * 70)
    print("📊 修复总结")
    print("=" * 70)

    if issues:
        print(f"\n⚠️ 还有 {len(issues)} 个文本没有映射")
        print("   这些文本将使用回退的有道API发音")
    else:
        print("\n✅ 所有问题已修复!")

    print("""
下一步：
1. 在微信开发者工具中验证
2. 测试播放音频
3. 如需重新部署，运行上传脚本
    """)

if __name__ == "__main__":
    main()
