import type { DietType, MealType, Nutrients, Unit } from "@/lib/nutrition/types";

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
