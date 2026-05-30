// 智能修复：检查缺失文件并尝试用已有文件替代

const fs = require('fs');
const https = require('https');

const missingFiles = [
  'yes_i_love_my_grandma_very_much.mp3',
  'let_us_be_friends.mp3',  // 关键文件！
  'i_want_to_be_your_friend.mp3',
  'nice_to_meet_you.mp3',
  'we_are_friends.mp3',
  'you_are_my_friend.mp3',
  'my_favourite_colour_is.mp3',
  'i_see_a_rainbow.mp3',
  'the_rainbow_has_seven_colours.mp3',
  'how_many_colours.mp3',
  'which_colour_do_you_like.mp3',
  'very_much.mp3',
  'very_well_thank_you_and_you.mp3',
  'well_done.mp3',
  'congratulations.mp3',
  'you_are_a_champion.mp3',
  'i_am_a_champion.mp3',
  'i_see.mp3',
  'i_can.mp3',
  'i_like.mp3',
  'i_want.mp3',
  'it_is.mp3',
  'it_says.mp3',
  'this_is.mp3',
  'that_is.mp3',
  'there_is.mp3',
  'there_are.mp3',
  'she_is.mp3',
  'they_are.mp3',
  'is_it.mp3',
  'has_it.mp3',
  'your.mp3',
  'meow.mp3',
  'roar.mp3',
  'jump.mp3',
  'walk.mp3',
  'stop.mp3',
  'help.mp3',
  'listen_to_me.mp3',
  'look_at_me.mp3',
  'look_at_this.mp3',
  'point_to.mp3',
  'show_me.mp3',
  'say_it_again_please.mp3',
  'repeat_after_me.mp3',
  'wake_up.mp3',
  'sleepy.mp3',
  'hot.mp3',
  'left.mp3',
  'right.mp3',
  'up.mp3',
  'to.mp3',
  'more.mp3',
  'not.mp3',
  'oh.mp3',
  'oh_no.mp3',
  'too.mp3',
  'think.mp3',
  'wait.mp3',
  'go.mp3',
  'song.mp3',
  'laugh.mp3',
  'i_see_you.mp3',
  'i_like_you.mp3',
  'i_love_you.mp3',
  'here_you_are.mp3',
  'mummy.mp3',
  'mother.mp3',
  'parent.mp3',
  'hundred.mp3',
  'we_can.mp3',
  'we_like_to.mp3',
  'no_i_dont_like.mp3',
  'i_dont_like.mp3',
  'have_a_good_day.mp3',
  'here_you_are.mp3',
  'what_shall_we_do.mp3',
  'what_shall_we_do_today.mp3',
  'what_would_you_like.mp3',
  'where_is.mp3',
  'where_is_your.mp3',
  'who_is_in_your_family.mp3',
  'i_am_happy_today.mp3',
  'i_am_sad.mp3',
  'well_done_congratulations_you_are_a_champion.mp3',
  'rainbow_has_seven_colours.mp3',
  'the_rainbow_has_seven_beautiful_colours.mp3',
  'i_see_seven_beautiful_colours.mp3',
  'i_see_seven_colours.mp3',
  'there_are_seven_colours_in_a_rainbow.mp3',
  'rainbow_is_beautiful.mp3',
  'these_are_my.mp3',
  's_sun.mp3',
  'm_monkey.mp3',
  'r_rabbit.mp3',
  'h_horse.mp3',
  'j_jacket.mp3',
  'g_gorilla.mp3',
  'hippopotamus.mp3',
  'whale.mp3',
  'gorilla.mp3',
  'hair.mp3',
  'hope.mp3'
];

// 检查这些文件是否存在
function checkFile(fileName) {
  return new Promise((resolve) => {
    const url = `https://upgrade-videos-1412449710.cos.ap-guangzhou.myqcloud.com/TTS/${fileName}`;
    https.get(url, (res) => {
      resolve({ file: fileName, exists: res.statusCode === 200 });
    }).on('error', () => {
      resolve({ file: fileName, exists: false });
    });
  });
}

async function main() {
  console.log('=== 关键缺失文件检查 ===\n');
  
  // 只检查关键文件
  const criticalFiles = [
    'let_us_be_friends.mp3',
    'nice_to_meet_you.mp3',
    'we_are_friends.mp3',
    'you_are_my_friend.mp3',
    'i_want_to_be_your_friend.mp3',
    'my_favourite_colour_is.mp3',
    'very_much.mp3',
    'well_done.mp3',
    'you_are_a_champion.mp3',
    'congratulations.mp3'
  ];
  
  const results = await Promise.all(criticalFiles.map(checkFile));
  
  let missing = results.filter(r => !r.exists);
  
  console.log('关键文件状态:\n');
  for (const r of results) {
    console.log(`  ${r.exists ? '✅' : '❌'} ${r.file}`);
  }
  
  if (missing.length > 0) {
    console.log('\n⚠️  必须上传这些文件才能让 TTS 正常工作!');
  }
}

main();
