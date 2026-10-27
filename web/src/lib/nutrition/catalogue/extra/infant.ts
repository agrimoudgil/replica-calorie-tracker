import type { DishRow } from "../rows";

/*
 * Weaning and nutrition-programme foods: soft porridges and mixes made from cereals, pulses,
 * milk and jaggery (a katori is about 120–150 g, cooked thin).
 */
export const INFANT_ROWS: DishRow[] = [
  ["bajra-shishu-aahaar", "Bajra shishu aahaar", "बाजरा शिशु आहार", ["pearl millet infant food", "bajra infant food"], { katori: 120 }, "katori", [["bajra-flour", 20], ["roasted-chana", 10], ["jaggery", 10], ["milk", 100]], 160],
  ["shishu-ahar", "Shishu ahar", "शिशु आहार", ["infant food", "shishu aahaar"], { katori: 120 }, "katori", [["atta", 20], ["roasted-chana", 10], ["peanuts", 5], ["jaggery", 10], ["milk", 80]], 150],
  ["cereal-mix", "Cereal mix (infant)", "अनाज मिक्स", ["cereal mix", "weaning cereal"], { katori: 120 }, "katori", [["raw-rice", 15], ["atta", 10], ["roasted-chana", 5], ["jaggery", 8], ["milk", 80]], 140],
  ["pulse-mix", "Pulse mix (infant)", "दाल मिक्स", ["pulse mix", "weaning dal mix"], { katori: 120 }, "katori", [["raw-moong-dal", 15], ["raw-masoor-dal", 10], ["raw-rice", 10], ["ghee", 3], ["salt", 0.3]], 150],
  ["amylase-cereal-pulse-mix", "Cereal pulse mix with amylase rice flour", "अमाइलेज़ अनाज दाल मिक्स", ["amylase rich food", "cereal pulse mix"], { katori: 120 }, "katori", [["rice-flour", 15], ["raw-moong-dal", 10], ["jaggery", 8], ["milk", 80]], 140],
  ["banana-groundnut-puree", "Banana groundnut puree", "केला मूंगफली प्यूरी", ["banana groundnut paste", "banana peanut mash"], { katori: 110 }, "katori", [["banana", 70], ["peanuts", 10], ["milk", 30]], 110],
  ["mashed-banana-milk", "Mashed banana with milk", "दूध में मसला केला", ["banana milk mash"], { katori: 140 }, "katori", [["banana", 80], ["milk", 60]], 140],
  ["potato-curd-mash", "Mashed potato with curd", "दही में मसला आलू", ["potato with curd", "aloo dahi mash"], { katori: 140 }, "katori", [["boiled-potato", 70], ["curd", 70], ["salt", 0.5]], 140],
  ["rice-dal-porridge", "Rice dal porridge", "चावल दाल दलिया", ["soft khichdi", "chawal dal ki khichdi", "chawal dal ki khichri"], { katori: 150 }, "katori", [["raw-rice", 20], ["raw-moong-dal", 12], ["ghee", 2], ["salt", 0.3]], 200],
  ["dal-suji-porridge", "Dal suji porridge", "दाल सूजी दलिया", ["lentils and semolina porridge", "dal suji daliya"], { katori: 150 }, "katori", [["suji", 15], ["raw-moong-dal", 12], ["ghee", 3], ["salt", 0.3]], 180],
  ["dal-wheat-porridge", "Dal dalia porridge", "दाल दलिया", ["lentils and wheat porridge", "dal wheat porridge"], { katori: 150 }, "katori", [["dalia", 15], ["raw-moong-dal", 12], ["ghee", 3], ["salt", 0.3]], 200],
  ["vegetable-mash", "Vegetable mash (infant)", "सब्ज़ियों का मैश", ["vegetable mix", "veg mash"], { katori: 90 }, "katori", [["raw-potato", 30], ["carrot", 25], ["green-peas", 15], ["ghee", 2], ["salt", 0.3]], 90],
];
