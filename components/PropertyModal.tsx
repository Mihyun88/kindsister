'use client'
import { useState, useEffect } from 'react'
import styles from './PropertyModal.module.css'

interface Props {
  category: string
  item: any
  onSave: (data: any) => void
  onClose: () => void
}

const emptyBase = {
  prop_type: '월세',
  building_name: '',
  room_number: '',
  price: '',
  move_date: '',
  notes: '',
  tenant_contact: '',
  owner_contact: '',
}

const emptySangga = {
  ...emptyBase,
  biz_type: '',
  mgmt_fee: '',
  premium: '',
  area: '',
}

export default function PropertyModal({ category, item, onSave, onClose }: Props) {
  const isSangga = category === 'sangga' || category === 'sangga_building'
  const isJeonwolse = category === 'jeonwolse'
  const [form, setForm] = useState<any>(isSangga ? emptySangga : emptyBase)

  useEffect(() => {
    if (item) setForm(item)
    else setForm(isSangga ? emptySangga : emptyBase)
  }, [item, isSangga])

  const set = (k: string, v: string) => setForm((f: any) => ({ ...f, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.building_name) { alert('건물명을 입력해 주세요'); return }
    onSave(form)
  }

  return (
    <div className={styles.bg} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <h3>{item ? '매물 수정' : '매물 추가'}</h3>
        <form onSubmit={handleSubmit}>
          <div className={styles.grid2}>
            {isJeonwolse && (
              <div className={styles.field}>
                <label>구분</label>
                <select value={form.prop_type} onChange={e => set('prop_type', e.target.value)}>
                  <option>월세</option><option>반전세</option><option>전세</option>
                </select>
              </div>
            )}
            <div className={styles.field}>
              <label>건물명 *</label>
              <input value={form.building_name} onChange={e => set('building_name', e.target.value)} placeholder="자이엘라" required />
            </div>
            <div className={styles.field}>
              <label>호수</label>
              <input value={form.room_number} onChange={e => set('room_number', e.target.value)} placeholder="507" />
            </div>
          </div>

          <div className={styles.grid2}>
            <div className={styles.field}>
              <label>금액</label>
              <input value={form.price} onChange={e => set('price', e.target.value)} placeholder="1000/75 또는 2억 6천" />
            </div>
            <div className={styles.field}>
              <label>입주일</label>
              <input value={form.move_date} onChange={e => set('move_date', e.target.value)} placeholder="즉시입주 / 2026-06-01" />
            </div>
          </div>

          {isSangga && (
            <>
              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label>업종/상호</label>
                  <input value={form.biz_type} onChange={e => set('biz_type', e.target.value)} placeholder="구 헤어꽃들레" />
                </div>
                <div className={styles.field}>
                  <label>관리비</label>
                  <input value={form.mgmt_fee} onChange={e => set('mgmt_fee', e.target.value)} placeholder="약 25만원" />
                </div>
              </div>
              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label>권리금</label>
                  <input value={form.premium} onChange={e => set('premium', e.target.value)} placeholder="X / 1500만원" />
                </div>
                <div className={styles.field}>
                  <label>평수</label>
                  <input value={form.area} onChange={e => set('area', e.target.value)} placeholder="25.32평 / 13.237평" />
                </div>
              </div>
            </>
          )}

          <div className={styles.field}>
            <label>특징</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="비번, 전입가능, 주임사 승계 등..." />
          </div>

          <div className={styles.grid2}>
            <div className={styles.field}>
              <label>임차인 연락처</label>
              <input value={form.tenant_contact} onChange={e => set('tenant_contact', e.target.value)} placeholder="홍길동 010-0000-0000" />
            </div>
            <div className={styles.field}>
              <label>임대인 연락처</label>
              <input value={form.owner_contact} onChange={e => set('owner_contact', e.target.value)} placeholder="010-0000-0000" />
            </div>
          </div>

          <div className={styles.footer}>
            <button type="button" className="btn" onClick={onClose}>취소</button>
            <button type="submit" className="btn primary">저장</button>
          </div>
        </form>
      </div>
    </div>
  )
}
