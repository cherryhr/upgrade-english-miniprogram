#!/usr/bin/env python3
"""
腾讯云TTS音频生成和上传脚本 - 修复版
生成缺失的106个句型和歌词音频
"""

import os
import json
import time
import re
import hashlib
import hmac
import random
import string
import base64
import requests

# 腾讯云配置
SECRET_ID = os.environ.get("TENCENT_SECRET_ID", "")
SECRET_KEY = os.environ.get("TENCENT_SECRET_KEY", "")
APP_ID = 1308940785

# COS配置
COS_BUCKET = "upgrade-videos-1412449710"
COS_REGION = "ap-guangzhou"
COS_BASE_URL = f"https://{COS_BUCKET}.cos.ap-guangzhou.myqcloud.com"

# 本地音频目录
LOCAL_AUDIO_DIR = "./tts_audio"
os.makedirs(LOCAL_AUDIO_DIR, exist_ok=True)


def clean_text_for_tts(text):
    """清理文本用于TTS发音"""
    # 移除emoji和其他非标准字符
    clean = re.sub(r'[\U00010000-\U0010ffff]', '', text)
    # 移除特殊符号
    clean = clean.replace('!', '').replace('?', '').replace(',', ',')
    # 清理多余空格
    clean = ' '.join(clean.split())
    return clean.strip()


def text_to_filename(text):
    """文本转文件名"""
    clean = text.lower()
    clean = re.sub(r'[^a-z0-9\s]', '', clean)
    clean = '_'.join(clean.split())
    return (clean[:60] or 'audio') + '.mp3'


def generate_signature_v3():
    """生成腾讯云API V3签名"""
    import datetime

    # 获取当前时间
    now = datetime.datetime.utcnow()
    timestamp = str(int(now.timestamp()))
    date = now.strftime('%Y-%m-%d')

    # 拼接签名原文
    canonical_request = f"POST\n/tts\n\nhost:tts.cloud.tencent.com\n\ncontent-type:application/json\n\ndate:{timestamp}\n\n"
    signed_headers = "content-type;host"
    hashed_canonical_req = hashlib.sha256(canonical_request.encode()).hexdigest()

    string_to_sign = f"TC3-HMAC-SHA256\n{timestamp}\n{date}/tts/tcs3_request\n{hashed_canonical_req}"

    # 计算签名
    secret_date = hmac.new(
        ("TC3" + SECRET_KEY).encode(),
        date.encode(),
        hashlib.sha256
    ).digest()

    secret_signing = hmac.new(
        secret_date,
        "tc3_request".encode(),
        hashlib.sha256
    ).digest()

    signature = hmac.new(
        secret_signing,
        string_to_sign.encode(),
        hashlib.sha256
    ).hexdigest()

    authorization = (
        f"TC3-HMAC-SHA256 "
        f"Credential={SECRET_ID}/{date}/tts/tc3_request, "
        f"SignedHeaders={signed_headers}, "
        f"Signature={signature}"
    )

    return authorization, timestamp


def call_tencent_tts(text):
    """调用腾讯云TTS API"""
    try:
        url = "https://tts.cloud.tencent.com/tts"

        # 清理文本
        clean_text = clean_text_for_tts(text)
        if not clean_text:
            return None

        # 生成签名
        authorization, timestamp = generate_signature_v3()

        payload = {
            "Text": clean_text,
            "SessionId": f"tts_{int(time.time() * 1000)}",
            "ModelType": 1,
            "VoiceType": 6,  # 英式发音
            "Speed": 50,
            "Volume": 0,
            "SampleRate": 16000,
            "Codec": "mp3"
        }

        headers = {
            "Content-Type": "application/json",
            "Authorization": authorization,
            "Host": "tts.cloud.tencent.com",
            "X-TC-Action": "TextToVoice",
            "X-TC-Version": "2019-08-23",
            "X-TC-Timestamp": timestamp,
            "X-TC-Region": "ap-guangzhou"
        }

        response = requests.post(url, json=payload, headers=headers, timeout=30)

        if response.status_code == 200:
            result = response.json()
            if result.get('Response', {}).get('Audio'):
                return base64.b64decode(result['Response']['Audio'])
            else:
                print(f"  响应: {str(result)[:100]}")
                return None
        else:
            print(f"  HTTP {response.status_code}: {response.text[:100]}")
            return None

    except Exception as e:
        print(f"  异常: {str(e)}")
        return None


def upload_to_cos(local_file, cos_key):
    """上传文件到COS"""
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

        if response.status_code in [200, 201]:
            return True
        else:
            print(f"  ❌ COS上传失败: {response.status_code}")
            return False

    except Exception as e:
        print(f"  ❌ COS上传异常: {str(e)}")
        return False


def main():
    print("=" * 60)
    print("🔊 腾讯云TTS音频生成器 - 句型&歌词专项")
    print("=" * 60)

    # 加载缺失音频列表
    missing_file = './missing_audio_full.json'
    if not os.path.exists(missing_file):
        print(f"❌ 文件不存在: {missing_file}")
        return

    with open(missing_file, 'r', encoding='utf-8') as f:
        missing_items = json.load(f)

    print(f"📝 待处理: {len(missing_items)} 个缺失音频")
    print()

    # 处理
    success = 0
    failed = 0
    skipped = 0

    for i, item in enumerate(missing_items):
        text = item['text']
        filename = text_to_filename(text)
        item_type = item['type']

        progress = f"[{i+1}/{len(missing_items)}]"
        text_preview = text[:40] + "..." if len(text) > 40 else text
        print(f"{progress} [{item_type:12}] {text_preview:<45}", end="", flush=True)

        # 检查本地是否已存在
        local_path = os.path.join(LOCAL_AUDIO_DIR, filename)
        if os.path.exists(local_path):
            print(f"  ⏭️ 本地已存在")
            skipped += 1
            continue

        # 生成TTS
        audio_data = call_tencent_tts(text)

        if audio_data and len(audio_data) > 1000:
            # 保存本地
            with open(local_path, 'wb') as f:
                f.write(audio_data)
            print(f"  ✅ {len(audio_data)//1024}KB")

            # 上传COS
            cos_key = f"TTS/{filename}"
            upload_to_cos(local_path, cos_key)

            success += 1
        else:
            failed += 1
            print(f"  ❌ 生成失败")

        time.sleep(0.3)

    print()
    print("=" * 60)
    print(f"📊 处理完成:")
    print(f"  ✅ 成功: {success}")
    print(f"  ⏭️ 跳过: {skipped}")
    print(f"  ❌ 失败: {failed}")
    print(f"  📁 本地目录: {os.path.abspath(LOCAL_AUDIO_DIR)}")
    print("=" * 60)


if __name__ == "__main__":
    main()
