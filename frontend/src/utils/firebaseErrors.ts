import { FirebaseError } from 'firebase/app';

const firebaseErrorMessages: Record<string, string> = {
  'auth/email-already-in-use': 'Este e-mail ja esta cadastrado.',
  'auth/invalid-credential': 'E-mail ou senha invalidos.',
  'auth/invalid-email': 'Informe um e-mail valido.',
  'auth/missing-password': 'Informe sua senha.',
  'auth/too-many-requests':
    'Muitas tentativas em pouco tempo. Aguarde um instante e tente novamente.',
  'auth/user-not-found': 'Usuario nao encontrado.',
  'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
  'auth/wrong-password': 'Senha incorreta.',
};

export function getFirebaseErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    return (
      firebaseErrorMessages[error.code] ??
      'Nao foi possivel concluir a acao. Tente novamente.'
    );
  }

  return 'Nao foi possivel concluir a acao. Tente novamente.';
}
