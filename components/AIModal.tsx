"use client";

import { useState } from "react";
import type { Restaurant, CampusKey } from "../lib/restaurant.types";
import RestaurantModal from "./RestaurantModal";

interface Rec {
  name: string;
  campus: "seoul" | "global";
  reason?: string;
  match_score?: number;
}

interface AIModalProps {
  onClose: () => void;
}

export default function AIModal({ onClose }: AIModalProps) {
  const [prompt, setPrompt] = useState("");
  const [campus, setCampus] = useState<"all" | "seoul" | "global">("all");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Rec[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalRestaurant, setModalRestaurant] = useState<{
    restaurant: Restaurant;
    campus: CampusKey;
  } | null>(null);

  const handleSubmit = async () => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      setError("먹고 싶은 음식이나 조건을 입력해주세요!");
      return;
    }
    setError(null);
    setResults(null);
    setLoading(true);
    try {
      const res = await fetch("/api/gemini/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed, campus }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || `오류 (${res.status})`);
      }
      setResults(data.recommendations ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleRecClick = (rec: Rec) => {
    setModalRestaurant({
      restaurant: { name: rec.name, category: "" },
      campus: rec.campus,
    });
  };

  return (
    <>
      <div
        className="modal-overlay show"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-modal-title"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="modal-content" style={{ maxWidth: "600px" }}>
          <div className="modal-header">
            <h2 id="ai-modal-title" className="modal-title">
              🤖 AI 식당 추천
            </h2>
            <button
              type="button"
              className="modal-close"
              onClick={onClose}
              aria-label="닫기"
            >
              &times;
            </button>
          </div>
          <div className="modal-body">
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                htmlFor="ai-prompt"
                style={{
                  display: "block",
                  color: "var(--hufs-gold)",
                  marginBottom: "0.5rem",
                  fontWeight: 600,
                }}
              >
                무엇을 먹고 싶으신가요?
              </label>
              <textarea
                id="ai-prompt"
                className="search-input"
                rows={3}
                placeholder="예: 매운 음식, 저렴한 한식, 데이트하기 좋은 곳, 치킨 등..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                style={{ width: "100%", resize: "vertical" }}
              />
            </div>
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                htmlFor="ai-campus"
                style={{
                  display: "block",
                  color: "var(--hufs-gold)",
                  marginBottom: "0.5rem",
                  fontWeight: 600,
                }}
              >
                캠퍼스 선택
              </label>
              <select
                id="ai-campus"
                className="search-input"
                value={campus}
                onChange={(e) =>
                  setCampus(e.target.value as "all" | "seoul" | "global")
                }
                style={{ width: "100%" }}
              >
                <option value="all">전체 캠퍼스</option>
                <option value="seoul">서울캠퍼스</option>
                <option value="global">글로벌캠퍼스</option>
              </select>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: "100%" }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "추천 중..." : "✨ AI 추천 받기"}
            </button>

            {error && (
              <p
                style={{
                  color: "#ff6b6b",
                  textAlign: "center",
                  marginTop: "1rem",
                }}
              >
                {error}
              </p>
            )}

            {results && results.length > 0 && (
              <div style={{ marginTop: "2rem" }}>
                <h3 style={{ color: "var(--hufs-gold)", marginBottom: "1rem" }}>
                  추천 맛집
                </h3>
                {results.map((rec, i) => (
                  <div
                    key={`${rec.name}-${i}`}
                    className="card"
                    style={{
                      marginBottom: "1rem",
                      cursor: "pointer",
                    }}
                    onClick={() => handleRecClick(rec)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleRecClick(rec)
                    }
                    role="button"
                    tabIndex={0}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <h4 style={{ color: "var(--hufs-gold)", margin: 0 }}>
                        {i + 1}. {rec.name}
                      </h4>
                      <span
                        style={{
                          color: "var(--hufs-silver)",
                          fontSize: "0.9rem",
                        }}
                      >
                        {rec.campus === "seoul" ? "서울캠퍼스" : "글로벌캠퍼스"}
                      </span>
                    </div>
                    <p style={{ color: "var(--hufs-white)", margin: "0.5rem 0" }}>
                      {rec.reason || "추천 이유 없음"}
                    </p>
                    {rec.match_score && (
                      <div
                        style={{
                          color: "var(--hufs-gold)",
                          fontSize: "0.9rem",
                        }}
                      >
                        적합도: {rec.match_score}/10
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {results && results.length === 0 && !loading && (
              <p
                style={{
                  color: "var(--hufs-silver)",
                  textAlign: "center",
                  marginTop: "2rem",
                }}
              >
                추천 결과를 찾을 수 없습니다.
              </p>
            )}
          </div>
        </div>
      </div>

      {modalRestaurant && (
        <RestaurantModal
          restaurant={modalRestaurant.restaurant}
          campus={modalRestaurant.campus}
          onClose={() => setModalRestaurant(null)}
        />
      )}
    </>
  );
}
