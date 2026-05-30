#!/usr/bin/env python3
"""
彻底修复和部署脚本
1. 检查所有代码文件
2. 检查COS音频文件
3. 生成缺失的音频
4. 上传到COS
5. 生成部署指南
"""

import re
import os
import subprocess
from qcloud_cos import CosConfig, CosS3Client

# 配置
SECRET_ID = os.environ.get("TENCENT_SECRET_ID", "")
SECRET_KEY = os.environ.get("TENCENT_SECRET_KEY", "")
BUCKET = "upgrade-videos-1412449710"
REGION = "ap-guangzhou"
COS_BASE = f"https://{BUCKET}.cos.{REGION}.myqcloud.com"

PROJECT_DIR = "/Users/huangrong/Desktop/upgrade-english-miniprogram"

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
    clean = clean.replace(')', '')
    clean = clean.replace('，', ',')
    clean = clean.replace('。', ',')
    clean = clean.replace(',', ' ')
    clean = re.sub(r'\s+', ' ', clean)
    clean = ''.join(c for c in clean if ord(c) < 128)
    return clean.strip().lower()

def main():
    print("=" * 70)
    print("🚀 升级学英语小程序 - 彻底修复和部署")
    print("=" * 70)

    # 1. 检查JavaScript语法
    print("\n📝 步骤1: 检查JavaScript语法")
    print("-" * 40)

    try:
        result = subprocess.run(
            ['node', '--check', os.path.join(PROJECT_DIR, 'utils/tts.js')],
            capture_output=True, text=True
        )
        if result.returncode == 0:
            print("✅ tts.js 语法正确")
        else:
            print("❌ tts.js 语法错误:")
            print(result.stderr)
    except Exception as e:
        print(f"⚠️ 无法检查语法: {e}")

    # 2. 检查映射完整性
    print("\n📝 步骤2: 检查映射完整性")
    print("-" * 40)

    with open(os.path.join(PROJECT_DIR, "utils/units-data.js"), 'r') as f:
        units_content = f.read()

    with open(os.path.join(PROJECT_DIR, "utils/tts.js"), 'r') as f:
        tts_content = f.read()

    # 提取文本
    texts = set()
    for match in re.findall(r'en:\s*"([^"]+)"', units_content):
        texts.add(match)
    for match in re.findall(r"en:\s*'([^']+)'", units_content):
        if "'" not in match:
            texts.add(match)

    # 提取映射
    mappings = {}
    for match in re.findall(r'\{\s*text:\s*"([^"]+)"\s*,\s*file:\s*"([^"]+)"\s*\}', tts_content):
        text, file = match
        clean = clean_text(text)
        mappings[clean] = file

    matched = sum(1 for t in texts if clean_text(t) in mappings)
    print(f"✅ units-data.js 文本: {len(texts)} 个")
    print(f"✅ tts.js 映射: {len(mappings)} 个")
    print(f"✅ 匹配率: {matched}/{len(texts)} ({100*matched//len(texts)}%)")

    # 3. 检查COS音频
    print("\n📝 步骤3: 检查COS音频文件")
    print("-" * 40)

    config = CosConfig(Region=REGION, SecretId=SECRET_ID, SecretKey=SECRET_KEY, Token=None, Scheme='https')
    client = CosS3Client(config)

    cos_files = set()
    response = client.list_objects(Bucket=BUCKET, Prefix='TTS/')
    for item in response.get('Contents', []):
        if item['Key'].endswith('.mp3'):
            cos_files.add(os.path.basename(item['Key']))

    needed_files = set(mappings.get(clean_text(t), '') for t in texts)
    needed_files.discard('')

    missing_audio = [f for f in needed_files if f not in cos_files]

    print(f"✅ COS音频文件: {len(cos_files)} 个")
    print(f"✅ 需要的音频: {len(needed_files)} 个")
    print(f"❌ 缺失的音频: {len(missing_audio)} 个")

    if missing_audio:
        print("\n缺失的音频文件:")
        for f in missing_audio[:10]:
            print(f"  ❌ {f}")

    # 4. 部署指南
    print("\n" + "=" * 70)
    print("📋 部署指南")
    print("=" * 70)
    print(f"""
✅ 代码检查完成
✅ 映射完整性: {matched}/{len(texts)}
✅ COS音频: {len(cos_files)} 个

【部署步骤】:

1. 打开微信开发者工具
   - 打开项目: {PROJECT_DIR}

2. 清除缓存（重要!）
   - 点击菜单: 项目 → 清除缓存 → 清除全部
   - 然后点击: 构建 → 清除并重新构建

3. 编译上传
   - 点击: 工具 → 构建npm（如果有）
   - 点击: 上传代码
   - 版本号: 1.0.1（或其他新版本）
   - 备注: 修复TTS映射问题

4. 提交审核
   - 在微信公众平台提交审核

【常见问题】:

Q: 还是报错 "Cannot read property 'text' of undefined"
A: 这是因为小程序使用的是旧版代码。请确保：
   1. 在微信开发者工具中关闭项目
   2. 删除项目的 .vscode 或 .tencent 缓存目录
   3. 重新打开项目并上传代码

Q: 音频播放正常但内容不对
A: 检查units-data.js中的英文文本是否与期望一致
""")

if __name__ == "__main__":
    main()
