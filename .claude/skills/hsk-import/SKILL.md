---
name: hsk-import
description: Import one lesson of HSK 标准教程 into the Road to HSK 6 app — write the content/<level>/lesson-NN/*.json files against the schema, then regenerate the bundle. Use when the user reads out a lesson from the book, hands over photographed pages, or wants to fill in data missing from a lesson that already exists (pinyin, Vietnamese meanings, grammar examples, culture notes).
---

# Import one lesson of 标准教程

## Why this needs a skill and not just a script

The sibling project imports from a Google Drive folder, so a script can crawl and download.
Here there is **no folder to crawl**. The source is a printed book, and what arrives is whatever
the user types or photographs. The mechanical half barely exists; almost all of it is judgement:

- Splitting a page into 热身 / 课文 / 注释 / 练习 / 拼音 / 汉字 / 运用 — the headings are in Chinese
  and the Vietnamese edition interleaves a translation column
- Writing pinyin with the right tone marks, and deciding where a syllable boundary falls
- Writing Vietnamese meanings when the source leaves them out
- Deciding which section a level actually has — the set changes at level 4

So: this skill does the judgement, the schema keeps it honest, and `npm run gen` does the only
mechanical step.

## Rule zero — never invent content

Everything written into `content/` is either **on the page** or **explicitly marked as generated**.
There is no third category.

Every item carries `source`, per field:

| Value | Meaning | Must be reviewed? |
|---|---|---|
| `pdf` | Copied from the book as printed | No |
| `ai` | Filled in because the book leaves it blank, or added for the app | **Yes** |

If you cannot see the page, you do not know what is on it. Ask for the page rather than
reconstructing a lesson from memory of what HSK 1 "usually" contains — that is the single failure
mode that makes this content worthless, because the user cannot tell invented data from copied data
once it is in a JSON file.

## What the book actually looks like

Confirmed structure, not assumption:

- **Levels 1–3**: one volume each. **Levels 4–6**: two volumes, 上 and 下.
- Lesson counts: L1 15, L2 15, L3 20, L4 20 (10+10), L5 36 (18+18), L6 40 (20+20).
- **Seven 板块 per lesson, but two different sets**:

  | | Level 1–3 | Level 4+ |
  |---|---|---|
  | 热身 课文 注释 练习 运用 | yes | yes |
  | 拼音 · 汉字 | yes | **no** |
  | 扩展 | no | **yes** |
  | 文化 | every 5th lesson | **every lesson** |

- Level 1–3: ~10–15 new words and 3–4 grammar points per lesson; 课文 is **3 scenes**.
- Level 4: ~30–35 new words and 5 grammar points per lesson; one longer text instead of scenes.
- Lessons 1–2 of level 1 are a phonetics primer — no topic, no 注释.

Getting the section set wrong is the mistake this skill exists to prevent. Read `level` first,
then decide which files to write.

## Step 1 — Place the lesson

```bash
ls content/                      # which levels exist
cat content/levels.json          # lesson counts, volumes, cumulative vocab
cat content/hsk1/index.json      # which lessons are already registered
```

Slug is `hsk<level>-l<NN>` for single-volume levels, `hsk<level>[ab]-l<NN>` from level 4 up
(`a` = 上, `b` = 下). Directory is `content/hsk<level>/lesson-<NN>/`.

## Step 2 — Write `lesson.json` first

It declares which collections the lesson has; nothing else can be checked until it exists.

```json
{
  "slug": "hsk1-l03", "no": 3, "level": 1, "volume": "hsk1",
  "titleZh": "你叫什么名字", "titlePinyin": "Nǐ jiào shénme míngzi",
  "titleVi": "Cô tên gì?", "page": 26,
  "isPhoneticsIntro": false, "hasCulture": false,
  "collections": ["warmup", "text", "vocabulary", "notes", "exercises", "pinyin", "hanzi", "apply"],
  "source": { "titleZh": "pdf", "titleVi": "pdf", "titlePinyin": "ai", "page": "pdf" }
}
```

`collections` lists what the lesson **actually has**. Omit a name and the app hides that section —
that is the intended way to model a missing part, not an empty array.

## Step 3 — Write the collections

Every file uses the same envelope:

```json
{ "collection": "vocabulary", "lesson": "hsk1-l03", "title": "Từ vựng", "schemaVersion": 1, "items": [] }
```

`lesson` must equal the folder's slug — `assemble()` throws if it does not, which is how a file
copied from another lesson gets caught.

IDs are `h<level>l<NN>-<kind><nn>` and **never change**, because progress in `localStorage` is keyed
on them. Renaming an id silently resets the user's progress for that item.

### Vocabulary

```json
{
  "id": "h1l03-v01", "no": 1, "word": "叫", "pinyin": "jiào",
  "pos": "động từ", "meaningVi": "gọi, tên là",
  "isOverSyllabus": false, "image": null,
  "source": { "word": "pdf", "pinyin": "ai", "meaningVi": "ai", "isOverSyllabus": "pdf" }
}
```

- **`pinyin` carries tone marks.** Never write bare `jiao`. Tones are parsed out of this string by
  `shared/lib/pinyin.js`; a missing mark silently becomes a neutral tone.
- **Use `'` at a syllable boundary the rules cannot resolve** — `nǚ'ér`, `xī'ān`. Check with:
  `node -e "import('./shared/lib/pinyin.js').then(m=>console.log(m.splitSyllables('nǚ'ér')))"`
- **`isOverSyllabus`** mirrors the book's `*` mark for words outside the HSK level's official list.
  It is printed on the page, so its source is `pdf`, not `ai`.
- `pos` and `meaningVi` are in Vietnamese; keep the Chinese grammatical terms out of them.

### Grammar notes (注释)

```json
{
  "id": "h1l03-n1", "no": 1,
  "titleZh": "疑问代词“什么”", "titleVi": "Đại từ nghi vấn 什么",
  "pattern": "S + 叫 + 什么 + N?", "examples": [],
  "source": { "titleZh": "pdf", "titleVi": "ai", "pattern": "ai" }
}
```

The book prints the heading and the examples; the formula line is usually **not** printed as a
formula, so `pattern` is normally `ai`. Say so rather than dressing it up as copied.

## Step 4 — Regenerate and verify

```bash
npm run gen            # rewrites features/lesson/bundled.js from content/
npm run test:pinyin    # syllable splitting + tone sandhi still correct
npm run build          # a malformed JSON or a wrong `lesson` field fails here
```

Then look at it, because none of the above checks meaning:

```bash
npm run dev
# /lesson/hsk1-l03            — do the seven sections match the page?
# /lesson/hsk1-l03/vocab      — filter by tone; does every row show the tone you expect?
```

## Step 5 — Report what needs review

Close by listing every field written with `source: "ai"`, grouped by file, so the user knows exactly
what to check against the book. A lesson imported without that list is not finished.

```
Needs checking against the book:
  vocabulary.json — pinyin (12 words), meaningVi (12 words)
  notes.json      — pattern (3 points), titleVi (3 points)
  lesson.json     — titlePinyin
```

## Out of scope

Layering questions (which file goes in `features/` vs `shared/ui`) belong to **`arch-review`**.
Visual checks belong to **`ui-review`**. Copyright: content is from a book still on sale — see the
README. Never commit scans or audio to the repo.
