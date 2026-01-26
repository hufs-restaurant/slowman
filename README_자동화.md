# 한국외대 맛집 지도 - AI Agent 자동화 시스템
# 필요한 패키지 설치 가이드

## 필수 패키지 설치

```bash
pip install playwright openai python-dotenv
```

## Playwright 브라우저 설치

```bash
playwright install chromium
```

## 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 추가하세요:

```
OPENAI_API_KEY=your_openai_api_key_here
```

또는 Anthropic Claude를 사용하는 경우:

```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

## 실행 방법

```bash
python crawler_agent.py
```

## GitHub Actions 자동화 설정

`.github/workflows/auto-crawl.yml` 파일을 생성하여 주기적 실행 설정:

```yaml
name: Auto Crawl Restaurants

on:
  schedule:
    - cron: '0 2 * * 0'  # 매주 일요일 새벽 2시
  workflow_dispatch:  # 수동 실행도 가능

jobs:
  crawl:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          pip install playwright openai python-dotenv
          playwright install chromium
      - name: Run crawler
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: python crawler_agent.py
      - name: Commit changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add restaurants_*.json
          git commit -m "Auto update restaurant data" || exit 0
          git push
```

## 비용 최적화 팁

1. **LLM 선택**: GPT-3.5-turbo가 GPT-4보다 훨씬 저렴하고 충분히 좋은 성능
2. **배치 처리**: 여러 맛집 정보를 한 번에 추출하여 API 호출 최소화
3. **캐싱**: 이미 수집한 맛집은 재수집하지 않도록
4. **무료 대안**: 
   - Hugging Face의 오픈소스 모델 사용
   - 로컬에서 실행 가능한 모델 (Llama 2 등)

## 주의사항

1. **Rate Limiting**: 너무 빠른 요청은 IP 차단 위험
2. **법적 고려**: 각 플랫폼의 이용약관 확인
3. **에러 핸들링**: 네트워크 오류, 페이지 변경 등에 대비
4. **데이터 검증**: LLM이 추출한 데이터의 정확성 검증 필요



