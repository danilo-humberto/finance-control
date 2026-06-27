import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { PageHeader } from '../../components/ui/PageHeader';
import { useAuth } from '../../hooks/useAuth';
import { getFirebaseErrorMessage } from '../../utils/firebaseErrors';

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      await resetPassword(email);
      setSuccessMessage(
        'Enviamos as instruções de recuperação para o e-mail informado.',
      );
    } catch (resetError) {
      setError(getFirebaseErrorMessage(resetError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Recuperar senha"
        description="Informe seu e-mail para receber as instruções de recuperação."
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

            {error ? (
              <p className="rounded-md border border-danger-border bg-danger-surface px-3 py-2 text-sm text-danger-text">
                {error}
              </p>
            ) : null}

            {successMessage ? (
              <p className="rounded-md border border-success-border bg-success-surface px-3 py-2 text-sm text-success-text">
                {successMessage}
              </p>
            ) : null}

            <Button type="submit" loading={isSubmitting} className="w-full">
              {isSubmitting ? 'Enviando...' : 'Enviar e-mail'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-sm text-app-muted">
        Lembrou a senha?{' '}
        <Link className="font-medium text-brand-500" to="/login">
          Voltar para login
        </Link>
      </p>
    </section>
  );
}
