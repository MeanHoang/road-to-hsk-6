'use client';

import { NavCard } from '@/shared/ui/molecules/NavCard';
import { Callout } from '@/shared/ui/atoms/Callout';
import { levels, lessonsOfLevel } from './bundled';

// Màn chủ = danh sách 6 CẤP, không phải danh sách bài.
//
// Khác TOEIC: ở đó trang chủ liệt kê thẳng các buổi vì chỉ có vài buổi. HSK có
// 136 bài trải 6 cấp — liệt kê phẳng thì không dùng được, nên phải qua tầng cấp.
//
// Dùng nguyên hệ component của repo (.hero / .stat-row / NavCard / Callout).
// Trước đó màn này tự viết CSS phẳng riêng, kết quả là nhạt hơn hẳn phần còn
// lại của hệ — trong khi token và component đã có sẵn.

function Stat({ value, label }) {
  return (
    <div className="stat">
      <b>{value}</b>
      <span>{label}</span>
    </div>
  );
}

export function HomeScreen() {
  const ready = levels.map((l) => ({ level: l, lessons: lessonsOfLevel(l.level) }));
  const lessonsReady = ready.reduce((n, r) => n + r.lessons.length, 0);
  const wordsReady = ready.reduce(
    (n, r) => n + r.lessons.reduce((m, l) => m + l.vocabulary.length, 0),
    0,
  );

  return (
    <>
      <div className="hero">
        <h1>Road to HSK 6</h1>
        <p>Học theo bộ 标准教程 — 6 cấp, 18 quyển, mỗi bài đủ 7 板块</p>

        <div className="stat-row">
          <Stat value={levels.length} label="cấp" />
          <Stat value={lessonsReady} label="bài đã nhập" />
          <Stat value={wordsReady} label="từ vựng" />
        </div>
      </div>

      <div className="stack">
        {ready.map(({ level, lessons }) => {
          const has = lessons.length > 0;
          const words = lessons.reduce((n, l) => n + l.vocabulary.length, 0);
          return (
            <NavCard
              key={level.slug}
              href={has ? `/level/${level.slug}` : null}
              empty={!has}
              lead={String(level.level).padStart(2, '0')}
              leadBrand={has}
              title={
                <>
                  {level.title} <span className="zh-inline">{level.book}</span>
                </>
              }
              meta={
                has
                  ? `${lessons.length}/${level.lessonCount} bài · ${words} từ · ${level.grammarFocus}`
                  : `${level.lessonCount} bài · ${level.vocabCumulative} từ — chưa nhập nội dung`
              }
              percent={has ? Math.round((lessons.length / level.lessonCount) * 100) : null}
            />
          );
        })}
      </div>

      <Callout>
        Nội dung là file JSON tĩnh trong repo, tiến độ lưu ở máy bạn nên mất mạng vẫn học được.
        Từ vựng HSK lũy kế nên tiến độ khoá theo <strong>cấp</strong>, không theo từng bài.
      </Callout>
    </>
  );
}
