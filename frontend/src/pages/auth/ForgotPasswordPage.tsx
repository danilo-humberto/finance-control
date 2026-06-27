import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Info, Mail, ShieldCheck } from 'lucide-react';

import { AuthField } from '@/components/auth/AuthField';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthMessage } from '@/components/auth/AuthMessage';
import { AuthShell } from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { getFirebaseErrorMessage } from '@/utils/firebaseErrors';

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
        'Enviaremos um link para redefinir sua senha para o e-mail informado.',
      );
    } catch (resetError) {
      setError(getFirebaseErrorMessage(resetError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <div className="space-y-6">
        <AuthHeader
          title="Recuperar senha"
          description="Informe seu e-mail e enviaremos as instruções"
          backTo="/login"
          variant="secure"
          icon={ShieldCheck}
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

          {error ? <AuthMessage tone="error">{error}</AuthMessage> : null}
          {successMessage ? (
            <AuthMessage tone="success">{successMessage}</AuthMessage>
          ) : null}

          <Button
            type="submit"
            loading={isSubmitting}
            className="h-11 w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-[0.86rem] text-white shadow-lg shadow-brand-950/30 hover:from-brand-500 hover:to-brand-400"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar instruções'}
          </Button>
        </form>

        {!successMessage ? (
          <AuthMessage tone="info">
            Enviaremos um link para redefinir sua senha para o e-mail informado.
          </AuthMessage>
        ) : null}

        <div className="flex items-center gap-3 text-[0.72rem] text-app-muted">
          <span className="h-px flex-1 bg-app-border" />
          <Info aria-hidden="true" className="h-3.5 w-3.5 text-brand-400" />
          <span className="h-px flex-1 bg-app-border" />
        </div>

        <p className="text-center text-[0.76rem]">
          <Link className="font-semibold text-brand-400" to="/login">
            Voltar para o login
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
