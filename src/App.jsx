// src/App.jsx
// ═══════════════════════════════════════════════════════════════
// Stone Block — Sistema de gestão para pedreiras
// Integrado com Supabase: Auth, PostgreSQL, Storage
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import * as api from './api'

// ─── CSS ────────────────────────────────────────────────────────
const CSS = `
:root{
  --bg:#f8fafc;--ink:#0f172a;--ink2:#1e293b;--mist:#64748b;--fog:#e2e8f0;--haze:#f1f5f9;
  --sap1:#dbeafe;--sap2:#bfdbfe;--sap4:#60a5fa;--sap5:#3b82f6;--sap6:#2563eb;--sap7:#1d4ed8;
  --ok:#10b981;--err:#ef4444;--warn:#f59e0b;
  --r-sm:6px;--r-md:10px;--r-lg:14px;
  --fast:.15s;--mid-t:.25s;--ease:cubic-bezier(.4,0,.2,1);
}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Inter','Helvetica Neue',Arial,sans-serif;background:var(--bg);color:var(--ink);}

/* App shell */
.app{min-height:100vh;display:flex;flex-direction:column;}

/* Topbar */
.tb{background:linear-gradient(135deg,#0c1a2e,#1e3a8a);color:#fff;padding:14px 20px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:50;box-shadow:0 2px 12px rgba(0,0,0,.15);}
.tbl{display:flex;align-items:center;gap:14px;}
.tblogo{font-size:20px;font-weight:800;letter-spacing:-.5px;font-family:'Sora',sans-serif;}
.tblogo span{color:var(--sap4);}
.tbr{display:flex;align-items:center;gap:10px;}
.tbbtn{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);color:#fff;width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;}
.tbbtn:hover{background:rgba(255,255,255,.18);}
.av{width:38px;height:38px;border-radius:10px;background:linear-gradient(135deg,var(--sap5),var(--sap4));color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;}

/* Layout */
.lay{display:flex;flex:1;}
.sb{width:240px;background:#0c1a2e;color:#fff;padding:18px 12px;flex-shrink:0;}
.sblbl{font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,255,255,.4);padding:0 12px;margin:14px 0 8px;font-weight:700;}
.sbni{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;cursor:pointer;font-size:14px;color:rgba(255,255,255,.7);transition:all .15s;margin-bottom:2px;}
.sbni:hover{background:rgba(255,255,255,.06);color:#fff;}
.sbni.on{background:rgba(96,165,250,.15);color:#fff;border-left:3px solid var(--sap4);padding-left:9px;}
.sbft{margin-top:24px;padding-top:18px;border-top:1px solid rgba(255,255,255,.08);}
.sbusr{display:flex;align-items:center;gap:10px;padding:10px 12px;margin-bottom:10px;}
.sbusr .av{width:34px;height:34px;font-size:12px;}
.sbun{font-size:13px;font-weight:600;color:#fff;}
.sbur{font-size:11px;color:rgba(255,255,255,.5);}
.lobtn{width:100%;display:flex;align-items:center;justify-content:center;gap:8px;padding:10px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);border-radius:8px;color:rgba(252,165,165,.9);cursor:pointer;font-size:13px;font-weight:600;}
.lobtn:hover{background:rgba(239,68,68,.15);}
.main{flex:1;padding:28px;min-width:0;}

/* Sidebar mobile */
.sbov{display:none;}
@media(max-width:767px){
  .sb{position:fixed;left:0;top:0;bottom:0;z-index:60;transform:translateX(-100%);transition:transform .3s;}
  .sb.open{transform:translateX(0);}
  .sbov{display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:55;}
  .sbov.show{display:block;}
  .main{padding:18px;}
}

/* Page header */
.ph{margin-bottom:24px;}
.ptit{font-family:'Sora',sans-serif;font-size:28px;font-weight:800;color:var(--ink);margin-bottom:4px;}
.psub{font-size:14px;color:var(--mist);}

/* Cards */
.card{background:#fff;border:1px solid var(--fog);border-radius:var(--r-lg);overflow:hidden;}
.chead{padding:16px 20px;border-bottom:1px solid var(--fog);display:flex;justify-content:space-between;align-items:center;}
.ctit{font-family:'Sora',sans-serif;font-size:15px;font-weight:700;color:var(--ink);}
.cb{padding:20px;}

/* Stat cards */
.sg{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-bottom:24px;}
.sc{background:#fff;border:1px solid var(--fog);border-top:3px solid var(--sap5);border-radius:var(--r-lg);padding:18px;}
.sico{width:42px;height:42px;border-radius:10px;display:flex;align-items:center;justify-content:center;margin-bottom:12px;}
.sval{font-family:'Sora',sans-serif;font-size:28px;font-weight:800;color:var(--ink);line-height:1;}
.slbl2{font-size:12px;color:var(--mist);margin-top:4px;}

/* Form */
.fg{margin-bottom:16px;}
.fl{display:block;font-size:12px;font-weight:600;color:var(--mist);margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px;}
.fc{width:100%;padding:11px 14px;border:1px solid var(--fog);border-radius:var(--r-md);font-size:14px;background:#fff;transition:all .15s;}
.fc:focus{outline:none;border-color:var(--sap5);box-shadow:0 0 0 3px rgba(59,130,246,.1);}
textarea.fc{resize:vertical;min-height:80px;font-family:inherit;}

/* Buttons */
.btn{padding:10px 18px;border-radius:var(--r-md);font-weight:600;font-size:14px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;transition:all .15s;border:none;font-family:inherit;}
.bb{background:var(--sap6);color:#fff;}
.bb:hover{background:var(--sap7);}
.bo{background:#fff;color:var(--ink2);border:1px solid var(--fog);}
.bo:hover{background:var(--haze);}
.br{background:var(--err);color:#fff;}
.br:hover{background:#dc2626;}
.bg{background:var(--ok);color:#fff;}
.bg:hover{background:#059669;}
.bsm{padding:7px 12px;font-size:13px;}

/* Table */
.tw{overflow-x:auto;}
table{width:100%;border-collapse:collapse;}
th{text-align:left;padding:12px 16px;font-size:11px;font-weight:700;color:var(--mist);text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid var(--fog);background:var(--haze);}
td{padding:14px 16px;font-size:14px;border-bottom:1px solid var(--fog);}
tr:hover{background:var(--haze);}

/* Modal */
.mo{position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:100;padding:20px;}
.md{background:#fff;border-radius:var(--r-lg);max-width:600px;width:100%;max-height:90vh;overflow:auto;}
.mhead{padding:18px 22px;border-bottom:1px solid var(--fog);display:flex;justify-content:space-between;align-items:center;}
.mtit{font-family:'Sora',sans-serif;font-size:18px;font-weight:700;}
.mbody{padding:22px;}
.mfoot{padding:16px 22px;border-top:1px solid var(--fog);display:flex;justify-content:flex-end;gap:10px;}

/* Empty state */
.es{padding:60px 20px;text-align:center;color:var(--mist);}
.estit{font-size:16px;font-weight:600;color:var(--ink2);}

/* Toast */
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--ink);color:#fff;padding:12px 20px;border-radius:var(--r-md);font-size:14px;z-index:200;box-shadow:0 8px 24px rgba(0,0,0,.2);}
.toast.ok{background:var(--ok);}
.toast.err{background:var(--err);}

/* Badge */
.bdg{display:inline-block;padding:3px 10px;border-radius:12px;font-size:11px;font-weight:700;}

/* Login */
.lg-bg{min-height:100vh;background:linear-gradient(135deg,#0c1a2e,#1e3a8a);display:flex;align-items:center;justify-content:center;padding:20px;}
.lg-card{background:rgba(255,255,255,.05);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:40px;width:100%;max-width:420px;}
.lg-logo{text-align:center;margin-bottom:8px;font-family:'Sora',sans-serif;font-size:32px;font-weight:800;color:#fff;}
.lg-logo span{color:var(--sap4);}
.lg-sub{text-align:center;color:rgba(255,255,255,.5);font-size:13px;margin-bottom:32px;}
.lg-fl{font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,255,255,.5);font-weight:700;margin-bottom:8px;display:block;}
.lg-fc{width:100%;padding:13px 16px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:10px;color:#fff;font-size:14px;}
.lg-fc:focus{outline:none;border-color:var(--sap4);background:rgba(255,255,255,.08);}
.lg-fc::placeholder{color:rgba(255,255,255,.3);}
.lg-btn{width:100%;padding:14px;background:linear-gradient(135deg,var(--sap5),var(--sap6));color:#fff;border:none;border-radius:10px;font-weight:700;font-size:15px;cursor:pointer;margin-top:8px;}
.lg-btn:hover{filter:brightness(1.1);}
.lg-btn:disabled{opacity:.5;cursor:not-allowed;}
.lg-err{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);color:#fca5a5;padding:10px 14px;border-radius:8px;font-size:13px;margin-top:14px;}

/* Spinner */
.spinner{display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .8s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}
.loading-screen{min-height:100vh;background:#0c1a2e;display:flex;align-items:center;justify-content:center;color:#fff;}
.loading-screen .spinner{width:32px;height:32px;border-width:3px;margin-bottom:14px;}
`

