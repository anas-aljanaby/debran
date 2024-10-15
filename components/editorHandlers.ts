import { BlockNoteEditor, InlineContent, PartialBlock } from "@blocknote/core";
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

export async function handleContinueWriting(
    editor: BlockNoteEditor,
    currentBlock: PartialBlock,
    userInput: string,
    context: string
  ) {
    if (!currentBlock) return;
  
    const extractedText = extractTextFromBlock(currentBlock);
    const combinedText = `${extractedText} ${userInput}`;
  
    try {
      const response = await fetch('/api/llm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: combinedText, context }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to get completion');
      }
  
      const data = await response.json();
      const completion = data.completion;
  
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
      console.error('Error getting completion:', error);
    }
  }

export const handleEditorChange = (
  editor: BlockNoteEditor,
  onChange: (value: string) => void
) => {
  onChange(JSON.stringify(editor.document, null, 2));
};

export const handleKeyDown = (
  e: React.KeyboardEvent<HTMLInputElement>,
  setShowTextWindow: (show: boolean) => void,
  handleContinueWritingWrapper: () => Promise<void>
) => {
  if (e.key === "Escape") {
    setShowTextWindow(false);
  } else if (e.key === "Enter") {
    handleContinueWritingWrapper();
    setShowTextWindow(false);
  }
};