// UpGrade English - 课程数据
// 基于 Oxford Phonics World 风格，专为4-8岁儿童设计

const UNITS = [
  {
    id: 'u1', emoji: '👋', name: 'Greetings & Farewells', zh: '问候与告别', color: '#FF6B6B',
    vocab: [
      { emoji: '👋', en: 'Hello', zh: '你好' }, { emoji: '🙋', en: 'Hi', zh: '嗨' },
      { emoji: '🌅', en: 'Good morning', zh: '早上好' }, { emoji: '☀️', en: 'Good afternoon', zh: '下午好' },
      { emoji: '🌙', en: 'Good night', zh: '晚安' }, { emoji: '👋', en: 'Goodbye', zh: '再见' },
      { emoji: '😊', en: 'See you', zh: '回头见' }, { emoji: '🤗', en: 'Bye bye', zh: '拜拜' }
    ],
    sentences: [
      { type: 'qa', q: { icon: '🙋', en: 'Hello What is your name?', zh: '你好！你叫什么名字？' }, a: { icon: '🏷️', en: 'Hi My name is Amy', zh: '嗨！我叫艾米！' } },
      { type: 'qa', q: { icon: '❓', en: 'How are you today?', zh: '你今天好吗？' }, a: { icon: '😊', en: "I'm fine, thank you! And you?", zh: '我很好，谢谢！你呢？' } },
      { type: 'qa', q: { icon: '🌅', en: 'Good morning, Miss Wang How are you?', zh: '早上好，王老师！你好吗？' }, a: { icon: '☀️', en: "Good morning! I'm very well, thank you!", zh: '早上好！我很好，谢谢你！' } },
      { type: 'standalone', icon: '👋', en: 'Goodbye See you tomorrow', zh: '再见！明天见！' },
      { type: 'standalone', icon: '🤗', en: 'Bye bye Have a good day', zh: '拜拜！祝你有美好的一天！' }
    ],
    song: { title: '🎵 Hello Song', lines: [
      { text: 'Hello, hello, hello', zh: '你好，你好，你好！' },
      { text: 'How are you today?', zh: '你今天好吗？' },
      { text: 'I am fine thank you', zh: '我很好，谢谢你！' },
      { text: 'Hip hip hooray', zh: '太棒了！' }
    ]},
    games: { memory: { pairs: 4, desc: 'Match greetings with pictures!' }, quiz: { count: 4, desc: 'Answer greeting questions!' }, spelling: { words: ['Hello', 'Hi', 'Goodbye', 'Morning'], desc: 'Spell the greeting words!' }, bubble: { correct: 'Hello', options: ['Hello', 'Goodbye', 'Cat', 'Dog'], desc: 'Pop the right bubble!' } }
  },
  {
    id: 'u2', emoji: '🎯', name: 'Classroom Commands', zh: '课堂指令', color: '#feca57',
    vocab: [
      { emoji: '🪑', en: 'Sit down', zh: '坐下' }, { emoji: '🧍', en: 'Stand up', zh: '起立' },
      { emoji: '✋', en: 'Hands up', zh: '举手' }, { emoji: '🤫', en: 'Be quiet', zh: '安静' },
      { emoji: '👂', en: 'Listen', zh: '听' }, { emoji: '👀', en: 'Look', zh: '看' },
      { emoji: '📖', en: 'Open your book', zh: '打开书本' }, { emoji: '📚', en: 'Close your book', zh: '合上书本' }
    ],
    sentences: [
      { type: 'qa', q: { icon: '🧑‍🏫', en: 'Can you sit down, please?', zh: '请坐下好吗？' }, a: { icon: '🪑', en: 'Yes, Miss I am sitting down now.', zh: '好的老师！我现在坐下了。' } },
      { type: 'qa', q: { icon: '🧑‍🏫', en: 'Please stand up Are you ready?', zh: '请起立！准备好了吗？' }, a: { icon: '🧍', en: "Yes! I'm ready! I'm standing up!", zh: '是的！我准备好了！我站起来了！' } },
      { type: 'qa', q: { icon: '🧑‍🏫', en: 'Who knows the answer? Hands up', zh: '谁知道答案？请举手！' }, a: { icon: '✋', en: 'Me Me I know the answer', zh: '我！我！我知道答案！' } },
      { type: 'standalone', icon: '👂', en: 'Listen carefully and repeat after me.', zh: '认真听，跟我重复。' }
    ],
    song: { title: '🎵 Command Song', lines: [
      { text: 'Sit down, sit down 🪑', zh: '坐下，坐下！' },
      { text: 'Stand up, stand up 🧍', zh: '起立，起立！' },
      { text: 'Hands up, hands up ✋', zh: '举手，举手！' },
      { text: 'Be quiet, shhh 🤫', zh: '安静，嘘！' },
      { text: 'Listen, listen Listen to me 👂', zh: '听，听！认真听我说！' }
    ]},
    games: { memory: { pairs: 4, desc: 'Match the commands!' }, quiz: { count: 4, desc: 'Follow the classroom rules!' }, spelling: { words: ['Sit', 'Stand', 'Quiet', 'Listen'], desc: 'Spell the command words!' }, bubble: { correct: 'Sit down', options: ['Sit down', 'Stand up', 'Hello', 'Cat'], desc: 'Pop the correct command!' } }
  },
  {
    id: 'u3', emoji: '👫', name: 'Friends & Me', zh: '认识朋友与自我', color: '#1B4FD8',
    vocab: [
      { emoji: '👦', en: 'Boy', zh: '男孩' }, { emoji: '👧', en: 'Girl', zh: '女孩' },
      { emoji: '🧑', en: 'Friend', zh: '朋友' }, { emoji: '🏷️', en: 'Name', zh: '名字' },
      { emoji: '🔢', en: 'Old', zh: '岁' }, { emoji: '❤️', en: 'Like', zh: '喜欢' },
      { emoji: '🏠', en: 'Live', zh: '住' }, { emoji: '📍', en: 'From', zh: '来自' }
    ],
    sentences: [
      { type: 'qa', q: { icon: '❓', en: "What's your name?", zh: '你叫什么名字？' }, a: { icon: '🏷️', en: 'My name is Lily. What about you?', zh: '我的名字是莉莉。你呢？' } },
      { type: 'qa', q: { icon: '❓', en: 'How old are you?', zh: '你几岁了？' }, a: { icon: '🔢', en: "I'm five years old.", zh: '我五岁了。' } },
      { type: 'qa', q: { icon: '❓', en: 'Where are you from?', zh: '你来自哪里？' }, a: { icon: '📍', en: "I am from Beijing. Where are you from?", zh: '我来自北京。你来自哪里？' } },
      { type: 'qa', q: { icon: '❓', en: 'Do you want to be my friend?', zh: '你想和我做朋友吗？' }, a: { icon: '🤝', en: "Yes! Nice to meet you! Let's be friends!", zh: '是的！很高兴认识你！我们做朋友吧！' } }
    ],
    song: { title: '🎵 Friends Song', lines: [
      { text: 'What is your name? What is your name? 🏷️', zh: '你叫什么名字？' },
      { text: 'My name is Tom What a great name 👦', zh: '我叫汤姆！多好的名字！' },
      { text: 'How old are you? How old are you? 🔢', zh: '你几岁了？你几岁了？' },
      { text: "I'm five years old, Hip hip hooray", zh: '我五岁了！太棒了！' }
    ]},
    games: { memory: { pairs: 4, desc: 'Match the friends words!' }, quiz: { count: 4, desc: 'Ask and answer about friends!' }, spelling: { words: ['Name', 'Friend', 'Boy', 'Girl'], desc: 'Spell the friend words!' }, bubble: { correct: 'Name', options: ['Name', 'Cat', 'Dog', 'Car'], desc: 'Pop the correct word!' } }
  },
  {
    id: 'u4', emoji: '😊', name: 'Feelings & Emotions', zh: '情绪感受', color: '#27AE60',
    vocab: [
      { emoji: '😊', en: 'Happy', zh: '开心' }, { emoji: '😢', en: 'Sad', zh: '难过' },
      { emoji: '😠', en: 'Angry', zh: '生气' }, { emoji: '😨', en: 'Scared', zh: '害怕' },
      { emoji: '😴', en: 'Tired', zh: '累了' }, { emoji: '🤩', en: 'Excited', zh: '兴奋' },
      { emoji: '🤒', en: 'Sick', zh: '生病' }, { emoji: '😮', en: 'Surprised', zh: '惊讶' }
    ],
    sentences: [
      { type: 'qa', q: { icon: '❓', en: 'How are you feeling today?', zh: '你今天感觉怎么样？' }, a: { icon: '😊', en: "I am feeling happy today and I love school", zh: '我今天很开心！我喜欢上学！' } },
      { type: 'qa', q: { icon: '😢', en: "You look sad. What's wrong?", zh: '你看起来很难过。怎么了？' }, a: { icon: '😢', en: "I lost my toy. I feel very sad.", zh: '我的玩具丢了。我很难过。' } },
      { type: 'qa', q: { icon: '🤩', en: 'Why are you so excited?', zh: '你为什么这么兴奋？' }, a: { icon: '🎉', en: "It's my birthday today", zh: '今天是我的生日！' } },
      { type: 'qa', q: { icon: '😠', en: 'Why are you angry?', zh: '你为什么生气？' }, a: { icon: '😤', en: "My sister took my pen. So I am angry", zh: '我姐姐拿走了我的笔！所以我很生气！' } }
    ],
    song: { title: '🎵 Feelings Song', lines: [
      { text: 'How are you today? How are you? 😊', zh: '你今天怎么样？' },
      { text: "I'm happy, happy, happy", zh: '我开心，开心，开心！' },
      { text: 'How are you today? How are you? 😢', zh: '你今天怎么样？' },
      { text: "I'm sad, sad, sad today... 😢", zh: '我难过，难过，难过...' }
    ]},
    games: { memory: { pairs: 4, desc: 'Match the feelings!' }, quiz: { count: 4, desc: 'How do you feel today?' }, spelling: { words: ['Happy', 'Sad', 'Angry', 'Scared'], desc: 'Spell the feeling words!' }, bubble: { correct: 'Happy', options: ['Happy', 'Cat', 'Dog', 'Car'], desc: 'Pop the right feeling!' } }
  },
  {
    id: 'u5', emoji: '🌈', name: 'Colours & Numbers', zh: '颜色与数字', color: '#e91e8c',
    vocab: [
      { emoji: '🔴', en: 'Red', zh: '红色' }, { emoji: '🔵', en: 'Blue', zh: '蓝色' },
      { emoji: '💛', en: 'Yellow', zh: '黄色' }, { emoji: '🟢', en: 'Green', zh: '绿色' },
      { emoji: '🟠', en: 'Orange', zh: '橙色' }, { emoji: '🟣', en: 'Purple', zh: '紫色' },
      { emoji: '⚫', en: 'Black', zh: '黑色' }, { emoji: '⚪', en: 'White', zh: '白色' },
      { emoji: '🩷', en: 'Pink', zh: '粉色' }
    ],
    sentences: [
      { type: 'qa', q: { icon: '❓', en: 'What colour is this apple?', zh: '这个苹果是什么颜色？' }, a: { icon: '🔴', en: "It's red Red like a fire engine", zh: '它是红色的！就像消防车一样红！' } },
      { type: 'qa', q: { icon: '❓', en: 'What is your favourite colour?', zh: '你最喜欢什么颜色？' }, a: { icon: '💛', en: 'My favourite colour is yellow', zh: '我最喜欢黄色！' } },
      { type: 'qa', q: { icon: '🌈', en: 'Can you see a rainbow? How many colours?', zh: '你能看到彩虹吗？有多少种颜色？' }, a: { icon: '🎨', en: 'Yes A rainbow has seven beautiful colours', zh: '是的！彩虹有七种美丽的颜色！' } }
    ],
    song: { title: '🎵 Rainbow Colours', lines: [
      { text: 'Red, red, red 🔴', zh: '红，红，红！' },
      { text: 'Blue, blue, blue 🔵', zh: '蓝，蓝，蓝！' },
      { text: 'Yellow, yellow, yellow 💛', zh: '黄，黄，黄！' },
      { text: 'Green, green, green 🟢', zh: '绿，绿，绿！' },
      { text: 'Rainbow colours, so beautiful 🌈', zh: '彩虹的颜色，真美丽！' }
    ]},
    games: { memory: { pairs: 4, desc: 'Match colours with pictures!' }, quiz: { count: 4, desc: 'What colour is this?' }, spelling: { words: ['Red', 'Blue', 'Yellow', 'Green'], desc: 'Spell the colour words!' }, bubble: { correct: 'Red', options: ['Red', 'Dog', 'Cat', 'Car'], desc: 'Pop the red bubble!' } }
  },
  {
    id: 'u6', emoji: '🔢', name: 'Numbers 1-10', zh: '数字1-10', color: '#9b59b6',
    vocab: [
      { emoji: '1️⃣', en: 'One', zh: '一' }, { emoji: '2️⃣', en: 'Two', zh: '二' },
      { emoji: '3️⃣', en: 'Three', zh: '三' }, { emoji: '4️⃣', en: 'Four', zh: '四' },
      { emoji: '5️⃣', en: 'Five', zh: '五' }, { emoji: '6️⃣', en: 'Six', zh: '六' },
      { emoji: '7️⃣', en: 'Seven', zh: '七' }, { emoji: '8️⃣', en: 'Eight', zh: '八' },
      { emoji: '9️⃣', en: 'Nine', zh: '九' }, { emoji: '🔟', en: 'Ten', zh: '十' }
    ],
    sentences: [
      { type: 'qa', q: { icon: '🔢', en: 'Can you count to ten?', zh: '你能数到十吗？' }, a: { icon: '🙌', en: 'Yes One, two, three, four, five, six, seven, eight, nine, ten 🎉', zh: '能！一，二，三，四，五，六，七，八，九，十！' } },
      { type: 'qa', q: { icon: '❓', en: 'How many apples are on the table?', zh: '桌子上有多少个苹果？' }, a: { icon: '5️⃣', en: 'There are five apples on the table', zh: '桌子上有五个苹果！' } },
      { type: 'qa', q: { icon: '❓', en: 'How old are you? How many candles?', zh: '你几岁了？蛋糕上有几根蜡烛？' }, a: { icon: '4️⃣', en: "I am four years old. Four candles are on my cake", zh: '我四岁了！我的蛋糕上有四根蜡烛！' } }
    ],
    song: { title: '🎵 Counting Song', lines: [
      { text: 'One, two, three, four, five 🔢', zh: '一，二，三，四，五！' },
      { text: 'Once I caught a fish alive 🐟', zh: '我曾抓住一条活鱼！' },
      { text: 'Six, seven, eight, nine, ten 🔢', zh: '六，七，八，九，十！' },
      { text: 'Then I let it go again 🐟', zh: '然后我又把它放走了！' }
    ]},
    games: { memory: { pairs: 4, desc: 'Match numbers 1-8!' }, quiz: { count: 4, desc: 'Count and answer!' }, spelling: { words: ['One', 'Two', 'Three', 'Four'], desc: 'Spell the number words!' }, bubble: { correct: 'Five', options: ['Five', 'Red', 'Cat', 'Dog'], desc: 'Pop the number Five!' } }
  },
  {
    id: 'u7', emoji: '🦁', name: 'Animals', zh: '动物世界', color: '#e67e22',
    vocab: [
      { emoji: '🐱', en: 'Cat', zh: '猫' }, { emoji: '🐶', en: 'Dog', zh: '狗' },
      { emoji: '🐭', en: 'Mouse', zh: '老鼠' }, { emoji: '🐰', en: 'Rabbit', zh: '兔子' },
      { emoji: '🦁', en: 'Lion', zh: '狮子' }, { emoji: '🐘', en: 'Elephant', zh: '大象' },
      { emoji: '🐧', en: 'Penguin', zh: '企鹅' }, { emoji: '🐸', en: 'Frog', zh: '青蛙' },
      { emoji: '🐬', en: 'Dolphin', zh: '海豚' }, { emoji: '🦒', en: 'Giraffe', zh: '长颈鹿' }
    ],
    sentences: [
      { type: 'qa', q: { icon: '❓', en: 'What animal is this? It says meow', zh: '这是什么动物？它喵喵叫！' }, a: { icon: '🐱', en: "It's a cat Cats say meow meow 🐾", zh: '它是一只猫！猫咪喵喵叫！' } },
      { type: 'qa', q: { icon: '❓', en: 'Is the elephant big or small?', zh: '大象是大还是小？' }, a: { icon: '🐘', en: "The elephant is very big", zh: '大象非常大！' } },
      { type: 'qa', q: { icon: '❓', en: 'What does a lion do?', zh: '狮子做什么？' }, a: { icon: '🦁', en: 'A lion roars Roar Lions are very brave', zh: '狮子咆哮！吼！狮子非常勇敢！' } }
    ],
    song: { title: '🎵 Animal Sounds', lines: [
      { text: 'The lion says ROAR 🦁', zh: '狮子说：吼！' },
      { text: 'The dog says WOOF 🐶', zh: '狗狗说：汪！' },
      { text: 'The cat says MEOW 🐱', zh: '猫咪说：喵！' },
      { text: 'The cow says MOOO 🐮', zh: '奶牛说：哞！' },
      { text: 'Animals, animals, we love you ❤️', zh: '动物们，我们爱你！' }
    ]},
    games: { memory: { pairs: 4, desc: 'Match the animals!' }, quiz: { count: 4, desc: 'What animal is this?' }, spelling: { words: ['Cat', 'Dog', 'Lion', 'Bear'], desc: 'Spell the animal words!' }, bubble: { correct: 'Cat', options: ['Cat', 'Red', 'One', 'Happy'], desc: 'Pop the cat bubble!' } }
  },
  {
    id: 'u8', emoji: '👨‍👩‍👧', name: 'My Family', zh: '我的家庭', color: '#3498db',
    vocab: [
      { emoji: '👩', en: 'Mum', zh: '妈妈' }, { emoji: '👨', en: 'Dad', zh: '爸爸' },
      { emoji: '👦', en: 'Brother', zh: '哥哥/弟弟' }, { emoji: '👧', en: 'Sister', zh: '姐姐/妹妹' },
      { emoji: '👴', en: 'Grandpa', zh: '爷爷/外公' }, { emoji: '👵', en: 'Grandma', zh: '奶奶/外婆' },
      { emoji: '🏠', en: 'Home', zh: '家' }, { emoji: '❤️', en: 'Love', zh: '爱' }
    ],
    sentences: [
      { type: 'qa', q: { icon: '❓', en: 'Who is this in the photo?', zh: '照片里这是谁？' }, a: { icon: '👨‍👩‍👧', en: "This is my family Mum Dad and me", zh: '这是我的家人！妈妈、爸爸和我！' } },
      { type: 'qa', q: { icon: '❓', en: 'Is your dad tall?', zh: '你的爸爸高吗？' }, a: { icon: '👨', en: "Yes My dad is very tall and strong", zh: '是的！我的爸爸非常高大强壮！' } },
      { type: 'qa', q: { icon: '❓', en: 'Do you love your grandma?', zh: '你爱你的奶奶吗？' }, a: { icon: '👵', en: "Yes I love my grandma very much She makes yummy food", zh: '是的！我非常爱我奶奶！她做的食物很好吃！' } }
    ],
    song: { title: '🎵 Family Song', lines: [
      { text: 'This is my family 👨‍👩‍👧', zh: '这是我的家人！' },
      { text: 'Mum and Dad and me ❤️', zh: '妈妈和爸爸和我！' },
      { text: 'I love my family ❤️', zh: '我爱我的家！' },
      { text: 'Happy, happy family 🏠', zh: '幸福的家庭！' }
    ]},
    games: { memory: { pairs: 4, desc: 'Match family words!' }, quiz: { count: 4, desc: 'Who is in your family?' }, spelling: { words: ['Mum', 'Dad', 'Home', 'Love'], desc: 'Spell the family words!' }, bubble: { correct: 'Dad', options: ['Dad', 'Cat', 'Red', 'One'], desc: 'Pop the dad bubble!' } }
  },
  {
    id: 'u9', emoji: '👀', name: 'Body Parts', zh: '身体部位', color: '#1abc9c',
    vocab: [
      { emoji: '👀', en: 'Eyes', zh: '眼睛' }, { emoji: '👁️', en: 'Nose', zh: '鼻子' },
      { emoji: '👄', en: 'Mouth', zh: '嘴巴' }, { emoji: '👂', en: 'Ear', zh: '耳朵' },
      { emoji: '🦵', en: 'Leg', zh: '腿' }, { emoji: '🦶', en: 'Foot', zh: '脚' },
      { emoji: '💪', en: 'Arm', zh: '手臂' }, { emoji: '🙌', en: 'Hands', zh: '手' },
      { emoji: '🧠', en: 'Head', zh: '头' }
    ],
    sentences: [
      { type: 'qa', q: { icon: '❓', en: 'Where is your nose? Can you point to it?', zh: '你的鼻子在哪里？你能指出来吗？' }, a: { icon: '👁️', en: 'Here is my nose', zh: '我的鼻子在这里！' } },
      { type: 'qa', q: { icon: '❓', en: 'How many eyes do you have?', zh: '你有几只眼睛？' }, a: { icon: '👀', en: 'I have two eyes Two big beautiful eyes', zh: '我有两只眼睛！两只大大的漂亮眼睛！' } },
      { type: 'qa', q: { icon: '❓', en: 'What can you do with your hands?', zh: '你的手能做什么？' }, a: { icon: '🙌', en: 'I can clap wave draw', zh: '我的手能拍手、挥手、画画！' } }
    ],
    song: { title: '🎵 Head Shoulders Knees', lines: [
      { text: 'Head, shoulders, knees and toes 🧠', zh: '头、肩膀、膝盖和脚趾！' },
      { text: 'Knees and toes 🦶', zh: '膝盖和脚趾！' },
      { text: 'Eyes and ears and mouth and nose 👀', zh: '眼睛、耳朵、嘴巴和鼻子！' },
      { text: 'Head, shoulders, knees and toes 🧠', zh: '头、肩膀、膝盖和脚趾！' },
      { text: 'Knees and toes, knees and toes 😄', zh: '膝盖和脚趾！真简单！' }
    ]},
    games: { memory: { pairs: 4, desc: 'Match body parts!' }, quiz: { count: 4, desc: 'Point to your body!' }, spelling: { words: ['Head', 'Eyes', 'Nose', 'Mouth'], desc: 'Spell the body words!' }, bubble: { correct: 'Head', options: ['Head', 'Cat', 'Dog', 'Car'], desc: 'Pop the head bubble!' } }
  },
  {
    id: 'u10', emoji: '🍎', name: 'Food & Drinks', zh: '食物与饮料', color: '#e74c3c',
    vocab: [
      { emoji: '🍎', en: 'Apple', zh: '苹果' }, { emoji: '🍌', en: 'Banana', zh: '香蕉' },
      { emoji: '🥕', en: 'Carrot', zh: '胡萝卜' }, { emoji: '🍕', en: 'Pizza', zh: '披萨' },
      { emoji: '🍦', en: 'Ice cream', zh: '冰淇淋' }, { emoji: '🎂', en: 'Cake', zh: '蛋糕' },
      { emoji: '🥛', en: 'Milk', zh: '牛奶' }, { emoji: '🍚', en: 'Rice', zh: '米饭' },
      { emoji: '🥚', en: 'Egg', zh: '鸡蛋' }
    ],
    sentences: [
      { type: 'qa', q: { icon: '❓', en: 'What do you like to eat?', zh: '你喜欢吃什么？' }, a: { icon: '🍎', en: 'I like apples and bananas', zh: '我喜欢苹果和香蕉！' } },
      { type: 'qa', q: { icon: '❓', en: 'Do you like carrots?', zh: '你喜欢胡萝卜吗？' }, a: { icon: '❌', en: "No, I don't like carrots. But I like pizza!", zh: '不，我不喜欢胡萝卜。但我喜欢披萨！' } },
      { type: 'qa', q: { icon: '😋', en: 'Does the cake taste good?', zh: '蛋糕好吃吗？' }, a: { icon: '🎂', en: 'Yes Yummy It is so delicious Can I have more', zh: '好吃！太美味了！我可以再来一块吗？' } }
    ],
    song: { title: '🎵 Yummy Food', lines: [
      { text: 'Apples, apples, so red and sweet 🍎', zh: '苹果，苹果，红红甜甜！' },
      { text: 'Bananas, bananas, so yellow and neat 🍌', zh: '香蕉，香蕉，黄黄整齐！' },
      { text: 'Pizza, pizza, so yummy to eat 🍕', zh: '披萨，披萨，吃起来好美味！' },
      { text: 'I love yummy food Hip hip hooray', zh: '我爱美味的食物！太棒了！' }
    ]},
    games: { memory: { pairs: 4, desc: 'Match the food!' }, quiz: { count: 4, desc: 'What do you like to eat?' }, spelling: { words: ['Apple', 'Pizza', 'Milk', 'Rice'], desc: 'Spell the food words!' }, bubble: { correct: 'Apple', options: ['Apple', 'Dog', 'Cat', 'Head'], desc: 'Pop the apple bubble!' } }
  },
  {
    id: 'u11', emoji: '⚽', name: 'Toys & Play', zh: '玩具与游戏', color: '#fd79a8',
    vocab: [
      { emoji: '⚽', en: 'Ball', zh: '球' }, { emoji: '🧸', en: 'Teddy bear', zh: '泰迪熊' },
      { emoji: '🎠', en: 'Doll', zh: '玩偶' }, { emoji: '🚂', en: 'Train', zh: '火车' },
      { emoji: '🚗', en: 'Car', zh: '玩具车' }, { emoji: '🪀', en: 'Yo-yo', zh: '溜溜球' },
      { emoji: '🎮', en: 'Game', zh: '游戏' }, { emoji: '🧩', en: 'Puzzle', zh: '拼图' }
    ],
    sentences: [
      { type: 'qa', q: { icon: '❓', en: 'What is your favourite toy?', zh: '你最喜欢的玩具是什么？' }, a: { icon: '🧸', en: 'My favourite toy is my teddy bear', zh: '我最喜欢的玩具是泰迪熊！' } },
      { type: 'qa', q: { icon: '❓', en: 'Do you want to play ball with me?', zh: '你想和我玩球吗？' }, a: { icon: '⚽', en: "Yes! Let's play ball! I love football!", zh: '好的！我们来玩球！我喜欢踢足球！' } },
      { type: 'standalone', icon: '🎉', en: 'Playing together is so much fun', zh: '一起玩耍真是太有趣了！' }
    ],
    song: { title: '🎵 Toy Box', lines: [
      { text: 'In my toy box, what do I see? 🧸', zh: '在我的玩具箱里，我看到什么？' },
      { text: 'A bouncy ball bouncing at me ⚽', zh: '一个弹弹球向我弹来！' },
      { text: 'A teddy bear soft as can be 🐻', zh: '一只柔软的泰迪熊！' },
      { text: 'A little toy car, zoom zoom zoom 🚗', zh: '一辆小玩具车，嗖嗖嗖！' },
      { text: 'I love my toys, hip hip hooray 🎉', zh: '我爱我的玩具，太棒了！' }
    ]},
    games: { memory: { pairs: 4, desc: 'Match the toys!' }, quiz: { count: 4, desc: 'What is your favourite toy?' }, spelling: { words: ['Ball', 'Bear', 'Car', 'Game'], desc: 'Spell the toy words!' }, bubble: { correct: 'Ball', options: ['Ball', 'Apple', 'Head', 'Dad'], desc: 'Pop the ball bubble!' } }
  },
  {
    id: 'u12', emoji: '🎭', name: 'Review & Show', zh: '综合复习与汇报演出', color: '#6c5ce7',
    vocab: [
      { emoji: '⭐', en: 'Review', zh: '复习' }, { emoji: '🎤', en: 'Sing', zh: '唱歌' },
      { emoji: '🎭', en: 'Perform', zh: '表演' }, { emoji: '👏', en: 'Clap', zh: '鼓掌' },
      { emoji: '🏆', en: 'Champion', zh: '冠军' }, { emoji: '🌟', en: 'Star', zh: '星星' },
      { emoji: '🎓', en: 'Graduate', zh: '毕业' }, { emoji: '🎉', en: 'Celebrate', zh: '庆祝' }
    ],
    sentences: [
      { type: 'qa', q: { icon: '❓', en: "Can you sing a song for us?", zh: '你能为我们唱一首歌吗？' }, a: { icon: '🎤', en: "Yes I can sing Listen to me Hello hello hello", zh: '是的！我会唱！听我的：你好你好你好！' } },
      { type: 'qa', q: { icon: '❓', en: "What have you learned in UpGrade English?", zh: '你在UpGrade英语里学了什么？' }, a: { icon: '⭐', en: "I learned greetings colours numbers animals and more", zh: '我学了问候语、颜色、数字、动物和更多！' } },
      { type: 'standalone', icon: '🎉', en: 'Well done Congratulations You are amazing', zh: '做得好！恭喜你！你太棒了！' }
    ],
    song: { title: '🎵 We Did It!', lines: [
      { text: 'We learned our ABCs 🔤', zh: '我们学了英文字母！' },
      { text: 'We counted 1, 2, 3 🔢', zh: '我们数了1，2，3！' },
      { text: 'We know our colours bright 🌈', zh: '我们认识了颜色！' },
      { text: 'We learned to say hello 👋', zh: '我们学会了打招呼！' },
      { text: 'We did it, we did it, hooray 🎉', zh: '我们做到了，万岁！' }
    ]},
    games: { memory: { pairs: 4, desc: 'Match all the words!' }, quiz: { count: 4, desc: 'Final challenge!' }, spelling: { words: ['Star', 'Sing', 'Clap', 'Play'], desc: 'Spell the review words!' }, bubble: { correct: 'Star', options: ['Star', 'Cat', 'Red', 'One'], desc: 'Pop the star bubble!' } }
  }
];

