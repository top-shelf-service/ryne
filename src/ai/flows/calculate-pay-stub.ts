// src/ai/flows/calculate-pay-stub.ts
'use server';
/**
 * @fileOverview An AI agent that calculates payroll deductions and net pay.
 *
 * - calculatePayStub - A function that calculates pay stub details.
 * - CalculatePayStubInput - The input type for the calculatePayStub function.
 * - CalculatePayStubOutput - The return type for the calculatePayStub function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { taxBrackets, additionalMedicareThresholds, socialSecurityRate, socialSecurityWageLimit, medicareRate, additionalMedicareRate } from '@/lib/tax-data';


// Helper function for state tax, as it's a simple mock
const calculateStateTax = (state: string, taxableIncome: number) => {
  if (state.toUpperCase() === 'CA') return taxableIncome * 0.08;
  if (state.toUpperCase() === 'NY') return taxableIncome * 0.065;
  if (state.toUpperCase() === 'TX') return 0;
  return taxableIncome * 0.05;
};


// The new, self-contained tool for all payroll calculations
const calculatePayrollDetails = ai.defineTool(
    {
      name: 'calculatePayrollDetails',
      description: 'Calculates detailed FICA, Federal, and State tax withholding for a given pay period.',
      inputSchema: z.object({
        grossPay: z.number(),
        payFrequency: z.enum(['Weekly', 'Bi-Weekly']),
        yearToDateGross: z.number(),
        filingStatus: z.enum(['Single or Married filing separately', 'Married filing jointly', 'Head of Household']),
        isMultipleJobsChecked: z.boolean(),
        dependentsAmount: z.number(),
        otherIncome: z.number(),
        otherDeductions: z.number(),
        extraWithholding: z.number(),
        preTaxDeductions: z.number().describe('Total pre-tax deductions like health insurance, 401k, etc.'),
        state: z.string().describe('The two-letter US state code (e.g., "CA", "NY").'),
      }),
      outputSchema: z.object({
        federal: z.number(),
        state: z.number(),
        socialSecurity: z.number(),
        medicare: z.number(),
        total: z.number(),
      }),
    },
    async (input) => {
        // 1. Determine Taxable Income
        const ficaTaxableIncome = Math.max(0, input.grossPay - input.preTaxDeductions);
        const federalTaxableIncome = Math.max(0, input.grossPay - input.preTaxDeductions);

        // 2. Calculate FICA Taxes
        const remainingSSTaxable = socialSecurityWageLimit - input.yearToDateGross;
        const currentSSTaxable = Math.max(0, Math.min(ficaTaxableIncome, remainingSSTaxable));
        const socialSecurityWithholding = currentSSTaxable * socialSecurityRate;

        let medicareWithholding = ficaTaxableIncome * medicareRate;

        const ytdPlusCurrentGross = input.yearToDateGross + ficaTaxableIncome;
        const medicareThreshold = additionalMedicareThresholds[input.filingStatus as keyof typeof additionalMedicareThresholds] || 200000;
        let additionalMedicareWithholding = 0;
        if (ytdPlusCurrentGross > medicareThreshold) {
            const additionalTaxableBase = (ytdPlusCurrentGross - medicareThreshold) - Math.max(0, input.yearToDateGross - medicareThreshold);
            additionalMedicareWithholding = additionalTaxableBase * additionalMedicareRate;
        }
        const totalMedicare = medicareWithholding + additionalMedicareWithholding;


        // 3. Calculate Federal Income Tax (FIT)
        const payPeriods = input.payFrequency === 'Weekly' ? 52 : 26;
        const annualTaxableWages = (federalTaxableIncome * payPeriods) - input.otherDeductions;
        const adjustedAnnualWage = Math.max(0, annualTaxableWages + input.otherIncome);

        const bracketKey = input.isMultipleJobsChecked ? 'MultipleJobs' : input.filingStatus as keyof typeof taxBrackets;
        const brackets = taxBrackets[bracketKey];
        
        let tentativeWithholding = 0;
        for (const bracket of brackets) {
            if (adjustedAnnualWage > bracket.over) {
                const taxableInBracket = Math.min(adjustedAnnualWage - bracket.over, (bracket.upTo || Infinity) - bracket.over);
                tentativeWithholding += taxableInBracket * bracket.rate;
            }
        }
        
        const taxCredits = input.dependentsAmount;
        const annualWithholding = Math.max(0, tentativeWithholding - taxCredits);
        let federalIncomeTaxWithholding = (annualWithholding / payPeriods) + input.extraWithholding;
        

        // 4. Calculate State Tax
        const stateIncomeTaxWithholding = calculateStateTax(input.state, federalTaxableIncome);

        // 5. Sum up
        const totalTaxes = federalIncomeTaxWithholding + socialSecurityWithholding + totalMedicare + stateIncomeTaxWithholding;

        return {
            federal: federalIncomeTaxWithholding,
            state: stateIncomeTaxWithholding,
            socialSecurity: socialSecurityWithholding,
            medicare: totalMedicare,
            total: totalTaxes,
        };
    }
);


const CalculatePayStubInputSchema = z.object({
  grossPayFromHours: z.number().describe('The gross pay calculated from hours worked.'),
  ptoHours: z.number().describe('Number of Paid Time Off hours to include.'),
  hourlyRate: z.number().describe('The employee\'s hourly wage.'),
  payFrequency: z.enum(['Weekly', 'Bi-Weekly']),
  yearToDateGross: z.number(),
  filingStatus: z.enum(['Single or Married filing separately', 'Married filing jointly', 'Head of Household']),
  isMultipleJobsChecked: z.boolean(),
  dependentsAmount: z.number(),
  otherIncome: z.number(),
  otherDeductions: z.number(),
  extraWithholding: z.number(),
  preTaxDeductions: z.number(),
  location: z.string().describe('The US state for tax calculation (e.g., "CA").'),
});
export type CalculatePayStubInput = z.infer<typeof CalculatePayStubInputSchema>;

const CalculatePayStubOutputSchema = z.object({
  grossPay: z.number(),
  deductions: z.object({
    federal: z.number(),
    state: z.number(),
    socialSecurity: z.number(),
    medicare: z.number(),
    preTax: z.number(),
    total: z.number(),
  }),
  netPay: z.number(),
  reasoning: z.string().describe('A brief explanation of how the pay was calculated, including PTO.'),
});
export type CalculatePayStubOutput = z.infer<typeof CalculatePayStubOutputSchema>;


export async function calculatePayStub(input: CalculatePayStubInput): Promise<CalculatePayStubOutput> {
  return calculatePayStubFlow(input);
}

const prompt = ai.definePrompt({
  name: 'calculatePayStubPrompt',
  input: { schema: CalculatePayStubInputSchema },
  output: { schema: CalculatePayStubOutputSchema },
  tools: [calculatePayrollDetails],
  prompt: `You are a payroll calculation expert. Your task is to calculate the net pay for an employee.

  1.  Calculate the total gross pay by adding the pay from worked hours to the pay from any PTO hours.
  2.  Use the 'calculatePayrollDetails' tool to get the detailed tax breakdown based on the total gross pay and employee's W-4 information.
  3.  Sum all deductions (pre-tax and all calculated taxes).
  4.  Subtract total deductions from the total gross pay to calculate the final net pay.
  5.  Provide a brief reasoning for your calculation, explicitly mentioning how PTO was handled.
  
  **Employee Details:**
  - Gross Pay from Hours Worked: {{{grossPayFromHours}}}
  - PTO Hours: {{{ptoHours}}}
  - Hourly Rate: {{{hourlyRate}}}
  - Location: {{{location}}}
  - Pay Frequency: {{{payFrequency}}}
  - YTD Gross: {{{yearToDateGross}}}
  - Filing Status: {{{filingStatus}}}
  - Multiple Jobs?: {{{isMultipleJobsChecked}}}
  - W-4 Step 3 (Dependents): {{{dependentsAmount}}}
  - W-4 Step 4a (Other Income): {{{otherIncome}}}
  - W-4 Step 4b (Deductions): {{{otherDeductions}}}
  - W-4 Step 4c (Extra Withholding): {{{extraWithholding}}}
  - Pre-Tax Deductions (Health Ins, etc.): {{{preTaxDeductions}}}
  
  Return the full breakdown in the required JSON format.
  `,
});

const calculatePayStubFlow = ai.defineFlow(
  {
    name: 'calculatePayStubFlow',
    inputSchema: CalculatePayStubInputSchema,
    outputSchema: CalculatePayStubOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // The prompt now handles the entire calculation by using the tool,
    // so we can just return its output directly.
    return output!;
  }
);
