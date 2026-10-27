import type { DishRow } from "../rows";

/*
 * Sandwiches and toasts. A piece is one sandwich: two slices of bread (about 25 g each)
 * unless it says three; an open sandwich is one slice. Cooked chicken weighs less than raw.
 */
export const SANDWICH_ROWS: DishRow[] = [
  ["cheese-chilli-sandwich", "Cheese chilli sandwich", "चीज़ चिली सैंडविच", ["cheese and chilli sandwich"], { piece: 78 }, "piece", [["white-bread", 50], ["cheese-slice", 20], ["green-chilli", 3], ["butter", 5]], 78],
  ["egg-sandwich", "Egg sandwich", "अंडा सैंडविच", ["ande ka sandwich", "egg mayo sandwich"], { piece: 113 }, "piece", [["white-bread", 50], ["boiled-egg", 50], ["mayonnaise", 10], ["butter", 3], ["salt", 0.3]], 113],
  ["cucumber-sandwich", "Cucumber sandwich", "खीरा सैंडविच", ["kheere ka sandwich"], { piece: 97 }, "piece", [["white-bread", 50], ["cucumber", 40], ["butter", 7], ["salt", 0.3]], 97],
  ["cheese-pineapple-sandwich", "Cheese pineapple sandwich", "चीज़ अनानास सैंडविच", ["cheese and pineapple sandwich", "cheese aur ananas ka sandwich"], { piece: 105 }, "piece", [["white-bread", 50], ["cheese-slice", 20], ["pineapple", 30], ["butter", 5]], 105],
  ["cheese-tomato-sandwich", "Cheese tomato sandwich", "चीज़ टमाटर सैंडविच", ["cheese and tomato sandwich", "cheese aur tamatar ke sandwich"], { piece: 105 }, "piece", [["white-bread", 50], ["cheese-slice", 20], ["tomato", 30], ["butter", 5]], 105],
  ["chicken-sandwich", "Chicken sandwich", "चिकन सैंडविच", ["chicken mayo sandwich"], { piece: 105 }, "piece", [["white-bread", 50], ["raw-chicken-breast", 50], ["mayonnaise", 10], ["lettuce", 10], ["salt", 0.3]], 105],
  ["peanut-tomato-sandwich", "Peanut tomato sandwich", "मूंगफली टमाटर सैंडविच", ["peanut and tomato sandwich", "moongfali aur tamatar ka sandwich"], { piece: 95 }, "piece", [["white-bread", 50], ["peanut-butter", 15], ["tomato", 30]], 95],
  ["rainbow-sandwich", "Rainbow sandwich", "रेनबो सैंडविच", ["tri colour sandwich"], { piece: 133 }, "piece", [["white-bread", 75], ["butter", 8], ["cheese-slice", 15], ["mint-chutney", 10], ["carrot", 15], ["beetroot", 10]], 133],
  ["club-sandwich", "Club sandwich", "क्लब सैंडविच", ["chicken club sandwich"], { piece: 170 }, "piece", [["white-bread", 75], ["raw-chicken-breast", 40], ["boiled-egg", 25], ["tomato", 20], ["lettuce", 10], ["mayonnaise", 12], ["butter", 5]], 170],
  ["veg-club-sandwich", "Veg club sandwich", "वेज क्लब सैंडविच", ["vegetarian club sandwich"], { piece: 172 }, "piece", [["white-bread", 75], ["cucumber", 25], ["tomato", 25], ["cheese-slice", 20], ["lettuce", 10], ["mayonnaise", 12], ["butter", 5]], 172],
  ["classic-club-sandwich", "Classic club sandwich", "क्लासिक क्लब सैंडविच", ["bacon club sandwich"], { piece: 160 }, "piece", [["white-bread", 75], ["bacon", 20], ["raw-chicken-breast", 40], ["tomato", 20], ["lettuce", 10], ["mayonnaise", 12]], 160],
  ["pinwheel-sandwich", "Pinwheel sandwich", "पिनव्हील सैंडविच", ["pin wheel sandwich"], { piece: 83 }, "piece", [["white-bread", 50], ["butter", 8], ["cheese-slice", 15], ["mint-chutney", 10]], 83],
  ["rolled-sandwich", "Rolled sandwich", "रोल्ड सैंडविच", ["sandwich roll ups"], { piece: 85 }, "piece", [["white-bread", 50], ["butter", 8], ["cheese-slice", 15], ["cucumber", 12]], 85],
  ["ribbon-sandwich", "Ribbon sandwich", "रिबन सैंडविच", ["layered sandwich"], { piece: 120 }, "piece", [["white-bread", 75], ["butter", 10], ["mint-chutney", 10], ["cheese-slice", 15], ["carrot", 10]], 120],
  ["checkerboard-sandwich", "Checkerboard sandwich", "चेकरबोर्ड सैंडविच", ["checker board sandwich"], { piece: 78 }, "piece", [["white-bread", 25], ["brown-bread", 28], ["butter", 10], ["cheese-slice", 15]], 78],
  ["carrot-apple-sandwich", "Carrot apple sandwich", "गाजर सेब सैंडविच", ["gajar aur seb ka sandwich"], { piece: 110 }, "piece", [["white-bread", 50], ["carrot", 25], ["apple", 25], ["mayonnaise", 10]], 110],
  ["salami-sandwich", "Salami sandwich", "सलामी सैंडविच", ["chicken salami sandwich"], { piece: 95 }, "piece", [["white-bread", 50], ["salami", 30], ["butter", 5], ["lettuce", 10]], 95],
  ["veg-mayo-sandwich", "Veg mayonnaise sandwich", "वेज मेयो सैंडविच", ["vegetable and mayonnaise sandwich", "veg mayo sandwich"], { piece: 115 }, "piece", [["white-bread", 50], ["cabbage", 20], ["carrot", 15], ["capsicum", 10], ["mayonnaise", 20]], 115],
  ["egg-tomato-sandwich", "Egg tomato sandwich", "अंडा टमाटर सैंडविच", ["egg and tomato sandwich", "ande aur tamatar ka sandwich"], { piece: 130 }, "piece", [["white-bread", 50], ["boiled-egg", 50], ["tomato", 25], ["butter", 5], ["salt", 0.3]], 130],
  ["tomato-cucumber-sandwich", "Tomato cucumber sandwich", "टमाटर खीरा सैंडविच", ["tomato and cucumber sandwich", "tamatar aur kheere ka sandwich"], { piece: 107 }, "piece", [["white-bread", 50], ["tomato", 25], ["cucumber", 25], ["butter", 7], ["salt", 0.3]], 107],
  ["pb-cucumber-sandwich", "Peanut butter cucumber sandwich", "पीनट बटर खीरा सैंडविच", ["peanut butter sandwich"], { piece: 95 }, "piece", [["white-bread", 50], ["peanut-butter", 15], ["cucumber", 30]], 95],
  ["mint-peanut-sandwich", "Mint peanut sandwich", "पुदीना मूंगफली सैंडविच", ["mint and peanut sandwich"], { piece: 80 }, "piece", [["white-bread", 50], ["mint-chutney", 15], ["peanuts", 10], ["butter", 5]], 80],
  ["chutney-sandwich", "Spicy chutney sandwich", "चटनी सैंडविच", ["chutney sandwich", "green chutney sandwich"], { piece: 92 }, "piece", [["white-bread", 50], ["mint-chutney", 20], ["cucumber", 15], ["butter", 7]], 92],
  ["chicken-walnut-sandwich", "Chicken walnut sandwich", "चिकन अखरोट सैंडविच", ["chicken aur akhrot ke sandwich"], { piece: 100 }, "piece", [["white-bread", 50], ["raw-chicken-breast", 40], ["walnuts", 8], ["mayonnaise", 12]], 100],
  ["submarine-sandwich", "Submarine sandwich", "सबमरीन सैंडविच", ["sub sandwich"], { piece: 180 }, "piece", [["pav", 80], ["raw-chicken-breast", 40], ["cheese-slice", 20], ["lettuce", 15], ["tomato", 20], ["mayonnaise", 15]], 180],
  ["prawn-sandwich", "Prawn sandwich", "झींगा सैंडविच", ["shrimp sandwich"], { piece: 110 }, "piece", [["white-bread", 50], ["raw-prawns", 50], ["mayonnaise", 12], ["lettuce", 10]], 110],
  ["watercress-sandwich", "Watercress sandwich", "वॉटरक्रेस सैंडविच", ["cress sandwich"], { piece: 93 }, "piece", [["white-bread", 50], ["watercress", 20], ["butter", 8], ["cream-cheese", 15]], 93],
  ["fish-sandwich", "Fish sandwich", "फ़िश सैंडविच", ["fish fillet sandwich"], { piece: 110 }, "piece", [["white-bread", 50], ["raw-fish", 50], ["mayonnaise", 10], ["oil", 4], ["lettuce", 10]], 110],
  ["rajma-paneer-sandwich", "Rajma paneer sandwich", "राजमा पनीर सैंडविच", ["kidney bean sandwich with cottage cheese", "kidney bean sandwich"], { piece: 125 }, "piece", [["white-bread", 50], ["boiled-rajma", 40], ["paneer", 20], ["onion", 10], ["butter", 5]], 125],

  // Toasted
  ["mushroom-cheese-sandwich", "Toasted mushroom cheese sandwich", "मशरूम चीज़ टोस्ट सैंडविच", ["mushroom and cheese sandwich", "mushroom cheese toast"], { piece: 110 }, "piece", [["white-bread", 50], ["mushroom", 40], ["cheese-slice", 20], ["butter", 8], ["salt", 0.3]], 110],
  ["toasted-cheese-tomato-sandwich", "Toasted cheese tomato sandwich", "टोस्टेड चीज़ टमाटर सैंडविच", ["grilled cheese tomato sandwich"], { piece: 105 }, "piece", [["white-bread", 50], ["cheese-slice", 20], ["tomato", 30], ["butter", 8]], 105],
  ["aloo-matar-sandwich", "Toasted aloo matar sandwich", "आलू मटर सैंडविच", ["pea potato sandwich", "matar aloo ka sandwich", "aloo sandwich"], { piece: 110 }, "piece", [["white-bread", 50], ["boiled-potato", 40], ["green-peas", 15], ["butter", 8], ["salt", 0.5]], 110],
  ["paneer-matar-sandwich", "Toasted paneer matar sandwich", "पनीर मटर सैंडविच", ["paneer pea sandwich", "paneer matar ka sandwich"], { piece: 100 }, "piece", [["white-bread", 50], ["paneer", 30], ["green-peas", 15], ["butter", 8], ["salt", 0.5]], 100],
  ["toasted-chicken-sandwich", "Toasted chicken sandwich", "टोस्टेड चिकन सैंडविच", ["grilled chicken sandwich"], { piece: 105 }, "piece", [["white-bread", 50], ["raw-chicken-breast", 50], ["onion", 10], ["butter", 8], ["salt", 0.4]], 105],
  ["keema-matar-sandwich", "Toasted keema matar sandwich", "कीमा मटर सैंडविच", ["pea keema sandwich", "matar aur keema ka sandwich", "keema sandwich"], { piece: 116 }, "piece", [["white-bread", 50], ["keema", 60], ["butter", 6]], 116],
  ["grilled-tomato-sandwich", "Grilled tomato sandwich", "ग्रिल्ड टमाटर सैंडविच", ["tomato sandwich grilled", "tomato sandwich"], { piece: 95 }, "piece", [["white-bread", 50], ["tomato", 40], ["butter", 8], ["salt", 0.3]], 95],
  ["french-toast", "French toast", "फ़्रेंच टोस्ट", ["french sandwich", "eggy bread", "bread egg toast"], { piece: 125 }, "piece", [["white-bread", 50], ["raw-egg", 50], ["milk", 20], ["butter", 8], ["sugar", 5]], 125],
  ["cheese-toast", "Cheese toast", "चीज़ टोस्ट", ["cheese chilli toast"], { piece: 45 }, "piece", [["white-bread", 25], ["cheese-slice", 15], ["butter", 5]], 45],
  ["sesame-toast", "Sesame toast", "तिल टोस्ट", ["til toast"], { piece: 48 }, "piece", [["white-bread", 50], ["raw-potato", 30], ["sesame", 8], ["oil", 10], ["salt", 0.4]], 95],
  ["bread-roll", "Bread roll", "ब्रेड रोल", ["aloo bread roll", "stuffed bread roll"], { piece: 75 }, "piece", [["white-bread", 25], ["boiled-potato", 40], ["onion", 5], ["oil", 8], ["salt", 0.4]], 75],

  // Open sandwiches (one slice)
  ["sweet-open-sandwich", "Sweet open sandwich", "मीठा ओपन सैंडविच", ["banana jam toast"], { piece: 75 }, "piece", [["white-bread", 25], ["butter", 5], ["jam", 15], ["banana", 30]], 75],
  ["cheese-open-sandwich", "Cheese open sandwich", "चीज़ ओपन सैंडविच", ["open cheese sandwich"], { piece: 64 }, "piece", [["white-bread", 25], ["cheddar", 20], ["tomato", 15], ["butter", 4]], 64],
  ["sunrise-open-sandwich", "Sunrise open sandwich", "सनराइज़ ओपन सैंडविच", ["sunset and sunrise open sandwich", "egg open sandwich"], { piece: 77 }, "piece", [["white-bread", 25], ["boiled-egg", 25], ["tomato", 15], ["mayonnaise", 8], ["butter", 4]], 77],
  ["danish-luncheon-sandwich", "Danish luncheon sandwich", "डेनिश सैंडविच", ["smorrebrod", "danish open sandwich"], { piece: 70 }, "piece", [["brown-bread", 28], ["ham", 15], ["cheese-slice", 15], ["lettuce", 8], ["butter", 4]], 70],
  ["chicken-corn-open-sandwich", "Chicken corn open sandwich", "चिकन कॉर्न ओपन सैंडविच", ["chicken and corn open sandwich"], { piece: 75 }, "piece", [["white-bread", 25], ["raw-chicken-breast", 30], ["sweet-corn", 15], ["white-sauce", 15]], 75],
];
