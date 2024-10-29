// app/api/llm/route.ts
import { NextResponse } from 'next/server';
import { OpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';

export async function POST(req: Request) {
  const { context, parentContext, siblingDocuments, userInput, extractedText } = await req.json();

  const model = new OpenAI({
    // modelName: 'gpt-4o',
    modelName: "gpt-3.5-turbo",
    temperature: 0.7,
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  // Define the template with placeholders for each section
  const template = `
    **Note Continuation Request**

    You are assisting in writing a note based on layered context, examples, and specific instructions. 
    Do not acknowledge this request with any conversational response. Generate only the text continuation 
    without any phrases like "Certainly" or "Here is your continuation." If information such as names or 
    specific closing phrases is present in the examples or context, include them as appropriate to make the 
    response as natural and complete as possible.

    ### Context Details
    1. **Current Note Context**: "{context}"  
       *(This context describes what this specific note is focused on. Please align the continuation with this focus.)*
       
    2. **Parent Note Context**: "{parentContext}"  
       *(This note is nested under a parent note that serves as a broader context. Use this if it helps clarify 
       the purpose of the current note or provides additional direction.)*
        
    3. **Sibling Note Examples**:  
       {siblingDocuments}
       
       *(These sibling notes provide similar examples of content created in response to contexts, which you can 
       use for style, tone, and any closing details like the user’s name.)*

    ### User Instructions
    "{userInput}"  
    *(The user has provided specific instructions for this continuation. Follow these instructions closely, 
    as they pertain to the immediate task.)*

    ### Current Note Content
    "{extractedText}"  
    *(This is the content currently written in the note up to this point. Continue from here, taking into account 
    the context, user instructions, and any relevant examples. Use personal information like names or specific 
    phrases found in the examples or context for a natural continuation.)*
  `;

  const prompt = new PromptTemplate({
    template,
    inputVariables: ['context', 'parentContext', 'siblingDocuments', 'userInput', 'extractedText'],
  });

  const formattedPrompt = await prompt.format({
    context,
    parentContext,
    siblingDocuments,
    userInput,
    extractedText,
  });
  
  console.log('\n=== Formatted Prompt Sent to Model ===\n');
  console.log(formattedPrompt);
  console.log('\n====================================\n');

  const response = await model.call(formattedPrompt);

  return NextResponse.json({
     completion: response,
     debug : {
        formattedPrompt
      }
    });
}
