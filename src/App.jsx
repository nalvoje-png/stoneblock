// src/App.jsx
// ═══════════════════════════════════════════════════════════════
// Stone Block — Sistema de gestão para pedreiras
// Integrado com Supabase: Auth, PostgreSQL, Storage
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback, useRef } from 'react'
import * as api from './api'
import { supabase } from './supabase'

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

/* Mobile-only utilities */
@media(max-width:767px){
  .mobile-only{display:block!important;}
  .responsive-grid-2{grid-template-columns:1fr!important;}
  .responsive-grid-3-mat{grid-template-columns:1fr!important;}
}
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
function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const submit = async (e) => {
    e?.preventDefault()
    if (!email || !password) { setErr('Informe e-mail e senha.'); return }
    setLoading(true); setErr('')
    try {
      const result = await api.signIn(email, password)
      console.log('Login OK:', result.user?.email)
      // Get profile right after signIn
      const p = await api.ensureProfile(result.user.id, result.user.email)
      console.log('Profile OK:', p.name)
      onLoginSuccess(p)
    } catch (e) {
      console.error('Login error:', e)
      setErr(e.message?.includes('Invalid') ? 'E-mail ou senha inválidos.' : 'Erro: ' + e.message)
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
function Dashboard({ blocks, quarries, clients, sales }) {
  const [filterQuarry, setFilterQuarry] = useState('')
  const [filterMaterial, setFilterMaterial] = useState('')
  const [filterPeriod, setFilterPeriod] = useState('month')
  const [dtInicio, setDtInicio] = useState('')
  const [dtFim, setDtFim] = useState('')

  // Materials disponíveis dos blocos
  const allMaterials = [...new Set(blocks.map(b => b.material).filter(Boolean))].sort()

  // Apply filters
  const filteredBlocks = blocks.filter(b => {
    if (filterQuarry && b.quarry_id !== filterQuarry) return false
    if (filterMaterial && b.material !== filterMaterial) return false
    if (filterPeriod !== 'all' && filterPeriod !== 'custom') {
      const d = new Date(b.prod_date || b.created_at)
      const now = new Date()
      if (filterPeriod === 'month') {
        if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return false
      } else if (filterPeriod === 'last_month') {
        const last = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        if (d.getMonth() !== last.getMonth() || d.getFullYear() !== last.getFullYear()) return false
      } else if (filterPeriod === 'year') {
        if (d.getFullYear() !== now.getFullYear()) return false
      }
    }
    if (filterPeriod === 'custom') {
      const d = new Date(b.prod_date || b.created_at)
      if (dtInicio && d < new Date(dtInicio + 'T00:00:00')) return false
      if (dtFim && d > new Date(dtFim + 'T23:59:59')) return false
    }
    return true
  })

  const total     = filteredBlocks.length
  const available = filteredBlocks.filter(b => b.status === 'available').length
  const sold      = filteredBlocks.filter(b => b.status === 'sold').length
  const reserved  = filteredBlocks.filter(b => b.status === 'reserved').length

  const totalBRL = filteredBlocks.filter(b => b.currency === 'BRL' && b.status !== 'sold').reduce((a, b) => a + (Number(b.total_value) || 0), 0)
  const totalUSD = filteredBlocks.filter(b => b.currency === 'USD' && b.status !== 'sold').reduce((a, b) => a + (Number(b.total_value) || 0), 0)

  // Filtered sales — também aplica filtro de pedreira (verifica se algum bloco vendido é da pedreira)
  const filteredSales = (sales || []).filter(s => {
    if (filterPeriod !== 'all' && filterPeriod !== 'custom') {
      const d = new Date(s.created_at)
      const now = new Date()
      if (filterPeriod === 'month') {
        if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return false
      } else if (filterPeriod === 'last_month') {
        const last = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        if (d.getMonth() !== last.getMonth() || d.getFullYear() !== last.getFullYear()) return false
      } else if (filterPeriod === 'year') {
        if (d.getFullYear() !== now.getFullYear()) return false
      }
    }
    if (filterPeriod === 'custom') {
      const d = new Date(s.created_at)
      if (dtInicio && d < new Date(dtInicio + 'T00:00:00')) return false
      if (dtFim && d > new Date(dtFim + 'T23:59:59')) return false
    }
    // Filtro de pedreira: pelo menos um bloco da venda deve ser da pedreira selecionada
    if (filterQuarry) {
      const hasFromQuarry = (s.blocks || []).some(b => b.quarry_id === filterQuarry)
      if (!hasFromQuarry) return false
    }
    // Filtro de material: pelo menos um bloco deve ser do material
    if (filterMaterial) {
      const hasMaterial = (s.blocks || []).some(b => b.material === filterMaterial)
      if (!hasMaterial) return false
    }
    return true
  })

  const salesTotalBRL = filteredSales.reduce((a, s) => a + (Number(s.total_brl) || 0), 0)
  const salesTotalUSD = filteredSales.reduce((a, s) => a + (Number(s.total_usd) || 0), 0)

  return (
    <div>
      <div className="ph">
        <div className="ptit">Dashboard</div>
        <div className="psub">Visão geral do estoque</div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="cb" style={{ padding: '14px 18px' }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--mist)', textTransform: 'uppercase', letterSpacing: .5 }}>Filtros:</span>
            <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 180 }} value={filterPeriod} onChange={e => setFilterPeriod(e.target.value)}>
              <option value="all">Todos os períodos</option>
              <option value="month">Mês atual</option>
              <option value="last_month">Mês anterior</option>
              <option value="year">Ano atual</option>
              <option value="custom">Período personalizado</option>
            </select>
            {filterPeriod === 'custom' && (
              <>
                <input type="date" className="fc" style={{ fontSize: 13, padding: '7px 10px' }} value={dtInicio} onChange={e => setDtInicio(e.target.value)} />
                <input type="date" className="fc" style={{ fontSize: 13, padding: '7px 10px' }} value={dtFim} onChange={e => setDtFim(e.target.value)} />
              </>
            )}
            <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 200 }} value={filterQuarry} onChange={e => setFilterQuarry(e.target.value)}>
              <option value="">Todas as pedreiras</option>
              {quarries.map(q => <option key={q.id} value={q.id}>{q.name}</option>)}
            </select>
            <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 220 }} value={filterMaterial} onChange={e => setFilterMaterial(e.target.value)}>
              <option value="">Todos os materiais</option>
              {allMaterials.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            {(filterPeriod !== 'all' || filterQuarry || filterMaterial) && (
              <button className="btn bo bsm" onClick={() => { setFilterPeriod('all'); setFilterQuarry(''); setFilterMaterial(''); setDtInicio(''); setDtFim('') }}>
                <Icon n="x" s={13} /> Limpar
              </button>
            )}
          </div>
        </div>
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

      {/* Sales summary for the period */}
      {sales && filteredSales.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16, marginBottom: 16 }}>
          <div className="card" style={{ background: 'linear-gradient(135deg,#0c1a2e,#1e3a8a)', color: '#fff', border: 'none' }}>
            <div className="chead" style={{ borderBottomColor: 'rgba(255,255,255,.15)' }}><div className="ctit" style={{ color: '#fff' }}>💰 Faturamento do Período</div></div>
            <div className="cb">
              <div style={{ fontSize: 12, opacity: .7, marginBottom: 4 }}>{filteredSales.length} venda(s) realizada(s)</div>
              <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 28, color: '#fff' }}>{money(salesTotalBRL, 'BRL')}</div>
              {salesTotalUSD > 0 && <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--sap4)', marginTop: 4 }}>+ {money(salesTotalUSD, 'USD')}</div>}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
        <div className="card">
          <div className="chead"><div className="ctit">Pedreiras</div></div>
          <div className="cb">
            {quarries.length === 0
              ? <div style={{ color: 'var(--mist)', fontSize: 13 }}>Nenhuma pedreira cadastrada</div>
              : quarries.map(q => {
                const cnt = filteredBlocks.filter(b => b.quarry_id === q.id).length
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
  const [form, setForm] = useState({ name: '', location: '', materials: [], material_photos: {} })
  const [matInput, setMatInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploadingMat, setUploadingMat] = useState(null)

  const openNew = () => {
    setForm({ name: '', location: '', materials: [], material_photos: {} })
    setMatInput(''); setEditId(null); setShowForm(true)
  }
  const openEdit = q => {
    setForm({
      name: q.name,
      location: q.location || '',
      materials: q.materials || [],
      material_photos: q.material_photos || {},
    })
    setMatInput(''); setEditId(q.id); setShowForm(true)
  }

  const addMat = () => {
    const m = matInput.trim()
    if (!m) return
    if (form.materials.includes(m)) { toast('Material já adicionado.', 'err'); return }
    setForm({ ...form, materials: [...form.materials, m] })
    setMatInput('')
  }

  const removeMat = (m) => {
    const newPhotos = { ...form.material_photos }
    delete newPhotos[m]
    setForm({ ...form, materials: form.materials.filter(x => x !== m), material_photos: newPhotos })
  }

  const handleMatPhoto = async (e, matName) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast('Foto muito grande (máx. 5MB)', 'err'); return }
    if (!file.type.startsWith('image/')) { toast('Arquivo inválido', 'err'); return }

    setUploadingMat(matName)
    try {
      const url = await api.uploadMaterialPhoto(profile, file, matName)
      setForm(prev => ({ ...prev, material_photos: { ...prev.material_photos, [matName]: url } }))
      toast('Foto enviada!', 'ok')
    } catch (err) {
      toast('Erro: ' + err.message, 'err')
    } finally {
      setUploadingMat(null)
      e.target.value = ''
    }
  }

  const removeMatPhoto = (matName) => {
    const newPhotos = { ...form.material_photos }
    delete newPhotos[matName]
    setForm({ ...form, material_photos: newPhotos })
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {(q.materials || []).map(m => {
                      const photo = q.material_photos?.[m]
                      return (
                        <div key={m} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', background: 'var(--haze)', borderRadius: 6 }}>
                          {photo ? (
                            <img src={photo} alt={m} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} />
                          ) : (
                            <div style={{ width: 36, height: 36, background: '#fff', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Icon n="cube" s={16} c="var(--mist)" />
                            </div>
                          )}
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--sap7)' }}>{m}</span>
                        </div>
                      )
                    })}
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
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <input className="fc" value={matInput} onChange={e => setMatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addMat())} placeholder="Ex: Granito Verde Ubatuba" />
                  <button className="btn bb bsm" onClick={addMat}><Icon n="plus" s={13} c="#fff" /></button>
                </div>

                {form.materials.length > 0 && (
                  <div style={{ background: 'var(--haze)', padding: 12, borderRadius: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--mist)', marginBottom: 10 }}>
                      Foto da amostra (opcional)
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {form.materials.map(m => {
                        const photo = form.material_photos[m]
                        const isUploading = uploadingMat === m
                        return (
                          <div key={m} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 8, background: '#fff', borderRadius: 6 }}>
                            {photo ? (
                              <div style={{ position: 'relative', flexShrink: 0 }}>
                                <img src={photo} alt={m} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 5 }} />
                                <button
                                  onClick={() => removeMatPhoto(m)}
                                  title="Remover foto"
                                  style={{ position: 'absolute', top: -4, right: -4, background: 'rgba(0,0,0,.75)', color: '#fff', border: 'none', width: 18, height: 18, borderRadius: '50%', cursor: 'pointer', fontSize: 11 }}>×</button>
                              </div>
                            ) : (
                              <div style={{ width: 48, height: 48, background: 'var(--haze)', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Icon n="cube" s={20} c="var(--mist)" />
                              </div>
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--sap7)' }}>{m}</div>
                              {isUploading ? (
                                <div style={{ fontSize: 11, color: 'var(--mist)' }}><span className="spinner"></span> Enviando...</div>
                              ) : (
                                <label style={{ fontSize: 11, color: 'var(--sap6)', cursor: 'pointer', textDecoration: 'underline' }}>
                                  {photo ? 'Trocar foto' : '+ Adicionar foto'}
                                  <input type="file" accept="image/*" onChange={e => handleMatPhoto(e, m)} style={{ display: 'none' }} />
                                </label>
                              )}
                            </div>
                            <button
                              onClick={() => removeMat(m)}
                              title="Remover material"
                              className="btn bo bsm"
                              style={{ color: 'var(--err)', padding: '4px 8px' }}>
                              <Icon n="trash" s={12} c="var(--err)" />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="mfoot">
              <button className="btn bo" onClick={() => setShowForm(false)}>Cancelar</button>
              <button className="btn bb" onClick={save} disabled={saving}>
                {saving ? <><span className="spinner"></span> Salvando</> : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


// ═══════════════════════════════════════════════════════════════
// CLIENT USERS MANAGER — gerencia múltiplos acessos para um cliente
// ═══════════════════════════════════════════════════════════════
function ClientUsersManager({ profile, clientId, toast }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const list = await api.listClientUsers(clientId)
      setUsers(list)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { load() }, [clientId])

  const addUser = async () => {
    if (!newUser.name.trim()) { toast('Nome obrigatório.', 'err'); return }
    if (!newUser.email.trim()) { toast('E-mail obrigatório.', 'err'); return }
    if (!newUser.password || newUser.password.length < 6) { toast('Senha deve ter ao menos 6 caracteres.', 'err'); return }
    setSaving(true)
    try {
      await api.addClientUser(profile, clientId, newUser.email.trim(), newUser.password, newUser.name.trim())
      toast('Acesso criado com sucesso!', 'ok')
      setNewUser({ name: '', email: '', password: '' })
      setShowAddForm(false)
      await load()
    } catch (e) { toast('Erro: ' + e.message, 'err') } finally { setSaving(false) }
  }

  const removeUser = async (cu) => {
    if (!window.confirm(`Remover o acesso de ${cu.name}?`)) return
    try {
      await api.removeClientUser(cu.id)
      toast('Acesso removido.', 'ok')
      await load()
    } catch (e) { toast('Erro: ' + e.message, 'err') }
  }

  return (
    <div style={{ background: 'var(--sap1)', padding: 14, borderRadius: 10, marginTop: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontWeight: 700, color: 'var(--sap7)' }}>Acessos ao Sistema ({users.length})</div>
        <button className="btn bo bsm" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? <><Icon n="x" s={13} /> Cancelar</> : <><Icon n="plus" s={13} /> Adicionar Acesso</>}
        </button>
      </div>

      {loading ? (
        <div style={{ fontSize: 13, color: 'var(--mist)', textAlign: 'center', padding: 10 }}>Carregando...</div>
      ) : users.length === 0 && !showAddForm ? (
        <div style={{ fontSize: 13, color: 'var(--mist)', padding: 8 }}>
          Nenhum acesso criado. Clique em "Adicionar Acesso" para criar.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: showAddForm ? 12 : 0 }}>
          {users.map(cu => (
            <div key={cu.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#fff', borderRadius: 6, fontSize: 13 }}>
              <div>
                <div style={{ fontWeight: 600 }}>{cu.name || 'Sem nome'}</div>
                <div style={{ fontSize: 11, color: 'var(--mist)' }}>Criado em {fmtDate(cu.created_at)}</div>
              </div>
              <button className="btn bo bsm" style={{ color: 'var(--err)' }} onClick={() => removeUser(cu)} title="Remover acesso">
                <Icon n="trash" s={13} c="var(--err)" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showAddForm && (
        <div style={{ background: '#fff', padding: 12, borderRadius: 8, border: '1px solid var(--fog)' }}>
          <div className="fg" style={{ marginBottom: 8 }}>
            <label className="fl">Nome do usuário *</label>
            <input className="fc" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} placeholder="Ex: João da Silva" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div className="fg" style={{ marginBottom: 8 }}>
              <label className="fl">E-mail *</label>
              <input className="fc" type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} placeholder="usuario@email.com" />
            </div>
            <div className="fg" style={{ marginBottom: 8 }}>
              <label className="fl">Senha *</label>
              <input className="fc" type="text" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} placeholder="Mínimo 6 caracteres" />
            </div>
          </div>
          <button className="btn bb bsm" onClick={addUser} disabled={saving} style={{ width: '100%' }}>
            {saving ? <><span className="spinner"></span> Criando</> : 'Criar Acesso'}
          </button>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// CLIENTS PAGE
// ═══════════════════════════════════════════════════════════════
function ClientsPage({ profile, clients, onChange, toast }) {
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ name: '', country: 'Brasil', phone: '', email: '', doc: '', notes: '' })
  const [createAccount, setCreateAccount] = useState(false)
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)

  const openNew = () => { setForm({ name: '', country: 'Brasil', phone: '', email: '', doc: '', notes: '' }); setEditId(null); setCreateAccount(false); setPassword(''); setShowForm(true) }
  const openEdit = c => { setForm({ name: c.name, country: c.country || 'Brasil', phone: c.phone || '', email: c.email || '', doc: c.doc || '', notes: c.notes || '' }); setEditId(c.id); setCreateAccount(false); setPassword(''); setShowForm(true) }

  const save = async () => {
    if (!form.name.trim()) { toast('Nome obrigatório.', 'err'); return }
    if (createAccount && !editId) {
      if (!form.email.trim()) { toast('E-mail obrigatório para criar conta.', 'err'); return }
      if (!password || password.length < 6) { toast('Senha deve ter ao menos 6 caracteres.', 'err'); return }
    }
    setSaving(true)
    try {
      if (editId) {
        await api.updateClient(editId, form)
        toast('Cliente atualizado!', 'ok')
      } else {
        const accountData = createAccount ? { email: form.email, password } : null
        await api.createClient(profile, form, accountData)
        toast(createAccount ? 'Cliente cadastrado com acesso ao sistema!' : 'Cliente cadastrado!', 'ok')
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
          <thead><tr><th>Nome</th><th>País</th><th>Contato</th><th>Documento</th><th>Acesso</th><th></th></tr></thead>
          <tbody>
            {clients.map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight: 600 }}>{c.name}</td>
                <td>{c.country}</td>
                <td style={{ fontSize: 13 }}>{c.phone || c.email || '—'}</td>
                <td style={{ fontSize: 13, color: 'var(--mist)' }}>{c.doc || '—'}</td>
                <td>
                  {c.user_id
                    ? <span className="bdg" style={{ background: '#dcfce7', color: '#15803d' }}>✓ Conta ativa</span>
                    : <span className="bdg" style={{ background: 'var(--haze)', color: 'var(--mist)' }}>Sem acesso</span>}
                </td>
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

              {/* Account creation section (only for new clients) */}
              {!editId && (
                <div style={{ background: 'var(--sap1)', padding: 14, borderRadius: 10, marginTop: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: createAccount ? 12 : 0 }} onClick={() => setCreateAccount(!createAccount)}>
                    <div style={{ width: 20, height: 20, borderRadius: 5, border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', borderColor: createAccount ? 'var(--sap6)' : 'var(--fog)', background: createAccount ? 'var(--sap6)' : '#fff' }}>
                      {createAccount && <Icon n="check" s={12} c="#fff" />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--sap7)' }}>Criar acesso ao sistema</div>
                      <div style={{ fontSize: 12, color: 'var(--mist)' }}>Cliente poderá fazer login e ver o catálogo</div>
                    </div>
                  </div>
                  {createAccount && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div className="fg" style={{ marginBottom: 0 }}>
                        <label className="fl">E-mail de login *</label>
                        <input className="fc" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="cliente@email.com" />
                      </div>
                      <div className="fg" style={{ marginBottom: 0 }}>
                        <label className="fl">Senha *</label>
                        <input className="fc" type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
                      </div>
                    </div>
                  )}
                </div>
              )}
              {editId && (
                <ClientUsersManager
                  profile={profile}
                  clientId={editId}
                  toast={toast}
                />
              )}
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
function BlocksPage({ profile, blocks, quarries, clients, payments, onChange, toast }) {
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [showSaleModal, setShowSaleModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState('available')
  const [filterMaterial, setFilterMaterial] = useState('')
  const [filterQuarry, setFilterQuarry] = useState('')
  const [detailBlock, setDetailBlock] = useState(null)
  const [reserveTarget, setReserveTarget] = useState(null)
  const [reserveClientId, setReserveClientId] = useState('')
  const [mobileGrid2, setMobileGrid2] = useState(false)

  const emptyForm = {
    code: '', quarry_id: '', material: '', classification: 'A',
    gross_l: '', gross_h: '', gross_w: '',
    net_l: '', net_h: '', net_w: '',
    currency: 'USD', price_m3: '',
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

  const confirmReserve = async () => {
    if (!reserveClientId) { toast('Selecione o cliente.', 'err'); return }
    try {
      await api.reserveBlock(reserveTarget.id, reserveClientId)
      await onChange()
      toast(`Bloco ${reserveTarget.code} reservado.`, 'ok')
      setReserveTarget(null); setReserveClientId('')
    } catch (e) { toast('Erro: ' + e.message, 'err') }
  }

  const unreserve = async (b) => {
    if (!window.confirm(`Desfazer reserva do bloco ${b.code}?`)) return
    try {
      await api.unreserveBlock(b.id)
      await onChange()
      toast('Reserva desfeita.', 'ok')
    } catch (e) { toast('Erro: ' + e.message, 'err') }
  }

  const moveToReserve = async (b) => {
    if (!window.confirm(`Mover o bloco ${b.code} para a Reserva Comercial?`)) return
    try {
      await api.moveToReserve(b.id)
      await onChange()
      toast(`Bloco ${b.code} movido para Reserva Comercial.`, 'ok')
    } catch (e) { toast('Erro: ' + e.message, 'err') }
  }

  const STATUS_CLR = { produced: '#64748b', available: '#10b981', reserved: '#f59e0b', sold: '#ef4444' }
  const STATUS_LBL = { produced: 'Produzido', available: 'Disponível', reserved: 'Reservado', sold: 'Vendido' }

  // ─── FILTERS ────────────────────────────────────────────────
  // Unique materials and quarries for filter dropdowns
  const allMaterials = [...new Set(blocks.map(b => b.material).filter(Boolean))].sort()
  const filteredBlocks = blocks.filter(b => {
    if (b.status === 'reserve') return false  // Reserva Comercial não aparece na lista principal
    if (b.status === 'sold') return false      // Vendidos têm página própria
    if (filterStatus && b.status !== filterStatus) return false
    if (filterMaterial && b.material !== filterMaterial) return false
    if (filterQuarry && b.quarry_id !== filterQuarry) return false
    return true
  })

  // Selection logic
  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }
  const clearSelection = () => setSelectedIds([])
  const selectedBlocks = blocks.filter(b => selectedIds.includes(b.id))

  // Owner pode tudo, foreman cadastra/edita, seller só vende
  const canEdit = profile.role === 'owner' || profile.role === 'foreman' || profile.role === 'seller'
  const canSell = profile.role === 'owner' || profile.role === 'seller'
  const canReserve = profile.role === 'owner' || profile.role === 'seller'

  // Grid style: on mobile, 1 or 2 columns based on toggle; desktop always 280px
  const gridStyle = {
    display: 'grid',
    gap: 14,
    gridTemplateColumns: mobileGrid2
      ? 'repeat(auto-fill,minmax(140px,1fr))'
      : 'repeat(auto-fill,minmax(280px,1fr))',
  }

  return (
    <div>
      <div className="ph">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="ptit">Blocos</div>
            <div className="psub">{filteredBlocks.length} bloco(s) · {blocks.length} total</div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {selectedIds.length > 0 && canSell && (
              <>
                <button className="btn bg" onClick={() => setShowSaleModal(true)}>
                  <Icon n="cart" s={16} c="#fff" /> Vender {selectedIds.length} bloco(s)
                </button>
                <button className="btn bo" onClick={clearSelection}>
                  <Icon n="x" s={14} /> Limpar
                </button>
              </>
            )}
            {canEdit && (
              <button className="btn bb" onClick={openNew}><Icon n="plus" s={16} c="#fff" /> Novo Bloco</button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile grid toggle - only visible on mobile */}
      <div className="mobile-only" style={{ display: 'none', marginBottom: 12 }}>
        <button className="btn bo bsm" onClick={() => setMobileGrid2(!mobileGrid2)}>
          {mobileGrid2 ? '☰ Ver 1 por linha' : '⊞ Ver 2 por linha'}
        </button>
      </div>

      {/* Status filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {[
          { v: '', l: 'Todos', cnt: blocks.filter(b => b.status !== 'sold' && b.status !== 'reserve').length },
          { v: 'available', l: 'Disponíveis', cnt: blocks.filter(b => b.status === 'available').length },
          { v: 'reserved', l: 'Reservados', cnt: blocks.filter(b => b.status === 'reserved').length },
        ].map(f => (
          <button key={f.v} className={'btn ' + (filterStatus === f.v ? 'bb' : 'bo') + ' bsm'} onClick={() => setFilterStatus(f.v)}>
            {f.l} ({f.cnt})
          </button>
        ))}
      </div>

      {/* Material/Quarry filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 220 }} value={filterMaterial} onChange={e => setFilterMaterial(e.target.value)}>
          <option value="">Todos os materiais</option>
          {allMaterials.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 220 }} value={filterQuarry} onChange={e => setFilterQuarry(e.target.value)}>
          <option value="">Todas as pedreiras</option>
          {quarries.map(q => <option key={q.id} value={q.id}>{q.name}</option>)}
        </select>
        {(filterMaterial || filterQuarry) && (
          <button className="btn bo bsm" onClick={() => { setFilterMaterial(''); setFilterQuarry('') }}>
            <Icon n="x" s={13} /> Limpar filtros
          </button>
        )}
      </div>

      {filteredBlocks.length === 0
        ? <div className="es"><div style={{ marginBottom: 12, opacity: .3 }}><Icon n="cube" s={48} /></div><div className="estit">Nenhum bloco encontrado</div></div>
        : <div style={gridStyle}>
          {filteredBlocks.map(b => {
            const q = quarries.find(x => x.id === b.quarry_id)
            const isSelected = selectedIds.includes(b.id)
            const isSelectable = (b.status === 'available' || b.status === 'reserved') && canSell
            return (
              <div key={b.id} className="card" style={{ position: 'relative', ...(isSelected && { boxShadow: '0 0 0 3px var(--sap5)', borderColor: 'var(--sap5)' }) }}>
                {isSelectable && (
                  <div onClick={() => toggleSelect(b.id)} style={{ position: 'absolute', top: 8, left: 8, zIndex: 2, width: 28, height: 28, background: isSelected ? 'var(--sap6)' : 'rgba(255,255,255,.9)', border: '2px solid ' + (isSelected ? 'var(--sap6)' : 'var(--fog)'), borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    {isSelected && <Icon n="check" s={14} c="#fff" />}
                  </div>
                )}
                {/* View detail icon */}
                <button onClick={() => setDetailBlock(b)} title="Ver detalhes" style={{ position: 'absolute', top: 8, right: 8, zIndex: 2, width: 28, height: 28, background: 'rgba(255,255,255,.95)', border: '1px solid var(--fog)', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  🔍
                </button>

                {b.photos && b.photos.length > 0 && b.photos[0]
                  ? <div style={{ position: 'relative' }}>
                      <img src={b.photos[0]} alt={b.code} style={{ width: '100%', height: mobileGrid2 ? 110 : 160, objectFit: 'cover', background: 'var(--haze)', cursor: 'pointer', display: 'block' }} onClick={() => setDetailBlock(b)} onError={(e) => { e.target.style.display = 'none' }} />
                      {b.photos.length > 1 && (
                        <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,.65)', color: '#fff', padding: '3px 9px', borderRadius: 12, fontSize: 11, fontWeight: 600, backdropFilter: 'blur(6px)', pointerEvents: 'none' }}>
                          📷 {b.photos.length}
                        </div>
                      )}
                    </div>
                  : <div style={{ height: mobileGrid2 ? 100 : 130, background: 'var(--haze)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon n="cube" s={32} c="var(--mist)" /></div>}
                <div className="cb">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 4 }}>
                    <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: mobileGrid2 ? 13 : 15 }}>{b.code}</div>
                    <span className="bdg" style={{ background: STATUS_CLR[b.status] + '20', color: STATUS_CLR[b.status] }}>{STATUS_LBL[b.status]}</span>
                  </div>
                  <div style={{ fontSize: mobileGrid2 ? 12 : 13, color: 'var(--mist)', marginBottom: 6 }}>{b.material}</div>
                  {b.status === 'reserved' && b.reserved_client && (
                    <div style={{ fontSize: 11, color: '#92400e', marginBottom: 6, background: '#fef3c7', padding: '3px 6px', borderRadius: 4, fontWeight: 600 }}>
                      🔒 Reservado para {b.reserved_client.name}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: 'var(--mist)', marginBottom: 10 }}>📍 {q?.name || '—'} · {(b.net_volume || 0).toFixed(2)} m³</div>
                  <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: mobileGrid2 ? 14 : 16, color: 'var(--sap7)', marginBottom: 10 }}>{money(b.total_value, b.currency)}</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {canEdit && <button className="btn bb bsm" onClick={() => openEdit(b)} title="Editar bloco"><Icon n="edit" s={13} c="#fff" /> Editar</button>}
                    {canSell && (b.status === 'available' || b.status === 'reserved') && (
                      <button className="btn bg bsm" onClick={() => { setSelectedIds([b.id]); setShowSaleModal(true) }} title="Vender este bloco" style={{ padding: '4px 8px' }}>
                        <Icon n="cart" s={13} c="#fff" />
                      </button>
                    )}
                    {canReserve && b.status === 'available' && (
                      <button className="btn bo bsm" onClick={() => setReserveTarget(b)} title="Reservar para cliente" style={{ color: '#d97706' }}>🔒</button>
                    )}
                    {canReserve && b.status === 'reserved' && (
                      <button className="btn bo bsm" onClick={() => unreserve(b)} title="Desfazer reserva">🔓</button>
                    )}
                    {canReserve && (b.status === 'available' || b.status === 'reserved') && (
                      <button className="btn bo bsm" onClick={() => moveToReserve(b)} title="Mover para Reserva Comercial" style={{ color: '#7c3aed' }}>📦</button>
                    )}
                    {canEdit && <button className="btn bo bsm" style={{ color: 'var(--err)' }} onClick={() => del(b)} title="Excluir"><Icon n="trash" s={13} c="var(--err)" /></button>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>}

      {/* Sale modal */}
      {showSaleModal && (
        <SaleModal
          profile={profile}
          selectedBlocks={selectedBlocks}
          clients={clients}
          payments={payments}
          onClose={() => setShowSaleModal(false)}
          onSuccess={async () => {
            setShowSaleModal(false)
            clearSelection()
            await onChange()
          }}
          toast={toast}
        />
      )}

      {/* Reserve modal */}
      {reserveTarget && (
        <div className="mo" onClick={() => { setReserveTarget(null); setReserveClientId('') }}>
          <div className="md" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="mhead">
              <div className="mtit">🔒 Reservar Bloco</div>
              <button className="btn bo bsm" onClick={() => { setReserveTarget(null); setReserveClientId('') }}><Icon n="x" s={14} /></button>
            </div>
            <div className="mbody">
              <div style={{ marginBottom: 14, padding: 12, background: 'var(--haze)', borderRadius: 8 }}>
                <strong style={{ color: 'var(--sap7)' }}>{reserveTarget.code}</strong>
                <span style={{ color: 'var(--mist)', marginLeft: 8 }}>· {reserveTarget.material}</span>
                <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--sap7)', marginTop: 4 }}>{money(reserveTarget.total_value, reserveTarget.currency)}</div>
              </div>
              <div className="fg">
                <label className="fl">Reservar para o cliente *</label>
                <select className="fc" value={reserveClientId} onChange={e => setReserveClientId(e.target.value)}>
                  <option value="">Selecione o cliente...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.country})</option>)}
                </select>
                <div style={{ fontSize: 11, color: 'var(--mist)', marginTop: 6, lineHeight: 1.5 }}>
                  ⚠️ Se o bloco estiver liberado no catálogo de outros clientes, ele será removido automaticamente.
                </div>
              </div>
            </div>
            <div className="mfoot">
              <button className="btn bo" onClick={() => { setReserveTarget(null); setReserveClientId('') }}>Cancelar</button>
              <button className="btn bb" onClick={confirmReserve}>Confirmar Reserva</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {detailBlock && (
        <BlockDetailModal block={detailBlock} quarry={quarries.find(q => q.id === detailBlock.quarry_id)} onClose={() => setDetailBlock(null)} />
      )}

      {/* Form modal */}
      {showForm && (
        <div className="mo" onClick={() => setShowForm(false)}>
          <div className="md" style={{ maxWidth: 760 }} onClick={e => e.stopPropagation()}>
            <div className="mhead"><div className="mtit">{editId ? 'Editar' : 'Novo'} Bloco</div><button className="btn bo bsm" onClick={() => setShowForm(false)}><Icon n="x" s={14} /></button></div>
            <div className="mbody">
              <div className="responsive-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="fg"><label className="fl">Código *</label><input className="fc" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="Ex: VMC-001" autoCapitalize="characters" style={{ textTransform: 'uppercase' }} /></div>
                <div className="fg"><label className="fl">Pedreira *</label>
                  <select className="fc" value={form.quarry_id} onChange={e => setForm({ ...form, quarry_id: e.target.value, material: '' })}>
                    <option value="">Selecione...</option>
                    {quarries.map(q => <option key={q.id} value={q.id}>{q.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="responsive-grid-3-mat" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
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
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--mist)', marginBottom: 10 }}>Medidas Brutas</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                  <input className="fc" type="number" step="0.01" placeholder="Comp." value={form.gross_l} onChange={e => setForm({ ...form, gross_l: e.target.value })} />
                  <input className="fc" type="number" step="0.01" placeholder="Alt." value={form.gross_h} onChange={e => setForm({ ...form, gross_h: e.target.value })} />
                  <input className="fc" type="number" step="0.01" placeholder="Larg." value={form.gross_w} onChange={e => setForm({ ...form, gross_w: e.target.value })} />
                  <div style={{ padding: '11px 14px', background: '#fff', borderRadius: 10, fontWeight: 700, textAlign: 'center' }}>{grossV.toFixed(2)} m³</div>
                </div>
              </div>

              <div style={{ background: '#dcfce7', padding: 14, borderRadius: 8, marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#15803d', marginBottom: 10 }}>Medidas Líquidas</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                  <input className="fc" type="number" step="0.01" placeholder="Comp." value={form.net_l} onChange={e => setForm({ ...form, net_l: e.target.value })} />
                  <input className="fc" type="number" step="0.01" placeholder="Alt." value={form.net_h} onChange={e => setForm({ ...form, net_h: e.target.value })} />
                  <input className="fc" type="number" step="0.01" placeholder="Larg." value={form.net_w} onChange={e => setForm({ ...form, net_w: e.target.value })} />
                  <div style={{ padding: '11px 14px', background: '#fff', borderRadius: 10, fontWeight: 700, textAlign: 'center', color: '#15803d' }}>{netV.toFixed(2)} m³</div>
                </div>
              </div>

              <div className="responsive-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
                <div className="fg"><label className="fl">Moeda</label>
                  <select className="fc" value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}>
                    <option value="USD">USD (US$)</option><option value="BRL">BRL (R$)</option>
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
// BLOCK DETAIL MODAL — visualizar ficha completa do bloco
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// PHOTO LIGHTBOX — fullscreen com zoom, pan, navegação
// ═══════════════════════════════════════════════════════════════
function PhotoLightbox({ photos, startIdx = 0, onClose }) {
  const [idx, setIdx] = useState(startIdx)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0, startOffsetX: 0, startOffsetY: 0 })
  const lastTapRef = useRef(0)
  const pinchRef = useRef(null)

  useEffect(() => {
    // Trava o scroll do body
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = originalOverflow }
  }, [])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') goPrev()
      else if (e.key === 'ArrowRight') goNext()
      else if (e.key === '+' || e.key === '=') setZoom(z => Math.min(z + 0.5, 5))
      else if (e.key === '-' || e.key === '_') setZoom(z => Math.max(z - 0.5, 1))
      else if (e.key === '0') resetZoom()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  })

  const resetZoom = () => { setZoom(1); setOffset({ x: 0, y: 0 }) }

  const goPrev = () => {
    setIdx(i => i === 0 ? photos.length - 1 : i - 1)
    resetZoom()
  }
  const goNext = () => {
    setIdx(i => i === photos.length - 1 ? 0 : i + 1)
    resetZoom()
  }

  // Zoom com scroll do mouse
  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.3 : 0.3
    setZoom(z => Math.max(1, Math.min(5, z + delta)))
  }

  // Mouse drag para mover quando zoom > 1
  const handleMouseDown = (e) => {
    if (zoom <= 1) return
    e.preventDefault()
    setIsDragging(true)
    dragStartRef.current = {
      x: e.clientX, y: e.clientY,
      startOffsetX: offset.x, startOffsetY: offset.y,
    }
  }
  const handleMouseMove = (e) => {
    if (!isDragging) return
    setOffset({
      x: dragStartRef.current.startOffsetX + (e.clientX - dragStartRef.current.x),
      y: dragStartRef.current.startOffsetY + (e.clientY - dragStartRef.current.y),
    })
  }
  const handleMouseUp = () => setIsDragging(false)

  // Touch (pinch + pan + duplo toque)
  const getDistance = (t1, t2) => {
    const dx = t1.clientX - t2.clientX
    const dy = t1.clientY - t2.clientY
    return Math.hypot(dx, dy)
  }

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      pinchRef.current = {
        startDist: getDistance(e.touches[0], e.touches[1]),
        startZoom: zoom,
      }
    } else if (e.touches.length === 1) {
      // Detecta double tap
      const now = Date.now()
      if (now - lastTapRef.current < 300) {
        // Duplo toque
        if (zoom > 1) resetZoom()
        else setZoom(2.5)
      }
      lastTapRef.current = now

      if (zoom > 1) {
        setIsDragging(true)
        dragStartRef.current = {
          x: e.touches[0].clientX, y: e.touches[0].clientY,
          startOffsetX: offset.x, startOffsetY: offset.y,
        }
      }
    }
  }

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && pinchRef.current) {
      const dist = getDistance(e.touches[0], e.touches[1])
      const newZoom = pinchRef.current.startZoom * (dist / pinchRef.current.startDist)
      setZoom(Math.max(1, Math.min(5, newZoom)))
    } else if (e.touches.length === 1 && isDragging && zoom > 1) {
      setOffset({
        x: dragStartRef.current.startOffsetX + (e.touches[0].clientX - dragStartRef.current.x),
        y: dragStartRef.current.startOffsetY + (e.touches[0].clientY - dragStartRef.current.y),
      })
    }
  }

  const handleTouchEnd = () => {
    pinchRef.current = null
    setIsDragging(false)
    if (zoom < 1) resetZoom()
  }

  // Backdrop click fecha (mas só se clicou no backdrop em si)
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  if (!photos || photos.length === 0) return null

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.96)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
      }}>

      {/* Botão fechar */}
      <button onClick={onClose} title="Fechar (Esc)" style={{
        position: 'fixed', top: 14, right: 14, zIndex: 10,
        background: 'rgba(255,255,255,.12)', color: '#fff', border: 'none',
        width: 44, height: 44, borderRadius: '50%', cursor: 'pointer',
        fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(8px)',
      }}>×</button>

      {/* Contador */}
      {photos.length > 1 && (
        <div style={{
          position: 'fixed', top: 16, left: 16, color: '#fff',
          background: 'rgba(0,0,0,.5)', padding: '6px 14px', borderRadius: 20,
          fontSize: 13, fontWeight: 600, zIndex: 10, backdropFilter: 'blur(8px)',
        }}>
          {idx + 1} / {photos.length}
        </div>
      )}

      {/* Setas navegação */}
      {photos.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); goPrev() }} title="Anterior (←)" style={{
            position: 'fixed', left: 14, top: '50%', transform: 'translateY(-50%)', zIndex: 10,
            background: 'rgba(255,255,255,.12)', color: '#fff', border: 'none',
            width: 50, height: 50, borderRadius: '50%', cursor: 'pointer',
            fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)',
          }}>‹</button>
          <button onClick={(e) => { e.stopPropagation(); goNext() }} title="Próxima (→)" style={{
            position: 'fixed', right: 14, top: '50%', transform: 'translateY(-50%)', zIndex: 10,
            background: 'rgba(255,255,255,.12)', color: '#fff', border: 'none',
            width: 50, height: 50, borderRadius: '50%', cursor: 'pointer',
            fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)',
          }}>›</button>
        </>
      )}

      {/* Controles de zoom (canto inferior) */}
      <div style={{
        position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 8, zIndex: 10, alignItems: 'center',
        background: 'rgba(0,0,0,.5)', padding: '8px 12px', borderRadius: 30,
        backdropFilter: 'blur(8px)',
      }}>
        <button onClick={(e) => { e.stopPropagation(); setZoom(z => Math.max(1, z - 0.5)) }} title="Diminuir (-)" style={{
          background: 'rgba(255,255,255,.15)', color: '#fff', border: 'none',
          width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', fontSize: 18, fontWeight: 700,
        }}>−</button>
        <span style={{ color: '#fff', fontSize: 13, fontWeight: 600, minWidth: 48, textAlign: 'center' }}>
          {Math.round(zoom * 100)}%
        </span>
        <button onClick={(e) => { e.stopPropagation(); setZoom(z => Math.min(5, z + 0.5)) }} title="Aumentar (+)" style={{
          background: 'rgba(255,255,255,.15)', color: '#fff', border: 'none',
          width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', fontSize: 18, fontWeight: 700,
        }}>+</button>
        {zoom > 1 && (
          <button onClick={(e) => { e.stopPropagation(); resetZoom() }} title="Restaurar (0)" style={{
            background: 'rgba(255,255,255,.15)', color: '#fff', border: 'none',
            padding: '6px 12px', borderRadius: 16, cursor: 'pointer', fontSize: 12, fontWeight: 600,
            marginLeft: 4,
          }}>Resetar</button>
        )}
      </div>

      {/* Imagem */}
      <img
        src={photos[idx]}
        alt=""
        draggable={false}
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          maxWidth: '95vw', maxHeight: '92vh',
          objectFit: 'contain',
          transform: `scale(${zoom}) translate(${offset.x / zoom}px, ${offset.y / zoom}px)`,
          transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          userSelect: 'none',
          willChange: 'transform',
        }}
      />

      {/* Dica de uso (mostra brevemente) */}
      {zoom === 1 && (
        <div style={{
          position: 'fixed', bottom: 70, left: '50%', transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,.6)', fontSize: 11, textAlign: 'center', zIndex: 5,
        }}>
          Scroll/pinça para zoom · Duplo clique amplia · Arraste para mover
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// PHOTO GALLERY — galeria grande com clique para fullscreen
// ═══════════════════════════════════════════════════════════════
function PhotoGallery({ photos, height = 420 }) {
  const [idx, setIdx] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  if (!photos || photos.length === 0) {
    return (
      <div style={{ height, background: 'var(--haze)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}>
        <Icon n="cube" s={56} c="var(--mist)" />
      </div>
    )
  }

  const goPrev = (e) => { e.stopPropagation(); setIdx(i => i === 0 ? photos.length - 1 : i - 1) }
  const goNext = (e) => { e.stopPropagation(); setIdx(i => i === photos.length - 1 ? 0 : i + 1) }

  return (
    <div>
      {/* Imagem principal — clique abre fullscreen */}
      <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', background: '#000' }}>
        <img
          src={photos[idx]}
          alt=""
          onClick={() => setLightboxOpen(true)}
          style={{ width: '100%', height, objectFit: 'contain', display: 'block', cursor: 'zoom-in' }}
        />

        {/* Ícone zoom no canto */}
        <div onClick={() => setLightboxOpen(true)} style={{
          position: 'absolute', top: 10, right: 10,
          background: 'rgba(0,0,0,.6)', color: '#fff',
          padding: '6px 12px', borderRadius: 18, fontSize: 12, fontWeight: 600,
          cursor: 'pointer', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', gap: 4,
        }}>
          🔍 Ampliar
        </div>

        {/* Contador */}
        {photos.length > 1 && (
          <div style={{
            position: 'absolute', bottom: 10, left: 10,
            background: 'rgba(0,0,0,.6)', color: '#fff',
            padding: '4px 12px', borderRadius: 18, fontSize: 12, fontWeight: 600,
            backdropFilter: 'blur(6px)',
          }}>
            📷 {idx + 1} / {photos.length}
          </div>
        )}

        {/* Setas navegação dentro da galeria */}
        {photos.length > 1 && (
          <>
            <button onClick={goPrev} title="Anterior" style={{
              position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,.55)', color: '#fff', border: 'none',
              width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', fontSize: 22,
              display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)',
            }}>‹</button>
            <button onClick={goNext} title="Próxima" style={{
              position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,.55)', color: '#fff', border: 'none',
              width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', fontSize: 22,
              display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)',
            }}>›</button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {photos.length > 1 && (
        <div style={{ display: 'flex', gap: 6, marginTop: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {photos.map((url, i) => (
            <img
              key={i}
              src={url}
              alt=""
              onClick={() => setIdx(i)}
              style={{
                width: 78, height: 78, objectFit: 'cover', borderRadius: 6, cursor: 'pointer',
                flexShrink: 0, border: '3px solid ' + (i === idx ? 'var(--sap6)' : 'transparent'),
                opacity: i === idx ? 1 : 0.7, transition: 'opacity 0.15s, border-color 0.15s',
              }}
            />
          ))}
        </div>
      )}

      {/* Lightbox fullscreen */}
      {lightboxOpen && (
        <PhotoLightbox photos={photos} startIdx={idx} onClose={() => setLightboxOpen(false)} />
      )}
    </div>
  )
}

function BlockDetailModal({ block, quarry, onClose }) {
  const photos = (block.photos || []).filter(Boolean)

  const STATUS_CLR = { produced: '#64748b', available: '#10b981', reserved: '#f59e0b', sold: '#ef4444' }
  const STATUS_LBL = { produced: 'Produzido', available: 'Disponível', reserved: 'Reservado', sold: 'Vendido' }

  return (
    <div className="mo" onClick={onClose}>
      <div className="md" style={{ maxWidth: 900 }} onClick={e => e.stopPropagation()}>
        <div className="mhead">
          <div>
            <div className="mtit">{block.code}</div>
            <div style={{ fontSize: 13, color: 'var(--mist)', marginTop: 4 }}>{block.material}</div>
          </div>
          <button className="btn bo bsm" onClick={onClose}><Icon n="x" s={14} /></button>
        </div>
        <div className="mbody">
          {/* Galeria grande com fullscreen + zoom */}
          <div style={{ marginBottom: 16 }}>
            <PhotoGallery photos={photos} height={460} />
          </div>

          {/* Status row */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <span className="bdg" style={{ background: STATUS_CLR[block.status] + '20', color: STATUS_CLR[block.status], padding: '6px 12px', fontSize: 13 }}>
              {STATUS_LBL[block.status]}
            </span>
            <span className="bdg" style={{ background: 'var(--sap1)', color: 'var(--sap7)', padding: '6px 12px', fontSize: 13 }}>
              Classificação {block.classification}
            </span>
            {block.status === 'reserved' && block.reserved_client && (
              <span className="bdg" style={{ background: '#fef3c7', color: '#92400e', padding: '6px 12px', fontSize: 13 }}>
                🔒 Reservado para {block.reserved_client.name}
              </span>
            )}
          </div>

          {/* Info grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10, marginBottom: 16 }}>
            <div className="sc" style={{ padding: 12 }}>
              <div className="slbl2">Pedreira</div>
              <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 14 }}>{quarry?.name || '—'}</div>
              {quarry?.location && <div style={{ fontSize: 11, color: 'var(--mist)', marginTop: 2 }}>{quarry.location}</div>}
            </div>
            <div className="sc" style={{ padding: 12, borderTopColor: 'var(--ok)' }}>
              <div className="slbl2">Volume Líquido</div>
              <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 16 }}>{(block.net_volume || 0).toFixed(2)} m³</div>
            </div>
            <div className="sc" style={{ padding: 12, borderTopColor: 'var(--warn)' }}>
              <div className="slbl2">Data de Produção</div>
              <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 14 }}>{fmtDate(block.prod_date)}</div>
            </div>
            <div className="sc" style={{ padding: 12, borderTopColor: 'var(--sap5)' }}>
              <div className="slbl2">Preço m³</div>
              <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 14 }}>{money(block.price_m3, block.currency)}</div>
            </div>
          </div>

          {/* Measurements */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            <div style={{ background: 'var(--haze)', padding: 12, borderRadius: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--mist)', marginBottom: 6 }}>Medidas Brutas</div>
              <div style={{ fontSize: 13 }}>C: {block.gross_l || '—'} m</div>
              <div style={{ fontSize: 13 }}>A: {block.gross_h || '—'} m</div>
              <div style={{ fontSize: 13 }}>L: {block.gross_w || '—'} m</div>
              <div style={{ fontSize: 13, marginTop: 4, fontWeight: 700 }}>Vol: {(block.gross_volume || 0).toFixed(2)} m³</div>
            </div>
            <div style={{ background: '#dcfce7', padding: 12, borderRadius: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#15803d', marginBottom: 6 }}>Medidas Líquidas</div>
              <div style={{ fontSize: 13 }}>C: {block.net_l || '—'} m</div>
              <div style={{ fontSize: 13 }}>A: {block.net_h || '—'} m</div>
              <div style={{ fontSize: 13 }}>L: {block.net_w || '—'} m</div>
              <div style={{ fontSize: 13, marginTop: 4, fontWeight: 700, color: '#15803d' }}>Vol: {(block.net_volume || 0).toFixed(2)} m³</div>
            </div>
          </div>

          {/* Total value */}
          <div style={{ background: 'var(--sap1)', padding: 18, borderRadius: 10, textAlign: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--sap7)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Valor Total</div>
            <div style={{ fontFamily: 'Sora,sans-serif', fontSize: 32, fontWeight: 800, color: 'var(--sap7)' }}>{money(block.total_value, block.currency)}</div>
          </div>

          {block.sys_code && (
            <div style={{ fontSize: 11, color: 'var(--mist)', textAlign: 'center', marginBottom: 8 }}>
              Código do sistema: <code style={{ background: 'var(--haze)', padding: '2px 6px', borderRadius: 3 }}>{block.sys_code}</code>
            </div>
          )}

          {block.notes && (
            <div style={{ background: 'var(--haze)', padding: 12, borderRadius: 8, fontSize: 13 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--mist)', marginBottom: 4 }}>Observações</div>
              {block.notes}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


function SaleModal({ profile, selectedBlocks, clients, payments, onClose, onSuccess, toast }) {
  // Detecta cliente reservado dos blocos selecionados
  const reservedClientId = (() => {
    const reserved = selectedBlocks.find(b => b.reserved_for)
    return reserved?.reserved_for || ''
  })()

  const [clientId, setClientId] = useState(reservedClientId)
  const [paymentId, setPaymentId] = useState('')
  const [dollarRate, setDollarRate] = useState('')
  const [obs, setObs] = useState('')
  const [loadingRate, setLoadingRate] = useState(false)
  const [saving, setSaving] = useState(false)

  // Calculate totals
  const hasUSD = selectedBlocks.some(b => b.currency === 'USD')
  const totalBRL = selectedBlocks
    .filter(b => b.currency === 'BRL')
    .reduce((a, b) => a + (Number(b.total_value) || 0), 0)
  const totalUSDBlocks = selectedBlocks
    .filter(b => b.currency === 'USD')
    .reduce((a, b) => a + (Number(b.total_value) || 0), 0)
  const usdAsBRL = dollarRate ? totalUSDBlocks * Number(dollarRate) : 0
  const grandTotalBRL = totalBRL + usdAsBRL

  // Fetch dollar quote
  const fetchDollar = async () => {
    setLoadingRate(true)
    const sources = [
      { url: 'https://api.allorigins.win/get?url=' + encodeURIComponent('https://economia.awesomeapi.com.br/json/last/USD-BRL'),
        parse: d => JSON.parse(d.contents).USDBRL.bid },
      { url: 'https://api.frankfurter.dev/v2/latest?base=USD&symbols=BRL',
        parse: d => d.rates.BRL },
    ]
    for (const { url, parse } of sources) {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
        if (!res.ok) continue
        const data = await res.json()
        const val = parse(data)
        if (val && !isNaN(parseFloat(val))) {
          setDollarRate(parseFloat(val).toFixed(4))
          toast(`Cotação: R$ ${parseFloat(val).toFixed(2)}`, 'ok')
          setLoadingRate(false)
          return
        }
      } catch { continue }
    }
    toast('Erro ao buscar cotação. Informe manualmente.', 'err')
    setLoadingRate(false)
  }

  const save = async () => {
    if (!clientId) { toast('Selecione um cliente.', 'err'); return }
    if (hasUSD && !dollarRate) { toast('Informe a cotação do dólar.', 'err'); return }
    setSaving(true)
    try {
      const newSale = await api.createSale(profile, {
        client_id: clientId,
        payment_method_id: paymentId || null,
        dollar_rate: dollarRate ? Number(dollarRate) : null,
        total_brl: grandTotalBRL,
        total_usd: totalUSDBlocks,
        obs: obs.trim() || null,
      }, selectedBlocks.map(b => b.id))

      toast('Venda registrada com sucesso!', 'ok')

      // Pergunta se quer imprimir o romaneio
      if (window.confirm('Venda registrada! Deseja emitir o romaneio agora?')) {
        // Monta o objeto sale com os dados necessários para o romaneio
        const client = clients.find(c => c.id === clientId)
        const payment = payments.find(p => p.id === paymentId)
        const saleForRomaneio = {
          ...newSale,
          client: client ? { id: client.id, name: client.name, country: client.country } : null,
          payment_method: payment ? { id: payment.id, name: payment.name } : null,
          blocks: selectedBlocks,
        }
        await generateRomaneio(saleForRomaneio, profile)
      }

      onSuccess()
    } catch (e) {
      console.error('Sale error:', e)
      toast('Erro: ' + e.message, 'err')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mo" onClick={onClose}>
      <div className="md" style={{ maxWidth: 720 }} onClick={e => e.stopPropagation()}>
        <div className="mhead">
          <div className="mtit">Registrar Venda</div>
          <button className="btn bo bsm" onClick={onClose}><Icon n="x" s={14} /></button>
        </div>
        <div className="mbody">
          {/* Selected blocks summary */}
          <div style={{ background: 'var(--haze)', padding: 14, borderRadius: 8, marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--mist)', marginBottom: 10 }}>
              {selectedBlocks.length} bloco(s) selecionado(s)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {selectedBlocks.map(b => (
                <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                  <span><strong>{b.code}</strong> — {b.material} ({(b.net_volume || 0).toFixed(2)} m³)</span>
                  <span style={{ fontWeight: 700, color: 'var(--sap7)' }}>{money(b.total_value, b.currency)}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="fg">
              <label className="fl">Cliente *</label>
              <select className="fc" value={clientId} onChange={e => setClientId(e.target.value)} style={reservedClientId ? { borderColor: '#fbbf24', background: '#fffbeb' } : {}}>
                <option value="">Selecione...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {reservedClientId && clientId === reservedClientId && (
                <div style={{ fontSize: 11, color: '#92400e', marginTop: 4 }}>
                  🔒 Cliente pré-selecionado pela reserva do bloco
                </div>
              )}
            </div>
            <div className="fg">
              <label className="fl">Forma de Pagamento</label>
              <select className="fc" value={paymentId} onChange={e => setPaymentId(e.target.value)}>
                <option value="">Sem forma definida</option>
                {payments.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          {hasUSD && (
            <div className="fg">
              <label className="fl">Cotação do Dólar (R$ por US$) *</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="fc" type="number" step="0.0001" value={dollarRate} onChange={e => setDollarRate(e.target.value)} placeholder="Ex: 5.20" />
                <button className="btn bo bsm" onClick={fetchDollar} disabled={loadingRate}>
                  {loadingRate ? <span className="spinner"></span> : <Icon n="trend" s={14} />} Buscar
                </button>
              </div>
            </div>
          )}

          {/* Totals */}
          <div style={{ background: 'var(--sap1)', padding: 16, borderRadius: 10, marginBottom: 16 }}>
            {totalBRL > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6 }}>
                <span>Total R$:</span><strong>{money(totalBRL, 'BRL')}</strong>
              </div>
            )}
            {totalUSDBlocks > 0 && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6 }}>
                  <span>Total US$:</span><strong>{money(totalUSDBlocks, 'USD')}</strong>
                </div>
                {dollarRate && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--mist)', marginBottom: 6 }}>
                    <span>US$ convertido (R$):</span><span>{money(usdAsBRL, 'BRL')}</span>
                  </div>
                )}
              </>
            )}
            <div style={{ borderTop: '1px solid var(--sap2)', paddingTop: 8, marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--sap7)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Total Geral (R$):</span>
              <span style={{ fontFamily: 'Sora,sans-serif', fontSize: 22, fontWeight: 800, color: 'var(--sap7)' }}>{money(grandTotalBRL, 'BRL')}</span>
            </div>
          </div>

          <div className="fg">
            <label className="fl">Observações</label>
            <textarea className="fc" value={obs} onChange={e => setObs(e.target.value)} placeholder="Condições, prazo de entrega, etc." />
          </div>
        </div>
        <div className="mfoot">
          <button className="btn bo" onClick={onClose}>Cancelar</button>
          <button className="btn bg" onClick={save} disabled={saving}>
            {saving ? <><span className="spinner"></span> Registrando...</> : <><Icon n="check" s={14} c="#fff" /> Confirmar Venda</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// SALES HISTORY PAGE
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// ROMANEIO — gera o HTML imprimível e abre janela de impressão
// ═══════════════════════════════════════════════════════════════
async function generateRomaneio(sale, profile) {
  // Busca dados do dono da empresa (nome + logo)
  let owner = null
  try {
    owner = await api.getCompanyOwnerProfile(sale.company_id)
  } catch (e) { console.warn('Não foi possível carregar dono:', e) }

  const companyName = (owner?.company_name || owner?.name || 'EMPRESA').toUpperCase()
  const logoUrl = owner?.logo_url || ''

  const dt = new Date(sale.created_at)
  const dataFmt = `${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}`

  const blocks = sale.blocks || []
  const totalM3 = blocks.reduce((a, b) => a + (Number(b.net_volume) || 0), 0)
  const totalBRL = Number(sale.total_brl) || 0
  const totalUSD = Number(sale.total_usd) || 0
  const dollarRate = Number(sale.dollar_rate) || 0

  const fmtNum = (n, d = 2) => Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d })
  const fmtBRL = (n) => 'R$ ' + Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  // Calcula linhas vazias até completar 10 linhas (estética igual ao modelo)
  const numEmpty = Math.max(0, 10 - blocks.length)

  const rowsHTML = blocks.map(b => {
    // Calcula valor m³ em USD e BRL para preencher ambas colunas
    let priceUSD = 0, priceBRL = 0
    if (b.currency === 'USD') {
      priceUSD = Number(b.price_m3) || 0
      priceBRL = dollarRate > 0 ? priceUSD * dollarRate : 0
    } else {
      priceBRL = Number(b.price_m3) || 0
      priceUSD = dollarRate > 0 ? priceBRL / dollarRate : 0
    }
    // Total: usa o valor da venda na moeda original
    let totalCell = ''
    if (b.currency === 'BRL') {
      totalCell = fmtBRL(b.total_value)
    } else if (b.currency === 'USD') {
      totalCell = 'US$ ' + fmtNum(b.total_value)
    }
    return `
    <tr>
      <td class="num">${b.code || ''}</td>
      <td class="ctr">${b.classification || ''}</td>
      <td class="num">${fmtNum(b.net_l)}</td>
      <td class="num">${fmtNum(b.net_h)}</td>
      <td class="num">${fmtNum(b.net_w)}</td>
      <td class="num">${fmtNum(b.net_volume)}</td>
      <td class="num">${priceUSD > 0 ? fmtNum(priceUSD) : ''}</td>
      <td class="num">${priceBRL > 0 ? fmtBRL(priceBRL) : ''}</td>
      <td class="num">${totalCell}</td>
      <td class="ctr">${b.classification || ''}</td>
    </tr>
  `}).join('')

  const emptyRows = Array(numEmpty).fill(`
    <tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
  `).join('')

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Romaneio - ${sale.client?.name || ''}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; padding: 20px; color: #000; font-size: 12px; }
  .topo { background: #b8b8b8; padding: 8px 12px; display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
  .topo img { max-height: 48px; max-width: 100px; object-fit: contain; }
  .topo h1 { font-size: 18px; letter-spacing: 1px; }
  .cab { display: grid; grid-template-columns: auto 1fr; gap: 0; margin-bottom: 14px; width: 60%; }
  .cab .lbl { background: #fff; border: 1px solid #888; padding: 4px 10px; font-weight: bold; }
  .cab .val { border: 1px solid #888; border-left: none; padding: 4px 10px; }
  .dolar-row { display: grid; grid-template-columns: auto 1fr; gap: 0; margin-bottom: 14px; width: 30%; }
  .dolar-row .lbl { background: #fff; border: 1px solid #888; padding: 4px 10px; font-weight: bold; }
  .dolar-row .val { border: 1px solid #888; border-left: none; padding: 4px 10px; text-align: center; font-weight: bold; }
  .titulo { background: #c5d4eb; padding: 6px; text-align: center; font-weight: bold; font-size: 14px; margin-bottom: 0; border: 1px solid #888; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #888; padding: 4px 6px; font-size: 11px; }
  th { background: #e5e5e5; font-weight: bold; text-align: center; }
  .group-h { background: #fff; text-align: center; font-weight: bold; }
  td.num { text-align: right; }
  td.ctr { text-align: center; }
  .totais { background: #d4d4d4; }
  .totais td { font-weight: bold; }
  .obs-area { margin-top: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
  .obs-box { }
  .obs-label { font-weight: bold; margin-bottom: 6px; }
  .obs-content { background: #e8f0fa; min-height: 70px; padding: 8px; border-bottom: 1px solid #000; }
  .sig-line { border-top: 1px solid #000; padding-top: 6px; text-align: center; font-weight: bold; margin-top: 60px; }
  @media print { body { padding: 10mm; } }
</style>
</head>
<body>

<div class="topo">
  ${logoUrl ? `<img src="${logoUrl}" alt="logo">` : ''}
  <h1>${companyName}</h1>
</div>

<div class="cab">
  <div class="lbl">Cliente:</div><div class="val">${(sale.client?.name || '').toUpperCase()}</div>
  <div class="lbl">Data:</div><div class="val">${dataFmt}</div>
</div>

${dollarRate > 0 ? `
<div class="dolar-row">
  <div class="lbl">Dolar:</div><div class="val">${fmtNum(dollarRate)}</div>
</div>
` : ''}

<div class="titulo">Romaneio de Venda</div>

<table>
  <thead>
    <tr>
      <th rowspan="2">Código</th>
      <th rowspan="2">Tipo</th>
      <th colspan="4" class="group-h">Medidas Líquidas</th>
      <th rowspan="2">Vr M3 U$:</th>
      <th rowspan="2">Valor M3 R$:</th>
      <th rowspan="2">Total:</th>
      <th rowspan="2">Class.:</th>
    </tr>
    <tr>
      <th>Comp.:</th>
      <th>Alt.:</th>
      <th>Larg.:</th>
      <th>Total:</th>
    </tr>
  </thead>
  <tbody>
    ${rowsHTML}
    ${emptyRows}
    <tr class="totais">
      <td colspan="2"></td>
      <td colspan="3" style="text-align:right;">Total M3 Líquido:</td>
      <td class="num">${fmtNum(totalM3)}</td>
      <td></td>
      <td style="text-align:right;">Total:</td>
      <td class="num">${totalBRL > 0 ? fmtBRL(totalBRL) : (totalUSD > 0 ? 'US$ ' + fmtNum(totalUSD) : '')}</td>
      <td></td>
    </tr>
  </tbody>
</table>

<div class="obs-area">
  <div class="obs-box">
    <div class="obs-label">Observações:</div>
    <div class="obs-content">${[
      sale.payment_method?.name ? 'Forma de pagamento: ' + sale.payment_method.name : '',
      sale.obs || ''
    ].filter(Boolean).join('<br>')}</div>
  </div>
  <div class="obs-box">
    <div class="sig-line">${companyName}</div>
  </div>
</div>

<script>
  window.onload = function() {
    setTimeout(function(){ window.print(); }, 500);
  };
</script>
</body>
</html>`

  // Abre nova janela com o HTML
  const win = window.open('', '_blank')
  if (!win) {
    alert('Bloqueador de pop-up impediu a abertura do romaneio. Permita pop-ups deste site.')
    return
  }
  win.document.write(html)
  win.document.close()
}


// ═══════════════════════════════════════════════════════════════
// SALES HISTORY PAGE
// ═══════════════════════════════════════════════════════════════
function SalesPage({ profile, sales, blocks, quarries, onChange, toast }) {
  const [filterPeriod, setFilterPeriod] = useState('month')
  const [dtInicio, setDtInicio] = useState('')
  const [dtFim, setDtFim] = useState('')
  const [filterClient, setFilterClient] = useState('')
  const [filterQuarry, setFilterQuarry] = useState('')
  const [filterMaterial, setFilterMaterial] = useState('')
  const [filterBlock, setFilterBlock] = useState('')
  const [detailSale, setDetailSale] = useState(null)
  const [detailBlock, setDetailBlock] = useState(null)

  const today = new Date().toISOString().slice(0, 10)

  // Materiais únicos das vendas
  const salesMaterials = [...new Set(
    sales.flatMap(s => (s.blocks || []).map(b => b.material).filter(Boolean))
  )].sort()

  // Filtered sales
  const filtered = sales.filter(s => {
    const d = new Date(s.created_at)
    if (filterPeriod !== 'all' && filterPeriod !== 'custom') {
      const now = new Date()
      if (filterPeriod === 'month') {
        if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return false
      } else if (filterPeriod === 'last_month') {
        const last = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        if (d.getMonth() !== last.getMonth() || d.getFullYear() !== last.getFullYear()) return false
      } else if (filterPeriod === 'year') {
        if (d.getFullYear() !== now.getFullYear()) return false
      }
    }
    if (filterPeriod === 'custom') {
      if (dtInicio && d < new Date(dtInicio + 'T00:00:00')) return false
      if (dtFim && d > new Date(dtFim + 'T23:59:59')) return false
    }
    if (filterClient && s.client?.name?.toLowerCase().indexOf(filterClient.toLowerCase()) === -1) return false
    if (filterQuarry) {
      const hasFromQuarry = (s.blocks || []).some(b => b.quarry_id === filterQuarry)
      if (!hasFromQuarry) return false
    }
    if (filterMaterial) {
      const hasMaterial = (s.blocks || []).some(b => b.material === filterMaterial)
      if (!hasMaterial) return false
    }
    if (filterBlock) {
      const q = filterBlock.toLowerCase()
      const hasBlock = (s.blocks || []).some(b => (b.code || '').toLowerCase().includes(q))
      if (!hasBlock) return false
    }
    return true
  })

  const totalBRL = filtered.reduce((a, s) => a + (Number(s.total_brl) || 0), 0)
  const totalUSD = filtered.reduce((a, s) => a + (Number(s.total_usd) || 0), 0)
  const totalBlocks = filtered.reduce((a, s) => a + (s.block_ids?.length || 0), 0)

  const reverse = async (sale) => {
    if (!window.confirm(`Estornar a venda #${String(sale.id).slice(0, 8)}? Os blocos voltarão a ficar disponíveis.`)) return
    try {
      await api.reverseSale(sale.id, sale.block_ids || [])
      await onChange()
      toast('Venda estornada.', 'ok')
    } catch (e) {
      toast('Erro ao estornar: ' + e.message, 'err')
    }
  }

  return (
    <div>
      <div className="ph">
        <div className="ptit">Histórico de Vendas</div>
        <div className="psub">{filtered.length} venda(s)</div>
      </div>

      {/* Stats */}
      <div className="sg">
        <div className="sc">
          <div className="sico" style={{ background: '#dcfce7' }}><Icon n="trend" s={20} c="#059669" /></div>
          <div className="sval" style={{ fontSize: 22 }}>{money(totalBRL, 'BRL')}</div>
          <div className="slbl2">Total em R$</div>
        </div>
        <div className="sc" style={{ borderTopColor: '#3b82f6' }}>
          <div className="sico" style={{ background: '#dbeafe' }}><Icon n="dolar" s={20} c="#2563eb" /></div>
          <div className="sval" style={{ fontSize: 22 }}>{money(totalUSD, 'USD')}</div>
          <div className="slbl2">Total em US$</div>
        </div>
        <div className="sc" style={{ borderTopColor: 'var(--warn)' }}>
          <div className="sico" style={{ background: '#fef3c7' }}><Icon n="cube" s={20} c="#d97706" /></div>
          <div className="sval">{totalBlocks}</div>
          <div className="slbl2">Blocos Vendidos</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="cb" style={{ padding: '14px 18px' }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 180 }} value={filterPeriod} onChange={e => setFilterPeriod(e.target.value)}>
              <option value="month">Mês atual</option>
              <option value="last_month">Mês anterior</option>
              <option value="year">Ano atual</option>
              <option value="all">Todos os períodos</option>
              <option value="custom">Período personalizado</option>
            </select>
            {filterPeriod === 'custom' && (
              <>
                <input type="date" className="fc" style={{ fontSize: 13, padding: '7px 10px' }} value={dtInicio} max={dtFim || today} onChange={e => setDtInicio(e.target.value)} placeholder="De" />
                <input type="date" className="fc" style={{ fontSize: 13, padding: '7px 10px' }} value={dtFim} min={dtInicio} max={today} onChange={e => setDtFim(e.target.value)} placeholder="Até" />
              </>
            )}
            <input className="fc" style={{ fontSize: 13, padding: '7px 12px', flex: '1 1 150px', minWidth: 150 }} placeholder="Buscar cliente..." value={filterClient} onChange={e => setFilterClient(e.target.value)} />
            <input className="fc" style={{ fontSize: 13, padding: '7px 12px', flex: '0 1 150px', minWidth: 130, textTransform: 'uppercase' }} placeholder="Nº do bloco..." value={filterBlock} onChange={e => setFilterBlock(e.target.value.toUpperCase())} />
            <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 180 }} value={filterQuarry} onChange={e => setFilterQuarry(e.target.value)}>
              <option value="">Todas as pedreiras</option>
              {(quarries || []).map(q => <option key={q.id} value={q.id}>{q.name}</option>)}
            </select>
            <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 180 }} value={filterMaterial} onChange={e => setFilterMaterial(e.target.value)}>
              <option value="">Todos os materiais</option>
              {salesMaterials.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            {(filterPeriod !== 'month' || dtInicio || dtFim || filterClient || filterBlock || filterQuarry || filterMaterial) && (
              <button className="btn bo bsm" onClick={() => { setFilterPeriod('month'); setDtInicio(''); setDtFim(''); setFilterClient(''); setFilterBlock(''); setFilterQuarry(''); setFilterMaterial('') }}>
                <Icon n="x" s={13} /> Limpar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sales list */}
      {filtered.length === 0
        ? <div className="es"><div style={{ marginBottom: 12, opacity: .3 }}><Icon n="cart" s={48} /></div><div className="estit">Nenhuma venda encontrada</div></div>
        : <div className="card"><div className="tw"><table>
          <thead><tr>
            <th>Data</th>
            <th>Cliente</th>
            <th>Blocos</th>
            {profile.role !== 'seller' && <th>Vendedor</th>}
            <th>Total R$</th>
            <th>Total US$</th>
            <th></th>
          </tr></thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} style={{ cursor: 'pointer' }} onClick={() => setDetailSale(s)}>
                <td style={{ fontSize: 13, color: 'var(--mist)' }}>{fmtDate(s.created_at)}</td>
                <td style={{ fontWeight: 600 }}>{s.client?.name || '—'}</td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {(s.blocks || []).map(b => (
                      <span key={b.id} style={{ fontSize: 12 }}>
                        <strong style={{ color: 'var(--sap7)' }}>{b.code}</strong>
                        <span style={{ color: 'var(--mist)', marginLeft: 4 }}>· {b.material}</span>
                      </span>
                    ))}
                  </div>
                </td>
                {profile.role !== 'seller' && <td style={{ fontSize: 13 }}>{s.seller?.name || '—'}</td>}
                <td style={{ fontWeight: 700, color: '#059669' }}>{s.total_brl > 0 ? money(s.total_brl, 'BRL') : '—'}</td>
                <td style={{ fontWeight: 700, color: 'var(--sap7)' }}>{s.total_usd > 0 ? money(s.total_usd, 'USD') : '—'}</td>
                <td onClick={e => e.stopPropagation()}>
                  {(profile.role === 'owner' || profile.role === 'seller') && (
                    <button className="btn bo bsm" style={{ color: 'var(--err)' }} onClick={() => reverse(s)} title="Estornar">
                      <Icon n="trash" s={13} c="var(--err)" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table></div></div>}

      {detailSale && (
        <div className="mo" onClick={() => setDetailSale(null)}>
          <div className="md" style={{ maxWidth: 680 }} onClick={e => e.stopPropagation()}>
            <div className="mhead">
              <div>
                <div className="mtit">Detalhes da Venda</div>
                <div style={{ fontSize: 13, color: 'var(--mist)', marginTop: 4 }}>{fmtDate(detailSale.created_at)}</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn bb bsm" onClick={() => generateRomaneio(detailSale, profile)} title="Imprimir Romaneio">
                  🖨️ Romaneio
                </button>
                <button className="btn bo bsm" onClick={() => setDetailSale(null)}><Icon n="x" s={14} /></button>
              </div>
            </div>
            <div className="mbody">
              {/* Cliente / Vendedor / Pagamento */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10, marginBottom: 16 }}>
                <div className="sc" style={{ padding: 12 }}>
                  <div className="slbl2">Cliente</div>
                  <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 14 }}>{detailSale.client?.name || '—'}</div>
                  {detailSale.client?.country && <div style={{ fontSize: 11, color: 'var(--mist)' }}>{detailSale.client.country}</div>}
                </div>
                <div className="sc" style={{ padding: 12, borderTopColor: 'var(--sap5)' }}>
                  <div className="slbl2">Vendedor</div>
                  <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 14 }}>{detailSale.seller?.name || '—'}</div>
                </div>
                {detailSale.payment_method && (
                  <div className="sc" style={{ padding: 12, borderTopColor: 'var(--ok)' }}>
                    <div className="slbl2">Pagamento</div>
                    <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 14 }}>{detailSale.payment_method.name}</div>
                  </div>
                )}
                {detailSale.dollar_rate && (
                  <div className="sc" style={{ padding: 12, borderTopColor: 'var(--warn)' }}>
                    <div className="slbl2">Cotação USD</div>
                    <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 14 }}>R$ {Number(detailSale.dollar_rate).toFixed(4)}</div>
                  </div>
                )}
              </div>

              {/* Blocos vendidos */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--mist)', marginBottom: 8 }}>
                  Blocos vendidos ({(detailSale.blocks || []).length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(detailSale.blocks || []).map(b => (
                    <div key={b.id} onClick={() => setDetailBlock(b)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, background: 'var(--haze)', borderRadius: 8, cursor: 'pointer', transition: 'background .15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--sap1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'var(--haze)'}>
                      {b.photos && b.photos[0] ? (
                        <img src={b.photos[0]} alt="" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6 }} />
                      ) : (
                        <div style={{ width: 60, height: 60, background: '#fff', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon n="cube" s={24} c="var(--mist)" />
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: 'var(--sap7)' }}>{b.code}</div>
                        <div style={{ fontSize: 12, color: 'var(--mist)' }}>{b.material} · Classif. {b.classification} · {(b.net_volume || 0).toFixed(2)} m³</div>
                        <div style={{ fontSize: 11, color: 'var(--sap6)', marginTop: 2 }}>👁 Clique para ver detalhes</div>
                      </div>
                      <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, color: 'var(--sap7)' }}>
                        {money(b.total_value, b.currency)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totais */}
              <div style={{ background: 'var(--sap1)', padding: 16, borderRadius: 10, marginBottom: 14 }}>
                {detailSale.total_brl > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6 }}>
                    <span>Total R$:</span>
                    <strong style={{ fontFamily: 'Sora,sans-serif', fontSize: 18 }}>{money(detailSale.total_brl, 'BRL')}</strong>
                  </div>
                )}
                {detailSale.total_usd > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                    <span>Total US$:</span>
                    <strong style={{ fontFamily: 'Sora,sans-serif', fontSize: 18 }}>{money(detailSale.total_usd, 'USD')}</strong>
                  </div>
                )}
              </div>

              {detailSale.obs && (
                <div style={{ background: 'var(--haze)', padding: 12, borderRadius: 8, fontSize: 13 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--mist)', marginBottom: 4 }}>Observações</div>
                  {detailSale.obs}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Block detail modal (from inside sale detail) */}
      {detailBlock && (
        <BlockDetailModal
          block={detailBlock}
          quarry={(quarries || []).find(q => q.id === detailBlock.quarry_id)}
          onClose={() => setDetailBlock(null)}
        />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// TEAM PAGE — gerenciar encarregados, vendedores e clientes
// ═══════════════════════════════════════════════════════════════
function TeamPage({ profile, team, onChange, toast }) {
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', phone: '', role: '', commission: false, commission_pct: '' })
  const [showNew, setShowNew] = useState(false)
  const [newForm, setNewForm] = useState({ name: '', email: '', password: '', phone: '', role: 'seller', commission: false, commission_pct: '' })
  const [saving, setSaving] = useState(false)

  const sellers = team.filter(t => t.role === 'seller')
  const foremen = team.filter(t => t.role === 'foreman')
  const clientUsers = team.filter(t => t.role === 'client')

  const RL2 = { seller: 'Vendedor', foreman: 'Encarregado', client: 'Cliente' }

  const openEdit = (u) => {
    setEditForm({
      name: u.name || '',
      phone: u.phone || '',
      role: u.role || 'seller',
      commission: u.commission || false,
      commission_pct: u.commission_pct || '',
    })
    setEditingId(u.id)
  }

  const openNew = () => {
    setNewForm({ name: '', email: '', password: '', phone: '', role: 'seller', commission: false, commission_pct: '' })
    setShowNew(true)
  }

  const saveNew = async () => {
    if (!newForm.name.trim()) { toast('Nome obrigatório.', 'err'); return }
    if (!newForm.email.trim()) { toast('E-mail obrigatório.', 'err'); return }
    if (!newForm.password || newForm.password.length < 6) { toast('Senha deve ter ao menos 6 caracteres.', 'err'); return }
    setSaving(true)
    try {
      await api.createTeamMember(profile, newForm.email.trim(), newForm.password, {
        name: newForm.name.trim(),
        phone: newForm.phone.trim() || null,
        role: newForm.role,
        commission: newForm.commission,
        commission_pct: newForm.commission_pct,
      })
      await onChange()
      toast('Membro cadastrado!', 'ok')
      setShowNew(false)
    } catch (e) {
      toast('Erro: ' + e.message, 'err')
    } finally { setSaving(false) }
  }

  const save = async () => {
    if (!editForm.name.trim()) { toast('Nome obrigatório.', 'err'); return }
    setSaving(true)
    try {
      await api.updateTeamMember(editingId, {
        name: editForm.name.trim(),
        phone: editForm.phone.trim() || null,
        role: editForm.role,
        commission: editForm.commission,
        commission_pct: editForm.commission ? parseFloat(editForm.commission_pct) || 0 : 0,
        avatar: editForm.name.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase(),
      })
      await onChange()
      toast('Atualizado!', 'ok')
      setEditingId(null)
    } catch (e) {
      toast('Erro: ' + e.message, 'err')
    } finally { setSaving(false) }
  }

  return (
    <div>
      <div className="ph">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="ptit">Equipe</div>
            <div className="psub">{team.length} membro(s) · {foremen.length} encarregado(s) · {sellers.length} vendedor(es) · {clientUsers.length} cliente(s)</div>
          </div>
          <button className="btn bb" onClick={openNew}>
            <Icon n="plus" s={16} c="#fff" /> Novo Membro
          </button>
        </div>
      </div>

      {team.length === 0 ? (
        <div className="es">
          <div style={{ marginBottom: 12, opacity: .3 }}><Icon n="user" s={48} /></div>
          <div className="estit">Nenhum membro cadastrado</div>
          <div style={{ fontSize: 13, color: 'var(--mist)', marginTop: 8 }}>Clique em "Novo Membro" para adicionar.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {team.map(u => (
            <div key={u.id} className="card">
              <div className="cb">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                  <div className="av" style={{ width: 52, height: 52, fontSize: 16, flexShrink: 0 }}>
                    {u.avatar || u.name?.substring(0, 2).toUpperCase() || '??'}
                  </div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 16 }}>{u.name}</div>
                      <span className="bdg" style={{
                        background: u.role === 'foreman' ? '#fef3c7' : u.role === 'seller' ? '#dbeafe' : '#dcfce7',
                        color: u.role === 'foreman' ? '#92400e' : u.role === 'seller' ? '#1e40af' : '#15803d',
                      }}>{RL2[u.role] || u.role}</span>
                      {u.commission && u.commission_pct > 0 && (
                        <span className="bdg" style={{ background: '#fef9c3', color: '#854d0e' }}>
                          {u.commission_pct}% comissão
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--mist)' }}>{u.phone || 'Sem telefone cadastrado'}</div>
                  </div>
                  <button className="btn bo bsm" onClick={() => openEdit(u)}>
                    <Icon n="edit" s={13} /> Editar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New member modal */}
      {showNew && (
        <div className="mo" onClick={() => setShowNew(false)}>
          <div className="md" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div className="mhead">
              <div className="mtit">Novo Membro</div>
              <button className="btn bo bsm" onClick={() => setShowNew(false)}><Icon n="x" s={14} /></button>
            </div>
            <div className="mbody">
              <div className="fg"><label className="fl">Função *</label>
                <select className="fc" value={newForm.role} onChange={e => setNewForm({ ...newForm, role: e.target.value })}>
                  <option value="seller">Vendedor</option>
                  <option value="foreman">Encarregado</option>
                </select>
              </div>
              <div className="fg"><label className="fl">Nome *</label>
                <input className="fc" value={newForm.name} onChange={e => setNewForm({ ...newForm, name: e.target.value })} placeholder="Nome completo" />
              </div>
              <div className="fg"><label className="fl">Telefone / WhatsApp</label>
                <input className="fc" value={newForm.phone} onChange={e => setNewForm({ ...newForm, phone: e.target.value })} placeholder="+55 27 99999-0000" />
              </div>
              <div style={{ background: 'var(--sap1)', padding: 14, borderRadius: 10, marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--sap7)', marginBottom: 10 }}>Acesso ao Sistema</div>
                <div className="fg" style={{ marginBottom: 10 }}><label className="fl">E-mail *</label>
                  <input className="fc" type="email" value={newForm.email} onChange={e => setNewForm({ ...newForm, email: e.target.value })} placeholder="usuario@email.com" />
                </div>
                <div className="fg" style={{ marginBottom: 0 }}><label className="fl">Senha *</label>
                  <input className="fc" type="text" value={newForm.password} onChange={e => setNewForm({ ...newForm, password: e.target.value })} placeholder="Mínimo 6 caracteres" />
                </div>
              </div>
              {newForm.role === 'seller' && (
                <div className="fg">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 8 }} onClick={() => setNewForm({ ...newForm, commission: !newForm.commission })}>
                    <div style={{ width: 20, height: 20, borderRadius: 5, border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', borderColor: newForm.commission ? 'var(--sap6)' : 'var(--fog)', background: newForm.commission ? 'var(--sap6)' : 'transparent' }}>
                      {newForm.commission && <Icon n="check" s={12} c="#fff" />}
                    </div>
                    <label className="fl" style={{ cursor: 'pointer', margin: 0 }}>Recebe comissão sobre vendas</label>
                  </div>
                  {newForm.commission && (
                    <input className="fc" type="number" min="0" max="100" step="0.5" value={newForm.commission_pct} onChange={e => setNewForm({ ...newForm, commission_pct: e.target.value })} placeholder="Ex: 5 (significa 5%)" />
                  )}
                </div>
              )}
            </div>
            <div className="mfoot">
              <button className="btn bo" onClick={() => setShowNew(false)}>Cancelar</button>
              <button className="btn bb" onClick={saveNew} disabled={saving}>
                {saving ? <><span className="spinner"></span> Cadastrando</> : 'Cadastrar Membro'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editingId && (
        <div className="mo" onClick={() => setEditingId(null)}>
          <div className="md" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            <div className="mhead">
              <div className="mtit">Editar Membro</div>
              <button className="btn bo bsm" onClick={() => setEditingId(null)}><Icon n="x" s={14} /></button>
            </div>
            <div className="mbody">
              <div className="fg"><label className="fl">Nome *</label>
                <input className="fc" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div className="fg"><label className="fl">Telefone / WhatsApp</label>
                <input className="fc" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} placeholder="+55 27 99999-0000" />
              </div>
              <div className="fg"><label className="fl">Função</label>
                <select className="fc" value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })}>
                  <option value="foreman">Encarregado</option>
                  <option value="seller">Vendedor</option>
                  <option value="client">Cliente</option>
                </select>
              </div>
              {editForm.role === 'seller' && (
                <div className="fg">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 8 }} onClick={() => setEditForm({ ...editForm, commission: !editForm.commission })}>
                    <div style={{ width: 20, height: 20, borderRadius: 5, border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', borderColor: editForm.commission ? 'var(--sap6)' : 'var(--fog)', background: editForm.commission ? 'var(--sap6)' : 'transparent' }}>
                      {editForm.commission && <Icon n="check" s={12} c="#fff" />}
                    </div>
                    <label className="fl" style={{ cursor: 'pointer', margin: 0 }}>Recebe comissão sobre vendas</label>
                  </div>
                  {editForm.commission && (
                    <input className="fc" type="number" min="0" max="100" step="0.5" value={editForm.commission_pct} onChange={e => setEditForm({ ...editForm, commission_pct: e.target.value })} placeholder="Ex: 5 (significa 5%)" />
                  )}
                </div>
              )}
            </div>
            <div className="mfoot">
              <button className="btn bo" onClick={() => setEditingId(null)}>Cancelar</button>
              <button className="btn bb" onClick={save} disabled={saving}>
                {saving ? <><span className="spinner"></span> Salvando</> : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// RELEASES PAGE — liberar catálogo de blocos para clientes
// ═══════════════════════════════════════════════════════════════
function ReleasesPage({ profile, blocks, clients, releases, quarries, onChange, toast }) {
  const [step, setStep] = useState(1) // 1=blocos, 2=clientes, 3=confirmar
  const [selectedBlocks, setSelectedBlocks] = useState([])
  const [selectedClients, setSelectedClients] = useState([])
  const [showReleaseFlow, setShowReleaseFlow] = useState(false)
  const [saving, setSaving] = useState(false)
  const [detailBlock, setDetailBlock] = useState(null)
  const [filterClient, setFilterClient] = useState('')
  const [filterMaterial, setFilterMaterial] = useState('')
  const [filterQuarry, setFilterQuarry] = useState('')
  const [showBuyersModal, setShowBuyersModal] = useState(false)
  const [buyerCompanies, setBuyerCompanies] = useState([])
  const [loadingBuyers, setLoadingBuyers] = useState(false)
  const [clientSearch, setClientSearch] = useState('')

  const availableBlocks = blocks.filter(b => b.status === 'available' || b.status === 'reserved' || b.status === 'reserve')

  // Materiais únicos dos blocos liberados
  const releasedMaterials = [...new Set(
    releases.map(r => {
      const b = blocks.find(x => x.id === r.block_id)
      return b?.material
    }).filter(Boolean)
  )].sort()

  // Map of block_id => Set of client_ids that already have access
  const releaseMap = {}
  releases.forEach(r => {
    if (!releaseMap[r.block_id]) releaseMap[r.block_id] = new Set()
    releaseMap[r.block_id].add(r.client_id)
  })

  const startFlow = () => { setStep(1); setSelectedBlocks([]); setSelectedClients([]); setShowReleaseFlow(true) }
  const closeFlow = () => setShowReleaseFlow(false)

  const toggleBlock = (id) => setSelectedBlocks(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const toggleClient = (id) => setSelectedClients(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const openBuyersModal = async () => {
    setShowBuyersModal(true)
    setLoadingBuyers(true)
    try {
      const list = await api.listBuyerCompaniesForQuarry(profile)
      setBuyerCompanies(list)
    } catch (e) {
      toast('Erro ao buscar indústrias: ' + e.message, 'err')
    } finally { setLoadingBuyers(false) }
  }

  const linkBuyer = async (buyer) => {
    try {
      const newClient = await api.createClientLinkedToBuyer(profile, buyer)
      toast(`${buyer.name} adicionado como cliente!`, 'ok')
      await onChange()
      // Seleciona automaticamente
      setSelectedClients(prev => prev.includes(newClient.id) ? prev : [...prev, newClient.id])
      // Atualiza lista
      const list = await api.listBuyerCompaniesForQuarry(profile)
      setBuyerCompanies(list)
    } catch (e) {
      toast('Erro: ' + e.message, 'err')
    }
  }

  const confirm = async () => {
    setSaving(true)
    try {
      await api.releaseBlocks(profile, selectedBlocks, selectedClients)
      await onChange()
      toast(`${selectedBlocks.length} bloco(s) liberado(s) para ${selectedClients.length} cliente(s)`, 'ok')
      setShowReleaseFlow(false)
    } catch (e) {
      toast('Erro: ' + e.message, 'err')
    } finally { setSaving(false) }
  }

  const revoke = async (blockId, clientId) => {
    if (!window.confirm('Revogar este acesso?')) return
    try {
      await api.revokeRelease(blockId, clientId)
      await onChange()
      toast('Acesso revogado.', 'ok')
    } catch (e) { toast('Erro: ' + e.message, 'err') }
  }

  return (
    <div>
      <div className="ph">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="ptit">Liberar Catálogo</div>
            <div className="psub">{releases.length} liberação(ões) ativa(s)</div>
          </div>
          <button className="btn bb" onClick={startFlow}>
            <Icon n="plus" s={16} c="#fff" /> Nova Liberação
          </button>
        </div>
      </div>

      {releases.length === 0 ? (
        <div className="es">
          <div style={{ marginBottom: 12, opacity: .3 }}><Icon n="cube" s={48} /></div>
          <div className="estit">Nenhum bloco liberado para clientes</div>
          <div style={{ fontSize: 13, color: 'var(--mist)', marginTop: 8 }}>Clique em "Nova Liberação" para começar.</div>
        </div>
      ) : (() => {
        // Aplica filtros
        const filteredReleases = releases.filter(r => {
          const b = blocks.find(x => x.id === r.block_id)
          if (filterClient && r.client_id !== filterClient) return false
          if (filterMaterial && b?.material !== filterMaterial) return false
          if (filterQuarry && b?.quarry_id !== filterQuarry) return false
          return true
        })
        const hasFilter = filterClient || filterMaterial || filterQuarry
        return (
          <>
            <div className="card" style={{ marginBottom: 12 }}>
              <div className="cb" style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--mist)', textTransform: 'uppercase', letterSpacing: .5 }}>Filtros:</span>
                  <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 220 }} value={filterClient} onChange={e => setFilterClient(e.target.value)}>
                    <option value="">Todos os clientes</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 200 }} value={filterQuarry} onChange={e => setFilterQuarry(e.target.value)}>
                    <option value="">Todas as pedreiras</option>
                    {(quarries || []).map(q => <option key={q.id} value={q.id}>{q.name}</option>)}
                  </select>
                  <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 220 }} value={filterMaterial} onChange={e => setFilterMaterial(e.target.value)}>
                    <option value="">Todos os materiais</option>
                    {releasedMaterials.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  {hasFilter && (
                    <button className="btn bo bsm" onClick={() => { setFilterClient(''); setFilterMaterial(''); setFilterQuarry('') }}>
                      <Icon n="x" s={13} /> Limpar
                    </button>
                  )}
                  <span style={{ fontSize: 12, color: 'var(--mist)', marginLeft: 'auto' }}>
                    {filteredReleases.length} de {releases.length} liberações
                  </span>
                </div>
              </div>
            </div>

            <div className="card"><div className="tw"><table>
              <thead><tr>
                <th></th><th>Bloco</th><th>Cliente</th><th>Liberado por</th><th>Data</th><th></th>
              </tr></thead>
              <tbody>
                {filteredReleases.map(r => {
                  const b = blocks.find(x => x.id === r.block_id)
                  const photo = b?.photos && b.photos[0]
                  return (
                    <tr key={r.id} style={{ cursor: b ? 'pointer' : 'default' }} onClick={() => b && setDetailBlock(b)}>
                  <td style={{ width: 56 }}>
                    {photo ? (
                      <img src={photo} alt="" style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 5 }} />
                    ) : (
                      <div style={{ width: 44, height: 44, background: 'var(--haze)', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon n="cube" s={18} c="var(--mist)" />
                      </div>
                    )}
                  </td>
                  <td>
                    <strong style={{ color: 'var(--sap7)' }}>{b?.code || '—'}</strong>
                    <div style={{ color: 'var(--mist)', fontSize: 12 }}>{b?.material}</div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{r.client?.name || '—'}</td>
                  <td style={{ fontSize: 13 }}>{r.liberador?.name || '—'}</td>
                  <td style={{ fontSize: 13, color: 'var(--mist)' }}>{fmtDate(r.data_liberacao)}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <button className="btn bo bsm" style={{ color: 'var(--err)' }} onClick={() => revoke(r.block_id, r.client_id)}>
                      <Icon n="trash" s={13} c="var(--err)" /> Revogar
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table></div></div>
          </>
        )
      })()}

      {/* Block detail modal */}
      {detailBlock && (
        <BlockDetailModal
          block={detailBlock}
          quarry={(quarries || []).find(q => q.id === detailBlock.quarry_id)}
          onClose={() => setDetailBlock(null)}
        />
      )}

      {/* Release flow modal */}
      {showReleaseFlow && (
        <div className="mo" onClick={closeFlow}>
          <div className="md" style={{ maxWidth: 720 }} onClick={e => e.stopPropagation()}>
            <div className="mhead">
              <div className="mtit">Nova Liberação — Passo {step}/3</div>
              <button className="btn bo bsm" onClick={closeFlow}><Icon n="x" s={14} /></button>
            </div>
            <div className="mbody">
              {step === 1 && (
                <>
                  <div style={{ fontSize: 13, color: 'var(--mist)', marginBottom: 14 }}>Selecione os blocos que deseja liberar:</div>
                  {availableBlocks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 30, color: 'var(--mist)' }}>Nenhum bloco disponível</div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 10, maxHeight: 460, overflowY: 'auto' }}>
                      {availableBlocks.map(b => {
                        const sel = selectedBlocks.includes(b.id)
                        const photo = b.photos && b.photos[0]
                        return (
                          <div key={b.id} onClick={() => toggleBlock(b.id)} style={{ border: '2px solid ' + (sel ? 'var(--sap6)' : 'var(--fog)'), background: sel ? 'var(--sap1)' : '#fff', borderRadius: 8, overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
                            {photo ? (
                              <img src={photo} alt={b.code} style={{ width: '100%', height: 90, objectFit: 'cover', background: 'var(--haze)' }} />
                            ) : (
                              <div style={{ width: '100%', height: 90, background: 'var(--haze)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icon n="cube" s={28} c="var(--mist)" />
                              </div>
                            )}
                            <div style={{ padding: 10 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--sap7)' }}>{b.code}</div>
                                {sel && <Icon n="check" s={14} c="var(--sap6)" />}
                              </div>
                              <div style={{ fontSize: 11, color: 'var(--mist)', marginBottom: 4 }}>{b.material}</div>
                              <div style={{ fontSize: 11, color: 'var(--mist)', marginBottom: 4 }}>Vol. {(b.net_volume || 0).toFixed(2)} m³</div>
                              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)' }}>{money(b.total_value, b.currency)}</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </>
              )}

              {step === 2 && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>
                        Selecione os clientes que terão acesso
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--mist)', marginTop: 2 }}>
                        {selectedClients.length} de {clients.length} selecionado(s)
                      </div>
                    </div>
                    <button className="btn bb bsm" onClick={openBuyersModal} title="Adicionar indústria Stone Block como cliente">
                      🏭 Buscar Indústrias Cadastradas
                    </button>
                  </div>

                  {clients.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <input
                        className="fc"
                        placeholder="🔍 Buscar cliente por nome ou email..."
                        value={clientSearch}
                        onChange={e => setClientSearch(e.target.value)}
                        style={{ fontSize: 13 }}
                      />
                    </div>
                  )}

                  {clients.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 30, color: 'var(--mist)', background: 'var(--haze)', borderRadius: 10 }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>Nenhum cliente cadastrado</div>
                      <div style={{ fontSize: 12 }}>Use o botão "Buscar Indústrias" para adicionar.</div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 400, overflowY: 'auto' }}>
                      {clients
                        .filter(c => {
                          if (!clientSearch) return true
                          const s = clientSearch.toLowerCase()
                          return (c.name || '').toLowerCase().includes(s) || (c.email || '').toLowerCase().includes(s)
                        })
                        .map(c => {
                          const sel = selectedClients.includes(c.id)
                          const isLinkedBuyer = !!c.buyer_company_id
                          return (
                            <div
                              key={c.id}
                              onClick={() => toggleClient(c.id)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: 12,
                                border: '2px solid ' + (sel ? 'var(--sap6)' : 'var(--fog)'),
                                background: sel ? 'var(--sap1)' : '#fff',
                                borderRadius: 10,
                                cursor: 'pointer',
                                transition: 'all .15s',
                              }}
                            >
                              <div style={{
                                width: 22, height: 22, borderRadius: 5,
                                border: '2px solid', borderColor: sel ? 'var(--sap6)' : 'var(--fog)',
                                background: sel ? 'var(--sap6)' : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                              }}>
                                {sel && <Icon n="check" s={14} c="#fff" />}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                  <div style={{ fontWeight: 700, fontSize: 14 }}>{c.name}</div>
                                  {isLinkedBuyer && (
                                    <span className="bdg" style={{ background: 'var(--sap1)', color: 'var(--sap7)', fontSize: 10, padding: '2px 6px' }}>
                                      🏭 Indústria SB
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--mist)', marginTop: 2 }}>
                                  {c.country || '—'}{c.email && ' · ' + c.email}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  )}
                </>
              )}

              {step === 3 && (
                <div>
                  <div style={{ fontSize: 13, color: 'var(--mist)', marginBottom: 14 }}>Confirme a liberação:</div>
                  <div style={{ background: 'var(--sap1)', padding: 16, borderRadius: 10, marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--sap7)', marginBottom: 8 }}>Blocos ({selectedBlocks.length})</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {selectedBlocks.map(id => {
                        const b = blocks.find(x => x.id === id)
                        return <span key={id} className="bdg" style={{ background: 'var(--sap2)', color: 'var(--sap7)' }}>{b?.code}</span>
                      })}
                    </div>
                  </div>
                  <div style={{ background: '#dcfce7', padding: 16, borderRadius: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#15803d', marginBottom: 8 }}>Clientes ({selectedClients.length})</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {selectedClients.map(id => {
                        const c = clients.find(x => x.id === id)
                        return <span key={id} className="bdg" style={{ background: '#86efac', color: '#15803d' }}>{c?.name}</span>
                      })}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--mist)', marginTop: 14, textAlign: 'center' }}>
                    Total: {selectedBlocks.length * selectedClients.length} liberação(ões) serão criadas
                  </div>
                </div>
              )}
            </div>
            <div className="mfoot">
              <button className="btn bo" onClick={closeFlow}>Cancelar</button>
              {step > 1 && <button className="btn bo" onClick={() => setStep(step - 1)}>Voltar</button>}
              {step < 3 ? (
                <button
                  className="btn bb"
                  onClick={() => setStep(step + 1)}
                  disabled={(step === 1 && selectedBlocks.length === 0) || (step === 2 && selectedClients.length === 0)}>
                  Próximo
                </button>
              ) : (
                <button className="btn bg" onClick={confirm} disabled={saving}>
                  {saving ? <><span className="spinner"></span> Liberando</> : <><Icon n="check" s={14} c="#fff" /> Confirmar Liberação</>}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Buscar Indústrias Cadastradas (Etapa 7) */}
      {showBuyersModal && (
        <div className="mo" onClick={() => setShowBuyersModal(false)}>
          <div className="md" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="mhead">
              <div>
                <div className="mtit">🏭 Indústrias Stone Block</div>
                <div style={{ fontSize: 13, color: 'var(--mist)', marginTop: 4 }}>
                  Adicione uma indústria como cliente do seu CRM
                </div>
              </div>
              <button className="btn bo bsm" onClick={() => setShowBuyersModal(false)}>
                <Icon n="x" s={14} />
              </button>
            </div>
            <div className="mbody">
              {loadingBuyers ? (
                <div style={{ padding: 30, textAlign: 'center', color: 'var(--mist)' }}>
                  <span className="spinner"></span> Buscando indústrias...
                </div>
              ) : buyerCompanies.length === 0 ? (
                <div style={{ padding: 30, textAlign: 'center', color: 'var(--mist)' }}>
                  Nenhuma indústria cadastrada no Stone Block ainda.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {buyerCompanies.map(b => (
                    <div key={b.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: 12,
                      border: '1px solid var(--fog)', borderRadius: 10, background: '#fff'
                    }}>
                      <div style={{
                        width: 42, height: 42, borderRadius: 8, background: 'var(--sap1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 20, flexShrink: 0,
                      }}>🏭</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{b.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--mist)' }}>
                          {b.contact_email || '—'}
                        </div>
                        {b.is_linked && (
                          <div style={{ fontSize: 11, color: 'var(--ok)', marginTop: 2, fontWeight: 600 }}>
                            ✓ Já é cliente: {b.linked_client?.name}
                          </div>
                        )}
                      </div>
                      {b.is_linked ? (
                        <span className="bdg" style={{ background: '#dcfce7', color: '#15803d', fontSize: 11 }}>
                          Vinculado
                        </span>
                      ) : (
                        <button className="btn bb bsm" onClick={() => linkBuyer(b)}>
                          + Adicionar
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div style={{ marginTop: 14, fontSize: 12, color: 'var(--mist)', background: 'var(--haze)', padding: 10, borderRadius: 8, lineHeight: 1.5 }}>
                💡 Ao adicionar uma indústria, ela vira cliente do seu CRM. Os blocos que você liberar para ela vão aparecer no "Catálogo da Pedreira" dela.
              </div>
            </div>
            <div className="mfoot">
              <button className="btn bo" onClick={() => setShowBuyersModal(false)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// CLIENT PURCHASES PAGE — histórico de compras do cliente
// ═══════════════════════════════════════════════════════════════
function ClientPurchasesPage({ profile, sales, onChange, toast }) {
  const [detailSale, setDetailSale] = useState(null)
  const [detailBlock, setDetailBlock] = useState(null)
  const [filterPeriod, setFilterPeriod] = useState('month')
  const [filterMaterial, setFilterMaterial] = useState('')
  const [dtInicio, setDtInicio] = useState('')
  const [dtFim, setDtFim] = useState('')

  // Materiais únicos das compras
  const allMaterials = [...new Set(
    sales.flatMap(s => (s.blocks || []).map(b => b.material).filter(Boolean))
  )].sort()

  const filtered = sales.filter(s => {
    if (filterPeriod !== 'all' && filterPeriod !== 'custom') {
      const d = new Date(s.created_at)
      const now = new Date()
      if (filterPeriod === 'month') {
        if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return false
      } else if (filterPeriod === 'last_month') {
        const last = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        if (d.getMonth() !== last.getMonth() || d.getFullYear() !== last.getFullYear()) return false
      } else if (filterPeriod === 'year') {
        if (d.getFullYear() !== now.getFullYear()) return false
      }
    }
    if (filterPeriod === 'custom') {
      const d = new Date(s.created_at)
      if (dtInicio && d < new Date(dtInicio + 'T00:00:00')) return false
      if (dtFim && d > new Date(dtFim + 'T23:59:59')) return false
    }
    if (filterMaterial) {
      const has = (s.blocks || []).some(b => b.material === filterMaterial)
      if (!has) return false
    }
    return true
  })

  const totalBRL = filtered.reduce((a, s) => a + (Number(s.total_brl) || 0), 0)
  const totalUSD = filtered.reduce((a, s) => a + (Number(s.total_usd) || 0), 0)
  const totalBlocks = filtered.reduce((a, s) => a + (s.blocks?.length || 0), 0)

  const hasFilter = filterPeriod !== 'all' || filterMaterial

  return (
    <div>
      <div className="ph">
        <div className="ptit">🛒 Minhas Compras</div>
        <div className="psub">{filtered.length} compra(s) · {totalBlocks} bloco(s) {hasFilter ? `(de ${sales.length} compras totais)` : ''}</div>
      </div>

      {filtered.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12, marginBottom: 16 }}>
          {totalBRL > 0 && (
            <div className="card" style={{ background: 'linear-gradient(135deg,#0c1a2e,#1e3a8a)', border: 'none' }}>
              <div className="cb">
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.8)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Total Comprado R$</div>
                <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 26, color: '#fff' }}>{money(totalBRL, 'BRL')}</div>
              </div>
            </div>
          )}
          {totalUSD > 0 && (
            <div className="card" style={{ background: 'linear-gradient(135deg,#10b981,#059669)', border: 'none' }}>
              <div className="cb">
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.8)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Total Comprado US$</div>
                <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 26, color: '#fff' }}>{money(totalUSD, 'USD')}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filtros */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="cb" style={{ padding: '12px 14px' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--mist)', textTransform: 'uppercase', letterSpacing: .5 }}>Filtros:</span>
            <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 180 }} value={filterPeriod} onChange={e => setFilterPeriod(e.target.value)}>
              <option value="all">Todos os períodos</option>
              <option value="month">Mês atual</option>
              <option value="last_month">Mês anterior</option>
              <option value="year">Ano atual</option>
              <option value="custom">Período personalizado</option>
            </select>
            {filterPeriod === 'custom' && (
              <>
                <input type="date" className="fc" style={{ fontSize: 13, padding: '7px 10px' }} value={dtInicio} onChange={e => setDtInicio(e.target.value)} />
                <input type="date" className="fc" style={{ fontSize: 13, padding: '7px 10px' }} value={dtFim} onChange={e => setDtFim(e.target.value)} />
              </>
            )}
            <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 220 }} value={filterMaterial} onChange={e => setFilterMaterial(e.target.value)}>
              <option value="">Todos os materiais</option>
              {allMaterials.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            {hasFilter && (
              <button className="btn bo bsm" onClick={() => { setFilterPeriod('all'); setFilterMaterial(''); setDtInicio(''); setDtFim('') }}>
                <Icon n="x" s={13} /> Limpar
              </button>
            )}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="es">
          <div style={{ marginBottom: 12, opacity: .3 }}><Icon n="cart" s={48} /></div>
          <div className="estit">{hasFilter ? 'Nenhuma compra encontrada com esses filtros' : 'Você ainda não fez compras'}</div>
        </div>
      ) : (
        <div className="card"><div className="tw"><table>
          <thead><tr>
            <th>Data</th>
            <th>Blocos</th>
            <th>Total R$</th>
            <th>Total US$</th>
          </tr></thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} style={{ cursor: 'pointer' }} onClick={() => setDetailSale(s)}>
                <td style={{ fontSize: 13, color: 'var(--mist)' }}>{fmtDate(s.created_at)}</td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {(s.blocks || []).map(b => (
                      <span key={b.id} style={{ fontSize: 12 }}>
                        <strong style={{ color: 'var(--sap7)' }}>{b.code}</strong>
                        <span style={{ color: 'var(--mist)', marginLeft: 4 }}>· {b.material}</span>
                      </span>
                    ))}
                  </div>
                </td>
                <td style={{ fontWeight: 700, color: '#059669' }}>{s.total_brl > 0 ? money(s.total_brl, 'BRL') : '—'}</td>
                <td style={{ fontWeight: 700, color: 'var(--sap7)' }}>{s.total_usd > 0 ? money(s.total_usd, 'USD') : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table></div></div>
      )}

      {/* Modal de detalhe (reutiliza visual do SalesPage) */}
      {detailSale && (
        <div className="mo" onClick={() => setDetailSale(null)}>
          <div className="md" style={{ maxWidth: 680 }} onClick={e => e.stopPropagation()}>
            <div className="mhead">
              <div>
                <div className="mtit">Detalhes da Compra</div>
                <div style={{ fontSize: 13, color: 'var(--mist)', marginTop: 4 }}>{fmtDate(detailSale.created_at)}</div>
              </div>
              <button className="btn bo bsm" onClick={() => setDetailSale(null)}><Icon n="x" s={14} /></button>
            </div>
            <div className="mbody">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10, marginBottom: 16 }}>
                {detailSale.seller && (
                  <div className="sc" style={{ padding: 12, borderTopColor: 'var(--sap5)' }}>
                    <div className="slbl2">Vendedor</div>
                    <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 14 }}>{detailSale.seller?.name || '—'}</div>
                  </div>
                )}
                {detailSale.payment_method && (
                  <div className="sc" style={{ padding: 12, borderTopColor: 'var(--ok)' }}>
                    <div className="slbl2">Pagamento</div>
                    <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 14 }}>{detailSale.payment_method.name}</div>
                  </div>
                )}
                {detailSale.dollar_rate && (
                  <div className="sc" style={{ padding: 12, borderTopColor: 'var(--warn)' }}>
                    <div className="slbl2">Cotação USD</div>
                    <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 14 }}>R$ {Number(detailSale.dollar_rate).toFixed(4)}</div>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--mist)', marginBottom: 8 }}>
                  Blocos comprados ({(detailSale.blocks || []).length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(detailSale.blocks || []).map(b => (
                    <div key={b.id} onClick={() => setDetailBlock(b)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, background: 'var(--haze)', borderRadius: 8, cursor: 'pointer', transition: 'background .15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--sap1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'var(--haze)'}>
                      {b.photos && b.photos[0] ? (
                        <img src={b.photos[0]} alt="" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6 }} />
                      ) : (
                        <div style={{ width: 60, height: 60, background: '#fff', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon n="cube" s={24} c="var(--mist)" />
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: 'var(--sap7)' }}>{b.code}</div>
                        <div style={{ fontSize: 12, color: 'var(--mist)' }}>{b.material} · Classif. {b.classification} · {(b.net_volume || 0).toFixed(2)} m³</div>
                        <div style={{ fontSize: 11, color: 'var(--sap6)', marginTop: 2 }}>👁 Clique para ver fotos e detalhes</div>
                      </div>
                      <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, color: 'var(--sap7)' }}>
                        {money(b.total_value, b.currency)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: 'var(--sap1)', padding: 16, borderRadius: 10, marginBottom: 14 }}>
                {detailSale.total_brl > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6 }}>
                    <span>Total R$:</span>
                    <strong style={{ fontFamily: 'Sora,sans-serif', fontSize: 18 }}>{money(detailSale.total_brl, 'BRL')}</strong>
                  </div>
                )}
                {detailSale.total_usd > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                    <span>Total US$:</span>
                    <strong style={{ fontFamily: 'Sora,sans-serif', fontSize: 18 }}>{money(detailSale.total_usd, 'USD')}</strong>
                  </div>
                )}
              </div>

              {detailSale.obs && (
                <div style={{ background: 'var(--haze)', padding: 12, borderRadius: 8, fontSize: 13 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--mist)', marginBottom: 4 }}>Observações</div>
                  {detailSale.obs}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {detailBlock && (
        <BlockDetailModal
          block={detailBlock}
          quarry={null}
          onClose={() => setDetailBlock(null)}
        />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// CLIENT BOUGHT BLOCKS PAGE — blocos comprados pelo cliente
// ═══════════════════════════════════════════════════════════════
function ClientBoughtBlocksPage({ profile, blocks, quarries, toast }) {
  const [detailBlock, setDetailBlock] = useState(null)
  const [filterMaterial, setFilterMaterial] = useState('')
  const [filterPeriod, setFilterPeriod] = useState('month')
  const [dtInicio, setDtInicio] = useState('')
  const [dtFim, setDtFim] = useState('')

  // 'blocks' aqui são os boughtBlocks (com sale_date)
  const allMaterials = [...new Set(blocks.map(b => b.material).filter(Boolean))].sort()

  const filtered = blocks.filter(b => {
    if (filterMaterial && b.material !== filterMaterial) return false
    if (filterPeriod !== 'all' && filterPeriod !== 'custom' && b.sale_date) {
      const d = new Date(b.sale_date)
      const now = new Date()
      if (filterPeriod === 'month') {
        if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return false
      } else if (filterPeriod === 'last_month') {
        const last = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        if (d.getMonth() !== last.getMonth() || d.getFullYear() !== last.getFullYear()) return false
      } else if (filterPeriod === 'year') {
        if (d.getFullYear() !== now.getFullYear()) return false
      }
    }
    if (filterPeriod === 'custom' && b.sale_date) {
      const d = new Date(b.sale_date)
      if (dtInicio && d < new Date(dtInicio + 'T00:00:00')) return false
      if (dtFim && d > new Date(dtFim + 'T23:59:59')) return false
    }
    return true
  })

  const totalBRL = filtered.filter(b => !b.currency || b.currency === 'BRL').reduce((a, b) => a + (Number(b.total_value) || 0), 0)
  const totalUSD = filtered.filter(b => b.currency === 'USD').reduce((a, b) => a + (Number(b.total_value) || 0), 0)
  const totalM3 = filtered.reduce((a, b) => a + (Number(b.net_volume) || 0), 0)

  const hasFilter = filterMaterial || filterPeriod !== 'all'

  return (
    <div>
      <div className="ph">
        <div className="ptit">📦 Blocos Comprados</div>
        <div className="psub">{filtered.length} bloco(s) · {totalM3.toFixed(2)} m³ {hasFilter ? `(de ${blocks.length} total)` : ''}</div>
      </div>

      {filtered.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12, marginBottom: 16 }}>
          {totalBRL > 0 && (
            <div className="card" style={{ background: 'linear-gradient(135deg,#0c1a2e,#1e3a8a)', border: 'none' }}>
              <div className="cb">
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.8)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Valor em R$</div>
                <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 24, color: '#fff' }}>{money(totalBRL, 'BRL')}</div>
              </div>
            </div>
          )}
          {totalUSD > 0 && (
            <div className="card" style={{ background: 'linear-gradient(135deg,#10b981,#059669)', border: 'none' }}>
              <div className="cb">
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.8)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Valor em US$</div>
                <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 24, color: '#fff' }}>{money(totalUSD, 'USD')}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 180 }} value={filterPeriod} onChange={e => setFilterPeriod(e.target.value)}>
          <option value="all">Todos os períodos</option>
          <option value="month">Mês atual</option>
          <option value="last_month">Mês anterior</option>
          <option value="year">Ano atual</option>
          <option value="custom">Personalizado</option>
        </select>
        {filterPeriod === 'custom' && (
          <>
            <input type="date" className="fc" style={{ fontSize: 13, padding: '7px 10px' }} value={dtInicio} onChange={e => setDtInicio(e.target.value)} />
            <input type="date" className="fc" style={{ fontSize: 13, padding: '7px 10px' }} value={dtFim} onChange={e => setDtFim(e.target.value)} />
          </>
        )}
        <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 220 }} value={filterMaterial} onChange={e => setFilterMaterial(e.target.value)}>
          <option value="">Todos os materiais</option>
          {allMaterials.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        {hasFilter && (
          <button className="btn bo bsm" onClick={() => { setFilterMaterial(''); setFilterPeriod('all'); setDtInicio(''); setDtFim('') }}>
            <Icon n="x" s={13} /> Limpar
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="es">
          <div style={{ marginBottom: 12, opacity: .3 }}><Icon n="cube" s={48} /></div>
          <div className="estit">{hasFilter ? 'Nenhum bloco encontrado com esses filtros' : 'Você ainda não comprou blocos'}</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))' }}>
          {filtered.map(b => {
            const q = (quarries || []).find(x => x.id === b.quarry_id)
            return (
              <div key={b.id} className="card" style={{ cursor: 'pointer', borderTop: '4px solid #10b981' }} onClick={() => setDetailBlock(b)}>
                {b.photos && b.photos.length > 0 && b.photos[0]
                  ? <div style={{ position: 'relative' }}>
                      <img src={b.photos[0]} alt={b.code} style={{ width: '100%', height: 180, objectFit: 'cover', background: 'var(--haze)', display: 'block' }} />
                      {b.photos.length > 1 && (
                        <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,.65)', color: '#fff', padding: '3px 9px', borderRadius: 12, fontSize: 11, fontWeight: 600, backdropFilter: 'blur(6px)' }}>
                          📷 {b.photos.length}
                        </div>
                      )}
                    </div>
                  : <div style={{ height: 150, background: 'var(--haze)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon n="cube" s={32} c="var(--mist)" /></div>}
                <div className="cb">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 15 }}>{b.code}</div>
                    <span className="bdg" style={{ background: '#dcfce7', color: '#15803d' }}>✓ Meu</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{b.material}</div>
                  <div style={{ fontSize: 11, color: 'var(--mist)', marginBottom: 4 }}>Classif. {b.classification} · {(b.net_volume || 0).toFixed(2)} m³</div>
                  {b.sale_date && (
                    <div style={{ fontSize: 11, color: '#15803d', marginBottom: 6, background: '#f0fdf4', padding: '3px 6px', borderRadius: 4 }}>
                      Comprado em {fmtDate(b.sale_date)}
                    </div>
                  )}
                  <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--sap7)' }}>{money(b.total_value, b.currency)}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {detailBlock && (
        <BlockDetailModal
          block={detailBlock}
          quarry={(quarries || []).find(q => q.id === detailBlock.quarry_id)}
          onClose={() => setDetailBlock(null)}
        />
      )}
    </div>
  )
}

function CatalogPage({ profile, catalog, favorites, quarries, onChange, toast }) {
  const [selected, setSelected] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [buyMessage, setBuyMessage] = useState('')
  const [filterFavOnly, setFilterFavOnly] = useState(false)
  const [filterMaterial, setFilterMaterial] = useState('')
  const [filterQuarry, setFilterQuarry] = useState('')
  const [saving, setSaving] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [multiBuy, setMultiBuy] = useState(false)
  const [multiBuyMessage, setMultiBuyMessage] = useState('')

  const STATUS_LBL = { available: 'Disponível', reserved: 'Reservado' }
  const STATUS_CLR = { available: '#10b981', reserved: '#f59e0b' }

  // Unique materials e quarries do catálogo
  const catalogMaterials = [...new Set(catalog.map(b => b.material).filter(Boolean))].sort()
  const catalogQuarries = (() => {
    const map = {}
    catalog.forEach(b => {
      const id = b.quarry_id
      const name = b.quarry?.name || (quarries || []).find(q => q.id === id)?.name
      if (id && name) map[id] = name
    })
    return Object.entries(map).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name))
  })()

  const filteredCatalog = catalog.filter(b => {
    if (filterFavOnly && !favorites.includes(b.id)) return false
    if (filterMaterial && b.material !== filterMaterial) return false
    if (filterQuarry && b.quarry_id !== filterQuarry) return false
    return true
  })

  const selectedBlocks = catalog.filter(b => selectedIds.includes(b.id))
  const totalSelectedBRL = selectedBlocks.filter(b => b.currency === 'BRL').reduce((a, b) => a + (Number(b.total_value) || 0), 0)
  const totalSelectedUSD = selectedBlocks.filter(b => b.currency === 'USD').reduce((a, b) => a + (Number(b.total_value) || 0), 0)

  const handleFavorite = async (blockId) => {
    try {
      await api.toggleFavorite(profile, blockId)
      await onChange()
    } catch (e) { toast('Erro: ' + e.message, 'err') }
  }

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }
  const clearSelection = () => setSelectedIds([])

  const openDetail = (b) => {
    setSelected(b)
    setShowConfirm(false)
    setBuyMessage('')
  }

  const closeDetail = () => {
    setSelected(null)
    setShowConfirm(false)
    setBuyMessage('')
  }

  const confirmPurchase = async () => {
    if (!selected) return
    setSaving(true)
    try {
      await api.createClientOrder(profile, selected.id, buyMessage.trim() || null)
      toast('🎉 Compra realizada com sucesso!', 'ok')
      closeDetail()
      await onChange()
    } catch (e) {
      toast('Erro: ' + e.message, 'err')
    } finally { setSaving(false) }
  }

  const confirmMultiBuy = async () => {
    if (selectedIds.length === 0) return
    setSaving(true)
    try {
      await api.createClientPurchaseMulti(profile, selectedIds, multiBuyMessage.trim() || null)
      toast(`🎉 ${selectedIds.length} bloco(s) comprado(s) com sucesso!`, 'ok')
      clearSelection()
      setMultiBuy(false)
      setMultiBuyMessage('')
      await onChange()
    } catch (e) {
      toast('Erro: ' + e.message, 'err')
    } finally { setSaving(false) }
  }

  const hasFilter = filterFavOnly || filterMaterial || filterQuarry

  return (
    <div>
      <div className="ph">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="ptit">Catálogo</div>
            <div className="psub">
              {hasFilter ? `${filteredCatalog.length} de ${catalog.length} bloco(s)` : `${catalog.length} bloco(s) disponível(is)`}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {selectedIds.length > 0 && (
              <>
                <button className="btn bg" onClick={() => setMultiBuy(true)}>
                  <Icon n="cart" s={16} c="#fff" /> Comprar {selectedIds.length} bloco(s)
                </button>
                <button className="btn bo" onClick={clearSelection}>
                  <Icon n="x" s={14} /> Limpar
                </button>
              </>
            )}
            <button className={'btn ' + (filterFavOnly ? 'bb' : 'bo')} onClick={() => setFilterFavOnly(!filterFavOnly)}>
              ⭐ {filterFavOnly ? 'Ver todos' : `Favoritos (${favorites.length})`}
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 220 }} value={filterMaterial} onChange={e => setFilterMaterial(e.target.value)}>
          <option value="">Todos os materiais</option>
          {catalogMaterials.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 220 }} value={filterQuarry} onChange={e => setFilterQuarry(e.target.value)}>
          <option value="">Todas as pedreiras</option>
          {catalogQuarries.map(q => <option key={q.id} value={q.id}>{q.name}</option>)}
        </select>
        {(filterMaterial || filterQuarry) && (
          <button className="btn bo bsm" onClick={() => { setFilterMaterial(''); setFilterQuarry('') }}>
            <Icon n="x" s={13} /> Limpar filtros
          </button>
        )}
      </div>

      {/* Resumo da seleção */}
      {selectedIds.length > 0 && (
        <div style={{ background: 'var(--sap1)', border: '1px solid var(--sap2)', padding: '12px 16px', borderRadius: 10, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ fontSize: 14 }}>
            <strong style={{ color: 'var(--sap7)' }}>{selectedIds.length} bloco(s) selecionado(s)</strong>
            <div style={{ fontSize: 12, color: 'var(--mist)', marginTop: 2 }}>
              {totalSelectedBRL > 0 && <span>{money(totalSelectedBRL, 'BRL')}</span>}
              {totalSelectedBRL > 0 && totalSelectedUSD > 0 && <span> · </span>}
              {totalSelectedUSD > 0 && <span>{money(totalSelectedUSD, 'USD')}</span>}
            </div>
          </div>
        </div>
      )}

      {filteredCatalog.length === 0 ? (
        <div className="es">
          <div style={{ marginBottom: 12, opacity: .3 }}><Icon n="cube" s={48} /></div>
          <div className="estit">{hasFilter ? 'Nenhum bloco encontrado com esses filtros' : 'Nenhum bloco disponível'}</div>
          <div style={{ fontSize: 13, color: 'var(--mist)', marginTop: 8 }}>
            {!hasFilter && 'Quando blocos forem liberados, aparecerão aqui.'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
          {filteredCatalog.map(b => {
            const isFav = favorites.includes(b.id)
            const isSel = selectedIds.includes(b.id)
            return (
              <div key={b.id} className="card" style={{ cursor: 'pointer', position: 'relative', ...(isSel && { boxShadow: '0 0 0 3px var(--sap5)', borderColor: 'var(--sap5)' }) }} onClick={() => openDetail(b)}>
                <div onClick={(e) => { e.stopPropagation(); toggleSelect(b.id) }} title="Selecionar para compra múltipla" style={{ position: 'absolute', top: 8, left: 8, zIndex: 2, width: 32, height: 32, background: isSel ? 'var(--sap6)' : 'rgba(255,255,255,.95)', border: '2px solid ' + (isSel ? 'var(--sap6)' : 'var(--fog)'), borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  {isSel && <Icon n="check" s={16} c="#fff" />}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleFavorite(b.id) }}
                  style={{ position: 'absolute', top: 8, right: 8, zIndex: 2, width: 36, height: 36, background: isFav ? '#fef3c7' : 'rgba(255,255,255,.9)', border: '1px solid ' + (isFav ? '#fde68a' : 'var(--fog)'), borderRadius: 8, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isFav ? '⭐' : '☆'}
                </button>
                {b.photos && b.photos.length > 0 && b.photos[0] ? (
                  <div style={{ position: 'relative' }}>
                    <img src={b.photos[0]} alt={b.code} style={{ width: '100%', height: 200, objectFit: 'cover', background: 'var(--haze)', display: 'block' }} />
                    {b.photos.length > 1 && (
                      <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,.65)', color: '#fff', padding: '3px 9px', borderRadius: 12, fontSize: 11, fontWeight: 600, backdropFilter: 'blur(6px)' }}>
                        📷 {b.photos.length}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ height: 200, background: 'var(--haze)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon n="cube" s={40} c="var(--mist)" />
                  </div>
                )}
                <div className="cb">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 15 }}>{b.code}</div>
                    <span className="bdg" style={{ background: STATUS_CLR[b.status] + '20', color: STATUS_CLR[b.status] }}>{STATUS_LBL[b.status]}</span>
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--ink)', marginBottom: 4, fontWeight: 600 }}>{b.material}</div>
                  <div style={{ fontSize: 11, color: 'var(--mist)', marginBottom: 4 }}>Classificação {b.classification}</div>
                  <div style={{ fontSize: 12, color: 'var(--mist)', marginBottom: 10 }}>Vol. {(b.net_volume || 0).toFixed(2)} m³</div>
                  <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 18, color: 'var(--sap7)' }}>{money(b.total_value, b.currency)}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal compra múltipla */}
      {multiBuy && (
        <div className="mo" onClick={() => { setMultiBuy(false); setMultiBuyMessage('') }}>
          <div className="md" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="mhead">
              <div className="mtit">🛒 Confirmar Compra Múltipla</div>
              <button className="btn bo bsm" onClick={() => { setMultiBuy(false); setMultiBuyMessage('') }}><Icon n="x" s={14} /></button>
            </div>
            <div className="mbody">
              <div style={{ marginBottom: 16, padding: 14, background: 'var(--haze)', borderRadius: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--mist)', marginBottom: 10 }}>
                  Você vai comprar {selectedIds.length} bloco(s):
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 280, overflowY: 'auto' }}>
                  {selectedBlocks.map(b => (
                    <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: '#fff', borderRadius: 6 }}>
                      {b.photos && b.photos[0] ? (
                        <img src={b.photos[0]} alt="" style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 5, flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 44, height: 44, background: 'var(--haze)', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon n="cube" s={20} c="var(--mist)" />
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--sap7)' }}>{b.code}</div>
                        <div style={{ fontSize: 11, color: 'var(--mist)' }}>{b.material} · {(b.net_volume || 0).toFixed(2)} m³</div>
                      </div>
                      <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 13, color: 'var(--sap7)' }}>
                        {money(b.total_value, b.currency)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: 'var(--sap1)', padding: 16, borderRadius: 10, marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: 'var(--sap7)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Valor Total</div>
                {totalSelectedBRL > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: totalSelectedUSD > 0 ? 4 : 0 }}>
                    <span style={{ fontSize: 13, color: 'var(--mist)' }}>Em Reais:</span>
                    <span style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 22, color: 'var(--sap7)' }}>{money(totalSelectedBRL, 'BRL')}</span>
                  </div>
                )}
                {totalSelectedUSD > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: 'var(--mist)' }}>Em Dólar:</span>
                    <span style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 22, color: 'var(--sap7)' }}>{money(totalSelectedUSD, 'USD')}</span>
                  </div>
                )}
              </div>

              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: 12, borderRadius: 8, marginBottom: 14, fontSize: 13, color: '#92400e', lineHeight: 1.6 }}>
                ⚠️ Ao confirmar, todos os blocos serão marcados como vendidos para você. O vendedor entrará em contato para finalizar.
              </div>

              <div className="fg">
                <label className="fl">Mensagem para o vendedor (opcional)</label>
                <textarea
                  className="fc"
                  value={multiBuyMessage}
                  onChange={e => setMultiBuyMessage(e.target.value)}
                  placeholder="Ex: forma de pagamento, prazo, etc."
                  style={{ minHeight: 70 }} />
              </div>
            </div>
            <div className="mfoot">
              <button className="btn bo" onClick={() => { setMultiBuy(false); setMultiBuyMessage('') }}>Cancelar</button>
              <button className="btn bg" onClick={confirmMultiBuy} disabled={saving}>
                {saving ? <><span className="spinner"></span> Processando</> : <><Icon n="check" s={14} c="#fff" /> Confirmar Compra</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalhes + Compra individual */}
      {selected && (() => {
        const photos = (selected.photos || []).filter(Boolean)
        const quarry = selected.quarry || (quarries || []).find(q => q.id === selected.quarry_id)
        return (
          <div className="mo" onClick={closeDetail}>
            <div className="md" style={{ maxWidth: 820 }} onClick={e => e.stopPropagation()}>
              <div className="mhead">
                <div>
                  <div className="mtit">{selected.code}</div>
                  <div style={{ fontSize: 13, color: 'var(--mist)', marginTop: 4 }}>{selected.material}</div>
                </div>
                <button className="btn bo bsm" onClick={closeDetail}><Icon n="x" s={14} /></button>
              </div>
              <div className="mbody">
                <div style={{ marginBottom: 16 }}>
                  <PhotoGallery photos={photos} height={460} />
                </div>

                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                  <span className="bdg" style={{ background: STATUS_CLR[selected.status] + '20', color: STATUS_CLR[selected.status], padding: '6px 12px', fontSize: 13 }}>
                    {STATUS_LBL[selected.status]}
                  </span>
                  <span className="bdg" style={{ background: 'var(--sap1)', color: 'var(--sap7)', padding: '6px 12px', fontSize: 13 }}>
                    Classificação {selected.classification}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10, marginBottom: 14 }}>
                  <div className="sc" style={{ padding: 12 }}>
                    <div className="slbl2">Pedreira</div>
                    <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 14 }}>{quarry?.name || '—'}</div>
                    {quarry?.location && <div style={{ fontSize: 11, color: 'var(--mist)', marginTop: 2 }}>{quarry.location}</div>}
                  </div>
                  <div className="sc" style={{ padding: 12, borderTopColor: 'var(--ok)' }}>
                    <div className="slbl2">Volume Líquido</div>
                    <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 16 }}>{(selected.net_volume || 0).toFixed(2)} m³</div>
                  </div>
                  <div className="sc" style={{ padding: 12, borderTopColor: 'var(--warn)' }}>
                    <div className="slbl2">Volume Bruto</div>
                    <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 16 }}>{(selected.gross_volume || 0).toFixed(2)} m³</div>
                  </div>
                  <div className="sc" style={{ padding: 12, borderTopColor: 'var(--sap5)' }}>
                    <div className="slbl2">Preço por m³</div>
                    <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 14 }}>{money(selected.price_m3, selected.currency)}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                  <div style={{ background: 'var(--haze)', padding: 12, borderRadius: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--mist)', marginBottom: 6 }}>Medidas Brutas</div>
                    <div style={{ fontSize: 13 }}>Comprimento: {selected.gross_l || '—'} m</div>
                    <div style={{ fontSize: 13 }}>Altura: {selected.gross_h || '—'} m</div>
                    <div style={{ fontSize: 13 }}>Largura: {selected.gross_w || '—'} m</div>
                  </div>
                  <div style={{ background: '#dcfce7', padding: 12, borderRadius: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#15803d', marginBottom: 6 }}>Medidas Líquidas</div>
                    <div style={{ fontSize: 13 }}>Comprimento: {selected.net_l || '—'} m</div>
                    <div style={{ fontSize: 13 }}>Altura: {selected.net_h || '—'} m</div>
                    <div style={{ fontSize: 13 }}>Largura: {selected.net_w || '—'} m</div>
                  </div>
                </div>

                <div style={{ background: 'var(--sap1)', padding: 18, borderRadius: 10, textAlign: 'center', marginBottom: 14 }}>
                  <div style={{ fontSize: 11, color: 'var(--sap7)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Valor Total</div>
                  <div style={{ fontFamily: 'Sora,sans-serif', fontSize: 30, fontWeight: 800, color: 'var(--sap7)' }}>{money(selected.total_value, selected.currency)}</div>
                </div>

                {selected.notes && (
                  <div style={{ background: 'var(--haze)', padding: 12, borderRadius: 8, fontSize: 13, marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--mist)', marginBottom: 4 }}>Observações</div>
                    {selected.notes}
                  </div>
                )}

                {!showConfirm ? (
                  <button className="btn bg" onClick={() => setShowConfirm(true)} style={{ width: '100%', padding: '14px 18px', fontSize: 15 }}>
                    <Icon n="cart" s={18} c="#fff" /> Comprar este Bloco
                  </button>
                ) : (
                  <div style={{ background: '#fffbeb', border: '2px solid #fde68a', padding: 16, borderRadius: 10 }}>
                    <div style={{ fontWeight: 700, marginBottom: 10, color: '#854d0e', fontSize: 15 }}>
                      ⚠️ Confirmar Compra
                    </div>
                    <div style={{ fontSize: 13, color: '#92400e', marginBottom: 12, lineHeight: 1.6 }}>
                      Você está prestes a comprar o bloco <strong>{selected.code}</strong> ({selected.material}) por <strong>{money(selected.total_value, selected.currency)}</strong>.
                      <br /><br />
                      Ao confirmar, o bloco será reservado para você e o vendedor entrará em contato para finalizar.
                    </div>
                    <textarea
                      className="fc"
                      value={buyMessage}
                      onChange={e => setBuyMessage(e.target.value)}
                      placeholder="Mensagem adicional (opcional)"
                      style={{ minHeight: 60, marginBottom: 12 }} />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn bo" onClick={() => { setShowConfirm(false); setBuyMessage('') }} style={{ flex: 1 }}>
                        Cancelar
                      </button>
                      <button className="btn bg" onClick={confirmPurchase} disabled={saving} style={{ flex: 2 }}>
                        {saving ? <><span className="spinner"></span> Processando</> : <><Icon n="check" s={14} c="#fff" /> Confirmar Compra</>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}


function OrdersPage({ profile, orders, onChange, toast }) {
  const STATUS_LBL = {
    pending: 'Pendente',
    approved: 'Aprovado',
    rejected: 'Rejeitado',
    purchase_request: 'Solicitação',
  }
  const STATUS_CLR = {
    pending: '#f59e0b',
    approved: '#10b981',
    rejected: '#ef4444',
    purchase_request: '#3b82f6',
  }

  const updateStatus = async (id, status) => {
    try {
      await api.updateOrderStatus(id, status)
      await onChange()
      toast('Status atualizado!', 'ok')
    } catch (e) { toast('Erro: ' + e.message, 'err') }
  }

  const pending = orders.filter(o => o.status === 'pending' || o.status === 'purchase_request')
  const resolved = orders.filter(o => o.status === 'approved' || o.status === 'rejected')

  return (
    <div>
      <div className="ph">
        <div className="ptit">Pedidos</div>
        <div className="psub">{pending.length} pendente(s) · {resolved.length} resolvido(s)</div>
      </div>

      {orders.length === 0 ? (
        <div className="es">
          <div style={{ marginBottom: 12, opacity: .3 }}><Icon n="cart" s={48} /></div>
          <div className="estit">Nenhum pedido recebido</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[...orders].sort((a, b) => {
            const order = { purchase_request: 1, pending: 2, approved: 3, rejected: 4 }
            return (order[a.status] || 5) - (order[b.status] || 5)
          }).map(o => {
            const isPending = o.status === 'pending' || o.status === 'purchase_request'
            return (
              <div key={o.id} className="card" style={{ borderLeft: '4px solid ' + STATUS_CLR[o.status] }}>
                <div className="cb">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
                    {o.block?.photos && o.block.photos[0] && (
                      <img src={o.block.photos[0]} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 220 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <strong style={{ color: 'var(--sap7)', fontSize: 15 }}>{o.block?.code || '—'}</strong>
                        <span style={{ color: 'var(--mist)' }}>{o.block?.material}</span>
                        <span className="bdg" style={{ background: STATUS_CLR[o.status] + '20', color: STATUS_CLR[o.status] }}>
                          {STATUS_LBL[o.status]}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, marginBottom: 6 }}>
                        <strong>Cliente:</strong> {o.client?.name || '—'}
                      </div>
                      <div style={{ fontSize: 13, marginBottom: 6 }}>
                        <strong>Valor:</strong> {money(o.block?.total_value, o.block?.currency)}
                      </div>
                      {o.message && (
                        <div style={{ fontSize: 13, background: 'var(--haze)', padding: 10, borderRadius: 6, marginTop: 8 }}>
                          💬 {o.message}
                        </div>
                      )}
                      <div style={{ fontSize: 11, color: 'var(--mist)', marginTop: 8 }}>{fmtDate(o.created_at)}</div>
                    </div>
                    {isPending && profile.role !== 'client' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <button className="btn bg bsm" onClick={() => updateStatus(o.id, 'approved')}>
                          <Icon n="check" s={13} c="#fff" /> Aprovar
                        </button>
                        <button className="btn bo bsm" style={{ color: 'var(--err)' }} onClick={() => updateStatus(o.id, 'rejected')}>
                          <Icon n="x" s={13} c="var(--err)" /> Rejeitar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// COMMISSIONS PAGE — relatório de comissões por vendedor
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// RESERVE COMMERCIAL PAGE — blocos guardados estrategicamente
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// SOLD BLOCKS PAGE — histórico de blocos vendidos
// ═══════════════════════════════════════════════════════════════
function SoldBlocksPage({ profile, blocks, quarries, sales, onChange, toast }) {
  const [detailBlock, setDetailBlock] = useState(null)
  const [filterMaterial, setFilterMaterial] = useState('')
  const [filterQuarry, setFilterQuarry] = useState('')
  const [filterPeriod, setFilterPeriod] = useState('month')
  const [filterClient, setFilterClient] = useState('')
  const [filterBlock, setFilterBlock] = useState('')
  const [dtInicio, setDtInicio] = useState('')
  const [dtFim, setDtFim] = useState('')
  const [mobileGrid2, setMobileGrid2] = useState(false)

  // Cria um mapa block_id -> sale info (cliente, data)
  const blockSaleInfo = {}
  ;(sales || []).forEach(s => {
    ;(s.blocks || []).forEach(b => {
      blockSaleInfo[b.id] = {
        client: s.client?.name || '—',
        clientId: s.client_id,
        date: s.created_at,
        sale: s,
      }
    })
  })

  const soldBlocks = blocks.filter(b => b.status === 'sold')
  const allMaterials = [...new Set(soldBlocks.map(b => b.material).filter(Boolean))].sort()
  const allClients = [...new Set(Object.values(blockSaleInfo).map(x => x.client).filter(c => c !== '—'))].sort()

  const filteredBlocks = soldBlocks.filter(b => {
    if (filterMaterial && b.material !== filterMaterial) return false
    if (filterQuarry && b.quarry_id !== filterQuarry) return false
    if (filterBlock && !(b.code || '').toLowerCase().includes(filterBlock.toLowerCase())) return false
    const info = blockSaleInfo[b.id]
    if (filterClient && info?.client !== filterClient) return false
    const refDate = info?.date || b.updated_at || b.created_at
    if (filterPeriod !== 'all' && filterPeriod !== 'custom' && refDate) {
      const d = new Date(refDate)
      const now = new Date()
      if (filterPeriod === 'month') {
        if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return false
      } else if (filterPeriod === 'last_month') {
        const last = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        if (d.getMonth() !== last.getMonth() || d.getFullYear() !== last.getFullYear()) return false
      } else if (filterPeriod === 'year') {
        if (d.getFullYear() !== now.getFullYear()) return false
      }
    }
    if (filterPeriod === 'custom' && refDate) {
      const d = new Date(refDate)
      if (dtInicio && d < new Date(dtInicio + 'T00:00:00')) return false
      if (dtFim && d > new Date(dtFim + 'T23:59:59')) return false
    }
    return true
  })

  // Total em R$ — inclui blocos em BRL + blocos em USD convertidos pela cotação da venda
  let totalBRL = 0
  let totalUSD = 0
  filteredBlocks.forEach(b => {
    const v = Number(b.total_value) || 0
    if (b.currency === 'USD') {
      totalUSD += v
      // Tenta achar a cotação na venda associada
      const info = blockSaleInfo[b.id]
      const rate = Number(info?.sale?.dollar_rate) || 0
      if (rate > 0) {
        totalBRL += v * rate
      }
    } else {
      // BRL (ou sem currency definido)
      totalBRL += v
    }
  })

  const hasFilter = filterMaterial || filterQuarry || filterClient || filterBlock || filterPeriod !== 'month'

  return (
    <div>
      <div className="ph">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="ptit">✅ Blocos Vendidos</div>
            <div className="psub">{filteredBlocks.length} bloco(s) {hasFilter ? `de ${soldBlocks.length}` : ''}</div>
          </div>
        </div>
      </div>

      {/* Mobile toggle 2 cols */}
      <div className="mobile-only" style={{ display: 'none', marginBottom: 12 }}>
        <button className="btn bo bsm" onClick={() => setMobileGrid2(!mobileGrid2)}>
          {mobileGrid2 ? '☰ Ver 1 por linha' : '⊞ Ver 2 por linha'}
        </button>
      </div>

      {/* Resumo */}
      {filteredBlocks.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12, marginBottom: 16 }}>
          {totalBRL > 0 && (
            <div className="card" style={{ background: 'linear-gradient(135deg,#10b981,#059669)', border: 'none' }}>
              <div className="cb">
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.8)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Total Vendido R$</div>
                <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 26, color: '#fff' }}>{money(totalBRL, 'BRL')}</div>
              </div>
            </div>
          )}
          {totalUSD > 0 && (
            <div className="card" style={{ background: 'linear-gradient(135deg,#0c1a2e,#1e3a8a)', border: 'none' }}>
              <div className="cb">
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.8)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Total Vendido US$</div>
                <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 26, color: '#fff' }}>{money(totalUSD, 'USD')}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filtros */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="cb" style={{ padding: '12px 14px' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--mist)', textTransform: 'uppercase', letterSpacing: .5 }}>Filtros:</span>
            <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 180 }} value={filterPeriod} onChange={e => setFilterPeriod(e.target.value)}>
              <option value="month">Mês atual</option>
              <option value="last_month">Mês anterior</option>
              <option value="year">Ano atual</option>
              <option value="all">Todos os períodos</option>
              <option value="custom">Período personalizado</option>
            </select>
            {filterPeriod === 'custom' && (
              <>
                <input type="date" className="fc" style={{ fontSize: 13, padding: '7px 10px' }} value={dtInicio} onChange={e => setDtInicio(e.target.value)} />
                <input type="date" className="fc" style={{ fontSize: 13, padding: '7px 10px' }} value={dtFim} onChange={e => setDtFim(e.target.value)} />
              </>
            )}
            <input className="fc" style={{ fontSize: 13, padding: '7px 12px', flex: '0 1 150px', minWidth: 130, textTransform: 'uppercase' }} placeholder="Nº do bloco..." value={filterBlock} onChange={e => setFilterBlock(e.target.value.toUpperCase())} />
            <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 200 }} value={filterQuarry} onChange={e => setFilterQuarry(e.target.value)}>
              <option value="">Todas as pedreiras</option>
              {quarries.map(q => <option key={q.id} value={q.id}>{q.name}</option>)}
            </select>
            <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 220 }} value={filterMaterial} onChange={e => setFilterMaterial(e.target.value)}>
              <option value="">Todos os materiais</option>
              {allMaterials.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 200 }} value={filterClient} onChange={e => setFilterClient(e.target.value)}>
              <option value="">Todos os clientes</option>
              {allClients.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {hasFilter && (
              <button className="btn bo bsm" onClick={() => { setFilterMaterial(''); setFilterQuarry(''); setFilterClient(''); setFilterBlock(''); setFilterPeriod('month'); setDtInicio(''); setDtFim('') }}>
                <Icon n="x" s={13} /> Limpar
              </button>
            )}
          </div>
        </div>
      </div>

      {filteredBlocks.length === 0 ? (
        <div className="es">
          <div style={{ marginBottom: 12, opacity: .3 }}><Icon n="cube" s={48} /></div>
          <div className="estit">Nenhum bloco vendido encontrado</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: mobileGrid2 ? 'repeat(auto-fill,minmax(140px,1fr))' : 'repeat(auto-fill,minmax(280px,1fr))' }}>
          {filteredBlocks.map(b => {
            const q = quarries.find(x => x.id === b.quarry_id)
            const info = blockSaleInfo[b.id]
            return (
              <div key={b.id} className="card" style={{ position: 'relative', borderTop: '4px solid #ef4444', cursor: 'pointer' }} onClick={() => setDetailBlock(b)}>
                {b.photos && b.photos.length > 0 && b.photos[0]
                  ? <div style={{ position: 'relative' }}>
                      <img src={b.photos[0]} alt={b.code} style={{ width: '100%', height: 160, objectFit: 'cover', background: 'var(--haze)', filter: 'grayscale(20%)', display: 'block' }} />
                      {b.photos.length > 1 && (
                        <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,.65)', color: '#fff', padding: '3px 9px', borderRadius: 12, fontSize: 11, fontWeight: 600, backdropFilter: 'blur(6px)' }}>
                          📷 {b.photos.length}
                        </div>
                      )}
                    </div>
                  : <div style={{ height: 130, background: 'var(--haze)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon n="cube" s={32} c="var(--mist)" /></div>}
                <div className="cb">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 15 }}>{b.code}</div>
                    <span className="bdg" style={{ background: '#fecaca', color: '#991b1b' }}>✅ Vendido</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--mist)', marginBottom: 4 }}>{b.material}</div>
                  <div style={{ fontSize: 11, color: 'var(--mist)', marginBottom: 6 }}>📍 {q?.name || '—'} · {(b.net_volume || 0).toFixed(2)} m³</div>
                  {info && (
                    <div style={{ fontSize: 12, color: '#991b1b', marginBottom: 6, background: '#fef2f2', padding: '4px 8px', borderRadius: 4 }}>
                      🛒 {info.client}
                      <span style={{ color: 'var(--mist)', marginLeft: 4 }}>· {fmtDate(info.date)}</span>
                    </div>
                  )}
                  <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--sap7)' }}>{money(b.total_value, b.currency)}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {detailBlock && (
        <BlockDetailModal
          block={detailBlock}
          quarry={quarries.find(q => q.id === detailBlock.quarry_id)}
          onClose={() => setDetailBlock(null)}
        />
      )}
    </div>
  )
}

function ReserveCommercialPage({ profile, blocks, quarries, clients, payments, onChange, toast }) {
  const [detailBlock, setDetailBlock] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])
  const [showSaleModal, setShowSaleModal] = useState(false)
  const [filterMaterial, setFilterMaterial] = useState('')
  const [filterQuarry, setFilterQuarry] = useState('')

  const reserveBlocks = blocks.filter(b => b.status === 'reserve')
  const allMaterials = [...new Set(reserveBlocks.map(b => b.material).filter(Boolean))].sort()

  const filteredBlocks = reserveBlocks.filter(b => {
    if (filterMaterial && b.material !== filterMaterial) return false
    if (filterQuarry && b.quarry_id !== filterQuarry) return false
    return true
  })

  const canSell = profile.role === 'owner' || profile.role === 'seller'
  const selectedBlocks = blocks.filter(b => selectedIds.includes(b.id))

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }
  const clearSelection = () => setSelectedIds([])

  const moveBack = async (b) => {
    if (!window.confirm(`Voltar o bloco ${b.code} para o estoque principal?`)) return
    try {
      await api.moveBackFromReserve(b.id)
      await onChange()
      toast(`Bloco ${b.code} voltou para o estoque.`, 'ok')
    } catch (e) { toast('Erro: ' + e.message, 'err') }
  }

  return (
    <div>
      <div className="ph">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="ptit">📦 Reserva Comercial</div>
            <div className="psub">{filteredBlocks.length} bloco(s) em reserva estratégica</div>
          </div>
          {selectedIds.length > 0 && canSell && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn bg" onClick={() => setShowSaleModal(true)}>
                <Icon n="cart" s={16} c="#fff" /> Vender {selectedIds.length} bloco(s)
              </button>
              <button className="btn bo" onClick={clearSelection}><Icon n="x" s={14} /> Limpar</button>
            </div>
          )}
        </div>
      </div>

      <div style={{ background: '#f3e8ff', border: '1px solid #d8b4fe', padding: 12, borderRadius: 10, marginBottom: 16, fontSize: 13, color: '#6b21a8' }}>
        💡 Esta é uma área para blocos que você quer guardar estrategicamente. Eles não aparecem no estoque principal, mas podem ser vendidos ou liberados para catálogo diretamente daqui, ou voltar para o estoque.
      </div>

      {/* Filtros */}
      {reserveBlocks.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 220 }} value={filterMaterial} onChange={e => setFilterMaterial(e.target.value)}>
            <option value="">Todos os materiais</option>
            {allMaterials.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 220 }} value={filterQuarry} onChange={e => setFilterQuarry(e.target.value)}>
            <option value="">Todas as pedreiras</option>
            {quarries.map(q => <option key={q.id} value={q.id}>{q.name}</option>)}
          </select>
          {(filterMaterial || filterQuarry) && (
            <button className="btn bo bsm" onClick={() => { setFilterMaterial(''); setFilterQuarry('') }}>
              <Icon n="x" s={13} /> Limpar filtros
            </button>
          )}
        </div>
      )}

      {filteredBlocks.length === 0 ? (
        <div className="es">
          <div style={{ marginBottom: 12, opacity: .3 }}><Icon n="cube" s={48} /></div>
          <div className="estit">Nenhum bloco na Reserva Comercial</div>
          <div style={{ fontSize: 13, color: 'var(--mist)', marginTop: 8 }}>
            Para mover um bloco, vá na tela "Blocos" e clique no ícone 📦 do bloco que deseja guardar.
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))' }}>
          {filteredBlocks.map(b => {
            const q = quarries.find(x => x.id === b.quarry_id)
            const isSelected = selectedIds.includes(b.id)
            return (
              <div key={b.id} className="card" style={{ position: 'relative', borderTop: '4px solid #a855f7', ...(isSelected && { boxShadow: '0 0 0 3px var(--sap5)', borderColor: 'var(--sap5)' }) }}>
                {canSell && (
                  <div onClick={() => toggleSelect(b.id)} style={{ position: 'absolute', top: 8, left: 8, zIndex: 2, width: 28, height: 28, background: isSelected ? 'var(--sap6)' : 'rgba(255,255,255,.9)', border: '2px solid ' + (isSelected ? 'var(--sap6)' : 'var(--fog)'), borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    {isSelected && <Icon n="check" s={14} c="#fff" />}
                  </div>
                )}
                <button onClick={() => setDetailBlock(b)} title="Ver detalhes" style={{ position: 'absolute', top: 8, right: 8, zIndex: 2, width: 28, height: 28, background: 'rgba(255,255,255,.95)', border: '1px solid var(--fog)', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔍</button>

                {b.photos && b.photos.length > 0 && b.photos[0]
                  ? <div style={{ position: 'relative' }}>
                      <img src={b.photos[0]} alt={b.code} style={{ width: '100%', height: 160, objectFit: 'cover', background: 'var(--haze)', cursor: 'pointer', display: 'block' }} onClick={() => setDetailBlock(b)} />
                      {b.photos.length > 1 && (
                        <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,.65)', color: '#fff', padding: '3px 9px', borderRadius: 12, fontSize: 11, fontWeight: 600, backdropFilter: 'blur(6px)', pointerEvents: 'none' }}>
                          📷 {b.photos.length}
                        </div>
                      )}
                    </div>
                  : <div style={{ height: 130, background: 'var(--haze)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon n="cube" s={32} c="var(--mist)" /></div>}
                <div className="cb">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 15 }}>{b.code}</div>
                    <span className="bdg" style={{ background: '#f3e8ff', color: '#6b21a8' }}>📦 Reserva</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--mist)', marginBottom: 6 }}>{b.material}</div>
                  <div style={{ fontSize: 11, color: 'var(--mist)', marginBottom: 4 }}>📍 {q?.name || '—'} · {(b.net_volume || 0).toFixed(2)} m³</div>
                  {b.moved_to_reserve_at && (
                    <div style={{ fontSize: 11, color: '#6b21a8', marginBottom: 6 }}>Em reserva desde {fmtDate(b.moved_to_reserve_at)}</div>
                  )}
                  <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--sap7)', marginBottom: 10 }}>{money(b.total_value, b.currency)}</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    <button className="btn bb bsm" onClick={() => moveBack(b)} title="Voltar para Estoque">
                      ↩️ Voltar p/ Estoque
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {detailBlock && (
        <BlockDetailModal
          block={detailBlock}
          quarry={quarries.find(q => q.id === detailBlock.quarry_id)}
          onClose={() => setDetailBlock(null)}
        />
      )}

      {showSaleModal && (
        <SaleModal
          profile={profile}
          selectedBlocks={selectedBlocks}
          clients={clients}
          payments={payments}
          onClose={() => setShowSaleModal(false)}
          onSuccess={async () => {
            setShowSaleModal(false)
            clearSelection()
            await onChange()
          }}
          toast={toast}
        />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// COMMERCIAL RESERVE PAGE — blocos transferidos da lista principal
// ═══════════════════════════════════════════════════════════════
function CommercialReservePage({ profile, blocks, quarries, clients, payments, onChange, toast }) {
  const [selectedIds, setSelectedIds] = useState([])
  const [showSaleModal, setShowSaleModal] = useState(false)
  const [showReleaseModal, setShowReleaseModal] = useState(false)
  const [detailBlock, setDetailBlock] = useState(null)
  const [filterMaterial, setFilterMaterial] = useState('')
  const [filterQuarry, setFilterQuarry] = useState('')

  // Apenas blocos com status 'reserve'
  const reserveBlocks = blocks.filter(b => b.status === 'reserve')

  const allMaterials = [...new Set(reserveBlocks.map(b => b.material).filter(Boolean))].sort()
  const filtered = reserveBlocks.filter(b => {
    if (filterMaterial && b.material !== filterMaterial) return false
    if (filterQuarry && b.quarry_id !== filterQuarry) return false
    return true
  })

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }
  const clearSelection = () => setSelectedIds([])
  const selectedBlocks = blocks.filter(b => selectedIds.includes(b.id))

  const canSell = profile.role === 'owner' || profile.role === 'seller'
  const canRelease = profile.role === 'owner' || profile.role === 'seller'

  const moveBack = async (b) => {
    if (!window.confirm(`Voltar o bloco ${b.code} para a base principal?`)) return
    try {
      await api.moveBackFromReserve(b.id)
      await onChange()
      toast(`Bloco ${b.code} voltou para a base principal.`, 'ok')
    } catch (e) { toast('Erro: ' + e.message, 'err') }
  }

  const moveBackMulti = async () => {
    if (selectedIds.length === 0) return
    if (!window.confirm(`Voltar ${selectedIds.length} bloco(s) para a base principal?`)) return
    try {
      for (const id of selectedIds) {
        await api.moveBackFromReserve(id)
      }
      clearSelection()
      await onChange()
      toast(`${selectedIds.length} bloco(s) voltaram para a base.`, 'ok')
    } catch (e) { toast('Erro: ' + e.message, 'err') }
  }

  const STATUS_CLR = { reserve: '#7c3aed' }
  const STATUS_LBL = { reserve: 'Reserva Comercial' }

  return (
    <div>
      <div className="ph">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="ptit">📦 Reserva Comercial</div>
            <div className="psub">{filtered.length} bloco(s) · estoque estratégico</div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {selectedIds.length > 0 && (
              <>
                {canSell && (
                  <button className="btn bg" onClick={() => setShowSaleModal(true)}>
                    <Icon n="cart" s={16} c="#fff" /> Vender {selectedIds.length}
                  </button>
                )}
                {canRelease && (
                  <button className="btn bb" onClick={() => setShowReleaseModal(true)}>
                    📢 Liberar p/ Catálogo
                  </button>
                )}
                <button className="btn bo" onClick={moveBackMulti} title="Voltar para base">
                  ↩️ Voltar p/ Base
                </button>
                <button className="btn bo" onClick={clearSelection}>
                  <Icon n="x" s={14} /> Limpar
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 220 }} value={filterMaterial} onChange={e => setFilterMaterial(e.target.value)}>
          <option value="">Todos os materiais</option>
          {allMaterials.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 220 }} value={filterQuarry} onChange={e => setFilterQuarry(e.target.value)}>
          <option value="">Todas as pedreiras</option>
          {(quarries || []).map(q => <option key={q.id} value={q.id}>{q.name}</option>)}
        </select>
        {(filterMaterial || filterQuarry) && (
          <button className="btn bo bsm" onClick={() => { setFilterMaterial(''); setFilterQuarry('') }}>
            <Icon n="x" s={13} /> Limpar
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="es">
          <div style={{ marginBottom: 12, opacity: .3, fontSize: 48 }}>📦</div>
          <div className="estit">Nenhum bloco na Reserva Comercial</div>
          <div style={{ fontSize: 13, color: 'var(--mist)', marginTop: 8 }}>
            Use o botão 📦 nos blocos da lista principal para movê-los para cá.
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))' }}>
          {filtered.map(b => {
            const q = (quarries || []).find(x => x.id === b.quarry_id)
            const isSel = selectedIds.includes(b.id)
            const daysInReserve = b.moved_to_reserve_at
              ? Math.floor((new Date() - new Date(b.moved_to_reserve_at)) / (1000 * 60 * 60 * 24))
              : null
            return (
              <div key={b.id} className="card" style={{ position: 'relative', ...(isSel && { boxShadow: '0 0 0 3px var(--sap5)', borderColor: 'var(--sap5)' }) }}>
                <div onClick={() => toggleSelect(b.id)} style={{ position: 'absolute', top: 8, left: 8, zIndex: 2, width: 28, height: 28, background: isSel ? 'var(--sap6)' : 'rgba(255,255,255,.9)', border: '2px solid ' + (isSel ? 'var(--sap6)' : 'var(--fog)'), borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  {isSel && <Icon n="check" s={14} c="#fff" />}
                </div>
                <button onClick={() => setDetailBlock(b)} title="Ver detalhes" style={{ position: 'absolute', top: 8, right: 8, zIndex: 2, width: 28, height: 28, background: 'rgba(255,255,255,.95)', border: '1px solid var(--fog)', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  🔍
                </button>

                {b.photos && b.photos.length > 0 && b.photos[0] ? (
                  <img src={b.photos[0]} alt={b.code} style={{ width: '100%', height: 160, objectFit: 'cover', background: 'var(--haze)', cursor: 'pointer' }} onClick={() => setDetailBlock(b)} />
                ) : (
                  <div style={{ height: 130, background: 'var(--haze)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon n="cube" s={32} c="var(--mist)" />
                  </div>
                )}
                <div className="cb">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 4 }}>
                    <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 15 }}>{b.code}</div>
                    <span className="bdg" style={{ background: '#ede9fe', color: '#7c3aed', fontSize: 11 }}>📦 Reserva</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--mist)', marginBottom: 6 }}>{b.material}</div>
                  {daysInReserve !== null && (
                    <div style={{ fontSize: 11, color: '#7c3aed', marginBottom: 6, fontWeight: 600 }}>
                      Em reserva há {daysInReserve} dia(s)
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: 'var(--mist)', marginBottom: 10 }}>📍 {q?.name || '—'} · {(b.net_volume || 0).toFixed(2)} m³</div>
                  <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--sap7)', marginBottom: 10 }}>{money(b.total_value, b.currency)}</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    <button className="btn bo bsm" onClick={() => moveBack(b)} title="Voltar para base principal">
                      ↩️ Voltar p/ Base
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Sale modal */}
      {showSaleModal && (
        <SaleModal
          profile={profile}
          selectedBlocks={selectedBlocks}
          clients={clients}
          payments={payments}
          onClose={() => setShowSaleModal(false)}
          onSuccess={async () => {
            setShowSaleModal(false)
            clearSelection()
            await onChange()
          }}
          toast={toast}
        />
      )}

      {/* Release modal */}
      {showReleaseModal && (
        <ReserveReleaseModal
          profile={profile}
          selectedBlocks={selectedBlocks}
          clients={clients}
          onClose={() => setShowReleaseModal(false)}
          onSuccess={async () => {
            setShowReleaseModal(false)
            clearSelection()
            await onChange()
          }}
          toast={toast}
        />
      )}

      {/* Detail modal */}
      {detailBlock && (
        <BlockDetailModal
          block={detailBlock}
          quarry={(quarries || []).find(q => q.id === detailBlock.quarry_id)}
          onClose={() => setDetailBlock(null)}
        />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// RESERVE RELEASE MODAL — liberar blocos da reserva p/ catálogo
// ═══════════════════════════════════════════════════════════════
function ReserveReleaseModal({ profile, selectedBlocks, clients, onClose, onSuccess, toast }) {
  const [selectedClients, setSelectedClients] = useState([])
  const [saving, setSaving] = useState(false)

  const toggleClient = (id) => {
    setSelectedClients(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const confirm = async () => {
    if (selectedClients.length === 0) { toast('Selecione ao menos um cliente.', 'err'); return }
    setSaving(true)
    try {
      // Primeiro volta os blocos para "available" (precisa estar disponível para ser liberado)
      for (const b of selectedBlocks) {
        await api.moveBackFromReserve(b.id)
      }
      // Depois libera para os clientes
      const blockIds = selectedBlocks.map(b => b.id)
      await api.releaseBlocksToClients(profile, blockIds, selectedClients)
      toast(`${blockIds.length} bloco(s) liberado(s) para ${selectedClients.length} cliente(s).`, 'ok')
      onSuccess()
    } catch (e) {
      toast('Erro: ' + e.message, 'err')
    } finally { setSaving(false) }
  }

  return (
    <div className="mo" onClick={onClose}>
      <div className="md" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
        <div className="mhead">
          <div className="mtit">📢 Liberar para Catálogo</div>
          <button className="btn bo bsm" onClick={onClose}><Icon n="x" s={14} /></button>
        </div>
        <div className="mbody">
          <div style={{ background: 'var(--haze)', padding: 12, borderRadius: 8, marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--mist)', marginBottom: 8 }}>
              Blocos da reserva ({selectedBlocks.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {selectedBlocks.map(b => (
                <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', background: '#fff', borderRadius: 6, fontSize: 13 }}>
                  {b.photos?.[0] && <img src={b.photos[0]} alt="" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 4 }} />}
                  <div style={{ flex: 1 }}>
                    <strong style={{ color: 'var(--sap7)' }}>{b.code}</strong>
                    <span style={{ color: 'var(--mist)', marginLeft: 6 }}>· {b.material}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#fffbeb', padding: 10, borderRadius: 6, fontSize: 12, color: '#92400e', marginBottom: 14 }}>
            ⚠️ Os blocos serão movidos para a base principal e liberados para os clientes selecionados.
          </div>

          <div className="fg">
            <label className="fl">Clientes que terão acesso *</label>
            {clients.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--mist)', padding: 12, textAlign: 'center', background: 'var(--haze)', borderRadius: 6 }}>
                Nenhum cliente cadastrado.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 240, overflowY: 'auto' }}>
                {clients.map(c => {
                  const sel = selectedClients.includes(c.id)
                  return (
                    <div key={c.id} onClick={() => toggleClient(c.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, border: '2px solid ' + (sel ? 'var(--sap6)' : 'var(--fog)'), background: sel ? 'var(--sap1)' : '#fff', borderRadius: 6, cursor: 'pointer' }}>
                      <div style={{ width: 20, height: 20, borderRadius: 4, background: sel ? 'var(--sap6)' : '#fff', border: '2px solid ' + (sel ? 'var(--sap6)' : 'var(--fog)'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {sel && <Icon n="check" s={12} c="#fff" />}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--mist)' }}>{c.country}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
        <div className="mfoot">
          <button className="btn bo" onClick={onClose}>Cancelar</button>
          <button className="btn bb" onClick={confirm} disabled={saving || selectedClients.length === 0}>
            {saving ? <><span className="spinner"></span> Liberando</> : 'Confirmar Liberação'}
          </button>
        </div>
      </div>
    </div>
  )
}

function CommissionsPage({ profile, sales, team, toast }) {
  const [filterPeriod, setFilterPeriod] = useState('month')
  const [dtInicio, setDtInicio] = useState('')
  const [dtFim, setDtFim] = useState('')
  const [filterSeller, setFilterSeller] = useState('')
  const [expandedSeller, setExpandedSeller] = useState(null)

  const today = new Date().toISOString().slice(0, 10)

  const allSellers = team.filter(t => t.role === 'seller')
  const sellers = filterSeller ? allSellers.filter(s => s.id === filterSeller) : allSellers

  const matchesPeriod = (d) => {
    if (filterPeriod === 'all') return true
    if (filterPeriod === 'custom') {
      if (dtInicio && d < new Date(dtInicio + 'T00:00:00')) return false
      if (dtFim && d > new Date(dtFim + 'T23:59:59')) return false
      return true
    }
    const now = new Date()
    if (filterPeriod === 'month') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    } else if (filterPeriod === 'last_month') {
      const last = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      return d.getMonth() === last.getMonth() && d.getFullYear() === last.getFullYear()
    } else if (filterPeriod === 'year') {
      return d.getFullYear() === now.getFullYear()
    }
    return true
  }

  const sellerData = sellers.map(s => {
    const sellerSales = sales.filter(sale => {
      if (sale.seller_id !== s.id) return false
      return matchesPeriod(new Date(sale.created_at))
    })
    const totalBRL = sellerSales.reduce((a, x) => a + (Number(x.total_brl) || 0), 0)
    const totalUSD = sellerSales.reduce((a, x) => a + (Number(x.total_usd) || 0), 0)
    const commission = s.commission && s.commission_pct > 0 ? totalBRL * (s.commission_pct / 100) : 0
    const blockCount = sellerSales.reduce((a, x) => a + (x.block_ids?.length || 0), 0)
    return { seller: s, sales: sellerSales, totalBRL, totalUSD, commission, blockCount }
  })

  const grandTotal = sellerData.reduce((a, d) => a + d.totalBRL, 0)
  const grandCommission = sellerData.reduce((a, d) => a + d.commission, 0)

  const hasFilter = filterPeriod !== 'month' || filterSeller || dtInicio || dtFim

  return (
    <div>
      <div className="ph">
        <div className="ptit">Comissões</div>
        <div className="psub">
          {filterPeriod === 'month' ? 'Mês atual' :
           filterPeriod === 'last_month' ? 'Mês anterior' :
           filterPeriod === 'year' ? 'Ano atual' :
           filterPeriod === 'all' ? 'Todos os períodos' :
           `Período: ${dtInicio ? fmtDate(new Date(dtInicio + 'T12:00:00')) : 'início'} → ${dtFim ? fmtDate(new Date(dtFim + 'T12:00:00')) : 'hoje'}`}
        </div>
      </div>

      {/* Filtros */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="cb" style={{ padding: '12px 14px' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--mist)', textTransform: 'uppercase', letterSpacing: .5 }}>Filtros:</span>
            <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 180 }} value={filterPeriod} onChange={e => setFilterPeriod(e.target.value)}>
              <option value="month">Mês atual</option>
              <option value="last_month">Mês anterior</option>
              <option value="year">Ano atual</option>
              <option value="all">Todos os períodos</option>
              <option value="custom">Período personalizado</option>
            </select>
            {filterPeriod === 'custom' && (
              <>
                <input type="date" className="fc" style={{ fontSize: 13, padding: '7px 10px' }} value={dtInicio} max={dtFim || today} onChange={e => setDtInicio(e.target.value)} />
                <input type="date" className="fc" style={{ fontSize: 13, padding: '7px 10px' }} value={dtFim} min={dtInicio} max={today} onChange={e => setDtFim(e.target.value)} />
              </>
            )}
            <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 200 }} value={filterSeller} onChange={e => setFilterSeller(e.target.value)}>
              <option value="">Todos os vendedores</option>
              {allSellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            {hasFilter && (
              <button className="btn bo bsm" onClick={() => { setFilterPeriod('month'); setFilterSeller(''); setDtInicio(''); setDtFim('') }}>
                <Icon n="x" s={13} /> Limpar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="sg">
        <div className="sc">
          <div className="sico" style={{ background: '#dcfce7' }}><Icon n="trend" s={20} c="#059669" /></div>
          <div className="sval" style={{ fontSize: 20 }}>{money(grandTotal, 'BRL')}</div>
          <div className="slbl2">Total Vendido</div>
        </div>
        <div className="sc" style={{ borderTopColor: 'var(--warn)' }}>
          <div className="sico" style={{ background: '#fef3c7' }}><Icon n="dolar" s={20} c="#d97706" /></div>
          <div className="sval" style={{ fontSize: 20 }}>{money(grandCommission, 'BRL')}</div>
          <div className="slbl2">Total em Comissões</div>
        </div>
        <div className="sc" style={{ borderTopColor: 'var(--sap5)' }}>
          <div className="sico" style={{ background: 'var(--sap1)' }}><Icon n="user" s={20} c="var(--sap7)" /></div>
          <div className="sval">{sellers.filter(s => s.commission).length}</div>
          <div className="slbl2">Vendedores c/ comissão</div>
        </div>
      </div>

      {/* Sellers */}
      {sellerData.length === 0 ? (
        <div className="es">
          <div style={{ marginBottom: 12, opacity: .3 }}><Icon n="user" s={48} /></div>
          <div className="estit">Nenhum vendedor cadastrado</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sellerData.map(d => (
            <div key={d.seller.id} className="card">
              <div className="cb">
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                  <div className="av" style={{ width: 48, height: 48, fontSize: 15, flexShrink: 0 }}>
                    {d.seller.avatar || d.seller.name?.substring(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 16 }}>{d.seller.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--mist)' }}>
                      {d.sales.length} venda(s) · {d.blockCount} bloco(s) · {d.seller.commission ? `${d.seller.commission_pct}% comissão` : 'sem comissão'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: 'var(--mist)' }}>Total vendido</div>
                    <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, color: 'var(--sap7)' }}>{money(d.totalBRL, 'BRL')}</div>
                  </div>
                  <div style={{ textAlign: 'right', paddingLeft: 14, borderLeft: '1px solid var(--fog)' }}>
                    <div style={{ fontSize: 11, color: 'var(--mist)' }}>Comissão</div>
                    <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 18, color: '#d97706' }}>
                      {money(d.commission, 'BRL')}
                    </div>
                  </div>
                  {d.sales.length > 0 && (
                    <button className="btn bo bsm" onClick={() => setExpandedSeller(expandedSeller === d.seller.id ? null : d.seller.id)}>
                      {expandedSeller === d.seller.id ? '▲ Ocultar' : '▼ Detalhes'}
                    </button>
                  )}
                </div>

                {/* Expanded sales */}
                {expandedSeller === d.seller.id && (
                  <div style={{ marginTop: 14, padding: 12, background: 'var(--haze)', borderRadius: 8 }}>
                    <div className="tw"><table>
                      <thead><tr>
                        <th>Data</th><th>Cliente</th><th>Total R$</th><th>Comissão</th>
                      </tr></thead>
                      <tbody>
                        {d.sales.map(s => {
                          const comm = d.seller.commission && d.seller.commission_pct > 0 ? (s.total_brl || 0) * (d.seller.commission_pct / 100) : 0
                          return (
                            <tr key={s.id}>
                              <td style={{ fontSize: 12, color: 'var(--mist)' }}>{fmtDate(s.created_at)}</td>
                              <td style={{ fontSize: 13 }}>{s.client?.name || '—'}</td>
                              <td style={{ fontWeight: 600 }}>{money(s.total_brl, 'BRL')}</td>
                              <td style={{ fontWeight: 700, color: '#d97706' }}>{comm > 0 ? money(comm, 'BRL') : '—'}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// NOTIFICATIONS PANEL — sino com lista dropdown
// ═══════════════════════════════════════════════════════════════
function NotificationsPanel({ profile, notifications, onChange, onClose }) {
  const unreadCount = notifications.filter(n => !n.read).length

  const markRead = async (id) => {
    try { await api.markNotificationRead(id); await onChange() } catch {}
  }

  const markAllRead = async () => {
    try { await api.markAllNotificationsRead(profile); await onChange() } catch {}
  }

  return (
    <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 340, maxHeight: 480, background: '#fff', border: '1px solid var(--fog)', borderRadius: 'var(--r-lg)', boxShadow: '0 12px 30px rgba(0,0,0,.15)', zIndex: 70, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--fog)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 15 }}>Notificações</div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--sap6)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            Marcar todas como lidas
          </button>
        )}
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: 30, textAlign: 'center', color: 'var(--mist)', fontSize: 13 }}>
            Nenhuma notificação
          </div>
        ) : (
          notifications.slice(0, 30).map(n => (
            <div key={n.id} onClick={() => !n.read && markRead(n.id)} style={{ padding: '12px 16px', borderBottom: '1px solid var(--fog)', cursor: n.read ? 'default' : 'pointer', background: n.read ? '#fff' : 'var(--sap1)' }}>
              <div style={{ fontSize: 13, marginBottom: 4, fontWeight: n.read ? 400 : 600 }}>{n.message}</div>
              <div style={{ fontSize: 11, color: 'var(--mist)' }}>{fmtDate(n.created_at)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// ADMIN PAGE — Stone Block /admin (gerenciamento de empresas)
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// IND — CONSTANTES E HELPERS COMUNS
// ═══════════════════════════════════════════════════════════════

// Helper para gerar volume a partir de medidas (igual ao da pedreira)
function calcVolume(l, h, w) {
  const lv = parseFloat(l) || 0
  const hv = parseFloat(h) || 0
  const wv = parseFloat(w) || 0
  return lv * hv * wv
}

// Compressão de foto (igual ao bucket original)
async function compressIndImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const maxDim = 1600
        let { width, height } = img
        if (width > height && width > maxDim) {
          height = (height * maxDim) / width
          width = maxDim
        } else if (height > maxDim) {
          width = (width * maxDim) / height
          height = maxDim
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => {
            const compressed = new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() })
            resolve(compressed)
          },
          'image/jpeg',
          0.82
        )
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

// ═══════════════════════════════════════════════════════════════
// IND EXTERNAL QUARRIES PAGE — cadastro de pedreiras externas
// ═══════════════════════════════════════════════════════════════
function IndExternalQuarriesPage({ profile, buyerData, onChange, toast }) {
  const quarries = buyerData?.externalQuarries || []
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', location: '', contact_phone: '', contact_email: '', notes: '',
  })

  const openNew = () => {
    setEditing(null)
    setForm({ name: '', location: '', contact_phone: '', contact_email: '', notes: '' })
    setShowForm(true)
  }

  const openEdit = (q) => {
    setEditing(q)
    setForm({
      name: q.name || '',
      location: q.location || '',
      contact_phone: q.contact_phone || '',
      contact_email: q.contact_email || '',
      notes: q.notes || '',
    })
    setShowForm(true)
  }

  const save = async () => {
    if (!form.name.trim()) { toast('Nome da pedreira obrigatório.', 'err'); return }
    setSaving(true)
    try {
      if (editing) {
        await api.updateExternalQuarry(editing.id, {
          name: form.name.trim(),
          location: form.location.trim() || null,
          contact_phone: form.contact_phone.trim() || null,
          contact_email: form.contact_email.trim() || null,
          notes: form.notes.trim() || null,
        })
        toast('Pedreira atualizada.', 'ok')
      } else {
        await api.findOrCreateExternalQuarry(profile, form.name.trim(), {
          location: form.location.trim(),
          contact_phone: form.contact_phone.trim(),
          contact_email: form.contact_email.trim(),
          notes: form.notes.trim(),
        })
        toast('Pedreira cadastrada.', 'ok')
      }
      setShowForm(false)
      onChange && onChange()
    } catch (e) { toast('Erro: ' + e.message, 'err') } finally { setSaving(false) }
  }

  const remove = async (q) => {
    if (!confirm(`Excluir a pedreira "${q.name}"? Isto não afeta blocos já cadastrados.`)) return
    try {
      await api.deleteExternalQuarry(q.id)
      toast('Pedreira excluída.', 'ok')
      onChange && onChange()
    } catch (e) { toast('Erro: ' + e.message, 'err') }
  }

  const filtered = search
    ? quarries.filter(q => (q.name || '').toLowerCase().includes(search.toLowerCase()))
    : quarries

  return (
    <div>
      <div className="ph">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="ptit">🏭 Pedreiras Externas</div>
            <div className="psub">{quarries.length} pedreira(s) cadastrada(s)</div>
          </div>
          <button className="btn bb" onClick={openNew}>
            <Icon n="plus" s={16} c="#fff" /> Nova Pedreira
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <input className="fc" style={{ maxWidth: 320 }} placeholder="🔍 Buscar pedreira..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="es">
          <div style={{ marginBottom: 12, opacity: .3 }}><Icon n="mtn" s={48} /></div>
          <div className="estit">{search ? 'Nenhuma pedreira encontrada' : 'Nenhuma pedreira cadastrada ainda'}</div>
          {!search && <div style={{ fontSize: 13, color: 'var(--mist)', marginTop: 8 }}>Clique em "Nova Pedreira" para começar.</div>}
        </div>
      ) : (
        <div className="card"><div className="tw"><table>
          <thead><tr>
            <th>Nome</th><th>Localização</th><th>Contato</th><th>Observações</th><th></th>
          </tr></thead>
          <tbody>
            {filtered.map(q => (
              <tr key={q.id}>
                <td style={{ fontWeight: 700 }}>{q.name}</td>
                <td style={{ fontSize: 13 }}>{q.location || '—'}</td>
                <td style={{ fontSize: 13 }}>
                  {q.contact_phone && <div>{q.contact_phone}</div>}
                  {q.contact_email && <div style={{ color: 'var(--mist)' }}>{q.contact_email}</div>}
                </td>
                <td style={{ fontSize: 13, color: 'var(--mist)', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.notes || '—'}</td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button className="btn bo bsm" onClick={() => openEdit(q)}>
                    <Icon n="edit" s={13} /> Editar
                  </button>
                  <button className="btn bo bsm" style={{ marginLeft: 6 }} onClick={() => remove(q)}>
                    <Icon n="trash" s={13} c="var(--err)" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div></div>
      )}

      {showForm && (
        <div className="mo" onClick={() => setShowForm(false)}>
          <div className="md" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div className="mhead">
              <div className="mtit">{editing ? '✏️ Editar Pedreira' : '🏭 Nova Pedreira'}</div>
              <button className="btn bo bsm" onClick={() => setShowForm(false)}><Icon n="x" s={14} /></button>
            </div>
            <div className="mbody">
              <div className="fg">
                <label className="fl">Nome da pedreira *</label>
                <input className="fc" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Pedreira do Vale" />
              </div>
              <div className="fg">
                <label className="fl">Localização</label>
                <input className="fc" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Cidade / Estado" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="fg">
                  <label className="fl">Telefone</label>
                  <input className="fc" value={form.contact_phone} onChange={e => setForm({ ...form, contact_phone: e.target.value })} />
                </div>
                <div className="fg">
                  <label className="fl">E-mail</label>
                  <input className="fc" type="email" value={form.contact_email} onChange={e => setForm({ ...form, contact_email: e.target.value })} />
                </div>
              </div>
              <div className="fg">
                <label className="fl">Observações</label>
                <textarea className="fc" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} />
              </div>
            </div>
            <div className="mfoot">
              <button className="btn bo" onClick={() => setShowForm(false)}>Cancelar</button>
              <button className="btn bb" onClick={save} disabled={saving}>
                {saving ? <><span className="spinner"></span> Salvando</> : (editing ? 'Salvar' : 'Cadastrar')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// IND SEARCH BLOCK PAGE — buscar bloco por código em pedreiras Stone Block
// ═══════════════════════════════════════════════════════════════
function IndSearchBlockPage({ profile, buyerData, onChange, toast, onCreateExternal }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null) // null=ainda não pesquisou, []=sem resultados
  const [searching, setSearching] = useState(false)
  const [selectedBlock, setSelectedBlock] = useState(null)
  const [showInspection, setShowInspection] = useState(false)

  const doSearch = async () => {
    if (!query.trim()) { toast('Digite o código do bloco.', 'err'); return }
    setSearching(true)
    try {
      const found = await api.searchBlockByCode(query.trim())
      setResults(found || [])
    } catch (e) {
      toast('Erro na busca: ' + e.message, 'err')
      setResults([])
    } finally { setSearching(false) }
  }

  const startInspection = (block) => {
    setSelectedBlock(block)
    setShowInspection(true)
  }

  return (
    <div>
      <div className="ph">
        <div className="ptit">🔍 Buscar Bloco</div>
        <div className="psub">Digite o código do bloco que está vendo na pedreira</div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="cb">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              className="fc"
              style={{ flex: '1 1 280px', fontSize: 16, padding: '12px 14px', textTransform: 'uppercase' }}
              placeholder="Ex: P965, VMC45..."
              value={query}
              onChange={e => setQuery(e.target.value.toUpperCase())}
              onKeyDown={e => { if (e.key === 'Enter') doSearch() }}
              autoFocus
            />
            <button className="btn bb" onClick={doSearch} disabled={searching}>
              {searching ? <><span className="spinner"></span> Buscando</> : <><Icon n="cube" s={16} c="#fff" /> Buscar</>}
            </button>
          </div>
        </div>
      </div>

      {results === null && (
        <div className="es">
          <div style={{ marginBottom: 12, opacity: .3 }}><Icon n="cube" s={48} /></div>
          <div className="estit">Digite o código e clique em buscar</div>
          <div style={{ fontSize: 13, color: 'var(--mist)', marginTop: 8 }}>O sistema busca em todas as pedreiras Stone Block.</div>
        </div>
      )}

      {results && results.length === 0 && (
        <div className="card" style={{ borderTop: '4px solid #f59e0b' }}>
          <div className="cb" style={{ textAlign: 'center', padding: 32 }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>❌</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Bloco não encontrado</div>
            <div style={{ fontSize: 13, color: 'var(--mist)', marginBottom: 16 }}>
              O código <strong>{query}</strong> não está em nenhuma pedreira do Stone Block.
            </div>
            <div style={{ fontSize: 13, color: 'var(--mist)', marginBottom: 16 }}>
              Provavelmente é uma pedreira que não usa o sistema. Você pode cadastrar este bloco como bloco externo.
            </div>
            <button className="btn bb" onClick={() => onCreateExternal && onCreateExternal(query)}>
              <Icon n="plus" s={15} c="#fff" /> Cadastrar como Bloco Externo
            </button>
          </div>
        </div>
      )}

      {results && results.length > 0 && (
        <>
          <div style={{ fontSize: 13, color: 'var(--mist)', marginBottom: 12 }}>
            {results.length} resultado(s) encontrado(s)
          </div>
          <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))' }}>
            {results.map(b => {
              const photos = Array.isArray(b.photos) ? b.photos
                : (typeof b.photos === 'string' ? (b.photos.startsWith('[') ? JSON.parse(b.photos) : [b.photos]) : [])
              return (
                <div key={b.id} className="card" style={{ borderTop: '4px solid var(--sap6)' }}>
                  {photos[0] ? (
                    <div style={{ position: 'relative' }}>
                      <img src={photos[0]} alt={b.code} style={{ width: '100%', height: 180, objectFit: 'cover', background: 'var(--haze)', display: 'block' }} />
                      {photos.length > 1 && (
                        <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,.65)', color: '#fff', padding: '3px 9px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>
                          📷 {photos.length}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ height: 150, background: 'var(--haze)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon n="cube" s={32} c="var(--mist)" /></div>
                  )}
                  <div className="cb">
                    <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{b.code}</div>
                    <div style={{ fontSize: 13, marginBottom: 4 }}>{b.material}</div>
                    <div style={{ fontSize: 12, color: 'var(--mist)', marginBottom: 4 }}>Classif. {b.classification} · {(b.net_volume || 0).toFixed(2)} m³</div>
                    <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--sap7)', marginBottom: 10 }}>{money(b.total_value, b.currency)}</div>
                    <button className="btn bb" style={{ width: '100%' }} onClick={() => startInspection({ ...b, photos })}>
                      🔎 Iniciar Inspeção
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {showInspection && selectedBlock && (
        <IndInspectionFormModal
          profile={profile}
          block={selectedBlock}
          onClose={() => { setShowInspection(false); setSelectedBlock(null) }}
          onSaved={() => { setShowInspection(false); setSelectedBlock(null); onChange && onChange(); toast('Inspeção salva!', 'ok') }}
          toast={toast}
        />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// IND INSPECTION FORM MODAL — formulário de inspeção
// ═══════════════════════════════════════════════════════════════
function IndInspectionFormModal({ profile, block, existingInspection, inspectionId, onClose, onSaved, toast }) {
  const [photos, setPhotos] = useState(existingInspection?.photos || [])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    notes: existingInspection?.notes || '',
    negotiated_value: existingInspection?.negotiated_value || '',
    negotiated_currency: existingInspection?.negotiated_currency || block.currency || 'USD',
    // Medidas brutas
    negotiated_gross_l: existingInspection?.negotiated_gross_l || '',
    negotiated_gross_h: existingInspection?.negotiated_gross_h || '',
    negotiated_gross_w: existingInspection?.negotiated_gross_w || '',
    // Medidas líquidas
    negotiated_l: existingInspection?.negotiated_l || '',
    negotiated_h: existingInspection?.negotiated_h || '',
    negotiated_w: existingInspection?.negotiated_w || '',
  })

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    if (photos.length + files.length > 4) { toast('Máximo 4 fotos de inspeção.', 'err'); return }
    setUploading(true)
    try {
      const uploaded = []
      for (const f of files) {
        const compressed = await compressIndImage(f)
        const url = await api.uploadInspectionPhoto(profile, compressed, block.code)
        uploaded.push(url)
      }
      setPhotos([...photos, ...uploaded])
    } catch (e) { toast('Erro no upload: ' + e.message, 'err') } finally { setUploading(false); e.target.value = '' }
  }

  const removePhoto = (idx) => {
    setPhotos(photos.filter((_, i) => i !== idx))
  }

  const negotiatedGrossVolume = calcVolume(form.negotiated_gross_l, form.negotiated_gross_h, form.negotiated_gross_w)
  const negotiatedNetVolume = calcVolume(form.negotiated_l, form.negotiated_h, form.negotiated_w)

  const save = async () => {
    setSaving(true)
    try {
      const payload = {
        original_block_id: block.id,
        inspection_id: inspectionId || existingInspection?.inspection_id || null,
        photos,
        notes: form.notes.trim() || null,
        negotiated_value: form.negotiated_value ? parseFloat(form.negotiated_value) : null,
        negotiated_currency: form.negotiated_currency,
        negotiated_gross_l: form.negotiated_gross_l ? parseFloat(form.negotiated_gross_l) : null,
        negotiated_gross_h: form.negotiated_gross_h ? parseFloat(form.negotiated_gross_h) : null,
        negotiated_gross_w: form.negotiated_gross_w ? parseFloat(form.negotiated_gross_w) : null,
        negotiated_l: form.negotiated_l ? parseFloat(form.negotiated_l) : null,
        negotiated_h: form.negotiated_h ? parseFloat(form.negotiated_h) : null,
        negotiated_w: form.negotiated_w ? parseFloat(form.negotiated_w) : null,
      }
      if (existingInspection) {
        await api.updateInspection(existingInspection.id, payload)
        toast('Inspeção atualizada!', 'ok')
      } else {
        const result = await api.createInspection(profile, payload)
        if (!result) throw new Error('Falha ao criar inspeção')
        toast('Bloco inspecionado!', 'ok')
      }
      // Garante que a tela de origem recarregue os dados antes de fechar
      if (onSaved) await onSaved()
    } catch (e) { 
      console.error('Erro ao salvar inspeção:', e)
      toast('Erro: ' + e.message, 'err')
    } finally { 
      setSaving(false) 
    }
  }

  const officialPhotos = Array.isArray(block.photos) ? block.photos : []
  // Preço por m³ original
  const originalPriceM3 = block.price_m3 || (block.net_volume > 0 ? (block.total_value / block.net_volume) : 0)

  return (
    <div className="mo" onClick={onClose}>
      <div className="md" style={{ maxWidth: 1100 }} onClick={e => e.stopPropagation()}>
        <div className="mhead">
          <div>
            <div className="mtit">{existingInspection ? '✏️ Editar Inspeção' : '🔎 Nova Inspeção'} — {block.code}</div>
            <div style={{ fontSize: 13, color: 'var(--mist)', marginTop: 4 }}>{block.material}</div>
          </div>
          <button className="btn bo bsm" onClick={onClose}><Icon n="x" s={14} /></button>
        </div>
        <div className="mbody">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(380px,1fr))', gap: 16 }}>
            {/* Esquerda: dados oficiais da pedreira */}
            <div style={{ background: 'var(--haze)', padding: 14, borderRadius: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--mist)', marginBottom: 10 }}>
                📷 Dados oficiais da pedreira
              </div>
              <PhotoGallery photos={officialPhotos} height={280} />
              
              {/* Informações básicas */}
              <div style={{ marginTop: 12, fontSize: 13, lineHeight: 1.7 }}>
                <div><strong>Código:</strong> {block.code}{block.sys_code ? ` (${block.sys_code})` : ''}</div>
                <div><strong>Material:</strong> {block.material}</div>
                <div><strong>Classificação:</strong> {block.classification}</div>
                {block.prod_date && <div><strong>Data produção:</strong> {fmtDate(block.prod_date)}</div>}
              </div>

              {/* Medidas brutas */}
              <div style={{ background: '#fff', padding: 10, borderRadius: 8, marginTop: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--mist)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                  Medidas brutas
                </div>
                {block.gross_l ? (
                  <>
                    <div style={{ fontSize: 13 }}>C: {block.gross_l} m · A: {block.gross_h} m · L: {block.gross_w} m</div>
                    <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>Vol: {(block.gross_volume || 0).toFixed(2)} m³</div>
                  </>
                ) : <div style={{ fontSize: 12, color: 'var(--mist)' }}>—</div>}
              </div>

              {/* Medidas líquidas */}
              <div style={{ background: '#dcfce7', padding: 10, borderRadius: 8, marginTop: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                  Medidas líquidas
                </div>
                {block.net_l ? (
                  <>
                    <div style={{ fontSize: 13 }}>C: {block.net_l} m · A: {block.net_h} m · L: {block.net_w} m</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#15803d', marginTop: 2 }}>Vol: {(block.net_volume || 0).toFixed(2)} m³</div>
                  </>
                ) : <div style={{ fontSize: 12, color: 'var(--mist)' }}>—</div>}
              </div>

              {/* Valor por m³ + Valor total */}
              <div style={{ background: 'var(--sap1)', padding: 10, borderRadius: 8, marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: 'var(--sap7)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5 }}>Preço m³</span>
                  <span style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--sap7)' }}>{money(originalPriceM3, block.currency)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'var(--sap7)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5 }}>Total</span>
                  <span style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 18, color: 'var(--sap7)' }}>{money(block.total_value, block.currency)}</span>
                </div>
              </div>
            </div>

            {/* Direita: campos da inspeção */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--mist)', marginBottom: 10 }}>
                ✍️ Sua inspeção
              </div>

              {/* Upload de fotos */}
              <div className="fg">
                <label className="fl">Fotos de inspeção ({photos.length}/4)</label>
                {photos.length < 4 && (
                  <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} disabled={uploading} style={{ fontSize: 13 }} />
                )}
                {uploading && <div style={{ fontSize: 12, color: 'var(--mist)', marginTop: 4 }}><span className="spinner"></span> Enviando...</div>}
                {photos.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    {photos.map((url, i) => (
                      <div key={i} style={{ position: 'relative' }}>
                        <img src={url} alt="" style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 6 }} />
                        <button onClick={() => removePhoto(i)} style={{ position: 'absolute', top: -6, right: -6, background: 'var(--err)', color: '#fff', border: 'none', width: 20, height: 20, borderRadius: '50%', cursor: 'pointer', fontSize: 11, lineHeight: 1 }}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="fg">
                <label className="fl">Observações internas</label>
                <textarea className="fc" rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>

              <div style={{ background: 'var(--sap1)', padding: 12, borderRadius: 8, marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--sap7)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                  💰 Valor negociado
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8 }}>
                  <select className="fc" value={form.negotiated_currency} onChange={e => setForm({ ...form, negotiated_currency: e.target.value })}>
                    <option value="USD">USD (US$)</option>
                    <option value="BRL">BRL (R$)</option>
                  </select>
                  <input className="fc" type="number" step="0.01" value={form.negotiated_value} onChange={e => setForm({ ...form, negotiated_value: e.target.value })} placeholder="1800.00" />
                </div>
              </div>

              {/* Medidas brutas negociadas */}
              <div style={{ background: '#f3f4f6', padding: 12, borderRadius: 8, marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--mist)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                  📐 Medidas brutas negociadas
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                  <input className="fc" type="number" step="0.01" placeholder="comp" value={form.negotiated_gross_l} onChange={e => setForm({ ...form, negotiated_gross_l: e.target.value })} />
                  <input className="fc" type="number" step="0.01" placeholder="alt" value={form.negotiated_gross_h} onChange={e => setForm({ ...form, negotiated_gross_h: e.target.value })} />
                  <input className="fc" type="number" step="0.01" placeholder="larg" value={form.negotiated_gross_w} onChange={e => setForm({ ...form, negotiated_gross_w: e.target.value })} />
                </div>
                {negotiatedGrossVolume > 0 && (
                  <div style={{ fontSize: 13, marginTop: 6, fontWeight: 700 }}>Volume bruto: {negotiatedGrossVolume.toFixed(2)} m³</div>
                )}
              </div>

              {/* Medidas líquidas negociadas */}
              <div style={{ background: '#dcfce7', padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                  📐 Medidas líquidas negociadas
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                  <input className="fc" type="number" step="0.01" placeholder="comp" value={form.negotiated_l} onChange={e => setForm({ ...form, negotiated_l: e.target.value })} />
                  <input className="fc" type="number" step="0.01" placeholder="alt" value={form.negotiated_h} onChange={e => setForm({ ...form, negotiated_h: e.target.value })} />
                  <input className="fc" type="number" step="0.01" placeholder="larg" value={form.negotiated_w} onChange={e => setForm({ ...form, negotiated_w: e.target.value })} />
                </div>
                {negotiatedNetVolume > 0 && (
                  <div style={{ fontSize: 13, marginTop: 6, fontWeight: 700, color: '#15803d' }}>Volume líquido: {negotiatedNetVolume.toFixed(2)} m³</div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="mfoot">
          <button className="btn bo" onClick={onClose}>Cancelar</button>
          <button className="btn bb" onClick={save} disabled={saving || uploading}>
            {saving ? <><span className="spinner"></span> Salvando</> : 'Salvar Inspeção'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// IND EXTERNAL BLOCK FORM PAGE — cadastrar bloco em pedreira não-Stone Block
// ═══════════════════════════════════════════════════════════════
function IndExternalBlockFormPage({ profile, buyerData, onChange, toast, prefillCode, onDone }) {
  const externalQuarries = buyerData?.externalQuarries || []
  const [photos, setPhotos] = useState([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showNewQuarryForm, setShowNewQuarryForm] = useState(false)
  const [newQuarryName, setNewQuarryName] = useState('')
  const [form, setForm] = useState({
    external_quarry_id: '',
    code: (prefillCode || '').toUpperCase(),
    material: '',
    classification: 'A',
    prod_date: new Date().toISOString().slice(0, 10),
    gross_l: '', gross_h: '', gross_w: '',
    net_l: '', net_h: '', net_w: '',
    currency: 'USD',
    price_m3: '',
    notes: '',
  })

  // Cálculos automáticos
  const grossVolume = calcVolume(form.gross_l, form.gross_h, form.gross_w)
  const netVolume = calcVolume(form.net_l, form.net_h, form.net_w)
  const totalValue = netVolume * (parseFloat(form.price_m3) || 0)

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    if (photos.length + files.length > 4) { toast('Máximo 4 fotos.', 'err'); return }
    setUploading(true)
    try {
      const uploaded = []
      for (const f of files) {
        const compressed = await compressIndImage(f)
        const url = await api.uploadInspectionPhoto(profile, compressed, form.code || 'external')
        uploaded.push(url)
      }
      setPhotos([...photos, ...uploaded])
    } catch (e) { toast('Erro no upload: ' + e.message, 'err') } finally { setUploading(false); e.target.value = '' }
  }

  const removePhoto = (idx) => setPhotos(photos.filter((_, i) => i !== idx))

  const handleCreateQuarry = async () => {
    if (!newQuarryName.trim()) { toast('Digite o nome.', 'err'); return }
    try {
      const q = await api.findOrCreateExternalQuarry(profile, newQuarryName.trim())
      toast('Pedreira criada.', 'ok')
      setShowNewQuarryForm(false)
      setNewQuarryName('')
      // Aguarda recarregar dados antes de selecionar
      onChange && (await onChange())
      setForm(prev => ({ ...prev, external_quarry_id: q.id }))
    } catch (e) { toast('Erro: ' + e.message, 'err') }
  }

  const save = async () => {
    if (!form.external_quarry_id) { toast('Selecione ou cadastre a pedreira.', 'err'); return }
    if (!form.code.trim()) { toast('Código obrigatório.', 'err'); return }
    if (!form.material.trim()) { toast('Material obrigatório.', 'err'); return }
    if (photos.length === 0) { toast('Adicione pelo menos 1 foto.', 'err'); return }
    setSaving(true)
    try {
      await api.createExternalBlock(profile, {
        external_quarry_id: form.external_quarry_id,
        code: form.code.trim().toUpperCase(),
        material: form.material.trim(),
        classification: form.classification,
        prod_date: form.prod_date || null,
        gross_l: parseFloat(form.gross_l) || null,
        gross_h: parseFloat(form.gross_h) || null,
        gross_w: parseFloat(form.gross_w) || null,
        gross_volume: grossVolume || null,
        net_l: parseFloat(form.net_l) || null,
        net_h: parseFloat(form.net_h) || null,
        net_w: parseFloat(form.net_w) || null,
        net_volume: netVolume || null,
        currency: form.currency,
        price_m3: parseFloat(form.price_m3) || null,
        total_value: totalValue || null,
        photos,
        notes: form.notes.trim() || null,
        status: 'pending',
      })
      toast('Bloco externo cadastrado!', 'ok')
      onChange && onChange()
      onDone && onDone()
    } catch (e) { toast('Erro: ' + e.message, 'err') } finally { setSaving(false) }
  }

  return (
    <div>
      <div className="ph">
        <div className="ptit">➕ Cadastrar Bloco Externo</div>
        <div className="psub">Bloco de pedreira que não usa o Stone Block</div>
      </div>

      <div className="card">
        <div className="cb">
          {/* Pedreira */}
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--mist)', marginBottom: 10 }}>
            🏭 Pedreira
          </div>
          <div className="fg">
            <label className="fl">Selecione a pedreira *</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <select className="fc" style={{ flex: 1 }} value={form.external_quarry_id} onChange={e => setForm({ ...form, external_quarry_id: e.target.value })}>
                <option value="">Selecione...</option>
                {externalQuarries.map(q => <option key={q.id} value={q.id}>{q.name}{q.location ? ` — ${q.location}` : ''}</option>)}
              </select>
              <button className="btn bo bsm" onClick={() => setShowNewQuarryForm(true)}>+ Nova</button>
            </div>
            {showNewQuarryForm && (
              <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                <input className="fc" placeholder="Nome da nova pedreira" value={newQuarryName} onChange={e => setNewQuarryName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleCreateQuarry() }} />
                <button className="btn bb bsm" onClick={handleCreateQuarry}>Criar</button>
                <button className="btn bo bsm" onClick={() => { setShowNewQuarryForm(false); setNewQuarryName('') }}>×</button>
              </div>
            )}
          </div>

          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--mist)', marginTop: 16, marginBottom: 10, paddingTop: 12, borderTop: '1px solid var(--fog)' }}>
            📦 Dados do bloco
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="fg">
              <label className="fl">Código *</label>
              <input className="fc" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="Ex: PV-001" style={{ textTransform: 'uppercase' }} autoCapitalize="characters" />
            </div>
            <div className="fg">
              <label className="fl">Material *</label>
              <input className="fc" value={form.material} onChange={e => setForm({ ...form, material: e.target.value })} placeholder="Ex: PATAGONIA" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="fg">
              <label className="fl">Classificação</label>
              <select className="fc" value={form.classification} onChange={e => setForm({ ...form, classification: e.target.value })}>
                <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
              </select>
            </div>
            <div className="fg">
              <label className="fl">Data de produção</label>
              <input type="date" className="fc" value={form.prod_date} onChange={e => setForm({ ...form, prod_date: e.target.value })} />
            </div>
          </div>

          {/* Medidas */}
          <div style={{ background: '#f3f4f6', padding: 12, borderRadius: 8, marginTop: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--mist)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>📐 Medidas brutas</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
              <input className="fc" type="number" step="0.01" placeholder="comp" value={form.gross_l} onChange={e => setForm({ ...form, gross_l: e.target.value })} />
              <input className="fc" type="number" step="0.01" placeholder="alt" value={form.gross_h} onChange={e => setForm({ ...form, gross_h: e.target.value })} />
              <input className="fc" type="number" step="0.01" placeholder="larg" value={form.gross_w} onChange={e => setForm({ ...form, gross_w: e.target.value })} />
            </div>
            {grossVolume > 0 && <div style={{ fontSize: 13, marginTop: 6, fontWeight: 700 }}>Volume bruto: {grossVolume.toFixed(2)} m³</div>}
          </div>

          <div style={{ background: 'var(--sap1)', padding: 12, borderRadius: 8, marginTop: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--sap7)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>📐 Medidas líquidas</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
              <input className="fc" type="number" step="0.01" placeholder="comp" value={form.net_l} onChange={e => setForm({ ...form, net_l: e.target.value })} />
              <input className="fc" type="number" step="0.01" placeholder="alt" value={form.net_h} onChange={e => setForm({ ...form, net_h: e.target.value })} />
              <input className="fc" type="number" step="0.01" placeholder="larg" value={form.net_w} onChange={e => setForm({ ...form, net_w: e.target.value })} />
            </div>
            {netVolume > 0 && <div style={{ fontSize: 13, marginTop: 6, fontWeight: 700, color: 'var(--sap7)' }}>Volume líquido: {netVolume.toFixed(2)} m³</div>}
          </div>

          {/* Valor */}
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8, marginTop: 12 }}>
            <div className="fg">
              <label className="fl">Moeda</label>
              <select className="fc" value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}>
                <option value="USD">USD (US$)</option>
                <option value="BRL">BRL (R$)</option>
              </select>
            </div>
            <div className="fg">
              <label className="fl">Preço por m³</label>
              <input className="fc" type="number" step="0.01" value={form.price_m3} onChange={e => setForm({ ...form, price_m3: e.target.value })} />
            </div>
          </div>

          {totalValue > 0 && (
            <div style={{ padding: 12, background: 'linear-gradient(135deg,#0c1a2e,#1e3a8a)', borderRadius: 8, marginTop: 8 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.7)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Valor total</div>
              <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 24, color: '#fff' }}>{money(totalValue, form.currency)}</div>
            </div>
          )}

          {/* Fotos */}
          <div className="fg" style={{ marginTop: 16 }}>
            <label className="fl">Fotos do bloco ({photos.length}/4) *</label>
            {photos.length < 4 && (
              <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} disabled={uploading} style={{ fontSize: 13 }} />
            )}
            {uploading && <div style={{ fontSize: 12, color: 'var(--mist)', marginTop: 4 }}><span className="spinner"></span> Enviando...</div>}
            {photos.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {photos.map((url, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={url} alt="" style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 6 }} />
                    <button onClick={() => removePhoto(i)} style={{ position: 'absolute', top: -6, right: -6, background: 'var(--err)', color: '#fff', border: 'none', width: 20, height: 20, borderRadius: '50%', cursor: 'pointer', fontSize: 11, lineHeight: 1 }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="fg">
            <label className="fl">Observações</label>
            <textarea className="fc" rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
            {onDone && <button className="btn bo" onClick={onDone}>Cancelar</button>}
            <button className="btn bb" onClick={save} disabled={saving || uploading}>
              {saving ? <><span className="spinner"></span> Salvando</> : 'Cadastrar Bloco'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// IND INSPECTIONS LIST — lista de blocos inspecionados
// ═══════════════════════════════════════════════════════════════
function IndInspectionsListPage({ profile, buyerData, onChange, toast }) {
  const inspections = buyerData?.inspections || []
  const team = buyerData?.team || []
  const [originalBlocks, setOriginalBlocks] = useState({})
  const [detailInspection, setDetailInspection] = useState(null)
  const [search, setSearch] = useState('')
  const [filterMarker, setFilterMarker] = useState('')

  // Carrega dados dos blocos originais
  useEffect(() => {
    const loadOriginals = async () => {
      const ids = [...new Set(inspections.map(i => i.original_block_id))]
      if (ids.length === 0) return
      try {
        const map = {}
        for (const id of ids) {
          const { data } = await supabase.from('blocks').select('*').eq('id', id).maybeSingle()
          if (data) {
            map[id] = {
              ...data,
              photos: Array.isArray(data.photos) ? data.photos
                : (typeof data.photos === 'string' ? (data.photos.startsWith('[') ? JSON.parse(data.photos) : [data.photos]) : []),
            }
          }
        }
        setOriginalBlocks(map)
      } catch (e) { console.error('load originals:', e) }
    }
    loadOriginals()
  }, [inspections])

  const filtered = inspections.filter(i => {
    if (filterMarker && i.marker_id !== filterMarker) return false
    if (search) {
      const orig = originalBlocks[i.original_block_id]
      const code = (orig?.code || '').toLowerCase()
      if (!code.includes(search.toLowerCase())) return false
    }
    return true
  })

  const remove = async (i) => {
    if (!confirm('Excluir esta inspeção?')) return
    try {
      await api.deleteInspection(i.id)
      toast('Inspeção excluída.', 'ok')
      setDetailInspection(null)
      onChange && onChange()
    } catch (e) { toast('Erro: ' + e.message, 'err') }
  }

  return (
    <div>
      <div className="ph">
        <div className="ptit">📦 Blocos Inspecionados</div>
        <div className="psub">{filtered.length} inspeção(ões) {search || filterMarker ? `de ${inspections.length}` : ''}</div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="fc" style={{ flex: '0 1 240px', fontSize: 13, padding: '7px 12px', textTransform: 'uppercase' }} placeholder="🔍 Código do bloco..." value={search} onChange={e => setSearch(e.target.value.toUpperCase())} />
        <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 200 }} value={filterMarker} onChange={e => setFilterMarker(e.target.value)}>
          <option value="">Todos os marcadores</option>
          {team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        {(search || filterMarker) && (
          <button className="btn bo bsm" onClick={() => { setSearch(''); setFilterMarker('') }}>
            <Icon n="x" s={13} /> Limpar
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="es">
          <div style={{ marginBottom: 12, opacity: .3 }}><Icon n="cube" s={48} /></div>
          <div className="estit">{inspections.length === 0 ? 'Nenhuma inspeção ainda' : 'Nenhuma inspeção encontrada'}</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))' }}>
          {filtered.map(i => {
            const orig = originalBlocks[i.original_block_id]
            const marker = team.find(m => m.id === i.marker_id)
            const cardPhoto = (i.photos && i.photos[0]) || (orig?.photos && orig.photos[0])
            return (
              <div key={i.id} className="card" style={{ cursor: 'pointer', borderTop: '4px solid var(--sap6)' }} onClick={() => setDetailInspection({ inspection: i, original: orig, marker })}>
                {cardPhoto ? (
                  <div style={{ position: 'relative' }}>
                    <img src={cardPhoto} alt="" style={{ width: '100%', height: 180, objectFit: 'cover', background: 'var(--haze)', display: 'block' }} />
                    {i.photos && i.photos.length > 0 && (
                      <div style={{ position: 'absolute', top: 8, left: 8, background: '#10b981', color: '#fff', padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>
                        ✓ Inspecionado
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ height: 150, background: 'var(--haze)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon n="cube" s={32} c="var(--mist)" /></div>
                )}
                <div className="cb">
                  <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{orig?.code || '?'}</div>
                  <div style={{ fontSize: 13, marginBottom: 6 }}>{orig?.material || '—'}</div>
                  <div style={{ fontSize: 12, color: 'var(--mist)', marginBottom: 6 }}>
                    Por <strong>{marker?.name || '—'}</strong> · {fmtDate(i.created_at)}
                  </div>
                  {i.negotiated_value && (
                    <div style={{ fontSize: 13, marginBottom: 4 }}>
                      <span style={{ color: 'var(--mist)' }}>Original: </span>{money(orig?.total_value, orig?.currency)}<br/>
                      <span style={{ color: '#059669', fontWeight: 700 }}>Negociado: {money(i.negotiated_value, i.negotiated_currency)}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {detailInspection && (
        <IndInspectionDetailModal
          profile={profile}
          buyerData={buyerData}
          inspection={detailInspection.inspection}
          original={detailInspection.original}
          marker={detailInspection.marker}
          onClose={() => setDetailInspection(null)}
          onEdit={() => {}}
          onDelete={() => remove(detailInspection.inspection)}
          onChange={onChange}
          toast={toast}
        />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// IND INSPECTION DETAIL — modal de detalhe (fotos lado a lado)
// ═══════════════════════════════════════════════════════════════
function IndInspectionDetailModal({ profile, buyerData, inspection, original, marker, onClose, onDelete, onChange, toast }) {
  const [editing, setEditing] = useState(false)
  const [showListPicker, setShowListPicker] = useState(false)

  if (editing) {
    return (
      <IndInspectionFormModal
        profile={profile}
        block={original}
        existingInspection={inspection}
        onClose={() => setEditing(false)}
        onSaved={() => { setEditing(false); onClose(); onChange && onChange(); toast('Inspeção atualizada!', 'ok') }}
        toast={toast}
      />
    )
  }

  return (
    <div className="mo" onClick={onClose}>
      <div className="md" style={{ maxWidth: 1100 }} onClick={e => e.stopPropagation()}>
        <div className="mhead">
          <div>
            <div className="mtit">🔎 Inspeção — {original?.code || '?'}</div>
            <div style={{ fontSize: 13, color: 'var(--mist)', marginTop: 4 }}>
              {original?.material} · Por {marker?.name || '—'} em {fmtDate(inspection.created_at)}
            </div>
          </div>
          <button className="btn bo bsm" onClick={onClose}><Icon n="x" s={14} /></button>
        </div>
        <div className="mbody">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(380px,1fr))', gap: 16 }}>
            {/* Esquerda: pedreira */}
            <div style={{ background: 'var(--haze)', padding: 14, borderRadius: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--mist)', marginBottom: 10 }}>
                📷 Fotos oficiais da pedreira
              </div>
              <PhotoGallery photos={original?.photos || []} height={260} />
              <div style={{ marginTop: 12, fontSize: 13, lineHeight: 1.7 }}>
                <div><strong>Classif.:</strong> {original?.classification}</div>
                <div><strong>Volume líquido:</strong> {(original?.net_volume || 0).toFixed(2)} m³</div>
                {original?.net_l && <div><strong>Medidas:</strong> {original.net_l} × {original.net_h} × {original.net_w} m</div>}
                <div><strong>Valor original:</strong> <span style={{ color: 'var(--sap7)', fontWeight: 700 }}>{money(original?.total_value, original?.currency)}</span></div>
              </div>
            </div>

            {/* Direita: inspeção */}
            <div style={{ background: '#f0fdf4', padding: 14, borderRadius: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#15803d', marginBottom: 10 }}>
                ✍️ Fotos e dados da inspeção
              </div>
              {inspection.photos && inspection.photos.length > 0 ? (
                <PhotoGallery photos={inspection.photos} height={260} />
              ) : (
                <div style={{ height: 200, background: 'var(--haze)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
                  <span style={{ color: 'var(--mist)' }}>Sem fotos</span>
                </div>
              )}
              {inspection.notes && (
                <div style={{ marginTop: 12, background: '#fff', padding: 10, borderRadius: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--mist)', marginBottom: 4 }}>Observações</div>
                  <div style={{ fontSize: 13 }}>{inspection.notes}</div>
                </div>
              )}
              {inspection.negotiated_value && (
                <div style={{ marginTop: 10, fontSize: 13 }}>
                  <strong>Negociado:</strong> <span style={{ color: '#059669', fontWeight: 700 }}>{money(inspection.negotiated_value, inspection.negotiated_currency)}</span>
                </div>
              )}
              {inspection.negotiated_l && (
                <div style={{ fontSize: 13 }}>
                  <strong>Medidas negociadas:</strong> {inspection.negotiated_l} × {inspection.negotiated_h} × {inspection.negotiated_w} m
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mfoot">
          <button className="btn bo" onClick={onDelete} style={{ color: 'var(--err)' }}>
            <Icon n="trash" s={14} c="var(--err)" /> Excluir
          </button>
          <button className="btn bo" onClick={() => setShowListPicker(true)}>
            ⭐ Adicionar à Lista
          </button>
          <button className="btn bb" onClick={() => setEditing(true)}>
            <Icon n="edit" s={14} c="#fff" /> Editar
          </button>
        </div>
      </div>
      {showListPicker && (
        <AddToListPicker
          profile={profile}
          buyerData={buyerData}
          itemType="inspection"
          itemId={inspection.id}
          onClose={() => setShowListPicker(false)}
          onAdded={() => { setShowListPicker(false); onChange && onChange() }}
          toast={toast}
        />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// IND EXTERNAL BLOCKS LIST — blocos externos cadastrados
// ═══════════════════════════════════════════════════════════════
function IndExternalBlocksListPage({ profile, buyerData, onChange, toast }) {
  const blocks = buyerData?.externalBlocks || []
  const team = buyerData?.team || []
  const quarries = buyerData?.externalQuarries || []
  const [detailBlock, setDetailBlock] = useState(null)
  const [search, setSearch] = useState('')
  const [filterQuarry, setFilterQuarry] = useState('')
  const [filterMarker, setFilterMarker] = useState('')

  const filtered = blocks.filter(b => {
    if (filterQuarry && b.external_quarry_id !== filterQuarry) return false
    if (filterMarker && b.marker_id !== filterMarker) return false
    if (search && !(b.code || '').toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const remove = async (b) => {
    if (!confirm(`Excluir o bloco ${b.code}?`)) return
    try {
      await api.deleteExternalBlock(b.id)
      toast('Bloco excluído.', 'ok')
      setDetailBlock(null)
      onChange && onChange()
    } catch (e) { toast('Erro: ' + e.message, 'err') }
  }

  return (
    <div>
      <div className="ph">
        <div className="ptit">📍 Blocos Externos</div>
        <div className="psub">{filtered.length} bloco(s) {(search || filterQuarry || filterMarker) ? `de ${blocks.length}` : ''}</div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="fc" style={{ flex: '0 1 200px', fontSize: 13, padding: '7px 12px', textTransform: 'uppercase' }} placeholder="🔍 Código..." value={search} onChange={e => setSearch(e.target.value.toUpperCase())} />
        <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 200 }} value={filterQuarry} onChange={e => setFilterQuarry(e.target.value)}>
          <option value="">Todas as pedreiras</option>
          {quarries.map(q => <option key={q.id} value={q.id}>{q.name}</option>)}
        </select>
        <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 200 }} value={filterMarker} onChange={e => setFilterMarker(e.target.value)}>
          <option value="">Todos os marcadores</option>
          {team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        {(search || filterQuarry || filterMarker) && (
          <button className="btn bo bsm" onClick={() => { setSearch(''); setFilterQuarry(''); setFilterMarker('') }}>
            <Icon n="x" s={13} /> Limpar
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="es">
          <div style={{ marginBottom: 12, opacity: .3 }}><Icon n="cube" s={48} /></div>
          <div className="estit">{blocks.length === 0 ? 'Nenhum bloco externo ainda' : 'Nenhum bloco encontrado'}</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))' }}>
          {filtered.map(b => {
            const q = quarries.find(x => x.id === b.external_quarry_id)
            const m = team.find(x => x.id === b.marker_id)
            return (
              <div key={b.id} className="card" style={{ cursor: 'pointer', borderTop: '4px solid #d97706' }} onClick={() => setDetailBlock({ block: b, quarry: q, marker: m })}>
                {b.photos && b.photos[0] ? (
                  <div style={{ position: 'relative' }}>
                    <img src={b.photos[0]} alt={b.code} style={{ width: '100%', height: 180, objectFit: 'cover', background: 'var(--haze)', display: 'block' }} />
                    {b.photos.length > 1 && (
                      <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,.65)', color: '#fff', padding: '3px 9px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>📷 {b.photos.length}</div>
                    )}
                  </div>
                ) : (
                  <div style={{ height: 150, background: 'var(--haze)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon n="cube" s={32} c="var(--mist)" /></div>
                )}
                <div className="cb">
                  <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{b.code}</div>
                  <div style={{ fontSize: 13, marginBottom: 4 }}>{b.material}</div>
                  <div style={{ fontSize: 12, color: 'var(--mist)', marginBottom: 4 }}>📍 {q?.name || '—'}</div>
                  <div style={{ fontSize: 11, color: 'var(--mist)', marginBottom: 6 }}>{m?.name || '—'} · {fmtDate(b.created_at)}</div>
                  <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--sap7)' }}>{money(b.total_value, b.currency)}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {detailBlock && (
        <IndExternalBlockDetailModal
          profile={profile}
          buyerData={buyerData}
          item={detailBlock}
          onClose={() => setDetailBlock(null)}
          onDelete={() => remove(detailBlock.block)}
          onChange={onChange}
          toast={toast}
        />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// IND EXTERNAL BLOCK DETAIL — modal de detalhe de bloco externo
// ═══════════════════════════════════════════════════════════════
function IndExternalBlockDetailModal({ profile, buyerData, item, onClose, onDelete, onChange, toast }) {
  const { block, quarry, marker } = item
  const [showListPicker, setShowListPicker] = useState(false)

  return (
    <div className="mo" onClick={onClose}>
      <div className="md" style={{ maxWidth: 800 }} onClick={e => e.stopPropagation()}>
        <div className="mhead">
          <div>
            <div className="mtit">📍 {block.code}</div>
            <div style={{ fontSize: 13, color: 'var(--mist)', marginTop: 4 }}>{block.material} · {quarry?.name || '—'}</div>
          </div>
          <button className="btn bo bsm" onClick={onClose}><Icon n="x" s={14} /></button>
        </div>
        <div className="mbody">
          <PhotoGallery photos={block.photos || []} height={420} />

          <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10 }}>
            <div className="sc" style={{ padding: 12 }}>
              <div className="slbl2">Classificação</div>
              <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 16 }}>{block.classification}</div>
            </div>
            <div className="sc" style={{ padding: 12 }}>
              <div className="slbl2">Vol. bruto</div>
              <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 16 }}>{(block.gross_volume || 0).toFixed(2)} m³</div>
            </div>
            <div className="sc" style={{ padding: 12 }}>
              <div className="slbl2">Vol. líquido</div>
              <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 16 }}>{(block.net_volume || 0).toFixed(2)} m³</div>
            </div>
            <div className="sc" style={{ padding: 12, borderTopColor: 'var(--sap5)' }}>
              <div className="slbl2">Valor</div>
              <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--sap7)' }}>{money(block.total_value, block.currency)}</div>
            </div>
          </div>

          {block.notes && (
            <div style={{ marginTop: 14, background: 'var(--haze)', padding: 12, borderRadius: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--mist)', marginBottom: 4 }}>Observações</div>
              <div style={{ fontSize: 13 }}>{block.notes}</div>
            </div>
          )}

          <div style={{ marginTop: 14, fontSize: 12, color: 'var(--mist)' }}>
            Cadastrado por <strong>{marker?.name || '—'}</strong> em {fmtDate(block.created_at)}
          </div>
        </div>
        <div className="mfoot">
          <button className="btn bo" onClick={onDelete} style={{ color: 'var(--err)' }}>
            <Icon n="trash" s={14} c="var(--err)" /> Excluir
          </button>
          <button className="btn bo" onClick={() => setShowListPicker(true)}>
            ⭐ Adicionar à Lista
          </button>
          <button className="btn bo" onClick={onClose}>Fechar</button>
        </div>
      </div>
      {showListPicker && (
        <AddToListPicker
          profile={profile}
          buyerData={buyerData}
          itemType="external"
          itemId={block.id}
          onClose={() => setShowListPicker(false)}
          onAdded={() => { setShowListPicker(false); onChange && onChange() }}
          toast={toast}
        />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// IND TEAM PAGE — gerenciamento de equipe (só diretor)
// ═══════════════════════════════════════════════════════════════
function IndTeamPage({ profile, buyerData, onChange, toast }) {
  const team = buyerData?.team || []
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', buyer_role: 'marker',
  })

  if (profile.buyer_role !== 'director') {
    return (
      <div className="es">
        <div style={{ marginBottom: 12, opacity: .3 }}><Icon n="user" s={48} /></div>
        <div className="estit">Acesso restrito</div>
        <div style={{ fontSize: 13, color: 'var(--mist)', marginTop: 8 }}>
          Apenas o diretor pode gerenciar a equipe.
        </div>
      </div>
    )
  }

  const openNew = () => {
    setEditing(null)
    setForm({ name: '', email: '', password: '', phone: '', buyer_role: 'marker' })
    setShowForm(true)
  }

  const openEdit = (m) => {
    setEditing(m)
    setForm({
      name: m.name || '',
      email: '',
      password: '',
      phone: m.phone || '',
      buyer_role: m.buyer_role || 'marker',
    })
    setShowForm(true)
  }

  const save = async () => {
    if (!form.name.trim()) { toast('Nome obrigatório.', 'err'); return }
    if (!editing) {
      if (!form.email.trim()) { toast('E-mail obrigatório.', 'err'); return }
      if (!form.password || form.password.length < 6) { toast('Senha mínima 6 caracteres.', 'err'); return }
    }
    setSaving(true)
    try {
      if (editing) {
        await api.updateBuyerTeamMember(editing.id, {
          name: form.name.trim(),
          phone: form.phone.trim() || null,
          buyer_role: form.buyer_role,
        })
        toast('Membro atualizado.', 'ok')
      } else {
        await api.createBuyerTeamMember(profile, form.email.trim(), form.password, {
          name: form.name.trim(),
          phone: form.phone.trim() || null,
          buyer_role: form.buyer_role,
        })
        toast('Membro cadastrado!', 'ok')
      }
      setShowForm(false)
      onChange && onChange()
    } catch (e) { toast('Erro: ' + e.message, 'err') } finally { setSaving(false) }
  }

  const revoke = async (m) => {
    if (!confirm(`Revogar o acesso de ${m.name}?\n\nO cadastro será preservado. Você pode reativar depois.`)) return
    try {
      await api.revokeBuyerTeamMember(m.id)
      toast('Acesso revogado.', 'ok')
      onChange && onChange()
    } catch (e) { toast('Erro: ' + e.message, 'err') }
  }

  const reactivate = async (m) => {
    try {
      await api.reactivateBuyerTeamMember(m.id)
      toast('Acesso reativado.', 'ok')
      onChange && onChange()
    } catch (e) { toast('Erro: ' + e.message, 'err') }
  }

  const remove = async (m) => {
    if (!confirm(`EXCLUIR ${m.name} permanentemente?\n\nO histórico de inspeções continuará mostrando o nome, mas o cadastro será apagado e não poderá ser reativado.`)) return
    try {
      await api.removeBuyerTeamMember(m.id)
      toast('Cadastro excluído.', 'ok')
      onChange && onChange()
    } catch (e) { toast('Erro: ' + e.message, 'err') }
  }

  // Diretor fica no topo, depois ativos, depois inativos
  const sorted = [...team].sort((a, b) => {
    if (a.id === profile.id) return -1
    if (b.id === profile.id) return 1
    const ar = a.buyer_role === 'director' ? 0 : 1
    const br = b.buyer_role === 'director' ? 0 : 1
    if (ar !== br) return ar - br
    const aa = a.is_active === false ? 1 : 0
    const ba = b.is_active === false ? 1 : 0
    if (aa !== ba) return aa - ba
    return (a.name || '').localeCompare(b.name || '')
  })

  const roleLabel = (r) => r === 'director' ? 'Diretor' : r === 'marker' ? 'Marcador' : r === 'assistant' ? 'Assistente' : '—'
  const roleColor = (r) => r === 'director' ? '#1d4ed8' : r === 'marker' ? '#059669' : '#d97706'

  return (
    <div>
      <div className="ph">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="ptit">👥 Equipe</div>
            <div className="psub">{team.filter(m => m.is_active !== false).length} membro(s) ativo(s) de {team.length}</div>
          </div>
          <button className="btn bb" onClick={openNew}>
            <Icon n="plus" s={16} c="#fff" /> Novo Membro
          </button>
        </div>
      </div>

      {team.length === 0 ? (
        <div className="es">
          <div style={{ marginBottom: 12, opacity: .3 }}><Icon n="user" s={48} /></div>
          <div className="estit">Cadastre membros da equipe</div>
        </div>
      ) : (
        <div className="card"><div className="tw"><table>
          <thead><tr>
            <th>Membro</th><th>Papel</th><th>Telefone</th><th>Status</th><th></th>
          </tr></thead>
          <tbody>
            {sorted.map(m => (
              <tr key={m.id} style={{ opacity: m.is_active === false ? 0.55 : 1 }}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="av" style={{ background: 'var(--sap5)', color: '#fff' }}>{m.avatar || m.name?.substring(0, 2).toUpperCase()}</div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{m.name}</div>
                      {m.id === profile.id && <div style={{ fontSize: 11, color: 'var(--mist)' }}>Você</div>}
                    </div>
                  </div>
                </td>
                <td>
                  <span className="bdg" style={{ background: roleColor(m.buyer_role) + '20', color: roleColor(m.buyer_role), padding: '4px 10px' }}>
                    {roleLabel(m.buyer_role)}
                  </span>
                </td>
                <td style={{ fontSize: 13 }}>{m.phone || '—'}</td>
                <td>
                  <span className="bdg" style={{ background: m.is_active === false ? '#fee2e2' : '#dcfce7', color: m.is_active === false ? '#991b1b' : '#15803d' }}>
                    {m.is_active === false ? '🚫 Revogado' : '✓ Ativo'}
                  </span>
                </td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {m.id !== profile.id && (
                    <>
                      <button className="btn bo bsm" onClick={() => openEdit(m)} title="Editar">
                        <Icon n="edit" s={13} />
                      </button>
                      {m.is_active === false ? (
                        <button className="btn bo bsm" style={{ marginLeft: 4 }} onClick={() => reactivate(m)} title="Reativar acesso">
                          ↻ Reativar
                        </button>
                      ) : (
                        <button className="btn bo bsm" style={{ marginLeft: 4 }} onClick={() => revoke(m)} title="Revogar acesso">
                          🚫 Revogar
                        </button>
                      )}
                      <button className="btn bo bsm" style={{ marginLeft: 4 }} onClick={() => remove(m)} title="Excluir cadastro">
                        <Icon n="trash" s={13} c="var(--err)" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table></div></div>
      )}

      {showForm && (
        <div className="mo" onClick={() => setShowForm(false)}>
          <div className="md" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div className="mhead">
              <div className="mtit">{editing ? '✏️ Editar Membro' : '👤 Novo Membro'}</div>
              <button className="btn bo bsm" onClick={() => setShowForm(false)}><Icon n="x" s={14} /></button>
            </div>
            <div className="mbody">
              <div className="fg">
                <label className="fl">Nome *</label>
                <input className="fc" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nome completo" />
              </div>
              {!editing && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div className="fg">
                    <label className="fl">E-mail *</label>
                    <input className="fc" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="usuario@empresa.com" />
                  </div>
                  <div className="fg">
                    <label className="fl">Senha *</label>
                    <input className="fc" type="text" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Mínimo 6 caracteres" />
                  </div>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="fg">
                  <label className="fl">Telefone</label>
                  <input className="fc" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="fg">
                  <label className="fl">Papel *</label>
                  <select className="fc" value={form.buyer_role} onChange={e => setForm({ ...form, buyer_role: e.target.value })}>
                    <option value="marker">Marcador</option>
                    <option value="assistant">Assistente</option>
                    <option value="director">Diretor</option>
                  </select>
                </div>
              </div>
              {!editing && (
                <div style={{ fontSize: 12, color: 'var(--mist)', marginTop: 8, lineHeight: 1.5 }}>
                  📋 Anote o e-mail e senha — você precisará passar para o membro acessar o sistema.
                </div>
              )}
            </div>
            <div className="mfoot">
              <button className="btn bo" onClick={() => setShowForm(false)}>Cancelar</button>
              <button className="btn bb" onClick={save} disabled={saving}>
                {saving ? <><span className="spinner"></span> Salvando</> : (editing ? 'Salvar' : 'Cadastrar')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// IND LISTS PAGE — listas de interesse (todas as listas)
// ═══════════════════════════════════════════════════════════════
function IndListsPage({ profile, buyerData, onChange, toast, setPage, setSelectedListId }) {
  const lists = buyerData?.lists || []
  const listItems = buyerData?.listItems || []
  const team = buyerData?.team || []
  const [showForm, setShowForm] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [saving, setSaving] = useState(false)

  const create = async () => {
    if (!newListName.trim()) { toast('Digite o nome da lista.', 'err'); return }
    setSaving(true)
    try {
      const list = await api.createInterestList(profile, newListName.trim())
      toast('Lista criada!', 'ok')
      setShowForm(false)
      setNewListName('')
      onChange && (await onChange())
      // Abre a lista direto
      if (list?.id && setSelectedListId && setPage) {
        setSelectedListId(list.id)
        setPage('ind_list_detail')
      }
    } catch (e) { toast('Erro: ' + e.message, 'err') } finally { setSaving(false) }
  }

  const remove = async (l) => {
    if (!confirm(`Excluir a lista "${l.name}"?\n\nOs blocos não são apagados, apenas a lista.`)) return
    try {
      await api.deleteList(l.id)
      toast('Lista excluída.', 'ok')
      onChange && onChange()
    } catch (e) { toast('Erro: ' + e.message, 'err') }
  }

  const open = (l) => {
    if (setSelectedListId && setPage) {
      setSelectedListId(l.id)
      setPage('ind_list_detail')
    }
  }

  // Conta itens por lista
  const itemsCount = (listId) => listItems.filter(it => it.list_id === listId).length

  return (
    <div>
      <div className="ph">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="ptit">⭐ Listas de Interesse</div>
            <div className="psub">{lists.length} lista(s) cadastrada(s)</div>
          </div>
          <button className="btn bb" onClick={() => setShowForm(true)}>
            <Icon n="plus" s={16} c="#fff" /> Nova Lista
          </button>
        </div>
      </div>

      {lists.length === 0 ? (
        <div className="es">
          <div style={{ marginBottom: 12, opacity: .3 }}><Icon n="check" s={48} /></div>
          <div className="estit">Nenhuma lista criada</div>
          <div style={{ fontSize: 13, color: 'var(--mist)', marginTop: 8 }}>
            Crie listas para organizar blocos por visita, por interesse ou por estratégia.
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))' }}>
          {lists.map(l => {
            const creator = team.find(t => t.id === l.created_by)
            const count = itemsCount(l.id)
            return (
              <div key={l.id} className="card" style={{ cursor: 'pointer', borderTop: '4px solid var(--warn)' }} onClick={() => open(l)}>
                <div className="cb">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                    <div style={{ fontSize: 32 }}>⭐</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 16 }}>{l.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--mist)', marginTop: 2 }}>
                        {count} bloco(s)
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--mist)' }}>
                    Por <strong>{creator?.name || '—'}</strong> em {fmtDate(l.created_at)}
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                    <button className="btn bb bsm" style={{ flex: 1 }} onClick={(e) => { e.stopPropagation(); open(l) }}>
                      Abrir
                    </button>
                    <button className="btn bo bsm" onClick={(e) => { e.stopPropagation(); remove(l) }} title="Excluir">
                      <Icon n="trash" s={13} c="var(--err)" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <div className="mo" onClick={() => setShowForm(false)}>
          <div className="md" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            <div className="mhead">
              <div className="mtit">⭐ Nova Lista</div>
              <button className="btn bo bsm" onClick={() => setShowForm(false)}><Icon n="x" s={14} /></button>
            </div>
            <div className="mbody">
              <div className="fg">
                <label className="fl">Nome da lista *</label>
                <input className="fc" value={newListName} onChange={e => setNewListName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') create() }}
                  placeholder="Ex: Visita Pedreira Holz 22/05" autoFocus />
              </div>
            </div>
            <div className="mfoot">
              <button className="btn bo" onClick={() => setShowForm(false)}>Cancelar</button>
              <button className="btn bb" onClick={create} disabled={saving}>
                {saving ? <><span className="spinner"></span> Criando</> : 'Criar Lista'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// IND LIST DETAIL PAGE — uma lista específica com seus blocos
// ═══════════════════════════════════════════════════════════════
function IndListDetailPage({ profile, buyerData, onChange, toast, listId, setPage }) {
  const lists = buyerData?.lists || []
  const listItems = buyerData?.listItems || []
  const inspections = buyerData?.inspections || []
  const externalBlocks = buyerData?.externalBlocks || []
  const team = buyerData?.team || []
  const externalQuarries = buyerData?.externalQuarries || []
  const [showAdd, setShowAdd] = useState(false)
  const [originalBlocks, setOriginalBlocks] = useState({})

  const list = lists.find(l => l.id === listId)
  const itemsHere = listItems.filter(it => it.list_id === listId)

  // Carrega blocos originais das inspeções (precisamos das fotos/dados da pedreira)
  useEffect(() => {
    const inspIds = itemsHere.filter(it => it.item_type === 'inspection').map(it => it.item_id)
    const blockOriginalIds = inspections.filter(i => inspIds.includes(i.id)).map(i => i.original_block_id)
    const uniqueIds = [...new Set(blockOriginalIds)]
    if (uniqueIds.length === 0) return
    ;(async () => {
      const map = {}
      for (const id of uniqueIds) {
        try {
          const { data } = await supabase.from('blocks').select('*').eq('id', id).maybeSingle()
          if (data) {
            map[id] = {
              ...data,
              photos: Array.isArray(data.photos) ? data.photos
                : (typeof data.photos === 'string' ? (data.photos.startsWith('[') ? JSON.parse(data.photos) : [data.photos]) : []),
            }
          }
        } catch (e) { console.error(e) }
      }
      setOriginalBlocks(map)
    })()
  }, [listId, inspections.length])

  if (!list) {
    return (
      <div className="es">
        <div className="estit">Lista não encontrada</div>
        <button className="btn bb" style={{ marginTop: 16 }} onClick={() => setPage && setPage('ind_lists')}>← Voltar para listas</button>
      </div>
    )
  }

  const removeItem = async (it) => {
    if (!confirm('Remover este bloco da lista?')) return
    try {
      await api.removeListItem(it.id)
      toast('Bloco removido da lista.', 'ok')
      onChange && onChange()
    } catch (e) { toast('Erro: ' + e.message, 'err') }
  }

  const removeList = async () => {
    if (!confirm(`Excluir a lista "${list.name}"?\n\nOs blocos não são apagados, apenas a lista.`)) return
    try {
      await api.deleteList(list.id)
      toast('Lista excluída.', 'ok')
      onChange && (await onChange())
      setPage && setPage('ind_lists')
    } catch (e) { toast('Erro: ' + e.message, 'err') }
  }

  const creator = team.find(t => t.id === list.created_by)

  return (
    <div>
      <div className="ph">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <button className="btn bo bsm" style={{ marginBottom: 8 }} onClick={() => setPage && setPage('ind_lists')}>← Listas</button>
            <div className="ptit">⭐ {list.name}</div>
            <div className="psub">
              {itemsHere.length} bloco(s) · Criada por {creator?.name || '—'} em {fmtDate(list.created_at)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn bb" onClick={() => setShowAdd(true)}>
              <Icon n="plus" s={15} c="#fff" /> Adicionar Blocos
            </button>
            <button className="btn bo" onClick={removeList}>
              <Icon n="trash" s={14} c="var(--err)" />
            </button>
          </div>
        </div>
      </div>

      {itemsHere.length === 0 ? (
        <div className="es">
          <div style={{ marginBottom: 12, opacity: .3 }}><Icon n="cube" s={48} /></div>
          <div className="estit">Lista vazia</div>
          <div style={{ fontSize: 13, color: 'var(--mist)', marginTop: 8 }}>Clique em "Adicionar Blocos" para começar.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))' }}>
          {itemsHere.map(it => {
            let block, code, material, photo, valor, currency, badge, badgeColor
            if (it.item_type === 'inspection') {
              const insp = inspections.find(i => i.id === it.item_id)
              const orig = insp ? originalBlocks[insp.original_block_id] : null
              block = insp
              code = orig?.code || '?'
              material = orig?.material || '—'
              photo = (insp?.photos && insp.photos[0]) || (orig?.photos && orig.photos[0])
              valor = insp?.negotiated_value || orig?.total_value
              currency = insp?.negotiated_currency || orig?.currency
              badge = '🔎 Inspeção'
              badgeColor = 'var(--sap6)'
            } else {
              const ext = externalBlocks.find(b => b.id === it.item_id)
              block = ext
              code = ext?.code || '?'
              material = ext?.material || '—'
              photo = ext?.photos && ext.photos[0]
              valor = ext?.total_value
              currency = ext?.currency
              badge = '📍 Externo'
              badgeColor = '#d97706'
            }
            return (
              <div key={it.id} className="card" style={{ borderTop: `4px solid ${badgeColor}` }}>
                {photo ? (
                  <img src={photo} alt={code} style={{ width: '100%', height: 160, objectFit: 'cover', background: 'var(--haze)', display: 'block' }} />
                ) : (
                  <div style={{ height: 140, background: 'var(--haze)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon n="cube" s={32} c="var(--mist)" /></div>
                )}
                <div className="cb">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 16 }}>{code}</div>
                    <span className="bdg" style={{ background: badgeColor + '20', color: badgeColor, fontSize: 10, padding: '2px 6px' }}>{badge}</span>
                  </div>
                  <div style={{ fontSize: 13, marginBottom: 6 }}>{material}</div>
                  <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--sap7)', marginBottom: 10 }}>
                    {valor ? money(valor, currency) : '—'}
                  </div>
                  <button className="btn bo bsm" style={{ width: '100%' }} onClick={() => removeItem(it)}>
                    <Icon n="x" s={13} /> Remover da lista
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showAdd && (
        <AddBlocksToListModal
          profile={profile}
          buyerData={buyerData}
          listId={listId}
          existingItemIds={itemsHere.map(it => ({ type: it.item_type, id: it.item_id }))}
          onClose={() => setShowAdd(false)}
          onAdded={() => { setShowAdd(false); onChange && onChange(); toast('Blocos adicionados.', 'ok') }}
          toast={toast}
        />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// ADD BLOCKS TO LIST MODAL — seletor de blocos
// ═══════════════════════════════════════════════════════════════
function AddBlocksToListModal({ profile, buyerData, listId, existingItemIds, onClose, onAdded, toast }) {
  const inspections = buyerData?.inspections || []
  const externalBlocks = buyerData?.externalBlocks || []
  const [selected, setSelected] = useState(new Set())
  const [search, setSearch] = useState('')
  const [originalBlocks, setOriginalBlocks] = useState({})
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('inspections') // 'inspections' | 'external'

  useEffect(() => {
    const ids = [...new Set(inspections.map(i => i.original_block_id))]
    if (ids.length === 0) return
    ;(async () => {
      const map = {}
      for (const id of ids) {
        try {
          const { data } = await supabase.from('blocks').select('id, code, material, photos').eq('id', id).maybeSingle()
          if (data) map[id] = data
        } catch (e) {}
      }
      setOriginalBlocks(map)
    })()
  }, [inspections.length])

  const isAlready = (type, id) => existingItemIds.some(e => e.type === type && e.id === id)

  const toggleSel = (type, id) => {
    const key = `${type}:${id}`
    const ns = new Set(selected)
    if (ns.has(key)) ns.delete(key)
    else ns.add(key)
    setSelected(ns)
  }

  const filteredInspections = inspections.filter(i => {
    if (isAlready('inspection', i.id)) return false
    if (!search) return true
    const orig = originalBlocks[i.original_block_id]
    return (orig?.code || '').toLowerCase().includes(search.toLowerCase())
  })

  const filteredExternal = externalBlocks.filter(b => {
    if (isAlready('external', b.id)) return false
    if (!search) return true
    return (b.code || '').toLowerCase().includes(search.toLowerCase())
  })

  const save = async () => {
    if (selected.size === 0) { toast('Selecione ao menos 1 bloco.', 'err'); return }
    setSaving(true)
    try {
      for (const key of selected) {
        const [type, id] = key.split(':')
        await api.addListItem(listId, type, id, profile)
      }
      onAdded && onAdded()
    } catch (e) { toast('Erro: ' + e.message, 'err') } finally { setSaving(false) }
  }

  return (
    <div className="mo" onClick={onClose}>
      <div className="md" style={{ maxWidth: 760 }} onClick={e => e.stopPropagation()}>
        <div className="mhead">
          <div className="mtit">➕ Adicionar Blocos à Lista</div>
          <button className="btn bo bsm" onClick={onClose}><Icon n="x" s={14} /></button>
        </div>
        <div className="mbody">
          <input className="fc" style={{ marginBottom: 10, textTransform: 'uppercase' }} placeholder="🔍 Buscar por código..." value={search} onChange={e => setSearch(e.target.value.toUpperCase())} />

          <div style={{ display: 'flex', gap: 6, marginBottom: 12, borderBottom: '1px solid var(--fog)', paddingBottom: 8 }}>
            <button className={'btn ' + (tab === 'inspections' ? 'bb' : 'bo') + ' bsm'} onClick={() => setTab('inspections')}>
              🔎 Inspeções ({filteredInspections.length})
            </button>
            <button className={'btn ' + (tab === 'external' ? 'bb' : 'bo') + ' bsm'} onClick={() => setTab('external')}>
              📍 Externos ({filteredExternal.length})
            </button>
          </div>

          {tab === 'inspections' && (
            filteredInspections.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--mist)' }}>Nenhuma inspeção disponível para adicionar.</div>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {filteredInspections.map(i => {
                  const orig = originalBlocks[i.original_block_id]
                  const photo = (i.photos && i.photos[0]) || (orig?.photos && (Array.isArray(orig.photos) ? orig.photos[0] : null))
                  const key = `inspection:${i.id}`
                  const sel = selected.has(key)
                  return (
                    <label key={i.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, background: sel ? 'var(--sap1)' : 'var(--haze)', borderRadius: 8, cursor: 'pointer', border: sel ? '2px solid var(--sap6)' : '2px solid transparent' }}>
                      <input type="checkbox" checked={sel} onChange={() => toggleSel('inspection', i.id)} />
                      {photo && <img src={photo} alt="" style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 6 }} />}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700 }}>{orig?.code || '?'} <span className="bdg" style={{ background: 'var(--sap1)', color: 'var(--sap7)', marginLeft: 6 }}>Inspeção</span></div>
                        <div style={{ fontSize: 12, color: 'var(--mist)' }}>{orig?.material || '—'}</div>
                      </div>
                      <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, color: 'var(--sap7)' }}>
                        {money(i.negotiated_value || orig?.total_value, i.negotiated_currency || orig?.currency)}
                      </div>
                    </label>
                  )
                })}
              </div>
            )
          )}

          {tab === 'external' && (
            filteredExternal.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--mist)' }}>Nenhum bloco externo disponível para adicionar.</div>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {filteredExternal.map(b => {
                  const photo = b.photos && b.photos[0]
                  const key = `external:${b.id}`
                  const sel = selected.has(key)
                  return (
                    <label key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, background: sel ? '#fef3c7' : 'var(--haze)', borderRadius: 8, cursor: 'pointer', border: sel ? '2px solid #d97706' : '2px solid transparent' }}>
                      <input type="checkbox" checked={sel} onChange={() => toggleSel('external', b.id)} />
                      {photo && <img src={photo} alt="" style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 6 }} />}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700 }}>{b.code} <span className="bdg" style={{ background: '#fef3c7', color: '#d97706', marginLeft: 6 }}>Externo</span></div>
                        <div style={{ fontSize: 12, color: 'var(--mist)' }}>{b.material}</div>
                      </div>
                      <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, color: 'var(--sap7)' }}>
                        {money(b.total_value, b.currency)}
                      </div>
                    </label>
                  )
                })}
              </div>
            )
          )}

          {selected.size > 0 && (
            <div style={{ marginTop: 12, padding: 10, background: 'var(--sap1)', borderRadius: 8, fontSize: 13, color: 'var(--sap7)', fontWeight: 600 }}>
              ✓ {selected.size} bloco(s) selecionado(s)
            </div>
          )}
        </div>
        <div className="mfoot">
          <button className="btn bo" onClick={onClose}>Cancelar</button>
          <button className="btn bb" onClick={save} disabled={saving || selected.size === 0}>
            {saving ? <><span className="spinner"></span> Adicionando</> : `Adicionar ${selected.size > 0 ? `(${selected.size})` : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// ADD TO LIST PICKER — pequeno modal pra adicionar 1 bloco a 1+ listas
// ═══════════════════════════════════════════════════════════════
function AddToListPicker({ profile, buyerData, itemType, itemId, onClose, onAdded, toast }) {
  const lists = buyerData?.lists || []
  const listItems = buyerData?.listItems || []
  const [showNew, setShowNew] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [saving, setSaving] = useState(false)

  // Lista das listas em que esse bloco JÁ está
  const inLists = new Set(
    listItems.filter(it => it.item_type === itemType && it.item_id === itemId).map(it => it.list_id)
  )

  const addToList = async (listId) => {
    setSaving(true)
    try {
      await api.addListItem(listId, itemType, itemId, profile)
      toast('Adicionado!', 'ok')
      onAdded && onAdded()
    } catch (e) { toast('Erro: ' + e.message, 'err') } finally { setSaving(false) }
  }

  const removeFromList = async (listId) => {
    setSaving(true)
    try {
      const it = listItems.find(x => x.list_id === listId && x.item_type === itemType && x.item_id === itemId)
      if (it) {
        await api.removeListItem(it.id)
        toast('Removido da lista.', 'ok')
        onAdded && onAdded()
      }
    } catch (e) { toast('Erro: ' + e.message, 'err') } finally { setSaving(false) }
  }

  const createAndAdd = async () => {
    if (!newListName.trim()) { toast('Digite o nome.', 'err'); return }
    setSaving(true)
    try {
      const list = await api.createInterestList(profile, newListName.trim())
      await api.addListItem(list.id, itemType, itemId, profile)
      toast('Lista criada e bloco adicionado!', 'ok')
      setShowNew(false)
      setNewListName('')
      onAdded && onAdded()
    } catch (e) { toast('Erro: ' + e.message, 'err') } finally { setSaving(false) }
  }

  return (
    <div className="mo" onClick={onClose} style={{ zIndex: 1100 }}>
      <div className="md" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
        <div className="mhead">
          <div className="mtit">⭐ Adicionar à Lista</div>
          <button className="btn bo bsm" onClick={onClose}><Icon n="x" s={14} /></button>
        </div>
        <div className="mbody">
          {lists.length === 0 && !showNew && (
            <div style={{ padding: 14, textAlign: 'center', color: 'var(--mist)', fontSize: 13 }}>
              Você ainda não tem listas. Crie uma nova!
            </div>
          )}

          {lists.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
              {lists.map(l => {
                const inIt = inLists.has(l.id)
                return (
                  <div key={l.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 10, background: inIt ? 'var(--sap1)' : 'var(--haze)', borderRadius: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>{l.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--mist)' }}>{fmtDate(l.created_at)}</div>
                    </div>
                    {inIt ? (
                      <button className="btn bo bsm" disabled={saving} onClick={() => removeFromList(l.id)}>
                        ✓ Na lista — Remover
                      </button>
                    ) : (
                      <button className="btn bb bsm" disabled={saving} onClick={() => addToList(l.id)}>
                        + Adicionar
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {showNew ? (
            <div style={{ display: 'flex', gap: 6 }}>
              <input className="fc" placeholder="Nome da nova lista..." value={newListName} onChange={e => setNewListName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') createAndAdd() }} autoFocus />
              <button className="btn bb bsm" disabled={saving} onClick={createAndAdd}>
                {saving ? <span className="spinner"></span> : 'Criar e Adicionar'}
              </button>
              <button className="btn bo bsm" onClick={() => { setShowNew(false); setNewListName('') }}>×</button>
            </div>
          ) : (
            <button className="btn bo" style={{ width: '100%' }} onClick={() => setShowNew(true)}>
              <Icon n="plus" s={14} /> Criar Nova Lista
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// IND NEW VISIT — formulário pra registrar nova visita à pedreira
// ═══════════════════════════════════════════════════════════════
function IndNewVisitPage({ profile, buyerData, onChange, toast, setPage, setSelectedVisitId }) {
  const externalQuarries = buyerData?.externalQuarries || []
  const [saving, setSaving] = useState(false)
  const [showNewQuarry, setShowNewQuarry] = useState(false)
  const [newQuarryName, setNewQuarryName] = useState('')
  const [form, setForm] = useState({
    external_quarry_id: '',
    uses_stone_block: 'no', // 'yes' | 'no'
    visit_date: new Date().toISOString().slice(0, 16),
    notes: '',
  })

  const handleCreateQuarry = async () => {
    if (!newQuarryName.trim()) { toast('Digite o nome da pedreira.', 'err'); return }
    try {
      const q = await api.findOrCreateExternalQuarry(profile, newQuarryName.trim())
      toast('Pedreira cadastrada.', 'ok')
      setShowNewQuarry(false)
      setNewQuarryName('')
      await (onChange && onChange())
      setForm(prev => ({ ...prev, external_quarry_id: q.id }))
    } catch (e) { toast('Erro: ' + e.message, 'err') }
  }

  const save = async () => {
    if (!form.external_quarry_id) {
      toast('Selecione ou cadastre a pedreira.', 'err'); return
    }
    setSaving(true)
    try {
      const visit = await api.createInspectionVisit(profile, {
        external_quarry_id: form.external_quarry_id,
        uses_stone_block: form.uses_stone_block === 'yes',
        visit_date: form.visit_date ? new Date(form.visit_date).toISOString() : new Date().toISOString(),
        notes: form.notes.trim() || null,
      })
      toast('Inspeção iniciada!', 'ok')
      await (onChange && onChange())
      // Vai direto pra tela da visita
      if (setSelectedVisitId && setPage) {
        setSelectedVisitId(visit.id)
        setPage('ind_visit_detail')
      }
    } catch (e) { toast('Erro: ' + e.message, 'err') } finally { setSaving(false) }
  }

  const usaStoneBlock = form.uses_stone_block === 'yes'

  return (
    <div>
      <div className="ph">
        <div className="ptit">➕ Cadastrar Inspeção</div>
        <div className="psub">Registre uma nova visita a uma pedreira</div>
      </div>

      <div className="card" style={{ maxWidth: 640 }}>
        <div className="cb">
          <div className="fg">
            <label className="fl">Pedreira *</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <select className="fc" style={{ flex: 1 }} value={form.external_quarry_id} onChange={e => setForm({ ...form, external_quarry_id: e.target.value })}>
                <option value="">Selecione a pedreira...</option>
                {externalQuarries.map(q => <option key={q.id} value={q.id}>{q.name}{q.location ? ` — ${q.location}` : ''}</option>)}
              </select>
              <button className="btn bo bsm" onClick={() => setShowNewQuarry(true)}>+ Nova</button>
            </div>
            {showNewQuarry && (
              <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                <input className="fc" placeholder="Nome da nova pedreira" value={newQuarryName} onChange={e => setNewQuarryName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleCreateQuarry() }} autoFocus />
                <button className="btn bb bsm" onClick={handleCreateQuarry}>Criar</button>
                <button className="btn bo bsm" onClick={() => { setShowNewQuarry(false); setNewQuarryName('') }}>×</button>
              </div>
            )}
          </div>

          <div className="fg">
            <label className="fl">Data e hora da chegada *</label>
            <input className="fc" type="datetime-local" value={form.visit_date} onChange={e => setForm({ ...form, visit_date: e.target.value })} />
          </div>

          <div className="fg">
            <label className="fl">Esta pedreira usa o Stone Block? *</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', background: form.uses_stone_block === 'no' ? 'var(--sap1)' : 'var(--haze)', border: '2px solid ' + (form.uses_stone_block === 'no' ? 'var(--sap6)' : 'transparent'), borderRadius: 8, cursor: 'pointer', flex: 1 }}>
                <input type="radio" checked={form.uses_stone_block === 'no'} onChange={() => setForm({ ...form, uses_stone_block: 'no' })} />
                <span style={{ fontWeight: 600 }}>Não usa</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', background: form.uses_stone_block === 'yes' ? 'var(--sap1)' : 'var(--haze)', border: '2px solid ' + (form.uses_stone_block === 'yes' ? 'var(--sap6)' : 'transparent'), borderRadius: 8, cursor: 'pointer', flex: 1 }}>
                <input type="radio" checked={form.uses_stone_block === 'yes'} onChange={() => setForm({ ...form, uses_stone_block: 'yes' })} />
                <span style={{ fontWeight: 600 }}>Usa Stone Block</span>
              </label>
            </div>
            <div style={{ fontSize: 12, color: 'var(--mist)', marginTop: 6, lineHeight: 1.5 }}>
              {usaStoneBlock
                ? '✓ Os blocos poderão ser localizados pelo código (digite ou leia QR Code).'
                : '✓ Os blocos serão cadastrados do zero (fotos + medidas + valor).'}
            </div>
          </div>

          <div className="fg">
            <label className="fl">Observações da visita</label>
            <textarea className="fc" rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="Ex: recebido por João, pedreira nova no mercado..." />
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="btn bo" onClick={() => setPage && setPage('ind_dashboard')}>Cancelar</button>
            <button className="btn bb" onClick={save} disabled={saving}>
              {saving ? <><span className="spinner"></span> Iniciando</> : '🚀 Iniciar Inspeção'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// IND VISITS LIST — lista de todas as visitas
// ═══════════════════════════════════════════════════════════════
function IndVisitsListPage({ profile, buyerData, onChange, toast, setPage, setSelectedVisitId }) {
  const visits = buyerData?.visits || []
  const team = buyerData?.team || []
  const externalQuarries = buyerData?.externalQuarries || []
  const blockInspections = buyerData?.inspections || []
  const externalBlocks = buyerData?.externalBlocks || []
  const [filterStatus, setFilterStatus] = useState('all') // all | open | closed
  const [filterMarker, setFilterMarker] = useState('')
  const [filterQuarry, setFilterQuarry] = useState('')

  const countBlocks = (visitId) => {
    return blockInspections.filter(i => i.inspection_id === visitId).length +
           externalBlocks.filter(b => b.inspection_id === visitId).length
  }

  const filtered = visits.filter(v => {
    if (filterStatus !== 'all' && v.status !== filterStatus) return false
    if (filterMarker && v.marker_id !== filterMarker) return false
    if (filterQuarry && v.external_quarry_id !== filterQuarry) return false
    return true
  })

  const open = (v) => {
    if (setSelectedVisitId && setPage) {
      setSelectedVisitId(v.id)
      setPage('ind_visit_detail')
    }
  }

  return (
    <div>
      <div className="ph">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="ptit">📋 Inspeções</div>
            <div className="psub">{filtered.length} inspeção(ões) {filtered.length !== visits.length ? `de ${visits.length}` : ''}</div>
          </div>
          <button className="btn bb" onClick={() => setPage && setPage('ind_new_visit')}>
            <Icon n="plus" s={16} c="#fff" /> Cadastrar Inspeção
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 160 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">Todos status</option>
          <option value="open">🟢 Em aberto</option>
          <option value="closed">✓ Encerradas</option>
        </select>
        <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 200 }} value={filterMarker} onChange={e => setFilterMarker(e.target.value)}>
          <option value="">Todos os marcadores</option>
          {team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 200 }} value={filterQuarry} onChange={e => setFilterQuarry(e.target.value)}>
          <option value="">Todas as pedreiras</option>
          {externalQuarries.map(q => <option key={q.id} value={q.id}>{q.name}</option>)}
        </select>
        {(filterStatus !== 'all' || filterMarker || filterQuarry) && (
          <button className="btn bo bsm" onClick={() => { setFilterStatus('all'); setFilterMarker(''); setFilterQuarry('') }}>
            <Icon n="x" s={13} /> Limpar
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="es">
          <div style={{ marginBottom: 12, opacity: .3 }}><Icon n="check" s={48} /></div>
          <div className="estit">{visits.length === 0 ? 'Nenhuma inspeção ainda' : 'Nenhuma inspeção encontrada'}</div>
          {visits.length === 0 && (
            <button className="btn bb" style={{ marginTop: 16 }} onClick={() => setPage && setPage('ind_new_visit')}>
              <Icon n="plus" s={16} c="#fff" /> Cadastrar Primeira Inspeção
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))' }}>
          {filtered.map(v => {
            const marker = team.find(m => m.id === v.marker_id)
            const quarry = externalQuarries.find(q => q.id === v.external_quarry_id)
            const blocks = countBlocks(v.id)
            return (
              <div key={v.id} className="card" style={{ cursor: 'pointer', borderTop: '4px solid ' + (v.status === 'open' ? 'var(--ok)' : 'var(--mist)') }} onClick={() => open(v)}>
                <div className="cb">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 15 }}>
                      📍 {quarry?.name || '—'}
                    </div>
                    <span className="bdg" style={{ background: v.status === 'open' ? '#dcfce7' : 'var(--haze)', color: v.status === 'open' ? '#15803d' : 'var(--mist)', fontSize: 11 }}>
                      {v.status === 'open' ? '🟢 Aberta' : '✓ Encerrada'}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--mist)', marginBottom: 6 }}>
                    📅 {fmtDate(v.visit_date)}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--mist)', marginBottom: 6 }}>
                    👤 {marker?.name || '—'}
                  </div>
                  <div style={{ fontSize: 13, marginBottom: 6 }}>
                    🏗️ <strong>{blocks}</strong> bloco(s) inspecionado(s)
                  </div>
                  {v.uses_stone_block && (
                    <div style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, background: 'var(--sap1)', color: 'var(--sap7)', padding: '2px 6px', borderRadius: 4, marginTop: 4 }}>
                      Stone Block
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// IND VISIT DETAIL — detalhe da visita + blocos inspecionados
// ═══════════════════════════════════════════════════════════════
function IndVisitDetailPage({ profile, buyerData, onChange, toast, visitId, setPage }) {
  const visits = buyerData?.visits || []
  const team = buyerData?.team || []
  const externalQuarries = buyerData?.externalQuarries || []
  const allInspections = buyerData?.inspections || []
  const allExternals = buyerData?.externalBlocks || []
  const [showAddBlock, setShowAddBlock] = useState(false)
  const [showFinalize, setShowFinalize] = useState(false)
  const [originalBlocks, setOriginalBlocks] = useState({})

  const visit = visits.find(v => v.id === visitId)
  const inspectionsHere = allInspections.filter(i => i.inspection_id === visitId)
  const externalsHere = allExternals.filter(b => b.inspection_id === visitId)
  const totalBlocks = inspectionsHere.length + externalsHere.length

  useEffect(() => {
    const ids = [...new Set(inspectionsHere.map(i => i.original_block_id))]
    if (ids.length === 0) return
    ;(async () => {
      const map = {}
      for (const id of ids) {
        try {
          const { data } = await supabase.from('blocks').select('*').eq('id', id).maybeSingle()
          if (data) {
            map[id] = {
              ...data,
              photos: Array.isArray(data.photos) ? data.photos
                : (typeof data.photos === 'string' ? (data.photos.startsWith('[') ? JSON.parse(data.photos) : [data.photos]) : []),
            }
          }
        } catch (e) {}
      }
      setOriginalBlocks(map)
    })()
  }, [visitId, inspectionsHere.length])

  if (!visit) {
    return (
      <div className="es">
        <div className="estit">Inspeção não encontrada</div>
        <button className="btn bb" style={{ marginTop: 16 }} onClick={() => setPage && setPage('ind_visits')}>← Voltar</button>
      </div>
    )
  }

  const marker = team.find(m => m.id === visit.marker_id)
  const quarry = externalQuarries.find(q => q.id === visit.external_quarry_id)

  const closeVisit = async () => {
    if (!confirm('Encerrar esta inspeção?')) return
    try {
      await api.closeInspectionVisit(visit.id)
      toast('Inspeção encerrada.', 'ok')
      onChange && onChange()
    } catch (e) { toast('Erro: ' + e.message, 'err') }
  }

  const reopenVisit = async () => {
    try {
      await api.reopenInspectionVisit(visit.id)
      toast('Inspeção reaberta.', 'ok')
      onChange && onChange()
    } catch (e) { toast('Erro: ' + e.message, 'err') }
  }

  const removeVisit = async () => {
    if (!confirm(`Excluir esta inspeção?\n\nOs blocos cadastrados nela NÃO serão apagados — eles continuam disponíveis mas sem vínculo com esta visita.`)) return
    try {
      await api.deleteInspectionVisit(visit.id)
      toast('Inspeção excluída.', 'ok')
      await (onChange && onChange())
      setPage && setPage('ind_visits')
    } catch (e) { toast('Erro: ' + e.message, 'err') }
  }

  return (
    <div>
      <div className="ph">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <button className="btn bo bsm" style={{ marginBottom: 8 }} onClick={() => setPage && setPage('ind_visits')}>← Inspeções</button>
            <div className="ptit">📍 {quarry?.name || '—'}</div>
            <div className="psub">
              📅 {fmtDate(visit.visit_date)} · 👤 {marker?.name || '—'} · 🏗️ {totalBlocks} bloco(s)
              {visit.uses_stone_block && <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, background: 'var(--sap1)', color: 'var(--sap7)', padding: '2px 6px', borderRadius: 4, marginLeft: 8 }}>Stone Block</span>}
            </div>
            {visit.notes && (
              <div style={{ background: 'var(--haze)', padding: 10, borderRadius: 8, marginTop: 10, fontSize: 13, maxWidth: 720 }}>
                <strong>Observações:</strong> {visit.notes}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {visit.order_status === 'awaiting' ? (
              <span className="bdg" style={{ background: '#fef3c7', color: '#854d0e', fontSize: 12, padding: '6px 12px', fontWeight: 700 }}>
                ⏳ Aguardando aprovação da pedreira
              </span>
            ) : visit.order_status === 'approved' || visit.finalized_at ? (
              <span className="bdg" style={{ background: '#dcfce7', color: '#15803d', fontSize: 12, padding: '6px 12px', fontWeight: 700 }}>
                ✅ Compra Finalizada{visit.finalized_at ? ` em ${fmtDate(visit.finalized_at)}` : ''}
              </span>
            ) : visit.order_status === 'rejected' ? (
              <>
                <span className="bdg" style={{ background: '#fee2e2', color: '#991b1b', fontSize: 12, padding: '6px 12px', fontWeight: 700 }}>
                  ❌ Pedido rejeitado
                </span>
                {totalBlocks > 0 && (
                  <button className="btn bb" onClick={() => setShowFinalize(true)}>
                    📤 Reenviar Pedido
                  </button>
                )}
              </>
            ) : (
              <>
                <button className="btn bb" onClick={() => setShowAddBlock(true)}>
                  <Icon n="plus" s={15} c="#fff" /> Cadastrar Bloco
                </button>
                {totalBlocks > 0 && (
                  <button className="btn" style={{ background: 'var(--ok)', color: '#fff' }} onClick={() => setShowFinalize(true)}>
                    {visit.uses_stone_block ? '📤 Enviar Pedido de Compra' : '💰 Finalizar Compra'}
                  </button>
                )}
                {visit.status === 'open' ? (
                  <button className="btn bo" onClick={closeVisit}>✓ Encerrar</button>
                ) : (
                  <button className="btn bo" onClick={reopenVisit}>🔓 Reabrir</button>
                )}
                <button className="btn bo" onClick={removeVisit} title="Excluir inspeção">
                  <Icon n="trash" s={14} c="var(--err)" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {totalBlocks === 0 ? (
        <div className="es">
          <div style={{ marginBottom: 12, opacity: .3 }}><Icon n="cube" s={48} /></div>
          <div className="estit">Nenhum bloco inspecionado ainda</div>
          {visit.status === 'open' && (
            <button className="btn bb" style={{ marginTop: 16 }} onClick={() => setShowAddBlock(true)}>
              <Icon n="plus" s={16} c="#fff" /> Cadastrar Primeiro Bloco
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))' }}>
          {/* Blocos de inspeção (Stone Block) */}
          {inspectionsHere.map(i => {
            const orig = originalBlocks[i.original_block_id]
            const photo = (i.photos && i.photos[0]) || (orig?.photos && orig.photos[0])
            return (
              <div key={i.id} className="card" style={{ borderTop: '4px solid var(--sap6)' }}>
                {photo ? (
                  <img src={photo} alt="" style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ height: 140, background: 'var(--haze)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon n="cube" s={32} c="var(--mist)" /></div>
                )}
                <div className="cb">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 16 }}>{orig?.code || '?'}</div>
                    <span className="bdg" style={{ background: 'var(--sap1)', color: 'var(--sap7)', fontSize: 10 }}>Stone Block</span>
                  </div>
                  <div style={{ fontSize: 13, marginBottom: 6 }}>{orig?.material || '—'}</div>
                  {i.negotiated_value && (
                    <div style={{ fontSize: 13, color: '#059669', fontWeight: 700 }}>
                      Negociado: {money(i.negotiated_value, i.negotiated_currency)}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          {/* Blocos externos */}
          {externalsHere.map(b => (
            <div key={b.id} className="card" style={{ borderTop: '4px solid #d97706' }}>
              {b.photos && b.photos[0] ? (
                <img src={b.photos[0]} alt={b.code} style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{ height: 140, background: 'var(--haze)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon n="cube" s={32} c="var(--mist)" /></div>
              )}
              <div className="cb">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 16 }}>{b.code}</div>
                  <span className="bdg" style={{ background: '#fef3c7', color: '#d97706', fontSize: 10 }}>Externo</span>
                </div>
                <div style={{ fontSize: 13, marginBottom: 6 }}>{b.material}</div>
                <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--sap7)' }}>
                  {money(b.total_value, b.currency)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddBlock && (
        <AddBlockToVisitModal
          profile={profile}
          buyerData={buyerData}
          visit={visit}
          onClose={() => setShowAddBlock(false)}
          onAdded={() => { setShowAddBlock(false); onChange && onChange() }}
          toast={toast}
        />
      )}

      {showFinalize && (
        <FinalizeInspectionPurchaseModal
          profile={profile}
          buyerData={buyerData}
          visit={visit}
          onClose={() => setShowFinalize(false)}
          onFinalized={async () => {
            setShowFinalize(false)
            if (onChange) await onChange()
            setPage && setPage('ind_purchases')
          }}
          toast={toast}
        />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// ADD BLOCK TO VISIT — modal que cadastra bloco dentro da visita
// ═══════════════════════════════════════════════════════════════
function AddBlockToVisitModal({ profile, buyerData, visit, onClose, onAdded, toast }) {
  const [mode, setMode] = useState(visit.uses_stone_block ? 'search' : 'external')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [searching, setSearching] = useState(false)
  const [selectedBlock, setSelectedBlock] = useState(null)
  const [showInspectionForm, setShowInspectionForm] = useState(false)
  const [showExternalForm, setShowExternalForm] = useState(false)

  const doSearch = async () => {
    if (!query.trim()) { toast('Digite o código.', 'err'); return }
    setSearching(true)
    try {
      const found = await api.searchBlockForInspection(query.trim())
      setResults(found || [])
    } catch (e) { toast('Erro: ' + e.message, 'err'); setResults([]) }
    finally { setSearching(false) }
  }

  if (showInspectionForm && selectedBlock) {
    return (
      <IndInspectionFormModal
        profile={profile}
        block={selectedBlock}
        inspectionId={visit.id}
        onClose={() => { setShowInspectionForm(false); setSelectedBlock(null) }}
        onSaved={() => { setShowInspectionForm(false); setSelectedBlock(null); onAdded && onAdded(); toast('Bloco inspecionado!', 'ok') }}
        toast={toast}
      />
    )
  }

  if (showExternalForm) {
    return (
      <IndExternalBlockFormModal
        profile={profile}
        buyerData={buyerData}
        visit={visit}
        onClose={() => setShowExternalForm(false)}
        onSaved={() => { setShowExternalForm(false); onAdded && onAdded(); toast('Bloco cadastrado!', 'ok') }}
        toast={toast}
      />
    )
  }

  return (
    <div className="mo" onClick={onClose}>
      <div className="md" style={{ maxWidth: 720 }} onClick={e => e.stopPropagation()}>
        <div className="mhead">
          <div className="mtit">🏗️ Cadastrar Bloco</div>
          <button className="btn bo bsm" onClick={onClose}><Icon n="x" s={14} /></button>
        </div>
        <div className="mbody">
          {visit.uses_stone_block ? (
            <>
              <div style={{ display: 'flex', gap: 6, marginBottom: 14, borderBottom: '1px solid var(--fog)', paddingBottom: 8 }}>
                <button className={'btn ' + (mode === 'search' ? 'bb' : 'bo') + ' bsm'} onClick={() => setMode('search')}>
                  🔍 Buscar bloco da pedreira
                </button>
                <button className={'btn ' + (mode === 'external' ? 'bb' : 'bo') + ' bsm'} onClick={() => setMode('external')}>
                  ✍️ Cadastrar bloco novo
                </button>
              </div>

              {mode === 'search' && (
                <>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                    <input className="fc" style={{ flex: 1, fontSize: 15, textTransform: 'uppercase' }}
                      placeholder="Digite o código ou SB-XXXX-XXXX..."
                      value={query} onChange={e => setQuery(e.target.value.toUpperCase())}
                      onKeyDown={e => { if (e.key === 'Enter') doSearch() }} autoFocus />
                    <button className="btn bb" onClick={doSearch} disabled={searching}>
                      {searching ? <span className="spinner"></span> : 'Buscar'}
                    </button>
                  </div>

                  {results && results.length === 0 && (
                    <div style={{ padding: 16, background: '#fef3c7', borderRadius: 8, marginBottom: 12 }}>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>Bloco não encontrado</div>
                      <div style={{ fontSize: 13, color: 'var(--mist)' }}>O código <strong>{query}</strong> não está em nenhuma pedreira Stone Block. Você pode cadastrar este bloco do zero.</div>
                      <button className="btn bb bsm" style={{ marginTop: 10 }} onClick={() => setMode('external')}>
                        ✍️ Cadastrar como bloco novo
                      </button>
                    </div>
                  )}

                  {results && results.length > 0 && (
                    <div style={{ display: 'grid', gap: 8 }}>
                      {results.map(b => {
                        const photos = Array.isArray(b.photos) ? b.photos
                          : (typeof b.photos === 'string' ? (b.photos.startsWith('[') ? JSON.parse(b.photos) : [b.photos]) : [])
                        return (
                          <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, background: 'var(--haze)', borderRadius: 8 }}>
                            {photos[0] && <img src={photos[0]} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 6 }} />}
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700 }}>{b.code}</div>
                              <div style={{ fontSize: 12, color: 'var(--mist)' }}>{b.material} · {(b.net_volume || 0).toFixed(2)} m³</div>
                            </div>
                            <button className="btn bb bsm" onClick={() => { setSelectedBlock({ ...b, photos }); setShowInspectionForm(true) }}>
                              Inspecionar
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {!results && (
                    <div style={{ padding: 20, textAlign: 'center', color: 'var(--mist)', fontSize: 13 }}>
                      Digite o código do bloco que está vendo (ou escaneie o QR Code do bloco)
                    </div>
                  )}
                </>
              )}

              {mode === 'external' && (
                <div style={{ padding: 16, textAlign: 'center' }}>
                  <button className="btn bb" onClick={() => setShowExternalForm(true)}>
                    ✍️ Abrir formulário de cadastro
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{ padding: 16, textAlign: 'center' }}>
              <div style={{ marginBottom: 16, color: 'var(--mist)' }}>
                Esta pedreira não usa o Stone Block. Cadastre o bloco do zero.
              </div>
              <button className="btn bb" onClick={() => setShowExternalForm(true)}>
                ✍️ Abrir formulário de cadastro
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// EXTERNAL BLOCK FORM MODAL (variante que ja vem com inspection_id)
// Reutiliza o conteúdo do IndExternalBlockFormPage mas como modal
// ═══════════════════════════════════════════════════════════════
function IndExternalBlockFormModal({ profile, buyerData, visit, onClose, onSaved, toast }) {
  const [photos, setPhotos] = useState([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    code: '',
    material: '',
    classification: 'A',
    prod_date: new Date().toISOString().slice(0, 10),
    gross_l: '', gross_h: '', gross_w: '',
    net_l: '', net_h: '', net_w: '',
    currency: 'USD',
    price_m3: '',
    notes: '',
  })

  const grossVolume = calcVolume(form.gross_l, form.gross_h, form.gross_w)
  const netVolume = calcVolume(form.net_l, form.net_h, form.net_w)
  const totalValue = netVolume * (parseFloat(form.price_m3) || 0)

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    if (photos.length + files.length > 4) { toast('Máximo 4 fotos.', 'err'); return }
    setUploading(true)
    try {
      const uploaded = []
      for (const f of files) {
        const compressed = await compressIndImage(f)
        const url = await api.uploadInspectionPhoto(profile, compressed, form.code || 'external')
        uploaded.push(url)
      }
      setPhotos([...photos, ...uploaded])
    } catch (e) { toast('Erro: ' + e.message, 'err') } finally { setUploading(false); e.target.value = '' }
  }

  const removePhoto = (idx) => setPhotos(photos.filter((_, i) => i !== idx))

  const save = async () => {
    if (!form.code.trim()) { toast('Código obrigatório.', 'err'); return }
    if (!form.material.trim()) { toast('Material obrigatório.', 'err'); return }
    if (photos.length === 0) { toast('Adicione ao menos 1 foto.', 'err'); return }
    setSaving(true)
    try {
      await api.createExternalBlock(profile, {
        external_quarry_id: visit.external_quarry_id,
        inspection_id: visit.id,
        code: form.code.trim().toUpperCase(),
        material: form.material.trim(),
        classification: form.classification,
        prod_date: form.prod_date || null,
        gross_l: parseFloat(form.gross_l) || null,
        gross_h: parseFloat(form.gross_h) || null,
        gross_w: parseFloat(form.gross_w) || null,
        gross_volume: grossVolume || null,
        net_l: parseFloat(form.net_l) || null,
        net_h: parseFloat(form.net_h) || null,
        net_w: parseFloat(form.net_w) || null,
        net_volume: netVolume || null,
        currency: form.currency,
        price_m3: parseFloat(form.price_m3) || null,
        total_value: totalValue || null,
        photos,
        notes: form.notes.trim() || null,
        status: 'pending',
      })
      onSaved && onSaved()
    } catch (e) { toast('Erro: ' + e.message, 'err') } finally { setSaving(false) }
  }

  return (
    <div className="mo" onClick={onClose}>
      <div className="md" onClick={e => e.stopPropagation()}>
        <div className="mhead">
          <div className="mtit">🏗️ Cadastrar Bloco</div>
          <button className="btn bo bsm" onClick={onClose}><Icon n="x" s={14} /></button>
        </div>
        <div className="mbody">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="fg">
              <label className="fl">Código *</label>
              <input className="fc" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} style={{ textTransform: 'uppercase' }} />
            </div>
            <div className="fg">
              <label className="fl">Material *</label>
              <input className="fc" value={form.material} onChange={e => setForm({ ...form, material: e.target.value })} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="fg">
              <label className="fl">Classificação</label>
              <select className="fc" value={form.classification} onChange={e => setForm({ ...form, classification: e.target.value })}>
                <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
              </select>
            </div>
            <div className="fg">
              <label className="fl">Data de produção</label>
              <input type="date" className="fc" value={form.prod_date} onChange={e => setForm({ ...form, prod_date: e.target.value })} />
            </div>
          </div>

          <div style={{ background: '#f3f4f6', padding: 12, borderRadius: 8, marginTop: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--mist)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>📐 Medidas brutas</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
              <input className="fc" type="number" step="0.01" placeholder="comp" value={form.gross_l} onChange={e => setForm({ ...form, gross_l: e.target.value })} />
              <input className="fc" type="number" step="0.01" placeholder="alt" value={form.gross_h} onChange={e => setForm({ ...form, gross_h: e.target.value })} />
              <input className="fc" type="number" step="0.01" placeholder="larg" value={form.gross_w} onChange={e => setForm({ ...form, gross_w: e.target.value })} />
            </div>
            {grossVolume > 0 && <div style={{ fontSize: 13, marginTop: 6, fontWeight: 700 }}>Volume bruto: {grossVolume.toFixed(2)} m³</div>}
          </div>

          <div style={{ background: 'var(--sap1)', padding: 12, borderRadius: 8, marginTop: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--sap7)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>📐 Medidas líquidas</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
              <input className="fc" type="number" step="0.01" placeholder="comp" value={form.net_l} onChange={e => setForm({ ...form, net_l: e.target.value })} />
              <input className="fc" type="number" step="0.01" placeholder="alt" value={form.net_h} onChange={e => setForm({ ...form, net_h: e.target.value })} />
              <input className="fc" type="number" step="0.01" placeholder="larg" value={form.net_w} onChange={e => setForm({ ...form, net_w: e.target.value })} />
            </div>
            {netVolume > 0 && <div style={{ fontSize: 13, marginTop: 6, fontWeight: 700, color: 'var(--sap7)' }}>Volume líquido: {netVolume.toFixed(2)} m³</div>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8, marginTop: 10 }}>
            <div className="fg">
              <label className="fl">Moeda</label>
              <select className="fc" value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}>
                <option value="USD">USD (US$)</option>
                <option value="BRL">BRL (R$)</option>
              </select>
            </div>
            <div className="fg">
              <label className="fl">Preço por m³</label>
              <input className="fc" type="number" step="0.01" value={form.price_m3} onChange={e => setForm({ ...form, price_m3: e.target.value })} />
            </div>
          </div>

          {totalValue > 0 && (
            <div style={{ padding: 10, background: 'linear-gradient(135deg,#0c1a2e,#1e3a8a)', borderRadius: 8, marginTop: 6 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.7)', fontWeight: 700, textTransform: 'uppercase' }}>Valor total</div>
              <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 22, color: '#fff' }}>{money(totalValue, form.currency)}</div>
            </div>
          )}

          <div className="fg" style={{ marginTop: 12 }}>
            <label className="fl">Fotos ({photos.length}/4) *</label>
            {photos.length < 4 && (
              <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} disabled={uploading} style={{ fontSize: 13 }} />
            )}
            {uploading && <div style={{ fontSize: 12, color: 'var(--mist)', marginTop: 4 }}><span className="spinner"></span> Enviando...</div>}
            {photos.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {photos.map((url, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={url} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6 }} />
                    <button onClick={() => removePhoto(i)} style={{ position: 'absolute', top: -6, right: -6, background: 'var(--err)', color: '#fff', border: 'none', width: 20, height: 20, borderRadius: '50%', cursor: 'pointer', fontSize: 11 }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="fg">
            <label className="fl">Observações</label>
            <textarea className="fc" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>
        <div className="mfoot">
          <button className="btn bo" onClick={onClose}>Cancelar</button>
          <button className="btn bb" onClick={save} disabled={saving || uploading}>
            {saving ? <><span className="spinner"></span> Salvando</> : 'Cadastrar Bloco'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// IND CATALOG — vitrine unificada (todos os blocos marcados)
// ═══════════════════════════════════════════════════════════════
function IndCatalogPage({ profile, buyerData, onChange, toast }) {
  const inspections = buyerData?.inspections || []
  const externalBlocks = buyerData?.externalBlocks || []
  const visits = buyerData?.visits || []
  const externalQuarries = buyerData?.externalQuarries || []
  const purchases = buyerData?.purchases || []
  const [search, setSearch] = useState('')
  const [filterMaterial, setFilterMaterial] = useState('')
  const [filterQuarry, setFilterQuarry] = useState('')
  const [filterType, setFilterType] = useState('all') // all | sb | external
  const [originalBlocks, setOriginalBlocks] = useState({})
  const [detail, setDetail] = useState(null) // { type, item }

  // IDs de inspeções (visitas) que JÁ FORAM COMPRADAS — filtrar fora
  const purchasedInspectionIds = new Set(purchases.map(p => p.inspection_id))

  useEffect(() => {
    const ids = [...new Set(inspections.map(i => i.original_block_id))]
    if (ids.length === 0) return
    ;(async () => {
      const map = {}
      for (const id of ids) {
        try {
          const { data } = await supabase.from('blocks').select('*').eq('id', id).maybeSingle()
          if (data) {
            map[id] = {
              ...data,
              photos: Array.isArray(data.photos) ? data.photos
                : (typeof data.photos === 'string' ? (data.photos.startsWith('[') ? JSON.parse(data.photos) : [data.photos]) : []),
            }
          }
        } catch (e) {}
      }
      setOriginalBlocks(map)
    })()
  }, [inspections.length])

  // Normaliza pra um formato unificado — EXCLUI blocos já comprados
  const items = []
  inspections.forEach(i => {
    // Se a visita já foi finalizada como compra, NÃO mostrar
    if (purchasedInspectionIds.has(i.inspection_id)) return
    const orig = originalBlocks[i.original_block_id]
    // Se o bloco original já está vendido (status sold), também não mostrar
    if (orig?.status === 'sold') return
    const visit = visits.find(v => v.id === i.inspection_id)
    const quarry = visit ? externalQuarries.find(q => q.id === visit.external_quarry_id) : null
    items.push({
      type: 'inspection',
      id: i.id,
      code: orig?.code || '?',
      material: orig?.material || '—',
      classification: orig?.classification || '—',
      volume: orig?.net_volume || 0,
      value: i.negotiated_value || orig?.total_value,
      currency: i.negotiated_currency || orig?.currency,
      photos: (i.photos && i.photos.length > 0) ? i.photos : (orig?.photos || []),
      photoCount: ((i.photos || []).length) + ((orig?.photos || []).length),
      quarry_name: quarry?.name || '—',
      quarry_id: visit?.external_quarry_id,
      original: orig,
      inspection: i,
      visit,
    })
  })
  externalBlocks.forEach(b => {
    if (purchasedInspectionIds.has(b.inspection_id)) return
    if (b.status === 'bought') return
    const visit = visits.find(v => v.id === b.inspection_id)
    const quarry = externalQuarries.find(q => q.id === b.external_quarry_id)
    items.push({
      type: 'external',
      id: b.id,
      code: b.code,
      material: b.material,
      classification: b.classification,
      volume: b.net_volume || 0,
      value: b.total_value,
      currency: b.currency,
      photos: b.photos || [],
      photoCount: (b.photos || []).length,
      quarry_name: quarry?.name || '—',
      quarry_id: b.external_quarry_id,
      block: b,
      visit,
    })
  })

  // Aplica filtros
  const filtered = items.filter(it => {
    if (filterType === 'sb' && it.type !== 'inspection') return false
    if (filterType === 'external' && it.type !== 'external') return false
    if (search && !(it.code || '').toLowerCase().includes(search.toLowerCase())) return false
    if (filterMaterial && it.material !== filterMaterial) return false
    if (filterQuarry && it.quarry_id !== filterQuarry) return false
    return true
  })

  const allMaterials = [...new Set(items.map(it => it.material).filter(Boolean))].sort()
  const hasFilter = search || filterMaterial || filterQuarry || filterType !== 'all'

  return (
    <div>
      <div className="ph">
        <div className="ptit">📦 Catálogo Interno</div>
        <div className="psub">{filtered.length} bloco(s) marcado(s) pela sua equipe{hasFilter ? ` (de ${items.length})` : ''}</div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input className="fc" style={{ flex: '0 1 200px', fontSize: 13, padding: '7px 12px', textTransform: 'uppercase' }}
          placeholder="🔍 Código..." value={search} onChange={e => setSearch(e.target.value.toUpperCase())} />
        <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 150 }} value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="all">Todos os tipos</option>
          <option value="sb">Stone Block</option>
          <option value="external">Externos</option>
        </select>
        <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 220 }} value={filterMaterial} onChange={e => setFilterMaterial(e.target.value)}>
          <option value="">Todos os materiais</option>
          {allMaterials.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 200 }} value={filterQuarry} onChange={e => setFilterQuarry(e.target.value)}>
          <option value="">Todas as pedreiras</option>
          {externalQuarries.map(q => <option key={q.id} value={q.id}>{q.name}</option>)}
        </select>
        {hasFilter && (
          <button className="btn bo bsm" onClick={() => { setSearch(''); setFilterMaterial(''); setFilterQuarry(''); setFilterType('all') }}>
            <Icon n="x" s={13} /> Limpar
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="es">
          <div style={{ marginBottom: 12, opacity: .3 }}><Icon n="cube" s={48} /></div>
          <div className="estit">{items.length === 0 ? 'Catálogo vazio' : 'Nenhum bloco encontrado'}</div>
          {items.length === 0 && (
            <div style={{ fontSize: 13, color: 'var(--mist)', marginTop: 8 }}>
              Os blocos aparecem aqui à medida que os marcadores os inspecionam.
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))' }}>
          {filtered.map(it => (
            <div key={it.type + ':' + it.id} className="card" style={{ cursor: 'pointer', borderTop: `4px solid ${it.type === 'inspection' ? 'var(--sap6)' : '#d97706'}` }} onClick={() => setDetail(it)}>
              {it.photos[0] ? (
                <div style={{ position: 'relative' }}>
                  <img src={it.photos[0]} alt={it.code} style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
                  {it.photoCount > 1 && (
                    <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,.65)', color: '#fff', padding: '3px 9px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>
                      📷 {it.photoCount}
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: 8, left: 8, background: it.type === 'inspection' ? 'var(--sap6)' : '#d97706', color: '#fff', padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>
                    {it.type === 'inspection' ? 'STONE BLOCK' : 'EXTERNO'}
                  </div>
                </div>
              ) : (
                <div style={{ height: 180, background: 'var(--haze)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon n="cube" s={32} c="var(--mist)" /></div>
              )}
              <div className="cb">
                <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{it.code}</div>
                <div style={{ fontSize: 13, marginBottom: 4 }}>{it.material}</div>
                <div style={{ fontSize: 12, color: 'var(--mist)', marginBottom: 4 }}>📍 {it.quarry_name}</div>
                <div style={{ fontSize: 11, color: 'var(--mist)', marginBottom: 6 }}>Classif. {it.classification} · {it.volume.toFixed(2)} m³</div>
                <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--sap7)' }}>
                  {it.value ? money(it.value, it.currency) : '—'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {detail && (
        detail.type === 'inspection' ? (
          <IndInspectionDetailModal
            profile={profile}
            buyerData={buyerData}
            inspection={detail.inspection}
            original={detail.original}
            marker={(buyerData?.team || []).find(m => m.id === detail.inspection.marker_id)}
            onClose={() => setDetail(null)}
            onDelete={async () => {
              if (!confirm('Excluir esta inspeção?')) return
              try { await api.deleteInspection(detail.inspection.id); toast('Excluído.', 'ok'); setDetail(null); onChange && onChange() }
              catch (e) { toast('Erro: ' + e.message, 'err') }
            }}
            onChange={onChange}
            toast={toast}
          />
        ) : (
          <IndExternalBlockDetailModal
            profile={profile}
            buyerData={buyerData}
            item={{ block: detail.block, quarry: externalQuarries.find(q => q.id === detail.block.external_quarry_id), marker: (buyerData?.team || []).find(m => m.id === detail.block.marker_id) }}
            onClose={() => setDetail(null)}
            onDelete={async () => {
              if (!confirm('Excluir este bloco?')) return
              try { await api.deleteExternalBlock(detail.block.id); toast('Excluído.', 'ok'); setDetail(null); onChange && onChange() }
              catch (e) { toast('Erro: ' + e.message, 'err') }
            }}
            onChange={onChange}
            toast={toast}
          />
        )
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// IND CARTS — placeholder para próxima etapa (Etapa 5)
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// IND QUARRY CATALOG — vitrine pública de blocos das pedreiras Stone Block
// ═══════════════════════════════════════════════════════════════
function IndQuarryCatalogPage({ profile, buyerData, toast }) {
  const [blocks, setBlocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterMaterial, setFilterMaterial] = useState('')
  const [detail, setDetail] = useState(null)
  const [addBlockToVisit, setAddBlockToVisit] = useState(null) // { block, visits }
  const [adding, setAdding] = useState(false)

  const reloadCatalog = async () => {
    setLoading(true)
    try {
      const data = await api.listIndQuarryCatalog(profile)
      setBlocks(data || [])
    } catch (e) { toast('Erro ao carregar catálogo: ' + e.message, 'err') }
    finally { setLoading(false) }
  }

  useEffect(() => { reloadCatalog() }, [])

  const openAddToVisit = async (block) => {
    try {
      const visits = await api.listOpenVisitsForQuarry(profile, block.company_id)
      setAddBlockToVisit({ block, visits })
    } catch (e) {
      toast('Erro: ' + e.message, 'err')
    }
  }

  const addToExistingVisit = async (visitId) => {
    if (!addBlockToVisit) return
    setAdding(true)
    try {
      await api.addCatalogBlockToVisit(profile, addBlockToVisit.block, visitId)
      toast('✓ Bloco adicionado à inspeção!', 'ok')
      setAddBlockToVisit(null)
    } catch (e) {
      toast('Erro: ' + e.message, 'err')
    } finally { setAdding(false) }
  }

  const createNewVisitAndAdd = async () => {
    if (!addBlockToVisit) return
    setAdding(true)
    try {
      await api.quickCreateVisitWithBlock(profile, addBlockToVisit.block)
      toast('✓ Inspeção criada e bloco adicionado!', 'ok')
      setAddBlockToVisit(null)
    } catch (e) {
      toast('Erro: ' + e.message, 'err')
    } finally { setAdding(false) }
  }

  const filtered = blocks.filter(b => {
    if (search && !(b.code || '').toLowerCase().includes(search.toLowerCase()) && !((b.sys_code || '').toLowerCase().includes(search.toLowerCase()))) return false
    if (filterMaterial && b.material !== filterMaterial) return false
    return true
  })

  const allMaterials = [...new Set(blocks.map(b => b.material).filter(Boolean))].sort()

  return (
    <div>
      <div className="ph">
        <div className="ptit">🏔️ Catálogo da Pedreira</div>
        <div className="psub">{filtered.length} bloco(s) disponíveis em pedreiras Stone Block{(search || filterMaterial) ? ` (de ${blocks.length})` : ''}</div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input className="fc" style={{ flex: '0 1 240px', fontSize: 13, padding: '7px 12px', textTransform: 'uppercase' }}
          placeholder="🔍 Código ou SB-XXXX..." value={search} onChange={e => setSearch(e.target.value.toUpperCase())} />
        <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 220 }} value={filterMaterial} onChange={e => setFilterMaterial(e.target.value)}>
          <option value="">Todos os materiais</option>
          {allMaterials.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        {(search || filterMaterial) && (
          <button className="btn bo bsm" onClick={() => { setSearch(''); setFilterMaterial('') }}>
            <Icon n="x" s={13} /> Limpar
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--mist)' }}><span className="spinner"></span> Carregando catálogo...</div>
      ) : filtered.length === 0 ? (
        <div className="es">
          <div style={{ marginBottom: 12, opacity: .3 }}><Icon n="cube" s={48} /></div>
          <div className="estit">{blocks.length === 0 ? 'Nenhum bloco liberado ainda' : 'Nenhum bloco encontrado'}</div>
          {blocks.length === 0 && (
            <div style={{ fontSize: 13, color: 'var(--mist)', marginTop: 8, maxWidth: 420, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>
              Aqui aparecem os blocos que as pedreiras Stone Block liberaram para a sua empresa.
              Peça à pedreira para liberar o catálogo para vocês.
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))' }}>
          {filtered.map(b => (
            <div key={b.id} className="card" style={{ borderTop: '4px solid var(--sap6)' }}>
              <div style={{ cursor: 'pointer' }} onClick={() => setDetail(b)}>
                {b.photos[0] ? (
                  <div style={{ position: 'relative' }}>
                    <img src={b.photos[0]} alt={b.code} style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
                    {b.photos.length > 1 && (
                      <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,.65)', color: '#fff', padding: '3px 9px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>
                        📷 {b.photos.length}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ height: 180, background: 'var(--haze)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon n="cube" s={32} c="var(--mist)" /></div>
                )}
                <div className="cb" style={{ paddingBottom: 8 }}>
                  <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{b.code}</div>
                  {b.sys_code && <div style={{ fontSize: 11, color: 'var(--mist)', fontFamily: 'monospace', marginBottom: 4 }}>{b.sys_code}</div>}
                  <div style={{ fontSize: 13, marginBottom: 4 }}>{b.material}</div>
                  <div style={{ fontSize: 11, color: 'var(--mist)', marginBottom: 6 }}>Classif. {b.classification} · {(b.net_volume || 0).toFixed(2)} m³</div>
                  <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--sap7)' }}>
                    {money(b.total_value, b.currency)}
                  </div>
                </div>
              </div>
              <div style={{ padding: '0 14px 14px' }}>
                <button className="btn bb bsm" style={{ width: '100%' }} onClick={() => openAddToVisit(b)}>
                  + Adicionar à Inspeção
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {detail && (
        <BlockDetailModal block={detail} quarry={null} onClose={() => setDetail(null)} />
      )}

      {/* Modal: selecionar inspeção pra adicionar bloco */}
      {addBlockToVisit && (
        <div className="mo" onClick={() => setAddBlockToVisit(null)}>
          <div className="md" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div className="mhead">
              <div>
                <div className="mtit">📍 Adicionar à Inspeção</div>
                <div style={{ fontSize: 13, color: 'var(--mist)', marginTop: 4 }}>
                  Bloco {addBlockToVisit.block.code} — {addBlockToVisit.block.material}
                </div>
              </div>
              <button className="btn bo bsm" onClick={() => setAddBlockToVisit(null)} disabled={adding}>
                <Icon n="x" s={14} />
              </button>
            </div>
            <div className="mbody">
              {addBlockToVisit.visits.length === 0 ? (
                <>
                  <div style={{ background: '#fef3c7', padding: 14, borderRadius: 10, marginBottom: 14 }}>
                    <div style={{ fontWeight: 700, color: '#854d0e', marginBottom: 6 }}>
                      ⚠️ Você ainda não tem inspeção aberta
                    </div>
                    <div style={{ fontSize: 13, color: '#92400e', lineHeight: 1.5 }}>
                      Não foi encontrada nenhuma inspeção aberta. Deseja criar uma nova inspeção agora e adicionar este bloco a ela?
                    </div>
                  </div>
                  <button className="btn bb" style={{ width: '100%' }} onClick={createNewVisitAndAdd} disabled={adding}>
                    {adding ? <><span className="spinner"></span> Criando...</> : '🚀 Criar Inspeção e Adicionar'}
                  </button>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 13, color: 'var(--mist)', marginBottom: 10 }}>
                    Selecione uma inspeção aberta:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                    {addBlockToVisit.visits.map(v => (
                      <button
                        key={v.id}
                        className="card"
                        style={{ textAlign: 'left', cursor: 'pointer', padding: 12, border: '1px solid var(--fog)', background: '#fff' }}
                        onClick={() => addToExistingVisit(v.id)}
                        disabled={adding}
                      >
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{fmtDate(v.visit_date)}</div>
                        <div style={{ fontSize: 12, color: 'var(--mist)', marginTop: 2 }}>
                          {v.notes ? v.notes.slice(0, 60) : 'Sem observações'}
                        </div>
                      </button>
                    ))}
                  </div>
                  <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--mist)', marginBottom: 10 }}>— ou —</div>
                  <button className="btn bo" style={{ width: '100%' }} onClick={createNewVisitAndAdd} disabled={adding}>
                    {adding ? <><span className="spinner"></span> Criando...</> : '+ Criar Nova Inspeção'}
                  </button>
                </>
              )}
            </div>
            <div className="mfoot">
              <button className="btn bo" onClick={() => setAddBlockToVisit(null)} disabled={adding}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// FINALIZE INSPECTION PURCHASE MODAL — modal "Finalizar Compra"
// ═══════════════════════════════════════════════════════════════
function FinalizeInspectionPurchaseModal({ profile, buyerData, visit, onClose, onFinalized, toast }) {
  const inspections = buyerData?.inspections || []
  const externalBlocks = buyerData?.externalBlocks || []
  const inspectionsHere = inspections.filter(i => i.inspection_id === visit.id)
  const externalsHere = externalBlocks.filter(b => b.inspection_id === visit.id)

  const [paymentMethods, setPaymentMethods] = useState([])
  const [originalBlocks, setOriginalBlocks] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    dollar_rate: '',
    payment_method_id: '',
    payment_method_name: '',
    notes: '',
  })

  // Carrega blocos originais e payment methods da pedreira
  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        // Carrega blocos originais (para descobrir quarry_company_id)
        const origIds = [...new Set(inspectionsHere.map(i => i.original_block_id))]
        const map = {}
        let quarryCompanyId = null
        for (const id of origIds) {
          const { data } = await supabase.from('blocks').select('*').eq('id', id).maybeSingle()
          if (data) {
            map[id] = data
            if (!quarryCompanyId) quarryCompanyId = data.company_id
          }
        }
        setOriginalBlocks(map)

        // Se for Stone Block, carrega payment methods da pedreira
        if (visit.uses_stone_block && quarryCompanyId) {
          const pm = await api.listPaymentMethodsForQuarry(quarryCompanyId)
          setPaymentMethods(pm)
        }
      } catch (e) {
        console.error(e)
      } finally { setLoading(false) }
    })()
  }, [visit.id])

  // Calcula totais
  let totalUSD = 0
  let totalBRL = 0
  inspectionsHere.forEach(i => {
    const orig = originalBlocks[i.original_block_id]
    const val = Number(i.negotiated_value) || Number(orig?.total_value) || 0
    const cur = i.negotiated_currency || orig?.currency || 'USD'
    if (cur === 'USD') totalUSD += val
    else totalBRL += val
  })
  externalsHere.forEach(b => {
    const val = Number(b.total_value) || 0
    if ((b.currency || 'USD') === 'USD') totalUSD += val
    else totalBRL += val
  })

  const dollarRate = parseFloat(form.dollar_rate) || 0
  const totalCombinedBRL = totalBRL + (totalUSD * dollarRate)

  const handlePaymentMethodChange = (id) => {
    const pm = paymentMethods.find(p => p.id === id)
    setForm({ ...form, payment_method_id: id, payment_method_name: pm?.name || '' })
  }

  const save = async () => {
    if (visit.uses_stone_block && totalUSD > 0 && !dollarRate) {
      toast('Informe a cotação do dólar.', 'err'); return
    }
    if (!form.payment_method_name && !form.payment_method_id) {
      toast('Informe a forma de pagamento.', 'err'); return
    }
    setSaving(true)
    try {
      const payload = {
        dollar_rate: dollarRate,
        payment_method_id: form.payment_method_id || null,
        payment_method_name: form.payment_method_name || null,
        notes: form.notes.trim() || null,
      }
      let result
      if (visit.uses_stone_block) {
        // Stone Block: envia PEDIDO de compra (aguarda aprovação da pedreira)
        result = await api.sendPurchaseOrder(profile, visit.id, payload)
        toast('📤 Pedido de compra enviado! Aguarde aprovação da pedreira.', 'ok')
      } else {
        // Externa: finaliza direto
        result = await api.finalizeInspectionPurchase(profile, visit.id, payload)
        toast('✅ Compra finalizada!', 'ok')
      }
      if (onFinalized) await onFinalized(result)
    } catch (e) {
      console.error('Erro:', e)
      toast('Erro: ' + e.message, 'err')
    } finally { setSaving(false) }
  }

  const totalBlocks = inspectionsHere.length + externalsHere.length
  const isOrder = visit.uses_stone_block

  return (
    <div className="mo" onClick={onClose}>
      <div className="md" style={{ maxWidth: 720 }} onClick={e => e.stopPropagation()}>
        <div className="mhead">
          <div>
            <div className="mtit">{isOrder ? '📤 Enviar Pedido de Compra' : '💰 Finalizar Compra'}</div>
            <div style={{ fontSize: 13, color: 'var(--mist)', marginTop: 4 }}>
              {totalBlocks} bloco(s) · {isOrder ? 'Aguarda aprovação da pedreira' : 'Esta ação é definitiva'}
            </div>
          </div>
          <button className="btn bo bsm" onClick={onClose}><Icon n="x" s={14} /></button>
        </div>
        <div className="mbody">
          {loading ? (
            <div style={{ padding: 30, textAlign: 'center', color: 'var(--mist)' }}><span className="spinner"></span> Carregando...</div>
          ) : (
            <>
              {/* Resumo */}
              <div style={{ background: 'var(--haze)', padding: 14, borderRadius: 10, marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--mist)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>📋 Resumo dos blocos</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
                  {inspectionsHere.map(i => {
                    const orig = originalBlocks[i.original_block_id]
                    const val = i.negotiated_value || orig?.total_value
                    const cur = i.negotiated_currency || orig?.currency
                    return (
                      <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>📷 {orig?.code || '?'} — {orig?.material}</span>
                        <strong>{money(val, cur)}</strong>
                      </div>
                    )
                  })}
                  {externalsHere.map(b => (
                    <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>📍 {b.code} — {b.material}</span>
                      <strong>{money(b.total_value, b.currency)}</strong>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid var(--fog)', marginTop: 10, paddingTop: 10 }}>
                  {totalUSD > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                      <span>Total USD:</span>
                      <strong style={{ color: 'var(--sap7)' }}>{money(totalUSD, 'USD')}</strong>
                    </div>
                  )}
                  {totalBRL > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                      <span>Total BRL:</span>
                      <strong style={{ color: 'var(--sap7)' }}>{money(totalBRL, 'BRL')}</strong>
                    </div>
                  )}
                  {dollarRate > 0 && totalUSD > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700, color: 'var(--ok)', marginTop: 4 }}>
                      <span>Total convertido R$:</span>
                      <span>{money(totalCombinedBRL, 'BRL')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Cotação do dólar */}
              {totalUSD > 0 && (
                <div className="fg">
                  <label className="fl">Cotação do dólar (R$/US$) *</label>
                  <input className="fc" type="number" step="0.0001" value={form.dollar_rate} onChange={e => setForm({ ...form, dollar_rate: e.target.value })} placeholder="Ex: 5.20" />
                </div>
              )}

              {/* Forma de pagamento */}
              {visit.uses_stone_block && paymentMethods.length > 0 ? (
                <div className="fg">
                  <label className="fl">Forma de pagamento *</label>
                  <select className="fc" value={form.payment_method_id} onChange={e => handlePaymentMethodChange(e.target.value)}>
                    <option value="">Selecione...</option>
                    {paymentMethods.map(pm => <option key={pm.id} value={pm.id}>{pm.name}</option>)}
                  </select>
                  <div style={{ fontSize: 11, color: 'var(--mist)', marginTop: 4 }}>Lista vinda da pedreira</div>
                </div>
              ) : (
                <div className="fg">
                  <label className="fl">Forma de pagamento *</label>
                  <input className="fc" value={form.payment_method_name} onChange={e => setForm({ ...form, payment_method_name: e.target.value })} placeholder="Ex: à vista, 30/60/90, FOB..." />
                </div>
              )}

              {/* Observações */}
              <div className="fg">
                <label className="fl">Observações finais</label>
                <textarea className="fc" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>

              {/* Aviso */}
              {isOrder ? (
                <div style={{ background: '#fef3c7', padding: 12, borderRadius: 8, fontSize: 13, color: '#854d0e', lineHeight: 1.5 }}>
                  📋 <strong>Como funciona o pedido de compra:</strong>
                  <ul style={{ margin: '6px 0 0 18px', padding: 0 }}>
                    <li>Os blocos ficarão reservados (somem do catálogo)</li>
                    <li>A pedreira recebe o pedido e decide aprovar ou rejeitar</li>
                    <li>Se aprovar: compra finalizada automaticamente</li>
                    <li>Se rejeitar: blocos voltam ao catálogo</li>
                    <li>Você pode cancelar o pedido enquanto estiver pendente</li>
                  </ul>
                </div>
              ) : (
                <div style={{ background: '#fee2e2', padding: 12, borderRadius: 8, fontSize: 13, color: '#991b1b', lineHeight: 1.5 }}>
                  ⚠️ <strong>Esta ação é definitiva.</strong> Após confirmar:
                  <ul style={{ margin: '6px 0 0 18px', padding: 0 }}>
                    <li>Os blocos serão marcados como comprados</li>
                    <li>Notificações serão enviadas à equipe</li>
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
        <div className="mfoot">
          <button className="btn bo" onClick={onClose} disabled={saving}>Cancelar</button>
          <button className="btn bb" onClick={save} disabled={saving || loading}>
            {saving ? <><span className="spinner"></span> Enviando</> : (isOrder ? '📤 Enviar Pedido' : '✓ Confirmar Compra')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// IND BOUGHT BLOCKS — lista de blocos comprados (bloco a bloco)
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// IND ORDERS — meus pedidos de compra (indústria)
// ═══════════════════════════════════════════════════════════════
function IndOrdersPage({ profile, buyerData, onChange, toast }) {
  const orders = buyerData?.purchaseOrders || []
  const visits = buyerData?.visits || []
  const externalQuarries = buyerData?.externalQuarries || []
  const team = buyerData?.team || []

  const [filterStatus, setFilterStatus] = useState('all')
  const [detail, setDetail] = useState(null)

  const filtered = orders.filter(o => {
    if (filterStatus !== 'all' && o.status !== filterStatus) return false
    return true
  })

  const counts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    approved: orders.filter(o => o.status === 'approved').length,
    rejected: orders.filter(o => o.status === 'rejected').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  }

  const cancel = async (order) => {
    if (!confirm('Cancelar este pedido?\n\nOs blocos voltarão a ficar disponíveis no catálogo.')) return
    try {
      await api.cancelPurchaseOrder(profile, order.id)
      toast('Pedido cancelado.', 'ok')
      onChange && onChange()
    } catch (e) { toast('Erro: ' + e.message, 'err') }
  }

  const statusBadge = (s) => {
    if (s === 'pending') return <span className="bdg" style={{ background: '#fef3c7', color: '#854d0e' }}>⏳ Pendente</span>
    if (s === 'approved') return <span className="bdg" style={{ background: '#dcfce7', color: '#15803d' }}>✅ Aprovado</span>
    if (s === 'rejected') return <span className="bdg" style={{ background: '#fee2e2', color: '#991b1b' }}>❌ Rejeitado</span>
    if (s === 'cancelled') return <span className="bdg" style={{ background: '#f3f4f6', color: '#6b7280' }}>🚫 Cancelado</span>
    return null
  }

  return (
    <div>
      <div className="ph">
        <div className="ptit">📋 Meus Pedidos</div>
        <div className="psub">{filtered.length} pedido(s) {filterStatus !== 'all' ? `(${filterStatus})` : ''}</div>
      </div>

      {/* Filtros de status */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { v: 'all',       l: `Todos (${counts.all})`,       },
          { v: 'pending',   l: `⏳ Pendentes (${counts.pending})`,   },
          { v: 'approved',  l: `✅ Aprovados (${counts.approved})`,  },
          { v: 'rejected',  l: `❌ Rejeitados (${counts.rejected})`, },
          { v: 'cancelled', l: `🚫 Cancelados (${counts.cancelled})`,},
        ].map(t => (
          <button key={t.v}
            className={'btn bsm ' + (filterStatus === t.v ? 'bb' : 'bo')}
            onClick={() => setFilterStatus(t.v)}>
            {t.l}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="es">
          <div style={{ marginBottom: 12, opacity: .3 }}><Icon n="card" s={48} /></div>
          <div className="estit">{orders.length === 0 ? 'Nenhum pedido ainda' : 'Nenhum pedido com este filtro'}</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))' }}>
          {filtered.map(o => {
            const visit = visits.find(v => v.id === o.inspection_id)
            const quarry = visit ? externalQuarries.find(q => q.id === visit.external_quarry_id) : null
            const marker = visit ? team.find(m => m.id === visit.marker_id) : null
            return (
              <div key={o.id} className="card" style={{ borderTop: `4px solid ${o.status === 'pending' ? '#f59e0b' : o.status === 'approved' ? '#10b981' : o.status === 'rejected' ? '#ef4444' : '#9ca3af'}` }}>
                <div className="cb">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    {statusBadge(o.status)}
                    <span style={{ fontSize: 11, color: 'var(--mist)' }}>{fmtDate(o.created_at)}</span>
                  </div>
                  <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>📍 {quarry?.name || '—'}</div>
                  <div style={{ fontSize: 12, color: 'var(--mist)', marginBottom: 8 }}>👤 {marker?.name || '—'}</div>
                  {o.total_usd > 0 && <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--sap7)' }}>{money(o.total_usd, 'USD')}</div>}
                  {o.total_brl > 0 && <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--sap7)' }}>{money(o.total_brl, 'BRL')}</div>}
                  {o.payment_method_name && <div style={{ fontSize: 11, color: 'var(--mist)', marginTop: 4 }}>💳 {o.payment_method_name}</div>}
                  {o.rejection_reason && <div style={{ fontSize: 12, color: '#991b1b', marginTop: 6, background: '#fee2e2', padding: 6, borderRadius: 6 }}>Motivo: {o.rejection_reason}</div>}

                  <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                    <button className="btn bo bsm" onClick={() => setDetail({ order: o, visit, quarry, marker })}>
                      Ver Detalhes
                    </button>
                    {o.status === 'pending' && (
                      <button className="btn bsm" style={{ background: '#fee2e2', color: '#991b1b' }} onClick={() => cancel(o)}>
                        🚫 Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {detail && <PurchaseOrderDetailModal item={detail} onClose={() => setDetail(null)} />}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// PURCHASE ORDER DETAIL MODAL — usado pelos dois lados
// ═══════════════════════════════════════════════════════════════
function PurchaseOrderDetailModal({ item, onClose, isQuarrySide, profile, toast, onAction }) {
  const { order, visit, quarry, marker, buyerName } = item
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)
  const [showRejectInput, setShowRejectInput] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const data = await api.listPurchaseOrderItems(order.id)
        setItems(data)
      } catch (e) {
        console.error(e)
      } finally { setLoading(false) }
    })()
  }, [order.id])

  const approve = async () => {
    if (!confirm('Aprovar este pedido?\n\nA venda será criada automaticamente e os blocos serão marcados como vendidos.')) return
    setActing(true)
    try {
      await api.approvePurchaseOrder(profile, order.id)
      toast('Pedido aprovado!', 'ok')
      if (onAction) await onAction()
      onClose()
    } catch (e) { toast('Erro: ' + e.message, 'err') } finally { setActing(false) }
  }

  const reject = async () => {
    if (!rejectReason.trim()) { toast('Informe um motivo.', 'err'); return }
    setActing(true)
    try {
      await api.rejectPurchaseOrder(profile, order.id, rejectReason.trim())
      toast('Pedido rejeitado.', 'ok')
      if (onAction) await onAction()
      onClose()
    } catch (e) { toast('Erro: ' + e.message, 'err') } finally { setActing(false) }
  }

  const statusBadge = (s) => {
    if (s === 'pending') return <span className="bdg" style={{ background: '#fef3c7', color: '#854d0e' }}>⏳ Pendente</span>
    if (s === 'approved') return <span className="bdg" style={{ background: '#dcfce7', color: '#15803d' }}>✅ Aprovado</span>
    if (s === 'rejected') return <span className="bdg" style={{ background: '#fee2e2', color: '#991b1b' }}>❌ Rejeitado</span>
    if (s === 'cancelled') return <span className="bdg" style={{ background: '#f3f4f6', color: '#6b7280' }}>🚫 Cancelado</span>
    return null
  }

  return (
    <div className="mo" onClick={onClose}>
      <div className="md" style={{ maxWidth: 760 }} onClick={e => e.stopPropagation()}>
        <div className="mhead">
          <div>
            <div className="mtit">📋 Pedido #{order.id?.slice(0, 8)}</div>
            <div style={{ fontSize: 13, color: 'var(--mist)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              {statusBadge(order.status)}
              <span>· {fmtDate(order.created_at)}</span>
            </div>
          </div>
          <button className="btn bo bsm" onClick={onClose}><Icon n="x" s={14} /></button>
        </div>
        <div className="mbody">
          <div style={{ background: 'var(--haze)', padding: 14, borderRadius: 10, marginBottom: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10, fontSize: 13 }}>
              {isQuarrySide && (
                <div>
                  <div style={{ fontSize: 11, color: 'var(--mist)', textTransform: 'uppercase', letterSpacing: .5 }}>Indústria</div>
                  <div style={{ fontWeight: 700 }}>{buyerName || '—'}</div>
                </div>
              )}
              {!isQuarrySide && (
                <div>
                  <div style={{ fontSize: 11, color: 'var(--mist)', textTransform: 'uppercase', letterSpacing: .5 }}>Pedreira</div>
                  <div style={{ fontWeight: 700 }}>{quarry?.name || '—'}</div>
                </div>
              )}
              {marker && (
                <div>
                  <div style={{ fontSize: 11, color: 'var(--mist)', textTransform: 'uppercase', letterSpacing: .5 }}>Marcador</div>
                  <div style={{ fontWeight: 700 }}>{marker.name}</div>
                </div>
              )}
              <div>
                <div style={{ fontSize: 11, color: 'var(--mist)', textTransform: 'uppercase', letterSpacing: .5 }}>Pagamento</div>
                <div style={{ fontWeight: 700 }}>{order.payment_method_name || '—'}</div>
              </div>
              {order.dollar_rate && (
                <div>
                  <div style={{ fontSize: 11, color: 'var(--mist)', textTransform: 'uppercase', letterSpacing: .5 }}>Dólar</div>
                  <div style={{ fontWeight: 700 }}>R$ {Number(order.dollar_rate).toFixed(4)}</div>
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--fog)', marginTop: 10, paddingTop: 10 }}>
              {order.total_usd > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Total USD:</span><strong style={{ color: 'var(--sap7)' }}>{money(order.total_usd, 'USD')}</strong></div>}
              {order.total_brl > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Total BRL:</span><strong style={{ color: 'var(--sap7)' }}>{money(order.total_brl, 'BRL')}</strong></div>}
            </div>

            {order.notes && (
              <div style={{ marginTop: 10, fontSize: 13 }}>
                <strong>Observações:</strong> {order.notes}
              </div>
            )}

            {order.rejection_reason && (
              <div style={{ marginTop: 10, fontSize: 13, background: '#fee2e2', padding: 10, borderRadius: 8, color: '#991b1b' }}>
                <strong>Motivo da rejeição:</strong> {order.rejection_reason}
              </div>
            )}
          </div>

          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--mist)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            🏗️ {items.length} bloco(s) no pedido
          </div>

          {loading ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--mist)' }}><span className="spinner"></span> Carregando blocos...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {items.map(it => (
                <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, background: 'var(--haze)', borderRadius: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{it.code || '?'}</div>
                    <div style={{ fontSize: 12, color: 'var(--mist)' }}>{it.material}</div>
                    {it.net_volume && <div style={{ fontSize: 11, color: 'var(--mist)' }}>{Number(it.net_volume).toFixed(2)} m³{it.price_m3 ? ` · ${money(it.price_m3, it.currency)}/m³` : ''}</div>}
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--sap7)' }}>{money(it.total_value, it.currency)}</div>
                </div>
              ))}
            </div>
          )}

          {/* Rejeição: input de motivo */}
          {showRejectInput && order.status === 'pending' && isQuarrySide && (
            <div style={{ marginTop: 14, padding: 14, background: '#fee2e2', borderRadius: 10 }}>
              <div className="fl" style={{ color: '#991b1b' }}>Motivo da rejeição *</div>
              <textarea className="fc" rows={2} value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Ex: bloco já vendido, preço inadequado..." />
              <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
                <button className="btn bo bsm" onClick={() => { setShowRejectInput(false); setRejectReason('') }}>Cancelar</button>
                <button className="btn bsm" style={{ background: '#ef4444', color: '#fff' }} onClick={reject} disabled={acting}>
                  {acting ? 'Rejeitando...' : 'Confirmar Rejeição'}
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="mfoot">
          <button className="btn bo" onClick={onClose} disabled={acting}>Fechar</button>
          {/* Botões da pedreira */}
          {isQuarrySide && order.status === 'pending' && !showRejectInput && (
            <>
              <button className="btn" style={{ background: '#ef4444', color: '#fff' }} onClick={() => setShowRejectInput(true)} disabled={acting}>
                ❌ Rejeitar
              </button>
              <button className="btn" style={{ background: '#10b981', color: '#fff' }} onClick={approve} disabled={acting}>
                {acting ? 'Aprovando...' : '✅ Aprovar Pedido'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// QUARRY PURCHASE ORDERS — lado pedreira (aprovar/rejeitar)
// ═══════════════════════════════════════════════════════════════
function QuarryPurchaseOrdersPage({ profile, onChange, toast }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [buyerNames, setBuyerNames] = useState({})
  const [filterStatus, setFilterStatus] = useState('pending')
  const [detail, setDetail] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await api.listPurchaseOrdersForQuarry(profile)
      setOrders(data)
      // Carrega nomes das indústrias
      const buyerIds = [...new Set(data.map(o => o.buyer_company_id).filter(Boolean))]
      if (buyerIds.length > 0) {
        const { data: bs } = await supabase
          .from('buyer_companies').select('id, name').in('id', buyerIds)
        const m = {}
        for (const b of (bs || [])) m[b.id] = b.name
        setBuyerNames(m)
      }
    } catch (e) {
      toast('Erro: ' + e.message, 'err')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filtered = orders.filter(o => filterStatus === 'all' || o.status === filterStatus)

  const counts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    approved: orders.filter(o => o.status === 'approved').length,
    rejected: orders.filter(o => o.status === 'rejected').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  }

  const statusBadge = (s) => {
    if (s === 'pending') return <span className="bdg" style={{ background: '#fef3c7', color: '#854d0e' }}>⏳ Pendente</span>
    if (s === 'approved') return <span className="bdg" style={{ background: '#dcfce7', color: '#15803d' }}>✅ Aprovado</span>
    if (s === 'rejected') return <span className="bdg" style={{ background: '#fee2e2', color: '#991b1b' }}>❌ Rejeitado</span>
    if (s === 'cancelled') return <span className="bdg" style={{ background: '#f3f4f6', color: '#6b7280' }}>🚫 Cancelado</span>
    return null
  }

  return (
    <div>
      <div className="ph">
        <div className="ptit">📥 Pedido de Compra</div>
        <div className="psub">{filtered.length} pedido(s) {filterStatus !== 'all' ? `(${filterStatus})` : ''}</div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { v: 'pending',   l: `⏳ Pendentes (${counts.pending})`,   },
          { v: 'approved',  l: `✅ Aprovados (${counts.approved})`,  },
          { v: 'rejected',  l: `❌ Rejeitados (${counts.rejected})`, },
          { v: 'cancelled', l: `🚫 Cancelados (${counts.cancelled})`,},
          { v: 'all',       l: `Todos (${counts.all})`,              },
        ].map(t => (
          <button key={t.v}
            className={'btn bsm ' + (filterStatus === t.v ? 'bb' : 'bo')}
            onClick={() => setFilterStatus(t.v)}>
            {t.l}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--mist)' }}><span className="spinner"></span> Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="es">
          <div style={{ marginBottom: 12, opacity: .3 }}><Icon n="card" s={48} /></div>
          <div className="estit">{orders.length === 0 ? 'Nenhum pedido recebido' : 'Nenhum pedido com este filtro'}</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))' }}>
          {filtered.map(o => (
            <div key={o.id} className="card" style={{ borderTop: `4px solid ${o.status === 'pending' ? '#f59e0b' : o.status === 'approved' ? '#10b981' : o.status === 'rejected' ? '#ef4444' : '#9ca3af'}`, cursor: 'pointer' }} onClick={() => setDetail({ order: o, buyerName: buyerNames[o.buyer_company_id] })}>
              <div className="cb">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  {statusBadge(o.status)}
                  <span style={{ fontSize: 11, color: 'var(--mist)' }}>{fmtDate(o.created_at)}</span>
                </div>
                <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>🏭 {buyerNames[o.buyer_company_id] || '...'}</div>
                {o.total_usd > 0 && <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--sap7)' }}>{money(o.total_usd, 'USD')}</div>}
                {o.total_brl > 0 && <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--sap7)' }}>{money(o.total_brl, 'BRL')}</div>}
                {o.payment_method_name && <div style={{ fontSize: 11, color: 'var(--mist)', marginTop: 4 }}>💳 {o.payment_method_name}</div>}
                {o.status === 'pending' && (
                  <div style={{ marginTop: 8, fontSize: 12, color: '#854d0e', fontWeight: 600 }}>👆 Clique para aprovar/rejeitar</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {detail && (
        <PurchaseOrderDetailModal
          item={detail}
          isQuarrySide={true}
          profile={profile}
          toast={toast}
          onAction={async () => { await load(); onChange && onChange() }}
          onClose={() => setDetail(null)}
        />
      )}
    </div>
  )
}

function IndBoughtBlocksPage({ profile, buyerData, onChange, toast }) {
  const purchases = buyerData?.purchases || []
  const visits = buyerData?.visits || []
  const inspections = buyerData?.inspections || []
  const externalBlocks = buyerData?.externalBlocks || []
  const team = buyerData?.team || []
  const externalQuarries = buyerData?.externalQuarries || []

  const [filterPeriod, setFilterPeriod] = useState('all')
  const [dtInicio, setDtInicio] = useState('')
  const [dtFim, setDtFim] = useState('')
  const [filterMarker, setFilterMarker] = useState('')
  const [filterQuarry, setFilterQuarry] = useState('')
  const [filterMaterial, setFilterMaterial] = useState('')
  const [search, setSearch] = useState('')
  const [originalBlocks, setOriginalBlocks] = useState({})
  const [detail, setDetail] = useState(null) // bloco selecionado pra ver detalhes

  // Só inspeções que pertencem a compras finalizadas
  const finalizedInspectionIds = new Set(purchases.map(p => p.inspection_id))

  // Carrega blocos originais das inspeções
  useEffect(() => {
    const relevantInsp = inspections.filter(i => finalizedInspectionIds.has(i.inspection_id))
    const ids = [...new Set(relevantInsp.map(i => i.original_block_id))]
    if (ids.length === 0) return
    ;(async () => {
      const map = {}
      for (const id of ids) {
        try {
          const { data } = await supabase.from('blocks').select('*').eq('id', id).maybeSingle()
          if (data) {
            map[id] = {
              ...data,
              photos: Array.isArray(data.photos) ? data.photos
                : (typeof data.photos === 'string' ? (data.photos.startsWith('[') ? JSON.parse(data.photos) : [data.photos]) : []),
            }
          }
        } catch (e) {}
      }
      setOriginalBlocks(map)
    })()
  }, [inspections.length, purchases.length])

  // Monta lista unificada de blocos comprados
  const items = []
  inspections.filter(i => finalizedInspectionIds.has(i.inspection_id)).forEach(i => {
    const orig = originalBlocks[i.original_block_id]
    const purchase = purchases.find(p => p.inspection_id === i.inspection_id)
    const visit = visits.find(v => v.id === i.inspection_id)
    const quarry = visit ? externalQuarries.find(q => q.id === visit.external_quarry_id) : null
    const marker = visit ? team.find(m => m.id === visit.marker_id) : null
    items.push({
      type: 'inspection',
      id: i.id,
      code: orig?.code || '?',
      material: orig?.material || '—',
      classification: orig?.classification,
      volume: orig?.net_volume || 0,
      value: i.negotiated_value || orig?.total_value,
      currency: i.negotiated_currency || orig?.currency,
      photo: (i.photos && i.photos[0]) || (orig?.photos && orig.photos[0]),
      photos: [...(i.photos || []), ...((orig?.photos) || [])],
      quarry_name: quarry?.name || '—',
      quarry_id: visit?.external_quarry_id,
      marker_id: visit?.marker_id,
      marker_name: marker?.name || '—',
      date: purchase?.created_at,
      purchase,
      visit,
      original: orig,
      inspection: i,
    })
  })
  externalBlocks.filter(b => finalizedInspectionIds.has(b.inspection_id)).forEach(b => {
    const purchase = purchases.find(p => p.inspection_id === b.inspection_id)
    const visit = visits.find(v => v.id === b.inspection_id)
    const quarry = externalQuarries.find(q => q.id === b.external_quarry_id)
    const marker = visit ? team.find(m => m.id === visit.marker_id) : null
    items.push({
      type: 'external',
      id: b.id,
      code: b.code,
      material: b.material,
      classification: b.classification,
      volume: b.net_volume || 0,
      value: b.total_value,
      currency: b.currency,
      photo: b.photos && b.photos[0],
      photos: b.photos || [],
      quarry_name: quarry?.name || '—',
      quarry_id: b.external_quarry_id,
      marker_id: visit?.marker_id,
      marker_name: marker?.name || '—',
      date: purchase?.created_at,
      purchase,
      visit,
      block: b,
    })
  })

  const matchesPeriod = (date) => {
    if (filterPeriod === 'all' || !date) return true
    const d = new Date(date)
    const now = new Date()
    if (filterPeriod === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    if (filterPeriod === 'last_month') {
      const last = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      return d.getMonth() === last.getMonth() && d.getFullYear() === last.getFullYear()
    }
    if (filterPeriod === 'year') return d.getFullYear() === now.getFullYear()
    if (filterPeriod === 'custom') {
      if (dtInicio && d < new Date(dtInicio + 'T00:00:00')) return false
      if (dtFim && d > new Date(dtFim + 'T23:59:59')) return false
      return true
    }
    return true
  }

  const filtered = items.filter(it => {
    if (!matchesPeriod(it.date)) return false
    if (filterMarker && it.marker_id !== filterMarker) return false
    if (filterQuarry && it.quarry_id !== filterQuarry) return false
    if (filterMaterial && it.material !== filterMaterial) return false
    if (search && !(it.code || '').toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const allMaterials = [...new Set(items.map(it => it.material).filter(Boolean))].sort()
  const hasFilter = filterPeriod !== 'all' || filterMarker || filterQuarry || filterMaterial || search || dtInicio || dtFim

  // Totais
  let totalUSD = 0, totalBRL = 0
  filtered.forEach(it => {
    if ((it.currency || 'USD') === 'USD') totalUSD += Number(it.value) || 0
    else totalBRL += Number(it.value) || 0
  })

  return (
    <div>
      <div className="ph">
        <div className="ptit">🧱 Blocos Comprados</div>
        <div className="psub">{filtered.length} bloco(s){hasFilter ? ` de ${items.length}` : ''}</div>
      </div>

      {/* Totais */}
      {(totalUSD > 0 || totalBRL > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, marginBottom: 16 }}>
          {totalUSD > 0 && (
            <div className="card" style={{ background: 'linear-gradient(135deg,#10b981,#059669)', border: 'none' }}>
              <div className="cb">
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.8)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Total US$</div>
                <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 22, color: '#fff' }}>{money(totalUSD, 'USD')}</div>
              </div>
            </div>
          )}
          {totalBRL > 0 && (
            <div className="card" style={{ background: 'linear-gradient(135deg,#0c1a2e,#1e3a8a)', border: 'none' }}>
              <div className="cb">
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.8)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Total R$</div>
                <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 22, color: '#fff' }}>{money(totalBRL, 'BRL')}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filtros */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="cb" style={{ padding: '12px 14px' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--mist)', textTransform: 'uppercase', letterSpacing: .5 }}>Filtros:</span>
            <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 170 }} value={filterPeriod} onChange={e => setFilterPeriod(e.target.value)}>
              <option value="all">Todos os períodos</option>
              <option value="month">Mês atual</option>
              <option value="last_month">Mês anterior</option>
              <option value="year">Ano atual</option>
              <option value="custom">Personalizado</option>
            </select>
            {filterPeriod === 'custom' && (
              <>
                <input type="date" className="fc" style={{ fontSize: 13, padding: '7px 10px' }} value={dtInicio} onChange={e => setDtInicio(e.target.value)} />
                <input type="date" className="fc" style={{ fontSize: 13, padding: '7px 10px' }} value={dtFim} onChange={e => setDtFim(e.target.value)} />
              </>
            )}
            <input className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 140, textTransform: 'uppercase' }} placeholder="🔍 Código..." value={search} onChange={e => setSearch(e.target.value.toUpperCase())} />
            <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 180 }} value={filterMarker} onChange={e => setFilterMarker(e.target.value)}>
              <option value="">Todos os marcadores</option>
              {team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 180 }} value={filterQuarry} onChange={e => setFilterQuarry(e.target.value)}>
              <option value="">Todas as pedreiras</option>
              {externalQuarries.map(q => <option key={q.id} value={q.id}>{q.name}</option>)}
            </select>
            <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 180 }} value={filterMaterial} onChange={e => setFilterMaterial(e.target.value)}>
              <option value="">Todos os materiais</option>
              {allMaterials.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            {hasFilter && (
              <button className="btn bo bsm" onClick={() => { setFilterPeriod('all'); setFilterMarker(''); setFilterQuarry(''); setFilterMaterial(''); setSearch(''); setDtInicio(''); setDtFim('') }}>
                <Icon n="x" s={13} /> Limpar
              </button>
            )}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="es">
          <div style={{ marginBottom: 12, opacity: .3 }}><Icon n="cube" s={48} /></div>
          <div className="estit">{items.length === 0 ? 'Nenhum bloco comprado ainda' : 'Nenhum bloco encontrado'}</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))' }}>
          {filtered.map(it => (
            <div key={it.type + ':' + it.id} className="card" style={{ borderTop: `4px solid ${it.type === 'inspection' ? 'var(--sap6)' : '#d97706'}`, cursor: 'pointer' }} onClick={() => setDetail(it)}>
              {it.photo ? (
                <div style={{ position: 'relative' }}>
                  <img src={it.photo} alt={it.code} style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', top: 8, left: 8, background: '#10b981', color: '#fff', padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>
                    ✓ COMPRADO
                  </div>
                </div>
              ) : (
                <div style={{ height: 160, background: 'var(--haze)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon n="cube" s={32} c="var(--mist)" /></div>
              )}
              <div className="cb">
                <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{it.code}</div>
                <div style={{ fontSize: 13, marginBottom: 4 }}>{it.material}</div>
                <div style={{ fontSize: 12, color: 'var(--mist)', marginBottom: 2 }}>📍 {it.quarry_name}</div>
                <div style={{ fontSize: 11, color: 'var(--mist)', marginBottom: 2 }}>👤 {it.marker_name}</div>
                <div style={{ fontSize: 11, color: 'var(--mist)', marginBottom: 6 }}>📅 {fmtDate(it.date)} · {it.volume.toFixed(2)} m³</div>
                <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--sap7)' }}>
                  {it.value ? money(it.value, it.currency) : '—'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {detail && (
        <BoughtBlockDetailModal item={detail} onClose={() => setDetail(null)} />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// BOUGHT BLOCK DETAIL — modal com detalhes completos
// ═══════════════════════════════════════════════════════════════
function BoughtBlockDetailModal({ item, onClose }) {
  const { type, code, material, classification, volume, value, currency, photos, quarry_name, marker_name, date, purchase, original, inspection, block } = item

  // Para inspeções: dados negociados + originais; para externos: só os do bloco
  const isStoneBlock = type === 'inspection'

  // Medidas brutas e líquidas
  const grossL = isStoneBlock ? (inspection?.negotiated_gross_l || original?.gross_l) : block?.gross_l
  const grossH = isStoneBlock ? (inspection?.negotiated_gross_h || original?.gross_h) : block?.gross_h
  const grossW = isStoneBlock ? (inspection?.negotiated_gross_w || original?.gross_w) : block?.gross_w
  const grossVol = isStoneBlock ? (inspection?.negotiated_gross_volume || original?.gross_volume) : block?.gross_volume

  const netL = isStoneBlock ? (inspection?.negotiated_l || original?.net_l) : block?.net_l
  const netH = isStoneBlock ? (inspection?.negotiated_h || original?.net_h) : block?.net_h
  const netW = isStoneBlock ? (inspection?.negotiated_w || original?.net_w) : block?.net_w
  const netVol = isStoneBlock ? (inspection?.negotiated_net_volume || original?.net_volume) : block?.net_volume

  const priceM3 = netVol > 0 && value ? (value / netVol) : null
  const notes = isStoneBlock ? inspection?.notes : block?.notes

  return (
    <div className="mo" onClick={onClose}>
      <div className="md" style={{ maxWidth: 760 }} onClick={e => e.stopPropagation()}>
        <div className="mhead">
          <div>
            <div className="mtit">🧱 {code} <span className="bdg" style={{ background: '#dcfce7', color: '#15803d', fontSize: 11, marginLeft: 8 }}>✓ COMPRADO</span></div>
            <div style={{ fontSize: 13, color: 'var(--mist)', marginTop: 4 }}>{material} · {quarry_name}</div>
          </div>
          <button className="btn bo bsm" onClick={onClose}><Icon n="x" s={14} /></button>
        </div>
        <div className="mbody">
          {photos && photos.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <PhotoGallery photos={photos} height={300} />
            </div>
          )}

          {/* Info da compra */}
          <div style={{ background: 'var(--haze)', padding: 14, borderRadius: 10, marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--mist)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>💳 Dados da compra</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10, fontSize: 13 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--mist)', textTransform: 'uppercase' }}>Data</div>
                <div style={{ fontWeight: 700 }}>{fmtDate(date)}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--mist)', textTransform: 'uppercase' }}>Marcador</div>
                <div style={{ fontWeight: 700 }}>{marker_name}</div>
              </div>
              {purchase?.payment_method_name && (
                <div>
                  <div style={{ fontSize: 11, color: 'var(--mist)', textTransform: 'uppercase' }}>Pagamento</div>
                  <div style={{ fontWeight: 700 }}>{purchase.payment_method_name}</div>
                </div>
              )}
              {purchase?.dollar_rate && (
                <div>
                  <div style={{ fontSize: 11, color: 'var(--mist)', textTransform: 'uppercase' }}>Dólar</div>
                  <div style={{ fontWeight: 700 }}>R$ {Number(purchase.dollar_rate).toFixed(4)}</div>
                </div>
              )}
            </div>
          </div>

          {/* Dados básicos */}
          <div style={{ marginBottom: 14, fontSize: 13, lineHeight: 1.7 }}>
            <div><strong>Material:</strong> {material}</div>
            <div><strong>Classificação:</strong> {classification || '—'}</div>
            {isStoneBlock && original?.sys_code && <div><strong>Código do sistema:</strong> {original.sys_code}</div>}
          </div>

          {/* Medidas brutas */}
          <div style={{ background: '#f3f4f6', padding: 12, borderRadius: 8, marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--mist)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>📐 Medidas brutas</div>
            {grossL ? (
              <>
                <div style={{ fontSize: 13 }}>comp: {grossL} m · alt: {grossH} m · larg: {grossW} m</div>
                <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>Volume: {(grossVol || 0).toFixed(2)} m³</div>
              </>
            ) : <div style={{ fontSize: 12, color: 'var(--mist)' }}>—</div>}
          </div>

          {/* Medidas líquidas */}
          <div style={{ background: '#dcfce7', padding: 12, borderRadius: 8, marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>📐 Medidas líquidas</div>
            {netL ? (
              <>
                <div style={{ fontSize: 13 }}>comp: {netL} m · alt: {netH} m · larg: {netW} m</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#15803d', marginTop: 2 }}>Volume: {(netVol || 0).toFixed(2)} m³</div>
              </>
            ) : <div style={{ fontSize: 12, color: 'var(--mist)' }}>—</div>}
          </div>

          {/* Valores */}
          <div style={{ background: 'var(--sap1)', padding: 12, borderRadius: 8, marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--sap7)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>💰 Valores</div>
            {priceM3 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 4 }}>
                <span>Preço por m³:</span>
                <strong>{money(priceM3, currency)}</strong>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16 }}>
              <span><strong>Total:</strong></span>
              <strong style={{ color: 'var(--sap7)' }}>{value ? money(value, currency) : '—'}</strong>
            </div>
          </div>

          {/* Histórico (se houve sobrescrita) */}
          {isStoneBlock && original?.original_total_value && (
            <div style={{ background: '#fef3c7', padding: 12, borderRadius: 8, marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#854d0e', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>📜 Valores originais da pedreira (antes da negociação)</div>
              {original.original_net_l && (
                <div style={{ fontSize: 12 }}>Líquidas originais: {original.original_net_l} × {original.original_net_h} × {original.original_net_w} m ({(original.original_net_volume || 0).toFixed(2)} m³)</div>
              )}
              {original.original_total_value && (
                <div style={{ fontSize: 12 }}>Valor original: {money(original.original_total_value, original.original_currency)}</div>
              )}
            </div>
          )}

          {notes && (
            <div style={{ background: 'var(--haze)', padding: 12, borderRadius: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--mist)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Observações</div>
              <div style={{ fontSize: 13 }}>{notes}</div>
            </div>
          )}
        </div>
        <div className="mfoot">
          <button className="btn bo" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// IND PURCHASES — lista de compras finalizadas
// ═══════════════════════════════════════════════════════════════
function IndPurchasesPage({ profile, buyerData, onChange, toast }) {
  const purchases = buyerData?.purchases || []
  const visits = buyerData?.visits || []
  const team = buyerData?.team || []
  const externalQuarries = buyerData?.externalQuarries || []

  const [filterPeriod, setFilterPeriod] = useState('month')
  const [dtInicio, setDtInicio] = useState('')
  const [dtFim, setDtFim] = useState('')
  const [filterMarker, setFilterMarker] = useState('')
  const [filterQuarry, setFilterQuarry] = useState('')
  const [search, setSearch] = useState('')
  const [detail, setDetail] = useState(null)

  const matchesPeriod = (date) => {
    if (filterPeriod === 'all') return true
    const d = new Date(date)
    const now = new Date()
    if (filterPeriod === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    if (filterPeriod === 'last_month') {
      const last = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      return d.getMonth() === last.getMonth() && d.getFullYear() === last.getFullYear()
    }
    if (filterPeriod === 'year') return d.getFullYear() === now.getFullYear()
    if (filterPeriod === 'custom') {
      if (dtInicio && d < new Date(dtInicio + 'T00:00:00')) return false
      if (dtFim && d > new Date(dtFim + 'T23:59:59')) return false
      return true
    }
    return true
  }

  const filtered = purchases.filter(p => {
    if (!matchesPeriod(p.created_at)) return false
    const visit = visits.find(v => v.id === p.inspection_id)
    if (filterMarker && visit?.marker_id !== filterMarker) return false
    if (filterQuarry && p.external_quarry_id !== filterQuarry) return false
    // busca: por código de bloco está no detalhe; aqui filtramos por id ou nome da pedreira
    if (search) {
      const quarry = externalQuarries.find(q => q.id === p.external_quarry_id)
      const sLower = search.toLowerCase()
      if (!((quarry?.name || '').toLowerCase().includes(sLower)) && !(p.id || '').includes(search)) return false
    }
    return true
  })

  const hasFilter = filterPeriod !== 'month' || filterMarker || filterQuarry || dtInicio || dtFim || search

  return (
    <div>
      <div className="ph">
        <div className="ptit">💳 Compras</div>
        <div className="psub">{filtered.length} compra(s){hasFilter ? ` de ${purchases.length}` : ''}</div>
      </div>

      {/* Filtros */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="cb" style={{ padding: '12px 14px' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--mist)', textTransform: 'uppercase', letterSpacing: .5 }}>Filtros:</span>
            <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 180 }} value={filterPeriod} onChange={e => setFilterPeriod(e.target.value)}>
              <option value="month">Mês atual</option>
              <option value="last_month">Mês anterior</option>
              <option value="year">Ano atual</option>
              <option value="all">Todos os períodos</option>
              <option value="custom">Período personalizado</option>
            </select>
            {filterPeriod === 'custom' && (
              <>
                <input type="date" className="fc" style={{ fontSize: 13, padding: '7px 10px' }} value={dtInicio} onChange={e => setDtInicio(e.target.value)} />
                <input type="date" className="fc" style={{ fontSize: 13, padding: '7px 10px' }} value={dtFim} onChange={e => setDtFim(e.target.value)} />
              </>
            )}
            <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 200 }} value={filterMarker} onChange={e => setFilterMarker(e.target.value)}>
              <option value="">Todos os marcadores</option>
              {team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 200 }} value={filterQuarry} onChange={e => setFilterQuarry(e.target.value)}>
              <option value="">Todas as pedreiras</option>
              {externalQuarries.map(q => <option key={q.id} value={q.id}>{q.name}</option>)}
            </select>
            <input className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 160 }} placeholder="🔍 Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
            {hasFilter && (
              <button className="btn bo bsm" onClick={() => { setFilterPeriod('month'); setFilterMarker(''); setFilterQuarry(''); setDtInicio(''); setDtFim(''); setSearch('') }}>
                <Icon n="x" s={13} /> Limpar
              </button>
            )}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="es">
          <div style={{ marginBottom: 12, opacity: .3 }}><Icon n="card" s={48} /></div>
          <div className="estit">{purchases.length === 0 ? 'Nenhuma compra finalizada ainda' : 'Nenhuma compra encontrada com os filtros'}</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))' }}>
          {filtered.map(p => {
            const visit = visits.find(v => v.id === p.inspection_id)
            const quarry = externalQuarries.find(q => q.id === p.external_quarry_id)
            const marker = team.find(m => m.id === visit?.marker_id)
            return (
              <div key={p.id} className="card" style={{ cursor: 'pointer', borderTop: '4px solid var(--ok)' }} onClick={() => setDetail({ purchase: p, visit, quarry, marker })}>
                <div className="cb">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span className="bdg" style={{ background: '#dcfce7', color: '#15803d', fontSize: 11 }}>✓ Finalizada</span>
                    <span style={{ fontSize: 11, color: 'var(--mist)' }}>{fmtDate(p.created_at)}</span>
                  </div>
                  <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>📍 {quarry?.name || '—'}</div>
                  <div style={{ fontSize: 12, color: 'var(--mist)', marginBottom: 8 }}>👤 {marker?.name || '—'}</div>
                  {p.total_usd > 0 && (
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--sap7)' }}>{money(p.total_usd, 'USD')}</div>
                  )}
                  {p.total_brl > 0 && (
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--sap7)' }}>{money(p.total_brl, 'BRL')}</div>
                  )}
                  {p.payment_method_name && (
                    <div style={{ fontSize: 11, color: 'var(--mist)', marginTop: 4 }}>💳 {p.payment_method_name}</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {detail && <PurchaseDetailModal item={detail} buyerData={buyerData} onClose={() => setDetail(null)} />}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// PURCHASE DETAIL MODAL — detalhe de uma compra
// ═══════════════════════════════════════════════════════════════
function PurchaseDetailModal({ item, buyerData, onClose }) {
  const { purchase, visit, quarry, marker } = item
  const inspections = buyerData?.inspections || []
  const externalBlocks = buyerData?.externalBlocks || []
  const team = buyerData?.team || []
  const externalQuarries = buyerData?.externalQuarries || []
  const inspectionsHere = inspections.filter(i => i.inspection_id === purchase.inspection_id)
  const externalsHere = externalBlocks.filter(b => b.inspection_id === purchase.inspection_id)
  const [originalBlocks, setOriginalBlocks] = useState({})
  const [blockDetail, setBlockDetail] = useState(null) // detalhe de bloco específico

  useEffect(() => {
    const ids = [...new Set(inspectionsHere.map(i => i.original_block_id))]
    if (ids.length === 0) return
    ;(async () => {
      const map = {}
      for (const id of ids) {
        const { data } = await supabase.from('blocks').select('*').eq('id', id).maybeSingle()
        if (data) {
          map[id] = {
            ...data,
            photos: Array.isArray(data.photos) ? data.photos
              : (typeof data.photos === 'string' ? (data.photos.startsWith('[') ? JSON.parse(data.photos) : [data.photos]) : []),
          }
        }
      }
      setOriginalBlocks(map)
    })()
  }, [purchase.id])

  const openBlockDetail = (type, i, b) => {
    if (type === 'inspection') {
      const orig = originalBlocks[i.original_block_id]
      setBlockDetail({
        type: 'inspection',
        code: orig?.code || '?',
        material: orig?.material,
        classification: orig?.classification,
        photo: (i.photos && i.photos[0]) || (orig?.photos && orig.photos[0]),
        photos: [...(i.photos || []), ...((orig?.photos) || [])],
        volume: orig?.net_volume || 0,
        value: i.negotiated_value || orig?.total_value,
        currency: i.negotiated_currency || orig?.currency,
        quarry_name: quarry?.name || '—',
        marker_name: marker?.name || '—',
        date: purchase.created_at,
        purchase,
        original: orig,
        inspection: i,
      })
    } else {
      setBlockDetail({
        type: 'external',
        code: b.code,
        material: b.material,
        classification: b.classification,
        photo: b.photos && b.photos[0],
        photos: b.photos || [],
        volume: b.net_volume || 0,
        value: b.total_value,
        currency: b.currency,
        quarry_name: quarry?.name || '—',
        marker_name: marker?.name || '—',
        date: purchase.created_at,
        purchase,
        block: b,
      })
    }
  }

  return (
    <div className="mo" onClick={onClose}>
      <div className="md" style={{ maxWidth: 760 }} onClick={e => e.stopPropagation()}>
        <div className="mhead">
          <div>
            <div className="mtit">💳 Compra #{purchase.id?.slice(0, 8)}</div>
            <div style={{ fontSize: 13, color: 'var(--mist)', marginTop: 4 }}>{quarry?.name} · {fmtDate(purchase.created_at)}</div>
          </div>
          <button className="btn bo bsm" onClick={onClose}><Icon n="x" s={14} /></button>
        </div>
        <div className="mbody">
          <div style={{ background: 'var(--haze)', padding: 14, borderRadius: 10, marginBottom: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10, fontSize: 13 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--mist)', textTransform: 'uppercase', letterSpacing: .5 }}>Pedreira</div>
                <div style={{ fontWeight: 700 }}>{quarry?.name || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--mist)', textTransform: 'uppercase', letterSpacing: .5 }}>Marcador</div>
                <div style={{ fontWeight: 700 }}>{marker?.name || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--mist)', textTransform: 'uppercase', letterSpacing: .5 }}>Pagamento</div>
                <div style={{ fontWeight: 700 }}>{purchase.payment_method_name || '—'}</div>
              </div>
              {purchase.dollar_rate && (
                <div>
                  <div style={{ fontSize: 11, color: 'var(--mist)', textTransform: 'uppercase', letterSpacing: .5 }}>Dólar</div>
                  <div style={{ fontWeight: 700 }}>R$ {Number(purchase.dollar_rate).toFixed(4)}</div>
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--fog)', marginTop: 10, paddingTop: 10 }}>
              {purchase.total_usd > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Total USD:</span><strong style={{ color: 'var(--sap7)' }}>{money(purchase.total_usd, 'USD')}</strong></div>}
              {purchase.total_brl > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Total BRL:</span><strong style={{ color: 'var(--sap7)' }}>{money(purchase.total_brl, 'BRL')}</strong></div>}
            </div>

            {purchase.notes && (
              <div style={{ marginTop: 10, fontSize: 13 }}>
                <strong>Observações:</strong> {purchase.notes}
              </div>
            )}
          </div>

          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--mist)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            🏗️ {inspectionsHere.length + externalsHere.length} bloco(s) comprado(s) — clique para ver detalhes completos
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {inspectionsHere.map(i => {
              const orig = originalBlocks[i.original_block_id]
              const photo = (i.photos && i.photos[0]) || (orig?.photos && (Array.isArray(orig.photos) ? orig.photos[0] : null))
              return (
                <div key={i.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, background: 'var(--haze)', borderRadius: 8, cursor: 'pointer' }} onClick={() => openBlockDetail('inspection', i, null)}>
                  {photo && <img src={photo} alt="" style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 6 }} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{orig?.code || '?'} <span className="bdg" style={{ background: 'var(--sap1)', color: 'var(--sap7)', fontSize: 10, marginLeft: 4 }}>Stone Block</span></div>
                    <div style={{ fontSize: 12, color: 'var(--mist)' }}>{orig?.material}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--sap7)' }}>
                    {money(i.negotiated_value || orig?.total_value, i.negotiated_currency || orig?.currency)}
                  </div>
                </div>
              )
            })}
            {externalsHere.map(b => (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, background: '#fef3c7', borderRadius: 8, cursor: 'pointer' }} onClick={() => openBlockDetail('external', null, b)}>
                {b.photos && b.photos[0] && <img src={b.photos[0]} alt="" style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 6 }} />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{b.code} <span className="bdg" style={{ background: '#fef3c7', color: '#d97706', fontSize: 10, marginLeft: 4 }}>Externo</span></div>
                  <div style={{ fontSize: 12, color: 'var(--mist)' }}>{b.material}</div>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--sap7)' }}>{money(b.total_value, b.currency)}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="mfoot">
          <button className="btn bo" onClick={onClose}>Fechar</button>
        </div>
      </div>

      {blockDetail && (
        <BoughtBlockDetailModal item={blockDetail} onClose={() => setBlockDetail(null)} />
      )}
    </div>
  )
}

function AdminPage({ profile, toast }) {
  const [tab, setTab] = useState('buyers') // 'buyers' | 'quarries' | 'externals'
  const [buyers, setBuyers] = useState([])
  const [quarryCompanies, setQuarryCompanies] = useState([])
  const [externalQuarries, setExternalQuarriesState] = useState([])
  const [loading, setLoading] = useState(true)
  const [showBuyerForm, setShowBuyerForm] = useState(false)
  const [showQuarryForm, setShowQuarryForm] = useState(false)

  const [buyerForm, setBuyerForm] = useState({
    name: '', document: '', contact_email: '', contact_phone: '', notes: '',
    director_name: '', director_email: '', director_password: '',
  })
  const [quarryForm, setQuarryForm] = useState({
    name: '', company_name: '', phone: '',
    email: '', password: '',
  })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [b, q, e] = await Promise.all([
        api.adminListBuyerCompanies(),
        api.adminListQuarryCompanies(),
        api.listExternalQuarries(),
      ])
      setBuyers(b); setQuarryCompanies(q); setExternalQuarriesState(e)
    } catch (e) { toast('Erro: ' + e.message, 'err') }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const saveBuyer = async () => {
    if (!buyerForm.name.trim()) { toast('Nome da indústria obrigatório.', 'err'); return }
    if (!buyerForm.director_name.trim() || !buyerForm.director_email.trim() || !buyerForm.director_password) {
      toast('Dados do diretor são obrigatórios.', 'err'); return
    }
    if (buyerForm.director_password.length < 6) { toast('Senha mínima 6 caracteres.', 'err'); return }
    setSaving(true)
    try {
      await api.adminCreateBuyerCompany(
        {
          name: buyerForm.name.trim(),
          document: buyerForm.document.trim() || null,
          contact_email: buyerForm.contact_email.trim() || null,
          contact_phone: buyerForm.contact_phone.trim() || null,
          notes: buyerForm.notes.trim() || null,
        },
        {
          name: buyerForm.director_name.trim(),
          email: buyerForm.director_email.trim(),
          password: buyerForm.director_password,
        }
      )
      toast('Indústria cadastrada!', 'ok')
      setShowBuyerForm(false)
      setBuyerForm({ name: '', document: '', contact_email: '', contact_phone: '', notes: '', director_name: '', director_email: '', director_password: '' })
      await load()
    } catch (e) { toast('Erro: ' + e.message, 'err') } finally { setSaving(false) }
  }

  const saveQuarry = async () => {
    if (!quarryForm.name.trim() || !quarryForm.email.trim() || !quarryForm.password) {
      toast('Nome, e-mail e senha são obrigatórios.', 'err'); return
    }
    if (quarryForm.password.length < 6) { toast('Senha mínima 6 caracteres.', 'err'); return }
    setSaving(true)
    try {
      await api.adminCreateQuarryCompany({
        name: quarryForm.name.trim(),
        company_name: quarryForm.company_name.trim() || quarryForm.name.trim(),
        phone: quarryForm.phone.trim() || null,
        email: quarryForm.email.trim(),
        password: quarryForm.password,
      })
      toast('Pedreira cadastrada!', 'ok')
      setShowQuarryForm(false)
      setQuarryForm({ name: '', company_name: '', phone: '', email: '', password: '' })
      await load()
    } catch (e) { toast('Erro: ' + e.message, 'err') } finally { setSaving(false) }
  }

  const toggleBuyerActive = async (b) => {
    try {
      await api.adminToggleBuyerCompanyActive(b.id, !b.active)
      toast(b.active ? 'Indústria suspensa.' : 'Indústria reativada.', 'ok')
      await load()
    } catch (e) { toast('Erro: ' + e.message, 'err') }
  }

  return (
    <div>
      <div className="ph">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="ptit">🔧 Administração do Stone Block</div>
            <div className="psub">Painel privado — gerenciamento de empresas</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap', borderBottom: '1px solid var(--fog)', paddingBottom: 8 }}>
        <button className={'btn ' + (tab === 'buyers' ? 'bb' : 'bo') + ' bsm'} onClick={() => setTab('buyers')}>
          🏭 Indústrias ({buyers.length})
        </button>
        <button className={'btn ' + (tab === 'quarries' ? 'bb' : 'bo') + ' bsm'} onClick={() => setTab('quarries')}>
          ⛰️ Pedreiras ({quarryCompanies.length})
        </button>
        <button className={'btn ' + (tab === 'externals' ? 'bb' : 'bo') + ' bsm'} onClick={() => setTab('externals')}>
          📍 Pedreiras Externas ({externalQuarries.length})
        </button>
      </div>

      {/* Indústrias */}
      {tab === 'buyers' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button className="btn bb" onClick={() => setShowBuyerForm(true)}>
              <Icon n="plus" s={16} c="#fff" /> Nova Indústria
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 30, color: 'var(--mist)' }}>Carregando...</div>
          ) : buyers.length === 0 ? (
            <div className="es"><div className="estit">Nenhuma indústria cadastrada</div></div>
          ) : (
            <div className="card"><div className="tw"><table>
              <thead><tr>
                <th>Nome</th><th>Documento</th><th>Contato</th><th>Status</th><th>Criada em</th><th></th>
              </tr></thead>
              <tbody>
                {buyers.map(b => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 700 }}>{b.name}</td>
                    <td style={{ fontSize: 13 }}>{b.document || '—'}</td>
                    <td style={{ fontSize: 13 }}>
                      {b.contact_email && <div>{b.contact_email}</div>}
                      {b.contact_phone && <div style={{ color: 'var(--mist)' }}>{b.contact_phone}</div>}
                    </td>
                    <td>
                      <span className="bdg" style={{ background: b.active ? '#dcfce7' : '#fee2e2', color: b.active ? '#15803d' : '#991b1b' }}>
                        {b.active ? '✓ Ativa' : '⊘ Suspensa'}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--mist)' }}>{fmtDate(b.created_at)}</td>
                    <td>
                      <button className="btn bo bsm" onClick={() => toggleBuyerActive(b)}>
                        {b.active ? 'Suspender' : 'Reativar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div></div>
          )}
        </div>
      )}

      {/* Pedreiras */}
      {tab === 'quarries' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button className="btn bb" onClick={() => setShowQuarryForm(true)}>
              <Icon n="plus" s={16} c="#fff" /> Nova Pedreira
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 30, color: 'var(--mist)' }}>Carregando...</div>
          ) : quarryCompanies.length === 0 ? (
            <div className="es"><div className="estit">Nenhuma pedreira cadastrada</div></div>
          ) : (
            <div className="card"><div className="tw"><table>
              <thead><tr>
                <th>Dono</th><th>Nome da Empresa</th><th>Criada em</th>
              </tr></thead>
              <tbody>
                {quarryCompanies.map(q => (
                  <tr key={q.id}>
                    <td style={{ fontWeight: 700 }}>{q.name}</td>
                    <td>{q.company_name || '—'}</td>
                    <td style={{ fontSize: 13, color: 'var(--mist)' }}>{fmtDate(q.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table></div></div>
          )}
        </div>
      )}

      {/* Pedreiras Externas (repositório global) */}
      {tab === 'externals' && (
        <div>
          <div style={{ background: '#f3e8ff', border: '1px solid #d8b4fe', padding: 12, borderRadius: 10, marginBottom: 16, fontSize: 13, color: '#6b21a8' }}>
            💡 Pedreiras "externas" são pedreiras que ainda não usam o Stone Block. Elas aparecem aqui quando marcadores de indústrias as cadastram em blocos. Use isso para prospecção comercial.
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 30, color: 'var(--mist)' }}>Carregando...</div>
          ) : externalQuarries.length === 0 ? (
            <div className="es"><div className="estit">Nenhuma pedreira externa cadastrada ainda</div></div>
          ) : (
            <div className="card"><div className="tw"><table>
              <thead><tr>
                <th>Nome</th><th>Localização</th><th>Contato</th><th>Vista pela primeira vez</th>
              </tr></thead>
              <tbody>
                {externalQuarries.map(q => (
                  <tr key={q.id}>
                    <td style={{ fontWeight: 700 }}>{q.name}</td>
                    <td style={{ fontSize: 13 }}>{q.location || '—'}</td>
                    <td style={{ fontSize: 13 }}>
                      {q.contact_email && <div>{q.contact_email}</div>}
                      {q.contact_phone && <div style={{ color: 'var(--mist)' }}>{q.contact_phone}</div>}
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--mist)' }}>{fmtDate(q.first_seen_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table></div></div>
          )}
        </div>
      )}

      {/* Modal nova indústria */}
      {showBuyerForm && (
        <div className="mo" onClick={() => setShowBuyerForm(false)}>
          <div className="md" onClick={e => e.stopPropagation()}>
            <div className="mhead">
              <div className="mtit">🏭 Nova Indústria Compradora</div>
              <button className="btn bo bsm" onClick={() => setShowBuyerForm(false)}><Icon n="x" s={14} /></button>
            </div>
            <div className="mbody">
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--mist)', marginBottom: 8 }}>
                Dados da Empresa
              </div>
              <div className="fg">
                <label className="fl">Nome da indústria *</label>
                <input className="fc" value={buyerForm.name} onChange={e => setBuyerForm({ ...buyerForm, name: e.target.value })} placeholder="Ex: Granitos Brasil Ltda" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="fg">
                  <label className="fl">CNPJ</label>
                  <input className="fc" value={buyerForm.document} onChange={e => setBuyerForm({ ...buyerForm, document: e.target.value })} />
                </div>
                <div className="fg">
                  <label className="fl">Telefone</label>
                  <input className="fc" value={buyerForm.contact_phone} onChange={e => setBuyerForm({ ...buyerForm, contact_phone: e.target.value })} />
                </div>
              </div>
              <div className="fg">
                <label className="fl">E-mail de contato</label>
                <input className="fc" type="email" value={buyerForm.contact_email} onChange={e => setBuyerForm({ ...buyerForm, contact_email: e.target.value })} />
              </div>
              <div className="fg">
                <label className="fl">Observações</label>
                <textarea className="fc" value={buyerForm.notes} onChange={e => setBuyerForm({ ...buyerForm, notes: e.target.value })} />
              </div>

              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--mist)', marginTop: 16, marginBottom: 8, paddingTop: 12, borderTop: '1px solid var(--fog)' }}>
                Diretor de Compras (acesso inicial)
              </div>
              <div className="fg">
                <label className="fl">Nome do diretor *</label>
                <input className="fc" value={buyerForm.director_name} onChange={e => setBuyerForm({ ...buyerForm, director_name: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="fg">
                  <label className="fl">E-mail *</label>
                  <input className="fc" type="email" value={buyerForm.director_email} onChange={e => setBuyerForm({ ...buyerForm, director_email: e.target.value })} />
                </div>
                <div className="fg">
                  <label className="fl">Senha *</label>
                  <input className="fc" type="text" value={buyerForm.director_password} onChange={e => setBuyerForm({ ...buyerForm, director_password: e.target.value })} placeholder="Mínimo 6 caracteres" />
                </div>
              </div>
            </div>
            <div className="mfoot">
              <button className="btn bo" onClick={() => setShowBuyerForm(false)}>Cancelar</button>
              <button className="btn bb" onClick={saveBuyer} disabled={saving}>
                {saving ? <><span className="spinner"></span> Cadastrando</> : 'Cadastrar Indústria'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal nova pedreira */}
      {showQuarryForm && (
        <div className="mo" onClick={() => setShowQuarryForm(false)}>
          <div className="md" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div className="mhead">
              <div className="mtit">⛰️ Nova Pedreira (Stone Block)</div>
              <button className="btn bo bsm" onClick={() => setShowQuarryForm(false)}><Icon n="x" s={14} /></button>
            </div>
            <div className="mbody">
              <div className="fg">
                <label className="fl">Nome do dono *</label>
                <input className="fc" value={quarryForm.name} onChange={e => setQuarryForm({ ...quarryForm, name: e.target.value })} />
              </div>
              <div className="fg">
                <label className="fl">Nome da empresa (exibido no romaneio)</label>
                <input className="fc" value={quarryForm.company_name} onChange={e => setQuarryForm({ ...quarryForm, company_name: e.target.value })} placeholder="Ex: MINERAÇÃO VMC" />
              </div>
              <div className="fg">
                <label className="fl">Telefone</label>
                <input className="fc" value={quarryForm.phone} onChange={e => setQuarryForm({ ...quarryForm, phone: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="fg">
                  <label className="fl">E-mail *</label>
                  <input className="fc" type="email" value={quarryForm.email} onChange={e => setQuarryForm({ ...quarryForm, email: e.target.value })} />
                </div>
                <div className="fg">
                  <label className="fl">Senha *</label>
                  <input className="fc" type="text" value={quarryForm.password} onChange={e => setQuarryForm({ ...quarryForm, password: e.target.value })} placeholder="Mínimo 6 caracteres" />
                </div>
              </div>
            </div>
            <div className="mfoot">
              <button className="btn bo" onClick={() => setShowQuarryForm(false)}>Cancelar</button>
              <button className="btn bb" onClick={saveQuarry} disabled={saving}>
                {saving ? <><span className="spinner"></span> Cadastrando</> : 'Cadastrar Pedreira'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// IND DASHBOARD — placeholder para Stone Block Ind (etapas seguintes)
// ═══════════════════════════════════════════════════════════════
function IndDashboardPage({ profile, buyerData, toast, setPage }) {
  const [filterPeriod, setFilterPeriod] = useState('month')
  const [dtInicio, setDtInicio] = useState('')
  const [dtFim, setDtFim] = useState('')
  const [filterMarker, setFilterMarker] = useState('')
  const [filterQuarry, setFilterQuarry] = useState('')

  if (!buyerData) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--mist)' }}>Carregando dados da indústria...</div>
  }
  const { company, team, inspections, externalBlocks, visits, purchases, externalQuarries } = buyerData

  const matchesPeriod = (date) => {
    if (filterPeriod === 'all') return true
    const d = new Date(date)
    const now = new Date()
    if (filterPeriod === 'month') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    } else if (filterPeriod === 'last_month') {
      const last = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      return d.getMonth() === last.getMonth() && d.getFullYear() === last.getFullYear()
    } else if (filterPeriod === 'year') {
      return d.getFullYear() === now.getFullYear()
    } else if (filterPeriod === 'custom') {
      if (dtInicio && d < new Date(dtInicio + 'T00:00:00')) return false
      if (dtFim && d > new Date(dtFim + 'T23:59:59')) return false
      return true
    }
    return true
  }

  const filteredVisits = (visits || []).filter(v => {
    if (!matchesPeriod(v.visit_date)) return false
    if (filterMarker && v.marker_id !== filterMarker) return false
    if (filterQuarry && v.external_quarry_id !== filterQuarry) return false
    return true
  })

  const visitIds = new Set(filteredVisits.map(v => v.id))
  const filteredInspections = (inspections || []).filter(i => visitIds.has(i.inspection_id))
  const filteredExternals = (externalBlocks || []).filter(b => visitIds.has(b.inspection_id))
  const filteredPurchases = (purchases || []).filter(p => visitIds.has(p.inspection_id) || matchesPeriod(p.created_at))

  const totalBlocks = filteredInspections.length + filteredExternals.length
  const openVisits = filteredVisits.filter(v => v.status === 'open').length
  const closedVisits = filteredVisits.filter(v => v.status === 'closed').length

  let totalBRL = 0
  let totalUSD = 0
  filteredPurchases.forEach(p => {
    totalBRL += Number(p.total_brl) || 0
    totalUSD += Number(p.total_usd) || 0
  })

  const hasFilter = filterPeriod !== 'month' || filterMarker || filterQuarry || dtInicio || dtFim

  return (
    <div>
      <div className="ph">
        <div className="ptit">Olá, {profile.name.split(' ')[0]}!</div>
        <div className="psub">{company?.name} · {profile.buyer_role === 'director' ? 'Diretor' : profile.buyer_role === 'marker' ? 'Marcador' : 'Assistente'}</div>
      </div>

      {/* Filtros */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="cb" style={{ padding: '12px 14px' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--mist)', textTransform: 'uppercase', letterSpacing: .5 }}>Filtros:</span>
            <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 180 }} value={filterPeriod} onChange={e => setFilterPeriod(e.target.value)}>
              <option value="month">Mês atual</option>
              <option value="last_month">Mês anterior</option>
              <option value="year">Ano atual</option>
              <option value="all">Todos os períodos</option>
              <option value="custom">Período personalizado</option>
            </select>
            {filterPeriod === 'custom' && (
              <>
                <input type="date" className="fc" style={{ fontSize: 13, padding: '7px 10px' }} value={dtInicio} onChange={e => setDtInicio(e.target.value)} />
                <input type="date" className="fc" style={{ fontSize: 13, padding: '7px 10px' }} value={dtFim} onChange={e => setDtFim(e.target.value)} />
              </>
            )}
            <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 200 }} value={filterMarker} onChange={e => setFilterMarker(e.target.value)}>
              <option value="">Todos os marcadores</option>
              {(team || []).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 200 }} value={filterQuarry} onChange={e => setFilterQuarry(e.target.value)}>
              <option value="">Todas as pedreiras</option>
              {(externalQuarries || []).map(q => <option key={q.id} value={q.id}>{q.name}</option>)}
            </select>
            {hasFilter && (
              <button className="btn bo bsm" onClick={() => { setFilterPeriod('month'); setFilterMarker(''); setFilterQuarry(''); setDtInicio(''); setDtFim('') }}>
                <Icon n="x" s={13} /> Limpar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Totalizadores */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12, marginBottom: 16 }}>
        {totalUSD > 0 && (
          <div className="card" style={{ background: 'linear-gradient(135deg,#10b981,#059669)', border: 'none' }}>
            <div className="cb">
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.8)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Comprado US$</div>
              <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 24, color: '#fff' }}>{money(totalUSD, 'USD')}</div>
            </div>
          </div>
        )}
        {totalBRL > 0 && (
          <div className="card" style={{ background: 'linear-gradient(135deg,#0c1a2e,#1e3a8a)', border: 'none' }}>
            <div className="cb">
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.8)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Comprado R$</div>
              <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 24, color: '#fff' }}>{money(totalBRL, 'BRL')}</div>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14, marginBottom: 16 }}>
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => setPage && setPage('ind_visits')}>
          <div className="cb">
            <div className="slbl2">Inspeções</div>
            <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 32 }}>{filteredVisits.length}</div>
            {openVisits > 0 && <div style={{ fontSize: 11, color: '#15803d', fontWeight: 600 }}>{openVisits} em aberto</div>}
          </div>
        </div>
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => setPage && setPage('ind_catalog')}>
          <div className="cb">
            <div className="slbl2">Blocos Marcados</div>
            <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 32 }}>{totalBlocks}</div>
          </div>
        </div>
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => setPage && setPage('ind_purchases')}>
          <div className="cb">
            <div className="slbl2">Compras</div>
            <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 32 }}>{filteredPurchases.length}</div>
          </div>
        </div>
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => setPage && setPage('ind_external_quarries')}>
          <div className="cb">
            <div className="slbl2">Pedreiras</div>
            <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 32 }}>{(externalQuarries || []).length}</div>
          </div>
        </div>
      </div>
    </div>
  )
}


function SettingsModal({ profile, onClose, onSaved, toast }) {
  const [companyName, setCompanyName] = useState(profile.company_name || '')
  const [logoUrl, setLogoUrl] = useState(profile.logo_url || '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast('Logo muito grande (máx. 5MB)', 'err'); return }
    if (!file.type.startsWith('image/')) { toast('Arquivo inválido', 'err'); return }
    setUploading(true)
    try {
      const url = await api.uploadProfileLogo(profile, file)
      setLogoUrl(url)
      toast('Logo enviada!', 'ok')
    } catch (err) {
      toast('Erro: ' + err.message, 'err')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const save = async () => {
    setSaving(true)
    try {
      await api.updateProfile(profile.id, {
        company_name: companyName.trim() || null,
        logo_url: logoUrl || null,
      })
      toast('Configurações salvas!', 'ok')
      onSaved()
    } catch (e) {
      toast('Erro: ' + e.message, 'err')
    } finally { setSaving(false) }
  }

  return (
    <div className="mo" onClick={onClose}>
      <div className="md" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div className="mhead">
          <div className="mtit">⚙️ Configurações</div>
          <button className="btn bo bsm" onClick={onClose}><Icon n="x" s={14} /></button>
        </div>
        <div className="mbody">
          <div className="fg">
            <label className="fl">Nome da Empresa (exibido no romaneio)</label>
            <input className="fc" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Ex: MINERAÇÃO VMC" />
          </div>

          <div className="fg">
            <label className="fl">Logo da Empresa</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              {logoUrl ? (
                <div style={{ position: 'relative' }}>
                  <img src={logoUrl} alt="Logo" style={{ width: 80, height: 80, objectFit: 'contain', background: 'var(--haze)', borderRadius: 8, border: '1px solid var(--fog)' }} />
                  <button
                    onClick={() => setLogoUrl('')}
                    title="Remover logo"
                    style={{ position: 'absolute', top: -6, right: -6, background: 'rgba(0,0,0,.8)', color: '#fff', border: 'none', width: 22, height: 22, borderRadius: '50%', cursor: 'pointer' }}>×</button>
                </div>
              ) : (
                <div style={{ width: 80, height: 80, background: 'var(--haze)', borderRadius: 8, border: '1px dashed var(--fog)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--mist)', fontSize: 11 }}>
                  Sem logo
                </div>
              )}
              <div style={{ flex: 1 }}>
                <input type="file" accept="image/*" onChange={handleLogoUpload} disabled={uploading} style={{ fontSize: 13 }} />
                {uploading && <div style={{ fontSize: 12, color: 'var(--mist)', marginTop: 4 }}><span className="spinner"></span> Enviando...</div>}
                <div style={{ fontSize: 11, color: 'var(--mist)', marginTop: 6 }}>JPG/PNG até 5MB. Aparece no PDF do romaneio.</div>
              </div>
            </div>
          </div>
        </div>
        <div className="mfoot">
          <button className="btn bo" onClick={onClose}>Cancelar</button>
          <button className="btn bb" onClick={save} disabled={saving || uploading}>
            {saving ? <><span className="spinner"></span> Salvando</> : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  // Detect /admin route
  const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')

  const [profile, setProfile]     = useState(null)
  const [loading, setLoading]     = useState(true)
  const [page,    setPage]        = useState('dashboard')

  // Set initial page when profile loads
  useEffect(() => {
    if (!profile) return
    // Stone Block Ind users go to ind dashboard
    if (profile.buyer_company_id) {
      setPage('ind_dashboard')
      return
    }
    if (isAdminRoute && profile.is_app_admin) {
      setPage('admin')
      return
    }
    const initial = {
      owner: 'dashboard',
      foreman: 'blocks',
      seller: 'blocks',
      client: 'catalog',
    }
    setPage(initial[profile.role] || 'dashboard')
  }, [profile?.id, profile?.role, profile?.buyer_company_id, profile?.is_app_admin, isAdminRoute])
  const [sbOpen,  setSbOpen]      = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [toast,   setToast]       = useState(null)

  const [quarries, setQuarries]   = useState([])
  const [clients,  setClients]    = useState([])
  const [payments, setPayments]   = useState([])
  const [blocks,   setBlocks]     = useState([])
  const [sales,    setSales]      = useState([])
  const [team,     setTeam]       = useState([])
  const [releases, setReleases]   = useState([])
  const [catalog,  setCatalog]    = useState([])
  const [orders,   setOrders]     = useState([])
  const [notifications, setNotifications] = useState([])
  const [favorites,     setFavorites]     = useState([])
  const [notifOpen,     setNotifOpen]     = useState(false)
  // Stone Block Ind state
  const [buyerData, setBuyerData] = useState(null)
  const [indPrefillCode, setIndPrefillCode] = useState('')
  const [selectedListId, setSelectedListId] = useState(null)
  const [selectedVisitId, setSelectedVisitId] = useState(null)

  const showToast = useCallback((msg, type = '') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  // Load all data
  const loadData = useCallback(async (p) => {
    if (!p) return
    try {
      // Stone Block Ind users (indústria compradora)
      if (p.buyer_company_id) {
        const bd = await api.loadBuyerCompanyData(p)
        setBuyerData(bd)
        // limpa state da pedreira
        setQuarries([]); setClients([]); setPayments([]); setBlocks([])
        setSales([]); setTeam([]); setReleases([]); setCatalog([]); setFavorites([]); setOrders([])
        const notif = await api.listNotifications(p)
        setNotifications(notif)
        return
      }

      // App admin (rota /admin)
      if (p.is_app_admin && isAdminRoute) {
        // não precisa carregar dados de pedreira; o componente admin busca tudo
        setQuarries([]); setClients([]); setPayments([]); setBlocks([])
        setSales([]); setTeam([]); setReleases([]); setCatalog([]); setFavorites([]); setOrders([])
        setNotifications([])
        return
      }

      // If client, load catalog; otherwise load full team data
      if (p.role === 'client') {
        const [cat, ord, notif, favs, clSales, clBoughtBlocks] = await Promise.all([
          api.listClientCatalog(p),
          api.listOrders(p),
          api.listNotifications(p),
          api.listClientFavorites(p),
          api.listClientSales(p),
          api.listClientBoughtBlocks(p),
        ])
        setCatalog(cat); setOrders(ord); setNotifications(notif); setFavorites(favs)
        setSales(clSales)
        setBlocks(clBoughtBlocks)
        setQuarries([]); setClients([]); setPayments([]); setTeam([]); setReleases([])
      } else {
        const [q, c, pm, b, s, t, r, ord, notif] = await Promise.all([
          api.listQuarries(p),
          api.listClients(p),
          api.listPaymentMethods(p),
          api.listBlocks(p),
          api.listSales(p),
          api.listTeam(p),
          api.listBlockReleases(p),
          api.listOrders(p),
          api.listNotifications(p),
        ])
        setQuarries(q); setClients(c); setPayments(pm); setBlocks(b)
        setSales(s); setTeam(t); setReleases(r); setOrders(ord); setNotifications(notif)
        setCatalog([]); setFavorites([])
      }
    } catch (e) {
      console.error('loadData error:', e)
      showToast('Erro ao carregar dados: ' + e.message, 'err')
    }
  }, [showToast, isAdminRoute])

  // Simple init — check session once, no callbacks, no events
  useEffect(() => {
    let mounted = true
    const init = async () => {
      try {
        const session = await api.getSession()
        if (session?.user && mounted) {
          console.log('Found session for:', session.user.email)
          try {
            const p = await api.ensureProfile(session.user.id, session.user.email)
            if (!mounted) return
            // Bloqueia usuários revogados
            if (p && p.is_active === false) {
              console.log('User revoked, signing out')
              try { await api.signOut() } catch (e) {}
              return
            }
            console.log('Profile loaded')
            setProfile(p)
            // Load data in background — don't wait
            loadData(p).catch(err => console.error('loadData:', err))
          } catch (e) {
            console.error('Profile error:', e)
          }
        } else {
          console.log('No session, showing login')
        }
      } catch (e) {
        console.error('Init error:', e)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    init()
    return () => { mounted = false }
  }, [loadData])

  // ─── REALTIME — sincronização automática entre dispositivos ───
  useEffect(() => {
    if (!profile) return
    console.log('Setting up realtime subscription...')

    const channel = api.subscribeRealtime(profile, (table) => {
      console.log('Realtime update on:', table)
      loadData(profile).catch(err => console.error('realtime reload:', err))
    })

    // Fallback 1: polling a cada 15s (caso o realtime falhe)
    const pollInterval = setInterval(() => {
      console.log('[Polling] Auto-refresh')
      loadData(profile).catch(err => console.error('poll reload:', err))
    }, 15000)

    // Fallback 2: recarrega ao voltar foco para a janela
    const handleFocus = () => {
      console.log('[Focus] Window focused, reloading')
      loadData(profile).catch(err => console.error('focus reload:', err))
    }
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) handleFocus()
    })

    return () => {
      console.log('Cleaning up realtime')
      api.unsubscribeRealtime(channel)
      clearInterval(pollInterval)
      window.removeEventListener('focus', handleFocus)
    }
  }, [profile, loadData])

  // Handler for successful login - called by LoginPage directly
  const handleLoginSuccess = useCallback(async (newProfile) => {
    console.log('Login success, setting profile')
    // Bloqueia usuários revogados
    if (newProfile && newProfile.is_active === false) {
      showToast('Seu acesso foi revogado. Entre em contato com o diretor da empresa.', 'err')
      try { await api.signOut() } catch (e) { console.error(e) }
      return
    }
    setProfile(newProfile)
    loadData(newProfile).catch(err => console.error('loadData:', err))
  }, [loadData, showToast])

  const handleLogout = async () => {
    try { await api.signOut() } catch (e) { console.error(e) }
    setProfile(null)
    setBuyerData(null)
    setSelectedListId(null)
    setSelectedVisitId(null)
    setIndPrefillCode('')
    setBlocks([]); setQuarries([]); setClients([]); setPayments([]); setSales([])
    setTeam([]); setReleases([]); setCatalog([]); setOrders([]); setNotifications([]); setFavorites([])
  }

  if (loading) return (
    <>
      <style>{CSS}</style>
      <div className="loading-screen">
        <div style={{ textAlign: 'center' }}>
          <div className="spinner"></div>
          <div style={{ marginBottom: 20 }}>Carregando Stone Block...</div>
          <button
            className="btn bo bsm"
            style={{ background: 'rgba(255,255,255,.1)', color: '#fff', borderColor: 'rgba(255,255,255,.2)' }}
            onClick={() => setLoading(false)}>
            Ir para login
          </button>
        </div>
      </div>
    </>
  )

  if (!profile) return (
    <>
      <style>{CSS}</style>
      <LoginPage onLoginSuccess={handleLoginSuccess} />
    </>
  )

  // Navigation based on role
  let NAV = []

  // Stone Block Ind users
  if (profile.buyer_company_id) {
    NAV = [
      { p: 'ind_dashboard',         l: 'Dashboard',           i: 'grid' },
      { p: 'ind_new_visit',         l: 'Cadastrar Inspeção',  i: 'plus' },
      { p: 'ind_quarry_catalog',    l: 'Catálogo da Pedreira', i: 'cube' },
      { p: 'ind_catalog',           l: 'Catálogo Interno',    i: 'cube' },
      { p: 'ind_visits',            l: 'Inspeções',           i: 'check' },
      { p: 'ind_orders',            l: 'Meus Pedidos',         i: 'card' },
      { p: 'ind_purchases',         l: 'Compras',             i: 'card' },
      { p: 'ind_bought_blocks',     l: 'Blocos Comprados',    i: 'cube' },
      { p: 'ind_external_quarries', l: 'Pedreiras',           i: 'mtn' },
    ]
    if (profile.buyer_role === 'director') {
      NAV.push({ p: 'ind_team', l: 'Equipe', i: 'user' })
    }
  // App admin (rota /admin)
  } else if (profile.is_app_admin && isAdminRoute) {
    NAV = [
      { p: 'admin', l: 'Administração', i: 'grid' },
    ]
  } else if (profile.role === 'owner') {
    NAV = [
      { p: 'dashboard',   l: 'Dashboard',         i: 'grid' },
      { p: 'blocks',      l: 'Blocos',            i: 'cube' },
      { p: 'reserve',     l: 'Reserva Comercial', i: 'cube' },
      { p: 'purchase_orders', l: 'Pedido de Compra', i: 'card' },
      { p: 'sales',       l: 'Vendas',            i: 'cart' },
      { p: 'sold_blocks', l: 'Blocos Vendidos',   i: 'check' },
      { p: 'releases',    l: 'Liberar Catálogo',  i: 'check' },
      { p: 'commissions', l: 'Comissões',         i: 'dolar' },
      { p: 'quarries',    l: 'Pedreiras',         i: 'mtn' },
      { p: 'team',        l: 'Equipe',            i: 'user' },
      { p: 'clients',     l: 'Clientes',          i: 'user' },
      { p: 'payments',    l: 'Pagamentos',        i: 'card' },
    ]
  } else if (profile.role === 'foreman') {
    NAV = [
      { p: 'blocks',    l: 'Blocos',            i: 'cube' },
      { p: 'reserve',   l: 'Reserva Comercial', i: 'cube' },
      { p: 'quarries',  l: 'Pedreiras',         i: 'mtn' },
    ]
  } else if (profile.role === 'seller') {
    NAV = [
      { p: 'dashboard',   l: 'Dashboard',         i: 'grid' },
      { p: 'blocks',      l: 'Blocos',            i: 'cube' },
      { p: 'reserve',     l: 'Reserva Comercial', i: 'cube' },
      { p: 'purchase_orders', l: 'Pedido de Compra', i: 'card' },
      { p: 'sales',       l: 'Minhas Vendas',     i: 'cart' },
      { p: 'sold_blocks', l: 'Blocos Vendidos',   i: 'check' },
      { p: 'releases',    l: 'Liberar Catálogo',  i: 'check' },
      { p: 'clients',     l: 'Clientes',          i: 'user' },
    ]
  } else if (profile.role === 'client') {
    NAV = [
      { p: 'catalog',           l: 'Catálogo',         i: 'cube' },
      { p: 'client_purchases',  l: 'Minhas Compras',   i: 'cart' },
      { p: 'client_blocks',     l: 'Blocos Comprados',      i: 'check' },
    ]
  }

  const renderPage = () => {
    switch (page) {
      case 'admin':                return <AdminPage profile={profile} toast={showToast} />
      case 'ind_dashboard':        return <IndDashboardPage profile={profile} buyerData={buyerData} onChange={() => loadData(profile)} toast={showToast} setPage={setPage} />
      case 'ind_search':           return <IndSearchBlockPage profile={profile} buyerData={buyerData} onChange={() => loadData(profile)} toast={showToast} onCreateExternal={(code) => { setIndPrefillCode(code); setPage('ind_external_form') }} />
      case 'ind_external_form':    return <IndExternalBlockFormPage profile={profile} buyerData={buyerData} onChange={() => loadData(profile)} toast={showToast} prefillCode={indPrefillCode} onDone={() => { setIndPrefillCode(''); setPage('ind_external_blocks') }} />
      case 'ind_inspections':      return <IndInspectionsListPage profile={profile} buyerData={buyerData} onChange={() => loadData(profile)} toast={showToast} />
      case 'ind_external_blocks':  return <IndExternalBlocksListPage profile={profile} buyerData={buyerData} onChange={() => loadData(profile)} toast={showToast} />
      case 'ind_external_quarries': return <IndExternalQuarriesPage profile={profile} buyerData={buyerData} onChange={() => loadData(profile)} toast={showToast} />
      case 'ind_team':              return <IndTeamPage profile={profile} buyerData={buyerData} onChange={() => loadData(profile)} toast={showToast} />
      case 'ind_lists':             return <IndListsPage profile={profile} buyerData={buyerData} onChange={() => loadData(profile)} toast={showToast} setPage={setPage} setSelectedListId={setSelectedListId} />
      case 'ind_list_detail':       return <IndListDetailPage profile={profile} buyerData={buyerData} onChange={() => loadData(profile)} toast={showToast} listId={selectedListId} setPage={setPage} />
      case 'ind_new_visit':         return <IndNewVisitPage profile={profile} buyerData={buyerData} onChange={() => loadData(profile)} toast={showToast} setPage={setPage} setSelectedVisitId={setSelectedVisitId} />
      case 'ind_visits':            return <IndVisitsListPage profile={profile} buyerData={buyerData} onChange={() => loadData(profile)} toast={showToast} setPage={setPage} setSelectedVisitId={setSelectedVisitId} />
      case 'ind_visit_detail':      return <IndVisitDetailPage profile={profile} buyerData={buyerData} onChange={() => loadData(profile)} toast={showToast} visitId={selectedVisitId} setPage={setPage} />
      case 'ind_quarry_catalog':    return <IndQuarryCatalogPage profile={profile} buyerData={buyerData} toast={showToast} />
      case 'ind_catalog':           return <IndCatalogPage profile={profile} buyerData={buyerData} onChange={() => loadData(profile)} toast={showToast} />
      case 'ind_orders':            return <IndOrdersPage profile={profile} buyerData={buyerData} onChange={() => loadData(profile)} toast={showToast} />
      case 'ind_bought_blocks':     return <IndBoughtBlocksPage profile={profile} buyerData={buyerData} onChange={() => loadData(profile)} toast={showToast} />
      case 'ind_purchases':         return <IndPurchasesPage profile={profile} buyerData={buyerData} onChange={() => loadData(profile)} toast={showToast} />
      case 'dashboard':   return <Dashboard blocks={blocks} quarries={quarries} clients={clients} sales={sales} />
      case 'blocks':      return <BlocksPage profile={profile} blocks={blocks} quarries={quarries} clients={clients} payments={payments} onChange={() => loadData(profile)} toast={showToast} />
      case 'sales':       return <SalesPage profile={profile} sales={sales} blocks={blocks} quarries={quarries} onChange={() => loadData(profile)} toast={showToast} />
      case 'purchase_orders': return <QuarryPurchaseOrdersPage profile={profile} onChange={() => loadData(profile)} toast={showToast} />
      case 'sold_blocks': return <SoldBlocksPage profile={profile} blocks={blocks} quarries={quarries} sales={sales} onChange={() => loadData(profile)} toast={showToast} />
      case 'releases':    return <ReleasesPage profile={profile} blocks={blocks} clients={clients} releases={releases} quarries={quarries} onChange={() => loadData(profile)} toast={showToast} />
      case 'reserve':     return <ReserveCommercialPage profile={profile} blocks={blocks} quarries={quarries} clients={clients} payments={payments} onChange={() => loadData(profile)} toast={showToast} />
      case 'commissions': return <CommissionsPage profile={profile} sales={sales} team={team} toast={showToast} />
      case 'quarries':    return <QuarriesPage profile={profile} quarries={quarries} blocks={blocks} onChange={() => loadData(profile)} toast={showToast} />
      case 'team':        return <TeamPage profile={profile} team={team} onChange={() => loadData(profile)} toast={showToast} />
      case 'clients':     return <ClientsPage profile={profile} clients={clients} onChange={() => loadData(profile)} toast={showToast} />
      case 'payments':    return <PaymentsPage profile={profile} payments={payments} onChange={() => loadData(profile)} toast={showToast} />
      case 'catalog':     return <CatalogPage profile={profile} catalog={catalog} favorites={favorites} quarries={quarries} onChange={() => loadData(profile)} toast={showToast} />
      case 'client_purchases': return <ClientPurchasesPage profile={profile} sales={sales} onChange={() => loadData(profile)} toast={showToast} />
      case 'client_blocks':    return <ClientBoughtBlocksPage profile={profile} blocks={blocks} quarries={quarries} toast={showToast} />
      default:
        if (profile.role === 'client') return <CatalogPage profile={profile} catalog={catalog} favorites={favorites} quarries={quarries} onChange={() => loadData(profile)} toast={showToast} />
        if (profile.role === 'foreman') return <BlocksPage profile={profile} blocks={blocks} quarries={quarries} clients={clients} payments={payments} onChange={() => loadData(profile)} toast={showToast} />
        return <Dashboard blocks={blocks} quarries={quarries} clients={clients} sales={sales} />
    }
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <div className="tb">
          <div className="tbl">
            <button className="tbbtn" onClick={() => setSbOpen(v => !v)}><Icon n="menu" s={20} c="#fff" /></button>
            <div className="tblogo">
              {profile.buyer_company_id
                ? <>Stone <span>Block</span> <span style={{fontSize:13,fontWeight:600,color:'rgba(255,255,255,.6)',letterSpacing:1}}>IND</span></>
                : <>Stone <span>Block</span></>
              }
            </div>
          </div>
          <div className="tbr">
            <div style={{ position: 'relative' }}>
              <button className="tbbtn" onClick={() => setNotifOpen(v => !v)} title="Notificações">
                <Icon n="check" s={18} c="#fff" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--err)', color: '#fff', borderRadius: 10, fontSize: 10, fontWeight: 700, padding: '2px 6px', minWidth: 18, textAlign: 'center' }}>
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
              {notifOpen && (
                <>
                  <div onClick={() => setNotifOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 65 }} />
                  <NotificationsPanel
                    profile={profile}
                    notifications={notifications}
                    onChange={() => loadData(profile)}
                    onClose={() => setNotifOpen(false)} />
                </>
              )}
            </div>
            <div className="av" title={profile.name}>{profile.avatar || profile.name.substring(0, 2).toUpperCase()}</div>
          </div>
        </div>

        <div className="lay">
          <div className={'sbov' + (sbOpen ? ' show' : '')} onClick={() => setSbOpen(false)} />
          <div className={'sb' + (sbOpen ? ' open' : '')}>
            <div className="sblbl">Menu</div>
            {NAV.map(it => (
              <div key={it.p} className={'sbni' + (page === it.p ? ' on' : '')} onClick={() => {
                setPage(it.p)
                setSbOpen(false)
                // Recarrega dados ao trocar de página (garante dados frescos)
                loadData(profile).catch(err => console.error('nav reload:', err))
              }}>
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
              {profile.role === 'owner' && (
                <button className="lobtn" onClick={() => setShowSettings(true)} style={{ marginBottom: 6 }}>
                  <Icon n="edit" s={14} /> Configurações
                </button>
              )}
              <button className="lobtn" onClick={handleLogout}><Icon n="out" s={14} /> Sair</button>
            </div>
          </div>
          <div className="main">{renderPage()}</div>
        </div>

        {showSettings && (
          <SettingsModal
            profile={profile}
            onClose={() => setShowSettings(false)}
            onSaved={async () => {
              setShowSettings(false)
              await loadData(profile)
            }}
            toast={showToast}
          />
        )}

        {toast && <div className={'toast ' + toast.type}>{toast.msg}</div>}
      </div>
    </>
  )
}
