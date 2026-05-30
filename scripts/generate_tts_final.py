#!/usr/bin/env python3
"""
TTS音频生成和上传脚本
使用Google Translate TTS生成音频，上传到腾讯云COS
"""

import os
import sys
import json
import time
import re
import subprocess
import requests
from urllib.parse import quote

# 安装依赖
try:
    from qcloud_cos import CosConfig, CosS3Client
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "cos-python-sdk-v5", "-q"])
    from qcloud_cos import CosConfig, CosS3Client

# 腾讯云COS配置
SECRET_ID = os.environ.get("TENCENT_SECRET_ID", "")
SECRET_KEY = os.environ.get("TENCENT_SECRET_KEY", "")
COS_BUCKET = "upgrade-videos-1412449710"
COS_REGION = "ap-guangzhou"

# 本地音频目录
LOCAL_AUDIO_DIR = "./tts_audio"
os.makedirs(LOCAL_AUDIO_DIR, exist_ok=True)


def init_cos_client():
    """初始化COS客户端"""
    config = CosConfig(
        Region=COS_REGION,
        SecretId=SECRET_ID,
        SecretKey=SECRET_KEY,
        Token=None,
        Scheme='https'
    )
    return CosS3Client(config)


def clean_filename(text):
    """清理文本为合法的文件名"""
    clean = text.lower()
    clean = re.sub(r'[^a-z0-9\s]', '', clean)
    clean = '_'.join(clean.split())
    clean = clean[:50]
    if not clean:
        clean = "audio"
    return clean + ".mp3"


def generate_google_tts(text, output_file):
    """使用Google Translate TTS生成音频"""
    # Google Translate TTS URL
    url = "https://translate.google.com/translate_tts"
    params = {
        "ie": "UTF-8",
        "q": text[:200],
        "tl": "en",  # 英式发音用en
        "client": "tw-ob"  # 使用稳定的API客户端
    }

    try:
        response = requests.get(url, params=params, timeout=30)
        if response.status_code == 200 and len(response.content) > 1000:
            with open(output_file, 'wb') as f:
                f.write(response.content)
            return True
        else:
            return False
    except Exception as e:
        print(f"Google TTS错误: {e}")
        return False


def upload_to_cos(cos_client, local_file, cos_key):
    """上传文件到腾讯云COS"""
    try:
        with open(local_file, 'rb') as f:
            cos_client.put_object(
                Bucket=COS_BUCKET,
                Body=f,
                Key=cos_key,
                ContentType='audio/mpeg'
            )
        return True
    except Exception as e:
        print(f"COS上传错误: {e}")
        return False


def check_cos_exists(cos_client, cos_key):
    """检查COS上文件是否存在"""
    try:
        cos_client.head_object(Bucket=COS_BUCKET, Key=cos_key)
        return True
    except:
        return False


def main():
    print("=" * 60)
    print("🔊 TTS音频生成器")
    print("=" * 60)
    print(f"📁 本地目录: {os.path.abspath(LOCAL_AUDIO_DIR)}")
    print(f"☁️  COS存储: {COS_BUCKET}")
    print()

    # 初始化COS客户端
    print("🔗 初始化COS客户端...")
    cos_client = init_cos_client()
    print("✅ COS客户端已就绪")
    print()

    # 读取文本列表
    with open('./tts_texts.json', 'r', encoding='utf-8') as f:
        texts = json.load(f)

    print(f"📝 待处理: {len(texts)} 个文本")
    print()

    # 测试Google TTS
    print("🔍 测试Google Translate TTS...")
    test_file = os.path.join(LOCAL_AUDIO_DIR, "test_google.mp3")
    if generate_google_tts("Hello, this is a test.", test_file):
        print(f"✅ Google TTS可用 ({os.path.getsize(test_file)} bytes)")
    else:
        print("❌ Google TTS不可用")
        return
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

        # 进度
        progress = f"[{i+1}/{len(texts)}]"
        text_preview = (text[:25] + "...") if len(text) > 25 else text
        print(f"{progress} {text_preview:<30}", end="", flush=True)

        # 检查是否已生成
        if os.path.exists(local_path):
            file_size = os.path.getsize(local_path)
            if file_size > 1000:
                print(f"  ⏭️ 已存在 ({file_size//1024}KB)")
                skipped += 1
            else:
                os.remove(local_path)  # 删除无效文件
                print(f"  🗑️ 删除无效文件，重新生成")
        else:
            # 生成音频
            if generate_google_tts(text, local_path):
                file_size = os.path.getsize(local_path)
                if file_size > 1000:
                    print(f"  ✅ {filename} ({file_size//1024}KB)")

                    # 上传到COS
                    if upload_to_cos(cos_client, local_path, cos_key):
                        print(f"     ☁️ 已上传到COS")
                        uploaded += 1
                    else:
                        print(f"     ⚠️ COS上传失败，本地保留")

                    success += 1
                else:
                    os.remove(local_path)
                    print(f"  ❌ 生成无效")
                    failed += 1
            else:
                failed += 1
                print(f"  ❌ TTS失败")

        # 避免请求过快
        time.sleep(0.1)

    print()
    print("=" * 60)
    print("📊 处理完成:")
    print(f"  ✅ 成功生成: {success}")
    print(f"  ☁️ 上传到COS: {uploaded}")
    print(f"  ⏭️ 跳过: {skipped}")
    print(f"  ❌ 失败: {failed}")
    print(f"  📁 本地目录: {os.path.abspath(LOCAL_AUDIO_DIR)}")
    print("=" * 60)


if __name__ == "__main__":
    main()
