import type { DishRow } from "../rows";

/*
 * Mutton, chicken and fish, per katori (about 150 g) or piece. Raw meat weights are the
 * edible part; cooked meat weighs about a quarter to a third less.
 */
export const NON_VEG_ROWS: DishRow[] = [
  // Mutton
  ["palak-gosht", "Palak gosht", "पालक गोश्त", ["palak mutton", "spinach mutton", "saag gosht"], { katori: 150 }, "katori", [["raw-mutton", 100], ["raw-spinach", 120], ["onion", 30], ["tomato", 30], ["oil", 12], ["salt", 1.4]], 270],
  ["mutton-korma", "Mutton korma", "मटन कोरमा", ["gosht korma", "lamb korma"], { katori: 150 }, "katori", [["raw-mutton", 100], ["curd", 40], ["onion", 40], ["cashews", 6], ["cream", 8], ["oil", 12], ["salt", 1.3]], 240],
  ["mutton-do-pyaza", "Mutton do pyaza", "मटन दो प्याज़ा", ["gosht do pyaza", "mutton do piaza"], { katori: 150 }, "katori", [["raw-mutton", 100], ["onion", 80], ["tomato", 30], ["curd", 15], ["oil", 12], ["salt", 1.4]], 240],
  ["mutton-yakhni", "Mutton yakhni", "मटन यख़नी", ["kashmiri mutton yakhni"], { katori: 150 }, "katori", [["raw-mutton", 100], ["curd", 80], ["onion", 20], ["ghee", 8], ["fennel-seeds", 1], ["salt", 1.3]], 240],
  ["gushtaba", "Gushtaba", "गुश्ताबा", ["kashmiri mutton koftas", "goshtaba"], { katori: 150 }, "katori", [["raw-mutton", 100], ["curd", 100], ["ghee", 10], ["salt", 1.2]], 230],
  ["keema-kofta-curry", "Keema kofta curry", "कीमा कोफ़्ता करी", ["meatball curry", "minced meat ball curry", "mutton kofta curry"], { katori: 150 }, "katori", [["raw-mutton", 80], ["onion", 30], ["tomato", 50], ["curd", 15], ["oil", 12], ["salt", 1.3]], 220],
  ["shahi-keema-kofta", "Shahi keema kofta curry", "शाही कीमा कोफ़्ता", ["shahi kofta curry"], { katori: 150 }, "katori", [["raw-mutton", 80], ["cream", 15], ["cashews", 8], ["kofta-gravy", 100], ["oil", 8], ["salt", 0.8]], 230],
  ["nargisi-kofta", "Nargisi kofta", "नरगिसी कोफ़्ता", ["indian lamb and egg curry", "nargisi kofta curry"], { katori: 200 }, "katori", [["boiled-egg", 50], ["raw-mutton", 50], ["oil", 10], ["kofta-gravy", 100], ["salt", 0.5]], 210],
  ["mutton-chops", "Mutton chops", "मटन चॉप्स", ["lamb chops", "mutton chop"], { piece: 60 }, "piece", [["raw-mutton", 150], ["curd", 15], ["ginger", 3], ["garlic", 3], ["oil", 8], ["salt", 1.2]], 120],
  ["dry-masala-chops", "Dry masala chops", "सूखे मसाला चॉप्स", ["masala chops"], { piece: 70 }, "piece", [["raw-mutton", 150], ["onion", 30], ["oil", 12], ["salt", 1.4]], 140],
  ["shammi-kebab", "Shammi kebab", "शामी कबाब", ["shami kebab", "shammi kabab"], { piece: 40 }, "piece", [["raw-mutton", 60], ["raw-chana-dal", 15], ["raw-egg", 8], ["onion", 10], ["oil", 6], ["salt", 0.8]], 85],
  ["boti-kebab", "Boti kebab", "बोटी कबाब", ["boti kabab", "mutton tikka"], { piece: 25 }, "piece", [["raw-mutton", 120], ["curd", 25], ["oil", 6], ["salt", 1]], 100],
  ["mutton-seekh-kebab", "Mutton seekh kebab", "मटन सीख कबाब", ["mutton seekh", "lamb seekh kebab"], { piece: 35 }, "piece", [["raw-mutton", 80], ["onion", 10], ["oil", 4], ["salt", 0.8]], 70],
  ["scotch-egg", "Scotch egg", "स्कॉच एग", ["scotch eggs"], { piece: 110 }, "piece", [["boiled-egg", 50], ["raw-mutton", 50], ["bread-crumbs", 8], ["oil", 10], ["salt", 0.5]], 110],
  ["shepherds-pie", "Shepherd's pie", "शेफ़र्ड्स पाई", ["shepherd's pie with minced meat", "cottage pie", "shepherds pie"], { katori: 200 }, "katori", [["keema", 120], ["boiled-potato", 100], ["milk", 15], ["butter", 6], ["cheddar", 10]], 240],

  // Chicken
  ["chicken-yakhni", "Chicken yakhni", "चिकन यख़नी", ["murgh yakhni"], { katori: 150 }, "katori", [["raw-chicken", 100], ["curd", 80], ["onion", 20], ["ghee", 8], ["fennel-seeds", 1], ["salt", 1.3]], 240],
  ["fried-chicken-tomato", "Fried chicken with tomato sauce", "टमाटर सॉस के साथ फ्राइड चिकन", ["fried chicken", "fried chicken tamatar ki chutney kay saath"], { piece: 80 }, "piece", [["raw-chicken", 150], ["maida", 10], ["raw-egg", 10], ["oil", 15], ["ketchup", 20], ["salt", 1]], 165],
  ["roast-chicken", "Roast chicken", "रोस्ट चिकन", ["roasted chicken", "oven roast chicken"], { piece: 150 }, "piece", [["raw-chicken", 200], ["butter", 8], ["salt", 1.2]], 150],
  ["shahi-chicken", "Shahi chicken masala", "शाही चिकन मसाला", ["shahi chicken", "chicken shahi korma"], { katori: 150 }, "katori", [["raw-chicken", 120], ["curd", 30], ["cream", 15], ["cashews", 8], ["onion", 30], ["tomato", 40], ["oil", 10], ["salt", 1.3]], 240],
  ["tomato-chicken", "Tomato chicken", "टमाटर चिकन", ["chicken in tomato gravy"], { katori: 150 }, "katori", [["raw-chicken", 120], ["tomato", 90], ["onion", 25], ["oil", 9], ["salt", 1.2]], 220],
  ["creamy-chicken", "Creamy chicken", "क्रीमी चिकन", ["chicken in cream sauce"], { katori: 150 }, "katori", [["raw-chicken-breast", 120], ["cream", 30], ["white-sauce", 40], ["onion", 15], ["butter", 5], ["salt", 0.9]], 200],
  ["chicken-a-la-king", "Broccoli chicken a la king", "चिकन आ ला किंग", ["chicken a la king", "broccoli chicken ala king"], { katori: 150 }, "katori", [["raw-chicken-breast", 100], ["broccoli", 50], ["mushroom", 30], ["white-sauce", 80], ["salt", 0.5]], 240],
  ["ginger-chicken", "Ginger chicken", "जिंजर चिकन", ["adrak chicken"], { katori: 150 }, "katori", [["raw-chicken", 120], ["ginger", 15], ["onion", 25], ["soy-sauce", 6], ["oil", 9], ["salt", 0.6]], 170],
  ["sweet-sour-chicken", "Chicken sweet and sour", "स्वीट एंड सावर चिकन", ["sweet and sour chicken"], { katori: 150 }, "katori", [["raw-chicken-breast", 100], ["maida", 8], ["cornstarch", 8], ["capsicum", 25], ["onion", 20], ["pineapple", 20], ["ketchup", 15], ["vinegar", 6], ["sugar", 6], ["oil", 12], ["salt", 0.6]], 220],
  ["chicken-stew", "Chicken stew", "चिकन स्टू", ["kerala chicken stew"], { katori: 150 }, "katori", [["raw-chicken", 100], ["raw-potato", 40], ["carrot", 25], ["onion", 20], ["coconut-milk", 60], ["oil", 6], ["salt", 1]], 260],
  ["afghani-chicken", "Afghani chicken", "अफ़ग़ानी चिकन", ["chicken afghani", "afghani murgh"], { katori: 150 }, "katori", [["raw-chicken", 150], ["curd", 30], ["cream", 20], ["cashews", 8], ["butter", 5], ["salt", 1.2]], 180],
  ["chicken-manchurian", "Chicken manchurian", "चिकन मंचूरियन", ["manchurian chicken"], { katori: 150 }, "katori", [["raw-chicken-breast", 100], ["maida", 8], ["cornstarch", 8], ["onion", 20], ["capsicum", 20], ["soy-sauce", 8], ["oil", 12], ["salt", 0.5]], 190],
  ["handi-chicken", "Handi chicken", "हांडी चिकन", ["chicken handi", "murgh handi"], { katori: 150 }, "katori", [["raw-chicken", 120], ["curd", 30], ["onion", 35], ["tomato", 40], ["cream", 8], ["oil", 11], ["salt", 1.3]], 240],
  ["lemon-chicken", "Lemon chicken", "लेमन चिकन", ["chinese lemon chicken"], { katori: 120 }, "katori", [["raw-chicken-breast", 110], ["lemon-juice", 15], ["cornstarch", 8], ["sugar", 5], ["oil", 10], ["salt", 0.8]], 150],
  ["cajun-chicken", "Cajun chicken", "केजन चिकन", ["cajun spiced chicken"], { piece: 115 }, "piece", [["raw-chicken-breast", 130], ["red-chilli-powder", 2], ["black-pepper", 1], ["oil", 8], ["salt", 1]], 115],

  // Fish
  ["fish-and-chips", "Fish and chips", "फ़िश एंड चिप्स", ["fried fish and chips", "tali hui machli aur chips"], { piece: 250 }, "piece", [["raw-fish", 120], ["maida", 20], ["raw-potato", 150], ["oil", 25], ["salt", 1.2]], 250],
  ["tomato-fish", "Tomato fish", "टमाटर फ़िश", ["fish in tomato gravy"], { katori: 150 }, "katori", [["raw-fish", 120], ["tomato", 80], ["onion", 25], ["oil", 8], ["salt", 1]], 220],
  ["baked-fish-cheese", "Baked fish with cheese sauce", "चीज़ सॉस में बेक्ड फ़िश", ["baked fish", "fish mornay"], { piece: 180 }, "piece", [["raw-fish", 120], ["cheese-sauce", 80], ["butter", 3]], 180],
  ["fish-tikka", "Fish tikka", "फ़िश टिक्का", ["machli tikka"], { piece: 30 }, "piece", [["raw-fish", 120], ["curd", 25], ["besan", 5], ["lemon-juice", 5], ["oil", 6], ["salt", 1]], 120],
  ["hariyali-fish-tikka", "Hariyali fish tikka", "हरियाली फ़िश टिक्का", ["green fish tikka"], { piece: 30 }, "piece", [["raw-fish", 120], ["mint", 5], ["coriander", 8], ["curd", 20], ["oil", 6], ["salt", 1]], 125],
  ["tandoori-fish", "Tandoori fish", "तंदूरी फ़िश", ["fish tandoori"], { piece: 150 }, "piece", [["raw-fish", 150], ["curd", 30], ["lemon-juice", 5], ["oil", 7], ["salt", 1.2]], 150],
  ["macher-jhol", "Macher jhol", "माछेर झोल", ["bengal fish curry", "bengali machli curry", "machher jhol", "bengali fish curry"], { katori: 150 }, "katori", [["raw-fish", 120], ["raw-potato", 40], ["tomato", 30], ["oil", 12], ["salt", 1.2]], 260],
  ["fish-fingers", "Fish fingers", "फ़िश फ़िंगर्स", ["fish finger", "fish sticks"], { piece: 22 }, "piece", [["raw-fish", 100], ["bread-crumbs", 15], ["raw-egg", 15], ["maida", 5], ["oil", 12], ["salt", 0.8]], 130],
  ["fish-molee", "Fish in coconut milk", "नारियल दूध वाली मछली", ["fish molee", "meen moilee", "nariyal ke doodh ke saath machli"], { katori: 150 }, "katori", [["raw-fish", 120], ["coconut-milk", 80], ["onion", 25], ["oil", 7], ["salt", 1]], 230],
  ["baked-stuffed-fish", "Baked stuffed fish", "भरवां बेक्ड फ़िश", ["stuffed fish"], { piece: 160 }, "piece", [["raw-fish", 150], ["bread-crumbs", 15], ["onion", 15], ["butter", 8], ["salt", 1]], 160],
  ["fish-pie", "Fish pie", "फ़िश पाई", ["fish and potato pie"], { katori: 200 }, "katori", [["raw-fish", 100], ["white-sauce", 80], ["boiled-potato", 80], ["butter", 5], ["salt", 0.6]], 250],
  ["crispy-baked-fish", "Crispy baked fish", "क्रिस्पी बेक्ड फ़िश", ["oven fried fish"], { piece: 130 }, "piece", [["raw-fish", 120], ["bread-crumbs", 15], ["raw-egg", 10], ["oil", 6], ["salt", 0.8]], 130],
  ["fish-souffle", "Fish souffle", "फ़िश सूफ़ले", ["fish souffle baked"], { katori: 150 }, "katori", [["raw-fish", 80], ["white-sauce", 80], ["raw-egg", 50], ["butter", 3]], 190],
  ["fish-orly", "Fish orly", "फ़िश ऑर्ली", ["fish in batter", "batter fried fish"], { piece: 30 }, "piece", [["raw-fish", 120], ["maida", 20], ["raw-egg", 15], ["oil", 15], ["salt", 0.8]], 150],
  ["lemon-butter-fish", "Lemon butter fish", "लेमन बटर फ़िश", ["fish in lemon butter sauce"], { piece: 130 }, "piece", [["raw-fish", 130], ["butter", 12], ["lemon-juice", 10], ["salt", 0.8]], 130],
];
