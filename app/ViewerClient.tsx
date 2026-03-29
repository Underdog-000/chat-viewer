"use client";

import { useMemo, useState } from "react";
import type { DialogRow } from "./page";

type Message = {
  role: "user" | "bot";
  text: string;
};

type TabKey = "dialog" | "analysis" | "meta";

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

function StatCard({ label, value }: { label: string; value: number }) {
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

function ActionButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      style={{
        height: 34,
        padding: "0 12px",
        borderRadius: 10,
        border: "1px solid #d1d5db",
        background: "#fff",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 600,
        color: "#111827",
      }}
    >
      {children}
    </button>
  );
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        height: 36,
        padding: "0 12px",
        borderRadius: 10,
        border: active ? "1px solid #c7d2fe" : "1px solid #e5e7eb",
        background: active ? "#eef2ff" : "#fff",
        color: active ? "#3730a3" : "#374151",
        fontSize: 13,
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

function openTranslate(text: string, targetLang = "ru") {
  const url = `https://translate.google.com/?sl=auto&tl=${targetLang}&text=${encodeURIComponent(text)}&op=translate`;
  window.open(url, "_blank", "noopener,noreferrer");
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {}
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-start" : "flex-end",
      }}
    >
      <div
        style={{
          maxWidth: "85%",
          background: isUser ? "#eef2ff" : "#ecfdf5",
          border: `1px solid ${isUser ? "#c7d2fe" : "#bbf7d0"}`,
          borderRadius: 16,
          padding: "10px 12px",
          lineHeight: 1.45,
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
        <div style={{ fontSize: 14, whiteSpace: "pre-wrap" }}>{message.text}</div>
      </div>
    </div>
  );
}

