
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogoIcon } from '@/components/dashboard/logo';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, ref, set, query, orderByChild, equalTo, get } from 'firebase/database';
import { auth, app as firebaseApp } from '@/lib/firebase';
import { useAuth } from '@/contexts/auth-context';
import { Separator } from '@/components/ui/separator';

const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.28-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.022,35.244,44,30.036,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);


export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading, signInWithGoogle } = useAuth();

  const [names, setNames] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cpf, setCpf] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  useEffect(() => {
    if (!loading && user) {
      router.replace('/');
    }
  }, [loading, user, router]);

  const handleSignup = async () => {
    if (!names || !email || !password || !cpf) {
        toast({
            variant: 'destructive',
            title: 'Campos incompletos',
            description: 'Por favor, preencha todos os campos.',
        });
        return;
    }

    setIsLoading(true);
    
    try {
        const db = getDatabase(firebaseApp);
        // Check if CPF already exists
        const usersRef = ref(db, 'users');
        const q = query(usersRef, orderByChild('profile/cpf'), equalTo(cpf));
        const snapshot = await get(q);

        if (snapshot.exists()) {
            toast({
                variant: 'destructive',
                title: 'CPF já cadastrado',
                description: 'Este CPF já está associado a outra conta.',
            });
            setIsLoading(false);
            return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;

        // Save profile data to Realtime Database
        const profileRef = ref(db, `users/${newUser.uid}/profile`);
        const profileData = { 
            names, 
            email: newUser.email,
            cpf,
            partnerEmail: '',
            profileImage: 'https://placehold.co/600x800.png',
        };
        await set(profileRef, profileData);

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
  
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
        await signInWithGoogle();
        router.push('/');
    } catch(error: any) {
        toast({
            variant: 'destructive',
            title: 'Falha no Login com Google',
            description: 'Não foi possível fazer o login com o Google. Tente novamente.',
        });
    } finally {
        setIsGoogleLoading(false);
    }
  }
  
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
          <Button className="w-full" onClick={handleGoogleLogin} disabled={isGoogleLoading || isLoading} variant="outline">
            {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
            Continuar com o Google
          </Button>

          <div className="flex items-center space-x-2">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">OU</span>
            <Separator className="flex-1" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="names">Nomes do Casal</Label>
            <Input 
                id="names" 
                type="text" 
                placeholder="Ex: Ana & Bruno"
                value={names}
                onChange={(e) => setNames(e.target.value)}
                required
                disabled={isLoading || isGoogleLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cpf">Seu CPF</Label>
            <Input 
                id="cpf" 
                type="text" 
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                required
                disabled={isLoading || isGoogleLoading}
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
                disabled={isLoading || isGoogleLoading}
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
                disabled={isLoading || isGoogleLoading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" onClick={handleSignup} disabled={isLoading || isGoogleLoading}>
             {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
             {isLoading ? 'Criando...' : 'Criar Conta com Email'}
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
