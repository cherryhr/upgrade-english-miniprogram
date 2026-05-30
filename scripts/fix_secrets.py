#!/usr/bin/env python3
"""批量替换脚本中的硬编码密钥为环境变量"""
import os
import re

files = [
    'scripts/upload-to-cos.js',
    'scripts/sync-cos-audio.js',
    'scripts/deploy.py',
    'scripts/complete_fix.py',
    'scripts/generate_tts_final.py',
    'scripts/generate_with_say.js',
    'scripts/generate_tts_v3.py',
    'scripts/generate_missing_tts.py',
    'scripts/thorough_fix.py',
    'scripts/generate_tts_youdao.py',
    'scripts/final_fix.py',
    'scripts/fix_tts_duplicate.py',
    'scripts/generate_tts_tencent.py',
]

for f in files:
    if not os.path.exists(f):
        print(f'NOT FOUND: {f}')
        continue
    with open(f, 'r') as fp:
        content = fp.read()
    original = content
    
    if f.endswith('.py'):
        content = re.sub(
            r"SECRET_ID\s*=\s*['\"].*?['\"]",
            'SECRET_ID = os.environ.get("TENCENT_SECRET_ID", "")',
            content
        )
        content = re.sub(
            r"SECRET_KEY\s*=\s*['\"].*?['\"]",
            'SECRET_KEY = os.environ.get("TENCENT_SECRET_KEY", "")',
            content
        )
    elif f.endswith('.js'):
        content = re.sub(
            r"const SECRET_ID\s*=\s*['\"].*?['\"]",
            "const SECRET_ID = process.env.TENCENT_SECRET_ID || '';",
            content
        )
        content = re.sub(
            r"const SECRET_KEY\s*=\s*['\"].*?['\"]",
            "const SECRET_KEY = process.env.TENCENT_SECRET_KEY || '';",
            content
        )
        content = re.sub(
            r"SecretId\s*:\s*['\"].*?['\"]",
            "SecretId: process.env.TENCENT_SECRET_ID || ''",
            content
        )
        content = re.sub(
            r"SecretKey\s*:\s*['\"].*?['\"]",
            "SecretKey: process.env.TENCENT_SECRET_KEY || ''",
            content
        )
    
    if content != original:
        with open(f, 'w') as fp:
            fp.write(content)
        print(f'FIXED: {f}')
    else:
        print(f'UNCHANGED: {f}')
