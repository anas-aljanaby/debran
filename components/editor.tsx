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
  FormattingToolbar,
  SuggestionMenuController,
  useCreateBlockNote,
  useComponentsContext
} from "@blocknote/react";

import { setDynamicPosition } from "./editor-utils";
import { handleUpload, handleContinueWriting } from "./editorHandlers";
import { getCustomSlashMenuItems } from "./editorMenuItems";
import PromptWindow from "./promptWindow";
import { CustomToolbar } from "./custom-toolbar";
import { PromptButton } from "./prompt-button";
import { Button } from "./ui/button";
import {
  BasicTextStyleButton,
  BlockTypeSelect,
  ColorStyleButton,
  CreateLinkButton,
  FileCaptionButton,
  FileReplaceButton,
  NestBlockButton,
  TextAlignButton,
  UnnestBlockButton,
} from "@blocknote/react";

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
  // State and ref for the text window
  const [showTextWindow, setShowTextWindow] = useState(false);
  const [textWindowBlock, setTextWindowBlock] = useState<PartialBlock | null>(
    null
  );
  const textWindowRef = useRef<HTMLDivElement>(null);
  const [userInput, setUserInput] = useState(""); // State to capture the user's input in the text area

  // Position state for the text window
  const [textWindowPosition, setTextWindowPosition] = useState<{
    top: number;
    left: number;
  }>({
    top: 0,
    left: 0,
  });

  // State for highlight prompt window
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

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setShowTextWindow(false);
      setShowHighlightWindow(false); // Close the highlight window on escape
    } else if (e.key === "Enter") {
      handleContinueWritingWrapper();
      setShowTextWindow(false);
      setShowHighlightWindow(false); // Close the highlight window on enter
    }
  };

  const handleEditorChange = () => {
    onChange(JSON.stringify(editor.document, null, 2));
  };

  const handleContinueWritingWrapper = async () => {
    if (textWindowBlock) {
      await handleContinueWriting(editor, textWindowBlock, userInput, context);
      setShowTextWindow(false);
      setUserInput("");
    }
  };

  const handleSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim() !== "") {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      console.log(selection.toString());

      setSavedSelection(range);
      // Set the position of the highlight window
      setHighlightPosition({
        top: rect.top + window.scrollY + rect.height + 30, // Position below the selected text
        left: rect.left + window.scrollX,
      });
      setShowHighlightWindow(true);
    } else {
      setShowHighlightWindow(false);
    }
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

  return (
    <div>
      <BlockNoteView
        editable={editable}
        editor={editor}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        onChange={handleEditorChange}
        slashMenu={false}
        formattingToolbar={false}
      >
          <FormattingToolbarController
        formattingToolbar={() => (
          <FormattingToolbar>
            <BlockTypeSelect key={"blockTypeSelect"} />
 
            {/* Extra button to toggle blue text & background */}
            <PromptButton
              label="Blue"
              tooltip="Apply Blue Color"
              onClick={handleSelection}
            />
 
            <FileCaptionButton key={"fileCaptionButton"} />
            <FileReplaceButton key={"replaceFileButton"} />
 
            <BasicTextStyleButton
              basicTextStyle={"bold"}
              key={"boldStyleButton"}
            />
            <BasicTextStyleButton
              basicTextStyle={"italic"}
              key={"italicStyleButton"}
            />
            <BasicTextStyleButton
              basicTextStyle={"underline"}
              key={"underlineStyleButton"}
            />
            <BasicTextStyleButton
              basicTextStyle={"strike"}
              key={"strikeStyleButton"}
            />
            {/* Extra button to toggle code styles */}
            <BasicTextStyleButton
              key={"codeStyleButton"}
              basicTextStyle={"code"}
            />
 
            <TextAlignButton
              textAlignment={"left"}
              key={"textAlignLeftButton"}
            />
            <TextAlignButton
              textAlignment={"center"}
              key={"textAlignCenterButton"}
            />
            <TextAlignButton
              textAlignment={"right"}
              key={"textAlignRightButton"}
            />
 
            <ColorStyleButton key={"colorStyleButton"} />
 
            <NestBlockButton key={"nestBlockButton"} />
            <UnnestBlockButton key={"unnestBlockButton"} />
 
            <CreateLinkButton key={"createLinkButton"} />
          </FormattingToolbar>
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