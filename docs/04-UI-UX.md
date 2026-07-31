# USTOZ AI — Dizayn tizimi va ekran maketlari

> [← 01-ARXITEKTURA.md](01-ARXITEKTURA.md)

---

## 1. Dizayn falsafasi

Hujjatda Apple, Canva, Notion, Linear ilhom manbai sifatida ko'rsatilgan. Ammo ular turli narsalar:

| Manba | Bizga nima kerak |
|---|---|
| **Linear** | Tezlik hissi, toza tipografika, minimal soya |
| **Notion** | Kontent birinchi o'rinda, sokin interfeys |
| **Canva** | Natijani ko'rsatish (preview kartochkalari) |
| **Apple** | Bo'shliq (whitespace), aniq ierarxiya |

**Asosiy tamoyil:** o'qituvchi 40 yoshda, telefonda, dars oldidan shoshib turibdi. Interfeys **chiroyli emas — tushunarli** bo'lishi kerak. Chiroylik ikkinchi.

### Uch qoida

1. **Bir ekran — bir vazifa.** Wizard'da bir qadamda bitta savol.
2. **Katta bosiladigan joylar.** Minimal 48×48px — telefonda barmoq bilan.
3. **Kutish vaqti ko'rinadigan bo'lsin.** 90 soniyalik generatsiyada — jonli progress, nima qilinayotgani yozilgan.

---

## 2. Dizayn tokenlari

### 2.1 Ranglar

```css
:root {
  /* Asosiy — ko'k-binafsha gradient */
  --brand-50:  #EEF2FF;
  --brand-100: #E0E7FF;
  --brand-500: #6366F1;
  --brand-600: #4F46E5;   /* asosiy tugma */
  --brand-700: #4338CA;
  --gradient:  linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);

  /* Aksentlar */
  --success: #10B981;   /* tayyor, muvaffaqiyat */
  --warning: #F59E0B;   /* obuna tugayapti */
  --danger:  #EF4444;   /* xato */
  --info:    #0EA5E9;   /* kesh topildi */

  /* Neytral — ko'zni charchatmaydigan */
  --bg:        #FFFFFF;
  --bg-subtle: #FAFAFB;   /* toza kulrang emas — biroz iliq */
  --border:    #E5E7EB;
  --text:      #111827;
  --text-mute: #6B7280;

  /* Fan ranglari — kartochkalar uchun */
  --subj-language: #4F46E5;
  --subj-math:     #0891B2;
  --subj-science:  #059669;
  --subj-humanity: #B45309;
  --subj-it:       #7C3AED;
}
```

> ❌ **Ishlatmang:** oq fonda binafsha gradient — bu eng ko'p uchraydigan "AI dasturi" klishesi.
> ✅ Gradient faqat **bitta joyda**: asosiy CTA tugmasi va logotip.

### 2.2 Tipografika

| Element | Shrift | O'lcham | Og'irlik |
|---|---|---|---|
| Sarlavha H1 | Manrope | 32 / 28 (mob) | 700 |
| Sarlavha H2 | Manrope | 24 / 20 | 600 |
| Kartochka nomi | Manrope | 18 / 16 | 600 |
| Asosiy matn | Inter | 16 / 15 | 400 |
| Yordamchi | Inter | 14 / 13 | 400 |
| Tugma | Manrope | 16 | 600 |

**Muhim:** matn hech qachon 14px'dan kichik bo'lmasin. Foydalanuvchilar 35–55 yosh.

O'zbek kirill va lotin — Inter/Manrope ikkalasini ham qo'llab-quvvatlaydi. Rus tili — muammosiz.

### 2.3 Bo'shliq va shakl

```css
--space: 4px;              /* barcha masofalar 4 ning karrasi */
--radius-sm: 8px;
--radius:    12px;         /* kartochka */
--radius-lg: 16px;         /* modal */
--radius-full: 9999px;     /* avatar, badge */

--shadow-sm: 0 1px 2px rgba(17,24,39,.05);
--shadow:    0 4px 12px rgba(17,24,39,.08);
--shadow-lg: 0 12px 32px rgba(17,24,39,.12);
```

