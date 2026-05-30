#!/usr/bin/env node
/**
 * 完整TTS音频完整性检查
 * 1. 提取所有需要的发音文本
 * 2. 根据 tts.js 逻辑生成期望的音频文件名
 * 3. 检查本地是否存在
 * 4. 输出完整的缺失清单
 */

const fs = require('fs');
const path = require('path');

// 读取本地音频文件列表
const localAudioDir = path.join(__dirname, '..', 'tts_audio');
const localFiles = new Set(fs.readdirSync(localAudioDir).filter(f => f.endsWith('.mp3')));

// ===== 从 units-data.js 提取所有发音项 =====
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

const ABC_ITEMS = [
  { en: 'A - Apple' }, { en: 'B - Ball' }, { en: 'C - Cat' }, { en: 'D - Dog' },
  { en: 'E - Egg' }, { en: 'F - Fish' }, { en: 'G - Grape' }, { en: 'H - Hat' },
  { en: 'I - Ice cream' }, { en: 'J - Juice' }, { en: 'K - Kite' }, { en: 'L - Lion' },
  { en: 'M - Moon' }, { en: 'N - Nest' }, { en: 'O - Orange' }, { en: 'P - Pig' },
  { en: 'Q - Queen' }, { en: 'R - Rainbow' }, { en: 'S - Star' }, { en: 'T - Tiger' },
  { en: 'U - Umbrella' }, { en: 'V - Violin' }, { en: 'W - Whale' }, { en: 'X - Xylophone' },
  { en: 'Y - Yo-yo' }, { en: 'Z - Zebra' }
];

// ===== 清理文本函数 =====
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

