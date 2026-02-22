"use client";

import { useEffect, useRef } from "react";

interface TableauMapProps {
  vizId: string;
  tableauName: string;
  alt: string;
  staticImg: string;
}

const staticImgBase = (img: string) =>
  img.replace("_rss.png", ".png").replace("_rss", "");

export default function TableauMap({
  vizId,
  tableauName,
  alt,
  staticImg,
}: TableauMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const div = containerRef.current;
    if (!div || typeof window === "undefined") return;
    const obj = div.querySelector("object");
    if (!obj) return;

    const applyStyles = () => {
      const w = div.offsetWidth;
      (obj as HTMLObjectElement).style.display = "";
      if (w > 800 || w > 500) {
        (obj as HTMLObjectElement).style.minWidth = "420px";
        (obj as HTMLObjectElement).style.maxWidth = "650px";
        (obj as HTMLObjectElement).style.width = "100%";
        (obj as HTMLObjectElement).style.minHeight = "587px";
        (obj as HTMLObjectElement).style.maxHeight = "887px";
        (obj as HTMLObjectElement).style.height = div.offsetWidth * 0.75 + "px";
      } else {
        (obj as HTMLObjectElement).style.width = "100%";
        (obj as HTMLObjectElement).style.height = "947px";
      }
    };

    applyStyles();

    const scriptEl = document.createElement("script");
    scriptEl.src = "https://public.tableau.com/javascripts/api/viz_v1.js";
    scriptEl.async = true;
    obj.parentNode?.insertBefore(scriptEl, obj);

    const onResize = () => applyStyles();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [vizId]);

  return (
    <div
      id={vizId}
      ref={containerRef}
      className="tableau-placeholder"
      style={{ position: "relative" }}
    >
      <noscript>
        <a href="#">
          <img alt={alt} src={staticImg} style={{ border: "none" }} />
        </a>
      </noscript>
      <object
        className="tableauViz"
        style={{ display: "none" }}
        tabIndex={-1}
      >
        <param name="host_url" value="https%3A%2F%2Fpublic.tableau.com%2F" />
        <param name="embed_code_version" value="3" />
        <param name="site_root" value="" />
        <param name="name" value={tableauName.replace(/\//g, "&#47;")} />
        <param name="tabs" value="no" />
        <param name="toolbar" value="yes" />
        <param name="static_image" value={staticImgBase(staticImg)} />
        <param name="animate_transition" value="yes" />
        <param name="display_static_image" value="yes" />
        <param name="display_spinner" value="yes" />
        <param name="display_overlay" value="yes" />
        <param name="display_count" value="yes" />
        <param name="language" value="ko-KR" />
      </object>
    </div>
  );
}
