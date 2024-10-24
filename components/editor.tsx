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
  handleHighlightedText,
  handleContinueWriting,
  handleEditorChange,
 } from "./editor-handlers";
import { getCustomSlashMenuItems } from "./editor-menu-items";
import PromptWindow from "./prompt-window";
import CustomToolbar from "./custom-toolbar";
import { usePromptWindow } from "@/hooks/use-prompt-window";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface EditorProps {
  onChange: (value: string) => void;
  initialContent?: string;
  editable?: boolean;
  documentId: Id<"documents">;
}

const Editor = ({ onChange, initialContent, editable, documentId }: EditorProps) => {
  const { resolvedTheme } = useTheme();
  const { edgestore } = useEdgeStore();
  const [context, setContext] = useState("");
  const [showTextWindow, setShowTextWindow] = useState(false);
  const [textWindowBlock, setTextWindowBlock] = useState<PartialBlock | null>(
    null
  );

  // TODO: function to set the context; which will be all the text
  // from the parent documents of current document
  
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
        handleContinueWriting(editor, textWindowBlock, input, currentContext, parentContext);
      }
    },
    onHighlightSubmit: (input) => {
      handleHighlightedText(editor, selectedBlockId, selectedText, input);
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

  const fetchCurrentDocument = useQuery(api.documents.getById, { documentId });
  const currentContext = fetchCurrentDocument?.llmContext|| ""; // Assuming context is a field in the document

  const parentDocumentId = fetchCurrentDocument?.parentDocument;
  const parentContext = parentDocumentId
    ? useQuery(api.documents.getDocumentContext, { documentId: parentDocumentId })
    : null;

  useEffect(() => {
    if (parentContext) {
      setContext(parentContext);
    }
  }, [parentContext]);

  return (
    <div>
      {/* <h1>{parentContext}</h1> */}
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
