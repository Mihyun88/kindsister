'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import PropertyTable from '@/components/PropertyTable'
import PropertyModal from '@/components/PropertyModal'
import styles from './dashboard.module.css'

const TABS = [
  { key: 'jeonwolse', label: '전월세' },
  { key: 'maemae_oneroom', label: '매매 (원룸)' },
  { key: 'maemae_duplex', label: '매매 (복층·투룸)' },
  { key: 'sangga', label: '상가' },
  { key: 'sangga_building', label: '상가·건물매매' },
]

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [tab, setTab] = useState('jeonwolse')
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.push('/login'); return }
      setUser(data.session.user)
    })
  }, [router])

  useEffect(() => {
    if (user) fetchProperties()
  }, [user, tab])

  const fetchProperties = async () => {
    setLoading(true)
    setSearch('')
    setFilter('')
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('category', tab)
      .order('created_at', { ascending: false })
    if (!error) setProperties(data || [])
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleSave = async (item: any) => {
    if (editItem?.id) {
      await supabase.from('properties').update({ ...item, updated_at: new Date().toISOString() }).eq('id', editItem.id)
    } else {
      await supabase.from('properties').insert({ ...item, category: tab, created_by: user.email })
    }
    setModalOpen(false)
    setEditItem(null)
    fetchProperties()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('이 매물을 삭제할까요?')) return
    await supabase.from('properties').delete().eq('id', id)
    fetchProperties()
  }

  const handleEdit = (item: any) => {
    setEditItem(item)
    setModalOpen(true)
  }

  const filtered = properties.filter(p => {
    const str = Object.values(p).join(' ').toLowerCase()
    const matchQ = !search || str.includes(search.toLowerCase())
    const matchF = !filter || p.prop_type === filter
    return matchQ && matchF
  })

  const stats = {
    total: properties.length,
    월세: properties.filter(p => p.prop_type === '월세').length,
    반전세: properties.filter(p => p.prop_type === '반전세').length,
    전세: properties.filter(p => p.prop_type === '전세').length,
    공실: properties.filter(p => p.move_date?.includes('공실')).length,
  }

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div className={styles.logo}>착한언니복덕방<span> 매물 관리</span></div>
        <div className={styles.userbar}>
          <span className={styles.email}>{user?.email}</span>
          <button className="btn sm" onClick={handleLogout}>로그아웃</button>
        </div>
      </header>

      <div className={styles.tabs}>
        {TABS.map(t => (
          <button
            key={t.key}
            className={`${styles.tab} ${tab === t.key ? styles.active : ''}`}
            onClick={() => setTab(t.key)}
          >{t.label}</button>
        ))}
      </div>

      <main className={styles.main}>
        {tab === 'jeonwolse' && (
          <div className={styles.stats}>
            <div className={styles.stat}><div className={styles.slabel}>전체</div><div className={styles.sval}>{stats.total}</div></div>
            <div className={styles.stat}><div className={styles.slabel}>월세</div><div className={styles.sval}>{stats.월세}</div></div>
            <div className={styles.stat}><div className={styles.slabel}>반전세</div><div className={styles.sval}>{stats.반전세}</div></div>
            <div className={styles.stat}><div className={styles.slabel}>전세</div><div className={styles.sval}>{stats.전세}</div></div>
          </div>
        )}
        {tab === 'sangga' && (
          <div className={styles.stats}>
            <div className={styles.stat}><div className={styles.slabel}>전체</div><div className={styles.sval}>{stats.total}</div></div>
            <div className={styles.stat}><div className={styles.slabel}>공실</div><div className={styles.sval}>{stats.공실}</div></div>
            <div className={styles.stat} /><div className={styles.stat} />
          </div>
        )}

        <div className={styles.topbar}>
          <input
            className={styles.search}
            placeholder="건물명, 호수, 특징 검색..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {tab === 'jeonwolse' && (
            <select className={styles.filter} value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="">전체</option>
              <option>월세</option><option>반전세</option><option>전세</option>
            </select>
          )}
          <button className="btn primary" onClick={() => { setEditItem(null); setModalOpen(true) }}>+ 매물 추가</button>
        </div>

        {loading
          ? <p className={styles.empty}>불러오는 중...</p>
          : <PropertyTable
              items={filtered}
              category={tab}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
        }
      </main>

      {modalOpen && (
        <PropertyModal
          category={tab}
          item={editItem}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditItem(null) }}
        />
      )}
    </div>
  )
}
