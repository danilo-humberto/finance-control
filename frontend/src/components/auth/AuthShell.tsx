import { type ReactNode } from 'react';
import { WalletCards } from 'lucide-react';

import { AuthDesktopShowcase } from './AuthDesktopShowcase';

type AuthShellProps = {
  children: ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
  return (
    <section className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md items-center justify-center overflow-hidden rounded-[1.35rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(49,214,103,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(49,214,103,0.18),transparent_30%),#080b0d] px-4 py-6 shadow-2xl shadow-black/45 lg:grid lg:min-h-0 lg:max-w-none lg:grid-cols-12 lg:items-center lg:gap-12 lg:overflow-visible lg:rounded-none lg:border-none lg:bg-none lg:p-0 lg:shadow-none">
      {/* Mobile-only decorative bottom rings */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-16 left-[-18%] h-40 w-64 rotate-12 rounded-[50%] border border-brand-500/25 bg-brand-500/10 blur-sm lg:hidden"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 right-[-22%] h-44 w-72 -rotate-12 rounded-[50%] border border-brand-500/20 bg-brand-700/10 blur-sm lg:hidden"
      />

      {/* Left Column: Desktop Brand Header outside card + Elevated Auth Card */}
      <div className="relative z-10 w-full lg:col-span-5">
        {/* Desktop Top Brand Logo (Outside & Above the Card, as in Option C) */}
        <div className="mb-6 hidden items-center gap-3.5 lg:flex">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-400/35 bg-gradient-to-b from-brand-500/25 to-brand-950/80 text-[#24e578] shadow-[0_0_25px_rgba(36,229,120,0.2)]">
            <WalletCards aria-hidden="true" className="h-7 w-7" />
          </span>
          <p className="text-[1.95rem] font-bold tracking-tight text-white">
            Finance <span className="text-[#24e578]">Control</span>
          </p>
        </div>

        <div className="w-full rounded-2xl border border-app-border bg-app-surface/70 p-4 shadow-xl shadow-black/25 backdrop-blur sm:p-6 lg:rounded-[1.35rem] lg:border-white/10 lg:bg-[linear-gradient(160deg,rgba(19,33,27,0.88),rgba(9,16,13,0.94))] lg:p-8 lg:shadow-[0_24px_60px_rgba(0,0,0,0.65)] lg:backdrop-blur-xl">
          {children}
        </div>
      </div>

      {/* Right Column: Floating Glassmorphic Analytical Showcase (Desktop Only) */}
      <div className="hidden lg:col-span-7 lg:flex lg:items-center lg:justify-center">
        <AuthDesktopShowcase />
      </div>
    </section>
  );
}
