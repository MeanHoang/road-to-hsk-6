'use client';

import { use } from 'react';
import { LessonGate } from '@/features/lesson/LessonGate';
import { CardsScreen } from '@/features/vocabulary/CardsScreen';
import { getLevel } from '@/features/lesson/bundled';

export default function Page({ params }) {
  const { slug } = use(params);
  return (
    <LessonGate slug={slug}>
      {(lesson) => (
        <CardsScreen
          level={getLevel(`hsk${lesson.level}`)}
          words={lesson.vocabulary.map((w) => ({ ...w, lessonSlug: lesson.slug }))}
          backHref={`/lesson/${lesson.slug}`}
          title={lesson.titleZh}
        />
      )}
    </LessonGate>
  );
}
