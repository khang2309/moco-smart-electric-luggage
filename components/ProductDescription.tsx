"use client";

import DOMPurify from "isomorphic-dompurify";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface ProductDescriptionProps {
  description?: string;
  language?: "vi" | "en";
}

export default function ProductDescription({
  description,
  language = "vi",
}: ProductDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCollapsible, setIsCollapsible] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      // Limit to approximately 5-6 lines (around 160px)
      const threshold = 160;
      if (contentRef.current.scrollHeight > threshold + 10) {
        setIsCollapsible(true);
      } else {
        setIsCollapsible(false);
      }
    }
  }, [description]);

  const fallbackText =
    language === "vi"
      ? "Chưa có mô tả sản phẩm."
      : "No product description available.";

  if (!description || description.trim() === "") {
    return <p className="text-gray-500 italic font-semibold">{fallbackText}</p>;
  }

  // Sanitize the HTML string to prevent XSS
  const cleanHtml = DOMPurify.sanitize(description, {
    ALLOWED_TAGS: [
      "b", "i", "em", "strong", "a", "p", "ul", "ol", "li", "br",
      "h1", "h2", "h3", "h4", "h5", "h6", "img", "span", "div", "u",
      "table", "tbody", "tr", "td", "th", "thead",
    ],
    ALLOWED_ATTR: ["href", "target", "src", "alt", "width", "height", "style", "class"],
  });

  return (
    <div className="product-desc-container">
      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? "auto" : isCollapsible ? 160 : "auto",
        }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="product-desc-content"
      >
        <div
          ref={contentRef}
          className="prose-description"
          dangerouslySetInnerHTML={{ __html: cleanHtml }}
        />

        {/* Gradient overlay when collapsed */}
        {!isExpanded && isCollapsible && (
          <div className="product-desc-gradient" aria-hidden="true" />
        )}
      </motion.div>

      {isCollapsible && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="product-desc-toggle"
          aria-expanded={isExpanded}
          aria-label={
            isExpanded
              ? language === "vi"
                ? "Thu gọn mô tả"
                : "Collapse description"
              : language === "vi"
              ? "Xem thêm mô tả"
              : "Read more description"
          }
        >
          {isExpanded
            ? language === "vi"
              ? "Thu gọn"
              : "Collapse"
            : language === "vi"
            ? "Xem thêm"
            : "Read more"}
          <svg
            className={`w-4 h-4 transition-transform duration-300 ${
              isExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
