import { NavLink } from "react-router";

const links = [
  { to: "/dashboard", label: "Dashboard", end: true},
  { to: "/transactions", label: "Transakcje", end: false },
  { to: "/budgets", label: "Budżety", end: false },
] as const;

export default function Sidebar() {
  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex items-center gap-3 px-5 py-6">
        <div
          className="flex size-10 items-center justify-center rounded-xl bg-primary text-sm font-semibold tracking-tight text-white"
          aria-hidden
        >
          Ft
        </div>
        <div>
          <h2 className="text-[15px] font-semibold leading-tight text-text">
            Finance tracker
          </h2>
          <p className="mt-0.5 text-xs text-text/50">Panel finansowy</p>
        </div>
      </div>

      <nav className="flex-1 px-3">
        <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-text/40">
          Menu
        </p>
        <ul className="flex flex-col gap-1">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  [
                    "flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "text-text/70 hover:bg-primary-soft hover:text-primary",
                  ].join(" ")
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-border px-5 py-4">
        <p className="text-xs font-medium text-text/70">Konto lokalne</p>
        <p className="mt-0.5 text-xs text-text/40">Dane ćwiczeniowe</p>
      </div>
    </aside>
  );
}
