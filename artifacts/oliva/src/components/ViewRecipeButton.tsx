import React from "react";
import { motion } from "framer-motion";

interface ViewRecipeButtonProps {
  isExpanded: boolean;
  onClick: () => void;
}

// Olive green from the Oliva logo
const OLIVE_GREEN = "#596B3D";

// Olive leaf SVG icon
const OliveLeafIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Simplified olive leaf */}
    <path d="M12 2c-5 0-8 3-8 6 0 4 2 8 4 12 2 3 4 2 4 2s2 1 4-2c2-4 4-8 4-12 0-3-3-6-8-6z" />
    <circle cx="12" cy="10" r="1.5" fill="currentColor" />
  </svg>
);

export const ViewRecipeButton: React.FC<ViewRecipeButtonProps> = ({
  isExpanded,
  onClick,
}) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ y: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 16px",
        borderRadius: 999,
        border: "none",
        backgroundColor: OLIVE_GREEN,
        color: "white",
        fontSize: "13px",
        fontWeight: 600,
        letterSpacing: "0.02em",
        cursor: "pointer",
        minHeight: 44,
        minWidth: 44,
        transition: "box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: isExpanded
          ? `0 4px 12px ${OLIVE_GREEN}40`
          : "0 2px 8px rgba(0, 0, 0, 0.1)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 6px 16px ${OLIVE_GREEN}50`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow = isExpanded
          ? `0 4px 12px ${OLIVE_GREEN}40`
          : "0 2px 8px rgba(0, 0, 0, 0.1)";
      }}
    >
      <OliveLeafIcon size={14} />
      <span>View Recipe</span>
    </motion.button>
  );
};