// 从 UNITS 提取歌曲数据用于 Songs 页面
// 每个单元关联腾讯云 COS 上的歌曲视频
const UNIT_VIDEOS = {
  u1: [
    { file: 'U1 Hello!.mp4', title: 'Hello!', desc: 'U1 问候歌曲' },
    { file: 'U1 Good Morning, Mr. Rooster.mp4', title: 'Good Morning', desc: 'U1 早晨问候' },
    { file: 'U1 Bye Bye Goodbye.mp4', title: 'Bye Bye Goodbye', desc: 'U1 再见歌曲' },
  ],
  u2: [
    { file: 'U2 Clean Up!.mp4', title: 'Clean Up!', desc: 'U2 整理歌曲' },
    { file: "U2 If You're Happy And You Know It.mp4", title: "If You're Happy", desc: 'U2 快乐歌曲' },
  ],
  u3: [
    { file: "U3 What's Your Name.mp4", title: "What's Your Name?", desc: 'U3 自我介绍歌曲' },
  ],
  u4: [
    { file: "U4 If You're Happy And You Know It.mp4", title: "If You're Happy", desc: 'U4 情绪歌曲' },
    { file: 'U4-Feelings.mp4', title: 'Feelings Song', desc: 'U4 感受歌曲' },
  ],
  u5: [
    { file: 'U5 The Rainbow Song.mp4', title: 'The Rainbow Song', desc: 'U5 彩虹歌曲' },
    { file: 'U5-Colors.mp4', title: 'Colors Song', desc: 'U5 颜色歌曲' },
  ],
  u6: [
    { file: 'U6-Counting1-10Song.mp4', title: 'Counting 1-10 Song', desc: 'U6 数字歌曲' },
    { file: 'U6-Ten Little Fingers.mp4', title: 'Ten Little Fingers', desc: 'U6 手指歌曲' },
  ],
  u7: [
    { file: 'U7 Old_MacDonald_Had_A_Farm.mp4', title: 'Old MacDonald', desc: 'U7 农场动物歌曲' },
    { file: 'U7 Walking In The Jungle.mp4', title: 'Walking In The Jungle', desc: 'U7 丛林歌曲' },
  ],
  u8: [
    { file: 'U8 The People In My Family.mp4', title: 'My Family', desc: 'U8 家庭歌曲' },
    { file: 'U8- Finger_Family_Song.mp4', title: 'Finger Family', desc: 'U8 手指家庭歌曲' },
  ],
  u9: [
    { file: 'U9 Head Shoulders Knees And Toes.mp4', title: 'Head Shoulders Knees', desc: 'U9 身体部位歌曲' },
    { file: 'U9 Little Animal Dance.mp4', title: 'Little Animal Dance', desc: 'U9 动物舞蹈歌曲' },
  ],
  u10: [
    { file: "U10 Do You Like Broccoli Ice Cream.mp4", title: 'Broccoli Ice Cream', desc: 'U10 食物歌曲' },
    { file: 'U10 Peanut Butter - Jelly.mp4', title: 'Peanut Butter Jelly', desc: 'U10 食物歌曲2' },
  ],
  u11: [
    { file: 'U11 The Wheels On The Bus.mp4', title: 'Wheels On The Bus', desc: 'U11 巴士歌曲' },
  ],
  u12: []  // U12 综合复习，使用之前单元的歌曲
};

