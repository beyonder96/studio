
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogoIcon } from '@/components/logo';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/contexts/auth-context';

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading } = useAuth();

  const [names, setNames] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (!loading && user) {
      router.replace('/');
    }
  }, [loading, user, router]);

  const handleSignup = async () => {
    if (!names || !email || !password) {
        toast({
            variant: 'destructive',
            title: 'Campos incompletos',
            description: 'Por favor, preencha todos os campos.',
        });
        return;
    }

    setIsLoading(true);
    
    try {
        await createUserWithEmailAndPassword(auth, email, password);
        
        // In a real app, you would save the 'names' to a user profile in Firestore
        // For now, we can save it to localStorage to be picked up by the profile page
        const profileData = { names, email, partnerEmail: '' };
        localStorage.setItem('app-profile-data', JSON.stringify(profileData));

        toast({
            title: 'Cadastro realizado com sucesso!',
            description: 'Você será redirecionado para a tela de login.',
        });
        router.push('/login');
    } catch (error: any) {
        let description = 'Ocorreu um erro desconhecido. Tente novamente.';
        if (error.code === 'auth/email-already-in-use') {
            description = 'Este e-mail já está sendo utilizado por outra conta.';
        } else if (error.code === 'auth/weak-password') {
            description = 'Sua senha é muito fraca. Ela deve ter pelo menos 6 caracteres.';
        } else if (error.code === 'auth/invalid-email') {
            description = 'O e-mail fornecido não é válido.';
        } else if (error.code === 'auth/invalid-api-key') {
            description = 'Chave de API do Firebase inválida. Verifique sua configuração.';
        }
        toast({
            variant: 'destructive',
            title: 'Falha no Cadastro',
            description,
        });
    } finally {
        setIsLoading(false);
    }
  };
  
  if (loading || user) {
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
                placeholder="Pelo menos 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" onClick={handleSignup} disabled={isLoading || !auth}>
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
