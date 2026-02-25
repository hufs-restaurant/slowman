"""
Gemini API를 활용한 맛집 데이터 업데이트 스크립트
- 단일 소스: data/restaurants.json
- dry-run, 실패 항목만 재시도, 진행률/로그 파일 지원
"""

import argparse
import json
import os
import sys
import time
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv

# 프로젝트 루트에서 data_validator import
sys.path.insert(0, str(Path(__file__).resolve().parent))
try:
    from data_validator import validate_gemini_response
except ImportError:
    validate_gemini_response = None

# 최신 google-genai 패키지 사용 (또는 google.generativeai 사용 가능)
try:
    import google.genai as genai
    from google.genai import Client
    USE_NEW_API = True
except ImportError:
    try:
        from google.generativeai import GenerativeModel
        import google.generativeai as genai
        USE_NEW_API = False
    except ImportError:
        raise ImportError("google-generativeai 또는 google-genai 패키지가 필요합니다. pip install google-generativeai 실행하세요.")

load_dotenv()

class GeminiDataUpdater:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY 환경 변수가 설정되지 않았습니다. .env 파일에 GEMINI_API_KEY를 추가하세요.")
        
        if USE_NEW_API:
            self.client = Client(api_key=api_key)
            self.model_name = 'gemini-1.5-flash'  # 또는 'gemini-1.5-pro'
        else:
            genai.configure(api_key=api_key)
            self.model = GenerativeModel('gemini-pro')
            self.model_name = 'gemini-pro'
    
    def update_restaurant_info(self, restaurant_name: str, campus: str = "seoul") -> dict:
        """맛집 정보를 Gemini API로 업데이트"""
        location = "이문동" if campus == "seoul" else "용인시 처인구 모현읍"
        
        prompt = f"""
다음 맛집의 최신 정보를 조사하여 JSON 형식으로 제공해주세요:

맛집 이름: {restaurant_name}
위치: {location}

다음 정보를 포함해주세요:
- 주소
- 전화번호
- 평점 (0-5)
- 리뷰 수
- 카테고리
- 가격대
- 영업시간
- 현재 영업 상태 (영업중/폐업/정보없음)

다음 JSON 형식으로만 응답해주세요 (다른 설명 없이):
{{
    "name": "{restaurant_name}",
    "address": "주소 또는 null",
    "phone": "전화번호 또는 null",
    "rating": 평점 숫자 또는 null,
    "review_count": 리뷰 수 숫자 또는 null,
    "category": "카테고리",
    "price_range": "가격대 또는 null",
    "opening_hours": "영업시간 또는 null",
    "status": "영업중/폐업/정보없음",
    "last_updated": "{datetime.now().isoformat()}"
}}
"""
        
        try:
            if USE_NEW_API:
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt
                )
                text = response.text.strip()
            else:
                response = self.model.generate_content(prompt)
                text = response.text.strip()
            
            # JSON 추출
            if text.startswith("```json"):
                text = text.replace("```json", "").replace("```", "").strip()
            elif text.startswith("```"):
                text = text.replace("```", "").strip()
            
            return json.loads(text)
        except Exception as e:
            print(f"정보 업데이트 오류 ({restaurant_name}): {e}")
            return None

    def _log(self, log_path: str | None, msg: str) -> None:
        if not log_path:
            return
        with open(log_path, "a", encoding="utf-8") as f:
            f.write(f"[{datetime.now().isoformat()}] {msg}\n")

    def batch_update_restaurants(
        self,
        restaurants_file: str,
        output_file: str,
        *,
        dry_run: bool = False,
        retry_failed_path: str | None = None,
        log_file_path: str | None = None,
        failed_list_path: str | None = None,
    ):
        """여러 맛집 정보를 일괄 업데이트. 실패한 항목은 failed_list_path에 저장해 --retry-failed로 재시도 가능."""
        with open(restaurants_file, "r", encoding="utf-8") as f:
            data = json.load(f)

        # 재시도 모드: 실패 목록만 처리
        to_process: list[tuple[str, str, dict]] = []  # (campus_key, name, restaurant_ref)
        if retry_failed_path and os.path.exists(retry_failed_path):
            with open(retry_failed_path, "r", encoding="utf-8") as f:
                failed_list = json.load(f)
            for item in failed_list:
                campus_key = item.get("campus", "seoul")
                name = item.get("name", "")
                if campus_key not in data or not name:
                    continue
                for r in data[campus_key].get("restaurants", []):
                    if r.get("name") == name:
                        to_process.append((campus_key, name, r))
                        break
            if not to_process:
                print("재시도할 항목이 없습니다.")
                return 0
            print(f"실패 항목만 재시도: {len(to_process)}개")
        else:
            for campus_key in ["seoul", "global"]:
                if campus_key not in data:
                    continue
                campus_data = data[campus_key]
                for r in campus_data.get("restaurants", []):
                    to_process.append((campus_key, r["name"], r))

        total = len(to_process)
        updated_count = 0
        failed_items: list[dict] = []

        if log_file_path:
            Path(log_file_path).parent.mkdir(parents=True, exist_ok=True)
            with open(log_file_path, "w", encoding="utf-8") as f:
                f.write(f"업데이트 시작 (dry_run={dry_run}) {datetime.now().isoformat()}\n")

        for idx, (campus_key, name, restaurant) in enumerate(to_process, 1):
            campus_label = data.get(campus_key, {}).get("campus", campus_key)
            print(f"[{idx}/{total}] {name} ({campus_label}) 업데이트 중...")
            updated_info = self.update_restaurant_info(name, campus_key)

            if updated_info:
                if validate_gemini_response:
                    valid, err = validate_gemini_response(updated_info)
                    if not valid:
                        self._log(log_file_path, f"VALIDATE_FAIL {name} ({campus_key}) {err}")
                        failed_items.append({"name": name, "campus": campus_key})
                        continue
                restaurant.update(updated_info)
                updated_count += 1
                self._log(log_file_path, f"OK {name} ({campus_key})")
            else:
                failed_items.append({"name": name, "campus": campus_key})
                self._log(log_file_path, f"FAIL {name} ({campus_key}) API 오류")

            time.sleep(1)

        if failed_list_path and failed_items:
            Path(failed_list_path).parent.mkdir(parents=True, exist_ok=True)
            with open(failed_list_path, "w", encoding="utf-8") as f:
                json.dump(failed_items, f, ensure_ascii=False, indent=2)
            print(f"실패 {len(failed_items)}건 → {failed_list_path} 에 저장. 재시도: --retry-failed {failed_list_path}")

        if not dry_run and updated_count > 0:
            self._save_safely(data, output_file)
        elif dry_run:
            print("[dry-run] 저장하지 않음.")

        print(f"\n총 {updated_count}개 맛집 정보 업데이트 완료. 실패: {len(failed_items)}건")
        return updated_count

    def _save_safely(self, data: dict, output_file: str) -> None:
        """기존 파일 백업 후 안전하게 저장 (단일 데이터 소스 유지)"""
        output_path = os.path.abspath(output_file)
        dir_path = os.path.dirname(output_path)
        base_name = os.path.basename(output_path)
        temp_path = os.path.join(dir_path, f".{base_name}.tmp")
        backup_path = os.path.join(dir_path, f"{base_name}.bak")
        try:
            # 임시 파일에 먼저 저장
            with open(temp_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            # 기존 파일이 있으면 백업
            if os.path.exists(output_path):
                if os.path.exists(backup_path):
                    os.remove(backup_path)
                os.rename(output_path, backup_path)
            # 임시 파일을 최종 경로로 이동 (원자적 교체)
            os.rename(temp_path, output_path)
        except Exception as e:
            if os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except OSError:
                    pass
            raise RuntimeError(f"저장 실패: {e}") from e

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Gemini API로 맛집 데이터 업데이트 (단일 소스: data/restaurants.json)")
    parser.add_argument("--input", "-i", default="data/restaurants.json", help="입력 JSON 경로")
    parser.add_argument("--output", "-o", default="data/restaurants.json", help="출력 JSON 경로 (단일 소스)")
    parser.add_argument("--dry-run", action="store_true", help="실제 저장 없이 실행만 (진행률만 출력)")
    parser.add_argument("--retry-failed", metavar="FILE", default=None, help="이전 실패 목록 파일로 해당 항목만 재시도 (예: data/update_failed.json)")
    parser.add_argument("--log", "-l", metavar="FILE", default=None, help="진행 로그를 저장할 파일 경로")
    parser.add_argument("--failed-list", metavar="FILE", default="data/update_failed.json", help="실패 항목을 쓸 파일 (재시도 시 사용)")
    args = parser.parse_args()
    updater = GeminiDataUpdater()
    updater.batch_update_restaurants(
        args.input,
        args.output,
        dry_run=args.dry_run,
        retry_failed_path=args.retry_failed,
        log_file_path=args.log,
        failed_list_path=args.failed_list,
    )

