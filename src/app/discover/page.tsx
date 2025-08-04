
'use client';

import { useState, useContext, useMemo, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Utensils, Plane, Heart, Lightbulb, Loader2, Sparkles, Copy, ShoppingCart, Star, Building, MapPin as VenueIcon, Briefcase } from 'lucide-react';
import { generateRecipeSuggestion, GenerateRecipeOutput } from '@/ai/flows/generate-recipe-flow';
import { generateTripPlan, GenerateTripPlanOutput } from '@/ai/flows/generate-trip-plan-flow';
import { generateDateIdea, GenerateDateIdeaOutput } from '@/ai/flows/generate-date-idea-flow';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { FinanceContext } from '@/contexts/finance-context';
import { useAuth } from '@/contexts/auth-context';
import { getDatabase, ref, onValue } from 'firebase/database';
import { app as firebaseApp } from '@/lib/firebase';
import { CurrencyInput } from '@/components/finance/currency-input';
import { Badge } from '@/components/ui/badge';

type SuggestionCategory = 'recipe' | 'trip' | 'date';
type ResultType = GenerateRecipeOutput | GenerateTripPlanOutput | GenerateDateIdeaOutput;
type HistoryItem = { title: string; content: ResultType; };

const suggestionCards = [
  {
    id: 'recipe',
    title: 'Sugestão de Receita',
    description: 'Não sabe o que cozinhar? Deixe a IA sugerir uma receita com base nos seus ingredientes.',
    icon: <Utensils className="h-8 w-8 text-primary" />,
    placeholder: 'Ex: "algo rápido com frango"',
  },
  {
    id: 'trip',
    title: 'Planejador de Viagem',
    description: 'Planeje a próxima escapada de vocês, desde o destino até o roteiro.',
    icon: <Plane className="h-8 w-8 text-primary" />,
    placeholder: 'Ex: "um fim de semana relaxante na praia"',
  },
  {
    id: 'date',
    title: 'Orquestrador de Encontros',
    description: 'Planeje um encontro completo, com ideias, reservas e tarefas.',
    icon: <Heart className="h-8 w-8 text-primary" />,
    placeholder: 'Ex: "um encontro para sábado à noite"',
  },
];

