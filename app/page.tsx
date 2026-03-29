import { supabase } from "../lib/supabase";
import ViewerClient from "./ViewerClient";

export const dynamic = "force-dynamic";

type Message = {
  role: "user" | "bot";
  text: string;
};

export type DialogRow = {
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
  offer: string | null;
  country: string | null;
  vertical: string | null;
};

export default async function HomePage() {
  const { data, error } = await supabase
    .from("dialogs")
    .select(
      "id, session_id, is_lead, intent, problem, quality, messages_count, user_messages_count, analysis_text, messages, dialog_text, created_at, dialog_hash",
    )
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) {
    return (
      <main style={{ maxWidth: 1400, margin: "0 auto", padding: 24 }}>
        <h1>Chat Viewer</h1>
        <pre>{error.message}</pre>
      </main>
    );
  }

  return <ViewerClient initialRows={(data || []) as DialogRow[]} />;
}
