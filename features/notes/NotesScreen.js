'use client';

import Link from 'next/link';

// 注释 — chú thích ngữ pháp của một bài.
//
// Sách trình bày dạng bảng, cố tình "弱化语法" (giảm nhẹ ngữ pháp): mỗi điểm chỉ
// giải thích trong phạm vi cách dùng CỦA BÀI ĐÓ, không tổng quát hoá. Màn này
// giữ đúng tinh thần đó — không nhồi thêm lý thuyết ngoài sách, chỉ để link ra
// Chinese Grammar Wiki cho ai muốn đào sâu.

const WIKI = {
  1: 'https://resources.allsetlearning.com/chinese/grammar/A1_grammar_points',
  2: 'https://resources.allsetlearning.com/chinese/grammar/A2_grammar_points',
  3: 'https://resources.allsetlearning.com/chinese/grammar/A2_grammar_points',
  4: 'https://resources.allsetlearning.com/chinese/grammar/B1_grammar_points',
  5: 'https://resources.allsetlearning.com/chinese/grammar/B1_grammar_points',
  6: 'https://resources.allsetlearning.com/chinese/grammar/B2_grammar_points',
};

export function NotesScreen({ lesson }) {
  return (
    <>
      <header className="page-head">
        <Link className="back" href={`/lesson/${lesson.slug}`}>
          ← {lesson.titleZh}
        </Link>
        <p className="muted">注释 · Bài {lesson.no}</p>
        <h1>Chú thích ngữ pháp</h1>
        <p className="muted">{lesson.notes.length} điểm · trang {lesson.page} trong sách</p>
      </header>

      <ol className="note-list">
        {lesson.notes.map((n) => (
          <li key={n.id} className="note">
            <div className="note__head">
              <span className="note__no">{n.no}</span>
              <div>
                <p className="zh note__zh">{n.titleZh}</p>
                <p className="note__vi">{n.titleVi}</p>
              </div>
            </div>
            {n.pattern && <p className="note__pattern zh">{n.pattern}</p>}
            {n.examples.length > 0 && (
              <ul className="note__examples">
                {n.examples.map((ex, i) => (
                  <li key={i}>
                    <span className="zh">{ex.zh}</span>
                    <span className="pinyin">{ex.pinyin}</span>
                    <span className="vi">{ex.vi}</span>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>

      <p className="muted">
        Muốn đào sâu hơn sách:{' '}
        <a href={WIKI[lesson.level]} target="_blank" rel="noreferrer">
          Chinese Grammar Wiki
        </a>
        . 💭 Công thức trong ô là do app tóm lại, sách không in dạng công thức — đối chiếu lại khi
        đọc bài.
      </p>
    </>
  );
}
