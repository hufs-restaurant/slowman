# Windows PowerShell 환경 설정 가이드

## ✅ 설치 완료 확인

다음 명령어로 설치가 제대로 되었는지 확인하세요:

```powershell
# Python 버전 확인
python --version

# pip 확인
python -m pip --version

# Playwright 확인
python -m playwright --version
```

## 📝 Windows에서 명령어 사용법

Windows PowerShell에서는 `pip` 대신 `python -m pip`를 사용하는 것이 더 안정적입니다.

### ❌ 잘못된 방법
```powershell
pip install package_name
playwright install chromium
```

### ✅ 올바른 방법
```powershell
python -m pip install package_name
python -m playwright install chromium
```

## 🔧 PATH 환경 변수 설정 (선택사항)

경고 메시지가 나왔다면, Python Scripts 디렉토리를 PATH에 추가할 수 있습니다:

### 방법 1: PowerShell에서 임시로 추가 (현재 세션만)
```powershell
$env:Path += ";C:\Users\goni1\AppData\Local\Python\pythoncore-3.14-64\Scripts"
```

### 방법 2: 영구적으로 추가
1. Windows 검색에서 "환경 변수" 검색
2. "시스템 환경 변수 편집" 클릭
3. "환경 변수" 버튼 클릭
4. "Path" 선택 후 "편집"
5. "새로 만들기" 클릭
6. 다음 경로 추가:
   ```
   C:\Users\goni1\AppData\Local\Python\pythoncore-3.14-64\Scripts
   ```
7. 확인 클릭 후 PowerShell 재시작

**참고**: PATH 설정은 선택사항입니다. `python -m pip` 형태로 사용하면 PATH 설정 없이도 작동합니다.

## 🚀 다음 단계

### 1. 프로젝트 디렉토리로 이동
```powershell
# 한글 경로가 있는 경우
cd "C:\Users\goni1\OneDrive\바탕 화면\slowman"

# 또는 짧은 경로 사용 (OneDrive가 C:\Users\goni1\OneDrive에 있는 경우)
cd ~\OneDrive\바탕` 화면\slowman
```

### 2. .env 파일 생성
프로젝트 디렉토리에 `.env` 파일을 만들고 OpenAI API 키를 추가하세요:

```
OPENAI_API_KEY=sk-your-api-key-here
```

### 3. 크롤러 실행 테스트
```powershell
python crawler_agent.py
```

## 💡 유용한 PowerShell 명령어

### 현재 디렉토리 확인
```powershell
Get-Location
# 또는
pwd
```

### 파일 목록 보기
```powershell
Get-ChildItem
# 또는
ls
# 또는
dir
```

### Python 스크립트 실행
```powershell
python script_name.py
```

### 가상환경 생성 (선택사항, 권장)
```powershell
# 가상환경 생성
python -m venv venv

# 가상환경 활성화
.\venv\Scripts\Activate.ps1

# 가상환경 비활성화
deactivate
```

## ⚠️ 문제 해결

### "실행 정책" 오류가 발생하는 경우
가상환경 활성화 시 다음과 같은 오류가 발생할 수 있습니다:
```
실행 정책 때문에 이 스크립트를 로드할 수 없습니다.
```

해결 방법:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 한글 경로 문제
한글이 포함된 경로에서 문제가 발생하면:
- 짧은 경로 사용
- 또는 영문 경로로 프로젝트 이동

### 패키지 설치 오류
```powershell
# pip 업그레이드
python -m pip install --upgrade pip

# 캐시 클리어 후 재설치
python -m pip cache purge
python -m pip install package_name
```

## 📚 추가 리소스

- [Python 공식 문서](https://docs.python.org/ko/3/)
- [Playwright 문서](https://playwright.dev/python/)
- [OpenAI API 문서](https://platform.openai.com/docs)

