import type { DishRow } from "../rows";

/*
 * Indian sweets. Kheer and halwa per katori (about 100–120 g); burfi, ladoo and the
 * Bengali sweets per piece (about 25–30 g, with their syrup). Milk reduces as it cooks.
 */
export const SWEET_ROWS: DishRow[] = [
  // Kheer and payasam
  ["makhana-kheer", "Makhana kheer", "मखाना खीर", ["phool makhana kheer", "fox nut kheer"], { katori: 120 }, "katori", [["makhana-dry", 15], ["milk", 200], ["sugar", 18], ["almonds", 4]], 180],
  ["suji-kheer", "Suji kheer", "सूजी की खीर", ["semolina kheer", "rava kheer"], { katori: 120 }, "katori", [["suji", 15], ["milk", 200], ["sugar", 18], ["ghee", 3]], 180],
  ["paneer-kheer", "Paneer kheer", "पनीर खीर", ["chhena kheer"], { katori: 120 }, "katori", [["paneer", 40], ["milk", 200], ["sugar", 20]], 210],
  ["cabbage-kheer", "Cabbage kheer", "पत्तागोभी की खीर", ["pattagobhi ki kheer"], { katori: 120 }, "katori", [["cabbage", 40], ["milk", 200], ["sugar", 20]], 200],
  ["gajar-kheer", "Gajar ki kheer", "गाजर की खीर", ["carrot kheer", "gajar kheer"], { katori: 120 }, "katori", [["carrot", 50], ["milk", 200], ["sugar", 20], ["almonds", 3]], 210],
  ["gobhi-kheer", "Phoolgobhi ki kheer", "फूलगोभी की खीर", ["cauliflower kheer"], { katori: 120 }, "katori", [["cauliflower", 40], ["milk", 200], ["sugar", 20]], 200],
  ["moong-dal-kheer", "Moong dal kheer", "मूंग दाल खीर", ["moong dal payasam", "pesara pappu payasam"], { katori: 120 }, "katori", [["raw-moong-dal", 25], ["milk", 150], ["jaggery", 25], ["ghee", 4], ["cashews", 3]], 220],
  ["lauki-kheer", "Lauki kheer", "लौकी की खीर", ["ghiya kheer", "bottle gourd kheer", "doodhi kheer"], { katori: 120 }, "katori", [["lauki", 50], ["milk", 200], ["sugar", 20]], 210],
  ["kaddu-kheer", "Kaddu ki kheer", "कद्दू की खीर", ["pumpkin kheer"], { katori: 120 }, "katori", [["pumpkin", 50], ["milk", 200], ["sugar", 20]], 210],
  ["apple-kheer", "Seb ki kheer", "सेब की खीर", ["apple kheer"], { katori: 120 }, "katori", [["apple", 60], ["milk", 200], ["sugar", 15]], 215],
  ["black-rice-kheer", "Chak-hao kheer", "चक-हाओ खीर", ["black rice kheer"], { katori: 120 }, "katori", [["black-rice", 20], ["milk", 200], ["sugar", 18]], 190],
  ["coconut-kheer", "Nariyal kheer", "नारियल की खीर", ["coconut kheer", "nariyal ki kheer"], { katori: 120 }, "katori", [["coconut", 30], ["milk", 180], ["raw-rice", 5], ["sugar", 18]], 190],
  ["apple-sago-payasam", "Apple sabudana kheer", "सेब साबूदाना खीर", ["apple sago payasam", "seb aur sabudana ki kheer"], { katori: 120 }, "katori", [["sabudana", 15], ["apple", 40], ["milk", 180], ["sugar", 18]], 220],
  ["rabri", "Rabri", "रबड़ी", ["rabdi", "thickened sweetened milk"], { katori: 80 }, "katori", [["milk", 300], ["sugar", 20], ["pistachios", 3]], 120],

  // Halwa
  ["shahi-suji-halwa", "Shahi suji halwa", "शाही सूजी हलवा", ["royal semolina halwa"], { katori: 100 }, "katori", [["suji", 30], ["ghee", 20], ["sugar", 30], ["milk", 60], ["khoa", 10], ["almonds", 6]], 140],
  ["ande-ka-halwa", "Ande ka halwa", "अंडे का हलवा", ["egg halwa"], { katori: 100 }, "katori", [["raw-egg", 100], ["ghee", 20], ["sugar", 35], ["milk", 40], ["khoa", 15]], 170],
  ["aloo-halwa", "Aloo ka halwa", "आलू का हलवा", ["potato halwa"], { katori: 100 }, "katori", [["boiled-potato", 100], ["ghee", 20], ["sugar", 35]], 140],
  ["kaddu-halwa", "Kaddu ka halwa", "कद्दू का हलवा", ["pumpkin halwa"], { katori: 100 }, "katori", [["pumpkin", 150], ["ghee", 15], ["sugar", 30], ["khoa", 10]], 160],
  ["moong-dal-halwa", "Moong dal halwa", "मूंग दाल हलवा", ["moong ka halwa"], { katori: 100 }, "katori", [["raw-moong-dal", 40], ["ghee", 35], ["sugar", 40], ["milk", 40], ["khoa", 10]], 150],
  ["besan-halwa", "Besan halwa", "बेसन का हलवा", ["besan ka halwa", "gram flour halwa"], { katori: 100 }, "katori", [["besan", 35], ["ghee", 30], ["sugar", 35], ["milk", 40]], 130],
  ["kamal-gatte-halwa", "Kamal gatte ka halwa", "कमल गट्टे का हलवा", ["lotus seed halwa", "makhana halwa"], { katori: 100 }, "katori", [["makhana-dry", 30], ["ghee", 20], ["sugar", 30], ["milk", 80]], 140],

  // Burfi, ladoo and chikki (one piece)
  ["milk-burfi", "Milk burfi", "मिल्क बर्फ़ी", ["burfi", "barfi", "plain burfi", "khoya burfi", "mawa burfi"], { piece: 25 }, "piece", [["khoa", 100], ["sugar", 30]], 120],
  ["nariyal-burfi", "Nariyal burfi", "नारियल बर्फ़ी", ["coconut burfi", "nariyal ki burfi", "coconut barfi"], { piece: 25 }, "piece", [["coconut", 60], ["sugar", 40], ["milk", 30], ["ghee", 3]], 110],
  ["khoa-coconut-burfi", "Khoa coconut burfi", "खोया नारियल बर्फ़ी", ["mawa coconut burfi"], { piece: 25 }, "piece", [["khoa", 60], ["coconut", 30], ["sugar", 30]], 115],
  ["lauki-burfi", "Lauki burfi", "लौकी बर्फ़ी", ["ghiya burfi", "bottle gourd burfi"], { piece: 25 }, "piece", [["lauki", 150], ["khoa", 40], ["sugar", 40], ["ghee", 5]], 140],
  ["chocolate-burfi", "Chocolate burfi", "चॉकलेट बर्फ़ी", ["chocolate barfi"], { piece: 25 }, "piece", [["khoa", 80], ["sugar", 30], ["cocoa", 6], ["ghee", 3]], 115],
  ["besan-burfi", "Besan burfi", "बेसन बर्फ़ी", ["besan barfi", "gram flour burfi"], { piece: 25 }, "piece", [["besan", 40], ["ghee", 25], ["sugar", 40], ["milk-powder", 5]], 105],
  ["danedar-burfi", "Danedar burfi", "दानेदार बर्फ़ी", ["danedar barfi"], { piece: 25 }, "piece", [["milk", 250], ["sugar", 30], ["ghee", 5]], 100],
  ["suji-burfi", "Suji burfi", "सूजी बर्फ़ी", ["semolina burfi", "rava burfi"], { piece: 25 }, "piece", [["suji", 40], ["ghee", 20], ["sugar", 40], ["milk", 50]], 130],
  ["kaddu-nariyal-burfi", "Kaddu nariyal burfi", "कद्दू नारियल बर्फ़ी", ["pumpkin coconut burfi"], { piece: 25 }, "piece", [["pumpkin", 80], ["coconut", 30], ["sugar", 40], ["ghee", 5]], 120],
  ["peanut-burfi", "Moongfali burfi", "मूंगफली बर्फ़ी", ["peanut burfi", "moongfali ki burfi"], { piece: 25 }, "piece", [["peanuts", 50], ["sugar", 40], ["milk-powder", 10], ["ghee", 4]], 100],
  ["atta-moong-burfi", "Atta moong dal burfi", "आटा मूंग दाल बर्फ़ी", ["atta dal burfi", "wheat flour and moong dal burfi", "atta aur moong dal ki burfi"], { piece: 25 }, "piece", [["atta", 25], ["raw-moong-dal", 20], ["ghee", 20], ["sugar", 35]], 98],
  ["palak-burfi", "Palak burfi", "पालक बर्फ़ी", ["spinach burfi"], { piece: 25 }, "piece", [["raw-spinach", 40], ["khoa", 40], ["sugar", 30], ["ghee", 5]], 100],
  ["palak-mungfali-burfi", "Palak mungfali burfi", "पालक मूंगफली बर्फ़ी", ["spinach peanut burfi", "palak aur mungfali ki burfi"], { piece: 25 }, "piece", [["raw-spinach", 30], ["peanuts", 35], ["jaggery", 35], ["ghee", 4]], 95],
  ["chana-dal-burfi", "Chana dal burfi", "चना दाल बर्फ़ी", ["split bengal gram burfi", "chana dal fudge"], { piece: 25 }, "piece", [["raw-chana-dal", 35], ["milk", 40], ["sugar", 35], ["ghee", 15]], 100],
  ["oats-burfi", "Oats burfi", "ओट्स बर्फ़ी", ["oat barfi"], { piece: 25 }, "piece", [["oats", 35], ["jaggery", 30], ["ghee", 10], ["almonds", 6], ["milk-powder", 6]], 85],
  ["milk-cake", "Milk cake", "मिल्क केक", ["alwar ka mawa", "kalakand"], { piece: 30 }, "piece", [["milk", 300], ["sugar", 30], ["ghee", 3]], 120],
  ["suji-khoya-ladoo", "Suji khoya ladoo", "सूजी खोया लड्डू", ["semolina ladoo with khoya", "rava ladoo with khoya"], { piece: 30 }, "piece", [["suji", 30], ["khoa", 20], ["sugar", 30], ["ghee", 12]], 92],
  ["rava-ladoo", "Rava ladoo", "रवा लड्डू", ["semolina ladoo with coconut", "suji coconut ladoo", "rava laddu", "suji ladoo"], { piece: 30 }, "piece", [["suji", 30], ["coconut", 15], ["sugar", 30], ["ghee", 12]], 87],
  ["suji-nut-ladoo", "Suji ladoo with nuts", "मेवे वाले सूजी लड्डू", ["rava ladoo with nuts", "semolina ladoo with nuts"], { piece: 30 }, "piece", [["suji", 30], ["almonds", 6], ["cashews", 6], ["sugar", 30], ["ghee", 14]], 85],
  ["khoa-ladoo", "Khoa ladoo", "खोया लड्डू", ["mawa ladoo", "khoya ladoo"], { piece: 30 }, "piece", [["khoa", 60], ["sugar", 25], ["desiccated-coconut", 8]], 90],
  ["atta-besan-ladoo", "Atta besan ladoo", "आटा बेसन लड्डू", ["wheat and gram flour ladoo"], { piece: 30 }, "piece", [["atta", 25], ["besan", 20], ["ghee", 25], ["sugar", 35]], 103],
  ["atta-nuts-ladoo", "Atta nuts ladoo", "आटा मेवा लड्डू", ["wheat flour and nuts ladoos", "atte ke ladoo"], { piece: 30 }, "piece", [["atta", 30], ["almonds", 8], ["cashews", 6], ["jaggery", 30], ["ghee", 15]], 89],
  ["bajra-ladoo", "Bajra ladoo", "बाजरे के लड्डू", ["pearl millet ladoo", "bajre ke laddu"], { piece: 30 }, "piece", [["bajra-flour", 35], ["jaggery", 30], ["ghee", 15], ["sesame", 5]], 85],
  ["paushtik-ladoo", "Paushtik ladoo", "पौष्टिक लड्डू", ["poshtik ladoo", "nutritious ladoo"], { piece: 30 }, "piece", [["atta", 20], ["roasted-chana", 15], ["peanuts", 10], ["jaggery", 30], ["ghee", 10]], 85],
  ["rajgira-ladoo", "Rajgira ladoo", "राजगिरा लड्डू", ["amaranth ladoo", "ramdana ladoo"], { piece: 20 }, "piece", [["amaranth", 30], ["jaggery", 30], ["ghee", 4]], 64],
  ["til-chana-chikki", "Til chana chikki", "तिल चना चिक्की", ["sesame chickpeas brittle", "til aur channe ki chikki"], { piece: 20 }, "piece", [["sesame", 20], ["roasted-chana", 15], ["jaggery", 40], ["ghee", 2]], 75],
  ["murmura-chikki", "Murmura chikki", "मुरमुरा चिक्की", ["puffed rice chikki", "murmura ladoo"], { piece: 20 }, "piece", [["murmura", 25], ["jaggery", 45], ["ghee", 2]], 70],
  ["soya-chikki", "Soya chikki", "सोया चिक्की", ["soybean chikki"], { piece: 20 }, "piece", [["raw-soybean", 30], ["jaggery", 40], ["ghee", 2]], 70],

  // Fried and stuffed sweets
  ["gujiya", "Gujiya", "गुझिया", ["gunjia", "gujia", "karanji"], { piece: 35 }, "piece", [["maida", 25], ["khoa", 20], ["sugar", 10], ["coconut", 5], ["ghee", 10]], 70],
  ["lavang-latika", "Lavang latika", "लवंग लतिका", ["lavang lata", "ghujia lavang latika"], { piece: 37 }, "piece", [["maida", 25], ["khoa", 20], ["sugar", 20], ["coconut", 5], ["ghee", 10]], 75],
  ["malpua", "Malpua", "मालपुआ", ["mal pua", "malpoa"], { piece: 40 }, "piece", [["maida", 25], ["milk", 30], ["sugar", 25], ["ghee", 10], ["fennel-seeds", 0.5]], 80],
  ["mango-malpua", "Mango malpua", "आम मालपुआ", ["aam malpua"], { piece: 42 }, "piece", [["maida", 25], ["mango", 30], ["milk", 15], ["sugar", 20], ["ghee", 10]], 85],
  ["shahi-tukda", "Shahi tukda", "शाही टुकड़ा", ["shahi tukre", "double ka meetha", "shahi tukra"], { piece: 85 }, "piece", [["white-bread", 25], ["ghee", 10], ["sugar", 15], ["rabri", 40]], 85],
  ["putharekulu", "Pootharekulu", "पूथरेकुलु", ["putharekulu", "paper sweet"], { piece: 27 }, "piece", [["rice-flour", 5], ["ghee", 8], ["sugar", 12], ["cashews", 3]], 28],

  // Bengali sweets (chhena with syrup)
  ["gulab-jamun-milk-powder", "Milk powder gulab jamun", "मिल्क पाउडर गुलाब जामुन", ["gulab jamun with milk powder"], { piece: 50 }, "piece", [["milk-powder", 12], ["maida", 3], ["milk", 4], ["ghee", 5], ["sugar", 15]], 50],
  ["cham-cham", "Cham cham", "चमचम", ["chum chum", "chomchom"], { piece: 50 }, "piece", [["paneer", 30], ["sugar", 18], ["khoa", 5], ["maida", 1]], 50],
  ["dil-bahar", "Dil bahar", "दिल बहार", ["dilbahar sweet"], { piece: 55 }, "piece", [["paneer", 30], ["sugar", 18], ["khoa", 8]], 55],
  ["rasbhari", "Rasbhari", "रसभरी", ["rasbhari sweet"], { piece: 45 }, "piece", [["paneer", 25], ["sugar", 18], ["khoa", 5]], 45],
  ["rajbhog", "Rajbhog", "राजभोग", ["rajbogh", "raj bhog"], { piece: 60 }, "piece", [["paneer", 35], ["sugar", 22], ["khoa", 5], ["pistachios", 2]], 60],
  ["chhena-murki", "Chhena murki", "छेना मुरकी", ["chenna murki"], { katori: 50 }, "katori", [["paneer", 60], ["sugar", 40]], 85],
  ["chhena-poda", "Chhena poda", "छेना पोड़ा", ["chenna poda"], { piece: 60 }, "piece", [["paneer", 100], ["sugar", 30], ["suji", 8], ["ghee", 4]], 120],
  ["sweet-couscous", "Sweet couscous", "मीठा कूसकूस", ["sweet couscous dessert"], { katori: 120 }, "katori", [["couscous", 30], ["milk", 120], ["sugar", 15], ["raisins", 5], ["butter", 4]], 170],
];
