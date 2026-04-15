import { BarChart3, DatabaseZap, KanbanSquare, LogOut, ShieldCheck, Ticket } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getActiveDataSourceLabel } from '../../services/ticketRepository';

const navigationItems = [
  { to: '/', label: 'Dashboard', icon: BarChart3 },
  { to: '/tickets', label: 'Tickets', icon: Ticket },
  { to: '/kanban', label: 'Kanban', icon: KanbanSquare },
];

function AppShell() {
  const dataSourceLabel = getActiveDataSourceLabel();
  const { user, logout, isLoggingOut } = useAuth();

  return (
    <div className="app-background min-h-screen text-coffee-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col px-4 py-4 lg:flex-row lg:gap-6 lg:px-6">
        <aside className="mb-4 w-full rounded-[28px] border border-graphite-800 bg-graphite-600 p-5 shadow-card lg:sticky lg:top-4 lg:mb-0 lg:h-[calc(100vh-2rem)] lg:w-[280px]">
          <div className="rounded-2xl border border-coffee-400/35 bg-cream-50 px-5 py-6 text-coffee-900 shadow-sm">
            <p className="text-xs uppercase tracking-[0.28em] text-coffee-500">Smart IT</p>
            <div className="mt-3 flex items-center gap-3">
              <Ticket className="h-5 w-5" />
              <h1 className="font-display text-3xl font-semibold leading-none">Ticket Management</h1>
            </div>
          </div>

          <nav className="mt-2 rounded-2xl border border-coffee-400/35 bg-cream-50 px-3 py-4 text-coffee-800 shadow-sm">
            {navigationItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `interactive-lift mb-1 flex items-center gap-3 rounded-xl border px-3 py-3 text-sm last:mb-0 ${
                    isActive
                      ? 'border-graphite-700 bg-graphite-700 text-cream-50 shadow-md'
                      : 'border-transparent text-coffee-700 hover:border-coffee-500/45 hover:bg-cream-200 hover:text-coffee-950'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-4 rounded-2xl border border-cream-100/20 bg-graphite-700/50 p-4 text-cream-100">
            <p className="text-xs uppercase tracking-[0.24em] text-cream-300">Automation</p>
            <p className="mt-2 text-sm leading-6 text-cream-100/90">
              Urgent tickets are escalated to high priority and auto-routed to Admin.
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-cream-100/20 bg-graphite-700/50 p-4">
            <div className="flex items-center gap-3 text-cream-100">
              <div className="rounded-xl bg-cream-50/10 p-2 text-cream-100">
                <DatabaseZap className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-cream-300">Data Source</p>
                <p className="text-sm font-medium text-cream-50">{dataSourceLabel}</p>
              </div>
            </div>
          </div>

          {user ? (
            <div className="mt-4 rounded-2xl border border-cream-100/20 bg-graphite-700/50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cream-50 text-sm font-bold text-coffee-950">
                  {user.avatar}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-cream-50">{user.name}</p>
                  <p className="truncate text-xs text-cream-300">{user.email}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-xl border border-cream-100/20 px-3 py-2">
                <div className="flex items-center gap-2 text-cream-100">
                  <ShieldCheck className="h-4 w-4 text-cream-200" />
                  <span className="text-sm">Role</span>
                </div>
                <span className="rounded-full bg-cream-50 px-3 py-1 text-xs font-semibold text-coffee-900">
                  {user.role}
                </span>
              </div>
              <button
                type="button"
                onClick={() => logout()}
                disabled={isLoggingOut}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-cream-100/20 px-4 py-3 text-sm font-medium text-cream-100 interactive-lift transition hover:border-cream-100 hover:bg-cream-50 hover:text-coffee-950 disabled:opacity-60"
              >
                <LogOut className="h-4 w-4" />
                {isLoggingOut ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          ) : null}
        </aside>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppShell;
