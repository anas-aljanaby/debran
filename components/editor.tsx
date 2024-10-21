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
} from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import {
  FormattingToolbarController,
  SuggestionMenuController,
  useCreateBlockNote,
} from "@blocknote/react";
import { resetHighlightedText, setDynamicPosition } from "./editor-utils";
import {
  handleUpload, 
  handleContinueWritingWrapper,
  handleHighlightedText,
  handleContinueWriting,
  handleEditorChange,
 } from "./editor-handlers";
import { getCustomSlashMenuItems } from "./editor-menu-items";
import PromptWindow from "./prompt-window";
import CustomToolbar from "./custom-toolbar";
import { usePromptWindow } from "@/hooks/use-prompt-window";

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
  const [selectedText, setSelectedText] = useState("");

  const editor: BlockNoteEditor = useCreateBlockNote({
    initialContent: initialContent
      ? (JSON.parse(initialContent) as PartialBlock[])
      : undefined,
    uploadFile: async (file) => {
      const uploader = await handleUpload(edgestore);
      return uploader(file);
    },
  });

  const {
    showPromptWindow,
    promptWindowPosition,
    promptWindowType,
    userInput,
    setUserInput,
    openPromptWindow,
    closePromptWindow,
    handlePromptSubmit,
  } = usePromptWindow({
    onSlashMenuSubmit: (input) => {
      if (textWindowBlock) {
        handleContinueWriting(editor, textWindowBlock, input, context);
      }
    },
    onHighlightSubmit: (input) => {
      handleHighlightedText(editor, selectedBlockId, selectedText, input, context, true);
      setSelectedBlockId(null);
      setSelectedText("");
    },
    onHighlightCancel: () => {
      resetHighlightedText(editor, selectedBlockId);
      setSelectedBlockId(null);
      setSelectedText("");
    },
  });

  const handleEditorChangeWrapper = () => {
    handleEditorChange(editor, onChange);
  };

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
              editor={editor}
              openHighlightPrompt={(position) => openPromptWindow('highlight', position)}
              setSelectedBlockId={setSelectedBlockId}
              setSelectedText={setSelectedText}
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
                openPromptWindow,
                setDynamicPosition
              ),
              query
            )
          }
        />
      </BlockNoteView>

      <PromptWindow
        config={{
          showWindow: showPromptWindow,
          position: promptWindowPosition,
          type: promptWindowType,
          userInput,
          setUserInput,
          onCancel: closePromptWindow,
          onSubmit: handlePromptSubmit,
        }}
      />
    </div>
  );
};

export default Editor;