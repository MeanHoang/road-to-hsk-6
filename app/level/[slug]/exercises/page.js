'use client';

import { use } from 'react';
import { ExercisesScreen } from '@/features/exercises/ExercisesScreen';
import { getLevel, lessonsOfLevel } from '@/features/lesson/bundled';
import { wordsOfLevel } from '@/features/lesson/allWords';

export default function Page({ params }) {
  const { slug } = use(params);
  const level = getLevel(slug);
  if (!level) return <main className="page">Không có cấp này.</main>;
  return (
    <ExercisesScreen
      level={level}
      lessons={lessonsOfLevel(level.level)}
      vocab={wordsOfLevel(level.level)}
      backHref={`/level/${slug}`}
      title={level.title}
    />
  );
}
