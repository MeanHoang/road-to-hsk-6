'use client';

import Link from 'next/link';
import { getLevel, lessonsOfLevel } from './bundled';

// Danh sách bài của một cấp. Cấp 4-6 chia 上/下 nên gom theo quyển.
//
// Trang có hai khối rất khác nhau — công cụ ôn cả cấp, và danh sách bài. Trước
// đó hai khối không có tiêu đề và dính sát nhau (đo được khoảng cách bằng 0),
// nên nhìn như danh sách bài bị tràn vào hàng nút. Mỗi khối giờ là một <section>
// có tiêu đề riêng.

export function LevelScreen({ slug }) {
  const level = getLevel(slug);
  if (!level) return <main className="page">Không có cấp này.</main>;

  const lessons = lessonsOfLevel(level.level);
  const totalWords = lessons.reduce((n, l) => n + l.vocabulary.length, 0);

  return (
    <main className="page">
      <header className="page-head">
        <Link className="back" href="/">
          ← Tất cả các cấp
        </Link>
        <h1>
          {level.title} <span className="page-head__zh">{level.book}</span>
        </h1>
        <p className="muted">
          {level.lessonCount} bài · {level.vocabCumulative} từ (lũy kế) · {level.classHours[0]}–
          {level.classHours[1]} tiết
        </p>
        <p className="focus">Trọng tâm: {level.grammarFocus}</p>
      </header>

      {lessons.length > 0 && (
        <section className="block">
          <h2 className="block__title">Ôn cả cấp</h2>
          <p className="block__hint">
            Từ vựng HSK lũy kế — từ học ở bài 3 vẫn phải quay lại khi bạn đang học bài 12.
          </p>
          <ul className="tool-list">
            <li>
              <Link className="tool-card" href={`/level/${level.slug}/review`}>
                <span className="tool-card__label">Thẻ từ vựng</span>
                <span className="tool-card__meta">{totalWords} từ · đọc · nghe · viết</span>
              </Link>
            </li>
            <li>
              <Link className="tool-card" href={`/level/${level.slug}/tones`}>
                <span className="tool-card__label">Luyện thanh điệu</span>
                <span className="tool-card__meta">nghe · nhìn chữ · biến điệu</span>
              </Link>
            </li>
            <li>
              <Link className="tool-card" href={`/level/${level.slug}/exercises`}>
                <span className="tool-card__label">Bài tập ngữ pháp</span>
                <span className="tool-card__meta">sắp xếp câu · nhận diện</span>
              </Link>
            </li>
          </ul>
        </section>
      )}

      <section className="block">
        <h2 className="block__title">
          Danh sách bài{' '}
          <span className="block__count">
            {lessons.length}/{level.lessonCount}
          </span>
        </h2>

        {level.volumes.map((vol) => {
          const inVolume = lessons.filter((l) => l.volume === vol.id);
          return (
            <div key={vol.id} className="volume">
              {vol.label && <h3 className="volume__label">Quyển {vol.label}</h3>}
              {inVolume.length === 0 ? (
                <p className="muted">Chưa nhập nội dung cho quyển này.</p>
              ) : (
                <ol className="lesson-list">
                  {inVolume.map((lesson) => (
                    <li key={lesson.slug}>
                      <Link className="lesson-row" href={`/lesson/${lesson.slug}`}>
                        <span className="lesson-row__no">{lesson.no}</span>
                        <span className="lesson-row__title">
                          <span className="zh lesson-row__zh">{lesson.titleZh}</span>
                          <span className="pinyin">{lesson.titlePinyin}</span>
                          <span className="vi">{lesson.titleVi}</span>
                        </span>
                        <span className="lesson-row__meta">
                          {lesson.isPhoneticsIntro && (
                            <span className="tag tag--muted">ngữ âm</span>
                          )}
                          {lesson.hasCulture && <span className="tag">文化</span>}
                          <span className="lesson-row__count">{lesson.vocabulary.length} từ</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          );
        })}
      </section>
    </main>
  );
}
