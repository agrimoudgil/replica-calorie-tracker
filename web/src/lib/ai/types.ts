import type { DietType, MealType, Nutrients, Unit } from "@/lib/nutrition/types";
import type { Box } from "@/lib/photo-boxes";

export type EstimateContext = {
  mealType: MealType;
  dietType: DietType | null;
};

export type EstimatedItem = {
  foodId: string | null;
  name: string;
  nameHi?: string;
  quantity: number;
  unit: Unit;
  grams: number;
  /** For the whole portion. */
  nutrients: Nutrients;
  confidence: "high" | "medium" | "low";
  /** Where it is in the photo, when the estimator could tell. */
  box: Box | null;
};

export type EstimateResult = {
  isFood: boolean;
  items: EstimatedItem[];
  model: string;
  /** True when no AI ran (development estimator); the UI says so. */
  demo: boolean;
  usage: { inputTokens: number; outputTokens: number };
};

export type MealPhoto = { bytes: Uint8Array; mediaType: "image/jpeg" | "image/png" | "image/webp" };

export interface MealEstimator {
  fromPhoto(photo: MealPhoto, ctx: EstimateContext): Promise<EstimateResult>;
}

/** One food the AI read from a typed or spoken meal. It names the food and portion; it never gives nutrients. */
export type ReadItem = {
  /** What the person called it ("palak paneer"). */
  name: string;
  /** A plain English name to look up in a food database ("spinach and cottage cheese curry"). */
  searchName: string;
  quantity: number;
  unit: Unit;
  /** The AI's estimate of the portion's weight, used only when the food has no weight for the unit. */
  grams: number;
  confidence: "high" | "medium" | "low";
};

export type ReadResult = {
  items: ReadItem[];
  /** One short question when an amount or dish was too unclear to guess, else null. */
  question: string | null;
  model: string;
  /** True when no AI ran (development reader); the UI says so. */
  demo: boolean;
  usage: { inputTokens: number; outputTokens: number };
};

export interface MealReader {
  fromText(text: string, ctx: EstimateContext): Promise<ReadResult>;
}

export class EstimateError extends Error {
  constructor(
    public readonly code: "refused" | "unreadable" | "unavailable",
    message: string,
  ) {
    super(message);
    this.name = "EstimateError";
  }

  /** Matches by name too: the estimator is cached across dev hot reloads. */
  static is(err: unknown): err is EstimateError {
    return err instanceof EstimateError || (err instanceof Error && err.name === "EstimateError" && "code" in err);
  }
}
