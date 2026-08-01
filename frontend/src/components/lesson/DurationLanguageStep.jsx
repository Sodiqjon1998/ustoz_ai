const DURATIONS = [
  { value: 45, label: '45 daqiqa', hint: 'Oddiy dars' },
  { value: 80, label: '80 daqiqa', hint: 'Juftlik' },
]

const LANGUAGES = [
  { value: 'uz', label: "O'zbek" },
  { value: 'ru', label: 'Русский' },
  { value: 'en', label: 'English' },
]

export default function DurationLanguageStep({ duration, language, onDuration, onLanguage }) {
  return (
    <div className="flex flex-col gap-7">
      <div>
        <p className="mb-3 font-heading text-base font-semibold text-text">Davomiyligi</p>
        <div className="grid grid-cols-2 gap-3">
          {DURATIONS.map((d) => {
            const selected = duration === d.value
            return (
              <button
                key={d.value}
                type="button"
                onClick={() => onDuration(d.value)}
                className={`flex min-h-[72px] flex-col items-center justify-center gap-0.5 rounded-xl border-2 transition-colors ${
                  selected
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-border bg-white text-text hover:border-brand-200'
                }`}
              >
                <span className="font-heading text-lg font-bold">{d.label}</span>
                <span className="text-sm text-text-mute">{d.hint}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <p className="mb-3 font-heading text-base font-semibold text-text">Til</p>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((l) => {
            const selected = language === l.value
            return (
              <button
                key={l.value}
                type="button"
                onClick={() => onLanguage(l.value)}
                className={`min-h-[48px] flex-1 rounded-xl border-2 px-4 text-base font-medium transition-colors ${
                  selected
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-border bg-white text-text hover:border-brand-200'
                }`}
              >
                {l.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
