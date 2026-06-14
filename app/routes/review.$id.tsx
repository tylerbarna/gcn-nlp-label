import fs from "fs/promises";
import path from "path";

import {
  Form,
  useLoaderData,
} from "react-router";

import type { Extraction } from "~/types";

import { loadReviewData } from "~/utils/circular.server";
import { buildValidatedCircular } from "~/utils/validation.server";

import HighlightableText from "~/components/HighlightText";
import FieldValidationBadge from "~/components/FieldValidationBadge";

const VALIDATED_DIR = "data/validated_circulars";

/**
 * Loader
 */
export async function loader({ params }: any) {
  const id = params.id;

  const data = await loadReviewData(id);

  return { id, ...data };
}

/**
 * ACTION
 */
export async function action({ request, params }: any) {
  const formData = await request.formData();

  const intent = formData.get("intent");
  const id = params.id;

  if (intent === "skip") {
    return Response.redirect("/");
  }

  const { original, extraction } = JSON.parse(
    formData.get("payload") as string
  );

  const overrides: Record<string, boolean> = {};
  const edited: Extraction = {};

  for (const [key] of Object.entries(extraction)) {
    const value = formData.get(`field_${key}`);
    const override = formData.get(`override_${key}`);

    if (typeof value === "string") {
      edited[key] = value;
    }

    overrides[key] = override === "on";
  }

  const output = buildValidatedCircular({
    original,
    extraction: edited,
    overrides,
  });

  await fs.mkdir(VALIDATED_DIR, { recursive: true });

  await fs.writeFile(
    path.join(VALIDATED_DIR, `${id}.json`),
    JSON.stringify(output, null, 2)
  );

  return Response.redirect("/");
}

/**
 * PAGE
 */
export default function ReviewPage() {
  const { id, original, extraction } =
    useLoaderData<typeof loader>();

  /**
   * Build highlights with live status inference
   */
  const highlights = Object.entries(extraction).map(
    ([key, value]) => {
      const exists =
        original.subject.includes(value) ||
        original.body.includes(value);

      const status = exists ? ("correct" as const) : ("not_present" as const);

      return {
        key,
        value,
        status,
      };
    }
  );

  return (
    <div style={styles.container}>
      {/* LEFT */}
      <div style={styles.leftPane}>
        <h2>{original.subject}</h2>

        <h3>Body</h3>

        <HighlightableText
          text={original.body}
          highlights={highlights}
        />
      </div>

      {/* RIGHT */}
      <div style={styles.rightPane}>
        <h3>Extracted Features</h3>

        <Form method="post">
          <input
            type="hidden"
            name="payload"
            value={JSON.stringify({
              original,
              extraction,
            })}
          />

          {Object.entries(extraction).map(
            ([key, value]) => (
              <div key={key} style={styles.field}>
                <label>
                    <strong>{key}</strong>
                    {/* compute status for this field */}
                    {(() => {
                      const exists =
                        original.subject.includes(value) ||
                        original.body.includes(value);

                      const status = exists ? ("correct" as const) : ("not_present" as const);

                      return <FieldValidationBadge status={status} />;
                    })()}
                </label>

                <input
                  name={`field_${key}`}
                  defaultValue={value}
                  style={styles.input}
                />

                <label style={styles.override}>
                  <input
                    type="checkbox"
                    name={`override_${key}`}
                  />
                  Override
                </label>
              </div>
            )
          )}

          <div style={styles.footer}>
            <button type="submit">
              Save
            </button>

            <button
              type="submit"
              name="intent"
              value="skip"
            >
              Skip
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}

/**
 * STYLES
 */
const styles: Record<string, any> = {
  container: {
    display: "flex",
    height: "100vh",
    fontFamily: "system-ui",
  },

  leftPane: {
    flex: 2,
    padding: 20,
    borderRight: "1px solid #ddd",
    overflowY: "auto",
  },

  rightPane: {
    flex: 1,
    padding: 20,
    overflowY: "auto",
  },

  field: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: "1px solid #eee",
  },

  input: {
    width: "100%",
    padding: 6,
    marginTop: 4,
  },

  override: {
    fontSize: 12,
    display: "block",
    marginTop: 6,
  },

  footer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 20,
  },
};