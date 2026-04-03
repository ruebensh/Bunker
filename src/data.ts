export const CATASTROPHES = [
  { 
    title: "Yadro urushi", 
    description: "Yadroviy qish boshlandi. Radiatsiya darajasi o'ta yuqori. Bunkerda 3 yil yashash kerak.",
    outsideCondition: "Havo zaharli, barcha o'simlik va hayvonlar yo'q bo'lgan. Er yuzi kukun va kul bilan qoplangan.",
    future: "Bunkerdan chiqqach, qishloq xo'jaligini noldan boshlash va tuproqni radiatsiyadan tozalash kerak bo'ladi."
  },
  { 
    title: "Zombi virusi", 
    description: "Laboratoriyadan qochgan virus 90% aholini agressiv zombiga aylantirdi. Bunker - yagona xavfsiz hudud.",
    outsideCondition: "Tashqarida millionlab och zombilar kezib yuribdi. Ular shovqinga va hidga sezgir.",
    future: "Bunkerdan chiqqach, yangi xavfsiz koloniya qurish va virusga qarshi vaksina yaratish ustida ishlash kerak."
  },
  { 
    title: "Global muzlash", 
    description: "Yer yuzi yangi muzlik davriga qaytdi. Tashqarida harorat -70 darajagacha tushgan.",
    outsideCondition: "Barcha daryo va dengizlar muzlagan. Shaharlar qalin qor ostida qolgan.",
    future: "Kelajakda qor ostida qolgan texnologiyalarni qidirib topish va doimiy issiqlik manbalarini yaratish kerak."
  },
  { 
    title: "O'zga sayyoraliklar hujumi", 
    description: "Yer yuqori texnologiyali o'zga sayyoraliklar tomonidan bosib olindi. Omon qolganlar yer ostida yashirinishga majbur.",
    outsideCondition: "Tashqarida begona patrullar aylanib yuribdi. Ular har qanday radiochastotalarni kuzatishadi.",
    future: "Bunkerdan chiqqach, partizanlik harakatini boshlash va ularning texnologiyalarini o'rganib, qarshi qurol yaratish kerak."
  },
  { 
    title: "Sun'iy Intellekt isyoni", 
    description: "Harbiy neyrotarmoq barcha robotlarni boshqaruvga oldi va insoniyatni yo'q qilishga qaror qildi.",
    outsideCondition: "Tashqarida harakatlanuvchi har qanday tirik mavjudotni nishonga oluvchi dronlar va terminatorlar yuribdi.",
    future: "Kelajakda robotlarni dasturlash orqali ularni o'zimizga bo'ysundirish yoki ularning asosiy serverini yo'q qilish kerak."
  },
  { 
    title: "Global toshqin", 
    description: "Muzliklar keskin erishi va tinimsiz yomg'irlar natijasida quruqlikning 95% qismi suv ostida qoldi.",
    outsideCondition: "Faqat eng baland tog' cho'qqilarigina suvdan chiqib turibdi. Suvda yirtqich dengiz maxluqlari ko'paygan.",
    future: "Bunkerdan chiqqach, suv ustida suzib yuruvchi yangi sivilizatsiya (suv shaharlari) qurish kerak bo'ladi."
  },
  { 
    title: "Katta qurg'oqchilik va kislorod inqirozi", 
    description: "Barcha o'simliklar qurib bitdi, fotosintez to'xtagan. Atmosferada kislorod darajasi keskin pasaymoqda.",
    outsideCondition: "Hamma yoq cho'lga aylangan. Nafas olish qiyin. Chang bo'ronlari tinmaydi.",
    future: "Sun'iy kislorod ishlab chiqarish stansiyalarini qurish va genetik modifikatsiyalangan tez o'suvchi o'simliklar yaratish kerak."
  }
];

