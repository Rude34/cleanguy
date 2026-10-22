import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import {
  Activity, AlertTriangle, Boxes, Check, ChevronDown, Clock3,
  Download, ListOrdered, LogOut, Plus, Radio, Search, ShieldCheck, Table2, Users, X,
} from "lucide-react";

const categories = [
  "Kat0 (XL)", "Kat0 (Normal)", "Kat0 (Sağlık Güzellik)",
  "Zemin (Karışık)", "Zemin (Elektronik)", "Kat0-Zemin (Karışık)",
  "Kat0 (Seri Ürün)", "Zemin(Su-Redbull)", "Zemin (Peçete)",
] as const;
const tables = Array.from({ length: 35 }, (_, index) => index + 7);
type Profile = { id: string; username: string; display_name: string; role: "admin" | "operator"; is_active: boolean; created_at?: string };
type RecordRow = {
  id: string; shift_id?: string; table_number: number; bpc_category: string; quantity?: number | null; operator_id: string;
  status: "delivered" | "cancelled"; created_at: string; cancelled_at: string | null;
  cancellation_reason: string | null;
  profiles?: Profile | Profile[] | null;
};
type ShiftRow = { id: string; started_at: string; ended_at: string | null; started_by: string | null; ended_by: string | null; table_staff: Record<string, string> };
type QueueEntry = { id: string; table_number: number; added_by: string; added_at: string; profile?: Profile | null };
type AuditRow = { id: string; actor_id: string | null; action: string; record_id: string | null; previous_values: unknown; new_values: unknown; created_at: string; profiles?: Pick<Profile, "username" | "display_name"> | Pick<Profile, "username" | "display_name">[] | null };
type ToastMessage = { kind: "success" | "error"; text: string };
const categoryClass: Record<string, string> = {
  "Kat0 (XL)": "cat-xl", "Kat0 (Normal)": "cat-normal", "Kat0 (Sağlık Güzellik)": "cat-health",
  "Zemin (Karışık)": "cat-mix", "Zemin (Elektronik)": "cat-electronics", "Kat0-Zemin (Karışık)": "cat-combo",
  "Kat0 (Seri Ürün)": "cat-series", "Zemin(Su-Redbull)": "cat-drinks", "Zemin (Peçete)": "cat-mix",
};
const trTime = (value: string) => new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
const trDate = (value: string) => new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
const linkedProfile = (row: RecordRow) => Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
const recordQuantity = (row: RecordRow) => row.quantity ?? 1;
async function api<T>(action: string, method: "GET" | "POST" = "GET", body?: unknown): Promise<T> {
  const response = await fetch(`/api/bpc?action=${action}`, {
    signal: AbortSignal.timeout(20_000),
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "same-origin",
    cache: "no-store",
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error ?? "Sunucu isteği tamamlanamadı.");
  return result as T;
}

  function QueueDashboard({ entries, profile, refresh, notify }: { entries: QueueEntry[]; profile: Profile; refresh: () => Promise<void>; notify: (kind: ToastMessage["kind"], text: string) => void }) {
    const [tableNumber, setTableNumber] = useState("");
    const [busy, setBusy] = useState(false);
    const [completing, setCompleting] = useState("");
    const queuedTables = new Set(entries.map((entry) => entry.table_number));
    const availableTables = tables.filter((table) => !queuedTables.has(table));

    async function addTable(event: FormEvent) {
      event.preventDefault();
      if (!tableNumber || busy || entries.length >= 34) return;
      setBusy(true);
      try {
        await api("queue-add", "POST", { table_number: Number(tableNumber) });
        setTableNumber("");
        await refresh();
        notify("success", `Masa ${tableNumber} sıraya eklendi.`);
      } catch (error) { notify("error", error instanceof Error ? error.message : "Masa sıraya eklenemedi."); }
      finally { setBusy(false); }
    }

    async function completeEntry(entry: QueueEntry) {
      if (completing) return;
      setCompleting(entry.id);
      try {
        await api("queue-complete", "POST", { entry_id: entry.id });
        await refresh();
        notify("success", `Masa ${entry.table_number} tamamlandı; sıra güncellendi.`);
      } catch (error) { notify("error", error instanceof Error ? error.message : "Masa sıradan kaldırılamadı."); }
      finally { setCompleting(""); }
    }

    return <div className="content-wrap queue-content"><section className="queue-intro"><div><span className="eyebrow">ORTAK BEKLEME LİSTESİ</span><h2>Sıradaki masalar</h2><p>Eklenen masaları tüm ekip görür. BPC tamamlanınca tikleyin, sıra kendiliğinden ilerlesin.</p></div><div className="queue-total"><strong>{entries.length}<small>/ 34</small></strong><span>BEKLEYEN MASA</span></div></section><form className="queue-add-form" onSubmit={(event) => void addTable(event)}><label htmlFor="queue-table">Sıraya masa ekle</label><div className="queue-add-controls"><div className="select-wrap"><Table2 size={18} /><select id="queue-table" value={tableNumber} onChange={(event) => setTableNumber(event.target.value)} required disabled={!availableTables.length || entries.length >= 34}><option value="">Masa seçin</option>{availableTables.map((table) => <option key={table} value={table}>Masa {table}</option>)}</select><ChevronDown size={17} /></div><button className="primary-button" disabled={!tableNumber || busy || entries.length >= 34}>{busy ? "Ekleniyor" : <><Plus size={17} /> Sıraya ekle</>}</button></div><small>{entries.length >= 34 ? "Bekleme listesi dolu." : `${availableTables.length} masa daha eklenebilir. Bir masa aynı anda sıraya yalnızca bir kez eklenebilir.`}</small></form><section className="queue-list-panel"><header className="queue-list-heading"><div><span className="eyebrow">İŞLEM SIRASI</span><h3>Bekleyenler</h3></div><span>{entries.length} / 34</span></header>{entries.length === 0 ? <div className="queue-empty"><ListOrdered size={26} /><strong>Sırada masa yok</strong><span>İlk masayı ekleyince tüm ortacılar burada görecek.</span></div> : <ol className="queue-list">{entries.map((entry, index) => <li className={`queue-item ${index === 0 ? "queue-first" : ""}`} key={entry.id}><span className="queue-position">{index + 1}</span><div className="queue-table-name"><strong>Masa {entry.table_number}</strong>{index === 0 && <span className="queue-next-tag">SIRADAKİ</span>}<small>{entry.profile?.display_name ?? profile.display_name} ekledi · {trTime(entry.added_at)}</small></div><button className="queue-complete-button" type="button" aria-label={`Masa ${entry.table_number} tamamlandı`} title="BPC tamamlandı, sıradan çıkar" disabled={Boolean(completing)} onClick={() => void completeEntry(entry)}>{completing === entry.id ? <span className="spinner small" /> : <Check size={19} />}<span>Tamamlandı</span></button></li>)}</ol>}</section></div>;
  }

export default function App() {
  const [session, setSession] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [waitingTables, setWaitingTables] = useState<QueueEntry[]>([]);
  const [shifts, setShifts] = useState<ShiftRow[]>([]);
  const [activeShiftId, setActiveShiftId] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [serverError, setServerError] = useState("");
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const notify = useCallback((kind: ToastMessage["kind"], text: string) => {
    setToast({ kind, text });
    window.setTimeout(() => setToast(null), 4200);
  }, []);

  const revision = useRef("");
  const pendingRefresh = useRef<Promise<void> | null>(null);
  const fetchData = useCallback(async () => {
    const data = await api<{ unchanged?: boolean; revision: string; profile: Profile; records: RecordRow[]; profiles: Profile[]; audit: AuditRow[]; shifts: ShiftRow[]; active_shift_id: string; waiting_tables: QueueEntry[] }>(`data&revision=${encodeURIComponent(revision.current)}`);
    setConnected(true);
    if (data.unchanged) return;
    revision.current = data.revision;
    setRecords(data.records);
    setWaitingTables(data.waiting_tables);
    setShifts(data.shifts);
    setActiveShiftId(data.active_shift_id);
    if (data.profile.role === "admin") { setProfiles(data.profiles); setAudit(data.audit); }
    setConnected(true);
  }, []);

  const pollRefresh = useCallback(() => {
    if (pendingRefresh.current) return pendingRefresh.current;
    const request = fetchData().finally(() => { pendingRefresh.current = null; });
    pendingRefresh.current = request;
    return request;
  }, [fetchData]);

  const refresh = useCallback(async () => {
    // A mutation must refresh AFTER any older in-flight poll has finished.
    if (pendingRefresh.current) await pendingRefresh.current.catch(() => {});
    await pollRefresh();
  }, [pollRefresh]);

  useEffect(() => {
    let alive = true;
    api<{ profile: Profile | null; needsSetup: boolean }>("session").then(({ profile: current, needsSetup: setup }) => {
      if (!alive) return;
      setNeedsSetup(setup);
      if (current) { setProfile(current); setSession(true); void refresh().catch(() => setConnected(false)); }
      setLoading(false);
    }).catch((error) => { if (alive) { setServerError(error instanceof Error ? error.message : "Sunucuya ulaşılamıyor."); setLoading(false); } });
    return () => { alive = false; };
  }, [refresh]);

  useEffect(() => {
    if (!session || !profile) return;
    let stopped = false;
    let timer: number | undefined;
    let running = false;
    let lastActivity = Date.now();
    let delay = 10_000;
    const active = () => document.visibilityState === "visible" && navigator.onLine && Date.now() - lastActivity < 120_000;
    const clear = () => { window.clearTimeout(timer); timer = undefined; };
    const schedule = () => {
      if (!stopped && active()) timer = window.setTimeout(() => { timer = undefined; void poll(); }, delay);
    };
    const poll = async () => {
      if (stopped || running || !active()) return;
      running = true;
      try { await pollRefresh(); delay = 10_000; }
      catch { setConnected(false); delay = Math.min(delay * 2, 120_000); }
      finally { running = false; schedule(); }
    };
    const activity = () => {
      const wasIdle = Date.now() - lastActivity >= 120_000;
      lastActivity = Date.now();
      if (wasIdle && !running) { clear(); void poll(); }
      else if (!timer && !running) schedule();
    };
    const resume = () => {
      clear();
      if (document.visibilityState === "visible" && navigator.onLine) {
        lastActivity = Date.now();
        if (!running) void poll();
      }
    };
    const pause = () => clear();
    schedule();
    document.addEventListener("visibilitychange", resume);
    window.addEventListener("online", resume);
    window.addEventListener("offline", pause);
    const events = ["pointerdown", "keydown", "scroll", "touchstart"] as const;
    events.forEach((event) => window.addEventListener(event, activity, { passive: true }));
    return () => {
      stopped = true;
      clear();
      document.removeEventListener("visibilitychange", resume);
      window.removeEventListener("online", resume);
      window.removeEventListener("offline", pause);
      events.forEach((event) => window.removeEventListener(event, activity));
    };
  }, [session, profile, pollRefresh]);

  if (loading) return <div className="loading-screen"><span className="spinner" /><p>Oturum doğrulanıyor</p></div>;
  if (!session || !profile) return needsSetup
    ? <InitialAdminSetup onCreated={(nextProfile) => { setNeedsSetup(false); setSession(true); setProfile(nextProfile); void refresh().catch((error) => notify("error", error instanceof Error ? error.message : "Veriler alınamadı.")); }} notify={notify} />
    : <Login serverError={serverError} onLogin={(nextProfile) => { setSession(true); setProfile(nextProfile); void refresh().catch((error) => notify("error", error instanceof Error ? error.message : "Veriler alınamadı.")); }} notify={notify} />;

  const signOut = async () => { await api("logout", "POST", {}); setSession(false); setProfile(null); setRecords([]); navigate("/"); };
  return <>
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" to="/"><span className="brand-mark"><Boxes size={21} /></span><span><strong>BPC</strong><small>OPERASYON MERKEZİ</small></span></Link>
        <div className="sidebar-label">ÇALIŞMA ALANI</div>
        <Link className={`nav-link ${location.pathname.endsWith("/admin") || location.pathname.endsWith("/queue") ? "" : "selected"}`} to="/" aria-label="Operasyon akışı" title="Operasyon akışı"><Activity size={18} /> Operasyon akışı</Link>
        <Link className={`nav-link ${location.pathname.endsWith("/queue") ? "selected" : ""}`} to="/queue" aria-label={`Sıradaki masalar, ${waitingTables.length} bekleyen`} title="Sıradaki masalar"><ListOrdered size={18} /> Sıradaki masalar <span className="nav-count">{waitingTables.length}</span></Link>
        {profile.role === "admin" && <Link className={`nav-link ${location.pathname.endsWith("/admin") ? "selected" : ""}`} to="/admin" aria-label="Yönetici paneli" title="Yönetici paneli"><ShieldCheck size={18} /> Yönetici paneli</Link>}
        <div className="sidebar-bottom">
          <div className="live-status"><span className={connected ? "status-dot online" : "status-dot"} /><span>{connected ? "Canlı bağlantı" : "Bağlantı bekleniyor"}</span><Radio size={15} /></div>
          <div className="user-card"><span className="avatar">{profile.display_name.slice(0, 1).toLocaleUpperCase("tr-TR")}</span><span className="user-meta"><strong>{profile.display_name}</strong><small>{profile.role === "admin" ? "Yönetici" : "Ortacı"}</small></span><button className="icon-button" aria-label="Çıkış yap" title="Çıkış yap" onClick={signOut}><LogOut size={17} /></button></div>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar"><div><span className="eyebrow">DEPO / BPC TAKİBİ</span><h1>{location.pathname.endsWith("/admin") ? "Yönetici paneli" : location.pathname.endsWith("/queue") ? "Sıradaki masalar" : "Operasyon akışı"}</h1></div><div className="topbar-right"><span className="date-chip"><Clock3 size={15} />{new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", weekday: "long", day: "numeric", month: "long" }).format(new Date())}</span><span className={`connection-chip ${connected ? "is-live" : ""}`}><i />{connected ? "Canlı" : "Çevrimdışı"}</span></div></header>
        {!connected && <div className="connection-warning"><AlertTriangle size={16} /> Canlı bağlantı kesildi. Yeniden bağlandığında güncel kayıtlar otomatik yüklenecek.</div>}
        <Routes>
          <Route path="/" element={<OperatorDashboard profile={profile} records={records} shifts={shifts} activeShiftId={activeShiftId} refresh={refresh} notify={notify} />} />
          <Route path="/queue" element={<QueueDashboard entries={waitingTables} profile={profile} refresh={refresh} notify={notify} />} />
          <Route path="/admin" element={profile.role === "admin" ? <AdminDashboard profile={profile} records={records} profiles={profiles} audit={audit} shifts={shifts} activeShiftId={activeShiftId} refresh={refresh} notify={notify} /> : <Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
    {toast && <div className={`toast ${toast.kind}`} role="status">{toast.kind === "success" ? <Check size={18} /> : <AlertTriangle size={18} />}{toast.text}</div>}
  </>;
}

