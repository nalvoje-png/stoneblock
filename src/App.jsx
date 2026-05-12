import { useState, useEffect, useRef, useCallback } from "react";

// ─── SEED ────────────────────────────────────
const SEED = {
  quarries: [
    { id:1, name:"Pedreira VMC",      location:"Serra do Cipó, MG",            materials:["Granito Verde Ubatuba","Granito Preto São Gabriel","Granito Amarelo Ornamental"] },
    { id:2, name:"Pedreira Espírito", location:"Cachoeiro de Itapemirim, ES",  materials:["Mármore Branco Espírito Santo","Quartzito Taj Mahal","Mármore Bege Bahia"] },
    { id:3, name:"Pedreira Alvorada", location:"Nova Venécia, ES",             materials:["Granito Rosa Porriño","Travertino Romano","Quartzito Persa"] },
  ],
  users: [
    { id:1, name:"Carlos Mendonça",  email:"dono@stoneblock.com",    password:"123", role:"owner",   quarry_id:null, avatar:"CM", phone:"+55 27 99888-0001" },
    { id:2, name:"João Ferreira",    email:"joao@stoneblock.com",    password:"123", role:"foreman", quarry_id:1,    avatar:"JF", phone:"+55 31 99777-0002" },
    { id:3, name:"Ana Paula",        email:"ana@stoneblock.com",     password:"123", role:"seller",  quarry_id:null, avatar:"AP", phone:"+55 27 99666-0003" },
    { id:4, name:"Marble World USA", email:"marble@worldusa.com",    password:"123", role:"client",  quarry_id:null, avatar:"MW" },
    { id:5, name:"Stone Italia Srl", email:"stone@italia.it",        password:"123", role:"client",  quarry_id:null, avatar:"SI" },
    { id:6, name:"Ricardo Vendas",   email:"ricardo@stoneblock.com", password:"123", role:"seller",  quarry_id:null, avatar:"RV", phone:"+55 27 99555-0006", commission:true, commission_pct:5 },
  ],
  blocks: [
    // ── Pedreira VMC ──
    { id:1,  code:"VMC-001", quarry_id:1, material:"Granito Verde Ubatuba",         classification:"A+", gross_l:3.20, gross_h:1.90, gross_w:1.45, net_l:3.10, net_h:1.85, net_w:1.40, gross_volume:8.816, net_volume:8.029, currency:"USD", price_m3:1800, total_value:14452.20, status:"available", photos:["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80","https://images.unsplash.com/photo-1564419320461-6870880221ad?w=800&q=80"], notes:"Peça excepcional com veios únicos. Sem fissuras visíveis.", created_by:2, created_at:"2025-01-08T08:00:00Z" },
    { id:2,  code:"VMC-002", quarry_id:1, material:"Granito Verde Ubatuba",         classification:"A",  gross_l:2.85, gross_h:1.75, gross_w:1.30, net_l:2.75, net_h:1.68, net_w:1.24, gross_volume:6.483, net_volume:5.732, currency:"USD", price_m3:1700, total_value:9744.40,  status:"available", photos:["https://images.unsplash.com/photo-1564419320461-6870880221ad?w=800&q=80"], notes:"Coloração intensa e homogênea.", created_by:2, created_at:"2025-01-10T09:30:00Z" },
    { id:3,  code:"VMC-003", quarry_id:1, material:"Granito Preto São Gabriel",     classification:"A+", gross_l:3.10, gross_h:1.95, gross_w:1.50, net_l:3.00, net_h:1.88, net_w:1.44, gross_volume:9.068, net_volume:8.122, currency:"USD", price_m3:2200, total_value:17868.40, status:"reserved", reserved_for:1, photos:["https://images.unsplash.com/photo-1551376347-075b0121a65b?w=800&q=80","https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80"], notes:"Preto absoluto, máxima qualidade de exportação.", created_by:2, created_at:"2025-01-12T10:00:00Z" },
    { id:4,  code:"VMC-004", quarry_id:1, material:"Granito Preto São Gabriel",     classification:"A",  gross_l:2.70, gross_h:1.60, gross_w:1.25, net_l:2.60, net_h:1.54, net_w:1.20, gross_volume:5.400, net_volume:4.805, currency:"USD", price_m3:2000, total_value:9610.00,  status:"available", photos:["https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80"], notes:"Boa peça, apta para exportação.", created_by:2, created_at:"2025-01-15T11:00:00Z" },
    { id:5,  code:"VMC-005", quarry_id:1, material:"Granito Amarelo Ornamental",    classification:"B",  gross_l:2.50, gross_h:1.40, gross_w:1.10, net_l:2.40, net_h:1.34, net_w:1.05, gross_volume:3.850, net_volume:3.376, currency:"BRL", price_m3:620,  total_value:2093.12,  status:"available", photos:["https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80"], notes:"Tons quentes e dourados.", created_by:2, created_at:"2025-02-03T08:00:00Z" },
    // ── Pedreira Espírito ──
    { id:6,  code:"ESP-001", quarry_id:2, material:"Mármore Branco Espírito Santo", classification:"A+", gross_l:2.80, gross_h:1.55, gross_w:1.20, net_l:2.70, net_h:1.50, net_w:1.15, gross_volume:5.198, net_volume:4.658, currency:"USD", price_m3:3200, total_value:14905.60, status:"available", photos:["https://images.unsplash.com/photo-1542621334-a254cf47733d?w=800&q=80","https://images.unsplash.com/photo-1568383253400-81371f6f5e38?w=800&q=80"], notes:"Brancura excepcional. Veio sutil cinza.", created_by:2, created_at:"2025-01-20T09:00:00Z" },
    { id:7,  code:"ESP-002", quarry_id:2, material:"Mármore Branco Espírito Santo", classification:"A",  gross_l:2.60, gross_h:1.45, gross_w:1.15, net_l:2.50, net_h:1.40, net_w:1.10, gross_volume:4.334, net_volume:3.850, currency:"USD", price_m3:3000, total_value:11550.00, status:"available", photos:["https://images.unsplash.com/photo-1568383253400-81371f6f5e38?w=800&q=80"], notes:"Alta demanda no mercado italiano.", created_by:2, created_at:"2025-01-22T10:30:00Z" },
    { id:8,  code:"ESP-003", quarry_id:2, material:"Quartzito Taj Mahal",           classification:"A+", gross_l:3.00, gross_h:1.80, gross_w:1.35, net_l:2.90, net_h:1.74, net_w:1.30, gross_volume:7.290, net_volume:6.557, currency:"USD", price_m3:2800, total_value:18359.60, status:"available", photos:["https://images.unsplash.com/photo-1618317640648-65fef84c9e9b?w=800&q=80","https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80"], notes:"Peça premium. Raro e muito procurado.", created_by:2, created_at:"2025-02-01T08:00:00Z" },
    { id:9,  code:"ESP-004", quarry_id:2, material:"Quartzito Taj Mahal",           classification:"A",  gross_l:2.75, gross_h:1.65, gross_w:1.25, net_l:2.65, net_h:1.58, net_w:1.20, gross_volume:5.661, net_volume:5.027, currency:"USD", price_m3:2600, total_value:13070.20, status:"available", photos:["https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80"], notes:"Coloração dourada equilibrada.", created_by:2, created_at:"2025-02-05T09:00:00Z" },
    { id:10, sys_code:"SB-2025-D3E4", code:"ESP-005", quarry_id:2, material:"Mármore Bege Bahia",            classification:"B",  gross_l:2.40, gross_h:1.35, gross_w:1.10, net_l:2.30, net_h:1.30, net_w:1.05, gross_volume:3.564, net_volume:3.140, currency:"BRL", price_m3:1100, total_value:3454.00,  status:"available", photos:["https://images.unsplash.com/photo-1600607686527-6fb886090705?w=800&q=80"], notes:"Material clássico de boa aceitação.", created_by:2, created_at:"2025-02-10T08:00:00Z" },
    // ── Pedreira Alvorada ──
    { id:11, sys_code:"SB-2025-G6H7", code:"ALV-001", quarry_id:3, material:"Granito Rosa Porriño",          classification:"A",  gross_l:2.90, gross_h:1.70, gross_w:1.30, net_l:2.80, net_h:1.64, net_w:1.25, gross_volume:6.409, net_volume:5.740, currency:"USD", price_m3:1500, total_value:8610.00,  status:"available", photos:["https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800&q=80"], notes:"Rosa uniforme. Muito usado em projetos de luxo.", created_by:2, created_at:"2025-02-12T09:00:00Z" },
    { id:12, sys_code:"SB-2025-K9L2", code:"ALV-002", quarry_id:3, material:"Travertino Romano",             classification:"A+", gross_l:3.10, gross_h:1.85, gross_w:1.40, net_l:3.00, net_h:1.78, net_w:1.35, gross_volume:8.029, net_volume:7.209, currency:"USD", price_m3:1900, total_value:13697.10, status:"available", photos:["https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80","https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80"], notes:"Travertino claro, poucos poros. Excelente para fachadas.", created_by:2, created_at:"2025-02-15T10:00:00Z" },
    { id:13, sys_code:"SB-2025-N4P5", code:"ALV-003", quarry_id:3, material:"Quartzito Persa",               classification:"A",  gross_l:2.65, gross_h:1.55, gross_w:1.20, net_l:2.55, net_h:1.50, net_w:1.15, gross_volume:4.929, net_volume:4.401, currency:"USD", price_m3:2400, total_value:10562.40, status:"available", photos:["https://images.unsplash.com/photo-1618317640648-65fef84c9e9b?w=800&q=80"], notes:"Veios dramáticos em cinza e ouro.", created_by:2, created_at:"2025-03-01T08:00:00Z" },
    // ── Vendidos ──
    { id:14, sys_code:"SB-2024-R7S8", code:"VMC-006", quarry_id:1, material:"Granito Verde Ubatuba",         classification:"A",  gross_l:2.95, gross_h:1.80, gross_w:1.35, net_l:2.85, net_h:1.74, net_w:1.30, gross_volume:7.181, net_volume:6.450, currency:"USD", price_m3:1750, total_value:11287.50, status:"sold", photos:["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"], notes:"Vendido para mercado europeu.", created_by:2, created_at:"2024-12-01T09:00:00Z" },
    { id:15, sys_code:"SB-2024-U3V4", code:"ESP-006", quarry_id:2, material:"Quartzito Taj Mahal",           classification:"A+", gross_l:3.20, gross_h:1.90, gross_w:1.45, net_l:3.10, net_h:1.84, net_w:1.40, gross_volume:8.816, net_volume:7.990, currency:"USD", price_m3:2900, total_value:23171.00, status:"sold", photos:["https://images.unsplash.com/photo-1618317640648-65fef84c9e9b?w=800&q=80"], notes:"Exportado para EUA.", created_by:2, created_at:"2024-12-15T10:00:00Z" },
  ],
  clients: [
    { id:1, name:"Marble World USA",    country:"Estados Unidos",  phone:"+1 212 555-0191",  email:"marble@worldusa.com",    doc:"EIN 12-3456789",       notes:"Principal comprador americano.", user_id:4 },
    { id:2, name:"Stone Italia Srl",    country:"Itália",          phone:"+39 055 555-0202", email:"acquisti@stoneitalia.it", doc:"P.IVA IT12345678901",  notes:"Importador italiano. Prefere mármore e travertino.", user_id:5 },
    { id:3, name:"Construtora Noronha", country:"Brasil",          phone:"+55 21 99888-0303",email:"compras@noronha.com.br",  doc:"45.678.901/0001-23",   notes:"Obras de alto padrão no Rio." },
    { id:4, name:"Al Faris Trading",    country:"Emirados Árabes", phone:"+971 50 555-0404", email:"stone@alfaris.ae",        doc:"TRN 100-234-567",      notes:"Mercado árabe. Interesse em granito preto." },
  ],
  payment_methods: [
    { id:1, name:"Transferência Bancária (BRL)", details:"Banco do Brasil — Ag: 1234 — CC: 56789-0" },
    { id:2, name:"Wire Transfer (USD)",          details:"Bradesco NY | SWIFT: BRASBRRJBHE | Account: 123456789" },
    { id:3, name:"Letter of Credit (L/C)",       details:"Carta de crédito irrevogável. Prazo: 30 dias." },
    { id:4, name:"30/60/90 dias (BRL)",          details:"Parcelamento em 3x com emissão de duplicatas." },
  ],
  block_releases: [
    { id:1, block_id:1,  client_id:1, liberado_por:1, data_liberacao:"2025-01-08T10:00:00Z" },
    { id:2, block_id:2,  client_id:1, liberado_por:1, data_liberacao:"2025-01-10T10:00:00Z" },
    { id:3, block_id:3,  client_id:1, liberado_por:1, data_liberacao:"2025-01-12T10:00:00Z" },
    { id:4, block_id:6,  client_id:1, liberado_por:1, data_liberacao:"2025-01-20T10:00:00Z" },
    { id:5, block_id:8,  client_id:1, liberado_por:1, data_liberacao:"2025-02-01T10:00:00Z" },
    { id:6, block_id:9,  client_id:1, liberado_por:1, data_liberacao:"2025-02-05T10:00:00Z" },
    { id:7, block_id:6,  client_id:2, liberado_por:1, data_liberacao:"2025-01-21T10:00:00Z" },
    { id:8, block_id:7,  client_id:2, liberado_por:1, data_liberacao:"2025-01-22T10:00:00Z" },
    { id:9, block_id:12, client_id:2, liberado_por:1, data_liberacao:"2025-02-15T10:00:00Z" },
  ],
  favorites:      [],
  access_history: [],
  sales: [
    { id:1, block_ids:[14], seller_id:3, client_id:2, payment_method_id:2, dollar_rate:4.97, total_brl:56099.48, total_usd:11287.50, obs:"Exportação Europa — Stone Italia Srl", created_at:"2024-12-20T14:00:00Z" },
    { id:2, block_ids:[15], seller_id:3, client_id:1, payment_method_id:2, dollar_rate:4.95, total_brl:114696.45, total_usd:23171.00, obs:"Exportação EUA — Marble World USA", created_at:"2025-01-05T11:00:00Z" },
  ],
  orders: [],
  notifications: [
    { id:1, user_id:1, message:"Bem-vindo ao Stone Block! Sistema pronto para uso.", read:false, created_at:"2025-01-08T08:00:00Z", type:"info" },
    { id:2, user_id:1, message:"Venda concluída: VMC-006 — US$ 11.287,50", read:true, created_at:"2024-12-20T14:01:00Z", type:"sale" },
    { id:3, user_id:1, message:"Venda concluída: ESP-006 — US$ 23.171,00", read:true, created_at:"2025-01-05T11:01:00Z", type:"sale" },
  ],
};

// ─── PERSISTENCE ─────────────────────────────
const DB_KEY = "stoneblock_db_v1";

function loadDb() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    // Merge: use saved data but fill in any missing SEED keys
    return {
      ...SEED,
      ...saved,
      // ensure new fields exist even in old saved data
      favorites:       saved.favorites       || [],
      access_history:  saved.access_history  || [],
    };
  } catch (e) {
    console.warn("Erro ao carregar banco de dados:", e);
    return null;
  }
}

function saveDb(db) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch (e) {
    console.warn("Erro ao salvar banco de dados:", e);
  }
}

// ─── HELPERS ─────────────────────────────────
const nid   = arr => arr.length ? Math.max(...arr.map(x=>x.id||0))+1 : 1;
const calcV = (l,h,w) => parseFloat((parseFloat(l)*parseFloat(h)*parseFloat(w)).toFixed(4));

// Generate unique global block ID: SB-YYYY-XXXXXX
function genBlockId(existingBlocks) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I,O,1,0 to avoid confusion
  const year  = new Date().getFullYear();
  const usedIds = new Set((existingBlocks||[]).map(b => b.sys_code).filter(Boolean));
  let code;
  do {
    const rand = Array.from({length:4}, () => chars[Math.floor(Math.random()*chars.length)]).join("");
    code = `SB-${year}-${rand}`;
  } while (usedIds.has(code));
  return code;
}
const money = (v,c="BRL") => c==="USD"
  ? Number(v).toLocaleString("en-US",{style:"currency",currency:"USD"})
  : Number(v).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const fdate  = d => new Date(d).toLocaleString("pt-BR");
const fdateS = d => new Date(d).toLocaleDateString("pt-BR");

const SL = { produced:"Produzido", analysis:"Em Análise", available:"Disponível", reserved:"Reservado", sold:"Vendido" };
const SC = { produced:"#64748b", analysis:"#f59e0b", available:"#22c55e", reserved:"#3b82f6", sold:"#ef4444" };
const MATS = ["Granito Verde Ubatuba","Granito Preto São Gabriel","Granito Amarelo Ornamental","Granito Rosa Porriño","Mármore Branco Carrara","Mármore Branco Espírito Santo","Mármore Bege Bahia","Quartzito Taj Mahal","Quartzito Persa","Travertino Romano"];

// ─── ICON ────────────────────────────────────
function Icon({n,s=18,c="currentColor"}) {
  const p = {
    cube: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12",
    grid: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
    bell: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",
    plus: "M12 5v14M5 12h14",
    cart: "M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM20 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
    check:"M20 6L9 17l-5-5",
    x:    "M18 6L6 18M6 6l12 12",
    out:  "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
    money:"M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
    lock: "M3 11h18v11H3zM7 11V7a5 5 0 0 1 10 0v4",
    srch: "M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z",
    mtn:  "M3 20L9 4l6 10 3-4 3 10H3z",
    hist: "M1 4v6h6M3.51 15a9 9 0 1 0 .49-4.95",
    book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z",
    heart:"M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
    up:   "M16 16l-4-4-4 4M12 12v9M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3",
    menu: "M3 12h18M3 6h18M3 18h18",
    info: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-4M12 8h.01",
    chevl:"M15 18l-6-6 6-6",
    chevr:"M9 18l6-6-6-6",
    eye:  "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
    eyex: "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22",
    mail: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
    shld: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    zap:  "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
    trend:"M23 6l-9.5 9.5-5-5L1 18M17 6h6v6",
    edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
    trash:"M3 6h18M8 6V4h8v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",
    user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    card: "M1 4h22v16H1zM1 10h22",
    wa:   "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z",
    doc:  "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
    dolar:"M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
    globe:"M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
  };
  const d = p[n]||"";
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {d.split("M").filter(Boolean).map((seg,i)=><path key={i} d={"M"+seg}/>)}
    </svg>
  );
}

// ─── DESIGN SYSTEM ───────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');

/* ── Tokens ── */
:root {
  /* Brand */
  --ink:   #0a0f1e;
  --ink2:  #111827;
  --stone: #1e293b;
  --slate: #334155;
  --mid:   #64748b;
  --mist:  #94a3b8;
  --cloud: #cbd5e1;
  --fog:   #e2e8f0;
  --haze:  #f1f5f9;
  --white: #ffffff;

  /* Accent — sapphire */
  --sap9: #0c1a4e;
  --sap8: #1e3a8a;
  --sap7: #1d4ed8;
  --sap6: #2563eb;
  --sap5: #3b82f6;
  --sap4: #60a5fa;
  --sap2: #bfdbfe;
  --sap1: #dbeafe;
  --sap0: #eff6ff;

  /* Semantic */
  --ok:   #10b981;
  --warn: #f59e0b;
  --err:  #ef4444;
  --purp: #8b5cf6;

  /* Surface */
  --bg:     #f8fafc;
  --card:   #ffffff;
  --bdr:    rgba(15,23,42,.08);
  --bdr2:   rgba(15,23,42,.05);

  /* Shadows */
  --sh-xs: 0 1px 3px rgba(15,23,42,.06),0 1px 2px rgba(15,23,42,.04);
  --sh-sm: 0 2px 8px rgba(15,23,42,.08),0 1px 3px rgba(15,23,42,.05);
  --sh-md: 0 4px 20px rgba(15,23,42,.10),0 2px 6px rgba(15,23,42,.06);
  --sh-lg: 0 12px 40px rgba(15,23,42,.14),0 4px 12px rgba(15,23,42,.08);
  --sh-xl: 0 24px 64px rgba(15,23,42,.18),0 8px 24px rgba(15,23,42,.10);

  /* Motion */
  --ease: cubic-bezier(.16,1,.3,1);
  --fast: .15s;
  --mid-t: .25s;
  --slow: .4s;

  /* Radius */
  --r-sm: 8px;
  --r-md: 12px;
  --r-lg: 16px;
  --r-xl: 20px;
}

/* ── Reset ── */
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Inter',sans-serif;background:#f8fafc;color:#111827;-webkit-font-smoothing:antialiased;}@media(prefers-color-scheme:dark){body{background:#f8fafc;color:#111827;}}

