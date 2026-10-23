import { EGG, JAIN_VEG, JAIN_VEGAN, MEAT, VEG, VEGAN, type Row } from "./rows";

/*
 * Raw ingredients for the dish recipes in dishes.ts. Per-100 g values (edible part, raw
 * or as sold). Rows marked "IFCT 2017" use the Indian Food Composition Tables 2017
 * (National Institute of Nutrition, Hyderabad), checked by hand on 2026-10-24, in
 * Oswald's convention: carbs include fibre, and calories add 2 kcal per gram of fibre
 * (IFCT leaves fibre out of both). The rest are rough values after USDA FoodData
 * Central, kept where IFCT has no match or its sample is a different product. Ingredients only:
 * searchable and loggable, but insights never suggest them as a meal.
 * Jain: no onion, garlic, potato or other roots (ginger counts as a root here).
 */
export const INGREDIENT_ROWS: Row[] = [
  // Grains and flours
  ["raw-brown-rice", "Brown rice (raw)", "ब्राउन चावल (कच्चे)", ["raw brown rice"], JAIN_VEGAN, { katori: 140 }, "g", [363, 9.2, 79.2, 1.2, 4.4, 0.7, 0.3, 4, 11, 1]], // IFCT 2017: A013
  ["raw-quinoa", "Quinoa (raw)", "किनोआ (कच्चा)", ["raw quinoa"], JAIN_VEGAN, { katori: 130 }, "g", [358, 13.1, 68.3, 5.5, 14.7, 1.4, 0.6, 4, 198, 7.5]], // IFCT 2017: A009
  ["maida", "Maida (refined flour)", "मैदा", ["maida", "refined flour", "all purpose flour"], JAIN_VEGAN, { katori: 120, tbsp: 8 }, "g", [357, 10.4, 77, 0.8, 2.8, 1.8, 0.1, 2, 20, 1.8]], // IFCT 2017: A018
  ["suji", "Suji (semolina)", "सूजी", ["suji", "sooji", "rava", "semolina"], JAIN_VEGAN, { katori: 160, tbsp: 10 }, "g", [353, 11.4, 78.2, 0.7, 9.7, 1.6, 0.1, 2, 29, 3]], // IFCT 2017: A022
  ["ragi-flour", "Ragi flour", "रागी आटा", ["ragi atta", "nachni flour", "finger millet flour"], JAIN_VEGAN, { katori: 120, tbsp: 8 }, "g", [343, 7.2, 78, 1.9, 11.2, 0.3, 0.3, 5, 364, 4.6]], // IFCT 2017: A010
  ["bajra-flour", "Bajra flour", "बाजरा आटा", ["bajra atta", "pearl millet flour"], JAIN_VEGAN, { katori: 120, tbsp: 8 }, "g", [361, 11.6, 67.5, 5, 11.5, 1, 0.9, 10, 27, 6.4]],
  ["jowar-flour", "Jowar flour", "ज्वार आटा", ["jowar atta", "sorghum flour"], JAIN_VEGAN, { katori: 120, tbsp: 8 }, "g", [355, 10, 77.9, 1.7, 10.2, 1.3, 0.2, 5, 28, 4]], // IFCT 2017: A005
  ["makki-atta", "Makki atta (maize flour)", "मक्की का आटा", ["makki atta", "maize flour", "corn flour", "cornflour"], JAIN_VEGAN, { katori: 120, tbsp: 8 }, "g", [359, 8.8, 77, 3.8, 12.2, 1.7, 0.4, 4, 9, 2.5]], // IFCT 2017: A006
  ["raw-poha", "Poha (raw flakes)", "पोहा (कच्चा)", ["raw poha", "chiwda flakes"], JAIN_VEGAN, { katori: 60 }, "g", [361, 7.4, 80.2, 1.1, 3.5, 0.3, 0.3, 3, 9, 4.5]], // IFCT 2017: A011
  ["sabudana", "Sabudana (raw)", "साबूदाना", ["raw sabudana", "sago", "tapioca pearls"], JAIN_VEGAN, { katori: 150 }, "g", [358, 0.2, 88.7, 0, 0.9, 3.4, 0, 1, 20, 1.6]],
  ["vermicelli", "Vermicelli (raw)", "सेवइयां", ["semiya", "seviyan", "sevai"], JAIN_VEGAN, { katori: 70 }, "g", [351, 9.7, 79.7, 0.5, 9.3, 1.7, 0.1, 3, 19, 2]], // IFCT 2017: A023
  ["dalia", "Dalia (broken wheat, raw)", "दलिया", ["broken wheat", "dalia raw", "bulgur"], JAIN_VEGAN, { katori: 140 }, "g", [344, 10.6, 76, 1.5, 11.2, 1.8, 0.2, 2, 39, 4]], // IFCT 2017: A020
  ["instant-noodles", "Instant noodles (dry, with masala)", "इंस्टेंट नूडल्स", ["noodle cake"], VEGAN, { piece: 70 }, "piece", [440, 9.5, 61, 17.5, 2.5, 2, 8, 1100, 20, 4]],
  // Pulses, dry
  ["raw-moong-dal", "Moong dal (raw)", "मूंग दाल (कच्ची)", ["raw moong dal", "yellow moong raw"], JAIN_VEGAN, { katori: 130, tbsp: 12 }, "katori", [344, 23.9, 62, 1.4, 9.4, 0.9, 0.2, 10, 43, 3.9]], // IFCT 2017: B010
  ["raw-masoor-dal", "Masoor dal (raw)", "मसूर दाल (कच्ची)", ["raw masoor dal", "red lentils raw"], JAIN_VEGAN, { katori: 130, tbsp: 12 }, "katori", [343, 24.4, 63, 0.8, 10.4, 1.9, 0.1, 10, 44, 7.1]], // IFCT 2017: B013
  ["raw-chana-dal", "Chana dal (raw)", "चना दाल (कच्ची)", ["raw chana dal", "bengal gram dal raw"], JAIN_VEGAN, { katori: 130, tbsp: 12 }, "katori", [360, 21, 58, 5.5, 15, 3, 0.6, 20, 46, 6.1]],
  ["raw-urad-dal", "Urad dal (raw)", "उड़द दाल (कच्ची)", ["raw urad dal", "black gram dal raw"], JAIN_VEGAN, { katori: 130, tbsp: 12 }, "katori", [348, 23.1, 62.9, 1.7, 11.9, 0.8, 0.3, 19, 56, 4.7]], // IFCT 2017: B003
  ["raw-whole-moong", "Whole moong (raw)", "साबुत मूंग", ["green gram raw", "sabut moong raw"], JAIN_VEGAN, { katori: 130 }, "katori", [328, 22.5, 63.2, 1.1, 17, 0.5, 0.3, 12, 92, 4.9]], // IFCT 2017: B011
  ["raw-rajma", "Rajma (raw)", "राजमा (कच्चा)", ["raw rajma", "kidney beans raw"], JAIN_VEGAN, { katori: 130 }, "katori", [332, 19.5, 66.1, 1.7, 17.1, 1.9, 0.2, 10, 131, 6.2]], // IFCT 2017: average of B018, B019, B020
  ["raw-kabuli-chana", "Kabuli chana (raw)", "काबुली चना (कच्चा)", ["raw chickpeas", "safed chana raw"], JAIN_VEGAN, { katori: 130 }, "katori", [378, 20.5, 63, 6, 12.2, 10.7, 0.6, 24, 57, 4.3]],
  ["raw-kala-chana", "Kala chana (raw)", "काला चना (कच्चा)", ["raw kala chana", "black chickpeas raw"], JAIN_VEGAN, { katori: 130 }, "katori", [337, 18.8, 64.8, 5.1, 25.2, 1, 0.5, 27, 150, 6.8]], // IFCT 2017: B002
  ["raw-lobia", "Lobia (raw)", "लोबिया (कच्चा)", ["raw lobia", "black eyed peas raw", "chawli raw"], JAIN_VEGAN, { katori: 130 }, "katori", [344, 20.8, 65.8, 1.1, 11.6, 1.4, 0.3, 13, 83, 5.5]], // IFCT 2017: average of B005, B006
  ["soya-chunks", "Soya chunks (dry)", "सोया चंक्स", ["soya chunks", "soya badi", "soya nuggets"], JAIN_VEGAN, { katori: 50 }, "g", [345, 52, 33, 0.5, 13, 0, 0.1, 20, 350, 10]],
  ["makhana-dry", "Makhana (dry)", "मखाना (कच्चा)", ["fox nuts dry", "lotus seeds dry"], JAIN_VEGAN, { katori: 30 }, "g", [350, 9.7, 77, 0.1, 7, 0, 0, 1, 60, 1.4]],
  // Vegetables, raw
  ["cauliflower", "Cauliflower (raw)", "फूलगोभी (कच्ची)", ["gobhi raw", "phool gobhi raw"], JAIN_VEGAN, { katori: 100 }, "g", [30, 2.1, 5.7, 0.4, 3.7, 0.5, 0.1, 31, 25, 1]], // IFCT 2017: D036
  ["cabbage", "Cabbage (raw)", "पत्ता गोभी (कच्ची)", ["patta gobhi raw", "band gobhi raw"], JAIN_VEGAN, { katori: 90 }, "g", [27, 1.4, 6, 0.1, 2.8, 1, 0.1, 15, 52, 0.3]], // IFCT 2017: C015
  ["capsicum", "Capsicum (raw)", "शिमला मिर्च", ["shimla mirch", "bell pepper", "green capsicum"], JAIN_VEGAN, { piece: 120 }, "g", [20, 0.9, 4.6, 0.2, 1.7, 2.4, 0.1, 3, 10, 0.3]],
  ["brinjal", "Brinjal (raw)", "बैंगन", ["baingan", "eggplant", "aubergine"], JAIN_VEGAN, { piece: 250 }, "g", [33, 1.5, 7.5, 0.3, 4, 1, 0.1, 4, 17, 0.4]], // IFCT 2017: D031
  ["raw-bhindi", "Bhindi (raw)", "भिंडी (कच्ची)", ["raw okra", "raw lady finger"], JAIN_VEGAN, { katori: 100 }, "g", [33, 1.9, 7.5, 0.2, 3.2, 1.5, 0, 7, 82, 0.6]],
  ["lauki", "Lauki (raw)", "लौकी", ["bottle gourd", "doodhi", "ghiya"], JAIN_VEGAN, { katori: 120 }, "g", [17, 0.5, 4.3, 0.1, 2.1, 0.4, 0, 1, 16, 0.3]], // IFCT 2017: average of D007, D008, D009
  ["tinda", "Tinda (raw)", "टिंडा", ["round gourd"], JAIN_VEGAN, { piece: 50 }, "g", [18, 1, 3.9, 0.2, 2, 0.4, 0.1, 21, 20, 0.4]], // IFCT 2017: D073
  ["karela", "Karela (raw)", "करेला", ["bitter gourd", "bitter melon"], JAIN_VEGAN, { piece: 100 }, "g", [27, 1.5, 6.2, 0.2, 3.7, 0.1, 0.1, 12, 18, 1.2]], // IFCT 2017: average of D004, D005, D006
  ["mushroom", "Mushroom (raw)", "मशरूम", ["button mushroom", "khumb"], VEGAN, { katori: 70 }, "g", [34, 3.7, 5.1, 0.4, 3.1, 0.1, 0.1, 8, 18, 0.3]], // IFCT 2017: J001
  ["methi-leaves", "Methi leaves (raw)", "मेथी पत्ते", ["fenugreek leaves", "methi saag"], JAIN_VEGAN, { katori: 40 }, "g", [44, 3.7, 7.1, 0.8, 4.9, 0.9, 0.2, 47, 274, 5.7]], // IFCT 2017: C020
  ["sarson", "Sarson leaves (raw)", "सरसों का साग (कच्चा)", ["mustard greens"], JAIN_VEGAN, { katori: 50 }, "g", [38, 3.5, 6.3, 0.5, 3.9, 0, 0.1, 19, 191, 2.8]], // IFCT 2017: C026
  ["beans", "French beans (raw)", "फ्रेंच बीन्स", ["french beans", "green beans", "phali"], JAIN_VEGAN, { katori: 100 }, "g", [32, 2.3, 6.9, 0.2, 4.3, 1, 0.1, 9, 53, 1.1]], // IFCT 2017: average of D049, D050
  ["pumpkin", "Pumpkin (raw)", "कद्दू", ["red pumpkin", "raw pumpkin"], JAIN_VEGAN, { katori: 120 }, "g", [28, 0.8, 6.6, 0.2, 2.6, 3, 0, 9, 23, 0.4]], // IFCT 2017: D066
  ["arbi", "Arbi (raw)", "अरबी", ["taro root", "colocasia"], VEGAN, { piece: 40 }, "g", [95, 3.3, 21.1, 0.2, 3.2, 0.9, 0, 5, 30, 0.7]], // IFCT 2017: F004
  ["beetroot", "Beetroot (raw)", "चुकंदर", ["chukandar", "beet"], VEGAN, { piece: 130 }, "g", [43, 1.6, 9.6, 0.2, 2.8, 6.8, 0, 78, 16, 0.8]],
  ["mooli", "Mooli (raw)", "मूली", ["radish", "white radish"], VEGAN, { piece: 200 }, "g", [38, 0.8, 9.2, 0.1, 2.6, 0.9, 0, 28, 30, 0.4]], // IFCT 2017: F010
  ["sweet-potato", "Sweet potato (raw)", "शकरकंद", ["shakarkandi raw", "raw sweet potato"], VEGAN, { piece: 130 }, "g", [116, 1.3, 28.1, 0.3, 4, 3.8, 0.1, 29, 28, 0.4]], // IFCT 2017: average of F013, F014
  ["garlic", "Garlic", "लहसुन", ["lehsun", "lahsun"], VEGAN, { piece: 3, tbsp: 9 }, "g", [134, 6.8, 27.2, 0.1, 5.3, 5.4, 0, 10, 19, 1]], // IFCT 2017: average of G011, G012
  ["ginger", "Ginger", "अदरक", ["adrak"], VEGAN, { tbsp: 6 }, "g", [66, 2.2, 14.3, 0.8, 5.4, 1.3, 0.2, 10, 19, 1.9]], // IFCT 2017: G014
  ["green-chilli", "Green chilli", "हरी मिर्च", ["hari mirch", "green chili"], JAIN_VEGAN, { piece: 3 }, "g", [52, 2.4, 10.6, 0.7, 4.8, 0.7, 0.1, 2, 18, 1.2]], // IFCT 2017: G008
  ["coriander", "Coriander leaves", "हरा धनिया", ["dhania", "cilantro"], JAIN_VEGAN, { tbsp: 4 }, "g", [40, 3.5, 6.6, 0.7, 4.7, 0.2, 0.2, 37, 146, 5.3]], // IFCT 2017: G009
  ["lemon-juice", "Lemon juice", "नींबू का रस", ["nimbu ras"], JAIN_VEGAN, { tbsp: 15 }, "tbsp", [22, 0.4, 6.9, 0.2, 0.3, 2.5, 0, 1, 6, 0.1]],
  ["coconut", "Coconut (fresh, grated)", "नारियल (कसा हुआ)", ["grated coconut", "fresh coconut", "nariyal"], JAIN_VEGAN, { katori: 80, tbsp: 7 }, "g", [430, 3.8, 16.7, 41.4, 10.4, 6.2, 28.1, 8, 8, 1.3]], // IFCT 2017: H007
  ["coconut-milk", "Coconut milk", "नारियल का दूध", ["nariyal doodh"], JAIN_VEGAN, { katori: 150, tbsp: 15 }, "g", [230, 2.3, 5.5, 23.8, 2.2, 3.3, 21.1, 15, 16, 1.6]],
  ["tamarind", "Tamarind pulp", "इमली", ["imli", "tamarind"], JAIN_VEGAN, { tbsp: 15 }, "g", [299, 2.9, 72.7, 0.1, 5.3, 52.9, 0, 25, 149, 9.2]], // IFCT 2017: E064
  ["sesame", "Sesame seeds", "तिल", ["til", "sesame"], JAIN_VEGAN, { tbsp: 9 }, "g", [554, 21.7, 27.8, 43, 17, 0.7, 6.4, 15, 1283, 15]], // IFCT 2017: H011
  // Meat, fish, eggs, tofu, raw
  ["raw-egg", "Egg (raw)", "अंडा (कच्चा)", ["raw egg"], EGG, { piece: 50 }, "piece", [135, 13.3, 0, 9.2, 0, 0, 3, 123, 49, 1.8]], // IFCT 2017: M001
  ["raw-chicken", "Chicken (raw, curry cut)", "चिकन (कच्चा)", ["raw chicken", "chicken curry cut"], MEAT, { katori: 150 }, "g", [140, 19.5, 0, 6.5, 0, 0, 1.8, 85, 10, 0.9]],
  ["raw-chicken-breast", "Chicken breast (raw)", "चिकन ब्रेस्ट (कच्चा)", ["raw chicken breast", "boneless chicken"], MEAT, { piece: 150 }, "g", [120, 22.5, 0, 2.6, 0, 0, 0.6, 45, 5, 0.4]],
  ["raw-mutton", "Mutton (raw)", "मटन (कच्चा)", ["raw mutton", "goat meat raw"], MEAT, { katori: 150 }, "g", [161, 20.9, 0, 8.6, 0, 0, 4, 45, 6, 1.7]], // IFCT 2017: average of O001, O002, O003
  ["raw-fish", "Fish (raw)", "मछली (कच्ची)", ["raw fish", "rohu raw"], MEAT, { piece: 100 }, "g", [100, 17.5, 0, 3, 0, 0, 0.7, 50, 30, 0.8]],
  ["raw-prawns", "Prawns (raw)", "झींगा (कच्चा)", ["raw prawns", "raw shrimp"], MEAT, { katori: 120 }, "g", [74, 16.1, 0, 0.6, 0, 0, 0.1, 366, 53, 0.6]], // IFCT 2017: average of S008, Q007, Q008
  ["tofu", "Tofu", "टोफू", ["soy paneer", "bean curd"], JAIN_VEGAN, { piece: 100 }, "g", [144, 15.8, 2.8, 8.7, 2.3, 0.6, 1.3, 14, 200, 2.7]],
  // Dairy and fats
  ["cream", "Fresh cream", "मलाई / क्रीम", ["malai", "fresh cream", "cream"], JAIN_VEG, { tbsp: 15 }, "tbsp", [250, 2.5, 3.5, 25, 0, 3.5, 15.5, 35, 80, 0.1]],
  ["khoa", "Khoa (mawa)", "खोया", ["khoya", "mawa"], JAIN_VEG, { tbsp: 15 }, "g", [316, 16.3, 16.5, 20.6, 0, 16.1, 12.9, 48, 602, 2.3]], // IFCT 2017: L004
  // Seasonings
  ["salt", "Salt", "नमक", ["namak"], JAIN_VEGAN, { tbsp: 18 }, "g", [0, 0, 0, 0, 0, 0, 0, 38758, 24, 0.3]],
  ["soy-sauce", "Soy sauce", "सोया सॉस", ["soya sauce"], JAIN_VEGAN, { tbsp: 16 }, "tbsp", [53, 8.1, 4.9, 0.6, 0.8, 0.4, 0.1, 5500, 33, 1.5]],
];

