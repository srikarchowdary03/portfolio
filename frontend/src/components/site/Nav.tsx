import Link from "next/link";

const LINKS = [
  { href: "/chat", label: "Demo" },
  { href: "/changelog", label: "Releases" },
  { href: "/projects", label: "Capabilities" },
  { href: "/resume", label: "Spec" },
  { href: "/how-it-works", label: "Architecture" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-30 border-b border-border-soft bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-mono text-sm font-bold tracking-[0.18em] text-foreground">
            SRIKAR
          </span>
          <span className="microlabel !text-accent">v3.0-beta</span>
        </Link>
        <nav className="flex items-center gap-0.5 sm:gap-1">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="microlabel hidden rounded px-2.5 py-2 transition-colors hover:!text-foreground sm:inline"
            >
              {link.label}
            </Link>
          ))}
          <span className="microlabel mr-1 hidden items-center gap-1.5 border border-border-soft px-2.5 py-1.5 md:flex">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
            Available May 2026
          </span>
          <Link href="/#deploy" className="btn-primary microlabel px-4 py-2.5 !text-[#0c0a06]">
            Deploy
          </Link>
        </nav>
      </div>
    </header>
  );
}