export default function DiscoverPage() {
  const [activeSuggestion, setActiveSuggestion] = useState<SuggestionCategory | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ResultType | null>(null);
  const [usePantry, setUsePantry] = useState(false);
  const [tripBudget, setTripBudget] = useState<number | undefined>(undefined);
  const [dateBudget, setDateBudget] = useState<number | undefined>(undefined);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [profileData, setProfileData] = useState<{ favoritePlace?: string, location?: string, favoriteFood?: string }>({});
  const { toast } = useToast();
  const { pantryItems, handleAddItemToList } = useContext(FinanceContext);
  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      const db = getDatabase(firebaseApp);
      const profileRef = ref(db, `users/${user.uid}/profile`);
      const unsubscribe = onValue(profileRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setProfileData({
            favoritePlace: data.place,
            location: data.location,
            favoriteFood: data.food,
          });
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleSuggestionClick = (id: SuggestionCategory) => {
    setActiveSuggestion(id);
    setResult(null);
    setPrompt('');
  };

  const handleGenerate = async (suggestionType?: SuggestionCategory) => {
    const currentSuggestion = suggestionType || activeSuggestion;
    if (!currentSuggestion || !prompt) return;

    setIsLoading(true);
    setResult(null);

    try {
        let genResult;
        if (currentSuggestion === 'recipe') {
            genResult = await generateRecipeSuggestion({
                prompt,
                usePantry,
                pantryItems: usePantry ? pantryItems.map(p => ({ name: p.name, quantity: p.quantity })) : [],
            });
        } else if (currentSuggestion === 'trip') {
            genResult = await generateTripPlan({
                prompt,
                favoritePlace: profileData.favoritePlace,
                location: profileData.location,
                budget: tripBudget,
            });
        } else if (currentSuggestion === 'date') {
            genResult = await generateDateIdea({
                prompt,
                favoritePlace: profileData.favoritePlace,
                favoriteFood: profileData.favoriteFood,
                location: profileData.location,
                budget: dateBudget,
            });
        }
        
        setResult(genResult || null);
        
        if(genResult){
            let title = "Uma sugestão incrível!";
            if ('recipe' in genResult) {
                const titleMatch = genResult.recipe.match(/^#+\s*(.*)/);
                if (titleMatch) title = titleMatch[1];
            } else if ('destination' in genResult) {
                title = `Viagem para ${genResult.destination}`;
            } else if ('title' in genResult) {
                title = genResult.title;
            }

            const newHistoryItem = { title, content: genResult };
            setHistory(prev => [newHistoryItem, ...prev].slice(0, 5)); // Keep last 5
        }

    } catch (error) {
        console.error("Error generating suggestion:", error);
        toast({
            variant: "destructive",
            title: "Erro ao gerar sugestão",
            description: "Desculpe, não foi possível gerar uma sugestão no momento. Tente novamente.",
        });
    } finally {
        setIsLoading(false);
    }
  }

  const handleAddMissingToCart = () => {
    if (!result || !('missingItems' in (result as any)) || !(result as any).missingItems || (result as any).missingItems.length === 0) return;
    (result as any).missingItems.forEach((item: string) => {
        handleAddItemToList(item, 1);
    });
    toast({
        title: "Itens Adicionados!",
        description: "Os ingredientes faltantes foram adicionados à sua lista de compras principal."
    });
  }
  
  const copyToClipboard = (textToCopy: string | ResultType) => {
    if (!textToCopy) return;
    
    let rawText = '';
    if (typeof textToCopy === 'string') {
        rawText = textToCopy;
    } else if ('destination' in (textToCopy as any)) {
        const plan = textToCopy as GenerateTripPlanOutput;
        rawText += `Viagem para ${plan.destination}\n\nAcomodação: ${plan.accommodation.name}\n${plan.accommodation.description}\n\n`;
        plan.itinerary.forEach(day => {
            rawText += `Dia ${day.day}: ${day.title}\n`;
            day.activities.forEach(act => {
                rawText += `- ${act.name}: ${act.description}\n`;
            });
            rawText += '\n';
        });
        rawText += `Checklist: ${plan.checklist.join(', ')}`;
    } else if ('recipe' in (textToCopy as any)) {
        rawText = (textToCopy as any).recipe;
    } else if ('detailsMarkdown' in (textToCopy as any)) {
        rawText = (textToCopy as any).detailsMarkdown;
    }

    const cleanedText = rawText.replace(/#+\s*/g, '').replace(/\*/g, '');
    navigator.clipboard.writeText(cleanedText);
    toast({
        title: 'Copiado!',
        description: 'A sugestão foi copiada para sua área de transferência.',
    });
  };

  const resultTitle = useMemo(() => {
    if (!result) return 'Uma sugestão incrível!';
    if ('recipe' in (result as any)) {
      const titleMatch = (result as any).recipe.match(/^#+\s*(.*)/);
      return titleMatch ? titleMatch[1] : 'Uma receita incrível!';
    }
    if ('destination' in (result as any)) {
      return `Viagem para ${(result as any).destination}`;
    }
    if ('title' in (result as any)) {
        return (result as any).title;
    }
    return 'Uma sugestão incrível!';
  }, [result]);
  
  const renderStars = (rating: number) => {
    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
                <Star key={i} className={cn("h-4 w-4", i < Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/50")} />
            ))}
        </div>
    );
  }
  
  const ResultContent = ({ content }: { content: ResultType }) => {
    if ('recipe' in (content as any)) {
        return <ReactMarkdown components={{ h1: 'h2', h2: 'h3', h3: 'h4' }}>{(content as any).recipe}</ReactMarkdown>;
    }
    if ('destination' in (content as any)) {
        return <TripPlanResult plan={content as any} />;
    }
    if ('detailsMarkdown' in (content as any)) {
        return <DateIdeaResult idea={content as any} />;
    }
    return null;
  };
  
  const DateIdeaResult = ({ idea }: { idea: GenerateDateIdeaOutput }) => (
    <div className="space-y-6">
      <ReactMarkdown components={{ h1: 'h2', h2: 'h3', h3: 'h4' }}>
        {idea.detailsMarkdown}
      </ReactMarkdown>
      {idea.suggestedVenues && idea.suggestedVenues.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2 mt-6 mb-4"><VenueIcon className="h-5 w-5"/> Lugares Sugeridos</h3>
          <div className="space-y-4">
            {idea.suggestedVenues.map((venue, index) => (
              <div key={index} className="pl-7">
                <h4 className="font-semibold">{venue.name}</h4>
                <p className="text-muted-foreground">{venue.description}</p>
                {venue.reviews && venue.reviews.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {venue.reviews.map((review, r_index) => (
                      <div key={r_index} className="border-l-2 pl-3">
                        {renderStars(review.rating)}
                        <p className="text-sm italic">"{review.comment}"</p>
                        <p className="text-xs text-right text-muted-foreground">- {review.author}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
  
  const TripPlanResult = ({ plan }: { plan: GenerateTripPlanOutput }) => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold flex items-center gap-2"><Building className="h-5 w-5"/> Acomodação: {plan.accommodation.name}</h3>
        <p className="text-muted-foreground pl-7">{plan.accommodation.description}</p>
        {plan.accommodation.reviews && plan.accommodation.reviews.length > 0 && (
          <div className="pl-7 mt-2 space-y-2">
            <h4 className="font-semibold text-sm">Avaliações:</h4>
            {plan.accommodation.reviews.map((review, index) => (
              <div key={index} className="border-l-2 pl-3">
                {renderStars(review.rating)}
                <p className="text-sm italic">"{review.comment}"</p>
                <p className="text-xs text-right text-muted-foreground">- {review.author}</p>
              </div>
            ))}
          </div>
        )}
      </div>
       <div className="space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">Roteiro Sugerido 🗺️</h3>
        {plan.itinerary.map((day) => (
            <div key={day.day} className="pl-4 border-l-2">
                <h4 className="font-semibold text-lg">Dia {day.day}: {day.title}</h4>
                <div className="space-y-3 mt-2">
                    {day.activities.map((activity, index) => (
                       <div key={index} className="pl-4">
                            <h5 className="font-semibold">{activity.name}</h5>
                            <p className="text-muted-foreground text-sm">{activity.description}</p>
                             {activity.reviews && activity.reviews.length > 0 && (
                                <div className="mt-2 space-y-2">
                                {activity.reviews.slice(0,1).map((review, r_index) => (
                                    <div key={r_index} className="border-l-2 pl-3 text-xs">
                                        {renderStars(review.rating)}
                                        <p className="italic">"{review.comment}"</p>
                                        <p className="text-right text-muted-foreground">- {review.author}</p>
                                    </div>
                                ))}
                                </div>
                            )}
                       </div>
                    ))}
                </div>
            </div>
        ))}
      </div>
      <div>
        <h3 className="text-xl font-semibold flex items-center gap-2"><Briefcase className="h-5 w-5"/> Checklist da Viagem</h3>
        <ul className="list-disc list-inside columns-2 gap-4 pl-2 mt-2">
            {plan.checklist.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
      </div>
    </div>
  );

  return (
    <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-3xl border-white/20 dark:border-black/20 rounded-3xl shadow-2xl h-full">
      <CardContent className="p-4 sm:p-6 h-full">
        <div className="flex flex-col items-center justify-start h-full text-center py-8">
            <Sparkles className="mx-auto h-12 w-12 text-primary" />
            <h1 className="mt-4 text-3xl font-bold text-foreground">Descobrir</h1>
            <p className="mt-2 text-lg text-muted-foreground mb-10">
                Deixe a IA ser a sua fada madrinha e inspire o dia a dia de vocês.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10 w-full max-w-5xl">
                {suggestionCards.map((card) => (
                    <Card 
                        key={card.id} 
                        className={cn(
                          'bg-transparent text-left card-hover-effect cursor-pointer transition-all',
                          activeSuggestion === card.id ? 'border-primary ring-2 ring-primary/50' : 'border-border'
                        )}
                        onClick={() => handleSuggestionClick(card.id as SuggestionCategory)}
                    >
                        <CardHeader className="flex-row items-center gap-4 space-y-0">
                            {card.icon}
                            <CardTitle>{card.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>{card.description}</CardDescription>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {activeSuggestion && (
                 <div className="w-full max-w-2xl space-y-4">
                    <div className="flex w-full items-center space-x-2">
                        <Input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={suggestionCards.find(c => c.id === activeSuggestion)?.placeholder}
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                        />
                        <Button onClick={() => handleGenerate()} disabled={isLoading || !prompt}>
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lightbulb className="h-4 w-4" />}
                            <span className="hidden sm:inline ml-2">{isLoading ? 'Gerando...' : 'Gerar'}</span>
                        </Button>
                    </div>
                    
                    {activeSuggestion === 'recipe' && (
                        <div className="flex items-center space-x-2 justify-center pt-2">
                            <Checkbox id="use-pantry" checked={usePantry} onCheckedChange={(checked) => setUsePantry(checked as boolean)}/>
                            <Label htmlFor="use-pantry" className="text-sm font-medium text-muted-foreground">Usar itens da despensa?</Label>
                        </div>
                    )}
                    
                    {activeSuggestion === 'trip' && (
                        <div className="flex flex-col items-center space-y-2 justify-center pt-2">
                            <Label htmlFor="trip-budget" className="text-sm font-medium text-muted-foreground">Orçamento da Viagem (opcional)</Label>
                            <CurrencyInput
                                id="trip-budget"
                                value={tripBudget || 0}
                                onValueChange={(value) => setTripBudget(value)}
                                className="max-w-xs mx-auto"
                            />
                        </div>
                    )}
                    
                    {activeSuggestion === 'date' && (
                        <div className="flex flex-col items-center space-y-2 justify-center pt-2">
                            <Label htmlFor="date-budget" className="text-sm font-medium text-muted-foreground">Orçamento do Encontro (opcional)</Label>
                            <CurrencyInput
                                id="date-budget"
                                value={dateBudget || 0}
                                onValueChange={(value) => setDateBudget(value)}
                                className="max-w-xs mx-auto"
                            />
                        </div>
                    )}

                    {isLoading && (
                        <div className="text-muted-foreground">
                            <p>Aguarde, estamos preparando algo especial...</p>
                        </div>
                    )}

                    {result && (
                        <Card className="bg-background/50 text-left">
                            <CardHeader>
                               <CardTitle className="text-2xl font-bold">{resultTitle}</CardTitle>
                               {'category' in (result as any) && <Badge variant="secondary" className="w-fit">{(result as any).category}</Badge>}
                            </CardHeader>
                            <CardContent className="prose dark:prose-invert prose-sm sm:prose-base max-w-none">
                                <ResultContent content={result} />

                                {'missingItems' in (result as any) && (result as any).missingItems && (result as any).missingItems.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-semibold">Itens para comprar:</h3>
                                        <ul className="list-disc pl-5">
                                            {(result as any).missingItems.map((item: string, index: number) => (
                                                <li key={index}>{item}</li>
                                            ))}
                                        </ul>
                                        <Button onClick={handleAddMissingToCart} className="w-full mt-4">
                                            <ShoppingCart className="mr-2 h-4 w-4"/>
                                            Adicionar ao carrinho
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                             <CardFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => copyToClipboard(result)}
                                    className="w-full"
                                >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copiar Sugestão
                                </Button>
                            </CardFooter>
                        </Card>
                    )}
                 </div>
            )}
            
            {history.length > 0 && (
                 <div className="w-full max-w-2xl mt-12">
                    <h2 className="text-2xl font-bold mb-4">Seu Histórico</h2>
                    <Accordion type="single" collapsible className="w-full space-y-2">
                         {history.map((item, index) => (
                            <AccordionItem key={index} value={`item-${index}`} className="bg-background/50 rounded-lg border px-4">
                                <div className="flex items-center justify-between w-full pr-2">
                                  <AccordionTrigger className="text-left hover:no-underline flex-1 py-4">
                                      <span>{item.title}</span>
                                  </AccordionTrigger>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={(e) => { e.stopPropagation(); copyToClipboard(item.content); }}>
                                    <Copy className="h-4 w-4"/>
                                  </Button>
                                </div>
                               <AccordionContent className="prose dark:prose-invert prose-sm sm:prose-base max-w-none pb-4 text-left">
                                   <ResultContent content={item.content} />
                               </AccordionContent>
                            </AccordionItem>
                         ))}
                    </Accordion>
                 </div>
            )}

        </div>
      </CardContent>
    </Card>
  );
}
