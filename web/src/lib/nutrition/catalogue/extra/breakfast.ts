import type { DishRow } from "../rows";

/* Breakfast: cereals and porridges, kanji, upma and poha, chillas, eggs and pancakes. */
export const BREAKFAST_ROWS: DishRow[] = [
  // Cereals and porridges (a katori is about 200 g)
  ["suji-porridge", "Suji porridge", "सूजी दलिया", ["semolina porridge", "rava daliya", "suji daliya"], { katori: 200 }, "katori", [["suji", 30], ["milk", 200], ["sugar", 15]], 240],
  ["seviyan-porridge", "Seviyan porridge", "सेवइयां दलिया", ["vermicelli porridge", "semiya porridge"], { katori: 200 }, "katori", [["vermicelli", 25], ["milk", 200], ["sugar", 15], ["ghee", 3]], 230],
  ["cornflakes-milk", "Cornflakes with milk", "दूध के साथ कॉर्नफ़्लेक्स", ["cornflakes and milk"], { katori: 185 }, "katori", [["cornflakes", 30], ["milk", 150], ["sugar", 5]], 185],
  ["poha-milk", "Poha with milk", "दूध पोहा", ["rice flakes with milk", "chiwda with milk", "aval with milk", "doodh poha"], { katori: 190 }, "katori", [["raw-poha", 30], ["milk", 150], ["sugar", 10]], 190],
  ["wheat-flakes-milk", "Wheat flakes with milk", "दूध के साथ व्हीट फ्लेक्स", ["wheat flakes and milk"], { katori: 180 }, "katori", [["wheat-flakes", 30], ["milk", 150]], 180],
  ["puffed-wheat-milk", "Puffed wheat with milk", "दूध के साथ गेहूं के मुरमुरे", ["puffed wheat and milk"], { katori: 170 }, "katori", [["puffed-wheat", 15], ["milk", 150], ["sugar", 5]], 170],
  ["maize-porridge", "Maize porridge", "मक्के का दलिया", ["makki porridge", "corn porridge"], { katori: 170 }, "katori", [["makki-atta", 20], ["milk", 120], ["sugar", 8]], 170],

  // Kanji (thin rice porridge)
  ["rice-kanji", "Rice kanji", "चावल की कांजी", ["canjee", "kanji", "rice porridge", "ganji"], { katori: 200 }, "katori", [["raw-rice", 30], ["salt", 1]], 300],
  ["cauliflower-kanji", "Cauliflower kanji", "गोभी की कांजी", ["cauliflower canjee", "phoolgobhi ki canjee"], { katori: 200 }, "katori", [["raw-rice", 25], ["cauliflower", 40], ["ghee", 2], ["salt", 1]], 300],
  ["potato-kanji", "Potato kanji", "आलू की कांजी", ["potato canjee", "aloo canjee"], { katori: 200 }, "katori", [["raw-rice", 25], ["raw-potato", 40], ["ghee", 2], ["salt", 1]], 300],
  ["cauliflower-potato-kanji", "Cauliflower potato kanji", "गोभी आलू की कांजी", ["cauliflower potato canjee"], { katori: 200 }, "katori", [["raw-rice", 20], ["cauliflower", 30], ["raw-potato", 30], ["ghee", 2], ["salt", 1]], 300],

  // Upma and poha (a katori is about 150 g)
  ["rice-upma", "Rice upma", "चावल का उपमा", ["akki upma", "arisi upma"], { katori: 150 }, "katori", [["raw-rice", 50], ["oil", 6], ["onion", 15], ["coconut", 5], ["salt", 1]], 200],
  ["bread-upma", "Bread upma", "ब्रेड उपमा", ["bread poha"], { katori: 120 }, "katori", [["white-bread", 75], ["onion", 25], ["tomato", 25], ["green-peas", 15], ["oil", 7], ["salt", 1]], 150],
  ["vegetable-upma", "Vegetable upma", "वेजिटेबल उपमा", ["veg upma", "vegetable rava upma"], { katori: 150 }, "katori", [["suji", 45], ["oil", 7], ["onion", 15], ["carrot", 15], ["green-peas", 15], ["beans", 10], ["salt", 1]], 220],
  ["sprouts-upma", "Sprouts upma", "स्प्राउट्स उपमा", ["moong sprouts upma"], { katori: 150 }, "katori", [["suji", 40], ["moong-sprouts", 40], ["oil", 6], ["onion", 15], ["salt", 1]], 210],
  ["sprouted-moong-poha", "Sprouted moong poha", "अंकुरित मूंग पोहा", ["sprouts poha"], { katori: 150 }, "katori", [["raw-poha", 40], ["moong-sprouts", 40], ["onion", 15], ["peanuts", 5], ["oil", 6], ["salt", 0.8]], 180],
  ["sprouted-moong-dalia", "Sprouted moong dalia", "अंकुरित मूंग दलिया", ["sprouted moong daliya", "sprouts dalia"], { katori: 200 }, "katori", [["dalia", 35], ["moong-sprouts", 40], ["onion", 10], ["oil", 5], ["salt", 0.8]], 220],
  ["poha-curd", "Poha with curd", "दही पोहा", ["poha aur dahi", "dahi poha", "dahi chura"], { katori: 150 }, "katori", [["raw-poha", 30], ["curd", 100], ["sugar", 5], ["salt", 0.5]], 150],

  // Chillas (one each)
  ["moong-dal-stuffed-cheela", "Moong dal stuffed cheela", "भरवां मूंग दाल चीला", ["stuffed moong chilla", "moong dal ka cheela stuffed"], { piece: 90 }, "piece", [["raw-moong-dal", 40], ["raw-potato", 15], ["green-peas", 10], ["onion", 10], ["oil", 5], ["salt", 0.8]], 130],
  ["paneer-stuffed-cheela", "Paneer stuffed cheela", "पनीर भरवां चीला", ["paneer chilla", "paneer cheela"], { piece: 130 }, "piece", [["besan", 35], ["paneer", 30], ["onion", 10], ["tomato", 10], ["oil", 6], ["salt", 0.7]], 130],
  ["besan-suji-chilla", "Besan suji chilla", "बेसन सूजी चीला", ["gram flour and semolina chilla", "besan suji cheela"], { piece: 100 }, "piece", [["besan", 25], ["suji", 15], ["onion", 10], ["tomato", 10], ["oil", 5], ["salt", 0.6]], 100],
  ["rice-moong-cheela", "Rice moong dal cheela", "चावल मूंग दाल चीला", ["chawal aur moong dal ka cheela", "rice moong chilla"], { piece: 110 }, "piece", [["raw-rice", 20], ["raw-moong-dal", 20], ["onion", 10], ["oil", 5], ["salt", 0.6]], 110],
  ["besan-bathua-chilla", "Besan bathua chilla", "बेसन बथुआ चीला", ["bathua chilla", "besan bathua cheela"], { piece: 120 }, "piece", [["besan", 35], ["bathua", 25], ["onion", 10], ["oil", 5], ["salt", 0.6]], 120],
  ["poshtik-chilla", "Poshtik chilla", "पौष्टिक चीला", ["poshtik cheela", "nutritious chilla"], { piece: 120 }, "piece", [["besan", 20], ["raw-moong-dal", 15], ["raw-spinach", 20], ["onion", 10], ["oil", 5], ["salt", 0.6]], 120],

  // Eggs (one each, or one omelette of two eggs)
  ["poached-egg", "Poached egg", "पोच्ड एग", ["poached eggs"], { piece: 50 }, "piece", [["raw-egg", 50], ["salt", 0.3]], 50],
  ["baked-egg", "Baked egg", "बेक्ड एग", ["oven baked egg"], { piece: 60 }, "piece", [["raw-egg", 50], ["butter", 5], ["milk", 10], ["salt", 0.3]], 60],
  ["plain-omelette", "Plain omelette", "सादा ऑमलेट", ["plain omlet", "sada omelette"], { piece: 100 }, "piece", [["raw-egg", 100], ["oil", 5], ["salt", 0.6]], 100],
  ["stuffed-omelette", "Stuffed omelette", "स्टफ़्ड ऑमलेट", ["stuffed egg omelette", "veg omelette"], { piece: 140 }, "piece", [["raw-egg", 100], ["onion", 15], ["tomato", 15], ["capsicum", 10], ["oil", 6], ["salt", 0.7]], 140],
  ["french-omelette", "French omelette", "फ़्रेंच ऑमलेट", ["french omlet"], { piece: 115 }, "piece", [["raw-egg", 100], ["butter", 7], ["milk", 15], ["salt", 0.6]], 115],
  ["puffy-omelette", "Puffy omelette", "फूला ऑमलेट", ["puffy omlet", "souffle omelette"], { piece: 110 }, "piece", [["raw-egg", 100], ["butter", 7], ["milk", 10], ["salt", 0.6]], 110],
  ["orange-omelette", "Orange omelette", "ऑरेंज ऑमलेट", ["sweet orange omelette"], { piece: 140 }, "piece", [["raw-egg", 100], ["butter", 7], ["orange-juice", 30], ["sugar", 10]], 140],
  ["cheese-mushroom-omelette", "Cheese mushroom omelette", "चीज़ मशरूम ऑमलेट", ["cheese and mushroom omelette", "mushroom omelette"], { piece: 150 }, "piece", [["raw-egg", 100], ["mushroom", 40], ["cheddar", 15], ["butter", 7], ["salt", 0.6]], 150],
  ["spanish-omelette", "Spanish omelette", "स्पैनिश ऑमलेट", ["spanish omlet", "potato omelette"], { piece: 200 }, "piece", [["raw-egg", 100], ["raw-potato", 60], ["onion", 30], ["capsicum", 15], ["oil", 10], ["salt", 0.8]], 200],
  ["corn-omelette", "Corn omelette", "कॉर्न ऑमलेट", ["corn omlet", "sweet corn omelette"], { piece: 140 }, "piece", [["raw-egg", 100], ["sweet-corn", 30], ["onion", 10], ["oil", 6], ["salt", 0.6]], 140],
  ["palak-mushroom-bhurji", "Palak mushroom bhurji", "पालक मशरूम भुर्जी", ["spinach mushroom scrambled egg"], { katori: 130 }, "katori", [["raw-egg", 100], ["raw-spinach", 40], ["mushroom", 40], ["onion", 15], ["oil", 7], ["salt", 0.8]], 180],
  ["baked-eggs-tomato", "Baked eggs in tomato sauce", "टमाटर सॉस में अंडे", ["shakshuka", "eggs in tomato sauce"], { katori: 210 }, "katori", [["raw-egg", 100], ["tomato-pasta-sauce", 120], ["oil", 5], ["salt", 0.5]], 210],
  ["egg-in-pepper", "Egg in a pepper", "शिमला मिर्च में अंडा", ["egg in capsicum"], { piece: 150 }, "piece", [["raw-egg", 50], ["capsicum", 100], ["cheddar", 10], ["oil", 3], ["salt", 0.3]], 150],

  // Pancakes (two pancakes per recipe; a piece is one)
  ["pancake", "Pancake", "पैनकेक", ["pancakes", "plain pancake"], { piece: 70 }, "piece", [["maida", 50], ["milk", 70], ["raw-egg", 25], ["sugar", 8], ["butter", 5]], 140],
  ["keema-pancake", "Keema pancake", "कीमा पैनकेक", ["mince pancake"], { piece: 110 }, "piece", [["pancake", 140], ["keema", 80]], 220],
  ["vegetable-pancake", "Vegetable pancake", "वेजिटेबल पैनकेक", ["veg pancake"], { piece: 85 }, "piece", [["maida", 45], ["milk", 60], ["raw-egg", 25], ["onion", 15], ["carrot", 15], ["capsicum", 10], ["oil", 6], ["salt", 0.7]], 170],
  ["jam-fruit-pancake", "Jam and fruit pancake", "जैम फ्रूट पैनकेक", ["fruit pancake", "jam pancake"], { piece: 100 }, "piece", [["pancake", 140], ["jam", 20], ["banana", 40]], 200],
  ["khoa-coconut-pancake", "Khoa coconut pancake", "खोया नारियल पैनकेक", ["khoa and coconut pancake"], { piece: 95 }, "piece", [["pancake", 140], ["khoa", 25], ["coconut", 15], ["sugar", 10]], 190],
  ["bacon-mushroom-pancake", "Bacon mushroom pancake", "बेकन मशरूम पैनकेक", ["bacon and mushroom pancake"], { piece: 95 }, "piece", [["pancake", 140], ["bacon", 25], ["mushroom", 40], ["oil", 3]], 190],
  ["cheese-tomato-pancake", "Cheese tomato pancake", "चीज़ टमाटर पैनकेक", ["cheese and tomato pancake"], { piece: 100 }, "piece", [["pancake", 140], ["cheddar", 25], ["tomato", 40]], 200],
  ["chicken-mince-pancake", "Chicken mince pancake", "चिकन कीमा पैनकेक", ["minced meat pancake with chicken", "chicken pancake"], { piece: 105 }, "piece", [["pancake", 140], ["minced-chicken", 70], ["onion", 15], ["oil", 5], ["salt", 0.6]], 210],
  ["kuttu-pancake", "Kuttu pancake", "कुट्टू का चीला", ["buckwheat pancake", "khura", "kuttu chilla"], { piece: 55 }, "piece", [["buckwheat-flour", 50], ["oil", 6], ["salt", 0.6]], 110],
  ["banana-appam", "Banana appam", "केले का अप्पम", ["unniyappam", "banana paniyaram"], { piece: 35 }, "piece", [["rice-flour", 40], ["banana", 60], ["jaggery", 20], ["coconut", 10], ["oil", 5]], 140],
];
