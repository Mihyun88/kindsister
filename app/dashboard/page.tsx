'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const TABS = [
  { key: 'jeonwolse', label: '전월세' },
  { key: 'maemae_oneroom', label: '매매 (원룸)' },
  { key: 'maemae_duplex', label: '매매 (복층·투룸)' },
  { key: 'sangga', label: '상가' },
  { key: 'sangga_building', label: '상가·건물매매' },
]

const OFFICETEL = ['신촌아리움','서희', '가이아', '핀란드', '핀란드타워','아리움2차','아리움4','아리움5','아리움6','아리움1','아리움3','캠퍼빌','리브하임1차','리브하임2차','신촌스타게이트','이대역스타게이트','스타게이트','신촌가이아','슈테1','경우타운','SM더포레1차','SM더포레2','더가온','한빛슈테리움2','투웨니퍼스트','오늘아침','송스8','더펜타','그린우드빌','영타운','프리젠1','프리젠2','맨션90','다올1차','다올2차','애스턴빌','UCU','MJ더퍼스트','포레스트','스타게이트2차','파라타워','화영빌딩','신촌자이엘라','자이엘라','포스빌','신촌다올','지앤피나인','에스빌딩','비손','서희스타힐스','이대역푸르지오시티','신촌푸르지오시티','신푸','이푸','엔트라리움2차','YES APM','이화스테이','마에스트로','인비따레','파크제이드','파크준']

const isOfficetel = (name: string) => OFFICETEL.some(o => name.includes(o))

