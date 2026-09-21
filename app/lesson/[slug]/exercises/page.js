'use client';

import { use } from 'react';
import { LessonGate } from '@/features/lesson/LessonGate';
import { ExercisesScreen } from '@/features/exercises/ExercisesScreen';
import { getLevel, lessonsOfLevel } from '@/features/lesson/bundled';

export default function Page({ params }) {
  const { slug } = use(params);
  return (
    <LessonGate slug={slug}>
      {(lesson) => (
        <ExercisesScreen
          level={getLevel(`hsk${lesson.level}`)}
          lessons={[lesson]}
          vocab={lesson.vocabulary}
          backHref={`/lesson/${lesson.slug}`}
          title={lesson.titleZh}
        />
      )}
    </LessonGate>
  );
}
