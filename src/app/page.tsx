import Link from "next/link";

export default function RootPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
      <div className="max-w-md text-center space-y-8">
        <h1 className="text-4xl font-extrabold tracking-tighter">WTN 2026</h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400">
          Authorized Personnel Only.
        </p>
        
        <div className="flex flex-col gap-4">
          <Link 
            href="/prototype"
            className="inline-flex h-12 items-center justify-center rounded-md bg-zinc-900 px-8 text-sm font-medium text-zinc-50 shadow transition-colors hover:bg-zinc-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90 dark:focus-visible:ring-zinc-300"
          >
            Access Exam Prototype
          </Link>
          
          <Link
            href="/whitelist"
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 underline underline-offset-4"
          >
            IT Configuration Info
          </Link>
        </div>
      </div>
    </div>
  );
}
