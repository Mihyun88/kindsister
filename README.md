# 착한언니복덕방 매물관리 시스템

직원 전용 웹 앱 - 로그인 후 매물 추가/수정/삭제, 실시간 공유

---

## 배포 순서 (30분이면 완료!)

### 1단계: Supabase 설정 (데이터 저장소)

1. https://supabase.com 접속 → 구글 계정으로 무료 가입
2. **New project** 클릭 → 프로젝트 이름: `kindsister`, 비밀번호 설정
3. 프로젝트 생성 완료 후 **SQL Editor** 클릭
4. `supabase_setup.sql` 파일 내용을 복사 → **Run** 클릭
5. 왼쪽 메뉴 **Authentication > Users** → **Add user** 클릭
   - 직원 4명 이메일/비밀번호 각각 입력 (예: 김지영@kindsister.com / 비밀번호)
6. **Settings > API** 에서 아래 두 값 복사해두기:
   - `Project URL`
   - `anon public` key

### 2단계: 코드에 Supabase 연결

1. 이 폴더에서 `.env.local.example` 파일을 복사해서 `.env.local` 파일 생성
2. 아래처럼 수정:
   ```
   NEXT_PUBLIC_SUPABASE_URL=복사한_Project_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY=복사한_anon_key
   ```

### 3단계: Vercel로 배포 (무료)

1. https://github.com 에서 무료 계정 만들기
2. 이 폴더를 GitHub에 업로드 (GitHub Desktop 앱 사용하면 쉬움)
3. https://vercel.com 접속 → GitHub 계정으로 로그인
4. **New Project** → 업로드한 저장소 선택
5. **Environment Variables** 에 `.env.local` 내용 그대로 입력
6. **Deploy** 클릭!
7. 배포 완료되면 `https://kindsister-manager.vercel.app` 같은 링크 생성됨

### 4단계: 직원들에게 공유

- 링크와 각자 이메일/비밀번호 알려주기
- 폰 브라우저에서도 잘 작동함
- 폰 홈 화면에 추가하면 앱처럼 사용 가능

---

## 로컬에서 테스트하기

```bash
npm install
npm run dev
# http://localhost:3000 접속
```

---

## 문의
궁금한 점은 Claude(AI)에게 물어보세요!
