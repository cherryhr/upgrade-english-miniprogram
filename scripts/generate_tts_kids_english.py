#!/usr/bin/env python3
"""
腾讯云TTS音频生成脚本 - 童声英式发音版本
使用TC3-HMAC-SHA256签名调用腾讯云TTS
生成适合儿童学习的慢速英式发音音频
"""

import os
import sys
import json
import time
import hashlib
import hmac
import base64
import requests
from datetime import datetime

# 安装依赖
try:
    from qcloud_cos import CosConfig, CosS3Client
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "cos-python-sdk-v5", "-q"])
    from qcloud_cos import CosConfig, CosS3Client

# 腾讯云配置（从环境变量读取，请勿硬编码密钥）
SECRET_ID = os.environ.get("TENCENT_SECRET_ID", "")
SECRET_KEY = os.environ.get("TENCENT_SECRET_KEY", "")
COS_BUCKET = "upgrade-videos-1412449710"
COS_REGION = "ap-guangzhou"

# 童声英式发音配置
# VoiceType: 0=女声(中文), 1=男声(中文), 5=云扬声器, 101004=英文儿童音
# Speed: 0-100，默认50，越小越慢
VOICE_TYPE = 101004  # 英文儿童音
SPEED = 30  # 较慢语速 (0-100)，30约为0.75x
VOLUME = 0  # 音量
CODEC = "mp3"
MODEL_TYPE = 1  # 使用基础模型

# 本地音频目录
LOCAL_AUDIO_DIR = "./tts_kids_english_audio"
os.makedirs(LOCAL_AUDIO_DIR, exist_ok=True)


def sign_tc3(secret_key, date, service, string_to_sign):
    """TC3-HMAC-SHA256签名"""
    def _hmac_sha256(key, msg):
        return hmac.new(key, msg.encode('utf-8'), hashlib.sha256).digest()

    # Step 1: signing_key = HMAC-sha256(HMAC-sha256(HMAC-sha256("TC3" + SecretKey, Date), Service), "request")
    secret_date = _hmac_sha256(("TC3" + secret_key).encode('utf-8'), date)
    secret_service = _hmac_sha256(secret_date, service)
    secret_signing = _hmac_sha256(secret_service, "request")
    signature = hmac.new(secret_signing, string_to_sign.encode('utf-8'), hashlib.sha256).hexdigest()
    return signature


def call_tencent_tts_kids_english(text):
    """使用TC3签名调用腾讯云TTS - 童声英式发音"""
    # API配置
    host = "tts.cloud.tencent.com"
    service = "tts"
    version = "2019-08-23"
    action = "TextToStreamAudio"

    # 时间格式
    date = datetime.utcnow().strftime('%Y-%m-%d')
    timestamp = int(time.time())

    # 构造HTTP请求参数
    http_request_method = "POST"
    canonical_uri = "/stream"
    canonical_query_string = ""
    canonical_headers = f"content-type:application/json\nhost:{host}\n"
    signed_headers = "content-type;host"

    # 请求体 - 童声英式发音
    payload = json.dumps({
        "Text": text[:200],
        "SessionId": f"tts_kids_{timestamp}",
        "VoiceType": VOICE_TYPE,  # 英文儿童音
        "Speed": SPEED,  # 较慢语速
        "Volume": VOLUME,
        "Codec": CODEC,
        "ModelType": MODEL_TYPE,
        "Language": 1,  # 英文
    })

    # 构造待签名字符串
    hashed_request_payload = hashlib.sha256(payload.encode('utf-8')).hexdigest()
    canonical_request = f"{http_request_method}\n{canonical_uri}\n{canonical_query_string}\n{canonical_headers}\n{signed_headers}\n{hashed_request_payload}"

    # 计算签名
    algorithm = "TC3-HMAC-SHA256"
    credential_scope = f"{date}/{service}/tc3_request"
    hashed_canonical_request = hashlib.sha256(canonical_request.encode('utf-8')).hexdigest()
    string_to_sign = f"{algorithm}\n{timestamp}\n{credential_scope}\n{hashed_canonical_request}"

    signature = sign_tc3(SECRET_KEY, date, service, string_to_sign)

    # 构造Authorization头
    authorization = (
        f"{algorithm} "
        f"Credential={SECRET_ID}/{credential_scope}, "
        f"SignedHeaders={signed_headers}, "
        f"Signature={signature}"
    )

    # 发送请求
    url = f"https://{host}{canonical_uri}"
    headers = {
        "Authorization": authorization,
        "Content-Type": "application/json",
        "Host": host,
        "X-Date": str(timestamp),
        "X-Version": version,
        "X-Action": action
    }

    try:
        response = requests.post(url, headers=headers, data=payload, timeout=30)

        if response.status_code == 200:
            return response.content
        else:
            print(f"HTTP {response.status_code}: {response.text[:100]}")
            return None
    except Exception as e:
        print(f"请求错误: {e}")
        return None


def init_cos_client():
    """初始化COS客户端"""
    config = CosConfig(Region=COS_REGION, SecretId=SECRET_ID, SecretKey=SECRET_KEY)
    return CosS3Client(config)


def clean_filename(text):
    """清理文本为合法的文件名"""
    import re
    clean = text.lower()
    clean = re.sub(r'[^a-z0-9\s]', '', clean)
    clean = '_'.join(clean.split())
    clean = clean[:60]
    return (clean or "audio") + ".mp3"


