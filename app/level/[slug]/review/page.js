'use client';

import { use } from 'react';
import { CardsScreen } from '@/features/vocabulary/CardsScreen';
import { getLevel } from '@/features/lesson/bundled';
import { wordsOfLevel } from '@/features/lesson/allWords';

export default function Page({ params }) {
  const { slug } = use(params);
  const level = getLevel(slug);
  if (!level) return <main className="page">Không có cấp này.</main>;
  return (
    <CardsScreen
      level={level}
      words={wordsOfLevel(level.level)}
      backHref={`/level/${slug}`}
      title={level.title}
    />
  );
}
