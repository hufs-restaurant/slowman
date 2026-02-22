/**
 * 정적 HTML + AI API 통합 서버
 * - 정적 파일: 프로젝트 루트
 * - POST /api/gemini/recommend: Gemini AI 추천
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
const PORT = process.env.PORT || 3000;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
};

async function handleGeminiRecommend(body) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { status: 500, data: { error: "GEMINI_API_KEY가 .env.local에 없습니다." } };
  }

  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    return { status: 400, data: { error: "JSON 형식이 올바르지 않습니다." } };
  }

  const { prompt, campus = "all" } = parsed;
  if (!prompt || typeof prompt !== "string") {
    return { status: 400, data: { error: "prompt가 필요합니다." } };
  }

  const dataPath = path.join(__dirname, "data", "restaurants.json");
  const restaurants = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

  let restaurantList = "";
  if (campus === "all" || campus === "seoul") {
    restaurantList += "서울캠퍼스 맛집:\n";
    restaurants.seoul.restaurants.forEach((r) => {
      restaurantList += `- ${r.name} (${r.category || "카테고리 없음"})\n`;
    });
  }
  if (campus === "all" || campus === "global") {
    restaurantList += "\n글로벌캠퍼스 맛집:\n";
    restaurants.global.restaurants.forEach((r) => {
      restaurantList += `- ${r.name} (${r.category || "카테고리 없음"})\n`;
    });
  }

  const fullPrompt = `사용자가 "${prompt}"를 먹고 싶어합니다.

다음은 한국외대 맛집 목록입니다:
${restaurantList}

사용자의 요구사항에 가장 적합한 맛집 3개를 추천해주세요. 각 맛집에 대해:
1. 맛집 이름 (반드시 위 목록에 있는 정확한 이름 사용)
2. 추천 이유 (왜 이 맛집이 적합한지)
3. 캠퍼스 (서울캠퍼스 또는 글로벌캠퍼스)

다음 JSON 형식으로만 응답해주세요 (다른 텍스트 없이):
{
  "recommendations": [
    {
      "name": "맛집 이름",
      "campus": "seoul 또는 global",
      "reason": "추천 이유",
      "match_score": 1-10
    }
  ]
}`;

  try {
    const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { status: 502, data: { error: "Gemini API 오류", detail: data?.error?.message || data } };
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return { status: 200, data: JSON.parse(jsonMatch[0]) };
    }
    return { status: 502, data: { error: "AI 응답 형식 오류", recommendations: [] } };
  } catch (err) {
    return { status: 500, data: { error: err.message } };
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/api/gemini/recommend") {
    let body = "";
    for await (const chunk of req) body += chunk;
    const { status, data } = await handleGeminiRecommend(body);
    res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(data));
    return;
  }

  if (req.method !== "GET") {
    res.writeHead(405);
    res.end();
    return;
  }

  let filePath = path.join(__dirname, req.url === "/" ? "맛집외대통합3탄.html" : req.url);
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end();
    return;
  }

  try {
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }
  } catch {
    res.writeHead(404);
    res.end("Not Found");
    return;
  }

  const ext = path.extname(filePath);
  const mime = MIME[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not Found");
      return;
    }
    res.writeHead(200, { "Content-Type": mime });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`서버: http://localhost:${PORT}`);
  console.log(`  - 메인: http://localhost:${PORT}/맛집외대통합3탄.html`);
  console.log(`  - 랜덤: http://localhost:${PORT}/랜덤메뉴.html`);
  if (!process.env.GEMINI_API_KEY) {
    console.warn("  ⚠ GEMINI_API_KEY가 없습니다. .env.local에 추가하세요.");
  }
});
