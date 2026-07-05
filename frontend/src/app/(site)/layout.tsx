import { ChatLauncher } from "@/components/site/ChatLauncher";
import { Footer } from "@/components/site/Footer";
import { Nav } from "@/components/site/Nav";

// Shared shell for all portfolio pages. /chat lives outside this group and
// keeps its own full-height layout.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <div className="flex-1">{children}</div>
      <Footer />
      <ChatLauncher />
    </>
  );
}
