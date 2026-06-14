import type { Extraction } from "~/types";

/**
 * NORMALIZATION LAYER
 *
 * This is the ONLY place in the codebase that assumes
 * a structure for `extracted_circulars`.
 *
 * CURRENT ASSUMPTION (MVP):
 * extracted_circulars/<id>.json is:
 *
 * {
 *   "ra": "117.5",
 *   "dec": "52.2",
 *   "event_type": "LONG GRB"
 * }
 *
 * If structure changes later, modify ONLY this function.
 */
export function normalizeExtraction(raw: any): Extraction {
  if (!raw || typeof raw !== "object") {
    return {};
  }

  /**
   * CASE 1: flat key/value structure (expected MVP)
   */
  const isFlatKeyValue = Object.values(raw).every(
    (v) =>
      typeof v === "string" ||
      typeof v === "number" ||
      v === null
  );

  if (isFlatKeyValue) {
    const out: Extraction = {};

    for (const [k, v] of Object.entries(raw)) {
      if (v === null || v === undefined) continue;
      out[k] = String(v);
    }

    return out;
  }

  /**
   * CASE 2 (future extension placeholder):
   * If extracted_circulars becomes:
   *
   * {
   *   ra: { value: "117.5", confidence: 0.98 }
   * }
   */
  const out: Extraction = {};

  for (const [k, v] of Object.entries(raw)) {
    if (typeof v === "string") {
      out[k] = v;
      continue;
    }

    if (typeof v === "number") {
      out[k] = String(v);
      continue;
    }

    if (v && typeof v === "object") {
      const maybeValue =
        (v as any).value ??
        (v as any).text ??
        (v as any).extracted;

      if (maybeValue != null) {
        out[k] = String(maybeValue);
      }
    }
  }

  return out;
}