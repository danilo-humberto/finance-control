import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

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
        'Enviamos as instrucoes de recuperacao para o e-mail informado.',
      );
    } catch (resetError) {
      setError(getFirebaseErrorMessage(resetError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-50">
          Recuperar senha
        </h1>
        <p className="text-sm leading-6 text-slate-400">
          Informe seu e-mail para receber as instrucoes de recuperacao.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-200">E-mail</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            className="h-11 w-full rounded-md border border-slate-800 bg-slate-900 px-3 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-brand-500"
            placeholder="voce@email.com"
          />
        </label>

        {error ? (
          <p className="rounded-md border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        ) : null}

        {successMessage ? (
          <p className="rounded-md border border-brand-900/70 bg-brand-900/30 px-3 py-2 text-sm text-brand-400">
            {successMessage}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-11 w-full rounded-md bg-brand-500 px-4 text-sm font-semibold text-slate-950 transition-colors hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Enviando...' : 'Enviar e-mail'}
        </button>
      </form>

      <p className="text-sm text-slate-400">
        Lembrou a senha?{' '}
        <Link className="font-medium text-brand-400" to="/login">
          Voltar para login
        </Link>
      </p>
    </section>
  );
}
