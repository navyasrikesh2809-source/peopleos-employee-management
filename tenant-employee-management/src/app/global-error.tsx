"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="grid min-h-screen place-items-center bg-slate-950 p-8 text-white">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-bold">Application unavailable</h2>
          <p className="mt-3 text-slate-400">A critical error occurred. Please retry or contact your administrator.</p>
          <button onClick={reset} className="mt-5 rounded-lg bg-cyan-400 px-5 py-2 font-semibold text-slate-950">Retry</button>
        </div>
      </body>
    </html>
  );
}