def get_all_texts():
    """从units-data.js和tts.js中提取所有需要生成的文本"""
    texts = []
    
    # 从 units-data.js 提取
    try:
        with open('../utils/units-data.js', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 提取所有英文文本
        import re
        # 匹配 en: 'xxx' 或 en: "xxx"
        en_patterns = re.findall(r"en:\s*['\"]([^'\"]+)['\"]", content)
        for text in en_patterns:
            if text and len(text) > 1:
                texts.append({'text': text, 'source': 'units-data'})
        
        # 匹配 q: { en: 'xxx' }
        q_patterns = re.findall(r"q:\s*\{\s*en:\s*['\"]([^'\"]+)['\"]", content)
        for text in q_patterns:
            if text and len(text) > 1:
                texts.append({'text': text, 'source': 'units-data'})
        
        # 匹配 a: { en: 'xxx' }
        a_patterns = re.findall(r"a:\s*\{\s*en:\s*['\"]([^'\"]+)['\"]", content)
        for text in a_patterns:
            if text and len(text) > 1:
                texts.append({'text': text, 'source': 'units-data'})
        
        # 匹配 song lyrics
        song_patterns = re.findall(r"text:\s*['\"]([^'\"]+)['\"]", content)
        for text in song_patterns:
            if text and len(text) > 1:
                texts.append({'text': text, 'source': 'song'})
        
    except Exception as e:
        print(f"读取 units-data.js 失败: {e}")
    
    # 从 tts.js 提取
    try:
        with open('../utils/tts.js', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 提取 fullMap 中的所有文本
        text_patterns = re.findall(r"text:\s*['\"]([^'\"]+)['\"]", content)
        for text in text_patterns:
            if text and len(text) > 1:
                texts.append({'text': text, 'source': 'tts-map'})
        
    except Exception as e:
        print(f"读取 tts.js 失败: {e}")
    
    # 去重
    seen = set()
    unique_texts = []
    for item in texts:
        if item['text'] not in seen:
            seen.add(item['text'])
            unique_texts.append(item)
    
    return unique_texts


def main():
    print("=" * 60)
    print("🔊 腾讯云TTS音频生成器 - 童声英式发音版")
    print(f"   VoiceType: {VOICE_TYPE} (英文儿童音)")
    print(f"   Speed: {SPEED} (较慢语速)")
    print("=" * 60)

    # 初始化COS客户端
    print("\n🔗 初始化COS客户端...")
    cos_client = init_cos_client()
    print("✅ COS客户端已就绪")

    # 测试TTS
    print("\n🔍 测试腾讯云TTS API (童声英式发音)...")
    test_audio = call_tencent_tts_kids_english("Hello, my name is Amy.")

    if test_audio and len(test_audio) > 1000:
        print(f"✅ TTS API可用，音频大小: {len(test_audio)} bytes")
        test_file = os.path.join(LOCAL_AUDIO_DIR, "test_kids_english.mp3")
        with open(test_file, 'wb') as f:
            f.write(test_audio)
        print(f"✅ 测试音频已保存: {test_file}")
        print(f"📁 请播放测试音频确认是否为童声英式发音")
        
        # 询问是否继续
        response = input("\n按 Enter 继续生成所有音频，或输入 'q' 退出: ")
        if response.lower() == 'q':
            print("已退出")
            return
    else:
        print("❌ TTS API不可用，请检查配置")
        return

    # 获取所有文本
    texts = get_all_texts()
    print(f"\n📝 待处理: {len(texts)} 个文本")
    print()

    # 处理
    success = 0
    failed = 0
    skipped = 0

    for i, item in enumerate(texts):
        text = item['text']
        filename = clean_filename(text)
        local_path = os.path.join(LOCAL_AUDIO_DIR, filename)
        cos_key = f"TTS/{filename}"

        progress = f"[{i+1}/{len(texts)}]"
        text_preview = (text[:30] + "...") if len(text) > 30 else text
        print(f"{progress} {text_preview:<35}", end="", flush=True)

        if os.path.exists(local_path):
            print(f"  ⏭️ 已存在")
            skipped += 1
            continue

        audio = call_tencent_tts_kids_english(text)

        if audio and len(audio) > 1000:
            with open(local_path, 'wb') as f:
                f.write(audio)

            # 上传到COS
            try:
                cos_client.put_object(
                    Bucket=COS_BUCKET, 
                    Body=open(local_path, 'rb'), 
                    Key=cos_key, 
                    ContentType='audio/mpeg'
                )
                print(f"  ✅ ({len(audio)//1024}KB) ☁️ COS")
            except Exception as e:
                print(f"  ✅ ({len(audio)//1024}KB) ⚠️ COS上传失败")
            success += 1
        else:
            print(f"  ❌ 生成失败")
            failed += 1

        time.sleep(0.2)  # 稍微减慢请求频率

    print()
    print("=" * 60)
    print(f"📊 完成: 成功{success} | 跳过{skipped} | 失败{failed}")
    print(f"📁 本地文件: {LOCAL_AUDIO_DIR}/")
    print("=" * 60)
    
    # 生成新的映射文件
    print("\n📝 生成新的TTS映射表...")
    new_map = []
    for i, item in enumerate(texts):
        text = item['text']
        filename = clean_filename(text)
        new_map.append({
            'text': text,
            'file': filename,
            'voice': 'kids_english'
        })
    
    map_file = os.path.join(LOCAL_AUDIO_DIR, 'kids_english_map.json')
    with open(map_file, 'w', encoding='utf-8') as f:
        json.dump(new_map, f, ensure_ascii=False, indent=2)
    print(f"✅ 映射表已保存: {map_file}")
    print(f"   共 {len(new_map)} 条记录")


if __name__ == "__main__":
    main()
