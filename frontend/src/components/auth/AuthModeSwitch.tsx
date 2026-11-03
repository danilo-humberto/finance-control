import { Link } from 'react-router-dom';

import { cn } from '@/lib/utils';

type AuthModeSwitchProps = {
  activeMode: 'login' | 'register';
};

export function AuthModeSwitch({ activeMode }: AuthModeSwitchProps) {
  return (
    <nav
      aria-label="Alternar modo de autenticação"
      className="grid grid-cols-2 rounded-xl border border-app-border bg-app-bg/55 p-1 lg:rounded-full lg:border-white/10 lg:bg-[#070d0a]"
    >
      <Link
        to="/login"
        aria-current={activeMode === 'login' ? 'page' : undefined}
        className={cn(
          'flex h-9 items-center justify-center rounded-lg text-[0.78rem] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 lg:rounded-full',
          activeMode === 'login'
            ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-md shadow-brand-950/40 lg:bg-[#24e578] lg:bg-none lg:font-bold lg:text-slate-950'
            : 'text-app-muted hover:text-app-text',
        )}
      >
        Entrar
      </Link>
      <Link
        to="/register"
        aria-current={activeMode === 'register' ? 'page' : undefined}
        className={cn(
          'flex h-9 items-center justify-center rounded-lg text-[0.78rem] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 lg:rounded-full',
          activeMode === 'register'
            ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-md shadow-brand-950/40 lg:bg-[#24e578] lg:bg-none lg:font-bold lg:text-slate-950'
            : 'text-app-muted hover:text-app-text',
        )}
      >
        Criar conta
      </Link>
    </nav>
  );
}
