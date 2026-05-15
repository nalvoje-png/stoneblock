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
  // Normalize photos: ensure it's always an array
  return (data || []).map(b => ({
    ...b,
    photos: Array.isArray(b.photos) ? b.photos
          : typeof b.photos === 'string' ? (b.photos.startsWith('[') ? JSON.parse(b.photos) : [b.photos])
          : []
  }))
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

// ─── SALES ──────────────────────────────────────────────────────
export async function listSales(profile) {
  const companyId = profile.role === 'owner' ? profile.id : (profile.company_id || profile.id)
  // Sellers só veem suas próprias vendas
  let query = supabase
    .from('sales')
    .select(`
      *,
      seller:profiles!seller_id(id, name, avatar),
      client:clients!client_id(id, name, country),
      payment_method:payment_methods!payment_method_id(id, name),
      sale_blocks(block_id, block:blocks(id, code, material, net_volume, total_value, currency, photos, classification))
    `)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  if (profile.role === 'seller') {
    query = query.eq('seller_id', profile.id)
  }

  const { data, error } = await query
  if (error) throw error
  // Normalize sale_blocks → block_ids array for easy use
  return (data || []).map(s => ({
    ...s,
    block_ids: (s.sale_blocks || []).map(sb => sb.block_id),
    blocks: (s.sale_blocks || []).map(sb => sb.block).filter(Boolean),
  }))
}

export async function createSale(profile, saleData, blockIds) {
  const companyId = profile.role === 'owner' ? profile.id : (profile.company_id || profile.id)

  // 1. Create the sale
  const { data: sale, error: saleError } = await supabase
    .from('sales')
    .insert({
      company_id: companyId,
      seller_id: saleData.seller_id || profile.id,
      client_id: saleData.client_id,
      payment_method_id: saleData.payment_method_id || null,
      dollar_rate: saleData.dollar_rate || null,
      total_brl: saleData.total_brl || 0,
      total_usd: saleData.total_usd || 0,
      obs: saleData.obs || null,
    })
    .select()
    .single()

  if (saleError) throw saleError

  // 2. Link blocks to sale
  if (blockIds && blockIds.length > 0) {
    const saleBlocks = blockIds.map(bid => ({ sale_id: sale.id, block_id: bid }))
    const { error: linkError } = await supabase.from('sale_blocks').insert(saleBlocks)
    if (linkError) throw linkError

    // 3. Mark blocks as sold
    const { error: blockError } = await supabase
      .from('blocks')
      .update({ status: 'sold' })
      .in('id', blockIds)
    if (blockError) throw blockError
  }

  return sale
}

export async function reverseSale(saleId, blockIds) {
  // Restore blocks to available
  if (blockIds && blockIds.length > 0) {
    await supabase.from('blocks').update({ status: 'available' }).in('id', blockIds)
  }
  // Delete sale (sale_blocks cascade)
  const { error } = await supabase.from('sales').delete().eq('id', saleId)
  if (error) throw error
}

// ─── PHOTO UPLOAD ──────────────────────────────────────────────
export async function uploadBlockPhoto(profile, file, blockCode) {
  // Sanitize: only safe characters in filename
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')
  const cleanCode = (blockCode || 'block').replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20)
  const path = `${profile.id}/${Date.now()}_${cleanCode}.${ext || 'jpg'}`
  console.log('Uploading to path:', path, 'file size:', file.size, 'type:', file.type)

  const { data: uploadData, error } = await supabase.storage
    .from('block-photos')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'image/jpeg'
    })

  if (error) {
    console.error('Upload error:', error)
    throw new Error(error.message || 'Falha no upload')
  }

  const { data } = supabase.storage.from('block-photos').getPublicUrl(path)
  console.log('Upload OK, URL:', data.publicUrl)
  return data.publicUrl
}

// ─── REALTIME ───────────────────────────────────────────────────
// Sincroniza mudanças entre dispositivos em tempo real
export function subscribeRealtime(profile, onChange) {
  const companyId = profile.role === 'owner' ? profile.id : (profile.company_id || profile.id)

  const channel = supabase
    .channel('stoneblock-realtime')
    .on('postgres_changes',
        { event: '*', schema: 'public', table: 'blocks', filter: `company_id=eq.${companyId}` },
        () => onChange('blocks'))
    .on('postgres_changes',
        { event: '*', schema: 'public', table: 'quarries', filter: `company_id=eq.${companyId}` },
        () => onChange('quarries'))
    .on('postgres_changes',
        { event: '*', schema: 'public', table: 'clients', filter: `company_id=eq.${companyId}` },
        () => onChange('clients'))
    .on('postgres_changes',
        { event: '*', schema: 'public', table: 'payment_methods', filter: `company_id=eq.${companyId}` },
        () => onChange('payment_methods'))
    .on('postgres_changes',
        { event: '*', schema: 'public', table: 'sales', filter: `company_id=eq.${companyId}` },
        () => onChange('sales'))
    .subscribe()

  return channel
}

export function unsubscribeRealtime(channel) {
  if (channel) supabase.removeChannel(channel)
}
