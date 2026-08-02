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
        gap: 6,
        padding: "6px 14px",
        borderRadius: 20,
        border: "none",
        backgroundColor: OLIVE_GREEN,
        color: "white",
        fontSize: "12px",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.opacity = "0.9";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.opacity = "1";
      }}
    >
      View Recipe
    </button>
  );
};
