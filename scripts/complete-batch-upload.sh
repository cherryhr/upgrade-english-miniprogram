#!/bin/bash
set -e

TEMP_DIR="/tmp/tts-complete-$(date +%s)"
mkdir -p "$TEMP_DIR"
cd "$TEMP_DIR"

echo "🎙️ 生成所有缺失音频..."

FILES=(
  "my_favourite_colour_is:My favourite colour is"
  "how_many_colours:How many colours"
  "which_colour_do_you_like:Which colour do you like"
  "very_well_thank_you_and_you:Very well thank you and you"
  "i_am_a_champion:I am a champion"
  "well_done_congratulations_you_are_a_champion:Well done congratulations you are a champion"
  "rainbow_has_seven_colours:The rainbow has seven colours"
  "the_rainbow_has_seven_beautiful_colours:The rainbow has seven beautiful colours"
  "i_see_seven_beautiful_colours:I see seven beautiful colours"
  "i_see_seven_colours:I see seven colours"
  "there_are_seven_colours_in_a_rainbow:There are seven colours in a rainbow"
  "rainbow_is_beautiful:The rainbow is beautiful"
  "these_are_my:These are my"
  "s_sun:S, Sun"
  "m_monkey:M, Monkey"
  "r_rabbit:R, Rabbit"
  "h_horse:H, Horse"
  "j_jacket:J, Jacket"
  "g_gorilla:G, Gorilla"
  "hippopotamus:Hippopotamus"
  "whale:Whale"
  "gorilla:Gorilla"
  "hair:Hair"
  "hope:Hope"
  "yes_i_love_my_grandma_very_much:Yes I love my grandma very much"
  "hundred:Hundred"
  "hot:Hot"
  "help:Help"
  "here_you_are:Here you are"
  "i_love_you:I love you"
  "i_like_you:I like you"
  "i_dont_like:I do not like"
  "no_i_dont_like:No I do not like"
  "i_can:I can"
  "i_see:I see"
  "i_like:I like"
  "i_want:I want"
  "it_is:It is"
  "it_says:It says"
  "this_is:This is"
  "that_is:That is"
  "there_is:There is"
  "she_is:She is"
  "they_are:They are"
  "is_it:Is it"
  "has_it:Has it"
  "your:Your"
  "meow:Meow"
  "roar:Roar"
  "jump:Jump"
  "walk:Walk"
  "stop:Stop"
  "listen_to_me:Listen to me"
  "look_at_me:Look at me"
  "look_at_this:Look at this"
  "point_to:Point to"
  "show_me:Show me"
  "say_it_again_please:Say it again please"
  "repeat_after_me:Repeat after me"
  "wake_up:Wake up"
  "sleepy:Sleepy"
  "left:Left"
  "right:Right"
  "up:Up"
  "to:To"
  "more:More"
  "not:Not"
  "oh:Oh"
  "oh_no:Oh no"
  "too:Too"
  "think:Think"
  "wait:Wait"
  "go:Go"
  "song:Song"
  "laugh:Laugh"
  "i_see_you:I see you"
  "mummy:Mummy"
  "mother:Mother"
  "parent:Parent"
  "we_can:We can"
  "we_like_to:We like to"
  "have_a_good_day:Have a good day"
  "what_shall_we_do:What shall we do"
  "what_shall_we_do_today:What shall we do today"
  "what_would_you_like:What would you like"
  "where_is:Where is"
  "where_is_your:Where is your"
  "who_is_in_your_family:Who is in your family"
  "i_want_to_be_your_friend:I want to be your friend"
)

for item in "${FILES[@]}"; do
  FILENAME="${item%%:*}"
  TEXT="${item##*:}"
  
  # 检查是否已存在
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    "https://upgrade-videos-1412449710.cos.ap-guangzhou.myqcloud.com/TTS/${FILENAME}.mp3" 2>/dev/null)
  
  if [ "$STATUS" = "200" ]; then
    echo "⏭️ ${FILENAME}.mp3 (已存在)"
    continue
  fi
  
  # 生成
  say -v Daniel "$TEXT" -o "${FILENAME}.caff" 2>/dev/null
  if [ -f "${FILENAME}.caff" ]; then
    ffmpeg -i "${FILENAME}.caff" -acodec mp3 -ab 128k "${FILENAME}.mp3" -y 2>/dev/null
    rm -f "${FILENAME}.caff"
  fi
  
  if [ -f "${FILENAME}.mp3" ]; then
    # 上传
    coscmd upload "${FILENAME}.mp3" "TTS/${FILENAME}.mp3" 2>/dev/null
    rm -f "${FILENAME}.mp3"
    echo "✅ ${FILENAME}.mp3"
  else
    echo "❌ ${FILENAME}.mp3 (生成失败)"
  fi
done

echo ""
echo "🎉 全部完成！"
