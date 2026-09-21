# Road to HSK 6

A web app for working through **HSK 标准教程** (HSK Standard Course) properly — 6 levels, 18 volumes, 136 lessons.

Sibling of [`road-to-toeic-900`](https://github.com/MeanHoang/road-to-toiec-900): **identical stack, directory layout and deployment**. Only the content layer differs.

## Stack

Same as the TOEIC project:

- **Next.js 15 App Router**, **React 19**
- **Plain JavaScript** — no TypeScript
- **Plain CSS with three-tier design tokens** (`styles/tokens.css`) — no Tailwind
- **Firebase** (optional) for auth and progress; leave the env vars blank and the app falls back to `localStorage` plus the JSON bundled in the repo
- Deployed on **Vercel**, no server required

## Running it

```bash
npm install
npm run dev          # localhost:3000
npm run build
npm run gen          # regenerate features/lesson/bundled.js from content/
npm run test:pinyin
```

## Project structure

```
app/                    thin routes, they only render a screen
  level/[slug]/         lessons of one level
  lesson/[slug]/        lesson overview and its sections
features/<domain>/      screens and logic, grouped by domain
shared/ui/              atoms / molecules, presentation only
shared/lib/pinyin.js    syllable splitting and tones  ← Chinese-specific
styles/                 tokens → base → components → hsk
content/                source of truth, static JSON
scripts/                generators and tests
.claude/skills/         arch-review · ui-review · hsk-import
```

## What differs from Road to TOEIC 900

This is the complete list of what had to change. Everything else is reused as-is.

### 1. Three levels of nesting instead of a flat list

TOEIC is flat: `day-1`, `day-2`. HSK is **level → volume → lesson**, and the volume tier only exists from level 4 up (上/下).

Solution: encode all three in the slug — `hsk1-l01`, `hsk4a-l01` — so routes stay as flat as TOEIC's (`/lesson/[slug]`) instead of nesting three dynamic segments. A `/level/[slug]` tier sits above it, because 136 lessons cannot be listed on one page.

### 2. The set of sections changes by level

Levels 1–3 and levels 4+ **both have exactly seven 板块, but they are not the same seven**:

| | Levels 1–3 | Levels 4+ |
|---|---|---|
| 热身 课文 注释 练习 运用 | yes | yes |
| 拼音 (pinyin) | yes | no |
| 汉字 (characters) | yes | no |
| 扩展 (extension) | no | yes |
| 文化 (culture) | every 5th lesson | every lesson |

The counts match, so **do not hardcode seven fields** — `features/lesson/activities.js` picks the set from `level`.

### 3. Tones are data, not a display string

TOEIC stores IPA as a string and never computes on it. Chinese needs filtering, grading and drilling **by tone**, so `shared/lib/pinyin.js` extracts tones once:

- `splitSyllables('míngzi')` → `['míng', 'zi']`
- `tonesOf('Nǐ hǎo')` → `[3, 3]` — tones as **written**
- `spokenTones([3, 3])` → `[2, 3]` — tones as **spoken**, third-tone sandhi applied

The only genuinely ambiguous case is n/ng/r before a vowel; the rule is documented in that file and covered by `scripts/test-pinyin.mjs`.

### 4. No Whisper needed

This is the biggest difference in risk. The TOEIC project has to run `whisper.cpp` to get transcripts and then proofread them, because the machine mishears — the highest-risk part of that project.

HSK does not need any of it: the book prints every text, and the official audio is numbered `01-1.mp3`, `01-2.mp3`, mapping straight onto `lesson.no` plus the scene index. The join is a naming convention, not a model.

### 5. Chinese type needs its own font stack

Left to the browser, macOS falls back to a Japanese font and some characters render with the wrong strokes. `--font-zh` is declared in `styles/hsk.css`. Chinese glyphs also need a larger size than Latin text before the strokes are legible.

## Content

```
content/
├── levels.json               6 levels: lesson counts, vocabulary, class hours, volumes
├── lessons.json              flat index of every imported lesson
└── hsk1/
    ├── index.json
    └── lesson-01/
        ├── lesson.json       title, page, which collections the lesson has
        ├── vocabulary.json
        ├── notes.json        注释 — grammar points
        └── …
```

Every collection file shares one envelope — `{ collection, lesson, title, schemaVersion, items }` — and every item carries `id` and `source`, the same convention as the TOEIC project.

`source` records where a field came from and **whether it still needs checking**:

| | Meaning | Review? |
|---|---|---|
| `pdf` | Copied from the book as printed | No |
| `ai` | Filled in where the book leaves a blank | **Yes** |

### Content status

- **HSK 1** — all 15 lessons have titles (characters, pinyin, Vietnamese). Lessons 1–5 have vocabulary; lessons 3–5 have grammar notes.
- **HSK 2–6** — level metadata only, no lessons imported yet.

Title pinyin and Vietnamese word meanings are currently `source: "ai"` and **still need checking against the book**.

## Skills

`.claude/skills/` carries three, the same three as the TOEIC project with the import one rewritten for this source:

| Skill | Use it for |
|---|---|
| `arch-review` | Does a diff still respect the two axes — Atomic Design in `shared/ui`, feature modules for domain logic |
| `ui-review` | Interface review from measured DOM values rather than by eye |
| `hsk-import` | Import one lesson of the book into `content/` against the schema |

## Deployment

```bash
vercel
```

No environment variables required — the app runs off the JSON in the repo with progress in `localStorage`. To enable cross-device sync, copy `.env.example` into Vercel → Settings → Environment Variables.

## Copyright

The book's content belongs to Beijing Language and Culture University Press, and the Vietnamese translation to Nhân Trí Việt. This app is for **personal study**:

- `.gitignore` blocks `public/assets/**/*.pdf` and `*.mp3` — never commit scans or audio
- If you deploy publicly, enable access protection

> This repository is currently **public**. That was a deliberate choice by the owner; be aware that the files under `content/` include vocabulary, lesson titles and grammar points taken from a book that is still on sale.
