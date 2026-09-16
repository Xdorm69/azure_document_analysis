import Link from "next/link";
import { ScanSearchIcon } from "lucide-react";
import {
  Show,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";

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

          <Show when="signed-out">
            <SignInButton
              mode="modal"
              signUpForceRedirectUrl="/onboard"
              forceRedirectUrl="/dashboard"
            >
              <button className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                Sign In
              </button>
            </SignInButton>
          </Show>

          <Show when="signed-in">
            <UserButton />
          </Show>
        </nav>
      </div>
    </header>
  );
}