function LoadingState({ label = 'Loading data...' }: { label?: string }) {
  return (
    <div className="glass-panel flex min-h-[240px] flex-col items-center justify-center rounded-3xl border border-coffee-400/45 p-8 text-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-coffee-400/45 border-t-brand-400" />
      <p className="mt-4 text-sm text-coffee-600">{label}</p>
    </div>
  );
}

export default LoadingState;
