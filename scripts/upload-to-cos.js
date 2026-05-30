#!/usr/bin/env node

/**
 * 上传缺失音频到COS脚本
 * 使用腾讯云COS SDK上传所有缺失的音频文件
 */

const fs = require('fs');
const path = require('path');

// 加载腾讯云COS SDK
const COS = require('cos-nodejs-sdk-v5');

// ========== COS配置 ==========
const cos = new COS({
  SecretId: process.env.TENCENT_SECRET_ID || '',
  SecretKey: process.env.TENCENT_SECRET_KEY || ''
});

const BUCKET = 'upgrade-videos-1412449710';
const REGION = 'ap-guangzhou';
const TTS_PATH = 'TTS/';

const PROJECT_ROOT = '/Users/huangrong/Desktop/upgrade-english-miniprogram';
const LOCAL_TTS_DIR = path.join(PROJECT_ROOT, 'tts_audio');

// 待上传文件列表（从cos_missing_files.json）
const MISSING_FILES = [
  "goodbye_see_you_tomorrow.mp3", "bye_bye_have_a_good_day.mp3",
  "me_me_i_know_the_answer.mp3", "listen_carefully_and_repeat_after_me.mp3",
  "whats_your_name.mp3", "my_name_is_lily_what_about_you.mp3",
  "im_from_beijing.mp3", "do_you_want_to_be_my_friend.mp3",
  "im_feeling_happy_today_i_love_school.mp3", "you_look_sad_whats_wrong.mp3",
  "i_lost_my_toy_i_feel_very_sad.mp3", "why_are_you_so_excited.mp3",
  "its_my_birthday_today.mp3", "why_are_you_angry.mp3",
  "my_sister_took_my_pencil_im_angry.mp3", "what_colour_is_this_apple.mp3",
  "its_red_red_like_a_fire_engine.mp3", "my_favourite_colour_is_yellow.mp3",
  "yes_a_rainbow_has_seven_beautiful_colours.mp3", "yes_one_two_three_four_five_six_seven_eight_nine_ten.mp3",
  "im_four_years_old_four_candles_on_my_cake.mp3", "what_animal_is_this_it_says_meow.mp3",
  "its_a_cat_cats_say_meow.mp3", "is_the_elephant_big_or_small.mp3",
  "the_elephant_is_very_big.mp3", "what_does_a_lion_do.mp3",
  "a_lion_roars.mp3", "who_is_this_in_the_photo.mp3", "this_is_my_family.mp3",
  "is_your_dad_tall.mp3", "yes_my_dad_is_very_tall_and_strong.mp3",
  "do_you_love_your_grandma.mp3", "yes_i_love_my_grandma.mp3",
  "where_is_your_nose_can_you_point_to_it.mp3", "here_is_my_nose.mp3",
  "how_many_eyes_do_you_have.mp3", "i_have_two_eyes.mp3",
  "what_can_you_do_with_your_hands.mp3", "i_can_clap_wave_draw.mp3",
  "what_do_you_like_to_eat.mp3", "i_like_apples_and_bananas.mp3",
  "do_you_like_carrots.mp3", "no_i_dont_like_carrots_but_i_like_pizza.mp3",
  "does_the_cake_taste_good.mp3", "yes_yummy_it_is_so_delicious.mp3",
  "what_is_your_favourite_toy.mp3", "my_favourite_toy_is_my_teddy_bear.mp3",
  "do_you_want_to_play_ball_with_me.mp3", "yes_lets_play_ball_i_love_football.mp3",
  "playing_together_is_so_much_fun.mp3", "can_you_sing_a_song_for_us.mp3",
  "yes_i_can_sing.mp3", "what_have_you_learned.mp3",
  "i_learned_greetings_colours_numbers_and_more.mp3",
  "well_done_congratulations_you_are_amazing.mp3", "hello_hello_hello.mp3",
  "i_am_fine_thank_you.mp3", "hip_hip_hooray.mp3", "sit_down_sit_down.mp3",
  "stand_up_stand_up.mp3", "hands_up_hands_up.mp3", "be_quiet_shhh.mp3",
  "listen_listen_listen_to_me.mp3", "what_is_your_name_what_is_your_name.mp3",
  "my_name_is_tom_what_a_great_name.mp3", "how_old_are_you_how_old_are_you.mp3",
  "im_five_years_old_hip_hip_hooray.mp3", "how_are_you_today_how_are_you.mp3",
  "im_happy_happy_happy.mp3", "im_sad_sad_sad_today.mp3",
  "red_red_red.mp3", "blue_blue_blue.mp3", "yellow_yellow_yellow.mp3",
  "green_green_green.mp3", "rainbow_colours_so_beautiful.mp3",
  "one_two_three_four_five.mp3", "once_i_caught_a_fish_alive.mp3",
  "six_seven_eight_nine_ten.mp3", "then_i_let_it_go_again.mp3",
  "the_lion_says_roar.mp3", "the_dog_says_woof.mp3", "the_cat_says_meow.mp3",
  "the_cow_says_mooo.mp3", "animals_animals_we_love_you.mp3",
  "mum_and_dad_and_me.mp3", "i_love_my_family.mp3", "happy_happy_family.mp3",
  "head_shoulders_knees_and_toes.mp3", "knees_and_toes.mp3",
  "eyes_and_ears_and_mouth_and_nose.mp3", "knees_and_toes_knees_and_toes.mp3",
  "apples_apples_so_red_and_sweet.mp3", "bananas_bananas_so_yellow_and_neat.mp3",
  "pizza_pizza_so_yummy_to_eat.mp3", "i_love_yummy_food_hip_hip_hooray.mp3",
  "in_my_toy_box_what_do_i_see.mp3", "a_bouncy_ball_bouncing_at_me.mp3",
  "a_teddy_bear_soft_as_can_be.mp3", "a_little_toy_car_zoom_zoom_zoom.mp3",
  "i_love_my_toys_hip_hip_hooray.mp3", "we_learned_our_abcs.mp3",
  "we_counted_1_2_3.mp3", "we_know_our_colours_bright.mp3",
  "we_learned_to_say_hello.mp3", "we_did_it_we_did_it_hooray.mp3"
];

