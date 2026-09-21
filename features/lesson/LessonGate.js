'use client';

import Link from 'next/link';
import { getBundledLesson } from './bundled';

/** Lấy bài theo slug, báo rõ khi chưa có nội dung thay vì crash. */
export function LessonGate({ slug, children }) {
  const lesson = getBundledLesson(slug);
  if (!lesson) {
    return (
      <main className="page">
        <Link className="back" href="/">
          ← Trang chủ
        </Link>
        <p className="notice">Chưa có nội dung cho bài “{slug}”.</p>
      </main>
    );
  }
  return children(lesson);
}
