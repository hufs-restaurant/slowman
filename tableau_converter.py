"""
Tableau 데이터 업데이트를 위한 JSON to CSV 변환기
Tableau는 CSV 파일을 읽을 수 있으므로, 크롤링한 JSON 데이터를 CSV로 변환
"""

import json
import csv
from typing import List, Dict

def json_to_csv(json_file: str, csv_file: str):
    """JSON 파일을 Tableau용 CSV로 변환"""
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    restaurants = data.get('restaurants', [])
    
    if not restaurants:
        print("변환할 데이터가 없습니다.")
        return
    
    # CSV 헤더 정의
    fieldnames = [
        'name',
        'address',
        'phone',
        'rating',
        'review_count',
        'category',
        'price_range',
        'opening_hours',
        'campus',
        'source',
        'last_updated',
        'reviews'
    ]
    
    # CSV 작성
    with open(csv_file, 'w', newline='', encoding='utf-8-sig') as f:  # utf-8-sig: Excel 호환
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        
        for restaurant in restaurants:
            row = {
                'name': restaurant.get('name', ''),
                'address': restaurant.get('address', ''),
                'phone': restaurant.get('phone', ''),
                'rating': restaurant.get('rating', ''),
                'review_count': restaurant.get('review_count', ''),
                'category': restaurant.get('category', ''),
                'price_range': restaurant.get('price_range', ''),
                'opening_hours': restaurant.get('opening_hours', ''),
                'campus': restaurant.get('campus', ''),
                'source': restaurant.get('source', ''),
                'last_updated': restaurant.get('last_updated', ''),
                'reviews': ' | '.join(restaurant.get('reviews', []))  # 리뷰는 파이프로 구분
            }
            writer.writerow(row)
    
    print(f"CSV 변환 완료: {csv_file}")
    print(f"총 {len(restaurants)}개 맛집 데이터 변환됨")

def merge_campus_data(seoul_file: str, global_file: str, output_file: str):
    """서울캠과 글로벌캠 데이터를 하나로 병합"""
    all_restaurants = []
    
    # 서울캠 데이터 로드
    try:
        with open(seoul_file, 'r', encoding='utf-8') as f:
            seoul_data = json.load(f)
            all_restaurants.extend(seoul_data.get('restaurants', []))
    except FileNotFoundError:
        print(f"파일을 찾을 수 없습니다: {seoul_file}")
    
    # 글로벌캠 데이터 로드
    try:
        with open(global_file, 'r', encoding='utf-8') as f:
            global_data = json.load(f)
            all_restaurants.extend(global_data.get('restaurants', []))
    except FileNotFoundError:
        print(f"파일을 찾을 수 없습니다: {global_file}")
    
    # 병합된 데이터 저장
    merged_data = {
        'last_updated': json.load(open(seoul_file, 'r', encoding='utf-8')).get('last_updated', ''),
        'restaurant_count': len(all_restaurants),
        'restaurants': all_restaurants
    }
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(merged_data, f, ensure_ascii=False, indent=2)
    
    print(f"병합 완료: {output_file}")
    print(f"총 {len(all_restaurants)}개 맛집 데이터")

if __name__ == "__main__":
    # JSON to CSV 변환
    json_to_csv("restaurants_seoul.json", "restaurants_seoul.csv")
    json_to_csv("restaurants_global.json", "restaurants_global.csv")
    
    # 데이터 병합
    merge_campus_data("restaurants_seoul.json", "restaurants_global.json", "restaurants_all.json")
    json_to_csv("restaurants_all.json", "restaurants_all.csv")

