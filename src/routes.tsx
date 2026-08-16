import { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import GalleryPage from '@/pages/GalleryPage';
import { DESIGNS } from '@/designs/registry';

export default function AppRoutes() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 flex items-center justify-center bg-void">
          <div className="animate-pulse font-display text-2xl text-ink-muted">Loading...</div>
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<GalleryPage />} />
        {DESIGNS.map((design) => (
          <Route key={design.slug} path={`/${design.slug}/*`} element={<design.Component />} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
