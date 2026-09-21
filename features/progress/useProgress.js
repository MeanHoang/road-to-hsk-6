'use client';

import { useCallback, useEffect, useState } from 'react';
import { readLevel, writeLevel, today } from './store';

/**
 * Tiến độ của MỘT CẤP. Mọi màn học đều đi qua hook này, nên chỗ nào cũng thấy
 * cùng một trạng thái — sai một từ ở Tone Trainer thì thẻ từ vựng biết ngay.
 */
export function useProgress(levelSlug) {
  const [data, setData] = useState(null);

  useEffect(() => {
    setData(readLevel(levelSlug));
  }, [levelSlug]);

  const update = useCallback(
    (bucket, id, value) => {
      setData((prev) => {
        const base = prev || readLevel(levelSlug);
        const next = { ...base, [bucket]: { ...base[bucket], [id]: value } };
        writeLevel(levelSlug, next);
        return next;
      });
    },
    [levelSlug],
  );

  const reset = useCallback(() => {
    const cleared = { vocab: {}, tones: {}, hanzi: {}, exercises: {}, updatedAt: null };
    writeLevel(levelSlug, cleared);
    setData(cleared);
  }, [levelSlug]);

  return { data, update, reset, today: today(), ready: data !== null };
}
