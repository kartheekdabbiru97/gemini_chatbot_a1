import { google } from "@ai-sdk/google";
import { convertToModelMessages, streamObject, UIMessage } from "ai";
import * as z from "zod";
import * as readline from "readline";
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const messages = await new Promise<Omit<UIMessage, "id">[]>((resolve) => {
  rl.question("Enter your Profile Introduction: ", (answer) => {
    rl.close();
    resolve([{ role: "user", parts: [{ type: "text", text: answer }] }]);
  });
});

const result = streamObject({
  model: google("gemini-2.5-flash-lite"),
  temperature: 0.3,
  system: `You are a Resume Extraction Agent.

Your task is to carefully read a user’s profile, bio, or introduction and extract all relevant resume information into a structured JSON object following the exact schema provided below.

Focus on identifying details related to the person’s education, work experience, skills, and projects.
If any field is not mentioned or cannot be inferred, leave it empty ("" or [] as applicable).

Ensure:
	•	The output strictly conforms to the schema structure and field names.
	•	Each list field (education, experience, projects, skills) is returned as an array.
	•	Text values are cleaned and concise, without extra commentary or formatting.
	•	Do not invent or assume details beyond what is explicitly mentioned.

`,

  schema: z.object({
    
    name: z.string().optional(),
    email: z.string().optional(),
    location: z.string().optional(),

    education: z.array(z.object({
      institution: z.string(),
      degree: z.string(),
      field_of_study: z.string(),
      graduation_year: z.string(),
    })),

    experience: z.array(z.object({
      company: z.string(),
      job_title: z.string(),
      duration: z.string(),
      responsibilities: z.array(z.string()),
    })),

    skills: z.array(z.string()),

    projects: z.array(z.object({
      project_name: z.string(),
      description: z.string(),
      year: z.string(),
    })),
    
  }),

  messages: convertToModelMessages(messages),
});

// Define the desired field order
const fieldOrder = ['name', 'email', 'location', 'education', 'experience', 'skills', 'projects'];

// Helper function to reorder object properties according to schema order
function reorderFields(obj: any, order: string[]): any {
  const reordered: any = {};
  // First, add fields in the desired order
  for (const key of order) {
    if (key in obj) {
      reordered[key] = obj[key];
    }
  }
  // Then add any remaining fields that weren't in the order array
  for (const key in obj) {
    if (!order.includes(key)) {
      reordered[key] = obj[key];
    }
  }
  return reordered;
}

for await (const partialObject of result.partialObjectStream) {
  console.clear();
  const reordered = reorderFields(partialObject, fieldOrder);
  console.log(JSON.stringify(reordered, null, 2));
}