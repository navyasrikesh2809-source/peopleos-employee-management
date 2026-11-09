"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-[60vh] place-items-center p-8">
      <div className="max-w-md text-center">
        <h2 className="text-2xl font-bold">Something went wrong</h2>
        <p className="mt-2 text-slate-400">The request could not be completed. Your data has not been intentionally discarded.</p>
        <button onClick={reset} className="mt-5 rounded-lg bg-cyan-400 px-5 py-2 font-semibold text-slate-950">Try again</button>
      </div>
    </main>
  );
}
