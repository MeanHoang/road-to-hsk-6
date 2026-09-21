'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { buildRound } from './buildRound';
import { useProgress } from '@/features/progress/useProgress';
import { useMounted } from '@/shared/lib/useMounted';

// 练习 — bài tập ngữ pháp.
//
// Hai dạng, cả hai dùng câu THẬT trong sách:
//   order — sắp xếp câu, đúng dạng đề thi HSK
//   match — câu này minh hoạ điểm 注释 nào

export function ExercisesScreen({ level, lessons, vocab, backHref, title }) {
  const [round, setRound] = useState(0);
  const [i, setI] = useState(0);
  const [built, setBuilt] = useState([]);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState({ right: 0, wrong: 0 });
  const { update, ready } = useProgress(level.slug);
  const mounted = useMounted();

  // Xáo đề chỉ chạy ở trình duyệt — xem shared/lib/useMounted.js
  const questions = useMemo(
    () => (mounted ? buildRound(lessons, vocab, 10) : []),
    [mounted, lessons, vocab, round],
  );
  const q = questions[i];

  function check() {
    setChecked(true);
    const ok = q.kind === 'order' ? built.join('') === q.answer.join('') : built[0] === q.answerId;
    setScore((s) => ({ right: s.right + (ok ? 1 : 0), wrong: s.wrong + (ok ? 0 : 1) }));
    update('exercises', q.id, { correct: ok, kind: q.kind });
  }

  function next() {
    setChecked(false);
    setBuilt([]);
    setI(i + 1);
  }

  function restart() {
    setRound(round + 1);
    setI(0);
    setBuilt([]);
    setChecked(false);
    setScore({ right: 0, wrong: 0 });
  }

  if (!ready || !mounted) return <main className="page"><p className="muted">Đang tải…</p></main>;

  if (questions.length === 0) {
    return (
      <main className="page">
        <Link className="back" href={backHref}>← {title}</Link>
        <p className="notice">
          Chưa đủ dữ liệu để sinh bài tập — cần bài có tiêu đề và chú thích ngữ pháp.
        </p>
      </main>
    );
  }

  if (!q) {
    return (
      <main className="page">
        <header className="page-head">
          <Link className="back" href={backHref}>← {title}</Link>
          <h1>Xong vòng này</h1>
          <p className="muted">
            Đúng {score.right}/{score.right + score.wrong}
          </p>
        </header>
        <button className="next-btn" onClick={restart}>Làm vòng mới →</button>
      </main>
    );
  }

  const ok = checked && (q.kind === 'order' ? built.join('') === q.answer.join('') : built[0] === q.answerId);

  return (
    <main className="page">
      <header className="page-head">
        <Link className="back" href={backHref}>← {title}</Link>
        <h1>Bài tập ngữ pháp</h1>
        <p className="muted">
          Câu {i + 1}/{questions.length} · đúng {score.right} · bài {q.lessonNo}
        </p>
      </header>

      {q.kind === 'order' ? (
        <>
          <p className="ex-prompt">Sắp xếp thành câu đúng: “{q.prompt}”</p>

          <div className="ex-slot">
            {built.length === 0 ? (
              <span className="muted">Bấm các ô bên dưới theo thứ tự</span>
            ) : (
              built.map((t, n) => (
                <button
                  key={`${t}-${n}`}
                  className="chip zh"
                  onClick={() => !checked && setBuilt(built.filter((_, k) => k !== n))}
                >
                  {t}
                </button>
              ))
            )}
          </div>

          <div className="ex-pool">
            {q.pool.map((t, n) => {
              const usedCount = built.filter((b) => b === t).length;
              const poolCount = q.pool.filter((b) => b === t).length;
              const exhausted = usedCount >= poolCount;
              return (
                <button
                  key={`${t}-${n}`}
                  className="chip zh"
                  disabled={checked || exhausted}
                  onClick={() => setBuilt([...built, t])}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <p className="ex-prompt">Câu này minh hoạ điểm ngữ pháp nào?</p>
          <p className="zh zh--big">{q.sentence}</p>
          <p className="pinyin">{q.pinyin}</p>
          <p className="vi">{q.vi}</p>

          <ul className="opt-list">
            {q.options.map((o) => {
              const state = !checked
                ? built[0] === o.id ? 'is-picked' : ''
                : o.id === q.answerId ? 'is-right' : built[0] === o.id ? 'is-wrong' : '';
              return (
                <li key={o.id}>
                  <button className={`opt ${state}`} disabled={checked} onClick={() => setBuilt([o.id])}>
                    <span className="zh">{o.titleZh}</span>
                    <span className="opt__label">{o.titleVi}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {checked && (
        <p className={`notice ${ok ? 'is-ok' : ''}`}>
          {ok ? 'Đúng.' : 'Chưa đúng.'} Đáp án:{' '}
          <strong className="zh">{q.kind === 'order' ? q.answer.join('') : q.options.find((o) => o.id === q.answerId).titleZh}</strong>
          {q.kind === 'order' && <span className="pinyin"> · {q.pinyin}</span>}
        </p>
      )}

      {!checked ? (
        <button className="next-btn" disabled={built.length === 0} onClick={check}>
          Kiểm tra
        </button>
      ) : (
        <button className="next-btn" onClick={next}>Câu tiếp →</button>
      )}
    </main>
  );
}
