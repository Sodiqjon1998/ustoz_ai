<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable([
    'full_name', 'email', 'password', 'phone', 'role', 'teacher_code',
    'status', 'school', 'region', 'default_subject_id', 'default_language',
    'must_change_password', 'created_by', 'gemini_api_key',
])]
#[Hidden(['password', 'remember_token', 'gemini_api_key'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'must_change_password' => 'boolean',
            'last_login_at' => 'datetime',
            'gemini_api_key' => 'encrypted',
        ];
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    public function isAdmin(): bool
    {
        return in_array($this->role, ['super_admin', 'admin'], true);
    }

    public function isTeacher(): bool
    {
        return $this->role === 'teacher';
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function lessons()
    {
        return $this->hasMany(Lesson::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function leads()
    {
        return $this->hasMany(Lead::class, 'assigned_to');
    }

    public function activeSubscription(): ?Subscription
    {
        return $this->subscriptions()
            ->where('status', 'active')
            ->where('ends_at', '>', now())
            ->latest('ends_at')
            ->first();
    }
}
