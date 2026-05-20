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

// Cria conta nova (usado para cadastrar cliente, vendedor ou encarregado)
// Retorna o user.id criado
export async function signUpUser(email, password, profileData) {
  // Preserva a sessão do owner para reusar depois
  const { data: { session: ownerSession } } = await supabase.auth.getSession()

  // Cria a conta
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name: profileData.name, role: profileData.role } }
  })
  if (error) throw error

  // signUp pode fazer login automático no usuário recém-criado.
  // Precisamos restaurar a sessão do owner.
  if (ownerSession) {
    await supabase.auth.setSession({
      access_token: ownerSession.access_token,
      refresh_token: ownerSession.refresh_token,
    })
  }

  return data.user
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

export async function createClient(profile, payload, accountData) {
  const companyId = profile.role === 'owner' ? profile.id : (profile.company_id || profile.id)

  // Se accountData foi passado, cria a conta do cliente
  let userId = null
  if (accountData?.email && accountData?.password) {
    const user = await signUpUser(accountData.email, accountData.password, {
      name: payload.name,
      role: 'client',
    })
    userId = user?.id

    if (userId) {
      // Aguarda trigger criar profile (com retry)
      let profileExists = false
      for (let i = 0; i < 6; i++) {
        await new Promise(r => setTimeout(r, 500))
        const { data: p } = await supabase.from('profiles').select('id').eq('id', userId).maybeSingle()
        if (p) { profileExists = true; break }
      }

      const profileData = {
        role: 'client',
        company_id: companyId,
        name: payload.name,
        phone: payload.phone || null,
        avatar: payload.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase(),
      }

      if (profileExists) {
        await supabase.from('profiles').update(profileData).eq('id', userId)
      } else {
        await supabase.from('profiles').insert({ id: userId, ...profileData })
      }
    }
  }

  const { data, error } = await supabase
    .from('clients')
    .insert({ ...payload, company_id: companyId, user_id: userId })
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

  // Normalize photos array
  const blocks = (data || []).map(b => ({
    ...b,
    photos: Array.isArray(b.photos) ? b.photos
          : typeof b.photos === 'string' ? (b.photos.startsWith('[') ? JSON.parse(b.photos) : [b.photos])
          : []
  }))

  // Hidrata reserved_client com nome do cliente para blocos reservados
  const reservedIds = [...new Set(blocks.filter(b => b.reserved_for).map(b => b.reserved_for))]
  if (reservedIds.length > 0) {
    try {
      const { data: clientsData } = await supabase
        .from('clients')
        .select('id, name')
        .in('id', reservedIds)
      const map = {}
      ;(clientsData || []).forEach(c => { map[c.id] = c })
      blocks.forEach(b => {
        if (b.reserved_for && map[b.reserved_for]) {
          b.reserved_client = map[b.reserved_for]
        }
      })
    } catch (e) {
      console.warn('Could not load reserved clients:', e)
    }
  }

  return blocks
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
  // Remove campos que são relações (não são colunas)
  const { reserved_client, ...cleanPayload } = payload
  const { data, error } = await supabase
    .from('blocks')
    .update(cleanPayload)
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

// Reservar bloco para cliente
export async function reserveBlock(blockId, clientId) {
  const { error } = await supabase
    .from('blocks')
    .update({ status: 'reserved', reserved_for: clientId })
    .eq('id', blockId)
  if (error) throw error
}

// Liberar reserva
export async function unreserveBlock(blockId) {
  const { error } = await supabase
    .from('blocks')
    .update({ status: 'available', reserved_for: null })
    .eq('id', blockId)
  if (error) throw error
}

// ─── CLIENT USERS (múltiplos acessos por cliente) ───────────────
export async function listClientUsers(clientId) {
  const { data, error } = await supabase
    .from('client_users')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at')
  if (error) throw error
  return data || []
}

export async function addClientUser(profile, clientId, email, password, userName) {
  // Cria conta no auth
  const user = await signUpUser(email, password, { name: userName, role: 'client' })
  if (!user?.id) throw new Error('Falha ao criar usuário')

  // Aguarda trigger criar profile
  let profileExists = false
  for (let i = 0; i < 6; i++) {
    await new Promise(r => setTimeout(r, 500))
    const { data: p } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle()
    if (p) { profileExists = true; break }
  }

  const companyId = profile.role === 'owner' ? profile.id : (profile.company_id || profile.id)
  const profileData = {
    role: 'client',
    company_id: companyId,
    name: userName,
    avatar: userName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase(),
  }

  if (profileExists) {
    await supabase.from('profiles').update(profileData).eq('id', user.id)
  } else {
    await supabase.from('profiles').insert({ id: user.id, ...profileData })
  }

  // Cria registro client_users
  const { error } = await supabase.from('client_users').insert({
    client_id: clientId,
    user_id: user.id,
    name: userName,
  })
  if (error) throw error

  return user
}

export async function removeClientUser(clientUserId) {
  const { error } = await supabase.from('client_users').delete().eq('id', clientUserId)
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
      sale_blocks(block_id, block:blocks(id, code, material, net_volume, total_value, currency, photos, classification, quarry_id, prod_date, gross_volume, gross_l, gross_h, gross_w, net_l, net_h, net_w, price_m3, notes, sys_code, status))
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
    blocks: (s.sale_blocks || []).map(sb => sb.block).filter(Boolean).map(b => ({
      ...b,
      photos: Array.isArray(b.photos) ? b.photos
            : typeof b.photos === 'string' ? (b.photos.startsWith('[') ? JSON.parse(b.photos) : [b.photos])
            : []
    })),
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

// ─── TEAM (profiles - foreman/seller/client) ────────────────────
export async function listTeam(profile) {
  const companyId = profile.role === 'owner' ? profile.id : (profile.company_id || profile.id)
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('company_id', companyId)
    .neq('id', profile.id)  // exclude owner itself
    .order('name')
  if (error) throw error
  return data || []
}

// Cria novo membro da equipe (encarregado ou vendedor)
export async function createTeamMember(profile, email, password, payload) {
  const companyId = profile.role === 'owner' ? profile.id : (profile.company_id || profile.id)

  const user = await signUpUser(email, password, {
    name: payload.name,
    role: payload.role,
  })

  if (user?.id) {
    // Aguarda o trigger criar o profile (até 3 tentativas)
    let profileExists = false
    for (let i = 0; i < 6; i++) {
      await new Promise(r => setTimeout(r, 500))
      const { data: p } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle()
      if (p) { profileExists = true; break }
    }

    if (!profileExists) {
      // Tenta criar manualmente
      console.warn('Profile não criado pelo trigger, criando manualmente...')
      await supabase.from('profiles').insert({
        id: user.id,
        role: payload.role,
        company_id: companyId,
        name: payload.name,
        phone: payload.phone || null,
        commission: payload.commission || false,
        commission_pct: payload.commission ? parseFloat(payload.commission_pct) || 0 : 0,
        avatar: payload.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase(),
      })
    } else {
      // Atualiza profile criado pelo trigger
      const { error } = await supabase.from('profiles').update({
        role: payload.role,
        company_id: companyId,
        name: payload.name,
        phone: payload.phone || null,
        commission: payload.commission || false,
        commission_pct: payload.commission ? parseFloat(payload.commission_pct) || 0 : 0,
        avatar: payload.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase(),
      }).eq('id', user.id)
      if (error) throw error
    }
  }

  return user
}

export async function updateTeamMember(id, payload) {
  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── BLOCK RELEASES (catálogo liberado para clientes) ───────────
export async function listBlockReleases(profile) {
  const companyId = profile.role === 'owner' ? profile.id : (profile.company_id || profile.id)
  const { data, error } = await supabase
    .from('block_releases')
    .select(`
      *,
      client:clients(id, name),
      liberador:profiles!liberado_por(id, name)
    `)
    .eq('company_id', companyId)
  if (error) throw error
  return data || []
}

export async function releaseBlocks(profile, blockIds, clientIds) {
  const companyId = profile.role === 'owner' ? profile.id : (profile.company_id || profile.id)
  // Create cartesian product: each block × each client
  const rows = []
  for (const bid of blockIds) {
    for (const cid of clientIds) {
      rows.push({
        company_id: companyId,
        block_id: bid,
        client_id: cid,
        liberado_por: profile.id,
        data_liberacao: new Date().toISOString(),
      })
    }
  }
  // Upsert (ignore duplicates via unique constraint)
  const { error } = await supabase.from('block_releases').upsert(rows, { onConflict: 'block_id,client_id', ignoreDuplicates: true })
  if (error) throw error
}

export async function revokeRelease(blockId, clientId) {
  const { error } = await supabase
    .from('block_releases')
    .delete()
    .eq('block_id', blockId)
    .eq('client_id', clientId)
  if (error) throw error
}

// ─── CATALOG (blocos liberados para o cliente logado) ───────────
async function getClientByUser(userId) {
  // Primeiro tenta direto na tabela clients (cliente principal)
  const { data: direct } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (direct) return direct

  // Depois tenta via client_users (acesso adicional)
  const { data: cu } = await supabase
    .from('client_users')
    .select('client:clients(*)')
    .eq('user_id', userId)
    .maybeSingle()
  return cu?.client || null
}

export async function listClientCatalog(profile) {
  // Encontra o registro de cliente vinculado a esse user
  const clientRec = await getClientByUser(profile.id)
  if (!clientRec) return []

  // Lista blocks liberados para esse cliente
  const { data, error } = await supabase
    .from('block_releases')
    .select(`
      block:blocks(*, quarry:quarries(name, location))
    `)
    .eq('client_id', clientRec.id)

  if (error) throw error

  // Extract blocks and normalize
  return (data || [])
    .map(r => r.block)
    .filter(b => b && b.status !== 'sold')
    .map(b => ({
      ...b,
      photos: Array.isArray(b.photos) ? b.photos
            : typeof b.photos === 'string' ? (b.photos.startsWith('[') ? JSON.parse(b.photos) : [b.photos])
            : []
    }))
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

// Upload de foto de material (amostra)
export async function uploadMaterialPhoto(profile, file, matName) {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')
  const cleanName = (matName || 'mat').replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)
  const path = `${profile.id}/materials/${Date.now()}_${cleanName}.${ext || 'jpg'}`

  const { error } = await supabase.storage
    .from('block-photos')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'image/jpeg'
    })
  if (error) throw new Error(error.message || 'Falha no upload')

  const { data } = supabase.storage.from('block-photos').getPublicUrl(path)
  return data.publicUrl
}

// Upload de logo do perfil/empresa
export async function uploadProfileLogo(profile, file) {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')
  const path = `${profile.id}/logo/${Date.now()}.${ext || 'jpg'}`

  const { error } = await supabase.storage
    .from('block-photos')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type || 'image/jpeg'
    })
  if (error) throw new Error(error.message || 'Falha no upload')

  const { data } = supabase.storage.from('block-photos').getPublicUrl(path)
  return data.publicUrl
}

