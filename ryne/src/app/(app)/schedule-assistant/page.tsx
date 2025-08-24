

'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bot, Loader2, Sparkles, ShieldAlert, BarChart3, TrendingUp, FileText, Mail, Wand2 } from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { generateScheduleAction, parseEmailAction } from './actions';
import type { SuggestScheduleOutput } from '@/ai/flows/suggest-schedule';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';

export const dynamic = 'force-dynamic';

const FormSchema = z.object({
  employeeData: z.string().min(1, 'Employee data is required.'),
  demandForecast: z.string().min(1, 'Demand forecast is required.'),
  coverageNeeds: z.string().min(1, 'Coverage needs is required.'),
  companyPolicies: z.string(),
  scheduleRequirements: z.string(),
  maxHoursPerWeek: z.coerce.number().optional(),
  minRestBetweenShifts: z.coerce.number().optional(),
});


const placeholderEmployeeData = JSON.stringify(
  [
    { "name": "Alice", "age": 25, "wageRate": 20, "skillLevel": "Experienced", "availability": "Mon-AM, Tue-PM, Wed-AM", "preferredShifts": "AM", "timeOffRequests": [], "temporaryAvailabilityChanges": "" },
    { "name": "Bob", "age": 42, "wageRate": 25, "skillLevel": "Manager", "availability": "Mon-PM, Wed-AM, Thu-FULL", "preferredShifts": "Any", "timeOffRequests": [], "temporaryAvailabilityChanges": "" },
    { "name": "Charlie", "age": 19, "wageRate": 18, "skillLevel": "Novice", "availability": "Mon-AM, Tue-AM, Wed-PM", "preferredShifts": "AM", "timeOffRequests": ["2024-07-04"], "temporaryAvailabilityChanges": "" },
    { "name": "Diana", "age": 18, "wageRate": 18, "skillLevel": "Novice", "availability": "Fri-PM, Sat-FULL, Sun-FULL", "preferredShifts": "Weekend", "timeOffRequests": [], "temporaryAvailabilityChanges": "Unavailable Tue-AM for class" }
  ],
  null,
  2
);

const placeholderDemandForecast = JSON.stringify(
  { "historicalData": "Low traffic Mon-AM, high traffic Fri-PM", "salesTrends": "Weekend sales are 50% higher", "predictedNeeds": "Need extra staff for weekend promotion" }, null, 2
);

const placeholderCoverageNeeds = JSON.stringify(
  {
    "Mon-AM": { "requiredStaff": 1, "role": "Bartender", "minSkill": "Novice" },
    "Mon-PM": { "requiredStaff": 2, "role": "Server", "minSkill": "Novice" },
    "Fri-PM": { "requiredStaff": 3, "role": "Server", "minSkill": "Experienced" }
  }, null, 2
);

const placeholderCompanyPolicies = "Aim for balanced hours over a 2-week period. Overtime is discouraged and requires manager approval.";
const placeholderEmailContent = `Hi Team,

Just looking at the numbers from last year for our big summer sale week.

It looks like we were swamped on the weekend, especially Saturday afternoon. We definitely need at least 3 people on the floor from 12pm to 5pm on Saturday. Friday evening was busy too, so let's get 2 servers for that shift. Monday morning is usually pretty dead, one person should be fine.

The main goal is to make sure we're covered for the weekend rush without blowing the budget on overtime. Remember, only experienced staff should be handling the new espresso machine.

Thanks,
Management`;


