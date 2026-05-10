import { motion } from 'framer-motion';
import { TreePine, User, Award } from 'lucide-react';
import type { View } from '@/lib/types';

const NAV_ITEMS: { id: View; label: string; Icon: typeof TreePine }[] = [
  { id: 'home',     label: 'Tree',    Icon: TreePine },
  { id: 'profile',  label: 'Profile', Icon: User },
  { id: 'badges',   label: 'Badges',  Icon: Award },
];

interface NavbarProps {
  activeView: View;
  onChange: (view: View) => void;
}

export default function Navbar({ activeView, onChange }: NavbarProps) {
  return (
    <motion.nav
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.6, type: 'spring', stiffness: 300, damping: 25 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="flex items-center gap-1 bg-surface-raised/90 backdrop-blur-xl rounded-full px-3 py-2 border border-border shadow-nav h-14">
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className="relative flex flex-col items-center justify-center w-16 h-full rounded-full transition-colors duration-200 cursor-pointer"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center gap-0.5"
              >
                <item.Icon
                  size={20}
                  className={isActive ? 'text-glow-gold' : 'text-ink-dim'}
                />
                <span
                  className={`text-[10px] font-heading font-semibold tracking-wide ${
                    isActive ? 'text-glow-gold' : 'text-ink-dim'
                  }`}
                >
                  {item.label}
                </span>
              </motion.div>
              {isActive && (
                <motion.div
                  layoutId="nav-dot"
                  className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-glow-gold"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
}
