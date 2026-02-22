# Next.js 연동 완료 가이드

## 변경 사항 요약

모든 기존 HTML 페이지가 **Next.js + React**로 마이그레이션되었습니다.

### 라우팅 구조

| 기존 HTML | Next.js 경로 |
|-----------|-------------|
| 맛집외대통합3탄.html | `/` (홈) |
| 랜덤메뉴.html | `/random` |
| 개발자정보.html | `/developer` |
| 맛집서울캠5탄_지도확대.html | `/map/seoul` |
| 맛집글로벌캠6탄.html | `/map/global` |

### 로고 설정

- **경로**: `/외대로고.jpeg` (public 폴더)
- 프로젝트 루트의 `외대로고.jpeg`를 `public/` 폴더로 복사하세요.
  ```bash
  npm run copy-logo
  ```
  또는 수동 복사: `외대로고.jpeg` → `public/외대로고.jpeg`

### Gemini API 연동

- `.env.local`에 `GEMINI_API_KEY=your_key` 설정
- AI 식당 추천은 `/api/gemini/recommend` API 라우트 사용
- 홈·랜덤 페이지의 "🤖 AI 식당 추천" 버튼으로 사용

### 실행 방법

```bash
# 의존성 설치
npm install

# 로고 복사 (선택)
npm run copy-logo

# 개발 서버
npm run dev
```

브라우저에서 http://localhost:3000 접속

### 빌드

```bash
npm run build
npm start
```

### 주요 컴포넌트

- **Header**: 로고, 네비게이션 (경로별 타이틀)
- **Hero**: 메인 히어로, 캠퍼스 버튼
- **Filter**: 맛집 검색
- **AIModal**: AI 추천 모달
- **RestaurantModal**: 맛집 상세 (지도 링크)
- **TableauMap**: Tableau 지도 임베드
