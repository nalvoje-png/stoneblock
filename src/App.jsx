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
  const [filterPeriod, setFilterPeriod] = useState('all')
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
  const canEdit = profile.role === 'owner' || profile.role === 'foreman'
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
          { v: '', l: 'Todos', cnt: blocks.length },
          { v: 'available', l: 'Disponíveis', cnt: blocks.filter(b => b.status === 'available').length },
          { v: 'reserved', l: 'Reservados', cnt: blocks.filter(b => b.status === 'reserved').length },
          { v: 'sold', l: 'Vendidos', cnt: blocks.filter(b => b.status === 'sold').length },
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
                  ? <img src={b.photos[0]} alt={b.code} style={{ width: '100%', height: mobileGrid2 ? 110 : 160, objectFit: 'cover', background: 'var(--haze)', cursor: 'pointer' }} onClick={() => setDetailBlock(b)} onError={(e) => { e.target.style.display = 'none' }} />
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
                <div className="fg"><label className="fl">Código *</label><input className="fc" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="Ex: VMC-001" /></div>
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

              <div className="responsive-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
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
// BLOCK DETAIL MODAL — visualizar ficha completa do bloco
// ═══════════════════════════════════════════════════════════════
function BlockDetailModal({ block, quarry, onClose }) {
  const [photoIdx, setPhotoIdx] = useState(0)
  const photos = (block.photos || []).filter(Boolean)

  const STATUS_CLR = { produced: '#64748b', available: '#10b981', reserved: '#f59e0b', sold: '#ef4444' }
  const STATUS_LBL = { produced: 'Produzido', available: 'Disponível', reserved: 'Reservado', sold: 'Vendido' }

  return (
    <div className="mo" onClick={onClose}>
      <div className="md" style={{ maxWidth: 800 }} onClick={e => e.stopPropagation()}>
        <div className="mhead">
          <div>
            <div className="mtit">{block.code}</div>
            <div style={{ fontSize: 13, color: 'var(--mist)', marginTop: 4 }}>{block.material}</div>
          </div>
          <button className="btn bo bsm" onClick={onClose}><Icon n="x" s={14} /></button>
        </div>
        <div className="mbody">
          {/* Photos carousel */}
          {photos.length > 0 ? (
            <div style={{ marginBottom: 16 }}>
              <img src={photos[photoIdx]} alt="" style={{ width: '100%', maxHeight: 360, objectFit: 'contain', background: 'var(--haze)', borderRadius: 8 }} />
              {photos.length > 1 && (
                <div style={{ display: 'flex', gap: 6, marginTop: 8, overflowX: 'auto' }}>
                  {photos.map((url, i) => (
                    <img key={i} src={url} alt="" onClick={() => setPhotoIdx(i)} style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 6, cursor: 'pointer', flexShrink: 0, border: '2px solid ' + (i === photoIdx ? 'var(--sap6)' : 'transparent') }} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ height: 200, background: 'var(--haze)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, marginBottom: 16 }}>
              <Icon n="cube" s={48} c="var(--mist)" />
            </div>
          )}

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
      await api.createSale(profile, {
        client_id: clientId,
        payment_method_id: paymentId || null,
        dollar_rate: dollarRate ? Number(dollarRate) : null,
        total_brl: grandTotalBRL,
        total_usd: totalUSDBlocks,
        obs: obs.trim() || null,
      }, selectedBlocks.map(b => b.id))
      toast('Venda registrada com sucesso!', 'ok')
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

  const rowsHTML = blocks.map(b => `
    <tr>
      <td class="num">${b.code || ''}</td>
      <td class="ctr">${b.classification || ''}</td>
      <td class="num">${fmtNum(b.net_l)}</td>
      <td class="num">${fmtNum(b.net_h)}</td>
      <td class="num">${fmtNum(b.net_w)}</td>
      <td class="num">${fmtNum(b.net_volume)}</td>
      <td class="num">${b.currency === 'USD' ? fmtNum(b.price_m3) : ''}</td>
      <td class="num">${b.currency === 'BRL' ? fmtBRL(b.price_m3) : ''}</td>
      <td class="num">${b.currency === 'BRL' ? fmtBRL(b.total_value) : (b.currency === 'USD' ? 'US$ ' + fmtNum(b.total_value) : '')}</td>
      <td class="ctr">${b.classification || ''}</td>
    </tr>
  `).join('')

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
    <div class="obs-content">${sale.obs || ''}</div>
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
  const [dtInicio, setDtInicio] = useState('')
  const [dtFim, setDtFim] = useState('')
  const [filterClient, setFilterClient] = useState('')
  const [filterQuarry, setFilterQuarry] = useState('')
  const [filterMaterial, setFilterMaterial] = useState('')
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
    if (dtInicio && d < new Date(dtInicio + 'T00:00:00')) return false
    if (dtFim && d > new Date(dtFim + 'T23:59:59')) return false
    if (filterClient && s.client?.name?.toLowerCase().indexOf(filterClient.toLowerCase()) === -1) return false
    if (filterQuarry) {
      const hasFromQuarry = (s.blocks || []).some(b => b.quarry_id === filterQuarry)
      if (!hasFromQuarry) return false
    }
    if (filterMaterial) {
      const hasMaterial = (s.blocks || []).some(b => b.material === filterMaterial)
      if (!hasMaterial) return false
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
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label className="fl" style={{ margin: 0 }}>De</label>
              <input type="date" className="fc" style={{ fontSize: 13, padding: '7px 10px' }} value={dtInicio} max={dtFim || today} onChange={e => setDtInicio(e.target.value)} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label className="fl" style={{ margin: 0 }}>Até</label>
              <input type="date" className="fc" style={{ fontSize: 13, padding: '7px 10px' }} value={dtFim} min={dtInicio} max={today} onChange={e => setDtFim(e.target.value)} />
            </div>
            <input className="fc" style={{ fontSize: 13, padding: '7px 12px', flex: '1 1 180px' }} placeholder="Buscar cliente..." value={filterClient} onChange={e => setFilterClient(e.target.value)} />
            <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 200 }} value={filterQuarry} onChange={e => setFilterQuarry(e.target.value)}>
              <option value="">Todas as pedreiras</option>
              {(quarries || []).map(q => <option key={q.id} value={q.id}>{q.name}</option>)}
            </select>
            <select className="fc" style={{ fontSize: 13, padding: '7px 10px', maxWidth: 200 }} value={filterMaterial} onChange={e => setFilterMaterial(e.target.value)}>
              <option value="">Todos os materiais</option>
              {salesMaterials.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            {(dtInicio || dtFim || filterClient || filterQuarry || filterMaterial) && (
              <button className="btn bo bsm" onClick={() => { setDtInicio(''); setDtFim(''); setFilterClient(''); setFilterQuarry(''); setFilterMaterial('') }}>
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

  const availableBlocks = blocks.filter(b => b.status === 'available' || b.status === 'reserved' || b.status === 'reserve')

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
      ) : (
        <div className="card"><div className="tw"><table>
          <thead><tr>
            <th></th><th>Bloco</th><th>Cliente</th><th>Liberado por</th><th>Data</th><th></th>
          </tr></thead>
          <tbody>
            {releases.map(r => {
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
      )}

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
                  <div style={{ fontSize: 13, color: 'var(--mist)', marginBottom: 14 }}>Selecione os clientes que terão acesso:</div>
                  {clients.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 30, color: 'var(--mist)' }}>Nenhum cliente cadastrado</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 400, overflowY: 'auto' }}>
                      {clients.map(c => {
                        const sel = selectedClients.includes(c.id)
                        return (
                          <div key={c.id} onClick={() => toggleClient(c.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, border: '2px solid ' + (sel ? 'var(--sap6)' : 'var(--fog)'), background: sel ? 'var(--sap1)' : '#fff', borderRadius: 8, cursor: 'pointer' }}>
                            <div style={{ width: 20, height: 20, borderRadius: 4, border: '2px solid', borderColor: sel ? 'var(--sap6)' : 'var(--fog)', background: sel ? 'var(--sap6)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {sel && <Icon n="check" s={12} c="#fff" />}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600 }}>{c.name}</div>
                              <div style={{ fontSize: 12, color: 'var(--mist)' }}>{c.country} {c.email && '· ' + c.email}</div>
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
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// CLIENT CATALOG — visão do cliente, vê blocos liberados para ele
// ═══════════════════════════════════════════════════════════════
function CatalogPage({ profile, catalog, favorites, quarries, onChange, toast }) {
  const [selected, setSelected] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [buyMessage, setBuyMessage] = useState('')
  const [filterFavOnly, setFilterFavOnly] = useState(false)
  const [filterMaterial, setFilterMaterial] = useState('')
  const [filterQuarry, setFilterQuarry] = useState('')
  const [saving, setSaving] = useState(false)
  const [photoIdx, setPhotoIdx] = useState(0)
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
    setPhotoIdx(0)
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
                  <img src={b.photos[0]} alt={b.code} style={{ width: '100%', height: 200, objectFit: 'cover', background: 'var(--haze)' }} />
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
                {photos.length > 0 ? (
                  <div style={{ marginBottom: 16 }}>
                    <img src={photos[photoIdx]} alt="" style={{ width: '100%', maxHeight: 360, objectFit: 'contain', background: 'var(--haze)', borderRadius: 8 }} />
                    {photos.length > 1 && (
                      <div style={{ display: 'flex', gap: 6, marginTop: 8, overflowX: 'auto' }}>
                        {photos.map((url, i) => (
                          <img key={i} src={url} alt="" onClick={() => setPhotoIdx(i)} style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 6, cursor: 'pointer', flexShrink: 0, border: '2px solid ' + (i === photoIdx ? 'var(--sap6)' : 'transparent') }} />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ height: 200, background: 'var(--haze)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, marginBottom: 16 }}>
                    <Icon n="cube" s={48} c="var(--mist)" />
                  </div>
                )}

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
                  ? <img src={b.photos[0]} alt={b.code} style={{ width: '100%', height: 160, objectFit: 'cover', background: 'var(--haze)', cursor: 'pointer' }} onClick={() => setDetailBlock(b)} />
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
  const [dtInicio, setDtInicio] = useState('')
  const [dtFim, setDtFim] = useState('')
  const [expandedSeller, setExpandedSeller] = useState(null)

  const today = new Date().toISOString().slice(0, 10)

  const sellers = team.filter(t => t.role === 'seller')

  const sellerData = sellers.map(s => {
    const sellerSales = sales.filter(sale => {
      if (sale.seller_id !== s.id) return false
      const d = new Date(sale.created_at)
      if (dtInicio && d < new Date(dtInicio + 'T00:00:00')) return false
      if (dtFim && d > new Date(dtFim + 'T23:59:59')) return false
      return true
    })
    const totalBRL = sellerSales.reduce((a, x) => a + (Number(x.total_brl) || 0), 0)
    const totalUSD = sellerSales.reduce((a, x) => a + (Number(x.total_usd) || 0), 0)
    const commission = s.commission && s.commission_pct > 0 ? totalBRL * (s.commission_pct / 100) : 0
    const blockCount = sellerSales.reduce((a, x) => a + (x.block_ids?.length || 0), 0)
    return { seller: s, sales: sellerSales, totalBRL, totalUSD, commission, blockCount }
  })

  const grandTotal = sellerData.reduce((a, d) => a + d.totalBRL, 0)
  const grandCommission = sellerData.reduce((a, d) => a + d.commission, 0)

  return (
    <div>
      <div className="ph">
        <div className="ptit">Comissões</div>
        <div className="psub">
          {dtInicio || dtFim
            ? `Período: ${dtInicio ? fmtDate(new Date(dtInicio + 'T12:00:00')) : 'início'} → ${dtFim ? fmtDate(new Date(dtFim + 'T12:00:00')) : 'hoje'}`
            : 'Todos os períodos'}
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

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="cb" style={{ padding: '14px 18px' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label className="fl" style={{ margin: 0 }}>De</label>
              <input type="date" className="fc" style={{ fontSize: 13, padding: '7px 10px' }} value={dtInicio} max={dtFim || today} onChange={e => setDtInicio(e.target.value)} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label className="fl" style={{ margin: 0 }}>Até</label>
              <input type="date" className="fc" style={{ fontSize: 13, padding: '7px 10px' }} value={dtFim} min={dtInicio} max={today} onChange={e => setDtFim(e.target.value)} />
            </div>
            {(dtInicio || dtFim) && (
              <button className="btn bo bsm" onClick={() => { setDtInicio(''); setDtFim('') }}>
                <Icon n="x" s={13} /> Limpar
              </button>
            )}
          </div>
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
// SETTINGS MODAL — edita perfil/empresa (nome, logo)
// ═══════════════════════════════════════════════════════════════
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
  const [profile, setProfile]     = useState(null)
  const [loading, setLoading]     = useState(true)
  const [page,    setPage]        = useState('dashboard')

  // Set initial page when profile loads
  useEffect(() => {
    if (!profile) return
    const initial = {
      owner: 'dashboard',
      foreman: 'blocks',
      seller: 'blocks',
      client: 'catalog',
    }
    setPage(initial[profile.role] || 'dashboard')
  }, [profile?.id, profile?.role])
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

  const showToast = useCallback((msg, type = '') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  // Load all data
  const loadData = useCallback(async (p) => {
    if (!p) return
    try {
      // If client, load catalog; otherwise load full team data
      if (p.role === 'client') {
        const [cat, ord, notif, favs] = await Promise.all([
          api.listClientCatalog(p),
          api.listOrders(p),
          api.listNotifications(p),
          api.listClientFavorites(p),
        ])
        setCatalog(cat); setOrders(ord); setNotifications(notif); setFavorites(favs)
        // Empty arrays for unused data
        setQuarries([]); setClients([]); setPayments([]); setBlocks([]); setSales([]); setTeam([]); setReleases([])
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
  }, [showToast])

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

    return () => {
      console.log('Cleaning up realtime')
      api.unsubscribeRealtime(channel)
    }
  }, [profile, loadData])

  // Handler for successful login - called by LoginPage directly
  const handleLoginSuccess = useCallback(async (newProfile) => {
    console.log('Login success, setting profile')
    setProfile(newProfile)
    loadData(newProfile).catch(err => console.error('loadData:', err))
  }, [loadData])

  const handleLogout = async () => {
    try { await api.signOut() } catch (e) { console.error(e) }
    setProfile(null)
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
  if (profile.role === 'owner') {
    NAV = [
      { p: 'dashboard',   l: 'Dashboard',         i: 'grid' },
      { p: 'blocks',      l: 'Blocos',            i: 'cube' },
      { p: 'reserve',     l: 'Reserva Comercial', i: 'cube' },
      { p: 'sales',       l: 'Vendas',            i: 'cart' },
      { p: 'orders',      l: 'Pedidos',           i: 'cart' },
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
      { p: 'dashboard', l: 'Dashboard',         i: 'grid' },
      { p: 'blocks',    l: 'Blocos',            i: 'cube' },
      { p: 'reserve',   l: 'Reserva Comercial', i: 'cube' },
      { p: 'sales',     l: 'Minhas Vendas',     i: 'cart' },
      { p: 'orders',    l: 'Pedidos',           i: 'cart' },
      { p: 'releases',  l: 'Liberar Catálogo',  i: 'check' },
      { p: 'clients',   l: 'Clientes',          i: 'user' },
    ]
  } else if (profile.role === 'client') {
    NAV = [
      { p: 'catalog', l: 'Catálogo',         i: 'cube' },
      { p: 'orders',  l: 'Meus Pedidos',     i: 'cart' },
    ]
  }

  const renderPage = () => {
    switch (page) {
      case 'dashboard':   return <Dashboard blocks={blocks} quarries={quarries} clients={clients} sales={sales} />
      case 'blocks':      return <BlocksPage profile={profile} blocks={blocks} quarries={quarries} clients={clients} payments={payments} onChange={() => loadData(profile)} toast={showToast} />
      case 'sales':       return <SalesPage profile={profile} sales={sales} blocks={blocks} quarries={quarries} onChange={() => loadData(profile)} toast={showToast} />
      case 'orders':      return <OrdersPage profile={profile} orders={orders} onChange={() => loadData(profile)} toast={showToast} />
      case 'releases':    return <ReleasesPage profile={profile} blocks={blocks} clients={clients} releases={releases} quarries={quarries} onChange={() => loadData(profile)} toast={showToast} />
      case 'reserve':     return <ReserveCommercialPage profile={profile} blocks={blocks} quarries={quarries} clients={clients} payments={payments} onChange={() => loadData(profile)} toast={showToast} />
      case 'commissions': return <CommissionsPage profile={profile} sales={sales} team={team} toast={showToast} />
      case 'quarries':    return <QuarriesPage profile={profile} quarries={quarries} blocks={blocks} onChange={() => loadData(profile)} toast={showToast} />
      case 'team':        return <TeamPage profile={profile} team={team} onChange={() => loadData(profile)} toast={showToast} />
      case 'clients':     return <ClientsPage profile={profile} clients={clients} onChange={() => loadData(profile)} toast={showToast} />
      case 'payments':    return <PaymentsPage profile={profile} payments={payments} onChange={() => loadData(profile)} toast={showToast} />
      case 'catalog':     return <CatalogPage profile={profile} catalog={catalog} favorites={favorites} quarries={quarries} onChange={() => loadData(profile)} toast={showToast} />
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
            <div className="tblogo">Stone <span>Block</span></div>
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
