#!/usr/bin/env python3
"""
彻底解决音频与文字不一致问题
策略：以COS音频文件为真相来源，修改units-data.js和tts.js
"""

import json
import re
import os
from qcloud_cos import CosConfig, CosS3Client

# COS配置
SECRET_ID = os.environ.get("TENCENT_SECRET_ID", "")
SECRET_KEY = os.environ.get("TENCENT_SECRET_KEY", "")
BUCKET = "upgrade-videos-1412449710"
REGION = "ap-guangzhou"

def get_cos_client():
    """获取COS客户端"""
    config = CosConfig(
        Region=REGION,
        SecretId=SECRET_ID,
        SecretKey=SECRET_KEY,
        Token=None,
        Scheme='https'
    )
    return CosS3Client(config)

def list_tts_files():
    """列出COS上TTS目录的所有文件"""
    print("正在连接COS...")
    client = get_cos_client()

    files = []
    marker = ""

    while True:
        response = client.list_objects(
            Bucket=BUCKET,
            Prefix='TTS/',
            Marker=marker
        )

        if 'Contents' in response:
            for item in response['Contents']:
                key = item['Key']
                if key.endswith('.mp3') or key.endswith('.m4a'):
                    files.append(key.replace('TTS/', ''))

        if response.get('IsTruncated') == 'true':
            marker = response.get('NextMarker', '')
        else:
            break

    return files

def filename_to_text(filename):
    """将文件名转换为文本"""
    # 移除扩展名
    name = os.path.splitext(filename)[0]
    # 下划线转空格
    text = name.replace('_', ' ')
    return text

def text_to_filename(text):
    """将文本转换为文件名"""
    clean = text.lower().strip()
    # 清理标点
    clean = re.sub(r'[.!?,:;()]', '', clean)
    # 空格转下划线
    clean = clean.replace(' ', '_')
    return clean

def read_tts_js():
    """读取tts.js中的现有映射"""
    tts_file = "/Users/huangrong/Desktop/upgrade-english-miniprogram/utils/tts.js"

    with open(tts_file, 'r') as f:
        content = f.read()

    # 提取所有映射
    # 格式: { text: "...", file: "..." }
    pattern = r'\{\s*text:\s*["\']([^"\']+)["\']\s*,\s*file:\s*["\']([^"\']+)["\']\s*\}'
    matches = re.findall(pattern, content)

    file_to_texts = {}
    for text, file in matches:
        if file not in file_to_texts:
            file_to_texts[file] = []
        file_to_texts[file].append(text.lower().strip())

    return file_to_texts, content

def read_units_data():
    """读取units-data.js中的所有英文文本"""
    units_file = "/Users/huangrong/Desktop/upgrade-english-miniprogram/utils/units-data.js"

    with open(units_file, 'r') as f:
        content = f.read()

    all_texts = {
        'words': [],
        'sentences': []
    }

    # 提取单词 (word_matches格式: icon + en)
    # 匹配类似: icon: '🏀', en: 'apple'
    word_pattern = r"icon:\s*'[^']+'\s*,\s*en:\s*['\"]([^'\"]+)['\"]"
    word_matches = re.findall(word_pattern, content)
    all_texts['words'] = [w.strip() for w in word_matches if w.strip()]

    # 提取句型问答 (qa格式)
    # q: { icon: '❓', en: '...', zh: '...' }
    # a: { icon: '👁️', en: '...', zh: '...' }
    q_pattern = r"q:\s*\{\s*[^}]*en:\s*['\"]([^'\"]+)['\"]"
    a_pattern = r"a:\s*\{\s*[^}]*en:\s*['\"]([^'\"]+)['\"]"

    q_matches = re.findall(q_pattern, content)
    a_matches = re.findall(a_pattern, content)

    all_texts['sentences'].extend([q.strip() for q in q_matches if q.strip()])
    all_texts['sentences'].extend([a.strip() for a in a_matches if a.strip()])

    return all_texts, content

def clean_text_for_match(text):
    """清理文本用于匹配"""
    if not text:
        return ''
    clean = text.lower()
    # 移除标点
    clean = re.sub(r'[!.,?;:\'\"()\[\]【】（）]/g', '', clean)
    # 移除emoji
    clean = re.sub(r'[^\x00-\x7F]', '', clean)
    # 统一空格
    clean = re.sub(r'\s+', ' ', clean)
    return clean.strip()

