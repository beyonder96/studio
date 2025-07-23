
'use client';

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowUpRight, Loader2 } from "lucide-react";
import { useContext, useState, useEffect, useMemo } from "react";
import { FinanceContext, Wish, Goal } from "@/contexts/finance-context";
import Link from "next/link";
import { differenceInDays, parseISO, startOfToday, addDays, getMonth, getDate, differenceInYears, format } from "date-fns";
import { useAuth } from "@/contexts/auth-context";
import { getDatabase, ref, onValue } from 'firebase/database';
import { app as firebaseApp } from '@/lib/firebase';
import { generateCelebrationPlan, GenerateCelebrationPlanOutput } from "@/ai/flows/generate-celebration-plan-flow";
import { generateFinancialInsight, GenerateFinancialInsightOutput } from "@/ai/flows/generate-financial-insight-flow";

type Insight = {
  text: string;
  link: string;
  buttonText: string;
  source: string;
  data?: any;
};

type ProfileData = {
  names?: string;
  sinceDate?: string;
  birthday1?: string;
  birthday2?: string;
  food?: string;
  place?: string;
  location?: string;
};

export function CopilotCard() {
  const { pantryItems, tasks, goals, memories, transactions, wishes } = useContext(FinanceContext);
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [currentInsight, setCurrentInsight] = useState<Insight | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [celebrationPlan, setCelebrationPlan] = useState<GenerateCelebrationPlanOutput | null>(null);
  const [financialInsight, setFinancialInsight] = useState<GenerateFinancialInsightOutput | null>(null);

  useEffect(() => {
    if (user) {
      const db = getDatabase(firebaseApp);
      const profileRef = ref(db, `users/${user.uid}/profile`);
      const unsubscribe = onValue(profileRef, (snapshot) => {
        const data = snapshot.val();
        setProfileData(data || {});
      });
      return () => unsubscribe();
    }
  }, [user]);

  const financialHistory = useMemo(() => {
      const history: { month: string, total: number, categories: Record<string, number> }[] = [];
      const now = new Date();
      for (let i = 2; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthKey = format(date, 'yyyy-MM');
          const monthTransactions = transactions.filter(t => t.type === 'expense' && t.date.startsWith(monthKey));
          
          const categories = monthTransactions.reduce((acc, t) => {
              acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
              return acc;
          }, {} as Record<string, number>);

          const total = monthTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
          history.push({ month: format(date, 'MMMM'), total, categories });
      }
      return history;
  }, [transactions]);


  useEffect(() => {
    const generateInsights = async () => {
        if (!profileData) return;
        setIsLoading(true);

        const potentialInsights: Insight[] = [];
        const today = startOfToday();

        // 1. Anniversary/Birthday Insight
        const specialDates = [];
        const [name1, name2] = (profileData.names || 'Pessoa 1 & Pessoa 2').split(' & ');
        if (profileData.sinceDate) specialDates.push({ date: parseISO(profileData.sinceDate), type: 'Aniversário de Namoro', name: 'de vocês' });
        if (profileData.birthday1) specialDates.push({ date: parseISO(profileData.birthday1), type: 'Aniversário', name: `de ${name1}` });
        if (profileData.birthday2) specialDates.push({ date: parseISO(profileData.birthday2), type: 'Aniversário', name: `de ${name2}` });

        for (const specialDate of specialDates) {
            const dateThisYear = new Date(today.getFullYear(), getMonth(specialDate.date), getDate(specialDate.date));
            const daysUntil = differenceInDays(dateThisYear, today);
            if (daysUntil > 0 && daysUntil <= 30) {
                 potentialInsights.push({
                    text: `O ${specialDate.type} ${specialDate.name} está chegando em ${daysUntil} dias!`,
                    link: '/discover',
                    buttonText: 'Planejar comemoração',
                    source: 'celebration',
                    data: { dateType: specialDate.type, personName: specialDate.name }
                });
            }
        }
        
        // 2. Financial Insight (Check-up mensal)
        potentialInsights.push({
            text: 'Que tal um check-up financeiro deste mês?',
            link: '/finance',
            buttonText: 'Analisar Finanças',
            source: 'finance'
        });

        // 3. Goal Insight
        const nextGoal = goals.find(goal => !goal.completed);
        if (nextGoal) {
            potentialInsights.push({
                text: `Continuem economizando para a próxima meta de vocês: ${nextGoal.name}!`,
                link: '/goals',
                buttonText: 'Ver Metas',
                source: 'goals'
            });
        }
        
        // 4. Memory Insight
        const pastMemories = memories.filter(m => new Date(m.date) < new Date());
        if (pastMemories.length > 0) {
            const randomMemory = pastMemories[Math.floor(Math.random() * pastMemories.length)];
            const yearsAgo = differenceInYears(new Date(), parseISO(randomMemory.date));
             potentialInsights.push({
                text: yearsAgo > 0 ? `Lembram de quando ${randomMemory.title.toLowerCase()} há ${yearsAgo} ano(s)?` : `Que tal relembrar o dia em que ${randomMemory.title.toLowerCase()}?`,
                link: '/timeline',
                buttonText: 'Ver Linha do Tempo',
                source: 'memory'
            });
        }

        const randomIndex = Math.floor(Math.random() * potentialInsights.length);
        setCurrentInsight(potentialInsights[randomIndex]);
        setIsLoading(false);
    }
    
    if (profileData) {
        generateInsights();
    }
  }, [profileData, goals, memories, financialHistory, wishes]);
  
  const handleButtonClick = async () => {
    if (!currentInsight || !profileData) return;
    
    setCelebrationPlan(null);
    setFinancialInsight(null);
    setIsLoading(true);

    try {
        if (currentInsight.source === 'celebration') {
            const plan = await generateCelebrationPlan({
                dateType: currentInsight.data.dateType,
                personName: currentInsight.data.personName,
                wishList: wishes.map(w => ({ name: w.name, price: w.price })),
                couplePreferences: {
                    favoriteFood: profileData.food || '',
                    favoritePlace: profileData.place || '',
                }
            });
            setCelebrationPlan(plan);
        }
        
        if (currentInsight.source === 'finance') {
            const getGoalProgress = (goal: Goal) => {
                if (!goal.targetAmount || goal.targetAmount === 0) return 0;
                return Math.round((goal.currentAmount / goal.targetAmount) * 100);
            };

            const insight = await generateFinancialInsight({
                financialHistory,
                goals: goals.filter(g => !g.completed).map(g => ({ name: g.name, progress: getGoalProgress(g) })),
            });
            setFinancialInsight(insight);
        }
    } catch (error) {
        console.error("Error generating insight:", error);
        toast({
            variant: "destructive",
            title: "Erro do Copilot",
            description: "Não foi possível gerar a sugestão no momento.",
        });
    } finally {
        setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
        return <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />;
    }
    if (celebrationPlan) {
        return (
            <div className="text-sm space-y-2">
                <p className="font-semibold">{celebrationPlan.title}</p>
                <p className="text-xs text-muted-foreground">{celebrationPlan.description}</p>
            </div>
        )
    }
    if (financialInsight) {
         return (
            <div className="text-sm space-y-2">
                <p className="font-semibold">{financialInsight.title}</p>
                <p className="text-xs text-muted-foreground">{financialInsight.insight}</p>
            </div>
        )
    }
    return <p className="text-foreground/80">{currentInsight?.text}</p>;
  }
  
  const getButtonText = () => {
      if (isLoading) return "Gerando...";
      if (celebrationPlan || financialInsight) return "Ver Sugestão Completa";
      return currentInsight?.buttonText || "Saber mais";
  }
  
  const getButtonLink = () => {
      if (celebrationPlan) return '/discover';
      if (financialInsight) return '/finance';
      return currentInsight?.link || '/';
  }


  if (!currentInsight && !isLoading) {
    return null; // Or a fallback card
  }

  return (
    <Card className="bg-white/10 dark:bg-black/10 border-none shadow-none flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <CardTitle className="text-base font-semibold text-primary">
            Copilot
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex items-center">
        {renderContent()}
      </CardContent>
      <CardFooter>
        {currentInsight?.source === 'celebration' || currentInsight?.source === 'finance' ? (
           (celebrationPlan || financialInsight) ? (
                <Button asChild variant="outline" className="w-full bg-transparent border-primary/50 text-primary hover:bg-primary/10 hover:text-primary">
                    <Link href={getButtonLink()}>
                        {getButtonText()} <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            ) : (
                <Button onClick={handleButtonClick} disabled={isLoading} variant="outline" className="w-full bg-transparent border-primary/50 text-primary hover:bg-primary/10 hover:text-primary">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : currentInsight.buttonText}
                </Button>
            )
        ) : (
            <Button asChild variant="outline" className="w-full bg-transparent border-primary/50 text-primary hover:bg-primary/10 hover:text-primary">
            <Link href={getButtonLink()}>
                {getButtonText()} <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}

    