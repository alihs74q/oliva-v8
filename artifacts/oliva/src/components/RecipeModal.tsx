import React, { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SubcategoryDrink, Subcategory } from "../data/subcategories";

interface RecipeModalProps {
  isOpen: boolean;
  drink: SubcategoryDrink | null;
  subcategory: Subcategory | null;
  onClose: () => void;
}

// Olive green from the Oliva logo
const OLIVE_GREEN = "#596B3D";
const CREAM_BG = "#F5F1E8";

// Define which drink types get which extras
const EXTRAS_MAP: Record<string, string[]> = {
  "coffee-frappe": ["extra-shot", "cream", "flavor", "ice-cream"],
  "iced-latte": ["extra-shot", "cream", "flavor", "ice-cream"],
  "milkshakes": ["cream", "flavor", "ice-cream"],
  "smoothies": ["flavor", "ice-cream"],
  "refreshers": ["flavor", "ice-cream"],
};

const EXTRA_ITEMS = {
  "extra-shot": { label: "Extra Shot", price: "+100,000 LBP" },
  "cream": { label: "Cream", price: "+50,000 LBP" },
  "flavor": { label: "Flavor", price: "+50,000 LBP" },
  "ice-cream": { label: "Ice Cream", price: "+50,000 LBP" },
};

// Watermark leaf for background
const WatermarkLeaf = () => (
  <svg
    style={{
      position: "absolute",
      top: -20,
      right: -20,
      width: 180,
      height: 180,
      opacity: 0.04,
      pointerEvents: "none",
    }}
    viewBox="0 0 200 200"
    fill={OLIVE_GREEN}
  >
    <path d="M100 20c-30 0-50 20-50 40 0 25 15 50 25 75 12 20 25 15 25 15s12 8 25-15c12-25 25-50 25-75 0-20-20-40-50-40z" />
    <circle cx="100" cy="70" r="10" />
  </svg>
);

export const RecipeModal: React.FC<RecipeModalProps> = ({
  isOpen,
  drink,
  subcategory,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Ingredients array
  const ingredients = drink?.recipe?.split(" · ") || [];

  // Get extras for this drink type
  const extras = subcategory ? EXTRAS_MAP[subcategory.id] || [] : [];

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";

      // Focus the modal
      setTimeout(() => {
        contentRef.current?.focus();
      }, 0);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
      if (isOpen && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === modalRef.current) {
        onClose();
      }
    },
    [onClose]
  );

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  // Desktop modal
  const desktopVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  };

  // Mobile bottom sheet
  const mobileVariants = {
    hidden: { y: "100%", opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.35 } },
    exit: { y: "100%", opacity: 0, transition: { duration: 0.25 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={modalRef}
          onClick={handleBackdropClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(2px)",
            zIndex: 1000,
            display: "flex",
            alignItems: isMobile ? "flex-end" : "center",
            justifyContent: "center",
          }}
        >
          <motion.div
            ref={contentRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="recipe-modal-title"
            tabIndex={-1}
            variants={isMobile ? mobileVariants : desktopVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              backgroundColor: CREAM_BG,
              borderRadius: isMobile ? "20px 20px 0 0" : 16,
              border: `2px solid ${OLIVE_GREEN}`,
              boxShadow: isMobile
                ? "0 -4px 24px rgba(0, 0, 0, 0.15)"
                : "0 12px 48px rgba(0, 0, 0, 0.2)",
              maxWidth: isMobile ? "100%" : 480,
              width: isMobile ? "100%" : "90%",
              maxHeight: isMobile ? "85vh" : "85vh",
              overflow: "auto",
              padding: isMobile ? "24px 20px 32px" : "32px",
            }}
          >
            <WatermarkLeaf />

            {/* Close button */}
            <motion.button
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              aria-label="Close recipe"
              style={{
                position: "absolute",
                top: isMobile ? 16 : 20,
                right: isMobile ? 16 : 20,
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "none",
                backgroundColor: "rgba(89, 107, 61, 0.1)",
                color: OLIVE_GREEN,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </motion.button>

            {/* Product Name */}
            <h2
              id="recipe-modal-title"
              style={{
                margin: "0 0 8px",
                fontSize: isMobile ? "24px" : "28px",
                fontWeight: 900,
                color: OLIVE_GREEN,
                letterSpacing: "-0.01em",
              }}
            >
              {drink?.name}
            </h2>

            {/* Description */}
            {drink?.description && (
              <p
                style={{
                  margin: "0 0 24px",
                  fontSize: "14px",
                  color: "rgba(0, 0, 0, 0.65)",
                  lineHeight: 1.5,
                }}
              >
                {drink.description}
              </p>
            )}

            {/* What's Inside Section */}
            {ingredients.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <h3
                  style={{
                    margin: "0 0 12px",
                    fontSize: "11px",
                    fontWeight: 800,
                    letterSpacing: "0.25em",
                    textTransform: "uppercase",
                    color: OLIVE_GREEN,
                    opacity: 0.75,
                  }}
                >
                  What's Inside
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {ingredients.map((ingredient, i) => (
                    <div
                      key={i}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "8px 12px",
                        backgroundColor: "white",
                        border: `1px solid ${OLIVE_GREEN}30`,
                        borderRadius: 999,
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "#333",
                      }}
                    >
                      <div
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: "50%",
                          backgroundColor: OLIVE_GREEN,
                          flexShrink: 0,
                        }}
                      />
                      {ingredient.trim()}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Make It Yours - Optional Extras */}
            {extras.length > 0 && (
              <div>
                <h3
                  style={{
                    margin: "0 0 4px",
                    fontSize: "11px",
                    fontWeight: 800,
                    letterSpacing: "0.25em",
                    textTransform: "uppercase",
                    color: OLIVE_GREEN,
                    opacity: 0.75,
                  }}
                >
                  Make It Yours
                </h3>
                <p
                  style={{
                    margin: "0 0 12px",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "rgba(0, 0, 0, 0.55)",
                    letterSpacing: "0.02em",
                    textTransform: "uppercase",
                  }}
                >
                  Optional
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {extras.map((extraId) => {
                    const extra =
                      EXTRA_ITEMS[extraId as keyof typeof EXTRA_ITEMS];
                    return (
                      <div
                        key={extraId}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 6,
                          padding: 12,
                          backgroundColor: "white",
                          border: `1.5px solid ${OLIVE_GREEN}50`,
                          borderRadius: 12,
                          cursor: "default",
                        }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            border: `2px solid ${OLIVE_GREEN}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: OLIVE_GREEN,
                            fontSize: "18px",
                            fontWeight: 600,
                          }}
                        >
                          +
                        </div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "#333",
                            textAlign: "center",
                          }}
                        >
                          {extra.label}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "11px",
                            fontWeight: 700,
                            color: "#D4A574",
                            letterSpacing: "0.02em",
                          }}
                        >
                          {extra.price}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