### 2.4 Animatsiya

```js
// Framer Motion
const ease = [0.16, 1, 0.3, 1];   // "sokin" easing

transitions = {
  fast:   { duration: 0.15, ease },   // hover, tugma
  normal: { duration: 0.25, ease },   // kartochka, modal
  slow:   { duration: 0.4,  ease },   // sahifa o'tishi
}
```

**Qoidalar:**
- Har animatsiya 400ms'dan qisqa
- `prefers-reduced-motion` hurmat qilinadi
- Sakrash yo'q — faqat `opacity` va `transform`
- Ro'yxatda `stagger: 0.04` — ketma-ket paydo bo'lish

---

## 3. Ochiq sahifalar (landing)

Sotuv reklama orqali bo'lgani uchun landing sahifa — **birinchi va eng muhim ekran**. Video reklamadan kelgan odam shu yerga tushadi.

### 3.1 Landing sahifa tuzilishi

```
┌─────────────────────────────────────┐
│  USTOZ AI              [Kirish]     │
├─────────────────────────────────────┤
│                                     │
│   Darsga tayyorgarlik —             │
│   4 soat emas, 2 daqiqa             │
│                                     │
│   Fan, sinf va mavzuni tanlang.     │
│   Prezentatsiya, konspekt, tarqatma │
│   va testlar avtomatik tayyorlanadi.│
│                                     │
│  ┌───────────────────────────────┐  │
│  │   ✨ Buyurtma berish          │  │  ← asosiy CTA
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │   ▶ Videoni ko'rish (2 daq)   │  │
│  └───────────────────────────────┘  │
│                                     │
│  👥 412 o'qituvchi · 📚 1 240 dars  │  ← ijtimoiy dalil
│                                     │
├─── Nima olasiz? ────────────────────┤
│  [PPTX] [DOCX] [PDF] [PDF] [PDF]    │
│   6 ta tayyor fayl, har darsga      │
│   (real skrinshotlar bilan)         │
├─── Qanday ishlaydi? ────────────────┤
│   1️⃣ Fan va sinfni tanlaysiz        │
│   2️⃣ Mavzuni yozasiz                │
│   3️⃣ 2 daqiqada yuklab olasiz       │
├─── Tariflar ────────────────────────┤
│   [Asosiy 59 000] [Pro 99 000]      │
│   [Yillik 890 000]                  │
├─── O'qituvchilar fikri ─────────────┤
│   (3 ta izoh + foto)                │
├─── Savol-javob ─────────────────────┤
│   (akkordeon)                       │
├─────────────────────────────────────┤
│  📞 +998 XX XXX XX XX               │
│  ✈️ @ustoz_ai                        │
└─────────────────────────────────────┘
```

**Landing sahifada bo'lishi shart:**
- Real material **skrinshotlari** (mockup emas) — bu ishonchni eng ko'p oshiradi
- Bitta namuna faylni **bepul yuklab olish** imkoniyati
- Har ekranda **"Buyurtma berish"** tugmasi qo'l yetadigan joyda

### 3.2 Buyurtma formasi

```
┌─────────────────────────────────────┐
│ ✕            Buyurtma berish        │
├─────────────────────────────────────┤
│  Ma'lumotlaringizni qoldiring —     │
│  1 soat ichida bog'lanamiz.         │
│                                     │
│  Ism familiya *                     │
│  ┌───────────────────────────────┐  │
│  └───────────────────────────────┘  │
│  Telefon raqami *                   │
│  ┌───────────────────────────────┐  │
│  │ +998 __ ___ __ __             │  │
│  └───────────────────────────────┘  │
│  Telegram (ixtiyoriy)               │
│  ┌───────────────────────────────┐  │
│  └───────────────────────────────┘  │
│  Maktab / Viloyat                   │
│  ┌───────────────────────────────┐  │
│  └───────────────────────────────┘  │
│  Qaysi fandan dars berasiz?         │
│  ┌───────────────────────────────┐  │
│  │ Rus tili                    ▾ │  │
│  └───────────────────────────────┘  │
│  Tarif                              │
│  ○ Asosiy  ● Pro  ○ Yillik          │
│                                     │
│  ┌───────────────────────────────┐  │
│  │      Yuborish            →    │  │
│  └───────────────────────────────┘  │
│                                     │
│  Yoki to'g'ridan-to'g'ri:           │
│  📞 +998 XX XXX XX XX               │
│  ✈️ @ustoz_ai                        │
└─────────────────────────────────────┘
```

