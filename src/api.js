// src/api.js
// ═══════════════════════════════════════════════════════════════
// Stone Block — camada de API para o Supabase
// ═══════════════════════════════════════════════════════════════
import { supabase } from './supabase'

// ─── AUTH ──────────────────────────────────────────────────────
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange(callback)
}

// ─── PROFILE ────────────────────────────────────────────────────
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function ensureProfile(userId, email) {
  // Verifica se já existe profile
  let profile = await getProfile(userId)
  if (profile) {
    // Garante company_id
    if (!profile.company_id) {
      await supabase.from('profiles').update({ company_id: userId }).eq('id', userId)
      profile.company_id = userId
    }
    return profile
  }
  // Cria perfil novo
  const name = email.split('@')[0]
  const avatar = name.substring(0, 2).toUpperCase()
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      company_id: userId,
      name,
      role: 'owner',
      avatar,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

// Helper: company_id do usuário logado
function getCompanyId(profile) {
  return profile.role === 'owner' ? profile.id : (profile.company_id || profile.id)
}

// ─── QUARRIES ───────────────────────────────────────────────────
export async function listQuarries(profile) {
  const { data, error } = await supabase
    .from('quarries')
    .select('*')
    .eq('company_id', getCompanyId(profile))
    .eq('active', true)
    .order('name')
  if (error) throw error
  return data || []
}

export async function createQuarry(profile, payload) {
  const { data, error } = await supabase
    .from('quarries')
    .insert({ ...payload, company_id: getCompanyId(profile) })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateQuarry(id, payload) {
  const { data, error } = await supabase
    .from('quarries')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteQuarry(id) {
  const { error } = await supabase.from('quarries').delete().eq('id', id)
  if (error) throw error
}

// ─── CLIENTS ────────────────────────────────────────────────────
export async function listClients(profile) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('company_id', getCompanyId(profile))
    .order('name')
  if (error) throw error
  return data || []
}

export async function createClient(profile, payload) {
  const { data, error } = await supabase
    .from('clients')
    .insert({ ...payload, company_id: getCompanyId(profile) })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateClient(id, payload) {
  const { data, error } = await supabase
    .from('clients')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteClient(id) {
  const { error } = await supabase.from('clients').delete().eq('id', id)
  if (error) throw error
}

// ─── PAYMENT METHODS ───────────────────────────────────────────
export async function listPaymentMethods(profile) {
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('company_id', getCompanyId(profile))
    .eq('active', true)
    .order('name')
  if (error) throw error
  return data || []
}

export async function createPaymentMethod(profile, payload) {
  const { data, error } = await supabase
    .from('payment_methods')
    .insert({ ...payload, company_id: getCompanyId(profile) })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updatePaymentMethod(id, payload) {
  const { data, error } = await supabase
    .from('payment_methods')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deletePaymentMethod(id) {
  const { error } = await supabase.from('payment_methods').delete().eq('id', id)
  if (error) throw error
}

// ─── BLOCKS ─────────────────────────────────────────────────────
export async function listBlocks(profile) {
  const { data, error } = await supabase
    .from('blocks')
    .select('*')
    .eq('company_id', getCompanyId(profile))
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function createBlock(profile, payload) {
  // Gera sys_code via função do banco
  const { data: sysCode, error: rpcErr } = await supabase.rpc('generate_sys_code')
  if (rpcErr) throw rpcErr

  const { data, error } = await supabase
    .from('blocks')
    .insert({
      ...payload,
      company_id: getCompanyId(profile),
      sys_code: sysCode,
      created_by: profile.id,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateBlock(id, payload) {
  const { data, error } = await supabase
    .from('blocks')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteBlock(id) {
  const { error } = await supabase.from('blocks').delete().eq('id', id)
  if (error) throw error
}

// ─── PHOTO UPLOAD ──────────────────────────────────────────────
export async function uploadBlockPhoto(profile, file, blockCode) {
  const ext = file.name.split('.').pop()
  const path = `${profile.id}/${Date.now()}-${blockCode}.${ext}`
  const { error } = await supabase.storage
    .from('block-photos')
    .upload(path, file, { cacheControl: '3600', upsert: false })
  if (error) throw error
  const { data } = supabase.storage.from('block-photos').getPublicUrl(path)
  return data.publicUrl
}
