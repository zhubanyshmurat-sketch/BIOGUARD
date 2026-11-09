import { useState } from 'react';
import { Species } from '../data/content';

// Түр суреті: image берілсе — фото, әйтпесе эмодзи шеңберде.
export function Avatar({ s, size = 56 }: { s: Pick<Species, 'emoji' | 'image' | 'bg' | 'name'>; size?: number }) {
  const [broken, setBroken] = useState(false);
  return (
    <div
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-white shadow"
      style={{ width: size, height: size, background: s.bg }}
    >
      {s.image && !broken ? (
        <img src={s.image} alt={s.name} className="h-full w-full object-cover" draggable={false} onError={() => setBroken(true)} />
      ) : (
        <span style={{ fontSize: size * 0.55, lineHeight: 1 }} aria-hidden>{s.emoji}</span>
      )}
    </div>
  );
}