**Yuborilgandan keyin:**

```
┌─────────────────────────────────────┐
│              ✅                     │
│      Murojaatingiz qabul qilindi    │
│                                     │
│   1 soat ichida bog'lanamiz.        │
│   Shoshilinch bo'lsa:               │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  ✈️  Telegramda yozish        │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  📞  Qo'ng'iroq qilish        │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

> Telegram/qo'ng'iroq tugmalari **muhim** — ko'p odam formani to'ldirgach ham darhol gaplashmoqchi bo'ladi. Ularni to'sib qo'ymang.

---

## 4. O'qituvchi ekranlari

### 4.1 Kirish

```
┌─────────────────────────────┐
│                             │
│        [logo gradient]      │
│         USTOZ AI            │
│  Dars materiallari — 2 daq  │
│                             │
│  ┌───────────────────────┐  │
│  │ 📱 Telefon raqami     │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ 🔒 Parol         [👁] │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │      Kirish       →   │  │  ← gradient
│  └───────────────────────┘  │
│                             │
│  Kodim bor →  Parolni unut. │
│                             │
│  Akkaunt kerakmi?           │
│  ┌───────────────────────┐  │
│  │  ✨ Buyurtma berish   │  │  → landing formasi
│  └───────────────────────┘  │
│  📞 +998 XX XXX XX XX       │
└─────────────────────────────┘
```

> Ro'yxatdan o'tish tugmasi **yo'q** — bu ataylab. To'lov qo'lda qabul qilingani uchun akkaunt ham admin orqali ochiladi. "Buyurtma berish" tugmasi buyurtma formasiga olib boradi.
>
> **Birinchi kirish:** admin bergan vaqtinchalik parol bilan kirgach, darhol "Yangi parol o'rnating" ekrani chiqadi (o'tkazib bo'lmaydi).

### 4.2 Bosh sahifa (Dashboard)

```
┌─────────────────────────────────────┐
│ USTOZ AI            🔔    [SS] ▾    │
├─────────────────────────────────────┤
│                                     │
│   Assalomu alaykum, Sherzod! 👋     │
│   Bugun 3 ta dars yaratdingiz       │
│                                     │
│  ╔═══════════════════════════════╗  │
│  ║  ✨  YANGI DARS YARATISH      ║  │  ← gradient, katta
│  ║      2 daqiqada tayyor        ║  │
│  ╚═══════════════════════════════╝  │
│                                     │
│  ┌─────────┬─────────┬───────────┐  │
│  │   47    │   12    │  18/30    │  │
│  │ Darslar │Sevimli  │  Bu oy    │  │
│  └─────────┴─────────┴───────────┘  │
│                                     │
│  So'nggi darslar        Barchasi →  │
│  ┌───────────────────────────────┐  │
│  │ 📘 Имя прилагательное         │  │
│  │    Rus tili · 7-sinf · 45daq  │  │
│  │    2 soat oldin      [Ochish] │  │
│  ├───────────────────────────────┤  │
│  │ 📗 Kasrlar bilan amallar      │  │
│  │    Matematika · 5-sinf · 45   │  │
│  │    Kecha            [Ochish]  │  │
│  └───────────────────────────────┘  │
│                                     │
│  💡 Hamkasblar ko'p yaratgan:       │
│  [Глагол] [Fotosintez] [Kasrlar]   │  ← kesh bor, 2 soniyada
│                                     │
├─────────────────────────────────────┤
│  🏠      📚      ⭐      👤         │
│ Bosh  Darslar Sevimli Profil        │
└─────────────────────────────────────┘
```

> **"Hamkasblar ko'p yaratgan"** — bu shunchaki chiroyli emas. Bu **kesh hit rate'ni oshiradigan** eng muhim UI elementi. O'qituvchini kesh bor mavzularga yo'naltiradi.

### 4.3 Yangi dars — 4 qadamli wizard

Mobile-first: har qadam alohida ekran, katta tugmalar.

```
[1/4] Qaysi fan?
┌─────────────────────────────────────┐
│ ←                          1 / 4    │
│ ▓▓▓▓▓░░░░░░░░░░░░░░░░               │
│                                     │
│  Qaysi fandan dars?                 │
│                                     │
│  ┌──────────┐  ┌──────────┐         │
│  │    🇷🇺    │  │    📐    │         │
│  │ Rus tili │  │Matematika│         │
│  └──────────┘  └──────────┘         │
│  ┌──────────┐  ┌──────────┐         │
│  │    🇬🇧    │  │    ⚛️    │         │
│  │Ingliz t. │  │  Fizika  │         │
│  └──────────┘  └──────────┘         │
│         ... (2 ustun grid)          │
└─────────────────────────────────────┘

