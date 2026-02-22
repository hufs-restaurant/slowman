# Gemini API 패키지 설치 완료 ✅

## 설치 확인

`google-generativeai` 패키지가 성공적으로 설치되었습니다!

## 다음 단계: API 키 설정

### 1. .env 파일에 API 키 추가

프로젝트 루트 디렉토리의 `.env` 파일을 열고 다음을 추가하세요:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Gemini API 키 발급 방법

1. [Google AI Studio](https://makersuite.google.com/app/apikey) 접속
2. Google 계정으로 로그인
3. "Create API Key" 버튼 클릭
4. 생성된 API 키를 복사
5. `.env` 파일에 `GEMINI_API_KEY=복사한_키` 형태로 추가

### 3. 스크립트 실행

API 키를 설정한 후:

```bash
python gemini_data_updater.py
```

## ⚠️ 주의사항

1. **Deprecation 경고**: `google.generativeai` 패키지는 deprecated 상태이지만 여전히 작동합니다.
2. **API 비용**: Gemini API는 무료 할당량이 있지만, 과도한 사용 시 비용 발생 가능
3. **Rate Limiting**: API 호출 제한이 있으므로 배치 처리 시 `time.sleep(1)` 사용

## 🔧 문제 해결

### "GEMINI_API_KEY 환경 변수가 설정되지 않았습니다" 오류
→ `.env` 파일에 `GEMINI_API_KEY`를 추가했는지 확인

### 한글 출력 오류 (Windows)
→ 기능에는 문제 없음. 무시해도 됩니다.

## 📝 사용 예시

```bash
# 1. .env 파일 수정
# GEMINI_API_KEY=your_key_here 추가

# 2. 스크립트 실행
python gemini_data_updater.py

# 3. 결과 확인
# data/restaurants_updated.json 파일 생성됨
```

