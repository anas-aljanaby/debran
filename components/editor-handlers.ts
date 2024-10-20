import { BlockIdentifier, BlockNoteEditor, InlineContent, PartialBlock } from "@blocknote/core";
import { EdgeStore } from "@/lib/edgestore";
import { extractTextFromBlock } from './editor-utils';
import { KeyboardEvent } from "react";

export const handleUpload = async (edgestore: EdgeStore) => {
  return async (file: File) => {
    const res = await edgestore.publicFiles.upload({
      file,
    });
    return res.url;
  };
};

async function getCompletion(text: string, context: string): Promise<string> {
  try {
    const response = await fetch('/api/llm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, context }),
    });

    if (!response.ok) {
      throw new Error('Failed to get completion');
    }

    const data = await response.json();
    return data.completion;
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
  context: string,
  showHighlightWindow: boolean
) => {
  if (showHighlightWindow && selectedBlockId && selectedText) {
    const selectedBlock = editor.getBlock(selectedBlockId);
    console.log("selected block", selectedBlock);
    if (selectedBlock) {
      const combinedText = `Finish the following text, by applying the instructions.
If there are no instructions just continue based on the text.
Instructions: 
${userInput}
Text:
${selectedText}`;

      console.log("combined text", combinedText);
      try {
        const completion = await getCompletion(combinedText, context);

        const updatedContent = selectedBlock.content.map(item => {
          if (typeof item === 'string') {
            return item.replace(selectedText, completion);
          }
          if (item.styles && item.styles.backgroundColor === 'blue') {
            return {
              ...item,
              text: item.text.replace(selectedText, completion),
              styles: { ...item.styles, backgroundColor: 'default' }
            };
          }
          return item;
        });

        editor.updateBlock(selectedBlock, { content: updatedContent });
      } catch (error) {
        // Error handling is done in getCompletion function
      }
    }
  }
};

export async function handleContinueWriting(
  editor: BlockNoteEditor,
  currentBlock: PartialBlock,
  userInput: string,
  context: string
) {
  if (!currentBlock) return;

  const extractedText = extractTextFromBlock(currentBlock);
  const combinedText = `Finish the following text, by applying the insturctions.
If there are no instructions just continue based on the text.
Instructions: 
${userInput}
Text:
${extractedText}`;

  console.log('combinedText:', combinedText);
  try {
    const completion = await getCompletion(combinedText, context);

    const aiSuggestion: InlineContent<any, any> = {
      type: "text",
      text: completion,
      styles: {
        textColor: "#[1F1F1F]",
      },
    };

    const currentContent = currentBlock.content as InlineContent<any, any>[];
    const updatedContent = [...currentContent, aiSuggestion];

    editor.updateBlock(currentBlock, {
      content: updatedContent,
    });

    editor.setTextCursorPosition(currentBlock, "end");
  } catch (error) {
    // Error handling is done in getCompletion function
  }
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
