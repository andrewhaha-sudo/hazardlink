"use client";
/**
 * HAZARDLINK — Login page (system)
 */
import { useState } from 'react';
import { api } from '../../lib/api';
import { saveToken, removeToken } from '../../lib/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Mail, Lock, AlertTriangle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('admin@sanrafael.edu.ph');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.login(email, password);
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Login failed'); setLoading(false); return; }
      saveToken(data.token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="glass-panel">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-2xl font-black shadow-xl">
              H
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">HAZARDLINK</div>
              <div className="text-sm text-slate-600 font-semibold">School Disaster Response</div>
            </div>
          </div>
          {error && (
            <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm border border-red-100">
              <AlertTriangle size={16} className="mr-2 mt-0.5" /> {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">Email</label>
              <input
                className="w-full px-4 py-3 border-2 border-white/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all font-medium"
                style={{ background: 'rgba(255, 255, 255, 0.7)' }}
                value={email} onChange={(e) => setEmail(e.target.value)} type="email" required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">Password</label>
              <input
                className="w-full px-4 py-3 border-2 border-white/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all font-medium"
                style={{ background: 'rgba(255, 255, 255, 0.7)' }}
                value={password} onChange={(e) => setPassword(e.target.value)} type="password" required
              />
              <p className="text-xs text-slate-500 mt-2 font-medium">Demo system: any password is accepted</p>
            </div>
            <button
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-60 text-white text-base font-black px-6 py-4 rounded-2xl transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className="mt-8 pt-6 border-t border-white/30 text-center">
            <p className="text-sm font-bold text-slate-700 mb-3">Demo Accounts</p>
            <ul className="text-xs text-slate-600 space-y-2 font-medium">
              <li className="p-2 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.5)' }}>admin@sanrafael.edu.ph (Administrator)</li>
              <li className="p-2 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.5)' }}>teacher1@sanrafael.edu.ph (Teacher)</li>
              <li className="p-2 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.5)' }}>student1@sanrafael.edu.ph (Student)</li>
              <li className="p-2 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.5)' }}>responder1@ndrrmc.gov.ph (Responder)</li>
            </ul>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-slate-500">
                  </p>
      </div>
    </div>
  );
}