def analyze_and_fix():
    """主分析修复函数"""
    print("=" * 70)
    print("🔍 彻底分析音频与文字一致性问题")
    print("=" * 70)

    # 1. 获取COS文件列表
    print("\n📡 步骤1: 获取COS上的音频文件列表...")
    try:
        cos_files = list_tts_files()
        print(f"   ✅ COS上共有 {len(cos_files)} 个音频文件")
    except Exception as e:
        print(f"   ❌ COS连接失败: {e}")
        return

    # 2. 读取现有映射
    print("\n📖 步骤2: 读取tts.js中的现有映射...")
    file_to_texts, tts_content = read_tts_js()
    print(f"   ✅ tts.js中有 {len(file_to_texts)} 个音频文件的映射")

    # 3. 读取units-data.js
    print("\n📖 步骤3: 读取units-data.js中的文本...")
    units_texts, units_content = read_units_data()
    print(f"   ✅ units-data.js中有 {len(units_texts['words'])} 个词汇, {len(units_texts['sentences'])} 个句型")

    # 4. 建立"真相来源" - 从COS文件名推断正确文本
    print("\n🔧 步骤4: 建立音频→文本映射...")

    # 为每个COS文件确定"正确"的文本
    # 优先使用tts.js中的映射，如果没有就用文件名转换
    cos_to_correct_text = {}

    for cos_file in cos_files:
        base_name = filename_to_text(cos_file)

        if cos_file in file_to_texts:
            # 使用tts.js中的第一个映射作为"正确"文本
            correct_text = file_to_texts[cos_file][0]
        else:
            correct_text = base_name

        cos_to_correct_text[cos_file] = correct_text

    # 5. 检查units-data.js中的文本是否与COS一致
    print("\n🔍 步骤5: 检查units-data.js与COS的一致性...")

    mismatches = []

    # 检查词汇
    for word in units_texts['words']:
        expected_file = text_to_filename(word) + '.mp3'
        expected_file2 = text_to_filename(word) + '.m4a'

        if expected_file in cos_files:
            correct_text = cos_to_correct_text[expected_file]
            if clean_text_for_match(word) != clean_text_for_match(correct_text):
                mismatches.append({
                    'type': 'word',
                    'original': word,
                    'expected': correct_text,
                    'file': expected_file
                })
        elif expected_file2 in cos_files:
            correct_text = cos_to_correct_text[expected_file2]
            if clean_text_for_match(word) != clean_text_for_match(correct_text):
                mismatches.append({
                    'type': 'word',
                    'original': word,
                    'expected': correct_text,
                    'file': expected_file2
                })

    # 检查句型
    for sentence in units_texts['sentences']:
        # 尝试多种文件命名方式
        clean_sentence = clean_text_for_match(sentence)
        variations = [
            clean_sentence.replace(' ', '_') + '.mp3',
            clean_sentence.replace(' ', '_') + '.m4a',
        ]

        found = False
        for var in variations:
            if var in cos_files:
                correct_text = cos_to_correct_text[var]
                if clean_text_for_match(sentence) != clean_text_for_match(correct_text):
                    mismatches.append({
                        'type': 'sentence',
                        'original': sentence,
                        'expected': correct_text,
                        'file': var
                    })
                found = True
                break

    print(f"\n   发现 {len(mismatches)} 个不一致问题")

    if mismatches:
        print("\n⚠️ 需要修复的文本 (部分展示):")
        for i, m in enumerate(mismatches[:30], 1):
            print(f"\n   {i}. [{m['type']}]")
            print(f"      当前文本: {m['original']}")
            print(f"      正确文本: {m['expected']}")
            print(f"      对应文件: {m['file']}")

    # 6. 生成修复方案
    print("\n" + "=" * 70)
    print("📋 修复方案")
    print("=" * 70)

    print("""
彻底解决方案：

1. 【修改units-data.js】
   - 将所有不一致的文本修改为与COS音频内容一致
   - 需要修改的条目将保存到 fix_units_data.py 脚本

2. 【清理tts.js】
   - 每个音频文件只保留一个"正确"的映射
   - 移除重复和冲突的映射

3. 【验证】
   - 修改后运行验证确保所有文本与音频一致
    """)

    return mismatches, cos_files, cos_to_correct_text

def generate_fix_script(mismatches):
    """生成修复脚本"""
    if not mismatches:
        print("\n✅ 没有需要修复的不一致问题!")
        return

    # 按类型分组
    word_fixes = [m for m in mismatches if m['type'] == 'word']
    sentence_fixes = [m for m in mismatches if m['type'] == 'sentence']

    fix_script = '''#!/usr/bin/env python3
"""
自动修复units-data.js中的不一致文本
生成时间: 自动
"""

import re

def apply_fixes():
    units_file = "/Users/huangrong/Desktop/upgrade-english-miniprogram/utils/units-data.js"

    with open(units_file, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # 词汇修复 (共 {} 个)
'''.format(len(word_fixes))

    # 添加词汇修复
    for m in word_fixes:
        # 需要正确转义
        original = m['original'].replace("'", "\\'").replace('"', '\\"')
        expected = m['expected'].replace("'", "\\'").replace('"', '\\"')
        fix_script += f'    content = content.replace(\n        \'en: "{original}"\',\n        \'en: "{expected}"\'\n    )\n'

    fix_script += '''
    # 句型修复 (共 {} 个)
'''.format(len(sentence_fixes))

    # 添加句型修复
    for m in sentence_fixes:
        original = m['original'].replace("'", "\\'").replace('"', '\\"')
        expected = m['expected'].replace("'", "\\'").replace('"', '\\"')
        fix_script += f'    content = content.replace(\n        \'en: "{original}"\',\n        \'en: "{expected}"\'\n    )\n'

    fix_script += '''
    # 写入文件
    with open(units_file, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"✅ 修复完成! 共修改 {len(word_fixes) + len(sentence_fixes)} 处")

if __name__ == "__main__":
    apply_fixes()
'''

    script_file = "/Users/huangrong/Desktop/upgrade-english-miniprogram/scripts/auto_fix_units.py"
    with open(script_file, 'w') as f:
        f.write(fix_script)

    print(f"\n📄 修复脚本已生成: {script_file}")
    print("   运行此脚本将自动修复所有不一致问题")

    return script_file

if __name__ == "__main__":
    mismatches, cos_files, cos_to_correct_text = analyze_and_fix()

    if mismatches:
        generate_fix_script(mismatches)

        print("\n" + "=" * 70)
        print("下一步操作")
        print("=" * 70)
        print("""
1. 确认修复脚本中的修改内容
2. 运行修复脚本: python3 scripts/auto_fix_units.py
3. 在微信开发者工具中验证
4. 重新上传部署
        """)
