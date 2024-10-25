"use client";

import { useState, useRef, KeyboardEvent, useEffect, useCallback } from "react";
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

  function extractTextFromContent(content: any[]): string {
    return content.map(block => {
      if (block.type === 'paragraph' || block.type === 'heading') {
        return block.content.map((item: any) => item.text).join(' ');
      }
      return '';
    }).filter(text => text.length > 0).join('\n');
  }
  
  const generateDocumentString = useCallback((siblingDocuments) => {
    if (!siblingDocuments) return '';
    
    return siblingDocuments.map((doc, i) => {
      // if doc id is the same as the current document, skip
      if (doc.id === documentId) return '';
      const docContent = JSON.parse(doc.content);
      const contentText = extractTextFromContent(docContent);
      return `Example ${i + 1}:\nDocument Context:\n${doc.llmContext || ''}\nDocument Content:\n${contentText}\n\n`;
    }).join('');
  }, []);

  const siblingDocuments = useQuery(api.documents.getDocumentsByParent, { documentId });

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
        const siblingString = generateDocumentString(siblingDocuments);
        const newContext = `${currentContext}\n\n${input}\n\n${siblingString}`;
        console.log("string: ", siblingString)
        console.log(siblingDocuments);
        handleContinueWriting(editor, textWindowBlock, input, newContext, parentContext, siblingString);
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
