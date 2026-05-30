#!/usr/bin/env python3
"""
腾讯云TTS音频生成和上传脚本 v2
使用腾讯云官方SDK生成音频并上传到COS
"""

import os
import json
import time
import sys
import hashlib
import base64
import requests

# 尝试导入腾讯云SDK
try:
    from tencentcloud.common import credential
    from tencentcloud.tts.v20190823 import tts_client, models
    HAS_SDK = True
except ImportError:
    HAS_SDK = False
    print("⚠️ 腾讯云SDK未安装，尝试使用REST API")

# 腾讯云配置（从环境变量读取，请勿硬编码密钥）
SECRET_ID = os.environ.get("TENCENT_SECRET_ID", "")
SECRET_KEY = os.environ.get("TENCENT_SECRET_KEY", "")
APP_ID = os.environ.get("TENCENT_APP_ID", "")

# COS配置
COS_BUCKET = "upgrade-videos-1412449710"
COS_REGION = "ap-guangzhou"
COS_BASE_URL = f"https://{COS_BUCKET}.cos.{COS_REGION}.myqcloud.com"

# 本地音频目录
LOCAL_AUDIO_DIR = "./tts_audio"
os.makedirs(LOCAL_AUDIO_DIR, exist_ok=True)


def generate_signature_secretid(secret_id, secret_key, timestamp):
    """生成签名"""
    import random
    import string
    nonce = ''.join(random.choice(string.ascii_letters + string.digits) for _ in range(10))
    sign_str = f"appid={APP_ID}&secretid={secret_id}&secretkey={secret_key}&timestamp={timestamp}&noncestr={nonce}"
    sign = hashlib.md5(sign_str.encode()).hexdigest()
    return nonce, sign


def call_tts_rest(text):
    """使用REST API调用腾讯云TTS"""
    timestamp = int(time.time())
    nonce, sign = generate_signature_secretid(SECRET_ID, SECRET_KEY, timestamp)

    url = "https://tts.cloud.tencent.com/stream"

    payload = {
        "appid": APP_ID,
        "secretid": SECRET_ID,
        "timestamp": timestamp,
        "nonce": nonce,
        "sign": sign,
        "text": text[:200],
        "sessionid": f"tts_{int(time.time() * 1000)}",
        "voicetype": 5,  # 云扬声器女声
        "speed": 50,
        "pitch": 50,
        "volume": 0,
        "lang": "en",
        "codec": "mp3",
        "modeltype": 1,
    }

    try:
        response = requests.post(url, json=payload, timeout=30)
        if response.status_code == 200:
            return response.content
        else:
            return None
    except Exception as e:
        print(f"  ⚠️ REST API错误: {e}")
        return None


def call_tts_sdk(text):
    """使用SDK调用腾讯云TTS"""
    if not HAS_SDK:
        return call_tts_rest(text)

    try:
        cred = credential.Credential(SECRET_ID, SECRET_KEY)
        client = tts_client.TtsClient(cred, "")

        req = models.TextToStreamAudioRequest()
        req.Text = text[:200]
        req.SessionId = f"tts_{int(time.time() * 1000)}"
        req.VoiceType = 5  # 云扬声器
        req.Speed = 50
        req.Volume = 0
        req.Codec = "mp3"
        req.ModelType = 1

        resp = client.TextToStreamAudio(req)

        if hasattr(resp, 'Audio') and resp.Audio:
            return base64.b64decode(resp.Audio)
        else:
            return None

    except Exception as e:
        print(f"  ⚠️ SDK错误: {e}")
        return call_tts_rest(text)


def upload_to_cos(local_file, cos_key):
    """上传文件到腾讯云COS"""
    try:
        url = f"{COS_BASE_URL}/{cos_key}"

        with open(local_file, 'rb') as f:
            file_content = f.read()

        # 使用PUT方式上传
        response = requests.put(
            url,
            data=file_content,
            headers={'Content-Type': 'audio/mpeg'},
            timeout=60
        )

        if response.status_code in [200, 201]:
            return True
        else:
            print(f"  ❌ COS错误: {response.status_code}")
            return False

    except Exception as e:
        print(f"  ❌ COS异常: {e}")
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
    print("🔊 腾讯云TTS音频生成器 v2")
    print("=" * 60)
    print(f"SDK状态: {'✅ 已安装' if HAS_SDK else '❌ 未安装'}")
    print(f"📁 本地目录: {os.path.abspath(LOCAL_AUDIO_DIR)}")
    print()

    # 读取文本列表
    with open('./tts_texts.json', 'r', encoding='utf-8') as f:
        texts = json.load(f)

    print(f"📝 待处理: {len(texts)} 个文本")
    print()

    # 测试TTS
    print("🔍 测试TTS API...")
    test_audio = call_tts_sdk("Hello, this is a test.")
    if test_audio and len(test_audio) > 1000:
        print(f"✅ TTS API可用，音频大小: {len(test_audio)} bytes")
    else:
        print("❌ TTS API不可用")
        return
    print()

    # 处理每个文本
    success = 0
    failed = 0
    skipped = 0

    for i, item in enumerate(texts):
        text = item['text']
        filename = clean_filename(text)

        progress = f"[{i+1}/{len(texts)}]"
        text_preview = text[:30] + "..." if len(text) > 30 else text
        print(f"{progress} {text_preview:<35}", end="", flush=True)

        local_path = os.path.join(LOCAL_AUDIO_DIR, filename)

        if os.path.exists(local_path):
            print(f"  ⏭️ 已存在")
            skipped += 1
            continue

        # 生成音频
        audio_data = call_tts_sdk(text)

        if audio_data and len(audio_data) > 1000:
            with open(local_path, 'wb') as f:
                f.write(audio_data)
            print(f"  ✅ {len(audio_data)//1024}KB")

            # 上传到COS
            cos_key = f"TTS/{filename}"
            upload_to_cos(local_path, cos_key)

            success += 1
        else:
            failed += 1
            print(f"  ❌ 生成失败")

        time.sleep(0.1)

    print()
    print("=" * 60)
    print(f"📊 完成: 成功{success} | 跳过{skipped} | 失败{failed}")
    print("=" * 60)


if __name__ == "__main__":
    main()
