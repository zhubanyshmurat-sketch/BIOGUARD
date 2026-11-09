import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode } from 'react';

export function Modal({ open, children }: { open: boolean; children: ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-forest-900/40 p-3 backdrop-blur-sm sm:items-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="card w-full max-w-md p-5" style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
            initial={{ y: 60, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
