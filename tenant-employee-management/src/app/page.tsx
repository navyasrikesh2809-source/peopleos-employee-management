import Link from "next/link";

const modules = [
  ["01", "Organization isolation", "Tenant-scoped data access with PostgreSQL row-level security."],
  ["02", "People directory", "Validated employee records, filters and paginated APIs."],
  ["03", "Workforce operations", "Domain models for attendance, leave, payroll and reviews."],
  ["04", "Security foundation", "Revocable sessions, explicit RBAC and audit event support."]
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-7">
        <span className="text-lg font-black tracking-tight text-white">PEOPLE<span className="text-cyan-400">OS</span></span>
        <Link href="/login" className="rounded-full border border-slate-700 px-5 py-2 text-sm hover:border-cyan-400">Sign in</Link>
      </nav>
      <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-16 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[.25em] text-cyan-400">Multi-tenant workforce platform</p>
          <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[1.05] tracking-tight text-white md:text-7xl">People operations, <span className="text-cyan-400">built on trust.</span></h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">A secure foundation for managing employees, organizations and workforce workflows with tenant-aware authorization.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/login" className="rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-slate-950 hover:bg-cyan-300">Open workspace</Link>
            <a href="/api/health" className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-white hover:border-slate-500">System health</a>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-7 shadow-2xl">
          <div className="flex items-center justify-between"><span className="text-sm text-slate-400">Platform foundation</span><span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">Architecture scaffold</span></div>
          <div className="mt-8 grid grid-cols-2 gap-3">
            {modules.map(([n, title, desc]) => <div key={n} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4"><span className="text-xs text-cyan-400">{n}</span><h2 className="mt-3 font-semibold text-white">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-400">{desc}</p></div>)}
          </div>
        </div>
      </section>
      <footer className="border-t border-slate-900 px-6 py-6 text-center text-xs text-slate-500">PeopleOS · Secure by architecture, not by convention.</footer>
    </main>
  );
}