function PhoneLink({ value }: { value: string }) {
  if (!value || value === '-') return <span style={{color:'#888'}}>{value||'-'}</span>
  const match = value.replace(/\s/g,'').match(/010\d{8}|010-\d{4}-\d{4}/)
  if (!match) return <span style={{color:'#888'}}>{value}</span>
  const num = match[0].replace(/-/g,'')
  return <a href={`tel:${num}`} style={{color:'#1D9E75',textDecoration:'none',fontWeight:500}}>{value}</a>
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [tab, setTab] = useState('jeonwolse')
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')
  const [buildingFilter, setBuildingFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [form, setForm] = useState<any>({})

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.push('/login'); return }
      setUser(data.session.user)
    })
  }, [router])

  useEffect(() => { if (user) fetchProperties() }, [user, tab])

  const fetchProperties = async () => {
    setLoading(true)
    setSearch(''); setFilter(''); setBuildingFilter('')
    const { data } = await supabase.from('properties').select('*').eq('category', tab).order('created_at', { ascending: false })
    setProperties(data || [])
    setLoading(false)
  }

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/login') }

  const handleSave = async () => {
    if (!form.building_name) { alert('건물명을 입력해 주세요'); return }
    if (editItem?.id) {
      await supabase.from('properties').update({ ...form, updated_at: new Date().toISOString() }).eq('id', editItem.id)
    } else {
      await supabase.from('properties').insert({ ...form, category: tab, created_by: user.email })
    }
    setModalOpen(false); setEditItem(null); fetchProperties()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('삭제할까요?')) return
    await supabase.from('properties').delete().eq('id', id)
    fetchProperties()
  }

  const openAdd = () => { setEditItem(null); setForm({ prop_type: '월세' }); setModalOpen(true) }
  const openEdit = (item: any) => { setEditItem(item); setForm(item); setModalOpen(true) }

  const handleStatClick = (type: string, building: string) => {
    setFilter(type)
    setBuildingFilter(building)
    setSearch('')
  }

  const filtered = properties.filter(p => {
    const str = Object.values(p).join(' ').toLowerCase()
    const matchQ = !search || str.includes(search.toLowerCase())
    const matchF = !filter || p.prop_type === filter
    const matchB = !buildingFilter ||
      (buildingFilter === '오피스텔' && isOfficetel(p.building_name)) ||
      (buildingFilter === '원룸' && !isOfficetel(p.building_name))
    return matchQ && matchF && matchB
  })

  const isSangga = tab === 'sangga' || tab === 'sangga_building'
  const isJeonwolse = tab === 'jeonwolse'

  const stats = {
    total: properties.length,
    월세: properties.filter(p => p.prop_type === '월세').length,
    반전세: properties.filter(p => p.prop_type === '반전세').length,
    전세: properties.filter(p => p.prop_type === '전세').length,
    오피스텔: properties.filter(p => isOfficetel(p.building_name)).length,
    원룸: properties.filter(p => !isOfficetel(p.building_name)).length,
  }

  const statCard = (label: string, value: number, onClick: () => void, active: boolean) => (
    <div onClick={onClick} style={{background:'white',borderRadius:'10px',border: active ? '2px solid #1D9E75' : '1px solid #e8e8e0',padding:'12px 14px',cursor:'pointer',transition:'all 0.15s'}}>
      <div style={{fontSize:'11px',color:'#888',marginBottom:'3px'}}>{label}</div>
      <div style={{fontSize:'22px',fontWeight:'600',color: active ? '#1D9E75' : '#1a1a1a'}}>{value}</div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#f5f5f0'}}>
      <header style={{background:'white',borderBottom:'1px solid #e8e8e0',padding:'0 1.5rem',height:'52px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:10}}>
        <div style={{fontSize:'15px',fontWeight:'600'}}>착한언니복덕방<span style={{color:'#1D9E75'}}> 매물 관리</span></div>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <span style={{fontSize:'12px',color:'#888'}}>{user?.email}</span>
          <button className="btn sm" onClick={handleLogout}>로그아웃</button>
        </div>
      </header>

      <div style={{background:'white',borderBottom:'1px solid #e8e8e0',padding:'0 1.5rem',display:'flex',overflowX:'auto'}}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{padding:'12px 16px',border:'none',background:'transparent',cursor:'pointer',fontSize:'13px',fontFamily:'inherit',color:tab===t.key?'#1D9E75':'#888',borderBottom:tab===t.key?'2px solid #1D9E75':'2px solid transparent',fontWeight:tab===t.key?500:400,whiteSpace:'nowrap'}}>
            {t.label}
          </button>
        ))}
      </div>

      <main style={{maxWidth:'1100px',margin:'0 auto',padding:'1.2rem 1rem'}}>
        {isJeonwolse && (
          <>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:'10px',marginBottom:'10px'}}>
              {statCard('전체', stats.total, () => { setFilter(''); setBuildingFilter(''); setSearch('') }, !filter && !buildingFilter)}
              {statCard('월세', stats.월세, () => handleStatClick('월세', ''), filter==='월세' && !buildingFilter)}
              {statCard('반전세', stats.반전세, () => handleStatClick('반전세', ''), filter==='반전세')}
              {statCard('전세', stats.전세, () => handleStatClick('전세', ''), filter==='전세')}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:'10px',marginBottom:'10px'}}>
              {statCard('오피스텔', stats.오피스텔, () => { setFilter(''); setBuildingFilter('오피스텔'); setSearch('') }, buildingFilter==='오피스텔')}
              {statCard('원룸', stats.원룸, () => { setFilter(''); setBuildingFilter('원룸'); setSearch('') }, buildingFilter==='원룸')}
              <div/><div/>
            </div>
          </>
        )}

        <div style={{display:'flex',gap:'8px',marginBottom:'1rem',flexWrap:'wrap',alignItems:'center'}}>
          <input style={{flex:1,minWidth:'160px'}} placeholder="건물명, 호수, 특징 검색..." value={search} onChange={e => setSearch(e.target.value)} />
          {isJeonwolse && (
            <>
              <select style={{width:'110px'}} value={filter} onChange={e => setFilter(e.target.value)}>
                <option value="">전체</option>
                <option>월세</option><option>반전세</option><option>전세</option>
              </select>
              <select style={{width:'140px'}} value={buildingFilter} onChange={e => setBuildingFilter(e.target.value)}>
                <option value="">원룸+오피스텔</option>
                <option value="오피스텔">오피스텔만</option>
                <option value="원룸">원룸만</option>
              </select>
            </>
          )}
          <button className="btn primary" onClick={openAdd}>+ 매물 추가</button>
        </div>

        {loading ? <p style={{textAlign:'center',padding:'3rem',color:'#aaa'}}>불러오는 중...</p> : (
          <div style={{overflowX:'auto',background:'white',borderRadius:'12px',border:'1px solid #e8e8e0'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:'12px',minWidth:'640px'}}>
              <thead>
                <tr style={{background:'#fafafa'}}>
                  {isJeonwolse && <th style={{padding:'9px 10px',fontWeight:'500',borderBottom:'1px solid #e8e8e0',color:'#888',fontSize:'11px',textAlign:'left',whiteSpace:'nowrap'}}>구분</th>}
                  {['건물명','호수','금액','입주일',...(isSangga?['업종','관리비','권리금','평수']:[]),'특징','임차인 연락처','임대인 연락처','등록자',''].map((h,i) => (
                    <th key={i} style={{padding:'9px 10px',fontWeight:'500',borderBottom:'1px solid #e8e8e0',color:'#888',fontSize:'11px',textAlign:'left',whiteSpace:'nowrap'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length===0 ? (
                  <tr><td colSpan={12} style={{textAlign:'center',padding:'3rem',color:'#aaa'}}>매물이 없습니다</td></tr>
                ) : filtered.map(item => (
                  <tr key={item.id} style={{borderBottom:'1px solid #f0f0e8'}}>
                    {isJeonwolse && <td style={{padding:'9px 10px'}}><span className={`badge ${item.prop_type==='월세'?'rent':item.prop_type==='반전세'?'half':'sale'}`}>{item.prop_type}</span></td>}
                    <td style={{padding:'9px 10px',fontWeight:'500'}}>{item.building_name}</td>
                    <td style={{padding:'9px 10px'}}>{item.room_number}</td>
                    <td style={{padding:'9px 10px',color:'#1D9E75',fontWeight:'500'}}>{item.price}</td>
                    <td style={{padding:'9px 10px',color:'#888'}}>{item.move_date||'-'}</td>
                    {isSangga && <><td style={{padding:'9px 10px',color:'#888'}}>{item.biz_type||'-'}</td><td style={{padding:'9px 10px',color:'#888'}}>{item.mgmt_fee||'-'}</td><td style={{padding:'9px 10px',color:'#888'}}>{item.premium||'-'}</td><td style={{padding:'9px 10px'}}>{item.area||'-'}</td></>}
                    <td style={{padding:'9px 10px',color:'#888',maxWidth:'160px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}} title={item.notes}>{item.notes||'-'}</td>
                    <td style={{padding:'9px 10px'}}><PhoneLink value={item.tenant_contact} /></td>
                    <td style={{padding:'9px 10px'}}><PhoneLink value={item.owner_contact} /></td>
                    <td style={{padding:'9px 10px',color:'#888'}}>{item.created_by?.split('@')[0]}</td>
                    <td style={{padding:'9px 10px',whiteSpace:'nowrap'}}>
                      <button className="btn sm" onClick={() => openEdit(item)} style={{marginRight:'4px'}}>수정</button>
                      <button className="btn sm danger" onClick={() => handleDelete(item.id)}>삭제</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {modalOpen && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:100,display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'40px 1rem',overflowY:'auto'}} onClick={e => { if(e.target===e.currentTarget){setModalOpen(false);setEditItem(null)} }}>
          <div style={{background:'white',borderRadius:'16px',padding:'1.5rem',width:'min(560px,100%)',border:'1px solid #e8e8e0',marginBottom:'40px'}}>
            <h3 style={{fontSize:'16px',fontWeight:'600',marginBottom:'1rem'}}>{editItem?'매물 수정':'매물 추가'}</h3>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
              {isJeonwolse && <div><label style={{display:'block',fontSize:'11px',color:'#666',marginBottom:'4px'}}>구분</label><select value={form.prop_type||'월세'} onChange={e => setForm({...form,prop_type:e.target.value})}><option>월세</option><option>반전세</option><option>전세</option></select></div>}
              <div><label style={{display:'block',fontSize:'11px',color:'#666',marginBottom:'4px'}}>건물명 *</label><input value={form.building_name||''} onChange={e => setForm({...form,building_name:e.target.value})} placeholder="자이엘라" /></div>
              <div><label style={{display:'block',fontSize:'11px',color:'#666',marginBottom:'4px'}}>호수</label><input value={form.room_number||''} onChange={e => setForm({...form,room_number:e.target.value})} placeholder="507" /></div>
              <div><label style={{display:'block',fontSize:'11px',color:'#666',marginBottom:'4px'}}>금액</label><input value={form.price||''} onChange={e => setForm({...form,price:e.target.value})} placeholder="1000/75" /></div>
              <div><label style={{display:'block',fontSize:'11px',color:'#666',marginBottom:'4px'}}>입주일</label><input value={form.move_date||''} onChange={e => setForm({...form,move_date:e.target.value})} placeholder="즉시입주" /></div>
            </div>
            {isSangga && (
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginTop:'10px'}}>
                <div><label style={{display:'block',fontSize:'11px',color:'#666',marginBottom:'4px'}}>업종/상호</label><input value={form.biz_type||''} onChange={e => setForm({...form,biz_type:e.target.value})} /></div>
                <div><label style={{display:'block',fontSize:'11px',color:'#666',marginBottom:'4px'}}>관리비</label><input value={form.mgmt_fee||''} onChange={e => setForm({...form,mgmt_fee:e.target.value})} /></div>
                <div><label style={{display:'block',fontSize:'11px',color:'#666',marginBottom:'4px'}}>권리금</label><input value={form.premium||''} onChange={e => setForm({...form,premium:e.target.value})} /></div>
                <div><label style={{display:'block',fontSize:'11px',color:'#666',marginBottom:'4px'}}>평수</label><input value={form.area||''} onChange={e => setForm({...form,area:e.target.value})} /></div>
              </div>
            )}
            <div style={{marginTop:'10px'}}><label style={{display:'block',fontSize:'11px',color:'#666',marginBottom:'4px'}}>특징</label><textarea value={form.notes||''} onChange={e => setForm({...form,notes:e.target.value})} placeholder="비번, 전입가능 등..." /></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginTop:'10px'}}>
              <div><label style={{display:'block',fontSize:'11px',color:'#666',marginBottom:'4px'}}>임차인 연락처</label><input value={form.tenant_contact||''} onChange={e => setForm({...form,tenant_contact:e.target.value})} placeholder="010-0000-0000" /></div>
              <div><label style={{display:'block',fontSize:'11px',color:'#666',marginBottom:'4px'}}>임대인 연락처</label><input value={form.owner_contact||''} onChange={e => setForm({...form,owner_contact:e.target.value})} placeholder="010-0000-0000" /></div>
            </div>
            <div style={{display:'flex',justifyContent:'flex-end',gap:'8px',marginTop:'1rem'}}>
              <button className="btn" onClick={() => { setModalOpen(false); setEditItem(null) }}>취소</button>
              <button className="btn primary" onClick={handleSave}>저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
