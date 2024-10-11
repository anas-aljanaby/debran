"use client";
import { useState } from 'react';
import { BlockNoteView } from "@blocknote/mantine";
import { useTheme } from "next-themes";
import { useEdgeStore } from "@/lib/edgestore";
import "@blocknote/core/style.css";
import "@blocknote/mantine/style.css";
import { HiOutlineGlobeAlt } from "react-icons/hi";
import {
  BlockNoteEditor,
  filterSuggestionItems,
  InlineContent,
  PartialBlock,
} from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import {
  DefaultReactSuggestionItem,
  getDefaultReactSlashMenuItems,
  SuggestionMenuController,
  useCreateBlockNote,
} from "@blocknote/react";

function extractTextFromBlock(block: PartialBlock): string {
  let extractedText = '';
  if (block && block.content && Array.isArray(block.content)) {
    block.content.forEach(item => {
      if (item.text) {
        extractedText += item.text + ' ';
      }
    });
  }
  return extractedText.trim();
}


const finishParagraphItem = (editor: BlockNoteEditor, context: string) => ({
  title: "Finish Paragraph",
  onItemClick: async () => {
    const currentBlock = editor.getTextCursorPosition().block;
    console.log("Current block:", currentBlock);
    
    const text = extractTextFromBlock(currentBlock);
    
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
      const completion = data.completion;

      // Create a new inline content item for the AI-generated text
      const aiSuggestion: InlineContent<any, any> = {
        type: "text",
        text: completion,
        styles: {
          textColor: "gray",
        },
      };

      // Get the current content of the block
      const currentContent = currentBlock.content as InlineContent<any, any>[];

      // Append the AI suggestion to the current content
      const updatedContent = [...currentContent, aiSuggestion];

      // Update the block with the new content
      editor.updateBlock(currentBlock, {
        content: updatedContent,
      });

      editor.setTextCursorPosition(currentBlock, "end");
    } catch (error) {
      console.error('Error getting completion:', error);
      // Handle error (e.g., show a notification to the user)
    }
  },
  aliases: ["finish"],
  group: "AI",
  icon: <HiOutlineGlobeAlt size={18} />,
  subtext: "Complete the paragraph using AI",
});


const getCustomSlashMenuItems = (
  editor: BlockNoteEditor,
  context: string
): DefaultReactSuggestionItem[] => [
  ...getDefaultReactSlashMenuItems(editor),
  finishParagraphItem(editor, context),
];

interface EditorProps {
  onChange: (value: string) => void;
  initialContent?: string;
  editable?: boolean;
}

const Editor = ({ onChange, initialContent, editable }: EditorProps) => {
  const { resolvedTheme } = useTheme();
  const { edgestore } = useEdgeStore();
  const [context, setContext] = useState('');

  const handleUpload = async (file: File) => {
    const res = await edgestore.publicFiles.upload({
      file,
    });
    return res.url;
  };

  const editor: BlockNoteEditor = useCreateBlockNote({
    initialContent: initialContent
      ? (JSON.parse(initialContent) as PartialBlock[])
      : undefined,
    uploadFile: handleUpload,
  });

  const handleEditorChange = () => {
    onChange(JSON.stringify(editor.document, null, 2));
  };

  return (
    <div>
      <BlockNoteView
        editable={editable}
        editor={editor}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        onChange={handleEditorChange}
        slashMenu={false}
      >
        <SuggestionMenuController
          triggerCharacter={"/"}
          getItems={async (query) =>
            filterSuggestionItems(getCustomSlashMenuItems(editor, context), query)
          }
        />
      </BlockNoteView>
    </div>
  );
};

export default Editor;