import type { DishRow } from "../rows";

/*
 * Chutneys (a tablespoon is about 15 g), pickles (about 10 g) and jams, murabbas and
 * preserves (about 20 g). Raw mango isn't in USDA; ripe mango stands in for it.
 */
export const CHUTNEY_ROWS: DishRow[] = [
  ["saunth-chutney", "Saunth chutney", "सोंठ की चटनी", ["imli chutney", "tamarind chutney", "saunth", "saunth chutney with tamarind", "meethi chutney", "sonth chutney with imli"], { tbsp: 20 }, "tbsp", [["tamarind", 40], ["jaggery", 40], ["sugar", 10], ["dry-ginger", 2], ["salt", 2]], 120],
  ["saunth-ginger-chutney", "Saunth chutney with ginger", "अदरक वाली सोंठ चटनी", ["sonth chutney", "saunth chutney with ginger"], { tbsp: 20 }, "tbsp", [["dry-ginger", 5], ["jaggery", 50], ["tamarind", 20], ["salt", 2]], 100],
  ["puli-chutney", "Puli chutney", "पुली चटनी", ["chintapandu pachadi", "tamarind pachadi", "puli thokku"], { tbsp: 15 }, "tbsp", [["tamarind", 40], ["jaggery", 20], ["red-chilli-powder", 3], ["oil", 4], ["mustard-seeds", 1], ["salt", 2]], 90],
  ["dry-mango-chutney", "Sookhe aam ki chutney", "सूखे आम की चटनी", ["dry mango chutney", "aam ki launji"], { tbsp: 15 }, "tbsp", [["mango", 50], ["jaggery", 50], ["fennel-seeds", 2], ["salt", 2]], 90],
  ["raw-mango-chutney", "Kairi ki chutney", "कैरी की चटनी", ["raw mango chutney", "kachhe aam ki chutney", "aam ki chutney"], { tbsp: 15 }, "tbsp", [["mango", 100], ["sugar", 30], ["cumin-seeds", 1], ["salt", 1.5]], 110],
  ["peanut-chutney", "Peanut chutney", "मूंगफली की चटनी", ["mungfali ki chutney", "shenga chutney", "groundnut chutney"], { tbsp: 15 }, "tbsp", [["peanuts", 40], ["green-chilli", 3], ["tamarind", 5], ["oil", 2], ["salt", 1.5]], 90],
  ["tomato-ginger-chutney", "Tomato ginger chutney", "टमाटर अदरक चटनी", ["tamatar adarak ki chutney"], { tbsp: 15 }, "tbsp", [["tomato", 100], ["ginger", 10], ["sugar", 10], ["oil", 4], ["salt", 1.5]], 90],
  ["mint-tomato-chutney", "Mint tomato chutney", "पुदीना टमाटर चटनी", ["pudinay aur tamatar ki chutney"], { tbsp: 15 }, "tbsp", [["mint", 15], ["tomato", 60], ["onion", 10], ["sugar", 3], ["salt", 1]], 85],
  ["amla-chutney", "Amla chutney", "आंवला चटनी", ["gooseberry chutney", "amla ki chutney"], { tbsp: 15 }, "tbsp", [["amla", 60], ["coriander", 10], ["green-chilli", 3], ["sugar", 5], ["salt", 1.5]], 80],
  ["walnut-chutney", "Akhrot ki chutney", "अखरोट की चटनी", ["walnut chutney", "doon chetin"], { tbsp: 15 }, "tbsp", [["walnuts", 30], ["curd", 40], ["mint", 3], ["green-chilli", 2], ["salt", 1]], 76],
  ["dry-coconut-chutney", "Desiccated coconut chutney", "सूखे नारियल की चटनी", ["dessicated coconut chutney", "sookhe kase nariyal ki chutney", "dry coconut chutney"], { tbsp: 15 }, "tbsp", [["desiccated-coconut", 30], ["roasted-chana", 10], ["curd", 20], ["green-chilli", 3], ["salt", 1.5]], 90],
  ["podi", "Gunpowder chutney (podi)", "पोड़ी", ["gun powder chutney", "milagai podi", "idli podi", "podi"], { tbsp: 8 }, "tbsp", [["raw-urad-dal", 40], ["raw-chana-dal", 30], ["sesame", 10], ["red-chilli-powder", 10], ["oil", 5], ["salt", 5]], 95],
  ["garlic-chutney", "Lahsun ki chutney", "लहसुन की चटनी", ["garlic chutney", "poondu chutney", "lasun chutney"], { tbsp: 10 }, "tbsp", [["garlic", 40], ["red-chilli-powder", 10], ["tamarind", 5], ["oil", 10], ["salt", 3]], 65],
  ["schezwan-chutney", "Schezwan chutney", "शेज़वान चटनी", ["schezwan sauce", "szechuan sauce"], { tbsp: 15 }, "tbsp", [["red-chilli-powder", 15], ["garlic", 25], ["oil", 40], ["soy-sauce", 10], ["vinegar", 10], ["sugar", 5], ["salt", 2]], 100],
  ["onion-chutney", "Onion chutney", "प्याज़ की चटनी", ["pyaaz ki chutney", "vengaya chutney", "ulli chutney"], { tbsp: 15 }, "tbsp", [["onion", 100], ["tamarind", 5], ["red-chilli-powder", 3], ["oil", 6], ["salt", 1.5]], 90],
  ["dates-chutney", "Khajoor ki chutney", "खजूर की चटनी", ["dates chutney", "khajoor imli chutney", "date chutney"], { tbsp: 15 }, "tbsp", [["dates", 60], ["tamarind", 20], ["jaggery", 15], ["salt", 1.5]], 110],
  ["plum-chutney", "Aloo bukhara chutney", "आलूबुखारा चटनी", ["plum chutney", "aloo bukhara ki chutney"], { tbsp: 15 }, "tbsp", [["plum", 100], ["sugar", 40], ["salt", 1]], 110],
];

