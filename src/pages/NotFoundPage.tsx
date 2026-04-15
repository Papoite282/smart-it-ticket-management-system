import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="glass-panel max-w-lg rounded-[32px] border border-coffee-400/45 p-8 text-center">
        <p className="text-xs uppercase tracking-[0.28em] text-coffee-600">404</p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-coffee-900">Page not found</h1>
        <p className="mt-3 text-sm text-coffee-500">
          The route you requested does not exist in this Smart IT workspace.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-2xl bg-graphite-800 px-4 py-3 text-sm font-semibold text-cream-50 interactive-lift transition hover:bg-coffee-900"
        >
          Return to dashboard
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
