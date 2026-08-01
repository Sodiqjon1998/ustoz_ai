<?php

namespace App\Services\Generator;

/**
 * Gemini'dan qaytgan kichik HTML parchalarini (<p>, <ul><li>, <ol><li>, <b>)
 * DOCX/PDF generatorlariga yuboriladigan tipik struktura'ga aylantiradi.
 * DocxOutlineBuilder va HandoutBuilder o'rtasida bo'lishiladi.
 *
 * DOMDocument ishlatiladi (oddiy regex emas) — chunki Gemini ba'zan <li>
 * ichida ichma-ich <ul>/<ol> qaytaradi, regex esa shu holatda birinchi
 * ichki </li>'da noto'g'ri to'xtab qolib, matnni kesib tashlar edi.
 */
class HtmlBlockParser
{
    /**
     * @return array<int, array{type: 'paragraph'|'bullet', runs: array<int, array{text: string, bold: bool}>}>
     */
    public static function toBlocks(string $html): array
    {
        if (trim($html) === '') {
            return [];
        }

        $dom = new \DOMDocument();
        libxml_use_internal_errors(true);
        // Boshiga XML kodlashni bildiruvchi ko'rsatma qo'shib yuboramiz —
        // DOMDocument'ga kirishni UTF-8 sifatida o'qishni majburlaydi (aks
        // holda Lotin-1 deb hisoblab, ko'p baytli belgilarni buzadi).
        // ESLATMA: bu ko'rsatmani izohda literal yozmaslik kerak — "?" va ">"
        // ketma-ketligi PHP'ning // izohini muddatidan oldin yopib qo'yadi.
        $xmlDeclaration = '<' . '?xml encoding="utf-8"?' . '>';
        $dom->loadHTML($xmlDeclaration.'<div>'.$html.'</div>', LIBXML_NOERROR | LIBXML_NOWARNING);
        libxml_clear_errors();

        $xpath = new \DOMXPath($dom);
        $blocks = [];

        foreach ($xpath->query('//p | //li') as $node) {
            $type = strtolower($node->nodeName) === 'li' ? 'bullet' : 'paragraph';
            $runs = self::nodeToRuns($node);

            if (! empty($runs)) {
                $blocks[] = ['type' => $type, 'runs' => $runs];
            }
        }

        // Hech qanday <p>/<li> topilmasa (model tekis matn qaytargan bo'lsa),
        // butun parchani bitta paragraf sifatida ishlatamiz.
        if (empty($blocks)) {
            $root = $dom->getElementsByTagName('div')->item(0);
            $runs = $root ? self::nodeToRuns($root) : [];
            if (! empty($runs)) {
                $blocks[] = ['type' => 'paragraph', 'runs' => $runs];
            }
        }

        return $blocks;
    }

    /**
     * @return array<int, array{text: string, bold: bool}>
     */
    private static function nodeToRuns(\DOMNode $node): array
    {
        $rawRuns = [];
        self::collectRuns($node, false, $rawRuns);

        if (empty($rawRuns)) {
            return [];
        }

        // Butun blokning boshi/oxiridagi ortiqcha bo'sh joyni olib tashlaymiz,
        // lekin run'lar orasidagi (masalan "<b>Termin:</b> tavsif" dagi)
        // probelni saqlaymiz — aks holda "Termin:tavsif" probelsiz qo'shiladi.
        $rawRuns[0]['text'] = ltrim($rawRuns[0]['text']);
        $lastIndex = count($rawRuns) - 1;
        $rawRuns[$lastIndex]['text'] = rtrim($rawRuns[$lastIndex]['text']);

        return array_values(array_filter($rawRuns, fn (array $r) => $r['text'] !== ''));
    }

    /**
     * @param  array<int, array{text: string, bold: bool}>  $out
     */
    private static function collectRuns(\DOMNode $node, bool $bold, array &$out): void
    {
        foreach ($node->childNodes as $child) {
            if ($child->nodeType === XML_TEXT_NODE) {
                $text = preg_replace('/\s+/u', ' ', $child->textContent);
                if ($text !== '' && $text !== null) {
                    $out[] = ['text' => $text, 'bold' => $bold];
                }

                continue;
            }

            if ($child->nodeType !== XML_ELEMENT_NODE) {
                continue;
            }

            $tag = strtolower($child->nodeName);

            if (in_array($tag, ['ul', 'ol'], true)) {
                // Ichma-ich ro'yxat — uning <li>'lari yuqorida "//li" xpath
                // so'rovi orqali alohida blok sifatida allaqachon topiladi,
                // shuning uchun bu yerda o'tkazib yuboramiz (takrorlanmasin).
                continue;
            }

            $childBold = $bold || in_array($tag, ['b', 'strong'], true);
            self::collectRuns($child, $childBold, $out);
        }
    }
}
