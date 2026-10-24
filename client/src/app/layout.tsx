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
        <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
          HAZARDLINK — system. All hazard & alert data is OFFICIAL for demonstration.
          Use official sources: <a href="https://phivolcs.dost.gov.ph" className="text-slate-700 underline">PHIVOLCS</a> •
          <a href="https://pagasa.dost.gov.ph" className="text-slate-700 underline">PAGASA</a> •
          <a href="https://ndrrmc.gov.ph" className="text-slate-700 underline">NDRRMC</a>.
        </footer>
      </body>
    </html>
  );
}