function Login({ onLogin, notify, serverError }: { onLogin: (profile: Profile) => void; notify: (kind: ToastMessage["kind"], text: string) => void; serverError: string }) {
  const [username, setUsername] = useState(""); const [password, setPassword] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); if (busy) return;
    setBusy(true);
    try {
      const { profile } = await api<{ profile: Profile }>("login", "POST", { username: username.trim(), password });
      onLogin(profile);
    } catch (error) { notify("error", error instanceof Error ? error.message : "Giriş başarısız."); }
    finally { setBusy(false); }
  }
  return <main className="login-page"><section className="login-aside"><div className="login-aside-inner"><Link className="brand brand-light" to="/"><span className="brand-mark"><Boxes size={21} /></span><span><strong>BPC</strong><small>OPERASYON MERKEZİ</small></span></Link><div className="login-message"><span className="eyebrow">DEPO OPERASYONLARI / 01</span><h1>Her teslimat<br />kayıt altında.</h1><p>Canlı BPC akışı, hızlı kayıt ve güvenilir vardiya takibi.</p><div className="login-stat"><span className="stat-icon"><Activity size={19} /></span><span><b>Gerçek zamanlı</b><small>Operasyon görünürlüğü</small></span><span className="stat-pulse" /></div></div><span className="aside-foot">KLEANGUY TECH <span>•</span> DEPO SİSTEMLERİ</span></div></section><section className="login-form-side"><form className="login-form" onSubmit={submit}><span className="eyebrow">GÜVENLİ OTURUM</span><h2>Tekrar hoş geldiniz</h2><p className="muted">Devam etmek için hesabınıza giriş yapın.</p>{serverError && <div className="config-alert"><AlertTriangle size={16} /><span><strong>Sunucu yapılandırması gerekli</strong><small>{serverError} Vercel ortam değişkenlerini ve Blob bağlantısını kontrol edin.</small></span></div>}<label>Kullanıcı adı<input autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Kullanıcı adınız" required /></label><label>Şifre<input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Şifreniz" required /></label><button className="primary-button login-button" disabled={busy || Boolean(serverError)}>{busy ? <span className="spinner small" /> : null}{busy ? "Doğrulanıyor" : "Giriş yap"}{!serverError && <ChevronDown size={17} className="button-arrow" />}</button><div className="secure-note"><ShieldCheck size={15} /> Giriş bilgileri güvenli oturumla doğrulanır.</div></form></section></main>;
}

