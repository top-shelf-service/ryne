
// src/ai/flows/calculate-pay-stub.ts
'use server';
/**
 * @fileOverview An AI agent that calculates payroll deductions and net pay using an employee's stored data.
 *
 * - calculatePayStub - A function that calculates pay stub details.
 * - CalculatePayStubInput - The input type for the calculatePayStub function.
 * - CalculatePayStubOutput - The return type for the calculatePayStub function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { taxBrackets, additionalMedicareThresholds, socialSecurityRate, socialSecurityWageLimit, medicareRate, additionalMedicareRate } from '@/lib/tax-data';
import { employees } from '@/lib/data';

// Helper function for state tax, as it's a simple mock
const calculateStateTax = (state: string, taxableIncome: number) => {
  if (state.toUpperCase() === 'CA') return taxableIncome * 0.08;
  if (state.toUpperCase() === 'NY') return taxableIncome * 0.065;
  if (state.toUpperCase() === 'TX') return 0;
  return taxableIncome * 0.05;
};


// The self-contained tool for all payroll calculations
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
  employeeId: z.string().describe("The unique ID of the employee."),
  grossPayFromHours: z.number().describe('The gross pay calculated from hours worked.'),
  ptoHours: z.number().describe('Number of Paid Time Off hours to include.'),
  payFrequency: z.enum(['Weekly', 'Bi-Weekly']),
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

// Create a new schema that includes the resolved employee data for the prompt
const PromptInputSchema = CalculatePayStubInputSchema.extend({
    employeeData: z.any()
});


const prompt = ai.definePrompt({
  name: 'calculatePayStubPrompt',
  input: { schema: PromptInputSchema },
  output: { schema: CalculatePayStubOutputSchema },
  tools: [calculatePayrollDetails],
  prompt: `You are a payroll calculation expert. Your task is to calculate the net pay for an employee based on their stored W-4 information and the current pay period details.

  1.  Retrieve the employee's data.
  2.  Calculate the total gross pay by adding the pay from worked hours to the pay from any PTO hours. The hourly rate is in the employee data.
  3.  Use the 'calculatePayrollDetails' tool to get the detailed tax breakdown. You must pass all the required fields to the tool from the employee's record and the current pay period details.
  4.  Sum all deductions (pre-tax and all calculated taxes).
  5.  Subtract total deductions from the total gross pay to calculate the final net pay.
  6.  Provide a brief reasoning for your calculation, explicitly mentioning how PTO was handled.
  
  **Pay Period Details:**
  - Gross Pay from Hours Worked: {{{grossPayFromHours}}}
  - PTO Hours: {{{ptoHours}}}
  - Pay Frequency: {{{payFrequency}}}
  
  **Employee Onboarding Data:**
  \`\`\`json
  {{{json employeeData}}}
  \`\`\`
  
  Return the full breakdown in the required JSON format.
  `,
});

const calculatePayStubFlow = ai.defineFlow(
  {
    name: 'calculatePayStubFlow',
    inputSchema: CalculatePayStubInputSchema,
    outputSchema: CalculatePayStubOutputSchema,
  },
  async (input) => {
    // Find the employee from our "database"
    const employee = employees.find(e => e.id === input.employeeId);
    if (!employee) {
        throw new Error(`Employee with ID ${input.employeeId} not found.`);
    }

    // The prompt now handles the entire calculation by using the tool,
    // so we just need to pass the resolved data to it.
    const {output} = await prompt({
        ...input,
        employeeData: employee,
    });
    
    return output!;
  }
);
