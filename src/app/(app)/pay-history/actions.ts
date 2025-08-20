'use server';

import { calculatePayStub, type CalculatePayStubInput, type CalculatePayStubOutput } from '@/ai/flows/calculate-pay-stub';

type AiActionResult = {
    data?: CalculatePayStubOutput;
    error?: string;
};

export async function calculatePayStubAction(input: CalculatePayStubInput): Promise<AiActionResult> {
  try {
    const result = await calculatePayStub(input);
    if (!result) {
      return { error: 'The AI failed to return a response. Please try again.' };
    }
    return { data: result };
  } catch (error) {
    console.error(error);
    return { error: 'An unexpected error occurred. Please check the server logs.' };
  }
}
