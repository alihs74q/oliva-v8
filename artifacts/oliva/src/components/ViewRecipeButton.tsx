import React from "react";

interface ViewRecipeButtonProps {
  isExpanded: boolean;
  onClick: () => void;
}

// Olive green from the Oliva logo
const OLIVE_GREEN = "#596B3D";

export const ViewRecipeButton: React.FC<ViewRecipeButtonProps> = ({
  isExpanded,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        padding: "11px 16px 11px 18px",
        minHeight: 46,
        borderRadius: 14,
        border: "1px solid rgba(89,107,61,0.38)",
        background: "linear-gradient(135deg, #596B3D, #718b4e)",
        color: "white",
        fontFamily: '"Manrope", "Avenir Next", sans-serif',
        fontSize: "13px",
        fontWeight: 800,
        letterSpacing: "0.02em",
        cursor: "pointer",
        boxShadow: "0 8px 18px rgba(89,107,61,0.2), inset 0 1px 0 rgba(255,255,255,0.2)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease",
      }}
      onMouseEnter={(e) => {
        const button = e.currentTarget as HTMLButtonElement;
        button.style.filter = "brightness(1.08)";
        button.style.transform = "translateY(-1px)";
        button.style.boxShadow = "0 10px 22px rgba(89,107,61,0.3), inset 0 1px 0 rgba(255,255,255,0.2)";
      }}
      onMouseLeave={(e) => {
        const button = e.currentTarget as HTMLButtonElement;
        button.style.filter = "brightness(1)";
        button.style.transform = "translateY(0)";
        button.style.boxShadow = "0 8px 18px rgba(89,107,61,0.2), inset 0 1px 0 rgba(255,255,255,0.2)";
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
        <span style={{ width: 25, height: 25, borderRadius: 8, display: "grid", placeItems: "center", background: "rgba(255,255,255,0.16)", fontSize: 14 }}>✦</span>
        <span>{isExpanded ? "Hide details" : "Ingredients & extras"}</span>
      </span>
      <span aria-hidden="true" style={{ fontSize: 18, lineHeight: 1, transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.25s ease" }}>⌄</span>
    </button>
  );
};
