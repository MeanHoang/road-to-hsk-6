'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { tonesOf } from '@/shared/lib/pinyin';
import { useProgress } from '@/features/progress/useProgress';
import { review, buildQueue, GOOD, AGAIN, HARD, EASY } from '@/features/progress/srs';

// Thẻ từ vựng BA chế độ, không phải hai mặt.
//
// Thẻ tiếng Anh có 2 thông tin (từ ↔ nghĩa). Tiếng Trung có 3 — chữ, âm, nghĩa
// — và ba kỹ năng tách rời nhau: đọc được 谢谢 không có nghĩa là viết được nó.
// Nên mỗi chế độ có LỊCH SRS RIÊNG; gộp một cờ `known` là tự lừa mình.

const MODES = [
  { key: 'read', label: 'Đọc', front: 'Nhìn chữ Hán, nhớ âm và nghĩa' },
  { key: 'listen', label: 'Nghe', front: 'Chỉ nghe, không nhìn chữ' },
  { key: 'write', label: 'Viết', front: 'Nhìn nghĩa, nhớ mặt chữ' },
];

const GRADES = [
  { q: AGAIN, label: 'Quên', cls: 'is-again' },
  { q: HARD, label: 'Khó', cls: 'is-hard' },
  { q: GOOD, label: 'Được', cls: 'is-good' },
  { q: EASY, label: 'Dễ', cls: 'is-easy' },
];

function speak(text) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'zh-CN';
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export function CardsScreen({ level, words, backHref, title }) {
  const [mode, setMode] = useState('read');
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(0);
  const { data, update, today, ready } = useProgress(level.slug);

  const queue = useMemo(() => {
    if (!ready) return [];
    const entries = words.map((w) => ({
      word: w,
      card: data?.vocab?.[w.id]?.[mode] || null,
    }));
    return buildQueue(entries, today, 20);
  }, [ready, data, words, mode, today]);

  const current = queue[0];

  function grade(q) {
    const prev = data?.vocab?.[current.word.id] || {};
    const next = review(prev[mode], q, today);
    update('vocab', current.word.id, {
      ...prev,
      [mode]: next,
      firstSeenIn: prev.firstSeenIn || current.word.lessonSlug || null,
    });
    setFlipped(false);
    setDone(done + 1);
  }

  if (!ready) return <main className="page"><p className="muted">Đang tải…</p></main>;

  return (
    <main className="page">
      <header className="page-head">
        <Link className="back" href={backHref}>← {title}</Link>
        <h1>Thẻ từ vựng</h1>
        <p className="muted">
          {queue.length > 0 ? `Còn ${queue.length} thẻ đến hạn` : 'Hết thẻ đến hạn'} · đã ôn {done}
        </p>
      </header>

      <div className="mode-row">
        {MODES.map((m) => (
          <button
            key={m.key}
            className={`mode-btn ${mode === m.key ? 'is-on' : ''}`}
            onClick={() => { setMode(m.key); setFlipped(false); }}
          >
            {m.label}
          </button>
        ))}
      </div>
      <p className="muted">{MODES.find((m) => m.key === mode).front}</p>

      {!current ? (
        <p className="notice">
          Không còn thẻ nào đến hạn ở chế độ <strong>{MODES.find((m) => m.key === mode).label}</strong>.
          Quay lại sau, hoặc đổi chế độ — ba chế độ có lịch riêng.
        </p>
      ) : (
        <>
          <button className="flashcard" onClick={() => setFlipped(!flipped)}>
            {!flipped ? (
              <div className="flashcard__front">
                {mode === 'read' && <p className="zh zh--big">{current.word.word}</p>}
                {mode === 'listen' && (
                  <span
                    className="big-speak"
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); speak(current.word.word); }}
                  >
                    🔊
                  </span>
                )}
                {mode === 'write' && <p className="vi vi--big">{current.word.meaningVi}</p>}
                <p className="muted">bấm để lật</p>
              </div>
            ) : (
              <div className="flashcard__back">
                <p className="zh zh--big">{current.word.word}</p>
                <p className="pinyin">
                  {current.word.pinyin}
                  <span className={`tones tone-${tonesOf(current.word.pinyin)[0]}`}>
                    {tonesOf(current.word.pinyin).join('-')}
                  </span>
                </p>
                <p className="muted">{current.word.pos}</p>
                <p className="vi">{current.word.meaningVi}</p>
                <span
                  className="icon-btn"
                  role="button"
                  tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); speak(current.word.word); }}
                >
                  🔊
                </span>
              </div>
            )}
          </button>

          {flipped && (
            <ul className="grade-row">
              {GRADES.map((g) => (
                <li key={g.q}>
                  <button className={`grade ${g.cls}`} onClick={() => grade(g.q)}>
                    {g.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  );
}
