import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';

import { AuthField } from '@/components/auth/AuthField';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthMessage } from '@/components/auth/AuthMessage';
import { AuthShell } from '@/components/auth/AuthShell';
import { SocialLoginButton } from '@/components/auth/SocialLoginButton';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { getFirebaseErrorMessage } from '@/utils/firebaseErrors';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (loginError) {
      setError(getFirebaseErrorMessage(loginError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <div className="space-y-6">
        <AuthHeader
          title="Bem-vindo de volta"
          description="Entre para acompanhar suas faturas e movimentações"
        />

        <form className="space-y-4" onSubmit={handleSubmit}>
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

          <div className="space-y-2">
            <AuthField
              label="Senha"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              placeholder="Digite sua senha"
              leftIcon={<Lock aria-hidden="true" className="h-4 w-4" />}
              showPasswordToggle
            />

            <div className="flex justify-end">
              <Link
                className="text-[0.74rem] font-semibold text-brand-400 transition-colors hover:text-brand-300"
                to="/forgot-password"
              >
                Esqueceu sua senha?
              </Link>
            </div>
          </div>

          {error ? <AuthMessage tone="error">{error}</AuthMessage> : null}

          <Button
            type="submit"
            loading={isSubmitting}
            className="h-11 w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-[0.86rem] text-white shadow-lg shadow-brand-950/30 hover:from-brand-500 hover:to-brand-400"
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <div className="flex items-center gap-3 text-[0.72rem] text-app-muted">
          <span className="h-px flex-1 bg-app-border" />
          <span>ou continue com</span>
          <span className="h-px flex-1 bg-app-border" />
        </div>

        <SocialLoginButton onClick={() => console.log('Login com Google')} />

        <p className="text-center text-[0.76rem] text-app-muted">
          Ainda não tem uma conta?{' '}
          <Link className="font-semibold text-brand-400" to="/register">
            Cadastre-se
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
