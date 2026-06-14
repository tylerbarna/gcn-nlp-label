import { useNavigate, useLoaderData } from "react-router";
import { getRandomCircularId } from "~/utils/circular.server";

/**
 * ROOT ROUTE
 *
 * Now acts as a landing page instead of auto-redirect
 */
export async function loader() {
  const id = await getRandomCircularId();

  return {
    nextId: id,
    done: !id,
  };
}

export default function Index() {
  const { nextId, done } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  if (done) {
    return (
      <div style={styles.container}>
        <h1>GCN Validator</h1>
        <p>All circulars have been validated.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1>GCN Circular Validator</h1>

      <p>
        This tool helps you validate extracted features from GCN circulars
        against the original text.
      </p>

      <button
        style={styles.button}
        onClick={() => navigate(`/review/${nextId}`)}
      >
        Start Review
      </button>

      <p style={styles.hint}>
        Next circular ready: {nextId}
      </p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: 40,
    fontFamily: "system-ui",
    maxWidth: 700,
  },
  button: {
    marginTop: 20,
    padding: "10px 16px",
    fontSize: 16,
    cursor: "pointer",
  },
  hint: {
    marginTop: 16,
    fontSize: 12,
    opacity: 0.7,
  },
};