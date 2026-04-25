// utils/tts.js - 微信小程序 TTS 语音播放工具
// 使用腾讯云COS预置音频
// 完整版：包含所有词汇、句型、歌词、ABC字母的映射

const COS_TTS_BASE = 'https://upgrade-videos-1412449710.cos.ap-guangzhou.myqcloud.com/TTS/';

let audioContext = null;
let lastPlayTime = 0;
let currentPlayTimeout = null;
const MIN_PLAY_INTERVAL = 300;
const PLAY_TIMEOUT = 8000;

function getAudioContext() {
  if (!audioContext) {
    console.log('🔊 创建音频上下文');
    audioContext = wx.createInnerAudioContext();
    audioContext.volume = 1;
    audioContext.obeyMuteSwitch = false;

    audioContext.onError((err) => {
      console.error('❌ 音频错误:', err.errMsg, err.errCode);
    });

    audioContext.onPlay(() => {
      console.log('🔊 播放中...');
    });

    audioContext.onEnded(() => {
      console.log('✅ 播放完成');
      if (currentPlayTimeout) {
        clearTimeout(currentPlayTimeout);
        currentPlayTimeout = null;
      }
    });
  }
  return audioContext;
}

function cleanText(text) {
  if (!text) return '';
  let clean = text
    .replace(/!/g, '')
    .replace(/"/g, "'")
    .replace(/'/g, '')  // 移除撇号
    .replace(/:/g, ' ')
    .replace(/;/g, '')
    .replace(/[【】]/g, '')
    .replace(/[（）()]/g, '')
    .replace(/[，。]/g, ',')
    .replace(/,/g, ' ')
    .replace(/[.。]+/g, '.')
    .replace(/[^\x00-\x7F]/g, '')  // 移除所有非ASCII字符（包括emoji）
    .replace(/\s+/g, ' ')
    .trim();
  if (clean.length > 100) {
    clean = clean.substring(0, 100);
  }
  return clean;
}

// ===== 完整映射表 =====
function getCosFilename(text) {
  if (!text) return null;
  let clean = cleanText(text);
  if (!clean) return null;
  const lower = clean.toLowerCase();

  // ========== 完整句子映射 ==========
  const fullMap = [
    // U1 问候与告别
    { text: "hi! my name is amy. nice to meet you!", file: "hi_my_name_is_amy_nice_to_meet_you.mp3" },
    { text: "hi my name is amy. nice to meet you!", file: "hi_my_name_is_amy_nice_to_meet_you.mp3" },
    { text: "hi my name is amy nice to meet you", file: "hi_my_name_is_amy_nice_to_meet_you.mp3" },
    { text: "good morning! i'm very well, thank you!", file: "good_morning_im_very_well_thank_you.mp3" },
    { text: "good morning! i am very well, thank you!", file: "good_morning_im_very_well_thank_you.mp3" },
    { text: "good morning i m very well thank you", file: "good_morning_im_very_well_thank_you.mp3" },
    { text: "good morning im very well thank you", file: "good_morning_im_very_well_thank_you.mp3" },
    { text: "good morning i\u2019m very well thank you", file: "good_morning_im_very_well_thank_you.mp3" },
    { text: "good morning i\u0027m very well thank you", file: "good_morning_im_very_well_thank_you.mp3" },
    { text: "im fine thank you and you", file: "im_fine_thank_you_and_you.mp3" },
    { text: "im fine thank you and you?", file: "im_fine_thank_you_and_you.mp3" },
    { text: "hello what is your name?", file: "hello_what_is_your_name.mp3" },
    { text: "hello what is your name", file: "hello_what_is_your_name.mp3" },
    { text: "hi my name is amy nice to meet you", file: "hi_my_name_is_amy_nice_to_meet_you.mp3" },
    { text: "hi my name is amy. nice to meet you", file: "hi_my_name_is_amy_nice_to_meet_you.mp3" },
    { text: "good morning miss wang how are you", file: "good_morning_miss_wang_how_are_you.mp3" },
    { text: "good morning miss wang how are you?", file: "good_morning_miss_wang_how_are_you.mp3" },
    { text: "yes one two three four five six seven eight nine ten", file: "yes_one_two_three_four_five_six_seven_eight_nine_ten.mp3" },
    { text: "hello hello hello", file: "hello_hello_hello.mp3" },
    { text: "i am fine thank you", file: "i_am_fine_thank_you.mp3" },
    { text: "sit down sit down", file: "sit_down_sit_down.mp3" },
    { text: "stand up stand up", file: "stand_up_stand_up.mp3" },
    { text: "hands up hands up", file: "hands_up_hands_up.mp3" },
    { text: "be quiet shhh", file: "be_quiet_shhh.mp3" },
    { text: "listen listen listen to me", file: "listen_listen_listen_to_me.mp3" },
    { text: "im sad sad sad today.", file: "im_sad_sad_today.mp3" },
    { text: "im sad sad sad today", file: "im_sad_sad_today.mp3" },
    { text: "red red red", file: "red_red_red.mp3" },
    { text: "blue blue blue", file: "blue_blue_blue.mp3" },
    { text: "yellow yellow yellow", file: "yellow_yellow_yellow.mp3" },
    { text: "green green green", file: "green_green_green.mp3" },
    { text: "rainbow colours so beautiful", file: "rainbow_colours_so_beautiful.mp3" },
    { text: "one two three four five", file: "one_two_three_four_five.mp3" },
    { text: "once i caught a fish alive", file: "once_i_caught_a_fish_alive.mp3" },
    { text: "six seven eight nine ten", file: "six_seven_eight_nine_ten.mp3" },
    { text: "then i let it go again", file: "then_i_let_it_go_again.mp3" },
    { text: "the lion says roar", file: "the_lion_says_roar.mp3" },
    { text: "the dog says woof", file: "the_dog_says_woof.mp3" },
    { text: "the cat says meow", file: "the_cat_says_meow.mp3" },
    { text: "the cow says mooo", file: "the_cow_says_mooo.mp3" },
    { text: "animals animals we love you", file: "animals_animals_we_love_you.mp3" },
    { text: "this is my family", file: "this_is_my_family.mp3" },
    { text: "mum and dad and me", file: "mum_and_dad_and_me.mp3" },
    { text: "i love my family", file: "i_love_my_family.mp3" },
    { text: "happy happy family", file: "happy_happy_family.mp3" },
    { text: "head shoulders knees and toes", file: "head_shoulders_knees_and_toes.mp3" },
    { text: "knees and toes", file: "knees_and_toes.mp3" },
    { text: "eyes and ears and mouth and nose", file: "eyes_and_ears_and_mouth_and_nose.mp3" },
    { text: "knees and toes knees and toes", file: "knees_and_toes_knees_and_toes.mp3" },
    { text: "apples apples so red and sweet", file: "apples_apples_so_red_and_sweet.mp3" },
    { text: "bananas bananas so yellow and neat", file: "bananas_bananas_so_yellow_and_neat.mp3" },
    { text: "pizza pizza so yummy to eat", file: "pizza_pizza_so_yummy_to_eat.mp3" },
    { text: "i love yummy food hip hip hooray", file: "i_love_yummy_food_hip_hip_hooray.mp3" },
    { text: "in my toy box what do i see", file: "in_my_toy_box_what_do_i_see.mp3" },
    { text: "in my toy box what do i see?", file: "in_my_toy_box_what_do_i_see.mp3" },
    { text: "a bouncy ball bouncing at me", file: "a_bouncy_ball_bouncing_at_me.mp3" },
    { text: "a teddy bear soft as can be", file: "a_teddy_bear_soft_as_can_be.mp3" },
    { text: "a little toy car zoom zoom zoom", file: "a_little_toy_car_zoom_zoom_zoom.mp3" },
    { text: "i love my toys hip hip hooray", file: "i_love_my_toys_hip_hip_hooray.mp3" },
    { text: "we learned our abcs", file: "we_learned_our_abcs.mp3" },
    { text: "we counted 1 2 3", file: "we_counted_1_2_3.mp3" },
    { text: "we know our colours bright", file: "we_know_our_colours_bright.mp3" },
    { text: "we learned to say hello", file: "we_learned_to_say_hello.mp3" },
    { text: "we did it we did it hooray", file: "we_did_it_we_did_it_hooray.mp3" },
    { text: "no i dont like carrots. but i like pizza!", file: "no_i_dont_like_carrots_but_i_like_pizza.mp3" },
    { text: "no i dont like carrots. but i like pizza", file: "no_i_dont_like_carrots_but_i_like_pizza.mp3" },
    { text: "goodbye see you tomorrow", file: "goodbye_see_you_tomorrow.mp3" },
    { text: "bye bye have a good day", file: "bye_bye_have_a_good_day.mp3" },
    { text: "can you sit down please?", file: "can_you_sit_down_please.mp3" },
    { text: "yes miss i am sitting down now.", file: "yes_miss_i_am_sitting_down_now.mp3" },
    { text: "please stand up are you ready?", file: "please_stand_up_are_you_ready.mp3" },
    { text: "please stand up are you ready", file: "please_stand_up_are_you_ready.mp3" },
    // "who knows the answer? hands up" 使用单词组合
    // 映射到 words 部分的 who.mp3 + answer.mp3 + hands_up.mp3
    { text: "me me i know the answer", file: "me_me_i_know_the_answer.mp3" },
    { text: "whats your name?", file: "whats_your_name.mp3" },
    { text: "how old are you?", file: "how_old_are_you.mp3" },
    { text: "im five years old. how old are you?", file: "im_five_years_old.mp3" },
    { text: "im five years old how old are you", file: "im_five_years_old.mp3" },
    { text: "im from beijing. where are you from?", file: "im_from_beijing.mp3" },
    { text: "im from beijing where are you from", file: "im_from_beijing.mp3" },
    { text: "you look sad. whats wrong?", file: "you_look_sad_whats_wrong.mp3" },
    { text: "you look sad whats wrong", file: "you_look_sad_whats_wrong.mp3" },
    { text: "my favourite colour is yellow yellow like the sun", file: "my_favourite_colour_is_yellow.mp3" },
    { text: "yes a rainbow has seven beautiful colours", file: "yes_a_rainbow_has_seven_beautiful_colours.mp3" },
    { text: "there are five apples on the table", file: "there_are_five_apples_on_the_table.mp3" },
    { text: "what animal is this? it says meow", file: "what_animal_is_this_it_says_meow.mp3" },
    { text: "a lion roars roar lions are very brave", file: "a_lion_roars.mp3" },
    { text: "this is my family mum dad and me", file: "this_is_my_family.mp3" },
    { text: "yes my dad is very tall and strong", file: "yes_my_dad_is_very_tall_and_strong.mp3" },
    { text: "yes i love my grandma very much she makes yummy food", file: "yes_i_love_my_grandma.mp3" },
    { text: "here is my nose right here in the middle of my face", file: "here_is_my_nose.mp3" },
    { text: "i have two eyes two big beautiful eyes", file: "i_have_two_eyes.mp3" },
    { text: "i can clap wave draw and play with my hands", file: "i_can_clap_wave_draw.mp3" },
    { text: "i like apples and bananas they are sweet and yummy", file: "i_like_apples_and_bananas.mp3" },
    { text: "no i dont like carrots. but i like pizza!", file: "no_i_dont_like_carrots_but_i_like_pizza.mp3" },
    { text: "no i dont like carrots but i like pizza", file: "no_i_dont_like_carrots_but_i_like_pizza.mp3" },
    { text: "yes yummy it is so delicious can i have more?", file: "yes_yummy_it_is_so_delicious.mp3" },
    { text: "yes yummy it is so delicious can i have more", file: "yes_yummy_it_is_so_delicious.mp3" },
    { text: "my favourite toy is my teddy bear his name is brown", file: "my_favourite_toy_is_my_teddy_bear.mp3" },
    { text: "playing together is so much fun!", file: "playing_together_is_so_much_fun.mp3" },
    { text: "playing together is so much fun", file: "playing_together_is_so_much_fun.mp3" },
    { text: "yes i can sing listen to me hello hello hello", file: "yes_i_can_sing.mp3" },
    { text: "i learned greetings colours numbers animals and more", file: "i_learned_greetings_colours_numbers_and_more.mp3" },
    { text: "im fine thank you and you", file: "im_fine_thank_you_and_you.mp3" },
    { text: "yes im ready im standing up", file: "yes_im_ready_im_standing_up.mp3" },
    { text: "whats your name", file: "whats_your_name.mp3" },
    { text: "im five years old how old are you", file: "im_five_years_old.mp3" },
    { text: "im from beijing where are you from", file: "im_from_beijing.mp3" },
    { text: "yes nice to meet you lets be friends", file: "yes_let_us_be_friends.mp3" },
    { text: "im feeling happy today i love school", file: "im_feeling_happy_today_i_love_school.mp3" },
    { text: "you look sad whats wrong", file: "you_look_sad_whats_wrong.mp3" },
    { text: "its my birthday today im so excited", file: "its_my_birthday_today.mp3" },
    { text: "my sister took my pencil im angry", file: "my_sister_took_my_pencil_im_angry.mp3" },
    { text: "its red red like a fire engine", file: "its_red_red_like_a_fire_engine.mp3" },
    { text: "im four years old four candles on my cake", file: "im_four_years_old_four_candles_on_my_cake.mp3" },
    { text: "its a cat cats say meow meow", file: "its_a_cat_cats_say_meow.mp3" },
    { text: "the elephant is very big its the biggest land animal", file: "the_elephant_is_very_big.mp3" },
    { text: "no i dont like carrots but i like pizza", file: "no_i_dont_like_carrots_but_i_like_pizza.mp3" },
    { text: "yes lets play ball i love football", file: "yes_lets_play_ball_i_love_football.mp3" },
    { text: "im five years old hip hip hooray", file: "im_five_years_old_hip_hip_hooray.mp3" },
    { text: "im happy happy happy", file: "im_happy_happy_happy.mp3" },
    { text: "im sad sad sad today", file: "im_sad_sad_sad_today.mp3" },
    { text: "i'm fine, thank you! and you?", file: "im_fine_thank_you_and_you.mp3" },
    { text: "i am fine thank you and you", file: "im_fine_thank_you_and_you.mp3" },
    { text: "goodbye! see you tomorrow!", file: "goodbye_see_you_tomorrow.mp3" },
    { text: "bye bye! have a good day!", file: "bye_bye_have_a_good_day.mp3" },

    // U2 课堂指令
    { text: "yes! i'm ready! i'm standing up!", file: "yes_im_ready_im_standing_up.mp3" },
    { text: "yes i m ready i m standing up", file: "yes_im_ready_im_standing_up.mp3" },
    { text: "who knows the answer hands up", file: "who_knows_the_answer_hands_up.mp3" },
    { text: "who knows the answer hands up?", file: "who_knows_the_answer_hands_up.mp3" },
    { text: "who knows the answer? hands up", file: "who_knows_the_answer_hands_up.mp3" },
    { text: "who knows the answer? hands up?", file: "who_knows_the_answer_hands_up.mp3" },
    { text: "me! me! i know the answer!", file: "me_me_i_know_the_answer.mp3" },

    // U2 课堂指令（续）
    { text: "yes, miss! i am sitting down now.", file: "yes_miss_i_am_sitting_down_now.mp3" },
    { text: "please stand up! are you ready?", file: "please_stand_up_are_you_ready.mp3" },
    { text: "please open your books!", file: "please_open_your_books.mp3" },
    { text: "listen carefully and repeat after me.", file: "listen_carefully_and_repeat_after_me.mp3" },

    // U3 朋友与自我
    { text: "what's your name?", file: "whats_your_name.mp3" },
    { text: "what is your name", file: "what_is_your_name.mp3" },
    { text: "my name is lily. what about you?", file: "my_name_is_lily_what_about_you.mp3" },
    { text: "i'm five years old. how old are you?", file: "im_five_years_old.mp3" },
    { text: "where are you from?", file: "where_are_you_from.mp3" },
    { text: "i'm from beijing. where are you from?", file: "im_from_beijing.mp3" },
    { text: "do you want to be my friend?", file: "do_you_want_to_be_my_friend.mp3" },
    { text: "do you want to be friends", file: "do_you_want_to_be_friends.mp3" },
    { text: "yes! nice to meet you! let's be friends!", file: "yes_let_us_be_friends.mp3" },
    { text: "yes nice to meet you let s be friends", file: "yes_let_us_be_friends.mp3" },

    // U4 情绪
    { text: "how are you feeling today?", file: "how_are_you_feeling_today.mp3" },
    { text: "i'm feeling happy today! i love school!", file: "im_feeling_happy_today_i_love_school.mp3" },
    { text: "you look sad. what's wrong?", file: "you_look_sad_whats_wrong.mp3" },
    { text: "i lost my toy. i feel very sad.", file: "i_lost_my_toy_i_feel_very_sad.mp3" },
    { text: "why are you so excited?", file: "why_are_you_so_excited.mp3" },
    { text: "it's my birthday today! i'm so excited!", file: "its_my_birthday_today.mp3" },
    { text: "why are you angry?", file: "why_are_you_angry.mp3" },
    { text: "my sister took my pencil! i'm angry!", file: "my_sister_took_my_pencil_im_angry.mp3" },

    // U5 颜色
    { text: "what colour is this apple?", file: "what_colour_is_this_apple.mp3" },
    { text: "what colour is the apple?", file: "what_colour_is_this_apple.mp3" },
    { text: "it's red! red like a fire engine!", file: "its_red_red_like_a_fire_engine.mp3" },
    { text: "what is your favourite colour?", file: "what_is_your_favourite_colour.mp3" },
    { text: "my favourite colour is yellow! yellow like the sun!", file: "my_favourite_colour_is_yellow.mp3" },
    { text: "my favourite colour is yellow", file: "my_favourite_colour_is_yellow.mp3" },
    { text: "can you see a rainbow? how many colours?", file: "how_many_colours_can_you_say.mp3" },
    { text: "yes! a rainbow has seven beautiful colours!", file: "yes_a_rainbow_has_seven_beautiful_colours.mp3" },
    { text: "there are seven colours in a rainbow", file: "yes_a_rainbow_has_seven_beautiful_colours.mp3" },

    // U6 数字
    { text: "can you count to ten?", file: "can_you_count_to_ten.mp3" },
    { text: "yes! one, two, three, four, five, six, seven, eight, nine, ten!", file: "yes_one_two_three_four_five_six_seven_eight_nine_ten.mp3" },
    { text: "how many apples are on the table?", file: "how_many_apples_are_on_the_table.mp3" },
    { text: "there are five apples on the table!", file: "there_are_five_apples_on_the_table.mp3" },
    { text: "how old are you? how many candles?", file: "how_old_are_you_how_many_candles.mp3" },
    { text: "i'm four years old! four candles on my cake!", file: "im_four_years_old_four_candles_on_my_cake.mp3" },

    // U7 动物
    { text: "what animal is this? it says meow!", file: "what_animal_is_this_it_says_meow.mp3" },
    { text: "it's a cat! cats say meow meow!", file: "its_a_cat_cats_say_meow.mp3" },
    { text: "is the elephant big or small?", file: "is_the_elephant_big_or_small.mp3" },
    { text: "the elephant is very big! it's the biggest land animal!", file: "the_elephant_is_very_big.mp3" },
    { text: "what does a lion do?", file: "what_does_a_lion_do.mp3" },
    { text: "a lion roars! roar! lions are very brave!", file: "a_lion_roars.mp3" },

    // U8 家庭
    { text: "who is this in the photo?", file: "who_is_this_in_the_photo.mp3" },
    { text: "this is my family! mum, dad, and me!", file: "this_is_my_family.mp3" },
    { text: "is your dad tall?", file: "is_your_dad_tall.mp3" },
    { text: "yes! my dad is very tall and strong!", file: "yes_my_dad_is_very_tall_and_strong.mp3" },
    { text: "do you love your grandma?", file: "do_you_love_your_grandma.mp3" },
    { text: "yes! i love my grandma very much! she makes yummy food!", file: "yes_i_love_my_grandma.mp3" },

    // U9 身体部位
    { text: "where is your nose? can you point to it?", file: "where_is_your_nose_can_you_point_to_it.mp3" },
    { text: "here is my nose! right here in the middle of my face!", file: "here_is_my_nose.mp3" },
    { text: "how many eyes do you have?", file: "how_many_eyes_do_you_have.mp3" },
    { text: "i have two eyes! two big beautiful eyes!", file: "i_have_two_eyes.mp3" },
    { text: "what can you do with your hands?", file: "what_can_you_do_with_your_hands.mp3" },
    { text: "i can clap, wave, draw and play with my hands!", file: "i_can_clap_wave_draw.mp3" },

    // U10 食物
    { text: "what do you like to eat?", file: "what_do_you_like_to_eat.mp3" },
    { text: "i like apples and bananas! they are sweet and yummy!", file: "i_like_apples_and_bananas.mp3" },
    { text: "do you like carrots?", file: "do_you_like_carrots.mp3" },
    { text: "no, i don't like carrots. but i like pizza!", file: "no_i_dont_like_carrots_but_i_like_pizza.mp3" },
    { text: "does the cake taste good?", file: "does_the_cake_taste_good.mp3" },
    { text: "yes! yummy! it is so delicious! can i have more?", file: "yes_yummy_it_is_so_delicious.mp3" },

    // U11 玩具
    { text: "what is your favourite toy?", file: "what_is_your_favourite_toy.mp3" },
    { text: "my favourite toy is my teddy bear! his name is brown!", file: "my_favourite_toy_is_my_teddy_bear.mp3" },
    { text: "do you want to play ball with me?", file: "do_you_want_to_play_ball_with_me.mp3" },
    { text: "yes! let's play ball! i love football!", file: "yes_lets_play_ball_i_love_football.mp3" },
    { text: "playing together is so much fun!", file: "playing_together_is_so_much_fun.mp3" },

    // U12 综合复习
    { text: "can you sing a song for us?", file: "can_you_sing_a_song_for_us.mp3" },
    { text: "yes! i can sing! listen to me: hello hello hello!", file: "yes_i_can_sing.mp3" },
    { text: "what have you learned in upgrade english?", file: "what_have_you_learned.mp3" },
    { text: "i learned greetings, colours, numbers, animals and more!", file: "i_learned_greetings_colours_numbers_and_more.mp3" },
    { text: "well done! congratulations! you are amazing!", file: "well_done_congratulations_you_are_amazing.mp3" },
    { text: "well done congratulations you are amazing", file: "well_done_congratulations_you_are_amazing.mp3" },

    // ========== 歌词映射 ==========
    // U1 Hello Song
    { text: "hello hello hello", file: "hello_hello_hello.mp3" },
    { text: "how are you today?", file: "how_are_you_today.mp3" },
    { text: "i am fine thank you", file: "i_am_fine_thank_you.mp3" },
    { text: "hip hip hooray", file: "hip_hip_hooray.mp3" },

    // U2 Command Song
    { text: "sit down sit down", file: "sit_down_sit_down.mp3" },
    { text: "stand up stand up", file: "stand_up_stand_up.mp3" },
    { text: "hands up hands up", file: "hands_up_hands_up.mp3" },
    { text: "be quiet shhh", file: "be_quiet_shhh.mp3" },
    { text: "listen listen listen to me", file: "listen_listen_listen_to_me.mp3" },

    // U3 Friends Song
    { text: "what is your name? what is your name?", file: "what_is_your_name_what_is_your_name.mp3" },
    { text: "my name is tom what a great name", file: "my_name_is_tom_what_a_great_name.mp3" },
    { text: "how old are you? how old are you?", file: "how_old_are_you_how_old_are_you.mp3" },
    { text: "i'm five years old, hip hip hooray", file: "im_five_years_old_hip_hip_hooray.mp3" },
    { text: "im five years old hip hip hooray", file: "im_five_years_old_hip_hip_hooray.mp3" },

    // U4 Feelings Song
    { text: "how are you today? how are you?", file: "how_are_you_today_how_are_you.mp3" },
    { text: "how are you today? how are you", file: "how_are_you_today_how_are_you.mp3" },
    { text: "i'm happy, happy, happy", file: "im_happy_happy_happy.mp3" },
    { text: "im happy happy happy", file: "im_happy_happy_happy.mp3" },
    { text: "i'm sad, sad, sad today", file: "im_sad_sad_sad_today.mp3" },
    { text: "im sad sad sad today", file: "im_sad_sad_sad_today.mp3" },

    // U5 Rainbow Colours
    { text: "red red red", file: "red_red_red.mp3" },
    { text: "blue blue blue", file: "blue_blue_blue.mp3" },
    { text: "yellow yellow yellow", file: "yellow_yellow_yellow.mp3" },
    { text: "green green green", file: "green_green_green.mp3" },
    { text: "rainbow colours so beautiful", file: "rainbow_colours_so_beautiful.mp3" },

    // U6 Counting Song
    { text: "one two three four five", file: "one_two_three_four_five.mp3" },
    { text: "once i caught a fish alive", file: "once_i_caught_a_fish_alive.mp3" },
    { text: "six seven eight nine ten", file: "six_seven_eight_nine_ten.mp3" },
    { text: "then i let it go again", file: "then_i_let_it_go_again.mp3" },

    // U7 Animal Sounds
    { text: "the lion says roar", file: "the_lion_says_roar.mp3" },
    { text: "the dog says woof", file: "the_dog_says_woof.mp3" },
    { text: "the cat says meow", file: "the_cat_says_meow.mp3" },
    { text: "the cow says mooo", file: "the_cow_says_mooo.mp3" },
    { text: "animals animals we love you", file: "animals_animals_we_love_you.mp3" },

    // U8 Family Song
    { text: "this is my family", file: "this_is_my_family.mp3" },
    { text: "mum and dad and me", file: "mum_and_dad_and_me.mp3" },
    { text: "i love my family", file: "i_love_my_family.mp3" },
    { text: "happy happy family", file: "happy_happy_family.mp3" },

    // U9 Head Shoulders
    { text: "head shoulders knees and toes", file: "head_shoulders_knees_and_toes.mp3" },
    { text: "knees and toes", file: "knees_and_toes.mp3" },
    { text: "eyes and ears and mouth and nose", file: "eyes_and_ears_and_mouth_and_nose.mp3" },
    { text: "knees and toes knees and toes", file: "knees_and_toes_knees_and_toes.mp3" },

    // U10 Yummy Food
    { text: "apples apples so red and sweet", file: "apples_apples_so_red_and_sweet.mp3" },
    { text: "bananas bananas so yellow and neat", file: "bananas_bananas_so_yellow_and_neat.mp3" },
    { text: "pizza pizza so yummy to eat", file: "pizza_pizza_so_yummy_to_eat.mp3" },
    { text: "i love yummy food hip hip hooray", file: "i_love_yummy_food_hip_hip_hooray.mp3" },

    // U11 Toy Box
    { text: "in my toy box what do i see", file: "in_my_toy_box_what_do_i_see.mp3" },
    { text: "a bouncy ball bouncing at me", file: "a_bouncy_ball_bouncing_at_me.mp3" },
    { text: "a teddy bear soft as can be", file: "a_teddy_bear_soft_as_can_be.mp3" },
    { text: "a little toy car zoom zoom zoom", file: "a_little_toy_car_zoom_zoom_zoom.mp3" },
    { text: "i love my toys hip hip hooray", file: "i_love_my_toys_hip_hip_hooray.mp3" },

    // U12 We Did It
    { text: "we learned our abcs", file: "we_learned_our_abcs.mp3" },
    { text: "we counted 1 2 3", file: "we_counted_1_2_3.mp3" },
    { text: "we know our colours bright", file: "we_know_our_colours_bright.mp3" },
    { text: "we learned to say hello", file: "we_learned_to_say_hello.mp3" },
    { text: "we did it we did it hooray", file: "we_did_it_we_did_it_hooray.mp3" },

    // ========== ABC字母映射 ==========
    { text: "a apple", file: "a_apple.mp3" },
    { text: "b ball", file: "b_ball.mp3" },
    { text: "c cat", file: "c_cat.mp3" },
    { text: "d dog", file: "d_dog.mp3" },
    { text: "e egg", file: "e_egg.mp3" },
    { text: "f fish", file: "f_fish.mp3" },
    { text: "g grape", file: "g_grape.mp3" },
    { text: "h hat", file: "h_hat.mp3" },
    { text: "i ice cream", file: "i_ice_cream.mp3" },
    { text: "j juice", file: "j_juice.mp3" },
    { text: "k kite", file: "k_kite.mp3" },
    { text: "l lion", file: "l_lion.mp3" },
    { text: "m moon", file: "m_moon.mp3" },
    { text: "n nest", file: "n_nest.mp3" },
    { text: "o orange", file: "o_orange.mp3" },
    { text: "p pig", file: "p_pig.mp3" },
    { text: "q queen", file: "q_queen.mp3" },
    { text: "r rainbow", file: "r_rainbow.mp3" },
    { text: "s star", file: "s_star.mp3" },
    { text: "t tiger", file: "t_tiger.mp3" },
    { text: "u umbrella", file: "u_umbrella.mp3" },
    { text: "v violin", file: "v_violin.mp3" },
    { text: "w whale", file: "w_whale.mp3" },
    { text: "x xylophone", file: "x_xylophone.mp3" },
    { text: "y yo-yo", file: "y_yo_yo.mp3" },
    { text: "z zebra", file: "z_zebra.mp3" },
    { text: "a - apple", file: "a_apple.mp3" },
    { text: "b - ball", file: "b_ball.mp3" },
    { text: "c - cat", file: "c_cat.mp3" },
    { text: "d - dog", file: "d_dog.mp3" },
    { text: "e - egg", file: "e_egg.mp3" },
    { text: "f - fish", file: "f_fish.mp3" },
    { text: "g - grape", file: "g_grape.mp3" },
    { text: "h - hat", file: "h_hat.mp3" },
    { text: "i - ice cream", file: "i_ice_cream.mp3" },
    { text: "j - juice", file: "j_juice.mp3" },
    { text: "k - kite", file: "k_kite.mp3" },
    { text: "l - lion", file: "l_lion.mp3" },
    { text: "m - moon", file: "m_moon.mp3" },
    { text: "n - nest", file: "n_nest.mp3" },
    { text: "o - orange", file: "o_orange.mp3" },
    { text: "p - pig", file: "p_pig.mp3" },
    { text: "q - queen", file: "q_queen.mp3" },
    { text: "r - rainbow", file: "r_rainbow.mp3" },
    { text: "s - star", file: "s_star.mp3" },
    { text: "t - tiger", file: "t_tiger.mp3" },
    { text: "u - umbrella", file: "u_umbrella.mp3" },
    { text: "v - violin", file: "v_violin.mp3" },
    { text: "w - whale", file: "w_whale.mp3" },
    { text: "x - xylophone", file: "x_xylophone.mp3" },
    { text: "y - yo-yo", file: "y_yo_yo.mp3" },
    { text: "z - zebra", file: "z_zebra.mp3" },

    // ========== 单词和短语 ==========
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
    { text: "animals", file: "animals.mp3" },
    { text: "insect", file: "insect.mp3" },
    { text: "morning", file: "morning.mp3" },
    { text: "quiet", file: "quiet.mp3" },

    // ========== ABC字母单字母 ==========
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
  ];

  // 精确匹配
  for (const item of fullMap) {
    if (!item) continue; // 防御性跳过 null 元素
    if (lower === item.text) {
      return item.file;
    }
  }

  // 前缀匹配（用于长句）
  const prefixMap = [
    { prefix: "good morning miss wang", file: "good_morning_miss_wang_how_are_you.mp3" },
    { prefix: "good morning! miss wang", file: "good_morning_miss_wang_how_are_you.mp3" },
    { prefix: "hello what is your name", file: "hello_what_is_your_name.mp3" },
    { prefix: "hi my name is", file: "hi_my_name_is_amy_nice_to_meet_you.mp3" },
    { prefix: "my name is", file: "my_name_is.mp3" },
    { prefix: "what is your name", file: "what_is_your_name.mp3" },
    { prefix: "what's your name", file: "whats_your_name.mp3" },
    { prefix: "nice to meet you", file: "nice_to_meet_you.mp3" },
    { prefix: "how old are you", file: "how_old_are_you.mp3" },
    { prefix: "where are you from", file: "where_are_you_from.mp3" },
    { prefix: "i am", file: "i_am.mp3" },
    { prefix: "i'm", file: "i_am.mp3" },
    { prefix: "what colour", file: "what_colour_is_this_apple.mp3" },
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
    { prefix: "playing together", file: "playing_together_is_so_much_fun.mp3" },
    { prefix: "well done", file: "well_done_congratulations_you_are_amazing.mp3" },
    { prefix: "hello hello", file: "hello_hello_hello.mp3" },
    { prefix: "sit down", file: "sit_down_sit_down.mp3" },
    { prefix: "stand up", file: "stand_up_stand_up.mp3" },
    { prefix: "head shoulders", file: "head_shoulders_knees_and_toes.mp3" },
  ];

  for (const item of prefixMap) {
    if (!item) continue; // 防御性跳过 null 元素
    if (lower.startsWith(item.prefix)) {
      return item.file;
    }
  }

  // 通用回退：取第一个单词
  const words = clean.split(' ').filter(w => w.length > 0 && /[a-z]/.test(w));
  if (words.length > 0) {
    const firstWord = words[0].replace(/[^a-z]/g, '').toLowerCase();
    if (firstWord) {
      return firstWord + '.mp3';
    }
  }

  return null;
}

module.exports = {
  init() {
    console.log('🔊 TTS 初始化 (COS)');
    getAudioContext();
  },

  speakEnglish(text) {
    const clean = cleanText(text);
    if (!clean) {
      console.log('⚠️ 文本为空');
      return;
    }

    const now = Date.now();
    const timeSinceLastPlay = now - lastPlayTime;
    if (timeSinceLastPlay < MIN_PLAY_INTERVAL) {
      const waitTime = MIN_PLAY_INTERVAL - timeSinceLastPlay;
      setTimeout(() => this.speakEnglish(text), waitTime);
      return;
    }

    lastPlayTime = now;
    console.log('🔊 播放:', clean);

    const ctx = getAudioContext();
    const cosFile = getCosFilename(clean);
    if (!cosFile) {
      console.log('⚠️ 无法生成文件名:', clean);
      return;
    }

    const cosUrl = COS_TTS_BASE + cosFile;
    console.log('📡 加载:', cosFile);

    if (currentPlayTimeout) {
      clearTimeout(currentPlayTimeout);
      currentPlayTimeout = null;
    }

    // 先移除旧的错误监听器，再绑定新的，防止叠加
    ctx.offError();
    ctx.stop();

    const errorHandler = (err) => {
      console.log('⚠️ 加载失败:', cosFile, err.errMsg);
      ctx.offError();

      const words = clean.split(' ').filter(w => w.length > 1 && /[a-z]/i.test(w));
      if (words.length > 0) {
        const firstWord = words[0].replace(/[^a-zA-Z]/g, '').toLowerCase();
        if (firstWord) {
          const fallbackFile = firstWord + '.mp3';
          const fallbackUrl = COS_TTS_BASE + fallbackFile;
          console.log('🔄 回退到:', fallbackFile);
          ctx.stop();
          ctx.src = fallbackUrl;
          ctx.play();
        }
      }
    };

    ctx.onError(errorHandler);
    ctx.src = cosUrl;

    currentPlayTimeout = setTimeout(() => {
      console.log('⚠️ 播放超时');
      ctx.offError();
      currentPlayTimeout = null;
    }, PLAY_TIMEOUT);

    ctx.play();
  },

  speakWord(en, zh) {
    console.log('🔊 speakWord:', en, zh);
    wx.showToast({ title: zh, icon: 'none', duration: 800 });
    this.speakEnglish(en);
  },

  playCosAudio(filename) {
    const ctx = getAudioContext();
    const url = COS_TTS_BASE + encodeURIComponent(filename);
    console.log('🔊 直接播放:', url);
    ctx.stop();
    ctx.src = url;
    ctx.play();
  },

  getCosBaseUrl() {
    return COS_TTS_BASE;
  },

  stop() {
    console.log('⏹️ 停止');
    if (audioContext) {
      audioContext.stop();
    }
    if (currentPlayTimeout) {
      clearTimeout(currentPlayTimeout);
      currentPlayTimeout = null;
    }
  },

  destroy() {
    if (audioContext) {
      audioContext.stop();
      audioContext.destroy();
      audioContext = null;
    }
    if (currentPlayTimeout) {
      clearTimeout(currentPlayTimeout);
      currentPlayTimeout = null;
    }
  }
};
