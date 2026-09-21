// Bộ nội dung BUNDLE SẴN trong repo — nguồn dự phòng khi chưa cấu hình Firestore.
// SINH TỰ ĐỘNG bằng scripts/gen-bundled.mjs — đừng sửa tay.

import levelsIndex from '@/content/levels.json';
import { assemble } from './schema';

import hsk1l01lesson from '@/content/hsk1/lesson-01/lesson.json';
import hsk1l01vocabulary from '@/content/hsk1/lesson-01/vocabulary.json';
import hsk1l02lesson from '@/content/hsk1/lesson-02/lesson.json';
import hsk1l02vocabulary from '@/content/hsk1/lesson-02/vocabulary.json';
import hsk1l03lesson from '@/content/hsk1/lesson-03/lesson.json';
import hsk1l03vocabulary from '@/content/hsk1/lesson-03/vocabulary.json';
import hsk1l03notes from '@/content/hsk1/lesson-03/notes.json';
import hsk1l04lesson from '@/content/hsk1/lesson-04/lesson.json';
import hsk1l04vocabulary from '@/content/hsk1/lesson-04/vocabulary.json';
import hsk1l04notes from '@/content/hsk1/lesson-04/notes.json';
import hsk1l05lesson from '@/content/hsk1/lesson-05/lesson.json';
import hsk1l05vocabulary from '@/content/hsk1/lesson-05/vocabulary.json';
import hsk1l05notes from '@/content/hsk1/lesson-05/notes.json';
import hsk1l06lesson from '@/content/hsk1/lesson-06/lesson.json';
import hsk1l07lesson from '@/content/hsk1/lesson-07/lesson.json';
import hsk1l08lesson from '@/content/hsk1/lesson-08/lesson.json';
import hsk1l09lesson from '@/content/hsk1/lesson-09/lesson.json';
import hsk1l10lesson from '@/content/hsk1/lesson-10/lesson.json';
import hsk1l11lesson from '@/content/hsk1/lesson-11/lesson.json';
import hsk1l12lesson from '@/content/hsk1/lesson-12/lesson.json';
import hsk1l13lesson from '@/content/hsk1/lesson-13/lesson.json';
import hsk1l14lesson from '@/content/hsk1/lesson-14/lesson.json';
import hsk1l15lesson from '@/content/hsk1/lesson-15/lesson.json';

const REGISTRY = {
  'hsk1-l01': { lesson: hsk1l01lesson, vocabulary: hsk1l01vocabulary },
  'hsk1-l02': { lesson: hsk1l02lesson, vocabulary: hsk1l02vocabulary },
  'hsk1-l03': { lesson: hsk1l03lesson, vocabulary: hsk1l03vocabulary, notes: hsk1l03notes },
  'hsk1-l04': { lesson: hsk1l04lesson, vocabulary: hsk1l04vocabulary, notes: hsk1l04notes },
  'hsk1-l05': { lesson: hsk1l05lesson, vocabulary: hsk1l05vocabulary, notes: hsk1l05notes },
  'hsk1-l06': { lesson: hsk1l06lesson },
  'hsk1-l07': { lesson: hsk1l07lesson },
  'hsk1-l08': { lesson: hsk1l08lesson },
  'hsk1-l09': { lesson: hsk1l09lesson },
  'hsk1-l10': { lesson: hsk1l10lesson },
  'hsk1-l11': { lesson: hsk1l11lesson },
  'hsk1-l12': { lesson: hsk1l12lesson },
  'hsk1-l13': { lesson: hsk1l13lesson },
  'hsk1-l14': { lesson: hsk1l14lesson },
  'hsk1-l15': { lesson: hsk1l15lesson },
};

const SLUGS = [
  "hsk1-l01",
  "hsk1-l02",
  "hsk1-l03",
  "hsk1-l04",
  "hsk1-l05",
  "hsk1-l06",
  "hsk1-l07",
  "hsk1-l08",
  "hsk1-l09",
  "hsk1-l10",
  "hsk1-l11",
  "hsk1-l12",
  "hsk1-l13",
  "hsk1-l14",
  "hsk1-l15"
];

export const levels = levelsIndex.levels;

export const bundledLessons = SLUGS.map((slug) => assemble(slug, REGISTRY[slug])).filter(Boolean);

export const getBundledLesson = (slug) => bundledLessons.find((l) => l.slug === slug);
export const lessonsOfLevel = (level) => bundledLessons.filter((l) => l.level === level);
export const getLevel = (slug) => levels.find((l) => l.slug === slug);
