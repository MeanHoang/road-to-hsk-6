'use client';

import Link from 'next/link';
import { levels, lessonsOfLevel } from './bundled';

// Màn chủ = danh sách 6 CẤP, không phải danh sách bài.
//
// Khác TOEIC: ở đó trang chủ liệt kê thẳng các buổi vì chỉ có vài buổi. HSK có
// 136 bài trải 6 cấp — liệt kê phẳng thì không dùng được, nên phải qua tầng cấp.

export function HomeScreen() {
  return (
    <main className="page">
      <header className="page-head">
        <h1>Road to HSK 6</h1>
        <p className="muted">
          Bộ 标准教程 · 6 cấp · 18 quyển. Học theo sách, mỗi bài đủ 7 板块.
        </p>
      </header>

      <ul className="level-list">
        {levels.map((level) => {
          const ready = lessonsOfLevel(level.level).length;
          return (
            <li key={level.slug}>
              <Link className="level-card" href={`/level/${level.slug}`}>
                <div className="level-card__top">
                  <span className="level-card__no">HSK {level.level}</span>
                  <span className="level-card__book">{level.book}</span>
                </div>
                <p className="level-card__topics">{level.topics}</p>
                <dl className="level-card__stats">
                  <div>
                    <dt>Bài</dt>
                    <dd>{level.lessonCount}</dd>
                  </div>
                  <div>
                    <dt>Từ vựng</dt>
                    <dd>{level.vocabCumulative}</dd>
                  </div>
                  <div>
                    <dt>Trọng tâm</dt>
                    <dd className="level-card__focus">{level.grammarFocus}</dd>
                  </div>
                </dl>
                <p className="level-card__ready">
                  {ready > 0 ? `${ready}/${level.lessonCount} bài đã có nội dung` : 'Chưa nhập nội dung'}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
