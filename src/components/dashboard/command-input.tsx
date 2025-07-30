
'use client';

import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";
import { processChat } from '@/ai/flows/process-chat-flow';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';

export function CommandInput() {
    const [command, setCommand] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { user } = useAuth();

    const handleProcessCommand = async () => {
        if (!command.trim() || !user) return;

        setIsLoading(true);
        try {
            const result = await processChat({ command, userId: user.uid });
            toast({
                title: 'Assistente',
                description: result.answer,
            });
            setCommand('');
            
        } catch (error) {
            console.error("Failed to process command:", error);
            toast({
                title: 'Erro de comunicação',
                description: 'Não foi possível se conectar ao assistente. Tente novamente.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex w-full items-center space-x-2">
            <Input
                type="text"
                placeholder="Adicionar gasto, tarefa, evento..."
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleProcessCommand()}
                disabled={isLoading}
            />
            <Button 
                type="submit" 
                size="icon"
                onClick={handleProcessCommand}
                disabled={isLoading || !command.trim()}
            >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            </Button>
        </div>
    );
}
