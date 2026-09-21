'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { tonesOf, spokenTones, TONE_LABEL } from '@/shared/lib/pinyin';

// Bảng từ vựng — tương đương màn cùng tên bên TOEIC, nhưng cột IPA UK/US được
// thay bằng pinyin + thanh điệu, và lọc thêm được theo THANH.

function speak(text) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'zh-CN';
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export function VocabTableScreen({ lesson }) {
  const [q, setQ] = useState('');
  const [tone, setTone] = useState('all');

  const rows = useMemo(() => {
    return lesson.vocabulary.map((item) => {
      const written = tonesOf(item.pinyin);
      return { ...item, written, spoken: spokenTones(written) };
    });
  }, [lesson.vocabulary]);

  const shown = rows.filter((r) => {
    if (tone !== 'all' && !r.written.includes(Number(tone))) return false;
    if (!q.trim()) return true;
    const needle = q.trim().toLowerCase();
    return (
      r.word.includes(needle) ||
      r.pinyin.toLowerCase().includes(needle) ||
      r.meaningVi.toLowerCase().includes(needle)
    );
  });

  return (
    <main className="page">
      <header className="page-head">
        <Link className="back" href={`/lesson/${lesson.slug}`}>
          ← {lesson.titleZh}
        </Link>
        <h1>Bảng từ vựng</h1>
        <p className="muted">{lesson.vocabulary.length} từ</p>
      </header>

      <div className="filters">
        <input
          className="input"
          placeholder="Tìm chữ Hán, pinyin hoặc nghĩa…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="input" value={tone} onChange={(e) => setTone(e.target.value)}>
          <option value="all">Mọi thanh</option>
          {[1, 2, 3, 4, 0].map((t) => (
            <option key={t} value={t}>
              {TONE_LABEL[t]}
            </option>
          ))}
        </select>
      </div>

      <div className="table-scroll">
      <table className="vocab-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Chữ</th>
            <th>Pinyin</th>
            <th>Thanh</th>
            <th>Loại</th>
            <th>Nghĩa</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {shown.map((r) => {
            const changed = r.written.join() !== r.spoken.join();
            return (
              <tr key={r.id}>
                <td className="muted">{r.no}</td>
                <td className="zh">
                  {r.word}
                  {r.isOverSyllabus && <sup title="Từ vượt đại cương HSK">*</sup>}
                </td>
                <td className="pinyin">{r.pinyin}</td>
                <td>
                  <span className={`tones tone-${r.written[0]}`}>{r.written.join('-')}</span>
                  {changed && (
                    <span className="tones tones--spoken" title="Thanh khi ĐỌC (biến điệu)">
                      → {r.spoken.join('-')}
                    </span>
                  )}
                </td>
                <td className="muted">{r.pos}</td>
                <td>{r.meaningVi}</td>
                <td>
                  <button className="icon-btn" onClick={() => speak(r.word)} aria-label="Phát âm">
                    🔊
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>

      {shown.length === 0 && <p className="muted">Không có từ nào khớp.</p>}
    </main>
  );
}