function InitialAdminSetup({ onCreated, notify }: { onCreated: (profile: Profile) => void; notify: (kind: ToastMessage["kind"], text: string) => void }) {
  const [username, setUsername] = useState(""); const [displayName, setDisplayName] = useState("Depo Yöneticisi"); const [password, setPassword] = useState(""); const [setupKey, setSetupKey] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); if (busy) return;
    setBusy(true);
    try { const result = await api<{ profile: Profile }>("setup", "POST", { username, display_name: displayName, password, setup_key: setupKey }); onCreated(result.profile); }
    catch (error) { notify("error", error instanceof Error ? error.message : "Yönetici hesabı oluşturulamadı."); }
    finally { setBusy(false); }
  }
  return <main className="login-page"><section className="login-aside"><div className="login-aside-inner"><div className="brand brand-light"><span className="brand-mark"><Boxes size={21} /></span><span><strong>BPC</strong><small>OPERASYON MERKEZİ</small></span></div><div className="login-message"><span className="eyebrow">İLK KURULUM / 01</span><h1>Yönetici<br />hesabını oluştur.</h1><p>Kurulumu tamamlayın; ardından operatör hesaplarını buradan ekleyebilirsiniz.</p></div><span className="aside-foot">KLEANGUY TECH <span>•</span> DEPO SİSTEMLERİ</span></div></section><section className="login-form-side"><form className="login-form" onSubmit={(event) => void submit(event)}><span className="eyebrow">İLK KULLANIM</span><h2>Yönetici hesabı</h2><p className="muted">Bu hesapla operatör ekleyebilir ve tüm BPC kayıtlarını görebilirsiniz.</p><label>Görünen ad<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} required maxLength={80} /></label><label>Kullanıcı adı<input autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required minLength={3} maxLength={32} pattern="[A-Za-z0-9._-]+" /></label><label>Şifre<input type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={12} /></label>{!import.meta.env.DEV && <label>İlk kurulum anahtarı<input type="password" value={setupKey} onChange={(event) => setSetupKey(event.target.value)} required autoComplete="off" /></label>}<button className="primary-button login-button" disabled={busy}>{busy ? "Oluşturuluyor" : "Yönetici hesabı oluştur"}</button><div className="secure-note"><ShieldCheck size={15} /> Şifreniz sunucuda güvenli biçimde özetlenerek saklanır.</div></form></section></main>;
}

