interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="glass-panel rounded-3xl border border-dashed border-coffee-400/45 p-10 text-center">
      <h3 className="text-lg font-semibold text-coffee-950">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-coffee-500">{description}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 rounded-xl bg-graphite-800 px-4 py-2 text-sm font-semibold text-cream-50 interactive-lift transition hover:bg-coffee-900"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

export default EmptyState;