/* Ready to eat as they are: fruit, nuts, breads, drinks and packaged foods. */
export const READY_ROWS: Row[] = [
  // Fruit
  ["mango", "Mango", "आम", ["aam"], JAIN_VEGAN, { piece: 200, katori: 165 }, "piece", [52, 0.6, 11.6, 0.5, 1.8, 8.4, 0.2, 1, 15, 0.4]], // IFCT 2017: average of E036, E037, E038, E039, E040, E041, E042
  ["papaya", "Papaya", "पपीता", ["papita"], JAIN_VEGAN, { katori: 145 }, "katori", [30, 0.4, 7.4, 0.2, 2.8, 4.1, 0.1, 7, 15, 0.2]], // IFCT 2017: E049
  ["guava", "Guava", "अमरूद", ["amrood", "amrud"], JAIN_VEGAN, { piece: 100 }, "piece", [55, 1.3, 15.1, 0.3, 8, 6, 0, 2, 16, 0.4]], // IFCT 2017: average of E028, E029
  ["orange", "Orange", "संतरा", ["santra", "narangi"], JAIN_VEGAN, { piece: 130 }, "piece", [40, 0.7, 9.2, 0.1, 1.3, 6.9, 0, 1, 20, 0.8]], // IFCT 2017: E047
  ["watermelon", "Watermelon", "तरबूज़", ["tarbooz", "tarbuj"], JAIN_VEGAN, { katori: 150 }, "katori", [20, 0.6, 4.2, 0.2, 0.7, 3.3, 0.1, 2, 5, 0.2]], // IFCT 2017: average of E065, E066
  ["grapes", "Grapes", "अंगूर", ["angoor", "angur"], JAIN_VEGAN, { katori: 150 }, "katori", [71, 1, 16.3, 0.3, 1.3, 10, 0.1, 2, 14, 0.3]], // IFCT 2017: average of E022, E023, E024, E025, E026, E027
  ["pomegranate", "Pomegranate", "अनार", ["anar", "anaar"], JAIN_VEGAN, { katori: 90, piece: 180 }, "katori", [60, 1.3, 14.4, 0.1, 2.8, 10.9, 0, 2, 11, 0.3]], // IFCT 2017: E055
  ["pineapple", "Pineapple", "अनानास", ["ananas"], JAIN_VEGAN, { katori: 165 }, "katori", [50, 0.5, 12.9, 0.2, 3.5, 8.6, 0.1, 1, 11, 0.3]], // IFCT 2017: E053
  ["chikoo", "Chikoo", "चीकू", ["sapota", "chiku", "sapodilla"], JAIN_VEGAN, { piece: 100 }, "piece", [93, 0.9, 23.5, 1.3, 9.6, 12.3, 0.4, 5, 18, 0.5]], // IFCT 2017: E060
  ["pear", "Pear", "नाशपाती", ["nashpati"], JAIN_VEGAN, { piece: 180 }, "piece", [46, 0.4, 12.6, 0.3, 4.5, 7.4, 0.1, 2, 7, 0.3]], // IFCT 2017: E051
  ["muskmelon", "Muskmelon", "खरबूज़ा", ["kharbooja", "kharbuja", "cantaloupe"], JAIN_VEGAN, { katori: 160 }, "katori", [28, 0.5, 6.3, 0.3, 1.5, 2.7, 0.1, 15, 9, 0.2]], // IFCT 2017: average of E045, E046
  ["litchi", "Litchi", "लीची", ["lychee", "lichi"], JAIN_VEGAN, { piece: 10, katori: 150 }, "piece", [56, 1, 12.8, 0.3, 1.3, 9.3, 0.1, 1, 6, 0.8]], // IFCT 2017: E035
  ["jamun", "Jamun", "जामुन", ["java plum", "black plum"], JAIN_VEGAN, { katori: 100 }, "katori", [60, 0.7, 15.6, 0.2, 0.6, 14, 0, 14, 19, 0.2]],
  ["strawberry", "Strawberries", "स्ट्रॉबेरी", ["strawberry"], JAIN_VEGAN, { katori: 150, piece: 12 }, "katori", [30, 1, 5.9, 0.6, 2.5, 3.6, 0.1, 1, 15, 0.4]], // IFCT 2017: E063
  ["kiwi", "Kiwi", "कीवी", ["kiwifruit"], JAIN_VEGAN, { piece: 70 }, "piece", [61, 1.1, 14.7, 0.5, 3, 9, 0, 3, 34, 0.3]],
  // Raw vegetables people eat as they are
  ["carrot", "Carrot", "गाजर", ["gajar"], VEGAN, { piece: 60, katori: 110 }, "piece", [44, 1, 10.5, 0.5, 4.3, 3.6, 0.1, 57, 38, 0.7]], // IFCT 2017: average of F002, F003
  ["cucumber", "Cucumber", "खीरा", ["kheera", "kakdi"], JAIN_VEGAN, { piece: 200, katori: 120 }, "piece", [23, 0.8, 5.3, 0.2, 2.1, 0.2, 0.1, 6, 18, 0.5]], // IFCT 2017: average of D043, D044
  ["sweet-corn", "Sweet corn", "मक्का", ["corn", "bhutta", "makai", "corn kernels"], JAIN_VEGAN, { katori: 150, piece: 100 }, "katori", [96, 3.4, 21, 1.5, 2.4, 4.5, 0.2, 1, 3, 0.5]],
  ["moong-sprouts", "Moong sprouts", "अंकुरित मूंग", ["sprouts", "ankurit moong", "bean sprouts"], JAIN_VEGAN, { katori: 100 }, "katori", [30, 3, 6, 0.2, 1.8, 4.1, 0, 6, 13, 0.9]],
  // Nuts, seeds, dried fruit
  ["almonds", "Almonds", "बादाम", ["badam"], JAIN_VEGAN, { piece: 1.2, tbsp: 9 }, "g", [635, 18.4, 16.1, 58.5, 13.1, 2.2, 4.4, 2, 228, 4.6]], // IFCT 2017: H001
  ["cashews", "Cashews", "काजू", ["kaju", "cashew"], JAIN_VEGAN, { piece: 1.5, tbsp: 9 }, "g", [590, 18.8, 29.3, 45.2, 3.9, 3.1, 7.8, 9, 34, 6]], // IFCT 2017: H005
  ["walnuts", "Walnuts", "अखरोट", ["akhrot", "walnut"], JAIN_VEGAN, { piece: 4, tbsp: 8 }, "g", [682, 14.9, 15.5, 64.3, 5.4, 3.2, 5.2, 1, 105, 3.2]], // IFCT 2017: H021
  ["pistachios", "Pistachios", "पिस्ता", ["pista"], JAIN_VEGAN, { piece: 0.7, tbsp: 9 }, "g", [561, 23.4, 26.5, 42.5, 10.6, 7.9, 4, 7, 135, 4.5]], // IFCT 2017: H018
  ["peanuts", "Peanuts", "मूंगफली", ["moongphali", "groundnuts", "mungfali"], VEGAN, { katori: 70, tbsp: 9 }, "g", [541, 23.6, 27.6, 39.6, 10.4, 4.4, 8.1, 12, 54, 3.4]], // IFCT 2017: H012
  ["raisins", "Raisins", "किशमिश", ["kishmish", "dry grapes"], JAIN_VEGAN, { tbsp: 10 }, "g", [310, 2.7, 74.3, 0.3, 4.2, 59.3, 0.1, 11, 63, 5.5]], // IFCT 2017: average of E057, E058
  ["dates", "Dates", "खजूर", ["khajoor", "khajur"], JAIN_VEGAN, { piece: 8 }, "piece", [282, 2.5, 75, 0.4, 8, 63.4, 0, 2, 39, 1]],
  ["dried-figs", "Dried figs", "अंजीर", ["anjeer", "anjir", "figs"], JAIN_VEGAN, { piece: 8 }, "piece", [249, 3.3, 63.9, 0.9, 9.8, 47.9, 0.1, 10, 162, 2]],
  ["flaxseed", "Flaxseeds", "अलसी", ["alsi", "flax seeds", "linseed"], JAIN_VEGAN, { tbsp: 10 }, "tbsp", [496, 18.6, 37.2, 35.7, 26.2, 0.6, 3, 33, 257, 5.4]], // IFCT 2017: H014
  ["chia", "Chia seeds", "चिया सीड्स", ["chia"], JAIN_VEGAN, { tbsp: 12 }, "tbsp", [486, 16.5, 42.1, 30.7, 34.4, 0, 3.3, 16, 631, 7.7]],
  ["roasted-chana", "Roasted chana", "भुना चना", ["bhuna chana", "chana roasted", "phutana"], JAIN_VEGAN, { katori: 70, tbsp: 9 }, "g", [369, 22.5, 58.1, 5.2, 16, 6, 0.6, 30, 58, 5]],
  ["murmura", "Murmura (puffed rice)", "मुरमुरा", ["puffed rice", "kurmura", "mamra"], JAIN_VEGAN, { katori: 15 }, "katori", [367, 7.5, 80.2, 1.6, 2.6, 0.6, 0.1, 4, 15, 4.5]], // IFCT 2017: A012
  // Breads and cereals
  ["white-bread", "White bread", "सफ़ेद ब्रेड", ["bread", "double roti", "bread slice"], VEGAN, { piece: 25 }, "piece", [265, 8.9, 49.4, 3.3, 2.7, 5.7, 0.7, 490, 60, 1.6]],
  ["brown-bread", "Brown bread", "ब्राउन ब्रेड", ["whole wheat bread", "atta bread"], VEGAN, { piece: 28 }, "piece", [247, 12.5, 41.3, 3.4, 6.8, 5.6, 0.7, 450, 80, 2.5]],
  ["pav", "Pav", "पाव", ["ladi pav", "bun", "pao"], VEGAN, { piece: 40 }, "piece", [280, 8.5, 50, 4.5, 2.2, 6, 1.2, 450, 60, 1.6]],
  ["oats", "Oats (dry)", "ओट्स", ["oats", "rolled oats"], JAIN_VEGAN, { katori: 80, tbsp: 6 }, "g", [389, 16.9, 66.3, 6.9, 10.6, 1, 1.2, 2, 54, 4.7]],
  ["cornflakes", "Cornflakes", "कॉर्नफ्लेक्स", ["corn flakes"], JAIN_VEGAN, { katori: 30 }, "katori", [375, 7, 84, 0.5, 3, 8, 0.2, 650, 20, 8]],
  ["muesli", "Muesli", "म्यूज़ली", ["museli"], JAIN_VEGAN, { katori: 50 }, "katori", [380, 9, 67, 7, 7, 20, 1.5, 150, 60, 4]],
  // Drinks
  ["black-coffee", "Black coffee", "ब्लैक कॉफ़ी", ["americano"], JAIN_VEGAN, { glass: 200 }, "glass", [2, 0.3, 0, 0, 0, 0, 0, 2, 2, 0]],
  ["green-tea", "Green tea", "ग्रीन टी", ["green tea"], JAIN_VEGAN, { glass: 200 }, "glass", [1, 0.2, 0, 0, 0, 0, 0, 1, 0, 0]],
  ["coconut-water", "Coconut water", "नारियल पानी", ["nariyal pani", "tender coconut"], JAIN_VEGAN, { glass: 250 }, "glass", [15, 0.3, 3.2, 0.2, 0, 3.1, 0.1, 28, 27, 0.1]], // IFCT 2017: K002
  ["sugarcane-juice", "Sugarcane juice", "गन्ने का रस", ["ganne ka ras", "ganna juice"], JAIN_VEGAN, { glass: 250 }, "glass", [59, 0.2, 13.7, 0.4, 0.6, 12.8, 0.1, 1, 18, 1.1]], // IFCT 2017: I002
  ["orange-juice", "Orange juice (fresh)", "संतरे का रस", ["mosambi juice", "fresh juice"], JAIN_VEGAN, { glass: 250 }, "glass", [45, 0.7, 10.4, 0.2, 0.2, 8.4, 0, 1, 11, 0.2]],
  ["cola", "Cola (soft drink)", "कोल्ड ड्रिंक", ["cold drink", "soft drink", "soda"], JAIN_VEGAN, { glass: 300 }, "glass", [42, 0, 10.6, 0, 0, 10.6, 0, 4, 2, 0.1]],
  // Spreads and extras
  ["butter", "Butter", "मक्खन", ["makhan", "salted butter"], JAIN_VEG, { tbsp: 14 }, "tbsp", [717, 0.9, 0.1, 81, 0, 0.1, 51, 600, 24, 0]],
  ["cheese-slice", "Cheese slice", "चीज़", ["cheese", "processed cheese"], JAIN_VEG, { piece: 20 }, "piece", [300, 18, 6, 23, 0, 4, 14, 1200, 600, 0.3]],
  ["jam", "Jam", "जैम", ["fruit jam", "mixed fruit jam"], JAIN_VEGAN, { tbsp: 20 }, "tbsp", [278, 0.4, 69, 0.1, 1, 49, 0, 32, 20, 0.5]],
  ["honey", "Honey", "शहद", ["shahad"], VEG, { tbsp: 21 }, "tbsp", [304, 0.3, 82.4, 0, 0.2, 82.1, 0, 4, 6, 0.4]],
  ["jaggery", "Jaggery", "गुड़", ["gur", "gud"], JAIN_VEGAN, { piece: 10, tbsp: 15 }, "piece", [354, 1.9, 84.9, 0.2, 0, 84.3, 0.1, 25, 107, 4.6]], // IFCT 2017: I001
  ["peanut-butter", "Peanut butter", "पीनट बटर", ["peanutbutter"], VEGAN, { tbsp: 16 }, "tbsp", [588, 25, 20, 50, 6, 9, 10, 430, 49, 1.9]],
  ["ketchup", "Tomato ketchup", "टोमैटो केचप", ["ketchup", "tomato sauce"], VEGAN, { tbsp: 17 }, "tbsp", [101, 1, 27, 0.1, 0.3, 22, 0, 900, 15, 0.4]],
  ["whey-protein", "Whey protein (powder)", "व्हे प्रोटीन", ["whey", "protein powder"], JAIN_VEG, { tbsp: 10, piece: 30 }, "piece", [400, 78, 8, 6, 0, 5, 3.5, 300, 400, 1]],
  // Packaged snacks and sweets
  ["marie-biscuit", "Marie biscuit", "मैरी बिस्किट", ["marie", "biscuit", "tea biscuit"], VEG, { piece: 6 }, "piece", [445, 7.5, 76, 12.5, 2, 22, 6, 400, 30, 2]],
  ["digestive-biscuit", "Digestive biscuit", "डाइजेस्टिव बिस्किट", ["digestive", "wheat biscuit"], VEG, { piece: 15 }, "piece", [480, 7, 65, 21, 3.5, 17, 10, 600, 40, 2.6]],
  ["glucose-biscuit", "Glucose biscuit", "ग्लूकोज़ बिस्किट", ["glucose biscuits"], VEG, { piece: 6 }, "piece", [454, 7.1, 77, 13, 1.5, 25, 6.5, 300, 30, 1.6]],
  ["namkeen", "Namkeen (bhujia)", "नमकीन", ["bhujia", "aloo bhujia", "mixture", "sev", "farsan"], VEGAN, { katori: 50, tbsp: 8 }, "g", [545, 13, 45, 35, 5, 3, 13, 1000, 40, 3]],
  ["potato-chips", "Potato chips", "आलू चिप्स", ["chips", "wafers", "potato wafers"], VEGAN, { katori: 30 }, "g", [536, 7, 53, 34.6, 4.4, 0.3, 11, 700, 24, 1.6]],
  ["dark-chocolate", "Dark chocolate", "डार्क चॉकलेट", ["dark choco"], VEG, { piece: 10 }, "piece", [598, 7.8, 45.9, 42.6, 10.9, 24, 24.5, 20, 73, 11.9]],
  ["milk-chocolate", "Milk chocolate", "मिल्क चॉकलेट", ["chocolate", "choco bar"], JAIN_VEG, { piece: 10 }, "piece", [535, 7.7, 59.4, 29.7, 3.4, 51.5, 18.5, 79, 189, 2.4]],
  ["ice-cream", "Ice cream (vanilla)", "आइसक्रीम", ["ice cream", "icecream"], JAIN_VEG, { katori: 70, piece: 70 }, "katori", [207, 3.5, 23.6, 11, 0.7, 21, 6.8, 80, 128, 0.1]],
  ["pizza", "Cheese pizza", "पिज़्ज़ा", ["pizza", "margherita pizza"], VEG, { piece: 100 }, "piece", [266, 11.4, 33.3, 9.7, 2.3, 3.6, 4.5, 598, 188, 2.5]],
  ["veg-burger", "Veg burger", "वेज बर्गर", ["burger", "aloo tikki burger"], VEG, { piece: 150 }, "piece", [250, 6, 33, 10, 2.5, 5, 2.5, 500, 60, 1.5]],
];
