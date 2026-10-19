import React from "react";

export type SvgProps = React.SVGProps<SVGSVGElement>;

/**
 * Top-right Paper Plane with looping dashed flight trail
 */
export function PaperPlaneDoodle(props: SvgProps) {
  return (
    <svg
      viewBox="0 0 180 95"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M6 74 C 42 74, 65 44, 52 28 C 40 14, 22 30, 34 45 C 48 62, 96 56, 134 24"
        stroke="var(--color-brand-cyan)"
        strokeWidth="2"
        strokeDasharray="5 5"
        strokeLinecap="round"
      />
      <path
        d="M138 14 L168 6 L153 34 L146 23 L138 14 Z"
        fill="var(--color-bg-card-photo)"
        stroke="var(--color-brand-teal-light)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M168 6 L146 23 L146 32 L151 26"
        stroke="var(--color-brand-teal-light)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Hand-drawn curved underline for highlights & headers
 */
export function CurvedUnderline({
  strokeColor = "var(--color-sun-yellow-light)",
  strokeWidth = 3,
  ...props
}: SvgProps & { strokeColor?: string; strokeWidth?: number }) {
  return (
    <svg
      viewBox="0 0 240 14"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M 4 10 Q 120 2 236 9"
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Short yellow doodle curve for scrapbook card
 */
export function ScrapbookCurveShort(props: SvgProps) {
  return (
    <svg
      viewBox="0 0 100 12"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M6 8 Q 50 3 94 7"
        stroke="var(--color-sun-yellow-bright)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Medium cyan doodle curve for province label
 */
export function ScrapbookCurveCyan(props: SvgProps) {
  return (
    <svg
      viewBox="0 0 90 12"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M4 8 Q 45 2 86 6"
        stroke="var(--color-brand-cyan)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Bold yellow doodle underline on photo frame
 */
export function ScrapbookPhotoUnderline(props: SvgProps) {
  return (
    <svg
      viewBox="0 0 180 14"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M4 10 Q 90 2 174 7"
        stroke="var(--color-sun-yellow-bright)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Curved arrow pointing left-down with arrowhead on photo frame
 */
export function CurvedArrowPhoto(props: SvgProps) {
  return (
    <svg
      viewBox="0 0 54 34"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M42 4 C 46 18, 28 28, 8 28"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M15 23 L7 28 L14 32"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Dashed teal connecting arrow between stop cards
 */
export function DashedArrowRight(props: SvgProps) {
  return (
    <svg
      viewBox="0 0 36 16"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M2 8 H28"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="3 3"
        strokeLinecap="round"
      />
      <path
        d="M24 3 L31 8 L24 13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Cute tilted camera illustration doodle
 */
export function CuteCameraDoodle(props: SvgProps) {
  return (
    <svg
      viewBox="0 0 64 52"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <rect
        x="8"
        y="14"
        width="46"
        height="32"
        rx="7"
        fill="var(--color-bg-card-photo)"
        stroke="var(--color-brand-teal-light)"
        strokeWidth="2.4"
      />
      <path
        d="M20 14 L24 8 H36 L40 14"
        fill="var(--color-sun-yellow-bright)"
        stroke="var(--color-brand-teal-light)"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <circle
        cx="31"
        cy="30"
        r="9"
        fill="#ffffff"
        stroke="var(--color-brand-teal-light)"
        strokeWidth="2.4"
      />
      <circle cx="31" cy="30" r="4" fill="var(--color-brand-cyan)" />
      <circle cx="45" cy="22" r="2" fill="var(--color-brand-teal-light)" />
    </svg>
  );
}

/**
 * Cute rising sun with sea waves doodle
 */
export function RisingSunDoodle(props: SvgProps) {
  return (
    <svg
      viewBox="0 0 28 24"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M8 14 A 6 6 0 0 1 20 14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M14 4 V6 M6 7 L7.5 8.5 M22 7 L20.5 8.5 M3 14 H25"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M4 18 Q 9 16 14 18 T 24 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Temple/Landmark stop illustration
 */
export function TempleStopIllustration(props: SvgProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" {...props}>
      <path d="M24 6 L8 20 H40 Z" fill="var(--color-sun-yellow)" />
      <rect x="12" y="20" width="24" height="20" fill="white" fillOpacity="0.3" rx="2" />
      <path d="M20 40 V28 H28 V40" stroke="white" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="24" cy="14" r="2" fill="var(--color-coral-accent)" />
    </svg>
  );
}

/**
 * Food/Noodle bowl stop illustration
 */
export function FoodStopIllustration(props: SvgProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" {...props}>
      <path d="M10 22 C 10 34, 38 34, 38 22 Z" fill="white" fillOpacity="0.4" />
      <ellipse cx="24" cy="22" rx="14" ry="4" fill="var(--color-sun-yellow)" />
      <path d="M18 10 L22 20 M26 10 L26 20 M30 10 L28 20" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <rect x="18" y="34" width="12" height="4" rx="2" fill="white" fillOpacity="0.4" />
    </svg>
  );
}

/**
 * Cafe/Coffee cup stop illustration
 */
export function CafeStopIllustration(props: SvgProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" {...props}>
      <rect x="12" y="18" width="18" height="18" rx="4" fill="white" fillOpacity="0.4" />
      <path d="M30 22 C 36 22, 36 30, 30 30" stroke="white" strokeWidth="2.5" />
      <path d="M16 14 Q 18 10 20 14 M22 14 Q 24 10 26 14" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <rect x="10" y="38" width="22" height="3" rx="1.5" fill="white" fillOpacity="0.4" />
    </svg>
  );
}

/**
 * Sunset/Viewpoint stop illustration
 */
export function SunsetStopIllustration(props: SvgProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" {...props}>
      <circle cx="24" cy="22" r="10" fill="var(--color-sun-yellow)" />
      <path d="M8 32 C 16 28, 28 36, 40 30" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="6" y1="38" x2="42" y2="38" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
