'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useProgress } from '@/features/progress/useProgress';

// 汉字 — xem thứ tự nét và viết thử.
//
// Đây là phần app hơn sách rõ nhất: sách in hình tĩnh, không nói được bạn viết
// sai nét thứ mấy. hanzi-writer chấm từng nét một.
//
// Phạm vi bám sách: cấp 1 chỉ YÊU CẦU VIẾT 17 nét cơ bản và 52 chữ độc thể, còn
// lại chỉ nhận mặt chữ. Nên mặc định lọc chữ đơn — không bắt viết 漂亮 ở bài 14.

function uniqueChars(words) {
  const seen = new Map();
  for (const w of words) {
    for (const ch of w.word) {
      if (/[一-鿿]/.test(ch) && !seen.has(ch)) {
        seen.set(ch, { char: ch, from: w });
      }
    }
  }
  return [...seen.values()];
}

export function WritingScreen({ level, words, backHref, title }) {
  const [onlySingle, setOnlySingle] = useState(true);
  const [i, setI] = useState(0);
  const [mode, setMode] = useState('watch');
  const [result, setResult] = useState(null);
  const boxRef = useRef(null);
  const writerRef = useRef(null);
  const { update, ready } = useProgress(level.slug);

  const chars = useMemo(() => {
    const all = uniqueChars(words);
    if (!onlySingle) return all;
    // chữ đứng một mình làm thành một từ — đây là tập gần nhất với "chữ độc thể"
    return all.filter((c) => words.some((w) => w.word === c.char));
  }, [words, onlySingle]);

  const current = chars[i % Math.max(chars.length, 1)];

  useEffect(() => {
    let cancelled = false;
    if (!current || !boxRef.current) return undefined;
    boxRef.current.innerHTML = '';
    setResult(null);

    import('hanzi-writer').then(({ default: HanziWriter }) => {
      if (cancelled || !boxRef.current) return;
      const writer = HanziWriter.create(boxRef.current, current.char, {
        width: 240,
        height: 240,
        padding: 8,
        showOutline: true,
        strokeAnimationSpeed: 1,
        delayBetweenStrokes: 180,
      });
      writerRef.current = writer;
      if (mode === 'watch') writer.animateCharacter();
      else {
        writer.quiz({
          onComplete({ totalMistakes }) {
            setResult(totalMistakes);
            update('hanzi', current.char, { strokesOk: totalMistakes === 0, mistakes: totalMistakes });
          },
        });
      }
    });

    return () => {
      cancelled = true;
      writerRef.current = null;
    };
  }, [current, mode, update]);

  if (!ready) return <><p className="muted">Đang tải…</p></>;

  if (chars.length === 0) {
    return (
      <>
        <Link className="back" href={backHref}>← {title}</Link>
        <p className="notice">Bài này không có chữ đơn nào để luyện viết.</p>
      </>
    );
  }

  return (
    <>
      <header className="page-head">
        <Link className="back" href={backHref}>← {title}</Link>
        <h1>Luyện viết chữ Hán</h1>
        <p className="muted">
          {i + 1}/{chars.length} · {onlySingle ? 'chỉ chữ đơn' : 'mọi chữ trong bài'}
        </p>
      </header>

      <div className="mode-row">
        <button className={`mode-btn ${mode === 'watch' ? 'is-on' : ''}`} onClick={() => setMode('watch')}>
          Xem thứ tự nét
        </button>
        <button className={`mode-btn ${mode === 'quiz' ? 'is-on' : ''}`} onClick={() => setMode('quiz')}>
          Viết thử
        </button>
        <button className="mode-btn" onClick={() => { setOnlySingle(!onlySingle); setI(0); }}>
          {onlySingle ? 'Hiện mọi chữ' : 'Chỉ chữ đơn'}
        </button>
      </div>

      <section className="write-card">
        <div ref={boxRef} className="write-box" />
        <p className="pinyin">{current.from.pinyin}</p>
        <p className="vi">{current.from.meaningVi}</p>

        {mode === 'watch' && (
          <button className="next-btn" onClick={() => writerRef.current?.animateCharacter()}>
            Xem lại
          </button>
        )}

        {result !== null && (
          <p className={`notice ${result === 0 ? 'is-ok' : ''}`}>
            {result === 0 ? 'Đúng hết nét.' : `Sai ${result} nét — bấm "Viết thử" để làm lại.`}
          </p>
        )}
      </section>

      <button className="next-btn" onClick={() => setI(i + 1)}>Chữ tiếp →</button>

      <p className="muted">
        💭 Sách cấp 1 chỉ bắt <strong>viết được</strong> 17 nét cơ bản và 52 chữ độc thể; các chữ
        khác chỉ cần nhận mặt. Dữ liệu nét lấy từ hanzi-writer (MIT).
      </p>
    </>
  );
}
