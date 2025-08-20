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

// Mock tax rate tool
const getTaxRates = ai.defineTool(
    {
      name: 'getTaxRates',
      description: 'Get estimated tax rates for a given US state.',
      inputSchema: z.object({
        state: z.string().describe('The two-letter US state code (e.g., "CA", "NY").'),
      }),
      outputSchema: z.object({
        federalRate: z.number().describe('Estimated federal income tax rate.'),
        stateRate: z.number().describe('Estimated state income tax rate.'),
        ficaRate: z.number().describe('FICA tax rate (Social Security and Medicare).'),
      }),
    },
    async ({ state }) => {
      console.log(`Fetching mock tax rates for: ${state}`);
      // In a real application, this would call a tax API.
      // For this example, we'll return mock data.
      let stateRate = 0.05; // Default state tax
      if (state.toUpperCase() === 'CA') stateRate = 0.08;
      if (state.toUpperCase() === 'NY') stateRate = 0.065;
      if (state.toUpperCase() === 'TX') stateRate = 0.0; // No state income tax
      
      return {
        federalRate: 0.15, // Mock federal rate
        stateRate: stateRate,
        ficaRate: 0.0765, // Standard FICA rate
      };
    }
  );


export const CalculatePayStubInputSchema = z.object({
  grossPay: z.number().describe('The total gross pay before any deductions.'),
  location: z.string().describe('The US state for tax calculation (e.g., "CA").'),
});
export type CalculatePayStubInput = z.infer<typeof CalculatePayStubInputSchema>;

export const CalculatePayStubOutputSchema = z.object({
  grossPay: z.number(),
  deductions: z.object({
    federal: z.number(),
    state: z.number(),
    fica: z.number(),
    total: z.number(),
  }),
  netPay: z.number(),
  reasoning: z.string().describe('A brief explanation of how the deductions were calculated.'),
});
export type CalculatePayStubOutput = z.infer<typeof CalculatePayStubOutputSchema>;


export async function calculatePayStub(input: CalculatePayStubInput): Promise<CalculatePayStubOutput> {
  return calculatePayStubFlow(input);
}

const prompt = ai.definePrompt({
  name: 'calculatePayStubPrompt',
  input: { schema: CalculatePayStubInputSchema },
  output: { schema: CalculatePayStubOutputSchema },
  tools: [getTaxRates],
  prompt: `You are a payroll calculation expert. Your task is to calculate the net pay for an employee based on their gross pay and location.

  1.  Use the 'getTaxRates' tool to fetch the estimated tax rates for the employee's state.
  2.  Calculate the deductions for Federal, State, and FICA taxes based on the rates from the tool.
  3.  Sum the deductions to get the total deductions.
  4.  Subtract the total deductions from the gross pay to get the net pay.
  5.  Provide a brief reasoning for your calculation.
  
  Gross Pay: {{{grossPay}}}
  State: {{{location}}}
  
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
    return output!;
  }
);
