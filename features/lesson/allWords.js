// Gom từ vựng của cả một CẤP, gắn kèm bài nó xuất hiện lần đầu.
//
// Cần vì SRS và Tone Trainer chạy ở phạm vi cấp, không phải bài — từ vựng HSK
// lũy kế nên ôn phải xuyên bài.

import { lessonsOfLevel } from './bundled';

export function wordsOfLevel(level) {
  const out = [];
  for (const lesson of lessonsOfLevel(level)) {
    for (const w of lesson.vocabulary) {
      out.push({ ...w, lessonSlug: lesson.slug, lessonNo: lesson.no });
    }
  }
  return out;
}
