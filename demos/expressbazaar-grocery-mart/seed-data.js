(function () {
  const categoryRows = [
    ["staples", "Atta, Rice & Dals", "🌾", "#f3b33d"],
    ["oils-spices", "Oils, Spices & Sauces", "🫙", "#e8752b"],
    ["fresh", "Fresh Fruits & Vegetables", "🥬", "#49a667"],
    ["dairy-bakery", "Dairy & Bakery", "🥛", "#4b91df"],
    ["beverages", "Beverages", "🧃", "#8f65d9"],
    ["snacks", "Snacks & Packaged Foods", "🍪", "#e45454"],
    ["personal-care", "Personal Care", "🧴", "#d15fa6"],
    ["household", "Household & Cleaning", "🧼", "#36a6a0"],
    ["baby-care", "Baby Care", "👶", "#ee8a9a"],
    ["meat-fish-eggs", "Meat, Fish & Eggs", "🥚", "#be5757"],
    ["frozen", "Frozen Foods & Ice Creams", "🍦", "#5c8fd8"],
    ["pooja", "Pooja Needs & Festivals", "🪔", "#dd7b2a"]
  ];

  const rawProducts = {
    "staples": `
Whole wheat atta|58|1 kg|🌾
Maida|48|1 kg|🌾
Besan|92|1 kg|🫘
Sooji (rava)|52|1 kg|🌾
Rice flour|66|1 kg|🍚
Ragi flour|72|1 kg|🌾
Sattu|118|1 kg|🫘
Basmati rice|165|1 kg|🍚
Regular kolam/sona masoori rice|68|1 kg|🍚
Brown rice|145|1 kg|🍚
Poha (flattened rice)|62|1 kg|🍚
Puffed rice (murmura)|48|500 g|🍚
Toor dal|178|1 kg|🫘
Moong dal|164|1 kg|🫘
Chana dal|112|1 kg|🫘
Urad dal|176|1 kg|🫘
Masoor dal|138|1 kg|🫘
Rajma|172|1 kg|🫘
Chole (chickpeas)|126|1 kg|🫘
Lobia|142|1 kg|🫘
Wheat grains|54|1 kg|🌾
Bajra|64|1 kg|🌾
Jowar|68|1 kg|🌾
Barley|88|1 kg|🌾
Oats|98|500 g|🥣`,
    "oils-spices": `
Mustard oil|178|1 L|🫗
Sunflower oil|142|1 L|🫗
Groundnut oil|188|1 L|🫗
Rice bran oil|152|1 L|🫗
Coconut oil|196|1 L|🥥
Ghee|635|1 L|🧈
Olive oil|525|500 ml|🫒
Cumin seeds (jeera)|82|200 g|🌿
Mustard seeds (rai)|42|200 g|🌿
Cardamom|198|50 g|🌿
Cinnamon|74|100 g|🌿
Cloves|112|100 g|🌿
Black pepper|132|100 g|🌿
Fenugreek seeds (methi)|38|200 g|🌿
Turmeric (haldi) powder|46|200 g|🟡
Chili powder|62|200 g|🌶️
Coriander (dhaniya) powder|48|200 g|🌿
Garam masala|78|100 g|🌶️
Hing (asafoetida)|88|50 g|🫙
Biryani masala|72|100 g|🫙
Sambhar powder|64|100 g|🫙
Chole masala|68|100 g|🫙
Chicken/meat masala|76|100 g|🫙
Iodised salt|28|1 kg|🧂
Rock salt (pink salt)|72|1 kg|🧂
White sugar|54|1 kg|🍬
Brown sugar|92|500 g|🍬
Jaggery (gur)|84|1 kg|🟤`,
    "fresh": `
Potatoes|36|1 kg|🥔
Onions|42|1 kg|🧅
Tomatoes|38|1 kg|🍅
Garlic|48|250 g|🧄
Ginger|42|250 g|🫚
Green chilies|22|100 g|🌶️
Coriander leaves|18|1 bunch|🌿
Spinach (palak)|28|1 bunch|🥬
Fenugreek leaves (methi)|28|1 bunch|🌿
Mint leaves|20|1 bunch|🌿
Cauliflower|48|1 piece|🥦
Cabbage|42|1 piece|🥬
Ladyfinger (bhindi)|58|500 g|🥬
Capsicum|64|500 g|🫑
Broccoli|118|500 g|🥦
Mushrooms|78|200 g|🍄
Bananas|68|1 dozen|🍌
Apples|185|1 kg|🍎
Oranges|128|1 kg|🍊
Mangoes|165|1 kg|🥭
Papayas|72|1 kg|🧡
Pomegranates|198|1 kg|🔴
Grapes|138|1 kg|🍇`,
    "dairy-bakery": `
Milk (toned/full cream)|34|500 ml|🥛
Curd (dahi)|42|400 g|🥣
Paneer|98|200 g|🧀
Butter|62|100 g|🧈
Fresh cream|78|200 ml|🥛
Cheese slices|145|200 g|🧀
Cheese cubes|150|200 g|🧀
Chaas (buttermilk)|25|500 ml|🥛
Lassi|35|200 ml|🥛
Flavored milk|38|200 ml|🥛
Condensed milk|142|400 g|🥫
White bread|45|400 g|🍞
Brown bread|55|400 g|🍞
Sandwich bread|50|450 g|🍞
Pav|42|6 pieces|🥖
Buns|38|4 pieces|🥯
Rusks|72|300 g|🍞`,
    "beverages": `
Assam tea|145|250 g|🍵
Green tea|165|25 bags|🍵
Masala chai bags|155|25 bags|🍵
Instant coffee|185|100 g|☕
Filter coffee powder|210|250 g|☕
Fruit juices|110|1 L|🧃
Coconut water|55|200 ml|🥥
Squashes|145|750 ml|🧃
Glucose powder|125|500 g|🥤
Cola drinks|45|750 ml|🥤
Lemon-lime sodas|45|750 ml|🥤
Energy drinks|125|250 ml|🥤
Tonic water|78|300 ml|🥤
Bournvita|285|500 g|🥛
Horlicks|295|500 g|🥛
Boost|275|500 g|🥛
Protein shakes|165|250 ml|🥤`,
    "snacks": `
Bhujia|62|200 g|🥨
Sev|58|200 g|🥨
Mixture namkeen|65|200 g|🥨
Chana chor garam|55|200 g|🫘
Banana chips|78|200 g|🍌
Marie biscuits|38|250 g|🍪
Glucose biscuits|32|250 g|🍪
Chocolate cookies|75|200 g|🍪
Cream biscuits|45|200 g|🍪
Crackers|55|200 g|🍘
Instant noodles (Maggi/Yippee)|15|1 pack|🍜
Pasta|88|500 g|🍝
Vermicelli (sewai)|58|500 g|🍜
Macaroni|82|500 g|🍝
Cornflakes|185|500 g|🥣
Muesli|315|500 g|🥣
Rolled oats|165|1 kg|🥣
Chocos|210|500 g|🥣
Tomato ketchup|125|500 g|🍅
Chili sauce|95|200 g|🌶️
Mayonnaise|165|500 g|🥚
Fruit jam|145|500 g|🍓
Honey|225|500 g|🍯
Peanut butter|265|500 g|🥜`,
    "personal-care": `
Bathing soaps|38|1 bar|🧼
Body wash|195|250 ml|🧴
Hand wash|105|250 ml|🧴
Hand sanitizers|85|200 ml|🧴
Shampoo|225|340 ml|🧴
Hair conditioner|245|300 ml|🧴
Coconut hair oil|155|500 ml|🥥
Amla hair oil|175|500 ml|🧴
Almond hair oil|210|300 ml|🧴
Hair gels|125|150 ml|🧴
Toothpaste|115|200 g|🪥
Toothbrushes|55|1 piece|🪥
Mouthwash|185|500 ml|🦷
Dental floss|95|1 pack|🦷
Face wash|185|150 ml|🧴
Moisturizers|245|200 ml|🧴
Body lotions|265|400 ml|🧴
Sunscreens|345|100 ml|☀️
Talcum powder|105|300 g|🧴
Deodorants|225|150 ml|🧴
Sanitary pads|115|1 pack|📦
Shaving creams|95|100 g|🪒
Razors|85|1 pack|🪒
Cotton buds|55|100 pieces|📦`,
    "household": `
Detergent powder|135|1 kg|🧺
Liquid detergent|225|1 L|🧴
Fabric conditioner|235|860 ml|🧴
Laundry soap bars|32|1 bar|🧼
Floor cleaners (Lizol)|205|1 L|🧹
Toilet cleaners (Harpic)|195|1 L|🧴
Glass cleaners (Colin)|115|500 ml|🪟
Disinfectant sprays|235|200 g|🧴
Dishwash bars|30|200 g|🧼
Dishwash liquids (Vim)|115|500 ml|🧴
Scrubbing pads|35|3 pieces|🧽
Mosquito sprays|225|400 ml|🦟
Vaporizers & refills|95|1 refill|🦟
Mosquito coils|48|10 coils|🦟
Room freshening sprays|245|240 ml|🌸
Room freshening gels|105|75 g|🌸
Garbage bags|95|30 bags|🗑️
Kitchen rolls|115|2 rolls|🧻
Tissues|85|100 pulls|🧻
Aluminum foil|135|18 m|📦
Matchboxes|20|10 boxes|🔥`,
    "baby-care": `
Baby diapers|699|1 pack|👶
Training pants|749|1 pack|👶
Wet wipes|145|72 wipes|🧻
Baby soap|72|75 g|🧼
Baby shampoo|185|200 ml|🧴
Baby powder|165|200 g|🧴
Baby oil|195|200 ml|🧴
Formula milk|575|400 g|🍼
Baby cerelac|285|300 g|🥣
Fruit purees|95|100 g|🍎`,
    "meat-fish-eggs": `
White eggs|78|12 pieces|🥚
Brown eggs|110|12 pieces|🥚
Organic country eggs|145|12 pieces|🥚
Fresh chicken curry cut|235|500 g|🍗
Boneless chicken|315|500 g|🍗
Chicken breast|335|500 g|🍗
Mutton|525|500 g|🥩
Minced meat (keema)|345|500 g|🥩
Fresh fish (rohu/catla)|285|500 g|🐟
Premium fish (surmai/pomfret)|545|500 g|🐟
Prawns|425|500 g|🦐`,
    "frozen": `
Frozen parathas|165|400 g|🫓
French fries|195|750 g|🍟
Frozen samosas|175|500 g|🥟
Chicken nuggets|285|500 g|🍗
Burger patties|245|400 g|🍔
Ice cream tubs|265|700 ml|🍨
Ice cream cones|55|1 piece|🍦
Kulfi|45|1 piece|🍦
Frozen yoghurts|85|100 ml|🍨
Frozen green peas|145|500 g|🫛
Sweet corn|135|500 g|🌽
Mixed frozen vegetables|165|500 g|🥦`,
    "pooja": `
Agarbatti (incense sticks)|55|1 pack|🪔
Dhoop cones|65|1 pack|🪔
Camphor (kapoor)|85|100 g|🪔
Cotton wicks (batti)|35|100 pieces|🪔
Diya oil|145|1 L|🫗
Pure honey|235|500 g|🍯
Rose water|65|200 ml|🌹
Gangajal|55|200 ml|💧
Roli-chawal packet|45|1 pack|🪔`
  };

  const slugify = (value) => value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const categories = categoryRows.map((row, index) => ({
    id: row[0],
    name: row[1],
    icon: row[2],
    accent: row[3],
    sortOrder: index + 1,
    active: true
  }));

  const products = [];
  categories.forEach((category) => {
    rawProducts[category.id].trim().split("\n").forEach((line, index) => {
      const [name, price, unit, emoji] = line.split("|");
      products.push({
        id: `${category.id}-${slugify(name)}`,
        name,
        categoryId: category.id,
        price: Number(price),
        unit,
        emoji,
        imageUrl: "",
        stockStatus: index % 19 === 18 ? "out" : "in",
        featured: index < 2,
        sortOrder: index + 1,
        updatedAt: ""
      });
    });
  });

  window.EXPRESS_BAZAAR_SEED = { categories, products };
})();
