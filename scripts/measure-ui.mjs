// Đo giao diện từ DOM THẬT, không nhìn bằng mắt.
//
// Theo skill ui-review: AI viết giao diện hỏng theo một kiểu đặc trưng — nhìn
// thì ổn mà đo thì sai. Chữ mờ tưởng là tinh tế nhưng dưới ngưỡng đọc được, nút
// tưởng đủ to nhưng thiếu vài pixel, chữ xuống dòng xấu chỉ lộ ở một cỡ màn hình.
//
// Chạy: node scripts/measure-ui.mjs   (cần dev server đang chạy ở :3000)

import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';
const PAGES = [
  ['/', 'Trang chủ'],
  ['/level/hsk1', 'Cấp 1'],
  ['/lesson/hsk1-l03', 'Bài 3'],
  ['/lesson/hsk1-l03/notes', 'Chú thích'],
  ['/lesson/hsk1-l03/vocab', 'Bảng từ'],
];
const WIDTHS = [1280, 768, 390];

const browser = await chromium.launch({ channel: 'chrome' });
const problems = [];

for (const width of WIDTHS) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });

  for (const [path, label] of PAGES) {
    await page.goto(BASE + path, { waitUntil: 'networkidle' });

    const found = await page.evaluate(() => {
      const out = [];
      const px = (v) => parseFloat(v) || 0;

      // 1. tràn ngang — trang không bao giờ được cuộn ngang
      if (document.documentElement.scrollWidth > window.innerWidth + 1) {
        out.push({ kind: 'overflow-x', detail: `scrollWidth ${document.documentElement.scrollWidth} > ${window.innerWidth}` });
      }

      for (const el of document.querySelectorAll('a, button, .tool-card, .section-card, .lesson-row, .level-card__stats div, .grade, .opt, .mode-btn')) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        const cs = getComputedStyle(el);
        const tag = el.className || el.tagName;
        const text = (el.textContent || '').trim().slice(0, 32);

        // 2. vùng bấm — ngưỡng 44px của WCAG 2.5.5
        // WCAG 2.5.5 miễn trừ link nằm trong dòng văn bản — chỉ đo phần tử đứng riêng
        const inlineInText = el.tagName === 'A'
          && getComputedStyle(el).display === 'inline'
          && el.parentElement
          && el.parentElement.textContent.trim().length > (el.textContent || '').trim().length + 10;
        const clickable = (el.tagName === 'A' || el.tagName === 'BUTTON') && !inlineInText;
        if (clickable && (r.height < 44 || r.width < 44)) {
          out.push({ kind: 'tap-target', detail: `${Math.round(r.width)}×${Math.round(r.height)}`, tag, text });
        }

        // 3. chữ xuống dòng giữa cụm ngắn — dấu hiệu cột quá hẹp
        const lineH = px(cs.lineHeight) || px(cs.fontSize) * 1.2;
        const lines = Math.round(r.height / lineH);
        if (lines >= 3 && text.length < 20 && el.children.length === 0) {
          out.push({ kind: 'wrap', detail: `${lines} dòng cho ${text.length} ký tự`, tag, text });
        }

        // 4. chiều cao lệch giữa các card cùng hàng
      }

      // 5. các thẻ trong CÙNG MỘT HÀNG phải cao bằng nhau.
      //
      // Phải gom theo hàng trước khi so. Grid cho mỗi hàng tự cao theo nội dung
      // của hàng đó, nên hàng 1 cao 220 và hàng 2 cao 201 là ĐÚNG — so tất cả
      // với nhau thì báo sai, đây chính là lỗi mà rule zero của ui-review cảnh báo.
      for (const list of document.querySelectorAll('.level-list, .tool-list, .section-list')) {
        const rows = new Map();
        for (const c of list.children) {
          const r = c.getBoundingClientRect();
          const key = Math.round(r.top);
          if (!rows.has(key)) rows.set(key, []);
          rows.get(key).push(Math.round(r.height));
        }
        for (const [top, heights] of rows) {
          if (heights.length < 2) continue;
          if (Math.max(...heights) - Math.min(...heights) > 8) {
            out.push({
              kind: 'uneven',
              detail: `cùng hàng y=${top} lệch: ${[...new Set(heights)].join(', ')}px`,
              tag: list.className,
            });
          }
        }
      }

      // 6. tương phản chữ mờ
      for (const el of document.querySelectorAll('.muted, .vi, .pinyin')) {
        const cs = getComputedStyle(el);
        const m = cs.color.match(/\d+/g);
        if (!m) continue;
        const [r0, g0, b0] = m.map(Number);
        const lum = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
        const L = 0.2126 * lum(r0) + 0.7152 * lum(g0) + 0.0722 * lum(b0);
        const ratio = (1.05) / (L + 0.05); // so với nền trắng
        if (ratio < 4.5) {
          out.push({ kind: 'contrast', detail: `${ratio.toFixed(2)}:1 (cần 4.5)`, tag: el.className, text: (el.textContent || '').trim().slice(0, 24) });
        }
      }

      return out;
    });

    for (const f of found) problems.push({ width, label, ...f });
  }
  await page.close();
}

await browser.close();

if (problems.length === 0) {
  console.log('Không đo thấy vấn đề nào.');
} else {
  const byKind = {};
  for (const p of problems) (byKind[p.kind] ||= []).push(p);
  for (const [kind, list] of Object.entries(byKind)) {
    console.log(`\n### ${kind} — ${list.length}`);
    const seen = new Set();
    for (const p of list) {
      const key = `${p.kind}|${p.tag}|${p.text}|${p.width}`;
      if (seen.has(key)) continue;
      seen.add(key);
      console.log(`  ${String(p.width).padStart(4)}px ${p.label.padEnd(10)} ${p.detail}  ${p.tag || ''} ${p.text ? `"${p.text}"` : ''}`);
    }
  }
}
