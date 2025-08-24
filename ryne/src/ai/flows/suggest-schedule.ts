// src/ai/flows/suggest-schedule.ts
'use server';
/**
 * @fileOverview An AI agent that suggests optimal schedules based on a comprehensive set of business and employee inputs.
 *
 * - suggestSchedule - A function that suggests an optimal schedule.
 * - SuggestScheduleInput - The input type for the suggestSchedule function.
 * - SuggestScheduleOutput - The return type for the suggestSchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const SuggestScheduleInputSchema = z.object({
  employeeData: z
    .string()
    .describe(
      'A JSON string representing employee data. Each employee object should include "name", "age", "wageRate", "skillLevel", "availability", "preferredShifts", "timeOffRequests", and "temporaryAvailabilityChanges".'
    ),
  demandForecast: z
    .string()
    .describe(
      'A JSON string representing the demand forecast, including historical data, sales trends, and predicted peak periods to determine staffing requirements.'
    ),
  coverageNeeds: z
    .string()
    .describe(
      'A JSON string detailing the required coverage for all operational hours and critical tasks to maintain service standards.'
    ),
  companyPolicies: z
    .string()
    .describe(
      'A string outlining company policies, including shift assignment protocols, shift swapping guidelines, time-off request procedures, and rules about overtime and workload distribution.'
    ),
  scheduleRequirements: z
    .string()
    .describe('Any other specific schedule requirements or preferences, including age restrictions for roles, cost optimization goals, or skill-based needs.'),
});

export type SuggestScheduleInput = z.infer<typeof SuggestScheduleInputSchema>;

const SuggestScheduleOutputSchema = z.object({
  suggestedSchedule: z
    .any()
    .describe('The suggested schedule in JSON format.'),
  reasoning: z
    .string()
    .describe('The AI reasoning behind the suggested schedule, explaining how it balances all the provided factors.'),
  analytics: z
    .object({
      totalLaborCost: z.number(),
      totalOvertimeHours: z.number(),
      scheduleAdherenceScore: z.number().min(0).max(1),
    })
    .describe('Key performance indicators for the generated schedule.'),
});
export type SuggestScheduleOutput = z.infer<typeof SuggestScheduleOutputSchema>;

export async function suggestSchedule(input: SuggestScheduleInput): Promise<SuggestScheduleOutput> {
  return suggestScheduleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSchedulePrompt',
  input: {schema: SuggestScheduleInputSchema},
  output: {schema: SuggestScheduleOutputSchema},
  prompt: `You are an AI workforce optimization expert. Your task is to generate an optimal employee schedule based on a wide range of inputs.

**Your Goal:** Create a schedule that is efficient, cost-effective, compliant, and fair to employees.

**You must consider and balance ALL of the following factors:**

1.  **Employee Data (Primary Input):**
    *   **Crucially, you must adhere to any age restrictions** mentioned in the schedule requirements. For example, if a role requires an employee to be 21 or older, do not assign anyone younger to that role.
    *   Consider employee availability, preferences, time-off, and skill levels.
    *   **Employee Data JSON:** \`{{{employeeData}}}\`

2.  **Demand & Coverage (Operational Needs):**
    *   Use demand forecasting to ensure peak periods are well-staffed.
    *   Ensure all shifts and critical tasks have adequate coverage.
    *   **Demand Forecast JSON:** \`{{{demandForecast}}}\`
    *   **Coverage Needs JSON:** \`{{{coverageNeeds}}}\`

3.  **Cost Optimization (Financial Constraints):**
    *   Minimize labor costs by considering individual wage rates.
    *   Manage and minimize overtime hours to avoid premium pay.
    *   Factor in any skill-based pay differentials.

4.  **Company Policies & Fairness (Rules & Employee Well-being):**
    *   Adhere strictly to all company policies provided. This includes rules on max hours, rest periods, and more.
    *   Distribute workload as evenly as possible to prevent burnout.
    *   Honor approved time-off requests and employee shift preferences where possible.
    *   **Company Policies Text:** \`{{{companyPolicies}}}\`

5.  **Conflict Resolution (Critical Check):**
    *   **You must identify and resolve all scheduling conflicts.** An employee cannot be scheduled for two different shifts at the same time (double booking).

6.  **Specific Requirements (Fine-Tuning):**
    *   Incorporate any other specific instructions, goals, or constraints.
    *   **Specific Requirements Text:** \`{{{scheduleRequirements}}}\`

**Output Requirements:**

*   **Suggested Schedule:** Generate a clear schedule in JSON format.
*   **Reasoning:** Provide a detailed explanation of your reasoning. Describe how you balanced the competing factors of cost, coverage, compliance, and employee preferences. Specifically mention if you resolved any potential conflicts.
*   **Analytics:** Calculate and provide the following performance metrics for your suggested schedule:
    *   \`totalLaborCost\`: The estimated total labor cost for the period.
    *   \`totalOvertimeHours\`: The total number of overtime hours scheduled.
    *   \`scheduleAdherenceScore\`: An estimated score (0.0 to 1.0) of how well the schedule adheres to employee preferences and availability.

Return the full response in the required JSON format.
`,
});

const suggestScheduleFlow = ai.defineFlow(
  {
    name: 'suggestScheduleFlow',
    inputSchema: SuggestScheduleInputSchema,
    outputSchema: SuggestScheduleOutputSchema,
  },
  async input => {
    // In a real app, you might add pre-processing logic here.
    // For example, validating JSON strings before passing to the AI.
    const {output} = await prompt(input);
    return output!;
  }
);
