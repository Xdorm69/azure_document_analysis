import Link from "next/link";
import { ScanSearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-8">
        <Link href="/" className="flex items-center gap-2 font-medium">
          <ScanSearchIcon className="size-5" />
          Document Analyzer
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>

          {/* TODO: wire up Clerk auth — placeholder for now */}
          <Button variant="outline" size="sm" disabled>
            Sign in
          </Button>
        </nav>
      </div>
    </header>
  );
}
