// SM-2 — thuật toán giãn cách của Anki, rút gọn.
//
// KHÔNG import gì. File này chạy dưới bare `node` trong scripts/test-srs.mjs,
// vì đây là chỗ duy nhất làm mất tiến độ học nếu sai mà không ai phát hiện.
//
// Vì sao cần SRS thật chứ không phải cờ "đã biết": từ vựng HSK LŨY KẾ — cấp 2
// gồm luôn 150 từ cấp 1. Học xong bài 3 không có nghĩa là xong từ bài 3; nó
// phải quay lại trong lúc học bài 12. 150 từ còn đánh dấu tay được, 600 từ thì
// không.

export const EASE_MIN = 1.3;
export const EASE_START = 2.5;

/** Chất lượng nhớ lại, 0-3. Dưới 2 là quên. */
export const AGAIN = 0;
export const HARD = 1;
export const GOOD = 2;
export const EASY = 3;

/** Trạng thái ban đầu của một thẻ chưa học. */
export function fresh() {
  return { reps: 0, interval: 0, ease: EASE_START, due: null, lapses: 0 };
}

/**
 * Cập nhật thẻ sau một lần ôn.
 *
 * `today` truyền vào dạng 'YYYY-MM-DD' thay vì gọi Date bên trong — để test
 * chạy tất định, và để sau này đồng bộ nhiều thiết bị không lệch múi giờ.
 */
export function review(card, quality, today) {
  const c = card || fresh();

  if (quality < GOOD) {
    // Quên: ép về ngắn hạn, giảm ease. Không reset ease về mặc định — chữ khó
    // phải nhớ là khó, nếu reset thì nó cứ quay vòng mãi ở mức trung bình.
    return {
      reps: 0,
      lapses: c.lapses + 1,
      ease: Math.max(EASE_MIN, c.ease - (quality === AGAIN ? 0.2 : 0.15)),
      interval: 1,
      due: addDays(today, 1),
    };
  }

  const reps = c.reps + 1;
  const ease = clampEase(c.ease + (quality === EASY ? 0.15 : 0));

  let interval;
  if (reps === 1) interval = 1;
  else if (reps === 2) interval = 6;
  else interval = Math.round(c.interval * ease);

  return { reps, lapses: c.lapses, ease, interval, due: addDays(today, interval) };
}

function clampEase(e) {
  return Math.max(EASE_MIN, Math.min(3.0, Math.round(e * 100) / 100));
}

/** Cộng ngày trên chuỗi 'YYYY-MM-DD', không dùng Date để khỏi lệch múi giờ. */
export function addDays(ymd, days) {
  const [y, m, d] = ymd.split('-').map(Number);
  const t = Date.UTC(y, m - 1, d) + days * 86400000;
  const out = new Date(t);
  return [
    out.getUTCFullYear(),
    String(out.getUTCMonth() + 1).padStart(2, '0'),
    String(out.getUTCDate()).padStart(2, '0'),
  ].join('-');
}

/** Thẻ đến hạn ôn chưa. Thẻ chưa học (due null) luôn coi là đến hạn. */
export function isDue(card, today) {
  if (!card || !card.due) return true;
  return card.due <= today;
}

/**
 * Xếp hàng ôn: quá hạn lâu nhất lên trước, sau đó mới tới thẻ mới.
 * Trộn thẻ mới vào cuối để một phiên không toàn thẻ lạ — đó là cách nhanh nhất
 * làm người học bỏ cuộc.
 */
export function buildQueue(entries, today, limit = 20) {
  const due = [];
  const brandNew = [];
  for (const e of entries) {
    if (!e.card || !e.card.due) brandNew.push(e);
    else if (e.card.due <= today) due.push(e);
  }
  due.sort((a, b) => (a.card.due < b.card.due ? -1 : 1));
  return [...due, ...brandNew].slice(0, limit);
}
