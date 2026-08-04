import { useNavigate, useParams } from 'react-router-dom';

import { TransactionFormController } from '@/components/transactions/TransactionFormController';

export function NewTransactionPage() {
  const navigate = useNavigate();
  const { transactionId } = useParams<{ transactionId: string }>();

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/');
  }

  return (
    <TransactionFormController
      transactionId={transactionId}
      onCancel={handleBack}
      onSuccess={() => navigate('/transactions')}
    />
  );
}
