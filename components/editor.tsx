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
} from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import {
  FormattingToolbarController,
  SuggestionMenuController,
  useCreateBlockNote,
  useComponentsContext,
} from "@blocknote/react";

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

interface EditorProps {
  onChange: (value: string) => void;
  initialContent?: string;
  editable?: boolean;
}

const Editor = ({ onChange, initialContent, editable }: EditorProps) => {
  const { resolvedTheme } = useTheme();
  const { edgestore } = useEdgeStore();
  const [context, setContext] = useState("");
  const components = useComponentsContext()!;
  const [showTextWindow, setShowTextWindow] = useState(false);
  const [textWindowBlock, setTextWindowBlock] = useState<PartialBlock | null>(
    null
  );
  const textWindowRef = useRef<HTMLDivElement>(null);
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

  const [savedSelection, setSavedSelection] = useState<Range | null>(null); // To save the selection

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
  
  const handleSelectionWrapper = () => {
    handleSelection(setSavedSelection, setHighlightPosition, setShowHighlightWindow);
  };

  useEffect(() => {
    if (showHighlightWindow && savedSelection) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedSelection); // Restore saved selection
      }
    }
  }, [showHighlightWindow, savedSelection]);

  const handleKeyDown = createHandleKeyDown(
    () => handleContinueWritingWrapper(editor, textWindowBlock, userInput, context, setShowTextWindow, setUserInput),
    setShowTextWindow,
    setShowHighlightWindow
  );

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
            <CustomToolbar handleSelection={handleSelectionWrapper} />
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