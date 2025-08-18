'use server';

import { suggestSchedule, type SuggestScheduleInput, type SuggestScheduleOutput } from '@/ai/flows/suggest-schedule';

type ActionResult = {
  data?: SuggestScheduleOutput;
  error?: string;
};

export async function generateScheduleAction(input: SuggestScheduleInput): Promise<ActionResult> {
  try {
    const result = await suggestSchedule(input);
    if (!result) {
      return { error: 'The AI failed to return a response. Please try again.' };
    }
    // A bit of validation to make sure the AI returns valid JSON string.
    try {
      JSON.parse(result.suggestedSchedule);
    } catch (e) {
      return { error: 'The AI returned an invalid schedule format. Please adjust your inputs and try again.' };
    }
    return { data: result };
  } catch (error) {
    console.error(error);
    return { error: 'An unexpected error occurred. Please check the server logs.' };
  }
}
