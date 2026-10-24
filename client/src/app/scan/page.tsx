"use client";
import { useState, useMemo } from 'react';
import { CAMPUS_BUILDINGS, CAMPUS_ROOMS } from '../../lib/campusData';
import { api } from '../../lib/api';
import { Camera, CheckCircle2, AlertTriangle, MapPin, ClipboardList, Shield, ChevronRight, ChevronLeft } from 'lucide-react';

const STEPS = ['Select room','Capture','AI analysis','Review findings','Pin to map','Save & monitor'];

const AI_FINDINGS: Record<string, {desc:string; sev:string; conf:number}[]> = {
  default: [
    { desc: 'Blocked exit pathway near doorway', sev: 'high', conf: 0.82 },
    { desc: 'Exposed wiring near electrical panel', sev: 'moderate', conf: 0.74 },
    { desc: 'Clutter obstructing corridor', sev: 'low', conf: 0.61 },
  ],
};

export default function ScanPage() {
  const [step, setStep] = useState(0);
  const [buildingId, setBuildingId] = useState(CAMPUS_BUILDINGS[0].id);
  const [roomId, setRoomId] = useState(CAMPUS_ROOMS[0].id);
  const [captured, setCaptured] = useState<string[]>([]);
  const [findings, setFindings] = useState<{desc:string;sev:string;conf:number;status:'pending'|'confirmed'|'rejected'}[]>([]);
  const [pins, setPins] = useState<{x:number;y:number;label:string}[]>([]);
  const [saved, setSaved] = useState(false);
  const [scanStatus, setScanStatus] = useState<Record<string,string>>({});

  const building = CAMPUS_BUILDINGS.find(b=>b.id===buildingId)!;
  const rooms = CAMPUS_ROOMS.filter(r=>r.buildingId===buildingId);
  const room = CAMPUS_ROOMS.find(r=>r.id===roomId)!;

  const coverage = useMemo(() => {
    const total = CAMPUS_ROOMS.length;
    const done = Object.values(scanStatus).filter(v=>v==='scanned').length;
    return Math.round((done/total)*100);
  }, [scanStatus]);

  const capture = (label:string) => {
    setCaptured(prev => prev.includes(label) ? prev : [...prev, label]);
  };
  const analyze = () => {
    setFindings(AI_FINDINGS.default.map(f=>({...f,status:'pending' as const})));
    setStep(3);
  };
  const confirm = (i:number) => setFindings(prev => prev.map((f,idx)=> idx===i?{...f,status:'confirmed'}:f));
  const reject = (i:number) => setFindings(prev => prev.map((f,idx)=> idx===i?{...f,status:'rejected'}:f));
  const addPin = () => {
    const f = findings.find(x=>x.status==='confirmed' && !pins.some(p=>p.label===x.desc));
    if (f) setPins(prev=>[...prev,{x:20+prev.length*15,y:30+prev.length*10,label:f.desc}]);
  };
  const save = async () => {
    setScanStatus(prev=>({...prev,[roomId]:'scanned'}));
    try {
      await api.createInspection({
        roomId: room.id,
        buildingId: building.id,
        floor: room.floor,
        captures: captured,
        findings: findings.map(f=>({
          description: f.desc,
          severity: f.sev==='high'?'High':f.sev==='moderate'?'Medium':'Low',
          category: 'Other',
          confirmed: f.status==='confirmed',
          confidence: f.conf,
        })),
        status: 'Completed',
        hazardsPinned: pins,
      });
    } catch (e) {
      console.warn('Inspection save failed (offline?)', e);
    }
    setSaved(true);
  };
  const reset = () => { setStep(0); setCaptured([]); setFindings([]); setPins([]); setSaved(false); };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Camera className="text-blue-600"/> Room-by-Room Hazard Scanning</h1>
        <p className="text-slate-600">Scan one room at a time. AI proposes hazards; inspector confirms, rejects, or edits.</p>
      </div>
        {/* Progress overview */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-900">Whole-school scan coverage</h3>
          <span className="text-sm font-bold text-slate-900">{coverage}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 transition-all" style={{width:`${coverage}%`}} />
        </div>
        <p className="text-xs text-slate-500 mt-1">{Object.values(scanStatus).filter(v=>v==='scanned').length} / {CAMPUS_ROOMS.length} rooms scanned this session</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {STEPS.map((s,i)=>(
          <div key={s} className={`flex items-center gap-1 shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${i===step?'bg-slate-900 text-white': i<step?'bg-green-100 text-green-700':'bg-slate-100 text-slate-500'}`}>
            {i<step && <CheckCircle2 size={12}/>}{s}
          </div>
        ))}
      </div>

      <div className="card space-y-4">
        {step===0 && (
          <>
            <h3 className="font-semibold text-slate-900">01 Select building and room</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Building</label>
                <select value={buildingId} onChange={e=>{setBuildingId(e.target.value); setRoomId(CAMPUS_ROOMS.find(r=>r.buildingId===e.target.value)!.id);}} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white">
                  {CAMPUS_BUILDINGS.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Room</label>
                <select value={roomId} onChange={e=>setRoomId(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white">
                  {rooms.map(r=><option key={r.id} value={r.id}>{r.name} — {r.type}</option>)}
                </select>
              </div>
            </div>
            <div className="p-3 rounded bg-slate-50 text-sm text-slate-600">
              <div className="font-medium text-slate-900">{room.name}</div>
              <div className="text-xs">ID: {room.id} · {building.name} · Floor {room.floor} · {room.type}</div>
              <div className="text-xs mt-1">Last scan: {room.lastScan ?? 'Never'} · Score: {room.safetyScore}/100 · Status: {room.scanStatus}</div>
            </div>
            <button onClick={()=>setStep(1)} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium flex items-center gap-2">Next <ChevronRight size={16}/></button>
          </>
        )}
        {step===1 && (
          <>
            <h3 className="font-semibold text-slate-900">02 Capture the room</h3>
            <p className="text-sm text-slate-600">Follow prompts to photograph entrance, exits, walls, ceiling, electrical areas.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['Entrance','Exit A','Wall (N)','Wall (S)','Ceiling','Electrical panel'].map(label=>(
                <button key={label} onClick={()=>capture(label)} className={`p-4 rounded-lg border text-sm flex flex-col items-center gap-2 ${captured.includes(label)?'border-green-400 bg-green-50 text-green-700':'border-slate-200 bg-white text-slate-600 hover:border-slate-400'}`}>
                  <Camera size={20}/>{label}{captured.includes(label)&&<CheckCircle2 size={14}/>}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500">Captured: {captured.length}/6</p>
            <div className="flex gap-2">
              <button onClick={()=>setStep(0)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm flex items-center gap-2"><ChevronLeft size={16}/> Back</button>
              <button onClick={analyze} disabled={captured.length<3} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2">Run AI analysis <ChevronRight size={16}/></button>
            </div>
          </>
        )}
        {step===2 && <p className="text-sm text-slate-500">Analyzing...</p>}
        {step===3 && (
          <>
            <h3 className="font-semibold text-slate-900">03/04 AI findings — review</h3>
            <p className="text-sm text-slate-600">Computer vision proposes hazards with confidence scores. Confirm, reject, or edit.</p>
            <div className="space-y-2">
              {findings.map((f,i)=>(
                <div key={i} className={`p-3 rounded-lg border ${f.status==='confirmed'?'border-green-300 bg-green-50':f.status==='rejected'?'border-slate-200 bg-slate-50 opacity-60':'border-amber-200 bg-amber-50'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium text-slate-900">{f.desc}</div>
                      <div className="text-xs text-slate-500">Severity: {f.sev} · Confidence: {Math.round(f.conf*100)}% {f.conf<0.7 && '· Uncertain (flagged for manual inspection)'}</div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={()=>confirm(i)} className="px-2 py-1 text-xs rounded bg-green-600 text-white">Confirm</button>
                      <button onClick={()=>reject(i)} className="px-2 py-1 text-xs rounded bg-slate-300 text-slate-700">Reject</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={()=>setStep(1)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm flex items-center gap-2"><ChevronLeft size={16}/> Back</button>
              <button onClick={()=>setStep(4)} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium flex items-center gap-2">Pin to map <ChevronRight size={16}/></button>
            </div>
          </>
        )}
        {step===4 && (
          <>
            <h3 className="font-semibold text-slate-900">05 Pin hazards to room map</h3>
            <p className="text-sm text-slate-600">Place confirmed findings at approximate positions on the floor plan.</p>
            <div className="relative w-full h-48 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">Room floor plan (official)</div>
              {pins.map((p,i)=>(
                <div key={i} className="absolute w-3 h-3 bg-red-500 rounded-full border-2 border-white" style={{left:`${p.x}%`, top:`${p.y}%`}} title={p.label}/>
              ))}
            </div>
            <button onClick={addPin} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium">Add pin for next confirmed finding</button>
            <p className="text-xs text-slate-500">Pins: {pins.length}</p>
            <div className="flex gap-2">
              <button onClick={()=>setStep(3)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm flex items-center gap-2"><ChevronLeft size={16}/> Back</button>
              <button onClick={()=>setStep(5)} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium flex items-center gap-2">Save <ChevronRight size={16}/></button>
            </div>
          </>
        )}
        {step===5 && (
          <>
            <h3 className="font-semibold text-slate-900">06 Save and monitor</h3>
            {!saved ? (
              <>
                <div className="p-3 rounded bg-slate-50 text-sm text-slate-600 space-y-1">
                  <div>Room: {room.name} ({room.id})</div>
                  <div>Building: {building.name} · Floor {room.floor}</div>
                  <div>Captured photos: {captured.length}</div>
                  <div>Confirmed hazards: {findings.filter(f=>f.status==='confirmed').length}</div>
                  <div>Pins: {pins.length}</div>
                  <div>Inspector: current user · Date: {new Date().toLocaleString()}</div>
                </div>
                <button onClick={save} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium flex items-center gap-2"><CheckCircle2 size={16}/> Save inspection</button>
              </>
            ) : (
              <div className="p-4 rounded bg-green-50 border border-green-200 text-green-800 text-sm">
                <div className="font-semibold">Inspection saved.</div>
                <p className="mt-1">Status updated to scanned. Correction tracking and recurring inspection scheduling available in room record.</p>
                <button onClick={reset} className="mt-3 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm">Scan another room</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Room scan status legend */}
      <div className="card">
        <h3 className="text-sm font-semibold text-slate-900 mb-2">Room scan progress (this session)</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
          {['unscanned','in_progress','scanned','awaiting_verification','overdue'].map(s=>(
            <div key={s} className="p-2 rounded bg-slate-50 text-center">
              <div className="font-medium text-slate-700">{s.replace('_',' ')}</div>
              <div className="text-slate-500">{CAMPUS_ROOMS.filter(r=>r.scanStatus===s).length + (Object.values(scanStatus).filter(v=>v===s).length)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
