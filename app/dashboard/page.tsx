// v2
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

const OFFICETEL_NAMES = [
  '신촌아리움','아리움2차','아리움4','아리움5','아리움6','아리움1','아리움3',
  '캠퍼빌','리브하임1차','리브하임2차','신촌스타게이트','신촌가이아','슈테1',
  '경우타운','SM더포레1차','SM더포레2','더가온','한빛슈테리움2','투웨니퍼스트',
  '오늘아침','송스8','더펜타','그린우드빌','영타운','프리젠1','프리젠2',
  '맨션90','다올1차','다올2차','애스턴빌','UCU','MJ더퍼스트','포레스트',
  '스타게이트2차','파라타워','화영빌딩','신촌자이엘라','포스빌','신촌다올',
  '지앤피나인','에스빌딩','비손','서희스타힐스','이대역푸르지오시티',
  '신촌푸르지오시티','엔트라리움2차','YES APM','이화스테이','마에스트로',
  '인비따레','파크제이드','파크준','자이엘라','신푸','이푸',
  '이대역스타게이트','스타게이트'
]

function isOfficetel(name: string) {
  return OFFICETEL_NAMES.some(o => name.includes(o))
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
    setBuildingFilter('')
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
    setEdit
