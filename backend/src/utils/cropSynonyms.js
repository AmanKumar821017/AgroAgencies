// ---------- 1. Crops: har list ki spellings ek hi cheez hain (English / Hinglish / Hindi) ----------
const crops = {
  // Anaaj
  wheat: ["wheat", "gehu", "gehun", "gehoon", "genhu", "गेहूं", "गेहूँ", "गेहू"],
  rice: ["rice", "chawal", "chaawal", "basmati", "चावल"],
  paddy: ["paddy", "dhan", "dhaan", "धान"],
  maize: ["maize", "corn", "makka", "makai", "मक्का", "मकई"],
  barley: ["barley", "jau", "जौ"],
  bajra: ["bajra", "pearl millet", "बाजरा"],
  jowar: ["jowar", "sorghum", "ज्वार"],
  ragi: ["ragi", "finger millet", "mandua", "रागी", "मंडुआ"],

  // Sabzi
  potato: ["potato", "aloo", "alu", "aaloo", "आलू"],
  onion: ["onion", "pyaz", "pyaaz", "pyaj", "प्याज", "प्याज़"],
  tomato: ["tomato", "tamatar", "टमाटर"],
  garlic: ["garlic", "lahsun", "lehsun", "लहसुन"],
  ginger: ["ginger", "adrak", "अदरक"],
  cauliflower: ["cauliflower", "phoolgobhi", "phool gobhi", "फूलगोभी"],
  cabbage: ["cabbage", "patta gobhi", "band gobhi", "पत्ता गोभी", "बंद गोभी"],
  peas: ["peas", "matar", "मटर"],
  brinjal: ["brinjal", "eggplant", "baingan", "बैंगन"],
  okra: ["okra", "ladyfinger", "bhindi", "भिंडी"],
  spinach: ["spinach", "palak", "पालक"],
  carrot: ["carrot", "gajar", "गाजर"],
  radish: ["radish", "mooli", "मूली"],
  cucumber: ["cucumber", "kheera", "khira", "खीरा"],
  bottlegourd: ["bottle gourd", "lauki", "ghiya", "लौकी"],
  pumpkin: ["pumpkin", "kaddu", "कद्दू"],
  bittergourd: ["bitter gourd", "karela", "करेला"],
  capsicum: ["capsicum", "shimla mirch", "शिमला मिर्च"],
  beans: ["beans", "fali", "phali", "फली"],
  beetroot: ["beetroot", "chukandar", "चुकंदर"],
  sweetpotato: ["sweet potato", "shakarkand", "शकरकंद"],
  greenchilli: ["green chilli", "hari mirch", "हरी मिर्च"],

  // Phal
  mango: ["mango", "aam", "आम"],
  banana: ["banana", "kela", "केला"],
  apple: ["apple", "seb", "सेब"],
  orange: ["orange", "santra", "संतरा"],
  grapes: ["grapes", "angoor", "अंगूर"],
  papaya: ["papaya", "papita", "पपीता"],
  guava: ["guava", "amrud", "अमरूद"],
  pomegranate: ["pomegranate", "anar", "अनार"],
  watermelon: ["watermelon", "tarbooz", "तरबूज"],
  muskmelon: ["muskmelon", "kharbooja", "kharbuja", "खरबूजा"],
  litchi: ["litchi", "lychee", "leechi", "लीची"],
  pineapple: ["pineapple", "ananas", "अनानास"],
  lemon: ["lemon", "nimbu", "nimboo", "नींबू"],
  coconut: ["coconut", "nariyal", "नारियल"],
  jackfruit: ["jackfruit", "kathal", "कटहल"],

  // Dal
  lentil: ["lentil", "masoor", "masur", "मसूर"],
  chickpea: ["chickpea", "chana", "channa", "bengal gram", "चना"],
  pigeonpea: ["pigeon pea", "toor", "tur", "tuvar", "arhar", "तूर", "अरहर"],
  moong: ["moong", "mung", "green gram", "मूंग"],
  urad: ["urad", "black gram", "उड़द"],
  rajma: ["rajma", "kidney beans", "राजमा"],
  lobia: ["lobia", "cowpea", "black eyed peas", "लोबिया"],

  // Masale
  chilli: ["chilli", "chili", "mirch", "mirchi", "red chilli", "lal mirch", "मिर्च", "मिर्ची"],
  turmeric: ["turmeric", "haldi", "हल्दी"],
  coriander: ["coriander", "dhania", "धनिया"],
  cumin: ["cumin", "jeera", "zeera", "जीरा"],
  blackpepper: ["black pepper", "kali mirch", "काली मिर्च"],
  cardamom: ["cardamom", "elaichi", "इलायची"],
  clove: ["clove", "laung", "लौंग"],
  cinnamon: ["cinnamon", "dalchini", "दालचीनी"],
  fenugreek: ["fenugreek", "methi", "मेथी"],
  ajwain: ["ajwain", "carom", "अजवाइन"],
  fennel: ["fennel", "saunf", "सौंफ"],
  bayleaf: ["bay leaf", "tejpatta", "तेजपत्ता"],
  hing: ["asafoetida", "hing", "हींग"],

  // Tilhan
  mustard: ["mustard", "sarson", "sarso", "सरसों"],
  groundnut: ["groundnut", "peanut", "moongfali", "mungfali", "मूंगफली"],
  soybean: ["soybean", "soyabean", "soya", "सोयाबीन"],
  sunflower: ["sunflower", "surajmukhi", "सूरजमुखी"],
  sesame: ["sesame", "til", "तिल"],
  linseed: ["linseed", "flax", "alsi", "अलसी"],

  // Mewa
  almond: ["almond", "badam", "बादाम"],
  cashew: ["cashew", "kaju", "काजू"],
  raisin: ["raisin", "kishmish", "किशमिश"],
  walnut: ["walnut", "akhrot", "अखरोट"],
  pistachio: ["pistachio", "pista", "पिस्ता"],
  dates: ["dates", "khajoor", "खजूर"],

  // Atta ke prakar
  besan: ["besan", "gram flour", "बेसन"],
  maida: ["maida", "refined flour", "मैदा"],
  sooji: ["sooji", "suji", "semolina", "rava", "सूजी"],
  dalia: ["dalia", "daliya", "दलिया"],

  // Aur
  sugarcane: ["sugarcane", "ganna", "gana", "गन्ना"],
  jaggery: ["jaggery", "gur", "gud", "गुड़"],
  honey: ["honey", "shahad", "madhu", "शहद"],
};

