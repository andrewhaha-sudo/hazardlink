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
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-slate-900 shrink-0">
            <span className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center text-white text-xs">H</span>
            <span className="tracking-tight hidden sm:inline">HAZARDLINK</span>
          </Link>
          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 whitespace-nowrap"
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
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              aria-label="Open menu"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm rounded-lg text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-4 border-t border-slate-100">
              <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg" onClick={() => setOpen(false)}>
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
