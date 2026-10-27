"use client";
import { useState } from "react";

// Tabler Icons (MIT): see /snippets/tabler-LICENSE.txt.

export const CopyPromptButton = ({
  label = "Copy setup prompt",
  targetId = "ai-setup-prompt",
  className,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const el = document.getElementById(targetId);
      const code = el?.querySelector("code");
      const text = code?.textContent || el?.textContent || "";
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy prompt:", err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-live="polite"
      className={
        className ||
        "inline-flex items-center gap-2 px-5 py-3 rounded-lg font-semibold text-base border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer my-2"
      }
    >
      {copied ? (
        <>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12l5 5l10 -10" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M7 9.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667l0 -8.666" />
            <path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
};
