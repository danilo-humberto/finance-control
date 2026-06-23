import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-50">Login</h1>
        <p className="text-sm leading-6 text-slate-400">
          Entre com seu e-mail e senha para acessar o Finance Control.
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

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-200">Senha</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            className="h-11 w-full rounded-md border border-slate-800 bg-slate-900 px-3 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-brand-500"
            placeholder="Sua senha"
          />
        </label>

        {error ? (
          <p className="rounded-md border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-11 w-full rounded-md bg-brand-500 px-4 text-sm font-semibold text-slate-950 transition-colors hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <div className="space-y-2 text-sm text-slate-400">
        <p>
          Ainda nao tem conta?{' '}
          <Link className="font-medium text-brand-400" to="/register">
            Criar conta
          </Link>
        </p>
        <p>
          Esqueceu sua senha?{' '}
          <Link className="font-medium text-brand-400" to="/forgot-password">
            Recuperar senha
          </Link>
        </p>
      </div>
    </section>
  );
}
