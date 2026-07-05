import Link from "next/link";

/** Floating "ask the AI" affordance, present on every portfolio page. */
export function ChatLauncher() {
  return (
    <Link
      href="/chat"
      aria-label="Ask my AI assistant"
      data-testid="chat-launcher"
      className="microlabel fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-md border border-border-soft bg-background !text-foreground transition-colors hover:border-foreground hover:bg-foreground hover:!text-background"
    >
      AI
    </Link>
  );
}
