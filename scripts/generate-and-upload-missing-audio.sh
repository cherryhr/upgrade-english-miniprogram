#!/bin/bash
# 生成缺失的 TTS 音频文件并上传到 COS
# 使用 macOS say 命令生成英式发音

set -e

echo "🎙️ 开始生成缺失的 TTS 音频..."
echo ""

# 创建临时目录
TEMP_DIR="/tmp/missing-tts-audio"
mkdir -p "$TEMP_DIR"

# 需要生成的文件和对应文本
declare -A AUDIO_TEXT=(
  ["let_us_be_friends"]="Let us be friends"
  ["we_are_friends"]="We are friends"
  ["you_are_my_friend"]="You are my friend"
  ["i_want_to_be_your_friend"]="I want to be your friend"
  ["my_favourite_colour_is"]="My favourite colour is"
  ["very_much"]="very much"
  ["well_done"]="Well done"
  ["you_are_a_champion"]="You are a champion"
  ["congratulations"]="Congratulations"
  ["i_see_a_rainbow"]="I see a rainbow"
  ["how_many_colours"]="How many colours"
  ["which_colour_do_you_like"]="Which colour do you like"
  ["very_well_thank_you_and_you"]="Very well thank you and you"
  ["i_am_a_champion"]="I am a champion"
  ["i_am_happy_today"]="I am happy today"
  ["i_am_sad"]="I am sad"
  ["well_done_congratulations_you_are_a_champion"]="Well done congratulations you are a champion"
  ["rainbow_has_seven_colours"]="The rainbow has seven colours"
  ["the_rainbow_has_seven_beautiful_colours"]="The rainbow has seven beautiful colours"
  ["i_see_seven_beautiful_colours"]="I see seven beautiful colours"
  ["i_see_seven_colours"]="I see seven colours"
  ["there_are_seven_colours_in_a_rainbow"]="There are seven colours in a rainbow"
  ["rainbow_is_beautiful"]="The rainbow is beautiful"
  ["these_are_my"]="These are my"
  ["s_sun"]="S, Sun"
  ["m_monkey"]="M, Monkey"
  ["r_rabbit"]="R, Rabbit"
  ["h_horse"]="H, Horse"
  ["j_jacket"]="J, Jacket"
  ["g_gorilla"]="G, Gorilla"
  ["hippopotamus"]="Hippopotamus"
  ["whale"]="Whale"
  ["gorilla"]="Gorilla"
  ["hair"]="Hair"
  ["hope"]="Hope"
  ["yes_i_love_my_grandma_very_much"]="Yes I love my grandma very much"
  ["hundred"]="Hundred"
  ["hot"]="Hot"
  ["help"]="Help"
  ["here_you_are"]="Here you are"
  ["i_love_you"]="I love you"
  ["i_like_you"]="I like you"
  ["i_dont_like"]="I do not like"
  ["no_i_dont_like"]="No I do not like"
  ["i_can"]="I can"
  ["i_see"]="I see"
  ["i_like"]="I like"
  ["i_want"]="I want"
  ["it_is"]="It is"
  ["it_says"]="It says"
  ["this_is"]="This is"
  ["that_is"]="That is"
  ["there_is"]="There is"
  ["she_is"]="She is"
  ["they_are"]="They are"
  ["is_it"]="Is it"
  ["has_it"]="Has it"
  ["your"]="Your"
  ["meow"]="Meow"
  ["roar"]="Roar"
  ["jump"]="Jump"
  ["walk"]="Walk"
  ["stop"]="Stop"
  ["listen_to_me"]="Listen to me"
  ["look_at_me"]="Look at me"
  ["look_at_this"]="Look at this"
  ["point_to"]="Point to"
  ["show_me"]="Show me"
  ["say_it_again_please"]="Say it again please"
  ["repeat_after_me"]="Repeat after me"
  ["wake_up"]="Wake up"
  ["sleepy"]="Sleepy"
  ["left"]="Left"
  ["right"]="Right"
  ["up"]="Up"
  ["to"]="To"
  ["more"]="More"
  ["not"]="Not"
  ["oh"]="Oh"
  ["oh_no"]="Oh no"
  ["too"]="Too"
  ["think"]="Think"
  ["wait"]="Wait"
  ["go"]="Go"
  ["song"]="Song"
  ["laugh"]="Laugh"
  ["i_see_you"]="I see you"
  ["mummy"]="Mummy"
  ["mother"]="Mother"
  ["parent"]="Parent"
  ["we_can"]="We can"
  ["we_like_to"]="We like to"
  ["have_a_good_day"]="Have a good day"
  ["what_shall_we_do"]="What shall we do"
  ["what_shall_we_do_today"]="What shall we do today"
  ["what_would_you_like"]="What would you like"
  ["where_is"]="Where is"
  ["where_is_your"]="Where is your"
  ["who_is_in_your_family"]="Who is in your family"
)

TOTAL=${#AUDIO_TEXT[@]}
CURRENT=0

for filename in "${!AUDIO_TEXT[@]}"; do
  ((CURRENT++))
  TEXT="${AUDIO_TEXT[$filename]}"
  OUTPUT="$TEMP_DIR/${filename}.mp3"
  
  echo "[$CURRENT/$TOTAL] 生成: $filename.mp3"
  echo "   文本: $TEXT"
  
  if [ -f "$OUTPUT" ]; then
    echo "   ⏭️ 已存在，跳过"
    continue
  fi
  
  # 使用 Daniel (英式发音) 生成音频
  say -v Daniel "$TEXT" -o "$TEMP_DIR/${filename}.caff" 2>/dev/null
  
  if [ -f "$TEMP_DIR/${filename}.caff" ]; then
    # 转换为 MP3
    ffmpeg -i "$TEMP_DIR/${filename}.caff" -acodec mp3 -ab 128k "$OUTPUT" -y 2>/dev/null
    rm "$TEMP_DIR/${filename}.caff"
    
    if [ -f "$OUTPUT" ]; then
      echo "   ✅ 生成成功: $OUTPUT"
    else
      echo "   ❌ 转换失败"
    fi
  else
    echo "   ❌ say 命令失败"
  fi
done

echo ""
echo "📁 生成的音频文件位于: $TEMP_DIR"
echo "数量: $(ls -1 $TEMP_DIR/*.mp3 2>/dev/null | wc -l | tr -d ' ')"

echo ""
echo "⚠️  接下来你需要上传这些文件到 COS:"
echo "   Bucket: upgrade-videos-1412449710"
echo "   区域: ap-guangzhou"
echo "   路径: TTS/"
echo ""
echo "上传命令示例:"
echo "   python3 ~/Desktop/oxford-phonics-tools/cos_uploader_cmd.py \\"
echo "     --file $TEMP_DIR/let_us_be_friends.mp3 \\"
echo "     --cos-path TTS/let_us_be_friends.mp3"
