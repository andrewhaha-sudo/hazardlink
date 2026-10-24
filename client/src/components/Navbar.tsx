"use client";
import Link from 'next/link';
import { useState } from 'react';
import {
  Shield, MapPin, AlertTriangle, Route, Users, ClipboardList, HelpCircle,
  Bell, GraduationCap, Settings, LogOut, Menu, X,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Shield },
  { href: '/map', label: 'Live Hazard Map', icon: MapPin },
  { href: '/alerts', label: 'Disaster Alerts', icon: AlertTriangle },
  { href: '/routes', label: 'Evacuation Routes', icon: Route },
  { href: '/people', label: 'People & Accountability', icon: Users },
  { href: '/report', label: 'Report a Hazard', icon: ClipboardList },
  { href: '/scan', label: 'Room Scanning', icon: ClipboardList },
  { href: '/verify', label: 'Hazard Verification', icon: Shield },
  { href: '/disasters', label: 'Disaster Monitor', icon: AlertTriangle },
  { href: '/sos', label: 'Emergency SOS', icon: HelpCircle },
  { href: '/announcements', label: 'School Announcements', icon: Bell },
  { href: '/drills', label: 'Preparedness Drills', icon: GraduationCap },
  { href: '/settings', label: 'Settings & Privacy', icon: Settings },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/30" style={{ background: 'rgba(255, 252, 250, 0.85)' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center gap-2.5 font-black text-slate-900 shrink-0 hover:scale-105 transition-transform">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-sm shadow-lg">
              H
            </div>
            <span className="tracking-tight hidden sm:inline text-lg">HAZARDLINK</span>
          </Link>
          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1.5 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl text-slate-700 hover:text-slate-900 whitespace-nowrap transition-all hover:bg-white/60 hover:shadow-sm"
                >
                  <Icon size={14} />
                  {item.label}
                </Link>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-2 text-slate-700 hover:bg-white/60 rounded-xl transition-all"
              aria-label="Open menu"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-white/30" style={{ background: 'rgba(255, 252, 250, 0.95)' }}>
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl text-slate-700 hover:bg-white/70 hover:text-slate-900 transition-all"
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-4 border-t border-white/30">
              <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50/80 rounded-xl transition-all" onClick={() => setOpen(false)}>
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
