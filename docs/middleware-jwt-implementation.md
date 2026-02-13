# Tier 1 - Middleware JWT 검증 시스템 구현 문서

## 개요

Martin Fowler의 아키텍처 원칙을 적용한 Next.js Middleware 기반 JWT 검증 시스템입니다.

## 아키텍처 원칙

### 1. Separation of Concerns (관심사 분리)
- **Route Config** (`lib/routes.ts`): 라우트 정책 중앙 관리
- **JWT Utility** (`lib/jwt.ts`): 토큰 검증 로직 분리
- **Middleware** (`middleware.ts`): 요청 처리 및 라우팅 결정

### 2. Defense in Depth (다층 방어)
```
요청 → 공개 라우트 검사 → JWT 검증 → 세션 검증 → 게스트 검증 → 접근 허용
         ↓ 실패              ↓ 실패       ↓ 실패        ↓ 실패
      통과              401 반환    401 반환    401/리다이렉트
```

### 3. Fail-Fast (빠른 실패)
- 공개 라우트는 즉시 통과
- 인증 실패 시 즉시 401 반환
- 명확한 에러 메시지와 코드

### 4. Configuration over Code
- 라우트 정책을 상수로 분리
- 정책 변경 시 파일 하나만 수정

## 파일 구조

```
src/
├── middleware.ts           # 메인 미들웨어
├── lib/
│   ├── routes.ts          # 라우트 설정
│   └── jwt.ts             # JWT 검증 유틸리티
```

## 구현 상세

### 1. 라우트 설정 (lib/routes.ts)

#### 공개 라우트 (PUBLIC_ROUTES)
| 경로 | 설명 |
|------|------|
| `/` | 홈페이지 |
| `/login`, `/signup` | 인증 페이지 |
| `/about` | 소개 페이지 |
| `/auth/*` | Better Auth 인증 API |

#### 보호된 라우트 (PROTECTED_ROUTES)
| 경로 | 인증 필요 |
|------|-----------|
| `/dashboard/*` | ✅ 인증 필수 |
| `/api/protected/*` | ✅ 인증 필수 |

#### 게스트 허용 라우트 (GUEST_ALLOWED_ROUTES)
| 경로 | 인증 | 게스트 |
|------|------|--------|
| `/quiz/*` | ✅ | ✅ |
| `/diagnostic` | ✅ | ✅ |
| `/api/quiz/preview` | ✅ | ✅ |

#### 게스트 접근 가능 패턴
- `/quiz/diagnostic/*` - 진단 테스트
- `/quiz/preview/*` - 미리보기 문제

### 2. JWT 검증 유틸리티 (lib/jwt.ts)

#### 주요 함수

**`verifyJWT(token: string)`**
- JWT 토큰 검증
- 만료/서명 에러 세분화 처리

**`validateAuthHeader(authHeader: string \| null)`**
- Authorization 헤더에서 Bearer 토큰 추출 및 검증

**`verifyBetterAuthSession(sessionToken?: string)`**
- Better Auth 세션 쿠키 검증

**`validateGuestSession(guestDataCookie?: string)`**
- Base64 디코딩 후 게스트 세션 검증
- 시도 횟수 초과 확인

**`verifyAuthentication(params)`**
- 통합 인증 검증 (JWT > 세션 > 게스트)

#### 인증 우선순위
1. **JWT Bearer 토큰** - API 요청용
2. **Better Auth 세션** - 웹 앱 세션
3. **게스트 세션** - 비로그인 사용자

### 3. 미들웨어 (middleware.ts)

#### 처리 흐름
```typescript
// Phase 1: 공개 라우트 즉시 통과
if (isPublicRoute) return next()

// Phase 2: 인증 정보 추출
const authHeader = request.headers.get("authorization")
const sessionToken = cookies.get("better-auth.session_token")
const guestData = cookies.get("unitylearn_guest_data")

// Phase 3: 통합 인증 검증
const authResult = await verifyAuthentication({...})

// Phase 4: 라우트 타입별 처리
if (isProtectedRoute) {
  // 인증 실패 시 401 또는 리다이렉트
}
if (isGuestAllowedRoute) {
  // 인증 또는 게스트 세션 확인
}
```

#### 응답 헤더
인증 성공 시 다음 헤더 추가:
- `X-User-Id`: 사용자 ID
- `X-Auth-Type`: 인증 타입 (jwt/session/guest)
- `X-Guest-Session-Id`: 게스트 세션 ID
- `X-Guest-Remaining-Attempts`: 남은 시도 횟수

## 설치된 의존성

```bash
npm install jose
```

## 환경 변수

```env
BETTER_AUTH_SECRET=your-secret-key
```

## 사용 예시

### 클라이언트 - API 호출
```typescript
// JWT 토큰으로 API 호출
fetch('/api/protected/user-data', {
  headers: {
    'Authorization': `Bearer ${jwtToken}`
  }
})
```

### 서버 - 게스트 세션 생성
```typescript
// 게스트 세션 쿠키 설정
const guestData = {
  id: "guest_1234567890_abc123",
  attempts: 0,
  maxAttempts: 5,
  createdAt: new Date().toISOString()
}

const encoded = Buffer.from(JSON.stringify(guestData)).toString("base64")
response.cookies.set("unitylearn_guest_data", encoded)
```

## 에러 응답

### API 요청 실패 (401)
```json
{
  "success": false,
  "error": "인증 토큰이 필요합니다",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 페이지 요청 실패
- 로그인 페이지로 리다이렉트
- `?redirect=/original/path` 파라미터 추가

## 테스트 체크리스트

- [ ] TypeScript 타입 체크 통과
- [ ] 공개 라우트 접근 가능
- [ ] 보호된 라우트 JWT 검증 작동
- [ ] 게스트 모드 정상 작동
- [ ] API 401 응답 반환
- [ ] 페이지 리다이렉트 작동
- [ ] 인증 헤더 전달 확인

## 검증 결과

✅ **TypeScript 타입 체크**: 통과  
✅ **신규 파일 타입 오류**: 없음  
✅ **모든 요구사항 구현 완료**

## 확장 가이드

### 새로운 보호된 라우트 추가
```typescript
// lib/routes.ts
export const PROTECTED_ROUTES = [
  "/dashboard",
  "/api/protected/",
  "/new-route",  // 추가
] as const
```

### 새로운 인증 방식 추가
```typescript
// lib/jwt.ts의 verifyAuthentication 함수에 추가
// 4. Custom Token 검증
if (params.customToken) {
  const customResult = await verifyCustomToken(params.customToken)
  if (customResult.valid) {
    return { authenticated: true, type: "custom", ... }
  }
}
```
