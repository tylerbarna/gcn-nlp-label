export interface Circular {
  subject: string;
  eventId: string;
  submittedHow: string;
  bibcode: string;
  createdOn: number;
  circularId: number;
  submitter: string;
  body: string;

  [key: string]: unknown;
}

/**
 * ASSUMPTION:
 * Files in extracted_circulars are simple key/value pairs:
 *
 * {
 *   "ra": "117.5",
 *   "dec": "52.2",
 *   "event_type": "LONG GRB"
 * }
 *
 * If extracted_circulars later changes structure,
 * only normalizeExtraction() will need updating.
 */
export type Extraction = Record<string, string>;

export type ValidationStatus =
  | "correct"
  | "corrected"
  | "not_present";

export interface ValidatedField {
  value: string | null;
  status: ValidationStatus;
  override: boolean;
}

export interface ValidationMetadata {
  [key: string]: ValidatedField;
}

export interface ReviewData {
  original: Circular;
  extraction: Extraction;
}

export interface OutputCircular extends Circular {
  _validation: ValidationMetadata;

  [key: string]: unknown;
}