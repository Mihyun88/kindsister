'use client'
import styles from './PropertyTable.module.css'

interface Props {
  items: any[]
  category: string
  onEdit: (item: any) => void
  onDelete: (id: string) => void
}

const typeClass: Record<string, string> = {
  '월세': 'rent', '반전세': 'half', '전세': 'sale', '매매': 'shop'
}

function PhoneLink({ value }: { value: string }) {
  if (!value || value === '-') return <span className={styles.muted}>-</span>
  const phoneRegex = /0\d{1,2}[-\s]?\d{3,4}[-\s]?\d{4}/g
  const parts = value.split(phoneRegex)
  const matches = value.match(phoneRegex) || []
  return (
    <span>
      {parts.map((part, i) => (
        <span key={i}>
          <span className={styles.muted}>{part}</span>
          {matches[i] && (
            <a
              href={`tel:${matches[i].replace(/[-\s]/g, '')}`}
              style={{color:'#1D9E75', textDecoration:'underline', fontWeight:500}}
            >
              {matches[i]}
            </a>
          )}
        </span>
      ))}
    </span>
  )
}

export default function PropertyTable({ items, category, onEdit, onDelete }: Props) {
  if (!items.length) {
    return <div className={styles.empty}>매물이 없습니다. 추가해 주세요.</div>
  }

  const isSangga = category === 'sangga' || category === 'sangga_building'
  const isJeonwolse = category === 'jeonwolse'

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {isJeonwolse && <th>구분</th>}
            <th>건물명</th>
            <th>호수</th>
            {isSangga && <th>업종/상호</th>}
            <th>금액</th>
            <th>입주일</th>
            {isSangga && <><th>관리비</th><th>권리금</th><th>평수</th></>}
            <th>특징</th>
            <th>임차인 연락처</th>
            <th>임대인 연락처</th>
            <th>등록자</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              {isJeonwolse && (
                <td>
                  <span className={`badge ${typeClass[item.prop_type] || 'rent'}`}>
                    {item.prop_type}
                  </span>
                </td>
              )}
              <td className={styles.bold}>{item.building_name}</td>
              <td>{item.room_number}</td>
              {isSangga && <td className={styles.muted}>{item.biz_type || '-'}</td>}
              <td className={styles.green}>{item.price}</td>
              <td className={styles.muted}>{item.move_date || '-'}</td>
              {isSangga && (
                <>
                  <td className={styles.muted}>{item.mgmt_fee || '-'}</td>
                  <td className={styles.muted}>{item.premium || '-'}</td>
                  <td>{item.area || '-'}</td>
                </>
              )}
              <td className={styles.note} title={item.notes}>{item.notes || '-'}</td>
              <td><PhoneLink value={item.tenant_contact} /></td>
              <td><PhoneLink value={item.owner_contact} /></td>
              <td className={styles.muted}>{item.created_by?.split('@')[0]}</td>
              <td className={styles.actions}>
                <button className="btn sm" onClick={() => onEdit(item)}>수정</button>
                <button className="btn sm danger" onClick={() => onDelete(item.id)}>삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
