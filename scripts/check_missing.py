#!/usr/bin/env python3
"""检查缺失的音频文件"""
import json
import re

# COS文件列表
cos_files_raw = """a,angry,animals,ant,apple,apples,are_you_hungry,are_you_tired,arm,arms,b,baby,ball,ball_toy,balloon,banana,bananas,be,be_quiet,bear,bird,black,blocks,blue,book,box,boy,bread,brother,brown,bye,bye_bye,c,cake,can,can_you_count_to_ten,can_you_count_to_ten_in_english,can_you_draw_what_can_you_draw,can_you_run_fast,can_you_sit_down_please,car,carrot,cat,celebrate,champion,chicken,clap,close,close_your_book,cow,d,dad,dance,do,do_you_have_a_brother_or_a_sister,do_you_like_apples,do_you_want_some_milk,do_you_want_to_be_friends,does,dog,doll,doll_toy,dolphin,draw,duck,e,ear,ears,egg,egg_food,eight,eight_seven_eight_nine_ten,elephant,eraser,excited,eyes,f,family,feet,fish,five,flower,foot,four,fox,friend,frog,from,fruit,fun,g,game,gift,giraffe,girl,good,good_afternoon,good_evening,good_morning,good_morning_im_very_well_thank_you,good_morning_miss_wang_how_are_you,good_night,goodbye,graduate,grandma,grandpa,grape,gray,green,guitar,h,hand,hands,hands_up,happy,hat,head,hello,hello_what_is_your_name,here,hi,hi_my_name_is_amy_nice_to_meet_you,hip,home,horse,house,how,how_are_you,how_are_you_are_you_happy,how_are_you_feeling_today,how_are_you_today,how_many_apples_are_on_the_table,how_many_colours_can_you_say,how_many_hands_do_you_have,how_old_are_you,how_old_are_you_how_many_candles,hug,hungry,i,i_am,i_am_fine,i_can_say_red_blue_yellow_green_and_more,i_have_a_brother_his_name_is_tom,i_have_two_hands_left_hand_and_right_hand,i_learned_greetings_colours_numbers_and_more,i_want_to_eat_pizza_pizza_is_delicious,ice_cream,igloo,im,im_fine_thank_you_and_you,im_five_years_old,im_four_years_old_four_candles_on_my_cake,in,insect,is,is_the_sky_blue_or_green,its,its_blue_the_sky_is_beautiful_blue,j,jacket,jellyfish,juice,k,kangaroo,key,kite,knees,l,lamp,leaf,leg,legs,like,lion,listen,live,look,love,m,me,meat,milk,milk_food,mom,monkey,mouse,mouth,mum,my,my_name_is,my_name_is_ben_nice_to_meet_you,n,name,nest,nice_to_meet_you,nine,no,noodles,nose,nut,o,octopus,ok_im_opening_my_book_now,old,once,one,open,open_your_book,orange,owl,p,panda,party,pencil,penguin,perform,pet,pig,pink,pizza,play,please,please_open_your_books,please_stand_up_are_you_ready,purple,put_up_your_hand,puzzle,q,queen,question,quilt,r,rabbit,rainbow,raise_your_hand,read,red,review,rice,ring,robot,robot_toy,run,s,sad,scared,see_you,seven,sick,sing,sister,sit,sit_down,six,snake,sock,stand,stand_up,star,sun,surprised,sweep,t,table,teddy_bear,ten,thank_you,the,the_apple_is_red_it_is_a_red_apple,the_sky_is_blue_it_is_a_beautiful_blue_sky,then,there,there_are_five_apples_on_the_table,there_is_a_cow_a_pig_a_horse_and_a_chicken,thirsty,this,this_is_a_cat_the_cat_says_meow,three,tiger,tired,touch_your_head_can_you_do_it,toy,toy_car,train,tree,trophy,two,u,umbrella,under,unicorn,v,van,vase,vegetables,violin,w,watch,watermelon,we,what,what_animal_is_this,what_are_these_are_these_eyes,what_colour_is_the_apple,what_colour_is_the_sky,what_did_you_learn_in_this_class,what_do_you_want_to_eat,what_is_on_the_farm,what_is_this_is_it_a_car,what_is_your_favourite_colour,what_is_your_name,what_number_comes_after_seven,what_sound_does_a_dog_make,whats,where,where_are_you_from,white,who,who_is_he_is_he_your_dad,who_is_she_is_she_your_mum,why,window,woof_woof_a_dog_says_woof_woof,x,xylophone,y,yarn,yellow,yes,yes_a_rainbow_has_seven_beautiful_colours,yes_he_is_my_dad_i_love_my_dad,yes_i_am_hungry_i_want_an_apple,yes_i_am_tired_i_want_to_sleep,yes_i_am_touching_my_head,yes_i_can_draw_a_cat_look_at_my_cat,yes_i_can_run_very_fast,yes_i_like_apples_apples_are_red_and_sweet,yes_im_happy_are_you_happy_too,yes_im_ready_im_standing_up,yes_it_is_a_red_car_i_like_cars,yes_let_us_be_friends,yes_miss_i_am_sitting_down_now,yes_one_two_three_four_five_six_seven_eight_nine_ten,yes_please_milk_is_good_for_me,yes_she_is_my_mum_my_mum_is_nice,yes_these_are_my_eyes_i_have_two_eyes,yo_yo,you,you_are_welcome,yoyo,z,zebra,zip,zoo"""
cos_files = set(cos_files_raw.split(','))

