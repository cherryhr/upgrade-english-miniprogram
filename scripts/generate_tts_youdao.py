#!/usr/bin/env python3
"""
TTS音频生成和上传脚本
使用有道词典API生成音频，上传到腾讯云COS
"""

import os
import sys
import json
import time
import re
import requests
from urllib.parse import quote

# 导入COS SDK
from qcloud_cos import CosConfig, CosS3Client

# 腾讯云COS配置
SECRET_ID = os.environ.get("TENCENT_SECRET_ID", "")
SECRET_KEY = os.environ.get("TENCENT_SECRET_KEY", "")
COS_BUCKET = "upgrade-videos-1412449710"
COS_REGION = "ap-guangzhou"
COS_BASE_URL = f"https://{COS_BUCKET}.cos.{COS_REGION}.myqcloud.com"

# 本地音频目录
LOCAL_AUDIO_DIR = "./tts_audio"
os.makedirs(LOCAL_AUDIO_DIR, exist_ok=True)

# 有道TTS API
YOUDAO_TTS_URL = "https://dict.youdao.com/dictvoice"


def init_cos_client():
    """初始化COS客户端"""
    config = CosConfig(Region=COS_REGION, SecretId=SECRET_ID, SecretKey=SECRET_KEY)
    return CosS3Client(config)


def generate_youdao_tts(text, output_file):
    """使用有道词典API生成TTS音频"""
    # 清理文本用于URL编码
    clean_text = re.sub(r'[!\"\'\\:;,。！？]', '', text)
    clean_text = clean_text.strip()[:100]

    url = f"{YOUDAO_TTS_URL}?type=0&audio={quote(clean_text)}"

    try:
        response = requests.get(url, timeout=30)
        if response.status_code == 200:
            content = response.content
            # 检查是否是有效音频（大于1KB且不是JSON错误响应）
            if len(content) > 1000 and not content.startswith(b'{"'):
                with open(output_file, 'wb') as f:
                    f.write(content)
                return True, len(content)
            else:
                return False, len(content)
        return False, 0
    except Exception as e:
        return False, 0


def upload_to_cos(cos_client, local_file, cos_key):
    """上传文件到COS"""
    try:
        cos_client.put_object(
            Bucket=COS_BUCKET,
            Body=open(local_file, 'rb'),
            Key=cos_key,
            ContentType='audio/mpeg'
        )
        return True
    except Exception as e:
        return False


def clean_filename(text):
    """清理文本为合法的文件名"""
    clean = text.lower()
    clean = re.sub(r'[^a-z0-9\s]', '', clean)
    clean = '_'.join(clean.split())
    clean = clean[:50]
    return (clean or "audio") + ".mp3"


def main():
    print("=" * 60)
    print("🔊 TTS音频生成器 (有道API)")
    print("=" * 60)

    # 初始化COS客户端
    print("🔗 初始化COS客户端...")
    cos_client = init_cos_client()
    print("✅ COS客户端已就绪")
    print()

    # 测试有道TTS
    print("🔍 测试有道词典TTS API...")
    test_file = os.path.join(LOCAL_AUDIO_DIR, "test.mp3")
    success, size = generate_youdao_tts("Hello world", test_file)
    if success:
        print(f"✅ 有道TTS可用 ({size//1024}KB)")
    else:
        print("❌ 有道TTS不可用")
        return
    print()

    # 读取文本列表
    with open('./tts_texts.json', 'r', encoding='utf-8') as f:
        texts = json.load(f)

    print(f"📝 待处理: {len(texts)} 个文本")
    print()

    # 统计
    success = 0
    skipped = 0
    failed = 0
    uploaded = 0

    # 处理每个文本
    for i, item in enumerate(texts):
        text = item['text']
        filename = clean_filename(text)
        local_path = os.path.join(LOCAL_AUDIO_DIR, filename)
        cos_key = f"TTS/{filename}"

        progress = f"[{i+1}/{len(texts)}]"
        text_preview = (text[:25] + "...") if len(text) > 25 else text
        print(f"{progress} {text_preview:<30}", end="", flush=True)

        # 检查本地是否已存在
        if os.path.exists(local_path) and os.path.getsize(local_path) > 1000:
            # 检查COS是否已存在
            try:
                cos_client.head_object(Bucket=COS_BUCKET, Key=cos_key)
                print(f"  ⏭️ COS已存在")
                skipped += 1
                continue
            except:
                print(f"  ⏭️ 本地存在，上传COS")
                if upload_to_cos(cos_client, local_path, cos_key):
                    uploaded += 1
                    print(f"     ☁️ 已上传")
                continue

        # 生成TTS音频
        gen_success, file_size = generate_youdao_tts(text, local_path)

        if gen_success:
            print(f"  ✅ {file_size//1024}KB", end="")

            # 上传到COS
            if upload_to_cos(cos_client, local_path, cos_key):
                print(" ☁️ 已上传")
                uploaded += 1
            else:
                print(" ⚠️ COS上传失败")

            success += 1
        else:
            # 如果有道失败，尝试生成简单的单词版本
            words = text.split()
            simple_word = words[0] if words else text.split(',')[0]
            simple_word = re.sub(r'[^a-z]', '', simple_word.lower())
            if simple_word:
                simple_file = os.path.join(LOCAL_AUDIO_DIR, f"{simple_word}.mp3")
                gen2, size2 = generate_youdao_tts(simple_word, simple_file)
                if gen2:
                    print(f"  ⚠️ 原句失败，使用: {simple_word}")
                    # 上传简单版本
                    cos_key2 = f"TTS/{simple_word}.mp3"
                    if upload_to_cos(cos_client, simple_file, cos_key2):
                        uploaded += 1
                    success += 1
                else:
                    failed += 1
                    print(f"  ❌ 失败")
            else:
                failed += 1
                print(f"  ❌ 失败")

        # 避免请求过快
        time.sleep(0.1)

    print()
    print("=" * 60)
    print("📊 完成:")
    print(f"  ✅ 成功生成: {success}")
    print(f"  ☁️ 上传到COS: {uploaded}")
    print(f"  ⏭️ 跳过: {skipped}")
    print(f"  ❌ 失败: {failed}")
    print(f"  📁 本地目录: {os.path.abspath(LOCAL_AUDIO_DIR)}")
    print("=" * 60)


if __name__ == "__main__":
    main()
