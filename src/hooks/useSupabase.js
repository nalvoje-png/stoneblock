// src/hooks/useSupabase.js
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'
import * as db from '../lib/db'

export function useSupabase() {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [data,    setData]    = useState({
    quarries: [], blocks: [], clients: [], payment_methods: [],
    sales: [], orders: [], block_releases: [], favorites: [],
    notifications: [], team: [],
  })

  const empty = {
    quarries: [], blocks: [], clients: [], payment_methods: [],
    sales: [], orders: [], block_releases: [], favorites: [],
    notifications: [], team: [],
  }

  // ── Carrega dados com timeout e fallback ──────────────────────────
  const loadAll = useCallback(async (profile) => {
    if (!profile) return

    const companyId = profile.role === 'owner' ? profile.id : (profile.company_id || profile.id)

    try {
      // Load each table individually so one failure doesn't block others
      const results = await Promise.allSettled([
        supabase.from('quarries').select('*').eq('company_id', companyId).eq('active', true).order('name'),
        supabase.from('blocks').select('*, quarry:quarries(id,name,location), reserved_client:clients!reserved_for(id,name)').eq('company_id', companyId).order('created_at', { ascending: false }),
        supabase.from('clients').select('*').eq('company_id', companyId).order('name'),
        supabase.from('payment_methods').select('*').eq('company_id', companyId).eq('active', true),
        supabase.from('sales').select('*, sale_blocks(block_id), seller:profiles!seller_id(id,name), client:clients!client_id(id,name,country), payment_method:payment_methods!payment_method_id(id,name,details)').eq('company_id', companyId).order('created_at', { ascending: false }),
        supabase.from('orders').select('*, block:blocks(id,code,material,total_value,currency,net_volume), client:clients(id,name,country)').eq('company_id', companyId).order('created_at', { ascending: false }),
        supabase.from('block_releases').select('*, client:clients(id,name), liberador:profiles!liberado_por(id,name)').eq('company_id', companyId),
        supabase.from('notifications').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(50),
        supabase.from('profiles').select('*').eq('company_id', companyId),
      ])

      const [quarries, blocks, clients, pms, sales, orders, releases, notifs, team] = results.map(r =>
        r.status === 'fulfilled' ? (r.value.data || []) : []
      )

      setData({
        quarries, blocks, clients,
        payment_methods: pms,
        sales, orders,
        block_releases: releases,
        favorites: [],
        notifications: notifs,
        team,
      })
    } catch (err) {
      console.error('loadAll error:', err)
      setData(empty)
    }
  }, [])

  // ── Inicialização ─────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user && mounted) {
          // Get or create profile
          let { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          // If profile doesn't exist yet, create it
          if (error || !profile) {
            const name = session.user.user_metadata?.name || session.user.email.split('@')[0]
            const { data: newProfile } = await supabase
              .from('profiles')
              .upsert({
                id: session.user.id,
                company_id: session.user.id,
                name,
                role: 'owner',
                avatar: name.substring(0,2).toUpperCase(),
              })
              .select()
              .single()
            profile = newProfile
          }

          // Ensure company_id is set (owner = own id)
          if (!profile.company_id) {
            await supabase.from('profiles').update({ company_id: profile.id }).eq('id', profile.id)
            profile.company_id = profile.id
          }

          if (mounted) {
            setUser(profile)
            await loadAll(profile)
          }
        }
      } catch (err) {
        console.error('init error:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          let { data: profile } = await supabase
            .from('profiles').select('*').eq('id', session.user.id).single()

          if (!profile) {
            const name = session.user.user_metadata?.name || session.user.email.split('@')[0]
            const { data: np } = await supabase
              .from('profiles')
              .upsert({ id: session.user.id, company_id: session.user.id, name, role: 'owner', avatar: name.substring(0,2).toUpperCase() })
              .select().single()
            profile = np
          }

          if (!profile.company_id) {
            await supabase.from('profiles').update({ company_id: profile.id }).eq('id', profile.id)
            profile.company_id = profile.id
          }

          setUser(profile)
          await loadAll(profile)
        } catch (err) {
          console.error('SIGNED_IN error:', err)
        } finally {
          if (mounted) setLoading(false)
        }
      }
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setData(empty)
        if (mounted) setLoading(false)
      }
    })

    return () => { mounted = false; subscription.unsubscribe() }
  }, [loadAll])

  // ── Tempo real ────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return
    const companyId = user.role === 'owner' ? user.id : (user.company_id || user.id)

    const ch = supabase.channel('realtime-all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blocks', filter: `company_id=eq.${companyId}` },
        () => loadAll(user))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales', filter: `company_id=eq.${companyId}` },
        () => loadAll(user))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `company_id=eq.${companyId}` },
        () => loadAll(user))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        () => loadAll(user))
      .subscribe()

    return () => supabase.removeChannel(ch)
  }, [user, loadAll])

  // ── Actions ───────────────────────────────────────────────────────
  const reload = useCallback(() => loadAll(user), [user, loadAll])

  const actions = {
    signIn: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      return data
    },
    signOut: async () => {
      await supabase.auth.signOut()
    },

    // Pedreiras
    createQuarry: async (q) => {
      const { data, error } = await supabase.from('quarries').insert({ ...q, company_id: user.id }).select().single()
      if (error) throw error
      setData(p => ({ ...p, quarries: [...p.quarries, data] }))
      return data
    },
    updateQuarry: async (id, u) => {
      const { data, error } = await supabase.from('quarries').update(u).eq('id', id).select().single()
      if (error) throw error
      setData(p => ({ ...p, quarries: p.quarries.map(x => x.id===id ? data : x) }))
      return data
    },
    deleteQuarry: async (id) => {
      const { error } = await supabase.from('quarries').delete().eq('id', id)
      if (error) throw error
      setData(p => ({ ...p, quarries: p.quarries.filter(x => x.id!==id) }))
    },

    // Blocos
    createBlock: async (b) => {
      const { data: sysCode } = await supabase.rpc('generate_sys_code')
      const { data, error } = await supabase.from('blocks')
        .insert({ ...b, company_id: user.id, sys_code: sysCode, created_by: user.id })
        .select().single()
      if (error) throw error
      setData(p => ({ ...p, blocks: [data, ...p.blocks] }))
      return data
    },
    updateBlock: async (id, u) => {
      const { data, error } = await supabase.from('blocks').update(u).eq('id', id).select().single()
      if (error) throw error
      setData(p => ({ ...p, blocks: p.blocks.map(x => x.id===id ? { ...x, ...data } : x) }))
      return data
    },
    deleteBlock: async (id) => {
      const { error } = await supabase.from('blocks').delete().eq('id', id)
      if (error) throw error
      setData(p => ({ ...p, blocks: p.blocks.filter(x => x.id!==id) }))
    },

    // Clientes
    createClient: async (c) => {
      const { data, error } = await supabase.from('clients').insert({ ...c, company_id: user.id }).select().single()
      if (error) throw error
      setData(p => ({ ...p, clients: [...p.clients, data] }))
      return data
    },
    updateClient: async (id, u) => {
      const { data, error } = await supabase.from('clients').update(u).eq('id', id).select().single()
      if (error) throw error
      setData(p => ({ ...p, clients: p.clients.map(x => x.id===id ? data : x) }))
      return data
    },
    deleteClient: async (id) => {
      const { error } = await supabase.from('clients').delete().eq('id', id)
      if (error) throw error
      setData(p => ({ ...p, clients: p.clients.filter(x => x.id!==id) }))
    },

    // Pagamentos
    createPM: async (pm) => {
      const { data, error } = await supabase.from('payment_methods').insert({ ...pm, company_id: user.id }).select().single()
      if (error) throw error
      setData(p => ({ ...p, payment_methods: [...p.payment_methods, data] }))
      return data
    },
    updatePM: async (id, u) => {
      const { data, error } = await supabase.from('payment_methods').update(u).eq('id', id).select().single()
      if (error) throw error
      setData(p => ({ ...p, payment_methods: p.payment_methods.map(x => x.id===id ? data : x) }))
      return data
    },
    deletePM: async (id) => {
      const { error } = await supabase.from('payment_methods').delete().eq('id', id)
      if (error) throw error
      setData(p => ({ ...p, payment_methods: p.payment_methods.filter(x => x.id!==id) }))
    },

    // Vendas
    createSale: async (sale, blockIds) => {
      const { data: saleData, error: se } = await supabase.from('sales')
        .insert({ ...sale, company_id: user.id }).select().single()
      if (se) throw se
      await supabase.from('sale_blocks').insert(blockIds.map(bid => ({ sale_id: saleData.id, block_id: bid })))
      await supabase.from('blocks').update({ status: 'sold' }).in('id', blockIds)
      await reload()
      return saleData
    },
    reverseSale: async (saleId, blockIds) => {
      await supabase.from('sales').delete().eq('id', saleId)
      await supabase.from('blocks').update({ status: 'available' }).in('id', blockIds)
      await reload()
    },

    // Pedidos
    createOrder: async (o) => {
      const { data, error } = await supabase.from('orders').insert({ ...o, company_id: user.id }).select().single()
      if (error) throw error
      setData(p => ({ ...p, orders: [data, ...p.orders] }))
      return data
    },
    updateOrder: async (id, u) => {
      const { data, error } = await supabase.from('orders').update(u).eq('id', id).select().single()
      if (error) throw error
      setData(p => ({ ...p, orders: p.orders.map(x => x.id===id ? { ...x, ...data } : x) }))
      return data
    },

    // Liberações
    releaseBlock: async (blockId, clientId) => {
      const { data, error } = await supabase.from('block_releases')
        .upsert({ block_id: blockId, client_id: clientId, company_id: user.id, liberado_por: user.id, data_liberacao: new Date().toISOString() })
        .select().single()
      if (error) throw error
      setData(p => ({ ...p, block_releases: [...p.block_releases.filter(r => !(r.block_id===blockId&&r.client_id===clientId)), data] }))
      return data
    },
    revokeRelease: async (blockId, clientId) => {
      await supabase.from('block_releases').delete().eq('block_id', blockId).eq('client_id', clientId)
      setData(p => ({ ...p, block_releases: p.block_releases.filter(r => !(r.block_id===blockId&&r.client_id===clientId)) }))
    },

    // Notificações
    markRead: async (id) => {
      await supabase.from('notifications').update({ read: true }).eq('id', id)
      setData(p => ({ ...p, notifications: p.notifications.map(n => n.id===id ? { ...n, read: true } : n) }))
    },
    markAllRead: async () => {
      await supabase.from('notifications').update({ read: true }).eq('user_id', user.id)
      setData(p => ({ ...p, notifications: p.notifications.map(n => ({ ...n, read: true })) }))
    },

    // Upload foto
    uploadPhoto: async (file, blockId) => {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/${blockId}/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('block-photos').upload(path, file)
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('block-photos').getPublicUrl(path)
      return publicUrl
    },

    reload,
  }

  return { user, loading, data, actions }
}
