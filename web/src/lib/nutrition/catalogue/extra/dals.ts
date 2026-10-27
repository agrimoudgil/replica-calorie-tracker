import type { DishRow } from "../rows";

/* Dals and other pulses, per katori (about 150 g). Raw pulses take about five times their weight in water. */
export const DAL_ROWS: DishRow[] = [
  ["chana-dal-lauki", "Chana dal lauki", "चना दाल लौकी", ["channa dal with ghiya", "chana dal with lauki", "lauki chana dal", "split bengal gram with bottle gourd"], { katori: 150 }, "katori", [["raw-chana-dal", 40], ["lauki", 80], ["onion", 15], ["tomato", 20], ["oil", 5], ["salt", 1.2]], 260],
  ["sookhi-urad-dal", "Sookhi urad dal", "सूखी उड़द दाल", ["dry washed urad", "dry urad dal", "urad dal dry"], { katori: 100 }, "katori", [["raw-urad-dal", 50], ["ghee", 6], ["ginger", 3], ["salt", 1]], 130],
  ["sabut-moong-dal", "Sabut moong dal", "साबुत मूंग दाल", ["whole moong dal", "moong ki dal", "sabut moong dal with tadka", "green gram whole with baghar", "whole moong"], { katori: 150 }, "katori", [["raw-whole-moong", 45], ["onion", 15], ["tomato", 20], ["oil", 5], ["salt", 1.2]], 280],
  ["sabut-masoor-dal", "Sabut masoor dal", "साबुत मसूर दाल", ["whole masoor", "whole masoor dal", "kali masoor"], { katori: 150 }, "katori", [["raw-masoor-dal", 45], ["onion", 15], ["tomato", 20], ["oil", 5], ["salt", 1.2]], 280],
  ["moth-dal", "Moth ki dal", "मोठ की दाल", ["whole moth", "moth dal", "matki dal", "matki usal"], { katori: 150 }, "katori", [["raw-moth", 45], ["onion", 15], ["tomato", 20], ["oil", 5], ["salt", 1.2]], 280],
  ["sabut-urad-dal", "Sabut urad dal", "साबुत उड़द दाल", ["whole urad", "urad ki dal", "urad sabut special", "kaali dal", "whole urad dal"], { katori: 150 }, "katori", [["raw-urad-dal", 45], ["onion", 15], ["tomato", 20], ["ghee", 6], ["salt", 1.2]], 280],
  ["urad-dal-special", "Urad dal special", "स्पेशल उड़द दाल", ["urad special dehusked", "dhuli urad special"], { katori: 150 }, "katori", [["raw-urad-dal", 45], ["onion", 15], ["tomato", 20], ["ghee", 8], ["cream", 8], ["salt", 1.2]], 260],
  ["moti-mahal-dal", "Moti mahal dal", "मोती महल दाल", ["urad rajma dal", "urad rajmah mix dal"], { katori: 150 }, "katori", [["raw-urad-dal", 35], ["raw-rajma", 10], ["tomato", 30], ["butter", 8], ["cream", 8], ["salt", 1.2]], 280],
  ["maa-chane-ki-dal", "Maa chane ki dal", "माँ चने की दाल", ["urad chana dal", "maa chaane ki dal"], { katori: 150 }, "katori", [["raw-urad-dal", 25], ["raw-chana-dal", 20], ["onion", 15], ["tomato", 20], ["ghee", 6], ["salt", 1.2]], 280],
  ["khatti-dal", "Khatti dal", "खट्टी दाल", ["sour lentils", "khatti dal hyderabadi"], { katori: 150 }, "katori", [["raw-toor-dal", 40], ["tamarind", 10], ["tomato", 20], ["oil", 5], ["salt", 1.2]], 280],
  ["moong-dal-vadi", "Moong dal vadi", "मूंग दाल वड़ी", ["moong dal with vadi", "moong dal badi"], { katori: 150 }, "katori", [["raw-moong-dal", 35], ["raw-urad-dal", 10], ["tomato", 20], ["oil", 6], ["salt", 1.2]], 260], // vadi is sun-dried urad dal paste
  ["lemon-rasam", "Lemon rasam", "लेमन रसम", ["nimmakaya rasam", "elumichai rasam", "nimbe saaru", "rasam with lemon", "nimmakaya charu"], { katori: 150 }, "katori", [["raw-toor-dal", 10], ["tomato", 40], ["lemon-juice", 10], ["rasam-powder", 3], ["ghee", 3], ["salt", 1.2]], 250],
  ["kulthi-dal", "Kulthi dal", "कुलथी दाल", ["horse gram dal", "horsegram dal", "kollu", "kulith"], { katori: 150 }, "katori", [["raw-moth", 45], ["onion", 15], ["tomato", 20], ["oil", 5], ["salt", 1.2]], 280], // horse gram isn't in USDA; moth beans are close
  ["dalma", "Dalma", "डालमा", ["odia dalma"], { katori: 150 }, "katori", [["raw-toor-dal", 35], ["pumpkin", 25], ["raw-banana", 25], ["brinjal", 20], ["ghee", 4], ["salt", 1.2]], 300],
  ["khatta-chana", "Khatta chana", "खट्टा चना", ["khatta channa", "pindi chana"], { katori: 150 }, "katori", [["raw-kabuli-chana", 50], ["tamarind", 8], ["onion", 20], ["oil", 7], ["salt", 1.2]], 250],
  ["soyabean-curry", "Soyabean curry", "सोयाबीन करी", ["soybean curry", "soya bean curry"], { katori: 150 }, "katori", [["raw-soybean", 40], ["onion", 20], ["tomato", 30], ["oil", 6], ["salt", 1.2]], 250],
  ["black-beans", "Seasoned black beans", "ब्लैक बीन्स", ["classic seasoned black beans", "black beans", "frijoles negros"], { katori: 150 }, "katori", [["raw-black-beans", 50], ["onion", 20], ["garlic", 4], ["oil", 6], ["salt", 1.2]], 200],
  ["gatte-ki-sabzi", "Gatte ki sabzi", "गट्टे की सब्ज़ी", ["besan gatte curry", "gatte curry", "gatte"], { katori: 150 }, "katori", [["besan", 35], ["curd", 40], ["oil", 10], ["salt", 1.2]], 220],
  ["veg-dhansak", "Dhansak (vegetarian)", "वेज धनसाक", ["veg dhansak", "dhansak", "dhansak vegetarian"], { katori: 150 }, "katori", [["raw-toor-dal", 35], ["raw-masoor-dal", 10], ["pumpkin", 30], ["brinjal", 30], ["tomato", 30], ["onion", 20], ["oil", 7], ["salt", 1.3]], 330],

  // Soya chunks
  ["soya-sweet-sour", "Soya chunks sweet and sour", "सोया चंक्स स्वीट एंड सावर", ["nutrinugget sweet and sour", "sweet and sour soya"], { katori: 150 }, "katori", [["soya-chunks", 30], ["capsicum", 30], ["onion", 25], ["ketchup", 15], ["vinegar", 5], ["sugar", 5], ["cornstarch", 5], ["soy-sauce", 5], ["oil", 8], ["salt", 0.6]], 220],
  ["soya-korma", "Soya chunks korma", "सोया कोरमा", ["nutrinugget korma", "soya korma"], { katori: 150 }, "katori", [["soya-chunks", 30], ["curd", 40], ["onion", 30], ["cashews", 8], ["cream", 10], ["oil", 10], ["salt", 1]], 250],
  ["soya-matar", "Soya matar", "सोया मटर", ["soya chunks and peas", "nutrinugget matar"], { katori: 150 }, "katori", [["soya-chunks", 25], ["green-peas", 40], ["onion", 25], ["tomato", 40], ["oil", 8], ["salt", 1]], 250],
];
