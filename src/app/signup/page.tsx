
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogoIcon } from '@/components/logo';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [names, setNames] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = () => {
    setIsLoading(true);
    // Simulating a network request
    setTimeout(() => {
        if (names && email && password) {
             toast({
                title: 'Cadastro realizado com sucesso!',
                description: 'Vocês agora podem fazer o login.',
            });
            // In a real app, you would save user data here
            router.push('/login');
        } else {
             toast({
                variant: 'destructive',
                title: 'Campos incompletos',
                description: 'Por favor, preencha todos os campos.',
            });
            setIsLoading(false);
        }
    }, 1000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-sm bg-white/10 dark:bg-black/10 backdrop-blur-3xl border-white/20 dark:border-black/20 rounded-3xl shadow-2xl">
        <CardHeader className="items-center text-center">
           <LogoIcon />
          <CardTitle className="text-2xl pt-4">Criar sua conta</CardTitle>
          <CardDescription>Comecem a jornada de vocês hoje mesmo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="names">Nomes do Casal</Label>
            <Input 
                id="names" 
                type="text" 
                placeholder="Ex: Ana & Bruno"
                value={names}
                onChange={(e) => setNames(e.target.value)}
                required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
                id="email" 
                type="email" 
                placeholder="casal@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" onClick={handleSignup} disabled={isLoading}>
             {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
             {isLoading ? 'Criando...' : 'Criar Conta'}
          </Button>
           <p className="text-xs text-center text-muted-foreground">
            Já tem uma conta?{' '}
            <Link href="/login" className="underline underline-offset-4 hover:text-primary">
              Faça login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
