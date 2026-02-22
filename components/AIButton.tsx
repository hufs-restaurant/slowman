"use client";

import { useState } from "react";
import AIModal from "./AIModal";

export default function AIButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="btn btn-primary btn-small"
        onClick={() => setOpen(true)}
      >
        🤖 AI 식당 추천
      </button>
      {open && <AIModal onClose={() => setOpen(false)} />}
    </>
  );
}
