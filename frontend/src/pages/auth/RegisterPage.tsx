import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { PageHeader } from '../../components/ui/PageHeader';
import { useAuth } from '../../hooks/useAuth';
import { getFirebaseErrorMessage } from '../../utils/firebaseErrors';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

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
    <section className="space-y-6">
      <PageHeader
        title="Cadastro"
        description="Crie sua conta para acessar o controle financeiro."
      />

      <Card>
        <CardContent className="pt-5">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Nome"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              required
              placeholder="Seu nome"
            />

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
              autoComplete="new-password"
              required
              placeholder="Mínimo 6 caracteres"
            />

            <Input
              label="Confirmar senha"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              required
              placeholder="Repita a senha"
            />

            {error ? (
              <p className="rounded-md border border-danger-border bg-danger-surface px-3 py-2 text-sm text-danger-text">
                {error}
              </p>
            ) : null}

            <Button type="submit" loading={isSubmitting} className="w-full">
              {isSubmitting ? 'Criando conta...' : 'Criar conta'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-sm text-app-muted">
        Já tem conta?{' '}
        <Link className="font-medium text-brand-500" to="/login">
          Entrar
        </Link>
      </p>
    </section>
  );
}
