import fs from "fs/promises";
import path from "path";

import {
  Form,
  useLoaderData,
  useNavigate,
} from "react-router";

import type {
  Extraction,
  OutputCircular,
} from "~/types";

import { loadReviewData } from "~/utils/circular.server";
import { buildValidatedCircular } from "~/utils/validation.server";

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
 *
 * This is now the SINGLE source of truth for writing validated_circulars
 */
export async function action({ request, params }: any) {
  const formData = await request.formData();

  const intent = formData.get("intent");
  const id = params.id;

  if (intent === "skip") {
    return Response.redirect("/");
  }

  const { original, extraction } =
    JSON.parse(
      formData.get("payload") as string
    );

  /**
   * Reconstruct overrides + edited values
   */
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

  /**
   * Build final validated object
   */
  const output: OutputCircular =
    buildValidatedCircular({
      original,
      extraction: edited,
      overrides,
    });

  await fs.mkdir(VALIDATED_DIR, { recursive: true });

  const outPath = path.join(
    VALIDATED_DIR,
    `${id}.json`
  );

  await fs.writeFile(
    outPath,
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

  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      {/* LEFT PANEL */}
      <div style={styles.leftPane}>
        <h2>{original.subject}</h2>

        <h3>Body</h3>

        <pre style={styles.textBox}>
          {original.body}
        </pre>
      </div>

      {/* RIGHT PANEL */}
      <div style={styles.rightPane}>
        <h3>Extracted Features</h3>

        <Form method="post">
          {/* hidden payload so we keep original/extraction intact */}
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
                </label>

                {/* editable value */}
                <input
                  name={`field_${key}`}
                  defaultValue={value}
                  style={styles.input}
                />

                {/* override */}
                <label style={styles.override}>
                  <input
                    type="checkbox"
                    name={`override_${key}`}
                  />
                  Override (allow value not in text)
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

  textBox: {
    whiteSpace: "pre-wrap",
    background: "#fafafa",
    padding: 12,
    borderRadius: 6,
    border: "1px solid #eee",
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