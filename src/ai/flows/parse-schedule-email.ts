'use server';
/**
 * @fileOverview An AI agent that parses scheduling requirements from an email.
 *
 * - parseScheduleEmail - A function that handles parsing the email content.
 * - ParseScheduleEmailInput - The input type for the parseScheduleEmail function.
 * - ParseScheduleEmailOutput - The return type for the parseScheduleEmail function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ParseScheduleEmailInputSchema = z.object({
  emailContent: z.string().describe('The raw text content of an email containing scheduling information.'),
});
export type ParseScheduleEmailInput = z.infer<typeof ParseScheduleEmailInputSchema>;

const ParseScheduleEmailOutputSchema = z.object({
  demandForecast: z
    .string()
    .describe(
      'A JSON string representing the demand forecast extracted from the email. This should include data on peak periods, sales trends, and staffing needs.'
    ),
  coverageNeeds: z
    .string()
    .describe(
      'A JSON string detailing required coverage for operational hours and tasks, extracted from the email.'
    ),
  scheduleRequirements: z
    .string()
    .describe('Any other specific schedule requirements, preferences, or constraints mentioned in the email.'),
});
export type ParseScheduleEmailOutput = z.infer<typeof ParseScheduleEmailOutputSchema>;


export async function parseScheduleEmail(input: ParseScheduleEmailInput): Promise<ParseScheduleEmailOutput> {
  return parseScheduleEmailFlow(input);
}

const prompt = ai.definePrompt({
  name: 'parseScheduleEmailPrompt',
  input: { schema: ParseScheduleEmailInputSchema },
  output: { schema: ParseScheduleEmailOutputSchema },
  prompt: `You are an expert data-entry assistant for a workforce scheduling application. Your task is to read the following email content and extract the relevant information into a structured JSON format.

  **Instructions:**
  1.  Read the email content carefully.
  2.  Extract information related to **Demand Forecasting**. This includes historical data, sales trends, upcoming promotions, and predicted staffing needs. Format this as a JSON string.
  3.  Extract information related to **Coverage Needs**. This includes required staff for specific shifts, roles, or days. Format this as a JSON string.
  4.  Extract any other **Specific Requirements**. This includes constraints, goals, or important notes for the schedule (e.g., "we need to keep costs low this month", "prioritize senior staff for training", "bartenders must be 21+").
  5.  If any of the categories are not mentioned in the email, return an empty string or an empty JSON object string ("{}").

  **Email Content:**
  \`\`\`
  {{{emailContent}}}
  \`\`\`

  Return the full response in the required JSON format.
  `,
});

const parseScheduleEmailFlow = ai.defineFlow(
  {
    name: 'parseScheduleEmailFlow',
    inputSchema: ParseScheduleEmailInputSchema,
    outputSchema: ParseScheduleEmailOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
