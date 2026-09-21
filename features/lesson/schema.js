// Hình dạng một BÀI của bộ 标准教程 và cách ghép các file collection lại.
//
// Khác Road to TOEIC 900 ở đúng một chỗ: TOEIC phẳng (day-1, day-2...), còn HSK
// có 3 tầng — cấp → quyển → bài. Tầng quyển chỉ tồn tại từ cấp 4 (上/下), nên nó
// nằm trong slug chứ không thành thư mục riêng: `hsk1-l01`, `hsk4a-l01`.

export const SCHEMA_VERSION = 1;

// 7 板块 của một bài. Cấp 1-3 và cấp 4+ dùng 2 tập hợp KHÁC NHAU — xem
// features/lesson/activities.js. Đây chỉ là danh sách tên hợp lệ.
export const SECTIONS = [
  'warmup', // 热身  khởi động
  'text', // 课文  bài khoá + 生词
  'notes', // 注释  chú thích ngữ pháp
  'exercises', // 练习  luyện tập
  'pinyin', // 拼音  phiên âm (chỉ cấp 1-3)
  'hanzi', // 汉字  chữ Hán (chỉ cấp 1-3)
  'extend', // 扩展  mở rộng (chỉ cấp 4+)
  'apply', // 运用  vận dụng
  'culture', // 文化  cấp 1-3: cách 5 bài · cấp 4+: mọi bài
];

/**
 * Gộp các file collection của một bài thành object phẳng cho component dùng.
 * `has()` để màn tổng quan ẩn phần mà bài đó không có.
 */
export function assemble(slug, files) {
  if (!files?.lesson) return null;
  const { lesson, ...collections } = files;

  for (const [name, file] of Object.entries(collections)) {
    if (!file) continue;
    if (file.schemaVersion !== SCHEMA_VERSION) {
      throw new Error(
        `${slug}/${name} dùng schemaVersion ${file.schemaVersion}, code đang ở ${SCHEMA_VERSION}.`,
      );
    }
    if (file.lesson !== slug) {
      throw new Error(`${slug}/${name} khai báo lesson="${file.lesson}" — nhầm bài?`);
    }
  }

  const has = (name) => lesson.collections?.includes(name) && !!collections[name];
  const items = (name) => (has(name) ? collections[name].items : []);

  return {
    ...lesson,
    has,
    warmup: items('warmup'),
    text: items('text'),
    vocabulary: items('vocabulary'),
    notes: items('notes'),
    exercises: items('exercises'),
    pinyin: items('pinyin'),
    hanzi: items('hanzi'),
    extend: items('extend'),
    apply: items('apply'),
    culture: items('culture'),
  };
}
