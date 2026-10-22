import { z } from "zod";

export const TRAVEL_MODES = ["driving", "walking", "transit", "bicycling", "other"] as const;
export const TRIP_STATUSES = ["draft", "pending_review", "published", "rejected"] as const;

export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const optionalNullableString = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((val) => {
    if (val === null || val === undefined) return null;
    const trimmed = val.trim();
    return trimmed.length > 0 ? trimmed : null;
  });

const optionalImageUrl = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((val) => {
    if (val === null || val === undefined) return null;
    const trimmed = val.trim();
    return trimmed.length > 0 ? trimmed : null;
  })
  .refine(
    (val) => {
      if (val === null) return true;
      const urls = val
        .split(/[\n,]/)
        .map((s) => s.trim().split("|")[0].trim())
        .filter(Boolean);
      if (urls.length === 0) return true;
      return urls.every((u) => {
        if (u.startsWith("/")) return true;
        try {
          const parsed = new URL(u);
          return parsed.protocol === "http:" || parsed.protocol === "https:";
        } catch {
          return false;
        }
      });
    },
    { message: "Image URL must be valid http(s) URL(s) or local path(s) starting with /" }
  );

const optionalNonNegativeInt = z
  .union([z.number(), z.string(), z.null(), z.undefined()])
  .transform((val, ctx) => {
    if (val === null || val === undefined || val === "") return null;
    const num = typeof val === "number" ? val : Number(val);
    if (!Number.isFinite(num) || !Number.isInteger(num) || num < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Must be a whole number greater than or equal to 0",
      });
      return z.NEVER;
    }
    return num;
  });

const optionalPositiveNumber = z
  .union([z.number(), z.string(), z.null(), z.undefined()])
  .transform((val, ctx) => {
    if (val === null || val === undefined || val === "") return null;
    const num = typeof val === "number" ? val : Number(val);
    if (!Number.isFinite(num) || num <= 0 || num > 720) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Duration hours must be a number between 0.5 and 720",
      });
      return z.NEVER;
    }
    return Math.round(num * 10) / 10;
  });

export const tripInputSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(140, "Title must be 140 characters or fewer"),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .min(3, "Slug must be at least 3 characters")
      .max(120, "Slug must be 120 characters or fewer")
      .regex(
        SLUG_REGEX,
        "Slug must contain only lowercase English letters, numbers, and single hyphens (e.g. chiang-mai-old-city)"
      ),
    short_description: z
      .string()
      .trim()
      .min(10, "Short description must be at least 10 characters")
      .max(280, "Short description must be 280 characters or fewer"),
    description: z
      .string()
      .trim()
      .min(20, "Full description must be at least 20 characters")
      .max(5000, "Full description must be 5000 characters or fewer"),
    cover_image_url: optionalImageUrl,
    province: z
      .string()
      .trim()
      .min(2, "Province is required")
      .max(80, "Province must be 80 characters or fewer"),
    category: z
      .string()
      .trim()
      .min(2, "Category is required")
      .max(80, "Category must be 80 characters or fewer"),
    duration_label: z
      .string()
      .trim()
      .min(2, "Duration label is required (e.g. '1 Day', 'Half Day', '2 Days 1 Night')")
      .max(80, "Duration label must be 80 characters or fewer"),
    duration_hours: optionalPositiveNumber,
    budget_min: optionalNonNegativeInt,
    budget_max: optionalNonNegativeInt,
    travel_mode: z
      .union([z.enum(TRAVEL_MODES), z.null(), z.undefined()])
      .optional()
      .default(null),
    travel_mode_note: optionalNullableString,
    status: z.enum(TRIP_STATUSES, {
      errorMap: () => ({ message: "Status must be draft or published" }),
    }),
    is_sample: z.boolean().optional().default(false),
    created_by: optionalNullableString,
    rejection_reason: optionalNullableString,
    submitted_at: optionalNullableString,
    reviewed_at: optionalNullableString,
    reviewed_by: optionalNullableString,
  })
  .refine(
    (data) => {
      if (data.budget_min !== null && data.budget_max !== null) {
        return data.budget_max >= data.budget_min;
      }
      return true;
    },
    {
      message: "Maximum budget must be greater than or equal to minimum budget",
      path: ["budget_max"],
    }
  );

