// app/api/llm/route.ts
import { NextResponse } from 'next/server';
import { OpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';

export async function POST(req: Request) {
  const { text, context } = await req.json();

  const model = new OpenAI({
    modelName: 'gpt-3.5-turbo',
    temperature: 0.7,
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  const template = `
  Context: {context}
  Current text: {text}
  Task: Complete the paragraph or suggest a continuation for the given text.
  Completion:`;

  const prompt = new PromptTemplate({
    template: template,
    inputVariables: ['context', 'text'],
  });

  const formattedPrompt = await prompt.format({ context, text });
  const response = await model.call(formattedPrompt);

  return NextResponse.json({ completion: response });
}