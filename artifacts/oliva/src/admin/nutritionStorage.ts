export interface NutritionValues {
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

type NutritionSource = {
  proteinGrams?: unknown;
  carbsGrams?: unknown;
  fatGrams?: unknown;
  extraCalories?: Record<string, unknown> | null;
};

const STORAGE_PREFIX = '__oliva_nutrition_';
const STORAGE_KEYS = {
  proteinGrams: `${STORAGE_PREFIX}protein_tenths`,
  carbsGrams: `${STORAGE_PREFIX}carbs_tenths`,
  fatGrams: `${STORAGE_PREFIX}fat_tenths`,
} as const;

function finiteNonNegative(value: unknown): number | undefined {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function encodedValue(value: unknown): number | undefined {
  const parsed = finiteNonNegative(value);
  return parsed === undefined ? undefined : Math.round(parsed) / 10;
}

function hasValue(value: unknown): boolean {
  return finiteNonNegative(value) !== undefined;
}

function roundedMacro(value: number): number {
  return Math.round(Math.max(0, value) * 10) / 10;
}

export function readNutrition(
  product: NutritionSource,
  fallback: NutritionValues = { proteinGrams: 0, carbsGrams: 0, fatGrams: 0 },
): NutritionValues {
  const extras = product.extraCalories ?? {};
  const hasStoredMacroValues = Object.values(STORAGE_KEYS).some((key) => hasValue(extras[key]));
  const hasLegacyAllZeroMacros = !hasStoredMacroValues
    && finiteNonNegative(product.proteinGrams) === 0
    && finiteNonNegative(product.carbsGrams) === 0
    && finiteNonNegative(product.fatGrams) === 0
    && (fallback.proteinGrams > 0 || fallback.carbsGrams > 0 || fallback.fatGrams > 0);

  return {
    proteinGrams: roundedMacro(
      encodedValue(extras[STORAGE_KEYS.proteinGrams])
      ?? (hasLegacyAllZeroMacros ? undefined : finiteNonNegative(product.proteinGrams))
      ?? fallback.proteinGrams,
    ),
    carbsGrams: roundedMacro(
      encodedValue(extras[STORAGE_KEYS.carbsGrams])
      ?? (hasLegacyAllZeroMacros ? undefined : finiteNonNegative(product.carbsGrams))
      ?? fallback.carbsGrams,
    ),
    fatGrams: roundedMacro(
      encodedValue(extras[STORAGE_KEYS.fatGrams])
      ?? (hasLegacyAllZeroMacros ? undefined : finiteNonNegative(product.fatGrams))
      ?? fallback.fatGrams,
    ),
  };
}

export function hasStoredNutrition(product: NutritionSource): boolean {
  const extras = product.extraCalories ?? {};
  return (
    hasValue(extras[STORAGE_KEYS.proteinGrams])
    && hasValue(extras[STORAGE_KEYS.carbsGrams])
    && hasValue(extras[STORAGE_KEYS.fatGrams])
  ) || (
    hasValue(product.proteinGrams)
    && hasValue(product.carbsGrams)
    && hasValue(product.fatGrams)
  );
}

export function withNutritionStorage(
  extraCalories: Record<string, number>,
  nutrition: NutritionValues,
): Record<string, number> {
  return {
    ...Object.fromEntries(
      Object.entries(extraCalories).filter(([key]) => !key.startsWith(STORAGE_PREFIX)),
    ),
    [STORAGE_KEYS.proteinGrams]: Math.round(roundedMacro(nutrition.proteinGrams) * 10),
    [STORAGE_KEYS.carbsGrams]: Math.round(roundedMacro(nutrition.carbsGrams) * 10),
    [STORAGE_KEYS.fatGrams]: Math.round(roundedMacro(nutrition.fatGrams) * 10),
  };
}

export function visibleExtraCalories(
  extraCalories: Record<string, unknown> | null | undefined,
): Record<string, number> {
  return Object.fromEntries(
    Object.entries(extraCalories ?? {})
      .filter(([key]) => !key.startsWith(STORAGE_PREFIX))
      .map(([key, value]) => [key, Number(value)] as const)
      .filter(([, value]) => Number.isFinite(value) && value >= 0),
  );
}