const SONGS_DATA = UNITS.map(u => ({
  id: u.id,
  emoji: u.emoji,
  name: u.name,
  zh: u.zh,
  color: u.color,
  song: u.song,
  videos: UNIT_VIDEOS[u.id] || []
}));

// ABC 字母模块
const MODULES_DATA = {
  abc: {
    name: 'ABC 字母', emoji: '🔤', zh: '26个字母发音与词汇',
    items: [
      { emoji: '🍎', letter: 'A', en: 'A - Apple', zh: 'A - 苹果' },
      { emoji: '⚽', letter: 'B', en: 'B - Ball', zh: 'B - 球' },
      { emoji: '🐱', letter: 'C', en: 'C - Cat', zh: 'C - 猫' },
      { emoji: '🐶', letter: 'D', en: 'D - Dog', zh: 'D - 狗' },
      { emoji: '🥚', letter: 'E', en: 'E - Egg', zh: 'E - 鸡蛋' },
      { emoji: '🐟', letter: 'F', en: 'F - Fish', zh: 'F - 鱼' },
      { emoji: '🍇', letter: 'G', en: 'G - Grape', zh: 'G - 葡萄' },
      { emoji: '🎩', letter: 'H', en: 'H - Hat', zh: 'H - 帽子' },
      { emoji: '🍦', letter: 'I', en: 'I - Ice cream', zh: 'I - 冰淇淋' },
      { emoji: '🧃', letter: 'J', en: 'J - Juice', zh: 'J - 果汁' },
      { emoji: '🪁', letter: 'K', en: 'K - Kite', zh: 'K - 风筝' },
      { emoji: '🦁', letter: 'L', en: 'L - Lion', zh: 'L - 狮子' },
      { emoji: '🌙', letter: 'M', en: 'M - Moon', zh: 'M - 月亮' },
      { emoji: '🪹', letter: 'N', en: 'N - Nest', zh: 'N - 鸟巢' },
      { emoji: '🍊', letter: 'O', en: 'O - Orange', zh: 'O - 橙子' },
      { emoji: '🐷', letter: 'P', en: 'P - Pig', zh: 'P - 猪' },
      { emoji: '👸', letter: 'Q', en: 'Q - Queen', zh: 'Q - 女王' },
      { emoji: '🌈', letter: 'R', en: 'R - Rainbow', zh: 'R - 彩虹' },
      { emoji: '⭐', letter: 'S', en: 'S - Star', zh: 'S - 星星' },
      { emoji: '🐯', letter: 'T', en: 'T - Tiger', zh: 'T - 老虎' },
      { emoji: '☂️', letter: 'U', en: 'U - Umbrella', zh: 'U - 雨伞' },
      { emoji: '🎻', letter: 'V', en: 'V - Violin', zh: 'V - 小提琴' },
      { emoji: '🐳', letter: 'W', en: 'W - Whale', zh: 'W - 鲸鱼' },
      { emoji: '🎵', letter: 'X', en: 'X - Xylophone', zh: 'X - 木琴' },
      { emoji: '🪀', letter: 'Y', en: 'Y - Yo-yo', zh: 'Y - 溜溜球' },
      { emoji: '🦓', letter: 'Z', en: 'Z - Zebra', zh: 'Z - 斑马' }
    ]
  }
};

module.exports = { UNITS, SONGS_DATA, MODULES_DATA };
