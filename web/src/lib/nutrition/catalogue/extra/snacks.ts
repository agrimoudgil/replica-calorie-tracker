import type { DishRow } from "../rows";

/*
 * Snacks. Deep-fried food counts the oil it soaks up (about 15–20% of its weight), not the
 * oil left in the pan. A piece is one pakora, cutlet, samosa or vada.
 */
export const SNACK_ROWS: DishRow[] = [
  // Pakoras and bondas
  ["aloo-pakora", "Aloo pakoda", "आलू पकौड़ा", ["potato pakora", "aloo bhajji", "aloo pakora"], { piece: 18 }, "piece", [["raw-potato", 60], ["besan", 20], ["oil", 15], ["salt", 0.6]], 90],
  ["gobhi-pakora", "Gobhi pakoda", "गोभी पकौड़ा", ["cauliflower pakora", "phoolgobhi ke pakode", "gobi pakora"], { piece: 18 }, "piece", [["cauliflower", 60], ["besan", 20], ["oil", 15], ["salt", 0.6]], 90],
  ["mixed-veg-pakora", "Mixed vegetable pakora", "मिक्स वेज पकौड़ा", ["mix veg pakoda", "mixed pakora"], { piece: 18 }, "piece", [["onion", 25], ["raw-potato", 20], ["cauliflower", 15], ["raw-spinach", 10], ["besan", 25], ["oil", 16], ["salt", 0.6]], 100],
  ["palak-pakora", "Palak pakoda", "पालक पकौड़ा", ["spinach pakora", "palak pakora"], { piece: 12 }, "piece", [["raw-spinach", 40], ["besan", 25], ["oil", 15], ["salt", 0.6]], 75],
  ["methi-pakora", "Methi pakode", "मेथी पकौड़े", ["methi pakora", "methi bhajia", "methi na gota"], { piece: 12 }, "piece", [["methi-leaves", 35], ["besan", 25], ["oil", 15], ["salt", 0.6]], 70],
  ["egg-pakora", "Ande ke pakode", "अंडे के पकौड़े", ["egg pakora", "egg bajji"], { piece: 37 }, "piece", [["boiled-egg", 50], ["besan", 15], ["oil", 10], ["salt", 0.4]], 75],
  ["mirchi-pakora", "Mirchi pakoda", "मिर्ची पकौड़ा", ["masala green chilli pakora", "mirchi bajji", "hari mirch ke pakode", "mirchi bhajji"], { piece: 23 }, "piece", [["green-chilli", 30], ["besan", 25], ["oil", 14], ["salt", 0.5]], 70],
  ["chicken-pakora", "Chicken pakora", "चिकन पकौड़ा", ["chicken pakoda", "chicken bhajia"], { piece: 20 }, "piece", [["raw-chicken-breast", 70], ["besan", 20], ["oil", 14], ["salt", 0.7]], 100],
  ["fish-pakora", "Fish pakora", "फ़िश पकौड़ा", ["fish pakoda", "machli pakora"], { piece: 20 }, "piece", [["raw-fish", 70], ["besan", 20], ["oil", 14], ["salt", 0.7]], 100],
  ["kathal-pakora", "Kathal pakora", "कटहल पकौड़ा", ["jackfruit fritters", "ponsa mulik", "kathal ka pakora"], { piece: 20 }, "piece", [["jackfruit", 50], ["besan", 20], ["oil", 14], ["salt", 0.5]], 85],
  ["aloo-bonda", "Aloo bonda", "आलू बोंडा", ["potato bonda", "batata vada"], { piece: 40 }, "piece", [["boiled-potato", 50], ["besan", 20], ["oil", 12], ["salt", 0.6]], 80],

  // Samosas
  ["keema-samosa", "Keema samosa", "कीमा समोसा", ["minced meat samosa", "keema ka samosa", "mutton samosa"], { piece: 80 }, "piece", [["maida", 30], ["keema", 40], ["oil", 14]], 80],
  ["paneer-matar-samosa", "Paneer matar samosa", "पनीर मटर समोसा", ["paneer and pea samosa", "paneer samosa"], { piece: 75 }, "piece", [["maida", 30], ["paneer", 20], ["green-peas", 15], ["oil", 14], ["salt", 0.5]], 75],
  ["veg-samosa", "Vegetable samosa", "वेजिटेबल समोसा", ["veg samosa", "mixed veg samosa"], { piece: 85 }, "piece", [["maida", 30], ["boiled-potato", 25], ["green-peas", 10], ["carrot", 10], ["oil", 14], ["salt", 0.5]], 85],

  // Cutlets, tikkis and kebabs (shallow-fried)
  ["poha-cutlet", "Poha cutlet", "पोहा कटलेट", ["chivda cutlet", "chirwa cutlet", "flattened rice cutlet"], { piece: 33 }, "piece", [["raw-poha", 25], ["boiled-potato", 40], ["oil", 6], ["salt", 0.6]], 65],
  ["peanut-cutlet", "Peanut cutlet", "मूंगफली कटलेट", ["mungfali ke cutlet"], { piece: 30 }, "piece", [["peanuts", 15], ["boiled-potato", 40], ["oil", 6], ["salt", 0.6]], 60],
  ["fish-cutlet", "Fish cutlet", "फ़िश कटलेट", ["machli ka cutlet"], { piece: 42 }, "piece", [["raw-fish", 50], ["boiled-potato", 30], ["bread-crumbs", 8], ["raw-egg", 8], ["oil", 7], ["salt", 0.6]], 85],
  ["paneer-aloo-cutlet", "Paneer aloo cutlet", "पनीर आलू कटलेट", ["paneer potato cutlet"], { piece: 40 }, "piece", [["paneer", 30], ["boiled-potato", 40], ["bread-crumbs", 6], ["oil", 7], ["salt", 0.6]], 80],
  ["paneer-cutlet", "Paneer cutlet", "पनीर कटलेट", ["paneer tikki"], { piece: 40 }, "piece", [["paneer", 45], ["boiled-potato", 25], ["bread-crumbs", 6], ["oil", 7], ["salt", 0.6]], 80],
  ["palak-chana-cutlet", "Palak chana dal cutlet", "पालक चना दाल कटलेट", ["spinach chickpeas cutlet", "palak channa dal cutlet"], { piece: 40 }, "piece", [["raw-chana-dal", 25], ["raw-spinach", 30], ["oil", 7], ["salt", 0.6]], 80],
  ["poshtik-cutlet", "Poshtik cutlet", "पौष्टिक कटलेट", ["nutritious cutlet"], { piece: 40 }, "piece", [["raw-moong-dal", 15], ["boiled-potato", 30], ["carrot", 15], ["raw-spinach", 10], ["oil", 6], ["salt", 0.6]], 80],
  ["egg-cutlet", "Anda cutlet", "अंडा कटलेट", ["egg cutlet"], { piece: 48 }, "piece", [["boiled-egg", 50], ["boiled-potato", 30], ["bread-crumbs", 8], ["oil", 8], ["salt", 0.5]], 95],
  ["keema-cutlet", "Keema cutlet", "कीमा कटलेट", ["minced meat cutlet", "mutton cutlet"], { piece: 42 }, "piece", [["raw-mutton", 50], ["boiled-potato", 25], ["bread-crumbs", 8], ["raw-egg", 8], ["oil", 8], ["salt", 0.6]], 85],
  ["soya-tikki", "Soya tikki", "सोया टिक्की", ["soyabean tikki", "soya cutlet"], { piece: 40 }, "piece", [["soya-chunks", 20], ["boiled-potato", 35], ["oil", 7], ["salt", 0.6]], 80],
  ["veg-seekh-kebab", "Vegetable seekh kebab", "वेज सीख कबाब", ["veg seekh kebab", "veg kebab"], { piece: 40 }, "piece", [["boiled-potato", 30], ["carrot", 15], ["beans", 10], ["paneer", 15], ["besan", 8], ["oil", 6], ["salt", 0.6]], 80],
  ["soya-seekh-kebab", "Soya seekh kebab", "सोया सीख कबाब", ["soya kebab"], { piece: 40 }, "piece", [["soya-chunks", 20], ["boiled-potato", 25], ["onion", 10], ["besan", 5], ["oil", 6], ["salt", 0.6]], 80],
  ["veg-scotch-egg", "Vegetarian scotch egg", "वेज स्कॉच एग", ["veg scotch egg", "vegeterian scotch egg"], { piece: 85 }, "piece", [["paneer", 30], ["boiled-potato", 40], ["bread-crumbs", 8], ["oil", 10], ["salt", 0.5]], 85],
  ["soya-muthia", "Soya muthia", "सोया मुठिया", ["soyabean muthias", "soya muthiya"], { piece: 25 }, "piece", [["atta", 20], ["raw-soybean", 15], ["methi-leaves", 15], ["oil", 6], ["salt", 0.5]], 75],

  // Vadas
  ["sabudana-vada", "Sabudana vada", "साबूदाना वड़ा", ["sago vada", "sago cutlet", "sabudana cutlet"], { piece: 40 }, "piece", [["sabudana", 25], ["boiled-potato", 30], ["peanuts", 6], ["oil", 10], ["salt", 0.6]], 80],
  ["sabudana-peanut-vada", "Sabudana mungfali vada", "साबूदाना मूंगफली वड़ा", ["peanut sago vada"], { piece: 40 }, "piece", [["sabudana", 25], ["peanuts", 12], ["boiled-potato", 25], ["oil", 10], ["salt", 0.6]], 80],
  ["masala-urad-vada", "Masala urad dal vada", "मसाला उड़द वड़ा", ["masala urad vada", "masala vadai"], { piece: 43 }, "piece", [["raw-urad-dal", 30], ["onion", 10], ["green-chilli", 2], ["oil", 12], ["salt", 0.5]], 85],
  ["fermented-chana-vada", "Fermented chana dal vada", "खमीरी चना दाल वड़ा", ["ufna hua channa dal ka vada", "khameerikrit vada"], { piece: 35 }, "piece", [["raw-chana-dal", 30], ["onion", 8], ["oil", 10], ["salt", 0.5]], 70],
  ["suji-gajar-vada", "Suji gajar vada", "सूजी गाजर वड़ा", ["semolina carrot vada", "rava carrot vada"], { piece: 37 }, "piece", [["suji", 25], ["carrot", 20], ["curd", 15], ["oil", 10], ["salt", 0.5]], 75],

  // Pastry snacks
  ["cheese-balls", "Cheese balls", "चीज़ बॉल्स", ["cheese potato balls"], { piece: 17 }, "piece", [["cheddar", 30], ["boiled-potato", 30], ["bread-crumbs", 10], ["maida", 5], ["oil", 12]], 85],
  ["keema-patties", "Keema patties", "कीमा पैटीज़", ["minced meat patties", "mutton puff"], { piece: 90 }, "piece", [["flaky-pastry", 50], ["keema", 40]], 90],
  ["cheese-patties", "Cheese patties", "चीज़ पैटीज़", ["cheese puff"], { piece: 90 }, "piece", [["flaky-pastry", 50], ["cheddar", 20], ["boiled-potato", 20]], 90],
  ["paneer-patties", "Paneer patties", "पनीर पैटीज़", ["paneer puff"], { piece: 92 }, "piece", [["flaky-pastry", 50], ["paneer", 25], ["onion", 10], ["green-peas", 10]], 92],
  ["veg-patties", "Vegetable patties", "वेज पैटीज़", ["veg puff", "aloo puff", "veg patty"], { piece: 100 }, "piece", [["flaky-pastry", 50], ["boiled-potato", 30], ["green-peas", 10], ["carrot", 10], ["oil", 2]], 100],
  ["savoury-puffs", "Savoury puffs", "नमकीन पफ़्स", ["cheese choux puffs"], { piece: 30 }, "piece", [["choux-pastry", 30], ["cheese-sauce", 30]], 60],
  ["potato-aigrettes", "Potato aigrettes", "पोटैटो एग्रेट्स", ["potato cheese fritters"], { piece: 20 }, "piece", [["boiled-potato", 40], ["choux-pastry", 30], ["cheddar", 5], ["oil", 10]], 80],
  ["savoury-cheese-horns", "Savoury cheese horns", "चीज़ हॉर्न्स", ["cheese horns"], { piece: 70 }, "piece", [["flaky-pastry", 40], ["cheese-sauce", 30]], 70],
  ["cheese-straws", "Cheese straws", "चीज़ स्ट्रॉज़", ["cheese sticks"], { piece: 8 }, "piece", [["maida", 40], ["butter", 20], ["cheddar", 25]], 80],

  // Namkeen and crunchy snacks (a katori here is about 30–40 g)
  ["soya-namak-pare", "Soya namak pare", "सोया नमक पारे", ["soyabean namak paras", "soya namak paras"], { katori: 30, piece: 5 }, "katori", [["maida", 30], ["raw-soybean", 10], ["oil", 12], ["salt", 0.6]], 52],
  ["palak-namak-pare", "Palak namak pare", "पालक नमक पारे", ["spinach peanut namak paras", "palak moongfali namak paras"], { katori: 30, piece: 5 }, "katori", [["maida", 25], ["raw-spinach", 10], ["peanuts", 6], ["oil", 12], ["salt", 0.6]], 52],
  ["poshtik-namak-pare", "Poshtik namak pare", "पौष्टिक नमक पारे", ["poshtik namak paras"], { katori: 30, piece: 5 }, "katori", [["atta", 20], ["besan", 10], ["oil", 12], ["salt", 0.6]], 42],
  ["bajra-mathri", "Bajra mathri", "बाजरा मठरी", ["pearl millet mathri"], { piece: 15 }, "piece", [["bajra-flour", 25], ["atta", 10], ["oil", 10], ["salt", 0.5]], 45],
  ["moong-dal-namkeen", "Moong dal namkeen", "मूंग दाल नमकीन", ["moong dal mixture", "fried moong dal"], { katori: 30 }, "katori", [["raw-moong-dal", 50], ["oil", 18], ["salt", 1]], 65],
  ["banana-chips", "Banana chips", "केले के चिप्स", ["kele ke chips", "nendran chips", "kerala banana chips"], { katori: 30 }, "katori", [["raw-banana", 150], ["oil", 30], ["salt", 1.5]], 90],
  ["papdi", "Papdi", "पापड़ी", ["papri", "crispy papdi"], { katori: 30, piece: 5 }, "katori", [["maida", 25], ["oil", 9], ["salt", 0.4]], 33],
  ["khakhra-chaat", "Khakhra chaat", "खाखरा चाट", ["khakra chaat"], { katori: 85 }, "katori", [["khakhra", 20], ["onion", 15], ["tomato", 15], ["namkeen", 8], ["mint-chutney", 5], ["curd", 20]], 85],
  ["poha-chana-mix", "Poha chana mix", "पोहा चना मिक्स", ["rice flakes and roasted channa", "poha chivda"], { katori: 40 }, "katori", [["raw-poha", 20], ["roasted-chana", 15], ["peanuts", 5], ["oil", 3], ["salt", 0.5]], 42],
  ["chana-murmura", "Chana murmura", "चना मुरमुरा", ["channa murmura premix", "murmura chana"], { katori: 40 }, "katori", [["roasted-chana", 30], ["murmura", 20], ["peanuts", 8], ["jaggery", 8]], 66],
  ["rava-dhokla", "Rava dhokla", "रवा ढोकला", ["semolina dhokla", "suji dhokla"], { piece: 30 }, "piece", [["suji", 40], ["curd", 40], ["oil", 4], ["salt", 0.8]], 120],
  ["besan-suji-dhokla", "Besan suji dhokla", "बेसन सूजी ढोकला", ["gram flour and semolina dhokla"], { piece: 30 }, "piece", [["besan", 25], ["suji", 15], ["curd", 30], ["oil", 4], ["salt", 0.7]], 110],
];
