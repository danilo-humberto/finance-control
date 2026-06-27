import { type ReactNode } from 'react';

type AuthShellProps = {
  children: ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
  return (
    <section className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md items-center justify-center overflow-hidden rounded-[1.35rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(49,214,103,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(49,214,103,0.18),transparent_30%),#080b0d] px-4 py-6 shadow-2xl shadow-black/45">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-16 left-[-18%] h-40 w-64 rotate-12 rounded-[50%] border border-brand-500/25 bg-brand-500/10 blur-sm"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 right-[-22%] h-44 w-72 -rotate-12 rounded-[50%] border border-brand-500/20 bg-brand-700/10 blur-sm"
      />

      <div className="relative z-10 w-full rounded-2xl border border-app-border bg-app-surface/70 p-4 shadow-xl shadow-black/25 backdrop-blur">
        {children}
      </div>
    </section>
  );
}