function OperatorDashboard({ profile, records, shifts, activeShiftId, refresh, notify }: { profile: Profile; records: RecordRow[]; shifts: ShiftRow[]; activeShiftId: string; refresh: () => Promise<void>; notify: (kind: ToastMessage["kind"], text: string) => void }) {
  const [table, setTable] = useState(""); const [category, setCategory] = useState(""); const [quantity, setQuantity] = useState(""); const [busy, setBusy] = useState(false); const [ownOnly, setOwnOnly] = useState(false);
  const pendingIdempotency = useRef<{ signature: string; key: string } | null>(null);
  const activeRecords = records.filter((record) => record.shift_id === activeShiftId);
  const today = activeRecords.filter((record) => record.status === "delivered");
  const visibleRecords = ownOnly ? activeRecords.filter((record) => record.operator_id === profile.id) : activeRecords;
  async function submit(event: FormEvent) {
    event.preventDefault();
    const tableNumber = Number(table);
    const parsedQuantity = Number(quantity);
    if (busy || !tables.includes(tableNumber) || !categories.includes(category as typeof categories[number]) || !quantity.trim() || !Number.isInteger(parsedQuantity) || parsedQuantity < 1 || parsedQuantity > 100000) return;
    const signature = `${activeShiftId}:${tableNumber}:${category}:${parsedQuantity}`;
    if (!pendingIdempotency.current || pendingIdempotency.current.signature !== signature) {
      pendingIdempotency.current = { signature, key: crypto.randomUUID() };
    }
    setBusy(true);
    try {
      const result = await api<{ duplicate: boolean }>("record", "POST", { table_number: tableNumber, bpc_category: category, quantity: parsedQuantity, idempotency_key: pendingIdempotency.current.key });
      pendingIdempotency.current = null;
      setTable(""); setCategory(""); setQuantity(""); notify("success", result.duplicate ? "Önceki gönderiminiz zaten kaydedilmiş; mükerrer kayıt oluşturulmadı." : "BPC teslimatı kaydedildi.");
    } catch (error) { notify("error", error instanceof Error ? error.message : "Kayıt oluşturulamadı."); }
    finally { setBusy(false); }
  }
  return <div className="content-wrap"><section className="welcome-row"><div><span className="eyebrow">AKTİF VARDİYA</span><h2>Merhaba, {profile.display_name}</h2><p>Yeni teslimatınızı kaydedin; ekip ekranları otomatik güncellensin.</p></div><div className="today-count"><span>VARDİYADA TESLİM EDİLEN SKU</span><strong>{today.reduce((sum, record) => sum + recordQuantity(record), 0).toString().padStart(2, "0")}</strong><small>SKU</small></div></section><section className="operator-grid"><form className="form-panel" onSubmit={submit}><div className="panel-heading"><div className="panel-icon orange"><Plus size={19} /></div><div><h3>Yeni BPC teslimatı</h3><p>Tablo, kategori ve SKU adedini girin.</p></div><span className="required-tag">GEREKLİ</span></div><label className="field-label" htmlFor="table">Masa numarası</label><div className="select-wrap"><Table2 size={18} /><select id="table" value={table} onChange={(e) => setTable(e.target.value)} required><option value="">Masa seçin</option>{tables.map((number) => <option key={number} value={number}>Masa {number}</option>)}</select><ChevronDown size={17} /></div><label className="field-label category-label">BPC kategorisi</label><div className="category-options">{categories.map((item, index) => <button type="button" key={item} className={`category-option ${category === item ? "chosen" : ""}`} onClick={() => setCategory(item)}><span className={`category-marker ${categoryClass[item]}`}><span /></span><span>{item}</span><small>0{index + 1}</small></button>)}</div><label className="field-label quantity-label" htmlFor="quantity">SKU adedi</label><input className="quantity-input" id="quantity" type="number" min="1" max="100000" step="1" inputMode="numeric" placeholder="Zorunlu" value={quantity} onChange={(e) => setQuantity(e.target.value)} required /><button className="primary-button deliver-button" disabled={!table || !category || !quantity.trim() || busy || !Number.isInteger(Number(quantity)) || Number(quantity) < 1 || Number(quantity) > 100000}>{busy ? <span className="spinner small" /> : <Check size={19} />}{busy ? "Kaydediliyor" : "BPC Verildi"}</button><p className="form-footnote"><ShieldCheck size={14} /> Adınız ve saat otomatik olarak eklenir.</p></form><section className="feed-panel"><div className="feed-heading"><div><span className="eyebrow">AKTİF VARDİYA / CANLI AKIŞ</span><h3>Son operasyonlar</h3></div><span className={`feed-live ${"live"}`}><i /> CANLI</span></div><div className="feed-tools"><button className={`filter-chip ${ownOnly ? "active" : ""}`} onClick={() => setOwnOnly(!ownOnly)}>{ownOnly ? "Kendi kayıtlarım" : "Tüm ekip"}<ChevronDown size={14} /></button><span>{visibleRecords.length} kayıt</span></div><div className="activity-list">{visibleRecords.length === 0 ? <EmptyState text="Bu vardiyada henüz BPC kaydı yok." /> : visibleRecords.slice(0, 100).map((record) => <ActivityItem key={record.id} record={record} />)}</div></section></section><TableShiftHistory records={records} shifts={shifts} activeShiftId={activeShiftId} profile={profile} refresh={refresh} notify={notify} /><section className="bottom-note"><span className="note-icon"><Radio size={17} /></span><div><strong>Canlı ekip görünümü</strong><p>Aktif kullanımda ekip verileri 10 saniyede bir kontrol edilir.</p></div><span className="note-live"><i /> {" "}Senkronize</span></section></div>;
}

