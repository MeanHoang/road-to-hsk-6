// Thanh điệu — phần không có tương đương ở Road to TOEIC 900.
//
// TOEIC lưu IPA là chuỗi hiển thị, không bao giờ phải tính toán trên nó. Tiếng
// Trung thì khác: thanh điệu là DỮ LIỆU, cần lọc/chấm/luyện theo thanh. Nên
// tách thanh ra khỏi chuỗi pinyin một lần ở đây thay vì parse lại mỗi chỗ dùng.

const TONE_MARKS = {
  1: 'āēīōūǖ',
  2: 'áéíóúǘ',
  3: 'ǎěǐǒǔǚ',
  4: 'àèìòùǜ',
};

const MARK_TO_TONE = (() => {
  const map = new Map();
  for (const [tone, chars] of Object.entries(TONE_MARKS)) {
    for (const ch of chars) map.set(ch, Number(tone));
  }
  return map;
})();

/** Thanh điệu của MỘT âm tiết. Không có dấu = thanh nhẹ (0). */
export function toneOf(syllable) {
  for (const ch of syllable) {
    const tone = MARK_TO_TONE.get(ch);
    if (tone) return tone;
  }
  return 0;
}

/** Tách pinyin nhiều âm tiết thành mảng thanh điệu: "nǐmen" → [3, 0]. */
export function tonesOf(pinyin) {
  return splitSyllables(pinyin).map(toneOf);
}

const V = '[aeiouüāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]';

// Một âm tiết = thanh mẫu (tuỳ chọn) + nguyên âm + đuôi n/ng/r (tuỳ chọn).
//
// Chỗ duy nhất nhập nhằng là n/ng/r: trong `nǐmen` thì `n` cuối thuộc âm tiết
// này, nhưng trong `Hànyǔ`… cũng vậy — còn trong `xī'ān` thì không. Luật: chỉ
// nuốt n/ng/r khi phía sau KHÔNG phải nguyên âm, vì nếu là nguyên âm thì nó
// đang mở đầu âm tiết kế tiếp. Ưu tiên khớp `ng` trước `n`.
const SYLLABLE = new RegExp(
  `(?:zh|ch|sh|[bpmfdtnlgkhjqxrzcsyw])?${V}+(?:ng(?!${V})|n(?!${V})|r(?!${V}))?`,
  'iy',
);

/**
 * Cắt chuỗi pinyin thành từng âm tiết.
 *
 * Tôn trọng trước dấu phân tách người viết đã đặt (khoảng trắng, dấu nháy,
 * gạch nối) — sách dùng dấu ' đúng ở những chỗ luật máy không đoán được
 * (`nǚ'ér`). Phần còn lại cắt theo luật cấu tạo âm tiết ở trên.
 */
export function splitSyllables(pinyin) {
  const parts = String(pinyin)
    .split(/[\s'’\-]+/)
    .filter(Boolean);

  const out = [];
  for (const part of parts) {
    SYLLABLE.lastIndex = 0;
    let cursor = 0;
    while (cursor < part.length) {
      SYLLABLE.lastIndex = cursor;
      const m = SYLLABLE.exec(part);
      if (!m || !m[0]) {
        // không khớp được nữa — trả phần còn lại nguyên cục, đừng nuốt mất chữ
        out.push(part.slice(cursor));
        break;
      }
      out.push(m[0]);
      cursor = SYLLABLE.lastIndex;
    }
  }
  return out.length ? out : [String(pinyin)];
}

export const TONE_LABEL = {
  0: 'thanh nhẹ',
  1: 'thanh 1 — cao đều',
  2: 'thanh 2 — lên',
  3: 'thanh 3 — xuống rồi lên',
  4: 'thanh 4 — xuống gắt',
};

/**
 * Biến điệu thanh 3: hai thanh 3 liền nhau thì cái ĐẦU đọc thành thanh 2.
 * 你好 nǐ hǎo → ní hǎo. Trả về mảng thanh khi ĐỌC, không phải khi viết.
 */
export function spokenTones(tones) {
  const out = [...tones];
  for (let i = 0; i < out.length - 1; i += 1) {
    if (out[i] === 3 && out[i + 1] === 3) out[i] = 2;
  }
  return out;
}
