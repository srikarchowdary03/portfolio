import Link from "next/link";

const LINKS = [
  { href: "/projects", label: "Projects" },
  { href: "/resume", label: "Resume" },
  { href: "/how-it-works", label: "How it works" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-30 border-b border-border-soft bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <Link
          href="/"
          className="microlabel !text-foreground transition-colors hover:!text-accent"
        >
          Srikar&nbsp;Pattipati
        </Link>
        <nav className="flex items-center gap-0.5 sm:gap-1">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="microlabel rounded px-2.5 py-2 transition-colors hover:!text-foreground sm:px-3"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/chat"
            className="btn-primary microlabel ml-2 px-4 py-2.5 !text-[#0c0a06]"
          >
            Ask my AI
          </Link>
        </nav>
      </div>
    </header>
  );
}
