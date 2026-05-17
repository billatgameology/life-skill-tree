import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
  message: string;
  visible: boolean;
  onDone: () => void;
}

export default function Toast({ message, visible, onDone }: ToastProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          onAnimationComplete={() => {
            setTimeout(onDone, 3000);
          }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[80] bg-surface-raised border border-border text-ink px-5 py-3 rounded-xl shadow-lg font-heading font-semibold text-sm whitespace-nowrap"
        >
          <span className="text-glow-gold font-bold">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
