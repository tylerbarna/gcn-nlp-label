import fs from "fs/promises";
import path from "path";

import type { Circular, Extraction, ReviewData } from "~/types";
import { normalizeExtraction } from "./normalizeExtraction";

const ORIGINAL_DIR = "data/original_circulars";
const EXTRACTED_DIR = "data/extracted_circulars";
const VALIDATED_DIR = "data/validated_circulars";

/**
 * Read JSON safely
 */
async function readJSON<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw);
}

/**
 * Check if file exists
 */
async function exists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get list of IDs from original_circulars
 */
async function getOriginalIds(): Promise<string[]> {
  const files = await fs.readdir(ORIGINAL_DIR);
  return files
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""));
}

/**
 * Determine if a circular is eligible for review
 *
 * Must satisfy:
 * 1. Exists in original_circulars
 * 2. Exists in extracted_circulars
 * 3. NOT exists in validated_circulars
 */
async function isEligible(id: string): Promise<boolean> {
  const originalPath = path.join(ORIGINAL_DIR, `${id}.json`);
  const extractedPath = path.join(EXTRACTED_DIR, `${id}.json`);
  const validatedPath = path.join(VALIDATED_DIR, `${id}.json`);

  const [hasOriginal, hasExtracted, hasValidated] =
    await Promise.all([
      exists(originalPath),
      exists(extractedPath),
      exists(validatedPath),
    ]);

  return hasOriginal && hasExtracted && !hasValidated;
}

/**
 * Pick a random eligible circular ID
 */
export async function getRandomCircularId(): Promise<string | null> {
  const ids = await getOriginalIds();

  const eligible: string[] = [];

  for (const id of ids) {
    if (await isEligible(id)) {
      eligible.push(id);
    }
  }

  if (eligible.length === 0) return null;

  return eligible[Math.floor(Math.random() * eligible.length)];
}

/**
 * Load full review data (original + extracted)
 */
export async function loadReviewData(
  id: string
): Promise<ReviewData> {
  const originalPath = path.join(ORIGINAL_DIR, `${id}.json`);
  const extractedPath = path.join(EXTRACTED_DIR, `${id}.json`);

  const [original, extractedRaw] = await Promise.all([
    readJSON<Circular>(originalPath),
    readJSON<any>(extractedPath),
  ]);

  const extraction: Extraction =
    normalizeExtraction(extractedRaw);

  return {
    original,
    extraction,
  };
}

/**
 * Get next random circular ready for review
 */
export async function getNextReview(): Promise<{
  id: string;
  data: ReviewData;
} | null> {
  const id = await getRandomCircularId();

  if (!id) return null;

  const data = await loadReviewData(id);

  return { id, data };
}