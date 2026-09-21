'use client';

import { use } from 'react';
import { LessonGate } from '@/features/lesson/LessonGate';
import { VocabTableScreen } from '@/features/vocabulary/VocabTableScreen';

export default function Page({ params }) {
  const { slug } = use(params);
  return <LessonGate slug={slug}>{(lesson) => <VocabTableScreen lesson={lesson} />}</LessonGate>;
}
