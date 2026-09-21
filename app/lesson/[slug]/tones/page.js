'use client';

import { use } from 'react';
import { LessonGate } from '@/features/lesson/LessonGate';
import { ToneTrainerScreen } from '@/features/tones/ToneTrainerScreen';
import { getLevel } from '@/features/lesson/bundled';

export default function Page({ params }) {
  const { slug } = use(params);
  return (
    <LessonGate slug={slug}>
      {(lesson) => (
        <ToneTrainerScreen
          level={getLevel(`hsk${lesson.level}`)}
          words={lesson.vocabulary}
          backHref={`/lesson/${lesson.slug}`}
          title={lesson.titleZh}
        />
      )}
    </LessonGate>
  );
}
