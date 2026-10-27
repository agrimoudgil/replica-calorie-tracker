import { EGG, JAIN_VEG, JAIN_VEGAN, MEAT, VEG, VEGAN, type Row } from "./rows";

/*
 * More ingredients for the dish recipes in extra-dishes.ts, with per-100 g values taken as
 * they are from USDA FoodData Central (public domain, CC0; the rows in world/usda-foods.json),
 * each marked with its FDC id. A value USDA leaves blank is 0 here. Generated once by a
 * script and then kept by hand like the rest of the catalogue.
 */

/** Ingredients only: searchable and loggable, but never suggested as a meal. */
export const USDA_INGREDIENT_ROWS: Row[] = [
  ["cheddar", "Cheddar cheese", "चेडर चीज़", ["cheddar"], JAIN_VEG, { tbsp: 7, piece: 20 }, "tbsp", [408, 23.3, 2.44, 34, 0, 0.33, 19.2, 654, 707, 0.16]], // USDA FDC: 328637
  ["mozzarella", "Mozzarella cheese", "मोज़रेला चीज़", ["mozzarella"], JAIN_VEG, { tbsp: 7 }, "tbsp", [299, 22.17, 2.4, 22.14, 0, 0, 13.9, 486, 505, 0.44]], // USDA FDC: 170845
  ["cream-cheese", "Cream cheese", "क्रीम चीज़", [], JAIN_VEG, { tbsp: 15 }, "tbsp", [350, 6.15, 5.52, 34.44, 0, 3.76, 20.21, 314, 97, 0.11]], // USDA FDC: 173418
  ["parmesan", "Parmesan cheese", "पार्मेज़न चीज़", ["parmesan"], JAIN_VEG, { tbsp: 5 }, "tbsp", [421, 29.6, 12.4, 28, 0, 0.07, 15.5, 1750, 884, 0.45]], // USDA FDC: 325036
  ["milk-powder", "Milk powder", "मिल्क पाउडर", ["dry milk","doodh powder"], JAIN_VEG, { tbsp: 8 }, "tbsp", [496, 26.32, 38.42, 26.71, 0, 38.42, 16.74, 371, 912, 0.47]], // USDA FDC: 170876
  ["condensed-milk", "Condensed milk", "कंडेंस्ड मिल्क", ["sweetened condensed milk","milkmaid"], JAIN_VEG, { tbsp: 20 }, "tbsp", [321, 7.91, 54.4, 8.7, 0, 54.4, 5.49, 127, 284, 0.19]], // USDA FDC: 171275
  ["whipping-cream", "Whipping cream", "व्हिपिंग क्रीम", ["heavy cream","whipped cream"], JAIN_VEG, { tbsp: 15 }, "tbsp", [340, 2.84, 2.84, 36.08, 0, 2.92, 23.03, 27, 66, 0.1]], // USDA FDC: 170859
  ["sour-cream", "Sour cream", "सावर क्रीम", [], JAIN_VEG, { tbsp: 15 }, "tbsp", [198, 2.44, 4.63, 19.35, 0, 3.41, 10.14, 31, 101, 0.07]], // USDA FDC: 171257
  ["whey", "Whey (liquid)", "पनीर का पानी", ["paneer whey","whey water"], JAIN_VEG, { glass: 250 }, "glass", [27, 0.85, 5.14, 0.36, 0, 5.14, 0.23, 54, 47, 0.06]], // USDA FDC: 171282
  ["pasta", "Pasta (dry)", "पास्ता (सूखा)", ["dry pasta","raw pasta"], JAIN_VEGAN, { katori: 100 }, "g", [371, 13.04, 74.67, 1.51, 3.2, 2.67, 0.28, 6, 21, 3.3]], // USDA FDC: 169736
  ["egg-noodles", "Egg noodles (dry)", "एग नूडल्स (सूखे)", ["dry egg noodles"], EGG, { katori: 80 }, "g", [384, 14.16, 71.27, 4.44, 3.3, 1.88, 1.18, 21, 35, 4.01]], // USDA FDC: 169731
  ["bread-crumbs", "Bread crumbs", "ब्रेड क्रम्ब्स", ["breadcrumbs"], VEGAN, { tbsp: 7 }, "tbsp", [395, 13.35, 71.98, 5.3, 4.5, 6.2, 1.2, 732, 183, 4.83]], // USDA FDC: 174928
  ["rice-flour", "Rice flour", "चावल का आटा", ["chawal ka atta"], JAIN_VEGAN, { katori: 120, tbsp: 8 }, "katori", [366, 5.95, 80.13, 1.42, 2.4, 0.12, 0.39, 0, 10, 0.35]], // USDA FDC: 169714
  ["cornstarch", "Cornstarch (cornflour)", "कॉर्नस्टार्च", ["corn starch","custard powder","arrowroot"], JAIN_VEGAN, { tbsp: 8 }, "tbsp", [381, 0.26, 91.27, 0.05, 0.9, 0, 0.01, 9, 2, 0.47]], // USDA FDC: 169698
  ["puffed-wheat", "Puffed wheat", "गेहूं के मुरमुरे", ["wheat puffs"], JAIN_VEGAN, { katori: 15 }, "katori", [366, 16.26, 76.39, 2.15, 9.4, 1.37, 0.41, 5, 24, 4.41]], // USDA FDC: 171669
  ["wheat-flakes", "Wheat flakes (cereal)", "व्हीट फ्लेक्स", ["wheat flakes","bran flakes"], VEGAN, { katori: 30 }, "katori", [328, 9.9, 80.5, 2.1, 18.3, 18.6, 0.4, 540, 44, 28]], // USDA FDC: 173888
  ["buckwheat-flour", "Buckwheat flour (kuttu)", "कुट्टू का आटा", ["kuttu atta","kuttu flour"], JAIN_VEGAN, { katori: 120, tbsp: 8 }, "katori", [335, 12.62, 70.59, 3.1, 10, 2.6, 0.68, 11, 41, 4.06]], // USDA FDC: 170687
  ["amaranth", "Amaranth (rajgira)", "राजगिरा", ["rajgira","ramdana"], JAIN_VEGAN, { katori: 180, tbsp: 12 }, "katori", [371, 13.56, 65.25, 7.02, 6.7, 1.69, 1.46, 4, 159, 7.61]], // USDA FDC: 170682
  ["couscous", "Couscous (dry)", "कूसकूस", [], JAIN_VEGAN, { katori: 170 }, "katori", [376, 12.76, 77.43, 0.64, 5, 0, 0.12, 10, 24, 1.08]], // USDA FDC: 169699
  ["millet", "Millet (raw)", "कंगनी", ["kangni","proso millet","foxtail millet"], JAIN_VEGAN, { katori: 180 }, "katori", [378, 11.02, 72.85, 4.22, 8.5, 0, 0.72, 5, 8, 3.01]], // USDA FDC: 169702
  ["black-rice", "Black rice (raw)", "काला चावल", ["chak-hao","forbidden rice"], JAIN_VEGAN, { katori: 150 }, "katori", [369.97, 7.57, 77.19, 3.44, 4.18, 0, 0, 0, 14.4, 1.12]], // USDA FDC: 2710825
  ["cocoa", "Cocoa powder", "कोको पाउडर", ["cocoa"], JAIN_VEGAN, { tbsp: 6 }, "tbsp", [228, 19.6, 57.9, 13.7, 37, 1.75, 8.07, 21, 128, 13.86]], // USDA FDC: 169593
  ["gelatin", "Gelatin", "जिलेटिन", [], MEAT, { tbsp: 7 }, "tbsp", [335, 85.6, 0, 0.1, 0, 0, 0.07, 196, 55, 1.11]], // USDA FDC: 169599
  ["corn-syrup", "Liquid glucose (corn syrup)", "लिक्विड ग्लूकोज़", ["liquid glucose","corn syrup"], JAIN_VEGAN, { tbsp: 20 }, "tbsp", [283, 0, 76.79, 0.2, 0, 76.77, 0, 62, 13, 0]], // USDA FDC: 168837
  ["candied-fruit", "Tutti frutti (candied fruit)", "टूटी फ्रूटी", ["tutti frutti","candied peel","glace cherries"], JAIN_VEGAN, { tbsp: 12 }, "tbsp", [322, 0.34, 82.74, 0.07, 1.6, 80.68, 0.01, 98, 18, 0.17]], // USDA FDC: 167781
  ["raw-moth", "Moth beans (raw)", "मोठ", ["moth","matki"], JAIN_VEGAN, { katori: 130 }, "katori", [343, 22.94, 61.52, 1.61, 0, 0, 0.36, 30, 150, 10.85]], // USDA FDC: 172425
  ["raw-black-beans", "Black beans (raw)", "ब्लैक बीन्स", [], JAIN_VEGAN, { katori: 130 }, "katori", [341, 21.6, 62.36, 1.42, 15.5, 2.12, 0.37, 5, 123, 5.02]], // USDA FDC: 173734
  ["raw-soybean", "Soybeans (raw)", "सोयाबीन", ["soyabean","soybean"], JAIN_VEGAN, { katori: 130 }, "katori", [446, 36.49, 30.16, 19.94, 9.3, 7.33, 2.88, 2, 277, 15.7]], // USDA FDC: 174270
  ["lotus-stem", "Lotus stem (raw)", "कमल ककड़ी", ["kamal kakdi","bhein","lotus root","nadru"], VEGAN, { katori: 100 }, "katori", [74, 2.6, 17.23, 0.1, 4.9, 0, 0.03, 40, 45, 1.16]], // USDA FDC: 169250
  ["raw-banana", "Raw banana (plantain)", "कच्चा केला", ["kacha kela","plantain","vazhakkai"], JAIN_VEGAN, { piece: 150 }, "piece", [152, 1.25, 36.66, 0.07, 2.2, 2.29, 0.12, 2, 2, 0.75]], // USDA FDC: 168215
  ["yam", "Yam (suran, raw)", "सूरन", ["suran","zimikand","jimikand","elephant foot yam"], VEGAN, { katori: 120 }, "katori", [118, 1.53, 27.88, 0.17, 4.1, 0.5, 0.04, 9, 17, 0.54]], // USDA FDC: 170071
  ["jackfruit", "Jackfruit (raw)", "कटहल", ["kathal","katahal","chakka"], JAIN_VEGAN, { katori: 120 }, "katori", [95, 1.72, 23.25, 0.64, 1.5, 19.08, 0.2, 2, 24, 0.23]], // USDA FDC: 174687
  ["bathua", "Bathua leaves (raw)", "बथुआ", ["bathua","lambsquarters","chakvat"], JAIN_VEGAN, { katori: 40 }, "katori", [43, 4.2, 7.3, 0.8, 4, 0, 0.06, 43, 309, 1.2]], // USDA FDC: 169244
  ["turnip", "Turnip (raw)", "शलगम", ["shalgam","turnip"], VEGAN, { piece: 120 }, "piece", [33.98, 0.95, 7.27, 0.12, 1.92, 5.09, 0, 12.8, 32.7, 0]], // USDA FDC: 2747674
  ["broccoli", "Broccoli (raw)", "ब्रोकली", ["broccoli"], JAIN_VEGAN, { katori: 90 }, "katori", [32, 2.57, 6.29, 0.34, 2.4, 1.4, 0.04, 36, 46, 0.69]], // USDA FDC: 321900
  ["celery", "Celery (raw)", "सेलेरी", [], JAIN_VEGAN, { piece: 40 }, "piece", [16.7, 0.49, 3.32, 0.16, 0, 0, 0, 97.21, 46.28, 0]], // USDA FDC: 2346405
  ["spring-onion", "Spring onion (raw)", "हरा प्याज़", ["hara pyaz","scallions","green onion"], VEGAN, { tbsp: 6 }, "tbsp", [32, 1.83, 7.34, 0.19, 2.6, 2.33, 0.03, 16, 72, 1.48]], // USDA FDC: 170005
  ["lettuce", "Lettuce (raw)", "लेट्यूस", ["salad leaves"], JAIN_VEGAN, { katori: 40 }, "katori", [15, 1.36, 2.87, 0.15, 1.3, 0.78, 0.02, 28, 36, 0.86]], // USDA FDC: 169249
  ["parsley", "Parsley", "पार्सले", [], JAIN_VEGAN, { tbsp: 4 }, "tbsp", [36, 2.97, 6.33, 0.79, 3.3, 0.85, 0.13, 56, 138, 6.2]], // USDA FDC: 170416
  ["mint", "Mint leaves", "पुदीना", ["pudina","pudina leaves"], JAIN_VEGAN, { tbsp: 3 }, "tbsp", [44, 3.29, 8.41, 0.73, 6.8, 0, 0.19, 30, 199, 11.87]], // USDA FDC: 173475
  ["bamboo-shoot", "Bamboo shoot (raw)", "बांस का अंकुर", ["bamboo shoots"], VEGAN, { katori: 100 }, "katori", [27, 2.6, 5.2, 0.3, 2.2, 3, 0.07, 4, 13, 0.5]], // USDA FDC: 169210
  ["kale", "Kale (raw)", "केल", [], JAIN_VEGAN, { katori: 40 }, "katori", [35, 2.92, 4.42, 1.49, 4.1, 0.8, 0, 53, 254, 1.6]], // USDA FDC: 323505
  ["watercress", "Watercress (raw)", "वॉटरक्रेस", [], JAIN_VEGAN, { katori: 35 }, "katori", [11, 2.3, 1.29, 0.1, 0.5, 0.2, 0.03, 41, 120, 0.2]], // USDA FDC: 170068
  ["drumstick", "Drumstick (raw)", "सहजन", ["sahjan","moringa pods","murungakkai"], JAIN_VEGAN, { piece: 40 }, "piece", [37, 2.1, 8.53, 0.2, 3.2, 0, 0.03, 42, 30, 0.36]], // USDA FDC: 170483
  ["olives", "Olives (canned)", "ऑलिव", ["olive"], JAIN_VEGAN, { piece: 4 }, "piece", [116, 0.84, 6.04, 10.9, 1.6, 0, 2.28, 735, 88, 6.28]], // USDA FDC: 169094
  ["zucchini", "Zucchini (raw)", "ज़ुकीनी", [], JAIN_VEGAN, { katori: 120 }, "katori", [17, 1.21, 3.11, 0.32, 1, 2.5, 0.08, 8, 16, 0.37]], // USDA FDC: 169291
  ["orange-peel", "Orange peel", "संतरे का छिलका", ["orange zest"], JAIN_VEGAN, { tbsp: 6 }, "tbsp", [97, 1.5, 25, 0.2, 10.6, 0, 0.02, 3, 161, 0.8]], // USDA FDC: 169103
  ["lemon-peel", "Lemon peel", "नींबू का छिलका", ["lemon zest"], JAIN_VEGAN, { tbsp: 6 }, "tbsp", [47, 1.5, 16, 0.3, 10.6, 4.17, 0.04, 6, 134, 0.8]], // USDA FDC: 167749
  ["desiccated-coconut", "Desiccated coconut", "सूखा कसा नारियल", ["dry coconut","copra","khopra"], JAIN_VEGAN, { tbsp: 5, katori: 80 }, "tbsp", [660, 6.88, 23.65, 64.53, 16.3, 7.35, 57.22, 37, 26, 3.32]], // USDA FDC: 170170
  ["bacon", "Bacon (raw)", "बेकन", [], MEAT, { piece: 12 }, "piece", [393, 13.66, 0, 37.13, 0, 0.35, 12.62, 751, 6, 0.38]], // USDA FDC: 168277
  ["ham", "Ham slices", "हैम", ["ham"], MEAT, { piece: 15 }, "piece", [164, 16.6, 3.63, 8.8, 1.3, 1, 0.5, 814, 24, 1.02]], // USDA FDC: 173864
  ["salami", "Salami (poultry)", "सलामी", ["salami","chicken salami"], MEAT, { piece: 10 }, "piece", [172, 19.2, 1.55, 9.21, 0.1, 1.12, 2.78, 1107, 40, 1.25]], // USDA FDC: 172937 (turkey salami, the nearest to the chicken salami sold in India)
  ["minced-chicken", "Chicken mince (raw)", "चिकन कीमा", ["chicken keema raw","ground chicken"], MEAT, { katori: 150 }, "katori", [143, 17.44, 0.04, 8.1, 0, 0, 2.3, 60, 6, 0.82]], // USDA FDC: 171116
  ["cumin-seeds", "Cumin seeds", "जीरा", ["jeera","zeera"], JAIN_VEGAN, { tbsp: 6 }, "tbsp", [375, 17.81, 44.24, 22.27, 10.5, 2.25, 1.54, 168, 931, 66.36]], // USDA FDC: 170923
  ["coriander-seeds", "Coriander seeds", "साबुत धनिया", ["dhania seeds","sabut dhania"], JAIN_VEGAN, { tbsp: 5 }, "tbsp", [298, 12.37, 54.99, 17.77, 41.9, 0, 0.99, 35, 709, 16.32]], // USDA FDC: 170922
  ["black-pepper", "Black pepper", "काली मिर्च", ["kali mirch"], JAIN_VEGAN, { tbsp: 7 }, "tbsp", [251, 10.39, 63.95, 3.26, 25.3, 0.64, 1.39, 20, 443, 9.71]], // USDA FDC: 170931
  ["fennel-seeds", "Fennel seeds", "सौंफ", ["saunf","sonf"], JAIN_VEGAN, { tbsp: 6 }, "tbsp", [345, 15.8, 52.29, 14.87, 39.8, 0, 0.48, 88, 1196, 18.54]], // USDA FDC: 171323
  ["mustard-seeds", "Mustard seeds", "राई", ["rai","sarson seeds"], JAIN_VEGAN, { tbsp: 9 }, "tbsp", [508, 26.08, 28.09, 36.24, 12.2, 6.79, 1.99, 13, 266, 9.21]], // USDA FDC: 170929
  ["fenugreek-seeds", "Fenugreek seeds", "मेथी दाना", ["methi dana","methi seeds"], JAIN_VEGAN, { tbsp: 11 }, "tbsp", [323, 23, 58.35, 6.41, 24.6, 0, 1.46, 67, 176, 33.53]], // USDA FDC: 171324
  ["cloves", "Cloves", "लौंग", ["laung","lavang"], JAIN_VEGAN, { tbsp: 6 }, "tbsp", [274, 5.97, 65.53, 13, 33.9, 2.38, 3.95, 277, 632, 11.83]], // USDA FDC: 171321
  ["cinnamon", "Cinnamon", "दालचीनी", ["dalchini"], JAIN_VEGAN, { tbsp: 8 }, "tbsp", [247, 3.99, 80.59, 1.24, 53.1, 2.17, 0.35, 10, 1002, 8.32]], // USDA FDC: 171320
  ["cardamom", "Cardamom", "इलायची", ["elaichi"], JAIN_VEGAN, { tbsp: 6 }, "tbsp", [311, 10.76, 68.47, 6.7, 28, 0, 0.68, 18, 383, 13.97]], // USDA FDC: 170919
  ["red-chilli-powder", "Red chilli powder", "लाल मिर्च पाउडर", ["lal mirch","chilli powder"], JAIN_VEGAN, { tbsp: 8 }, "tbsp", [282, 13.46, 49.7, 14.28, 34.8, 7.19, 2.46, 2867, 330, 17.3]], // USDA FDC: 171319
  ["turmeric", "Turmeric powder", "हल्दी", ["haldi"], VEGAN, { tbsp: 9 }, "tbsp", [312, 9.68, 67.14, 3.25, 22.7, 3.21, 1.84, 27, 168, 55]], // USDA FDC: 172231
  ["dry-ginger", "Dry ginger powder", "सोंठ", ["ginger powder"], VEGAN, { tbsp: 5 }, "tbsp", [335, 8.98, 71.62, 4.24, 14.1, 3.39, 2.6, 27, 114, 19.8]], // USDA FDC: 170926
  ["nutmeg", "Nutmeg", "जायफल", ["jaiphal"], JAIN_VEGAN, { tbsp: 7 }, "tbsp", [525, 5.84, 49.29, 36.31, 20.8, 2.99, 25.94, 16, 184, 3.04]], // USDA FDC: 171326
  ["vinegar", "Vinegar", "सिरका", ["sirka"], JAIN_VEGAN, { tbsp: 15 }, "tbsp", [18, 0, 0.04, 0, 0, 0.04, 0, 2, 6, 0.03]], // USDA FDC: 172237
  ["prepared-mustard", "Prepared mustard", "मस्टर्ड सॉस", ["mustard paste"], JAIN_VEGAN, { tbsp: 15 }, "tbsp", [61, 4.25, 5.3, 3.38, 4.3, 1.42, 0.25, 1100, 63, 1.59]], // USDA FDC: 326698
  ["canned-tomato-puree", "Tomato puree (canned)", "टमाटर प्यूरी (डिब्बाबंद)", ["canned tomato puree"], VEGAN, { tbsp: 16 }, "tbsp", [38, 1.65, 8.98, 0.21, 1.9, 4.83, 0.03, 28, 18, 1.78]], // USDA FDC: 170460
  ["instant-coffee", "Instant coffee powder", "इंस्टेंट कॉफ़ी पाउडर", ["coffee powder","nescafe"], JAIN_VEGAN, { tbsp: 2 }, "tbsp", [353, 12.2, 75.4, 0.5, 0, 0, 0.2, 37, 141, 4.41]], // USDA FDC: 171893
];