// ===== 生成COS文件名（与tts.js完全一致）=====
function getCosFilename(text) {
  if (!text) return null;
  let clean = cleanText(text);
  if (!clean) return null;
  const lower = clean.toLowerCase();

  const fullMap = [
    { text: "hi! my name is amy. nice to meet you!", file: "hi_my_name_is_amy_nice_to_meet_you.mp3" },
    { text: "hi my name is amy. nice to meet you!", file: "hi_my_name_is_amy_nice_to_meet_you.mp3" },
    { text: "hi my name is amy nice to meet you", file: "hi_my_name_is_amy_nice_to_meet_you.mp3" },
    { text: "good morning! i'm very well, thank you!", file: "good_morning_im_very_well_thank_you.mp3" },
    { text: "good morning! i am very well, thank you!", file: "good_morning_im_very_well_thank_you.mp3" },
    { text: "good morning i m very well thank you", file: "good_morning_im_very_well_thank_you.mp3" },
    { text: "yes! i'm ready! i'm standing up!", file: "yes_im_ready_im_standing_up.mp3" },
    { text: "yes i m ready i m standing up", file: "yes_im_ready_im_standing_up.mp3" },
    { text: "who knows the answer? hands up!", file: "put_up_your_hand.mp3" },
    { text: "me! me! i know the answer!", file: "me.mp3" },
    { text: "what's your name?", file: "whats.mp3" },
    { text: "what is your name", file: "what_is_your_name.mp3" },
    { text: "do you want to be my friend?", file: "do_you_want_to_be_friends.mp3" },
    { text: "do you want to be friends", file: "do_you_want_to_be_friends.mp3" },
    { text: "yes! nice to meet you! let's be friends!", file: "yes_let_us_be_friends.mp3" },
    { text: "yes nice to meet you let s be friends", file: "yes_let_us_be_friends.mp3" },
    { text: "you look sad. what's wrong?", file: "you.mp3" },
    { text: "i lost my toy. i feel very sad.", file: "sad.mp3" },
    { text: "why are you so excited?", file: "why.mp3" },
    { text: "it's my birthday today! i'm so excited!", file: "excited.mp3" },
    { text: "why are you angry?", file: "why.mp3" },
    { text: "my sister took my pencil! i'm angry!", file: "angry.mp3" },
    { text: "what colour is this apple?", file: "what_colour_is_the_apple.mp3" },
    { text: "it's red! red like a fire engine!", file: "red.mp3" },
    { text: "my favourite colour is yellow! yellow like the sun!", file: "yellow.mp3" },
    { text: "yes! a rainbow has seven beautiful colours!", file: "yes_a_rainbow_has_seven_beautiful_colours.mp3" },
    { text: "yes! one, two, three, four, five, six, seven, eight, nine, ten!", file: "yes_one_two_three_four_five_six_seven_eight_nine_ten.mp3" },
    { text: "what animal is this? it says meow!", file: "this_is_a_cat_the_cat_says_meow.mp3" },
    { text: "is the elephant big or small?", file: "elephant.mp3" },
    { text: "what does a lion do?", file: "lion.mp3" },
    { text: "there are five apples on the table!", file: "there_are_five_apples_on_the_table.mp3" },
    { text: "can you count to ten?", file: "can_you_count_to_ten.mp3" },
    { text: "there is a cow a pig a horse and a chicken on the farm", file: "there_is_a_cow_a_pig_a_horse_and_a_chicken.mp3" },
    { text: "i'm five years old. how old are you?", file: "im_five_years_old.mp3" },
    { text: "i'm four years old! four candles on my cake!", file: "im_four_years_old_four_candles_on_my_cake.mp3" },
    { text: "i can say red blue yellow green and more", file: "i_can_say_red_blue_yellow_green_and_more.mp3" },
    { text: "there are seven colours in a rainbow", file: "yes_a_rainbow_has_seven_beautiful_colours.mp3" },
    { text: "how many apples are on the table?", file: "how_many_apples_are_on_the_table.mp3" },
    { text: "my name is lily. what about you?", file: "my_name_is.mp3" },
    { text: "i'm from beijing. where are you from?", file: "where.mp3" },
    { text: "i'm feeling happy today! i love school!", file: "happy.mp3" },
    { text: "it's my birthday today! i'm so excited!", file: "excited.mp3" },
    { text: "how are you feeling today?", file: "how_are_you_feeling_today.mp3" },
    { text: "how are you today?", file: "how_are_you_today.mp3" },
    { text: "how are you?", file: "how_are_you.mp3" },
    { text: "i'm fine, thank you! and you?", file: "im_fine_thank_you_and_you.mp3" },
    { text: "i am fine thank you and you", file: "im_fine_thank_you_and_you.mp3" },
    { text: "what colour is the apple?", file: "what_colour_is_the_apple.mp3" },
    { text: "what is your favourite colour?", file: "what_is_your_favourite_colour.mp3" },
    { text: "my favourite colour is yellow", file: "yellow.mp3" },
    { text: "can you see a rainbow? how many colours?", file: "how_many_colours_can_you_say.mp3" },
    { text: "how many colours can you say", file: "how_many_colours_can_you_say.mp3" },
    { text: "there are seven colours in a rainbow", file: "how_many_colours_can_you_say.mp3" },
    { text: "how many hands do you have?", file: "how_many_hands_do_you_have.mp3" },
    { text: "i have two hands. left hand and right hand!", file: "i_have_two_hands_left_hand_and_right_hand.mp3" },
    { text: "i have two hands", file: "hands.mp3" },
    { text: "where are you from?", file: "where_are_you_from.mp3" },
    { text: "i'm from beijing", file: "from.mp3" },
    { text: "what did you learn in this class?", file: "what_did_you_learn_in_this_class.mp3" },
    { text: "i learned greetings colours numbers and more", file: "i_learned_greetings_colours_numbers_and_more.mp3" },
    { text: "do you like apples?", file: "do_you_like_apples.mp3" },
    { text: "i like apples. apples are red and sweet!", file: "yes_i_like_apples_apples_are_red_and_sweet.mp3" },
    { text: "do you want some milk?", file: "do_you_want_some_milk.mp3" },
    { text: "yes please! milk is good for me!", file: "yes_please_milk_is_good_for_me.mp3" },
    { text: "what do you want to eat?", file: "what_do_you_want_to_eat.mp3" },
    { text: "i want to eat pizza. pizza is delicious!", file: "i_want_to_eat_pizza_pizza_is_delicious.mp3" },
    { text: "is the sky blue or green?", file: "is_the_sky_blue_or_green.mp3" },
    { text: "it's blue! the sky is beautiful blue!", file: "its_blue_the_sky_is_beautiful_blue.mp3" },
    { text: "do you have a brother or a sister?", file: "do_you_have_a_brother_or_a_sister.mp3" },
    { text: "i have a brother. his name is tom!", file: "i_have_a_brother_his_name_is_tom.mp3" },
    { text: "who is he? is he your dad?", file: "who_is_he_is_he_your_dad.mp3" },
    { text: "yes, he is my dad. i love my dad!", file: "yes_he_is_my_dad_i_love_my_dad.mp3" },
    { text: "who is she? is she your mum?", file: "who_is_she_is_she_your_mum.mp3" },
    { text: "yes, she is my mum. my mum is nice!", file: "yes_she_is_my_mum_my_mum_is_nice.mp3" },
    { text: "can you draw? what can you draw?", file: "can_you_draw_what_can_you_draw.mp3" },
    { text: "yes i can draw a cat. look at my cat!", file: "yes_i_can_draw_a_cat_look_at_my_cat.mp3" },
    { text: "can you run fast?", file: "can_you_run_fast.mp3" },
    { text: "yes i can run very fast!", file: "yes_i_can_run_very_fast.mp3" },
    { text: "can you sit down, please?", file: "can_you_sit_down_please.mp3" },
    { text: "yes, miss! i am sitting down now.", file: "yes_miss_i_am_sitting_down_now.mp3" },
    { text: "please stand up! are you ready?", file: "please_stand_up_are_you_ready.mp3" },
    { text: "please open your books!", file: "please_open_your_books.mp3" },
    { text: "ok! i'm opening my book now!", file: "ok_im_opening_my_book_now.mp3" },
    { text: "touch your head. can you do it?", file: "touch_your_head_can_you_do_it.mp3" },
    { text: "yes i am touching my head!", file: "yes_i_am_touching_my_head.mp3" },
    { text: "what is this? is it a car?", file: "what_is_this_is_it_a_car.mp3" },
    { text: "yes it is a red car! i like cars!", file: "yes_it_is_a_red_car_i_like_cars.mp3" },
    { text: "are you hungry?", file: "are_you_hungry.mp3" },
    { text: "are you tired?", file: "are_you_tired.mp3" },
    { text: "yes i am hungry. i want an apple!", file: "yes_i_am_hungry_i_want_an_apple.mp3" },
    { text: "yes i am tired. i want to sleep!", file: "yes_i_am_tired_i_want_to_sleep.mp3" },
    { text: "what's this?", file: "what_is_this.mp3" },
    { text: "what animal is this?", file: "what_animal_is_this.mp3" },
    { text: "what is on the farm?", file: "what_is_on_the_farm.mp3" },
    { text: "what are these? are these eyes?", file: "what_are_these_are_these_eyes.mp3" },
    { text: "yes these are my eyes! i have two eyes!", file: "yes_these_are_my_eyes_i_have_two_eyes.mp3" },
    { text: "what number comes after seven?", file: "what_number_comes_after_seven.mp3" },
    { text: "how old are you? how many candles?", file: "how_old_are_you_how_many_candles.mp3" },
    { text: "what sound does a dog make?", file: "what_sound_does_a_dog_make.mp3" },
    { text: "woof woof! a dog says woof woof!", file: "woof_woof_a_dog_says_woof_woof.mp3" },
    { text: "are you happy too?", file: "how_are_you_are_you_happy.mp3" },
    { text: "yes i'm happy! are you happy too?", file: "yes_im_happy_are_you_happy_too.mp3" },
    { text: "how are you? are you happy?", file: "how_are_you_are_you_happy.mp3" },
    { text: "it is red! it is a red apple!", file: "the_apple_is_red_it_is_a_red_apple.mp3" },
    { text: "the apple is red! it is a red apple!", file: "the_apple_is_red_it_is_a_red_apple.mp3" },
    { text: "the sky is blue! it is a beautiful blue sky!", file: "the_sky_is_blue_it_is_a_beautiful_blue_sky.mp3" },
    { text: "hello", file: "hello.mp3" },
    { text: "hi", file: "hi.mp3" },
    { text: "good morning", file: "good_morning.mp3" },
    { text: "good afternoon", file: "good_afternoon.mp3" },
    { text: "good evening", file: "good_evening.mp3" },
    { text: "good night", file: "good_night.mp3" },
    { text: "goodbye", file: "goodbye.mp3" },
    { text: "bye", file: "bye.mp3" },
    { text: "bye bye", file: "bye_bye.mp3" },
    { text: "see you", file: "see_you.mp3" },
    { text: "sit down", file: "sit_down.mp3" },
    { text: "stand up", file: "stand_up.mp3" },
    { text: "hands up", file: "hands_up.mp3" },
    { text: "be quiet", file: "be_quiet.mp3" },
    { text: "listen", file: "listen.mp3" },
    { text: "look", file: "look.mp3" },
    { text: "open your book", file: "open_your_book.mp3" },
    { text: "close your book", file: "close_your_book.mp3" },
    { text: "happy", file: "happy.mp3" },
    { text: "sad", file: "sad.mp3" },
    { text: "angry", file: "angry.mp3" },
    { text: "scared", file: "scared.mp3" },
    { text: "tired", file: "tired.mp3" },
    { text: "excited", file: "excited.mp3" },
    { text: "sick", file: "sick.mp3" },
    { text: "surprised", file: "surprised.mp3" },
    { text: "red", file: "red.mp3" },
    { text: "blue", file: "blue.mp3" },
    { text: "yellow", file: "yellow.mp3" },
    { text: "green", file: "green.mp3" },
    { text: "orange", file: "orange.mp3" },
    { text: "purple", file: "purple.mp3" },
    { text: "black", file: "black.mp3" },
    { text: "white", file: "white.mp3" },
    { text: "pink", file: "pink.mp3" },
    { text: "brown", file: "brown.mp3" },
    { text: "gray", file: "gray.mp3" },
    { text: "one", file: "one.mp3" },
    { text: "two", file: "two.mp3" },
    { text: "three", file: "three.mp3" },
    { text: "four", file: "four.mp3" },
    { text: "five", file: "five.mp3" },
    { text: "six", file: "six.mp3" },
    { text: "seven", file: "seven.mp3" },
    { text: "eight", file: "eight.mp3" },
    { text: "nine", file: "nine.mp3" },
    { text: "ten", file: "ten.mp3" },
    { text: "cat", file: "cat.mp3" },
    { text: "dog", file: "dog.mp3" },
    { text: "mouse", file: "mouse.mp3" },
    { text: "rabbit", file: "rabbit.mp3" },
    { text: "lion", file: "lion.mp3" },
    { text: "elephant", file: "elephant.mp3" },
    { text: "penguin", file: "penguin.mp3" },
    { text: "frog", file: "frog.mp3" },
    { text: "bird", file: "bird.mp3" },
    { text: "fish", file: "fish.mp3" },
    { text: "cow", file: "cow.mp3" },
    { text: "pig", file: "pig.mp3" },
    { text: "chicken", file: "chicken.mp3" },
    { text: "horse", file: "horse.mp3" },
    { text: "duck", file: "duck.mp3" },
    { text: "snake", file: "snake.mp3" },
    { text: "monkey", file: "monkey.mp3" },
    { text: "panda", file: "panda.mp3" },
    { text: "kangaroo", file: "kangaroo.mp3" },
    { text: "owl", file: "owl.mp3" },
    { text: "fox", file: "fox.mp3" },
    { text: "zebra", file: "zebra.mp3" },
    { text: "giraffe", file: "giraffe.mp3" },
    { text: "dolphin", file: "dolphin.mp3" },
    { text: "jellyfish", file: "jellyfish.mp3" },
    { text: "ant", file: "ant.mp3" },
    { text: "mum", file: "mum.mp3" },
    { text: "mom", file: "mum.mp3" },
    { text: "dad", file: "dad.mp3" },
    { text: "brother", file: "brother.mp3" },
    { text: "sister", file: "sister.mp3" },
    { text: "grandpa", file: "grandpa.mp3" },
    { text: "grandma", file: "grandma.mp3" },
    { text: "baby", file: "baby.mp3" },
    { text: "home", file: "home.mp3" },
    { text: "love", file: "love.mp3" },
    { text: "family", file: "family.mp3" },
    { text: "boy", file: "boy.mp3" },
    { text: "girl", file: "girl.mp3" },
    { text: "friend", file: "friend.mp3" },
    { text: "eyes", file: "eyes.mp3" },
    { text: "ear", file: "ear.mp3" },
    { text: "ears", file: "ears.mp3" },
    { text: "nose", file: "nose.mp3" },
    { text: "mouth", file: "mouth.mp3" },
    { text: "head", file: "head.mp3" },
    { text: "hand", file: "hand.mp3" },
    { text: "hands", file: "hands.mp3" },
    { text: "leg", file: "leg.mp3" },
    { text: "legs", file: "legs.mp3" },
    { text: "foot", file: "foot.mp3" },
    { text: "feet", file: "feet.mp3" },
    { text: "arm", file: "arm.mp3" },
    { text: "arms", file: "arms.mp3" },
    { text: "apple", file: "apple.mp3" },
    { text: "apples", file: "apples.mp3" },
    { text: "banana", file: "banana.mp3" },
    { text: "bananas", file: "bananas.mp3" },
    { text: "carrot", file: "carrot.mp3" },
    { text: "pizza", file: "pizza.mp3" },
    { text: "ice cream", file: "ice_cream.mp3" },
    { text: "cake", file: "cake.mp3" },
    { text: "milk", file: "milk.mp3" },
    { text: "rice", file: "rice.mp3" },
    { text: "egg", file: "egg.mp3" },
    { text: "bread", file: "bread.mp3" },
    { text: "noodles", file: "noodles.mp3" },
    { text: "meat", file: "meat.mp3" },
    { text: "vegetables", file: "vegetables.mp3" },
    { text: "fruit", file: "fruit.mp3" },
    { text: "watermelon", file: "watermelon.mp3" },
    { text: "ball", file: "ball.mp3" },
    { text: "teddy bear", file: "teddy_bear.mp3" },
    { text: "bear", file: "bear.mp3" },
    { text: "doll", file: "doll.mp3" },
    { text: "train", file: "train.mp3" },
    { text: "car", file: "car.mp3" },
    { text: "toy car", file: "toy_car.mp3" },
    { text: "yo-yo", file: "yoyo.mp3" },
    { text: "yo yo", file: "yoyo.mp3" },
    { text: "game", file: "game.mp3" },
    { text: "puzzle", file: "puzzle.mp3" },
    { text: "balloon", file: "balloon.mp3" },
    { text: "robot", file: "robot.mp3" },
    { text: "robot toy", file: "robot_toy.mp3" },
    { text: "toy", file: "toy.mp3" },
    { text: "gift", file: "gift.mp3" },
    { text: "box", file: "box.mp3" },
    { text: "book", file: "book.mp3" },
    { text: "blocks", file: "blocks.mp3" },
    { text: "doll toy", file: "doll_toy.mp3" },
    { text: "ball toy", file: "ball_toy.mp3" },
    { text: "clap", file: "clap.mp3" },
    { text: "dance", file: "dance.mp3" },
    { text: "sing", file: "sing.mp3" },
    { text: "play", file: "play.mp3" },
    { text: "run", file: "run.mp3" },
    { text: "draw", file: "draw.mp3" },
    { text: "read", file: "read.mp3" },
    { text: "sweep", file: "sweep.mp3" },
    { text: "star", file: "star.mp3" },
    { text: "party", file: "party.mp3" },
    { text: "fun", file: "fun.mp3" },
    { text: "trophy", file: "trophy.mp3" },
    { text: "review", file: "review.mp3" },
    { text: "perform", file: "perform.mp3" },
    { text: "celebrate", file: "celebrate.mp3" },
    { text: "champion", file: "champion.mp3" },
    { text: "graduate", file: "graduate.mp3" },
    { text: "name", file: "name.mp3" },
    { text: "old", file: "old.mp3" },
    { text: "like", file: "like.mp3" },
    { text: "live", file: "live.mp3" },
    { text: "from", file: "from.mp3" },
    { text: "please", file: "please.mp3" },
    { text: "thank you", file: "thank_you.mp3" },
    { text: "you are welcome", file: "you_are_welcome.mp3" },
    { text: "yes", file: "yes.mp3" },
    { text: "no", file: "no.mp3" },
    { text: "i", file: "i.mp3" },
    { text: "you", file: "you.mp3" },
    { text: "we", file: "we.mp3" },
    { text: "my", file: "my.mp3" },
    { text: "me", file: "me.mp3" },
    { text: "i am", file: "i_am.mp3" },
    { text: "i'm", file: "i_am.mp3" },
    { text: "can", file: "can.mp3" },
    { text: "do", file: "do.mp3" },
    { text: "does", file: "does.mp3" },
    { text: "what", file: "what.mp3" },
    { text: "how", file: "how.mp3" },
    { text: "where", file: "where.mp3" },
    { text: "who", file: "who.mp3" },
    { text: "why", file: "why.mp3" },
    { text: "this", file: "this.mp3" },
    { text: "is", file: "is.mp3" },
    { text: "it's", file: "its.mp3" },
    { text: "its", file: "its.mp3" },
    { text: "the", file: "the.mp3" },
    { text: "there", file: "there.mp3" },
    { text: "here", file: "here.mp3" },
    { text: "in", file: "in.mp3" },
    { text: "under", file: "under.mp3" },
    { text: "good", file: "good.mp3" },
    { text: "im", file: "im.mp3" },
    { text: "are", file: "are.mp3" },
    { text: "sun", file: "sun.mp3" },
    { text: "moon", file: "moon.mp3" },
    { text: "tree", file: "tree.mp3" },
    { text: "flower", file: "flower.mp3" },
    { text: "leaf", file: "leaf.mp3" },
    { text: "house", file: "house.mp3" },
    { text: "rainbow", file: "rainbow.mp3" },
    { text: "table", file: "table.mp3" },
    { text: "key", file: "key.mp3" },
    { text: "lamp", file: "lamp.mp3" },
    { text: "window", file: "window.mp3" },
    { text: "hat", file: "hat.mp3" },
    { text: "jacket", file: "jacket.mp3" },
    { text: "sock", file: "sock.mp3" },
    { text: "quilt", file: "quilt.mp3" },
    { text: "ring", file: "ring.mp3" },
    { text: "van", file: "van.mp3" },
    { text: "vase", file: "vase.mp3" },
    { text: "zip", file: "zip.mp3" },
    { text: "igloo", file: "igloo.mp3" },
    { text: "nut", file: "nut.mp3" },
    { text: "nest", file: "nest.mp3" },
    { text: "question", file: "question.mp3" },
    { text: "hug", file: "hug.mp3" },
    { text: "watch", file: "watch.mp3" },
    { text: "grape", file: "grape.mp3" },
    { text: "unicorn", file: "unicorn.mp3" },
    { text: "guitar", file: "guitar.mp3" },
    { text: "zoo", file: "zoo.mp3" },
    { text: "pet", file: "pet.mp3" },
    { text: "pencil", file: "pencil.mp3" },
    { text: "eraser", file: "eraser.mp3" },
    { text: "hip", file: "hip.mp3" },
    { text: "then", file: "then.mp3" },
    { text: "once", file: "once.mp3" },
    { text: "sit", file: "sit.mp3" },
    { text: "stand", file: "stand.mp3" },
    { text: "close", file: "close.mp3" },
    { text: "open", file: "open.mp3" },
    { text: "hungry", file: "hungry.mp3" },
    { text: "thirsty", file: "thirsty.mp3" },
    { text: "knees", file: "knees.mp3" },
    { text: "a", file: "a.mp3" },
    { text: "b", file: "b.mp3" },
    { text: "c", file: "c.mp3" },
    { text: "d", file: "d.mp3" },
    { text: "e", file: "e.mp3" },
    { text: "f", file: "f.mp3" },
    { text: "g", file: "g.mp3" },
    { text: "h", file: "h.mp3" },
    { text: "i", file: "i.mp3" },
    { text: "j", file: "j.mp3" },
    { text: "k", file: "k.mp3" },
    { text: "l", file: "l.mp3" },
    { text: "m", file: "m.mp3" },
    { text: "n", file: "n.mp3" },
    { text: "o", file: "o.mp3" },
    { text: "p", file: "p.mp3" },
    { text: "q", file: "q.mp3" },
    { text: "r", file: "r.mp3" },
    { text: "s", file: "s.mp3" },
    { text: "t", file: "t.mp3" },
    { text: "u", file: "u.mp3" },
    { text: "v", file: "v.mp3" },
    { text: "w", file: "w.mp3" },
    { text: "x", file: "x.mp3" },
    { text: "y", file: "y.mp3" },
    { text: "z", file: "z.mp3" },
    { text: "animals", file: "animals.mp3" },
    { text: "insect", file: "insect.mp3" },
    { text: "playing together is so much fun", file: "fun.mp3" },
    { text: "well done congratulations you are amazing", file: "celebrate.mp3" },
    { text: "well done! congratulations! you are amazing!", file: "celebrate.mp3" },
  ];

  const prefixMap = [
    { prefix: "good morning miss wang", file: "good_morning_miss_wang_how_are_you.mp3" },
    { prefix: "good morning! miss wang", file: "good_morning_miss_wang_how_are_you.mp3" },
    { prefix: "hello what is your name", file: "hello_what_is_your_name.mp3" },
    { prefix: "hi my name is", file: "hi_my_name_is_amy_nice_to_meet_you.mp3" },
    { prefix: "my name is", file: "my_name_is.mp3" },
    { prefix: "what is your name", file: "what_is_your_name.mp3" },
    { prefix: "what's your name", file: "whats.mp3" },
    { prefix: "nice to meet you", file: "nice_to_meet_you.mp3" },
    { prefix: "how old are you", file: "how_old_are_you.mp3" },
    { prefix: "where are you from", file: "where_are_you_from.mp3" },
    { prefix: "i am", file: "i_am.mp3" },
    { prefix: "i'm", file: "i_am.mp3" },
    { prefix: "what colour", file: "what_colour_is_the_apple.mp3" },
    { prefix: "can you count", file: "can_you_count_to_ten.mp3" },
    { prefix: "there are", file: "there_are.mp3" },
    { prefix: "do you like", file: "do_you_like_apples.mp3" },
    { prefix: "do you want", file: "do_you_want_some_milk.mp3" },
    { prefix: "what is this", file: "what_is_this.mp3" },
    { prefix: "what animal", file: "what_animal_is_this.mp3" },
    { prefix: "are you", file: "are_you_hungry.mp3" },
    { prefix: "i like", file: "like.mp3" },
    { prefix: "i have", file: "i_am.mp3" },
    { prefix: "i love", file: "love.mp3" },
    { prefix: "i want", file: "what_do_you_want_to_eat.mp3" },
    { prefix: "who is he", file: "who_is_he_is_he_your_dad.mp3" },
    { prefix: "who is she", file: "who_is_she_is_she_your_mum.mp3" },
    { prefix: "yes, he is", file: "yes_he_is_my_dad_i_love_my_dad.mp3" },
    { prefix: "yes she is", file: "yes_she_is_my_mum_my_mum_is_nice.mp3" },
    { prefix: "the sky is", file: "the_sky_is_blue_it_is_a_beautiful_blue_sky.mp3" },
    { prefix: "it's blue", file: "its_blue_the_sky_is_beautiful_blue.mp3" },
    { prefix: "i learned", file: "i_learned_greetings_colours_numbers_and_more.mp3" },
    { prefix: "can you draw", file: "can_you_draw_what_can_you_draw.mp3" },
    { prefix: "can you run", file: "can_you_run_fast.mp3" },
    { prefix: "can you sit", file: "can_you_sit_down_please.mp3" },
    { prefix: "please open", file: "please_open_your_books.mp3" },
    { prefix: "please stand", file: "please_stand_up_are_you_ready.mp3" },
    { prefix: "touch your head", file: "touch_your_head_can_you_do_it.mp3" },
    { prefix: "what is on the farm", file: "what_is_on_the_farm.mp3" },
    { prefix: "what are these", file: "what_are_these_are_these_eyes.mp3" },
    { prefix: "what number", file: "what_number_comes_after_seven.mp3" },
    { prefix: "what sound", file: "what_sound_does_a_dog_make.mp3" },
    { prefix: "is the sky", file: "is_the_sky_blue_or_green.mp3" },
    { prefix: "do you have", file: "do_you_have_a_brother_or_a_sister.mp3" },
    { prefix: "there is a cow", file: "there_is_a_cow_a_pig_a_horse_and_a_chicken.mp3" },
    { prefix: "i have a brother", file: "i_have_a_brother_his_name_is_tom.mp3" },
    { prefix: "how many apples", file: "how_many_apples_are_on_the_table.mp3" },
    { prefix: "how many colours", file: "how_many_colours_can_you_say.mp3" },
    { prefix: "how many hands", file: "how_many_hands_do_you_have.mp3" },
    { prefix: "yes i can", file: "can.mp3" },
    { prefix: "yes i am", file: "i_am.mp3" },
    { prefix: "yes i'm", file: "i_am.mp3" },
    { prefix: "yes, i", file: "yes.mp3" },
  ];

  for (const item of fullMap) {
    if (lower === item.text) {
      return item.file;
    }
  }

  for (const item of prefixMap) {
    if (lower.startsWith(item.prefix)) {
      return item.file;
    }
  }

  const words = clean.split(' ').filter(w => w.length > 0 && /[a-z]/.test(w));
  if (words.length > 0) {
    const firstWord = words[0].replace(/[^a-z]/g, '').toLowerCase();
    if (firstWord) {
      return firstWord + '.mp3';
    }
  }

  return null;
}