function DialogCard({ item }: { item: DialogRow }) {
  const parsedMessages = safeParseMessages(item.messages);
  const qualityColor = getQualityColor(item.quality);
  const [activeTab, setActiveTab] = useState<TabKey>("dialog");

  const dialogPlainText =
    parsedMessages.length > 0
      ? parsedMessages
          .map((m) => `${m.role === "user" ? "Клиент" : "Бот"}: ${m.text}`)
          .join("\n\n")
      : item.dialog_text || "";

  const analysisPlainText = [
    `Intent: ${item.intent || "—"}`,
    `Problem: ${item.problem || "—"}`,
    `Quality: ${item.quality ?? "—"}`,
    `Оценка: ${item.analysis_text || "Нет текста анализа"}`,
  ].join("\n");

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
      <summary style={{ cursor: "pointer", listStyle: "none", padding: 16 }}>
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#111827" }}>
              {item.session_id}
            </span>

            <span
              style={{
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

          <div style={{ fontSize: 14, color: "#111827", fontWeight: 600 }}>
            {item.problem || "Проблема не определена"}
          </div>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 13, color: "#6b7280" }}>
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
          gap: 16,
          background: "#fcfcfd",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <TabButton
              label="Диалог"
              active={activeTab === "dialog"}
              onClick={() => setActiveTab("dialog")}
            />
            <TabButton
              label="Анализ"
              active={activeTab === "analysis"}
              onClick={() => setActiveTab("analysis")}
            />
            <TabButton
              label="Метаданные"
              active={activeTab === "meta"}
              onClick={() => setActiveTab("meta")}
            />
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <ActionButton onClick={() => copyText(item.session_id)}>
              Скопировать session_id
            </ActionButton>

            <ActionButton onClick={() => copyText(dialogPlainText)}>
              Скопировать диалог
            </ActionButton>

            <ActionButton onClick={() => copyText(analysisPlainText)}>
              Скопировать анализ
            </ActionButton>

            <ActionButton onClick={() => openTranslate(dialogPlainText)}>
              Перевести диалог
            </ActionButton>

            <ActionButton onClick={() => openTranslate(analysisPlainText)}>
              Перевести анализ
            </ActionButton>
          </div>
        </div>

        {activeTab === "dialog" && (
          <div
            style={{
              background: "#fff",
              border: "1px solid #eef2f7",
              borderRadius: 16,
              padding: 16,
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 12, color: "#111827" }}>
              Диалог
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              {parsedMessages.length > 0 ? (
                parsedMessages.map((message, index) => (
                  <MessageBubble key={index} message={message} />
                ))
              ) : (
                <div style={{ whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.5 }}>
                  {item.dialog_text || "Нет текста диалога"}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "analysis" && (
          <div
            style={{
              background: "#fff",
              border: "1px solid #eef2f7",
              borderRadius: 16,
              padding: 16,
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 12, color: "#111827" }}>
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
                <strong>Оценка:</strong> {item.analysis_text || "Нет текста анализа"}
              </div>
            </div>
          </div>
        )}

        {activeTab === "meta" && (
          <div
            style={{
              background: "#fff",
              border: "1px solid #eef2f7",
              borderRadius: 16,
              padding: 16,
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 12, color: "#111827" }}>
              Метаданные
            </div>

            <div style={{ display: "grid", gap: 8, fontSize: 13, color: "#374151" }}>
              <div><strong>Session ID:</strong> {item.session_id}</div>
              <div><strong>Создан:</strong> {formatDate(item.created_at)}</div>
              <div><strong>Всего сообщений:</strong> {item.messages_count ?? 0}</div>
              <div><strong>Сообщений клиента:</strong> {item.user_messages_count ?? 0}</div>
              <div><strong>Dialog hash:</strong> {item.dialog_hash || "—"}</div>
            </div>
          </div>
        )}
      </div>
    </details>
  );
}

export default function ViewerClient({ initialRows }: { initialRows: DialogRow[] }) {
  const [search, setSearch] = useState("");
  const [leadFilter, setLeadFilter] = useState("all");
  const [intentFilter, setIntentFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const intents = useMemo(() => {
    const uniq = Array.from(
      new Set(initialRows.map((row) => row.intent).filter(Boolean)),
    ) as string[];
    return uniq.sort((a, b) => a.localeCompare(b, "ru"));
  }, [initialRows]);

  const filteredRows = useMemo(() => {
    let rows = [...initialRows];

    if (leadFilter === "lead") rows = rows.filter((row) => row.is_lead);
    if (leadFilter === "no_lead") rows = rows.filter((row) => !row.is_lead);

    if (intentFilter !== "all") {
      rows = rows.filter((row) => (row.intent || "") === intentFilter);
    }

    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter((row) => {
        const parsedMessages = safeParseMessages(row.messages);
        const messagesText = parsedMessages.map((m) => m.text).join(" ");
        return (
          (row.session_id || "").toLowerCase().includes(q) ||
          (row.intent || "").toLowerCase().includes(q) ||
          (row.problem || "").toLowerCase().includes(q) ||
          (row.analysis_text || "").toLowerCase().includes(q) ||
          (row.dialog_text || "").toLowerCase().includes(q) ||
          messagesText.toLowerCase().includes(q)
        );
      });
    }

    rows.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === "quality_desc") {
        return (b.quality ?? -1) - (a.quality ?? -1);
      }
      if (sortBy === "quality_asc") {
        return (a.quality ?? 999) - (b.quality ?? 999);
      }
      if (sortBy === "messages_desc") {
        return (b.messages_count ?? -1) - (a.messages_count ?? -1);
      }
      if (sortBy === "messages_asc") {
        return (a.messages_count ?? 999) - (b.messages_count ?? 999);
      }
      return 0;
    });

    return rows;
  }, [initialRows, search, leadFilter, intentFilter, sortBy]);

  const leads = filteredRows.filter((row) => row.is_lead);
  const noLeads = filteredRows.filter((row) => !row.is_lead);

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
      <div style={{ display: "grid", gap: 18, marginBottom: 24 }}>
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
          <div style={{ marginTop: 8, color: "#6b7280", fontSize: 15 }}>
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
          <StatCard label="Всего диалогов" value={filteredRows.length} />
          <StatCard label="С лидами" value={leads.length} />
          <StatCard label="Без лидов" value={noLeads.length} />
        </div>

        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 18,
            padding: 16,
            boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
            display: "grid",
            gap: 12,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr",
              gap: 12,
            }}
          >
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по session_id, intent, problem, тексту диалога..."
              style={{
                width: "100%",
                height: 42,
                borderRadius: 12,
                border: "1px solid #d1d5db",
                padding: "0 12px",
                fontSize: 14,
              }}
            />

            <select
              value={leadFilter}
              onChange={(e) => setLeadFilter(e.target.value)}
              style={{
                height: 42,
                borderRadius: 12,
                border: "1px solid #d1d5db",
                padding: "0 12px",
                fontSize: 14,
                background: "#fff",
              }}
            >
              <option value="all">Все</option>
              <option value="lead">Только лиды</option>
              <option value="no_lead">Только без лида</option>
            </select>

            <select
              value={intentFilter}
              onChange={(e) => setIntentFilter(e.target.value)}
              style={{
                height: 42,
                borderRadius: 12,
                border: "1px solid #d1d5db",
                padding: "0 12px",
                fontSize: 14,
                background: "#fff",
              }}
            >
              <option value="all">Все intent</option>
              {intents.map((intent) => (
                <option key={intent} value={intent}>
                  {intent}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                height: 42,
                borderRadius: 12,
                border: "1px solid #d1d5db",
                padding: "0 12px",
                fontSize: 14,
                background: "#fff",
              }}
            >
              <option value="newest">Сначала новые</option>
              <option value="oldest">Сначала старые</option>
              <option value="quality_desc">Quality ↓</option>
              <option value="quality_asc">Quality ↑</option>
              <option value="messages_desc">Сообщения ↓</option>
              <option value="messages_asc">Сообщения ↑</option>
            </select>
          </div>
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
        <section>
          <h2 style={{ fontSize: 28, margin: "0 0 16px", fontWeight: 800 }}>С лидами</h2>
          <div style={{ display: "grid", gap: 14 }}>
            {leads.length === 0 ? (
              <div
                style={{
                  background: "#fff",
                  border: "1px dashed #d1d5db",
                  borderRadius: 16,
                  padding: 20,
                  color: "#6b7280",
                }}
              >
                Ничего не найдено
              </div>
            ) : (
              leads.map((item) => <DialogCard key={item.id} item={item} />)
            )}
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: 28, margin: "0 0 16px", fontWeight: 800 }}>Без лидов</h2>
          <div style={{ display: "grid", gap: 14 }}>
            {noLeads.length === 0 ? (
              <div
                style={{
                  background: "#fff",
                  border: "1px dashed #d1d5db",
                  borderRadius: 16,
                  padding: 20,
                  color: "#6b7280",
                }}
              >
                Ничего не найдено
              </div>
            ) : (
              noLeads.map((item) => <DialogCard key={item.id} item={item} />)
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