// ─── ICONS ──────────────────────────────────────────────────────
const ICONS = {
  grid:  '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
  cube:  '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
  cart:  '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
  user:  '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  mtn:   '<polyline points="8 3 12 7 8 11"/><polyline points="3 8 12 17 21 8"/>',
  card:  '<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>',
  plus:  '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  x:     '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  edit:  '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  out:   '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
  menu:  '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
  trend: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
  dolar: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
}

function Icon({ n, s = 16, c = 'currentColor' }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: ICONS[n] || '' }} />
  )
}

// ─── HELPERS ────────────────────────────────────────────────────
const money = (v, c = 'BRL') =>
  new Intl.NumberFormat(c === 'BRL' ? 'pt-BR' : 'en-US', { style: 'currency', currency: c }).format(Number(v) || 0)

const fmtDate = d => d ? new Date(d).toLocaleDateString('pt-BR') : '—'

const ROLE_LABEL = { owner: 'Dono', foreman: 'Encarregado', seller: 'Vendedor', client: 'Cliente' }

// ═══════════════════════════════════════════════════════════════
// LOGIN PAGE
// ═══════════════════════════════════════════════════════════════
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const submit = async (e) => {
    e?.preventDefault()
    if (!email || !password) { setErr('Informe e-mail e senha.'); return }
    setLoading(true); setErr('')
    try {
      await api.signIn(email, password)
      onLogin()
    } catch (e) {
      setErr('E-mail ou senha inválidos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="lg-bg">
      <form className="lg-card" onSubmit={submit}>
        <div className="lg-logo">Stone <span>Block</span></div>
        <div className="lg-sub">Sistema de gestão para pedreiras</div>
        <div className="fg">
          <label className="lg-fl">E-mail</label>
          <input className="lg-fc" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" autoComplete="email" />
        </div>
        <div className="fg">
          <label className="lg-fl">Senha</label>
          <input className="lg-fc" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
        </div>
        <button className="lg-btn" type="submit" disabled={loading}>
          {loading ? <><span className="spinner"></span> Entrando...</> : 'Entrar'}
        </button>
        {err && <div className="lg-err">{err}</div>}
      </form>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════
function Dashboard({ blocks, quarries, clients }) {
  const total     = blocks.length
  const available = blocks.filter(b => b.status === 'available').length
  const sold      = blocks.filter(b => b.status === 'sold').length
  const reserved  = blocks.filter(b => b.status === 'reserved').length

  const totalBRL = blocks.filter(b => b.currency === 'BRL' && b.status !== 'sold').reduce((a, b) => a + (Number(b.total_value) || 0), 0)
  const totalUSD = blocks.filter(b => b.currency === 'USD' && b.status !== 'sold').reduce((a, b) => a + (Number(b.total_value) || 0), 0)

  return (
    <div>
      <div className="ph">
        <div className="ptit">Dashboard</div>
        <div className="psub">Visão geral do estoque</div>
      </div>

      <div className="sg">
        <div className="sc">
          <div className="sico" style={{ background: '#dbeafe' }}><Icon n="cube" s={20} c="#2563eb" /></div>
          <div className="sval">{total}</div>
          <div className="slbl2">Total de Blocos</div>
        </div>
        <div className="sc" style={{ borderTopColor: 'var(--ok)' }}>
          <div className="sico" style={{ background: '#dcfce7' }}><Icon n="check" s={20} c="#059669" /></div>
          <div className="sval">{available}</div>
          <div className="slbl2">Disponíveis</div>
        </div>
        <div className="sc" style={{ borderTopColor: 'var(--warn)' }}>
          <div className="sico" style={{ background: '#fef3c7' }}><Icon n="cube" s={20} c="#d97706" /></div>
          <div className="sval">{reserved}</div>
          <div className="slbl2">Reservados</div>
        </div>
        <div className="sc" style={{ borderTopColor: 'var(--err)' }}>
          <div className="sico" style={{ background: '#fee2e2' }}><Icon n="cart" s={20} c="#dc2626" /></div>
          <div className="sval">{sold}</div>
          <div className="slbl2">Vendidos</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16, marginBottom: 16 }}>
        <div className="card">
          <div className="chead"><div className="ctit">Estoque em R$</div></div>
          <div className="cb">
            <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 32 }}>{money(totalBRL, 'BRL')}</div>
          </div>
        </div>
        <div className="card">
          <div className="chead"><div className="ctit">Estoque em US$</div></div>
          <div className="cb">
            <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 32 }}>{money(totalUSD, 'USD')}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
        <div className="card">
          <div className="chead"><div className="ctit">Pedreiras</div></div>
          <div className="cb">
            {quarries.length === 0
              ? <div style={{ color: 'var(--mist)', fontSize: 13 }}>Nenhuma pedreira cadastrada</div>
              : quarries.map(q => {
                const cnt = blocks.filter(b => b.quarry_id === q.id).length
                return (
                  <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--fog)' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{q.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--mist)' }}>{q.location || '—'}</div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 18, fontFamily: 'Sora,sans-serif' }}>{cnt}</div>
                  </div>
                )
              })}
          </div>
        </div>
        <div className="card">
          <div className="chead"><div className="ctit">Clientes</div></div>
          <div className="cb">
            <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 32 }}>{clients.length}</div>
            <div style={{ fontSize: 13, color: 'var(--mist)' }}>cliente(s) cadastrado(s)</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// QUARRIES (Pedreiras)