// ===== 提取所有发音项 =====
function extractAllTexts() {
  const texts = [];

  UNITS.forEach(unit => {
    (unit.vocab || []).forEach(v => {
      if (v.en) texts.push({ unit: unit.id, type: 'vocab', text: v.en });
    });
    (unit.sentences || []).forEach(s => {
      if (s.q?.en) texts.push({ unit: unit.id, type: 'question', text: s.q.en });
      if (s.a?.en) texts.push({ unit: unit.id, type: 'answer', text: s.a.en });
    });
    (unit.song?.lines || []).forEach(l => {
      if (l.text) texts.push({ unit: unit.id, type: 'lyric', text: l.text });
    });
  });

  ABC_ITEMS.forEach(item => {
    if (item.en) texts.push({ unit: 'abc', type: 'letter', text: item.en });
  });

  return texts;
}

// ===== 运行诊断 =====
const allItems = extractAllTexts();
const missing = [];
const found = [];
const problematic = [];

allItems.forEach(item => {
  const filename = getCosFilename(item.text);
  if (filename) {
    if (localFiles.has(filename)) {
      found.push({ ...item, filename, status: 'OK' });
    } else {
      missing.push({ ...item, filename, status: 'MISSING' });
    }
  } else {
    problematic.push({ ...item, status: 'NO_MAPPING' });
  }
});