// Atualiza perfil
export async function updateProfile(profileId, payload) {
  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', profileId)
    .select()
    .single()
  if (error) throw error
  return data
}

// Busca perfil do dono da empresa pelo company_id (para usar no romaneio)
export async function getCompanyOwnerProfile(companyId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, company_name, logo_url')
    .eq('id', companyId)
    .maybeSingle()
  if (error) throw error
  return data
}

// ─── COMMERCIAL RESERVE (mover bloco para reserva) ──────────────
export async function moveToReserve(blockId) {
  const { error } = await supabase
    .from('blocks')
    .update({ status: 'reserve', moved_to_reserve_at: new Date().toISOString(), reserved_for: null })
    .eq('id', blockId)
  if (error) throw error
}

export async function moveBackFromReserve(blockId) {
  const { error } = await supabase
    .from('blocks')
    .update({ status: 'available', moved_to_reserve_at: null })
    .eq('id', blockId)
  if (error) throw error
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
    .on('postgres_changes',
        { event: '*', schema: 'public', table: 'block_releases', filter: `company_id=eq.${companyId}` },
        () => onChange('block_releases'))
    .on('postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter: `company_id=eq.${companyId}` },
        () => onChange('profiles'))
    .on('postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `company_id=eq.${companyId}` },
        () => onChange('orders'))
    .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${profile.id}` },
        () => onChange('notifications'))
    .subscribe()

  return channel
}

export function unsubscribeRealtime(channel) {
  if (channel) supabase.removeChannel(channel)
}

// ─── ORDERS (pedidos de interesse do cliente) ───────────────────
export async function listOrders(profile) {
  const companyId = profile.role === 'owner' ? profile.id : (profile.company_id || profile.id)
  let query = supabase
    .from('orders')
    .select(`
      *,
      block:blocks(id, code, material, total_value, currency, net_volume, photos),
      client:clients(id, name, country, user_id)
    `)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  // Cliente vê só os próprios pedidos
  if (profile.role === 'client') {
    const clientRec = await getClientByUser(profile.id)
    if (!clientRec) return []
    query = query.eq('client_id', clientRec.id)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function createClientOrder(profile, blockId, message) {
  // Wrapper: chama a função multi com um único bloco
  return createClientPurchaseMulti(profile, [blockId], message)
}

// Compra de múltiplos blocos em uma única venda
export async function createClientPurchaseMulti(profile, blockIds, message) {
  const clientRec = await getClientByUser(profile.id)
  if (!clientRec) throw new Error('Você não está vinculado a um cliente.')
  if (!blockIds || blockIds.length === 0) throw new Error('Selecione pelo menos um bloco.')

  // 1. Busca dados de todos os blocos
  const { data: blocks, error: blockErr } = await supabase
    .from('blocks')
    .select('*')
    .in('id', blockIds)
  if (blockErr) throw blockErr
  if (!blocks || blocks.length === 0) throw new Error('Blocos não encontrados.')

  const soldOnes = blocks.filter(b => b.status === 'sold')
  if (soldOnes.length > 0) {
    throw new Error(`Os blocos ${soldOnes.map(b => b.code).join(', ')} já foram vendidos.`)
  }

  // Calcula totais por moeda
  const totalBRL = blocks.filter(b => b.currency === 'BRL').reduce((a, b) => a + (Number(b.total_value) || 0), 0)
  const totalUSD = blocks.filter(b => b.currency === 'USD').reduce((a, b) => a + (Number(b.total_value) || 0), 0)

  const codes = blocks.map(b => b.code).join(', ')

  // 2. Cria a venda (sem vendedor — compra direta do cliente)
  const { data: sale, error: saleError } = await supabase
    .from('sales')
    .insert({
      company_id: clientRec.company_id,
      seller_id: null,
      client_id: clientRec.id,
      payment_method_id: null,
      dollar_rate: null,
      total_brl: totalBRL,
      total_usd: totalUSD,
      obs: message ? `Compra direta pelo catálogo. ${message}` : 'Compra direta pelo catálogo.',
    })
    .select()
    .single()
  if (saleError) throw saleError

  // 3. Vincula todos os blocos à venda
  const saleBlocks = blockIds.map(bid => ({ sale_id: sale.id, block_id: bid }))
  await supabase.from('sale_blocks').insert(saleBlocks)

  // 4. Marca todos os blocos como vendidos
  await supabase.from('blocks').update({ status: 'sold', reserved_for: null }).in('id', blockIds)

  // 5. Notifica o dono e vendedores
  try {
    const { data: ownersAndSellers } = await supabase
      .from('profiles')
      .select('id')
      .eq('company_id', clientRec.company_id)
      .in('role', ['owner', 'seller'])

    if (ownersAndSellers && ownersAndSellers.length > 0) {
      const blocksText = blocks.length === 1
        ? `o bloco ${codes}`
        : `${blocks.length} blocos: ${codes}`
      const notifs = ownersAndSellers.map(p => ({
        user_id: p.id,
        company_id: clientRec.company_id,
        message: `🛒 ${clientRec.name} comprou ${blocksText}`,
        type: 'purchase',
        read: false,
      }))
      await supabase.from('notifications').insert(notifs)
    }
  } catch (e) {
    console.warn('Não foi possível notificar:', e)
  }

  return sale
}

export async function updateOrderStatus(id, status, message) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status, ...(message ? { message } : {}) })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── NOTIFICATIONS ──────────────────────────────────────────────
export async function listNotifications(profile) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return data || []
}

export async function createNotification(userId, companyId, message, type = 'info') {
  const { error } = await supabase
    .from('notifications')
    .insert({ user_id: userId, company_id: companyId, message, type })
  if (error) console.warn('Notification error:', error)
}

export async function markNotificationRead(id) {
  await supabase.from('notifications').update({ read: true }).eq('id', id)
}

export async function markAllNotificationsRead(profile) {
  await supabase.from('notifications').update({ read: true }).eq('user_id', profile.id).eq('read', false)
}

// ─── FAVORITES (cliente marca blocos preferidos) ────────────────
export async function listClientFavorites(profile) {
  const clientRec = await getClientByUser(profile.id)
  if (!clientRec) return []
  const { data, error } = await supabase
    .from('favorites')
    .select('block_id')
    .eq('client_id', clientRec.id)
  if (error) throw error
  return (data || []).map(f => f.block_id)
}

export async function toggleFavorite(profile, blockId) {
  const clientRec = await getClientByUser(profile.id)
  if (!clientRec) throw new Error('Cliente não vinculado')

  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('client_id', clientRec.id)
    .eq('block_id', blockId)
    .maybeSingle()

  if (existing) {
    await supabase.from('favorites').delete().eq('id', existing.id)
    return false
  } else {
    await supabase.from('favorites').insert({ client_id: clientRec.id, block_id: blockId })
    return true
  }
}