function TableShiftHistory({ records, shifts, activeShiftId, profile, refresh, notify }: { records: RecordRow[]; shifts: ShiftRow[]; activeShiftId: string; profile: Profile; refresh: () => Promise<void>; notify: (kind: ToastMessage["kind"], text: string) => void }) {
  const [selectedTable, setSelectedTable] = useState(10);
  const [selectedShiftId, setSelectedShiftId] = useState(activeShiftId);
  const [staffName, setStaffName] = useState("");
  useEffect(() => { setSelectedShiftId(activeShiftId); }, [activeShiftId]);
  const selectedShift = shifts.find((shift) => shift.id === selectedShiftId) ?? shifts.find((shift) => shift.id === activeShiftId);
  const tableStaff = selectedShift?.table_staff ?? {};
  const assignedStaffName = tableStaff[String(selectedTable)] ?? "";
  useEffect(() => { setStaffName(assignedStaffName); }, [selectedTable, selectedShiftId, assignedStaffName]);
  const shiftRecords = records.filter((record) => record.shift_id === selectedShift?.id);
  const tableRecords = shiftRecords.filter((record) => record.table_number === selectedTable).sort((a, b) => b.created_at.localeCompare(a.created_at));
  const delivered = tableRecords.filter((record) => record.status === "delivered");
  const totalUnits = delivered.reduce((sum, record) => sum + recordQuantity(record), 0);
  const tableStats = tables.map((table) => {
    const rows = shiftRecords.filter((record) => record.table_number === table && record.status === "delivered");
    return { table, entries: rows.length, units: rows.reduce((sum, record) => sum + recordQuantity(record), 0) };
  });
  const categoryTotals = categories.map((category) => ({
    category,
    units: delivered.filter((record) => record.bpc_category === category).reduce((sum, record) => sum + recordQuantity(record), 0),
    entries: delivered.filter((record) => record.bpc_category === category).length,
  })).filter((item) => item.entries > 0);
  const saveStaff = async (event: FormEvent) => { event.preventDefault(); try { await api("shift", "POST", { operation: "assign-staff", table_number: selectedTable, name: staffName }); notify("success", `Masa ${selectedTable} personeli kaydedildi.`); await refresh(); } catch (error) { notify("error", error instanceof Error ? error.message : "Personel adı kaydedilemedi."); } };
  return <section className="table-history-panel"><header className="table-history-heading"><div><span className="eyebrow">TÜM EKİP / ORTAK SKU TAKİBİ</span><h3>Masalara verilen SKU</h3><p>Her ortacı aynı masa ve ürün adetlerini anlık olarak görür.</p></div><label className="history-date">VARDİYA<select value={selectedShift?.id ?? ""} onChange={(event) => setSelectedShiftId(event.target.value)}>{shifts.slice().reverse().map((shift) => <option key={shift.id} value={shift.id}>{shift.ended_at ? "Tamamlanan" : "Aktif"} · {trDate(shift.started_at)} {trTime(shift.started_at)}</option>)}</select></label></header><div className="table-history-grid">{tableStats.map((item) => <button type="button" key={item.table} className={`table-history-tile ${selectedTable === item.table ? "selected" : ""} ${item.units ? "has-quantity" : ""}`} onClick={() => setSelectedTable(item.table)}><strong>Masa {item.table}</strong><span>{item.units} SKU</span><small>{tableStaff[String(item.table)] ? `${tableStaff[String(item.table)]} · ` : ""}{item.entries} kayıt</small></button>)}</div><div className="sku-detail"><div className="sku-detail-heading"><div><span className="eyebrow">{selectedShift?.ended_at ? `VARDİYA TAMAMLANDI · ${trDate(selectedShift.ended_at)}` : "AKTİF VARDİYA"}</span><h4>Masa {selectedTable}{tableStaff[String(selectedTable)] ? ` · ${tableStaff[String(selectedTable)]}` : ""}</h4></div><div className="sku-total"><strong>{totalUnits}</strong><span>SKU</span></div></div>{profile.role === "admin" && selectedShift?.id === activeShiftId && <form className="staff-assignment" onSubmit={(event) => void saveStaff(event)}><label>Masa {selectedTable} personeli<input value={staffName} onChange={(event) => setStaffName(event.target.value)} maxLength={80} placeholder="Personel adı" /></label><button className="outline-button" type="submit">İsmi kaydet</button></form>}<div className="sku-category-list">{categoryTotals.length === 0 ? <EmptyState text="Bu vardiyada bu masaya SKU verilmemiş." /> : categoryTotals.map((item) => <div className="sku-category-row" key={item.category}><span className={`category-marker ${categoryClass[item.category]}`}><span /></span><span className={`category-pill ${categoryClass[item.category]}`}>{item.category}</span><small>{item.entries} kayıt</small><strong>{item.units} SKU</strong></div>)}</div><div className="shift-records"><div className="shift-records-heading"><strong>Ürün hareketleri</strong><span>{tableRecords.length} kayıt</span></div>{tableRecords.length === 0 ? null : tableRecords.map((record) => { const operator = linkedProfile(record); return <article className={`shift-record ${record.status === "cancelled" ? "is-cancelled" : ""}`} key={record.id}><time>{trTime(record.created_at)}</time><span className={`category-pill ${categoryClass[record.bpc_category]}`}>{record.bpc_category}</span><span className="shift-record-operator">{operator?.display_name ?? "Ortacı"}</span><strong>{record.quantity ?? "—"} SKU</strong><span className={`record-state ${record.status === "delivered" ? "delivered" : "void"}`}>{record.status === "delivered" ? "Verildi" : "İptal"}</span></article>; })}</div></div></section>;
}

