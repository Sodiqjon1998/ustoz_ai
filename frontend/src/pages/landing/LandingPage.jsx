import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  Presentation,
  FileText,
  Printer,
  ListChecks,
  Zap,
  Check,
  Phone,
  Send,
  ChevronDown,
} from 'lucide-react'
import Button from '../../components/ui/Button'
import OrderModal from '../../components/landing/OrderModal'
import { CONTACTS } from '../../lib/contacts'
import { listPublicPlans } from '../../api/public'

/**
 * Ochiq landing sahifa — reklamadan kelgan foydalanuvchi shu yerga tushadi.
 * Docs §3.1 tuzilishiga mos: kirish → mahsulotlar → qanday ishlaydi → tariflar
 * → savol-javob → footer. Ijtimoiy dalil (o'qituvchi sharhlari, statistika)
 * ATAYLAB olib tashlangan — hali haqiqiy foydalanuvchi yo'q, soxta raqamlar
 * ishonchni yo'qotadi (foydalanuvchi qarori).
 */
export default function LandingPage() {
  const [orderOpen, setOrderOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [plans, setPlans] = useState([])

  useEffect(() => {
    listPublicPlans().then(setPlans).catch(() => setPlans([]))
  }, [])

  function openOrder(planName = null) {
    setSelectedPlan(planName)
    setOrderOpen(true)
  }

  return (
    <div className="min-h-svh bg-white text-text">
      <TopBar onOrder={() => openOrder()} />
      <Hero onOrder={() => openOrder()} />
      <MaterialsSection />
      <HowItWorks />
      <Pricing plans={plans} onOrder={openOrder} />
      <Faq />
      <Footer onOrder={() => openOrder()} />

      <OrderModal
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        defaultPlan={selectedPlan}
      />
    </div>
  )
}

function TopBar({ onOrder }) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-white/90 px-5 backdrop-blur">
      <span className="font-heading text-lg font-bold bg-gradient-to-br from-brand-500 to-purple-500 bg-clip-text text-transparent">
        USTOZ AI
      </span>
      <div className="flex items-center gap-2">
        <Link to="/login" className="text-sm font-medium text-text-mute hover:text-text">
          Kirish
        </Link>
        <Button size="sm" onClick={onOrder}>
          Buyurtma
        </Button>
      </div>
    </header>
  )
}

function Hero({ onOrder }) {
  return (
    <section className="px-5 pt-10 pb-14 text-center sm:pt-16 sm:pb-20">
      <div className="mx-auto max-w-2xl">
        <div className="mx-auto mb-4 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700">
          <Sparkles className="h-4 w-4" /> AI dars materiallari
        </div>
        <h1 className="font-heading text-3xl font-bold leading-tight text-text sm:text-5xl">
          Darsga tayyorgarlik —{' '}
          <span className="bg-gradient-to-br from-brand-500 to-purple-500 bg-clip-text text-transparent">
            4 soat emas, 2 daqiqa
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-base text-text-mute sm:text-lg">
          Fan, sinf va mavzuni tanlang. Prezentatsiya, konspekt, tarqatma va testlar avtomatik tayyorlanadi.
        </p>
        <div className="mx-auto mt-8 flex max-w-sm flex-col gap-2.5">
          <Button size="lg" onClick={onOrder}>
            <Sparkles className="h-5 w-5" /> Buyurtma berish
          </Button>
          <a
            href={`https://t.me/${CONTACTS.telegramUsername}`}
            target="_blank"
            rel="noreferrer"
            className="flex h-14 items-center justify-center gap-2 rounded-xl bg-brand-50 font-heading text-lg font-semibold text-brand-700 hover:bg-brand-100"
          >
            <Send className="h-5 w-5" /> Telegramda savol berish
          </a>
        </div>
      </div>
    </section>
  )
}

