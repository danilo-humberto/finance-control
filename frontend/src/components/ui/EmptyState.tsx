import { type ReactNode } from 'react';

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
};

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <section className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-app-border bg-app-surface px-6 py-10 text-center">
      {icon ? (
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-app-icon text-brand-400">
          {icon}
        </div>
      ) : null}
      <h2 className="text-base font-semibold text-app-text">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-sm text-sm leading-6 text-app-muted">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </section>
  );
}
