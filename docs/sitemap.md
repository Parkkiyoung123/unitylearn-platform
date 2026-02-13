# UnityLearn 사이트맵

## 개요
UnityLearn는 Unity 개발자를 위한 버그 진단 및 학습 플랫폼입니다. 이 문서는 애플리케이션의 전체 라우팅 구조와 페이지 계층을 정의합니다.

---

## Public Routes (인증 불필요)

| 경로 | 설명 | 접근 권한 |
|------|------|----------|
| `/` | 랜딩 페이지 - 서비스 소개 및 주요 기능 안내 | 모두 |
| `/diagnostic` | 진단 테스트 - Unity 버그 진단 퀴즈 | 모두 (게스트 가능) |
| `/diagnostic/result` | 진단 결과 - 테스트 결과 및 분석 | 모두 (게스트 가능) |
| `/auth/signin` | 로그인 페이지 - 기존 사용자 로그인 | 비로그인 |
| `/auth/signup` | 회원가입 페이지 - 새 계정 생성 | 비로그인 |
| `/auth/callback` | OAuth 콜백 - 소셜 로그인 리다이렉트 | 비로그인 |

---

## Protected Routes (로그인 필요)

| 경로 | 설명 | 접근 권한 |
|------|------|----------|
| `/dashboard` | 학습 대시보드 - 학습 진도 및 추천 콘텐츠 | 로그인 |
| `/onboarding` | 최초 프로필 설정 - 닉네임, 수준, 관심사 설정 | 로그인 (최초 1회) |
| `/quiz` | 퀴즈 목록 - 전체 퀴즈 카테고리 및 목록 | 로그인 |
| `/quiz/[id]` | 퀴즈 풀이 - 개별 퀴즈 페이지 | 로그인 |
| `/quiz/result` | 퀴즈 결과 - 퀴즈 완료 후 결과 및 해설 | 로그인 |
| `/profile` | 프로필 설정 - 개인정보 및 학습 설정 관리 | 로그인 |

---

## API Routes

### 인증 API (`/api/auth/*`)
- `POST /api/auth/signin` - 로그인
- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/signout` - 로그아웃
- `GET/POST /api/auth/session` - 세션 확인/갱신

### 퀴즈 API (`/api/quiz/*`)
- `GET /api/quiz` - 퀴즈 목록 조회
- `GET /api/quiz/[id]` - 특정 퀴즈 조회
- `POST /api/quiz/[id]/submit` - 퀴즈 답안 제출
- `GET /api/quiz/[id]/result` - 퀴즈 결과 조회

### 진단 테스트 API (`/api/diagnostic/*`)
- `GET /api/diagnostic/questions` - 진단 질문 목록
- `POST /api/diagnostic/submit` - 진단 결과 제출
- `GET /api/diagnostic/result` - 진단 결과 조회

### 사용자 API (`/api/user/*`)
- `GET /api/user/profile` - 사용자 프로필 조회
- `PUT /api/user/profile` - 사용자 프로필 수정
- `GET /api/user/progress` - 학습 진도 조회
- `POST /api/user/onboarding` - 온보 정보 저장

---

## 상태 흐름 (State Flow)

```
[비로그인 사용자]
    │
    ▼
┌─────────────┐
│   랜딩 페이지  │
└─────────────┘
    │
    ├──► 진단 테스트 (/diagnostic) ──► 결과 (/diagnostic/result)
    │                                      │
    │                                      ▼
    │                              [로그인 유도]
    │                                      │
    ▼                                      ▼
┌─────────────┐                  ┌─────────────────┐
│  로그인/회원가입 │◄─────────────────│  온보 (/onboarding)  │
└─────────────┘                  └─────────────────┘
    │                                      │
    ▼                                      ▼
┌─────────────┐                  ┌─────────────────┐
│   대시보드    │◄─────────────────│  온보 완료 시      │
└─────────────┘                  └─────────────────┘
    │
    ├──► 퀴즈 목록 (/quiz)
    │
    ├──► 프로필 (/profile)
    │
    └──► 진단 테스트 (/diagnostic)
```

---

## 네비게이션 구조

### 메인 네비게이션 (Navbar)
- **로고** → 홈 (`/`)
- **진단 테스트** → `/diagnostic`
- **퀴즈** → `/quiz`
- **대시보드** → `/dashboard` (로그인 시)
- **사용자 메뉴**: 프로필, 설정, 로그아웃

### 푸터 네비게이션
- 서비스 소개
- 이용약관
- 개인정보처리방침
- 문의하기

---

## 온보 흐름

1. **Step 1**: 닉네임 설정
2. **Step 2**: 현재 수준 선택
3. **Step 3**: 관심 카테고리 선택 (선택사항)
4. **Step 4**: 완료 화면 → 대시보드 이동

**온보 완료 조건**:
- LocalStorage에 `onboardingCompleted: true` 저장
- 서버에 온보 정보 저장

---

## 권한 체계

| 역할 | 설명 | 접근 가능 페이지 |
|------|------|-----------------|
| Guest | 비로그인 사용자 | 랜딩, 진단 테스트, 로그인/회원가입 |
| User | 일반 로그인 사용자 | 모든 Protected Routes |
| Admin | 관리자 | (향후 관리자 페이지 추가 예정) |

---

## 향후 추가 예정 라우트

- `/learn` - 학습 콘텐츠 (Unity 버그 사례별 해결책)
- `/community` - 커뮤니티 (질문/답변)
- `/achievements` - 업적 시스템
- `/settings` - 상세 설정 페이지

---

## 라우팅 규칙

1. **인증 리다이렉트**: Protected Routes에 비로그인 접근 시 `/auth/signin`으로 리다이렉트
2. **온보드 리다이렉트**: 온보드 미완료 사용자는 `/onboarding`으로 리다이렉트
3. **404 페이지**: 존재하지 않는 경로 접근 시 커스텀 404 페이지 표시
4. **로딩 상태**: 페이지 전환 시 로딩 인디케이터 표시

---

*마지막 업데이트: 2026-02-12*
