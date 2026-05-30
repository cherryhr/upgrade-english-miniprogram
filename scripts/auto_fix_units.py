#!/usr/bin/env python3
"""
自动修复units-data.js中的不一致文本
生成时间: 自动
"""

import re

def apply_fixes():
    units_file = "/Users/huangrong/Desktop/upgrade-english-miniprogram/utils/units-data.js"

    with open(units_file, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # 词汇修复 (共 7 个)
    content = content.replace(
        'en: "Hi My name is Amy. Nice to meet you"',
        'en: "hi! my name is amy. nice to meet you!"'
    )
    content = content.replace(
        'en: "Good morning, Miss Wang How are you?"',
        'en: "good morning miss wang how are you"'
    )
    content = content.replace(
        'en: "Can you sit down, please?"',
        'en: "can you sit down please?"'
    )
    content = content.replace(
        'en: "Yes, Miss I am sitting down now."',
        'en: "yes miss i am sitting down now."'
    )
    content = content.replace(
        'en: "Can you see a rainbow? How many colours?"',
        'en: "can you see a rainbow how many colours"'
    )
    content = content.replace(
        'en: "Playing together is so much fun"',
        'en: "playing together is so much fun!"'
    )
    content = content.replace(
        'en: "Well done Congratulations You are amazing"',
        'en: "well done! congratulations! you are amazing!"'
    )

    # 句型修复 (共 0 个)

    # 写入文件
    with open(units_file, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"✅ 修复完成! 共修改 {len(word_fixes) + len(sentence_fixes)} 处")

if __name__ == "__main__":
    apply_fixes()
