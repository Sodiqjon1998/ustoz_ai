<?php

namespace App\Services\Ai;

/**
 * Qo'lda yozilgan ("curated") dars materiallari ombori.
 *
 * Mazmun sifati eng muhim talab bo'lgani uchun, tanlangan mavzular uchun
 * material shablon bilan emas, qo'lda — faktlari tekshirilgan holda yozilgan
 * va app/Services/Ai/Curated/ ichida saqlanadi.
 *
 * Mavzu omborda topilmasa null qaytariladi va chaqiruvchi AI'ga murojaat
 * qiladi. Shablon generatoriga tushish ATAYLAB olib tashlangan.
 *
 * Keyinchalik Claude API ulanganda shu sinf yonida API provayderi turadi —
 * generateLessonContent() ichidagi tanlov nuqtasi shu maqsadda ajratilgan.
 */
class CuratedContentGenerator
{
    private const DIR = __DIR__.'/Curated';

    /**
     * Mavzu uchun qo'lda yozilgan material bo'lsa qaytaradi, aks holda null.
     *
     * MUHIM: bu yerda shablon generatoriga TUSHILMAYDI. Shablon matni
     * ("Misollar", "... — 1-nuqta") o'qituvchiga yetib borishi mumkin emas —
     * mavzu topilmasa chaqiruvchi AI'ga murojaat qiladi.
     */
    public function find(string $topic, string $language): ?array
    {
        return $this->lookup($topic, $language);
    }

    /** Ombor qamrab olgan mavzular ro'yxati (diagnostika/testlar uchun). */
    public function topics(): array
    {
        return array_map(
            fn (string $path) => basename($path, '.php'),
            glob(self::DIR.'/*.php') ?: []
        );
    }

    private function lookup(string $topic, string $language): ?array
    {
        // Faqat o'zbekcha materiallar yozilgan — boshqa tilda so'ralsa
        // qo'lda yozilgan o'zbekcha matnni berish noto'g'ri bo'lardi.
        if ($language !== 'uz') {
            return null;
        }

        $file = self::DIR.'/'.$this->slug($topic).'.php';

        if (! is_file($file)) {
            return null;
        }

        $data = require $file;

        return is_array($data) ? $data : null;
    }

    /**
     * "HTML da video tegi" → "html-da-video-tegi".
     * Apostrof shakllari (' ' ‘ ’) va ortiqcha belgilar tashlanadi, shunda
     * o'qituvchi mavzuni biroz boshqacha yozsa ham topiladi.
     */
    private function slug(string $topic): string
    {
        $s = mb_strtolower(trim($topic));
        $s = str_replace(["'", "'", '‘', '’', '`', '´'], '', $s);
        $s = preg_replace('/[^\p{L}\p{N}]+/u', '-', $s) ?? '';

        return trim($s, '-');
    }
}
