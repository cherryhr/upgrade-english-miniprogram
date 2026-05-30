#!/usr/bin/env node
/**
 * 完整TTS音频生成脚本
 * 使用腾讯云TTS API生成所有缺失的音频文件
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// 腾讯云配置（从环境变量读取，请勿硬编码密钥）
const SECRET_ID = process.env.TENCENT_SECRET_ID || '';
const SECRET_KEY = process.env.TENCENT_SECRET_KEY || '';
const APP_ID = process.env.TENCENT_APP_ID || '';

// 音频配置
const TTS_CONFIG = {
  VoiceType: 6,  // 6 = 智美女声(英式)
  Codec: 'mp3'
};

// 本地输出目录
const OUTPUT_DIR = path.join(__dirname, '..', 'tts_audio');

// 需要生成的音频
const MISSING_AUDIO = [
  { text: "Hello! What is your name?", file: "hello_what_is_your_name.mp3" },
  { text: "Hi! My name is Amy. Nice to meet you!", file: "hi_my_name_is_amy_nice_to_meet_you.mp3" },
  { text: "Good morning, Miss Wang! How are you?", file: "good_morning_miss_wang_how_are_you.mp3" },
  { text: "Goodbye! See you tomorrow!", file: "goodbye_see_you_tomorrow.mp3" },
  { text: "Bye bye! Have a good day!", file: "bye_bye_have_a_good_day.mp3" },
  { text: "Me! Me! I know the answer!", file: "me_me_i_know_the_answer.mp3" },
  { text: "Listen carefully and repeat after me.", file: "listen_carefully_and_repeat_after_me.mp3" },
  { text: "What's your name?", file: "whats_your_name.mp3" },
  { text: "My name is Lily. What about you?", file: "my_name_is_lily_what_about_you.mp3" },
  { text: "I'm from Beijing. Where are you from?", file: "im_from_beijing.mp3" },
  { text: "I'm feeling happy today! I love school!", file: "im_feeling_happy_today_i_love_school.mp3" },
  { text: "You look sad. What's wrong?", file: "you_look_sad_whats_wrong.mp3" },
  { text: "I lost my toy. I feel very sad.", file: "i_lost_my_toy_i_feel_very_sad.mp3" },
  { text: "Why are you so excited?", file: "why_are_you_so_excited.mp3" },
  { text: "It's my birthday today! I'm so excited!", file: "its_my_birthday_today.mp3" },
  { text: "Why are you angry?", file: "why_are_you_angry.mp3" },
  { text: "My sister took my pencil! I'm angry!", file: "my_sister_took_my_pencil_im_angry.mp3" },
  { text: "It's red! Red like a fire engine!", file: "its_red_red_like_a_fire_engine.mp3" },
  { text: "My favourite colour is yellow! Yellow like the sun!", file: "my_favourite_colour_is_yellow.mp3" },
  { text: "Is the elephant big or small?", file: "is_the_elephant_big_or_small.mp3" },
  { text: "The elephant is very big! It's the biggest land animal!", file: "the_elephant_is_very_big.mp3" },
  { text: "What does a lion do?", file: "what_does_a_lion_do.mp3" },
  { text: "A lion roars! Roar! Lions are very brave!", file: "a_lion_roars.mp3" },
  { text: "Who is this in the photo?", file: "who_is_this_in_the_photo.mp3" },
  { text: "Is your dad tall?", file: "is_your_dad_tall.mp3" },
  { text: "Yes! My dad is very tall and strong!", file: "yes_my_dad_is_very_tall_and_strong.mp3" },
  { text: "Do you love your grandma?", file: "do_you_love_your_grandma.mp3" },
  { text: "Yes! I love my grandma very much! She makes yummy food!", file: "yes_i_love_my_grandma.mp3" },
  { text: "Where is your nose? Can you point to it?", file: "where_is_your_nose_can_you_point_to_it.mp3" },
  { text: "Here is my nose! Right here in the middle of my face!", file: "here_is_my_nose.mp3" },
  { text: "I have two eyes! Two big beautiful eyes!", file: "i_have_two_eyes.mp3" },
  { text: "What can you do with your hands?", file: "what_can_you_do_with_your_hands.mp3" },
  { text: "I can clap, wave, draw and play with my hands!", file: "i_can_clap_wave_draw.mp3" },
  { text: "I like apples and bananas! They are sweet and yummy!", file: "i_like_apples_and_bananas.mp3" },
  { text: "Do you like carrots?", file: "do_you_like_carrots.mp3" },
  { text: "No, I don't like carrots. But I like pizza!", file: "no_i_dont_like_carrots_but_i_like_pizza.mp3" },
  { text: "Does the cake taste good?", file: "does_the_cake_taste_good.mp3" },
  { text: "Yes! Yummy! It is so delicious! Can I have more?", file: "yes_yummy_it_is_so_delicious.mp3" },
  { text: "What is your favourite toy?", file: "what_is_your_favourite_toy.mp3" },
  { text: "My favourite toy is my teddy bear! His name is Brown!", file: "my_favourite_toy_is_my_teddy_bear.mp3" },
  { text: "Do you want to play ball with me?", file: "do_you_want_to_play_ball_with_me.mp3" },
  { text: "Yes! Let's play ball! I love football!", file: "yes_lets_play_ball_i_love_football.mp3" },
  { text: "Can you sing a song for us?", file: "can_you_sing_a_song_for_us.mp3" },
  { text: "Yes! I can sing! Listen to me: Hello hello hello!", file: "yes_i_can_sing.mp3" },
  { text: "What have you learned in UpGrade English?", file: "what_have_you_learned.mp3" },
  { text: "I learned greetings, colours, numbers, animals and more!", file: "i_learned_greetings_colours_numbers_and_more.mp3" },
  { text: "Well done! Congratulations! You are amazing!", file: "well_done_congratulations_you_are_amazing.mp3" },
  { text: "Hello, hello, hello", file: "hello_hello_hello.mp3" },
  { text: "I am fine, thank you", file: "i_am_fine_thank_you.mp3" },
  { text: "Hip hip hooray", file: "hip_hip_hooray.mp3" },
  { text: "Sit down, sit down", file: "sit_down_sit_down.mp3" },
  { text: "Stand up, stand up", file: "stand_up_stand_up.mp3" },
  { text: "Hands up, hands up", file: "hands_up_hands_up.mp3" },
  { text: "Be quiet, shhh", file: "be_quiet_shhh.mp3" },
  { text: "Listen, listen listen to me", file: "listen_listen_listen_to_me.mp3" },
  { text: "What is your name? What is your name?", file: "what_is_your_name_what_is_your_name.mp3" },
  { text: "My name is Tom. What a great name", file: "my_name_is_tom_what_a_great_name.mp3" },
  { text: "How old are you? How old are you?", file: "how_old_are_you_how_old_are_you.mp3" },
  { text: "I'm five years old, hip hip hooray", file: "im_five_years_old_hip_hip_hooray.mp3" },
  { text: "How are you today? How are you?", file: "how_are_you_today_how_are_you.mp3" },
  { text: "I'm happy, happy, happy", file: "im_happy_happy_happy.mp3" },
  { text: "I'm sad, sad, sad today", file: "im_sad_sad_sad_today.mp3" },
  { text: "Red, red, red", file: "red_red_red.mp3" },
  { text: "Blue, blue, blue", file: "blue_blue_blue.mp3" },
  { text: "Yellow, yellow, yellow", file: "yellow_yellow_yellow.mp3" },
  { text: "Green, green, green", file: "green_green_green.mp3" },
  { text: "Rainbow colours, so beautiful", file: "rainbow_colours_so_beautiful.mp3" },
  { text: "One, two, three, four, five", file: "one_two_three_four_five.mp3" },
  { text: "Once I caught a fish alive", file: "once_i_caught_a_fish_alive.mp3" },
  { text: "Six, seven, eight, nine, ten", file: "six_seven_eight_nine_ten.mp3" },
  { text: "Then I let it go again", file: "then_i_let_it_go_again.mp3" },
  { text: "The lion says roar", file: "the_lion_says_roar.mp3" },
  { text: "The dog says woof", file: "the_dog_says_woof.mp3" },
  { text: "The cat says meow", file: "the_cat_says_meow.mp3" },
  { text: "The cow says mooo", file: "the_cow_says_mooo.mp3" },
  { text: "Animals, animals, we love you", file: "animals_animals_we_love_you.mp3" },
  { text: "This is my family", file: "this_is_my_family.mp3" },
  { text: "Mum and Dad and me", file: "mum_and_dad_and_me.mp3" },
  { text: "I love my family", file: "i_love_my_family.mp3" },
  { text: "Happy, happy family", file: "happy_happy_family.mp3" },
  { text: "Head, shoulders, knees and toes", file: "head_shoulders_knees_and_toes.mp3" },
  { text: "Knees and toes", file: "knees_and_toes.mp3" },
  { text: "Eyes and ears and mouth and nose", file: "eyes_and_ears_and_mouth_and_nose.mp3" },
  { text: "Knees and toes, knees and toes", file: "knees_and_toes_knees_and_toes.mp3" },
  { text: "Apples, apples, so red and sweet", file: "apples_apples_so_red_and_sweet.mp3" },
  { text: "Bananas, bananas, so yellow and neat", file: "bananas_bananas_so_yellow_and_neat.mp3" },
  { text: "Pizza, pizza, so yummy to eat", file: "pizza_pizza_so_yummy_to_eat.mp3" },
  { text: "I love yummy food hip hip hooray", file: "i_love_yummy_food_hip_hip_hooray.mp3" },
  { text: "In my toy box, what do I see?", file: "in_my_toy_box_what_do_i_see.mp3" },
  { text: "A bouncy ball bouncing at me", file: "a_bouncy_ball_bouncing_at_me.mp3" },
  { text: "A teddy bear soft as can be", file: "a_teddy_bear_soft_as_can_be.mp3" },
  { text: "A little toy car, zoom zoom zoom", file: "a_little_toy_car_zoom_zoom_zoom.mp3" },
  { text: "I love my toys, hip hip hooray", file: "i_love_my_toys_hip_hip_hooray.mp3" },
  { text: "We learned our ABCs", file: "we_learned_our_abcs.mp3" },
  { text: "We counted 1, 2, 3", file: "we_counted_1_2_3.mp3" },
  { text: "We know our colours bright", file: "we_know_our_colours_bright.mp3" },
  { text: "We learned to say hello", file: "we_learned_to_say_hello.mp3" },
  { text: "We did it, we did it, hooray", file: "we_did_it_we_did_it_hooray.mp3" },
  { text: "A Apple", file: "a_apple.mp3" },
  { text: "B Ball", file: "b_ball.mp3" },
  { text: "C Cat", file: "c_cat.mp3" },
  { text: "D Dog", file: "d_dog.mp3" },
  { text: "E Egg", file: "e_egg.mp3" },
  { text: "F Fish", file: "f_fish.mp3" },
  { text: "G Grape", file: "g_grape.mp3" },
  { text: "H Hat", file: "h_hat.mp3" },
  { text: "I Ice cream", file: "i_ice_cream.mp3" },
  { text: "J Juice", file: "j_juice.mp3" },
  { text: "K Kite", file: "k_kite.mp3" },
  { text: "L Lion", file: "l_lion.mp3" },
  { text: "M Moon", file: "m_moon.mp3" },
  { text: "N Nest", file: "n_nest.mp3" },
  { text: "O Orange", file: "o_orange.mp3" },
  { text: "P Pig", file: "p_pig.mp3" },
  { text: "Q Queen", file: "q_queen.mp3" },
  { text: "R Rainbow", file: "r_rainbow.mp3" },
  { text: "S Star", file: "s_star.mp3" },
  { text: "T Tiger", file: "t_tiger.mp3" },
  { text: "U Umbrella", file: "u_umbrella.mp3" },
  { text: "V Violin", file: "v_violin.mp3" },
  { text: "W Whale", file: "w_whale.mp3" },
  { text: "X Xylophone", file: "x_xylophone.mp3" },
  { text: "Y Yo-yo", file: "y_yo_yo.mp3" },
  { text: "Z Zebra", file: "z_zebra.mp3" },
  { text: "What animal is this? It says meow!", file: "what_animal_is_this_it_says_meow.mp3" },
  { text: "It's a cat! Cats say meow meow!", file: "its_a_cat_cats_say_meow.mp3" },
  { text: "Playing together is so much fun!", file: "playing_together_is_so_much_fun.mp3" },
];

// 确保输出目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// 调用腾讯云TTS
function callTTS(text, outputFile) {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(OUTPUT_DIR, outputFile);

    if (fs.existsSync(outputPath)) {
      console.log(`Skip: ${outputFile}`);
      resolve();
      return;
    }

    const cleanText = text.replace(/[!?'",:]/g, '').trim();
    console.log(`Generate: "${text}"`);

    // 腾讯云TTS API v2
    const crypto = require('crypto');
    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = Math.floor(Math.random() * 1000000);

    const payload = JSON.stringify({
      Action: 'TextToStreamAudio',
      AppId: parseInt(APP_ID),
      Codec: 'mp3',
      EnableSubtitle: false,
      Fast: 1,
      SessionParams: { appid: APP_ID },
      Speed: 100,
      Text: cleanText,
      VoiceType: TTS_CONFIG.VoiceType,
      Volume: 0
    });

    const auth = Buffer.from(`${SECRET_ID}:${SECRET_KEY}`).toString('base64');

    const options = {
      hostname: 'tts.cloud.tencent.com',
      port: 443,
      path: '/stream',
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        if (buf.length > 1000) {
          fs.writeFileSync(outputPath, buf);
          console.log(`  -> ${outputFile} (${buf.length} bytes)`);
          resolve();
        } else {
          console.log(`  -> Failed (${buf.length} bytes)`);
          resolve(); // 不阻塞后续
        }
      });
    });

    req.on('error', e => { console.log(`  -> Error: ${e.message}`); resolve(); });
    req.write(payload);
    req.end();

    setTimeout(() => { req.destroy(); resolve(); }, 10000);
  });
}

async function main() {
  console.log('='.repeat(60));
  console.log('TTS Audio Generation Script');
  console.log('='.repeat(60));
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(`Total: ${MISSING_AUDIO.length} files`);
  console.log('='.repeat(60));

  for (const item of MISSING_AUDIO) {
    await callTTS(item.text, item.file);
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('='.repeat(60));
  console.log('Done! Check tts_audio folder.');
}

main();