/** Pickles, jams and murabbas: eaten a spoonful at a time, never suggested as a meal. */
export const PRESERVE_ROWS: DishRow[] = [
  // Pickles
  ["mango-pickle", "Aam ka achaar", "आम का अचार", ["mango pickle", "aam achar", "avakaya"], { tbsp: 10 }, "tbsp", [["mango", 100], ["oil", 30], ["salt", 12], ["mustard-seeds", 5], ["fenugreek-seeds", 3], ["red-chilli-powder", 5]], 150],
  ["mixed-veg-pickle", "Mixed vegetable pickle", "मिक्स सब्ज़ी का अचार", ["sabziyon ka achaar", "mixed pickle", "mix achar"], { tbsp: 10 }, "tbsp", [["carrot", 35], ["cauliflower", 35], ["turnip", 30], ["oil", 25], ["salt", 10], ["mustard-seeds", 4], ["red-chilli-powder", 4]], 140],
  ["amla-pickle", "Amla achaar", "आंवले का अचार", ["gooseberry pickle", "amla ka achaar"], { tbsp: 10 }, "tbsp", [["amla", 100], ["oil", 20], ["salt", 8], ["mustard-seeds", 3], ["red-chilli-powder", 3]], 130],
  ["lotus-stem-pickle", "Kamal kakdi ka achaar", "कमल ककड़ी का अचार", ["lotus stem pickle"], { tbsp: 10 }, "tbsp", [["lotus-stem", 100], ["oil", 20], ["vinegar", 10], ["salt", 8], ["mustard-seeds", 3], ["red-chilli-powder", 3]], 140],
  ["date-pickle", "Khajoor ka achaar", "खजूर का अचार", ["date pickle", "dates pickle"], { tbsp: 10 }, "tbsp", [["dates", 100], ["vinegar", 20], ["sugar", 15], ["salt", 5], ["red-chilli-powder", 3]], 140],
  ["garlic-pickle", "Lahsun ka achaar", "लहसुन का अचार", ["garlic pickle", "lasun achar"], { tbsp: 10 }, "tbsp", [["garlic", 100], ["oil", 25], ["vinegar", 10], ["salt", 8], ["red-chilli-powder", 4]], 145],
  ["bamboo-shoot-pickle", "Bamboo shoot pickle", "बांस का अचार", ["mesu pickle", "fermented bamboo shoot pickle", "bamboo pickle"], { tbsp: 10 }, "tbsp", [["bamboo-shoot", 100], ["oil", 15], ["salt", 7], ["red-chilli-powder", 3]], 125],
  ["peach-pickle", "Aadoo ka achaar", "आड़ू का अचार", ["sweet peach pickle", "peach pickle"], { tbsp: 10 }, "tbsp", [["peach", 100], ["sugar", 40], ["vinegar", 15], ["salt", 3]], 155],
  ["mustard-greens-pickle", "Pickled mustard greens", "सरसों साग का अचार", ["mustard greens pickle"], { tbsp: 10 }, "tbsp", [["sarson", 100], ["vinegar", 20], ["sugar", 5], ["salt", 6]], 130],
  ["pickled-onions", "Pickled onions", "सिरके वाले प्याज़", ["small onion pickle", "sirka pyaz", "vinegar onions"], { tbsp: 10 }, "tbsp", [["onion", 100], ["vinegar", 40], ["sugar", 4], ["salt", 4]], 148],
  ["green-tomato-pickle", "Green tomato pickle", "हरे टमाटर का अचार", ["haray tamatar ka achaar"], { tbsp: 10 }, "tbsp", [["tomato", 100], ["oil", 15], ["sugar", 10], ["salt", 6], ["red-chilli-powder", 3]], 130],
  ["pickled-cabbage", "Pickled cabbage", "पत्तागोभी का अचार", ["cabbage pickle"], { tbsp: 10 }, "tbsp", [["cabbage", 100], ["vinegar", 30], ["sugar", 5], ["salt", 4]], 135],
  ["coconut-pickle", "Nariyal ka achaar", "नारियल का अचार", ["coconut pickle"], { tbsp: 10 }, "tbsp", [["coconut", 100], ["oil", 15], ["tamarind", 10], ["salt", 6], ["red-chilli-powder", 3]], 130],
  ["potato-pickle", "Aloo ka achaar", "आलू का अचार", ["potato pickle"], { tbsp: 10 }, "tbsp", [["boiled-potato", 100], ["oil", 20], ["lemon-juice", 10], ["salt", 5], ["red-chilli-powder", 3]], 135],
  ["sweet-lemon-pickle", "Meetha nimbu achaar", "मीठा नींबू अचार", ["sweet lemon pickle", "neembu ka meetha achaar"], { tbsp: 10 }, "tbsp", [["lemon-peel", 50], ["lemon-juice", 50], ["sugar", 60], ["salt", 8]], 165],
  ["lemon-chilli-pickle", "Nimbu mirch achaar", "नींबू मिर्च अचार", ["lemon green chilli pickle", "nimboo aur hari mirch ka achaar"], { tbsp: 10 }, "tbsp", [["lemon-peel", 40], ["lemon-juice", 40], ["green-chilli", 30], ["oil", 5], ["salt", 10]], 125],
  ["brinjal-pickle", "Baingan ka achaar", "बैंगन का अचार", ["brinjal pickle", "eggplant pickle"], { tbsp: 10 }, "tbsp", [["brinjal", 100], ["oil", 25], ["tamarind", 10], ["sugar", 5], ["salt", 7], ["red-chilli-powder", 4]], 150],
  ["tomato-pickle", "Khatta meetha tamatar achaar", "खट्टा मीठा टमाटर अचार", ["sweet and sour tomato pickle", "tomato pickle"], { tbsp: 10 }, "tbsp", [["tomato", 120], ["sugar", 30], ["oil", 10], ["salt", 5], ["red-chilli-powder", 3]], 140],
  ["instant-carrot-pickle", "Instant carrot pickle", "झटपट गाजर का अचार", ["jhatpat achaar", "jhatpat achar with carrot", "gajar ka achaar", "carrot pickle"], { tbsp: 10 }, "tbsp", [["carrot", 100], ["oil", 10], ["lemon-juice", 10], ["mustard-seeds", 4], ["salt", 4]], 128],

  // Jams, jellies and murabbas
  ["apple-jam", "Apple jam", "सेब का मुरब्बा", ["seb ka murabba", "apple murabba"], { tbsp: 20 }, "tbsp", [["apple", 100], ["sugar", 75], ["lemon-juice", 3]], 140],
  ["apple-jelly", "Apple jelly", "सेब की जेली", ["seb ki jelly"], { tbsp: 20 }, "tbsp", [["apple", 100], ["sugar", 75], ["lemon-juice", 3]], 135],
  ["plum-jam", "Plum jam", "आलूबुखारा जैम", ["aloo bukhara jam"], { tbsp: 20 }, "tbsp", [["plum", 100], ["sugar", 75]], 140],
  ["pineapple-jam", "Pineapple jam", "अनानास जैम", ["ananas jam"], { tbsp: 20 }, "tbsp", [["pineapple", 100], ["sugar", 75]], 140],
  ["guava-jelly", "Guava jelly", "अमरूद की जेली", ["amrood ki jelly"], { tbsp: 20 }, "tbsp", [["guava", 100], ["sugar", 75], ["lemon-juice", 3]], 140],
  ["orange-marmalade", "Orange marmalade", "संतरे का मुरब्बा", ["marmalade", "santray ka murabba", "marmalade murabba"], { tbsp: 20 }, "tbsp", [["orange", 80], ["orange-peel", 15], ["sugar", 80]], 140],
  ["peach-blueberry-preserve", "Peach blueberry preserves", "आड़ू ब्लूबेरी प्रिज़र्व", ["peach blueberry jam"], { tbsp: 20 }, "tbsp", [["peach", 60], ["blueberries", 40], ["sugar", 70], ["lemon-juice", 5]], 140],
  ["pear-murabba", "Nashpati ka murabba", "नाशपाती का मुरब्बा", ["pear preserves", "pear murabba"], { tbsp: 20 }, "tbsp", [["pear", 100], ["sugar", 70]], 140],
  ["starfruit-preserve", "Starfruit preserves", "कमरख का मुरब्बा", ["kamrakh murabba", "starfruit jam"], { tbsp: 20 }, "tbsp", [["starfruit", 100], ["sugar", 70]], 140],
  ["mango-murabba", "Aam murabba", "आम का मुरब्बा", ["mango murabba candy", "mango murabba"], { tbsp: 20 }, "tbsp", [["mango", 100], ["sugar", 80]], 140],
  ["carrot-murabba", "Gajar ka murabba", "गाजर का मुरब्बा", ["carrot murabba"], { tbsp: 20 }, "tbsp", [["carrot", 100], ["sugar", 80]], 140],
  ["amla-murabba", "Amla murabba", "आंवले का मुरब्बा", ["gooseberry marmalade", "amla ka murabba"], { tbsp: 20 }, "tbsp", [["amla", 100], ["sugar", 80]], 140],
  ["ginger-candy", "Adrak candy", "अदरक कैंडी", ["ginger candy", "adrak ki candy"], { piece: 5, tbsp: 10 }, "piece", [["ginger", 50], ["sugar", 60]], 85],
];
