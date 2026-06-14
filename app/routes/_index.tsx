import { redirect } from "react-router";

import { getRandomCircularId } from "~/utils/circular.server";

/**
 * ROOT ROUTE
 *
 * Behavior:
 * - On load → find next eligible circular
 * - Redirect → /review/:id
 * - If none → show completion screen
 */
export async function loader() {
  const id = await getRandomCircularId();

  if (!id) {
    return {
      done: true,
      message: "All circulars validated.",
    };
  }

  throw redirect(`/review/${id}`);
}

export default function Index() {
  // This only renders if loader returns data instead of redirect
  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h2>GCN Validator</h2>
      <p>Loading next circular…</p>
    </div>
  );
}