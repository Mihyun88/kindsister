-- 착한언니복덕방 매물관리 DB 설정
-- Supabase > SQL Editor 에서 이 파일 내용을 복사해서 실행하세요

-- 1. 매물 테이블 생성
create table properties (
  id uuid default gen_random_uuid() primary key,
  category text not null,         -- 'jeonwolse' | 'maemae_oneroom' | 'maemae_duplex' | 'sangga' | 'sangga_building'
  prop_type text,                  -- 월세, 반전세, 전세, 매매
  building_name text not null,
  room_number text,
  price text,
  move_date text,
  notes text,
  tenant_contact text,
  owner_contact text,
  biz_type text,                   -- 상가 전용: 업종/상호
  mgmt_fee text,                   -- 상가 전용: 관리비
  premium text,                    -- 상가 전용: 권리금
  area text,                       -- 상가 전용: 평수
  created_by text,                 -- 등록한 직원 이메일
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Row Level Security 활성화 (로그인한 사람만 접근 가능)
alter table properties enable row level security;

-- 3. 로그인한 직원은 모두 읽기/쓰기 가능
create policy "직원만 접근 가능" on properties
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- 4. 직원 계정 만들기 (Supabase > Authentication > Users > Add user 에서 만들어도 됨)
-- 아래는 예시입니다. 실제 이메일/비밀번호로 바꿔서 사용하세요.
-- Authentication > Users 탭에서 직접 추가하는 게 더 쉽습니다.
