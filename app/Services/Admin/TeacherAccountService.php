<?php

namespace App\Services\Admin;

use App\Models\User;

/**
 * O'qituvchi akkaunt yaratish ikki joydan chaqiriladi (admin\TeacherController::store
 * va admin\LeadController::convert) — kod/parol generatsiyasi shu yerda bir marta.
 */
class TeacherAccountService
{
    public function generateTeacherCode(): string
    {
        do {
            $code = 'USTOZ-'.random_int(1000, 9999);
        } while (User::where('teacher_code', $code)->exists());

        return $code;
    }

    public function generateTempPassword(): string
    {
        return 'Ustoz'.random_int(1000, 9999);
    }

    /**
     * @return array{0: User, 1: string} [yaratilgan user, ochiq (hash'lanmagan) vaqtinchalik parol]
     */
    public function createAccount(array $data, ?User $createdBy): array
    {
        $tempPassword = $this->generateTempPassword();

        $user = User::create([
            'full_name' => $data['full_name'],
            'phone' => $data['phone'],
            'password' => $tempPassword,
            'role' => 'teacher',
            'teacher_code' => $this->generateTeacherCode(),
            'status' => 'pending',
            'school' => $data['school'] ?? null,
            'region' => $data['region'] ?? null,
            'default_subject_id' => $data['subject_id'] ?? null,
            'default_language' => $data['language'] ?? 'uz',
            'must_change_password' => true,
            'created_by' => $createdBy?->id,
        ]);

        return [$user, $tempPassword];
    }
}
