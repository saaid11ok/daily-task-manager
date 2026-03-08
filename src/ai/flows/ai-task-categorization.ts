'use server';
/**
 * @fileOverview An AI agent for categorizing tasks based on their description.
 *
 * - aiTaskCategorization - A function that handles the task categorization process.
 * - AITaskCategorizationInput - The input type for the aiTaskCategorization function.
 * - AITaskCategorizationOutput - The return type for the aiTaskCategorization function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AITaskCategorizationInputSchema = z.object({
  taskDescription: z
    .string()
    .describe('The description of the task to be categorized.'),
});
export type AITaskCategorizationInput = z.infer<
  typeof AITaskCategorizationInputSchema
>;

const AITaskCategorizationOutputSchema = z.object({
  categories: z
    .array(z.string())
    .describe('A list of suggested categories for the task.'),
});
export type AITaskCategorizationOutput = z.infer<
  typeof AITaskCategorizationOutputSchema
>;

export async function aiTaskCategorization(
  input: AITaskCategorizationInput
): Promise<AITaskCategorizationOutput> {
  return aiTaskCategorizationFlow(input);
}

const categorizeTaskPrompt = ai.definePrompt({
  name: 'categorizeTaskPrompt',
  input: {schema: AITaskCategorizationInputSchema},
  output: {schema: AITaskCategorizationOutputSchema},
  prompt: `You are an AI assistant specialized in categorizing tasks.
Based on the following task description, suggest 1 to 3 relevant categories.
Output your suggestions as a JSON object with a single key 'categories' which is an array of strings.

Task description: {{{taskDescription}}}`,
});

const aiTaskCategorizationFlow = ai.defineFlow(
  {
    name: 'aiTaskCategorizationFlow',
    inputSchema: AITaskCategorizationInputSchema,
    outputSchema: AITaskCategorizationOutputSchema,
  },
  async (input) => {
    const {output} = await categorizeTaskPrompt(input);
    return output!;
  }
);
