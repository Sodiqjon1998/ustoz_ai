<?php

/**
 * "HTML da video tegi" — Informatika, 8-sinf, 45 daqiqa.
 *
 * Barcha faktlar tekshirilgan:
 *  - <video> tegi HTML5 spetsifikatsiyasiga kiritilgan; HTML5 W3C tavsiyasi
 *    sifatida 2014-yil 28-oktabrda rasmiylashtirilgan.
 *  - Adobe Flash Player'ni qo'llab-quvvatlash 2020-yil 31-dekabrda to'xtatilgan.
 *  - Slaydas keltirilgan piksel o'lchamlari — standart video rezolyutsiyalari
 *    (854x480, 1280x720, 1920x1080, 2560x1440, 3840x2160), ya'ni aniq sonlar.
 *  - Atributlar nomi va vazifasi HTML jonli standartiga muvofiq.
 */

return [
    'lesson_type' => 'Yangi bilim beruvchi dars',

    'objective_main' => "O'quvchilarga HTML5 <video> tegi yordamida veb-sahifaga video joylashtirish, uni atributlar bilan boshqarish va turli brauzerlar uchun muqobil formatlar berish ko'nikmasini shakllantirish.",

    'objectives' => [
        'educational' => "O'quvchi <video> tegining sintaksisini, src, controls, width, height, poster, autoplay, muted, loop atributlarining vazifasini biladi va <source> tegi orqali bir necha format berishni tushuntira oladi.",
        'developmental' => "O'quvchida kod yozish, xatoni topib tuzatish va brauzer natijasini tahlil qilib xulosa chiqarish ko'nikmasi rivojlanadi.",
        'upbringing' => "O'quvchida internetdan olingan materialdan foydalanishda mualliflik huquqiga hurmat va o'z ishini puxta bajarish mas'uliyati tarbiyalanadi.",
    ],

    'equipment' => [
        'Kompyuter va proyektor',
        'Matn muharriri (Notepad++ yoki VS Code)',
        'Brauzer (Chrome yoki Firefox)',
        'Namuna video fayl (.mp4)',
        'Tarqatma material',
    ],

    'phases' => [
        [
            'name' => 'Tashkiliy qism',
            'duration_min' => 2,
            'content_html' => "<p>O'qituvchi o'quvchilar bilan salomlashadi, davomatni tekshiradi va sinfni darsga tayyorlaydi.</p><p>Diqqatni jalb qilish uchun savol beriladi: <b>\"YouTube'da video ko'rayotganingizda kompyuteringizga hech qanday qo'shimcha dastur o'rnatmaysiz. Ilgari esa buning uchun Flash Player kerak edi. Nima o'zgardi?\"</b></p>",
        ],
        [
            'name' => "O'tilganni faollashtirish",
            'duration_min' => 8,
            'content_html' => "<p>Oldingi mavzular (HTML teglari, atributlar, rasm joylashtirish) bo'yicha savol-javob o'tkaziladi:</p><ul><li>HTML tegi nima va u atributdan nimasi bilan farq qiladi?</li><li><b>&lt;img&gt;</b> tegi yordamida sahifaga rasm qanday joylashtiriladi? <b>src</b> atributi nima vazifa bajaradi?</li><li>Qaysi teglar yopuvchi tegga muhtoj emas? (&lt;img&gt;, &lt;br&gt;, &lt;hr&gt;)</li><li>Fayl yo'li nima? Nisbiy va mutlaq yo'l farqi nimada?</li></ul><p><b>Miya to'foni:</b> \"Rasmni &lt;img&gt; bilan qo'ydik. Videoni ham xuddi shunday qo'ysa bo'ladimi? Video rasmdan nimasi bilan farq qiladi?\" O'quvchilar javoblari doskaga yoziladi — ular orasidan \"videoni to'xtatish, ovozini o'zgartirish kerak\" degan fikr yangi mavzuga ko'prik bo'ladi.</p>",
        ],
        [
            'name' => 'Yangi mavzu bayoni',
            'duration_min' => 15,
            'content_html' => "<p>Video rasmdan farqli o'laroq <b>boshqariladigan</b> obyekt: uni ijro etish, to'xtatish, ovozini o'zgartirish kerak. Shuning uchun HTML5 unga alohida teg — <b>&lt;video&gt;</b> tegini ajratgan.</p><ol><li><b>Tarixiy zarurat.</b> HTML5 gacha veb-sahifada video ko'rsatish uchun <b>Adobe Flash Player</b> plagini talab qilinardi. Uni har bir foydalanuvchi alohida o'rnatishi kerak edi, u xavfsizlik muammolari keltirib chiqarardi va telefonlarda umuman ishlamasdi. HTML5 standarti 2014-yil 28-oktabrda rasmiy tavsiya sifatida qabul qilindi va &lt;video&gt; tegini olib keldi. Adobe Flash Player qo'llab-quvvatlanishi esa 2020-yil 31-dekabrda butunlay to'xtatildi.</li><li><b>Tegning tuzilishi.</b> &lt;video&gt; — <u>juft</u> teg, ya'ni yopuvchi &lt;/video&gt; tegi SHART. Eng sodda ko'rinishi:<br><b>&lt;video src=\"dars.mp4\" controls&gt;&lt;/video&gt;</b></li><li><b>src atributi</b> — video faylning manzilini ko'rsatadi. Fayl sahifa bilan bir papkada bo'lsa faqat nomi yoziladi: <b>src=\"dars.mp4\"</b>. Ichki papkada bo'lsa: <b>src=\"video/dars.mp4\"</b>.</li><li><b>controls atributi</b> — pleyerning boshqaruv panelini (ijro/pauza tugmasi, vaqt chizig'i, ovoz, to'liq ekran) ko'rsatadi. <b>Bu atribut yozilmasa video ekranda ko'rinadi, lekin uni ishga tushirib bo'lmaydi</b> — eng ko'p uchraydigan xato shu. controls — qiymatsiz (mantiqiy) atribut, unga hech narsa tenglashtirilmaydi.</li><li><b>width va height</b> — pleyerning eni va bo'yi <u>piksellarda</u>: <b>width=\"640\" height=\"360\"</b>. Faqat bittasi yozilsa brauzer ikkinchisini video nisbatiga qarab o'zi hisoblaydi — shuning uchun tasvir cho'zilib ketmaydi.</li><li><b>poster atributi</b> — video ishga tushgunga qadar ekranda turadigan muqova rasmi: <b>poster=\"muqova.jpg\"</b>. Yozilmasa brauzer videoning birinchi kadrini ko'rsatadi.</li><li><b>&lt;source&gt; tegi.</b> Har bir brauzer har qanday video formatini o'qiy olmaydi. Shuning uchun src o'rniga ichkarida bir nechta &lt;source&gt; tegi beriladi — brauzer ro'yxatni yuqoridan pastga tekshirib, <u>o'zi o'qiy oladigan birinchisini</u> ijro etadi. &lt;source&gt; — yakka teg, unda <b>type</b> atributi fayl turini aytadi: <b>type=\"video/mp4\"</b>.</li></ol><p><b>Muhim:</b> &lt;video&gt; va &lt;/video&gt; teglari orasidagi matn faqat video umuman ishlamagan holatda ko'rinadi — bu eski brauzerlar uchun ogohlantirish matni.</p>",
        ],
        [
            'name' => 'Mustahkamlash',
            'duration_min' => 15,
            'content_html' => "<p><b>1-topshiriq (og'zaki, 3 daqiqa).</b> Doskaga quyidagi kod yoziladi va o'quvchilardan xatoni topish so'raladi:</p><p><b>&lt;video src=\"kino.mp4\" width=\"640\"&gt;</b></p><p><i>Kutilgan javob:</i> ikkita xato bor — yopuvchi &lt;/video&gt; tegi yo'q va <b>controls</b> atributi yozilmagani uchun videoni ishga tushirib bo'lmaydi.</p><p><b>2-topshiriq (kompyuterda, 7 daqiqa).</b> Har bir o'quvchi <b>video.html</b> faylini yaratib, quyidagi kodni yozadi va brauzerda ochib tekshiradi:</p><p><b>&lt;video width=\"640\" controls poster=\"muqova.jpg\"&gt;<br>&nbsp;&nbsp;&lt;source src=\"dars.mp4\" type=\"video/mp4\"&gt;<br>&nbsp;&nbsp;&lt;source src=\"dars.webm\" type=\"video/webm\"&gt;<br>&nbsp;&nbsp;Brauzeringiz video tegini qo'llab-quvvatlamaydi.<br>&lt;/video&gt;</b></p><p>So'ng o'quvchilar <b>controls</b> atributini o'chirib, natijani kuzatadilar va xulosani daftarga yozadilar.</p><p><b>3-topshiriq (juftlikda, 5 daqiqa).</b> Juftliklar bir-biriga savol beradi: \"poster nima uchun kerak?\", \"nega bitta src o'rniga ikkita &lt;source&gt; yozamiz?\", \"width va height ni ikkalasini ham yozish shartmi?\" Javoblar sinfda umumlashtiriladi.</p>",
        ],
        [
            'name' => 'Jismoniy tarbiya daqiqasi',
            'duration_min' => 2,
            'content_html' => "<p>\"Pleyer boshqaruvi\" o'yini. O'qituvchi buyruq aytadi, o'quvchilar mos harakatni bajaradilar:</p><ul><li><b>PLAY</b> — o'rnidan turish</li><li><b>PAUSE</b> — qotib qolish</li><li><b>STOP</b> — joyiga o'tirish</li><li><b>FULLSCREEN</b> — qo'llarni yuqoriga cho'zish</li></ul><p>Buyruqlar tezlashtirib beriladi — bu diqqatni tetiklashtiradi va atamalarni esda saqlashga yordam beradi.</p>",
        ],
        [
            'name' => 'Dars yakuni',
            'duration_min' => 3,
            'content_html' => "<p><b>Yakuniy savollar:</b></p><ol><li>&lt;video&gt; tegi juft tegmi yoki yakka teg? Nima uchun?</li><li>Videoni ishga tushirish tugmalari chiqmasa, qaysi atribut unutilgan?</li><li>Nima uchun bitta videoni bir necha formatda berish tavsiya etiladi?</li></ol><p><b>Xulosa:</b> HTML5 &lt;video&gt; tegi hech qanday qo'shimcha dastursiz veb-sahifaga video joylash imkonini beradi. Uning eng muhim atributi — <b>controls</b>, eng foydali qo'shimchasi — <b>&lt;source&gt;</b> orqali muqobil formatlar berish.</p><p><b>Baholash:</b> amaliy topshiriqni mustaqil bajargan va xatoni o'zi topa olgan o'quvchilar rag'batlantiriladi; faol ishtirok etganlarga ballar qo'yiladi.</p>",
        ],
    ],

    'homework' => "Sevimli mavzuingizda kichik veb-sahifa yarating: unda sarlavha, qisqa matn va <video> tegi orqali qo'yilgan bitta video bo'lsin. Videoga controls, width va poster atributlarini qo'llang, <source> tegi bilan kamida ikkita format ko'rsating.",

    'title_hook' => "Ilgari veb-sahifada video ko'rish uchun alohida dastur kerak edi — HTML5 buni bitta teg bilan hal qildi.",

    // DIQQAT: title_meta, homework va slides matni PPTX/DOCX'ga ODDIY MATN
    // sifatida boradi — bu yerda HTML belgilari (&lt;, &nbsp;) ishlatilmaydi.
    // Faqat phases[].content_html HTML sifatida o'qiladi (HtmlBlockParser).
    'title_meta' => ['HTML5 — 2014-yil', '<video> — juft teg', 'Flash — 2020-yilda yopildi'],

    'slides' => [
        [
            'title' => 'Flash davridan HTML5 gacha',
            'notes' => "O'quvchilardan so'rang: telefonda video ko'rish uchun biror dastur o'rnatganmisiz? Flash telefonlarda umuman ishlamaganini ta'kidlang.",
            'body' => [
                'type' => 'prose',
                'paragraphs' => [
                    "2010-yillarga qadar veb-sahifada video ko'rsatishning yagona keng tarqalgan yo'li Adobe Flash Player plagini edi. Uni har bir foydalanuvchi alohida o'rnatishi kerak, u tez-tez xavfsizlik teshiklari bilan yangilanib turardi va mobil telefonlarda deyarli ishlamasdi.",
                    "HTML5 standarti 2014-yil 28-oktabrda rasmiy tavsiya sifatida qabul qilindi va veb-sahifaga videoni to'g'ridan-to'g'ri joylashtiradigan <video> tegini olib keldi. Adobe Flash Player qo'llab-quvvatlanishi esa 2020-yil 31-dekabrda butunlay to'xtatildi.",
                ],
            ],
        ],
        [
            'title' => "Eng sodda ko'rinish: uchta so'z bilan pleyer",
            'notes' => 'Kodni doskaga yozib, har bir bo\'lagini barmoq bilan ko\'rsatib tushuntiring. Yopuvchi tegni unutmaslikni alohida ta\'kidlang.',
            'body' => [
                'type' => 'bullets',
                'paragraphs' => [
                    "<video src=\"dars.mp4\" controls></video> — ishlaydigan pleyer uchun shuning o'zi yetarli.",
                    "<video> — juft teg: yopuvchi </video> tegi yozilishi SHART.",
                    "src — video faylning manzili; bir papkada bo'lsa faqat fayl nomi yoziladi.",
                    "controls — ijro, pauza, vaqt chizig'i, ovoz va to'liq ekran tugmalarini chiqaradi.",
                    "controls yozilmasa video ko'rinadi, lekin uni ishga tushirib bo'lmaydi.",
                ],
            ],
        ],
        [
            'title' => "Videoni sahifaga qo'yish tartibi",
            'notes' => "Har bir qadamni kompyuterda birga bajaring. 3-qadamda faylni ataylab noto'g'ri nomlab, xato qanday ko'rinishini ko'rsating.",
            'body' => ['type' => 'process', 'paragraphs' => []],
            'steps' => [
                [
                    'title' => 'Faylni joyiga qo\'yish',
                    'detail' => "Video faylni HTML fayl bilan bir papkaga yoki ichidagi video/ papkasiga ko'chiring.",
                ],
                [
                    'title' => 'Tegni ochish',
                    'detail' => "<video> tegini yozing va darhol yopuvchi </video> tegini ham qo'shib qo'ying.",
                ],
                [
                    'title' => 'Manzilni ko\'rsatish',
                    'detail' => "src atributiga fayl nomini aniq, kengaytmasi bilan yozing: src=\"dars.mp4\".",
                ],
                [
                    'title' => 'Atributlarni qo\'shish',
                    'detail' => "controls ni albatta, so'ng width va poster atributlarini qo'shing.",
                ],
                [
                    'title' => 'Brauzerda tekshirish',
                    'detail' => "Faylni brauzerda oching: pleyer chiqdimi, tugmalar ishlayaptimi — tekshiring.",
                ],
            ],
        ],
        [
            'title' => 'Pleyerni boshqaradigan atributlar',
            'notes' => "autoplay ni muted-siz sinab ko'rsating — brauzer ovozli avtoijroni bloklashini o'z ko'zlari bilan ko'rishsin.",
            'body' => [
                'type' => 'bullets',
                'paragraphs' => [
                    "width va height — pleyer o'lchami piksellarda: width=\"640\" height=\"360\".",
                    "poster=\"muqova.jpg\" — video boshlangunga qadar ekranda turadigan rasm.",
                    "autoplay — sahifa ochilishi bilan video o'zi boshlanadi.",
                    "muted — ovozni o'chiradi; brauzerlar avtoijroga faqat shu bilan birga ruxsat beradi.",
                    "loop — video tugagach avtomatik ravishda boshidan qayta boshlanadi.",
                ],
            ],
        ],
        [
            'title' => "Bitta src yoki bir nechta <source>?",
            'notes' => "Nega ikkita format kerakligini so'rang: har bir brauzer har qanday formatni o'qiy olmasligini tushuntiring.",
            'body' => ['type' => 'compare', 'paragraphs' => []],
            'compare' => [
                'left' => [
                    'heading' => 'src atributi',
                    'items' => [
                        "Faqat bitta video fayl beriladi",
                        "Kod qisqa: <video src=\"dars.mp4\" controls>",
                        "Brauzer shu formatni o'qiy olmasa — video umuman ishlamaydi",
                        "Oddiy, tez sinov ishlari uchun qulay",
                    ],
                ],
                'right' => [
                    'heading' => '<source> teglari',
                    'items' => [
                        "Bir necha formatni ketma-ket beriladi",
                        "Brauzer o'zi o'qiy oladigan birinchisini tanlaydi",
                        "type=\"video/mp4\" fayl turini oldindan aytadi",
                        "Haqiqiy saytlar uchun ishonchli usul",
                    ],
                ],
            ],
        ],
        [
            'title' => "width uchun standart o'lchamlar",
            'notes' => "Bu sonlar standart video rezolyutsiyalari. width ni shu qatordan tanlash tasvir sifatini saqlashini ayting.",
            'body' => [
                'type' => 'chart',
                'paragraphs' => [
                    "width atributiga ixtiyoriy son emas, standart o'lcham yozgan ma'qul.",
                    "Bu sonlar videoning eni — bo'yi 16:9 nisbatda o'zi hisoblanadi.",
                    "Maktab sayti uchun odatda 640 yoki 1280 piksel yetarli.",
                ],
            ],
            'chart' => [
                'kind' => 'bar',
                'title' => "Standart video kengligi",
                'series_name' => 'Piksel',
                // Manba majburiy: manbasiz raqamlar chizilmaydi (PresentationBuilder).
                'source' => 'Standart video rezolyutsiyalari',
                'caption' => "Bo'yi 16:9 nisbatda hisoblanadi",
                'data' => [
                    ['label' => '480p', 'value' => 854],
                    ['label' => '720p (HD)', 'value' => 1280],
                    ['label' => '1080p (FHD)', 'value' => 1920],
                    ['label' => '1440p (2K)', 'value' => 2560],
                    ['label' => '2160p (4K)', 'value' => 3840],
                ],
            ],
        ],
        [
            'title' => "To'liq kod: hamma narsa bir joyda",
            'notes' => "Shu kodni o'quvchilar bilan birga yozing va brauzerda oching. Bu darsning asosiy amaliy natijasi.",
            'body' => [
                'type' => 'bullets',
                'paragraphs' => [
                    "<video width=\"640\" controls poster=\"muqova.jpg\">",
                    "    <source src=\"dars.mp4\" type=\"video/mp4\">",
                    "    <source src=\"dars.webm\" type=\"video/webm\">",
                    "    Brauzeringiz video tegini qo'llab-quvvatlamaydi.",
                    "</video>",
                    "Oxirgi qatordagi matn faqat video umuman ishlamaganda ko'rinadi.",
                ],
            ],
        ],
        [
            'title' => 'Eng ko\'p uchraydigan to\'rtta xato',
            'notes' => "Har bir xatoni doskada ataylab qilib ko'rsating — o'quvchilar natijani ko'rib esda saqlab qoladi.",
            'body' => [
                'type' => 'bullets',
                'paragraphs' => [
                    "controls ni unutish: video ekranda turadi, lekin ishga tushmaydi.",
                    "</video> yopuvchi tegini yozmaslik: sahifaning qolgan qismi buziladi.",
                    "src da fayl nomini xato yozish: pleyer bo'sh, qora ekran bo'lib qoladi.",
                    "muted-siz autoplay: brauzer ovozli avtoijroni o'zi bloklaydi.",
                ],
            ],
        ],
        [
            'title' => 'Darsdan esda qoladigan beshta fikr',
            'notes' => "Har bir punktni o'quvchilardan so'rab, ular aytgach ekranda ko'rsating — bu yaxshiroq esda qoladi.",
            'body' => [
                'type' => 'bullets',
                'paragraphs' => [
                    "<video> — juft teg, yopuvchi </video> tegi shart.",
                    "controls bo'lmasa videoni ishga tushirib bo'lmaydi.",
                    "poster — video boshlanmasidan oldingi muqova rasmi.",
                    "<source> orqali bir necha format berilsa, video hamma brauzerda ishlaydi.",
                    "width uchun standart o'lchamni tanlang: 640, 1280 yoki 1920.",
                ],
            ],
        ],
    ],

    'test_questions' => [
        ['text' => "HTML5 da veb-sahifaga video joylashtirish uchun qaysi teg ishlatiladi?", 'options' => ['<video>', '<movie>', '<media>', '<film>'], 'correct_index' => 0, 'explanation' => "HTML5 standartida video uchun maxsus <video> tegi ajratilgan.", 'difficulty' => 'oson'],
        ['text' => "<video> tegi qanday teg hisoblanadi?", 'options' => ['Juft teg — yopuvchi </video> kerak', 'Yakka teg — yopilmaydi', "Faqat <head> ichida yoziladi", 'Atributsiz ishlatiladi'], 'correct_index' => 0, 'explanation' => "<video> juft teg: yopuvchi </video> tegi albatta yozilishi kerak.", 'difficulty' => 'oson'],
        ['text' => "Video faylning manzilini qaysi atribut ko'rsatadi?", 'options' => ['src', 'href', 'link', 'file'], 'correct_index' => 0, 'explanation' => "src (source) atributi fayl manzilini bildiradi; href havolalar uchun ishlatiladi.", 'difficulty' => 'oson'],
        ['text' => "Pleyerda ijro va pauza tugmalari chiqishi uchun qaysi atribut kerak?", 'options' => ['controls', 'buttons', 'player', 'panel'], 'correct_index' => 0, 'explanation' => "controls atributi brauzerning standart boshqaruv panelini chiqaradi.", 'difficulty' => 'oson'],
        ['text' => "controls atributi yozilmasa nima bo'ladi?", 'options' => ["Video ko'rinadi, lekin uni ishga tushirib bo'lmaydi", "Video umuman ko'rinmaydi", 'Sahifa ochilmaydi', 'Video avtomatik boshlanadi'], 'correct_index' => 0, 'explanation' => "controls bo'lmasa boshqaruv paneli chiqmaydi va foydalanuvchi videoni boshqara olmaydi.", 'difficulty' => 'orta'],
        ['text' => "Video boshlangunga qadar ekranda turadigan muqova rasmini qaysi atribut beradi?", 'options' => ['poster', 'image', 'cover', 'thumbnail'], 'correct_index' => 0, 'explanation' => "poster atributi video ijro etilmasidan oldin ko'rinadigan rasmni belgilaydi.", 'difficulty' => 'orta'],
        ['text' => "Quyidagilardan qaysi biri to'g'ri yozilgan?", 'options' => ['<video src="a.mp4" controls></video>', '<video src="a.mp4" controls>', '<video href="a.mp4"></video>', '<video>a.mp4</video>'], 'correct_index' => 0, 'explanation' => "src manzilni beradi, controls tugmalarni chiqaradi va yopuvchi teg ham yozilgan.", 'difficulty' => 'orta'],
        ['text' => "width va height atributlari nimani belgilaydi?", 'options' => ["Pleyerning eni va bo'yini piksellarda", 'Video davomiyligini', 'Fayl hajmini', 'Ovoz balandligini'], 'correct_index' => 0, 'explanation' => "width — eni, height — bo'yi; ikkalasi ham piksellarda o'lchanadi.", 'difficulty' => 'oson'],
        ['text' => "Bir nechta video formatini berish uchun qaysi teg ishlatiladi?", 'options' => ['<source>', '<file>', '<option>', '<format>'], 'correct_index' => 0, 'explanation' => "<video> ichida bir nechta <source> tegi beriladi va brauzer mosini tanlaydi.", 'difficulty' => 'orta'],
        ['text' => "Brauzer bir nechta <source> berilganda qaysi faylni ijro etadi?", 'options' => ["O'zi o'qiy oladigan birinchisini", 'Eng oxirgisini', 'Eng kichik hajmlisini', 'Barchasini navbat bilan'], 'correct_index' => 0, 'explanation' => "Brauzer ro'yxatni yuqoridan pastga tekshiradi va qo'llab-quvvatlaydigan birinchi formatda to'xtaydi.", 'difficulty' => 'qiyin'],
        ['text' => "<source> tegidagi type atributi nima uchun kerak?", 'options' => ['Fayl turini brauzerga oldindan aytadi', 'Video sifatini oshiradi', 'Faylni siqadi', 'Ovozni sozlaydi'], 'correct_index' => 0, 'explanation' => "type=\"video/mp4\" brauzerga faylni yuklamasdan turib uni o'qiy olishini bildiradi.", 'difficulty' => 'qiyin'],
        ['text' => "MP4 fayl uchun type atributining to'g'ri qiymati qaysi?", 'options' => ['video/mp4', 'video/mpeg4', 'file/mp4', 'movie/mp4'], 'correct_index' => 0, 'explanation' => "MP4 uchun MIME turi aynan video/mp4 deb yoziladi.", 'difficulty' => 'orta'],
        ['text' => "autoplay atributi nima qiladi?", 'options' => ["Sahifa ochilishi bilan videoni o'zi boshlaydi", 'Videoni takrorlaydi', 'Ovozni o\'chiradi', 'Muqova rasmini qo\'yadi'], 'correct_index' => 0, 'explanation' => "autoplay video foydalanuvchi bosmasdan avtomatik boshlanishini bildiradi.", 'difficulty' => 'oson'],
        ['text' => "Zamonaviy brauzerlar ovozli avtoijroni odatda bloklaydi. Buni oldini olish uchun autoplay bilan birga qaysi atribut yoziladi?", 'options' => ['muted', 'loop', 'controls', 'poster'], 'correct_index' => 0, 'explanation' => "muted ovozni o'chiradi; brauzerlar ovozsiz avtoijroga ruxsat beradi.", 'difficulty' => 'qiyin'],
        ['text' => "loop atributi nima vazifa bajaradi?", 'options' => ['Video tugagach uni boshidan qayta boshlaydi', 'Videoni sekinlashtiradi', 'Ovozni takrorlaydi', 'Videoni teskari o\'ynatadi'], 'correct_index' => 0, 'explanation' => "loop videoni uzluksiz takrorlab ijro etadi.", 'difficulty' => 'oson'],
        ['text' => "muted atributi nimani anglatadi?", 'options' => ['Video ovozsiz ijro etiladi', 'Video to\'xtatiladi', 'Video yashiriladi', 'Ovoz balandlashadi'], 'correct_index' => 0, 'explanation' => "muted — ovoz o'chirilgan holatda boshlanishini bildiradi.", 'difficulty' => 'oson'],
        ['text' => "<video> va </video> teglari orasiga yozilgan matn qachon ko'rinadi?", 'options' => ["Brauzer video tegini qo'llab-quvvatlamaganda", 'Har doim video ostida', 'Video tugaganda', 'Muqova rasmi ustida'], 'correct_index' => 0, 'explanation' => "Bu matn faqat video umuman ishlamagan holatda ogohlantirish sifatida chiqadi.", 'difficulty' => 'qiyin'],
        ['text' => "HTML5 gacha veb-sahifada video ko'rsatish uchun asosan nima ishlatilardi?", 'options' => ['Adobe Flash Player plagini', 'JavaScript kutubxonasi', 'CSS animatsiyasi', 'PDF fayl'], 'correct_index' => 0, 'explanation' => "HTML5 gacha video uchun Adobe Flash Player plagini talab qilinardi.", 'difficulty' => 'orta'],
        ['text' => "Adobe Flash Player qo'llab-quvvatlanishi qachon to'xtatilgan?", 'options' => ['2020-yil 31-dekabrda', '2014-yil 28-oktabrda', '2010-yil 1-yanvarda', '2025-yil 1-mayda'], 'correct_index' => 0, 'explanation' => "Adobe Flash Player'ni qo'llab-quvvatlash 2020-yil 31-dekabrda rasman yakunlangan.", 'difficulty' => 'qiyin'],
        ['text' => "HTML5 rasmiy W3C tavsiyasi sifatida qachon qabul qilingan?", 'options' => ['2014-yil 28-oktabrda', '2020-yil 31-dekabrda', '2008-yil 5-mayda', '2016-yil 12-iyunda'], 'correct_index' => 0, 'explanation' => "HTML5 W3C tomonidan 2014-yil 28-oktabrda rasmiy tavsiya sifatida e'lon qilingan.", 'difficulty' => 'qiyin'],
        ['text' => "Video fayl HTML fayl bilan bir papkada bo'lsa, src qanday yoziladi?", 'options' => ['src="dars.mp4"', 'src="C:/dars.mp4"', 'src="../../dars.mp4"', 'src="video>dars.mp4"'], 'correct_index' => 0, 'explanation' => "Bir papkadagi fayl uchun faqat fayl nomi va kengaytmasi yoziladi.", 'difficulty' => 'orta'],
        ['text' => "Video fayl video nomli ichki papkada bo'lsa, src qanday yoziladi?", 'options' => ['src="video/dars.mp4"', 'src="dars.mp4/video"', 'src="/video"', 'src="video-dars.mp4"'], 'correct_index' => 0, 'explanation' => "Papka nomi va fayl nomi qiya chiziq bilan ajratiladi: video/dars.mp4.", 'difficulty' => 'orta'],
        ['text' => "Faqat width atributi yozilib, height yozilmasa nima bo'ladi?", 'options' => ["Brauzer bo'yini video nisbatiga qarab o'zi hisoblaydi", 'Video ko\'rinmaydi', "Bo'yi 0 bo'lib qoladi", 'Xato xabari chiqadi'], 'correct_index' => 0, 'explanation' => "Brauzer videoning asl nisbatini saqlagan holda ikkinchi o'lchamni o'zi hisoblaydi.", 'difficulty' => 'qiyin'],
        ['text' => "1280 piksel kenglik qaysi standart rezolyutsiyaga mos keladi?", 'options' => ['720p (HD)', '480p', '1080p (FHD)', '4K'], 'correct_index' => 0, 'explanation' => "720p HD video kengligi 1280 pikselni tashkil qiladi.", 'difficulty' => 'orta'],
        ['text' => "1920 piksel kenglik qaysi rezolyutsiyaga mos keladi?", 'options' => ['1080p (Full HD)', '720p', '1440p', '480p'], 'correct_index' => 0, 'explanation' => "Full HD video o'lchami 1920x1080 pikselni tashkil qiladi.", 'difficulty' => 'orta'],
        ['text' => "Quyidagi kodda qanday xato bor: <video src=\"kino.mp4\" width=\"640\">", 'options' => ["Yopuvchi teg va controls atributi yo'q", 'src noto\'g\'ri yozilgan', 'width atributi ortiqcha', 'Xato yo\'q'], 'correct_index' => 0, 'explanation' => "Yopuvchi </video> tegi yozilmagan va controls bo'lmagani uchun videoni boshqarib bo'lmaydi.", 'difficulty' => 'qiyin'],
        ['text' => "controls atributiga qiymat berish kerakmi?", 'options' => ["Yo'q, u qiymatsiz (mantiqiy) atribut", 'Ha, controls="on" deb yoziladi', 'Ha, controls="1" deb yoziladi', 'Ha, controls="true" shart'], 'correct_index' => 0, 'explanation' => "controls — mantiqiy atribut: uning mavjudligining o'zi yetarli.", 'difficulty' => 'qiyin'],
        ['text' => "Nima uchun bitta videoni bir necha formatda berish tavsiya etiladi?", 'options' => ["Har bir brauzer har qanday formatni o'qiy olmaydi", 'Video sifati oshadi', 'Fayl hajmi kichrayadi', 'Sahifa tezroq yuklanadi'], 'correct_index' => 0, 'explanation' => "Formatlarni qo'llab-quvvatlash brauzerlarda farq qiladi, shuning uchun muqobil variant beriladi.", 'difficulty' => 'orta'],
        ['text' => "<source> tegi qanday teg?", 'options' => ['Yakka teg — yopilmaydi', 'Juft teg — yopiladi', 'Faqat <head> ichida yoziladi', 'Atributsiz ishlatiladi'], 'correct_index' => 0, 'explanation' => "<source> yakka (yopilmaydigan) teg bo'lib, <video> ichida yoziladi.", 'difficulty' => 'orta'],
        ['text' => "Video ekranda qora bo'lib turibdi va hech narsa ijro etilmayapti. Eng ehtimolli sabab nima?", 'options' => ["src da fayl nomi yoki yo'li xato yozilgan", 'height atributi yozilmagan', 'poster atributi yo\'q', 'loop atributi yozilmagan'], 'correct_index' => 0, 'explanation' => "Manzil xato bo'lsa brauzer faylni topa olmaydi va bo'sh pleyer ko'rsatadi.", 'difficulty' => 'qiyin'],
    ],

    // Tarqatma o'yinlari (anagramma, krossvord, so'z izlash) shu atamalardan
    // yasaladi. Har biri bitta so'z, faqat harf — grid o'yinlariga mos.
    'key_terms' => [
        ['term' => 'video', 'clue' => "Veb-sahifaga harakatli tasvir joylashtiradigan HTML5 tegi"],
        ['term' => 'controls', 'clue' => "Pleyerda ijro, pauza va ovoz tugmalarini chiqaradigan atribut"],
        ['term' => 'source', 'clue' => "Bir necha video formatni ko'rsatish uchun ishlatiladigan yakka teg"],
        ['term' => 'poster', 'clue' => "Video boshlangunga qadar ekranda turadigan muqova rasmini beruvchi atribut"],
        ['term' => 'autoplay', 'clue' => "Sahifa ochilishi bilan videoni o'zi boshlaydigan atribut"],
        ['term' => 'muted', 'clue' => "Videoni ovozsiz ijro etadigan atribut"],
        ['term' => 'brauzer', 'clue' => "Veb-sahifalarni ochib ko'rsatadigan dastur"],
        ['term' => 'atribut', 'clue' => "Tegga qo'shimcha xususiyat beruvchi so'z (masalan width, controls)"],
        ['term' => 'piksel', 'clue' => "Ekran o'lchamini o'lchash birligi; width shu bilan beriladi"],
        ['term' => 'format', 'clue' => "Fayl turi, masalan mp4 yoki webm"],
    ],
];
