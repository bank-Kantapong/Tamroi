/**
 * Formats a budget range into a readable Thai/English string.
 */
export function formatBudget(
  min: number | null,
  max: number | null,
  locale: "th" | "en" = "th"
): string {
  if (min !== null && max !== null) {
    if (min === max) return `฿${min.toLocaleString()}`;
    return `฿${min.toLocaleString()} – ฿${max.toLocaleString()}`;
  }
  if (min !== null) {
    return locale === "th" ? `เริ่มประมาณ ฿${min.toLocaleString()}` : `From ฿${min.toLocaleString()}`;
  }
  if (max !== null) {
    return locale === "th" ? `ไม่เกิน ฿${max.toLocaleString()}` : `Up to ฿${max.toLocaleString()}`;
  }
  return locale === "th" ? "งบยืดหยุ่นตามใจ" : "Flexible budget";
}

/**
 * Calculates sum of stop costs and estimated minutes for a list of stops.
 */
export function calculateItineraryMetrics(stops: Array<{ estimated_cost: number | null; estimated_minutes: number | null }>) {
  const totalCost = stops.reduce((sum, s) => sum + (s.estimated_cost ?? 0), 0);
  const totalMinutes = stops.reduce((sum, s) => sum + (s.estimated_minutes ?? 0), 0);
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  return {
    totalCost,
    totalMinutes,
    totalHours,
  };
}

/**
 * Fallback clipboard copy using textarea execCommand if navigator.clipboard is unavailable.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof window === "undefined") return false;

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback to execCommand below
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textarea);
    return successful;
  } catch {
    return false;
  }
}