export default function ScheduleAssistantPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isParsing, setIsParsing] = React.useState(false);
  const [suggestion, setSuggestion] = React.useState<SuggestScheduleOutput | null>(null);
  const [emailContent, setEmailContent] = React.useState(placeholderEmailContent);

  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams.get('role');

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      employeeData: placeholderEmployeeData,
      demandForecast: placeholderDemandForecast,
      coverageNeeds: placeholderCoverageNeeds,
      companyPolicies: placeholderCompanyPolicies,
      scheduleRequirements: 'The Bartender role requires the employee to be 21 or older. Prioritize full-day shifts for experienced staff (e.g., Bob). Aim to keep labor costs under $2000 for the week.',
      maxHoursPerWeek: 40,
      minRestBetweenShifts: 8,
    },
  });

  React.useEffect(() => {
    if (role === 'Staff') {
      const dashboardUrl = `/dashboard?role=Staff`;
      router.push(dashboardUrl);
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'You do not have permission to access the AI Schedule Assistant.',
      });
    }
  }, [role, router, toast]);

  if (role === 'Staff') {
     return (
        <div className="flex flex-col items-center justify-center h-full min-h-[60vh] p-8 text-center bg-card rounded-lg border border-dashed">
            <ShieldAlert className="h-16 w-16 mb-4 text-destructive" />
            <h3 className="text-2xl font-bold tracking-tight">Access Denied</h3>
            <p className="text-sm text-muted-foreground">Redirecting you to the dashboard...</p>
        </div>
      );
  }

  const handleParseEmail = async () => {
    setIsParsing(true);
    const result = await parseEmailAction({ emailContent });
    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error Parsing Email',
        description: result.error,
      });
    } else if (result.data) {
      form.setValue('demandForecast', result.data.demandForecast);
      form.setValue('coverageNeeds', result.data.coverageNeeds);
      form.setValue('scheduleRequirements', `${form.getValues('scheduleRequirements')} \n\n--- From Email ---\n${result.data.scheduleRequirements}`);
      toast({
        title: 'Email Parsed Successfully',
        description: 'The scheduling parameters have been populated below.',
      });
    }
    setIsParsing(false);
  }


  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setSuggestion(null);

    const fullRequirements = `
      ${data.scheduleRequirements}

      Company Policies:
      - Max hours per week: ${data.maxHoursPerWeek || 'Not set'}
      - Minimum rest between shifts: ${data.minRestBetweenShifts || 'Not set'}
      - Other policies: ${data.companyPolicies || 'None'}
    `;

    const result = await generateScheduleAction({
        employeeData: data.employeeData,
        demandForecast: data.demandForecast,
        coverageNeeds: data.coverageNeeds,
        companyPolicies: data.companyPolicies,
        scheduleRequirements: fullRequirements
    });

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
        description="Generate optimal schedules by providing comprehensive business and employee data."
      />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className='space-y-6'>
            <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Mail /> Import from Email</CardTitle>
                  <CardDescription>Paste an email with requirements to automatically populate the fields below.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea
                        rows={8}
                        placeholder="Paste email content here..."
                        value={emailContent}
                        onChange={(e) => setEmailContent(e.target.value)}
                    />
                    <Button onClick={handleParseEmail} disabled={isParsing} className="mt-4">
                        {isParsing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                        Parse & Populate
                    </Button>
                </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Scheduling Parameters</CardTitle>
                <CardDescription>Provide the data for the AI to generate a schedule.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
                       <AccordionItem value="item-1">
                        <AccordionTrigger>Employee Data</AccordionTrigger>
                        <AccordionContent>
                           <FormField
                            control={form.control}
                            name="employeeData"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Textarea rows={8} placeholder="Enter JSON..." {...field} />
                                </FormControl>
                                <FormDescription>Employee info, availability, and preferences.</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-2">
                        <AccordionTrigger>Demand & Coverage</AccordionTrigger>
                        <AccordionContent>
                          <div className='space-y-4'>
                             <FormField
                              control={form.control}
                              name="demandForecast"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Demand Forecast (JSON)</FormLabel>
                                  <FormControl>
                                    <Textarea rows={5} placeholder="Enter JSON..." {...field} />
                                  </FormControl>
                                  <FormDescription>Historical data and sales trends.</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="coverageNeeds"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Coverage Needs (JSON)</FormLabel>
                                  <FormControl>
                                    <Textarea rows={6} placeholder="Enter JSON..." {...field} />
                                  </FormControl>
                                  <FormDescription>Required staff, roles, and skills per shift.</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-3">
                        <AccordionTrigger>Rules & Policies</AccordionTrigger>
                        <AccordionContent>
                           <div className='space-y-4'>
                            <FormField
                              control={form.control}
                              name="maxHoursPerWeek"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Max Hours Per Week</FormLabel>
                                  <FormControl>
                                    <Input type="number" placeholder="e.g., 40" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="minRestBetweenShifts"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Minimum Rest Between Shifts (Hours)</FormLabel>
                                  <FormControl>
                                    <Input type="number" placeholder="e.g., 8" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="companyPolicies"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Other Company Policies</FormLabel>
                                  <FormControl>
                                    <Textarea rows={3} placeholder="e.g., 'Overtime requires manager approval.'" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                           </div>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-4">
                        <AccordionTrigger>Goals & Requirements</AccordionTrigger>
                        <AccordionContent>
                          <FormField
                            control={form.control}
                            name="scheduleRequirements"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Textarea rows={3} placeholder="e.g., 'Prioritize cost savings this week.'" {...field} />
                                </FormControl>
                                <FormDescription>Other goals like age restrictions or cost targets.</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
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
        </div>
        <div className="lg:col-span-2">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full min-h-[50vh] p-8 text-center bg-card rounded-lg border border-dashed">
                <Bot className="h-16 w-16 mb-4 text-primary animate-pulse" />
                <h3 className="text-2xl font-bold tracking-tight">AI is thinking...</h3>
                <p className="text-sm text-muted-foreground">Analyzing all factors to create the optimal schedule...</p>
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
                  <CardTitle className='flex items-center gap-2'><BarChart3 /> Suggested Schedule</CardTitle>
                   <CardDescription>The optimal schedule generated by the AI based on your inputs.</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
                    <code>{JSON.stringify(suggestion.suggestedSchedule, null, 2)}</code>
                  </pre>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'><FileText /> Reasoning</CardTitle>
                  <CardDescription>The AI's reasoning for this schedule suggestion.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{suggestion.reasoning}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'><TrendingUp /> Analytics</CardTitle>
                  <CardDescription>Key performance metrics for the generated schedule.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Labor Cost</p>
                        <p className="text-2xl font-bold">${suggestion.analytics.totalLaborCost.toFixed(2)}</p>
                    </div>
                     <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Overtime Hours</p>
                        <p className="text-2xl font-bold">{suggestion.analytics.totalOvertimeHours.toFixed(1)}</p>
                    </div>
                     <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Preference Score</p>
                        <p className="text-2xl font-bold">{(suggestion.analytics.scheduleAdherenceScore * 100).toFixed(0)}%</p>
                    </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