[2/4] Qaysi sinf?
  → 5 6 7 8 9 10 11  (katta doira tugmalar)

[3/4] Mavzu
┌─────────────────────────────────────┐
│  Dars mavzusi                       │
│  ┌───────────────────────────────┐  │
│  │ Имя прилагательное          │ │  │
│  └───────────────────────────────┘  │
│                                     │
│  🔥 Mashhur mavzular:               │
│  ┌───────────────────────────────┐  │
│  │ Имя существительное      ⚡  │  │  ← ⚡ = kesh bor
│  │ Глагол                   ⚡  │  │
│  │ Причастие                    │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘

[4/4] Davomiylik va til
  → [45 daqiqa] [80 daqiqa]
  → Til: [O'zbek] [Кирилл] [Русский] [English]
```

### 4.4 Tekshiruv (preflight) — kesh topilganda

```
┌─────────────────────────────────────┐
│  ⚡ Tayyor material topildi!         │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Имя прилагательное            │  │
│  │ Rus tili · 7-sinf · 45 daqiqa │  │
│  │                               │  │
│  │ ★★★★★ 4.6   👥 137 o'qituvchi │  │
│  │ 94% mos keladi                │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  ⚡ Shuni ochish (2 soniya)   │  │  ← asosiy
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  ✨ Yangi variant yaratish    │  │  ← ikkilamchi
│  │     ~90 soniya · 1 kvota      │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

> Kesh **hech qachon majburlanmaydi**. Tanlov o'qituvchiniki. Lekin tez variant birinchi va vizual jihatdan jozibali.

### 4.5 Generatsiya jarayoni

90 soniya — bu uzoq. Foydalanuvchi nima bo'layotganini ko'rishi kerak.

```
┌─────────────────────────────────────┐
│                                     │
│         [aylanuvchi gradient]       │
│              68%                    │
│                                     │
│   AI materiallarni tayyorlamoqda    │
│                                     │
│  ✅ Dars rejasi tuzildi             │
│  ✅ Prezentatsiya yaratildi (15)    │
│  ✅ Konspekt yozildi                │
│  ⏳ Testlar tayyorlanmoqda...       │
│  ⚪ Tarqatma materiallar            │
│  ⚪ Fayllar yig'ilmoqda             │
│                                     │
│  ⏱ Taxminan 30 soniya qoldi        │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  Fonda davom etsin →          │  │
│  └───────────────────────────────┘  │
│  Tayyor bo'lganda xabar beramiz     │
└─────────────────────────────────────┘
```

**"Fonda davom etsin"** — muhim. O'qituvchi telefonni yopib, ishini davom ettiradi; tayyor bo'lganda push/bildirishnoma keladi.

### 4.6 Natija sahifasi

```
┌─────────────────────────────────────┐
│ ←  Имя прилагательное        ⭐ ⋮   │
│    Rus tili · 7-sinf · 45 daqiqa    │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │  ⬇  Hammasini yuklab olish    │  │  ← ZIP
│  │      (6 fayl · 12.4 MB)       │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 📊  Prezentatsiya             │  │
│  │     15 slayd · PPTX · 4.2 MB  │  │
│  │  [slayd eskizlari ▸ ▸ ▸ ▸]    │  │
│  │  👁 Ko'rish  ✏️ Tahrir  ⬇     │  │
│  ├───────────────────────────────┤  │
│  │ 📄  Konspekt                  │  │
│  │     8 sahifa · DOCX · 240 KB  │  │
│  │  👁 Ko'rish  ✏️ Tahrir  ⬇     │  │
│  ├───────────────────────────────┤  │
│  │ 📋  Tarqatma materiallar      │  │
│  │     6 sahifa · PDF            │  │
│  ├───────────────────────────────┤  │
│  │ ✅  Oddiy test  ·  20 savol   │  │
│  ├───────────────────────────────┤  │
│  │ 📝  Chorak testi ·  30 savol  │  │
│  ├───────────────────────────────┤  │
│  │ 🎲  Qo'shimchalar · 12 ta     │  │
│  └───────────────────────────────┘  │
│                                     │
│  Material foydali bo'ldimi?         │
│  ☆ ☆ ☆ ☆ ☆                          │
└─────────────────────────────────────┘
```

### 4.7 Editor (matn darajasida)

```
┌─────────────────────────────────────┐
│ ←  Tahrirlash          [Saqlash]    │
├─────────────────────────────────────┤
│  Slayd 7 / 15              ‹  ›     │
│  ┌───────────────────────────────┐  │
│  │   [slayd ko'rinishi]          │  │
│  └───────────────────────────────┘  │
│                                     │
│  Sarlavha                           │
│  ┌───────────────────────────────┐  │
│  │ Сравнительная степень         │  │
│  └───────────────────────────────┘  │
│                                     │
│  Punktlar                           │
│  ┌───────────────────────────────┐  │
│  │ • Простая форма: -ее, -ей   ✕ │  │
│  │ • Составная: более + прил.  ✕ │  │
│  │ + Yangi punkt qo'shish        │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 🔄 Bu slaydni qayta yarat     │  │  ← AI, ~$0.02
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ 🖼 Rasmni almashtirish        │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ 🗑 Slaydni o'chirish          │  │
│  └───────────────────────────────┘  │
│                                     │
│  ↺ Asl holatga qaytarish            │
└─────────────────────────────────────┘
```

### 4.8 Qolgan ekranlar

| Ekran | Asosiy elementlar |
|---|---|
| **Mening darslarim** | Qidiruv, fan/sinf filtri, sana bo'yicha saralash, ro'yxat/grid |
| **Sevimlilar** | Yulduzchali darslar |
| **Yuklab olishlar** | Tarix: nima, qachon, qayta yuklab olish |
| **Obuna** | Qolgan kun, kvota indikatori, uzaytirish, to'lov tarixi |
| **Profil** | Ism, maktab, viloyat, asosiy fan, til, parol |
| **Faollashtirish** | Kod kiritish maydoni (kirish sahifasidan) |

---

## 5. Admin panel

Telefondan boshqarilishi kerak — bu hujjatdagi aniq talab.

### 5.1 Admin dashboard

```
┌─────────────────────────────────────┐
│ Admin                        [SS]▾  │
├─────────────────────────────────────┤
│  ┌─────────────┬─────────────┐      │
│  │    412      │     287     │      │
│  │ O'qituvchi  │   Faol      │      │
│  ├─────────────┼─────────────┤      │
│  │ 14.2 mln so'│   $47.30    │      │
│  │ Bu oy daromad│ AI xarajat │      │
│  ├─────────────┼─────────────┤      │
│  │    78%      │   1 240     │      │
│  │ Kesh hit    │ Bu oy dars  │      │
│  └─────────────┴─────────────┘      │
│                                     │
│  📈 [daromad / xarajat grafigi]     │
│                                     │
│  🔴 Yangi murojaatlar          (7)  │
│  ┌───────────────────────────────┐  │
│  │ Nodira K. · Rus tili          │  │
│  │ 12 daqiqa oldin      [Ko'rish]│  │
│  ├───────────────────────────────┤  │
│  │ Jasur T. · Matematika         │  │
│  │ 1 soat oldin         [Ko'rish]│  │
│  └───────────────────────────────┘  │
│                Barchasi →           │
│                                     │
│  ⚡ Tezkor amallar                  │
│  ┌───────────────────────────────┐  │
│  │ 🔍 O'qituvchini topish        │  │
│  │ ➕ Yangi akkaunt              │  │
│  │ 🎟 Kod yaratish               │  │
│  │ 📢 Xabar yuborish             │  │
│  └───────────────────────────────┘  │
│                                     │
│  ⏳ Muddati tugayapti (3 kun)  (7)  │
│  ┌───────────────────────────────┐  │
│  │ Sherzod S. · Andijon    [+30] │  │
│  │ Nodira K. · Farg'ona    [+30] │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### 5.2 Murojaatlar (leads) — sotuv ekrani

Reklama orqali kelgan har bir so'rov shu yerda. Admin kunning katta qismini shu ekranda o'tkazadi.

```
┌─────────────────────────────────────┐
│ ←  Murojaatlar               🔍     │
├─────────────────────────────────────┤
│ [Yangi 7] [Bog'lanildi 4] [Kutilmoq]│
│ [To'ladi] [Rad] [Hammasi]           │
├─────────────────────────────────────┤
│  🔴 YANGI                           │
│  ┌───────────────────────────────┐  │
│  │ Nodira Karimova               │  │
│  │ 📞 +998 91 234 56 78          │  │
│  │ Rus tili · Farg'ona           │  │
│  │ Pro tarif · 📹 Video reklama  │  │
│  │ 12 daqiqa oldin               │  │
│  │ ┌─────────┬─────────┬───────┐ │  │
│  │ │ 📞 Qo'ng│ ✈️ Tele │  ⋮    │ │  │
│  │ └─────────┴─────────┴───────┘ │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ Jasur Toshmatov               │  │
│  │ 📞 +998 93 111 22 33          │  │
│  │ Matematika · Toshkent         │  │
│  │ 1 soat oldin                  │  │
│  └───────────────────────────────┘  │
│                                     │
│  🟡 TO'LOV KUTILMOQDA               │
│  ┌───────────────────────────────┐  │
│  │ Sherzod Sirojidinov           │  │
│  │ Pro · 99 000 so'm             │  │
│  │ ⏱ 2 kundan beri kutilmoqda    │  │
│  │ ┌───────────────────────────┐ │  │
│  │ │ ✅ To'lov keldi           │ │  │  ← 5.2.1 ga o'tadi
│  │ └───────────────────────────┘ │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Kartochkadagi tugmalar (⋮ menyusi):**
`Bog'landim` · `Karta raqamini yuborish` (tayyor Telegram matni) · `Izoh qo'shish` · `Rad etdi` · `Yo'qotildi`

> **Telegram bildirishnomasi:** yangi murojaat kelgan zahoti admin telefoniga bot orqali xabar keladi — panelni ochib turish shart emas.

### 5.2.1 «To'lov keldi» — akkaunt ochish

Bitta oyna, uchta amal (`POST /admin/leads/{id}/convert`):

```
┌─────────────────────────────────────┐
│ ✕     To'lovni qayd etish           │
├─────────────────────────────────────┤
│  Nodira Karimova                    │
│  +998 91 234 56 78 · Rus tili       │
│                                     │
│  Tarif                              │
│  ┌───────────────────────────────┐  │
│  │ Pro · 30 kun · 99 000  ▾      │  │
│  └───────────────────────────────┘  │
│  Kelgan summa                       │
│  ┌───────────────────────────────┐  │
│  │ 99 000                  so'm  │  │
│  └───────────────────────────────┘  │
│  Karta oxirgi 4 raqami              │
│  ┌───────────────────────────────┐  │
│  │ 4821                          │  │
│  └───────────────────────────────┘  │
│  Yuboruvchi (chekdagi ism)          │
│  ┌───────────────────────────────┐  │
│  │ KARIMOVA N                    │  │
│  └───────────────────────────────┘  │
│                                     │
│  ☑ Login va parolni SMS orqali      │
│    yuborish                         │
│  ☑ Telegramga ham yuborish          │
│                                     │
│  ╔═══════════════════════════════╗  │
│  ║  ✅ AKKAUNT OCHISH            ║  │
│  ╚═══════════════════════════════╝  │
└─────────────────────────────────────┘
```

**Muvaffaqiyatdan keyin:**

```
┌─────────────────────────────────────┐
│              ✅                     │
│        Akkaunt ochildi              │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Kod:    USTOZ-4831            │  │
│  │ Login:  +998912345678         │  │
│  │ Parol:  Ustoz7392        [📋] │  │
│  │ Obuna:  Pro · 2026-08-29 gacha│  │
│  └───────────────────────────────┘  │
│                                     │
│  ✅ SMS yuborildi                   │
│  ✅ Telegramga yuborildi            │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  📋 Ma'lumotlarni nusxalash   │  │
│  └───────────────────────────────┘  │
│                                     │
│  ⚠️ Parol faqat hozir ko'rinadi.    │
│     Keyin faqat tiklash mumkin.     │
└─────────────────────────────────────┘
```

> Parol bazada **hash** ko'rinishida saqlanadi — bu oynani yopgach hech kim (admin ham) uni ko'ra olmaydi. Unutilsa — "Parolni tiklash" tugmasi yangi vaqtinchalik parol beradi.

### 5.3 O'qituvchi kartochkasi — bir tugmali faollashtirish

```
┌─────────────────────────────────────┐
│ ←  Sherzod Sirojidinov              │
│    USTOZ-4821 · +998 90 123 45 67   │
├─────────────────────────────────────┤
│  ● Faol                             │
│  Obuna: Pro · 2026-08-15 gacha      │
│  ▓▓▓▓▓▓▓▓▓▓▓▓░░░  16 kun qoldi      │
│  Kvota: 47 / 100                    │
│                                     │
│  ╔═══════════════════════════════╗  │
│  ║   ✅ +30 KUN UZAYTIRISH       ║  │  ← ENG KATTA TUGMA
│  ╚═══════════════════════════════╝  │
│  ┌──────────────┬────────────────┐  │
│  │  +90 kun     │   +365 kun     │  │
│  └──────────────┴────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ ⏸ Vaqtincha to'xtatish        │  │
│  │ 🔑 Parolni tiklash            │  │
│  │ 💰 To'lov qayd etish          │  │
│  └───────────────────────────────┘  │
│                                     │
│  📊 Statistika                      │
│  Darslar: 47 · AI xarajat: $6.20    │
│  To'lagan: 297 000 so'm             │
│  Oxirgi kirish: 2 soat oldin        │
└─────────────────────────────────────┘
```

> Butun jarayon: **qidiruv → o'qituvchi → bitta tugma**. Telefonda 10 soniya. Hujjatdagi asosiy talab shu.

### 5.4 Qolgan admin ekranlari

| Ekran | Mazmun |
|---|---|
| **O'qituvchilar** | Qidiruv (ism/telefon/kod), holat filtri, viloyat |
| **Faollashtirish kodlari** | To'plam yaratish (masalan 50 ta), CSV eksport, bekor qilish |
| **To'lovlar** | Ro'yxat, qo'lda qayd etish, oylik hisobot, manba bo'yicha (video/sayt/tavsiya) |
| **Sotuv analitikasi** | Voronka: murojaat → bog'lanish → to'lov. Manba bo'yicha konversiya |
| **AI xarajatlari** | Kunlik grafik, model bo'yicha taqsimot, eng qimmat foydalanuvchilar |
| **Kesh boshqaruvi** | material_sets ro'yxati, reyting bo'yicha saralash, ko'rish, o'chirish, warmup ishga tushirish |
| **E'lonlar** | Yangilik / banner / ogohlantirish yaratish, maqsadli auditoriya |
| **Audit log** | Kim, qachon, nima qildi |

---

## 6. Mobil moslashuv

| Kenglik | Layout |
|---|---|
| < 640px | 1 ustun, pastda tab-bar, wizard to'liq ekran |
| 640–1024 | 2 ustun grid, tab-bar saqlanadi |
| > 1024 | Chap yon panel (sidebar), 3 ustun grid, wizard bitta sahifada |

**Mobil xususiyatlari:**
- Pastda 4 ta tab (Bosh · Darslar · Sevimli · Profil)
- Pull-to-refresh
- Bottom sheet modallar (markazdagi modal emas)
- Yuklab olish → to'g'ridan-to'g'ri "Fayllar" ilovasiga
- Offline: oxirgi ko'rilgan darslar keshlanadi

---

## 7. Komponentlar kutubxonasi

Faza 0'da quriladigan asosiy komponentlar:

```
components/ui/
├── Button.jsx        (primary | secondary | ghost | danger · sm/md/lg)
├── Card.jsx
├── Input.jsx         (label, error, prefix ikonka)
├── Select.jsx
├── Modal.jsx         (desktop: markaz · mobil: bottom sheet)
├── Toast.jsx
├── Badge.jsx         (success | warning | danger | info)
├── Progress.jsx      (chiziqli + doiraviy)
├── Skeleton.jsx      (yuklanish holati)
├── EmptyState.jsx    (ikonka + matn + CTA)
├── Tabs.jsx
├── Avatar.jsx
└── Rating.jsx        (★ 1–5)

components/lesson/
├── SubjectPicker.jsx
├── GradePicker.jsx
├── TopicInput.jsx      (mashhur mavzular taklifi bilan)
├── GenerationProgress.jsx
├── MaterialCard.jsx
├── LessonCard.jsx
└── CacheSuggestion.jsx
```

---

## 8. Holatlar (states) — unutilmasin

Har ekranda 4 ta holat bo'ladi. Ular ko'pincha unutiladi va mahsulot "chala" ko'rinadi:

| Holat | Ko'rinishi |
|---|---|
| **Loading** | Skeleton (spinner emas — skeleton tezroq his qilinadi) |
| **Empty** | Ikonka + tushuntirish + CTA tugma |
| **Error** | Nima bo'lgani + "Qayta urinish" tugmasi |
| **Success** | Toast yoki inline tasdiq |

Misol — bo'sh darslar ro'yxati:

```
┌─────────────────────────────┐
│                             │
│           📚                │
│                             │
│    Hali dars yaratmadingiz  │
│                             │
│  Birinchi darsingizni       │
│  2 daqiqada yarating        │
│                             │
│  ┌───────────────────────┐  │
│  │  ✨ Dars yaratish     │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

---

## 9. Dizayn qilishda qochish kerak bo'lgan narsalar

| ❌ Qilmang | ✅ Buning o'rniga |
|---|---|
| Oq fonda binafsha gradient hamma joyda | Gradient faqat asosiy CTA va logotipda |
| Inter/Roboto'ni hamma joyda | Manrope sarlavhalar + Inter matn |
| Bir ekranda 5 ta asosiy tugma | Bitta aniq asosiy amal |
| 12px matn | Minimal 14px, asosiy 16px |
| Spinner bilan 90 soniya kutish | Bosqichma-bosqich progress |
| Modal ustiga modal | Bottom sheet yoki alohida sahifa |
| Ingliz atamalari (`Dashboard`, `Settings`) | O'zbekcha (`Bosh sahifa`, `Sozlamalar`) |
| Bo'sh ro'yxatga "Ma'lumot yo'q" | Empty state + CTA |