// ═══════════════════════════════════════════════════════════════
function QuarriesPage({ profile, quarries, blocks, onChange, toast }) {
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ name: '', location: '', materials: [] })
  const [matInput, setMatInput] = useState('')
  const [saving, setSaving] = useState(false)

  const openNew = () => { setForm({ name: '', location: '', materials: [] }); setMatInput(''); setEditId(null); setShowForm(true) }
  const openEdit = q => { setForm({ name: q.name, location: q.location || '', materials: q.materials || [] }); setMatInput(''); setEditId(q.id); setShowForm(true) }

  const addMat = () => {
    const m = matInput.trim()
    if (!m) return
    if (form.materials.includes(m)) { toast('Material já adicionado.', 'err'); return }
    setForm({ ...form, materials: [...form.materials, m] })
    setMatInput('')
  }

  const save = async () => {
    if (!form.name.trim()) { toast('Nome obrigatório.', 'err'); return }
    if (form.materials.length === 0) { toast('Adicione pelo menos um material.', 'err'); return }
    setSaving(true)
    try {
      if (editId) {
        await api.updateQuarry(editId, form)
        toast('Pedreira atualizada!', 'ok')
      } else {
        await api.createQuarry(profile, form)
        toast('Pedreira cadastrada!', 'ok')
      }
      await onChange()
      setShowForm(false)
    } catch (e) {
      toast('Erro: ' + e.message, 'err')
    } finally { setSaving(false) }
  }

  const del = async (q) => {
    const inUse = blocks.some(b => b.quarry_id === q.id)
    if (inUse) { toast('Não é possível excluir: existem blocos vinculados.', 'err'); return }
    if (!window.confirm(`Excluir a pedreira "${q.name}"?`)) return
    try {
      await api.deleteQuarry(q.id)
      await onChange()
      toast('Pedreira excluída.', 'ok')
    } catch (e) { toast('Erro: ' + e.message, 'err') }
  }

  return (
    <div>
      <div className="ph">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="ptit">Pedreiras</div>
            <div className="psub">{quarries.length} pedreira(s) cadastrada(s)</div>
          </div>
          <button className="btn bb" onClick={openNew}><Icon n="plus" s={16} c="#fff" /> Nova Pedreira</button>
        </div>
      </div>

      {quarries.length === 0
        ? <div className="es"><div style={{ marginBottom: 12, opacity: .3 }}><Icon n="mtn" s={48} /></div><div className="estit">Nenhuma pedreira cadastrada</div></div>
        : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14 }}>
          {quarries.map(q => (
            <div key={q.id} className="card">
              <div className="cb">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 16 }}>{q.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--mist)', marginTop: 2 }}>{q.location || '—'}</div>
                  </div>
                  <Icon n="mtn" s={24} c="var(--sap5)" />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: 'var(--mist)', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 6, fontWeight: 700 }}>Materiais</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {(q.materials || []).map(m => <span key={m} className="bdg" style={{ background: 'var(--sap1)', color: 'var(--sap7)' }}>{m}</span>)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn bo bsm" onClick={() => openEdit(q)}><Icon n="edit" s={13} /> Editar</button>
                  <button className="btn bo bsm" style={{ color: 'var(--err)' }} onClick={() => del(q)}><Icon n="trash" s={13} c="var(--err)" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>}

      {showForm && (
        <div className="mo" onClick={() => setShowForm(false)}>
          <div className="md" onClick={e => e.stopPropagation()}>
            <div className="mhead">
              <div className="mtit">{editId ? 'Editar' : 'Nova'} Pedreira</div>
              <button className="btn bo bsm" onClick={() => setShowForm(false)}><Icon n="x" s={14} /></button>
            </div>
            <div className="mbody">
              <div className="fg">
                <label className="fl">Nome *</label>
                <input className="fc" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Pedreira Santa Maria" />
              </div>
              <div className="fg">
                <label className="fl">Localização</label>
                <input className="fc" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Ex: Cachoeiro de Itapemirim, ES" />
              </div>
              <div className="fg">
                <label className="fl">Materiais *</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input className="fc" value={matInput} onChange={e => setMatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addMat())} placeholder="Ex: Granito Verde Ubatuba" />
                  <button className="btn bb bsm" onClick={addMat}><Icon n="plus" s={13} c="#fff" /></button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {form.materials.map(m => (
                    <span key={m} className="bdg" style={{ background: 'var(--sap1)', color: 'var(--sap7)', cursor: 'pointer' }} onClick={() => setForm({ ...form, materials: form.materials.filter(x => x !== m) })}>
                      {m} ×
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="mfoot">
              <button className="btn bo" onClick={() => setShowForm(false)}>Cancelar</button>
              <button className="btn bb" onClick={save} disabled={saving}>{saving ? <><span className="spinner"></span> Salvando</> : 'Salvar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// CLIENTS
// ═══════════════════════════════════════════════════════════════
function ClientsPage({ profile, clients, onChange, toast }) {
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ name: '', country: 'Brasil', phone: '', email: '', doc: '', notes: '' })
  const [saving, setSaving] = useState(false)

  const openNew = () => { setForm({ name: '', country: 'Brasil', phone: '', email: '', doc: '', notes: '' }); setEditId(null); setShowForm(true) }
  const openEdit = c => { setForm({ name: c.name, country: c.country || 'Brasil', phone: c.phone || '', email: c.email || '', doc: c.doc || '', notes: c.notes || '' }); setEditId(c.id); setShowForm(true) }

  const save = async () => {
    if (!form.name.trim()) { toast('Nome obrigatório.', 'err'); return }
    setSaving(true)
    try {
      if (editId) {
        await api.updateClient(editId, form)
        toast('Cliente atualizado!', 'ok')
      } else {
        await api.createClient(profile, form)
        toast('Cliente cadastrado!', 'ok')
      }
      await onChange()
      setShowForm(false)
    } catch (e) { toast('Erro: ' + e.message, 'err') } finally { setSaving(false) }
  }

  const del = async (c) => {
    if (!window.confirm(`Excluir o cliente "${c.name}"?`)) return
    try { await api.deleteClient(c.id); await onChange(); toast('Cliente excluído.', 'ok') } catch (e) { toast('Erro: ' + e.message, 'err') }
  }

  return (
    <div>
      <div className="ph">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="ptit">Clientes</div>
            <div className="psub">{clients.length} cliente(s)</div>
          </div>
          <button className="btn bb" onClick={openNew}><Icon n="plus" s={16} c="#fff" /> Novo Cliente</button>
        </div>
      </div>

      {clients.length === 0
        ? <div className="es"><div style={{ marginBottom: 12, opacity: .3 }}><Icon n="user" s={48} /></div><div className="estit">Nenhum cliente cadastrado</div></div>
        : <div className="card"><div className="tw"><table>
          <thead><tr><th>Nome</th><th>País</th><th>Contato</th><th>Documento</th><th></th></tr></thead>
          <tbody>
            {clients.map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight: 600 }}>{c.name}</td>
                <td>{c.country}</td>
                <td style={{ fontSize: 13 }}>{c.phone || c.email || '—'}</td>
                <td style={{ fontSize: 13, color: 'var(--mist)' }}>{c.doc || '—'}</td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn bo bsm" onClick={() => openEdit(c)} style={{ marginRight: 6 }}><Icon n="edit" s={13} /></button>
                  <button className="btn bo bsm" style={{ color: 'var(--err)' }} onClick={() => del(c)}><Icon n="trash" s={13} c="var(--err)" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div></div>}

      {showForm && (
        <div className="mo" onClick={() => setShowForm(false)}>
          <div className="md" onClick={e => e.stopPropagation()}>
            <div className="mhead">
              <div className="mtit">{editId ? 'Editar' : 'Novo'} Cliente</div>
              <button className="btn bo bsm" onClick={() => setShowForm(false)}><Icon n="x" s={14} /></button>
            </div>
            <div className="mbody">
              <div className="fg"><label className="fl">Nome *</label><input className="fc" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="fg"><label className="fl">País</label><input className="fc" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} /></div>
                <div className="fg"><label className="fl">Documento</label><input className="fc" value={form.doc} onChange={e => setForm({ ...form, doc: e.target.value })} placeholder="CNPJ/CPF/Tax ID" /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="fg"><label className="fl">Telefone</label><input className="fc" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                <div className="fg"><label className="fl">E-mail</label><input className="fc" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              </div>
              <div className="fg"><label className="fl">Observações</label><textarea className="fc" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
            </div>
            <div className="mfoot">
              <button className="btn bo" onClick={() => setShowForm(false)}>Cancelar</button>
              <button className="btn bb" onClick={save} disabled={saving}>{saving ? <><span className="spinner"></span> Salvando</> : 'Salvar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// PAYMENT METHODS
// ═══════════════════════════════════════════════════════════════
function PaymentsPage({ profile, payments, onChange, toast }) {
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ name: '', details: '' })
  const [saving, setSaving] = useState(false)

  const openNew = () => { setForm({ name: '', details: '' }); setEditId(null); setShowForm(true) }
  const openEdit = p => { setForm({ name: p.name, details: p.details || '' }); setEditId(p.id); setShowForm(true) }

  const save = async () => {
    if (!form.name.trim()) { toast('Nome obrigatório.', 'err'); return }
    setSaving(true)
    try {
      if (editId) await api.updatePaymentMethod(editId, form)
      else await api.createPaymentMethod(profile, form)
      await onChange()
      toast(editId ? 'Atualizado!' : 'Cadastrado!', 'ok')
      setShowForm(false)
    } catch (e) { toast('Erro: ' + e.message, 'err') } finally { setSaving(false) }
  }

  const del = async (p) => {
    if (!window.confirm(`Excluir "${p.name}"?`)) return
    try { await api.deletePaymentMethod(p.id); await onChange(); toast('Excluído.', 'ok') } catch (e) { toast('Erro: ' + e.message, 'err') }
  }

  return (
    <div>
      <div className="ph">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="ptit">Pagamentos</div>
            <div className="psub">{payments.length} forma(s) cadastrada(s)</div>
          </div>
          <button className="btn bb" onClick={openNew}><Icon n="plus" s={16} c="#fff" /> Nova Forma</button>
        </div>
      </div>

      {payments.length === 0
        ? <div className="es"><div style={{ marginBottom: 12, opacity: .3 }}><Icon n="card" s={48} /></div><div className="estit">Nenhuma forma de pagamento</div></div>
        : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 12 }}>
          {payments.map(p => (
            <div key={p.id} className="card">
              <div className="cb">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontWeight: 700 }}>{p.name}</div>
                  <Icon n="card" s={18} c="var(--sap5)" />
                </div>
                {p.details && <div style={{ fontSize: 13, color: 'var(--mist)', marginBottom: 12 }}>{p.details}</div>}
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn bo bsm" onClick={() => openEdit(p)}><Icon n="edit" s={13} /></button>
                  <button className="btn bo bsm" style={{ color: 'var(--err)' }} onClick={() => del(p)}><Icon n="trash" s={13} c="var(--err)" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>}

      {showForm && (
        <div className="mo" onClick={() => setShowForm(false)}>
          <div className="md" onClick={e => e.stopPropagation()}>
            <div className="mhead"><div className="mtit">{editId ? 'Editar' : 'Nova'} Forma de Pagamento</div><button className="btn bo bsm" onClick={() => setShowForm(false)}><Icon n="x" s={14} /></button></div>
            <div className="mbody">
              <div className="fg"><label className="fl">Nome *</label><input className="fc" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: PIX, Transferência..." /></div>
              <div className="fg"><label className="fl">Detalhes</label><textarea className="fc" value={form.details} onChange={e => setForm({ ...form, details: e.target.value })} placeholder="Chave PIX, conta bancária, etc." /></div>
            </div>
            <div className="mfoot">
              <button className="btn bo" onClick={() => setShowForm(false)}>Cancelar</button>
              <button className="btn bb" onClick={save} disabled={saving}>{saving ? <><span className="spinner"></span> Salvando</> : 'Salvar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// BLOCKS
// ═══════════════════════════════════════════════════════════════
function BlocksPage({ profile, blocks, quarries, onChange, toast }) {
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const emptyForm = {
    code: '', quarry_id: '', material: '', classification: 'A',
    gross_l: '', gross_h: '', gross_w: '',
    net_l: '', net_h: '', net_w: '',
    currency: 'BRL', price_m3: '',
    notes: '', photos: [],
    prod_date: new Date().toISOString().slice(0, 10),
  }
  const [form, setForm] = useState(emptyForm)

  const openNew = () => { setForm(emptyForm); setEditId(null); setShowForm(true) }
  const openEdit = b => {
    setForm({
      code: b.code, quarry_id: b.quarry_id || '', material: b.material, classification: b.classification,
      gross_l: b.gross_l || '', gross_h: b.gross_h || '', gross_w: b.gross_w || '',
      net_l: b.net_l || '', net_h: b.net_h || '', net_w: b.net_w || '',
      currency: b.currency, price_m3: b.price_m3 || '',
      notes: b.notes || '', photos: b.photos || [],
      prod_date: b.prod_date || new Date().toISOString().slice(0, 10),
    })
    setEditId(b.id); setShowForm(true)
  }

  // Volume calculation
  const grossV = (Number(form.gross_l) * Number(form.gross_h) * Number(form.gross_w)) || 0
  const netV   = (Number(form.net_l) * Number(form.net_h) * Number(form.net_w)) || 0
  const totalValue = netV * Number(form.price_m3 || 0)

  const handlePhotos = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    // Validate file sizes (max 5MB each)
    for (const f of files) {
      if (f.size > 5 * 1024 * 1024) {
        toast(`Foto "${f.name}" muito grande (máx. 5MB)`, 'err')
        e.target.value = ''
        return
      }
      if (!f.type.startsWith('image/')) {
        toast(`"${f.name}" não é uma imagem válida`, 'err')
        e.target.value = ''
        return
      }
    }

    setUploading(true)
    try {
      const urls = []
      for (const f of files) {
        const url = await api.uploadBlockPhoto(profile, f, form.code || 'tmp')
        urls.push(url)
      }
      setForm(prev => ({ ...prev, photos: [...prev.photos, ...urls] }))
      toast(`${urls.length} foto(s) enviada(s) com sucesso`, 'ok')
    } catch (e) {
      console.error('Photo upload error:', e)
      toast('Erro no upload: ' + (e.message || 'desconhecido'), 'err')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const save = async () => {
    if (!form.code.trim()) { toast('Código obrigatório.', 'err'); return }
    if (!form.quarry_id)  { toast('Selecione uma pedreira.', 'err'); return }
    if (!form.material.trim()) { toast('Material obrigatório.', 'err'); return }
    if (!form.price_m3) { toast('Informe o preço por m³.', 'err'); return }
    setSaving(true)
    try {
      const payload = {
        code: form.code.trim(),
        quarry_id: form.quarry_id,
        material: form.material,
        classification: form.classification,
        gross_l: Number(form.gross_l) || null,
        gross_h: Number(form.gross_h) || null,
        gross_w: Number(form.gross_w) || null,
        gross_volume: grossV || null,
        net_l: Number(form.net_l) || null,
        net_h: Number(form.net_h) || null,
        net_w: Number(form.net_w) || null,
        net_volume: netV || null,
        currency: form.currency,
        price_m3: Number(form.price_m3),
        total_value: totalValue,
        notes: form.notes,
        photos: form.photos,
        prod_date: form.prod_date,
      }
      if (editId) {
        await api.updateBlock(editId, payload)
        toast('Bloco atualizado!', 'ok')
      } else {
        await api.createBlock(profile, payload)
        toast('Bloco cadastrado!', 'ok')
      }
      await onChange()
      setShowForm(false)
    } catch (e) { toast('Erro: ' + e.message, 'err') } finally { setSaving(false) }
  }

  const del = async (b) => {
    if (!window.confirm(`Excluir o bloco "${b.code}"?`)) return
    try { await api.deleteBlock(b.id); await onChange(); toast('Bloco excluído.', 'ok') } catch (e) { toast('Erro: ' + e.message, 'err') }
  }

  const STATUS_CLR = { produced: '#64748b', available: '#10b981', reserved: '#f59e0b', sold: '#ef4444' }
  const STATUS_LBL = { produced: 'Produzido', available: 'Disponível', reserved: 'Reservado', sold: 'Vendido' }

  return (
    <div>
      <div className="ph">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="ptit">Blocos</div>
            <div className="psub">{blocks.length} bloco(s) cadastrado(s)</div>
          </div>
          <button className="btn bb" onClick={openNew}><Icon n="plus" s={16} c="#fff" /> Novo Bloco</button>
        </div>
      </div>

      {blocks.length === 0
        ? <div className="es"><div style={{ marginBottom: 12, opacity: .3 }}><Icon n="cube" s={48} /></div><div className="estit">Nenhum bloco cadastrado</div></div>
        : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
          {blocks.map(b => {
            const q = quarries.find(x => x.id === b.quarry_id)
            return (
              <div key={b.id} className="card">
                {b.photos && b.photos.length > 0 && b.photos[0]
                  ? <img src={b.photos[0]} alt={b.code} style={{ width: '100%', height: 160, objectFit: 'cover', background: 'var(--haze)' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex' }} />
                  : null}
                {(!b.photos || !b.photos.length || !b.photos[0]) && <div style={{ height: 100, background: 'var(--haze)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon n="cube" s={32} c="var(--mist)" /></div>}
                <div style={{ height: 100, background: 'var(--haze)', display: 'none', alignItems: 'center', justifyContent: 'center' }}><Icon n="cube" s={32} c="var(--mist)" /></div>
                <div className="cb">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 15 }}>{b.code}</div>
                    <span className="bdg" style={{ background: STATUS_CLR[b.status] + '20', color: STATUS_CLR[b.status] }}>{STATUS_LBL[b.status]}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--mist)', marginBottom: 8 }}>{b.material}</div>
                  <div style={{ fontSize: 11, color: 'var(--mist)', marginBottom: 10 }}>📍 {q?.name || '—'} · Vol. {(b.net_volume || 0).toFixed(2)} m³</div>
                  <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--sap7)', marginBottom: 10 }}>{money(b.total_value, b.currency)}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn bo bsm" onClick={() => openEdit(b)}><Icon n="edit" s={13} /> Editar</button>
                    <button className="btn bo bsm" style={{ color: 'var(--err)' }} onClick={() => del(b)}><Icon n="trash" s={13} c="var(--err)" /></button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>}

      {showForm && (
        <div className="mo" onClick={() => setShowForm(false)}>
          <div className="md" style={{ maxWidth: 760 }} onClick={e => e.stopPropagation()}>
            <div className="mhead"><div className="mtit">{editId ? 'Editar' : 'Novo'} Bloco</div><button className="btn bo bsm" onClick={() => setShowForm(false)}><Icon n="x" s={14} /></button></div>
            <div className="mbody">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="fg"><label className="fl">Código *</label><input className="fc" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="Ex: VMC-001" /></div>
                <div className="fg"><label className="fl">Pedreira *</label>
                  <select className="fc" value={form.quarry_id} onChange={e => setForm({ ...form, quarry_id: e.target.value, material: '' })}>
                    <option value="">Selecione...</option>
                    {quarries.map(q => <option key={q.id} value={q.id}>{q.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
                <div className="fg"><label className="fl">Material *</label>
                  {(() => {
                    const selectedQuarry = quarries.find(q => q.id === form.quarry_id)
                    const materials = selectedQuarry?.materials || []
                    if (!form.quarry_id) {
                      return <input className="fc" disabled placeholder="Selecione uma pedreira primeiro" style={{ background: 'var(--haze)', color: 'var(--mist)' }} />
                    }
                    if (materials.length === 0) {
                      return <input className="fc" disabled placeholder="Pedreira sem materiais cadastrados" style={{ background: 'var(--haze)', color: 'var(--mist)' }} />
                    }
                    return (
                      <select className="fc" value={form.material} onChange={e => setForm({ ...form, material: e.target.value })}>
                        <option value="">Selecione o material...</option>
                        {materials.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    )
                  })()}
                </div>
                <div className="fg"><label className="fl">Classificação</label>
                  <select className="fc" value={form.classification} onChange={e => setForm({ ...form, classification: e.target.value })}>
                    <option>A</option><option>B</option><option>C</option><option>D</option>
                  </select>
                </div>
                <div className="fg"><label className="fl">Data Produção</label><input className="fc" type="date" value={form.prod_date} max={new Date().toISOString().slice(0,10)} onChange={e => setForm({ ...form, prod_date: e.target.value })} /></div>
              </div>

              <div style={{ background: 'var(--haze)', padding: 14, borderRadius: 8, marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--mist)', marginBottom: 10 }}>Medidas Brutas (m)</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                  <input className="fc" type="number" step="0.01" placeholder="Comp." value={form.gross_l} onChange={e => setForm({ ...form, gross_l: e.target.value })} />
                  <input className="fc" type="number" step="0.01" placeholder="Alt." value={form.gross_h} onChange={e => setForm({ ...form, gross_h: e.target.value })} />
                  <input className="fc" type="number" step="0.01" placeholder="Larg." value={form.gross_w} onChange={e => setForm({ ...form, gross_w: e.target.value })} />
                  <div style={{ padding: '11px 14px', background: '#fff', borderRadius: 10, fontWeight: 700, textAlign: 'center' }}>{grossV.toFixed(2)} m³</div>
                </div>
              </div>

              <div style={{ background: '#dcfce7', padding: 14, borderRadius: 8, marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#15803d', marginBottom: 10 }}>Medidas Líquidas (m)</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                  <input className="fc" type="number" step="0.01" placeholder="Comp." value={form.net_l} onChange={e => setForm({ ...form, net_l: e.target.value })} />
                  <input className="fc" type="number" step="0.01" placeholder="Alt." value={form.net_h} onChange={e => setForm({ ...form, net_h: e.target.value })} />
                  <input className="fc" type="number" step="0.01" placeholder="Larg." value={form.net_w} onChange={e => setForm({ ...form, net_w: e.target.value })} />
                  <div style={{ padding: '11px 14px', background: '#fff', borderRadius: 10, fontWeight: 700, textAlign: 'center', color: '#15803d' }}>{netV.toFixed(2)} m³</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
                <div className="fg"><label className="fl">Moeda</label>
                  <select className="fc" value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}>
                    <option value="BRL">BRL (R$)</option><option value="USD">USD (US$)</option>
                  </select>
                </div>
                <div className="fg"><label className="fl">Preço por m³ *</label>
                  <input className="fc" type="number" step="0.01" value={form.price_m3} onChange={e => setForm({ ...form, price_m3: e.target.value })} />
                </div>
              </div>

              {totalValue > 0 && (
                <div style={{ background: 'var(--sap1)', padding: 14, borderRadius: 8, marginBottom: 14, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--sap7)', fontWeight: 700, textTransform: 'uppercase' }}>Valor Total</div>
                  <div style={{ fontFamily: 'Sora,sans-serif', fontSize: 28, fontWeight: 800, color: 'var(--sap7)' }}>{money(totalValue, form.currency)}</div>
                </div>
              )}

              <div className="fg">
                <label className="fl">Fotos</label>
                <input type="file" accept="image/*" multiple onChange={handlePhotos} disabled={uploading} style={{ marginBottom: 8 }} />
                {uploading && <div style={{ fontSize: 13, color: 'var(--mist)' }}><span className="spinner"></span> Enviando...</div>}
                {form.photos.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(80px,1fr))', gap: 6 }}>
                    {form.photos.map((url, i) => (
                      <div key={i} style={{ position: 'relative' }}>
                        <img src={url} alt="" style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 6 }} />
                        <button onClick={() => setForm({ ...form, photos: form.photos.filter((_, j) => j !== i) })} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,.7)', color: '#fff', border: 'none', width: 20, height: 20, borderRadius: '50%', cursor: 'pointer' }}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="fg"><label className="fl">Observações</label><textarea className="fc" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
            </div>
            <div className="mfoot">
              <button className="btn bo" onClick={() => setShowForm(false)}>Cancelar</button>
              <button className="btn bb" onClick={save} disabled={saving || uploading}>{saving ? <><span className="spinner"></span> Salvando</> : 'Salvar Bloco'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function App() {
  const [profile, setProfile]     = useState(null)
  const [loading, setLoading]     = useState(true)
  const [page,    setPage]        = useState('dashboard')
  const [sbOpen,  setSbOpen]      = useState(false)
  const [toast,   setToast]       = useState(null)

  const [quarries, setQuarries]   = useState([])
  const [clients,  setClients]    = useState([])
  const [payments, setPayments]   = useState([])
  const [blocks,   setBlocks]     = useState([])

  const showToast = useCallback((msg, type = '') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  // Load all data
  const loadData = useCallback(async (p) => {
    if (!p) return
    try {
      const [q, c, pm, b] = await Promise.all([
        api.listQuarries(p),
        api.listClients(p),
        api.listPaymentMethods(p),
        api.listBlocks(p),
      ])
      setQuarries(q); setClients(c); setPayments(pm); setBlocks(b)
    } catch (e) {
      console.error('loadData error:', e)
      showToast('Erro ao carregar dados: ' + e.message, 'err')
    }
  }, [showToast])

  // Init session — with timeout to never hang forever
  useEffect(() => {
    let mounted = true

    // Safety timeout: if anything takes >6s, show login
    const timeoutId = setTimeout(() => {
      if (mounted) {
        console.warn('Init timeout — showing login')
        setLoading(false)
      }
    }, 6000)

    const init = async () => {
      try {
        const session = await Promise.race([
          api.getSession(),
          new Promise((_, rej) => setTimeout(() => rej(new Error('Session timeout')), 5000))
        ])
        if (session?.user && mounted) {
          const p = await api.ensureProfile(session.user.id, session.user.email)
          if (!mounted) return
          setProfile(p)
          await loadData(p)
        }
      } catch (e) {
        console.error('init error:', e)
      } finally {
        if (mounted) {
          clearTimeout(timeoutId)
          setLoading(false)
        }
      }
    }
    init()

    const { data: { subscription } } = api.onAuthChange(async (event, session) => {
      if (!mounted) return
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const p = await api.ensureProfile(session.user.id, session.user.email)
          if (!mounted) return
          setProfile(p)
          await loadData(p)
        } catch (e) {
          console.error('SIGNED_IN error:', e)
        } finally {
          if (mounted) setLoading(false)
        }
      }
      if (event === 'SIGNED_OUT') {
        setProfile(null); setBlocks([]); setQuarries([]); setClients([]); setPayments([])
      }
    })

    return () => {
      mounted = false
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [loadData])

  const handleLogout = async () => {
    await api.signOut()
    setProfile(null)
  }

  if (loading) return (
    <>
      <style>{CSS}</style>
      <div className="loading-screen">
        <div style={{ textAlign: 'center' }}>
          <div className="spinner"></div>
          <div>Carregando Stone Block...</div>
        </div>
      </div>
    </>
  )

  if (!profile) return (
    <>
      <style>{CSS}</style>
      <LoginPage onLogin={() => {}} />
    </>
  )

  const NAV = [
    { p: 'dashboard', l: 'Dashboard',   i: 'grid' },
    { p: 'blocks',    l: 'Blocos',      i: 'cube' },
    { p: 'quarries',  l: 'Pedreiras',   i: 'mtn' },
    { p: 'clients',   l: 'Clientes',    i: 'user' },
    { p: 'payments',  l: 'Pagamentos',  i: 'card' },
  ]

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard blocks={blocks} quarries={quarries} clients={clients} />
      case 'blocks':    return <BlocksPage profile={profile} blocks={blocks} quarries={quarries} onChange={() => loadData(profile)} toast={showToast} />
      case 'quarries':  return <QuarriesPage profile={profile} quarries={quarries} blocks={blocks} onChange={() => loadData(profile)} toast={showToast} />
      case 'clients':   return <ClientsPage profile={profile} clients={clients} onChange={() => loadData(profile)} toast={showToast} />
      case 'payments':  return <PaymentsPage profile={profile} payments={payments} onChange={() => loadData(profile)} toast={showToast} />
      default:          return <Dashboard blocks={blocks} quarries={quarries} clients={clients} />
    }
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <div className="tb">
          <div className="tbl">
            <button className="tbbtn" onClick={() => setSbOpen(v => !v)}><Icon n="menu" s={20} c="#fff" /></button>
            <div className="tblogo">Stone <span>Block</span></div>
          </div>
          <div className="tbr">
            <div className="av" title={profile.name}>{profile.avatar || profile.name.substring(0, 2).toUpperCase()}</div>
          </div>
        </div>

        <div className="lay">
          <div className={'sbov' + (sbOpen ? ' show' : '')} onClick={() => setSbOpen(false)} />
          <div className={'sb' + (sbOpen ? ' open' : '')}>
            <div className="sblbl">Menu</div>
            {NAV.map(it => (
              <div key={it.p} className={'sbni' + (page === it.p ? ' on' : '')} onClick={() => { setPage(it.p); setSbOpen(false) }}>
                <Icon n={it.i} s={15} />
                <span>{it.l}</span>
              </div>
            ))}
            <div className="sbft">
              <div className="sbusr">
                <div className="av">{profile.avatar || profile.name.substring(0, 2).toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="sbun">{profile.name}</div>
                  <div className="sbur">{ROLE_LABEL[profile.role]}</div>
                </div>
              </div>
              <button className="lobtn" onClick={handleLogout}><Icon n="out" s={14} /> Sair</button>
            </div>
          </div>
          <div className="main">{renderPage()}</div>
        </div>

        {toast && <div className={'toast ' + toast.type}>{toast.msg}</div>}
      </div>
    </>
  )
}
