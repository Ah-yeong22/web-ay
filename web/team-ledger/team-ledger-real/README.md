# 원장(Team Ledger) 실제 사용 버전

이 버전은 다음 기능을 포함합니다.

- Supabase Auth 기반 이메일/비밀번호 로그인
- 학생·교수 역할 분리
  - 학생: 수업 참가, 팀 생성·참가, 팀 작업 계획 등록·상태 변경
  - 교수: 수업 생성, 프로젝트·마감 등록, 팀별 작업 진행 확인
- 칸반 보드 방식 작업 계획: 할 일 / 진행 중 / 완료
- 작업별 담당자, 마감일, 우선순위, 상세 내용
- 새로고침 후에도 데이터 유지

## 1. Supabase 프로젝트 생성

1. Supabase에서 새 프로젝트를 만듭니다.
2. Project Settings → API에서 다음 두 값을 확인합니다.
   - Project URL
   - anon public key
3. `config.js`에서 아래 두 값을 실제 값으로 바꿉니다.

```js
window.APP_CONFIG = {
  SUPABASE_URL: 'https://xxxx.supabase.co',
  SUPABASE_ANON_KEY: 'eyJ...'
};
```

`service_role` 키는 절대 `config.js`나 GitHub에 넣으면 안 됩니다.

## 2. 데이터베이스 생성

Supabase Dashboard → SQL Editor → New query에서 `supabase_setup.sql` 전체를 붙여넣고 Run 합니다.

## 3. 교수 계정 사전 허용

교수 계정은 임의 승격을 막기 위해 allowlist에 이메일을 넣은 뒤 가입해야 합니다.

SQL Editor에서 실행:

```sql
insert into public.professor_allowlist(email, display_name)
values ('교수이메일@학교도메인.ac.kr', '교수 표시 이름')
on conflict do nothing;
```

그 다음 해당 이메일로 회원가입 화면에서 역할을 `교수`로 선택합니다.

## 4. Supabase 인증 설정

Supabase Dashboard → Authentication → Providers → Email에서 이메일 로그인 기능을 켭니다.

개발 초기에는 이메일 인증을 끌 수도 있지만, 실제 사용 시에는 이메일 인증을 켜는 편이 안전합니다.

Vercel로 배포한 뒤에는 Authentication → URL Configuration에 다음을 등록합니다.

- Site URL: `https://본인프로젝트.vercel.app`
- Redirect URLs: 같은 주소

## 5. GitHub와 Vercel 배포

기존 GitHub 저장소의 파일을 아래처럼 바꿉니다.

```text
team-ledger/
├─ index.html
├─ config.js
├─ supabase_setup.sql
└─ README.md
```

Vercel은 GitHub 저장소의 변경 사항을 자동 배포합니다.

## 운영 전 확인 사항

- 실제 학생 이름·평가·성적 데이터를 넣기 전 개인정보 처리와 접근권한 기준을 정해야 합니다.
- 현재는 교수 allowlist를 SQL Editor에서 관리합니다. 교수 승인 화면이 필요하면 별도 관리자 기능을 추가해야 합니다.
- 업무 파일 자체 업로드 기능은 포함하지 않았습니다. 링크 등록 또는 Supabase Storage 연동이 다음 확장 단계입니다.
