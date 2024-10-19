"use client";

import { useState, useRef, KeyboardEvent, useEffect } from "react";
import { BlockNoteView } from "@blocknote/mantine";
import { useTheme } from "next-themes";
import { useEdgeStore } from "@/lib/edgestore";
import "@blocknote/core/style.css";
import "@blocknote/mantine/style.css";
import {
  BlockNoteEditor,
  filterSuggestionItems,
  PartialBlock,
  BlockIdentifier,
  DefaultBlockSchema,
} from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import {
  FormattingToolbarController,
  SuggestionMenuController,
  useCreateBlockNote,
  useComponentsContext,
} from "@blocknote/react";
import { PromptButton } from "./prompt-button";

import { setDynamicPosition } from "./editor-utils";
import {
  handleUpload, 
  createHandleKeyDown, 
  handleContinueWritingWrapper,
  handleEditorChange,
  handleSelection
 } from "./editor-handlers";
import { getCustomSlashMenuItems } from "./editor-menu-items";
import PromptWindow from "./promptWindow";
import CustomToolbar from "./custom-toolbar";
import { Button } from "./ui/button";
import { extractTextFromBlock } from "./editor-utils"; // Make sure this import exists

interface EditorProps {
  onChange: (value: string) => void;
  initialContent?: string;
  editable?: boolean;
}

const Editor = ({ onChange, initialContent, editable }: EditorProps) => {
  const { resolvedTheme } = useTheme();
  const { edgestore } = useEdgeStore();
  const [context, setContext] = useState("");
  const [showTextWindow, setShowTextWindow] = useState(false);
  const [textWindowBlock, setTextWindowBlock] = useState<PartialBlock | null>(
    null
  );
  const [userInput, setUserInput] = useState(""); // State to capture the user's input in the text area

  const [textWindowPosition, setTextWindowPosition] = useState<{
    top: number;
    left: number;
  }>({
    top: 0,
    left: 0,
  });

  const [showHighlightWindow, setShowHighlightWindow] = useState(false);
  const [highlightPosition, setHighlightPosition] = useState<{
    top: number;
    left: number;
  }>({
    top: 0,
    left: 0,
  });

  const [selectedBlockId, setSelectedBlockId] = useState<BlockIdentifier | null>(null);

  const editor: BlockNoteEditor = useCreateBlockNote({
    initialContent: initialContent
      ? (JSON.parse(initialContent) as PartialBlock[])
      : undefined,
    uploadFile: async (file) => {
      const uploader = await handleUpload(edgestore);
      return uploader(file);
    },
  });

  const handleEditorChangeWrapper = () => {
    handleEditorChange(editor, onChange);
  };
  
  const handleKeyDown = createHandleKeyDown(
    () => handleContinueWritingWrapper(editor, textWindowBlock, userInput, context, setShowTextWindow, setUserInput),
    setShowTextWindow,
    setShowHighlightWindow
  );

  const handleSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim() !== "") {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setHighlightPosition({
        top: rect.top + window.scrollY + rect.height + 30,
        left: rect.left + window.scrollX,
      });

      const selectedBlock = editor.getTextCursorPosition().block;
      console.log("detected block id", selectedBlock.id);
      setSelectedBlockId(selectedBlock.id);

      editor.addStyles({ backgroundColor: "blue" });

      setShowHighlightWindow(true);
    }
  };

  useEffect(() => {
    const handleHighlightedText = async () => {
      if (!showHighlightWindow && selectedBlockId) {
        const selectedBlock = editor.getBlock(selectedBlockId);
        console.log("selected block", selectedBlock);
        if (selectedBlock) {
          const extractedText = extractTextFromBlock(selectedBlock);
          const combinedText = `Finish the following text, by applying the instructions.
If there are no instructions just continue based on the text.
Instructions: 
${userInput}
Text:
${extractedText}`;

          console.log("combined text", combinedText);
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

            const updatedContent = selectedBlock.content.map(item => {
              if (typeof item === 'string') {
                return item;
              }
              if (item.styles && item.styles.backgroundColor === 'blue') {
                return {
                  ...item,
                  text: completion,
                  styles: { ...item.styles, backgroundColor: 'default' }
                };
              }
              return item;
            });

            editor.updateBlock(selectedBlock, { content: updatedContent });
          } catch (error) {
            console.error('Error getting completion:', error);
          }
        }
        setSelectedBlockId(null);
      }
    };
    handleHighlightedText();
  }, [showHighlightWindow, selectedBlockId, editor, userInput, context]);

  return (
    <div>
      <BlockNoteView
        editable={editable}
        editor={editor}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        onChange={handleEditorChangeWrapper}
        slashMenu={false}
        formattingToolbar={false}
      >
        <FormattingToolbarController
          formattingToolbar={() => (
            <CustomToolbar
              onClick={handleSelection}
            />
          )}
        />
        <SuggestionMenuController
          triggerCharacter={"/"}
          getItems={async (query) =>
            filterSuggestionItems(
              getCustomSlashMenuItems(
                editor,
                context,
                setTextWindowBlock,
                setTextWindowPosition,
                setShowTextWindow,
                setDynamicPosition
              ),
              query
            )
          }
        />
      </BlockNoteView>

      {/* Slash Menu PromptWindow */}
      <PromptWindow
        showWindow={showTextWindow}
        position={textWindowPosition}
        userInput={userInput}
        setUserInput={setUserInput}
        onKeyDown={handleKeyDown}
        onClickOutside={() => setShowTextWindow(false)}
      />

      {/* Highlight Text PromptWindow */}
      <PromptWindow
        showWindow={showHighlightWindow}
        position={highlightPosition}
        userInput={userInput}
        setUserInput={setUserInput}
        onKeyDown={handleKeyDown}
        onClickOutside={() => setShowHighlightWindow(false)}
      />
    </div>
  );
};

export default Editor;
