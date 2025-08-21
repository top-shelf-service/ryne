
'use server';

import { calculatePayStub, type CalculatePayStubInput } from '@/ai/flows/calculate-pay-stub';
import { z } from 'zod';

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
  reasoning: z.string(),
});

export type CalculatePayStubOutput = z.infer<typeof CalculatePayStubOutputSchema>;


type AiActionResult = {
    data?: CalculatePayStubOutput;
    error?: string;
};

export async function calculatePayStubAction(input: CalculatePayStubInput): Promise<AiActionResult> {
  try {
    const result = await calculatePayStub(input);
    const parsed = CalculatePayStubOutputSchema.safeParse(result);
    if (!parsed.success) {
      console.error("AI Response Validation Error:", parsed.error.flatten());
      return { error: 'The AI returned an invalid response format. Please try again.' };
    }
    return { data: parsed.data };
  } catch (error) {
    console.error(error);
    return { error: 'An unexpected error occurred. Please check the server logs.' };
  }
}
