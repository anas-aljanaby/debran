import { BlockIdentifier, BlockNoteEditor, fileBlockConfig, InlineContent, PartialBlock } from "@blocknote/core";
import { EdgeStore } from "@/lib/edgestore";
import { extractTextFromBlock } from './editor-utils';
    
export const handleUpload = async (edgestore: EdgeStore) => {
  return async (file: File) => {
    const res = await edgestore.publicFiles.upload({
      file,
    });
    return res.url;
  };
};

// Updated getCompletion function to handle streaming response
async function getCompletion(
  prompt: string,
  onData: (chunk: string) => void
): Promise<void> {
  try {
    const response = await fetch('/api/llm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok || !response.body) {
      throw new Error('Failed to get completion');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let done = false;
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunk = decoder.decode(value);
      onData(chunk);
    }
  } catch (error) {
    console.error('Error getting completion:', error);
    throw error;
  }
}
export const handleHighlightedText = async (
  editor: BlockNoteEditor,
  selectedBlockId: BlockIdentifier | null,
  selectedText: string,
  userInput: string,
) => {
  if (!selectedBlockId) return;

  // Get the full document content
  let fullContent = '';
  editor.forEachBlock((block) => {
    fullContent += block.content.map(inline => inline.text).join(' ') + '\n';
  });

  // Prepare the prompt
  const prompt = `Here is the full document content:

${fullContent}

The following text is highlighted: "${selectedText}"

${
  userInput
    ? `Apply these instructions to the highlighted text only: ${userInput}`
    : 'Provide a synonym or brief rephrase for the highlighted text only, without returning any non highlighted text.'
}

The replacement should fit naturally in place of the highlighted text, maintaining the original sentence structure and context. Do not introduce new ideas or sentences.`;

  let fullResponse = '';

  try {
    // Call getCompletion with the prompt and handle streaming
    await getCompletion(prompt, (chunk) => {
      fullResponse += chunk;

      // Update the block content as data streams in
      editor.updateBlock(selectedBlockId, {
        content: editor.getBlock(selectedBlockId)!.content.map(inline => {
          if (inline.type === 'text' && inline.text === selectedText) {
            return {
              ...inline,
              text: fullResponse,
              styles: { ...inline.styles, backgroundColor: 'default' },
            };
          }
          return inline;
        }),
      });
    });
  } catch (error) {
    console.error('Error in handleHighlightedText:', error);
  }
};

// Updated getCompletion function with new parameters
async function continueWriting(
  context: string,
  parentContext: string,
  siblingDocuments: string,
  userInput: string,
  extractedText: string,
  onData: (chunk: string) => void,
): Promise<void> {
  try {
    const response = await fetch('/api/llm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        context,
        parentContext,
        siblingDocuments,
        userInput,
        extractedText,
      }),
    });

    if (!response.ok || !response.body) {
      throw new Error('Failed to get completion');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunk = decoder.decode(value, { stream: true });
      onData(chunk);
    }
  } catch (error) {
    console.error('Error getting completion:', error);
    throw error;
  }
}

export async function handleContinueWriting(
  editor: BlockNoteEditor,
  currentBlock: PartialBlock,
  userInput: string,
  context: string,
  parentContext: string,
  siblingDocuments: string,
) {
  if (!currentBlock) return;

  const extractedText = extractTextFromBlock(currentBlock);

  let fullText = "";

  await continueWriting(
    context,
    parentContext,
    siblingDocuments,
    userInput,
    extractedText,
    (chunk) => {
      fullText += chunk;

      const aiSuggestion: InlineContent<any, any> = {
        type: "text",
        text: fullText,
        styles: {
          textColor: "#1F1F1F",
        },
      };

      console.log("fullText\n", fullText);
      const currentContent = currentBlock.content as InlineContent<any, any>[];
      const updatedContent = [...currentContent, aiSuggestion];

      editor.updateBlock(currentBlock, {
        content: updatedContent,
      });
      editor.setTextCursorPosition(currentBlock, "end");
    }
  );
}
export async function handleContinueWritingWrapper(
  editor: BlockNoteEditor,
  currentBlock: PartialBlock | null,
  userInput: string,
  context: string,
  setShowTextWindow: (value: boolean) => void,
  setUserInput: (value: string) => void
) {
  if (currentBlock) {
    await handleContinueWriting(editor, currentBlock, userInput, context);
    setShowTextWindow(false);
    setUserInput("");
  }
}

export function handleEditorChange(editor: BlockNoteEditor, onChange: (value: string) => void) {
  onChange(JSON.stringify(editor.document, null, 2));
}

export function handleSelection(
  setSavedSelection: (range: Range) => void,
  setHighlightPosition: (position: { top: number; left: number }) => void,
  setShowHighlightWindow: (value: boolean) => void
) {
  const selection = window.getSelection();
  
  if (selection && selection.toString().trim() !== "") {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    setSavedSelection(range);
    setHighlightPosition({
      top: rect.top + window.scrollY + rect.height + 30, // Position below the selected text
      left: rect.left + window.scrollX,
    });
    setShowHighlightWindow(true);
  }

}
