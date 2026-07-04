import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export const LANGS = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "sw", label: "Kiswahili", flag: "🇹🇿" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
] as const;

export type LangCode = (typeof LANGS)[number]["code"];

type Dict = Record<string, string>;

const T: Record<LangCode, Dict> = {
  en: {
    "nav.rooms": "Rooms", "nav.facilities": "Facilities", "nav.book": "Book",
    "nav.dining": "Dining", "nav.safaris": "Safaris", "nav.culture": "Culture",
    "nav.gallery": "Gallery", "nav.contact": "Contact",
    "header.signIn": "Sign in with Pi", "header.connecting": "Connecting…",
    "hero.badge": "Serengeti · Tanzania · Pi Network Accepted",
    "hero.title": "Welcome to the heart of the wild.",
    "hero.subtitle": "Prices shown in Pi (π) at the Global Consensus Value of $314,159 per Pi.",
    "hero.book": "Book Your Stay", "hero.viaWa": "via WhatsApp",
    "rooms.title": "Rooms & Suites", "rooms.subtitle": "Luxury tailored for the wild spirit.",
    "rooms.enquire": "Enquire", "rooms.night": "night", "rooms.pay": "Pay",
    "facilities.title": "Lodge Attractions",
    "facilities.subtitle": "Spaces designed to bring the Serengeti even closer.",
    "book.badge": "Reservation", "book.title": "Book Your Stay",
    "book.subtitle": "Pay securely with Pi. Your booking confirmation and code will be sent to your phone.",
    "menu.title": "Dining", "menu.subtitle": "Cuisine of the Serengeti & the World",
    "menu.order": "Order Food",
    "menu.breakfast": "Breakfast", "menu.tanzanian": "Tanzanian Mains",
    "menu.international": "International", "menu.drinks": "Drinks & Coffee",
    "tours.title": "Safaris & Excursions", "tours.enquire": "Enquire / Book", "tours.perPerson": "per person",
    "culture.title": "Culture & Remote Work",
    "culture.subtitle": "From Maasai heritage to a coffee-fueled workspace under the acacia trees.",
    "gallery.title": "Gallery",
    "help.title": "Need Help?", "help.subtitle": "For support or payment issues, contact us directly.",
    "contact.title": "Get in Touch", "lang.label": "Language",
  },
  sw: {
    "nav.rooms": "Vyumba", "nav.facilities": "Huduma", "nav.book": "Weka Nafasi",
    "nav.dining": "Chakula", "nav.safaris": "Safari", "nav.culture": "Utamaduni",
    "nav.gallery": "Picha", "nav.contact": "Wasiliana",
    "header.signIn": "Ingia na Pi", "header.connecting": "Inaunganisha…",
    "hero.badge": "Serengeti · Tanzania · Malipo ya Pi Yanakubalika",
    "hero.title": "Karibu moyoni mwa pori.",
    "hero.subtitle": "Bei zinaonyeshwa kwa Pi (π) kwa GCV ya $314,159 kwa Pi moja.",
    "hero.book": "Weka Nafasi Yako", "hero.viaWa": "kupitia WhatsApp",
    "rooms.title": "Vyumba & Suites", "rooms.subtitle": "Anasa iliyokusudiwa roho ya porini.",
    "rooms.enquire": "Uliza", "rooms.night": "usiku", "rooms.pay": "Lipa",
    "facilities.title": "Vivutio vya Lodge",
    "facilities.subtitle": "Sehemu zilizoundwa kukukaribisha zaidi na Serengeti.",
    "book.badge": "Uwekaji Nafasi", "book.title": "Weka Nafasi Yako",
    "book.subtitle": "Lipa salama kwa Pi. Uthibitisho na msimbo utatumwa kwa simu yako.",
    "menu.title": "Vyakula", "menu.subtitle": "Vyakula vya Serengeti na Dunia",
    "menu.order": "Agiza Chakula",
    "menu.breakfast": "Kifungua Kinywa", "menu.tanzanian": "Vyakula vya Kitanzania",
    "menu.international": "Vyakula vya Kimataifa", "menu.drinks": "Vinywaji & Kahawa",
    "tours.title": "Safari & Matembezi", "tours.enquire": "Uliza / Weka", "tours.perPerson": "kwa mtu",
    "culture.title": "Utamaduni & Kazi za Mbali",
    "culture.subtitle": "Kutoka urithi wa Kimaasai hadi eneo la kazi lenye kahawa chini ya miti ya mkacha.",
    "gallery.title": "Picha",
    "help.title": "Unahitaji Msaada?", "help.subtitle": "Kwa msaada au tatizo la malipo, wasiliana nasi moja kwa moja.",
    "contact.title": "Wasiliana Nasi", "lang.label": "Lugha",
  },
  fr: {
    "nav.rooms": "Chambres", "nav.facilities": "Services", "nav.book": "Réserver",
    "nav.dining": "Restauration", "nav.safaris": "Safaris", "nav.culture": "Culture",
    "nav.gallery": "Galerie", "nav.contact": "Contact",
    "header.signIn": "Se connecter avec Pi", "header.connecting": "Connexion…",
    "hero.badge": "Serengeti · Tanzanie · Pi Network accepté",
    "hero.title": "Bienvenue au cœur de la nature sauvage.",
    "hero.subtitle": "Prix affichés en Pi (π) à la Valeur de Consensus Global de 314 159 $ par Pi.",
    "hero.book": "Réservez votre séjour", "hero.viaWa": "via WhatsApp",
    "rooms.title": "Chambres & Suites", "rooms.subtitle": "Un luxe conçu pour l'esprit sauvage.",
    "rooms.enquire": "Demander", "rooms.night": "nuit", "rooms.pay": "Payer",
    "facilities.title": "Attractions du Lodge",
    "facilities.subtitle": "Des espaces conçus pour vous rapprocher du Serengeti.",
    "book.badge": "Réservation", "book.title": "Réservez votre séjour",
    "book.subtitle": "Payez en toute sécurité avec Pi. La confirmation vous sera envoyée par téléphone.",
    "menu.title": "Restauration", "menu.subtitle": "Cuisine du Serengeti et du monde",
    "menu.order": "Commander",
    "menu.breakfast": "Petit-déjeuner", "menu.tanzanian": "Plats tanzaniens",
    "menu.international": "International", "menu.drinks": "Boissons & Café",
    "tours.title": "Safaris & Excursions", "tours.enquire": "Demander / Réserver", "tours.perPerson": "par personne",
    "culture.title": "Culture & Télétravail",
    "culture.subtitle": "Du patrimoine Maasaï à un espace de travail sous les acacias.",
    "gallery.title": "Galerie",
    "help.title": "Besoin d'aide ?", "help.subtitle": "Pour l'assistance ou les paiements, contactez-nous.",
    "contact.title": "Contactez-nous", "lang.label": "Langue",
  },
  de: {
    "nav.rooms": "Zimmer", "nav.facilities": "Angebote", "nav.book": "Buchen",
    "nav.dining": "Restaurant", "nav.safaris": "Safaris", "nav.culture": "Kultur",
    "nav.gallery": "Galerie", "nav.contact": "Kontakt",
    "header.signIn": "Mit Pi anmelden", "header.connecting": "Verbindet…",
    "hero.badge": "Serengeti · Tansania · Pi Network akzeptiert",
    "hero.title": "Willkommen im Herzen der Wildnis.",
    "hero.subtitle": "Preise in Pi (π) zum Global Consensus Value von 314.159 $ pro Pi.",
    "hero.book": "Aufenthalt buchen", "hero.viaWa": "über WhatsApp",
    "rooms.title": "Zimmer & Suiten", "rooms.subtitle": "Luxus für den wilden Geist.",
    "rooms.enquire": "Anfragen", "rooms.night": "Nacht", "rooms.pay": "Zahlen",
    "facilities.title": "Lodge-Attraktionen",
    "facilities.subtitle": "Räume, die Sie der Serengeti näherbringen.",
    "book.badge": "Reservierung", "book.title": "Aufenthalt buchen",
    "book.subtitle": "Sicher mit Pi bezahlen. Bestätigung wird an Ihr Telefon gesendet.",
    "menu.title": "Restaurant", "menu.subtitle": "Küche der Serengeti & der Welt",
    "menu.order": "Essen bestellen",
    "menu.breakfast": "Frühstück", "menu.tanzanian": "Tansanische Hauptgerichte",
    "menu.international": "International", "menu.drinks": "Getränke & Kaffee",
    "tours.title": "Safaris & Ausflüge", "tours.enquire": "Anfragen / Buchen", "tours.perPerson": "pro Person",
    "culture.title": "Kultur & Remote-Arbeit",
    "culture.subtitle": "Vom Maasai-Erbe zum Arbeitsplatz unter Akazien.",
    "gallery.title": "Galerie",
    "help.title": "Brauchen Sie Hilfe?", "help.subtitle": "Für Support oder Zahlungen kontaktieren Sie uns direkt.",
    "contact.title": "Kontaktieren Sie uns", "lang.label": "Sprache",
  },
  es: {
    "nav.rooms": "Habitaciones", "nav.facilities": "Servicios", "nav.book": "Reservar",
    "nav.dining": "Restaurante", "nav.safaris": "Safaris", "nav.culture": "Cultura",
    "nav.gallery": "Galería", "nav.contact": "Contacto",
    "header.signIn": "Iniciar sesión con Pi", "header.connecting": "Conectando…",
    "hero.badge": "Serengeti · Tanzania · Pi Network aceptado",
    "hero.title": "Bienvenido al corazón de lo salvaje.",
    "hero.subtitle": "Precios en Pi (π) al Valor de Consenso Global de $314,159 por Pi.",
    "hero.book": "Reserva tu estancia", "hero.viaWa": "por WhatsApp",
    "rooms.title": "Habitaciones y Suites", "rooms.subtitle": "Lujo para el espíritu salvaje.",
    "rooms.enquire": "Consultar", "rooms.night": "noche", "rooms.pay": "Pagar",
    "facilities.title": "Atracciones del Lodge",
    "facilities.subtitle": "Espacios diseñados para acercarte al Serengeti.",
    "book.badge": "Reserva", "book.title": "Reserva tu estancia",
    "book.subtitle": "Paga de forma segura con Pi. La confirmación llegará a tu teléfono.",
    "menu.title": "Restaurante", "menu.subtitle": "Cocina del Serengeti y del mundo",
    "menu.order": "Pedir comida",
    "menu.breakfast": "Desayuno", "menu.tanzanian": "Platos tanzanos",
    "menu.international": "Internacional", "menu.drinks": "Bebidas y café",
    "tours.title": "Safaris y Excursiones", "tours.enquire": "Consultar / Reservar", "tours.perPerson": "por persona",
    "culture.title": "Cultura y Trabajo Remoto",
    "culture.subtitle": "Del patrimonio Maasái a un espacio de trabajo bajo las acacias.",
    "gallery.title": "Galería",
    "help.title": "¿Necesitas ayuda?", "help.subtitle": "Para soporte o pagos, contáctanos directamente.",
    "contact.title": "Ponte en contacto", "lang.label": "Idioma",
  },
  it: {
    "nav.rooms": "Camere", "nav.facilities": "Servizi", "nav.book": "Prenota",
    "nav.dining": "Ristorante", "nav.safaris": "Safari", "nav.culture": "Cultura",
    "nav.gallery": "Galleria", "nav.contact": "Contatti",
    "header.signIn": "Accedi con Pi", "header.connecting": "Connessione…",
    "hero.badge": "Serengeti · Tanzania · Pi Network accettato",
    "hero.title": "Benvenuti nel cuore selvaggio.",
    "hero.subtitle": "Prezzi in Pi (π) al Global Consensus Value di $314.159 per Pi.",
    "hero.book": "Prenota il soggiorno", "hero.viaWa": "via WhatsApp",
    "rooms.title": "Camere e Suite", "rooms.subtitle": "Lusso pensato per lo spirito selvaggio.",
    "rooms.enquire": "Richiedi", "rooms.night": "notte", "rooms.pay": "Paga",
    "facilities.title": "Attrazioni del Lodge",
    "facilities.subtitle": "Spazi progettati per avvicinarti al Serengeti.",
    "book.badge": "Prenotazione", "book.title": "Prenota il soggiorno",
    "book.subtitle": "Paga in sicurezza con Pi. Conferma inviata al tuo telefono.",
    "menu.title": "Ristorante", "menu.subtitle": "Cucina del Serengeti e del mondo",
    "menu.order": "Ordina",
    "menu.breakfast": "Colazione", "menu.tanzanian": "Piatti tanzaniani",
    "menu.international": "Internazionale", "menu.drinks": "Bevande e caffè",
    "tours.title": "Safari & Escursioni", "tours.enquire": "Richiedi / Prenota", "tours.perPerson": "a persona",
    "culture.title": "Cultura & Lavoro Remoto",
    "culture.subtitle": "Dal patrimonio Maasai a uno spazio di lavoro sotto le acacie.",
    "gallery.title": "Galleria",
    "help.title": "Serve aiuto?", "help.subtitle": "Per assistenza o pagamenti, contattaci direttamente.",
    "contact.title": "Contattaci", "lang.label": "Lingua",
  },
  pt: {
    "nav.rooms": "Quartos", "nav.facilities": "Serviços", "nav.book": "Reservar",
    "nav.dining": "Restaurante", "nav.safaris": "Safáris", "nav.culture": "Cultura",
    "nav.gallery": "Galeria", "nav.contact": "Contato",
    "header.signIn": "Entrar com Pi", "header.connecting": "Conectando…",
    "hero.badge": "Serengeti · Tanzânia · Pi Network aceito",
    "hero.title": "Bem-vindo ao coração selvagem.",
    "hero.subtitle": "Preços em Pi (π) pelo Global Consensus Value de $314.159 por Pi.",
    "hero.book": "Reserve sua estadia", "hero.viaWa": "via WhatsApp",
    "rooms.title": "Quartos e Suítes", "rooms.subtitle": "Luxo para o espírito selvagem.",
    "rooms.enquire": "Consultar", "rooms.night": "noite", "rooms.pay": "Pagar",
    "facilities.title": "Atrações do Lodge",
    "facilities.subtitle": "Espaços que te aproximam do Serengeti.",
    "book.badge": "Reserva", "book.title": "Reserve sua estadia",
    "book.subtitle": "Pague com segurança usando Pi. Confirmação enviada ao seu telefone.",
    "menu.title": "Restaurante", "menu.subtitle": "Cozinha do Serengeti e do Mundo",
    "menu.order": "Pedir comida",
    "menu.breakfast": "Café da manhã", "menu.tanzanian": "Pratos tanzanianos",
    "menu.international": "Internacional", "menu.drinks": "Bebidas e café",
    "tours.title": "Safáris e Excursões", "tours.enquire": "Consultar / Reservar", "tours.perPerson": "por pessoa",
    "culture.title": "Cultura & Trabalho Remoto",
    "culture.subtitle": "Da herança Maasai a um espaço de trabalho sob as acácias.",
    "gallery.title": "Galeria",
    "help.title": "Precisa de ajuda?", "help.subtitle": "Para suporte ou pagamentos, fale conosco.",
    "contact.title": "Fale conosco", "lang.label": "Idioma",
  },
  zh: {
    "nav.rooms": "客房", "nav.facilities": "设施", "nav.book": "预订",
    "nav.dining": "餐饮", "nav.safaris": "野生动物游猎", "nav.culture": "文化",
    "nav.gallery": "画廊", "nav.contact": "联系",
    "header.signIn": "使用 Pi 登录", "header.connecting": "连接中…",
    "hero.badge": "塞伦盖蒂 · 坦桑尼亚 · 接受 Pi 网络支付",
    "hero.title": "欢迎来到荒野的中心。",
    "hero.subtitle": "价格以 Pi (π) 显示,按每 Pi 314,159 美元的全球共识价值。",
    "hero.book": "预订入住", "hero.viaWa": "通过 WhatsApp",
    "rooms.title": "客房与套房", "rooms.subtitle": "为野性灵魂打造的奢华。",
    "rooms.enquire": "咨询", "rooms.night": "晚", "rooms.pay": "支付",
    "facilities.title": "度假村亮点",
    "facilities.subtitle": "让您更接近塞伦盖蒂的空间。",
    "book.badge": "预订", "book.title": "预订入住",
    "book.subtitle": "使用 Pi 安全支付。确认信息将发送至您的手机。",
    "menu.title": "餐饮", "menu.subtitle": "塞伦盖蒂与世界美食",
    "menu.order": "订餐",
    "menu.breakfast": "早餐", "menu.tanzanian": "坦桑尼亚主菜",
    "menu.international": "国际菜", "menu.drinks": "饮品与咖啡",
    "tours.title": "野生动物游猎", "tours.enquire": "咨询 / 预订", "tours.perPerson": "每人",
    "culture.title": "文化与远程办公",
    "culture.subtitle": "从马赛族传统到金合欢树下的工作空间。",
    "gallery.title": "画廊",
    "help.title": "需要帮助?", "help.subtitle": "如需支持或付款帮助,请直接联系我们。",
    "contact.title": "联系我们", "lang.label": "语言",
  },
  ar: {
    "nav.rooms": "الغرف", "nav.facilities": "المرافق", "nav.book": "احجز",
    "nav.dining": "المطعم", "nav.safaris": "رحلات السفاري", "nav.culture": "الثقافة",
    "nav.gallery": "المعرض", "nav.contact": "اتصل",
    "header.signIn": "تسجيل الدخول بـ Pi", "header.connecting": "جارٍ الاتصال…",
    "hero.badge": "سيرينغيتي · تنزانيا · شبكة Pi مقبولة",
    "hero.title": "أهلاً بك في قلب البرية.",
    "hero.subtitle": "الأسعار بـ Pi (π) بقيمة الإجماع العالمية 314,159 دولار لكل Pi.",
    "hero.book": "احجز إقامتك", "hero.viaWa": "عبر واتساب",
    "rooms.title": "الغرف والأجنحة", "rooms.subtitle": "فخامة مصممة للروح البرية.",
    "rooms.enquire": "استفسار", "rooms.night": "ليلة", "rooms.pay": "ادفع",
    "facilities.title": "معالم النزل",
    "facilities.subtitle": "مساحات مصممة لتقربك من سيرينغيتي.",
    "book.badge": "الحجز", "book.title": "احجز إقامتك",
    "book.subtitle": "ادفع بأمان عبر Pi. سيصلك التأكيد على هاتفك.",
    "menu.title": "المطعم", "menu.subtitle": "مطبخ سيرينغيتي والعالم",
    "menu.order": "اطلب الطعام",
    "menu.breakfast": "الإفطار", "menu.tanzanian": "أطباق تنزانية",
    "menu.international": "دولي", "menu.drinks": "المشروبات والقهوة",
    "tours.title": "السفاري والرحلات", "tours.enquire": "استفسار / حجز", "tours.perPerson": "للشخص",
    "culture.title": "الثقافة والعمل عن بُعد",
    "culture.subtitle": "من تراث الماساي إلى مساحة عمل تحت أشجار الأكاسيا.",
    "gallery.title": "المعرض",
    "help.title": "تحتاج مساعدة؟", "help.subtitle": "للدعم أو مشاكل الدفع، تواصل معنا مباشرة.",
    "contact.title": "تواصل معنا", "lang.label": "اللغة",
  },
  ru: {
    "nav.rooms": "Номера", "nav.facilities": "Удобства", "nav.book": "Бронь",
    "nav.dining": "Ресторан", "nav.safaris": "Сафари", "nav.culture": "Культура",
    "nav.gallery": "Галерея", "nav.contact": "Контакты",
    "header.signIn": "Войти через Pi", "header.connecting": "Подключение…",
    "hero.badge": "Серенгети · Танзания · Принимается Pi Network",
    "hero.title": "Добро пожаловать в сердце дикой природы.",
    "hero.subtitle": "Цены в Pi (π) по Global Consensus Value $314 159 за Pi.",
    "hero.book": "Забронировать", "hero.viaWa": "через WhatsApp",
    "rooms.title": "Номера и Сюиты", "rooms.subtitle": "Роскошь для дикого духа.",
    "rooms.enquire": "Запросить", "rooms.night": "ночь", "rooms.pay": "Оплатить",
    "facilities.title": "Достопримечательности лоджа",
    "facilities.subtitle": "Пространства, приближающие вас к Серенгети.",
    "book.badge": "Бронирование", "book.title": "Забронировать проживание",
    "book.subtitle": "Безопасная оплата через Pi. Подтверждение придёт на телефон.",
    "menu.title": "Ресторан", "menu.subtitle": "Кухня Серенгети и мира",
    "menu.order": "Заказать еду",
    "menu.breakfast": "Завтрак", "menu.tanzanian": "Танзанийские блюда",
    "menu.international": "Интернациональные", "menu.drinks": "Напитки и кофе",
    "tours.title": "Сафари и экскурсии", "tours.enquire": "Запрос / Бронь", "tours.perPerson": "с человека",
    "culture.title": "Культура и удалённая работа",
    "culture.subtitle": "От наследия масаи до рабочего пространства под акациями.",
    "gallery.title": "Галерея",
    "help.title": "Нужна помощь?", "help.subtitle": "По вопросам поддержки или оплаты свяжитесь с нами.",
    "contact.title": "Свяжитесь с нами", "lang.label": "Язык",
  },
  ja: {
    "nav.rooms": "客室", "nav.facilities": "施設", "nav.book": "予約",
    "nav.dining": "ダイニング", "nav.safaris": "サファリ", "nav.culture": "文化",
    "nav.gallery": "ギャラリー", "nav.contact": "連絡先",
    "header.signIn": "Pi でサインイン", "header.connecting": "接続中…",
    "hero.badge": "セレンゲティ · タンザニア · Pi Network 対応",
    "hero.title": "野生の中心へようこそ。",
    "hero.subtitle": "価格は Pi (π) 表示、GCV は 1 Pi = 314,159 米ドル。",
    "hero.book": "宿泊予約", "hero.viaWa": "WhatsApp 経由",
    "rooms.title": "客室 & スイート", "rooms.subtitle": "野生の魂のための贅沢。",
    "rooms.enquire": "問い合わせ", "rooms.night": "泊", "rooms.pay": "支払う",
    "facilities.title": "ロッジの魅力",
    "facilities.subtitle": "セレンゲティをより身近に感じる空間。",
    "book.badge": "予約", "book.title": "ご宿泊予約",
    "book.subtitle": "Pi で安全にお支払い。確認は携帯へ届きます。",
    "menu.title": "ダイニング", "menu.subtitle": "セレンゲティと世界の料理",
    "menu.order": "注文する",
    "menu.breakfast": "朝食", "menu.tanzanian": "タンザニア料理",
    "menu.international": "インターナショナル", "menu.drinks": "ドリンク & コーヒー",
    "tours.title": "サファリ & エクスカーション", "tours.enquire": "問い合わせ / 予約", "tours.perPerson": "1名様",
    "culture.title": "文化 & リモートワーク",
    "culture.subtitle": "マサイの遺産からアカシアの木陰のワークスペースまで。",
    "gallery.title": "ギャラリー",
    "help.title": "サポートが必要ですか?", "help.subtitle": "サポートやお支払いの問題は直接ご連絡ください。",
    "contact.title": "お問い合わせ", "lang.label": "言語",
  },
  hi: {
    "nav.rooms": "कमरे", "nav.facilities": "सुविधाएं", "nav.book": "बुक करें",
    "nav.dining": "भोजन", "nav.safaris": "सफारी", "nav.culture": "संस्कृति",
    "nav.gallery": "गैलरी", "nav.contact": "संपर्क",
    "header.signIn": "Pi से साइन इन", "header.connecting": "जुड़ रहा है…",
    "hero.badge": "सेरेंगेटी · तंज़ानिया · Pi नेटवर्क स्वीकृत",
    "hero.title": "जंगल के हृदय में आपका स्वागत है।",
    "hero.subtitle": "कीमतें Pi (π) में, GCV $314,159 प्रति Pi।",
    "hero.book": "अपना ठहराव बुक करें", "hero.viaWa": "WhatsApp के माध्यम से",
    "rooms.title": "कमरे और सुइट्स", "rooms.subtitle": "जंगली आत्मा के लिए विलासिता।",
    "rooms.enquire": "पूछताछ", "rooms.night": "रात", "rooms.pay": "भुगतान करें",
    "facilities.title": "लॉज आकर्षण",
    "facilities.subtitle": "सेरेंगेटी को और करीब लाने वाले स्थान।",
    "book.badge": "आरक्षण", "book.title": "अपना ठहराव बुक करें",
    "book.subtitle": "Pi से सुरक्षित भुगतान करें। पुष्टि आपके फ़ोन पर भेजी जाएगी।",
    "menu.title": "भोजन", "menu.subtitle": "सेरेंगेटी और विश्व का व्यंजन",
    "menu.order": "खाना ऑर्डर करें",
    "menu.breakfast": "नाश्ता", "menu.tanzanian": "तंज़ानियाई व्यंजन",
    "menu.international": "अंतर्राष्ट्रीय", "menu.drinks": "पेय और कॉफी",
    "tours.title": "सफारी और भ्रमण", "tours.enquire": "पूछें / बुक करें", "tours.perPerson": "प्रति व्यक्ति",
    "culture.title": "संस्कृति और रिमोट वर्क",
    "culture.subtitle": "मासाई विरासत से लेकर बबूल के पेड़ों के नीचे कार्यस्थल तक।",
    "gallery.title": "गैलरी",
    "help.title": "सहायता चाहिए?", "help.subtitle": "सहायता या भुगतान के लिए हमसे सीधे संपर्क करें।",
    "contact.title": "संपर्क करें", "lang.label": "भाषा",
  },
};

