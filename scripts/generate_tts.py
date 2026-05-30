#!/usr/bin/env python3
"""
腾讯云TTS音频生成和上传脚本
使用腾讯云语音合成API生成音频并上传到COS
"""

import os
import json
import time
import base64
import hashlib
import hmac
import urllib.parse
import requests

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


def generate_signature():
    """生成腾讯云API签名"""
    import random
    import string

    # 生成随机字符串
    nonce = ''.join(random.choice(string.ascii_letters + string.digits) for _ in range(16))
    timestamp = int(time.time())

    # 构造签名原串
    sign_str = f"appid={APP_ID}&secretid={SECRET_ID}&secretkey={SECRET_KEY}&timestamp={timestamp}&noncestr={nonce}"

    # 使用MD5
    sign = hashlib.md5(sign_str.encode()).hexdigest()

    return {
        "appid": APP_ID,
        "secretid": SECRET_ID,
        "timestamp": timestamp,
        "noncestr": nonce,
        "sign": sign
    }


def call_tencent_tts(text):
    """调用腾讯云TTS API生成音频"""
    try:
        # 使用腾讯云TTS REST API (简化版，不需要签名)
        url = "https://tts.cloud.tencent.com/stream"

        payload = {
            "appid": APP_ID,
            "secretid": SECRET_ID,
            "timestamp": int(time.time()),
            "nonce": int(time.time() % 100000),
            "sign": "placeholder",  # 简化处理
            "text": text[:200],  # 限制文本长度
            "sessionid": f"tts_{int(time.time() * 1000)}",
            "voicetype": 5,  # 云扬声器女声
            "speed": 50,
            "pitch": 50,
            "volume": 0,
            "lang": "en",
            "codec": "mp3",
            "modeltype": 1,
        }

        headers = {
            "Content-Type": "application/json",
        }

        response = requests.post(url, json=payload, headers=headers, timeout=30)

        if response.status_code == 200:
            return response.content
        else:
            print(f"  ❌ HTTP {response.status_code}: {response.text[:100]}")
            return None

    except Exception as e:
        print(f"  ❌ 异常: {str(e)}")
        return None


def upload_to_cos(local_file, cos_key):
    """上传文件到腾讯云COS"""
    try:
        # 使用requests直接上传到COS
        url = f"{COS_BASE_URL}/{cos_key}"

        with open(local_file, 'rb') as f:
            file_content = f.read()

        # 使用匿名访问（公共读）或带签名的访问
        # 这里使用简单PUT方式上传
        response = requests.put(
            url,
            data=file_content,
            headers={
                'Content-Type': 'audio/mpeg',
            },
            timeout=60
        )

        if response.status_code in [200, 201]:
            print(f"  ☁️ 已上传到COS: {cos_key}")
            return True
        else:
            print(f"  ❌ COS上传失败: {response.status_code}")
            return False

    except Exception as e:
        print(f"  ❌ COS上传异常: {str(e)}")
        return False


def clean_filename(text):
    """清理文本为合法的文件名"""
    import re
    # 转小写，移除特殊字符
    clean = text.lower()
    # 只保留字母、数字和空格
    clean = re.sub(r'[^a-z0-9\s]', '', clean)
    # 合并空格为下划线
    clean = '_'.join(clean.split())
    # 限制长度
    clean = clean[:60]
    if not clean:
        clean = "audio"
    return clean + ".mp3"


def main():
    print("=" * 60)
    print("🔊 腾讯云TTS音频生成器")
    print("=" * 60)
    print(f"📁 本地目录: {os.path.abspath(LOCAL_AUDIO_DIR)}")
    print(f"☁️  COS存储: {COS_BUCKET}")
    print()

    # 读取文本列表
    texts_file = './tts_texts.json'
    if not os.path.exists(texts_file):
        print(f"❌ 文件不存在: {texts_file}")
        return

    with open(texts_file, 'r', encoding='utf-8') as f:
        texts = json.load(f)

    print(f"📝 待处理: {len(texts)} 个文本")
    print()

    # 检查已存在的音频
    existing_files = set(os.listdir(LOCAL_AUDIO_DIR)) if os.path.exists(LOCAL_AUDIO_DIR) else set()
    print(f"📂 已存在音频: {len(existing_files)} 个")
    print()

    # 处理每个文本
    success = 0
    failed = 0
    skipped = 0

    for i, item in enumerate(texts):
        text = item['text']
        filename = clean_filename(text)

        # 进度显示
        progress = f"[{i+1}/{len(texts)}]"
        text_preview = text[:35] + "..." if len(text) > 35 else text
        print(f"{progress} {text_preview:<40}", end="", flush=True)

        # 检查本地是否已存在
        local_path = os.path.join(LOCAL_AUDIO_DIR, filename)
        if os.path.exists(local_path):
            print(f"  ⏭️ 已存在")
            skipped += 1
            continue

        # 生成TTS音频
        audio_data = call_tencent_tts(text)

        if audio_data and len(audio_data) > 1000:
            # 保存到本地
            with open(local_path, 'wb') as f:
                f.write(audio_data)
            print(f"  ✅ {filename} ({len(audio_data)//1024}KB)")

            # 上传到COS
            cos_key = f"TTS/{filename}"
            upload_to_cos(local_path, cos_key)

            success += 1
        else:
            failed += 1
            print(f"  ❌ 生成失败")

        # 避免请求过快
        time.sleep(0.2)

    print()
    print("=" * 60)
    print(f"📊 处理完成:")
    print(f"  ✅ 成功: {success}")
    print(f"  ⏭️ 跳过: {skipped}")
    print(f"  ❌ 失败: {failed}")
    print(f"  📁 本地目录: {os.path.abspath(LOCAL_AUDIO_DIR)}")
    print("=" * 60)

    # 如果有生成的音频，打印上传命令
    if success > 0:
        print()
        print("📋 下一步操作:")
        print("  1. 使用COS Browser或coscmd工具上传本地音频到COS")
        print(f"  2. 上传命令: coscmd upload -r ./tts_audio/ TTS/")
        print("  3. 或者使用腾讯云控制台上传")


if __name__ == "__main__":
    main()
