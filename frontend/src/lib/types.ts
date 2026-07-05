export interface Source {
  n: number;
  title: string;
  doc_type: string;
  source_file: string;
  heading: string;
  excerpt: string;
}

export interface ChatMeta {
  turn_id: number | null;
  latency_ms: number;
  intent: string;
  grounded: boolean;
  retrieved: number;
  used: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  meta?: ChatMeta;
  followups?: string[];
  status: "streaming" | "done" | "error";
}
