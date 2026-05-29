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
  // Atualiza status do bloco
  const { error } = await supabase
    .from('blocks')
    .update({ status: 'reserved', reserved_for: clientId })
    .eq('id', blockId)
  if (error) throw error

  // Remove o bloco do catálogo dos OUTROS clientes (mantém apenas o cliente da reserva, se houver)
  try {
    const { error: delErr } = await supabase
      .from('block_releases')
      .delete()
      .eq('block_id', blockId)
      .neq('client_id', clientId)
    if (delErr) console.warn('Não foi possível remover releases:', delErr)
  } catch (e) {
    console.warn('Erro ao limpar releases:', e)
  }
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
  // Update sem requerer select() — evita erro de RLS no read-back
  const { error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', id)
  if (error) throw error
  return { id, ...payload }
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
  const { error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', profileId)
  if (error) throw error
  return { id: profileId, ...payload }
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
  console.log('[Realtime] Subscribing for company_id:', companyId)

  const handler = (table) => (payload) => {
    console.log(`[Realtime] ${table} event:`, payload.eventType, payload.new?.id || payload.old?.id)
    onChange(table)
  }

  const channel = supabase
    .channel('stoneblock-realtime-' + Date.now())
    .on('postgres_changes',
        { event: '*', schema: 'public', table: 'blocks', filter: `company_id=eq.${companyId}` },
        handler('blocks'))
    .on('postgres_changes',
        { event: '*', schema: 'public', table: 'quarries', filter: `company_id=eq.${companyId}` },
        handler('quarries'))
    .on('postgres_changes',
        { event: '*', schema: 'public', table: 'clients', filter: `company_id=eq.${companyId}` },
        handler('clients'))
    .on('postgres_changes',
        { event: '*', schema: 'public', table: 'payment_methods', filter: `company_id=eq.${companyId}` },
        handler('payment_methods'))
    .on('postgres_changes',
        { event: '*', schema: 'public', table: 'sales', filter: `company_id=eq.${companyId}` },
        handler('sales'))
    .on('postgres_changes',
        { event: '*', schema: 'public', table: 'block_releases', filter: `company_id=eq.${companyId}` },
        handler('block_releases'))
    .on('postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter: `company_id=eq.${companyId}` },
        handler('profiles'))
    .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${profile.id}` },
        handler('notifications'))
    .subscribe((status, err) => {
      console.log('[Realtime] Status:', status, err || '')
      if (status === 'SUBSCRIBED') {
        console.log('[Realtime] ✓ Connected successfully')
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.error('[Realtime] ✗ Connection problem:', status, err)
      }
    })

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

// ─── COMPRAS DO CLIENTE (vendas em que ele é o cliente) ─────────
export async function listClientSales(profile) {
  const clientRec = await getClientByUser(profile.id)
  if (!clientRec) return []

  const { data, error } = await supabase
    .from('sales')
    .select(`
      *,
      seller:profiles!seller_id(id, name, avatar),
      client:clients!client_id(id, name, country),
      payment_method:payment_methods!payment_method_id(id, name),
      sale_blocks(block_id, block:blocks(id, code, material, net_volume, total_value, currency, photos, classification, quarry_id, prod_date, gross_volume, gross_l, gross_h, gross_w, net_l, net_h, net_w, price_m3, notes, sys_code, status))
    `)
    .eq('client_id', clientRec.id)
    .order('created_at', { ascending: false })
  if (error) throw error

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

// Lista blocos comprados pelo cliente (achatado, com info da venda em cada bloco)
export async function listClientBoughtBlocks(profile) {
  const sales = await listClientSales(profile)
  const result = []
  sales.forEach(s => {
    (s.blocks || []).forEach(b => {
      result.push({
        ...b,
        sale_id: s.id,
        sale_date: s.created_at,
        sale_obs: s.obs,
        payment_method_name: s.payment_method?.name || null,
      })
    })
  })
  return result
}

// ═══════════════════════════════════════════════════════════════
// STONE BLOCK IND — Empresas Compradoras (Indústrias)
// ═══════════════════════════════════════════════════════════════

// ─── ADMIN: listar / criar / atualizar empresas ─────────────────
export async function adminListBuyerCompanies() {
  const { data, error } = await supabase
    .from('buyer_companies')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function adminListQuarryCompanies() {
  // Lista pedreiras (owners). Cada owner é uma empresa.
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, company_name, role, created_at, logo_url')
    .eq('role', 'owner')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function adminCreateBuyerCompany(payload, directorData) {
  // 1. Cria a empresa compradora
  const { data: company, error: companyError } = await supabase
    .from('buyer_companies')
    .insert({
      name: payload.name,
      document: payload.document || null,
      contact_email: payload.contact_email || null,
      contact_phone: payload.contact_phone || null,
      notes: payload.notes || null,
      active: true,
    })
    .select()
    .single()
  if (companyError) throw companyError

  // 2. Cria o diretor (conta no Auth)
  if (directorData?.email && directorData?.password) {
    // Passa buyer_company_id e buyer_role no metadata — o trigger handle_new_user
    // detecta esses campos e cria a profile já configurada como user de indústria.
    const user = await signUpUser(directorData.email, directorData.password, {
      name: directorData.name,
      buyer_company_id: company.id,
      buyer_role: 'director',
    })
    if (user?.id) {
      // Aguarda trigger criar profile (já com buyer_company_id e buyer_role corretos)
      let profileExists = false
      for (let i = 0; i < 6; i++) {
        await new Promise(r => setTimeout(r, 500))
        const { data: p } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle()
        if (p) { profileExists = true; break }
      }

      // Atualiza apenas o avatar (o resto já veio do trigger).
      // Não mexe em role / buyer_company_id / buyer_role pra evitar conflito com CHECK constraints.
      const profileData = {
        name: directorData.name,
        avatar: directorData.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase(),
      }

      if (profileExists) {
        await supabase.from('profiles').update(profileData).eq('id', user.id)
      } else {
        // Fallback: trigger não rodou. Insere manualmente com todos os campos.
        await supabase.from('profiles').insert({
          id: user.id,
          company_id: user.id,
          role: 'client',
          buyer_company_id: company.id,
          buyer_role: 'director',
          ...profileData,
        })
      }
    }
  }

  return company
}

export async function adminCreateQuarryCompany(ownerData) {
  // Cria conta de owner de pedreira
  if (!ownerData?.email || !ownerData?.password) {
    throw new Error('E-mail e senha do dono são obrigatórios')
  }

  const user = await signUpUser(ownerData.email, ownerData.password, {
    name: ownerData.name,
    role: 'owner',
  })

  if (!user?.id) throw new Error('Falha ao criar conta')

  // Aguarda trigger criar profile
  let profileExists = false
  for (let i = 0; i < 6; i++) {
    await new Promise(r => setTimeout(r, 500))
    const { data: p } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle()
    if (p) { profileExists = true; break }
  }

  // Owner é dono de si mesmo
  const profileData = {
    role: 'owner',
    company_id: user.id,
    company_name: ownerData.company_name || ownerData.name,
    name: ownerData.name,
    phone: ownerData.phone || null,
    avatar: ownerData.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase(),
  }

  if (profileExists) {
    await supabase.from('profiles').update(profileData).eq('id', user.id)
  } else {
    await supabase.from('profiles').insert({ id: user.id, ...profileData })
  }

  return { id: user.id, ...profileData }
}

export async function adminUpdateBuyerCompany(id, payload) {
  const { error } = await supabase
    .from('buyer_companies')
    .update(payload)
    .eq('id', id)
  if (error) throw error
  return { id, ...payload }
}

export async function adminToggleBuyerCompanyActive(id, active) {
  const { error } = await supabase
    .from('buyer_companies')
    .update({ active })
    .eq('id', id)
  if (error) throw error
}

// ─── PERFIL DA INDÚSTRIA (geral) ────────────────────────────────
export async function getBuyerCompany(buyerCompanyId) {
  const { data, error } = await supabase
    .from('buyer_companies')
    .select('*')
    .eq('id', buyerCompanyId)
    .maybeSingle()
  if (error) throw error
  return data
}

// ─── LISTAR PEDREIRAS EXTERNAS (admin e indústria) ──────────────
export async function listExternalQuarries(profile) {
  // Filtra por indústria (RLS já garante, mas filtra explicitamente)
  let q = supabase.from('external_quarries').select('*').order('name')
  if (profile?.buyer_company_id) {
    q = q.eq('buyer_company_id', profile.buyer_company_id)
  }
  const { data, error } = await q
  if (error) throw error
  return data || []
}

export async function findOrCreateExternalQuarry(profile, name, extra = {}) {
  if (!profile?.buyer_company_id) throw new Error('Sem indústria associada')
  // Busca por nome dentro da própria indústria
  const { data: existing } = await supabase
    .from('external_quarries')
    .select('*')
    .ilike('name', name.trim())
    .eq('buyer_company_id', profile.buyer_company_id)
    .maybeSingle()
  if (existing) return existing

  const { data, error } = await supabase
    .from('external_quarries')
    .insert({
      buyer_company_id: profile.buyer_company_id,
      name: name.trim(),
      location: extra.location || null,
      contact_phone: extra.contact_phone || null,
      contact_email: extra.contact_email || null,
      notes: extra.notes || null,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateExternalQuarry(id, payload) {
  const { error } = await supabase
    .from('external_quarries')
    .update(payload)
    .eq('id', id)
  if (error) throw error
}

export async function deleteExternalQuarry(id) {
  const { error } = await supabase
    .from('external_quarries')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ─── BUSCAR BLOCO POR CÓDIGO (em todas as pedreiras) ────────────
export async function searchBlockByCode(code) {
  if (!code || !code.trim()) return null
  const { data, error } = await supabase
    .from('blocks')
    .select('*')
    .ilike('code', code.trim())
    .limit(5)
  if (error) throw error
  return data || []
}

// ─── CARREGAR DADOS COMPLETOS DA INDÚSTRIA ──────────────────────
export async function loadBuyerCompanyData(profile) {
  const companyId = profile.buyer_company_id
  if (!companyId) return null

  const [
    company,
    team,
    inspections,
    externalBlocks,
    lists,
    carts,
    externalQuarries,
    visits,
    cartItems,
    purchases,
    purchaseOrders,
  ] = await Promise.all([
    getBuyerCompany(companyId),
    supabase.from('profiles').select('*').eq('buyer_company_id', companyId).then(r => r.data || []),
    supabase.from('block_inspections').select('*').eq('buyer_company_id', companyId).order('created_at', { ascending: false }).then(r => r.data || []),
    supabase.from('external_blocks').select('*').eq('buyer_company_id', companyId).order('created_at', { ascending: false }).then(r => r.data || []),
    supabase.from('interest_lists').select('*').eq('buyer_company_id', companyId).order('created_at', { ascending: false }).then(r => r.data || []),
    supabase.from('buyer_carts').select('*').eq('buyer_company_id', companyId).order('created_at', { ascending: false }).then(r => r.data || []),
    listExternalQuarries(profile),
    supabase.from('inspections').select('*').eq('buyer_company_id', companyId).order('visit_date', { ascending: false }).then(r => r.data || []).catch(() => []),
    (async () => {
      const { data: cs } = await supabase.from('buyer_carts').select('id').eq('buyer_company_id', companyId)
      if (!cs || cs.length === 0) return []
      const { data: items } = await supabase.from('buyer_cart_items').select('*').in('cart_id', cs.map(c => c.id))
      return items || []
    })(),
    supabase.from('purchases').select('*').eq('buyer_company_id', companyId).order('created_at', { ascending: false }).then(r => r.data || []).catch(() => []),
    supabase.from('purchase_orders').select('*').eq('buyer_company_id', companyId).order('created_at', { ascending: false }).then(r => r.data || []).catch(() => []),
  ])

  // Carrega itens das listas
  let listItems = []
  if (lists.length > 0) {
    const listIds = lists.map(l => l.id)
    const { data: items } = await supabase
      .from('interest_list_items')
      .select('*')
      .in('list_id', listIds)
      .order('added_at', { ascending: false })
    listItems = items || []
  }

  return {
    company,
    team,
    inspections: inspections.map(i => ({
      ...i,
      photos: Array.isArray(i.photos) ? i.photos : (i.photos ? JSON.parse(i.photos) : []),
    })),
    externalBlocks: externalBlocks.map(b => ({
      ...b,
      photos: Array.isArray(b.photos) ? b.photos : (b.photos ? JSON.parse(b.photos) : []),
    })),
    lists,
    listItems,
    carts,
    cartItems,
    externalQuarries,
    visits,
    purchases,
    purchaseOrders,
  }
}

// ─── CRIAR MEMBRO DA EQUIPE DA INDÚSTRIA ────────────────────────
export async function createBuyerTeamMember(profile, email, password, payload) {
  // profile = quem está criando (deve ser director)
  const buyerCompanyId = profile.buyer_company_id

  const user = await signUpUser(email, password, {
    name: payload.name,
    role: 'buyer_' + payload.buyer_role,
    buyer_company_id: buyerCompanyId,
    buyer_role: payload.buyer_role,
  })

  if (user?.id) {
    let profileExists = false
    for (let i = 0; i < 6; i++) {
      await new Promise(r => setTimeout(r, 500))
      const { data: p } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle()
      if (p) { profileExists = true; break }
    }

    const profileData = {
      role: 'buyer_' + payload.buyer_role,
      buyer_company_id: buyerCompanyId,
      buyer_role: payload.buyer_role,
      company_id: null,
      name: payload.name,
      phone: payload.phone || null,
      avatar: payload.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase(),
      is_active: true,
    }

    if (profileExists) {
      await supabase.from('profiles').update(profileData).eq('id', user.id)
    } else {
      await supabase.from('profiles').insert({ id: user.id, ...profileData })
    }
  }

  return user
}

// ─── EDITAR MEMBRO DA EQUIPE ────────────────────────────────────
export async function updateBuyerTeamMember(memberId, payload) {
  const cleanPayload = {}
  if (payload.name !== undefined) {
    cleanPayload.name = payload.name
    cleanPayload.avatar = payload.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  }
  if (payload.phone !== undefined) cleanPayload.phone = payload.phone || null
  if (payload.buyer_role !== undefined) {
    cleanPayload.buyer_role = payload.buyer_role
    cleanPayload.role = 'buyer_' + payload.buyer_role
  }
  const { error } = await supabase
    .from('profiles')
    .update(cleanPayload)
    .eq('id', memberId)
  if (error) throw error
  return { id: memberId, ...cleanPayload }
}

// ─── REVOGAR ACESSO (preserva cadastro) ─────────────────────────
export async function revokeBuyerTeamMember(memberId) {
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: false })
    .eq('id', memberId)
  if (error) throw error
}

// ─── REATIVAR ACESSO ────────────────────────────────────────────
export async function reactivateBuyerTeamMember(memberId) {
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: true })
    .eq('id', memberId)
  if (error) throw error
}

// ─── EXCLUIR MEMBRO (perde indústria, vira inactive) ────────────
export async function removeBuyerTeamMember(memberId) {
  const { error } = await supabase
    .from('profiles')
    .update({
      buyer_company_id: null,
      buyer_role: null,
      role: 'inactive',
      is_active: false,
    })
    .eq('id', memberId)
  if (error) throw error
}

// ─── LISTAS DE INTERESSE — funções extras ───────────────────────
export async function updateInterestList(id, payload) {
  const { error } = await supabase
    .from('interest_lists')
    .update(payload)
    .eq('id', id)
  if (error) throw error
}

export async function listAllItemsByList(buyerCompanyId) {
  // Retorna todos os itens de todas as listas da indústria
  const { data, error } = await supabase
    .from('interest_list_items')
    .select(`
      id, list_id, item_type, item_id, added_by, added_at,
      list:interest_lists!list_id(id, buyer_company_id, name)
    `)
  if (error) throw error
  return (data || []).filter(it => it.list?.buyer_company_id === buyerCompanyId)
}

// ─── UPLOAD DE FOTO PARA INSPEÇÃO OU BLOCO EXTERNO ──────────────
export async function uploadInspectionPhoto(profile, file, refCode) {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')
  const buyerId = profile.buyer_company_id || profile.id
  const cleanCode = (refCode || 'inspection').replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)
  const path = `${buyerId}/inspections/${Date.now()}_${cleanCode}.${ext || 'jpg'}`

  const { error } = await supabase.storage
    .from('block-photos')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'image/jpeg',
    })
  if (error) throw new Error(error.message || 'Falha no upload')

  const { data } = supabase.storage.from('block-photos').getPublicUrl(path)
  return data.publicUrl
}

// ─── CRIAR INSPEÇÃO DE BLOCO (pedreira cadastrada) ──────────────
export async function createInspection(profile, payload) {
  // Calcula volumes automaticamente se medidas estiverem presentes
  const grossVol = (payload.negotiated_gross_l && payload.negotiated_gross_h && payload.negotiated_gross_w)
    ? parseFloat(payload.negotiated_gross_l) * parseFloat(payload.negotiated_gross_h) * parseFloat(payload.negotiated_gross_w)
    : null
  const netVol = (payload.negotiated_l && payload.negotiated_h && payload.negotiated_w)
    ? parseFloat(payload.negotiated_l) * parseFloat(payload.negotiated_h) * parseFloat(payload.negotiated_w)
    : null

  const { data, error } = await supabase
    .from('block_inspections')
    .insert({
      original_block_id: payload.original_block_id,
      inspection_id: payload.inspection_id || null,
      buyer_company_id: profile.buyer_company_id,
      marker_id: profile.id,
      photos: payload.photos || [],
      notes: payload.notes || null,
      negotiated_value: payload.negotiated_value || null,
      negotiated_price_m3: payload.negotiated_price_m3 || null,
      negotiated_currency: payload.negotiated_currency || 'USD',
      negotiated_gross_l: payload.negotiated_gross_l || null,
      negotiated_gross_h: payload.negotiated_gross_h || null,
      negotiated_gross_w: payload.negotiated_gross_w || null,
      negotiated_gross_volume: grossVol,
      negotiated_l: payload.negotiated_l || null,
      negotiated_h: payload.negotiated_h || null,
      negotiated_w: payload.negotiated_w || null,
      negotiated_net_volume: netVol,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateInspection(id, payload) {
  const cleanPayload = { ...payload, updated_at: new Date().toISOString() }
  delete cleanPayload.id
  delete cleanPayload.buyer_company_id
  delete cleanPayload.marker_id
  delete cleanPayload.created_at

  // Recalcula volumes
  if (cleanPayload.negotiated_gross_l && cleanPayload.negotiated_gross_h && cleanPayload.negotiated_gross_w) {
    cleanPayload.negotiated_gross_volume = parseFloat(cleanPayload.negotiated_gross_l) * parseFloat(cleanPayload.negotiated_gross_h) * parseFloat(cleanPayload.negotiated_gross_w)
  }
  if (cleanPayload.negotiated_l && cleanPayload.negotiated_h && cleanPayload.negotiated_w) {
    cleanPayload.negotiated_net_volume = parseFloat(cleanPayload.negotiated_l) * parseFloat(cleanPayload.negotiated_h) * parseFloat(cleanPayload.negotiated_w)
  }

  const { error } = await supabase
    .from('block_inspections')
    .update(cleanPayload)
    .eq('id', id)
  if (error) throw error
}

export async function deleteInspection(id) {
  const { error } = await supabase
    .from('block_inspections')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ─── CRIAR BLOCO EXTERNO ────────────────────────────────────────
export async function createExternalBlock(profile, payload) {
  const { data, error } = await supabase
    .from('external_blocks')
    .insert({
      ...payload,
      buyer_company_id: profile.buyer_company_id,
      marker_id: profile.id,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateExternalBlock(id, payload) {
  const cleanPayload = { ...payload, updated_at: new Date().toISOString() }
  delete cleanPayload.id
  delete cleanPayload.buyer_company_id
  delete cleanPayload.marker_id
  delete cleanPayload.created_at
  const { error } = await supabase
    .from('external_blocks')
    .update(cleanPayload)
    .eq('id', id)
  if (error) throw error
}

export async function deleteExternalBlock(id) {
  const { error } = await supabase.from('external_blocks').delete().eq('id', id)
  if (error) throw error
}

// ─── LISTAS DE INTERESSE ────────────────────────────────────────
export async function createInterestList(profile, name) {
  const { data, error } = await supabase
    .from('interest_lists')
    .insert({
      buyer_company_id: profile.buyer_company_id,
      name,
      created_by: profile.id,
      shared_internal: true,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function addListItem(listId, itemType, itemId, profile) {
  const { error } = await supabase
    .from('interest_list_items')
    .insert({
      list_id: listId,
      item_type: itemType,
      item_id: itemId,
      added_by: profile.id,
    })
  if (error) throw error
}

export async function removeListItem(itemId) {
  const { error } = await supabase
    .from('interest_list_items')
    .delete()
    .eq('id', itemId)
  if (error) throw error
}

export async function deleteList(id) {
  const { error } = await supabase.from('interest_lists').delete().eq('id', id)
  if (error) throw error
}

export async function listItemsForList(listId) {
  const { data, error } = await supabase
    .from('interest_list_items')
    .select('*')
    .eq('list_id', listId)
    .order('position')
  if (error) throw error
  return data || []
}

// ─── CARRINHOS ──────────────────────────────────────────────────
export async function createCart(profile, name) {
  const { data, error } = await supabase
    .from('buyer_carts')
    .insert({
      buyer_company_id: profile.buyer_company_id,
      created_by: profile.id,
      name: name || `Carrinho ${new Date().toLocaleDateString('pt-BR')}`,
      status: 'draft',
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function addCartItem(cartId, itemType, itemId, profile) {
  const { error } = await supabase
    .from('buyer_cart_items')
    .insert({
      cart_id: cartId,
      item_type: itemType,
      item_id: itemId,
      added_by: profile.id,
    })
  if (error) throw error
}

export async function removeCartItem(itemId) {
  const { error } = await supabase
    .from('buyer_cart_items')
    .delete()
    .eq('id', itemId)
  if (error) throw error
}

export async function listCartItems(cartId) {
  const { data, error } = await supabase
    .from('buyer_cart_items')
    .select('*')
    .eq('cart_id', cartId)
    .order('position')
  if (error) throw error
  return data || []
}

export async function confirmCart(cartId, profile, romaneioUrl) {
  const { error } = await supabase
    .from('buyer_carts')
    .update({
      status: 'confirmed',
      confirmed_by: profile.id,
      confirmed_at: new Date().toISOString(),
      romaneio_url: romaneioUrl || null,
    })
    .eq('id', cartId)
  if (error) throw error
}

export async function cancelCart(cartId) {
  const { error } = await supabase
    .from('buyer_carts')
    .update({ status: 'cancelled' })
    .eq('id', cartId)
  if (error) throw error
}


// ═══════════════════════════════════════════════════════════════
// VISITAS (INSPEÇÕES) — uma visita = um registro a uma pedreira
// ═══════════════════════════════════════════════════════════════

export async function listInspections(profile) {
  if (!profile?.buyer_company_id) return []
  const { data, error } = await supabase
    .from('inspections')
    .select('*')
    .eq('buyer_company_id', profile.buyer_company_id)
    .order('visit_date', { ascending: false })
  if (error) throw error
  return data || []
}

export async function createInspectionVisit(profile, payload) {
  if (!profile?.buyer_company_id) throw new Error('Sem indústria associada')
  const { data, error } = await supabase
    .from('inspections')
    .insert({
      buyer_company_id: profile.buyer_company_id,
      marker_id: profile.id,
      quarry_company_id: payload.quarry_company_id || null,
      external_quarry_id: payload.external_quarry_id || null,
      uses_stone_block: !!payload.uses_stone_block,
      visit_date: payload.visit_date || new Date().toISOString(),
      notes: payload.notes || null,
      status: 'open',
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateInspectionVisit(id, payload) {
  const clean = { ...payload, updated_at: new Date().toISOString() }
  delete clean.id
  delete clean.buyer_company_id
  delete clean.marker_id
  delete clean.created_at
  const { error } = await supabase
    .from('inspections')
    .update(clean)
    .eq('id', id)
  if (error) throw error
}

export async function closeInspectionVisit(id) {
  const { error } = await supabase
    .from('inspections')
    .update({ status: 'closed', closed_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function reopenInspectionVisit(id) {
  const { error } = await supabase
    .from('inspections')
    .update({ status: 'open', closed_at: null })
    .eq('id', id)
  if (error) throw error
}

export async function deleteInspectionVisit(id) {
  const { error } = await supabase
    .from('inspections')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// Lista todos os blocos (inspections + externals) de uma visita
export async function listBlocksForInspectionVisit(inspectionId) {
  const [{ data: insp }, { data: ext }] = await Promise.all([
    supabase.from('block_inspections').select('*').eq('inspection_id', inspectionId),
    supabase.from('external_blocks').select('*').eq('inspection_id', inspectionId),
  ])
  return {
    inspections: (insp || []).map(i => ({
      ...i,
      photos: Array.isArray(i.photos) ? i.photos : (i.photos ? JSON.parse(i.photos) : []),
    })),
    externals: (ext || []).map(b => ({
      ...b,
      photos: Array.isArray(b.photos) ? b.photos : (b.photos ? JSON.parse(b.photos) : []),
    })),
  }
}

// ─── BUSCAR BLOCO PARA INSPEÇÃO (busca em pedreiras Stone Block) ──
export async function searchBlockForInspection(codeOrSysCode) {
  if (!codeOrSysCode || !codeOrSysCode.trim()) return []
  const q = codeOrSysCode.trim()
  // Busca em ambos: code e sys_code (se existir esta coluna)
  const { data, error } = await supabase
    .from('blocks')
    .select('*')
    .or(`code.ilike.${q},sys_code.ilike.${q}`)
    .limit(5)
  if (error) {
    // Se a coluna sys_code não existir, faz fallback só por code
    const { data: d2 } = await supabase
      .from('blocks')
      .select('*')
      .ilike('code', q)
      .limit(5)
    return d2 || []
  }
  return data || []
}


// ═══════════════════════════════════════════════════════════════
// FINALIZAR COMPRA — transação completa entre indústria e pedreira
// ═══════════════════════════════════════════════════════════════

// Lista os payment_methods de uma pedreira específica (para a indústria escolher)
export async function listPaymentMethodsForQuarry(quarryCompanyId) {
  if (!quarryCompanyId) return []
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('company_id', quarryCompanyId)
  if (error) {
    console.warn('Não foi possível listar payment_methods da pedreira:', error)
    return []
  }
  return data || []
}

// Lista catálogo de blocos liberados das pedreiras (todas) para a indústria visualizar
// Hoje: marketplace público — todos os blocos com status disponível
export async function listIndQuarryCatalog(profile) {
  // Mostra apenas blocos LIBERADOS para a indústria.
  // A pedreira libera blocos para um cliente do CRM, e esse cliente está
  // vinculado ao buyer_company_id da indústria (coluna clients.buyer_company_id).
  if (!profile?.buyer_company_id) return []

  // 1. Acha os clientes (em qualquer pedreira) vinculados a esta indústria
  const { data: linkedClients, error: clientErr } = await supabase
    .from('clients')
    .select('id')
    .eq('buyer_company_id', profile.buyer_company_id)
  if (clientErr) {
    console.warn('Erro ao buscar clientes vinculados:', clientErr)
    return []
  }
  if (!linkedClients || linkedClients.length === 0) return []

  const clientIds = linkedClients.map(c => c.id)

  // 2. Acha os block_releases para esses clientes
  const { data: releases, error: relErr } = await supabase
    .from('block_releases')
    .select('block:blocks(*, quarry:quarries(name, location))')
    .in('client_id', clientIds)
  if (relErr) {
    console.warn('Erro ao buscar releases:', relErr)
    return []
  }

  // 3. Deduplica blocos (um bloco pode estar liberado pra mais de um cliente da mesma indústria)
  // Filtra blocos com status 'reserved' (pedido pendente) e 'sold' (já vendidos)
  const seen = new Set()
  const blocks = []
  for (const r of (releases || [])) {
    const b = r.block
    if (!b || seen.has(b.id)) continue
    // Filtra fora os blocos não-disponíveis
    if (b.status === 'reserved' || b.status === 'sold') continue
    seen.add(b.id)
    blocks.push({
      ...b,
      quarry_name: b.quarry?.name || null,
      photos: Array.isArray(b.photos) ? b.photos
        : (typeof b.photos === 'string' ? (b.photos.startsWith('[') ? JSON.parse(b.photos) : [b.photos]) : []),
    })
  }
  return blocks
}

// Cria notificação (helper) — versão Ind
async function createIndNotification(userId, title, body, link) {
  try {
    await supabase.from('notifications').insert({
      user_id: userId,
      title,
      body,
      link: link || null,
      read: false,
    })
  } catch (e) {
    console.warn('Falha ao criar notificação:', e)
  }
}

// Finaliza a compra de uma inspeção
// payload: {
//   dollar_rate: number,
//   payment_method_id: uuid (opcional),
//   payment_method_name: string,
//   notes: string,
//   blocks: [{ inspection_id, original_block_id, value, currency, gross_l, gross_h, gross_w, net_l, net_h, net_w }, ...]
//     -- para blocos Stone Block: passar inspection_id + original_block_id
//     -- para externos: passar external_block_id + value+currency
//   externalBlocks: [{ id, value, currency, ... }]
// }
export async function finalizeInspectionPurchase(profile, visitId, payload) {
  if (!profile?.buyer_company_id) throw new Error('Sem indústria associada')

  // 1. Carrega dados da visita
  const { data: visit, error: visitError } = await supabase
    .from('inspections')
    .select('*')
    .eq('id', visitId)
    .single()
  if (visitError) throw visitError

  // 2. Carrega dados da empresa compradora
  const { data: buyerCompany } = await supabase
    .from('buyer_companies')
    .select('*')
    .eq('id', profile.buyer_company_id)
    .single()

  // 3. Carrega blocos vinculados à inspeção (inspeções de blocos + externos)
  const { data: insps } = await supabase
    .from('block_inspections')
    .select('*')
    .eq('inspection_id', visitId)
  const { data: externs } = await supabase
    .from('external_blocks')
    .select('*')
    .eq('inspection_id', visitId)

  const usesStoneBlock = visit.uses_stone_block

  // 4. Se for Stone Block, descobre a quarry_company_id (pelo primeiro bloco original)
  let quarryCompanyId = null
  let originalBlocks = []
  if (usesStoneBlock && insps && insps.length > 0) {
    const origIds = insps.map(i => i.original_block_id)
    const { data: blocks } = await supabase
      .from('blocks')
      .select('*')
      .in('id', origIds)
    originalBlocks = blocks || []
    if (originalBlocks.length > 0) {
      quarryCompanyId = originalBlocks[0].company_id
    }
  }

  // 5. Calcula totais
  let totalBRL = 0
  let totalUSD = 0
  const blockSummary = [] // pra usar em romaneio

  for (const i of (insps || [])) {
    const orig = originalBlocks.find(b => b.id === i.original_block_id)
    const val = Number(i.negotiated_value) || Number(orig?.total_value) || 0
    const cur = i.negotiated_currency || orig?.currency || 'USD'
    if (cur === 'USD') totalUSD += val
    else totalBRL += val
    blockSummary.push({
      code: orig?.code || '?',
      material: orig?.material || '—',
      value: val,
      currency: cur,
      type: 'inspection',
      ref_id: i.id,
      original_block_id: i.original_block_id,
    })
  }

  for (const b of (externs || [])) {
    const val = Number(b.total_value) || 0
    const cur = b.currency || 'USD'
    if (cur === 'USD') totalUSD += val
    else totalBRL += val
    blockSummary.push({
      code: b.code,
      material: b.material,
      value: val,
      currency: cur,
      type: 'external',
      ref_id: b.id,
    })
  }

  const dollarRate = Number(payload.dollar_rate) || 0
  // total convertido para BRL para registro contábil
  let totalCombinedBRL = totalBRL + (totalUSD * dollarRate)

  // 6. Se for Stone Block, cria/atualiza cliente na pedreira + registra venda
  let saleId = null
  let clientIdOnQuarry = null
  let paymentMethodIdInQuarry = null

  if (usesStoneBlock && quarryCompanyId && insps && insps.length > 0) {
    // 6a. Procura cliente existente na pedreira pelo nome da indústria
    const buyerName = buyerCompany?.name || 'Indústria'
    const { data: existingClient } = await supabase
      .from('clients')
      .select('*')
      .eq('company_id', quarryCompanyId)
      .ilike('name', buyerName)
      .maybeSingle()

    if (existingClient) {
      clientIdOnQuarry = existingClient.id
    } else {
      const { data: newClient, error: clientErr } = await supabase
        .from('clients')
        .insert({
          company_id: quarryCompanyId,
          name: buyerName,
          country: 'BR',
          email: buyerCompany?.contact_email || null,
          phone: buyerCompany?.contact_phone || null,
        })
        .select()
        .single()
      if (clientErr) {
        console.warn('Erro ao criar cliente automático na pedreira:', clientErr)
      } else {
        clientIdOnQuarry = newClient.id
      }
    }

    // 6b. Cria a venda no lado da pedreira (sales)
    if (clientIdOnQuarry) {
      const salePayload = {
        company_id: quarryCompanyId,
        client_id: clientIdOnQuarry,
        seller_id: null, // Venda direta marketplace
        payment_method_id: payload.payment_method_id || null,
        total_brl: totalBRL,
        total_usd: totalUSD,
        dollar_rate: dollarRate || null,
        obs: `Venda Direta - Stone Block Marketplace${payload.notes ? '\n' + payload.notes : ''}`,
      }

      const { data: newSale, error: saleErr } = await supabase
        .from('sales')
        .insert(salePayload)
        .select()
        .single()
      if (saleErr) {
        console.warn('Erro ao criar venda na pedreira:', saleErr)
      } else {
        saleId = newSale.id

        // 6c. Cria sale_blocks (vincula blocos à venda)
        const saleBlocksToInsert = blockSummary
          .filter(b => b.type === 'inspection' && b.original_block_id)
          .map(b => ({
            sale_id: saleId,
            block_id: b.original_block_id,
          }))
        if (saleBlocksToInsert.length > 0) {
          const { error: sbErr } = await supabase
            .from('sale_blocks')
            .insert(saleBlocksToInsert)
          if (sbErr) console.warn('Erro ao criar sale_blocks:', sbErr)
        }

        // 6d. Atualiza blocos: sobrescreve com valores negociados e preserva histórico
        for (const i of (insps || [])) {
          const orig = originalBlocks.find(b => b.id === i.original_block_id)
          if (!orig) continue

          // Verifica se já foi sobrescrito antes (não sobrescreve duas vezes o histórico)
          const alreadyOverridden = orig.overridden_by_buyer_at != null

          const update = { status: 'sold' }

          // Preserva valores originais SE for primeira sobrescrita
          if (!alreadyOverridden) {
            update.original_gross_l = orig.gross_l
            update.original_gross_h = orig.gross_h
            update.original_gross_w = orig.gross_w
            update.original_gross_volume = orig.gross_volume
            update.original_net_l = orig.net_l
            update.original_net_h = orig.net_h
            update.original_net_w = orig.net_w
            update.original_net_volume = orig.net_volume
            update.original_total_value = orig.total_value
            update.original_price_m3 = orig.price_m3
            update.original_currency = orig.currency
          }

          // Sobrescreve com valores negociados (se houver)
          if (i.negotiated_gross_l) update.gross_l = i.negotiated_gross_l
          if (i.negotiated_gross_h) update.gross_h = i.negotiated_gross_h
          if (i.negotiated_gross_w) update.gross_w = i.negotiated_gross_w
          if (i.negotiated_gross_volume) update.gross_volume = i.negotiated_gross_volume
          if (i.negotiated_l) update.net_l = i.negotiated_l
          if (i.negotiated_h) update.net_h = i.negotiated_h
          if (i.negotiated_w) update.net_w = i.negotiated_w
          if (i.negotiated_net_volume) update.net_volume = i.negotiated_net_volume
          if (i.negotiated_value) {
            update.total_value = i.negotiated_value
            update.currency = i.negotiated_currency || orig.currency
            // Recalcula price_m3 com base no volume líquido
            const useVolume = i.negotiated_net_volume || orig.net_volume
            if (useVolume > 0) update.price_m3 = i.negotiated_value / useVolume
          }

          update.sold_dollar_rate = dollarRate || null
          update.overridden_by_buyer_at = new Date().toISOString()
          update.overridden_by_buyer_id = profile.buyer_company_id

          const { error: updErr } = await supabase
            .from('blocks')
            .update(update)
            .eq('id', orig.id)
          if (updErr) console.warn('Erro ao atualizar bloco com valores negociados:', updErr)
        }
      }
    }
  }

  // 7. Atualiza status dos blocos externos
  if (externs && externs.length > 0) {
    const extIds = externs.map(b => b.id)
    await supabase
      .from('external_blocks')
      .update({ status: 'bought' })
      .in('id', extIds)
  }

  // 8. Cria registro em purchases (lado indústria)
  const { data: purchase, error: purchaseErr } = await supabase
    .from('purchases')
    .insert({
      buyer_company_id: profile.buyer_company_id,
      inspection_id: visitId,
      total_brl: totalBRL,
      total_usd: totalUSD,
      total_value: totalUSD > 0 ? totalUSD : totalBRL,
      total_currency: totalUSD > 0 ? 'USD' : 'BRL',
      dollar_rate: dollarRate || null,
      payment_method_name: payload.payment_method_name || null,
      payment_method_id: payload.payment_method_id || null,
      notes: payload.notes || null,
      quarry_company_id: quarryCompanyId,
      external_quarry_id: visit.external_quarry_id || null,
      sale_id: saleId,
      client_id_on_quarry: clientIdOnQuarry,
      finalized_by: profile.id,
    })
    .select()
    .single()
  if (purchaseErr) throw purchaseErr

  // 9. Atualiza inspeção para status 'finalized'
  await supabase
    .from('inspections')
    .update({
      status: 'closed',
      finalized_at: new Date().toISOString(),
      finalized_by: profile.id,
      closed_at: new Date().toISOString(),
    })
    .eq('id', visitId)

  // 10. Cria notificações
  // 10a. Para equipe da indústria
  const { data: buyerTeam } = await supabase
    .from('profiles')
    .select('id')
    .eq('buyer_company_id', profile.buyer_company_id)
  for (const t of (buyerTeam || [])) {
    await createIndNotification(
      t.id,
      '✅ Compra finalizada',
      `${buyerCompany?.name || 'A empresa'} finalizou uma compra de ${blockSummary.length} bloco(s).`
    )
  }
  // 10b. Para equipe da pedreira (se Stone Block)
  if (usesStoneBlock && quarryCompanyId) {
    const { data: quarryTeam } = await supabase
      .from('profiles')
      .select('id')
      .or(`id.eq.${quarryCompanyId},company_id.eq.${quarryCompanyId}`)
    for (const t of (quarryTeam || [])) {
      await createIndNotification(
        t.id,
        '🎉 Nova venda direta!',
        `${buyerCompany?.name || 'Uma indústria'} comprou ${blockSummary.length} bloco(s) — Total US$${totalUSD.toFixed(2)} / R$${totalBRL.toFixed(2)}`
      )
    }
  }

  return { purchase, saleId, blockSummary, totalBRL, totalUSD }
}

// Lista compras finalizadas da indústria
export async function listPurchases(profile) {
  if (!profile?.buyer_company_id) return []
  const { data, error } = await supabase
    .from('purchases')
    .select('*')
    .eq('buyer_company_id', profile.buyer_company_id)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}


// ═══════════════════════════════════════════════════════════════
// ETAPA 7 — Listar Indústrias Stone Block (lado pedreira)
// ═══════════════════════════════════════════════════════════════

// Pedreira chama isto pra ver indústrias Stone Block disponíveis
// pra liberar catálogo direto. Retorna indústrias que AINDA não são
// clientes da pedreira.
export async function listBuyerCompaniesForQuarry(profile) {
  const companyId = profile.role === 'owner' ? profile.id : (profile.company_id || profile.id)

  // 1. Pega todas as indústrias
  const { data: buyers, error: bErr } = await supabase
    .from('buyer_companies')
    .select('*')
    .order('name')
  if (bErr) throw bErr

  // 2. Pega clients da pedreira que já têm vínculo
  const { data: existingClients } = await supabase
    .from('clients')
    .select('id, name, buyer_company_id')
    .eq('company_id', companyId)
    .not('buyer_company_id', 'is', null)

  const linkedBuyerIds = new Set((existingClients || []).map(c => c.buyer_company_id))

  // 3. Marca cada indústria como vinculada ou não
  return (buyers || []).map(b => ({
    ...b,
    is_linked: linkedBuyerIds.has(b.id),
    linked_client: (existingClients || []).find(c => c.buyer_company_id === b.id) || null,
  }))
}

// Cria cliente vinculado a uma indústria (pedreira chama)
export async function createClientLinkedToBuyer(profile, buyerCompany) {
  const companyId = profile.role === 'owner' ? profile.id : (profile.company_id || profile.id)

  // Verifica se já existe
  const { data: existing } = await supabase
    .from('clients')
    .select('*')
    .eq('company_id', companyId)
    .eq('buyer_company_id', buyerCompany.id)
    .maybeSingle()

  if (existing) return existing

  const { data: newClient, error } = await supabase
    .from('clients')
    .insert({
      company_id: companyId,
      buyer_company_id: buyerCompany.id,
      name: buyerCompany.name,
      country: 'BR',
      email: buyerCompany.contact_email || null,
      phone: buyerCompany.contact_phone || null,
    })
    .select()
    .single()
  if (error) throw error
  return newClient
}

// ═══════════════════════════════════════════════════════════════
// ETAPA 7 — Adicionar bloco do catálogo a uma inspeção (lado indústria)
// ═══════════════════════════════════════════════════════════════

// Lista inspeções ABERTAS da indústria em uma pedreira específica
export async function listOpenVisitsForQuarry(profile, quarryCompanyId) {
  if (!profile?.buyer_company_id) return []
  // Acha as pedreiras externas dessa indústria que apontam pra essa pedreira Stone Block (se vincularam)
  // Mas como external_quarry não tem vínculo direto com quarry_company_id, fazemos pelo nome OU criamos vínculo
  // Por simplicidade: lista todas as visitas abertas da indústria que têm uses_stone_block = true
  const { data, error } = await supabase
    .from('inspections')
    .select('*')
    .eq('buyer_company_id', profile.buyer_company_id)
    .eq('status', 'open')
    .order('visit_date', { ascending: false })
  if (error) throw error
  return data || []
}

// Cria inspeção rápida (sem pedreira externa específica) e adiciona o bloco
export async function quickCreateVisitWithBlock(profile, blockOriginal, options = {}) {
  if (!profile?.buyer_company_id) throw new Error('Sem indústria associada')

  // Cria inspeção marcando uses_stone_block = true
  const { data: visit, error: visitError } = await supabase
    .from('inspections')
    .insert({
      buyer_company_id: profile.buyer_company_id,
      marker_id: profile.id,
      external_quarry_id: options.external_quarry_id || null,
      uses_stone_block: true,
      visit_date: new Date().toISOString(),
      notes: options.notes || 'Adicionado direto do Catálogo da Pedreira',
      status: 'open',
    })
    .select()
    .single()
  if (visitError) throw visitError

  // Cria block_inspection vinculado
  await createInspection(profile, {
    original_block_id: blockOriginal.id,
    inspection_id: visit.id,
    photos: [],
    notes: null,
    negotiated_value: blockOriginal.total_value || null,
    negotiated_currency: blockOriginal.currency || 'USD',
  })

  return visit
}

// Adiciona bloco do catálogo a uma inspeção já aberta
export async function addCatalogBlockToVisit(profile, blockOriginal, visitId) {
  if (!profile?.buyer_company_id) throw new Error('Sem indústria associada')

  return await createInspection(profile, {
    original_block_id: blockOriginal.id,
    inspection_id: visitId,
    photos: [],
    notes: null,
    negotiated_value: blockOriginal.total_value || null,
    negotiated_currency: blockOriginal.currency || 'USD',
  })
}

// ═══════════════════════════════════════════════════════════════
// PEDIDO DE COMPRA — fluxo completo (Etapa 8)
// ═══════════════════════════════════════════════════════════════

// Indústria: envia pedido de compra a partir de uma inspeção
export async function sendPurchaseOrder(profile, visitId, payload) {
  if (!profile?.buyer_company_id) throw new Error('Sem indústria associada')

  // 1. Carrega dados
  const { data: visit, error: visitErr } = await supabase
    .from('inspections').select('*').eq('id', visitId).single()
  if (visitErr) throw visitErr
  if (!visit.uses_stone_block) {
    throw new Error('Pedidos só funcionam com pedreiras Stone Block. Para externas, use Finalizar Compra.')
  }

  const { data: buyerCompany } = await supabase
    .from('buyer_companies').select('*').eq('id', profile.buyer_company_id).single()

  const { data: insps } = await supabase
    .from('block_inspections').select('*').eq('inspection_id', visitId)
  if (!insps || insps.length === 0) {
    throw new Error('Nenhum bloco inspecionado nesta visita.')
  }

  // 2. Carrega blocos originais
  const origIds = insps.map(i => i.original_block_id)
  const { data: blocks } = await supabase
    .from('blocks').select('*').in('id', origIds)

  if (!blocks || blocks.length === 0) {
    throw new Error('Blocos originais não encontrados.')
  }
  const quarryCompanyId = blocks[0].company_id

  // 3. Calcula totais (prioriza preço por m³)
  let totalBRL = 0, totalUSD = 0
  for (const i of insps) {
    const orig = blocks.find(b => b.id === i.original_block_id)
    const nVol = i.negotiated_net_volume || orig?.net_volume || 0
    let val
    if (i.negotiated_price_m3 && nVol > 0) {
      val = Number(i.negotiated_price_m3) * nVol
    } else if (i.negotiated_value) {
      val = Number(i.negotiated_value)
    } else {
      val = Number(orig?.total_value) || 0
    }
    const cur = i.negotiated_currency || orig?.currency || 'USD'
    if (cur === 'USD') totalUSD += val
    else totalBRL += val
  }

  // 4. Cria purchase_order
  const { data: order, error: orderErr } = await supabase
    .from('purchase_orders')
    .insert({
      buyer_company_id: profile.buyer_company_id,
      inspection_id: visitId,
      quarry_company_id: quarryCompanyId,
      status: 'pending',
      total_brl: totalBRL,
      total_usd: totalUSD,
      dollar_rate: payload.dollar_rate || null,
      payment_method_id: payload.payment_method_id || null,
      payment_method_name: payload.payment_method_name || null,
      notes: payload.notes || null,
      sent_by: profile.id,
      sent_at: new Date().toISOString(),
    }).select().single()
  if (orderErr) throw orderErr

  // 5. Cria items (snapshot dos blocos)
  const items = insps.map(i => {
    const orig = blocks.find(b => b.id === i.original_block_id)
    const gL = i.negotiated_gross_l || orig?.gross_l
    const gH = i.negotiated_gross_h || orig?.gross_h
    const gW = i.negotiated_gross_w || orig?.gross_w
    const gVol = i.negotiated_gross_volume || orig?.gross_volume
    const nL = i.negotiated_l || orig?.net_l
    const nH = i.negotiated_h || orig?.net_h
    const nW = i.negotiated_w || orig?.net_w
    const nVol = i.negotiated_net_volume || orig?.net_volume
    const cur = i.negotiated_currency || orig?.currency || 'USD'

    // Cálculo do valor: prioridade ao preço por m³ negociado
    let val, m3
    if (i.negotiated_price_m3 && nVol > 0) {
      m3 = Number(i.negotiated_price_m3)
      val = m3 * nVol
    } else if (i.negotiated_value) {
      val = Number(i.negotiated_value)
      m3 = nVol > 0 ? val / nVol : null
    } else {
      val = Number(orig?.total_value) || 0
      m3 = Number(orig?.price_m3) || (nVol > 0 ? val / nVol : null)
    }

    return {
      purchase_order_id: order.id,
      block_id: orig?.id,
      block_inspection_id: i.id,
      code: orig?.code,
      material: orig?.material,
      gross_l: gL, gross_h: gH, gross_w: gW, gross_volume: gVol,
      net_l: nL, net_h: nH, net_w: nW, net_volume: nVol,
      total_value: val,
      currency: cur,
      price_m3: m3,
    }
  })
  await supabase.from('purchase_order_items').insert(items)

  // 6. Reserva os blocos (status = 'reserved')
  await supabase.from('blocks').update({ status: 'reserved' }).in('id', origIds)

  // 7. Marca inspeção como "awaiting"
  await supabase.from('inspections').update({
    status: 'closed',
    order_status: 'awaiting',
  }).eq('id', visitId)

  // 8. Notifica equipe da pedreira (todos)
  const { data: quarryTeam } = await supabase
    .from('profiles').select('id')
    .or(`id.eq.${quarryCompanyId},company_id.eq.${quarryCompanyId}`)
  for (const t of (quarryTeam || [])) {
    await createIndNotification(
      t.id,
      '📥 Novo Pedido de Compra',
      `${buyerCompany?.name || 'Uma indústria'} enviou um pedido com ${insps.length} bloco(s). Total US$${totalUSD.toFixed(2)} / R$${totalBRL.toFixed(2)}`
    )
  }

  // 9. Notifica equipe da indústria
  const { data: buyerTeam } = await supabase
    .from('profiles').select('id').eq('buyer_company_id', profile.buyer_company_id)
  for (const t of (buyerTeam || [])) {
    await createIndNotification(
      t.id,
      '📤 Pedido enviado',
      `Pedido com ${insps.length} bloco(s) enviado. Aguardando aprovação.`
    )
  }

  return { order, itemsCount: items.length, totalBRL, totalUSD }
}

// Lista pedidos da indústria (todos os status)
export async function listPurchaseOrdersForBuyer(profile) {
  if (!profile?.buyer_company_id) return []
  const { data, error } = await supabase
    .from('purchase_orders').select('*')
    .eq('buyer_company_id', profile.buyer_company_id)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

// Lista pedidos chegando na pedreira
export async function listPurchaseOrdersForQuarry(profile) {
  const companyId = profile.role === 'owner' ? profile.id : (profile.company_id || profile.id)
  const { data, error } = await supabase
    .from('purchase_orders').select('*')
    .eq('quarry_company_id', companyId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

// Carrega itens de um pedido
export async function listPurchaseOrderItems(orderId) {
  const { data, error } = await supabase
    .from('purchase_order_items').select('*')
    .eq('purchase_order_id', orderId)
  if (error) throw error
  return data || []
}

// Indústria cancela pedido (enquanto pendente)
export async function cancelPurchaseOrder(profile, orderId) {
  const { data: order, error: e1 } = await supabase
    .from('purchase_orders').select('*').eq('id', orderId).single()
  if (e1) throw e1
  if (order.status !== 'pending') throw new Error('Só é possível cancelar pedido pendente.')

  await supabase.from('purchase_orders').update({
    status: 'cancelled',
    cancelled_at: new Date().toISOString(),
    cancelled_by: profile.id,
  }).eq('id', orderId)

  // Devolve blocos pra available
  const { data: items } = await supabase
    .from('purchase_order_items').select('block_id').eq('purchase_order_id', orderId)
  const blockIds = (items || []).map(i => i.block_id).filter(Boolean)
  if (blockIds.length > 0) {
    await supabase.from('blocks').update({ status: 'available' }).in('id', blockIds)
  }

  // Atualiza inspeção
  await supabase.from('inspections').update({
    order_status: 'cancelled',
  }).eq('id', order.inspection_id)

  // Notifica equipes
  const { data: buyerCompany } = await supabase
    .from('buyer_companies').select('name').eq('id', order.buyer_company_id).single()
  const { data: quarryTeam } = await supabase
    .from('profiles').select('id')
    .or(`id.eq.${order.quarry_company_id},company_id.eq.${order.quarry_company_id}`)
  for (const t of (quarryTeam || [])) {
    await createIndNotification(t.id, '🚫 Pedido cancelado',
      `${buyerCompany?.name} cancelou um pedido de compra.`)
  }
  const { data: buyerTeam } = await supabase
    .from('profiles').select('id').eq('buyer_company_id', order.buyer_company_id)
  for (const t of (buyerTeam || [])) {
    await createIndNotification(t.id, '🚫 Pedido cancelado',
      'O pedido de compra foi cancelado.')
  }
}

// Pedreira rejeita pedido
export async function rejectPurchaseOrder(profile, orderId, reason) {
  const { data: order, error: e1 } = await supabase
    .from('purchase_orders').select('*').eq('id', orderId).single()
  if (e1) throw e1
  if (order.status !== 'pending') throw new Error('Pedido não está pendente.')

  await supabase.from('purchase_orders').update({
    status: 'rejected',
    rejected_at: new Date().toISOString(),
    rejected_by: profile.id,
    rejection_reason: reason || null,
  }).eq('id', orderId)

  // Devolve blocos pra available
  const { data: items } = await supabase
    .from('purchase_order_items').select('block_id').eq('purchase_order_id', orderId)
  const blockIds = (items || []).map(i => i.block_id).filter(Boolean)
  if (blockIds.length > 0) {
    await supabase.from('blocks').update({ status: 'available' }).in('id', blockIds)
  }

  // Atualiza inspeção
  await supabase.from('inspections').update({
    order_status: 'rejected',
  }).eq('id', order.inspection_id)

  // Notifica equipes
  const { data: quarryCompany } = await supabase
    .from('profiles').select('name').eq('id', order.quarry_company_id).single()
  const { data: quarryTeam } = await supabase
    .from('profiles').select('id')
    .or(`id.eq.${order.quarry_company_id},company_id.eq.${order.quarry_company_id}`)
  for (const t of (quarryTeam || [])) {
    await createIndNotification(t.id, '❌ Pedido rejeitado',
      `Pedido rejeitado${reason ? ': ' + reason : '.'}`)
  }
  const { data: buyerTeam } = await supabase
    .from('profiles').select('id').eq('buyer_company_id', order.buyer_company_id)
  for (const t of (buyerTeam || [])) {
    await createIndNotification(t.id, '❌ Pedido rejeitado',
      `Seu pedido foi rejeitado${reason ? ': ' + reason : '.'} por ${quarryCompany?.name || 'a pedreira'}.`)
  }
}

// Pedreira aprova pedido → cria venda + purchase + baixa blocos
export async function approvePurchaseOrder(profile, orderId) {
  console.log('[approvePurchaseOrder] iniciando', orderId)
  
  const { data: order, error: e1 } = await supabase
    .from('purchase_orders').select('*').eq('id', orderId).single()
  if (e1) throw e1
  if (order.status !== 'pending') throw new Error('Pedido não está pendente.')

  const { data: items } = await supabase
    .from('purchase_order_items').select('*').eq('purchase_order_id', orderId)

  const { data: buyerCompany } = await supabase
    .from('buyer_companies').select('*').eq('id', order.buyer_company_id).single()

  // ════════════════════════════════════════════════════════════
  // PASSO 1: ATUALIZA O STATUS DO PEDIDO PRIMEIRO
  // Assim, mesmo que outro passo falhe, o pedido fica aprovado
  // e poderemos investigar
  // ════════════════════════════════════════════════════════════
  const { error: statusErr } = await supabase
    .from('purchase_orders').update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: profile.id,
    }).eq('id', orderId)
  if (statusErr) {
    console.error('[approve] erro ao atualizar status:', statusErr)
    throw new Error('Falha ao aprovar: ' + statusErr.message)
  }
  console.log('[approve] ✓ Status atualizado para approved')

  // PASSO 2: Atualiza inspeção
  const { error: inspErr } = await supabase
    .from('inspections').update({
      order_status: 'approved',
      finalized_at: new Date().toISOString(),
      finalized_by: profile.id,
    }).eq('id', order.inspection_id)
  if (inspErr) console.warn('[approve] aviso inspeção:', inspErr)

  // PASSO 3: Cliente automático na pedreira
  let clientId = null
  try {
    const { data: existingClient } = await supabase
      .from('clients').select('*')
      .eq('company_id', order.quarry_company_id)
      .ilike('name', buyerCompany?.name || '')
      .maybeSingle()
    if (existingClient) {
      clientId = existingClient.id
      if (!existingClient.buyer_company_id) {
        await supabase.from('clients').update({
          buyer_company_id: order.buyer_company_id,
        }).eq('id', existingClient.id)
      }
    } else {
      const { data: newClient, error: cErr } = await supabase
        .from('clients').insert({
          company_id: order.quarry_company_id,
          name: buyerCompany?.name || 'Indústria',
          country: 'BR',
          email: buyerCompany?.contact_email || null,
          phone: buyerCompany?.contact_phone || null,
          buyer_company_id: order.buyer_company_id,
        }).select().single()
      if (cErr) {
        console.warn('[approve] erro ao criar cliente:', cErr)
      } else {
        clientId = newClient.id
      }
    }
    console.log('[approve] ✓ Cliente:', clientId)
  } catch (err) {
    console.warn('[approve] exception cliente:', err)
  }

  // PASSO 4: Venda no lado da pedreira
  let saleId = null
  if (clientId) {
    try {
      const { data: sale, error: sErr } = await supabase
        .from('sales').insert({
          company_id: order.quarry_company_id,
          client_id: clientId,
          seller_id: null,
          payment_method_id: order.payment_method_id || null,
          total_brl: order.total_brl || 0,
          total_usd: order.total_usd || 0,
          dollar_rate: order.dollar_rate || null,
          obs: `Venda Direta - Pedido aprovado${order.notes ? '\n' + order.notes : ''}`,
        }).select().single()
      if (sErr) {
        console.warn('[approve] erro ao criar venda:', sErr)
      } else {
        saleId = sale.id
      }
      console.log('[approve] ✓ Venda:', saleId)
    } catch (err) {
      console.warn('[approve] exception venda:', err)
    }
  }

  // PASSO 5: sale_blocks
  const blockIds = (items || []).map(i => i.block_id).filter(Boolean)
  if (saleId && blockIds.length > 0) {
    try {
      const saleBlocks = blockIds.map(bid => ({ sale_id: saleId, block_id: bid }))
      await supabase.from('sale_blocks').insert(saleBlocks)
      console.log('[approve] ✓ sale_blocks criados')
    } catch (err) {
      console.warn('[approve] exception sale_blocks:', err)
    }
  }

  // PASSO 6: Atualiza blocos (sold + overrides)
  for (const item of (items || [])) {
    if (!item.block_id) continue
    try {
      const { data: currentBlock } = await supabase
        .from('blocks').select('*').eq('id', item.block_id).single()
      if (!currentBlock) continue
      const updates = { status: 'sold' }
      if (currentBlock.original_total_value === null || currentBlock.original_total_value === undefined) {
        updates.original_gross_l = currentBlock.gross_l
        updates.original_gross_h = currentBlock.gross_h
        updates.original_gross_w = currentBlock.gross_w
        updates.original_gross_volume = currentBlock.gross_volume
        updates.original_net_l = currentBlock.net_l
        updates.original_net_h = currentBlock.net_h
        updates.original_net_w = currentBlock.net_w
        updates.original_net_volume = currentBlock.net_volume
        updates.original_total_value = currentBlock.total_value
        updates.original_price_m3 = currentBlock.price_m3
        updates.original_currency = currentBlock.currency
      }
      if (item.gross_l) updates.gross_l = item.gross_l
      if (item.gross_h) updates.gross_h = item.gross_h
      if (item.gross_w) updates.gross_w = item.gross_w
      if (item.gross_volume) updates.gross_volume = item.gross_volume
      if (item.net_l) updates.net_l = item.net_l
      if (item.net_h) updates.net_h = item.net_h
      if (item.net_w) updates.net_w = item.net_w
      if (item.net_volume) updates.net_volume = item.net_volume
      if (item.total_value) updates.total_value = item.total_value
      if (item.price_m3) updates.price_m3 = item.price_m3
      if (item.currency) updates.currency = item.currency
      if (order.dollar_rate) updates.sold_dollar_rate = order.dollar_rate
      updates.overridden_by_buyer_at = new Date().toISOString()
      updates.overridden_by_buyer_id = order.buyer_company_id
      await supabase.from('blocks').update(updates).eq('id', item.block_id)
    } catch (err) {
      console.warn('[approve] exception update bloco:', err)
    }
  }
  console.log('[approve] ✓ Blocos atualizados')

  // PASSO 7: purchase do lado da indústria
  let purchaseId = null
  try {
    const { data: purchase, error: pErr } = await supabase
      .from('purchases').insert({
        buyer_company_id: order.buyer_company_id,
        inspection_id: order.inspection_id,
        total_brl: order.total_brl || 0,
        total_usd: order.total_usd || 0,
        total_value: (order.total_usd || 0) > 0 ? order.total_usd : order.total_brl,
        total_currency: (order.total_usd || 0) > 0 ? 'USD' : 'BRL',
        dollar_rate: order.dollar_rate,
        payment_method_id: order.payment_method_id,
        payment_method_name: order.payment_method_name,
        notes: order.notes,
        quarry_company_id: order.quarry_company_id,
        sale_id: saleId,
        client_id_on_quarry: clientId,
        finalized_by: profile.id,
      }).select().single()
    if (pErr) {
      console.warn('[approve] erro ao criar purchase:', pErr)
    } else {
      purchaseId = purchase.id
    }
    console.log('[approve] ✓ Purchase:', purchaseId)
  } catch (err) {
    console.warn('[approve] exception purchase:', err)
  }

  // PASSO 8: Finaliza o purchase_order com ids
  if (purchaseId || saleId) {
    await supabase.from('purchase_orders').update({
      purchase_id: purchaseId,
      sale_id: saleId,
    }).eq('id', orderId)
  }

  // PASSO 9: Notificações
  try {
    const { data: quarryCompany } = await supabase
      .from('profiles').select('name').eq('id', order.quarry_company_id).single()
    const { data: quarryTeam } = await supabase
      .from('profiles').select('id')
      .or(`id.eq.${order.quarry_company_id},company_id.eq.${order.quarry_company_id}`)
    for (const t of (quarryTeam || [])) {
      await createIndNotification(t.id, '✅ Pedido aprovado',
        `Pedido aprovado. Venda criada com ${blockIds.length} bloco(s).`)
    }
    const { data: buyerTeam } = await supabase
      .from('profiles').select('id').eq('buyer_company_id', order.buyer_company_id)
    for (const t of (buyerTeam || [])) {
      await createIndNotification(t.id, '🎉 Pedido aprovado!',
        `Seu pedido foi aprovado por ${quarryCompany?.name || 'a pedreira'}. Compra finalizada.`)
    }
    console.log('[approve] ✓ Notificações enviadas')
  } catch (err) {
    console.warn('[approve] exception notificações:', err)
  }

  console.log('[approve] ✅ APROVAÇÃO COMPLETA')
  return { purchaseId, saleId, orderId }
}
