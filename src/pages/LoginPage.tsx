import { useEffect, useState } from 'react';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginError, isLoggingIn, demoUsers, hydrated, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('admin@smartit.local');
  const [password, setPassword] = useState('admin123');

  const redirectPath = (location.state as { from?: string } | null)?.from || '/';

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
  }, [hydrated, isAuthenticated, navigate, redirectPath]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await login({ email, password });
      navigate(redirectPath, { replace: true });
    } catch {
      // Error state is surfaced by the mutation result.
    }
  }

  function autofill(emailValue: string, passwordValue: string) {
    setEmail(emailValue);
    setPassword(passwordValue);
  }

  return (
    <div className="app-background min-h-screen px-4 py-10 text-coffee-900">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="glass-panel flex flex-col justify-between rounded-[32px] border border-coffee-400/45 p-8 shadow-card lg:p-10">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-coffee-600">Secure Workspace</p>
            <h1 className="mt-4 max-w-xl font-display text-5xl font-semibold tracking-tight text-coffee-900 lg:text-6xl">
              Smart IT Ticket Management with role-aware access control.
            </h1>
            <p className="mt-4 max-w-2xl text-base text-coffee-600">
              Sign in as an admin, agent, or viewer to experience permission-based ticket operations and protected routes.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-brand-500/20 bg-brand-500/10 p-5">
              <ShieldCheck className="h-5 w-5 text-coffee-600" />
              <h3 className="mt-4 text-lg font-semibold text-coffee-950">Role-based controls</h3>
              <p className="mt-2 text-sm text-coffee-600">
                Admins manage everything, agents operate the workflow, and viewers stay read-only.
              </p>
            </div>
            <div className="rounded-3xl border border-coffee-500/45 bg-cream-50/82 p-5">
              <LockKeyhole className="h-5 w-5 text-emerald-700" />
              <h3 className="mt-4 text-lg font-semibold text-coffee-950">Protected navigation</h3>
              <p className="mt-2 text-sm text-coffee-600">
                Dashboard, tickets, and kanban routes now require an authenticated session.
              </p>
            </div>
          </div>
        </section>

        <section className="glass-panel rounded-[32px] border border-coffee-400/45 p-8 shadow-card">
          <p className="text-xs uppercase tracking-[0.3em] text-coffee-600">Sign In</p>
          <h2 className="mt-3 font-display text-4xl font-semibold text-coffee-900">Access your workspace</h2>
          <p className="mt-2 text-sm text-coffee-500">Use one of the demo accounts below or enter the credentials manually.</p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm text-coffee-600">Email</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-coffee-400/45 bg-cream-50 px-4 py-3 text-sm text-coffee-950 outline-none transition focus:border-brand-500"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-coffee-600">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-coffee-400/45 bg-cream-50 px-4 py-3 text-sm text-coffee-950 outline-none transition focus:border-brand-500"
              />
            </label>

            {loginError ? (
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-700">
                {(loginError as Error).message}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full rounded-2xl bg-graphite-800 px-4 py-3 text-sm font-semibold text-cream-50 interactive-lift transition hover:bg-coffee-900 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoggingIn ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 space-y-3">
            <p className="text-xs uppercase tracking-[0.28em] text-coffee-400">Demo Accounts</p>
            {demoUsers.map((user) => {
              const passwordByRole = {
                ADMIN: 'admin123',
                AGENT: 'agent123',
                VIEWER: 'viewer123',
              } as const;

              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => autofill(user.email, passwordByRole[user.role])}
                  className="interactive-lift group flex w-full items-center justify-between rounded-2xl border border-coffee-500/45 bg-cream-50/82 px-4 py-3 text-left transition hover:border-graphite-700 hover:bg-graphite-700 hover:text-cream-50"
                >
                  <div>
                    <p className="text-sm font-semibold group-hover:text-cream-50 text-coffee-950">{user.name}</p>
                    <p className="text-xs text-coffee-500 group-hover:text-cream-200">{user.email}</p>
                  </div>
                  <span className="rounded-full bg-cream-100 px-3 py-1 text-xs font-semibold text-coffee-700 group-hover:bg-cream-50 group-hover:text-coffee-950">
                    {user.role}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

export default LoginPage;