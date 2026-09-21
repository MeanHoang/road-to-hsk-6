'use client';

import { use } from 'react';
import { LevelScreen } from '@/features/lesson/LevelScreen';

export default function Page({ params }) {
  const { slug } = use(params);
  return <LevelScreen slug={slug} />;
}
