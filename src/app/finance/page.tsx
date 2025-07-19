
import { FinancePageContent } from '@/components/finance/finance-page-content';
import { Suspense } from 'react';
import Loading from './loading';

export default function FinancePage() {
  return (
    <Suspense fallback={<Loading />}>
      <FinancePageContent />
    </Suspense>
  );
}
