import React, { useEffect, useMemo, useState } from "react";

/* ===================== Helpers (local time safe) ===================== */
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// Date -> "YYYY-MM-DDTHH:mm" (local)
const toLocalISO = (d) => {
  const dt = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return dt.toISOString().slice(0, 16);
};
// "YYYY-MM-DDTHH:mm" -> Date (local)
function parseLocal(dateStr) {
  if (!dateStr) return null;
  const [y, m, rest] = dateStr.split("-");
  const [d, time = "00:00"] = rest.split("T");
  const [hh, mm] = time.split(":");
  return new Date(+y, +m - 1, +d, +hh, +mm, 0, 0);
}
// YYYY-MM-DD (local)
const ymd = (val) => {
  const dt = typeof val === "string" ? parseLocal(val) : new Date(val);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};
function fmtTime(dateStr) {
  if (!dateStr) return "";
  const d = parseLocal(dateStr);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
function startOfWeek(date, weekStartsOn = 1) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun ... 6=Sat
  const diff = (day === 0 ? 7 : day) - weekStartsOn;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(date, n) { const d = new Date(date); d.setDate(d.getDate() + n); return d; }
function fmtDate(d) { const dd = d.getDate().toString().padStart(2, "0"); const mm = (d.getMonth()+1).toString().padStart(2, "0"); return `${dd}.${mm}`; }
const HOURS = Array.from({ length: 24 }, (_, i) => i);

// Board geometry & drag helpers
const ROW_H = 48;               // 1 saat yüksekliği (px)
const SNAP_MIN = 15;            // yakalama dakikası
function snapMinutes(m, step = SNAP_MIN) { return Math.round(m / step) * step; }
function posToTime(day, e) {
  const rect = e.currentTarget.getBoundingClientRect();
  const y = e.clientY - rect.top;
  const totalMin = Math.max(0, Math.min(24 * 60, Math.round((y / ROW_H) * 60)));
  const hh = Math.floor(totalMin / 60);
  const mm = snapMinutes(totalMin % 60);
  const d = new Date(day); d.setHours(hh, mm, 0, 0);
  return d;
}
function fmtHM(d) { return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; }
function addOneHourSameDay(d) {
  const end = new Date(d); end.setHours(end.getHours() + 1); end.setMinutes(0,0,0);
  const endOfDay = new Date(d); endOfDay.setHours(23, 59, 0, 0);
  return end > endOfDay ? endOfDay : end;
}
function eventRange(it) {
  const s = parseLocal(it.start);
  const e = it.end ? parseLocal(it.end) : new Date(s.getTime() + 60*60*1000);
  return [s, e];
}
function overlapsDay(it, day) {
  const [s, e] = eventRange(it);
  const dayStart = new Date(day); dayStart.setHours(0,0,0,0);
  const dayEnd   = new Date(day); dayEnd.setHours(23,59,0,0);
  return s < dayEnd && e > dayStart;
}
function handleDoubleClickDay(e, day, quickAddAt) {
  const rect = e.currentTarget.getBoundingClientRect();
  const y = e.clientY - rect.top;
  const hour = Math.max(0, Math.min(23, Math.floor(y / ROW_H)));
  quickAddAt(day, hour);
}
/* ===================== Data schema ===================== */
const CATEGORIES = [
  { value: "yemek", label: "Yemek", badge: "bg-rose-100 text-rose-700 border-rose-200" },
  { value: "yol", label: "Yol", badge: "bg-sky-100 text-sky-700 border-sky-200" },
  { value: "tur", label: "Tur", badge: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { value: "alisveris", label: "Alışveriş", badge: "bg-amber-100 text-amber-800 border-amber-200" },
   { value: "ucak", label: "Uçak", badge: "bg-cyan-100 text-cyan-700 border-cyan-200" },
  { value: "otel", label: "Otel", badge: "bg-lime-100 text-lime-700 border-lime-200" },
  { value: "pub", label: "Pub", badge: "bg-purple-100 text-purple-700 border-purple-200" },
];
const STATUS = [
  { value: "todo", label: "Yapılacak", dot: "bg-slate-400" },
  { value: "done", label: "Tamamlandı", dot: "bg-emerald-600" },
  { value: "postponed", label: "Ertelendi", dot: "bg-amber-500" },
  { value: "cancelled", label: "İptal edildi", dot: "bg-rose-600" },
];
const DEFAULT_ITEM = {
  id: "",
  title: "",
  category: "otel",
  status: "todo",
  start: "",
  end: "",
  notes: "",
  tripId: "",
  cost: "",
  currency: "",
  // çoklu konumlar (label + url)
  mapLinks: [],     // [{ label: string, url: string }]
  // eski tekli alanlar (opsiyonel, geriye uyum için)
  mapUrl: "",
  url: "",
};
const STORAGE_KEY = "planner.items.v2";
const TRIPS_KEY = "planner.trips.v1";
const SELECTED_TRIP_KEY = "planner.selectedTripId";

/* ===================== Component ===================== */
export default function PlannerApp() {
  // Items
  const [items, setItems] = useState(() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; } });
  // tekli mapUrl varsa mapLinks'e taşı
useEffect(() => {
  setItems(prev => prev.map(it => {
    if (Array.isArray(it.mapLinks)) return it;
    if (it.mapUrl) {
      return { ...it, mapLinks: [{ label: "Harita", url: it.mapUrl }], mapUrl: "" };
    }
    return { ...it, mapLinks: [] };
  }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }, [items]);

  // View & date
  const [view, setView] = useState("list"); // list | week
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const weekStart = useMemo(() => startOfWeek(selectedDate, 1), [selectedDate]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  // Plan modal & draft
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ ...DEFAULT_ITEM });

  // Drag & resize state
  const [draggingId, setDraggingId] = useState(null);
  const [ghostPos, setGhostPos] = useState(null); // { dayIndex, topPx, heightPx, label }
  const [resizing, setResizing] = useState(null); // { id, edge: 'start'|'end', dayIndex }

  // Trips
  const [trips, setTrips] = useState(() => { try { return JSON.parse(localStorage.getItem(TRIPS_KEY)) || []; } catch { return []; } });
  const [selectedTripId, setSelectedTripId] = useState(() => { try { return localStorage.getItem(SELECTED_TRIP_KEY) || "all"; } catch { return "all"; } });
  useEffect(() => { localStorage.setItem(TRIPS_KEY, JSON.stringify(trips)); }, [trips]);
  useEffect(() => { localStorage.setItem(SELECTED_TRIP_KEY, selectedTripId); }, [selectedTripId]);

  // Trip helpers
  function tripMeta(id){ return (trips || []).find(t=>t.id===id); }
  function currencyOf(id){ const t=tripMeta(id); return (t && t.currency) || "THB"; }
  function fmtMoney(v, curr){
    const n = Number(v);
    if(!isFinite(n) || n===0) return null;
    return `${n.toLocaleString(undefined,{minimumFractionDigits:0, maximumFractionDigits:2})} ${curr}`;
  }

  // Derived lists & totals
  const displayItems = useMemo(() => items.filter(it => selectedTripId === 'all' || it.tripId === selectedTripId), [items, selectedTripId]);
  const sortedItems = useMemo(() => [...displayItems].sort((a, b) => (a.start || "").localeCompare(b.start || "")), [displayItems]);
  const totalCost = useMemo(() => displayItems.reduce((sum, it) => sum + (parseFloat(it.cost) || 0), 0), [displayItems]);
  const totalsByCat = useMemo(()=>{
  const acc = {};
  for (const c of CATEGORIES) acc[c.value] = 0;
  for (const it of displayItems) {
    if (acc[it.category] == null) acc[it.category] = 0;
    acc[it.category] += (parseFloat(it.cost) || 0);
  }
  return acc;
}, [displayItems]);
const selectedTrip = trips.find(t => t.id === selectedTripId);

  // CRUD: open, edit, save, remove
  function openCreate(initial = {}) {
    const startDate = initial.start ? new Date(initial.start) : new Date();
    const endDefault = addOneHourSameDay(startDate);
    const tId = selectedTripId !== "all" ? selectedTripId : (initial.tripId || "");
    setDraft({
      ...DEFAULT_ITEM,
      ...initial,
      id: "",
      tripId: tId,
      currency: currencyOf(tId),
      start: toLocalISO(startDate),
      end: toLocalISO(endDefault),
    });
    setShowForm(true);
  }
  function editItem(it){ setDraft({ ...DEFAULT_ITEM, ...it }); setShowForm(true); }
  function saveDraft(){
    if(!draft.title.trim()){ alert("Başlık zorunlu"); return; }
    const newItem = {
      ...draft,
      id: draft.id || uid(),
      currency: draft.currency || currencyOf(draft.tripId),
    };
    if (!newItem.tripId && selectedTripId !== "all") {
      newItem.tripId = selectedTripId;
      if (!newItem.currency) newItem.currency = currencyOf(selectedTripId);
    }
    setItems(prev => {
      const i = prev.findIndex(x => x.id === newItem.id);
      if (i >= 0) { const cp = [...prev]; cp[i] = newItem; return cp; }
      return [...prev, newItem];
    });
    setShowForm(false); setDraft({ ...DEFAULT_ITEM });
  }
  function removeItem(id){ if(!confirm("Silinsin mi?")) return; setItems(prev => prev.filter(x => x.id !== id)); }
  function quickAddAt(day, hour){
    const title = prompt(`Başlık (${fmtDate(day)} ${String(hour).padStart(2,'0')}:00)`);
    if(!title) return;
    const d = new Date(day); d.setHours(hour,0,0,0);
    const end = addOneHourSameDay(d);
    const tId = selectedTripId !== "all" ? selectedTripId : "";
    const item = { ...DEFAULT_ITEM, id: uid(), title, tripId: tId, currency: currencyOf(tId), start: toLocalISO(d), end: toLocalISO(end) };
    setItems(p => [...p, item]);
  }

  // Trip modal state & handlers
  const [showTripModal, setShowTripModal] = useState(false);
  const [tripDraft, setTripDraft] = useState({ id: "", name: "", currency: "THB" });
  function openTripCreate(){ setTripDraft({ id:"", name:"", currency:"THB" }); setShowTripModal(true); }
  function editTrip(t){ setTripDraft({ ...t }); setShowTripModal(true); }
  function saveTrip(){
    if(!tripDraft.name?.trim()){ alert("Gezi adı zorunlu"); return; }
    const t = { ...tripDraft, id: tripDraft.id || uid() };
    setTrips(prev=>{
      const i = prev.findIndex(x=>x.id===t.id);
      if(i>=0){ const cp=[...prev]; cp[i]=t; return cp; }
      return [...prev, t];
    });
    setSelectedTripId(t.id);
    setShowTripModal(false);
  }
  function removeTrip(id){
    if(!confirm("Bu gezi silinsin mi? (Planlar silinmez, gezisiz kalır)")) return;
    setTrips(prev=> prev.filter(x=>x.id!==id));
    setItems(prev=> prev.map(it=> it.tripId===id ? ({ ...it, tripId:"" }) : it));
    setSelectedTripId("all");
  }

  // UI helpers
  const catMeta = (val)=> CATEGORIES.find(c=>c.value===val) || CATEGORIES[0];
  const statusMeta = (val)=> STATUS.find(s=>s.value===val) || STATUS[0];

  /* ===================== Render ===================== */
  return (
    <div className="p-4 max-w-6xl mx-auto">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">Planlayıcı</h1>

        {/* NAV: Görünüm + Gezi seçici + Özet */}
        <nav className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <button onClick={()=>setView('list')} className={`px-3 py-2 rounded-xl border ${view==='list'?'bg-indigo-600 text-white':'bg-white'}`}>Liste</button>
            <button onClick={()=>setView('week')} className={`px-3 py-2 rounded-xl border ${view==='week'?'bg-indigo-600 text-white':'bg-white'}`}>Haftalık Board</button>
            <button onClick={()=>openCreate({ start:new Date() })} className="px-3 py-2 rounded-xl bg-green-600 text-white">+ Yeni</button>
          </div>

          <div className="flex items-center gap-2 md:ml-auto">
            <label className="text-sm text-slate-600">Gezi:</label>
            <select value={selectedTripId} onChange={(e)=> setSelectedTripId(e.target.value)} className="px-3 py-2 rounded-xl border">
              <option value="all">Tüm geziler</option>
              {trips.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <button onClick={openTripCreate} className="px-3 py-2 rounded-xl border bg-white hover:bg-slate-50">+ Gezi</button>

            <div className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 text-sm">
              {displayItems.length} plan
              {selectedTripId!=="all" && (<> · Toplam {fmtMoney(totalCost, selectedTrip?.currency || "THB")}</>)}
            </div>
            {selectedTripId!=='all' && (
  <div className="flex flex-wrap gap-1">
    {CATEGORIES.map((c) => {
  const val = totalsByCat[c.value];
  if (!val) return null;
  return (
    <span
      key={c.value}
      className={`px-2 py-0.5 rounded border text-xs ${c.badge}`}
    >
      {c.label} · {fmtMoney(val, selectedTrip?.currency || 'THB')}
    </span>
  );
})}
  </div>
)}
          </div>
        </nav>
      </header>

      {/* LISTE */}
      {view==='list' && (
        <section className="mt-6 grid grid-cols-1 gap-3">
          {sortedItems.length===0 && (<div className="border border-dashed rounded-2xl p-8 text-center text-slate-500">Henüz kayıt yok. "+ Yeni" ile ekleyebilirsin.</div>)}
          {sortedItems.map((it)=>(
            <article key={it.id} className="rounded-2xl border bg-white p-4 grid grid-cols-[1fr_auto] items-start gap-3 shadow-sm">
              <div className="flex items-start gap-2 flex-wrap min-w-0">
                {/* Kategori */}
                <div className={`px-2 py-1 rounded-lg border text-xs ${catMeta(it.category).badge}`}>{catMeta(it.category).label}</div>
                {/* Gezi etiketi */}
                {it.tripId && (
                  <div className="px-2 py-1 rounded-lg border text-xs bg-violet-100 text-violet-700 border-violet-200">
                    {tripMeta(it.tripId)?.name || "Gezi"}
                  </div>
                )}
                {/* Başlık & detaylar */}
                <div className="min-w-0">
                  <h3 className="font-medium">{it.title}</h3>
                  <div className="text-xs text-slate-500 mt-1 flex gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-mono">{fmtTime(it.start)}{it.end?`→${fmtTime(it.end)}`:''} · {ymd(it.start)}</span>
                    {(it.mapLinks && it.mapLinks.length > 0) && (
  <>
    {it.mapLinks.slice(0, 3).map((ml, i) => (
      <a
        key={i}
        href={ml.url}
        target="_blank"
        rel="noreferrer"
        className="px-2 py-0.5 rounded bg-slate-100 underline underline-offset-2"
        title="Haritada aç"
      >
        📍 {ml.label || `Harita ${i+1}`}
      </a>
    ))}
    {it.mapLinks.length > 3 && (
      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600">
        +{it.mapLinks.length - 3} daha
      </span>
    )}
  </>
)}

                    <span className="px-2 py-0.5 rounded bg-slate-100 flex items-center gap-1">
                      <i className={`inline-block w-2 h-2 rounded-full ${statusMeta(it.status).dot}`}></i> {statusMeta(it.status).label}
                    </span>
                    {fmtMoney(it.cost, it.currency) && (
                      <span className="px-2 py-0.5 rounded bg-slate-100">💸 {fmtMoney(it.cost, it.currency)}</span>
                    )}
                    {/* Linkler */}
<div className="mt-0.5 flex items-center gap-2 text-[10px] flex-wrap">
  {(it.mapLinks || []).slice(0, 2).map((ml, i) => (
    <a key={i} href={ml.url} target="_blank" rel="noreferrer" className="underline underline-offset-2">
      📍 {ml.label || `Harita ${i+1}`}
    </a>
  ))}
  {it.mapLinks && it.mapLinks.length > 2 && (
    <span>+{it.mapLinks.length - 2}</span>
  )}
  {it.url && (
    <a href={it.url} target="_blank" rel="noreferrer" className="underline underline-offset-2">
      🔗 Link
    </a>
  )}
</div>


                  </div>
                  {it.url && (
  <a
    href={it.url}
    target="_blank"
    rel="noreferrer"
    className="px-2 py-0.5 rounded bg-slate-100 underline underline-offset-2"
    title="Dış bağlantı"
  >
    🔗 Link
  </a>
)}

                  {it.notes && <div className="text-xs text-slate-600 mt-1">🗒️ {it.notes}</div>}
                </div>
              </div>
              <div className="flex items-center gap-2 justify-self-end">
                <button className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200" onClick={()=>editItem(it)}>Düzenle</button>
                <button className="px-3 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100" onClick={()=>removeItem(it.id)}>Sil</button>
              </div>
            </article>
          ))}
        </section>
      )}

      {/* BOARD */}
      {view==='week' && (
        <section className="mt-6">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 rounded-xl border" onClick={()=>setSelectedDate(addDays(weekStart,-7))}>← Önceki</button>
              <div className="font-semibold">Hafta: {fmtDate(weekDays[0])} – {fmtDate(weekDays[6])}</div>
              <button className="px-3 py-2 rounded-xl border" onClick={()=>setSelectedDate(addDays(weekStart,7))}>Sonraki →</button>
            </div>
            <input type="date" value={ymd(selectedDate)} onChange={(e)=>setSelectedDate(new Date(e.target.value))} className="px-3 py-2 rounded-xl border" />
          </div>

          {/* Gün başlıkları */}
          <div className="mt-4 grid" style={{ gridTemplateColumns: `80px repeat(7, 1fr)` }}>
            <div></div>
            {weekDays.map((d,i)=>(
              <div key={i} className="px-2 py-2 text-sm font-medium text-center bg-slate-100 border">
                {d.toLocaleDateString(undefined,{weekday:'short'})} <span className="font-mono">{fmtDate(d)}</span>
              </div>
            ))}
          </div>

          {/* Gövde: sol saat, sağ 7 gün */}
          <div className="overflow-auto">
            <div className="grid" style={{ gridTemplateColumns: `80px repeat(7, 1fr)` }}>
              {/* Sol saat kolon */}
              <div className="border-r">
                {HOURS.map((h)=>(
                  <div key={h} className="h-12 px-2 py-2 text-right text-xs text-slate-500 font-mono border-b">
                    {String(h).padStart(2,'0')}:00
                  </div>
                ))}
              </div>

              {/* Sağ: gün sütunları */}
              {weekDays.map((d,i)=>{
  // Bu güne düşen item’lar
  const dayList = sortedItems.filter(it=> overlapsDay(it, d));

  // Çakışma tespiti (gün içindeki segmentlere bak)
  const segments = dayList.map(it => {
    const [s,e] = eventRange(it);
    const dayStart = new Date(d); dayStart.setHours(0,0,0,0);
    const dayEnd   = new Date(d); dayEnd.setHours(23,59,0,0);
    const start = s < dayStart ? dayStart : s;
    const end   = e > dayEnd   ? dayEnd   : e;
    return { id: it.id, start, end };
  });
  const overlapIds = new Set();
  for (let a=0; a<segments.length; a++){
    for (let b=a+1; b<segments.length; b++){
      if (segments[a].start < segments[b].end && segments[a].end > segments[b].start) {
        overlapIds.add(segments[a].id);
        overlapIds.add(segments[b].id);
      }
    }
  }

  return (
    <div
      key={i}
      className="relative border-l"
      style={{ height: ROW_H*24 }}
      onDoubleClick={(e)=>handleDoubleClickDay(e, d, quickAddAt)}

      // Sürükleyerek taşıma (tüm günlerde çalışır)
      onDragOver={(e)=> {
        e.preventDefault();
        if(resizing) return;            // resize aktifken taşıma yapma
        if(!draggingId) return;
        const it = items.find(x=>x.id===draggingId); if(!it) return;
        const [sOld, eOld] = eventRange(it);
        const dur = eOld - sOld;
        const startD = posToTime(d, e);
        const endD = new Date(startD.getTime() + dur);
        // ghost'u bu sütunda göster
        const dayStart = new Date(d); dayStart.setHours(0,0,0,0);
        const dayEnd   = new Date(d); dayEnd.setHours(23,59,0,0);
        const segStart = startD < dayStart ? dayStart : startD;
        const segEnd   = endD   > dayEnd   ? dayEnd   : endD;
        const topPx    = (segStart.getHours() + segStart.getMinutes()/60) * ROW_H;
        const heightPx = Math.max(((segEnd - segStart)/3600000)*ROW_H, 6);
        setGhostPos({ dayIndex:i, topPx, heightPx, label: `${fmtHM(startD)} → ${fmtHM(endD)}` });
      }}
      onDrop={(e)=> {
        e.preventDefault();
        if(resizing) return;
        const id = e.dataTransfer.getData('text/plain'); if(!id) return;
        const it = items.find(x=>x.id===id); if(!it) return;
        const [sOld, eOld] = eventRange(it);
        const dur = eOld - sOld;
        const startD = posToTime(d, e);
        const endD = new Date(startD.getTime() + dur);
        setItems(prev => prev.map(x => x.id===id ? ({ ...x, start: toLocalISO(startD), end: toLocalISO(endD) }) : x));
        setDraggingId(null); setGhostPos(null);
      }}

      // GÜNLER ARASI RESIZE (global, sütun bağımsız)
      onMouseMove={(e)=>{
        if(!resizing) return;
        const it = items.find(x=>x.id===resizing.id); if(!it) return;
        const [sOld, eOld] = eventRange(it);

        let sNew = sOld, eNew = eOld;
        if(resizing.edge==='start'){
          let candidate = posToTime(d, e);                 // imlecin olduğu sütun + pozisyona göre saat
          const maxStart = new Date(eOld.getTime() - SNAP_MIN*60000);
          if(candidate > maxStart) candidate = maxStart;   // en az SNAP_MIN
          sNew = candidate;
        } else {
          let candidate = posToTime(d, e);
          const minEnd = new Date(sOld.getTime() + SNAP_MIN*60000);
          if(candidate < minEnd) candidate = minEnd;
          eNew = candidate;
        }

        // Ghost: sadece bu gün içinde görünen parçayı çiz
        const dayStart = new Date(d); dayStart.setHours(0,0,0,0);
        const dayEnd   = new Date(d); dayEnd.setHours(23,59,0,0);
        const segStart = sNew < dayStart ? dayStart : sNew;
        const segEnd   = eNew > dayEnd   ? dayEnd   : eNew;
        const topPx    = (segStart.getHours() + segStart.getMinutes()/60) * ROW_H;
        const heightPx = Math.max(((segEnd - segStart)/3600000)*ROW_H, 6);
        setGhostPos({ dayIndex:i, topPx, heightPx, label: `${fmtHM(sNew)} → ${fmtHM(eNew)}` });
      }}
      onMouseUp={(e)=>{
        if(!resizing) return;
        const it = items.find(x=>x.id===resizing.id); if(!it) { setResizing(null); setGhostPos(null); return; }
        const [sOld, eOld] = eventRange(it);

        let sNew = sOld, eNew = eOld;
        if(resizing.edge==='start'){
          let candidate = posToTime(d, e);
          const maxStart = new Date(eOld.getTime() - SNAP_MIN*60000);
          if(candidate > maxStart) candidate = maxStart;
          sNew = candidate;
        } else {
          let candidate = posToTime(d, e);
          const minEnd = new Date(sOld.getTime() + SNAP_MIN*60000);
          if(candidate < minEnd) candidate = minEnd;
          eNew = candidate;
        }

        setItems(prev => prev.map(x => x.id===it.id ? ({ ...x, start: toLocalISO(sNew), end: toLocalISO(eNew) }) : x));
        setResizing(null); setGhostPos(null);
      }}
      onDragLeave={()=> !resizing && setGhostPos(null)}
      title="Çift tıkla: hızlı ekle"
    >
      {/* saat çizgileri */}
      {HOURS.map((h)=>(
        <div key={h} className="absolute left-0 right-0 border-b" style={{ top: h*ROW_H }} />
      ))}

      {/* Ghost önizleme */}
      {ghostPos && ghostPos.dayIndex===i && (
        <div className="absolute left-1 right-1 border-2 border-dashed border-indigo-400 bg-indigo-200/30 rounded-lg pointer-events-none"
             style={{ top: ghostPos.topPx, height: ghostPos.heightPx, zIndex: 40 }}>
          <div className="text-[10px] font-mono px-1">{ghostPos.label}</div>
        </div>
      )}

      {/* Etkinlik blokları */}
      {dayList.map((it)=>{
        const [s, e] = eventRange(it);
        const dayStart = new Date(d); dayStart.setHours(0,0,0,0);
        const dayEnd   = new Date(d); dayEnd.setHours(23,59,0,0);
        const start = s < dayStart ? dayStart : s;
        const end   = e > dayEnd   ? dayEnd   : e;

        const startHours = start.getHours() + start.getMinutes()/60;
        const durHours   = Math.max((end - start)/3600000, 0.1);
        const topPx      = startHours * ROW_H;
        const heightPx   = Math.max(durHours * ROW_H, 20);

        const isOverlap = overlapIds.has(it.id);
        const compact = durHours <= 1; // 1 saat ve altı için sıkı düzen

        return (
          <button
            key={it.id}
            draggable={!resizing}
            onDragStart={(e)=>{ e.dataTransfer.setData('text/plain', it.id); setDraggingId(it.id); }}
            onDragEnd={()=>{ setDraggingId(null); setGhostPos(null); }}
            onClick={()=> !draggingId && !resizing && editItem(it)}
            className={`group absolute left-0 right-0 mx-1 w-auto rounded-lg border shadow-sm text-left px-2 ${
              compact ? 'pt-2 pr-6 pb-5' : 'pt-4 pr-4 pb-6'
            } flex flex-col gap-0.5 overflow-hidden ${catMeta(it.category).badge} ${
              it.status==='done' ? 'opacity-90' : it.status==='cancelled' ? 'opacity-60 saturate-50' : ''
            } ${isOverlap ? 'ring-2 ring-rose-500' : ''}`}

            style={{ top: topPx, height: heightPx, zIndex: 30 }}
            title={`${fmtTime(it.start)}${it.end ? ` → ${fmtTime(it.end)}` : ""}${isOverlap ? ' · ⚠︎ Çakışıyor' : ''}`}
          >
            {/* Status: yalnız renkli nokta */}
            {/* Status: yalnız renkli nokta (sağ üst) */}
            <div className="absolute top-1 right-1">
              <div
                className={`w-2.5 h-2.5 rounded-full ${statusMeta(it.status).dot} ring-1 ring-white/80 shadow pointer-events-none`}
                title={statusMeta(it.status).label}
              />
            </div>

            {/* Sil butonu (sağ alt) */}
            <button
              type="button"
              title="Sil"
              className="absolute bottom-1 right-1 z-40 px-1.5 py-0.5 text-[10px] rounded border bg-white/90 hover:bg-rose-50 hover:text-rose-700 opacity-0 group-hover:opacity-100 transition"
              onClick={(e)=>{ e.stopPropagation(); e.preventDefault(); removeItem(it.id); }}
            >
              🗑️
            </button>
            {compact ? (
  <>
    {/* Başlık: tek satır */}
    <div
      className={`text-[12px] leading-tight font-medium truncate ${it.status==='done' ? 'line-through' : ''}`}
      title={it.title || 'Başlıksız'}
    >
      {it.title || 'Başlıksız'}
    </div>

    {/* Saat: alt-sol */}
    <div className="absolute bottom-1 left-1 font-mono text-[9px] opacity-80 bg-white/70 rounded px-1">
      {fmtTime(it.start)}{it.end ? ` → ${fmtTime(it.end)}` : ""}
    </div>
  </>
) : (
  <>
    <div className={`text-[11px] font-medium leading-tight truncate ${it.status==='done' ? 'line-through' : ''}`}>
      {(it.title && it.title.trim()) ? it.title : 'Başlıksız'}
    </div>
    <div className="text-[10px] font-mono opacity-80">
      {fmtTime(it.start)}{it.end ? ` → ${fmtTime(it.end)}` : ""}
    </div>
    {/* Para */}
    {fmtMoney(it.cost, it.currency) && (
      <div className="text-[10px] opacity-80">💸 {fmtMoney(it.cost, it.currency)}</div>
    )}
    {/* Linkler */}
    <div className="mt-0.5 flex items-center gap-2 text-[10px] flex-wrap">
      {(it.mapLinks || []).slice(0, 2).map((ml, idx) => (
        <a key={idx} href={ml.url} target="_blank" rel="noreferrer" className="underline underline-offset-2">
          📍 {ml.label || `Harita ${idx+1}`}
        </a>
      ))}
      {it.mapLinks && it.mapLinks.length > 2 && <span>+{it.mapLinks.length - 2}</span>}
      {it.url && (
        <a href={it.url} target="_blank" rel="noreferrer" className="underline underline-offset-2">
          🔗 Link
        </a>
      )}
    </div>
  </>
)}

            {/* Resize tutamakları */}
            <div className="absolute left-0 right-0 top-0 h-2 cursor-n-resize"
                 onMouseDown={(e)=>{ e.stopPropagation(); setResizing({ id: it.id, edge: 'start' }); }} />
            <div className="absolute left-0 right-0 bottom-0 h-[3px] cursor-s-resize"
                 onMouseDown={(e)=>{ e.stopPropagation(); setResizing({ id: it.id, edge: 'end' }); }} />
          </button>
        );
      })}
    </div>
  );
})}

            </div>
          </div>

          <div className="text-xs text-slate-500 mt-2">
            İpucu: Gün sütununda boş yere <b>çift tıkla</b> hızlı ekle. Kartı <b>sürükle</b> → taşı; üst/alt kenarı <b>sürükle</b> → süreyi değiştir.
          </div>
        </section>
      )}

      {/* === PLAN MODALI === */}
      {showForm && (
  <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center" onClick={()=>setShowForm(false)}>
    <div
      className="bg-white w-full max-w-md sm:max-w-lg max-h-[90vh] rounded-lg shadow-lg flex flex-col"
      onClick={(e)=>e.stopPropagation()}
    >
      {/* Header */}
      <div className="p-4 sm:p-6 border-b">
        <h2 className="text-lg font-semibold">{draft.id ? "Düzenle" : "Yeni Kayıt"}</h2>
      </div>

      {/* Scrollable content */}
      <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
        <div className="grid gap-3">
          {/* Başlık */}
          <input value={draft.title} onChange={(e)=>setDraft({...draft,title:e.target.value})} placeholder="Başlık" className="w-full border p-2 rounded" />

          {/* Kategori / Durum */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-500">Kategori</label>
              <select value={draft.category} onChange={(e)=>setDraft({...draft,category:e.target.value})} className="w-full border p-2 rounded">
                {CATEGORIES.map(c=> <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500">Durum</label>
              <select value={draft.status} onChange={(e)=>setDraft({...draft,status:e.target.value})} className="w-full border p-2 rounded">
                {STATUS.map(s=> <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {/* Gezi & Maliyet */}
          <div>
            <label className="text-xs text-slate-500">Gezi</label>
            <select
              value={draft.tripId}
              onChange={(e)=>{ const tripId=e.target.value; setDraft(prev=> ({ ...prev, tripId, currency: currencyOf(tripId) })); }}
              className="w-full border p-2 rounded"
            >
              <option value="">— Gezi yok —</option>
              {trips.map(t=> <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="text-xs text-slate-500">Maliyet</label>
              <input type="number" step="0.01" value={draft.cost} onChange={(e)=> setDraft({...draft, cost: e.target.value })} placeholder="Örn. 1500" className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="text-xs text-slate-500">Para birimi</label>
              <input value={draft.currency || ""} onChange={(e)=> setDraft({...draft, currency: e.target.value })} className="w-full border p-2 rounded" placeholder="THB" />
            </div>
          </div>

          {/* Tarihler */}
          <input type="datetime-local" value={draft.start} onChange={(e)=>setDraft({...draft,start:e.target.value})} className="w-full border p-2 rounded" />
          <input type="datetime-local" value={draft.end||""} onChange={(e)=>setDraft({...draft,end:e.target.value})} className="w-full border p-2 rounded" placeholder="Bitiş (opsiyonel)" />

          {/* Harita linki */}
          <div>
            <div>
  <label className="text-xs text-slate-500">Konum(lar) – Google Maps</label>

  {(draft.mapLinks || []).map((ml, idx) => (
    <div key={idx} className="grid grid-cols-[120px_1fr_auto] gap-2 items-center mb-2">
      {/* Etiket */}
      <input
        value={ml.label || ""}
        onChange={(e) => {
          const val = e.target.value;
          setDraft(prev => {
            const arr = [...(prev.mapLinks || [])];
            arr[idx] = { ...arr[idx], label: val };
            return { ...prev, mapLinks: arr };
          });
        }}
        placeholder={`Harita ${idx+1}`}
        className="border p-2 rounded"
      />
      {/* URL */}
      <input
        value={ml.url || ""}
        onChange={(e) => {
          const val = e.target.value;
          setDraft(prev => {
            const arr = [...(prev.mapLinks || [])];
            arr[idx] = { ...arr[idx], url: val };
            return { ...prev, mapLinks: arr };
          });
        }}
        placeholder="https://maps.google.com/..."
        className="border p-2 rounded w-full"
      />
      {/* Sil */}
      <button
        type="button"
        className="px-2 py-2 rounded border text-rose-600"
        onClick={() => {
          setDraft(prev => {
            const arr = [...(prev.mapLinks || [])];
            arr.splice(idx, 1);
            return { ...prev, mapLinks: arr };
          });
        }}
        title="Konumu kaldır"
      >
        Sil
      </button>
    </div>
  ))}

  {/* Ekle */}
  <button
    type="button"
    className="px-3 py-2 rounded border bg-slate-50"
    onClick={() => {
      setDraft(prev => ({ ...prev, mapLinks: [...(prev.mapLinks || []), { label: "", url: "" }] }));
    }}
  >
    + Konum Ekle
  </button>
</div>
          </div>

          {/* Dış link */}
          <div>
            <label className="text-xs text-slate-500">Dış Link (Tur / Menü / Rezervasyon)</label>
            <input
              value={draft.url || ""}
              onChange={(e)=> setDraft({...draft, url: e.target.value })}
              placeholder="https://www.getyourguide.com/..."
              className="w-full border p-2 rounded"
            />
          </div>

          {/* NOTLAR */}
          <textarea value={draft.notes} onChange={(e)=>setDraft({...draft,notes:e.target.value})} placeholder="Notlar" className="w-full border p-2 rounded" rows={3} />
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 sm:p-6 border-t flex justify-end gap-2">
        <button onClick={()=>setShowForm(false)} className="px-4 py-2 bg-slate-200 rounded-lg">Vazgeç</button>
        <button onClick={saveDraft} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Kaydet</button>
      </div>
    </div>
  </div>
)}

      {/* === GEZI MODALI === */}
      {showTripModal && (
  <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center" onClick={()=>setShowTripModal(false)}>
    <div
      className="bg-white w-full max-w-md sm:max-w-lg max-h-[90vh] rounded-lg shadow-lg flex flex-col"
      onClick={(e)=>e.stopPropagation()}
    >
      {/* Header */}
      <div className="p-4 sm:p-6 border-b">
        <h2 className="text-lg font-semibold">{tripDraft.id ? "Geziyi Düzenle" : "Yeni Gezi"}</h2>
      </div>

      {/* Scrollable content */}
      <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
        <div className="grid gap-3">
          <div>
            <label className="text-xs text-slate-500">Gezi Adı</label>
            <input
              value={tripDraft.name}
              onChange={(e)=> setTripDraft(prev=>({ ...prev, name: e.target.value }))}
              placeholder="Örn. Bangkok 4–12 Aralık"
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500">Para Birimi</label>
            <input
              value={tripDraft.currency}
              onChange={(e)=> setTripDraft(prev=>({ ...prev, currency: e.target.value.toUpperCase() }))}
              placeholder="THB"
              className="w-full border p-2 rounded"
            />
          </div>

          {trips.length>0 && (
            <div className="border rounded-lg p-2">
              <div className="text-xs text-slate-500 mb-2">Mevcut Geziler</div>
              <div className="flex flex-col gap-1 max-h-40 overflow-auto">
                {trips.map(t=>(
                  <div key={t.id} className="flex items-center justify-between text-sm">
                    <div>{t.name} <span className="text-slate-400">({t.currency})</span></div>
                    <div className="flex items-center gap-1">
                      <button className="px-2 py-1 text-xs rounded border" onClick={()=>editTrip(t)}>Düzenle</button>
                      <button className="px-2 py-1 text-xs rounded border text-rose-600" onClick={()=>removeTrip(t.id)}>Sil</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 sm:p-6 border-t flex justify-end gap-2">
        <button onClick={()=>setShowTripModal(false)} className="px-4 py-2 bg-slate-200 rounded-lg">Vazgeç</button>
        <button onClick={saveTrip} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Kaydet</button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
