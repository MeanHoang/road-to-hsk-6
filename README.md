# Road to HSK 6

Web app đọc bộ giáo trình **HSK 标准教程** (Giáo trình chuẩn HSK) cho tử tế — 6 cấp, 18 quyển, 136 bài.

Anh em với [`road-to-toeic-900`](../road-to-toeic-900): **y hệt về stack, cấu trúc thư mục và cách deploy**, chỉ khác lớp nội dung.

## Stack

Giống hệt dự án TOEIC:

- **Next.js 15 App Router**, **React 19**
- **JavaScript thuần** — không TypeScript
- **CSS thuần + design token 3 tầng** (`styles/tokens.css`) — không Tailwind
- **Firebase** (tuỳ chọn) cho auth + tiến độ; bỏ trống env thì rơi về `localStorage` và JSON bundle trong repo
- Deploy **Vercel**, không cần server

## Chạy

```bash
npm install
npm run dev        # localhost:3000
npm run build
npm run gen        # sinh lại features/lesson/bundled.js từ content/
npm run test:pinyin
```

## Cấu trúc

```
app/                    route mỏng, chỉ gọi screen
  level/[slug]/         danh sách bài của một cấp
  lesson/[slug]/        tổng quan bài + các phần
features/<domain>/      screen + logic theo domain
shared/ui/              atom / molecule dùng chung
shared/lib/pinyin.js    tách âm tiết + thanh điệu  ← đặc thù tiếng Trung
styles/                 token → base → components → hsk
content/                nguồn sự thật, JSON tĩnh
scripts/                sinh dữ liệu, test
```

## Khác gì so với Road to TOEIC 900

Đây là toàn bộ phần phải sửa; hạ tầng còn lại dùng nguyên.

### 1. Phân cấp 3 tầng thay vì phẳng

TOEIC phẳng: `day-1`, `day-2`. HSK là **cấp → quyển → bài**, và tầng quyển chỉ tồn tại từ cấp 4 (上/下).

Giải pháp: nhốt cả 3 tầng vào slug — `hsk1-l01`, `hsk4a-l01` — nên route vẫn phẳng như TOEIC (`/lesson/[slug]`), không phải lồng 3 tầng dynamic segment.

### 2. Tập hợp "phần trong bài" đổi theo cấp

Cấp 1–3 và cấp 4+ **đều có đúng 7 板块, nhưng là 7 cái khác nhau**:

| | Cấp 1–3 | Cấp 4+ |
|---|---|---|
| 热身 课文 注释 练习 运用 | ✅ | ✅ |
| 拼音 (phiên âm) | ✅ | ❌ |
| 汉字 (chữ Hán) | ✅ | ❌ |
| 扩展 (mở rộng) | ❌ | ✅ |
| 文化 (văn hoá) | cách 5 bài | mọi bài |

Số lượng bằng nhau nên **đừng hardcode theo số** — `features/lesson/activities.js` chọn tập hợp theo `level`.

### 3. Thanh điệu là dữ liệu, không phải chuỗi hiển thị

TOEIC lưu IPA như một chuỗi, không bao giờ tính toán trên nó. Tiếng Trung thì cần lọc/chấm/luyện **theo thanh**, nên `shared/lib/pinyin.js` tách thanh ra khỏi pinyin một lần:

- `splitSyllables('míngzi')` → `['míng', 'zi']`
- `tonesOf('Nǐ hǎo')` → `[3, 3]` (thanh khi **viết**)
- `spokenTones([3, 3])` → `[2, 3]` (thanh khi **đọc** — biến điệu thanh 3)

Chỗ nhập nhằng duy nhất là n/ng/r trước nguyên âm; luật xử lý nằm trong comment của file đó.

### 4. Không cần whisper

Đây là khác biệt lớn nhất về rủi ro. Dự án TOEIC phải chạy `whisper.cpp` để có transcript, rồi soát tay vì máy chép sai — rủi ro cao nhất của cả dự án.

HSK **không cần**: sách đã in sẵn toàn bộ bài khoá, và audio chính thức đánh số `01-1.mp3`, `01-2.mp3` khớp thẳng `lesson.no` + index tình huống. Ghép được bằng quy tắc đặt tên, không phải bằng AI.

### 5. Font và cỡ chữ

Chữ Hán phải khai báo font riêng (`--font-zh`) — nếu để trình duyệt tự chọn thì macOS rơi về font tiếng Nhật và một số chữ ra dạng Kanji. Cỡ chữ Hán cũng phải lớn hơn chữ Latinh mới thấy nét.

## Nội dung

```
content/
├── levels.json               6 cấp: số bài, từ vựng, số tiết, quyển
├── lessons.json              index phẳng mọi bài đã nhập
└── hsk1/
    ├── index.json
    └── lesson-01/
        ├── lesson.json       tiêu đề, trang, collections có trong bài
        ├── vocabulary.json
        ├── notes.json        注释 — điểm ngữ pháp
        └── …
```

Mọi file collection dùng chung khuôn `{ collection, lesson, title, schemaVersion, items }`, mọi item có `id` + `source` — giống hệt quy ước của dự án TOEIC.

`source` cho biết dữ liệu từ đâu và **có phải soát lại không**:

| | Nghĩa | Soát? |
|---|---|---|
| `pdf` | Nguyên văn từ sách | Không |
| `ai` | AI bổ sung chỗ sách bỏ trống | **Có** |

### Trạng thái nội dung

- **HSK 1** — 15/15 bài có tiêu đề (chữ Hán + pinyin + nghĩa), bài 1–5 có từ vựng, bài 3–5 có chú thích ngữ pháp.
- **HSK 2–6** — mới có metadata cấp trong `levels.json`, chưa nhập bài.

Pinyin của tiêu đề và nghĩa tiếng Việt của từ vựng đang là `source: "ai"` → **cần soát lại với sách**.

## Deploy

```bash
vercel
```

Không cần biến môi trường — app chạy được với nội dung JSON trong repo và tiến độ ở `localStorage`. Muốn bật đồng bộ nhiều thiết bị thì điền `.env.example` vào Vercel → Settings → Environment Variables.

## Bản quyền

Nội dung sách thuộc Beijing Language and Culture University Press và Nhân Trí Việt (bản dịch tiếng Việt). App này để **học cá nhân**:

- Repo để **private**
- Deploy thì bật bảo vệ truy cập, đừng để index công khai
- Không commit file scan PDF/MP3 vào repo
