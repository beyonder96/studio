
'use client';

import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";
import { processCommand } from '@/ai/flows/process-command-flow';
import { useToast } from '@/hooks/use-toast';

export function CommandInput() {
    const [command, setCommand] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleProcessCommand = async () => {
        if (!command.trim()) return;

        setIsLoading(true);
        try {
            const result = await processCommand({ command });
            toast({
                title: result.success ? 'Comando executado!' : 'Opa!',
                description: result.message,
                variant: result.success ? 'default' : 'destructive',
            });
            if (result.success) {
                setCommand('');
            }
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
            <Sparkles className="h-5 w-5 text-primary" />
            <Input
                type="text"
                placeholder="Adicione uma despesa, tarefa..."
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
