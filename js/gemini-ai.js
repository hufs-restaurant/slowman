// Gemini API를 활용한 AI 식당 추천 및 데이터 업데이트
class GeminiRestaurantAI {
    constructor() {
        this.apiKey = null; // 환경 변수나 설정에서 가져올 수 있음
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
        // 또는 최신 버전: gemini-1.5-flash, gemini-1.5-pro
    }

    // API 키 설정 (프론트엔드에서는 보안상 서버를 통해야 하지만, 데모용으로)
    setApiKey(key) {
        this.apiKey = key;
    }

    // AI 식당 추천
    async recommendRestaurant(userPrompt, campus = 'all') {
        if (!this.apiKey) {
            throw new Error('Gemini API 키가 설정되지 않았습니다.');
        }

        // 현재 맛집 데이터 가져오기
        const restaurants = await restaurantManager.loadRestaurants();
        if (!restaurants) {
            throw new Error('맛집 데이터를 불러올 수 없습니다.');
        }

        // 캠퍼스별 맛집 리스트 생성
        let restaurantList = '';
        if (campus === 'all' || campus === 'seoul') {
            restaurantList += '서울캠퍼스 맛집:\n';
            restaurants.seoul.restaurants.forEach(r => {
                restaurantList += `- ${r.name} (${r.category || '카테고리 없음'})\n`;
            });
        }
        if (campus === 'all' || campus === 'global') {
            restaurantList += '\n글로벌캠퍼스 맛집:\n';
            restaurants.global.restaurants.forEach(r => {
                restaurantList += `- ${r.name} (${r.category || '카테고리 없음'})\n`;
            });
        }

        const prompt = `사용자가 "${userPrompt}"를 먹고 싶어합니다.

다음은 한국외대 맛집 목록입니다:
${restaurantList}

사용자의 요구사항에 가장 적합한 맛집 3개를 추천해주세요. 각 맛집에 대해:
1. 맛집 이름
2. 추천 이유 (왜 이 맛집이 적합한지)
3. 캠퍼스 (서울캠퍼스 또는 글로벌캠퍼스)

다음 JSON 형식으로 응답해주세요:
{
  "recommendations": [
    {
      "name": "맛집 이름",
      "campus": "seoul 또는 global",
      "reason": "추천 이유",
      "match_score": 1-10 점수
    }
  ]
}`;

        try {
            const model = 'gemini-pro'; // 또는 'gemini-1.5-flash' (더 빠름)
            const response = await fetch(`${this.apiUrl.replace('gemini-pro', model)}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API 요청 실패: ${response.status} - ${JSON.stringify(errorData)}`);
            }

            const data = await response.json();
            const text = data.candidates[0].content.parts[0].text;
            
            // JSON 추출
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            
            // JSON이 없으면 텍스트 파싱 시도
            return this.parseRecommendations(text, restaurants);
        } catch (error) {
            console.error('Gemini API 오류:', error);
            throw error;
        }
    }

    // 텍스트에서 추천 결과 파싱
    parseRecommendations(text, restaurants) {
        const recommendations = [];
        const lines = text.split('\n');
        
        let currentRec = null;
        for (const line of lines) {
            if (line.includes('맛집') || line.includes('추천')) {
                const nameMatch = line.match(/([가-힣\w\s]+)/);
                if (nameMatch) {
                    if (currentRec) recommendations.push(currentRec);
                    currentRec = {
                        name: nameMatch[1].trim(),
                        campus: 'seoul',
                        reason: '',
                        match_score: 5
                    };
                }
            } else if (currentRec && line.includes('서울')) {
                currentRec.campus = 'seoul';
            } else if (currentRec && line.includes('글로벌')) {
                currentRec.campus = 'global';
            } else if (currentRec && line.trim()) {
                currentRec.reason += line.trim() + ' ';
            }
        }
        if (currentRec) recommendations.push(currentRec);
        
        return { recommendations: recommendations.slice(0, 3) };
    }

    // 최신 맛집 정보 업데이트 (네이버지도/카카오맵 기반)
    async updateRestaurantInfo(restaurantName, campus = 'seoul') {
        if (!this.apiKey) {
            throw new Error('Gemini API 키가 설정되지 않았습니다.');
        }

        const prompt = `"${restaurantName}" 맛집의 최신 정보를 조사해주세요. 
다음 정보를 JSON 형식으로 제공해주세요:
{
  "name": "맛집 이름",
  "address": "주소",
  "phone": "전화번호",
  "rating": 평점 (숫자),
  "review_count": 리뷰 수 (숫자),
  "category": "카테고리",
  "price_range": "가격대",
  "opening_hours": "영업시간",
  "status": "영업중/폐업/정보없음",
  "last_updated": "최근 업데이트 날짜"
}

만약 정확한 정보를 알 수 없다면 null로 표시해주세요.`;

        try {
            const model = 'gemini-pro';
            const response = await fetch(`${this.apiUrl.replace('gemini-pro', model)}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.5,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API 요청 실패: ${response.status} - ${JSON.stringify(errorData)}`);
            }

            const data = await response.json();
            const text = data.candidates[0].content.parts[0].text;
            
            // JSON 추출
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            
            return null;
        } catch (error) {
            console.error('정보 업데이트 오류:', error);
            throw error;
        }
    }
}

// 전역 인스턴스
const geminiAI = new GeminiRestaurantAI();

