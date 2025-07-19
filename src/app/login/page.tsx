
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
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/contexts/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLogin = async () => {
    setIsLoading(true);
    try {
        await signInWithEmailAndPassword(auth, email, password);
        toast({
            title: 'Login bem-sucedido!',
            description: 'Bem-vindos de volta!',
        });
        router.push('/');
    } catch (error: any) {
        let description = 'Ocorreu um erro desconhecido. Tente novamente.';
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            description = 'E-mail ou senha inválidos. Por favor, verifique seus dados.';
        } else if (error.code === 'auth/invalid-api-key') {
            description = 'Chave de API do Firebase inválida. Verifique sua configuração.';
        }
        toast({
            variant: 'destructive',
            title: 'Falha no Login',
            description,
        });
    } finally {
        setIsLoading(false);
    }
  };

  if (loading || user) {
    if (user) router.replace('/');
    return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-sm bg-white/10 dark:bg-black/10 backdrop-blur-3xl border-white/20 dark:border-black/20 rounded-3xl shadow-2xl">
        <CardHeader className="items-center text-center">
          <LogoIcon />
          <CardTitle className="text-2xl pt-4">Bem-vindos de volta!</CardTitle>
          <CardDescription>Insira os dados para acessar o painel.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
                id="email" 
                type="email" 
                placeholder="seu@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input 
                id="password" 
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" onClick={handleLogin} disabled={isLoading || !auth}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
           <p className="text-xs text-center text-muted-foreground">
            Não tem uma conta?{' '}
            <Link href="/signup" className="underline underline-offset-4 hover:text-primary">
              Cadastre-se
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
