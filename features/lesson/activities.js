// Các phần trong một bài, và thứ tự nên làm.
//
// MỘT nguồn duy nhất: màn tổng quan và drawer đều đọc từ đây.
//
// Khác TOEIC: tập hợp phần THAY ĐỔI theo cấp. Cấp 1-3 có 拼音 + 汉字; cấp 4 trở
// lên bỏ hai cái đó, thêm 扩展, và 文化 chuyển từ "cách 5 bài" thành "mọi bài".
// Cả hai đều đúng 7 板块 — số lượng bằng nhau nhưng nội dung khác, nên không
// được hardcode theo số.

const BASE = [
  { key: 'warmup', path: 'warmup', label: 'Khởi động', zh: '热身', needs: 'warmup' },
  { key: 'text', path: 'text', label: 'Bài khoá', zh: '课文', needs: 'text' },
  { key: 'notes', path: 'notes', label: 'Chú thích', zh: '注释', needs: 'notes' },
  { key: 'exercises', path: 'exercises', label: 'Luyện tập', zh: '练习', needs: 'exercises' },
];

const ELEMENTARY = [
  { key: 'pinyin', path: 'pinyin', label: 'Phiên âm', zh: '拼音', needs: 'pinyin' },
  { key: 'hanzi', path: 'hanzi', label: 'Chữ Hán', zh: '汉字', needs: 'hanzi' },
];

const ADVANCED = [
  { key: 'extend', path: 'extend', label: 'Mở rộng', zh: '扩展', needs: 'extend' },
];

const TAIL = [
  { key: 'apply', path: 'apply', label: 'Vận dụng', zh: '运用', needs: 'apply' },
  { key: 'culture', path: 'culture', label: 'Văn hoá', zh: '文化', needs: 'culture' },
];

// Công cụ học, không phải phần của sách — luôn có nếu bài có từ vựng.
const TOOLS = [
  { key: 'cards', path: 'cards', label: 'Thẻ từ vựng', needs: 'vocabulary' },
  { key: 'tones', path: 'tones', label: 'Luyện thanh điệu', needs: 'vocabulary' },
  { key: 'vocab', path: 'vocab', label: 'Bảng từ vựng', needs: 'vocabulary' },
];

// Phần nào đã dựng xong màn. Phần còn lại vẫn hiện trong danh sách nhưng không
// bấm được — để biết bài có gì mà chưa làm tới, thay vì giấu đi.
const BUILT = new Set(['notes', 'cards', 'tones', 'vocab']);

/** Cấp 1-3 dùng bộ sơ cấp, cấp 4+ dùng bộ nâng cao. */
export function sectionsForLevel(level) {
  return level <= 3 ? [...BASE, ...ELEMENTARY, ...TAIL] : [...BASE, ...ADVANCED, ...TAIL];
}

/**
 * Phần của một bài. Nhận bài đầy đủ hay bản rút gọn ở drawer đều được —
 * chỉ cần có `slug`, `level` và mảng `collections`.
 */
export function lessonActivities(lesson) {
  const have = lesson?.collections || [];
  const all = [...sectionsForLevel(lesson?.level ?? 1), ...TOOLS];
  return all
    .filter((a) => have.includes(a.needs))
    .map((a) => ({
      ...a,
      built: BUILT.has(a.key),
      href: BUILT.has(a.key) ? `/lesson/${lesson.slug}/${a.path}` : null,
    }));
}
