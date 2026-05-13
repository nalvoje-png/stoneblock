// src/lib/db.js
// ─── Camada de dados — todas as operações com Supabase ───────────────
import { supabase } from '../supabase'

// ══════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

// ══════════════════════════════════════════════════════
// PEDREIRAS
// ══════════════════════════════════════════════════════

export async function getQuarries() {
  const { data, error } = await supabase
    .from('quarries')
    .select('*')
    .eq('active', true)
    .order('name')
  if (error) throw error
  return data
}

export async function createQuarry(quarry) {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('quarries')
    .insert({ ...quarry, company_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateQuarry(id, updates) {
  const { data, error } = await supabase
    .from('quarries')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteQuarry(id) {
  const { error } = await supabase
    .from('quarries')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ══════════════════════════════════════════════════════
// BLOCOS
// ══════════════════════════════════════════════════════

export async function getBlocks() {
  const { data, error } = await supabase
    .from('blocks')
    .select(`
      *,
      quarry:quarries(id, name, location),
      reserved_client:clients!reserved_for(id, name)
    `)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createBlock(block) {
  const { data: { user } } = await supabase.auth.getUser()
  // Generate sys_code via Supabase function
  const { data: sysCode } = await supabase.rpc('generate_sys_code')
  const { data, error } = await supabase
    .from('blocks')
    .insert({ ...block, company_id: user.id, sys_code: sysCode, created_by: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateBlock(id, updates) {
  const { data, error } = await supabase
    .from('blocks')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteBlock(id) {
  const { error } = await supabase
    .from('blocks')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ══════════════════════════════════════════════════════
// CLIENTES
// ══════════════════════════════════════════════════════

export async function getClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('name')
  if (error) throw error
  return data
}

export async function createClient(client) {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('clients')
    .insert({ ...client, company_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateClient(id, updates) {
  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteClient(id) {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ══════════════════════════════════════════════════════
// FORMAS DE PAGAMENTO
// ══════════════════════════════════════════════════════

export async function getPaymentMethods() {
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('active', true)
    .order('name')
  if (error) throw error
  return data
}

export async function createPaymentMethod(pm) {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('payment_methods')
    .insert({ ...pm, company_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updatePaymentMethod(id, updates) {
  const { data, error } = await supabase
    .from('payment_methods')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deletePaymentMethod(id) {
  const { error } = await supabase
    .from('payment_methods')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ══════════════════════════════════════════════════════
// VENDAS
// ══════════════════════════════════════════════════════

export async function getSales() {
  const { data, error } = await supabase
    .from('sales')
    .select(`
      *,
      seller:profiles!seller_id(id, name, avatar),
      client:clients!client_id(id, name, country),
      payment_method:payment_methods!payment_method_id(id, name, details),
      sale_blocks(block_id, block:blocks(id, code, material, classification, net_volume, total_value, currency, photos, sys_code))
    `)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createSale(sale, blockIds) {
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Create sale record
  const { data: saleData, error: saleError } = await supabase
    .from('sales')
    .insert({ ...sale, company_id: user.id })
    .select()
    .single()
  if (saleError) throw saleError

  // 2. Link blocks to sale
  const saleBlocksData = blockIds.map(bid => ({ sale_id: saleData.id, block_id: bid }))
  const { error: sbError } = await supabase
    .from('sale_blocks')
    .insert(saleBlocksData)
  if (sbError) throw sbError

  // 3. Mark blocks as sold
  const { error: blockError } = await supabase
    .from('blocks')
    .update({ status: 'sold' })
    .in('id', blockIds)
  if (blockError) throw blockError

  return saleData
}

export async function reverseSale(saleId, blockIds) {
  // 1. Delete sale
  const { error: saleError } = await supabase
    .from('sales')
    .delete()
    .eq('id', saleId)
  if (saleError) throw saleError

  // 2. Mark blocks as available again
  const { error: blockError } = await supabase
    .from('blocks')
    .update({ status: 'available' })
    .in('id', blockIds)
  if (blockError) throw blockError
}

// ══════════════════════════════════════════════════════
// PEDIDOS
// ══════════════════════════════════════════════════════

export async function getOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      block:blocks(id, code, material, total_value, currency, net_volume),
      client:clients(id, name, country)
    `)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createOrder(order) {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('orders')
    .insert({ ...order, company_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateOrder(id, updates) {
  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ══════════════════════════════════════════════════════
// LIBERAÇÕES DE CATÁLOGO
// ══════════════════════════════════════════════════════

export async function getBlockReleases() {
  const { data, error } = await supabase
    .from('block_releases')
    .select(`
      *,
      client:clients(id, name),
      liberador:profiles!liberado_por(id, name)
    `)
  if (error) throw error
  return data
}

export async function createBlockRelease(blockId, clientId) {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('block_releases')
    .upsert({
      block_id: blockId,
      client_id: clientId,
      company_id: user.id,
      liberado_por: user.id,
      data_liberacao: new Date().toISOString()
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteBlockRelease(blockId, clientId) {
  const { error } = await supabase
    .from('block_releases')
    .delete()
    .eq('block_id', blockId)
    .eq('client_id', clientId)
  if (error) throw error
}

// ══════════════════════════════════════════════════════
// FAVORITOS
// ══════════════════════════════════════════════════════

export async function getFavorites(clientId) {
  const { data, error } = await supabase
    .from('favorites')
    .select('block_id')
    .eq('client_id', clientId)
  if (error) throw error
  return data.map(f => f.block_id)
}

export async function toggleFavorite(clientId, blockId) {
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('client_id', clientId)
    .eq('block_id', blockId)
    .single()

  if (existing) {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('client_id', clientId)
      .eq('block_id', blockId)
    if (error) throw error
    return false
  } else {
    const { error } = await supabase
      .from('favorites')
      .insert({ client_id: clientId, block_id: blockId })
    if (error) throw error
    return true
  }
}

// ══════════════════════════════════════════════════════
// NOTIFICAÇÕES
// ══════════════════════════════════════════════════════

export async function getNotifications(userId) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return data
}

export async function createNotification(userId, companyId, message, type = 'info') {
  const { error } = await supabase
    .from('notifications')
    .insert({ user_id: userId, company_id: companyId, message, type })
  if (error) console.warn('Notification error:', error)
}

export async function markNotificationRead(id) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id)
  if (error) throw error
}

export async function markAllNotificationsRead(userId) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
  if (error) throw error
}

// ══════════════════════════════════════════════════════
// USUÁRIOS DA EMPRESA (equipe)
// ══════════════════════════════════════════════════════

export async function getTeam(companyId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('company_id', companyId)
    .order('name')
  if (error) throw error
  return data
}

export async function inviteTeamMember(email, role, name) {
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: { name, role }
  })
  if (error) throw error
  return data
}

// ══════════════════════════════════════════════════════
// UPLOAD DE FOTOS
// ══════════════════════════════════════════════════════

export async function uploadPhoto(file, blockId) {
  const { data: { user } } = await supabase.auth.getUser()
  const ext      = file.name.split('.').pop()
  const fileName = `${user.id}/${blockId}/${Date.now()}.${ext}`

  const { data, error } = await supabase.storage
    .from('block-photos')
    .upload(fileName, file, { cacheControl: '3600', upsert: false })
  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from('block-photos')
    .getPublicUrl(fileName)

  return publicUrl
}

export async function deletePhoto(url) {
  // Extract path from URL
  const path = url.split('/block-photos/')[1]
  if (!path) return
  const { error } = await supabase.storage
    .from('block-photos')
    .remove([path])
  if (error) throw error
}
