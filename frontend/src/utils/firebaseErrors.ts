import { FirebaseError } from 'firebase/app';

const firebaseErrorMessages: Record<string, string> = {
  'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
  'auth/invalid-credential': 'E-mail ou senha inválidos.',
  'auth/invalid-email': 'Informe um e-mail válido.',
  'auth/missing-password': 'Informe sua senha.',
  'auth/too-many-requests':
    'Muitas tentativas em pouco tempo. Aguarde um instante e tente novamente.',
  'auth/user-not-found': 'Usuário não encontrado.',
  'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
  'auth/wrong-password': 'Senha incorreta.',
};

export function getFirebaseErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    return (
      firebaseErrorMessages[error.code] ??
      'Não foi possível concluir a ação. Tente novamente.'
    );
  }

  return 'Não foi possível concluir a ação. Tente novamente.';
}
