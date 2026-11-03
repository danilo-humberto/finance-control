import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Lock, Mail, User } from 'lucide-react';

import { AuthField } from '@/components/auth/AuthField';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthMessage } from '@/components/auth/AuthMessage';
import { AuthModeSwitch } from '@/components/auth/AuthModeSwitch';
import { AuthShell } from '@/components/auth/AuthShell';
import { SocialLoginButton } from '@/components/auth/SocialLoginButton';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { getFirebaseErrorMessage } from '@/utils/firebaseErrors';

const passwordRules = [
  {
    label: 'Mínimo de 8 caracteres',
    shortLabel: '8+ caracteres',
    test: (password: string) => password.length >= 8,
  },
  {
    label: 'Pelo menos 1 número',
    shortLabel: '1 número',
    test: (password: string) => /\d/.test(password),
  },
  {
    label: 'Pelo menos 1 letra maiúscula',
    shortLabel: '1 maiúscula',
    test: (password: string) => /[A-Z]/.test(password),
  },
];

export function RegisterPage() {
  const navigate = useNavigate();
  const { loginWithGoogle, register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const passwordRuleStatus = passwordRules.map((rule) => ({
    ...rule,
    isValid: rule.test(password),
  }));
  const hasValidPassword = passwordRuleStatus.every((rule) => rule.isValid);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!hasValidPassword) {
      setError('A senha precisa atender aos requisitos mínimos.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas precisam ser iguais.');
      return;
    }

    setIsSubmitting(true);

    try {
      await register(name, email, password);
      navigate('/', { replace: true });
    } catch (registerError) {
      setError(getFirebaseErrorMessage(registerError));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleRegister() {
    setError('');
    setIsGoogleSubmitting(true);

    try {
      await loginWithGoogle();
      navigate('/', { replace: true });
    } catch (registerError) {
      setError(getFirebaseErrorMessage(registerError));
    } finally {
      setIsGoogleSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <div className="space-y-4">
        <AuthHeader
          title="Crie sua conta"
          description="Organize suas faturas em poucos minutos"
        />

        <AuthModeSwitch activeMode="register" />

        <form className="space-y-3" onSubmit={handleSubmit}>
          <AuthField
            label="Nome completo"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            required
            placeholder="Nome completo"
            leftIcon={<User aria-hidden="true" className="h-4 w-4" />}
          />

          <AuthField
            label="E-mail"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            placeholder="E-mail"
            leftIcon={<Mail aria-hidden="true" className="h-4 w-4" />}
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <AuthField
              label="Senha"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              required
              placeholder="Senha"
              leftIcon={<Lock aria-hidden="true" className="h-4 w-4" />}
              showPasswordToggle
            />

            <AuthField
              label="Confirmar senha"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              required
              placeholder="Confirmar senha"
              leftIcon={<Lock aria-hidden="true" className="h-4 w-4" />}
              showPasswordToggle
            />
          </div>

          <ul className="space-y-1.5 sm:flex sm:flex-wrap sm:items-center sm:gap-2 sm:space-y-0">
            {passwordRuleStatus.map((rule) => (
              <li
                key={rule.label}
                className={cn(
                  'flex items-center gap-1.5 text-[0.7rem] leading-4 sm:rounded-full sm:border sm:px-2.5 sm:py-1',
                  rule.isValid
                    ? 'text-[#24e578] sm:border-[#24e578]/40 sm:bg-[#24e578]/10'
                    : 'text-app-muted sm:border-white/10 sm:bg-white/[0.03]',
                )}
              >
                <Check aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                <span className="sm:hidden">{rule.label}</span>
                <span className="hidden sm:inline">{rule.shortLabel}</span>
              </li>
            ))}
          </ul>

          {error ? <AuthMessage tone="error">{error}</AuthMessage> : null}

          <Button
            type="submit"
            loading={isSubmitting}
            className="h-11 w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-[0.86rem] text-white shadow-lg shadow-brand-950/30 hover:from-brand-500 hover:to-brand-400 lg:h-12 lg:rounded-full lg:bg-[#24e578] lg:bg-none lg:text-[0.92rem] lg:font-bold lg:text-slate-950 lg:shadow-[0_0_24px_rgba(36,229,120,0.35)] lg:hover:bg-[#34f586]"
          >
            {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
          </Button>
        </form>

        <div className="flex items-center gap-3 text-[0.72rem] text-app-muted lg:hidden">
          <span className="h-px flex-1 bg-app-border" />
          <span>ou continue com</span>
          <span className="h-px flex-1 bg-app-border" />
        </div>

        <SocialLoginButton
          loading={isGoogleSubmitting}
          onClick={handleGoogleRegister}
        />

        <p className="text-center text-[0.76rem] text-app-muted lg:text-[0.82rem]">
          Já tem uma conta?{' '}
          <Link
            className="font-semibold text-brand-400 lg:text-white lg:underline lg:decoration-white/30 lg:underline-offset-4 lg:hover:text-[#24e578]"
            to="/login"
          >
            Entrar
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
