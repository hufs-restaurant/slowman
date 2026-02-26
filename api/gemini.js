// api/gemini.js
export default async function handler(req, res) {
  // CORS 설정: 깃허브 페이지(프론트엔드)에서 Vercel(백엔드)로 요청을 보낼 수 있게 허용
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // POST 요청이 아니면 차단
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1. 프론트엔드(랜덤메뉴.html)에서 보낸 식당 이름(menu) 받기
  const { menu } = req.body;
  
  // 2. Vercel 환경변수 금고에서 API 키 꺼내기 (코드에 직접 노출 안 됨!)
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API Key is missing' });
  }

  // 3. 제미나이에게 보낼 질문 생성
  const promptText = `한국외대 글로벌캠퍼스 근처에 있는 식당 '${menu}'에 대해 구글 지도를 기반으로 검색하고 다음 정보를 알려줘:\n1. 주요메뉴\n2. 각 주요메뉴 별 가격대\n3. 가성비메뉴 추천\n4. 위치 (구글지도 기반 주소)\n마크다운 굵은 글씨(**)를 사용해서 보기 좋게 정리해서 출력해줘.`;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    // 4. 제미나이 서버로 요청
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      })
    });

    const data = await response.json();
    
    // 5. 프론트엔드로 제미나이 답변만 쏙 전달
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch Gemini API' });
  }
}
