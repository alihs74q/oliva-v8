import React from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface ViewRecipeButtonProps {
  isExpanded: boolean;
  onClick: () => void;
  themeColor?: string;
}

export const ViewRecipeButton: React.FC<ViewRecipeButtonProps> = ({
  isExpanded,
  onClick,
  themeColor = "#4a6741",
}) => {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium transition-colors min-h-11 min-w-11"
      style={{
        color: themeColor,
        borderColor: themeColor,
        borderWidth: "1px",
        backgroundColor: isExpanded ? `${themeColor}08` : "transparent",
      }}
    >
      <span>View Recipe</span>
      <motion.div
        animate={{ rotate: isExpanded ? 180 : 0 }}
        transition={{ duration: 0.25 }}
      >
        <ChevronDown size={16} />
      </motion.div>
    </button>
  );
};
