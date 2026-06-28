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
      className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-app-border bg-app-bg/35 px-4 text-[0.82rem] font-semibold text-app-text transition-colors hover:bg-app-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
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
