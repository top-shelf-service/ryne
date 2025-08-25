'use server';

import { suggestSchedule, type SuggestScheduleInput, type SuggestScheduleOutput } from '@/ai/flows/suggest-schedule';
import { parseScheduleEmail, type ParseScheduleEmailInput, type ParseScheduleEmailOutput } from '@/ai/flows/parse-schedule-email';
import { z } from 'zod';

const SuggestionSchema = z.object({
  suggestedSchedule: z.string(),
  reasoning: z.string(),
  analytics: z.object({
    totalLaborCost: z.number(),
    totalOvertimeHours: z.number(),
    scheduleAdherenceScore: z.number(),
  }),
});


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

    const parsed = SuggestionSchema.safeParse(result);
    if (!parsed.success) {
        console.error("AI Response Validation Error:", parsed.error);
        return { error: 'The AI returned a response with an unexpected format. Please try again.' };
    }

    return { data: parsed.data };
  } catch (error) {
    console.error(error);
    return { error: 'An unexpected error occurred. Please check the server logs.' };
  }
}

// Action for parsing email
type ParseEmailResult = {
  data?: ParseScheduleEmailOutput;
  error?: string;
};

export async function parseEmailAction(input: ParseScheduleEmailInput): Promise<ParseEmailResult> {
  try {
    const result = await parseScheduleEmail(input);
    return { data: result };
  } catch (error) {
    console.error(error);
    return { error: 'An unexpected error occurred while parsing the email.' };
  }
}