function ActivityItem({ record }: { record: RecordRow }) {
  const operator = linkedProfile(record);
  return <article className={`activity-item ${record.status === "cancelled" ? "cancelled" : ""}`}><div className="activity-time">{trTime(record.created_at)}</div><div className={`activity-dot ${categoryClass[record.bpc_category]}`}><span /></div><div className="activity-body"><div className="activity-main"><strong>Masa {record.table_number}</strong><span className={`category-pill ${categoryClass[record.bpc_category]}`}>{record.bpc_category}</span>{record.quantity != null && <span className="quantity-pill">× {record.quantity}</span>}{record.status === "cancelled" && <span className="cancel-label">İPTAL</span>}</div><div className="activity-meta"><span className="mini-avatar">{operator?.display_name?.slice(0, 1) ?? "?"}</span>{operator?.display_name ?? "Operatör"}{record.cancellation_reason && <span className="cancel-reason">· {record.cancellation_reason}</span>}</div></div><span className={`record-state ${record.status === "delivered" ? "delivered" : "void"}`}>{record.status === "delivered" ? "Verildi" : "İptal"}</span></article>;
}
function EmptyState({ text }: { text: string }) { return <div className="empty-state"><Activity size={22} /><span>{text}</span></div>; }

function AdminDashboard({ profile, records, profiles, audit, shifts, activeShiftId, refresh, notify }: { profile: Profile; records: RecordRow[]; profiles: Profile[]; audit: AuditRow[]; shifts: ShiftRow[]; activeShiftId: string; refresh: () => Promise<void>; notify: (kind: ToastMessage["kind"], text: string) => void }) {
  const [query, setQuery] = useState(""); const [operatorFilter, setOperatorFilter] = useState("all"); const [categoryFilter, setCategoryFilter] = useState("all"); const [tableFilter, setTableFilter] = useState("all"); const [dateFilter, setDateFilter] = useState(""); const [activeTab, setActiveTab] = useState<"records" | "users" | "audit">("records"); const [modal, setModal] = useState(false);
  const [passwordResetUser, setPasswordResetUser] = useState<Profile | null>(null);
  const [endingShift, setEndingShift] = useState(false);
  const activeRecords = records.filter((record) => record.shift_id === activeShiftId);
  const today = activeRecords.filter((record) => record.status === "delivered");
  const filtered = useMemo(() => records.filter((record) => {
    const user = linkedProfile(record);
    const recordDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(record.created_at));
    return (operatorFilter === "all" || record.operator_id === operatorFilter) && (categoryFilter === "all" || record.bpc_category === categoryFilter) && (tableFilter === "all" || record.table_number === Number(tableFilter)) && (!dateFilter || recordDate === dateFilter) && (!query || `masa ${record.table_number} ${record.bpc_category} ${user?.display_name ?? ""} ${user?.username ?? ""}`.toLocaleLowerCase("tr-TR").includes(query.toLocaleLowerCase("tr-TR")));
  }), [records, operatorFilter, categoryFilter, tableFilter, dateFilter, query]);
  const activeTables = new Set(today.map((record) => record.table_number)).size;
  const operators = profiles.filter((person) => person.role === "operator");
  const exportCsv = () => {
    const rows = [["ID", "Tarih", "Saat (Europe/Istanbul)", "Masa", "Kategori", "Adet", "Operatör", "Durum", "İptal nedeni"], ...filtered.map((record) => [record.id, trDate(record.created_at), trTime(record.created_at), `Masa ${record.table_number}`, record.bpc_category, record.quantity ?? "", linkedProfile(record)?.display_name ?? "", record.status === "delivered" ? "Verildi" : "İptal", record.cancellation_reason ?? ""])];
    const csv = "\uFEFF" + rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\r\n");
    const anchor = document.createElement("a"); anchor.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })); anchor.download = `bpc-raporu-${new Date().toISOString().slice(0, 10)}.csv`; anchor.click(); URL.revokeObjectURL(anchor.href);
  };
  async function cancelRecord(record: RecordRow) {
    const reason = window.prompt(`Masa ${record.table_number} kaydı için iptal nedeni:`)?.trim();
    if (!reason) return;
    try { await api("cancel", "POST", { record_id: record.id, reason }); notify("success", "Kayıt iptal edildi ve denetim günlüğüne eklendi."); await refresh(); }
    catch (error) { notify("error", error instanceof Error ? error.message : "Kayıt iptal edilemedi."); }
  }
  async function toggleUser(person: Profile) {
    try { await api("user", "POST", { operation: person.is_active ? "disable" : "enable", user_id: person.id }); notify("success", `Hesap ${person.is_active ? "devre dışı bırakıldı" : "etkinleştirildi"}.`); await refresh(); }
    catch (error) { notify("error", error instanceof Error ? error.message : "Hesap durumu güncellenemedi."); }
  }
  async function resetPassword(person: Profile, password: string) {
    await api("user", "POST", { operation: "reset-password", user_id: person.id, password });
    notify("success", `${person.display_name} için şifre yenilendi. Eski oturumları kapatıldı.`);
    setPasswordResetUser(null);
    await refresh();
  }
  async function endShift() {
    const current = shifts.find((shift) => shift.id === activeShiftId);
    if (!current || !window.confirm("Vardiyayı bitiriyor musunuz? Mevcut kayıtlar geçmişe kaydedilecek ve yeni vardiyanın operasyon akışı sıfırdan başlayacak.")) return;
    setEndingShift(true);
    try { await api("shift", "POST", { operation: "end" }); await refresh(); notify("success", "Vardiya geçmişe kaydedildi. Yeni vardiya başlatıldı."); }
    catch (error) { notify("error", error instanceof Error ? error.message : "Vardiya bitirilemedi."); }
    finally { setEndingShift(false); }
  }
  return <><div className="content-wrap admin-content"><div className="admin-shift-toolbar"><div><span className="eyebrow">VARDİYA DURUMU</span><strong>{activeRecords.length} kayıt · {today.reduce((sum, record) => sum + recordQuantity(record), 0)} SKU</strong></div><button className="danger-button" onClick={() => void endShift()} disabled={endingShift}>{endingShift ? "Kaydediliyor" : "Vardiyayı bitir"}</button></div><section className="admin-overview"><div className="metric-card highlight"><div className="metric-top"><span>AKTİF VARDİYADA TESLİM EDİLEN SKU</span><span className="metric-icon orange"><Boxes size={18} /></span></div><strong>{today.reduce((sum, record) => sum + recordQuantity(record), 0)}</strong><small>Toplam SKU</small></div><div className="metric-card"><div className="metric-top"><span>AKTİF MASA</span><span className="metric-icon green"><Table2 size={18} /></span></div><strong>{activeTables}<small className="metric-outof">/ 35</small></strong><small>Bu vardiyada işlem gören</small></div><div className="metric-card"><div className="metric-top"><span>AKTİF OPERATÖR</span><span className="metric-icon blue"><Users size={18} /></span></div><strong>{operators.filter((operator) => operator.is_active).length}</strong><small>Hesap etkin</small></div><div className="metric-card"><div className="metric-top"><span>VARDİYA KAYITLARI</span><span className="metric-icon dark"><Activity size={18} /></span></div><strong>{activeRecords.length}</strong><small>Aktif akış</small></div></section>
    <section className="admin-breakdown"><div className="breakdown-card"><div className="section-head"><div><span className="eyebrow">OPERATÖR PERFORMANSI</span><h3>Bugünkü adetler</h3></div><span className="small-tag">BUGÜN</span></div><div className="operator-stats">{operators.length === 0 ? <EmptyState text="Operatör hesabı bulunamadı." /> : operators.map((operator) => { const total = today.filter((record) => record.operator_id === operator.id).reduce((sum, record) => sum + recordQuantity(record), 0); const maxTotal = Math.max(...operators.map((person) => today.filter((record) => record.operator_id === person.id).reduce((sum, record) => sum + recordQuantity(record), 0)), 1); const width = today.length ? Math.max(5, total / maxTotal * 100) : 0; return <div className="operator-stat" key={operator.id}><span className="mini-avatar large">{operator.display_name.slice(0, 1)}</span><span className="operator-stat-name"><strong>{operator.display_name}</strong><small>{operator.username}</small></span><span className="bar-track"><i style={{ width: `${width}%` }} /></span><b>{total}</b></div>; })}</div></div><div className="breakdown-card category-breakdown"><div className="section-head"><div><span className="eyebrow">KATEGORİ DAĞILIMI</span><h3>BPC adetleri</h3></div></div><div className="category-stats">{categories.map((category) => { const total = today.filter((record) => record.bpc_category === category).reduce((sum, record) => sum + recordQuantity(record), 0); return <div className="category-stat" key={category}><span className={`category-marker ${categoryClass[category]}`}><span /></span><span>{category}</span><b>{total}</b></div>; })}</div></div></section>
    <section className="history-panel"><div className="history-heading"><div><span className="eyebrow">OPERASYON VERİSİ</span><h3>İşlem geçmişi</h3></div><button className="outline-button export-button" onClick={exportCsv}><Download size={16} /> CSV dışa aktar</button></div><div className="tab-row"><button className={activeTab === "records" ? "active" : ""} onClick={() => setActiveTab("records")}>İşlemler <span>{filtered.length}</span></button><button className={activeTab === "users" ? "active" : ""} onClick={() => setActiveTab("users")}>Operatörler <span>{operators.length}</span></button><button className={activeTab === "audit" ? "active" : ""} onClick={() => setActiveTab("audit")}>Denetim günlüğü <span>{audit.length}</span></button></div>
      {activeTab === "records" && <><div className="filter-row"><label className="search-box"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Masa, kategori veya operatör ara" /></label><select value={operatorFilter} onChange={(e) => setOperatorFilter(e.target.value)}><option value="all">Tüm operatörler</option>{operators.map((operator) => <option key={operator.id} value={operator.id}>{operator.display_name}</option>)}</select><select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}><option value="all">Tüm kategoriler</option>{categories.map((category) => <option key={category}>{category}</option>)}</select><select value={tableFilter} onChange={(e) => setTableFilter(e.target.value)}><option value="all">Tüm masalar</option>{tables.map((number) => <option key={number} value={number}>Masa {number}</option>)}</select><input className="date-filter" type="date" aria-label="Operasyon tarihi" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} /></div><div className="table-scroll"><table><thead><tr><th>SAAT / TARİH</th><th>MASA</th><th>KATEGORİ</th><th>ADET</th><th>OPERATÖR</th><th>DURUM</th><th /></tr></thead><tbody>{filtered.map((record) => <tr key={record.id}><td><strong>{trTime(record.created_at)}</strong><small>{trDate(record.created_at)}</small></td><td className="table-number">Masa {record.table_number}</td><td><span className={`category-pill ${categoryClass[record.bpc_category]}`}>{record.bpc_category}</span></td><td>{record.quantity ?? "—"}</td><td>{linkedProfile(record)?.display_name ?? "Bilinmiyor"}<small>{linkedProfile(record)?.username}</small></td><td><span className={`record-state ${record.status === "delivered" ? "delivered" : "void"}`}>{record.status === "delivered" ? "Verildi" : "İptal"}</span></td><td>{record.status === "delivered" && <button className="text-action" onClick={() => void cancelRecord(record)}>İptal et</button>}</td></tr>)}</tbody></table>{filtered.length === 0 && <EmptyState text="Filtrelerle eşleşen işlem bulunamadı." />}</div></>}
      {activeTab === "users" && <div className="user-management"><div className="user-management-head"><p>Operatör hesapları ve erişim durumu</p><button className="primary-button compact" onClick={() => setModal(true)}><Plus size={16} /> Operatör ekle</button></div>{operators.map((operator) => <div className="managed-user" key={operator.id}><span className="mini-avatar large">{operator.display_name.slice(0, 1)}</span><span className="managed-name"><strong>{operator.display_name}</strong><small>@{operator.username}</small></span><span className={`account-status ${operator.is_active ? "enabled" : "disabled"}`}><i />{operator.is_active ? "Etkin" : "Devre dışı"}</span><button className="outline-button" onClick={() => setPasswordResetUser(operator)}>Şifre yenile</button><button className="outline-button" onClick={() => void toggleUser(operator)}>{operator.is_active ? "Devre dışı bırak" : "Etkinleştir"}</button></div>)}</div>}
      {activeTab === "audit" && <div className="audit-list">{audit.length === 0 ? <EmptyState text="Denetim kaydı yok." /> : audit.map((item) => { const actor = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles; return <div className="audit-row" key={item.id}><span className="audit-action">{item.action}</span><span>{actor?.display_name ?? "Sistem"} (@{actor?.username ?? "system"})</span><span>{item.record_id ? `Kayıt ${item.record_id.slice(0, 8)}` : "Hesap yönetimi"}</span><small>{trDate(item.created_at)} · {trTime(item.created_at)}</small></div>; })}</div>}
    </section><TableShiftHistory records={records} shifts={shifts} activeShiftId={activeShiftId} profile={profile} refresh={refresh} notify={notify} />
    </div>{modal && <OperatorModal onClose={() => setModal(false)} onCreated={async () => { setModal(false); notify("success", "Operatör hesabı oluşturuldu."); await refresh(); }} notify={notify} />}{passwordResetUser && <PasswordResetModal profile={passwordResetUser} onClose={() => setPasswordResetUser(null)} onSubmit={(password) => resetPassword(passwordResetUser, password)} />}</>;
}

