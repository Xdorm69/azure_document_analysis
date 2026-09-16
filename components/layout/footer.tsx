import Link from "next/link";
import { ScanSearchIcon } from "lucide-react";

const FOOTER_LINKS = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-8 py-8 text-sm text-muted-foreground sm:flex-row sm:justify-between">
        <Link href="/" className="flex items-center gap-2 font-medium text-foreground">
          <ScanSearchIcon className="size-4" />
          Dilligence.AI
        </Link>

        <nav className="flex items-center gap-4">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p>&copy; {new Date().getFullYear()} Dilligence.AI</p>
      </div>
    </footer>
  );
}
