type SocialLoginButtonProps = {
  onClick?: () => void;
};

export function SocialLoginButton({ onClick }: SocialLoginButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-app-border bg-app-bg/35 px-4 text-[0.82rem] font-semibold text-app-text transition-colors hover:bg-app-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      <span
        aria-hidden="true"
        className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[0.8rem] font-bold text-[#4285f4]"
      >
        G
      </span>
      Continuar com Google
    </button>
  );
}