// AI 추천 UI 표시
function showAIRecommendationModal() {
    const modalHTML = `
        <div id="ai-recommendation-modal" class="modal-overlay show">
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h2 class="modal-title">🤖 AI 식당 추천</h2>
                    <button class="modal-close" onclick="closeAIRecommendationModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; color: var(--hufs-gold); margin-bottom: 0.5rem; font-weight: 600;">
                            무엇을 먹고 싶으신가요?
                        </label>
                        <textarea id="ai-prompt-input" 
                                  class="search-input" 
                                  rows="3" 
                                  placeholder="예: 매운 음식, 저렴한 한식, 데이트하기 좋은 곳, 치킨 등..."
                                  style="width: 100%; resize: vertical;"></textarea>
                    </div>
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; color: var(--hufs-gold); margin-bottom: 0.5rem; font-weight: 600;">
                            캠퍼스 선택
                        </label>
                        <select id="ai-campus-select" class="search-input" style="width: 100%;">
                            <option value="all">전체 캠퍼스</option>
                            <option value="seoul">서울캠퍼스</option>
                            <option value="global">글로벌캠퍼스</option>
                        </select>
                    </div>
                    <button id="ai-recommend-btn" class="btn btn-primary" style="width: 100%;" onclick="getAIRecommendation()">
                        ✨ AI 추천 받기
                    </button>
                    <div id="ai-recommendation-results" style="margin-top: 2rem; display: none;"></div>
                    <div id="ai-loading" class="spinner" style="display: none; margin: 2rem auto;"></div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // 배경 클릭 시 닫기
    const modal = document.getElementById('ai-recommendation-modal');
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeAIRecommendationModal();
        }
    });

    // ESC 키로 닫기
    const closeModal = (e) => {
        if (e.key === 'Escape') {
            closeAIRecommendationModal();
            document.removeEventListener('keydown', closeModal);
        }
    };
    document.addEventListener('keydown', closeModal);
}

function closeAIRecommendationModal() {
    const modal = document.getElementById('ai-recommendation-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
}

async function getAIRecommendation() {
    const promptInput = document.getElementById('ai-prompt-input');
    const campusSelect = document.getElementById('ai-campus-select');
    const resultsDiv = document.getElementById('ai-recommendation-results');
    const loadingDiv = document.getElementById('ai-loading');
    const recommendBtn = document.getElementById('ai-recommend-btn');

    const prompt = promptInput.value.trim();
    const campus = campusSelect.value;

    if (!prompt) {
        alert('먹고 싶은 음식이나 조건을 입력해주세요!');
        return;
    }

    const apiBase = (typeof window !== 'undefined' && window.GEMINI_API_BASE) || '';
    const apiUrl = apiBase ? `${apiBase}/api/gemini/recommend` : '/api/gemini/recommend';

    recommendBtn.disabled = true;
    recommendBtn.textContent = '추천 중...';
    loadingDiv.style.display = 'block';
    resultsDiv.style.display = 'none';

    try {
        const res = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, campus }),
        });
        const result = await res.json();
        if (!res.ok) {
            throw new Error(result.error || result.message || `서버 오류 (${res.status})`);
        }
        
        // 결과 표시
        if (result.recommendations && result.recommendations.length > 0) {
            let html = '<h3 style="color: var(--hufs-gold); margin-bottom: 1rem;">추천 맛집</h3>';
            
            result.recommendations.forEach((rec, index) => {
                const campusName = rec.campus === 'seoul' ? '서울캠퍼스' : '글로벌캠퍼스';
                html += `
                    <div class="card" style="margin-bottom: 1rem; cursor: pointer;" 
                         onclick="restaurantManager.showRestaurantModal('${rec.name.replace(/'/g, "\\'")}', '${rec.campus}')">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                            <h4 style="color: var(--hufs-gold); margin: 0;">${index + 1}. ${rec.name}</h4>
                            <span style="color: var(--hufs-silver); font-size: 0.9rem;">${campusName}</span>
                        </div>
                        <p style="color: var(--hufs-white); margin: 0.5rem 0;">${rec.reason || '추천 이유 없음'}</p>
                        ${rec.match_score ? `<div style="color: var(--hufs-gold); font-size: 0.9rem;">적합도: ${rec.match_score}/10</div>` : ''}
                    </div>
                `;
            });
            
            resultsDiv.innerHTML = html;
            resultsDiv.style.display = 'block';
        } else {
            resultsDiv.innerHTML = '<p style="color: var(--hufs-silver); text-align: center;">추천 결과를 찾을 수 없습니다.</p>';
            resultsDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('AI 추천 오류:', error);
        resultsDiv.innerHTML = `<p style="color: #ff6b6b; text-align: center;">오류가 발생했습니다: ${error.message}</p>`;
        resultsDiv.style.display = 'block';
    } finally {
        recommendBtn.disabled = false;
        recommendBtn.textContent = '✨ AI 추천 받기';
        loadingDiv.style.display = 'none';
    }
}

// Enter 키로 추천 받기
document.addEventListener('DOMContentLoaded', () => {
    // 나중에 추가될 입력 필드에 대한 이벤트 리스너
    setTimeout(() => {
        const promptInput = document.getElementById('ai-prompt-input');
        if (promptInput) {
            promptInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                    getAIRecommendation();
                }
            });
        }
    }, 1000);
});

