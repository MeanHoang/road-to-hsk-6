'use client';

import { use } from 'react';
import { LessonGate } from '@/features/lesson/LessonGate';
import { NotesScreen } from '@/features/notes/NotesScreen';

export default function Page({ params }) {
  const { slug } = use(params);
  return <LessonGate slug={slug}>{(lesson) => <NotesScreen lesson={lesson} />}</LessonGate>;
}
