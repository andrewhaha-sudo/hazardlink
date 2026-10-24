"use client";

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const MapView = dynamic(() => import('../../components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col h-[70vh] md:h-[85vh] items-center justify-center bg-slate-50">
      <div className="text-center text-slate-500">Loading map...</div>
    </div>
  ),
});

export default function MapPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col h-[70vh] md:h-[85vh] items-center justify-center bg-slate-50">
        <div className="text-center text-slate-500">Loading map...</div>
      </div>
    }>
      <MapView />
    </Suspense>
  );
}
