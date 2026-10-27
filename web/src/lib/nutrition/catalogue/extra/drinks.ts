import type { DishRow } from "../rows";

/* Drinks, per glass (250 g unless the drink is usually served in a smaller cup). Water isn't listed. */
export const DRINK_ROWS: DishRow[] = [
  // Tea and coffee
  ["instant-coffee-milk", "Instant coffee (with milk)", "इंस्टेंट कॉफ़ी", ["instant coffee", "nescafe coffee"], { glass: 150 }, "glass", [["instant-coffee", 2], ["milk", 100], ["sugar", 6]], 150],
  ["espresso-coffee", "Espresso coffee (beaten)", "फेंटी हुई कॉफ़ी", ["espresso coffee", "espresso", "beaten coffee", "espreso coffee"], { glass: 150 }, "glass", [["instant-coffee", 2], ["sugar", 8], ["milk", 120]], 150],
  ["iced-tea", "Iced tea", "आइस्ड टी", ["ice tea", "lemon iced tea"], { glass: 250 }, "glass", [["sugar", 15], ["lemon-juice", 10]], 250],
  ["kashmiri-kehwa", "Kashmiri kehwa", "कश्मीरी कहवा", ["kehwa", "kahwa", "kashmiri tea"], { glass: 150 }, "glass", [["sugar", 8], ["almonds", 5], ["cardamom", 0.5], ["cinnamon", 0.5]], 150],
  ["hot-cocoa", "Hot cocoa", "हॉट कोको", ["cocoa milk"], { glass: 200 }, "glass", [["milk", 200], ["cocoa", 6], ["sugar", 12]], 215],
  ["hot-chocolate", "Hot chocolate", "हॉट चॉकलेट", ["drinking chocolate"], { glass: 200 }, "glass", [["milk", 200], ["dark-chocolate", 20], ["sugar", 8]], 225],
  ["cold-coffee-ice-cream", "Cold coffee with ice cream", "आइसक्रीम वाली कोल्ड कॉफ़ी", ["cold coffee with a scoop"], { glass: 250 }, "glass", [["milk", 180], ["instant-coffee", 3], ["sugar", 15], ["ice-cream", 60]], 260],

  // Milkshakes and milk drinks
  ["pineapple-milkshake", "Pineapple milkshake", "अनानास मिल्कशेक", ["ananas milkshake", "pineapple shake"], { glass: 250 }, "glass", [["milk", 180], ["pineapple", 80], ["sugar", 15]], 275],
  ["orange-milkshake", "Orange milkshake", "संतरा मिल्कशेक", ["narangi milkshake", "orange shake"], { glass: 250 }, "glass", [["milk", 180], ["orange-juice", 70], ["sugar", 15]], 265],
  ["banana-milkshake-ice-cream", "Banana milkshake with ice cream", "आइसक्रीम वाला केला शेक", ["kele ka milkshake ice cream ke saath"], { glass: 250 }, "glass", [["milk", 150], ["banana", 100], ["sugar", 10], ["ice-cream", 60]], 320],
  ["mango-milkshake-ice-cream", "Mango milkshake with ice cream", "आइसक्रीम वाला मैंगो शेक", ["aam milkshake ice cream ke saath"], { glass: 250 }, "glass", [["milk", 150], ["mango", 100], ["sugar", 10], ["ice-cream", 60]], 320],
  ["pineapple-milkshake-ice-cream", "Pineapple milkshake with ice cream", "आइसक्रीम वाला अनानास शेक", ["ananas milkshake ice cream ke saath"], { glass: 250 }, "glass", [["milk", 150], ["pineapple", 80], ["sugar", 10], ["ice-cream", 60]], 300],
  ["orange-milkshake-ice-cream", "Orange milkshake with ice cream", "आइसक्रीम वाला संतरा शेक", ["narangi milkshake ice cream ke saath"], { glass: 250 }, "glass", [["milk", 150], ["orange-juice", 70], ["sugar", 10], ["ice-cream", 60]], 290],
  ["flavoured-milk", "Flavoured milk", "फ्लेवर्ड मिल्क", ["flavoured milkshake", "rose milk"], { glass: 250 }, "glass", [["milk", 230], ["sugar", 18]], 250],
  ["egg-nog", "Egg nog", "एग नॉग", ["eggnog"], { glass: 250 }, "glass", [["milk", 180], ["raw-egg", 50], ["sugar", 20], ["nutmeg", 0.5]], 250],
  ["thandai", "Thandai", "ठंडाई", ["sardai"], { glass: 250 }, "glass", [["milk", 200], ["sugar", 20], ["almonds", 8], ["pistachios", 3], ["fennel-seeds", 2], ["black-pepper", 0.5], ["cardamom", 0.5]], 235],
  ["kesariya-doodh", "Kesariya doodh", "केसरिया दूध", ["saffron milk", "kesar milk", "kesar doodh"], { glass: 200 }, "glass", [["milk", 200], ["sugar", 15], ["almonds", 5], ["pistachios", 3]], 220],
  ["thari-kanji", "Thari kanji", "थरी कांजी", ["semolina milk drink", "rava kanji"], { glass: 200 }, "glass", [["suji", 15], ["milk", 150], ["sugar", 12], ["ghee", 3]], 220],
  ["apple-oats-chia-smoothie", "Apple oats chia smoothie", "सेब ओट्स चिया स्मूदी", ["apple smoothie", "oats smoothie", "apple oats chia seed smoothie"], { glass: 250 }, "glass", [["apple", 100], ["oats", 15], ["chia", 5], ["milk", 150], ["honey", 8]], 280],

  // Coolers and sharbat
  ["aam-panna", "Aam panna", "आम पन्ना", ["raw mango drink", "kairi panna", "aam jhora"], { glass: 250 }, "glass", [["mango", 60], ["sugar", 20], ["salt", 1], ["cumin-seeds", 1]], 250], // raw mango isn't in USDA; ripe mango stands in
  ["fruit-punch", "Fruit punch", "फ्रूट पंच", ["fruit punch with fresh juices"], { glass: 250 }, "glass", [["orange-juice", 100], ["pineapple", 60], ["lemon-juice", 10], ["sugar", 10]], 250],
  ["fruit-punch-squash", "Fruit punch (with squashes)", "स्क्वैश वाला फ्रूट पंच", ["squash punch"], { glass: 250 }, "glass", [["sugar", 25], ["orange-juice", 30], ["lemon-juice", 10]], 250],
  ["lem-o-gin", "Lem-o-gin", "लेमन जिंजर ड्रिंक", ["lemon ginger drink", "nimbu adrak sharbat"], { glass: 250 }, "glass", [["lemon-juice", 15], ["ginger", 5], ["sugar", 18], ["salt", 0.5]], 250],
  ["gingo", "Gingo (ginger lemonade)", "अदरक नींबू पानी", ["gingo", "ginger lemonade"], { glass: 250 }, "glass", [["ginger", 10], ["lemon-juice", 15], ["sugar", 20], ["salt", 0.5]], 250],
  ["mintade", "Mintade (mint lemonade)", "पुदीना शरबत", ["mintade", "mint lemonade", "pudina sharbat"], { glass: 250 }, "glass", [["mint", 5], ["lemon-juice", 15], ["sugar", 20], ["salt", 0.5]], 250],
  ["jeera-pani", "Jeera pani", "जीरा पानी", ["cumin water", "jeere ka pani", "zeere ka pani", "cumin infused water"], { glass: 200 }, "glass", [["cumin-seeds", 3], ["lemon-juice", 10], ["sugar", 5], ["salt", 1]], 200],
  ["jal-jeera", "Jal jeera", "जलजीरा", ["jaljeera"], { glass: 250 }, "glass", [["cumin-seeds", 3], ["mint", 3], ["tamarind", 5], ["lemon-juice", 10], ["sugar", 5], ["salt", 2]], 250],
  ["coco-pine-cooler", "Coco pine cooler", "कोको पाइन कूलर", ["coconut pineapple cooler"], { glass: 250 }, "glass", [["coconut-water", 150], ["pineapple", 60], ["sugar", 5], ["lemon-juice", 5]], 230],
  ["summer-cooler", "Summer cooler", "समर कूलर", ["watermelon cooler"], { glass: 250 }, "glass", [["watermelon", 100], ["orange-juice", 60], ["lemon-juice", 10], ["mint", 2], ["sugar", 10]], 250],
  ["bel-sharbat", "Bel sharbat", "बेल का शरबत", ["bel ka sharbat", "bael sharbat", "woodapple juice", "wood apple juice"], { glass: 250 }, "glass", [["mango", 60], ["sugar", 20], ["salt", 0.5]], 250], // bel isn't in USDA; ripe mango pulp stands in
  ["sattu-drink", "Sattu drink", "सत्तू शरबत", ["sattu sharbat", "sattu", "sattu ka sharbat"], { glass: 250 }, "glass", [["roasted-chana", 25], ["lemon-juice", 10], ["salt", 1.5], ["cumin-seeds", 1]], 250],
  ["apple-honey-sharbat", "Apple and honey sharbat", "सेब और शहद का शरबत", ["apple honey sorbet", "seb aur shehad ka sharbat"], { glass: 250 }, "glass", [["apple", 100], ["honey", 15], ["lemon-juice", 5]], 250],
  ["cucumber-sharbat", "Cucumber sharbat", "खीरे का शरबत", ["kheere ka sharbat", "cucumber cooler"], { glass: 250 }, "glass", [["cucumber", 100], ["sugar", 15], ["lemon-juice", 10], ["mint", 2], ["salt", 0.5]], 250],
  ["nannari-sharbat", "Nannari sharbat", "नन्नारी शरबत", ["sarsaparilla sharbat", "nannari"], { glass: 250 }, "glass", [["sugar", 30], ["lemon-juice", 10]], 250],

  // Squash, ready to drink (concentrate and water)
  ["lemon-squash", "Lemon squash", "नींबू स्क्वैश", ["nimbu ka squash"], { glass: 250 }, "glass", [["lemon-juice", 12], ["sugar", 28]], 250],
  ["orange-squash", "Orange squash", "संतरा स्क्वैश", ["santre ka squash"], { glass: 250 }, "glass", [["orange-juice", 50], ["sugar", 25]], 250],
  ["litchi-squash", "Litchi squash", "लीची स्क्वैश", ["lichi squash", "lychee squash"], { glass: 250 }, "glass", [["litchi", 40], ["sugar", 25]], 250],
  ["mango-squash", "Mango squash", "आम स्क्वैश", ["aam ka squash"], { glass: 250 }, "glass", [["mango", 50], ["sugar", 25]], 250],
  ["pineapple-squash", "Pineapple squash", "अनानास स्क्वैश", ["ananas ka squash"], { glass: 250 }, "glass", [["pineapple", 50], ["sugar", 25]], 250],
  ["lemon-ginger-squash", "Lemon and ginger squash", "नींबू अदरक स्क्वैश", ["nimbu aur adrak ka squash"], { glass: 250 }, "glass", [["lemon-juice", 12], ["ginger", 5], ["sugar", 25]], 250],
  ["plum-squash", "Plum squash", "आलूबुखारा स्क्वैश", ["aloo bukhara squash"], { glass: 250 }, "glass", [["plum", 50], ["sugar", 25]], 250],
];