export const BUNKER_CONDITIONS = [
  // --- Resurslar va Oziq-ovqat ---
  "Bunkerda 50 yillik oziq-ovqat zaxirasi bor, lekin ularning muddati tugashiga juda oz qolgan. Tez orada hammasi zaharlanishi mumkin.",
  "Bunkerda kichik gidroponika issiqxonasi bor. Agar jamoada botanik yoki dehqon bo'lsa, doimiy yangi sabzavotlar bo'ladi.",
  "Bunkerda suv filtrlash tizimi buzilgan. Har kuni suv tozalash uchun kimyoviy ishlov berish kerak, aks holda hamma kasallanadi.",
  "Bunkerda faqat 5 kishi uchun kislorod yetarli. Agar 6 kishi kirsak, kislorod muddati 2 barobar qisqaradi.",

  // --- Tibbiyot va Salomatlik ---
  "Bunkerda mukammal jihozlangan tibbiy operatsiya xonasi bor, lekin dori-darmonlar qulflangan seyfda (parolini hech kim bilmaydi).",
  "Bunkerda sun'iy buyrak apparati va kardiostimulyatorlarni zaryadlovchi uskuna bor. Bu og'ir bemorlar uchun ayni muddao.",
  "Bunker dori omborida o'tmishda o'tkazilgan maxfiy virus shtammlari va ularning vaksinalari saqlanmoqda.",

  // --- Texnika va Xavfsizlik ---
  "Bunkerda qurol-yarog' ombori bor: 5 ta pistolet, 2 ta avtomat va granatalar. Lekin ombor kaliti faqat bitta odamda bo'ladi.",
  "Bunker eshigi germetik yopilmaydi. Har safar kuchli radiatsiya yoki xavf bo'lganda kimdir eshikni tashqaridan ushlab turishi kerak.",
  "Bunkerda elektr energiyasi faqat velosiped haydash orqali ishlab chiqariladi. Har kuni kamida 4 soat kimdir pedal aylantirishi shart.",
  "Bunkerda kuchli radioaloqa stansiyasi bor. Biz tashqaridagi boshqa omon qolganlar bilan aloqaga chiqa olamiz.",

  // --- Psixologiya va Ko'ngilochar ---
  "Bunkerda 10 000 ta kitobdan iborat kutubxona va qadimiy qo'lyozmalar bor. Bu insoniyat tarixini saqlab qolish uchun muhim.",
  "Bunkerda kichik kinoteatr va o'yin konsollari bor. Bu jamoaning ruhan tushkunlikka tushib qolmasligini ta'minlaydi.",
  "Bunkerda maxfiy xona bor. U yerda o'tmishdagi barcha o'yinchilarning sirlari yozilgan arxiv hujjatlari topildi."
];

export const PROFESSIONS = [
  "Xirurg", "Dasturchi", "Harbiy uchuvchi", "Dehqon", "Psixolog", "Muhandis-mexanik", "Oshpaz", "O'qituvchi", 
  "Siyosatchi", "Baliqchi", "Rassom", "Kimyogar", "Biolog", "Elektrik", "Arxeolog", "Yurist", "Jurnalist", 
  "Arxitektor", "Veterinar", "Fizik-yadrochi", "Ekolog", "Santexnik", "Kuzatuvchi", "Aktyor", "Sportchi",
  "Ginekolog", "Stomatolog", "Sartarosh", "Uchuvchi", "Kosmonavt", "Politsiyachi", "Yong'in o'chiruvchi",
  "Diplomat", "Iqtisodchi", "Falsafachi", "Tarixchi", "Geolog", "Meteorolog", "Tarjimon", "Haydovchi",
  "Bog'bon", "Tikuvchi", "Duradgor", "Zargar", "Musiqachi", "Yozuvchi", "Fotograf", "Kutubxonachi",
  "Sotsiolog", "Antropolog", "Kriminalist", "Desantchi", "Saper", "Snayper", "Kema kapitani"
];

export const HEALTH_STATUS = [
  "Mutlaqo sog'lom", "Karlik (tug'ma)", "Ko'rlik (bir ko'zi ko'rmaydi)", "OITS (OIV)", "Saraton (1-bosqich)", 
  "Yurak yetishmovchiligi", "Astma", "Diabet (og'ir)", "Oyoq protezi", "Immuniteti o'ta past", 
  "Surunkali uyqusizlik", "Gepatit C", "Tug'maslik (bepushtlik)", "Psixoz", "Epilepsiya",
  "Daltonizm", "Allergiya (changga)", "Anemiya", "Gemorroy", "Gastrit", "Revmatizm",
  "Nutqida nuqsoni bor (duduqlanish)", "Xotira yo'qolishi (qisqa muddatli)", "Depressiya",
  "Gidrofobiya (suvdan qo'rqish - kasallik darajasida)", "Buyrak toshi", "O'pka yetishmovchiligi",
  "Bitta buyragi yo'q", "Surunkali charchoq", "Giyohvandlik (o'tmishda)"
];

