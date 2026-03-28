import { supabase } from "../lib/supabase";

type DialogRow = {
  id: string;
  session_id: string;
  is_lead: boolean;
  intent: string;
  problem: string;
  quality: number;
  messages_count: number;
  dialog_text: string;
  created_at: string;
};

function groupByLeadAndSession(rows: DialogRow[]) {
  const result: Record<string, Record<string, DialogRow[]>> = {
    leads: {},
    noLeads: {},
  };

  for (const row of rows) {
    const leadGroup = row.is_lead ? "leads" : "noLeads";

    if (!result[leadGroup][row.session_id]) {
      result[leadGroup][row.session_id] = [];
    }

    result[leadGroup][row.session_id].push(row);
  }

  return result;
}

export default async function HomePage() {
  const { data, error } = await supabase
    .from("dialogs")
    .select(
      "id, session_id, is_lead, intent, problem, quality, messages_count, dialog_text, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return (
      <main style={{ maxWidth: 1400, margin: "0 auto", padding: 24 }}>
        <h1>Chat Viewer</h1>
        <pre>{error.message}</pre>
      </main>
    );
  }

  const grouped = groupByLeadAndSession((data || []) as DialogRow[]);

  return (
    <main style={{ maxWidth: 1400, margin: "0 auto", padding: 24 }}>
      <h1 style={{ marginBottom: 24 }}>Chat Viewer</h1>

      <section style={{ marginBottom: 40 }}>
        <h2>С лидами</h2>
        <div style={{ display: "grid", gap: 16 }}>
          {Object.entries(grouped.leads).map(([sessionId, dialogs]) => (
            <details
              key={sessionId}
              style={{
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: 12,
                padding: 16,
              }}
            >
              <summary style={{ cursor: "pointer", fontWeight: 700 }}>
                {sessionId} ({dialogs.length})
              </summary>

              <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
                {dialogs.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      border: "1px solid #eee",
                      borderRadius: 10,
                      padding: 12,
                      background: "#fafafa",
                    }}
                  >
                    <div><strong>Intent:</strong> {item.intent}</div>
                    <div><strong>Problem:</strong> {item.problem}</div>
                    <div><strong>Quality:</strong> {item.quality}</div>
                    <div><strong>Messages:</strong> {item.messages_count}</div>
                    <div><strong>Created:</strong> {item.created_at}</div>
                    <pre
                      style={{
                        whiteSpace: "pre-wrap",
                        marginTop: 12,
                        fontFamily: "Arial, sans-serif",
                      }}
                    >
                      {item.dialog_text}
                    </pre>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      </section>

      <section>
        <h2>Без лидов</h2>
        <div style={{ display: "grid", gap: 16 }}>
          {Object.entries(grouped.noLeads).map(([sessionId, dialogs]) => (
            <details
              key={sessionId}
              style={{
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: 12,
                padding: 16,
              }}
            >
              <summary style={{ cursor: "pointer", fontWeight: 700 }}>
                {sessionId} ({dialogs.length})
              </summary>

              <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
                {dialogs.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      border: "1px solid #eee",
                      borderRadius: 10,
                      padding: 12,
                      background: "#fafafa",
                    }}
                  >
                    <div><strong>Intent:</strong> {item.intent}</div>
                    <div><strong>Problem:</strong> {item.problem}</div>
                    <div><strong>Quality:</strong> {item.quality}</div>
                    <div><strong>Messages:</strong> {item.messages_count}</div>
                    <div><strong>Created:</strong> {item.created_at}</div>
                    <pre
                      style={{
                        whiteSpace: "pre-wrap",
                        marginTop: 12,
                        fontFamily: "Arial, sans-serif",
                      }}
                    >
                      {item.dialog_text}
                    </pre>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
