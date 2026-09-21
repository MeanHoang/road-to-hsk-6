// Sinh bài tập ngữ pháp từ NỘI DUNG THẬT của sách, không bịa câu.
//
// Hai nguồn câu duy nhất đang có:
//   1. Tiêu đề bài — mỗi bài là một câu hoàn chỉnh, in ngay trên mục lục
//      (你叫什么名字 · 她是我的汉语老师 · 我是坐飞机来的…)
//   2. Điểm 注释 — tên điểm ngữ pháp và công thức
//
// Không có câu nào tự nghĩ ra. Khi nhập được phần 课文 thì đổ thêm câu hội thoại
// vào đây, dạng bài giữ nguyên.

/** Cắt câu tiếng Trung thành đơn vị kéo thả. Ưu tiên cắt theo từ đã học. */
export function tokenize(sentence, vocab) {
  const words = [...new Set(vocab.map((v) => v.word))]
    .filter((w) => w.length > 1)
    .sort((a, b) => b.length - a.length); // khớp cụm dài trước

  const out = [];
  let i = 0;
  while (i < sentence.length) {
    const hit = words.find((w) => sentence.startsWith(w, i));
    if (hit) {
      out.push(hit);
      i += hit.length;
    } else {
      out.push(sentence[i]);
      i += 1;
    }
  }
  return out;
}

function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Bài SẮP XẾP CÂU — dạng bài kinh điển của đề HSK.
 * Xáo các thành phần, người học ghép lại thành câu đúng.
 */
export function orderQuestions(lessons, vocab) {
  return lessons
    .filter((l) => l.titleZh && l.titleZh.length >= 4)
    .map((l) => {
      const tokens = tokenize(l.titleZh, vocab);
      if (tokens.length < 3) return null;
      let pool = shuffled(tokens);
      // đảm bảo thứ tự xáo khác thứ tự đúng, không thì bài thành vô nghĩa
      if (pool.join('') === tokens.join('')) pool = [...tokens].reverse();
      return {
        id: `order-${l.slug}`,
        kind: 'order',
        prompt: l.titleVi,
        answer: tokens,
        pool,
        pinyin: l.titlePinyin,
        lessonNo: l.no,
      };
    })
    .filter(Boolean);
}

/**
 * Bài NHẬN DIỆN ĐIỂM NGỮ PHÁP — cho một câu, hỏi nó minh hoạ điểm 注释 nào.
 * Chỉ sinh cho bài có cả tiêu đề lẫn chú thích.
 */
export function matchQuestions(lessons) {
  const all = lessons.flatMap((l) => l.notes.map((n) => ({ ...n, lesson: l })));
  if (all.length < 4) return [];

  return lessons
    .filter((l) => l.notes.length > 0 && l.titleZh)
    .map((l) => {
      const right = l.notes[0];
      const others = shuffled(all.filter((n) => n.id !== right.id)).slice(0, 3);
      if (others.length < 3) return null;
      return {
        id: `match-${l.slug}`,
        kind: 'match',
        sentence: l.titleZh,
        pinyin: l.titlePinyin,
        vi: l.titleVi,
        answerId: right.id,
        options: shuffled([right, ...others]).map((n) => ({
          id: n.id,
          titleZh: n.titleZh,
          titleVi: n.titleVi,
        })),
        lessonNo: l.no,
      };
    })
    .filter(Boolean);
}

export function buildRound(lessons, vocab, limit = 10) {
  const mixed = shuffled([...orderQuestions(lessons, vocab), ...matchQuestions(lessons)]);
  return mixed.slice(0, limit);
}