/* ── App shell ── */
.app{display:flex;flex-direction:column;min-height:100vh;background:#f8fafc;}

/* ── Topbar ── */
.tb{
  background:rgba(10,15,30,.96);
  backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
  display:flex;align-items:center;justify-content:space-between;
  padding:0 24px;height:64px;
  position:sticky;top:0;z-index:100;
  border-bottom:1px solid rgba(255,255,255,.06);
  box-shadow:0 1px 0 rgba(255,255,255,.04),0 4px 24px rgba(0,0,0,.3);
}
.tbl{display:flex;align-items:center;gap:12px;}
.tblogo{
  font-family:'Sora',sans-serif;font-size:18px;font-weight:800;
  color:#fff;letter-spacing:-.5px;
}
.tblogo span{
  background:linear-gradient(135deg,var(--sap4),#a5b4fc);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
}
.tbsub{font-size:11px;color:rgba(148,163,184,.5);font-weight:400;letter-spacing:.5px;text-transform:uppercase;display:none;}
@media(min-width:540px){.tbsub{display:block;}}
.tbr{display:flex;align-items:center;gap:8px;}
.nbbtn{
  position:relative;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);
  cursor:pointer;color:rgba(148,163,184,.8);padding:8px;border-radius:10px;
  display:flex;align-items:center;transition:all var(--fast) var(--ease);
}
.nbbtn:hover{background:rgba(255,255,255,.1);color:#fff;border-color:rgba(255,255,255,.14);}
.nbdot{
  position:absolute;top:-3px;right:-3px;background:var(--err);color:#fff;
  font-size:9px;font-weight:700;min-width:16px;height:16px;border-radius:8px;
  display:flex;align-items:center;justify-content:center;padding:0 3px;
  border:2px solid rgba(10,15,30,.96);
}
.av{
  width:36px;height:36px;border-radius:10px;
  background:linear-gradient(135deg,var(--sap7),var(--sap5));
  color:#fff;font-size:12px;font-weight:700;
  display:flex;align-items:center;justify-content:center;
  border:1px solid rgba(255,255,255,.15);
  box-shadow:0 2px 8px rgba(37,99,235,.3);
}
.hbtn{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);cursor:pointer;color:rgba(148,163,184,.8);padding:6px;border-radius:8px;display:flex;transition:all var(--fast) var(--ease);}
.hbtn:hover{background:rgba(255,255,255,.1);color:#fff;}

/* ── Layout ── */
.lay{display:flex;flex:1;}

/* ── Sidebar ── */
.sb{
  width:240px;
  background:rgba(10,15,30,.98);
  display:flex;flex-direction:column;
  position:fixed;top:64px;left:0;bottom:0;z-index:90;
  transform:translateX(-100%);transition:transform var(--mid-t) var(--ease);
  overflow-y:auto;
  border-right:1px solid rgba(255,255,255,.05);
}
.sb.open{transform:translateX(0);}
@media(min-width:768px){.sb{transform:translateX(0);}.main{margin-left:240px;}}
.sbov{display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:89;top:64px;backdrop-filter:blur(4px);}
.sbov.show{display:block;}
@media(min-width:768px){.sbov{display:none!important;}}
.sbsec{padding:20px 0 4px;}
.sblbl{
  font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:2px;
  color:rgba(148,163,184,.3);padding:0 20px 8px;
}
.sbni{
  display:flex;align-items:center;gap:10px;
  padding:10px 20px;cursor:pointer;
  color:rgba(148,163,184,.55);font-size:13px;font-weight:500;
  transition:all var(--fast) var(--ease);
  border-left:2px solid transparent;
  margin:1px 0;
}
.sbni:hover{background:rgba(255,255,255,.04);color:rgba(255,255,255,.8);border-left-color:rgba(255,255,255,.1);}
.sbni.on{
  background:rgba(37,99,235,.12);
  border-left-color:var(--sap5);
  color:#fff;
}
.sbni.on svg{color:var(--sap4);}
.sbft{margin-top:auto;padding:16px;border-top:1px solid rgba(255,255,255,.05);}
.sbusr{display:flex;align-items:center;gap:10px;margin-bottom:14px;padding:10px;background:rgba(255,255,255,.04);border-radius:10px;border:1px solid rgba(255,255,255,.06);}
.sbun{font-size:13px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.sbur{font-size:10px;color:rgba(148,163,184,.5);text-transform:uppercase;letter-spacing:.5px;}
.lobtn{
  width:100%;display:flex;align-items:center;gap:8px;padding:9px 12px;
  background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.15);
  border-radius:8px;color:rgba(252,165,165,.7);cursor:pointer;font-size:12px;
  font-family:'Inter',sans-serif;transition:all var(--fast) var(--ease);
}
.lobtn:hover{background:rgba(239,68,68,.14);color:#fca5a5;border-color:rgba(239,68,68,.25);}

/* ── Main content ── */
.main{flex:1;padding:28px 24px;min-height:calc(100vh - 64px);background:#f8fafc;}
@media(min-width:768px){.main{padding:32px 36px;}}

/* ── Page header ── */
.ph{margin-bottom:28px;}
.ptit{
  font-family:'Sora',sans-serif;font-size:26px;font-weight:700;
  color:#0f172a;letter-spacing:-.5px;line-height:1.2;
}
.psub{font-size:14px;color:#64748b;margin-top:4px;font-weight:400;}

/* ── Card ── */
.card{
  background:var(--card);border-radius:var(--r-lg);
  box-shadow:var(--sh-sm);border:1px solid var(--bdr);
  transition:box-shadow var(--mid-t) var(--ease);
}
.cb{padding:22px;}
.chead{
  padding:16px 22px;border-bottom:1px solid var(--bdr2);
  display:flex;align-items:center;justify-content:space-between;
}
.ctit{font-size:13px;font-weight:700;color:var(--slate);letter-spacing:.2px;}

/* ── Stat cards ── */
.sg{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin-bottom:28px;}
@media(min-width:640px){.sg{grid-template-columns:repeat(4,1fr);}}
.sc{
  background:var(--card);border-radius:var(--r-lg);
  padding:20px;box-shadow:var(--sh-sm);border:1px solid var(--bdr);
  transition:all var(--mid-t) var(--ease);
  position:relative;overflow:hidden;
}
.sc:hover{box-shadow:var(--sh-md);transform:translateY(-1px);}
.sc::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--sc-accent,var(--sap5));border-radius:var(--r-lg) var(--r-lg) 0 0;}
.sico{
  width:42px;height:42px;border-radius:10px;
  display:flex;align-items:center;justify-content:center;
  margin-bottom:14px;
  background:var(--sc-bg,var(--sap1));
}
.sval{font-family:'Sora',sans-serif;font-size:28px;font-weight:800;color:var(--ink2);letter-spacing:-1px;line-height:1;}
.slbl2{font-size:12px;color:var(--mist);margin-top:4px;font-weight:500;}

/* ── Block grid ── */
.bgg{display:grid;grid-template-columns:1fr;gap:20px;}
@media(min-width:480px){.bgg{grid-template-columns:repeat(2,1fr);}}
@media(min-width:860px){.bgg{grid-template-columns:repeat(3,1fr);}}
@media(min-width:1200px){.bgg{grid-template-columns:repeat(4,1fr);}}

/* ── Block card — PREMIUM ── */
.bk{
  background:var(--card);border-radius:var(--r-xl);
  box-shadow:var(--sh-sm);border:1px solid var(--bdr);
  overflow:hidden;cursor:pointer;
  transition:transform var(--mid-t) var(--ease),box-shadow var(--mid-t) var(--ease),border-color var(--mid-t) var(--ease);
  position:relative;
}
.bk:hover{
  transform:translateY(-5px) scale(1.005);
  box-shadow:var(--sh-xl);
  border-color:rgba(37,99,235,.2);
}
.bk:hover .bk-overlay{opacity:1;}
.bkimg{
  height:200px;
  background:linear-gradient(160deg,var(--stone) 0%,var(--slate) 100%);
  display:flex;align-items:center;justify-content:center;
  position:relative;overflow:hidden;
}
.bkimg img{width:100%;height:100%;object-fit:cover;transition:transform var(--slow) var(--ease);}
.bk:hover .bkimg img{transform:scale(1.04);}
.bk-overlay{
  position:absolute;inset:0;
  background:linear-gradient(to top,rgba(10,15,30,.7) 0%,transparent 60%);
  opacity:0;transition:opacity var(--mid-t) var(--ease);
  pointer-events:none;
}
.bkst{
  position:absolute;top:12px;left:12px;
  font-size:10px;font-weight:700;padding:4px 10px;border-radius:20px;
  text-transform:uppercase;letter-spacing:.8px;
  backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
}
.bkbd{padding:16px 18px 12px;}
.bkcd{
  font-size:10px;font-weight:700;color:var(--sap6);
  text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px;
}
.bkmt{
  font-family:'Sora',sans-serif;font-size:15px;font-weight:700;
  color:var(--ink2);margin-bottom:4px;line-height:1.3;
}
.bkqr{
  font-size:11px;color:var(--mist);
  display:flex;align-items:center;gap:4px;margin-bottom:12px;
}
.bkmeta{
  display:flex;align-items:center;justify-content:space-between;
  padding-top:10px;border-top:1px solid var(--bdr2);
}
.bkvol{font-size:11px;color:var(--mist);font-weight:500;}
.bkprice{
  font-family:'Sora',sans-serif;font-size:16px;font-weight:800;
  color:var(--sap7);letter-spacing:-.3px;
}
.bkacts{
  display:flex;gap:6px;padding:10px 16px;
  border-top:1px solid var(--bdr2);flex-wrap:wrap;
  background:var(--haze);
}

/* Slider arrows */
.tharr{
  position:absolute;top:50%;transform:translateY(-50%);
  background:rgba(10,15,30,.6);backdrop-filter:blur(8px);
  border:none;color:#fff;width:28px;height:28px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:2;
  transition:all var(--fast) var(--ease);
}
.tharr:hover{background:rgba(10,15,30,.85);transform:translateY(-50%) scale(1.1);}
.tharr.l{left:8px;}.tharr.r{right:8px;}
.thnav{position:absolute;bottom:10px;left:50%;transform:translateX(-50%);display:flex;gap:4px;}
.thdot{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.4);}
.thdot.on{background:#fff;width:14px;border-radius:3px;}

/* ── Buttons ── */
.btn{
  display:inline-flex;align-items:center;gap:6px;
  padding:9px 18px;border-radius:var(--r-sm);
  font-size:13px;font-weight:600;cursor:pointer;border:none;
  transition:all var(--fast) var(--ease);
  white-space:nowrap;font-family:'Inter',sans-serif;
  letter-spacing:.1px;
}
.bb{background:var(--sap7);color:#fff;box-shadow:0 1px 0 rgba(255,255,255,.12) inset,0 2px 8px rgba(37,99,235,.25);}
.bb:hover{background:var(--sap8);box-shadow:0 2px 12px rgba(37,99,235,.35);transform:translateY(-1px);}
.bo{
  background:transparent;color:var(--slate);
  border:1.5px solid var(--fog);
}
.bo:hover{border-color:var(--sap5);background:var(--sap0);color:var(--sap7);}
.br{background:var(--err);color:#fff;box-shadow:0 2px 8px rgba(239,68,68,.2);}
.br:hover{background:#dc2626;transform:translateY(-1px);}
.bg{background:var(--ok);color:#fff;box-shadow:0 2px 8px rgba(16,185,129,.2);}
.bg:hover{background:#059669;transform:translateY(-1px);}
.ba{background:var(--warn);color:#fff;}
.ba:hover{background:#d97706;transform:translateY(-1px);}
.bpur{background:var(--purp);color:#fff;}
.bpur:hover{background:#7c3aed;transform:translateY(-1px);}
.bwa{background:#25d366;color:#fff;box-shadow:0 2px 8px rgba(37,211,102,.2);}
.bwa:hover{background:#1da851;transform:translateY(-1px);}
.bsm{padding:6px 12px;font-size:12px;}
.bxs{padding:4px 10px;font-size:11px;border-radius:6px;}
.bic{padding:8px;}
.btn:disabled{opacity:.45;cursor:not-allowed;transform:none!important;}
.btn:active{transform:translateY(0)!important;}

/* ── Forms ── */
.fg{margin-bottom:18px;}
.fl{
  font-size:11px;font-weight:700;color:var(--mid);
  text-transform:uppercase;letter-spacing:.8px;
  margin-bottom:6px;display:block;
}
.fc{
  width:100%;padding:10px 14px;
  border:1.5px solid var(--fog);border-radius:var(--r-sm);
  font-size:14px;font-family:'Inter',sans-serif;
  background:var(--white);color:var(--ink2);
  transition:all var(--fast) var(--ease);outline:none;
}
.fc:focus{border-color:var(--sap5);box-shadow:0 0 0 3px rgba(59,130,246,.1);}
.fc:hover:not(:focus){border-color:var(--cloud);}
select.fc{cursor:pointer;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:36px;}
textarea.fc{resize:vertical;min-height:80px;line-height:1.5;}
.fr2{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.fr3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;}
.calcbox{
  background:linear-gradient(135deg,var(--sap0),#eef2ff);
  border:1.5px solid var(--sap2);border-radius:var(--r-sm);padding:12px 16px;
}
.calclbl{font-size:10px;font-weight:700;color:var(--sap7);text-transform:uppercase;letter-spacing:1px;}
.calcval{font-size:24px;font-family:'Sora',sans-serif;font-weight:800;color:var(--sap7);margin-top:2px;}
.ctag{display:inline-flex;background:var(--sap1);color:var(--sap7);font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;letter-spacing:.5px;}

/* ── Modal ── */
.mo{
  position:fixed;inset:0;
  background:rgba(10,15,30,.75);z-index:200;
  display:flex;align-items:flex-start;justify-content:center;
  padding:20px;overflow-y:auto;
  backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);
  animation:moshow var(--fast) var(--ease);
}
@keyframes moshow{from{opacity:0;}to{opacity:1;}}
.md{
  background:var(--card);border-radius:var(--r-xl);
  width:100%;max-width:720px;
  box-shadow:var(--sh-xl);margin:auto;
  animation:mdshow var(--mid-t) var(--ease);
  border:1px solid rgba(255,255,255,.8);
}
@keyframes mdshow{from{opacity:0;transform:translateY(16px) scale(.98);}to{opacity:1;transform:none;}}
.md-wide{max-width:880px;}
.mhead{
  padding:20px 26px;border-bottom:1px solid var(--bdr2);
  display:flex;align-items:center;justify-content:space-between;
}
.mtit{font-family:'Sora',sans-serif;font-size:19px;font-weight:700;color:var(--ink2);letter-spacing:-.3px;}
.mbody{padding:26px;max-height:78vh;overflow-y:auto;}
.mfoot{
  padding:16px 26px;border-top:1px solid var(--bdr2);
  display:flex;justify-content:flex-end;gap:10px;flex-wrap:wrap;
  background:var(--haze);border-radius:0 0 var(--r-xl) var(--r-xl);
}

/* ── Lightbox ── */
.lb{position:fixed;inset:0;background:rgba(0,0,0,.95);z-index:300;display:flex;align-items:center;justify-content:center;animation:moshow var(--fast) var(--ease);}
.lb img{max-width:90vw;max-height:86vh;border-radius:var(--r-md);object-fit:contain;box-shadow:var(--sh-xl);}
.lbcl{position:absolute;top:20px;right:20px;background:rgba(255,255,255,.1);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.15);color:#fff;width:40px;height:40px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all var(--fast) var(--ease);}
.lbcl:hover{background:rgba(255,255,255,.2);}
.lbnv{position:absolute;top:50%;transform:translateY(-50%);background:rgba(255,255,255,.1);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.15);color:#fff;width:46px;height:46px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all var(--fast) var(--ease);}
.lbnv:hover{background:rgba(255,255,255,.2);transform:translateY(-50%) scale(1.05);}
.lbnv.p{left:20px;}.lbnv.n{right:20px;}
.lbct{position:absolute;bottom:24px;left:50%;transform:translateX(-50%);color:rgba(255,255,255,.6);font-size:12px;background:rgba(255,255,255,.1);backdrop-filter:blur(8px);padding:5px 16px;border-radius:20px;}

/* ── Notifications panel ── */
.np{position:fixed;top:64px;right:0;width:340px;max-height:calc(100vh - 64px);background:var(--card);box-shadow:var(--sh-xl);z-index:150;overflow-y:auto;border-left:1px solid var(--bdr);animation:npshow var(--mid-t) var(--ease);}
@keyframes npshow{from{transform:translateX(100%);opacity:0;}to{transform:none;opacity:1;}}
.nphead{padding:16px 20px;border-bottom:1px solid var(--bdr2);font-weight:700;font-size:14px;display:flex;align-items:center;justify-content:space-between;color:var(--ink2);}
.npitem{padding:14px 20px;border-bottom:1px solid var(--bdr2);cursor:pointer;transition:background var(--fast) var(--ease);}
.npitem:hover{background:var(--haze);}
.npitem.unread{background:var(--sap0);border-left:3px solid var(--sap5);}
.npmsg{font-size:13px;color:var(--ink2);line-height:1.45;}
.nptime{font-size:11px;color:var(--mist);margin-top:3px;}

/* ── Tables ── */
.tw{overflow-x:auto;border-radius:0 0 var(--r-lg) var(--r-lg);}
table{width:100%;border-collapse:collapse;font-size:13px;}
th{
  padding:11px 16px;text-align:left;
  font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;
  color:var(--mist);border-bottom:1px solid var(--fog);white-space:nowrap;
  background:var(--haze);
}
td{padding:13px 16px;border-bottom:1px solid var(--bdr2);vertical-align:middle;}
tr:last-child td{border-bottom:none;}
tr:hover td{background:var(--sap0);}

/* ── Misc ── */
.bdg{display:inline-flex;padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;}
.fb{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:22px;align-items:center;}
.ds{margin-bottom:22px;}
.dstit{
  font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;
  color:var(--sap6);margin-bottom:12px;padding-bottom:8px;
  border-bottom:1px solid var(--sap1);
}
.dgrid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;}
@media(min-width:480px){.dgrid{grid-template-columns:repeat(3,1fr);}}
.di{
  background:var(--haze);border-radius:var(--r-sm);
  padding:12px 14px;border:1px solid var(--bdr2);
  transition:all var(--fast) var(--ease);
}
.di:hover{border-color:var(--sap2);background:var(--sap0);}
.dilbl{font-size:9px;font-weight:700;text-transform:uppercase;color:var(--mist);letter-spacing:.8px;}
.dival{font-size:15px;font-weight:700;color:var(--ink2);margin-top:3px;}
.pgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
.pthumb{aspect-ratio:1;border-radius:var(--r-sm);overflow:hidden;background:var(--haze);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform var(--fast) var(--ease);}
.pthumb:hover{transform:scale(.97);}
.pthumb img{width:100%;height:100%;object-fit:cover;}
.tabs{display:flex;border-bottom:1px solid var(--fog);margin-bottom:24px;overflow-x:auto;gap:2px;}
.tab{
  padding:10px 20px;font-size:13px;font-weight:600;cursor:pointer;
  color:var(--mist);border-bottom:2px solid transparent;margin-bottom:-1px;
  white-space:nowrap;transition:all var(--fast) var(--ease);border-radius:var(--r-sm) var(--r-sm) 0 0;
}
.tab:hover{color:var(--slate);background:var(--haze);}
.tab.on{color:var(--sap7);border-bottom-color:var(--sap6);background:var(--sap0);}
.es{text-align:center;padding:60px 20px;color:var(--mist);}
.estit{font-size:15px;font-weight:600;color:var(--cloud);margin-top:8px;}
.uz{
  border:2px dashed var(--fog);border-radius:var(--r-md);
  padding:28px;text-align:center;cursor:pointer;
  transition:all var(--fast) var(--ease);color:var(--mist);background:var(--haze);
}
.uz:hover{border-color:var(--sap5);background:var(--sap0);color:var(--sap7);}
.toast{
  position:fixed;bottom:28px;right:28px;
  background:var(--ink);color:#fff;
  padding:13px 18px;border-radius:var(--r-md);
  font-size:13px;font-weight:600;z-index:400;
  box-shadow:var(--sh-xl);display:flex;align-items:center;gap:10px;
  animation:tshow var(--mid-t) var(--ease);max-width:340px;
  border:1px solid rgba(255,255,255,.08);
  backdrop-filter:blur(12px);
}
.toast.ok{background:linear-gradient(135deg,#065f46,#047857);}
.toast.err{background:linear-gradient(135deg,#7f1d1d,#991b1b);}
@keyframes tshow{from{transform:translateY(20px);opacity:0;}to{transform:none;opacity:1;}}
.dvd{border:none;border-top:1px solid var(--bdr2);margin:20px 0;}
.seclbl{
  font-size:10px;font-weight:700;text-transform:uppercase;
  letter-spacing:1.2px;color:var(--sap6);margin-bottom:14px;
}
.obadge{
  display:inline-flex;align-items:center;justify-content:center;
  background:var(--err);color:#fff;border-radius:50%;
  width:18px;height:18px;font-size:10px;font-weight:700;margin-left:auto;
}

/* ── Romaneio ── */
.romaneio{background:#fff;border-radius:var(--r-md);border:1.5px solid var(--sap2);overflow:hidden;}
.rom-header{background:linear-gradient(135deg,#0f172a,#1e3a8a);color:#fff;padding:24px 28px;}
.rom-logo{font-family:'Sora',sans-serif;font-size:20px;font-weight:800;}
.rom-logo span{color:var(--sap4);}
.rom-body{padding:20px 28px;}
.rom-section{margin-bottom:18px;}
.rom-section-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:var(--sap6);margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--sap1);}
.rom-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.rom-field{padding:8px 10px;background:var(--haze);border-radius:6px;border:1px solid var(--bdr2);}
.rom-field-lbl{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--mist);}
.rom-field-val{font-size:13px;font-weight:700;color:var(--ink2);margin-top:1px;}
.rom-total{background:linear-gradient(135deg,var(--sap1),var(--sap0));border:1px solid var(--sap2);border-radius:var(--r-sm);padding:16px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;}
.rom-total-lbl{font-size:12px;font-weight:600;color:var(--sap8);}
.rom-total-val{font-family:'Sora',sans-serif;font-size:26px;font-weight:800;color:var(--sap7);}
.rom-footer{background:var(--haze);padding:14px 28px;font-size:11px;color:var(--mist);text-align:center;border-top:1px solid var(--bdr2);}
@media print{
  body>*:not(#rom-print-wrap){display:none!important;}
  #rom-print-wrap{display:block!important;position:fixed;inset:0;background:#fff;z-index:9999;padding:20px;}
  #rom-print-wrap .no-print{display:none!important;}
}
`;

const LCSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');
@keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-16px);}}
@keyframes ring{0%{transform:scale(1);opacity:.4;}100%{transform:scale(2.2);opacity:0;}}
@keyframes fup{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
@keyframes shim{0%{background-position:-200% center;}100%{background-position:200% center;}}
*{box-sizing:border-box;margin:0;padding:0;}body{font-family:'Inter',sans-serif;}
.lroot{min-height:100vh;background:#020c1b;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:32px 20px 48px;position:relative;overflow-x:hidden;}
.lbg{position:fixed;inset:0;pointer-events:none;z-index:0;background:radial-gradient(ellipse 80% 60% at 50% -10%,rgba(37,99,235,.35) 0%,transparent 60%),radial-gradient(ellipse 40% 40% at 10% 60%,rgba(29,78,216,.2) 0%,transparent 55%),linear-gradient(180deg,#020c1b 0%,#050f20 50%,#030810 100%);}
.lgrid{position:fixed;inset:0;pointer-events:none;z-index:0;opacity:.04;background-image:linear-gradient(rgba(99,179,237,.8) 1px,transparent 1px),linear-gradient(90deg,rgba(99,179,237,.8) 1px,transparent 1px);background-size:40px 40px;}
.lglow{position:fixed;width:600px;height:600px;top:-200px;left:50%;transform:translateX(-50%);background:radial-gradient(circle,rgba(37,99,235,.18) 0%,transparent 70%);pointer-events:none;z-index:0;}
.lcon{position:relative;z-index:1;width:100%;max-width:460px;animation:fup .7s ease both;}
.lhero{text-align:center;margin-bottom:36px;}
.liw{display:inline-flex;align-items:center;justify-content:center;width:80px;height:80px;border-radius:22px;margin-bottom:20px;background:linear-gradient(135deg,#1e3a6e 0%,#1d4ed8 50%,#3b82f6 100%);box-shadow:0 0 0 1px rgba(99,179,237,.2),0 8px 32px rgba(37,99,235,.4),inset 0 1px 0 rgba(255,255,255,.15);animation:float 6s ease-in-out infinite;position:relative;}
.lring{position:absolute;inset:-8px;border-radius:30px;border:1px solid rgba(99,179,237,.2);animation:ring 3s ease-out infinite;}
.lbrand{font-family:'Sora',sans-serif;font-size:36px;font-weight:800;letter-spacing:-1px;color:#fff;line-height:1;}
.lbrand span{background:linear-gradient(90deg,#60a5fa,#93c5fd,#60a5fa);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shim 3s linear infinite;}
.ltag{font-size:12px;letter-spacing:3px;text-transform:uppercase;color:rgba(148,163,184,.6);margin-top:8px;}
.lcard{background:rgba(10,25,55,.6);border:1px solid rgba(99,179,237,.15);border-radius:20px;padding:32px 28px;backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);box-shadow:0 0 0 1px rgba(255,255,255,.04) inset,0 24px 48px rgba(0,0,0,.4);margin-bottom:28px;}
.lct{font-family:'Sora',sans-serif;font-size:18px;font-weight:700;color:#fff;margin-bottom:6px;}
.lcs{font-size:13px;color:rgba(148,163,184,.7);margin-bottom:28px;}
.liwrap{position:relative;}
.liico{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:rgba(99,179,237,.5);pointer-events:none;display:flex;align-items:center;}
.lieye{position:absolute;right:14px;top:50%;transform:translateY(-50%);color:rgba(99,179,237,.4);cursor:pointer;background:none;border:none;padding:0;display:flex;align-items:center;}
.linp{width:100%;padding:13px 44px;background:rgba(255,255,255,.04);border:1px solid rgba(99,179,237,.15);border-radius:12px;color:#e2e8f0;font-size:14px;font-family:'Inter',sans-serif;outline:none;transition:all .2s;caret-color:#60a5fa;}
.linp::placeholder{color:rgba(148,163,184,.4);}
.linp:focus{border-color:rgba(99,179,237,.5);background:rgba(255,255,255,.07);box-shadow:0 0 0 3px rgba(37,99,235,.2);}
.llbl{display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:rgba(148,163,184,.6);margin-bottom:7px;}
.lerr{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);border-radius:8px;padding:10px 14px;color:#fca5a5;font-size:13px;margin-bottom:16px;display:flex;align-items:center;gap:8px;}
.lbtn{width:100%;padding:14px;background:linear-gradient(135deg,#1d4ed8 0%,#2563eb 50%,#3b82f6 100%);border:none;border-radius:12px;color:#fff;font-size:15px;font-weight:700;font-family:'Sora',sans-serif;cursor:pointer;transition:all .25s;display:flex;align-items:center;justify-content:center;gap:10px;position:relative;overflow:hidden;box-shadow:0 4px 20px rgba(37,99,235,.4);}
.lbtn::before{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,255,255,.12) 0%,transparent 100%);}
.lbtn:hover{transform:translateY(-1px);box-shadow:0 8px 30px rgba(37,99,235,.55);}
.ldemo{animation:fup .7s .15s ease both;}
.ldsep{display:flex;align-items:center;gap:8px;margin-bottom:6px;}
.ldtit{font-size:13px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(148,163,184,.5);}
.ldsub{text-align:center;font-size:12px;color:rgba(100,116,139,.6);margin-bottom:18px;}
.ldgrid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;}
@media(min-width:480px){.ldgrid{grid-template-columns:repeat(4,1fr);gap:10px;}}
.ldcard{background:rgba(10,25,55,.5);border:1px solid rgba(99,179,237,.1);border-radius:14px;padding:16px 12px 14px;cursor:pointer;transition:all .25s;text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px;backdrop-filter:blur(12px);}
.ldcard:hover{transform:translateY(-4px);border-color:rgba(99,179,237,.3);box-shadow:0 12px 32px rgba(0,0,0,.3);}
.ldicon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;}
.ldrl{font-family:'Sora',sans-serif;font-size:12px;font-weight:700;}
.ldeml{font-size:10px;color:rgba(148,163,184,.5);word-break:break-all;}
.ldsel{margin-top:2px;padding:5px 12px;border-radius:20px;font-size:10px;font-weight:700;border:1px solid;cursor:pointer;}
.lfooter{text-align:center;margin-top:28px;color:rgba(100,116,139,.4);font-size:11px;display:flex;flex-direction:column;gap:4px;animation:fup .7s .3s ease both;}
.lfbadges{display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:4px;}
.lfb{display:flex;align-items:center;gap:5px;color:rgba(148,163,184,.4);}
`;

const RC = {
  owner:   {label:"Dono",        color:"#3b82f6", bg:"rgba(37,99,235,.15)",   border:"rgba(59,130,246,.3)",  icon:"⚡"},
  foreman: {label:"Encarregado", color:"#94a3b8", bg:"rgba(100,116,139,.12)", border:"rgba(148,163,184,.25)", icon:"⛏"},
  seller:  {label:"Vendedor",    color:"#22d3ee", bg:"rgba(6,182,212,.12)",   border:"rgba(34,211,238,.25)",  icon:"💎"},
  client:  {label:"Cliente",     color:"#4ade80", bg:"rgba(34,197,94,.12)",   border:"rgba(74,222,128,.25)",  icon:"🏢"},
};

// ─── LOGIN ────────────────────────────────────
function LoginPage({users, onLogin}) {
  const [em,setEm]=useState(""); const [pw,setPw]=useState(""); const [vis,setVis]=useState(false); const [err,setErr]=useState("");
  const go=()=>{const u=users.find(u=>u.email===em&&u.password===pw);if(u)onLogin(u);else setErr("E-mail ou senha inválidos.");};
  return (
    <><style>{LCSS}</style>
    <div className="lroot">
      <div className="lbg"/><div className="lgrid"/><div className="lglow"/>
      <div className="lcon">
        <div className="lhero">
          <div style={{display:"flex",justifyContent:"center"}}>
            <div className="liw"><div className="lring"/>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="rgba(255,255,255,.9)" strokeWidth="1.5" fill="rgba(255,255,255,.08)"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke="rgba(147,197,253,.8)" strokeWidth="1.5" fill="none"/>
                <line x1="12" y1="22.08" x2="12" y2="12" stroke="rgba(147,197,253,.8)" strokeWidth="1.5"/>
              </svg>
            </div>
          </div>
          <div className="lbrand">Stone <span>Block</span></div>
          <div className="ltag">Gestão Inteligente de Rochas Ornamentais</div>
        </div>
        <div className="lcard">
          <div className="lct">Bem-vindo de volta</div>
          <div className="lcs">Acesse sua conta para continuar</div>
          <div style={{marginBottom:16}}><label className="llbl">E-mail</label>
            <div className="liwrap"><span className="liico"><Icon n="mail" s={16}/></span>
              <input className="linp" type="email" value={em} onChange={e=>{setEm(e.target.value);setErr("");}} placeholder="seu@email.com" onKeyDown={e=>e.key==="Enter"&&go()}/>
            </div>
          </div>
          <div style={{marginBottom:22}}><label className="llbl">Senha</label>
            <div className="liwrap"><span className="liico"><Icon n="lock" s={16}/></span>
              <input className="linp" type={vis?"text":"password"} value={pw} onChange={e=>{setPw(e.target.value);setErr("");}} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&go()}/>
              <button className="lieye" onClick={()=>setVis(v=>!v)}><Icon n={vis?"eyex":"eye"} s={16}/></button>
            </div>
          </div>
          {err&&<div className="lerr"><Icon n="info" s={15} c="#fca5a5"/>{err}</div>}
          <button className="lbtn" onClick={go}><Icon n="lock" s={17} c="rgba(255,255,255,.9)"/>Acessar Sistema</button>
        </div>
        <div className="ldemo">
          <div className="ldsep"><div style={{height:1,flex:1,background:"rgba(99,179,237,.1)"}}/><div className="ldtit">Acesso Rápido — Demo</div><div style={{height:1,flex:1,background:"rgba(99,179,237,.1)"}}/></div>
          <div className="ldsub">Experimente com usuários de demonstração</div>
          <div className="ldgrid">
            {["owner","foreman","seller","client"].map(role=>{
              const u=users.find(u=>u.role===role);
              if(!u) return null;
              const r=RC[role];const sel=em===u.email;
              return(
                <div key={role} className="ldcard" style={{borderColor:sel?r.border:"rgba(99,179,237,.1)",background:sel?r.bg:undefined}} onClick={()=>{setEm(u.email);setPw(u.password);setErr("");}}>
                  <div className="ldicon" style={{background:r.bg,border:`1px solid ${r.border}`}}><span style={{fontSize:20}}>{r.icon}</span></div>
                  <div className="ldrl" style={{color:r.color}}>{r.label}</div>
                  <div className="ldeml">{u.email}</div>
                  <div className="ldsel" style={{color:r.color,borderColor:r.border,background:sel?r.bg:"transparent"}}>{sel?"✓ Selecionado":"Acessar demo"}</div>
                </div>);
            })}
          </div>
        </div>
        <div className="lfooter">
          <div className="lfbadges">
            <div className="lfb"><Icon n="shld" s={12} c="rgba(148,163,184,.4)"/>Seguro</div>
            <div style={{width:1,height:12,background:"rgba(148,163,184,.15)"}}/>
            <div className="lfb"><Icon n="zap" s={12} c="rgba(148,163,184,.4)"/>Rápido</div>
            <div style={{width:1,height:12,background:"rgba(148,163,184,.15)"}}/>
            <div className="lfb"><Icon n="check" s={12} c="rgba(148,163,184,.4)"/>Confiável</div>
          </div>
          <div>Stone Block © 2024 — Todos os direitos reservados</div>
        </div>
      </div>
    </div></>
  );
}

// ─── LIGHTBOX ────────────────────────────────
function Lightbox({photos,i0,onClose}) {
  const [i,setI]=useState(i0);
  useEffect(()=>{const h=e=>{if(e.key==="Escape")onClose();if(e.key==="ArrowLeft")setI(x=>(x-1+photos.length)%photos.length);if(e.key==="ArrowRight")setI(x=>(x+1)%photos.length);};window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);},[]);
  return(
    <div className="lb" onClick={onClose}>
      <img src={photos[i]} alt="" onClick={e=>e.stopPropagation()}/>
      <button className="lbcl" onClick={onClose}><Icon n="x" s={18}/></button>
      {photos.length>1&&<><button className="lbnv p" onClick={e=>{e.stopPropagation();setI(x=>(x-1+photos.length)%photos.length);}}><Icon n="chevl" s={20}/></button><button className="lbnv n" onClick={e=>{e.stopPropagation();setI(x=>(x+1)%photos.length);}}><Icon n="chevr" s={20}/></button><div className="lbct">{i+1}/{photos.length}</div></>}
    </div>
  );
}

// ─── BLOCK IMG ───────────────────────────────
function BImg({photos}) {
  const [i,setI]=useState(0);
  const hasPh = photos && photos.length > 0;
  return(
    <div className="bkimg">
      {!hasPh
        ? <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,opacity:.3}}>
            <Icon n="mtn" s={44} c="#94a3b8"/>
            <span style={{fontSize:10,color:"#94a3b8",letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>Sem foto</span>
          </div>
        : <>
            <img src={photos[i]} alt="" style={{width:"100%",height:"100%",objectFit:"cover",transition:"transform .4s cubic-bezier(.16,1,.3,1)"}}/>
            <div className="bk-overlay"/>
            {photos.length>1&&<>
              <button className="tharr l" onClick={e=>{e.stopPropagation();setI(x=>(x-1+photos.length)%photos.length);}}><Icon n="chevl" s={13}/></button>
              <button className="tharr r" onClick={e=>{e.stopPropagation();setI(x=>(x+1)%photos.length);}}><Icon n="chevr" s={13}/></button>
              <div className="thnav">{photos.map((_,j)=><div key={j} className={"thdot"+(i===j?" on":"")}/>)}</div>
            </>}
          </>
      }
    </div>
  );
}

// ─── TOAST ───────────────────────────────────
let _tt;
function Toast({t,onClose}) {
  useEffect(()=>{if(!t)return;clearTimeout(_tt);_tt=setTimeout(onClose,3200);return()=>clearTimeout(_tt);},[t]);
  if(!t)return null;
  return <div className={"toast "+(t.type||"")}><Icon n={t.type==="ok"?"check":"info"} s={15}/>{t.msg}</div>;
}

// ─── BLOCK CARD ──────────────────────────────
const MAT_PALETTE = {
  "Granito":  {bg:"linear-gradient(160deg,#1e293b,#0f2044)", dot:"#60a5fa"},
  "Mármore":  {bg:"linear-gradient(160deg,#f1f5f9,#e2e8f0)", dot:"#94a3b8"},
  "Quartzito":{bg:"linear-gradient(160deg,#1c1917,#292524)", dot:"#d4a574"},
  "Travertino":{bg:"linear-gradient(160deg,#fef3c7,#fde68a)",dot:"#92400e"},
  "Basalto":  {bg:"linear-gradient(160deg,#111827,#1f2937)", dot:"#6b7280"},
  "Calcário": {bg:"linear-gradient(160deg,#f5f0e8,#ede8d8)", dot:"#a8956a"},
};
function getMatStyle(mat) {
  const key = Object.keys(MAT_PALETTE).find(k => mat?.includes(k));
  return MAT_PALETTE[key] || {bg:"linear-gradient(160deg,#1e293b,#334155)", dot:"#60a5fa"};
}

function BCard({b,quarries,clients,onView,acts}) {
  const q  = quarries.find(q=>q.id===b.quarry_id);
  const sc = SC[b.status];
  const ms = getMatStyle(b.material);
  const hasPh = b.photos && b.photos.length > 0;
  return(
    <div className="bk" onClick={()=>onView(b)}>
      {/* Image area with fallback gradient */}
      <div style={{position:"relative"}}>
        {!hasPh
          ? <div style={{height:200,background:ms.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,position:"relative",overflow:"hidden"}}>
              {/* Decorative marble veins */}
              <div style={{position:"absolute",inset:0,backgroundImage:`radial-gradient(ellipse 60% 40% at 30% 40%,${ms.dot}18 0%,transparent 70%)`,pointerEvents:"none"}}/>
              <div style={{width:52,height:52,borderRadius:14,border:`1px solid ${ms.dot}30`,background:`${ms.dot}12`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <Icon n="mtn" s={24} c={ms.dot}/>
              </div>
              <div style={{fontSize:9,color:ms.dot,opacity:.6,letterSpacing:2,textTransform:"uppercase",fontWeight:700}}>sem foto</div>
            </div>
          : <BImg photos={b.photos}/>
        }
        {/* Status badge */}
        <div className="bkst" style={{
          background:"rgba(10,15,30,.82)",
          color:"#fff",
          border:"1px solid rgba(255,255,255,.18)",
          backdropFilter:"blur(10px)",WebkitBackdropFilter:"blur(10px)",
          boxShadow:"0 2px 8px rgba(0,0,0,.3)",
        }}>{SL[b.status]}</div>
        {/* Classification badge */}
        <div style={{
          position:"absolute",bottom:10,left:12,
          background:"rgba(10,15,30,.7)",backdropFilter:"blur(8px)",
          color:"#fff",fontSize:10,fontWeight:800,
          padding:"3px 8px",borderRadius:6,letterSpacing:1,
        }}>{b.classification}</div>
      </div>

      {/* Body */}
      <div className="bkbd">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:2}}>
          <div className="bkcd">{b.code}</div>
          {b.sys_code&&<div style={{fontSize:9,fontWeight:700,letterSpacing:1,color:"var(--mist)",background:"var(--haze)",padding:"1px 6px",borderRadius:4,border:"1px solid var(--bdr2)"}}>{b.sys_code}</div>}
        </div>
        <div className="bkmt">{b.material}</div>
        <div className="bkqr"><Icon n="mtn" s={10} c="var(--mist)"/>{q?.name||"—"}</div>
        {b.status==="reserved"&&b.reserved_for&&(()=>{
          const rc=clients?.find(c=>c.id===b.reserved_for);
          return rc?(
            <div style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"var(--sap6)",fontWeight:600,marginTop:2}}>
              <Icon n="user" s={10} c="var(--sap6)"/>
              <span>Reservado para {rc.name}</span>
            </div>
          ):null;
        })()}
        <div className="bkmeta">
          <div style={{display:"flex",flexDirection:"column",gap:1}}>
            <div className="bkvol">{b.net_volume} m³ líquido</div>
            <div style={{fontSize:10,color:"var(--mist)"}}>
              {b.net_l}×{b.net_h}×{b.net_w} m
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div className="bkprice">{money(b.total_value,b.currency)}</div>
            <div style={{fontSize:10,color:"var(--mist)"}}>
              {b.currency==="USD"?"US$":"R$"} {Number(b.price_m3).toLocaleString("pt-BR")}/m³
            </div>
          </div>
        </div>
      </div>

      {acts&&<div className="bkacts" onClick={e=>e.stopPropagation()}>{acts(b)}</div>}
    </div>
  );
}

// ─── BLOCK MODAL BODY ────────────────────────
function BModalBody({b,quarries,users,currentUser,db,onClose,footer}) {
  const [lb,setLb]=useState(null);
  const q=quarries.find(q=>q.id===b.quarry_id); const cr=users.find(u=>u.id===b.created_by);
  const sc=SC[b.status]; const sym=b.currency==="USD"?"US$":"R$";
  return(<>
    <div className="mo" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="md">
        <div className="mhead">
          <div><div style={{fontSize:10,color:"var(--b6)",fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>{b.code}</div><div className="mtit">{b.material}</div></div>
          <div style={{display:"flex",alignItems:"center",gap:10}}><span className="bdg" style={{background:sc+"18",color:sc}}>{SL[b.status]}</span><button className="btn bo bic bsm" onClick={onClose}><Icon n="x" s={16}/></button></div>
        </div>
        <div className="mbody">
          {b.photos?.length>0&&<div className="ds"><div className="dstit">Fotos ({b.photos.length}) — clique para ampliar</div><div className="pgrid">{b.photos.map((p,i)=><div key={i} className="pthumb" onClick={()=>setLb(i)}><img src={p} alt=""/></div>)}</div></div>}
          <div className="ds"><div className="dstit">Informações Gerais</div><div className="dgrid">
            <div className="di"><div className="dilbl">Pedreira</div><div className="dival" style={{fontSize:13}}>{q?.name||"—"}</div></div>
            <div className="di"><div className="dilbl">Material</div><div className="dival" style={{fontSize:12}}>{b.material}</div></div>
            <div className="di"><div className="dilbl">Classificação</div><div className="dival">{b.classification}</div></div>
          </div></div>
          <div className="ds"><div className="dstit">Medidas Brutas (m)</div><div className="dgrid">
            <div className="di"><div className="dilbl">Comprimento</div><div className="dival">{b.gross_l} m</div></div>
            <div className="di"><div className="dilbl">Altura</div><div className="dival">{b.gross_h} m</div></div>
            <div className="di"><div className="dilbl">Largura</div><div className="dival">{b.gross_w} m</div></div>
          </div></div>
          <div className="ds"><div className="dstit">Medidas Líquidas (m)</div><div className="dgrid">
            <div className="di"><div className="dilbl">Comprimento</div><div className="dival">{b.net_l} m</div></div>
            <div className="di"><div className="dilbl">Altura</div><div className="dival">{b.net_h} m</div></div>
            <div className="di"><div className="dilbl">Largura</div><div className="dival">{b.net_w} m</div></div>
          </div></div>
          <div className="ds"><div className="dstit">Volumes & Valor</div><div className="dgrid">
            <div className="di"><div className="dilbl">Vol. Bruto</div><div className="dival">{b.gross_volume} m³</div></div>
            <div className="di"><div className="dilbl">Vol. Líquido</div><div className="dival">{b.net_volume} m³</div></div>
            <div className="di"><div className="dilbl">Preço/m³</div><div className="dival" style={{fontSize:13}}>{sym} {Number(b.price_m3).toLocaleString("pt-BR")}</div></div>
            <div className="di" style={{gridColumn:"span 2",background:"var(--b0)",border:"1px solid var(--b2)"}}><div className="dilbl">Valor Total</div><div className="dival" style={{fontSize:22,color:"var(--b6)"}}>{money(b.total_value,b.currency)}</div></div>
            <div className="di"><div className="dilbl">Moeda</div><div className="dival" style={{fontSize:13}}>{b.currency==="USD"?"Dólar (US$)":"Real (R$)"}</div></div>
          </div></div>
          {b.notes&&<div className="ds"><div className="dstit">Observações</div><p style={{fontSize:14,background:"var(--haze)",padding:"12px",borderRadius:8,border:"1px solid var(--bdr2)",lineHeight:1.6}}>{b.notes}</p></div>}
          {currentUser?.role!=="client" && (()=>{
            // Build timeline events
            const events=[];
            events.push({icon:"⛏",label:"Produzido",sub:`por ${cr?.name||"—"}`,date:b.created_at,color:"var(--sap6)"});
            const rels=(db?.block_releases||[]).filter(r=>r.block_id===b.id);
            rels.forEach(r=>{const cli=db?.clients?.find(c=>c.id===r.client_id);const who=db?.users?.find(u=>u.id===r.liberado_por);events.push({icon:"👁",label:`Catálogo liberado para ${cli?.name||"—"}`,sub:`por ${who?.name||"—"}`,date:r.data_liberacao,color:"var(--purp)"}); });
            if(b.reserved_for){const cli=db?.clients?.find(c=>c.id===b.reserved_for);events.push({icon:"🔒",label:`Reservado para ${cli?.name||"—"}`,date:null,color:"var(--warn)"});}
            const sale=(db?.sales||[]).find(s=>(s.block_ids||[s.block_id]).includes(b.id));
            if(sale){const cli=db?.clients?.find(c=>c.id===sale.client_id);const seller=db?.users?.find(u=>u.id===sale.seller_id);events.push({icon:"✅",label:`Vendido para ${cli?.name||"—"}`,sub:`por ${seller?.name||"—"} · ${money(b.total_value,b.currency)}`,date:sale.created_at,color:"var(--ok)"});}
            events.sort((a,z)=>new Date(a.date||0)-new Date(z.date||0));
            return events.length>0?(
              <div className="ds">
                <div className="dstit">Histórico do Bloco</div>
                <div style={{position:"relative",paddingLeft:24}}>
                  <div style={{position:"absolute",left:8,top:6,bottom:6,width:2,background:"var(--fog)",borderRadius:2}}/>
                  {events.map((e,i)=>(
                    <div key={i} style={{position:"relative",paddingBottom:14,display:"flex",gap:12}}>
                      <div style={{position:"absolute",left:-20,top:2,width:16,height:16,borderRadius:"50%",background:e.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,zIndex:1,boxShadow:"0 0 0 3px #fff"}}></div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:12,fontWeight:700,color:"var(--ink2)"}}>{e.icon} {e.label}</div>
                        {e.sub&&<div style={{fontSize:11,color:"var(--mist)",marginTop:1}}>{e.sub}</div>}
                        {e.date&&<div style={{fontSize:10,color:"var(--mist)",marginTop:1}}>{fdate(e.date)}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ):null;
          })()}
          {currentUser?.role!=="client" && (
            <div style={{fontSize:12,color:"var(--mut)",display:"flex",gap:16,flexWrap:"wrap"}}>
              <span>Por: <strong>{cr?.name||"—"}</strong></span>
              <span>Data de Produção: <strong>{fdateS(b.created_at)}</strong></span>
            </div>
          )}
        </div>
        <div className="mfoot" style={{justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
          <button className="btn bo bsm" onClick={()=>{
            const q=quarries.find(q=>q.id===b.quarry_id);
            const statusLabel={produced:"Produzido",available:"Disponível",reserved:"Reservado",sold:"Vendido"};
            const priceStr=b.currency==="USD"?"US$ "+Number(b.total_value).toLocaleString("en-US",{minimumFractionDigits:2}):"R$ "+Number(b.total_value).toLocaleString("pt-BR",{minimumFractionDigits:2});
            const priceM3=(b.currency==="USD"?"US$":"R$")+" "+Number(b.price_m3).toLocaleString("pt-BR")+"/m³";
            const win=window.open("","_blank","width=820,height=680");
            win.document.write("<!DOCTYPE html><html><head><meta charset='utf-8'><title>Ficha "+b.code+"</title><style>*{box-sizing:border-box;margin:0;padding:0;font-family:Arial,sans-serif;}body{padding:28px;background:#fff;}.hdr{background:linear-gradient(135deg,#0f172a,#1e3a8a);color:#fff;padding:20px 24px;border-radius:10px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:flex-start;}.logo{font-size:20px;font-weight:900;}.logo span{color:#60a5fa;}.code{font-size:24px;font-weight:900;margin-top:4px;}.sysid{font-size:10px;opacity:.6;margin-top:2px;}.badge{background:rgba(255,255,255,.15);padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;}.photo{width:100%;height:200px;object-fit:cover;border-radius:10px;margin-bottom:18px;}.nophoto{width:100%;height:120px;background:#f1f5f9;border-radius:10px;margin-bottom:18px;display:flex;align-items:center;justify-content:center;color:#94a3b8;border:2px dashed #cbd5e1;}.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px;}.g2{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;}.f{background:#f8fafc;border-radius:6px;padding:9px 12px;border:1px solid #e2e8f0;}.lbl{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#94a3b8;}.val{font-size:14px;font-weight:700;color:#0f172a;margin-top:2px;}.sec{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#2563eb;margin:14px 0 8px;padding-bottom:5px;border-bottom:1px solid #dbeafe;}.total{background:linear-gradient(135deg,#eff6ff,#dbeafe);border:1px solid #bfdbfe;border-radius:8px;padding:14px;margin:14px 0;display:flex;justify-content:space-between;align-items:center;}.tl{font-size:12px;font-weight:600;color:#1e3a8a;}.tv{font-size:26px;font-weight:900;color:#1d4ed8;}.notes{font-size:12px;background:#f8fafc;padding:10px 12px;border-radius:6px;border-left:3px solid #bfdbfe;line-height:1.6;color:#334155;margin-top:10px;}.foot{margin-top:20px;padding-top:12px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;font-size:10px;color:#94a3b8;}h2{font-size:18px;font-weight:800;margin-bottom:2px;}.quarry{font-size:12px;color:#64748b;margin-bottom:14px;}@media print{body{padding:14px;}}</style></head><body>");
            win.document.write("<div class='hdr'><div><div class='logo'>Stone <span>Block</span></div><div class='code'>"+b.code+"</div>"+(b.sys_code?"<div class='sysid'>"+b.sys_code+"</div>":"")+"</div><div style='text-align:right'><div class='badge'>"+(statusLabel[b.status]||b.status)+"</div><div style='font-size:12px;opacity:.7;margin-top:6px;font-weight:700'>Class. "+b.classification+"</div></div></div>");
            win.document.write(b.photos&&b.photos.length>0?"<img class='photo' src='"+b.photos[0]+"'/>":" <div class='nophoto'>Sem foto</div>");
            win.document.write("<h2>"+b.material+"</h2><div class='quarry'>📍 "+(q?.name||"—")+(q?.location?" · "+q.location:"")+"</div>");
            win.document.write("<div class='sec'>Medidas Brutas</div><div class='g3'><div class='f'><div class='lbl'>Comprimento</div><div class='val'>"+b.gross_l+" m</div></div><div class='f'><div class='lbl'>Altura</div><div class='val'>"+b.gross_h+" m</div></div><div class='f'><div class='lbl'>Largura</div><div class='val'>"+b.gross_w+" m</div></div></div><div class='f' style='margin-bottom:10px'><div class='lbl'>Volume Bruto</div><div class='val'>"+b.gross_volume+" m³</div></div>");
            win.document.write("<div class='sec'>Medidas Líquidas</div><div class='g3'><div class='f'><div class='lbl'>Comprimento</div><div class='val'>"+b.net_l+" m</div></div><div class='f'><div class='lbl'>Altura</div><div class='val'>"+b.net_h+" m</div></div><div class='f'><div class='lbl'>Largura</div><div class='val'>"+b.net_w+" m</div></div></div><div class='f' style='margin-bottom:4px'><div class='lbl'>Volume Líquido</div><div class='val'>"+b.net_volume+" m³</div></div>");
            win.document.write("<div class='total'><div><div class='tl'>Preço por m³</div><div style='font-size:13px;font-weight:600;color:#1e3a8a'>"+priceM3+"</div></div><div style='text-align:right'><div class='tl'>Valor Total</div><div class='tv'>"+priceStr+"</div></div></div>");
            if(b.notes) win.document.write("<div class='notes'>"+b.notes+"</div>");
            win.document.write("<div class='foot'><span>Stone Block — Ficha Técnica</span><span>"+b.code+(b.sys_code?" · "+b.sys_code:"")+"</span><span>"+new Date().toLocaleDateString("pt-BR")+"</span></div></body></html>");
            win.document.close();
            setTimeout(()=>{win.focus();win.print();},400);
          }}>
            <Icon n="doc" s={14}/> Ficha PDF
          </button>
          {footer&&<div style={{display:"flex",gap:8}}>{footer}</div>}
        </div>
      </div>
    </div>
    {lb!==null&&<Lightbox photos={b.photos} i0={lb} onClose={()=>setLb(null)}/>}
  </>);
}
function BModal({b,quarries,users,currentUser,db,onClose,footer}) {
  if(!b)return null;
  return <BModalBody b={b} quarries={quarries} users={users} currentUser={currentUser} db={db} onClose={onClose} footer={footer}/>;
}

// ─── EDIT BLOCK MODAL ────────────────────────
// Used by foreman (with photo upload), owner, and seller
function EditBlockModal({b, onClose, onSave}) {
  const [ef, setEf] = useState({
    gross_l:b.gross_l, gross_h:b.gross_h, gross_w:b.gross_w,
    net_l:b.net_l, net_h:b.net_h, net_w:b.net_w,
    currency:b.currency, price_m3:b.price_m3,
    photos:[...(b.photos||[])], notes:b.notes||"",
  });
  const fileRef = useRef();
  const se = (k,v) => setEf(x=>({...x,[k]:v}));
  const addPhoto = e => Array.from(e.target.files).forEach(f=>{const r=new FileReader();r.onload=ev=>setEf(x=>({...x,photos:[...x.photos,ev.target.result]}));r.readAsDataURL(f);});
  const rmPhoto = i => se("photos", ef.photos.filter((_,j)=>j!==i));

  const egv = ef.gross_l&&ef.gross_h&&ef.gross_w ? calcV(ef.gross_l,ef.gross_h,ef.gross_w) : null;
  const env = ef.net_l&&ef.net_h&&ef.net_w       ? calcV(ef.net_l,ef.net_h,ef.net_w)       : null;
  const etv = env&&ef.price_m3 ? parseFloat((env*parseFloat(ef.price_m3)).toFixed(2)) : null;

  const save = () => {
    const G=ef.gross_l&&ef.gross_h&&ef.gross_w?calcV(ef.gross_l,ef.gross_h,ef.gross_w):0;
    const N=ef.net_l&&ef.net_h&&ef.net_w?calcV(ef.net_l,ef.net_h,ef.net_w):0;
    const P=parseFloat(ef.price_m3)||0;
    onSave({
      gross_l:parseFloat(ef.gross_l)||0,gross_h:parseFloat(ef.gross_h)||0,gross_w:parseFloat(ef.gross_w)||0,
      net_l:parseFloat(ef.net_l)||0,net_h:parseFloat(ef.net_h)||0,net_w:parseFloat(ef.net_w)||0,
      gross_volume:G, net_volume:N, currency:ef.currency, price_m3:P,
      total_value:parseFloat((N*P).toFixed(2)),
      photos:[...ef.photos], notes:ef.notes,
    });
  };

  return(
    <div className="mo" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="md">
        <div className="mhead">
          <div><div style={{fontSize:10,color:"var(--b6)",fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>{b.code}</div><div className="mtit">Editar Bloco</div></div>
          <button className="btn bo bic bsm" onClick={onClose}><Icon n="x" s={16}/></button>
        </div>
        <div className="mbody">
          <div className="seclbl">Medidas Brutas (metros)</div>
          <div className="fr3">
            {[["gross_l","Compr. (m)"],["gross_h","Altura (m)"],["gross_w","Largura (m)"]].map(([k,l])=>(
              <div className="fg" key={k}><label className="fl">{l}</label><input className="fc" type="number" step="0.01" value={ef[k]||""} onChange={e=>se(k,e.target.value)} placeholder="0.00"/></div>
            ))}
          </div>
          <div className="fg"><div className="calcbox"><div className="calclbl">Volume Bruto</div><div className="calcval">{egv!=null?`${egv} m³`:"—"}</div></div></div>
          <hr className="dvd"/>
          <div className="seclbl">Medidas Líquidas (metros)</div>
          <div className="fr3">
            {[["net_l","Compr. (m)"],["net_h","Altura (m)"],["net_w","Largura (m)"]].map(([k,l])=>(
              <div className="fg" key={k}><label className="fl">{l}</label><input className="fc" type="number" step="0.01" value={ef[k]||""} onChange={e=>se(k,e.target.value)} placeholder="0.00"/></div>
            ))}
          </div>
          <div className="fg"><div className="calcbox"><div className="calclbl">Volume Líquido</div><div className="calcval">{env!=null?`${env} m³`:"—"}</div></div></div>
          <hr className="dvd"/>
          <div className="seclbl">Precificação</div>
          <div className="fr2">
            <div className="fg"><label className="fl">Moeda</label>
              <select className="fc" value={ef.currency||"BRL"} onChange={e=>se("currency",e.target.value)}>
                <option value="BRL">R$ — Real</option><option value="USD">US$ — Dólar</option>
              </select>
            </div>
            <div className="fg"><label className="fl">Preço/m³ ({ef.currency==="USD"?"US$":"R$"})</label>
              <input className="fc" type="number" step="0.01" value={ef.price_m3||""} onChange={e=>se("price_m3",e.target.value)} placeholder="0.00"/>
            </div>
          </div>
          {etv!=null&&<div className="fg"><div className="calcbox"><div className="calclbl">Valor Total</div><div className="calcval">{money(etv,ef.currency||"BRL")}</div></div></div>}
          <hr className="dvd"/>
          <div className="seclbl">Fotos</div>
          <input ref={fileRef} type="file" accept="image/*" multiple style={{display:"none"}} onChange={addPhoto}/>
          <div className="uz" onClick={()=>fileRef.current.click()}><Icon n="up" s={20}/><div style={{marginTop:6,fontSize:13,fontWeight:600}}>Adicionar mais fotos</div></div>
          {ef.photos.length>0&&(
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:10}}>
              {ef.photos.map((p,i)=>(
                <div key={i} style={{position:"relative",aspectRatio:"1",borderRadius:8,overflow:"hidden",background:"var(--g1)"}}>
                  <img src={p} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  <button onClick={()=>rmPhoto(i)} style={{position:"absolute",top:4,right:4,background:"rgba(0,0,0,.55)",border:"none",color:"#fff",borderRadius:"50%",width:22,height:22,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Icon n="x" s={12}/></button>
                </div>
              ))}
            </div>
          )}
          <div className="fg" style={{marginTop:16}}><label className="fl">Observações</label><textarea className="fc" value={ef.notes} onChange={e=>se("notes",e.target.value)}/></div>
        </div>
        <div className="mfoot">
          <button className="btn bo" onClick={onClose}>Cancelar</button>
          <button className="btn bb" onClick={save}><Icon n="check" s={15}/> Salvar Alterações</button>
        </div>
      </div>
    </div>
  );
}

// ─── REGISTER BLOCK ──────────────────────────
function Reg({currentUser,quarries,db,setDb,toast}) {
  const defaultForm = {code:"",quarry_id:currentUser.quarry_id?String(currentUser.quarry_id):"",material:"",classification:"A",gross_l:"",gross_h:"",gross_w:"",net_l:"",net_h:"",net_w:"",currency:"BRL",price_m3:"",notes:"",photos:[],prod_date:new Date().toISOString().slice(0,10)};
  const [f,setF]=useState(defaultForm);
  const fRef=useRef(f); const fileRef=useRef();
  useEffect(()=>{fRef.current=f;},[f]);
  const sv=(k,v)=>setF(x=>({...x,[k]:v}));
  const gv=f.gross_l&&f.gross_h&&f.gross_w?calcV(f.gross_l,f.gross_h,f.gross_w):null;
  const nv=f.net_l&&f.net_h&&f.net_w?calcV(f.net_l,f.net_h,f.net_w):null;
  const tv=nv&&f.price_m3?parseFloat((nv*parseFloat(f.price_m3)).toFixed(2)):null;
  const addPhoto=e=>Array.from(e.target.files).forEach(file=>{const r=new FileReader();r.onload=ev=>setF(x=>({...x,photos:[...x.photos,ev.target.result]}));r.readAsDataURL(file);});

  const save=()=>{
    const cur=fRef.current;
    if(!cur.code.trim()||!cur.material||!cur.quarry_id){toast("Preencha código, material e pedreira.","err");return;}
    const G=cur.gross_l&&cur.gross_h&&cur.gross_w?calcV(cur.gross_l,cur.gross_h,cur.gross_w):0;
    const N=cur.net_l&&cur.net_h&&cur.net_w?calcV(cur.net_l,cur.net_h,cur.net_w):0;
    const P=parseFloat(cur.price_m3)||0;
    const snap={code:cur.code.trim(),quarry_id:parseInt(cur.quarry_id,10),material:cur.material,classification:cur.classification,gross_l:parseFloat(cur.gross_l)||0,gross_h:parseFloat(cur.gross_h)||0,gross_w:parseFloat(cur.gross_w)||0,net_l:parseFloat(cur.net_l)||0,net_h:parseFloat(cur.net_h)||0,net_w:parseFloat(cur.net_w)||0,gross_volume:G,net_volume:N,currency:cur.currency,price_m3:P,total_value:parseFloat((N*P).toFixed(2)),status:"available",photos:[...cur.photos],notes:cur.notes,created_by:currentUser.id,created_at:cur.prod_date?new Date(cur.prod_date+"T12:00:00").toISOString():new Date().toISOString()};
    setDb(prev=>{const sysCode=genBlockId(prev.blocks);return({...prev,blocks:[...prev.blocks,{id:nid(prev.blocks),sys_code:sysCode,...snap}],notifications:[...prev.notifications,{id:nid(prev.notifications),user_id:1,message:`Novo bloco: ${snap.code} — ${snap.material}`,read:false,created_at:new Date().toISOString(),type:"new_block"}]})});
    setF({...defaultForm});toast("Bloco cadastrado com sucesso!","ok");
  };

  const qOpts=quarries; // todos os roles veem todas as pedreiras

  return(
    <div>
      <div className="ph"><div className="ptit">Cadastrar Bloco</div><div className="psub">Registre um novo bloco produzido na pedreira</div></div>
      <div className="card"><div className="cb">
        <div className="seclbl">Identificação</div>
        <div className="fr2">
          <div className="fg"><label className="fl">Código *</label><input className="fc" value={f.code} onChange={e=>sv("code",e.target.value)} placeholder="Ex: PN-2024-005"/></div>
          <div className="fg"><label className="fl">Pedreira *</label><select className="fc" value={f.quarry_id} onChange={e=>setF(x=>({...x,quarry_id:e.target.value,material:""}))}><option value="">Selecione...</option>{qOpts.map(q=><option key={q.id} value={String(q.id)}>{q.name}</option>)}</select></div>
        </div>
        <div className="fr2">
          <div className="fg"><label className="fl">Material *</label>
            {(()=>{
              const selQ = quarries.find(q=>String(q.id)===String(f.quarry_id));
              const matOpts = selQ?.materials?.length ? selQ.materials : [];
              return (
                <select className="fc" value={f.material} onChange={e=>sv("material",e.target.value)} disabled={!f.quarry_id}>
                  <option value="">{f.quarry_id ? "Selecione o material..." : "Selecione a pedreira primeiro"}</option>
                  {matOpts.map(m=><option key={m} value={m}>{m}</option>)}
                </select>
              );
            })()}
          </div>
          <div className="fg"><label className="fl">Classificação</label><select className="fc" value={f.classification} onChange={e=>sv("classification",e.target.value)}>{["A+","A","B","C"].map(c=><option key={c} value={c}>{c}</option>)}</select></div>
        </div>
        <hr className="dvd"/>
        <div className="seclbl">Medidas Brutas (metros)</div>
        <div className="fr3">{[["gross_l","Compr. (m)"],["gross_h","Altura (m)"],["gross_w","Largura (m)"]].map(([k,l])=><div className="fg" key={k}><label className="fl">{l}</label><input className="fc" type="number" step="0.01" value={f[k]} onChange={e=>sv(k,e.target.value)} placeholder="0.00"/></div>)}</div>
        <div className="fg"><div className="calcbox"><div className="calclbl">Volume Bruto</div><div className="calcval">{gv!=null?`${gv} m³`:"—"}</div></div></div>
        <hr className="dvd"/>
        <div className="seclbl">Medidas Líquidas (metros)</div>
        <div className="fr3">{[["net_l","Compr. (m)"],["net_h","Altura (m)"],["net_w","Largura (m)"]].map(([k,l])=><div className="fg" key={k}><label className="fl">{l}</label><input className="fc" type="number" step="0.01" value={f[k]} onChange={e=>sv(k,e.target.value)} placeholder="0.00"/></div>)}</div>
        <div className="fg"><div className="calcbox"><div className="calclbl">Volume Líquido</div><div className="calcval">{nv!=null?`${nv} m³`:"—"}</div></div></div>
        <hr className="dvd"/>
        <div className="seclbl">Precificação</div>
        <div className="fr2">
          <div className="fg"><label className="fl">Moeda</label><select className="fc" value={f.currency} onChange={e=>sv("currency",e.target.value)}><option value="BRL">R$ — Real</option><option value="USD">US$ — Dólar</option></select></div>
          <div className="fg"><label className="fl">Preço/m³ ({f.currency==="USD"?"US$":"R$"})</label><input className="fc" type="number" step="0.01" value={f.price_m3} onChange={e=>sv("price_m3",e.target.value)} placeholder={f.currency==="USD"?"200.00":"850.00"}/></div>
        </div>
        {tv!=null&&<div className="fg"><div className="calcbox"><div className="calclbl">Valor Total</div><div className="calcval">{money(tv,f.currency)}</div></div></div>}
        <hr className="dvd"/>
        <div className="fg">
          <label className="fl">Data de Produção</label>
          <input className="fc" type="date" value={f.prod_date||""} onChange={e=>sv("prod_date",e.target.value)} max={new Date().toISOString().slice(0,10)}/>
        </div>
        <hr className="dvd"/>
        <div className="seclbl">Fotos</div>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{display:"none"}} onChange={addPhoto}/>
        <div className="uz" onClick={()=>fileRef.current.click()}><Icon n="up" s={22}/><div style={{marginTop:8,fontSize:13,fontWeight:600}}>Clique para adicionar fotos</div></div>
        {f.photos.length>0&&<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:10}}>{f.photos.map((p,i)=><div key={i} style={{position:"relative",aspectRatio:"1",borderRadius:8,overflow:"hidden",background:"var(--g1)"}}><img src={p} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/><button onClick={()=>sv("photos",f.photos.filter((_,j)=>j!==i))} style={{position:"absolute",top:4,right:4,background:"rgba(0,0,0,.55)",border:"none",color:"#fff",borderRadius:"50%",width:22,height:22,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Icon n="x" s={12}/></button></div>)}</div>}
        <div className="fg" style={{marginTop:16}}><label className="fl">Observações</label><textarea className="fc" value={f.notes} onChange={e=>sv("notes",e.target.value)} placeholder="Características especiais..."/></div>
        <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:8}}>
          <button className="btn bo" onClick={()=>setF({...defaultForm})}>Limpar</button>
          <button className="btn bb" onClick={save}><Icon n="plus" s={15}/> Cadastrar Bloco</button>
        </div>
      </div></div>
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────
function Dash({quarries,db}) {
  const {blocks,orders,sales}=db;
  const total=blocks.length,avail=blocks.filter(b=>b.status==="available").length,sold=blocks.filter(b=>b.status==="sold").length,pend=orders.filter(o=>o.status==="pending").length;
  const tBRL=blocks.filter(b=>b.currency==="BRL").reduce((a,b)=>a+(b.total_value||0),0);
  const tUSD=blocks.filter(b=>b.currency==="USD").reduce((a,b)=>a+(b.total_value||0),0);
  const recent=[...blocks].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).slice(0,6);
  return(
    <div>
      <div className="ph"><div className="ptit">Dashboard</div><div className="psub">Visão geral do estoque</div></div>
      {/* Stale blocks alert */}
      {(()=>{
        const DAYS=30;
        const stale=blocks.filter(b=>{
          if(b.status!=="available") return false;
          const d=new Date(b.created_at);
          return (Date.now()-d.getTime())/(1000*60*60*24)>DAYS;
        });
        if(!stale.length) return null;
        return(
          <div style={{background:"linear-gradient(135deg,#fffbeb,#fef3c7)",border:"1px solid #fde68a",borderRadius:"var(--r-md)",padding:"14px 18px",marginBottom:18,display:"flex",alignItems:"center",gap:14}}>
            <div style={{fontSize:24,flexShrink:0}}>⚠️</div>
            <div>
              <div style={{fontWeight:700,fontSize:14,color:"#92400e"}}>
                {stale.length} bloco{stale.length>1?"s":""}  disponível{stale.length>1?"is":""} há mais de {DAYS} dias sem movimento
              </div>
              <div style={{fontSize:12,color:"#b45309",marginTop:3}}>
                {stale.slice(0,4).map(b=>b.code).join(", ")}{stale.length>4?` e mais ${stale.length-4}...`:""}
              </div>
            </div>
          </div>
        );
      })()}

      <div className="sg">
        {[
          {l:"Total de Blocos",v:total,  i:"cube", c:"#2563eb",bg:"#dbeafe",acc:"#2563eb"},
          {l:"Disponíveis",    v:avail,  i:"check",c:"#059669",bg:"#dcfce7",acc:"#10b981"},
          {l:"Vendidos",       v:sold,   i:"cart", c:"#dc2626",bg:"#fee2e2",acc:"#ef4444"},
          {l:"Pedidos",        v:pend,   i:"bell", c:"#d97706",bg:"#fef3c7",acc:"#f59e0b"},
        ].map(s=>(
          <div key={s.l} className="sc" style={{"--sc-accent":s.acc,"--sc-bg":s.bg}}>
            <div className="sico" style={{background:s.bg}}><Icon n={s.i} s={20} c={s.c}/></div>
            <div className="sval">{s.v}</div>
            <div className="slbl2">{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
        <div className="card"><div className="chead"><div className="ctit">Estoque R$</div></div><div className="cb"><div style={{fontFamily:"Sora",fontSize:26,fontWeight:800,color:"var(--b6)"}}>{money(tBRL,"BRL")}</div></div></div>
        <div className="card"><div className="chead"><div className="ctit">Estoque US$</div></div><div className="cb"><div style={{fontFamily:"Sora",fontSize:26,fontWeight:800,color:"var(--b6)"}}>{money(tUSD,"USD")}</div></div></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
        <div className="card"><div className="chead"><div className="ctit">Status</div></div><div className="cb">
          {Object.entries(SL).map(([k,l])=>{const cnt=blocks.filter(b=>b.status===k).length;const pct=total>0?Math.round((cnt/total)*100):0;return(<div key={k} style={{marginBottom:11}}><div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4}}><span>{l}</span><span style={{fontWeight:700,color:SC[k]}}>{cnt}</span></div><div style={{height:5,background:"var(--g2)",borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:SC[k],borderRadius:4}}/></div></div>);})}
        </div></div>
        <div className="card"><div className="chead"><div className="ctit">Por Pedreira</div></div><div className="cb">
          {quarries.map(q=>{const cnt=blocks.filter(b=>b.quarry_id===q.id).length;const pct=total>0?Math.round((cnt/total)*100):0;return(<div key={q.id} style={{marginBottom:14}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:13,marginBottom:4}}><div><div style={{fontWeight:600}}>{q.name}</div><div style={{fontSize:11,color:"var(--mist)"}}>{q.location}</div></div><span style={{fontFamily:"Sora,sans-serif",fontWeight:800,fontSize:18}}>{cnt}</span></div><div style={{height:5,background:"var(--fog)",borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:"var(--sap5)",borderRadius:4}}/></div></div>);})}
        </div></div>

        {/* ── Clients by country ── */}
        <div className="card"><div className="chead"><div className="ctit">Clientes por País</div></div><div className="cb">
          {(()=>{
            const flags={"Brasil":"🇧🇷","Estados Unidos":"🇺🇸","Itália":"🇮🇹","Emirados Árabes":"🇦🇪","China":"🇨🇳","Portugal":"🇵🇹","França":"🇫🇷","Alemanha":"🇩🇪","Espanha":"🇪🇸","Argentina":"🇦🇷"};
            const byCountry={};
            db.clients.forEach(c=>{const co=c.country||"Outro";byCountry[co]=(byCountry[co]||0)+1;});
            const countries=Object.entries(byCountry).sort((a,b)=>b[1]-a[1]);
            const maxC=Math.max(...countries.map(([,v])=>v),1);
            if(!countries.length) return <div style={{fontSize:13,color:"var(--mist)",textAlign:"center",padding:16}}>Nenhum cliente cadastrado</div>;
            return countries.map(([country,cnt])=>(
              <div key={country} style={{marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:13,marginBottom:4}}>
                  <span>{flags[country]||"🌍"} {country}</span>
                  <span style={{fontFamily:"Sora,sans-serif",fontWeight:800,fontSize:16}}>{cnt}</span>
                </div>
                <div style={{height:5,background:"var(--fog)",borderRadius:4,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${Math.round((cnt/maxC)*100)}%`,background:"linear-gradient(to right,var(--sap6),var(--sap4))",borderRadius:4}}/>
                </div>
              </div>
            ));
          })()}
        </div></div>
      </div>
      {/* ── Month comparison ── */}
      {(()=>{
        const now  = new Date();
        const thisM= now.getMonth(), thisY = now.getFullYear();
        const prevM= thisM===0?11:thisM-1, prevY = thisM===0?thisY-1:thisY;
        const inMonth=(b,m,y)=>{const d=new Date(b.created_at);return d.getMonth()===m&&d.getFullYear()===y;};
        const inSaleMonth=(s,m,y)=>{const d=new Date(s.created_at);return d.getMonth()===m&&d.getFullYear()===y;};
        const meses=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
        const stats=(m,y)=>({
          blocos:  blocks.filter(b=>inMonth(b,m,y)).length,
          vendas:  db.sales.filter(s=>inSaleMonth(s,m,y)).length,
          brl:     db.sales.filter(s=>inSaleMonth(s,m,y)).reduce((a,s)=>a+(s.total_brl||0),0),
        });
        const cur=stats(thisM,thisY), prv=stats(prevM,prevY);
        const pct=(a,b)=>b===0?null:Math.round(((a-b)/b)*100);
        const badge=(a,b)=>{const p=pct(a,b);if(p===null)return null;const up=p>=0;return(<span style={{fontSize:10,fontWeight:700,padding:"2px 6px",borderRadius:10,background:up?"#dcfce7":"#fee2e2",color:up?"#15803d":"#dc2626",marginLeft:6}}>{up?"+":""}{p}%</span>);};
        return(
          <div className="card" style={{marginBottom:20}}>
            <div className="chead"><div className="ctit">Comparativo — {meses[thisM]}/{thisY} vs {meses[prevM]}/{prevY}</div></div>
            <div className="cb">
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
                {[
                  {l:"Blocos Produzidos",ca:cur.blocos,cb:prv.blocos,i:"cube",c:"#2563eb",bg:"#dbeafe"},
                  {l:"Vendas",ca:cur.vendas,cb:prv.vendas,i:"cart",c:"#059669",bg:"#dcfce7"},
                  {l:"Faturamento R$",ca:cur.brl,cb:prv.brl,i:"trend",c:"#d97706",bg:"#fef3c7",isMoney:true},
                ].map(({l,ca,cb,i,c,bg,isMoney})=>(
                  <div key={l} style={{background:bg,borderRadius:"var(--r-md)",padding:"14px",border:"1px solid",borderColor:bg}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                      <div style={{width:28,height:28,borderRadius:8,background:"rgba(255,255,255,.6)",display:"flex",alignItems:"center",justifyContent:"center"}}><Icon n={i} s={14} c={c}/></div>
                      <div style={{fontSize:10,fontWeight:700,color:c,textTransform:"uppercase",letterSpacing:.5}}>{l}</div>
                    </div>
                    <div style={{fontFamily:"Sora,sans-serif",fontWeight:800,fontSize:isMoney?16:22,color:"#0f172a"}}>{isMoney?money(ca,"BRL"):ca}</div>
                    <div style={{fontSize:11,color:"#64748b",marginTop:3,display:"flex",alignItems:"center"}}>vs {isMoney?money(cb,"BRL"):cb} mês ant.{badge(ca,cb)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      <div className="card"><div className="chead"><div className="ctit">Últimos Cadastrados</div></div>
        {recent.length===0?<div style={{padding:32,textAlign:"center",color:"var(--mut)",fontSize:14}}>Nenhum bloco ainda.</div>
        :<div className="tw"><table><thead><tr><th>Código</th><th>Material</th><th>Pedreira</th><th>Vol.</th><th>Moeda</th><th>Valor</th><th>Status</th></tr></thead>
          <tbody>{recent.map(b=>{const q=quarries.find(q=>q.id===b.quarry_id);const sc=SC[b.status];return(<tr key={b.id}><td style={{fontWeight:700,color:"var(--b6)",fontSize:12}}>{b.code}</td><td>{b.material}</td><td style={{fontSize:12,color:"var(--mut)"}}>{q?.name}</td><td>{b.net_volume} m³</td><td><span className="ctag">{b.currency==="USD"?"US$":"R$"}</span></td><td style={{fontWeight:700}}>{money(b.total_value,b.currency)}</td><td><span className="bdg" style={{background:SC[b.status]+"18",color:SC[b.status]}}>{SL[b.status]}</span></td></tr>);})}</tbody>
        </table></div>}
      </div>
    </div>
  );
}

// ─── SALE MODAL (with romaneio) ───────────────
function SaleModal({selectedBlocks, db, setDb, currentUser, onClose, toast, globalDollarRate}) {
  // selectedBlocks: array of block objects to sell
  const [clientId,    setClientId]    = useState("");
  const [payId,       setPayId]       = useState("");
  const [dollarRate,  setDollarRate]  = useState("");
  const [obs,         setObs]         = useState("");
  const [loadingRate, setLoadingRate] = useState(false);
  const [step,        setStep]        = useState(1); // 1=form, 2=romaneio
  const [saleData,    setSaleData]    = useState(null);

  const fetchDollar = async () => {
    setLoadingRate(true);
    const attempts = [
      { url: "https://api.allorigins.win/get?url=" + encodeURIComponent("https://economia.awesomeapi.com.br/json/last/USD-BRL"),
        parse: d => JSON.parse(d.contents).USDBRL.bid },
      { url: "https://corsproxy.io/?url=" + encodeURIComponent("https://economia.awesomeapi.com.br/json/last/USD-BRL"),
        parse: d => d.USDBRL.bid },
      { url: "https://fxapi.app/api/latest?base=USD&symbols=BRL",
        parse: d => d.rates.BRL },
      { url: "https://api.frankfurter.dev/v2/latest?base=USD&symbols=BRL",
        parse: d => d.rates.BRL },
    ];
    for (const {url, parse} of attempts) {
      try {
        const res = await fetch(url, {signal: AbortSignal.timeout(5000)});
        if (!res.ok) continue;
        const data = await res.json();
        const val  = parse(data);
        if (val && !isNaN(parseFloat(val))) {
          const rate = parseFloat(val).toFixed(2);
          setDollarRate(rate);
          toast(`Cotação USD: R$ ${rate}`, "ok");
          setLoadingRate(false);
          return;
        }
      } catch { continue; }
    }
    toast("Não foi possível buscar. Informe manualmente.", "err");
    setLoadingRate(false);
  };

  const client  = db.clients.find(c => c.id === parseInt(clientId));
  const payMeth = db.payment_methods.find(p => p.id === parseInt(payId));
  const dr      = parseFloat(dollarRate) || 0;
  const hasUSD  = selectedBlocks.some(b => b.currency === "USD");

  // Per-block totals in BRL
  const blockTotals = selectedBlocks.map(b => {
    const totalUSD = b.total_value;
    const totalBRL = b.currency === "USD" && dr > 0 ? parseFloat((totalUSD * dr).toFixed(2)) : (b.currency === "BRL" ? totalUSD : 0);
    return { ...b, totalBRL };
  });
  const grandTotalVol = selectedBlocks.reduce((a,b) => a + (b.net_volume||0), 0).toFixed(4);
  const grandTotalBRL = blockTotals.reduce((a,b) => a + b.totalBRL, 0);

  // material label (first block, or "Variado")
  const matLabel = [...new Set(selectedBlocks.map(b=>b.material))].join(" / ");

  const confirmSale = () => {
    if (!clientId)    { toast("Selecione um cliente.", "err"); return; }
    if (!payId)       { toast("Selecione a forma de pagamento.", "err"); return; }
    if (hasUSD && !dollarRate) { toast("Informe a cotação do dólar.", "err"); return; }
    const now = new Date().toISOString();
    const sd = {
      id: nid(db.sales),
      block_ids: selectedBlocks.map(b => b.id),
      seller_id: currentUser.id,
      client_id: parseInt(clientId),
      payment_method_id: parseInt(payId),
      dollar_rate: dr || null,
      total_brl: grandTotalBRL,
      total_usd: selectedBlocks.filter(b=>b.currency==="USD").reduce((a,b)=>a+b.total_value,0),
      obs,
      created_at: now,
    };
    setDb(prev => ({
      ...prev,
      blocks: prev.blocks.map(x => selectedBlocks.find(b=>b.id===x.id) ? {...x, status:"sold"} : x),
      sales:  [...prev.sales, sd],
      notifications: [...prev.notifications, {
        id: nid(prev.notifications), user_id: 1,
        message: `Venda #${String(sd.id).padStart(4,"0")} — ${selectedBlocks.length} bloco(s) — ${client?.name||""}`,
        read: false, created_at: now, type: "sale",
      }],
    }));
    setSaleData(sd);
    setStep(2);
    toast("Venda registrada com sucesso!", "ok");
  };

  const sendWhatsApp = () => {
    const phone = client?.phone?.replace(/\D/g,"") || "";
    const txt   = buildRomaneioText(selectedBlocks, client, payMeth, saleData, dr, blockTotals, grandTotalVol, grandTotalBRL, matLabel);
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(txt)}`, "_blank");
  };

  const printRomaneio = () => {
    if (!romPrintRef.current) return;
    // Open a clean print window with just the romaneio
    const win = window.open("","_blank","width=900,height=700");
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Romaneio #${saleData?.id||""}</title>
    <style>
      *{box-sizing:border-box;margin:0;padding:0;font-family:Arial,sans-serif;}
      body{padding:20px;background:#fff;}
      @media print{body{padding:10px;}}
    </style></head><body>`);
    win.document.write(romPrintRef.current.innerHTML);
    win.document.write(`</body></html>`);
    win.document.close();
    setTimeout(() => { win.focus(); win.print(); }, 400);
  };
  const romPrintRef = useRef(null);

  return (
    <div className="mo" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="md md-wide">
        <div className="mhead">
          <div><div style={{fontSize:10,color:"var(--b6)",fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>{selectedBlocks.length} bloco(s) selecionado(s)</div><div className="mtit">{step===1?"Registrar Venda":"Romaneio de Venda"}</div></div>
          <button className="btn bo bic bsm" onClick={onClose}><Icon n="x" s={16}/></button>
        </div>
        <div className="mbody">
          {step===1 ? (
            <>
              {/* Block summary */}
              <div style={{background:"var(--b0)",border:"1px solid var(--b2)",borderRadius:10,padding:"12px 16px",marginBottom:20}}>
                <div style={{fontSize:12,fontWeight:700,color:"var(--b6)",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Blocos da Venda</div>
                {selectedBlocks.map(b=>(
                  <div key={b.id} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"4px 0",borderBottom:"1px solid var(--b2)"}}>
                    <span><strong>{b.code}</strong> — {b.material} — {b.classification}</span>
                    <span style={{fontWeight:700,color:"var(--b6)"}}>{b.net_volume} m³ | {money(b.total_value,b.currency)}</span>
                  </div>
                ))}
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginTop:8,fontWeight:700}}>
                  <span>Total: {grandTotalVol} m³</span>
                </div>
              </div>

              <div className="fr2">
                <div className="fg"><label className="fl">Cliente *</label>
                  <select className="fc" value={clientId} onChange={e=>setClientId(e.target.value)}>
                    <option value="">Selecione o cliente...</option>
                    {db.clients.map(c=><option key={c.id} value={c.id}>{c.name} — {c.country}</option>)}
                  </select>
                </div>
                <div className="fg"><label className="fl">Forma de Pagamento *</label>
                  <select className="fc" value={payId} onChange={e=>setPayId(e.target.value)}>
                    <option value="">Selecione...</option>
                    {db.payment_methods.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="fg">
                <label className="fl">Cotação do Dólar — R$ / US$ {!hasUSD && <span style={{fontWeight:400,textTransform:"none",letterSpacing:0}}>(opcional)</span>}</label>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <input className="fc" type="number" step="0.01" value={dollarRate} onChange={e=>setDollarRate(e.target.value)} placeholder="Ex: 5.85" style={{flex:1}}/>
                  <button className="btn bb bsm" onClick={fetchDollar} disabled={loadingRate} style={{flexShrink:0}}>
                    <Icon n="globe" s={14}/>{loadingRate?"Buscando...":"Cotação Atual (BCB)"}
                  </button>
                </div>
                {dollarRate&&hasUSD&&<div style={{marginTop:6,fontSize:13,color:"var(--grn)",fontWeight:600}}>Total em R$: {money(grandTotalBRL,"BRL")}</div>}
              </div>

              <div className="fg">
                <label className="fl">Observações</label>
                <textarea className="fc" value={obs} onChange={e=>setObs(e.target.value)} placeholder="Ex: FORMA DE PAGAMENTO: 30/60/90 DIAS" style={{minHeight:60}}/>
              </div>
            </>
          ) : (
            <div ref={romPrintRef}><Romaneio blocks={selectedBlocks} blockTotals={blockTotals} client={client} payMeth={payMeth} saleData={saleData} dr={dr} grandTotalVol={grandTotalVol} grandTotalBRL={grandTotalBRL} matLabel={matLabel} obs={obs} seller={db.users.find(u=>u.id===currentUser.id)}/></div>
          )}
        </div>
        <div className="mfoot">
          {step===1
            ? <><button className="btn bo" onClick={onClose}>Cancelar</button><button className="btn bg" onClick={confirmSale}><Icon n="check" s={15}/> Confirmar Venda</button></>
            : <>
                <button className="btn bo" onClick={onClose}>Fechar</button>
                <button className="btn bb" onClick={()=>printRomaneio()}><Icon n="doc" s={15}/> Baixar PDF</button>
                <button className="btn bwa" onClick={sendWhatsApp}><Icon n="wa" s={15}/> WhatsApp (texto)</button>
              </>
          }
        </div>
      </div>
    </div>
  );
}

// ─── ROMANEIO TEXT (WhatsApp) ─────────────────
function buildRomaneioText(blocks, client, payMeth, sale, dr, blockTotals, grandTotalVol, grandTotalBRL, matLabel) {
  const pad = (s, w) => String(s).padEnd(w);
  const lines = [
    "🪨 *STONE BLOCK — ROMANEIO DE VENDA*",
    `Nº #${String(sale.id).padStart(4,"0")}  |  Data: ${fdateS(sale.created_at)}`,
    "",
    `*Cliente:* ${client?.name||"—"}`,
    `*Data:* ${fdateS(sale.created_at)}`,
    `*Material:* ${matLabel}`,
    dr > 0 ? `*Dólar:* R$ ${Number(dr).toFixed(2)}` : "",
    "",
    "*ROMANEIO DE VENDA*",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    `${pad("Cód.",8)} ${pad("Tipo",5)} ${pad("Comp.",7)} ${pad("Alt.",6)} ${pad("Larg.",6)} ${pad("Total",7)} ${pad("US$/m³",9)} ${pad("R$/m³",10)} ${pad("Total R$",12)} Class.`,
    "──────────────────────────────────────────",
  ];

  blockTotals.forEach(b => {
    const priceRS = b.currency==="USD"&&dr>0 ? (b.price_m3*dr).toFixed(2) : (b.currency==="BRL"?b.price_m3.toFixed(2):"—");
    const priceUS = b.currency==="USD" ? b.price_m3.toFixed(2) : "—";
    const totRS   = b.totalBRL > 0 ? b.totalBRL.toLocaleString("pt-BR",{minimumFractionDigits:2}) : "—";
    lines.push(`${pad(b.code,8)} ${pad(b.classification,5)} ${pad(b.net_l,7)} ${pad(b.net_h,6)} ${pad(b.net_w,6)} ${pad(b.net_volume,7)} ${pad(priceUS,9)} ${pad(priceRS,10)} R$ ${pad(totRS,11)} ${b.classification}`);
  });

  lines.push("──────────────────────────────────────────");
  lines.push(`${pad("Total M³ Líquido:",25)} ${grandTotalVol}`);
  if(grandTotalBRL>0) lines.push(`${pad("Total R$:",25)} R$ ${grandTotalBRL.toLocaleString("pt-BR",{minimumFractionDigits:2})}`);
  lines.push("");
  if(payMeth||sale.obs) {
    lines.push("*Observações:*");
    if(sale.obs) lines.push(sale.obs);
    if(payMeth)  lines.push(`FORMA DE PAGAMENTO: ${payMeth.name} — ${payMeth.details}`);
  }
  lines.push("","━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━","_Stone Block — Gestão de Rochas Ornamentais_");
  return lines.filter(l=>l!==undefined).join("\n");
}

// ─── ROMANEIO VISUAL ─────────────────────────
function Romaneio({blocks, blockTotals, client, payMeth, saleData, dr, grandTotalVol, grandTotalBRL, matLabel, obs, seller}) {
  const thStyle = {padding:"7px 8px",background:"#1d4ed8",color:"#fff",fontSize:11,fontWeight:700,textAlign:"center",border:"1px solid #1e40af",whiteSpace:"nowrap"};
  const tdStyle = {padding:"6px 8px",fontSize:12,border:"1px solid #e2e8f0",textAlign:"center"};
  const tdL     = {...tdStyle, textAlign:"left"};

  return (
    <div className="romaneio" style={{fontFamily:"Arial,sans-serif"}}>
      {/* Header info box */}
      <div style={{border:"1px solid #bfdbfe",borderBottom:"none"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <tbody>
            <tr><td style={{padding:"6px 10px",fontWeight:400,width:80,border:"1px solid #bfdbfe"}}>Cliente:</td><td style={{padding:"6px 10px",fontWeight:700,border:"1px solid #bfdbfe"}}>{client?.name||"—"}</td><td style={{padding:"6px 10px",width:60,border:"1px solid #bfdbfe"}}>Data:</td><td style={{padding:"6px 10px",fontWeight:700,border:"1px solid #bfdbfe"}}>{fdateS(saleData.created_at)}</td></tr>
            <tr><td style={{padding:"6px 10px",border:"1px solid #bfdbfe"}}>Material:</td><td colSpan={3} style={{padding:"6px 10px",fontWeight:700,border:"1px solid #bfdbfe"}}>{matLabel}</td></tr>
            <tr><td style={{padding:"6px 10px",border:"1px solid #bfdbfe"}}>Dolar:</td><td style={{padding:"6px 10px",fontWeight:700,textAlign:"center",border:"1px solid #bfdbfe"}}>{dr>0?Number(dr).toFixed(2):"—"}</td><td colSpan={2} style={{padding:"6px 10px",border:"1px solid #bfdbfe"}}></td></tr>
          </tbody>
        </table>
      </div>

      {/* Title */}
      <div style={{background:"#1d4ed8",color:"#fff",textAlign:"center",padding:"8px",fontWeight:700,fontSize:15,letterSpacing:1}}>
        Romaneio de Venda
      </div>

      {/* Table */}
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",marginTop:1}}>
          <thead>
            <tr>
              <th style={{...thStyle,background:"#f1f5f9",color:"#374151"}}></th>
              <th colSpan={3} style={{...thStyle,background:"#e2e8f0",color:"#374151",fontSize:11}}>Medidas Líquidas</th>
              <th style={thStyle}></th><th style={thStyle}></th><th style={thStyle}></th><th style={thStyle}></th><th style={thStyle}></th>
            </tr>
            <tr>
              <th style={thStyle}>Código</th>
              <th style={thStyle}>Tipo</th>
              <th style={thStyle}>Comp.</th>
              <th style={thStyle}>Alt.</th>
              <th style={thStyle}>Larg.</th>
              <th style={thStyle}>Total</th>
              <th style={thStyle}>Vr M³ U$</th>
              <th style={thStyle}>Valor M³ R$</th>
              <th style={thStyle}>Total</th>
              <th style={thStyle}>Class.</th>
            </tr>
          </thead>
          <tbody>
            {blockTotals.map(b => {
              const priceRS = b.currency==="USD"&&dr>0 ? (b.price_m3*dr) : (b.currency==="BRL"?b.price_m3:null);
              const priceUS = b.currency==="USD" ? b.price_m3 : null;
              return (
                <tr key={b.id}>
                  <td style={tdL}>{b.code}</td>
                  <td style={tdStyle}>{b.classification}</td>
                  <td style={tdStyle}>{Number(b.net_l).toFixed(2)}</td>
                  <td style={tdStyle}>{Number(b.net_h).toFixed(2)}</td>
                  <td style={tdStyle}>{Number(b.net_w).toFixed(2)}</td>
                  <td style={{...tdStyle,fontWeight:600}}>{Number(b.net_volume).toFixed(3)}</td>
                  <td style={tdStyle}>{priceUS!=null?priceUS.toLocaleString("pt-BR",{minimumFractionDigits:2}):"—"}</td>
                  <td style={tdStyle}>{priceRS!=null?priceRS.toLocaleString("pt-BR",{minimumFractionDigits:2}):"—"}</td>
                  <td style={{...tdStyle,fontWeight:700}}>
                    {b.totalBRL>0?<span>R$ {b.totalBRL.toLocaleString("pt-BR",{minimumFractionDigits:2})}</span>:"—"}
                  </td>
                  <td style={{...tdStyle,fontWeight:700,color:"#1d4ed8"}}>{b.classification}</td>
                </tr>
              );
            })}
            {/* Empty rows for visual */}
            {Array.from({length:Math.max(0,5-blockTotals.length)}).map((_,i)=>(
              <tr key={"empty"+i}>{Array.from({length:10}).map((_,j)=><td key={j} style={{...tdStyle,height:24}}></td>)}</tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{background:"#f8fafc"}}>
              <td colSpan={3} style={{...tdStyle,fontWeight:700,textAlign:"right"}}>Total M³ Líquido</td>
              <td colSpan={2} style={{...tdStyle,fontWeight:800,fontSize:13,color:"#1d4ed8"}}>{Number(grandTotalVol).toFixed(3)}</td>
              <td style={tdStyle}></td>
              <td colSpan={2} style={{...tdStyle,fontWeight:700,textAlign:"right"}}>Total:</td>
              <td style={{...tdStyle,fontWeight:800,fontSize:13,color:"#1d4ed8"}}>R$ {grandTotalBRL.toLocaleString("pt-BR",{minimumFractionDigits:2})}</td>
              <td style={tdStyle}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Footer */}
      <div style={{border:"1px solid #e2e8f0",borderTop:"none",padding:"14px 16px"}}>
        <div style={{fontWeight:700,fontSize:13,marginBottom:6}}>Observações:</div>
        {obs&&<div style={{fontSize:12,fontStyle:"italic",marginBottom:4}}>{obs}</div>}
        {payMeth&&<div style={{fontSize:12,fontWeight:700,fontStyle:"italic"}}>FORMA DE PAGAMENTO: {payMeth.name}{payMeth.details?` — ${payMeth.details}`:""}</div>}
        <div style={{marginTop:12,paddingTop:10,borderTop:"1px solid #e2e8f0",display:"flex",justifyContent:"space-between",fontSize:11,color:"var(--mut)"}}>
          <span>Vendedor: {seller?.name||"—"}</span>
          <span>Stone Block © {new Date().getFullYear()}</span>
          <span>Nº #{String(saleData.id).padStart(4,"0")}</span>
        </div>
      </div>
    </div>
  );
}


// ─── RESERVE MODAL ───────────────────────────
function ReserveModal({b, db, setDb, toast, onClose}) {
  const [clientId, setClientId] = useState("");

  const confirm = () => {
    if (!clientId) { toast("Selecione um cliente.", "err"); return; }
    setDb(prev => ({
      ...prev,
      blocks: prev.blocks.map(x => x.id===b.id ? {...x, status:"reserved", reserved_for: parseInt(clientId)} : x),
      notifications: [...prev.notifications, {
        id: nid(prev.notifications), user_id: 1,
        message: `Bloco ${b.code} reservado para ${db.clients.find(c=>c.id===parseInt(clientId))?.name}`,
        read: false, created_at: new Date().toISOString(), type: "info",
      }],
    }));
    toast(`Bloco ${b.code} reservado!`, "ok");
    onClose();
  };

  const client = db.clients.find(c => c.id === parseInt(clientId));

  return (
    <div className="mo" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="md" style={{maxWidth:480}}>
        <div className="mhead">
          <div>
            <div style={{fontSize:10,color:"var(--sap6)",fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>{b.code}</div>
            <div className="mtit">Reservar Bloco</div>
          </div>
          <button className="btn bo bic bsm" onClick={onClose}><Icon n="x" s={16}/></button>
        </div>
        <div className="mbody">
          {/* Block summary */}
          <div style={{background:"var(--haze)",border:"1px solid var(--bdr)",borderRadius:"var(--r-md)",padding:"14px 16px",marginBottom:20,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
            <div>
              <div style={{fontWeight:700,fontSize:14,color:"var(--ink2)"}}>{b.material}</div>
              <div style={{fontSize:12,color:"var(--mist)",marginTop:2}}>{b.net_volume} m³ líquido · {b.net_l}×{b.net_h}×{b.net_w} m</div>
            </div>
            <div style={{fontFamily:"Sora,sans-serif",fontWeight:800,fontSize:18,color:"var(--sap7)"}}>{money(b.total_value,b.currency)}</div>
          </div>

          <div className="fg">
            <label className="fl">Para qual cliente está sendo reservado? *</label>
            <select className="fc" value={clientId} onChange={e=>setClientId(e.target.value)}>
              <option value="">Selecione o cliente...</option>
              {db.clients.map(c=>(
                <option key={c.id} value={c.id}>{c.name} — {c.country}</option>
              ))}
            </select>
          </div>

          {clientId && client && (
            <div style={{background:"var(--sap0)",border:"1px solid var(--sap2)",borderRadius:"var(--r-sm)",padding:"12px 16px",display:"flex",gap:12,alignItems:"center"}}>
              <div style={{width:38,height:38,borderRadius:10,background:"var(--sap7)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13,flexShrink:0}}>
                {client.name.split(" ").map(w=>w[0]).slice(0,2).join("")}
              </div>
              <div>
                <div style={{fontWeight:700,fontSize:14,color:"var(--sap8)"}}>{client.name}</div>
                <div style={{fontSize:12,color:"var(--mist)",marginTop:1}}>{client.country} {client.phone&&`· ${client.phone}`}</div>
              </div>
            </div>
          )}

          {db.clients.length === 0 && (
            <div style={{background:"#fff7ed",border:"1px solid #fed7aa",borderRadius:"var(--r-sm)",padding:"12px 16px",fontSize:13,color:"#92400e"}}>
              ⚠️ Nenhum cliente cadastrado. Acesse <strong>Clientes</strong> para cadastrar antes de reservar.
            </div>
          )}
        </div>
        <div className="mfoot">
          <button className="btn bo" onClick={onClose}>Cancelar</button>
          <button className="btn bb" onClick={confirm} disabled={!clientId}>
            <Icon n="check" s={15}/> Confirmar Reserva
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── BLOCKS LIST ─────────────────────────────
function BList({currentUser, quarries, db, setDb, toast, title, sub, bFilter, globalDollarRate}) {
  const [srch,    setSrch]    = useState("");
  const [fMat,    setFMat]    = useState("");
  const [fSt,     setFSt]     = useState("");
  const [dtInicio,setDtInicio]= useState("");
  const [dtFim,   setDtFim]   = useState("");
  const [sel,     setSel]     = useState(null);
  const [editBlk, setEditBlk] = useState(null);
  const [saleBlks,setSaleBlks]= useState(null);
  const [reserveBlk,setReserveBlk] = useState(null); // block to reserve
  const [selectedIds, setSelectedIds] = useState([]); // multi-select for sale
  const [confirmDel,  setConfirmDel]  = useState(null);

  const allBlocks = bFilter ? db.blocks.filter(bFilter) : db.blocks;

  // Date range filter — based on production date (created_at)
  const allFiltered = allBlocks.filter(b => {
    if (dtInicio || dtFim) {
      const d = new Date(b.created_at);
      if (dtInicio && d < new Date(dtInicio + "T00:00:00")) return false;
      if (dtFim    && d > new Date(dtFim    + "T23:59:59")) return false;
    }
    return true;
  });

  const shown = allFiltered.filter(b =>
    (!srch||b.code.toLowerCase().includes(srch.toLowerCase())||b.material.toLowerCase().includes(srch.toLowerCase())) &&
    (!fMat||b.material===fMat) && (!fSt||b.status===fSt)
  );
  const mats = [...new Set(allFiltered.map(b=>b.material))];

  // Period totals (all blocks in date range, ignoring status/text filters)
  const periodBlocks  = allFiltered;
  const periodTotal   = periodBlocks.length;
  const periodAvail   = periodBlocks.filter(b=>b.status==="available"||b.status==="reserved").length;
  const periodSold    = periodBlocks.filter(b=>b.status==="sold").length;
  const hojeFmt       = new Date().toISOString().slice(0,10);
  const temFiltroData = dtInicio || dtFim;
  const fmtDt         = d => d ? new Date(d+"T12:00:00").toLocaleDateString("pt-BR") : "";

  const upd      = (id,ch) => setDb(prev=>({...prev,blocks:prev.blocks.map(b=>b.id===id?{...b,...ch}:b)}));
  const delBlock = (b,e)   => { e.stopPropagation(); setConfirmDel(b); };
  const doDelete = ()      => { setDb(prev=>({...prev,blocks:prev.blocks.filter(x=>x.id!==confirmDel.id)})); toast(`Bloco ${confirmDel.code} excluído.`,"ok"); setConfirmDel(null); };
  const chgStatus= (b,st)  => { upd(b.id,{status:st}); setSel(null); toast(`Status: "${SL[st]}"`, "ok"); };

  const canEdit   = currentUser.role==="owner"||currentUser.role==="seller"||currentUser.role==="foreman";
  const canDelete = currentUser.role==="owner"||currentUser.role==="foreman";
  const canSell   = currentUser.role==="owner"||currentUser.role==="seller";
  const canReserve= currentUser.role==="owner"||currentUser.role==="seller";

  // Multi-select helpers
  const toggleSelect = (b, e) => {
    e.stopPropagation();
    if (!(b.status==="available"||b.status==="reserved")) return;
    setSelectedIds(prev => prev.includes(b.id) ? prev.filter(id=>id!==b.id) : [...prev, b.id]);
  };
  const selectedBlocks = allBlocks.filter(b => selectedIds.includes(b.id));
  const clearSelection = () => setSelectedIds([]);
  const sellSelected   = () => { setSaleBlks(selectedBlocks); clearSelection(); };

  const cardActs = b => {
    const isSel = selectedIds.includes(b.id);
    const sellable = b.status==="available"||b.status==="reserved";
    return (<>
      {/* Multi-select checkbox */}
      {canSell && sellable && (
        <button
          className={`btn bxs ${isSel?"bb":"bo"}`}
          onClick={e=>toggleSelect(b,e)}
          title={isSel?"Remover da seleção":"Adicionar à venda"}
        >
          {isSel ? "☑ Selecionado" : "☐ Selecionar"}
        </button>
      )}
      {canSell&&b.status==="reserved"&&<button className="btn ba bxs" onClick={e=>{e.stopPropagation();upd(b.id,{status:"available",reserved_for:null});toast(`Reserva de ${b.code} cancelada.`,"ok");}}>🔓 Cancelar Reserva</button>}
      {canSell&&sellable&&<button className="btn bg bxs" onClick={e=>{e.stopPropagation();setSaleBlks([b]);}}>💰 Vender</button>}
      {canEdit&&<button className="btn bo bxs" onClick={e=>{e.stopPropagation();setEditBlk(b);}}>✏️ Editar</button>}
      {canDelete&&<button className="btn br bxs" onClick={e=>delBlock(b,e)}>🗑️</button>}
    </>);
  };

  const modalFooter = sel ? (() => {
    if (currentUser.role==="owner"||currentUser.role==="seller") return(
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {sel.status==="available"&&canReserve&&(
          <button className="btn bo bsm" onClick={()=>{setSel(null);setReserveBlk(sel);}}>
            🔒 Reservar
          </button>
        )}
        {sel.status==="reserved"&&canReserve&&(
          <button className="btn ba bsm" onClick={()=>{upd(sel.id,{status:"available",reserved_for:null});setSel(null);toast("Reserva cancelada. Bloco disponível.","ok");}}>
            🔓 Cancelar Reserva
          </button>
        )}
        {(sel.status==="available"||sel.status==="reserved")&&canSell&&(
          <button className="btn bg bsm" onClick={()=>setSaleBlks([sel])}>
            💰 Vender
          </button>
        )}
      </div>
    );
    return null;
  })():null;

  return(
    <div>
      <div className="ph">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
          <div>
            <div className="ptit">{title||"Blocos"}</div>
            <div className="psub">
              {temFiltroData
                ? `${periodTotal} produzido(s) · ${periodAvail} em estoque · ${periodSold} vendido(s) — ${fmtDt(dtInicio)||"início"} → ${fmtDt(dtFim)||"hoje"}`
                : sub||`${shown.length} bloco(s)`}
            </div>
          </div>
          {selectedIds.length > 0 && (
            <div style={{display:"flex",alignItems:"center",gap:10,background:"var(--sap0)",border:"1px solid var(--sap2)",borderRadius:"var(--r-md)",padding:"10px 16px"}}>
              <span style={{fontSize:13,fontWeight:600,color:"var(--sap7)"}}>{selectedIds.length} bloco(s) selecionado(s)</span>
              <button className="btn bg bsm" onClick={sellSelected}><Icon n="cart" s={14}/> Vender Selecionados</button>
              <button className="btn bo bsm" onClick={clearSelection}><Icon n="x" s={13}/> Limpar</button>
            </div>
          )}
        </div>
      </div>

      {/* ── Date range filter card ── */}
      <div className="card" style={{marginBottom:16}}>
        <div className="cb" style={{padding:"14px 18px"}}>
          <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,flex:"1 1 160px"}}>
              <Icon n="hist" s={14} c="var(--mist)"/>
              <label style={{fontSize:11,fontWeight:700,color:"var(--mist)",textTransform:"uppercase",letterSpacing:.5,whiteSpace:"nowrap"}}>Produção de</label>
              <input type="date" className="fc" style={{fontSize:13,padding:"7px 10px",flex:1}} value={dtInicio} max={dtFim||hojeFmt} onChange={e=>setDtInicio(e.target.value)}/>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8,flex:"1 1 160px"}}>
              <label style={{fontSize:11,fontWeight:700,color:"var(--mist)",textTransform:"uppercase",letterSpacing:.5,whiteSpace:"nowrap"}}>até</label>
              <input type="date" className="fc" style={{fontSize:13,padding:"7px 10px",flex:1}} value={dtFim} min={dtInicio} max={hojeFmt} onChange={e=>setDtFim(e.target.value)}/>
            </div>
            {temFiltroData && (
              <button className="btn bo bsm" onClick={()=>{setDtInicio("");setDtFim("");}}>
                <Icon n="x" s={13}/> Limpar datas
              </button>
            )}
          </div>

          {/* Period summary */}
          {temFiltroData && (
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginTop:14}}>
              <div style={{background:"var(--haze)",borderRadius:"var(--r-sm)",padding:"10px 14px",border:"1px solid var(--bdr2)",textAlign:"center"}}>
                <div style={{fontSize:22,fontFamily:"Sora,sans-serif",fontWeight:800,color:"var(--ink2)"}}>{periodTotal}</div>
                <div style={{fontSize:11,color:"var(--mist)",marginTop:2}}>Total Produzido</div>
              </div>
              <div style={{background:"#dcfce7",borderRadius:"var(--r-sm)",padding:"10px 14px",border:"1px solid #bbf7d0",textAlign:"center"}}>
                <div style={{fontSize:22,fontFamily:"Sora,sans-serif",fontWeight:800,color:"#15803d"}}>{periodAvail}</div>
                <div style={{fontSize:11,color:"#16a34a",marginTop:2}}>Em Estoque</div>
              </div>
              <div style={{background:"#fee2e2",borderRadius:"var(--r-sm)",padding:"10px 14px",border:"1px solid #fecaca",textAlign:"center"}}>
                <div style={{fontSize:22,fontFamily:"Sora,sans-serif",fontWeight:800,color:"#dc2626"}}>{periodSold}</div>
                <div style={{fontSize:11,color:"var(--err)",marginTop:2}}>Vendidos</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="fb">
        <div style={{position:"relative",flex:1,minWidth:200}}>
          <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",color:"var(--mist)",pointerEvents:"none"}}><Icon n="srch" s={14}/></span>
          <input className="fc" style={{paddingLeft:34}} value={srch} onChange={e=>setSrch(e.target.value)} placeholder="Buscar código ou material..."/>
        </div>
        <select className="fc" style={{width:"auto",fontSize:13,padding:"9px 12px"}} value={fSt} onChange={e=>setFSt(e.target.value)}>
          <option value="">Todos os status</option>
          {Object.entries(SL).map(([k,v])=><option key={k} value={k}>{v}</option>)}
        </select>
        <select className="fc" style={{width:"auto",fontSize:13,padding:"9px 12px"}} value={fMat} onChange={e=>setFMat(e.target.value)}>
          <option value="">Todos os materiais</option>
          {mats.map(m=><option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {shown.length===0
        ? <div className="es"><div style={{marginBottom:16,opacity:.3}}><Icon n="cube" s={48}/></div><div className="estit">Nenhum bloco encontrado</div></div>
        : (() => {
            const reserved = shown.filter(b => b.status === "reserved");
            const others   = shown.filter(b => b.status !== "reserved");
            const renderCard = b => (
              <div key={b.id} style={{position:"relative"}}>
                {selectedIds.includes(b.id) && (
                  <div style={{position:"absolute",inset:0,zIndex:2,borderRadius:"var(--r-xl)",border:"2px solid var(--sap6)",boxShadow:"0 0 0 4px rgba(37,99,235,.15)",pointerEvents:"none"}}/>
                )}
                <BCard b={b} quarries={quarries} clients={db.clients} onView={setSel} acts={cardActs}/>
              </div>
            );
            return (
              <div>
                {/* ── Reservados em destaque ── */}
                {reserved.length > 0 && (
                  <div style={{marginBottom:28}}>
                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{width:10,height:10,borderRadius:"50%",background:"var(--sap5)",boxShadow:"0 0 0 3px rgba(59,130,246,.2)"}}/>
                        <span style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,color:"var(--sap6)"}}>
                          Reservados — {reserved.length} bloco{reserved.length>1?"s":""}
                        </span>
                      </div>
                      <div style={{flex:1,height:1,background:"linear-gradient(to right,var(--sap2),transparent)"}}/>
                    </div>
                    <div className="bgg">{reserved.map(renderCard)}</div>
                  </div>
                )}
                {/* ── Demais blocos ── */}
                {others.length > 0 && (
                  <div>
                    {reserved.length > 0 && (
                      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{width:10,height:10,borderRadius:"50%",background:"var(--grn)",boxShadow:"0 0 0 3px rgba(16,185,129,.2)"}}/>
                          <span style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,color:"var(--ok)"}}>
                            Disponíveis e outros — {others.length} bloco{others.length>1?"s":""}
                          </span>
                        </div>
                        <div style={{flex:1,height:1,background:"linear-gradient(to right,rgba(16,185,129,.3),transparent)"}}/>
                      </div>
                    )}
                    <div className="bgg">{others.map(renderCard)}</div>
                  </div>
                )}
              </div>
            );
          })()
      }

      <BModal b={sel} quarries={quarries} users={db.users} currentUser={currentUser} db={db} onClose={()=>setSel(null)} footer={modalFooter}/>
      {editBlk&&<EditBlockModal b={editBlk} onClose={()=>setEditBlk(null)} onSave={ch=>{upd(editBlk.id,ch);setEditBlk(null);toast("Bloco atualizado!","ok");}}/>}
      {saleBlks&&<SaleModal selectedBlocks={saleBlks} db={db} setDb={setDb} currentUser={currentUser} onClose={()=>setSaleBlks(null)} toast={toast} globalDollarRate={globalDollarRate}/>}
      {reserveBlk&&<ReserveModal b={reserveBlk} db={db} setDb={setDb} toast={toast} onClose={()=>setReserveBlk(null)}/>}

      {/* ── CONFIRM DELETE MODAL ── */}
      {confirmDel&&(
        <div className="mo" onClick={()=>setConfirmDel(null)}>
          <div className="md" style={{maxWidth:420}} onClick={e=>e.stopPropagation()}>
            <div className="mhead">
              <div className="mtit" style={{color:"var(--red)"}}>⚠️ Excluir Bloco</div>
              <button className="btn bo bic bsm" onClick={()=>setConfirmDel(null)}><Icon n="x" s={16}/></button>
            </div>
            <div className="mbody">
              <p style={{fontSize:14,lineHeight:1.6}}>Tem certeza que deseja excluir o bloco <strong style={{color:"var(--red)"}}>{confirmDel.code}</strong>?</p>
              <div style={{marginTop:12,background:"#fff0f0",border:"1px solid #fecaca",borderRadius:8,padding:"10px 14px",fontSize:13,color:"#991b1b"}}>
                🗑️ <strong>{confirmDel.material}</strong> — {confirmDel.classification}<br/>
                Esta ação não pode ser desfeita.
              </div>
            </div>
            <div className="mfoot">
              <button className="btn bo" onClick={()=>setConfirmDel(null)}>Cancelar</button>
              <button className="btn br" onClick={doDelete}><Icon n="trash" s={15}/> Confirmar Exclusão</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── QUARRIES PAGE ───────────────────────────
function QuarriesPage({db, setDb, toast}) {
  const emptyForm = { name:"", location:"", materials:[] };
  const [form,    setForm]    = useState(emptyForm);
  const [editId,  setEditId]  = useState(null);
  const [showForm,setShowForm]= useState(false);
  const [newMat,  setNewMat]  = useState("");
  const [selQ,    setSelQ]    = useState(null); // quarry detail view
  const sv = (k,v) => setForm(x=>({...x,[k]:v}));

  const openNew  = () => { setForm(emptyForm); setEditId(null); setNewMat(""); setShowForm(true); };
  const openEdit = q  => { setForm({name:q.name, location:q.location||"", materials:[...(q.materials||[])]}); setEditId(q.id); setNewMat(""); setShowForm(true); };

  const addMaterial = () => {
    const m = newMat.trim();
    if (!m) return;
    if (form.materials.includes(m)) { toast("Material já adicionado.","err"); return; }
    sv("materials", [...form.materials, m]);
    setNewMat("");
  };
  const removeMaterial = m => sv("materials", form.materials.filter(x=>x!==m));

  const save = () => {
    if (!form.name.trim()) { toast("Nome da pedreira obrigatório.","err"); return; }
    if (form.materials.length === 0) { toast("Adicione ao menos um material.","err"); return; }
    if (editId) {
      setDb(prev=>({...prev, quarries: prev.quarries.map(q=>q.id===editId?{...q,...form}:q)}));
      toast("Pedreira atualizada!","ok");
    } else {
      setDb(prev=>({...prev, quarries:[...prev.quarries,{id:nid(prev.quarries),...form}]}));
      toast("Pedreira cadastrada!","ok");
    }
    setShowForm(false);
  };

  const del = q => {
    const inUse = db.blocks.some(b=>b.quarry_id===q.id);
    if (inUse) { toast("Não é possível excluir: existem blocos vinculados a esta pedreira.","err"); return; }
    if (!window.confirm(`Excluir a pedreira "${q.name}"?`)) return;
    setDb(prev=>({...prev, quarries:prev.quarries.filter(x=>x.id!==q.id)}));
    toast("Pedreira excluída.","ok");
  };

  const MATERIAL_SUGGESTIONS = [
    "Granito Verde Ubatuba","Granito Preto São Gabriel","Granito Amarelo Ornamental",
    "Granito Rosa Porriño","Mármore Branco Carrara","Mármore Branco Espírito Santo",
    "Mármore Bege Bahia","Quartzito Taj Mahal","Quartzito Persa","Travertino Romano",
    "Basalto Negro","Calcário Bege","Pedra São Tomé","Granito Cinza Andorinha",
  ];
  const suggestions = MATERIAL_SUGGESTIONS.filter(s =>
    !form.materials.includes(s) &&
    s.toLowerCase().includes(newMat.toLowerCase()) &&
    newMat.length > 0
  );

  return (
    <div>
      <div className="ph">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
          <div><div className="ptit">Pedreiras</div><div className="psub">{db.quarries.length} pedreira(s) cadastrada(s)</div></div>
          <button className="btn bb" onClick={openNew}><Icon n="plus" s={15}/> Nova Pedreira</button>
        </div>
      </div>

      {db.quarries.length === 0
        ? <div className="es"><div style={{marginBottom:16,opacity:.3}}><Icon n="mtn" s={48}/></div><div className="estit">Nenhuma pedreira cadastrada</div></div>
        : <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {db.quarries.map(q => {
              const blockCount = db.blocks.filter(b=>b.quarry_id===q.id).length;
              const soldCount  = db.blocks.filter(b=>b.quarry_id===q.id&&b.status==="sold").length;
              return (
                <div key={q.id} className="card">
                  <div className="cb">
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
                      <div style={{flex:1}}>
                        {/* Header */}
                        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                          <div style={{width:40,height:40,borderRadius:10,background:"var(--b1)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                            <Icon n="mtn" s={20} c="var(--b6)"/>
                          </div>
                          <div>
                            <div style={{fontFamily:"Sora,sans-serif",fontSize:16,fontWeight:700,color:"var(--b8)"}}>{q.name}</div>
                            {q.location&&<div style={{fontSize:12,color:"var(--mut)",marginTop:1}}>📍 {q.location}</div>}
                          </div>
                        </div>

                        {/* Materials */}
                        <div style={{marginBottom:10}}>
                          <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:"var(--b6)",marginBottom:6}}>
                            Materiais Extraídos
                          </div>
                          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                            {(q.materials||[]).map(m=>(
                              <span key={m} style={{background:"var(--b0)",border:"1px solid var(--b2)",borderRadius:20,padding:"3px 12px",fontSize:12,fontWeight:600,color:"var(--b7)"}}>
                                🪨 {m}
                              </span>
                            ))}
                            {(!q.materials||q.materials.length===0)&&<span style={{fontSize:12,color:"var(--mut)"}}>Nenhum material cadastrado</span>}
                          </div>
                        </div>

                        {/* Stats */}
                        <div style={{display:"flex",gap:16,fontSize:12,color:"var(--mut)"}}>
                          <span>📦 <strong style={{color:"var(--g9)"}}>{blockCount}</strong> bloco(s) cadastrado(s)</span>
                          <span>✅ <strong style={{color:"var(--red)"}}>{soldCount}</strong> vendido(s)</span>
                          <span>🔓 <strong style={{color:"var(--grn)"}}>{blockCount-soldCount}</strong> em estoque</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                        <button className="btn bo bsm" onClick={()=>openEdit(q)}><Icon n="edit" s={14}/> Editar</button>
                        <button className="btn br bsm" onClick={()=>del(q)}><Icon n="trash" s={14}/></button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
      }

      {/* ── FORM MODAL ── */}
      {showForm && (
        <div className="mo" onClick={e=>e.target===e.currentTarget&&setShowForm(false)}>
          <div className="md" onClick={e=>e.stopPropagation()}>
            <div className="mhead">
              <div className="mtit">{editId?"Editar Pedreira":"Nova Pedreira"}</div>
              <button className="btn bo bic bsm" onClick={()=>setShowForm(false)}><Icon n="x" s={16}/></button>
            </div>
            <div className="mbody">
              <div className="fg">
                <label className="fl">Nome da Pedreira *</label>
                <input className="fc" value={form.name} onChange={e=>sv("name",e.target.value)} placeholder="Ex: Pedreira Norte"/>
              </div>
              <div className="fg">
                <label className="fl">Localização</label>
                <input className="fc" value={form.location} onChange={e=>sv("location",e.target.value)} placeholder="Ex: Serra do Cipó, MG"/>
              </div>

              <hr className="dvd"/>
              <div className="seclbl">Materiais Extraídos</div>

              {/* Added materials */}
              {form.materials.length > 0 && (
                <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:14}}>
                  {form.materials.map(m=>(
                    <div key={m} style={{display:"flex",alignItems:"center",gap:6,background:"var(--b0)",border:"1px solid var(--b2)",borderRadius:20,padding:"4px 10px 4px 12px",fontSize:12,fontWeight:600,color:"var(--b7)"}}>
                      🪨 {m}
                      <button onClick={()=>removeMaterial(m)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--red)",display:"flex",alignItems:"center",padding:0,marginLeft:2}}>
                        <Icon n="x" s={13}/>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add material input */}
              <div className="fg" style={{position:"relative"}}>
                <label className="fl">Adicionar Material</label>
                <div style={{display:"flex",gap:8}}>
                  <div style={{flex:1,position:"relative"}}>
                    <input
                      className="fc"
                      value={newMat}
                      onChange={e=>setNewMat(e.target.value)}
                      onKeyDown={e=>e.key==="Enter"&&addMaterial()}
                      placeholder="Digite o nome do material ou selecione abaixo..."
                    />
                    {/* Autocomplete suggestions */}
                    {suggestions.length > 0 && (
                      <div style={{position:"absolute",top:"100%",left:0,right:0,background:"#fff",border:"1.5px solid var(--b2)",borderRadius:"0 0 8px 8px",boxShadow:"0 8px 24px rgba(0,0,0,.12)",zIndex:50,maxHeight:180,overflowY:"auto"}}>
                        {suggestions.map(s=>(
                          <div key={s} onClick={()=>{setNewMat(""); sv("materials",[...form.materials,s]);}} style={{padding:"8px 14px",cursor:"pointer",fontSize:13,borderBottom:"1px solid var(--bdr)"}} onMouseEnter={e=>e.currentTarget.style.background="var(--b0)"} onMouseLeave={e=>e.currentTarget.style.background=""}>
                            🪨 {s}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button className="btn bb bsm" onClick={addMaterial} style={{flexShrink:0}}>
                    <Icon n="plus" s={15}/> Adicionar
                  </button>
                </div>
                <div className="form-hint" style={{fontSize:11,color:"var(--mut)",marginTop:5}}>
                  Digite o nome e clique em Adicionar, ou pressione Enter. Uma pedreira pode ter múltiplos materiais.
                </div>
              </div>
            </div>
            <div className="mfoot">
              <button className="btn bo" onClick={()=>setShowForm(false)}>Cancelar</button>
              <button className="btn bb" onClick={save}><Icon n="check" s={15}/> {editId?"Salvar Alterações":"Cadastrar Pedreira"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ─── CLIENT REGISTER ─────────────────────────
function ClientsPage({db, setDb, toast, currentUser}) {
  const [form,setForm]=useState({name:"",country:"Brasil",phone:"",email:"",doc:"",notes:""});
  const [editId,setEditId]=useState(null);
  const [showForm,setShowForm]=useState(false);
  const sv=(k,v)=>setForm(x=>({...x,[k]:v}));

  const openNew=()=>{setForm({name:"",country:"Brasil",phone:"",email:"",doc:"",notes:""});setEditId(null);setShowForm(true);};
  const openEdit=c=>{setForm({name:c.name,country:c.country,phone:c.phone||"",email:c.email||"",doc:c.doc||"",notes:c.notes||""});setEditId(c.id);setShowForm(true);};
  const save=()=>{
    if(!form.name.trim()){toast("Nome obrigatório.","err");return;}
    if(editId){setDb(prev=>({...prev,clients:prev.clients.map(c=>c.id===editId?{...c,...form}:c)}));toast("Cliente atualizado!","ok");}
    else{setDb(prev=>({...prev,clients:[...prev.clients,{id:nid(prev.clients),...form}]}));toast("Cliente cadastrado!","ok");}
    setShowForm(false);
  };
  const del=c=>{if(!window.confirm(`Excluir cliente ${c.name}?`))return;setDb(prev=>({...prev,clients:prev.clients.filter(x=>x.id!==c.id)}));toast("Cliente excluído.","ok");};

  return(
    <div>
      <div className="ph">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
          <div><div className="ptit">Clientes</div><div className="psub">{db.clients.length} cliente(s) cadastrado(s)</div></div>
          <button className="btn bb" onClick={openNew}><Icon n="plus" s={15}/> Novo Cliente</button>
        </div>
      </div>
      {db.clients.length===0
        ?<div className="es"><div style={{marginBottom:16,opacity:.3}}><Icon n="user" s={48}/></div><div className="estit">Nenhum cliente cadastrado</div></div>
        :<div className="card"><div className="tw"><table>
          <thead><tr><th>Nome</th><th>País</th><th>Telefone</th><th>E-mail</th><th>Doc/CNPJ</th><th>Ações</th></tr></thead>
          <tbody>{db.clients.map(c=>(
            <tr key={c.id}>
              <td style={{fontWeight:600}}>{c.name}</td>
              <td>{c.country}</td>
              <td style={{fontSize:12}}>{c.phone||"—"}</td>
              <td style={{fontSize:12}}>{c.email||"—"}</td>
              <td style={{fontSize:12}}>{c.doc||"—"}</td>
              <td><div style={{display:"flex",gap:6}}><button className="btn bo bxs" onClick={()=>openEdit(c)}><Icon n="edit" s={12}/></button>{currentUser?.role!=="seller"&&<button className="btn br bxs" onClick={()=>del(c)}><Icon n="trash" s={12}/></button>}</div></td>
            </tr>
          ))}</tbody>
        </table></div></div>
      }
      {showForm&&(
        <div className="mo" onClick={e=>e.target===e.currentTarget&&setShowForm(false)}>
          <div className="md">
            <div className="mhead"><div className="mtit">{editId?"Editar Cliente":"Novo Cliente"}</div><button className="btn bo bic bsm" onClick={()=>setShowForm(false)}><Icon n="x" s={16}/></button></div>
            <div className="mbody">
              <div className="fr2">
                <div className="fg"><label className="fl">Nome *</label><input className="fc" value={form.name} onChange={e=>sv("name",e.target.value)} placeholder="Razão social ou nome"/></div>
                <div className="fg"><label className="fl">País</label><input className="fc" value={form.country} onChange={e=>sv("country",e.target.value)} placeholder="Brasil"/></div>
              </div>
              <div className="fr2">
                <div className="fg"><label className="fl">Telefone / WhatsApp</label><input className="fc" value={form.phone} onChange={e=>sv("phone",e.target.value)} placeholder="+55 27 99999-0000"/></div>
                <div className="fg"><label className="fl">E-mail</label><input className="fc" type="email" value={form.email} onChange={e=>sv("email",e.target.value)} placeholder="cliente@empresa.com"/></div>
              </div>
              <div className="fg"><label className="fl">CPF / CNPJ / Passaporte</label><input className="fc" value={form.doc} onChange={e=>sv("doc",e.target.value)} placeholder="Documento"/></div>
              <div className="fg">
                <label className="fl">Vincular a usuário de login (opcional)</label>
                <select className="fc" value={form.user_id||""} onChange={e=>sv("user_id",e.target.value?parseInt(e.target.value):null)}>
                  <option value="">Sem vínculo</option>
                  {db.users.filter(u=>u.role==="client").map(u=>(
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
                <div style={{fontSize:11,color:"var(--mist)",marginTop:4}}>Vinculando, o usuário verá os blocos liberados para este cliente no app.</div>
              </div>
              <div className="fg"><label className="fl">Observações</label><textarea className="fc" value={form.notes} onChange={e=>sv("notes",e.target.value)} placeholder="Informações adicionais..."/></div>
            </div>
            <div className="mfoot"><button className="btn bo" onClick={()=>setShowForm(false)}>Cancelar</button><button className="btn bb" onClick={save}><Icon n="check" s={15}/> {editId?"Salvar":"Cadastrar"}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── COMMISSIONS PAGE ────────────────────────
function CommissionsPage({db}) {
  const [dtInicio, setDtInicio] = useState("");
  const [dtFim,    setDtFim]    = useState("");
  const [selSeller,setSelSeller]= useState(null);

  const hojeFmt = new Date().toISOString().slice(0,10);
  const fmtDt   = d => d ? new Date(d+"T12:00:00").toLocaleDateString("pt-BR") : "";
  const temFiltro = dtInicio || dtFim;

  const sellers = db.users.filter(u => u.role==="seller");

  // Compute per-seller commission data
  const sellerData = sellers.map(u => {
    const sales = db.sales.filter(s => {
      if (s.seller_id !== u.id) return false;
      const d = new Date(s.created_at);
      if (dtInicio && d < new Date(dtInicio+"T00:00:00")) return false;
      if (dtFim    && d > new Date(dtFim+"T23:59:59"))   return false;
      return true;
    });
    const totalBRL   = sales.reduce((a,s)=>a+(s.total_brl||0),0);
    const totalUSD   = sales.reduce((a,s)=>a+(s.total_usd||0),0);
    const commission = u.commission && u.commission_pct>0 ? totalBRL*(u.commission_pct/100) : 0;
    const qtdBlocos  = sales.reduce((a,s)=>a+((s.block_ids||[s.block_id]).filter(Boolean).length),0);
    return { u, sales, totalBRL, totalUSD, commission, qtdBlocos };
  });

  const grandCommission = sellerData.reduce((a,d)=>a+d.commission,0);
  const grandBRL        = sellerData.reduce((a,d)=>a+d.totalBRL,0);

  // All sales for selected seller detail
  const detail = selSeller ? sellerData.find(d=>d.u.id===selSeller) : null;

  return (
    <div>
      <div className="ph">
        <div className="ptit">Comissões</div>
        <div className="psub">
          {temFiltro ? `${fmtDt(dtInicio)||"início"} → ${fmtDt(dtFim)||"hoje"}` : "Todos os períodos"}
        </div>
      </div>

      {/* Summary */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:22}}>
        <div className="sc" style={{"--sc-accent":"#10b981"}}>
          <div className="sico" style={{background:"#dcfce7"}}><Icon n="trend" s={20} c="#059669"/></div>
          <div className="sval" style={{fontSize:16}}>{money(grandBRL,"BRL")}</div>
          <div className="slbl2">Total vendido R$</div>
        </div>
        <div className="sc" style={{"--sc-accent":"#f59e0b"}}>
          <div className="sico" style={{background:"#fef3c7"}}><Icon n="dolar" s={20} c="#d97706"/></div>
          <div className="sval" style={{fontSize:16}}>{money(grandCommission,"BRL")}</div>
          <div className="slbl2">Total em comissões</div>
        </div>
        <div className="sc" style={{"--sc-accent":"#8b5cf6"}}>
          <div className="sico" style={{background:"#ede9fe"}}><Icon n="user" s={20} c="#7c3aed"/></div>
          <div className="sval">{sellers.filter(u=>u.commission).length}</div>
          <div className="slbl2">Vendedores c/ comissão</div>
        </div>
      </div>

      {/* Date filter */}
      <div className="card" style={{marginBottom:20}}>
        <div className="cb" style={{padding:"14px 18px"}}>
          <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,flex:"1 1 150px"}}>
              <label style={{fontSize:11,fontWeight:700,color:"var(--mist)",textTransform:"uppercase",letterSpacing:.5,whiteSpace:"nowrap"}}>De</label>
              <input type="date" className="fc" style={{fontSize:13,padding:"7px 10px",flex:1}} value={dtInicio} max={dtFim||hojeFmt} onChange={e=>setDtInicio(e.target.value)}/>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8,flex:"1 1 150px"}}>
              <label style={{fontSize:11,fontWeight:700,color:"var(--mist)",textTransform:"uppercase",letterSpacing:.5,whiteSpace:"nowrap"}}>Até</label>
              <input type="date" className="fc" style={{fontSize:13,padding:"7px 10px",flex:1}} value={dtFim} min={dtInicio} max={hojeFmt} onChange={e=>setDtFim(e.target.value)}/>
            </div>
            {temFiltro&&<button className="btn bo bsm" onClick={()=>{setDtInicio("");setDtFim("");}}>
              <Icon n="x" s={13}/> Limpar
            </button>}
          </div>
        </div>
      </div>

      {/* Seller cards */}
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {sellerData.map(({u,sales,totalBRL,totalUSD,commission,qtdBlocos})=>(
          <div key={u.id} className="card">
            <div className="cb">
              <div style={{display:"flex",alignItems:"flex-start",gap:16,flexWrap:"wrap"}}>
                {/* Avatar */}
                <div style={{width:52,height:52,borderRadius:14,background:"linear-gradient(135deg,var(--sap7),var(--sap5))",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Sora,sans-serif",fontWeight:800,fontSize:18,flexShrink:0}}>
                  {u.avatar}
                </div>
                {/* Info */}
                <div style={{flex:1}}>
                  <div style={{fontFamily:"Sora,sans-serif",fontWeight:700,fontSize:16,color:"var(--ink2)",marginBottom:2}}>{u.name}</div>
                  <div style={{fontSize:12,color:"var(--mist)",marginBottom:10}}>{u.email} {u.phone&&`· ${u.phone}`}</div>

                  {/* Stats row */}
                  <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
                    <div className="di">
                      <div className="dilbl">Vendas no período</div>
                      <div className="dival">{sales.length} venda(s) · {qtdBlocos} bloco(s)</div>
                    </div>
                    <div className="di">
                      <div className="dilbl">Total vendido R$</div>
                      <div className="dival" style={{color:"var(--sap7)",fontSize:16}}>{money(totalBRL,"BRL")}</div>
                    </div>
                    {totalUSD>0&&<div className="di">
                      <div className="dilbl">Total vendido US$</div>
                      <div className="dival" style={{color:"var(--sap7)"}}>{money(totalUSD,"USD")}</div>
                    </div>}
                    <div className="di" style={{background: commission>0?"#fefce8":"var(--haze)", border: commission>0?"1px solid #fde68a":"1px solid var(--bdr2)"}}>
                      <div className="dilbl">
                        {u.commission&&u.commission_pct>0 ? `Comissão (${u.commission_pct}%)` : "Comissão"}
                      </div>
                      <div className="dival" style={{fontSize:18,color:commission>0?"#d97706":"var(--mist)"}}>
                        {commission>0 ? money(commission,"BRL") : "Sem comissão"}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Detail button */}
                {sales.length>0&&<button className="btn bo bsm" style={{flexShrink:0}} onClick={()=>setSelSeller(selSeller===u.id?null:u.id)}>
                  {selSeller===u.id?"▲ Ocultar":"▼ Detalhes"}
                </button>}
              </div>

              {/* Expanded sales detail */}
              {selSeller===u.id&&sales.length>0&&(
                <div style={{marginTop:16,borderTop:"1px solid var(--bdr2)",paddingTop:14}}>
                  <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:"var(--sap6)",marginBottom:10}}>Vendas do período</div>
                  <div className="tw">
                    <table>
                      <thead><tr><th>Nº</th><th>Blocos</th><th>Cliente</th><th>Total R$</th><th>Comissão</th><th>Data</th></tr></thead>
                      <tbody>
                        {[...sales].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).map(s=>{
                          const blks = (s.block_ids||[s.block_id]).map(id=>db.blocks.find(b=>b.id===id)).filter(Boolean);
                          const cli  = db.clients.find(c=>c.id===s.client_id);
                          const comm = u.commission&&u.commission_pct>0 ? (s.total_brl||0)*(u.commission_pct/100) : 0;
                          return(
                            <tr key={s.id}>
                              <td style={{fontSize:11,color:"var(--mist)"}}>#{String(s.id).padStart(4,"0")}</td>
                              <td>{blks.map(b=><div key={b.id} style={{fontSize:11}}><span style={{fontWeight:700,color:"var(--sap7)"}}>{b.code}</span> <span style={{color:"var(--mist)"}}>{b.material}</span></div>)}</td>
                              <td style={{fontSize:12}}>{cli?.name||"—"}</td>
                              <td style={{fontWeight:700,color:"#059669"}}>{s.total_brl>0?money(s.total_brl,"BRL"):"—"}</td>
                              <td style={{fontWeight:700,color:"#d97706"}}>{comm>0?money(comm,"BRL"):"—"}</td>
                              <td style={{fontSize:11,color:"var(--mist)"}}>{fdateS(s.created_at)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


// ─── SELLERS PAGE ────────────────────────────
function SellersPage({db, setDb, toast}) {
  const emptyForm = {name:"", email:"", password:"123", phone:"", commission:false, commission_pct:""};
  const [form,     setForm]     = useState(emptyForm);
  const [editId,   setEditId]   = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showPw,   setShowPw]   = useState(false);
  const sv = (k,v) => setForm(x=>({...x,[k]:v}));

  const sellers = db.users.filter(u => u.role === "seller");

  const openNew  = () => { setForm(emptyForm); setEditId(null); setShowPw(false); setShowForm(true); };
  const openEdit = u  => { setForm({name:u.name, email:u.email, password:u.password||"", phone:u.phone||"", commission:u.commission||false, commission_pct:u.commission_pct||""}); setEditId(u.id); setShowPw(false); setShowForm(true); };

  const save = () => {
    if (!form.name.trim()) { toast("Nome obrigatório.", "err"); return; }
    if (!form.email.trim()) { toast("E-mail obrigatório.", "err"); return; }
    if (form.commission && (!form.commission_pct || parseFloat(form.commission_pct) <= 0)) {
      toast("Informe o percentual de comissão.", "err"); return;
    }
    const data = {
      name: form.name.trim(), email: form.email.trim(), password: form.password||"123",
      phone: form.phone.trim(), role: "seller", quarry_id: null,
      commission: form.commission, commission_pct: form.commission ? parseFloat(form.commission_pct) : 0,
      avatar: form.name.trim().split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase(),
    };
    if (editId) {
      setDb(prev=>({...prev, users: prev.users.map(u => u.id===editId ? {...u,...data} : u)}));
      toast("Vendedor atualizado!", "ok");
    } else {
      if (db.users.find(u=>u.email===form.email)) { toast("E-mail já cadastrado.", "err"); return; }
      setDb(prev=>({...prev, users:[...prev.users, {id:nid(prev.users), ...data}]}));
      toast("Vendedor cadastrado!", "ok");
    }
    setShowForm(false);
  };

  const del = u => {
    if (!window.confirm(`Excluir o vendedor "${u.name}"?`)) return;
    setDb(prev=>({...prev, users: prev.users.filter(x=>x.id!==u.id)}));
    toast("Vendedor excluído.", "ok");
  };

  // Calculate commission per seller from sales
  const sellerTotals = u => {
    const sales = db.sales.filter(s => s.seller_id === u.id);
    const totalBRL = sales.reduce((a,s) => a + (s.total_brl||0), 0);
    const commission = u.commission && u.commission_pct > 0 ? totalBRL * (u.commission_pct/100) : 0;
    return { count: sales.length, totalBRL, commission };
  };

  return (
    <div>
      <div className="ph">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
          <div><div className="ptit">Vendedores</div><div className="psub">{sellers.length} vendedor(es) cadastrado(s)</div></div>
          <button className="btn bb" onClick={openNew}><Icon n="plus" s={15}/> Novo Vendedor</button>
        </div>
      </div>

      {sellers.length === 0
        ? <div className="es"><div style={{marginBottom:16,opacity:.3}}><Icon n="user" s={48}/></div><div className="estit">Nenhum vendedor cadastrado</div></div>
        : <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {sellers.map(u => {
              const t = sellerTotals(u);
              return (
                <div key={u.id} className="card"><div className="cb">
                  <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
                    <div style={{display:"flex",gap:14,flex:1}}>
                      <div style={{width:46,height:46,borderRadius:12,background:"linear-gradient(135deg,var(--b6),var(--b4))",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Sora,sans-serif",fontWeight:800,fontSize:16,flexShrink:0}}>{u.avatar}</div>
                      <div style={{flex:1}}>
                        <div style={{fontFamily:"Sora,sans-serif",fontWeight:700,fontSize:15,color:"var(--b8)"}}>{u.name}</div>
                        <div style={{fontSize:12,color:"var(--mut)",marginTop:2}}>📧 {u.email}</div>
                        {u.phone&&<div style={{fontSize:12,color:"var(--mut)"}}>📱 {u.phone}</div>}
                        <div style={{display:"flex",flexWrap:"wrap",gap:12,marginTop:8,fontSize:12}}>
                          <span style={{background:"var(--g0)",padding:"3px 10px",borderRadius:20,border:"1px solid var(--bdr)"}}>🛒 {t.count} venda(s)</span>
                          <span style={{background:"var(--g0)",padding:"3px 10px",borderRadius:20,border:"1px solid var(--bdr)"}}>💰 {money(t.totalBRL,"BRL")} em vendas</span>
                          {u.commission && u.commission_pct > 0
                            ? <span style={{background:"#dcfce7",padding:"3px 10px",borderRadius:20,border:"1px solid #bbf7d0",color:"#15803d",fontWeight:600}}>
                                🏆 {u.commission_pct}% comissão = {money(t.commission,"BRL")}
                              </span>
                            : <span style={{background:"var(--g1)",padding:"3px 10px",borderRadius:20,border:"1px solid var(--g3)",color:"var(--mut)"}}>Sem comissão</span>
                          }
                        </div>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:6,alignItems:"flex-start"}}>
                      <button className="btn bo bsm" onClick={()=>openEdit(u)}><Icon n="edit" s={14}/> Editar</button>
                      <button className="btn br bsm" onClick={()=>del(u)}><Icon n="trash" s={14}/></button>
                    </div>
                  </div>
                </div></div>
              );
            })}
          </div>
      }

      {showForm && (
        <div className="mo" onClick={e=>e.target===e.currentTarget&&setShowForm(false)}>
          <div className="md" onClick={e=>e.stopPropagation()}>
            <div className="mhead">
              <div className="mtit">{editId?"Editar Vendedor":"Novo Vendedor"}</div>
              <button className="btn bo bic bsm" onClick={()=>setShowForm(false)}><Icon n="x" s={16}/></button>
            </div>
            <div className="mbody">
              <div className="fr2">
                <div className="fg"><label className="fl">Nome completo *</label><input className="fc" value={form.name} onChange={e=>sv("name",e.target.value)} placeholder="Nome do vendedor"/></div>
                <div className="fg"><label className="fl">Telefone / WhatsApp</label><input className="fc" value={form.phone} onChange={e=>sv("phone",e.target.value)} placeholder="+55 27 99999-0000"/></div>
              </div>
              <div className="fr2">
                <div className="fg"><label className="fl">E-mail (login) *</label><input className="fc" type="email" value={form.email} onChange={e=>sv("email",e.target.value)} placeholder="vendedor@empresa.com"/></div>
                <div className="fg"><label className="fl">Senha de acesso</label>
                  <div style={{position:"relative"}}>
                    <input className="fc" type={showPw?"text":"password"} value={form.password} onChange={e=>sv("password",e.target.value)} placeholder="Senha de acesso" style={{paddingRight:40}}/>
                    <button onClick={()=>setShowPw(v=>!v)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"var(--mut)",display:"flex"}}><Icon n={showPw?"eyex":"eye"} s={16}/></button>
                  </div>
                </div>
              </div>

              <hr className="dvd"/>
              <div className="seclbl">Comissão sobre Vendas</div>

              <div style={{background:"var(--g0)",border:"1.5px solid var(--bdr)",borderRadius:10,padding:"16px 18px",cursor:"pointer",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between",gap:16}} onClick={()=>sv("commission",!form.commission)}>
                <div>
                  <div style={{fontWeight:700,fontSize:14,color:"var(--g8)"}}>Este vendedor recebe comissão?</div>
                  <div style={{fontSize:12,color:"var(--mut)",marginTop:3}}>{form.commission?"✅ Sim — informe o percentual abaixo":"❌ Não — sem comissão sobre vendas"}</div>
                </div>
                <div style={{width:44,height:24,borderRadius:12,background:form.commission?"var(--grn)":"var(--g3)",transition:"background .2s",position:"relative",flexShrink:0}}>
                  <div style={{position:"absolute",top:3,left:form.commission?22:3,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left .2s",boxShadow:"0 1px 4px rgba(0,0,0,.2)"}}/>
                </div>
              </div>

              {form.commission && (
                <div className="fg">
                  <label className="fl">Percentual de Comissão (%)</label>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <input className="fc" type="number" step="0.1" min="0" max="100" value={form.commission_pct} onChange={e=>sv("commission_pct",e.target.value)} placeholder="Ex: 5" style={{width:140}}/>
                    <span style={{fontSize:14,color:"var(--mut)"}}>% sobre o total de cada venda</span>
                  </div>
                </div>
              )}
            </div>
            <div className="mfoot">
              <button className="btn bo" onClick={()=>setShowForm(false)}>Cancelar</button>
              <button className="btn bb" onClick={save}><Icon n="check" s={15}/> {editId?"Salvar Alterações":"Cadastrar Vendedor"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ─── PAYMENT METHODS ─────────────────────────
function PaymentsPage({db, setDb, toast, currentUser}) {
  const [form,setForm]=useState({name:"",details:""});
  const [editId,setEditId]=useState(null);
  const [showForm,setShowForm]=useState(false);
  const sv=(k,v)=>setForm(x=>({...x,[k]:v}));

  const openNew=()=>{setForm({name:"",details:""});setEditId(null);setShowForm(true);};
  const openEdit=p=>{setForm({name:p.name,details:p.details||""});setEditId(p.id);setShowForm(true);};
  const save=()=>{
    if(!form.name.trim()){toast("Nome obrigatório.","err");return;}
    if(editId){setDb(prev=>({...prev,payment_methods:prev.payment_methods.map(p=>p.id===editId?{...p,...form}:p)}));toast("Atualizado!","ok");}
    else{setDb(prev=>({...prev,payment_methods:[...prev.payment_methods,{id:nid(prev.payment_methods),...form}]}));toast("Cadastrado!","ok");}
    setShowForm(false);
  };
  const del=p=>{if(!window.confirm(`Excluir "${p.name}"?`))return;setDb(prev=>({...prev,payment_methods:prev.payment_methods.filter(x=>x.id!==p.id)}));toast("Excluído.","ok");};

  return(
    <div>
      <div className="ph">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
          <div><div className="ptit">Formas de Pagamento</div><div className="psub">{db.payment_methods.length} forma(s) cadastrada(s)</div></div>
          <button className="btn bb" onClick={openNew}><Icon n="plus" s={15}/> Nova Forma</button>
        </div>
      </div>
      {db.payment_methods.length===0
        ?<div className="es"><div style={{marginBottom:16,opacity:.3}}><Icon n="card" s={48}/></div><div className="estit">Nenhuma forma de pagamento</div></div>
        :<div style={{display:"flex",flexDirection:"column",gap:12}}>
          {db.payment_methods.map(p=>(
            <div key={p.id} className="card"><div className="cb" style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}}>
              <div><div style={{fontWeight:700,fontSize:15,display:"flex",alignItems:"center",gap:8}}><Icon n="card" s={16} c="var(--b6)"/>{p.name}</div><div style={{fontSize:13,color:"var(--mut)",marginTop:4}}>{p.details||"—"}</div></div>
              <div style={{display:"flex",gap:6}}><button className="btn bo bsm" onClick={()=>openEdit(p)}><Icon n="edit" s={14}/> Editar</button>{currentUser?.role!=="seller"&&<button className="btn br bsm" onClick={()=>del(p)}><Icon n="trash" s={14}/></button>}</div>
            </div></div>
          ))}
        </div>
      }
      {showForm&&(
        <div className="mo" onClick={e=>e.target===e.currentTarget&&setShowForm(false)}>
          <div className="md">
            <div className="mhead"><div className="mtit">{editId?"Editar":"Nova Forma de Pagamento"}</div><button className="btn bo bic bsm" onClick={()=>setShowForm(false)}><Icon n="x" s={16}/></button></div>
            <div className="mbody">
              <div className="fg"><label className="fl">Nome *</label><input className="fc" value={form.name} onChange={e=>sv("name",e.target.value)} placeholder="Ex: Transferência Bancária, Wire Transfer..."/></div>
              <div className="fg"><label className="fl">Detalhes / Dados bancários</label><textarea className="fc" value={form.details} onChange={e=>sv("details",e.target.value)} placeholder="Banco, agência, conta, SWIFT, IBAN..."/></div>
            </div>
            <div className="mfoot"><button className="btn bo" onClick={()=>setShowForm(false)}>Cancelar</button><button className="btn bb" onClick={save}><Icon n="check" s={15}/> {editId?"Salvar":"Cadastrar"}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SOLD BLOCKS LIST ────────────────────────

// ─── SOLD BLOCKS ────────────────────────────
function SoldBlocks({currentUser, quarries, db, setDb, toast}) {
  const [selBlock,  setSelBlock]  = useState(null);
  const [confirmRv, setConfirmRv] = useState(null);
  const [srch,      setSrch]      = useState("");
  const [soMes,     setSoMes]     = useState(false);
  const [filtroMes, setFiltroMes] = useState("");
  const [dtInicio,  setDtInicio]  = useState("");
  const [dtFim,     setDtFim]     = useState("");
  const [modoFiltro,setModoFiltro]= useState("mes");

  const now      = new Date();
  const mesAtual = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
  const hojeFmt  = now.toISOString().slice(0,10);

  const getBlockSale = b => db.sales.find(s => s.block_ids?.includes(b.id) || s.block_id === b.id);
  const getClient    = s => s ? db.clients.find(c => c.id === s.client_id) : null;
  const getSeller    = s => s ? db.users.find(u  => u.id === s.seller_id)  : null;
  const getPayMeth   = s => s ? db.payment_methods.find(p => p.id === s.payment_method_id) : null;

  const soldBlocks = db.blocks.filter(b => b.status === "sold");

  const mesesDisp = [...new Set(
    soldBlocks.map(b => {
      const s = getBlockSale(b);
      if (!s) return null;
      const d = new Date(s.created_at);
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    }).filter(Boolean)
  )].sort().reverse();

  const mesFiltro = soMes ? mesAtual : filtroMes;

  const shown = soldBlocks.filter(b => {
    const s = getBlockSale(b);
    if (s) {
      const saleDate = new Date(s.created_at);
      if (modoFiltro === "mes" && mesFiltro) {
        const bm = `${saleDate.getFullYear()}-${String(saleDate.getMonth()+1).padStart(2,"0")}`;
        if (bm !== mesFiltro) return false;
      }
      if (modoFiltro === "intervalo") {
        if (dtInicio && saleDate < new Date(dtInicio + "T00:00:00")) return false;
        if (dtFim    && saleDate > new Date(dtFim    + "T23:59:59")) return false;
      }
    }
    if (srch) {
      const q = quarries.find(q => q.id === b.quarry_id);
      const term = srch.toLowerCase();
      if (!b.code.toLowerCase().includes(term) &&
          !b.material.toLowerCase().includes(term) &&
          !(q?.name||"").toLowerCase().includes(term)) return false;
    }
    return true;
  });

  const totalBRL = shown.reduce((a,b) => {
    const s = getBlockSale(b); const dr = s?.dollar_rate||0;
    return a + (b.currency==="USD"&&dr>0 ? b.total_value*dr : b.currency==="BRL" ? b.total_value : 0);
  }, 0);
  const totalUSD = shown.filter(b=>b.currency==="USD").reduce((a,b)=>a+b.total_value,0);

  const fmtMesLabel = ym => {
    if (!ym) return "todos os períodos";
    const [y,m] = ym.split("-");
    return ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][parseInt(m)-1]+"/"+y;
  };
  const fmtDtLabel   = d  => d ? new Date(d+"T12:00:00").toLocaleDateString("pt-BR") : "";
  const periodoLabel = () => {
    if (modoFiltro==="mes")       return mesFiltro ? fmtMesLabel(mesFiltro) : "todos os períodos";
    if (modoFiltro==="intervalo") return (dtInicio||dtFim) ? `${fmtDtLabel(dtInicio)||"início"} → ${fmtDtLabel(dtFim)||"hoje"}` : "todos os períodos";
    return "todos os períodos";
  };
  const temFiltro    = soMes || filtroMes || (modoFiltro==="intervalo"&&(dtInicio||dtFim)) || srch;
  const limparFiltros= () => { setSoMes(false); setFiltroMes(""); setDtInicio(""); setDtFim(""); setSrch(""); };

  const reverseSale = (sale, block) => {
    setDb(prev => ({
      ...prev,
      blocks: prev.blocks.map(b => b.id===block.id ? {...b, status:"available"} : b),
      sales:  prev.sales.filter(s => s.id !== sale.id),
      notifications: [...prev.notifications, {
        id: nid(prev.notifications), user_id: 1,
        message: `Venda estornada: ${block.code} — ${block.material}`,
        read: false, created_at: new Date().toISOString(), type: "info",
      }],
    }));
    setConfirmRv(null); setSelBlock(null);
    toast("Venda estornada! Bloco voltou ao estoque.", "ok");
  };

  return (
    <div>
      <div className="ph">
        <div className="ptit">Blocos Vendidos</div>
        <div className="psub">{shown.length} bloco(s) · {periodoLabel()}</div>
      </div>

      {/* Stat cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:24}}>
        <div className="sc" style={{"--sc-accent":"#ef4444"}}><div className="sico" style={{background:"#fee2e2"}}><Icon n="cube" s={20} c="#dc2626"/></div><div className="sval">{shown.length}</div><div className="slbl2">Vendidos no período</div></div>
        <div className="sc" style={{"--sc-accent":"#10b981"}}><div className="sico" style={{background:"#dcfce7"}}><Icon n="money" s={20} c="#059669"/></div><div className="sval" style={{fontSize:18}}>{money(totalBRL,"BRL")}</div><div className="slbl2">Total em R$</div></div>
        <div className="sc" style={{"--sc-accent":"#2563eb"}}><div className="sico" style={{background:"#dbeafe"}}><Icon n="globe" s={20} c="#2563eb"/></div><div className="sval" style={{fontSize:18}}>{money(totalUSD,"USD")}</div><div className="slbl2">Total em US$</div></div>
      </div>

      {/* Filtros */}
      <div className="card" style={{marginBottom:20}}>
        <div className="cb">
          <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",marginBottom:14}}>
            <div style={{display:"flex",background:"var(--haze)",borderRadius:"var(--r-sm)",padding:3,gap:2,flexShrink:0}}>
              {[["mes","Por Mês"],["intervalo","Intervalo de Datas"]].map(([v,l])=>(
                <button key={v} onClick={()=>{setModoFiltro(v);setSoMes(false);setFiltroMes("");setDtInicio("");setDtFim("");}}
                  style={{padding:"5px 14px",borderRadius:6,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,transition:"all .15s",
                    background:modoFiltro===v?"var(--sap6)":"transparent",color:modoFiltro===v?"#fff":"var(--mist)"}}>
                  {l}
                </button>
              ))}
            </div>
            {modoFiltro==="mes" && (
              <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>{setSoMes(v=>!v);if(!soMes)setFiltroMes("");}}>
                <div style={{width:20,height:20,borderRadius:5,border:"2px solid",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s",
                  borderColor:soMes?"var(--sap6)":"var(--fog)",background:soMes?"var(--sap6)":"transparent"}}>
                  {soMes&&<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <span style={{fontSize:13,fontWeight:600,color:"var(--slate)"}}>Mês atual <span style={{fontSize:11,fontWeight:400,color:"var(--mist)"}}>({fmtMesLabel(mesAtual)})</span></span>
              </div>
            )}
          </div>
          <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
            {modoFiltro==="mes" && (
              <div style={{display:"flex",alignItems:"center",gap:8,flex:"1 1 200px"}}>
                <Icon n="hist" s={15} c="var(--mist)"/>
                <select className="fc" style={{fontSize:13,padding:"8px 12px",flex:1}} value={filtroMes} disabled={soMes} onChange={e=>setFiltroMes(e.target.value)}>
                  <option value="">Todos os períodos</option>
                  {mesesDisp.map(ym=>{
                    const [y,m]=ym.split("-");
                    return <option key={ym} value={ym}>{["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"][parseInt(m)-1]} / {y}</option>;
                  })}
                </select>
              </div>
            )}
            {modoFiltro==="intervalo" && (<>
              <div style={{display:"flex",alignItems:"center",gap:8,flex:"1 1 160px"}}>
                <label style={{fontSize:11,fontWeight:700,color:"var(--mist)",textTransform:"uppercase",whiteSpace:"nowrap"}}>De</label>
                <input type="date" className="fc" style={{fontSize:13,padding:"8px 12px",flex:1}} value={dtInicio} max={dtFim||hojeFmt} onChange={e=>setDtInicio(e.target.value)}/>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,flex:"1 1 160px"}}>
                <label style={{fontSize:11,fontWeight:700,color:"var(--mist)",textTransform:"uppercase",whiteSpace:"nowrap"}}>Até</label>
                <input type="date" className="fc" style={{fontSize:13,padding:"8px 12px",flex:1}} value={dtFim} min={dtInicio} max={hojeFmt} onChange={e=>setDtFim(e.target.value)}/>
              </div>
              {(dtInicio||dtFim)&&<div style={{fontSize:12,color:"var(--sap6)",fontWeight:600,whiteSpace:"nowrap"}}>📅 {fmtDtLabel(dtInicio)||"início"} → {fmtDtLabel(dtFim)||"hoje"}</div>}
            </>)}
            <div style={{position:"relative",flex:"1 1 180px",minWidth:160}}>
              <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",color:"var(--mist)",pointerEvents:"none"}}><Icon n="srch" s={14}/></span>
              <input className="fc" style={{paddingLeft:34,fontSize:13,padding:"8px 12px 8px 34px"}} value={srch} onChange={e=>setSrch(e.target.value)} placeholder="Buscar..."/>
            </div>
            {temFiltro&&<button className="btn bo bsm" onClick={limparFiltros}><Icon n="x" s={13}/> Limpar filtros</button>}
          </div>
        </div>
      </div>

      {shown.length===0
        ?<div className="es"><div style={{marginBottom:16,opacity:.3}}><Icon n="cart" s={48}/></div><div className="estit">Nenhum bloco vendido no período</div></div>
        :<div className="card"><div className="tw"><table>
          <thead><tr>
            <th>Código</th><th>Material</th><th>Class.</th><th>Pedreira</th>
            <th>Vol. Líq.</th><th>Moeda</th><th>Valor</th>
            <th>Dólar</th><th>Total R$</th>
            <th>Cliente</th><th>Vendedor</th><th>Data Venda</th>
          </tr></thead>
          <tbody>
            {shown.map(b=>{
              const s   = getBlockSale(b);
              const cli = getClient(s);
              const slr = getSeller(s);
              const q   = quarries.find(q=>q.id===b.quarry_id);
              const dr  = s?.dollar_rate||0;
              const tBRL= b.currency==="USD"&&dr>0 ? parseFloat((b.total_value*dr).toFixed(2)) : b.currency==="BRL" ? b.total_value : 0;
              const sc  = SC[b.status];
              return(
                <tr key={b.id} style={{cursor:"pointer"}} onClick={()=>setSelBlock(b)}>
                  <td style={{fontWeight:700,color:"var(--err)",fontSize:12}}>{b.code}</td>
                  <td style={{fontSize:12}}>{b.material}</td>
                  <td><span className="bdg" style={{background:"#fee2e2",color:"var(--err)"}}>{b.classification}</span></td>
                  <td style={{fontSize:11,color:"var(--mist)"}}>{q?.name||"—"}</td>
                  <td style={{fontWeight:600}}>{b.net_volume} m³</td>
                  <td><span className="ctag">{b.currency==="USD"?"US$":"R$"}</span></td>
                  <td style={{fontWeight:700}}>{money(b.total_value,b.currency)}</td>
                  <td style={{fontSize:12,color:"var(--warn)",fontWeight:600}}>{dr>0?`R$ ${Number(dr).toFixed(2)}`:"—"}</td>
                  <td style={{fontWeight:700,color:"var(--ok)"}}>{tBRL>0?money(tBRL,"BRL"):"—"}</td>
                  <td style={{fontSize:12}}>{cli?.name||"—"}</td>
                  <td style={{fontSize:12}}>{slr?.name||"—"}</td>
                  <td style={{fontSize:11,color:"var(--mist)"}}>{s?fdateS(s.created_at):"—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table></div></div>
      }

      {/* Sale detail modal */}
      {selBlock&&(()=>{
        const sale    = getBlockSale(selBlock);
        const client  = getClient(sale);
        const seller  = getSeller(sale);
        const payMeth = getPayMeth(sale);
        const q       = quarries.find(q=>q.id===selBlock.quarry_id);
        const dr      = sale?.dollar_rate||0;
        const tBRL    = selBlock.currency==="USD"&&dr>0 ? parseFloat((selBlock.total_value*dr).toFixed(2)) : selBlock.currency==="BRL" ? selBlock.total_value : 0;
        const canRev  = currentUser.role==="owner"||currentUser.role==="seller";
        return(
          <div className="mo" onClick={()=>setSelBlock(null)}>
            <div className="md" onClick={e=>e.stopPropagation()}>
              <div className="mhead">
                <div>
                  <div style={{fontSize:10,color:"var(--err)",fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>Venda #{sale?String(sale.id).padStart(4,"0"):"—"}</div>
                  <div className="mtit">{selBlock.code} — {selBlock.material}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span className="bdg" style={{background:"#fee2e2",color:"var(--err)"}}>Vendido</span>
                  <button className="btn bo bic bsm" onClick={()=>setSelBlock(null)}><Icon n="x" s={16}/></button>
                </div>
              </div>
              <div className="mbody">
                <div className="ds">
                  <div className="dstit">Dados da Venda</div>
                  <div className="dgrid">
                    <div className="di"><div className="dilbl">Data</div><div className="dival" style={{fontSize:13}}>{sale?fdate(sale.created_at):"—"}</div></div>
                    <div className="di"><div className="dilbl">Cliente</div><div className="dival" style={{fontSize:13}}>{client?.name||"—"}</div></div>
                    <div className="di"><div className="dilbl">Vendedor</div><div className="dival" style={{fontSize:13}}>{seller?.name||"—"}</div></div>
                    <div className="di"><div className="dilbl">Pagamento</div><div className="dival" style={{fontSize:12}}>{payMeth?.name||"—"}</div></div>
                  </div>
                </div>
                <div className="ds">
                  <div className="dstit">Valores</div>
                  <div className="dgrid">
                    <div className="di"><div className="dilbl">Valor</div><div className="dival" style={{color:"var(--sap7)"}}>{money(selBlock.total_value,selBlock.currency)}</div></div>
                    {dr>0&&<div className="di"><div className="dilbl">Cotação USD na Data</div><div className="dival" style={{color:"var(--warn)"}}>R$ {Number(dr).toLocaleString("pt-BR",{minimumFractionDigits:2})}</div></div>}
                    {tBRL>0&&<div className="di" style={{gridColumn:"span 2",background:"var(--sap0)",border:"1px solid var(--sap2)"}}><div className="dilbl">Total em R$</div><div className="dival" style={{fontSize:22,color:"var(--sap7)"}}>{money(tBRL,"BRL")}</div></div>}
                  </div>
                </div>
                <div className="ds">
                  <div className="dstit">Bloco</div>
                  <div className="dgrid">
                    <div className="di"><div className="dilbl">Pedreira</div><div className="dival" style={{fontSize:13}}>{q?.name||"—"}</div></div>
                    <div className="di"><div className="dilbl">Classificação</div><div className="dival">{selBlock.classification}</div></div>
                    <div className="di"><div className="dilbl">Vol. Líquido</div><div className="dival">{selBlock.net_volume} m³</div></div>
                    <div className="di"><div className="dilbl">Preço/m³</div><div className="dival" style={{fontSize:13}}>{selBlock.currency==="USD"?"US$":"R$"} {Number(selBlock.price_m3).toLocaleString("pt-BR")}</div></div>
                  </div>
                </div>
                {sale?.obs&&<div style={{fontSize:13,background:"var(--haze)",padding:"10px 14px",borderRadius:"var(--r-sm)",borderLeft:"3px solid var(--sap2)",fontStyle:"italic"}}>{sale.obs}</div>}
              </div>
              <div className="mfoot">
                <button className="btn bo" onClick={()=>setSelBlock(null)}>Fechar</button>
                {canRev&&<button className="btn br bsm" onClick={()=>setConfirmRv({sale,block:selBlock})}><Icon n="hist" s={14}/> Estornar Venda</button>}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Confirm reverse */}
      {confirmRv&&(
        <div className="mo" onClick={()=>setConfirmRv(null)}>
          <div className="md" style={{maxWidth:440}} onClick={e=>e.stopPropagation()}>
            <div className="mhead">
              <div className="mtit" style={{color:"var(--warn)"}}>⚠️ Estornar Venda</div>
              <button className="btn bo bic bsm" onClick={()=>setConfirmRv(null)}><Icon n="x" s={16}/></button>
            </div>
            <div className="mbody">
              <p style={{fontSize:14,lineHeight:1.6,marginBottom:12}}>Estornar a venda do bloco <strong style={{color:"var(--err)"}}>{confirmRv.block.code}</strong>?</p>
              <div style={{background:"#fff7ed",border:"1px solid #fed7aa",borderRadius:8,padding:"10px 14px",fontSize:13,color:"#92400e"}}>
                🔄 O bloco voltará ao estoque como <strong>Disponível</strong> e o registro será removido.
              </div>
            </div>
            <div className="mfoot">
              <button className="btn bo" onClick={()=>setConfirmRv(null)}>Cancelar</button>
              <button className="btn ba" onClick={()=>reverseSale(confirmRv.sale,confirmRv.block)}><Icon n="hist" s={15}/> Confirmar Estorno</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ─── SHARE CATALOG PAGE ──────────────────────
function ShareCatalog({currentUser, quarries, db, setDb, toast}) {
  const [step,         setStep]         = useState(1);      // 1=select blocks, 2=select clients
  const [selBlockIds,  setSelBlockIds]  = useState([]);
  const [selClientIds, setSelClientIds] = useState([]);
  const [srchB,        setSrchB]        = useState("");
  const [srchC,        setSrchC]        = useState("");
  const [fMat,         setFMat]         = useState("");
  const [viewBlock,    setViewBlock]    = useState(null);   // block to inspect releases
  const [tab,          setTab]          = useState("share"); // "share" | "history"

  const availBlocks = db.blocks.filter(b => b.status !== "sold");
  const mats        = [...new Set(availBlocks.map(b => b.material))];

  const shownBlocks = availBlocks.filter(b => {
    const q    = quarries.find(q => q.id === b.quarry_id);
    const term = srchB.toLowerCase();
    const ok   = !srchB || b.code.toLowerCase().includes(term)
                         || b.material.toLowerCase().includes(term)
                         || (q?.name||"").toLowerCase().includes(term);
    return ok && (!fMat || b.material === fMat);
  });

  const shownClients = db.clients.filter(c =>
    !srchC || c.name.toLowerCase().includes(srchC.toLowerCase())
  );

  const toggleBlock  = id => setSelBlockIds(p  => p.includes(id)  ? p.filter(x=>x!==id)  : [...p, id]);
  const toggleClient = id => setSelClientIds(p => p.includes(id)  ? p.filter(x=>x!==id)  : [...p, id]);
  const selectAll    = ()  => setSelBlockIds(shownBlocks.map(b=>b.id));
  const clearAll     = ()  => setSelBlockIds([]);

  // Who has access to a block
  const blockClients = b => db.block_releases
    .filter(r => r.block_id === b.id)
    .map(r => ({ ...r, client: db.clients.find(c => c.id === r.client_id), liberador: db.users.find(u => u.id === r.liberado_por) }))
    .filter(r => r.client);
  const blockHistory = b => (db.access_history||[])
    .filter(r => r.block_id === b.id)
    .map(r => ({ ...r,
      client:    db.clients.find(c => c.id === r.client_id),
      liberador: db.users.find(u => u.id === r.liberado_por),
      revogador: db.users.find(u => u.id === r.revogado_por),
    }))
    .filter(r => r.client)
    .sort((a,b) => new Date(b.data_revogacao) - new Date(a.data_revogacao));

  // Release blocks to clients
  const release = () => {
    if (!selBlockIds.length)  { toast("Selecione ao menos um bloco.", "err");   return; }
    if (!selClientIds.length) { toast("Selecione ao menos um cliente.", "err"); return; }
    const now = new Date().toISOString();
    let added = 0;
    setDb(prev => {
      const existing = prev.block_releases;
      const newRels  = [];
      selBlockIds.forEach(bid => {
        selClientIds.forEach(cid => {
          if (!existing.find(r => r.block_id===bid && r.client_id===cid)) {
            newRels.push({ id: nid([...existing,...newRels]), block_id: bid, client_id: cid,
              liberado_por: currentUser.id, data_liberacao: now });
            added++;
          }
        });
      });
      return { ...prev, block_releases: [...existing, ...newRels] };
    });
    toast(`${added} permissão(ões) concedida(s)!`, "ok");
    setSelBlockIds([]); setSelClientIds([]); setStep(1);
  };

  // Revoke single permission
  const revoke = (block_id, client_id) => {
    setDb(prev => {
      const rel = prev.block_releases.find(r => r.block_id===block_id && r.client_id===client_id);
      const histEntry = rel ? {
        id: nid(prev.access_history||[]),
        block_id, client_id,
        liberado_por:    rel.liberado_por,
        data_liberacao:  rel.data_liberacao,
        revogado_por:    currentUser.id,
        data_revogacao:  new Date().toISOString(),
      } : null;
      return {
        ...prev,
        block_releases:  prev.block_releases.filter(r => !(r.block_id===block_id && r.client_id===client_id)),
        access_history:  histEntry ? [...(prev.access_history||[]), histEntry] : (prev.access_history||[]),
      };
    });
    toast("Acesso removido e registrado no histórico.", "ok");
  };

  // Revoke all for a block
  const revokeAll = block_id => {
    setDb(prev => {
      const toRevoke = prev.block_releases.filter(r => r.block_id === block_id);
      const now = new Date().toISOString();
      const newHist = toRevoke.map((rel, i) => ({
        id: nid([...(prev.access_history||[])]) + i,
        block_id:       rel.block_id,
        client_id:      rel.client_id,
        liberado_por:   rel.liberado_por,
        data_liberacao: rel.data_liberacao,
        revogado_por:   currentUser.id,
        data_revogacao: now,
      }));
      return {
        ...prev,
        block_releases: prev.block_releases.filter(r => r.block_id !== block_id),
        access_history: [...(prev.access_history||[]), ...newHist],
      };
    });
    setViewBlock(null);
    toast("Todos os acessos removidos e registrados.", "ok");
  };

  const selectedBlockObjs  = availBlocks.filter(b => selBlockIds.includes(b.id));
  const selectedClientObjs = db.clients.filter(c => selClientIds.includes(c.id));

  return (
    <div>
      <div className="ph">
        <div className="ptit">Liberar Catálogo</div>
        <div className="psub">Controle quais clientes visualizam cada bloco</div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{marginBottom:24}}>
        {[["share","Liberar Acesso"],["history","Histórico de Permissões"]].map(([k,l])=>(
          <div key={k} className={"tab"+(tab===k?" on":"")} onClick={()=>{setTab(k);setStep(1);setSelBlockIds([]);setSelClientIds([]);}}>{l}</div>
        ))}
      </div>

      {/* ══ TAB: SHARE ══ */}
      {tab==="share" && (<>

        {/* Step indicator */}
        <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:24}}>
          {[["1","Selecionar Blocos"],["2","Selecionar Clientes"],["3","Confirmar"]].map(([n,l],i)=>(
            <div key={n} style={{display:"flex",alignItems:"center",flex:i<2?1:"auto"}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <div style={{width:32,height:32,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,transition:"all .2s",
                  background: parseInt(n)<=step ? "var(--sap6)" : "var(--fog)",
                  color:      parseInt(n)<=step ? "#fff"        : "var(--mist)"}}>
                  {parseInt(n)<step ? <svg width="14" height="14" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg> : n}
                </div>
                <span style={{fontSize:10,fontWeight:600,color:parseInt(n)<=step?"var(--sap6)":"var(--mist)",whiteSpace:"nowrap"}}>{l}</span>
              </div>
              {i<2 && <div style={{flex:1,height:2,background:parseInt(n)<step?"var(--sap5)":"var(--fog)",marginBottom:20,transition:"background .3s"}}/>}
            </div>
          ))}
        </div>

        {/* STEP 1 — Select Blocks */}
        {step===1 && (
          <div>
            <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:16,alignItems:"center"}}>
              <div style={{position:"relative",flex:1,minWidth:200}}>
                <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",color:"var(--mist)",pointerEvents:"none"}}><Icon n="srch" s={14}/></span>
                <input className="fc" style={{paddingLeft:34}} value={srchB} onChange={e=>setSrchB(e.target.value)} placeholder="Buscar bloco, material ou pedreira..."/>
              </div>
              <select className="fc" style={{width:"auto",fontSize:13,padding:"9px 12px"}} value={fMat} onChange={e=>setFMat(e.target.value)}>
                <option value="">Todos os materiais</option>
                {mats.map(m=><option key={m} value={m}>{m}</option>)}
              </select>
              <button className="btn bo bsm" onClick={selectAll}>Selecionar todos</button>
              {selBlockIds.length>0&&<button className="btn bo bsm" onClick={clearAll}><Icon n="x" s={13}/> Limpar</button>}
            </div>

            {/* Block list — table view for density */}
            <div className="card" style={{marginBottom:16}}>
              <div className="tw">
                <table>
                  <thead><tr><th style={{width:40}}></th><th>Código</th><th>Material</th><th>Pedreira</th><th>Classificação</th><th>Vol. Líq.</th><th>Status</th><th>Clientes c/ acesso</th></tr></thead>
                  <tbody>
                    {shownBlocks.length===0
                      ? <tr><td colSpan={8} style={{textAlign:"center",padding:32,color:"var(--mist)"}}>Nenhum bloco encontrado</td></tr>
                      : shownBlocks.map(b => {
                          const q       = quarries.find(q=>q.id===b.quarry_id);
                          const sc      = SC[b.status];
                          const isSel   = selBlockIds.includes(b.id);
                          const clients = blockClients(b);
                          return (
                            <tr key={b.id} style={{cursor:"pointer",background:isSel?"var(--sap0)":undefined}} onClick={()=>toggleBlock(b.id)}>
                              <td onClick={e=>e.stopPropagation()}>
                                <div onClick={()=>toggleBlock(b.id)} style={{width:20,height:20,borderRadius:5,border:"2px solid",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",margin:"auto",transition:"all .15s",
                                  borderColor:isSel?"var(--sap6)":"var(--fog)",background:isSel?"var(--sap6)":"transparent"}}>
                                  {isSel&&<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                </div>
                              </td>
                              <td style={{fontWeight:700,color:"var(--sap7)",fontSize:12}}>{b.code}</td>
                              <td style={{fontSize:12}}>{b.material}</td>
                              <td style={{fontSize:12,color:"var(--mist)"}}>{q?.name||"—"}</td>
                              <td><span className="bdg" style={{background:sc+"18",color:sc}}>{b.classification}</span></td>
                              <td style={{fontWeight:600}}>{b.net_volume} m³</td>
                              <td><span className="bdg" style={{background:sc+"18",color:sc,fontSize:10}}>{SL[b.status]}</span></td>
                              <td>
                                {clients.length===0
                                  ? <span style={{fontSize:11,color:"var(--mist)"}}>Nenhum</span>
                                  : <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                                      {clients.slice(0,3).map(r=>(
                                        <span key={r.client_id} style={{fontSize:10,background:"var(--b0)",color:"var(--sap7)",padding:"2px 8px",borderRadius:10,fontWeight:600,border:"1px solid var(--sap2)"}}>
                                          {r.client?.name}
                                        </span>
                                      ))}
                                      {clients.length>3&&<span style={{fontSize:10,color:"var(--mist)"}}>+{clients.length-3}</span>}
                                    </div>
                                }
                              </td>
                            </tr>
                          );
                        })
                    }
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:13,color:"var(--mist)"}}>{selBlockIds.length} bloco(s) selecionado(s)</span>
              <button className="btn bb" onClick={()=>setStep(2)} disabled={!selBlockIds.length}>
                Próximo — Selecionar Clientes <Icon n="chevr" s={15}/>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 — Select Clients */}
        {step===2 && (
          <div>
            {/* Selected blocks summary */}
            <div style={{background:"var(--sap0)",border:"1px solid var(--sap2)",borderRadius:"var(--r-md)",padding:"12px 16px",marginBottom:20}}>
              <div style={{fontSize:11,fontWeight:700,color:"var(--sap6)",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Blocos selecionados</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {selectedBlockObjs.map(b=>(
                  <span key={b.id} style={{fontSize:12,background:"#fff",border:"1px solid var(--sap2)",borderRadius:6,padding:"3px 10px",fontWeight:600,color:"var(--sap7)"}}>
                    {b.code} · {b.material}
                  </span>
                ))}
              </div>
            </div>

            <div style={{marginBottom:14}}>
              <div style={{position:"relative",marginBottom:12}}>
                <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",color:"var(--mist)",pointerEvents:"none"}}><Icon n="srch" s={14}/></span>
                <input className="fc" style={{paddingLeft:34}} value={srchC} onChange={e=>setSrchC(e.target.value)} placeholder="Buscar cliente por nome..."/>
              </div>
            </div>

            {shownClients.length===0
              ? <div className="es"><Icon n="user" s={40}/><div className="estit" style={{marginTop:8}}>Nenhum cliente cadastrado</div></div>
              : <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
                  {shownClients.map(c => {
                    const isSel = selClientIds.includes(c.id);
                    // Count how many selected blocks this client already has
                    const jaTemAcesso = selBlockIds.filter(bid => db.block_releases.find(r=>r.block_id===bid&&r.client_id===c.id)).length;
                    return (
                      <div key={c.id} onClick={()=>toggleClient(c.id)}
                        style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderRadius:"var(--r-md)",border:"1.5px solid",cursor:"pointer",transition:"all .15s",
                          borderColor:isSel?"var(--sap6)":"var(--fog)",background:isSel?"var(--sap0)":"var(--card)"}}>
                        <div style={{width:20,height:20,borderRadius:5,border:"2px solid",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s",
                          borderColor:isSel?"var(--sap6)":"var(--fog)",background:isSel?"var(--sap6)":"transparent"}}>
                          {isSel&&<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>
                        <div style={{width:40,height:40,borderRadius:10,background:"linear-gradient(135deg,var(--sap7),var(--sap5))",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:14,flexShrink:0}}>
                          {c.name.split(" ").map(w=>w[0]).slice(0,2).join("")}
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:700,fontSize:14,color:"var(--ink2)"}}>{c.name}</div>
                          <div style={{fontSize:12,color:"var(--mist)",marginTop:1}}>{c.country} {c.phone&&`· ${c.phone}`}</div>
                        </div>
                        {jaTemAcesso>0&&(
                          <span style={{fontSize:11,background:"#fef3c7",color:"#92400e",padding:"3px 10px",borderRadius:10,fontWeight:600,flexShrink:0}}>
                            {jaTemAcesso}/{selBlockIds.length} já tem acesso
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
            }

            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexWrap:"wrap"}}>
              <button className="btn bo" onClick={()=>setStep(1)}><Icon n="chevl" s={15}/> Voltar</button>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                <span style={{fontSize:13,color:"var(--mist)"}}>{selClientIds.length} cliente(s) selecionado(s)</span>
                <button className="btn bb" onClick={()=>setStep(3)} disabled={!selClientIds.length}>
                  Revisar <Icon n="chevr" s={15}/>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 — Confirm */}
        {step===3 && (
          <div>
            <div style={{background:"var(--card)",border:"1px solid var(--bdr)",borderRadius:"var(--r-lg)",overflow:"hidden",marginBottom:20}}>
              <div style={{padding:"16px 20px",background:"var(--sap0)",borderBottom:"1px solid var(--sap1)"}}>
                <div style={{fontFamily:"Sora,sans-serif",fontWeight:700,fontSize:16,color:"var(--sap8)"}}>Resumo da liberação</div>
                <div style={{fontSize:13,color:"var(--mist)",marginTop:2}}>Confirme os acessos que serão concedidos</div>
              </div>
              <div style={{padding:"16px 20px"}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                  <div>
                    <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:"var(--sap6)",marginBottom:8}}>{selectedBlockObjs.length} Bloco(s)</div>
                    <div style={{display:"flex",flexDirection:"column",gap:4}}>
                      {selectedBlockObjs.map(b=>(
                        <div key={b.id} style={{fontSize:12,padding:"6px 10px",background:"var(--haze)",borderRadius:6,fontWeight:600}}>
                          {b.code} — {b.material}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:"var(--ok)",marginBottom:8}}>{selectedClientObjs.length} Cliente(s)</div>
                    <div style={{display:"flex",flexDirection:"column",gap:4}}>
                      {selectedClientObjs.map(c=>(
                        <div key={c.id} style={{fontSize:12,padding:"6px 10px",background:"var(--haze)",borderRadius:6,fontWeight:600}}>
                          {c.name}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{marginTop:14,padding:"10px 14px",background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:8,fontSize:12,color:"#166534"}}>
                  ✅ Serão criadas até <strong>{selectedBlockObjs.length * selectedClientObjs.length}</strong> permissão(ões). Acessos já existentes serão ignorados.
                </div>
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}>
              <button className="btn bo" onClick={()=>setStep(2)}><Icon n="chevl" s={15}/> Voltar</button>
              <button className="btn bg" onClick={release}><Icon n="check" s={15}/> Liberar Acesso ao Catálogo</button>
            </div>
          </div>
        )}
      </>)}

      {/* ══ TAB: HISTORY ══ */}
      {tab==="history" && (
        <div>
          {availBlocks.length===0
            ? <div className="es"><Icon n="book" s={40}/><div className="estit">Nenhum bloco cadastrado</div></div>
            : <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {availBlocks.map(b => {
                  const q       = quarries.find(q=>q.id===b.quarry_id);
                  const clients = blockClients(b);
                  const sc      = SC[b.status];
                  return (
                    <div key={b.id} className="card">
                      <div className="cb">
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
                          <div style={{flex:1}}>
                            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                              <div style={{fontWeight:700,fontSize:14,color:"var(--ink2)"}}>{b.code}</div>
                              <span style={{fontSize:11,fontWeight:600,color:"var(--sap7)"}}>{b.material}</span>
                              <span className="bdg" style={{background:sc+"18",color:sc,fontSize:9}}>{SL[b.status]}</span>
                            </div>
                            <div style={{fontSize:12,color:"var(--mist)",marginBottom:10}}>{q?.name||"—"} · {b.net_volume} m³ · {b.classification}</div>

                            {clients.length===0
                              ? <span style={{fontSize:12,color:"var(--mist)",fontStyle:"italic"}}>Nenhum cliente com acesso ativo</span>
                              : <div style={{display:"flex",flexDirection:"column",gap:6}}>
                                  {clients.map(r=>(
                                    <div key={r.client_id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:"var(--haze)",borderRadius:8,border:"1px solid var(--bdr2)"}}>
                                      <div style={{width:30,height:30,borderRadius:8,background:"linear-gradient(135deg,var(--sap7),var(--sap5))",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:11,flexShrink:0}}>
                                        {r.client?.name.split(" ").map(w=>w[0]).slice(0,2).join("")}
                                      </div>
                                      <div style={{flex:1}}>
                                        <div style={{fontSize:13,fontWeight:600,color:"var(--ink2)"}}>{r.client?.name}</div>
                                        <div style={{fontSize:11,color:"var(--mist)"}}>
                                          Liberado por: <strong>{r.liberador?.name||"—"}</strong> · {r.data_liberacao ? fdate(r.data_liberacao) : "—"}
                                        </div>
                                      </div>
                                      <button className="btn br bxs" onClick={()=>revoke(b.id,r.client_id)} title="Remover acesso">
                                        <Icon n="x" s={12}/>
                                      </button>
                                    </div>
                                  ))}
                                </div>
                            }
                            {/* ── Revoked history ── */}
                            {blockHistory(b).length > 0 && (
                              <div style={{marginTop:10}}>
                                <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:"var(--mist)",marginBottom:6,display:"flex",alignItems:"center",gap:6}}>
                                  <div style={{height:1,flex:1,background:"var(--fog)"}}/>
                                  <span>Acessos revogados</span>
                                  <div style={{height:1,flex:1,background:"var(--fog)"}}/>
                                </div>
                                <div style={{display:"flex",flexDirection:"column",gap:5}}>
                                  {blockHistory(b).map((r,i)=>(
                                    <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:"#fff5f5",borderRadius:8,border:"1px solid #fecaca"}}>
                                      <div style={{width:30,height:30,borderRadius:8,background:"var(--fog)",color:"var(--mist)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:11,flexShrink:0}}>
                                        {r.client?.name.split(" ").map(w=>w[0]).slice(0,2).join("")}
                                      </div>
                                      <div style={{flex:1}}>
                                        <div style={{fontSize:13,fontWeight:600,color:"var(--slate)",textDecoration:"line-through"}}>{r.client?.name}</div>
                                        <div style={{fontSize:10,color:"var(--mist)",marginTop:1}}>
                                          ✅ Liberado: {r.data_liberacao?fdate(r.data_liberacao):"—"} · <strong>{r.liberador?.name||"—"}</strong>
                                        </div>
                                        <div style={{fontSize:10,color:"var(--err)",marginTop:1}}>
                                          🚫 Revogado: {fdate(r.data_revogacao)} · <strong>{r.revogador?.name||"—"}</strong>
                                        </div>
                                      </div>
                                      <span style={{fontSize:9,fontWeight:700,background:"#fee2e2",color:"var(--err)",padding:"2px 8px",borderRadius:10,textTransform:"uppercase",letterSpacing:.5,flexShrink:0}}>Revogado</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          {clients.length>0&&(
                            <button className="btn br bsm" onClick={()=>revokeAll(b.id)}>
                              <Icon n="trash" s={13}/> Remover todos
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
          }
        </div>
      )}

      {/* Block detail modal */}
      {viewBlock && (
        <div className="mo" onClick={()=>setViewBlock(null)}>
          <div className="md" style={{maxWidth:480}} onClick={e=>e.stopPropagation()}>
            <div className="mhead"><div className="mtit">Acessos — {viewBlock.code}</div><button className="btn bo bic bsm" onClick={()=>setViewBlock(null)}><Icon n="x" s={16}/></button></div>
            <div className="mbody">
              {blockClients(viewBlock).map(r=>(
                <div key={r.client_id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:"1px solid var(--bdr2)"}}>
                  <div style={{flex:1}}><div style={{fontWeight:600}}>{r.client?.name}</div><div style={{fontSize:11,color:"var(--mist)"}}>{fdate(r.data_liberacao)}</div></div>
                  <button className="btn br bxs" onClick={()=>{revoke(viewBlock.id,r.client_id);setViewBlock(null);}}>Remover</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ─── CLIENT PURCHASES ────────────────────────
function ClientPurchases({currentUser, quarries, db}) {
  const [selBlock,   setSelBlock]   = useState(null);
  const [srch,       setSrch]       = useState("");
  const [soMes,      setSoMes]      = useState(false);
  const [filtroMes,  setFiltroMes]  = useState("");
  const [dtInicio,   setDtInicio]   = useState("");
  const [dtFim,      setDtFim]      = useState("");
  const [modoFiltro, setModoFiltro] = useState("mes");

  const now      = new Date();
  const mesAtual = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
  const hojeFmt  = now.toISOString().slice(0,10);

  const myId     = parseInt(currentUser.id);
  const myClient = db.clients.find(c => c.user_id === myId);
  const ordCid   = myClient?.id || myId;

  const mySales      = db.sales.filter(s => Number(s.client_id) === Number(ordCid));
  const purchasedIds = mySales.flatMap(s => s.block_ids || (s.block_id ? [s.block_id] : []));
  const allPurchased = db.blocks.filter(b => purchasedIds.includes(b.id));
  const getSale      = b => mySales.find(s => (s.block_ids||[s.block_id]).includes(b.id));

  // Available months for select
  const mesesDisp = [...new Set(
    allPurchased.map(b => {
      const s = getSale(b);
      if (!s) return null;
      const d = new Date(s.created_at);
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    }).filter(Boolean)
  )].sort().reverse();

  const mesFiltro = soMes ? mesAtual : filtroMes;

  // Apply filters
  const shown = allPurchased.filter(b => {
    const s = getSale(b);
    if (s) {
      const saleDate = new Date(s.created_at);
      if (modoFiltro === "mes" && mesFiltro) {
        const bm = `${saleDate.getFullYear()}-${String(saleDate.getMonth()+1).padStart(2,"0")}`;
        if (bm !== mesFiltro) return false;
      }
      if (modoFiltro === "intervalo") {
        if (dtInicio && saleDate < new Date(dtInicio + "T00:00:00")) return false;
        if (dtFim    && saleDate > new Date(dtFim    + "T23:59:59")) return false;
      }
    }
    if (srch) {
      const q    = quarries.find(q => q.id === b.quarry_id);
      const term = srch.toLowerCase();
      if (!b.code.toLowerCase().includes(term) &&
          !b.material.toLowerCase().includes(term) &&
          !(q?.name||"").toLowerCase().includes(term)) return false;
    }
    return true;
  });

  const fmtMesLabel = ym => {
    if (!ym) return "todos os períodos";
    const [y,m] = ym.split("-");
    return ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][parseInt(m)-1]+"/"+y;
  };
  const fmtDtLabel   = d  => d ? new Date(d+"T12:00:00").toLocaleDateString("pt-BR") : "";
  const periodoLabel = () => {
    if (modoFiltro==="mes")       return mesFiltro ? fmtMesLabel(mesFiltro) : "todos os períodos";
    if (modoFiltro==="intervalo") return (dtInicio||dtFim) ? `${fmtDtLabel(dtInicio)||"início"} → ${fmtDtLabel(dtFim)||"hoje"}` : "todos os períodos";
    return "todos os períodos";
  };
  const temFiltro    = soMes || filtroMes || (modoFiltro==="intervalo"&&(dtInicio||dtFim)) || srch;
  const limparFiltros= () => { setSoMes(false); setFiltroMes(""); setDtInicio(""); setDtFim(""); setSrch(""); };

  // Totals — filtered
  const totalUSD = shown.filter(b=>b.currency==="USD").reduce((a,b)=>a+b.total_value,0);
  const totalBRL = shown.reduce((a,b) => {
    const s = getSale(b); const dr = s?.dollar_rate||0;
    return a + (b.currency==="USD"&&dr>0 ? b.total_value*dr : b.currency==="BRL" ? b.total_value : 0);
  }, 0);

  return (
    <div>
      <div className="ph">
        <div className="ptit">Minhas Compras</div>
        <div className="psub">{shown.length} bloco(s) · {periodoLabel()}</div>
      </div>

      {/* Summary cards */}
      {allPurchased.length > 0 && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:24}}>
          <div className="sc" style={{"--sc-accent":"#ef4444"}}>
            <div className="sico" style={{background:"#fee2e2"}}><Icon n="cube" s={20} c="#dc2626"/></div>
            <div className="sval">{shown.length}</div>
            <div className="slbl2">Blocos no período</div>
          </div>
          <div className="sc" style={{"--sc-accent":"#10b981"}}>
            <div className="sico" style={{background:"#dcfce7"}}><Icon n="money" s={20} c="#059669"/></div>
            <div className="sval" style={{fontSize:18}}>{money(totalBRL,"BRL")}</div>
            <div className="slbl2">Total em R$</div>
          </div>
          <div className="sc" style={{"--sc-accent":"#2563eb"}}>
            <div className="sico" style={{background:"#dbeafe"}}><Icon n="globe" s={20} c="#2563eb"/></div>
            <div className="sval" style={{fontSize:18}}>{money(totalUSD,"USD")}</div>
            <div className="slbl2">Total em US$</div>
          </div>
        </div>
      )}

      {/* ── Filtros ── */}
      {allPurchased.length > 0 && (
        <div className="card" style={{marginBottom:20}}>
          <div className="cb">
            <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",marginBottom:14}}>
              <div style={{display:"flex",background:"var(--haze)",borderRadius:"var(--r-sm)",padding:3,gap:2,flexShrink:0}}>
                {[["mes","Por Mês"],["intervalo","Intervalo de Datas"]].map(([v,l])=>(
                  <button key={v} onClick={()=>{setModoFiltro(v);setSoMes(false);setFiltroMes("");setDtInicio("");setDtFim("");}}
                    style={{padding:"5px 14px",borderRadius:6,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,transition:"all .15s",
                      background:modoFiltro===v?"var(--sap6)":"transparent",color:modoFiltro===v?"#fff":"var(--mist)"}}>
                    {l}
                  </button>
                ))}
              </div>
              {modoFiltro==="mes" && (
                <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>{setSoMes(v=>!v);if(!soMes)setFiltroMes("");}}>
                  <div style={{width:20,height:20,borderRadius:5,border:"2px solid",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s",
                    borderColor:soMes?"var(--sap6)":"var(--fog)",background:soMes?"var(--sap6)":"transparent"}}>
                    {soMes&&<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <span style={{fontSize:13,fontWeight:600,color:"var(--slate)"}}>Mês atual <span style={{fontSize:11,fontWeight:400,color:"var(--mist)"}}>({fmtMesLabel(mesAtual)})</span></span>
                </div>
              )}
            </div>
            <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
              {modoFiltro==="mes" && (
                <div style={{display:"flex",alignItems:"center",gap:8,flex:"1 1 200px"}}>
                  <Icon n="hist" s={15} c="var(--mist)"/>
                  <select className="fc" style={{fontSize:13,padding:"8px 12px",flex:1}} value={filtroMes} disabled={soMes} onChange={e=>setFiltroMes(e.target.value)}>
                    <option value="">Todos os períodos</option>
                    {mesesDisp.map(ym=>{
                      const [y,m]=ym.split("-");
                      return <option key={ym} value={ym}>{["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"][parseInt(m)-1]} / {y}</option>;
                    })}
                  </select>
                </div>
              )}
              {modoFiltro==="intervalo" && (<>
                <div style={{display:"flex",alignItems:"center",gap:8,flex:"1 1 160px"}}>
                  <label style={{fontSize:11,fontWeight:700,color:"var(--mist)",textTransform:"uppercase",whiteSpace:"nowrap"}}>De</label>
                  <input type="date" className="fc" style={{fontSize:13,padding:"8px 12px",flex:1}} value={dtInicio} max={dtFim||hojeFmt} onChange={e=>setDtInicio(e.target.value)}/>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8,flex:"1 1 160px"}}>
                  <label style={{fontSize:11,fontWeight:700,color:"var(--mist)",textTransform:"uppercase",whiteSpace:"nowrap"}}>Até</label>
                  <input type="date" className="fc" style={{fontSize:13,padding:"8px 12px",flex:1}} value={dtFim} min={dtInicio} max={hojeFmt} onChange={e=>setDtFim(e.target.value)}/>
                </div>
                {(dtInicio||dtFim)&&<div style={{fontSize:12,color:"var(--sap6)",fontWeight:600,whiteSpace:"nowrap"}}>📅 {fmtDtLabel(dtInicio)||"início"} → {fmtDtLabel(dtFim)||"hoje"}</div>}
              </>)}
              <div style={{position:"relative",flex:"1 1 180px",minWidth:160}}>
                <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",color:"var(--mist)",pointerEvents:"none"}}><Icon n="srch" s={14}/></span>
                <input className="fc" style={{paddingLeft:34,fontSize:13,padding:"8px 12px 8px 34px"}} value={srch} onChange={e=>setSrch(e.target.value)} placeholder="Buscar código, material ou pedreira..."/>
              </div>
              {temFiltro&&<button className="btn bo bsm" onClick={limparFiltros}><Icon n="x" s={13}/> Limpar</button>}
            </div>
          </div>
        </div>
      )}

      {allPurchased.length === 0
        ? <div className="es">
            <div style={{marginBottom:16,opacity:.3}}><Icon n="hist" s={48}/></div>
            <div className="estit">Nenhuma compra realizada ainda</div>
            <div style={{fontSize:13,color:"var(--mist)",marginTop:8}}>Seus blocos comprados aparecerão aqui.</div>
          </div>
        : <>
            {/* Cards grid */}
            <div className="bgg">
              {shown.map(b => {
                const q    = quarries.find(q => q.id === b.quarry_id);
                const sale = getSale(b);
                const dr   = sale?.dollar_rate || 0;
                const tBRL = b.currency==="USD"&&dr>0 ? parseFloat((b.total_value*dr).toFixed(2)) : b.currency==="BRL" ? b.total_value : 0;
                const pay  = db.payment_methods.find(p => p.id === sale?.payment_method_id);
                return (
                  <div key={b.id} className="bk" style={{cursor:"pointer"}} onClick={()=>setSelBlock(b)}>
                    {/* Image */}
                    <div className="bkimg" style={{position:"relative"}}>
                      {b.photos?.length > 0
                        ? <img src={b.photos[0]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                        : <Icon n="mtn" s={44} c="#94a3b8"/>
                      }

                      {/* Classification badge */}
                      <div style={{
                        position:"absolute",bottom:10,left:12,
                        background:"rgba(10,15,30,.7)",backdropFilter:"blur(8px)",
                        color:"#fff",fontSize:10,fontWeight:800,
                        padding:"3px 8px",borderRadius:6,letterSpacing:1,
                      }}>{b.classification}</div>
                    </div>

                    {/* Body */}
                    <div className="bkbd">
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:2}}>
          <div className="bkcd">{b.code}</div>
          {b.sys_code&&<div style={{fontSize:9,fontWeight:700,letterSpacing:1,color:"var(--mist)",background:"var(--haze)",padding:"1px 6px",borderRadius:4,border:"1px solid var(--bdr2)"}}>{b.sys_code}</div>}
        </div>
                      <div className="bkmt">{b.material}</div>
                      <div className="bkqr"><Icon n="mtn" s={10} c="var(--mist)"/>{q?.name||"—"}</div>
        {b.status==="reserved"&&b.reserved_for&&(()=>{
          const rc=clients?.find(c=>c.id===b.reserved_for);
          return rc?(
            <div style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"var(--sap6)",fontWeight:600,marginTop:2}}>
              <Icon n="user" s={10} c="var(--sap6)"/>
              <span>Reservado para {rc.name}</span>
            </div>
          ):null;
        })()}
                      <div className="bkmeta">
                        <div>
                          <div className="bkvol">{b.net_volume} m³ líquido</div>
                          <div style={{fontSize:10,color:"var(--mist)"}}>{b.net_l}×{b.net_h}×{b.net_w} m</div>
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div className="bkprice">{money(b.total_value,b.currency)}</div>
                          {tBRL>0&&b.currency==="USD"&&<div style={{fontSize:10,color:"var(--ok)",fontWeight:600}}>{money(tBRL,"BRL")}</div>}
                        </div>
                      </div>
                    </div>

                    {/* Sale info footer */}
                    <div style={{padding:"8px 16px",background:"var(--haze)",borderTop:"1px solid var(--bdr2)",display:"flex",justifyContent:"space-between",fontSize:11,color:"var(--mist)"}}>
                      <span>{pay?.name||"—"}</span>
                      <span>{sale?fdateS(sale.created_at):"—"}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detail modal */}
            {selBlock&&(()=>{
              const sale = getSale(selBlock);
              const q    = quarries.find(q=>q.id===selBlock.quarry_id);
              const dr   = sale?.dollar_rate||0;
              const tBRL = selBlock.currency==="USD"&&dr>0 ? parseFloat((selBlock.total_value*dr).toFixed(2)) : selBlock.currency==="BRL" ? selBlock.total_value : 0;
              const pay  = db.payment_methods.find(p=>p.id===sale?.payment_method_id);
              return(
                <div className="mo" onClick={()=>setSelBlock(null)}>
                  <div className="md" onClick={e=>e.stopPropagation()}>
                    <div className="mhead">
                      <div>
                        <div style={{fontSize:10,color:"var(--ok)",fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>✓ Comprado · #{sale?String(sale.id).padStart(4,"0"):"—"}</div>
                        <div className="mtit">{selBlock.code} — {selBlock.material}</div>
                      </div>
                      <button className="btn bo bic bsm" onClick={()=>setSelBlock(null)}><Icon n="x" s={16}/></button>
                    </div>
                    <div className="mbody">
                      {selBlock.photos?.length>0&&(
                        <div style={{borderRadius:"var(--r-md)",overflow:"hidden",marginBottom:20,height:200}}>
                          <img src={selBlock.photos[0]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                        </div>
                      )}
                      <div className="ds">
                        <div className="dstit">Dados da Compra</div>
                        <div className="dgrid">
                          <div className="di"><div className="dilbl">Data</div><div className="dival" style={{fontSize:13}}>{sale?fdate(sale.created_at):"—"}</div></div>
                          <div className="di"><div className="dilbl">Pedido Nº</div><div className="dival">#{sale?String(sale.id).padStart(4,"0"):"—"}</div></div>
                          <div className="di"><div className="dilbl">Pagamento</div><div className="dival" style={{fontSize:12}}>{pay?.name||"—"}</div></div>
                          <div className="di"><div className="dilbl">Status</div><div className="dival" style={{fontSize:12,color:"var(--ok)",fontWeight:700}}>✓ Comprado</div></div>
                        </div>
                      </div>
                      <div className="ds">
                        <div className="dstit">Valores</div>
                        <div className="dgrid">
                          <div className="di"><div className="dilbl">Valor</div><div className="dival" style={{color:"var(--sap7)"}}>{money(selBlock.total_value,selBlock.currency)}</div></div>
                          {dr>0&&<div className="di"><div className="dilbl">Cotação USD</div><div className="dival" style={{color:"var(--warn)"}}>R$ {Number(dr).toLocaleString("pt-BR",{minimumFractionDigits:2})}</div></div>}
                          {tBRL>0&&<div className="di" style={{gridColumn:"span 2",background:"var(--sap0)",border:"1px solid var(--sap2)"}}>
                            <div className="dilbl">Total em R$</div>
                            <div className="dival" style={{fontSize:22,color:"var(--sap7)"}}>{money(tBRL,"BRL")}</div>
                          </div>}
                        </div>
                      </div>
                      <div className="ds">
                        <div className="dstit">Bloco</div>
                        <div className="dgrid">
                          <div className="di"><div className="dilbl">Pedreira</div><div className="dival" style={{fontSize:13}}>{q?.name||"—"}</div></div>
                          <div className="di"><div className="dilbl">Classificação</div><div className="dival">{selBlock.classification}</div></div>
                          <div className="di"><div className="dilbl">Vol. Líquido</div><div className="dival">{selBlock.net_volume} m³</div></div>
                          <div className="di"><div className="dilbl">Dimensões</div><div className="dival" style={{fontSize:11}}>{selBlock.net_l}×{selBlock.net_h}×{selBlock.net_w} m</div></div>
                          <div className="di"><div className="dilbl">Preço/m³</div><div className="dival" style={{fontSize:13}}>{selBlock.currency==="USD"?"US$":"R$"} {Number(selBlock.price_m3).toLocaleString("pt-BR")}</div></div>
                        </div>
                      </div>
                      {pay?.details&&<div style={{fontSize:12,background:"var(--haze)",padding:"10px 14px",borderRadius:"var(--r-sm)",border:"1px solid var(--bdr2)"}}>
                        <div style={{fontWeight:700,marginBottom:3,color:"var(--slate)"}}>Dados para Pagamento:</div>
                        {pay.details}
                      </div>}
                    </div>
                    <div className="mfoot">
                      <button className="btn bo" onClick={()=>setSelBlock(null)}>Fechar</button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </>
      }
    </div>
  );
}


// ─── CATALOG ─────────────────────────────────
function Cat({currentUser, quarries, db, setDb, toast, globalDollarRate}) {
  const [sel,      setSel]      = useState(null);  // block detail
  const [msg,      setMsg]      = useState("");
  const [srch,     setSrch]     = useState("");
  const [favOnly,  setFavOnly]  = useState(false);
  const [buyBlks,  setBuyBlks]  = useState(null);  // blocks selected for purchase
  const [selBIds,  setSelBIds]  = useState([]);    // multi-select IDs
  const [buyStep,  setBuyStep]  = useState(1);     // 1=review, 2=payment, 3=romaneio
  const [payId,    setPayId]    = useState("");
  const [buyObs,   setBuyObs]   = useState("");
  const [buyData,  setBuyData]  = useState(null);
  const [dollarRate,setDollarRate]=useState(globalDollarRate||"");
  const [loadingRate,setLoadingRate]=useState(false);

  const myId     = parseInt(currentUser.id);
  const myClient = db.clients.find(c => c.user_id === myId);
  const ordCid   = myClient?.id || myId;

  const rels   = myClient
    ? db.block_releases.filter(r => Number(r.client_id)===Number(myClient.id)).map(r=>r.block_id)
    : [];
  const favIds = myClient
    ? (db.favorites||[]).filter(f=>Number(f.client_id)===Number(myClient.id)).map(f=>f.block_id)
    : [];

  const allShown = db.blocks.filter(b =>
    rels.includes(b.id) && b.status!=="sold" &&
    (!srch || b.code.toLowerCase().includes(srch.toLowerCase()) ||
              b.material.toLowerCase().includes(srch.toLowerCase()))
  );
  const shown = favOnly ? allShown.filter(b=>favIds.includes(b.id)) : allShown;

  const toggleFav = (b,e) => {
    e.stopPropagation();
    const cid    = myClient?.id || myId;
    const exists = (db.favorites||[]).find(f=>Number(f.client_id)===Number(cid) && f.block_id===b.id);
    if (exists)
      setDb(prev=>({...prev, favorites:(prev.favorites||[]).filter(f=>!(Number(f.client_id)===Number(cid)&&f.block_id===b.id))}));
    else
      setDb(prev=>({...prev, favorites:[...(prev.favorites||[]),{id:nid(prev.favorites||[]),client_id:cid,block_id:b.id}]}));
  };

  // ── Interest order (single block) ──────────────────────
  const sendOrder = b => {
    if (db.orders.find(o=>o.block_id===b.id&&o.client_id===ordCid&&o.status==="pending")) {
      toast("Pedido já enviado.","err"); return;
    }
    const now  = new Date().toISOString();
    const msg2 = `Pedido de interesse de ${currentUser.name} (${myClient?.name||""}) para bloco ${b.code} — ${b.material}`;
    // Notify owner + all foremen + all sellers
    const notifTargets = db.users.filter(u=>u.role==="owner"||u.role==="foreman"||u.role==="seller");
    setDb(prev=>({
      ...prev,
      orders: [...prev.orders, {id:nid(prev.orders), block_id:b.id, client_id:ordCid, status:"pending", message:msg, created_at:now}],
      notifications: [
        ...prev.notifications,
        ...notifTargets.map((u,i)=>({id:nid(prev.notifications)+i, user_id:u.id, message:msg2, read:false, created_at:now, type:"order"})),
      ],
    }));
    setSel(null); setMsg(""); toast("Pedido de interesse enviado!","ok");
  };

  // ── Multi-select for purchase ───────────────────────────
  const toggleSelect = (b,e) => {
    e.stopPropagation();
    setSelBIds(prev=>prev.includes(b.id)?prev.filter(x=>x!==b.id):[...prev,b.id]);
  };
  const clearSel = () => setSelBIds([]);

  // ── Open purchase modal ─────────────────────────────────
  const openBuy  = blocks => { setBuyBlks(blocks); setBuyStep(2); setPayId(""); setBuyObs(""); setBuyData(null); setDollarRate(""); };
  const closeBuy = () => { setBuyBlks(null); setBuyStep(1); setPayId(""); setBuyObs(""); setBuyData(null); setDollarRate(""); clearSel(); };

  const fetchDollar = async () => {
    setLoadingRate(true);
    const attempts = [
      { url: "https://api.allorigins.win/get?url=" + encodeURIComponent("https://economia.awesomeapi.com.br/json/last/USD-BRL"),
        parse: d => JSON.parse(d.contents).USDBRL.bid },
      { url: "https://corsproxy.io/?url=" + encodeURIComponent("https://economia.awesomeapi.com.br/json/last/USD-BRL"),
        parse: d => d.USDBRL.bid },
      { url: "https://fxapi.app/api/latest?base=USD&symbols=BRL",
        parse: d => d.rates.BRL },
      { url: "https://api.frankfurter.dev/v2/latest?base=USD&symbols=BRL",
        parse: d => d.rates.BRL },
    ];
    for (const {url, parse} of attempts) {
      try {
        const res = await fetch(url, {signal: AbortSignal.timeout(5000)});
        if (!res.ok) continue;
        const data = await res.json();
        const val  = parse(data);
        if (val && !isNaN(parseFloat(val))) {
          const rate = parseFloat(val).toFixed(2);
          setDollarRate(rate);
          toast(`Cotação USD: R$ ${rate}`, "ok");
          setLoadingRate(false);
          return;
        }
      } catch { continue; }
    }
    toast("Não foi possível buscar. Informe manualmente.", "err");
    setLoadingRate(false);
  };

  // ── Confirm purchase ────────────────────────────────────
  const confirmBuy = () => {
    if (!payId) { toast("Selecione a forma de pagamento.", "err"); return; }
    const hasUSD = buyBlks.some(b => b.currency === "USD");
    if (hasUSD && !dollarRate) { toast("Informe a cotação do dólar.", "err"); return; }
    const now     = new Date().toISOString();
    const dr      = parseFloat(dollarRate) || 0;
    const payMeth = db.payment_methods.find(p => p.id === parseInt(payId));

    // Calculate per-block BRL totals
    const blockTotals = buyBlks.map(b => ({
      ...b,
      totalBRL: b.currency==="USD" && dr>0 ? parseFloat((b.total_value*dr).toFixed(2))
              : b.currency==="BRL" ? b.total_value : 0,
    }));
    const grandTotalBRL = blockTotals.reduce((a,b)=>a+b.totalBRL,0);
    const grandTotalUSD = buyBlks.filter(b=>b.currency==="USD").reduce((a,b)=>a+b.total_value,0);
    const matLabel      = [...new Set(buyBlks.map(b=>b.material))].join(" / ");

    // Build sale record (same structure as SaleModal)
    const saleId = nid(db.sales);
    const sd = {
      id:                 saleId,
      block_ids:          buyBlks.map(b=>b.id),
      seller_id:          currentUser.id,   // client acts as buyer
      client_id:          ordCid,
      payment_method_id:  parseInt(payId),
      dollar_rate:        dr || null,
      total_brl:          grandTotalBRL,
      total_usd:          grandTotalUSD,
      obs:                buyObs,
      created_at:         now,
    };
    const bd = { id: saleId, blocks: buyBlks, blockTotals, client: myClient, payMeth, matLabel, dr, grandTotalBRL, obs: buyObs, created_at: now };

    // Notify all staff
    const targets = db.users.filter(u=>u.role==="owner"||u.role==="foreman"||u.role==="seller");
    const blkList = buyBlks.map(b=>b.code).join(", ");
    const notifMsg= `✅ VENDA pelo cliente ${myClient?.name||currentUser.name}: ${blkList} — ${money(grandTotalBRL,"BRL")}`;

    setDb(prev=>({
      ...prev,
      blocks:        prev.blocks.map(x => buyBlks.find(b=>b.id===x.id) ? {...x, status:"sold"} : x),
      sales:         [...prev.sales, sd],
      notifications: [
        ...prev.notifications,
        ...targets.map((u,i)=>({id:nid(prev.notifications)+i, user_id:u.id, message:notifMsg, read:false, created_at:now, type:"sale"})),
      ],
    }));
    setBuyData(bd);
    setBuyStep(3);
    toast("Compra realizada com sucesso!", "ok");
  };

  // ── WhatsApp contact ────────────────────────────────────
  const contactSeller = b => {
    const seller = db.users.find(u=>(u.role==="seller"||u.role==="owner")&&u.phone);
    if (!seller?.phone){toast("Nenhum contato disponível.","err");return;}
    const txt = `Olá! Tenho interesse no bloco *${b.code}* — ${b.material} (${b.net_volume} m³). Podemos conversar?`;
    window.open(`https://wa.me/${seller.phone.replace(/\D/g,"")}?text=${encodeURIComponent(txt)}`,"_blank");
  };

  const isSellable = b => b.status==="available"||b.status==="reserved";

  const acts = b => {
    const isFav     = favIds.includes(b.id);
    const hasPedido = db.orders.find(o=>o.block_id===b.id&&o.client_id===ordCid&&o.status==="pending");
    const isSel     = selBIds.includes(b.id);
    return (<>
      {/* Favorite */}
      <button className="btn bo bxs" onClick={e=>toggleFav(b,e)}
        style={{color:isFav?"#f59e0b":"var(--mist)",borderColor:isFav?"#fbbf24":"var(--fog)"}}>
        {isFav?"★":"☆"}
      </button>
      {/* Interest */}
      {hasPedido
        ? <span style={{fontSize:11,color:"var(--warn)",fontWeight:700}}>⏳ Interesse enviado</span>
        : <button className="btn bo bxs" onClick={e=>{e.stopPropagation();setSel(b);}}><Icon n="heart" s={11}/> Interesse</button>
      }
      {/* Select for purchase */}
      {isSellable(b) && (
        <button className={`btn bxs ${isSel?"bb":"bo"}`} onClick={e=>toggleSelect(b,e)}>
          {isSel?"☑ Selecionado":"☐ Comprar"}
        </button>
      )}
      {/* Quick buy single */}
      {isSellable(b) && (
        <button className="btn bg bxs" onClick={e=>{e.stopPropagation();openBuy([b]);}}>
          <Icon n="cart" s={11}/> Comprar
        </button>
      )}
      {/* WhatsApp */}
      <button className="btn bwa bxs" onClick={e=>{e.stopPropagation();contactSeller(b);}} title="Contato WhatsApp">
        <Icon n="wa" s={11}/>
      </button>
    </>);
  };

  const mFoot = sel ? (
    db.orders.find(o=>o.block_id===sel.id&&o.client_id===ordCid&&o.status==="pending")
      ? <span style={{color:"var(--warn)",fontWeight:700}}>⏳ Pedido já enviado</span>
      : <div style={{display:"flex",flexDirection:"column",gap:10,width:"100%"}}>
          <textarea className="fc" placeholder="Mensagem opcional..." value={msg} onChange={e=>setMsg(e.target.value)} style={{minHeight:56}}/>
          <button className="btn bb" onClick={()=>sendOrder(sel)}><Icon n="heart" s={15}/> Enviar Pedido de Interesse</button>
        </div>
  ):null;

  const selBlockObjs = allShown.filter(b=>selBIds.includes(b.id));

  return (
    <div>
      <div className="ph">
        <div className="ptit">Meu Catálogo</div>
        <div className="psub">{allShown.length} bloco(s) disponíveis{favIds.length>0?` · ${favIds.length} favorito(s)`:""}</div>
      </div>

      {/* Multi-select bar */}
      {selBIds.length>0&&(
        <div style={{display:"flex",alignItems:"center",gap:10,background:"var(--sap0)",border:"1px solid var(--sap2)",borderRadius:"var(--r-md)",padding:"10px 16px",marginBottom:16,flexWrap:"wrap"}}>
          <span style={{fontSize:13,fontWeight:600,color:"var(--sap7)"}}>{selBIds.length} bloco(s) selecionado(s)</span>
          <button className="btn bg bsm" onClick={()=>openBuy(selBlockObjs)}><Icon n="cart" s={14}/> Comprar Selecionados</button>
          <button className="btn bo bsm" onClick={clearSel}><Icon n="x" s={13}/> Limpar</button>
        </div>
      )}

      <div className="fb">
        <div style={{position:"relative",flex:1,minWidth:200}}>
          <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",color:"var(--mist)",pointerEvents:"none"}}><Icon n="srch" s={14}/></span>
          <input className="fc" style={{paddingLeft:34}} value={srch} onChange={e=>setSrch(e.target.value)} placeholder="Buscar por código ou material..."/>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",padding:"9px 14px",borderRadius:"var(--r-sm)",border:"1.5px solid",transition:"all .15s",
          borderColor:favOnly?"#fbbf24":"var(--fog)",background:favOnly?"#fffbeb":"transparent"}}
          onClick={()=>setFavOnly(v=>!v)}>
          <span style={{fontSize:16,lineHeight:1}}>{favOnly?"★":"☆"}</span>
          <span style={{fontSize:13,fontWeight:600,color:favOnly?"#92400e":"var(--mist)"}}>Favoritos</span>
          {favIds.length>0&&<span style={{fontSize:11,background:"#fbbf24",color:"#fff",borderRadius:10,padding:"1px 7px",fontWeight:700}}>{favIds.length}</span>}
        </div>
      </div>

      {shown.length===0
        ?<div className="es">
          <div style={{marginBottom:16,opacity:.3}}><Icon n="book" s={48}/></div>
          <div className="estit">{favOnly?"Nenhum bloco favoritado":"Nenhum bloco liberado para você"}</div>
          {!favOnly&&<div style={{fontSize:13,color:"var(--mist)",marginTop:8}}>Aguarde o catálogo ser compartilhado pelo seu fornecedor.</div>}
        </div>
        :<div className="bgg">{shown.map(b=>(
          <div key={b.id} style={{position:"relative"}}>
            {selBIds.includes(b.id)&&<div style={{position:"absolute",inset:0,zIndex:2,borderRadius:"var(--r-xl)",border:"2px solid var(--sap6)",boxShadow:"0 0 0 4px rgba(37,99,235,.15)",pointerEvents:"none"}}/>}
            <BCard b={b} quarries={quarries} clients={db.clients} onView={setSel} acts={acts}/>
          </div>
        ))}</div>
      }

      {/* Interest modal */}
      <BModal b={sel} quarries={quarries} users={db.users} currentUser={currentUser} db={db} onClose={()=>{setSel(null);setMsg("");}} footer={mFoot}/>

      {/* ── PURCHASE MODAL ── */}
      {buyBlks&&(
        <div className="mo" onClick={e=>e.target===e.currentTarget&&closeBuy()}>
          <div className="md md-wide">
            <div className="mhead">
              <div>
                <div style={{fontSize:10,color:"var(--sap6)",fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>
                  {buyBlks.length} bloco(s) · {buyBlks.map(b=>b.code).join(", ")}
                </div>
                <div className="mtit">
                  {buyStep===2?"Pagamento e Cotação":"Comprovante de Venda"}
                </div>
              </div>
              <button className="btn bo bic bsm" onClick={closeBuy}><Icon n="x" s={16}/></button>
            </div>
            <div className="mbody">

              {/* STEP 1 — Review */}
              {buyStep===1&&(
                <div>
                  <div style={{marginBottom:20}}>
                    {buyBlks.map(b=>{
                      const q=quarries.find(q=>q.id===b.quarry_id);
                      const sc=SC[b.status];
                      return(
                        <div key={b.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:"1px solid var(--bdr2)",gap:12,flexWrap:"wrap"}}>
                          <div style={{flex:1}}>
                            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                              <span style={{fontWeight:700,fontSize:14,color:"var(--sap7)"}}>{b.code}</span>
                              <span className="bdg" style={{background:sc+"18",color:sc,fontSize:9}}>{SL[b.status]}</span>
                            </div>
                            <div style={{fontWeight:600,fontSize:13}}>{b.material} · {b.classification}</div>
                            <div style={{fontSize:12,color:"var(--mist)",marginTop:2}}>
                              {q?.name||"—"} · {b.net_volume} m³ · {b.net_l}×{b.net_h}×{b.net_w} m
                            </div>
                          </div>
                          <div style={{textAlign:"right"}}>
                            <div style={{fontFamily:"Sora,sans-serif",fontWeight:800,fontSize:18,color:"var(--sap7)"}}>{money(b.total_value,b.currency)}</div>
                            <div style={{fontSize:11,color:"var(--mist)"}}>{b.currency==="USD"?"US$":"R$"} {Number(b.price_m3).toLocaleString("pt-BR")}/m³</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{background:"var(--sap0)",border:"1px solid var(--sap2)",borderRadius:"var(--r-md)",padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:13,fontWeight:600,color:"var(--sap8)"}}>Total estimado</span>
                    <div style={{textAlign:"right"}}>
                      {[...new Set(buyBlks.map(b=>b.currency))].map(cur=>(
                        <div key={cur} style={{fontFamily:"Sora,sans-serif",fontWeight:800,fontSize:20,color:"var(--sap7)"}}>
                          {money(buyBlks.filter(b=>b.currency===cur).reduce((a,b)=>a+b.total_value,0),cur)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 — Payment + Dollar */}
              {buyStep===2&&(
                <div>
                  {/* Block summary */}
                  <div style={{background:"var(--sap0)",border:"1px solid var(--sap2)",borderRadius:"var(--r-md)",padding:"12px 16px",marginBottom:20}}>
                    <div style={{fontSize:11,fontWeight:700,color:"var(--sap6)",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Blocos selecionados</div>
                    {buyBlks.map(b=>{
                      const q=quarries.find(q=>q.id===b.quarry_id);
                      return(
                        <div key={b.id} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid var(--sap2)",gap:8}}>
                          <div>
                            <span style={{fontWeight:700,fontSize:13,color:"var(--sap8)"}}>{b.code}</span>
                            <span style={{fontSize:12,color:"var(--slate)",marginLeft:8}}>{b.material} · {b.net_volume} m³</span>
                          </div>
                          <span style={{fontWeight:700,fontSize:13,color:"var(--sap7)"}}>{money(b.total_value,b.currency)}</span>
                        </div>
                      );
                    })}
                  </div>
                  {/* Dollar rate — only if any block is USD */}
                  {buyBlks.some(b=>b.currency==="USD")&&(
                    <div className="fg">
                      <label className="fl">Cotação do Dólar (R$) *</label>
                      <div style={{display:"flex",gap:10,alignItems:"center"}}>
                        <input className="fc" type="number" step="0.01" value={dollarRate}
                          onChange={e=>setDollarRate(e.target.value)}
                          placeholder="Ex: 5.85" style={{flex:1}}/>
                        <button className="btn bb bsm" onClick={fetchDollar} disabled={loadingRate} style={{flexShrink:0}}>
                          <Icon n="globe" s={14}/>{loadingRate?"Buscando...":"Cotação Atual"}
                        </button>
                      </div>
                      {dollarRate&&(
                        <div style={{marginTop:6,fontSize:13,color:"var(--ok)",fontWeight:600}}>
                          Total em R$: {money(buyBlks.filter(b=>b.currency==="USD").reduce((a,b)=>a+b.total_value,0) * parseFloat(dollarRate),"BRL")}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="fg">
                    <label className="fl">Forma de Pagamento *</label>
                    {db.payment_methods.length===0
                      ?<div style={{fontSize:13,color:"var(--mist)",padding:16,background:"var(--haze)",borderRadius:"var(--r-sm)",textAlign:"center"}}>Nenhuma forma de pagamento cadastrada pelo fornecedor.</div>
                      :<div style={{display:"flex",flexDirection:"column",gap:8}}>
                        {db.payment_methods.map(p=>(
                          <div key={p.id} onClick={()=>setPayId(String(p.id))}
                            style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",borderRadius:"var(--r-md)",border:"1.5px solid",cursor:"pointer",transition:"all .15s",
                              borderColor:payId===String(p.id)?"var(--sap6)":"var(--fog)",background:payId===String(p.id)?"var(--sap0)":"var(--card)"}}>
                            <div style={{width:20,height:20,borderRadius:"50%",border:"2px solid",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s",
                              borderColor:payId===String(p.id)?"var(--sap6)":"var(--fog)",background:payId===String(p.id)?"var(--sap6)":"transparent"}}>
                              {payId===String(p.id)&&<div style={{width:8,height:8,borderRadius:"50%",background:"#fff"}}/>}
                            </div>
                            <div style={{flex:1}}>
                              <div style={{fontWeight:700,fontSize:14}}>{p.name}</div>
                              {p.details&&<div style={{fontSize:12,color:"var(--mist)",marginTop:2}}>{p.details}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    }
                  </div>
                  <div className="fg">
                    <label className="fl">Observações (opcional)</label>
                    <textarea className="fc" value={buyObs} onChange={e=>setBuyObs(e.target.value)} placeholder="Condições especiais, prazo desejado..." style={{minHeight:64}}/>
                  </div>
                </div>
              )}

              {/* STEP 3 — Receipt */}
              {buyStep===3&&buyData&&(()=>{
                const payMeth    = db.payment_methods.find(p=>p.id===parseInt(payId));
                const btotals    = buyData.blockTotals || buyData.blocks.map(b=>({...b,totalBRL:b.total_value}));
                const grandBRL   = buyData.grandTotalBRL || btotals.reduce((a,b)=>a+b.totalBRL,0);
                const dr         = buyData.dr || 0;
                return(
                  <div>
                    {/* Receipt header */}
                    <div style={{background:"linear-gradient(135deg,#0f172a,#1e3a8a)",borderRadius:"var(--r-md)",padding:"20px 24px",color:"#fff",marginBottom:20}}>
                      <div style={{fontFamily:"Sora,sans-serif",fontWeight:800,fontSize:18,marginBottom:4}}>Stone <span style={{color:"var(--sap4)"}}>Block</span></div>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
                        <div>
                          <div style={{fontSize:12,opacity:.7,marginBottom:2}}>COMPROVANTE DE VENDA</div>
                          <div style={{fontFamily:"Sora,sans-serif",fontWeight:800,fontSize:22}}>#{String(buyData.id).padStart(4,"0")}</div>
                        </div>
                        <div style={{textAlign:"right",fontSize:12,opacity:.8}}>
                          <div>{fdate(buyData.created_at)}</div>
                          <div style={{marginTop:2}}>{buyData.client?.name||currentUser.name}</div>
                        </div>
                      </div>
                    </div>

                    {/* Blocks table */}
                    <div style={{marginBottom:16}}>
                      <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:"var(--sap6)",marginBottom:8}}>Blocos Vendidos</div>
                      {btotals.map(b=>{
                        const q=quarries.find(q=>q.id===b.quarry_id);
                        return(
                          <div key={b.id} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid var(--bdr2)",gap:12,flexWrap:"wrap"}}>
                            <div>
                              <div style={{fontWeight:700,fontSize:13,color:"var(--sap7)"}}>{b.code} — {b.material}</div>
                              <div style={{fontSize:11,color:"var(--mist)",marginTop:2}}>{q?.name||"—"} · {b.net_volume} m³ · Class. {b.classification}</div>
                              <div style={{fontSize:11,color:"var(--mist)"}}>{b.net_l}×{b.net_h}×{b.net_w} m · {b.currency==="USD"?"US$":"R$"} {Number(b.price_m3).toLocaleString("pt-BR")}/m³</div>
                            </div>
                            <div style={{textAlign:"right"}}>
                              <div style={{fontFamily:"Sora,sans-serif",fontWeight:800,fontSize:15,color:"var(--sap7)"}}>{money(b.total_value,b.currency)}</div>
                              {b.currency==="USD"&&dr>0&&<div style={{fontSize:11,color:"var(--ok)",fontWeight:600}}>{money(b.totalBRL,"BRL")}</div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Totals */}
                    <div style={{background:"var(--sap0)",border:"1px solid var(--sap2)",borderRadius:"var(--r-sm)",padding:"12px 16px",marginBottom:16}}>
                      {dr>0&&btotals.some(b=>b.currency==="USD")&&(
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:12,color:"var(--mist)"}}>
                          <span>Cotação USD utilizada</span>
                          <span style={{fontWeight:600}}>R$ {Number(dr).toFixed(2)}</span>
                        </div>
                      )}
                      {[...new Set(btotals.map(b=>b.currency))].map(cur=>(
                        <div key={cur} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                          <span style={{fontSize:13,fontWeight:600,color:"var(--sap8)"}}>Total {cur}</span>
                          <span style={{fontFamily:"Sora,sans-serif",fontWeight:800,fontSize:18,color:"var(--sap7)"}}>{money(btotals.filter(b=>b.currency===cur).reduce((a,b)=>a+b.total_value,0),cur)}</span>
                        </div>
                      ))}
                      {grandBRL>0&&btotals.some(b=>b.currency==="USD")&&(
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:"1px solid var(--sap2)",paddingTop:8,marginTop:4}}>
                          <span style={{fontSize:13,fontWeight:700,color:"var(--ok)"}}>Total em R$</span>
                          <span style={{fontFamily:"Sora,sans-serif",fontWeight:800,fontSize:20,color:"var(--ok)"}}>{money(grandBRL,"BRL")}</span>
                        </div>
                      )}
                    </div>

                    {/* Payment + obs */}
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                      <div className="di"><div className="dilbl">Forma de Pagamento</div><div className="dival" style={{fontSize:13}}>{payMeth?.name||"—"}</div></div>
                      <div className="di"><div className="dilbl">Status</div><div className="dival" style={{fontSize:13,color:"var(--warn)"}}>⏳ Aguardando confirmação</div></div>
                    </div>
                    {buyObs&&<div style={{fontSize:13,background:"var(--haze)",padding:"10px 14px",borderRadius:"var(--r-sm)",borderLeft:"3px solid var(--sap2)",fontStyle:"italic",color:"var(--slate)"}}>{buyObs}</div>}

                    <div style={{marginTop:14,fontSize:12,color:"var(--mist)",textAlign:"center"}}>
                      Seu pedido foi enviado ao vendedor e aguarda confirmação. Você será notificado.
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="mfoot">

              {buyStep===2&&<>
                <button className="btn bo" onClick={closeBuy}>Cancelar</button>
                <button className="btn bg" onClick={confirmBuy} disabled={!payId}><Icon n="check" s={15}/> Confirmar Compra</button>
              </>}
              {buyStep===3&&<>
                <button className="btn bo" onClick={closeBuy}>Fechar</button>
                <button className="btn bwa" onClick={()=>{
                  const payMeth=db.payment_methods.find(p=>p.id===parseInt(payId));
                  const seller=db.users.find(u=>(u.role==="seller"||u.role==="owner")&&u.phone);
                  if(!seller?.phone){toast("Nenhum contato disponível.","err");return;}
                  const lines=["🪨 *STONE BLOCK — PEDIDO DE COMPRA*",
                    `Nº #${String(buyData.id).padStart(4,"0")} · ${fdateS(buyData.created_at)}`,
                    `Cliente: *${buyData.client?.name||currentUser.name}*`,"",
                    "*BLOCOS SOLICITADOS:*",
                    ...buyData.blocks.map(b=>`• ${b.code} — ${b.material} (${b.net_volume}m³) · ${money(b.total_value,b.currency)}`),
                    "","*PAGAMENTO:*",`${payMeth?.name||"—"} — ${payMeth?.details||""}`,
                    ...(buyObs?["","*Obs:* "+buyObs]:[]),
                    "","_Aguardando confirmação do vendedor._"];
                  window.open(`https://wa.me/${seller.phone.replace(/\D/g,"")}?text=${encodeURIComponent(lines.join("\n"))}`,"_blank");
                }}>
                  <Icon n="wa" s={15}/> Enviar pelo WhatsApp
                </button>
              </>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ─── ORDERS ──────────────────────────────────
function Ords({currentUser,db,setDb,toast}) {
  const [tab,setTab]=useState("pending");
  const filtered=db.orders.filter(o=>(currentUser.role==="client"?o.client_id===currentUser.id:true)&&o.status===tab);
  const pCount=db.orders.filter(o=>o.status==="pending"&&(currentUser.role!=="client"||o.client_id===currentUser.id)).length;
  const approve=o=>{const bCode=db.blocks.find(b=>b.id===o.block_id)?.code;setDb(prev=>({...prev,orders:prev.orders.map(x=>x.id===o.id?{...x,status:"approved"}:x),blocks:prev.blocks.map(b=>b.id===o.block_id?{...b,status:"reserved"}:b),notifications:[...prev.notifications,{id:nid(prev.notifications),user_id:o.client_id,message:`Pedido aprovado: ${bCode}`,read:false,created_at:new Date().toISOString(),type:"approved"}]}));toast("Aprovado!","ok");};
  const reject=o=>{const bCode=db.blocks.find(b=>b.id===o.block_id)?.code;setDb(prev=>({...prev,orders:prev.orders.map(x=>x.id===o.id?{...x,status:"rejected"}:x),notifications:[...prev.notifications,{id:nid(prev.notifications),user_id:o.client_id,message:`Pedido recusado: ${bCode}`,read:false,created_at:new Date().toISOString(),type:"rejected"}]}));toast("Recusado.","");};
  return(
    <div>
      <div className="ph"><div className="ptit">{currentUser.role==="client"?"Meus Pedidos":"Pedidos"}</div></div>
      <div className="tabs">{[["pending","Pendentes"],["approved","Aprovados"],["rejected","Recusados"]].map(([k,l])=><div key={k} className={"tab"+(tab===k?" on":"")} onClick={()=>setTab(k)}>{l}{k==="pending"&&pCount>0&&<span className="obadge" style={{marginLeft:6}}>{pCount}</span>}</div>)}</div>
      {filtered.length===0?<div className="es"><div style={{marginBottom:16,opacity:.3}}><Icon n="cart" s={48}/></div><div className="estit">Nenhum pedido</div></div>
      :<div style={{display:"flex",flexDirection:"column",gap:12}}>{filtered.map(o=>{const b=db.blocks.find(x=>x.id===o.block_id);const cli=db.users.find(u=>u.id===o.client_id);const ss={pending:["var(--amb)","#fef3c7"],approved:["#16a34a","#dcfce7"],rejected:["var(--red)","#fee2e2"]}[o.status];return(<div key={o.id} className="card"><div className="cb"><div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:12}}><div style={{flex:1}}><div style={{fontWeight:700,fontSize:15}}>{b?.code} — {b?.material}</div>{currentUser.role!=="client"&&<div style={{fontSize:13,color:"var(--mut)",marginTop:2}}>Cliente: <strong>{cli?.name}</strong></div>}<div style={{fontSize:12,color:"var(--mut)",marginTop:2}}>{fdate(o.created_at)}</div>{o.message&&<div style={{fontSize:13,marginTop:8,background:"var(--g0)",padding:"8px 12px",borderRadius:8,borderLeft:"3px solid var(--b2)",fontStyle:"italic"}}>"{o.message}"</div>}<div style={{marginTop:8,fontWeight:700,color:"var(--b6)"}}>{money(b?.total_value||0,b?.currency)}</div></div>{tab==="pending"&&currentUser.role!=="client"?<div style={{display:"flex",gap:8}}><button className="btn bg bsm" onClick={()=>approve(o)}><Icon n="check" s={14}/> Aprovar</button><button className="btn br bsm" onClick={()=>reject(o)}><Icon n="x" s={14}/> Recusar</button></div>:<span className="bdg" style={{background:ss[1],color:ss[0]}}>{tab==="pending"?"Aguardando":tab==="approved"?"Aprovado":"Recusado"}</span>}</div></div></div>);})}</div>}
    </div>
  );
}

// ─── NOTIFICATIONS ───────────────────────────
function Notifs({currentUser,db,setDb,onClose}) {
  const notifs=[...db.notifications].filter(n=>n.user_id===currentUser.id).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
  const mark=id=>setDb(p=>({...p,notifications:p.notifications.map(n=>n.id===id?{...n,read:true}:n)}));
  const markAll=()=>setDb(p=>({...p,notifications:p.notifications.map(n=>n.user_id===currentUser.id?{...n,read:true}:n)}));
  const ti={new_block:"cube",order:"cart",sale:"money",approved:"check",rejected:"x"};
  const tc={new_block:"var(--b5)",order:"var(--amb)",sale:"var(--grn)",approved:"var(--grn)",rejected:"var(--red)"};
  return(
    <div className="np">
      <div className="nphead">Notificações<div style={{display:"flex",gap:8}}><button className="btn bo bxs" onClick={markAll}>Ler tudo</button><button className="btn bo bxs bic" onClick={onClose}><Icon n="x" s={13}/></button></div></div>
      {notifs.length===0?<div style={{padding:32,textAlign:"center",color:"var(--mut)"}}><Icon n="bell" s={28} c="var(--g3)"/><div style={{marginTop:8,fontSize:13}}>Sem notificações</div></div>
      :notifs.map(n=>(
        <div key={n.id} className={"npitem"+(n.read?"":" unread")} onClick={()=>mark(n.id)}>
          <div style={{display:"flex",gap:10}}>
            <div style={{width:30,height:30,borderRadius:"50%",background:"var(--b0)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon n={ti[n.type]||"bell"} s={13} c={tc[n.type]||"var(--g4)"}/></div>
            <div><div className="npmsg">{n.message}</div><div className="nptime">{fdate(n.created_at)}</div></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── SALES HISTORY ───────────────────────────
function SalesHist({currentUser, db}) {
  const [dtInicio, setDtInicio] = useState("");
  const [dtFim,    setDtFim]    = useState("");
  const [srch,     setSrch]     = useState("");
  const [fSeller,  setFSeller]  = useState("");

  const allSales = db.sales.filter(s => currentUser.role==="owner" || s.seller_id===currentUser.id);

  // Filtered sales
  const sales = allSales.filter(s => {
    const d = new Date(s.created_at);
    if (dtInicio && d < new Date(dtInicio+"T00:00:00")) return false;
    if (dtFim    && d > new Date(dtFim+"T23:59:59"))   return false;
    if (fSeller  && String(s.seller_id) !== fSeller)   return false;
    if (srch) {
      const blocks = (s.block_ids||[s.block_id]).map(id=>db.blocks.find(b=>b.id===id));
      const cli    = db.clients.find(c=>c.id===s.client_id);
      const term   = srch.toLowerCase();
      const match  = blocks.some(b=>b?.code?.toLowerCase().includes(term)||b?.material?.toLowerCase().includes(term))
                  || (cli?.name||"").toLowerCase().includes(term);
      if (!match) return false;
    }
    return true;
  });

  const tBRL    = sales.reduce((a,s)=>a+(s.total_brl||0),0);
  const tUSD    = sales.reduce((a,s)=>a+(s.total_usd||0),0);
  const tQtd    = sales.reduce((a,s)=>a+((s.block_ids||[s.block_id]).filter(Boolean).length),0);
  const hojeFmt = new Date().toISOString().slice(0,10);
  const sellers = db.users.filter(u=>u.role==="seller");
  const temFiltro = dtInicio||dtFim||srch||fSeller;
  const fmtDt   = d => d ? new Date(d+"T12:00:00").toLocaleDateString("pt-BR") : "";

  // ── Last 12 months chart data ──────────────────────────────────────
  const now    = new Date();
  const months = Array.from({length:12},(_,i)=>{
    const d = new Date(now.getFullYear(), now.getMonth()-11+i, 1);
    return {
      key:   `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`,
      label: ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][d.getMonth()],
      year:  d.getFullYear(),
      brl:   0, usd:0, qty:0,
    };
  });
  allSales.forEach(s => {
    const d   = new Date(s.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    const m   = months.find(m=>m.key===key);
    if (m) { m.brl += s.total_brl||0; m.usd += s.total_usd||0; m.qty++; }
  });
  const maxBRL = Math.max(...months.map(m=>m.brl), 1);
  const hasData = months.some(m=>m.brl>0||m.usd>0);

  return (
    <div>
      <div className="ph">
        <div className="ptit">Histórico de Vendas</div>
        <div className="psub">
          {temFiltro
            ? `${sales.length} venda(s) filtrada(s)${dtInicio||dtFim?" · "+fmtDt(dtInicio||"")+(dtFim?" → "+fmtDt(dtFim):""):""}`
            : `${allSales.length} venda(s) no total`}
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:22}}>
        <div className="sc" style={{"--sc-accent":"#10b981"}}>
          <div className="sico" style={{background:"#dcfce7"}}><Icon n="trend" s={20} c="#059669"/></div>
          <div className="sval" style={{fontSize:18}}>{money(tBRL,"BRL")}</div>
          <div className="slbl2">Total R$ {temFiltro?"(filtro)":"(geral)"}</div>
        </div>
        <div className="sc" style={{"--sc-accent":"#2563eb"}}>
          <div className="sico" style={{background:"#dbeafe"}}><Icon n="globe" s={20} c="#2563eb"/></div>
          <div className="sval" style={{fontSize:18}}>{money(tUSD,"USD")}</div>
          <div className="slbl2">Total US$ {temFiltro?"(filtro)":"(geral)"}</div>
        </div>
        <div className="sc" style={{"--sc-accent":"#8b5cf6"}}>
          <div className="sico" style={{background:"#ede9fe"}}><Icon n="cube" s={20} c="#7c3aed"/></div>
          <div className="sval">{tQtd}</div>
          <div className="slbl2">Blocos vendidos</div>
        </div>
      </div>

      {/* ── Last 12 months chart ── */}
      {hasData && (
        <div className="card" style={{marginBottom:22}}>
          <div className="chead">
            <div className="ctit">Vendas — últimos 12 meses (R$)</div>
          </div>
          <div className="cb">
            {/* Labels de valor acima das barras */}
            <div style={{display:"flex",gap:6,padding:"0 4px",marginBottom:2}}>
              {months.map(m=>(
                <div key={m.key+"lbl"} style={{flex:1,textAlign:"center",fontSize:8,fontWeight:600,color:"var(--mist)",height:14,lineHeight:"14px",overflow:"hidden"}}>
                  {m.brl>0?(m.brl>=1000?`${(m.brl/1000).toFixed(0)}k`:Math.round(m.brl)):""}
                </div>
              ))}
            </div>
            {/* Barras */}
            <div style={{display:"flex",alignItems:"flex-end",gap:6,height:100,padding:"0 4px"}}>
              {months.map(m=>{
                const h    = m.brl>0 ? Math.max(6, Math.round((m.brl/maxBRL)*96)) : 0;
                const isNow= m.key===`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
                return(
                  <div key={m.key} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",height:"100%"}}>
                    <div style={{
                      width:"100%",height:`${h}px`,
                      background: isNow
                        ? "linear-gradient(to top,var(--sap7),var(--sap5))"
                        : h>0 ? "linear-gradient(to top,var(--sap2),var(--sap1))" : "transparent",
                      borderRadius:"4px 4px 0 0",
                      transition:"height .3s var(--ease)",
                      border: h>0?(isNow?"1px solid var(--sap5)":"1px solid var(--fog)"):"none",
                    }}/>
                  </div>
                );
              })}
            </div>
            {/* Qtd de vendas + rótulo do mês */}
            <div style={{display:"flex",gap:6,padding:"4px 4px 0"}}>
              {months.map(m=>{
                const isNow=m.key===`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
                return(
                  <div key={m.key+"bot"} style={{flex:1,textAlign:"center"}}>
                    {m.qty>0&&<div style={{fontSize:8,fontWeight:700,color:isNow?"var(--sap6)":"var(--mist)"}}>{m.qty}v</div>}
                    <div style={{fontSize:9,color:isNow?"var(--sap6)":"var(--mist)",fontWeight:isNow?700:400,lineHeight:1.3}}>
                      {m.label}<br/><span style={{fontSize:7,opacity:.6}}>{m.year}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{display:"flex",gap:16,marginTop:10,justifyContent:"flex-end"}}>
              <div style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:"var(--mist)"}}>
                <div style={{width:10,height:10,borderRadius:2,background:"linear-gradient(var(--sap7),var(--sap5))"}}/>
                Mês atual
              </div>
              <div style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:"var(--mist)"}}>
                <div style={{width:10,height:10,borderRadius:2,background:"var(--sap2)"}}/>
                Meses anteriores
              </div>
              <div style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:"var(--mist)"}}>
                <span style={{fontWeight:700}}>3v</span> = qtd. de vendas
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Filters ── */}
      <div className="card" style={{marginBottom:20}}>
        <div className="cb" style={{padding:"14px 18px"}}>
          <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,flex:"1 1 150px"}}>
              <label style={{fontSize:11,fontWeight:700,color:"var(--mist)",textTransform:"uppercase",letterSpacing:.5,whiteSpace:"nowrap"}}>De</label>
              <input type="date" className="fc" style={{fontSize:13,padding:"7px 10px",flex:1}} value={dtInicio} max={dtFim||hojeFmt} onChange={e=>setDtInicio(e.target.value)}/>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8,flex:"1 1 150px"}}>
              <label style={{fontSize:11,fontWeight:700,color:"var(--mist)",textTransform:"uppercase",letterSpacing:.5,whiteSpace:"nowrap"}}>Até</label>
              <input type="date" className="fc" style={{fontSize:13,padding:"7px 10px",flex:1}} value={dtFim} min={dtInicio} max={hojeFmt} onChange={e=>setDtFim(e.target.value)}/>
            </div>
            {currentUser.role==="owner" && sellers.length>0 && (
              <select className="fc" style={{fontSize:13,padding:"7px 10px",flex:"1 1 160px"}} value={fSeller} onChange={e=>setFSeller(e.target.value)}>
                <option value="">Todos os vendedores</option>
                {sellers.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            )}
            <div style={{position:"relative",flex:"1 1 160px"}}>
              <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"var(--mist)",pointerEvents:"none"}}><Icon n="srch" s={13}/></span>
              <input className="fc" style={{paddingLeft:30,fontSize:13,padding:"7px 10px 7px 30px"}} value={srch} onChange={e=>setSrch(e.target.value)} placeholder="Buscar bloco, material, cliente..."/>
            </div>
            {temFiltro&&<button className="btn bo bsm" onClick={()=>{setDtInicio("");setDtFim("");setSrch("");setFSeller("");}}><Icon n="x" s={13}/> Limpar</button>}
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      {sales.length===0
        ? <div className="es"><div style={{marginBottom:16,opacity:.3}}><Icon n="hist" s={48}/></div><div className="estit">{temFiltro?"Nenhuma venda no período":"Nenhuma venda registrada"}</div></div>
        : <div className="card"><div className="tw"><table>
            <thead><tr>
              <th>Nº</th><th>Blocos</th>
              {currentUser.role==="owner"&&<th>Vendedor</th>}
              <th>Cliente</th><th>Pagamento</th>
              <th>Total R$</th><th>Total US$</th>
              <th>Dólar</th><th>Data</th>
            </tr></thead>
            <tbody>
              {[...sales].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).map(s=>{
                const blkIds = s.block_ids||[s.block_id];
                const blocks = blkIds.map(id=>db.blocks.find(b=>b.id===id)).filter(Boolean);
                const seller = db.users.find(u=>u.id===s.seller_id);
                const cli    = db.clients.find(c=>c.id===s.client_id);
                const pay    = db.payment_methods.find(p=>p.id===s.payment_method_id);
                return(
                  <tr key={s.id}>
                    <td style={{color:"var(--mist)",fontSize:11,fontWeight:600}}>#{String(s.id).padStart(4,"0")}</td>
                    <td>
                      <div style={{display:"flex",flexDirection:"column",gap:2}}>
                        {blocks.map(b=>(
                          <div key={b.id} style={{fontSize:11}}>
                            <span style={{fontWeight:700,color:"var(--sap7)"}}>{b.code}</span>
                            <span style={{color:"var(--mist)",marginLeft:4}}>{b.material}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    {currentUser.role==="owner"&&<td style={{fontSize:12}}>{seller?.name||"—"}</td>}
                    <td style={{fontSize:12}}>{cli?.name||"—"}</td>
                    <td style={{fontSize:11,color:"var(--mist)"}}>{pay?.name||"—"}</td>
                    <td style={{fontWeight:700,color:"#059669"}}>{s.total_brl>0?money(s.total_brl,"BRL"):"—"}</td>
                    <td style={{fontWeight:700,color:"var(--sap7)"}}>{s.total_usd>0?money(s.total_usd,"USD"):"—"}</td>
                    <td style={{fontSize:11,color:"var(--warn)"}}>{s.dollar_rate?`R$ ${Number(s.dollar_rate).toFixed(2)}`:"—"}</td>
                    <td style={{color:"var(--mist)",fontSize:11}}>{fdateS(s.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table></div></div>
      }
    </div>
  );
}

// ─── APP ─────────────────────────────────────
export default function App() {
  // Load from localStorage on first render; fall back to SEED if empty
  const [db,setDb]=useState(()=>loadDb()||SEED);

  // Persist every db change to localStorage
  useEffect(()=>{ saveDb(db); },[db]);
  const [user,setUser]=useState(null);
  const [page,setPage]=useState("dashboard");
  const [sbOpen,setSbOpen]=useState(false);
  const [notifOpen,setNotifOpen]=useState(false);
  const [toast,setToast]=useState(null);

  const [globalDollarRate, setGlobalDollarRate] = useState("");

  // Try to fetch dollar rate once on app load
  useEffect(() => {
    const proxies = [
      () => fetch("https://api.allorigins.win/get?url=" + encodeURIComponent("https://economia.awesomeapi.com.br/json/last/USD-BRL"))
              .then(r=>r.json()).then(j=>parseFloat(JSON.parse(j.contents).USDBRL.bid).toFixed(2)),
      () => fetch("https://corsproxy.io/?url=" + encodeURIComponent("https://economia.awesomeapi.com.br/json/last/USD-BRL"))
              .then(r=>r.json()).then(d=>parseFloat(d.USDBRL.bid).toFixed(2)),
      () => fetch("https://fxapi.app/api/latest?base=USD&symbols=BRL")
              .then(r=>r.json()).then(d=>parseFloat(d.rates.BRL).toFixed(2)),
      () => fetch("https://api.frankfurter.dev/v2/latest?base=USD&symbols=BRL")
              .then(r=>r.json()).then(d=>parseFloat(d.rates.BRL).toFixed(2)),
    ];
    (async () => {
      for (const fn of proxies) {
        try { const r = await fn(); if(r && !isNaN(r)){ setGlobalDollarRate(r); return; } } catch {}
      }
    })();
  }, []);

  const showToast=useCallback((msg,type="")=>setToast({msg,type}),[]);
  const nav=p=>{setPage(p);setSbOpen(false);};

  useEffect(()=>{if(user){const d={owner:"dashboard",foreman:"register",seller:"blocks",client:"catalog"};setPage(d[user.role]||"dashboard");}}, [user]);

  const fmFilter=useCallback(b=>Number(b.quarry_id)===Number(user?.quarry_id),[user?.quarry_id]);

  if(!user)return <LoginPage users={db.users} onLogin={setUser}/>;

  const nc=db.notifications.filter(n=>n.user_id===user.id&&!n.read).length;
  const pc=db.orders.filter(o=>o.status==="pending").length;

  const NAV={
    owner:[{sec:"Gestão",items:[
      {p:"dashboard",  l:"Dashboard",        i:"grid"},
      {p:"blocks",     l:"Blocos em Estoque",i:"cube"},
      {p:"sold",       l:"Blocos Vendidos",  i:"cart"},
      {p:"orders",     l:"Pedidos",          i:"bell"},
      {p:"sales",      l:"Histórico Vendas", i:"hist"},
      {p:"share",      l:"Liberar Catálogo", i:"globe"},
      {p:"quarries",   l:"Pedreiras",        i:"mtn"},
      {p:"sellers",    l:"Vendedores",       i:"user"},
      {p:"commissions",l:"Comissões",         i:"dolar"},
      {p:"clients",    l:"Clientes",         i:"user"},
      {p:"payments",   l:"Pagamentos",       i:"card"},
    ]}],
    foreman:[{sec:"Pedreira",items:[
      {p:"register",   l:"Cadastrar Bloco",  i:"plus"},
      {p:"blocks",     l:"Blocos em Estoque",i:"cube"},
      {p:"sold",       l:"Blocos Vendidos",  i:"cart"},
      {p:"share",      l:"Liberar Catálogo", i:"globe"},
    ]}],
    seller:[{sec:"Vendas",items:[
      {p:"blocks",     l:"Blocos em Estoque",i:"cube"},
      {p:"sold",       l:"Blocos Vendidos",  i:"cart"},
      {p:"share",      l:"Liberar Catálogo", i:"globe"},
      {p:"orders",     l:"Pedidos",          i:"bell"},
      {p:"sales",      l:"Minhas Vendas",    i:"hist"},
      {p:"clients",    l:"Clientes",         i:"user"},
      {p:"payments",   l:"Pagamentos",       i:"card"},
    ]}],
    client:[{sec:"Compras",items:[
      {p:"catalog",    l:"Catálogo",         i:"book"},
      {p:"purchases",  l:"Minhas Compras",   i:"hist"},
      {p:"orders",     l:"Pedidos de Interesse", i:"heart"},
    ]}],
  };
  const RL={owner:"Dono da Empresa",foreman:"Encarregado",seller:"Vendedor",client:"Cliente"};
  const props={currentUser:user,quarries:db.quarries,db,setDb,toast:showToast,globalDollarRate};

  const renderPage=()=>{
    switch(page){
      case "dashboard": return <Dash quarries={db.quarries} db={db}/>;
      case "register":  return <Reg {...props}/>;
      case "blocks":{
        const cfg={
          owner:  {title:"Blocos em Estoque",  sub:"Blocos disponíveis (excluindo vendidos)", bFilter:b=>b.status!=="sold"},
          foreman:{title:"Blocos em Estoque",   sub:"Todos os blocos disponíveis",               bFilter:b=>b.status!=="sold"},
          seller: {title:"Blocos em Estoque",   sub:"Todos os blocos disponíveis (excluindo vendidos)", bFilter:b=>b.status!=="sold"},
        };
        return <BList key={"blocks-"+user.role} {...props} {...(cfg[user.role]||{})} globalDollarRate={globalDollarRate}/>;
      }
      case "sold":     return <SoldBlocks key="sold" currentUser={user} quarries={db.quarries} db={db} setDb={setDb} toast={showToast}/>;
      case "share":    return <ShareCatalog currentUser={user} quarries={db.quarries} db={db} setDb={setDb} toast={showToast}/>;
      case "catalog":   return <Cat          key="catalog"    {...props}/>;
      case "purchases": return <ClientPurchases key="purchases" currentUser={user} quarries={db.quarries} db={db}/>;
      case "orders":   return <Ords     key="orders"   {...props}/>;
      case "sales":    return <SalesHist currentUser={user} db={db}/>;
      case "quarries": return <QuarriesPage db={db} setDb={setDb} toast={showToast}/>;
      case "sellers":  return <SellersPage  db={db} setDb={setDb} toast={showToast}/>;
      case "commissions": return <CommissionsPage db={db}/>;
      case "clients":  return <ClientsPage db={db} setDb={setDb} toast={showToast} currentUser={user}/>;
      case "payments": return <PaymentsPage db={db} setDb={setDb} toast={showToast} currentUser={user}/>;
      default: return null;
    }
  };

  return(
    <><style>{CSS}</style>
    <div className="app">
      <div className="tb">
        <div className="tbl">
          <button className="hbtn" onClick={()=>setSbOpen(o=>!o)}><Icon n="menu" s={20} c="rgba(255,255,255,.7)"/></button>
          <span className="tblogo">Stone <span>Block</span></span>
          <span className="tbsub">Rochas Ornamentais</span>
        </div>
        <div className="tbr">
          <button className="nbbtn" onClick={()=>setNotifOpen(s=>!s)}><Icon n="bell" s={20}/>{nc>0&&<span className="nbdot">{nc>9?"9+":nc}</span>}</button>
          <div className="av" title={`${user.name} — ${RL[user.role]}`}>{user.avatar}</div>
        </div>
      </div>
      <div className="lay">
        <div className={"sbov"+(sbOpen?" show":"")} onClick={()=>setSbOpen(false)}/>
        <div className={"sb"+(sbOpen?" open":"")}>
          {(NAV[user.role]||[]).map(sec=>(
            <div key={sec.sec} className="sbsec">
              <div className="sblbl">{sec.sec}</div>
              {sec.items.map(it=>(
                <div key={it.p} className={"sbni"+(page===it.p?" on":"")} onClick={()=>nav(it.p)}>
                  <Icon n={it.i} s={15}/>{it.l}
                  {it.p==="orders"&&user.role!=="client"&&pc>0&&<span className="obadge">{pc}</span>}
                </div>
              ))}
            </div>
          ))}
          <div className="sbft">
            <div className="sbusr">
              <div className="av" style={{width:34,height:34,fontSize:12}}>{user.avatar}</div>
              <div style={{flex:1,minWidth:0}}><div className="sbun">{user.name}</div><div className="sbur">{RL[user.role]}</div></div>
            </div>
            <button className="lobtn" onClick={()=>{setUser(null);setSbOpen(false);}}><Icon n="out" s={14}/> Sair</button>
            {user.role==="owner"&&(
              <button onClick={()=>{ localStorage.removeItem(DB_KEY); setDb({...SEED}); setUser(null); setSbOpen(false); toast("Dados resetados!","ok"); }} style={{width:"100%",marginTop:8,display:"flex",alignItems:"center",gap:8,padding:"7px 12px",background:"rgba(239,68,68,.07)",border:"1px solid rgba(239,68,68,.15)",borderRadius:8,color:"rgba(252,165,165,.55)",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>
                🔄 Resetar dados de teste
              </button>
            )}
          </div>
        </div>
        <div className="main">{renderPage()}</div>
      </div>
      {notifOpen&&<Notifs currentUser={user} db={db} setDb={setDb} onClose={()=>setNotifOpen(false)}/>}
      <Toast t={toast} onClose={()=>setToast(null)}/>
    </div></>
  );
}
