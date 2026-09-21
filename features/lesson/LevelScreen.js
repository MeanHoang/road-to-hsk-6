'use client';

import Link from 'next/link';
import { NavCard } from '@/shared/ui/molecules/NavCard';
import { PageHeader } from '@/shared/ui/molecules/PageHeader';
import { getLevel, lessonsOfLevel } from './bundled';

// Danh sách bài của một cấp. Cấp 4-6 chia 上/下 nên gom theo quyển.
//
// Hai khối rất khác nhau: công cụ ôn cả cấp, và danh sách bài. Trước đó cả hai
// không có tiêu đề và dính sát nhau (đo được khoảng cách bằng 0), nên nhìn như
// danh sách bài tràn vào hàng nút.

const TOOLS = [
  { path: 'review', lead: '🗂', title: 'Thẻ từ vựng', meta: 'đọc · nghe · viết — ba lịch riêng' },
  { path: 'tones', lead: '声', title: 'Luyện thanh điệu', meta: 'nghe · nhìn chữ · biến điệu' },
  { path: 'exercises', lead: '练', title: 'Bài tập ngữ pháp', meta: 'sắp xếp câu · nhận diện điểm' },
];

function Stat({ value, label }) {
  return (
    <div className="stat">
      <b>{value}</b>
      <span>{label}</span>
    </div>
  );
}

export function LevelScreen({ slug }) {
  const level = getLevel(slug);
  if (!level) return <p className="muted">Không có cấp này.</p>;

  const lessons = lessonsOfLevel(level.level);
  const totalWords = lessons.reduce((n, l) => n + l.vocabulary.length, 0);
  const totalNotes = lessons.reduce((n, l) => n + l.notes.length, 0);

  return (
    <>
      <Link className="back" href="/">
        ← Tất cả các cấp
      </Link>

      <PageHeader
        eyebrow={level.book}
        title={level.title}
        subtitle={`${level.lessonCount} bài · ${level.vocabCumulative} từ (lũy kế) · ${level.classHours[0]}–${level.classHours[1]} tiết`}
      >
        <p className="focus">Trọng tâm: {level.grammarFocus}</p>
        <div className="stat-row stat-row--left">
          <Stat value={`${lessons.length}/${level.lessonCount}`} label="bài đã nhập" />
          <Stat value={totalWords} label="từ vựng" />
          <Stat value={totalNotes} label="điểm ngữ pháp" />
        </div>
      </PageHeader>

      {lessons.length > 0 && (
        <section className="block">
          <h2 className="block__title">Ôn cả cấp</h2>
          <p className="block__hint">
            Từ vựng HSK lũy kế — từ học ở bài 3 vẫn phải quay lại khi bạn đang học bài 12.
          </p>
          <div className="stack">
            {TOOLS.map((t) => (
              <NavCard
                key={t.path}
                href={`/level/${level.slug}/${t.path}`}
                lead={<span className="zh">{t.lead}</span>}
                title={t.title}
                meta={t.path === 'review' ? `${totalWords} từ · ${t.meta}` : t.meta}
              />
            ))}
          </div>
        </section>
      )}

      <section className="block">
        <h2 className="block__title">
          Danh sách bài
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
                <div className="stack">
                  {inVolume.map((lesson) => (
                    <NavCard
                      key={lesson.slug}
                      href={`/lesson/${lesson.slug}`}
                      lead={String(lesson.no).padStart(2, '0')}
                      leadBrand
                      title={<span className="zh lesson-title">{lesson.titleZh}</span>}
                      meta={
                        <>
                          <span className="pinyin">{lesson.titlePinyin}</span>
                          <span className="lesson-vi"> · {lesson.titleVi}</span>
                        </>
                      }
                      trailing={
                        <span className="lesson-tags">
                          {lesson.isPhoneticsIntro && <span className="badge">ngữ âm</span>}
                          {lesson.hasCulture && <span className="badge badge-accent zh">文化</span>}
                          <span className="lesson-count">{lesson.vocabulary.length} từ</span>
                          <span className="chevron" aria-hidden="true">›</span>
                        </span>
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </section>
    </>
  );
}
