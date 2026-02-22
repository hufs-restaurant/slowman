import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY가 설정되지 않았습니다. .env.local을 확인하세요." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { prompt, campus = "all" } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "prompt가 필요합니다." },
        { status: 400 }
      );
    }

    const filePath = path.join(process.cwd(), "data", "restaurants.json");
    const fileContent = await readFile(filePath, "utf-8");
    const restaurants = JSON.parse(fileContent);

    let restaurantList = "";
    if (campus === "all" || campus === "seoul") {
      restaurantList += "서울캠퍼스 맛집:\n";
      restaurants.seoul.restaurants.forEach(
        (r: { name: string; category?: string }) => {
          restaurantList += `- ${r.name} (${r.category || "카테고리 없음"})\n`;
        }
      );
    }
    if (campus === "all" || campus === "global") {
      restaurantList += "\n글로벌캠퍼스 맛집:\n";
      restaurants.global.restaurants.forEach(
        (r: { name: string; category?: string }) => {
          restaurantList += `- ${r.name} (${r.category || "카테고리 없음"})\n`;
        }
      );
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

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
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

    if (!response.ok) {
      const err = await response.json();
      return NextResponse.json(
        {
          error: `Gemini API 오류: ${response.status}`,
          detail: err?.error?.message || String(err),
        },
        { status: 502 }
      );
    }

    const data = await response.json();
    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: "AI 응답 형식이 올바르지 않습니다.", recommendations: [] },
      { status: 502 }
    );
  } catch (error) {
    console.error("Gemini recommend error:", error);
    return NextResponse.json(
      {
        error: "서버 오류",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
