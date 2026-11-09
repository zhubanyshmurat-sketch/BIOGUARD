import { motion } from 'framer-motion';
import { useRef, useState } from 'react';

// Логотип. 3 секунд басып тұрса — onLongPress (презентация режимі).
export function Logo({ onLongPress, size = 88 }: { onLongPress?: () => void; size?: number }) {
  const timer = useRef<number>();
  const [holding, setHolding] = useState(false);
  const start = () => {
    if (!onLongPress) return;
    setHolding(true);
    timer.current = window.setTimeout(() => {
      setHolding(false);
      onLongPress();
    }, 3000);
  };
  const stop = () => {
    setHolding(false);
    window.clearTimeout(timer.current);
  };
  const r = size / 2 - 3;
  const c = 2 * Math.PI * r;
  return (
    <div
      className="no-select relative mx-auto shrink-0"
      style={{ width: size, height: size, touchAction: 'none' }}
      onPointerDown={start}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onContextMenu={(e) => e.preventDefault()}
    >
      <motion.div
        className="absolute inset-[6px] flex items-center justify-center rounded-full bg-gradient-to-br from-forest-400 via-teal2-500 to-forest-600 shadow-card"
        animate={{ scale: holding ? 0.92 : 1 }}
      >
        <svg viewBox="0 0 64 64" width={size * 0.55} height={size * 0.55} aria-hidden>
          <path d="M32 6 L54 14 V30 C54 44 44 54 32 58 C20 54 10 44 10 30 V14 Z" fill="#fff" opacity=".95" />
          <path d="M32 46 C24 40 22 32 26 24 C30 28 34 28 38 24 C42 32 40 40 32 46 Z" fill="#16a35a" />
          <path d="M32 46 V30" stroke="#0d6e3c" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </motion.div>
      <svg className="pointer-events-none absolute inset-0 -rotate-90" width={size} height={size}>
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#deb862"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={false}
          animate={{ strokeDashoffset: holding ? 0 : c }}
          transition={{ duration: holding ? 3 : 0.2, ease: 'linear' }}
        />
      </svg>
    </div>
  );
}
