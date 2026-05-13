// src/hooks/useSupabase.js
// ─── Hook principal — auth + dados em tempo real ─────────────────────
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'
import * as db from '../lib/db'

export function useSupabase() {
  const [user,     setUser]     = useState(null)   // profile do Supabase
  const [loading,  setLoading]  = useState(true)
  const [data,     setData]     = useState({
    quarries:       [],
    blocks:         [],
    clients:        [],
    payment_methods:[],
    sales:          [],
    orders:         [],
    block_releases: [],
    favorites:      [],
    notifications:  [],
    team:           [],
  })

  // ── Carrega todos os dados da empresa ─────────────────────────────
  const loadAll = useCallback(async (profile) => {
    if (!profile) return
    try {
      const [
        quarries, blocks, clients, paymentMethods,
        sales, orders, blockReleases, notifications, team
      ] = await Promise.all([
        db.getQuarries(),
        db.getBlocks(),
        db.getClients(),
        db.getPaymentMethods(),
        db.getSales(),
        db.getOrders(),
        db.getBlockReleases(),
        db.getNotifications(profile.id),
        db.getTeam(profile.role === 'owner' ? profile.id : profile.company_id),
      ])

      setData({
        quarries:        quarries        || [],
        blocks:          blocks          || [],
        clients:         clients         || [],
        payment_methods: paymentMethods  || [],
        sales:           sales           || [],
        orders:          orders          || [],
        block_releases:  blockReleases   || [],
        favorites:       [],
        notifications:   notifications   || [],
        team:            team            || [],
      })
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
    }
  }, [])

  // ── Inicialização — verifica sessão existente ──────────────────────
  useEffect(() => {
    let mounted = true

    const init = async () => {
      const session = await db.getSession()
      if (session && mounted) {
        try {
          const profile = await db.getProfile(session.user.id)
          setUser(profile)
          await loadAll(profile)
        } catch (err) {
          console.error('Erro ao carregar perfil:', err)
        }
      }
      if (mounted) setLoading(false)
    }

    init()

    // Escuta mudanças de auth (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        if (event === 'SIGNED_IN' && session) {
          try {
            const profile = await db.getProfile(session.user.id)
            setUser(profile)
            await loadAll(profile)
          } catch (err) {
            console.error(err)
          }
        }
        if (event === 'SIGNED_OUT') {
          setUser(null)
          setData({ quarries:[], blocks:[], clients:[], payment_methods:[], sales:[], orders:[], block_releases:[], favorites:[], notifications:[], team:[] })
        }
        setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [loadAll])

  // ── Tempo real — escuta mudanças no banco ─────────────────────────
  useEffect(() => {
    if (!user) return

    const channels = [
      supabase.channel('blocks-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'blocks' },
          () => db.getBlocks().then(d => setData(p => ({ ...p, blocks: d || [] }))))
        .subscribe(),

      supabase.channel('sales-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' },
          () => db.getSales().then(d => setData(p => ({ ...p, sales: d || [] }))))
        .subscribe(),

      supabase.channel('orders-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' },
          () => db.getOrders().then(d => setData(p => ({ ...p, orders: d || [] }))))
        .subscribe(),

      supabase.channel('notifications-changes')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications',
          filter: `user_id=eq.${user.id}` },
          () => db.getNotifications(user.id).then(d => setData(p => ({ ...p, notifications: d || [] }))))
        .subscribe(),
    ]

    return () => channels.forEach(c => supabase.removeChannel(c))
  }, [user])

  // ── Actions ───────────────────────────────────────────────────────
  const actions = {
    signIn: async (email, password) => {
      const result = await db.signIn(email, password)
      return result
    },

    signOut: async () => {
      await db.signOut()
    },

    // Pedreiras
    createQuarry:  async (q)    => { const d = await db.createQuarry(q);  setData(p => ({ ...p, quarries: [...p.quarries, d] })); return d },
    updateQuarry:  async (id,u) => { const d = await db.updateQuarry(id,u); setData(p => ({ ...p, quarries: p.quarries.map(x=>x.id===id?d:x) })); return d },
    deleteQuarry:  async (id)   => { await db.deleteQuarry(id);  setData(p => ({ ...p, quarries: p.quarries.filter(x=>x.id!==id) })) },

    // Blocos
    createBlock:   async (b)    => { const d = await db.createBlock(b);   setData(p => ({ ...p, blocks: [d, ...p.blocks] })); return d },
    updateBlock:   async (id,u) => { const d = await db.updateBlock(id,u); setData(p => ({ ...p, blocks: p.blocks.map(x=>x.id===id?{...x,...d}:x) })); return d },
    deleteBlock:   async (id)   => { await db.deleteBlock(id);   setData(p => ({ ...p, blocks: p.blocks.filter(x=>x.id!==id) })) },

    // Clientes
    createClient:  async (c)    => { const d = await db.createClient(c);  setData(p => ({ ...p, clients: [...p.clients, d] })); return d },
    updateClient:  async (id,u) => { const d = await db.updateClient(id,u); setData(p => ({ ...p, clients: p.clients.map(x=>x.id===id?d:x) })); return d },
    deleteClient:  async (id)   => { await db.deleteClient(id);  setData(p => ({ ...p, clients: p.clients.filter(x=>x.id!==id) })) },

    // Formas de pagamento
    createPM:      async (pm)   => { const d = await db.createPaymentMethod(pm);  setData(p => ({ ...p, payment_methods: [...p.payment_methods, d] })); return d },
    updatePM:      async (id,u) => { const d = await db.updatePaymentMethod(id,u); setData(p => ({ ...p, payment_methods: p.payment_methods.map(x=>x.id===id?d:x) })); return d },
    deletePM:      async (id)   => { await db.deletePaymentMethod(id); setData(p => ({ ...p, payment_methods: p.payment_methods.filter(x=>x.id!==id) })) },

    // Vendas
    createSale:    async (sale, blockIds) => {
      const d = await db.createSale(sale, blockIds)
      await loadAll(user)  // reload completo após venda
      return d
    },
    reverseSale:   async (saleId, blockIds) => {
      await db.reverseSale(saleId, blockIds)
      await loadAll(user)
    },

    // Pedidos
    createOrder:   async (o)    => { const d = await db.createOrder(o);   setData(p => ({ ...p, orders: [d, ...p.orders] })); return d },
    updateOrder:   async (id,u) => { const d = await db.updateOrder(id,u); setData(p => ({ ...p, orders: p.orders.map(x=>x.id===id?{...x,...d}:x) })); return d },

    // Liberações
    releaseBlock:  async (blockId, clientId) => {
      const d = await db.createBlockRelease(blockId, clientId)
      setData(p => ({ ...p, block_releases: [...p.block_releases, d] }))
      return d
    },
    revokeRelease: async (blockId, clientId) => {
      await db.deleteBlockRelease(blockId, clientId)
      setData(p => ({ ...p, block_releases: p.block_releases.filter(r => !(r.block_id===blockId && r.client_id===clientId)) }))
    },

    // Notificações
    markRead:    async (id)    => { await db.markNotificationRead(id);    setData(p => ({ ...p, notifications: p.notifications.map(n=>n.id===id?{...n,read:true}:n) })) },
    markAllRead: async ()      => { await db.markAllNotificationsRead(user.id); setData(p => ({ ...p, notifications: p.notifications.map(n=>({...n,read:true})) })) },

    // Upload de foto
    uploadPhoto:   db.uploadPhoto,
    deletePhoto:   db.deletePhoto,

    // Reload
    reload: () => loadAll(user),
  }

  return { user, loading, data, actions }
}
