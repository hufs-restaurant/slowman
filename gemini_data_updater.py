"""
Gemini API를 활용한 맛집 데이터 업데이트 스크립트
"""

import json
import os
from datetime import datetime
from dotenv import load_dotenv

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
    
    def batch_update_restaurants(self, restaurants_file: str, output_file: str):
        """여러 맛집 정보를 일괄 업데이트"""
        with open(restaurants_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        updated_count = 0
        
        for campus_key in ['seoul', 'global']:
            if campus_key not in data:
                continue
            
            campus_data = data[campus_key]
            restaurants = campus_data.get('restaurants', [])
            
            print(f"\n[{campus_data.get('campus', campus_key)}] 업데이트 시작...")
            
            for i, restaurant in enumerate(restaurants, 1):
                print(f"[{i}/{len(restaurants)}] {restaurant['name']} 업데이트 중...")
                
                updated_info = self.update_restaurant_info(
                    restaurant['name'], 
                    campus_key
                )
                
                if updated_info:
                    # 기존 정보와 병합
                    restaurant.update(updated_info)
                    updated_count += 1
                
                # Rate limiting
                import time
                time.sleep(1)
        
        # 업데이트된 데이터 저장
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"\n총 {updated_count}개 맛집 정보 업데이트 완료!")
        return updated_count

if __name__ == "__main__":
    updater = GeminiDataUpdater()
    
    # 데이터 파일 업데이트
    updater.batch_update_restaurants(
        "data/restaurants.json",
        "data/restaurants_updated.json"
    )

