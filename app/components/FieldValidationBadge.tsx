import React from "react";

type Status = "correct" | "corrected" | "not_present";

type Props = {
  status: Status;
};

const styles: Record<Status, React.CSSProperties> = {
  correct: {
    background: "#d4f7d4",
    color: "#1b5e20",
  },
  corrected: {
    background: "#fff3bf",
    color: "#7a5b00",
  },
  not_present: {
    background: "#ffd6d6",
    color: "#7a1f1f",
  },
};

const labels: Record<Status, string> = {
  correct: "✓ correct",
  corrected: "⚠ overridden",
  not_present: "✕ missing",
};

export default function FieldValidationBadge({
  status,
}: Props) {
  return (
    <span
      style={{
        ...styles[status],
        fontSize: 11,
        padding: "2px 6px",
        borderRadius: 4,
        marginLeft: 8,
        display: "inline-block",
        fontFamily: "system-ui",
      }}
    >
      {labels[status]}
    </span>
  );
}