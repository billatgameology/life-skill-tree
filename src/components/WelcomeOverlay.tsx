import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AVATARS = [
  { src: '/avatar-1.png', name: 'Star' },
  { src: '/avatar-2.png', name: 'Cloud' },
  { src: '/avatar-3.png', name: 'Rocket' },
  { src: '/avatar-4.png', name: 'Owl' },
  { src: '/avatar-5.png', name: 'Cactus' },
  { src: '/avatar-6.png', name: 'Moon' },
];

interface WelcomeOverlayProps {
  onComplete: (name: string, avatar: string) => void;
}

export default function WelcomeOverlay({ onComplete }: WelcomeOverlayProps) {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('/avatar-1.png');
  const [step, setStep] = useState(0);

  const handleStart = () => {
    if (name.trim()) {
      onComplete(name.trim(), selectedAvatar);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[100] flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-void/90 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.2 }}
        className="relative w-full max-w-lg mx-4 bg-surface rounded-2xl shadow-modal overflow-hidden border border-border"
      >
        {/* Header area */}
        <div className="relative h-40 overflow-hidden bg-surface-high">
          <div className="absolute inset-0 bg-gradient-to-b from-surface-high to-surface" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-glow-gold/5 border border-glow-gold/20 flex items-center justify-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            </div>
          </div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-3 left-0 right-0 text-center"
          >
            <h1 className="font-display text-2xl text-ink drop-shadow-lg">
              Welcome to SkillBlox
            </h1>
          </motion.div>
        </div>

        <div className="p-6 space-y-5">
          <AnimatePresence mode="wait">
            {step === 0 ? (
              <motion.div
                key="avatar"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-center text-ink-muted font-body font-medium mb-4">
                  Choose your avatar
                </p>
                <div className="flex justify-center gap-3 flex-wrap">
                  {AVATARS.map((a) => (
                    <motion.button
                      key={a.src}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedAvatar(a.src);
                        setStep(1);
                      }}
                      className={`w-16 h-16 rounded-xl border-2 p-1 transition-colors cursor-pointer ${
                        selectedAvatar === a.src
                          ? 'border-glow-gold bg-glow-gold/10'
                          : 'border-border hover:border-ink-dim'
                      }`}
                    >
                      <img
                        src={a.src}
                        alt={a.name}
                        className="w-full h-full object-contain"
                      />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="name"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="flex justify-center mb-3">
                  <img
                    src={selectedAvatar}
                    alt="Your avatar"
                    className="w-16 h-16 object-contain"
                  />
                </div>
                <p className="text-center text-ink-muted font-body font-medium">
                  What should we call you?
                </p>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && name.trim()) handleStart();
                    if (e.key === 'Escape') setStep(0);
                  }}
                  placeholder="Enter your name..."
                  maxLength={20}
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border-2 border-border bg-surface-high text-ink font-heading font-semibold text-lg text-center focus:outline-none focus:border-glow-gold transition-colors placeholder:font-medium placeholder:text-ink-dim/50"
                />
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setStep(0)}
                    className="flex-1 py-3 rounded-xl border-2 border-border text-ink font-heading font-semibold hover:bg-surface-high transition-colors cursor-pointer"
                  >
                    Back
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleStart}
                    disabled={!name.trim()}
                    className="flex-1 py-3 rounded-xl bg-glow-gold text-void font-heading font-semibold hover:brightness-105 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Start
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