// 上传单个文件
function uploadFile(localFile, cosKey) {
  return new Promise((resolve, reject) => {
    const localPath = path.join(LOCAL_TTS_DIR, localFile);
    
    if (!fs.existsSync(localPath)) {
      reject(new Error(`本地文件不存在: ${localPath}`));
      return;
    }
    
    cos.putObject({
      Bucket: BUCKET,
      Region: REGION,
      Key: cosKey,
      Body: fs.createReadStream(localPath),
      ContentLength: fs.statSync(localPath).size,
    }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        console.log(`  ✅ ${localFile}`);
        resolve(data);
      }
    });
  });
}

// 批量上传
async function batchUpload(files, concurrency = 3) {
  const results = { success: [], failed: [] };
  
  console.log(`\n🚀 开始上传 ${files.length} 个文件...\n`);
  
  for (let i = 0; i < files.length; i += concurrency) {
    const batch = files.slice(i, i + concurrency);
    console.log(`📦 批次 ${Math.floor(i/concurrency) + 1}/${Math.ceil(files.length/concurrency)}`);
    
    const promises = batch.map(async (file) => {
      try {
        await uploadFile(file, TTS_PATH + file);
        results.success.push(file);
      } catch (err) {
        console.log(`  ❌ ${file}: ${err.message}`);
        results.failed.push({ file, error: err.message });
      }
    });
    
    await Promise.all(promises);
    console.log(`📊 进度: ${Math.min(i + concurrency, files.length)}/${files.length}`);
  }
  
  return results;
}

// 主函数
async function main() {
  console.log('🔼 UpGrade English - COS音频上传工具\n');
  console.log('='.repeat(50));
  
  if (!fs.existsSync(LOCAL_TTS_DIR)) {
    console.error(`❌ 本地目录不存在: ${LOCAL_TTS_DIR}`);
    return;
  }
  
  const localFiles = fs.readdirSync(LOCAL_TTS_DIR).filter(f => f.endsWith('.mp3'));
  console.log(`📁 本地文件: ${localFiles.length} 个`);
  
  const toUpload = MISSING_FILES.filter(f => localFiles.includes(f));
  console.log(`📤 准备上传: ${toUpload.length} 个\n`);
  
  if (toUpload.length === 0) {
    console.log('✨ 没有需要上传的文件！');
    return;
  }
  
  const results = await batchUpload(toUpload, 3);
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 上传报告\n');
  console.log(`✅ 成功: ${results.success.length}`);
  console.log(`❌ 失败: ${results.failed.length}`);
  
  if (results.failed.length > 0) {
    console.log('\n失败列表:');
    results.failed.forEach(f => console.log(`   - ${f.file}`));
  }
  
  console.log('\n✨ 上传完成！');
}

main().catch(console.error);
