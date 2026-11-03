import { LoaderCircle } from 'lucide-react';

import googleLogoIcon from '@/assets/google_logo_icon.webp';

type SocialLoginButtonProps = {
  loading?: boolean;
  onClick?: () => void;
};

export function SocialLoginButton({
  loading = false,
  onClick,
}: SocialLoginButtonProps) {
  return (
    <button
      type="button"
      disabled={loading}
      onClick={onClick}
      className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-app-border bg-app-bg/35 px-4 text-[0.82rem] font-semibold text-app-text transition-colors hover:bg-app-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-60 lg:h-12 lg:rounded-full lg:border-white/15 lg:bg-white/[0.03] lg:text-[0.88rem] lg:text-white lg:hover:bg-white/[0.07]"
    >
      {loading ? (
        <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
      ) : (
        <img
          aria-hidden="true"
          src={googleLogoIcon}
          alt=""
          className="h-5 w-5 shrink-0"
        />
      )}
      {loading ? 'Conectando...' : 'Continuar com Google'}
    </button>
  );
}
