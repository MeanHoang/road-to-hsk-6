// Kiểm tra SM-2. Chạy: npm run test:srs
//
// Đây là chỗ duy nhất làm mất tiến độ học mà không ai phát hiện ra, nên nó có
// test riêng chạy dưới bare node — srs.js không được import gì.

import assert from 'node:assert/strict';
import { fresh, review, addDays, isDue, buildQueue, AGAIN, HARD, GOOD, EASY, EASE_MIN } from '../features/progress/srs.js';

const T = '2026-09-21';
let n = 0;
const ok = (msg) => { n += 1; console.log(`✓ ${msg}`); };

// --- cộng ngày không lệch múi giờ ---
assert.equal(addDays('2026-09-21', 1), '2026-09-22');
assert.equal(addDays('2026-12-31', 1), '2027-01-01');
assert.equal(addDays('2026-02-28', 1), '2026-03-01'); // 2026 không nhuận
ok('addDays qua tháng, qua năm, qua tháng 2');

// --- lịch tăng dần 1 → 6 → theo ease ---
let c = review(fresh(), GOOD, T);
assert.equal(c.interval, 1);
assert.equal(c.due, '2026-09-22');

c = review(c, GOOD, c.due);
assert.equal(c.interval, 6);
assert.equal(c.due, '2026-09-28');

c = review(c, GOOD, c.due);
assert.equal(c.interval, Math.round(6 * 2.5)); // 15
ok(`lịch 1 → 6 → ${c.interval} ngày`);

// --- EASY đẩy ease lên, GOOD giữ nguyên ---
const easy = review(review(fresh(), EASY, T), EASY, T);
assert.ok(easy.ease > 2.5, 'EASY phải tăng ease');
ok(`EASY nâng ease lên ${easy.ease}`);

// --- quên thì về 1 ngày và ĐẾM lapses, nhưng KHÔNG reset ease ---
const hard = review(c, AGAIN, '2026-10-13');
assert.equal(hard.interval, 1);
assert.equal(hard.reps, 0);
assert.equal(hard.lapses, 1);
assert.ok(hard.ease < c.ease, 'quên phải giảm ease');
assert.notEqual(hard.ease, 2.5, 'không được reset ease về mặc định');
ok('quên → về 1 ngày, lapses+1, ease giảm chứ không reset');

// --- ease có sàn: quên liên tục cũng không rơi dưới EASE_MIN ---
let bad = fresh();
for (let i = 0; i < 40; i += 1) bad = review(bad, AGAIN, T);
assert.equal(bad.ease, EASE_MIN);
ok(`ease có sàn ${EASE_MIN} dù quên 40 lần`);

// --- HARD giảm ít hơn AGAIN ---
const a = review(review(fresh(), GOOD, T), AGAIN, T);
const h = review(review(fresh(), GOOD, T), HARD, T);
assert.ok(h.ease > a.ease, 'HARD phải phạt nhẹ hơn AGAIN');
ok('HARD phạt nhẹ hơn AGAIN');

// --- đến hạn ---
assert.equal(isDue(null, T), true, 'thẻ mới luôn đến hạn');
assert.equal(isDue({ due: '2026-09-20' }, T), true);
assert.equal(isDue({ due: '2026-09-22' }, T), false);
ok('isDue: thẻ mới, quá hạn, chưa tới hạn');

// --- hàng đợi: quá hạn lâu nhất trước, thẻ mới xuống cuối ---
const q = buildQueue(
  [
    { id: 'new', card: null },
    { id: 'old', card: { due: '2026-09-10' } },
    { id: 'recent', card: { due: '2026-09-20' } },
    { id: 'future', card: { due: '2026-10-01' } },
  ],
  T,
);
assert.deepEqual(q.map((e) => e.id), ['old', 'recent', 'new']);
ok('hàng đợi: quá hạn lâu nhất → mới nhất → thẻ chưa học, bỏ thẻ chưa tới hạn');

// --- giới hạn mỗi phiên ---
const many = Array.from({ length: 50 }, (_, i) => ({ id: i, card: null }));
assert.equal(buildQueue(many, T, 20).length, 20);
ok('giới hạn 20 thẻ mỗi phiên');

console.log(`\n${n} nhóm test SRS — OK`);
