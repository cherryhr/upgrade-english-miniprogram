#!/usr/bin/env node
/**
 * 全面TTS音频诊断工具
 * 检查所有发音项与COS音频的匹配情况
 */

const COS_TTS_BASE = 'https://upgrade-videos-1412449710.cos.ap-guangzhou.myqcloud.com/TTS/';

// ===== 1. 从 units-data.js 提取所有发音项 =====
// 直接内联数据避免模块加载问题
const UNITS = [
  {
    id: 'u1', vocab: [
      { en: 'Hello' }, { en: 'Hi' },
      { en: 'Good morning' }, { en: 'Good afternoon' },
      { en: 'Good night' }, { en: 'Goodbye' },
      { en: 'See you' }, { en: 'Bye bye' }
    ],
    sentences: [
      { q: { en: 'Hello! What is your name?' }, a: { en: 'Hi! My name is Amy. Nice to meet you!' } },
      { q: { en: 'How are you today?' }, a: { en: "I'm fine, thank you! And you?" } },
      { q: { en: 'Good morning, Miss Wang! How are you?' }, a: { en: "Good morning! I'm very well, thank you!" } },
      { q: { en: 'Goodbye! See you tomorrow!' }, a: { en: 'Bye bye! Have a good day!' } }
    ],
    song: { lines: [
      { text: 'Hello, hello, hello' }, { text: 'How are you today?' },
      { text: 'I am fine, thank you' }, { text: 'Hip hip hooray' }
    ]}
  },
  {
    id: 'u2', vocab: [
      { en: 'Sit down' }, { en: 'Stand up' }, { en: 'Hands up' },
      { en: 'Be quiet' }, { en: 'Listen' }, { en: 'Look' },
      { en: 'Open your book' }, { en: 'Close your book' }
    ],
    sentences: [
      { q: { en: 'Can you sit down, please?' }, a: { en: 'Yes, Miss! I am sitting down now.' } },
      { q: { en: 'Please stand up! Are you ready?' }, a: { en: "Yes! I'm ready! I'm standing up!" } },
      { q: { en: 'Who knows the answer? Hands up!' }, a: { en: 'Me! Me! I know the answer!' } },
      { q: { en: 'Listen carefully and repeat after me.' }, a: {} }
    ],
    song: { lines: [
      { text: 'Sit down, sit down' }, { text: 'Stand up, stand up' },
      { text: 'Hands up, hands up' }, { text: 'Be quiet, shhh' },
      { text: 'Listen, listen Listen to me' }
    ]}
  },
  {
    id: 'u3', vocab: [
      { en: 'Boy' }, { en: 'Girl' }, { en: 'Friend' },
      { en: 'Name' }, { en: 'Old' }, { en: 'Like' }, { en: 'Live' }, { en: 'From' }
    ],
    sentences: [
      { q: { en: "What's your name?" }, a: { en: 'My name is Lily. What about you?' } },
      { q: { en: 'How old are you?' }, a: { en: "I'm five years old. How old are you?" } },
      { q: { en: 'Where are you from?' }, a: { en: "I'm from Beijing. Where are you from?" } },
      { q: { en: 'Do you want to be my friend?' }, a: { en: "Yes! Nice to meet you! Let's be friends!" } }
    ],
    song: { lines: [
      { text: 'What is your name? What is your name?' }, { text: 'My name is Tom What a great name' },
      { text: 'How old are you? How old are you?' }, { text: "I'm five years old, Hip hip hooray" }
    ]}
  },
  {
    id: 'u4', vocab: [
      { en: 'Happy' }, { en: 'Sad' }, { en: 'Angry' }, { en: 'Scared' },
      { en: 'Tired' }, { en: 'Excited' }, { en: 'Sick' }, { en: 'Surprised' }
    ],
    sentences: [
      { q: { en: 'How are you feeling today?' }, a: { en: "I'm feeling happy today! I love school!" } },
      { q: { en: "You look sad. What's wrong?" }, a: { en: "I lost my toy. I feel very sad." } },
      { q: { en: 'Why are you so excited?' }, a: { en: "It's my birthday today! I'm so excited!" } },
      { q: { en: 'Why are you angry?' }, a: { en: "My sister took my pencil! I'm angry!" } }
    ],
    song: { lines: [
      { text: 'How are you today? How are you?' }, { text: "I'm happy, happy, happy" },
      { text: 'How are you today? How are you?' }, { text: "I'm sad, sad, sad today..." }
    ]}
  },
  {
    id: 'u5', vocab: [
      { en: 'Red' }, { en: 'Blue' }, { en: 'Yellow' }, { en: 'Green' },
      { en: 'Orange' }, { en: 'Purple' }, { en: 'Black' }, { en: 'White' }, { en: 'Pink' }
    ],
    sentences: [
      { q: { en: 'What colour is this apple?' }, a: { en: "It's red! Red like a fire engine!" } },
      { q: { en: 'What is your favourite colour?' }, a: { en: 'My favourite colour is yellow! Yellow like the sun!' } },
      { q: { en: 'Can you see a rainbow? How many colours?' }, a: { en: 'Yes! A rainbow has seven beautiful colours!' } }
    ],
    song: { lines: [
      { text: 'Red, red, red' }, { text: 'Blue, blue, blue' },
      { text: 'Yellow, yellow, yellow' }, { text: 'Green, green, green' },
      { text: 'Rainbow colours, so beautiful' }
    ]}
  },
  {
    id: 'u6', vocab: [
      { en: 'One' }, { en: 'Two' }, { en: 'Three' }, { en: 'Four' }, { en: 'Five' },
      { en: 'Six' }, { en: 'Seven' }, { en: 'Eight' }, { en: 'Nine' }, { en: 'Ten' }
    ],
    sentences: [
      { q: { en: 'Can you count to ten?' }, a: { en: 'Yes! One, two, three, four, five, six, seven, eight, nine, ten!' } },
      { q: { en: 'How many apples are on the table?' }, a: { en: 'There are five apples on the table!' } },
      { q: { en: 'How old are you? How many candles?' }, a: { en: "I'm four years old! Four candles on my cake!" } }
    ],
    song: { lines: [
      { text: 'One, two, three, four, five' }, { text: 'Once I caught a fish alive' },
      { text: 'Six, seven, eight, nine, ten' }, { text: 'Then I let it go again' }
    ]}
  },
  {
    id: 'u7', vocab: [
      { en: 'Cat' }, { en: 'Dog' }, { en: 'Mouse' }, { en: 'Rabbit' },
      { en: 'Lion' }, { en: 'Elephant' }, { en: 'Penguin' }, { en: 'Frog' }, { en: 'Dolphin' }, { en: 'Giraffe' }
    ],
    sentences: [
      { q: { en: 'What animal is this? It says meow!' }, a: { en: "It's a cat! Cats say meow meow!" } },
      { q: { en: 'Is the elephant big or small?' }, a: { en: "The elephant is very big! It's the biggest land animal!" } },
      { q: { en: 'What does a lion do?' }, a: { en: 'A lion roars! Roar! Lions are very brave!' } }
    ],
    song: { lines: [
      { text: 'The lion says ROAR' }, { text: 'The dog says WOOF' },
      { text: 'The cat says MEOW' }, { text: 'The cow says MOOO' },
      { text: 'Animals, animals, we love you' }
    ]}
  },
  {
    id: 'u8', vocab: [
      { en: 'Mum' }, { en: 'Dad' }, { en: 'Brother' }, { en: 'Sister' },
      { en: 'Grandpa' }, { en: 'Grandma' }, { en: 'Home' }, { en: 'Love' }
    ],
    sentences: [
      { q: { en: 'Who is this in the photo?' }, a: { en: "This is my family! Mum, Dad, and me!" } },
      { q: { en: 'Is your dad tall?' }, a: { en: "Yes! My dad is very tall and strong!" } },
      { q: { en: 'Do you love your grandma?' }, a: { en: "Yes! I love my grandma very much! She makes yummy food!" } }
    ],
    song: { lines: [
      { text: 'This is my family' }, { text: 'Mum and Dad and me' },
      { text: 'I love my family' }, { text: 'Happy, happy family' }
    ]}
  },
  {
    id: 'u9', vocab: [
      { en: 'Eyes' }, { en: 'Nose' }, { en: 'Mouth' }, { en: 'Ear' },
      { en: 'Leg' }, { en: 'Foot' }, { en: 'Arm' }, { en: 'Hands' }, { en: 'Head' }
    ],
    sentences: [
      { q: { en: 'Where is your nose? Can you point to it?' }, a: { en: 'Here is my nose! Right here in the middle of my face!' } },
      { q: { en: 'How many eyes do you have?' }, a: { en: 'I have two eyes! Two big beautiful eyes!' } },
      { q: { en: 'What can you do with your hands?' }, a: { en: 'I can clap, wave, draw and play with my hands!' } }
    ],
    song: { lines: [
      { text: 'Head, shoulders, knees and toes' }, { text: 'Knees and toes' },
      { text: 'Eyes and ears and mouth and nose' }, { text: 'Head, shoulders, knees and toes' },
      { text: 'Knees and toes, knees and toes' }
    ]}
  },
  {
    id: 'u10', vocab: [
      { en: 'Apple' }, { en: 'Banana' }, { en: 'Carrot' }, { en: 'Pizza' },
      { en: 'Ice cream' }, { en: 'Cake' }, { en: 'Milk' }, { en: 'Rice' }, { en: 'Egg' }
    ],
    sentences: [
      { q: { en: 'What do you like to eat?' }, a: { en: 'I like apples and bananas! They are sweet and yummy!' } },
      { q: { en: 'Do you like carrots?' }, a: { en: "No, I don't like carrots. But I like pizza!" } },
      { q: { en: 'Does the cake taste good?' }, a: { en: 'Yes! Yummy! It is so delicious! Can I have more?' } }
    ],
    song: { lines: [
      { text: 'Apples, apples, so red and sweet' }, { text: 'Bananas, bananas, so yellow and neat' },
      { text: 'Pizza, pizza, so yummy to eat' }, { text: 'I love yummy food Hip hip hooray' }
    ]}
  },
  {
    id: 'u11', vocab: [
      { en: 'Ball' }, { en: 'Teddy bear' }, { en: 'Doll' }, { en: 'Train' },
      { en: 'Car' }, { en: 'Yo-yo' }, { en: 'Game' }, { en: 'Puzzle' }
    ],
    sentences: [
      { q: { en: 'What is your favourite toy?' }, a: { en: 'My favourite toy is my teddy bear! His name is Brown!' } },
      { q: { en: 'Do you want to play ball with me?' }, a: { en: "Yes! Let's play ball! I love football!" } },
      { q: { en: 'Playing together is so much fun!' }, a: {} }
    ],
    song: { lines: [
      { text: 'In my toy box, what do I see?' }, { text: 'A bouncy ball bouncing at me' },
      { text: 'A teddy bear soft as can be' }, { text: 'A little toy car, zoom zoom zoom' },
      { text: 'I love my toys, hip hip hooray' }
    ]}
  },
  {
    id: 'u12', vocab: [
      { en: 'Review' }, { en: 'Sing' }, { en: 'Perform' }, { en: 'Clap' },
      { en: 'Champion' }, { en: 'Star' }, { en: 'Graduate' }, { en: 'Celebrate' }
    ],
    sentences: [
      { q: { en: 'Can you sing a song for us?' }, a: { en: "Yes! I can sing! Listen to me: Hello hello hello!" } },
      { q: { en: 'What have you learned in UpGrade English?' }, a: { en: "I learned greetings, colours, numbers, animals and more!" } },
      { q: { en: 'Well done! Congratulations! You are amazing!' }, a: {} }
    ],
    song: { lines: [
      { text: 'We learned our ABCs' }, { text: 'We counted 1, 2, 3' },
      { text: 'We know our colours bright' }, { text: 'We learned to say hello' },
      { text: 'We did it, we did it, hooray' }
    ]}
  }
];

