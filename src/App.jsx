import React, { useEffect, useMemo, useState } from "react";

/* ---------------- Helpers ---------------- */
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const p2 = (n) => String(n).padStart(2, "0");
const toLocalInput = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${p2(x.getMonth() + 1)}-${p2(x.getDate())}T${p2(
    x.getHours()
  )}:${p2(x.getMinutes())}`;
};
const toLocalISO = (d) => toLocalInput(d);
const ymd = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${p2(x.getMonth() + 1)}-${p2(x.getDate())}`;
};
const HOURS = Array.from({ length: 24 }, (_, i) => i);
function startOfWeek(date, weekStartsOn = 1) {
  const d = new Date(date);
  const day = d.getDay(); // 0 Sun
  const diff = (day === 0 ? 7 : day) - weekStartsOn;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
function fmtDate(d) {
  return `${p2(d.getDate())}.${p2(d.getMonth() + 1)}`;
}
function fmtTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${p2(d.getHours())}:${p2(d.getMinutes())}`;
}
function fmtHM(d) {
  return `${p2(d.getHours())}:${p2(d.getMinutes())}`;
}
function isSameDayStr(dateStr, dayDate) {
  if (!dateStr) return false;
  return ymd(dateStr) === ymd(dayDate);
}

function addOneHourSameDay(d) {
  const end = new Date(d);
  end.setHours(end.getHours() + 1);
  const eod = new Date(d);
  eod.setHours(23, 59, 0, 0);
  return end > eod ? eod : end;
}
function overlapsDay(it, day) {
  const s = new Date(it.start);
  const e = it.end ? new Date(it.end) : addOneHourSameDay(s);
  const ss = s.getTime();
  const es = e.getTime();
  const d0 = new Date(day);
  d0.setHours(0, 0, 0, 0);
  const d1 = new Date(day);
  d1.setHours(23, 59, 0, 0);
  const se = d0.getTime();
  const ee = d1.getTime();
  return es > se && ss < ee;
}
function eventRange(it) {
  const s = new Date(it.start);
  const e = it.end ? new Date(it.end) : addOneHourSameDay(s);
  return [s, e];
}
function fmtDateTime(dt) {
  const d = new Date(dt);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}
// ---------- Conflict helpers ----------
function parseDT(s){ return s ? new Date(s) : null; }
function getDurationMs(it){
  const s = parseDT(it.start);
  const e = it?.end ? new Date(it.end) : null;
  return (s && e) ? (e - s) : (60*60*1000); // bitiş yoksa 1s varsay
}
function rangesOverlap(a, b){
  if(!a?.start || !b?.start) return false;
  const as = new Date(a.start);
  const ae = a?.end ? new Date(a.end) : new Date(as.getTime() + getDurationMs(a));
  const bs = new Date(b.start);
  const be = b?.end ? new Date(b.end) : new Date(bs.getTime() + getDurationMs(b));
  return as < be && bs < ae;
}
function getConflictsForRange(test, excludeId, scopeItems){
  if (!test?.start) return [];
  // Dışarıdaki "items" değişkenine asla güvenme; boşsa boş array kullan
  const scoped = Array.isArray(scopeItems) ? scopeItems : [];
  return scoped.filter(it => it.id !== excludeId && rangesOverlap(test, it));
}

/* ------------ Board math ------------ */
const ROW_H = 48; // 1h = 48px
const SNAP_MIN = 15;
const CELL_MIN_PX = (ROW_H * SNAP_MIN) / 60; // e.g., 12px when SNAP_MIN=15
function snapMinutes(m, step = SNAP_MIN) {
  return Math.round(m / step) * step;
}
function posToTime(day, e, baseHour = 0) {
  const rect = e.currentTarget.getBoundingClientRect();
  const yLocal = e.clientY - rect.top;
  const y = yLocal + baseHour * ROW_H;
  const hours = Math.max(0, Math.min(23.98, y / ROW_H));
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  const mm = snapMinutes(m);
  const d = new Date(day);
  d.setHours(h, mm, 0, 0);
  return d;
}

/* ---------------- Currency ---------------- */
const CURRENCY_OPTIONS = [
  { code: "TRY", name: "Türk Lirası" },
  { code: "USD", name: "ABD Doları" },
  { code: "EUR", name: "Euro" },
  { code: "THB", name: "Tayland Bahtı" },
  { code: "GBP", name: "İngiliz Sterlini" },
  { code: "AED", name: "BAE Dirhemi" },
  { code: "SAR", name: "Suudi Riyali" },
  { code: "CHF", name: "İsviçre Frangı" },
  { code: "JPY", name: "Japon Yeni" },
  { code: "CNY", name: "Çin Yuanı" },
  { code: "KRW", name: "Güney Kore Wonu" },
  { code: "HKD", name: "Hong Kong Doları" },
  { code: "SGD", name: "Singapur Doları" },
  { code: "AUD", name: "Avustralya Doları" },
  { code: "CAD", name: "Kanada Doları" },
  { code: "RUB", name: "Rus Rublesi" },
  { code: "INR", name: "Hindistan Rupisi" },
  { code: "IDR", name: "Endonezya Rupiahı" },
  { code: "MYR", name: "Malezya Ringgiti" },
  { code: "VND", name: "Vietnam Dongu" },
];
const CURRENCY_CODES = new Set(CURRENCY_OPTIONS.map((o) => o.code));
function normalizeCurrencyInput(s) {
  if (!s) return "";
  const v = s.toString().trim().toUpperCase().replace(/\s+/g, "");
  const map = {
    TL: "TRY",
    TRL: "TRY",
    TURKLIRASI: "TRY",
    TURKISHLIRA: "TRY",
    TRKLIRA: "TRY",
    "₺": "TRY",
    EURO: "EUR",
    "€": "EUR",
    DOLAR: "USD",
    USDOLLAR: "USD",
    "US DOLLAR": "USD",
    "$": "USD",
    BAHT: "THB",
    THAIBAHT: "THB",
    "THAI BAHT": "THB",
    "฿": "THB",
  };
  const code = map[v] || v;
  return CURRENCY_CODES.has(code) ? code : "";
}

/* ---------------- Data schema ---------------- */
const CATEGORIES = [
  {
    value: "yemek",
    label: "Yemek",
    badge: "bg-rose-100 text-rose-700 border-rose-200",
    bar: "bg-rose-500",
  },
  {
    value: "yol",
    label: "Yol",
    badge: "bg-sky-100 text-sky-700 border-sky-200",
    bar: "bg-sky-500",
  },
  {
    value: "tur",
    label: "Tur",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    bar: "bg-emerald-500",
  },
  {
    value: "alisveris",
    label: "Alışveriş",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    bar: "bg-amber-500",
  },
  {
    value: "ucak",
    label: "Uçak",
    badge: "bg-indigo-100 text-indigo-700 border-indigo-200",
    bar: "bg-indigo-500",
  },
  {
    value: "otel",
    label: "Otel",
    badge: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
    bar: "bg-fuchsia-500",
  },
  {
    value: "pub",
    label: "Pub",
    badge: "bg-teal-100 text-teal-700 border-teal-200",
    bar: "bg-teal-500",
  },
];
const STATUS = [
  { value: "todo", label: "Yapılacak", dot: "bg-slate-400" },
  { value: "done", label: "Tamamlandı", dot: "bg-emerald-600" },
  { value: "postponed", label: "Ertelendi", dot: "bg-amber-500" },
  { value: "cancelled", label: "İptal edildi", dot: "bg-rose-600" },
];

const EXPENSE_KIND = [
  { value: "planned", label: "Planlanan" },
  { value: "spent",   label: "Harcanan"  },
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
  // ── çoklu masraf ──
  expenses: [], // [{id,label,amount,currency}]
  // eski alanlar (migrasyon için)
  cost: "",
  currency: "",
  // linkler
  mapLinks: [], // [{label,url}]
  url: "",
};

const DEFAULT_EXTRA = {
  id: "",
  tripId: "",
  title: "",
  category: "yemek",
  cost: "",
  currency: "",
  notes: "",
  kind: "spent", // planned | spent
};



const STORAGE_KEY = "planner.items.v2";
const TRIPS_KEY = "planner.trips.v1";
const EXTRAS_KEY = "planner.extras.v1";
const SNAPSHOTS_KEY = "planner.snapshots.v1";
const FX_STORAGE_KEY = "planner.fx.global.v2";

// --------- Backup helpers ----------
function fileTimestamp() {
  const d = new Date();
  const p2 = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p2(d.getMonth() + 1)}${p2(d.getDate())}-${p2(
    d.getHours()
  )}${p2(d.getMinutes())}${p2(d.getSeconds())}`;
}
function downloadJSON(filename, obj) {
  const data = JSON.stringify(obj, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
function buildFullBackupPayload({ items, trips, extras, snapshots, fxGlobal, meta = {} }) {
  return {
    app: "planner-app",
    version: 2,
    exportedAt: new Date().toISOString(),
    meta,
    data: { items, trips, extras, snapshots, fxGlobal },
  };
}
function safeParseJSON(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
function mergeById(oldArr, newArr) {
  const map = new Map((oldArr || []).map((x) => [x.id, x]));
  for (const it of newArr || []) map.set(it.id, { ...(map.get(it.id) || {}), ...it });
  return Array.from(map.values());
}


/* ---------------- Component ---------------- */
export default function PlannerApp() {
  // Import input ref
const [importMode, setImportMode] = useState("merge"); // merge | replace
const fileInputRef = React.useRef(null);
  const dragOffsetRef = React.useRef(0);
  const suppressClickUntilRef = React.useRef(0);

  // ---- Undo/Redo history ----
const historyRef = React.useRef({ past: [], future: [] });
const [historyTick, setHistoryTick] = useState(0); // enable/disable buttons

function deepClone(obj){ try { return JSON.parse(JSON.stringify(obj)); } catch { return obj; } }
function makeSnapshot(){
  return {
    items: deepClone(items),
    trips: deepClone(trips),
    extras: deepClone(extras),
    snapshots: deepClone(snapshots),
    selectedTrip,
    targetCurrency,
    fxGlobal: deepClone(fxGlobal),
  };
}
function applySnapshot(s){
  setItems(s.items || []);
  setTrips(s.trips || []);
  setExtras(s.extras || []);
  setSnapshots(s.snapshots || []);
  setSelectedTrip(s.selectedTrip || "");
  setTargetCurrency(s.targetCurrency || "TRY");
  setFxGlobal(s.fxGlobal || { ratesToTRY: { TRY:1 }, updatedAt:null, source:"manual" });
}
function beginHistory(label = "op"){
  const snap = makeSnapshot();
  historyRef.current.past.push(snap);
  historyRef.current.future = [];
  setHistoryTick(t=>t+1);
}
function undo(){
  const h = historyRef.current;
  if(!h.past.length) return;
  const current = makeSnapshot();
  const prev = h.past.pop();
  h.future.push(current);
  applySnapshot(prev);
  setHistoryTick(t=>t+1);
}
function redo(){
  const h = historyRef.current;
  if(!h.future.length) return;
  const current = makeSnapshot();
  const next = h.future.pop();
  h.past.push(current);
  applySnapshot(next);
  setHistoryTick(t=>t+1);
}
const canUndo = historyRef.current.past.length > 0;
const canRedo = historyRef.current.future.length > 0;

  // local variant of posToTime that accounts for initial mouse->card offset during drag
  function posToTimeLocal(day, e, baseHour = 0) {
    const rect = e.currentTarget.getBoundingClientRect();
    const offset = dragOffsetRef.current || 0; // quantized at dragStart

    // Quantize the pointer Y to the grid first
    const rawLocal = e.clientY - rect.top;
    const snappedLocal = Math.round(rawLocal / CELL_MIN_PX) * CELL_MIN_PX;

    // Apply offset and base hour to get absolute Y within the day column
    const y = snappedLocal - offset + baseHour * ROW_H;

    // Convert Y → hours/minutes
    const hours = Math.max(0, Math.min(23.98, y / ROW_H));
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    const mm = snapMinutes(m);

    const d = new Date(day);
    d.setHours(h, mm, 0, 0);
    return d;
  }
  // exact variant (no SNAP_MIN rounding) for fine-grained resize preview and final commit
  function posToTimeExactLocal(day, e, baseHour = 0) {
    const rect = e.currentTarget.getBoundingClientRect();
    const offset = dragOffsetRef.current || 0;
    const yLocal = e.clientY - rect.top - offset;
    const y = yLocal + baseHour * ROW_H;
    const hours = Math.max(0, Math.min(23.999, y / ROW_H));
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    const mm = Math.max(0, Math.min(59, m));
    const d = new Date(day);
    d.setHours(h, mm, 0, 0);
    return d;
  }
  // --- Resize helpers: exact/no-offset mapping + snapping ---
  function posToTimeExactNoOffset(day, e, baseHour = 0) {
    const rect = e.currentTarget.getBoundingClientRect();
    const yLocal = e.clientY - rect.top; // NO dragOffsetRef here
    const y = yLocal + baseHour * ROW_H;
    const hours = Math.max(0, Math.min(23.999, y / ROW_H));
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    const mm = Math.max(0, Math.min(59, m));
    const d = new Date(day);
    d.setHours(h, mm, 0, 0);
    return d;
  }

  function snapDateToStep(date, step = SNAP_MIN) {
    const d = new Date(date);
    const total = d.getHours() * 60 + d.getMinutes();
    const snapped = Math.round(total / step) * step;
    const h2 = Math.max(0, Math.min(23, Math.floor(snapped / 60)));
    const m2 = Math.max(0, Math.min(59, snapped % 60));
    d.setHours(h2, m2, 0, 0);
    return d;
  }

  function posToTimeSnappedNoOffset(day, e, baseHour = 0) {
    const exact = posToTimeExactNoOffset(day, e, baseHour);
    return snapDateToStep(exact, SNAP_MIN);
  }
  const [resizingPreview, setResizingPreview] = useState(null); // { dayIndex, topPx, heightPx, label }

function exportAllAsJSON() {
  const payload = buildFullBackupPayload({
    items,
    trips,
    extras,
    snapshots,
    fxGlobal,
    meta: { scope: "all" },
  });
  downloadJSON(`planner-backup-${fileTimestamp()}.json`, payload);
}

function exportSelectedTripAsJSON() {
  if (!selectedTrip) {
    alert("Önce bir gezi seç.");
    return;
  }
  const sel = selectedTrip;
  const payload = buildFullBackupPayload({
    items: items.filter((i) => i.tripId === sel),
    trips: trips.filter((t) => t.id === sel),
    extras: extras.filter((e) => e.tripId === sel),
    snapshots: snapshots.filter((s) => (s.tripId || "") === sel),
    fxGlobal,
    meta: { scope: "trip", tripId: sel },
  });
  const tName = trips.find((t) => t.id === sel)?.name || "trip";
  downloadJSON(
    `planner-backup-${tName.replace(/\s+/g, "_")}-${fileTimestamp()}.json`,
    payload
  );
}

function triggerImport(mode = "merge") {
  setImportMode(mode);
  fileInputRef.current?.click();
}

function handleImportFile(e) {
  const file = e.target.files?.[0];
  e.target.value = ""; // aynı dosyayı tekrar seçebilmek için temizle
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const json = safeParseJSON(reader.result);
    if (!json || json.app !== "planner-app" || !json.data) {
      alert("Geçersiz yedek dosyası.");
      return;
    }
    const { items: iNew = [], trips: tNew = [], extras: exNew = [], snapshots: snNew = [], fxGlobal: fxNew } =
      json.data;

    if (importMode === "replace") {
      beginHistory('import-replace');
      if (!confirm("Mevcut tüm veriler YERİNE yedek dosyası yüklensin mi?")) return;
      setItems(iNew);
      setTrips(tNew);
      setExtras(exNew);
      setSnapshots(snNew);
      if (fxNew) setFxGlobal(fxNew);
      alert("Yedek içeri aktarıldı (REPLACE).");
    } else {
      beginHistory('import-merge');
      // merge
      if (!confirm("Yedek MERGE edilerek yüklensin mi? (Aynı id'ler güncellenir)")) return;
      setItems((old) => mergeById(old, iNew));
      setTrips((old) => mergeById(old, tNew));
      setExtras((old) => mergeById(old, exNew));
      setSnapshots((old) => mergeById(old, snNew));
      if (fxNew) setFxGlobal((old) => ({ ...(old || {}), ...(fxNew || {}) }));
      alert("Yedek içeri aktarıldı (MERGE).");
    }
  };
  reader.readAsText(file);
}

  // state
  const [showSettings, setShowSettings] = useState(false);
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });
  const [trips, setTrips] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(TRIPS_KEY)) || [];
    } catch {
      return [];
    }
  });
  const [extras, setExtras] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(EXTRAS_KEY)) || [];
    } catch {
      return [];
    }
  });
  const [snapshots, setSnapshots] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(SNAPSHOTS_KEY)) || [];
    } catch {
      return [];
    }
  });

  const [view, setView] = useState("week"); // list | week | budget
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectedTrip, setSelectedTrip] = useState("");
  const [targetCurrency, setTargetCurrency] = useState("TRY");

  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ ...DEFAULT_ITEM });
  const [expRows, setExpRows] = useState([]);
  // Modal (draft) için canlı çakışma