export const stopInputSchema = z.object({
  place_name: z
    .string()
    .trim()
    .min(2, "Place name must be at least 2 characters")
    .max(140, "Place name must be 140 characters or fewer"),
  description: z
    .string()
    .trim()
    .min(5, "Stop description must be at least 5 characters")
    .max(2000, "Stop description must be 2000 characters or fewer"),
  latitude: z
    .union([z.number(), z.string()])
    .transform((val, ctx) => {
      const num = typeof val === "number" ? val : Number(String(val).trim());
      if (!Number.isFinite(num) || num < -90 || num > 90) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Latitude must be a valid number between -90 and 90",
        });
        return z.NEVER;
      }
      return Number(num.toFixed(6));
    }),
  longitude: z
    .union([z.number(), z.string()])
    .transform((val, ctx) => {
      const num = typeof val === "number" ? val : Number(String(val).trim());
      if (!Number.isFinite(num) || num < -180 || num > 180) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Longitude must be a valid number between -180 and 180",
        });
        return z.NEVER;
      }
      return Number(num.toFixed(6));
    }),
  sequence: z
    .union([z.number(), z.string(), z.undefined()])
    .transform((val, ctx) => {
      if (val === undefined || val === "") return undefined;
      const num = typeof val === "number" ? val : Number(val);
      if (!Number.isInteger(num) || num < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Sequence must be a positive integer starting from 1",
        });
        return z.NEVER;
      }
      return num;
    })
    .optional(),
  image_url: optionalImageUrl,
  estimated_minutes: optionalNonNegativeInt,
  suggested_arrival_time: optionalNullableString,
  estimated_cost: optionalNonNegativeInt,
  notes: optionalNullableString,
});

export const reorderStopsSchema = z.object({
  orderedStopIds: z
    .array(z.string().min(1))
    .min(1, "At least one stop ID is required"),
});

// Phase 2: User Authentication & Profile Schemas
export const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address")
    .max(255, "Email is too long"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be 128 characters or fewer"),
  display_name: z
    .string()
    .trim()
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name must be 50 characters or fewer"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const profileUpdateSchema = z.object({
  display_name: z
    .string()
    .trim()
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name must be 50 characters or fewer"),
  avatar_url: optionalImageUrl,
});

