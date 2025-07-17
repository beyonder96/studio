
'use client';

import { useState, useEffect } from 'react';
import { BalanceCard } from '@/components/dashboard/balance-card';
import { SummaryCard } from '@/components/dashboard/summary-card';
import { ExpensesChart } from '@/components/dashboard/expenses-chart';
import { RecurrencesCard } from '@/components/dashboard/recurrences-card';
import { TransactionsOverview } from '@/components/dashboard/transactions-overview';
import { Badge } from '@/components/ui/badge';
import { Heart } from 'lucide-react';
import { differenceInYears, addYears, differenceInDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AnniversaryBadge = () => {
  const [anniversaryText, setAnniversaryText] = useState('');

  useEffect(() => {
    const savedData = localStorage.getItem('app-profile-data');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      if (parsedData.sinceDate) {
        const startDate = new Date(parsedData.sinceDate);
        const now = new Date();
        const yearsTogether = differenceInYears(now, startDate);
        const nextAnniversary = addYears(startDate, yearsTogether + 1);
        const daysToNextAnniversary = differenceInDays(nextAnniversary, now);
        
        let yearsText = `${yearsTogether} ano${yearsTogether !== 1 ? 's' : ''}`;
        if(yearsTogether === 0){
             const monthsTogether = now.getMonth() - startDate.getMonth() + (12 * (now.getFullYear() - startDate.getFullYear()));
             if(monthsTogether > 0) yearsText = `${monthsTogether} mes${monthsTogether !== 1 ? 'es' : ''}`
             else{
                const daysTogether = differenceInDays(now, startDate);
                yearsText = `${daysTogether} dia${daysTogether !== 1 ? 's' : ''}`
             }
        }

        setAnniversaryText(
          `${yearsText}. Próximo aniversário em ${daysToNextAnniversary} dias.`
        );
      } else {
        setAnniversaryText('Configure seu aniversário no perfil!');
      }
    } else {
       setAnniversaryText('Configure seu aniversário no perfil!');
    }
  }, []);

  if (!anniversaryText) {
    return null; // Or a skeleton loader
  }

  return (
    <Badge variant="outline" className="w-fit gap-2 rounded-full p-2 text-sm font-normal border-pink-500/50 text-pink-600 dark:text-pink-400">
      <Heart className="h-4 w-4 text-pink-500 fill-pink-500" />
      <span>{anniversaryText}</span>
    </Badge>
  );
};


export default function Home() {
  return (
    <div className="flex flex-col gap-6">
       <AnniversaryBadge />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <BalanceCard />
        <SummaryCard type="income" />
        <SummaryCard type="expenses" />
        <RecurrencesCard />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ExpensesChart />
        </div>
        <div className="lg:col-span-1">
          <TransactionsOverview />
        </div>
      </div>
    </div>
  );
}
