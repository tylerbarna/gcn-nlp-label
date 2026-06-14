import type {
  Circular,
  Extraction,
  OutputCircular,
  ValidationMetadata,
  ValidationStatus,
} from "~/types";

/**
 * Check if a value exists in text (subject + body)
 */
function valueExistsInText(
  text: string,
  value: string
): boolean {
  if (!value) return false;

  return text.includes(value);
}

/**
 * Determine validation status for a field
 */
function getStatus(
  exists: boolean,
  override: boolean
): ValidationStatus {
  if (override) return "corrected";
  return exists ? "correct" : "not_present";
}

/**
 * Build validation metadata for extracted fields
 */
export function buildValidationMetadata(args: {
  original: Circular;
  extraction: Extraction;
  overrides: Record<string, boolean>;
}): ValidationMetadata {
  const { original, extraction, overrides } = args;

  const fullText = `${original.subject}\n${original.body}`;

  const metadata: ValidationMetadata = {};

  for (const [key, value] of Object.entries(extraction)) {
    const override = Boolean(overrides[key]);

    const exists = valueExistsInText(
      fullText,
      value
    );

    metadata[key] = {
      value,
      status: getStatus(exists, override),
      override,
    };
  }

  return metadata;
}

/**
 * Build final output circular for validated_circulars
 *
 * IMPORTANT:
 * This is the ONLY place where final schema is defined.
 */
export function buildValidatedCircular(args: {
  original: Circular;
  extraction: Extraction;
  overrides: Record<string, boolean>;
}): OutputCircular {
  const { original, extraction, overrides } = args;

  const _validation = buildValidationMetadata({
    original,
    extraction,
    overrides,
  });

  /**
   * Merge strategy:
   * - keep original circular fields
   * - overlay extracted fields
   * - attach validation metadata
   */
  return {
    ...original,
    ...extraction,
    _validation,
  };
}