const MODULES_ABC = [
  { en: 'A - Apple' }, { en: 'B - Ball' }, { en: 'C - Cat' }, { en: 'D - Dog' },
  { en: 'E - Egg' }, { en: 'F - Fish' }, { en: 'G - Grape' }, { en: 'H - Hat' },
  { en: 'I - Ice cream' }, { en: 'J - Juice' }, { en: 'K - Kite' }, { en: 'L - Lion' },
  { en: 'M - Moon' }, { en: 'N - Nest' }, { en: 'O - Orange' }, { en: 'P - Pig' },
  { en: 'Q - Queen' }, { en: 'R - Rainbow' }, { en: 'S - Star' }, { en: 'T - Tiger' },
  { en: 'U - Umbrella' }, { en: 'V - Violin' }, { en: 'W - Whale' }, { en: 'X - Xylophone' },
  { en: 'Y - Yo-yo' }, { en: 'Z - Zebra' }
];

// ===== 2. 提取所有发音文本 =====
function extractAllTexts() {
  const texts = new Set();

  UNITS.forEach(unit => {
    // vocab 单词
    (unit.vocab || []).forEach(v => {
      if (v.en) texts.add(v.en);
    });
    // sentences 句型
    (unit.sentences || []).forEach(s => {
      if (s.q && s.q.en) texts.add(s.q.en);
      if (s.a && s.a.en) texts.add(s.a.en);
    });
    // song lyrics
    (unit.song && unit.song.lines || []).forEach(l => {
      if (l.text) texts.add(l.text);
    });
  });

  // ABC 模块
  MODULES_ABC.forEach(item => {
    if (item.en) texts.add(item.en);
  });

  return Array.from(texts);
}

