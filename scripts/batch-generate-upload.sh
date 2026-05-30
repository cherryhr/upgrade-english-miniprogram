#!/bin/bash
# 批量生成缺失音频并上传到COS

set -e

TEMP_DIR="/tmp/tts-audio-$(date +%s)"
mkdir -p "$TEMP_DIR"
COS_BUCKET="upgrade-videos-1412449710"
COS_REGION="ap-guangzhou"

echo "📁 临时目录: $TEMP_DIR"
echo "🎙️ 开始生成音频..."
echo ""

# 缺失文件列表 - 简化版
FILES=(
  "let_us_be_friends:Let us be friends"
  "we_are_friends:We are friends"
  "you_are_my_friend:You are my friend"
  "i_want_to_be_your_friend:I want to be your friend"
  "my_favourite_colour_is:My favourite colour is"
  "very_much:very much"
  "well_done:Well done"
  "you_are_a_champion:You are a champion"
  "congratulations:Congratulations"
  "i_see_a_rainbow:I see a rainbow"
  "how_many_colours:How many colours"
  "which_colour_do_you_like:Which colour do you like"
  "very_well_thank_you_and_you:Very well thank you and you"
  "i_am_a_champion:I am a champion"
  "i_am_happy_today:I am happy today"
  "i_am_sad:I am sad"
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
)

TOTAL=${#FILES[@]}
CURRENT=0
GENERATED=0

# 批量生成
for item in "${FILES[@]}"; do
  ((CURRENT++))
  FILENAME="${item%%:*}"
  TEXT="${item##*:}"
  OUTPUT="$TEMP_DIR/${FILENAME}.mp3"
  
  # 使用 Daniel (英式发音)
  say -v Daniel "$TEXT" -o "$TEMP_DIR/${FILENAME}.caff" 2>/dev/null
  
  if [ -f "$TEMP_DIR/${FILENAME}.caff" ]; then
    ffmpeg -i "$TEMP_DIR/${FILENAME}.caff" -acodec mp3 -ab 128k "$OUTPUT" -y 2>/dev/null
    rm "$TEMP_DIR/${FILENAME}.caff"
    
    if [ -f "$OUTPUT" ]; then
      echo "[$CURRENT/$TOTAL] ✅ $FILENAME.mp3"
      ((GENERATED++))
    else
      echo "[$CURRENT/$TOTAL] ❌ $FILENAME.mp3 (转换失败)"
    fi
  else
    echo "[$CURRENT/$TOTAL] ❌ $FILENAME.mp3 (say失败)"
  fi
done

echo ""
echo "📊 生成完成: $GENERATED / $TOTAL 个文件"
echo ""

# 统计待上传文件
PENDING=$(ls -1 $TEMP_DIR/*.mp3 2>/dev/null | wc -l | tr -d ' ')
echo "☁️ 准备上传 $PENDING 个文件到 COS..."
echo ""

# 上传到 COS
if [ "$PENDING" -gt 0 ]; then
  UPLOADED=0
  FAILED=0
  
  for f in $TEMP_DIR/*.mp3; do
    FILENAME=$(basename "$f")
    COS_PATH="TTS/$FILENAME"
    
    # 检查是否已存在
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
      "https://${COS_BUCKET}.cos.${COS_REGION}.myqcloud.com/${COS_PATH}" 2>/dev/null)
    
    if [ "$STATUS" = "200" ]; then
      echo "⏭️ $FILENAME (已存在，跳过)"
      rm "$f"
      continue
    fi
    
    # 上传
    curl -X PUT -T "$f" \
      "https://${COS_BUCKET}.cos.${COS_REGION}.myqcloud.com/${COS_PATH}" \
      -H "x-cos-acl: public-read" 2>/dev/null
    
    if [ $? -eq 0 ]; then
      echo "✅ 上传: $FILENAME"
      ((UPLOADED++))
      rm "$f"
    else
      echo "❌ 失败: $FILENAME"
      ((FAILED++))
    fi
  done
  
  echo ""
  echo "📊 上传完成: ✅ $UPLOADED | ❌ $FAILED"
fi

echo ""
echo "🧹 清理临时文件..."
rm -rf "$TEMP_DIR"
echo "✅ 全部完成！"
