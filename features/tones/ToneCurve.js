'use client';

// Vẽ đường cong thanh điệu bằng SVG.
//
// Đây là "phản hồi trực quan" mà khảo sát app ghi nhận là điểm mạnh của
// HelloChinese. Thanh điệu học bằng mắt nhanh hơn bằng chữ: nhìn đường đi lên
// hay đi xuống là nhớ, còn đọc "thanh 2 là thanh lên" thì không.
//
// Toạ độ theo thang 5 mức của Chao (1-5), quy ước chuẩn trong ngữ âm tiếng Trung:
// thanh 1 = 55, thanh 2 = 35, thanh 3 = 214, thanh 4 = 51, thanh nhẹ = ngắn và thấp.

const SHAPES = {
  1: [5, 5],
  2: [3, 5],
  3: [2, 1, 4],
  4: [5, 1],
  0: [3, 2],
};

const W = 44;
const H = 40;
const PAD = 4;

function pathFor(tone) {
  const pts = SHAPES[tone] || SHAPES[0];
  const stepX = (W - PAD * 2) / (pts.length - 1);
  return pts
    .map((level, i) => {
      const x = PAD + i * stepX;
      // mức 1 ở đáy, mức 5 ở đỉnh
      const y = H - PAD - ((level - 1) / 4) * (H - PAD * 2);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}

export function ToneCurve({ tones }) {
  return (
    <div className="tone-curve">
      {tones.map((t, i) => (
        <svg
          key={i}
          className={`tone-curve__svg tone-${t}`}
          viewBox={`0 0 ${W} ${H}`}
          width={W}
          height={H}
          aria-hidden="true"
        >
          <line x1="0" y1={H - PAD} x2={W} y2={H - PAD} className="tone-curve__base" />
          <path d={pathFor(t)} fill="none" strokeWidth={t === 0 ? 2 : 3} strokeLinecap="round" />
        </svg>
      ))}
    </div>
  );
}