console.log('='.repeat(70));
console.log('📊 TTS 音频完整性诊断报告');
console.log('='.repeat(70));
console.log('\n本地音频文件数量: ' + localFiles.size);
console.log('总发音项数量: ' + allItems.length);
console.log('✅ 正常: ' + found.length);
console.log('❌ 缺失: ' + missing.length);
console.log('⚠️ 映射问题: ' + problematic.length);

if (missing.length > 0) {
  console.log('\n' + '='.repeat(70));
  console.log('❌ 缺失音频清单（需要生成并上传）:');
  console.log('='.repeat(70));

  const uniqueMissing = [];
  const seenFiles = new Set();
  missing.forEach(m => {
    if (!seenFiles.has(m.filename)) {
      seenFiles.add(m.filename);
      uniqueMissing.push(m);
    }
  });

  console.log('\n去重后需生成 ' + uniqueMissing.length + ' 个音频文件:\n');
  uniqueMissing.forEach((m, i) => {
    console.log('  ' + (i+1) + '. ' + m.filename);
    console.log('     来源: U' + m.unit + ' ' + m.type + ' - "' + m.text + '"');
  });

  const missingList = uniqueMissing.map(m => ({
    text: m.text,
    file: m.filename,
    unit: m.unit,
    type: m.type
  }));
  fs.writeFileSync(
    path.join(__dirname, 'missing-audio-complete.json'),
    JSON.stringify(missingList, null, 2)
  );
  console.log('\n💾 已保存到: missing-audio-complete.json');
}

if (problematic.length > 0) {
  console.log('\n' + '='.repeat(70));
  console.log('⚠️ 映射问题（需要修复tts.js映射表）:');
  console.log('='.repeat(70));
  problematic.slice(0, 20).forEach((p, i) => {
    console.log('  ' + (i+1) + '. "' + p.text + '"');
    console.log('     来源: U' + p.unit + ' ' + p.type);
  });
  if (problematic.length > 20) {
    console.log('  ... 还有 ' + (problematic.length - 20) + ' 项');
  }
}

console.log('\n' + '='.repeat(70));
