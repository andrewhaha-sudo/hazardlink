"use client";
import { useEffect, useState } from 'react';

type Toast = { id: number; title: string; message: string; kind: 'info' | 'warn' | 'success' };

export default function LiveToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: any = null;
    const connect = () => {
      try {
        const wsUrl = process.env.NEXT_PUBLIC_WS_BASE || 'ws://localhost:5000/ws';
        ws = new WebSocket(wsUrl);
        ws.onmessage = (ev) => {
          try {
            const msg = JSON.parse(ev.data);
            let title = 'Live update';
            let message = msg.type || 'Update received';
            let kind: Toast['kind'] = 'info';
            if (msg.type === 'NEW_HAZARD_REPORT') { title = 'New hazard report'; message = msg.payload?.type + ' · ' + msg.payload?.severity; kind = 'warn'; }
            else if (msg.type === 'NEW_INSPECTION') { title = 'Inspection saved'; message = msg.payload?.roomId + ' scanned'; kind = 'success'; }
            else if (msg.type === 'NEW_SOS') { title = 'SOS request'; message = msg.payload?.category; kind = 'warn'; }
            else if (msg.type === 'CONNECTED') { title = 'Live updates'; message = 'Connected to HAZARDLINK'; kind = 'success'; }
            const t: Toast = { id: Date.now() + Math.random(), title, message, kind };
            setToasts(prev => [t, ...prev].slice(0, 4));
            setTimeout(() => setToasts(prev => prev.filter(x => x.id !== t.id)), 4500);
          } catch {}
        };
        ws.onclose = () => { reconnectTimer = setTimeout(connect, 3000); };
      } catch {}
    };
    connect();
    return () => { if (ws) ws.close(); if (reconnectTimer) clearTimeout(reconnectTimer); };
  }, []);

  const color = (k: Toast['kind']) => k === 'warn' ? 'border-amber-300 bg-amber-50' : k === 'success' ? 'border-green-300 bg-green-50' : 'border-slate-200 bg-white';

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 w-80">
      {toasts.map(t => (
        <div key={t.id} className={`rounded-lg border shadow-lg p-3 ${color(t.kind)} animate-pulse`}>
          <div className="text-sm font-semibold text-slate-900">{t.title}</div>
          <div className="text-xs text-slate-600">{t.message}</div>
        </div>
      ))}
    </div>
  );
}