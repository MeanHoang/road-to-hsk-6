'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useProgress } from '@/features/progress/useProgress';
import { review, GOOD, AGAIN } from '@/features/progress/srs';
import { useMounted } from '@/shared/lib/useMounted';

// Bài nghe.
//
// Sách có MP3 chính chủ, nhưng file đó KHÔNG nằm trong repo (bản quyền, xem
// README). Nên màn này dùng speechSynthesis của trình duyệt với lang zh-CN —
// chạy ngay, không tốn byte nào, và đủ để luyện nhận mặt âm.
//
// ⚠️ Giọng máy không thay được giọng bản xứ trong sách. Khi có file MP3 ở local
// thì ưu tiên nó; biến `audioSrc` để sẵn cho việc đó.

const MODES = [
  { key: 'char', label: 'Nghe → chọn chữ' },
  { key: 'meaning', label: 'Nghe → chọn nghĩa' },
];

function speak(text, rate = 0.9) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'zh-CN';
  u.rate = rate;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

function pickOptions(pool, answer, key) {
  const others = pool.filter((w) => w.id !== answer.id);
  const shuffled = [...others].sort(() => Math.random() - 0.5).slice(0, 3);
  return [answer, ...shuffled].sort(() => Math.random() - 0.5).map((w) => ({ id: w.id, text: w[key] }));
}

export function ListeningScreen({ level, words, backHref, title }) {
  const [mode, setMode] = useState('char');
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [slow, setSlow] = useState(false);
  const { update, today, ready } = useProgress(level.slug);
  const mounted = useMounted();

  const pool = useMemo(() => words.filter((w) => w.pos !== 'tên riêng'), [words]);
  const item = pool[i % Math.max(pool.length, 1)];
  const key = mode === 'char' ? 'word' : 'meaningVi';
  const options = useMemo(
    () => (item && mounted ? pickOptions(pool, item, key) : []),
    [item, pool, key, mounted],
  );

  useEffect(() => {
    setPicked(null);
    if (item) speak(item.word, slow ? 0.6 : 0.9);
  }, [i, item, slow]);

  const answer = useCallback(
    (opt) => {
      if (picked) return;
      setPicked(opt);
      const ok = opt.id === item.id;
      update('vocab', item.id, {
        listen: review(null, ok ? GOOD : AGAIN, today),
        firstSeenIn: item.lessonSlug || null,
      });
    },
    [picked, item, update, today],
  );

  if (!ready || !mounted) return <main className="page"><p className="muted">Đang tải…</p></main>;
  if (!item) {
    return (
      <main className="page">
        <Link className="back" href={backHref}>← {title}</Link>
        <p className="notice">Bài này chưa có từ vựng để luyện nghe.</p>
      </main>
    );
  }

  return (
    <main className="page">
      <header className="page-head">
        <Link className="back" href={backHref}>← {title}</Link>
        <h1>Luyện nghe</h1>
        <p className="muted">{pool.length} từ trong phạm vi này</p>
      </header>

      <div className="mode-row">
        {MODES.map((m) => (
          <button
            key={m.key}
            className={`mode-btn ${mode === m.key ? 'is-on' : ''}`}
            onClick={() => { setMode(m.key); setPicked(null); }}
          >
            {m.label}
          </button>
        ))}
        <button className={`mode-btn ${slow ? 'is-on' : ''}`} onClick={() => setSlow(!slow)}>
          {slow ? 'Chậm 0.6×' : 'Thường 0.9×'}
        </button>
      </div>

      <section className="tone-card">
        <button className="big-speak" onClick={() => speak(item.word, slow ? 0.6 : 0.9)} aria-label="Nghe lại">
          🔊
        </button>
        {picked && (
          <div className="reveal">
            <p className="zh zh--big">{item.word}</p>
            <p className="pinyin">{item.pinyin}</p>
            <p className="vi">{item.meaningVi}</p>
          </div>
        )}
      </section>

      <ul className="opt-list">
        {options.map((opt) => {
          const state = !picked
            ? ''
            : opt.id === item.id
              ? 'is-right'
              : opt.id === picked.id
                ? 'is-wrong'
                : '';
          return (
            <li key={opt.id}>
              <button className={`opt ${state}`} onClick={() => answer(opt)} disabled={!!picked}>
                <span className={mode === 'char' ? 'zh opt__tones' : 'opt__tones'}>{opt.text}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {picked && <button className="next-btn" onClick={() => setI(i + 1)}>Câu tiếp →</button>}

      <p className="muted">
        💭 Giọng đọc là giọng tổng hợp của trình duyệt, không phải giọng bản xứ trong đĩa MP3 kèm
        sách. Dùng để nhận mặt âm, không dùng để chuẩn hoá phát âm.
      </p>
    </main>
  );
}
