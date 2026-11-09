import { motion } from 'framer-motion';

export function Stars({ n, size = 28, animate = true }: { n: number; size?: number; animate?: boolean }) {
  return (
    <div className="flex items-center justify-center gap-1">
      {[1, 2, 3].map((i) => (
        <motion.span
          key={i}
          initial={animate ? { scale: 0, rotate: -40 } : false}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: animate ? 0.2 + i * 0.15 : 0, type: 'spring', stiffness: 300, damping: 14 }}
          style={{ fontSize: size, filter: i <= n ? 'none' : 'grayscale(1) opacity(.3)' }}
        >
          ⭐
        </motion.span>
      ))}
    </div>
  );
}
