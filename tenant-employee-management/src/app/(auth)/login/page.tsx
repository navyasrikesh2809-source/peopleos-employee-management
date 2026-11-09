import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-4 text-white">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <p className="text-sm font-semibold tracking-wide text-cyan-400">PEOPLEOS</p>
        <h1 className="mt-3 text-3xl font-bold">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-400">Sign-in UI is ready; connect your verified account provisioning flow before enabling public access.</p>
        <div className="mt-6 rounded-lg border border-amber-700/50 bg-amber-950/30 p-4 text-sm text-amber-200">
          Authentication endpoint and secure session utilities are included. Public self-registration is intentionally disabled until email verification and abuse controls are configured.
        </div>
        <Link className="mt-6 inline-block text-sm text-cyan-300 underline" href="/">Back to home</Link>
      </section>
    </main>
  );
}
