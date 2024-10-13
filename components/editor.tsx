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
import { handleUpload, handleContinueWriting } from "./editorHandlers";
import { getCustomSlashMenuItems } from "./editorMenuItems";
import { Input } from "@/components/ui/input";

interface EditorProps {
  onChange: (value: string) => void;
  initialContent?: string;
  editable?: boolean;
}

const Editor = ({ onChange, initialContent, editable }: EditorProps) => {
  const { resolvedTheme } = useTheme();
  const { edgestore } = useEdgeStore();
  const [context, setContext] = useState("");

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

  // Add a new ref for the input element
  const inputRef = useRef<HTMLInputElement>(null);

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
    } else if (e.key === "Enter") {
      handleContinueWritingWrapper();
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        textWindowRef.current &&
        !textWindowRef.current.contains(event.target as Node)
      ) {
        setShowTextWindow(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [textWindowRef]);

  // Focus on the input when the text window is shown
  useEffect(() => {
    if (showTextWindow && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showTextWindow]);

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

      {/* Conditionally render the text window with a textarea */}
      {showTextWindow && textWindowBlock && (
        <div
          ref={textWindowRef}
          className="absolute z-[1000] p-4 bg-white dark:bg-[#1F1F1F] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg w-80 sm:w-96 md:w-112 lg:w-128"
          style={{
            top: textWindowPosition.top,
            left: textWindowPosition.left,
          }}
        >
          <Input
            ref={inputRef}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Give instructions to the AI how to continue..."
            className="w-full text-sm border-none focus:ring-0 outline-none"
            onKeyDown={handleKeyDown}
          />
        </div>
      )}
    </div>
  );
};

export default Editor;