const LS_KEY = "kizazi_lang_v1";
const RTL: LangCode[] = ["ar"];

type Ctx = { lang: LangCode; setLang: (c: LangCode) => void; t: (k: string) => string };
const LangCtx = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("en");

  useEffect(() => {
    const saved = typeof localStorage !== "undefined" ? (localStorage.getItem(LS_KEY) as LangCode | null) : null;
    if (saved && T[saved]) setLangState(saved);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = RTL.includes(lang) ? "rtl" : "ltr";
  }, [lang]);

  const setLang = (c: LangCode) => {
    setLangState(c);
    try { localStorage.setItem(LS_KEY, c); } catch { /* ignore */ }
  };

  const value = useMemo<Ctx>(() => ({
    lang, setLang,
    t: (k) => T[lang]?.[k] ?? T.en[k] ?? k,
  }), [lang]);

  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>;
}

export function useT() {
  const ctx = useContext(LangCtx);
  if (!ctx) throw new Error("useT must be used inside LanguageProvider");
  return ctx;
}

export function LanguageSwitcher() {
  const { lang, setLang, t } = useT();
  const current = LANGS.find((l) => l.code === lang) ?? LANGS[0];
  return (
    <label className="relative flex items-center gap-1 text-[11px] font-medium">
      <span className="sr-only">{t("lang.label")}</span>
      <span aria-hidden className="text-base leading-none">{current.flag}</span>
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as LangCode)}
        aria-label={t("lang.label")}
        className="appearance-none bg-transparent pr-4 pl-1 py-1 text-[11px] uppercase tracking-widest border-b border-earth-900/20 focus:outline-none focus:border-savannah cursor-pointer"
      >
        {LANGS.map((l) => (
          <option key={l.code} value={l.code} className="text-earth-900">
            {l.flag} {l.label}
          </option>
        ))}
      </select>
    </label>
  );
}
