<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function show()
    {
        $geminiKey = Setting::get('gemini_api_key');

        return response()->json([
            'data' => [
                'gemini_api_key_set' => (bool) $geminiKey,
                'gemini_api_key_masked' => $geminiKey ? $this->mask($geminiKey) : null,
                'gemini_model' => config('services.gemini.model'),
                'gemini_fallback_model' => config('services.gemini.fallback_model'),
            ],
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'gemini_api_key' => ['required', 'string', 'min:10', 'max:200'],
        ]);

        Setting::set('gemini_api_key', trim($data['gemini_api_key']));

        return response()->json(['data' => ['message' => 'Saqlandi.']]);
    }

    private function mask(string $key): string
    {
        $len = strlen($key);

        if ($len <= 8) {
            return str_repeat('•', $len);
        }

        return substr($key, 0, 4).str_repeat('•', $len - 8).substr($key, -4);
    }
}
