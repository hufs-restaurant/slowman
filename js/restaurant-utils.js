// 맛집 정보 및 검색 기능 유틸리티
class RestaurantManager {
    constructor() {
        this.restaurants = null;
        this.currentCampus = 'seoul';
    }

    // JSON 데이터 로드
    async loadRestaurants() {
        try {
            const response = await fetch('data/restaurants.json');
            this.restaurants = await response.json();
            return this.restaurants;
        } catch (error) {
            console.error('맛집 데이터 로드 실패:', error);
            return null;
        }
    }

    // 네이버지도 검색 URL 생성
    getNaverMapUrl(restaurantName, campus = 'seoul') {
        const location = campus === 'seoul' ? '이문동' : '용인시 처인구 모현읍';
        const query = encodeURIComponent(`${location} ${restaurantName}`);
        return `https://map.naver.com/v5/search/${query}`;
    }

    // 카카오맵 검색 URL 생성
    getKakaoMapUrl(restaurantName, campus = 'seoul') {
        const location = campus === 'seoul' ? '이문동' : '용인시 처인구 모현읍';
        const query = encodeURIComponent(`${location} ${restaurantName}`);
        return `https://map.kakao.com/link/search/${query}`;
    }

    // 맛집 정보 가져오기
    getRestaurantInfo(name, campus = 'seoul') {
        if (!this.restaurants || !this.restaurants[campus]) {
            return null;
        }
        
        const campusData = this.restaurants[campus];
        return campusData.restaurants.find(r => r.name === name || r.name.includes(name));
    }

    // 검색 기능 (단일 캠퍼스)
    searchRestaurants(query, campus = 'seoul') {
        if (!this.restaurants || !this.restaurants[campus]) {
            return [];
        }

        const searchQuery = query.toLowerCase().trim();
        if (!searchQuery) {
            return [];
        }

        const campusData = this.restaurants[campus];
        return campusData.restaurants.filter(restaurant => {
            const name = restaurant.name.toLowerCase();
            const category = (restaurant.category || '').toLowerCase();
            return name.includes(searchQuery) || category.includes(searchQuery);
        }).map(restaurant => ({
            ...restaurant,
            campus: campus
        }));
    }

    // 검색 기능 (모든 캠퍼스)
    searchAllRestaurants(query) {
        if (!this.restaurants) {
            return [];
        }

        const searchQuery = query.toLowerCase().trim();
        if (!searchQuery) {
            return [];
        }

        const allResults = [];
        
        // 서울캠퍼스 검색
        if (this.restaurants.seoul) {
            const seoulResults = this.searchRestaurants(query, 'seoul');
            allResults.push(...seoulResults);
        }
        
        // 글로벌캠퍼스 검색
        if (this.restaurants.global) {
            const globalResults = this.searchRestaurants(query, 'global');
            allResults.push(...globalResults);
        }
        
        return allResults;
    }

    // 팝업 모달 표시
    showRestaurantModal(restaurantName, campus = 'seoul') {
        const restaurant = this.getRestaurantInfo(restaurantName, campus);
        
        if (!restaurant) {
            // 정보가 없어도 기본 정보로 모달 표시
            this.createModal({
                name: restaurantName,
                category: '정보 없음',
                campus: campus === 'seoul' ? '서울캠퍼스' : '글로벌캠퍼스'
            }, campus);
        } else {
            this.createModal(restaurant, campus);
        }
    }

