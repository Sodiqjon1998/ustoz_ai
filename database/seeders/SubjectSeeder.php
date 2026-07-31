<?php

namespace Database\Seeders;

use App\Models\Subject;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SubjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $subjects = [
            ['slug' => 'ona_tili', 'name_uz' => 'Ona tili', 'name_ru' => 'Родной язык', 'name_en' => 'Native Language', 'icon' => 'book-open', 'color' => '#4F46E5', 'theme_key' => 'language_arts'],
            ['slug' => 'rus_tili', 'name_uz' => 'Rus tili', 'name_ru' => 'Русский язык', 'name_en' => 'Russian', 'icon' => 'languages', 'color' => '#4F46E5', 'theme_key' => 'language_arts'],
            ['slug' => 'ingliz_tili', 'name_uz' => 'Ingliz tili', 'name_ru' => 'Английский язык', 'name_en' => 'English', 'icon' => 'languages', 'color' => '#4F46E5', 'theme_key' => 'language_arts'],
            ['slug' => 'matematika', 'name_uz' => 'Matematika', 'name_ru' => 'Математика', 'name_en' => 'Mathematics', 'icon' => 'sigma', 'color' => '#0891B2', 'theme_key' => 'mathematics'],
            ['slug' => 'algebra', 'name_uz' => 'Algebra', 'name_ru' => 'Алгебра', 'name_en' => 'Algebra', 'icon' => 'sigma', 'color' => '#0891B2', 'theme_key' => 'mathematics'],
            ['slug' => 'geometriya', 'name_uz' => 'Geometriya', 'name_ru' => 'Геометрия', 'name_en' => 'Geometry', 'icon' => 'shapes', 'color' => '#0891B2', 'theme_key' => 'mathematics'],
            ['slug' => 'fizika', 'name_uz' => 'Fizika', 'name_ru' => 'Физика', 'name_en' => 'Physics', 'icon' => 'atom', 'color' => '#059669', 'theme_key' => 'natural_sci'],
            ['slug' => 'kimyo', 'name_uz' => 'Kimyo', 'name_ru' => 'Химия', 'name_en' => 'Chemistry', 'icon' => 'flask-conical', 'color' => '#059669', 'theme_key' => 'natural_sci'],
            ['slug' => 'biologiya', 'name_uz' => 'Biologiya', 'name_ru' => 'Биология', 'name_en' => 'Biology', 'icon' => 'leaf', 'color' => '#059669', 'theme_key' => 'natural_sci'],
            ['slug' => 'tarix', 'name_uz' => 'Tarix', 'name_ru' => 'История', 'name_en' => 'History', 'icon' => 'landmark', 'color' => '#B45309', 'theme_key' => 'humanities'],
            ['slug' => 'geografiya', 'name_uz' => 'Geografiya', 'name_ru' => 'География', 'name_en' => 'Geography', 'icon' => 'globe', 'color' => '#B45309', 'theme_key' => 'humanities'],
            ['slug' => 'informatika', 'name_uz' => 'Informatika', 'name_ru' => 'Информатика', 'name_en' => 'Computer Science', 'icon' => 'cpu', 'color' => '#7C3AED', 'theme_key' => 'it'],
            ['slug' => 'tarbiya', 'name_uz' => 'Tarbiya', 'name_ru' => 'Воспитание', 'name_en' => 'Ethics', 'icon' => 'heart-handshake', 'color' => '#B45309', 'theme_key' => 'humanities'],
            ['slug' => 'chizmachilik', 'name_uz' => 'Chizmachilik', 'name_ru' => 'Черчение', 'name_en' => 'Technical Drawing', 'icon' => 'ruler', 'color' => '#B45309', 'theme_key' => 'humanities'],
            ['slug' => 'musiqa', 'name_uz' => 'Musiqa', 'name_ru' => 'Музыка', 'name_en' => 'Music', 'icon' => 'music', 'color' => '#B45309', 'theme_key' => 'humanities'],
            ['slug' => 'tasviriy_sanat', 'name_uz' => 'Tasviriy san\'at', 'name_ru' => 'Изобразительное искусство', 'name_en' => 'Fine Arts', 'icon' => 'palette', 'color' => '#B45309', 'theme_key' => 'humanities'],
            ['slug' => 'jismoniy_tarbiya', 'name_uz' => 'Jismoniy tarbiya', 'name_ru' => 'Физическая культура', 'name_en' => 'Physical Education', 'icon' => 'dumbbell', 'color' => '#B45309', 'theme_key' => 'humanities'],
        ];

        foreach ($subjects as $i => $subject) {
            Subject::updateOrCreate(
                ['slug' => $subject['slug']],
                $subject + [
                    'grade_min' => 1,
                    'grade_max' => 11,
                    'default_language' => 'uz',
                    'is_active' => true,
                    'sort_order' => $i,
                ]
            );
        }
    }
}
