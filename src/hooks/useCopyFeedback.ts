"use client";

import { useState, useCallback } from "react";
import { copyTextToClipboard } from "@/lib/format-utils";

interface UseCopyFeedbackOptions {
  resetDelayMs?: number;
}

export function useCopyFeedback({ resetDelayMs = 2500 }: UseCopyFeedbackOptions = {}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copyErrorId, setCopyErrorId] = useState<string | null>(null);

  const copy = useCallback(
    async (id: string, text: string) => {
      setCopyErrorId(null);
      const success = await copyTextToClipboard(text);

      if (success) {
        setCopiedId(id);
        setTimeout(() => {
          setCopiedId((curr) => (curr === id ? null : curr));
        }, resetDelayMs);
      } else {
        setCopyErrorId(id);
        setTimeout(() => {
          setCopyErrorId((curr) => (curr === id ? null : curr));
        }, resetDelayMs + 1500);
      }

      return success;
    },
    [resetDelayMs]
  );

  return {
    copiedId,
    copyErrorId,
    copy,
    isCopied: (id: string) => copiedId === id,
    hasError: (id: string) => copyErrorId === id,
  };
}

