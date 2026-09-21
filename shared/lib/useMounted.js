'use client';

import { useEffect, useState } from 'react';

/**
 * true sau khi component đã gắn ở trình duyệt.
 *
 * Cần cho mọi màn có nội dung NGẪU NHIÊN: Next vẫn render các component
 * 'use client' một lần ở server, nên Math.random() chạy hai lần ra hai kết quả
 * và React báo hydration mismatch rồi vứt cả cây đi render lại.
 *
 * Dùng: chờ mounted rồi mới sinh câu hỏi/xáo đáp án.
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
