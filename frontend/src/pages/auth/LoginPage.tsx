import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { PageHeader } from '../../components/ui/PageHeader';
import { useAuth } from '../../hooks/useAuth';
import { getFirebaseErrorMessage } from '../../utils/firebaseErrors';

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
    <section className="space-y-6">
      <PageHeader
        title="Login"
        description="Entre com seu e-mail e senha para acessar o Finance Control."
      />

      <Card>
        <CardContent className="pt-5">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="E-mail"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              placeholder="seu@email.com"
            />

            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              placeholder="Sua senha"
            />

            {error ? (
              <p className="rounded-md border border-danger-border bg-danger-surface px-3 py-2 text-sm text-danger-text">
                {error}
              </p>
            ) : null}

            <Button type="submit" loading={isSubmitting} className="w-full">
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-2 text-sm text-app-muted">
        <p>
          Ainda não tem conta?{' '}
          <Link className="font-medium text-brand-500" to="/register">
            Criar conta
          </Link>
        </p>
        <p>
          Esqueceu sua senha?{' '}
          <Link className="font-medium text-brand-500" to="/forgot-password">
            Recuperar senha
          </Link>
        </p>
      </div>
    </section>
  );
}
