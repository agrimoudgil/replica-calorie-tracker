import type { DishRow } from "../rows";

/*
 * Things made to cook with: stocks, sauces, dressings, doughs, icings, fillings, spice
 * mixes and tadkas. Other extra dishes use them as ingredients, so they come first.
 * Stocks count only part of what simmers in them (most stays in the strained-out pulp).
 */
export const BASE_ROWS: DishRow[] = [
  // Stocks (a katori is about 200 g)
  ["vegetable-stock", "Vegetable stock", "वेजिटेबल स्टॉक", ["veg stock"], { katori: 200 }, "katori", [["onion", 15], ["carrot", 15], ["celery", 8], ["tomato", 10], ["salt", 1]], 500],
  ["chicken-stock", "Chicken stock", "चिकन स्टॉक", ["chicken broth"], { katori: 200 }, "katori", [["raw-chicken", 40], ["onion", 15], ["carrot", 10], ["celery", 5], ["salt", 1]], 500],
  ["brown-stock", "Brown stock", "ब्राउन स्टॉक", ["beef stock", "brown meat stock"], { katori: 200 }, "katori", [["raw-mutton", 40], ["onion", 15], ["carrot", 10], ["tomato", 10], ["oil", 2], ["salt", 1]], 500],
  ["white-stock", "White stock", "व्हाइट स्टॉक", [], { katori: 200 }, "katori", [["raw-chicken", 35], ["onion", 10], ["celery", 5], ["salt", 1]], 500],
  ["mixed-stock", "Mixed stock", "मिक्स्ड स्टॉक", [], { katori: 200 }, "katori", [["raw-chicken", 20], ["raw-mutton", 20], ["onion", 15], ["carrot", 10], ["salt", 1]], 500],
  ["meat-stock", "Meat stock", "मीट स्टॉक", ["mutton stock", "mutton broth"], { katori: 200 }, "katori", [["raw-mutton", 50], ["onion", 15], ["carrot", 10], ["salt", 1]], 500],

  // Sauces (a tablespoon is about 15 g)
  ["white-sauce-thin", "White sauce (thin)", "व्हाइट सॉस (पतला)", ["thin white sauce"], { tbsp: 15, katori: 120 }, "tbsp", [["butter", 7], ["maida", 7], ["milk", 100], ["salt", 0.5]], 110],
  ["white-sauce", "White sauce (medium)", "व्हाइट सॉस", ["white sauce", "bechamel"], { tbsp: 15, katori: 120 }, "tbsp", [["butter", 14], ["maida", 14], ["milk", 100], ["salt", 0.5]], 120],
  ["white-sauce-thick", "White sauce (thick)", "व्हाइट सॉस (गाढ़ा)", ["thick white sauce"], { tbsp: 15 }, "tbsp", [["butter", 20], ["maida", 20], ["milk", 100], ["salt", 0.5]], 130],
  ["cheese-sauce", "Cheese sauce", "चीज़ सॉस", [], { tbsp: 15, katori: 120 }, "tbsp", [["white-sauce", 100], ["cheddar", 25]], 120],
  ["egg-sauce", "Egg sauce", "एग सॉस", [], { tbsp: 15 }, "tbsp", [["white-sauce", 100], ["boiled-egg", 50]], 145],
  ["mushroom-sauce", "Mushroom sauce", "मशरूम सॉस", [], { tbsp: 15 }, "tbsp", [["butter", 10], ["mushroom", 60], ["maida", 8], ["milk", 100], ["salt", 1]], 160],
  ["mustard-sauce", "Mustard sauce", "मस्टर्ड सॉस (सफ़ेद)", [], { tbsp: 15 }, "tbsp", [["white-sauce", 100], ["prepared-mustard", 10]], 108],
  ["brown-sauce", "Brown sauce", "ब्राउन सॉस", ["gravy sauce"], { tbsp: 15 }, "tbsp", [["brown-stock", 200], ["maida", 10], ["butter", 10], ["onion", 20], ["tomato", 20], ["salt", 1]], 180],
  ["tomato-pasta-sauce", "Tomato pasta sauce", "टमाटर पास्ता सॉस", ["marinara", "pasta sauce"], { tbsp: 15, katori: 120 }, "tbsp", [["tomato", 200], ["onion", 40], ["garlic", 5], ["oil", 8], ["sugar", 3], ["salt", 1.5]], 200],
  ["bolognese-sauce", "Bolognese sauce", "बोलोनीज़ सॉस", ["meat sauce"], { katori: 120 }, "katori", [["raw-mutton", 100], ["tomato-pasta-sauce", 150], ["onion", 20], ["oil", 5], ["salt", 1]], 240],
  ["kofta-gravy", "Gravy for kofta", "कोफ़्ता ग्रेवी", ["kofta gravy", "makhani gravy"], { katori: 120 }, "katori", [["onion", 60], ["tomato", 120], ["oil", 12], ["cream", 10], ["cashews", 8], ["ginger", 3], ["garlic", 3], ["salt", 2]], 250],
  ["bbq-sauce", "Barbeque sauce", "बार्बेक्यू सॉस", ["bbq sauce", "barbecue sauce"], { tbsp: 17 }, "tbsp", [["ketchup", 60], ["vinegar", 15], ["sugar", 15], ["soy-sauce", 5], ["onion", 10], ["oil", 5]], 100],
  ["bread-sauce", "Bread sauce", "ब्रेड सॉस", [], { tbsp: 15 }, "tbsp", [["milk", 150], ["white-bread", 30], ["butter", 8], ["onion", 10], ["salt", 1]], 180],
  ["green-chilli-sauce", "Green chilli sauce", "हरी मिर्च सॉस", ["chilli sauce"], { tbsp: 15 }, "tbsp", [["green-chilli", 50], ["vinegar", 30], ["sugar", 10], ["garlic", 5], ["salt", 3]], 85],
  ["hot-cherry-sauce", "Hot cherry sauce", "चेरी सॉस", ["cherry sauce"], { tbsp: 15 }, "tbsp", [["cherries", 100], ["sugar", 25], ["cornstarch", 5], ["lemon-juice", 5]], 120],
  ["chocolate-sauce", "Chocolate sauce", "चॉकलेट सॉस", [], { tbsp: 20 }, "tbsp", [["dark-chocolate", 50], ["cream", 30], ["sugar", 15], ["butter", 5], ["cocoa", 5]], 100],
  ["tomato-puree", "Tomato puree", "टमाटर प्यूरी", ["homemade tomato puree"], { tbsp: 16, katori: 120 }, "tbsp", [["tomato", 300], ["salt", 1]], 200],

  // Dressings and mayonnaise
  ["mayonnaise", "Mayonnaise", "मेयोनीज़", ["mayo", "egg mayonnaise"], { tbsp: 14 }, "tbsp", [["raw-egg", 20], ["oil", 100], ["vinegar", 5], ["lemon-juice", 5], ["prepared-mustard", 3], ["sugar", 1], ["salt", 1]], 134],
  ["eggless-mayonnaise", "Eggless mayonnaise", "एगलेस मेयोनीज़", ["mayonnaise without eggs", "veg mayonnaise"], { tbsp: 14 }, "tbsp", [["milk", 50], ["oil", 90], ["vinegar", 8], ["prepared-mustard", 3], ["sugar", 3], ["salt", 1]], 155],
  ["low-calorie-mayonnaise", "Low calorie quick mayonnaise", "हल्की मेयोनीज़", ["light mayonnaise", "curd mayonnaise"], { tbsp: 15 }, "tbsp", [["curd", 80], ["mayonnaise", 20], ["prepared-mustard", 3], ["salt", 0.5]], 103],
  ["french-dressing", "French dressing", "फ़्रेंच ड्रेसिंग", ["vinaigrette"], { tbsp: 15 }, "tbsp", [["oil", 60], ["vinegar", 20], ["lemon-juice", 10], ["sugar", 3], ["prepared-mustard", 3], ["salt", 2]], 98],
  ["curd-dressing", "Curd dressing", "दही ड्रेसिंग", ["yogurt dressing"], { tbsp: 15 }, "tbsp", [["curd", 100], ["oil", 5], ["lemon-juice", 5], ["sugar", 3], ["salt", 1]], 114],
  ["thousand-island-dressing", "Thousand island dressing", "थाउज़ेंड आइलैंड ड्रेसिंग", ["thousand island"], { tbsp: 15 }, "tbsp", [["mayonnaise", 60], ["ketchup", 25], ["onion", 10], ["boiled-egg", 15], ["salt", 0.5]], 110],
  ["tartare-sauce", "Tartare sauce", "टार्टर सॉस", ["tartar sauce"], { tbsp: 15 }, "tbsp", [["mayonnaise", 80], ["onion", 10], ["parsley", 3], ["lemon-juice", 5]], 98],

  // Doughs and pastry (weighed baked)
  ["short-crust-pastry", "Short crust pastry", "शॉर्ट क्रस्ट पेस्ट्री", ["shortcrust"], {}, "g", [["maida", 100], ["butter", 50], ["salt", 1]], 150],
  ["flan-pastry", "Flan pastry", "फ़्लैन पेस्ट्री", ["sweet pastry"], {}, "g", [["maida", 100], ["butter", 50], ["sugar", 20], ["raw-egg", 25]], 180],
  ["flaky-pastry", "Flaky pastry", "फ़्लेकी पेस्ट्री", ["puff pastry dough"], {}, "g", [["maida", 100], ["butter", 75], ["salt", 1]], 165],
  ["choux-pastry", "Choux pastry", "शू पेस्ट्री", [], {}, "g", [["maida", 60], ["butter", 50], ["raw-egg", 100], ["salt", 1]], 200],

  // Icings and fillings (a tablespoon is about 15 g)
  ["glace-icing", "Glace icing", "ग्लेस आइसिंग", ["water icing"], { tbsp: 15 }, "tbsp", [["sugar", 100], ["lemon-juice", 5]], 120],
  ["royal-icing", "Royal icing", "रॉयल आइसिंग", [], { tbsp: 15 }, "tbsp", [["sugar", 100], ["raw-egg", 30]], 125],
  ["american-frosting", "American frosting", "अमेरिकन फ़्रॉस्टिंग", ["boiled frosting"], { tbsp: 15 }, "tbsp", [["sugar", 150], ["raw-egg", 30], ["corn-syrup", 10]], 200],
  ["gum-icing", "Gum icing", "गम आइसिंग", ["gum paste"], { tbsp: 15 }, "tbsp", [["sugar", 100], ["corn-syrup", 20], ["gelatin", 3]], 130],
  ["butter-icing", "Butter icing", "बटर आइसिंग", ["buttercream"], { tbsp: 15 }, "tbsp", [["butter", 50], ["sugar", 100], ["milk", 10]], 160],
  ["chocolate-butter-icing", "Chocolate butter icing", "चॉकलेट बटर आइसिंग", ["chocolate buttercream"], { tbsp: 15 }, "tbsp", [["butter", 50], ["sugar", 100], ["cocoa", 10], ["milk", 10]], 170],
  ["chocolate-glace-icing", "Chocolate glace icing", "चॉकलेट ग्लेस आइसिंग", [], { tbsp: 15 }, "tbsp", [["sugar", 100], ["cocoa", 10], ["butter", 5]], 130],
  ["lemon-curd", "Lemon curd filling", "लेमन कर्ड", ["lemon curd"], { tbsp: 15 }, "tbsp", [["sugar", 60], ["butter", 30], ["raw-egg", 50], ["lemon-juice", 40], ["lemon-peel", 3]], 170],
  ["jam-filling", "Jam filling", "जैम फ़िलिंग", [], { tbsp: 15 }, "tbsp", [["jam", 80], ["butter", 10]], 90],

  // Spice mixes and tadkas (a tablespoon of powder is about 6 g)
  ["garam-masala", "Garam masala", "गरम मसाला", [], { tbsp: 6 }, "tbsp", [["coriander-seeds", 30], ["cumin-seeds", 30], ["black-pepper", 10], ["cardamom", 10], ["cinnamon", 10], ["cloves", 5], ["fennel-seeds", 5]], 98],
  ["chaat-masala", "Chaat masala", "चाट मसाला", ["chat masala"], { tbsp: 6 }, "tbsp", [["cumin-seeds", 30], ["salt", 30], ["black-pepper", 10], ["dry-ginger", 10], ["red-chilli-powder", 10], ["fennel-seeds", 5]], 94],
  ["kashmiri-masala", "Kashmiri masala", "कश्मीरी मसाला", ["ver masala"], { tbsp: 6 }, "tbsp", [["fennel-seeds", 30], ["dry-ginger", 25], ["red-chilli-powder", 15], ["cardamom", 10], ["cloves", 10], ["cinnamon", 10]], 98],
  ["rasam-powder", "Rasam powder", "रसम पाउडर", ["rasam masala"], { tbsp: 6 }, "tbsp", [["coriander-seeds", 40], ["cumin-seeds", 20], ["black-pepper", 20], ["red-chilli-powder", 10], ["raw-toor-dal", 10]], 98],
  ["sambar-powder", "Sambar powder", "सांबर पाउडर", ["sambar masala"], { tbsp: 6 }, "tbsp", [["coriander-seeds", 40], ["red-chilli-powder", 25], ["raw-chana-dal", 15], ["cumin-seeds", 10], ["fenugreek-seeds", 5], ["black-pepper", 5]], 98],
  ["pav-bhaji-masala", "Pav bhaji masala", "पाव भाजी मसाला", [], { tbsp: 6 }, "tbsp", [["coriander-seeds", 30], ["cumin-seeds", 20], ["red-chilli-powder", 20], ["fennel-seeds", 10], ["black-pepper", 10], ["cloves", 5], ["cinnamon", 5]], 98],
  // Nigella isn't in USDA; cumin stands in for it.
  ["panch-phoran", "Panch phoran", "पंच फोरन", ["bengal 5 spice blend", "panch phoron", "bengal five spice"], { tbsp: 7 }, "tbsp", [["cumin-seeds", 40], ["fennel-seeds", 20], ["mustard-seeds", 20], ["fenugreek-seeds", 20]], 100],
  ["jeera-tadka", "Jeera tadka", "जीरा तड़का", ["cumin seeds baghar", "jeera baghar", "zeera tadka"], { tbsp: 10 }, "tbsp", [["ghee", 15], ["cumin-seeds", 5]], 20],
  ["onion-tomato-tadka", "Onion tomato tadka", "प्याज़ टमाटर तड़का", ["onion tomato baghar", "pyaaz tamatar ka tadka"], { tbsp: 15 }, "tbsp", [["oil", 15], ["onion", 50], ["tomato", 50], ["salt", 1]], 90],
  ["mustard-tadka", "Mustard seed tadka", "राई का तड़का", ["mustard seeds baghar", "rai tadka"], { tbsp: 10 }, "tbsp", [["oil", 15], ["mustard-seeds", 5]], 20],

  // Dry premix, cooked into porridge
  ["dalia-moong-premix", "Dalia moong dal premix", "दलिया मूंग दाल प्रीमिक्स", ["cracked wheat and green gram dal premix"], { tbsp: 10, katori: 100 }, "tbsp", [["dalia", 60], ["raw-moong-dal", 40]], 98],

  // Custard sauce: a dessert of its own, and the base of trifle and other puddings
  ["soft-custard", "Soft custard", "सॉफ़्ट कस्टर्ड", ["stirred custard", "custard sauce", "soft custard stirred"], { katori: 120 }, "katori", [["milk", 250], ["raw-egg", 50], ["sugar", 25], ["cornstarch", 5]], 300],
];

/** Made to cook with: never suggested as a meal (soft custard and mayonnaise aren't here: people eat them). */
export const BASE_PREP_ONLY = BASE_ROWS.map(([id]) => id).filter((id) => !["soft-custard", "mayonnaise", "eggless-mayonnaise", "low-calorie-mayonnaise", "chocolate-sauce"].includes(id));
