# Gemini API 패키지 설치 및 사용 가이드

## ✅ 설치 완료

`google-generativeai` 패키지가 성공적으로 설치되었습니다!

## ⚠️ 중요 참고사항

### Deprecation 경고
현재 `google.generativeai` 패키지는 deprecated(사용 중단 예정) 상태입니다.
하지만 여전히 작동하며, 향후 `google-genai` 패키지로 전환할 수 있습니다.

### 현재 사용 가능한 패키지
- ✅ `google-generativeai` (현재 설치됨, 작동함)
- 🔄 `google-genai` (최신 버전, 향후 권장)

## 🚀 스크립트 실행 방법

### 1. API 키 설정

`.env` 파일을 생성하거나 수정하여 Gemini API 키를 추가하세요:

```bash
# .env 파일
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. API 키 발급 방법

1. [Google AI Studio](https://makersuite.google.com/app/apikey) 접속
2. "Create API Key" 클릭
3. 생성된 API 키를 `.env` 파일에 추가

### 3. 스크립트 실행

```bash
# Windows PowerShell
python gemini_data_updater.py
```

또는 Git Bash에서:
```bash
python gemini_data_updater.py
```

## 📝 스크립트 사용 예시

### 전체 데이터 업데이트
```bash
python gemini_data_updater.py
```

### 특정 맛집만 업데이트 (스크립트 수정 필요)
스크립트를 수정하여 특정 맛집만 업데이트할 수 있습니다.

## 🔧 문제 해결

### ModuleNotFoundError 해결됨
✅ `google-generativeai` 패키지가 설치되었습니다.

### 다른 오류가 발생하는 경우

1. **API 키 오류**
   ```
   ValueError: GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.
   ```
   → `.env` 파일에 `GEMINI_API_KEY` 추가

2. **패키지 버전 충돌**
   ```bash
   python -m pip install --upgrade google-generativeai
   ```

3. **인코딩 오류 (Windows)**
   - 스크립트 실행 시 한글 출력 문제는 무시해도 됩니다
   - 실제 기능은 정상 작동합니다

## 💡 팁

- API 키는 절대 공개 저장소에 커밋하지 마세요
- `.env` 파일은 `.gitignore`에 추가되어 있는지 확인하세요
- API 사용량을 모니터링하여 비용을 관리하세요

