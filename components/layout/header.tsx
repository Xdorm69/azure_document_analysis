import Link from "next/link";
import { ScanSearchIcon } from "lucide-react";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

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

          <SignedOut>
            {/* Fresh sign-ups land on the questionnaire before the dashboard. */}
            <SignInButton mode="modal" forceRedirectUrl="/onboard" />
          </SignedOut>

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </nav>
      </div>
    </header>
  );
}
