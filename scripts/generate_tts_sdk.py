#!/usr/bin/env python3
"""
腾讯云TTS音频生成脚本 - 使用官方SDK
"""

import os
import sys
import json
import time
import base64

# 导入腾讯云SDK
from tencentcloud.common import credential
from tencentcloud.tts.v20190823 import tts_client
from tencentcloud.tts.v20190823 import models
from qcloud_cos import CosConfig, CosS3Client

# 腾讯云配置（从环境变量读取，请勿硬编码密钥）
SECRET_ID = os.environ.get("TENCENT_SECRET_ID", "")
SECRET_KEY = os.environ.get("TENCENT_SECRET_KEY", "")
COS_BUCKET = "upgrade-videos-1412449710"
COS_REGION = "ap-guangzhou"

# 本地音频目录
LOCAL_AUDIO_DIR = "./tts_audio"
os.makedirs(LOCAL_AUDIO_DIR, exist_ok=True)


def init_tts_client():
    """初始化TTS客户端"""
    cred = credential.Credential(SECRET_ID, SECRET_KEY)
    return tts_client.TtsClient(cred, "")


def init_cos_client():
    """初始化COS客户端"""
    config = CosConfig(Region=COS_REGION, SecretId=SECRET_ID, SecretKey=SECRET_KEY)
    return CosS3Client(config)


def generate_tts(tts_client, text):
    """使用腾讯云TTS生成音频"""
    try:
        req = models.TextToVoiceRequest()
        req.Text = text[:200]
        req.SessionId = f"tts_{int(time.time() * 1000)}"
        req.VoiceType = 5  # 云扬声器（女声）
        req.Language = 1   # 英文
        req.Speed = 50     # 正常速度
        req.Volume = 0     # 默认音量
        req.Codec = "mp3"

        resp = tts_client.TextToVoice(req)

        if hasattr(resp, 'Audio') and resp.Audio:
            return base64.b64decode(resp.Audio)
        return None

    except Exception as e:
        print(f"  ⚠️ TTS错误: {str(e)[:50]}")
        return None


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
        print(f"  ⚠️ COS错误: {str(e)[:50]}")
        return False


def clean_filename(text):
    """清理文本为合法的文件名"""
    import re
    clean = text.lower()
    clean = re.sub(r'[^a-z0-9\s]', '', clean)
    clean = '_'.join(clean.split())
    clean = clean[:50]
    return (clean or "audio") + ".mp3"


def main():
    print("=" * 60)
    print("🔊 腾讯云TTS音频生成器 (官方SDK)")
    print("=" * 60)

    # 初始化客户端
    print("🔗 初始化客户端...")
    tts_client = init_tts_client()
    cos_client = init_cos_client()
    print("✅ 初始化完成")
    print()

    # 测试TTS
    print("🔍 测试TTS API...")
    test_audio = generate_tts(tts_client, "Hello world")

    if test_audio and len(test_audio) > 1000:
        print(f"✅ TTS API可用，音频大小: {len(test_audio)} bytes")
        test_file = os.path.join(LOCAL_AUDIO_DIR, "test_sdk.mp3")
        with open(test_file, 'wb') as f:
            f.write(test_audio)
        print(f"✅ 测试音频已保存")
    else:
        print("❌ TTS API不可用")
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
            print(f"  ⏭️ 已存在")
            skipped += 1
            continue

        # 生成TTS音频
        audio_data = generate_tts(tts_client, text)

        if audio_data and len(audio_data) > 1000:
            # 保存本地
            with open(local_path, 'wb') as f:
                f.write(audio_data)
            print(f"  ✅ {len(audio_data)//1024}KB", end="")

            # 上传到COS
            if upload_to_cos(cos_client, local_path, cos_key):
                print(" ☁️ COS")
            else:
                print(" ⚠️ COS失败")

            success += 1
        else:
            failed += 1
            print(f"  ❌ 失败")

        # 避免请求过快
        time.sleep(0.1)

    print()
    print("=" * 60)
    print(f"📊 完成: 成功{success} | 跳过{skipped} | 失败{failed}")
    print(f"📁 本地目录: {os.path.abspath(LOCAL_AUDIO_DIR)}")
    print("=" * 60)


if __name__ == "__main__":
    main()
