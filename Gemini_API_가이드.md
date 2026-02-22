# Gemini API 활용 가이드

## 🔑 API 키 설정

### 1. Gemini API 키 발급
1. [Google AI Studio](https://makersuite.google.com/app/apikey) 접속
2. API 키 생성
3. `.env` 파일에 추가:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

### 2. 프론트엔드 사용 (보안 주의)
⚠️ **중요**: 프론트엔드에서 직접 API 키를 사용하는 것은 보안상 위험합니다.
실제 프로덕션 환경에서는 백엔드 서버를 통해 API를 호출해야 합니다.

현재 구현은 데모용으로, 사용자가 직접 API 키를 입력하도록 되어 있습니다.

## 🤖 AI 식당 추천 기능

### 사용 방법
1. 메인 페이지 또는 랜덤메뉴 페이지에서 "🤖 AI 식당 추천" 버튼 클릭
2. 먹고 싶은 음식이나 조건 입력 (예: "매운 음식", "저렴한 한식", "데이트하기 좋은 곳")
3. 캠퍼스 선택 (전체/서울캠/글로벌캠)
4. "✨ AI 추천 받기" 버튼 클릭
5. API 키 입력 (프로덕션에서는 서버를 통해 자동 처리)
6. 추천 결과 확인 및 클릭하여 상세 정보 보기

### 추천 결과
- 맛집 이름
- 캠퍼스 정보
- 추천 이유
- 적합도 점수 (1-10)
- 클릭 시 상세 정보 팝업 및 지도 링크

## 📊 데이터 업데이트 기능

### Python 스크립트 사용
```bash
# 패키지 설치
pip install google-generativeai python-dotenv

# 환경 변수 설정
export GEMINI_API_KEY=your_api_key

# 데이터 업데이트 실행
python gemini_data_updater.py
```

### 기능
- 맛집 정보 자동 업데이트
- 주소, 전화번호, 평점, 리뷰 수 등 최신 정보 수집
- 영업 상태 확인 (영업중/폐업)
- 배치 처리로 여러 맛집 일괄 업데이트

## 🔒 보안 개선 방안

### 권장 구조
```
프론트엔드 (HTML/JS)
    ↓
백엔드 API 서버 (Node.js/Python)
    ↓
Gemini API
```

### 백엔드 예시 (Node.js)
```javascript
// server.js
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/recommend', async (req, res) => {
  const { prompt, campus } = req.body;
  // Gemini API 호출
  // 결과 반환
});
```

## 💡 활용 예시

### 프롬프트 예시
- "매운 음식 먹고 싶어"
- "저렴하게 먹을 수 있는 곳"
- "데이트하기 좋은 분위기 좋은 곳"
- "치킨 먹고 싶은데 배달 가능한 곳"
- "한식 중에서 추천해줘"
- "글로벌캠에서 저녁 먹을 곳"

### 응답 형식
```json
{
  "recommendations": [
    {
      "name": "맛집 이름",
      "campus": "seoul",
      "reason": "사용자의 요구사항에 적합한 이유",
      "match_score": 8
    }
  ]
}
```

## 📝 주의사항

1. **API 비용**: Gemini API는 무료 할당량이 있지만, 과도한 사용 시 비용 발생 가능
2. **Rate Limiting**: API 호출 제한 확인 필요
3. **데이터 정확성**: AI가 생성한 정보는 검증 필요
4. **보안**: API 키는 절대 공개 저장소에 커밋하지 말 것

