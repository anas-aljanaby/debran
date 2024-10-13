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
import TextareaAutosize from "react-textarea-autosize";

import { useEffect, useRef } from 'react';

import { extractTextFromBlock, setDynamicPosition } from './editor-utils';

interface EditorProps {
  onChange: (value: string) => void;
  initialContent?: string;
  editable?: boolean;
}

const Editor = ({ onChange, initialContent, editable }: EditorProps) => {
  const { resolvedTheme } = useTheme();
  const { edgestore } = useEdgeStore();
  const [context, setContext] = useState('');

  // State and ref for the text window
  const [showTextWindow, setShowTextWindow] = useState(false);
  const [textWindowBlock, setTextWindowBlock] = useState<PartialBlock | null>(null);
  const textWindowRef = useRef<HTMLDivElement>(null);
  const [userInput, setUserInput] = useState(''); // State to capture the user's input in the text area

  // Position state for the text window
  const [textWindowPosition, setTextWindowPosition] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  // Effect to handle clicks outside of the text window
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (textWindowRef.current && !textWindowRef.current.contains(event.target as Node)) {
        handleFinishParagraph();  // Call the function to finish paragraph
        setShowTextWindow(false); // Close the text window
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [textWindowRef, userInput]);

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

  // Define the combined finish paragraph and text window item
  const finishParagraphWithTextWindowItem = (editor: BlockNoteEditor) => ({
    title: "Finish Paragraph with Text",
    onItemClick: () => {
      const currentBlock = editor.getTextCursorPosition().block;
      console.log(editor.getTextCursorPosition());
      setTextWindowBlock(currentBlock);  // Set the block where the window should appear
      setDynamicPosition(currentBlock, setTextWindowPosition);
      setShowTextWindow(true);           // Show the text window
    },
    aliases: ["finish"],
    group: "AI",
    icon: <HiOutlineGlobeAlt size={18} />,
    subtext: "Complete the paragraph using AI after adding text",
  });

  // Define function to handle finishing paragraph after user input
  const handleFinishParagraph = async () => {
    const currentBlock = textWindowBlock;

    if (!currentBlock) return;

    const userEnteredText = userInput; // Text from the input area
    const extractedText = extractTextFromBlock(currentBlock);

    const combinedText = `${extractedText} ${userEnteredText}`;

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
          textColor: "gray",
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
  };

  const getCustomSlashMenuItems = (
    editor: BlockNoteEditor,
    context: string
  ): DefaultReactSuggestionItem[] => [
    ...getDefaultReactSlashMenuItems(editor),
    finishParagraphWithTextWindowItem(editor), // Add the combined item
  ];

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

      {/* Conditionally render the text window with a textarea */}
      {showTextWindow && textWindowBlock && (
        <div
          ref={textWindowRef}
          style={{
            position: "absolute",
            top: textWindowPosition.top,  // Dynamic top position based on block
            left: textWindowPosition.left, // Dynamic left position based on block
            padding: "10px",
            border: "1px solid gray",
            backgroundColor: "white",
            zIndex: 1000,  // Ensure it's above other elements
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px", // Add some rounded corners
          }}
        >
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Add more text..."
            rows={4}
            style={{
              width: "300px",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "14px",
              fontFamily: "inherit",
              resize: "none",  // Prevent resizing
            }}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleFinishParagraph(); // Finish paragraph on pressing enter
                setShowTextWindow(false); // Hide the text window
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Editor;