// ---------- 2. Categories: ek shabd likhne par kai crops ----------
const categories = [
  {
    aliases: ["vegetable", "vegetables", "veg", "veggies", "sabji", "sabzi", "subzi", "sabjee", "सब्जी", "सब्ज़ी", "सब्जियां"],
    crops: [
      "potato", "onion", "tomato", "garlic", "ginger", "cauliflower", "cabbage", "peas", "brinjal",
      "okra", "spinach", "carrot", "radish", "cucumber", "bottlegourd", "pumpkin", "bittergourd",
      "capsicum", "beans", "beetroot", "sweetpotato", "greenchilli", "coriander", "lemon",
    ],
  },
  {
    aliases: ["fruit", "fruits", "phal", "fal", "फल"],
    crops: [
      "mango", "banana", "apple", "orange", "grapes", "papaya", "guava", "pomegranate", "watermelon",
      "muskmelon", "litchi", "pineapple", "lemon", "coconut", "jackfruit",
    ],
  },
  {
    aliases: ["pulses", "pulse", "dal", "daal", "dals", "दाल", "दालें"],
    crops: ["lentil", "chickpea", "pigeonpea", "moong", "urad", "rajma", "lobia"],
  },
  {
    aliases: ["grain", "grains", "cereal", "cereals", "anaj", "anaaj", "अनाज"],
    crops: ["wheat", "rice", "paddy", "maize", "barley", "bajra", "jowar", "ragi"],
  },
  {
    aliases: ["spice", "spices", "masala", "masale", "masalay", "मसाला", "मसाले"],
    crops: [
      "chilli", "turmeric", "coriander", "cumin", "blackpepper", "cardamom", "clove", "cinnamon",
      "fenugreek", "ajwain", "fennel", "bayleaf", "hing", "garlic", "ginger",
    ],
  },
  {
    aliases: ["oilseed", "oilseeds", "tilhan", "tel", "तिलहन"],
    crops: ["mustard", "groundnut", "soybean", "sunflower", "sesame", "linseed"],
  },
  {
    aliases: ["flour", "atta", "aata", "aatta", "आटा"],
    crops: ["besan", "maida", "sooji", "dalia"],
  },
  {
    aliases: ["dry fruit", "dry fruits", "dryfruit", "dryfruits", "mewa", "meva", "मेवा"],
    crops: ["almond", "cashew", "raisin", "walnut", "pistachio", "dates"],
  },
];

// ---------- helpers ----------
const STOP = new Set(["ka", "ki", "ke", "of", "and", "aur", "wala", "wali"]);
const norm = (s) => String(s || "").toLowerCase().trim();
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const isLatin = (s) => /^[a-z0-9 ]+$/.test(s);

function addMatches(t, out) {
  // Crop: poora shabd match ya (4+ akshar) shuruaat match
  for (const variants of Object.values(crops)) {
    if (variants.some((v) => v === t || (t.length >= 4 && v.startsWith(t)))) {
      variants.forEach((v) => out.add(v));
    }
  }
  // Category: poora shabd match ya (3+ akshar) shuruaat match, jaise "veg"
  for (const c of categories) {
    if (c.aliases.some((a) => a === t || (t.length >= 3 && a.startsWith(t)))) {
      c.aliases.forEach((a) => out.add(a));
      c.crops.forEach((k) => crops[k].forEach((v) => out.add(v)));
    }
  }
}

// "sabzi" -> ["sabzi", "potato", "aloo", "onion", "pyaz", ...]
// Pehla item hamesha wahi hai jo user ne likha
function expandSearch(search) {
  const term = norm(search);
  if (!term) return [];
  const out = new Set([term]);
  const tokens = term.split(/\s+/).filter((t) => t.length >= 3 && !STOP.has(t));
  tokens.forEach((t) => addMatches(t, out));
  return [...out];
}

// Latin shabd: shabd ki shuruaat se match (Dhania mein "dhan" nahi aayega)
// Hindi (Devanagari): seedha match
function toRegex(t, whole) {
  const e = escapeRegex(t);
  if (!isLatin(t)) return new RegExp(e, "i");
  return new RegExp(whole ? `\\b${e}\\b` : `\\b${e}`, "i");
}

// Mongo ke liye: { name: { $in: [regex, regex, ...] } }
function nameFilter(search) {
  const terms = expandSearch(search);
  return { $in: terms.map((t, i) => toRegex(t, i > 0)) };
}

module.exports = { expandSearch, nameFilter, escapeRegex };