function OperatorModal({ onClose, onCreated, notify }: { onClose: () => void; onCreated: () => Promise<void>; notify: (kind: ToastMessage["kind"], text: string) => void }) {
  const [username, setUsername] = useState(""); const [displayName, setDisplayName] = useState(""); const [password, setPassword] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); if (busy) return; setBusy(true); try { await api("user", "POST", { operation: "create", username, display_name: displayName, password }); await onCreated(); } catch (error) { notify("error", error instanceof Error ? error.message : "Hesap oluşturulamadı."); } finally { setBusy(false); } }
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><form className="modal" onSubmit={(event) => void submit(event)}><div className="modal-head"><div><span className="eyebrow">HESAP YÖNETİMİ</span><h3>Operatör ekle</h3></div><button type="button" className="icon-button" aria-label="Kapat" onClick={onClose}><X size={19} /></button></div><label>Görünen ad<input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required maxLength={80} /></label><label>Kullanıcı adı<input value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} maxLength={32} pattern="[A-Za-z0-9._-]+" /></label><label>Şifre<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" /></label><p className="modal-hint">En az 8 karakter. Şifre sunucuda güvenli biçimde özetlenerek saklanır.</p><div className="modal-actions"><button type="button" className="outline-button" onClick={onClose}>Vazgeç</button><button className="primary-button compact" disabled={busy}>{busy ? "Oluşturuluyor" : "Hesap oluştur"}</button></div></form></div>;
}

