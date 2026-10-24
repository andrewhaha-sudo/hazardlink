import type { Metadata } from 'next';
import './globals.css';
import Navbar from '../components/Navbar';
import LiveToasts from '../components/LiveToasts';

export const metadata: Metadata = {
  title: 'HAZARDLINK — School Hazard Mapping & Disaster Response',
  description: 'Smart school hazard mapping and disaster preparedness platform for the Philippines.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-6 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
        <LiveToasts />
        <footer className="border-t border-white/30 backdrop-blur-xl py-6 text-center text-xs text-slate-600" style={{ background: 'rgba(255, 252, 250, 0.85)' }}>
          <div className="font-semibold mb-2">HAZARDLINK — Demonstration System</div>
          <p className="text-slate-500">All hazard & alert data is simulated for demonstration purposes.</p>
          <div className="mt-3 flex justify-center gap-3 flex-wrap">
            <a href="https://phivolcs.dost.gov.ph" className="text-purple-600 hover:text-purple-700 font-semibold underline transition-colors">PHIVOLCS</a>
            <span className="text-slate-300">•</span>
            <a href="https://pagasa.dost.gov.ph" className="text-purple-600 hover:text-purple-700 font-semibold underline transition-colors">PAGASA</a>
            <span className="text-300">•</span>
            <a href="https://ndrrmc.gov.ph" className="text-purple-600 hover:text-purple-700 font-semibold underline transition-colors">NDRRMC</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
