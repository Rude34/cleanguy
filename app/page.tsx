import Link from "next/link";
import { FileText, Wrench, Search, Info } from "lucide-react";
import SystemClock from "./components/SystemClock";

export const metadata = {
  title: "Home | Windows Desktop | CleanGuy Tech",
};

const desktopItems = [
  { label: "Guides", href: "/guides", icon: FileText },
  { label: "Tools", href: "/tools", icon: Wrench },
  { label: "Search", href: "/search", icon: Search },
  { label: "About", href: "/about", icon: Info },
];

export default function Home() {
  return (
    <main className="min-h-screen w-full overflow-hidden desktop-bg text-white">
      <section className="absolute inset-0 p-5">
        <div className="absolute left-5 top-5 z-20 flex flex-col items-start gap-2">
          {desktopItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex h-16 w-16 flex-col items-center justify-center rounded-sm bg-white/15 text-center text-sm text-white shadow-lg shadow-black/20 transition hover:bg-white/30 hover:shadow-xl"
              >
                <Icon size={28} strokeWidth={2} className="text-cyan-100" />
                <span className="mt-1 leading-none text-cyan-100">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <footer className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between border-t border-white/20 bg-black/60 px-4 py-2 text-xs text-white/90 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-sm border border-white/20 bg-white/10 px-2 py-1 text-xs hover:bg-white/20">
            ▶ Start
          </button>
        </div>
        <div className="flex items-center gap-4">
          <SystemClock />
        </div>
      </footer>
    </main>
  );
}
