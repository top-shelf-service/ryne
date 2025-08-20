// src/ai/flows/suggest-schedule.ts
'use server';
/**
 * @fileOverview An AI agent that suggests optimal schedules based on employee availability,
 * compliance rules, and predicted workload.
 *
 * - suggestSchedule - A function that suggests an optimal schedule.
 * - SuggestScheduleInput - The input type for the suggestSchedule function.
 * - SuggestScheduleOutput - The return type for the suggestSchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestScheduleInputSchema = z.object({
  employeeAvailability: z
    .string()
    .describe('Employee availability data in JSON format. Each employee object should include "name", "age", and "availableSlots".'),
  complianceRules: z
    .string()
    .describe('Compliance rules data in JSON format.'),
  predictedWorkload: z
    .string()
    .describe('Predicted workload data in JSON format.'),
  scheduleRequirements: z.string().describe('Any specific schedule requirements or preferences, including age restrictions for roles.'),
});
export type SuggestScheduleInput = z.infer<typeof SuggestScheduleInputSchema>;

const SuggestScheduleOutputSchema = z.object({
  suggestedSchedule: z
    .string()
    .describe('The suggested schedule in JSON format.'),
  reasoning: z
    .string()
    .describe('The AI reasoning behind the suggested schedule.'),
});
export type SuggestScheduleOutput = z.infer<typeof SuggestScheduleOutputSchema>;

export async function suggestSchedule(input: SuggestScheduleInput): Promise<SuggestScheduleOutput> {
  return suggestScheduleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSchedulePrompt',
  input: {schema: SuggestScheduleInputSchema},
  output: {schema: SuggestScheduleOutputSchema},
  prompt: `You are an AI schedule optimization expert. Given employee availability, compliance rules, and predicted workload, generate an optimal schedule.

Crucially, you must adhere to any age restrictions mentioned in the schedule requirements. For example, if a role requires an employee to be 21 or older, do not assign anyone younger than 21 to that role.

Employee Availability (including ages):
{{employeeAvailability}}

Compliance Rules:
{{complianceRules}}

Predicted Workload:
{{predictedWorkload}}

Specific Schedule Requirements (including age restrictions):
{{scheduleRequirements}}

Consider all factors and provide a schedule that maximizes efficiency, minimizes conflicts, and strictly follows all compliance and age-restriction rules. Return the suggested schedule as JSON, and include your reasoning for the suggested schedule.

Output the suggested schedule and reasoning in the following JSON format:
{
  "suggestedSchedule": "...JSON schedule...",
  "reasoning": "...Reasoning..."
}
`,
});

const suggestScheduleFlow = ai.defineFlow(
  {
    name: 'suggestScheduleFlow',
    inputSchema: SuggestScheduleInputSchema,
    outputSchema: SuggestScheduleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
