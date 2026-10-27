import type { DishRow } from "../rows";

/*
 * Desserts, per katori (about 100 g; ice cream about 70 g) or piece. Cold soufflés are set
 * with gelatin and cream; hot soufflés are baked on a white sauce base.
 */
export const DESSERT_ROWS: DishRow[] = [
  // Custards and puddings
  ["caramel-custard", "Caramel custard", "कैरेमल कस्टर्ड", ["caramel pudding", "caramel custard steamed"], { katori: 100 }, "katori", [["milk", 200], ["raw-egg", 100], ["sugar", 45]], 320],
  ["baked-caramel-custard", "Baked caramel custard", "बेक्ड कैरेमल कस्टर्ड", ["caramel custard baked"], { katori: 100 }, "katori", [["milk", 200], ["raw-egg", 100], ["sugar", 45]], 310],
  ["baked-custard", "Baked custard", "बेक्ड कस्टर्ड", ["egg custard"], { katori: 100 }, "katori", [["milk", 200], ["raw-egg", 100], ["sugar", 35], ["nutmeg", 0.3]], 300],
  ["mango-custard", "Mango vanilla custard", "मैंगो कस्टर्ड", ["mango custard"], { katori: 150 }, "katori", [["soft-custard", 120], ["mango", 60]], 180],
  ["chocolate-pudding", "Chocolate pudding", "चॉकलेट पुडिंग", ["choco pudding"], { katori: 120 }, "katori", [["milk", 200], ["cocoa", 10], ["sugar", 30], ["cornstarch", 12], ["butter", 5]], 235],
  ["bread-butter-pudding", "Bread and butter pudding", "ब्रेड बटर पुडिंग", ["bread pudding"], { katori: 130 }, "katori", [["white-bread", 50], ["butter", 10], ["milk", 150], ["raw-egg", 50], ["sugar", 25], ["raisins", 10]], 270],
  ["queen-of-puddings", "Queen of puddings", "क्वीन ऑफ़ पुडिंग्स", ["queen of pudding"], { katori: 130 }, "katori", [["bread-crumbs", 25], ["milk", 150], ["raw-egg", 50], ["sugar", 30], ["jam", 15], ["butter", 5]], 260],
  ["cheese-pudding", "Cheese pudding", "चीज़ पुडिंग", ["savoury cheese pudding"], { katori: 130 }, "katori", [["white-bread", 40], ["milk", 120], ["raw-egg", 50], ["cheddar", 30], ["butter", 5]], 230],
  ["snow-flakes-pudding", "Snow flakes pudding", "स्नो फ़्लेक्स पुडिंग", ["coconut snow pudding"], { katori: 120 }, "katori", [["milk", 150], ["cornstarch", 10], ["sugar", 20], ["raw-egg", 30], ["desiccated-coconut", 10]], 210],
  ["meringue-rice-pudding", "Meringue and rice pudding", "मेरिंग राइस पुडिंग", ["rice pudding with meringue"], { katori: 130 }, "katori", [["raw-rice", 20], ["milk", 200], ["raw-egg", 30], ["sugar", 25]], 230],
  ["steamed-orange-pudding", "Steamed orange pudding", "स्टीम्ड ऑरेंज पुडिंग", ["orange sponge pudding"], { katori: 100 }, "katori", [["maida", 40], ["butter", 25], ["sugar", 30], ["raw-egg", 30], ["orange-juice", 30], ["orange-peel", 3]], 145],
  ["trifle", "Trifle pudding", "ट्राइफ़ल पुडिंग", ["trifle", "triffle pudding", "fruit trifle"], { katori: 150 }, "katori", [["sponge-cake", 50], ["jam", 15], ["soft-custard", 100], ["banana", 30], ["whipping-cream", 20]], 215],
  ["charlotte-russe", "Charlotte russe", "शार्लट रूस", ["charlotte rousse"], { katori: 120 }, "katori", [["sponge-cake", 40], ["soft-custard", 80], ["whipping-cream", 40], ["sugar", 10], ["gelatin", 3]], 170],
  ["stewed-apple-custard", "Stewed apple with custard", "कस्टर्ड के साथ सेब", ["apple custard"], { katori: 150 }, "katori", [["apple", 100], ["sugar", 15], ["soft-custard", 100]], 210],
  ["apple-crumb-pudding", "Apple crumb pudding", "एप्पल क्रम्बल", ["apple crumble"], { katori: 120 }, "katori", [["apple", 120], ["sugar", 20], ["maida", 30], ["butter", 20], ["oats", 10]], 190],
  ["pineapple-upside-down", "Pineapple upside down pudding", "पाइनएप्पल अपसाइड डाउन केक", ["pineapple upside down cake"], { piece: 60 }, "piece", [["maida", 50], ["butter", 35], ["sugar", 45], ["raw-egg", 50], ["pineapple", 60], ["milk", 15]], 230],
  ["steamed-chocolate-cake", "Steamed cake with chocolate sauce", "चॉकलेट सॉस वाला स्टीम्ड केक", ["steamed chocolate pudding"], { piece: 70 }, "piece", [["maida", 50], ["butter", 30], ["sugar", 40], ["raw-egg", 50], ["cocoa", 6], ["chocolate-sauce", 30]], 210],
  ["date-nut-pie", "Date and nut pie", "खजूर मेवा पाई", ["date nut pie"], { piece: 70 }, "piece", [["short-crust-pastry", 60], ["dates", 50], ["walnuts", 15], ["sugar", 10], ["butter", 5]], 140],
  ["apple-snowballs", "Apple snowballs", "एप्पल स्नोबॉल्स", ["baked apple snowballs"], { piece: 85 }, "piece", [["apple", 120], ["sugar", 20], ["raw-egg", 30], ["desiccated-coconut", 8]], 170],
  ["kiwi-granola-pudding", "Kiwi granola pudding", "कीवी ग्रेनोला पुडिंग", ["kiwi yogurt parfait"], { katori: 150 }, "katori", [["kiwi", 70], ["curd", 100], ["oats", 15], ["honey", 10], ["almonds", 5]], 200],

  // Fruit desserts
  ["stewed-apple", "Stewed apple", "उबले सेब", ["stewed apples", "apple compote"], { katori: 120 }, "katori", [["apple", 150], ["sugar", 15]], 155],
  ["stewed-pears", "Stewed pears", "उबली नाशपाती", ["stewed fruit", "stewed fruit with pear", "pear compote"], { katori: 120 }, "katori", [["pear", 150], ["sugar", 20]], 160],
  ["apricot-fool", "Apricot fool", "खुबानी फ़ूल", ["khubani fool"], { katori: 100 }, "katori", [["dried-apricots", 40], ["sugar", 15], ["whipping-cream", 50], ["soft-custard", 50]], 160],
  ["orange-pineapple-cream", "Orange and pineapple cream", "ऑरेंज पाइनएप्पल क्रीम", ["orange pineapple cream"], { katori: 100 }, "katori", [["orange-juice", 60], ["pineapple", 50], ["whipping-cream", 50], ["sugar", 20], ["gelatin", 3]], 180],
  ["grape-orange-whip", "Grape and orange whip", "अंगूर संतरा व्हिप", ["grape orange whip"], { katori: 120 }, "katori", [["grapes", 60], ["orange-juice", 60], ["whipping-cream", 20], ["sugar", 15], ["gelatin", 3]], 160],
  ["honey-banana-cream", "Honey banana cream", "हनी बनाना क्रीम", ["banana cream"], { katori: 120 }, "katori", [["banana", 80], ["whipping-cream", 30], ["curd", 30], ["honey", 15]], 155],
  ["raspberry-bavarois", "Raspberry bavarian cream", "रास्पबेरी बवेरियन क्रीम", ["raspberry bavarois"], { katori: 100 }, "katori", [["raspberries", 60], ["milk", 80], ["whipping-cream", 50], ["raw-egg", 20], ["sugar", 30], ["gelatin", 4]], 240],
  ["fruit-delight", "Fruit delight", "फ्रूट डिलाइट", ["fruit and custard delight"], { katori: 150 }, "katori", [["mango", 40], ["banana", 40], ["apple", 30], ["soft-custard", 80], ["whipping-cream", 15]], 200],
  ["pavlova", "Pavlova", "पावलोवा", ["meringue pavlova"], { piece: 60 }, "piece", [["raw-egg", 60], ["sugar", 60], ["cornstarch", 3], ["whipping-cream", 60], ["strawberry", 50], ["kiwi", 30]], 230],

  // Mousses
  ["apple-mousse", "Apple mousse", "एप्पल मूस", ["apple foam"], { katori: 100 }, "katori", [["apple", 100], ["sugar", 25], ["whipping-cream", 40], ["raw-egg", 30], ["gelatin", 3]], 190],
  ["rich-chocolate-mousse", "Rich chocolate mousse", "रिच चॉकलेट मूस", ["chocolate mousse"], { katori: 80 }, "katori", [["dark-chocolate", 50], ["whipping-cream", 60], ["raw-egg", 50], ["sugar", 15]], 170],
  ["creamy-chocolate-mousse", "Creamy chocolate mousse", "क्रीमी चॉकलेट मूस", ["eggless chocolate mousse"], { katori: 80 }, "katori", [["dark-chocolate", 40], ["whipping-cream", 80], ["milk", 20], ["sugar", 10]], 150],
  ["mango-mousse", "Mango mousse", "मैंगो मूस", ["aam mousse"], { katori: 100 }, "katori", [["mango", 100], ["whipping-cream", 50], ["sugar", 20], ["gelatin", 3]], 170],

  // Cold soufflés
  ["lemon-souffle", "Lemon souffle", "लेमन सूफ़ले", ["lemon souffle dessert"], { katori: 100 }, "katori", [["raw-egg", 60], ["sugar", 40], ["gelatin", 5], ["whipping-cream", 60], ["lemon-juice", 30], ["lemon-peel", 3]], 195],
  ["orange-souffle", "Orange souffle", "ऑरेंज सूफ़ले", ["orange souffle dessert"], { katori: 100 }, "katori", [["raw-egg", 60], ["sugar", 40], ["gelatin", 5], ["whipping-cream", 60], ["orange-juice", 60]], 225],
  ["vanilla-souffle", "Vanilla souffle", "वनीला सूफ़ले", ["vanilla souffle dessert"], { katori: 100 }, "katori", [["raw-egg", 60], ["sugar", 40], ["gelatin", 5], ["whipping-cream", 60], ["milk", 60]], 225],
  ["chocolate-souffle", "Chocolate souffle", "चॉकलेट सूफ़ले", ["chocolate souffle dessert"], { katori: 100 }, "katori", [["raw-egg", 60], ["sugar", 40], ["gelatin", 5], ["whipping-cream", 60], ["dark-chocolate", 30], ["milk", 30]], 225],
  ["pineapple-souffle", "Pineapple souffle", "पाइनएप्पल सूफ़ले", ["pineapple souffle dessert"], { katori: 100 }, "katori", [["raw-egg", 60], ["sugar", 40], ["gelatin", 5], ["whipping-cream", 60], ["pineapple", 70]], 235],
  ["cold-lemon-souffle", "Cold lemon souffle", "ठंडा लेमन सूफ़ले", ["chilled lemon souffle"], { katori: 100 }, "katori", [["raw-egg", 60], ["sugar", 35], ["gelatin", 5], ["whipping-cream", 40], ["milk", 40], ["lemon-juice", 30]], 210],
  ["cold-orange-souffle", "Cold orange souffle", "ठंडा ऑरेंज सूफ़ले", ["chilled orange souffle"], { katori: 100 }, "katori", [["raw-egg", 60], ["sugar", 35], ["gelatin", 5], ["whipping-cream", 40], ["milk", 30], ["orange-juice", 60]], 230],
  ["cold-pineapple-souffle", "Cold pineapple souffle", "ठंडा पाइनएप्पल सूफ़ले", ["chilled pineapple souffle"], { katori: 100 }, "katori", [["raw-egg", 60], ["sugar", 35], ["gelatin", 5], ["whipping-cream", 40], ["milk", 30], ["pineapple", 70]], 240],
  ["cold-vanilla-souffle", "Cold vanilla souffle", "ठंडा वनीला सूफ़ले", ["chilled vanilla souffle"], { katori: 100 }, "katori", [["raw-egg", 60], ["sugar", 35], ["gelatin", 5], ["whipping-cream", 40], ["milk", 80]], 220],
  ["cold-chocolate-souffle", "Cold chocolate souffle", "ठंडा चॉकलेट सूफ़ले", ["chilled chocolate souffle"], { katori: 100 }, "katori", [["raw-egg", 60], ["sugar", 35], ["gelatin", 5], ["whipping-cream", 40], ["milk", 50], ["dark-chocolate", 30]], 220],

  // Hot soufflés (sweet and savoury)
  ["hot-lemon-souffle", "Hot lemon souffle", "हॉट लेमन सूफ़ले", ["baked lemon souffle"], { katori: 100 }, "katori", [["white-sauce", 60], ["raw-egg", 100], ["sugar", 30], ["lemon-juice", 15]], 190],
  ["hot-orange-souffle", "Hot orange souffle", "हॉट ऑरेंज सूफ़ले", ["baked orange souffle"], { katori: 100 }, "katori", [["white-sauce", 60], ["raw-egg", 100], ["sugar", 30], ["orange-juice", 30]], 205],
  ["hot-chocolate-souffle", "Hot chocolate souffle", "हॉट चॉकलेट सूफ़ले", ["baked chocolate souffle"], { katori: 100 }, "katori", [["white-sauce", 60], ["raw-egg", 100], ["sugar", 30], ["dark-chocolate", 25]], 200],
  ["hot-vanilla-souffle", "Hot vanilla souffle", "हॉट वनीला सूफ़ले", ["baked vanilla souffle"], { katori: 100 }, "katori", [["white-sauce", 60], ["raw-egg", 100], ["sugar", 30], ["milk", 20]], 195],
  ["hot-cheese-souffle", "Hot cheese souffle", "चीज़ सूफ़ले", ["cheese souffle"], { katori: 100 }, "katori", [["white-sauce", 80], ["raw-egg", 100], ["cheddar", 40]], 210],
  ["hot-potato-souffle", "Hot potato souffle", "आलू सूफ़ले", ["potato souffle"], { katori: 100 }, "katori", [["white-sauce", 60], ["boiled-potato", 80], ["raw-egg", 80], ["cheddar", 15]], 220],
  ["hot-fish-souffle", "Hot fish souffle", "हॉट फ़िश सूफ़ले", ["baked fish souffle"], { katori: 100 }, "katori", [["white-sauce", 70], ["raw-fish", 70], ["raw-egg", 80]], 205],
  ["hot-spinach-souffle", "Hot spinach souffle", "हॉट पालक सूफ़ले", ["baked spinach souffle"], { katori: 100 }, "katori", [["white-sauce", 70], ["raw-spinach", 80], ["raw-egg", 80], ["cheddar", 10]], 220],
  ["spinach-souffle", "Palak souffle", "पालक सूफ़ले", ["spinach souffle"], { katori: 100 }, "katori", [["white-sauce", 60], ["raw-spinach", 100], ["raw-egg", 80], ["cheddar", 15]], 230],
  ["spinach-paneer-souffle", "Spinach and paneer souffle", "पालक पनीर सूफ़ले", ["palak paneer souffle"], { katori: 100 }, "katori", [["white-sauce", 60], ["raw-spinach", 70], ["paneer", 40], ["raw-egg", 80]], 235],
  ["masala-souffle", "Masala souffle", "मसाला सूफ़ले", ["spicy souffle"], { katori: 100 }, "katori", [["white-sauce", 60], ["raw-egg", 100], ["onion", 20], ["tomato", 20], ["green-chilli", 2], ["cheddar", 15]], 205],
  ["chicken-cheese-souffle", "Chicken and cheese souffle", "चिकन चीज़ सूफ़ले", ["chicken souffle"], { katori: 100 }, "katori", [["white-sauce", 60], ["raw-chicken-breast", 60], ["raw-egg", 80], ["cheddar", 20]], 210],

  // Ice creams (homemade)
  ["eggless-vanilla-ice-cream", "Eggless vanilla ice cream", "एगलेस वनीला आइसक्रीम", ["vanilla ice cream without egg", "homemade vanilla ice cream eggless"], { katori: 70 }, "katori", [["milk", 150], ["whipping-cream", 70], ["sugar", 40], ["cornstarch", 6]], 250],
  ["homemade-vanilla-ice-cream", "Homemade vanilla ice cream", "घर की वनीला आइसक्रीम", ["vanilla ice cream with egg"], { katori: 70 }, "katori", [["milk", 150], ["whipping-cream", 60], ["raw-egg", 30], ["sugar", 40]], 270],
  ["chocolate-ice-cream", "Chocolate ice cream", "चॉकलेट आइसक्रीम", ["choco ice cream"], { katori: 70 }, "katori", [["milk", 150], ["whipping-cream", 60], ["sugar", 40], ["cocoa", 10], ["cornstarch", 5]], 250],
  ["mango-ice-cream", "Mango ice cream", "मैंगो आइसक्रीम", ["aam ice cream"], { katori: 70 }, "katori", [["milk", 120], ["whipping-cream", 60], ["mango", 80], ["sugar", 35]], 280],
  ["fruit-ice-cream", "Fruit ice cream", "फ्रूट आइसक्रीम", ["phalon ka ice cream", "tutti frutti ice cream"], { katori: 70 }, "katori", [["milk", 120], ["whipping-cream", 60], ["sugar", 35], ["banana", 30], ["pineapple", 30], ["candied-fruit", 10]], 275],
  ["caramel-ice-cream", "Caramel ice cream", "कैरेमल आइसक्रीम", ["caramel icecream"], { katori: 70 }, "katori", [["milk", 150], ["whipping-cream", 60], ["sugar", 45], ["butter", 5]], 245],
  ["strawberry-ice-cream", "Strawberry ice cream", "स्ट्रॉबेरी आइसक्रीम", ["strawberry icecream"], { katori: 70 }, "katori", [["milk", 120], ["whipping-cream", 60], ["strawberry", 80], ["sugar", 40]], 285],
  ["chocochip-ice-cream", "Chocochip ice cream", "चोकोचिप आइसक्रीम", ["choco chip ice cream"], { katori: 70 }, "katori", [["milk", 150], ["whipping-cream", 60], ["sugar", 40], ["dark-chocolate", 25]], 265],
  ["choconut-ice-cream", "Choconut ice cream", "चोकोनट आइसक्रीम", ["chocolate walnut ice cream"], { katori: 70 }, "katori", [["milk", 150], ["whipping-cream", 60], ["sugar", 40], ["cocoa", 8], ["walnuts", 15]], 265],
  ["coffee-ice-cream", "Coffee ice cream", "कॉफ़ी आइसक्रीम", ["coffee icecream"], { katori: 70 }, "katori", [["milk", 150], ["whipping-cream", 60], ["sugar", 40], ["instant-coffee", 4]], 250],
  ["butterscotch-ice-cream", "Butterscotch crunch ice cream", "बटरस्कॉच आइसक्रीम", ["crunchy butterscotch", "butterscotch ice cream"], { katori: 70 }, "katori", [["milk", 130], ["whipping-cream", 60], ["sugar", 45], ["butter", 8], ["cashews", 10]], 250],
  ["pear-chocolate-sundae", "Pear chocolate sundae", "पियर चॉकलेट संडे", ["pear chocholate sunday", "chocolate sundae"], { piece: 210 }, "piece", [["ice-cream", 100], ["pear", 80], ["chocolate-sauce", 25], ["walnuts", 5]], 210],
  ["peach-melba", "Peach melba", "पीच मेल्बा", ["peach melba ice cream"], { piece: 215 }, "piece", [["ice-cream", 100], ["peach", 80], ["raspberries", 30], ["sugar", 8]], 215],
  ["ice-cream-apples-cherry", "Vanilla ice cream with apples in hot cherry sauce", "चेरी सॉस वाली आइसक्रीम", ["ice cream with apples and cherry sauce"], { piece: 200 }, "piece", [["ice-cream", 100], ["apple", 60], ["hot-cherry-sauce", 40]], 200],
  ["coffee-pear-alaska", "Coffee pear alaska", "कॉफ़ी पियर अलास्का", ["baked alaska"], { piece: 200 }, "piece", [["sponge-cake", 40], ["coffee-ice-cream", 70], ["pear", 40], ["raw-egg", 30], ["sugar", 30]], 200],
];
