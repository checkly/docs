"use client";
import { useState } from "react";

export const CopyPromptButton = ({
  filePath,
  label = "Copy setup prompt",
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const res = await fetch(filePath);
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy prompt:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm
        border border-gray-200 dark:border-gray-700
        bg-white dark:bg-gray-800
        text-gray-800 dark:text-gray-200
        hover:bg-gray-50 dark:hover:bg-gray-700
        transition-colors cursor-pointer my-2"
    >
      {copied ? (
        <>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M13.3 4.3L6 11.6L2.7 8.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M11 5V3.5C11 2.67 10.33 2 9.5 2H3.5C2.67 2 2 2.67 2 3.5V9.5C2 10.33 2.67 11 3.5 11H5" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          {label}
        </>
      )}
    </button>
  );
};
