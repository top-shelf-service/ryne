
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Building, UserPlus, ArrowRight } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function OrganizationSetupPage() {
    const router = useRouter();

    const handleCreate = () => {
        // In a real app, this would navigate to a form to create an organization
        // For now, we'll just go to the dashboard as an Admin
        router.push('/dashboard?role=Admin');
    }

    const handleJoin = () => {
        // This would navigate to a page to enter an invite code or search for an organization
        // For now, we'll simulate joining and go to the dashboard as Staff
        router.push('/dashboard?role=Staff');
    }

  return (
    <Card className="w-full max-w-lg shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <Logo className="h-10 w-auto" />
        </div>
        <CardTitle className="text-2xl font-bold font-headline">Get Started with Shyft</CardTitle>
        <CardDescription>How would you like to set up your account?</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        
        <div className="flex flex-col">
            <Card 
                className="flex-grow flex flex-col items-center justify-center text-center p-6 hover:border-primary hover:shadow-lg transition-all cursor-pointer"
                onClick={handleCreate}
            >
                <Building className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-lg font-semibold">Create an Organization</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Set up a new workspace for your team and manage schedules, payroll, and members.
                </p>
            </Card>
            <Button onClick={handleCreate} className="mt-4 w-full">
                Create <ArrowRight className="ml-2" />
            </Button>
        </div>

        <div className="flex flex-col">
            <Card 
                className="flex-grow flex flex-col items-center justify-center text-center p-6 hover:border-primary hover:shadow-lg transition-all cursor-pointer"
                onClick={handleJoin}
            >
                <UserPlus className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-lg font-semibold">Join an Organization</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Accept an invitation to join an existing workspace and view your shifts.
                </p>
            </Card>
            <Button onClick={handleJoin} className="mt-4 w-full">
                Join <ArrowRight className="ml-2" />
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}

