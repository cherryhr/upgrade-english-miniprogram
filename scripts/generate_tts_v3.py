#!/usr/bin/env python3
"""
腾讯云TTS音频生成和上传脚本 v3
使用REST API直接调用腾讯云TTS
"""

import os
import json
import time
import sys
import hashlib
import base64
import random
import string
import requests

# 腾讯云配置
SECRET_ID = os.environ.get("TENCENT_SECRET_ID", "")
SECRET_KEY = os.environ.get("TENCENT_SECRET_KEY", "")
APP_ID = 1308940785

# COS配置
COS_BUCKET = "upgrade-videos-1412449710"
COS_REGION = "ap-guangzhou"
COS_BASE_URL = f"https://{COS_BUCKET}.cos.{COS_REGION}.myqcloud.com"

# 本地音频目录
LOCAL_AUDIO_DIR = "./tts_audio"
os.makedirs(LOCAL_AUDIO_DIR, exist_ok=True)


def generate_auth():
    """生成认证信息"""
    timestamp = int(time.time())
    nonce = ''.join(random.choice(string.ascii_letters + string.digits) for _ in range(10))
    # 生成简单的auth
    auth_str = f"{APP_ID}:{timestamp}:{nonce}"
    auth = base64.b64encode(auth_str.encode()).decode()
    return auth, timestamp, nonce


def call_tencent_tts(text):
    """调用腾讯云TTS REST API"""
    auth, timestamp, nonce = generate_auth()

    url = "https://tts.cloud.tencent.com/stream"

    payload = {
        "appid": APP_ID,
        "text": text[:200],
        "sessionid": f"tts_{int(time.time() * 1000)}",
        "voicetype": 5,  # 云扬声器
        "speed": 50,
        "pitch": 50,
        "volume": 0,
        "lang": "en",
        "codec": "mp3",
        "modeltype": 1,
    }

    headers = {
        "Content-Type": "application/json",
        "Authorization": auth,
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        
        if response.status_code == 200:
            return response.content
        else:
            return None
    except Exception as e:
        print(f"错误: {e}")
        return None


def upload_to_cos(local_file, cos_key):
    """上传文件到腾讯云COS"""
    try:
        url = f"{COS_BASE_URL}/{cos_key}"

        with open(local_file, 'rb') as f:
            file_content = f.read()

        response = requests.put(
            url,
            data=file_content,
            headers={'Content-Type': 'audio/mpeg'},
            timeout=60
        )

        return response.status_code in [200, 201]
    except Exception as e:
        print(f"COS上传错误: {e}")
        return False


def clean_filename(text):
    """清理文本为合法的文件名"""
    import re
    clean = text.lower()
    clean = re.sub(r'[^a-z0-9\s]', '', clean)
    clean = '_'.join(clean.split())
    clean = clean[:60]
    return (clean or "audio") + ".mp3"


def main():
    print("=" * 60)
    print("🔊 腾讯云TTS音频生成器 v3")
    print("=" * 60)
    print(f"📁 本地目录: {os.path.abspath(LOCAL_AUDIO_DIR)}")
    print()

    # 读取文本列表
    with open('./tts_texts.json', 'r', encoding='utf-8') as f:
        texts = json.load(f)

    print(f"📝 待处理: {len(texts)} 个文本")
    print()

    # 测试TTS
    print("🔍 测试TTS API...")
    test_audio = call_tencent_tts("Hello world")
    
    if test_audio and len(test_audio) > 1000:
        print(f"✅ TTS API可用，音频大小: {len(test_audio)} bytes")
        with open("./tts_audio/test.mp3", 'wb') as f:
            f.write(test_audio)
        print(f"✅ 测试音频已保存")
    else:
        print("❌ TTS API不可用，尝试其他方案...")
        # 保存测试结果
        if test_audio:
            print(f"响应: {test_audio[:200]}")
    print()


if __name__ == "__main__":
    main()
