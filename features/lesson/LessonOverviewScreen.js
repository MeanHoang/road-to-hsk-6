'use client';

import Link from 'next/link';
import { NavCard } from '@/shared/ui/molecules/NavCard';
import { PageHeader } from '@/shared/ui/molecules/PageHeader';
import { Callout } from '@/shared/ui/atoms/Callout';
import { lessonActivities } from './activities';

// Tổng quan một bài: 7 板块 của sách, rồi tới công cụ học.
//
// Phần nào chưa dựng màn vẫn hiện nhưng không bấm được — để thấy bài có gì mà
// app chưa làm tới, thay vì giấu đi và tưởng sách không có phần đó.

const TOOL_LEAD = { cards: '🗂', tones: '声', vocab: '词', listen: '听' };

const TOOL_META = {
  cards: (l) => `${l.vocabulary.length} từ · đọc · nghe · viết`,
  tones: () => 'nghe · nhìn chữ · biến điệu',
  vocab: (l) => `${l.vocabulary.length} từ · lọc theo thanh điệu`,
  listen: () => 'nghe rồi chọn chữ hoặc nghĩa',
};

function sectionMeta(key, lesson) {
  if (key === 'notes') return `${lesson.notes.length} điểm ngữ pháp`;
  if (key === 'hanzi') return 'thứ tự nét · viết thử';
  if (key === 'exercises') return 'sắp xếp câu · nhận diện điểm';
  return '';
}

export function LessonOverviewScreen({ lesson }) {
  const activities = lessonActivities(lesson);
  const sections = activities.filter((a) => a.zh);
  const tools = activities.filter((a) => !a.zh);
  const todo = sections.filter((a) => !a.built).length;

  return (
    <>
      <Link className="back" href={`/level/hsk${lesson.level}`}>
        ← HSK {lesson.level}
      </Link>

      <PageHeader
        eyebrow={`Bài ${lesson.no} · trang ${lesson.page}`}
        title={<span className="zh">{lesson.titleZh}</span>}
        subtitle={lesson.titlePinyin}
      >
        <p className="focus">{lesson.titleVi}</p>
      </PageHeader>

      {lesson.isPhoneticsIntro && (
        <Callout>
          Bài nhập môn ngữ âm — sách chưa đưa chủ đề và chú thích ngữ pháp, phần chính là thanh
          mẫu, vận mẫu và thanh điệu.
        </Callout>
      )}

      <section className="block">
        <h2 className="block__title">
          Các phần trong bài
          <span className="block__count">{sections.length} 板块</span>
        </h2>
        <div className="stack">
          {sections.map((a) => (
            <NavCard
              key={a.key}
              href={a.href}
              empty={!a.built}
              lead={<span className="zh">{a.zh}</span>}
              title={a.label}
              meta={a.built ? sectionMeta(a.key, lesson) : 'chưa dựng màn này'}
            />
          ))}
        </div>
      </section>

      {tools.length > 0 && (
        <section className="block">
          <h2 className="block__title">Công cụ học</h2>
          <div className="stack">
            {tools.map((a) => (
              <NavCard
                key={a.key}
                href={a.href}
                lead={<span className="zh">{TOOL_LEAD[a.key] ?? '·'}</span>}
                title={a.label}
                meta={TOOL_META[a.key]?.(lesson) ?? ''}
              />
            ))}
          </div>
        </section>
      )}

      {todo > 0 && (
        <p className="muted">
          {todo}/{sections.length} phần chưa dựng màn — cần nhập hội thoại, bài tập hoặc cắt ảnh từ
          sách.
        </p>
      )}
    </>
  );
}
