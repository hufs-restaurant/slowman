"""
간단한 데이터 검증 및 중복 제거 유틸리티
- Gemini API 응답 스키마 검증 (validate_gemini_response)
- 맛집 목록 검증/중복 제거 (validate_restaurant_data, remove_duplicates)
"""

import json
from typing import List, Dict, Any, Optional, Tuple
from difflib import SequenceMatcher

# Gemini 업데이트 응답에 허용되는 필드 및 타입
GEMINI_RESPONSE_SCHEMA = {
    "name": (str, True),           # 필수
    "address": (str, False),
    "phone": (str, False),
    "rating": ((int, float), False),
    "review_count": (int, False),
    "category": (str, False),
    "price_range": (str, False),
    "opening_hours": (str, False),
    "status": (str, False),
    "last_updated": (str, False),
}


def validate_gemini_response(obj: Any) -> Tuple[bool, Optional[str]]:
    """
    Gemini API가 반환한 맛집 정보 JSON이 스키마에 맞는지 검증.
    반환: (유효 여부, 오류 메시지 또는 None)
    """
    if not isinstance(obj, dict):
        return False, "응답이 객체가 아닙니다."
    for field, (allowed_type, required) in GEMINI_RESPONSE_SCHEMA.items():
        if field not in obj:
            if required:
                return False, f"필수 필드 누락: {field}"
            continue
        val = obj[field]
        if val is None:
            continue
        if required and not val:
            return False, f"필수 필드 비어 있음: {field}"
        if isinstance(allowed_type, tuple):
            type_ok = isinstance(val, allowed_type)
        else:
            type_ok = isinstance(val, allowed_type)
        if not type_ok:
            return False, f"필드 타입 오류: {field} (기대: {allowed_type})"
    # rating 범위
    if "rating" in obj and obj["rating"] is not None:
        try:
            r = float(obj["rating"])
            if r < 0 or r > 5:
                return False, "rating은 0~5 사이여야 합니다."
        except (TypeError, ValueError):
            return False, "rating은 숫자여야 합니다."
    return True, None

def similarity(a: str, b: str) -> float:
    """두 문자열의 유사도 계산 (0.0 ~ 1.0)"""
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()

def remove_duplicates(restaurants: List[Dict], threshold: float = 0.85) -> List[Dict]:
    """중복된 맛집 제거 (이름 유사도 기준)"""
    unique_restaurants = []
    seen_names = []
    
    for restaurant in restaurants:
        name = restaurant.get('name', '').strip()
        if not name:
            continue
        
        # 유사한 이름이 있는지 확인
        is_duplicate = False
        for seen_name in seen_names:
            if similarity(name, seen_name) >= threshold:
                is_duplicate = True
                print(f"중복 제거: {name} (유사: {seen_name})")
                break
        
        if not is_duplicate:
            unique_restaurants.append(restaurant)
            seen_names.append(name)
    
    return unique_restaurants

def validate_restaurant_data(restaurant: Dict) -> bool:
    """맛집 데이터 유효성 검증"""
    required_fields = ['name']
    
    # 필수 필드 확인
    for field in required_fields:
        if field not in restaurant or not restaurant[field]:
            return False
    
    # 이름이 너무 짧거나 이상한 경우 제외
    name = restaurant.get('name', '').strip()
    if len(name) < 2:
        return False
    
    # 평점 범위 확인
    rating = restaurant.get('rating')
    if rating is not None:
        try:
            rating = float(rating)
            if rating < 0 or rating > 5:
                return False
        except (ValueError, TypeError):
            pass
    
    return True

def clean_and_validate_data(input_file: str, output_file: str):
    """데이터 정제 및 검증"""
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    restaurants = data.get('restaurants', [])
    
    # 검증
    validated = [r for r in restaurants if validate_restaurant_data(r)]
    print(f"검증 전: {len(restaurants)}, 검증 후: {len(validated)}")
    
    # 중복 제거
    unique = remove_duplicates(validated)
    print(f"중복 제거 후: {len(unique)}")
    
    # 결과 저장
    data['restaurants'] = unique
    data['restaurant_count'] = len(unique)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"정제된 데이터 저장: {output_file}")

if __name__ == "__main__":
    # 사용 예시
    clean_and_validate_data("restaurants_seoul.json", "restaurants_seoul_cleaned.json")
    clean_and_validate_data("restaurants_global.json", "restaurants_global_cleaned.json")



