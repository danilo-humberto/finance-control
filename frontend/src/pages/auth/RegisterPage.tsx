import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Lock, Mail, User } from 'lucide-react';

import { AuthField } from '@/components/auth/AuthField';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthMessage } from '@/components/auth/AuthMessage';
import { AuthShell } from '@/components/auth/AuthShell';
import { SocialLoginButton } from '@/components/auth/SocialLoginButton';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { getFirebaseErrorMessage } from '@/utils/firebaseErrors';

const passwordRules = [
  {
    label: 'Mínimo de 8 caracteres',
    test: (password: string) => password.length >= 8,
  },
  {
    label: 'Pelo menos 1 número',
    test: (password: string) => /\d/.test(password),
  },
  {
    label: 'Pelo menos 1 letra maiúscula',
    test: (password: string) => /[A-Z]/.test(password),
  },
];

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  return (
    <AuthShell>
      <div className="space-y-5">
        <AuthHeader
          title="Crie sua conta"
          description="Organize suas faturas em poucos minutos"
          backTo="/login"
        />

        <form className="space-y-4" onSubmit={handleSubmit}>
          <AuthField
            label="Nome completo"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            required
            placeholder="Seu nome completo"
            leftIcon={<User aria-hidden="true" className="h-4 w-4" />}
          />

          <AuthField
            label="E-mail"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            placeholder="seu@email.com"
            leftIcon={<Mail aria-hidden="true" className="h-4 w-4" />}
          />

          <AuthField
            label="Senha"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            required
            placeholder="Crie uma senha"
            leftIcon={<Lock aria-hidden="true" className="h-4 w-4" />}
            showPasswordToggle
          />

          <AuthField
            label="Confirmar senha"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            required
            placeholder="Confirme sua senha"
            leftIcon={<Lock aria-hidden="true" className="h-4 w-4" />}
            showPasswordToggle
          />

          <ul className="space-y-1.5">
            {passwordRuleStatus.map((rule) => (
              <li
                key={rule.label}
                className={cn(
                  'flex items-center gap-2 text-[0.7rem] leading-4',
                  rule.isValid ? 'text-brand-400' : 'text-app-muted',
                )}
              >
                <Check aria-hidden="true" className="h-3.5 w-3.5" />
                {rule.label}
              </li>
            ))}
          </ul>

          {error ? <AuthMessage tone="error">{error}</AuthMessage> : null}

          <Button
            type="submit"
            loading={isSubmitting}
            className="h-11 w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-[0.86rem] text-white shadow-lg shadow-brand-950/30 hover:from-brand-500 hover:to-brand-400"
          >
            {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
          </Button>
        </form>

        <div className="flex items-center gap-3 text-[0.72rem] text-app-muted">
          <span className="h-px flex-1 bg-app-border" />
          <span>ou continue com</span>
          <span className="h-px flex-1 bg-app-border" />
        </div>

        <SocialLoginButton onClick={() => console.log('Cadastro com Google')} />

        <p className="text-center text-[0.76rem] text-app-muted">
          Já tem uma conta?{' '}
          <Link className="font-semibold text-brand-400" to="/login">
            Entrar
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
