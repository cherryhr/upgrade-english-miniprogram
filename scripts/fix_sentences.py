#!/usr/bin/env python3
"""
批量修改units-data.js中的句子，去掉感叹号以匹配音频
"""
import re

# 读取文件
with open('utils/units-data.js', 'r') as f:
    content = f.read()

# 定义需要替换的映射（原文 -> 替换后）
replacements = [
    # U1 问候与告别
    ("Hello! What is your name?", "Hello What is your name?"),
    ("Hi! My name is Amy. Nice to meet you!", "Hi My name is Amy. Nice to meet you"),
    ("Good morning, Miss Wang! How are you?", "Good morning, Miss Wang How are you?"),
    ("Goodbye! See you tomorrow!", "Goodbye See you tomorrow"),
    ("Bye bye! Have a good day!", "Bye bye Have a good day"),
    
    # U2 课堂指令
    ("Yes, Miss! I am sitting down now.", "Yes, Miss I am sitting down now."),
    ("Please stand up! Are you ready?", "Please stand up Are you ready?"),
    ("Who knows the answer? Hands up!", "Who knows the answer? Hands up"),
    ("Me! Me! I know the answer!", "Me Me I know the answer"),
    
    # U4 情绪
    ("I'm feeling happy today! I love school!", "I'm feeling happy today I love school"),
    ("It's my birthday today! I'm so excited!", "It's my birthday today I'm so excited"),
    ("My sister took my pencil! I'm angry!", "My sister took my pencil I'm angry"),
    
    # U5 颜色
    ("It's red! Red like a fire engine!", "It's red Red like a fire engine"),
    ("My favourite colour is yellow! Yellow like the sun!", "My favourite colour is yellow Yellow like the sun"),
    ("Yes! A rainbow has seven beautiful colours!", "Yes A rainbow has seven beautiful colours"),
    
    # U6 数字
    ("Yes! One, two, three, four, five, six, seven, eight, nine, ten!", "Yes One, two, three, four, five, six, seven, eight, nine, ten"),
    ("There are five apples on the table!", "There are five apples on the table"),
    ("I'm four years old! Four candles on my cake!", "I'm four years old Four candles on my cake"),
    
    # U7 动物
    ("What animal is this? It says meow!", "What animal is this? It says meow"),
    ("It's a cat! Cats say meow meow!", "It's a cat Cats say meow meow"),
    ("The elephant is very big! It's the biggest land animal!", "The elephant is very big It's the biggest land animal"),
    ("A lion roars! Roar! Lions are very brave!", "A lion roars Roar Lions are very brave"),
    
    # U8 家庭
    ("This is my family! Mum, Dad, and me!", "This is my family Mum Dad and me"),
    ("Yes! My dad is very tall and strong!", "Yes My dad is very tall and strong"),
    ("Yes! I love my grandma very much! She makes yummy food!", "Yes I love my grandma very much She makes yummy food"),
    
    # U9 身体
    ("Here is my nose! Right here in the middle of my face!", "Here is my nose Right here in the middle of my face"),
    ("I have two eyes! Two big beautiful eyes!", "I have two eyes Two big beautiful eyes"),
    ("I can clap, wave, draw and play with my hands!", "I can clap wave draw and play with my hands"),
    
    # U10 食物
    ("I like apples and bananas! They are sweet and yummy!", "I like apples and bananas They are sweet and yummy"),
    ("Yes! Yummy! It is so delicious! Can I have more?", "Yes Yummy It is so delicious Can I have more"),
    
    # U11 玩具
    ("My favourite toy is my teddy bear! His name is Brown!", "My favourite toy is my teddy bear His name is Brown"),
    ("Playing together is so much fun!", "Playing together is so much fun"),
    
    # U12 复习
    ("Yes! I can sing! Listen to me: Hello hello hello!", "Yes I can sing Listen to me Hello hello hello"),
    ("I learned greetings, colours, numbers, animals and more!", "I learned greetings colours numbers animals and more"),
    ("Well done! Congratulations! You are amazing!", "Well done Congratulations You are amazing"),
    
    # 歌曲歌词
    ("Hip hip hooray 🎉", "Hip hip hooray"),
    ("I am fine, thank you", "I am fine thank you"),
]

# 执行替换
for old, new in replacements:
    if old in content:
        content = content.replace(old, new)
        print(f"✅ 替换: {old[:50]}...")

# 保存文件
with open('utils/units-data.js', 'w') as f:
    f.write(content)

print("\n✅ 所有替换完成！")
