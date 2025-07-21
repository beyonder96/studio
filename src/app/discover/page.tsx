
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Utensils, Plane, Heart, Lightbulb, Loader2, Sparkles } from 'lucide-react';
import { generateRecipeSuggestion } from '@/ai/flows/generate-recipe-flow';

type SuggestionCategory = 'recipe' | 'trip' | 'date';

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
    disabled: true,
  },
  {
    id: 'date',
    title: 'Ideia de Encontro',
    description: 'Receba sugestões criativas para o próximo encontro do casal.',
    icon: <Heart className="h-8 w-8 text-primary" />,
    placeholder: 'Ex: "uma noite divertida e barata"',
    disabled: true,
  },
];

export default function DiscoverPage() {
  const [activeSuggestion, setActiveSuggestion] = useState<SuggestionCategory | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSuggestionClick = (id: SuggestionCategory) => {
    setActiveSuggestion(id);
    setResult(null);
    setPrompt('');
  };
  
  const handleGenerate = async () => {
    if (!prompt || !activeSuggestion) return;

    setIsLoading(true);
    setResult(null);

    try {
        if(activeSuggestion === 'recipe') {
            const recipeResult = await generateRecipeSuggestion({ prompt });
            setResult(recipeResult.recipe);
        }
    } catch (error) {
        console.error("Error generating suggestion:", error);
        setResult("Desculpe, não foi possível gerar uma sugestão no momento. Tente novamente.");
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-3xl border-white/20 dark:border-black/20 rounded-3xl shadow-2xl h-full">
      <CardContent className="p-4 sm:p-6 h-full">
        <div className="flex flex-col items-center justify-start h-full text-center py-8">
            <Sparkles className="mx-auto h-12 w-12 text-primary" />
            <h1 className="mt-4 text-3xl font-bold text-foreground">Descobrir</h1>
            <p className="mt-2 text-lg text-muted-foreground mb-10">
                Deixe a IA ser a sua fada madrinha e inspire o dia a dia de vocês.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 w-full max-w-4xl">
                {suggestionCards.map((card) => (
                    <Card 
                        key={card.id} 
                        className={`bg-transparent text-left card-hover-effect cursor-pointer ${activeSuggestion === card.id ? 'border-primary' : ''} ${card.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => !card.disabled && handleSuggestionClick(card.id as SuggestionCategory)}
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
                        <Button onClick={handleGenerate} disabled={isLoading || !prompt}>
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lightbulb className="h-4 w-4" />}
                            <span className="hidden sm:inline ml-2">{isLoading ? 'Gerando...' : 'Gerar'}</span>
                        </Button>
                    </div>

                    {isLoading && (
                        <div className="text-muted-foreground">
                            <p>Aguarde, estamos preparando algo especial...</p>
                        </div>
                    )}

                    {result && (
                        <Card className="bg-background/50 text-left">
                            <CardContent className="p-6">
                                <pre className="whitespace-pre-wrap font-sans text-sm">{result}</pre>
                            </CardContent>
                        </Card>
                    )}
                 </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
