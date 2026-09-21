'use client';

import { use } from 'react';
import { LessonGate } from '@/features/lesson/LessonGate';
import { ListeningScreen } from '@/features/listening/ListeningScreen';
import { getLevel } from '@/features/lesson/bundled';

export default function Page({ params }) {
  const { slug } = use(params);
  return (
    <LessonGate slug={slug}>
      {(lesson) => (
        <ListeningScreen
          level={getLevel(`hsk${lesson.level}`)}
          words={lesson.vocabulary.map((w) => ({ ...w, lessonSlug: lesson.slug }))}
          backHref={`/lesson/${lesson.slug}`}
          title={lesson.titleZh}
        />
      )}
    </LessonGate>
  );
}
