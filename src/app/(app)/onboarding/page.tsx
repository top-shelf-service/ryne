

'use client';

import * as React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, ChevronRight, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';

const steps = [
  { id: '01', name: 'Personal Information', fields: ['fullName', 'address'] },
  { id: '02', name: 'Federal Withholding (W-4)', fields: ['filingStatus', 'dependentsAmount', 'otherIncome', 'otherDeductions', 'extraWithholding', 'isMultipleJobsChecked'] },
  { id: '03', name: 'State Withholding', fields: ['state', 'stateSpecificField'] },
  { id: '04', name: 'I-9 Verification', fields: ['documentType', 'documentNumber'] },
  { id: '05', name: 'Review & Submit' },
];

const OnboardingSchema = z.object({
  fullName: z.string().min(1, 'Full name is required.'),
  address: z.string().min(1, 'Address is required.'),
  filingStatus: z.enum(['Single or Married filing separately', 'Married filing jointly', 'Head of Household']),
  isMultipleJobsChecked: z.boolean().default(false),
  dependentsAmount: z.coerce.number().min(0).default(0),
  otherIncome: z.coerce.number().min(0).default(0),
  otherDeductions: z.coerce.number().min(0).default(0),
  extraWithholding: z.coerce.number().min(0).default(0),
  state: z.string().min(2, 'State is required.').default('TX'),
  stateSpecificField: z.string().optional(),
  documentType: z.enum(['Passport', 'Driver\'s License', 'Social Security Card']),
  documentNumber: z.string().min(1, 'Document number is required.'),
});


export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = React.useState(0);
  const router = useRouter();
  
  const methods = useForm<z.infer<typeof OnboardingSchema>>({
    resolver: zodResolver(OnboardingSchema),
    defaultValues: {
      fullName: '',
      address: '',
      filingStatus: 'Single or Married filing separately',
      isMultipleJobsChecked: false,
      dependentsAmount: 0,
      otherIncome: 0,
      otherDeductions: 0,
      extraWithholding: 0,
      state: 'TX',
      documentType: 'Passport',
      documentNumber: '',
    },
  });

  type FieldName = keyof z.infer<typeof OnboardingSchema>;

  const next = async () => {
    const fields = steps[currentStep].fields;
    const output = await methods.trigger(fields as FieldName[], { shouldFocus: true });
    
    if (!output) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep(step => step + 1);
    } else {
        // Final step submit
        await methods.handleSubmit(onSubmit)();
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setCurrentStep(step => step - 1);
    }
  };
  
  const onSubmit = (data: z.infer<typeof OnboardingSchema>) => {
    console.log('Onboarding data:', data);
    // In a real app, this data would be saved to a secure backend.
    // We would also update the user's onboardingStatus to 'complete'.
    alert('Employee onboarded successfully!');
    // Redirect to the staff dashboard, as they have now completed the mandatory flow.
    router.push('/dashboard?role=Staff');
  }

  return (
    <>
      <PageHeader title="New Employee Onboarding" description="Complete the following steps to set up your employee profile and payroll information." />
      <Card>
        <CardHeader>
           <div className="flex justify-between items-center">
             <div>
                <CardTitle>Onboarding Wizard</CardTitle>
                <CardDescription>Step {currentStep + 1} of {steps.length}: {steps[currentStep].name}</CardDescription>
             </div>
             <div className="text-sm text-muted-foreground">
                Progress: {((currentStep / (steps.length -1)) * 100).toFixed(0)}%
             </div>
           </div>
        </CardHeader>
        <CardContent>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
              {currentStep === 0 && (
                <div className="space-y-4 max-w-lg">
                  <FormField control={methods.control} name="fullName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Legal Name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={methods.control} name="address" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Address</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              )}
              
              {currentStep === 1 && (
                  <div className="space-y-6 max-w-lg">
                    <FormField control={methods.control} name="filingStatus" render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel>Federal Filing Status</FormLabel>
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl><RadioGroupItem value="Single or Married filing separately" /></FormControl>
                                        <FormLabel className="font-normal">Single or Married filing separately</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl><RadioGroupItem value="Married filing jointly" /></FormControl>
                                        <FormLabel className="font-normal">Married filing jointly</FormLabel>
                                    </FormItem>
                                     <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl><RadioGroupItem value="Head of Household" /></FormControl>
                                        <FormLabel className="font-normal">Head of Household</FormLabel>
                                    </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={methods.control} name="dependentsAmount" render={({ field }) => (<FormItem><FormLabel>Dependents (Step 3)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={methods.control} name="otherIncome" render={({ field }) => (<FormItem><FormLabel>Other Income (4a)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={methods.control} name="otherDeductions" render={({ field }) => (<FormItem><FormLabel>Deductions (4b)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={methods.control} name="extraWithholding" render={({ field }) => (<FormItem><FormLabel>Extra Withholding (4c)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                     <FormField control={methods.control} name="isMultipleJobsChecked" render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>Multiple Jobs or Spouse Works?</FormLabel>
                                <FormDescription>Check this if you hold more than one job at a time or are married filing jointly and your spouse also works.</FormDescription>
                            </div>
                        </FormItem>
                    )} />
                  </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4 max-w-lg">
                   <FormField control={methods.control} name="state" render={({ field }) => (
                    <FormItem>
                      <FormLabel>State of Residence</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  {methods.watch('state').toUpperCase() === 'TX' && (
                      <p className='text-sm text-muted-foreground'>Texas does not have state income tax withholding.</p>
                  )}
                </div>
              )}

              {currentStep === 3 && (
                 <div className="space-y-4 max-w-lg">
                    <FormDescription>This is a simplified representation of Form I-9 requirements.</FormDescription>
                    <FormField control={methods.control} name="documentType" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Document Type for Verification</FormLabel>
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                                    <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="Passport" /></FormControl><FormLabel className="font-normal">U.S. Passport</FormLabel></FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="Driver's License" /></FormControl><FormLabel className="font-normal">Driver's License</FormLabel></FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="Social Security Card" /></FormControl><FormLabel className="font-normal">Social Security Card</FormLabel></FormItem>
                                </RadioGroup>
                            </FormControl>
                        </FormItem>
                    )} />
                    <FormField control={methods.control} name="documentNumber" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Document ID Number</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                 </div>
              )}

              {currentStep === 4 && (
                <div>
                    <h3 className="text-lg font-semibold">Review Your Information</h3>
                    <p className="text-sm text-muted-foreground mb-4">Please confirm all details are correct before submitting.</p>
                    <div className="space-y-2 rounded-md border p-4 max-w-2xl bg-muted/50">
                        <pre className='text-sm'><code>{JSON.stringify(methods.getValues(), null, 2)}</code></pre>
                    </div>
                </div>
              )}

              <div className="pt-8">
                <div className="flex justify-between">
                  <Button type="button" onClick={prev} disabled={currentStep === 0}>
                    <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                  </Button>
                  {currentStep === steps.length - 1 ? (
                    <Button type="submit">
                        <UserPlus className="mr-2 h-4 w-4" /> Onboard Employee
                    </Button>
                  ) : (
                    <Button type="button" onClick={next}>
                      Next <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </>
  );
}
