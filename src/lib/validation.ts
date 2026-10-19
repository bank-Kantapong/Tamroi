import { z } from "zod";

export const TRAVEL_MODES = ["driving", "walking", "transit", "bicycling"] as const;
export const TRIP_STATUSES = ["draft", "published"] as const;

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
      if (val.startsWith("/")) return true;
      try {
        const parsed = new URL(val);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "Image URL must be a valid http(s) URL or local path starting with /" }
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
    travel_mode: z.enum(TRAVEL_MODES, {
      errorMap: () => ({ message: "Invalid travel mode" }),
    }),
    status: z.enum(TRIP_STATUSES, {
      errorMap: () => ({ message: "Status must be draft or published" }),
    }),
    is_sample: z.boolean().optional().default(false),
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

