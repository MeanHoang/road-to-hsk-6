'use client';

import Link from 'next/link';
import { lessonActivities } from './activities';

export function LessonOverviewScreen({ lesson }) {
  const activities = lessonActivities(lesson);
  const sections = activities.filter((a) => a.zh);
  const tools = activities.filter((a) => !a.zh);

  return (
    <main className="page">
      <header className="page-head">
        <Link className="back" href={`/level/hsk${lesson.level}`}>
          ← HSK {lesson.level}
        </Link>
        <p className="muted">Bài {lesson.no}</p>
        <h1 className="zh zh--big">{lesson.titleZh}</h1>
        <p className="pinyin">{lesson.titlePinyin}</p>
        <p className="vi">{lesson.titleVi}</p>
        {lesson.page && <p className="muted">Trang {lesson.page} trong sách</p>}
      </header>

      <section>
        <h2>Các phần trong bài</h2>
        {lesson.isPhoneticsIntro && (
          <p className="notice">
            Bài nhập môn ngữ âm — chưa có chủ đề và chú thích ngữ pháp, tập trung vào thanh mẫu,
            vận mẫu, thanh điệu.
          </p>
        )}
        <ul className="section-list">
          {sections.map((a) => (
            <li key={a.key}>
              <Link className="section-card" href={a.href}>
                <span className="section-card__zh">{a.zh}</span>
                <span className="section-card__label">{a.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {tools.length > 0 && (
        <section>
          <h2>Công cụ học</h2>
          <ul className="tool-list">
            {tools.map((a) => (
              <li key={a.key}>
                <Link className="tool-card" href={a.href}>
                  {a.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
