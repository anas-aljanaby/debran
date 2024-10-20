import {
  useBlockNoteEditor,
  useComponentsContext,
  useEditorContentOrSelectionChange,
} from "@blocknote/react";
import "@blocknote/mantine/style.css";
import React, { useState, useEffect } from "react";

import { PartialBlock, BlockIdentifier, DefaultBlockSchema, BlockNoteEditor } from "@blocknote/core";

interface PromptButtonProps {
  label: string;
  tooltip: string;
  editor: BlockNoteEditor;
  setShowHighlightWindow: (show: boolean) => void;
  setHighlightPosition: (position: { top: number; left: number }) => void;
  setSelectedBlockId: (id: string) => void;
  setSelectedText: (text: string) => void;
}

export function PromptButton({
  label,
  tooltip,
  editor,
  setShowHighlightWindow,
  setHighlightPosition,
  setSelectedBlockId,
  setSelectedText,
}: PromptButtonProps) {
  const Components = useComponentsContext()!;

  const onClickPromptButton = () => {
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

      // Save the selected text
      setSelectedText(editor.getSelectedText());

      editor.addStyles({ backgroundColor: "blue" });

      setShowHighlightWindow(true);
    }
  };

  return (
    <Components.FormattingToolbar.Button
      mainTooltip={tooltip}
      onClick={onClickPromptButton}
    >
      {label}
    </Components.FormattingToolbar.Button>
  );
}