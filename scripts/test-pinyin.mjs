// Kiểm tra tách âm tiết và biến điệu thanh 3.
// Chạy: npm run test:pinyin

import assert from 'node:assert/strict';
import { tonesOf, spokenTones, splitSyllables, toneOf } from '../shared/lib/pinyin.js';

const cases = [
  // pinyin,        âm tiết,              thanh viết,  thanh đọc
  ['Nǐ hǎo', ['Nǐ', 'hǎo'], [3, 3], [2, 3]],
  ['xièxie', ['xiè', 'xie'], [4, 0], [4, 0]],
  ['míngzi', ['míng', 'zi'], [2, 0], [2, 0]],
  ['Hànyǔ', ['Hàn', 'yǔ'], [4, 3], [4, 3]],
  ['nǐmen', ['nǐ', 'men'], [3, 0], [3, 0]],
  ['jīnnián', ['jīn', 'nián'], [1, 2], [1, 2]],
  ['Zhōngguó', ['Zhōng', 'guó'], [1, 2], [1, 2]],
];

let pass = 0;
for (const [pinyin, syllables, written, spoken] of cases) {
  assert.deepEqual(splitSyllables(pinyin), syllables, `tách âm tiết: ${pinyin}`);
  assert.deepEqual(tonesOf(pinyin), written, `thanh viết: ${pinyin}`);
  assert.deepEqual(spokenTones(written), spoken, `thanh đọc: ${pinyin}`);
  const changed = written.join() !== spoken.join();
  console.log(
    `✓ ${pinyin.padEnd(10)} ${JSON.stringify(syllables).padEnd(20)} ` +
      `viết=${written.join('-')} đọc=${spoken.join('-')}${changed ? '  ← biến điệu' : ''}`,
  );
  pass += 1;
}

// thanh nhẹ = không có dấu
assert.equal(toneOf('ma'), 0);
// ba thanh 3 liền nhau: chỉ cái đứng trước một thanh 3 mới đổi
assert.deepEqual(spokenTones([3, 3, 3]), [2, 2, 3]);

console.log(`\n${pass}/${cases.length} case pinyin — OK`);
