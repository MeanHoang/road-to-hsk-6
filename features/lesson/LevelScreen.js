'use client';

import Link from 'next/link';
import { getLevel, lessonsOfLevel } from './bundled';

// Danh sách bài của một cấp. Cấp 4-6 chia 上/下 nên gom theo quyển.

export function LevelScreen({ slug }) {
  const level = getLevel(slug);
  if (!level) return <main className="page">Không có cấp này.</main>;

  const lessons = lessonsOfLevel(level.level);

  return (
    <main className="page">
      <header className="page-head">
        <Link className="back" href="/">
          ← Tất cả các cấp
        </Link>
        <h1>
          {level.title} <span className="muted">{level.book}</span>
        </h1>
        <p className="muted">
          {level.lessonCount} bài · {level.vocabCumulative} từ (lũy kế) · {level.classHours[0]}–
          {level.classHours[1]} tiết
        </p>
        <p className="focus">Trọng tâm: {level.grammarFocus}</p>
      </header>

      <ul className="tool-list">
        <li>
          <Link className="tool-card" href={`/level/${level.slug}/review`}>
            Ôn cả cấp ({lessons.reduce((n, l) => n + l.vocabulary.length, 0)} từ)
          </Link>
        </li>
        <li>
          <Link className="tool-card" href={`/level/${level.slug}/tones`}>
            Luyện thanh điệu cả cấp
          </Link>
        </li>
      </ul>

      {level.volumes.map((vol) => {
        const inVolume = lessons.filter((l) => l.volume === vol.id);
        return (
          <section key={vol.id} className="volume">
            {vol.label && <h2 className="volume__label">Quyển {vol.label}</h2>}
            {inVolume.length === 0 ? (
              <p className="muted">Chưa nhập nội dung cho quyển này.</p>
            ) : (
              <ol className="lesson-list">
                {inVolume.map((lesson) => (
                  <li key={lesson.slug}>
                    <Link className="lesson-row" href={`/lesson/${lesson.slug}`}>
                      <span className="lesson-row__no">{lesson.no}</span>
                      <span className="lesson-row__title">
                        <span className="zh">{lesson.titleZh}</span>
                        <span className="pinyin">{lesson.titlePinyin}</span>
                        <span className="vi">{lesson.titleVi}</span>
                      </span>
                      {lesson.hasCulture && <span className="tag">文化</span>}
                      {lesson.isPhoneticsIntro && <span className="tag tag--muted">ngữ âm</span>}
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </section>
        );
      })}
    </main>
  );
}
