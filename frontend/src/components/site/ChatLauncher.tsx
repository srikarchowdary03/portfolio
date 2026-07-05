import Link from "next/link";

/** Floating "ask the AI" orb, present on every portfolio page. */
export function ChatLauncher() {
  return (
    <Link
      href="/chat"
      aria-label="Ask my AI assistant"
      data-testid="chat-launcher"
      className="orb fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-2xl text-xl text-white shadow-2xl shadow-accent/40 transition-transform hover:scale-110"
    >
      ✦
    </Link>
  );
}