function PasswordResetModal({ profile, onClose, onSubmit }: { profile: Profile; onClose: () => void; onSubmit: (password: string) => Promise<void> | void }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (password.length < 8) { setError("Şifre en az 8 karakter olmalı."); return; }
    if (password !== confirmPassword) { setError("Şifreler eşleşmiyor."); return; }
    setBusy(true); setError("");
    try { await onSubmit(password); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Şifre değiştirilemedi."); }
    finally { setBusy(false); }
  }
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><form className="modal" onSubmit={(event) => void submit(event)}><div className="modal-head"><div><span className="eyebrow">OPERATÖR HESABI</span><h3>Şifre yenile</h3><p className="modal-subtitle">{profile.display_name} · @{profile.username}</p></div><button type="button" className="icon-button" aria-label="Kapat" onClick={onClose}><X size={19} /></button></div><label>Yeni şifre<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} maxLength={128} autoComplete="new-password" /></label><label>Yeni şifreyi tekrar girin<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required minLength={8} maxLength={128} autoComplete="new-password" /></label><p className="modal-hint">Mevcut şifre gösterilmez. Değişiklikten sonra operatör tekrar giriş yapmalıdır.</p>{error && <p className="modal-error" role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="outline-button" onClick={onClose}>Vazgeç</button><button className="primary-button compact" disabled={busy}>{busy ? "Kaydediliyor" : "Şifreyi kaydet"}</button></div></form></div>;
}
