import { supabase } from "../lib/supabase";

export const dynamic = "force-dynamic";

type Message = {
  role: "user" | "bot";
  text: string;
};

type DialogRow = {
  id: string;
  session_id: string;
  is_lead: boolean;
  intent: string | null;
  problem: string | null;
  quality: number | null;
  messages_count: number | null;
  user_messages_count: number | null;
  analysis_text: string | null;
  messages: string | Message[] | null;
  dialog_text: string | null;
  created_at: string;
  dialog_hash: string | null;
};

function safeParseMessages(value: DialogRow["messages"]): Message[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.filter(
      (m): m is Message =>
        !!m &&
        (m.role === "user" || m.role === "bot") &&
        typeof m.text === "string",
    );
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (m): m is Message =>
            !!m &&
            (m.role === "user" || m.role === "bot") &&
            typeof m.text === "string",
        );
      }
    } catch {
      return [];
    }
  }

  return [];
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function getQualityColor(quality: number | null) {
  if (quality === null) return "#6b7280";
  if (quality <= 4) return "#dc2626";
  if (quality <= 7) return "#d97706";
  return "#16a34a";
}

function groupDialogs(rows: DialogRow[]) {
  return {
    leads: rows.filter((row) => row.is_lead),
    noLeads: rows.filter((row) => !row.is_lead),
  };
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: "14px 16px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{value}</div>
    </div>
  );
}

function Section({
  title,
  items,
}: {
  title: string;
  items: DialogRow[];
}) {
  return (
    <section>
      <h2
        style={{
          fontSize: 28,
          margin: "0 0 16px",
          fontWeight: 800,
        }}
      >
        {title}
      </h2>

      <div style={{ display: "grid", gap: 14 }}>
        {items.length === 0 ? (
          <div
            style={{
              background: "#fff",
              border: "1px dashed #d1d5db",
              borderRadius: 16,
              padding: 20,
              color: "#6b7280",
            }}
          >
            Пока пусто
          </div>
        ) : (
          items.map((item) => <DialogCard key={item.id} item={item} />)
        )}
      </div>
    </section>
  );
}

