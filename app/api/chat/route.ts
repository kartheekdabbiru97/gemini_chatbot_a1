import { google, GoogleGenerativeAIProviderMetadata } from '@ai-sdk/google';
import { streamText, UIMessage, convertToModelMessages } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: google('gemini-2.5-flash'),
    tools: {
        google_search: google.tools.googleSearch({}),
      },
    messages: convertToModelMessages(messages),
  });


  const providerMetadata = await result.providerMetadata;

  const metadata = providerMetadata?.google as
  | GoogleGenerativeAIProviderMetadata
  | undefined;
  const groundingMetadata = metadata?.groundingMetadata;

  console.log('groundingMetadata', JSON.stringify(groundingMetadata, null, 2));

  return result.toUIMessageStreamResponse();
}