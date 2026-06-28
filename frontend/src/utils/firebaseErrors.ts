import { FirebaseError } from 'firebase/app';

const firebaseErrorMessages: Record<string, string> = {
  'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
  'auth/account-exists-with-different-credential':
    'Este e-mail já está cadastrado com outro método de login.',
  'auth/invalid-credential': 'E-mail ou senha inválidos.',
  'auth/invalid-email': 'Informe um e-mail válido.',
  'auth/invalid-login-credentials': 'E-mail ou senha inválidos.',
  'auth/missing-password': 'Informe sua senha.',
  'auth/network-request-failed':
    'Não foi possível conectar agora. Verifique sua internet e tente novamente.',
  'auth/operation-not-allowed':
    'Este método de login ainda não está liberado no Firebase.',
  'auth/popup-blocked':
    'O navegador bloqueou a janela do Google. Libere pop-ups e tente novamente.',
  'auth/cancelled-popup-request':
    'Já existe uma tentativa de login com Google em andamento.',
  'auth/popup-closed-by-user':
    'Login com Google cancelado antes da conclusão.',
  'auth/too-many-requests':
    'Muitas tentativas em pouco tempo. Aguarde um instante e tente novamente.',
  'auth/unauthorized-domain':
    'Este domínio não está autorizado no Firebase Authentication.',
  'auth/user-disabled': 'Esta conta foi desativada.',
  'auth/user-not-found': 'Usuário não encontrado.',
  'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
  'auth/wrong-password': 'Senha incorreta.',
};

export function getFirebaseErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    return (
      firebaseErrorMessages[error.code] ??
      'Não foi possível concluir a ação. Tente novamente em instantes.'
    );
  }

  return 'Não foi possível concluir a ação. Tente novamente em instantes.';
}
