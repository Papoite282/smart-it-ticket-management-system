import type { ReactNode } from 'react';

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}

function SectionHeading({ eyebrow, title, description, action }: SectionHeadingProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-[24px] border border-graphite-800 bg-graphite-600 px-7 py-6 text-cream-50 shadow-card md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.32em] text-cream-300/80">{eyebrow}</p>
        <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight text-cream-50">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm text-cream-200/85">{description}</p>
      </div>
      {action}
    </div>
  );
}

export default SectionHeading;
