# hufs

한국외대 맛집 지도 – Next.js + Gemini AI 기반 맛집 추천/지도 서비스

---

## 📂 데이터 소스 및 갱신 플로우

- **단일 소스**: 앱과 API는 모두 `data/restaurants.json`만 참조합니다.
- **갱신 방법**  
  1. `.env`에 `GEMINI_API_KEY` 설정  
  2. `pip install google-generativeai python-dotenv` (또는 `google-genai`)  
  3. 실행: `python gemini_data_updater.py`  
  4. 스크립트가 `data/restaurants.json`을 읽어 Gemini로 정보를 보강한 뒤, 같은 파일을 덮어씁니다.  
  5. 기존 파일은 `data/restaurants.json.bak`으로 백업된 뒤 교체됩니다.
- **옵션**: `--dry-run`(저장 없이 실행), `--retry-failed data/update_failed.json`(실패 항목만 재시도), `--log logs/update.log`(로그 저장)

---

## 🚀 더 디벨롭할 사항 (Further Development)

### 1. 데이터 & 백엔드
- [x] **데이터 소스 통일**: `gemini_data_updater.py`가 `data/restaurants.json` 단일 파일을 읽고 덮어쓰며, API/앱은 동일 파일만 참조. 갱신 플로우는 아래 문서화.
- [x] **업데이트 스크립트 개선**: `--dry-run`, `--retry-failed FILE`, `--log FILE`, 실패 목록 `data/update_failed.json` 저장
- [x] **데이터 검증**: `data_validator.validate_gemini_response()`로 스키마 검증, 타입/필수 필드 오류 시 스킵 후 실패 목록에 기록
- [x] **Restaurant 타입 확장**: `lib/restaurant.types.ts`에 `address`, `phone`, `rating`, `opening_hours`, `status` 등 추가, 모달/카드에서 표시

### 2. API & 보안
- [ ] **Gemini API 호출 제한**: IP/유저당 요청 수 제한, Redis 또는 메모리 기반 rate limiting
- [ ] **입력 검증 강화**: `/api/gemini/recommend`에서 `prompt` 길이·금지어 필터, `campus` 화이트리스트 검증
- [ ] **에러 메시지 정리**: 프로덕션에서는 상세 에러를 클라이언트에 노출하지 않고, 로그만 서버에 기록

### 3. 프론트엔드 & UX
- [ ] **AI 추천 로딩/에러 UX**: 로딩 스켈레톤, 타임아웃 안내, 재시도 버튼
- [ ] **캐시/ISR**: 추천 결과 단기 캐시(같은 prompt/campus), 맛집 목록은 현재처럼 ISR 유지
- [ ] **반응형/접근성**: 지도·필터·모달의 모바일 레이아웃, 키보드 포커스, aria 레이블 점검

### 4. 자동화 & 운영
- [ ] **정기 데이터 갱신**: GitHub Actions 등으로 `gemini_data_updater.py` 주기 실행 후 `restaurants.json` 갱신 (API 키는 Secrets 사용)
- [ ] **크롤링 파이프라인**: `AI_자동화_방안.md`의 Playwright/Agent 설계 참고해 신규 맛집 수집·검증 자동화
- [ ] **모니터링**: API 응답 시간·에러율 로깅, 비정상 시 알림

### 5. 품질 & 문서
- [ ] **테스트**: API 라우트 단위 테스트, 맛집 데이터 스냅샷/스키마 테스트
- [ ] **문서**: `Gemini_API_가이드.md`에 환경 변수·배포 체크리스트 보강, `.env.example` 제공
- [ ] **.env.local**: 이미 `.gitignore`에 포함되어 있는지 확인하고, 한 번 커밋된 이력이 있으면 `git rm --cached .env.local` 후 재커밋해 추적 제거