// Phase 2: Community Submission Schema
export const tripSubmissionSchema = z.preprocess(
  (val) => {
    if (typeof val === "object" && val !== null) {
      const raw = val as Record<string, unknown>;
      // If saving as draft, provide safe fallbacks so no validation error blocks the user
      if (raw.status === "draft") {
        const rawBudgetMin =
          raw.budget_min !== undefined && raw.budget_min !== null && raw.budget_min !== ""
            ? Number(raw.budget_min)
            : null;
        let rawBudgetMax =
          raw.budget_max !== undefined && raw.budget_max !== null && raw.budget_max !== ""
            ? Number(raw.budget_max)
            : null;
        if (
          rawBudgetMin !== null &&
          rawBudgetMax !== null &&
          !isNaN(rawBudgetMin) &&
          !isNaN(rawBudgetMax) &&
          rawBudgetMax < rawBudgetMin
        ) {
          rawBudgetMax = rawBudgetMin;
        }

        return {
          ...raw,
          title: (typeof raw.title === "string" && raw.title.trim()) || "แบบร่างทริปใหม่",
          short_description:
            (typeof raw.short_description === "string" && raw.short_description.trim()) ||
            "แบบร่างทริป (ยังไม่ได้ระบุคำอธิบายย่อ)",
          description:
            (typeof raw.description === "string" && raw.description.trim()) ||
            "แบบร่างทริปที่ยังเขียนไม่เสร็จ",
          province: (typeof raw.province === "string" && raw.province.trim()) || "ไม่ระบุ",
          category: (typeof raw.category === "string" && raw.category.trim()) || "ทั่วไป",
          travel_mode:
            typeof raw.travel_mode === "string" &&
            (TRAVEL_MODES as readonly string[]).includes(raw.travel_mode)
              ? raw.travel_mode
              : null,
          travel_mode_note:
            typeof raw.travel_mode_note === "string" ? raw.travel_mode_note.trim() : null,
          duration_label:
            (typeof raw.duration_label === "string" && raw.duration_label.trim()) || "1 Day",
          budget_min: rawBudgetMin && !isNaN(rawBudgetMin) ? rawBudgetMin : null,
          budget_max: rawBudgetMax && !isNaN(rawBudgetMax) ? rawBudgetMax : null,
          stops:
            Array.isArray(raw.stops) && raw.stops.length > 0
              ? (raw.stops as Array<Record<string, unknown>>).map((s, idx) => {
                  const rawName = typeof s.place_name === "string" ? s.place_name.trim() : "";
                  const placeName =
                    rawName.length >= 2
                      ? rawName
                      : rawName.length === 1
                      ? `${rawName}..`
                      : `จุดแวะที่ ${idx + 1}`;

                  const rawDesc = typeof s.description === "string" ? s.description.trim() : "";
                  const desc =
                    rawDesc.length >= 5
                      ? rawDesc
                      : rawDesc.length > 0
                      ? `${rawDesc}.....`
                      : "คำอธิบายจุดแวะแบบร่าง";

                  const rawLat = typeof s.latitude === "string" ? s.latitude.trim() : s.latitude;
                  const rawLng = typeof s.longitude === "string" ? s.longitude.trim() : s.longitude;
                  const latNum = rawLat !== "" && rawLat !== null && rawLat !== undefined ? Number(rawLat) : NaN;
                  const lngNum = rawLng !== "" && rawLng !== null && rawLng !== undefined ? Number(rawLng) : NaN;
                  const lat = Number.isFinite(latNum) && latNum >= -90 && latNum <= 90 ? latNum : 13.7563;
                  const lng = Number.isFinite(lngNum) && lngNum >= -180 && lngNum <= 180 ? lngNum : 100.5018;

                  return {
                    sequence: idx + 1,
                    place_name: placeName,
                    description: desc,
                    latitude: lat,
                    longitude: lng,
                    image_url: s.image_url || null,
                    estimated_minutes: s.estimated_minutes ? Number(s.estimated_minutes) : null,
                    suggested_arrival_time: s.suggested_arrival_time || null,
                    estimated_cost: s.estimated_cost ? Number(s.estimated_cost) : null,
                    notes: s.notes || null,
                  };
                })
              : [
                  {
                    sequence: 1,
                    place_name: "จุดแวะเริ่มต้น",
                    description: "จุดแวะแบบร่าง",
                    latitude: 13.7563,
                    longitude: 100.5018,
                  },
                ],
        };
      }
    }
    return val;
  },
  z
    .object({
      title: z
        .string()
        .trim()
        .min(1, "Title must not be empty")
        .max(140, "Title must be 140 characters or fewer"),
      slug: z
        .string()
        .trim()
        .toLowerCase()
        .min(3, "Slug must be at least 3 characters")
        .max(120, "Slug must be 120 characters or fewer")
        .regex(
          SLUG_REGEX,
          "Slug must contain only lowercase English letters, numbers, and single hyphens"
        )
        .optional(),
      short_description: z
        .string()
        .trim()
        .min(1, "Short description is required")
        .max(280, "Short description must be 280 characters or fewer"),
      description: z
        .string()
        .trim()
        .min(1, "Full description is required")
        .max(5000, "Full description must be 5000 characters or fewer"),
      cover_image_url: optionalImageUrl,
      province: z
        .string()
        .trim()
        .min(1, "Province is required")
        .max(80, "Province must be 80 characters or fewer"),
      category: z
        .string()
        .trim()
        .min(1, "Category is required")
        .max(80, "Category must be 80 characters or fewer"),
      duration_label: z
        .string()
        .trim()
        .min(1, "Duration label is required")
        .max(80, "Duration label must be 80 characters or fewer"),
      duration_hours: optionalPositiveNumber,
      budget_min: optionalNonNegativeInt,
      budget_max: optionalNonNegativeInt,
      travel_mode: z
        .union([z.enum(TRAVEL_MODES), z.null(), z.undefined()])
        .optional()
        .default(null),
      travel_mode_note: optionalNullableString,
      status: z.enum(["draft", "pending_review"]).optional().default("pending_review"),
      stops: z
        .array(stopInputSchema)
        .min(1, "At least 1 stop is required for an itinerary")
        .max(25, "An itinerary can have at most 25 stops"),
    })
    .refine(
      (data) => {
        if (data.status === "pending_review") {
          if (data.title.trim().length < 3) return false;
          if (data.short_description.trim().length < 10) return false;
          if (data.description.trim().length < 20) return false;
        }
        return true;
      },
      {
        message:
          "When submitting for review, Title must be ≥ 3 chars, Short Description ≥ 10 chars, and Full Description ≥ 20 chars",
        path: ["title"],
      }
    )
    .refine(
      (data) => {
        if (data.budget_min !== null && data.budget_max !== null) {
          return data.budget_max >= data.budget_min;
        }
        return true;
      },
      {
        message: "Maximum budget must be greater than or equal to minimum budget",
        path: ["budget_max"],
      }
    )
);

// Phase 2: Moderation Action Schema
export const moderationActionSchema = z
  .object({
    action: z.enum(["approve", "reject"]),
    rejection_reason: optionalNullableString,
  })
  .refine(
    (data) => {
      if (data.action === "reject") {
        return !!data.rejection_reason && data.rejection_reason.trim().length >= 3;
      }
      return true;
    },
    {
      message: "A rejection reason of at least 3 characters is required when rejecting a submission",
      path: ["rejection_reason"],
    }
  );


