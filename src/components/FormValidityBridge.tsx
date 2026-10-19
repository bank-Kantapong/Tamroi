"use client";

import { useEffect } from "react";

/**
 * Implements the `required-field-feedback` Modern Web Guidance pattern:
 * - Syncs `aria-invalid` with native validity and `:user-invalid` on blur, input, and submit.
 * - Provides a WeakMap fallback (`.user-invalid-fallback`) for browsers without `:user-invalid`.
 */
export function useFormValidityBridge(formRef: React.RefObject<HTMLFormElement | null>) {
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const supportsUserInvalid =
      typeof CSS !== "undefined" &&
      typeof CSS.supports === "function" &&
      CSS.supports("selector(:user-invalid)");

    const dirtyState = new WeakMap<
      Element,
      { hasInteracted: boolean; hasBlurred: boolean }
    >();

    const syncElementState = (el: EventTarget | null, forceShowFallback = false) => {
      if (
        !(
          el instanceof HTMLInputElement ||
          el instanceof HTMLTextAreaElement ||
          el instanceof HTMLSelectElement
        )
      ) {
        return;
      }

      const isValid = el.checkValidity();
      if (!isValid) {
        el.setAttribute("aria-invalid", "true");
      } else {
        el.removeAttribute("aria-invalid");
      }

      if (!supportsUserInvalid && forceShowFallback) {
        el.classList.toggle("user-invalid-fallback", !isValid);
      }
    };

    const handleBlur = (e: Event) => {
      const target = e.target;
      if (
        !(
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          target instanceof HTMLSelectElement
        )
      ) {
        return;
      }
      const state = dirtyState.get(target) || {
        hasInteracted: false,
        hasBlurred: false,
      };
      state.hasBlurred = true;
      dirtyState.set(target, state);

      if (supportsUserInvalid) {
        try {
          if (target.matches(":user-invalid")) {
            target.setAttribute("aria-invalid", "true");
          } else {
            target.removeAttribute("aria-invalid");
          }
        } catch {
          syncElementState(target, state.hasInteracted);
        }
      } else if (state.hasInteracted) {
        syncElementState(target, true);
      }
    };

    const handleInput = (e: Event) => {
      const target = e.target;
      if (
        !(
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          target instanceof HTMLSelectElement
        )
      ) {
        return;
      }
      const state = dirtyState.get(target) || {
        hasInteracted: false,
        hasBlurred: false,
      };
      state.hasInteracted = true;
      dirtyState.set(target, state);

      if (target.checkValidity()) {
        target.removeAttribute("aria-invalid");
        target.classList.remove("user-invalid-fallback");
      } else if (state.hasBlurred) {
        syncElementState(target, true);
      }
    };

    const handleSubmit = () => {
      const fields = form.querySelectorAll("input, textarea, select");
      fields.forEach((field) => syncElementState(field, true));
    };

    form.addEventListener("blur", handleBlur, true);
    form.addEventListener("input", handleInput);
    form.addEventListener("submit", handleSubmit);

    return () => {
      form.removeEventListener("blur", handleBlur, true);
      form.removeEventListener("input", handleInput);
      form.removeEventListener("submit", handleSubmit);
    };
  }, [formRef]);
}

