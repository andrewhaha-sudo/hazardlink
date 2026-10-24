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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded bg-slate-900 flex items-center justify-center text-white text-xl">H</div>
            <div>
              <div className="text-xl font-bold text-slate-900">HAZARDLINK</div>
              <div className="text-xs text-slate-500">School Disaster Response — Sign In</div>
            </div>
          </div>
          {error && (
            <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm border border-red-100">
              <AlertTriangle size={16} className="mr-2 mt-0.5" /> {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                value={email} onChange={(e) => setEmail(e.target.value)} type="email" required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                value={password} onChange={(e) => setPassword(e.target.value)} type="password" required
              />
              <p className="text-xs text-slate-500 mt-1">system: any password is accepted</p>
            </div>
            <button
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-sm font-semibold px-4 py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className="mt-6 pt-4 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-500">Demo accounts:</p>
            <ul className="text-xs text-slate-400 space-y-1 mt-1">
              <li>admin@sanrafael.edu.ph (Administrator)</li>
              <li>teacher1@sanrafael.edu.ph (Teacher)</li>
              <li>student1@sanrafael.edu.ph (Student)</li>
              <li>responder1@ndrrmc.gov.ph (Emergency Responder)</li>
            </ul>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-slate-500">
                  </p>
      </div>
    </div>
  );
}
