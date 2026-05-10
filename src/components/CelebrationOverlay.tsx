import { motion, AnimatePresence } from 'framer-motion';

interface CelebrationOverlayProps {
  visible: boolean;
}

export default function CelebrationOverlay({ visible }: CelebrationOverlayProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none"
        >
          <div className="absolute inset-0 bg-void/20" />
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            className="relative z-10 text-center"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 20 }}
            >
              <h1
                className="font-display text-4xl md:text-5xl text-ink"
                style={{ textShadow: '0 0 40px rgba(212,175,55,0.4)' }}
              >
                Skill Complete!
              </h1>
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-glow-gold text-lg mt-3 font-heading font-semibold tracking-wide"
              >
                Well done
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