// ===== 3. tts.js 映射表（简化版）=====
function cleanText(text) {
  if (!text) return '';
  let clean = text
    .replace(/!/g, '')
    .replace(/"/g, "'")
    .replace(/'/g, "'")
    .replace(/:/g, ' ')
    .replace(/;/g, '')
    .replace(/[【】]/g, '')
    .replace(/[（）()]/g, '')
    .replace(/[，。]/g, ',')
    .replace(/,/g, ' ')
    .replace(/[.。]+/g, '.')
    .replace(/\s+/g, ' ')
    .trim();
  if (clean.length > 100) clean = clean.substring(0, 100);
  return clean;
}

// ===== 4. 运行诊断 =====
const allTexts = extractAllTexts();
console.log('='.repeat(60));
console.log('📊 TTS 音频全面诊断报告');
console.log('='.repeat(60));
console.log(`\n总发音项数量: ${allTexts.length}`);

// 分类统计
const vocabCount = UNITS.reduce((sum, u) => sum + (u.vocab?.length || 0), 0);
const sentenceQCount = UNITS.reduce((sum, u) => sum + u.sentences.filter(s => s.q?.en).length, 0);
const sentenceACount = UNITS.reduce((sum, u) => sum + u.sentences.filter(s => s.a?.en).length, 0);
const lyricCount = UNITS.reduce((sum, u) => sum + (u.song?.lines?.length || 0), 0);

console.log(`- 词汇数量: ${vocabCount}`);
console.log(`- 问句数量: ${sentenceQCount}`);
console.log(`- 答句数量: ${sentenceACount}`);
console.log(`- 歌词数量: ${lyricCount}`);
console.log(`- ABC模块: ${MODULES_ABC.length}`);

// 显示部分样本
console.log('\n📝 前20个发音项样本:');
allTexts.slice(0, 20).forEach((t, i) => console.log(`  ${i+1}. ${t}`));

console.log('\n' + '='.repeat(60));
console.log('💡 建议: 请检查 COS 上实际存在的音频文件列表');
console.log('    并对比 tts.js 中的 getCosFilename 映射表');
console.log('='.repeat(60));
