import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { type PaymentMode } from '@/components/transactions/PaymentMethodCard';
import { TransactionFormController } from '@/components/transactions/TransactionFormController';

type NewTransactionLocationState = {
  initialPaymentMode?: PaymentMode;
} | null;

export function NewTransactionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { transactionId } = useParams<{ transactionId: string }>();
  const locationState = location.state as NewTransactionLocationState;
  const initialPaymentMode = locationState?.initialPaymentMode;

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/');
  }

  return (
    <TransactionFormController
      initialPaymentMode={initialPaymentMode}
      transactionId={transactionId}
      onCancel={handleBack}
      onSuccess={() => navigate('/transactions')}
    />
  );
}
