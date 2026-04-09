'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import PropertyTable from '../../components/PropertyTable'
import PropertyModal from '../../components/PropertyModal'
import * as XLSX from 'xlsx'
import styles from './dashboard.module.css'

const TABS = [
  { key: 'jeonwolse', label: '전월세' },
  { key: 'maemae_oneroom', label: '매매 (원룸)' },
  { key: 'maemae_duplex', label: '매매 (복층·투룸)' },
  { key: 'sangga', label: '상가' },
  { key: 'sangga_building', label: '상가·건물매매' },
]

const SHEET_MAP: Record<string, string> = {
  '전월세': 'jeonwolse',
  '매매(원룸)': 'maemae_oneroom',
  '매매-복층,1.5룸,투룸': 'maemae_duplex',
  '상가': 'sangga',
  '상가 및 건물매매': 'sangga_building',
}

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
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

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

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf)
      let total = 0
      for (const sheetName of wb.SheetNames) {
        const category = SHEET_MAP[sheetName]
        if (!category) continue
        const ws = wb.Sheets[sheetName]
        const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 })
        const headerRow = rows.findIndex(r => r.includes('건물명칭') || r.includes('건물명'))
        if (headerRow < 0) continue
        const headers = rows[headerRow]
        const isSangga = sheetName.includes('상가')
        const isJeonwolse = sheetName === '전월세'
        const dataRows = rows.slice(headerRow + 1).filter(r => r.some(c => c))
        const inserts = dataRows.map(r => {
          const get = (keys: string[]) => {
            for (const k of keys) {
              const i = headers.findIndex((h: any) => String(h).includes(k))
              if (i >= 0 && r[i] != null) return String(r[i]).trim()
            }
            return ''
          }
          const obj: any = {
            category,
            created_by: user.email,
            building_name: get(['건물명칭', '건물명']) || '',
            room_number: String(get(['호수']) || ''),
            price: get(['금액']),
            move_date: get(['입주일']),
            notes: get(['특징']),
            tenant_contact: get(['임차인연락처', '임차인 연락처']),
            owner_contact: get(['임대인연락처', '임대인 연락처']),
          }
          if (isJeonwolse) obj.prop_type = get(['구분'])
          if (isSangga) {
            obj.biz_type = get(['업종', '상호'])
            obj.mgmt_fee = get(['관리비'])
            obj.premium = get(['권리금'])
            obj.area = get(['평수'])
          }
          return obj
        }).filter(o => o.building_name)
        if (inserts.length > 0) {
          await supabase.from('properties').insert(inserts)
          total += inserts.length
        }
      }
      alert(`✅ 총 ${total}개 매물이 등록됐어요!`)
      fetchProperties()
    } catch (err) {
      alert('파일을 읽는 중 오류가 났어요. 엑셀 형식을 확인해주세요.')
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
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
          <input type="file" accept=".xlsx,.xls" ref={fileRef} onChange={handleExcelUpload} style={{display:'none'}} />
          <button className="btn" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? '업로드 중...' : '📂 엑셀 업로드'}
          </button>
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