    // 모달 생성
    createModal(restaurant, campus) {
        // 기존 모달 제거
        const existingModal = document.getElementById('restaurant-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // 모달 HTML 생성
        const modalHTML = `
            <div id="restaurant-modal" class="modal-overlay show">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 class="modal-title">${restaurant.name}</h2>
                        <button class="modal-close" onclick="this.closest('.modal-overlay').classList.remove('show')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="restaurant-info">
                            <div class="restaurant-info-item">
                                <span class="restaurant-info-label">카테고리:</span>
                                <span class="restaurant-info-value">${restaurant.category || '정보 없음'}</span>
                            </div>
                            <div class="restaurant-info-item">
                                <span class="restaurant-info-label">캠퍼스:</span>
                                <span class="restaurant-info-value">${campus === 'seoul' ? '서울캠퍼스' : '글로벌캠퍼스'}</span>
                            </div>
                        </div>
                        <div class="modal-actions">
                            <a href="${this.getNaverMapUrl(restaurant.name, campus)}" 
                               target="_blank" 
                               class="btn btn-primary">
                                🗺️ 네이버지도에서 보기
                            </a>
                            <a href="${this.getKakaoMapUrl(restaurant.name, campus)}" 
                               target="_blank" 
                               class="btn btn-gold">
                                📍 카카오맵에서 보기
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 모달 추가
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // 배경 클릭 시 닫기
        const modal = document.getElementById('restaurant-modal');
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });

        // ESC 키로 닫기
        const closeModal = (e) => {
            if (e.key === 'Escape') {
                modal.classList.remove('show');
                document.removeEventListener('keydown', closeModal);
            }
        };
        document.addEventListener('keydown', closeModal);
    }
}

// 전역 인스턴스
const restaurantManager = new RestaurantManager();

// 페이지 로드 시 데이터 로드
document.addEventListener('DOMContentLoaded', async () => {
    await restaurantManager.loadRestaurants();
    
    // 맛집 이름 클릭 이벤트 추가
    setupRestaurantNameClicks();
    
    // 검색 기능 초기화
    setupSearchFunctionality();
});

// 맛집 이름에 클릭 이벤트 추가
function setupRestaurantNameClicks() {
    // 랜덤 메뉴 결과에 클릭 이벤트 추가
    const resultElements = document.querySelectorAll('.menu-result');
    resultElements.forEach(element => {
        element.style.cursor = 'pointer';
        element.addEventListener('click', function() {
            const restaurantName = this.textContent.trim();
            if (restaurantName && !this.classList.contains('empty')) {
                const campus = this.id === 'menu-result1' ? 'seoul' : 'global';
                restaurantManager.showRestaurantModal(restaurantName, campus);
            }
        });
    });
}

// 검색 기능 설정
function setupSearchFunctionality() {
    const searchInput = document.getElementById('restaurant-search');
    const searchResults = document.getElementById('search-results');
    const noResults = document.getElementById('no-results');
    
    if (!searchInput) return;

    let searchTimeout;
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        
        searchTimeout = setTimeout(() => {
            if (query.length === 0) {
                searchResults.classList.remove('show');
                if (noResults) noResults.classList.remove('show');
                return;
            }

            // 모든 캠퍼스에서 검색
            const results = restaurantManager.searchAllRestaurants(query);
            
            if (results.length === 0) {
                searchResults.classList.remove('show');
                if (noResults) noResults.classList.add('show');
            } else {
                if (noResults) noResults.classList.remove('show');
                displaySearchResults(results);
                searchResults.classList.add('show');
            }
        }, 300);
    });
}

// 검색 결과 표시
function displaySearchResults(results, campus) {
    const searchResults = document.getElementById('search-results');
    if (!searchResults) return;

    searchResults.innerHTML = results.map(restaurant => `
        <div class="search-result-item" onclick="restaurantManager.showRestaurantModal('${restaurant.name}', '${campus}')">
            <div class="search-result-name">${restaurant.name}</div>
            <div class="search-result-category">${restaurant.category || '카테고리 없음'}</div>
        </div>
    `).join('');
}

// 현재 캠퍼스 감지
function detectCurrentCampus() {
    const path = window.location.pathname;
    if (path.includes('서울') || path.includes('seoul') || path.includes('서울캠')) {
        return 'seoul';
    } else if (path.includes('글로벌') || path.includes('global') || path.includes('글로벌캠')) {
        return 'global';
    }
    return 'seoul'; // 기본값
}

// 이미지 lazy loading
function setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// 페이지 로드 시 lazy loading 설정
if ('IntersectionObserver' in window) {
    document.addEventListener('DOMContentLoaded', setupLazyLoading);
}