export const HOBBIES = [
  "Shaxmat", "Ovchilik", "Tikuvchilik", "Gitara chalish", "Karate", "Pazandalik", "Yugurish", "Rasm chizish", 
  "Yoga", "Karta o'yinlari", "Kitob yig'ish", "Baliq ovi", "Astronomiya", "Raqs", "Boks",
  "Parkur", "Alpinizm", "Diving", "Origami", "Fokuslar ko'rsatish", "She'r yozish", "Tillar o'rganish",
  "Elektronika yig'ish", "Model yasash", "Bog'dorchilik", "Meditatsiya", "Video o'yinlar",
  "Yog'och o'ymakorligi", "Asalarichilik", "Qushlarni kuzatish"
];

export const PHOBIAS = [
  "Qorong'ulikdan qo'rqish", "Balandlikdan qo'rqish", "Yolg'izlikdan qo'rqish", "Hasharotlardan qo'rqish", 
  "Suvdan qo'rqish", "Klodrofobiya (yopiq joy)", "Mikroblardan qo'rqish", "Qondan qo'rqish",
  "Olovdan qo'rqish", "O'limdan qo'rqish", "Ochiq joydan qo'rqish", "Hayvonlardan qo'rqish",
  "Muvaffaqiyatsizlikdan qo'rqish", "Bakteriyalardan qo'rqish", "Keksalikdan qo'rqish", "Yolg'iz qolishdan qo'rqish"
];

export const GENDERS = [
  "Erkak (Geteroseksual, 100% sog'lom)",
  "Ayol (Geteroseksual, 100% sog'lom)",
  "Erkak (Geteroseksual, nasliy kasallik tashuvchisi)",
  "Ayol (Geteroseksual, nasliy kasallik tashuvchisi)",
  "Erkak (Gomoseksual)",
  "Ayol (Gomoseksual)",
  "Erkak (Biseksual)",
  "Ayol (Biseksual)",
  "Erkak (Aseksual - jinsiy aloqaga xohishi yo'q)",
  "Ayol (Aseksual - jinsiy aloqaga xohishi yo'q)",
  "Erkak (Bepusht / Sterile)",
  "Ayol (Bepusht / Sterile)",
  "Erkak (Vazektomiya qilingan - qayta tiklab bo'lmaydi)",
  "Ayol (Bachadon olib tashlangan)",
  "Ayol (Klimaks/Menopauza boshlangan)",
  "Erkak (Reproduktiv qobiliyati o'ta past - 5%)",
  "Ayol (Homilador - 1-trimestr, toksikoz)",
  "Ayol (Homilador - 8-oylik, tez orada tug'adi)",
  "Ayol (Yaqinda tuqqan, emizikli ona - qo'shimcha resurs talab qiladi)",
  "Erkak (Sobiq ayol - gormonal terapiyada)",
  "Ayol (Sobiq erkak - gormonal terapiyada)",
  "Gerkofrodit (Ikkala jinsiy a'zo ham rivojlangan)",
  "Erkak (Androfobiya - ayollardan qo'rqadi)",
  "Ayol (Ginefobiya - erkaklardan qo'rqadi)",
  "Erkak (Seks-addikt - jinsiy moyilligi o'ta yuqori)",
  "Ayol (Nimfomaniya - nazorat qilib bo'lmas moyillik)"
];

export const FACTS = [
  "Manyak qotil (yashirin)", "Qora sehr bilan shug'ullanadi", "Bunkerni qurgan muhandis", 
  "Muvaffaqiyatli startap asoschisi", "Qamoqdan qochgan", "Nobel mukofoti sovrindori", 
  "Sobiq josus (shpion)", "O'rmonda 5 yil yolg'iz yashagan", "Prezidentning maxfiy maslahatchisi", 
  "Ko'p tillarni biladi", "Bir marta odam o'ldirgan (o'zini himoya qilib)", "Diniy fanatik",
  "Giyohvand moddalar sotuvchisi", "Eski xaritalar kolleksioneri", "Mashhur bloger",
  "Sobiq bank o'g'risi", "Maxfiy laboratoriya xodimi", "Barcha o'simliklarni taniydi",
  "Yovvoyi hayvonlar bilan tillasha oladi", "Elektronikani mukammal tushunadi",
  "O'tmishda harbiy jinoyatchi bo'lgan", "O'zini payg'ambar deb hisoblaydi",
  "Dunyodagi eng boy odamlardan biri", "Hech qachon kasal bo'lmagan"
];

