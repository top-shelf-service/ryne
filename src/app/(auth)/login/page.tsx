'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Please enter both email and password.',
      });
      return;
    }
    // This is a mock authentication. In a real app, you'd call Firebase Auth here.
    console.log('Logging in with:', { email, password });
    toast({
      title: 'Login Successful',
      description: 'Redirecting to your dashboard...',
    });
    router.push('/dashboard');
  };

  const handleForgotPassword = () => {
    if (!email) {
      toast({
        variant: 'destructive',
        title: 'Email Required',
        description: 'Please enter your email address to reset your password.',
      });
      return;
    }
    toast({
      title: 'Password Reset',
      description: `Password reset instructions have been sent to ${email}.`,
    });
  };


  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <Logo className="h-10 w-auto" />
        </div>
        <CardTitle className="text-2xl font-bold font-headline">Welcome to Shyft</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
               <span onClick={handleForgotPassword} className="ml-auto inline-block text-sm text-muted-foreground/50 cursor-pointer hover:underline">
                Forgot your password?
              </span>
            </div>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
            Login
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
