import Link from "next/link";

const LINKS = [
  { href: "/projects", label: "Projects" },
  { href: "/resume", label: "Resume" },
  { href: "/how-it-works", label: "How it works" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-30 border-b border-border-soft/60 bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="orb flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white shadow-lg shadow-accent/25">
            S
          </span>
          <span className="hidden text-sm font-semibold sm:inline">
            Srikar Pattipati
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-1.5 text-sm text-muted transition-colors hover:bg-surface hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/chat"
            className="orb ml-1 rounded-lg px-3.5 py-1.5 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:brightness-110"
          >
            Ask my AI ✦
          </Link>
        </nav>
      </div>
    </header>
  );
}
