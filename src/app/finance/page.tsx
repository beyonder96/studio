
import { FinancePageContent } from '@/components/finance/finance-page-content';
import { Suspense } from 'react';
import Loading from './loading';

// Force dynamic rendering to ensure fresh data on each visit
export const dynamic = 'force-dynamic';

export default function FinancePage() {
  return (
    <Suspense fallback={<Loading />}>
      <FinancePageContent />
    </Suspense>
  );
}