/** Fruit, nuts and seeds eaten as they are. */
export const USDA_READY_ROWS: Row[] = [
  ["plum", "Plum", "आलूबुखारा", ["aloo bukhara"], JAIN_VEGAN, { piece: 65 }, "piece", [46, 0.7, 11.42, 0.28, 1.4, 9.92, 0.02, 0, 6, 0.17]], // USDA FDC: 169949
  ["peach", "Peach", "आड़ू", ["aadoo","aadu"], JAIN_VEGAN, { piece: 150 }, "piece", [42, 0.91, 10.1, 0.27, 1.5, 8.39, 0, 13, 4, 0.34]], // USDA FDC: 325430
  ["apricot", "Apricot", "खुबानी", ["khubani"], JAIN_VEGAN, { piece: 35 }, "piece", [48, 1.4, 11.12, 0.39, 2, 9.24, 0.03, 1, 13, 0.39]], // USDA FDC: 171697
  ["dried-apricots", "Dried apricots", "सूखी खुबानी", ["khumani","dried khubani"], JAIN_VEGAN, { piece: 7 }, "piece", [241, 3.39, 62.64, 0.51, 7.3, 53.44, 0.02, 10, 55, 2.66]], // USDA FDC: 173941
  ["cherries", "Cherries", "चेरी", ["cherry"], JAIN_VEGAN, { katori: 140, piece: 8 }, "katori", [63, 1.06, 16.01, 0.2, 2.1, 12.82, 0.04, 0, 13, 0.36]], // USDA FDC: 171719
  ["dried-cranberries", "Dried cranberries", "सूखी क्रैनबेरी", ["cranberries"], JAIN_VEGAN, { tbsp: 10 }, "tbsp", [308, 0.17, 82.8, 1.09, 5.3, 72.56, 0.09, 5, 9, 0.39]], // USDA FDC: 171723
  ["blueberries", "Blueberries", "ब्लूबेरी", ["blueberry"], JAIN_VEGAN, { katori: 150 }, "katori", [63.86, 0.7, 14.57, 0.31, 0, 9.36, 0, 0, 11.69, 0.34]], // USDA FDC: 2263889
  ["raspberries", "Raspberries", "रास्पबेरी", ["raspberry"], JAIN_VEGAN, { katori: 125 }, "katori", [57.34, 1.01, 12.9, 0.19, 0, 2.68, 0, 0, 16.41, 0.45]], // USDA FDC: 2263888
  ["starfruit", "Starfruit", "कमरख", ["kamrakh","carambola"], JAIN_VEGAN, { piece: 90 }, "piece", [31, 1.04, 6.73, 0.33, 2.8, 3.98, 0.02, 2, 3, 0.08]], // USDA FDC: 171715
  ["amla", "Amla", "आंवला", ["indian gooseberry","aonla"], JAIN_VEGAN, { piece: 30 }, "piece", [44, 0.88, 10.18, 0.58, 4.3, 0, 0.04, 1, 25, 0.31]], // USDA FDC: 173030 (USDA has no amla; gooseberries are the nearest (amla has far more vitamin C))
  ["hazelnuts", "Hazelnuts", "हेज़लनट", [], JAIN_VEGAN, { piece: 1.4, tbsp: 8 }, "tbsp", [628, 14.95, 16.7, 60.75, 9.7, 4.34, 4.46, 0, 114, 4.7]], // USDA FDC: 170581
  ["sunflower-seeds", "Sunflower seeds", "सूरजमुखी के बीज", [], JAIN_VEGAN, { tbsp: 9 }, "tbsp", [584, 20.78, 20, 51.46, 8.6, 2.62, 4.46, 9, 78, 5.25]], // USDA FDC: 170562
];

// Keep the diet constants in use even if a list stops using one.
void [EGG, JAIN_VEG, JAIN_VEGAN, MEAT, VEG, VEGAN];