function DialogCard({ item }: { item: DialogRow }) {
  const parsedMessages = safeParseMessages(item.messages);
  const qualityColor = getQualityColor(item.quality);

  return (
    <details
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 18,
        boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
        overflow: "hidden",
      }}
    >
      <summary
        style={{
          cursor: "pointer",
          listStyle: "none",
          padding: 16,
        }}
      >
        <div
          style={{
            display: "grid",
            gap: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: "#111827",
              }}
            >
              {item.session_id}
            </span>

            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                borderRadius: 999,
                padding: "4px 10px",
                fontSize: 12,
                fontWeight: 700,
                background: item.is_lead ? "#dcfce7" : "#f3f4f6",
                color: item.is_lead ? "#166534" : "#374151",
              }}
            >
              {item.is_lead ? "Лид" : "Без лида"}
            </span>

            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                borderRadius: 999,
                padding: "4px 10px",
                fontSize: 12,
                fontWeight: 700,
                background: "#f3f4f6",
                color: "#111827",
              }}
            >
              {item.intent || "—"}
            </span>

            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                borderRadius: 999,
                padding: "4px 10px",
                fontSize: 12,
                fontWeight: 700,
                background: "#f3f4f6",
                color: qualityColor,
              }}
            >
              Quality: {item.quality ?? "—"}
            </span>
          </div>

          <div
            style={{
              fontSize: 14,
              color: "#111827",
              fontWeight: 600,
            }}
          >
            {item.problem || "Проблема не определена"}
          </div>

          <div
            style={{
              display: "flex",
              gap: 14,
              flexWrap: "wrap",
              fontSize: 13,
              color: "#6b7280",
            }}
          >
            <span>Всего сообщений: {item.messages_count ?? 0}</span>
            <span>Сообщений клиента: {item.user_messages_count ?? 0}</span>
            <span>{formatDate(item.created_at)}</span>
          </div>
        </div>
      </summary>

      <div
        style={{
          borderTop: "1px solid #f0f0f0",
          padding: 16,
          display: "grid",
          gap: 18,
          background: "#fcfcfd",
        }}
      >
        <div
          style={{
            background: "#fff",
            border: "1px solid #eef2f7",
            borderRadius: 16,
            padding: 16,
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 800,
              marginBottom: 12,
              color: "#111827",
            }}
          >
            Анализ
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ fontSize: 14 }}>
              <strong>Intent:</strong> {item.intent || "—"}
            </div>
            <div style={{ fontSize: 14 }}>
              <strong>Problem:</strong> {item.problem || "—"}
            </div>
            <div style={{ fontSize: 14 }}>
              <strong>Quality:</strong>{" "}
              <span style={{ color: qualityColor, fontWeight: 700 }}>
                {item.quality ?? "—"}
              </span>
            </div>
            <div style={{ fontSize: 14, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
              <strong>Оценка:</strong>{" "}
              {item.analysis_text || "Нет текста анализа"}
            </div>
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            border: "1px solid #eef2f7",
            borderRadius: 16,
            padding: 16,
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 800,
              marginBottom: 12,
              color: "#111827",
            }}
          >
            Диалог
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {parsedMessages.length > 0 ? (
              parsedMessages.map((message, index) => {
                const isUser = message.role === "user";

                return (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: isUser ? "flex-start" : "flex-end",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "80%",
                        background: isUser ? "#eef2ff" : "#ecfdf5",
                        color: "#111827",
                        border: `1px solid ${isUser ? "#c7d2fe" : "#bbf7d0"}`,
                        borderRadius: 16,
                        padding: "10px 12px",
                        lineHeight: 1.45,
                        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          marginBottom: 6,
                          color: isUser ? "#4338ca" : "#15803d",
                        }}
                      >
                        {isUser ? "Клиент" : "Бот"}
                      </div>
                      <div style={{ fontSize: 14, whiteSpace: "pre-wrap" }}>
                        {message.text}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div
                style={{
                  whiteSpace: "pre-wrap",
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: "#111827",
                }}
              >
                {item.dialog_text || "Нет текста диалога"}
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            border: "1px solid #eef2f7",
            borderRadius: 16,
            padding: 16,
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 800,
              marginBottom: 12,
              color: "#111827",
            }}
          >
            Метаданные
          </div>

          <div
            style={{
              display: "grid",
              gap: 8,
              fontSize: 13,
              color: "#374151",
            }}
          >
            <div><strong>Session ID:</strong> {item.session_id}</div>
            <div><strong>Создан:</strong> {formatDate(item.created_at)}</div>
            <div><strong>Dialog hash:</strong> {item.dialog_hash || "—"}</div>
          </div>
        </div>
      </div>
    </details>
  );
}

export default async function HomePage() {
  const { data, error } = await supabase
    .from("dialogs")
    .select(
      "id, session_id, is_lead, intent, problem, quality, messages_count, user_messages_count, analysis_text, messages, dialog_text, created_at, dialog_hash",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return (
      <main style={{ maxWidth: 1400, margin: "0 auto", padding: 24 }}>
        <h1>Chat Viewer</h1>
        <pre>{error.message}</pre>
      </main>
    );
  }

  const rows = (data || []) as DialogRow[];
  const grouped = groupDialogs(rows);

  return (
    <main
      style={{
        maxWidth: 1500,
        margin: "0 auto",
        padding: 24,
        background: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          display: "grid",
          gap: 18,
          marginBottom: 24,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 42,
              lineHeight: 1,
              margin: 0,
              fontWeight: 900,
              color: "#111827",
            }}
          >
            Chat Viewer
          </h1>
          <div
            style={{
              marginTop: 8,
              color: "#6b7280",
              fontSize: 15,
            }}
          >
            Просмотр и анализ диалогов из Supabase
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 14,
          }}
        >
          <StatCard label="Всего диалогов" value={rows.length} />
          <StatCard label="С лидами" value={grouped.leads.length} />
          <StatCard label="Без лидов" value={grouped.noLeads.length} />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          alignItems: "start",
        }}
      >
        <Section title="С лидами" items={grouped.leads} />
        <Section title="Без лидов" items={grouped.noLeads} />
      </div>
    </main>
  );
}
