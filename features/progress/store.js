'use client';

// Kho tiến độ ở máy. Khoá theo CẤP, không theo bài.
//
// Đây là khác biệt cấu trúc so với Road to TOEIC 900 và là chỗ phải làm đúng
// ngay từ đầu: từ vựng HSK lũy kế, kỳ thi hỏi cả vốn từ của cấp, nên "thuộc
// chưa" là câu hỏi ở mức CẤP. Bài chỉ là nơi từ xuất hiện lần đầu.
//
// Đổi khoá sau khi đã có dữ liệu = mất sạch tiến độ, nên không đổi.

export const KEY = 'roadtohsk';

export function readAll() {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

export function writeAll(all) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify(all));
}

const emptyLevel = () => ({ vocab: {}, tones: {}, hanzi: {}, exercises: {}, updatedAt: null });

export function readLevel(levelSlug) {
  return readAll()[levelSlug] || emptyLevel();
}

export function writeLevel(levelSlug, data) {
  const all = readAll();
  all[levelSlug] = { ...data, updatedAt: new Date().toISOString() };
  writeAll(all);
  return all[levelSlug];
}

/** Ngày hôm nay dạng YYYY-MM-DD theo giờ máy — khớp định dạng `due` của srs.js. */
export function today() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}
