import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

// Backend `HandoutBuilder::PRIMARY_GAMES` va `SENIOR_GAMES` bilan sinxron.
// Boshlang'ich (1-4) — harf-asosli, konkret; yuqori (5+) — tahliliy, mavhumroq.
const PRIMARY = [
  { key: 'anagram', title: 'Anagramma', desc: 'Aralashgan harflardan so\'zni topish' },
  { key: 'matching', title: 'Moslashtirish', desc: 'Atama va ta\'rifni juftlash' },
  { key: 'wordsearch', title: "So'z izlash", desc: 'Katta jadvaldan so\'zlarni topish' },
  { key: 'codecracker', title: 'Kod ochish', desc: "Raqamli shifrni yechib so'zni topish" },
  { key: 'sequence', title: "To'g'ri tartib", desc: 'Aralashgan qadamlarni tartiblash' },
  { key: 'flashcard', title: 'Kartochkalar', desc: "Kesib olinadigan ikki tomonlama so'z kartochkalari" },
  { key: 'compare', title: "Taqqoslash varag'i", desc: 'Ikki narsani solishtiruvchi ma\'lumotnoma (topilsa)' },
  { key: 'grammar', title: 'Grammatika jadvali', desc: "Qoida va misol jadvali (topilsa)", languageOnly: true },
]

const SENIOR = [
  { key: 'matching', title: 'Moslashtirish', desc: 'Atama va ta\'rifni juftlash' },
  { key: 'wordsearch', title: "So'z izlash", desc: 'Katta jadvaldan so\'zlarni topish' },
  { key: 'codecracker', title: 'Kod ochish', desc: "Raqamli shifrni yechib so'zni topish" },
  { key: 'sequence', title: "To'g'ri tartib", desc: 'Aralashgan qadamlarni tartiblash' },
  { key: 'crossword', title: 'Krossvord', desc: "Ta'rifga qarab katakchani to\'ldirish" },
  { key: 'truefalse', title: "To'g'ri/Noto'g'ri", desc: 'Har juftlik to\'g\'riligini aniqlash' },
  { key: 'flashcard', title: 'Kartochkalar', desc: "Kesib olinadigan ikki tomonlama so'z kartochkalari" },
  { key: 'compare', title: "Taqqoslash varag'i", desc: 'Ikki narsani solishtiruvchi ma\'lumotnoma (topilsa)' },
  { key: 'grammar', title: 'Grammatika jadvali', desc: "Qoida va misol jadvali (topilsa)", languageOnly: true },
]

// Faqat "Matematika" fanida ko'rinadi — sinf bandidan mustaqil (backend
// HandoutBuilder::MATH_GAME bilan sinxron).
const MATH_GAME = { key: 'mathworksheet', title: 'Matematik amallar', desc: "Qo'shish/ayirish/ko'paytirish/bo'lish misollari" }

// Backend `GeminiService::TRANSLATABLE_LANGUAGE_SUBJECTS` bilan sinxron —
// faqat shu fanlarda tarjima/grammatika ma'lumoti so'raladi.
const LANGUAGE_SUBJECTS = ['Ingliz tili', 'Rus tili', "Qirg'iz tili"]

export function gamesFor(grade, subjectName) {
  const list = grade != null && grade <= 4 ? PRIMARY : SENIOR
  const isLanguageSubject = LANGUAGE_SUBJECTS.includes(subjectName)
  const filtered = list.filter((opt) => !opt.languageOnly || isLanguageSubject)
  return subjectName === 'Matematika' ? [...filtered, MATH_GAME] : filtered
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
}
const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
}

export default function GameTypePicker({ grade, subjectName, value, onChange }) {
  const options = gamesFor(grade, subjectName)
  const selected = new Set(value ?? [])

  function toggle(key) {
    const next = new Set(selected)
    if (next.has(key)) {
      // Kamida bittasi belgilangan bo'lishi kerak — hammasini olib tashlashga yo'l qo'ymaymiz.
      if (next.size === 1) return
      next.delete(key)
    } else {
      next.add(key)
    }
    onChange([...next])
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-2">
      {options.map((opt) => {
        const isOn = selected.has(opt.key)
        return (
          <motion.button
            key={opt.key}
            type="button"
            variants={item}
            whileTap={{ scale: 0.99 }}
            onClick={() => toggle(opt.key)}
            aria-pressed={isOn}
            className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors ${
              isOn
                ? 'border-brand-500 bg-brand-50'
                : 'border-border bg-white hover:border-brand-300'
            }`}
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                isOn ? 'border-brand-500 bg-brand-500 text-white' : 'border-border bg-white'
              }`}
            >
              {isOn && <Check className="h-4 w-4" strokeWidth={3} />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-heading font-semibold text-text">{opt.title}</p>
              <p className="text-sm text-text-mute">{opt.desc}</p>
            </div>
          </motion.button>
        )
      })}
    </motion.div>
  )
}
