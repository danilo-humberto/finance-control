import { CheckCircle2, AlertCircle } from 'lucide-react';

type AuthMessageProps = {
  tone: 'error' | 'success' | 'info';
  children: string;
};

const toneClasses = {
  error: 'border-danger-border bg-danger-surface text-danger-text',
  success: 'border-success-border bg-success-surface text-success-text',
  info: 'border-brand-800/70 bg-brand-950/30 text-app-muted',
};

export function AuthMessage({ tone, children }: AuthMessageProps) {
  const Icon = tone === 'error' ? AlertCircle : CheckCircle2;

  return (
    <p
      className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-[0.72rem] leading-4 ${toneClasses[tone]}`}
    >
      <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
