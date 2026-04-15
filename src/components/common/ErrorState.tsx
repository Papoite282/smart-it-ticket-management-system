interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

function ErrorState({
  title = 'Something went wrong',
  description = 'We could not load the latest ticket data.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="glass-panel rounded-3xl border border-rose-500/30 p-8 text-center">
      <h3 className="text-lg font-semibold text-coffee-950">{title}</h3>
      <p className="mt-2 text-sm text-coffee-600">{description}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="interactive-lift mt-4 rounded-xl border border-rose-700 bg-rose-600 px-4 py-2 text-sm font-semibold text-cream-50 transition hover:bg-rose-700"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}

export default ErrorState;
