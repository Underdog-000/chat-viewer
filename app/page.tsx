import { supabase } from "../lib/supabase";

export default async function HomePage() {
  const { data, error } = await supabase
    .from("dialogs")
    .select("id, session_id, is_lead, intent, problem, quality, messages_count, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return (
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
        <h1>Chat Viewer</h1>
        <pre>{error.message}</pre>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
      <h1 style={{ marginBottom: 16 }}>Chat Viewer</h1>

      <div style={{ display: "grid", gap: 12 }}>
        {data?.map((item) => (
          <div
            key={item.id}
            style={{
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <div><strong>Session:</strong> {item.session_id}</div>
            <div><strong>Lead:</strong> {String(item.is_lead)}</div>
            <div><strong>Intent:</strong> {item.intent}</div>
            <div><strong>Problem:</strong> {item.problem}</div>
            <div><strong>Quality:</strong> {item.quality}</div>
            <div><strong>Messages:</strong> {item.messages_count}</div>
            <div><strong>Created:</strong> {item.created_at}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