const draftConflicts = useMemo(() => {
  if(!showForm || !draft?.start) return [];
  const dur = getDurationMs(draft);
  const s = new Date(draft.start);
  const e = draft.end ? new Date(draft.end) : new Date(s.getTime()+dur);
  const test = { ...draft, start: toLocalISO(s), end: toLocalISO(e) };
  const scope = selectedTrip ? items.filter(x => x.tripId === (draft.tripId || selectedTrip)) : items;
  return getConflictsForRange(test, draft.id, scope);
}, [showForm, draft.start, draft.end, draft.id, draft.tripId, selectedTrip, items]);


  // Çakışma paneli
const [showConflictPanel, setShowConflictPanel] = useState(false);
const [focusConflictId, setFocusConflictId] = useState(null);


  const [showTripModal, setShowTripModal] = useState(false);
  const [tripDraft, setTripDraft] = useState({ id: "", name: "", currency: "TRY" });

  const [extraDraft, setExtraDraft] = useState({ ...DEFAULT_EXTRA });
  const [editingExtraId, setEditingExtraId] = useState(null);

  const [draggingId, setDraggingId] = useState(null);
  const [resizing, setResizing] = useState(null); // {id, edge}
  const [ghostPos, setGhostPos] = useState(null); // { dayIndex, topPx, heightPx, label }
const [hoverConflicts, setHoverConflicts] = useState([]);
  const [now, setNow] = useState(new Date());
function updateGhostPosWithConflicts({ dayIndex, topPx, heightPx, label }) {
  // sürüklenen item
  const dragged = items.find((x) => x.id === draggingId);
  if (!dragged) {
    // sadece görsel hayalet göster, çakışma listesi boş
    setGhostPos({ dayIndex, topPx, heightPx, label, conflicts: [] });
    return;
  }

  // Gün + pikselden saate çevir (1 saat = ROW_H px)
  const dayDate = weekDays[dayIndex];
  const minutesFromMidnight = snapMinutes(Math.round((topPx / ROW_H) * 60), SNAP_MIN);
  const s = new Date(dayDate);
  s.setHours(0, 0, 0, 0);
  s.setMinutes(minutesFromMidnight);

  const durMs = getDurationMs(dragged);
  const e = new Date(s.getTime() + durMs);

  // Aynı gezi kapsamı
  const scope = dragged.tripId
    ? items.filter(x => x.tripId === dragged.tripId && x.id !== dragged.id)
    : items.filter(x => x.id !== dragged.id);

  const conflicts = getConflictsForRange(
    { ...dragged, start: toLocalISO(s), end: toLocalISO(e) },
    dragged.id,
    scope
  );

  setGhostPos({
    dayIndex,
    topPx,
    heightPx,
    label,
    conflicts: conflicts.map(c => ({
      id: c.id, title: c.title, start: c.start, end: c.end
    }))
  });
}

  const [openCats, setOpenCats] = useState({});

  const [fxGlobal, setFxGlobal] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem(FX_STORAGE_KEY)) || {
          ratesToTRY: { TRY: 1 },
          updatedAt: null,
          source: "manual",
        }
      );
    } catch {
      return { ratesToTRY: { TRY: 1 }, updatedAt: null, source: "manual" };
    }
  });



  useEffect(() => {
    localStorage.setItem(FX_STORAGE_KEY, JSON.stringify(fxGlobal));
  }, [fxGlobal]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);
  useEffect(() => {
    localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
  }, [trips]);
  useEffect(() => {
    localStorage.setItem(EXTRAS_KEY, JSON.stringify(extras));
  }, [extras]);
  useEffect(() => {
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(snapshots));
  }, [snapshots]);

  useEffect(() => {
  function onKey(e){
    const mod = e.metaKey || e.ctrlKey;
    if(!mod) return;
    const k = e.key.toLowerCase();
    if(k === 'z' && !e.shiftKey){
      e.preventDefault();
      undo();
    } else if(k === 'y' || (k === 'z' && e.shiftKey)){
      e.preventDefault();
      redo();
    }
  }
  window.addEventListener('keydown', onKey);
  return () => window.removeEventListener('keydown', onKey);
}, []);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000); // update “now” every 30s
    return () => clearInterval(id);
  }, []);

  // Migration: tekil cost/currency -> expenses[] + normalize + add kind + trip budget defaults