const MATERIALS = [
  { icon: Presentation, name: 'Prezentatsiya', desc: '10 slayd, diagrammalar bilan', ext: 'PPTX' },
  { icon: FileText, name: 'Konspekt', desc: "Dars ishlanmasi, o'qituvchi uchun", ext: 'DOCX' },
  { icon: Printer, name: 'Tarqatma materiallar', desc: "O'yinli mashqlar (krossvord, anagramma...)", ext: 'PDF' },
  { icon: ListChecks, name: 'Test', desc: '20-30 savol, javoblar bilan', ext: 'PDF' },
]

function MaterialsSection() {
  return (
    <section className="border-t border-border bg-bg-subtle px-5 py-14">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center font-heading text-2xl font-bold text-text sm:text-3xl">
          Har darsga 4 ta tayyor fayl
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-text-mute">
          Yuklab olish va bevosita darsda ishlatish uchun tayyor
        </p>
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {MATERIALS.map(({ icon: Icon, name, desc, ext }) => (
            <div
              key={name}
              className="flex items-start gap-3 rounded-2xl border border-border bg-white p-4"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <Icon className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-semibold text-text">{name}</h3>
                  <span className="rounded-md bg-bg-subtle px-1.5 py-0.5 text-xs font-medium text-text-mute">
                    {ext}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-text-mute">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const STEPS = [
  { n: '1', title: 'Fan va sinfni tanlaysiz', desc: '15 dan ortiq fan, 1-11 sinf' },
  { n: '2', title: 'Mavzuni yozasiz', desc: 'Yoki tayyor keshdan tanlaysiz — bir zumda' },
  { n: '3', title: '2 daqiqada yuklab olasiz', desc: 'To\'liq tayyor to\'plam — chop eting va ishga tushing' },
]

function HowItWorks() {
  return (
    <section className="px-5 py-14">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center font-heading text-2xl font-bold text-text sm:text-3xl">
          Qanday ishlaydi
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-2xl border border-border p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-purple-500 font-heading text-lg font-bold text-white">
                {s.n}
              </span>
              <h3 className="mt-3 font-heading text-lg font-semibold text-text">{s.title}</h3>
              <p className="mt-1 text-text-mute">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Pricing({ plans, onOrder }) {
  return (
    <section id="tariflar" className="border-t border-border bg-bg-subtle px-5 py-14">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center font-heading text-2xl font-bold text-text sm:text-3xl">
          Tariflar
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-center text-text-mute">
          Xohlagan tarifni tanlang. To'lov karta orqali, admin qo'lda tasdiqlaydi.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {plans.length === 0
            ? [1, 2, 3].map((i) => (
                <div key={i} className="h-64 animate-pulse rounded-2xl border border-border bg-white" />
              ))
            : plans.map((p) => {
                const isPopular = p.name === 'Pro'
                return (
                  <div
                    key={p.id}
                    className={`relative flex flex-col rounded-2xl border p-5 ${
                      isPopular
                        ? 'border-brand-500 bg-white shadow-lg'
                        : 'border-border bg-white'
                    }`}
                  >
                    {isPopular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
                        MASHHUR
                      </span>
                    )}
                    <h3 className="font-heading text-xl font-bold text-text">{p.name}</h3>
                    <div className="mt-3 flex items-baseline gap-1.5">
                      <span className="font-heading text-3xl font-bold text-text">
                        {(p.price_uzs / 1000).toLocaleString('uz-UZ')}
                      </span>
                      <span className="text-text-mute">ming so'm</span>
                    </div>
                    <p className="mt-0.5 text-sm text-text-mute">
                      {p.duration_days >= 365
                        ? `1 yil uchun`
                        : `${p.duration_days} kun uchun`}
                    </p>
                    <ul className="mt-4 flex flex-1 flex-col gap-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                        <span>4 ta fayl har darsda: PPTX, DOCX, tarqatma, test</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                        <span>Barcha fanlar va sinflar (1-11)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                        <span>Telegram orqali yordam</span>
                      </li>
                    </ul>
                    <Button
                      variant={isPopular ? 'primary' : 'secondary'}
                      size="lg"
                      className="mt-5"
                      onClick={() => onOrder(p.name)}
                    >
                      Tanlash
                    </Button>
                  </div>
                )
              })}
        </div>
      </div>
    </section>
  )
}

const FAQS = [
  {
    q: 'Qanday to\'layman?',
    a: "To'lov karta orqali amalga oshiriladi. Buyurtma yuborganingizdan keyin 1 soat ichida biz bog'lanamiz, karta raqami va ko'rsatmalarni yuboramiz. To'lov tasdiqlangach, login va parol sizga yetkaziladi.",
  },
  {
    q: "Qaysi fanlar bor?",
    a: "15 dan ortiq fan qo'llab-quvvatlanadi: rus tili, ingliz tili, matematika, fizika, kimyo, biologiya, informatika, tarix, geografiya, adabiyot, ona tili va boshqalar. 1-11 sinf uchun mos.",
  },
  {
    q: "Materiallarni tahrirlashim mumkinmi?",
    a: 'Ha. PPTX, DOCX va PDF fayllar oddiy Office / PDF muharrirlarida ochiladi va tahrirlanadi — o\'zingizga xos qilib moslashtirasiz.',
  },
  {
    q: 'Agar meni yoqmasa, pulim qaytadimi?',
    a: "Birinchi darsingiz sifatidan qoniqmasangiz — Telegram orqali yozing, gaplashamiz. Biz sifatga javob beramiz.",
  },
  {
    q: 'Bir kunda nechta dars yaratsam bo\'ladi?',
    a: "Cheklov yo'q hisobida — kunlik bosh og'rig'ingizga qarab, xohlagancha dars yaratsangiz bo'ladi.",
  },
]

function Faq() {
  return (
    <section className="px-5 py-14">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center font-heading text-2xl font-bold text-text sm:text-3xl">
          Ko'p so'raladigan savollar
        </h2>
        <div className="mt-8 flex flex-col gap-2">
          {FAQS.map((f) => (
            <FaqItem key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <details
      className="group rounded-xl border border-border bg-white"
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-4 font-heading font-semibold text-text">
        {q}
        <ChevronDown className={`h-5 w-5 shrink-0 text-text-mute transition-transform ${open ? 'rotate-180' : ''}`} />
      </summary>
      <p className="px-4 pb-4 text-text-mute">{a}</p>
    </details>
  )
}

function Footer({ onOrder }) {
  return (
    <footer className="border-t border-border bg-bg-subtle px-5 py-10">
      <div className="mx-auto max-w-4xl text-center">
        <h3 className="font-heading text-xl font-bold text-text">Savollaringiz bormi?</h3>
        <p className="mt-1 text-text-mute">To'g'ridan-to'g'ri yozing yoki qo'ng'iroq qiling</p>
        <div className="mt-5 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
          <a
            href={`tel:${CONTACTS.phoneE164}`}
            className="flex h-12 items-center gap-2 rounded-xl border border-border bg-white px-5 font-heading font-semibold text-text hover:bg-bg-subtle"
          >
            <Phone className="h-4 w-4" /> {CONTACTS.phoneDisplay}
          </a>
          <a
            href={`https://t.me/${CONTACTS.telegramUsername}`}
            target="_blank"
            rel="noreferrer"
            className="flex h-12 items-center gap-2 rounded-xl bg-brand-50 px-5 font-heading font-semibold text-brand-700 hover:bg-brand-100"
          >
            <Send className="h-4 w-4" /> {CONTACTS.telegramHandle}
          </a>
        </div>
        <div className="mt-8">
          <Button onClick={onOrder}>Buyurtma berish</Button>
        </div>
        <p className="mt-8 text-xs text-text-mute">
          © {new Date().getFullYear()} USTOZ AI — dars materiallari
        </p>
      </div>
    </footer>
  )
}
