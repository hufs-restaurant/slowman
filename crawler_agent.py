"""
한국외대 맛집 지도 - AI Agent 기반 자동화 크롤러
Phase 1: MVP 구현 예제
"""

import asyncio
import json
from datetime import datetime
from typing import List, Dict
from playwright.async_api import async_playwright
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

class RestaurantCrawlerAgent:
    """맛집 크롤링을 위한 AI Agent"""
    
    def __init__(self):
        self.openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.restaurants = []
        self.campus = "seoul"  # 또는 "global"
    
    async def crawl_naver_map(self, location: str = "이문동"):
        """네이버 지도에서 맛집 정보 크롤링"""
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=False)  # 디버깅용 headless=False
            page = await browser.new_page()
            
            try:
                # 네이버 지도 접속
                print(f"네이버 지도 접속 중...")
                await page.goto("https://map.naver.com")
                await page.wait_for_timeout(2000)  # 페이지 로딩 대기
                
                # 검색어 입력
                search_input = page.locator('input[placeholder*="검색"]').first()
                await search_input.fill(f"{location} 맛집")
                await page.keyboard.press("Enter")
                await page.wait_for_timeout(3000)
                
                # 맛집 리스트 추출
                restaurant_elements = await page.locator('.place_section_content li').all()
                print(f"발견된 맛집 수: {len(restaurant_elements)}")
                
                # 각 맛집 정보 수집 (처음 10개만)
                for i, element in enumerate(restaurant_elements[:10]):
                    try:
                        restaurant_info = await self.extract_restaurant_info(page, element)
                        if restaurant_info:
                            restaurant_info['campus'] = self.campus
                            restaurant_info['source'] = 'naver_map'
                            restaurant_info['last_updated'] = datetime.now().isoformat()
                            self.restaurants.append(restaurant_info)
                            print(f"{i+1}. {restaurant_info.get('name', 'Unknown')} 수집 완료")
                    except Exception as e:
                        print(f"맛집 {i+1} 수집 중 오류: {e}")
                        continue
                    
                    await page.wait_for_timeout(1000)  # Rate limiting
                
            except Exception as e:
                print(f"크롤링 중 오류 발생: {e}")
            finally:
                await browser.close()
    
    async def extract_restaurant_info(self, page, element) -> Dict:
        """개별 맛집 정보 추출"""
        try:
            # 맛집 이름 클릭하여 상세 페이지로 이동
            name_element = element.locator('.place_bluelink').first()
            restaurant_name = await name_element.text_content()
            
            # 상세 페이지로 이동
            await name_element.click()
            await page.wait_for_timeout(2000)
            
            # 페이지의 모든 텍스트 추출
            page_text = await page.locator('body').text_content()
            
            # LLM을 사용하여 구조화된 데이터 추출
            structured_data = await self.extract_with_llm(restaurant_name, page_text)
            
            # 뒤로 가기
            await page.go_back()
            await page.wait_for_timeout(1000)
            
            return structured_data
            
        except Exception as e:
            print(f"정보 추출 중 오류: {e}")
            return None
    
    async def extract_with_llm(self, name: str, raw_text: str) -> Dict:
        """LLM을 사용하여 텍스트에서 구조화된 데이터 추출"""
        prompt = f"""
다음은 네이버 지도에서 추출한 맛집 정보입니다. 텍스트에서 중요한 정보만 추출하여 JSON 형식으로 반환해주세요.

음식점 이름: {name}
전체 텍스트:
{raw_text[:2000]}  # 텍스트가 너무 길면 잘라냄

다음 형식의 JSON만 반환하세요 (다른 설명 없이):
{{
    "name": "음식점 이름",
    "address": "주소",
    "phone": "전화번호 (없으면 null)",
    "rating": 평점 숫자 (없으면 null),
    "review_count": 리뷰 수 (없으면 null),
    "category": "음식 카테고리",
    "price_range": "가격대 (예: 10000-20000원)",
    "opening_hours": "영업시간 (없으면 null)",
    "reviews": ["대표 리뷰 1-2개"]
}}
"""
        
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",  # 비용 절감을 위해 3.5 사용
                messages=[
                    {"role": "system", "content": "You are a data extraction assistant. Extract restaurant information and return only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3
            )
            
            result_text = response.choices[0].message.content.strip()
            # JSON 파싱
            if result_text.startswith("```json"):
                result_text = result_text.replace("```json", "").replace("```", "").strip()
            elif result_text.startswith("```"):
                result_text = result_text.replace("```", "").strip()
            
            return json.loads(result_text)
            
        except Exception as e:
            print(f"LLM 추출 중 오류: {e}")
            # 기본 정보만 반환
            return {
                "name": name,
                "address": None,
                "phone": None,
                "rating": None,
                "review_count": None,
                "category": None,
                "price_range": None,
                "opening_hours": None,
                "reviews": []
            }
    
    def save_data(self, filename: str = "restaurants_data.json"):
        """수집한 데이터를 JSON 파일로 저장"""
        output = {
            "campus": self.campus,
            "last_updated": datetime.now().isoformat(),
            "restaurant_count": len(self.restaurants),
            "restaurants": self.restaurants
        }
        
        # 기존 데이터가 있으면 병합
        if os.path.exists(filename):
            with open(filename, 'r', encoding='utf-8') as f:
                existing_data = json.load(f)
                # 중복 제거 (이름 기준)
                existing_names = {r['name'] for r in existing_data.get('restaurants', [])}
                new_restaurants = [r for r in self.restaurants if r['name'] not in existing_names]
                output['restaurants'] = existing_data.get('restaurants', []) + new_restaurants
                output['restaurant_count'] = len(output['restaurants'])
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(output, f, ensure_ascii=False, indent=2)
        
        print(f"\n데이터 저장 완료: {filename}")
        print(f"총 맛집 수: {output['restaurant_count']}")


async def main():
    """메인 실행 함수"""
    print("=" * 50)
    print("한국외대 맛집 지도 - AI Agent 크롤러")
    print("=" * 50)
    
    # 서울캠 크롤링
    crawler_seoul = RestaurantCrawlerAgent()
    crawler_seoul.campus = "seoul"
    print("\n[서울캠] 네이버 지도 크롤링 시작...")
    await crawler_seoul.crawl_naver_map("이문동")
    crawler_seoul.save_data("restaurants_seoul.json")
    
    # 글로벌캠 크롤링
    crawler_global = RestaurantCrawlerAgent()
    crawler_global.campus = "global"
    print("\n[글로벌캠] 네이버 지도 크롤링 시작...")
    await crawler_global.crawl_naver_map("용인시 처인구 모현읍")
    crawler_global.save_data("restaurants_global.json")
    
    print("\n크롤링 완료!")


if __name__ == "__main__":
    asyncio.run(main())