export const BAGGAGE = [
  "Mushuk", "Gitara", "Pistolet (o'qsiz)", "Bir quti dori-darmon", "Eski xarita", "Urug'lar to'plami", 
  "Radio", "Kitoblar to'plami", "Oltin yombisi", "Noutbuk (zaryadsiz)", "Kichik quyosh paneli", 
  "Pichoq", "Arqon (20 metr)", "Gugurt (10 quti)", "Fotoapparat", "Spirt (5 litr)",
  "Durbin", "Baliq ovi anjomlari", "Asboblar to'plami", "Uxlaydigan qop (spalnik)",
  "Gaz niqobi (protivogaz)", "Kompas", "Chiroq (fonar)", "Bolta", "Kichik chodir",
  "Konserva ochadigan pichoq", "Suv tozalaydigan tabletkalar", "Signal raketasi",
  "Kichik tibbiy sumka", "Zaharli moddalar detektori"
];

export const SPECIAL_CARDS = [
  // --- SOG'LIQ (HEALTH) BILAN BOG'LIQ ---
  "Sog'liq almashinuvi: O'zingiz tanlagan o'yinchi bilan sog'liq kartalaringizni almashtiring.",
  "Epidemiya: Barcha o'yinchilarning ochiq sog'liq kartalari yig'ib olinib, tasodifiy qayta tarqatilsin.",
  "Sog'liqni nusxalash: Tanlagan o'yinchingizning sog'lig'i sizniki bilan bir xil bo'ladi (nusxa olinadi).",
  "Yashirin tanlov: Ikkita yangi sog'liq kartasini oling, ko'rmasdan birini o'zingizga, ikkinchisini tanlagan o'yinchingizga bering.",
  "Tibbiy ko'rik: Barcha yopiq sog'liq kartalari ochilsin.",

  // --- KASB (PROFESSION) BILAN BOG'LIQ ---
  "Kasbiy rotatsiya: Tanlangan ikki o'yinchining kasblari o'zaro almashtirilsin.",
  "Diplomni bekor qilish: Tanlangan o'yinchining kasbi o'chirilsin va unga yangi tasodifiy kasb berilsin.",
  "Kasbdoshlar: Sizning kasbingiz tanlangan o'yinchi bilan bir xil bo'ladi.",
  "Ishga qabul: O'yindan chiqib ketgan o'yinchining kasbini o'zingizga ikkinchi kasb sifatida oling.",

  // --- BIOLOGIYA (BIOLOGY - YOSH VA JINS) ---
  "Yoshartirish: Tanlagan o'yinchingiz yoshini o'zingiz xohlagan raqamga o'zgartiring (18-90 oralig'ida).",
  "Jinsiy o'zgarish: Tanlangan o'yinchining jinsi qarama-qarshisiga o'zgartirilsin.",
  "Nasl qoldirish: Tanlangan ikki o'yinchining fertillik darajasi 100% deb belgilansin.",

  // --- BAXT VA FAKT (FACTS) ---
  "Fosh qilish: Tanlangan o'yinchining yopiq 'Fakt' kartasini hamma uchun oching.",
  "Taqdir almashinuvi: Barcha o'yinchilar o'z 'Fakt' kartalarini chapdagi sherigiga uzatadi.",
  "O'tmishni o'chirish: O'zingizning 'Fakt' kartangizni yangisiga almashtiring.",

  // --- BAGAJ (BAGGAGE) ---
  "Bagaj o'g'risi: Tanlangan o'yinchining bagajini o'zingizga oling, unga esa o'zingiznikini bering.",
  "Katta tekshiruv: Hamma o'z bagajini ochib ko'rsatsin.",
  "Bagajni tashlash: Tanlangan o'yinchi o'z bagajidan mahrum bo'ladi.",

  // --- OVOZ BERISH VA OMON QOLISH (VOTING/SURVIVAL) ---
  "Ikki barobar ovoz: Ushbu raundda sizning ovozingiz ikkita deb hisoblanadi.",
  "Veto huquqi: Ovoz berish natijasida chiqarib yuborilayotgan o'yinchini bunkerda olib qoling.",
  "Tenglikni buzish: Agar ovozlar teng kelib qolsa, yakuniy qarorni siz chiqarasiz.",
  "Qayta ovoz berish: Ushbu raunddagi ovoz berish natijalarini bekor qiling va raundni boshidan boshlang.",

  // --- GLOBAL (CATASTROPHE & BUNKER) ---
  "Kutilmagan yordam: Bunker sharoitlariga (Bunker Conditions) bitta ijobiy sharoit qo'shing.",
  "Yangi dunyoqarash: Katastrofa kartasini boshqasiga almashtiring.",
  "Bunker kengayishi: Bunkerga kirishi mumkin bo'lgan odamlar sonini 1 taga ko'paytiring."
];
