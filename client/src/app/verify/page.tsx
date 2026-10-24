"use client";
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { CheckCircle2, XCircle, Clock, Shield } from 'lucide-react';

export default function VerifyPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [filter, setFilter] = useState('Pending Verification');
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.getHazardReports({ status: filter }).then(r=>r.json()).then(d=>{ setReports(d.reports||[]); setLoading(false); }).catch(()=>setLoading(false));
  };
  useEffect(load, [filter]);

  const updateStatus = async (id:string, status:string) => {
    try { await api.updateHazardReportStatus(id, status); } catch (e) { console.warn(e); }
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Shield className="text-blue-600"/> Hazard Verification Queue</h1>
        <p className="text-slate-600">Inspectors review community and AI-proposed hazards. Unverified items remain distinct.</p>
      </div>
        <div className="flex gap-2">
        {['Pending Verification','Verified','Resolved','Rejected'].map(s=>(
          <button key={s} onClick={()=>{setFilter(s);setLoading(true);}} className={`px-3 py-1.5 text-xs rounded-lg border ${filter===s?'bg-slate-900 text-white border-slate-900':'bg-white text-slate-600 border-slate-200'}`}>{s}</button>
        ))}
      </div>
      <div className="card">
        {loading ? <p className="text-sm text-slate-500">Loading...</p> : reports.length===0 ? <p className="text-sm text-slate-500">No reports in this status.</p> : (
          <div className="space-y-3">
            {reports.map(r=>(
              <div key={r.id} className="p-3 rounded-lg border border-slate-200">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-medium text-slate-900 text-sm">{r.type} · {r.severity}</div>
                    <p className="text-xs text-slate-600 mt-1">{r.description}</p>
                    <div className="text-xs text-slate-400 mt-1">Reporter: {r.reporterName || r.reporterId || 'anonymous'} · {new Date(r.createdAt).toLocaleString()}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded ${r.status==='Verified'?'bg-green-100 text-green-700':r.status==='Rejected'?'bg-red-100 text-red-700':r.status==='Resolved'?'bg-blue-100 text-blue-700':'bg-amber-100 text-amber-700'}`}>{r.status}</span>
                </div>
                {filter==='Pending Verification' && (
                  <div className="flex gap-2 mt-3">
                    <button onClick={()=>updateStatus(r.id,'Verified')} className="px-3 py-1.5 text-xs rounded bg-green-600 text-white flex items-center gap-1"><CheckCircle2 size={12}/> Verify</button>
                    <button onClick={()=>updateStatus(r.id,'Rejected')} className="px-3 py-1.5 text-xs rounded bg-red-600 text-white flex items-center gap-1"><XCircle size={12}/> Reject</button>
                    <button onClick={()=>updateStatus(r.id,'Resolved')} className="px-3 py-1.5 text-xs rounded bg-blue-600 text-white flex items-center gap-1"><Clock size={12}/> Resolve</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
