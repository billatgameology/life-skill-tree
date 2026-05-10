import type { ReactNode } from 'react';
import StarfieldBackground from './StarfieldBackground';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="fixed inset-0 overflow-hidden bg-dark-slate">
      <StarfieldBackground />
      <div className="relative z-[1] w-full h-full">
        {children}
      </div>
    </div>
  );
}
