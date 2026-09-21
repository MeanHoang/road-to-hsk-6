'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { tonesOf, spokenTones, TONE_LABEL } from '@/shared/lib/pinyin';
import { useProgress } from '@/features/progress/useProgress';
import { ToneCurve } from './ToneCurve';
import { useMounted } from '@/shared/lib/useMounted';

// Ba dạng bài, đúng hai kỹ năng mà người tự học thiếu nhất:
//
//   listen — nghe rồi chọn thanh. Kỹ năng KHÔNG có cách nào luyện từ sách giấy.
//   read   — nhìn chữ rồi chọn thanh. Luyện gắn thanh vào mặt chữ.
//   sandhi — biến điệu. Sách giải thích bằng một dòng lý thuyết rồi thôi; ở đây
//            thành bài tập vô hạn vì đáp án TÍNH ĐƯỢC, không phải nhập tay.

const MODES = [
  { key: 'listen', label: 'Nghe → chọn thanh', hint: 'Bấm loa, nghe rồi chọn' },
  { key: 'read', label: 'Nhìn chữ → chọn thanh', hint: 'Không nghe, tự nhớ' },
  { key: 'sandhi', label: 'Biến điệu', hint: 'Viết là một thanh, đọc là thanh khác' },
];

function speak(text) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'zh-CN';
  u.rate = 0.85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

/** Câu trả lời sai nhưng hợp lý: lệch đúng một thanh ở một âm tiết. */
function distractors(correct, count = 3) {
  const out = new Set();
  let guard = 0;
  while (out.size < count && guard < 60) {
    guard += 1;
    const i = Math.floor(Math.random() * correct.length);
    const delta = [1, 2, 3, 4, 0][Math.floor(Math.random() * 5)];
    const alt = [...correct];
    alt[i] = delta;
    const key = alt.join('-');
    if (key !== correct.join('-')) out.add(key);
  }
  return [...out];
}

export function ToneTrainerScreen({ level, words, backHref, title }) {
  const [mode, setMode] = useState('listen');
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const { update, today } = useProgress(level.slug);
  const mounted = useMounted();

  // Bài biến điệu chỉ có nghĩa với từ THẬT SỰ đổi thanh khi đọc.
  //
  // Vấn đề: trong một cấp, số TỪ ĐƠN LẺ bị biến điệu rất ít — cấp 1 chỉ có 小姐
  // và 水果. Không đủ để thành bài tập.
  //
  // Cách sách dạy chính là ghép: 你 + 好 → 你好. Nên khi pool tự nhiên quá mỏng,
  // sinh thêm CẶP từ hai từ thanh 3 trong chính vốn từ đã học. Cặp sinh ra luôn
  // đúng luật (3+3 → 2+3) và là cụm người học đọc ra miệng hằng ngày.
  const pool = useMemo(() => {
    const all = words.map((w) => {
      const written = tonesOf(w.pinyin);
      return { ...w, written, spoken: spokenTones(written) };
    });
    if (mode !== 'sandhi') return all;

    const natural = all.filter((w) => w.written.join() !== w.spoken.join());

    const thirdTone = all.filter(
      (w) => w.written.length === 1 && w.written[0] === 3 && w.pos !== 'tên riêng',
    );
    const pairs = [];
    for (let a = 0; a < thirdTone.length; a += 1) {
      for (let b = 0; b < thirdTone.length; b += 1) {
        if (a === b) continue;
        const x = thirdTone[a];
        const y = thirdTone[b];
        pairs.push({
          id: `pair-${x.id}-${y.id}`,
          word: x.word + y.word,
          pinyin: `${x.pinyin} ${y.pinyin}`,
          meaningVi: `${x.meaningVi} + ${y.meaningVi}`,
          pos: 'cặp ghép',
          written: [3, 3],
          spoken: [2, 3],
        });
      }
    }
    return [...natural, ...pairs];
  }, [words, mode]);

  const item = pool[i % Math.max(pool.length, 1)];

  const correct = useMemo(() => {
    if (!item) return [];
    return mode === 'sandhi' ? item.spoken : item.written;
  }, [item, mode]);

  const options = useMemo(() => {
    if (!item || !mounted) return [];
    const right = correct.join('-');
    return [right, ...distractors(correct)].sort(() => Math.random() - 0.5);
  }, [item, correct, mounted]);

  useEffect(() => {
    setPicked(null);
    if (mode === 'listen' && item) speak(item.word);
  }, [i, mode, item]);

  const answer = useCallback(
    (opt) => {
      if (picked) return;
      setPicked(opt);
      const ok = opt === correct.join('-');
      update('tones', item.id, {
        right: ok ? 1 : 0,
        wrong: ok ? 0 : 1,
        lastMode: mode,
        at: today,
      });
    },
    [picked, correct, item, mode, update, today],
  );

  if (pool.length === 0) {
    return (
      <>
        <Link className="back" href={backHref}>← {title}</Link>
        <p className="notice">
          Không có từ nào biến điệu trong phạm vi này — chọn dạng bài khác, hoặc mở ở phạm vi cả cấp.
        </p>
      </>
    );
  }

  const right = correct.join('-');

  return (
    <>
      <header className="page-head">
        <Link className="back" href={backHref}>← {title}</Link>
        <h1>Luyện thanh điệu</h1>
        <p className="muted">{pool.length} từ trong phạm vi này</p>
      </header>

      <div className="mode-row">
        {MODES.map((m) => (
          <button
            key={m.key}
            className={`mode-btn ${mode === m.key ? 'is-on' : ''}`}
            onClick={() => { setMode(m.key); setI(0); }}
          >
            {m.label}
          </button>
        ))}
      </div>
      <p className="muted">{MODES.find((m) => m.key === mode).hint}</p>

      <section className="tone-card">
        {mode === 'listen' ? (
          <button className="big-speak" onClick={() => speak(item.word)} aria-label="Nghe lại">
            🔊
          </button>
        ) : (
          <p className="zh zh--big">{item.word}</p>
        )}

        {mode === 'sandhi' && (
          <p className="muted">
            Viết là <strong>{item.written.join('-')}</strong> — khi đọc thành thanh gì?
          </p>
        )}

        {picked && (
          <div className="reveal">
            <p className="zh">{item.word}</p>
            <p className="pinyin">{item.pinyin}</p>
            <p className="vi">{item.meaningVi}</p>
            <ToneCurve tones={correct} />
            {mode === 'sandhi' && (
              <p className="muted">
                {item.written.join('-')} → <strong>{right}</strong> · hai thanh 3 liền nhau thì thanh
                3 đầu đọc thành thanh 2
              </p>
            )}
          </div>
        )}
      </section>

      <ul className="opt-list">
        {options.map((opt) => {
          const state = !picked ? '' : opt === right ? 'is-right' : opt === picked ? 'is-wrong' : '';
          return (
            <li key={opt}>
              <button className={`opt ${state}`} onClick={() => answer(opt)} disabled={!!picked}>
                <span className="opt__tones">{opt}</span>
                <span className="opt__label">
                  {opt.split('-').map((t) => TONE_LABEL[Number(t)].split(' — ')[0]).join(' · ')}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {picked && (
        <button className="next-btn" onClick={() => setI(i + 1)}>
          Câu tiếp →
        </button>
      )}
    </>
  );
}
