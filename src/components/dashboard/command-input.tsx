
'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, ArrowRight, Mic, MicOff } from "lucide-react";
import { processChat } from '@/ai/flows/process-chat-flow';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

export function CommandInput() {
    const [command, setCommand] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const { toast } = useToast();
    const { user } = useAuth();
    
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.lang = 'pt-BR';
            recognitionRef.current.interimResults = false;

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setCommand(transcript);
                setIsListening(false);
                 toast({ title: "Comando reconhecido!", description: `Processando: "${transcript}"` });
                 setTimeout(() => handleProcessCommand(transcript), 500);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
                toast({ variant: 'destructive', title: "Erro de áudio", description: "Não consegui entender o que você disse." });
            };
            
            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, [toast]);
    
     const handleProcessCommand = async (text: string) => {
        const commandToProcess = text || command;
        if (!commandToProcess.trim() || !user) return;

        setIsLoading(true);
        try {
            const result = await processChat({ command: commandToProcess, userId: user.uid });
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
    
    const handleListen = () => {
        if (!recognitionRef.current) {
            toast({ variant: 'destructive', title: "Não suportado", description: "Seu navegador não suporta reconhecimento de voz." });
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };


    return (
        <div className="flex w-full items-center space-x-2">
            <Input
                type="text"
                placeholder="Adicionar gasto, tarefa, evento..."
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleProcessCommand(command)}
                disabled={isLoading}
            />
            <Button 
                type="button" 
                size="icon"
                variant="outline"
                onClick={handleListen}
                disabled={isLoading}
                className={cn(isListening && "bg-destructive/20 text-destructive border-destructive")}
            >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button 
                type="submit" 
                size="icon"
                onClick={() => handleProcessCommand(command)}
                disabled={isLoading || !command.trim()}
            >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            </Button>
        </div>
    );
}
