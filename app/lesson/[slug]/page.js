'use client';

import { use } from 'react';
import { LessonGate } from '@/features/lesson/LessonGate';
import { LessonOverviewScreen } from '@/features/lesson/LessonOverviewScreen';

export default function Page({ params }) {
  const { slug } = use(params);
  return <LessonGate slug={slug}>{(lesson) => <LessonOverviewScreen lesson={lesson} />}</LessonGate>;
}
