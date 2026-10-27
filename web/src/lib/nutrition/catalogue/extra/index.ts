import type { DishRow } from "../rows";
import { BAKERY_ROWS } from "./bakery";
import { BASE_PREP_ONLY, BASE_ROWS } from "./bases";
import { BREAD_RICE_ROWS } from "./breads-rice";
import { BREAKFAST_ROWS } from "./breakfast";
import { DAL_ROWS } from "./dals";
import { DESSERT_ROWS } from "./desserts";
import { DRINK_ROWS } from "./drinks";
import { INFANT_ROWS } from "./infant";
import { NON_VEG_ROWS } from "./non-veg";
import { CHUTNEY_ROWS, PRESERVE_ROWS } from "./preserves";
import { SALAD_ROWS } from "./salads";
import { SANDWICH_ROWS } from "./sandwiches";
import { SNACK_ROWS } from "./snacks";
import { SOUP_ROWS } from "./soups";
import { SWEET_ROWS } from "./sweets";
import { VEGETABLE_ROWS } from "./vegetables";

/*
 * More cooked dishes, covering the dish list of the Indian Nutrient Databank (INDB, Anuvaad
 * Solutions, 2024). The names come from that list; the recipes, cooked weights and portions
 * are Oswald's own. INDB's numbers aren't used: they count all the frying oil and the raw
 * weight, so fried and water-cooked dishes come out two to three times too high.
 * Order matters: bases come first because other dishes use them as ingredients.
 */
export const EXTRA_DISH_ROWS: DishRow[] = [
  ...BASE_ROWS,
  ...DRINK_ROWS,
  ...BREAKFAST_ROWS,
  ...SANDWICH_ROWS,
  ...SOUP_ROWS,
  ...BREAD_RICE_ROWS,
  ...DAL_ROWS,
  ...VEGETABLE_ROWS,
  ...NON_VEG_ROWS,
  ...SALAD_ROWS,
  ...SNACK_ROWS,
  ...SWEET_ROWS,
  ...DESSERT_ROWS,
  ...BAKERY_ROWS,
  ...CHUTNEY_ROWS,
  ...PRESERVE_ROWS,
  ...INFANT_ROWS,
];

/** Extra dishes that are made to cook with or eaten by the spoonful: never suggested as a meal. */
export const PREP_ONLY_IDS: string[] = [...BASE_PREP_ONLY, ...PRESERVE_ROWS.map(([id]) => id)];

export { EXTRA_ALIASES } from "./aliases";
