# USTOZ AI — Loyiha hujjatlari

> AI yordamida barcha fan o'qituvchilari uchun dars materiallari platformasi
> Loyihalash bosqichi · 2026-07-30

---

## Hujjatlar

| # | Fayl | Mazmun |
|---|---|---|
| 1 | [01-ARXITEKTURA.md](01-ARXITEKTURA.md) | Mahsulot ta'rifi, materiallar va formatlar, sotuv modeli, texnologiya steki, tizim arxitekturasi, papka tuzilishi, xavfsizlik, cloud infratuzilma, mobil reja, **bosqichma-bosqich yo'l xaritasi** |
| 2 | [02-BAZA-VA-API.md](02-BAZA-VA-API.md) | To'liq ERD, 16 ta jadval sxemasi, REST API endpointlari, murojaatlar (leads) voronkasi, **bir tugmali sotuv** endpointi, xatolik kodlari |
| 3 | [03-AI-KESH-GENERATSIYA.md](03-AI-KESH-GENERATSIYA.md) | 3 bosqichli kesh algoritmi, mavzu normalizatsiyasi, AI model tanlovi, generatsiya oqimi, 6 fayl renderi, editor arxitekturasi, **to'liq xarajat hisobi** |
| 4 | [04-UI-UX.md](04-UI-UX.md) | Dizayn tokenlari, landing sahifa, o'qituvchi ekranlari (8 ta), admin panel (4 ta), mobil moslashuv, komponentlar kutubxonasi |

---

## Qisqacha

**Muammo:** o'qituvchi bir darsga 2–4 soat tayyorgarlik ko'radi.
**Yechim:** fan + sinf + mavzu + davomiylik → 2 daqiqada 6 ta tayyor fayl.

| # | Material | Format |
|---|---|---|
| 1 | Prezentatsiya (15 slayd) | PPTX |
| 2 | O'qituvchi konspekti | DOCX |
| 3 | Tarqatma material | PDF |
| 4 | Oddiy test (20 savol) | PDF |
| 5 | Chorak testi (30 savol) | PDF |
| 6 | Qo'shimcha materiallar | PDF |

---

## Qabul qilingan asosiy qarorlar

| Qaror | Sabab |
|---|---|
| **Laravel 12 + React 19** (Next.js/NestJS emas) | Mavjud tajriba, OSPanel muhiti, 2× tezroq natija |
| **PostgreSQL + pgvector** (MySQL emas) | Mavzular o'xshashligini topish MySQL'da imkonsiz |
| **Node sidecar** fayl generatsiyasi uchun | `pptxgenjs` + Puppeteer PHP kutubxonalaridan ancha sifatli |
| **To'lov shlyuzi yo'q** — karta orqali qo'lda | Integratsiya 2–4 hafta + komissiya; 500+ userdan keyin ko'riladi |
| **Ro'yxatdan o'tish yo'q** — admin ochadi | To'lov qo'lda qabul qilinadi |
| **Tahrir keshdan alohida** (overlay) | Bir o'qituvchi tahriri minglab boshqasiga tarqalmasin |
| **MVP'da WYSIWYG editor yo'q** | 3+ oy ish; matn tahriri 80% foydani beradi |

---

## Eng muhim raqamlar

| Ko'rsatkich | Qiymat |
|---|---|
| Bir generatsiya AI xarajati | ~$0.52 (Haiku bilan $0.40) |
| Keshdan olish xarajati | **$0.00** |
| Batch API bilan (50% chegirma) | $0.20 |
| **Butun o'quv dasturini oldindan keshlash** | **~$700 bir marta** |
| MVP muddati (0–3 faza) | 9–12 hafta |
| Server xarajati (0–500 user) | ~$40–60 / oy |

> 🔑 **Eng yuqori ROI'li qaror:** ishga tushirishdan oldin Batch API bilan butun o'quv dasturini keshga yozish.
> ~$700 → birinchi kundan kesh hit rate ~85%.
> Batafsil: [03-AI-KESH-GENERATSIYA.md § 6.3](03-AI-KESH-GENERATSIYA.md#63--eng-muhim-strategik-tavsiya-keshni-oldindan-toldirish)

---

## Keyingi qadam

Hujjat tasdiqlangach — **Faza 0** (1–2 hafta):

- [ ] Laravel 12 + React 19 skeleti
- [ ] PostgreSQL 16 + pgvector o'rnatish
- [ ] Redis + Horizon
- [ ] Migratsiyalar (16 jadval)
- [ ] Auth (Sanctum) + rollar
- [ ] Node generator skeleti + 1 ta PPTX shabloni

Ochiq savollar: [01-ARXITEKTURA.md § 9](01-ARXITEKTURA.md#9-ochiq-savollar-qaror-kerak)
