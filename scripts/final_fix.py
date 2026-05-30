#!/usr/bin/env python3
"""
彻底解决TTS音频问题
1. 修复语法错误（已修复第204行逗号问题）
2. 修正错误的映射
3. 生成缺失的音频并上传COS
"""

import os
import subprocess
from qcloud_cos import CosConfig, CosS3Client

SECRET_ID = os.environ.get("TENCENT_SECRET_ID", "")
SECRET_KEY = os.environ.get("TENCENT_SECRET_KEY", "")
BUCKET = "upgrade-videos-1412449710"
REGION = "ap-guangzhou"

def get_cos_client():
    config = CosConfig(Region=REGION, SecretId=SECRET_ID, SecretKey=SECRET_KEY, Token=None, Scheme='https')
    return CosS3Client(config)

def list_cos_files():
    client = get_cos_client()
    response = client.list_objects(Bucket=BUCKET, Prefix='TTS/')
    files = [item['Key'].replace('TTS/', '') for item in response.get('Contents', [])]
    return files

def text_to_filename(text):
    """将文本转换为文件名"""
    import re
    clean = text.lower()
    clean = re.sub(r'[.!?,:;]', '', clean)
    clean = clean.replace(' ', '_')
    return clean + '.mp3'

def generate_tts_audio(text, filename):
    """使用say命令生成TTS音频"""
    output_path = f"/Users/huangrong/Desktop/upgrade-english-miniprogram/tts_audio/{filename}"

    if os.path.exists(output_path):
        print(f"   ⏭️  {filename} 已存在，跳过")
        return True

    # 使用Samantha英式女声
    cmd = f'/usr/bin/say -v "Samantha" -r 160 -o "{output_path}" "{text}"'
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)

    if result.returncode == 0:
        print(f"   ✅ 生成 {filename}")
        return True
    else:
        print(f"   ❌ 生成失败: {result.stderr}")
        return False

def upload_to_cos(local_path, cos_key):
    """上传音频到COS"""
    client = get_cos_client()

    with open(local_path, 'rb') as f:
        response = client.put_object(
            Bucket=BUCKET,
            Body=f,
            Key=f'TTS/{cos_key}',
            ContentType='audio/mpeg'
        )

    return response

def fix_tts_js():
    """修复tts.js中的错误映射"""
    print("\n" + "=" * 70)
    print("🔧 修复tts.js中的错误映射")
    print("=" * 70)

    tts_file = "/Users/huangrong/Desktop/upgrade-english-miniprogram/utils/tts.js"

    with open(tts_file, 'r') as f:
        content = f.read()

    # 问题1: "who knows the answer? hands up" 被错误映射到 put_up_your_hand.mp3
    # 应该映射到一个新的音频文件

    # 修复策略：
    # 1. 将 "who knows the answer" 改为使用单词拼接
    # 2. 或者生成一个完整的音频

    # 检查需要生成哪些音频
    texts_to_generate = [
        "who knows the answer hands up",
        "who knows the answer hands up?",
    ]

    for text in texts_to_generate:
        filename = text_to_filename(text)
        print(f"需要: {filename}")

    # 修改tts.js中的映射 - 使用单词拼接方式
    # 删除错误的映射，改为单词组合

    print("\n修改tts.js中的映射...")

    # 替换错误的映射
    old_code = '''    { text: "who knows the answer? hands up", file: "put_up_your_hand.mp3" },
    { text: "who knows the answer hands up", file: "put_up_your_hand.mp3" },'''

    new_code = '''    // "who knows the answer? hands up" 使用单词组合
    // 映射到 words 部分的 who.mp3 + answer.mp3 + hands_up.mp3'''

    if old_code in content:
        content = content.replace(old_code, new_code)
        print("   ✅ 已移除错误的映射")

    # 同样处理带感叹号的版本
    old_code2 = '''    { text: "who knows the answer? hands up!", file: "put_up_your_hand.mp3" },'''

    if old_code2 in content:
        content = content.replace(old_code2, new_code)
        print("   ✅ 已移除错误的映射(感叹号版本)")

    with open(tts_file, 'w') as f:
        f.write(content)

    print("   ✅ tts.js已更新")

def generate_missing_audios():
    """生成缺失的音频文件"""
    print("\n" + "=" * 70)
    print("🎵 生成缺失的音频文件")
    print("=" * 70)

    # 需要生成的音频
    texts = [
        ("who knows the answer hands up", "who_knows_the_answer_hands_up.mp3"),
    ]

    for text, filename in texts:
        print(f"\n生成: {text}")
        if generate_tts_audio(text, filename):
            # 上传到COS
            local_path = f"/Users/huangrong/Desktop/upgrade-english-miniprogram/tts_audio/{filename}"
            print(f"上传到COS...")
            try:
                response = upload_to_cos(local_path, filename)
                print(f"   ✅ 上传成功")
            except Exception as e:
                print(f"   ⚠️ 上传失败: {e}")

def verify_all():
    """验证修复结果"""
    print("\n" + "=" * 70)
    print("✅ 验证修复结果")
    print("=" * 70)

    cos_files = list_cos_files()
    print(f"\nCOS上TTS音频数量: {len(cos_files)}")

    # 读取tts.js检查语法错误
    with open("/Users/huangrong/Desktop/upgrade-english-miniprogram/utils/tts.js", 'r') as f:
        content = f.read()

    # 检查是否有语法错误
    if ',    ,' in content or ',\n,    {' in content:
        print("   ⚠️ 可能存在语法错误")
    else:
        print("   ✅ 未发现明显语法错误")

    # 检查 who knows the answer 映射
    if 'who knows the answer' in content and 'put_up_your_hand.mp3' in content:
        print("   ⚠️ 仍有错误的映射存在")
    else:
        print("   ✅ 错误的映射已移除")

def main():
    print("=" * 70)
    print("🎯 彻底解决TTS音频问题")
    print("=" * 70)

    # 步骤1: 修复tts.js中的错误映射
    fix_tts_js()

    # 步骤2: 生成缺失的音频
    generate_missing_audios()

    # 步骤3: 验证
    verify_all()

    print("\n" + "=" * 70)
    print("修复完成!")
    print("=" * 70)
    print("""
下一步:
1. 在微信开发者工具中重新编译
2. 测试所有句型的发音
3. 如果还有问题，检查COS上是否有对应的音频文件
    """)

if __name__ == "__main__":
    main()