# 读取tts_texts_full.json
with open('tts_texts_full.json', 'r', encoding='utf-8') as f:
    texts = json.load(f)

def get_filename(text):
    """获取对应的音频文件名"""
    if not text:
        return None

    # 清理
    clean = text
    clean = re.sub(r'!', '', clean)
    clean = re.sub(r'"', "'", clean)
    clean = re.sub(r"'", "'", clean)
    clean = re.sub(r':', ' ', clean)
    clean = re.sub(r';', '', clean)
    clean = re.sub(r'[【】（）()]', '', clean)
    clean = re.sub(r'[，。]', ',', clean)
    clean = re.sub(r',', ' ', clean)
    clean = re.sub(r'[.。]+', '.', clean)
    clean = re.sub(r'\s+', ' ', clean)
    clean = clean.strip().lower()

    if not clean:
        return None

    lower = clean

    # 完整句子映射
    full_map = {
        "hi! my name is amy. nice to meet you!": "hi_my_name_is_amy_nice_to_meet_you.mp3",
        "hi my name is amy. nice to meet you!": "hi_my_name_is_amy_nice_to_meet_you.mp3",
        "good morning! i'm very well, thank you!": "good_morning_im_very_well_thank_you.mp3",
        "yes! i'm ready! i'm standing up!": "yes_im_ready_im_standing_up.mp3",
        "what's your name?": "whats.mp3",
        "do you want to be my friend?": "do_you_want_to_be_friends.mp3",
        "do you want to be friends?": "do_you_want_to_be_friends.mp3",
        "yes! nice to meet you! let's be friends!": "yes_let_us_be_friends.mp3",
        "it's my birthday today! i'm so excited!": "excited.mp3",
        "what colour is this apple?": "what_colour_is_the_apple.mp3",
        "it's red! red like a fire engine!": "red.mp3",
        "my favourite colour is yellow! yellow like the sun!": "yellow.mp3",
        "yes! a rainbow has seven beautiful colours!": "yes_a_rainbow_has_seven_beautiful_colours.mp3",
        "yes! one, two, three, four, five, six, seven, eight, nine, ten!": "yes_one_two_three_four_five_six_seven_eight_nine_ten.mp3",
        "what animal is this? it says meow!": "this_is_a_cat_the_cat_says_meow.mp3",
        "there are five apples on the table!": "there_are_five_apples_on_the_table.mp3",
        "can you count to ten?": "can_you_count_to_ten.mp3",
        "how are you feeling today?": "how_are_you_feeling_today.mp3",
        "how are you today?": "how_are_you_today.mp3",
        "how are you?": "how_are_you.mp3",
        "i'm fine, thank you! and you?": "im_fine_thank_you_and_you.mp3",
        "what is your favourite colour?": "what_is_your_favourite_colour.mp3",
        "can you see a rainbow? how many colours?": "how_many_colours_can_you_say.mp3",
        "how many colours can you say?": "how_many_colours_can_you_say.mp3",
        "how many hands do you have?": "how_many_hands_do_you_have.mp3",
        "where are you from?": "where_are_you_from.mp3",
        "do you like apples?": "do_you_like_apples.mp3",
        "do you want some milk?": "do_you_want_some_milk.mp3",
        "what do you want to eat?": "what_do_you_want_to_eat.mp3",
        "is the sky blue or green?": "is_the_sky_blue_or_green.mp3",
        "do you have a brother or a sister?": "do_you_have_a_brother_or_a_sister.mp3",
        "can you draw? what can you draw?": "can_you_draw_what_can_you_draw.mp3",
        "can you sit down, please?": "can_you_sit_down_please.mp3",
        "please stand up! are you ready?": "please_stand_up_are_you_ready.mp3",
        "please open your books!": "please_open_your_books.mp3",
        "touch your head. can you do it?": "touch_your_head_can_you_do_it.mp3",
        "what is this? is it a car?": "what_is_this_is_it_a_car.mp3",
        "are you hungry?": "are_you_hungry.mp3",
        "are you tired?": "are_you_tired.mp3",
        "what's this?": "what_is_this.mp3",
        "what animal is this?": "what_animal_is_this.mp3",
        "what is on the farm?": "what_is_on_the_farm.mp3",
        "what are these? are these eyes?": "what_are_these_are_these_eyes.mp3",
        "what number comes after seven?": "what_number_comes_after_seven.mp3",
        "what sound does a dog make?": "what_sound_does_a_dog_make.mp3",
        "are you happy too?": "how_are_you_are_you_happy.mp3",
        "yes i'm happy! are you happy too?": "yes_im_happy_are_you_happy_too.mp3",
        "goodbye! see you tomorrow!": "goodbye.mp3",
        "bye bye! have a good day!": "bye_bye.mp3",
        "listen carefully and repeat after me.": "listen.mp3",
        "who knows the answer? hands up!": "put_up_your_hand.mp3",
        "me! me! i know the answer!": "me.mp3",
        "i lost my toy. i feel very sad.": "sad.mp3",
        "why are you so excited?": "excited.mp3",
        "why are you angry?": "angry.mp3",
        "my sister took my pencil! i'm angry!": "angry.mp3",
        "playing together is so much fun!": "fun.mp3",
        "well done! congratulations! you are amazing!": "celebrate.mp3",
        "i have two hands. left hand and right hand!": "hands.mp3",
        "i learned greetings, colours, numbers, animals and more!": "i_learned_greetings_colours_numbers_and_more.mp3",
        "i can say red, blue, yellow, green and more!": "i_can_say_red_blue_yellow_green_and_more.mp3",
        "there is a cow, a pig, a horse and a chicken on the farm": "there_is_a_cow_a_pig_a_horse_and_a_chicken.mp3",
        "there are seven colours in a rainbow": "how_many_colours_can_you_say.mp3",
        # 歌词
        "hello, hello, hello": "hello.mp3",
        "how are you today?": "how_are_you_today.mp3",
        "i am fine, thank you": "i_am.mp3",
        "hip hip hooray": "hip.mp3",
        "sit down, sit down": "sit_down.mp3",
        "stand up, stand up": "stand_up.mp3",
        "hands up, hands up": "hands_up.mp3",
        "be quiet, shhh": "be_quiet.mp3",
        "listen, listen, listen to me": "listen.mp3",
        "what is your name? what is your name?": "what_is_your_name.mp3",
        "my name is tom, what a great name": "my_name_is.mp3",
        "how old are you? how old are you?": "how_old_are_you.mp3",
        "i'm five years old, hip hip hooray": "im_five_years_old.mp3",
        "how are you today? how are you?": "how_are_you_today.mp3",
        "i'm happy, happy, happy": "happy.mp3",
        "i'm sad, sad, sad today...": "sad.mp3",
        "red, red, red": "red.mp3",
        "blue, blue, blue": "blue.mp3",
        "yellow, yellow, yellow": "yellow.mp3",
        "green, green, green": "green.mp3",
        "rainbow colours, so beautiful": "rainbow.mp3",
        "one, two, three, four, five": "can_you_count_to_ten.mp3",
        "once i caught a fish alive": "fish.mp3",
        "six, seven, eight, nine, ten": "eight_seven_eight_nine_ten.mp3",
        "then i let it go again": "then.mp3",
        "the lion says roar": "lion.mp3",
        "the dog says woof": "woof_woof_a_dog_says_woof_woof.mp3",
        "the cat says meow": "cat.mp3",
        "the cow says mooo": "cow.mp3",
        "animals, animals, we love you": "animals.mp3",
        "this is my family": "family.mp3",
        "mum and dad and me": "mum.mp3",
        "i love my family": "love.mp3",
        "happy, happy family": "happy.mp3",
        "head, shoulders, knees and toes": "head.mp3",
        "eyes and ears and mouth and nose": "eyes.mp3",
        "apples, apples, so red and sweet": "apple.mp3",
        "bananas, bananas, so yellow and neat": "banana.mp3",
        "pizza, pizza, so yummy to eat": "pizza.mp3",
        "i love yummy food, hip hip hooray": "love.mp3",
        "in my toy box, what do i see?": "toy.mp3",
        "a bouncy ball bouncing at me": "ball.mp3",
        "a teddy bear soft as can be": "teddy_bear.mp3",
        "a little toy car, zoom zoom zoom": "toy_car.mp3",
        "i love my toys, hip hip hooray": "love.mp3",
        "we learned our abcs": "abc.mp3",
        "we counted 1, 2, 3": "can_you_count_to_ten.mp3",
        "we know our colours bright": "rainbow.mp3",
        "we learned to say hello": "hello.mp3",
        "we did it, we did it, hooray": "celebrate.mp3",
    }

    if lower in full_map:
        return full_map[lower]

    # 前缀匹配
    prefixes = [
        ("hello what is your name", "hello_what_is_your_name.mp3"),
        ("hi my name is", "hi_my_name_is_amy_nice_to_meet_you.mp3"),
        ("my name is", "my_name_is.mp3"),
        ("what is your name", "what_is_your_name.mp3"),
        ("how are you", "how_are_you.mp3"),
        ("how old are you", "how_old_are_you.mp3"),
        ("where are you from", "where_are_you_from.mp3"),
        ("nice to meet you", "nice_to_meet_you.mp3"),
        ("good morning", "good_morning.mp3"),
        ("do you like", "do_you_like_apples.mp3"),
        ("do you want", "do_you_want_some_milk.mp3"),
        ("what colour", "what_colour_is_the_apple.mp3"),
        ("can you count", "can_you_count_to_ten.mp3"),
        ("what is this", "what_is_this.mp3"),
        ("what animal", "what_animal_is_this.mp3"),
        ("are you", "are_you_hungry.mp3"),
        ("there are", "there_are.mp3"),
        ("i am", "i_am.mp3"),
        ("i'm", "i_am.mp3"),
        ("i like", "like.mp3"),
        ("i love", "love.mp3"),
    ]

    for prefix, filename in prefixes:
        if lower.startswith(prefix):
            return filename

    # 单词回退
    words = clean.split(' ')
    first_word = re.sub(r'[^a-z]', '', words[0]) if words else ''
    if first_word:
        return first_word + '.mp3'

    return None

# 检查
missing = []
found = []

for item in texts:
    text = item['text']
    filename = get_filename(text)
    if filename:
        base_name = filename.replace('.mp3', '')
        if base_name in cos_files:
            found.append((text, filename))
        else:
            missing.append((text, filename))

print(f"已找到: {len(found)} 个")
print(f"缺失: {len(missing)} 个")

if missing:
    print("\n缺失的音频文件:")
    for text, fname in missing[:50]:
        print(f"  {fname} <- {text[:50]}")

    # 保存缺失列表
    with open('missing_audio.json', 'w', encoding='utf-8') as f:
        json.dump(missing, f, ensure_ascii=False, indent=2)
    print(f"\n缺失列表已保存到 missing_audio.json")
