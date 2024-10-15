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
import { SuggestionMenuController, useCreateBlockNote } from "@blocknote/react";
import { setDynamicPosition } from "./editor-utils";
import {
  handleUpload,
  handleContinueWriting,
  handleEditorChange,
  handleKeyDown,
} from "./editorHandlers";
import { getCustomSlashMenuItems } from "./editorMenuItems";
import PromptWindow from './promptWindow';

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
  const textWindowRef = useRef<HTMLDivElement>(null);
  const [userInput, setUserInput] = useState(""); // State to capture the user's input in the text area
  const [textWindowPosition, setTextWindowPosition] = useState<{
    top: number;
    left: number;
  }>({
    top: 0,
    left: 0,
  });

  const editor: BlockNoteEditor = useCreateBlockNote({
    initialContent: initialContent
      ? (JSON.parse(initialContent) as PartialBlock[])
      : undefined,
    uploadFile: async (file) => {
      const uploader = await handleUpload(edgestore);
      return uploader(file);
    },
  });

  const handleContinueWritingWrapper = async () => {
    if (textWindowBlock) {
      await handleContinueWriting(editor, textWindowBlock, userInput, context);
      setShowTextWindow(false);
      setUserInput("");
    }
  };

  return (
    <div>
      <BlockNoteView
        editable={editable}
        editor={editor}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        onChange={() => handleEditorChange(editor, onChange)}
        slashMenu={false}
      >
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

      <PromptWindow
        showWindow={showTextWindow}
        position={textWindowPosition}
        userInput={userInput}
        setUserInput={setUserInput}
        onKeyDown={(e) => handleKeyDown(e, setShowTextWindow, handleContinueWritingWrapper)}
        onClickOutside={() => setShowTextWindow(false)}
      />
    </div>
  );
};

export default Editor;
