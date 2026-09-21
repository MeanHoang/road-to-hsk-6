// Sinh features/lesson/bundled.js từ content/.
//
// Viết tay 15 bài × 9 collection là 135 dòng import — sinh ra thì không bao giờ
// lệch với thư mục content. Chạy lại mỗi khi thêm bài: npm run gen
//
// Tương đương bundled.js viết tay của Road to TOEIC 900, nhưng TOEIC chỉ có 2
// buổi nên viết tay được; HSK có 136 bài nên phải sinh.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const levels = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/levels.json'), 'utf8')).levels;

const imports = [];
const registry = [];
const allSlugs = [];

for (const level of levels) {
  const indexPath = path.join(ROOT, 'content', level.slug, 'index.json');
  if (!fs.existsSync(indexPath)) continue;
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));

  for (const slug of index.lessons) {
    const pad = slug.split('-l')[1];
    const dir = `content/${level.slug}/lesson-${pad}`;
    const lessonFile = path.join(ROOT, dir, 'lesson.json');
    if (!fs.existsSync(lessonFile)) continue;

    const lesson = JSON.parse(fs.readFileSync(lessonFile, 'utf8'));
    const v = `${level.slug}l${pad}`;
    allSlugs.push(slug);

    imports.push(`import ${v}lesson from '@/${dir}/lesson.json';`);
    const present = [];
    for (const c of lesson.collections) {
      if (fs.existsSync(path.join(ROOT, dir, `${c}.json`))) {
        imports.push(`import ${v}${c} from '@/${dir}/${c}.json';`);
        present.push(c);
      }
    }
    const fields = present.map((c) => `, ${c}: ${v}${c}`).join('');
    registry.push(`  '${slug}': { lesson: ${v}lesson${fields} },`);
  }
}

const out = `// Bộ nội dung BUNDLE SẴN trong repo — nguồn dự phòng khi chưa cấu hình Firestore.
// SINH TỰ ĐỘNG bằng scripts/gen-bundled.mjs — đừng sửa tay.

import levelsIndex from '@/content/levels.json';
import { assemble } from './schema';

${imports.join('\n')}

const REGISTRY = {
${registry.join('\n')}
};

const SLUGS = ${JSON.stringify(allSlugs, null, 2)};

export const levels = levelsIndex.levels;

export const bundledLessons = SLUGS.map((slug) => assemble(slug, REGISTRY[slug])).filter(Boolean);

export const getBundledLesson = (slug) => bundledLessons.find((l) => l.slug === slug);
export const lessonsOfLevel = (level) => bundledLessons.filter((l) => l.level === level);
export const getLevel = (slug) => levels.find((l) => l.slug === slug);
`;

fs.writeFileSync(path.join(ROOT, 'features/lesson/bundled.js'), out);
console.log(`✓ bundled.js — ${allSlugs.length} bài, ${imports.length} import`);
