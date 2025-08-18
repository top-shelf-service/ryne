'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bot, Loader2, Sparkles } from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { generateScheduleAction } from './actions';
import type { SuggestScheduleOutput } from '@/ai/flows/suggest-schedule';
import { useToast } from '@/hooks/use-toast';

const FormSchema = z.object({
  employeeAvailability: z.string().min(1, 'Employee availability is required.'),
  complianceRules: z.string().min(1, 'Compliance rules are required.'),
  predictedWorkload: z.string().min(1, 'Predicted workload is required.'),
  scheduleRequirements: z.string().min(1, 'Schedule requirements are required.'),
});

const placeholderAvailability = JSON.stringify(
  [
    { employeeId: 'E1', name: 'Alice', availableSlots: ['Mon-AM', 'Tue-PM', 'Wed-AM'] },
    { employeeId: 'E2', name: 'Bob', availableSlots: ['Mon-PM', 'Wed-AM', 'Thu-FULL'] },
  ],
  null,
  2
);

const placeholderCompliance = JSON.stringify(
  {
    maxHoursPerWeek: 40,
    minRestBetweenShifts: 8,
  },
  null,
  2
);

const placeholderWorkload = JSON.stringify(
  {
    'Mon-AM': { requiredStaff: 1 },
    'Mon-PM': { requiredStaff: 1 },
    'Tue-AM': { requiredStaff: 0 },
    'Tue-PM': { requiredStaff: 1 },
  },
  null,
  2
);

export default function ScheduleAssistantPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [suggestion, setSuggestion] = React.useState<SuggestScheduleOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      employeeAvailability: placeholderAvailability,
      complianceRules: placeholderCompliance,
      predictedWorkload: placeholderWorkload,
      scheduleRequirements: 'Prioritize full-day shifts for experienced staff (e.g., Bob).',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setSuggestion(null);

    const result = await generateScheduleAction(data);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error Generating Schedule',
        description: result.error,
      });
    } else {
      setSuggestion(result.data);
    }

    setIsLoading(false);
  }

  return (
    <>
      <PageHeader
        title="AI Schedule Assistant"
        description="Generate optimal schedules based on availability, rules, and workload."
      />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Scheduling Parameters</CardTitle>
              <CardDescription>Provide the data for the AI to generate a schedule.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="employeeAvailability"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employee Availability</FormLabel>
                        <FormControl>
                          <Textarea rows={8} placeholder="Enter JSON..." {...field} />
                        </FormControl>
                        <FormDescription>JSON format of employee availability.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="complianceRules"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Compliance Rules</FormLabel>
                        <FormControl>
                          <Textarea rows={5} placeholder="Enter JSON..." {...field} />
                        </FormControl>
                         <FormDescription>JSON format of compliance rules.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="predictedWorkload"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Predicted Workload</FormLabel>
                        <FormControl>
                          <Textarea rows={6} placeholder="Enter JSON..." {...field} />
                        </FormControl>
                         <FormDescription>JSON format of predicted workload.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="scheduleRequirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specific Requirements</FormLabel>
                        <FormControl>
                          <Textarea rows={3} placeholder="e.g., 'Ensure at least one senior staff is on duty.'" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading} className="w-full bg-accent hover:bg-accent/90">
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Generate Schedule
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full min-h-[50vh] p-8 text-center bg-card rounded-lg border border-dashed">
                <Bot className="h-16 w-16 mb-4 text-primary animate-pulse" />
                <h3 className="text-2xl font-bold tracking-tight">AI is thinking...</h3>
                <p className="text-sm text-muted-foreground">Please wait while we generate the optimal schedule for you.</p>
            </div>
          )}
          {!isLoading && !suggestion && (
             <div className="flex flex-col items-center justify-center h-full min-h-[50vh] p-8 text-center bg-card rounded-lg border border-dashed">
                <Bot className="h-16 w-16 mb-4 text-muted-foreground" />
                <h3 className="text-2xl font-bold tracking-tight">Your schedule awaits</h3>
                <p className="text-sm text-muted-foreground">Fill out the parameters on the left and click &quot;Generate Schedule&quot; to see the magic happen.</p>
            </div>
          )}
          {suggestion && (
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Suggested Schedule</CardTitle>
                   <CardDescription>The optimal schedule generated by the AI.</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
                    <code>{JSON.stringify(JSON.parse(suggestion.suggestedSchedule), null, 2)}</code>
                  </pre>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Reasoning</CardTitle>
                  <CardDescription>The AI's reasoning for this schedule suggestion.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{suggestion.reasoning}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