useEffect(() => {
  setItems((prev) =>
    prev.map((it) => {
      const cur = normalizeCurrencyInput(it.currency || "") || it.currency || "";
      let expenses = Array.isArray(it.expenses) ? it.expenses : [];
      if ((!expenses || expenses.length === 0) && it.cost && !isNaN(parseFloat(it.cost))) {
        expenses = [
          {
            id: uid(),
            label: "Genel",
            amount: parseFloat(it.cost),
            currency: cur || "THB",
            kind: "spent",
          },
        ];
      } else {
        expenses = (expenses || []).map((ex) => ({
          ...ex,
          currency: normalizeCurrencyInput(ex.currency || "") || ex.currency || "THB",
          kind: ex.kind === "planned" ? "planned" : "spent",
        }));
      }
      return { ...it, expenses };
    })
  );

  setTrips((prev) =>
    prev.map((t) => ({
      ...t,
      currency: normalizeCurrencyInput(t.currency || "") || t.currency || "THB",
      budgetCurrency:
        normalizeCurrencyInput(t.budgetCurrency || t.currency || "") || t.currency || "THB",
      budgetAmount:
        t.budgetAmount === "" || t.budgetAmount == null || isNaN(Number(t.budgetAmount))
          ? ""
          : Number(t.budgetAmount),
    }))
  );

  setExtras((prev) =>
    prev.map((ex) => ({
      ...ex,
      currency: normalizeCurrencyInput(ex.currency || "") || ex.currency || "THB",
      kind: ex.kind === "planned" ? "planned" : "spent",
    }))
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  const sortedItems = useMemo(() => {
    let arr = [...items];
    if (selectedTrip) arr = arr.filter((it) => it.tripId === selectedTrip);
    return arr.sort((a, b) => (a.start || "").localeCompare(b.start || ""));
  }, [items, selectedTrip]);

  const weekStart = useMemo(() => startOfWeek(selectedDate, 1), [selectedDate]);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );
  // Seçili geziye göre çakışma haritası (id -> [id, id, ...])
const conflictMap = useMemo(() => {
  const scoped = selectedTrip ? items.filter(i => i.tripId === selectedTrip) : items;
  const map = {};
  for(let i=0;i<scoped.length;i++){
    for(let j=i+1;j<scoped.length;j++){
      const a = scoped[i], b = scoped[j];
      if(rangesOverlap(a,b)){
        (map[a.id] ||= []).push(b.id);
        (map[b.id] ||= []).push(a.id);
      }
    }
  }
  return map;
}, [items, selectedTrip]);

const totalConflicts = useMemo(() => {
  // her çift iki kez sayılır; 2'ye böl
  const sum = Object.values(conflictMap).reduce((s, arr) => s + (arr?.length || 0), 0);
  return Math.floor(sum / 2);
}, [conflictMap]);


  // helpers
  function catMeta(val) {
    return CATEGORIES.find((c) => c.value === val) || CATEGORIES[0];
  }
  function statusMeta(val) {
    return STATUS.find((s) => s.value === val) || STATUS[0];
  }
  function currencyOf(tripId) {
    const t = trips.find((t) => t.id === tripId);
    return t?.currency || "";
  }
  function fmtMoney(n, curr) {
    if (n === "" || n === null || n === undefined) return "";
    return `${Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${curr || ""}`;
  }
  function itemsAt(day, hour) {
    return sortedItems.filter(
      (it) => isSameDayStr(it.start, day) && new Date(it.start).getHours() === hour
    );
  }

  // FX
  const currenciesInUse = useMemo(() => {
    const set = new Set();
    const push = (c) => {
      const n = normalizeCurrencyInput(c || "");
      if (n) set.add(n);
    };
    // items -> expenses
    for (const it of selectedTrip ? items.filter((x) => x.tripId === selectedTrip) : items) {
      const list = Array.isArray(it.expenses) ? it.expenses : [];
      for (const ex of list) {
        if (ex.amount && !isNaN(parseFloat(ex.amount))) push(ex.currency);
      }
    }
    // extras
    for (const ex of selectedTrip ? extras.filter((x) => x.tripId === selectedTrip) : extras) {
      if (ex.cost && !isNaN(parseFloat(ex.cost))) push(ex.currency || currencyOf(ex.tripId) || "THB");
    }
    if (selectedTrip) push(currencyOf(selectedTrip));
    push(targetCurrency);
    return Array.from(set).sort();
  }, [items, extras, selectedTrip, targetCurrency, trips]);

  function convertFx(amount, from, to) {
    const val = parseFloat(amount || 0) || 0;
    const src = normalizeCurrencyInput(from || "") || "TRY";
    const dst = normalizeCurrencyInput(to || "") || "TRY";
    if (src === dst) return val;
    const r = fxGlobal?.ratesToTRY || {};
    const srcToTRY = r[src];
    const dstToTRY = r[dst];
    if (!srcToTRY || !dstToTRY) return 0;
    const inTRY = val * srcToTRY;
    return inTRY / dstToTRY;
  }

  async function fetchFallbackTRYRates(wantCodes = []) {
    try {
      const res = await fetch("https://open.er-api.com/v6/latest/TRY");
      const json = await res.json();
      const rates = json?.rates || {};
      const out = {};
      for (const code of wantCodes) {
        if (code === "TRY") {
          out.TRY = 1;
          continue;
        }
        const r = rates[code];
        if (r && Number.isFinite(r)) out[code] = 1 / r; // 1 CODE = ? TRY
      }
      return out;
    } catch {
      return {};
    }
  }

  async function fetchBigparaAndSetFx() {
    try {
      const res = await fetch("/bpapi/doviz/headerlist/anasayfa", {
        headers: { accept: "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const list = json?.data || [];

      const bySymbol = (s) => list.find((x) => x.SEMBOL === s);
      const midOf = (row) => {
        if (!row) return null;
        const buy = Number(row.ALIS);
        const sell = Number(row.SATIS);
        const last = Number(row.SON);
        const mid = Number.isFinite(buy) && Number.isFinite(sell) ? (buy + sell) / 2 : Number.isFinite(last) ? last : Number.isFinite(sell) ? sell : Number.isFinite(buy) ? buy : null;
        return Number.isFinite(mid) ? mid : null;
      };

      const next = { TRY: 1 };
      const want = new Set([...CURRENCY_OPTIONS.map((o) => o.code), ...currenciesInUse]);
      for (const code of want) {
        if (code === "TRY") continue;
        const row = bySymbol(`${code}TRY`);
        const v = midOf(row);
        if (v) next[code] = v;
      }
      const missing = Array.from(want).filter((c) => !next[c]);
      if (missing.length) {
        const fb = await fetchFallbackTRYRates(missing);
        Object.assign(next, fb);
      }
      setFxGlobal({
        ratesToTRY: next,
        updatedAt: new Date().toISOString(),
        source: missing.length ? "bigpara+fallback" : "bigpara",
      });
      alert(
        `Kurlar güncellendi (${Object.keys(next).length} PB). Kaynak: ${
          missing.length ? "Bigpara + Fallback" : "Bigpara"
        }`
      );
    } catch (e) {
      console.error(e);
      alert("Kurlar çekilemedi. vite proxy (/bpapi) ayarlı mı?");
    }
  }

  /* ---------- Çoklu masraf yardımcıları ---------- */
  function combineExpensesToRows(expenses = [], defaultCurrency = "THB") {
    const map = new Map();
    for (const ex of (expenses || [])) {
      const label = (ex?.label || "").trim();
      const cur = normalizeCurrencyInput(ex?.currency || "") || defaultCurrency;
      const key = `${label.toLowerCase()}|${cur}`;
      if (!map.has(key)) map.set(key, { id: uid(), label, currency: cur, planned: "", spent: "" });
      const row = map.get(key);
      const amt = ex?.amount;
      if (amt !== "" && !isNaN(parseFloat(amt))) {
        if (ex?.kind === "planned") row.planned = Number(amt);
        else row.spent = Number(amt);
      }
    }
    return Array.from(map.values());
  }
  function itemExpenses(it) {
    const arr = Array.isArray(it.expenses) ? it.expenses : [];
    if (arr.length > 0) return arr;
    // (çok eski kayıtlar için) cost alanını tek masraf gibi say
    if (it.cost && !isNaN(parseFloat(it.cost))) {
      return [
        {
          id: "legacy",
          label: "Genel",
          amount: parseFloat(it.cost),
          currency:
            normalizeCurrencyInput(it.currency || "") || currencyOf(it.tripId) || "THB",
        },
      ];
    }
    return [];
  }
  function itemTotalIn(it, dstCurr) {
    const list = itemExpenses(it);
    return list.reduce(
      (sum, ex) => sum + convertFx(ex.amount, ex.currency, dstCurr),
      0
    );
  }
  function itemSpentTotalIn(it, dstCurr){
    const list = itemExpenses(it).filter(ex => ex.kind !== 'planned');
    return list.reduce((sum, ex) => sum + convertFx(ex.amount, ex.currency, dstCurr), 0);
  }
  /* ---------------- Budget computations ---------------- */
  const scopeItems = useMemo(
    () => (selectedTrip ? items.filter((it) => it.tripId === selectedTrip) : items),
    [items, selectedTrip]
  );
  const scopeExtras = useMemo(
    () => (selectedTrip ? extras.filter((ex) => ex.tripId === selectedTrip) : extras),
    [extras, selectedTrip]
  );

  const budgetData = useMemo(() => {
  const perCategoryPlanned = {};
  const perCategorySpent = {};
  const entriesByCategory = {};

  const pushEntry = (cat, entry) => {
    (entriesByCategory[cat] ||= []).push(entry);
  };

  // Kartlar
  for (const it of scopeItems) {
    const cat = it.category || "yemek";
    const list = itemExpenses(it);
    for (const ex of list) {
      const amt = parseFloat(ex.amount);
      if (isNaN(amt)) continue;
      const cur = normalizeCurrencyInput(ex.currency || "") || "THB";
      const tgt = convertFx(amt, cur, targetCurrency);
      const kind = ex.kind === "planned" ? "planned" : "spent";
      if (kind === "planned") perCategoryPlanned[cat] = (perCategoryPlanned[cat] || 0) + tgt;
      else perCategorySpent[cat] = (perCategorySpent[cat] || 0) + tgt;

      pushEntry(cat, {
        type: "kart",
        id: it.id,
        title: `${it.title || "Başlıksız"} · ${ex.label || "Masraf"}`,
        cost: amt,
        currency: cur,
        costTarget: tgt,
        kind,
      });
    }
  }

  // Ek masraflar
  for (const ex of scopeExtras) {
    const amt = parseFloat(ex.cost);
    if (isNaN(amt)) continue;
    const cur = normalizeCurrencyInput(ex.currency || "") || currencyOf(ex.tripId) || "THB";
    const cat = ex.category || "yemek";
    const tgt = convertFx(amt, cur, targetCurrency);
    const kind = ex.kind === "planned" ? "planned" : "spent";
    if (kind === "planned") perCategoryPlanned[cat] = (perCategoryPlanned[cat] || 0) + tgt;
    else perCategorySpent[cat] = (perCategorySpent[cat] || 0) + tgt;

    pushEntry(cat, {
      type: "ekstra",
      id: ex.id,
      title: ex.title || "Ek Masraf",
      cost: amt,
      currency: cur,
      costTarget: tgt,
      kind,
    });
  }

  const allCat = CATEGORIES.map((c) => c.value);
  const rows = allCat
    .map((cat) => ({
      cat,
      label: CATEGORIES.find((c) => c.value === cat)?.label || cat,
      plannedTarget: perCategoryPlanned[cat] || 0,
      spentTarget: perCategorySpent[cat] || 0,
      bar: CATEGORIES.find((c) => c.value === cat)?.bar || "bg-slate-400",
      badge:
        CATEGORIES.find((c) => c.value === cat)?.badge || "bg-slate-100 text-slate-700",
      entries: entriesByCategory[cat] || [],
    }))
    .filter((r) => r.plannedTarget > 0 || r.spentTarget > 0 || r.entries.length > 0);

  const plannedTotalTarget = rows.reduce((a, b) => a + b.plannedTarget, 0);
  const spentTotalTarget = rows.reduce((a, b) => a + b.spentTarget, 0);

  // Harcama dağılımı
  const stackSpent = rows.map((r) => ({
    label: r.label,
    pct: spentTotalTarget > 0 ? (r.spentTarget * 100) / spentTotalTarget : 0,
    bar: r.bar,
  }));

  // Gezi hedef bütçe (varsa)
  let tripBudgetInTarget = null;
  let remainingTarget = null;
  if (selectedTrip) {
    const t = trips.find((x) => x.id === selectedTrip);
    if (t && t.budgetAmount !== "" && t.budgetAmount != null && Number.isFinite(Number(t.budgetAmount))) {
      const cur = normalizeCurrencyInput(t.budgetCurrency || t.currency || "") || "THB";
      tripBudgetInTarget = convertFx(Number(t.budgetAmount), cur, targetCurrency);
      remainingTarget = tripBudgetInTarget - spentTotalTarget; // kalan (+) / aşılan (-)
    }
  }

  return {
    rows,
    plannedTotalTarget,
    spentTotalTarget,
    stackSpent,
    tripBudgetInTarget,
    remainingTarget,
  };
}, [scopeItems, scopeExtras, targetCurrency, fxGlobal, selectedTrip, trips]);
// ---- Saved Extras: grouped view (title+category+currency) ----
const groupedExtras = useMemo(() => {
  const map = new Map();
  for (const ex of scopeExtras) {
    const cur =
      normalizeCurrencyInput(ex.currency || "") || currencyOf(ex.tripId) || "THB";
    const key = [
      ex.tripId || "",
      (ex.title || "").trim().toLowerCase(),
      ex.category || "",
      cur,
    ].join("|");

    if (!map.has(key)) {
      map.set(key, {
        key,
        tripId: ex.tripId || "",
        title: ex.title || "Ek Masraf",
        category: ex.category || "yemek",
        currency: cur,
        planned: 0,
        spent: 0,
        refId: ex.id, // düzenlemeye referans
      });
    }
    const row = map.get(key);
    const amt = Number(ex.cost || 0) || 0;
    if (ex.kind === "planned") row.planned += amt;
    else row.spent += amt;
  }
  return Array.from(map.values());
}, [scopeExtras, trips]);

function removeExtraGroup(row) {
  if (!confirm(`"${row.title}" (${row.currency}) kaydının planlanan/harcanan tüm satırları silinsin mi?`)) return;
  const matchKey = (e) => {
    const cur =
      normalizeCurrencyInput(e.currency || "") || currencyOf(e.tripId) || "THB";
    return (
      (e.tripId || "") === row.tripId &&
      (e.title || "").trim().toLowerCase() === row.title.trim().toLowerCase() &&
      (e.category || "") === row.category &&
      cur === row.currency
    );
  };
  beginHistory("removeExtraGroup");
  setExtras(prev => prev.filter(e => !matchKey(e)));
}

  /* ---------------- CRUD: Items ---------------- */
  function openCreate(initial = {}) {
    const baseStart = initial.start ? new Date(initial.start) : new Date();
    const end = addOneHourSameDay(baseStart);
    setDraft({
      ...DEFAULT_ITEM,
      ...initial,
      id: "",
      start: toLocalInput(baseStart),
      end: toLocalInput(end),
      tripId: selectedTrip || "",
      // yeni kart açılırken boş expenses
      expenses: [],
    });
    setExpRows([]);
    setShowForm(true);
  }
  function editItem(it) {
  const normalized = {
    ...DEFAULT_ITEM,
    ...it,
    expenses: Array.isArray(it.expenses) ? it.expenses : [],
    mapLinks: it.mapLinks || [],
  };
  setDraft(normalized);
  // Mevcut masrafları tek-satır tablo modeline çevir
  const defCur = currencyOf(normalized.tripId) || targetCurrency || "THB";
  setExpRows(combineExpensesToRows(normalized.expenses, defCur));
  setShowForm(true);
}
  function saveDraft() {
    if (!draft.title.trim()) {
      alert("Başlık zorunlu");
      return;
    }
    let startD = new Date(draft.start);
    let endD = draft.end ? new Date(draft.end) : addOneHourSameDay(startD);
    if (endD <= startD) endD = addOneHourSameDay(startD);

    // masraf satırlarını temizle (boş olanları at) - (expRows → {planned, spent} kırılımı)
const cleanExpenses = [];
for (const r of expRows || []) {
  const label = (r?.label || "").trim() || "Masraf";
  const cur =
    normalizeCurrencyInput(r?.currency || "") ||
    currencyOf(draft.tripId) ||
    "THB";
  if (r?.planned !== "" && !isNaN(parseFloat(r.planned))) {
    cleanExpenses.push({
      id: uid(),
      label,
      amount: parseFloat(r.planned),
      currency: cur,
      kind: "planned",
    });
  }
  if (r?.spent !== "" && !isNaN(parseFloat(r.spent))) {
    cleanExpenses.push({
      id: uid(),
      label,
      amount: parseFloat(r.spent),
      currency: cur,
      kind: "spent",
    });
  }
}

    const newItem = {
      ...draft,
      start: toLocalInput(startD),
      end: toLocalInput(endD),
      id: draft.id || uid(),
      expenses: cleanExpenses,
      // legacy alanları sıfırla
      cost: "",
      currency: "",
    };

    beginHistory('saveDraft');
    setItems((prev) => {
      const i = prev.findIndex((x) => x.id === newItem.id);
      if (i >= 0) {
        const cp = [...prev];
        cp[i] = newItem;
        return cp;
      }
      return [...prev, newItem];
    });
    setShowForm(false);
    setDraft({ ...DEFAULT_ITEM });
  }
  function removeItem(id) {
    if (!confirm("Silinsin mi?")) return;
    beginHistory('removeItem');
    setItems((prev) => prev.filter((x) => x.id !== id));
  }
  function shiftItemMinutes(id, minutes){
  beginHistory('shiftItemMinutes');
  setItems(prev => prev.map(it => {
    if(it.id !== id) return it;
    const s = new Date(it.start);
    const e = it.end ? new Date(it.end) : null;
    s.setMinutes(s.getMinutes()+minutes);
    if(e) e.setMinutes(e.getMinutes()+minutes);
    return { ...it, start: toLocalISO(s), end: e ? toLocalISO(e) : it.end };
  }));
}
function isOverlappingWithAny(test, excludeId){
  const scoped = selectedTrip ? items.filter(i => i.tripId === selectedTrip) : items;
  return scoped.some(it => it.id !== excludeId && rangesOverlap(test, it));
}
function moveToNextFreeSlot(id, dir = 1, stepMin = 15, maxSteps = 7*24*60/15){
  const cur = items.find(x => x.id === id);
  if(!cur?.start) return;
  const dur = getDurationMs(cur);
  let s = new Date(cur.start);
  for(let i=0;i<maxSteps;i++){
    s = new Date(s.getTime() + dir * stepMin * 60000);
    const e = new Date(s.getTime() + dur);
    const test = { ...cur, start: toLocalISO(s), end: cur.end ? toLocalISO(e) : "" };
    if(!isOverlappingWithAny(test, id)){
      beginHistory('moveToNextFreeSlot');
      setItems(prev => prev.map(it => it.id === id ? test : it));
      return;
    }
  }
  alert("Uygun boşluk bulunamadı (yakın zamanda).");
}
function openConflictResolver(id){
  setFocusConflictId(id);
  setShowConflictPanel(true);
}


  // Trips
  function openTripModal() {
    setTripDraft({ id: "", name: "", currency: "THB" });
    setShowTripModal(true);
  }
  function saveTrip() {
    if (!tripDraft.name.trim()) {
      alert("Gezi adı zorunlu");
      return;
    }
    const curNorm = normalizeCurrencyInput(tripDraft.currency || "THB") || "THB";
    const t = { ...tripDraft, currency: curNorm, id: tripDraft.id || uid() };
    beginHistory('saveTrip');
    setTrips((prev) => {
      const i = prev.findIndex((x) => x.id === t.id);
      if (i >= 0) {
        const cp = [...prev];
        cp[i] = t;
        return cp;
      }
      return [...prev, t];
    });
    if (!selectedTrip) setSelectedTrip(t.id);
    setShowTripModal(false);
  }
  function editTrip(t) {
    setTripDraft(t);
    setShowTripModal(true);
  }
  function removeTrip(id) {
    if (!confirm("Bu gezi silinsin mi? (Planlar silinmez)")) return;
    beginHistory('removeTrip');
    setTrips((prev) => prev.filter((x) => x.id !== id));
    setItems((prev) => prev.map((it) => (it.tripId === id ? { ...it, tripId: "" } : it)));
    setExtras((prev) =>
      prev.map((ex) => (ex.tripId === id ? { ...ex, tripId: "" } : ex))
    );
    if (selectedTrip === id) setSelectedTrip("");
  }

  /* ---------------- Extras ---------------- */
  function extraGroupKey(obj, curNorm) {
  return [
    obj.tripId || "",
    obj.category || "",
    (obj.title || "").trim().toLowerCase(),
    curNorm || ""
  ].join("|");
}
  function resetExtraDraft() {
  setExtraDraft({
    ...DEFAULT_EXTRA,
    id: "",
    tripId: selectedTrip || "",
    title: "",
    category: "yemek",
    plannedCost: "",   // YENİ
    spentCost: "",     // YENİ
    currency: currencyOf(selectedTrip) || targetCurrency || "TRY",
  });
  setEditingExtraId(null);
}
  function addExtra() {
  if (!extraDraft.tripId) {
    alert("Lütfen bu ek masraf için bir gezi seçin.");
    return;
  }
  if (!extraDraft.title?.trim()) {
    alert("Başlık zorunlu");
    return;
  }

  const hasPlanned = extraDraft.plannedCost !== "" && !isNaN(parseFloat(extraDraft.plannedCost));
  const hasSpent   = extraDraft.spentCost   !== "" && !isNaN(parseFloat(extraDraft.spentCost));
  if (!hasPlanned && !hasSpent) {
    alert("Planlanan ve/veya Harcanan için bir tutar girin.");
    return;
  }

  const curNorm =
    normalizeCurrencyInput(extraDraft.currency || "") ||
    currencyOf(extraDraft.tripId) ||
    "THB";

  const batch = [];
  if (hasPlanned) {
    batch.push({
      id: uid(),
      tripId: extraDraft.tripId,
      title: extraDraft.title.trim(),
      category: extraDraft.category || "yemek",
      cost: Number(extraDraft.plannedCost),
      currency: curNorm,
      kind: "planned",
    });
  }
  if (hasSpent) {
    batch.push({
      id: uid(),
      tripId: extraDraft.tripId,
      title: extraDraft.title.trim(),
      category: extraDraft.category || "yemek",
      cost: Number(extraDraft.spentCost),
      currency: curNorm,
      kind: "spent",
    });
  }

  beginHistory('addExtra');
  setExtras((prev) => [...prev, ...batch]);
  resetExtraDraft();
}
  function startEditExtra(ex) {
  // Aynı gruptaki (title, category, tripId, currency) planned/spent kardeşlerini topla
  const curNorm = normalizeCurrencyInput(ex.currency || "") || currencyOf(ex.tripId) || "THB";
  const key = extraGroupKey(ex, curNorm);
  const siblings = extras.filter(e => extraGroupKey(e, normalizeCurrencyInput(e.currency || "") || currencyOf(e.tripId) || "THB") === key);

  const planned = siblings.find(s => s.kind === "planned");
  const spent   = siblings.find(s => s.kind !== "planned");

  setExtraDraft({
    id: ex.id, // referans
    tripId: ex.tripId || "",
    title: ex.title || "",
    category: ex.category || "yemek",
    currency: curNorm,
    plannedCost: planned ? planned.cost : "",
    spentCost:   spent   ? spent.cost   : "",
  });
  setEditingExtraId(ex.id);
}
  function saveExtra() {
  if (!extraDraft.tripId) {
    alert("Lütfen bu ek masraf için bir gezi seçin.");
    return;
  }
  if (!extraDraft.title?.trim()) {
    alert("Başlık zorunlu");
    return;
  }

  const hasPlanned = extraDraft.plannedCost !== "" && !isNaN(parseFloat(extraDraft.plannedCost));
  const hasSpent   = extraDraft.spentCost   !== "" && !isNaN(parseFloat(extraDraft.spentCost));
  if (!hasPlanned && !hasSpent) {
    alert("Planlanan ve/veya Harcanan için bir tutar girin.");
    return;
  }

  const curNorm =
    normalizeCurrencyInput(extraDraft.currency || "") ||
    currencyOf(extraDraft.tripId) ||
    "THB";

  // Aynı gruptaki eski planned/spent kayıtlarını temizle, yerine yenilerini yaz
  const key = extraGroupKey(extraDraft, curNorm);

  beginHistory('saveExtra');
  setExtras((prev) => {
    const cleared = prev.filter(e => extraGroupKey(e, normalizeCurrencyInput(e.currency || "") || currencyOf(e.tripId) || "THB") !== key);
    const batch = [];
    if (hasPlanned) {
      batch.push({
        id: uid(),
        tripId: extraDraft.tripId,
        title: extraDraft.title.trim(),
        category: extraDraft.category || "yemek",
        cost: Number(extraDraft.plannedCost),
        currency: curNorm,
        kind: "planned",
      });
    }
    if (hasSpent) {
      batch.push({
        id: uid(),
        tripId: extraDraft.tripId,
        title: extraDraft.title.trim(),
        category: extraDraft.category || "yemek",
        cost: Number(extraDraft.spentCost),
        currency: curNorm,
        kind: "spent",
      });
    }
    return [...cleared, ...batch];
  });

  resetExtraDraft();
}
  function removeExtra(id) {
    if (!confirm("Ek masraf silinsin mi?")) return;
    beginHistory('removeExtra');
    setExtras((prev) => prev.filter((e) => e.id !== id));
    if (editingExtraId === id) resetExtraDraft();
  }

  /* ---------------- Quick add / DnD ---------------- */
  function handleDoubleClickDay(e, day, baseHour) {
    const when = posToTime(day, e, baseHour);
    openCreate({ start: when });
  }
  function handleDragStart(e, item) {
    e.dataTransfer.setData("text/plain", item.id);
    // record mouse offset from top of the card so drop aligns the card top where user expects
    try {
      const rect = e.currentTarget.getBoundingClientRect();
      const rawOffset = e.clientY - rect.top;
      dragOffsetRef.current = Math.round(rawOffset / CELL_MIN_PX) * CELL_MIN_PX; // quantize offset to grid
    } catch (err) {
      dragOffsetRef.current = 0;
    }
    setDraggingId(item.id);
  }
  function handleDragEnd() {
    setDraggingId(null);
    setGhostPos(null);
  }



  /* ---------------- Budget snapshot ---------------- */
  function saveBudgetSnapshot(note = "") {
  const planned = Number(budgetData?.plannedTotalTarget || 0);
  const spent   = Number(budgetData?.spentTotalTarget   || 0);
  const snap = {
    id: uid(),
    tripId: selectedTrip || "",
    dateISO: new Date().toISOString(),
    targetCurrency,
    // backward-compat:
    totalTarget: planned + spent,
    // yeni alanlar:
    plannedTotalTarget: planned,
    spentTotalTarget: spent,
    note,
  };
  beginHistory('saveSnapshot');
  setSnapshots((prev) => [snap, ...prev]);
  alert("Bütçe snapshot kaydedildi.");
}

  function removeSnapshot(id) {
    if (!confirm("Bu snapshot silinsin mi?")) return;
    beginHistory('removeSnapshot');
    setSnapshots((prev) => prev.filter((s) => s.id !== id));
  }

  // ---- Trip budget editing (Budget page) ----
const [tripBudgetAmountDraft, setTripBudgetAmountDraft] = useState("");
const [tripBudgetCurrencyDraft, setTripBudgetCurrencyDraft] = useState("TRY");

useEffect(() => {
  const t = trips.find((x) => x.id === selectedTrip);
  if (t) {
    setTripBudgetAmountDraft(
      t.budgetAmount === "" || t.budgetAmount == null ? "" : Number(t.budgetAmount)
    );
    setTripBudgetCurrencyDraft(
      normalizeCurrencyInput(t.budgetCurrency || t.currency || "") || "TRY"
    );
  }
}, [selectedTrip, trips]);

function saveTripBudget(){
  if (!selectedTrip) { alert("Önce bir gezi seç."); return; }
  const amt = tripBudgetAmountDraft === "" ? "" : Number(tripBudgetAmountDraft);
  const cur = normalizeCurrencyInput(tripBudgetCurrencyDraft || "") || "TRY";
  beginHistory('saveTripBudget');
  setTrips(prev => prev.map(t => t.id === selectedTrip ? { ...t, budgetAmount: amt, budgetCurrency: cur } : t));
}

// ---- Add expense to a card from Budget page ----
const [budgetAddExpense, setBudgetAddExpense] = useState({
  itemId: "",
  label: "",
  amount: "",
  currency: targetCurrency,
  kind: "spent",
});

function addExpenseToItemFromBudget(){
  const { itemId, label, amount, currency, kind } = budgetAddExpense;
  if (!itemId) return alert("Kart seç.");
  if (!label.trim()) return alert("Etiket gerekli");
  if (amount === "" || isNaN(parseFloat(amount))) return alert("Tutar gerekli");
  const amt = parseFloat(amount);
  const cur = normalizeCurrencyInput(currency || "") || currencyOf(items.find(it=>it.id===itemId)?.tripId) || "THB";
  beginHistory('addExpenseFromBudget');
  setItems(prev => prev.map(it => it.id === itemId ? ({
    ...it,
    expenses: (Array.isArray(it.expenses) ? it.expenses : []).concat({ id: uid(), label: label.trim(), amount: amt, currency: cur, kind: (kind === 'planned' ? 'planned' : 'spent') })
  }) : it));
  setBudgetAddExpense({ itemId: "", label: "", amount: "", currency: targetCurrency, kind: "spent" });
}

  /* ---------------- Render ---------------- */
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/75 border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3 py-3">

            {/* SOL: Logo + İsim (solda sabit, küçülmez) */}
            <div className="flex items-center gap-2 shrink-0">
              <img
                src="/peregrin-logo.png"
                alt="Peregrin"
                className="h-9 sm:h-10 w-auto object-contain"
              />
              <h1 className="font-semibold text-xl">Peregrin</h1>
            </div>

            {/* ORTA: Nav butonları */}
            <nav className="flex items-center gap-2 ml-4">
              <button
                onClick={() => setView("list")}
                className={`px-3 py-1.5 rounded-xl border text-sm ${
                  view === "list" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white"
                }`}
              >
                Liste
              </button>
              <button
                onClick={() => setView("week")}
                className={`px-3 py-1.5 rounded-xl border text-sm ${
                  view === "week" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white"
                }`}
              >
                Haftalık Board
              </button>
              <button
                onClick={() => setView("budget")}
                className={`px-3 py-1.5 rounded-xl border text-sm ${
                  view === "budget" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white"
                }`}
              >
                Bütçe
              </button>
            </nav>

            {/* SAĞ: Seçiciler ve aksiyonlar (sağa yasla) */}
            <div className="ml-auto flex items-center gap-2 flex-wrap justify-end">

              {/* Gezi seçimi */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedTrip}
                  onChange={(e) => setSelectedTrip(e.target.value)}
                  className="px-3 py-2 rounded-xl border bg-white text-sm"
                >
                  <option value="">— Tüm Geziler —</option>
                  {trips.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.currency})
                    </option>
                  ))}
                </select>
                <button onClick={openTripModal} className="px-3 py-2 rounded-xl border text-sm">
                  + Gezi
                </button>
              </div>

              {/* Tarih & hızlı aksiyonlar */}
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={ymd(selectedDate)}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="px-3 py-2 rounded-xl border bg-white text-sm"
                />
                <button
                  onClick={() => openCreate({ start: new Date() })}
                  className="px-3 py-2 rounded-xl bg-green-600 text-white text-sm"
                >
                  + Yeni
                </button>
                <button
                  onClick={() => setShowConflictPanel(true)}
                  className={`px-3 py-2 rounded-xl border text-sm ${totalConflicts ? "border-rose-400 text-rose-700" : ""}`}
                  title="Çakışmaları görüntüle/çöz"
                >
                  Çakışmalar{totalConflicts ? ` (${totalConflicts})` : ""}
                </button>
                <button
                  onClick={fetchBigparaAndSetFx}
                  className="px-3 py-2 rounded-xl bg-sky-600 text-white text-sm"
                >
                  Kurları Güncelle
                </button>
                <button
                  onClick={undo}
                  disabled={!canUndo}
                  className="px-3 py-2 rounded-xl border text-sm disabled:opacity-40"
                  title="Geri Al (⌘Z / Ctrl+Z)"
                >
                  ↶ Geri Al
                </button>
                <button
                  onClick={redo}
                  disabled={!canRedo}
                  className="px-3 py-2 rounded-xl border text-sm disabled:opacity-40"
                  title="Yinele (⇧⌘Z / Ctrl+Y)"
                >
                  ↷ Yinele
                </button>
              </div>

              {/* Yedekle / Yükle (masaüstünde görünür) */}
              <button
                onClick={() => setShowSettings(true)}
                className="px-3 py-2 rounded-xl border text-sm flex items-center gap-2"
                title="Ayarlar"
              >
                {/* dişli ikon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4">
                  <path fill="currentColor" d="M12 8.5a3.5 3.5 0 1 1 0 7a3.5 3.5 0 0 1 0-7m8.94 2.56l-1.42-.82a7.9 7.9 0 0 0-.4-1l.73-1.46a.75.75 0 0 0-.2-.9l-1.1-1.1a.75.75 0 0 0-.9-.2l-1.46.73c-.33-.15-.67-.29-1.03-.39l-.81-1.43a.75.75 0 0 0-.67-.39h-1.56a.75.75 0 0 0-.67.39l-.81 1.43c-.36.1-.7.24-1.03.39L7.35 4.1a.75.75 0 0 0-.9.2l-1.1 1.1a.75.75 0 0 0-.2.9l.73 1.46c-.14.33-.28.67-.39 1.03l-1.43.81a.75.75 0 0 0-.39.67v1.56c0 .28.15.54.39.67l1.43.81c.1.36.24.7.39 1.03l-.73 1.46a.75.75 0 0 0 .2.9l1.1 1.1c.22.22.56.28.84.14l1.46-.73c.33.14.67.28 1.03.39l.81 1.43c.13.24.39.39.67.39h1.56c.28 0 .54-.15.67-.39l.81-1.43c.36-.1.7-.24 1.03-.39l1.46.73c.28.14.62.08.84-.14l1.1-1.1c.22-.22.28-.56.14-.84l-.73-1.46c.15-.33.29-.67.39-1.03l1.42-.81a.75.75 0 0 0 .4-.67v-1.56c0-.28-.15-.54-.4-.67z"/>
                </svg>
                Ayarlar
              </button>

            </div>
          </div>
        </div>

        {/* ince gradient çizgi */}
        <div className="h-[2px] w-full bg-gradient-to-r from-indigo-500/40 via-fuchsia-400/40 to-violet-500/40" />
      </header>


      <main className="max-w-6xl mx-auto p-4">
        {/* LIST */}
        {view === "list" && (
          <section className="mt-2 grid grid-cols-1 gap-3">
            {sortedItems.length === 0 && (
              <div className="border border-dashed rounded-2xl p-8 text-center text-slate-500 bg-white">
                Henüz kayıt yok. "+ Yeni" ile ekleyebilirsin.
              </div>
            )}
            {sortedItems.map((it) => {
              const totalTarget = itemTotalIn(it, targetCurrency);
              const expCount = itemExpenses(it).length;
              return (
                <article
                  key={it.id}
                  className="rounded-2xl border bg-white p-4 grid grid-cols-[1fr_auto] items-start gap-3 shadow-sm"
                >
                  <div className="flex items-start gap-2 flex-wrap min-w-0">
                    <div className={`px-2 py-1 rounded-lg border text-xs ${catMeta(it.category).badge}`}>
                      {catMeta(it.category).label}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-slate-900 truncate">{it.title || "Başlıksız"}</h3>
                      <div className="text-xs text-slate-500 mt-1 flex gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-mono">
                          {fmtTime(it.start)}
                          {it.end ? `→${fmtTime(it.end)}` : ""} · {ymd(it.start)}
                        </span>

                        {/* Konum linkleri */}
                        {it.mapLinks && it.mapLinks.length > 0 && (
                          <>
                            {it.mapLinks.slice(0, 3).map((ml, i) => (
                              <a
                                key={i}
                                href={ml.url}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2 py-0.5 rounded bg-slate-100 underline underline-offset-2"
                              >
                                📍 {ml.label || `Harita ${i + 1}`}
                              </a>
                            ))}
                            {it.mapLinks.length > 3 && (
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                +{it.mapLinks.length - 3} daha
                              </span>
                            )}
                          </>
                        )}

                        {/* Dış link */}
                        {it.url && (
                          <a
                            href={it.url}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-0.5 rounded bg-slate-100 underline underline-offset-2 text-sky-700"
                          >
                            🔗 Link
                          </a>
                        )}

                        {/* Çoklu masraf özet */}
                        {expCount > 0 && (
                          <span className="px-2 py-0.5 rounded bg-slate-100">
                            💸 {expCount} masraf · ≈{" "}
                            {totalTarget.toLocaleString(undefined, { maximumFractionDigits: 2 })} {targetCurrency}
                          </span>
                        )}

                        <span className="px-2 py-0.5 rounded bg-slate-100 flex items-center gap-1">
                          <i className={`inline-block w-2 h-2 rounded-full ${statusMeta(it.status).dot}`}></i>{" "}
                          {statusMeta(it.status).label}
                        </span>
                      </div>
                      {/* Çakışma rozeti */}
                      {conflictMap[it.id]?.length > 0 && (
                        <button
                          onClick={() => openConflictResolver(it.id)}
                          className="mt-2 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded border border-rose-200 bg-rose-50 text-rose-700"
                          title="Çakışmaları görüntüle"
                        >
                          ⚠ Çakışma ({conflictMap[it.id].length})
                        </button>
                      )}
                      {it.notes && <div className="text-xs text-slate-600 mt-1">🗒️ {it.notes}</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 justify-self-end">
                    <button
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200"
                      onClick={() => editItem(it)}
                    >
                      Düzenle
                    </button>
                    <button
                      className="px-3 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100"
                      onClick={() => removeItem(it.id)}
                    >
                      Sil
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {/* WEEK */}
        {view === "week" && (
          <section className="mt-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-2 rounded-xl border"
                  onClick={() => setSelectedDate(addDays(weekStart, -7))}
                >
                  ← Önceki
                </button>
                <div className="font-semibold">
                  Hafta: {fmtDate(weekDays[0])} – {fmtDate(weekDays[6])}
                </div>
                <button
                  className="px-3 py-2 rounded-xl border"
                  onClick={() => setSelectedDate(addDays(weekStart, 7))}
                >
                  Sonraki →
                </button>
              </div>
            </div>

            <div className="mt-4 overflow-auto rounded-xl border bg-white shadow-sm">
              <div className="min-w-[980px]">
                {/* Gün başlıkları */}
                <div
                  className="grid sticky top-[var(--header-h,0px)] z-10"
                  style={{ gridTemplateColumns: `80px repeat(7, 1fr)` }}
                >
                  <div className="px-2 py-2 text-sm font-medium text-right bg-slate-50 border-b border-r">
                    Saat
                  </div>
                  {weekDays.map((d, i) => (
                    <div
                      key={i}
                      className="px-2 py-2 text-sm font-medium text-center bg-slate-50 border-b border-l"
                    >
                      {d.toLocaleDateString(undefined, { weekday: "short" })}{" "}
                      <span className="font-mono">{fmtDate(d)}</span>
                    </div>
                  ))}
                </div>

                {/* Saat satırları + hücreler */}
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="grid"
                    style={{ gridTemplateColumns: `80px repeat(7, 1fr)`, height: ROW_H }}
                  >
                    <div className="px-2 text-right text-xs text-slate-500 font-mono border-r bg-slate-50 flex items-center justify-end">
                      {p2(h)}:00
                    </div>

                    {weekDays.map((d, i) => {
                      const dayList = sortedItems.filter((it) => overlapsDay(it, d));

                      const list = itemsAt(d, h);
                      const filled = list.length > 0;
                      const isGhost =
                        ghostPos &&
                        ghostPos.dayIndex === i &&
                        h * ROW_H <= ghostPos.topPx &&
                        (h + 1) * ROW_H > ghostPos.topPx;

                      return (
                        <div
                          key={i}
                          className={`relative h-full px-1 border-t border-l overflow-visible ${
                            filled ? "bg-indigo-50/30" : "bg-white"
                          }`}
                          onDoubleClick={(e) => handleDoubleClickDay(e, d, h)}
                          onDragOver={(e) => {
                            e.preventDefault();
                            if (resizing) return;
                            if (!draggingId) return;
                            const it = items.find((x) => x.id === draggingId);
                            if (!it) return;
                            const [sOld, eOld] = eventRange(it);
                            const dur = eOld - sOld;
                            const startD = posToTimeLocal(d, e, h);
                            const endD = new Date(startD.getTime() + dur);
                            const dayStart = new Date(d);
                            dayStart.setHours(0, 0, 0, 0);
                            const dayEnd = new Date(d);
                            dayEnd.setHours(23, 59, 0, 0);
                            const segStart = startD < dayStart ? dayStart : startD;
                            const segEnd = endD > dayEnd ? dayEnd : endD;
                            const topPx =
                              (segStart.getHours() + segStart.getMinutes() / 60) * ROW_H;
                            const heightPx = Math.max(((segEnd - segStart) / 3600000) * ROW_H, 6);
                            const snappedTopPx = Math.round(topPx / CELL_MIN_PX) * CELL_MIN_PX;
                            updateGhostPosWithConflicts({
                              dayIndex: i,
                              topPx: snappedTopPx,
                              heightPx,
                              label: `${fmtHM(startD)} → ${fmtHM(endD)}`,
                            });
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (resizing) return;
                            const id = e.dataTransfer.getData("text/plain");
                            if (!id) return;
                            const it = items.find((x) => x.id === id);
                            if (!it) return;
                            const [sOld, eOld] = eventRange(it);
                            const dur = eOld - sOld;
                            const startD = posToTimeLocal(d, e, h);
                            const endD = new Date(startD.getTime() + dur);
                            beginHistory('drop-move');
                            setItems((prev) =>
                              prev.map((x) =>
                                x.id === id
                                  ? { ...x, start: toLocalInput(startD), end: toLocalInput(endD) }
                                  : x
                              )
                            );
                            setDraggingId(null);
                            setGhostPos(null);
                          }}
                          onMouseMove={(e) => {
                            if (!resizing) return;
                            const it = items.find((x) => x.id === resizing.id);
                            if (!it) return;
                            const [sOld, eOld] = eventRange(it);
                            let sNew = sOld,
                              eNew = eOld;
                            if (resizing.edge === "start") {
                              let candidate = posToTimeSnappedNoOffset(d, e, h);
                              const maxStart = new Date(eOld.getTime() - SNAP_MIN * 60000);
                              if (candidate > maxStart) candidate = maxStart;
                              sNew = candidate;
                            } else {
                              let candidate = posToTimeSnappedNoOffset(d, e, h);
                              const minEnd = new Date(sOld.getTime() + SNAP_MIN * 60000);
                              if (candidate < minEnd) candidate = minEnd;
                              eNew = candidate;
                            }
                            // Resize esnası canlı çakışma kontrolü
                            const scope = it.tripId
                              ? items.filter((x) => x.tripId === it.tripId && x.id !== it.id)
                              : items.filter((x) => x.id !== it.id);
                            const test = { ...it, start: toLocalISO(sNew), end: toLocalISO(eNew) };
                            const conflicts = getConflictsForRange(test, it.id, scope);
                            setHoverConflicts(conflicts);

                            const dayStart = new Date(d);
                            dayStart.setHours(0, 0, 0, 0);
                            const dayEnd = new Date(d);
                            dayEnd.setHours(23, 59, 0, 0);
                            const segStart = sNew < dayStart ? dayStart : sNew;
                            const segEnd = eNew > dayEnd ? dayEnd : eNew;
                            const topPx =
                              (segStart.getHours() + segStart.getMinutes() / 60) * ROW_H;
                            const heightPx = Math.max(((segEnd - segStart) / 3600000) * ROW_H, 6);
                            const label = `${fmtHM(sNew)} → ${fmtHM(eNew)}`;
                            setResizingPreview({ dayIndex: i, topPx, heightPx, label });
                            updateGhostPosWithConflicts({ dayIndex: i, topPx, heightPx, label });
                          }}
                          onMouseUp={(e) => {
                            if (!resizing) return;
                            const it = items.find((x) => x.id === resizing.id);
                            if (!it) {
                              setResizing(null);
                              setResizingPreview(null);
                              setGhostPos(null);
                              return;
                            }
                            const [sOld, eOld] = eventRange(it);
                            let sNew = sOld,
                              eNew = eOld;
                            if (resizing.edge === "start") {
                              let candidate = posToTimeSnappedNoOffset(d, e, h);
                              const maxStart = new Date(eOld.getTime() - SNAP_MIN * 60000);
                              if (candidate > maxStart) candidate = maxStart;
                              sNew = candidate;
                            } else {
                              let candidate = posToTimeSnappedNoOffset(d, e, h);
                              const minEnd = new Date(sOld.getTime() + SNAP_MIN * 60000);
                              if (candidate < minEnd) candidate = minEnd;
                              eNew = candidate;
                            }
                            suppressClickUntilRef.current = Date.now() + 300; // 300ms window to ignore clicks
                            beginHistory('resize');
                            setItems((prev) =>
                              prev.map((x) =>
                                x.id === it.id
                                  ? { ...x, start: toLocalInput(sNew), end: toLocalInput(eNew) }
                                  : x
                              )
                            );
                            setResizing(null);
                            setResizingPreview(null);
                            setGhostPos(null);
                          }}
                          onDragLeave={() => !resizing && setGhostPos(null)}
                          title={filled ? `${list.length} kayıt` : "Çift tıkla: hızlı ekle"}
                        >
                          {/* NOW line (today) */}
                          {h === 0 && isSameDayStr(now, d) && (
                            <>
                              <div
                                className="absolute left-1 right-1 h-[2px] bg-rose-500/90 pointer-events-none"
                                style={{ top: (now.getHours() + now.getMinutes() / 60) * ROW_H, zIndex: 70 }}
                              />
                              <div
                                className="absolute right-1 -translate-y-1/2 text-[10px] bg-rose-600 text-white px-1.5 py-0.5 rounded shadow pointer-events-none"
                                style={{ top: (now.getHours() + now.getMinutes() / 60) * ROW_H, zIndex: 71 }}
                              >
                                şimdi
                              </div>
                            </>
                          )}

                          {/* live resize ghost: show a translucent blue overlay while resizing */}
                          {resizing && resizingPreview && resizingPreview.dayIndex === i && h === 0 && (
                            <div
                              className={`absolute left-1 right-1 rounded-lg pointer-events-none border p-1 text-[10px] bg-sky-500/30 text-sky-900`}
                              style={{ top: resizingPreview.topPx, height: resizingPreview.heightPx, zIndex: 60, boxSizing: 'border-box' }}
                            >
                              <div className="font-medium truncate">{resizingPreview.label}</div>
                            </div>
                          )}

                          {/* drag ghost: show a translucent dashed overlay while dragging */}
                          {ghostPos &&
                            ghostPos.dayIndex === i &&
                            h === 0 &&
                            draggingId &&
                            !resizing && (
                              <div
                                className="absolute left-1 right-1 border-2 border-dashed border-indigo-400 bg-indigo-200/30 rounded-lg pointer-events-none"
                                style={{ top: ghostPos.topPx, height: ghostPos.heightPx, zIndex: 55 }}
                              />
                            )}

                          {/* kartlar yalnızca ilk satırda */}
                          {h === 0 &&
                            dayList.map((it) => {
                              const [s, e] = eventRange(it);
                              const dayStart = new Date(d);
                              dayStart.setHours(0, 0, 0, 0);
                              const dayEnd = new Date(d);
                              dayEnd.setHours(23, 59, 0, 0);
                              const start = s < dayStart ? dayStart : s;
                              const end = e > dayEnd ? dayEnd : e;

                              const startHours = start.getHours() + start.getMinutes() / 60;
                              const durHours = Math.max((end - start) / 3600000, 0.1);
                              const topPx = startHours * ROW_H;
                              const heightPx = Math.max(durHours * ROW_H, 20);
                              const compact = durHours <= 1;

                              const totalTarget = itemTotalIn(it, targetCurrency);
                              const expCount = itemExpenses(it).length;

                              return (
                                <button
                                  key={it.id}
                                  draggable={!resizing}
                                  onDragStart={(e) => handleDragStart(e, it)}
                                  onDragEnd={handleDragEnd}
                                  onClick={() => {
                                    if (Date.now() < suppressClickUntilRef.current) return; // ignore just after resize
                                    if (!draggingId && !resizing) editItem(it);
                                  }}
                                  className={`group absolute left-0 right-0 mx-1 w-auto rounded-lg border shadow-sm text-left px-2 ${
                                    compact ? "pt-2 pr-2 pb-5" : "pt-4 pr-4 pb-6"
                                  } flex flex-col gap-0.5 overflow-visible cursor-pointer ${
                                    catMeta(it.category).badge
                                  } ${
                                    (draggingId === it.id)
                                      ? "opacity-60 saturate-50"
                                      : it.status === "done"
                                      ? "opacity-90"
                                      : it.status === "cancelled"
                                      ? "opacity-60 saturate-50"
                                      : ""
                                  } ${
                                    conflictMap[it.id]?.length ? "ring-2 ring-rose-400" : ""
                                  }`}
                                  style={{ top: topPx, height: heightPx, zIndex: 30 }}
                                  title={`${fmtTime(it.start)}${
                                    it.end ? ` → ${fmtTime(it.end)}` : ""
                                  }`}
                                >
                                  {conflictMap[it.id]?.length > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow">
                                      ⚠ {conflictMap[it.id].length}
                                    </span>
                                  )}
                                  {/* Status dot */}
                                  <div className="absolute top-1 right-1">
                                    <div
                                      className={`w-2.5 h-2.5 rounded-full ${statusMeta(it.status).dot} ring-1 ring-white/80 shadow pointer-events-none`}
                                      title={statusMeta(it.status).label}
                                    />
                                  </div>

                                  {/* İçerik */}
                                  {compact ? (
                                    <>
                                      <div
                                        className={`text-[12px] leading-tight font-medium truncate ${
                                          it.status === "done" ? "line-through" : ""
                                        }`}
                                        title={it.title || "Başlıksız"}
                                      >
                                        {it.title || "Başlıksız"}
                                      </div>
                                      <div className="absolute bottom-1 left-1 font-mono text-[9px] opacity-80 bg-white/70 rounded px-1">
                                        {fmtTime(it.start)}
                                        {it.end ? ` → ${fmtTime(it.end)}` : ""}
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <div
                                        className={`text-[11px] font-medium leading-tight truncate ${
                                          it.status === "done" ? "line-through" : ""
                                        }`}
                                      >
                                        {(it.title && it.title.trim()) ? it.title : "Başlıksız"}
                                      </div>
                                      <div className="text-[10px] font-mono opacity-80">
                                        {fmtTime(it.start)}
                                        {it.end ? ` → ${fmtTime(it.end)}` : ""}
                                      </div>

                                      {/* Live resize preview label */}
                                      {resizing && resizing.id === it.id && resizingPreview && (
                                        <div className="absolute -top-3 left-2 text-[11px] font-medium bg-white/90 px-2 py-0.5 rounded shadow pointer-events-none">
                                          {resizingPreview.label}
                                        </div>
                                      )}

                                      {/* çoklu masraf kısa özet */}
                                      {expCount > 0 && (
                                        <div className="text-[10px] opacity-80">
                                          💸 {expCount} masraf · ≈{" "}
                                          {totalTarget.toLocaleString(undefined, {
                                            maximumFractionDigits: 2,
                                          })}{" "}
                                          {targetCurrency}
                                        </div>
                                      )}

                                      <div className="mt-0.5 flex items-center gap-2 text-[10px] flex-wrap">
                                        {(it.mapLinks || []).slice(0, 2).map((ml, idx) => (
                                          <a
                                            key={idx}
                                            href={ml.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-sky-700 underline underline-offset-2"
                                          >
                                            📍 {ml.label || `Harita ${idx + 1}`}
                                          </a>
                                        ))}
                                        {it.mapLinks && it.mapLinks.length > 2 && (
                                          <span>+{it.mapLinks.length - 2}</span>
                                        )}
                                        {it.url && (
                                          <a
                                            href={it.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-sky-700 underline underline-offset-2"
                                          >
                                            🔗 Link
                                          </a>
                                        )}
                                      </div>
                                    </>
                                  )}

                                  {/* Resize tutamakları */}
                                  <div
                                    className="absolute left-0 right-0 top-0 h-2 cursor-n-resize"
                                    onMouseDown={(e) => {
                                      e.stopPropagation();
                                      setResizing({ id: it.id, edge: "start" });
                                    }}
                                  />
                                  <div
                                    className="absolute left-0 right-0 bottom-0 h-[3px] cursor-s-resize"
                                    onMouseDown={(e) => {
                                      e.stopPropagation();
                                      setResizing({ id: it.id, edge: "end" });
                                    }}
                                  />
                                </button>
                              );
                            })}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            <div className="text-xs text-slate-500 mt-2">
              İpucu: Hücreye <b>çift tıkla</b> hızlı ekle; kartı <b>sürükle-bırak</b> ile taşı; üst/alt
              kenardan <b>resize</b> ile süreyi değiştir.
            </div>
          </section>
        )}

        {/** BUDGET */}
        {view === "budget" && (
          <section className="mt-3 space-y-6">
            {/* ÜST KART: Para birimi, kurlar, snapshot, hedef bütçe ve toplamlar */}
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-end justify-between gap-3">
                {/* SOL: Görüntüleme para birimi + kurlar + snapshot + (varsa) gezi hedef bütçesi */}
                <div>
                  <div className="text-sm text-slate-500">Görüntüleme Para Birimi</div>
                  <div className="flex items-center gap-2 mt-1">
                    <select
                      value={targetCurrency}
                      onChange={(e) => setTargetCurrency(e.target.value)}
                      className="px-3 py-2 rounded-xl border bg-white text-sm"
                    >
                      {CURRENCY_OPTIONS.map((opt) => (
                        <option key={opt.code} value={opt.code}>
                          {opt.code} — {opt.name}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={fetchBigparaAndSetFx}
                      className="px-3 py-2 rounded-xl bg-sky-600 text-white text-sm"
                      title="Bigpara verisinden TRY bazlı kurları çek"
                    >
                      Kurları Bigpara’dan Güncelle
                    </button>

                    <span className="text-xs text-slate-500">
                      Kaynak: {fxGlobal?.source || "—"}
                      {fxGlobal?.updatedAt ? ` · ${new Date(fxGlobal.updatedAt).toLocaleString()}` : ""}
                    </span>

                    <button
                      onClick={() => {
                        const note = prompt("İsteğe bağlı not (örn. 'Rezervasyon öncesi')");
                        saveBudgetSnapshot(note || "");
                      }}
                      className="px-3 py-2 rounded-xl border text-sm bg-emerald-600 text-white"
                      title="Toplamı bu anın kurlarıyla kaydet"
                    >
                      💾 Bütçeyi Kaydet
                    </button>
                  </div>

                  {/* Gezi hedef bütçesi */}
                  {selectedTrip && (
                    <div className="mt-3">
                      <div className="text-sm text-slate-500 mb-1">Gezi Hedef Bütçesi</div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          inputMode="decimal"
                          className="px-3 py-2 rounded-xl border bg-white text-sm w-36"
                          placeholder="Tutar"
                          value={tripBudgetAmountDraft}
                          onChange={(e) => setTripBudgetAmountDraft(e.target.value)}
                        />
                        <select
                          value={tripBudgetCurrencyDraft}
                          onChange={(e) => setTripBudgetCurrencyDraft(e.target.value)}
                          className="px-3 py-2 rounded-xl border bg-white text-sm"
                        >
                          {CURRENCY_OPTIONS.map((opt) => (
                            <option key={opt.code} value={opt.code}>
                              {opt.code} — {opt.name}
                            </option>
                          ))}
                        </select>
                        <button onClick={saveTripBudget} className="px-3 py-2 rounded-xl border text-sm">
                          Kaydet
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* SAĞ: Toplamlar */}
                <div className="text-right">
                  <div className="text-sm text-slate-500">Toplamlar ({targetCurrency})</div>
                  <div className="text-sm">
                    Planlanan: {Number(budgetData?.plannedTotalTarget || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} {targetCurrency}
                  </div>
                  <div className="text-lg font-semibold">
                    Harcanan: {Number(budgetData?.spentTotalTarget || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} {targetCurrency}
                  </div>
                  {selectedTrip && typeof budgetData?.tripBudgetInTarget === "number" && (
                    <div className="mt-1 text-sm">
                      Hedef: {Number(budgetData.tripBudgetInTarget).toLocaleString(undefined, { maximumFractionDigits: 2 })} {targetCurrency} ·{" "}
                      <span className={(Number(budgetData?.remainingTarget ?? 0) >= 0) ? "text-emerald-700" : "text-rose-700"}>
                        {Number(budgetData?.remainingTarget ?? 0) >= 0 ? "Kalan" : "Aşıldı"}: {Math.abs(Number(budgetData?.remainingTarget ?? 0)).toLocaleString(undefined, { maximumFractionDigits: 2 })} {targetCurrency}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Kategori dağılımı ve kalemler */}
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h3 className="font-semibold mb-3">Kategori Dağılımı</h3>
              {budgetData.rows.length === 0 ? (
                <div className="text-sm text-slate-500">Henüz veri yok.</div>
              ) : (
                <div className="space-y-3">
                  {budgetData.rows.map((r) => (
                    <div key={r.cat} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded border text-xs ${r.badge}`}>{r.label}</span>
                        </div>
                        <div className="text-xs text-slate-600">
                          Planlanan: {r.plannedTarget.toLocaleString(undefined, { maximumFractionDigits: 2 })} {targetCurrency} ·{" "}
                          Harcanan: {r.spentTarget.toLocaleString(undefined, { maximumFractionDigits: 2 })} {targetCurrency}
                        </div>
                      </div>
                      <div className="mt-2 h-2 bg-slate-100 rounded">
                        <div
                          className={`${r.bar} h-2 rounded`}
                          style={{ width: `${Math.min(100, (budgetData.spentTotalTarget > 0 ? (r.spentTarget * 100) / budgetData.spentTotalTarget : 0))}%` }}
                        />
                      </div>
                      {r.entries.length > 0 && (
                        <ul className="mt-2 text-sm text-slate-700 space-y-1">
                          {r.entries.map((e, idx) => (
                            <li key={idx} className="flex items-center justify-between">
                              <span className="truncate">{e.title}</span>
                              <span className="font-mono">
                                {Number(e.cost).toLocaleString(undefined, { maximumFractionDigits: 2 })} {e.currency}
                                {" "}≈{" "}
                                {Number(e.costTarget).toLocaleString(undefined, { maximumFractionDigits: 2 })} {targetCurrency}
                                {e.kind === 'planned' ? ' (plan)' : ''}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
 
{/* --- EK MASRAF EKLE (YENİ) + LİSTE --- */}
<div className="mt-8 space-y-6">

  {/* Ek Masraf Ekle */}
  <div className="rounded-xl border bg-white p-4 shadow-sm">
    <div className="text-sm font-medium mb-3">Ek Masraf Ekle</div>

    <div className="grid grid-cols-12 gap-3">
      {/* Gezi */}
      <div className="col-span-12 sm:col-span-3">
        <label className="text-xs text-slate-500 block mb-1">Gezi</label>
        <select
          className="w-full px-3 py-2 rounded-xl border bg-white"
          value={extraDraft.tripId || (selectedTrip || "")}
          onChange={e => setExtraDraft(d => ({ ...d, tripId: e.target.value }))}
        >
          <option value="">— Seç —</option>
          {trips.map(t => (
            <option key={t.id} value={t.id}>{t.name} ({t.currency})</option>
          ))}
        </select>
      </div>

      {/* Kategori */}
      <div className="col-span-12 sm:col-span-3">
        <label className="text-xs text-slate-500 block mb-1">Kategori</label>
        <select
          className="w-full px-3 py-2 rounded-xl border bg-white"
          value={extraDraft.category || "yemek"}
          onChange={e => setExtraDraft(d => ({ ...d, category: e.target.value }))}
        >
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      {/* Başlık */}
      <div className="col-span-12 sm:col-span-6">
        <label className="text-xs text-slate-500 block mb-1">Başlık</label>
        <input
          className="w-full px-3 py-2 rounded-xl border bg-white"
          placeholder="Örn. Vize, Sim Kart"
          value={extraDraft.title || ""}
          onChange={e => setExtraDraft(d => ({ ...d, title: e.target.value }))}
        />
      </div>

      {/* Planlanan */}
      <div className="col-span-12 sm:col-span-4">
        <label className="text-xs text-slate-500 block mb-1">Planlanan</label>
        <input
          type="number" step="0.01"
          className="w-full px-3 py-2 rounded-xl border bg-white"
          value={extraDraft.plannedCost ?? ""}
          onChange={e => setExtraDraft(d => ({ ...d, plannedCost: e.target.value }))}
        />
      </div>

      {/* Harcanan */}
      <div className="col-span-12 sm:col-span-4">
        <label className="text-xs text-slate-500 block mb-1">Harcanan</label>
        <input
          type="number" step="0.01"
          className="w-full px-3 py-2 rounded-xl border bg-white"
          value={extraDraft.spentCost ?? ""}
          onChange={e => setExtraDraft(d => ({ ...d, spentCost: e.target.value }))}
        />
      </div>

      {/* Para Birimi */}
      <div className="col-span-8 sm:col-span-3">
        <label className="text-xs text-slate-500 block mb-1">Para Birimi</label>
        <select
          className="w-full px-3 py-2 rounded-xl border bg-white"
          value={extraDraft.currency || currencyOf(extraDraft.tripId) || targetCurrency}
          onChange={e => setExtraDraft(d => ({
            ...d,
            currency: normalizeCurrencyInput(e.target.value) || e.target.value,
          }))}
        >
          {CURRENCY_OPTIONS.map(o => (
            <option key={o.code} value={o.code}>{o.code} — {o.name}</option>
          ))}
        </select>
      </div>

      {/* Ekle/Güncelle */}
      <div className="col-span-4 sm:col-span-2 flex items-end">
        <button
          type="button"
          onClick={editingExtraId ? saveExtra : addExtra}
          className="w-full px-3 py-2 rounded-xl border bg-slate-900 text-white hover:bg-slate-800"
        >
          {editingExtraId ? "Güncelle" : "Ekle"}
        </button>
      </div>
    </div>
  </div>

  {/* Ek Masraflar (Liste) */}
  {(() => {
    const scoped = selectedTrip ? extras.filter(e => e.tripId === selectedTrip) : extras;
    // (tripId, category, title, currency) ile grupla; planlanan/harcananı aynı satıra birleştir
    const map = new Map();
    for (const ex of scoped) {
      const cur = normalizeCurrencyInput(ex.currency || "") || currencyOf(ex.tripId) || "THB";
      const key = [ex.tripId || "", ex.category || "", (ex.title || "").trim().toLowerCase(), cur].join("|");
      if (!map.has(key)) {
        map.set(key, {
          key,
          refId: ex.id,               // startEditExtra için referans
          tripId: ex.tripId || "",
          category: ex.category || "yemek",
          title: ex.title || "",
          currency: cur,
          planned: "",
          spent: "",
          plannedId: null,
          spentId: null,
        });
      }
      const row = map.get(key);
      if (ex.kind === "planned") {
        row.planned = Number(ex.cost);
        row.plannedId = ex.id;
      } else {
        row.spent = Number(ex.cost);
        row.spentId = ex.id;
      }
    }
    const rows = Array.from(map.values());

    return (
      <div className="rounded-xl border bg-white p-4 shadow-sm">
  <div className="text-sm font-medium mb-3">Kaydedilmiş Ek Masraflar</div>

  {groupedExtras.length === 0 ? (
    <div className="text-sm text-slate-500">Henüz ek masraf yok.</div>
  ) : (
    <div className="overflow-x-auto">
      <div className="min-w-[900px]">
        {/*
          TEK KAYNAK: kolon şablonu.
          Başlık ve satırlar aynı şablonu kullanacak.
        */}
        <div
  className="grid items-center text-xs text-slate-500 mb-2 gap-4"
  style={{
    gridTemplateColumns:
      "minmax(200px,1.6fr) minmax(140px,1fr) minmax(120px,1fr) minmax(120px,1fr) minmax(120px,1fr) 100px",
    columnGap: "16px",
  }}
>
          <div>Başlık</div>
          <div>Kategori</div>
          <div className="text-right">Planlanan</div>
          <div className="text-right">Harcanan</div>
          <div className="text-left pl-2">Para Birimi</div>
          <div></div>
        </div>

        {/* SATIRLAR — aynı gridTemplateColumns */}
        <div className="divide-y">
          {groupedExtras.map((row) => {
            const catLabel =
              (CATEGORIES.find((c) => c.value === row.category) || {}).label ||
              row.category;
            const planned = Number(row.planned) || 0;
            const spent = Number(row.spent) || 0;

            return (
              <div
  className="grid items-center py-2 border-t gap-4"
  style={{
    gridTemplateColumns:
      "minmax(200px,1.6fr) minmax(140px,1fr) minmax(120px,1fr) minmax(120px,1fr) minmax(120px,1fr) 100px",
    columnGap: "16px",
  }}
>
                <div className="font-medium break-words">{row.title}</div>
                <div className="text-slate-600">{catLabel}</div>

                <div
                  className={`text-right tabular-nums ${
                    planned >= spent ? "text-emerald-700" : "text-slate-700"
                  }`}
                  title={planned.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                >
                  {planned.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>

                <div
                  className={`text-right tabular-nums ${
                    spent > planned ? "text-rose-700" : "text-slate-700"
                  }`}
                  title={spent.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                >
                  {spent.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>

                <div className="text-slate-600">{row.currency}</div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      startEditExtra({
                        id: row.refId,
                        tripId: row.tripId,
                        title: row.title,
                        category: row.category,
                        currency: row.currency,
                        kind: "spent",
                        cost: row.spent,
                      })
                    }
                    className="px-2 py-1 rounded-lg border text-xs"
                  >
                    Düzenle
                  </button>
                  <button
                    type="button"
                    onClick={() => removeExtraGroup(row)}
                    className="px-2 py-1 rounded-lg border text-xs text-rose-700"
                  >
                    Sil
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  )}
</div>
    );
  })()}
</div>
          </section>
        )}
      </main>

      {/* MODALS */}
      {showSettings && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 sm:p-8"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold">Ayarlar & Veri Yönetimi</h3>
            <div className="mt-4 space-y-3">
              <div>
                <h4 className="font-medium">Yedekle</h4>
                <div className="text-sm text-slate-600">
                  Tüm verilerinizi (planlar, geziler, ek masraflar, anlık bütçe kayıtları,
                  kur bilgileri) tek bir JSON dosyası olarak indirin.
                </div>
                <div className="mt-2 flex gap-2">
                  <button onClick={exportAllAsJSON} className="px-3 py-2 rounded-xl border text-sm">
                    Tümünü İndir
                  </button>
                  <button
                    onClick={exportSelectedTripAsJSON}
                    disabled={!selectedTrip}
                    className="px-3 py-2 rounded-xl border text-sm disabled:opacity-50"
                  >
                    Sadece Seçili Geziyi İndir
                  </button>
                </div>
              </div>
              <div>
                <h4 className="font-medium">Yedekten Yükle</h4>
                <div className="text-sm text-slate-600">
                  Daha önce indirdiğiniz bir JSON yedek dosyasını yükleyin.
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => triggerImport("merge")}
                    className="px-3 py-2 rounded-xl border text-sm"
                  >
                    Yükle (Birleştir)
                  </button>
                  <button
                    onClick={() => triggerImport("replace")}
                    className="px-3 py-2 rounded-xl border border-rose-400 text-rose-700 text-sm"
                  >
                    Yükle (Üzerine Yaz)
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".json"
                    onChange={handleImportFile}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTripModal && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setShowTripModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold">
              {tripDraft.id ? "Geziyi Düzenle" : "Yeni Gezi"}
            </h3>
            <div className="mt-4 space-y-3">
              <input
                type="text"
                placeholder="Gezi Adı (örn. Tayland 2024)"
                value={tripDraft.name}
                onChange={(e) => setTripDraft({ ...tripDraft, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border"
              />
              <input
                type="text"
                placeholder="Varsayılan Para Birimi (örn. THB)"
                value={tripDraft.currency}
                onChange={(e) => setTripDraft({ ...tripDraft, currency: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border"
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowTripModal(false)}
                className="px-4 py-2 rounded-xl border"
              >
                İptal
              </button>
              <button onClick={saveTrip} className="px-4 py-2 rounded-xl bg-indigo-600 text-white">
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md md:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold">{draft.id ? "Planı Düzenle" : "Yeni Plan Ekle"}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-3">
                 <input type="text" placeholder="Başlık" value={draft.title} onChange={e => setDraft({...draft, title: e.target.value})} className="w-full px-3 py-2 rounded-xl border" />
                <select value={draft.category} onChange={e => setDraft({...draft, category: e.target.value})} className="w-full px-3 py-2 rounded-xl border">
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <select value={draft.status} onChange={e => setDraft({...draft, status: e.target.value})} className="w-full px-3 py-2 rounded-xl border">
                  {STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <select value={draft.tripId} onChange={e => setDraft({...draft, tripId: e.target.value})} className="w-full px-3 py-2 rounded-xl border">
                  <option value="">— Gezi Seç —</option>
                  {trips.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                <input type="datetime-local" value={draft.start} onChange={e => setDraft({...draft, start: e.target.value})} className="w-full px-3 py-2 rounded-xl border" />
                <input type="datetime-local" value={draft.end} onChange={e => setDraft({...draft, end: e.target.value})} className="w-full px-3 py-2 rounded-xl border" />
                <input type="url" placeholder="URL (opsiyonel)" value={draft.url} onChange={e => setDraft({...draft, url: e.target.value})} className="w-full px-3 py-2 rounded-xl border" />
                 <textarea placeholder="Notlar" value={draft.notes} onChange={e => setDraft({...draft, notes: e.target.value})} className="w-full px-3 py-2 rounded-xl border min-h-[60px]" />
              </div>
              <div className="md:col-span-2">
              {/* Masraflar (tek satırda planlanan/harcanan) */}
<div className="mt-4 w-full min-w-0">
  <div className="flex items-center justify-between mb-2">
    <label className="font-medium text-slate-600">Masraflar</label>
    <button
      type="button"
      onClick={() =>
        setExpRows((rs) =>
          rs.concat({
            id: uid(),
            label: "",
            planned: "",
            spent: "",
            currency: currencyOf(draft.tripId) || targetCurrency || "THB",
          })
        )
      }
      className="px-2 py-1.5 text-sm rounded-lg border"
    >
      + Masraf
    </button>
  </div>

  {/* Küçük ekranlarda sağa kaymayı engelle */}
  <div className="overflow-x-auto">
    {/* Başlık satırı (md+ için) */}
    <div className="hidden md:grid grid-cols-[1fr_140px_140px_130px_72px] gap-2 text-xs text-slate-500 px-1 mb-1 w-full min-w-[640px]">
      <div>Masraf Adı</div>
      <div>Planlanan</div>
      <div>Harcanan</div>
      <div>Para Birimi</div>
      <div></div>
    </div>

    <div className="space-y-2">
      {expRows.length === 0 && (
        <div className="text-sm text-slate-500 px-1">Henüz masraf yok.</div>
      )}

      {expRows.map((row) => {
        const planned = row.planned === "" ? NaN : Number(row.planned);
        const spent = row.spent === "" ? NaN : Number(row.spent);
        const good = Number.isFinite(planned) && Number.isFinite(spent) && spent <= planned;
        const bad  = Number.isFinite(planned) && Number.isFinite(spent) && spent  > planned;

        return (
          <div
            key={row.id}
            className="grid grid-cols-1 md:grid-cols-[1fr_140px_140px_130px_72px] gap-2 w-full min-w-[640px]"
          >
            <input
              className="w-full px-3 py-2 rounded-xl border bg-white text-sm"
              placeholder="Etiket (örn. Giriş, Yol)"
              value={row.label}
              onChange={(e) =>
                setExpRows((rs) =>
                  rs.map((r) => (r.id === row.id ? { ...r, label: e.target.value } : r))
                )
              }
            />
            <input
              type="number"
              inputMode="decimal"
              placeholder="0"
              className="w-full px-3 py-2 rounded-xl border bg-white text-sm"
              value={row.planned}
              onChange={(e) =>
                setExpRows((rs) =>
                  rs.map((r) => (r.id === row.id ? { ...r, planned: e.target.value } : r))
                )
              }
            />
            <input
              type="number"
              inputMode="decimal"
              placeholder="0"
              className={`w-full px-3 py-2 rounded-xl border bg-white text-sm ${
                good ? "border-emerald-400 bg-emerald-50" : ""
              } ${bad ? "border-rose-400 bg-rose-50" : ""}`}
              value={row.spent}
              onChange={(e) =>
                setExpRows((rs) =>
                  rs.map((r) => (r.id === row.id ? { ...r, spent: e.target.value } : r))
                )
              }
            />
            <select
              className="w-full px-3 py-2 rounded-xl border bg-white text-sm"
              value={row.currency}
              onChange={(e) =>
                setExpRows((rs) =>
                  rs.map((r) => (r.id === row.id ? { ...r, currency: e.target.value } : r))
                )
              }
            >
              {CURRENCY_OPTIONS.map((opt) => (
                <option key={opt.code} value={opt.code}>
                  {opt.code} — {opt.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="px-3 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-sm"
              onClick={() => setExpRows((rs) => rs.filter((r) => r.id !== row.id))}
            >
              Sil
            </button>
          </div>
        );
      })}
    </div>
    </div>
  </div>
</div>
            </div>

             {draftConflicts.length > 0 && (
                <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-sm">
                  <div className="font-medium text-rose-800">Çakışma Uyarısı!</div>
                  <ul className="list-disc pl-5 mt-1 text-rose-700">
                    {draftConflicts.map(c => <li key={c.id}>{c.title} ({fmtDateTime(c.start)})</li>)}
                  </ul>
                </div>
             )}
            
            <div className="mt-4">
              <h4 className="font-medium text-sm">Harita Linkleri</h4>
              {(draft.mapLinks || []).map((ml, i) => (
                <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2 items-center mt-1">
                   <input type="text" placeholder="Etiket (örn. Otel)" value={ml.label} onChange={e => {
                     const cp = [...draft.mapLinks];
                     cp[i].label = e.target.value;
                     setDraft({...draft, mapLinks: cp});
                   }} className="w-full px-2 py-1.5 rounded-lg border text-sm" />
                   <input type="url" placeholder="URL" value={ml.url} onChange={e => {
                     const cp = [...draft.mapLinks];
                     cp[i].url = e.target.value;
                     setDraft({...draft, mapLinks: cp});
                   }} className="w-full px-2 py-1.5 rounded-lg border text-sm" />
                   <button onClick={() => {
                     const cp = draft.mapLinks.filter((_, idx) => i !== idx);
                     setDraft({...draft, mapLinks: cp});
                   }} className="px-2 py-1.5 rounded-lg bg-rose-50 text-rose-700 text-sm">Sil</button>
                </div>
              ))}
              <button onClick={() => {
                 setDraft({...draft, mapLinks: [...(draft.mapLinks || []), {label: '', url: ''}]});
              }} className="mt-2 px-3 py-1.5 rounded-lg border text-sm">+ Link Ekle</button>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border">İptal</button>
              <button onClick={saveDraft} className="px-4 py-2 rounded-xl bg-indigo-600 text-white">Kaydet</button>
            </div>

          </div>
        </div>
      )}

      {showConflictPanel && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4"
          onClick={() => setShowConflictPanel(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold">Çakışma Çözücü</h3>
            {totalConflicts === 0 ? (
              <p className="mt-2 text-slate-600">
                {selectedTrip ? "Seçili gezi için" : "Tüm planlarda"} çakışma bulunamadı.
              </p>
            ) : (
              (() => {
                const focus = items.find((x) => x.id === focusConflictId);
                const list = focus ? [focus] : items.filter((it) => conflictMap[it.id]?.length > 0);
                return (
                  <div className="mt-2 space-y-4">
                    {list.map((it) => (
                      <div key={it.id} className="p-3 border rounded-lg">
                        <h4 className="font-medium">
                          {it.title}
                          <span className="font-normal text-sm text-slate-600 ml-2">
                            ({fmtDateTime(it.start)})
                          </span>
                        </h4>
                        <div className="text-sm text-rose-700">
                          Şunlarla çakışıyor:
                          <ul className="list-disc pl-5">
                            {(conflictMap[it.id] || []).map((cid) => {
                              const c = items.find((x) => x.id === cid);
                              return (
                                <li key={cid}>
                                  {c?.title || "Başlıksız"} —{" "}
                                  <span className="font-mono">
                                    {c
                                      ? `${fmtTime(c.start)}${
                                          c.end ? ` → ${fmtTime(c.end)}` : ""
                                        }`
                                      : ""}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
      
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            className="px-3 py-1.5 rounded border text-sm"
                            onClick={() => editItem(it)}
                          >
                            Düzenle
                          </button>
                          <button
                            className="px-3 py-1.5 rounded border text-sm"
                            onClick={() => moveToNextFreeSlot(it.id, +1)}
                          >
                            Sonraki boşluk
                          </button>
                          <button
                            className="px-3 py-1.5 rounded border text-sm"
                            onClick={() => moveToNextFreeSlot(it.id, -1)}
                          >
                            Önceki boşluk
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()
            )}
          </div>
        </div>
      )}

    </div>
  );
}

