

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Nimfi
        </Link>
        <div className="flex items-center gap-2">
          <Button nativeButton={false} variant="ghost" size="lg" render={<Link href="/login" />}>
            Log in
          </Button>
          <Button nativeButton={false} size="lg" render={<Link href="/signup" />}>
            Sign up
          </Button>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Build, organize, and grow with Nimfi
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            A modern platform to manage your teams, organizations, and workflow —
            all in one place.
          </p>
          <div className="mt-10 flex items-center gap-3">
            <Button nativeButton={false} size="lg" render={<Link href="/signup" />}>
              Get started free
            </Button>
            <Button nativeButton={false} variant="outline" size="lg" render={<Link href="/login" />}>
              Log in
            </Button>
          </div>
        </div>
      </main>

      <footer className="mx-auto w-full max-w-6xl px-6 py-8 text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Nimfi. All rights reserved.
      </footer>
    </div>
  );
}
