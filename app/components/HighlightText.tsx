import React from "react";

type Props = {
  text: string;
  highlights: {
    value: string;
    status?: "correct" | "corrected" | "not_present";
  }[];
};

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function HighlightableText({
  text,
  highlights,
}: Props) {
  if (!text) return null;

  /**
   * Build a list of match ranges
   */
  const ranges: {
    start: number;
    end: number;
    value: string;
    status?: string;
  }[] = [];

  for (const h of highlights) {
    if (!h.value) continue;

    const pattern = new RegExp(
      escapeRegExp(h.value),
      "g"
    );

    let match;
    while ((match = pattern.exec(text)) !== null) {
      ranges.push({
        start: match.index,
        end: match.index + h.value.length,
        value: h.value,
        status: h.status,
      });
    }
  }

  /**
   * Sort and merge rendering
   */
  ranges.sort((a, b) => a.start - b.start);

  let cursor = 0;
  const output: React.ReactNode[] = [];

  for (let i = 0; i < ranges.length; i++) {
    const r = ranges[i];

    if (r.start > cursor) {
      output.push(
        <span key={`t-${i}`}>
          {text.slice(cursor, r.start)}
        </span>
      );
    }

    const bg =
      r.status === "correct"
        ? "#d4f7d4"
        : r.status === "corrected"
        ? "#fff3bf"
        : r.status === "not_present"
        ? "#ffd6d6"
        : "#ffe58f";

    output.push(
      <mark
        key={`h-${i}`}
        style={{
          background: bg,
          padding: "2px 4px",
          borderRadius: 4,
        }}
      >
        {text.slice(r.start, r.end)}
      </mark>
    );

    cursor = r.end;
  }

  if (cursor < text.length) {
    output.push(
      <span key="end">
        {text.slice(cursor)}
      </span>
    );
  }

  return (
    <div
      style={{
        whiteSpace: "pre-wrap",
        fontFamily: "monospace",
        lineHeight: 1.5,
      }}
    >
      {output}
    </div>
  );
}