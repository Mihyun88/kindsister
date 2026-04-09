'use client'

function PhoneLink({ value }: { value: string }) {
  if (!value || value === '-') return <span style={{color:'#888'}}>{value||'-'}</span>
  const match = value.replace(/\s/g,'').match(/010\d{8}|010-\d{4}-\d{4}/)
  if (!match) return <span style={{color:'#888'}}>{value}</span>
  const num = match[0].replace(/-/g,'')
  return <a href={`tel:${num}`} style={{color:'#1D9E75',textDecoration:'none',fontWeight:500}}>{value}</a>
}

interface Props {
  items: any[]
  category: string
  onEdit: (item: any) => void
  onDelete: (id: string) => void
}

export default function PropertyTable({ items, category, onEdit, onDelete }: Props) {
  const isSangga = category === 'sangga' || category === 'sangga_building'
  const isJeonwolse = category === 'jeonwolse'

  if (!items.length) {
    return <div style={{textAlign:'center',padding:'3rem',color:'#aaa',background:'white',borderRadius:'12px',border:'1px solid #e8e8e0'}}>매물이 없습니다. 추가해 주세요.</div>
  }

  return (
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
          {items.map(item => (
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
                <button className="btn sm" onClick={() => onEdit(item)} style={{marginRight:'4px'}}>수정</button>
                <button className="btn sm danger" onClick={() => onDelete(item.id)}>삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
