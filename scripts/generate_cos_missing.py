#!/usr/bin/env python3
"""
腾讯云TTS音频批量生成和上传脚本
生成缺失的137个音频文件并上传到COS
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
import datetime

# 腾讯云配置（从环境变量读取，请勿硬编码密钥）
SECRET_ID = os.environ.get("TENCENT_SECRET_ID", "")
SECRET_KEY = os.environ.get("TENCENT_SECRET_KEY", "")
APP_ID = os.environ.get("TENCENT_APP_ID", "")

# COS配置
COS_BUCKET = "upgrade-videos-1412449710"
COS_REGION = "ap-guangzhou"
COS_BASE_URL = f"https://{COS_BUCKET}.cos.ap-guangzhou.myqcloud.com"

# 本地音频目录
LOCAL_AUDIO_DIR = "./tts_audio"
os.makedirs(LOCAL_AUDIO_DIR, exist_ok=True)


def generate_signature():
    """生成腾讯云TTS API签名"""
    nonce = ''.join(random.choice(string.ascii_letters + string.digits) for _ in range(16))
    timestamp = int(time.time())
    
    sign_str = f"appid={APP_ID}&secretid={SECRET_ID}&secretkey={SECRET_KEY}&timestamp={timestamp}&noncestr={nonce}"
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
        url = "https://tts.cloud.tencent.com/stream"
        
        # 清理文本
        clean = text.replace('!', '').replace('?', '').replace(',', ',')
        clean = ' '.join(clean.split()).strip()
        if not clean:
            return None
        
        sig = generate_signature()
        
        payload = {
            "appid": sig["appid"],
            "secretid": sig["secretid"],
            "timestamp": sig["timestamp"],
            "nonce": sig["noncestr"],
            "sign": sig["sign"],
            "text": clean[:200],
            "sessionid": f"tts_{int(time.time() * 1000)}",
            "voicetype": 6,  # 英式发音
            "speed": 50,
            "pitch": 50,
            "volume": 0,
            "lang": "en",
            "codec": "mp3",
            "modeltype": 1,
        }
        
        headers = {"Content-Type": "application/json"}
        
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        
        if response.status_code == 200:
            return response.content
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
            print(f"  ❌ COS: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"  ❌ COS异常: {str(e)}")
        return False


def filename_to_text(filename):
    """从文件名推断原始文本（用于TTS）"""
    # 移除.mp3后缀
    name = filename.replace('.mp3', '')
    # 下划线转空格
    text = name.replace('_', ' ')
    # 首字母大写
    text = text.title()
    return text


def main():
    print("=" * 60)
    print("🔊 腾讯云TTS批量生成器")
    print("   生成缺失的137个音频文件")
    print("=" * 60)
    
    # 读取缺失文件列表
    with open('./cos_missing_files.json', 'r') as f:
        missing_files = json.load(f)
    
    print(f"\n📝 待生成: {len(missing_files)} 个音频")
    
    success = 0
    failed = 0
    skipped = 0
    
    for i, filename in enumerate(missing_files):
        progress = f"[{i+1}/{len(missing_files)}]"
        print(f"{progress} {filename:<55}", end="", flush=True)
        
        # 检查本地是否已存在
        local_path = os.path.join(LOCAL_AUDIO_DIR, filename)
        if os.path.exists(local_path):
            print(f"  ⏭️ 本地已存在")
            # 但仍需上传到COS
            cos_key = f"TTS/{filename}"
            if upload_to_cos(local_path, cos_key):
                skipped += 1
            continue
        
        # 从文件名推断文本
        text = filename_to_text(filename)
        
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
        
        time.sleep(0.2)
    
    print()
    print("=" * 60)
    print(f"📊 处理完成:")
    print(f"  ✅ 成功: {success}")
    print(f"  ⏭️ 跳过(已上传): {skipped}")
    print(f"  ❌ 失败: {failed}")
    print(f"  📁 本地目录: {os.path.abspath(LOCAL_AUDIO_DIR)}")
    print("=" * 60)


if __name__ == "__main__":
    main()
